package export.monster
{
   import base.*;
   import com.greensock.*;
   import export.bullet.*;
   import export.level.*;
   import export.level.StageListener223Children.*;
   import flash.display.*;
   import flash.geom.*;
   
   public class Monster139 extends BaseMonster
   {
      
      private var monster139kuilei:Monster139KuiLei;
      
      public function Monster139()
      {
         super();
         this.normalAttackRate = 0.8;
         this.horizenSpeed = 4;
         this.setHp(3510000);
         this.setSHp(3510000);
         this.attackRange = 400;
         this.alertRange = 2500;
         this.protectedParamsObject.def = 2054;
         this.protectedParamsObject.exp = 2000;
         this.protectedParamsObject.gxp = 500;
         this.protectedParamsObject.mDef = 0.45;
         this.protectedParamsObject.Toughness = 15;
         this.protectedParamsObject.Dodge = 10;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":999,
            "power":7586,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[3,0],
            "attackInterval":10,
            "power":7238 * 0.4,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[3,0],
            "attackInterval":24,
            "power":7586 * 0.8,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[3,0],
            "attackInterval":999,
            "power":7586,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit5"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[3,0],
            "attackInterval":999,
            "power":7238,
            "attackKind":"magic"
         };
         this.isBoss = true;
         this.monsterName = "云霄";
         this.setAction("wait");
         this.isFly = true;
         this.graity = 0;
         this.protectedParamsObject.probability = 0.2;
         this.fallList = [{
            "name":"kly3",
            "bigtype":"dj"
         },{
            "name":"bxhyzzs",
            "bigtype":"dj"
         }];
         this.skillCD1 = [gc.frameClips * 2,gc.frameClips * 8.2];
         this.skillCD2 = [gc.frameClips * 3,gc.frameClips * 8.2];
         this.skillCD3 = [gc.frameClips * 4,gc.frameClips * 9.1];
         this.skillCD4 = [gc.frameClips * 2.5,gc.frameClips * 8];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:Object = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster139");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],300,300,new Point(0,0));
            bbdc.setOffsetXY(0,-55);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[8],[2,2,2,2,10],[2,2,2,10],[2,2,10],[2,2,10],[2,10],[2,2,36,10]]);
            bbdc.setFrameCount([6,1,5,4,3,3,2,4]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster139--BitmapData Error!");
      }
      
      override protected function newColipse() : void
      {
         this.colipse = AUtils.getNewObj("ObjectBaseSprite2") as Sprite;
         this.colipse.visible = false;
         this.addChild(this.colipse);
      }
      
      override public function setAction(param1:String) : void
      {
         super.setAction(param1);
         var _loc2_:Point = this.bbdc.getCurPoint();
         switch(param1)
         {
            case "wait":
               if(_loc2_.y != 0)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(0);
               }
               this.bbdc.setState(param1);
               break;
            case "walk":
               if(_loc2_.y != 0)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(0);
               }
               this.bbdc.setState(param1);
               break;
            case "hurt":
               if(_loc2_.y != 1)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(1);
               }
               this.bbdc.setState(param1);
               break;
            case "hit1":
               if(_loc2_.y != 3)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(3);
               }
               this.bbdc.setState(param1);
               break;
            case "hit2":
               if(_loc2_.y != 4)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(param1);
               break;
            case "hit3":
               if(_loc2_.y != 5)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(5);
               }
               this.bbdc.setState(param1);
               break;
            case "hit4":
               if(_loc2_.y != 6)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(6);
               }
               this.bbdc.setState(param1);
               break;
            case "hit5":
               if(_loc2_.y != 7)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(7);
               }
               this.bbdc.setState(param1);
               break;
            case "dead":
               this.setStatic();
               if(_loc2_.y != 2)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(2);
               }
               this.bbdc.setState(param1);
         }
      }
      
      override protected function scriptFrameOverFunc(param1:int) : void
      {
         var _loc2_:String = this.bbdc.getState();
         switch(_loc2_)
         {
            case "walk":
               this.bbdc.setFramePointX(0);
               break;
            case "wait":
               this.bbdc.setFramePointX(0);
               break;
            case "hit1":
               this.setAction("wait");
               break;
            case "hit2":
               this.setAction("wait");
               break;
            case "hit3":
               this.setAction("wait");
               break;
            case "hit4":
               this.setAction("wait");
               break;
            case "hit5":
               this.setAction("wait");
               break;
            case "hurt":
               this.setStatic();
               this.setAction("wait");
               break;
            case "dead":
               this.dropAura();
               this.destroy();
         }
      }
      
      override protected function enterFrameFunc(param1:Point) : void
      {
         var _loc2_:String = this.bbdc.getState();
         var _loc3_:uint = uint(this.getBBDC().getDirect());
         switch(_loc2_)
         {
            case "hit1":
               if(param1.x == 3)
               {
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     this.doHi1(_loc3_);
                  }
               }
               break;
            case "hit2":
               if(param1.x == 2)
               {
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     this.doHi2(_loc3_);
                  }
               }
               break;
            case "hit3":
               if(param1.x == 2)
               {
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     this.doHi3(_loc3_);
                  }
               }
               break;
            case "hit4":
               if(param1.x == 1)
               {
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     this.doHi4(_loc3_);
                  }
               }
               break;
            case "hit5":
               if(param1.x == 0)
               {
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     this.doHi5_1(_loc3_);
                  }
               }
         }
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 450;
      }
      
      override protected function beforeSkill2Start() : Boolean
      {
         return this.getHp() / this.getSHp() <= 0.7 && !this.monster139kuilei;
      }
      
      override protected function beforeSkill3Start() : Boolean
      {
         return this.getHp() / this.getSHp() <= 0.4;
      }
      
      override protected function beforeSkill4Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && this.getHp() / this.getSHp() <= 0.2 && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 800;
      }
      
      override protected function releSkill1() : void
      {
         this.newAttackId();
         this.setYourFather(20);
         this.setAction("hit2");
         this.lastHit = "hit2";
      }
      
      override protected function releSkill2() : void
      {
         this.newAttackId();
         this.setYourFather(24);
         this.setAction("hit3");
         this.lastHit = "hit3";
      }
      
      override protected function releSkill3() : void
      {
         this.newAttackId();
         this.setYourFather(20);
         this.setAction("hit4");
         this.lastHit = "hit4";
      }
      
      override protected function releSkill4() : void
      {
         this.newAttackId();
         this.setYourFather(40);
         this.setAction("hit5");
         this.lastHit = "hit5";
      }
      
      private function doHi1(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster139Bullet1_1");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 150;
         }
         else
         {
            _loc2_.x = this.x + 150;
         }
         _loc2_.y = this.y - 180;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
         _loc2_ = new SpecialEffectBullet("Monster139Bullet1_2");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 330;
         }
         else
         {
            _loc2_.x = this.x + 330;
         }
         _loc2_.y = this.y - 130;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHi2(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = null;
         _loc2_ = new SpecialEffectBullet("Monster139Bullet2");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 190;
         }
         else
         {
            _loc2_.x = this.x + 190;
         }
         _loc2_.y = this.y - 340;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit2");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHi3(param1:uint) : void
      {
         var _loc2_:BaseHero = gc.getRandomPlayer();
         if(_loc2_)
         {
            this.monster139kuilei = new Monster139KuiLei(_loc2_,this);
            this.monster139kuilei.x = this.x;
            this.monster139kuilei.y = this.y;
            gc.gameSence.addChild(this.monster139kuilei);
         }
      }
      
      private function selectHitTarget(param1:BaseObject = null) : BaseObject
      {
         var _loc2_:BaseHero = null;
         var _loc3_:int = 0;
         var _loc4_:Array = [];
         if(this.monster139kuilei)
         {
            _loc4_.push(this.monster139kuilei);
         }
         for each(_loc2_ in gc.getPlayerArray())
         {
            _loc4_.push(_loc2_);
            if(_loc2_.getPet())
            {
               _loc4_.push(_loc2_.getPet());
            }
         }
         if(_loc4_.length > 0)
         {
            if(param1)
            {
               _loc3_ = int(_loc4_.indexOf(param1));
               if(_loc3_ != -1)
               {
                  _loc4_.splice(_loc3_,1);
               }
            }
            if(_loc4_.length > 0)
            {
               return _loc4_[int(Math.random() * _loc4_.length)];
            }
            return null;
         }
         return null;
      }
      
      private function doHi4(param1:uint) : void
      {
         var _loc2_:Monster139TantantanBullet = null;
         var _loc3_:BaseObject = this.selectHitTarget();
         if(_loc3_)
         {
            _loc2_ = new Monster139TantantanBullet("Monster139Bullet4");
            _loc2_.x = this.x;
            _loc2_.y = this.y;
            _loc2_.setSpeed(6,6);
            _loc2_.setDistance(99999);
            _loc2_.setDestroyWhenLastFrame(false);
            _loc2_.setDestroyInCount(gc.frameClips * 10);
            _loc2_.setMoveTarget(_loc3_);
            _loc2_.setRole(this);
            _loc2_.setFuncWhenHit(this.hit4Hit);
            _loc2_.setDirect(param1);
            _loc2_.setAction("hit4");
            gc.gameSence.addChild(_loc2_);
            this.magicBulletArray.push(_loc2_);
         }
      }
      
      public function hit4Hit(param1:BaseBullet) : void
      {
         var newTarget:BaseObject = null;
         var bb:BaseBullet = param1;
         TweenMax.delayedCall(1,function(param1:BaseBullet):*
         {
            param1.newAttackId();
         },[bb]);
         for each(bb in this.magicBulletArray)
         {
            if(bb is Monster139TantantanBullet)
            {
               --(bb as Monster139TantantanBullet).hitTimes;
               newTarget = this.selectHitTarget((bb as Monster139TantantanBullet).getMoveTarget());
               if(newTarget)
               {
                  (bb as Monster139TantantanBullet).setMoveTarget(newTarget);
               }
               else
               {
                  (bb as Monster139TantantanBullet).hitTimes = 0;
               }
            }
         }
      }
      
      private function doHi5_1(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = null;
         if(this.curAttackTarget)
         {
            _loc2_ = new SpecialEffectBullet("Monster139Bullet5_1");
            _loc2_.x = this.x;
            _loc2_.y = this.y;
            _loc2_.setDestroyWhenLastFrame(false);
            _loc2_.setDestroyInCount(42);
            _loc2_.setFuncWhenDestroy(this.doHi5_2);
            _loc2_.setRole(this);
            _loc2_.setDisable();
            _loc2_.setDirect(param1);
            _loc2_.setAction("hit5");
            gc.gameSence.addChild(_loc2_);
            this.magicBulletArray.push(_loc2_);
            TweenMax.to(_loc2_,0.8,{
               "x":this.curAttackTarget.x,
               "y":this.curAttackTarget.y
            });
         }
      }
      
      private function doHi5_2(param1:BaseBullet) : void
      {
         var _loc2_:SpecialEffectBullet = null;
         _loc2_ = new SpecialEffectBullet("Monster139Bullet5_2");
         _loc2_.x = param1.x;
         _loc2_.y = param1.y;
         _loc2_.setRole(this);
         _loc2_.setFuncWhenHit(this.hit5Hit);
         _loc2_.setDirect(0);
         _loc2_.setAction("hit5");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function hit5Hit(param1:BaseBullet) : void
      {
         this.cureHp(this.getSHp() / 10);
      }
      
      override protected function exitFrameFunc(param1:Point) : void
      {
      }
      
      override public function step() : void
      {
         super.step();
         if(this.monster139kuilei)
         {
            this.monster139kuilei.step();
            if(this.monster139kuilei.continueCount <= 0)
            {
               this.monster139kuilei.destroy();
               this.monster139kuilei = null;
            }
         }
      }
      
      override protected function myIntelligence() : void
      {
         if(!this.isBeAttacking())
         {
            super.myIntelligence();
         }
      }
      
      override public function beMagicAttack(param1:BaseBullet, param2:BaseObject, param3:Boolean = false) : Boolean
      {
         return Boolean(super.beMagicAttack(param1,param2,param3));
      }
      
      override protected function isCannotMoveWhenAttack() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3" || this.curAction == "hit4" || this.curAction == "hit5";
      }
      
      override public function isAttacking() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3" || this.curAction == "hit4" || this.curAction == "hit5";
      }
      
      override public function destroy() : void
      {
         super.destroy();
         if(this.monster139kuilei)
         {
            this.monster139kuilei.destroy();
            this.monster139kuilei = null;
         }
         if(gc.pWorld.getBaseLevelListener() is StageListener223)
         {
            (gc.pWorld.getBaseLevelListener() as StageListener223).addTransferDoor();
         }
      }
   }
}

