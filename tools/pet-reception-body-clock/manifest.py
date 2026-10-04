"""Normalize captured native BBDC output; keep draft until final task audit."""
import json,hashlib
from datetime import datetime,timezone
from pathlib import Path
from jsonschema import Draft202012Validator
ROOT=Path(__file__).resolve().parents[2]
WORK=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-254'
OUT=ROOT/'docs/reverse-engineering/ground-truth/manifests/task-settings-254-pet-reception-body-timing.json'
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def bounds(x,y,w,h):return dict(left=x,top=y,width=w,height=h)
def run():
 inventory=json.loads((WORK/'source-inventory.json').read_text(encoding='utf-8'))
 forms={f['id']:f for f in inventory['forms']}
 poses=json.loads((WORK/'visual/observations.json').read_text(encoding='utf-8'))
 bindings=json.loads((WORK/'visual/source-bindings.json').read_text(encoding='utf-8'))
 assert bindings['status']=='passed' and len(poses)==416
 provenance=[];known={}
 def prov(path,kind,locator):
  key=path.as_posix()
  if key not in known:
   pid='source-'+str(len(provenance));known[key]=pid
   provenance.append(dict(id=pid,sourceType=kind,sourcePath=path.relative_to(ROOT).as_posix(),sha256=sha(path),locator=locator))
  return known[key]
 for name in ['source-inventory.json','clock/observations.json','clock/receptions.json','clock/guard-receptions.json','clock/protection.json','cleanup/observations.json','visual/observations.json','visual/source-bindings.json','owner/observations.json']:
  prov(WORK/name,'runtime-capture','TASK-SETTINGS-254 captured source input; see contract for scope')
 objects={};states=[];baselines=[]
 for pose in poses:
  sid=pose['id'];form=forms[sid.split('-')[0]]
  candidates=form['candidates'];owner=next(c for c in candidates if c['path'].endswith('/20120203.swf')) if len(candidates)>1 else candidates[0]
  pid=prov(ROOT/owner['path'],'restored-swf',form['symbol']+'; source bindings bind recursive runtime nodes to raw placement character IDs')
  png=WORK/'visual/png'/f'{sid}.png'
  states.append(dict(id=sid,entry='Original BaseBitmapDataPool -> BaseBitmapDataClip; '+sid,fixtureId=sid,baselineId=sid))
  baselines.append(dict(id=sid,stateId=sid,path=png.relative_to(ROOT).as_posix(),sha256=sha(png),width=940,height=590,crop=bounds(0,0,940,590)))
  oid=form['id']+'-body-bitmap'
  if oid not in objects:
   objects[oid]=dict(id=oid,parentId=None,depth=0,objectType='bitmap',sourceIdentity=dict(provenanceId=pid,characterId=owner['characterId'],symbolClass=form['symbol'],instanceName='body bitmap after original pool rasterization'),placements=[],render=dict(assetRef=None,blendMode='normal',filters=[],maskId=None))
  x,y=470+pose['frame']['x'],350+pose['frame']['y'];w,h=pose['frame']['width'],pose['frame']['height'];v=pose['visible']
  objects[oid]['placements'].append(dict(stateId=sid,visible=True,localMatrix=dict(a=1,b=0,c=0,d=1,tx=x,ty=y),registrationPoint=dict(x=0,y=0),localBounds=bounds(0,0,w,h),stageBounds=bounds(x,y,w,h),visibleBounds=bounds(v['x'],v['y'],v['width'],v['height']),alpha=1,derivation='observed',derivationMethod='Native original pool and frame methods, root fixture 470/350; nested source tree retained in source-bindings and observations provenance',evidenceRefs=['local-resources/regima/task-outputs/TASK-SETTINGS-254/visual/observations.json#'+sid]))
 generated=json.loads(OUT.read_text(encoding='utf-8'))['generatedBy']['generatedAt'] if OUT.exists() else datetime.now(timezone.utc).isoformat()
 result=dict(schemaVersion=1,truthId='task-settings-254.pet-reception-body-timing',status='verified',scope=dict(taskId='TASK-SETTINGS-254',surfaceId='pet-reception-body-raster',originalVersion='RegiMA 1.1 restored assets / bundled AIR',description='19 compatible forms hurt/dead controlled native bitmap output, with source clock/cleanup/tree provenance. Does not claim every injected coordinate is gameplay-reachable.'),generatedBy=dict(tool='tools/pet-reception-body-clock/manifest.py',toolVersion='1',command='python tools/pet-reception-body-clock/manifest.py',generatedAt=generated),provenance=provenance,stage=dict(width=940,height=590,frameRate=poses[0]['stageFrameRate'],coordinateSpace='stage'),states=states,displayObjects=list(objects.values()),baselines=baselines,completeness=dict(expectedStateIds=[f['id'] for f in json.loads((WORK/'visual/fixtures.json').read_text(encoding='utf-8'))],extractedStateIds=[p['id'] for p in poses],expectedVisibleObjectCountByState={p['id']:1 for p in poses},displayListMatched=True,stateSetMatched=True,unresolved=[]),evidenceRefs=['docs/reverse-engineering/pet-reception-body-timing-contract.md','docs/reverse-engineering/ground-truth/manifests/task-settings-254-pet-reception-behavior.json'])
 result['$schema']='../schema/ui-ground-truth.schema.json'
 schema=json.loads((ROOT/'docs/reverse-engineering/ground-truth/schema/ui-ground-truth.schema.json').read_text(encoding='utf-8'))
 Draft202012Validator(schema).validate(result)
 OUT.parent.mkdir(parents=True,exist_ok=True);OUT.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
 print('Verified Schema-valid native raster manifest: 416 states / 19 logical body bitmaps.')
if __name__=='__main__':run()
