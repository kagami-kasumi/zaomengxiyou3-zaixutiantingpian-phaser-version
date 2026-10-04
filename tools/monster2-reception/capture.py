"""258 bounded receiver fixture; reuse 251 scaffolding, never its damage observations."""
import hashlib
import importlib.util
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
sys.dont_write_bytecode = True
sys.path.insert(0, str(HERE.parent / 'monster3-reception-source'))
import capture as base
from source import RECORDS, take, methods
from restore_returnvoid import restore

WORK = ROOT / 'local-resources/regima/task-outputs/TASK-SETTINGS-258'
OUT = ROOT / 'docs/tasks/evidence/TASK-SETTINGS-258'

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

def prepare(label):
    work = WORK / label
    base.WORK = work
    base.prepare()
    def edit(name, old, new):
        p = work / name
        s = p.read_text(encoding='utf-8')
        assert old in s, (name, old)
        p.write_text(s.replace(old, new), encoding='utf-8')
    constructor = take('export/monster/Monster2.as', 'Monster2')
    (work / 'Monster2.as').write_text('package {public dynamic class Monster2 extends BaseMonster {' + constructor + '}}', encoding='utf-8')
    # Remove the unused previous monster; its original observations are never inputs.
    (work / 'Monster3.as').unlink()
    RECORDS[:] = [r for r in RECORDS if not r['path'].endswith('/Monster3.as')]
    edit('BaseBullet.as', "return 'Monster3Bullet1';", 'return symbol;')
    edit('BaseBullet.as', "public function BaseBullet(){", "public var symbol:String='Monster2Bullet1_1';public function BaseBullet(){")
    edit('BaseObject.as', 'public var attackId:int=1;', 'public function isDead():Boolean{return false;} public var attackId:int=1;')
    for name in ['BaseHero', 'BasePet']:
        edit(name + '.as', 'public dynamic class ' + name + ' extends BaseObject{',
             'public dynamic class ' + name + ' extends BaseObject{' + methods('base/' + name + '.as', ['isDead']))
    edit('Config.as', 'public function getPlayerArray():Array{return players;}',
         'public var hero1:BaseHero,hero2:BaseHero;' + methods('config/Config.as', ['getPlayerArray']))
    # Only the original protection countdown block is needed; movement/visuals are separately proven.
    step = take('base/BaseObject.as', 'step')
    countdown = step[step.index('         if(this.fatherCount >= 0)'):step.index('         if(this.hmzfatherCount >= 0)')]
    RECORDS[-1]['fragment'] = 'isYourFather countdown block only; excludes physics, body and other effects'
    edit('BaseObject.as', 'public var attackId:int=1;', 'public function protectionStep():void{' + countdown + '} public var attackId:int=1;')
    life_spec = importlib.util.spec_from_file_location('lifecycle258', HERE / 'lifecycle.py')
    life = importlib.util.module_from_spec(life_spec); life_spec.loader.exec_module(life); life.install(edit)
    spec = importlib.util.spec_from_file_location('fixtures258', HERE / 'fixtures.py')
    f = importlib.util.module_from_spec(spec); spec.loader.exec_module(f)
    (work / 'fixtures.json').write_text(json.dumps(f.generate(), separators=(',', ':')), encoding='utf-8')
    for name in ['Probe.as', 'WorldProbe.as']:
        (work / name).write_text((HERE / name).read_text(encoding='utf-8'), encoding='utf-8')
    edit('application.xml', 'regima.task251.reception', 'regima.task258.' + label)
    (work / 'sources.json').write_text(json.dumps(RECORDS, indent=2), encoding='utf-8')
    return work

def run(label='baseline', mutation=None):
    work = prepare(label)
    if mutation:
        mutation(work)
    commands = [ ['java', '-Dflexlib=' + str(base.SDK / 'frameworks'), '-jar', str(base.SDK / 'lib/mxmlc-cli.jar'), '+configname=air', '-debug=true', '-output=Probe.swf', 'Probe.as'],
        [str(base.SDK / 'bin/adl.exe'), '-runtime', str(ROOT / 'local-resources/regima/source/unpacked'), str(work / 'application.xml'), str(work)] ]
    for phase, cmd in zip(['compile', 'run'], commands):
        result = subprocess.run(cmd, cwd=work, capture_output=True, timeout=60)
        log = (result.stdout + result.stderr).decode(errors='replace')
        (work / (phase + '.log')).write_text(log, encoding='utf-8')
        assert result.returncode == 0, log[-8000:]
        if phase == 'compile':
            restore(work)
    assert 'COMPLETE' in log, log[-4000:]
    data = dict(label=label, rows=json.loads((work / 'rows.json').read_text()),
        world=json.loads((work / 'world.json').read_text()), sources=list(RECORDS),
        commands=commands, fixtureSha256=sha(work / 'fixtures.json'),
        generatedSources={p.name:sha(p) for p in sorted(work.glob('*.as'))},
        returnvoid=json.loads((work / 'returnvoid-proof.json').read_text()), nativeLogSha256=sha(work / 'run.log'))
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / (label + '.json')).write_text(json.dumps(data, separators=(',', ':')), encoding='utf-8')
    print(label, len(data['rows']), len(data['world']), flush=True)
    return data

if __name__ == '__main__':
    run()

