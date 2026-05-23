package base
{
   import com.greensock.*;
   import event.*;
   import export.aura.*;
   import export.bullet.*;
   import export.cure.*;
   import export.hero.*;
   import export.monster.*;
   import flash.display.*;
   import flash.events.*;
   import flash.filters.*;
   import flash.geom.*;
   import flash.utils.*;
   import manager.*;
   import my.*;
   import user.*;
   
   public class BaseMonster extends BaseObject
   {
      
      private static var _this:BaseMonster;
      
      public static const MONSTER_DESTROY:String = "monsterdestroy";
      
      protected var isCrit:Boolean = false;
      
      protected var alertRange:int = 1000;
      
      private var timecount:int;
      
      public var ddd:Boolean = false;
      
      protected var isStun:Boolean = false;
      
      protected var canStun:Boolean = false;
      
      protected var totalhurt:*;
      
      protected var attackRange:int = 100;
      
      protected var normalAttackRate:Number = 0;
      
      protected var count:int;
      
      protected var waitRateWhenNoTarget:Number = 0;
      
      protected var curAttackTarget:BaseObject;
      
      protected var lastAttackTarget:BaseObject;
      
      private var hpSlip:Sprite;
      
      protected var protectedParamsObject:Object;
      
      private var hp1:int;
      
      private var hp2:int;
      
      private var sHp1:int;
      
      private var sHp2:int;
      
      private var level1:int;
      
      private var level2:int;
      
      protected var skillCD:Array;
      
      protected var skillCD1:Array;
      
      protected var skillCD2:Array;
      
      protected var skillCD3:Array;
      
      protected var skillCD4:Array;
      
      protected var skillCD5:Array;
      
      public var isBoss:Boolean = false;
      
      public var fallList:Array;
      
      public var monsterName:String = "";
      
      private var img:MovieClip;
      
      private var ThunderNum:int = 0;
      
      public function BaseMonster()
      {
         _this = this;
         this.normalAttackRate = 0;
         this.waitRateWhenNoTarget = 0.137;
         this.protectedParamsObject = {
            "exp":0,
            "gxp":0,
            "def":0,
            "Dodge":0,
            "probability":0.15,
            "mDef":0.2,
            "rehp":0,
            "stoneFallRate":0,
            "Critical":0,
            "Hit":0,
            "ReduceMagicDef":0,
            "Toughness":0,
            "Guardian":0,
            "rehp":0
         };
         this.fallList = [];
         this.skillCD = [0,0];
         this.skillCD1 = [0,0];
         this.skillCD2 = [0,0];
         this.skillCD3 = [0,0];
         this.skillCD4 = [0,0];
         this.skillCD5 = [0,0];
         super();
         this.colipse.scaleX *= 2;
         this.setLevel(0);
         this.newHpSlip();
         this.curAddEffect = new BaseAddEffect(BaseObject(this));
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[0,-2],
            "attackInterval":999,
            "attackKind":"physics",
            "time":576,
            "addgxp":222,
            "baohufen":1800
         };
      }
      
      public static function getInstance() : BaseMonster
      {
         return _this;
      }
      
      public function getcanStun() : Boolean
      {
         return this.canStun;
      }
      
      public function setisStun() : void
      {
         this.isStun = false;
      }
      
      override protected function __added(param1:Event) : void
      {
         var _loc4_:int = 0;
         var _loc5_:int = 0;
         var _loc2_:int = 0;
         var _loc3_:int = 0;
         super.__added(param1);
         if(this.isBoss)
         {
            gc.gameInfo.addBossBlood(this.monsterName,100 - Math.round(100 * (this.getHp() / this.getSHp())),false,this.getHp() / this.getSHp());
            gc.gameInfo.addbeatt(this.monsterName + "_beatt",0);
            if(!(Boolean(this.skillCD[0]) || Boolean(this.skillCD[1])))
            {
               this.skillCD = [gc.frameClips * 2.5,gc.frameClips * 5];
            }
            if(!(Boolean(this.skillCD1[0]) || Boolean(this.skillCD1[1])))
            {
               this.skillCD1 = AUtils.clone(this.skillCD);
            }
            if(!(Boolean(this.skillCD2[0]) || Boolean(this.skillCD2[1])))
            {
               this.skillCD2 = AUtils.clone(this.skillCD);
            }
            if(!(Boolean(this.skillCD3[0]) || Boolean(this.skillCD3[1])))
            {
               this.skillCD3 = AUtils.clone(this.skillCD);
            }
            if(!(Boolean(this.skillCD4[0]) || Boolean(this.skillCD4[1])))
            {
               this.skillCD4 = AUtils.clone(this.skillCD);
            }
            if(!(Boolean(this.skillCD5[0]) || Boolean(this.skillCD5[1])))
            {
               this.skillCD5 = AUtils.clone(this.skillCD);
            }
            if(this.normalAttackRate == 0)
            {
               this.normalAttackRate = 0.423;
            }
         }
         else
         {
            this.skillCD = [gc.frameClips * 3,gc.frameClips * 5];
            if(!(Boolean(this.skillCD1[0]) || Boolean(this.skillCD1[1])))
            {
               this.skillCD1 = AUtils.clone(this.skillCD);
            }
            if(!(Boolean(this.skillCD2[0]) || Boolean(this.skillCD2[1])))
            {
               this.skillCD2 = AUtils.clone(this.skillCD);
            }
            if(!(Boolean(this.skillCD3[0]) || Boolean(this.skillCD3[1])))
            {
               this.skillCD3 = AUtils.clone(this.skillCD);
            }
            if(!(Boolean(this.skillCD4[0]) || Boolean(this.skillCD4[1])))
            {
               this.skillCD4 = AUtils.clone(this.skillCD);
            }
            if(!(Boolean(this.skillCD5[0]) || Boolean(this.skillCD5[1])))
            {
               this.skillCD5 = AUtils.clone(this.skillCD);
            }
            if(this.normalAttackRate == 0)
            {
               this.normalAttackRate = 0.366;
            }
         }
         if(gc.difficulity == 1)
         {
            _loc4_ = 0;
            this.setSHp(this.getSHp() * 1.45);
            this.setHp(this.getHp() * 1.45);
            this.protectedParamsObject.def *= 1.1;
            this.protectedParamsObject.exp *= 1.6;
            this.protectedParamsObject.gxp *= 1.6;
            this.protectedParamsObject.mDef += 0.12;
            this.protectedParamsObject.probability *= 1.5;
            this.protectedParamsObject.probability += 0.06;
            this.setHue(-150);
            this.normalAttackRate = 0.85;
         }
         else if(gc.difficulity == 2)
         {
            _loc5_ = 0;
            this.setSHp(this.getSHp() * 1);
            this.setHp(this.getHp() * 1);
            if(this.getHp() == 0)
            {
               this.setHp(1);
               this.setFullHp();
            }
            this.protectedParamsObject.def *= 1;
            this.protectedParamsObject.exp *= 0.01;
            this.protectedParamsObject.gxp *= 0.01;
            this.protectedParamsObject.mDef += 0;
            this.protectedParamsObject.probability *= 0;
            this.setHue(-100);
            this.normalAttackRate *= 3;
            if(this.normalAttackRate > 0.89)
            {
               this.normalAttackRate = 0.89;
            }
         }
         if(this.waitRateWhenNoTarget == 0)
         {
            this.waitRateWhenNoTarget = 0.137;
         }
         if(gc.isLWYP && this.isBoss)
         {
            this.protectedParamsObject.probability = 1;
         }
      }
      
      public function EndlessModeCreate(param1:uint, param2:uint, param3:Number, param4:uint, param5:uint, param6:uint) : void
      {
         var _loc7_:Object = null;
         for each(_loc7_ in this.attackBackInfoDict)
         {
            _loc7_.power = param4 + param4 * (0.25 * (param6 - 1));
            _loc7_.attackKind = "magic";
         }
         this.setHp(param1 + param1 * (0.5 * (param6 - 1)));
         this.setSHp(this.getHp());
         this.protectedParamsObject.exp = param5 + param5 * (param6 - 1) * 0.1;
         this.protectedParamsObject.mDef = param3 + (param6 - 1) * 0.02;
         this.protectedParamsObject.def = param2 + param2 * (0.5 * (param6 - 1));
         this.alertRange = 2000;
         this.protectedParamsObject.probability = 0;
         if(gc.difficulity == 2)
         {
            this.protectedParamsObject.exp *= 0.01;
            this.protectedParamsObject.gxp *= 0.01;
         }
         this.fallList = [{
            "name":"wptm",
            "bigtype":"dj"
         },{
            "name":"wpxt",
            "bigtype":"dj"
         },{
            "name":"wpsc",
            "bigtype":"dj"
         }];
         this.isBoss = false;
      }
      
      override protected function initBBDC() : void
      {
      }
      
      public function clearFallList() : void
      {
         this.fallList = [];
      }
      
      override public function step() : void
      {
         var bh:BaseObject = null;
         super.step();
         this.addcount();
         if(!this.isDead())
         {
            if(this.ddd)
            {
               bh = null;
               for each(bh in gc.pWorld.heroArray)
               {
                  if(Math.abs(this.x - bh.x) < 165)
                  {
                     this.canStun = true;
                     bh.curAddEffect.add([{
                        "name":BaseAddEffect.PETMONKEY_FIRE,
                        "time":gc.frameClips * 0.02
                     }]);
                  }
                  else
                  {
                     this.canStun = false;
                  }
               }
            }
            this.IntelligenceTime();
            if(this.timecount++ > gc.frameClips)
            {
               if(this.protectedParamsObject.rehp != 0)
               {
                  if(this.getHp() + this.protectedParamsObject.rehp > this.getSHp())
                  {
                     this.setHp(this.getSHp());
                  }
                  else
                  {
                     this.setHp(this.getHp() + this.protectedParamsObject.rehp);
                  }
                  if(this.isBoss)
                  {
                     gc.gameInfo.addBossBlood(this.monsterName,100 - Math.round(100 * (this.getHp() / this.getSHp())),this.isReadyToDestroy,this.getHp() / this.getSHp());
                  }
               }
               this.timecount = 0;
            }
         }
         this.countCD();
         if(this.isBoss && this.beattackedtimes > 0 && !this.isDead())
         {
            this.beattackedtimes -= 0.4;
            gc.gameInfo.addbeatt(this.monsterName + "_beatt",this.beattackedtimes / 1000);
         }
         if(!this.isBoss && this.beattackedtimes > 0 && !this.isDead())
         {
            --this.beattackedtimes;
         }
         if(this.curAttackTarget)
         {
            if(Boolean(this.curAttackTarget.isDead()) || Boolean(this.curAttackTarget.isReadyToDestroy))
            {
               this.curAttackTarget = null;
            }
         }
         if(this.isFly)
         {
            if(this.isBeAttacking())
            {
               this.speed.y *= 0.8;
            }
            if(Math.abs(this.speed.y) > 4)
            {
               this.speed.y *= 0.7;
            }
            if(this.y >= 800)
            {
               this.y = 200;
            }
         }
         var _loc1_:Point = gc.gameSence.localToGlobal(new Point(this.x,this.y));
         var _loc2_:Point = gc.gameSence.globalToLocal(new Point(20,0));
         if(this.isFly)
         {
            if(_loc1_.y > 300)
            {
               this.y = _loc2_.y + 300;
            }
            else if(_loc1_.y < 0)
            {
               this.y = _loc2_.y;
            }
         }
         if(_loc1_.y > 450)
         {
         }
      }
      
      protected function IntelligenceTime() : void
      {
         this.myIntelligence();
      }
      
      protected function countCD() : void
      {
         if(this.isReadyToDestroy)
         {
            return;
         }
         if(this.skillCD1[0] > 0)
         {
            if(this.skillCD1[0]-- <= 0)
            {
               this.skillCD1[0] = 0;
            }
         }
         if(this.skillCD2[0] > 0)
         {
            if(this.skillCD2[0]-- <= 0)
            {
               this.skillCD2[0] = 0;
            }
         }
         if(this.skillCD3[0] > 0)
         {
            if(this.skillCD3[0]-- <= 0)
            {
               this.skillCD3[0] = 0;
            }
         }
         if(this.skillCD4[0] > 0)
         {
            if(this.skillCD4[0]-- <= 0)
            {
               this.skillCD4[0] = 0;
            }
         }
         if(this.skillCD5[0] > 0)
         {
            if(this.skillCD5[0]-- <= 0)
            {
               this.skillCD5[0] = 0;
            }
         }
      }
      
      protected function beforeSkill1Start() : Boolean
      {
         return false;
      }
      
      protected function beforeSkill2Start() : Boolean
      {
         return false;
      }
      
      protected function beforeSkill3Start() : Boolean
      {
         return false;
      }
      
      protected function beforeSkill4Start() : Boolean
      {
         return false;
      }
      
      protected function beforeSkill5Start() : Boolean
      {
         return false;
      }
      
      protected function normalWalk() : void
      {
         if(this.standInObj)
         {
            if(this.x >= this.standInObj.x + this.standInObj.width / 2)
            {
               this.turnLeft();
            }
            else if(this.x <= this.standInObj.x - this.standInObj.width / 2)
            {
               this.turnRight();
            }
            else if(this.count % gc.frameClips == 0)
            {
               if(Math.random() < this.waitRateWhenNoTarget)
               {
                  this.setAction("wait");
                  this.setStatic();
                  if(this.isFly)
                  {
                     this.speed.y = 0;
                  }
               }
               else
               {
                  this.randomWalk();
               }
            }
         }
      }
      
      protected function randomWalk() : void
      {
         var _loc1_:Point = gc.gameSence.localToGlobal(new Point(this.x,0));
         if(_loc1_.x > 940)
         {
            this.turnLeft();
         }
         else if(_loc1_.x < 0)
         {
            this.turnRight();
         }
         else if(Math.random() < 0.5)
         {
            this.turnLeft();
         }
         else
         {
            this.turnRight();
         }
      }
      
      protected function followHero() : Boolean
      {
         return false;
      }
      
      protected function myIntelligence() : void
      {
         if(!(this.curAddEffect && (this.curAddEffect.curDebuff(BaseAddEffect.ICE) || this.curAddEffect.curDebuff(BaseAddEffect.Pet_TIGER_SXHZ) || this.curAddEffect.curDebuff(BaseAddEffect.STUN) || this.curAddEffect.curDebuff(BaseAddEffect.PETHORSE_ICE))))
         {
            if(this.curAttackTarget == null)
            {
               this.normalWalk();
               this.selectTarget();
            }
            else if(BaseObject(this.curAttackTarget).isDead())
            {
               this.curAttackTarget = null;
            }
            else
            {
               this.hasAttackTarget();
            }
         }
      }
      
      override protected function move() : void
      {
         if(this.curAddEffect)
         {
            if(this.curAddEffect.isAnyThingElseStun(""))
            {
               return;
            }
         }
         super.move();
      }
      
      protected function hasAttackTarget() : void
      {
         if(this.isBeAttacking() || this.isAttacking())
         {
            return;
         }
         var _loc1_:int = 101;
         var _loc2_:int = Math.ceil(Math.random() * 4);
         if(Boolean(this.curAttackTarget) && Boolean(this.beforeSkill1Start()) && this.skillCD1[0] == 0)
         {
            this.releSkill1();
            this.skillCD1[0] = this.skillCD1[1];
            return;
         }
         if(Boolean(this.curAttackTarget) && Boolean(this.beforeSkill2Start()) && this.skillCD2[0] == 0)
         {
            this.releSkill2();
            this.skillCD2[0] = this.skillCD2[1];
            return;
         }
         if(Boolean(this.curAttackTarget) && Boolean(this.beforeSkill3Start()) && this.skillCD3[0] == 0)
         {
            this.releSkill3();
            this.skillCD3[0] = this.skillCD3[1];
            return;
         }
         if(Boolean(this.curAttackTarget) && Boolean(this.beforeSkill4Start()) && this.skillCD4[0] == 0)
         {
            this.releSkill4();
            this.skillCD4[0] = this.skillCD4[1];
            return;
         }
         if(Boolean(this.curAttackTarget) && Boolean(this.beforeSkill5Start()) && this.skillCD5[0] == 0)
         {
            this.releSkill5();
            this.skillCD5[0] = this.skillCD5[1];
            return;
         }
         if(this.isFly)
         {
            if(this.y == this.curAttackTarget.y - 150)
            {
               this.speed.y = 0;
            }
            else if(this.y < this.curAttackTarget.y - 150)
            {
               this.speed.y = 2;
            }
         }
         if(this.count % gc.frameClips == 0)
         {
            if(Math.abs(this.x - this.curAttackTarget.x) <= this.attackRange)
            {
               if(Math.random() <= this.normalAttackRate)
               {
                  this.attackTarget();
               }
               else
               {
                  this.setAction("wait");
                  this.setStatic();
                  if(this.isFly)
                  {
                     this.flyFollowTarget();
                  }
               }
            }
            else if(!this.isFly)
            {
               this.followTarget();
            }
            else
            {
               this.flyFollowTarget();
            }
         }
      }
      
      protected function attackTarget() : void
      {
         this.newAttackId();
         this.setAction("hit1");
         this.lastHit = "hit1";
         this.faceToTarget();
      }
      
      protected function releSkill1() : void
      {
      }
      
      protected function releSkill2() : void
      {
      }
      
      protected function releSkill3() : void
      {
      }
      
      protected function releSkill4() : void
      {
      }
      
      protected function releSkill5() : void
      {
      }
      
      protected function followTarget() : void
      {
         if(this.curAttackTarget)
         {
            if(this.x > this.curAttackTarget.x)
            {
               this.moveLeft();
            }
            else if(this.x < this.curAttackTarget.x)
            {
               this.moveRight();
            }
         }
      }
      
      protected function flyFollowTarget() : void
      {
         if(this.curAttackTarget)
         {
            if(this.x > this.curAttackTarget.x)
            {
               this.moveLeft();
            }
            else if(this.x < this.curAttackTarget.x)
            {
               this.moveRight();
            }
            if(this.y == this.curAttackTarget.y - 150)
            {
               this.speed.y = 0;
            }
            else if(this.y > this.curAttackTarget.y - 150)
            {
               this.speed.y = -2.2;
            }
         }
      }
      
      protected function selectTarget() : void
      {
         var _loc1_:BaseObject = AUtils.GetNearestObj("dist",this,gc.getPlayerArray());
         if(AUtils.GetDisBetweenTwoObj(_loc1_,this) <= this.alertRange)
         {
            this.curAttackTarget = _loc1_;
         }
         else
         {
            this.curAttackTarget = null;
         }
      }
      
      override protected function addBeAttackEffect(param1:BaseObject) : void
      {
         var _loc2_:* = null;
         var _loc3_:* = null;
         if(this.img)
         {
            return;
         }
         if(this.colipse)
         {
            _loc2_ = "MonsterBeHurt2";
         }
         this.img = AUtils.getNewObj(_loc2_);
         this.img.name = "MonsterBeAttackEffect";
         this.img.addEventListener(Event.EXIT_FRAME,this.MonsterBeAttackEffectisNull);
         _loc3_ = new ColorMatrix();
         this.img.filters = [new ColorMatrixFilter(_loc3_)];
         this.img.x = this.colipse.x;
         this.img.y = this.colipse.y;
         this.addChild(this.img);
      }
      
      private function MonsterBeAttackEffectisNull(param1:Event) : *
      {
         if(param1.target.currentFrame == Number(param1.target.totalFrames) / 2)
         {
            this.img = null;
         }
      }
      
      public function destroy() : void
      {
         var bb:* = undefined;
         var loc1:* = undefined;
         var monsterblood:MovieClip = null;
         var id1:int = 0;
         var monsterbht:MovieClip = null;
         var id2:int = 0;
         var ii:int = 0;
         this.dispatchEvent(new Event("monsterdestroy"));
         if(this.isBoss)
         {
            monsterblood = gc.gameInfo.getChildByName(this.monsterName);
            id1 = int(gc.gameInfo.bossBloodArray.indexOf(monsterblood));
            monsterbht = gc.gameInfo.getChildByName(this.monsterName + "_beatt");
            id2 = int(gc.gameInfo.beattArray.indexOf(monsterbht));
            ii = 0;
            if(monsterblood)
            {
               ii = 0;
               while(ii < gc.gameInfo.bossBloodArray.length)
               {
                  if(ii > id1)
                  {
                     gc.gameInfo.bossBloodArray[ii].y -= 50;
                     gc.gameInfo.beattArray[ii].y -= 50;
                  }
                  ii++;
               }
               gc.gameInfo.removeChild(monsterblood);
               gc.gameInfo.bossBloodArray.splice(id1,1);
            }
            if(monsterbht)
            {
               gc.gameInfo.removeChild(monsterbht);
               gc.gameInfo.beattArray.splice(id2,1);
            }
         }
         if(this.curAddEffect)
         {
            this.curAddEffect.destroy();
            this.curAddEffect = null;
         }
         TweenMax.to(this,1,{
            "alpha":0,
            "onComplete":function(param1:BaseMonster):*
            {
               removeFromStage(param1);
            },
            "onCompleteParams":[this]
         });
         this.isReadyToDestroy = true;
         for each(bb in this.magicBulletArray)
         {
            bb.destroy();
         }
         this.magicBulletArray = [];
         this.magicBulletArray = null;
         this.curAttackTarget = null;
         this.lastAttackTarget = null;
         this.fallList = null;
         this.protectedParamsObject = null;
         this.skillCD = null;
         this.hpSlip = null;
         for(i in [0,0,0,0])
         {
            this["skillCD" + String(i + 1)] = null;
         }
         gc.protectedPerproty.removeProperty(this);
      }
      
      private function removeFromStage(param1:BaseMonster) : void
      {
         if(parent)
         {
            parent.removeChild(param1);
         }
         if(this.bbdc)
         {
            bbdc.destroy();
            this.bbdc = null;
         }
         if(this.colipse)
         {
            this.colipse = null;
         }
      }
      
      override protected function checkOver() : void
      {
         if(this.y >= 50 * 60)
         {
            this.y = 50 * 6;
         }
      }
      
      override public function beMagicAttack(param1:BaseBullet, param2:BaseObject, param3:Boolean = false) : Boolean
      {
         var i:int = 0;
         var bh:BaseObject = null;
         var _loc2_:int = 0;
         var _loc4_:int = 0;
         var _loc5_:int = 0;
         var _loc6_:Number = Number(NaN);
         var _loc7_:* = null;
         var _loc8_:* = null;
         var _loc9_:int = 0;
         var _loc10_:* = null;
         var _loc11_:* = NaN;
         var _loc12_:* = 0;
         var _loc13_:* = 0;
         var _loc14_:* = 0;
         var _loc15_:* = 0;
         var _loc16_:* = null;
         var _loc17_:int = 0;
         var _loc19_:SpecialEffectBullet = null;
         var _loc18_:FollowBaseObjectBullet = null;
         var addWs:int = 0;
         var hited:Boolean = false;
         if(gc.protectedPerproty.getProperty(this,"isYourFather"))
         {
            return false;
         }
         hited = Boolean(HitTest.complexHitTestObject(this.colipse,param1));
         if(param1.getImgMc1() != null)
         {
            hited = Boolean(HitTest.complexHitTestObject(this.colipse,param1.getImgMc1()));
         }
         if(param3 || Boolean(this.colipse && AUtils.testIntersects(this.colipse,param1,gc.gameSence)) && Boolean(hited))
         {
            if(param2 is BaseHero)
            {
               _loc17_ = int(BaseHero(param2).roleProperies.getDeephit());
            }
            if(this.getCurAddEffect(BaseAddEffect.YUESEMENGLONG))
            {
               if(Math.random() <= (Number(this.protectedParamsObject.Dodge) - _loc17_) / 100 + 0.2)
               {
                  this.addMissMc();
                  this.beAttackIdArray.push(param1.getAttackId());
                  return false;
               }
            }
            else if(Math.random() <= (Number(this.protectedParamsObject.Dodge) - _loc17_) / 100)
            {
               this.addMissMc();
               this.beAttackIdArray.push(param1.getAttackId());
               return false;
            }
            if(param2 is Role1)
            {
               if(Role1(param2).getCanBati())
               {
                  if(param1.getImcName() == "Role1Bullet10_4_tmp")
                  {
                     Role1(param2).setFatherBig();
                  }
                  if(param1.getImcName() == "Role1Bullet10_2")
                  {
                     Role1(param2).setFatherSmall();
                  }
               }
            }
            ++User.batterNum;
            _loc16_ = param1.sourceRoleAttackInfoObject;
            this.curAttackTarget = param2;
            if(_loc16_)
            {
               _loc7_ = this.getBeattackBackSpeed(param1,_loc16_);
               if(param1.getImcName() != "Role1Bullet12")
               {
                  this.setAttackBack(_loc7_);
               }
               if(_loc16_.addEffect)
               {
                  _loc8_ = AUtils.clone(_loc16_.addEffect) as Array;
                  _loc9_ = 0;
                  while(_loc9_ < _loc8_.length)
                  {
                     _loc10_ = _loc8_[_loc9_];
                     if(_loc10_.time == BaseBullet.DESIDE_BY_FRAMES_LEFT)
                     {
                        _loc10_.time = param1.getFrameLeft();
                     }
                     _loc9_++;
                  }
                  this.addCurAddEffect(_loc8_);
               }
            }
            _loc14_ = param1.hurt;
            addWs = _loc14_;
            this.isCrit = param1.isCrit;
            _loc4_ = 1;
            _loc5_ = 0;
            if(param1.getImcName() == "qpjeffect")
            {
               this.ThunderNum += 1;
               if(this.ThunderNum >= 3)
               {
                  _loc19_ = new SpecialEffectBullet("qpjThunder","qpjThunder_box");
                  _loc19_.setRole(param2);
                  _loc19_.setAction("qpjThunder");
                  _loc19_.setDisable();
                  _loc19_.x = this.x - 28 + Math.random() * 56;
                  _loc19_.y = this.getBottom();
                  gc.gameSence.addChild(_loc19_);
                  param2.magicBulletArray.push(_loc19_);
                  this.ThunderNum = 0;
               }
            }
            if(param1.getImcName() == "Role1Bullet12")
            {
               _loc4_ = int(BaseHero(param2).getPlayer().returnSkillLevelBySkillName("hyjj"));
               if(_loc4_ >= 1)
               {
               }
               _loc11_ = Number(AUtils.GetDisBetweenTwoObj(this,param2));
               if(_loc11_ > 1000)
               {
                  _loc11_ = 1000;
               }
            }
            if(param1.getImcName() == "Role1Bullet13")
            {
               if(param2 is Role1)
               {
                  if(Role1(param2).sid == this.gc.sid || Boolean(this.gc.isSingleGame()))
                  {
                     if(this.isBoss)
                     {
                        if(Math.random() <= 0.5)
                        {
                           Role1(param2).createShallow();
                        }
                        i = 0;
                        while(i < 4)
                        {
                           Role1(param2).createShallow();
                           i++;
                        }
                     }
                     else
                     {
                        Role1(param2).createShallow();
                        if(Math.random() <= 0.5)
                        {
                           Role1(param2).createShallow();
                        }
                     }
                  }
               }
            }
            if(this.curAddEffect.curDebuff(BaseAddEffect.MONSTER6008SKILL2))
            {
               param2.curAddEffect.add([{
                  "name":BaseAddEffect.MONSTER6008FIRE,
                  "time":gc.frameClips * 4,
                  "value":1
               }]);
            }
            if(param1.getImcName() == "MagicPearlBullet1" || param1.getImcName() == "MagicPearlBullet2" || param1.getImcName() == "MagicPearlBullet3")
            {
               _loc15_ = _loc14_;
            }
            else
            {
               _loc15_ = this.getRealHurt(_loc14_,param1,param2);
            }
            if(this is Monster33)
            {
               if(this.curAction == "hit12")
               {
                  if(param2 is BaseHero || param2 is BasePet)
                  {
                     if(this.isCrit)
                     {
                        BaseObject(param2).reduceHp(param1.hurt * 0.015 * 0.5);
                     }
                     else
                     {
                        BaseObject(param2).reduceHp(param1.hurt * 0.015);
                     }
                  }
               }
            }
            if(this.isCrit == true)
            {
               if(Math.random() <= Number(this.protectedParamsObject.Toughness) / 100)
               {
                  this.isCrit = false;
                  _loc15_ /= 2;
               }
               else if(this.protectedParamsObject.Guardian > 0)
               {
                  _loc6_ = 1 - this.protectedParamsObject.Guardian / 100;
                  _loc15_ *= 0.5 * (1 + _loc6_);
               }
               addWs = _loc14_ / 2;
            }
            if(param1.isBingo)
            {
               if(gc.difficulity == 2)
               {
                  if(this.isCrit == true)
                  {
                     _loc15_ = Math.min(this.getSHp() * 99 * 2,999999999);
                  }
                  else
                  {
                     _loc15_ = Math.min(this.getSHp() * 99,int(999999999 / 2));
                  }
               }
               trace("bingo：" + _loc15_);
               if(_loc15_ <= 0)
               {
                  if(this.isCrit == true)
                  {
                     _loc15_ = 999999999;
                  }
                  else
                  {
                     _loc15_ = int(999999999 / 2);
                  }
               }
            }
            this.addMonHurtMc(_loc15_,this.isCrit);
            if(param2 is BaseHero && Boolean(BaseHero(param2).getCurAddEffect(BaseAddEffect.ROLE5SKILL4)) && param2 is Role5)
            {
               if(Role5(param2)._invert == false)
               {
                  if(Math.random() < Role5(param2).getProbabilityByBullet(param1.getImcName()))
                  {
                     BaseHero(param2).cureHp(BaseHero(param2).getyybcure() * (param2.isGXP ? 1.3 : 1));
                     _loc18_ = new FollowBaseObjectBullet("Role5Skill4Cure");
                     _loc18_.setRole(param2);
                     _loc18_.setAction("wait");
                     _loc18_.setDisable();
                     _loc18_.x = param2.x;
                     _loc18_.y = param2.y + 63;
                     gc.gameSence.addChild(_loc18_);
                     param2.magicBulletArray.push(_loc18_);
                  }
               }
               else if(getTimer() - gc.Role5Skill4Interval > 500)
               {
                  if(Math.random() < 0.88)
                  {
                     _loc19_ = new SpecialEffectBullet("Role5Skill4Thunder");
                     _loc19_.setRole(param2);
                     _loc19_.setAction("hit11");
                     _loc19_.x = this.x;
                     _loc19_.y = this.getBottom();
                     gc.gameSence.addChild(_loc19_);
                     param2.magicBulletArray.push(_loc19_);
                     gc.Role5Skill4Interval = getTimer();
                  }
               }
            }
            if(param2 is BaseHero)
            {
               if(!(this is Monster6007 || this is Monster6011))
               {
                  if(Boolean(_loc16_) && _loc16_.attackKind == "physics")
                  {
                     _loc12_ = BaseHero(param2).roleProperies.getEatBlood();
                     if(this.isCrit == true)
                     {
                        if(Math.random() <= Number(this.protectedParamsObject.Toughness) / 100)
                        {
                           _loc13_ = uint(int(_loc12_ / 100 * (_loc15_ / 2)));
                        }
                        else if(this.protectedParamsObject.Guardian > 0)
                        {
                           _loc13_ = uint(int(_loc12_ / 100 * _loc15_ / 2));
                        }
                        else
                        {
                           _loc13_ = uint(int(_loc12_ / 100 * _loc15_ / 2));
                        }
                     }
                     else
                     {
                        _loc13_ = uint(int(_loc12_ / 100 * _loc15_));
                     }
                     if(_loc13_ > 0)
                     {
                        BaseHero(param2).cureHp(_loc13_);
                     }
                  }
                  if(param1.qixue >= 0)
                  {
                     BaseHero(param2).cureHp(param1.qixue);
                  }
               }
            }
            if(param1.getImcName() == "Role1Bullet12" || param1.getImcName() == "Role4Bullet6")
            {
               this.reduceHp(_loc15_,false);
            }
            else
            {
               this.reduceHp(_loc15_,true);
            }
            _loc4_ = 1;
            _loc5_ = 0;
            if(param2 is BaseHero)
            {
               if(param2 is Role1)
               {
                  if(param1.getImcName() == "Role1Bullet10_4_tmp")
                  {
                     _loc4_ = int(BaseHero(param2).getPlayer().returnSkillLevelBySkillName("hmz"));
                  }
               }
               if(param2 is Role2)
               {
                  if(param1.getImcName() == "Role2Bullet4_2")
                  {
                     _loc4_ = int(BaseHero(param2).getPlayer().returnSkillLevelBySkillName("smb"));
                     if(_loc4_ >= 1)
                     {
                        if(Math.random() <= 0.1)
                        {
                           if(this.curAddEffect)
                           {
                              this.curAddEffect.add([{
                                 "name":BaseAddEffect.PETHORSE_ICE,
                                 "time":gc.frameClips * 3
                              }]);
                           }
                        }
                     }
                  }
                  if(param1.getImcName() == "Role2Bullet9_2")
                  {
                     _loc4_ = int(BaseHero(param2).getPlayer().returnSkillLevelBySkillName("jhsj"));
                     if(_loc4_ >= 1)
                     {
                        if(this.curAddEffect)
                        {
                           this.curAddEffect.add([{
                              "name":BaseAddEffect.JIUHUANSHENGJING,
                              "time":gc.frameClips * 1.2
                           }]);
                        }
                     }
                  }
               }
               if(param2 is Role3)
               {
                  if(param1.getImcName() == "Role3Bullet7_2")
                  {
                     _loc4_ = int(BaseHero(param2).getPlayer().returnSkillLevelBySkillName("syzq"));
                  }
               }
            }
            if(param2 is BaseHero || param2 is BasePet)
            {
               if((param2.attackBackInfoDict[param1.curAction].addprotection != null || param2.attackBackInfoDict[param1.curAction].addprotection > 10) && param2 is BaseHero)
               {
                  if(param2.getPlayer())
                  {
                     if(param2.getPlayer().getCurEquipByType("zbwq"))
                     {
                        if(param2.getPlayer().getCurEquipByType("zbwq").getFillName().indexOf("cs_wq") != -1)
                        {
                           this.beattackedtimes += Number(param2.attackBackInfoDict[param1.curAction].addprotection);
                        }
                        else if(param2.getPlayer().getCurEquipByType("zbwq").getFillName().indexOf("zxstg") != -1)
                        {
                           this.beattackedtimes += Number(param2.attackBackInfoDict[param1.curAction].addprotection);
                        }
                        else
                        {
                           this.beattackedtimes += Number(param2.attackBackInfoDict[param1.curAction].addprotection);
                        }
                     }
                     else
                     {
                        this.beattackedtimes += Number(param2.attackBackInfoDict[param1.curAction].addprotection);
                     }
                  }
                  else
                  {
                     this.beattackedtimes += Number(param2.attackBackInfoDict[param1.curAction].addprotection);
                  }
               }
               else
               {
                  this.beattackedtimes += 10;
               }
               if(this.isBoss)
               {
                  if(this.beattackedtimes > 1000)
                  {
                     if(!(this is Monster11111))
                     {
                        this.setYourFather(gc.frameClips * 3.2,true);
                     }
                     this.beattackedtimes = 0;
                     if(!Boolean(this.beforeSkill4Start()))
                     {
                        _loc2_ = Math.ceil(Math.random() * 3);
                     }
                     else if(!Boolean(this.beforeSkill3Start()))
                     {
                        _loc2_ = Math.ceil(Math.random() * 2);
                     }
                     else if(!Boolean(this.beforeSkill2Start()))
                     {
                        _loc2_ = Math.ceil(Math.random() * 1);
                     }
                     else
                     {
                        _loc2_ = Math.ceil(Math.random() * 4);
                     }
                     if(Boolean(this.curAttackTarget) && Boolean(this.beforeSkill1Start()) && _loc2_ == 1)
                     {
                        this.releSkill1();
                        this.skillCD1[0] = this.skillCD1[1];
                     }
                     if(Boolean(this.curAttackTarget) && Boolean(this.beforeSkill2Start()) && _loc2_ == 2)
                     {
                        this.releSkill2();
                        this.skillCD2[0] = this.skillCD2[1];
                     }
                     if(Boolean(this.curAttackTarget) && Boolean(this.beforeSkill3Start()) && _loc2_ == 3)
                     {
                        this.releSkill3();
                        this.skillCD3[0] = this.skillCD3[1];
                     }
                     if(Boolean(this.curAttackTarget) && Boolean(this.beforeSkill4Start()) && _loc2_ == 4)
                     {
                        this.releSkill4();
                        this.skillCD4[0] = this.skillCD4[1];
                     }
                     if(this.ddd)
                     {
                        bh = null;
                        this.isStun = true;
                        i = 0;
                        while(i < gc.pWorld.heroArray.length)
                        {
                           bh = gc.pWorld.heroArray[i];
                           TweenMax.delayedCall(1,function():*
                           {
                              if(BaseMonster.getInstance().getcanStun())
                              {
                                 bh.setAction("wait");
                                 bh.curAddEffect.add([{
                                    "name":BaseAddEffect.STUN,
                                    "time":gc.frameClips * 1
                                 }]);
                              }
                           });
                           i++;
                        }
                     }
                  }
                  if(!this.isDead())
                  {
                     gc.gameInfo.addbeatt(this.monsterName + "_beatt",this.beattackedtimes / 1000);
                  }
               }
               else if(this.beattackedtimes > 2500)
               {
                  this.setYourFather(gc.frameClips * 2.5,true);
                  this.beattackedtimes = 0;
               }
            }
            if(this.isDead())
            {
               this.setYourFather(gc.frameClips * 99,false);
               this.setAction("dead");
               try
               {
                  this.curAddEffect.cancelAllEffect();
               }
               catch(e:*)
               {
               }
            }
            if(this.curAddEffect)
            {
               this.curAddEffect.updateFather();
            }
            this.showHpSlip();
            gc.eventManger.dispatchEvent(new CommonEvent("MonsterIsBeat",[Math.ceil(param2.attackBackInfoDict[param1.curAction].addprotection / 10),this.curAttackTarget]));
            this.addBeAttackEffect(param2);
            SoundManager.play("BeattackByRole1");
            return true;
         }
         return false;
      }
      
      protected function addMissMc() : void
      {
         var missMc:* = undefined;
         missMc = undefined;
         missMc = undefined;
         missMc = undefined;
         missMc = AUtils.getImageObj("miss");
         missMc.x = this.x - 20;
         missMc.y = this.y - 60;
         this.gc.gameSence.addChild(missMc);
         TweenMax.to(missMc,2,{
            "y":Number(missMc.y) - 60,
            "alpha":0,
            "onComplete":function():*
            {
               if(Boolean(missMc) && Boolean(gc.gameSence) && gc.gameSence.contains(missMc))
               {
                  gc.gameSence.removeChild(missMc);
               }
            }
         });
      }
      
      protected function getRealHurt(param1:int, param2:BaseBullet, param3:BaseObject) : int
      {
         var _loc4_:* = 0;
         var zxfy:int = 0;
         var zxmfy:Number = 0;
         if(param2)
         {
            if(param3 is BaseHero)
            {
               if(param3.getPlayer().getCurEquipByType("zbwq"))
               {
                  if(param3.getPlayer().getCurEquipByType("zbwq").getFillName().indexOf("zxstg") != -1)
                  {
                     zxfy = 0;
                     zxmfy = 0;
                  }
               }
            }
            if(param2.sourceRoleAttackInfoObject.attackKind == "physics")
            {
               if((param2.atk - this.def + zxfy) / param2.atk > 1.1)
               {
                  _loc4_ = param1 * 1.1;
               }
               else if((param2.atk - this.def + zxfy) / param2.atk < 0)
               {
                  _loc4_ = 1;
               }
               else
               {
                  _loc4_ = param1 * (param2.atk - this.def + zxfy) / param2.atk;
               }
               trace("怪物防御:" + this.def);
            }
            else if(param2.sourceRoleAttackInfoObject.attackKind == "magic")
            {
               if(this.mDef)
               {
                  if(1 - this.mDef + zxmfy > 1.1)
                  {
                     _loc4_ = param1 * 1.1;
                  }
                  else if(1 - this.mDef + zxmfy < 0)
                  {
                     _loc4_ = 1;
                  }
                  else
                  {
                     _loc4_ = param1 * (1 - this.mDef + zxmfy);
                  }
               }
               else
               {
                  _loc4_ = param1 * (1 + zxmfy);
               }
            }
         }
         else
         {
            _loc4_ = 1;
         }
         return _loc4_;
      }
      
      override public function reduceHp(param1:int, param2:Boolean = false) : void
      {
         var _loc3_:* = undefined;
         if(!this.isDead())
         {
            this.setHp(this.getHp() - param1);
            this.drawMonsterHp();
         }
         if(this.isDead())
         {
            if(this.curAction != "dead")
            {
               this.setAction("dead");
               if(this.curAttackTarget is BaseHero)
               {
                  if(BaseHero(this.curAttackTarget).getPet())
                  {
                     BaseHero(this.curAttackTarget).roleProperies.setExper(BaseHero(this.curAttackTarget).roleProperies.getExper() + this.protectedParamsObject.exp * 0.6);
                     BaseHero(this.curAttackTarget).getPet().petInfo.setCurExper(BaseHero(this.curAttackTarget).getPet().petInfo.getCurExper() + this.protectedParamsObject.exp * 0.6);
                  }
                  else
                  {
                     BaseHero(this.curAttackTarget).roleProperies.setExper(BaseHero(this.curAttackTarget).roleProperies.getExper() + this.protectedParamsObject.exp);
                  }
                  _loc3_ = BaseHero(this.curAttackTarget).curAddEffect.getBuffByName(BaseAddEffect.SHENMISHANGRENSHIZHUANG);
                  if(_loc3_)
                  {
                     BaseHero(this.curAttackTarget).cureHp(_loc3_.hurt);
                  }
               }
               else if(this.curAttackTarget is BasePet)
               {
                  BasePet(this.curAttackTarget).petInfo.setCurExper(BasePet(this.curAttackTarget).petInfo.getCurExper() + this.protectedParamsObject.exp);
               }
            }
         }
         else if(param2)
         {
            if(this.curAction == "hurt")
            {
               this.bbdc.setFramePointX(0);
            }
            else
            {
               this.setAction("hurt");
            }
         }
         if(this.isBoss)
         {
            gc.gameInfo.addBossBlood(this.monsterName,100 - Math.round(100 * (this.getHp() / this.getSHp())),this.isReadyToDestroy,this.getHp() / this.getSHp());
         }
      }
      
      public function setFullHp() : void
      {
         var _loc1_:int = Math.max(this.getHp(),this.getSHp());
         this.setHp(_loc1_);
         this.setSHp(_loc1_);
      }
      
      override public function isDead() : Boolean
      {
         return this.getHp() <= 0;
      }
      
      public function dropAura() : void
      {
         var _loc1_:* = null;
         var _loc2_:* = null;
         var _loc3_:Number = Number(NaN);
         if(gc.curStage != 98)
         {
            this.addMedicine();
            this.fallEquip();
         }
         if(this.curAttackTarget is BasePet)
         {
            _loc1_ = BasePet(this.curAttackTarget).getSourceRole();
         }
         else if(this.curAttackTarget is BaseHero)
         {
            _loc1_ = BaseHero(this.curAttackTarget);
         }
         if(!_loc1_)
         {
            return;
         }
         var _loc4_:int = 2 + Math.floor(Math.random() * 3);
         var _loc5_:int = 0;
         while(_loc5_ < _loc4_)
         {
            _loc2_ = new auraRed(this,_loc1_);
            _loc2_.x = this.x + (Math.random() - 0.5) * 10;
            _loc2_.y = this.y + (Math.random() - 0.5) * 10;
            _loc2_.setPower(Number(this.protectedParamsObject.gxp) * 2);
            gc.gameSence.addChild(_loc2_);
            gc.pWorld.getAuraArray().push(_loc2_);
            _loc5_++;
         }
         _loc3_ = Math.random();
         _loc4_ = 0;
         if(_loc3_ < 0.04)
         {
            _loc4_ = 3;
         }
         else if(_loc3_ < 0.08)
         {
            _loc4_ = 2;
         }
         else if(_loc3_ < 0.12)
         {
            _loc4_ = 1;
         }
         _loc5_ = 0;
         while(_loc5_ < _loc4_)
         {
            _loc2_ = new auraWhile(this,_loc1_);
            _loc2_.x = this.x + (Math.random() - 0.5) * 40;
            _loc2_.y = this.y + (Math.random() - 0.5) * 40;
            gc.gameSence.addChild(_loc2_);
            gc.pWorld.getAuraArray().push(_loc2_);
            _loc5_++;
         }
      }
      
      protected function addcount() : void
      {
         if(this.count++ > gc.frameClips * 10)
         {
            this.count = 0;
         }
      }
      
      protected function drawMonsterHp() : void
      {
         this.hpSlip.graphics.clear();
         this.hpSlip.alpha = 1;
         var _loc1_:Number = this.getHp() / this.getSHp();
         _loc1_ = _loc1_ < 0 ? Number(0) : Number(_loc1_);
         if(this.getHp() >= 0)
         {
            this.hpSlip.graphics.lineStyle(1.2,0);
            this.hpSlip.graphics.drawRect(0,5,50,5);
            this.hpSlip.graphics.beginFill(16711680);
            if(this.getBBDC().getDirect() == 0)
            {
               this.hpSlip.graphics.drawRect(0,5,50 * _loc1_,5);
            }
            else if(this.getBBDC().getDirect() == 1)
            {
               this.hpSlip.graphics.drawRect(50 - 50 * _loc1_,5,50 * _loc1_,5);
            }
            this.hpSlip.graphics.endFill();
         }
      }
      
      protected function removedHpSlip() : void
      {
         if(!this.isReadyToDestroy && this.hpSlip != null)
         {
            this.hpSlip.visible = false;
         }
      }
      
      protected function showHpSlip() : void
      {
         if(isReadyToDestroy || this.hpSlip == null)
         {
            return;
         }
         this.hpSlip.visible = true;
         TweenMax.to(this.hpSlip,2,{
            "alpha":0,
            "onComplete":this.removedHpSlip
         });
      }
      
      protected function newHpSlip() : void
      {
         this.hpSlip = new Sprite();
         this.hpSlip.x = -23;
         this.hpSlip.y = -this.colipse.height / 2 - 10;
         this.hpSlip.visible = false;
         addChild(this.hpSlip);
      }
      
      public function addMonHurtMc(param1:int, param2:Boolean, param3:Boolean = false) : *
      {
         var _loc4_:Number = this.y - Math.min(300,this.height) / 2;
         if(param3)
         {
            if(this.cureHpQueue)
            {
               this.cureHpQueue.addMonsterHurt(param1,x - 20,_loc4_);
            }
         }
         else if(param2)
         {
            if(this.cureHpQueue)
            {
               this.cureHpQueue.addMonsterCritHurt(param1,x - 20,_loc4_);
            }
         }
         else if(this.cureHpQueue)
         {
            this.cureHpQueue.addMonsterHurt(param1,x - 20,_loc4_);
         }
      }
      
      public function judgeAlive(param1:BaseHero) : *
      {
         param1.roleProperies.dispatchEvent(new CommonEvent("AddExper",[this.protectedParamsObject.exp]));
      }
      
      public function getMonsterDrop(monsterLoot:Array, user_:User) : Object
      {
         var itemObj:Object = null;
         var itemCounts:Array = null;
         var itemName:String = null;
         var total:Number = NaN;
         var count:Number = NaN;
         var avgCount:Number = NaN;
         var dynamicWeights:Array = null;
         var scarcityFactor:Number = NaN;
         var maxMultiplier:Number = NaN;
         var i:int = 0;
         var currentCount:Number = NaN;
         var baseWeight:Number = NaN;
         var scarcityRatio:Number = NaN;
         var adjustedWeight:Number = NaN;
         if(monsterLoot == null || monsterLoot.length == 0)
         {
            return null;
         }
         var itemNames:Array = [];
         for each(itemObj in monsterLoot)
         {
            itemNames.push(itemObj.name);
         }
         itemCounts = [];
         for each(itemName in itemNames)
         {
            itemCounts.push(user_.getSomeEquipInPackBackByName1(itemName) || 0);
         }
         trace("背包中花宴的数量:" + user_.getSomeEquipInPackBackByName1("hy"));
         total = 0;
         for each(count in itemCounts)
         {
            total += count;
         }
         avgCount = total / monsterLoot.length;
         dynamicWeights = [];
         scarcityFactor = 2.4;
         maxMultiplier = 5;
         for(i = 0; i < monsterLoot.length; i++)
         {
            currentCount = Number(itemCounts[i]);
            baseWeight = 1;
            if(avgCount == 0)
            {
               dynamicWeights.push(baseWeight);
            }
            else
            {
               scarcityRatio = Math.pow(avgCount / (currentCount + 1),scarcityFactor);
               adjustedWeight = baseWeight * scarcityRatio;
               adjustedWeight = Math.min(baseWeight * maxMultiplier,adjustedWeight);
               dynamicWeights.push(Math.max(1,adjustedWeight));
            }
         }
         return this.weightedRandomSelect(monsterLoot,dynamicWeights);
      }
      
      private function weightedRandomSelect(options:Array, weights:Array) : Object
      {
         var w:Number = NaN;
         var randomValue:Number = NaN;
         var cumulativeWeight:Number = NaN;
         var i:int = 0;
         var totalWeight:Number = 0;
         for each(w in weights)
         {
            totalWeight += w;
         }
         randomValue = Math.random() * totalWeight;
         cumulativeWeight = 0;
         for(i = 0; i < options.length; i++)
         {
            cumulativeWeight += weights[i];
            if(randomValue <= cumulativeWeight)
            {
               return options[i];
            }
         }
         return options[options.length - 1];
      }
      
      public function fallEquip() : void
      {
         var _loc3_:Number;
         var _loc4_:*;
         var _loc5_:*;
         var _loc6_:*;
         var _loc7_:*;
         var _loc8_:*;
         var _loc9_:*;
         var _loc10_:int;
         var _loc1_:String;
         var _loc2_:Array;
         trace(this.monsterName);
         _loc3_ = Number(NaN);
         _loc4_ = undefined;
         _loc5_ = undefined;
         _loc6_ = undefined;
         _loc7_ = 0;
         _loc8_ = null;
         _loc9_ = null;
         _loc10_ = 0;
         _loc1_ = getQualifiedClassName(this);
         _loc2_ = _loc1_.split("::");
         if(gc.difficulity != 2)
         {
            gc.allTask.killMonster(_loc2_[1]);
         }
         _loc3_ = Number(this.protectedParamsObject.probability);
         if(this.isBoss)
         {
            _loc3_ *= 1.5;
         }
         _loc4_ = 0;
         _loc5_ = 0;
         _loc6_ = 0;
         if(gc.hero1)
         {
            _loc5_ = Number(gc.hero1.getPlayer().getCurFashionEquipFallThingProbability());
         }
         if(gc.hero2)
         {
            _loc6_ = Number(gc.hero2.getPlayer().getCurFashionEquipFallThingProbability());
         }
         _loc4_ = Number(Math.max(_loc5_,_loc6_));
         _loc3_ *= 1 + _loc4_;
         if(Math.random() > _loc3_)
         {
            return;
         }
         try
         {
            if(gc.hero2)
            {
               _loc7_ = this.getMonsterDrop(this.fallList,gc.hero2.getPlayer());
            }
            else
            {
               _loc7_ = this.getMonsterDrop(this.fallList,gc.hero1.getPlayer());
            }
            if(Boolean(_loc7_) || _loc7_ != undefined)
            {
               _loc8_ = new FallEquipObj(_loc7_);
               _loc9_ = gc.gameSence.localToGlobal(new Point(this.x,0));
               _loc10_ = 0;
               if(_loc9_.x > 930)
               {
                  _loc10_ = -200;
               }
               else if(_loc9_.x <= 10)
               {
                  _loc10_ = 200;
               }
               _loc8_.x = this.x + _loc10_;
               _loc8_.y = this.y - 100;
               this.gc.gameSence.addChild(_loc8_);
               this.gc.otherList.push(_loc8_);
            }
            return;
         }
         catch(e:*)
         {
            return;
         }
      }
      
      public function fallStone() : void
      {
         var _loc1_:* = null;
         var _loc2_:* = null;
         var _loc3_:int = 0;
         var _loc4_:* = 0;
         var _loc5_:* = 0;
         var _loc6_:* = 0;
         if(gc.hero1)
         {
            _loc5_ = Number(gc.hero1.getPlayer().getCurFashionEquipFallThingProbability());
         }
         if(gc.hero2)
         {
            _loc6_ = Number(gc.hero2.getPlayer().getCurFashionEquipFallThingProbability());
         }
         _loc4_ = Number(Math.max(_loc5_,_loc6_));
         var _loc7_:Number = Number(this.protectedParamsObject.stoneFallRate);
         _loc7_ *= 1 + _loc4_;
         if(Math.random() <= _loc7_)
         {
            _loc1_ = new FallEquipObj({
               "name":"wpqhs1",
               "bigtype":"dj"
            });
            _loc2_ = gc.gameSence.localToGlobal(new Point(this.x,0));
            _loc3_ = 0;
            if(_loc2_.x > 930)
            {
               _loc3_ = -150;
            }
            else if(_loc2_.x < 10)
            {
               _loc3_ = 150;
            }
            _loc1_.x = this.x + _loc3_;
            _loc1_.y = this.y - 100;
            this.gc.gameSence.addChild(_loc1_);
            this.gc.otherList.push(_loc1_);
         }
      }
      
      public function addMedicine() : *
      {
         var _loc1_:* = undefined;
         var _loc2_:Number = Number(NaN);
         if(Math.random() >= 0.5)
         {
            _loc2_ = Math.random();
            if(_loc2_ <= 0.2)
            {
               if(_loc2_ <= 0.1)
               {
                  if(Math.random() >= 0.55)
                  {
                     _loc1_ = new SmallHP();
                     _loc1_.x = this.x;
                     _loc1_.y = this.y - Number(_loc1_.height);
                  }
                  else
                  {
                     _loc1_ = new BigHP();
                     _loc1_.x = this.x;
                     _loc1_.y = this.y - Number(_loc1_.height);
                  }
               }
               else
               {
                  _loc1_ = new SmallHP();
                  _loc1_.x = this.x;
                  _loc1_.y = this.y - Number(_loc1_.height);
               }
            }
         }
         else if(Math.random() <= 0.25)
         {
            _loc1_ = new SmallMP();
            _loc1_.x = this.x;
            _loc1_.y = this.y - Number(_loc1_.height);
         }
         if(_loc1_ != null)
         {
            this.gc.gameSence.addChild(_loc1_);
            this.gc.otherList.push(_loc1_);
         }
      }
      
      public function faceToTarget() : void
      {
         if(this.curAttackTarget)
         {
            if(this.x < this.curAttackTarget.x)
            {
               this.turnRight();
            }
            else
            {
               this.turnLeft();
            }
         }
      }
      
      public function cureHp(param1:int) : void
      {
         if(!this.isDead())
         {
            if(this.getHp() + param1 > this.getSHp())
            {
               this.setHp(this.getSHp());
            }
            else
            {
               this.setHp(this.getHp() + param1);
            }
            if(this.isBoss)
            {
               gc.gameInfo.addBossBlood(this.monsterName,100 - Math.round(100 * (this.getHp() / this.getSHp())),false,this.getHp() / this.getSHp());
            }
            this.addCureMc(param1);
         }
      }
      
      public function getCurAttackTarget() : BaseObject
      {
         return this.curAttackTarget;
      }
      
      public function setLevel(param1:int) : void
      {
         this.level1 = AUtils.getRandomValue();
         this.level2 = param1 - this.level1;
      }
      
      public function getLevel() : int
      {
         return this.level1 + this.level2;
      }
      
      public function setHp(param1:int) : void
      {
         this.hp1 = AUtils.getRandomValue();
         this.hp2 = param1 - this.hp1;
      }
      
      public function getHp() : int
      {
         return this.hp1 + this.hp2;
      }
      
      public function setSHp(param1:int) : void
      {
         this.sHp1 = AUtils.getRandomValue();
         this.sHp2 = param1 - this.sHp1;
      }
      
      public function getSHp() : int
      {
         return this.sHp1 + this.sHp2;
      }
      
      public function setDef(param1:int) : void
      {
         this.protectedParamsObject.def = param1;
      }
      
      public function getDef() : int
      {
         return this.protectedParamsObject.def;
      }
      
      public function getFootBottom() : Number
      {
         return this.y + this.colipse.y + this.colipse.height / 2;
      }
      
      override public function getRealPower(param1:String, param2:Boolean = true) : Object
      {
         var _loc3_:Object = this.attackBackInfoDict[param1];
         var _loc4_:int = 1;
         var _loc5_:Number = 1;
         if(Math.random() <= Number(this.protectedParamsObject.Critical) / 100 && param2)
         {
            _loc4_ = 2;
         }
         if(this.getCurAddEffect(BaseAddEffect.MAGIC_FLOWER_DEBUFF))
         {
            _loc5_ = 0.925;
         }
         if(_loc3_)
         {
            if(gc.difficulity == 1)
            {
               return {
                  "hurt":Number(_loc3_.power) * _loc4_ * _loc5_,
                  "qixue":0
               };
            }
            return {
               "hurt":Number(_loc3_.power) * _loc4_ * _loc5_,
               "qixue":0
            };
         }
         return {
            "hurt":0,
            "qixue":0
         };
      }
      
      override public function isWalkOrRun() : Boolean
      {
         return this.curAction == "walk" || this.curAction == "run";
      }
      
      override public function isNormalHit() : Boolean
      {
         return true;
      }
      
      public function get def() : *
      {
         var Def:int = 0;
         var zx:int = 0;
         if(this.getCurAddEffect(BaseAddEffect.TIANTINGZHANSHEN))
         {
            Def = int(this.protectedParamsObject.def * this.curAddEffect.getTTZSnum(1));
            trace("怪物被减防了" + this.curAddEffect.getTTZSnum(1));
            return this.protectedParamsObject.def - Def;
         }
         return this.protectedParamsObject.def;
      }
      
      public function get mDef() : *
      {
         var mdef:Number = NaN;
         if(this.getCurAddEffect(BaseAddEffect.TIANTINGZHANSHEN))
         {
            mdef = this.curAddEffect.getTTZSnum(1);
            return this.protectedParamsObject.mDef - mdef;
         }
         if(this.getCurAddEffect(BaseAddEffect.JIUHUANSHENGJING))
         {
            return Number(this.protectedParamsObject.mDef) * 0.99;
         }
         return this.protectedParamsObject.mDef;
      }
      
      public function get Hit() : *
      {
         if(this.getCurAddEffect(BaseAddEffect.MAGIC_FLAG_DEBUFF) || this.getCurAddEffect(BaseAddEffect.MAGIC_FLOWER_DEBUFF))
         {
            if(this.isBoss)
            {
               return this.protectedParamsObject.Hit = Number(this.protectedParamsObject.Hit) / 2 + 3;
            }
            return this.protectedParamsObject.Hit = Number(this.protectedParamsObject.Hit) / 2;
         }
         if(this.isBoss)
         {
            return this.protectedParamsObject.Hit + 6;
         }
         return this.protectedParamsObject.Hit;
      }
      
      public function get ReduceMagicDef() : *
      {
         return this.protectedParamsObject.ReduceMagicDef;
      }
      
      public function get Toughness() : *
      {
         return this.protectedParamsObject.Toughness;
      }
      
      public function get Critical() : *
      {
         return this.protectedParamsObject.Critical;
      }
      
      public function get Dodge() : *
      {
         return this.protectedParamsObject.Dodge;
      }
      
      public function get Guardian() : *
      {
         return this.protectedParamsObject.Guardian;
      }
   }
}

