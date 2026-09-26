"""Original private bullet lifecycle with world calls omitted during ordinary pause."""
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'tools/horse-spatial'))
import run_lifecycle as original

WORK = ROOT / 'local-resources/regima/task-outputs/TASK-SLICE-226/aoyi-world-pause-air'
WORK.mkdir(parents=True, exist_ok=True)
copied = []
for source in original.WORK.rglob('*.as'):
    relative = source.relative_to(original.WORK)
    target = WORK / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source, target)
    copied.append(dict(path=source.relative_to(ROOT).as_posix(), sha256=original.sha(source)))
template, text = original.driver()
for before, after in [
    ('[0,1]', '[0]'),
    ('["natural","move-hurt","pause","explicit-destroy"]', '["natural","pause"]'),
    ('tick<=5', 'tick<=config.pauseEnd'),
    ('if(!bullet.isReadyToDestroy){', 'if(!Config.instance.isStopGame && !bullet.isReadyToDestroy){'),
    ('config.fps*10+8', '32'),
]:
    assert text.count(before) == 1, before
    text = text.replace(before, after)
(WORK / 'LifecycleProbe.as').write_text(text, encoding='utf-8')
xml = (original.WORK / 'application.xml').read_text().replace('regima.task229.lifecycle', 'regima.pet226.worldpause')
(WORK / 'application.xml').write_text(xml)
command = ['java', '-Dflexlib=' + str(original.SDK / 'frameworks'), '-jar', str(original.SDK / 'lib/mxmlc-cli.jar'), '+configname=air', '-debug=true', '-output=LifecycleProbe.swf', 'LifecycleProbe.as']
result = subprocess.run(command, cwd=WORK, capture_output=True, timeout=60)
(WORK / 'compile.log').write_bytes(result.stdout + result.stderr)
assert result.returncode == 0, (result.stdout + result.stderr).decode(errors='replace')
definitions = json.loads((original.OUT / 'source-definitions.json').read_text(encoding='utf-8'))
reports = []
for fps in [20, 24, 30]:
    for pause_end in [5, 12, 13, 18]:
        fixture = dict(fps=fps, pauseEnd=pause_end,
                       sources=[dict(path=str(ROOT / s['path']), sha256=s['sha256'], isolated=s['id'] == 'pet1') for s in definitions['sources']],
                       effects=[s for s in original.specs() if s['symbol'] == 'AoyiBuff'])
        (WORK / 'fixtures.json').write_text(json.dumps(fixture))
        result = subprocess.run([str(original.SDK / 'bin/adl.exe'), '-runtime', str(ROOT / 'local-resources/regima/source/unpacked'), '-profile', 'desktop', str(WORK / 'application.xml'), str(WORK)], cwd=WORK, capture_output=True, timeout=45)
        log = (result.stdout + result.stderr).decode(errors='replace')
        (WORK / f'run-{fps}-{pause_end}.log').write_text(log, encoding='utf-8')
        assert result.returncode == 0 and 'COMPLETE ' in log, log
        rows = json.loads((WORK / 'rows.json').read_text())
        enters = [r for r in rows if r['phase'] == 'enter']
        assert len(enters) == 128
        for row in enters:
            if row['paused']:
                assert not row['state']['calls'] and not row['state']['dead'], row
                assert row['state']['frame'] == (row['tick'] - 1) % 14 + 1, row
        deaths = {}
        for owner in ['P1', 'P2']:
            for mode in ['natural', 'pause']:
                group = [r for r in enters if r['id'] == f'AoyiBuff_follow-{owner}-0-{mode}']
                death = next(r['tick'] for r in group if r['state']['dead'])
                expected = 14 if mode == 'natural' or pause_end < 14 else 28
                assert death == expected, (fps, pause_end, owner, mode, death)
                deaths[owner + '-' + mode] = death
        reports.append(dict(fps=fps, pauseEnd=pause_end, deaths=deaths, rows=enters))
out = dict(status='verified-bounded-world-pause-lifecycle', copiedSources=copied,
           probeSha256=original.sha(WORK / 'LifecycleProbe.as'), reports=reports,
           limitations='Original BaseBullet/Follow methods and native AoyiBuff; controlled world caller skips step2 during pause, controlled owner/target and collision sinks. MainGame pause traversal is verified separately. Not modern Scene acceptance.')
(ROOT / 'docs/tasks/evidence/TASK-SLICE-226/aoyi-world-pause-native.json').write_text(json.dumps(out, indent=2) + '\n', encoding='utf-8')
print('1536 native enter states: paused private clip loops; resume removes at actual frame14 (world tick14 or28), not frozen combat age14.')
