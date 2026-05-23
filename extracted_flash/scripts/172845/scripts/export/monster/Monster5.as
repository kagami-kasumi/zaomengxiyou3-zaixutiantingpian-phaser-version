package export.monster
{
   import base.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   
   public class Monster5 extends BaseMonster
   {
      
      public function Monster5()
      {
         super();
         this.normalAttackRate = 0.8;
         this.horizenSpeed = 5;
         if(gc.curStage == 3 && gc.curLevel == 3 || gc.curStage == 8)
         {
            this.setHp(24189);
            this.setSHp(24189);
            this.isBoss = false;
         }
         else
         {
            this.setHp(2788);
            this.setSHp(2788);
            this.isBoss = true;
         }
         this.protectedParamsObject.mysee = 5 * 60;
         this.protectedParamsObject.isattback = 50;
         this.attackRange = 250;
         this.alertRange = 1000;
         this.protectedParamsObject.def = 14;
         this.protectedParamsObject.mDef = 0.2;
         this.protectedParamsObject.exp = 35;
         this.protectedParamsObject.gxp = 15;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[4,-5],
            "attackInterval":999,
            "power":147,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-5,0],
            "attackInterval":5,
            "power":26,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-4,0],
            "attackInterval":5,
            "power":26,
            "attackKind":"magic"
         };
         this.monsterName = "巨灵神";
         this.setAction("wait");
         this.protectedParamsObject.probability = 0.8;
         this.fallList = [{
            "name":"xhc",
            "bigtype":"zb"
         },{
            "name":"xhp",
            "bigtype":"zb"
         }];
         this.skillCD1 = [gc.frameClips * 2,gc.frameClips * 4.8];
         this.skillCD2 = [gc.frameClips * 1,gc.frameClips * 4.5];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster5");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],350,350,new Point(0,0));
            bbdc.setOffsetXY(30,-55);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[15],[2,2,2,2,2,14],[2,2,2,2,7],[2,2,9,2,12],[1,1,1,1]]);
            bbdc.setFrameCount([6,4,1,6,5,5,16]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster5--BitmapData Error!");
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
               if(_loc2_.y != 2)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(2);
               }
               this.bbdc.setState(param1);
               break;
            case "hit1":
               if(_loc2_.y != 4)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(param1);
               break;
            case "hit2":
               if(_loc2_.y != 5)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(5);
               }
               this.bbdc.setState(param1);
               break;
            case "hit3":
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
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     this.doHi1(_loc3_);
                  }
               }
               break;
            case "hit2":
               if(param1.x == 2)
               {
                  if(this.bbdc.getCurFrameCount() == 9)
                  {
                     this.doHi2_1(_loc3_);
                  }
                  break;
               }
               if(param1.x == 3)
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     this.doHi2_2(_loc3_);
                  }
               }
               break;
            case "hit3":
               if(param1.x == 0)
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     this.doHi3(_loc3_);
                  }
               }
         }
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 200;
      }
      
      override protected function beforeSkill2Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 400;
      }
      
      override protected function releSkill1() : void
      {
         this.newAttackId();
         this.setAction("hit2");
         this.lastHit = "hit2";
      }
      
      override protected function releSkill2() : void
      {
         this.newAttackId();
         this.setAction("hit3");
         this.lastHit = "hit3";
      }
      
      private function doHi1(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster5Bullet1");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 155;
         }
         else
         {
            _loc2_.x = this.x + 155;
         }
         _loc2_.y = this.y - 165;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHi2_1(param1:uint) : void
      {
         var _loc2_:Array = gc.getPlayerArray();
         var _loc3_:uint = Math.random() * _loc2_.length;
         var _loc4_:BaseHero = _loc2_[_loc3_] as BaseHero;
         var _loc5_:SpecialEffectBullet = new SpecialEffectBullet("Monster5Bullet2_1");
         if(param1 == 0)
         {
            _loc5_.x = this.x - 75;
         }
         else
         {
            _loc5_.x = this.x + 75;
         }
         _loc5_.y = this.y - 280;
         _loc5_.setRole(this);
         _loc5_.setDirect(param1);
         _loc5_.setAction("hit2");
         gc.gameSence.addChild(_loc5_);
         this.magicBulletArray.push(_loc5_);
      }
      
      private function doHi2_2(param1:uint) : void
      {
         var _loc2_:Array = gc.getPlayerArray();
         var _loc3_:uint = Math.random() * _loc2_.length;
         var _loc4_:BaseHero = _loc2_[_loc3_] as BaseHero;
         var _loc5_:SpecialEffectBullet = new SpecialEffectBullet("Monster5Bullet2_2");
         if(param1 == 0)
         {
            _loc5_.x = this.x - 245;
         }
         else
         {
            _loc5_.x = this.x + 245;
         }
         _loc5_.y = this.y - 95;
         _loc5_.setRole(this);
         _loc5_.setDirect(param1);
         _loc5_.setAction("hit2");
         gc.gameSence.addChild(_loc5_);
         this.magicBulletArray.push(_loc5_);
      }
      
      private function doHi3(param1:uint) : void
      {
         var _loc2_:Array = gc.getPlayerArray();
         var _loc3_:uint = Math.random() * _loc2_.length;
         var _loc4_:BaseHero = _loc2_[_loc3_] as BaseHero;
         var _loc5_:SpecialEffectBullet = new SpecialEffectBullet("Monster5Bullet3");
         if(param1 == 0)
         {
            _loc5_.x = this.x - 210;
         }
         else
         {
            _loc5_.x = this.x + 210;
         }
         _loc5_.y = this.y - 80;
         _loc5_.setRole(this);
         _loc5_.setDirect(param1);
         _loc5_.setAction("hit3");
         gc.gameSence.addChild(_loc5_);
         this.magicBulletArray.push(_loc5_);
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

