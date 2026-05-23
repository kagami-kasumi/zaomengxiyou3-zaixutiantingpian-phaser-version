package export.monster
{
   import base.*;
   import export.bullet.*;
   import export.level.StageListener121Child.*;
   import flash.display.*;
   import flash.geom.*;
   
   public class Monster53 extends BaseMonster
   {
      
      private var lineControlArray:Array;
      
      public function Monster53()
      {
         this.lineControlArray = [];
         super();
         this.normalAttackRate = 0.6;
         this.horizenSpeed = 5;
         this.setHp(444976);
         this.setSHp(444976);
         this.attackRange = 200;
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
            "power":1518,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[10,0],
            "attackInterval":8,
            "power":455,
            "attackKind":"magic"
         };
         this.isBoss = true;
         this.monsterName = "银角大王";
         this.setAction("wait");
         this.protectedParamsObject.probability = 0.4;
         this.fallList = [{
            "name":"wpdd",
            "bigtype":"dj"
         }];
         this.skillCD1 = [gc.frameClips * 1,gc.frameClips * 4];
         this.skillCD2 = [gc.frameClips * 2,gc.frameClips * 5];
         this.skillCD3 = [gc.frameClips * 0.6,gc.frameClips * 7];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster53");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],250,5 * 60,new Point(0,0));
            bbdc.setOffsetXY(0,-40);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[15],[2,2,2,2,10],[2,2,2,10],[24],[2,2,10],[9,10]]);
            bbdc.setFrameCount([6,1,5,4,1,3,2]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster53--BitmapData Error!");
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
               if(_loc2_.y != 0)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(0);
               }
               this.bbdc.setState(param1);
               break;
            case "hurt":
               if(_loc2_.y != 1)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(1);
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
               this.setYourFather(15);
               if(_loc2_.y != 4)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(param1);
               break;
            case "hit3":
               this.setYourFather(15);
               if(_loc2_.y != 5)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(5);
               }
               this.bbdc.setState(param1);
               break;
            case "hit4":
               this.setYourFather(15);
               if(_loc2_.y != 6)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(6);
               }
               this.bbdc.setState(param1);
               break;
            case "dead":
               this.setStatic();
               if(_loc2_.y != 2)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(2);
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
         var _loc2_:String = this.bbdc.getState();
         var _loc3_:uint = uint(this.getBBDC().getDirect());
         switch(_loc2_)
         {
            case "hit1":
               if(param1.x == 3)
               {
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     this.doHit1(_loc3_);
                  }
               }
               break;
            case "hit2":
               if(param1.x == 0)
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     this.doHit2(_loc3_);
                  }
               }
               break;
            case "hit3":
               if(param1.x == 2)
               {
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     this.doHit3(_loc3_);
                  }
               }
               break;
            case "hit4":
               if(param1.x == 1)
               {
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     this.doHit4(_loc3_);
                  }
               }
         }
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         return Boolean(this.standInObj) && Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 10 * 60;
      }
      
      override protected function beforeSkill2Start() : Boolean
      {
         var _loc1_:* = null;
         var _loc2_:Boolean = true;
         for each(_loc1_ in this.lineControlArray)
         {
            if(!_loc1_.isBoomReady)
            {
               _loc2_ = false;
            }
         }
         return _loc2_;
      }
      
      override protected function beforeSkill3Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 400;
      }
      
      override protected function releSkill1() : void
      {
         this.newAttackId();
         this.setYourFather(15);
         this.setAction("hit2");
         this.lastHit = "hit2";
         this.faceToTarget();
      }
      
      override protected function releSkill2() : void
      {
         this.newAttackId();
         this.setYourFather(15);
         this.setAction("hit3");
         this.lastHit = "hit3";
         this.faceToTarget();
      }
      
      override protected function releSkill3() : void
      {
         this.newAttackId();
         this.setYourFather(15);
         this.setAction("hit4");
         this.lastHit = "hit4";
         this.faceToTarget();
      }
      
      private function doHit1(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster53Bullet1");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 130;
         }
         else
         {
            _loc2_.x = this.x + 130;
         }
         _loc2_.y = this.y - 30;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHit2(param1:uint) : void
      {
         var _loc2_:* = null;
         var _loc3_:* = null;
         if(this.lineControlArray.length == 0)
         {
            for each(_loc2_ in gc.getPlayerArray())
            {
               _loc3_ = new LineEffectControl();
               _loc3_.addFirstLine(this,_loc2_);
               this.lineControlArray.push(_loc3_);
            }
         }
         else
         {
            for each(_loc3_ in this.lineControlArray)
            {
               _loc3_.addSecondLine();
            }
         }
      }
      
      private function doHit3(param1:uint) : void
      {
         var _loc2_:* = null;
         var _loc3_:* = null;
         for each(_loc2_ in this.lineControlArray)
         {
            _loc2_.boom();
         }
         this.lineControlArray.length = 0;
         _loc3_ = new FollowBaseObjectBullet("Monster53Bullet2");
         if(param1 == 0)
         {
            _loc3_.x = this.x - 0;
         }
         else
         {
            _loc3_.x = this.x + 0;
         }
         _loc3_.y = this.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit3");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit4(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster53Bullet3");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 65;
         }
         else
         {
            _loc2_.x = this.x + 65;
         }
         _loc2_.y = this.y - 90;
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
         var _loc2_:* = null;
         var _loc3_:int = 0;
         if(!this.isBeAttacking())
         {
            super.myIntelligence();
         }
         var _loc4_:* = [];
         for each(_loc1_ in this.lineControlArray)
         {
            _loc1_.step();
            if(_loc1_.isDestroyed)
            {
               _loc4_.push(_loc1_);
            }
         }
         for each(_loc2_ in _loc4_)
         {
            _loc3_ = int(this.lineControlArray.indexOf(_loc2_));
            if(_loc3_ != -1)
            {
               this.lineControlArray.splice(_loc3_,1);
            }
         }
      }
      
      override public function isAttacking() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3" || this.curAction == "hit4";
      }
      
      override public function destroy() : void
      {
         var _loc1_:* = null;
         var _loc2_:* = null;
         var _loc3_:int = 0;
         var _loc4_:* = null;
         super.destroy();
         if(this.getHp() <= 0)
         {
            for each(_loc1_ in this.lineControlArray)
            {
               _loc1_.destroy();
            }
            if(this.isBoss)
            {
               _loc2_ = gc.pWorld.getTransferDoorArray();
               _loc3_ = 0;
               while(_loc3_ < _loc2_.length)
               {
                  _loc4_ = _loc2_[_loc3_];
                  _loc4_.visible = true;
                  _loc3_++;
               }
            }
         }
      }
   }
}

