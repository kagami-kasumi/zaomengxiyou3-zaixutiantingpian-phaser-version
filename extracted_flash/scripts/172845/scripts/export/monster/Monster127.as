package export.monster
{
   import base.*;
   import com.greensock.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   
   public class Monster127 extends BaseMonster
   {
      
      public function Monster127()
      {
         super();
         this.horizenSpeed = 6;
         this.setHp(1650000);
         this.setSHp(1650000);
         this.protectedParamsObject.def = 1243;
         this.protectedParamsObject.exp = 500;
         this.protectedParamsObject.gxp = 250;
         this.protectedParamsObject.mDef = 0.45;
         this.protectedParamsObject.Dodge = 10;
         this.protectedParamsObject.Toughness = 10;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":800,
            "power":4359,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[0,0],
            "attackInterval":999,
            "power":4359,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[0,0],
            "attackInterval":999,
            "power":3369,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[0,0],
            "attackInterval":999,
            "power":3400,
            "attackKind":"magic"
         };
         this.attackRange = 200;
         this.alertRange = 1000;
         this.isBoss = true;
         this.monsterName = "罗宣";
         this.setAction("wait");
         this.skillCD1 = [gc.frameClips * 2,gc.frameClips * 5];
         this.skillCD2 = [gc.frameClips * 3,gc.frameClips * 6];
         this.skillCD3 = [gc.frameClips * 4,gc.frameClips * 6];
         this.skillCD4 = [gc.frameClips * 2.5,gc.frameClips * 5.4];
         this.protectedParamsObject.probability = 0.36;
         this.fallList = [{
            "name":"wpzty",
            "bigtype":"dj"
         }];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster127");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],250,250,new Point(0,0));
            bbdc.setOffsetXY(5,-20);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8],[2,2,2,2,10],[2,1,2,1,10],[2,2,2,2,2,10],[34],[2,2,10]]);
            bbdc.setFrameCount([6,4,1,5,5,6,1,3]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster127--BitmapData Error!");
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
            case "hit4":
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
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 200;
      }
      
      override protected function beforeSkill2Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 800;
      }
      
      override protected function beforeSkill3Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 500;
      }
      
      override protected function releSkill1() : void
      {
         this.newAttackId();
         this.setYourFather(10);
         this.setAction("hit2");
         this.lastHit = "hit2";
      }
      
      override protected function releSkill2() : void
      {
         this.newAttackId();
         this.setYourFather(40);
         this.setAction("hit3");
         this.lastHit = "hit3";
      }
      
      override protected function releSkill3() : void
      {
         this.newAttackId();
         this.setYourFather(10);
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
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     this.doHi1(_loc3_);
                  }
               }
               break;
            case "hit2":
               if(param1.x == 2)
               {
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     this.doHi2_1(_loc3_);
                     this.doHi2_2(_loc3_,2);
                  }
                  break;
               }
               if(param1.x == 3)
               {
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     this.doHi2_2(_loc3_,1);
                  }
                  break;
               }
               if(param1.x == 4)
               {
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     this.doHi2_2(_loc3_,0);
                  }
                  break;
               }
               if(param1.x == 5)
               {
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     this.doHi2_1(_loc3_);
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
               if(param1.x == 2)
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
         var _loc2_:EnemyMoveBullet = new EnemyMoveBullet("Monster127Bullet1");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 100;
            _loc2_.setSpeed(-10);
         }
         else
         {
            _loc2_.x = this.x + 100;
            _loc2_.setSpeed(10);
         }
         _loc2_.setDistance(600);
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.y = this.y;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHi2_1(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster127Bullet2_1");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 150;
         }
         else
         {
            _loc2_.x = this.x + 150;
         }
         _loc2_.y = this.y - 80;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit2");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHi2_2(param1:uint, param2:uint) : void
      {
         var _loc3_:uint = uint((param2 - 1) * 30);
         var _loc4_:EnemyMoveBullet = new EnemyMoveBullet("Monster127Bullet2_2");
         if(param1 == 0)
         {
            _loc4_.x = this.x - 250 - _loc3_;
            _loc4_.setSpeed(-10);
         }
         else
         {
            _loc4_.x = this.x + 250 + _loc3_;
            _loc4_.setSpeed(10);
         }
         _loc4_.y = this.y - 90;
         _loc4_.setDestroyWhenLastFrame(false);
         _loc4_.setRole(this);
         _loc4_.setDistance(600);
         _loc4_.setDirect(param1);
         _loc4_.setAction("hit2");
         gc.gameSence.addChild(_loc4_);
         this.magicBulletArray.push(_loc4_);
      }
      
      private function doHi3(param1:uint) : void
      {
         var flag:Boolean = false;
         var direct:uint = param1;
         var b:SpecialEffectBullet = new SpecialEffectBullet("Monster127Bullet3");
         if(direct == 0)
         {
            b.x = this.x - 150;
         }
         else
         {
            b.x = this.x + 150;
         }
         b.y = this.y;
         b.setRole(this);
         b.setDirect(direct);
         b.setDisable();
         b.setAction("hit3");
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
         for each(bh in gc.getPlayerArray())
         {
            if(!bh.isYourFather())
            {
               flag = false;
               if(this.x > bh.x)
               {
                  if(this.bbdc.getDirect() == 0 && bh.getBBDC().getDirect() == 1)
                  {
                     flag = true;
                  }
               }
               else if(this.x < bh.x)
               {
                  if(this.bbdc.getDirect() == 1 && bh.getBBDC().getDirect() == 0)
                  {
                     flag = true;
                  }
               }
               if(flag)
               {
                  TweenMax.to(bh,1,{
                     "x":b.x,
                     "y":b.y - 20,
                     "onComplete":function(param1:BaseHero):*
                     {
                        param1.addCurAddEffect([{
                           "name":BaseAddEffect.STUN,
                           "time":gc.frameClips * 2
                        }]);
                     },
                     "onCompleteParams":[bh]
                  });
               }
            }
         }
      }
      
      private function doHi4(param1:uint) : void
      {
         var _loc2_:* = null;
         var _loc3_:* = 0;
         _loc3_ = uint(0);
         while(_loc3_ < 7)
         {
            _loc2_ = new SpecialEffectBullet("Monster127Bullet4");
            _loc2_.x = this.x + (3 - _loc3_) * 150;
            _loc2_.y = this.y + 30;
            _loc2_.setRole(this);
            _loc2_.setDirect(param1);
            _loc2_.setAction("hit4");
            gc.gameSence.addChild(_loc2_);
            this.magicBulletArray.push(_loc2_);
            _loc3_++;
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

