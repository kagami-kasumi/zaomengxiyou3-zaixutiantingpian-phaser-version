"""Independent phase contract, static native poses and actual CHECK joins."""
import copy
import hashlib
import itertools
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'docs/tasks/evidence/TASK-SETTINGS-257A'
MODES = ['normal','lethal','pause','destroy-after','hurt-after','reject']


def read(path):
    return json.loads(path.read_text(encoding='utf-8'))


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def compare_tree(expected, actual, root=False):
    for key in ['type','bounds','alpha','visible','blendMode','frame','totalFrames']:
        assert expected.get(key) == actual.get(key), (key,expected.get(key),actual.get(key))
    if not root:
        assert expected['matrix'] == actual['matrix']
    assert not actual['maskPresent'] and not actual['filters'] and not expected['filters']
    assert len(expected['children']) == len(actual['children'])
    for a,b in zip(expected['children'],actual['children']):
        compare_tree(a,b)


def verify(data, poses):
    rows = data['rows']
    domain = list(itertools.product([20,24,30],['hit1','hit2'],MODES,[0,1],range(1,49),['before-world','after-world','exit']))
    keys = [(r['fps'],r['attack'],r['scenario'],r['direction'],r['tick'],r['phase']) for r in rows]
    assert len(keys) == len(set(keys)) == len(domain) == 10368 and set(keys) == set(domain)
    index = dict(zip(keys,rows))
    checks, bindings, state_bindings = [], [], []
    pose_count, raw_removed = 0, 0
    for fps,action,mode,direction in itertools.product([20,24,30],['hit1','hit2'],MODES,[0,1]):
        birth = 5 if action == 'hit1' else 7
        births = [5] if mode in ['lethal','destroy-after','hurt-after'] else [5,23 if mode == 'pause' else 20]
        if action == 'hit2':
            births = []
        for tick in range(1,49):
            for phase in ['before-world','after-world','exit']:
                row = index[fps,action,mode,direction,tick,phase]
                expected = []
                for i,b in enumerate(births):
                    if tick < b or (tick == b and phase == 'before-world'):
                        continue
                    total = 14 if i == 0 else 20
                    end = b + total + (3 if mode == 'pause' and i == 0 else 0)
                    killed = mode == 'destroy-after' and tick >= 6
                    ended = killed or tick > end or (tick == end and phase != 'before-world')
                    held = min(3,max(0,tick-7)) if mode == 'pause' and i == 0 else 0
                    frame = 0 if ended else max(1,tick-b-held)
                    state = dict(uid=i+1,frame=frame,total=0 if ended else total,ready=ended,parentPresent=not ended)
                    expected.append(state)
                    if phase == 'before-world' and tick > b and not ended and not(mode == 'pause' and 7 <= tick <= 9):
                        checks.append(dict(tick=tick,phase=state))
                        bindings.append(dict(checkIndex=len(checks)-1,fps=fps,action=action,scenario=mode,direction=direction,tick=tick,uid=i+1,
                                             stateId=f'attack{i+1}-f{frame}-s{1 if direction==0 else -1}'))
                assert row['bullets'] == expected, (fps,action,mode,direction,tick,phase,row['bullets'],expected)
                assert len(row['displays']) == len(expected)
                for i,(bullet,display) in enumerate(zip(expected,row['displays'])):
                    if bullet['ready']:
                        assert display is None
                        continue
                    assert display['uid'] == bullet['uid'] and display['parentPresent'] and not display['imgMc1Present']
                    compare_tree(poses[i+1][bullet['frame']],display['tree'])
                    wrapper = display['wrapper']
                    dx,dy = (75,-100) if i==0 else (-90,-35)
                    assert wrapper == dict(a=1 if direction==0 else -1,b=0,c=0,d=1,tx=300+(dx if direction==0 else -dx),ty=200+dy)
                    pose_count += 1
                controls=[]
                if mode=='pause' and tick>=birth+2:controls.append(dict(tick=birth+2,kind='pause',tweens=True,delays=True))
                if mode=='pause' and tick>=birth+5:controls.append(dict(tick=birth+5,kind='resume'))
                assert row['controls']==controls
                attached=[f'attack{i+1}-f{b["frame"]}-s{1 if direction==0 else -1}' for i,b in enumerate(expected) if not b['ready']]
                if mode == 'reject':
                    assert row['hits'] == 0
                if action == 'hit1':
                    assert not row['visuals'] and not row['tweens']
                else:
                    exists = tick >= 7 and not(tick == 7 and phase == 'before-world')
                    assert len(row['visuals']) == int(exists) and row['hits'] == 0
                    if exists:
                        visual = row['visuals'][0]
                        frame = min(14,max(1,tick-7))
                        present = tick < 21 or tick == 21 and phase != 'exit'
                        assert visual['frame'] == frame and visual['total'] == 14
                        assert visual['parentPresent'] == present
                        compare_tree(poses[3][frame],visual['tree'],root=True)
                        assert visual['tree']['matrix'] == dict(a=1 if direction==0 else -1,b=0,c=0,d=1,tx=265 if direction==0 else 335,ty=120)
                        assert row['tweens']==[dict(tick=7,target=who,duration=1,x=300,y=150) for who in ['p1','p2']]
                        if present:attached.append(f'attack3-f{frame}-s{1 if direction==0 else -1}')
                        if tick == 21 and phase == 'exit':
                            assert not visual['playing']
                            raw_removed += 1
                        pose_count += 1
                    else:assert row['tweens']==[]
                state_bindings.append(dict(fps=fps,action=action,scenario=mode,direction=direction,tick=tick,phase=phase,stateIds=attached))
    assert data['checks'] == checks and len(checks) == 780
    assert raw_removed == 36
    return dict(states=10368,checks=len(checks),poseComparisons=pose_count,rawExitRemovals=raw_removed,bindings=bindings,stateBindings=state_bindings)


def main():
    path = OUT / 'phase/phase.json'
    data = read(path)
    work=Path(data['commands'][1][-1])
    assert sha(work/'Probe.swf')==data['swfSha256']
    assert all(sha(work/name)==digest for name,digest in data['generatedHashes'].items())
    assert all(sha(ROOT/source['path'])==source['sha256'] for source in data['sources'])
    assert sha(ROOT/'local-resources/regima/source/restored-swfs/assets/1.swf')==data['restoredSwfSha256']
    assert sha(Path(__file__).with_name('phase.py'))==data['spatialExtension']['toolSha256']
    repeat=read(OUT/'phase/repeat.json')
    assert repeat['rowsEqual'] and repeat['checksEqual'] and repeat['generatedSourcesEqual']
    poses = {a:{t['frame']:t['tree'] for t in read(OUT/f'attack{a}/native.json')['trees']} for a in [1,2,3]}
    result = verify(data,poses)
    rejected = []
    for mutation in ['first-check','raw-early-remove','raw-keep','direction','nested-pose']:
        bad = copy.deepcopy(data)
        if mutation == 'first-check':
            bad['checks'][0]['tick'] -= 1
        elif mutation in ['raw-early-remove','raw-keep']:
            row = next(r for r in bad['rows'] if r['attack']=='hit2' and r['tick']==21 and r['phase']==('before-world' if mutation=='raw-early-remove' else 'exit'))
            row['visuals'][0]['parentPresent'] = mutation == 'raw-keep'
        else:
            row = next(r for r in bad['rows'] if any(r['displays']))
            obj = next(o for o in row['displays'] if o)
            if mutation == 'direction':obj['wrapper']['a'] *= -1
            else:obj['tree']['children'] = []
        try:
            verify(bad,poses)
        except AssertionError:
            rejected.append(mutation)
        else:
            raise AssertionError('Accepted corruption: '+mutation)
    native_mutations=[]
    for name in ['pause-raw','raw-no-remove']:
        mutant=read(OUT/f'phase/phase-{name}.json')
        assert len(mutant['rows'])==10368 and mutant['runtime']=='AIR 51.1.1.5'
        try:verify(mutant,poses)
        except AssertionError:native_mutations.append(name)
        else:raise AssertionError('Native mutation accepted: '+name)
    result.update(nativeMutationsRejected=native_mutations,repeat=repeat,status='passed',phaseSource=path.relative_to(ROOT).as_posix(),phaseSha256=sha(path),corruptionsRejected=rejected,
                  limitations='Actual source CHECK entry joined to all-frame direct HitTest input; original HP reception and Tween interpolation remain outside this task.')
    (OUT / 'phase-binding.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({k:v for k,v in result.items() if k not in ['bindings','stateBindings','limitations']}))


if __name__ == '__main__':
    main()
