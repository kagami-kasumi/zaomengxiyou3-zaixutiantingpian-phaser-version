"""Independent source-tag display-list reconstruction for Monster2Bullet1/2."""
from pathlib import Path
import copy,hashlib,json,subprocess,sys,xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[2]
ATTACK=int(sys.argv[sys.argv.index('--attack')+1]) if '--attack' in sys.argv else 1
CID={1:49,2:34,3:30}[ATTACK]
SYMBOL={1:"Monster2Bullet1_1",2:"Monster2Bullet1_2",3:"Monster2Bullet2"}[ATTACK]
FRAMES=20 if ATTACK==2 else 14
LOCAL=ROOT/f'local-resources/regima/task-outputs/TASK-SETTINGS-257A/attack{ATTACK}'
OUT=ROOT/f'docs/tasks/evidence/TASK-SETTINGS-257A/attack{ATTACK}'
I=dict(a=1,b=0,c=0,d=1,tx=0,ty=0)

def mat(node):
 a=node.attrib;f=lambda k:round(float(a[k])*65536)/65536
 return dict(a=f('scaleX') if a.get('hasScale')=='true' else 1,d=f('scaleY') if a.get('hasScale')=='true' else 1,b=f('rotateSkew0') if a.get('hasRotate')=='true' else 0,c=f('rotateSkew1') if a.get('hasRotate')=='true' else 0,tx=int(a['translateX'])/20,ty=int(a['translateY'])/20)

def timeline(node):
 live={};frames=[]
 for index,item in enumerate(node.find('subTags')):
  kind=item.get('type')
  if kind.startswith('PlaceObject'):
   depth=int(item.get('depth'));move=item.get('placeFlagMove')=='true'
   state=copy.deepcopy(live[depth]) if move else dict(depth=depth,matrix=dict(I),alpha=1,filters=[],placedAt=len(frames)+1)
   if item.get('placeFlagHasCharacter')=='true':state.update(characterId=int(item.get('characterId')),placedAt=len(frames)+1)
   if item.find('matrix') is not None:state['matrix']=mat(item.find('matrix'))
   assert item.get('placeFlagHasClipDepth')!='true' and item.get('placeFlagHasClipActions')!='true'
   assert item.get('placeFlagHasBlendMode')!='true'
   color=item.find('colorTransform')
   if color is not None:
    attrs=color.attrib
    assert all(int(attrs.get(k+'AddTerm','0'))==0 for k in ['red','green','blue','alpha'])
    assert all(int(attrs.get(k+'MultTerm','256'))==256 for k in ['red','green','blue'])
    state['alpha']=int(attrs.get('alphaMultTerm','256'))/256 if attrs.get('hasMultTerms')=='true' else 1
   if item.find('surfaceFilterList') is not None:state['filters']=[dict(f.attrib) for f in item.find('surfaceFilterList')]
   state['locator']=f"DefineSprite/{node.get('spriteId')}/subTags/{index}";live[depth]=state
  elif kind=='RemoveObject2Tag':del live[int(item.get('depth'))]
  elif kind=='ShowFrameTag':frames.append(copy.deepcopy([live[d] for d in sorted(live)]))
  else:assert kind=='EndTag',kind
 assert len(frames)==int(node.get('frameCount'))
 return frames

def main():
 LOCAL.mkdir(parents=True,exist_ok=True)
 source=ROOT/'local-resources/regima/source/restored-swfs/assets/1.swf';xml=LOCAL/'source.xml'
 run=subprocess.run(['C:/Program Files (x86)/FFDec/ffdec-cli.exe','-swf2xml',str(source),str(xml)],capture_output=True,timeout=60)
 assert run.returncode==0,run.stderr[-1000:]
 tags=list(ET.parse(xml).getroot().find('tags'));definitions={int(t.get('spriteId') or t.get('shapeId') or t.get('characterID')):t for t in tags if t.get('spriteId') or t.get('shapeId') or t.get('characterID')}
 names={}
 for tag in tags:
  if tag.get('type')=='SymbolClassTag':names.update(zip([int(x.text) for x in tag.find('tags')],[x.text for x in tag.find('names')]))
 assert names[CID]==SYMBOL
 sequences={};closure=set()
 def visit(cid):
  if cid in closure:return
  closure.add(cid);d=definitions[cid]
  if d.get('type')=='DefineSpriteTag':
   sequences[cid]=timeline(d)
   for frame in sequences[cid]:
    for child in frame:visit(child['characterId'])
  else:
   for fill in d.findall('./shapes/fillStyles/fillStyles/item'):
    bid=int(fill.get('bitmapId','0'))
    if bid not in (0,65535):visit(bid)
 visit(CID)
 def bounds(cid,children):
  d=definitions[cid]
  if d.get('type')!='DefineSpriteTag':
   q=d.find('shapeBounds');assert q is not None,d.attrib
   return dict(x=int(q.get('Xmin'))/20,y=int(q.get('Ymin'))/20,width=(int(q.get('Xmax'))-int(q.get('Xmin')))/20,height=(int(q.get('Ymax'))-int(q.get('Ymin')))/20)
  points=[]
  for child in children:
   b=child['bounds'];m=child['matrix']
   for x in [b['x'],b['x']+b['width']]:
    for y in [b['y'],b['y']+b['height']]:points.append((m['a']*x+m['c']*y+m['tx'],m['b']*x+m['d']*y+m['ty']))
  if not points:return dict(x=0,y=0,width=0,height=0)
  xs,ys=zip(*points);return dict(x=min(xs),y=min(ys),width=max(xs)-min(xs),height=max(ys)-min(ys))
 def expand(cid,frame,path='root'):
  node=dict(characterId=cid,frame=frame,path=path,kind=definitions[cid].get('type'),children=[])
  if cid in sequences:
   for child in sequences[cid][frame-1]:
    c=child['characterId'];f=(frame-child['placedAt'])%len(sequences[c])+1 if c in sequences else 1
    node['children'].append({**expand(c,f,path+'/'+str(child['depth'])),**child})
  node['bounds']=bounds(cid,node['children']);node['visible']=True;node['blendMode']='normal';node['maskId']=None
  return node
 states=[dict(frame=f,tree=expand(CID,f)) for f in range(1,FRAMES+1)]
 native=json.loads((OUT/'native.json').read_text(encoding='utf-8'))
 counts=[]
 def compare(expected,actual):
  assert len(expected['children'])==len(actual['children']),expected
  assert actual['visible']==expected['visible'] and actual['blendMode']==expected['blendMode']
  assert all(abs(expected['bounds'][k]-actual['bounds'][k])<1e-7 for k in ['x','y','width','height']),(expected['path'],expected['bounds'],actual['bounds'])
  if expected['path']=='root':assert actual['matrix']==I and actual['alpha']==1 and not actual['filters']
  if expected['characterId'] in sequences:assert expected['frame']==actual['frame'] and len(sequences[expected['characterId']])==actual['totalFrames']
  if 'matrix' in expected:
   assert all(abs(expected['matrix'][k]-actual['matrix'][k])<1e-9 for k in I),(expected,actual)
   assert len(expected['filters'])==len(actual['filters'])
   assert expected['alpha']==actual['alpha'],(expected['path'],expected['alpha'],actual['alpha'])
  for e,a in zip(expected['children'],actual['children']):compare(e,a)
 for state,actual in zip(states,sorted(native['trees'],key=lambda r:r['frame'])):
  assert state['frame']==actual['frame'];compare(state['tree'],actual['tree'])
 def compose(p,m):
  return dict(a=p['a']*m['a']+p['c']*m['b'],b=p['b']*m['a']+p['d']*m['b'],c=p['a']*m['c']+p['c']*m['d'],d=p['b']*m['c']+p['d']*m['d'],tx=p['a']*m['tx']+p['c']*m['ty']+p['tx'],ty=p['b']*m['tx']+p['d']*m['ty']+p['ty'])
 api_deltas=[];empty_api_bounds=[]
 def projection(s,n,parent):
  world=compose(parent,s.get('matrix',I));assert all(abs(world[k]-n['worldMatrix'][k])<1e-7 for k in ['a','b','c','d']),(s['path'],'world linear matrix')
  delta={k:n['worldMatrix'][k]-world[k] for k in ['tx','ty']}
  if any(abs(v)>1e-7 for v in delta.values()):
   # Keep getBounds/source affine and concatenatedMatrix as distinct observed APIs.
   # Finite-domain native API observation: nearest quarter pixel; geometric bounds remain unrounded.
   assert all(abs(n['worldMatrix'][k]-round(world[k]*4)/4)<1e-7 for k in ['tx','ty']),(s['path'],world,n['worldMatrix'])
   api_deltas.append(dict(frame=pose['frame'],sign=pose['sign'],path=s['path'],logicalWorldMatrix=world,observedConcatenatedMatrix=n['worldMatrix'],delta=delta))
  b=s['bounds'];points=[(world['a']*x+world['c']*y+world['tx'],world['b']*x+world['d']*y+world['ty']) for x in [b['x'],b['x']+b['width']] for y in [b['y'],b['y']+b['height']]]
  xs,ys=zip(*points);expected=dict(x=min(xs),y=min(ys),width=max(xs)-min(xs),height=max(ys)-min(ys))
  if b['width']==0 and b['height']==0:
   assert n['stageBounds']['width']==0 and n['stageBounds']['height']==0
   empty_api_bounds.append(dict(frame=pose['frame'],sign=pose['sign'],path=s['path'],observedStageBounds=n['stageBounds'],meaning='empty extent; native x/y sentinel is not a visible position'))
  else:assert all(abs(expected[k]-n['stageBounds'][k])<1e-6 for k in expected),(s['path'],expected,n['stageBounds'])
  for sc,nc in zip(s['children'],n['children']):projection(sc,nc,world)
 for pose in native['projections']:
  decoded=states[pose['frame']-1]['tree'];compare(decoded,pose['tree'])
  projection(decoded,pose['tree'],dict(a=pose['sign'],b=0,c=0,d=1,tx=470,ty=295))
 assert len(native['projections'])==FRAMES*2
 rejected=[]
 for kind in ['bounds','visibility','blend','matrix']:
  bad=copy.deepcopy(states[0]['tree']);actual=copy.deepcopy(native['trees'][0]['tree'])
  if kind=='bounds':bad['bounds']['x']+=1
  elif kind=='visibility':actual['visible']=False
  elif kind=='blend':actual['blendMode']='add'
  else:actual['matrix']['tx']+=1
  try:compare(bad,actual)
  except AssertionError:rejected.append(kind)
  else:raise AssertionError('source/native negative control accepted: '+kind)
 result=dict(emptyStageBounds=empty_api_bounds,concatenatedApiDifferences=api_deltas,projectionStates=FRAMES*2,sourceFieldMutantsRejected=rejected,status='source-tree-matched-not-full-collision-verification',source=source.relative_to(ROOT).as_posix(),sha256=hashlib.sha256(source.read_bytes()).hexdigest(),xmlSha256=hashlib.sha256(xml.read_bytes()).hexdigest(),closure=[dict(characterId=c,type=definitions[c].get('type'),tagSha256=hashlib.sha256(ET.tostring(definitions[c])).hexdigest()) for c in sorted(closure)],states=states)
 (OUT/'source-display-list.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
 print(f'257A attack{ATTACK} XML/native display lists agree: {FRAMES} states;',len(closure),'source definitions')
if __name__=='__main__':main()
