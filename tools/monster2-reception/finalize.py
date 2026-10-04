"""258 acceptance: source binding, native evidence, independent oracle and compact sidecar."""
import copy
import hashlib
import json
import subprocess
import sys
sys.dont_write_bytecode = True
from pathlib import Path
import validate

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-258'
WORK=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-258'
REF=ROOT/'docs/reverse-engineering/reference/monster2-reception-contract.json'

def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def load(p):return json.loads(p.read_text(encoding='utf-8'))
def binding(rel):return dict(path=rel,sha256=sha(ROOT/rel))

def build():
    result=subprocess.run([sys.executable,str(Path(__file__).with_name('validate.py')),'--existing'],capture_output=True,text=True)
    (OUT/'validation.log').write_text(result.stdout+result.stderr,encoding='utf-8')
    assert result.returncode==0,result.stdout+result.stderr
    data=load(OUT/'baseline.json');repeat=load(OUT/'repeat.json')
    for record in data['sources']:
        assert sha(ROOT/record['path'])==record['sourceSha256'],record['path']
    for label in ['baseline','repeat']+['mutation-'+n for n in validate.MUTATIONS]:
        report=load(OUT/(label+'.json'));work=WORK/label
        assert sha(work/'fixtures.json')==report['fixtureSha256']
        assert sha(work/'run.log')==report['nativeLogSha256']
        assert 'COMPLETE WIN 51,1,1,5' in (work/'run.log').read_text(encoding='utf-8')
        for name,digest in report['generatedSources'].items():assert sha(work/name)==digest,(label,name)
        assert sha(work/'Probe-patched.swf')==report['returnvoid']['patchedSwfSha256']
    # Stored expected values are recomputed from independent source-derived rules.
    fixtures=validate.fixtures.generate();direct=[validate.oracle.expected(f) for f in fixtures]
    input_columns=list(fixtures[0]);output_columns=list(direct[0])
    dependencies=[
      'docs/reverse-engineering/reference/monster2-body-attack-contract.json',
      'docs/reverse-engineering/reference/monster2-attack-space-contract.json',
      'docs/reverse-engineering/ground-truth/manifests/monster2-attack-space.json',
      'docs/reverse-engineering/reference/monster2-gather-coordinate-contract.json',
      'docs/reverse-engineering/reference/monster3-reception-contract.json',
      'docs/reverse-engineering/reference/pet-reception-input-contract.json',
    ]
    for rel in dependencies:assert (ROOT/rel).exists(),rel
    body=load(ROOT/dependencies[0])
    for consumer in body['modernConsumers']:assert sha(ROOT/consumer['path'])==consumer['sha256'],consumer['path']
    return dict(contractId='task-settings-258.monster2-reception',status='verified-bounded-behavior',
      runtime='Original bundled AIR 51.1.1.5; SDK 51.3.4 compiler/launcher',
      scope='Stage1-2 Monster2 Boss; two independent physical hit1 objects; single-game P1/P2/both; finite processed attributes/effects',
      unresolved=[],sources=data['sources'],dependencies=[binding(p) for p in dependencies],modernConsumers=body['modernConsumers']+[binding(p) for p in ['src/scenes/HeroPartyMonster3Reception.ts','src/systems/MonsterAttackReception.ts','src/systems/HeroMonsterDamageReception.ts']],
      inheritedContracts=['M2-'+str(n).zfill(2) for n in range(1,10)],
      rules={
        'power':29,'attackKind':'physics','bothObjectsUseAction':'hit1','interval':999,
        'objects':['Monster2Bullet1_1','Monster2Bullet1_2'],
        'detectionHostSteps':[[6,19],[21,40]],
        'gatherDamageProducer':False,
        'heroRejectedDoesNotSkipPet':True,
        'heroLethalRetiresPetBeforePetBranch':True,
        'heroRosterFilters':'original Config.getPlayerArray calls actual isDead, not ready flag',
        'nativeGeometry':'257A supplies independent true/false geometry inputs; no new collision tolerance',
      },
      boundaries=[
        'Direct receiver geometry and processed attributes are explicit inputs; no full equipment or pet AI reconstruction.',
        'Actual receiver/countHurt/HP writes/protection countdown/hero and pet destroy execute original methods.',
        'Display, knockback, tween fade, movement and external equipment services are outside this HP domain.',
        'WorldProbe detector schedule is a controlled input from 256/257A, not another native MovieClip clock measurement.',
        'World rows retain sampled retired objects for observation; actual getPet returns null after hero death.',
        'Raw ready/dead-without-protection cases are controlled boundary states, not full Scene trajectories.',
        'Original returnvoid restored in fixture bytecode, never changes original corpus.',
        'Full Monster2 implementation and modern retirement conformance remain unverified.',
      ],
      direct=dict(inputColumns=input_columns,inputs=[[f[k] for k in input_columns] for f in fixtures],
        expectedColumns=output_columns,expected=[[r[k] for k in output_columns] for r in direct]),
      sequences=[validate.world.expected(f,r,m) for f in [20,24,30] for r in ['p1','p2','both'] for m in validate.world.MODES],
      acceptance=dict(directCases=len(direct),sequences=162,worldStates=6804,compiledMutations=load(OUT/'mutations.json'),repeatIdentical=True),
      evidence=[binding((OUT/(n+'.json')).relative_to(ROOT).as_posix()) for n in ['baseline','repeat','mutations','modern-retirement-diagnostic']],
      toolSources=[binding(p.relative_to(ROOT).as_posix()) for p in sorted(Path(__file__).parent.glob('*')) if p.suffix in ['.py','.as']]+[binding('tools/monster2-reception-owner-diagnostic.ts')]+[binding('tools/monster3-reception-source/'+p) for p in ['capture.py','source.py','world.py','fixtures.py','restore_returnvoid.py']],
      originalReturnvoid=data['returnvoid'])

def main():
    reference=build()
    if '--write' in sys.argv:REF.write_text(json.dumps(reference,separators=(',',':'),ensure_ascii=False)+'\n',encoding='utf-8')
    def check_reference(value):
        assert value==reference,'sidecar mismatch'
    check_reference(load(REF))
    negatives=[]
    for field in ['hp','accepted','father','ids']:
        d=load(OUT/'baseline.json');d['rows'][0][field]='corrupt'
        try:validate.validate(d)
        except AssertionError:negatives.append('trace-'+field)
        else:raise AssertionError(field)
    for key in ['power','interval','gatherDamageProducer','heroLethalRetiresPetBeforePetBranch']:
        bad=copy.deepcopy(reference);bad['rules'][key]='corrupt'
        try:check_reference(bad)
        except AssertionError:negatives.append('reference-'+key)
        else:raise AssertionError('accepted reference corruption '+key)
    report=dict(status='passed',directCases=8480,worldStates=6804,sequences=162,
       compiledMutations=len(validate.MUTATIONS),dataNegatives=negatives,referenceSha256=sha(REF))
    (OUT/'verification.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
    print(json.dumps(report))

if __name__=='__main__':main()
