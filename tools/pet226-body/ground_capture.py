"""Original non-flying BaseObject movement with native restored collision sprites.

Static controlled walls, fixed action inputs, no AI/body animation/effect updates.
This is a physics seam oracle, not a full Scene or moving/sloping-wall proof.
"""
import hashlib
import importlib.util
import json
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('source227', ROOT / 'tools/monkey-horse-source/run.py')
source = importlib.util.module_from_spec(spec)
spec.loader.exec_module(source)
WORK = ROOT / 'local-resources/regima/task-outputs/TASK-SLICE-226/ground-air'
WORK.mkdir(parents=True, exist_ok=True)
records = []


def take(path, name):
    file = source.SRC / path
    value = source.method(file.read_text(encoding='utf-8'), name)
    records.append(dict(path=file.relative_to(ROOT).as_posix(), method=name,
                        fileSha256=hashlib.sha256(file.read_bytes()).hexdigest(),
                        methodSha256=hashlib.sha256(value.encode()).hexdigest()))
    return value


methods = [take('base/BaseObject.as', name) for name in [
    'step', 'setSpeed', 'checkCanMove', 'nearToWall', 'move', 'getBottom', 'getNextFrameBounds',
    'getNextFrameXBounds', 'getDownFloor', 'isInSky', 'isWalkOrRun', 'isBeAttacking', 'isAttacking',
    'isCanMoveWhenAttack', 'isCannotMoveWhenAttack', 'isXCannotMoveWhenAttack', 'isYCannotMoveWhenAttack',
    'isCannotMoveWhenAttackOnFloor', 'isRunning', 'isWaiting', 'setStatic', 'checkOver']]
methods = [value.replace('protected function move() : void\n      {',
                        'protected function move() : void\n      { moveCalls++;') for value in methods]
(WORK / 'SourceBody.as').write_text('''package {import flash.display.*;import flash.geom.*;
public class SourceBody extends Sprite {
 public var gc:Object, colipse:Sprite, speed:Point=new Point(0,4), enforceSpeed:Point=new Point();
 public var isLeft:Boolean=false,isRight:Boolean=false,isFly:Boolean=false,istouming:Boolean=false;
 public var horizenSpeed:Number=5,horizenRunSpeed:Number=5,graity:Number=1.5;
 public var fatherCount:int=-1,hmzfatherCount:int=-1,lysfatherCount:int=-1;
 public var curAction:String='wait',standInObj:*,lastStandingObj:*,headInObj:*,leftInObj:*,rightInObj:*;
 public var selfBitmap:Bitmap,wallBitmap:Bitmap,bbdc:Object,curAddEffect:Object,curMagicWeapon:Object,cureHpQueue:Object;
 public var actionCalls:Array=[];
 public var moveCalls:int=0;
 public function flags():Object{return {attacking:isAttacking(),hurt:isBeAttacking(),
  immobileFloor:isCannotMoveWhenAttackOnFloor(),action:curAction};}
 public function setAction(v:String):void{curAction=v;actionCalls.push(v);}
 protected function iswor():void{setAction('walk');}
 public function isCanMoveByStage():Boolean{throw new Error('Flying path outside probe');}
 METHODS
}}'''.replace('METHODS', '\n'.join(methods)), encoding='utf-8')
(WORK / 'PetBody.as').write_text('package {public class PetBody extends SourceBody {' +
                               take('base/BasePet.as', 'move') + '}}', encoding='utf-8')
(WORK / 'Wall.as').write_text('''package {import flash.display.MovieClip;import flash.geom.Rectangle;
public class Wall extends MovieClip {public var speedY:Number=0;
public function isStatic():Boolean{return true;}
public function getNextFrameBound():Rectangle{throw new Error('Moving wall outside probe');}
}}''', encoding='utf-8')
(WORK / 'ThroughWall.as').write_text('package {public class ThroughWall extends Wall {}}', encoding='utf-8')
configs = []
for family in ['Monkey', 'Horse']:
    for form in range(1, 5):
        path = f'export/pet/Pet{family}{form}.as'
        full = (source.SRC / path).read_text(encoding='utf-8')
        names = ['isCannotMoveWhenAttackOnFloor']
        if 'function isAttacking(' in full:
            names.append('isAttacking')
        if family == 'Monkey' and form == 4:
            names.append('move')
        name = f'Ground{family}{form}'
        (WORK / f'{name}.as').write_text(f'package {{public class {name} extends PetBody {{' +
                                       '\n'.join(take(path, method) for method in names) + '}}', encoding='utf-8')
        collider = re.search(r'this.colipse = AUtils.getNewObj\("([^"]+)"\)', full)[1]
        task = 228 if family == 'Monkey' else 229
        truth_path = ROOT / f'docs/reverse-engineering/ground-truth/manifests/task-settings-{task}-pet-{family.lower()}-collision-phase.json'
        truth = json.loads(truth_path.read_text(encoding='utf-8'))
        assert truth['status'] == 'verified'
        body = next(row for row in truth['body']['forms'] if row['form'] == form)
        configs.append(dict(name=name, family=family.lower(), form=form, collider=collider,
                            actions=[row['action'] for row in body['actions']],
                            truthPath=truth_path.relative_to(ROOT).as_posix(),
                            truthSha256=hashlib.sha256(truth_path.read_bytes()).hexdigest()))
refs = ','.join(c['name'] for c in configs)
swf = ROOT / 'local-resources/regima/source/restored-swfs/assets/StageCommon.swf'
probe = '''package {import flash.display.*;import flash.events.*;import flash.filesystem.*;
import flash.system.*;import flash.utils.*;import flash.desktop.NativeApplication;
public class GroundProbe extends Sprite {
private var refs:Array=[REFS],loader:Loader=new Loader();
public function GroundProbe(){var f:FileStream=new FileStream();f.open(new File(SWF),FileMode.READ);
var b:ByteArray=new ByteArray();f.readBytes(b);f.close();
loader.contentLoaderInfo.addEventListener(Event.COMPLETE,run);var c:LoaderContext=new LoaderContext(false,new ApplicationDomain());
c.allowCodeImport=true;loader.loadBytes(b,c);}
private function run(e:Event):void{
var configs:Array=CONFIGS;var n:int=0;
for each(var config:Object in configs)for each(var action:String in config.actions)
for each(var mode:String in ['air','floor','ceiling','left','right','through'])for each(var direction:int in [-1,0,1]){
var world:Sprite=new Sprite();addChild(world);var walls:Array=[];
var wall:Wall=mode=='through'?new ThroughWall():new Wall();wall.name='wall';
if(mode!='air'){var x:Number=-200,y:Number=80,w:Number=400,h:Number=20;
 if(mode=='ceiling'){y=-80;}if(mode=='left'){x=-70;y=-200;w=20;h=400;}
 if(mode=='right'){x=70;y=-200;w=20;h=400;}
 wall.graphics.beginFill(0x333333);wall.graphics.drawRect(x,y,w,h);wall.graphics.endFill();world.addChild(wall);walls.push(wall);
 if(mode=='through'){var marker:Sprite=new Sprite();marker.name='isThroughWall';wall.addChild(marker);}}
var cls:Class=getDefinitionByName(config.name) as Class;var p:SourceBody=new cls();world.addChild(p);
var shape:Class=loader.contentLoaderInfo.applicationDomain.getDefinition(config.collider) as Class;
p.colipse=new shape() as Sprite;p.addChild(p.colipse);p.curAction=action;p.isLeft=direction<0;p.isRight=direction>0;
if(mode=='ceiling')p.speed.y=-12;
p.gc={gameSence:world,pWorld:{getWallArray:function():Array{return walls;}},protectedPerproty:{setProperty:function(...v):void{}}};
var b0:Object={x:p.x,y:p.y,vx:p.speed.x,vy:p.speed.y};var bounds:Object=p.colipse.getBounds(p);
for(var tick:int=1;tick<=24;tick++){var flags:Object=p.flags();var calls:int=p.moveCalls;p.step();trace('CASE '+JSON.stringify({family:config.family,form:config.form,
 initialAction:action,mode:mode,direction:direction,tick:tick,initial:b0,
 collision:{left:bounds.x,top:bounds.y,width:bounds.width,height:bounds.height},
 x:p.x,y:p.y,vx:p.speed.x,vy:p.speed.y,action:p.curAction,
 beforeFlags:flags,moveCalls:p.moveCalls-calls,
 standing:!!p.standInObj,head:!!p.headInObj,left:!!p.leftInObj,right:!!p.rightInObj}));n++;}
removeChild(world);
}trace('COMPLETE '+n);NativeApplication.nativeApplication.exit();}
}}'''.replace('REFS', refs).replace('SWF', json.dumps(str(swf))).replace('CONFIGS', json.dumps(configs))
(WORK / 'GroundProbe.as').write_text(probe, encoding='utf-8')
(WORK / 'application.xml').write_text('<application xmlns="http://ns.adobe.com/air/application/51.1"><id>regima.task226.ground</id><versionNumber>1.0.0</versionNumber><filename>GroundProbe</filename><supportedProfiles>desktop</supportedProfiles><initialWindow><content>GroundProbe.swf</content><visible>false</visible><width>940</width><height>590</height></initialWindow></application>')
compile_command = ['java', '-Dflexlib=' + str(source.SDK / 'frameworks'), '-jar', str(source.SDK / 'lib/mxmlc-cli.jar'),
                   '+configname=air', '-debug=true', '-output=GroundProbe.swf', 'GroundProbe.as']
result = subprocess.run(compile_command, cwd=WORK, capture_output=True, timeout=60)
assert result.returncode == 0, (result.stdout + result.stderr).decode(errors='replace')
command = [str(source.SDK / 'bin/adl.exe'), '-runtime', str(ROOT / 'local-resources/regima/source/unpacked'),
           '-profile', 'desktop', str(WORK / 'application.xml'), str(WORK)]
result = subprocess.run(command, cwd=WORK, capture_output=True, timeout=60)
output = (result.stdout + result.stderr).decode(errors='replace')
cases = [json.loads(line[5:]) for line in output.splitlines() if line.startswith('CASE ')]
expected = sum(len(c['actions']) for c in configs) * 6 * 3 * 24
assert result.returncode == 0 and len(cases) == expected and f'COMPLETE {expected}' in output, output[-3000:]
report = dict(status='observed-physics-seam', scope=__doc__, sources=records, cases=cases,
              sourceSwf=dict(path=swf.relative_to(ROOT).as_posix(), sha256=hashlib.sha256(swf.read_bytes()).hexdigest()),
              configurations=configs, compileCommand=compile_command, command=command,
              substitutions=['body animation/effect/health services absent', 'setAction/iswor record-only',
                             'move entry counter for whether the original family override calls BaseObject.move',
                             'controlled static rectangle Wall/ThroughWall fixture', 'initial source speed(0,4), gravity1.5, horizen5; ceiling input overrides vy=-12'],
              generatedHashes={p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in WORK.glob('*.as')})
(ROOT / 'docs/tasks/evidence/TASK-SLICE-226/ground-native.json').write_text(
    json.dumps(report, separators=(',', ':')), encoding='utf-8')
print(f'{len(cases)} original ground motion states with restored native colliders; controlled static walls/actions, no AI or body animation.')
