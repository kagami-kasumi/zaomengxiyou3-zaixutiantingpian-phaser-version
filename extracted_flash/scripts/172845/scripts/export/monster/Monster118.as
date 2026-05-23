package export.monster
{
   import base.*;
   import com.greensock.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   import my.*;
   
   public class Monster118 extends BaseMonster
   {
      
      private var fenshenArray:Array;
      
      public var targetPoint:Point;
      
      public var isFenshen:Boolean = false;
      
      private var disappearCountWhenIsFenshen:uint = 80;
      
      public function Monster118()
      {
         this.fenshenArray = [];
         super();
         this.horizenSpeed = 4;
         this.setHp(1800000);
         this.setSHp(1800000);
         this.protectedParamsObject.Dodge = 10;
         this.protectedParamsObject.Touhgness = 0;
         this.protectedParamsObject.def = 1195;
         this.protectedParamsObject.exp = 3000;
         this.protectedParamsObject.gxp = 1000;
         this.protectedParamsObject.mDef = 0.42;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[0,0],
            "attackInterval":999,
            "power":2042,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[0,0],
            "attackInterval":999,
            "power":1875,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[0,0],
            "attackInterval":999,
            "power":1875,
            "attackKind":"magic"
         };
         this.attackRange = 250;
         this.alertRange = 1000;
         this.isBoss = true;
         this.monsterName = "花豹圣者";
         this.setAction("wait");
         this.skillCD1 = [gc.frameClips * 2,gc.frameClips * 5.4];
         this.skillCD2 = [gc.frameClips * 3,gc.frameClips * 6];
         this.skillCD3 = [gc.frameClips * 4,gc.frameClips * 5];
         this.skillCD4 = [gc.frameClips * 2.5,gc.frameClips * 4.5];
         this.protectedParamsObject.probability = 0;
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster118");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],300,300,new Point(0,0));
            bbdc.setOffsetXY(-10,-40);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8],[2,2,2,2,10],[2,2,2,10],[2,2,2,2],[2,2,30]]);
            bbdc.setFrameCount([6,4,1,5,4,40,3]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster118--BitmapData Error!");
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
               if(this.isFenshen)
               {
                  this.destroy();
               }
               this.setAction("wait");
               break;
            case "hit2":
               this.setAction("wait");
               break;
            case "hit3":
               this.hit3Over();
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
         var _loc2_:int = 0;
         var _loc3_:* = undefined;
         var _loc4_:* = undefined;
         var _loc5_:* = undefined;
         var _loc6_:* = 0;
         var _loc7_:String = this.bbdc.getState();
         var _loc8_:uint = uint(this.getBBDC().getDirect());
         switch(_loc7_)
         {
            case "hit1":
               if(param1.x == 3)
               {
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     this.doHi1(_loc8_);
                  }
               }
               break;
            case "hit2":
               _loc6_ = uint(this.bbdc.getCurKeyFrameIndex());
               if(!this.isFenshen)
               {
                  if(_loc6_ == 0)
                  {
                     this.createShallow(5,new Point(this.x,this.y));
                  }
               }
               if(_loc8_ == 0)
               {
                  this.speed.x = -_loc6_ / 2 - 10;
               }
               else
               {
                  this.speed.x = _loc6_ / 2 + 10;
               }
               if(!this.isFenshen)
               {
                  _loc2_ = 0;
                  _loc3_ = gc.getPlayerArray();
                  for each(_loc4_ in _loc3_)
                  {
                     if(HitTest.complexHitTestObject(this.colipse,_loc4_))
                     {
                        this.setYourFather(18);
                        this.attackTarget();
                        for each(_loc5_ in this.fenshenArray)
                        {
                           _loc5_.targetPoint = new Point(this.x,this.y);
                        }
                     }
                  }
                  break;
               }
               if(this.targetPoint)
               {
                  if(AUtils.GetDisBetweenTwoPoint(this.targetPoint,new Point(this.x,this.y)) <= 20)
                  {
                     this.attackTarget();
                     this.setStatic();
                     this.targetPoint = null;
                  }
               }
               break;
            case "hit3":
               if(param1.x == 2)
               {
                  if(this.bbdc.getCurFrameCount() == 30)
                  {
                     this.doHi3(_loc8_);
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
         return this.curAttackTarget != null;
      }
      
      override protected function releSkill1() : void
      {
         this.newAttackId();
         this.setYourFather(45);
         this.doHi2();
         this.setAction("hit2");
         this.lastHit = "hit2";
      }
      
      override protected function releSkill2() : void
      {
         this.newAttackId();
         this.setYourFather(38);
         this.setAction("hit3");
         this.lastHit = "hit3";
      }
      
      private function doHi1(param1:uint) : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster118Bullet1");
         if(param1 == 0)
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
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHi2() : void
      {
         var _loc1_:* = undefined;
         this.fenshenArray.length = 0;
         var _loc2_:* = gc.getPlayerArray();
         for each(_loc1_ in _loc2_)
         {
            if(this.x < _loc1_.x)
            {
               this.turnRight();
            }
            else
            {
               this.turnLeft();
            }
         }
      }
      
      private function createShallow(param1:uint, param2:Point) : void
      {
         var count:uint = param1;
         var point:Point = param2;
         if(count > 0)
         {
            count--;
            this.createSingleShallow(point);
            TweenMax.delayedCall(0.2,function(param1:Monster118, param2:uint, param3:Point):*
            {
               if(!param1.isDead() && param1.curAction == "hit2")
               {
                  param1.createShallow(param2,param3);
               }
            },[this,count,point]);
         }
      }
      
      private function createSingleShallow(param1:Point) : void
      {
         var _loc2_:Monster118 = new Monster118();
         _loc2_.x = param1.x;
         _loc2_.y = param1.y;
         _loc2_.isFenshen = true;
         _loc2_.alpha = 0.5;
         _loc2_.setYourFather(gc.frameClips * 99);
         _loc2_.setAction("hit2");
         _loc2_.isBoss = false;
         _loc2_.getBBDC().setDirect(this.getBBDC().getDirect());
         this.fenshenArray.push(_loc2_);
         gc.pWorld.monsterArray.push(_loc2_);
         var _loc3_:int = gc.getMinIdxInHeroAndPet();
         gc.gameSence.addChildAt(_loc2_,_loc3_);
      }
      
      private function doHi3(param1:uint) : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster118Bullet3Buff");
         if(param1 == 0)
         {
            _loc2_.x = this.x + 30;
         }
         else
         {
            _loc2_.x = this.x - 30;
         }
         _loc2_.y = this.y - 140;
         _loc2_.setRole(this);
         _loc2_.setDisable();
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit3");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function hit3Over() : void
      {
         var _loc1_:* = undefined;
         for each(_loc1_ in gc.getPlayerArray())
         {
            _loc1_.addCurAddEffect([{
               "name":BaseAddEffect.MONSTER118GELIE,
               "time":gc.frameClips * 9,
               "point":new Point(_loc1_.x,_loc1_.y)
            }]);
         }
      }
      
      override protected function exitFrameFunc(param1:Point) : void
      {
      }
      
      override protected function myIntelligence() : void
      {
         if(this.isFenshen)
         {
            if(this.disappearCountWhenIsFenshen > 0)
            {
               --this.disappearCountWhenIsFenshen;
               if(this.disappearCountWhenIsFenshen == 0)
               {
                  this.destroy();
               }
            }
         }
         else
         {
            super.myIntelligence();
         }
      }
      
      override public function isCanMoveWhenAttack() : Boolean
      {
         return this.curAction == "hit2";
      }
      
      override public function destroy() : void
      {
         var _loc1_:* = null;
         var _loc2_:int = 0;
         var _loc3_:* = null;
         if(this.isFenshen)
         {
            this.setHp(0);
         }
         super.destroy();
         this.fenshenArray.length = 0;
         if(this.isBoss && !this.isFenshen)
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

