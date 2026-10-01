"""Independent 243 numerical/lifecycle expectations; no production imports."""
import hashlib
import itertools
import json
import math
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
NAMES=['sxkb','fsnl','smjc','mfjc','gjjc','fyjc']
BASE=[333,77,1000,200,101,39]
def close(a,b):
    if isinstance(a,(int,float)) and not isinstance(a,bool):
        assert math.isclose(a,b,rel_tol=1e-12,abs_tol=1e-12),(a,b)
    elif isinstance(a,dict):
        assert a.keys()==b.keys(),(a,b)
        for k in a: close(a[k],b[k])
    elif isinstance(a,list):
        assert len(a)==len(b),(a,b)
        for x,y in zip(a,b): close(x,y)
    else: assert a==b,(a,b)
def values(form,t): return [form*.07*t*.27*1.05]+[form*k*t*1.05 for k in [30,70,70,6,5]]
def verify(report):
    cases={c['id']:c for c in report['cases']}; expected=set()
    for fps,form,t,w in itertools.product([20,24,30],range(1,5),range(9),range(9)):
        key=f'domain/{fps}/{form}/{t}/{w}';expected.add(key);c=cases[key];r=c['result']
        assert c['input']==dict(fps=fps,form=form,technique=t,warpower=w)
        assert r['mp']==880 and r['counts']==[4320]+[5400]*5
        v=values(form,t);d=int((30+form*5)*w/2*.6)*fps
        enrolled=r['enrolled'];assert enrolled['stats']==BASE
        assert [e['name'] for e in enrolled['pet']+enrolled['hero']]==NAMES
        for i,e in enumerate(enrolled['pet']+enrolled['hero']):
            close(e['value'],v[i]);assert e['time']==d and e['isFirst']
        assert enrolled['magic']==int(v[1]) and enrolled['crit']==(.2<=.1+v[0])
        on=[int(333+v[2]*.333),int(77+v[3]*.385),int(1000+v[2]),int(200+v[3]),int(101+v[4]),int(39+v[5])]
        off=[int(on[0]-v[2]*on[0]/on[2]),int(on[1]-v[3]*on[1]/on[3]),int(on[2]-v[2]),int(on[3]-v[3]),int(on[4]-v[4]),int(on[5]-v[5])]
        ticks=sorted(set([0,1,2,d-1,d,d+1,d+2]) & set(range(d+3)))
        assert [row['tick'] for row in r['rows']]==ticks
        for row in r['rows']:
            tick=row['tick'];s=row['state'];assert s['stats']==(BASE if d==0 else on if tick<d-1 else off),(key,row,on,off)
            for group,size in [('pet',2),('hero',4)]:
                assert len(s[group])==size
                assert sum(e is not None for e in s[group])==(size if tick<d else 0)
                for e in s[group]:
                    if e: assert not e['isFirst'] and e['startTime']==0 and e['time']==d
            assert s['magic']==(int(v[1]) if tick<d else 0)
            assert s['crit']==(.2<=.1+(v[0] if tick<d else 0))
    for raw in [8,8.9,9,100,-1,-.5,.9,1.9]:
        key='getter/'+str(raw).replace('8.0','8');expected.add(key);r=cases[key]['result']
        val=4 if raw>8 else int(raw);assert r['technique']==r['warpower']==val
        close(r['harms'],[dict(first=v,second=35*val/2*.6) for v in values(1,val)])
    for raw in [8,8.9,9,100,-1,-.5,.9,1.9]:
        key='setter/'+str(raw);expected.add(key);stored=int(raw)%2**32;val=4 if stored>8 else stored
        close(cases[key]['result'],dict(stored=dict(technique=stored,warpower=stored),technique=val,warpower=val))
    for time,new in itertools.product([0,1,3],[0,1,5]):
        key=f'refresh/{time}/{new}';expected.add(key);r=cases[key]['result']
        first=time==0
        e=dict(name='gjjc',time=new,value=99 if first else 7,isFirst=first)
        if not first:e['startTime']=1
        close(r['initial'],([None,e] if first else [e]))
        for tick,row in enumerate(r['rows']):
            active=dict(name='gjjc',time=new,value=e['value'],isFirst=False,startTime=1)
            close(row,([None] if first else [])+[active if tick<new else None])
    assert len(report['cases'])==len(cases)==len(expected)==997
    assert set(cases)==expected
    from capture import base
    assert report['runtime']=='bundled AIR 51.1.1.5'
    assert '-runtime' in report['runtimeCommand'] and report['runtimeCommand'][2]==str(ROOT/'local-resources/regima/source/unpacked')
    for source in report['sources']:
        path=ROOT/source['path'];full=path.read_text(encoding='utf-8')
        assert hashlib.sha256(path.read_bytes()).hexdigest()==source['fileSha256']
        fragment=base.old.method(full,source['method'])
        assert full[:full.index(fragment)].count('\n')+1==source['startLine']
        assert hashlib.sha256(fragment.encode()).hexdigest()==source['sliceSha256']
    return len(cases)
if __name__=='__main__':
    report=json.loads((ROOT/'docs/tasks/evidence/TASK-SETTINGS-243/baseline/trace.json').read_text(encoding='utf-8'))
    print('verified',verify(report))
