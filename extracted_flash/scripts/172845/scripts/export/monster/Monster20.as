package export.monster
{
   import base.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   import my.*;
   
   public class Monster20 extends BaseMonster
   {
      
      private var fs:Monster20;
      
      private var fsCount:uint = 0;
      
      public function Monster20()
      {
         super();
         this.horizenSpeed = 4;
         this.monsterName = "袁洪";
         if(gc.curStage == 3 && gc.curLevel == 3 || gc.curStage == 8)
         {
            this.setHp(65466);
            this.setSHp(65466);
            this.isBoss = false;
         }
         else
         {
            this.setHp(65466);
            this.setSHp(65466);
            this.isBoss = true;
         }
         this.protectedParamsObject.mysee = 300;
         this.protectedParamsObject.isattback = 50;
         this.attackRange = 250;
         this.alertRange = 1000;
         this.protectedParamsObject.def = 84;
         this.protectedParamsObject.mDef = 0.3;
         this.protectedParamsObject.exp = 380;
         this.protectedParamsObject.gxp = 190;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":999,
            "power":637,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[0,0],
            "attackInterval":24,
            "power":148,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-10,2],
            "attackInterval":24,
            "power":148,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-10,2],
            "attackInterval":24,
            "power":205,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit5"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-10,2],
            "attackInterval":999,
            "power":411,
            "attackKind":"magic"
         };
         this.setAction("wait");
         this.skillCD1 = [gc.frameClips * 2,gc.frameClips * 8];
         this.skillCD2 = [gc.frameClips * 3,gc.frameClips * 5];
         this.skillCD3 = [gc.frameClips * 4,gc.frameClips * 10];
         this.skillCD4 = [gc.frameClips * 3,gc.frameClips * 8];
         this.protectedParamsObject.probability = 0.5;
         this.fallList = [{
            "name":"zjbtg",
            "bigtype":"zb"
         },{
            "name":"jllm",
            "bigtype":"zb"
         },{
            "name":"smz",
            "bigtype":"zb"
         },{
            "name":"jxqtj",
            "bigtype":"zb"
         }];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster20");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],350,250,new Point(0,0));
            bbdc.setOffsetXY(0,-15);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[15],[2,2,2,2,2,10],[2,5,2,10],[1,1],[28],[48],[2,2,2,24]]);
            bbdc.setFrameCount([6,4,1,6,4,24,1,1,4]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster20--BitmapData Error!");
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
            case "hit5":
               if(_loc2_.y != 8)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(8);
               }
               this.bbdc.setState(param1);
               break;
            case "dead":
               if(this.isBoss)
               {
                  if(_loc2_.y != 3)
                  {
                     this.bbdc.setFramePointX(0);
                     this.bbdc.setFramePointY(3);
                  }
               }
               else if(_loc2_.y != 6)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(6);
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
               this.fenshen();
               this.setAction("wait");
               break;
            case "hit3":
               this.setAction("wait");
               break;
            case "hit4":
               this.setAction("wait");
               break;
            case "hit5":
               this.setStatic();
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
      
      private function fenshen() : void
      {
         if(!this.fs)
         {
            this.fs = MainGame.getInstance().createMonster(20,this.x,this.y - 10) as Monster20;
            this.fs.setHp(this.getHp());
            this.fs.isBoss = false;
            this.fs.fallList = [];
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
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     this.doHit1(_loc3_);
                  }
               }
               break;
            case "hit2":
               break;
            case "dead":
               if(!this.isBoss)
               {
                  if(param1.x == 0)
                  {
                     if(this.bbdc.getCurFrameCount() == 28)
                     {
                        this.doHit3(_loc3_);
                     }
                  }
               }
               break;
            case "hit4":
               if(param1.x == 0)
               {
                  if(this.bbdc.getCurFrameCount() == 24)
                  {
                     this.doHit4(_loc3_);
                  }
               }
               break;
            case "hit5":
               if(param1.x == 3)
               {
                  if(this.bbdc.getCurFrameCount() == 24)
                  {
                     this.doHit5(_loc3_);
                  }
                  if(_loc3_ == 0)
                  {
                     this.speed.x = -10;
                     break;
                  }
                  this.speed.x = 10;
               }
         }
      }
      
      private function doHit1(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster20Bullet1");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 180;
         }
         else
         {
            _loc2_.x = this.x + 180;
         }
         _loc2_.y = this.y - 120;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      override protected function releSkill1() : void
      {
         this.newAttackId();
         this.setYourFather(24);
         this.setAction("hit2");
         this.lastHit = "hit2";
         this.faceToTarget();
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && this.isBoss && !this.fs;
      }
      
      override protected function releSkill2() : void
      {
         this.newAttackId();
         this.setYourFather(42);
         this.setAction("hit3");
         this.lastHit = "hit3";
         this.faceToTarget();
      }
      
      override protected function beforeSkill2Start() : Boolean
      {
         return !this.isBoss;
      }
      
      override protected function releSkill3() : void
      {
         this.setYourFather(24);
         this.newAttackId();
         this.setAction("hit4");
         this.lastHit = "hit4";
         this.faceToTarget();
      }
      
      override protected function beforeSkill3Start() : Boolean
      {
         return Boolean(this.fs) && Boolean(this.standInObj);
      }
      
      override protected function releSkill4() : void
      {
         this.setYourFather(32);
         this.newAttackId();
         this.setAction("hit5");
         this.lastHit = "hit5";
         this.faceToTarget();
      }
      
      override protected function beforeSkill4Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this,this.curAttackTarget) <= 350;
      }
      
      private function doHit3(param1:uint) : void
      {
         var _loc2_:* = null;
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster20Bullet3");
         if(param1 == 0)
         {
            _loc3_.x = this.x - 100;
         }
         else
         {
            _loc3_.x = this.x + 100;
         }
         _loc3_.y = this.y - 100;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit3");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
         for each(_loc2_ in gc.getPlayerArray())
         {
            if(AUtils.GetDisBetweenTwoObj(_loc2_,this) <= 250)
            {
               _loc2_.roleProperies.setMMP(Number(_loc2_.roleProperies.getMMP()) - 500);
            }
         }
      }
      
      private function doHit4(param1:uint) : void
      {
         var _loc2_:* = null;
         this.setYourFather(48);
         if(this.isBoss)
         {
            this.x = this.curAttackTarget.x + 270;
            this.turnLeft();
            if(Boolean(this.fs) && !this.fs.isDead())
            {
               this.fs.setAction("hit4");
               this.fs.x = Number(this.curAttackTarget.x) - 270;
               this.fs.y = this.y;
               this.fs.turnRight();
            }
            _loc2_ = new SpecialEffectBullet("Monster20Bullet4");
            _loc2_.x = this.x - 200;
            _loc2_.y = this.y;
            _loc2_.setRole(this);
            _loc2_.setDirect(param1);
            _loc2_.setAction("hit4");
            gc.gameSence.addChild(_loc2_);
            this.magicBulletArray.push(_loc2_);
         }
      }
      
      private function doHit5(param1:uint) : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster20Bullet5");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 90;
         }
         else
         {
            _loc2_.x = this.x + 90;
         }
         _loc2_.y = this.y - 90;
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setDestroyInCount(24);
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit5");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      override protected function exitFrameFunc(param1:Point) : void
      {
      }
      
      override public function isCanMoveWhenAttack() : Boolean
      {
         return this.curAction == "hit5";
      }
      
      override public function isAttacking() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3" || this.curAction == "hit4" || this.curAction == "hit5";
      }
      
      override protected function myIntelligence() : void
      {
         if(!this.isBeAttacking())
         {
            super.myIntelligence();
         }
         if(!this.isBoss && !this.isDead())
         {
            ++this.fsCount;
            if(this.fsCount >= 99999999)
            {
               this.protectedParamsObject.exp = 0;
               this.protectedParamsObject.gxp = 0;
               this.reduceHp(this.getHp(),false);
            }
         }
         if(this.isBoss)
         {
            if(this.fs)
            {
               if(this.fs.isDead())
               {
                  this.fs = null;
               }
            }
         }
      }
      
      override public function destroy() : void
      {
         var _loc1_:* = null;
         var _loc2_:int = 0;
         var _loc3_:* = null;
         super.destroy();
         if(this.isBoss && (gc.curStage == 3 && gc.curLevel == 2))
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

