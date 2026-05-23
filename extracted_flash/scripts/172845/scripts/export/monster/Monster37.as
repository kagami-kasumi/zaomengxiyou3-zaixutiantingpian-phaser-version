package export.monster
{
   import base.*;
   import com.greensock.*;
   import export.bullet.*;
   import export.level.*;
   import flash.display.*;
   import flash.geom.*;
   
   public class Monster37 extends BaseMonster
   {
      
      public function Monster37()
      {
         super();
         this.normalAttackRate = 0.6;
         this.horizenSpeed = 5;
         this.setHp(388258);
         this.setSHp(388258);
         this.protectedParamsObject.mysee = 5 * 60;
         this.protectedParamsObject.isattback = 50;
         this.attackRange = 250;
         this.alertRange = 1000;
         this.protectedParamsObject.def = 641;
         this.protectedParamsObject.exp = 500;
         this.protectedParamsObject.gxp = 250;
         this.protectedParamsObject.mDef = 0.35;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-6,-5],
            "attackInterval":999,
            "power":1504,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[0,0],
            "attackInterval":999,
            "power":1309,
            "attackKind":"magic",
            "addEffect":[{
               "name":BaseAddEffect.Monster37FIX,
               "time":gc.frameClips * 2
            }]
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-25,0],
            "attackInterval":999,
            "power":1309,
            "attackKind":"magic",
            "addEffect":[{
               "name":BaseAddEffect.STUN,
               "time":gc.frameClips * 2.5
            }]
         };
         this.attackBackInfoDict["hit4_1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[0,0],
            "attackInterval":999,
            "power":1504,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit4_2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[10,0],
            "attackInterval":8,
            "power":431,
            "attackKind":"magic"
         };
         this.isBoss = true;
         this.monsterName = "托塔天王";
         this.setAction("wait");
         this.protectedParamsObject.probability = 0.4;
         this.fallList = [{
            "name":"llyzzs",
            "bigtype":"dj"
         }];
         this.skillCD1 = [gc.frameClips * 2,gc.frameClips * 6];
         this.skillCD2 = [gc.frameClips * 3,gc.frameClips * 9.4];
         this.skillCD3 = [gc.frameClips * 4,gc.frameClips * 11.5];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster37");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],250,250,new Point(0,0));
            bbdc.setOffsetXY(0,-40);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[15],[2,2,2,2,10],[2,2,2,10],[2,2,10],[2,2,2,10],[2,2,2,2,2,2,15]]);
            bbdc.setFrameCount([6,4,1,5,4,3,4,7]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster37--BitmapData Error!");
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
               this.setYourFather(10);
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
            case "hit4":
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
            case "hit2":
               this.setAction("wait");
               break;
            case "hit3":
               this.setAction("wait");
               break;
            case "hit4":
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
      
      private function setPositionAfterTarget() : void
      {
         if(this.curAttackTarget)
         {
            if(this.curAttackTarget.getBBDC().getDirect() == 0)
            {
               this.x = this.curAttackTarget.x + 100;
               this.turnLeft();
            }
            else
            {
               this.x = Number(this.curAttackTarget.x) - 100;
               this.turnRight();
            }
            this.y = Number(this.curAttackTarget.y) - 60;
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
                     this.doHit1(_loc3_);
                  }
               }
               break;
            case "hit2":
               if(param1.x == 2)
               {
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     this.doHit2(_loc3_);
                  }
               }
               break;
            case "hit3":
               if(param1.x == 3)
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     this.doHit3(_loc3_);
                  }
               }
               break;
            case "hit4":
               if(param1.x == 6)
               {
                  if(this.bbdc.getCurFrameCount() == 15)
                  {
                     this.doHit4_1(_loc3_);
                     break;
                  }
                  if(this.bbdc.getCurFrameCount() == 5)
                  {
                     this.doHit4_2(_loc3_);
                  }
               }
         }
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 10 * 60;
      }
      
      override protected function beforeSkill2Start() : Boolean
      {
         var _loc1_:* = null;
         for each(_loc1_ in this.magicBulletArray)
         {
            if(_loc1_.getImcName() == "Monster36Bullet3")
            {
               return false;
            }
         }
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 400;
      }
      
      override protected function beforeSkill3Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 400 && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) > 50;
      }
      
      override protected function releSkill1() : void
      {
         this.newAttackId();
         this.faceToTarget();
         this.setYourFather(20);
         this.setAction("hit2");
         this.lastHit = "hit2";
      }
      
      override protected function releSkill2() : void
      {
         this.newAttackId();
         this.faceToTarget();
         this.setYourFather(20);
         this.setAction("hit3");
         this.lastHit = "hit3";
      }
      
      override protected function releSkill3() : void
      {
         this.newAttackId();
         this.faceToTarget();
         this.setYourFather(30);
         this.setAction("hit4");
         this.lastHit = "hit4";
      }
      
      private function doHit1(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster37Bullet1");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 140;
         }
         else
         {
            _loc2_.x = this.x + 140;
         }
         _loc2_.y = this.y - 85;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHit2(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster37Bullet2_1");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 40;
         }
         else
         {
            _loc2_.x = this.x + 40;
         }
         _loc2_.y = this.y + 30;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit2");
         var _loc3_:uint = uint(gc.gameSence.getChildIndex(this));
         gc.gameSence.addChildAt(_loc2_,_loc3_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHit3(param1:uint) : void
      {
         var direct:uint = param1;
         TweenMax.delayedCall(2,function(param1:Monster37, param2:uint):*
         {
            param1.towerFallDown(param2);
         },[this,direct]);
      }
      
      private function towerFallDown(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster37Bullet3");
         _loc2_.x = this.curAttackTarget.x;
         _loc2_.y = 510;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit3");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHit4_1(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster37Bullet4_1");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 125;
         }
         else
         {
            _loc2_.x = this.x + 125;
         }
         _loc2_.y = this.y - 35;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit4_1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHit4_2(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster37Bullet4_2");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 350;
         }
         else
         {
            _loc2_.x = this.x + 350;
         }
         _loc2_.y = this.y - 100;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit4_2");
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
      
      override public function isAttacking() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3" || this.curAction == "hit4";
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

