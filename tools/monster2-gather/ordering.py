"""257B bounded native broadcast investigation; not a gameplay truth generator."""
import sys
sys.dont_write_bytecode = True
import importlib.util
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('preflight', ROOT / 'tools/monster2-space-preflight/run.py')
base = importlib.util.module_from_spec(spec)
spec.loader.exec_module(base)
base.WORK = ROOT / 'local-resources/regima/task-outputs/TASK-SETTINGS-257B/ordering'
base.OUT = ROOT / 'docs/tasks/evidence/TASK-SETTINGS-257B'


def main():
    records = base.prepare()
    work = base.WORK
    (work / 'Probe.as').write_text((HERE / 'OrderingProbe.as').read_text(encoding='utf-8'), encoding='utf-8')
    results = []
    for label, command in [
        ('compile', ['java', '-Dflexlib=' + str(base.SDK / 'frameworks'), '-jar', str(base.SDK / 'lib/mxmlc-cli.jar'), '+configname=air', '-debug=true', '-output=Probe.swf', 'Probe.as']),
        ('run', [str(base.SDK / 'bin/adl.exe'), '-runtime', str(ROOT / 'local-resources/regima/source/unpacked'), str(work / 'application.xml'), str(work)]),
    ]:
        result = subprocess.run(command, cwd=work, capture_output=True, timeout=60)
        log = (result.stdout + result.stderr).decode(errors='replace')
        (work / (label + '.log')).write_text(log, encoding='utf-8')
        results.append(dict(command=command, exitCode=result.returncode))
        assert result.returncode == 0, log[-4000:]
    assert 'COMPLETE' in log and '51,1,1,5' in log
    rows = [json.loads(line[4:]) for line in log.splitlines() if line.startswith('ROW ')]
    result = dict(status='investigation-only', sources=records, commands=results, rows=rows,
                  probeSha256=base.digest(HERE / 'OrderingProbe.as'), runnerSha256=base.digest(Path(__file__)),
                  limitations=['Synthetic world listener with original move; not full MainGame/hero chain.',
                              'Natural time is measured, not fixed frame interpolation.'])
    (base.OUT / 'ordering.json').write_text(json.dumps(result, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(dict(states=len(rows), report='docs/tasks/evidence/TASK-SETTINGS-257B/ordering.json')))


if __name__ == '__main__':
    main()
