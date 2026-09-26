"""231: execute extracted AS3 ownership methods in the bundled AIR runtime.

Collision, animation, leveling and persistence are explicit observation boundaries.
No production TypeScript or rewritten ownership algorithm is used by this probe.
"""
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts'
SDK = Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')
WORK = ROOT / 'local-resources/regima/task-outputs/TASK-SETTINGS-231/air'
OUT = ROOT / 'docs/tasks/evidence/TASK-SETTINGS-231'


def method(text, name):
    match = re.search(r'(?:override )?(?:public|protected|private)(?: static)? function ' + name + r'\(', text)
    if not match:
        raise ValueError(name)
    brace = text.index('{', match.end())
    depth, end = 1, brace + 1
    while depth:
        depth += (text[end] == '{') - (text[end] == '}')
        end += 1
    return text[match.start():end]


def prepare(mutation):
    records = []
    def take(path, name, begin=None, end=None):
        file = SRC / path
        full = file.read_text(encoding='utf-8')
        value = method(full, name)
        if begin:
            value = value[value.rindex(begin):]
        if end:
            value = value[:value.index(end)]
        records.append(dict(path=file.relative_to(ROOT).as_posix(), method=name,
                            line=full[:full.index(value)].count('\n') + 1,
                            fileSha256=hashlib.sha256(file.read_bytes()).hexdigest(),
                            fragmentSha256=hashlib.sha256(value.encode()).hexdigest(), begin=begin, end=end))
        return value
    def write(name, value):
        file = WORK / name
        file.parent.mkdir(parents=True, exist_ok=True)
        file.write_text(value, encoding='utf-8')
    reward = take('base/BaseMonster.as', 'reduceHp').replace('override public', 'public')
    ai = take('base/BaseMonster.as', 'myIntelligence')
    select = take('base/BaseMonster.as', 'selectTarget')
    cleanup = take('base/BaseMonster.as', 'step', '         if(this.curAttackTarget)', '         if(this.isFly)')
    attack = take('base/BaseMonster.as', 'beMagicAttack', end='            if(_loc16_)')
    attack = attack.replace('override public', 'public').replace('Math.random()', 'gc.random()') + '\nreturn true; } return false; }'
    changes = {
        'no-attacker-write': ('this.curAttackTarget = param2;', 'this.curAttackTarget = this.curAttackTarget;'),
        'equal-shares': ('this.protectedParamsObject.exp * 0.6', 'this.protectedParamsObject.exp'),
        'current-pet': ('BasePet(this.curAttackTarget).petInfo', '(BasePet(this.curAttackTarget).owner.myPet || BasePet(this.curAttackTarget)).petInfo'),
        'duplicate': ('if(this.curAction != "dead")', 'if(true)'),
        'no-retired-clear': ('Boolean(this.curAttackTarget.isReadyToDestroy)', 'false'),
        'always-reselect': ('this.hasAttackTarget();', 'this.selectTarget();'),
    }
    step = take('base/BaseMonster.as', 'step')
    combined = step + '\n' + take('base/BaseMonster.as', 'IntelligenceTime') + '\n' + reward + '\n' + ai + '\n' + select + '\n' + attack + '\npublic function cleanup():void{' + cleanup + '}'
    if mutation:
        old, new = changes[mutation]
        assert old in combined
        combined = combined.replace(old, new)
    effect_step = take('base/BaseObject.as', 'step', '         if(this.curAddEffect)', '         if(this.curMagicWeapon)')
    write('BaseObject.as', '''package {import flash.display.Sprite; public class BaseObject extends Sprite {
public var id:String='',hp:int=100,isReadyToDestroy:Boolean=false,curAddEffect:BaseAddEffect=new BaseAddEffect();
public function step():void{__EFFECT_STEP__}
public function isDead():Boolean{return hp<=0;}
}}'''.replace('__EFFECT_STEP__', effect_step))
    write('BaseMonster.as', '''package {import flash.geom.Point; public class BaseMonster extends BaseObject {
public var curAttackTarget:BaseObject,curAction:String='wait',isBoss:Boolean=false,monsterName:String='probe';
public var protectedParamsObject:Object={exp:101,Dodge:0,rehp:0},alertRange:Number=1000,gc:Config=new Config();
public var bbdc:Object={setFramePointX:function(v:int):void{}};
public var colipse:Object={},beAttackIdArray:Array=[],walks:int=0,follows:int=0,misses:int=0;
public var ddd:Boolean=false,canStun:Boolean=false,timecount:int=0,beattackedtimes:Number=0,isFly:Boolean=false,speed:Point=new Point();
public function addcount():void{} public function countCD():void{} public function isBeAttacking():Boolean{return curAction=='hurt';}
public function getHp():int{return hp;} public function getSHp():int{return 100;}
public function setHp(v:int):void{hp=v;} public function setAction(v:String):void{curAction=v;}
public function drawMonsterHp():void{} public function normalWalk():void{walks++;}
public function hasAttackTarget():void{follows++;} public function ai():void{myIntelligence();}
public function getCurAddEffect(n:String):Boolean{return false;} public function addMissMc():void{misses++;}
METHODS
}}'''.replace('METHODS', combined))
    write('ProbeMonster.as', 'package {public class ProbeMonster extends BaseMonster {' + take('export/monster/Monster30.as','myIntelligence') + '}}')
    write('BaseHero.as', '''package {public class BaseHero extends BaseObject {
public var myPet:BasePet,roleProperies:HeroInfo=new HeroInfo(),healed:int=0;
public function cureHp(v:int):void{healed+=v;}
METHODS
}}'''.replace('METHODS', '\n'.join(take('base/BaseHero.as', n) for n in ['getPet', 'clearPet'])))
    write('BasePet.as', '''package {public class BasePet extends BaseObject {
public var petInfo:PetInfo=new PetInfo(),sourceRole:BaseHero,owner:BaseHero;
public function retire():void{RETIRE}
}}'''.replace('RETIRE', take('base/BasePet.as', 'destroy', '         this.isReadyToDestroy = true;', '         TweenMax.to') + take('base/BasePet.as', 'destroy', '         if(this.sourceRole)', '         gc.protectedPerproty.removeProperty')))
    # Typed original setters preserve int coercion; callbacks/level-up are observed,
    # not asserted as full progression correctness by this ownership task.
    write('PetInfo.as', '''package {public class PetInfo {
public var _anti:Object={curExper:7},updates:int=0;
public function petUpdate():void{updates++;}
METHODS
}}'''.replace('METHODS', '\n'.join(take('petInfo/PetInfo.as', n) for n in ['getCurExper', 'setCurExper'])))
    write('HeroInfo.as', '''package {public class HeroInfo {
public var dataObject:Object={exper:11},persisted:int=11,upgrades:int=0,who:Object;
public function HeroInfo(){var self:HeroInfo=this;who={getPlayer:function():Object{return {setCurExp:function(v:int):void{self.persisted=v;}};}};}
public function getExp():int{return 10000;} public function getLevel():int{return 1;}
public function judgeUpGrade():void{upgrades++;} public function getDeephit():int{return 0;}
METHODS
}}'''.replace('METHODS', '\n'.join(take('base/BaseRoleProperies.as', n) for n in ['getExper', 'setExper'])))
    write('AllConsts.as', 'package {public class AllConsts {public static var GAME_ROLE_MAXLEVEL:int=100;}}')
    write('Config.as', '''package {import flash.display.Sprite; public class Config {
public var hero1:BaseHero,hero2:BaseHero,gameSence:Object=new Sprite(),frameClips:int=24,pWorld:Object={heroArray:[]},protectedPerproty:Object,gameInfo:Object;
public var protectedHit:Boolean=false,roll:Number=0.99;
public function Config(){var self:Config=this;protectedPerproty={getProperty:function(a:*,b:*):Boolean{return self.protectedHit;}};gameInfo={addBossBlood:function(...args):void{}};}
public function random():Number{return roll;}
METHOD
}}'''.replace('METHOD', take('config/Config.as', 'getPlayerArray')))
    write('AUtils.as', '''package {import flash.display.DisplayObject; public class AUtils {
public static var accept:Boolean=true;
public static function testIntersects(a:*,b:*,c:*):Boolean{return accept;}
METHODS
}}'''.replace('METHODS', '\n'.join(take('AUtils.as', n) for n in ['GetDisBetweenTwoObj', 'GetNearestObj'])))
    fire = take('base/BaseAddEffect.as', 'step', '                  else if(_loc10_.name == BaseAddEffect.PETMONKEY_FIRE)', '                  else if(_loc10_.name == BaseAddEffect.Monster37FIX)')
    write('BaseAddEffect.as', '''package {public class BaseAddEffect {
public static const ICE:String='ice',Pet_TIGER_SXHZ:String='tiger',STUN:String='stun',PETHORSE_ICE:String='horse',YUESEMENGLONG:String='moon',SHENMISHANGRENSHIZHUANG:String='merchant',PETMONKEY_FIRE:String='petmonkey_fire';
public var damage:int=0; public function step():void{if(damage)fire(damage);} public function add(v:*):void{}
public var blocked:Boolean=false,buff:Object=null,sourceRole:BaseMonster,count:int=24,gc:Object={frameClips:24};
public function curDebuff(n:String):Boolean{return blocked;} public function getBuffByName(n:String):Object{return buff;}
public function fire(hurt:int):void{var _loc10_:Object={name:PETMONKEY_FIRE,hurt:hurt};if(false){} __FIRE_FRAGMENT__}
}}'''.replace('__FIRE_FRAGMENT__', fire))
    write('BaseBullet.as', '''package {public class BaseBullet {
public var sourceRoleAttackInfoObject:Object={};public function getImgMc1():Object{return null;}
public function getAttackId():String{return 'attack';} public function getImcName():String{return 'pet';}
}}''')
    write('HitTest.as', 'package {public class HitTest {public static var accept:Boolean=true;public static function complexHitTestObject(a:*,b:*):Boolean{return accept;}}}')
    write('Role1.as', 'package {public class Role1 extends BaseHero {public function getCanBati():Boolean{return false;}public function setFatherBig():void{}public function setFatherSmall():void{}}}')
    for name in ['SpecialEffectBullet', 'FollowBaseObjectBullet']:
        write(name+'.as', 'package {public class '+name+' extends BaseBullet {}}')
    write('User.as', 'package {public class User {public static var batterNum:int=0;}}')
    write('Probe.as', (Path(__file__).parent/'Probe.as').read_text(encoding='utf-8'))
    write('application.xml', '<?xml version="1.0"?><application xmlns="http://ns.adobe.com/air/application/51.0"><id>monster.reward.probe</id><versionNumber>1.0.0</versionNumber><filename>Probe</filename><initialWindow><content>Probe.swf</content><visible>false</visible><width>100</width><height>100</height></initialWindow></application>')
    return records


def run(mutation=None):
    global WORK, OUT
    if mutation:
        WORK = WORK/'mutations'/mutation
        OUT = OUT/'mutations'/mutation
    records = prepare(mutation)
    OUT.mkdir(parents=True, exist_ok=True)
    compile_cmd = [str(SDK/'bin/mxmlc.bat'), '+configname=air', '-debug=true', '-source-path='+str(WORK), '-output='+str(WORK/'Probe.swf'), str(WORK/'Probe.as')]
    result = subprocess.run(compile_cmd, capture_output=True, timeout=60)
    (OUT/'compile.log').write_bytes(result.stdout+result.stderr)
    if result.returncode:
        raise RuntimeError((result.stdout+result.stderr).decode(errors='replace'))
    cmd = [str(SDK/'bin/adl.exe'), '-runtime', str(ROOT/'local-resources/regima/source/unpacked'), str(WORK/'application.xml'), str(WORK)]
    result = subprocess.run(cmd, capture_output=True, timeout=60)
    (OUT/'stdout.log').write_bytes(result.stdout)
    (OUT/'stderr.log').write_bytes(result.stderr)
    log = (result.stdout+result.stderr).decode(errors='replace')
    if result.returncode or 'COMPLETE' not in log:
        raise RuntimeError(str(result.returncode)+': '+log)
    report = dict(status='source-observation-only', mutation=mutation, sources=records,
                  runtime=next(line[4:] for line in log.splitlines() if line.startswith('ENV ')),
                  compileCommand=compile_cmd, runCommand=cmd,
                  probeSha256=hashlib.sha256((WORK/'Probe.as').read_bytes()).hexdigest(),
                  swfSha256=hashlib.sha256((WORK/'Probe.swf').read_bytes()).hexdigest(),
                  cases=[json.loads(line[5:]) for line in log.splitlines() if line.startswith('CASE ')])
    (OUT/'source-trace.json').write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    print('231 source cases:', len(report['cases']), mutation or 'baseline')


if __name__ == '__main__':
    run(sys.argv[1] if len(sys.argv)>1 else None)
