package export.monster
{
   import base.*;
   import export.bullet.*;
   import export.level.*;
   import flash.display.*;
   import flash.geom.*;
   
   public class Monster41 extends BaseMonster
   {
      
      public function Monster41()
      {
         var _loc1_:* = undefined;
         _loc1_ = undefined;
         _loc1_ = 0;
         super();
         _loc1_ = 1;
         if(gc.pWorld.getBaseLevelListener() is StageListener81)
         {
            _loc1_ = uint(StageListener81(gc.pWorld.getBaseLevelListener()).getCurLevel());
         }
         this.horizenSpeed = 4;
         this.setHp(8000 + _loc1_ * 333);
         this.setSHp(8000 + _loc1_ * 333);
         this.normalAttackRate = 0.4;
         this.attackRange = 10 * 60;
         this.alertRange = 1000;
         this.protectedParamsObject.def = 138 + _loc1_ * 3;
         this.protectedParamsObject.mDef = 0.25;
         this.protectedParamsObject.exp = 232;
         this.protectedParamsObject.gxp = 116;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":999,
            "power":264 + _loc1_ * 2.5,
            "attackKind":"magic"
         };
         this.isBoss = false;
         this.isFly = true;
         this.graity = 0;
         this.setAction("wait");
         this.protectedParamsObject.probability = 0.7;
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
         this.skillCD1 = [gc.frameClips * 4,gc.frameClips * 8];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster41");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],200,200,new Point(0,0));
            bbdc.setOffsetXY(0,-2);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[15],[2,2,2,2,7],[2,2,2,9]]);
            bbdc.setFrameCount([6,1,5,4]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster1--BitmapData Error!");
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
                  if(this.bbdc.getCurFrameCount() == 9)
                  {
                     this.doHi1(_loc3_);
                  }
               }
         }
      }
      
      private function doHi1(param1:uint) : void
      {
         var _loc2_:EnemyMoveBullet = new EnemyMoveBullet("Monster41Bullet1");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 25;
         }
         else
         {
            _loc2_.x = this.x + 25;
         }
         _loc2_.y = this.y + 55;
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
      
      override protected function beforeSkill1Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 200;
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

