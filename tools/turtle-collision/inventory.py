"""Require every declared source/target phase image in the verified native archive."""
import gzip
import json
import math
from run import OUT,WORK,sha,save

def main():
    index=json.loads(gzip.decompress((OUT/'native-corpus-index.json.gz').read_bytes()))
    native=json.loads((WORK.parent/'full/measurement.json').read_text())
    rows={}
    for row in native['cases']:rows.setdefault(row['field'],row)
    required={f'full/targets/t{t}-{p}.png' for t in range(3) for p in range(400)}
    for field in native['fields']:
        key=field['id']
        if field['layout']=='plane':
            required.update(f'full/fields/{key}-{p}.png' for p in range(16))
        else:
            row=rows[key];b=row['sourceBounds'];root=row['sourceRoot']
            left=b['x']-root['x'];top=b['y']-root['y']
            for y in range(math.floor(top/128),math.floor((top+b['height'])/128)+1):
                for x in range(math.floor(left/128),math.floor((left+b['width'])/128)+1):
                    required.update(f'full/tiles/{key}-{x}-{y}-{p}.png' for p in range(16))
    for folder in ['full','dynamic','dynamic-call']:
        measurement='measurement.json' if folder=='full' else 'collision-measurement.json'
        data=json.loads((WORK.parent/folder/measurement).read_text())
        required.add(f'{folder}/{measurement}')
        for row in data['cases']:
            q=row['intersection']
            if q['width']>=1 and q['height']>=1:required.add(f"{folder}/oracle/{row['id']}.png")
    missing=sorted(required-set(index));assert not missing,missing[:20]
    mutation=next(n for n in required if '/tiles/' in n)
    reduced=set(index)-{mutation};assert required-reduced
    save(OUT/'inventory-verification.json',dict(status='passed',requiredFiles=len(required),
        missingFiles=missing,missingTileMutationRejected=True,indexSha256=sha(OUT/'native-corpus-index.json.gz'),
        boundary='Every declared field phase and nonempty native oracle image is archived; out-of-bounds tile lookups may return transparent, missing in-bounds tiles cannot pass this gate.'))
    print('Native phase inventory:',len(required),'required files; missing tile rejected')

if __name__=='__main__':main()
