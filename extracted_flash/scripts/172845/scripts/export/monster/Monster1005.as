package export.monster
{
   import base.*;
   import com.greensock.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.events.*;
   import flash.geom.*;
   import my.*;
   
   public class Monster1005 extends BaseMonster
   {
      
      private var normalhit:int = 0;
      
      private var ishit5:Boolean;
      
      public function Monster1005()
      {
         super();
         this.horizenSpeed = 5;
         this.setHp(1000000 * 0.9);
         this.setSHp(1000000 * 0.9);
         this.protectedParamsObject.mysee = 300;
         this.protectedParamsObject.isattback = 50;
         this.attackRange = 250;
         this.alertRange = 1000;
         this.normalAttackRate = 0.65;
         this.protectedParamsObject.def = 941;
         this.protectedParamsObject.mDef = 0.4;
         this.protectedParamsObject.exp = 200;
         this.protectedParamsObject.gxp = 200;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-3],
            "attackInterval":12,
            "power":1875 * 0.7,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[2,-4],
            "attackInterval":999,
            "power":1875,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":999,
            "power":1875,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":999,
            "power":1875,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit5"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":999,
            "power":1875,
            "attackKind":"magic"
         };
         this.isBoss = true;
         this.monsterName = "罗睺元神";
         this.setAction("wait");
         this.protectedParamsObject.probability = 1;
         this.fallList = [{
            "name":"zsTimer",
            "bigtype":"zb"
         }];
         this.skillCD1 = [gc.frameClips * 2,gc.frameClips * 6.4];
         this.skillCD2 = [gc.frameClips * 3,gc.frameClips * 7.2];
         this.skillCD3 = [gc.frameClips * 4,gc.frameClips * 8.1];
         this.skillCD4 = [gc.frameClips * 2.5,gc.frameClips * 6.4];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster1005");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],1050,1000,new Point(0,0));
            bbdc.setOffsetXY(-120,-50);
            bbdc.setFrameStopCount([[2,2,4,2,2,4],[3,3,4,3,3,4],[15],[1,2,2,6],[1,1,1,1,5,2,5,1,1,3,2,4,1,1,4,2,4,2,4,2,4,1,1,5,2,2,2,2,2,8],[1,3,12,32],[1,1,1,1,1,1,8,2,16,1,1,1,1,1,9,2,19],[1,1,1,1,1,12,1,2,24],[1,1,1,5,2,78],[1,1,1,1,1,1,1,1,1,69,1,1,1,1,1]]);
            bbdc.setFrameCount([6,6,1,4,30,4,17,9,6,15]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster1005--BitmapData Error!");
      }
      
      override protected function newColipse() : void
      {
         this.colipse = AUtils.getNewObj("ObjectBaseSprite5") as Sprite;
         this.colipse.visible = false;
         this.colipse.scaleY = 2.2;
         this.colipse.scaleX = 2.2;
         this.addChild(this.colipse);
      }
      
      override public function setAction(param1:String) : void
      {
         super.setAction(param1);
         var _loc2_:Point = this.bbdc.getCurPoint();
         switch(param1)
         {
            case "walk":
               if(_loc2_.y != 0)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(0);
               }
               this.bbdc.setState(param1);
               break;
            case "wait":
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
            case "dead":
               if(_loc2_.y != 3)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(3);
               }
               this.bbdc.setState(param1);
               break;
            case "hit1":
               if(Math.random() < 0.5)
               {
                  this.normalhit = 4;
               }
               else
               {
                  this.normalhit = 5;
               }
               if(_loc2_.y != this.normalhit)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(this.normalhit);
               }
               this.bbdc.setState(param1);
               break;
            case "hit2":
               if(_loc2_.y != 6)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(6);
               }
               this.bbdc.setState(param1);
               break;
            case "hit3":
               if(_loc2_.y != 7)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(7);
               }
               this.bbdc.setState(param1);
               break;
            case "hit4":
               if(_loc2_.y != 8)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(8);
               }
               this.bbdc.setState(param1);
               break;
            case "hit5":
               if(_loc2_.y != 9)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(9);
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
            case "hit5":
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
               if(this.normalhit == 4)
               {
                  if(param1.x == 5)
                  {
                     if(this.bbdc.getCurFrameCount() == 2)
                     {
                        this.attackBackInfoDict["hit1"].attackBackSpeed = [6,-3];
                        this.attackBackInfoDict["hit1"].attackInterval = 12;
                        this.attackBackInfoDict["hit1"].power = 1500;
                        this.doHit1_1(_loc3_);
                     }
                  }
                  break;
               }
               if(this.normalhit == 5)
               {
                  if(param1.x == 3)
                  {
                     if(this.bbdc.getCurFrameCount() == 32)
                     {
                        this.attackBackInfoDict["hit1"].attackBackSpeed = [20,-2];
                        this.attackBackInfoDict["hit1"].attackInterval = 6;
                        this.attackBackInfoDict["hit1"].power = 1000;
                        this.doHit1_2(_loc3_);
                     }
                     if(this.bbdc.getDirect() == 1)
                     {
                        this.speed.x = 20;
                        break;
                     }
                     this.speed.x = -20;
                  }
               }
               break;
            case "hit2":
               if(param1.x == 6)
               {
                  if(this.bbdc.getCurFrameCount() == 8)
                  {
                     this.doHit2(_loc3_);
                  }
               }
               break;
            case "hit3":
               if(param1.x == 7)
               {
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     this.doHit3(_loc3_);
                  }
               }
               break;
            case "hit4":
               if(param1.x == 5)
               {
                  if(this.bbdc.getCurFrameCount() == 78)
                  {
                     this.doHit4(_loc3_);
                  }
               }
               break;
            case "hit5":
               if(param1.x == 9)
               {
                  if(this.bbdc.getCurFrameCount() == 69)
                  {
                     this.doHit5(_loc3_);
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
      
      override protected function beforeSkill3Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this,this.curAttackTarget) <= 600;
      }
      
      override protected function beforeSkill4Start() : Boolean
      {
         return this.curAttackTarget;
      }
      
      override protected function releSkill1() : void
      {
         this.faceToTarget();
         this.newAttackId();
         this.setAction("hit2");
         this.lastHit = "hit2";
      }
      
      override protected function releSkill2() : void
      {
         this.faceToTarget();
         this.newAttackId();
         this.setAction("hit3");
         this.lastHit = "hit3";
      }
      
      override protected function releSkill3() : void
      {
         this.faceToTarget();
         this.newAttackId();
         this.setAction("hit4");
         this.lastHit = "hit4";
      }
      
      override protected function releSkill4() : void
      {
         this.faceToTarget();
         this.newAttackId();
         this.setAction("hit5");
         this.lastHit = "hit5";
      }
      
      private function doHit1_1(param1:uint) : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster1005Bullet1_1");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 300;
         }
         else
         {
            _loc2_.x = this.x + 300;
         }
         _loc2_.y = this.getFootBottom();
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHit1_2(param1:uint) : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster1005Bullet1_2");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 100;
         }
         else
         {
            _loc2_.x = this.x + 100;
         }
         _loc2_.y = this.getFootBottom();
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHit2(param1:uint) : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster1005hit2effect");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 150;
         }
         else
         {
            _loc2_.x = this.x + 150;
         }
         _loc2_.y = this.getFootBottom();
         _loc2_.setDisable();
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit2");
         _loc2_.addEventListener(Event.ENTER_FRAME,this.func);
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function func(param1:Event) : *
      {
         var _loc2_:SpecialEffectBullet = null;
         var _loc3_:int = 0;
         if(this.bbdc)
         {
            _loc3_ = int(this.getBBDC().getDirect());
         }
         if(param1.target.getImgMc().currentFrame == 9)
         {
            _loc2_ = new SpecialEffectBullet("Monster1005Bullet2");
            if(_loc3_ == 0)
            {
               _loc2_.x = this.x - 50;
            }
            else
            {
               _loc2_.x = this.x + 50;
            }
            _loc2_.y = this.y - 80;
            if(_loc3_ == 0)
            {
               TweenMax.to(_loc2_,0.5,{
                  "x":_loc2_.x - 350,
                  "y":450
               });
            }
            else
            {
               TweenMax.to(_loc2_,0.5,{
                  "x":_loc2_.x + 350,
                  "y":450
               });
            }
            _loc2_.setDisable();
            _loc2_.setRole(this);
            _loc2_.setDirect(_loc3_);
            gc.gameSence.addChild(_loc2_);
            this.magicBulletArray.push(_loc2_);
         }
         else if(param1.target.getImgMc().currentFrame == 40)
         {
            _loc2_ = new SpecialEffectBullet("Monster1005Bullet2");
            if(_loc3_ == 0)
            {
               _loc2_.x = this.x + 50;
            }
            else
            {
               _loc2_.x = this.x - 50;
            }
            _loc2_.y = this.y - 80;
            if(_loc3_ == 0)
            {
               TweenMax.to(_loc2_,0.5,{
                  "x":_loc2_.x - 250,
                  "y":450
               });
            }
            else
            {
               TweenMax.to(_loc2_,0.5,{
                  "x":_loc2_.x + 250,
                  "y":450
               });
            }
            _loc2_.setDisable();
            _loc2_.setRole(this);
            _loc2_.setDirect(_loc3_);
            gc.gameSence.addChild(_loc2_);
            this.magicBulletArray.push(_loc2_);
         }
         if(_loc2_)
         {
            _loc2_.setFuncWhenDestroy(this.hit2over);
         }
         if(param1.target.getImgMc().currentFrame == param1.target.getImgMc().totalFrames - 1)
         {
            param1.target.removeEventListener(Event.ENTER_FRAME,this.func);
         }
      }
      
      private function hit2over(param1:BaseBullet) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster1005Bullet2Over");
         _loc2_.x = param1.x;
         _loc2_.y = param1.y;
         _loc2_.setDirect(param1.getDirect());
         _loc2_.setRole(this);
         _loc2_.setAction("hit2");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHit3(param1:uint) : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster1005hit3effect");
         _loc2_.x = this.x;
         _loc2_.y = this.getFootBottom();
         _loc2_.setDisable();
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit2");
         MainGame.getInstance().createMonster(1006,this.x,this.y);
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHit4(param1:uint) : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster1005hit4effect");
         if(param1 == 0)
         {
            _loc2_.x = this.x + 400;
         }
         else
         {
            _loc2_.x = this.x - 400;
         }
         _loc2_.y = this.getFootBottom();
         _loc2_.setDisable();
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit4");
         _loc2_.addEventListener(Event.ENTER_FRAME,this.funchit4);
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function funchit4(param1:Event) : *
      {
         var _loc2_:SpecialEffectBullet = null;
         var _loc3_:int = 0;
         var _loc4_:Number = Number(NaN);
         if(param1.target)
         {
            if(param1.target.getImgMc().currentFrame == 25 || param1.target.getImgMc().currentFrame == 39 || param1.target.getImgMc().currentFrame == 53 || param1.target.getImgMc().currentFrame == 67)
            {
               _loc3_ = int(this.getBBDC().getDirect());
               _loc2_ = new SpecialEffectBullet("Monster1005Bullet4");
               _loc4_ = (Number(param1.target.y) - Number(this.curAttackTarget.y)) / (Number(param1.target.x) - Number(this.curAttackTarget.x));
               if(_loc3_ == 0)
               {
                  _loc2_.x = Number(param1.target.x) - 250;
               }
               else
               {
                  _loc2_.x = param1.target.x + 250;
               }
               _loc2_.y = Number(param1.target.y) - 150;
               if(_loc3_ == 1)
               {
                  _loc2_.rotation = -(Math.atan(_loc4_) / Math.PI * 180 + 10);
               }
               else
               {
                  _loc2_.rotation = Math.atan(_loc4_) / Math.PI * 180 - 10;
               }
               _loc2_.setRole(this);
               _loc2_.setDirect(_loc3_);
               _loc2_.setAction("hit4");
               gc.gameSence.addChild(_loc2_);
               this.magicBulletArray.push(_loc2_);
            }
            if(param1.target.getImgMc().currentFrame == param1.target.getImgMc().totalFrames - 1)
            {
               param1.target.removeEventListener(Event.ENTER_FRAME,this.funchit4);
            }
         }
      }
      
      private function doHit5(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster1005hit5effect");
         _loc2_.x = this.x;
         _loc2_.y = this.getFootBottom();
         _loc2_.setDisable();
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit2");
         _loc2_.setFuncWhenDestroy(this.hit5over);
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
         this.ishit5 = true;
      }
      
      private function hit5over(param1:BaseBullet) : *
      {
         this.ishit5 = false;
      }
      
      override protected function move() : void
      {
         super.move();
      }
      
      override public function reduceHp(param1:int, param2:Boolean = false) : void
      {
         if(this.ishit5)
         {
            if(this.curAttackTarget)
            {
               if(this.curAttackTarget is BaseHero)
               {
                  BaseHero(this.curAttackTarget).reduceMp(param1 / 20);
                  BaseHero(this.curAttackTarget).addCurAddEffect([{
                     "name":BaseAddEffect.POISON,
                     "time":gc.frameClips * 10,
                     "power":gc.hero1.roleProperies.getSHHP() * 0.03
                  }]);
               }
            }
         }
         super.reduceHp(param1,false);
      }
      
      override public function isAttacking() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3" || this.curAction == "hit4" || this.curAction == "hit5";
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
      
      override public function setAttackBack(param1:Point) : void
      {
      }
      
      override public function isCanMoveWhenAttack() : Boolean
      {
         return this.curAction == "hit1" && this.normalhit == 5;
      }
   }
}

