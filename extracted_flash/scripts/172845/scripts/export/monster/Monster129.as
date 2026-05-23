package export.monster
{
   import base.*;
   import com.greensock.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   
   public class Monster129 extends BaseMonster
   {
      
      private var isFirstLow90Persent:Boolean = false;
      
      private var isFirstLow60Persent:Boolean = false;
      
      private var isFirstLow30Persent:Boolean = false;
      
      internal var iii:uint = 30;
      
      public function Monster129()
      {
         super();
         this.normalAttackRate = 0.6;
         this.horizenSpeed = 6;
         this.setHp(2150000);
         this.setSHp(2150000);
         this.attackRange = 250;
         this.alertRange = 1000;
         this.protectedParamsObject.def = 1616;
         this.protectedParamsObject.exp = 5000;
         this.protectedParamsObject.gxp = 500;
         this.protectedParamsObject.mDef = 0.45;
         this.protectedParamsObject.Dodge = 10;
         this.protectedParamsObject.Toughness = 10;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-6,-5],
            "attackInterval":999,
            "power":4539,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-3,0],
            "attackInterval":999,
            "power":4539,
            "attackKind":"physics",
            "addEffect":[{
               "name":BaseAddEffect.SIDATIANWANG_SAN_MP_LOST,
               "time":gc.frameClips * 5
            }]
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[0,0],
            "attackInterval":24,
            "power":3582 * 0.66,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-25,0],
            "attackInterval":999,
            "power":3582,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit5"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[0,0],
            "attackInterval":999,
            "power":3582,
            "attackKind":"magic"
         };
         this.isBoss = true;
         this.monsterName = "吕岳";
         this.setAction("wait");
         this.protectedParamsObject.probability = 0.3;
         this.fallList = [{
            "name":"wpxty",
            "bigtype":"dj"
         }];
         this.skillCD1 = [gc.frameClips * 2,gc.frameClips * 8];
         this.skillCD2 = [gc.frameClips * 3,gc.frameClips * 6];
         this.skillCD3 = [gc.frameClips * 4,gc.frameClips * 7];
         this.skillCD4 = [gc.frameClips * 1,gc.frameClips * 12.6];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster129");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],250,250,new Point(0,0));
            bbdc.setOffsetXY(10,-25);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8],[2,2,2,2,10],[2,2,10],[14,2,2,1,1,5],[10],[2,2],[20]]);
            bbdc.setFrameCount([6,4,1,5,3,6,1,10,1]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster129--BitmapData Error!");
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
            case "hit5":
               if(_loc2_.y != 8)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(8);
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
               if(param1.x == 2)
               {
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     this.doHit1(_loc3_);
                  }
               }
               break;
            case "hit2":
               if(param1.x == 0)
               {
                  if(this.bbdc.getCurFrameCount() == 14)
                  {
                     this.doHit2_1(_loc3_);
                  }
               }
               break;
            case "hit3":
               if(param1.x == 0)
               {
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     this.doHit3(_loc3_);
                  }
               }
               break;
            case "hit4":
               if(param1.x == 1)
               {
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     this.doHit4_2(_loc3_);
                  }
                  break;
               }
               if(param1.x == 0)
               {
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     if(this.bbdc.getCurKeyFrameIndex() == 0)
                     {
                        this.doHit4_1(_loc3_);
                     }
                  }
               }
               break;
            case "hit5":
               if(param1.x == 0)
               {
                  if(this.bbdc.getCurFrameCount() == 20)
                  {
                     this.doHit5(_loc3_);
                  }
               }
         }
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         if(!this.isFirstLow60Persent)
         {
            return false;
         }
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 600;
      }
      
      override protected function beforeSkill2Start() : Boolean
      {
         return false;
      }
      
      override protected function beforeSkill3Start() : Boolean
      {
         if(!this.isFirstLow90Persent)
         {
            return false;
         }
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 400;
      }
      
      override protected function beforeSkill4Start() : Boolean
      {
         if(!this.isFirstLow30Persent)
         {
            return false;
         }
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
         this.setYourFather(20);
         this.setAction("hit3");
         this.lastHit = "hit3";
      }
      
      override protected function releSkill3() : void
      {
         this.newAttackId();
         this.faceToTarget();
         this.setYourFather(20);
         this.setAction("hit4");
         this.lastHit = "hit4";
      }
      
      override protected function releSkill4() : void
      {
         this.newAttackId();
         this.faceToTarget();
         this.setYourFather(24);
         this.setAction("hit5");
         this.lastHit = "hit5";
      }
      
      private function doHit1(param1:uint) : void
      {
         var _loc2_:* = null;
         _loc2_ = new SpecialEffectBullet("Monster129Bullet1");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 50;
         }
         else
         {
            _loc2_.x = this.x + 50;
         }
         _loc2_.y = this.y + 40;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
         _loc2_ = new SpecialEffectBullet("Monster129Bullet1");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 150;
         }
         else
         {
            _loc2_.x = this.x + 150;
         }
         _loc2_.y = this.y + 40;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
         _loc2_ = new SpecialEffectBullet("Monster129Bullet1");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 250;
         }
         else
         {
            _loc2_.x = this.x + 250;
         }
         _loc2_.y = this.y + 40;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHit2_1(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster129Bullet2_1");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 130;
         }
         else
         {
            _loc2_.x = this.x + 130;
         }
         _loc2_.y = this.y - 80;
         _loc2_.setFuncWhenDestroy(this.doHit2_2);
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit2");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHit2_2(param1:BaseBullet) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster129Bullet2_2");
         if(this.bbdc.getDirect() == 0)
         {
            _loc2_.x = this.x - 160;
         }
         else
         {
            _loc2_.x = this.x + 160;
         }
         _loc2_.y = this.y - 20;
         _loc2_.setRole(this);
         _loc2_.setDirect(this.bbdc.getDirect());
         _loc2_.setAction("hit2");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHit3(param1:uint) : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster129Bullet3");
         _loc2_.x = this.x;
         _loc2_.y = this.y;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit3");
         _loc2_.setDestroyInCount(gc.frameClips * 5);
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setHurtCanCutDownEffect(false);
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHit4_1(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster129Bullet4_1");
         if(this.bbdc.getDirect() == 0)
         {
            _loc2_.x = this.x - 40;
         }
         else
         {
            _loc2_.x = this.x + 40;
         }
         _loc2_.y = this.y - 20;
         _loc2_.setRole(this);
         _loc2_.setDisable();
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit4");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHit4_2(param1:uint) : void
      {
         var _loc2_:* = null;
         var _loc3_:* = null;
         var _loc4_:SpecialEffectBullet = new SpecialEffectBullet("Monster129Bullet4_2");
         if(param1 == 0)
         {
            _loc4_.x = this.x - 145;
         }
         else
         {
            _loc4_.x = this.x + 145;
         }
         _loc4_.y = this.y - 20;
         _loc4_.setRole(this);
         _loc4_.setDestroyWhenLastFrame(false);
         _loc4_.setDestroyInCount(gc.frameClips * 2);
         _loc4_.setDirect(param1);
         _loc4_.setAction("hit4");
         gc.gameSence.addChild(_loc4_);
         this.magicBulletArray.push(_loc4_);
         if(this.curAttackTarget)
         {
            _loc3_ = new Point();
            _loc3_.x = (this.x + this.curAttackTarget.x) / 2;
            _loc3_.y = 350 + Math.random() * 100;
            _loc2_ = new Point();
            if(param1 == 0)
            {
               _loc2_.x = Number(this.curAttackTarget.x) - 400;
            }
            else
            {
               _loc2_.x = this.curAttackTarget.x + 400;
            }
            _loc2_.y = this.curAttackTarget.y;
            TweenMax.to(_loc4_,2,{"bezierThrough":[{
               "x":_loc3_.x,
               "y":_loc3_.y
            },{
               "x":_loc2_.x,
               "y":_loc2_.y
            }]});
         }
         else
         {
            _loc2_ = new Point();
            if(param1 == 0)
            {
               _loc2_.x = this.x - 400;
            }
            else
            {
               _loc2_.x = this.x + 400;
            }
            TweenMax.to(_loc4_,2,{"x":_loc2_.x});
         }
      }
      
      private function doHit5(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster129Bullet5");
         if(this.bbdc.getDirect() == 0)
         {
            _loc2_.x = this.x - 20;
         }
         else
         {
            _loc2_.x = this.x + 20;
         }
         _loc2_.y = this.y - 145;
         _loc2_.setRole(this);
         _loc2_.setDisable();
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit5");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
         this.addCurAddEffect([{
            "name":BaseAddEffect.DEADLINK,
            "time":gc.frameClips * 7
         }]);
      }
      
      override public function beMagicAttack(param1:BaseBullet, param2:BaseObject, param3:Boolean = false) : Boolean
      {
         var _loc4_:Boolean = false;
         var _loc5_:* = null;
         _loc4_ = super.beMagicAttack(param1,param2,param3);
         if(_loc4_)
         {
            _loc5_ = this.curAddEffect.getBuffByName(BaseAddEffect.DEADLINK);
            if(_loc5_)
            {
               if(this.curAttackTarget)
               {
                  this.curAttackTarget.reduceHp(param1.hurt * 0.36,false);
               }
            }
         }
         return _loc4_;
      }
      
      override public function reduceHp(param1:int, param2:Boolean = false) : void
      {
         super.reduceHp(param1,param2);
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
         if(!this.isFirstLow90Persent)
         {
            if(this.getHp() / this.getSHp() < 0.9)
            {
               this.attackBackInfoDict["hit1"] = {
                  "hitMaxCount":99,
                  "attackBackSpeed":[-6,-5],
                  "attackInterval":999,
                  "power":1700,
                  "attackKind":"physics",
                  "addEffect":[{
                     "name":BaseAddEffect.MONSTER129Buff,
                     "time":gc.frameClips * 4
                  },{
                     "name":BaseAddEffect.POISON_TIMES,
                     "time":gc.frameClips * 4,
                     "power":100
                  }]
               };
               this.attackBackInfoDict["hit2"] = {
                  "hitMaxCount":99,
                  "attackBackSpeed":[-3,0],
                  "attackInterval":999,
                  "power":3000,
                  "attackKind":"physics",
                  "addEffect":[{
                     "name":BaseAddEffect.SIDATIANWANG_SAN_MP_LOST,
                     "time":gc.frameClips * 6
                  },{
                     "name":BaseAddEffect.MONSTER129Buff,
                     "time":gc.frameClips * 4
                  }]
               };
               this.attackBackInfoDict["hit3"] = {
                  "hitMaxCount":99,
                  "attackBackSpeed":[0,0],
                  "attackInterval":24,
                  "power":100,
                  "attackKind":"magic",
                  "addEffect":[{
                     "name":BaseAddEffect.MONSTER129Buff,
                     "time":gc.frameClips * 4
                  }]
               };
               this.attackBackInfoDict["hit4"] = {
                  "hitMaxCount":99,
                  "attackBackSpeed":[-25,0],
                  "attackInterval":999,
                  "power":1000,
                  "attackKind":"magic",
                  "addEffect":[{
                     "name":BaseAddEffect.MONSTER129Buff,
                     "time":gc.frameClips * 4
                  }]
               };
               this.isFirstLow90Persent = true;
            }
         }
         if(!this.isFirstLow60Persent)
         {
            if(this.getHp() / this.getSHp() < 0.6)
            {
               this.isFirstLow60Persent = true;
            }
         }
         if(!this.isFirstLow30Persent)
         {
            if(this.getHp() / this.getSHp() < 0.3)
            {
               this.isFirstLow30Persent = true;
            }
         }
      }
      
      override public function isAttacking() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3" || this.curAction == "hit4" || this.curAction == "hit5";
      }
      
      override public function destroy() : void
      {
         var _loc1_:* = null;
         var _loc2_:int = 0;
         var _loc3_:* = null;
         super.destroy();
         if(this.getHp() <= 0)
         {
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
}

