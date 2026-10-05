"""Bind original observations, repeat, independent checks and source mutants."""
import sys
sys.dont_write_bytecode = True
import copy
import hashlib
import json
from collections import defaultdict
from pathlib import Path
import audit_inputs
import verify

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
OUT = ROOT / 'docs/tasks/evidence/TASK-SETTINGS-261'
WORK = ROOT / 'local-resources/regima/task-outputs/TASK-SETTINGS-261/shared'
DEST = ROOT / 'docs/reverse-engineering/reference/hero-gather-motion-contract.json'
MUTATIONS = {'speed-unit', 'gravity-first', 'round-instead-twip', 'root-offset',
             'wall-snap', 'screen-clamp', 'world-before-tween'}


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def read(path):
    return json.loads(path.read_text(encoding='utf-8'))


def binding(path):
    return dict(path=path.relative_to(ROOT).as_posix(), sha256=sha(path))


def verify_capture(suffix):
    path = OUT / ('capture' + suffix + '.json')
    report = read(path)
    result = verify.verify(report)
    assert report['mutation'] is None
    assert report['generatorSha256'] == sha(HERE / 'capture.py')
    for item in report['sources']:
        assert sha(ROOT / item['path']) == item['fileSha256'], item
    for file, digest in report['generatedHashes'].items():
        assert sha(WORK / file) == digest, file
    log_path = WORK / ('run' + suffix + '.log')
    assert sha(log_path) == report['logSha256']
    lines = log_path.read_text(encoding='utf-8').splitlines()
    assert [json.loads(s[4:]) for s in lines if s.startswith('ROW ')] == report['rows']
    assert [json.loads(s[9:]) for s in lines if s.startswith('PROFILES ')] == [report['profiles']]
    assert any('51,1,1,5' in s for s in lines if s.startswith('RUNTIME '))
    checked = read(OUT / ('verification' + suffix + '.json'))
    assert checked['sourceReportSha256'] == sha(path)
    assert checked['status'] == 'passed' and checked['dataNegatives'] == ['x', 'y', 'vx', 'vy']
    assert all(checked[k] == v for k, v in result.items())
    expected_profile_count = 6 * (3 * 4 * 13 + 3 * 4)
    assert len(report['profiles']) == expected_profile_count
    return report, dict(**binding(path), **result, rawLog=binding(log_path))


def build():
    normal, first = verify_capture('')
    repeat, second = verify_capture('-repeat')
    controlled = [r for r in normal['rows'] if not r['native']]
    assert controlled == [r for r in repeat['rows'] if not r['native']], 'Controlled repeat differs'
    audit = audit_inputs.build()
    assert audit == read(OUT / 'input-audit.json'), 'Input audit stale'
    mutation_run = read(OUT / 'source-mutations.json')['mutations']
    assert {r['mutation'] for r in mutation_run} == MUTATIONS
    assert len(mutation_run) == len(MUTATIONS)
    for result in mutation_run:
        assert result['captureExitCode'] == 0 and result['status'] == 'killed', result
        assert result['oracleRejectedIndependently']
        assert result['captureReportSha256'] == sha(OUT / ('capture-' + result['mutation'] + '.json'))
    killed = []
    for name in sorted(MUTATIONS):
        path = OUT / ('capture-' + name + '.json')
        mutant = read(path)
        assert mutant['mutation'] == name
        assert mutant['generatorSha256'] == sha(HERE / 'capture.py')
        directory = WORK.parent / ('mutation-' + name)
        assert sha(directory / ('run-' + name + '.log')) == mutant['logSha256']
        for file, digest in mutant['generatedHashes'].items():
            assert sha(directory / file) == digest, (name, file)
        try:
            verify.verify(mutant, False)
        except AssertionError as failure:
            killed.append(dict(id=name, status='rejected-by-independent-oracle',
                               failure=str(failure), **binding(path)))
        else:
            raise AssertionError('Source mutation survived: ' + name)
    grouped = defaultdict(list)
    for row in controlled:
        for p in row['positions']:
            key = (row['profile'], row['fps'], row['owner'], row['mode'], p['slot'])
            grouped[key].append([row['tick'], p['x'], p['y'], p['vx'], p['vy'],
                                 p['dead'], p['ready'], p['parent'], row['paused'],
                                 row['sourceReady'], row['worldHeroes'], row['worldMonsters']])
    references = [binding(ROOT / path) for path in (
        'docs/reverse-engineering/reference/monster2-gather-coordinate-contract.json',
        'docs/reverse-engineering/reference/monster2-attack-space-contract.json',
        'docs/reverse-engineering/ground-truth/manifests/monster2-attack-space.json',
        'docs/tasks/evidence/TASK-SETTINGS-217/environment-properties.json',
        'local-resources/regima/source/restored-swfs/assets/StageCommon.swf')]
    modern = [dict(**binding(ROOT / path), locator=locator) for path, locator in (
        ('src/systems/HeroMovementSystem.ts', 'landOnPlatformIfNeeded; previousBottomY; bounds.bottom'),
        ('src/scenes/HeroPartyRuntimeBridge.ts', 'createHeroPartyRuntime; view.setPosition'),
        ('src/scenes/PlayableLevelRuntime.ts', 'setOrigin(0.5, 1)'),
        ('src/scenes/HeroCombatVisualCoordinates.ts', 'projectHeroVisualRootY'),
        ('src/systems/HeroPartyRuntimeSystem.ts', 'resolveHeroPartyEnemyAttacks player y-50'),
        ('src/scenes/HeroPartyMonster3Reception.ts', 'monster3AttackHits passes movement.y'),
        ('src/scenes/stage12/Stage12GameplayBridge.ts', 'heroes.update precedes monsters.update'))]
    return dict(schemaVersion=1, contractId='task-settings-261.hero-gather-motion',
        status='verified-bounded-motion-inputs', runtime='AIR 51.1.1.5',
        scope=dict(profiles=['Role1','Role2','Role3','Role4','Role5-default', 'Role5-constructor-false'],
                   fps=[20,24,30], owners=['P1','P2','both'], modes=list(verify.functions['MODES']),
                   constructorBoundary=normal['constructorBoundary'],
                   fixtureOverrides='After observing constructor fields, velocity is reset to zero; gravity only enabled in gravity mode; wall sets vy=10; native enables ordinary walk with zero gravity.',
                   excluded=['full constructors/art/keyboard/skills/equipment', 'buff/enforceSpeed/sea',
                             'moving or sloped walls', 'moving camera', 'full level physics']),
        inputs=audit, sources=normal['sources'], references=references, modernConsumers=modern,
        rules=dict(velocityUnit='pixels per world host step, not seconds',
                   integration='wall check then x/y integration then gravity; Sprite writes truncate toward zero to 1/20 pixel',
                   order=['Tween render/lazy initialization', 'monster request', 'hero world step'],
                   coordinate='source rootY = modern feetY - 50; endpoint feetY = source target rootY + 50; quantize source root before projecting feet',
                   horizontalScreenRoot=[20,920], flatWallRoot='wallTop - 0.1 - colipse.height/2',
                   ownership='Existing HeroParty movement is sole position owner; no second HP/position state',
                   role5='Default constructor 7/11; toggles do not rewrite speed. Profile6 is an explicit alternate constructor branch, not evidence of a reachable normal spear speed.'),
        stateColumns=['tick','x','y','vx','vy','dead','ready','parent','paused','sourceReady','worldHeroes','worldMonsters'],
        trajectories=[dict(profile=k[0],fps=k[1],owner=k[2],mode=k[3],slot=k[4],states=v) for k,v in sorted(grouped.items())],
        acceptance=dict(runs=[first,second], controlledRepeatEqual=True,
                        sourceMutations=killed, dataNegatives=['x','y','vx','vy'],
                        naturalComparison='Each run satisfies independent timing/order/lifecycle invariants; native timing samples need not equal.'),
        tools=[binding(p) for p in sorted(HERE.glob('*.py'))] + [binding(ROOT / p) for p in (
            'tools/monster2-gather/shared.py', 'tools/monster2-gather/SharedProbe.as',
            'tools/monster2-gather/ordering.py', 'tools/monster2-gather/verify_shared.py',
            'tools/monster2-gather/verify_controlled.py', 'tools/monster2-space-preflight/run.py')],
        unresolvedInScope=[],
        implementationRemaining=['260A actual HeroParty movement and Stage1-2 ordered integration',
                                 '260A review Monster3 root boundary without double subtracting existing Stage1 root',
                                 '260B full Monster2 body, two hit1, bare MC and reception joint acceptance'])


def main():
    result = build()
    if '--check' in sys.argv:
        assert read(DEST) == result, 'Behavior reference differs from independently verified source observations'
    else:
        DEST.write_text(json.dumps(result, ensure_ascii=False, separators=(',', ':'))+'\n', encoding='utf-8')
    damaged = copy.deepcopy(result)
    damaged['trajectories'][0]['states'][0][1] += 1
    assert damaged != result
    print(json.dumps(dict(status='passed', trajectories=len(result['trajectories']),
                          controlledHeroStates=sum(len(t['states']) for t in result['trajectories']),
                          sourceMutations=len(result['acceptance']['sourceMutations']), referenceBytes=DEST.stat().st_size)))


if __name__ == '__main__':
    main()
