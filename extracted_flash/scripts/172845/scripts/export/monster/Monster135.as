package export.monster
{
   import base.*;
   import export.bullet.*;
   import export.level.*;
   import flash.display.*;
   import flash.geom.*;
   import flash.utils.*;
   
   public class Monster135 extends BaseMonster
   {
      
      private var fenshen:BaseMonster;
      
      private var isStop:Boolean = false;
      
      private var continueCount:int = 210;
      
      public function Monster135()
      {
         super();
         this.normalAttackRate = 0.8;
         this.horizenSpeed = 4.5;
         this.setHp(2860000);
         this.setSHp(2860000);
         this.attackRange = 400;
         this.alertRange = 2000;
         this.protectedParamsObject.def = 1860;
         this.protectedParamsObject.exp = 2000;
         this.protectedParamsObject.gxp = 500;
         this.protectedParamsObject.mDef = 0.45;
         this.protectedParamsObject.Toughness = 15;
         this.protectedParamsObject.Dodge = 10;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":999,
            "power":6970,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[3,0],
            "attackInterval":999,
            "power":5755,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":1,
            "attackBackSpeed":[3,0],
            "attackInterval":24,
            "power":6970,
            "attackKind":"physics",
            "addEffect":[{
               "name":BaseAddEffect.MONSTER135Buff,
               "time":gc.frameClips * 4,
               "hurt":300
            }]
         };
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":1,
            "attackBackSpeed":[-3,0],
            "attackInterval":999,
            "power":5755,
            "attackKind":"magic"
         };
         this.isBoss = true;
         this.monsterName = "琼霄";
         this.setAction("wait");
         this.isFly = true;
         this.graity = 0;
         this.protectedParamsObject.probability = 0.4;
         this.fallList = [{
            "name":"kly3",
            "bigtype":"dj"
         },{
            "name":"kly4",
            "bigtype":"dj"
         },{
            "name":"phhlzzs",
            "bigtype":"dj"
         }];
         this.skillCD1 = [gc.frameClips * 2,gc.frameClips * 8];
         this.skillCD2 = [gc.frameClips * 3,gc.frameClips * 10.5];
         this.skillCD3 = [gc.frameClips * 4,gc.frameClips * 12.5];
         this.skillCD4 = [gc.frameClips * 2.5,gc.frameClips * 8.4];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:Object = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster135");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],250,250,new Point(0,0));
            bbdc.setOffsetXY(0,-15);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[8],[2,2,2,2,10],[2,2,2,10],[2,2,24],[2,3,3,3,3,10],[2,2,2,10]]);
            bbdc.setFrameCount([6,1,5,4,3,6,4]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster135--BitmapData Error!");
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
               this.setStatic();
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
                     this.doHi1(_loc3_);
                  }
               }
               break;
            case "hit2":
               if(param1.x == 2)
               {
                  if(this.bbdc.getCurFrameCount() == 24)
                  {
                     this.doHi2(_loc3_);
                     break;
                  }
                  if(this.bbdc.getCurFrameCount() == 16)
                  {
                     this.doHi2(_loc3_);
                     break;
                  }
                  if(this.bbdc.getCurFrameCount() == 8)
                  {
                     this.doHi2(_loc3_);
                  }
               }
               break;
            case "hit3":
               if(param1.x == 3)
               {
                  if(this.bbdc.getCurFrameCount() == 3)
                  {
                     this.doHi3(_loc3_);
                  }
               }
               break;
            case "hit4":
               if(param1.x == 3)
               {
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     this.doHi4(_loc3_);
                  }
               }
         }
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 450;
      }
      
      override protected function beforeSkill2Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && Math.abs(this.x - this.curAttackTarget.x) <= 600 && Math.abs(this.x - this.curAttackTarget.x) <= 100;
      }
      
      override protected function beforeSkill3Start() : Boolean
      {
         return !this.fenshen;
      }
      
      override protected function releSkill1() : void
      {
         this.newAttackId();
         this.setYourFather(20);
         this.setAction("hit2");
         this.lastHit = "hit2";
      }
      
      override protected function releSkill2() : void
      {
         this.newAttackId();
         this.setYourFather(24);
         this.setAction("hit3");
         this.lastHit = "hit3";
      }
      
      override protected function releSkill3() : void
      {
         this.newAttackId();
         this.setYourFather(30);
         this.setAction("hit4");
         this.lastHit = "hit4";
      }
      
      private function doHi1(param1:uint) : void
      {
         var _loc2_:EnemyMoveBullet = new EnemyMoveBullet("Monster135Bullet1");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 130;
            _loc2_.setSpeed(-15);
         }
         else
         {
            _loc2_.x = this.x + 130;
            _loc2_.setSpeed(15);
         }
         _loc2_.setDistance(600);
         _loc2_.y = this.y - 10;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHi2(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = null;
         _loc2_ = new SpecialEffectBullet("Monster135Bullet2");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 150;
         }
         else
         {
            _loc2_.x = this.x + 150;
         }
         _loc2_.y = this.y - 300;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit2");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
         _loc2_ = new SpecialEffectBullet("Monster135Bullet2");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 415;
         }
         else
         {
            _loc2_.x = this.x + 415;
         }
         _loc2_.y = this.y - 320;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit2");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
         _loc2_ = new SpecialEffectBullet("Monster135Bullet2");
         if(param1 == 0)
         {
            _loc2_.x = this.x + 115;
         }
         else
         {
            _loc2_.x = this.x - 115;
         }
         _loc2_.y = this.y - 320;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit2");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHi3(param1:uint) : void
      {
         var _loc2_:BaseHero = null;
         var _loc3_:EnemyMoveBullet = null;
         for each(_loc2_ in gc.getPlayerArray())
         {
            _loc3_ = new EnemyMoveBullet("Monster135Bullet3");
            _loc3_.x = this.x;
            _loc3_.y = this.y;
            _loc3_.setMoveTarget(_loc2_);
            _loc3_.setSpeed(4,4);
            _loc3_.setDistance(9000);
            _loc3_.setDestroyWhenLastFrame(false);
            _loc3_.setDestroyInCount(gc.frameClips * 8);
            _loc3_.setRole(this);
            _loc3_.setDirect(param1);
            _loc3_.setAction("hit3");
            gc.gameSence.addChild(_loc3_);
            this.magicBulletArray.push(_loc3_);
         }
      }
      
      private function doHi4(param1:uint) : void
      {
         this.isStop = true;
         this.bbdc.hide();
         this.continueCount = gc.frameClips * 7;
         this.setYourFather(99999);
         var _loc2_:uint = 31 + Math.random() * 4;
         this.fenshen = AUtils.getNewObj("export.monster.Monster" + _loc2_);
         this.fenshen.isBoss = false;
         this.fenshen.clearFallList();
         this.fenshen.x = this.x;
         this.fenshen.y = this.y;
         this.fenshen.sid = getTimer();
         gc.pWorld.monsterArray.push(this.fenshen);
         var _loc3_:int = gc.getMinIdxInHeroAndPet();
         gc.gameSence.addChildAt(this.fenshen,_loc3_);
         if(gc.pWorld.getBaseLevelListener() is StageListener222)
         {
            (gc.pWorld.getBaseLevelListener() as StageListener222).addMonsterBoatByBaseObject(this.fenshen);
         }
      }
      
      override protected function exitFrameFunc(param1:Point) : void
      {
      }
      
      override public function step() : void
      {
         var _loc1_:uint = 0;
         if(this.isStop)
         {
            if(this.fenshen)
            {
               if(this.continueCount > 0)
               {
                  --this.continueCount;
               }
               if(this.continueCount == 0)
               {
                  if(this.fenshen.curAction == "wait")
                  {
                     _loc1_ = uint(this.fenshen.getSHp() - this.fenshen.getHp());
                     if(this.getHp() > _loc1_)
                     {
                        this.reduceHp(_loc1_);
                     }
                     this.fenshen.destroy();
                     --this.continueCount;
                  }
               }
               if(this.fenshen.isReadyToDestroy)
               {
                  this.setzerofather();
                  this.isStop = false;
                  this.bbdc.show();
                  this.setAction("wait");
                  this.x = this.fenshen.x;
                  this.y = this.fenshen.y - 50;
                  this.fenshen = null;
               }
            }
            return;
         }
         super.step();
      }
      
      override protected function myIntelligence() : void
      {
         if(!this.isBeAttacking())
         {
            super.myIntelligence();
         }
      }
      
      override public function beMagicAttack(param1:BaseBullet, param2:BaseObject, param3:Boolean = false) : Boolean
      {
         var _loc4_:Boolean = false;
         var _loc5_:BaseHero = null;
         var _loc6_:Object = null;
         _loc4_ = super.beMagicAttack(param1,param2,param3);
         if(_loc4_)
         {
            for each(_loc5_ in gc.getPlayerArray())
            {
               _loc6_ = _loc5_.curAddEffect.getBuffByName(BaseAddEffect.MONSTER135Buff);
               if(_loc6_)
               {
                  _loc5_.curAddEffect.remove(_loc6_);
               }
            }
         }
         return _loc4_;
      }
      
      override protected function isCannotMoveWhenAttack() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3" || this.curAction == "hit4";
      }
      
      override public function destroy() : void
      {
         super.destroy();
         if(gc.pWorld.getBaseLevelListener() is StageListener222)
         {
            (gc.pWorld.getBaseLevelListener() as StageListener222).addTransferDoor();
         }
      }
   }
}

