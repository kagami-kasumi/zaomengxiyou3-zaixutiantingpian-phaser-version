"""Original doHit5 with a three-entry monster array, including a dead middle entry."""
import hashlib
import json
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[2]
base = ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-229'
work = ROOT/'local-resources/regima/task-outputs/TASK-SLICE-226/horse-aoyi-targets'
out = ROOT/'docs/tasks/evidence/TASK-SLICE-226/horse-aoyi-targets'
work.mkdir(parents=True, exist_ok=True); out.mkdir(parents=True, exist_ok=True)
for source in (base/'joint-air').rglob('*.as'):
    destination = work/source.relative_to(base/'joint-air')
    destination.parent.mkdir(parents=True, exist_ok=True); shutil.copyfile(source, destination)
for name in ['source-definitions.json', 'body-inputs.json', 'joint-methods.json']:
    shutil.copyfile(ROOT/'docs/tasks/evidence/TASK-SETTINGS-229'/name, out/name)
probe = (ROOT/'tools/horse-spatial/JointProbe.as').read_text(encoding='utf-8')
before = 'actor.gc.pWorld.monsterArray=[target];'
assert probe.count(before) == 1
probe = probe.replace(before, '''var middle:FixtureTarget=new FixtureTarget();middle.x=710;middle.y=320;middle.id="middle-P"+owner;middle.dead=true;
            var last:FixtureTarget=new FixtureTarget();last.x=820;last.y=350;last.id="last-P"+owner;
            actor.gc.gameSence.addChild(middle);actor.gc.gameSence.addChild(last);
            actor.gc.pWorld.monsterArray=[target,middle,last];''')
(work/'JointProbe.as').write_text(probe, encoding='utf-8')
runner_path = ROOT/'tools/horse-spatial/run_joint.py'
text = runner_path.read_text(encoding='utf-8')
for before, after in {
    'shutil.copyfile(probe,WORK/probe.name)': 'probe=WORK/probe.name',
    "body=WORK.parent/'body-air/body-source.swf'": "body=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-229/body-air/body-source.swf'",
    'regima.task229.joint': 'regima.task226.horsearray',
}.items():
    assert text.count(before) == 1; text = text.replace(before, after)
runner = {'__name__': 'horse_array_runner', '__file__': str(runner_path)}
exec(compile(text, str(runner_path), 'exec'), runner)
runner.update(WORK=work, OUT=out)
runner['main']()
print('Original three-target doHit5 measured; source geometry/hit sinks unchanged.')
