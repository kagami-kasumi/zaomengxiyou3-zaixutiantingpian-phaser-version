"""258 real hero/pet retirement; only display/tween services remain external."""
from source import methods

def install(edit):
    edit('BaseObject.as', 'public var attackId:int=1;', "public var isReadyToDestroy:Boolean=false,speed:Point=new Point(),isLeft:Boolean=false,isRight:Boolean=false;" + methods('base/BaseObject.as',['setStatic']) + 'public var attackId:int=1;')
    edit('BaseObject.as', 'setFramePointX:function(v:*):void{}', 'setFramePointX:function(v:*):void{},destroy:function():void{}')
    edit('BaseHero.as', 'public function destroy():void{this.destroyed=true;}', methods('base/BaseHero.as',['destroy','clearAllBullets','clearPet','setStatic']) + 'public var keyarray:Object,lastKey:Object,lasttime:int,lastUpTime:int,lastDirbtn:int,curMagicWeapon:Object;public function turnToNormal():void{}')
    edit('BasePet.as', 'public function showHpSlip():void{}', methods('base/BasePet.as',['destroy']) + 'public function showHpSlip():void{}')
    edit('BaseAddEffect.as', 'public function updateFather():void{}', 'public function destroy():void{curEffectArray=[];}public function updateFather():void{}')
    edit('TweenMax.as', 'public static function to', 'public static function killChildTweensOf(o:*):void{} public static function to')
    edit('BaseBullet.as', 'public function getImgMc1()', 'public function setDisable():void{isDisabled=true;}public function getImgMc1()')
    edit('Config.as', 'public var sid:int=1,', 'public var keyboardControl:Object=null;public var sid:int=1,')
    edit('Config.as', 'setProperty:function(o:*,k:String,v:*):void{o[k]=v;}', 'setProperty:function(o:*,k:String,v:*):void{o[k]=v;},removeProperty:function(o:*):void{o.isYourFather=false;o.hmzFather=false;o.lysFather=false;}')
    edit('FollowBaseObjectBullet.as', 'public function setDisable():void{}', '')
