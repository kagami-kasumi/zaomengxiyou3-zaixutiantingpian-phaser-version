"""Original hit registry/interval loop and monster defense, with collision outcome input."""
import hashlib
from prepare import ROOT,SRC,method

def prepare(work):
    records=[]
    def take(path,name):
        p=SRC/path;s=method(p.read_text(encoding='utf-8'),name)
        records.append(dict(path=str(p.relative_to(ROOT)).replace('\\','/'),method=name,sha256=hashlib.sha256(p.read_bytes()).hexdigest(),sliceSha256=hashlib.sha256(s.encode()).hexdigest()))
        return s
    def write(name,s):(work/name).write_text(s,encoding='utf-8')
    check=take('base/BaseBullet.as','checkAttack')
    refresh=take('base/BaseBullet.as','refreshSourceRoleAttackInfoObject').replace('refreshSourceRoleAttackInfoObject','sourceRefresh')
    write('HitBullet.as','''package {public class HitBullet {
public var gc:Config=new Config(),sourceRole:Object=new BasePet(),attackInterval:int=6,attackIntervalCount:int=0;
public var maxAttackCount:int=99,isDisabled:Boolean=false,imgMc1:Object=null,funcWhenHit:Function=null,_qixue:int=0;
public var isDestroyWhenMaxHitCountLessThenZero:Boolean=true,id:int=0,dead:Boolean=false,refresh:int=0,atk:int=100,_hurt:int=0,_atk:int=0,isCrit:Boolean=false,curAction:String='hit1';
public var sourceRoleAttackInfoObject:Object={attackKind:'physics'};
public function newAttackId():void{id++;}public function getAttackId():String{return 'attack-'+id;}
public function setBingoRate(n:int):void{}public function getImcName():String{return 'PetTurtle3Bullet3';}
public function refreshSourceRoleAttackInfoObject():void{refresh++;sourceRefresh();}public function destroy():void{dead=true;}
'''+check+refresh+'}}')
    write('BasePet.as','''package {public class BasePet {public var petInfo:Object={getAtk:function():int{return 101;}},attackBackInfoDict:Object={hit1:{attackKind:'physics'}};
public var power:Number=73.9;public function getRealPower(s:String,c:Boolean=true):Object{return {hurt:power,qixue:0};}
public function getSourceRole():BaseHero{return new BaseHero();}}}''')
    write('BaseHero.as','package {public class BaseHero {public function getPlayer():Object{return {getCurEquipByType:function(s:String):Object{return null;}};}public function getPet():Object{return null;}}}')
    write('BaseMonster.as','package {public class BaseMonster {}}')
    for name in ['Monster70','Monster71','Monster72','Monster73','Monster74','Monster75','Monster76','Monster77','Monster78','Monster34','MonsterRole4Hit5']:
        write(name+'.as','package {public class '+name+' {public function getSourceRole():Object{return null;}public function createShallow():void{}}}')
    write('Config.as','''package {public class Config {public var difficulity:int=0,isPK:Boolean=false,pWorld:Object={monsterArray:[],likeMonsterArray:[]};
public function getPlayerArray():Array{return [];}public function getRivalPlayer(p:Object):Object{return null;}public function isInRoom():Boolean{return false;}}}''')
    damage=take('base/BaseMonster.as','getRealHurt').replace('protected function','public function').replace('param2:BaseBullet','param2:HitBullet').replace('param3:BaseObject','param3:Object')
    write('Defense.as','package {public class Defense {public var def:int=20,mDef:Number=.25;'+damage+'}}')
    return records
