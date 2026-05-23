package export.monster
{
   import base.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   import flash.utils.*;
   
   public class Monster1000 extends BaseMonster
   {
      
      public function Monster1000()
      {
         super();
         this.horizenSpeed = 5;
         this.setHp(450000);
         this.setSHp(450000);
         this.normalAttackRate = 0.5;
         this.protectedParamsObject.mysee = 300;
         this.protectedParamsObject.isattback = 50;
         this.protectedParamsObject.def = 680;
         this.protectedParamsObject.exp = 200;
         this.protectedParamsObject.gxp = 200;
         this.protectedParamsObject.mDef = 0.35;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":999,
            "power":1682,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":12,
            "power":1518 * 0.3,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":999,
            "power":1518,
            "attackKind":"magic"
         };
         this.attackRange = 250;
         this.alertRange = 1000;
         this.skillCD = [gc.frameClips * 2,gc.frameClips * 5];
         this.isBoss = true;
         this.monsterName = "白骨精";
         this.setAction("wait");
         this.skillCD1 = [gc.frameClips * 2,gc.frameClips * 6.4];
         this.skillCD2 = [gc.frameClips * 3,gc.frameClips * 7.2];
         this.skillCD3 = [gc.frameClips * 4,gc.frameClips * 8.1];
         this.skillCD4 = [gc.frameClips * 2.5,gc.frameClips * 6.4];
         this.protectedParamsObject.probability = 0.5;
         this.fallList = [{
            "name":"ywyd",
            "bigtype":"zb"
         }];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster1000");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],250,250,new Point(0,0));
            bbdc.setOffsetXY(0,-30);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[15],[1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1],[2,2,2,2,10],[2,2,2,10],[2,2,2,10]]);
            bbdc.setFrameCount([6,4,1,9,9,5,4,4]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster1000--BitmapData Error!");
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
         var _loc3_:* = param1;
         switch(_loc3_)
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
               if(_loc2_.y != 5)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(5);
               }
               this.bbdc.setState(param1);
               break;
            case "hit2":
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
         var _loc3_:* = _loc2_;
         switch(_loc3_)
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
         var _loc4_:* = _loc2_;
         switch(_loc4_)
         {
            case "hit1":
               if(param1.x == 4)
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
               if(param1.x == 3)
               {
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     this.doHi3(_loc3_);
                  }
               }
         }
      }
      
      private function doHi1(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster1000Bullet1");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 85;
         }
         else
         {
            _loc2_.x = this.x + 85;
         }
         _loc2_.y = this.y - 10;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHi2(param1:uint) : void
      {
         this.doSingleHit2(param1,4,0);
      }
      
      private function doSingleHit2(param1:int, param2:int, param3:int) : void
      {
         var direct:int = 0;
         var count:int = 0;
         var index:int = 0;
         direct = 0;
         count = 0;
         index = 0;
         var b:SpecialEffectBullet = null;
         direct = param1;
         count = param2;
         index = param3;
         if(count > 0)
         {
            b = new SpecialEffectBullet("Monster1000Bullet2");
            if(direct == 0)
            {
               b.x = this.x - 65 - index * 80;
            }
            else
            {
               b.x = this.x + 65 + index * 80;
            }
            b.y = this.y - 10;
            b.setRole(this);
            b.setDirect(direct);
            b.setAction("hit2");
            gc.gameSence.addChild(b);
            this.magicBulletArray.push(b);
            count = Number(count) - 1;
            index = Number(index) + 1;
            setTimeout(function(param1:Monster1000):*
            {
               if(!param1.isDead())
               {
                  param1.doSingleHit2(direct,count,index);
               }
            },5 * 60,this);
         }
      }
      
      private function doHi3(param1:uint) : void
      {
         var _loc2_:* = undefined;
         var _loc3_:Boolean = false;
         var _loc4_:* = gc.getPlayerArray();
         for each(_loc2_ in gc.getPlayerArray())
         {
            _loc3_ = false;
            if(_loc2_.x > this.x)
            {
               if(_loc2_.getBBDC().getDirect() == 0 && this.getBBDC().getDirect() == 1)
               {
                  _loc3_ = true;
               }
            }
            else if(_loc2_.getBBDC().getDirect() == 1 && this.getBBDC().getDirect() == 0)
            {
               _loc3_ = true;
            }
            if(_loc3_)
            {
               if(!_loc2_.isDead() && !_loc2_.isYourFather())
               {
                  _loc2_.addCurAddEffect([{
                     "name":BaseAddEffect.EYEFIX,
                     "time":gc.frameClips * 3
                  }]);
               }
            }
         }
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 5 * 60;
      }
      
      override protected function beforeSkill2Start() : Boolean
      {
         return this.curAttackTarget;
      }
      
      override protected function releSkill1() : void
      {
         this.faceToTarget();
         this.newAttackId();
         this.setAction("hit2");
         this.lastHit = "hit2";
      }
      
      override protected function releSkill2() : void
      {
         this.faceToTarget();
         this.newAttackId();
         this.setAction("hit3");
         this.lastHit = "hit3";
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
         super.destroy();
      }
   }
}

