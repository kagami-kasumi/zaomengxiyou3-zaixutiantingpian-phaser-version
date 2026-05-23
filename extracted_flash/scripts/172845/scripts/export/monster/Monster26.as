package export.monster
{
   import base.*;
   import com.greensock.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   import my.*;
   
   public class Monster26 extends BaseMonster
   {
      
      private var isStopInSky:Boolean;
      
      public function Monster26()
      {
         super();
         this.horizenSpeed = 4.5;
         if(gc.curStage == 8)
         {
            this.setHp(61793);
            this.setSHp(61793);
            this.isBoss = false;
         }
         else
         {
            this.setHp(61793);
            this.setSHp(61793);
            this.isBoss = true;
         }
         this.protectedParamsObject.mysee = 5 * 60;
         this.protectedParamsObject.isattback = 50;
         this.attackRange = 200;
         this.alertRange = 1000;
         this.protectedParamsObject.def = 80;
         this.protectedParamsObject.mDef = 0.3;
         this.protectedParamsObject.exp = 330;
         this.protectedParamsObject.gxp = 150;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":999,
            "power":395,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit2_1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-5,0],
            "attackInterval":999,
            "power":288,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit2_2"] = {
            "hitMaxCount":9999,
            "attackBackSpeed":[-10,0],
            "attackInterval":48,
            "power":172,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-2,-4],
            "attackInterval":6,
            "power":72,
            "attackKind":"magic"
         };
         this.isFly = true;
         this.graity = 0;
         this.monsterName = "持国天王";
         this.setAction("wait");
         this.protectedParamsObject.probability = 0.25;
         this.fallList = [{
            "name":"tdlzjzzs",
            "bigtype":"dj"
         }];
         this.skillCD1 = [gc.frameClips * 3,gc.frameClips * 4];
         this.skillCD2 = [gc.frameClips * 4,gc.frameClips * 6];
         this.skillCD3 = [gc.frameClips * 1,gc.frameClips * 7];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster26");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],250,350,new Point(0,0));
            bbdc.setOffsetXY(0,-10);
            bbdc.setFrameStopCount([[2,2,2,2,2,2],[15],[3,3],[10],[3,3]]);
            bbdc.setFrameCount([6,1,2,1,8]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster26--BitmapData Error!");
      }
      
      override protected function newColipse() : void
      {
         this.colipse = AUtils.getNewObj("ObjectBaseSprite5") as Sprite;
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
               if(_loc2_.y != 2)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(2);
               }
               this.bbdc.setState(param1);
               break;
            case "hit2":
               if(_loc2_.y != 3)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(3);
               }
               this.bbdc.setState(param1);
               break;
            case "hit3":
               if(_loc2_.y != 4)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(param1);
               break;
            case "dead":
               this.dropAura();
               this.destroy();
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
               this.callMonster28();
               this.setAction("wait");
               break;
            case "hurt":
               this.setStatic();
               this.setAction("wait");
               break;
            case "dead":
         }
      }
      
      private function callMonster28() : void
      {
         var _loc1_:Number = this.x + (Math.random() - 0.5) * 200;
         var _loc2_:Number = this.y + (Math.random() - 0.5) * 100;
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("Monster26BulletCallMonster28");
         _loc3_.x = _loc1_;
         _loc3_.y = _loc2_;
         _loc3_.setRole(this);
         _loc3_.setDirect(0);
         _loc3_.setDisable();
         _loc3_.setAction("hit3");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
         MainGame.getInstance().createMonster(28,_loc1_,_loc2_);
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
                  if(this.bbdc.getCurFrameCount() == 3)
                  {
                     this.doHi1(_loc3_);
                  }
               }
               break;
            case "hit2":
               if(param1.x == 0)
               {
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     this.doHi2_1(_loc3_);
                  }
               }
               break;
            case "hit3":
         }
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && Boolean(this.curAttackTarget.standInObj);
      }
      
      override protected function beforeSkill2Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 250;
      }
      
      override protected function beforeSkill3Start() : Boolean
      {
         return this.curAttackTarget != null;
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
         this.setYourFather(25);
         this.setAction("hit3");
         this.lastHit = "hit3";
         this.faceToTarget();
         this.doHi3(this.getBBDC().getDirect());
      }
      
      override protected function releSkill3() : void
      {
         this.newAttackId();
         this.setYourFather(15);
         TweenMax.to(this,1,{
            "x":this.curAttackTarget.x + (Math.random() - 0.5) * 200,
            "y":150
         });
         TweenMax.delayedCall(15,function(param1:Monster26):*
         {
            param1.isStopInSky = false;
         },[this]);
         this.isStopInSky = true;
      }
      
      override protected function move() : void
      {
         if(!this.isStopInSky)
         {
            super.move();
         }
      }
      
      private function doHi1(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster26Bullet1");
         _loc2_.x = this.x - 0;
         _loc2_.y = this.y - 0;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHi2_1(param1:uint) : void
      {
         var b:SpecialEffectBullet = null;
         var point:Point = null;
         var direct:uint = param1;
         if(this.curAttackTarget)
         {
            b = new SpecialEffectBullet("Monster26Bullet2_1");
            b.x = this.curAttackTarget.x;
            b.y = Number(this.curAttackTarget.y) - 350;
            b.setRole(this);
            b.setDirect(direct);
            b.setAction("hit2_1");
            gc.gameSence.addChild(b);
            this.magicBulletArray.push(b);
            if(this.curAttackTarget.standInObj)
            {
               point = new Point(b.x,this.curAttackTarget.standInObj.y);
               TweenMax.delayedCall(1,function(param1:Monster26, param2:uint, param3:Point):*
               {
                  param1.doHi2_2(param2,param3);
               },[this,direct,point]);
            }
            b = new SpecialEffectBullet("Monster26Bullet2_1");
            b.x = this.curAttackTarget.x + 50;
            b.y = Number(this.curAttackTarget.y) - 350;
            b.setRole(this);
            b.setDirect(direct);
            b.setAction("hit2_1");
            gc.gameSence.addChild(b);
            this.magicBulletArray.push(b);
            if(this.curAttackTarget.standInObj)
            {
               point = new Point(b.x,this.curAttackTarget.standInObj.y);
               TweenMax.delayedCall(1,function(param1:Monster26, param2:uint, param3:Point):*
               {
                  param1.doHi2_2(param2,param3);
               },[this,direct,point]);
            }
            b = new SpecialEffectBullet("Monster26Bullet2_1");
            b.x = Number(this.curAttackTarget.x) - 50;
            b.y = Number(this.curAttackTarget.y) - 350;
            b.setRole(this);
            b.setDirect(direct);
            b.setAction("hit2_1");
            gc.gameSence.addChild(b);
            this.magicBulletArray.push(b);
            if(this.curAttackTarget.standInObj)
            {
               point = new Point(b.x,this.curAttackTarget.standInObj.y);
               TweenMax.delayedCall(1,function(param1:Monster26, param2:uint, param3:Point):*
               {
                  param1.doHi2_2(param2,param3);
               },[this,direct,point]);
            }
         }
      }
      
      public function doHi2_2(param1:uint, param2:Point) : void
      {
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("Monster26Bullet2_2");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDestroyWhenLastFrame(false);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit2_2");
         gc.gameSence.bgContainer.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHi3(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster26Bullet3");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 75;
         }
         else
         {
            _loc2_.x = this.x + 75;
         }
         _loc2_.y = this.y - 60;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit3");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
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

