"""Independent finite-case expectations for 235; never imports production TS."""
import copy
import hashlib
import itertools
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT/'docs/tasks/evidence/TASK-SETTINGS-235'
NAMES = ['sxkb','fsnl','smjc','mfjc','gjjc','fyjc']


def close(a, b):
    if isinstance(a, (float, int)) and not isinstance(a, bool):
        assert math.isclose(a,b,rel_tol=1e-12,abs_tol=1e-12), (a,b)
    elif isinstance(a, dict):
        assert a.keys()==b.keys(), (a,b)
        for k in a: close(a[k],b[k])
    elif isinstance(a, list):
        assert len(a)==len(b), (a,b)
        for x,y in zip(a,b): close(x,y)
    else: assert a==b, (a,b)


def verify(report):
    cases={c['id']:c for c in report['cases']}
    expected=set()
    for family,fps,form,mp,learned,ready in itertools.product(['monkey','horse'],[20,24,30],range(1,5),[0,19,20,40,119,120,1000],[False,True],[False,True]):
        key=f'gate/{family}/{fps}/{form}/{mp}/{str(learned).lower()}/{str(ready).lower()}'
        expected.add(key);c=cases[key];r=c['result']
        assert c['input']==dict(family=family,fps=fps,form=form,mp=mp,learned=learned,ready=ready)
        count=min(6,mp//20) if learned and ready else 0
        assert r['mp']==mp-count*20 and r['hp']==100 and r['tCount']==1
        assert r['ehp']==6 and r['emp']==2
        assert r['counts']==[(4320 if i==0 else 5400) if i<count else (0 if ready else 299) for i in range(6)]
        assert [e['name'] for e in r['pet']+r['hero']]==NAMES[:count]
        values=[form*.07*3*.27*1.05,form*30*3*1.05,form*70*3*1.05,form*70*3*1.05,form*6*3*1.05,form*5*3*1.05]
        for i,e in enumerate(r['pet']+r['hero']):
            close(e['value'],values[i]);assert e['time']==int((30+form*5)*.3)*fps
            assert e['isFirst']==(i>=2)
        assert r['magic']==(int(values[1]) if count>=2 else 0)
        assert r['crit']==(.2 <= .1+(values[0] if count else 0))
    for fps,mode in itertools.product([20,24,30],['normal','hurt','stun','pause','dead','refresh']):
        key=f'period/{fps}/{mode}';expected.add(key)
        rows=cases[key]['result'];assert [r['tick'] for r in rows]==[fps,fps+1,2*(fps+1)]
        for index,r in enumerate(rows):
            heals=0 if mode=='pause' else index
            hp=0 if mode=='dead' else 100+(6*heals if mode!='refresh' or heals<2 else 21)
            mp=10+(2*heals if mode!='refresh' or heals<2 else 7)
            assert (r['hp'],r['mp'])==(hp,mp), (key,r,hp,mp)
            assert r['counts']==[300 if mode in ['stun','pause'] else 300-r['tick']]*6
            level=5 if mode=='refresh' and index>0 else 2
            assert (r['ehp'],r['emp'])==((0,0) if mode=='pause' else (level*3,level))
    for fps in [20,24,30]:
        key=f'initial/{fps}';expected.add(key)
        assert cases[key]['result']==dict(first=300,counts=[4319]+[5399]*5)
        for form in range(1,5):
            key=f'effects/{fps}/{form}';expected.add(key);r=cases[key]['result']
            assert r['initial']==[333,77,1000,200,101,39]
            value=form*70*3*1.05;attack=form*6*3*1.05;defense=form*5*3*1.05
            on=[int(333+value*.333),int(77+value*.385),int(1000+value),int(200+value),int(101+attack),int(39+defense)]
            off=[int(on[0]-value*on[0]/on[2]),int(on[1]-value*on[1]/on[3]),int(on[2]-value),int(on[3]-value),int(on[4]-attack),int(on[5]-defense)]
            rows=r['rows'];duration=int((30+form*5)*.3)*fps
            assert [row['tick'] for row in rows]==[0,duration-1,duration,duration+1,duration+2]
            assert rows[0]['stats']==on
            for row in rows[1:]: assert row['stats']==off,(key,row,off)
            for row in rows:
                assert sum(e is not None for e in row['effects'])==(4 if row['tick']<duration else 0)
    for fps in [20,24,30]:
        key=f'cooldown/{fps}';expected.add(key)
        rows=cases[key]['result'];assert [r['tick'] for r in rows]==[1,4320,4321,5400,5401,5402]
        for r in rows:
            t=r['tick'];assert r['counts']==[4320-(t-1)%4320]+[5400-(t-1)%5400]*5,(key,r)
    for level in [1,4,5,9,14,90]:
        key=f'level/{level}';expected.add(key);assert cases[key]['result']==dict(hp=level//5*3,mp=level//5)
    expected.add('no-effect');assert cases['no-effect']['result']==dict(mp=880,counts=[4320]+[5400]*5,hero=[])
    expected.update(['refresh','expiry','caps','destroy-replace','active-only'])
    assert cases['refresh']['result']==[dict(name='gjjc',time=5,value=7,isFirst=False,startTime=1)]
    assert cases['expiry']['result']==[cases['refresh']['result']]*5+[[None],[None]]
    caps=cases['caps']['result'];assert caps['hp']==1000 and caps['mp']==1000
    r=cases['destroy-replace']['result'];assert r['dead'] and r['petEffect'] is None and r['owner'] is None
    assert r['newCounts']==[300]*6;close(r['heroBefore'],r['heroAfter'])
    assert cases['active-only']['result']==dict(active=[270]*6,resting=[300]*6,activeHp=106,restingHp=100)
    assert set(cases)==expected and len(cases)==len(report['cases'])==720
    for source in report['sources']:
        path=ROOT/source['path']
        assert hashlib.sha256(path.read_bytes()).hexdigest()==source['fileSha256']
    return len(cases)


if __name__=='__main__':
    baseline=json.loads((OUT/'baseline/trace.json').read_text(encoding='utf-8'))
    print('verified',verify(baseline),'native cases')
