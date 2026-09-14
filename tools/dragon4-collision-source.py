"""220: one original masked trigger closure and the unchanged 218 targets."""
import hashlib
import json
import runpy
import struct
import subprocess
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOCAL = ROOT / 'local-resources/regima/task-outputs/task-settings-220'
OUT = ROOT / 'docs/tasks/evidence/TASK-SETTINGS-220'
CIDS = [535, 536, 537, 538, 539]


def prepare():
    LOCAL.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)
    helper = runpy.run_path(str(ROOT / 'tools/dragon-collision-swf-fixtures.py'))
    traversal = runpy.run_path(str(ROOT / 'tools/dragon23-collision-source.py'))
    source = ROOT / 'local-resources/regima/source/restored-swfs/assets'
    pet = helper['source_tags'](source / 'pet1.swf')
    common = helper['source_tags'](source / 'StageCommon.swf')
    chunks = [helper['tag'](69, struct.pack('<I', 8))]
    chunks += [helper['tag'](*pet[cid]) for cid in CIDS]
    chunks += [helper['tag'](*common[cid]) for cid in [53, 94, 95, 104, 105, 106, 107]]
    chunks += [helper['place'](cid, depth, dict(tx=0, ty=0), transformed=False)
               for depth, cid in enumerate([539, 105, 107, 95], 1)]
    chunks += [helper['tag'](1, b''), helper['tag'](0, b'')]
    body = helper['rectangle'](940, 590) + struct.pack('<HH', 24*256, 1) + b''.join(chunks)
    subset = LOCAL / 'source.swf'
    subset.write_bytes(b'FWS' + bytes([10]) + struct.pack('<I', 8+len(body)) + body)
    xml = LOCAL / 'source.xml'
    args = ['java', '-Xmx2g', '-jar', 'C:/Program Files (x86)/FFDec/ffdec.jar',
            '-swf2xml', str(subset), str(xml)]
    result = subprocess.run(args, capture_output=True, timeout=60)
    (LOCAL / 'xml.log').write_bytes(result.stdout + result.stderr)
    assert result.returncode == 0, 'Source subset XML failed'
    root = ET.parse(xml).getroot()
    definitions = {int(t.get('spriteId') or t.get('shapeId') or t.get('characterID')): t
                   for t in root.find('tags') if t.get('spriteId') or t.get('shapeId') or t.get('characterID')}
    sequences = traversal['timelines'](definitions, allow_clip_depth=True)
    assert len(sequences[539]) == 48
    states = [dict(symbol='PetDragonBullet4', characterId=539, frame=f,
                   displayList=traversal['expand'](539, f, sequences, definitions)) for f in range(1, 49)]
    used = {539} | {c['characterId'] for s in states for c in s['displayList']}
    used |= {int(n.get('bitmapId')) for cid in list(used) for n in definitions[cid].iter()
             if n.get('bitmapId') and int(n.get('bitmapId')) > 0}
    assert used == set(CIDS)
    digest = lambda path: hashlib.sha256(path.read_bytes()).hexdigest()
    report = dict(taskId='TASK-SETTINGS-220', status='extracted-not-promoted',
                  sourceHashes={n: digest(source/n) for n in ['pet1.swf', 'StageCommon.swf']},
                  subsetSha256=digest(subset), xmlSha256=digest(xml), command=args,
                  definitions={str(cid): traversal['tree_data'](definitions[cid]) for cid in CIDS},
                  sourceTagHashes={str(cid): hashlib.sha256(pet[cid][1]).hexdigest() for cid in CIDS}, states=states)
    (OUT / 'source-display-list.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
    print('220 source: 5 byte-preserved masked bitmap definitions, 48 frames, 3 unchanged targets.')


if __name__ == '__main__':
    prepare()
