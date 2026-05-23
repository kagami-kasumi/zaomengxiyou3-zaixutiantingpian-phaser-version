package export.monster
{
   import base.*;
   import com.greensock.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   import my.*;
   
   public class Monster1001 extends BaseMonster
   {
      
      public var intop:Boolean;
      
      public function Monster1001()
      {
         super();
         this.horizenSpeed = 5;
         this.setHp(772673);
         this.setSHp(772673);
         this.protectedParamsObject.mysee = 300;
         this.protectedParamsObject.isattback = 50;
         this.attackRange = 250;
         this.alertRange = 1000;
         this.normalAttackRate = 0.7;
         this.protectedParamsObject.def = 955;
         this.protectedParamsObject.mDef = 0.4;
         this.protectedParamsObject.exp = 200;
         this.protectedParamsObject.gxp = 200;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":24,
            "power":2300,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[2,-4],
            "attackInterval":6,
            "power":2300 * 0.22,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":6,
            "power":2300 * 0.22,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":12,
            "power":2300 * 0.3,
            "attackKind":"magic"
         };
         this.isBoss = true;
         this.monsterName = "刑天";
         this.setAction("wait");
         this.protectedParamsObject.probability = 0.6;
         this.fallList = [{
            "name":"xhmt",
            "bigtype":"zb"
         },{
            "name":"lxzhs",
            "bigtype":"dj"
         }];
         this.skillCD1 = [gc.frameClips * 2,gc.frameClips * 6.4];
         this.skillCD2 = [gc.frameClips * 3,gc.frameClips * 7.2];
         this.skillCD3 = [gc.frameClips * 4,gc.frameClips * 18];
         this.skillCD4 = [gc.frameClips * 8,gc.frameClips * 8];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster1001");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],317,348,new Point(0,0));
            bbdc.setOffsetXY(0,-40);
            bbdc.setFrameStopCount([[4,4,4,4],[2,2,2,3,2,4],[2,2,21,2,1,2,2,13],[2,13,15],[23,30],[15],[2,2,2,32],[3,21]]);
            bbdc.setFrameCount([4,6,8,3,2,1,4,2]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster1001--BitmapData Error!");
      }
      
      override protected function newColipse() : void
      {
         this.colipse = AUtils.getNewObj("ObjectBaseSprite5") as Sprite;
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
               if(_loc2_.y != 1)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(1);
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
               if(_loc2_.y != 5)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(5);
               }
               this.bbdc.setState(param1);
               break;
            case "hit1":
               if(_loc2_.y != 2)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(2);
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
            case "hit4-1":
               if(_loc2_.y != 3)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(3);
               }
               this.bbdc.setState(param1);
               break;
            case "hit4-2":
               if(_loc2_.y != 4)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(param1);
               break;
            case "dead":
               if(_loc2_.y != 5)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(5);
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
            case "hit4-1":
               this.intop = true;
               this.setAction("wait");
               break;
            case "hit4-2":
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
                  if(this.bbdc.getCurFrameCount() == 21)
                  {
                     this.doHit1(_loc3_);
                  }
               }
               break;
            case "hit2":
               if(param1.x == 3)
               {
                  if(this.bbdc.getCurFrameCount() == 32)
                  {
                     this.doHit2(_loc3_);
                  }
               }
               break;
            case "hit3":
               if(param1.x == 1)
               {
                  if(this.bbdc.getCurFrameCount() == 21)
                  {
                     this.doHit3(_loc3_);
                  }
               }
               break;
            case "hit4-1":
               this.setYourFather(9999);
               this.speed.y = -40;
               if(param1.x == 0)
               {
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     this.doHit4_1(_loc3_);
                  }
                  break;
               }
            case "hit4-2":
               if(param1.x == 1)
               {
                  if(this.bbdc.getCurFrameCount() == 30)
                  {
                     this.doHit4_2(_loc3_);
                     break;
                  }
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     this.setzerofather();
                  }
               }
         }
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) > 400;
      }
      
      override protected function beforeSkill2Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 200;
      }
      
      override protected function beforeSkill3Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) > 200;
      }
      
      override protected function releSkill1() : void
      {
         this.faceToTarget();
         this.newAttackId();
         this.setYourFather(40);
         this.setAction("hit2");
         this.lastHit = "hit2";
      }
      
      override protected function releSkill2() : void
      {
         this.faceToTarget();
         this.newAttackId();
         this.setYourFather(24);
         this.setAction("hit3");
         this.lastHit = "hit3";
      }
      
      override protected function releSkill3() : void
      {
         this.faceToTarget();
         this.newAttackId();
         this.setYourFather(24);
         this.setAction("hit4-1");
         this.lastHit = "hit4-1";
      }
      
      private function doHit1(param1:uint) : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster1001Bullet1");
         _loc2_.x = this.x;
         _loc2_.y = this.getFootBottom();
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHit2(param1:uint) : void
      {
         var _loc2_:* = null;
         var _loc3_:int = 0;
         var _loc4_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster1001Bullet2");
         if(param1 == 0)
         {
            _loc4_.x = this.x + 40;
         }
         else
         {
            _loc4_.x = this.x - 40;
         }
         _loc4_.y = this.y - 42;
         _loc4_.setDisable();
         _loc4_.setRole(this);
         _loc4_.setDirect(param1);
         _loc4_.setAction("wait");
         gc.gameSence.addChild(_loc4_);
         this.magicBulletArray.push(_loc4_);
         while(_loc3_ < gc.getPlayerArray().length)
         {
            _loc2_ = gc.getPlayerArray()[_loc3_] as BaseHero;
            TweenMax.to(_loc2_,1.6,{
               "x":_loc4_.x,
               "y":_loc4_.y
            });
            _loc3_++;
         }
      }
      
      private function doHit3(param1:uint) : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster1001Bullet3");
         _loc2_.x = this.x;
         _loc2_.y = this.y - 30;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit3");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHit4_1(param1:uint) : void
      {
         TweenMax.delayedCall(5,this.pujie);
      }
      
      private function doHit4_2(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster1001Bullet4");
         _loc2_.x = this.x;
         _loc2_.y = 350;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit4");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function pujie() : *
      {
         this.intop = false;
         this.setStatic();
         var _loc1_:SpecialEffectBullet = new SpecialEffectBullet("Monster1001Shallow");
         _loc1_.x = this.curAttackTarget.x;
         _loc1_.y = 510;
         _loc1_.setDisable();
         _loc1_.setRole(this);
         _loc1_.setAction("wait");
         gc.gameSence.addChildAt(_loc1_,gc.gameSence.getChildIndex(this));
         this.magicBulletArray.push(_loc1_);
         this.faceToTarget();
         this.newAttackId();
         this.setAction("hit4-2");
         if(this.bbdc.getDirect() == 1)
         {
            this.x = _loc1_.x - 200;
         }
         else
         {
            this.x = _loc1_.x + 200;
         }
      }
      
      override protected function move() : void
      {
         if(this.intop)
         {
            if(this.curAction != "wait")
            {
               this.setAction("wait");
            }
            this.setYourFather(9999);
            this.speed.y = 0;
         }
         super.move();
      }
      
      override public function isAttacking() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3" || this.curAction == "hit4-1" || this.curAction == "hit4-2";
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
         TweenMax.delayedCall(5,this.callNew);
      }
      
      private function callNew() : void
      {
         var _loc1_:* = null;
         var _loc2_:int = 0;
         var _loc3_:* = null;
         MainGame.getInstance().createMonster(1002,600,300);
         if(this.isBoss)
         {
            _loc1_ = gc.pWorld.getTransferDoorArray();
            _loc2_ = 0;
            while(_loc2_ < _loc1_.length)
            {
               _loc3_ = _loc1_[_loc2_];
               _loc3_.visible = false;
               _loc2_++;
            }
         }
      }
   }
}

