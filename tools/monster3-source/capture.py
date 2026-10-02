"""247: original Monster3 methods, reusing 232's explicitly bounded service harness."""
import hashlib
import importlib.util
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

sys.dont_write_bytecode = True

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
OUT = ROOT / 'docs/tasks/evidence/TASK-SETTINGS-247'
WORK = ROOT / 'local-resources/regima/task-outputs/TASK-SETTINGS-247'
SPEC = importlib.util.spec_from_file_location('bounded232', HERE.parent / 'monster-body-order-source/capture.py')
base = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(base)


def prepare(mutation=None):
    base.WORK = WORK / 'source'
    base.RECORDS = []
    inherited = mutation if mutation in ['effects-first', 'death-clears', 'destroy-keeps', 'same-tick-hit'] else None
    # Each mutant gets a separate directory; none overwrites the accepted baseline.
    base.WORK = WORK / (mutation or 'baseline')
    work = base.prepare(inherited)
    base.RECORDS = [r for r in base.RECORDS if 'Monster30.as' not in r['path']]
    def put(name, value):
        (work / name).write_text(value, encoding='utf-8')
    def edit(name, old, new):
        p = work / name
        content = p.read_text(encoding='utf-8')
        assert old in content, (name, old)
        put(name, content.replace(old, new))
    path = 'export/monster/Monster3.as'
    init = base.take(path, 'initBBDC')
    holds = re.search(r'setFrameStopCount\((\[.*?\])\);', init).group(1)
    counts = re.search(r'setFrameCount\((\[.*?\])\);', init).group(1)
    edit('Clip.as', '[6,1,5,1]', counts)
    edit('Clip.as', '[[2,2,2,2,2,2],[15],[2,2,2,2,6],[10]]', holds)
    edit('Clip.as', 'public function getDirect():uint{return 0;}', 'public var direction:uint=0;public function getDirect():uint{return direction;}')
    constructor = base.take(path, 'Monster3')
    attacks = re.findall(r'this.attackBackInfoDict\["hit[12]"\] = \{.*?\};', constructor, re.S)
    assert len(attacks) == 2
    names = ['setAction', 'enterFrameFunc', 'doHi1', 'doHi2', 'exitFrameFunc', 'scriptFrameOverFunc', 'destroy']
    methods = '\n'.join(base.take(path, name) for name in names).replace('override protected', 'protected')
    if mutation == 'display-only':
        methods = methods.replace('this.magicBulletArray.push(_loc2_);', '/* mutant: no enrollment */')
    if mutation == 'repeat-spawn':
        methods = methods.replace('getCurFrameCount() == 26', 'getCurFrameCount() >= 1')
    if mutation == 'wrong-offset':
        methods = methods.replace('this.x - 105', 'this.x - 155')
    if mutation == 'wrong-direction':
        methods = methods.replace('_loc2_.setDirect(param1)', '_loc2_.setDirect(1 - param1)')
    put('MonsterProbe.as', '''package {import flash.geom.*;public class MonsterProbe extends BaseMonster{
      public function MonsterProbe(action:String,direction:int,boss:Boolean){isBoss=boss;
      __ATTACKS__ bbdc.direction=direction;bbdc.enterFrameFunc=enterFrameFunc;bbdc.exitFrameFunc=exitFrameFunc;
      bbdc.addFrameScriptWhenFrameOver=scriptFrameOverFunc;curAddEffect=new BaseAddEffect(this);setAction(action);}
      __METHODS__ }}'''.replace('__ATTACKS__', '\n'.join(attacks)).replace('__METHODS__', methods))
    edit('BaseObject.as', "return curAction=='hit1';", "return curAction=='hit1'||curAction=='hit2';")
    edit('BaseObject.as', 'action:s.curAction,x:b.x,y:b.y', 'action:s.curAction,target:id,x:b.x,y:b.y')
    edit('BaseObject.as', 'Config.hits.push', 'Config.attempts.push({tick:Config.tick,uid:b.uid,target:id});if(!Config.accept)return false;Config.hits.push')
    edit('Config.as', 'public static var instance:', 'public static var attempts:Array=[],accept:Boolean=true;public static var instance:')
    edit('BaseHero.as', 'public function getPet():BasePet{return null;}', 'public var pet:BasePet;public function getPet():BasePet{return pet;}')
    edit('Config.as', 'likeMonsterArray:[]}', 'likeMonsterArray:[],getTransferDoorArray:function():Array{return doors;}}')
    edit('Config.as', 'public static function getInstance()', 'public var doors:Array=[];public static function getInstance()')
    edit('BaseBullet.as', 'frame:imgMc?imgMc.currentFrame:0', 'frame:imgMc?imgMc.currentFrame:0,total:imgMc?imgMc.totalFrames:0,parentPresent:parent!=null,sourcePresent:sourceRole!=null,scaleX:scaleX,interval:attackInterval,count:attackIntervalCount')
    edit('BaseBullet.as', 'public function inspectFrame', 'public function total():int{return imgMc?imgMc.totalFrames:0;} public function inspectFrame')
    if mutation == 'wrong-interval':
        edit('BaseBullet.as', 'this.attackInterval = _loc2_.attackInterval;', 'this.attackInterval = 999;')
    special = base.take('export/bullet/SpecialEffectBullet.as', 'step')
    put('SpecialEffectBullet.as', 'package {public class SpecialEffectBullet extends BaseBullet{private var followObject:ThroughWallBullet;public function SpecialEffectBullet(s:String){super(s);}'+special+'}}')
    put('ThroughWallBullet.as', 'package {public class ThroughWallBullet extends BaseBullet{public function ThroughWallBullet(){super("Monster3Bullet1");}public function getUserData():Object{return null;}}}')
    edit('AUtils.as', 'public static var clipClass:Class;', 'public static var classes:Object={};')
    edit('AUtils.as', 'return new clipClass() as MovieClip;', 'var cls:Class=classes[s];return new cls() as MovieClip;')
    shutil.copyfile(HERE / 'Probe.as', work / 'Probe.as')
    edit('application.xml', 'regima.task232.source', 'regima.task247.source')
    return work


def run(mutation=None):
    work = prepare(mutation)
    commands = [
        ['java', '-Dflexlib='+str(base.SDK/'frameworks'), '-jar', str(base.SDK/'lib/mxmlc-cli.jar'), '+configname=air', '-debug=true', '-output=Probe.swf', 'Probe.as'],
        [str(base.SDK/'bin/adl.exe'), '-runtime', str(ROOT/'local-resources/regima/source/unpacked'), str(work/'application.xml'), str(work)],
    ]
    for label, command in zip(['compile', 'run'], commands):
        result = subprocess.run(command, cwd=work, capture_output=True, timeout=60)
        log = (result.stdout+result.stderr).decode(errors='replace')
        (work/(label+'.log')).write_text(log, encoding='utf-8')
        assert result.returncode == 0, log[-5000:]
    assert 'COMPLETE' in log and '51,1,1,5' in log, log[-5000:]
    rows = json.loads(next(line[5:] for line in log.splitlines() if line.startswith('ROWS ')))
    digest = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
    report = dict(status='observation-unverified', mutation=mutation, runtime='AIR 51.1.1.5', rows=rows,
                  sources=base.RECORDS, commands=commands, swfSha256=digest(work/'Probe.swf'),
                  restoredSwfSha256=digest(work/'source.swf'), generatedHashes={p.name:digest(p) for p in work.glob('*.as')},
                  harnessSha256=digest(Path(base.__file__)),
                  limitations='Original Monster3/BBDC/BaseObject/BaseBullet/SpecialEffectBullet methods and PhysicsWorld monster-loop. AI/physics/rewards/UI/fade omitted; effect expiry injected; target collision/HP are acceptance sinks. Explicit restored clip frame inputs are checked separately against native clock. Not full original scene, actual HP or pixel collision.')
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT/('source-'+(mutation or 'baseline')+'.json')).write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    print(json.dumps(dict(task='247', variant=mutation or 'baseline', cases=len(rows), states=sum(len(r['states']) for r in rows))))
    return report


if __name__ == '__main__':
    run(sys.argv[1] if len(sys.argv)>1 else None)
