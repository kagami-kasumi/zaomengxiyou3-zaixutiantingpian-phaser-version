"""Publish only the finite verified behavior sidecar; no UI/space status promotion."""
import copy,hashlib,itertools,json
import verify
from verify_phase import verify_phase
from verify_selection import verify as verify_selection
ROOT=verify.ROOT;OUT=verify.OUT
REF=ROOT/'docs/reverse-engineering/reference/monster2-body-attack-contract.json'

def expected_reference():
 body=verify.load('source-baseline.json');selection=verify.load('selection-baseline.json');phase=verify.load('phase.json');roster=verify.load('roster.json');identity=verify.load('identity.json')
 verify.verify(body);verify_selection(selection);verify_phase(phase)
 check=verify.load('verification.json');native=verify.load('native-verification.json')
 assert check['status']==native['status']=='passed' and len(check['mutations'])==19 and len(native['mutations'])==2
 for field,data in [('body',body),('selection',selection)]:assert check['repeatHashes'][field]==hashlib.sha256(json.dumps(data['rows'],sort_keys=True).encode()).hexdigest()
 for field in ['rows','checks']:assert native['repeatHashes'][field]==hashlib.sha256(json.dumps(phase[field],sort_keys=True).encode()).hexdigest()
 assert identity['sourceSha256']==body['restoredSwfSha256'] and len(roster['rows'])==102
 assert verify.digest(ROOT/identity['rawScript']['path'])==identity['rawScript']['sha256']
 assert {(r['fps'],r['direct'],r['p1'],r['p2']) for r in roster['rows'] if r.get('kind')!='door'}==set(itertools.product([20,24,30],[0,1],['absent','alive','dead','ready'],['absent','alive','dead','ready']))
 assert {(r['boss'],r['other']) for r in roster['rows'] if r.get('kind')=='door'}==set(itertools.product([False,True],['absent','alive','dead']))
 for r in roster['rows']:
  if r.get('kind')=='door':assert r['visible']==(r['boss'] and r['other']!='alive')
  else:
   assert r['created']==0 and r['visuals']==1
   assert r['tweens']==[dict(tick=7,target=p,duration=1,x=300,y=150) for p in ['p1','p2'] if r[p] in ['alive','ready']]
 sources={}
 for report in [body,selection,phase,roster]:
  work=__import__('pathlib').Path(report['commands'][1][-1])
  assert verify.digest(work/'Probe.swf')==report['swfSha256']
  for name,digest in report['generatedHashes'].items():assert verify.digest(work/name)==digest
  for source in report['sources']:
   assert verify.digest(ROOT/source['path'])==source['sha256']
   sources[(source['path'],source['method'])]=source
 static=[]
 for path in ['my/MainGame.as','base/BaseHero.as','base/BasePet.as','base/BaseMonster.as','config/Config.as']:
  p=ROOT/'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts'/path
  static.append(dict(path=p.relative_to(ROOT).as_posix(),sha256=verify.digest(p)))
 consumers=[]
 for name in ['Stage12Scene.ts','MonsterRuntimeRegistrySystem.ts','MonsterRuntimeRegistryBridge.ts','Stage1CombatSystem.ts','HeroPartyRuntimeBridge.ts','MonsterDefinitionCatalog.ts','Stage12MonsterVisualSystem.ts','Stage12MonsterVisualBridge.ts']:
  paths=list((ROOT/'src').rglob(name));assert len(paths)==1,name
  consumers.append(dict(path=paths[0].relative_to(ROOT).as_posix(),sha256=verify.digest(paths[0])))
 return dict(schemaVersion=1,contractId='task-settings-256.monster2-body-attack',status='verified-bounded-behavior',
  scope='Monster2 original body/attack/world methods, natural decision and recorded Tween service requests; not geometry, actual HP, Tween interpolation or modern reproduction.',
  attacks=verify.FACTS,deathBodyHolds=[2,2,2,2,2,7],
  selection=dict(skillInitialCdHostSteps='fps*1',skillResetCdHostSteps='fps*5',skillDistance=dict(metric='euclidean',operator='<',value=500),normalRange=dict(metric='absX',operator='<=',value=250),normalDecision='count % fps == 0',probability=dict(normalBoss=0.423,normalNonBoss=0.366,difficulty1=0.85,difficulty2=0.89),unusedRandomBeforeSkill=True,skillFacesTarget=False,normalFacesTarget=True,cdPhase='after decision, including busy/hurt/dead; ready returns',sourceDropProbabilityNotAttackProbability=0.8),
  nativePhase=dict(firstDetectionFrame=1,births={'hit1':[5,20],'hit2':[7]},firstChecks=[6,21],lastChecks=[19,40],pause3LastChecks=[22,43],rawRemoval=dict(frame=14,worldTick=21,phase='EXIT',unaffectedBySourceDestroy=True,unaffectedByMainGamePause=True),pause='source stopGame/continueGame; enrolled bullets stop/play; Tween pauseAll(true,true)/resumeAll requests'),
  control=dict(durationSeconds=1,target='Config.getPlayerArray: non-null hero1/hero2 with !isDead(), P1 then P2; ready flag is not filtered',destination='source x, source y-50 copied at call',pets=False,damageObject=False,enrolled=False,sourceDestroyCancelsTween='no cancellation in traced source; actual Tween lifetime/interpolation not exercised',gameExit='MainGame.destroyGame calls TweenMax.killAll(false); static only'),
  contracts={'M2-01':'BBDC callback before effects; hit1 emits at host steps 5 and 20, hit2 at 7',
   'M2-02':'hit1 two independent SpecialEffectBullet roots with hit1 action and interval999; source motion does not drag them',
   'M2-03':'world processes old bullets before body; first native query next step frame1; final frame queried before cleanup',
   'M2-04':'hurt/dead preserve emitted default bullets; interrupted body suppresses later emission; explicit destroy clears enrolled references',
   'M2-05':'doHi2 creates raw MovieClip plus 1 second Tween requests for living heroes; no attack enrollment or BaseBullet damage calls',
   'M2-06':'raw frame14 script removes parent and stops; native ENTER/world sees frame14 before EXIT removal; source destroy leaves raw visual',
   'M2-07':'source pause enrollments exclude raw visual; Tween pause/resume are recorded services; low-level isStopGame differs from world pause',
   'M2-08':'natural skill priority/CD/probability/distance/facing use Monster2 constructor and source shared methods, not alternating serial',
   'M2-09':'source boss opens doors only if no living Monster4; world removes ready source; fade/UI/reward remain omitted services'},
  sources=list(sources.values()),staticSources=static,modernConsumers=consumers,identities=identity['identities'],restoredSwfSha256=body['restoredSwfSha256'],rawScript=identity['rawScript'],
  acceptance=dict(bodyCases=648,bodyStates=45360,selectionCases=1764,selectionStates=27936,selectionDecisions=1344,nativeStates=3456,nativeChecks=246,rosterCases=96,doorCases=6,compiledBehaviorMutations=19,nativeMutations=2,reportCorruptions=7),
  evidence={n:'docs/tasks/evidence/TASK-SETTINGS-256/'+n+'.json' for n in ['source-baseline','selection-baseline','phase','identity','roster','verification','native-verification']},
  unknown=['Three symbols full display trees, matrices/registration and pixel baselines','Two hit1 objects actual hero/pet colipse pixel collision and final HP reception','Original Tween interpolation/default easing/overwrite/hero movement conflict and hero death lifetime','Full original scene/menu journey and production integration'],
  nextTask='TASK-SETTINGS-257',limitations='Original source method/fragment execution in bundled AIR 51.1.1.5; body harness omits AI/physics/rewards/UI/fade and injects effect expiry. Selection executes original AI/CD with controlled random; movement endpoints remain sinks. Target HP/pixel and Tween interpolation are unverified. Native phase executes real restored clips and original pause methods, not full game UI. Behavior sidecar is not a UI/space manifest.')

def verify_reference(candidate,expected):
 assert candidate==expected,'reference differs from verified finite source contract'

def main():
 expected=expected_reference()
 for key,path in [('births',['attacks','hit1','births']),('duration',['control','durationSeconds']),('firstFrame',['nativePhase','firstDetectionFrame']),('skillRange',['selection','skillDistance','value'])]:
  bad=copy.deepcopy(expected);parent=bad
  for k in path[:-1]:parent=parent[k]
  parent[path[-1]]=None
  try:verify_reference(bad,expected)
  except AssertionError:pass
  else:raise AssertionError(('reference corruption accepted',key))
 if '--check' in __import__('sys').argv:
  verify_reference(json.loads(REF.read_text(encoding='utf-8')),expected)
 else:REF.write_text(json.dumps(expected,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 print(json.dumps(dict(status='passed',**expected['acceptance'],reference=REF.name)))
if __name__=='__main__':main()
