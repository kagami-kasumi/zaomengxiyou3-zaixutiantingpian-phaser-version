package export.monster
{
   import base.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.events.*;
   import flash.geom.*;
   
   public class Monster100 extends BaseMonster
   {
      
      public function Monster100()
      {
         super();
         this.horizenSpeed = 3;
         this.setHp(1200000 * 0.7);
         this.setSHp(1200000 * 0.7);
         this.protectedParamsObject.mysee = 300;
         this.protectedParamsObject.isattback = 50;
         this.attackRange = 250;
         this.alertRange = 1000;
         this.normalAttackRate = 0;
         this.protectedParamsObject.def = 932;
         this.protectedParamsObject.mDef = 0.4;
         this.protectedParamsObject.exp = 200;
         this.protectedParamsObject.gxp = 200;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":999,
            "power":1563,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[2,-4],
            "attackInterval":4,
            "power":1563 * 0.3,
            "attackKind":"magic"
         };
         this.isBoss = true;
         this.isFly = true;
         this.graity = 0;
         this.monsterName = "法身";
         this.setAction("wait");
         this.protectedParamsObject.probability = 0.25;
         this.fallList = [{
            "name":"zsTimerup2",
            "bigtype":"dj"
         }];
         this.skillCD1 = [gc.frameClips * 3,gc.frameClips * 10];
         this.skillCD2 = [gc.frameClips * 4,gc.frameClips * 12];
         this.skillCD = [50,105];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster100");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],260,250,new Point(0,0));
            bbdc.setOffsetXY(10,0);
            bbdc.setFrameStopCount([[4,4,4,4],[4,4,30,7],[2,5,12,2,23],[7]]);
            bbdc.setFrameCount([4,4,5,1]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster100--BitmapData Error!");
      }
      
      override protected function newColipse() : void
      {
         this.colipse = AUtils.getNewObj("ObjectBaseSprite5") as Sprite;
         this.colipse.visible = false;
         this.colipse.scaleY = 1.3;
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
               if(_loc2_.y != 0)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(0);
               }
               this.bbdc.setState(param1);
               break;
            case "hit1":
               if(_loc2_.y != 0)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(0);
               }
               this.bbdc.setState(param1);
               break;
            case "hit2":
               if(_loc2_.y != 2)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(2);
               }
               this.bbdc.setState(param1);
               break;
            case "hit3":
               if(_loc2_.y != 1)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(1);
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
         var _loc2_:String = this.bbdc.getState();
         var _loc3_:uint = uint(this.getBBDC().getDirect());
         switch(_loc2_)
         {
            case "hit2":
               if(param1.x == 2)
               {
                  if(this.bbdc.getCurFrameCount() == 12)
                  {
                     this.doHit1(_loc3_);
                  }
                  break;
               }
               if(param1.x == 3)
               {
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     this.doHit1_2(_loc3_);
                  }
               }
               break;
            case "hit3":
               if(param1.x == 2)
               {
                  if(this.bbdc.getCurFrameCount() == 30)
                  {
                     this.doHit2(_loc3_);
                  }
               }
         }
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         return this.curAttackTarget;
      }
      
      override protected function beforeSkill2Start() : Boolean
      {
         return this.curAttackTarget;
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
      
      private function doHit1(param1:uint) : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster100fireact");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 115;
         }
         else
         {
            _loc2_.x = this.x + 115;
         }
         _loc2_.y = this.y + 220;
         _loc2_.setRole(this);
         _loc2_.setDisable();
         _loc2_.setDirect(param1);
         _loc2_.setAction("wait");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHit1_2(param1:uint) : void
      {
         var _loc2_:Number = Number(NaN);
         var _loc3_:int = 0;
         var _loc4_:EnemyMoveBullet = null;
         var _loc5_:* = null;
         if(this.curAttackTarget)
         {
            _loc4_ = new EnemyMoveBullet("Monster1003Bullet3");
            _loc4_.x = this.x;
            _loc4_.y = this.y;
            _loc4_.setRole(this);
            _loc5_ = AUtils.GetNextPointByTwoObj(this,this.curAttackTarget);
            _loc4_.setSpeed(Number(_loc5_.x) * 20,Number(_loc5_.y) * 20);
            _loc4_.setDistance(1000);
            _loc4_.setDestroyWhenLastFrame(false);
            _loc4_.setDirect(param1);
            _loc4_.setAction("hit1");
            _loc2_ = Number(_loc5_.y) / Number(_loc5_.x);
            _loc3_ = Number(_loc5_.x) / Math.abs(_loc5_.x);
            if(param1 == 0)
            {
               if(_loc3_ > 0)
               {
                  _loc4_.rotation = 180 - Math.atan(_loc2_) / Math.PI * 180 * -_loc3_;
               }
               else
               {
                  _loc4_.rotation = Math.atan(_loc2_) / Math.PI * 180 * -_loc3_;
               }
            }
            else if(_loc3_ > 0)
            {
               _loc4_.rotation = Math.atan(_loc2_) / Math.PI * 180 * _loc3_;
            }
            else
            {
               _loc4_.rotation = 180 - Math.atan(_loc2_) / Math.PI * 180 * _loc3_;
            }
            gc.gameSence.addChild(_loc4_);
            this.magicBulletArray.push(_loc4_);
         }
      }
      
      private function doHit2(param1:uint) : void
      {
         this.setYourFather(35);
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster100shunyi");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 115;
         }
         else
         {
            _loc2_.x = this.x + 115;
         }
         _loc2_.y = this.y - 20;
         _loc2_.setRole(this);
         _loc2_.setDisable();
         _loc2_.setDirect(param1);
         _loc2_.setAction("wait");
         _loc2_.addEventListener(Event.ENTER_FRAME,this.funchit2);
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function funchit2(param1:Event) : *
      {
         var _loc2_:Point = null;
         var _loc3_:Point = null;
         var _loc4_:Point = null;
         if(param1.target.getImgMc().currentFrame == 26)
         {
            _loc2_ = gc.gameSence.localToGlobal(new Point(this.x,this.y));
            _loc3_ = gc.gameSence.globalToLocal(new Point(20,0));
            _loc4_ = gc.gameSence.localToGlobal(new Point(this.curAttackTarget.x,this.curAttackTarget.y));
            if(_loc4_.x < 460)
            {
               this.x = 900;
            }
            else
            {
               this.x = 20;
            }
         }
         if(param1.target.getImgMc().currentFrame == param1.target.getImgMc().totalFrames - 1)
         {
            param1.target.removeEventListener(Event.ENTER_FRAME,this.funchit2);
         }
      }
      
      override protected function move() : void
      {
         super.move();
      }
      
      override public function isAttacking() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2";
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
            if(gc.pWorld.monsterArray.length == 1)
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
      
      override public function setAttackBack(param1:Point) : void
      {
      }
      
      override public function reduceHp(param1:int, param2:Boolean = false) : void
      {
         super.reduceHp(param1,false);
      }
   }
}

