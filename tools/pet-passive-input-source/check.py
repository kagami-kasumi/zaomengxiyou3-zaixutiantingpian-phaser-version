"""243 complete native verification; never rewrites the 235 baseline."""
import copy,hashlib,json
from capture import run,OUT,ROOT
from verify import verify
old=ROOT/'docs/reverse-engineering/reference/pet-passive-auto-buff-contract.json'
old_hash=hashlib.sha256(old.read_bytes()).hexdigest()
baseline=run();assert verify(baseline)==997
mutations=[]
for name in ['getter-cap','duration-after-fps','skip-zero','expiry-late','refresh-value']:
    altered=run(name)
    assert altered['generatedHashes']!=baseline['generatedHashes'],name
    try: verify(altered)
    except AssertionError: mutations.append(name)
    else: raise AssertionError('Survived source mutation: '+name)
negative=[]
for name in ['missing','duplicate','value','source','locator','slice','runtime']:
    r=copy.deepcopy(baseline)
    if name=='missing':r['cases'].pop()
    if name=='duplicate':r['cases'].append(r['cases'][0])
    if name=='value':r['cases'][0]['result']['mp']+=1
    if name=='source':r['sources'][0]['fileSha256']='0'*64
    if name=='locator':r['sources'][0]['startLine']+=1
    if name=='slice':r['sources'][0]['sliceSha256']='0'*64
    if name=='runtime':r['runtime']='other'
    try: verify(r)
    except (AssertionError,KeyError):negative.append(name)
    else:raise AssertionError('Survived report damage '+name)
repeat=run();assert baseline==repeat
assert hashlib.sha256(old.read_bytes()).hexdigest()==old_hash
report=dict(status='passed',cases=997,sourceMutations=mutations,damagedReports=negative,repeatedNativeEqual=True,original235Sha256=old_hash)
(OUT/'verification.json').write_text(json.dumps(report,indent=2)+'\n')
print('243 verified',report,flush=True)
