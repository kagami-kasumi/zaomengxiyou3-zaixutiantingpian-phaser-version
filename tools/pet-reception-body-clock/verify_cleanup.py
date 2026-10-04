"""Independent BasePet teardown boundary assertions."""
import json
from pathlib import Path
WORK=Path(__file__).resolve().parents[2]/'local-resources/regima/task-outputs/TASK-SETTINGS-254/cleanup'
def verify(work=WORK):
 rows=json.loads((work/'observations.json').read_text(encoding='utf-8'))
 assert {v['id'] for v in rows}=={f'p{owner}-{mode}' for owner in [1,2] for mode in ['full','empty','detached','repeat']}
 assert len(rows)==8
 for row in rows:
  mode=row['id'].split('-')[1];initial=row['immediate'];last=row['completed']
  assert initial['jobs']==1 and initial['duration']==1 and initial['targetMatches'] and initial['callbackOwnerMatches']
  assert initial['parentNull']==(mode=='detached')
  assert last['parentNull']
  for phase in ['immediate','repeated','completed']:
   state=row[phase]
   for key in ['ready','sourceNull','ownerPetNull','bodyParentNull','bodyCallbacksNull','bodyReferenceRetained','effectNull','protectionCleared','partnerIntact']:
    assert state[key],(row['id'],phase,key)
   assert state['bodyData']==0 and state['bulletCount']==0
   assert state['effectCalls']==(0 if mode=='empty' else 1)
   assert state['bulletCallbacks']==(0 if mode=='empty' else 2)
   assert len(state['bullets'])==(0 if mode=='empty' else 2)
   assert all(all(b.values()) for b in state['bullets'])
 report=dict(status='passed',cases=8,scope='original destroy/clearPet/body/bullet/property methods; tween callback explicitly completed, no interpolation timing claim')
 (work/'verification.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
 return report
if __name__=='__main__':print(verify())
