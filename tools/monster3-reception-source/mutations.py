"""Native compiled mutations and repeat; failures must be behavioral oracle rejections."""
import hashlib,json,re
from pathlib import Path
import capture
from fixtures import generate
from verify import expected
from verify_world import verify as verify_world

OUT=capture.ROOT/'docs/tasks/evidence/TASK-SETTINGS-251'

def validate(data):
 fixtures=generate()
 assert len(data['rows'])==len(fixtures)==16960
 for f,row in zip(fixtures,data['rows']):
  want=expected(f)
  assert row==want,(f['id'],{k:[want[k],row.get(k)] for k in want if row.get(k)!=want[k]})
 verify_world(data['world'])

def edit(file,old,new):
 def apply(work):
  p=work/file;s=p.read_text(encoding='utf-8');assert old in s,(file,old)
  p.write_text(s.replace(old,new,1),encoding='utf-8',newline='')
 return apply

def dodge(work):
 p=work/'BaseHero.as';s=p.read_text(encoding="utf-8");s,n=re.subn(r'(this.beAttackIdArray.push\(param1.getAttackId\(\)\);\s*)return true;',r'\1return false;',s)
 assert n>=1;p.write_text(s,encoding='utf-8',newline='')

MUTATIONS={
 'dodge-reject':dodge,
 'protection-register':edit('BaseHero.as','return false;','this.beAttackIdArray.push(param1.getAttackId());return false;'),
 'threshold':edit('BaseHero.as','Config.random() <= (this.roleProperies.getTotalMiss() - Number(BaseMonster(param2).Hit)) / 100','Config.random() < (this.roleProperies.getTotalMiss() - Number(BaseMonster(param2).Hit)) / 100'),
 'random-order':edit('BaseHero.as','_loc4_ = (Config.random() - 0.5) * 10;\n            _loc5_ = int(param2.getRealPower(param1.curAction).hurt);','_loc5_ = int(param2.getRealPower(param1.curAction).hurt);\n            _loc4_ = (Config.random() - 0.5) * 10;'),
 'ignore-magic':edit('BaseHero.as','this.roleProperies.getMagicDefWhenCountHurt() / 100 - param3.ReduceMagicDef','0'),
 'wrong-hit':edit('BaseMonster.as','this.protectedParamsObject.Hit + 6','this.protectedParamsObject.Hit + 0'),
 'wrong-critical':edit('BaseMonster.as','_loc4_ = 2;','_loc4_ = 1;'),
 'wrong-interval':edit('Monster3.as','"attackInterval":4','"attackInterval":5'),
 'missing-pet':edit('BaseBullet.as','if(this.maxAttackCount > 0)','if(false)'),
}

def main():
 import sys
 resume='--resume' in sys.argv
 baseline=json.loads((OUT/'baseline.json').read_text(encoding='utf-8')) if resume else capture.run()
 validate(baseline)
 repeat=json.loads((OUT/'repeat.json').read_text(encoding='utf-8')) if resume else capture.run('repeat')
 validate(repeat)
 for key in ['rows','world','sources','fixtureSha256','generatedSources']:assert baseline[key]==repeat[key],key
 results=json.loads((OUT/"mutations.json").read_text(encoding="utf-8")) if resume and (OUT/"mutations.json").exists() else []
 for name,mutation in MUTATIONS.items():
  if any(r["name"]==name for r in results):continue
  data=capture.run('mutation-'+name,mutation)
  assert data['rows']!=baseline['rows'] or data['world']!=baseline['world'],name
  try:validate(data)
  except AssertionError as e:witness=str(e)[:2000]
  else:raise AssertionError('surviving mutation '+name)
  changed=[k for k in baseline['generatedSources'] if baseline['generatedSources'][k]!=data['generatedSources'][k]]
  assert changed
  results.append(dict(name=name,status='compiled-ran-behavior-changed-oracle-rejected',changedSources=changed,witness=witness))
  (OUT/'mutations.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
  print('REJECTED',name,flush=True)
 print('ALL NATIVE MUTATIONS REJECTED',len(results),flush=True)
if __name__=='__main__':main()
