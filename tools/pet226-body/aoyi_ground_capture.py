"""Original Monkey4 body callbacks coupled to original retained-host ground motion.

Controlled static floor/targets. Bullet creation, passive/buff and network services
remain explicit observation sinks; this is not target damage or a full Scene.
Existing callback-air and aoyi-target-air outputs are read-only inputs.
"""
import hashlib
import importlib.util
import json
from pathlib import Path
import re
import shutil
import subprocess

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('source227', ROOT / 'tools/monkey-horse-source/run.py')
source = importlib.util.module_from_spec(spec)
spec.loader.exec_module(source)
WORK = ROOT / 'local-resources/regima/task-outputs/TASK-SLICE-226/aoyi-ground-air'
WORK.mkdir(parents=True, exist_ok=True)
records = []


def take(path, name):
    file = source.SRC / path
    text = file.read_text(encoding='utf-8')
    is_static = re.search(r'public static function ' + re.escape(name) + r'\(', text) is not None
    value = source.method(text.replace('public static function', 'public function') if is_static else text, name)
    if is_static:
        value = value.replace('public function', 'public static function', 1)
    records.append(dict(path=file.relative_to(ROOT).as_posix(), method=name,
                        fileSha256=hashlib.sha256(file.read_bytes()).hexdigest(),
                        methodSha256=hashlib.sha256(value.encode()).hexdigest()))
    return value


def write(name, value):
    (WORK / name).write_text(value, encoding='utf-8')


ground = ROOT / 'local-resources/regima/task-outputs/TASK-SLICE-226/ground-air'
ground_report = json.loads((ROOT / 'docs/tasks/evidence/TASK-SLICE-226/ground-native.json').read_text(encoding='utf-8'))
for item in ground_report['sources']:
    assert hashlib.sha256((ROOT / item['path']).read_bytes()).hexdigest() == item['fileSha256']
records.extend(ground_report['sources'])
callback_spec = importlib.util.spec_from_file_location('callback228', ROOT / 'tools/monkey-spatial/prepare_callbacks.py')
callback_source = importlib.util.module_from_spec(callback_spec)
callback_spec.loader.exec_module(callback_source)
callbacks = WORK / 'callback-inputs'
callback_source.WORK = callbacks
callback_source.OUT = callbacks
callback_source.main()
callback_report = json.loads((callbacks / 'callback-methods.json').read_text(encoding='utf-8'))
records.extend(callback_report['methods'])
inputs = json.loads((ROOT / 'local-resources/regima/task-outputs/TASK-SETTINGS-228/aoyi-target-air/inputs.json').read_text(encoding='utf-8'))
for name in ['SourceBody.as', 'PetBody.as', 'Wall.as', 'ThroughWall.as']:
    assert hashlib.sha256((ground / name).read_bytes()).hexdigest() == ground_report['generatedHashes'][name]
    shutil.copyfile(ground / name, WORK / name)
for name in ['BodyClip.as', 'CallbackHero.as', 'CallbackInfo.as', 'CallbackConfig.as', 'BaseMonster.as']:
    shutil.copyfile(callbacks / name, WORK / name)
clip = (WORK / 'BodyClip.as').read_text(encoding='utf-8').rstrip()
write('BodyClip.as', clip[:-2] + take('base/BaseBitmapDataClip.as', 'turnLeft')
      + take('base/BaseBitmapDataClip.as', 'turnRight') + '}}')
# Restore the landing action method too; the earlier isolated physics seam used
# a walk event sink, which cannot stand in for a coupled BBDC body action.
base = (WORK / 'SourceBody.as').read_text(encoding='utf-8')
base = base.replace("protected function iswor():void{setAction('walk');}", take('base/BaseObject.as', 'iswor'))
write('SourceBody.as', base)

base = (callbacks / 'CallbackBase.as').read_text(encoding='utf-8')
base = base.replace('extends Sprite', 'extends PetBody', 1)
base = base.replace('public var bbdc:BodyClip,curAction:String="wait",lastHit:String="",gc:CallbackConfig=new CallbackConfig();',
                    'public var lastHit:String="",sid:int=0;')
base = base.replace('public function CallbackBase(spec:Object){', 'public function CallbackBase(spec:Object){gc=new CallbackConfig();')
base = base.replace('getBBDC():BodyClip{return bbdc;}', 'getBBDC():BodyClip{return bbdc as BodyClip;}')
base = base.replace('public function setStatic():void{events.push({kind:"static"});}', '')
base = base.replace('public function turnLeft():void{bbdc.setDirect(0);}public function turnRight():void{bbdc.setDirect(1);}',
                    take('base/BaseObject.as', 'turnLeft') + take('base/BaseObject.as', 'turnRight'))
base = base.replace('public function setAction(', 'override public function setAction(')
methods = [take('base/BasePet.as', name) for name in ['step', 'countSkillCD', 'myIntelligence',
           'searchTarget', 'followSource', 'followTarget', 'jump', 'getFallDown']]
# These methods live in BaseObject in the original chain; their BasePet
# overrides are first declarations in this deliberately narrow generated base.
methods = [m.replace('override protected function jump', 'protected function jump')
           .replace('override protected function getFallDown', 'protected function getFallDown')
           .replace('Math.random()', 'gc.random()') for m in methods]
fields = '''
public var magicBulletArray:Array=[],tCount:int=0,timeCount:int=0,isGXP:Boolean=false;
public var skillCD1:Array=[100000,24],skillCD2:Array=[100000,24],skillCD3:Array=[100000,24],skillCD4:Array=[100000,24];
public var followRange:Number=640,searchRange:Number=1200,attackRange:Number=350,attackRate:Number=.7,jumpPower:Number=-30;
protected function doPassive():void{events.push({kind:'passive-sink'});}
protected function checkBuffSkill():void{events.push({kind:'buff-sink'});}
protected function clearWaitFromParentArray(dead:Array,all:Array):void{if(dead.length||all.length)throw new Error('Bullet simulation outside body-motion probe');}
protected function beforeSkill1Start():Boolean{return false;}
protected function beforeSkill2Start():Boolean{return false;}
protected function beforeSkill3Start():Boolean{return false;}
protected function beforeSkill4Start():Boolean{return false;}
protected function releSkill1():void{throw new Error('Unexpected regular skill');}
protected function releSkill2():void{throw new Error('Unexpected regular skill');}
protected function releSkill3():void{throw new Error('Unexpected regular skill');}
'''
base = base[:-2] + fields + '\n'.join(methods) + '}}'
reduce = take('base/BasePet.as', 'reduceHp').replace('override public function', 'public function').replace('Math.random()', 'gc.damageRandom()')
base = base[:-2] + 'public function showHpSlip():void{} public function drawPetHp():void{} public function addMonHurtMc(a:*,b:*):void{}' + reduce + '}}'
write('CallbackBase.as', base)
monkey = (callbacks / 'Monkey4.as').read_text(encoding='utf-8')
monkey = monkey.replace('import flash.geom.*;', 'import flash.geom.*;import flash.display.Sprite;')
for name in ['doHit1', 'doHit2', 'doHit3', 'doHit4_1', 'doHit4_2']:
    original = take('export/pet/PetMonkey4.as', name)
    assignments = re.findall(r'_loc3_\.[xy] = param2\.[xy];', original)
    assert assignments == ['_loc3_.x = param2.x;', '_loc3_.y = param2.y;']
    old = 'private function ' + name + '(d:uint,p:Point):void{events.push('
    assert old in monkey
    monkey = monkey.replace(old, 'private function ' + name + '(d:uint,p:Point):void{var _loc3_:Sprite=new Sprite();'
                            + ''.join(assignments).replace('param2', 'p') + 'events.push(')
monkey = monkey.replace('direction:d,x:p.x,y:p.y', 'direction:d,x:_loc3_.x,y:_loc3_.y,inputX:p.x,inputY:p.y')
monkey = monkey[:-2] + '\n'.join(take('export/pet/PetMonkey4.as', name) for name in
          ['myIntelligence', 'move', 'isAttacking', 'isCannotMoveWhenAttackOnFloor', 'reduceHp']) + '}}'
write('Monkey4.as', monkey)
info = (WORK / 'CallbackInfo.as').read_text(encoding='utf-8').replace('public function getMp()', 'public function upPassive():void{} public function getMp()')
info = info[:-2] + '''public var hp:Number=100,life:Number=100;
public function getHp():Number{return hp;}public function setHp(n:Number):void{hp=n;}
public function getlifetime():Number{return life;}public function setlifetime(n:Number):void{life=n;}
public function getCurPetState():Number{return 4;}public function getwarpower():Number{return 1;}
public function getAtk():Number{return 0;}public function gettechnique():Number{return 0;}
public function getSHp():Number{return 100;}
''' + take('petInfo/PetInfo.as', 'getPetHarmObj') + '}}'
write('CallbackInfo.as', info)
monster = (WORK / 'BaseMonster.as').read_text(encoding='utf-8').replace('public var colipse:Sprite',
          'public var dead:Boolean=false;public function isDead():Boolean{return dead;}public var colipse:Sprite')
write('BaseMonster.as', monster)
config = (WORK / 'CallbackConfig.as').read_text(encoding='utf-8').replace('public var sid:int',
         'public var obbsiteArray:Array=[],protectedPerproty:Object={setProperty:function(...v):void{}};public var sid:int')
config = config.replace('public function isSingleGame()', 'public function isInRoomOrSingleGame():Boolean{return true;}public function isSingleGame()')
config = config[:-2] + '''public function isInRoom():Boolean{return false;}
public function getMutiUserBySidAndRoleId(...a):*{return null;}
public function sendSelfMutiUserInfo(...a):void{}public function sendPetDead(...a):void{}
public function damageRandom():Number{randomIndex++;return 0;}}}'''
write('CallbackConfig.as', config)
distance = take('AUtils.as', 'GetDisBetweenTwoObj')
write('AUtils.as', 'package {public class AUtils {' + distance +
      'public static function shallowEffect(v:*):void{throw new Error("GXP outside probe");}}}')
write('BaseHero.as', 'package {import flash.display.Sprite;public class BaseHero extends Sprite {}}')
write('Role2Shadow.as', 'package {public class Role2Shadow extends BaseHero {}}')

inputs.update(modes=['static', 'dead-first', 'enter', 'leave-enter', 'reorder', 'empty-reenter',
                    'scene-shift', 'scene-flip', 'empty', 'hurt', 'counter'],
              choices=[0, 1/3-1e-10, 1/3, .5, 2/3-1e-10, 2/3, 1-1e-10],
              sides=[.5-1e-10, .5], skillMasks=list(range(8)))
(WORK / 'inputs.json').write_text(json.dumps(inputs), encoding='utf-8')
probe = (ROOT / 'tools/monkey-spatial/AoyiTargetProbe.as').read_text(encoding='utf-8')
probe = probe.replace('AoyiTargetProbe', 'AoyiGroundProbe')
probe = probe.replace('choose:Number in input.choices', 'choose:Number in (mode=="empty"||mode=="hurt"||mode=="counter"?[0]:input.choices)')
probe = probe.replace('side:Number in input.sides', 'side:Number in (mode=="empty"||mode=="hurt"||mode=="counter"?[.5-1e-10]:input.sides)')
probe = probe.replace('sample(fps,owner,mode,choose,side);count++;',
                      'for each(var skills:int in (mode=="static"||mode=="empty"||mode=="hurt"||mode=="counter"?input.skillMasks:[7])){sample(fps,owner,mode,choose,side,skills);count++;}')
probe = probe.replace('side:Number):void {', 'side:Number,skills:int):void {')
probe = probe.replace('actor._petInfo.skills={lyq:true,xj:true,lj:true};',
                      'actor._petInfo.skills={lyq:Boolean(skills&1),xj:Boolean(skills&2),lj:Boolean(skills&4),qlfj:mode=="counter"};')
probe = probe.replace('actor.x=300;actor.y=350;', 'actor.x=300;actor.y=250;')
probe = probe.replace('actor.gc.pWorld.monsterArray=monsters.concat();actor.startAoyi();var rows:Array=[];', '''
var shape:Class=getDefinitionByName('ObjectBaseSprite') as Class;actor.colipse=new shape() as Sprite;actor.addChild(actor.colipse);
var wall:Wall=new Wall();wall.name='floor';wall.graphics.beginFill(0x333333);wall.graphics.drawRect(-10000,400.1,20000,40);wall.graphics.endFill();actor.gc.gameSence.addChild(wall);
actor.gc.pWorld={monsterArray:monsters.concat(),getWallArray:function():Array{return [wall];}};actor.gc.obbsiteArray=monsters.concat();
// Preserve original spawn and initial vy; settle through whole original steps.
var settleTicks:int=0;while(!actor.standInObj&&settleTicks<100){actor.step();settleTicks++;}
if(!actor.standInObj)throw new Error('Did not land');
var settled:Object={x:actor.x,y:actor.y,vx:actor.speed.x,vy:actor.speed.y,timeCount:actor.timeCount,ticks:settleTicks};
if(mode=='empty')actor.gc.pWorld.monsterArray=[];
actor.startAoyi();var rows:Array=[];''')
probe = probe.replace('var beforeRandom:int=actor.gc.randomIndex;', 'if(mode=="hurt"&&tick==9)actor.setAction("hurt");if(mode=="counter"&&tick==9)actor.reduceHp(1,true);var beforeRandom:int=actor.gc.randomIndex;')
probe = probe.replace('actor.bbdc.step();', 'actor.step();')
probe = probe.replace('if(actor.gc.randomIndex!=beforeRandom||tick==32||tick==58||tick==140){', '{')
probe = probe.replace('for each(m in actor.gc.pWorld.monsterArray)',
                      'for each(m in (actor.gc.randomIndex!=beforeRandom||tick==32||tick==58?actor.gc.pWorld.monsterArray:[]))')
probe = probe.replace('events:actor.events.concat()', 'events:actor.events.concat(),vx:actor.speed.x,vy:actor.speed.y,standing:!!actor.standInObj,timeCount:actor.timeCount,row:actor.bbdc.getCurPoint().y,column:actor.bbdc.getCurPoint().x,count:actor.bbdc.getCurFrameCount(),direction:actor.bbdc.getDirect()')
probe = probe.replace('side:side,rows:rows', 'side:side,skills:skills,settled:settled,rows:rows')
write('AoyiGroundProbe.as', probe)
write('application.xml', '<application xmlns="http://ns.adobe.com/air/application/51.1"><id>regima.task226.aoyiground</id><versionNumber>1.0.0</versionNumber><filename>AoyiGroundProbe</filename><supportedProfiles>desktop</supportedProfiles><initialWindow><content>AoyiGroundProbe.swf</content><visible>false</visible><width>940</width><height>590</height></initialWindow></application>')
compile_command = ['java', '-Dflexlib=' + str(source.SDK / 'frameworks'), '-jar', str(source.SDK / 'lib/mxmlc-cli.jar'),
                   '+configname=air', '-debug=true', '-output=AoyiGroundProbe.swf', 'AoyiGroundProbe.as']
result = subprocess.run(compile_command, cwd=WORK, capture_output=True, timeout=60)
(WORK / 'compile.log').write_bytes(result.stdout + result.stderr)
assert result.returncode == 0, (result.stdout + result.stderr).decode(errors='replace')
command = [str(source.SDK / 'bin/adl.exe'), '-runtime', str(ROOT / 'local-resources/regima/source/unpacked'),
           '-profile', 'desktop', str(WORK / 'application.xml'), str(WORK)]
result = subprocess.run(command, cwd=WORK, capture_output=True, timeout=240)
output = (result.stdout + result.stderr).decode(errors='replace')
(WORK / 'run.log').write_text(output, encoding='utf-8')
cases = [json.loads(line[5:]) for line in output.splitlines() if line.startswith('CASE ')]
assert result.returncode == 0 and len(cases) == 1404 and 'COMPLETE 1404' in output, output[-2000:]
report = dict(status='observed-coupled-body-ground', scope=__doc__, sources=records, cases=cases, inputs=inputs,
    substitutions=['doHit observes original x/y Sprite assignments and raw Point input; other bullet behavior/damage/RNG are sinks', 'passive/buff/MP/protection/network service sinks',
                   'regular skills disabled at probe entrance; aoyi entered explicitly after real settling'],
    compileCommand=compile_command, command=command,
    inputHashes={str(p.relative_to(ROOT)).replace('\\', '/'): hashlib.sha256(p.read_bytes()).hexdigest()
                 for p in [ground / 'SourceBody.as', ground / 'PetBody.as', callbacks / 'CallbackBase.as', callbacks / 'Monkey4.as', callbacks / 'BodyClip.as']},
    generatedHashes={p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in WORK.glob('*.as')})
(WORK / 'measurement.json').write_text(json.dumps(report, separators=(',', ':')), encoding='utf-8')
print(f'{len(cases)} original coupled aoyi/body/ground cases; {sum(len(c["rows"]) for c in cases)} states. Explicit sinks, no Scene/damage claim.')
