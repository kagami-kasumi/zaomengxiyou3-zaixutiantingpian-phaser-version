"""Original hero clearPet/updatePet gate around the bounded 229 callback fixture.
Only child/body stepping is supplied by the fixture; this is not a full BaseHero game.
"""
import hashlib
import json
from pathlib import Path
import shutil
import sys

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT/'tools/horse-spatial'))
import run_cleanup
from prepare_lifecycle import take

BASE = ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-229/cleanup-air'
WORK = ROOT/'local-resources/regima/task-outputs/TASK-SLICE-226/horse-retired-parent-air'
WORK.mkdir(parents=True, exist_ok=True)
for source in BASE.rglob('*.as'):
    target = WORK/source.relative_to(BASE)
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source, target)
hero_source = ROOT/'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/base/BaseHero.as'
methods = {name: take(hero_source, name) for name in ['clearPet', 'updatePet']}
hero = WORK/'CallbackHero.as'
s = hero.read_text()
s = s.replace('public function clearPet():void{clears++;}',
              'public var myPet:CallbackBase;' + methods['clearPet'] + methods['updatePet'])
hero.write_text(s)
body = WORK/'CallbackBase.as'
s = body.read_text().replace('public function getBBDC()', '''public function step():void{
    for each(var bullet:BaseBullet in magicBulletArray){bullet.calls=[];if(!bullet.isReadyToDestroy)bullet.step2();}
    if(!isReadyToDestroy)bbdc.step();
}public function getBBDC()''')
body.write_text(s)
probe = WORK/'CleanupProbe.as'
s = probe.read_text()
s = s.replace('actor.id="P"+owner;', 'actor.sourceRole.myPet=actor;actor.id="P"+owner;')
s = s.replace('mode:mode,actor:actor,', 'mode:mode,actor:actor,hero:actor.sourceRole,')
old = 'for each(var bullet:BaseBullet in actor.magicBulletArray){bullet.calls=[];if(!bullet.isReadyToDestroy)bullet.step2();}\n                if(!actor.isReadyToDestroy)actor.bbdc.step();'
assert old in s
s = s.replace(old, 'item.hero.updatePet();')
probe.write_text(s)
run_cleanup.WORK = WORK
reports = []
for fps in [20, 24, 30]:
    sys.argv = [__file__, str(fps)]
    run_cleanup.main()
    path = WORK/f'measurement-{fps}.json'
    data = json.loads(path.read_text())
    data['scope'] = 'Exact original BaseHero.updatePet/clearPet gate, original parent destroy and Tween callback; bounded child/body-only actor step, explicit successful hit, no full Scene/HP/replacement caller claim.'
    data['heroSourceSha256'] = hashlib.sha256(hero_source.read_bytes()).hexdigest()
    data['heroMethodSha256'] = {name: hashlib.sha256(code.encode()).hexdigest() for name,code in methods.items()}
    path.write_text(json.dumps(data, separators=(',', ':'))+'\n')
    samples = []
    for owner in [1,2]:
        for skills in [5,7]:
            rows = [r for r in data['rows'] if r['id'] == f'4-hit5-P{owner}-{skills}-destroy-live' and r['phase'] == 'exit']
            born = next(r for r in rows if any(b['symbol']=='PetHorse4Bullet5Explode' for b in r['bullets']))
            final = rows[-1]
            samples.append(dict(id=final['id'],born=born['tick'],finalTick=final['tick'],cleanup=final['cleanup'],bullets=final['bullets']))
    reports.append(dict(fps=fps,path=path.relative_to(ROOT).as_posix(),sha256=hashlib.sha256(path.read_bytes()).hexdigest(),samples=samples))
out = ROOT/'docs/tasks/evidence/TASK-SLICE-226/horse-retired-parent-native.json'
out.write_text(json.dumps(dict(status='observed-not-full-scene',reports=reports),indent=2)+'\n')
