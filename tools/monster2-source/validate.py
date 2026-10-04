"""Run every semantic mutant to completion; compiler errors are never negative evidence."""
import copy,hashlib,json,subprocess,sys
from pathlib import Path
import verify
import verify_selection
ROOT=verify.ROOT;HERE=verify.HERE;OUT=verify.OUT

def run(tool,arg=None):
 p=subprocess.run([sys.executable,str(HERE/tool)]+([arg] if arg else []),cwd=ROOT,capture_output=True,timeout=100)
 assert p.returncode==0,(tool,arg,(p.stdout+p.stderr).decode(errors='replace')[-2400:])

def sha(v):return hashlib.sha256(json.dumps(v,sort_keys=True).encode()).hexdigest()

def main():
 baseline=verify.load('source-baseline.json');verify.verify(baseline)
 selection=verify.load('selection-baseline.json');selection_result=verify_selection.verify(selection)
 rejected=[]
 for group,tool,names,checker,prefix,base in [
  ('body','capture.py',verify.MUTATIONS,verify.verify,'source-',baseline),
  ('selection','selection.py',['horizontal','inclusive','cd-first','busy-cd','normal-first','alternating','random-consumption','normal-rate','skill-facing'],verify_selection.verify,'selection-',selection)]:
  for name in names:
   if '--existing' not in sys.argv:run(tool,name)
   mutant=verify.load(prefix+name+'.json')
   assert mutant['rows']!=base['rows'],('unchanged',group,name)
   for source in mutant['sources']:assert verify.digest(ROOT/source['path'])==source['sha256']
   try:checker(mutant)
   except AssertionError as e:rejected.append(dict(group=group,name=name,reason=str(e)[:500]))
   else:raise AssertionError(('accepted mutant',group,name))
   print(group,name,'rejected',flush=True)
 corruptions=[]
 for name in ['missing-case','missing-tick','tween-duration','bullet-coordinate']:
  bad=copy.deepcopy(baseline)
  if name=='missing-case':bad['rows'].pop()
  if name=='missing-tick':bad['rows'][0]['states'].pop()
  if name=='bullet-coordinate':bad['rows'][0]['states'][4]['bullets'][0]['x']+=1
  if name=='tween-duration':
   row=next(r for r in bad['rows'] if r['attack']=='hit2' and r['scenario']=='natural');row['states'][6]['tweens'][0]['duration']=2
  try:verify.verify(bad)
  except AssertionError:corruptions.append(name)
  else:raise AssertionError(('accepted corruption',name))
 if '--existing' not in sys.argv:
  run('capture.py');run('selection.py')
 assert baseline['rows']==verify.load('source-baseline.json')['rows']
 assert selection['rows']==verify.load('selection-baseline.json')['rows']
 report=dict(status='passed',body=verify.verify(baseline),selection=selection_result,mutations=rejected,reportCorruptions=corruptions,
  repeatHashes={'body':sha(baseline['rows']),'selection':sha(selection['rows'])})
 if '--existing' in sys.argv:assert verify.load('verification.json')==report,'saved independent repeat/verification differs'
 else:(OUT/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 print(json.dumps({k:v for k,v in report.items() if k not in ['mutations','repeatHashes']}),flush=True)
if __name__=='__main__':main()
