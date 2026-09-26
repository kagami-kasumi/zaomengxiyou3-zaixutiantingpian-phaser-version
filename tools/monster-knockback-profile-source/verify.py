"""Independent constructor/analytic checks plus real source mutations for task 237."""
import hashlib
import itertools
import json
import math
from pathlib import Path
import subprocess
import sys

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-237'
HERE=Path(__file__).parent
IDS=[2,3,4,5,6,7,8,9,10,16,19,30]
CONTEXTS=[(1,1),(1,2),(1,3),(2,1),(2,2),(3,3),(8,1),(9,1)]
MODES=['air','floor','ceiling','left','right','through','through-up','through-down','screen-left','screen-left-equal','screen-right','screen-right-equal','stun','wait','dead','hit1','hit4','recover','unfreeze','hit1-floor','hit4-floor']
MUTATIONS=['base-scale','fly-gravity','fixed-speed','stage-branch','attack-predicate','fourth-attack','walk-predicate','force-endpoint']
# Independent source reading: Monster*.as constructors. Not imported from capture or modern code.
SPEED={2:5,3:4,4:5,5:5,6:5,7:3,8:3,9:3,10:3,16:5,19:3,30:7}

def near(a,b):
    assert abs(a-b)<1e-8,(a,b)

def digest(value):
    return hashlib.sha256(json.dumps(value,sort_keys=True,separators=(',',':')).encode()).hexdigest()

def key(row):
    return tuple(row[k] for k in ['monsterId','stage','fps','mode','direction','owner','boss'])

def speed(ident,stage):
    return ({9:4,10:4,19:3.5}.get(ident,SPEED[ident]) if stage==9 else SPEED[ident])

def verify(report):
    collision=json.loads((ROOT/'docs/tasks/evidence/TASK-SETTINGS-218/collision-contract.json').read_text(encoding='utf-8'))
    bounds={r['monsterId']:r['runtimeBounds'] for r in collision['monsterMappings']}
    profiles=report['profiles']
    assert len(profiles)==288
    assert {(r['monsterId'],r['stage'],r['level'],r['fps']) for r in profiles}=={(i,s,l,f) for i in IDS for s,l in CONTEXTS for f in [20,24,30]}
    for row in profiles:
        i=row['monsterId'];p=row['profile'];b=bounds[i]
        assert p['gravity']==(0 if i==30 else 1.5),(i,'gravity',p)
        assert p['flying']==(i==30)
        near(p['horizontalSpeed'],speed(i,row['stage']));near(p['runSpeed'],10)
        near(p['initialVx'],0);near(p['initialVy'],4)
        for observed,expected in [('x','left'),('y','top'),('width','width'),('height','height')]:near(p['collider'][observed],b[expected])
        for action,pred in row['predicates'].items():
            assert pred==dict(attacking=action in ['hit1','hit2','hit3'] or i==16 and action=='hit4',cannotMove=i==30 and action=='hit1',beAttacking=action in ['hurt','dead'],walkOrRun=action in ['walk','run']),(i,action,pred)
    trajectories={key(row):row for row in report['motion']}
    variants=[(i,1) for i in IDS]+[(i,9) for i in [9,10,19]]
    expected={(i,s,f,m,d,o,b) for i,s in variants for f,m,d,o,b in itertools.product([20,24,30],MODES,[-1,1],[1,2],[False,True])}
    assert len(trajectories)==len(report['motion'])==7560
    assert set(trajectories)==expected
    analytic=0
    for k,row in trajectories.items():
        states=row['states'];i,stage,fps,mode,direction,owner,boss=k
        assert len(states)==25 and all(len(state)==9 for state in states)
        assert states==trajectories[k[:5]+(1,False)]['states'],('boss/owner',k)
        x,y,vx,vy=states[0][:4]
        blocked=mode=='screen-left' and direction<0 or mode=='screen-right' and direction>0
        near(vx,0 if blocked else 12*direction);near(vy,-5)
        if mode in ['air','dead','stun','wait','hit1','hit4','recover','unfreeze']:
            action=states[0][8]
            for tick,actual in enumerate(states[1:],1):
                if mode=='recover' and tick==5:action='wait'
                hurt=action in ['hurt','dead']
                vx=direction*(2.4+9.6*(1-min((tick-1)/fps,.4)/.4)**3)
                if not hurt:vx=speed(i,stage)*direction
                if i==30 and action=='hit1':vx=vy=0
                frozen=mode=='stun' or mode=='unfreeze' and tick<5
                if not frozen:
                    x=math.trunc((x+vx)*20)/20;y=math.trunc((y+vy)*20)/20
                    vy+=0 if i==30 else 1.5
                if i==30:
                    if hurt:vy*=.8
                    if abs(vy)>4:vy*=.7
                    if y>=800:y=200
                    y=min(300,max(0,y))
                for a,b in zip(actual[:4],[x,y,vx,vy]):near(a,b)
                assert actual[8]==action
                analytic+=1
        if i!=30:
            if mode=='ceiling':assert any(s[5] for s in states),k
            if mode=='left' and direction<0:assert any(s[6] for s in states),k
            if mode=='right' and direction>0:assert any(s[7] for s in states),k
            # TweenLite renderTime: cachedTime==prevTime && !force returns without writes.
            # After completion a wall-cleared x speed must stay zero, not be resurrected.
            if mode=='left' and direction<0:assert not states[-1][6],('completed tween writes',k)
            if mode=='right' and direction>0:assert not states[-1][7],('completed tween writes',k)
            if mode in ['floor','through','through-up','hit1-floor','hit4-floor']:assert any(s[4] for s in states),k
            if mode=='through-down':assert not any(s[4] for s in states),k
            if mode=='hit4-floor' and i==16:assert all(s[8]=='hit4' for s in states),k
    properties=json.loads((ROOT/'docs/tasks/evidence/TASK-SETTINGS-217/environment-properties.json').read_text(encoding='utf-8'))
    spatial=json.loads((ROOT/'docs/reverse-engineering/ground-truth/manifests/task-settings-217-pet-ground-environment.json').read_text(encoding='utf-8'))
    objects={r['id']:r for r in spatial['displayObjects']}
    expected_inputs=[]
    for level in properties['levels']:
        flags={r['objectId']:r for r in level['walls']}
        expected_inputs.append(dict(level=level['level'],walls=[dict(id=i,**objects[i]['placements'][0]['stageBounds'],throughClass=flags[i]['isThroughWallClass'],markers=flags[i]['markers']) for i in level['collisionOrder']]))
    assert report['environmentInputs']==expected_inputs
    env=report['environmentMotion']
    expected_env={(i,e['level'],w['id'],f,d) for i in IDS for e in expected_inputs for w in e['walls'] for f in [20,24,30] for d in [-1,1]}
    assert len(env)==len(expected_env)==3096
    assert {(r['monsterId'],r['level'],r['wallId'],r['fps'],r['direction']) for r in env}==expected_env
    walls={w['id']:w for e in expected_inputs for w in e['walls']}
    for row in env:
        assert len(row['states'])==25
        wall=walls[row['wallId']];height=bounds[row['monsterId']]['height'];start=row['states'][0]
        near(start[0],math.trunc((wall['left']+wall['width']/2)*20)/20)
        near(start[1],math.trunc((wall['top']-height/2-1)*20)/20)
        near(start[2],row['direction']*12);near(start[3],-5)
        near(row['worldOffset'][0],math.trunc((400-start[0])*20)/20)
        near(row['worldOffset'][1],math.trunc((200-start[1])*20)/20)
        assert all(len(state)==9 and all(math.isfinite(n) for n in state[:4]) for state in row['states'])
    return dict(constructorCases=len(profiles),motionGroups=len(trajectories),motionStates=len(trajectories)*25,analyticStates=analytic,environmentGroups=len(env),environmentStates=len(env)*25)

def main():
    path=OUT/'native.json';report=json.loads(path.read_text(encoding='utf-8'))
    for item in report['methods']:
        assert hashlib.sha256((ROOT/item['path']).read_bytes()).hexdigest()==item['fileSha256']
    for item in report['sources']:
        assert hashlib.sha256((ROOT/item['path']).read_bytes()).hexdigest()==item['sha256']
    counts=verify(report)
    evidence=[]
    baseline={key(r):r for r in report['motion']}
    if '--mutations' in sys.argv or '--existing-mutations' in sys.argv:
        for name in MUTATIONS:
            if '--mutations' in sys.argv:
                run=subprocess.run([sys.executable,str(HERE/'capture.py'),name],cwd=ROOT,capture_output=True,timeout=180)
                assert run.returncode==0,(run.stdout+run.stderr).decode(errors='replace')
            mp=OUT/f'mutation-{name}.json';mutant=json.loads(mp.read_text(encoding='utf-8'))
            assert mutant['sources']==report['sources'] and mutant['methods']==report['methods']
            try:verify(mutant)
            except AssertionError as error:reason=str(error)
            else:raise AssertionError('accepted mutant '+name)
            # Field failure alone is insufficient: every mutated source must change a
            # recorded native trajectory, compared without invoking profile assertions.
            changed=[key(r) for r in mutant['motion'] if r['states']!=baseline[key(r)]['states']]
            assert changed,('mutation did not affect a source trajectory',name)
            evidence.append(dict(name=name,changedTrajectories=len(changed),example=changed[0],reason=reason,sha256=hashlib.sha256(mp.read_bytes()).hexdigest()))
            print('rejected',name,len(changed),'trajectories',flush=True)
    if '--mutations' in sys.argv:
        run=subprocess.run([sys.executable,str(HERE/'capture.py')],cwd=ROOT,capture_output=True,timeout=180)
        assert run.returncode==0,(run.stdout+run.stderr).decode(errors='replace')
        fresh=json.loads(path.read_text(encoding='utf-8'));verify(fresh)
        assert digest([report['profiles'],report['motion'],report['environmentInputs'],report['environmentMotion']])==digest([fresh['profiles'],fresh['motion'],fresh['environmentInputs'],fresh['environmentMotion']])
    result=dict(status='passed',counts=counts,sourceMutations=evidence,observationSha256=digest([report['profiles'],report['motion'],report['environmentInputs'],report['environmentMotion']]),
        inputSources=report['sources'],inputMethods=report['methods'],limits='Original fixed-action constructor-profile fixture. Not full scene/AI/body/death/reward or modern acceptance.')
    (OUT/'verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({k:result[k] for k in ['status','counts','limits']},ensure_ascii=False))

if __name__=='__main__':main()
