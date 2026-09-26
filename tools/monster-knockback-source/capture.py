"""230 bounded original movement oracle. Does not import modern game code.

Original AS3 methods are compiled in an observation shell; restored StageCommon
colliders and main-library TweenMax and original Cubic execute under the bundled original AIR runtime.
Controlled action/AI/HP boundaries are explicitly NOT full scene playback.
"""
import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import struct
import zlib

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('source227', ROOT/'tools/monkey-horse-source/run.py')
source = importlib.util.module_from_spec(spec)
spec.loader.exec_module(source)
WORK = ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-230/air'
OUT = ROOT/'docs/tasks/evidence/TASK-SETTINGS-230'
records = []


def take(path, name):
    file = source.SRC/path
    full = file.read_text(encoding='utf-8')
    code = source.method(full, name)
    records.append(dict(path=file.relative_to(ROOT).as_posix(), method=name,
                        line=full[:full.index(code)].count('\n')+1,
                        fileSha256=hashlib.sha256(file.read_bytes()).hexdigest(),
                        methodSha256=hashlib.sha256(code.encode()).hexdigest()))
    return code


def write(name, value):
    path = WORK/name
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(value, encoding='utf-8')


def prepare():
    WORK.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)
    names = ['step','setSpeed','checkCanMove','nearToWall','move','getBottom',
             'getNextFrameBounds','getNextFrameXBounds','getDownFloor','isInSky',
             'isWalkOrRun','isBeAttacking','isAttacking','isCanMoveWhenAttack',
             'isCannotMoveWhenAttack','isXCannotMoveWhenAttack','isYCannotMoveWhenAttack',
             'isCannotMoveWhenAttackOnFloor','isRunning','isWaiting','checkOver',
             'isCanMoveByStage','getBeattackBackSpeed','setAttackBack']
    methods = [take('base/BaseObject.as', n) for n in names]
    write('SourceBody.as', '''package {import flash.display.*;import flash.geom.*;
import com.greensock.TweenMax;import com.greensock.easing.Cubic;
public class SourceBody extends Sprite {
public var gc:Object,colipse:Sprite,speed:Point=new Point(0,4),enforceSpeed:Point=new Point();
public var isLeft:Boolean=false,isRight:Boolean=false,isFly:Boolean=false,istouming:Boolean=false;
public var horizenSpeed:Number=5,horizenRunSpeed:Number=5,graity:Number=1.5;
public var fatherCount:int=-1,hmzfatherCount:int=-1,lysfatherCount:int=-1;
public var curAction:String='hurt',standInObj:*,lastStandingObj:*,headInObj:*,leftInObj:*,rightInObj:*;
public var selfBitmap:Bitmap,wallBitmap:Bitmap,bbdc:Object,curAddEffect:Object,curMagicWeapon:Object,cureHpQueue:Object;
public function setAction(v:String):void{curAction=v;}
protected function iswor():void{curAction='walk';}
public function direction(b:BaseBullet,c:Object):Point{return getBeattackBackSpeed(b,c);}
METHODS
}}'''.replace('METHODS','\n'.join(methods)))
    # Entire original shared method above, and the exact flying post-physics
    # suffix below. AI/HP/CD services are not silently simulated.
    monster_step = take('base/BaseMonster.as','step')
    suffix = monster_step[monster_step.index('         if(this.isFly)'):]
    write('BaseMonster.as', '''package {import flash.geom.*;public class BaseMonster extends BaseObject {
public var isBoss:Boolean=false,isReadyToDestroy:Boolean=false,magicBulletArray:Array=[];
MOVE
public function postPhysics():void{SUFFIX
} }'''.replace('SUFFIX',suffix).replace('MOVE', take('base/BaseMonster.as','move')))
    gate = take('base/BaseMonster.as','beMagicAttack')
    gate = gate[:gate.index('               if(_loc16_.addEffect)')] + '\n} return true; } return false; }'
    gate = gate.replace('override public', 'public').replace('Math.random()', 'gc.random()')
    p = WORK/'BaseMonster.as'
    code = p.read_text(encoding="utf-8")
    code = code[:-3] + '''public var protectedParamsObject:Object={Dodge:0},curAttackTarget:BaseObject,beAttackIdArray:Array=[],misses:int=0;
public function getCurAddEffect(n:String):Boolean{return false;}
public function addMissMc():void{misses++;}
''' + gate + '}}'
    p.write_text(code)
    write('BaseObject.as','package {public class BaseObject extends SourceBody {}}')
    write('BaseHero.as','package {public class BaseHero extends BaseObject {public var roleProperies:Object={getDeephit:function():int{return 0;}};}}')
    write('Role1.as','package {public class Role1 extends BaseHero {public function getCanBati():Boolean{return false;}public function setFatherBig():void{}public function setFatherSmall():void{}}}')
    write('BaseAddEffect.as','package {public class BaseAddEffect {public static const YUESEMENGLONG:String="moon";}}')
    write('HitTest.as','package {public class HitTest {public static var accept:Boolean=true;public static function complexHitTestObject(a:*,b:*):Boolean{return accept;}}}')
    write('AUtils.as','package {public class AUtils {public static var accept:Boolean=true;public static function testIntersects(a:*,b:*,c:*):Boolean{return accept;}}}')
    write('User.as','package {public class User {public static var batterNum:int=0;}}')
    write('Wall.as', '''package {import flash.display.MovieClip;import flash.geom.Rectangle;
public class Wall extends MovieClip {public var speedY:Number=0;
public function isStatic():Boolean{return true;}
public function getNextFrameBound():Rectangle{throw new Error('moving wall excluded');}}}''')
    write('ThroughWall.as','package {public class ThroughWall extends Wall {}}')
    write('BaseBullet.as', '''package {import flash.geom.Point;public class BaseBullet {
public var speed:Point=new Point(),sourceRole:Object={x:0},direct:int=1,img:String='pet';
public var sourceRoleAttackInfoObject:Object={attackBackSpeed:[6,-5]},id:String='attack';
public function getAttackId():String{return id;}public function getImgMc1():Object{return null;}
public function getDirect():int{return direct;}public function getImcName():String{return img;}}}''')
    check = take('base/BaseBullet.as','checkAttack')
    check = check[check.index('               if(_loc2_.beAttackIdArray.indexOf'):check.index('                  if(this.getImcName() == "qingyangshenjun_skill3_2")')]
    p = WORK/'BaseBullet.as'
    code = p.read_text(encoding="utf-8").replace('sourceRole:Object={x:0}', 'sourceRole:BaseObject=new BaseObject()')
    code = code[:-2] + 'public var isReadyToDestroy:Boolean=false;public function step2():void{}public var isDisabled:Boolean=false,imgMc1:Object,funcWhenHit:Function,maxAttackCount:int=99,_qixue:int=0,refreshCount:int=0;public function refreshSourceRoleAttackInfoObject():void{refreshCount++;} public function attempt(target:BaseMonster):void{var _loc2_:BaseMonster=target;' + check + '}}}}'
    p.write_text(code)
    write('Monster34.as','package {public class Monster34 extends BaseObject {public function createShallow():void{}}}')
    for name in ['EnemyMoveBullet','EnemyMoveBullet1','EnemyMoveBullet2','S_ShapeMoveBullet',
                 'FastAndSlowBullet','SpecialEffectBullet','FollowBaseObjectBullet']:
        write(name+'.as','package {public class '+name+' extends BaseBullet {}}')
    write('com/greensock/TweenMax.as', '''package com.greensock {public class TweenMax {
public static var backend:Class,last:Object;
public static function to(o:Object,t:Number,p:Object):void{last=backend.to(o,t,p);}
}}''')
    cubic = source.SRC/'com/greensock/easing/Cubic.as'
    records.append(dict(path=cubic.relative_to(ROOT).as_posix(), method='entire-class', line=1, fileSha256=hashlib.sha256(cubic.read_bytes()).hexdigest(), methodSha256=hashlib.sha256(cubic.read_text(encoding="utf-8").encode()).hexdigest()))
    write('com/greensock/easing/Cubic.as', (source.SRC/'com/greensock/easing/Cubic.as').read_text(encoding='utf-8'))
    write('WorldProbe.as','package {public class WorldProbe {public var isSourceReady:Boolean=true,gc:Object,monsterArray:Array=[],heroArray:Array=[],otherHeroArray:Array=[],likeMonsterArray:Array=[],wallArray:Array=[],auraArray:Array=[],baseLevelListener:Object;public function clearWaitFromParentArray(a:Array,b:Array):void{if(a.length)throw new Error("cleanup outside fixture");}' + take('World/PhysicsWorld.as','step') + '}}')
    write('BaseAura.as','package {public class BaseAura {public var isReadyToDestroy:Boolean=false;public function step():void{}}}')
    for path,name in [('base/BaseHero.as','step'),('base/BaseHero.as','setPet'),('base/BaseHero.as','updatePet'),('base/BasePet.as','step'),('base/BaseMonster.as','myIntelligence'),('base/BaseMonster.as','hasAttackTarget'),('base/BaseMonster.as','reduceHp')]:
        take(path,name)
    main_source = ROOT/'local-resources/regima/source/restored-swfs/1_MainLoad__main1.swf'
    data=main_source.read_bytes()
    body=zlib.decompress(data[8:]) if data[:3]==b'CWS' else data[8:]
    start=(5+4*(body[0]>>3)+7)//8+4
    pos=start
    chunks=[]
    while pos<len(body):
        at=pos
        value=struct.unpack_from('<H',body,pos)[0]
        pos+=2
        code,length=value>>6,value&63
        if length==63:
            length=struct.unpack_from('<I',body,pos)[0]
            pos+=4
        pos+=length
        if code in [69,82]:chunks.append(body[at:pos])
        if code==0:break
    payload=body[:start]+b''.join(chunks)+b'\x40\x00\x00\x00'
    (WORK/'main-library.swf').write_bytes(b'FWS'+data[3:4]+struct.pack('<I',8+len(payload))+payload)
    probe = (Path(__file__).parent/'Probe.as').read_text(encoding='utf-8')
    probe = probe.replace('SOURCE_PATHS', json.dumps([str(ROOT/'local-resources/regima/source/restored-swfs/assets/StageCommon.swf'),str(WORK/'main-library.swf')]))
    write('Probe.as',probe)
    write('application.xml','<application xmlns="http://ns.adobe.com/air/application/51.1"><id>regima.task230</id><versionNumber>1.0.0</versionNumber><filename>Probe</filename><supportedProfiles>desktop</supportedProfiles><initialWindow><content>Probe.swf</content><visible>false</visible><width>940</width><height>590</height></initialWindow></application>')


def main():
    prepare()
    mutation = sys.argv[1] if len(sys.argv)>1 else None
    if mutation == 'hit-order':
        p = WORK/'WorldProbe.as'
        text = p.read_text(encoding="utf-8")
        a=text.index('         var _loc10_:uint = this.monsterArray.length;')
        b=text.index('         _loc10_ = this.heroArray.length;')
        c=text.index('         _loc10_ = uint(this.otherHeroArray.length);')
        p.write_text(text[:a]+text[b:c]+text[a:b]+text[c:])
    elif mutation:
        p = WORK/'SourceBody.as'
        text = p.read_text(encoding="utf-8")
        changes = {
            'no-consumption': ('this.speed.x = param1.x * 2;', 'this.speed.x = 0;'),
            'seconds-units': ('this.speed.x = param1.x * 2;', 'this.speed.x = param1.x * 2 / 24;'),
            'gravity-order': ('this.y += this.speed.y;\n         this.speed.y += this.graity;', 'this.speed.y += this.graity;\n         this.y += this.speed.y;'),
            'duplicate': ('this.x += this.speed.x;', 'this.x += this.speed.x * 2;'),
        }
        old,new = changes[mutation]
        assert old in text
        p.write_text(text.replace(old,new))
    compile_command = ['java','-Dflexlib='+str(source.SDK/'frameworks'),'-jar',str(source.SDK/'lib/mxmlc-cli.jar'),
                       '+configname=air','-debug=true','-output=Probe.swf','Probe.as']
    result = subprocess.run(compile_command,cwd=WORK,capture_output=True,timeout=60)
    (WORK/'compile.log').write_bytes(result.stdout+result.stderr)
    assert result.returncode == 0,(result.stdout+result.stderr).decode(errors='replace')
    command = [str(source.SDK/'bin/adl.exe'),'-runtime',str(ROOT/'local-resources/regima/source/unpacked'),
               '-profile','desktop',str(WORK/'application.xml'),str(WORK)]
    result = subprocess.run(command,cwd=WORK,capture_output=True,timeout=60)
    (WORK/'stdout.log').write_bytes(result.stdout)
    (WORK/'stderr.log').write_bytes(result.stderr)
    log = (result.stdout+result.stderr).decode(errors='replace')
    assert result.returncode == 0 and 'COMPLETE ' in log,log[-3000:]
    rows = json.loads((WORK/'rows.json').read_text(encoding="utf-8"))
    sources = []
    for name in ['assets/StageCommon.swf','1_MainLoad__main1.swf']:
        p = ROOT/'local-resources/regima/source/restored-swfs'/name
        sources.append(dict(path=p.relative_to(ROOT).as_posix(),sha256=hashlib.sha256(p.read_bytes()).hexdigest()))
    report = dict(status='observed-bounded-source',scope=__doc__,methods=records,sources=sources,
                  compileCommand=compile_command,command=command,exitCode=result.returncode,compiledSha256=hashlib.sha256((WORK/'Probe.swf').read_bytes()).hexdigest(),
                  rows=rows,generatedHashes={p.relative_to(WORK).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in WORK.rglob('*.as')},
                  substitutions=['body/effect/HP/AI services omitted; action fixed by fixture',
                    'exact BaseMonster.step flying suffix; nonmovement services excluded', 'Cubic.as copied byte-preserved from legacy source; main-library retains exact original DoABC/FileAttributes tags and removes document root',
                    'static controlled walls; moving/slope walls excluded',
                    'motion/repeat use deterministic renderTime; natural-tween separately uses native wall clock', 'beMagicAttack exact prefix ends after setAttackBack; HP/effects/rewards excluded', 'checkAttack exact target dedup/success block; target enumeration and other effects excluded', 'PhysicsWorld.step original; hero step is explicit pet-hit sink, not full hero animation' ])
    (OUT/((('mutation-'+mutation) if mutation else 'native')+'.json')).write_text(json.dumps(report,separators=(',',':')),encoding='utf-8')
    print('230 original movement oracle:',len(rows),'rows')


if __name__ == '__main__':
    main()
