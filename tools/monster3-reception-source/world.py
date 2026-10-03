"""Original bullet integration; non-Monster3 class checks are type-only shells."""
from source import methods

def install(cls):
 for n in range(70,79):cls('Monster'+str(n),'BaseMonster','')
 cls('MonsterRole4Hit5','BaseObject','public function getSourceRole():BaseObject{return null;}')
 cls('BaseBullet','Sprite','''public static const DESIDE_BY_FRAMES_LEFT:uint=0;
 public var curAction:String='hit1',isBingo:Boolean=false,initTimer:uint=0,sourceRole:BaseObject,
 gc:Config=Config.instance,attackId:int=1,attackInterval:int=0,attackIntervalCount:int=0,maxAttackCount:int=0,
 sourceRoleAttackInfoObject:Object,_hurt:int=0,_qixue:int=0,_atk:int=0,isCrit:Boolean=false,
 isDisabled:Boolean=false,imgMc1:MovieClip=null,funcWhenHit:Function=null,isDestroyWhenMaxHitCountLessThenZero:Boolean=true;
 public function BaseBullet(){name='attack-';}
 public function getImgMc1():Object{return imgMc1;} public function getImcName():String{return 'Monster3Bullet1';}
 public function getFrameLeft():int{return 5;} public function destroy():void{this.destroyed=true;}
 '''+methods('base/BaseBullet.as',['setRole','setAction','refreshSourceRoleAttackInfoObject','setBingoRate','getAttackId','newAttackId','checkAttack']))
 cls('FollowBaseObjectBullet','BaseBullet','public function FollowBaseObjectBullet(s:String){} public function setDirect(a:*):void{} public function setDisable():void{}')
