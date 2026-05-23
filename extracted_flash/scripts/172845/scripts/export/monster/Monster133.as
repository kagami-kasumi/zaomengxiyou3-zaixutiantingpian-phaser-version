package export.monster
{
   import base.*;
   import export.bullet.*;
   import export.level.*;
   import flash.display.*;
   import flash.geom.*;
   
   public class Monster133 extends BaseMonster
   {
      
      public function Monster133()
      {
         super();
         this.horizenSpeed = 3.5;
         this.setHp(400000);
         this.setSHp(400000);
         this.attackRange = 250;
         this.alertRange = 2000;
         this.protectedParamsObject.def = 1322;
         this.protectedParamsObject.exp = 500;
         this.protectedParamsObject.gxp = 250;
         this.protectedParamsObject.mDef = 0.32;
         this.protectedParamsObject.probability = 0.8;
         this.fallList = [{
            "name":"wptm",
            "bigtype":"dj"
         },{
            "name":"wpxt",
            "bigtype":"dj"
         },{
            "name":"wpsc",
            "bigtype":"dj"
         },{
            "name":"xhb",
            "bigtype":"dj"
         }];
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":999,
            "power":4692,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":999,
            "power":4692,
            "attackKind":"physics"
         };
         this.isBoss = false;
         this.isFly = true;
         this.graity = 0;
         this.setAction("wait");
         this.skillCD1 = [gc.frameClips * 4,gc.frameClips * 8];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:Object = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster133");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],150,150,new Point(0,0));
            bbdc.setOffsetXY(0,-5);
            bbdc.setFrameStopCount([[4,4,4,4,4],[8],[2,2,2,2,10],[2,2,10],[2,10]]);
            bbdc.setFrameCount([5,1,5,3,2]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster133--BitmapData Error!");
      }
      
      override protected function newColipse() : void
      {
         this.colipse = AUtils.getNewObj("ObjectBaseSprite4") as Sprite;
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
               this.setAction("wait");
               break;
            case "dead":
               if(Math.random() < 0.3)
               {
                  if(gc.pWorld.getBaseLevelListener() is StageListener221)
                  {
                     (gc.pWorld.getBaseLevelListener() as StageListener221).addMu(new Point(this.x,this.y));
                  }
               }
               this.dropAura();
               this.destroy();
         }
      }
      
      override protected function enterFrameFunc(param1:Point) : void
      {
         var _loc2_:String = this.bbdc.getState();
         var _loc3_:uint = uint(this.getBBDC().getDirect());
         var _loc4_:int = int(this.bbdc.getCurFrameCount());
         switch(_loc2_)
         {
            case "hit1":
               if(param1.x == 2)
               {
                  if(_loc4_ == 10)
                  {
                     this.doHi1(_loc3_);
                  }
               }
               break;
            case "hit2":
               if(param1.x == 1)
               {
                  if(_loc4_ == 10)
                  {
                     this.doHi2(_loc3_);
                  }
               }
         }
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 400;
      }
      
      override protected function releSkill1() : void
      {
         this.faceToTarget();
         this.newAttackId();
         this.setYourFather(10);
         this.setAction("hit2");
         this.lastHit = "hit2";
      }
      
      private function doHi1(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster133Bullet1");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 80;
         }
         else
         {
            _loc2_.x = this.x + 80;
         }
         _loc2_.y = this.y - 20;
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setDestroyInCount(gc.frameClips * 5);
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHi2(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster133Bullet2");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 130;
         }
         else
         {
            _loc2_.x = this.x + 130;
         }
         _loc2_.y = this.y - 50;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit2");
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

