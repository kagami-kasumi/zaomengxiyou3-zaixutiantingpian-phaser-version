package export.monster
{
   import base.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.events.Event;
   import flash.geom.*;
   import my.*;
   
   public class Monster22 extends BaseMonster
   {
      
      private var atkUpCount:uint = 0;
      
      public function Monster22()
      {
         super();
         this.horizenSpeed = 4;
         this.monsterName = "二郎神";
         this.isBoss = true;
         this.setHp(69118);
         this.setSHp(69118);
         this.protectedParamsObject.mysee = 5 * 60;
         this.protectedParamsObject.isattback = 50;
         this.attackRange = 250;
         this.alertRange = 1000;
         this.protectedParamsObject.def = 110;
         this.protectedParamsObject.mDef = 0.35;
         this.protectedParamsObject.exp = 430;
         this.protectedParamsObject.gxp = 210;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":999,
            "power":646,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-35,-4],
            "attackInterval":666,
            "power":420,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-4,2],
            "attackInterval":12,
            "power":140,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-10,2],
            "attackInterval":15,
            "power":215,
            "attackKind":"magic"
         };
         this.setAction("wait");
         this.skillCD1 = [gc.frameClips * 1,gc.frameClips * 6];
         this.skillCD2 = [gc.frameClips * 1,gc.frameClips * 5];
         this.skillCD3 = [gc.frameClips * 1,gc.frameClips * 16];
         this.protectedParamsObject.probability = 0.45;
         this.fallList = [{
            "name":"shsjt",
            "bigtype":"zb"
         }];
      }
      
      override protected function __added(param1:Event) : void
      {
         super.__added(param1);
         MainGame.getInstance().createMonster(23,this.x,this.y);
      }
      
      public function setAtkUp() : void
      {
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":666,
            "power":775,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-35,-4],
            "attackInterval":666,
            "power":504,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-4,2],
            "attackInterval":12,
            "power":168,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-10,2],
            "attackInterval":15,
            "power":258,
            "attackKind":"magic",
            "addEffect":[{
               "name":BaseAddEffect.ERLANGSHEN_HP_REJECT,
               "time":gc.frameClips * 8
            }]
         };
         this.atkUpCount = uint(uint(uint(uint(gc.frameClips * 10))));
      }
      
      private function resetAtk() : void
      {
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":999,
            "power":646,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-35,-4],
            "attackInterval":666,
            "power":420,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-4,2],
            "attackInterval":12,
            "power":140,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-10,2],
            "attackInterval":15,
            "power":215,
            "attackKind":"magic",
            "addEffect":[{
               "name":BaseAddEffect.ERLANGSHEN_HP_REJECT,
               "time":gc.frameClips * 8
            }]
         };
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster22");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],400,5 * 60,new Point(0,0));
            bbdc.setOffsetXY(22,-50);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[2,2,2,2,2,10],[2,2,10],[2,2,10],[1,1,2,1,1,2],[1,1,2,1,1,10],[2,30],[2,2,8],[15]]);
            bbdc.setFrameCount([6,4,6,3,3,6,6,2,3,1]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster22--BitmapData Error!");
      }
      
      override protected function newColipse() : void
      {
         this.colipse = AUtils.getNewObj("ObjectBaseSprite2") as Sprite;
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
               if(_loc2_.y != 9)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(9);
               }
               this.bbdc.setState(param1);
               break;
            case "hit1":
               if(_loc2_.y != 8)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(8);
               }
               this.bbdc.setState(param1);
               break;
            case "hit2_1":
               if(_loc2_.y != 3)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(3);
               }
               this.bbdc.setState(param1);
               break;
            case "hit2_2":
               if(_loc2_.y != 4)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(param1);
               break;
            case "hit3_1":
               if(_loc2_.y != 5)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(5);
               }
               this.bbdc.setState(param1);
               break;
            case "hit3_2":
               if(_loc2_.y != 6)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(6);
               }
               this.bbdc.setState(param1);
               break;
            case "hit4":
               if(_loc2_.y != 7)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(7);
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
            case "hit2_1":
               this.setPositionAfterTarget();
               this.setAction("hit2_2");
               break;
            case "hit2_2":
               this.setAction("wait");
               break;
            case "hit3_1":
               this.setAction("hit3_2");
               break;
            case "hit3_2":
               this.setAction("wait");
               break;
            case "hit4":
               this.setAction("wait");
               break;
            case "hit7":
               this.setStatic();
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
      
      private function setPositionAfterTarget() : void
      {
         if(this.curAttackTarget)
         {
            if(this.curAttackTarget.getBBDC().getDirect() == 0)
            {
               this.x = this.curAttackTarget.x + 3 * 60;
               this.turnLeft();
            }
            else
            {
               this.x = Number(this.curAttackTarget.x) - 180;
               this.turnRight();
            }
            this.y = Number(this.curAttackTarget.y) - 60;
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
                  if(this.bbdc.getCurFrameCount() == 8)
                  {
                     this.doHit1(_loc3_);
                  }
               }
               break;
            case "hit2_1":
               break;
            case "hit2_2":
               if(param1.x == 2)
               {
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     this.doHit2(_loc3_);
                  }
               }
               break;
            case "hit3_1":
               if(param1.x == 2)
               {
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     this.doHit3(_loc3_);
                  }
               }
               break;
            case "hit3_2":
               break;
            case "hit4":
               if(param1.x == 1)
               {
                  if(this.bbdc.getCurFrameCount() == 30)
                  {
                     this.doHit4_1(_loc3_);
                     break;
                  }
                  if(this.bbdc.getCurFrameCount() == 20)
                  {
                     this.checkDoHit4();
                  }
               }
         }
      }
      
      private function doHit1(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster22Bullet1");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 220;
         }
         else
         {
            _loc2_.x = this.x + 220;
         }
         _loc2_.y = this.y - 40;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHit2(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster22Bullet2");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 140;
         }
         else
         {
            _loc2_.x = this.x + 140;
         }
         _loc2_.y = this.y - 160;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit2");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      override protected function releSkill1() : void
      {
         this.newAttackId();
         this.setYourFather(24);
         this.setAction("hit2_1");
         this.lastHit = "hit2_1";
         this.faceToTarget();
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         return this.curAttackTarget != null;
      }
      
      override protected function releSkill2() : void
      {
         this.newAttackId();
         this.setYourFather(26);
         this.setAction("hit3_1");
         this.lastHit = "hit3_1";
         this.faceToTarget();
      }
      
      override protected function beforeSkill2Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this,this.curAttackTarget) <= 5 * 60;
      }
      
      override protected function releSkill3() : void
      {
         this.newAttackId();
         this.setAction("hit4");
         this.lastHit = "hit4";
         this.faceToTarget();
      }
      
      override protected function beforeSkill3Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this,this.curAttackTarget) <= 500;
      }
      
      private function doHit3(param1:uint) : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster22Bullet3");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 140;
         }
         else
         {
            _loc2_.x = this.x + 140;
         }
         _loc2_.y = this.y - 160;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit3");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHit4_1(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster22Bullet4_1");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 170;
         }
         else
         {
            _loc2_.x = this.x + 170;
         }
         _loc2_.y = this.y - 160;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit4");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function checkDoHit4() : void
      {
         var _loc1_:* = null;
         var _loc2_:Boolean = false;
         for each(_loc1_ in gc.getPlayerArray())
         {
            _loc2_ = false;
            if(this.x > _loc1_.x)
            {
               if(this.getBBDC().getDirect() == 0 && _loc1_.getBBDC().getDirect() == 1)
               {
                  _loc2_ = true;
               }
            }
            else if(this.getBBDC().getDirect() == 1 && _loc1_.getBBDC().getDirect() == 0)
            {
               _loc2_ = true;
            }
            if(_loc2_)
            {
               _loc1_.addCurAddEffect([{
                  "name":BaseAddEffect.ERLANGSHEN_HP_REJECT,
                  "time":gc.frameClips * 30
               }]);
               break;
            }
         }
      }
      
      override protected function exitFrameFunc(param1:Point) : void
      {
      }
      
      override public function isAttacking() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2_1" || this.curAction == "hit2_2" || this.curAction == "hit3_1" || this.curAction == "hit3_2" || this.curAction == "hit4";
      }
      
      override protected function myIntelligence() : void
      {
         if(!this.isBeAttacking())
         {
            super.myIntelligence();
         }
         if(this.atkUpCount > 0)
         {
            --this.atkUpCount;
            if(this.atkUpCount == 0)
            {
               this.resetAtk();
            }
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

