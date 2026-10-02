"""Independent 247 acceptance: finite expected schedules, not AS3 algorithm translation."""
import copy,hashlib,itertools,json,subprocess,sys
from pathlib import Path
sys.dont_write_bytecode = True
ROOT=Path(__file__).resolve().parents[2]
HERE=Path(__file__).resolve().parent
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-247'
REF=ROOT/'docs/reverse-engineering/reference/monster3-body-attack-contract.json'
NAMES=['natural','lethal-emission','nonlethal-emission','hurt-after','dead-after','destroy-after','frozen-before','thaw','freeze-emission','pause-after','redraw','low-level-pause','dead-before','destroy-before','hurt-cut','repeat-action','hurt-before','target-reject']
MUTATIONS=['effects-first','display-only','death-clears','repeat-spawn','destroy-keeps','same-tick-hit','wrong-offset','wrong-direction','wrong-interval']
# Independent static derivation: sum pre-emission holds; restored tags supply 5/10 frame totals.
FACTS={'hit1':dict(birthTick=7,totalFrames=5,offsetX=105,offsetY=-60,interval=999,bodyHolds=[2,2,2,1,1,7],bodyRow=4),
       'hit2':dict(birthTick=6,totalFrames=10,offsetX=155,offsetY=-30,interval=4,bodyHolds=[2,2,1,26],bodyRow=5)}
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
 require(not any('Monster30.as' in s['path'] for s in r['sources']),'wrong source provenance')
 required={'Monster3.as':{'Monster3','initBBDC','setAction','doHi1','doHi2','enterFrameFunc','destroy'},'SpecialEffectBullet.as':{'step'}}
 for filename,methods in required.items():require(methods<={s['method'] for s in r['sources'] if s['path'].endswith('/'+filename)},'missing source methods',filename)
def verify(r):
 provenance(r)
 rows=r['rows'];expected=set(itertools.product([20,24,30],['hit1','hit2'],[0,1],['p1','p2','both'],NAMES))
 require(len(rows)==648 and {(x['fps'],x['attack'],x['direct'],x['owner'],x['scenario']) for x in rows}==expected,'case domain')
 for row in rows:
  action=row['attack'];n=row['scenario'];f=FACTS[action];b=f['birthTick'];key=(action,n,row['direct'],row['owner'],row['fps'])
  absent=n in ['frozen-before','dead-before','destroy-before','hurt-before'];births=[] if absent else [b+(2 if n=='thaw' else 0)]
  if n=='repeat-action':births.append(39+b)
  ends=[birth+f['totalFrames']-1+(3 if n in ['pause-after','low-level-pause'] else 0) for birth in births]
  if n in ['destroy-after','hurt-cut']:ends=[b+1]
  owners=['p1','p2'] if row['owner']=='both' else [row['owner']]
  targets=[v for owner in owners for v in [owner,owner+'-pet']]
  events=[];attempts=[]
  for uid,(birth,end) in enumerate(zip(births,ends),1):
   ticks=list(range(birth+1,end+1))
   if n in ['pause-after','low-level-pause']:ticks=[t for t in ticks if not b+2<=t<=b+4]
   if n=='destroy-after':ticks=[]
   accepted=ticks[::f['interval']] if n!='target-reject' else []
   called=ticks if n=='target-reject' else accepted
   for t in called:
    attempts.extend(dict(tick=t,uid=uid,target=target) for target in targets)
   for t in accepted:
    for target in targets:events.append(dict(tick=t,uid=uid,target=target,sourceDead=n in ['lethal-emission','dead-after'],x=300+birth-1+(1 if row['direct'] else -1)*f['offsetX'],y=200+f['offsetY']))
  require(row['attempts']==attempts,'attempts / rejected target / dedup',key)
  actual=[{k:h[k] for k in ['tick','uid','target','sourceDead','x','y']} for h in row['hits']]
  require(actual==events,'hit schedule / owner / source death',key)
  states=row['states'];require(len(states)==70 and [s['tick'] for s in states]==list(range(1,71)),'tick domain',key)
  death=15 if n=='dead-before' else (b+15 if n in ['lethal-emission','dead-after'] else (1 if n=='destroy-before' else b+1 if n=='destroy-after' else None))
  for s in states:
   t=s['tick'];created=sum(t>=birth for birth in births);ready=death is not None and t>=death
   require(s['created']==created and len(s['bullets'])==created,'single callback / enrollment',key,t)
   require(s['enrolled']==sum(birth<=t<end for birth,end in zip(births,ends)),'array cleanup',key,t)
   require(s['hits']==sum(h['tick']<=t for h in events),'cumulative hits',key,t)
   require(s['ready']==ready,'body death/destroy',key,t)
   require(s['door']==(ready and row['owner']=='p1'),'boss door',key,t)
   # Source loop checks ready again after body step, then removes the monster in this step.
   removed=ready
   require(s['worldCount']==(0 if removed else 1),'world removal phase',key,t)
   if n=='lethal-emission':require(s['hp']==(0 if t>=b else 100),'lethal body/effect order',key,t)
   if n=='nonlethal-emission':require(s['hp']==(99 if t>=b else 100),'nonlethal effect',key,t)
   if n=='dead-after':require(s['hp']==(0 if t>=b+1 else 100),'external death',key,t)
   if n=='frozen-before':require(s['frozen'] and s['bodyFrame']==0,'frozen body',key,t)
   if n=='freeze-emission':require(s['frozen']==(t>=b),'freeze emission order',key,t)
   if n=='thaw':require(s['frozen']==(t==1),'thaw phase',key,t)
   for i,bullet in enumerate(s['bullets']):
    birth,end=births[i],ends[i];ended=t>=end
    require(bullet['uid']==i+1 and bullet['action']==action,'bullet identity',key,t)
    require(bullet['x']==300+birth-1+(1 if row['direct'] else -1)*f['offsetX'] and bullet['y']==200+f['offsetY'],'stationary birth root',key,t)
    require(bullet['scaleX']==(1 if row['direct']==0 else -1),'direction mirror',key,t)
    require(bullet['interval']==f['interval'],'repeat interval',key,t)
    require(bullet['ready']==ended and bullet['parentPresent']==(not ended) and bullet['sourcePresent']==(not ended),'bullet destroy references',key,t)
    require(bullet['total']==(0 if ended else f['totalFrames']),'restored clip total',key,t)
  if n=='pause-after':require(all(states[t-1]['hold']==states[b]['hold'] for t in range(b+2,b+5)),'world pause body',key)
  if n=='low-level-pause':require(states[b+3]['hold']!=states[b]['hold'],'low level not body pause',key)
 return 45360

def reference(base,timeline):
 sourceRoot=ROOT/'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts'
 staticFiles=['my/MainGame.as','base/BaseHero.as','base/BasePet.as','export/monster/Monster3.as']
 staticSources=[dict(path=(sourceRoot/p).relative_to(ROOT).as_posix(),sha256=digest(sourceRoot/p)) for p in staticFiles]
 return dict(staticSources=staticSources,schemaVersion=1,contractId='task-settings-247.monster3-body-attack',status='verified-bounded-behavior',
  scope='Monster3 only; controlled original methods, independent restored native clip clock. Geometry/HP/full scene remain unverified.',
  attacks=FACTS,deathBodyHolds=[2,2,2,2,2,5],
  contracts={'M3-01':'body callback before injected target effects; hit1/hit2 independent hold tables',
   'M3-02':'same-parent root plus signed offset, copied once; direction 0 positive scaleX, 1 negative',
   'M3-03':'old bullet loop precedes body; new objects first queried next world step',
   'M3-04':'hit1 interval999, hit2 interval4; hero and own pet per owner, repeat attackId; final-frame query before destroy',
   'M3-05':'HP death/hurt retain independent default bullets; explicit destroy removes parent/source/array; boss opens doors',
   'M3-06':'frozen body suppresses callback; effect-phase thaw enables following body step; emitted bullet remains independent',
   'M3-07':'MainGame pause skips world and stops existing bullet children; continue restarts them. Low-level flag alone does not stop body harness',
   'M3-08':'render refresh does not emit; reenter completed action emits new independent object; target rejection retries without accepting ID'},
  sources=base['sources'],restoredSwfSha256=base['restoredSwfSha256'],identities=timeline['identities'],
  nativePhase=dict(firstDetectionFrame=1,firstDetectionOffsetTicks=1,lastDetectionOffsetTicks={'hit1':5,'hit2':10},birthFrame=1,phaseEvidence='docs/tasks/evidence/TASK-SETTINGS-247/phase.json',note='Explicit-frame source fixture is a separate controlled input; its earlier final frame must not replace native phase.'),
  acceptance=dict(cases=648,states=45360,nativeClockStates=288,nativePhaseStates=1620,actualNativeCheckCalls=135,sourceMutationsRejected=MUTATIONS,reportCorruptionsRejected=4,referenceCorruptionsRejected=4),
  evidence={k:'docs/tasks/evidence/TASK-SETTINGS-247/'+v for k,v in dict(source='source-baseline.json',verification='verification.json',timeline='timeline.json',repeat='repeat.json').items()},
  requiredNextInputs=['Monster3Bullet1/2 full display-list/registration/matrix truth','actual hero/pet colipse pixel-hit oracle bound to verified native phase','both modern consumers actual HP and lifecycle integration'],limitations=base['limitations'])

def verify_reference(candidate,base,timeline):
 require(candidate==reference(base,timeline),'reference differs from independent finite contract')

def main():
 base=load('source-baseline.json');verify(base);timeline=load('timeline.json')
 require(timeline['status']=='verified-bounded-native-clock' and timeline['sourceSha256']==base['restoredSwfSha256'],'native evidence')
 require(len(timeline['rows'])==288,'native domain')
 from verify_phase import verify_phase
 phase=load('phase.json');require(phase['status']=='verified-bounded-native-phase','phase evidence');verify_phase(phase)
 savedRepeat=load('native-repeat.json');require(savedRepeat['status']=='passed','native repeat status')
 for name,data in [('phase',phase),('timeline',timeline)]:
  for field in ['rows']+(['checks'] if name=='phase' else []):
   sha=hashlib.sha256(json.dumps(data[field],sort_keys=True).encode()).hexdigest()
   require(savedRepeat['hashes'][name+'-'+field]==sha,'native repeated observation hash',name,field)
 for fps,attack,mode in itertools.product([20,24,30],['Monster3Bullet1','Monster3Bullet2'],['free','stop-play']):
  group=[x for x in timeline['rows'] if x['fps']==fps and x['symbol']==attack and x['mode']==mode]
  total=5 if attack.endswith('1') else 10
  require(len(group)==24 and all(x['total']==total for x in group),'saved clock domain')
  for i in range(1,24):
   held=mode=='stop-play' and 5<=i<=7
   require(group[i]['frame']==(group[i-1]['frame'] if held else group[i-1]['frame']%total+1),'saved native clock',fps,attack,mode,i)
 rejected=[]
 if '--mutations' in sys.argv:
  for name in MUTATIONS:
   if '--existing' not in sys.argv:
    p=subprocess.run([sys.executable,str(HERE/'capture.py'),name],cwd=ROOT,capture_output=True,timeout=90);require(p.returncode==0,'mutant must compile/run',name,(p.stdout+p.stderr).decode(errors='replace')[-1200:])
   mutant=load('source-'+name+'.json');provenance(mutant)
   require(mutant['rows']!=base['rows'],'mutant must change observation',name)
   try:verify(mutant)
   except AssertionError as error:rejected.append(dict(mutation=name,reason=str(error)))
   else:raise AssertionError('mutant accepted: '+name)
  for name in ['missing-case','missing-tick','birth-coordinate','hit-time']:
   bad=copy.deepcopy(base)
   if name=='missing-case':bad['rows'].pop()
   if name=='missing-tick':bad['rows'][0]['states'].pop()
   if name=='birth-coordinate':bad['rows'][0]['states'][6]['bullets'][0]['x']+=1
   if name=='hit-time':bad['rows'][0]['hits'][0]['tick']+=1
   try:verify(bad)
   except AssertionError:pass
   else:raise AssertionError('report corruption accepted: '+name)
  expected=reference(base,timeline)
  for key in ['birthTick','offsetX','interval','totalFrames']:
   bad=copy.deepcopy(expected);bad['attacks']['hit2'][key]+=1
   try:verify_reference(bad,base,timeline)
   except AssertionError:pass
   else:raise AssertionError('reference corruption accepted: '+key)
  if '--existing' not in sys.argv:
   p=subprocess.run([sys.executable,str(HERE/'capture.py')],cwd=ROOT,capture_output=True,timeout=90);require(p.returncode==0,'repeat run',(p.stdout+p.stderr).decode(errors='replace')[-1200:])
  repeated=load('source-baseline.json');verify(repeated);require(base['rows']==repeated['rows'],'stable repeated source rows')
  repeat=dict(status='passed',cases=648,states=45360,rowsSha256=hashlib.sha256(json.dumps(base['rows'],sort_keys=True).encode()).hexdigest())
  if '--existing' in sys.argv:require(load('repeat.json')==repeat,'saved independent repeat evidence')
  else:(OUT/'repeat.json').write_text(json.dumps(repeat,indent=2)+'\n',encoding='utf-8')
  verify_reference(expected,base,timeline)
  REF.write_text(json.dumps(expected,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
  summary=dict(status='passed-bounded-source-contract',cases=648,states=45360,nativeClockStates=288,nativePhaseStates=1620,actualNativeCheckCalls=135,mutations=rejected,reportCorruptionsRejected=4,referenceCorruptionsRejected=4,limitations=base['limitations'])
  (OUT/'verification.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 print(json.dumps(dict(task='247',status='passed',cases=648,states=45360,sourceMutationsRejected=len(rejected))))
if __name__=='__main__':main()
