package export.monster
{
   import base.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   
   public class Monster112 extends BaseMonster
   {
      
      public function Monster112()
      {
         super();
         this.horizenSpeed = 3;
         this.setHp(1158765);
         this.setSHp(1158765);
         this.attackRange = 200;
         this.alertRange = 700;
         this.protectedParamsObject.mDef = 0.42;
         this.protectedParamsObject.def = 1195;
         this.protectedParamsObject.exp = 500;
         this.protectedParamsObject.gxp = 250;
         this.normalAttackRate = 0.25;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[6,-5],
            "attackInterval":999,
            "power":2042,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[6,-5],
            "attackInterval":10,
            "power":1875 * 0.3,
            "attackKind":"magic"
         };
         this.isBoss = false;
         this.setAction("wait");
         this.isFly = true;
         this.graity = 0;
         this.skillCD1 = [gc.frameClips * 2,gc.frameClips * 3.6];
         this.skillCD2 = [gc.frameClips * 3,gc.frameClips * 6];
         this.skillCD3 = [gc.frameClips * 4,gc.frameClips * 5];
         this.skillCD4 = [gc.frameClips * 2.5,gc.frameClips * 4.5];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster112");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],200,200,new Point(0,0));
            bbdc.setOffsetXY(-58,0);
            bbdc.setFrameStopCount([[3,3,3,3,3,3],[2,2,2,20],[2,2,2,2,40]]);
            bbdc.setFrameCount([6,4,5]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster112--BitmapData Error!");
      }
      
      override protected function newColipse() : void
      {
         this.colipse = AUtils.getNewObj("Monster112Object") as Sprite;
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
               if(_loc2_.y != 0)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(0);
               }
               this.bbdc.setState(param1);
               break;
            case "hit1":
               if(_loc2_.y != 1)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(1);
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
            case "hurt":
               this.setStatic();
               this.setAction("wait");
               break;
            case "dead":
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
                  if(this.bbdc.getCurFrameCount() == 20)
                  {
                     this.doHi1(_loc3_);
                  }
                  if(_loc3_ == 0)
                  {
                     this.speed.x = -25;
                     break;
                  }
                  this.speed.x = 25;
               }
               break;
            case "hit2":
               if(param1.x == 3)
               {
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     this.doHi2(_loc3_);
                  }
               }
         }
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         return this.curAttackTarget != null;
      }
      
      override protected function releSkill1() : void
      {
         this.newAttackId();
         this.setYourFather(15);
         this.setAction("hit2");
         this.lastHit = "hit2";
      }
      
      private function doHi1(param1:uint) : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster112Bullet1");
         _loc2_.x = this.x;
         _loc2_.y = this.y;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setHurtCanCutDownEffect(false);
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHi2(param1:uint) : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster112Bullet2");
         _loc2_.x = this.x;
         _loc2_.y = this.y;
         _loc2_.setRole(this);
         _loc2_.setHurtCanCutDownEffect(false);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit2");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      override protected function exitFrameFunc(param1:Point) : void
      {
      }
      
      override public function isCanMoveWhenAttack() : Boolean
      {
         return this.curAction == "hit1";
      }
      
      override public function isAttacking() : Boolean
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
   }
}

