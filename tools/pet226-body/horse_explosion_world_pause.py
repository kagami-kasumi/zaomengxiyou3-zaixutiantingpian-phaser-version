"""Original hit5Hit/TweenMax while the controlled world caller is suspended."""
import hashlib
import json
from pathlib import Path
import shutil
import subprocess

ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-229/explosion-air'
WORK = ROOT/'local-resources/regima/task-outputs/TASK-SLICE-226/horse-explosion-world-pause'
SDK = Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')
WORK.mkdir(parents=True, exist_ok=True)
def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()
copied = []
for source in BASE.rglob('*.as'):
    target = WORK/source.relative_to(BASE)
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source, target)
    copied.append(dict(path=source.relative_to(ROOT).as_posix(), sha256=sha(source)))
probe = WORK/'ExplosionProbe.as'
code = probe.read_text(encoding='utf-8')
for before, after in [
    ('tick++;TweenMax.tick=tick;', 'tick++;TweenMax.tick=tick;Config.instance.isStopGame=tick>=7&&tick<=config.fps*2+10;'),
    ('if(!bullet.isReadyToDestroy)bullet.step2();', 'if(!Config.instance.isStopGame&&!bullet.isReadyToDestroy)bullet.step2();'),
    ('actor.bbdc.step();', 'if(!Config.instance.isStopGame)actor.bbdc.step();'),
    ('if(tick==config.fps*2+15)', 'if(tick==config.fps*4+60)'),
]:
    assert code.count(before) == 1, before
    code = code.replace(before, after)
probe.write_text(code, encoding='utf-8')
(WORK/'application.xml').write_text((BASE/'application.xml').read_text().replace('regima.task229.explosion', 'regima.pet226.explosionworldpause'))
result = subprocess.run(['java', '-Dflexlib='+str(SDK/'frameworks'), '-jar', str(SDK/'lib/mxmlc-cli.jar'), '+configname=air', '-debug=true', '-output=ExplosionProbe.swf', 'ExplosionProbe.as'], cwd=WORK, capture_output=True, timeout=60)
(WORK/'compile.log').write_bytes(result.stdout+result.stderr)
assert result.returncode == 0, (result.stdout+result.stderr).decode(errors='replace')
fixture = json.loads((BASE/'fixtures.json').read_text())
reports = []
for fps in [20, 24, 30]:
    fixture['fps'] = fps
    (WORK/'fixtures.json').write_text(json.dumps(fixture), encoding='utf-8')
    result = subprocess.run([str(SDK/'bin/adl.exe'), '-runtime', str(ROOT/'local-resources/regima/source/unpacked'), '-profile', 'desktop', str(WORK/'application.xml'), str(WORK)], cwd=WORK, capture_output=True, timeout=90)
    log = (result.stdout+result.stderr).decode(errors='replace')
    (WORK/f'run-{fps}.log').write_text(log, encoding='utf-8')
    assert result.returncode == 0 and 'COMPLETE ' in log, log[-3000:]
    rows = json.loads((WORK/'rows.json').read_text())
    delays = json.loads((WORK/'delays.json').read_text())
    assert len(rows) == 80*2*(fps*4+60)
    # Successful delayed hits must fire while the world is paused, including
    # the dead/ready owner cases. The source callback separately decides birth.
    assert delays and all(len(d['fires']) == 1 and 7 <= d['fires'][0]['tick'] <= fps*2+10 for d in delays)
    path = WORK/f'measurement-{fps}.json'
    path.write_text(json.dumps(dict(fps=fps, pauseStart=7, pauseEnd=fps*2+10, rows=rows, delays=delays), separators=(',', ':'))+'\n', encoding='utf-8')
    reports.append(dict(fps=fps,path=path.relative_to(ROOT).as_posix(),sha256=sha(path),states=len(rows),delays=len(delays)))
    print(f'{fps} fps: {len(rows)} original states; {len(delays)} native wall-clock callbacks inside world pause', flush=True)
out = dict(status='verified-bounded-callback-world-pause',copiedSources=copied,probeSha256=sha(probe),reports=reports,
           sourceSwfs=[dict(path=s['path'],sha256=sha(Path(s['path']))) for s in fixture['sources']],
           scope='Original Horse4 body/explicit successful-hit callback, original pet1 TweenMax and native clip lifecycle; world caller skips body and private steps during pause. Controlled HP/ready/reference changes, not actual collision or full MainGame/canvas.')
(ROOT/'docs/tasks/evidence/TASK-SLICE-226/horse-explosion-world-pause-native.json').write_text(json.dumps(out,indent=2)+'\n',encoding='utf-8')
