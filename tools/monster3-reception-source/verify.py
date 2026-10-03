"""Independent bounded receiver oracle; no import of capture/generated AS3."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-251'
WORK=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-251/baseline'

def expected(f):
 hero=f['name'].startswith('Role')
 out=dict(id=f['id'],accepted=False,hp=f['hp'],random=[],action=f['action'],ids=[],missed=False,
  destroyed=False,sourceHit=f['sourceHit'],father=-1,skill1=False,skill2=False,skill3=False,lifetime=None if hero else 10,
  linkHp=f['linkHp'] if hero and f['link'] else None,shield=f['shield'] if hero and f['shield'] else None)
 if f['protected'] or (hero and f['protectionKind']) or not f['geometry']:return out
 hit=(f['sourceHit']/2+(3 if f['boss'] else 0)) if f['flower'] else f['sourceHit']+(6 if f['boss'] else 0)
 out['sourceHit']=hit if f['flower'] else f['sourceHit']
 rolls=f['rolls'] or [f['roll']]*6
 offset=1 if not hero and f['rabbit'] and f['name'].startswith('PetRabbit') else 0
 rabbit=offset and rolls[0]<0.1+int(f['name'][-1])*0.1
 threshold=(f['miss']-hit)/100 if hero else f['petMiss']-hit/100
 dodge=(rolls[offset]<=threshold if hero else rolls[offset]<threshold) or rabbit
 out['accepted']=True
 if dodge:
  out.update(random=rolls[:offset+1],ids=['attack-1'],missed=True)
  return out
 out['random']=rolls[:offset+3]
 critical_roll=rolls[offset+(2 if hero else 1)]
 power=(40 if f['attack']==1 else 18)*(2 if critical_roll<=f['critical']/100 else 1)*(0.925 if f['flower'] else 1)
 damage=int(power)
 if f['attack']==1:damage=max(1,damage-f['defense'])
 elif hero:
  md=f['magicDefense']/100-f['reduceMagic']
  damage=1 if md>=1 else int(damage*min(1.1,1-md))
 else:
  md=f['petMagicDefense'];damage=int(damage*(1-(0 if md>1 else md)))
 reacts=not(f['gxp'] and (not hero or f['name'] in ['Role1','Role4','Role5']))
 if hero and f['name']=='Role3':
  factor=1-(min(f['sd'],8)*0.01 if f['action']=='hit12' else 0)-(0.125 if f['gxp'] else 0)
  damage=int(damage*factor)
  if f['action']=='hit12':reacts=False
 if hero and f['name']=='Role4' and f['action']=='hit12':reacts=False
 if f['bingo']:
  damage=99000;out['random']=[f['roll']];out['accepted']=hero
 if hero and f['name']=='Role5' and f['action']=='hit10_1':
  damage=int(damage*0.75);reacts=False
 if not hero and f['name'].startswith('PetPhoenix') and f['action']=='hit2':
  damage=int(damage/3);reacts=False
 if hero and f['shield']:
  out['shield']=max(0,f['shield']-damage) or None
  damage=max(0,damage-f['shield'])
  if damage:
   if f['name']=='Role3':damage=int(damage*factor)
   if f['name']=='Role5' and f['action']=='hit10_1':damage=int(damage*0.75)
  if f['shieldKind']=='tjgl_Shield' and f['name'] in ['Role2','Role4'] and out['shield']:reacts=False
 if hero and f['link'] and f['linkBoth']:
  import math
  out['linkHp']=max(0,f['linkHp']-math.ceil(damage*0.05));damage=int(damage*0.95)
 out['hp']=max(0,f['hp']-damage)
 if hero:
  out['ids']=[] if f['bingo'] else ['attack-1']
  if f['bingo']:out['father']=30
  if out['hp']==0:out['destroyed']=True
  elif reacts and damage!=0:out['action']='hurt'
 else:
  if out['hp']==0:out.update(action='dead',father=150,lifetime=9)
  elif reacts:
   out['action']='hurt'
   if f['qlfj'] is not None:
    out['random']=rolls[:offset+4]
    if rolls[offset+3]<=f['qlfj']:out['action']='hit1'
  out['skill1']=f['name'] in ['PetMonkey1','PetHorse2','PetHorse3','PetHorse4']
  out['skill2']=f['name']=='PetMonkey2'
  out['skill3']=f['name'] in ['PetMonkey3','PetMonkey4']
 return out

def main():
 fixtures=json.loads((WORK/'fixtures.json').read_text(encoding='utf-8'))
 data=json.loads((OUT/'baseline.json').read_text(encoding='utf-8'))
 rows=data['rows'];assert len(fixtures)==len(rows)==16960
 assert len({r['id'] for r in rows})==len(rows)
 for f,r in zip(fixtures,rows):
  want=expected(f)
  assert r==want,(f['id'],{k:(want[k],r.get(k)) for k in want if r.get(k)!=want[k]})
 report=dict(status='direct-receiver-domain-passed',cases=len(rows),
  limitations=['Full evidence/repeat/mutation/reference acceptance uses finalize.py.'])
 (OUT/'direct-verification.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
 print(json.dumps(report))
if __name__=='__main__':main()
