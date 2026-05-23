package export.monster
{
   import base.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   
   public class Monster132 extends BaseMonster
   {
      
      public function Monster132()
      {
         super();
         this.horizenSpeed = 4.5;
         this.setHp(9999999999);
         this.setSHp(9999999999);
         this.attackRange = 250;
         this.alertRange = 2000;
         this.protectedParamsObject.def = 1860;
         this.protectedParamsObject.mDef = 0.45;
         this.protectedParamsObject.exp = 7;
         this.protectedParamsObject.gxp = 4;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":999,
            "power":5000,
            "attackKind":"magic"
         };
         this.isBoss = false;
         this.isFly = true;
         this.graity = 0;
         this.setAction("wait");
         this.skillCD1 = [];
         this.protectedParamsObject.probability = 0;
         this.protectedParamsObject.fallList = [];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:Object = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster132");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],150,150,new Point(0,0));
            bbdc.setOffsetXY(20,-5);
            bbdc.setFrameStopCount([[4,4,4,4],[20]]);
            bbdc.setFrameCount([4,1]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster132--BitmapData Error!");
      }
      
      override protected function newColipse() : void
      {
         this.colipse = AUtils.getNewObj("ObjectBaseSprite3") as Sprite;
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
               this.setAction("wait");
               break;
            case "hit1":
               if(_loc2_.y != 1)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(1);
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
               this.setStatic();
               this.setAction("wait");
               break;
            case "hurt":
               break;
            case "dead":
         }
      }
      
      override protected function enterFrameFunc(param1:Point) : void
      {
         var _loc2_:int = 0;
         var _loc3_:String = this.bbdc.getState();
         var _loc4_:uint = uint(this.getBBDC().getDirect());
         switch(_loc3_)
         {
            case "hit1":
               _loc2_ = int(this.bbdc.getCurFrameCount());
               if(param1.x == 0)
               {
                  if(_loc2_ == 20)
                  {
                     this.doHi1(_loc4_);
                  }
               }
               if(_loc4_ == 0)
               {
                  this.speed.x = -(20 - _loc2_) * 2;
                  break;
               }
               this.speed.x = (20 - _loc2_) * 2;
         }
      }
      
      private function doHi1(param1:uint) : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster132Bullet1");
         _loc2_.x = this.x;
         _loc2_.y = this.y;
         _loc2_.setHurtCanCutDownEffect(false);
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      override protected function exitFrameFunc(param1:Point) : void
      {
      }
      
      override protected function attackTarget() : void
      {
         super.attackTarget();
         this.setYourFather(10);
      }
      
      override public function isCanMoveWhenAttack() : Boolean
      {
         return this.curAction == "hit1";
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
         super.destroy();
      }
   }
}

