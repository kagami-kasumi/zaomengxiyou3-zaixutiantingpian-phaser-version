"""241 draft spatial manifest; verification controls promotion, never generation."""
from pathlib import Path
import hashlib,json,subprocess,sys
import jsonschema
from PIL import Image
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-241'
WORK=ROOT/'local-resources/regima/task-outputs/task-settings-241-monster30-attack-collision/air'
DEST=ROOT/'docs/reverse-engineering/ground-truth/manifests/task-settings-241-monster30-attack-collision.json'
SIDE=ROOT/'docs/reverse-engineering/reference/monster30-attack-collision-contract.json'
def read(p):return json.loads(p.read_text(encoding='utf-8'))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def rel(p):return p.relative_to(ROOT).as_posix()
def rect(r):return dict(left=r['x'],top=r['y'],width=r['width'],height=r['height'])
def save(p,d):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def count(t):return 1+sum(count(x) for x in t['children'])
def main():
 verified='--verify' in sys.argv
 if verified:
  for tool in ['source.py','target_source.py','accept.py']:subprocess.run([sys.executable,str(Path(__file__).with_name(tool))],check=True)
 native=read(OUT/'native.json');source=read(OUT/'source-display-list.json');profiles=read(Path(__file__).with_name('profiles.json'))
 assert len(native['projections'])==20 and source['sha256']==sha(ROOT/source['source'])
 states=[];objects=[];baselines=[];expected={};extracted={};bounds=[]
 for state in native['projections']:
  frame=state['frame'];sign=state['sign'];identity=f'f{frame}-s{sign}';tree=state['tree'];decoded=source['states'][frame-1]['tree'];baseline=WORK/'baselines'/(identity+'.png')
  assert Image.open(baseline).size==(940,590)
  states.append(dict(id=identity,entry='Native restored MovieClip EXIT_FRAME, independently linked to source world detection phases',frame=frame,fixtureId=identity,baselineId=identity))
  baselines.append(dict(id=identity,stateId=identity,path=rel(baseline),sha256=sha(baseline),width=940,height=590,crop=dict(left=0,top=0,width=940,height=590)))
  expected[identity]=count(decoded);extracted[identity]=count(tree)
  bounds.append(dict(frame=frame,sign=sign,localBounds=tree['bounds'],worldBounds=tree['stageBounds'],rootMatrix=tree['worldMatrix']))
  def walk(s,n,path='root',parent=None):
   oid=identity+'/'+path
   objects.append(dict(id=oid,parentId=parent,depth=s.get('depth',0),objectType='movie-clip' if s['kind']=='DefineSpriteTag' else 'shape',sourceIdentity=dict(provenanceId='attack',characterId=s['characterId'],symbolClass='Monster30Bullet1' if parent is None else None,instanceName=None,frame=s['frame']),placements=[dict(stateId=identity,visible=n['visible'],alpha=n['alpha'],localMatrix=n['worldMatrix'] if parent is None else n['matrix'],registrationPoint=dict(x=0,y=0),localBounds=rect(n['bounds']),stageBounds=rect(n['stageBounds']),derivation='observed',derivationMethod='Native bounds/matrix observation cross-checked with source-tag tree; root includes fixture wrapper placement',evidenceRefs=['attack',rel(OUT/'source-display-list.json'),rel(OUT/'native.json')])],render=dict(assetRef=rel(baseline) if parent is None else None,blendMode=n['blendMode'],filters=n['filters'],maskId=None)))
   assert len(s['children'])==len(n['children'])
   for index,(sc,nc) in enumerate(zip(s['children'],n['children'])):walk(sc,nc,path+'/'+str(sc['depth']),oid)
  walk(decoded,tree)
 assert expected==extracted
 provenance=[dict(id='attack',sourceType='restored-swf',sourcePath=source['source'],sha256=source['sha256'],locator='Monster30Bullet1 character21, child20; 13 definition closure')]
 manifest=dict(schemaVersion=1,truthId='task-settings-241.monster30-attack-collision',status='draft',scope=dict(taskId='TASK-SETTINGS-241',surfaceId='monster30-attack-collision',originalVersion='RegiMA 1.1 / bundled AIR 51.1.1.5',description='10 attack frames x 2 directions; actual target profiles, phase fields and collision oracle linked via reference sidecar. No modern damage completion.'),generatedBy=dict(tool='tools/monster30-collision/generate.py',toolVersion='1',command='python tools/monster30-collision/generate.py',generatedAt='2026-09-27T00:00:00Z'),provenance=provenance,stage=dict(width=940,height=590,frameRate=24,coordinateSpace='stage',scaleMode='noScale',alignment='TL'),states=states,displayObjects=objects,baselines=baselines,completeness=dict(expectedStateIds=[f'f{f}-s{s}' for f in range(1,11) for s in [1,-1]],extractedStateIds=[s['id'] for s in states],expectedVisibleObjectCountByState=expected,displayListMatched=True,stateSetMatched=True,unresolved=[dict(id='collision-acceptance',description='Pixel residual adjudication and mutations pending',impact='validation',nextEvidence='Independent verifier and approved exact residual list, if any')]),evidenceRefs=[rel(SIDE),rel(OUT/'phase.json'),rel(OUT/'repeat.json')])
 manifest['$schema']='../schema/ui-ground-truth.schema.json'
 jsonschema.validate(manifest,read(ROOT/'docs/reverse-engineering/ground-truth/schema/ui-ground-truth.schema.json'))
 side=dict(schemaVersion=1,truthId=manifest['truthId'],status='draft',manifest=rel(DEST),sources=native['sources'],profiles=profiles,profileSources=read(OUT/'profile-source-map.json'),targets=native['targets'],attackBounds=bounds,phaseFields=[{**f,'path':rel(WORK/'fields'/(f['id']+'.deflate')),'sha256':sha(WORK/'fields'/(f['id']+'.deflate'))} for f in native['masks']],sampling=dict(phasesPerAxis=20,phaseOrder='y*20+x',bitOrder='little',translation='signed quarter-pixel truncation; source-native finite validation only',predicate='AND source/target planes; exclude sole (0,0) pixel to match original getColorBoundsRect',targetBounds='native actual construction; never visible body bounds',limitations='Finite sampled coordinate domain; pixel residual list unresolved'),fixtures=dict(path=rel(OUT/'fixtures.json'),sha256=sha(OUT/'fixtures.json')),oracle=dict(path=rel(OUT/'native.json'),sha256=sha(OUT/'native.json'),caseCount=len(native['cases']),bufferPath=rel(WORK/'buffers.deflate'),bufferSha256=sha(WORK/'buffers.deflate')),phaseTrace=dict(path=rel(OUT/'phase.json'),sha256=sha(OUT/'phase.json')),unresolved=['collision residuals and mutation validation'])
 side['targetSourceTrees']=read(OUT/'target-display-list.json')
 if verified:
  manifest['status']=side['status']='verified';manifest['completeness']['unresolved']=[];side['unresolved']=[]
  manifest['generatedBy']['command']+=' --verify'
  manifest['evidenceRefs'] += [rel(OUT/'verification.json'),rel(OUT/'approved-pixel-differences.json')]
  side['verification']=read(OUT/'verification.json')
  side['approvedPixelDifferences']={**read(OUT/'approved-pixel-differences.json'),'candidatePath':rel(OUT/'candidate-pixel-differences.json')}
  side['sampling']['limitations']='Finite frozen input domain; exact 379-case/382-pixel list approved by user 2026-09-27; zero Boolean differences required. No arbitrary-coordinate pixel identity claim.'
 manifest['$schema']='../schema/ui-ground-truth.schema.json'
 jsonschema.validate(manifest,read(ROOT/'docs/reverse-engineering/ground-truth/schema/ui-ground-truth.schema.json'))
 save(DEST,manifest);save(SIDE,side)
 print('241 manifest:',manifest['status'],len(states),'states,',len(objects),'objects,',len(profiles),'profiles; schema passed')
if __name__=='__main__':main()
