"""Native long-lived Horse4 effect phases, without rewriting the archived 229 oracle."""
import hashlib
import json
from pathlib import Path
import shutil
import sys

ROOT = Path(__file__).resolve().parents[2]
scale = sys.argv[1]
assert scale in ('source', 'formal')
work = ROOT/f'local-resources/regima/task-outputs/TASK-SLICE-226/horse-aoyi-collision-{scale}'
out = ROOT/f'docs/tasks/evidence/TASK-SLICE-226/horse-aoyi-collision-{scale}'
out.mkdir(parents=True, exist_ok=True)
shutil.copyfile(ROOT/'docs/tasks/evidence/TASK-SETTINGS-229/source-definitions.json', out/'source-definitions.json')
runner_path = ROOT/'tools/horse-spatial/run_natural_collision.py'
text = runner_path.read_text(encoding='utf-8')
changes = {
    "o['symbol'].startswith('PetHorse') and o['symbol']!='PetHorseIceEffect'": "o['symbol']=='PetHorse4Bullet5'",
    'ticks=121': 'ticks=320',
    '*122': '*321',
    'regima.task229.naturalcollision': f'regima.task226.horselong.{scale}',
}
if scale == 'formal':
    changes['shutil.copyfile(probe,WORK/probe.name)'] = '''probe_text=probe.read_text(encoding='utf-8')
    assert probe_text.count('shape.scaleX=target.symbol=="ObjectBaseSprite7"?0.5:1;')==1
    (WORK/probe.name).write_text(probe_text.replace('shape.scaleX=target.symbol=="ObjectBaseSprite7"?0.5:1;',
        'shape.scaleX=target.symbol=="ObjectBaseSprite7"?1:2;'),encoding='utf-8')'''
for before, after in changes.items():
    assert text.count(before) == 1, before
    text = text.replace(before, after)
runner = {'__name__': 'horse_long_collision_runner', '__file__': str(runner_path)}
exec(compile(text, str(runner_path), 'exec'), runner)
runner.update(WORK=work, OUT=out)
runner['main']()
path = work/'measurement.json'
data = json.loads(path.read_text())
assert all(c['hit'] == c['reference'] for c in data['cases'])
assert set(c['tick'] for c in data['cases']) == set(range(321))
original = json.loads((ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-229/natural-collision-air/measurement.json').read_text())
known = {p['key']: p['phase'] for p in original['phases'] if p['symbol'] == 'PetHorse4Bullet5'}
assert all(p['key'] in known and p['phase'] == known[p['key']] for p in data['phases'])
report = dict(status='passed-bounded-check', scale=scale, cases=len(data['cases']), ticks=321,
    measurementSha256=hashlib.sha256(path.read_bytes()).hexdigest(),
    actualProbeSha256=hashlib.sha256((work/'NaturalCollisionProbe.as').read_bytes()).hexdigest(),
    driverSha256=hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
    scope='Natural original MovieClip and native HitTest through tick 320, all recursive phase keys match existing verified geometry. '
          'Exact cyan raster reduction is a second reduction of the same native blend; no arbitrary-duration periodicity claim.')
(out/'verification.json').write_text(json.dumps(report, indent=2)+'\n', encoding='utf-8')
print(scale, report['cases'], 'long native collision cases passed')
