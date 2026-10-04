"""Verify native mutants and independent repeated native observations."""
import copy,hashlib,json,subprocess,sys
import verify
from verify_phase import verify_phase

def sha(v):return hashlib.sha256(json.dumps(v,sort_keys=True).encode()).hexdigest()
def main():
 base=verify.load('phase.json');result=verify_phase(base);rejected=[]
 for name in ['pause-raw','raw-no-remove']:
  mutant=verify.load('phase-'+name+'.json');verify.provenance(mutant)
  assert mutant['rows']!=base['rows']
  try:verify_phase(mutant)
  except AssertionError as e:rejected.append(dict(name=name,reason=str(e)[:600]))
  else:raise AssertionError(('accepted native mutation',name))
 for name in ['missing-state','first-frame','raw-parent']:
  bad=copy.deepcopy(base)
  if name=='missing-state':bad['rows'].pop()
  if name=='first-frame':next(r for r in bad['rows'] if r['bullets'])['bullets'][0]['frame']=2
  if name=='raw-parent':next(r for r in bad['rows'] if r['visuals'])['visuals'][0]['parentPresent']=False
  try:verify_phase(bad)
  except AssertionError:pass
  else:raise AssertionError(('accepted phase corruption',name))
 if '--existing' not in sys.argv:
  p=subprocess.run([sys.executable,str(verify.HERE/'phase.py')],capture_output=True,timeout=100)
  assert p.returncode==0,(p.stdout+p.stderr).decode(errors='replace')[-2000:]
 repeat=verify.load('phase.json');verify_phase(repeat)
 for field in ['rows','checks']:assert base[field]==repeat[field],('native repeat',field)
 report=dict(status='passed',**result,mutations=rejected,reportCorruptions=3,repeatHashes={field:sha(base[field]) for field in ['rows','checks']})
 if '--existing' in sys.argv:assert verify.load('native-verification.json')==report,'saved independent native repeat differs'
 else:(verify.OUT/'native-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 print(json.dumps(report),flush=True)
if __name__=='__main__':main()
