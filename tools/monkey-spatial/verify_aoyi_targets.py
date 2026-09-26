"""Independent target-array, strict-boundary, random-index and teleport expectations."""
import copy
import hashlib
import json
import math
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
BASE=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-228'
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-228'


def check(data):
    failures=[]
    for case in data['cases']:
        mode=case['mode'];targets=copy.deepcopy(data['fixtures']['targets']);by_id={t['id']:t for t in targets}
        target=None;x=300;y=350;draws=0;cancelled=False
        for row in case['rows']:
            tick=row['tick'];scene_x=940 if tick>=32 and mode=='scene-flip' else 10 if tick>=32 and mode=='scene-shift' else 0
            scale=-1 if tick>=32 and mode=='scene-flip' else 1
            current=[] if mode=='empty-reenter' and 32<=tick<58 else targets[::-1] if mode=='reorder' and tick>=32 else targets
            available=[];expected_members=[]
            for t in current:
                tx=t['x']+(80 if t['id']=='A' and tick>=32 and mode in ('enter','leave-enter') else 0)+(1000 if t['id']=='B' and tick>=32 and mode=='leave-enter' else 0)
                bounds=[scene_x+scale*(tx+v*t['scaleX']) for v in t['localBounds']]
                # Native getBounds reports twips; this is coordinate quantization, not a hit tolerance.
                left=math.floor(min(bounds)*20+.5)/20;right=math.floor(max(bounds)*20+.5)/20
                expected_members.append(dict(id=t['id'],x=tx,y=t['y'],dead=mode=='dead-first' and t['id']=='B',left=left,width=right-left))
                if 20<left<920:available.append((t,tx))
            actual_members=row['candidates']
            if len(actual_members)!=len(expected_members):failures.append((mode,tick,'member count'))
            for actual,expected in zip(actual_members,expected_members):
                if any(not math.isclose(actual[k],v,abs_tol=1e-8) if isinstance(v,(int,float)) and not isinstance(v,bool) else actual[k]!=v for k,v in expected.items()):
                    failures.append((mode,tick,'native bounds/member',actual,expected))
            selecting=tick in (6,32,58,84,110) and not cancelled
            before=draws
            if selecting:
                if available:
                    selected,tx=available[math.floor(case['choose']*len(available))]
                    target=selected['id'];x=tx+(-50 if case['side']<.5 else 50);y=selected['y']-30;draws+=2
                else:x=300;y=300;cancelled=True
            action='wait' if tick==140 or cancelled else 'hit2' if tick==110 else 'hit4'
            expected=dict(target=target,x=x,y=y,action=action,randomBefore=before,randomAfter=draws,mp=990)
            for k,v in expected.items():
                matches=math.isclose(row[k],v,abs_tol=1e-8) if isinstance(v,(int,float)) else row[k]==v
                if not matches:failures.append((case['fps'],case['owner'],mode,case['choose'],case['side'],tick,k,row[k],v))
        expected_ticks=[6,32,58,140] if mode=='empty-reenter' else [6,32,58,84,110,140]
        if [r['tick'] for r in case['rows']]!=expected_ticks:failures.append((mode,'selection sequence'))
    return failures


def main():
    path=BASE/'aoyi-target-air/measurement.json';data=json.loads(path.read_text());assert len(data['cases'])==672
    failures=check(data)
    assert data['originalMonkeySha256']==data['compiledMonkeySha256']
    mutants={}
    for name in ['inclusive','alive','side','index','clear-target']:
        mutant_path=BASE/('aoyi-target-mutation-'+name)/'measurement.json'
        mutant=json.loads(mutant_path.read_text())
        errors=check(mutant)
        assert len(mutant['cases'])==672 and errors
        assert mutant['originalMonkeySha256']!=mutant['compiledMonkeySha256']
        assert mutant['originalMonkeySha256']==data['originalMonkeySha256']
        mutants[name]=dict(cases=672,differences=len(errors),measurementSha256=hashlib.sha256(mutant_path.read_bytes()).hexdigest(),
                          originalMonkeySha256=mutant['originalMonkeySha256'],compiledMonkeySha256=mutant['compiledMonkeySha256'])
    report=dict(status='failed' if failures else 'passed-bounded',cases=672,failures=failures,
                rejectedSourceMutants=mutants,
                measurementSha256=hashlib.sha256(path.read_bytes()).hexdigest(),
                scope='Original target-selection callback with native collider bounds; emission/settlement and real monster death remain separate contracts.')
    (OUT/'aoyi-target-verification.json').write_text(json.dumps(report,indent=2)+'\n')
    print('228 aoyi targets:',len(data['cases']),'cases;',len(failures),'differences')
    if failures:print(failures[:5]);raise SystemExit(1)


if __name__=='__main__':main()
