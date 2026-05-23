package export.monster
{
   import base.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   
   public class Monster55 extends BaseMonster
   {
      
      private var linkedArray:Array;
      
      public function Monster55()
      {
         this.linkedArray = [];
         super();
         this.horizenSpeed = 4;
         this.setHp(80000);
         this.setSHp(80000);
         this.attackRange = 250;
         this.alertRange = 1000;
         this.protectedParamsObject.def = 486;
         this.protectedParamsObject.mDef = 0.25;
         this.protectedParamsObject.exp = 312;
         this.protectedParamsObject.gxp = 156;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-6,-5],
            "attackInterval":999,
            "power":404,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["dead"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-6,-5],
            "attackInterval":999,
            "power":606,
            "attackKind":"magic"
         };
         this.isBoss = false;
         this.setAction("wait");
         this.protectedParamsObject.probability = 0.3;
         this.fallList = [{
            "name":"wplh",
            "bigtype":"dj"
         }];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster55");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],150,150,new Point(0,0));
            bbdc.setOffsetXY(4,2);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[15],[26,2,2,10],[2,2,20]]);
            bbdc.setFrameCount([6,4,1,4,3]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster55--BitmapData Error!");
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
               this.setYourFather(10);
               if(_loc2_.y != 4)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(4);
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
               if(param1.x == 2)
               {
                  if(this.bbdc.getCurFrameCount() == 20)
                  {
                     this.doHi1_1(_loc3_);
                  }
               }
               break;
            case "dead":
               if(param1.x == 0)
               {
                  if(this.bbdc.getCurFrameCount() == 26)
                  {
                     this.doDead(_loc3_);
                  }
               }
               this.speed.x = 0;
               this.speed.y = 0;
         }
      }
      
      private function doHi1_1(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster55Bullet2_1");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 50;
         }
         else
         {
            _loc2_.x = this.x + 50;
         }
         _loc2_.y = this.y - 25;
         _loc2_.setRole(this);
         _loc2_.setDisable();
         _loc2_.setFuncWhenDestroy(this.hit1Destroy);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function hit1Destroy(param1:BaseBullet) : void
      {
         var _loc2_:* = null;
         var _loc3_:* = null;
         for each(_loc2_ in this.magicBulletArray)
         {
            if(_loc2_.getImcName() == "Monster55Bullet2_1")
            {
               _loc3_ = new SpecialEffectBullet("Monster55Bullet2_2");
               _loc3_.x = _loc2_.x;
               _loc3_.y = _loc2_.y + 45;
               _loc3_.setRole(this);
               _loc3_.setDirect(0);
               _loc3_.setAction("hit1");
               gc.gameSence.addChild(_loc3_);
               this.magicBulletArray.push(_loc3_);
            }
         }
      }
      
      private function doDead(param1:uint) : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster55Bullet1");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 120;
         }
         else
         {
            _loc2_.x = this.x + 2 * 60;
         }
         _loc2_.y = this.y - 185;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("dead");
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
   }
}

