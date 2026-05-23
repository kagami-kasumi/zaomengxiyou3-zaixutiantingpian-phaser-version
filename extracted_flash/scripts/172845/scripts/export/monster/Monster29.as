package export.monster
{
   import base.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   
   public class Monster29 extends BaseMonster
   {
      
      public function Monster29()
      {
         super();
         this.horizenSpeed = 4;
         this.setHp(9999);
         this.setSHp(9999);
         this.protectedParamsObject.mysee = 5 * 60;
         this.protectedParamsObject.isattback = 50;
         this.attackRange = 200;
         this.alertRange = 1000;
         this.protectedParamsObject.def = 66;
         this.protectedParamsObject.mDef = 0.25;
         this.protectedParamsObject.exp = 115;
         this.protectedParamsObject.gxp = 50;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":999,
            "power":195,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-5,0],
            "attackInterval":999,
            "power":78,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-5,0],
            "attackInterval":15,
            "power":19,
            "attackKind":"magic",
            "addEffect":[{
               "name":BaseAddEffect.POISON,
               "time":gc.frameClips * 4,
               "power":20
            }]
         };
         this.isBoss = false;
         this.monsterName = "邪恶沙僧";
         this.setAction("wait");
         this.protectedParamsObject.probability = 0.02;
         this.fallList = [{
            "name":"wpqhs1",
            "bigtype":"dj"
         }];
         this.skillCD1 = [gc.frameClips * 10,gc.frameClips * 10];
         this.skillCD2 = [gc.frameClips * 5,gc.frameClips * 15];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster29");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],200,200,new Point(0,0));
            bbdc.setOffsetXY(0,0);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[15],[2,2,2,2,10],[2,2,10],[2,48],[2,2,25]]);
            bbdc.setFrameCount([6,4,1,5,3,2,3]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster29--BitmapData Error!");
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
         var _loc2_:* = null;
         var _loc3_:String = this.bbdc.getState();
         var _loc4_:uint = uint(this.getBBDC().getDirect());
         switch(_loc3_)
         {
            case "hit1":
               if(param1.x == 2)
               {
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     this.doHi1(_loc4_);
                  }
               }
               break;
            case "hit2":
               if(param1.x == 1)
               {
                  if(this.bbdc.getCurFrameCount() == 30)
                  {
                     this.doHi2(_loc4_);
                  }
               }
               break;
            case "hit3":
               if(this.bbdc.getCurFrameCount() == 25)
               {
                  if(param1.x == 2)
                  {
                     for each(_loc2_ in this.magicBulletArray)
                     {
                        if(_loc2_.getImcName() == "Role4Bullet7_1" || _loc2_.getImcName() == "Role4Bullet7_2")
                        {
                           _loc2_.destroy();
                        }
                     }
                     this.doHi3_1(_loc4_);
                  }
                  break;
               }
               if(this.bbdc.getCurFrameCount() == 17)
               {
                  if(param1.x == 2)
                  {
                     this.doHi3_2(_loc4_);
                  }
               }
         }
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         return this.curAttackTarget != null;
      }
      
      override protected function beforeSkill2Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 400;
      }
      
      override protected function releSkill1() : void
      {
         this.newAttackId();
         this.setYourFather(15);
         this.setAction("hit2");
         this.lastHit = "hit2";
      }
      
      override protected function releSkill2() : void
      {
         this.newAttackId();
         this.setYourFather(12);
         this.setAction("hit3");
         this.lastHit = "hit3";
      }
      
      private function doHi1(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster29Bullet1");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 125;
         }
         else
         {
            _loc2_.x = this.x + 125;
         }
         _loc2_.y = this.y - 55;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHi2(param1:uint) : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role4Bullet4");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 245;
         }
         else
         {
            _loc2_.x = this.x + 245;
         }
         _loc2_.y = this.y - 110;
         _loc2_.setRole(this);
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setDestroyInCount(gc.frameClips * 2);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit2");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHi3_1(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Role4Bullet7_1");
         if(this.bbdc.getDirect() == 0)
         {
            _loc2_.x = this.x - 155;
         }
         else
         {
            _loc2_.x = this.x + 155;
         }
         _loc2_.y = this.y - 50;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit3");
         var _loc3_:int = gc.gameSence.getChildIndex(this);
         gc.gameSence.addChildAt(_loc2_,_loc3_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHi3_2(param1:uint) : void
      {
         var _loc2_:Point = new Point();
         if(param1 == 0)
         {
            _loc2_.x = this.x - 150;
         }
         else
         {
            _loc2_.x = this.x + 150;
         }
         _loc2_.y = this.y - 70;
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("Role4Bullet7_2");
         _loc3_.x = _loc2_.x;
         _loc3_.y = _loc2_.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit3");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
         _loc3_ = new SpecialEffectBullet("Role4Bullet7_2");
         if(param1 == 0)
         {
            _loc3_.x = _loc2_.x - 40;
         }
         else
         {
            _loc3_.x = _loc2_.x + 40;
         }
         _loc3_.y = _loc2_.y - 20;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit3");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
         _loc3_ = new SpecialEffectBullet("Role4Bullet7_2");
         if(param1 == 0)
         {
            _loc3_.x = _loc2_.x + 40;
         }
         else
         {
            _loc3_.x = _loc2_.x - 40;
         }
         _loc3_.y = _loc2_.y - 10;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit3");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
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
   }
}

