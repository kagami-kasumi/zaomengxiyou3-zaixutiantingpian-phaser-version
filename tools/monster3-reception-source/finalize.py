"""Freeze independently computed inputs/expected only after native evidence passes."""
import copy,hashlib,json,sys
from pathlib import Path
from fixtures import generate
from verify import expected
from verify_world import expected as world_expected,verify as verify_world
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-251'
WORK=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-251'
REFERENCE=ROOT/'docs/reverse-engineering/reference/monster3-reception-contract.json'

def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def read(p):return json.loads(p.read_text(encoding='utf-8'))
def validate(data):
 fixtures=generate()
 assert len(data['rows'])==len(fixtures)==16960
 for f,row in zip(fixtures,data['rows']):assert row==expected(f),f['id']
 verify_world(data['world'])
 for rec in data['sources']:assert digest(ROOT/rec['path'])==rec['sourceSha256'],rec['path']
 work=WORK/data['label']
 assert len(data['commands'])==2 and data['commands'][0][0]=='java' and data['commands'][1][0].endswith('adl.exe')
 assert digest(work/'fixtures.json')==data['fixtureSha256']
 assert read(work/'fixtures.json')==fixtures
 assert digest(work/'run.log')==data['nativeLogSha256']
 assert 'COMPLETE WIN 51,1,1,5 rows=16960' in (work/'run.log').read_text(encoding='utf-8')
 for name,sha in data['generatedSources'].items():assert digest(work/name)==sha,name
 proof=data['returnvoid']
 assert digest(work/'Probe-patched.swf')==proof['patchedSwfSha256']
 assert proof==read(work/'returnvoid-proof.json')

def check_reference(value,want):
 assert value==want,"reference stale or damaged"

def table(rows):
 fields=list(rows[0]);return dict(fields=fields,rows=[[r[k] for k in fields] for r in rows])

def main():
 baseline=read(OUT/'baseline.json');repeat=read(OUT/'repeat.json');validate(baseline);validate(repeat)
 for key in ['rows','world','sources','fixtureSha256','generatedSources']:assert baseline[key]==repeat[key],key
 mutations=read(OUT/'mutations.json');assert len(mutations)==9 and len({r['name'] for r in mutations})==9
 for m in mutations:
  assert m['status']=='compiled-ran-behavior-changed-oracle-rejected'
  data=read(OUT/('mutation-'+m['name']+'.json'))
  assert data['rows']!=baseline['rows'] or data['world']!=baseline['world']
  try:validate(data)
  except AssertionError:pass
  else:raise AssertionError('mutation survived '+m['name'])
 failures=[]
 changes=[('hp',lambda d:d['rows'][0].__setitem__('hp',999)),('missing-case',lambda d:d['rows'].pop()),
  ('id',lambda d:d['rows'][0].__setitem__('ids',[])),('random',lambda d:d['rows'][0].__setitem__('random',[])),
  ('source-sha',lambda d:d['sources'][0].__setitem__('sourceSha256','bad')),('world',lambda d:d['world'][0]['steps'][0].__setitem__('max',99))]
 for name,change in changes:
  damaged=copy.deepcopy(baseline);change(damaged)
  try:validate(damaged)
  except AssertionError:failures.append(name)
  else:raise AssertionError('damaged evidence survived '+name)
 fixtures=generate()
 world=[world_expected(o,b,a,m) for o in ['p1','p2'] for b in [False,True] for a in [1,2]
  for m in ['normal','protected-retry','geometry-retry','dodge','difficulty1','difficulty2','flower','order']]
 contract=dict(contractId='task-settings-251.monster3-reception',status='verified-bounded-behavior',version=1,
  task='TASK-SETTINGS-251',evidenceLevel='cross-confirmed-native-methods-independent-oracle',
  counts=dict(direct=len(fixtures),types=40,scenarios=53,world=len(world),sourceMutations=9,reportCorruptions=len(failures)),
  predecessors=['task-settings-247.monster3-body-attack','task-settings-248.monster3-attack-collision','task-settings-250.monster3-natural-attack'],
  inputs=table(fixtures),expected=table([expected(f) for f in fixtures]),worldExpected=world,
  sources=baseline['sources'],
  runtime=dict(compiler='AIR SDK 51.3.4',player='AIR WIN 51,1,1,5',fps=30,nowMs=1000,lastHurtMs=-1000,
   returnvoidOriginalSwfSha256=baseline['returnvoid']['originalSwfSha256']),
  boundaries=['Processed target attributes are explicit inputs, not full equipment/stat construction.',
   'Geometry boolean comes from 248; no new spatial or visual truth.',
   'Rendering/knockback projection, equipment revival, rj healing, multiplayer and complete skill AI excluded.',
   'Role3 hit12 outgoing reflection is an external source-damage request sink; target HP alone is asserted.',
   'Protection expiry/timers are controlled inputs, not a complete scene or continuous-time replay.',
   'Source initialization/CD/difficulty fields outside reception reuse 250; no duplicate modern source owner.'],
  commands=['python tools/monster3-reception-source/mutations.py','python tools/monster3-reception-source/finalize.py --write-reference','python tools/monster3-reception-source/finalize.py'],
  tools={p.relative_to(ROOT).as_posix():digest(p) for p in sorted(Path(__file__).parent.glob('*')) if p.is_file()},
  mutationWitnesses=mutations)
 if '--write-reference' in sys.argv:REFERENCE.write_text(json.dumps(contract,separators=(',',':')),encoding='utf-8')
 check_reference(read(REFERENCE),contract)
 negatives=[]
 for field in ['status','counts','sources','expected']:
  damaged=copy.deepcopy(contract);damaged[field]=None
  try:check_reference(damaged,contract)
  except AssertionError:negatives.append(field)
  else:raise AssertionError('damaged reference survived '+field)
 report=dict(status='passed',directCases=len(fixtures),worldSequences=len(world),repeat='exact',
  compiledSourceMutations=9,reportCorruptionRejected=failures,referenceCorruptionRejected=negatives,
  referenceSha256=digest(REFERENCE),referenceBytes=REFERENCE.stat().st_size)
 (OUT/'verification.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report))
if __name__=='__main__':main()
