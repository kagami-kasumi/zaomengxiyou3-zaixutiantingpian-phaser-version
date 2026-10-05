"""Independent numeric expectations; never imports the source generator."""
import sys
sys.dont_write_bytecode = True
import copy
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OLD = ROOT / 'tools/monster2-gather'
OUT = ROOT / 'docs/tasks/evidence/TASK-SETTINGS-261'
sys.path.insert(0, str(OLD))
# Preserve the previously independent 257B oracle, extending only the explicit
# input speed and run mode. Do not substitute captured outputs as expectations.
oracle = (OLD / 'verify_shared.py').read_text(encoding='utf-8')
oracle = oracle.replace("'still','move','gravity'", "'still','move','run','gravity'", 1)
oracle = oracle.replace('def controlled(rows):', 'def controlled(rows, walk, run):')
oracle = oracle.replace("vx = (5 if slot==1 else -5) if mode=='move' else 0", "vx = ((run if mode=='run' else walk)*(1 if slot==1 else -1)) if mode in ('move','run') else 0")
oracle = oracle.replace('def natural(rows):', 'def natural(rows, walk):')
oracle = oracle.replace("(5 if a['slot']==1 else -5)", "(walk if a['slot']==1 else -walk)")
functions = {'__file__': str(OLD / 'verify_shared.py'), '__name__': 'task261_oracle'}
exec(compile(oracle, str(OLD / 'verify_shared.py'), 'exec'), functions)

WALK = [6, 6, 6, 6, 7, 6]
RUN = [10, 10, 10, 10, 11, 10]


def verify(report, require_natural=True):
    assert set(r['profile'] for r in report['rows']) == set(range(1, 7))
    for p in report['profiles']:
        idx = p['profile'] - 1
        assert [p[k] for k in ('walk', 'run', 'gravity', 'jump', 'initialVy', 'scaleX')] == [WALK[idx], RUN[idx], 1.5, -20, 4, 1.2], p
        assert {k:p['bounds'][k] for k in ('x','y','width','height')} == dict(x=-30, y=-50, width=60, height=100), p
    failures, native_samples = [], 0
    for profile in range(1, 7):
        rows = [r for r in report['rows'] if r['profile'] == profile]
        delta = functions['controlled']([r for r in rows if not r['native']], WALK[profile-1], RUN[profile-1])
        failures.extend(dict(profile=profile, **r) for r in delta)
        native = [r for r in rows if r['native']]
        if native:
            native_samples += functions['natural'](native, WALK[profile-1])
        else:
            assert not require_natural, 'Missing natural groups'
    assert not failures, json.dumps(dict(differences=len(failures), first=failures[:4]))
    return dict(controlledWorldStates=sum(not r['native'] for r in report['rows']),
                controlledHeroStates=sum(len(r['positions']) for r in report['rows'] if not r['native']),
                nativeStates=sum(r['native'] for r in report['rows']), nativeOrderMovementSamples=native_samples)


def main():
    suffix = next((arg for arg in sys.argv[1:] if not arg.startswith('--')), '')
    path = OUT / ('capture' + ('-' + suffix if suffix else '') + '.json')
    report = json.loads(path.read_text(encoding='utf-8'))
    result = verify(report, '--controlled' not in sys.argv)
    if report['mutation']:
        raise AssertionError('A source mutation survived independent verification: ' + report['mutation'])
    negatives = []
    for field in ('x', 'y', 'vx', 'vy'):
        damaged = copy.deepcopy(report)
        damaged['rows'][0]['positions'][0][field] += 1
        try:
            verify(damaged, '--controlled' not in sys.argv)
        except AssertionError:
            negatives.append(field)
        else:
            raise AssertionError('Undetected damaged field ' + field)
    result.update(status='passed', dataNegatives=negatives, sourceReportSha256=hashlib.sha256(path.read_bytes()).hexdigest())
    (OUT / ('verification' + ('-' + suffix if suffix else '') + '.json')).write_text(json.dumps(result, indent=2)+'\n', encoding='utf-8')
    print(json.dumps(result))


if __name__ == '__main__':
    main()
