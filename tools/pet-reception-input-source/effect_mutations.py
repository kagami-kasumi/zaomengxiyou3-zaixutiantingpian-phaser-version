"""Actual AS3 effect mutants must compile/run and contradict the frozen oracle."""
import json
from effects import ROOT, WORK, run
from verify_effects import verify
from evidence import snapshot


def main():
    findings = []
    try:
        run()
        verify()
        for name in ['late-expiry', 'early-expiry', 'refresh-clock', 'destroy-retains', 'first-step-gate', 'form-duration', 'cooldown-gate']:
            run(name)
            try:
                verify()
            except AssertionError as error:
                findings.append(dict(mutation=name, killed=True, mismatch=str(error), files=snapshot(WORK, 'effect-'+name)))
            else:
                raise RuntimeError('Surviving source mutant: '+name)
    finally:
        run()
        verify()
        baseline = snapshot(WORK, 'effect-baseline')
    out = ROOT/'docs/tasks/evidence/TASK-SETTINGS-252'
    out.mkdir(parents=True, exist_ok=True)
    (out/'effect-mutations.json').write_text(json.dumps(findings, indent=2), encoding='utf-8')
    (out/'effect-rows.json').write_bytes((WORK/'rows.json').read_bytes())
    (out/'effect-sources.json').write_bytes((WORK/'effect-sources.json').read_bytes())
    (out/'effect-baseline.json').write_text(json.dumps(baseline, indent=2), encoding='utf-8')
    print('PASS', len(findings), 'native effect mutants')


if __name__ == '__main__':
    main()
