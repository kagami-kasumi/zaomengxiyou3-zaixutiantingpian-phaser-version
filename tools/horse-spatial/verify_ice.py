"""Independent expiry/refresh/cleanup and frozen BBDC expectations."""
import copy
import json
import math
from prepare_ice import WORK,OUT
from run_lifecycle import sha

def cursor(steps):return [(0,2),(0,1),(1,3),(1,2),(1,1)][steps%5]

def check(row,fps):
    tick,mode,hero=row['tick'],row['mode'],row['hero'];active=row['p'+str(row['owner'])];other=row['p'+str(3-row['owner'])]
    start=fps+2 if mode=='refresh' and tick>=fps+2 else 2 if mode=='repeat-show' and tick>=2 else 0
    expiry=math.ceil(start+fps*2.4);cut=fps+3 if mode in ('cancel','destroy') else math.inf;end=min(expiry,cut)
    visible=tick<end or mode=='destroy' and tick>=cut
    advances=1+(max(0,tick-cut+1) if mode=='cancel' else 0 if mode=='destroy' else max(0,tick-expiry))
    col,count=cursor(advances);oc,ot=cursor(tick+1)
    expected=dict(ice=visible,children=1+int(visible),owner=not(mode=='destroy' and tick>=cut),stopped=visible,locked=hero and visible,
        staticCalls=(2 if mode=='repeat-show' and tick>=2 else 1) if hero else 0,column=col,count=count,
        buff=dict(time=fps*2.4,startTime=start,isFirst=False) if tick<end else None)
    errors=[key for key,value in expected.items() if active[key]!=value]
    for key,value in dict(ice=False,children=1,owner=True,stopped=False,locked=False,staticCalls=0,column=oc,count=ot,buff=None,matrix=None,width=None,height=None).items():
        if other[key]!=value:errors.append('other-'+key)
    if visible:
        if active['width']!=active['colipseWidth'] or active['height']!=active['colipseHeight']:errors.append('size')
        if any(active['matrix'][k]!=0 for k in ('b','c','tx','ty')):errors.append('transform')
    elif active['matrix'] is not None:errors.append('removed-matrix')
    return errors

def main():
    failures=[];files=[];mutants={};total=0
    for fps in (20,24,30):
        path=WORK/f'measurement-{fps}.json';data=json.loads(path.read_text());assert data['environment'][0]['fps']==fps
        assert data['methodsSha256']==sha(OUT/'ice-methods.json')
        assert len(data['rows'])==60*(fps*5+1)
        for row in data['rows']:
            errors=check(row,fps)
            if errors:failures.append(dict(fps=fps,id=row['id'],tick=row['tick'],fields=errors))
        for mode,tick,field,value in [('refresh',fps+2,'children',3),('destroy',fps+3,'ice',False),('cancel',fps+3,'stopped',True),('expire',0,'width',1),('expire',1,'locked',False)]:
            r=copy.deepcopy(next(r for r in data['rows'] if r['owner']==1 and r['hero'] and r['mode']==mode and r['tick']==tick));r['p1'][field]=value
            mutants[f'{mode}-{field}-{fps}']=bool(check(r,fps))
        files.append(dict(fps=fps,sha256=sha(path),compiledSha256=data['compiledSha256']));total+=len(data['rows'])
    report=dict(status='failed' if failures else 'passed-bounded',states=total,cases=180,failures=failures,measurements=files,fieldMutationsRejected=mutants,
        scope='Native ice attachment over three real colipse classes, target-pair isolation, unequipped Hero input observation, duplicate show, refresh, explicit cancellation/destruction, original BBDC pause/resume. Full target death caller and independent ice pixels remain separate.')
    (OUT/'ice-verification.json').write_text(json.dumps(report,indent=2)+'\n')
    print('229 ice',total,'states;',len(failures),'failures',failures[:5]);assert not failures and all(mutants.values())

if __name__=='__main__':main()
