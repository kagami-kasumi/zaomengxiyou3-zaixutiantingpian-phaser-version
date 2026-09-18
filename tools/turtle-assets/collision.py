"""Lossless bit fields; visual bounds never substitute for collision geometry."""
import base64
import hashlib
import io
import json
import zipfile
import numpy as np
from PIL import Image
from common import EVIDENCE, DEST, load, sha, write


def build(family, check=False):
    base = EVIDENCE/'TASK-SETTINGS-222B'
    index_path = base/'native-corpus-index.json.gz'
    index = load(index_path)
    summary = load(base/'native-corpus.json')
    assert sha(index_path) == summary['indexSha256']
    assert sha(base/'native-corpus.zip') == summary['archiveSha256']
    names = sorted(n for n in index if n.startswith(('full/fields/', 'full/tiles/', 'full/targets/')))
    planes, mapping, decoded = {}, {}, {}
    with zipfile.ZipFile(base/'native-corpus.zip') as archive:
        for name in names:
            source_hash = index[name]
            color = (255,0,0) if name.startswith('full/targets/') else (0,255,255)
            key = (source_hash,color)
            if key not in decoded:
                raw = archive.read(source_hash)
                assert hashlib.sha256(raw).hexdigest() == source_hash
                pixels = np.asarray(Image.open(io.BytesIO(raw)).convert('RGB'))
                bits = np.all(pixels == color, axis=2)
                payload = np.packbits(bits, bitorder='big').tobytes()
                ident = hashlib.sha256(str(bits.shape).encode()+payload).hexdigest()
                planes[ident] = dict(width=bits.shape[1],height=bits.shape[0],
                                    bits=base64.b64encode(payload).decode())
                decoded[key] = ident
            mapping[name.removeprefix('full/').removesuffix('.png')] = decoded[key]
        measured = json.loads(archive.read(index['full/measurement.json']))
    target = family['sharedRuntime']['targetContract']
    owner = load(EVIDENCE/'TASK-SETTINGS-222A/owner-native.json')
    package = dict(version=1, encoding='row-major big-endian packbits; zero padding',
        sourceArchiveSha256=summary['archiveSha256'], sourceIndexSha256=sha(index_path),
        fields=measured['fields'], trees=measured['trees'], planes=planes, mapping=mapping,
        petColipse=dict(owners=family['owners'],
            displayObjects=[o for o in family['visualTruth']['manifest']['displayObjects']
                if (o['sourceIdentity'].get('symbolClass') or '').startswith('ObjectBaseSprite')],
            objects=[o for o in owner['objects'] if o['symbol'].startswith('ObjectBaseSprite')]),
        profiles=[{k:p[k] for k in ('symbol','characterId','scales','sampleTicks','sourceOwner','fixture')}
                  for p in family['collisionProfiles']],
        monsterTargets=dict(symbols=target['symbols'], mappings=target['monsterMappings']),
        sampling=dict(sourcePhases=16,targetPhases=400,tileSize=128,
            sourceQuantization='trunc(round(delta*20)/5), floor-div/mod 4',
            targetQuantization='trunc(delta*20), floor-div/mod 20; origin 150'),
        approvedResidual=load(base/'residual-cases.json'), approval=load(base/'sampling-approval.json'))
    ref = write(DEST/'collision.json.gz',package,check)
    print('collision',len(mapping),'phase fields;',len(planes),'unique bitmaps',flush=True)
    return ref
