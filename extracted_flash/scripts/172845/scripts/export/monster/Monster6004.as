package export.monster
{
   import base.*;
   import com.game.manager.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.Point;
   import my.*;
   
   public class Monster6004 extends MonsterEntity
   {
      
      private static var _this:Monster6004;
      
      private var dj:int;
      
      private var fsCount:uint = 0;
      
      private var canhalfskill:Boolean = true;
      
      private var canSummon:Boolean = true;
      
      private var bossX:Number = 0;
      
      private var TELEPORT_DISTANCE:Number = 380;
      
      private var LEFT_BOUNDARY:Number = 70;
      
      private var RIGHT_BOUNDARY:Number = 1070;
      
      private var attackTargetX:Number = 0;
      
      private var beidongwudi:Number = 0;
      
      public function Monster6004()
      {
         super();
         _this = this;
         this.setHp(9500000 * 0.6 * 0.7);
         this.setSHp(9500000 * 0.6 * 0.7);
         this.protectedParamsObject.def = 2930;
         this.protectedParamsObject.exp = 5000;
         this.protectedParamsObject.gxp = 5000;
         this.protectedParamsObject.mDef = 0.51;
         this.protectedParamsObject.Hit = 25;
         this.protectedParamsObject.Critical = 25;
         this.protectedParamsObject.Dodge = 13;
         this.protectedParamsObject.ReduceMagicDef = 0.1325;
         this.protectedParamsObject.Toughness = 20;
         this.protectedParamsObject.rehp = 13098;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[4,-2],
            "attackInterval":999,
            "power":14436 * 0.5,
            "attackKind":"magic",
            "backlashrate":7
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[4,-2],
            "attackInterval":999,
            "power":12129,
            "attackKind":"physics",
            "backlashrate":11
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[0,-14],
            "attackInterval":7,
            "power":14436 * 0.36,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[3,0],
            "attackInterval":6,
            "power":14436 * 0.24,
            "attackKind":"magic",
            "backlashrate":9
         };
         this.attackBackInfoDict["hit5"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[5,2],
            "attackInterval":12,
            "power":1.8,
            "attackKind":"magic",
            "backlashrate":15
         };
         this.horizenSpeed = 6;
         this.monsterName = "白水神君";
         this.isBoss = true;
         this.skillCD1 = [gc.frameClips * 1.5,gc.frameClips * 5];
         this.skillCD2 = [gc.frameClips * 5,gc.frameClips * 4];
         this.skillCD3 = [gc.frameClips * 12,gc.frameClips * 7.2];
         this.skillCD4 = [gc.frameClips * 15,gc.frameClips * 9];
         this.protectedParamsObject.mysee = 300;
         this.protectedParamsObject.isattback = 50;
         this.attackRange = 150;
         this.alertRange = 1000;
         this.protectedParamsObject.probability = 0;
         this.normalAttackRate = 0;
         this.fallList = [{
            "name":"wpxt",
            "bigtype":"dj"
         }];
      }
      
      public static function getInstance() : Monster6004
      {
         return _this;
      }
      
      override public function step() : void
      {
         super.step();
         if(this.curAction == "jump1" && this.speed.y > 0)
         {
            this.setAction("jumpdown");
         }
      }
      
      override protected function initBBDC() : void
      {
         try
         {
            bbdc = AnimationManager.getAnimation("baishuishenjun");
            bbdc.setOffset(-157,-163);
            bbdc.setAction("wait");
            bbdc.turnLeft();
            bbdc.addCallBack(this.onEnterFrame,this.onActionOver);
            this.body.addChild(bbdc);
            return;
         }
         catch(e:*)
         {
         }
      }
      
      override protected function newColipse() : void
      {
         this.colipse = AUtils.getNewObj("ObjectBaseSprite") as Sprite;
         this.colipse.width = 38;
         this.colipse.height = 112;
         this.colipse.visible = false;
         this.addChild(this.colipse);
      }
      
      override public function setAction(param1:String) : void
      {
         var I:Number = Math.random();
         if(param1 == "hurt")
         {
            if(I < 0.33)
            {
               param1 = "hurt_1";
            }
            else if(0.33 <= I < 0.66)
            {
               param1 = "hurt_2";
            }
            else
            {
               param1 = "hurt_3";
            }
         }
         super.setAction(param1);
         var _loc3_:Point = this.bbdc.getCurPoint();
         var _loc4_:Array = null;
         switch(param1)
         {
            case "appear":
            case "wait":
            case "walk":
               break;
            case "hit1":
               trace("hit1");
               break;
            case "hit2":
               trace("hit2");
               break;
            case "hit3":
               trace("hit3");
               break;
            case "hit4":
            case "hit5":
               break;
            case "dead":
         }
      }
      
      protected function onEnterFrame(action:String, frameCount:int) : void
      {
         var _loc3_:uint = uint(this.getBBDC().getDirect());
         switch(action)
         {
            case "skill1":
               if(frameCount == 1)
               {
                  this.speed.x = 0;
               }
               if(frameCount == 11)
               {
                  this.banyuezhan1();
               }
               if(frameCount == 14)
               {
                  this.banyuezhan1_2();
               }
               if(frameCount == 20)
               {
                  this.banyuezhan1_2();
               }
               break;
            case "skill2_1":
               if(frameCount == 1)
               {
                  this.speed.x = 0;
               }
               if(frameCount == 20)
               {
                  this.bossTeleport();
               }
               this.speed.x = 0;
               this.speed.y = 0;
               break;
            case "skill2_2":
               if(frameCount == 1)
               {
                  this.speed.x = 0;
                  this.manyuezhan_1();
               }
               this.speed.x = 0;
               this.speed.y = 0;
               break;
            case "skill3_1":
               if(frameCount == 1)
               {
                  this.speed.x = 0;
               }
               this.speed.y = 0;
               break;
            case "skill3_2":
               if(frameCount == 1)
               {
                  this.speed.x = 0;
               }
               if(Boolean(this.curAttackTarget))
               {
                  if(frameCount == 8)
                  {
                     this.attackTargetX = this.curAttackTarget.x;
                  }
                  if(frameCount == 18)
                  {
                     this.yuesemenglong_2(this.attackTargetX);
                  }
                  if(frameCount == 26)
                  {
                     this.attackTargetX = this.curAttackTarget.x;
                  }
                  if(frameCount == 36)
                  {
                     this.yuesemenglong_2(this.attackTargetX);
                  }
                  if(frameCount == 44)
                  {
                     this.attackTargetX = this.curAttackTarget.x;
                  }
                  if(frameCount == 54)
                  {
                     this.yuesemenglong_2(this.attackTargetX);
                  }
                  if(frameCount == 62)
                  {
                     this.attackTargetX = this.curAttackTarget.x;
                  }
                  if(frameCount == 72)
                  {
                     this.yuesemenglong_2(this.attackTargetX);
                  }
               }
               this.speed.y = 0;
               break;
            case "skill4":
               if(frameCount == 1)
               {
                  this.speed.x = 0;
                  this.huguangyueshan_1();
               }
               if(frameCount < 40)
               {
                  this.faceToTarget();
               }
               if(frameCount == 40)
               {
                  this.huguangyueshan_2();
               }
               this.speed.y = 0;
               break;
            case "skill4_2":
               if(frameCount == 1)
               {
                  this.huguangyueshan_2();
               }
               this.speed.y = 0;
               break;
            case "shanxian":
               if(frameCount == 1)
               {
                  this.shanxian();
               }
               this.speed.y = 0;
               break;
            case "shanxian_2":
               if(frameCount == 1)
               {
                  this.shanxian();
               }
               this.speed.y = 0;
         }
      }
      
      protected function onActionOver(action:String) : void
      {
         switch(action)
         {
            case "wait":
            default:
               this.setAction("wait");
               break;
            case "walk":
               this.setAction("walk");
               break;
            case "skill1":
               this.setAction("wait");
               break;
            case "skill3_1":
               this.setAction("skill3_2");
               break;
            case "skill3_2":
               this.setAction("skill3_3");
               break;
            case "skill3_3":
               this.setAction("wait");
               break;
            case "skill4":
               this.setAction("wait");
               this.speed.x = 0;
               break;
            case "jump1":
               this.setAction("jump1");
               break;
            case "jumpdown":
               this.setAction("jumpdown");
               break;
            case "skill2_1":
               this.setAction("skill2_2");
               this.speed.x = 0;
               break;
            case "skill2_2":
               this.setAction("wait");
               break;
            case "skill4_1":
               this.setAction("skill4_2");
               this.huguangyueshan_3();
               break;
            case "skill4_2":
               this.setAction("skill4_3");
               break;
            case "shanxian":
               this.setAction("shanxian_2");
               this.shanxian();
               if(this.getBBDC().getDirect() == 0)
               {
                  if(Boolean(this.curAttackTarget))
                  {
                     this.x = this.curAttackTarget.x - 30;
                     this.y = this.curAttackTarget.y;
                  }
               }
               else if(Boolean(this.curAttackTarget))
               {
                  this.x = this.curAttackTarget.x + 30;
                  this.y = this.curAttackTarget.y;
               }
               break;
            case "hurt_1":
            case "hurt_2":
            case "hurt_3":
               this.setAction("wait");
               this.setStatic();
               this.speed.x = 0;
               this.speed.y = 0;
               break;
            case "dead":
               this.dropAura();
               this.destroy();
         }
      }
      
      private function banyuezhan1() : void
      {
         var _loc2_:S_ShapeMoveBullet = new S_ShapeMoveBullet("baishuishenjun_skill1_2","baishuishenjun_skill1_2_box");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 157 + 127;
         }
         else
         {
            _loc2_.x = this.x + 157 - 127;
         }
         _loc2_.y = this.y - 163 + 175;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.setDistance(99999);
         _loc2_.setDestroyInCount(75);
         _loc2_.setSpeed(this.getBBDC().getDirect() == 0 ? -12 : 12,0);
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function banyuezhan1_2() : void
      {
         var _loc2_:S_ShapeMoveBullet = new S_ShapeMoveBullet("baishuishenjun_skill1_2","baishuishenjun_skill1_2_box");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 157 + 127;
         }
         else
         {
            _loc2_.x = this.x + 157 - 127;
         }
         _loc2_.y = this.y - 163 + 175;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.setDistance(99999);
         _loc2_.setzhengfu(1);
         _loc2_.setDestroyInCount(75);
         _loc2_.setSpeed(this.getBBDC().getDirect() == 0 ? -12 : 12,0);
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function manyuezhan_1() : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("baishuishenjun_skill2_1");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 157;
         }
         else
         {
            _loc2_.x = this.x + 157;
         }
         _loc2_.y = this.y - 163;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.isDisabled = true;
         _loc2_.setAction("hit2");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function bossTeleport() : void
      {
         var direction:int = 0;
         this.bossX = this.x;
         var oldBossX:int = int(this.bossX);
         var leftSpace:int = this.bossX - this.LEFT_BOUNDARY;
         var rightSpace:int = this.RIGHT_BOUNDARY - this.bossX;
         if(leftSpace < this.TELEPORT_DISTANCE && rightSpace >= this.TELEPORT_DISTANCE)
         {
            this.bossX = Math.min(this.bossX + this.TELEPORT_DISTANCE,this.RIGHT_BOUNDARY);
         }
         else if(rightSpace < this.TELEPORT_DISTANCE && leftSpace >= this.TELEPORT_DISTANCE)
         {
            this.bossX = Math.max(this.bossX - this.TELEPORT_DISTANCE,this.LEFT_BOUNDARY);
         }
         else if(this.curAttackTarget.x < this.bossX)
         {
            this.bossX = Math.min(this.bossX + this.TELEPORT_DISTANCE,this.RIGHT_BOUNDARY);
         }
         else if(this.curAttackTarget.x > this.bossX)
         {
            this.bossX = Math.max(this.bossX - this.TELEPORT_DISTANCE,this.LEFT_BOUNDARY);
         }
         else
         {
            direction = Math.random() > 0.5 ? 1 : -1;
            this.bossX += direction * this.TELEPORT_DISTANCE;
            if(this.bossX < this.LEFT_BOUNDARY)
            {
               this.bossX = this.LEFT_BOUNDARY;
            }
            if(this.bossX > this.RIGHT_BOUNDARY)
            {
               this.bossX = this.RIGHT_BOUNDARY;
            }
         }
         this.x = this.bossX;
      }
      
      private function yuesemenglong_1() : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("baishuishenjun_skill3_1");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 157;
         }
         else
         {
            _loc2_.x = this.x + 157;
         }
         _loc2_.y = this.y - 163;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.isDisabled = true;
         _loc2_.setAction("hit3");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function yuesemenglong_2(param1:Number = 0) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("baishuishenjun_skill3_2","baishuishenjun_skill3_2_box");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = param1 - _loc2_.width * 0.5;
         }
         else
         {
            _loc2_.x = param1 + _loc2_.width * 0.5;
         }
         _loc2_.y = this.y - 163;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.isDisabled = true;
         _loc2_.setAction("hit3");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function huguangyueshan_1() : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("baishuishenjun_skill4_1");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 157;
         }
         else
         {
            _loc2_.x = this.x + 157;
         }
         _loc2_.y = this.y - 163;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.isDisabled = true;
         _loc2_.setAction("hit4");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function huguangyueshan_2() : void
      {
         var _loc2_:FastAndSlowBullet = new FastAndSlowBullet("baishuishenjun_skill4_2");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 157;
         }
         else
         {
            _loc2_.x = this.x + 157;
         }
         _loc2_.y = this.y - 163;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.setDistance(900);
         _loc2_.setBeginSlowDistance(360);
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setDestroyInCount(75);
         _loc2_.setSlowSpeed(this.getBBDC().getDirect() == 0 ? -3 : 3,0);
         _loc2_.setSpeed(this.getBBDC().getDirect() == 0 ? -12 : 12,0);
         _loc2_.setAction("hit4");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function huguangyueshan_3(param1:Number, param2:Number) : void
      {
         var _loc3_:EnemyMoveBullet = new EnemyMoveBullet("baishuishenjun_skill4_3");
         _loc3_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc3_.x = param1;
         }
         else
         {
            _loc3_.x = param1;
         }
         _loc3_.y = param2;
         _loc3_.setDirect(this.getBBDC().getDirect());
         _loc3_.setDistance(1000);
         _loc3_.setDestroyWhenLastFrame(false);
         _loc3_.setAction("hit5");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function shanxian() : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("shanxian");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 205 - 61;
         }
         else
         {
            _loc2_.x = this.x + 205 + 61;
         }
         _loc2_.y = this.y - 175 - 77;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.isDisabled = true;
         _loc2_.setAction("hit3");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      override protected function releSkill1() : void
      {
         this.newAttackId();
         this.setAction("skill1");
         this.lastHit = "skill1";
         this.faceToTarget();
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this,this.curAttackTarget) <= 900 && this.isBoss && !this.isInSky();
      }
      
      override protected function releSkill2() : void
      {
         this.newAttackId();
         this.setAction("skill2_1");
         this.lastHit = "skill2_1";
         this.faceToTarget();
      }
      
      override protected function beforeSkill2Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this,this.curAttackTarget) <= 10000 && this.isBoss && !this.isInSky();
      }
      
      override protected function releSkill3() : void
      {
         this.newAttackId();
         this.setAction("skill3_1");
         this.lastHit = "skill3_1";
         this.faceToTarget();
      }
      
      override protected function beforeSkill3Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && this.isBoss && !this.isInSky();
      }
      
      override protected function releSkill4() : void
      {
         this.newAttackId();
         this.setAction("skill4");
         this.lastHit = "skill4";
         this.faceToTarget();
      }
      
      override protected function beforeSkill4Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && !this.isInSky();
      }
      
      override protected function releSkill5() : void
      {
      }
      
      override protected function beforeSkill5Start() : Boolean
      {
      }
      
      override protected function exitFrameFunc(param1:Point) : void
      {
      }
      
      override public function isCanMoveWhenAttack() : Boolean
      {
         return this.curAction == "skill4_2" || this.curAction == "skill2";
      }
      
      override protected function isXCannotMoveWhenAttack() : Boolean
      {
         return this.curAction == "skill1" || this.curAction == "skill2_1" || this.curAction == "skill2_2" || this.curAction == "skill3_1" || this.curAction == "skill3_2" || this.curAction == "skill3_3" || this.curAction == "skill4" || this.curAction == "skill4_1" || this.curAction == "shanxian" || this.curAction == "shanxian_2";
      }
      
      override protected function isYCannotMoveWhenAttack() : Boolean
      {
         return this.curAction == "skill1" || this.curAction == "skill2_1" || this.curAction == "skill2_2" || this.curAction == "skill3_1" || this.curAction == "skill3_2" || this.curAction == "skill3_3" || this.curAction == "skill4" || this.curAction == "skill4_2" || this.curAction == "skill4_1" || this.curAction == "shanxian" || this.curAction == "shanxian_2";
      }
      
      override public function isAttacking() : Boolean
      {
         return this.curAction == "skill1" || this.curAction == "skill2_1" || this.curAction == "skill2_2" || this.curAction == "skill3_1" || this.curAction == "skill3_2" || this.curAction == "skill3_3" || this.curAction == "skill4" || this.curAction == "skill4_2" || this.curAction == "skill4_1" || this.curAction == "shanxian" || this.curAction == "shanxian_2";
      }
      
      override public function reduceHp(param1:int, param2:Boolean = false) : void
      {
         if(this.curAction == "skill1" || this.curAction == "skill2_1" || this.curAction == "skill2_2" || this.curAction == "skill3_1" || this.curAction == "skill3_2" || this.curAction == "skill3_3" || this.curAction == "skill4" || this.curAction == "skill4_2" || this.curAction == "skill4_1" || this.curAction == "shanxian" || this.curAction == "shanxian_2")
         {
            param2 = false;
         }
         super.reduceHp(param1,param2);
      }
      
      override public function setAttackBack(param1:Point) : void
      {
         if(!(this.curAction == "skill1" || this.curAction == "skill2_1" || this.curAction == "skill2_2" || this.curAction == "skill3_1" || this.curAction == "skill3_2" || this.curAction == "skill3_3" || this.curAction == "skill4" || this.curAction == "skill4_2" || this.curAction == "skill4_1" || this.curAction == "shanxian" || this.curAction == "shanxian_2"))
         {
            super.setAttackBack(param1);
         }
      }
      
      override protected function myIntelligence() : void
      {
         var _loc6_:Number = NaN;
         this.beidongwudi += 1;
         if(this.beidongwudi >= 900)
         {
            _loc6_ = Math.ceil(Math.random() * 4);
            if(_loc6_ == 1 && Boolean(this.beforeSkill1Start()))
            {
               this.releSkill1();
            }
            if(_loc6_ == 2 && Boolean(this.beforeSkill1Start()))
            {
               this.releSkill2();
            }
            if(_loc6_ == 3 && Boolean(this.beforeSkill1Start()))
            {
               this.releSkill3();
            }
            if(_loc6_ == 4 && Boolean(this.beforeSkill1Start()))
            {
               this.releSkill4();
            }
            this.setYourFather(gc.frameClips * 2,true);
            this.beidongwudi = 0;
         }
         super.myIntelligence();
         if(!this.isBoss && !this.isDead())
         {
         }
         if(this.isBoss)
         {
         }
         trace(this.curAddEffect.getBuffTimeLeftByName(BaseAddEffect.STUN));
      }
      
      override protected function jump() : void
      {
         this.setAction("jump1");
         this.speed.y = -25;
      }
      
      override protected function attackTarget() : void
      {
         this.newAttackId();
         this.setAction("skill1");
         this.lastHit = "skill1";
         this.faceToTarget();
      }
      
      override public function destroy() : void
      {
         var _loc1_:Array = null;
         var _loc2_:int = 0;
         var _loc3_:MovieClip = null;
         super.destroy();
         MainGame.getInstance().createMonster(6005,this.x,this.y);
         if(this.isBoss)
         {
         }
      }
   }
}

