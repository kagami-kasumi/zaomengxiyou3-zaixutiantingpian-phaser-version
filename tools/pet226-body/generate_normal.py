"""Project verified native births/lifetimes and source hit1 dictionaries into delivered data."""
import hashlib
import json
from pathlib import Path
import re
import sys
ROOT=Path(__file__).resolve().parents[2]
read=lambda path:json.loads(path.read_text(encoding='utf-8'))
sha=lambda path:hashlib.sha256(path.read_bytes()).hexdigest()
result={}
for family,task in [('monkey',228),('horse',229)]:
 truth=read(ROOT/f'docs/reverse-engineering/ground-truth/manifests/task-settings-{task}-pet-{family}-collision-phase.json')
 assert truth['status']=='verified'
 report=read(ROOT/f'docs/tasks/evidence/TASK-SETTINGS-{task}/joint-verification.json')
 assert report['status'].startswith('passed') and not report['failures']
 records=[]
 for entry in report['measurements']:
  path=ROOT/f'local-resources/regima/task-outputs/TASK-SETTINGS-{task}/joint-air/measurement-{entry["fps"]}.json'
  assert sha(path)==entry['sha256']
  records.append(read(path)['rows'])
 forms={}
 for form in truth['body']['forms']:
  path=ROOT/form['sourcePath'];assert sha(path)==form['sourceSha256']
  source=path.read_text(encoding='utf-8')
  match=re.search(r'this\.attackBackInfoDict\["hit1"\]\s*=\s*(\{.*?\});',source,re.S)
  assert match
  attack=json.loads(match[1])
  configurations=[]
  for rows in records:
   for owner in [1,2]:
    candidates=[r for r in rows if r['id']==f'{form["form"]}-hit1-P{owner}--1' and r['phase']=='enter' and r['bullets']]
    born=candidates[0];bullet=born['bullets'][0]
    dead=next(r for r in candidates if r['bullets'][0]['dead'])
    assert bullet['birthTick']==born['tick'] and not bullet['calls']
    configurations.append(dict(symbol=bullet['symbol'],offsetX=(bullet['x']-born['x'])/bullet['d'],
     offsetY=bullet['y']-born['y'],lastTick=dead['tick']-bullet['birthTick'],
     maxHits=attack['hitMaxCount'],interval=attack['attackInterval'],attackKind=attack['attackKind'],
     knockback=attack['attackBackSpeed']))
  assert all(value==configurations[0] for value in configurations)
  forms[str(form['form'])]={**configurations[0],'sourceSha256':form['sourceSha256']}
 result[family]=dict(forms=forms,jointMeasurements=report['measurements'])
path=ROOT/'src/assets/pet-monkey-horse-normal.json'
payload=json.dumps(result,indent=2)+'\n'
if '--check' in sys.argv:assert path.read_text(encoding='utf-8')==payload,'Stale normal projectile projection'
else:path.write_text(payload,encoding='utf-8',newline='\n')
print('Eight normal projectile source dictionaries and native birth/lifetime projections verified.')
