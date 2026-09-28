"""Independent source-tag display-list reconstruction for Monster30Bullet1 only."""
from pathlib import Path
import copy,hashlib,json,subprocess,xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[2]
LOCAL=ROOT/'local-resources/regima/task-outputs/task-settings-241-monster30-attack-collision'
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-241'
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
   assert item.get('placeFlagHasColorTransform')!='true' and item.get('placeFlagHasBlendMode')!='true'
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
 assert names[21]=='Monster30Bullet1'
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
 visit(21)
 def expand(cid,frame,path='root'):
  node=dict(characterId=cid,frame=frame,path=path,kind=definitions[cid].get('type'),children=[])
  if cid in sequences:
   for child in sequences[cid][frame-1]:
    c=child['characterId'];f=(frame-child['placedAt'])%len(sequences[c])+1 if c in sequences else 1
    node['children'].append({**expand(c,f,path+'/'+str(child['depth'])),**child})
  return node
 states=[dict(frame=f,tree=expand(21,f)) for f in range(1,11)]
 native=json.loads((OUT/'native.json').read_text(encoding='utf-8'))
 counts=[]
 def compare(expected,actual):
  assert len(expected['children'])==len(actual['children']),expected
  if expected['characterId'] in sequences:assert expected['frame']==actual['frame'] and len(sequences[expected['characterId']])==actual['totalFrames']
  if 'matrix' in expected:
   assert all(abs(expected['matrix'][k]-actual['matrix'][k])<1e-9 for k in I),(expected,actual)
   assert len(expected['filters'])==len(actual['filters'])
  for e,a in zip(expected['children'],actual['children']):compare(e,a)
 for state,actual in zip(states,sorted(native['trees'],key=lambda r:r['frame'])):
  assert state['frame']==actual['frame'];compare(state['tree'],actual['tree'])
 result=dict(status='source-tree-matched-not-full-collision-verification',source=source.relative_to(ROOT).as_posix(),sha256=hashlib.sha256(source.read_bytes()).hexdigest(),xmlSha256=hashlib.sha256(xml.read_bytes()).hexdigest(),closure=[dict(characterId=c,type=definitions[c].get('type'),tagSha256=hashlib.sha256(ET.tostring(definitions[c])).hexdigest()) for c in sorted(closure)],states=states)
 (OUT/'source-display-list.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
 print('241 XML/native display lists agree: 10 states;',len(closure),'source definitions')
if __name__=='__main__':main()
