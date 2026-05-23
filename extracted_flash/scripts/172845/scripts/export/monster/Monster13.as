package export.monster
{
   import base.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   
   public class Monster13 extends BaseMonster
   {
      
      public function Monster13()
      {
         super();
         this.horizenSpeed = 3;
         this.setHp(5200);
         this.setSHp(5200);
         this.protectedParamsObject.mysee = 5 * 60;
         this.protectedParamsObject.isattback = 50;
         this.attackRange = 400;
         this.alertRange = 700;
         this.protectedParamsObject.mDef = 0.3;
         this.protectedParamsObject.def = 69;
         this.protectedParamsObject.exp = 104;
         this.protectedParamsObject.gxp = 40;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":1,
            "attackBackSpeed":[6,-5],
            "attackInterval":999,
            "power":100,
            "attackKind":"magic"
         };
         this.isBoss = false;
         this.setAction("wait");
         this.isFly = true;
         this.graity = 0;
         this.protectedParamsObject.probability = 0.12;
         this.fallList = [{
            "name":"wptm",
            "bigtype":"dj"
         },{
            "name":"wpxt",
            "bigtype":"dj"
         },{
            "name":"wpsc",
            "bigtype":"dj"
         }];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster13");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],200,200,new Point(0,0));
            bbdc.setOffsetXY(-18,-15);
            bbdc.setFrameStopCount([[2,2,2,3,2,2,2],[15],[2,2,2,2,2],[2,2,6]]);
            bbdc.setFrameCount([7,1,5,3]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster13--BitmapData Error!");
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
               if(param1.x == 2)
               {
                  if(this.bbdc.getCurFrameCount() == 6)
                  {
                     this.doHi1(_loc3_);
                  }
               }
         }
      }
      
      private function doHi1(param1:uint) : void
      {
         var _loc2_:EnemyMoveBullet = new EnemyMoveBullet("Monster13Bullet1");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 82;
         }
         else
         {
            _loc2_.x = this.x + 82;
         }
         _loc2_.y = this.y - 21;
         _loc2_.setRole(this);
         var _loc3_:Point = AUtils.GetNextPointByTwoObj(this,this.curAttackTarget);
         _loc2_.setSpeed(_loc3_.x * 3,_loc3_.y * 3);
         _loc2_.setAddSpeed(_loc3_.x,_loc3_.y);
         _loc2_.setDistance(1000);
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit1");
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

