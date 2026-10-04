"""Run the shared-method coordinate investigation with original AIR runtime."""
import sys
sys.dont_write_bytecode = True
import json
import subprocess
import sys
from pathlib import Path
import shared


def main():
    mutation=sys.argv[1] if len(sys.argv)>1 and sys.argv[1]!='--repeat' else None
    suffix='-'+mutation if mutation else ('-repeat' if '--repeat' in sys.argv else '')
    work, records = shared.prepare(mutation)
    base = shared.base
    commands = [
        ['java', '-Dflexlib=' + str(base.SDK / 'frameworks'), '-jar', str(base.SDK / 'lib/mxmlc-cli.jar'), '+configname=air', '-debug=true', '-output=Probe.swf', 'Probe.as'],
        [str(base.SDK / 'bin/adl.exe'), '-runtime', str(base.ROOT / 'local-resources/regima/source/unpacked'), str(work / 'application.xml'), str(work)],
    ]
    for label, command in zip(['compile', 'run'], commands):
        result = subprocess.run(command, cwd=work, capture_output=True, timeout=120)
        log = (result.stdout + result.stderr).decode(errors='replace')
        (work / (label + suffix + '.log')).write_text(log, encoding='utf-8')
        assert result.returncode == 0, log[-6000:]
    assert 'COMPLETE' in log and '51,1,1,5' in log
    rows = [json.loads(line[4:]) for line in log.splitlines() if line.startswith('ROW ')]
    result = dict(status='captured-not-verified', mutation=mutation, sources=records, commands=commands, rows=rows,
                  generatedHashes={str(p.relative_to(work)):base.digest(p) for p in work.rglob('*.as')},
                  tools={p.name:base.digest(p) for p in Path(__file__).parent.glob('*') if p.is_file()},
                  limitations=['Explicit controls/properties, flat wall input, no equipment/buffs/network/camera motion.',
                              'Original coordinate, world iteration, pause and destroy methods; not complete game.'])
    (base.OUT / ('shared'+suffix+'.json')).write_text(json.dumps(result, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(dict(states=len(rows), natural=sum(r['native'] for r in rows))))


if __name__ == '__main__':
    main()
