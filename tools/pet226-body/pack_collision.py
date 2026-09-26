"""Lossless runtime projection of verified bounded fields; not a source truth replacement."""
import base64
import gzip
import hashlib
import json
from pathlib import Path
import sys
import zlib
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'local-resources/regima/task-outputs/TASK-SLICE-226/collision-package.json'
planes={}
def add(raw,width,height):
 assert len(raw)==(width*height+7)//8
 key=hashlib.sha256(f'{width}:{height}:'.encode()+raw).hexdigest()
 planes.setdefault(key,dict(width=width,height=height,bits=base64.b64encode(raw).decode()))
 return key
families={}
for family,task in [('monkey',228),('horse',229)]:
 base=ROOT/f'local-resources/regima/task-outputs/TASK-SETTINGS-{task}'
 work=ROOT/f'local-resources/regima/task-outputs/TASK-SLICE-226/collision-fields-{task}-all'
 report=json.loads((work/'verification.json').read_text())
 assert report['status']=='passed-bounded' and not report['failures']
 source_verification=json.loads((ROOT/f'docs/tasks/evidence/TASK-SETTINGS-{task}/natural-collision-verification.json').read_text())
 assert source_verification['measurementSha256']==report['sourceOracleSha256']
 index=json.loads((work/'field-index.json').read_text())
 lookup={(r['id'],r['sign']):r for r in index['meta']}
 fields={}
 for field in index['fields']:
  for sign in [-1,1]:
   meta=lookup[field['id'],sign]
   keys=[add(zlib.decompress((work/f"fields/{field['id']}-{sign}-{phase}.bin").read_bytes()),meta['width'],meta['height']) for phase in range(16)]
   fields[f"{field['id']}:{sign}"]={**meta,'symbol':field['symbol'],'phaseKey':field['key'],'planes':keys}
 oracle=json.loads((base/'natural-collision-air/measurement.json').read_text())
 field_ids={field['key']:field['id'] for field in index['fields']}
 profiles={}
 for row in oracle['cases']:
  phases=profiles.setdefault(row['symbol'],{})
  phase=field_ids[row['phaseKey']]
  assert phases.setdefault(str(row['tick']),phase)==phase
 long_projection=None
 if family=='horse':
  long_path=ROOT/'local-resources/regima/task-outputs/TASK-SLICE-226/horse-aoyi-collision-source/measurement.json'
  long_verification=ROOT/'docs/tasks/evidence/TASK-SLICE-226/horse-aoyi-collision-source/verification.json'
  verified=json.loads(long_verification.read_text())
  assert verified['status']=='passed-bounded-check' and verified['measurementSha256']==hashlib.sha256(long_path.read_bytes()).hexdigest()
  extended=json.loads(long_path.read_text())
  known={p['key']:p['phase'] for p in oracle['phases']}
  assert all(p['key'] in known and p['phase']==known[p['key']] for p in extended['phases'])
  for row in extended['cases']:
   assert row['symbol']=='PetHorse4Bullet5' and row['hit']==row['reference']
   phase=field_ids[row['phaseKey']]
   assert profiles[row['symbol']].setdefault(str(row['tick']),phase)==phase
  assert set(profiles['PetHorse4Bullet5'])=={str(t) for t in range(321)}
  long_projection=dict(oracleSha256=verified['measurementSha256'],verificationSha256=hashlib.sha256(long_verification.read_bytes()).hexdigest(),ticks=321)
 native_targets={}
 for target in index['targets']:
  native_targets[target['symbol']]=[add(zlib.decompress((work/f"targets/{target['id']}-{phase}.bin").read_bytes()),300,300) for phase in range(400)]
 families[family]=dict(sourceTask=task,oracleSha256=report['sourceOracleSha256'],
  verificationSha256=hashlib.sha256((work/'verification.json').read_bytes()).hexdigest(),
  fieldIndexSha256=hashlib.sha256((work/'field-index.json').read_bytes()).hexdigest(),
  fields=fields,profiles=profiles,nativeTargets=native_targets,longProjection=long_projection)
# The shared formal-monster targets already have a verified 400-phase delivery.
# Reuse its exact packed bytes, not effect bounds or approximated rectangles.
path=ROOT/'public/assets/pets/turtle/collision.json.gz'
turtle=json.loads(gzip.decompress(path.read_bytes()))
runtime_targets=[]
for target in range(3):
 keys=[]
 for phase in range(400):
  plane=turtle['planes'][turtle['mapping'][f'targets/t{target}-{phase}']]
  keys.append(add(base64.b64decode(plane['bits']),plane['width'],plane['height']))
 runtime_targets.append(keys)
package=dict(version=1,families=families,planes=planes,runtimeTargets=runtime_targets,
 monsterTargets=turtle['monsterTargets'],sharedTargetPackageSha256=hashlib.sha256(path.read_bytes()).hexdigest(),
 sampling=dict(sourcePhases=16,targetPhases=400,targetOrigin=150,omitIsolatedFirstPixel=True),
 scope='Bounded source-phase projection; requires full world lifecycle and formal consumer validation before 226 completion.')
payload=(json.dumps(package,separators=(',',':'),sort_keys=True)+'\n').encode()
OUT.write_bytes(payload)
compressed=gzip.compress(payload,mtime=0)
delivery=ROOT/'public/assets/pets/monkey-horse'
manifest=dict(version=1,path='/assets/pets/monkey-horse/collision.json.gz',
 compressedSha256=hashlib.sha256(compressed).hexdigest(),decodedSha256=hashlib.sha256(payload).hexdigest(),
 compressedBytes=len(compressed),decodedBytes=len(payload),
 sourceCases={family:len(json.loads((ROOT/f'local-resources/regima/task-outputs/TASK-SETTINGS-{task}/natural-collision-air/measurement.json').read_text())['cases']) for family,task in [('monkey',228),('horse',229)]},
 generator='python tools/pet226-body/pack_collision.py',scope=package['scope'])
outputs={delivery/'collision.json.gz':compressed,
 delivery/'collision-manifest.json':(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n').encode()}
for path,content in outputs.items():
 if '--check' in sys.argv:assert path.exists() and path.read_bytes()==content,f'Stale collision delivery: {path}'
 else:path.parent.mkdir(parents=True,exist_ok=True);path.write_bytes(content)
print(f'Collision runtime package: {len(planes)} unique planes; {len(payload)} JSON bytes; {len(compressed)} gzip bytes.')
