"""Compare actual Phaser projection captures with independent AIR PNGs, never collision masks."""
import hashlib,json
from pathlib import Path
import numpy as np
from PIL import Image,ImageChops,ImageFilter
ROOT=Path(__file__).resolve().parents[2]
BASE=ROOT/'local-resources/regima/task-outputs/task-settings-241-monster30-attack-collision/air/baselines'
OUT=ROOT/'docs/tasks/evidence/TASK-SLICE-240/browser'
rows=[]
for sign in [1,-1]:
 for frame in range(1,11):
  name=f'f{frame}-s{sign}.png';source=BASE/name;modern=OUT/'visual'/name
  a=Image.open(source).convert('RGBA');b=Image.open(modern).convert('RGBA')
  assert a.size==b.size==(940,590)
  bg=Image.new('RGBA',a.size,b.getpixel((0,0)));bg.alpha_composite(a)
  delta=np.abs(np.array(bg).astype(int)-np.array(b).astype(int))[:,:,:3]
  mask=ImageChops.difference(b.convert('RGB'),Image.new('RGB',b.size,b.getpixel((0,0))[:3])).convert('L').point(lambda v:255 if v else 0)
  original=a.getchannel('A');bounds=mask.getbbox();native=original.getbbox()
  assert bounds and native,'an empty loaded texture is not a visible attack'
  assert max(abs(x-y) for x,y in zip(bounds,native))<=2,(name,bounds,native)
  changed=np.any(delta>0,axis=2);silhouette=(np.array(mask)>0)^(np.array(original)>0)
  rows.append(dict(frame=frame,sign=sign,originalBounds=native,modernBounds=bounds,
   changedPixels=int(changed.sum()),silhouettePixels=int(silhouette.sum()),maxChannelDifference=int(delta.max()),
   originalSha256=hashlib.sha256(source.read_bytes()).hexdigest(),modernSha256=hashlib.sha256(modern.read_bytes()).hexdigest()))
report=dict(status='passed-bounded-visual-exception',states=20,rows=rows,
 exception='Existing SVG rasterization, fractional canvas rounding, antialiasing and blur interpolation: exact residuals retained per state; source geometry bounds within two pixels. User standing authorization covers minor visual offsets/AA. No collision tolerance inferred.',
 fixed=['empty SVG filter made frames 1/5/6/10 transparent','center flip displaced right-facing source registration by 116 pixels'],
 boundary='WebGL original attack projection only; full Canvas fallback remains TASK-SLICE-233. Native collision uses independent 241 masks, not these rendered pixels.')
(OUT/'visual-verification.json').write_bytes((json.dumps(report,ensure_ascii=False,indent=2)+'\n').encode())
print('Monster30 display:',len(rows),'native/Phaser states; exact raster residuals retained; registration and non-empty texture gates passed')
