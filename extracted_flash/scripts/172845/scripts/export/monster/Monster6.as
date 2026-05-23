package export.monster
{
   import base.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   
   public class Monster6 extends BaseMonster
   {
      
      public function Monster6()
      {
         super();
         this.normalAttackRate = 0.8;
         this.horizenSpeed = 5;
         if(gc.curStage == 3 && gc.curLevel == 3 || gc.curStage == 8)
         {
            this.setHp(24189);
            this.setSHp(24189);
            this.isBoss = false;
         }
         else
         {
            this.setHp(4957);
            this.setSHp(4957);
            this.isBoss = true;
         }
         this.protectedParamsObject.mysee = 5 * 60;
         this.protectedParamsObject.isattback = 50;
         this.attackRange = 250;
         this.alertRange = 1000;
         this.protectedParamsObject.def = 19;
         this.protectedParamsObject.exp = 70;
         this.protectedParamsObject.mDef = 0.25;
         this.protectedParamsObject.gxp = 35;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-4,-5],
            "attackInterval":999,
            "power":157,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit2_1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-3,0],
            "attackInterval":999,
            "power":112,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit2_2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-3,0],
            "attackInterval":4,
            "power":22,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-3,0],
            "attackInterval":12,
            "power":37,
            "attackKind":"magic"
         };
         this.monsterName = "增长天王";
         this.setAction("wait");
         this.protectedParamsObject.probability = 0.7;
         this.fallList = [{
            "name":"qybd",
            "bigtype":"zb"
         },{
            "name":"qyfp",
            "bigtype":"zb"
         },{
            "name":"chilp",
            "bigtype":"zb"
         }];
         this.skillCD1 = [gc.frameClips * 2,gc.frameClips * 8];
         this.skillCD2 = [gc.frameClips * 2,gc.frameClips * 8];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster6");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],5 * 60,400,new Point(0,0));
            bbdc.setOffsetXY(0,-55);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[15],[2,2,2,2,2,2,18],[2,2,2,9],[2,2,19,50],[2,2,2,2,7,17]]);
            bbdc.setFrameCount([6,4,1,7,4,4,6]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster6--BitmapData Error!");
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
                  if(this.bbdc.getCurFrameCount() == 9)
                  {
                     this.doHi1(_loc3_);
                  }
               }
               break;
            case "hit2":
               if(param1.x == 0)
               {
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     this.doHi2_1(_loc3_);
                  }
                  break;
               }
               if(param1.x == 3)
               {
                  if(this.bbdc.getCurFrameCount() == 30)
                  {
                     this.doHi2_2(_loc3_);
                  }
               }
               break;
            case "hit3":
               if(param1.x == 5)
               {
                  if(this.bbdc.getCurFrameCount() == 17)
                  {
                     this.doHi3(_loc3_);
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
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 400;
      }
      
      override protected function releSkill1() : void
      {
         this.newAttackId();
         this.setYourFather(35);
         this.setAction("hit2");
         this.lastHit = "hit2";
      }
      
      override protected function releSkill2() : void
      {
         this.newAttackId();
         this.setYourFather(35);
         this.setAction("hit3");
         this.lastHit = "hit3";
      }
      
      private function doHi1(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster6Bullet1");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 155;
         }
         else
         {
            _loc2_.x = this.x + 155;
         }
         _loc2_.y = this.y - 70;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHi2_1(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster6Bullet2_1");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 45;
         }
         else
         {
            _loc2_.x = this.x + 45;
         }
         _loc2_.y = this.y - 90;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit2_1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHi2_2(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = null;
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("Monster6Bullet2_2");
         _loc3_.x = this.x;
         _loc3_.y = this.y - 500;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit2_2");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
         var _loc4_:SpecialEffectBullet = new SpecialEffectBullet("Monster6Bullet2_2");
         _loc4_.x = this.x - 200;
         _loc4_.y = this.y - 500;
         _loc4_.setRole(this);
         _loc4_.setDirect(param1);
         _loc4_.setAction("hit2_2");
         gc.gameSence.addChild(_loc4_);
         this.magicBulletArray.push(_loc4_);
         _loc2_ = new SpecialEffectBullet("Monster6Bullet2_2");
         _loc2_.x = this.x + 200;
         _loc2_.y = this.y - 500;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit2_2");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHi3(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster6Bullet3");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 55;
         }
         else
         {
            _loc2_.x = this.x + 55;
         }
         _loc2_.y = this.y - 95;
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
      
      override public function destroy() : void
      {
         var _loc1_:* = null;
         var _loc2_:int = 0;
         var _loc3_:* = null;
         super.destroy();
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

