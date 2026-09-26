"""Persistent-live-target extension of 229; leaves archived measurements unchanged."""
import hashlib
import json
from pathlib import Path
import runpy
import shutil
import sys

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT/'tools/horse-spatial'))
fps = int(sys.argv[1])
trajectory = sys.argv[2]
assert fps in (20, 24, 30) and trajectory in ('above', 'below', 'alternating')
work = ROOT/f'local-resources/regima/task-outputs/TASK-SLICE-226/horse-aoyi-live-{trajectory}'
out = ROOT/f'docs/tasks/evidence/TASK-SLICE-226/horse-aoyi-live-{trajectory}'
work.mkdir(parents=True, exist_ok=True)
out.mkdir(parents=True, exist_ok=True)
shutil.copyfile(ROOT/'docs/tasks/evidence/TASK-SETTINGS-229/source-definitions.json', out/'source-definitions.json')
prepare = runpy.run_path(str(ROOT/'tools/horse-spatial/prepare_lifecycle.py'))
prepare['main'].__globals__.update(WORK=work, OUT=out)
prepare['main']()
runner_path = ROOT/'tools/horse-spatial/run_lifecycle.py'
runner_text = runner_path.read_text(encoding='utf-8')
assert runner_text.count('regima.task229.lifecycle') == 1
# AIR forwards a duplicate application ID to its running instance; isolate these fixtures.
runner_text = runner_text.replace('regima.task229.lifecycle', f'regima.task226.live.{trajectory}')
runner = {'__name__': 'horse_live_target_runner'}
exec(compile(runner_text, str(runner_path), 'exec'), runner)
original_driver, original_specs = runner['driver'], runner['specs']


def driver():
    template, text = original_driver()
    old = 'if(tick==6){item.target.x-=160;item.target.y-=60;}\n                if(tick==9)item.target.dead=true;'
    assert text.count(old) == 1
    # Only the controlled target is changed; original EnemyMove methods stay intact.
    value = '-5000' if trajectory == 'above' else '5000' if trajectory == 'below' else 'bullet.y+(tick%2==0?-100:100)'
    return template, text.replace(old, f'item.target.y={value};')


runner['main'].__globals__.update(WORK=work, OUT=out, driver=driver,
    specs=lambda: [s for s in original_specs() if s['kind'] in ('enemy', 'tracking')])
runner['main']()
path = work/f'measurement-{fps}.json'
data = json.loads(path.read_text(encoding='utf-8'))
check = runpy.run_path(str(ROOT/'tools/horse-spatial/verify_lifecycle.py'))['check']
specs = {s['id']: s for s in data['fixtures']['effects']}
failures, groups = [], {}
for row in data['rows']:
    if row['phase'] != 'enter':
        continue
    assert not row['target']['dead']
    errors = check(row, specs[row['id'].split('-')[0]])
    if errors:
        failures.append(dict(id=row['id'], tick=row['tick'], fields=errors))
    groups.setdefault(row['id'], []).append(row)
deaths = {key: next(r['tick'] for r in rows if r['state']['dead']) for key, rows in groups.items()}
assert not failures, failures[:3]
assert max(value for key, value in deaths.items() if '_tracking-' in key) > 121
report = dict(status='passed-bounded-check', fps=fps, trajectory=trajectory,
    measurementSha256=hashlib.sha256(path.read_bytes()).hexdigest(), rows=len(data['rows']),
    firstDeadTicks=deaths, failures=failures,
    scope='Original EnemyMove methods with persistent live controlled targets; collision/damage are sinks. '
          'Three-tick pause only; no universal pause duration or target-path coverage claim.')
(out/f'verification-{fps}.json').write_text(json.dumps(report, indent=2)+'\n', encoding='utf-8')
print('Persistent live target:', fps, trajectory, 'first-dead range', min(deaths.values()), max(deaths.values()))
