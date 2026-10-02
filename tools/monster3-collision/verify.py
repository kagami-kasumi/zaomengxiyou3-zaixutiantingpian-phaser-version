"""Independent finite phase-field query versus the original native collision buffers."""
from pathlib import Path
import json, math, zlib, sys
import numpy as np
ROOT=Path(__file__).resolve().parents[2]
ATTACK=int(sys.argv[sys.argv.index('--attack')+1]) if '--attack' in sys.argv else 1
OUT=ROOT/f'docs/tasks/evidence/TASK-SETTINGS-248/attack{ATTACK}'
WORK=ROOT/f'local-resources/regima/task-outputs/TASK-SETTINGS-248/attack{ATTACK}/air'

def load():
 r=json.loads((OUT/'native.json').read_text(encoding='utf-8'));fields={}
 for f in r['masks']:
  raw=zlib.decompress((WORK/'fields'/(f['id']+'.deflate')).read_bytes())
  assert len(raw)==f['rawBytes']==f['phaseStride']*400
  p=np.unpackbits(np.frombuffer(raw,dtype=np.uint8).reshape(400,f['phaseStride']),axis=1,bitorder='little')[:,:f['width']*f['height']].reshape(400,f['height'],f['width']).astype(bool)
  fields[f['id']]=(f,p)
 return r,fields,zlib.decompress((WORK/'buffers.deflate').read_bytes())

def plane(field,root,q,mode='quarter'):
 f,p=field;w,h=int(q['width']),int(q['height'])
 if w<1 or h<1:return np.zeros((0,0),bool)
 dx=root['x']-q['x'];dy=root['y']-q['y'];tx=round(dx*20);ty=round(dy*20)
 if mode=='quarter':tx=math.trunc(tx/5)*5;ty=math.trunc(ty/5)*5
 ix,px=divmod(tx,20);iy,py=divmod(ty,20);yy,xx=np.mgrid[:h,:w];xx+=f['originX']-ix;yy+=f['originY']-iy
 ok=(xx>=0)&(yy>=0)&(xx<f['width'])&(yy<f['height']);result=np.zeros((h,w),bool)
 result[ok]=p[py*20+px,yy[ok],xx[ok]];return result

def main():
 r,fields,raw=load();reports=[]
 for mode in ['twip','quarter']:
  mismatch=[];hits=[];total=0
  for row in r['cases']:
   q=row['intersection'];pred=plane(fields[f"f{row['frame']}-s{row['sign']}"],row['sourceRoot'],q,mode)
   if pred.size:
    pred &= plane(fields[row['profile']],row['targetRoot'],q,mode)
    start=row['bufferOffset'];length=row['bufferLength'];w,h=int(q['width']),int(q['height'])
    actual=np.unpackbits(np.frombuffer(raw[start:start+length],dtype=np.uint8),bitorder='little')[:w*h].reshape(h,w).astype(bool)
    assert int(actual.sum())==row['cyanPixels']
    diff=int(np.count_nonzero(actual!=pred));total+=actual.size
    if diff:mismatch.append(dict(id=row['id'],pixels=diff,expected=int(actual.sum()),actual=int(pred.sum())))
   hit = bool(pred.any()) and not (pred.sum()==1 and pred[0,0]) if pred.size else False
   if hit!=row['hit']:hits.append(row['id'])
  reports.append(dict(mode=mode,cases=len(r['cases']),pixels=total,mismatches=mismatch,hitMismatches=hits))
  print(mode,'pixel cases',len(mismatch),'pixels',sum(x['pixels'] for x in mismatch),'hit mismatches',len(hits),mismatch[:5])
 (OUT/'sampling-diagnostic.json').write_text(json.dumps(dict(status='diagnostic-not-verified',reports=reports),indent=2)+'\n',encoding='utf-8')
if __name__=='__main__':main()
