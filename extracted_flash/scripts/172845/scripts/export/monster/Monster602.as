package export.monster
{
   import base.*;
   import com.greensock.*;
   import export.bullet.*;
   import export.level.*;
   import flash.display.*;
   import flash.geom.*;
   
   public class Monster602 extends BaseMonster
   {
      
      private var _effect1:* = null;
      
      private var _canZ1:Boolean;
      
      private var _canZ2:Boolean;
      
      public function Monster602()
      {
         super();
         this.horizenSpeed = 4;
         this.setHp(901283 * 0.7);
         this.setSHp(901283 * 0.7);
         this.protectedParamsObject.mysee = 5 * 60;
         this.protectedParamsObject.isattback = 50;
         this.attackRange = 250;
         this.alertRange = 1000;
         this.protectedParamsObject.def = 1243;
         this.protectedParamsObject.mDef = 0.45;
         this.protectedParamsObject.exp = 5000;
         this.protectedParamsObject.Dodge = 3;
         this.protectedParamsObject.Toughness = 10;
         this.protectedParamsObject.gxp = 0;
         this.isBoss = true;
         this.monsterName = "魔化混沌";
         this.isFly = true;
         this.graity = 0;
         this.setAction("wait");
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[10,-5],
            "attackInterval":8,
            "power":3369 * 0.3,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[5,-5],
            "attackInterval":12,
            "power":3369 * 0.36,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[5,-5],
            "attackInterval":999,
            "power":4359,
            "attackKind":"physics"
         };
         this.protectedParamsObject.probability = 0;
         this.fallList = [{
            "name":"wpycjh",
            "bigtype":"dj"
         }];
         this.skillCD1 = [gc.frameClips * 2,gc.frameClips * 6.4];
         this.skillCD2 = [gc.frameClips * 3,gc.frameClips * 7.2];
         this.skillCD3 = [gc.frameClips * 4,gc.frameClips * 8.1];
         this.skillCD4 = [gc.frameClips * 2.5,gc.frameClips * 6.4];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster602");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],450,450,new Point(0,0));
            bbdc.setOffsetXY(0,0);
            bbdc.setFrameStopCount([[3,3,3,3,3,3],[3,3,3,3,3,3],[4,4],[1,2,5,8,45],[1,2,4,2,2,2,2,1,1,1,1,1,1,2,2,2,4,2,5,5,5,5],[1,2,3,7,2,3,3,3,3,2,3,7,2,3,3,3,3,2,3,7,2,3,3,3,3]]);
            bbdc.setFrameCount([6,6,2,5,22,25]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster602--BitmapData Error!");
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
            case "hit2":
               if(_loc2_.y != 3)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(3);
               }
               this.bbdc.setState(param1);
               break;
            case "hit3":
               if(_loc2_.y != 4)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(param1);
               break;
            case "hit4":
               if(_loc2_.y != 5)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(5);
               }
               this.bbdc.setState(param1);
               break;
            case "dead":
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
            case "hit2":
               this.setAction("wait");
               break;
            case "hit3":
               this._canZ1 = false;
               this._canZ2 = false;
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
               if((gc.pWorld.getBaseLevelListener() as StageListener161).BossArray.length == 1)
               {
                  this.dropAura();
               }
               this.destroy();
         }
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) > 300;
      }
      
      override protected function releSkill1() : void
      {
         this.newAttackId();
         var _loc1_:int = 2 + Math.round(Math.random()) + Math.round(Math.random());
         this.setAction(new String("hit" + _loc1_));
         this.lastHit = new String("hit" + _loc1_);
      }
      
      override protected function beforeSkill2Start() : Boolean
      {
         return false;
      }
      
      override protected function releSkill2() : void
      {
         this.newAttackId();
         this.setAction("hit3");
         this.lastHit = "hit3";
      }
      
      override protected function beforeSkill3Start() : Boolean
      {
         return false;
      }
      
      override protected function releSkill3() : void
      {
         this.newAttackId();
         this.setAction("hit4");
         this.lastHit = "hit4";
      }
      
      override protected function enterFrameFunc(param1:Point) : void
      {
         var _loc2_:String = this.bbdc.getState();
         var _loc3_:uint = uint(this.getBBDC().getDirect());
         switch(_loc2_)
         {
            case "hit2":
               if(param1.x == 3)
               {
                  if(this.bbdc.getCurFrameCount() == 8)
                  {
                     this.doHit2(_loc3_);
                  }
               }
               break;
            case "hit3":
               if(param1.x == 11)
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     this._canZ1 = true;
                     this.doHit3(_loc3_);
                  }
                  break;
               }
               if(param1.x == 18)
               {
                  if(this.bbdc.getCurFrameCount() == 5)
                  {
                     this._canZ2 = true;
                     this.doHit3(_loc3_);
                  }
               }
               break;
            case "hit4":
               if(param1.x == 4 || param1.x == 12 || param1.x == 20)
               {
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     this.doHit4(_loc3_);
                  }
               }
         }
      }
      
      private function doHit2(param1:uint) : void
      {
         var _loc2_:* = null;
         var _loc3_:* = null;
         this._effect1 = new EnemyMoveBullet("Monster602effect1");
         this._effect1.x = this.x;
         this._effect1.y = this.y;
         this._effect1.setRole(this);
         this._effect1.setAction("hit2");
         this._effect1.setDirect(param1);
         _loc2_ = AUtils.GetNextPointByTwoObj(this,this.curAttackTarget);
         _loc3_ = AUtils.GetDisBetweenTwoObj(this,this.curAttackTarget);
         this._effect1.setSpeed(Number(_loc2_.x) * 20,Number(_loc2_.y) * 20);
         this._effect1.setDestroyWhenLastFrame(false);
         this._effect1.setDistance(_loc3_);
         this._effect1.rotation = this.gettwoobjangle(this,this.curAttackTarget,param1);
         gc.gameSence.addChild(this._effect1);
         this.magicBulletArray.push(this._effect1);
      }
      
      private function doHit3(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster602effect2_1");
         _loc2_.x = this.curAttackTarget.x;
         if(this._canZ2)
         {
            _loc2_.x += 150;
         }
         else
         {
            _loc2_.x -= 150;
         }
         _loc2_.y = this.curAttackTarget.y;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setDisable();
         _loc2_.setAction("hit3");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
         TweenMax.delayedCall(0.2,this.hit3over,[_loc2_.x,_loc2_.y]);
      }
      
      private function hit3over(param1:Number, param2:Number) : void
      {
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("Monster602effect2_2");
         _loc3_.x = param1;
         _loc3_.y = param2;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit3");
         _loc3_.setDestroyInCount(gc.frameClips * 5);
         _loc3_.setDestroyWhenLastFrame(false);
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit4(param1:uint) : void
      {
         var _loc2_:* = null;
         var _loc3_:EnemyMoveBullet = new EnemyMoveBullet("Monster602effect3_1");
         _loc3_.x = this.x;
         _loc3_.y = this.y;
         _loc3_.setRole(this);
         _loc3_.setAction("hit4");
         _loc2_ = AUtils.GetNextPointByTwoObj(this,this.curAttackTarget);
         _loc3_.setSpeed(Number(_loc2_.x) * 20,Number(_loc2_.y) * 20);
         _loc3_.setDistance(1000);
         _loc3_.setDestroyWhenLastFrame(false);
         _loc3_.setDirect(param1);
         _loc3_.rotation = this.gettwoobjangle(this,this.curAttackTarget,param1);
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      override protected function exitFrameFunc(param1:Point) : void
      {
      }
      
      override protected function attackTarget() : void
      {
      }
      
      override public function addMedicine() : *
      {
      }
      
      override protected function myIntelligence() : void
      {
         var _loc1_:* = null;
         if(!this.isBeAttacking())
         {
            super.myIntelligence();
         }
         if(Boolean(this._effect1) && Boolean(this._effect1.isReadyToDestroy))
         {
            _loc1_ = [this._effect1.x,this._effect1.y];
            if(_loc1_[0] < 50)
            {
               _loc1_[0] = 50;
            }
            this.x = _loc1_[0];
            this.y = Number(_loc1_[1]) - 50;
            this._effect1 = null;
            this.setAction("wait");
         }
      }
      
      override public function setAttackBack(param1:Point) : void
      {
      }
      
      override protected function isCannotMoveWhenAttack() : Boolean
      {
         return this.curAction == "hit2" || this.curAction == "hit3" || this.curAction == "hit4";
      }
      
      override public function isCanMoveWhenAttack() : Boolean
      {
         return false;
      }
      
      override public function isAttacking() : Boolean
      {
         return this.curAction == "hit2" || this.curAction == "hit3" || this.curAction == "hit4";
      }
      
      override public function reduceHp(param1:int, param2:Boolean = false) : void
      {
         super.reduceHp(param1,false);
      }
      
      override public function destroy() : void
      {
         var _loc1_:* = undefined;
         var _loc2_:int = 0;
         if(gc.pWorld.getBaseLevelListener())
         {
            _loc1_ = (gc.pWorld.getBaseLevelListener() as StageListener161).BossArray;
            _loc2_ = 0;
            while(_loc2_ < _loc1_.length)
            {
               if(_loc1_[_loc2_] == "Monster602")
               {
                  (gc.pWorld.getBaseLevelListener() as StageListener161).BossArray.splice(_loc2_,1);
                  break;
               }
               _loc2_++;
            }
         }
         super.destroy();
         if((gc.pWorld.getBaseLevelListener() as StageListener161).BossArray.length == 0)
         {
            if(gc.pWorld.getBaseLevelListener() is StageListener161)
            {
               (gc.pWorld.getBaseLevelListener() as StageListener161).addTransferDoor();
            }
         }
      }
   }
}

