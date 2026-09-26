"""Project original Horse4 doHit5 parameters and original EnemyMove constants."""
import hashlib
import json
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[2]
read = lambda p: json.loads(p.read_text(encoding='utf-8'))
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
truth = read(ROOT/'docs/reverse-engineering/ground-truth/manifests/task-settings-229-pet-horse-collision-phase.json')
assert truth['status'] == 'verified'
form = next(f for f in truth['body']['forms'] if f['form'] == 4)
source_path = ROOT/form['sourcePath']
assert sha(source_path) == form['sourceSha256']
source = source_path.read_text(encoding='utf-8')
body = source.split('private function doHit5(')[1].split('private function hit5Hit(')[0]
motion_path = source_path.parents[1]/'bullet/EnemyMoveBullet.as'
motion = motion_path.read_text(encoding='utf-8')
methods = read(ROOT/'docs/tasks/evidence/TASK-SETTINGS-229/lifecycle-methods.json')['methods']
assert any(m['fileSha256'] == sha(motion_path) for m in methods)
number = lambda pattern, text: float(re.search(pattern, text)[1])
attack = lambda action, text: re.search(r'attackBackInfoDict\["'+action+r'"\] = (\{.*?\n\s*\});', text, re.S)[1]
dictionary = attack('hit5_1', body)
explode = attack('hit5_2', source)
def config(text):
    return dict(maxHits=int(number(r'"hitMaxCount":(\d+)', text)),
        interval=int(number(r'"attackInterval":(\d+)', text)),
        knockback=json.loads(re.search(r'"attackBackSpeed":(\[[^\]]+\])', text)[1]))
life = read(ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-229/lifecycle-air/measurement-24.json')
life_report = read(ROOT/'docs/tasks/evidence/TASK-SETTINGS-229/lifecycle-verification.json')
assert life_report['status'].startswith('passed') and not life_report['failures']
assert next(m for m in life_report['measurements'] if m['fps'] == 24)['sha256'] == sha(
    ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-229/lifecycle-air/measurement-24.json')
explosion_rows = [r for r in life['rows'] if r['id']=='PetHorse4Bullet5Explode_special-P1-1-natural']
explosion_end = next(r['tick'] for r in explosion_rows if r['state']['dead'])
data = dict(symbol=re.search(r'new EnemyMoveBullet\("([^"]+)"\)', body)[1],
    explosionSymbol='PetHorse4Bullet5Explode', explosionLastTick=explosion_end,
    attack=config(dictionary), explosionAttack=config(explode),
    ttlSeconds=number(r'setDestroyInCount\(gc.frameClips \* ([\d.]+)\)', body),
    distance=number(r'setDistance\(([\d.]+)\)', body),
    startY=number(r'_loc3_\.y = ([\d.]+);', body),
    spacing=number(r'\(_loc5_ / 2 - _loc6_\) \* ([\d.]+)', body),
    speed=[float(n) for n in re.search(r'setSpeed\(([^)]+)\)', body)[1].split(',')],
    acceleration=[float(n) for n in re.search(r'setAddSpeed\(([^)]+)\)', body)[1].split(',')],
    horizontalTrackingSpeed=number(r'private var speedx:Number = ([\d.]+)', motion),
    targetYOffset=number(r'this.moveTarget.y \+ ([\d.]+)', motion),
    trackingSpeed=number(r'this.speed.y = -([\d.]+);', motion),
    maxDownwardSpeed=number(r'if\(this.speed.y > ([\d.]+)\)', motion),
    sourceSha256=sha(source_path), motionSourceSha256=sha(motion_path),
    explosionLifecycleSha256=sha(ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-229/lifecycle-air/measurement-24.json'))
payload = json.dumps(data, indent=2)+'\n'
path = ROOT/'src/assets/pet-horse-aoyi.json'
if '--check' in sys.argv:
    assert path.read_text(encoding='utf-8') == payload
else:
    path.write_text(payload, encoding='utf-8', newline='\n')
print('Horse4 original aoyi constructor/motion configuration projected.')
