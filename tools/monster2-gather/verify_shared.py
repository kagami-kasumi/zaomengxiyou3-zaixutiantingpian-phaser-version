"""Check independent finite world expectations and native event invariants."""
import sys
sys.dont_write_bytecode = True
import json
from collections import defaultdict
from pathlib import Path
from verify_controlled import q, curve, OUT


MODES = ('still','move','gravity','screen-left','screen-right','wall','pause','overwrite',
         'hero-dead','hero-destroy','source-destroy','scene-exit')


def controlled(rows):
    expected = {(f,o,m,t) for f in (20,24,30) for o in (1,2,3) for m in MODES for t in range(2*f+1)}
    assert len(rows) == len(expected)
    assert {(r['fps'],r['owner'],r['mode'],r['tick']) for r in rows} == expected
    grouped = defaultdict(list)
    for row in rows:
        grouped[row['fps'],row['owner'],row['mode']].append(row)
    failures = []
    for (fps, owner, mode), states in grouped.items():
        states.sort(key=lambda r:r['tick'])
        for slot in ((1,2) if owner==3 else (owner,)):
            x,y = (100,300) if slot==1 else (700,180)
            if mode=='screen-left':x=10
            if mode=='screen-right':x=930
            if mode=='wall':y=260
            vx = (5 if slot==1 else -5) if mode=='move' else 0
            vy = 10 if mode=='wall' else 0
            start = None
            at,resume = fps//4,3*fps//4
            second = None
            for row in states:
                tick=row['tick']
                elapsed=tick/fps-1/fps
                if mode=='pause':
                    elapsed=(min(tick,at)/fps-1/fps) if tick<=resume else tick/fps-(1/fps+(resume/fps-at/fps))
                if tick>=2 and not(mode=='scene-exit' and tick>at):
                    if mode=='overwrite' and tick>at:
                        if tick<=at+fps:x,y=curve(second,[600,150],tick/fps-at/fps)
                    elif elapsed<=1:x,y=curve(start,[400,250],elapsed)
                if mode=='overwrite' and tick==at:second=[x,y]
                paused = mode=='pause' and at<=tick<resume
                removed = mode in ('scene-exit','hero-destroy') and tick>=at
                if not paused and not removed:
                    if mode=='wall' and vy>0 and y+50<=308 and y+vy+50>290 and y+vy-50<320:
                        y=q(290-0.1-50);vy=0
                    x=q(x+vx);y=q(y+vy)
                    if mode=='gravity':vy+=1.5
                    x=min(max(x,20),920)
                if tick==1:start=[x,y]
                actual=next(p for p in row['positions'] if p['slot']==slot)
                fields=dict(x=x,y=y,vx=vx,vy=vy,dead=mode=='hero-dead' and tick>=at,
                            ready=removed,parent=not removed)
                for field,value in fields.items():
                    if isinstance(value,bool):same=actual[field]==value
                    else:same=abs(actual[field]-value)<1e-8
                    if not same:failures.append(dict(key=[fps,owner,mode,tick,slot],field=field,expected=value,actual=actual[field]))
                assert row['paused']==paused
                assert row['sourceReady']==(mode in ('source-destroy','scene-exit') and tick>=at)
                assert row['worldMonsters']==(0 if mode in ('source-destroy','scene-exit') and tick>=at else 1)
                assert row['worldHeroes']==(0 if removed else (2 if owner==3 else 1))
                if mode=='pause' and at<=tick<resume:
                    assert all(t['paused'] and t['time']==states[at]['tweens'][i]['time'] for i,t in enumerate(row['tweens']))
    return failures


def natural(rows):
    groups=defaultdict(list)
    for row in rows:groups[row['fps'],row['owner']].append(row)
    assert set(groups)=={(f,o) for f in (20,24,30) for o in (1,2,3)}
    samples=0
    for (fps,owner), states in groups.items():
        exits=[r for r in states if r['phase']=='exit']
        assert [r['tick'] for r in exits]==list(range(1,4*fps+7))
        assert all(b['time']>=a['time'] for a,b in zip(states,states[1:])), 'Native clock decreased'
        at,resume=fps//4,3*fps//4
        for tick in range(at,resume):
            row=exits[tick-1]
            assert row['paused'] and not row['registered']
            assert row['positions']==exits[at-1]['positions'], 'Pause did not freeze positions'
            assert all(t['paused'] and t['time']==exits[at-1]['tweens'][i]['time'] for i,t in enumerate(row['tweens']))
        for tick in range(4*fps,4*fps+7):
            assert exits[tick-1]['positions']==exits[4*fps-1]['positions'], 'Exit left active tween'
            assert not exits[tick-1]['registered']
            assert exits[tick-1]['worldHeroes']==0 and exits[tick-1]['worldMonsters']==0
        assert exits[2*fps+2-1]['positions'][0]['dead']
        assert exits[2*fps+4-1]['sourceReady']
        assert exits[2*fps+6-1]['positions'][0]['ready']
        slots=(1,2) if owner==3 else (owner,)
        completed=set()
        resumed=0
        initialized=set()
        previous_exit=None
        # Collect one native broadcast between EXITs. Tween callbacks precede world.
        frame=[]
        for row in states:
            if row['phase']=='tween':
                slot=row['sampleSlot']
                track=[t for t in row['tweens'] if t['slot']==slot][-1]
                actual=next(p for p in row['positions'] if p['slot']==slot)
                identity=(slot,track['endX'])
                if identity not in initialized:
                    assert previous_exit is not None
                    old=next(p for p in previous_exit['positions'] if p['slot']==slot)
                    assert all(track['props'][axis]['start']==old[axis] for axis in ('x','y')), 'Lazy initialization start changed'
                    initialized.add(identity)
                assert abs(track['ratio']-(1-(1-track['time'])**2))<1e-12
                for axis in ('x','y'):
                    prop=track['props'][axis]
                    expected=q(prop['start']+prop['change']*(1-(1-track['time'])**2))
                    assert abs(actual[axis]-expected)<1e-8, ('native coordinate',axis,actual,expected)
                if track['time']==1:
                    assert actual['x']==track['endX'] and actual['y']==track['endY']
                    completed.add((slot,track['endX']))
            frame.append(row)
            if row['phase']!='exit':continue
            previous_exit=row
            worlds=[r for r in frame if r['phase']=='world']
            tweens=[r for r in frame if r['phase']=='tween']
            if worlds and tweens:
                assert max(frame.index(r) for r in tweens)<frame.index(worlds[0]), 'World/Tween order changed'
                if resume<row['tick']<2*fps:resumed+=1
                if row['tick']<at:
                    last=tweens[-1]
                    for a,b in zip(last['positions'],worlds[0]['positions']):
                        assert abs(b['x']-a['x']-(5 if a['slot']==1 else -5))<1e-8
                    samples+=1
            frame=[]
        assert resumed>0, 'No post-resume world/Tween order evidence'
        assert completed=={(s,end) for s in slots for end in (400,650)}, ('Missing natural endpoints',fps,owner,completed)
        overwritten=exits[2*fps+2-1]['tweens']
        assert all(t['gc'] for t in overwritten if t['endX']==600), 'Active second request survived third request'
        assert all(t['time']==1 for t in exits[4*fps-2]['tweens'] if t['endX']==650)
    assert samples>=9
    return samples


def main():
    report=json.loads((OUT/'shared.json').read_text(encoding='utf-8'))
    failures=controlled([r for r in report['rows'] if not r['native']])
    (OUT/'shared-differences.json').write_text(json.dumps(failures,indent=2)+'\n')
    print(json.dumps(dict(differences=len(failures),first=failures[:5])))
    assert not failures
    print(json.dumps(dict(nativeOrderMovementSamples=natural([r for r in report['rows'] if r['native']]))))


if __name__=='__main__':main()
