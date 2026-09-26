"""Original monkey private effects with ordinary world calls stopped during pause."""
import hashlib
import json
from pathlib import Path
import shutil
import subprocess

ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-228/lifecycle-air'
WORK = ROOT/'local-resources/regima/task-outputs/TASK-SLICE-226/monkey-world-pause-air'
SDK = Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')
WORK.mkdir(parents=True, exist_ok=True)
def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()
copied = []
for source in BASE.rglob('*.as'):
    target = WORK/source.relative_to(BASE)
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source, target)
    copied.append(dict(path=source.relative_to(ROOT).as_posix(), sha256=sha(source)))
text = (ROOT/'tools/monkey-spatial/LifecycleProbe.as').read_text(encoding='utf-8')
for before,after in [
    ('["natural","move-hurt","pause","explicit-destroy"]', '["natural","pause"]'),
    ('tick<=5', 'tick<=140'),
    ('if(!bullet.isReadyToDestroy){', 'if(!Config.instance.isStopGame && !bullet.isReadyToDestroy){'),
    ('config.fps*4+8', '280'),
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
(WORK/'LifecycleProbe.as').write_text(text, encoding='utf-8')
(WORK/'application.xml').write_text((BASE/'application.xml').read_text().replace('regima.task228.lifecycle', 'regima.pet226.monkeyworldpause'))
result = subprocess.run(['java', '-Dflexlib='+str(SDK/'frameworks'), '-jar', str(SDK/'lib/mxmlc-cli.jar'), '+configname=air', '-debug=true', '-output=LifecycleProbe.swf', 'LifecycleProbe.as'], cwd=WORK, capture_output=True, timeout=60)
(WORK/'compile.log').write_bytes(result.stdout+result.stderr)
assert result.returncode == 0, (result.stdout+result.stderr).decode(errors='replace')
definitions = json.loads((ROOT/'docs/tasks/evidence/TASK-SETTINGS-228/source-definitions.json').read_text())
effects = [dict(symbol=n,follow=n in ['PetMonkey1Bullet2','PetMonkey2Bullet2_1','PetMonkey2Bullet2_2','PetMonkey3Bullet3_1','PetMonkey3Bullet3_2'],
                disabled=n in ['PetMonkey2Bullet2_1','PetMonkey3Bullet3_1'], xj=n=='PetMonkey1Bullet2') for n in definitions['sources'][0]['roots']]
reports = []
for fps in [20,24,30]:
    fixture = dict(fps=fps, sources=[dict(path=str(ROOT/s['path']),sha256=s['sha256']) for s in definitions['sources']], effects=effects)
    (WORK/'fixtures.json').write_text(json.dumps(fixture))
    result = subprocess.run([str(SDK/'bin/adl.exe'), '-runtime', str(ROOT/'local-resources/regima/source/unpacked'), '-profile', 'desktop', str(WORK/'application.xml'), str(WORK)], cwd=WORK, capture_output=True, timeout=60)
    log = (result.stdout+result.stderr).decode(errors='replace')
    (WORK/f'run-{fps}.log').write_text(log, encoding='utf-8')
    assert result.returncode == 0 and 'COMPLETE ' in log, log
    raw = json.loads((WORK/'rows.json').read_text())
    enters = [r for r in raw if r['phase']=='enter']
    assert len(enters) == len(effects)*2*2*2*280
    for row in enters:
        if row['paused']: assert row['state']['calls'] == [], row
    phases = json.loads((WORK/'native-phases.json').read_text())
    for phase in phases.values(): phase['sha256'] = sha(WORK/phase['path'])
    path = WORK/f'measurement-{fps}.json'
    path.write_text(json.dumps(dict(fps=fps,rows=enters,exitRows=[r for r in raw if r['phase']=='exit'],nativePhases=phases),separators=(',',':'))+'\n',encoding='utf-8')
    reports.append(dict(fps=fps,path=path.relative_to(ROOT).as_posix(),sha256=sha(path),states=len(enters)))
    print(f'monkey ordinary pause {fps}: {len(enters)} native enter states', flush=True)
out = dict(status='verified-bounded-world-pause-lifecycle',copiedSources=copied,probeSha256=sha(WORK/'LifecycleProbe.as'),reports=reports,
    pauseEnd=140,endTick=280,scope='Nine original constructors, P1/P2, directions0/1, natural versus ordinary world pause ticks3..140.',
    limitations='Controlled source/target/collision/world caller, original BaseBullet/Follow and native clips; not body births, actual damage or full MainGame/modern Scene.')
(ROOT/'docs/tasks/evidence/TASK-SLICE-226/monkey-world-pause-native.json').write_text(json.dumps(out,indent=2)+'\n',encoding='utf-8')
