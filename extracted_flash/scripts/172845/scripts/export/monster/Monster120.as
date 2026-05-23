package export.monster
{
   import base.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   import my.*;
   
   public class Monster120 extends BaseMonster
   {
      
      public function Monster120()
      {
         super();
         this.horizenSpeed = 5;
         this.setHp(1600000);
         this.setSHp(1600000);
         this.attackRange = 250;
         this.alertRange = 1000;
         this.protectedParamsObject.Dodge = 1;
         this.protectedParamsObject.Toughness = 0;
         this.protectedParamsObject.mDef = 0.42;
         this.protectedParamsObject.def = 1195;
         this.protectedParamsObject.exp = 3000;
         this.protectedParamsObject.gxp = 100;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":1500,
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
            "attackInterval":999,
            "power":2042,
            "attackKind":"physics",
            "addEffect":[{
               "name":BaseAddEffect.MONSTER120DEBUFF,
               "time":gc.frameClips * 3
            }]
         };
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":24,
            "power":1875 * 0.66,
            "attackKind":"magic"
         };
         this.isBoss = true;
         this.monsterName = "狻猊圣者";
         this.setAction("wait");
         this.skillCD1 = [gc.frameClips * 2,gc.frameClips * 7];
         this.skillCD2 = [gc.frameClips * 3,gc.frameClips * 6];
         this.skillCD3 = [gc.frameClips * 4,gc.frameClips * 20];
         this.skillCD4 = [gc.frameClips * 2.5,gc.frameClips * 6];
         this.protectedParamsObject.probability = 0.27;
         this.fallList = [{
            "name":"zltc",
            "bigtype":"zb"
         }];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster120");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],300,300,new Point(0,0));
            bbdc.setOffsetXY(-10,-35);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8],[2,2,2,2,10],[2,2,2,10],[60],[2,20],[2,2,2,10]]);
            bbdc.setFrameCount([6,4,1,5,4,1,2,4]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster120--BitmapData Error!");
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
         return true;
      }
      
      override protected function beforeSkill2Start() : Boolean
      {
         return true;
      }
      
      override protected function beforeSkill3Start() : Boolean
      {
         return true;
      }
      
      override protected function releSkill1() : void
      {
         this.newAttackId();
         this.setYourFather(60);
         this.setAction("hit2");
         this.lastHit = "hit2";
      }
      
      override protected function releSkill2() : void
      {
         this.newAttackId();
         this.setYourFather(24);
         this.setAction("hit3");
         this.lastHit = "hit3";
      }
      
      override protected function releSkill3() : void
      {
         this.newAttackId();
         this.setYourFather(15);
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
               if(param1.x == 3)
               {
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     this.doHi1(_loc3_);
                  }
               }
               break;
            case "hit2":
               if(param1.x == 0)
               {
                  if(this.bbdc.getCurFrameCount() == 60)
                  {
                     this.doHi2_1(_loc3_);
                     break;
                  }
                  if(this.bbdc.getCurFrameCount() == 35)
                  {
                     this.doHi2_2(_loc3_);
                  }
               }
               break;
            case "hit3":
               if(param1.x == 1)
               {
                  if(this.bbdc.getCurFrameCount() == 20)
                  {
                     this.doHi3(_loc3_);
                  }
               }
               break;
            case "hit4":
               if(param1.x == 3)
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
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster120Bullet1");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 75;
         }
         else
         {
            _loc2_.x = this.x + 75;
         }
         _loc2_.y = this.y - 20;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHi2_1(param1:uint) : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster120Bullet2_1");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 0;
         }
         else
         {
            _loc2_.x = this.x + 0;
         }
         _loc2_.y = this.y - 130;
         _loc2_.setDisable();
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit2");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHi2_2(param1:uint) : void
      {
         var _loc2_:* = 0;
         var _loc3_:* = null;
         var _loc4_:Point = gc.gameSence.globalToLocal(new Point(0,0));
         var _loc5_:uint = 2 + Math.random() * 5;
         _loc2_ = uint(0);
         while(_loc2_ < _loc5_)
         {
            if(gc.pWorld.monsterArray.length < 7)
            {
               _loc3_ = new FollowBaseObjectBullet("Monster120Bullet2_2");
               _loc3_.x = 100 + _loc4_.x + Math.random() * 700;
               _loc3_.y = 400;
               _loc3_.setDisable();
               _loc3_.setFuncWhenDestroy(this.callMonster119);
               _loc3_.setRole(this);
               _loc3_.setDirect(param1);
               _loc3_.setAction("hit2");
               gc.gameSence.addChild(_loc3_);
               this.magicBulletArray.push(_loc3_);
            }
            _loc2_++;
         }
      }
      
      private function doHi3(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster120Bullet3");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 0;
         }
         else
         {
            _loc2_.x = this.x + 0;
         }
         _loc2_.y = this.y - 0;
         _loc2_.setRole(this);
         _loc2_.setFuncWhenEnterFrame(this.hit3Enterframe);
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setDestroyInCount(gc.frameClips * 10);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit3");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function hit3Enterframe(param1:BaseBullet) : void
      {
         var _loc2_:* = undefined;
         for each(_loc2_ in gc.pWorld.monsterArray)
         {
            if(!_loc2_.isDead() && Boolean(_loc2_.curAddEffect))
            {
               if(!_loc2_.curAddEffect.getBuffByName(BaseAddEffect.MONSTER120DEBUFF))
               {
                  if(param1.hitTestObject(_loc2_))
                  {
                     _loc2_.addCurAddEffect([{
                        "name":BaseAddEffect.MONSTER120DEBUFF,
                        "time":gc.frameClips * 10
                     }]);
                  }
               }
            }
         }
      }
      
      private function doHi4(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster120Bullet4");
         _loc2_.x = this.x;
         _loc2_.setFuncWhenEnterFrame(this.hit4Enterframe);
         _loc2_.y = 350;
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setDestroyInCount(gc.frameClips * 12);
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit4");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function hit4Enterframe(param1:BaseBullet) : void
      {
         var _loc2_:* = undefined;
         if(this.curAttackTarget)
         {
            if(param1.x > this.curAttackTarget.x)
            {
               param1.x -= 5;
            }
            else
            {
               param1.x += 5;
            }
         }
         for each(_loc2_ in gc.pWorld.monsterArray)
         {
            if(!_loc2_.isDead() && _loc2_ is Monster119)
            {
               if(!(_loc2_ as Monster119).isDoneHit3())
               {
                  if(HitTest.complexHitTestObject(_loc2_,param1))
                  {
                     (_loc2_ as Monster119).doHit3();
                  }
               }
            }
         }
      }
      
      private function callMonster119(param1:BaseBullet) : void
      {
         MainGame.getInstance().createMonster(119,param1.x,param1.y);
      }
      
      override protected function exitFrameFunc(param1:Point) : void
      {
      }
      
      override public function isAttacking() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3" || this.curAction == "hit4";
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

