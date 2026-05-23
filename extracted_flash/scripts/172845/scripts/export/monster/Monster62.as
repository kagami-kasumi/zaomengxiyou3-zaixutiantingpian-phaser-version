package export.monster
{
   import base.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   
   public class Monster62 extends BaseMonster
   {
      
      public function Monster62()
      {
         super();
         this.horizenSpeed = 4;
         this.setHp(60000);
         this.setSHp(60000);
         this.normalAttackRate = 0.4;
         this.attackRange = 250;
         this.alertRange = 1000;
         this.protectedParamsObject.def = 486;
         this.protectedParamsObject.mDef = 0.25;
         this.protectedParamsObject.exp = 356;
         this.protectedParamsObject.gxp = 188;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":1,
            "attackBackSpeed":[0,0],
            "attackInterval":999,
            "power":404,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[0,0],
            "attackInterval":999,
            "power":404,
            "attackKind":"magic"
         };
         this.isBoss = false;
         this.setAction("wait");
         this.protectedParamsObject.probability = 0.3;
         this.fallList = [{
            "name":"wprs",
            "bigtype":"dj"
         }];
         this.skillCD1 = [gc.frameClips * 4,gc.frameClips * 7];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster62");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],150,150,new Point(0,0));
            bbdc.setOffsetXY(4,-4);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[15],[2,2,2,2,10],[2,2,2,10],[2,2,2,10]]);
            bbdc.setFrameCount([6,1,5,4,4]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster62--BitmapData Error!");
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
               if(_loc2_.y != 4)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(param1);
               break;
            case "dead":
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
                     this.doHi1(_loc3_);
                  }
               }
               break;
            case "hit2":
               if(param1.x == 3)
               {
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     this.doHi2(_loc3_);
                  }
               }
         }
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         return true;
      }
      
      override protected function releSkill1() : void
      {
         this.newAttackId();
         this.setYourFather(10);
         this.setAction("hit2");
         this.lastHit = "hit2";
      }
      
      private function doHi1(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster62Bullet1");
         if(this.bbdc.getDirect() == 0)
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
      
      private function doHi2(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster62Bullet2");
         if(this.bbdc.getDirect() == 0)
         {
            _loc2_.x = this.x;
         }
         else
         {
            _loc2_.x = this.x;
         }
         _loc2_.y = this.y;
         _loc2_.setRole(this);
         _loc2_.setDisable();
         _loc2_.setFuncWhenDestroy(this.hit2Destroy);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit2");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function hit2Destroy(param1:BaseBullet) : void
      {
         var _loc2_:* = null;
         for each(_loc2_ in gc.pWorld.monsterArray)
         {
            if(AUtils.GetDisBetweenTwoObj(this,_loc2_) <= 500)
            {
               _loc2_.cureHp(12000);
            }
         }
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

