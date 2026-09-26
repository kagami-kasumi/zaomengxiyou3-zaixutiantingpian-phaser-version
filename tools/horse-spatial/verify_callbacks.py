"""Horse callback expectations from reviewed source conditions, not observations."""
import copy
import json
from prepare_lifecycle import ROOT,OUT
from run_lifecycle import sha

WORK=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-229/callback-air'
RULES={1:{'hit1':(7,45,-25),'hit2':(7,40,-15)},
       2:{'hit1':(7,70,-90),'hit2':(1,85,-95),'hit3':(5,60,-25)},
       3:{'hit1':(5,150,-140),'hit2':(1,70,-85),'hit3':(5,80,-45),'hit4':(5,55,-50)},
       4:{'hit1':(5,150,-140),'hit2':(1,70,-85),'hit3':(5,80,-45),'hit4':(5,55,-50),'hit5':(5,55,-50)}}

def check(case,inputs):
    rule=RULES[case['form']].get(case['action']);expected=[]
    if rule and case['local']:
        tick,dx,dy=rule
        expected=[(tick,'doH'+case['action'][1:],case['direction'],300+dx*(1 if case['direction'] else -1),350+dy)]
    actual=[(r['tick'],e['name'],e['direction'],e['x'],e['y']) for r in case['rows'] for e in r['events'] if e['kind']=='emit']
    failures=[]
    if actual!=expected:failures.append('emission-host-name-origin-direction')
    if case['action']=='dead' and not case['rows'][-1]['dead']:failures.append('death-callback')
    form=inputs['forms'][case['form']-1];action=next(a for a in form['actions'] if a['action']==case['action'])
    total=form['rows'][action['row']]['totalHostTicks']
    if case['action'].startswith('hit') or case['action']=='hurt':
        if not case['hurt'] and case['rows'][total-1]['action']!='wait':failures.append('completion')
    return failures

def main():
    path=WORK/'measurement.json';data=json.loads(path.read_text());inputs=json.loads((OUT/'body-inputs.json').read_text())
    assert len(data['cases'])==432
    failures=[dict(index=i,fields=check(c,inputs)) for i,c in enumerate(data['cases']) if check(c,inputs)]
    sample=next(c for c in data['cases'] if c['form']==4 and c['action']=='hit5' and c['skills']==7 and not c['hurt'] and not c['noTarget'])
    mutations={}
    for name in ('phase','origin','missing'):
        changed=copy.deepcopy(sample);row=next(r for r in changed['rows'] if any(e['kind']=='emit' for e in r['events']))
        if name=='phase':row['tick']+=1
        if name=='origin':next(e for e in row['events'] if e['kind']=='emit')['x']+=1
        if name=='missing':row['events']=[]
        mutations[name]=bool(check(changed,inputs))
    report=dict(status='failed' if failures else 'passed-bounded',cases=len(data['cases']),failures=failures,mutationsRejected=mutations,measurementSha256=sha(path),bodyInputsSha256=sha(OUT/'body-inputs.json'),
        scope='Original body/action callback execution under controlled host-step calls. 20/24/30 are callback config values here, not native display clocks. Emission event sinks prove names/host ticks/origins/directions and completion; real bullet creation/attachment remains separate.')
    (OUT/'callback-verification.json').write_text(json.dumps(report,indent=2)+'\n')
    print('229 callbacks:',len(data['cases']),'failures',len(failures),failures[:6],'mutants',mutations)
    assert not failures and all(mutations.values())

if __name__=='__main__':main()
