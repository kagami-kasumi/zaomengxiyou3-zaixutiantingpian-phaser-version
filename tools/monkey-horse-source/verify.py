"""Independent finite expectations from reviewed BasePet and eight source gates.

No modern code/tuning or generated gate implementation supplies these expected
values. Excludes stubbed movement, visual animation and skill execution effects.
"""
import hashlib
import json
from pathlib import Path
from run import OUT, ROOT

KEYS = ['xj', 'lj', 'lyq', 'jgaoyi', 'bd', 'sp', 'bz', 'tmaoyi']
SKILLS = {'monkey1': ['xj'], 'monkey2': ['lj', 'xj'], 'monkey3': ['lyq', 'xj', 'lj'],
          'monkey4': ['lyq', 'xj', 'lj', 'jgaoyi'], 'horse1': ['sp'], 'horse2': ['bd', 'sp'],
          'horse3': ['bd', 'sp', 'bz'], 'horse4': ['bd', 'sp', 'bz', 'tmaoyi']}


def gates(kind, distance=10, mp=1000, learned=None, release=True):
    result = []
    learned = KEYS if learned is None else learned
    for skill in SKILLS[kind]:
        allowed = skill in learned and mp >= (30 if skill in ['jgaoyi', 'tmaoyi'] else 20)
        if skill == 'sp':
            allowed = allowed and 50 <= distance <= 100
        if skill == 'bz':
            allowed = allowed and distance <= 250
        if skill == 'lyq':
            allowed = allowed and distance <= 400
        if skill == 'bd' or (kind in ['monkey1', 'monkey2'] and skill == 'xj') or (kind in ['monkey3', 'monkey4'] and skill == 'lj'):
            allowed = allowed and release
        result.append(allowed)
    return result + [False] * (4-len(result))


def first_action(eligible):
    return 'skill'+str(eligible.index(True)+1) if any(eligible) else 'normal'


def verify(report):
    rows = {row['id']: row for row in report['cases']}
    assert len(rows) == len(report['cases']), 'duplicate cases'
    used = set()
    def row(kind, case):
        key = kind+':'+case
        used.add(key)
        return rows[key]
    for source in report['sources']:
        assert hashlib.sha256((ROOT/source['path']).read_bytes()).hexdigest() == source['fileSha256']
    for kind in SKILLS:
        for distance in [0,49,50,100,101,250,251,399,400,401]:
            for mp in [0,19,20,29,30,1000]:
                for learned in [False, True]:
                    actual = row(kind, f'gates-{distance}-{mp}-{str(learned).lower()}')['extra']['gates']
                    assert actual == gates(kind, distance, mp, None if learned else []), (kind,distance,mp,learned,actual)
        for fps in [20,24,30]:
            for tick in [0,1,fps-1,fps,fps+1,59998]:
                actual = row(kind, f'phase-{fps}-{tick}')
                expected = ['bullet-clean'] + (['normal'] if tick % fps == 0 else []) + ['buff','base-step']
                assert actual['events'] == expected, actual
                assert actual['randomCalls'] == int(tick % fps == 0), actual
                assert actual['timeCount'] == (tick+1) % 59999, actual
        for state in ['wait','hit1','hit2','hit3','hit4','hit5','hurt','hurt_1','afterHurt','dead']:
            actual = row(kind, 'state-'+state)
            hurt = state in ['hurt','hurt_1','afterHurt','dead']
            attack = state in ['hit1','hit2','hit3'] or (state == 'hit4' and kind[-1] in '34') or (state == 'hit5' and kind[-1] == '4')
            expected = ['bullet-clean']
            if not hurt:
                if not attack:
                    expected.append(first_action(gates(kind)))
                expected.append('buff')
            expected.append('base-step')
            assert actual['events'] == expected, actual
        for name in ['stun','remote']:
            assert row(kind,name)['events'] == ['bullet-clean','base-step']
        actual = row(kind,'acquire')
        assert actual['events'] == ['bullet-clean','follow-owner','buff','base-step'] and actual['target']['x'] == 100
        for name in ['lost','dead-target']:
            actual = row(kind,name)
            assert actual['target'] is None and actual['events'] == ['bullet-clean','buff','base-step']
        for first in ['0.7','0.700001']:
            for second in ['0.299999','0.3']:
                actual = row(kind, f'random-{first}-{second}')
                expected = 'normal' if first == '0.7' else 'static' if second == '0.299999' else 'follow-target'
                assert actual['events'] == ['bullet-clean',expected,'buff','base-step'], actual
                assert actual['randomCalls'] == (1 if first == '0.7' else 2)
        for name in ['priority','cd-after']:
            actual = row(kind,name)
            eligible = gates(kind)
            action = first_action(eligible)
            # horse1 has no eligible SP at distance10: normal only on phase0.
            expected = ['bullet-clean'] + ([action] if any(eligible) or name == 'priority' else []) + ['buff','base-step']
            assert actual['events'] == expected, actual
            if any(eligible):
                assert actual['cd'][eligible.index(True)] == 23, actual
        actual = row(kind,'cd-before')
        assert actual['events'] == ['bullet-clean','normal','buff','base-step'] and actual['cd'] == [0,0,0,0]
        assert row(kind,'release-false')['extra']['gates'] == gates(kind,75,release=False)
        for mask in range(256):
            learned = [skill for bit,skill in enumerate(KEYS) if mask & (1 << bit)]
            actual = row(kind,'subset-'+str(mask))
            assert actual['events'] == ['bullet-clean',first_action(gates(kind,75,learned=learned)),'buff','base-step'], actual
        for fps in [20,24,30]:
            assert row(kind,'off-phase-acquire-'+str(fps))['extra']['normalTicks'] == [tick for tick in range(8,56) if tick % fps == 0]
        assert row(kind,'acquire-dead-first')['target']['x'] == 100
        assert row(kind,'clear-dead-first')['target'] is None
        assert row(kind,'hurt-before-boundary')['events'] == ['bullet-clean','base-step']
        assert row(kind,'hurt-recovered-boundary')['events'] == ['bullet-clean','normal','buff','base-step']
    for hit in [False,True]:
        for intersects in [False,True]:
            for force in [False,True]:
                for alternate in [False,True]:
                    name = '-'.join(str(value).lower() for value in [hit,intersects,force,alternate])
                    expected = force or (intersects and (not hit if alternate else hit))
                    assert row('collision',name)['extra']['accepted'] == expected, name
    assert used == set(rows), 'unexpected/unverified cases'
    return len(used)


if __name__ == '__main__':
    report = json.loads((OUT/'source-trace.json').read_text(encoding='utf-8'))
    count = verify(report)
    (OUT/'source-verification.json').write_text(json.dumps(dict(status='passed',cases=count,scope=report['scope']),indent=2)+'\n',encoding='utf-8')
    print('227 source gate/step verification:',count)
