package export.monster
{
   import base.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   
   public class Monster101 extends BaseMonster
   {
      
      private var dhfr:Boolean;
      
      public function Monster101()
      {
         super();
         this.horizenSpeed = 5;
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
            "attackInterval":12,
            "power":1563 * 0.36,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[2,-4],
            "attackInterval":16,
            "power":1563 * 0.5,
            "attackKind":"magic",
            "addEffect":[{
               "name":BaseAddEffect.POYAZHIREDUCEMP,
               "time":gc.frameClips * 0.5,
               "value":500
            }]
         };
         this.isBoss = true;
         this.monsterName = "应身";
         this.setAction("wait");
         this.protectedParamsObject.probability = 0.25;
         this.fallList = [{
            "name":"zsTimerup2",
            "bigtype":"dj"
         }];
         this.skillCD1 = [gc.frameClips * 4,gc.frameClips * 7];
         this.skillCD2 = [gc.frameClips * 5,gc.frameClips * 11];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster101");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],300,300,new Point(0,0));
            bbdc.setOffsetXY(10,-30);
            bbdc.setFrameStopCount([[3,6],[1,3,5,2,19,3],[3,2,7,2,18,4],[1,2,3,3,2,25],[15],[2,2,2,3,2,4],[4,4,4,4]]);
            bbdc.setFrameCount([2,6,6,6,1,6,4]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster101--BitmapData Error!");
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
               if(_loc2_.y != 5)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(5);
               }
               this.bbdc.setState(param1);
               break;
            case "walk":
               if(_loc2_.y != 6)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(6);
               }
               this.bbdc.setState(param1);
               break;
            case "hurt":
               if(_loc2_.y != 4)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(param1);
               break;
            case "hit1":
               if(_loc2_.y != 5)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(5);
               }
               this.bbdc.setState(param1);
               break;
            case "hit2_1":
               if(_loc2_.y != 1)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(1);
               }
               this.bbdc.setState(param1);
               break;
            case "hit2_2":
               if(_loc2_.y != 2)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(2);
               }
               this.bbdc.setState(param1);
               break;
            case "hit3":
               if(_loc2_.y != 3)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(3);
               }
               this.bbdc.setState(param1);
               break;
            case "dead":
               if(_loc2_.y != 0)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(0);
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
            case "hit2_1":
               this.setAction("hit2_2");
               break;
            case "hit2_2":
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
            case "hit1":
               break;
            case "hit2_1":
               if(param1.x == 3)
               {
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     this.doHit2(_loc3_);
                  }
               }
               break;
            case "hit2_2":
               if(param1.x == 3)
               {
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     this.doHit2(_loc3_);
                  }
                  break;
               }
            case "hit3":
               if(param1.x == 5)
               {
                  if(this.bbdc.getCurFrameCount() == 25)
                  {
                     this.doHit3(_loc3_);
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
         this.setAction("hit2_1");
         this.lastHit = "hit2_1";
      }
      
      override protected function releSkill2() : void
      {
         this.faceToTarget();
         this.newAttackId();
         this.setAction("hit3");
         this.lastHit = "hit3";
      }
      
      private function doHit2(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = null;
         _loc2_ = null;
         _loc2_ = null;
         _loc2_ = new SpecialEffectBullet("Monster101Bullet1");
         _loc2_.x = this.x;
         _loc2_.y = this.y - 100;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit2");
         _loc2_.rotation = this.gettwoobjangle(this,this.curAttackTarget,param1);
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHit3(param1:uint) : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster101Bullet2");
         _loc2_.x = this.x;
         _loc2_.y = this.getFootBottom() - 30;
         _loc2_.setRole(this);
         _loc2_.setHurtCanCutDownEffect(false);
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setDestroyInCount(gc.frameClips * 5);
         _loc2_.setDisable();
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit1");
         _loc2_.setFuncWhenDestroy(this.hit3over);
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
         this.dhfr = true;
      }
      
      private function hit3over(param1:BaseBullet) : *
      {
         this.dhfr = false;
      }
      
      override public function reduceHp(param1:int, param2:Boolean = false) : void
      {
         if(this.curAction == "hit1" || this.curAction == "hit2_1" || this.curAction == "hit2_2" || this.curAction == "hit3")
         {
            param2 = false;
         }
         if(this.dhfr)
         {
            if(this.curAttackTarget)
            {
               if(this.curAttackTarget is BaseHero)
               {
                  BaseHero(this.curAttackTarget).reduceHp(param1 / 5);
                  BaseHero(this.curAttackTarget).addCurAddEffect([{
                     "name":BaseAddEffect.STUN,
                     "time":gc.frameClips * 5
                  }]);
               }
            }
         }
         super.reduceHp(param1,param2);
      }
      
      override public function setAttackBack(param1:Point) : void
      {
         if(!(this.curAction == "hit1" || this.curAction == "hit2_1" || this.curAction == "hit2_2" || this.curAction == "hit3"))
         {
            super.setAttackBack(param1);
         }
      }
      
      override protected function move() : void
      {
         super.move();
      }
      
      override public function isAttacking() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2_1" || this.curAction == "hit2_2" || this.curAction == "hit3";
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
   }
}

