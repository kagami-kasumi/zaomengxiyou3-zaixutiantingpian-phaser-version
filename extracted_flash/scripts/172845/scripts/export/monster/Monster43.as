package export.monster
{
   import base.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   
   public class Monster43 extends BaseMonster
   {
      
      public function Monster43()
      {
         super();
         this.horizenSpeed = 5;
         this.setHp(254468);
         this.setSHp(254468);
         this.attackRange = 200;
         this.alertRange = 1000;
         this.protectedParamsObject.def = 975;
         this.protectedParamsObject.exp = 500;
         this.protectedParamsObject.gxp = 250;
         this.protectedParamsObject.mDef = 0.4;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[0,-5],
            "attackInterval":999,
            "power":2109,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit2_1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-5,0],
            "attackInterval":24,
            "power":973,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit2_2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-5,0],
            "attackInterval":999,
            "power":1947,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-4,0],
            "attackInterval":999,
            "power":1947,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-4,0],
            "attackInterval":999,
            "power":1947,
            "attackKind":"magic"
         };
         this.isBoss = true;
         this.monsterName = "小龙女";
         this.setAction("wait");
         this.protectedParamsObject.probability = 0.6;
         this.fallList = [{
            "name":"wplvdyl",
            "bigtype":"dj"
         }];
         this.skillCD1 = [gc.frameClips * 5,gc.frameClips * 9];
         this.skillCD2 = [gc.frameClips * 3,gc.frameClips * 7];
         this.skillCD3 = [gc.frameClips * 5.5,gc.frameClips * 9.4];
         this.skillCD4 = [gc.frameClips * 2,gc.frameClips * 3.5];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster43");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],250,250,new Point(0,0));
            bbdc.setOffsetXY(15,-35);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[15],[2,2,2,2,10],[2,2,3,2,2,10],[2,10],[2,2,2,10]]);
            bbdc.setFrameCount([6,4,1,5,6,2,4]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster43--BitmapData Error!");
      }
      
      override protected function newColipse() : void
      {
         this.colipse = AUtils.getNewObj("ObjectBaseSprite") as Sprite;
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
               if(_loc2_.y != 1)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(1);
               }
               this.bbdc.setState(param1);
               break;
            case "hurt":
               if(_loc2_.y != 2)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(2);
               }
               this.bbdc.setState(param1);
               break;
            case "hit1":
               if(_loc2_.y != 4)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(param1);
               break;
            case "hit2":
               if(_loc2_.y != 5)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(5);
               }
               this.bbdc.setState(param1);
               break;
            case "hit3":
               if(_loc2_.y != 6)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(6);
               }
               this.bbdc.setState(param1);
               break;
            case "dead":
               if(_loc2_.y != 3)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(3);
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
               this.setStatic();
               this.setAction("wait");
               break;
            case "hit3":
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
               if(param1.x == 2)
               {
                  if(this.bbdc.getCurFrameCount() == 3)
                  {
                     this.doHi1(_loc3_);
                  }
               }
               break;
            case "hit2":
               if(param1.x == 1)
               {
                  if(this.bbdc.getCurFrameCount() == 8)
                  {
                     this.doHi2(_loc3_);
                  }
               }
               break;
            case "hit3":
               if(param1.x == 3)
               {
                  if(this.bbdc.getCurFrameCount() == 8)
                  {
                     this.doHi3(_loc3_);
                  }
               }
         }
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         return this.curAttackTarget != null;
      }
      
      override protected function beforeSkill2Start() : Boolean
      {
         return Boolean(this.standInObj) && Boolean(this.curAttackTarget);
      }
      
      override protected function beforeSkill3Start() : Boolean
      {
         return true;
      }
      
      override protected function beforeSkill4Start() : Boolean
      {
         var _loc1_:* = null;
         for each(_loc1_ in this.magicBulletArray)
         {
            if(_loc1_.getImcName() == "Monster43Bullet4_1")
            {
               return true;
            }
         }
         return false;
      }
      
      override protected function releSkill1() : void
      {
         this.newAttackId();
         this.setYourFather(20);
         this.setAction("hit2");
         this.lastHit = "hit2";
         this.faceToTarget();
      }
      
      override protected function releSkill2() : void
      {
         this.newAttackId();
         this.setYourFather(20);
         this.setAction("hit3");
         this.lastHit = "hit3";
         this.faceToTarget();
      }
      
      override protected function releSkill3() : void
      {
         var _loc1_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster43Bullet4_1");
         _loc1_.x = this.x;
         _loc1_.y = this.y + 40;
         _loc1_.setRole(this);
         _loc1_.setDirect(1);
         _loc1_.setDisable();
         _loc1_.setHurtCanCutDownEffect(false);
         _loc1_.setDestroyWhenLastFrame(false);
         _loc1_.setDestroyInCount(gc.frameClips * 9);
         _loc1_.setAction("hit1");
         var _loc2_:uint = uint(gc.gameSence.getChildIndex(this));
         gc.gameSence.addChildAt(_loc1_,_loc2_);
         this.magicBulletArray.push(_loc1_);
      }
      
      override protected function releSkill4() : void
      {
         var _loc1_:* = null;
         var _loc2_:* = null;
         var _loc3_:uint = (this.getSHp() - this.getHp()) * 0.002;
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-4,0],
            "attackInterval":999,
            "power":_loc3_,
            "attackKind":"magic"
         };
         for each(_loc1_ in gc.getPlayerArray())
         {
            if(AUtils.GetDisBetweenTwoObj(_loc1_,this) <= 175)
            {
               _loc2_ = new SpecialEffectBullet("Monster43Bullet4_2");
               _loc2_.x = _loc1_.x;
               _loc2_.y = this.y + 30;
               _loc2_.setRole(this);
               _loc2_.setDirect(1);
               _loc2_.setFuncWhenHit(this.cureHpWhenHit4Hit);
               _loc2_.setAction("hit4");
               gc.gameSence.addChild(_loc2_);
               this.magicBulletArray.push(_loc2_);
            }
         }
      }
      
      private function cureHpWhenHit4Hit(param1:BaseBullet) : void
      {
         this.cureHp((this.getSHp() - this.getHp()) / 100);
      }
      
      private function doHi1(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster43Bullet1");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 140;
         }
         else
         {
            _loc2_.x = this.x + 140;
         }
         _loc2_.y = this.y;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHi2(param1:uint) : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster43Bullet2_1");
         _loc2_.x = this.x;
         _loc2_.y = this.y - 200;
         _loc2_.setRole(this);
         _loc2_.setHurtCanCutDownEffect(false);
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setDestroyInCount(gc.frameClips * 12);
         _loc2_.setFuncWhenInCount(this.doHit2_2,3,0);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit2_1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHit2_2() : void
      {
         var _loc1_:* = null;
         var _loc2_:* = null;
         var _loc3_:* = null;
         var _loc4_:* = null;
         if(!this.curAttackTarget)
         {
            return;
         }
         for each(_loc2_ in this.magicBulletArray)
         {
            if(_loc2_.getImcName() == "Monster43Bullet2_1")
            {
               _loc1_ = _loc2_;
               break;
            }
         }
         if(_loc1_)
         {
            _loc3_ = new EnemyMoveBullet("Monster43Bullet2_2");
            _loc3_.x = _loc1_.x;
            _loc3_.y = _loc1_.y;
            _loc3_.setRole(this);
            _loc4_ = AUtils.GetNextPointByTwoObj(_loc3_,this.curAttackTarget);
            _loc3_.setSpeed(Number(_loc4_.x) * 3,Number(_loc4_.y) * 3);
            _loc3_.setAddSpeed(_loc4_.x,_loc4_.y);
            _loc3_.setDistance(1000);
            _loc3_.setDestroyWhenLastFrame(false);
            _loc3_.setDirect(1);
            _loc3_.setAction("hit2_2");
            gc.gameSence.addChild(_loc3_);
            this.magicBulletArray.push(_loc3_);
         }
      }
      
      private function doHi3(param1:uint) : void
      {
         var _loc2_:* = null;
         if(Boolean(this.standInObj) && Boolean(this.curAttackTarget))
         {
            _loc2_ = new SpecialEffectBullet("Monster43Bullet3");
            _loc2_.x = this.curAttackTarget.x;
            _loc2_.y = 510;
            _loc2_.setRole(this);
            _loc2_.setDirect(param1);
            _loc2_.setAction("hit3");
            gc.gameSence.addChild(_loc2_);
            this.magicBulletArray.push(_loc2_);
         }
      }
      
      override protected function exitFrameFunc(param1:Point) : void
      {
      }
      
      override protected function myIntelligence() : void
      {
         if(!this.isBeAttacking())
         {
            super.myIntelligence();
         }
      }
      
      override public function destroy() : void
      {
         var _loc1_:* = null;
         var _loc2_:* = null;
         var _loc3_:int = 0;
         var _loc4_:* = null;
         super.destroy();
         if(this.getHp() <= 0)
         {
            _loc1_ = AUtils.getNewObj("GOGO");
            _loc1_.x = 860;
            _loc1_.y = 5 * 60;
            _loc1_.scaleX = 0.7;
            _loc1_.scaleY = 0.7;
            gc.gameInfo.addChild(_loc1_);
         }
         if(this.isBoss)
         {
            _loc2_ = gc.pWorld.getTransferDoorArray();
            _loc3_ = 0;
            while(_loc3_ < _loc2_.length)
            {
               _loc4_ = _loc2_[_loc3_];
               _loc4_.visible = true;
               _loc3_++;
            }
         }
      }
   }
}

