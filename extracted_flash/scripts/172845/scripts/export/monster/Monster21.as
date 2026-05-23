package export.monster
{
   import base.*;
   import com.greensock.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   
   public class Monster21 extends BaseMonster
   {
      
      public function Monster21()
      {
         super();
         this.horizenSpeed = 4;
         this.monsterName = "朱子真";
         if(gc.curStage == 3 && gc.curLevel == 3 || gc.curStage == 8)
         {
            this.setHp(61793);
            this.setSHp(61793);
            this.isBoss = false;
         }
         else
         {
            this.setHp(61793);
            this.setSHp(61793);
            this.isBoss = true;
         }
         this.protectedParamsObject.mysee = 5 * 60;
         this.protectedParamsObject.isattback = 50;
         this.attackRange = 250;
         this.alertRange = 1000;
         this.protectedParamsObject.def = 80;
         this.protectedParamsObject.mDef = 0.3;
         this.protectedParamsObject.exp = 280;
         this.protectedParamsObject.gxp = 140;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":999,
            "power":396,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[0,0],
            "attackInterval":24,
            "power":115,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-10,2],
            "attackInterval":999,
            "power":288,
            "attackKind":"magic",
            "addEffect":[{
               "name":BaseAddEffect.STUN,
               "time":gc.frameClips * 2
            }]
         };
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-10,2],
            "attackInterval":24,
            "power":172,
            "attackKind":"magic"
         };
         this.setAction("wait");
         this.skillCD1 = [gc.frameClips * 1,gc.frameClips * 5];
         this.skillCD2 = [gc.frameClips * 1,gc.frameClips * 6];
         this.skillCD3 = [gc.frameClips * 1,gc.frameClips * 5];
         this.protectedParamsObject.probability = 0.5;
         this.fallList = [{
            "name":"zjksf",
            "bigtype":"zb"
         },{
            "name":"zjqj",
            "bigtype":"zb"
         },{
            "name":"zjxmc",
            "bigtype":"zb"
         },{
            "name":"jxztp",
            "bigtype":"zb"
         }];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster21");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],400,5 * 60,new Point(0,0));
            bbdc.setOffsetXY(15,-50);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[15],[2,2,2,2,2,10],[2,2,2,3,3,3,3,12],[2,2,1,1,20],[2,2,31,20],[2,2,5,15]]);
            bbdc.setFrameCount([6,4,1,6,8,5,4,4]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster21--BitmapData Error!");
      }
      
      override protected function newColipse() : void
      {
         this.colipse = AUtils.getNewObj("ObjectBaseSprite5") as Sprite;
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
               if(_loc2_.y != 7)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(7);
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
            case "hit4":
               if(_loc2_.y != 6)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(6);
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
               this.setAction("wait");
               break;
            case "hit3":
               this.setAction("wait");
               break;
            case "hit4":
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
                  if(this.bbdc.getCurFrameCount() == 15)
                  {
                     this.doHit1(_loc3_);
                  }
               }
               break;
            case "hit2":
               if(param1.x == 0)
               {
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     this.doHit2(_loc3_);
                  }
               }
               break;
            case "hit3":
               if(param1.x == 2)
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     this.doHit3(_loc3_);
                  }
               }
               break;
            case "hit4":
               if(param1.x == 2)
               {
                  if(this.bbdc.getCurFrameCount() == 31)
                  {
                     this.doHit4_1(_loc3_);
                  }
                  break;
               }
               if(param1.x == 3)
               {
                  if(this.bbdc.getCurFrameCount() == 20)
                  {
                     this.doHit4_2(_loc3_);
                  }
               }
         }
      }
      
      private function doHit1(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster21Bullet1");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 300;
         }
         else
         {
            _loc2_.x = this.x + 5 * 60;
         }
         _loc2_.y = this.y - 180;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      override protected function releSkill1() : void
      {
         this.newAttackId();
         this.setYourFather(15);
         this.setAction("hit2");
         this.lastHit = "hit2";
         this.faceToTarget();
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 200;
      }
      
      override protected function releSkill2() : void
      {
         this.newAttackId();
         this.setYourFather(20);
         this.setAction("hit3");
         this.lastHit = "hit3";
         this.faceToTarget();
      }
      
      override protected function beforeSkill2Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 300;
      }
      
      override protected function releSkill3() : void
      {
         this.newAttackId();
         this.setYourFather(40);
         this.setAction("hit4");
         this.lastHit = "hit4";
         this.faceToTarget();
      }
      
      override protected function beforeSkill3Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 10 * 60;
      }
      
      private function doHit2(param1:uint) : void
      {
         var _loc2_:* = null;
         var _loc3_:* = null;
         for each(_loc2_ in gc.getPlayerArray())
         {
            TweenMax.to(_loc2_,1,{
               "x":this.x,
               "y":this.y - 50
            });
         }
         _loc3_ = new SpecialEffectBullet("Monster21Bullet2");
         if(param1 == 0)
         {
            _loc3_.x = this.x - 130;
         }
         else
         {
            _loc3_.x = this.x + 130;
         }
         _loc3_.y = this.y - 220;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit2");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit3(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster21Bullet3");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 320;
         }
         else
         {
            _loc2_.x = this.x + 320;
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
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster21Bullet4_1");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 45;
         }
         else
         {
            _loc2_.x = this.x + 45;
         }
         _loc2_.y = this.y - 304;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit4");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHit4_2(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster21Bullet4_2");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 300;
         }
         else
         {
            _loc2_.x = this.x + 5 * 60;
         }
         _loc2_.y = this.y - 220;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit4");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      override protected function exitFrameFunc(param1:Point) : void
      {
      }
      
      override public function isAttacking() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3" || this.curAction == "hit4";
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

