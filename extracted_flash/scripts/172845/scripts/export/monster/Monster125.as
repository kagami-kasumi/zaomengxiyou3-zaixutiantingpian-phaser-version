package export.monster
{
   import base.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   
   public class Monster125 extends BaseMonster
   {
      
      public function Monster125()
      {
         super();
         this.horizenSpeed = 5;
         this.protectedParamsObject.Dodge = 10;
         this.protectedParamsObject.Toughness = 0;
         this.setHp(1700000);
         this.setSHp(1700000);
         this.attackRange = 250;
         this.alertRange = 1000;
         this.protectedParamsObject.mDef = 0.42;
         this.protectedParamsObject.def = 1195;
         this.protectedParamsObject.exp = 4000;
         this.protectedParamsObject.gxp = 100;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":999,
            "power":2042,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":999,
            "power":2042,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":24,
            "power":1875 * 0.7,
            "attackKind":"magic"
         };
         this.isBoss = true;
         this.monsterName = "狴犴圣者";
         this.setAction("wait");
         this.skillCD1 = [gc.frameClips * 2,gc.frameClips * 5];
         this.skillCD2 = [gc.frameClips * 3,gc.frameClips * 10];
         this.skillCD3 = [gc.frameClips * 4,gc.frameClips * 5];
         this.skillCD4 = [gc.frameClips * 2.5,gc.frameClips * 4.5];
         this.protectedParamsObject.probability = 0.4;
         this.fallList = [{
            "name":"wpbp",
            "bigtype":"dj"
         }];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster125");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],350,350,new Point(0,0));
            bbdc.setOffsetXY(-10,-55);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8],[2,2,2,2,10],[2,2,2,10],[2,2,5,2,2],[2,2,2,2,10],[2,2,10]]);
            bbdc.setFrameCount([6,4,1,5,4,5,5,3]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster125--BitmapData Error!");
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
            case "hit2_1":
               if(_loc2_.y != 5)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(5);
               }
               this.bbdc.setState(param1);
               break;
            case "hit2_2":
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
         var _loc2_:* = null;
         var _loc3_:* = null;
         var _loc4_:String = this.bbdc.getState();
         switch(_loc4_)
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
            case "hit2_1":
               this.speed.y = 0;
               this.setStatic();
               _loc2_ = gc.getPlayerArray();
               if(_loc2_.length > 0)
               {
                  _loc3_ = _loc2_[0] as BaseHero;
                  if(Math.random() < 0.5)
                  {
                     this.x = Number(_loc3_.x) - 40;
                  }
                  else
                  {
                     this.x = _loc3_.x + 40;
                  }
                  this.curAttackTarget = _loc3_;
                  this.faceToTarget();
               }
               this.setAction("hit2_2");
               break;
            case "hit2_2":
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
      
      override protected function beforeSkill1Start() : Boolean
      {
         return true;
      }
      
      override protected function beforeSkill2Start() : Boolean
      {
         return true;
      }
      
      override protected function releSkill1() : void
      {
         this.newAttackId();
         this.setYourFather(48);
         this.setAction("hit2_1");
         this.lastHit = "hit2_1";
      }
      
      override protected function releSkill2() : void
      {
         this.newAttackId();
         this.setYourFather(24);
         this.setAction("hit3");
         this.lastHit = "hit3";
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
            case "hit2_1":
               if(param1.x == 0)
               {
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     this.doHi2_1(_loc3_);
                  }
                  break;
               }
               if(param1.x == 3 || param1.x == 4)
               {
                  if(_loc3_ == 0)
                  {
                     this.speed.x = -10;
                  }
                  else
                  {
                     this.speed.x = 10;
                  }
                  this.speed.y = -10;
               }
               break;
            case "hit2_2":
               if(param1.x < 3)
               {
                  if(!this.standInObj)
                  {
                     if(_loc3_ == 0)
                     {
                        this.speed.x = -10;
                     }
                     else
                     {
                        this.speed.x = 10;
                     }
                     this.speed.y = 10;
                  }
               }
               if(param1.x == 3)
               {
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     this.doHi2_2(_loc3_);
                  }
               }
               break;
            case "hit3":
               if(param1.x == 2)
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
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster125Bullet1");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 160;
         }
         else
         {
            _loc2_.x = this.x + 160;
         }
         _loc2_.y = this.y - 60;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHi2_1(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster125Bullet2_1");
         if(param1 == 0)
         {
            _loc2_.x = this.x;
         }
         else
         {
            _loc2_.x = this.x;
         }
         _loc2_.y = this.y + 40;
         _loc2_.setRole(this);
         _loc2_.setDisable();
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit2");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHi2_2(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster125Bullet2_2");
         if(param1 == 0)
         {
            _loc2_.x = this.x;
         }
         else
         {
            _loc2_.x = this.x;
         }
         _loc2_.y = this.y + 40;
         _loc2_.setRole(this);
         _loc2_.setDisable();
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit2");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
         var _loc3_:NetBullet = new NetBullet("Monster125Bullet2_net");
         if(param1 == 0)
         {
            _loc3_.x = this.x;
         }
         else
         {
            _loc3_.x = this.x;
         }
         _loc3_.y = this.y - 10;
         _loc3_.setRole(this);
         _loc3_.setDestroyWhenLastFrame(false);
         _loc3_.setDestroyInCount(gc.frameClips * 10);
         _loc3_.setDisable();
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit2");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHi3(param1:uint) : void
      {
         var _loc2_:* = 0;
         var _loc3_:* = null;
         var _loc4_:Number = Number(NaN);
         var _loc5_:Number = Number(NaN);
         var _loc6_:int = Math.ceil(Math.random() * 5);
         _loc2_ = uint(0);
         while(_loc2_ < _loc6_)
         {
            _loc4_ = 10 + Math.random() * 5;
            _loc5_ = 10 + Math.random() * 5;
            if(Math.random() < 0.5)
            {
               _loc5_ *= -1;
            }
            if(param1 == 0)
            {
               _loc3_ = new BounceBullet("Monster125Bullet3_1",new Point(-_loc4_,_loc5_));
               _loc3_.x = this.x - 100;
            }
            else
            {
               _loc3_ = new BounceBullet("Monster125Bullet3_1",new Point(_loc4_,_loc5_));
               _loc3_.x = this.x + 100;
            }
            _loc3_.y = this.y;
            _loc3_.setRole(this);
            _loc3_.setDestroyInCount(gc.frameClips * 15);
            _loc3_.setDestroyWhenLastFrame(false);
            _loc3_.setAction("hit3");
            gc.gameSence.addChild(_loc3_);
            this.magicBulletArray.push(_loc3_);
            _loc2_++;
         }
      }
      
      override protected function exitFrameFunc(param1:Point) : void
      {
      }
      
      override public function isCanMoveWhenAttack() : Boolean
      {
         return this.curAction == "hit2_1" || this.curAction == "hit2_2";
      }
      
      override public function isAttacking() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2_1" || this.curAction == "hit2_2" || this.curAction == "hit3";
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

