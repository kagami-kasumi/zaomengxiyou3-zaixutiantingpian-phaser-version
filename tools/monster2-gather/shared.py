"""Generate the bounded original shared coordinate chain, with explicit services."""
import sys
sys.dont_write_bytecode = True
import json
from pathlib import Path
import ordering

base = ordering.base
HERE = Path(__file__).resolve().parent


def prepare(mutation=None):
    base.WORK = base.ROOT / 'local-resources/regima/task-outputs/TASK-SETTINGS-257B' / ('shared-' + mutation if mutation else 'shared')
    records = base.prepare()
    work = base.WORK
    def take(path, name):
        return base.method(path, name, records)
    def put(name, content):
        (work / name).write_text(content, encoding='utf-8')
    def methods(path, names):
        return '\n'.join(take(path, name) for name in names)
    common = 'import flash.display.*;import flash.geom.*;import flash.events.*;import flash.utils.*;import flash.system.*;import com.greensock.TweenMax;'
    body = methods('base/BaseObject.as', ['step', 'setSpeed', 'checkCanMove', 'nearToWall', 'getNextFrameBounds',
                    'getNextFrameXBounds', 'isCanMoveByStage', 'getBottom', 'getDownFloor', 'setStatic', 'resetGraity'])
    put('HeroBase.as', 'package {' + common + '''public dynamic class HeroBase extends MovieClip {
public var gc:Object,bbdc:Object=null,colipse:DisplayObject,speed:Point=new Point(),enforceSpeed:Point=new Point();
public var graity:Number=0,horizenSpeed:Number=5,horizenRunSpeed:Number=10;
public var isLeft:Boolean=false,isRight:Boolean=false,isFly:Boolean=false,istouming:Boolean=false;
public var fatherCount:int=-1,hmzfatherCount:int=-1,lysfatherCount:int=-1;
public var curAddEffect:Object=null,curMagicWeapon:Object=null,cureHpQueue:Object=null;
public var standInObj:Object,lastStandingObj:Object,headInObj:Object,leftInObj:Object,rightInObj:Object;
public var selfBitmap:Bitmap,wallBitmap:Bitmap,curAction:String="wait",magicBulletArray:Array=[];
public var isReadyToDestroy:Boolean=false;
public function isBeAttacking():Boolean{return curAction=="hurt"||curAction=="dead";}
public function isCanMoveWhenAttack():Boolean{return false;}
public function isRunning():Boolean{return false;}
public function isCannotMoveWhenAttack():Boolean{return false;}
public function isXCannotMoveWhenAttack():Boolean{return false;}
public function isYCannotMoveWhenAttack():Boolean{return false;}
public function isInSky():Boolean{return standInObj==null;}
public function isCannotMoveWhenAttackOnFloor():Boolean{return false;}
public function isAttacking():Boolean{return false;}
public function isWaiting():Boolean{return curAction=="wait";}
public function setAction(s:String):void{curAction=s;}
public function iswor():void{curAction="walk";}
protected function move():void{}
protected function checkOver():void{}
public function isDead():Boolean{return curAction=="dead";}
public var isGXP:Boolean=false;
public function getRoleId():uint{return 1;}
''' + body + '}}')
    hero = methods('base/BaseHero.as', ['step', 'move', 'isCanMoveByStage', 'destroy', 'isDead', 'getPlayer', 'getRoleId', 'setStatic'])
    put('BaseHero.as', 'package {' + common + '''public dynamic class BaseHero extends HeroBase {
public var sid:String="",keyarray:Object,doubleCount:int,lastKey:Object,lasttime:int,lastUpTime:int,lastDirbtn:int;
public var player:User=new User(),roleProperies:Object,roleId:uint=1,slot:int;
public var beAttackIdArray:Array=[],myPet:Object;
public function stepOther():void{}
public function setPet():void{}
public function updateEquip():void{}
public function updateMagicWeapon():void{}
public function turnRight():void{}
public function turnLeft():void{}
public function turnToNormal():void{}
public function clearAllBullets():void{magicBulletArray=[];}
public function getPet():Object{return null;}
public function getCurMagicWeapon():Object{return null;}
''' + hero + '}}')
    put('User.as', 'package {public dynamic class User{public var roleid:uint=1;public function getCurEquipByType(s:String):Object{return null;}public function reSetAllPetState():void{}}}')
    put('ConfigProbe.as', 'package {public dynamic class ConfigProbe{public var hero1:BaseHero,hero2:BaseHero;' + take('config/Config.as', 'getPlayerArray') + '}}')
    put('Role2Shadow.as', 'package {public class Role2Shadow extends BaseHero {}}')
    put('Wall.as', 'package {import flash.display.*;import flash.geom.*;public class Wall extends MovieClip {public var speedX:Number=0,speedY:Number=0;public function isStatic():Boolean{return true;}public function getNextFrameBound():Rectangle{return getBounds(parent);}public function step():void{}public function destroy():void{if(parent)parent.removeChild(this);}}}')
    put('ThroughWall.as', 'package {public class ThroughWall extends Wall {}}')
    put('BaseBullet.as', 'package {import flash.display.*;public class BaseBullet extends MovieClip{public var isReadyToDestroy:Boolean=false;public function step2():void{}public function destroy():void{}}}')
    put('BaseAura.as', 'package {public class BaseAura{public var isReadyToDestroy:Boolean=false;public function step():void{}}}')
    put('StopPoint.as', 'package {public class StopPoint{public function destroy():void{}}}')
    world = methods('World/PhysicsWorld.as', ['step', 'clearWaitFromParentArray', 'destroy'])
    put('WorldProbe.as', 'package {' + common + '''public dynamic class WorldProbe {
public var gc:Object,isSourceReady:Boolean=true,baseLevelListener:Object=null;
public var monsterArray:Array=[],heroArray:Array=[],otherHeroArray:Array=[],likeMonsterArray:Array=[],wallArray:Array=[],auraArray:Array=[];
public var stopPointArray:Array=[],markArray:Array=[],otherArray:Array=[],continueArray:Array=[],transferDoorArray:Array=[],monsterDisappertPointArray:Array=[],otherHeroUserArray:Array=[];
public function getWallArray():Array{return wallArray;}
public function getTransferDoorArray():Array{return [];}
''' + world + '}}')
    monster = take('base/BaseMonster.as', 'destroy')
    put('BaseMonster.as', 'package {' + common + '''public dynamic class BaseMonster extends MovieClip {
public var gc:Object,isBoss:Boolean=false,monsterName:String="Monster2",curAddEffect:Object=null,isReadyToDestroy:Boolean=false;
public var magicBulletArray:Array=[],curAttackTarget:Object,lastAttackTarget:Object,fallList:Object,protectedParamsObject:Object,skillCD:Object,hpSlip:Object,i:int;
public var skillCD1:Object,skillCD2:Object,skillCD3:Object,skillCD4:Object;
public var tickAction:Function;
public function step():void{if(tickAction!=null)tickAction();}
public function isDead():Boolean{return false;}
public function removeFromStage(o:DisplayObject):void{if(o.parent)o.parent.removeChild(o);}
''' + monster + '}}')
    put('Monster4.as', 'package {public class Monster4 extends BaseMonster{}}')
    source = methods('export/monster/Monster2.as', ['doHi2', 'destroy']).replace('private function doHi2', 'public function doHi2')
    put('MonsterProbe.as', 'package {' + common + 'public class MonsterProbe extends BaseMonster{' + source + '}}')
    main = methods('my/MainGame.as', ['__enterFrame', 'stopGame', 'continueGame', 'destroyGame'])
    put('MainGameProbe.as', 'package {' + common + '''public dynamic class MainGameProbe {
public static var _this:Object;public var gc:Object,root:Sprite;public var onStep:Function;
public function updateOther():void{if(onStep!=null)onStep();}
private function setFource():void{}
public function start():void{root.addEventListener(Event.ENTER_FRAME,__enterFrame);}
public function manual():void{__enterFrame(new Event(Event.ENTER_FRAME));}
''' + main + '}}')
    put('com/greensock/TweenMax.as', '''package com.greensock {public class TweenMax {
public static var backend:Class,last:Object;
public static var observe:Function,tracks:Array=[];
public static function to(o:Object,t:Number,p:Object):void{if(observe!=null&&"slot" in o)p.onUpdate=function():void{observe(o);};last=backend.to(o,t,p);if("slot" in o)tracks.push({target:o,tween:last,endX:p.x,endY:p.y});}
public static function pauseAll(a:Boolean,b:Boolean):void{backend.pauseAll(a,b);}
public static function resumeAll():void{backend.resumeAll();}
public static function killAll(a:Boolean):void{backend.killAll(a);}
}}''')
    put('AUtils.as', '''package {import flash.display.*;public class AUtils{
public static function getNewObj(s:String):Object{return new MovieClip();}
public static function flipHorizontal(o:DisplayObject,d:Number):void{o.scaleX=d;}
public static function stopAllChildren(o:DisplayObject):void{}
public static function startAllChildren(o:DisplayObject):void{}
}}''')
    put('Probe.as', (HERE / 'SharedProbe.as').read_text(encoding='utf-8'))
    stage = base.ROOT / 'local-resources/regima/source/restored-swfs/assets/StageCommon.swf'
    (work / 'stage-common.swf').write_bytes(stage.read_bytes())
    records.append(dict(path=stage.relative_to(base.ROOT).as_posix(), fileSha256=base.digest(stage)))
    app=work/'application.xml'
    app.write_text(app.read_text(encoding='utf-8').replace('regima.task257.preflight','regima.task257b.'+(mutation or 'shared')),encoding='utf-8')
    mutations = {
        'move-sign': ('BaseHero.as', 'this.x += Number(_loc4_ * _loc6_ * _loc7_);', 'this.x -= Number(_loc4_ * _loc6_ * _loc7_);'),
        'screen-clamp': ('BaseHero.as', 'this.x = _loc2_.x;', 'this.x = 10;'),
        'wall-snap': ('HeroBase.as', 'Number(_loc2_.y) - 0.1 - this.colipse.height / 2', 'Number(_loc2_.y) + 5 - this.colipse.height / 2'),
        'pause-tween': ('MainGameProbe.as', 'TweenMax.pauseAll(true,true);', '/* mutant: leave tween running */'),
        'exit-tween': ('MainGameProbe.as', 'TweenMax.killAll(false);', '/* mutant: leave tween running */'),
        'hero-kills': ('BaseHero.as', 'public function destroy() : void\n      {', 'public function destroy() : void\n      { TweenMax.backend.killTweensOf(this);'),
        'source-kills': ('MonsterProbe.as', 'super.destroy();', 'super.destroy();TweenMax.backend.killAll(false);'),
        'duration': ('MonsterProbe.as', 'TweenMax.to(_loc2_,1,', 'TweenMax.to(_loc2_,2,'),
        'world-before-tween': ('Probe.as', 'if(tick)lite.rootTimeline.renderTime(tick/fps,false,false);events();if(!gc.isStopGame&&main.root)main.manual();', 'events();if(!gc.isStopGame&&main.root)main.manual();if(tick)lite.rootTimeline.renderTime(tick/fps,false,false);'),
    }
    if mutation:
        file, old, new = mutations[mutation]
        path=work/file
        content=path.read_text(encoding='utf-8')
        assert old in content, mutation
        put(file,content.replace(old,new))
        probe=(work/'Probe.as').read_text(encoding='utf-8')
        probe=probe.replace("trace('CONTROLLED_COMPLETE');", "for each(var result:Object in rows)trace('ROW '+JSON.stringify(result));trace('RUNTIME '+Capabilities.version);trace('COMPLETE');NativeApplication.nativeApplication.exit();return;")
        put('Probe.as',probe)
    return work, records


if __name__ == '__main__':
    print(prepare()[0])
