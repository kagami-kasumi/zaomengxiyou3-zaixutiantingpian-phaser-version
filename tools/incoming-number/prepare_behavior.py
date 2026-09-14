"""Extract native computational slices; stubs provide only external services/sinks."""
import hashlib
import re

def prepare(work,src):
    records=[]
    def take(path,start,end):
        p=src/path;full=p.read_text(encoding='utf-8');a=full.index(start);b=full.index(end,a);text=full[a:b]
        records.append(dict(path='local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/'+path,
            startLine=full[:a].count('\n')+1,endLine=full[:b].count('\n')+1,sha256=hashlib.sha256(p.read_bytes()).hexdigest(),
            sliceSha256=hashlib.sha256(text.encode()).hexdigest(),startMarker=start,endMarker=end))
        return text.replace('override public function','public function')
    def method(path,name,next_name):return take(path,'public function '+name,'public function '+next_name).replace('override ','')
    def write(name,text):
        p=work/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(text,encoding='utf-8')
    hero='base/BaseHero.as';pet='base/BasePet.as';buff='base/BaseAddEffect.as';hp='base/BaseRoleProperies.as'
    hero_prefix=take(hero,'override public function reduceHp','         if(this.roleProperies.getHHP() > 0)')+'}\n'
    hero_display=take(hero,'public function addHeroHurtMc','      protected function addMissMc')
    pig=take(hero,'override public function getHurtByPig8','      public function beMagicAttack1')
    write('BaseHero.as','''package {import flash.display.Sprite;import config.Config;import event.CommonEvent;import my.ANumber;
public class BaseHero extends Sprite {
public var gc:Config=Config.getInstance();public var sid:uint=1;public var isGXP:Boolean=false;
public var roleProperies:HP=new HP();public var curAddEffect:BaseAddEffect;public var pet:BasePet;
public function BaseHero(){roleProperies.who=this;x=300;y=350;}
public function getPet():BasePet{return pet;}public function getRoleId():int{return 1;}
public function getPlayer():Object{return {getCurEquipByType:function(type:String):Object{return null;}};}
public function cureMp(n:*):void{}public function setYourFather(n:*):void{}
public function setCurClothId(n:*):void{}public function setCurWeaponId(n:*):void{}public function refreshEquip():void{}
public function changePet():void{}public function changeMagicWeapon():void{}public function addCureMc(n:*):void{}
'''+hero_prefix+hero_display+pig+'}}')
    pet_prefix=take(pet,'override public function reduceHp','            if(gc.sid == this.sourceRole.sid && gc.isInRoom())')+'}\n}\n'
    full=(src/pet).read_text(encoding='utf-8');start=full.index('public function addMonHurtMc');end=full.index('\n      }',start)+8
    pet_display=full[start:end]
    records.append(dict(path='local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/'+pet,startLine=full[:start].count('\n')+1,endLine=full[:end].count('\n')+1,sha256=hashlib.sha256((src/pet).read_bytes()).hexdigest(),sliceSha256=hashlib.sha256(pet_display.encode()).hexdigest()))
    write('BasePet.as','''package {import flash.display.Sprite;import config.Config;import my.ANumber;
public class BasePet extends Sprite {public var gc:Config=Config.getInstance();public var sourceRole:BaseHero;
public var _petInfo:PetInfo=new PetInfo();public var curAddEffect:BaseAddEffect;public var isGXP:Boolean=false;
public function BasePet(){x=300;y=430;}public function showHpSlip():void{}public function drawPetHp():void{}
public function addCureMc(n:*):void{}
'''+pet_prefix+pet_display+'}}')
    setter=method(hp,'setHHP','getHHP');getter=method(hp,'getHHP','setMMP')
    write('HP.as','''package {import flash.events.EventDispatcher;import event.CommonEvent;
public class HP extends EventDispatcher {public var dataObject:Object={hhp:100};public var who:BaseHero;
public function HP(){addEventListener("SetHHp",function(e:CommonEvent):void{setHHP(int(e.data[0]));});}
public function getSHHP():int{return 1000;}
'''+setter+getter+'}}')
    setpet=method('petInfo/PetInfo.as','setHp','setSHp');getpet=method('petInfo/PetInfo.as','getHp','getSHp')
    write('PetInfo.as','package {public class PetInfo {public var _anti:Object={hp:100};public function gethpQuality():int{return 1;}'+setpet+getpet+'}}')
    consts=[];text=(src/buff).read_text(encoding='utf-8')
    for name in ['MAGIC_UMBRELLA_DEFEND','MAGIC_UMBRELLA_DEFEND2','tjgl_Shield','PETTURTKE_BUFF','ERLANGSHEN_HP_REJECT','MONSTER120DEBUFF','MONSTER129Buff']:
        consts.append(re.search(r'public static var '+name+r':String = [^;]+;',text)[0])
    remove=take(buff,'public function remove(param1:Object)','         if(param1.name == BaseAddEffect.POISON)')+'}\n'
    methods=method(buff,'reduceMagicUmbDef','reducetjglShieldDef')+take(buff,'public function reducetjglShieldDef','      protected function hide_magic_umb_def')
    methods+=method(buff,'getBuffByName','getBuffTimeLeftByName')+method(buff,'curDebuff','getAllBuffArray')
    write('BaseAddEffect.as','package {public class BaseAddEffect {public var sourceRole:BaseHero;public var curEffectArray:Array=[];'+''.join(consts)+remove+methods+'}}')
    r3=take('export/hero/Role3.as','override public function addHeroHurtMc','      private function isAttackingButCanAttack').replace('public function','override public function',1)
    write('Role3.as','package {import my.ANumber;public class Role3 extends BaseHero {'+r3+'}}')
    refresh=take('base/BaseMutiLevelListenering.as','private function refreshOtherMutiUser','      private function refreshRoomList').replace('private function','public function',1)
    write('BaseMutiLevelListenering.as','package {import flash.utils.ByteArray;import config.Config;public class BaseMutiLevelListenering {public var gc:Config=Config.getInstance();'+refresh+'}}')
    write('MutiUser.as','''package {public dynamic class MutiUser {public var hp:int=100;public var petHp:int=100;
public var equpId:int=0;public var weaponId:int=0;public var petName:String="A";public var bmwId:int=0;}}''')
    write('config/Config.as','''package config {import flash.display.Sprite;
public class Config {private static var instance:Config;public var gameSence:Sprite=new Sprite();
public var sid:uint=1;public var mode:String="single";public var user:Object;public var hero:Object;public var frameClips:int=24;
public var started:Boolean=true;public var nodeInfo:Object;
public function Config(){var self:Config=this;nodeInfo={isStartIng:function():Boolean{return self.started;}};}
public static function getInstance():Config{if(!instance)instance=new Config();return instance;}
public function isSingleGame():Boolean{return mode=="single";}public function isInRoom():Boolean{return mode=="room";}
public function getMutiUserBySidAndRoleId(s:*,r:*):*{return user;}public function getHeroBySidAndRoleId(s:*,r:*):*{return hero;}
public function sendSelfMutiUserInfo(r:*):void{}
}}''')
    write('my/ANumber.as','''package my {import flash.display.Sprite;
public class ANumber extends Sprite {public static var calls:Array=[];
public function aNumImage(f:String,v:int,x:int,y:int,stride:int):void{calls.push({value:v,x:x,y:y,stride:stride,family:f});}}}''')
    write('event/CommonEvent.as',(src/'event/CommonEvent.as').read_text(encoding='utf-8'))
    return records
