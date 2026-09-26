"""Keep normal exact-raster proof separate from actual compiled renderer mutations."""
import json
from run_geometry import ROOT,BASE,OUT,builder
from run_lifecycle import sha

def main():
    path=BASE/'geometry-air/measurement.json';normal=json.loads(path.read_text())
    assert len(normal['states'])==665
    assert (BASE/'geometry-air/GeometryProbe.as').read_text()==builder()
    assert normal['inputsSha256']==sha(OUT/'geometry-inputs.json')
    assert all(r['differentPixels']==0 and r['bounds']==r['boundsExpected'] for r in normal['states'])
    mutations={}
    for mode in ('origin','phase','mask','pending'):
        p=BASE/f'geometry-mutation-{mode}/measurement.json';data=json.loads(p.read_text())
        assert len(data['states'])==221 and data['mutation']==mode
        count=sum(r['differentPixels']>0 or r['bounds']!=r['boundsExpected'] for r in data['states'])
        assert count>0
        mutations[mode]=dict(rejectedStates=count,measurementSha256=sha(p),compiledSha256=data['compiledSha256'])
    report=dict(status='passed-bounded',states=665,failures=[],mutationsRejected=mutations,measurementSha256=sha(path),builderSha256=sha(BASE/'geometry-air/GeometryProbe.as'),
        scope='Exact RGBA and bounds of 221 recursive lifecycle phases at each native fps, plus two static original ice displays. Horse source masks preserved even after masked content is removed; no pixel tolerance. Attachment, world transform and recursive UI Schema are separate packages.')
    (OUT/'geometry-verification.json').write_text(json.dumps(report,indent=2)+'\n')
    print('229 geometry verified:',665,'states; mutations',{k:v['rejectedStates'] for k,v in mutations.items()})

if __name__=='__main__':main()
