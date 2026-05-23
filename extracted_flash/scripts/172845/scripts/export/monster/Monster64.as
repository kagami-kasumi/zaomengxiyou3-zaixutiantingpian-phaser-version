package export.monster
{
   import base.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   
   public class Monster64 extends BaseMonster
   {
      
      public function Monster64()
      {
         super();
         this.horizenSpeed = 7;
         this.setHp(815848);
         this.setSHp(815848);
         this.normalAttackRate = 0.4;
         this.attackRange = 5 * 60;
         this.alertRange = 1000;
         this.protectedParamsObject.def = 975;
         this.protectedParamsObject.exp = 1000;
         this.protectedParamsObject.gxp = 500;
         this.protectedParamsObject.mDef = 0.4;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":1,
            "attackBackSpeed":[0,0],
            "attackInterval":999,
            "power":2109,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[0,0],
            "attackInterval":999,
            "power":2109,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[0,0],
            "attackInterval":999,
            "power":1947,
            "attackKind":"magic"
         };
         this.isBoss = true;
         this.monsterName = "太白金星";
         this.setAction("wait");
         this.protectedParamsObject.probability = 0.6;
         this.fallList = [{
            "name":"sxzhs",
            "bigtype":"dj"
         }];
         this.skillCD1 = [gc.frameClips * 2,gc.frameClips * 6];
         this.skillCD2 = [gc.frameClips * 1,gc.frameClips * 7];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster64");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],5 * 60,5 * 60,new Point(0,0));
            bbdc.setOffsetXY(-10,-30);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[15],[2,2,2,2,2,10],[2,2,2,10],[2,2,2,10],[2,2,20]]);
            bbdc.setFrameCount([6,1,6,4,4,3]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster64--BitmapData Error!");
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
            case "dead":
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
               if(param1.x == 3)
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
                  if(this.bbdc.getCurFrameCount() == 20)
                  {
                     this.doHi3(_loc3_);
                  }
               }
         }
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this,this.curAttackTarget) <= 400;
      }
      
      override protected function beforeSkill2Start() : Boolean
      {
         return true;
      }
      
      override protected function releSkill1() : void
      {
         this.newAttackId();
         this.setYourFather(10);
         this.setAction("hit2");
         this.lastHit = "hit2";
         this.faceToTarget();
      }
      
      override protected function releSkill2() : void
      {
         this.newAttackId();
         this.setYourFather(30);
         this.setAction("hit3");
         this.lastHit = "hit3";
         this.faceToTarget();
      }
      
      private function doHi1(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster64Bullet1");
         if(this.bbdc.getDirect() == 0)
         {
            _loc2_.x = this.x - 95;
         }
         else
         {
            _loc2_.x = this.x + 95;
         }
         _loc2_.y = this.y - 40;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHi2(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster64Bullet2");
         if(this.bbdc.getDirect() == 0)
         {
            _loc2_.x = this.x - 120;
         }
         else
         {
            _loc2_.x = this.x + 2 * 60;
         }
         _loc2_.y = this.y - 15;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit2");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHi3(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster64Bullet3");
         _loc2_.x = this.x;
         _loc2_.y = 0;
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
         var _loc1_:* = null;
         var _loc2_:Boolean = false;
         var _loc3_:* = null;
         var _loc4_:* = null;
         var _loc5_:* = null;
         if(!this.isBeAttacking())
         {
            super.myIntelligence();
         }
         if(this.y > 1000)
         {
            for each(_loc1_ in gc.getPlayerArray())
            {
               this.y = 5 * 60;
               this.x = _loc1_.x;
            }
         }
         if(!this.isAttacking() && !this.isBeAttacking())
         {
            _loc2_ = false;
            _loc4_ = gc.getPlayerArray();
            for each(_loc1_ in _loc4_)
            {
               for each(_loc5_ in _loc1_.magicBulletArray)
               {
                  if(Math.abs(Number(_loc5_.x) - this.x) <= 100)
                  {
                     _loc2_ = true;
                     _loc3_ = _loc1_;
                     break;
                  }
               }
            }
            if(Math.random() <= 0.4)
            {
               if(_loc2_ && Boolean(_loc3_))
               {
                  if(Math.random() <= 0.5)
                  {
                     this.x = Number(_loc3_.x) - 100;
                     if(this.standInObj)
                     {
                        this.y -= 40;
                        this.speed.y = 0;
                     }
                     this.turnRight();
                  }
                  else
                  {
                     this.x = _loc3_.x + 100;
                     if(this.standInObj)
                     {
                        this.y -= 40;
                        this.speed.y = 0;
                     }
                     this.turnLeft();
                  }
               }
            }
         }
      }
      
      override public function destroy() : void
      {
         var _loc1_:* = null;
         var _loc2_:int = 0;
         var _loc3_:* = null;
         super.destroy();
         if(this.getHp() <= 0)
         {
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

