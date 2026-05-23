package export.monster
{
   import base.*;
   import com.*;
   import export.bullet.*;
   import export.level.*;
   import flash.display.*;
   import flash.geom.*;
   
   public class Monster604 extends BaseMonster
   {
      
      private var _eff21:Boolean;
      
      private var _eff31:Boolean;
      
      private var _eff41:Boolean;
      
      public function Monster604()
      {
         super();
         this.colipse.scaleX = 3.5;
         this.colipse.scaleY = 1.5;
         this.horizenSpeed = 4.5;
         this.setHp(901283);
         this.setSHp(901283);
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
         this._eff41 = true;
         this.isBoss = true;
         this.monsterName = "魔化梼杌";
         this.setAction("wait");
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[5,-5],
            "attackInterval":12,
            "power":3369 * 0.36,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[5,-5],
            "attackInterval":999,
            "power":4359,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[0,-8],
            "attackInterval":12,
            "power":788,
            "attackKind":"magic",
            "addEffect":[{
               "name":BaseAddEffect.POISON,
               "time":gc.frameClips * 5,
               "power":gc.hero1.roleProperies.getSHHP() * 0.02
            },{
               "name":BaseAddEffect.POISON_TIMES,
               "time":gc.frameClips * 5
            }]
         };
         this.protectedParamsObject.probability = 0.36;
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
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster604");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],650,500,new Point(0,0));
            bbdc.setOffsetXY(0,-125);
            bbdc.setFrameStopCount([[4,4,4,4,4,4],[4,4,4,4],[4,4,4,4],[1,2,3,6,2,2,9,2,13],[1,3,5,19,2,2,2,2,2,16],[1,3,7,3,3,8,2,2,2,2,2,2,1,1,2,2,2,2,23],[1,3,4,14,2,3,3,3,3,3,3,2]]);
            bbdc.setFrameCount([6,4,4,9,10,19,12]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster604--BitmapData Error!");
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
         this.setAction("hit2");
         this.lastHit = "hit2";
         this._eff21 = false;
      }
      
      override protected function beforeSkill2Start() : Boolean
      {
         return this.curAttackTarget;
      }
      
      override protected function releSkill2() : void
      {
         this.newAttackId();
         this.setAction("hit3");
         this.lastHit = "hit3";
         this._eff31 = false;
      }
      
      override protected function beforeSkill3Start() : Boolean
      {
         return this.getHp() / this.getSHp() < 0.8;
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
               if(param1.x == 4)
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     this.doHit2(_loc3_);
                  }
               }
               break;
            case "hit3":
               if(param1.x == 6)
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     this.doHit3(_loc3_);
                  }
               }
               break;
            case "hit4":
               if(param1.x == 5)
               {
                  if(this.bbdc.getCurFrameCount() == 3)
                  {
                     this.doHit4();
                  }
               }
         }
      }
      
      private function doHit1(param1:int) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster604effect1");
         if(param1 == 1)
         {
            _loc2_.x = this.x - 41;
         }
         else
         {
            _loc2_.x = this.x + 41;
         }
         _loc2_.y = this.y + 53;
         _loc2_.setRole(this);
         _loc2_.setAction("hit1");
         _loc2_.setDirect(param1);
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHit2(param1:int) : void
      {
         var _loc2_:EnemyMoveBullet = null;
         var _loc3_:int = 0;
         var _loc4_:Array = [-1,1];
         var _loc5_:Number = Number(NaN);
         var _loc6_:Number = Number(NaN);
         if(this._eff21)
         {
            return;
         }
         this._eff21 = true;
         var _loc7_:Array = [-34,-20,1,10];
         _loc3_ = 0;
         while(_loc3_ < _loc7_.length)
         {
            _loc5_ = Number(_loc7_[_loc3_]) / 180 * 3.141592653589793;
            _loc2_ = new EnemyMoveBullet("Monster604effect2_1");
            if(param1)
            {
               _loc2_.x = this.x + 98;
            }
            else
            {
               _loc2_.x = this.x - 98;
            }
            _loc2_.y = this.y - 31;
            _loc2_.setRole(this);
            _loc2_.setAction("hit2");
            _loc2_.setDirect(param1);
            _loc2_.setDistance(800);
            _loc2_.rotation = (_loc3_ - 2) * 18 * Number(_loc4_[param1]);
            _loc2_.setDestroyWhenLastFrame(false);
            _loc2_.setSpeed(Math.cos(_loc5_) * 20 * Number(_loc4_[param1]),Math.sin(_loc5_) * 20);
            gc.gameSence.addChild(_loc2_);
            this.magicBulletArray.push(_loc2_);
            _loc3_++;
         }
      }
      
      private function doHit3(param1:int) : void
      {
         var _loc2_:int = 0;
         var _loc3_:* = null;
         if(this._eff31)
         {
            return;
         }
         this._eff31 = true;
         var _loc4_:Array = [100,200,400,600,800,1000];
         this.randArr(_loc4_);
         var _loc5_:Array = _loc4_.slice(0,4);
         _loc2_ = 0;
         while(_loc2_ < _loc5_.length)
         {
            _loc3_ = new Vector2D(_loc5_[_loc2_],this.getBottom());
            this.doSingleHit3(_loc3_);
            _loc2_++;
         }
      }
      
      private function doSingleHit3(param1:Vector2D) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster604effect3_1");
         _loc2_.x = param1.x;
         _loc2_.y = param1.y;
         _loc2_.setRole(this);
         _loc2_.setAction("hit3");
         _loc2_.setDirect(0);
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function randArr(param1:Array) : void
      {
         var _loc2_:int = 0;
         var _loc3_:* = undefined;
         var _loc4_:Number = Number(NaN);
         var _loc5_:int = int(param1.length);
         _loc2_ = 0;
         while(_loc2_ < _loc5_)
         {
            _loc3_ = param1[_loc2_];
            _loc4_ = int(Math.random() * _loc5_);
            param1[_loc2_] = param1[_loc4_];
            param1[_loc4_] = _loc3_;
            _loc2_++;
         }
      }
      
      private function doHit4() : void
      {
         var _loc1_:* = undefined;
         var _loc2_:int = 0;
         if(this._eff41)
         {
            this.protectedParamsObject.Hit = 30;
            this.protectedParamsObject.Critical = 30;
            this.protectedParamsObject.Dodge = 30;
            this.protectedParamsObject.Toughness = 30;
            this.attackBackInfoDict["hit1"] = {
               "hitMaxCount":999,
               "attackBackSpeed":[5,-5],
               "attackInterval":12,
               "power":688,
               "attackKind":"magic"
            };
            this.attackBackInfoDict["hit2"] = {
               "hitMaxCount":999,
               "attackBackSpeed":[5,-5],
               "attackInterval":999,
               "power":785,
               "attackKind":"magic"
            };
         }
         else
         {
            _loc1_ = this.gc.pWorld.monsterArray;
            while(_loc2_ < _loc1_.length)
            {
               _loc1_[_loc2_].cureHp(50000);
               _loc2_++;
            }
         }
         this._eff41 = false;
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
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3" || this.curAction == "hit4";
      }
      
      override public function isAttacking() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3" || this.curAction == "hit4";
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
               if(_loc1_[_loc2_] == "Monster604")
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

