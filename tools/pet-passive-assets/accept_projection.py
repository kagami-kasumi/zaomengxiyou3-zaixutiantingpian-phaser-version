"""246 acceptance and local export. Pixel comparison is independent verify_local.py."""
import copy,gzip,hashlib,json,sys
from datetime import datetime,timezone
from pathlib import Path
import jsonschema
from local_projection import ROOT,OUT,SDK,NATIVE,sha
from verify_local import REPORT,run as compare

def read(p):return json.loads(p.read_text(encoding='utf-8'))
def canon(n):
 kind=n['type'];native=kind.startswith('buff_') or kind in ['flash.display::Shape','flash.display::MovieClip']
 r={k:n[k] for k in ['visible','matrix','colorTransform','blendMode','filters']}
 r['type']=kind if native else 'container'
 if native and 'frame' in n:r['frame']=n['frame']
 r['children']=[canon(c) for c in n['children']]
 return r
def main():
 cfg=read(OUT/'inputs.json');base=read(OUT/'baseline/outputs.json');repeat=read(OUT/'repeat/outputs.json')
 assert base['runtime']==repeat['runtime']=='WIN 51,1,1,5'
 samples={s['key']:s for s in cfg['samples']};rows={s['key']:s for s in base['rows']};again={s['key']:s for s in repeat['rows']}
 assert len(samples)==len(rows)==len(again)==1093 and len(cfg['states'])==65280
 for key,s in samples.items():
  assert canon(s['tree'])==canon(rows[key]['observed']),('observed tree',key)
  assert canon(rows[key]['observed'])==canon(again[key]['observed'])
  assert rows[key]['crop']==again[key]['crop']
  assert sha(OUT/'baseline'/rows[key]['path'])==sha(OUT/'repeat'/again[key]['path'])
 for label in ['baseline','repeat']:
  compare(label);r=read(REPORT/(label+'-comparison.json'));assert r['differentStates']==0 and r['states']==65280
 # Hash every original file, not just one representative of a repeated PNG.
 for s in cfg['states']:assert sha(ROOT/s['capture'])==s['captureSha256'],s['id']
 native=json.loads(gzip.decompress(NATIVE.read_bytes()))
 assert {s['id'] for s in cfg['states']}=={r['id']+':'+str(r['tick'])+':'+r['phase'] for r in native['rows']}
 source=read(ROOT/'docs/tasks/evidence/TASK-SETTINGS-244/source-definitions.json')
 assert len(source['definitions'])==107 and not source['unresolvedCharacterIds'] and not source['missingBitmapDefinitions']
 assert sha(ROOT/source['sourcePath'])==source['sourceSha256']
 for p in native['fixtures']['sources']:assert sha(Path(p['path']))==p['sha256']
 for p in native['sources']:assert sha(ROOT/p['path'])==p['sha256']
 resources=read(ROOT/'local-resources/regima/task-outputs/TASK-SLICE-245B/projection/candidate.generated.json')
 assert len(resources['images'])==50 and len(resources['clips'])==72
 bitmap_root=ROOT/'local-resources/regima/task-outputs/TASK-SLICE-245B/projection/images'
 for bid,b in resources['images'].items():assert sha(bitmap_root/(bid+'.png'))==b['sha256']
 # Field mutations are rejected against source-observed structure, while
 # independent native variants below demonstrate visible rejection as well.
 filtered=next(k for k,s in samples.items() if 'ColorMatrixFilter' in json.dumps(s))
 variants=[]
 def reject(name,change):
  n=copy.deepcopy(samples[filtered]['tree']);change(n)
  assert canon(n)!=canon(rows[filtered]['observed']),name
  variants.append(dict(name=name,kind='observed-structure',status='rejected'))
 reject('matrix',lambda n:n['children'][0]['matrix'].update(a=2))
 reject('origin',lambda n:n['children'][0]['matrix'].update(tx=2))
 reject('omitted-child',lambda n:n['children'].clear())
 def filter_change(n):
  if n['filters']:n['filters']=[]
  else:
   for c in n['children']:filter_change(c)
 reject('filter-layer',filter_change)
 for label in ['wrong-origin','wrong-filter','wrong-frame','wrong-direction']:
  compare(label);r=read(REPORT/(label+'-comparison.json'));assert r['differentStates']>0
  variants.append(dict(name=label,kind='native-pixels',status='rejected',differentStates=r['differentStates']))
 # A replaced local resource must fail against the independent source raster.
 from PIL import Image
 import numpy as np
 s=next(s for s in cfg['states'] if 'mfjc-hero1-p1-d0-cycle:3:' in s['id'])
 im=np.asarray(Image.open(OUT/'baseline'/rows[s['key']]['path']).convert('RGBA'))
 assert np.any(im[:,:,3]>0)
 altered=Image.new('RGBA',(im.shape[1],im.shape[0]))
 negative=compare('baseline',{s['key']:altered},'wrong-resource')
 assert negative['differentStates']>0
 variants.append(dict(name='wrong-bitmap',kind='independent-native-resource-pixels',status='rejected',state=s['id'],differentStates=negative['differentStates']))
 expected_ids={r['id']+':'+str(r['tick'])+':'+r['phase'] for r in native['rows']}
 def state_set(actual):assert {s['id'] for s in actual}==expected_ids
 state_set(cfg['states'])
 try:state_set([s for s in cfg['states'] if '-hero5-' not in s['id']])
 except AssertionError:pass
 else:raise AssertionError('omitted profile accepted')
 variants.append(dict(name='omitted-state-profile',kind='state-set',status='rejected'))
 # Freeze all source fill fields (including repeat) with the immutable closure.
 import xml.etree.ElementTree as ET
 xml=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-244/source/pet1-closure.xml'
 shapes=[]
 for node in ET.parse(xml).getroot().iter():
  if not node.get('shapeId'):continue
  fill=node.find('./shapes/fillStyles/fillStyles/item')
  assert fill is not None and fill.get('fillStyleType')=='66'
  shapes.append(dict(characterId=int(node.get('shapeId')),bitmapId=int(fill.get('bitmapId')),repeat=True,smooth=False,sourceBounds=node.find('shapeBounds').attrib,sourceMatrix=fill.find('bitmapMatrix').attrib))
 assert len(shapes)==50
 def source_fields(actual):assert actual==shapes,'Source XML fill contract mismatch'
 source_fields(copy.deepcopy(shapes))
 for field,value in [('repeat',False),('bitmapId',-1),('sourceMatrix',{})]:
  wrong=copy.deepcopy(shapes);wrong[0][field]=value
  try:source_fields(wrong)
  except AssertionError:pass
  else:raise AssertionError('source mutation accepted '+field)
  variants.append(dict(name='source-'+field,kind='source-xml-field',status='rejected'))
 tool_files=[Path(__file__),Path(__file__).with_name('local_projection.py'),Path(__file__).with_name('LocalProjection.as'),Path(__file__).with_name('verify_local.py'),ROOT/'tools/turtle-visual/NativeTree.as']
 provenance={p.relative_to(ROOT).as_posix():sha(p) for p in tool_files}
 provenance.update({NATIVE.relative_to(ROOT).as_posix():sha(NATIVE),xml.relative_to(ROOT).as_posix():sha(xml)})
 for label in ['baseline','repeat','no-filter','wrong-origin','wrong-filter','wrong-frame','wrong-direction']:
  for name in ['LocalProjection.as','LocalProjection.swf','inputs.json','outputs.json']:
   p=OUT/label/name;provenance[p.relative_to(ROOT).as_posix()]=sha(p)
  p=REPORT/(label+'-comparison.json');provenance[p.relative_to(ROOT).as_posix()]=sha(p)
 for p in [OUT/'inputs.json',REPORT/'wrong-resource-comparison.json',ROOT/'docs/tasks/evidence/TASK-SETTINGS-244/source-definitions.json']:
  provenance[p.relative_to(ROOT).as_posix()]=sha(p)
 bitmap_exports={k:{**v,'path':(bitmap_root/(k+'.png')).relative_to(ROOT).as_posix()} for k,v in resources['images'].items()}
 contract=dict(truthId='task-settings-246.pet-passive-projection',status='verified',boundary='Exactly the 244 observed tree/phase domain, including recorded fractional positions; arbitrary resampling, new transforms, clocks and modern renderers are not verified.',runtime=base['runtime'],compiler=dict(sdk='AIRSDK_51.3.4',mxmlcSha256=sha(SDK/'lib/mxmlc-cli.jar')),runtimeDllSha256=sha(ROOT/'local-resources/regima/source/unpacked/Adobe AIR/Versions/1.0/Adobe AIR.dll'),source=dict(path=source['sourcePath'],sha256=source['sourceSha256']),generators=provenance,shapes=shapes,bitmaps=bitmap_exports,states=cfg['states'],samples=[dict(key=k,tree=samples[k]['tree'],path=(OUT/'baseline'/r['path']).relative_to(ROOT).as_posix(),sha256=sha(OUT/'baseline'/r['path']),crop=r['crop']) for k,r in rows.items()],unresolved=[])
 target=OUT/'projection-contract.json';target.write_text(json.dumps(contract,separators=(',',':')),encoding='utf-8')
 result=dict(status='accepted',generatedAt=datetime.now(timezone.utc).isoformat(),states=65280,localTrees=1093,uniqueRasters=len({s['sha256'] for s in contract['samples']}),differentStates=0,repeatDifferent=0,sourceDefinitions=107,variants=variants,contractSha256=sha(target),inputSha256=provenance,boundary=contract['boundary'])
 (REPORT/'acceptance.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
 # Keep original source hierarchy and independent stage baselines intact; add
 # the new local projection as evidence, not as a replacement display layer.
 manifest=read(ROOT/'docs/reverse-engineering/ground-truth/manifests/task-settings-244-pet-passive-effects.json')
 assert manifest['status']=='verified' and len(manifest['states'])==65280
 manifest['truthId']=contract['truthId'];manifest['scope'].update(taskId='TASK-SETTINGS-246',surfaceId='six-pet-passive-local-projection',description=contract['boundary'])
 manifest['generatedBy']=dict(tool='tools/pet-passive-assets/accept_projection.py',toolVersion='1',command='python tools/pet-passive-assets/accept_projection.py',generatedAt=result['generatedAt'])
 manifest['provenance'].append(dict(id='local-projection',sourceType='runtime-capture',sourcePath=target.relative_to(ROOT).as_posix(),sha256=sha(target),locator='/states -> /samples; original SWF instances, integer host offset only; all original stage baselines compared including outside-crop alpha.'))
 manifest['evidenceRefs']=[target.relative_to(ROOT).as_posix(),(REPORT/'acceptance.json').relative_to(ROOT).as_posix()]
 schema=read(ROOT/'docs/reverse-engineering/ground-truth/schema/ui-ground-truth.schema.json');jsonschema.Draft202012Validator(schema).validate(manifest)
 dest=ROOT/'docs/reverse-engineering/ground-truth/manifests/task-settings-246-pet-passive-projection.json';dest.write_text(json.dumps(manifest,separators=(',',':')),encoding='utf-8')
 print('Accepted:',{k:v for k,v in result.items() if k in ['states','localTrees','uniqueRasters','differentStates','repeatDifferent']},flush=True)
if __name__=='__main__':main()
