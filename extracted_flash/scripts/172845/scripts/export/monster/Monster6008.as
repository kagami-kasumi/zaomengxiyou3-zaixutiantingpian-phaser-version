package export.monster
{
   import base.*;
   import com.game.manager.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.Point;
   import my.*;
   
   public class Monster6008 extends MonsterEntity
   {
      
      private static var _this:Monster6008;
      
      private var dj:int;
      
      private var fsCount:uint = 0;
      
      private var canhalfskill:Boolean = true;
      
      private var canSummon:Boolean = true;
      
      private var firebolltime:int = 360;
      
      public function Monster6008()
      {
         super();
         _this = this;
         this.setHp(9800000 * 0.6 * 0.7);
         this.setSHp(9800000 * 0.6 * 0.7);
         this.protectedParamsObject.def = 2988;
         this.protectedParamsObject.exp = 5000;
         this.protectedParamsObject.gxp = 5000;
         this.protectedParamsObject.mDef = 0.52;
         this.protectedParamsObject.Hit = 25;
         this.protectedParamsObject.Critical = 25;
         this.protectedParamsObject.Dodge = 13;
         this.protectedParamsObject.ReduceMagicDef = 0.1325;
         this.protectedParamsObject.Toughness = 20;
         this.protectedParamsObject.rehp = 15470;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[4,-2],
            "attackInterval":999,
            "power":12511 * 0.9,
            "attackKind":"physics",
            "backlashrate":7,
            "addEffect":[{
               "name":BaseAddEffect.MONSTER6008FIRE,
               "time":gc.frameClips * 4,
               "value":1
            }]
         };
         this.attackBackInfoDict["hit1_1"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[4,-2],
            "attackInterval":999,
            "power":12511 * 0.9,
            "attackKind":"physics",
            "backlashrate":7,
            "addEffect":[{
               "name":BaseAddEffect.MONSTER6008FIRE,
               "time":gc.frameClips * 4,
               "value":1
            }]
         };
         this.attackBackInfoDict["hit1_2"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[4,-2],
            "attackInterval":999,
            "power":12511 * 0.9,
            "attackKind":"physics",
            "backlashrate":7
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[4,-2],
            "attackInterval":7,
            "power":15285 * 0.3,
            "attackKind":"magic",
            "backlashrate":11
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[0,0],
            "attackInterval":999,
            "power":15285 * 0.6,
            "attackKind":"magic",
            "backlashrate":7,
            "addEffect":[{
               "name":BaseAddEffect.MONSTER6008FIRE,
               "time":gc.frameClips * 4,
               "value":1
            }]
         };
         this.attackBackInfoDict["hit3_1"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[0,0],
            "attackInterval":999,
            "power":15285 * 0.7,
            "attackKind":"magic",
            "backlashrate":7,
            "addEffect":[{
               "name":BaseAddEffect.MONSTER6008FIRE,
               "time":gc.frameClips * 4,
               "value":1
            }]
         };
         this.attackBackInfoDict["hit3_2"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[0,0],
            "attackInterval":999,
            "power":15285 * 0.4,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[0,-10],
            "attackInterval":999,
            "power":15285 * 1.5,
            "attackKind":"magic",
            "backlashrate":7,
            "addEffect":[{
               "name":BaseAddEffect.MONSTER6008FIRE,
               "time":gc.frameClips * 4,
               "value":1
            }]
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
         this.monsterName = "青阳神君";
         this.isBoss = true;
         this.skillCD1 = [gc.frameClips * 1.5,gc.frameClips * 5.5];
         this.skillCD2 = [gc.frameClips * 5.2,gc.frameClips * 16];
         this.skillCD3 = [gc.frameClips * 3,gc.frameClips * 6];
         this.protectedParamsObject.mysee = 300;
         this.protectedParamsObject.isattback = 50;
         this.attackRange = 150;
         this.alertRange = 1000;
         this.protectedParamsObject.probability = 0;
         this.fallList = [{
            "name":"wpxt",
            "bigtype":"dj"
         }];
      }
      
      public static function getInstance() : Monster6008
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
            bbdc = AnimationManager.getAnimation("qingyangshenjun");
            bbdc.setOffset(-151,-166);
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
         this.colipse.visible = false;
         this.colipse.width = 38;
         this.colipse.height = 112;
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
               if(frameCount == 15)
               {
                  if(this.getBBDC().getDirect() == 0)
                  {
                     this.speed.x = -16;
                  }
                  else
                  {
                     this.speed.x = 16;
                  }
               }
               if(frameCount == 14)
               {
                  this.banyuezhan1();
               }
               if(frameCount == 19)
               {
                  this.speed.x = 0;
               }
               if(frameCount == 31)
               {
                  this.banyuezhan1_1();
               }
               if(frameCount == 58)
               {
                  this.banyuezhan1_2();
               }
               if(frameCount == 50)
               {
                  this.faceToTarget();
                  this.speed.y = -37.6;
                  if(Math.abs(this.x - this.curAttackTarget.x) <= 240)
                  {
                     this.speed.x = Boolean(this.curAttackTarget) ? (this.curAttackTarget.x - this.x) / 9 : 0;
                  }
                  else if(this.curAttackTarget.x - this.x > 0)
                  {
                     this.speed.x = 300 / 9;
                  }
                  else if(this.curAttackTarget.x - this.x < 0)
                  {
                     this.speed.x = -300 / 9;
                  }
                  else
                  {
                     this.spee.x = 0;
                  }
               }
               if(frameCount == 54)
               {
                  this.graity = 0;
                  this.speed.y = 30.08;
               }
               if(frameCount == 59)
               {
                  this.graity = 1.5;
                  this.speed.x = 0;
               }
               break;
            case "skill2":
               if(frameCount == 1)
               {
                  this.manyuezhan_1();
                  this.speed.x = 0;
               }
               if(frameCount == 23)
               {
                  this.curAddEffect.add([{
                     "name":BaseAddEffect.MONSTER6008SKILL2,
                     "time":gc.frameClips * 6,
                     "value":this.protectedParamsObject.def * 0.42
                  }]);
               }
               break;
            case "skill2_2":
               if(frameCount == 1)
               {
                  this.speed.x = 0;
                  this.manyuezhan_1();
                  this.manyuezhan_2();
                  MainGame.getInstance().createMonster(6010,this.x,this.y);
               }
               if(this.getBBDC().getDirect() == 0)
               {
                  this.speed.x = -70;
               }
               else
               {
                  this.speed.x = 70;
               }
               break;
            case "skill3":
               if(frameCount == 1)
               {
                  this.yuesemenglong();
                  this.speed.x = 0;
               }
               if(frameCount == 32)
               {
                  this.faceToTarget();
                  this.yuesemenglong_1();
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
               this.speed.x = 0;
               break;
            case "skill3":
               this.setAction("wait");
               break;
            case "skill3_2":
               this.setAction("wait");
               break;
            case "skill4_3":
               this.setAction("wait");
               this.speed.x = 0;
               break;
            case "jump1":
               this.setAction("jump1");
               break;
            case "jumpdown":
               this.setAction("jumpdown");
               break;
            case "skill2":
               this.setAction("wait");
               break;
            case "skill2_2":
               this.setAction("skill2_3");
               this.speed.x = 0;
               break;
            case "skill2_3":
               this.setAction("wait");
               break;
            case "skill4_1":
               this.setAction("skill4_2");
               break;
            case "skill4_2":
               this.setAction("skill4_3");
               break;
            case "hurt_1":
            case "hurt_2":
            case "hurt_3":
               this.setAction("wait");
               break;
            case "dead":
               this.destroy();
         }
      }
      
      private function banyuezhan1() : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("qingyangshenjun_skill1_1");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 151;
         }
         else
         {
            _loc2_.x = this.x + 151;
         }
         _loc2_.y = this.y - 166;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function banyuezhan1_1() : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("qingyangshenjun_skill1_2");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 151;
         }
         else
         {
            _loc2_.x = this.x + 151;
         }
         _loc2_.y = this.y - 166;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function banyuezhan1_2() : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("qingyangshenjun_skill1_3");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 151;
         }
         else
         {
            _loc2_.x = this.x + 151;
         }
         _loc2_.y = this.y - 166;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.setAction("hit1_1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function banyuezhan3() : void
      {
         var _loc2_:EnemyMoveBullet = new EnemyMoveBullet("ttzs_skill1_3");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 151;
         }
         else
         {
            _loc2_.x = this.x + 151;
         }
         _loc2_.y = this.y - 166;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.setDistance(600);
         _loc2_.setSpeed(this.getBBDC().getDirect() == 0 ? -22.5 : 22.5,0);
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setAction("hit1_2");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function manyuezhan_1() : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("qingyangshenjun_skill2_1");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 151;
         }
         else
         {
            _loc2_.x = this.x + 151;
         }
         _loc2_.y = this.y - 166;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.isDisabled = true;
         _loc2_.setAction("hit2");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function manyuezhan_2() : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("ttzs_skill2_1");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 156 - 251;
         }
         else
         {
            _loc2_.x = this.x + 156 + 251;
         }
         _loc2_.y = this.y - 157 + 27;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.setAction("hit2");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function yuesemenglong() : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("qingyangshenjun_skill3_1");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 151;
         }
         else
         {
            _loc2_.x = this.x + 151;
         }
         _loc2_.y = this.y - 166;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.isDisabled = true;
         _loc2_.setAction("hit3");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function yuesemenglong_0(param1:BaseBullet = null) : void
      {
      }
      
      private function yuesemenglong_1() : void
      {
         var _loc2_:EnemyMoveBullet3 = new EnemyMoveBullet3("qingyangshenjun_skill3_2","qingyangshenjun_skill3_2_box");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 151 + 154;
         }
         else
         {
            _loc2_.x = this.x + 151 - 154;
         }
         _loc2_.y = this.y - 166 + 29;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.setMoveTarget(this.curAttackTarget);
         _loc2_.isDisabled = true;
         _loc2_.setSpeed(20);
         _loc2_.setDistance(640);
         _loc2_.setFuncWhenHit(this.yuesemenglong_0);
         _loc2_.setFuncWhenHitWall(this.yuesemenglong_0);
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setAction("hit3");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      public function yuesemenglong_2(param1:Number, param2:Number, param3:int) : void
      {
         var _loc4_:SpecialEffectBullet = new SpecialEffectBullet("qingyangshenjun_skill3_3");
         _loc4_.setRole(this);
         if(param3 == -1)
         {
            _loc4_.x = param1 - 200;
         }
         else
         {
            _loc4_.x = param1 + 200;
         }
         _loc4_.y = param2 - 86;
         _loc4_.setDirect(this.getBBDC().getDirect());
         _loc4_.setAction("hit3_1");
         gc.gameSence.addChild(_loc4_);
         this.magicBulletArray.push(_loc4_);
      }
      
      private function yuesemenglong_3(param1:Number, param2:Number, param3:int) : void
      {
         var _loc4_:ParabolaBullet = new ParabolaBullet("qingyangshenjun_skill3_4");
         _loc4_.setRole(this);
         if(param3 == -1)
         {
            _loc4_.x = param1 - 70;
         }
         else
         {
            _loc4_.x = param1 + 70;
         }
         _loc4_.y = param2 - 1;
         _loc4_.setDirect(param3 == -1 ? 0 : 1);
         _loc4_.setSpeed(this.getBBDC().getDirect() == 0 ? -4 : 4,-15);
         _loc4_.setDistance(1000);
         _loc4_.setDestroyWhenLastFrame(false);
         _loc4_.setAction("hit3_2");
         gc.gameSence.addChild(_loc4_);
         this.magicBulletArray.push(_loc4_);
      }
      
      private function yuesemenglong_4(param1:Number, param2:Number, param3:int) : void
      {
         var _loc4_:ParabolaBullet = new ParabolaBullet("qingyangshenjun_skill3_4");
         _loc4_.setRole(this);
         if(param3 == -1)
         {
            _loc4_.x = param1 - 70;
         }
         else
         {
            _loc4_.x = param1 + 70;
         }
         _loc4_.y = param2 - 1;
         _loc4_.setDirect(param3 == -1 ? 1 : 0);
         _loc4_.setSpeed(this.getBBDC().getDirect() == 0 ? 4 : -4,-15);
         _loc4_.setDistance(1000);
         _loc4_.setDestroyWhenLastFrame(false);
         _loc4_.setAction("hit3_2");
         gc.gameSence.addChild(_loc4_);
         this.magicBulletArray.push(_loc4_);
      }
      
      private function yuesemenglong_5(param1:Number, param2:Number, param3:int) : void
      {
         var _loc4_:ParabolaBullet = new ParabolaBullet("qingyangshenjun_skill3_4");
         _loc4_.setRole(this);
         if(param3 == -1)
         {
            _loc4_.x = param1 - 70;
         }
         else
         {
            _loc4_.x = param1 + 70;
         }
         _loc4_.y = param2 - 1;
         _loc4_.setDirect(param3 == -1 ? 0 : 1);
         _loc4_.setSpeed(this.getBBDC().getDirect() == 0 ? -6 : 6,-15);
         _loc4_.setDistance(1000);
         _loc4_.setDestroyWhenLastFrame(false);
         _loc4_.setAction("hit3_2");
         gc.gameSence.addChild(_loc4_);
         this.magicBulletArray.push(_loc4_);
      }
      
      private function yuesemenglong_6(param1:Number, param2:Number, param3:int) : void
      {
         var _loc4_:ParabolaBullet = new ParabolaBullet("qingyangshenjun_skill3_4");
         _loc4_.setRole(this);
         if(param3 == -1)
         {
            _loc4_.x = param1 - 70;
         }
         else
         {
            _loc4_.x = param1 + 70;
         }
         _loc4_.y = param2 - 1;
         _loc4_.setDirect(param3 == -1 ? 1 : 0);
         _loc4_.setSpeed(this.getBBDC().getDirect() == 0 ? 6 : -6,-15);
         _loc4_.setDistance(1000);
         _loc4_.setDestroyWhenLastFrame(false);
         _loc4_.setAction("hit3_2");
         gc.gameSence.addChild(_loc4_);
         this.magicBulletArray.push(_loc4_);
      }
      
      private function huguangyueshan_1() : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("qingyangshenjun_skill4_2");
         _loc2_.setRole(this);
         _loc2_.x = this.curAttackTarget.x - 162;
         _loc2_.y = 444.95 - 198 + 33;
         trace("this.y:" + this.y);
         _loc2_.setDirect(0);
         _loc2_.isDisabled = true;
         _loc2_.setFuncWhenDestroy(this.huguangyueshan_2);
         _loc2_.setAction("hit4");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function huguangyueshan_2(param1:BaseBullet) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("qingyangshenjun_skill4_1","qingyangshenjun_skill4_1_box");
         _loc2_.setRole(this);
         _loc2_.x = param1.x;
         _loc2_.y = param1.y;
         _loc2_.setDirect(0);
         _loc2_.isDisabled = true;
         _loc2_.setAction("hit4");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function huguangyueshan_3() : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("skill4_3");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 205 - 1000;
         }
         else
         {
            _loc2_.x = this.x + 205 + 1000;
         }
         _loc2_.y = this.y - 175 + 93;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.setAction("hit4");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
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
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this,this.curAttackTarget) <= 150;
      }
      
      override protected function releSkill2() : void
      {
         this.newAttackId();
         this.setAction("skill2");
         this.lastHit = "skill2";
         this.faceToTarget();
      }
      
      override protected function beforeSkill2Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this,this.curAttackTarget) <= 300;
      }
      
      override protected function releSkill3() : void
      {
         this.newAttackId();
         this.setAction("skill3");
         this.lastHit = "skill3";
         this.faceToTarget();
      }
      
      override protected function beforeSkill3Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && this.isBoss;
      }
      
      override protected function releSkill4() : void
      {
      }
      
      override protected function beforeSkill4Start() : Boolean
      {
         return Boolean(this.curAttackTarget);
      }
      
      override protected function releSkill5() : void
      {
      }
      
      override protected function beforeSkill5Start() : Boolean
      {
         return Boolean(this.curAttackTarget);
      }
      
      override protected function exitFrameFunc(param1:Point) : void
      {
      }
      
      override public function isCanMoveWhenAttack() : Boolean
      {
         return this.curAction == "skill4_2" || this.curAction == "skill2_1" || this.curAction == "skill2_2" || this.curAction == "skill2_3" || this.curAction == "skill1";
      }
      
      override protected function isXCannotMoveWhenAttack() : Boolean
      {
         return this.curAction == "skill2" || this.curAction == "skill3" || this.curAction == "skill3_2" || this.curAction == "skill4_3" || this.curAction == "skill4_1" || this.curAction == "shanxian" || this.curAction == "shanxian_2";
      }
      
      override protected function isYCannotMoveWhenAttack() : Boolean
      {
         return this.curAction == "skill2" || this.curAction == "skill2_2" || this.curAction == "skill2_3" || this.curAction == "skill3" || this.curAction == "skill3_2" || this.curAction == "skill4_3" || this.curAction == "skill4_2" || this.curAction == "skill4_1" || this.curAction == "shanxian" || this.curAction == "shanxian_2";
      }
      
      override public function isAttacking() : Boolean
      {
         return this.curAction == "skill1" || this.curAction == "skill2" || this.curAction == "skill2_2" || this.curAction == "skill2_3" || this.curAction == "skill3" || this.curAction == "skill3_2" || this.curAction == "skill4_3" || this.curAction == "skill4_2" || this.curAction == "skill4_1" || this.curAction == "shanxian" || this.curAction == "shanxian_2";
      }
      
      override public function reduceHp(param1:int, param2:Boolean = false) : void
      {
         if(this.curAction == "skill1" || this.curAction == "skill2" || this.curAction == "skill2_2" || this.curAction == "skill2_3" || this.curAction == "skill3" || this.curAction == "skill3_2" || this.curAction == "skill4_3" || this.curAction == "skill4_2" || this.curAction == "skill4_1" || this.curAction == "shanxian" || this.curAction == "shanxian_2")
         {
            param2 = false;
         }
         super.reduceHp(param1,param2);
      }
      
      override public function setAttackBack(param1:Point) : void
      {
         if(!(this.curAction == "skill1" || this.curAction == "skill2" || this.curAction == "skill2_2" || this.curAction == "skill2_3" || this.curAction == "skill3" || this.curAction == "skill3_2" || this.curAction == "skill4_3" || this.curAction == "skill4_2" || this.curAction == "skill4_1" || this.curAction == "shanxian" || this.curAction == "shanxian_2"))
         {
            super.setAttackBack(param1);
         }
      }
      
      override protected function myIntelligence() : void
      {
         super.myIntelligence();
         if(!this.isBoss && !this.isDead())
         {
         }
         if(this.isBoss)
         {
         }
         ++this.firebolltime;
         if(this.firebolltime > gc.frameClips * 15)
         {
            this.firebolltime = 0;
            if(this.curAttackTarget != null)
            {
               this.huguangyueshan_1();
            }
         }
      }
      
      override protected function jump() : void
      {
         this.setAction("jump1");
         this.speed.y = -25;
      }
      
      override protected function attackTarget() : void
      {
         this.newAttackId();
         this.setAction("skill3");
         this.lastHit = "skill3";
         this.faceToTarget();
      }
      
      override public function destroy() : void
      {
         var _loc1_:Array = null;
         var _loc2_:int = 0;
         var _loc3_:MovieClip = null;
         super.destroy();
         MainGame.getInstance().createMonster(6009,this.x,this.y);
         if(this.isBoss)
         {
         }
      }
   }
}

