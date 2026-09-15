"""221: compile unmodified family methods against explicit observation sinks.

No production TypeScript is imported. Source slices retain AS3 numeric semantics.
Animation, geometry and scheduler are controlled inputs, not visual truth.
"""
import hashlib
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts'

def method(text, name):
    match = re.search(r'(?:override )?(?:public|protected|private) function '+name+r'\(', text)
    if not match:
        raise ValueError(name)
    start = match.start(); brace = text.index('{', match.end()); depth = 1; end = brace + 1
    while depth:
        depth += (text[end] == '{') - (text[end] == '}'); end += 1
    return text[start:end]

def prepare(work, mutation=None):
    records = []
    def take(path, name):
        p = SRC / path; full = p.read_text(encoding='utf-8'); s = method(full, name)
        records.append(dict(path=str(p.relative_to(ROOT)).replace('\\','/'), method=name,
                            startLine=full[:full.index(s)].count('\n')+1,
                            sha256=hashlib.sha256(p.read_bytes()).hexdigest(),
                            sliceSha256=hashlib.sha256(s.encode()).hexdigest()))
        if mutation:
            s = mutation(path, name, s)
        return s
    def write(path, data):
        p=work/path;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(data,encoding='utf-8')
    # Keep actual constructor, all state/action/skill functions, power and callbacks.
    for form in range(1,5):
        path=f'export/pet/PetTurtle{form}.as'; full=(SRC/path).read_text(encoding='utf-8')
        names=re.findall(r'function (\w+)\(',full)
        funcs=[]
        for name in names:
            if name in ('initBBDC','newColipse'):
                continue
            funcs.append(take(path,name))
        write(f'export/pet/PetTurtle{form}.as', 'package export.pet {import base.*;import export.bullet.*;import flash.display.*;import flash.geom.*;import petInfo.PetInfo;import com.greensock.*;import event.*;public class PetTurtle'+str(form)+' extends BasePet {'+('private var isAoyi:Boolean=false;' if form==4 else '')+'\n'.join(funcs)+'''
public function probeGate(n:int):Boolean {switch(n){case 1:return beforeSkill1Start();case 2:return beforeSkill2Start();case 3:return beforeSkill3Start();case 4:return beforeSkill4Start();}return false;}
public function probeSkill(n:int):void {switch(n){case 1:releSkill1();break;case 2:releSkill2();break;case 3:releSkill3();break;case 4:releSkill4();break;}}
public function probeNormal():void{normalHit();}
public function probeFrame(x:int,count:int):void{bbdc.count=count;enterFrameFunc(new Point(x,0));}
public function probeOver():void{scriptFrameOverFunc(0);}
public function probeAI():void{myIntelligence();}
public function probeFloor():Boolean{return isCannotMoveWhenAttackOnFloor();}
}}''')
    base_names=['myIntelligence','countSkillCD','followTarget','followSource','searchTarget','faceToTarget','addAoyiBuff','reduceHp','cureHp','getCriteValue','getMagicAddValue','hurtBaseEffectRate','destroy','isDead']
    funcs=[]
    base_constructor=take('base/BasePet.as','BasePet')
    final_rate=re.findall(r'this.attackRate = ([^;]+);',base_constructor)[-1]
    for name in base_names:
        s=take('base/BasePet.as',name).replace('override ','')
        # Deterministic random stream replaces only ambient RNG, not branches.
        s=s.replace('Math.random()', 'gc.random()')
        funcs.append(s)
    funcs.extend(take('base/BaseObject.as',n) for n in ['isAttacking','isBeAttacking'])
    write('base/BasePet.as', '''package base {import flash.display.*;import flash.geom.*;import petInfo.PetInfo;import export.bullet.*;import com.greensock.*;
public class BasePet extends Sprite {
public var sourceRole:BaseHero;public var _petInfo:PetInfo;public var gc:Config=Config.instance;
public var horizenSpeed:Number=5,attackRange:Number=0,attackRate:Number=.7,followRange:Number=640,searchRange:Number=1200,timeCount:int=0;
public var attackBackInfoDict:Object={},skillCD1:Array=[0,0],skillCD2:Array=[0,0],skillCD3:Array=[0,0],skillCD4:Array=[0,0];
public var curAction:String='wait',lastHit:String='',curAttackTarget:Object,curAddEffect:BaseAddEffect=new BaseAddEffect();
public var magicBulletArray:Array=[],bbdc:Clip=new Clip(),isGXP:Boolean=false,isReadyToDestroy:Boolean=false,events:Array=[];
public function BasePet(h:BaseHero,p:PetInfo){sourceRole=h;_petInfo=p;h.pet=this;}
public function setAction(s:String):void{curAction=s;events.push(['action',s]);}
public function getBBDC():Clip{return bbdc;}public function newAttackId():void{events.push(['attackId']);}
public function setYourFather(n:*):void{events.push(['protect',n]);}public function setStatic():void{events.push(['static']);}
protected function beforeSkill1Start():Boolean{return false;}protected function beforeSkill2Start():Boolean{return false;}
protected function beforeSkill3Start():Boolean{return false;}protected function beforeSkill4Start():Boolean{return false;}
protected function releSkill1():void{}protected function releSkill2():void{}protected function releSkill3():void{}protected function releSkill4():void{}
protected function normalHit():void{}protected function enterFrameFunc(p:Point):void{}protected function exitFrameFunc(p:Point):void{}
protected function scriptFrameOverFunc(n:int):void{}protected function isCannotMoveWhenAttackOnFloor():Boolean{return false;}
protected function move():void{events.push(['move']);}protected function turnLeft():*{bbdc.direct=0;events.push(['left']);}
protected function turnRight():*{bbdc.direct=1;events.push(['right']);}protected function jump():void{}protected function getFallDown():void{}
protected function checkBuffSkill():void{}public function setOtherAttack(s:String,d:uint,p:Point,a:Array=null,n:uint=0):void{}
public function getRealPower(s:String,c:Boolean=true):Object{return {hurt:0};}public function setAttackBack(p:Point):void{events.push(['back',p.x,p.y]);}
public function showHpSlip():void{}public function drawPetHp():void{}public function addMonHurtMc(n:int,c:Boolean):void{events.push(['damage',n]);}
public function addCureMc(n:int):void{events.push(['cure',n]);}public function tickCD():void{countSkillCD();}
public function getSourceRole():BaseHero{return sourceRole;}
'''.replace('attackRate:Number=.7','attackRate:Number='+final_rate)+ '\n'.join(funcs)+'}}')
    # External services are intentionally sinks. All numeric pet setters use source.
    pinfo='petInfo/PetInfo.as'
    setters='\n'.join(take(pinfo,n) for n in ['setHp','getHp','setMp','getMp','findPetUsedMagic'])
    setters+=take(pinfo,'getPetHarmObj').replace('getPetHarmObj(', 'sourceHarm(')
    write('petInfo/PetInfo.as','''package petInfo {public class PetInfo {
public var _anti:Object={hp:100,mp:1000},skills:Object={},harms:Object={},costs:Object={},isFight:Boolean=true,life:int=10;
public function gethpQuality():int{return 1;}public function getmpQuality():int{return 1;}
public function findHasStudySkill(s:String):Boolean{return Boolean(skills[s]);}
public function getPetHarmObj(s:String):Object{return harms[s];}public function getAtk():int{return 101;}
public function getSHp():int{return 1000;}public function getSMp():int{return 1000;}public function getlifetime():int{return life;}
public function getCurPetState():int{return 4;}public function getwarpower():Number{return 1.7;}public function gettechnique():Number{return 1.3;}
public function setlifetime(n:int):void{life=n;}public function getCrit():Number{return 0;}public function getCrite():Number{return 0;}
'''+setters+'}}')
    write('base/Clip.as','''package base {import flash.geom.Point;public class Clip {public var point:Point=new Point(),state:String='wait',direct:int=1,count:int=0;
public function getCurPoint():Point{return point;}public function setFramePointX(n:int):void{point.x=n;}public function setFramePointY(n:int):void{point.y=n;}
public function setState(s:String):void{state=s;}public function getState():String{return state;}public function getDirect():int{return direct;}
public function getCurFrameCount():int{return count;}public function destroy():void{}}}''')
    write('base/BaseHero.as','''package base {import flash.display.Sprite;public class BaseHero extends Sprite {
public var sid:uint=1,pet:BasePet,curAddEffect:BaseAddEffect=new BaseAddEffect(),roleProperies:HP=new HP();
public function getRoleId():int{return sid;}public function clearPet():void{pet=null;}public function addCureMc(n:int):void{roleProperies.cures.push(n);}
public function getPlayer():Object{return {};}}}''')
    write('base/HP.as','''package base {import flash.events.EventDispatcher;import event.CommonEvent;public class HP extends EventDispatcher {
public var hp:int=100,cures:Array=[];public function HP(){addEventListener('SetHHp',function(e:CommonEvent):void{setHHP(e.data[0]);});}
public function getHHP():int{return hp;}public function setHHP(n:int):void{hp=Math.max(0,Math.min(1000,n));}}}''')
    write('event/CommonEvent.as',(SRC/'event/CommonEvent.as').read_text(encoding='utf-8'))
    write('base/BaseAddEffect.as','''package base {public class BaseAddEffect {
public static var PETTURTKE_BUFF:String='petturtle_buff',MAGIC_FLOWER_ADDBUFF:String='magic_flower_addbuff',PET_FSNL:String='pet_fsnl',PET_SXKB:String='pet_sxkb';
public var buffs:Array=[];public function add(a:Array):void{buffs=buffs.concat(a);}public function getBuffByName(s:String):Object{for each(var b:Object in buffs)if(b.name==s)return b;return null;}
public function isAnyThingElseStun(s:String):Boolean{return false;}public function destroy():void{buffs=[];}}}''')
    write('base/Config.as','''package base {import flash.display.Sprite;public class Config {public static var instance:Config=new Config();
public var sid:uint=1,frameClips:int=24,mode:String='single',obbsiteArray:Array=[],rolls:Array=[0],sent:Array=[];
public var gameSence:Sprite=new Sprite(),protectedPerproty:Object={removeProperty:function(p:*):void{}};
public function random():Number{return rolls.length?Number(rolls.shift()):0;}public function isSingleGame():Boolean{return mode=='single';}
public function isInRoom():Boolean{return mode=='room';}public function isInRoomOrSingleGame():Boolean{return true;}
public function getMutiUserBySidAndRoleId(a:*,b:*):Object{return null;}public function sendSelfMutiUserInfo(n:*):void{}
public function sendPetAttack(...args):void{sent.push(args);}public function sendPetAction(...args):void{}public function sendPetDead(...args):void{}
}}''')
    write('AUtils.as','''package {public class AUtils {public static function GetDisBetweenTwoObj(a:Object,b:Object):Number{return b?Math.sqrt((a.x-b.x)*(a.x-b.x)+(a.y-b.y)*(a.y-b.y)):NaN;}}}''')
    write('com/greensock/TweenMax.as','''package com.greensock {public class TweenMax {public static var jobs:Array=[];
public static function delayedCall(t:Number,f:Function,a:Array):void{jobs.push({time:t,fn:f,args:a});}
public static function to(o:Object,t:Number,p:Object):void{}
public static function fire(t:Number):void{var copy:Array=jobs.concat();jobs=jobs.filter(function(j:Object,i:int,a:Array):Boolean{return j.time!=t;});for each(var j:Object in copy)if(j.time==t)j.fn.apply(null,j.args);}}}''')
    write('base/BaseBullet.as','''package base {import flash.display.Sprite;public class BaseBullet extends Sprite {
public var nameId:String,sourceRole:BasePet,curAction:String,direct:int,isReadyToDestroy:Boolean=false,cut:Boolean=false,last:Boolean=true,ttl:int=0,disabled:Boolean=false;
public function BaseBullet(s:String){nameId=s;}public function setRole(p:BasePet):void{sourceRole=p;}public function setDirect(n:int):void{direct=n;}
public function setAction(s:String):void{curAction=s;}public function setHurtCanCutDownEffect(b:Boolean):void{cut=b;}
public function setDestroyWhenLastFrame(b:Boolean):void{last=b;}public function setDestroyInCount(n:uint):void{ttl=n;}
public function setDisable():void{disabled=true;}public function destroy():void{isReadyToDestroy=true;}}}''')
    for cls in ['SpecialEffectBullet','FollowBaseObjectBullet']:
        write(f'export/bullet/{cls}.as',f'package export.bullet {{import base.BaseBullet;public class {cls} extends BaseBullet {{public function {cls}(s:String){{super(s);}}}}}}')
    return records
