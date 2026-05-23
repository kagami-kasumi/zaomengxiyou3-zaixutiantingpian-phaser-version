package export.monster
{
   import base.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.events.Event;
   import flash.geom.*;
   import mvc.controllor.*;
   import my.*;
   
   public class Monster186 extends BaseMonster
   {
      
      private var _m187:Monster187;
      
      private var _186Bullet3:Monster186Bullet = null;
      
      public function Monster186()
      {
         super();
         this.normalAttackRate = 0.8;
         this.horizenSpeed = 4;
         this.setHp(3990000);
         this.setSHp(3990000);
         this.attackRange = 250;
         this.alertRange = 1000;
         this.protectedParamsObject.def = 2038;
         this.protectedParamsObject.exp = 5000;
         this.protectedParamsObject.gxp = 2000;
         this.protectedParamsObject.mDef = 0.45;
         this.protectedParamsObject.Dodge = 10;
         this.protectedParamsObject.Toughness = 15;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-6,-5],
            "attackInterval":10,
            "power":7300,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-3,0],
            "attackInterval":999,
            "power":7254,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-3,0],
            "attackInterval":24,
            "power":7254 * 0.7,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-13,0],
            "attackInterval":8,
            "power":7300 * 0.28,
            "attackKind":"magic"
         };
         this.isBoss = true;
         this.monsterName = "蚊妖";
         this.setAction("wait");
         this.protectedParamsObject.probability = 0.3;
         this.fallList = [{
            "name":"wpfbyyin",
            "bigtype":"dj"
         }];
         this.skillCD1 = [gc.frameClips * 2,gc.frameClips * 6.4];
         this.skillCD2 = [gc.frameClips * 3,gc.frameClips * 7.2];
         this.skillCD3 = [gc.frameClips * 4,gc.frameClips * 8.1];
         this.skillCD4 = [gc.frameClips * 2.5,gc.frameClips * 6.4];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:Object = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster186");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],370,300,new Point(0,0));
            bbdc.setOffsetXY(0,-35);
            bbdc.setFrameStopCount([[3,3,3,3,3,3],[4,4,4,4],[8],[2,2,2,2,2,10],[2,2],[2,2,10],[30],[30]]);
            bbdc.setFrameCount([6,4,1,6,14,3,1,1]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster186--BitmapData Error!");
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
            case "hit4":
               if(_loc2_.y != 7)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(7);
               }
               this.bbdc.setState(param1);
               break;
            case "dead":
               this.setStatic();
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
         var _loc2_:String = String(this.bbdc.getState());
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
         var _loc2_:int = 0;
         var _loc3_:String = String(this.bbdc.getState());
         var _loc4_:uint = uint(this.getBBDC().getDirect());
         switch(_loc3_)
         {
            case "hit1":
               _loc2_ = int(this.bbdc.getCurKeyFrameIndex());
               if(_loc2_ == 0)
               {
                  if(param1.x == 0)
                  {
                     if(this.bbdc.getCurFrameCount() == 2)
                     {
                        this.doHi1(_loc4_);
                     }
                  }
               }
               break;
            case "hit2":
               if(param1.x == 2)
               {
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     this.doHi2(_loc4_);
                  }
               }
               break;
            case "hit3":
               if(param1.x == 0)
               {
                  if(this.bbdc.getCurFrameCount() == 30)
                  {
                     this.doHi3(_loc4_);
                  }
               }
               break;
            case "hit4":
               if(param1.x == 0)
               {
                  if(this.bbdc.getCurFrameCount() == 30)
                  {
                     this.doHi4(_loc4_);
                  }
                  if(_loc4_ == 0)
                  {
                     this.speed.x = -20;
                  }
                  else
                  {
                     this.speed.x = 20;
                  }
               }
         }
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 600;
      }
      
      override protected function beforeSkill2Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 400;
      }
      
      override protected function beforeSkill3Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 400;
      }
      
      override protected function releSkill1() : void
      {
         this.newAttackId();
         this.faceToTarget();
         this.setYourFather(20);
         this.setAction("hit2");
         this.lastHit = "hit2";
      }
      
      override protected function releSkill2() : void
      {
         this.newAttackId();
         this.faceToTarget();
         this.setYourFather(10);
         this.setAction("hit3");
         this.lastHit = "hit3";
      }
      
      override protected function releSkill3() : void
      {
         this.newAttackId();
         this.faceToTarget();
         this.setYourFather(35);
         this.setAction("hit4");
         this.lastHit = "hit4";
      }
      
      private function doHi1(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster186Bullet1");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 300;
         }
         else
         {
            _loc2_.x = this.x + 300;
         }
         _loc2_.y = this.y - 210;
         _loc2_.setHurtCanCutDownEffect(true);
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setDestroyInCount(30);
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHi2(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster186Bullet2");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 205;
         }
         else
         {
            _loc2_.x = this.x + 205;
         }
         _loc2_.y = this.y - 45;
         _loc2_.setDisable();
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setDestroyInCount(10);
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit2");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
         _loc2_.setFuncWhenDestroy(this.callMonster187);
      }
      
      private function callMonster187(param1:BaseBullet) : void
      {
         if(!this.isDead() && !this._m187)
         {
            this._m187 = MainGame.getInstance().createMonster(187,param1.x,param1.y - 30) as Monster187;
            this._m187.addEventListener("monsterdestroy",this.m187Destroy);
            gc.gameSence.addChild(this._m187);
         }
      }
      
      protected function m187Destroy(param1:Event) : void
      {
         this._m187.removeEventListener("monsterdestroy",this.m187Destroy);
         this._m187 = null;
      }
      
      private function doHi3(param1:uint) : void
      {
         var _loc2_:* = 0;
         var _loc3_:int = 1;
         if(this.getHp() / this.getSHp() < 0.25)
         {
            _loc3_ = 4;
         }
         else if(this.getHp() / this.getSHp() < 0.5)
         {
            _loc3_ = 3;
         }
         else if(this.getHp() / this.getSHp() < 0.75)
         {
            _loc3_ = 2;
         }
         _loc2_ = 0;
         while(_loc2_ < _loc3_)
         {
            this.dosingleHit3((_loc2_ + 1) * gc.frameClips * 5);
            _loc2_++;
         }
      }
      
      private function dosingleHit3(param1:int) : void
      {
         var _loc2_:Monster186Bullet = new Monster186Bullet("Monster186Bullet3");
         var _loc3_:Number = this.x + (Math.random() - 0.5) * 800;
         _loc2_.x = _loc3_;
         _loc2_.y = 440;
         _loc2_.taraget = gc.getRandomPlayer();
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setDestroyInCount(param1);
         _loc2_.setDistance(9999);
         _loc2_.setRole(this);
         _loc2_.setDirect(0);
         _loc2_.setAction("hit3");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHi4(param1:uint) : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster186Bullet4");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 135;
         }
         else
         {
            _loc2_.x = this.x + 135;
         }
         _loc2_.y = this.y - 120;
         _loc2_.setHurtCanCutDownEffect(false);
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setDestroyInCount(30);
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit4");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
         _loc2_.setFuncWhenHit(this.hit4Hit);
      }
      
      private function hit4Hit(param1:BaseBullet) : void
      {
         if(!this.isDead())
         {
            this.cureHp(param1.finallHurt);
         }
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
      
      override public function isAttacking() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3" || this.curAction == "hit4";
      }
      
      override public function isCanMoveWhenAttack() : Boolean
      {
         return this.curAction == "hit4";
      }
      
      override public function destroy() : void
      {
         var _loc1_:Array = null;
         var _loc2_:int = 0;
         var _loc3_:MovieClip = null;
         if(this.getHp() <= 0)
         {
            if(this._m187)
            {
               this._m187.removeEventListener("monsterdestroy",this.m187Destroy);
               this._m187.destroy();
               this._m187 = null;
               MainGame.getInstance().createMonster(186,this.x,this.y);
            }
            else if(this.isBoss)
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
         super.destroy();
      }
   }
}

