import json,hashlib
from PIL import Image
import numpy as np
from pathlib import Path
WORK=Path(__file__).resolve().parents[2]/'local-resources/regima/task-outputs/TASK-SETTINGS-254/owner'
def verify():
 rows=json.loads((WORK/'observations.json').read_text(encoding='utf-8'))
 modes=['patch-only','base-only','actual-order','reversed-order']
 assert len(rows)==12 and {(r['id'],r['symbol']) for r in rows}=={(m,f'PetKabuBmd{i}') for m in modes for i in [1,2,3]}
 assert all(r['firstDefinitionRetained'] for r in rows)
 results=[]
 for i in [1,2,3]:
  images={m:np.array(Image.open(WORK/f'{m}-PetKabuBmd{i}.png').convert('RGBA')) for m in modes}
  assert np.array_equal(images['actual-order'],images['patch-only'])
  assert np.array_equal(images['reversed-order'],images['base-only'])
  diff=int(np.count_nonzero(np.any(images['actual-order']!=images['reversed-order'],axis=2)))
  assert diff>0,(i,'owner mutant must change actual pixels')
  results.append(dict(symbol=f'PetKabuBmd{i}',changedPixels=diff,actualPixelHash=hashlib.sha256(images['actual-order'].tobytes()).hexdigest()))
 report=dict(status='passed',scope='three Kabu definitions; isolated candidate pixels and actual/reversed sequential domain loads',results=results)
 (WORK/'verification.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
 return report
if __name__=='__main__':print(verify())
