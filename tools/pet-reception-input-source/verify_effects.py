"""Independent elapsed-tick oracle for the bounded receiver gate."""
import json
from effects import ROOT, WORK, cases, run


def expected(case):
    mode, form, owner = case['mode'], case['form'], case['owner']
    duration = case['fps'] * (5 if form == 2 else 10)
    accepted = mode not in ['no-skill', 'low-mp']
    releases = int(accepted)
    remaining_mp = (19 if mode == 'low-mp' else 20 if mode == 'exact-mp' else 100) - 20*releases
    count, started, active, source = 0, None, accepted, True
    deadline = duration if accepted else None
    def snapshot():
        return dict(active=active, count=count, start=started if active else None,
                    duration=duration if active else None, source=source)
    states = [snapshot()]
    if mode == 'refresh-first':
        releases += 1
        remaining_mp -= 20
        started = 0
        states.append(snapshot())
    total = duration+3+(duration//2 if mode == 'refresh-mid' else 0)
    for tick in range(total):
        if mode == 'refresh-mid' and tick == duration//2:
            releases += 1
            remaining_mp -= 20
            started = count
            deadline = count+duration
            states.append(snapshot())
        if mode == 'pause' and tick == 2:
            states.extend([snapshot() for _ in range(7)])
        if mode in ['destroy', 'reenter'] and tick == 2:
            count, started, active, source, deadline = 0, None, False, False, None
            states.append(snapshot())
            if mode == 'reenter': source = True
        if active and started is None: started = count
        if active and count >= deadline: active = False
        count += 1
        states.append(snapshot())
    return dict(id=case['id'], accepted=accepted, mp=remaining_mp, attacks=releases,
                faces=releases if form > 2 or owner == 1 else 0,
                network=releases if owner == 1 else 0, states=states)


def verify():
    actual = json.loads((WORK/'rows.json').read_text(encoding='utf-8'))
    fixtures = cases()
    assert len(actual) == len(fixtures)
    for case, observed in zip(fixtures, actual):
        wanted = expected(case)
        for key in wanted:
            if key == 'states':
                assert len(wanted[key]) == len(observed[key]), (case, 'state count')
                for index, (a, b) in enumerate(zip(wanted[key], observed[key])):
                    assert a == b, (case, index, a, b)
            else:
                assert wanted[key] == observed[key], (case, key, wanted[key], observed[key])
    print('PASS', len(fixtures), 'Jifeng timelines;', sum(len(expected(c)['states']) for c in fixtures), 'states')


if __name__ == '__main__':
    # Freeze the oracle before executing the compiled source.
    out = ROOT/'docs/tasks/evidence/TASK-SETTINGS-252'
    out.mkdir(parents=True, exist_ok=True)
    (out/'effect-expected.json').write_text(json.dumps([expected(c) for c in cases()]), encoding='utf-8')
    run()
    verify()
