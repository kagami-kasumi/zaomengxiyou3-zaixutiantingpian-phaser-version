"""Source spatial/fade expectations and full native versus independent raster comparisons."""
import copy
import json
from ui_truth import ROOT,BASE,OUT,read,sha


def check(row,fixture):
    item=next(c for c in fixture['cases'] if c['id']==row['inputId']);time=row['time'];errors=[]
    expected=dict(owner=item['owner'],direction=item['direction'],differentPixels=0,exists=item['kind']=='hp' or time<2,visible=time<2)
    if item['kind']=='hp':expected.update(x=-23,y=item['expectedY'],colipseHeight=item['colipseHeight'],alpha=(1-time/2)**2)
    elif time<2:expected.update(x=item['x']-20,y=item['y']-60-60*(1-(1-time/2)**2),alpha=(1-time/2)**2)
    else:expected.update(x=None,y=None,alpha=None)
    return [key for key,value in expected.items() if row[key]!=value]


def main():
    path=BASE/'inherited-display-air/measurement.json';data=read(path)
    assert len(data['rows'])==210 and len(data['fixtures']['cases'])==42
    assert data['probeSha256']==sha(ROOT/'tools/monkey-spatial/InheritedDisplayProbe.as')
    assert data['compiledSwfSha256']==sha(path.parent/'InheritedDisplayProbe.swf')
    for record in data['methods']:assert sha(ROOT/record['path'])==record['fileSha256']
    for row in data['rows']:
        assert not check(row,data['fixtures']),(row['id'],check(row,data['fixtures']))
        assert sha(path.parent/row['path'])==row['sha256']
    mutants={}
    for name,key,value,kind,time in [('linear-fade','alpha',.75,'hp',.5),('wrong-anchor','x',0,'hp',0),('wrong-fill','differentPixels',1,'hp',0),('miss-not-removed','exists',True,'miss',2),('owner-bleed','owner',2,'hp',0)]:
        changed=copy.deepcopy(next(r for r in data['rows'] if r['kind']==kind and r['time']==time and r['owner']==1));changed[key]=value
        errors=check(changed,data['fixtures']);assert errors;mutants[name]=errors
    report=dict(status='passed-bounded',states=210,independentPixelStates=210,measurementSha256=sha(path),rejectedMutants=mutants,scope=data['scope'],
                missSourceEquivalence='StageCommon character8 and OtherMat1 character71 have byte-identical tag payload after character ID; observed pixels are not contingent on load precedence.')
    (OUT/'inherited-display-verification.json').write_text(json.dumps(report,indent=2)+'\n')
    print('228 inherited display verified: 210 states; 210 strict pixel matches; 5 rejected trace mutations')


if __name__=='__main__':main()
