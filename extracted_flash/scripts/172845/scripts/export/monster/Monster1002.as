package export.monster
{
   import base.*;
   import com.greensock.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   
   public class Monster1002 extends BaseMonster
   {
      
      public function Monster1002()
      {
         super();
         this.horizenSpeed = 5;
         this.setHp(1200212);
         this.setSHp(1200212);
         this.protectedParamsObject.mysee = 300;
         this.protectedParamsObject.isattback = 50;
         this.normalAttackRate = 0.7;
         this.attackRange = 250;
         this.alertRange = 1000;
         this.protectedParamsObject.def = 1150;
         this.protectedParamsObject.mDef = 0.4;
         this.protectedParamsObject.exp = 200;
         this.protectedParamsObject.gxp = 200;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":24,
            "power":2109,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[2,-4],
            "attackInterval":8,
            "power":1947 * 0.3,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[3,-5],
            "attackInterval":12,
            "power":1947 * 0.32,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[0,-10],
            "attackInterval":999,
            "power":1947,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[20,-10],
            "attackInterval":999,
            "power":2109,
            "attackKind":"physics",
            "addEffect":[{
               "name":BaseAddEffect.STUN,
               "time":gc.frameClips * 3.5
            }]
         };
         this.isBoss = true;
         this.monsterName = "战神刑天";
         this.setAction("wait");
         this.protectedParamsObject.probability = 0.65;
         this.fallList = [{
            "name":"bx",
            "bigtype":"dj"
         }];
         this.skillCD = [60,90];
         this.skillCD1 = [gc.frameClips * 2,gc.frameClips * 6.4];
         this.skillCD2 = [gc.frameClips * 3,gc.frameClips * 15];
         this.skillCD3 = [gc.frameClips * 4,gc.frameClips * 8.1];
         this.skillCD4 = [gc.frameClips * 2.5,gc.frameClips * 6.4];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster1002");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],560,503,new Point(0,0));
            bbdc.setOffsetXY(-10,-160);
            bbdc.setFrameStopCount([[4,4,4,4],[2,2,2,3,2,4],[2,2,2,2,2,10],[2,2,26],[15],[2,2,2,2,2,2,2,1,1,1,18],[35,2,2,4,6,4,11]]);
            bbdc.setFrameCount([4,6,6,3,1,11,7]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster1002--BitmapData Error!");
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
               if(_loc2_.y != 4)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(4);
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
               if(_loc2_.y != 3)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(3);
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
               if(_loc2_.y != 5)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(5);
               }
               this.bbdc.setState(param1);
               break;
            case "dead":
               if(_loc2_.y != 4)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(4);
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
      
      override protected function enterFrameFunc(param1:Point) : void
      {
         var _loc2_:FollowBaseObjectBullet = null;
         var _loc3_:String = this.bbdc.getState();
         var _loc4_:uint = uint(this.getBBDC().getDirect());
         switch(_loc3_)
         {
            case "hit1":
               if(param1.x == 4)
               {
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     this.doHit1(_loc4_);
                  }
               }
               break;
            case "hit2":
               if(param1.x == 2)
               {
                  if(this.bbdc.getCurFrameCount() == 24)
                  {
                     this.doHit2(_loc4_);
                  }
               }
               break;
            case "hit3":
               _loc2_ = new FollowBaseObjectBullet("Monster1002zhuangji");
               if(param1.x == 0)
               {
                  if(this.bbdc.getCurFrameCount() == 35)
                  {
                     this.doHit3(_loc4_);
                  }
                  break;
               }
               if(param1.x > 2 && param1.x < 6)
               {
                  if(param1.x == 3)
                  {
                     if(this.bbdc.getCurFrameCount() == 4)
                     {
                        _loc2_.x = this.x;
                        _loc2_.y = this.y + 50;
                        _loc2_.setRole(this);
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc2_.setDirect(1);
                        }
                        else
                        {
                           _loc2_.setDirect(0);
                        }
                        _loc2_.setAction("hit");
                        gc.gameSence.addChild(_loc2_);
                        this.magicBulletArray.push(_loc2_);
                        if(this.bbdc.getDirect() == 1)
                        {
                           this.speed.x = 60;
                           break;
                        }
                        this.speed.x = -60;
                     }
                  }
                  break;
               }
               this.setStatic();
               break;
            case "hit4":
               if(param1.x == 10)
               {
                  if(this.bbdc.getCurFrameCount() == 18)
                  {
                     this.doHit4(_loc4_);
                  }
               }
         }
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && (AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) > 400 || Boolean(this.curAttackTarget.isInSky()));
      }
      
      override protected function beforeSkill2Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 200;
      }
      
      override protected function beforeSkill3Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 350 && !this.curAttackTarget.isInSky();
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
         this.setYourFather(8);
         this.setStatic();
         this.setAction("hit3");
         this.lastHit = "hit3";
      }
      
      override protected function releSkill3() : void
      {
         this.faceToTarget();
         this.newAttackId();
         this.setYourFather(35);
         this.setAction("hit4");
         this.lastHit = "hit4";
      }
      
      private function doHit1(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster1002Bullet1");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 280;
         }
         else
         {
            _loc2_.x = this.x + 280;
         }
         _loc2_.y = this.y - 170;
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
         var _loc4_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster1002Bullet2");
         if(param1 == 0)
         {
            _loc4_.x = this.x + 20;
         }
         else
         {
            _loc4_.x = this.x - 20;
         }
         _loc4_.y = this.y;
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
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster1002Bullet3");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 80;
         }
         else
         {
            _loc2_.x = this.x + 80;
         }
         _loc2_.y = this.y - 120;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit3");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHit4(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster1002Bullet4");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 480;
         }
         else
         {
            _loc2_.x = this.x + 480;
         }
         _loc2_.y = this.y - 180;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit4");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      override public function isAttacking() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3" || this.curAction == "hit4";
      }
      
      override protected function exitFrameFunc(param1:Point) : void
      {
      }
      
      override public function reduceHp(param1:int, param2:Boolean = false) : void
      {
         if(this.curAction == "hit3")
         {
            param2 = false;
            param1 *= 0.5;
         }
         super.reduceHp(param1,param2);
      }
      
      override public function setAttackBack(param1:Point) : void
      {
         if(this.curAction != "hit3")
         {
            super.setAttackBack(param1);
         }
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

