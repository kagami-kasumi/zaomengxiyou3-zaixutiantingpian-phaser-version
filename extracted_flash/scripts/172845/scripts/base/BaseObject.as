package base
{
   import com.*;
   import com.greensock.*;
   import com.greensock.easing.*;
   import config.*;
   import export.*;
   import export.bullet.*;
   import export.hero.*;
   import flash.display.*;
   import flash.events.*;
   import flash.filters.*;
   import flash.geom.*;
   import flash.text.*;
   import flash.utils.*;
   import my.*;
   
   public class BaseObject extends MovieClip
   {
      
      protected var cureHpQueue:CureHpQueue;
      
      public var beattackedtimes:Number = 0;
      
      private var selfBitmap:Bitmap;
      
      private var istouming:Boolean;
      
      private var wallBitmap:Bitmap;
      
      public var standInObj:MovieClip;
      
      public var headInObj:MovieClip;
      
      public var leftInObj:MovieClip;
      
      public var rightInObj:MovieClip;
      
      public var isRight:Boolean = false;
      
      public var isLeft:Boolean = false;
      
      public var isFly:Boolean = false;
      
      public var attackId:int = 0;
      
      public var beAttackIdArray:Array;
      
      public var isAlreadyDead:Boolean = false;
      
      protected var horizenSpeed:Number = 5;
      
      protected var horizenRunSpeed:Number = 10;
      
      protected var graity:Number = 1.5;
      
      protected var jumpPower:Number = -20;
      
      public var isReadyToDestroy:Boolean = false;
      
      protected var nameTextField:TextField;
      
      public var curAction:String = "wait";
      
      public var body:Sprite;
      
      public var colipse:Sprite;
      
      protected var gc:Config;
      
      public var speed:Point;
      
      public var magicBulletArray:Array;
      
      public var attackBackArray:Array;
      
      public var attackBackSpeedArray:Array;
      
      public var hitMaxAttackCountArray:Array;
      
      public var attackBackInfoDict:Dictionary;
      
      protected var fatherCount:int;
      
      protected var hmzfatherCount:int;
      
      protected var lysfatherCount:int;
      
      public var isGXP:Boolean = false;
      
      protected var shadowCount:int = 0;
      
      public var lastHit:String = "";
      
      public var enforceSpeed:Point;
      
      public var moveAttack:Boolean = true;
      
      public var curAddEffect:BaseAddEffect;
      
      protected var curMagicWeapon:BaseMagicWeapon;
      
      protected var lastWalkSendInterval:int;
      
      protected var lastRunSendInterval:int;
      
      public var sid:int;
      
      public var lastStandingObj:MovieClip;
      
      protected var bbdc:BaseBitmapDataClip;
      
      public function BaseObject()
      {
         this.graity = 1.5;
         this.beAttackIdArray = new Array();
         this.nameTextField = new TextField();
         this.speed = new Point(0,4);
         this.magicBulletArray = new Array();
         this.attackBackInfoDict = new Dictionary();
         this.enforceSpeed = new Point();
         this.cureHpQueue = new CureHpQueue();
         super();
         this.gc = Config.getInstance();
         this.addEventListener(Event.ADDED_TO_STAGE,this.__added);
         this.addEventListener(Event.REMOVED_FROM_STAGE,this.__removed);
         this.body = new Sprite();
         this.addChild(this.body);
         this.newColipse();
         this.initBBDC();
         this.gc.protectedPerproty.addProperty(this,"isYourFather",false);
         this.gc.protectedPerproty.addProperty(this,"jumpCount",0);
      }
      
      protected function newColipse() : void
      {
      }
      
      protected function initBBDC() : void
      {
      }
      
      protected function __removed(param1:Event) : void
      {
         this.removeEventListener(Event.REMOVED_FROM_STAGE,this.__removed);
      }
      
      protected function __added(param1:Event) : void
      {
         this.removeEventListener(Event.ADDED_TO_STAGE,this.__added);
      }
      
      protected function scriptFrameOverFunc(param1:int) : void
      {
      }
      
      protected function enterFrameFunc(param1:Point) : void
      {
      }
      
      protected function exitFrameFunc(param1:Point) : void
      {
      }
      
      public function step() : void
      {
         if(this.bbdc)
         {
            this.bbdc.step();
         }
         if(!this.isBeAttacking())
         {
            this.setSpeed();
         }
         if(!this.isFly)
         {
            this.checkCanMove();
         }
         else if(this.isCanMoveByStage())
         {
            this.move();
         }
         if(this.fatherCount >= 0)
         {
            --this.fatherCount;
            if(this.istouming)
            {
               this.alpha = 0.5;
            }
            if(this.fatherCount < 0)
            {
               this.fatherCount = -1;
               this.alpha = 1;
               this.gc.protectedPerproty.setProperty(this,"isYourFather",false);
            }
         }
         if(this.hmzfatherCount >= 0)
         {
            --this.hmzfatherCount;
            if(this.istouming)
            {
               this.alpha = 0.5;
            }
            if(this.hmzfatherCount < 0)
            {
               this.hmzfatherCount = -1;
               this.alpha = 1;
               this.gc.protectedPerproty.setProperty(this,"hmzFather",false);
            }
         }
         if(this.lysfatherCount >= 0)
         {
            --this.lysfatherCount;
            if(this.istouming)
            {
               this.alpha = 0.5;
            }
            if(this.lysfatherCount < 0)
            {
               this.lysfatherCount = -1;
               this.alpha = 1;
               this.gc.protectedPerproty.setProperty(this,"lysFather",false);
            }
         }
         this.checkOver();
         if(this.curAddEffect)
         {
            this.curAddEffect.step();
         }
         if(this.curMagicWeapon)
         {
            this.curMagicWeapon.step();
         }
         if(this.cureHpQueue)
         {
            this.cureHpQueue.step();
         }
      }
      
      protected function checkOver() : void
      {
      }
      
      protected function mygotoAndStop(param1:BaseObject, param2:String) : *
      {
         if(this is BaseMonster)
         {
            if(param1.currentLabel != param2)
            {
               param1.gotoAndStop(param2);
            }
         }
      }
      
      protected function turnToGXP() : void
      {
      }
      
      public function addCurAddEffect(param1:Array) : void
      {
         if(this.curAddEffect)
         {
            this.curAddEffect.add(param1);
         }
      }
      
      public function cancelAllEffect() : void
      {
         if(this.curAddEffect)
         {
            this.curAddEffect.cancelAllEffect();
         }
      }
      
      public function getCurAddEffect(param1:String) : Boolean
      {
         if(!this.curAddEffect)
         {
            return false;
         }
         return this.curAddEffect.curDebuff(param1);
      }
      
      protected function setSpeed() : void
      {
         if(this.isLeft)
         {
            if(!this.isCanMoveWhenAttack())
            {
               if(!this.isRunning())
               {
                  this.speed.x = -Number(this.horizenSpeed);
               }
               else
               {
                  this.speed.x = -Number(this.horizenRunSpeed);
               }
            }
         }
         if(this.isRight)
         {
            if(!this.isCanMoveWhenAttack())
            {
               if(!this.isRunning())
               {
                  this.speed.x = this.horizenSpeed;
               }
               else
               {
                  this.speed.x = this.horizenRunSpeed;
               }
            }
         }
         if(this.isCannotMoveWhenAttack())
         {
            this.speed.x = 0;
            this.speed.y = 0;
            return;
         }
         if(this.isXCannotMoveWhenAttack())
         {
            this.speed.x = 0;
            return;
         }
         if(this.isYCannotMoveWhenAttack())
         {
            this.speed.y = 0;
            return;
         }
         if(!this.isInSky())
         {
            if(this.isCannotMoveWhenAttackOnFloor())
            {
               this.speed.x = 0;
               return;
            }
         }
      }
      
      public function addCureMc(param1:int, param2:String = "bunum") : void
      {
         if(param1 > 0)
         {
            if(this.cureHpQueue)
            {
               this.cureHpQueue.addCure(param1,x - 20,y - 60);
            }
         }
      }
      
      public function addCureMpMc(param1:int) : void
      {
         if(param1 > 0)
         {
            if(this.cureHpQueue)
            {
               this.cureHpQueue.addMpCure(param1,x - 20,y - 60);
            }
         }
      }
      
      public function addHeroMpReduceMc(param1:int) : void
      {
         if(this.cureHpQueue)
         {
            this.cureHpQueue.addMpLose(param1,this.x - 20,this.y - 60);
         }
      }
      
      public function addBingoMc() : void
      {
         var bm:Bitmap = AUtils.getImageObj("bingo") as Bitmap;
         bm.x = this.x;
         bm.y = this.y - 30;
         this.gc.gameSence.addChild(bm);
         TweenMax.to(bm,1,{
            "y":this.y - 100,
            "onComplete":function(param1:Bitmap):*
            {
               if(gc.gameSence)
               {
                  if(gc.gameSence.contains(param1))
                  {
                     gc.gameSence.removeChild(param1);
                  }
               }
            },
            "onCompleteParams":[bm]
         });
      }
      
      public function isCanMoveWhenAttack() : Boolean
      {
         return false;
      }
      
      protected function isXCannotMoveWhenAttack() : Boolean
      {
         return false;
      }
      
      protected function isYCannotMoveWhenAttack() : Boolean
      {
         return false;
      }
      
      public function getAmatureDirect() : int
      {
         return null;
      }
      
      protected function isRunning() : Boolean
      {
         return false;
      }
      
      protected function checkCanMove() : void
      {
         var _loc1_:* = null;
         var _loc2_:* = null;
         var _loc3_:* = null;
         var _loc4_:* = null;
         var _loc5_:* = null;
         var _loc6_:Number = Number(NaN);
         var _loc7_:* = null;
         this.lastStandingObj = this.standInObj;
         this.standInObj = null;
         this.headInObj = null;
         this.leftInObj = null;
         this.rightInObj = null;
         var _loc8_:Array = this.gc.pWorld.getWallArray();
         var _loc9_:int = 0;
         while(_loc9_ < _loc8_.length)
         {
            _loc1_ = _loc8_[_loc9_];
            if(_loc1_ is Wall)
            {
               if(Wall(_loc1_).isStatic())
               {
                  _loc2_ = _loc1_.getBounds(this.gc.gameSence);
               }
               else
               {
                  _loc2_ = Wall(_loc1_).getNextFrameBound();
               }
            }
            else
            {
               _loc2_ = _loc1_.getBounds(this.gc.gameSence);
            }
            if(_loc2_.intersects(this.getNextFrameBounds()))
            {
               if(_loc1_.rotation != 0 && Math.round(_loc1_.rotation) != 90 && !_loc1_.isOutOfThisLine(this) || Boolean(_loc1_.rotation != 0 && Math.round(_loc1_.rotation) != 90 && _loc1_.isOutOfThisLine(this)) && Boolean(Boolean(_loc2_.intersects(this.getNextFrameXBounds()))))
               {
                  if(!this.selfBitmap)
                  {
                     _loc4_ = new BitmapData(this.colipse.width,this.colipse.height,true,2236962);
                     _loc4_.draw(this.colipse,new Matrix(1,0,0,1,this.colipse.width / 2,this.colipse.height / 2));
                     this.selfBitmap = new Bitmap(_loc4_);
                     this.selfBitmap.x = this.x - Number(this.selfBitmap.width) / 2 + this.speed.x;
                     this.selfBitmap.y = this.y - Number(this.selfBitmap.height) / 2 + this.speed.y;
                  }
                  else
                  {
                     this.selfBitmap.x = this.x - Number(this.selfBitmap.width) / 2 + this.speed.x;
                     this.selfBitmap.y = this.y - Number(this.selfBitmap.height) / 2 + this.speed.y;
                  }
                  _loc3_ = _loc1_.transform.matrix;
                  _loc3_.tx = Number(_loc1_.width) / 2;
                  _loc3_.ty = Number(_loc1_.height) / 2;
                  if(!this.wallBitmap)
                  {
                     _loc5_ = new BitmapData(_loc1_.width,_loc1_.height,true,2236962);
                     _loc6_ = Number(_loc1_.rotation) * Math.PI / 180;
                     _loc5_.draw(_loc1_,_loc3_);
                     this.wallBitmap = new Bitmap(_loc5_);
                     this.wallBitmap.name = _loc1_.name;
                     this.wallBitmap.x = Number(_loc1_.x) - Number(this.wallBitmap.width) / 2;
                     this.wallBitmap.y = Number(_loc1_.y) - Number(this.wallBitmap.height) / 2;
                  }
                  else if(this.wallBitmap.name != _loc1_.name)
                  {
                     this.wallBitmap.bitmapData.fillRect(this.wallBitmap.bitmapData.rect,16777215);
                     this.wallBitmap.bitmapData.draw(_loc1_,_loc3_);
                     this.wallBitmap.x = Number(_loc1_.x) - Number(this.wallBitmap.width) / 2;
                     this.wallBitmap.y = Number(_loc1_.y) - Number(this.wallBitmap.height) / 2;
                     this.wallBitmap.name = _loc1_.name;
                  }
                  else
                  {
                     this.wallBitmap.x = Number(_loc1_.x) - Number(this.wallBitmap.width) / 2;
                     this.wallBitmap.y = Number(_loc1_.y) - Number(this.wallBitmap.height) / 2;
                  }
                  if(this.selfBitmap.bitmapData.hitTest(new Point(this.selfBitmap.x,this.selfBitmap.y),0,this.wallBitmap.bitmapData,new Point(this.wallBitmap.x,this.wallBitmap.y),1))
                  {
                     _loc7_ = _loc1_.setYByRole(this);
                     if(!this.isLeft && !this.isRight && !this.isAttacking() && !this.isBeAttacking())
                     {
                        if(!this.isWaiting())
                        {
                           this.setAction("wait");
                        }
                     }
                     if(this.speed.y > 0)
                     {
                        this.getDownFloor();
                     }
                     this.speed.x = _loc7_.x;
                     this.speed.y = _loc7_.y;
                  }
               }
               else
               {
                  if(this.selfBitmap)
                  {
                     this.selfBitmap.bitmapData.dispose();
                     this.selfBitmap = null;
                  }
                  if(this.wallBitmap)
                  {
                     this.wallBitmap.bitmapData.dispose();
                     this.wallBitmap = null;
                  }
                  this.nearToWall(_loc1_);
               }
            }
            _loc9_++;
         }
         this.move();
      }
      
      protected function nearToWall(param1:MovieClip) : void
      {
         var _loc2_:* = null;
         var _loc3_:Rectangle = param1.getBounds(this.gc.gameSence);
         if(param1 is Wall)
         {
            if(Wall(param1).isStatic())
            {
               _loc2_ = param1.getBounds(this.gc.gameSence);
            }
            else
            {
               _loc2_ = Wall(param1).getNextFrameBound();
            }
         }
         else
         {
            _loc2_ = param1.getBounds(this.gc.gameSence);
         }
         var _loc4_:Rectangle = this.getNextFrameBounds();
         var _loc5_:Rectangle = this.colipse.getBounds(this.gc.gameSence);
         var _loc6_:* = 8;
         if(param1 is Wall)
         {
            _loc6_ = Number(_loc6_ + Math.max(Math.abs(this.speed.y),Math.abs(Wall(param1).speedY)));
         }
         if(this.speed.y > 0 && this.getBottom() <= _loc2_.y + _loc6_)
         {
            if(!param1.getChildByName("isThroughDownButUpWall"))
            {
               if(param1 is ThroughWall)
               {
                  this.standInObj = param1;
                  this.y = Number(_loc2_.y) - 0.1 - this.colipse.height / 2;
                  this.speed.y = 0;
                  this.getDownFloor();
               }
               else if(_loc5_.x + _loc5_.width > _loc2_.x && _loc5_.x < _loc2_.x + _loc2_.width)
               {
                  this.standInObj = param1;
                  this.y = Number(_loc2_.y) - 0.1 - this.colipse.height / 2;
                  this.speed.y = 0;
                  this.getDownFloor();
               }
            }
         }
         if(!(Boolean(param1.getChildByName("isThroughWall")) || Boolean(param1.getChildByName("isThroughUpButDownWall"))))
         {
            if(this.speed.y <= 0 && _loc5_.y > _loc2_.y + _loc3_.height)
            {
               this.headInObj = param1;
               this.y = _loc2_.y + _loc2_.height + 0.1 + this.colipse.height / 2;
               this.speed.y = 0;
            }
            if(this.speed.x <= 0 && (_loc5_.x >= _loc3_.x + _loc3_.width && _loc4_.x <= _loc2_.x + _loc2_.width && _loc4_.x + _loc4_.width >= _loc2_.x) && this.getBottom() > _loc2_.y + 5)
            {
               this.leftInObj = param1;
               this.x = _loc2_.x + _loc2_.width + 2 + this.colipse.width / 2;
               this.speed.x = 0;
            }
            if(this.speed.x >= 0 && (_loc5_.x <= _loc3_.x && _loc4_.x + _loc4_.width >= _loc2_.x && _loc4_.x <= _loc2_.x + _loc2_.width) && this.getBottom() > _loc2_.y + 5)
            {
               this.rightInObj = param1;
               this.x = Number(_loc2_.x) - 2 - this.colipse.width / 2;
               this.speed.x = 0;
            }
         }
      }
      
      protected function move() : void
      {
         if(this.isWalkOrRun() || this.isInSky() || this.isBeAttacking() || this.isCanMoveWhenAttack())
         {
            this.x += this.speed.x;
         }
         this.y += this.speed.y;
         this.speed.y += this.graity;
         this.x += this.enforceSpeed.x;
         this.y += this.enforceSpeed.y;
      }
      
      protected function moveLeft() : void
      {
         if(!this.isAttacking())
         {
            this.turnLeft();
            if(!this.isInSky() && !this.isAttacking() && !this.isBeAttacking())
            {
               this.iswor();
            }
         }
      }
      
      protected function turnLeft() : *
      {
         this.isLeft = true;
         this.isRight = false;
         if(this.gc.sid == this.sid && this is BaseHero && !(this is Role2Shadow))
         {
            if(this.getBBDC().getDirect() == 1)
            {
               this.gc.sendLorRInfo(BaseHero(this));
            }
         }
         this.bbdc.turnLeft();
      }
      
      protected function moveRight() : void
      {
         if(!this.isAttacking())
         {
            this.turnRight();
            if(!this.isInSky() && !this.isAttacking() && !this.isBeAttacking())
            {
               this.iswor();
            }
         }
      }
      
      protected function turnRight() : *
      {
         this.isRight = true;
         this.isLeft = false;
         if(this.gc.sid == this.sid && this is BaseHero && !(this is Role2Shadow))
         {
            if(this.getBBDC().getDirect() == 0)
            {
               this.gc.sendLorRInfo(BaseHero(this));
            }
         }
         this.bbdc.turnRight();
      }
      
      public function stopMoveL() : void
      {
         this.isLeft = false;
         if(!this.isRight)
         {
            if(!this.isAttacking())
            {
               if(!this.isInSky())
               {
                  if(!this.isWaiting())
                  {
                     this.setAction("wait");
                  }
               }
            }
            if(!this.isCanMoveWhenAttack())
            {
               this.speed.x = 0;
            }
         }
         else
         {
            this.bbdc.turnRight();
         }
      }
      
      public function stopMoveR() : void
      {
         this.isRight = false;
         if(!this.isLeft)
         {
            if(!this.isAttacking())
            {
               if(!this.isInSky())
               {
                  if(!this.isWaiting())
                  {
                     this.setAction("wait");
                  }
               }
            }
            if(!this.isCanMoveWhenAttack())
            {
               this.speed.x = 0;
            }
         }
         else
         {
            this.bbdc.turnLeft();
         }
      }
      
      protected function stopMove() : void
      {
         if(this.isLeft)
         {
            this.stopMoveL();
         }
         else if(this.isRight)
         {
            this.stopMoveR();
         }
         if(!this.isWaiting())
         {
            this.setAction("wait");
         }
      }
      
      protected function addBeAttackEffect(param1:BaseObject) : void
      {
      }
      
      protected function shadowEffect() : void
      {
         AUtils.shallowEffect(this);
      }
      
      protected function getBeattackBackSpeed(param1:BaseBullet, param2:Object) : Point
      {
         if(!param2)
         {
            return new Point(0,0);
         }
         var _loc3_:Point = new Point(param2.attackBackSpeed[0],param2.attackBackSpeed[1]);
         if(param1 is EnemyMoveBullet || param1 is EnemyMoveBullet1 || param1 is EnemyMoveBullet2 || param1 is S_ShapeMoveBullet || param1 is FastAndSlowBullet)
         {
            if(_loc3_.x < 0)
            {
               if(param1.speed.x < 0)
               {
                  _loc3_.x = Math.abs(_loc3_.x);
               }
               else
               {
                  _loc3_.x = -Math.abs(_loc3_.x);
               }
            }
            else if(param1.speed.x < 0)
            {
               _loc3_.x = -Math.abs(_loc3_.x);
            }
            else
            {
               _loc3_.x = Math.abs(_loc3_.x);
            }
         }
         else if(param1 is SpecialEffectBullet || param1 is FollowBaseObjectBullet)
         {
            if(param1.getImcName() == "Role2Bullet3" || param1.getImcName() == "Role1Bullet10_4")
            {
               if(_loc3_.x < 0)
               {
                  if(this.x > param1.sourceRole.x)
                  {
                     _loc3_.x = -Math.abs(_loc3_.x);
                  }
                  else
                  {
                     _loc3_.x = Math.abs(_loc3_.x);
                  }
               }
               else if(this.x > param1.sourceRole.x)
               {
                  _loc3_.x = Math.abs(_loc3_.x);
               }
               else
               {
                  _loc3_.x = -Math.abs(_loc3_.x);
               }
            }
            else if(param1.getImcName() == "Role1Bullet10_2" || param1.getImcName() == "Role4BulletArrow12_2")
            {
               if(_loc3_.x < 0)
               {
                  if(this.x > param1.sourceRole.x)
                  {
                     _loc3_.x = Math.abs(_loc3_.x);
                  }
                  else
                  {
                     _loc3_.x = -Math.abs(_loc3_.x);
                  }
               }
               else if(this.x > param1.sourceRole.x)
               {
                  _loc3_.x = -Math.abs(_loc3_.x);
               }
               else
               {
                  _loc3_.x = Math.abs(_loc3_.x);
               }
            }
            else if(_loc3_.x < 0)
            {
               if(BaseBullet(param1).getDirect() == -1)
               {
                  _loc3_.x = Math.abs(_loc3_.x);
               }
               else
               {
                  _loc3_.x = -Math.abs(_loc3_.x);
               }
            }
            else if(BaseBullet(param1).getDirect() == -1)
            {
               _loc3_.x = -Math.abs(_loc3_.x);
            }
            else
            {
               _loc3_.x = Math.abs(_loc3_.x);
            }
         }
         return _loc3_;
      }
      
      public function setAttackBack(param1:Point) : void
      {
         var _loc2_:Point = this.gc.gameSence.localToGlobal(new Point(this.x,this.y));
         var _loc3_:Point = this.gc.gameSence.globalToLocal(new Point(20,0));
         if(param1.x < 0)
         {
            this.isLeft = true;
            this.isRight = false;
            if(this is BaseMonster)
            {
               if(_loc2_.x < 20)
               {
                  this.speed.x = 0;
                  this.speed.y = param1.y;
                  return;
               }
            }
         }
         else
         {
            this.isLeft = false;
            this.isRight = true;
            if(this is BaseMonster)
            {
               if(_loc2_.x > 920)
               {
                  this.speed.x = 0;
                  this.speed.y = param1.y;
                  return;
               }
            }
         }
         this.speed.x = param1.x * 2;
         this.speed.y = param1.y;
         TweenMax.to(this.speed,0.4,{
            "x":this.speed.x * 0.2,
            "ease":Cubic.easeOut
         });
      }
      
      public function beMagicAttack(param1:BaseBullet, param2:BaseObject, param3:Boolean = false) : Boolean
      {
         return false;
      }
      
      public function getHurtByPig8(param1:int) : void
      {
      }
      
      protected function jump() : void
      {
         this.speed.y = this.jumpPower;
      }
      
      protected function getBottom() : Number
      {
         return this.colipse.height / 2 + this.y;
      }
      
      public function isCanMoveByStage() : Boolean
      {
         var _loc1_:Rectangle = this.colipse.getBounds(this.gc.gameSence.parent);
         var _loc2_:Number = _loc1_.x + this.speed.x;
         var _loc3_:Number = _loc1_.x + _loc1_.width + this.speed.x;
         return _loc2_ > 20 && _loc3_ < 920 || this.speed.x < 0 && _loc3_ > 920 || this.speed.x > 0 && _loc2_ < 20;
      }
      
      protected function getTop() : Number
      {
         return -this.colipse.height / 2 + this.y;
      }
      
      protected function getLeft() : Number
      {
         return -this.colipse.width / 2 + this.x;
      }
      
      protected function getRight() : Number
      {
         return this.colipse.width / 2 + this.x;
      }
      
      protected function getDownFloor() : void
      {
         if(!this.isAttacking() && !this.isBeAttacking())
         {
            if(this.isLeft || this.isRight)
            {
               this.iswor();
            }
            else if(!this.isWaiting())
            {
               this.setAction("wait");
            }
         }
         this.gc.protectedPerproty.setProperty(this,"jumpCount",0);
      }
      
      protected function getFallDown() : void
      {
         if(Boolean(this.standInObj) && Boolean(this.standInObj.getChildByName("isThroughWall")))
         {
            this.y += 20;
            this.setAction("jump1");
            this.gc.protectedPerproty.setProperty(this,"jumpCount",1);
         }
      }
      
      protected function isCannotMoveWhenAttackOnFloor() : Boolean
      {
         return false;
      }
      
      protected function isCannotMoveWhenAttack() : Boolean
      {
         return false;
      }
      
      public function getNextFrameBounds() : Rectangle
      {
         var _loc1_:Rectangle = this.colipse.getBounds(this.gc.gameSence);
         _loc1_.offsetPoint(this.speed);
         return _loc1_;
      }
      
      public function getNextFrameXBounds() : Rectangle
      {
         var _loc1_:Rectangle = this.colipse.getBounds(this.gc.gameSence);
         _loc1_.offset(this.speed.x,0);
         return _loc1_;
      }
      
      public function setNameTextField(param1:String, param2:TextFormat = null) : void
      {
         if(!param2)
         {
            param2 = this.nameTextField.getTextFormat();
         }
         this.nameTextField.text = param1;
         this.nameTextField.setTextFormat(param2);
      }
      
      public function releaseMagicWeapon() : void
      {
         this.curMagicWeapon = null;
      }
      
      public function getRealPower(param1:String, param2:Boolean = true) : Object
      {
         return {
            "hurt":0,
            "qixue":0
         };
      }
      
      public function setStun() : void
      {
      }
      
      public function setAction(param1:String) : void
      {
         this.curAction = param1;
         if(param1 == "dead")
         {
            if(this.bbdc.isStopFrame)
            {
               this.bbdc.continueFrame();
            }
         }
      }
      
      public function isNormalHit() : Boolean
      {
         return true;
      }
      
      public function newAttackId() : void
      {
         ++this.attackId;
      }
      
      public function getAttackId() : String
      {
         return this.name + this.attackId;
      }
      
      public function getNumAttackId() : int
      {
         return this.attackId;
      }
      
      public function isJump() : Boolean
      {
         return this.curAction == "jump1" || this.curAction == "jump2" || this.curAction == "jump3";
      }
      
      public function isInSky() : Boolean
      {
         return !this.standInObj;
      }
      
      public function isWalkOrRun() : Boolean
      {
         return true;
      }
      
      public function isAttacking() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3";
      }
      
      public function isBeAttacking() : Boolean
      {
         return this.curAction == "hurt_1" || this.curAction == "hurt_2" || this.curAction == "hurt_3" || this.curAction == "hurt" || this.curAction == "afterHurt" || this.curAction == "dead";
      }
      
      public function isWaiting() : Boolean
      {
         return this.curAction == "wait";
      }
      
      public function isStatic() : Boolean
      {
         return !this.isLeft && !this.isRight;
      }
      
      public function isDead() : Boolean
      {
         return false;
      }
      
      public function reduceHp(param1:int, param2:Boolean = false) : void
      {
      }
      
      public function setOtherAttack(param1:String, param2:uint, param3:Point, param4:Array = null, param5:uint = 0) : void
      {
      }
      
      public function setOtherBuff(param1:String, param2:Array) : void
      {
      }
      
      public function getRoleId() : uint
      {
         return 0;
      }
      
      public function setStatic() : void
      {
         this.isLeft = false;
         this.isRight = false;
         this.speed.x = 0;
      }
      
      public function setYourFather(param1:int, param2:Boolean = false) : void
      {
         this.gc.protectedPerproty.setProperty(this,"isYourFather",true);
         if(this.fatherCount <= param1)
         {
            this.fatherCount = param1;
         }
         this.istouming = param2;
      }
      
      public function setzerofather() : *
      {
         this.fatherCount = 0;
      }
      
      public function setHMZFather(param1:int, param2:Boolean = false) : void
      {
         this.gc.protectedPerproty.setProperty(this,"hmzFather",true);
         if(this.hmzfatherCount <= param1)
         {
            this.hmzfatherCount = param1;
         }
         this.istouming = param2;
      }
      
      public function setzerohmzfather() : *
      {
         this.hmzfatherCount = 0;
      }
      
      public function setLYSFather(param1:int, param2:Boolean = false) : void
      {
         this.gc.protectedPerproty.setProperty(this,"lysFather",true);
         if(this.lysfatherCount <= param1)
         {
            this.lysfatherCount = param1;
         }
         this.istouming = param2;
      }
      
      public function setzerolysfather() : *
      {
         this.lysfatherCount = 0;
      }
      
      public function isYourFather() : Boolean
      {
         return this.gc.protectedPerproty.getProperty(this,"isYourFather");
      }
      
      public function setLostGraity() : void
      {
         this.graity = 0;
      }
      
      public function getBBDC() : BaseBitmapDataClip
      {
         return this.bbdc;
      }
      
      public function resetGraity() : void
      {
         if(!this.isFly)
         {
            if(!this.isGXP)
            {
               this.graity = 1.5;
            }
            else
            {
               this.graity = 1.5;
            }
         }
      }
      
      public function setHue(param1:int) : void
      {
         var _loc2_:* = null;
         var _loc3_:* = null;
         if(this.bbdc)
         {
            _loc2_ = new ColorAdjust();
            _loc2_.adjustHue(param1);
            _loc3_ = new ColorMatrixFilter(_loc2_);
            this.bbdc.filters = [_loc3_];
         }
      }
      
      public function iswor() : *
      {
         if(!this.isRunning())
         {
            this.setAction("walk");
         }
         else
         {
            this.setAction("run");
         }
      }
      
      public function gettwoobjangle(param1:BaseObject, param2:BaseObject, param3:int) : Number
      {
         var _loc4_:* = undefined;
         var _loc5_:Number = Number(NaN);
         var _loc6_:Number = Number((_loc4_ = AUtils.GetNextPointByTwoObj(param1,param2)).y) / Number(_loc4_.x);
         var _loc7_:int = Number(_loc4_.x) / Math.abs(_loc4_.x);
         if(param3 == 0)
         {
            if(_loc7_ > 0)
            {
               _loc5_ = 180 - Math.atan(_loc6_) / Math.PI * 180 * -_loc7_;
            }
            else
            {
               _loc5_ = Math.atan(_loc6_) / Math.PI * 180 * -_loc7_;
            }
         }
         else if(_loc7_ > 0)
         {
            _loc5_ = Math.atan(_loc6_) / Math.PI * 180 * _loc7_;
         }
         else
         {
            _loc5_ = 180 - Math.atan(_loc6_) / Math.PI * 180 * _loc7_;
         }
         return _loc5_;
      }
   }
}

