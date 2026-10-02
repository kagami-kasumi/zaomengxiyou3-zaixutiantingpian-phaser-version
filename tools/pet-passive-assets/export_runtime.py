"""Export 246 native local rasters to ordinary, Git-deliverable runtime assets."""
import gzip,hashlib,json,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT/'tools/pet-passive-visual'))
from verify_display import source_timelines,SOURCE_IDS
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def find(n,t):
 if n['type']==t:return n
 for c in n['children']:
  r=find(c,t)
  if r:return r
def main():
 contract=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-246/projection-contract.json'
 accepted=json.loads((ROOT/'docs/tasks/evidence/TASK-SETTINGS-246/acceptance.json').read_text(encoding='utf-8'))
 assert accepted['status']=='accepted' and sha(contract)==accepted['contractSha256']
 data=json.loads(contract.read_text(encoding='utf-8'));samples={s['key']:s for s in data['samples']};states={s['id']:s for s in data['states']}
 native=json.loads(gzip.decompress((ROOT/'docs/tasks/evidence/TASK-SETTINGS-244/baseline-native.json.gz').read_bytes()))
 images={};poses={};trees={};mapping=[];display_trees={}
 timelines=source_timelines(ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-244/source/pet1-closure.xml')
 def annotate(n,cid=None):
  cid=SOURCE_IDS.get(n['type'],cid)
  placements=timelines[cid][n['frame']-1] if cid in timelines else [None]*len(n['children'])
  assert len(placements)==len(n['children']),(cid,n['frame'])
  return {**n,'characterId':cid,'children':[annotate(c,p['characterId'] if p else None) for c,p in zip(n['children'],placements)]}
 out=ROOT/'public/assets/pet-passive';out.mkdir(parents=True,exist_ok=True)
 for r in native['rows']:
  effect,profile,*_=r['id'].split('-');node=find(r['display'],'buff_'+effect)
  if not node:continue
  pet=effect in ['sxkb','fsnl'];host=next((n for n in r['display']['children'] if n['name']=='host'),None)
  sid=r['id']+':'+str(r['tick'])+':'+r['phase'];sample=samples[states[sid]['key']]
  # Alpha is applied by the existing parent lifecycle. Opaque native poses are
  # the runtime resource; all baked-alpha samples remain independent expected.
  if pet and host['alpha']!=1:continue
  key=sample['sha256'][:24];p=ROOT/sample['path'];assert sha(p)==sample['sha256']
  if key not in images:
   (out/(key+'.png')).write_bytes(p.read_bytes())
   images[key]=dict(key='pet-passive:'+key,path='assets/pet-passive/'+key+'.png',sha256=sample['sha256'])
  m=r['hostMatrix'];sign=m['a'] if pet else (-1 if r['bullets'][0]['a']<0 else 1);nested=node['children'][0]['frame'] if pet else 0
  pose=':'.join(map(str,[effect,profile,node['frame'],nested,int(sign),m['x']%1,m['y']%1])).replace(':0.0',':0')
  entry=dict(key=images[key]['key'],x=sample['crop']['left'],y=sample['crop']['top'],width=sample['crop']['width'],height=sample['crop']['height'])
  assert pose not in poses or poses[pose]==entry,pose
  poses[pose]=entry;trees.setdefault(effect+':'+profile,dict(symbol='buff_'+effect,endFrame=node['totalFrames'],sourceMatrix=node['matrix'],filters=node['filters']))
  display_trees.setdefault(pose,annotate(sample['tree']))
  mapping.append(dict(stateId=sid,pose=pose))
 dest=ROOT/'src/assets/pet-passive.generated.json'
 dest.write_text(json.dumps(dict(version=1,truthId=data['truthId'],sourceSha256=data['source']['sha256'],contractSha256=sha(contract),images=list(images.values()),poses=poses,clips=trees,displayTrees=display_trees,shapeDefinitions=data['shapes']),separators=(',',':'))+'\n',encoding='utf-8')
 proof=ROOT/'docs/tasks/evidence/TASK-SLICE-245B/runtime-export.json';proof.write_text(json.dumps(dict(states=mapping,images=len(images),poses=len(poses),runtimeSha256=sha(dest)),separators=(',',':')),encoding='utf-8')
 print('Exported',len(images),'native transparent PNGs;',len(poses),'poses')
if __name__=='__main__':main()
