package export.monster
{
   import base.*;
   import com.greensock.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   
   public class Monster65 extends BaseMonster
   {
      
      public function Monster65()
      {
         super();
         this.horizenSpeed = 6;
         this.setHp(1199213);
         this.setSHp(1199213);
         this.normalAttackRate = 0.6;
         this.attackRange = 350;
         this.alertRange = 1000;
         this.protectedParamsObject.def = 975;
         this.protectedParamsObject.exp = 1000;
         this.protectedParamsObject.gxp = 500;
         this.protectedParamsObject.mDef = 0.4;
         this.attackBackInfoDict["hit1_1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[0,0],
            "attackInterval":999,
            "power":2108,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit1_2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[0,0],
            "attackInterval":999,
            "power":2108,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[0,0],
            "attackInterval":999,
            "power":1947,
            "attackKind":"magic"
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
            "power":2000,
            "attackKind":"magic",
            "addEffect":[{
               "name":BaseAddEffect.MONSTER65_AOE,
               "time":gc.frameClips * 5
            }]
         };
         this.isBoss = true;
         this.monsterName = "太上老君";
         this.setAction("wait");
         this.protectedParamsObject.probability = 0.15;
         this.fallList = [{
            "name":"zy",
            "bigtype":"zb"
         }];
         this.skillCD1 = [gc.frameClips * 2,gc.frameClips * 8];
         this.skillCD2 = [gc.frameClips * 4,gc.frameClips * 7];
         this.skillCD3 = [gc.frameClips * 0.5,gc.frameClips * 10];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster65");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],5 * 60,5 * 60,new Point(0,0));
            bbdc.setOffsetXY(-10,-30);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[15],[2,2,2,2,2,10],[2,2,10,10],[6,6],[2,2,10],[2,2,2,2,2,10]]);
            bbdc.setFrameCount([6,1,6,4,2,3,6]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster65--BitmapData Error!");
      }
      
      override protected function newColipse() : void
      {
         this.colipse = AUtils.getNewObj("ObjectBaseSprite2") as Sprite;
         this.colipse.visible = false;
         this.addChild(this.colipse);
      }
      
      override public function setAction(param1:String) : void
      {
         var _loc2_:* = null;
         if(param1 == "hit1")
         {
            for each(_loc2_ in this.magicBulletArray)
            {
               if(_loc2_.getImcName() == "Monster65Bullet1_1")
               {
                  return;
               }
            }
         }
         else if(param1 == "hurt")
         {
            param1 = "hit2";
            this.setYourFather(8);
         }
         super.setAction(param1);
         var _loc3_:Point = this.bbdc.getCurPoint();
         switch(param1)
         {
            case "wait":
               if(_loc3_.y != 0)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(0);
               }
               this.bbdc.setState(param1);
               break;
            case "walk":
               if(_loc3_.y != 0)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(0);
               }
               this.bbdc.setState(param1);
               break;
            case "hurt":
               if(_loc3_.y != 1)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(1);
               }
               this.bbdc.setState(param1);
               break;
            case "hit1":
               if(_loc3_.y != 3)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(3);
               }
               this.bbdc.setState(param1);
               break;
            case "hit2":
               if(_loc3_.y != 4)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(param1);
               break;
            case "hit3":
               if(_loc3_.y != 5)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(5);
               }
               this.bbdc.setState(param1);
               break;
            case "hit4":
               if(_loc3_.y != 6)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(6);
               }
               this.bbdc.setState(param1);
               break;
            case "dead":
               if(_loc3_.y != 2)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(2);
               }
               this.bbdc.setState(param1);
         }
      }
      
      override protected function scriptFrameOverFunc(param1:int) : void
      {
         var _loc2_:String = String(this.bbdc.getState());
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
         var _loc2_:String = String(this.bbdc.getState());
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
               if(_loc3_ == 0)
               {
                  this.speed.x = -8;
                  break;
               }
               this.speed.x = 8;
               break;
            case "hit3":
               if(param1.x == 2)
               {
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     this.doHi3(_loc3_);
                  }
               }
               break;
            case "hit4":
               if(param1.x == 5)
               {
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     this.doHi4(_loc3_);
                  }
               }
         }
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         return false;
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
         this.setYourFather(10);
         this.setAction("hit2");
         this.lastHit = "hit2";
         this.faceToTarget();
      }
      
      override protected function releSkill2() : void
      {
         this.newAttackId();
         this.setYourFather(30);
         this.setAction("hit3");
         this.lastHit = "hit3";
         this.faceToTarget();
      }
      
      override protected function releSkill3() : void
      {
         this.newAttackId();
         this.setYourFather(20);
         this.setAction("hit4");
         this.lastHit = "hit4";
         this.faceToTarget();
      }
      
      private function doHi1(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster65Bullet1_1");
         _loc2_.x = this.x;
         _loc2_.y = this.y;
         _loc2_.setRole(this);
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setDestroyInCount(gc.frameClips * 5);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit1_1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
         this.diHit1_2();
      }
      
      private function diHit1_2() : void
      {
         var _loc1_:* = undefined;
         _loc1_ = undefined;
         _loc1_ = undefined;
         _loc1_ = null;
         var i:int = 0;
         var j:int = 0;
         if(this.curAttackTarget)
         {
            i = 0;
            while(i < this.magicBulletArray.length)
            {
               _loc1_ = this.magicBulletArray[i];
               if(_loc1_.getImcName() == "Monster65Bullet1_1")
               {
                  j = 0;
                  while(j < 6)
                  {
                     TweenMax.delayedCall((j + 1) * 0.833333333,function(param1:Monster65):*
                     {
                        var _loc2_:* = null;
                        var _loc3_:* = null;
                        _loc2_ = new EnemyMoveBullet("Monster65Bullet1_2");
                        _loc2_.x = _loc1_.x;
                        _loc2_.y = Number(_loc1_.y) - 50;
                        _loc2_.setRole(param1);
                        _loc3_ = AUtils.GetNextPointByTwoObj(_loc1_,param1.curAttackTarget);
                        _loc2_.setSpeed(Number(_loc3_.x) * 27,Number(_loc3_.y) * 27);
                        _loc2_.setDistance(1000);
                        _loc2_.setDestroyWhenLastFrame(false);
                        _loc2_.setDirect(0);
                        _loc2_.setAction("hit1_2");
                        gc.gameSence.addChild(_loc2_);
                        param1.magicBulletArray.push(_loc2_);
                     },[this]);
                     j++;
                  }
               }
               i++;
            }
         }
      }
      
      private function summonbb() : *
      {
      }
      
      private function doHi2(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster65Bullet2");
         _loc2_.x = this.x;
         _loc2_.y = this.y;
         _loc2_.setRole(this);
         _loc2_.setDisable();
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit2");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHi3(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster65Bullet2");
         _loc2_.x = this.x;
         _loc2_.y = this.y;
         _loc2_.setRole(this);
         _loc2_.setDisable();
         _loc2_.setFuncWhenDestroy(this.hit3over);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit2");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function hit3over(param1:BaseBullet) : void
      {
         var _loc2_:* = null;
         for each(_loc2_ in gc.getPlayerArray())
         {
            if(_loc2_.getPet())
            {
               _loc2_.getPet().addCurAddEffect([{
                  "name":BaseAddEffect.MONSTER65_TIED_PET,
                  "time":gc.frameClips * 10
               }]);
            }
         }
      }
      
      internal function doHi4(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster65Bullet3");
         _loc2_.x = this.x;
         _loc2_.y = -85;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit4");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      override protected function exitFrameFunc(param1:Point) : void
      {
      }
      
      override protected function myIntelligence() : void
      {
         var _loc1_:* = null;
         if(!this.isBeAttacking())
         {
            super.myIntelligence();
         }
         if(this.y > 1000)
         {
            for each(_loc1_ in gc.getPlayerArray())
            {
               this.y = 5 * 60;
               this.x = _loc1_.x;
            }
         }
      }
      
      override public function isCanMoveWhenAttack() : Boolean
      {
         return this.curAction == "hit2";
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

