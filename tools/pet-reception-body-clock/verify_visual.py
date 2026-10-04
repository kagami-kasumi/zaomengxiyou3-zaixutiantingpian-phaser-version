"""Compare native frame output against independently positioned pool pixels.
This proves crop/registration of the captured fixture, not modern rendering.
"""
import json
from pathlib import Path
import numpy as np
from PIL import Image
WORK=Path(__file__).resolve().parents[2]/'local-resources/regima/task-outputs/TASK-SETTINGS-254/visual'
def verify(work=WORK):
 global WORK
 WORK=work
 fixtures=json.loads((WORK/'fixtures.json').read_text(encoding='utf-8'))
 observations=json.loads((WORK/'observations.json').read_text(encoding='utf-8'))
 rows={v['id']:v for v in observations}
 assert len(rows)==len(fixtures)==416
 assert set(rows)=={v['id'] for v in fixtures}
 owners=json.loads((WORK/'owners.json').read_text(encoding='utf-8'))
 assert len(owners)==3 and all(v['patchClassPreserved'] for v in owners)
 results=[]
 for f in fixtures:
  v=rows[f['id']];w,h=f['cell']['width'],f['cell']['height'];ox,oy=f['cell']['offset']
  x=int(470-w/2+(-ox if f['direct']==0 else ox));y=int(350-h/2+oy)
  raw=Image.open(WORK/v['poolFile']).convert('RGBA')
  if v['poolKind']=='atlas':
   column=f['x'] if f['direct']==0 else raw.width//w-f['x']-1
   cell=raw.crop((column*w,f['row']*h,(column+1)*w,(f['row']+1)*h))
  else:
   cell=raw.crop((0,0,w,h))
  expected=Image.new('RGBA',(940,590));expected.paste(cell,(x,y))
  actual=Image.open(WORK/'png'/(f['id']+'.png')).convert('RGBA')
  assert actual.size==(940,590)
  a,e=np.array(actual,dtype=np.int16),np.array(expected,dtype=np.int16)
  assert np.array_equal(a[:,:,3],e[:,:,3]),(f['id'],'alpha')
  mask=e[:,:,3]>0
  diff=int(np.abs(a[:,:,:3]-e[:,:,:3])[mask].max()) if mask.any() else 0
  assert diff==0,(f['id'],'visible RGB',diff)
  bbox=expected.getchannel('A').getbbox() or (0,0,0,0)
  bounds=dict(x=bbox[0],y=bbox[1],width=bbox[2]-bbox[0],height=bbox[3]-bbox[1])
  assert v['visible']==bounds,(f['id'],'bounds')
  assert v['frame']['x']==x-470 and v['frame']['y']==y-350
  assert len(v['display'])==3 and v['display'][2]['alpha']==1
  tree=v['sourceTree'];ids={n['id'] for n in tree}
  assert len(ids)==len(tree) and tree[0]['parent'] is None
  if v['poolKind']=='movieclip':
   assert tree[0]['frame']==f['row']+1 and tree[1]['frame']==f['x']+1
   for node in tree:
    if node['parent'] is not None:assert node['parent'] in ids
    assert node['children']==sum(n['parent']==node['id'] for n in tree)
    assert node['mask'] is None or node['mask'] in ids
   direct=np.array(Image.open(WORK/v['sourceFile']).convert('RGBA'),dtype=np.int16)
   pool=np.array(raw,dtype=np.int16)
   assert direct.shape==pool.shape and np.array_equal(direct[:,:,3],pool[:,:,3]),(f['id'],'fresh source alpha')
   visible=pool[:,:,3]>0
   assert np.array_equal(direct[:,:,:3][visible],pool[:,:,:3][visible]),(f['id'],'fresh source RGB')
  else:assert tree[0]['kind']=='BitmapData'
  results.append(dict(id=f['id'],visibleRgbMaxDiff=diff,alphaExact=True,bounds=bounds,poolKind=v['poolKind']))
 report=dict(status='passed',scope='native controlled coordinates/crop/registration only; no modern display or gameplay reachability claim',count=len(results),results=results)
 (WORK/'verification.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
 print('416 native poses: pool-to-stage visible RGB/alpha/bounds exact; three Kabu patch class identities retained.')
if __name__=='__main__':verify()
