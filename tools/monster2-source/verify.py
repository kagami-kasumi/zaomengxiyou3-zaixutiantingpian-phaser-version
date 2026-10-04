"""Independent 256 acceptance: finite expected schedules, not AS3 algorithm translation."""
import copy,hashlib,itertools,json,subprocess,sys
from pathlib import Path
sys.dont_write_bytecode = True
ROOT=Path(__file__).resolve().parents[2]
HERE=Path(__file__).resolve().parent
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-256'
REF=ROOT/'docs/reverse-engineering/reference/monster2-body-attack-contract.json'
NAMES=['natural','lethal-emission','nonlethal-emission','hurt-after','dead-after','destroy-after','frozen-before','thaw','freeze-emission','pause-after','redraw','low-level-pause','dead-before','destroy-before','hurt-cut','repeat-action','hurt-before','target-reject']
MUTATIONS=['effects-first','display-only','death-clears','repeat-spawn','destroy-keeps','same-tick-hit','wrong-offset','wrong-direction','tween-duration','tween-target']
FACTS={'hit1':{'bodyHolds':[2,2,15,16],'births':[5,20],'symbols':['Monster2Bullet1_1','Monster2Bullet1_2'],'frames':[14,20],'offsets':[[75,-100],[-90,-35]],'interval':999},'hit2':{'bodyHolds':[2,2,2,14],'births':[7],'symbol':'Monster2Bullet2','frames':14,'offset':[-35,-80],'tweenSeconds':1,'target':'all gc.getPlayerArray heroes'}}
def load(name):return json.loads((OUT/name).read_text(encoding='utf-8'))
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def require(ok,label,*context):
 if not ok:raise AssertionError((label,)+context)
def provenance(r):
 require(r['runtime']=='AIR 51.1.1.5','runtime')
 work=Path(r['commands'][1][-1]);require(digest(work/'Probe.swf')==r['swfSha256'],'compiled fixture hash')
 for name,sha in r['generatedHashes'].items():require(digest(work/name)==sha,'fixture hash',name)
 for src in r['sources']:require(digest(ROOT/src['path'])==src['sha256'],'source hash',src['path'])
 require(digest(ROOT/'local-resources/regima/source/restored-swfs/assets/1.swf')==r['restoredSwfSha256'],'restored source hash')
 require(digest(HERE.parent/'monster-body-order-source/capture.py')==r['harnessSha256'],'service harness hash')
 require(not any('Monster20.as' in s['path'] for s in r['sources']),'wrong source provenance')
 required={'Monster2.as':{'Monster2','initBBDC','setAction','doHi1_1','doHi1_2','doHi2','enterFrameFunc','destroy'},'SpecialEffectBullet.as':{'step'}}
 for filename,methods in required.items():require(methods<={s['method'] for s in r['sources'] if s['path'].endswith('/'+filename)},'missing source methods',filename)

def verify(r):
 provenance(r)
 rows=r['rows'];domain=set(itertools.product([20,24,30],['hit1','hit2'],[0,1],['p1','p2','both'],NAMES))
 require(len(rows)==648 and {(x['fps'],x['attack'],x['direct'],x['owner'],x['scenario']) for x in rows}==domain,'domain')
 for row in rows:
  action=row['attack'];n=row['scenario'];b=5 if action=='hit1' else 7;key=(action,n,row['direct'],row['owner'],row['fps'])
  absent=n in ['frozen-before','dead-before','destroy-before','hurt-before']
  births=[] if absent else [b+(2 if n=='thaw' else 0)]
  if action=='hit1' and not absent and n not in ['lethal-emission','hurt-after','dead-after','destroy-after','freeze-emission','hurt-cut']:
   births.append(20+(2 if n=='thaw' else 3 if n=='pause-after' else 0))
  if n=='repeat-action':births += [44,59] if action=='hit1' else [46]
  death=17 if n=='dead-before' else b+17 if n in ['lethal-emission','dead-after'] else 1 if n=='destroy-before' else b+1 if n=='destroy-after' else None
  ends=[]
  for i,birth in enumerate(births):
   total=14 if i%2==0 else 20
   end=birth+total-1+(3 if n in ['pause-after','low-level-pause'] and birth==b else 0)
   if n in ['destroy-after','hurt-cut']:end=b+1
   if death is not None:end=min(end,death)
   ends.append(end)
  targets=[x for who in (['p1','p2'] if row['owner']=='both' else [row['owner']]) for x in [who,who+'-pet']]
  attempts=[];events=[]
  if action=='hit1':
   for uid,(birth,end) in enumerate(zip(births,ends),1):
    ticks=[t for t in range(birth+1,end+1) if not(n in ['pause-after','low-level-pause'] and b+2<=t<=b+4)]
    if n=='destroy-after':ticks=[]
    called=ticks if n=='target-reject' else ticks[:1]
    dx,dy=FACTS['hit1']['offsets'][(uid-1)%2];x=300+birth-1+dx*(1 if row['direct']==0 else -1)
    for t in called:
     for target in targets:
      attempts.append(dict(tick=t,uid=uid,target=target))
      if n!='target-reject':events.append(dict(tick=t,uid=uid,target=target,x=x,y=200+dy,sourceDead=n in ['lethal-emission','dead-after']))
  require(row['attempts']==attempts,'target query schedule',key)
  require([{k:h[k] for k in ['tick','uid','target','x','y','sourceDead']} for h in row['hits']]==events,'accepted hits',key)
  require(len(row['states'])==70,'states',key)
  for t,s in enumerate(row['states'],1):
   count=sum(t>=birth for birth in births);ready=death is not None and t>=death
   require(s['tick']==t and s['ready']==ready and s['worldCount']==int(not ready),'body/world cleanup',key,t)
   require(s['door']==(ready and row['owner']=='p1'),'boss door',key,t)
   require(s['hits']==sum(h['tick']<=t for h in events),'cumulative hits',key,t)
   if action=='hit1':
    require(s['created']==count and len(s['bullets'])==count and not s['visuals'] and not s['tweens'],'objects',key,t)
    require(s['enrolled']==sum(birth<=t<end for birth,end in zip(births,ends)),'enrollment',key,t)
    for i,o in enumerate(s['bullets']):
     birth,end=births[i],ends[i];ended=t>=end;dx,dy=FACTS['hit1']['offsets'][i%2]
     require(o['x']==300+birth-1+dx*(1 if row['direct']==0 else -1) and o['y']==200+dy,'birth root',key,t)
     require(o['action']=='hit1' and o['uid']==i+1 and o['interval']==999,'identity/interval',key,t)
     require(o['scaleX']==(1 if row['direct']==0 else -1),'direction',key,t)
     require(o['ready']==ended and o['parentPresent']==(not ended) and o['sourcePresent']==(not ended),'bullet cleanup',key,t)
     require(o['total']==(0 if ended else 14 if i%2==0 else 20),'native total',key,t)
   else:
    require(s['created']==0 and s['enrolled']==0 and not s['bullets'] and len(s['visuals'])==count,'visual not damage object',key,t)
    tweens=[]
    for birth in births:
     if birth<=t:
      tweens.extend(dict(tick=birth,target=who,duration=1,x=300+birth-1,y=150) for who in (['p1','p2'] if row['owner']=='both' else [row['owner']]))
    require(s['tweens']==tweens,'Tween request/targets',key,t)
    for i,v in enumerate(s['visuals']):
     require(v['parentPresent'] and v['frame']==1,'raw clip has no world clock or source cleanup in synchronous fixture',key,t)
     require(v['x']==300+births[i]-1+(-35 if row['direct']==0 else 35) and v['y']==120,'visual root',key,t)
   if n=='frozen-before':require(s['frozen'] and s['bodyFrame']==0,'freeze',key,t)
   if n=='thaw':require(s['frozen']==(t==1),'thaw',key,t)
   if n=='lethal-emission':require(s['hp']==(0 if t>=b else 100),'body before lethal effect',key,t)
 return dict(cases=648,states=45360)

if __name__=='__main__':print(verify(load('source-baseline.json')))
