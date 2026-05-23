package export.monster
{
   import base.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   import my.*;
   
   public class Monster42 extends BaseMonster
   {
      
      private var buffCount:uint = 20;
      
      public function Monster42()
      {
         super();
         this.horizenSpeed = 5;
         this.setHp(324456);
         this.setSHp(324456);
         this.normalAttackRate = 0.6;
         this.protectedParamsObject.mysee = 5 * 60;
         this.protectedParamsObject.isattback = 50;
         this.attackRange = 200;
         this.alertRange = 1000;
         this.protectedParamsObject.def = 975;
         this.protectedParamsObject.exp = 300;
         this.protectedParamsObject.gxp = 80;
         this.protectedParamsObject.mDef = 0.4;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":24,
            "power":2109,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-5,0],
            "attackInterval":999,
            "power":1947,
            "attackKind":"magic",
            "addEffect":[{
               "name":BaseAddEffect.MONSTER42_REDUCE_HP,
               "time":2
            }]
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-15,0],
            "attackInterval":5,
            "power":389,
            "attackKind":"magic"
         };
         this.isBoss = true;
         this.monsterName = "穷奇";
         this.setAction("wait");
         this.protectedParamsObject.probability = 0.4;
         this.fallList = [];
         this.skillCD1 = [gc.frameClips * 5,gc.frameClips * 7];
         this.skillCD2 = [gc.frameClips * 2,gc.frameClips * 4.5];
         this.skillCD3 = [gc.frameClips * 3,gc.frameClips * 8];
         this.skillCD4 = [gc.frameClips * 4,gc.frameClips * 8];
         this.fallList = [{
            "name":"wpqhs4",
            "bigtype":"dj"
         }];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster42");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],550,5 * 60,new Point(0,0));
            bbdc.setOffsetXY(15,-5);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[15],[2,2,2,2,10],[2,2,11,2,24],[2,2,10],[2,2,2,10]]);
            bbdc.setFrameCount([6,4,1,5,5,3,4]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster42--BitmapData Error!");
      }
      
      override protected function newColipse() : void
      {
         this.colipse = AUtils.getNewObj("Monster42BaseObject") as Sprite;
         this.colipse.visible = false;
         this.colipse.scaleX = 0.5;
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
               if(_loc2_.y != 6)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(6);
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
            case "hit3":
               if(_loc2_.y != 5)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(5);
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
            case "hit2":
               this.setStatic();
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
               if(param1.x == 3)
               {
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     this.doHi1(_loc3_);
                  }
               }
               break;
            case "hit2":
               if(param1.x == 0)
               {
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     this.doHi2(_loc3_);
                  }
               }
               if(param1.x == 4)
               {
                  if(this.getBBDC().getDirect() == 0)
                  {
                     this.speed.x = -30;
                     break;
                  }
                  this.speed.x = 30;
                  break;
               }
               this.speed.x = 0;
               break;
            case "hit3":
               if(param1.x == 2)
               {
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     this.doHi3(_loc3_);
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
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 400;
      }
      
      override protected function releSkill1() : void
      {
         this.newAttackId();
         this.setYourFather(30);
         this.setAction("hit2");
         this.lastHit = "hit2";
         this.faceToTarget();
      }
      
      override protected function releSkill2() : void
      {
         this.newAttackId();
         this.setYourFather(20);
         this.setAction("hit3");
         this.lastHit = "hit3";
         this.faceToTarget();
      }
      
      private function doHi1(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster42Bullet1");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 190;
         }
         else
         {
            _loc2_.x = this.x + 190;
         }
         _loc2_.y = this.y - 75;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHi2(param1:uint) : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster42Bullet2");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 150;
         }
         else
         {
            _loc2_.x = this.x + 150;
         }
         _loc2_.y = this.y - 200;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit2");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHi3(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster42Bullet3");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 150;
         }
         else
         {
            _loc2_.x = this.x + 150;
         }
         _loc2_.y = this.y + 60;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit3");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      override protected function exitFrameFunc(param1:Point) : void
      {
      }
      
      override public function isCanMoveWhenAttack() : Boolean
      {
         return this.curAction == "hit2";
      }
      
      override protected function myIntelligence() : void
      {
         if(!this.isBeAttacking())
         {
            super.myIntelligence();
         }
         if(this.buffCount > 0)
         {
            --this.buffCount;
            if(this.buffCount == 0)
            {
               this.checkHeroBuff();
               this.buffCount = 20;
            }
         }
      }
      
      private function checkHeroBuff() : void
      {
         var _loc1_:* = null;
         var _loc2_:Number = Number(NaN);
         for each(_loc1_ in gc.getPlayerArray())
         {
            if(!(Boolean(_loc1_.curAddEffect.curDebuff(BaseAddEffect.MONSTER42_GREEN)) || Boolean(_loc1_.curAddEffect.curDebuff(BaseAddEffect.MONSTER42_BLUE))))
            {
               _loc2_ = AUtils.GetDisBetweenTwoObj(_loc1_,this);
               if(_loc2_ <= 200)
               {
                  if(Math.random() <= 0.5)
                  {
                     _loc1_.curAddEffect.add([{
                        "name":BaseAddEffect.MONSTER42_GREEN,
                        "time":gc.frameClips
                     }]);
                  }
                  else
                  {
                     _loc1_.curAddEffect.add([{
                        "name":BaseAddEffect.MONSTER42_BLUE,
                        "time":gc.frameClips
                     }]);
                  }
               }
            }
         }
      }
      
      override public function destroy() : void
      {
         var _loc1_:* = null;
         var _loc2_:int = 0;
         var _loc3_:* = null;
         MainGame.getInstance().createLikeMonster(74,this.x,this.y - 50);
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

