package export.monster
{
   import base.*;
   import com.greensock.*;
   import export.bullet.*;
   import export.level.*;
   import flash.display.*;
   import flash.geom.*;
   
   public class Monster601 extends BaseMonster
   {
      
      public function Monster601()
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
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":999,
            "power":4359,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit3_1"] = {
            "hitMaxCount":1,
            "attackBackSpeed":[6,-5],
            "attackInterval":8,
            "power":3369 * 0.3,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit3_2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":999,
            "power":3369,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[10,-5],
            "attackInterval":10,
            "power":3369 * 0.32,
            "attackKind":"magic"
         };
         this.isBoss = true;
         this.monsterName = "魔化穷奇";
         this.isFly = true;
         this.graity = 0;
         this.setAction("wait");
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
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster601");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],450,450,new Point(0,0));
            bbdc.setOffsetXY(0,0);
            bbdc.setFrameStopCount([[3,3,3,3,3,3],[3,3,3,3,3,3],[1,1,1,1,1,1],[1,2,2,3,3,3,3,2,26],[1,3,3,8,2,37],[1,3,5,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1]]);
            bbdc.setFrameCount([6,6,6,9,6,19]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster601--BitmapData Error!");
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
         return this.curAttackTarget;
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
               if(param1.x == 8)
               {
                  if(this.bbdc.getCurFrameCount() == 8 || this.bbdc.getCurFrameCount() == 17 || this.bbdc.getCurFrameCount() == 25)
                  {
                     this.doHit2(_loc3_);
                  }
               }
               break;
            case "hit3":
               if(param1.x == 0)
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     this.showHit3(_loc3_);
                  }
               }
               if(param1.x == 4)
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     this.doHit3(_loc3_);
                  }
               }
               break;
            case "hit4":
               this.speed.y = 0;
               if(param1.x >= 3)
               {
                  if(this.getBBDC().getDirect() == 1)
                  {
                     this.speed.x = 20;
                  }
                  else
                  {
                     this.speed.x = -20;
                  }
               }
               if(param1.x == 3)
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
         var _loc3_:EnemyMoveBullet = new EnemyMoveBullet("Monster601effect1");
         if(param1 == 1)
         {
            _loc3_.x = this.x + 56;
         }
         else
         {
            _loc3_.x = this.x - 56;
         }
         _loc3_.y = this.y - 17;
         _loc3_.setRole(this);
         _loc3_.setAction("hit2");
         _loc2_ = AUtils.GetNextPointByTwoObj(this,this.curAttackTarget);
         _loc3_.setSpeed(Number(_loc2_.x) * 20,Number(_loc2_.y) * 20);
         _loc3_.setDistance(1000);
         _loc3_.setDestroyWhenLastFrame(false);
         _loc3_.setDirect(param1);
         _loc3_.rotation = this.gettwoobjangle(this,this.curAttackTarget,param1);
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function showHit3(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster601effect2");
         _loc2_.x = this.x;
         _loc2_.y = this.y + 43;
         _loc2_.setRole(this);
         _loc2_.setAction("hit3");
         _loc2_.setDirect(param1);
         _loc2_.setDisable();
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHit3(param1:uint) : void
      {
         var _loc2_:int = 0;
         var _loc3_:* = null;
         _loc2_ = 0;
         while(_loc2_ < 5)
         {
            _loc3_ = [110 + 180 * _loc2_,150];
            this.doSingleHit3(param1,_loc3_);
            _loc2_++;
         }
      }
      
      private function doSingleHit3(param1:uint, param2:Array) : void
      {
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("Monster601effect2_1");
         _loc3_.x = param2[0];
         _loc3_.y = param2[1];
         _loc3_.setRole(this);
         _loc3_.setAction("hit3");
         _loc3_.setDisable();
         _loc3_.setDirect(param1);
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
         TweenMax.delayedCall(0.396,this.fallStones,[param2]);
      }
      
      internal function fallStones(param1:Array) : void
      {
         var _loc2_:EnemyMoveBullet = new EnemyMoveBullet("Monster601effect2_2","Monster601effect2_2_box");
         _loc2_.x = param1[0];
         _loc2_.y = param1[1];
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setDistance(800);
         _loc2_.setSpeed(0,20);
         _loc2_.setDisable();
         _loc2_.setFuncWhenHit(this.fallStonesHit);
         _loc2_.setRole(this);
         _loc2_.setAction("hit3_1");
         _loc2_.setDirect(0);
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      internal function fallStonesHit(param1:BaseBullet) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster601effect2_3");
         _loc2_.x = this.curAttackTarget.x;
         _loc2_.y = this.curAttackTarget.y;
         _loc2_.setRole(this);
         _loc2_.setAction("hit3_2");
         _loc2_.setDirect(0);
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHit4(param1:uint) : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster601effect3");
         if(param1 == 1)
         {
            _loc2_.x = this.x - 100;
         }
         else
         {
            _loc2_.x = this.x + 100;
         }
         _loc2_.y = this.y + 100;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit4");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
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
         if(!this.isBeAttacking())
         {
            super.myIntelligence();
         }
      }
      
      override public function setAttackBack(param1:Point) : void
      {
      }
      
      override protected function isCannotMoveWhenAttack() : Boolean
      {
         return this.curAction == "hit2" || this.curAction == "hit3";
      }
      
      override public function isCanMoveWhenAttack() : Boolean
      {
         return this.curAction == "hit4";
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
               if(_loc1_[_loc2_] == "Monster601")
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

