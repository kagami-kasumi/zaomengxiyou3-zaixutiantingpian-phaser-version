package export.monster
{
   import base.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   import manager.*;
   
   public class Monster1007 extends BaseMonster
   {
      
      public function Monster1007()
      {
         super();
         this.skillCD = [100,100];
         this.horizenSpeed = 6;
         this.setHp(626903);
         this.setSHp(626903);
         this.normalAttackRate = 0.6;
         this.protectedParamsObject.mysee = 5 * 60;
         this.protectedParamsObject.isattback = 50;
         this.attackRange = 250;
         this.alertRange = 1000;
         this.protectedParamsObject.def = 887;
         this.protectedParamsObject.mDef = 0.4;
         this.protectedParamsObject.exp = 0;
         this.protectedParamsObject.gxp = 0;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[4,-2],
            "attackInterval":12,
            "power":1810 * 0.32,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[2,-2],
            "attackInterval":999,
            "power":1810,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[10,-2],
            "attackInterval":8,
            "power":1810 * 0.26,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[4,-2],
            "attackInterval":18,
            "power":1810 * 0.24,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit5_1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[2,-2],
            "attackInterval":3,
            "power":1810 * 0.1,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit5_2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[20,-20],
            "attackInterval":3000,
            "power":1810,
            "attackKind":"magic"
         };
         this.isBoss = true;
         this.monsterName = "六耳猕猴";
         this.setAction("wait");
         this.protectedParamsObject.probability = 0.9;
         this.fallList = [{
            "name":"zsTimerup1",
            "bigtype":"dj"
         }];
         this.skillCD1 = [gc.frameClips * 2,gc.frameClips * 9.8];
         this.skillCD2 = [gc.frameClips * 3,gc.frameClips * 11.8];
         this.skillCD3 = [gc.frameClips * 4,gc.frameClips * 12.6];
         this.skillCD4 = [gc.frameClips * 2.5,gc.frameClips * 13.5];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster1007");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],400,250,new Point(0,0));
            bbdc.setOffsetXY(40,-30);
            bbdc.setFrameStopCount([[4,4,4,4],[2,2,2,3,2,4],[15],[2,3,7,2,3,6,2,7,2,2,2,2,2,2,4,2,9],[1,5,11],[2,2,2,2,2,2,2,2],[3,11,2,12],[6,3,2,32],[2,15],[1,2,6]]);
            bbdc.setFrameCount([4,6,1,17,3,8,4,4,2,3]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster1007--BitmapData Error!");
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
               if(_loc2_.y != 2)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(2);
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
            case "hit5_1":
               if(_loc2_.y != 7)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(7);
               }
               this.bbdc.setState(param1);
               break;
            case "hit5_2":
               if(_loc2_.y != 8)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(8);
               }
               this.bbdc.setState(param1);
               break;
            case "dead":
               if(_loc2_.y != 9)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(9);
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
               this.getBBDC().show();
               this.setStatic();
               this.setAction("wait");
               break;
            case "hit3":
               this.setAction("wait");
               break;
            case "hit4":
               this.setAction("wait");
               break;
            case "hit5_1":
               this.getBBDC().show();
               this.setAction("hit5_2");
               break;
            case "hit5_2":
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
               if(param1.x == 0)
               {
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     this.doHit1(_loc3_);
                  }
                  break;
               }
               if(param1.x == 2)
               {
                  if(this.bbdc.getCurFrameCount() == 7)
                  {
                     SoundManager.play("Role1_hit1AndHit2");
                  }
                  break;
               }
               if(param1.x == 5)
               {
                  if(this.bbdc.getCurFrameCount() == 6)
                  {
                     SoundManager.play("Role1_hit1AndHit2");
                  }
                  break;
               }
               if(param1.x == 8)
               {
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     SoundManager.play("Role1_hit3AndHit4");
                  }
                  break;
               }
               if(param1.x == 15)
               {
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     SoundManager.play("Role1_hit5");
                  }
               }
               break;
            case "hit2":
               if(param1.x == 2)
               {
                  if(this.bbdc.getCurFrameCount() == 11)
                  {
                     this.doHit2(_loc3_);
                  }
               }
               break;
            case "hit3":
               if(param1.x == 0)
               {
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     this.doHit3(_loc3_);
                  }
               }
               break;
            case "hit4":
               if(param1.x == 0)
               {
                  if(this.bbdc.getCurFrameCount() == 3)
                  {
                     this.doHit4(_loc3_);
                  }
                  break;
               }
               if(param1.x == 2)
               {
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     this.addCurAddEffect([{
                        "name":BaseAddEffect.LEMHXX,
                        "time":gc.frameClips * 10
                     }]);
                  }
               }
               break;
            case "hit5_1":
               if(param1.x == 3)
               {
                  if(this.bbdc.getCurFrameCount() == 31)
                  {
                     this.doHit5_1(_loc3_);
                     if(this.getBBDC().getDirect() == 0)
                     {
                        this.speed.x = -6.5;
                        break;
                     }
                     this.speed.x = 6.5;
                  }
               }
               break;
            case "hit5_2":
               if(param1.x == 1)
               {
                  if(this.bbdc.getCurFrameCount() == 15)
                  {
                     this.doHit5_2(_loc3_);
                  }
               }
         }
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
      
      override protected function releSkill3() : void
      {
         this.faceToTarget();
         this.newAttackId();
         this.setAction("hit4");
         this.lastHit = "hit4";
      }
      
      override protected function releSkill4() : void
      {
         this.faceToTarget();
         this.newAttackId();
         this.setAction("hit5_1");
         this.lastHit = "hit5_1";
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) > 200;
      }
      
      override protected function beforeSkill2Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 200;
      }
      
      override protected function beforeSkill3Start() : Boolean
      {
         if(this.curAddEffect)
         {
            if(this.curAddEffect.curDebuff(BaseAddEffect.LEMHXX))
            {
               return false;
            }
         }
         return this.curAttackTarget;
      }
      
      override protected function beforeSkill4Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 300;
      }
      
      private function doHit1(param1:uint) : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster1007Bullet1");
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
         SoundManager.play("Role1_hit9");
         this.getBBDC().hide();
         this.setYourFather(12);
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster1007Bullet2");
         _loc2_.x = this.x;
         _loc2_.y = this.getFootBottom();
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit2");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
         if(this.getBBDC().getDirect() == 0)
         {
            this.speed.x = -40;
         }
         else
         {
            this.speed.x = 40;
         }
      }
      
      private function doHit3(param1:uint) : void
      {
         SoundManager.play("Role1_hit8");
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster1007Bullet3");
         _loc2_.x = this.x;
         _loc2_.y = this.getFootBottom();
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit3");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHit4(param1:uint) : void
      {
         SoundManager.play("Role1_hit12_1");
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster1007Bullet4");
         _loc2_.x = this.x;
         _loc2_.y = this.getFootBottom();
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setDisable();
         _loc2_.setAction("hit4");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHit5_1(param1:uint) : void
      {
         this.getBBDC().hide();
         SoundManager.play("Role1_hit10_2");
         this.setYourFather(48);
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster1007Bullet5_1");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 100;
         }
         else
         {
            _loc2_.x = this.x + 100;
         }
         _loc2_.y = this.getFootBottom() - 100;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit5_1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHit5_2(param1:uint) : void
      {
         SoundManager.play("Role1_hit10_4");
         this.setYourFather(12);
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster1007Bullet5_2");
         _loc2_.x = this.x;
         _loc2_.y = this.getFootBottom();
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit5_2");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      override protected function exitFrameFunc(param1:Point) : void
      {
      }
      
      override public function isCanMoveWhenAttack() : Boolean
      {
         return this.curAction == "hit2" || this.curAction == "hit5_1";
      }
      
      override public function isAttacking() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3" || this.curAction == "hit4" || this.curAction == "hit5_1" || this.curAction == "hit5_2";
      }
      
      override public function reduceHp(param1:int, param2:Boolean = false) : void
      {
         if(this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3" || this.curAction == "hit4" || this.curAction == "hit5_1" || this.curAction == "hit5_2")
         {
            param2 = false;
         }
         super.reduceHp(param1,param2);
      }
      
      override public function setAttackBack(param1:Point) : void
      {
         if(!(this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3" || this.curAction == "hit4" || this.curAction == "hit5_1" || this.curAction == "hit5_2"))
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

