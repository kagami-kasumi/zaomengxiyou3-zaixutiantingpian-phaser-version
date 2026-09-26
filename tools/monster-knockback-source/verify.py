"""Independent expectations for 230 source observations, not game acceptance."""
import hashlib
import json
import math
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT/'docs/tasks/evidence/TASK-SETTINGS-230'
SHAPES = ['ObjectBaseSprite','ObjectBaseSprite2','ObjectBaseSprite7']
MODES = ['air','floor','ceiling','left','right','through','through-up','through-down',
         'screen-left','screen-left-equal','screen-right','screen-right-equal','stun','wait','dead']


def near(a,b):
    assert abs(a-b)<1e-8,(a,b)


def verify(report):
    rows = report['rows']
    directions = [r for r in rows if r['type']=='direction']
    assert len(directions)==432
    for r in directions:
        sign = (-1 if r['bulletSpeed']<0 else 1) if 1<=r['kind']<=5 else r['direct'] if r['kind']>=6 else 1
        near(r['x'],r['inputX']*sign)
        near(r['y'],-5)
    assert next(r for r in rows if r['type']=='null-config')['x']==0
    motion = {}
    for r in rows:
        if r['type']=='motion':
            motion.setdefault(r['id'],[]).append(r)
    assert len(motion)==3*3*2*2*15*2
    for case in motion.values():
        assert [r['tick'] for r in case]==list(range(25))
        first=case[0];s=first['state'];direction=first['dir'];mode=first['mode']
        blocked = mode=='screen-left' and direction<0 or mode=='screen-right' and direction>0
        near(s['vx'],0 if blocked else 12*direction)
        near(s['vy'],-5)
        assert s['left']==(direction<0) and s['right']==(direction>0)
        # P1/P2 and ordinary/Boss must not invent different movement rules.
        ref=motion[first['id'].replace('/true/','/false/').replace('/2/','/1/')]
        assert [r['state'] for r in case]==[r['state'] for r in ref]
        # Independent analytic free trajectory. Flash DisplayObject assignment
        # rounds to twips; Point velocities retain the unquantized doubles.
        if mode in ['air','dead','stun','wait']:
            x,y,vx,vy=s['x'],s['y'],s['vx'],s['vy']
            for r in case[1:]:
                t=min((r['tick']-1)/first['fps'],.4)
                vx=direction*(2.4+9.6*(1-t/.4)**3)
                if mode=='wait':vx=5*direction
                if mode!='stun':
                    x=math.floor((x+vx)*20)/20
                    y=math.floor((y+vy)*20)/20
                    vy+=1.5
                if first['shape']=='ObjectBaseSprite7':
                    if mode!='wait':vy*=.8
                    if abs(vy)>4:vy*=.7
                    if y>=800:y=200
                    y=min(300,max(0,y))
                for key,value in [('x',x),('y',y),('vx',vx),('vy',vy)]:
                    near(r['state'][key],value)
        # Controlled wall branch coverage; raw full trajectories remain oracle.
        if first['shape']!='ObjectBaseSprite7':
            if mode=='ceiling':assert any(r['state']['head'] for r in case)
            if mode=='left' and direction<0:assert any(r['state']['wallLeft'] for r in case)
            if mode=='right' and direction>0:assert any(r['state']['wallRight'] for r in case)
            if mode in ['floor','through','through-up']:assert any(r['state']['standing'] for r in case)
            if mode=='through-down':assert not any(r['state']['standing'] for r in case)
    gates=[r for r in rows if r['type']=='gate'];assert len(gates)==14
    for r in gates:
        accepted=r['mode'] not in ['protected','dodge','geometry-miss']
        assert r['accepted']==accepted
        applied=r['mode'] in ['hit','forced']
        near(r['state']['vx'],(12 if r['owner']==1 else -12) if applied else 0)
        assert r['ids']==(['attack'] if r['mode']=='dodge' else [])
    dedup={r['mode']:r for r in rows if r['type']=='dedup'}
    for mode,refresh,vx in [('same',1,77),('different',2,12),('protected-then-hit',1,12),('dodge-then-hit',0,77)]:
        assert dedup[mode]['refresh']==refresh
        near(dedup[mode]['state']['vx'],vx)
    schedule=[r for r in rows if r['type']=='schedule'];assert len(schedule)==4
    assert [(r['state']['x'],r['state']['y'],r['state']['vx'],r['state']['vy']) for r in schedule]==[
        (300,200,0,4),(300,204,12,-5),(312,199,12,-3.5),(324,195.5,12,-2)], "original world monster-before-pet sequence differs"
    for mode,end in [('replace',-1.2),('edge-return',2.4),('zero',0)]:
        natural=[r for r in rows if r['type']=='natural-tween' and r['mode']==mode]
        assert natural[0]['elapsed']<.1 and natural[-1]['elapsed']>=.65
        near(natural[-1]['state']['vx'],end)
        changed=[r for r in natural if r['changed']]
        if mode=='replace':assert all(r['state']['vx']<0 for r in changed)
        if mode=='edge-return':assert changed[0]['state']['vx']==0 and any(r['state']['vx']>0 for r in changed[1:])
    return dict(directions=len(directions),motionGroups=len(motion),motionStates=sum(map(len,motion.values())),
                gateCases=len(gates),dedupCases=len(dedup),scheduleStates=len(schedule),naturalTweenModes=3)


def main():
    report=json.loads((OUT/'native.json').read_text(encoding='utf-8'))
    for ref in report['methods']:
        assert hashlib.sha256((ROOT/ref['path']).read_bytes()).hexdigest()==ref['fileSha256']
    for ref in report['sources']:
        assert hashlib.sha256((ROOT/ref['path']).read_bytes()).hexdigest()==ref['sha256']
    counts=verify(report)
    mutations=[]
    mutation_records=[]
    if '--mutations' in sys.argv or '--existing-mutations' in sys.argv:
        for name in ['no-consumption','seconds-units','gravity-order','duplicate','hit-order']:
            if '--mutations' in sys.argv:
                result=subprocess.run([sys.executable,str(Path(__file__).parent/'capture.py'),name],cwd=ROOT,capture_output=True,timeout=90)
                assert result.returncode==0,(result.stdout+result.stderr).decode(errors='replace')
            mutant=json.loads((OUT/('mutation-'+name+'.json')).read_text(encoding="utf-8"))
            assert mutant['sources']==report['sources'] and mutant['methods']==report['methods']
            try:verify(mutant)
            except AssertionError as failure:
                mutations.append(name)
                mutation_records.append(dict(name=name,sha256=hashlib.sha256((OUT/('mutation-'+name+'.json')).read_bytes()).hexdigest(),rejection=str(failure)))
            else:raise AssertionError('accepted source mutant '+name)
    if '--mutations' in sys.argv:
        restored=subprocess.run([sys.executable,str(Path(__file__).parent/'capture.py')],cwd=ROOT,capture_output=True,timeout=90)
        assert restored.returncode==0,(restored.stdout+restored.stderr).decode(errors='replace')
        fresh=json.loads((OUT/'native.json').read_text(encoding="utf-8"))
        assert [r for r in fresh['rows'] if r['type']!='natural-tween']==[r for r in report['rows'] if r['type']!='natural-tween']
        verify(fresh)
    stable=[r for r in report['rows'] if r['type']!='natural-tween']
    result=dict(status='passed',counts=counts,sourceMutationsRejected=mutations,sourceMutationEvidence=mutation_records,
                inputSources=report['sources'],inputMethods=report['methods'],
                deterministicObservationSha256=hashlib.sha256(json.dumps(stable,sort_keys=True,separators=(',',':')).encode()).hexdigest(),
                limits='Controlled source methods/objects, not modern gameplay or full scene acceptance')
    (OUT/'verification.json').write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps({k:result[k] for k in ['status','counts','sourceMutationsRejected','limits']}))


if __name__=='__main__':main()

