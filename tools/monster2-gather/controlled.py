"""Original Tween ABC finite-clock cases. Deliberately not full hero/world truth."""
import sys
sys.dont_write_bytecode = True
import json
import subprocess
from pathlib import Path
import ordering

base = ordering.base
HERE = Path(__file__).resolve().parent


def main():
    base.WORK = base.ROOT / 'local-resources/regima/task-outputs/TASK-SETTINGS-257B/controlled'
    records = base.prepare()
    work = base.WORK
    (work / 'Probe.as').write_text((HERE / 'ControlledProbe.as').read_text(encoding='utf-8'), encoding='utf-8')
    runs = []
    commands = [
        ['java', '-Dflexlib=' + str(base.SDK / 'frameworks'), '-jar', str(base.SDK / 'lib/mxmlc-cli.jar'), '+configname=air', '-debug=true', '-output=Probe.swf', 'Probe.as'],
        [str(base.SDK / 'bin/adl.exe'), '-runtime', str(base.ROOT / 'local-resources/regima/source/unpacked'), str(work / 'application.xml'), str(work)],
    ]
    for label, command in [('compile', commands[0]), ('normal', commands[1]), ('repeat', commands[1])]:
        result = subprocess.run(command, cwd=work, capture_output=True, timeout=60)
        log = (result.stdout + result.stderr).decode(errors='replace')
        (work / (label + '.log')).write_text(log, encoding='utf-8')
        assert result.returncode == 0, log[-4000:]
        if label != 'compile':
            assert 'COMPLETE' in log and '51,1,1,5' in log
            runs.append([json.loads(line[4:]) for line in log.splitlines() if line.startswith('ROW ')])
    assert runs[0] == runs[1], 'Controlled runs differ'
    result = dict(status='captured-not-verified', sources=records, commands=commands, rows=runs[0], repeatEqual=True,
                  probeSha256=base.digest(HERE / 'ControlledProbe.as'), runnerSha256=base.digest(Path(__file__)),
                  limitations=['Library clock/lifecycle only. Explicit movement, detach and global API inputs.',
                              'Not original death/destroy/scene paths or natural event scheduling.'])
    (base.OUT / 'controlled.json').write_text(json.dumps(result, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(dict(states=len(runs[0]), repeatEqual=True)))


if __name__ == '__main__':
    main()
