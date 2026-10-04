"""Require compiling native source mutants to fail the same frozen oracle."""
import json
from capture import ROOT, WORK, run
from verify import verify
from evidence import snapshot


def main():
    findings = []
    try:
        run()
        verify()
        for name in ['growth-threshold', 'miss-growth', 'mdef-draw', 'mdef-cap', 'miss-cap', 'save-position']:
            run(name)  # Compile/runtime failures are NOT mutation kills.
            try:
                verify()
            except AssertionError as error:
                findings.append(dict(mutation=name, killed=True, mismatch=str(error), files=snapshot(WORK, 'attribute-'+name)))
            else:
                raise RuntimeError('Surviving source mutant: '+name)
    finally:
        run()
        verify()
        baseline = snapshot(WORK, 'attribute-baseline')
    out = ROOT/'docs/tasks/evidence/TASK-SETTINGS-252'
    out.mkdir(parents=True, exist_ok=True)
    (out/'attribute-mutations.json').write_text(json.dumps(findings, indent=2), encoding='utf-8')
    (out/'attribute-rows.json').write_bytes((WORK/'rows.json').read_bytes())
    (out/'attribute-sources.json').write_bytes((WORK/'sources.json').read_bytes())
    (out/'attribute-baseline.json').write_text(json.dumps(baseline, indent=2), encoding='utf-8')
    print('PASS', len(findings), 'native source mutants')


if __name__ == '__main__':
    main()
