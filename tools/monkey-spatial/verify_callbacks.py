"""Hand-reviewed host expectations, independent of observed callback rows."""
import copy
import hashlib
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-228'
MEASURE=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-228/callback-air/measurement.json'


def expected(case):
    form,action=case['form'],case['action']
    if case['skills']>=0:
        if case['noTarget']:return []
        skills=case['skills']
        events=[]
        # Four 6-host teleport stances, each followed by 20-host lj or 12-host normal.
        span=26 if skills&4 else 18
        for index in range(4):
            start=index*span+6
            if skills&4:
                events += [(start+t,n) for t in range(1,20,2) for n in ['doHit4_1','doHit4_2']]
            else:events.append((start+5,'doHit1'))
        final=4*span+6
        events.append((final+(1 if skills&1 else 5),'doHit2' if skills&1 else 'doHit1'))
        return [event for event in events if not case['hurt'] or event[0]<9]
    if not case['local']:return []
    if form==1:
        return {'hit1':[(7,'doHit1')],'hit2':[(5,'doHit2')]}.get(action,[])
    if action=='hit1':return [(5,'doHit1')]
    if action=='hit3':return [(1,'doHit3')]
    if form==2 and action=='hit2':return [(t,n) for t in range(1,12,2) for n in ['doHit2_1','doHit2_2']]
    if form>=3 and action=='hit2':return [(1,'doHit2')]
    if form>=3 and action=='hit4':return [(t,n) for t in range(1,20,2) for n in ['doHit4_1','doHit4_2']]
    return []


def check(case):
    actual=[(row['tick'],event['name']) for row in case['rows'] for event in row['events'] if event['kind']=='emit']
    failures=[]
    if actual!=expected(case):failures.append('emission-order')
    if case['skills']>=0:
        if any(name=='doHit3' for _,name in actual):failures.append('overwritten-xj-emitted')
        if case['noTarget'] and (case['rows'][5]['x'],case['rows'][5]['y'],case['rows'][5]['action'])!=(300,300,'wait'):
            failures.append('no-target-return')
        if case['hurt'] and any(row['action']=='hit5' for row in case['rows'][8:]):failures.append('hurt-chain-not-cleared')
    if case['action']=='dead' and not case['rows'][-1]['dead']:failures.append('dead-not-destroyed')
    if case['action']=='hurt' and case['rows'][7]['action']!='wait':failures.append('hurt-completion')
    return failures


def main():
    report=json.loads(MEASURE.read_text())
    failures=[dict(index=i,failures=check(c)) for i,c in enumerate(report['cases']) if check(c)]
    chosen=next(c for c in report['cases'] if c['form']==4 and c['skills']==7 and not c['hurt'] and not c['noTarget'])
    mutants={}
    changed=copy.deepcopy(chosen)
    row=next(r for r in changed['rows'] if any(e['kind']=='emit' for e in r['events']))
    row['tick']+=1
    mutants['host-phase']=bool(check(changed))
    changed=copy.deepcopy(chosen)
    changed['rows'][6]['events'].append(dict(kind='emit',name='doHit3'))
    mutants['xj-action-overwrite']=bool(check(changed))
    changed=copy.deepcopy(chosen)
    row=next(r for r in changed['rows'] if any(e['kind']=='emit' for e in r['events']))
    row['events']=[e for e in row['events'] if e['kind']!='emit']
    mutants['missing-lj-pair']=bool(check(changed))
    result=dict(status='passed-bounded-check' if not failures and all(mutants.values()) else 'failed',cases=len(report['cases']),
                failures=failures,mutationRejected=mutants,measurementSha256=hashlib.sha256(MEASURE.read_bytes()).hexdigest(),
                scope='Exact emitted callback names/order/host ticks, remote suppression, hurt/dead completion and bounded jgaoyi source action overwrite. No bullet settlement, attachment, host display phase or production behavior claim.')
    (OUT/'callback-verification.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
    print(result)
    assert not failures and all(mutants.values())


if __name__=='__main__':main()
