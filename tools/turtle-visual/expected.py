"""Freeze visual state keys from source rows and the task's finite fixture contract."""
import hashlib
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-222A'


def main():
    bodies=json.loads((OUT/'body-inputs.json').read_text(encoding='utf-8'))
    located=json.loads((ROOT/'docs/tasks/evidence/TASK-SETTINGS-221/visual-inputs.json').read_text(encoding='utf-8'))
    states=[];dynamic=[];buff=[]
    for form in bodies['forms']:
        for row in form['rows']:
            for cell in row['cells']:
                for direct in (0,1):
                    for owner in ('P1','P2'):states.append(f"body:turtle{form['form']}-r{row['row']}-c{cell['column']}-d{direct}-{owner}")
    for source in located['sources']:
        for symbol in source['symbols']:
            if 'Bmd' in symbol:continue
            for tick in range(122):
                for scale in ([1,2] if symbol=='PetTurtle3Bullet3' else [1]):
                    for sign in (1,-1):states.append(f'effect:{symbol}:{tick}:s{scale}:d{sign}')
    for owner in (1,2):
        for form in range(1,5):
            for kind in ['normal','sld']+(['linked'] if form>=2 else [])+(['sybh'] if form>=3 else []):dynamic.append(f'{kind}-{form}-{owner}-7')
        dynamic.extend(f'aoyi-4-{owner}-{mask}' for mask in range(8))
        dynamic.extend(f'{kind}-4-{owner}-7' for kind in ['rest','dead','destroy'])
        for form in range(2,5):buff.extend(f'{kind}-{form}-{owner}-7' for kind in ['buff','buffrefresh'])
    for case in dynamic:states.extend(f'dynamic:{case}:{tick}' for tick in range(122))
    for case in buff:states.extend(f'buff:{case}:{tick}' for tick in range(242))
    assert len(states)==len(set(states))==11572
    report=dict(status='expected-only',basis='Original initBBDC rows/cells; 221 restored symbol scope; 222A finite two-owner fixtures. No native measurement is read by this generator.',
                inputs=[dict(path=p.relative_to(ROOT).as_posix(),sha256=hashlib.sha256(p.read_bytes()).hexdigest()) for p in [OUT/'body-inputs.json',ROOT/'docs/tasks/evidence/TASK-SETTINGS-221/visual-inputs.json',OUT/'task-contract.md']],
                expectedStateIds=sorted(states),dynamicCases=dynamic,buffCases=buff,stage=[940,590],nativeFrameRate=24,
                sourceFrameBudgets=[dict(frameClips=fps,sybhAoyiLifetimeTicks=5*fps,txljFixtureDurationTicks=7*fps,delayedSeconds=[0,2,4,5]) for fps in (20,24,30)],
                boundaries=['20/30 values are source formula derivations; native profile is24.','Controlled target/HP/skill/clock services; shared hero/HUD/damage-number/hit-spark rendering and combat collision are outside the 13-symbol scope.','Delayed-call scheduling uses explicit elapsed seconds. Source protection countdown and target-buff lifecycle follow original BaseObject/BBDC ordering.'])
    (OUT/'expected-visual-states.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8',newline='\n')
    print('222A independent expected visual states:',len(states))


if __name__=='__main__':main()
