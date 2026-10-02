"""Independent integer-placement comparison against unchanged 244 stage PNGs."""
import hashlib,json,sys
from pathlib import Path
import numpy as np
from PIL import Image
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-246'
REPORT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-246'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def run(label='baseline',overrides=None,report_name=None):
 cfg=json.loads((OUT/'inputs.json').read_text(encoding='utf-8'))
 captures=json.loads((OUT/label/'outputs.json').read_text(encoding='utf-8'))
 rows={r['key']:r for r in captures['rows']};cache={};expected={};comparisons={};states=[]
 for s in cfg['states']:
  r=rows[s['key']];c=s['crop'];b=r['crop'];x=s['origin'][0]+b['left']-c['left'];y=s['origin'][1]+b['top']-c['top']
  key=(s['key'],s['captureSha256'],x,y,c['width'],c['height'])
  if key not in comparisons:
   if s['key'] not in cache:cache[s['key']]=(overrides or {}).get(s['key']) or Image.open(OUT/label/r['path']).convert('RGBA')
   source=cache[s['key']];sa=np.asarray(source)[:,:,3].copy()
   # Check the full local raster, including pixels outside the original crop.
   # Empty 4x4 rasters are not spatial evidence for offscreen geometry.
   x0=max(0,-x);y0=max(0,-y);x1=min(source.width,c['width']-x);y1=min(source.height,c['height']-y)
   if x1>x0 and y1>y0:sa[y0:y1,x0:x1]=0
   outside=int(np.count_nonzero(sa))
   im=Image.new('RGBA',(c['width'],c['height']));im.paste(source,(x,y))
   if s['capture'] not in expected:
    p=ROOT/s['capture'];assert sha(p)==s['captureSha256'];expected[s['capture']]=np.asarray(Image.open(p).convert('RGBA')).astype(np.int16)
   a=np.asarray(im).astype(np.int16);e=expected[s['capture']]
   # Compare alpha and premultiplied color: transparent RGB is not observable.
   ap=a.astype(float);ep=e.astype(float);ap[:,:,:3]*=ap[:,:,3:4]/255;ep[:,:,:3]*=ep[:,:,3:4]/255
   delta=np.max(np.abs(ap-ep),axis=2)
   comparisons[key]=dict(pixels=int(np.count_nonzero(delta))+outside,over1=int(np.count_nonzero(delta>1))+outside,outsideCrop=outside,maxDelta=max(float(delta.max()),float(sa.max()) if outside else 0))
  states.append(dict(id=s['id'],key=s['key'],**comparisons[key]))
 result=dict(status='measured',states=len(states),uniqueComparisons=len(comparisons),uniqueLocalTrees=len(rows),differentStates=sum(s['pixels']>0 for s in states),statesOver1=sum(s['over1']>0 for s in states),maxDelta=max(s['maxDelta'] for s in states),rows=states)
 REPORT.mkdir(parents=True,exist_ok=True);(REPORT/((report_name or label)+'-comparison.json')).write_text(json.dumps(result,separators=(',',':')),encoding='utf-8')
 print({k:v for k,v in result.items() if k!='rows'})
 return result
if __name__=='__main__':run(sys.argv[1] if len(sys.argv)>1 else 'baseline')
