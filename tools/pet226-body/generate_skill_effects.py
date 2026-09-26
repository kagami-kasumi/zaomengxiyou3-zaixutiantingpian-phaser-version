"""Project regular family skill birth/config/lifetime from verified source and joint traces."""
import hashlib
import json
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[2]
family = sys.argv[1]
assert family in ('monkey', 'horse')
task = 228 if family == 'monkey' else 229
read = lambda p: json.loads(p.read_text(encoding='utf-8'))
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
truth = read(ROOT/f'docs/reverse-engineering/ground-truth/manifests/task-settings-{task}-pet-{family}-collision-phase.json')
report = read(ROOT/f'docs/tasks/evidence/TASK-SETTINGS-{task}/joint-verification.json')
assert truth['status'] == 'verified' and report['status'].startswith('passed') and not report['failures']
measurements = []
for item in report['measurements']:
    path = ROOT/f'local-resources/regima/task-outputs/TASK-SETTINGS-{task}/joint-air/measurement-{item["fps"]}.json'
    assert sha(path) == item['sha256']
    measurements.append((item['fps'], read(path)['rows']))
effects = []
for form in truth['body']['forms']:
    path = ROOT/form['sourcePath']
    assert sha(path) == form['sourceSha256']
    source = path.read_text(encoding='utf-8')
    actions = ['hit2'] if form['form'] == 1 else ['hit2', 'hit3'] if form['form'] == 2 else ['hit2', 'hit3', 'hit4']
    for action in actions:
        dictionary = re.search(r'this\.attackBackInfoDict\["'+action+r'"\]\s*=\s*(\{.*?\n\s*\});', source, re.S)[1]
        attack = {key: json.loads(re.search('"'+key+r'":([^,\n]+|\[[^\]]+\])', dictionary)[1])
                  for key in ['hitMaxCount', 'attackInterval', 'attackKind']}
        knockback = json.loads(re.search(r'"attackBackSpeed":(\[[^\]]+\])', dictionary)[1])
        projected = []
        for fps, rows in measurements:
            for owner in [1, 2]:
                scenario = [r for r in rows if r['id'] == f'{form["form"]}-{action}-P{owner}--1' and r['phase'] == 'enter']
                born = next(r for r in scenario if r['bullets'])
                configuration = []
                for bullet in born['bullets']:
                    assert bullet['birthTick'] == born['tick'] and not bullet['calls']
                    dead = next(r for r in scenario if any(b['symbol'] == bullet['symbol']
                        and b['birthTick'] == bullet['birthTick'] and b['dead'] for b in r['bullets']))
                    lifetime = dead['tick'] - bullet['birthTick']
                    timed = bullet['ttl'] > 0
                    assert not timed or lifetime == bullet['ttl']
                    ctor = re.search(r'new (FollowBaseObjectBullet|SpecialEffectBullet)\("'+bullet['symbol']+r'"\)', source)[1]
                    configuration.append(dict(symbol=bullet['symbol'], offsetX=(bullet['x']-born['x'])/bullet['d'],
                        offsetY=bullet['y']-born['y'], lifetime=lifetime/fps if timed else lifetime,
                        timed=timed, cut=bullet['cut'], disabled=bullet['disabled'], follows=ctor == 'FollowBaseObjectBullet'))
                projected.append(configuration)
        assert all(config == projected[0] for config in projected)
        effects.append(dict(form=form['form'], action=action, maxHits=attack['hitMaxCount'],
            interval=attack['attackInterval'], attackKind=attack['attackKind'], knockback=knockback,
            effects=projected[0], sourceSha256=form['sourceSha256']))
payload = json.dumps(dict(effects=effects, jointMeasurements=report['measurements']), indent=2)+'\n'
path = ROOT/f'src/assets/pet-{family}-effects.json'
if '--check' in sys.argv:
    assert path.read_text(encoding='utf-8') == payload, f'Stale {family} effects projection'
else:
    path.write_text(payload, encoding='utf-8', newline='\n')
print(f'Nine {family} skill configurations projected from original joint births and destruction.', flush=True)
