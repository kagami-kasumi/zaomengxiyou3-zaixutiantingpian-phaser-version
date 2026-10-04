"""Bind observed recursive display paths to restored SWF character IDs.
Only timeline placement identity is decoded; matrices remain native observations.
"""
import importlib.util,json,struct,hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('pet_swf_source',ROOT/'tools/pet-passive-visual/source.py')
swf=importlib.util.module_from_spec(spec);spec.loader.exec_module(swf)
WORK=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-254'
def timelines(defs,cid,frame):
 tag=defs[cid]['tag'];assert tag['code']==39
 count=struct.unpack_from('<H',tag['body'],2)[0];assert 1<=frame<=count
 live={};number=0
 for code,body in swf.iter_tags(tag['body'],4):
  if code in [26,70]:
   flags=body[0];extra=body[1] if code==70 else 0;at=2 if code==70 else 1
   depth=struct.unpack_from('<H',body,at)[0];at+=2
   if extra&8 or (extra&16 and flags&2):at=body.index(0,at)+1
   if flags&2:live[depth]=struct.unpack_from('<H',body,at)[0]
   else:assert depth in live,('update missing depth',cid,depth)
  elif code==4:
   char,depth=struct.unpack_from('<HH',body);live[depth]=char
  elif code in [5,28]:
   depth=struct.unpack_from('<H',body,2 if code==5 else 0)[0];live.pop(depth,None)
  elif code==1:
   number+=1
   if number==frame:return sorted(live.items())
  elif code==94:raise AssertionError('Unsupported PlaceObject4')
 raise AssertionError(('missing frame',cid,frame))
def run():
 inventory=json.loads((WORK/'source-inventory.json').read_text(encoding='utf-8'))
 forms={f['id']:f for f in inventory['forms']}
 observations=json.loads((WORK/'visual/observations.json').read_text(encoding='utf-8'))
 cache={};rows=[]
 for pose in observations:
  form=forms[pose['id'].split('-')[0]];candidates=form['candidates']
  owner=next(c for c in candidates if c['path'].endswith('/20120203.swf')) if len(candidates)>1 else candidates[0]
  path=owner['path']
  if path not in cache:
   raw,_,tags=swf.swf_tags(ROOT/path);assert hashlib.sha256(raw).hexdigest()==owner['sha256']
   cache[path]=(swf.definitions(tags),swf.symbol_class(tags))
  defs,symbols=cache[path];assert symbols[owner['characterId']]==form['symbol']
  tree=pose['sourceTree'];by_id={n['id']:n for n in tree};bindings=[]
  def walk(node,cid,swf_depth):
   assert cid in defs
   code=defs[cid]['tag']['code']
   if node['kind']=='BitmapData':assert code in [6,20,21,35,36,90]
   elif node.get('frame') is not None:assert code==39
   else:assert code in [2,22,32,83],(node['kind'],code)
   bindings.append(dict(id=node['id'],characterId=cid,tagCode=code,swfDepth=swf_depth,symbolClass=symbols.get(cid)))
   if code==39:
    assert struct.unpack_from('<H',defs[cid]['tag']['body'],2)[0]==node['totalFrames']
    placements=timelines(defs,cid,node['frame'])
    children=sorted((n for n in tree if n.get('parent')==node['id']),key=lambda n:n['depth'])
    assert len(placements)==len(children)==node['children'],(pose['id'],node['id'],'children')
    for child,(depth,child_id) in zip(children,placements):walk(child,child_id,depth)
  walk(by_id['0'],owner['characterId'],None)
  assert len(bindings)==len(tree)
  rows.append(dict(id=pose['id'],sourcePath=path,sha256=owner['sha256'],bindings=bindings))
 report=dict(status='passed',scope='restored placement identities bound to native tree paths; matrices/colors from native observations',states=len(rows),nodes=sum(len(r['bindings']) for r in rows),rows=rows)
 (WORK/'visual/source-bindings.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
 print(report['states'],'states /',report['nodes'],'source characters bound')
if __name__=='__main__':run()
