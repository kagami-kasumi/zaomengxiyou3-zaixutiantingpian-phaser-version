"""Independent bounded assertions; not full 254 or visual acceptance."""
import json
from pathlib import Path
HERE=Path(__file__).resolve().parent
WORK=HERE.parents[1]/'local-resources/regima/task-outputs/TASK-SETTINGS-254/clock'
def verify(work=WORK):
 fixtures=json.loads((work/'fixtures.json').read_text(encoding='utf-8'))
 observations=json.loads((work/'observations.json').read_text(encoding='utf-8'))
 actual={v['id']:v for v in observations}
 assert len(actual)==len(observations)==len(fixtures)==2910
 assert set(actual)=={v['id'] for v in fixtures}
 # Freeze source-independent boundary expectations before any source mutations.
 # Every form's entry from wait row 0/cell 0, plus Phoenix special guards.
 species={'ufo':3,'tigress':4,'phoenix':4,'rabbit':4,'mouse':4}
 checks=0
 for family,count in species.items():
  for form in range(1,count+1):
   name=f'{family}{form}'
   for fps in [20,24,30]:
    for action in ['hurt','dead']:
     v=actual[f'{name}:0:0:{action}:{fps}'];states=v['states'];last=states[-1]
     ticks=(15 if family=='phoenix' else 8) if action=='hurt' else (10 if family=='ufo' else 8 if name=='tigress1' else 18)
     assert not v['ignored']
     assert last['tick']==ticks,(name,action,ticks,last)
     assert last['dead']==(action=='dead')
     assert last['action']==('wait' if action=='hurt' else 'dead')
     assert last['statics']==(1 if action=='hurt' else 0)
     assert all(s['action']==action and not s['dead'] for s in states[:-1])
     checks+=1
    if family=='phoenix':
     v=actual[f'{name}:0:1:hurt:{fps}'];states=v['states']
     assert states[0]['x']==0 and states[0]['y']==(1 if form==1 else 2)
     assert states[-1]['tick']==8 and states[-1]['action']=='wait'
     v=actual[f'{name}:hit2:hurt:{fps}']
     assert v['ignored'] and len(v['states'])==1 and v['states'][0]['action']=='hit2'
     checks+=2
 for c in fixtures:
  v=actual[c['id']];states=v['states']
  assert [s['tick'] for s in states]==list(range(len(states)))
  assert v['ignored'] or states[-1]['dead'] or states[-1]['action']=='wait',c['id']
  # fps here is host-tick interpretation; the probe steps manually. These
  # equal traces do not prove a real-time scheduler or BaseObject protection.
  if c['fps']!=30:
   other=actual[c['id'].rsplit(':',1)[0]+':30']
   assert states==other['states'] and v['ignored']==other['ignored']
 report=dict(status='passed',scope='38 canonical entry/end boundaries and Phoenix guards; all input terminal/label invariants; no full owner or visual claim',cases=len(fixtures),states=sum(len(v['states']) for v in observations),boundaryChecks=checks)
 from verify_lifecycle import verify as verify_lifecycle
 report['lifecycle']=verify_lifecycle(work)
 (work/'verification.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
 return report
if __name__=='__main__':print(verify())
