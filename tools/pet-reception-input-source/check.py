"""Bind source, fixtures and compiled evidence; reject stale/damaged reports."""
import copy
import json
from pathlib import Path
import sys
from evidence import ROOT, OUT, digest
from fixtures import generate
from effects import cases
from verify_effects import expected

HERE = Path(__file__).resolve().parent
REFERENCE = ROOT/'docs/reverse-engineering/reference/pet-reception-input-contract.json'
NAMES = {
    'attribute': ['growth-threshold', 'miss-growth', 'mdef-draw', 'mdef-cap', 'miss-cap', 'save-position'],
    'effect': ['late-expiry', 'early-expiry', 'refresh-clock', 'destroy-retains', 'first-step-gate', 'form-duration', 'cooldown-gate'],
}


def read(path):
    return json.loads(path.read_text(encoding='utf-8'))


def compare_rows(kind, rows):
    if kind == 'effect':
        assert rows == [expected(case) for case in cases()]
        return
    import math
    assert len(rows) == len(generate())
    for row, case in zip(rows, generate()):
        assert row['id'] == case['id']
        for key, value in case['expected'].items():
            assert math.isclose(row[key], value, abs_tol=1e-12) if isinstance(value, (int, float)) else row[key] == value


def validate(report):
    assert report['status'] == 'verified'
    required = {p.relative_to(ROOT).as_posix() for p in list(HERE.glob('*.py'))+list(HERE.glob('*.as'))}
    for path, sha in report['files'].items():
        assert digest(ROOT/path) == sha, ('stale file', path)
    for kind, names in NAMES.items():
        mutants = read(OUT/(kind+'-mutations.json'))
        assert [item['mutation'] for item in mutants] == names
        for item in mutants:
            assert item['killed'] and item['mismatch'] and item['files']
            required.update(item['files'])
            mutant = OUT/'runs'/(kind+'-'+item['mutation'])
            assert 'COMPLETE' in (mutant/'run.log').read_text(encoding='utf-8')
            assert digest(mutant/'Probe.swf') != digest(OUT/'runs'/(kind+'-baseline')/'Probe.swf')
            try: compare_rows(kind, read(mutant/'rows.json'))
            except AssertionError: pass
            else: raise AssertionError(('mutant does not contradict oracle', item['mutation']))
        required.update(read(OUT/(kind+'-baseline.json')))
        required.update((OUT/name).relative_to(ROOT).as_posix() for name in [kind+'-mutations.json', kind+'-baseline.json'])
        fixture = OUT/'runs'/(kind+'-baseline')
        assert read(fixture/'fixtures.json') == (generate() if kind == 'attribute' else cases())
        sources = read(fixture/'sources.json')
        if kind == 'effect': sources += read(fixture/'effect-sources.json')
        for item in sources:
            assert digest(ROOT/item['path']) == item.get('sha256', item.get('sourceSha256'))
        compare_rows(kind, read(fixture/'rows.json'))
    assert set(report['files']) == required
    assert report['coverage'] == {'attributeCases': len(generate()), 'effectTimelines': len(cases()), 'effectStates': sum(len(expected(c)['states']) for c in cases()), 'sourceMutants': sum(map(len, NAMES.values()))}
    assert report['formalSceneVerified'] is False


def freeze():
    files = {}
    for kind in NAMES:
        files.update(read(OUT/(kind+'-baseline.json')))
        for item in read(OUT/(kind+'-mutations.json')): files.update(item['files'])
        for name in [kind+'-mutations.json', kind+'-baseline.json']:
            path = OUT/name
            files[path.relative_to(ROOT).as_posix()] = digest(path)
    for path in list(HERE.glob('*.py'))+list(HERE.glob('*.as')):
        files[path.relative_to(ROOT).as_posix()] = digest(path)
    report = dict(status='verified', task='TASK-SETTINGS-252', files=files,
                  coverage=dict(attributeCases=len(generate()), effectTimelines=len(cases()), effectStates=sum(len(expected(c)['states']) for c in cases()), sourceMutants=sum(map(len, NAMES.values()))), formalSceneVerified=False)
    validate(report)
    failures = []
    for field, value in [('status', 'draft'), ('coverage', {}), ('formalSceneVerified', True), ('files', {})]:
        changed = copy.deepcopy(report)
        changed[field] = value
        try: validate(changed)
        except AssertionError: failures.append(field)
        else: raise AssertionError(('surviving damaged report', field))
    changed = copy.deepcopy(report)
    changed['files'][next(iter(changed['files']))] = '0'*64
    try: validate(changed)
    except AssertionError: failures.append('fileHash')
    else: raise AssertionError('surviving hash damage')
    (OUT/'verification.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    (OUT/'integrity-negative-checks.json').write_text(json.dumps(failures), encoding='utf-8')
    print('PASS frozen source evidence', report['coverage'], 'negative checks', len(failures))


if __name__ == '__main__':
    from contract import build
    if '--freeze' in sys.argv:
        freeze()
        REFERENCE.write_text(json.dumps(build(), ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    else:
        validate(read(OUT/'verification.json'))
        assert read(REFERENCE) == build(), 'reference differs from independently specified contract/witnesses'
        print('PASS bound native evidence')
