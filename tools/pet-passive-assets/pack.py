"""Pack source-native bitmap data and 244 verified matrices, no gameplay input."""
import gzip, hashlib, json, shutil, sys, runpy
from pathlib import Path
import xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT/'tools/pet-passive-visual'))
from verify_display import source_timelines,SOURCE_IDS
matrix=runpy.run_path(str(ROOT/'tools/dragon23-collision-sampler.py'))['read_matrix']
work=ROOT/'local-resources/regima/task-outputs/TASK-SLICE-245B/bitmaps'
xml=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-244/source/pet1-closure.xml'
tl=source_timelines(xml)
defs={int(n.get('shapeId')):n for n in ET.parse(xml).getroot().iter() if n.get('shapeId')}
output=ROOT/'local-resources/regima/task-outputs/TASK-SLICE-245B/projection/images';output.mkdir(parents=True,exist_ok=True)
bitmaps={};images={}
for r in json.loads((work/'bitmaps.json').read_text(encoding='utf-8')):
 symbol,f,nested=r['id'].split('/')[0].split(':');cid=tl[SOURCE_IDS[symbol]][int(f)-1][0]['characterId']
 if cid in tl:cid=tl[cid][int(nested)-1][0]['characterId']
 fill=defs[cid].find('./shapes/fillStyles/fillStyles/item');bitmap=int(fill.get('bitmapId'));data=(work/r['path']).read_bytes();sha=hashlib.sha256(data).hexdigest()
 if bitmap in bitmaps:assert bitmaps[bitmap]==sha
 bitmaps[bitmap]=sha;target=output/(str(bitmap)+'.png');target.write_bytes(data)
 images[str(bitmap)]=dict(key='pet-passive:'+str(bitmap),path='/assets/pet-passive/'+str(bitmap)+'.png',sha256=sha,width=r['width'],height=r['height'])
assert len(images)==50
nativePath=ROOT/'docs/tasks/evidence/TASK-SETTINGS-244/baseline-native.json.gz'
assert hashlib.sha256(nativePath.read_bytes()).hexdigest()=='f93eb12a80ce07f2a547983beec506bd79703ff4e875708e26cf43b2a0839139'
D=json.loads(gzip.decompress(nativePath.read_bytes()));clips={}
def product(p,m):
 a,b,c,d,x,y=p;A,B,C,D,X,Y=m
 return [a*A+c*B,b*A+d*B,a*C+c*D,b*C+d*D,a*X+c*Y+x,b*X+d*Y+y]
def flat(row):
 parts=[]
 def visit(n,parent,cid=None,filters=None):
  filters=(filters or [])+n.get("filters",[])
  m=n['matrix'];world=product(parent,[m[k] for k in ['a','b','c','d','tx','ty']])
  if cid in defs:
   node=defs[cid];fill=node.find('./shapes/fillStyles/fillStyles/item');bm=matrix(fill.find('bitmapMatrix'),True)
   bounds=node.find('shapeBounds');ct=n['colorTransform']
   assert all(ct[c+'Multiplier']==1 and ct[c+'Offset']==0 for c in ['red','green','blue','alpha'])
   parts.append(dict(filters=filters,characterId=cid,bitmap=str(fill.get('bitmapId')),matrix=world,fill=[bm[0,0],bm[1,0],bm[0,1],bm[1,1],bm[0,2],bm[1,2]],bounds=[int(bounds.get(k))/20 for k in ['Xmin','Ymin','Xmax','Ymax']]))
   return
  frames=tl[cid][n['frame']-1] if cid in tl else [None]*len(n['children'])
  for child,spec in zip(n['children'],frames):visit(child,world,spec['characterId'] if spec else SOURCE_IDS.get(child['type']),filters)
 visit(row['display'],[1,0,0,1,-row['hostMatrix']['x'],-row['hostMatrix']['y']]);return parts
for row in D['rows']:
 effect,profile,owner,direction,scenario=row['id'].split('-',4)
 if owner!='p1' or scenario!='cycle' or row['phase']!='exit-after-owner':continue
 end=100 if effect in ['sxkb','fsnl'] else 20 if effect in ['smjc','mfjc'] else 25
 if not 1<=row['tick']<end:continue
 key=effect+':'+profile+':'+direction
 clips.setdefault(key,dict(endFrame=end,frames=[]))['frames'].append(flat(row))
assert len(clips)==72
manifest=dict(version=1,truthId='task-settings-244.pet-passive-effects',nativeSha256=hashlib.sha256(nativePath.read_bytes()).hexdigest(),images=images,clips=clips)
target=ROOT/'local-resources/regima/task-outputs/TASK-SLICE-245B/projection/candidate.generated.json';target.write_text(json.dumps(manifest,separators=(',',':'))+'\n',encoding='utf-8')
print('Packed',len(images),'native bitmaps and',len(clips),'source matrix clips')
