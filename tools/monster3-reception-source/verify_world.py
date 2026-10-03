"""Independent expected finite bullet-to-receiver sequences (no generated code import)."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
WORK=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-251/baseline'

def expected(owner,boss,attack,mode):
 interval=999 if attack==1 else 4
 frames=1001 if attack==1 else 7
 hero_hp=pet_hp=1000;hero_ids=[];pet_ids=[];remaining=99;hit=0
 hf=pf=-1;steps=[]
 for frame in range(1,frames+1):
  attack_id='attack-'+str(1+(frame-1)//interval)
  rolls=1 if mode=='difficulty2' else 0
  rejected=(frame==1 and mode in ['protected-retry','geometry-retry']) or (frame>1 and mode=='difficulty2')
  if not rejected:
   if attack_id not in hero_ids:
    if mode=='flower':hit=hit/2+(3 if boss else 0)
    if mode=='difficulty2':hero_hp=0;hf=30;hero_ids.append(attack_id);rolls+=4
    else:
     damage=0 if mode=='dodge' else int((40 if attack==1 else 18)*(0.925 if mode=='flower' else 1))
     hero_hp-=damage*(2 if mode=='order' else 1);hero_ids.extend([attack_id,attack_id]);rolls+=4 if mode=='dodge' else 6
    remaining-=1
   if attack_id not in pet_ids:
    if mode=='flower':hit=hit/2+(3 if boss else 0)
    if mode=='difficulty2':pet_hp=0;pf=150;rolls+=1
    else:
     damage=0 if mode=='dodge' else int((40 if attack==1 else 18)*(0.925 if mode=='flower' else 1))
     pet_hp-=damage;pet_ids.extend([attack_id]* (2 if mode=='dodge' else 1));remaining-=1;rolls+=1 if mode=='dodge' else 3
  if frame<=3 or frame>=frames-2:
   steps.append(dict(frame=frame,heroHp=hero_hp,petHp=pet_hp,heroIds=hero_ids.copy(),petIds=pet_ids.copy(),id=attack_id,
    interval=interval,count=(frame-1)%interval+1,max=remaining,random=([0.9,0.9,0.1]+[0.9]*6 if mode=='order' and rolls else [0.9]*rolls),sourceHit=hit,heroFather=hf,petFather=pf))
 return dict(id=f'{owner}-{int(boss)}-{attack}-{mode}',owner=owner,boss=boss,attack=attack,mode=mode,setup=[0.9]*3,steps=steps)

def verify(rows):
 wants=[expected(o,b,a,m) for o in ['p1','p2'] for b in [False,True] for a in [1,2]
  for m in ['normal','protected-retry','geometry-retry','dodge','difficulty1','difficulty2','flower','order']]
 assert len(rows)==len(wants)==64
 for actual,want in zip(rows,wants):
  assert actual==want,(want['id'],[(a,b) for a,b in zip(actual['steps'],want['steps']) if a!=b][:1])
 return len(rows)
if __name__=='__main__':print('world sequences verified:',verify(json.loads((WORK/'world.json').read_text())))
