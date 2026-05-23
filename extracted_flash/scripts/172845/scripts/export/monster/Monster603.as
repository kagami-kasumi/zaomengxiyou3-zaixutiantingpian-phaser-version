package export.monster
{
   import base.*;
   import com.game.view.component.*;
   import com.greensock.*;
   import export.bullet.*;
   import export.level.*;
   import flash.display.*;
   import flash.events.Event;
   import flash.geom.*;
   
   public class Monster603 extends BaseMonster
   {
      
      private var dir:int = 0;
      
      public function Monster603()
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
         this.monsterName = "魔化饕餮";
         this.isFly = true;
         this.graity = 0;
         this.setAction("wait");
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[5,-5],
            "attackInterval":999,
            "power":4359,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[10,-5],
            "attackInterval":10,
            "power":3369 * 0.3,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[0,0],
            "attackInterval":999,
            "power":3369,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[-10,-5],
            "attackInterval":12,
            "power":3369 * 0.36,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit5"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[5,-5],
            "attackInterval":999,
            "power":3369,
            "attackKind":"magic"
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
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster603");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],500,450,new Point(0,0));
            bbdc.setOffsetXY(-60,-25);
            bbdc.setFrameStopCount([[3,3,3,3,3,3],[3,3,3,3,3,3],[4,4],[1,3,3,8,1,1,2,2,3,42],[1,3,3,13,2,3,39],[3,3,3,9,3,3,59],[1,2,3,7,1,2,10],[1,3,2,2,2,2,2,2,2,2,1,2,1,1,4,4,4,4,2,2,1,1,1,1,1,2,1,1,4,4,4,4]]);
            bbdc.setFrameCount([6,6,2,10,7,7,7,32]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster603--BitmapData Error!");
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
            case "hit5":
               if(_loc2_.y != 7)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(7);
               }
               this.bbdc.setState(param1);
               break;
            case "hit1":
               if(_loc2_.y != 6)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(6);
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
         var _loc1_:* = int(2 + Math.round(Math.random()) + Math.round(Math.random()));
         _loc1_ = int(4 && int(AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) > 200));
         if(_loc1_)
         {
            _loc1_--;
         }
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
      
      override protected function beforeSkill4Start() : Boolean
      {
         return this.curAttackTarget;
      }
      
      override protected function releSkill4() : void
      {
         this.newAttackId();
         this.setAction("hit5");
         this.lastHit = "hit5";
      }
      
      override protected function enterFrameFunc(param1:Point) : void
      {
         var _loc2_:String = this.bbdc.getState();
         var _loc3_:uint = uint(this.getBBDC().getDirect());
         switch(_loc2_)
         {
            case "hit1":
               if(param1.x == 4)
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     this.doHit1(_loc3_);
                  }
               }
               break;
            case "hit2":
               if(param1.x == 8)
               {
                  if(this.bbdc.getCurFrameCount() == 3)
                  {
                     this.doHit2(_loc3_);
                  }
               }
               break;
            case "hit3":
               if(param1.x == 4)
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
                  if(this.bbdc.getCurFrameCount() == 3)
                  {
                     this.doHit4(_loc3_);
                  }
               }
               break;
            case "hit5":
               if(param1.x == 11 || param1.x == 25)
               {
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     this.doHit5(_loc3_);
                  }
               }
         }
      }
      
      private function doHit1(param1:int) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster603effect5");
         _loc2_.x = this.x;
         _loc2_.y = this.y + 25;
         _loc2_.setRole(this);
         _loc2_.setAction("hit1");
         _loc2_.setDirect(param1);
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHit2(param1:int) : void
      {
         var _loc2_:AnimationMovieclip = null;
         var _loc3_:Array = [1,0];
         var _loc4_:Class = AUtils.getClass("mc_effect1_1");
         _loc2_ = new AnimationMovieclip(_loc4_,false);
         _loc2_.addEventListener("complete",this.onmcc);
         if(_loc3_[param1] == 0)
         {
            _loc2_.x = this.x - 50;
         }
         else
         {
            _loc2_.x = this.x + 50;
         }
         _loc2_.y = this.y + 50;
         AUtils.flipHorizontal(_loc2_,_loc3_[param1]);
         this.dir = param1;
         this.gc.gameSence.addChild(_loc2_);
      }
      
      private function onmcc(param1:Event) : void
      {
         var _loc2_:AnimationMovieclip = param1.currentTarget as AnimationMovieclip;
         _loc2_.removeEventListener("complete",this.onmcc);
         var _loc3_:Array = [_loc2_.x,_loc2_.y];
         this.doHit2Over(_loc3_);
      }
      
      private function doHit2Over(param1:Array) : void
      {
         var _loc2_:Array = [-1,1];
         var _loc3_:EnemyMoveBullet = new EnemyMoveBullet("Monster603effect1_2");
         _loc3_.x = param1[0];
         _loc3_.y = param1[1];
         _loc3_.setRole(this);
         _loc3_.setAction("hit2");
         _loc3_.setDirect(this.dir);
         _loc3_.setDestroyWhenLastFrame(false);
         _loc3_.setDestroyInCount(gc.frameClips * 3);
         _loc3_.setDistance(600);
         _loc3_.setSpeed(Number(_loc2_[this.dir]) * 15);
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit3(param1:int) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster603effect2");
         _loc2_.x = this.x;
         _loc2_.y = this.y;
         _loc2_.setRole(this);
         _loc2_.setAction("hit3");
         _loc2_.setDirect(param1);
         _loc2_.setDisable();
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
         this.showHit3();
      }
      
      private function showHit3() : void
      {
         var _loc1_:* = null;
         var _loc2_:int = 0;
         if(this.isDead())
         {
            return;
         }
         _loc2_ = 0;
         while(_loc2_ < 8)
         {
            _loc1_ = [940 - _loc2_ * 160,590 - 90];
            TweenMax.delayedCall(_loc2_ * 0.9,this.doSingleHit3,[_loc1_]);
            _loc2_++;
         }
      }
      
      internal function doSingleHit3(param1:Array) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster603effect2_1");
         _loc2_.x = param1[0];
         _loc2_.y = param1[1];
         _loc2_.setRole(this);
         _loc2_.setAction("hit3");
         _loc2_.setDirect(param1);
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHit4(param1:int) : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster603effect3");
         if(param1 == 1)
         {
            _loc2_.x = this.x - 60;
         }
         else
         {
            _loc2_.x = this.x + 60;
         }
         _loc2_.y = this.y + 25;
         _loc2_.setRole(this);
         _loc2_.setAction("hit4");
         _loc2_.setDirect(param1);
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
         TweenMax.to(this.curAttackTarget,2,{
            "x":this.x,
            "y":this.y
         });
         this.cureHp(5000);
      }
      
      private function doHit5(param1:int) : void
      {
         var _loc2_:Array = null;
         var _loc3_:EnemyMoveBullet = null;
         this.dir = param1;
         _loc2_ = [-1,1];
         var _loc4_:int = 0;
         if(this.isDead())
         {
            return;
         }
         _loc4_ = 0;
         while(_loc4_ < 10)
         {
            _loc3_ = new EnemyMoveBullet("Monster603effect4_1");
            _loc3_.x = this.x;
            _loc3_.y = this.y;
            _loc3_.setRole(this);
            _loc3_.setAction("hit5");
            _loc3_.setDirect(param1);
            _loc3_.setDestroyWhenLastFrame(false);
            _loc3_.setDistance(800);
            _loc3_.rotation = (_loc4_ - 5) * 18;
            _loc3_.setSpeed(Math.cos(_loc3_.rotation / 180 * Math.PI) * 8 * Number(_loc2_[this.dir]),Math.sin(_loc3_.rotation / 180 * Math.PI) * 8);
            gc.gameSence.addChild(_loc3_);
            this.magicBulletArray.push(_loc3_);
            _loc4_++;
         }
      }
      
      override protected function exitFrameFunc(param1:Point) : void
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
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3" || this.curAction == "hit4" || this.curAction == "hit5";
      }
      
      override public function isCanMoveWhenAttack() : Boolean
      {
         return false;
      }
      
      override public function isAttacking() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3" || this.curAction == "hit4" || this.curAction == "hit5";
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
               if(_loc1_[_loc2_] == "Monster603")
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

