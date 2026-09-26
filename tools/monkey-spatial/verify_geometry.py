"""Strict geometry promotion gate: observed raster differences fail, regardless of bounds."""
import hashlib
import json
from pathlib import Path

from PIL import Image,ImageChops

ROOT=Path(__file__).resolve().parents[2]
BASE=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-228'
WORK=BASE/'geometry-air'
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-228'


def main():
    measurement=WORK/'measurement.json';data=json.loads(measurement.read_text())
    assert hashlib.sha256((OUT/'geometry-inputs.json').read_bytes()).hexdigest()==data['inputsSha256']
    assert hashlib.sha256((ROOT/'tools/monkey-spatial/GeometryProbe.as').read_bytes()).hexdigest()==data['probeSha256']
    assert hashlib.sha256((WORK/'decoded-vectors.swf').read_bytes()).hexdigest()==data['decodedVectorsSha256']
    definitions=json.loads((OUT/'source-definitions.json').read_text())['sources'][0]['definitions']
    encoded=json.loads((WORK/'decoded-vectors.json').read_text())
    assert encoded['sha256']==data['decodedVectorsSha256']
    assert all(r['sha256']!=definitions[str(r['characterId'])]['tagBodySha256'] for r in encoded['records'])
    natives={fps:json.loads((BASE/f'lifecycle-air/measurement-{fps}.json').read_text()) for fps in [20,24,30]}
    fire={str(r['tick']):r for r in json.loads((BASE/'cleanup-air/measurement.json').read_text())['fire']}
    failures=[];exact=0;bounds=0
    for row in data['states']:
        if row['id'].startswith('fire-'):
            native=fire[row['id'].split('-')[1]];original=BASE/'cleanup-air'/native['path']
        else:
            fps=int(row['id'].split('-')[0]);native=natives[fps]['nativePhases'][row['key']]
            original=BASE/'lifecycle-air'/native['path']
        actual=WORK/row['path']
        assert hashlib.sha256(original.read_bytes()).hexdigest()==native['sha256']
        assert hashlib.sha256(actual.read_bytes()).hexdigest()==row['sha256']
        a=Image.open(original).convert('RGBA');b=Image.open(actual).convert('RGBA')
        assert a.size==b.size
        channels=ImageChops.difference(a,b).split()
        matching=not any(c.getbbox() for c in channels)
        exact+=matching;bounds+=row['bounds']==native['tree']['localBounds']
        if not matching:failures.append(dict(id=row['id'],key=row['key'],differentPixels=row['differentPixels'],alphaDifferences=row['alphaDifferences']))
    assert len(data['states'])==298
    mutations={}
    for name in ['origin','filter','phase','pending','vector']:
        path=BASE/('geometry-mutation-'+name)/'measurement.json';changed=json.loads(path.read_text())
        assert changed['mutation']==name and len(changed['states'])==92
        assert changed['inputsSha256']==data['inputsSha256'] and changed['probeSha256']==data['probeSha256']
        mismatches=sum(r['differentPixels']>0 for r in changed['states']);assert mismatches>0
        mutations[name]=dict(rejectedStates=mismatches,measurementSha256=hashlib.sha256(path.read_bytes()).hexdigest())
    report=dict(status='failed' if failures else 'passed',states=298,exactPixelStates=exact,exactBoundsStates=bounds,rejectedMutants=mutations,
                failures=failures,measurementSha256=hashlib.sha256(measurement.read_bytes()).hexdigest(),
                scope='Independent source reconstruction pixel/bounds comparison; zero tolerance, no promotion while differences remain.')
    (OUT/'geometry-verification.json').write_text(json.dumps(report,indent=2)+'\n')
    print('228 geometry gate:',report['status'],';',exact,'exact RGBA states;',bounds,'exact bounds states;',len(failures),'raster failures')
    if failures:raise SystemExit(1)


if __name__=='__main__':main()
