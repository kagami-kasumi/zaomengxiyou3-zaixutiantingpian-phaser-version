"""Bounded horse private effects under ordinary world pause, retaining native clips."""
import json
from pathlib import Path
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT/'tools/horse-spatial'))
import run_lifecycle as original

long_capture = '--long' in sys.argv
render_capture = '--render' in sys.argv
aoyi = sys.argv[sys.argv.index('--aoyi')+1] if '--aoyi' in sys.argv else None
assert aoyi in (None, 'death-at-9', 'above', 'below', 'alternating')
pause_end, end_tick = (140, 192) if long_capture else (52, 128)
suffix = '-long' if long_capture else ''
if aoyi: pause_end, end_tick, suffix = 140, 480, '-aoyi-'+aoyi
if render_capture:
    assert not aoyi
    pause_end, end_tick, suffix = 140, 192, '-render'
specs = [s for s in original.specs() if s['symbol'].startswith('PetHorse4Bullet5')] if aoyi else original.specs()
WORK = ROOT/f'local-resources/regima/task-outputs/TASK-SLICE-226/horse-world-pause-air{suffix}'
WORK.mkdir(parents=True, exist_ok=True)
copied = []
for source in original.WORK.rglob('*.as'):
    target = WORK/source.relative_to(original.WORK)
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source, target)
    copied.append(dict(path=source.relative_to(ROOT).as_posix(), sha256=original.sha(source)))
template, text = original.driver()
for before, after in [
    ('["natural","move-hurt","pause","explicit-destroy"]', '["natural","pause"]'),
    ('tick<=5', f'tick<={pause_end}'),
    ('if(!bullet.isReadyToDestroy){', 'if(!Config.instance.isStopGame && !bullet.isReadyToDestroy){'),
    ('config.fps*10+8', str(end_tick)),
]:
    assert text.count(before) == 1, before
    text = text.replace(before, after)
if render_capture:
    for before, after in [
        ('private function capturePhase(bullet:BaseBullet):void', 'private function capturePhase(bullet:BaseBullet,phase:String):void'),
        ('bullet.getImcName()+"|"+JSON.stringify', 'bullet.getImcName()+"|"+phase+"|"+JSON.stringify'),
        ('bullet.getImcName()+"-"+JSON.stringify', 'bullet.getImcName()+"-"+phase+"-"+JSON.stringify'),
    ]:
        assert text.count(before) == 1, before
        text = text.replace(before, after)
    assert text.count('capturePhase(bullet);') == 2
    text = text.replace('capturePhase(bullet);', 'capturePhase(bullet,"created");', 1)
    text = text.replace('capturePhase(bullet);', 'capturePhase(bullet,"enter");', 1)
    text = text.replace('capturePhase(item.bullet);', 'capturePhase(item.bullet,"exit");')
if aoyi and aoyi != 'death-at-9':
    before = 'if(tick==6){item.target.x-=160;item.target.y-=60;}\n                if(tick==9)item.target.dead=true;'
    assert text.count(before) == 1
    y = '-5000' if aoyi == 'above' else '5000' if aoyi == 'below' else 'bullet.y+(tick%2==0?-100:100)'
    text = text.replace(before, f'item.target.y={y};')
(WORK/'LifecycleProbe.as').write_text(text, encoding='utf-8')
(WORK/'application.xml').write_text((original.WORK/'application.xml').read_text().replace('regima.task229.lifecycle', 'regima.pet226.horseworldpause'+suffix))
command = ['java', '-Dflexlib='+str(original.SDK/'frameworks'), '-jar', str(original.SDK/'lib/mxmlc-cli.jar'), '+configname=air', '-debug=true', '-output=LifecycleProbe.swf', 'LifecycleProbe.as']
result = subprocess.run(command, cwd=WORK, capture_output=True, timeout=60)
(WORK/'compile.log').write_bytes(result.stdout+result.stderr)
assert result.returncode == 0, (result.stdout+result.stderr).decode(errors='replace')
definitions = json.loads((original.OUT/'source-definitions.json').read_text(encoding='utf-8'))
reports = []
for fps in [20, 24, 30]:
    fixture = dict(fps=fps, sources=[dict(path=str(ROOT/s['path']), sha256=s['sha256'], isolated=s['id']=='pet1') for s in definitions['sources']], effects=specs)
    (WORK/'fixtures.json').write_text(json.dumps(fixture))
    result = subprocess.run([str(original.SDK/'bin/adl.exe'), '-runtime', str(ROOT/'local-resources/regima/source/unpacked'), '-profile', 'desktop', str(WORK/'application.xml'), str(WORK)], cwd=WORK, capture_output=True, timeout=60)
    log = (result.stdout+result.stderr).decode(errors='replace')
    (WORK/f'run-{fps}.log').write_text(log, encoding='utf-8')
    assert result.returncode == 0 and 'COMPLETE ' in log, log
    all_rows = json.loads((WORK/'rows.json').read_text())
    enters = [r for r in all_rows if r['phase']=='enter']
    assert len(enters) == len(specs)*2*2*2*end_tick
    for row in enters:
        if row['paused']:
            assert row['state']['calls'] == [], row
    phases = json.loads((WORK/'native-phases.json').read_text())
    for phase in phases.values():
        phase['sha256'] = original.sha(WORK/phase['path'])
    report = dict(fps=fps, rows=enters, exitRows=[r for r in all_rows if r['phase']=='exit'], nativePhases=phases)
    path = WORK/f'measurement-{fps}.json'
    path.write_text(json.dumps(report, separators=(',', ':'))+'\n', encoding='utf-8')
    reports.append(dict(fps=fps, path=path.relative_to(ROOT).as_posix(), sha256=original.sha(path), states=len(enters)))
    print(f'horse ordinary pause {fps}: {len(enters)} native enter states', flush=True)
out = dict(status='verified-bounded-world-pause-lifecycle', copiedSources=copied,
           probeSha256=original.sha(WORK/'LifecycleProbe.as'), reports=reports,
           pauseEnd=pause_end, endTick=end_tick,
           trajectory=aoyi or 'death-at-9',
           scope=f'{len(specs)} constructor variants, P1/P2, directions0/1, three FPS; natural versus pause ticks3..{pause_end} through tick{end_tick}.',
           limitations='Original BaseBullet/subclasses/native clips with controlled source/target/collision/world caller. Not full MainGame, body births, damage, delayed callbacks or modern Scene.' + ('' if aoyi else ' Falling TTL beyond the observation window not covered.'))
(ROOT/f'docs/tasks/evidence/TASK-SLICE-226/horse-world-pause-native{suffix}.json').write_text(json.dumps(out, indent=2)+'\n', encoding='utf-8')
