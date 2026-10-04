"""Independent pause, repeated reception and protection assertions."""
import json

def verify(work):
 baseline={v['id']:v for v in json.loads((work/'observations.json').read_text(encoding='utf-8'))}
 paused=json.loads((work/'lifecycle.json').read_text(encoding='utf-8'))
 assert len(paused)==228 and len({v['id'] for v in paused})==228
 for case in paused:
  base=baseline[case['baseId']]['states'];states=case['states']
  death=':dead:' in case['baseId']
  delay=0 if death and case['mode']=='pause-before-entry' else 3
  assert len(states)==len(base)+delay,case['id']
  for state in states:
   tick=state['tick']
   expected_tick=tick if not delay else max(0,tick-3) if case['mode']=='pause-before-entry' else tick if tick<=2 else 2 if tick<=5 else tick-3
   assert {k:v for k,v in state.items() if k!='tick'}=={k:v for k,v in base[expected_tick].items() if k!='tick'},(case['id'],tick)
 receptions=json.loads((work/'receptions.json').read_text(encoding='utf-8'))
 assert len(receptions)==114 and len({v['id'] for v in receptions})==114
 for case in receptions:
  name,_,_,action,rate=case['id'].split(':');fps=int(rate);states=case['states'];first,last=states[0],states[-1]
  if action=='dead':
   assert first['hp']==0 and first['lifetime']==4 and first['protection']==fps*5 and first['isProtected']
   assert last['tick']==baseline[case['id']]['states'][-1]['tick'] and last['dead']
   # Destruction is a sink in this probe. Assert only the pre-destroy trace;
   # the sink's remaining protection is not a claim about real destroy().
   for state in states[:-1]:
    assert state['protection']==fps*5-state['tick'] and state['isProtected'] and state['lifetime']==4
  else:
   assert first['hp']==99 and last['hp']==98 and last['lifetime']==5
   assert last['tick']==(13 if name.startswith('phoenix') else 10)
   assert last['action']=='wait' and last['statics']==1
   assert states[3]['x']==0 and states[3]['key']==states[2]['key']
   assert states[3]['hold']==(1 if name.startswith('phoenix') else 7)
 protections=json.loads((work/'protection.json').read_text(encoding='utf-8'))
 assert {v['fps'] for v in protections}=={20,24,30}
 for case in protections:
  ticks=case['fps']*5;states=case['states']
  assert len(states)==ticks+2
  for state in states:
   assert state['count']==max(-1,ticks-state['tick'])
   assert state['isProtected']==(state['tick']<=ticks)
 guards=json.loads((work/'guard-receptions.json').read_text(encoding='utf-8'))
 assert len(guards)==24 and len({g['id'] for g in guards})==24
 for case in guards:
  form,_,action,rate=case['id'].split(':');before,after=case['before'],case['after']
  if action=='hurt':
   assert before['hp']==100 and after['hp']==99
   for field in ['action','state','x','y','hold','key','lifetime','cleanup']:
    assert before[field]==after[field],(case['id'],field)
   assert after['action']=='hit2'
  else:
   assert after['action']=='dead' and after['hp']==0 and after['lifetime']==4
   assert after['protection']==int(rate)*5 and after['isProtected']
 return dict(guardReceptionCases=24,pauseCases=228,receptionCases=114,protectionClocks=3,scope='manual source host steps, no counter skill/network/real destruction or visuals')
