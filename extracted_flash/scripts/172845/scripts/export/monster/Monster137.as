package export.monster
{
   import base.*;
   import config.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   
   public class Monster137 extends BaseMonster
   {
      
      private var averLevel:uint = 0;
      
      private var bingoRate:Number = 0;
      
      private var isReturnHurt:Boolean = false;
      
      private var returnHurtObject:BaseObject;
      
      internal var iii:uint = 24;
      
      public function Monster137()
      {
         super();
         this.gc = Config.getInstance();
         this.averLevel = this.gc.getAverageLevel();
         if(this.averLevel > 90)
         {
            this.averLevel = 90;
         }
         this.normalAttackRate = 0.6;
         this.horizenSpeed = 6;
         var _loc1_:uint = Math.ceil(this.averLevel / 5);
         this.setHp(1000000 + _loc1_ * 10000 * (0.4 + this.averLevel * 0.01));
         this.setSHp(this.getHp());
         var _loc2_:int = this.averLevel * 20 - 150;
         if(_loc2_ < 20)
         {
            _loc2_ = 20;
         }
         if(this.averLevel >= 50)
         {
            this.bingoRate = 0.02;
            if(this.averLevel <= 60)
            {
               this.bingoRate = 0.04;
            }
            else if(this.averLevel <= 70)
            {
               this.bingoRate = 0.06;
            }
            else if(this.averLevel <= 80)
            {
               this.bingoRate = 0.08;
            }
         }
         this.attackRange = 250;
         this.alertRange = 1000;
         this.protectedParamsObject.def = 382 + this.averLevel * 1;
         this.protectedParamsObject.exp = 500;
         this.protectedParamsObject.gxp = 250;
         this.protectedParamsObject.mDef = 0.35;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-6,-5],
            "attackInterval":999,
            "power":1350,
            "attackKind":"physics",
            "addEffect":[{
               "name":BaseAddEffect.MONSTER137BUFF,
               "time":this.gc.frameClips * 7
            }]
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-3,0],
            "attackInterval":10,
            "power":1350 * 0.8,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-25,0],
            "attackInterval":999,
            "power":1136,
            "attackKind":"magic",
            "addEffect":[{
               "name":BaseAddEffect.MONSTER137BUFF,
               "time":this.gc.frameClips * 7
            }]
         };
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-25,0],
            "attackInterval":24,
            "power":1136,
            "attackKind":"magic"
         };
         this.isBoss = true;
         this.monsterName = "金吒";
         this.setAction("wait");
         this.protectedParamsObject.probability = 0.3;
         if(this.averLevel > 20)
         {
            this.fallList = [{
               "name":"wpccfq",
               "bigtype":"dj"
            }];
         }
         else
         {
            this.fallList = [];
         }
         this.skillCD1 = [gc.frameClips * 2,gc.frameClips * 16];
         this.skillCD2 = [gc.frameClips * 3,gc.frameClips * 3.5];
         this.skillCD3 = [gc.frameClips * 4,gc.frameClips * 12];
         this.skillCD4 = [gc.frameClips * 2.5,gc.frameClips * 6.4];
         this.curAddEffect.add([{
            "name":"father",
            "time":this.gc.frameClips * 1,
            "interval":1000,
            "isForever":1
         }]);
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:Object = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster137");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],300,300,new Point(0,0));
            bbdc.setOffsetXY(30,-50);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8],[2,2,2,2,10],[2,2,2,10],[5,2,10],[2,2,2,10],[48]]);
            bbdc.setFrameCount([6,4,1,5,4,3,4,1]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster137--BitmapData Error!");
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
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     this.doHit1(_loc3_);
                  }
               }
               break;
            case "hit2":
               if(param1.x == 2)
               {
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     this.doHit2(_loc3_);
                  }
               }
               break;
            case "hit3":
               if(param1.x == 3)
               {
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     this.doHit3(_loc3_);
                  }
               }
               break;
            case "hit4":
               if(param1.x == 0)
               {
                  if(this.bbdc.getCurFrameCount() == 48)
                  {
                     this.doHit4(_loc3_);
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
         return Boolean(this.curAttackTarget) && this.getHp() / this.getSHp() <= 0.75 && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 600;
      }
      
      override protected function releSkill1() : void
      {
         this.newAttackId();
         this.setYourFather(gc.frameClips);
         this.setAction("hit2");
         this.lastHit = "hit2";
      }
      
      override protected function releSkill2() : void
      {
         this.newAttackId();
         this.setYourFather(gc.frameClips);
         this.setAction("hit3");
         this.lastHit = "hit3";
      }
      
      override protected function releSkill3() : void
      {
         this.newAttackId();
         this.setYourFather(gc.frameClips);
         this.setAction("hit4");
         this.lastHit = "hit4";
      }
      
      private function doHit1(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster137Bullet1");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 190;
         }
         else
         {
            _loc2_.x = this.x + 190;
         }
         _loc2_.y = this.y - 115;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit1");
         this.gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHit2(param1:uint) : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster137Bullet2");
         _loc2_.x = this.x;
         _loc2_.y = this.y;
         _loc2_.setRole(this);
         _loc2_.setDisable();
         _loc2_.setHurtCanCutDownEffect(false);
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setDestroyInCount(this.gc.frameClips * 5);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit2");
         this.gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHit3(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = null;
         var _loc3_:uint = 0;
         while(_loc3_ < 6)
         {
            _loc2_ = new SpecialEffectBullet("Monster137Bullet3");
            if(param1 == 0)
            {
               _loc2_.x = this.x - 135 - (_loc3_ - 1) * 90;
            }
            else
            {
               _loc2_.x = this.x + 135 + (_loc3_ - 1) * 90;
            }
            _loc2_.y = this.y + 50;
            _loc2_.setRole(this);
            _loc2_.setDirect(param1);
            _loc2_.setBingoRate(this.bingoRate);
            _loc2_.setAction("hit3");
            this.gc.gameSence.addChild(_loc2_);
            this.magicBulletArray.push(_loc2_);
            _loc3_++;
         }
      }
      
      private function doHit4(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster137Bullet4");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 90;
         }
         else
         {
            _loc2_.x = this.x + 90;
         }
         _loc2_.y = this.y - 80;
         _loc2_.setRole(this);
         _loc2_.setDisable();
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setDestroyInCount(this.gc.frameClips * 2);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit4");
         this.cureHp((this.getSHp() - this.getHp()) * 0.02);
         this.gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      override protected function exitFrameFunc(param1:Point) : void
      {
      }
      
      override public function beMagicAttack(param1:BaseBullet, param2:BaseObject, param3:Boolean = false) : Boolean
      {
         var _loc4_:BaseBullet = null;
         this.isReturnHurt = false;
         for each(_loc4_ in this.magicBulletArray)
         {
            if(_loc4_.getImcName() == "Monster137Bullet2")
            {
               this.returnHurtObject = param2;
               this.isReturnHurt = true;
               break;
            }
         }
         return Boolean(super.beMagicAttack(param1,param2,param3));
      }
      
      override public function setAttackBack(param1:Point) : void
      {
         if(this.curAction == "hit4")
         {
            return;
         }
         super.setAttackBack(param1);
      }
      
      override public function reduceHp(param1:int, param2:Boolean = false) : void
      {
         if(this.isReturnHurt)
         {
            this.returnHurtObject.reduceHp(param1);
            this.isReturnHurt = false;
         }
         if(this.curAction == "hit4")
         {
            param2 = false;
            param1 *= 0.1;
         }
         super.reduceHp(param1,param2);
      }
      
      override protected function myIntelligence() : void
      {
         var _loc1_:BaseHero = null;
         var _loc2_:BaseBullet = null;
         if(!this.isBeAttacking())
         {
            super.myIntelligence();
         }
         if(this.averLevel > 50)
         {
            if(this.iii > 0)
            {
               --this.iii;
               if(this.iii == 0)
               {
                  this.cureHp(this.getSHp() / 1000);
                  this.iii = this.gc.frameClips;
               }
            }
         }
         for each(_loc1_ in this.gc.getPlayerArray())
         {
            if(AUtils.GetDisBetweenTwoObj(_loc1_,this) >= 300)
            {
               for each(_loc2_ in _loc1_.magicBulletArray)
               {
                  if(AUtils.GetDisBetweenTwoObj(_loc2_,this) <= 150)
                  {
                     if(!this.isAttacking() && !this.isBeAttacking())
                     {
                        this.releSkill3();
                        break;
                     }
                  }
               }
            }
         }
      }
      
      override public function isAttacking() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3" || this.curAction == "hit4";
      }
      
      override public function destroy() : void
      {
         var _loc1_:Array = null;
         var _loc2_:int = 0;
         var _loc3_:MovieClip = null;
         super.destroy();
         this.returnHurtObject = null;
         if(Math.random() <= 0.3 && this.getHp() <= 0)
         {
            if(Math.random() <= 0.5)
            {
               this.gc.putQhsInBackPack(this.gc.player1,"wpccfq",2);
               this.gc.ts.setTxt("获得传承法器x2");
               this.gc.stage.addChild(this.gc.ts);
            }
            else
            {
               this.gc.putQhsInBackPack(this.gc.player1,"wpccfq",2);
               this.gc.ts.setTxt("获得传承法器x2");
               this.gc.stage.addChild(this.gc.ts);
            }
         }
         if(this.getHp() <= 0)
         {
            if(this.isBoss)
            {
               _loc1_ = this.gc.pWorld.getTransferDoorArray();
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

