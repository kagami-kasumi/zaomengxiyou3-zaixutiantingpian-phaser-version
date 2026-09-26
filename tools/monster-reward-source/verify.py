"""Independent 231 acceptance table; does not derive expected XP from captured data."""
import hashlib
import json
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT/'docs/tasks/evidence/TASK-SETTINGS-231'
SCENARIOS = {
    'hurt-ai': ('none', 'none'),
    'none': ('none', 'none'), 'hero': ('self', 'hero'),
    'hero-pet': ('self', 'shared-old'), 'pet': ('old', 'old'),
    'fire-retains-pet': ('old', 'old'), 'later-hero': ('other', 'shared-other'),
    'later-pet': ('other-pet', 'other-pet'), 'ai-retains': ('old', 'old'),
    'dead-before-fire': ('old', 'old'), 'retired-before-fire': ('old', 'old'),
    'retired-cleared': ('none', 'none'), 'retired-reselected': ('other', 'shared-other'),
    'dead-ai-clear': ('none', 'none'), 'dead-ai-next': ('other', 'shared-other'),
    'frozen-ai': ('none', 'none'), 'hero-new-pet': ('self', 'shared-fresh'),
    'old-pet-new-active': ('old', 'old'), 'dodge': ('old', 'old'),
    'protected': ('old', 'old'), 'miss': ('old', 'old'),
    'accepted-no-info': ('other', 'shared-other'), 'hero-no-player': ('self', 'none'),
    'hero-retired-clear': ('none', 'none'), 'out-of-range': ('none', 'none'),
    'hero-merchant': ('self', 'shared-old'), 'dead-hero-before-fire': ('self', 'hero'),
    'dead-hero-cleared': ('none', 'none'), 'no-live-heroes': ('none', 'none'),
    'retired-world-lethal': ('old', 'old'), 'retired-world-one-wait': ('none', 'none'),
    'retired-world-two-waits': ('other', 'shared-other'), 'dead-world-lethal': ('old', 'old'),
}


def check(report):
    cases = report['cases']
    expected_ids = {f'{s}/{owner}/{exp}' for s in SCENARIOS for owner in [0,1] for exp in [1,7,101,1000]}
    assert len(cases) == len(expected_ids) == 264
    assert {c['id'] for c in cases} == expected_ids
    for c in cases:
        s, owner, exp = c['scenario'], c['owner'], c['exp']
        assert c['id'] == f'{s}/{owner}/{exp}'
        target, branch = SCENARIOS[s]
        target = {'self': f'h{owner+1}', 'other': f'h{2-owner}'}.get(target, target)
        expected = [11,11,7,7,7]
        updates = [0,0,0]
        if branch == 'hero':
            expected[owner] += exp
        elif branch.startswith('shared-'):
            hero = 1-owner if branch == 'shared-other' else owner
            pet = {'shared-old':2,'shared-fresh':3,'shared-other':4}[branch]
            # Positive AS3 int setter coercion; independent rational arithmetic.
            expected[hero] += exp * 3 // 5
            expected[pet] += exp * 3 // 5
            updates[pet-2] = 1
        elif branch in ['old','other-pet']:
            pet = 2 if branch == 'old' else 4
            expected[pet] += exp
            updates[pet-2] = 1
        after = 'none' if s in ['retired-world-lethal','dead-world-lethal'] else target
        assert c['target'] == target, (c['id'], 'target', c['target'], target)
        assert c['targetAfter'] == after, (c['id'], 'targetAfter')
        assert c['first'] == expected, (c['id'], 'xp', c['first'], expected)
        assert c['repeat'] == expected, (c['id'], 'duplicate', c['repeat'], expected)
        assert c['petUpdates'] == updates, (c['id'], 'pet setters')
        assert c['persisted'] == expected[:2], (c['id'], 'hero setter persistence')
        assert c['accepted'] == (s not in ['dodge','protected','miss'])
        assert c['healed'] == (13 if s == 'hero-merchant' else 0)
        assert c['action'] == 'dead'


def read(path):
    return json.loads(path.read_text(encoding='utf-8'))


def main():
    report = read(OUT/'source-trace.json')
    assert report['mutation'] is None
    assert '51,1,1,5' in report['runtime'], report['runtime']
    for source in report['sources']:
        assert hashlib.sha256((ROOT/source['path']).read_bytes()).hexdigest() == source['fileSha256']
    assert report['probeSha256'] == hashlib.sha256((Path(__file__).parent/'Probe.as').read_bytes()).hexdigest()
    check(report)
    negatives = []
    if '--mutations' in sys.argv:
        for name in ['no-attacker-write','equal-shares','current-pet','duplicate','no-retired-clear','always-reselect']:
            subprocess.run([sys.executable, str(Path(__file__).parent/'capture.py'), name], check=True, timeout=60)
            mutated = read(OUT/'mutations'/name/'source-trace.json')
            try:
                check(mutated)
            except AssertionError as error:
                negatives.append(dict(name=name, rejected=True, reason=str(error)))
            else:
                raise AssertionError('Mutation survived: '+name)
    # Data corruption is also rejected independently of source mutations.
    for field in ['target','first','repeat','persisted']:
        altered = json.loads(json.dumps(report))
        altered['cases'][0][field] = 'corrupted'
        try:
            check(altered)
        except AssertionError:
            continue
        raise AssertionError('Corruption survived: '+field)
    result = dict(status='passed-bounded-source-contract', cases=len(report['cases']),
                  sourceMutations=negatives, malformedFieldsRejected=4,
                  traceSha256=hashlib.sha256((OUT/'source-trace.json').read_bytes()).hexdigest(),
                  limitations='Extracted source methods and fragments; controlled collision, movement/display, skill execution and level-up sinks. Not whole-game playback or modern consumer acceptance.')
    (OUT/'verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(result,ensure_ascii=True))


if __name__ == '__main__':
    main()
