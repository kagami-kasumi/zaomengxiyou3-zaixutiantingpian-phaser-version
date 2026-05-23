package base
{
   import com.greensock.*;
   import config.*;
   import export.hero.*;
   import export.monster.*;
   import flash.display.*;
   import flash.geom.*;
   import my.*;
   
   public class BaseBullet extends MovieClip
   {
      
      public static var DESIDE_BY_FRAMES_LEFT:uint = 0;
      
      protected var imgMc:MovieClip;
      
      protected var imgMc1:MovieClip;
      
      public var sourceRole:BaseObject;
      
      public var sourceRoleAttackInfoObject:Object;
      
      private var _hurt:int;
      
      private var _qixue:int;
      
      private var _atk:int;
      
      public var finallHurt:int = 0;
      
      public var isCrit:Boolean = false;
      
      public var hitObject:BaseObject;
      
      public var isCanBeAttack:Boolean = false;
      
      public var isDisabled:Boolean = false;
      
      public var isReadyToDestroy:Boolean = false;
      
      public var initTimer:uint;
      
      protected var isAdd:Boolean = false;
      
      private var lastStopGameState:Boolean = false;
      
      protected var direct:int = -1;
      
      protected var funcWhenDestroy:Function = null;
      
      protected var funcWhenEnterFrame:Function = null;
      
      private var funcWhenInCount:Function = null;
      
      public var speed:Point;
      
      public var curAction:String;
      
      protected var gc:Config;
      
      protected var attackId:int;
      
      protected var maxAttackCount:int;
      
      protected var imcName:String;
      
      private var attackInterval:int;
      
      private var attackIntervalCount:int = 0;
      
      private var funcWhenHitWall:Function = null;
      
      private var funcWhenHit:Function = null;
      
      private var destroyInCount:int = -1;
      
      protected var isHurtCanCutDownEffect:Boolean = false;
      
      protected var isDestroyWhenLastFrame:Boolean = true;
      
      protected var isDestroyWhenMaxHitCountLessThenZero:Boolean = true;
      
      protected var hurtAdd:Number = 0;
      
      public var isStopInLastFrame:Boolean = false;
      
      public var isBingo:Boolean = false;
      
      public function BaseBullet(param1:String, param2:String = "")
      {
         super();
         this.imcName = param1;
         this.imgMc = AUtils.getNewObj(param1);
         if(param2 != "")
         {
            this.imgMc1 = AUtils.getNewObj(param2);
            this.addChild(this.imgMc1);
         }
         this.addChild(this.imgMc);
         this.gc = Config.getInstance();
         this.speed = new Point();
      }
      
      public function step2() : void
      {
         if(!this.gc.isStopGame)
         {
            this.step();
         }
         if(this.funcWhenEnterFrame != null)
         {
            this.funcWhenEnterFrame(this);
         }
         if(this.lastStopGameState != this.gc.isStopGame)
         {
            if(!this.lastStopGameState)
            {
               AUtils.stopAllChildren(this);
            }
            else
            {
               AUtils.startAllChildren(this);
            }
         }
         this.lastStopGameState = this.gc.isStopGame;
         if(Boolean(this.imgMc) && Boolean(this.isDestroyWhenLastFrame))
         {
            if(this.imgMc.currentFrame == this.imgMc.totalFrames)
            {
               this.imgMc.stop();
               this.destroy();
            }
         }
         if(this.sourceRole)
         {
            if(this.isHurtCanCutDownEffect)
            {
               if(this.sourceRole.curAction == "hurt")
               {
                  this.destroy();
               }
            }
         }
      }
      
      public function setcurFrameAndstop(param1:int) : void
      {
         this.Stop = true;
         this.imgMc.gotoAndStop(param1);
      }
      
      protected function step() : void
      {
         if(this.destroyInCount > 0)
         {
            --this.destroyInCount;
            if(this.destroyInCount == 0)
            {
               this.destroy();
            }
         }
         this.checkHitWall();
         if(this.isDisabled && this.imgMc1 == null)
         {
            return;
         }
         this.checkAttack();
      }
      
      public function setDestroyWhenLastFrame(param1:Boolean) : void
      {
         this.isDestroyWhenLastFrame = param1;
      }
      
      public function setHurtCanCutDownEffect(param1:Boolean) : void
      {
         this.isHurtCanCutDownEffect = param1;
      }
      
      public function setDestroyWhenMaxHitCountLessThenZero(param1:Boolean) : void
      {
         this.isDestroyWhenMaxHitCountLessThenZero = param1;
      }
      
      public function setCanBeAttack() : void
      {
         this.isCanBeAttack = true;
      }
      
      public function setFuncWhenHitWall(param1:Function) : void
      {
         this.funcWhenHitWall = param1;
      }
      
      public function setFuncWhenHit(param1:Function) : void
      {
         this.funcWhenHit = param1;
      }
      
      protected function checkHitWall() : void
      {
         var _loc1_:int = 0;
         var _loc2_:* = null;
         if(this.funcWhenHitWall != null)
         {
            _loc1_ = 0;
            while(_loc1_ < this.gc.pWorld.getWallArray().length)
            {
               _loc2_ = this.gc.pWorld.getWallArray()[_loc1_] as Wall;
               if(_loc2_.width >= 10)
               {
                  if(HitTest.complexHitTestObject(this,_loc2_))
                  {
                     this.funcWhenHitWall(this);
                     this.destroy();
                     break;
                  }
               }
               _loc1_++;
            }
         }
      }
      
      public function checkAttack() : void
      {
         var _loc1_:* = null;
         var _loc2_:* = null;
         if(!this.sourceRole)
         {
            return;
         }
         if(this.gc.difficulity == 2 && (this.sourceRole is BaseMonster || this.sourceRole is BaseHero || this.sourceRole is BasePet))
         {
            this.setBingoRate(100);
         }
         if(this.sourceRole is BaseHero || this.sourceRole is BasePet)
         {
            _loc1_ = this.gc.pWorld.monsterArray.concat(this.gc.pWorld.likeMonsterArray);
         }
         else if(!(this.sourceRole is Monster70) && !(this.sourceRole is Monster71) && !(this.sourceRole is Monster72) && !(this.sourceRole is Monster73) && !(this.sourceRole is Monster74) && !(this.sourceRole is Monster75) && !(this.sourceRole is Monster76) && !(this.sourceRole is Monster77) && !(this.sourceRole is Monster78))
         {
            _loc1_ = this.gc.getPlayerArray().concat(this.gc.pWorld.likeMonsterArray);
         }
         else
         {
            _loc1_ = this.gc.getPlayerArray();
         }
         if(this.gc.isPK)
         {
            _loc1_ = new Array(this.gc.getRivalPlayer(this.sourceRole));
         }
         if(this.gc.isInRoom())
         {
            if(this.sourceRole is BaseHero)
            {
               if(BaseHero(this.sourceRole).getPlayer())
               {
                  _loc1_ = this.gc.pWorld.getOtherHeroArray();
               }
               else
               {
                  _loc1_ = [];
               }
               _loc1_ = _loc1_.concat(this.gc.pWorld.likeMonsterArray);
            }
            else if(this.sourceRole is BasePet)
            {
               if(Boolean(BasePet(this.sourceRole).getSourceRole()) && Boolean(BasePet(this.sourceRole).getSourceRole().getPlayer()))
               {
                  _loc1_ = this.gc.pWorld.getOtherHeroArray();
               }
               else
               {
                  _loc1_ = [];
               }
               _loc1_ = _loc1_.concat(this.gc.pWorld.likeMonsterArray);
            }
         }
         if(this.attackIntervalCount == this.attackInterval)
         {
            this.newAttackId();
            this.attackIntervalCount = 0;
         }
         if(this.attackIntervalCount >= 0)
         {
            ++this.attackIntervalCount;
         }
         for(var _loc3_:int = 0; _loc3_ < _loc1_.length; _loc3_++)
         {
            _loc2_ = _loc1_[_loc3_];
            if(_loc2_)
            {
               if(_loc2_ is MonsterRole4Hit5)
               {
                  if(MonsterRole4Hit5(_loc2_).getSourceRole() != this.sourceRole)
                  {
                     continue;
                  }
               }
               if(_loc2_.beAttackIdArray.indexOf(this.getAttackId()) == -1)
               {
                  if(_loc2_.beMagicAttack(this,this.sourceRole))
                  {
                     trace(this._qixue);
                     if(!this.isDisabled || this.imgMc1 != null)
                     {
                        this.refreshSourceRoleAttackInfoObject();
                     }
                     if(this.getImcName() == "Role1Bullet13")
                     {
                        if(this.sourceRole is Monster34)
                        {
                           if(Math.random() <= 0.18)
                           {
                              Monster34(this.sourceRole).createShallow();
                           }
                        }
                     }
                     if(this.funcWhenHit != null)
                     {
                        this.funcWhenHit(this);
                     }
                     _loc2_.beAttackIdArray.push(this.getAttackId());
                     --this.maxAttackCount;
                  }
                  if(this.getImcName() == "qingyangshenjun_skill3_2")
                  {
                     if(_loc2_.beMagicAttack1(this,this.sourceRole))
                     {
                        if(this.funcWhenHit != null)
                        {
                           this.funcWhenHit();
                           this.destroy();
                        }
                     }
                  }
               }
               if(this.maxAttackCount > 0)
               {
                  if(_loc2_ is BaseHero)
                  {
                     if(BaseHero(_loc2_).getPet())
                     {
                        if(BaseHero(_loc2_).getPet().beAttackIdArray.indexOf(this.getAttackId()) == -1)
                        {
                           if(BaseHero(_loc2_).getPet().beMagicAttack(this,this.sourceRole))
                           {
                              if(this.funcWhenHit != null)
                              {
                                 this.funcWhenHit(this);
                              }
                              BaseHero(_loc2_).getPet().beAttackIdArray.push(this.getAttackId());
                              --this.maxAttackCount;
                           }
                        }
                     }
                  }
               }
            }
         }
         if(this.isDestroyWhenMaxHitCountLessThenZero)
         {
            if(this.maxAttackCount <= 0)
            {
               if(!(this.getImcName() == "Role3Bullet12_2" || this.getImcName() == "Role2Bullet1"))
               {
                  this.destroy();
               }
            }
         }
      }
      
      public function setScale(param1:Number, param2:Number) : void
      {
         var _loc3_:Matrix = this.transform.matrix;
         _loc3_.a = _loc3_.a > 0 ? Number(Math.abs(_loc3_.a) * param1) : Number(-Math.abs(_loc3_.a) * param1);
         _loc3_.d *= param2;
         this.transform.matrix = _loc3_;
      }
      
      public function setDisable() : void
      {
         this.isDisabled = true;
      }
      
      public function setUnDisable() : void
      {
         this.isDisabled = false;
         this.refreshSourceRoleAttackInfoObject();
      }
      
      public function setFuncWhenDestroy(param1:Function) : void
      {
         this.funcWhenDestroy = param1;
      }
      
      public function setFuncWhenEnterFrame(param1:Function) : void
      {
         this.funcWhenEnterFrame = param1;
      }
      
      public function destroy() : void
      {
         if(this.funcWhenDestroy != null)
         {
            this.funcWhenDestroy(this);
         }
         if(this.funcWhenEnterFrame != null)
         {
            this.funcWhenEnterFrame = null;
         }
         AUtils.stopAllChildren(this);
         this.isReadyToDestroy = true;
         this.imgMc = null;
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
         if(this.sourceRole)
         {
            this.sourceRole = null;
         }
         this.sourceRoleAttackInfoObject = null;
      }
      
      public function setRole(param1:BaseObject) : void
      {
         this.sourceRole = param1;
         this.attackId = param1.getNumAttackId();
      }
      
      public function refreshSourceRoleAttackInfoObject() : void
      {
         var _loc1_:int = 0;
         if(!this.isDisabled || this.imgMc1 != null)
         {
            this.sourceRoleAttackInfoObject = this.sourceRole.attackBackInfoDict[this.curAction];
            this._hurt = this.sourceRole.getRealPower(this.curAction).hurt;
            this._qixue = this.sourceRole.getRealPower(this.curAction).qixue;
            if(this.sourceRole is BasePet)
            {
               this._atk = this.sourceRole.petInfo.getAtk() * 2.8;
            }
            else
            {
               this._atk = this.sourceRole.getRealPower(this.curAction).atk;
            }
            if(this.sourceRole is BaseHero || this.sourceRole is BasePet)
            {
               _loc1_ = int(this.sourceRole.getRealPower(this.curAction,false).hurt);
               if(this._hurt / _loc1_ >= 1.6)
               {
                  this.isCrit = true;
               }
               else
               {
                  this.isCrit = false;
               }
            }
         }
      }
      
      public function setHurtAdd(param1:Number) : void
      {
         this.hurtAdd = param1;
      }
      
      public function setDirect(param1:int) : void
      {
         this.direct = param1 == 0 ? -1 : 1;
         AUtils.flipHorizontal(this,-Number(this.direct));
      }
      
      public function setDragonManDirect(param1:int) : void
      {
         this.direct = param1 == 0 ? -1 : 1;
         AUtils.flipHorizontal(this,this.direct);
      }
      
      public function getDirect() : int
      {
         return this.direct;
      }
      
      public function setAction(param1:String) : void
      {
         this.curAction = param1;
         var _loc2_:Object = this.sourceRole.attackBackInfoDict[this.curAction];
         if(_loc2_)
         {
            this.maxAttackCount = _loc2_.hitMaxCount;
            this.attackInterval = _loc2_.attackInterval;
         }
         this.refreshSourceRoleAttackInfoObject();
      }
      
      public function stopPlay() : void
      {
         if(this.imgMc)
         {
            this.imgMc.stop();
         }
      }
      
      public function continuePlay() : void
      {
         if(this.imgMc)
         {
            this.imgMc.play();
         }
      }
      
      public function getStickMCArray() : Array
      {
         var _loc1_:* = null;
         var _loc2_:Array = new Array();
         var _loc3_:int = int(this.imgMc.numChildren);
         var _loc4_:int = 0;
         while(_loc4_ < _loc3_)
         {
            _loc1_ = this.imgMc.getChildByName("stick" + _loc4_) as MovieClip;
            if(_loc1_)
            {
               _loc2_.push(_loc1_);
            }
            _loc4_++;
         }
         return _loc2_;
      }
      
      public function setFuncWhenInCount(param1:Function, param2:Number, param3:Number) : void
      {
         this.funcWhenInCount = param1;
         this.doFuncWhenInCount(param2,param3);
      }
      
      private function doFuncWhenInCount(param1:Number, param2:Number) : void
      {
         TweenMax.delayedCall(param2,this.delayCall1,[param1]);
      }
      
      public function delayCall1(param1:Number) : void
      {
         this.funcWhenInCount();
         TweenMax.delayedCall(param1,this.delayCall2,[param1]);
      }
      
      public function delayCall2(param1:Number) : void
      {
         this.doFuncWhenInCount(param1,0);
      }
      
      public function setDestroyInCount(param1:uint) : void
      {
         this.destroyInCount = param1;
      }
      
      public function setMaxAttackCount(param1:uint) : void
      {
         this.maxAttackCount = param1;
      }
      
      public function reduceMaxAttackCount() : void
      {
         --this.maxAttackCount;
      }
      
      public function getFrameLeft() : uint
      {
         if(this.imgMc)
         {
            return Number(this.imgMc.totalFrames) - Number(this.imgMc.currentFrame);
         }
         return 0;
      }
      
      public function getImcName() : String
      {
         return this.imcName;
      }
      
      public function getImgMc() : MovieClip
      {
         return this.imgMc;
      }
      
      public function getImgMc1() : MovieClip
      {
         return this.imgMc1;
      }
      
      public function newAttackId() : void
      {
         ++this.attackId;
      }
      
      public function getAttackId() : String
      {
         return this.name + this.attackId;
      }
      
      public function get hurt() : int
      {
         return Number(this._hurt) * (1 + this.hurtAdd);
      }
      
      public function get qixue() : int
      {
         return Number(this._qixue);
      }
      
      public function get atk() : int
      {
         return Number(this._atk);
      }
      
      public function setBingoRate(param1:Number) : void
      {
         if(Math.random() < param1)
         {
            this.isBingo = true;
         }
      }
   }
}

