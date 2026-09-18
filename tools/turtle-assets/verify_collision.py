"""Validate packed masks against native fields, then replay all held-out HitTest cases."""
import base64
import hashlib
import io
import json
import sys
import zipfile
from functools import lru_cache
import numpy as np
from PIL import Image
from common import ROOT, DEST, EVIDENCE, OUT, load, encode, sha


def decode(record):
    bits=np.unpackbits(np.frombuffer(base64.b64decode(record['bits']),dtype='uint8'),bitorder='big')
    return bits[:record['width']*record['height']].reshape(record['height'],record['width']).astype(bool)


def main():
    package=load(DEST/'collision.json.gz')
    index=load(EVIDENCE/'TASK-SETTINGS-222B/native-corpus-index.json.gz')
    expected={n.removeprefix('full/').removesuffix('.png'):h for n,h in index.items()
              if n.startswith(('full/fields/','full/tiles/','full/targets/'))}
    assert set(package['mapping'])==set(expected)
    seen=set()
    with zipfile.ZipFile(EVIDENCE/'TASK-SETTINGS-222B/native-corpus.zip') as archive:
        for name,digest in expected.items():
            ident=package['mapping'][name]
            color=(255,0,0) if name.startswith('targets/') else (0,255,255)
            key=(digest,ident,color)
            if key in seen:continue
            raw=archive.read(digest);assert hashlib.sha256(raw).hexdigest()==digest
            original=np.all(np.asarray(Image.open(io.BytesIO(raw)).convert('RGB'))==color,axis=2)
            assert np.array_equal(original,decode(package['planes'][ident])),name
            seen.add(key)
        full=json.loads(archive.read(index['full/measurement.json']))
    assert package['fields']==full['fields'] and package['trees']==full['trees']
    # Use the previously independently verified source sampler, replacing every
    # field IO with the production encoding. Its oracle inputs remain immutable.
    sys.path.insert(0,str(ROOT/'tools/turtle-collision'))
    import verify as sampler
    @lru_cache(maxsize=256)
    def plane(name):
        return decode(package['planes'][package['mapping'][name]])
    sampler.plane=lambda key,phase:plane(f'fields/{key}-{phase}')
    sampler.target_plane=lambda target,phase:plane(f'targets/t{target}-{phase}')
    sampler.tile_plane=lambda key,x,y,phase:plane(f'tiles/{key}-{x}-{y}-{phase}') if f'tiles/{key}-{x}-{y}-{phase}' in package['mapping'] else np.zeros((128,128),bool)
    fields={f['id']:f for f in package['fields']}
    summaries=[]
    work=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-222B'
    allowed=package['approvedResidual']['cases']
    for mode in ['full','dynamic','dynamic-call']:
        cases=full['cases'] if mode=='full' else load(work/mode/'resolved-collision-measurement.json')['cases']
        residual=[];pixels=0
        for i,row in enumerate(cases):
            actual=sampler.sample(row,fields)
            oracle=np.all(np.asarray(Image.open(work/mode/'oracle'/(row['id']+'.png')).convert('RGB'))==[0,255,255],axis=2) if actual.size else actual
            assert bool(actual.any())==row['actual'],row['id']
            assert actual.shape==oracle.shape
            diff=np.argwhere(actual!=oracle);pixels+=oracle.size
            if len(diff):
                residual.append(dict(id=row['id'],sourceDraw=row['sourceDraw'],intersection=row['intersection'],
                    originalHit=row['actual'],candidateHit=bool(actual.any()),
                    points=[dict(x=int(x),y=int(y),original=bool(oracle[y,x]),candidate=bool(actual[y,x])) for y,x in diff]))
            if i%20000==0:print(mode,i,'/',len(cases),flush=True)
        assert residual==(allowed if mode=='full' else []),mode
        summaries.append(dict(mode=mode,cases=len(cases),pixels=pixels,differentCases=len(residual),
                              differentPixels=sum(len(r['points']) for r in residual)))
    (OUT/'collision-verification.json').write_bytes(encode(dict(status='passed',
        phaseFiles=len(expected),uniqueComparisons=len(seen),oracle=summaries,
        packageSha256=sha(DEST/'collision.json.gz'))))
    print(summaries,flush=True)


if __name__=='__main__':main()
