package export.monster
{
   import base.*;
   import export.bullet.*;
   import export.level.*;
   import flash.display.*;
   import flash.geom.*;
   
   public class Monster35 extends BaseMonster
   {
      
      public function Monster35()
      {
         super();
         this.normalAttackRate = 0.6;
         this.horizenSpeed = 5;
         this.setHp(119118);
         this.setSHp(119118);
         this.protectedParamsObject.mysee = 5 * 60;
         this.protectedParamsObject.isattback = 50;
         this.attackRange = 250;
         this.alertRange = 1000;
         this.protectedParamsObject.def = 178;
         this.protectedParamsObject.exp = 500;
         this.protectedParamsObject.gxp = 250;
         this.protectedParamsObject.mDef = 0.35;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":999,
            "power":1092,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit2_2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[3,0],
            "attackInterval":999,
            "power":882,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit2_3"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[3,0],
            "attackInterval":999,
            "power":882,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[15,0],
            "attackInterval":8,
            "power":294,
            "attackKind":"magic"
         };
         this.isBoss = true;
         this.monsterName = "土行孙";
         this.setAction("wait");
         this.protectedParamsObject.probability = 0.4;
         this.fallList = [{
            "name":"xltzzzs",
            "bigtype":"dj"
         },{
            "name":"xleyzzs",
            "bigtype":"dj"
         },{
            "name":"xlnyzzs",
            "bigtype":"dj"
         }];
         this.skillCD1 = [gc.frameClips * 4,gc.frameClips * 12];
         this.skillCD2 = [gc.frameClips * 1,gc.frameClips * 4];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster35");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],200,200,new Point(0,0));
            bbdc.setOffsetXY(0,-25);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[2,2,2,3,2,4],[15],[2,2,2,2,10],[2,2,2,2,10],[2,2,2,96],[9,3,2,8],[24]]);
            bbdc.setFrameCount([6,6,1,5,5,4,4,1]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster35--BitmapData Error!");
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
            case "hit2_1":
               if(_loc2_.y != 5)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(5);
               }
               this.bbdc.setState(param1);
               break;
            case "hit2_2":
               if(_loc2_.y != 6)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(6);
               }
               this.bbdc.setState(param1);
               break;
            case "hit3":
               if(_loc2_.y != 7)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(7);
               }
               this.bbdc.setState(param1);
               break;
            case "dead":
               this.setStatic();
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
            case "hit2_1":
               this.setYourFather(48);
               this.setAction("hit2_2");
               break;
            case "hit2_2":
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
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     this.doHit1_1(_loc3_);
                  }
                  break;
               }
               if(param1.x == 4)
               {
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     this.doHit1_2(_loc3_);
                  }
               }
               break;
            case "hit2_1":
               if(param1.x == 0)
               {
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     this.doHit2_1(_loc3_);
                  }
                  break;
               }
               if(param1.x == 3)
               {
                  if(this.bbdc.getCurFrameCount() == 96)
                  {
                     this.doHit2_2(_loc3_);
                  }
                  this.setStatic();
               }
               break;
            case "hit2_2":
               if(param1.x == 0)
               {
                  if(this.bbdc.getCurFrameCount() == 9)
                  {
                     this.x = this.curAttackTarget.x;
                     this.doHit2_1(_loc3_);
                     this.doHit2_3(_loc3_);
                  }
               }
               break;
            case "hit3":
               if(param1.x == 0)
               {
                  if(this.bbdc.getCurFrameCount() == 24)
                  {
                     this.doHit3(_loc3_);
                  }
                  if(_loc3_ == 0)
                  {
                     this.speed.x = -15;
                     break;
                  }
                  this.speed.x = 15;
               }
         }
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 10 * 60;
      }
      
      override protected function beforeSkill2Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 400;
      }
      
      override protected function releSkill1() : void
      {
         this.newAttackId();
         this.faceToTarget();
         this.setYourFather(110);
         this.setAction("hit2_1");
         this.lastHit = "hit2_1";
      }
      
      override protected function releSkill2() : void
      {
         this.newAttackId();
         this.faceToTarget();
         this.setYourFather(35);
         this.setAction("hit3");
         this.lastHit = "hit3";
      }
      
      private function doHit1_1(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster35Bullet1_1");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 155;
         }
         else
         {
            _loc2_.x = this.x + 155;
         }
         _loc2_.y = this.y - 140;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHit1_2(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster35Bullet1_2");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 135;
         }
         else
         {
            _loc2_.x = this.x + 135;
         }
         _loc2_.y = this.y - 75;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHit2_1(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster35Bullet2_1");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 65;
         }
         else
         {
            _loc2_.x = this.x + 65;
         }
         _loc2_.y = this.y + 15;
         _loc2_.setRole(this);
         _loc2_.setDisable();
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit2_1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHit2_2(param1:uint) : void
      {
         var _loc2_:* = null;
         var _loc3_:* = null;
         var _loc4_:* = 0;
         for each(_loc2_ in this.magicBulletArray)
         {
            if(_loc2_.getImcName() == "Monster35Bullet2_1")
            {
               _loc4_ = uint(gc.gameSence.getChildIndex(_loc2_));
            }
         }
         if(_loc4_ > 0)
         {
            _loc3_ = new SpecialEffectBullet("Monster35Bullet2_2");
            if(param1 == 0)
            {
               _loc3_.x = this.x - 90;
            }
            else
            {
               _loc3_.x = this.x + 90;
            }
            _loc3_.y = this.y - 180;
            _loc3_.setRole(this);
            _loc3_.setDirect(param1);
            _loc3_.setAction("hit2_2");
            gc.gameSence.addChildAt(_loc3_,_loc4_);
            this.magicBulletArray.push(_loc3_);
         }
      }
      
      private function doHit2_3(param1:uint) : void
      {
         var _loc2_:* = null;
         var _loc3_:* = null;
         var _loc4_:* = 0;
         for each(_loc2_ in this.magicBulletArray)
         {
            if(_loc2_.getImcName() == "Monster35Bullet2_1")
            {
               _loc4_ = uint(gc.gameSence.getChildIndex(_loc2_));
            }
         }
         if(_loc4_ > 0)
         {
            _loc3_ = new SpecialEffectBullet("Monster35Bullet2_3");
            if(param1 == 0)
            {
               _loc3_.x = this.x - 80;
            }
            else
            {
               _loc3_.x = this.x + 80;
            }
            _loc3_.y = this.y - 160;
            _loc3_.setRole(this);
            _loc3_.setDirect(param1);
            _loc3_.setAction("hit2_3");
            gc.gameSence.addChildAt(_loc3_,_loc4_);
            this.magicBulletArray.push(_loc3_);
         }
      }
      
      private function doHit3(param1:uint) : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster35Bullet3");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 120;
         }
         else
         {
            _loc2_.x = this.x + 2 * 60;
         }
         _loc2_.y = this.y - 90;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit3");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
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
      
      override public function isCanMoveWhenAttack() : Boolean
      {
         return this.curAction == "hit3";
      }
      
      override public function isAttacking() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2_1" || this.curAction == "hit2_2" || this.curAction == "hit3";
      }
      
      override public function destroy() : void
      {
         var _loc1_:* = null;
         var _loc2_:int = 0;
         var _loc3_:* = null;
         super.destroy();
         if(this.getHp() <= 0)
         {
            if(gc.pWorld.getBaseLevelListener() is StageListener81)
            {
               StageListener81(gc.pWorld.getBaseLevelListener()).showJwealSprite();
            }
            if(this.isBoss)
            {
               _loc1_ = gc.pWorld.getTransferDoorArray();
               _loc2_ = 0;
               while(_loc2_ < _loc1_.length)
               {
                  _loc3_ = _loc1_[_loc2_];
                  _loc3_.visible = true;
                  _loc2_++;
               }
            }
         }
      }
   }
}

