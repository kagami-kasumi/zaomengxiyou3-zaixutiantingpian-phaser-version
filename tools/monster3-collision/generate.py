"""Build 248 spatial truth. Promotion requires explicit exact residual authorization."""
from pathlib import Path
import copy,hashlib,json,subprocess,sys
import jsonschema
from PIL import Image
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-248'
DEST=ROOT/'docs/reverse-engineering/ground-truth/manifests/monster3-attack-collision.json'
SIDE=ROOT/'docs/reverse-engineering/reference/monster3-attack-collision-contract.json'
def read(p):return json.loads(p.read_text(encoding='utf-8'))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def rel(p):return p.relative_to(ROOT).as_posix()
def save(p,d):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def rect(r):return dict(left=r['x'],top=r['y'],width=r['width'],height=r['height'])
def count(t):return 1+sum(count(c) for c in t['children'])

def main():
 verified='--verify' in sys.argv
 if verified:
  for attack in [1,2]:
   for tool in ['source.py','accept.py']:
    subprocess.run([sys.executable,str(Path(__file__).with_name(tool)),'--attack',str(attack)],check=True)
  assert read(OUT/'native-mutations.json')['status']=='passed'
 states=[];objects=[];baselines=[];counts={};provenance=[];attacks=[]
 for attack,frames,cid in [(1,5,70),(2,10,74)]:
  out=OUT/f'attack{attack}';work=ROOT/f'local-resources/regima/task-outputs/TASK-SETTINGS-248/attack{attack}/air'
  native=read(out/'native.json');source=read(out/'source-display-list.json');v=read(out/'verification.json')
  assert sha(ROOT/source['source'])==source['sha256'];assert v['booleanDifferences']==0
  assert len(native['projections'])==frames*2
  provenance.append(dict(id=f'attack{attack}',sourceType='restored-swf',sourcePath=source['source'],sha256=source['sha256'],locator=f'Monster3Bullet{attack} character{cid}; complete closure in source-display-list.json'))
  for state in native['projections']:
   frame=state['frame'];sign=state['sign'];key=f'f{frame}-s{sign}';identity=f'attack{attack}-{key}'
   tree=state['tree'];decoded=source['states'][frame-1]['tree'];baseline=work/'baselines'/f'{key}.png'
   im=Image.open(baseline);assert im.size==(940,590)
   box=im.getbbox();assert box and 0<box[0]<box[2]<940 and 0<box[1]<box[3]<590
   states.append(dict(id=identity,entry='Native EXIT_FRAME; source-world phase linked to 247 actual checkAttack',frame=frame,fixtureId=identity,baselineId=identity))
   baselines.append(dict(id=identity,stateId=identity,path=rel(baseline),sha256=sha(baseline),width=940,height=590,crop=dict(left=0,top=0,width=940,height=590)))
   assert count(decoded)==count(tree);counts[identity]=count(tree)
   def walk(s,n,path='root',parent=None):
    oid=identity+'/'+path
    objects.append(dict(id=oid,parentId=parent,depth=s.get('depth',0),objectType='movie-clip' if s['kind']=='DefineSpriteTag' else 'shape',sourceIdentity=dict(provenanceId=f'attack{attack}',characterId=s['characterId'],symbolClass=f'Monster3Bullet{attack}' if parent is None else None,instanceName=None,frame=s['frame']),placements=[dict(stateId=identity,visible=n['visible'],alpha=n['alpha'],localMatrix=n['worldMatrix'] if parent is None else n['matrix'],registrationPoint=dict(x=0,y=0),localBounds=rect(n['bounds']),stageBounds=rect(n['stageBounds']),derivation='observed',derivationMethod='Native source-tree matrix/bounds/alpha cross-check; root includes signed fixture wrapper',evidenceRefs=[f'attack{attack}',rel(out/'source-display-list.json'),rel(out/'native.json')])],render=dict(assetRef=rel(baseline) if parent is None else None,blendMode=n['blendMode'],filters=n['filters'],maskId=None)))
    for sc,nc in zip(s['children'],n['children']):walk(sc,nc,path+'/'+str(sc['depth']),oid)
   walk(decoded,tree)
  attacks.append(dict(attack=attack,symbol=f'Monster3Bullet{attack}',characterId=cid,totalFrames=frames,sourceDisplayList=dict(path=rel(out/'source-display-list.json'),sha256=sha(out/'source-display-list.json')),oracle=dict(path=rel(out/'native.json'),sha256=sha(out/'native.json'),caseCount=len(native['cases'])),fixtures=dict(path=rel(out/'fixtures.json'),sha256=sha(out/'fixtures.json')),phaseFields=[{**f,'path':rel(work/'fields'/f"{f['id']}.deflate"),'sha256':sha(work/'fields'/f"{f['id']}.deflate")} for f in native['masks']],verification=v,residuals=dict(path=rel(out/'candidate-pixel-differences.json'),sha256=sha(out/'candidate-pixel-differences.json'))))
 # Original verifier operates in its own import scope; it does not rewrite 247 evidence.
 code="import sys,json;from pathlib import Path;sys.path.insert(0,'tools/monster3-source');from verify_phase import verify_phase;print(verify_phase(json.loads(Path('docs/tasks/evidence/TASK-SETTINGS-247/phase.json').read_text(encoding='utf-8'))))"
 p=subprocess.run([sys.executable,'-B','-c',code],cwd=ROOT,capture_output=True,text=True);assert p.returncode==0,p.stderr
 phasePath=ROOT/'docs/tasks/evidence/TASK-SETTINGS-247/phase.json';phase=read(phasePath)
 bindings=[];index=0
 for fps in [20,24,30]:
  for attack,total in [(1,5),(2,10)]:
   for mode in ['normal','lethal','pause']:
    for frame in range(1,total+1):
     c=phase['checks'][index];assert c['phase']['frame']==frame
     bindings.append(dict(checkIndex=index,fps=fps,attack=attack,scenario=mode,tick=c['tick'],states=[f'attack{attack}-f{frame}-s{s}' for s in [1,-1]]));index+=1
 assert index==135
 save(OUT/'phase-binding.json',dict(status='source-phase-verified',source=rel(phasePath),sha256=sha(phasePath),bindings=bindings,limitations='247 real world event phases linked to static collision poses; no full Scene or actual HP claim'))
 unresolved=[dict(id='collision-residual-approval',description='428 cases / 451 pixels differ in candidate attack rasterization; zero Boolean differences. Exact residual authorization pending.',impact='validation',nextEvidence='Explicit user decision on the frozen residual lists; no collision tolerance inferred from visual authorization')]
 manifest=dict(schemaVersion=1,truthId='task-settings-248.monster3-attack-collision',status='draft',scope=dict(taskId='TASK-SETTINGS-248',surfaceId='monster3-attack-collision',originalVersion='RegiMA 1.1 / bundled AIR 51.1.1.5',description='30 native attack states; actual colipse target construction and original HitTest finite oracle'),generatedBy=dict(tool='tools/monster3-collision/generate.py',toolVersion='1',command='python tools/monster3-collision/generate.py',generatedAt='2026-10-02T00:00:00Z'),provenance=provenance,stage=dict(width=940,height=590,frameRate=24,coordinateSpace='stage',scaleMode='noScale',alignment='TL'),states=states,displayObjects=objects,baselines=baselines,completeness=dict(expectedStateIds=[f'attack{a}-f{f}-s{s}' for a,n in [(1,5),(2,10)] for f in range(1,n+1) for s in [1,-1]],extractedStateIds=[s['id'] for s in states],expectedVisibleObjectCountByState=counts,displayListMatched=True,stateSetMatched=True,unresolved=unresolved),evidenceRefs=[rel(SIDE),rel(OUT/'phase-binding.json')])
 manifest['$schema']='../schema/ui-ground-truth.schema.json'
 side=dict(truthId=manifest['truthId'],status='draft',manifest=rel(DEST),attacks=attacks,profiles=read(ROOT/'tools/monster30-collision/profiles.json'),targets=read(OUT/'attack1/native.json')['targets'],phase=dict(path=rel(OUT/'phase-binding.json'),sha256=sha(OUT/'phase-binding.json')),sampling=dict(phasesPerAxis=20,bitOrder='little',translation='quarter-pixel signed truncation; finite frozen domain only',predicate='AND planes then original sole-origin getColorBoundsRect rule',limitations='No arbitrary-coordinate equivalence or real HP claim; no authorized collision residuals'),unresolved=['exact candidate collision residual authorization'])
 if verified:
  approval=read(OUT/'approved-pixel-differences.json');assert approval['status']=='user-approved'
  for a in attacks:assert approval['candidates'][str(a['attack'])]==a['residuals']['sha256']
  manifest['status']=side['status']='verified';manifest['completeness']['unresolved']=[];side['unresolved']=[];side['approval']=approval
  manifest['generatedBy']['command']+=' --verify'
  manifest['evidenceRefs'].append(rel(OUT/'approved-pixel-differences.json'))
  side['sampling']['limitations']='Exact approved finite residual tuples only; zero Boolean differences required. No arbitrary-coordinate equivalence or real HP claim.'
 schema=read(ROOT/'docs/reverse-engineering/ground-truth/schema/ui-ground-truth.schema.json');jsonschema.validate(manifest,schema)
 for field,value in [('status','invalid'),('schemaVersion',0),('truthId','INVALID ID'),('stage',{}),('provenance',[])]:
  bad=copy.deepcopy(manifest);bad[field]=value
  try:jsonschema.validate(bad,schema)
  except jsonschema.ValidationError:pass
  else:raise AssertionError('Schema corruption accepted: '+field)
 save(DEST,manifest);save(SIDE,side)
 save(OUT/'manifest-verification.json',dict(status=manifest['status'],states=len(states),objects=len(objects),schemaCorruptionsRejected=5,phaseChecks=index,manifestSha256=sha(DEST),sidecarSha256=sha(SIDE)))
 print(f"248 {manifest['status']}: {len(states)} states, {len(objects)} display objects; 135 phase bindings; Schema + 5 corruptions passed")
if __name__=='__main__':main()
