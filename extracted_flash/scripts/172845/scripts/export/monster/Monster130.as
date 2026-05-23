package export.monster
{
   import base.*;
   import com.greensock.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   import my.*;
   
   public class Monster130 extends BaseMonster
   {
      
      public function Monster130()
      {
         super();
         this.normalAttackRate = 0.6;
         this.horizenSpeed = 6;
         this.setHp(1200000);
         this.setSHp(1200000);
         this.attackRange = 250;
         this.alertRange = 1000;
         this.protectedParamsObject.def = 1074;
         this.protectedParamsObject.exp = 500;
         this.protectedParamsObject.gxp = 250;
         this.protectedParamsObject.mDef = 0.4;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":800,
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
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[0,0],
            "attackInterval":999,
            "power":1947,
            "attackKind":"magic"
         };
         this.attackRange = 200;
         this.alertRange = 1000;
         this.isBoss = true;
         this.monsterName = "嫦娥";
         this.setAction("wait");
         this.skillCD1 = [gc.frameClips * 2,gc.frameClips * 6];
         this.skillCD2 = [gc.frameClips * 3,gc.frameClips * 8];
         this.skillCD3 = [gc.frameClips * 4,gc.frameClips * 7];
         this.skillCD4 = [gc.frameClips * 2.5,gc.frameClips * 6.6];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:Object = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster130");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],200,250,new Point(0,0));
            bbdc.setOffsetXY(5,-20);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[8],[2,2,2,2,10],[2,2,10],[2,10],[10],[10]]);
            bbdc.setFrameCount([6,1,5,3,2,1,1]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster130--BitmapData Error!");
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
      
      override protected function beforeSkill1Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 1000;
      }
      
      override protected function beforeSkill2Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 400;
      }
      
      override protected function beforeSkill3Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 600;
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
         this.setYourFather(20);
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
      
      override protected function enterFrameFunc(param1:Point) : void
      {
         var _loc2_:String = this.bbdc.getState();
         var _loc3_:uint = uint(this.getBBDC().getDirect());
         switch(_loc2_)
         {
            case "hit1":
               if(param1.x == 2)
               {
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     this.doHi1(_loc3_);
                  }
               }
               break;
            case "hit2":
               if(param1.x == 1)
               {
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     this.doHi2(_loc3_);
                  }
               }
               break;
            case "hit3":
               if(param1.x == 0)
               {
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     this.doHi3(_loc3_);
                  }
               }
               break;
            case "hit4":
               if(param1.x == 0)
               {
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     this.doHi4(_loc3_);
                  }
               }
         }
      }
      
      private function doHi1(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster130Bullet1");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 50;
         }
         else
         {
            _loc2_.x = this.x + 50;
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
         var _loc2_:BaseObject = null;
         var _loc3_:SpecialEffectBullet = null;
         var _loc4_:Array = gc.getPlayerAndPetArray();
         _loc2_ = _loc4_[int(Math.random() * _loc4_.length)];
         if(_loc2_)
         {
            _loc3_ = new SpecialEffectBullet("Monster130Bullet2");
            _loc3_.x = _loc2_.x;
            _loc3_.y = _loc2_.y - 30;
            _loc3_.setRole(this);
            _loc3_.setDirect(param1);
            _loc3_.setAction("hit2");
            gc.gameSence.addChild(_loc3_);
            this.magicBulletArray.push(_loc3_);
         }
      }
      
      private function doHi3(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster130Bullet3");
         _loc2_.x = this.x;
         _loc2_.y = this.y;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setDisable();
         _loc2_.setAction("hit3");
         _loc2_.setDestroyWhenLastFrame(false);
         var _loc3_:Number = 1 + Math.random() * 2;
         _loc2_.setDestroyInCount(gc.frameClips * _loc3_);
         _loc2_.setFuncWhenDestroy(this.hit3Over);
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function hit3Over(param1:BaseBullet) : void
      {
         var _loc2_:BaseObject = null;
         var _loc3_:Boolean = false;
         for each(_loc2_ in gc.getPlayerAndPetArray())
         {
            _loc3_ = false;
            if(param1.x > _loc2_.x)
            {
               if(_loc2_.getBBDC().getDirect() == 1)
               {
                  _loc3_ = true;
               }
            }
            else if(param1.x < _loc2_.x)
            {
               if(_loc2_.getBBDC().getDirect() == 0)
               {
                  _loc3_ = true;
               }
            }
            if(_loc3_)
            {
               _loc2_.addCurAddEffect([{
                  "name":BaseAddEffect.EYEFIX,
                  "time":gc.frameClips * 3
               }]);
            }
         }
      }
      
      private function doHi4(param1:uint) : void
      {
         var i:uint = 0;
         var direct:uint = param1;
         this.doSingleHit4();
         i = 1;
         while(i <= 8)
         {
            TweenMax.delayedCall(i * 2,function(param1:Monster130):*
            {
               if(!param1.isDead())
               {
                  param1.doSingleHit4();
               }
            },[this]);
            i++;
         }
      }
      
      private function doSingleHit4() : void
      {
         this.doHi2(0);
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
         var _loc1_:* = undefined;
         if(this.getHp() < 0 && Math.random() < 0.75)
         {
            MainGame.getInstance().createLikeMonster(78,this.x,this.y - 50);
         }
         super.destroy();
         if(this.isBoss)
         {
            for each(_loc1_ in gc.pWorld.getTransferDoorArray())
            {
               _loc1_.visible = true;
            }
         }
      }
   }
}

