"""Compare native and production final display under identical browser compositing."""
from pathlib import Path
import hashlib,json
import numpy as np
from PIL import Image
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/tasks/evidence/TASK-SLICE-224A1'
SHOTS=ROOT/'.tmp/verification-images/TASK-SLICE-224A1'
browser=json.loads((OUT/'browser-verification.json').read_text(encoding='utf-8'))
rows=[]
for i,state in enumerate(browser['frames']):
    a=Image.open(SHOTS/f'browser-{i}.png').convert('RGBA')
    b=Image.open(SHOTS/f'native-{i}.png').convert('RGBA')
    assert a.size==b.size==(940,590)
    count=int(np.count_nonzero(np.any(np.asarray(a)!=np.asarray(b),axis=2)))
    assert count==0,(state,count)
    rows.append(dict(stateId=state,differentPixels=count,productionSha256=hashlib.sha256((SHOTS/f'browser-{i}.png').read_bytes()).hexdigest(),nativeSha256=hashlib.sha256((SHOTS/f'native-{i}.png').read_bytes()).hexdigest()))
(OUT/'browser-pixels.json').write_text(json.dumps(dict(status='passed',rows=rows),indent=2)+'\n',encoding='utf-8',newline='\n')
print('Three 940x590 native/production browser displays: zero differing pixels.')
