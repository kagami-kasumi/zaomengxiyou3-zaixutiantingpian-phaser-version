package export.monster
{
   import base.*;
   import com.greensock.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   
   public class Monster54 extends BaseMonster
   {
      
      private const HIT4TIMESCOUNT:uint = 3;
      
      private var hit4Times:uint = 3;
      
      public function Monster54()
      {
         super();
         this.normalAttackRate = 0.6;
         this.horizenSpeed = 5;
         this.setHp(566842);
         this.setSHp(566842);
         this.attackRange = 5 * 60;
         this.alertRange = 1000;
         this.protectedParamsObject.def = 680;
         this.protectedParamsObject.exp = 1000;
         this.protectedParamsObject.gxp = 500;
         this.protectedParamsObject.mDef = 0.35;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-6,-5],
            "attackInterval":999,
            "power":1682,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[0,0],
            "attackInterval":999,
            "power":1518,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-25,0],
            "attackInterval":999,
            "power":1682,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[10,0],
            "attackInterval":8,
            "power":425,
            "attackKind":"magic"
         };
         this.isBoss = true;
         this.monsterName = "金角大王";
         this.setAction("wait");
         this.protectedParamsObject.probability = 0.4;
         this.fallList = [{
            "name":"qljzzs",
            "bigtype":"dj"
         },{
            "name":"plpzzs",
            "bigtype":"dj"
         },{
            "name":"ylkzzs",
            "bigtype":"dj"
         },{
            "name":"jljzzs",
            "bigtype":"dj"
         },{
            "name":"clpzzs",
            "bigtype":"dj"
         }];
         this.skillCD1 = [gc.frameClips * 2,gc.frameClips * 7];
         this.skillCD2 = [gc.frameClips * 3,gc.frameClips * 10];
         this.skillCD3 = [gc.frameClips * 1,gc.frameClips * 13];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster54");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],350,350,new Point(0,0));
            bbdc.setOffsetXY(0,-40);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[15],[2,2,2,2,10],[2,2,9,2,2,10],[24],[12,12,12],[2,4,2,4,2,5]]);
            bbdc.setFrameCount([6,4,1,5,6,1,[1,1,1],6]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster54--BitmapData Error!");
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
               this.setYourFather(10);
               if(_loc2_.y != 5)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(5);
               }
               this.bbdc.setState(param1);
               break;
            case "hit3_1":
               this.setYourFather(24);
               if(_loc2_.y != 6 || _loc2_.x != 0)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(6);
               }
               this.bbdc.setState(param1);
               break;
            case "hit3_2":
               this.setYourFather(24);
               if(_loc2_.y != 6 || _loc2_.x != 1)
               {
                  this.bbdc.setFramePointX(1);
                  this.bbdc.setFramePointY(6);
               }
               this.bbdc.setState(param1);
               break;
            case "hit4_1":
               if(_loc2_.y != 6 || _loc2_.x != 2)
               {
                  this.bbdc.setFramePointX(2);
                  this.bbdc.setFramePointY(6);
               }
               this.bbdc.setState(param1);
               break;
            case "hit4_2":
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
            case "hit3_1":
               this.setAction("hit3_2");
               break;
            case "hit3_2":
               this.setAction("wait");
               break;
            case "hit4_1":
               this.setAction("hit4_2");
               break;
            case "hit4_2":
               if(this.hit4Times > 1)
               {
                  --this.hit4Times;
                  this.setAction("hit4_1");
                  break;
               }
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
                  if(this.bbdc.getCurFrameCount() == 9)
                  {
                     this.doHit1_1(_loc3_);
                  }
                  break;
               }
               if(param1.x == 5)
               {
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     this.doHit1_2(_loc3_);
                  }
               }
               break;
            case "hit2":
               if(param1.x == 0)
               {
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     this.doHit2(_loc3_);
                  }
               }
               break;
            case "hit3_1":
               if(param1.x == 0)
               {
                  this.speed.x = 0;
                  this.speed.y = -30;
               }
               break;
            case "hit3_2":
               if(param1.x == 1)
               {
                  if(this.bbdc.getCurFrameCount() == 12)
                  {
                     this.doHit3_2(_loc3_);
                  }
                  this.speed.x = 0;
                  this.speed.y = 30;
               }
               break;
            case "hit4_1":
               if(param1.x == 2)
               {
                  if(this.bbdc.getCurFrameCount() == 12)
                  {
                     this.doHit4_1(_loc3_);
                  }
               }
               break;
            case "hit4_2":
               if(this.curAttackTarget)
               {
                  if(this.x > this.curAttackTarget.x)
                  {
                     this.turnLeft();
                  }
                  else
                  {
                     this.turnRight();
                  }
               }
               if(param1.x == 1)
               {
                  if(this.bbdc.getCurFrameCount() == 4)
                  {
                     this.doHit4_2(_loc3_);
                  }
               }
               this.speed.x = 0;
               this.speed.y = 0;
         }
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         return Boolean(this.standInObj) && Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 10 * 60;
      }
      
      override protected function beforeSkill2Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 800;
      }
      
      override protected function beforeSkill3Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 400;
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
         this.setYourFather(24);
         this.setAction("hit3_1");
         this.lastHit = "hit3_1";
         this.faceToTarget();
      }
      
      override protected function releSkill3() : void
      {
         this.newAttackId();
         this.setAction("hit4_1");
         this.lastHit = "hit4_1";
         this.hit4Times = this.HIT4TIMESCOUNT;
         this.faceToTarget();
      }
      
      private function doHit1_1(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster54Bullet1_1");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 155;
         }
         else
         {
            _loc2_.x = this.x + 155;
         }
         _loc2_.y = this.y - 60;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHit1_2(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster54Bullet1_2");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 235;
         }
         else
         {
            _loc2_.x = this.x + 235;
         }
         _loc2_.y = this.y - 15;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHit2(param1:uint) : void
      {
         var _loc2_:* = null;
         var _loc3_:* = 0;
         var _loc4_:* = null;
         var _loc5_:* = null;
         if(this.standInObj)
         {
            _loc2_ = new SpecialEffectBullet("Monster54Bullet2");
            if(param1 == 0)
            {
               _loc2_.x = this.x - 100;
            }
            else
            {
               _loc2_.x = this.x + 100;
            }
            _loc2_.y = this.y - 115;
            _loc2_.setRole(this);
            _loc2_.setDirect(param1);
            _loc2_.setAction("hit2");
            _loc3_ = uint(gc.gameSence.getChildIndex(this));
            gc.gameSence.addChildAt(_loc2_,_loc3_);
            this.magicBulletArray.push(_loc2_);
            _loc4_ = new Point(0,0);
            if(this.getBBDC().getDirect() == 0)
            {
               _loc4_.x = this.x - 100;
            }
            else
            {
               _loc4_.x = this.x + 100;
            }
            _loc4_.y = this.y - 40;
            for each(_loc5_ in gc.getPlayerAndPetArray())
            {
               if(this.getBBDC().getDirect() == 0)
               {
                  if(_loc5_.x < this.x)
                  {
                     _loc5_.curAddEffect.add([{
                        "name":BaseAddEffect.MONSTER54_HOUJIAO,
                        "point":_loc4_,
                        "time":gc.frameClips * 2
                     }]);
                  }
               }
               else if(_loc5_.x > this.x)
               {
                  _loc5_.curAddEffect.add([{
                     "name":BaseAddEffect.MONSTER54_HOUJIAO,
                     "point":_loc4_,
                     "time":gc.frameClips * 2
                  }]);
               }
            }
         }
      }
      
      private function doHit3_1(param1:uint) : void
      {
      }
      
      private function doHit3_2(param1:uint) : void
      {
         if(this.curAttackTarget)
         {
            this.x = this.curAttackTarget.x;
         }
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster54Bullet3");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 100;
         }
         else
         {
            _loc2_.x = this.x + 100;
         }
         _loc2_.y = this.y;
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setDestroyInCount(12);
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit3");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHit4_1(param1:uint) : void
      {
         var _loc2_:* = null;
         var _loc3_:int = 0;
         if(this.curAttackTarget)
         {
            _loc2_ = new Point();
            _loc3_ = 0;
            if(Math.random() <= 0.5)
            {
               _loc2_.x = this.curAttackTarget.x + 100;
            }
            else
            {
               _loc2_.x = Number(this.curAttackTarget.x) - 100;
            }
            _loc2_.y = Number(this.curAttackTarget.y) - 100;
            if(this.x < _loc2_.x)
            {
               this.turnRight();
            }
            else
            {
               this.turnLeft();
            }
            TweenMax.to(this,0.2,{
               "x":_loc2_.x,
               "y":_loc2_.y
            });
         }
      }
      
      private function doHit4_2(param1:uint) : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster54Bullet4");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 50;
         }
         else
         {
            _loc2_.x = this.x + 50;
         }
         _loc2_.y = this.y - 110;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit4");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      override protected function exitFrameFunc(param1:Point) : void
      {
      }
      
      override public function reduceHp(param1:int, param2:Boolean = false) : void
      {
         if(this.curAction == "hit4_1" || this.curAction == "hit4_2")
         {
            param2 = false;
            param1 *= 0.4;
         }
         super.reduceHp(param1,param2);
      }
      
      override public function setAttackBack(param1:Point) : void
      {
         if(!(this.curAction == "hit4_1" || this.curAction == "hit4_2"))
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
      
      override public function isAttacking() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3_1" || this.curAction == "hit3_2" || this.curAction == "hit4_1" || this.curAction == "hit4_2";
      }
      
      override public function isCanMoveWhenAttack() : Boolean
      {
         return this.curAction == "hit3_1" || this.curAction == "hit3_2" || this.curAction == "hit4_1" || this.curAction == "hit4_2";
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

