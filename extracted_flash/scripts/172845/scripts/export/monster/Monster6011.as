package export.monster
{
   import base.BaseHero;
   import base.BaseObject;
   import base.MonsterEntity;
   import com.game.manager.*;
   import com.greensock.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.Point;
   
   public class Monster6011 extends MonsterEntity
   {
      
      private static var _this:Monster6011;
      
      private var dj:int;
      
      private var fsCount:uint = 0;
      
      private var canhalfskill:Boolean = true;
      
      private var canSummon:Boolean = true;
      
      public function Monster6011()
      {
         super();
         _this = this;
         this.setHp(5616644 * 0.48);
         this.setSHp(5616644 * 0.48);
         this.protectedParamsObject.def = 2988;
         this.protectedParamsObject.exp = 5000;
         this.protectedParamsObject.gxp = 5000;
         this.protectedParamsObject.mDef = 0.52;
         this.protectedParamsObject.Hit = 25;
         this.protectedParamsObject.Critical = 25;
         this.protectedParamsObject.Dodge = 13;
         this.protectedParamsObject.ReduceMagicDef = 0.1325;
         this.protectedParamsObject.Toughness = 20;
         this.protectedParamsObject.rehp = 17470;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[4,-2],
            "attackInterval":999,
            "power":12511 * 0.5,
            "attackKind":"magic",
            "backlashrate":7
         };
         this.attackBackInfoDict["hit1_1"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[4,-2],
            "attackInterval":999,
            "power":12511 * 0.5,
            "attackKind":"magic",
            "backlashrate":7
         };
         this.attackBackInfoDict["hit1_2"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[4,-2],
            "attackInterval":999,
            "power":12511 * 0.5 * 0.5,
            "attackKind":"magic",
            "backlashrate":7
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[4,-2],
            "attackInterval":7,
            "power":15285 * 0.25 * 0.5,
            "attackKind":"magic",
            "backlashrate":11
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[0,0],
            "attackInterval":54,
            "power":15285 * 0.2,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[2,-1],
            "attackInterval":999,
            "power":888,
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
         this.horizenSpeed = 0;
         this.monsterName = "绝境宫战神分身";
         this.isBoss = false;
         this.skillCD1 = [gc.frameClips * 2,gc.frameClips * 4];
         this.protectedParamsObject.mysee = 300;
         this.protectedParamsObject.isattback = 50;
         this.attackRange = 200;
         this.alertRange = 1000;
         this.normalAttackRate = 0.33;
         this.protectedParamsObject.probability = 0;
         this.fallList = [{
            "name":"wpxt",
            "bigtype":"dj"
         }];
      }
      
      public static function getInstance() : Monster6011
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
            bbdc = AnimationManager.getAnimation("tiantingzhanshenfenshen");
            bbdc.setOffset(-156,-157);
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
               if(frameCount == 10)
               {
                  this.banyuezhan1();
               }
               if(frameCount == 27)
               {
                  this.banyuezhan1_1();
               }
               break;
            case "skill2_1":
               if(frameCount == 1)
               {
                  this.speed.x = 0;
               }
         }
      }
      
      protected function onActionOver(action:String) : void
      {
         switch(action)
         {
            case "wait":
               if(this.isInSky())
               {
                  this.setAction("jumpdown");
               }
               else
               {
                  this.setAction("wait");
               }
            default:
               this.setAction("wait");
               break;
            case "walk":
               this.setAction("wait");
               break;
            case "skill1":
               this.setAction("wait");
               this.speed.x = 0;
               break;
            case "skill3_1":
               this.setAction("skill3_2");
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
            case "skill2_1":
               this.setAction("skill2_2");
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
            case "shanxian_2":
               if(Boolean(this.curAttackTarget) && this.skillCD1[0] == 0)
               {
                  if(!this.isAttacking())
                  {
                     this.faceToTarget();
                     this.setAction("skill1");
                     TweenMax.delayedCall(0.34,this.banyuezhan1);
                     this.skillCD1[0] = this.skillCD1[1];
                  }
                  else
                  {
                     this.setAction("wait");
                  }
               }
               else if(Boolean(this.curAttackTarget) && this.skillCD2[0] == 0)
               {
                  if(!this.isAttacking())
                  {
                     this.faceToTarget();
                     this.setAction("skill2");
                     this.manyuezhan_1();
                     TweenMax.delayedCall(0.62,this.manyuezhan_2);
                     this.skillCD2[0] = this.skillCD2[1];
                  }
                  else
                  {
                     this.setAction("wait");
                  }
               }
               else if(Boolean(this.curAttackTarget) && this.skillCD4[0] == 0)
               {
                  if(!this.isAttacking())
                  {
                     this.faceToTarget();
                     this.setAction("skill4_1");
                     TweenMax.delayedCall(0.4,this.huguangyueshan_1);
                     this.skillCD4[0] = this.skillCD4[1];
                  }
                  else
                  {
                     this.setAction("wait");
                  }
               }
               else
               {
                  this.faceToTarget();
                  this.setAction("skill1");
                  TweenMax.delayedCall(0.34,this.banyuezhan1);
                  this.skillCD1[0] = this.skillCD1[1];
               }
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
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("ttzs_skill1_fenshen");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 156 - 90;
         }
         else
         {
            _loc2_.x = this.x + 156 + 90;
         }
         _loc2_.y = this.y - 157 - 91;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
         this.banyuezhan3();
      }
      
      private function banyuezhan1_1() : void
      {
         this.faceToTarget();
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("ttzs_skill1_1_fenshen");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 156 - 90;
         }
         else
         {
            _loc2_.x = this.x + 156 + 90;
         }
         _loc2_.y = this.y - 157 - 91;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
         this.banyuezhan3();
      }
      
      private function banyuezhan1_2() : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("ttzs_skill1_2");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 156 - 90;
         }
         else
         {
            _loc2_.x = this.x + 156 + 90;
         }
         _loc2_.y = this.y - 157 - 91;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.setAction("hit1_1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function banyuezhan3() : void
      {
         var _loc2_:EnemyMoveBullet = new EnemyMoveBullet("ttzs_skill1_3_fenshen");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 156 - 96;
         }
         else
         {
            _loc2_.x = this.x + 156 + 96;
         }
         _loc2_.y = this.y - 157 + 44;
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
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("ttzs_skill2");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 156 - 801;
         }
         else
         {
            _loc2_.x = this.x + 156 + 801;
         }
         _loc2_.y = this.y - 157 - 21;
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
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("ttzs_skill3_1");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 156 - 79;
         }
         else
         {
            _loc2_.x = this.x + 156 + 79;
         }
         _loc2_.y = this.y - 157 - 90;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.isDisabled = true;
         _loc2_.setAction("hit3");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function yuesemenglong_1() : void
      {
         var _loc2_:ReflectiveBullet = new ReflectiveBullet("ttzs_skill3_2_1","ttzs_skill3_2_1_box");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 156;
         }
         else
         {
            _loc2_.x = this.x + 156;
         }
         _loc2_.y = this.y - 157;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.isDisabled = true;
         _loc2_.setSpeed(this.getBBDC().getDirect() == 0 ? -10.88 : 10.88,24.71);
         _loc2_.setDistance(3200);
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setAction("hit3");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function yuesemenglong_16() : void
      {
         var _loc2_:ReflectiveBullet = new ReflectiveBullet("ttzs_skill3_2_16","ttzs_skill3_2_16_box");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 156;
         }
         else
         {
            _loc2_.x = this.x + 156;
         }
         _loc2_.y = this.y - 157;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.isDisabled = true;
         _loc2_.setSpeed(this.getBBDC().getDirect() == 0 ? 10.88 : -10.88,24.71);
         _loc2_.setDistance(3200);
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setAction("hit3");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function yuesemenglong_2() : void
      {
         var _loc2_:ReflectiveBullet = new ReflectiveBullet("ttzs_skill3_2_2","ttzs_skill3_2_2_box");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 156;
         }
         else
         {
            _loc2_.x = this.x + 156;
         }
         _loc2_.y = this.y - 157;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.isDisabled = true;
         _loc2_.setSpeed(this.getBBDC().getDirect() == 0 ? -17.61 : 17.61,20.47);
         _loc2_.setDistance(3200);
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setAction("hit3");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function yuesemenglong_15() : void
      {
         var _loc2_:ReflectiveBullet = new ReflectiveBullet("ttzs_skill3_2_15","ttzs_skill3_2_15_box");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 156;
         }
         else
         {
            _loc2_.x = this.x + 156;
         }
         _loc2_.y = this.y - 157;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.isDisabled = true;
         _loc2_.setSpeed(this.getBBDC().getDirect() == 0 ? 17.61 : -17.61,20.47);
         _loc2_.setDistance(3200);
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setAction("hit3");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function yuesemenglong_3() : void
      {
         var _loc2_:ReflectiveBullet = new ReflectiveBullet("ttzs_skill3_2_3","ttzs_skill3_2_3_box");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 156;
         }
         else
         {
            _loc2_.x = this.x + 156;
         }
         _loc2_.y = this.y - 157;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.isDisabled = true;
         _loc2_.setSpeed(this.getBBDC().getDirect() == 0 ? -23.44 : 23.44,13.4);
         _loc2_.setDistance(3200);
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setAction("hit3");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function yuesemenglong_14() : void
      {
         var _loc2_:ReflectiveBullet = new ReflectiveBullet("ttzs_skill3_2_14","ttzs_skill3_2_14_box");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 156;
         }
         else
         {
            _loc2_.x = this.x + 156;
         }
         _loc2_.y = this.y - 157;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.isDisabled = true;
         _loc2_.setSpeed(this.getBBDC().getDirect() == 0 ? 23.44 : -23.44,13.4);
         _loc2_.setDistance(3200);
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setAction("hit3");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function yuesemenglong_4() : void
      {
         var _loc2_:ReflectiveBullet = new ReflectiveBullet("ttzs_skill3_2_4","ttzs_skill3_2_4_box");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 156;
         }
         else
         {
            _loc2_.x = this.x + 156;
         }
         _loc2_.y = this.y - 157;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.isDisabled = true;
         _loc2_.setSpeed(this.getBBDC().getDirect() == 0 ? -26.44 : 26.44,5.46);
         _loc2_.setDistance(3200);
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setAction("hit3");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function yuesemenglong_13() : void
      {
         var _loc2_:ReflectiveBullet = new ReflectiveBullet("ttzs_skill3_2_13","ttzs_skill3_2_13_box");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 156;
         }
         else
         {
            _loc2_.x = this.x + 156;
         }
         _loc2_.y = this.y - 157;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.isDisabled = true;
         _loc2_.setSpeed(this.getBBDC().getDirect() == 0 ? 26.44 : -26.44,5.46);
         _loc2_.setDistance(3200);
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setAction("hit3");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function yuesemenglong_5() : void
      {
         var _loc2_:ReflectiveBullet = new ReflectiveBullet("ttzs_skill3_2_5","ttzs_skill3_2_5_box");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 156;
         }
         else
         {
            _loc2_.x = this.x + 156;
         }
         _loc2_.y = this.y - 157;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.isDisabled = true;
         _loc2_.setSpeed(this.getBBDC().getDirect() == 0 ? -26.88 : 26.88,-2.56);
         _loc2_.setDistance(3200);
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setAction("hit3");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function yuesemenglong_12() : void
      {
         var _loc2_:ReflectiveBullet = new ReflectiveBullet("ttzs_skill3_2_12","ttzs_skill3_2_12_box");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 156;
         }
         else
         {
            _loc2_.x = this.x + 156;
         }
         _loc2_.y = this.y - 157;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.isDisabled = true;
         _loc2_.setSpeed(this.getBBDC().getDirect() == 0 ? 26.88 : -26.88,-2.56);
         _loc2_.setDistance(3200);
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setAction("hit3");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function yuesemenglong_6() : void
      {
         var _loc2_:ReflectiveBullet = new ReflectiveBullet("ttzs_skill3_2_6","ttzs_skill3_2_6_box");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 156;
         }
         else
         {
            _loc2_.x = this.x + 156;
         }
         _loc2_.y = this.y - 157;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.isDisabled = true;
         _loc2_.setSpeed(this.getBBDC().getDirect() == 0 ? -24.79 : 24.79,-10.7);
         _loc2_.setDistance(3200);
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setAction("hit3");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function yuesemenglong_11() : void
      {
         var _loc2_:ReflectiveBullet = new ReflectiveBullet("ttzs_skill3_2_11","ttzs_skill3_2_11_box");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 156;
         }
         else
         {
            _loc2_.x = this.x + 156;
         }
         _loc2_.y = this.y - 157;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.isDisabled = true;
         _loc2_.setSpeed(this.getBBDC().getDirect() == 0 ? 24.79 : 24.79,-10.7);
         _loc2_.setDistance(3200);
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setAction("hit3");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function yuesemenglong_7() : void
      {
         var _loc2_:ReflectiveBullet = new ReflectiveBullet("ttzs_skill3_2_7","ttzs_skill3_2_7_box");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 156;
         }
         else
         {
            _loc2_.x = this.x + 156;
         }
         _loc2_.y = this.y - 157;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.isDisabled = true;
         _loc2_.setSpeed(this.getBBDC().getDirect() == 0 ? -20.05 : 20.05,-18.08);
         _loc2_.setDistance(3200);
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setAction("hit3");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function yuesemenglong_10() : void
      {
         var _loc2_:ReflectiveBullet = new ReflectiveBullet("ttzs_skill3_2_10","ttzs_skill3_2_10_box");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 156;
         }
         else
         {
            _loc2_.x = this.x + 156;
         }
         _loc2_.y = this.y - 157;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.isDisabled = true;
         _loc2_.setSpeed(this.getBBDC().getDirect() == 0 ? 20.05 : -20.05,-18.08);
         _loc2_.setDistance(3200);
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setAction("hit3");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function yuesemenglong_8() : void
      {
         var _loc2_:ReflectiveBullet = new ReflectiveBullet("ttzs_skill3_2_8","ttzs_skill3_2_8_box");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 156;
         }
         else
         {
            _loc2_.x = this.x + 156;
         }
         _loc2_.y = this.y - 157;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.isDisabled = true;
         _loc2_.setSpeed(this.getBBDC().getDirect() == 0 ? -10.88 : 10.88,-24.71);
         _loc2_.setDistance(3200);
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setAction("hit3");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function yuesemenglong_9() : void
      {
         var _loc2_:ReflectiveBullet = new ReflectiveBullet("ttzs_skill3_2_9","ttzs_skill3_2_9_box");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 156;
         }
         else
         {
            _loc2_.x = this.x + 156;
         }
         _loc2_.y = this.y - 157;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.isDisabled = true;
         _loc2_.setSpeed(this.getBBDC().getDirect() == 0 ? 10.88 : -10.88,-24.71);
         _loc2_.setDistance(3200);
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setAction("hit3");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function huguangyueshan_1() : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("skill4_1");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 205 + 2;
         }
         else
         {
            _loc2_.x = this.x + 205 - 2;
         }
         _loc2_.y = this.y - 175 + 27;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.isDisabled = true;
         _loc2_.setAction("hit4");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function huguangyueshan_2() : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("skill4_2");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            this.speed.x = -24;
            _loc2_.x = this.x - 240;
         }
         else
         {
            this.speed.x = 24;
            _loc2_.x = this.x + 240;
         }
         _loc2_.y = this.y - 175;
         _loc2_.setDirect(this.getBBDC().getDirect());
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
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this,this.curAttackTarget) <= 250;
      }
      
      override protected function releSkill2() : void
      {
      }
      
      override protected function beforeSkill2Start() : Boolean
      {
      }
      
      override protected function releSkill3() : void
      {
      }
      
      override protected function beforeSkill3Start() : Boolean
      {
      }
      
      override protected function releSkill4() : void
      {
      }
      
      override protected function beforeSkill4Start() : Boolean
      {
      }
      
      override protected function releSkill5() : void
      {
      }
      
      override protected function beforeSkill5Start() : Boolean
      {
      }
      
      private function doHit3(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = null;
         _loc2_ = new SpecialEffectBullet("Monster516_dq");
         _loc2_.x = this.x;
         _loc2_.y = this.y + 210;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setDestroyInCount(gc.frameClips * 24);
         _loc2_.setAction("hit3");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHit5() : void
      {
         var heroArray:Array;
         var bh:BaseHero = null;
         var _loc2_:SpecialEffectBullet = null;
         _loc2_ = new SpecialEffectBullet("Monster516_skill4");
         _loc2_.x = this.x;
         _loc2_.y = this.y + 236;
         _loc2_.setRole(this);
         _loc2_.setDirect(this.bbdc.getDirect());
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setDestroyInCount(gc.frameClips * 2);
         _loc2_.setAction("hit5");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
         heroArray = gc.getPlayerArray();
         for each(bh in heroArray)
         {
            TweenMax.delayedCall(0.7,function(param1:BaseObject):*
            {
               param1.reduceHp(999999999,false);
               param1.addHeroHurtMc(999999999);
            },[bh]);
            if(bh.getPet())
            {
               TweenMax.delayedCall(0.7,function(param1:BaseObject):*
               {
                  param1.reduceHp(999999999,false);
                  param1.addMonHurtMc(999999999,false);
               },[bh.getPet()]);
            }
         }
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
         return this.curAction == "skill3_1" || this.curAction == "skill3_2" || this.curAction == "skill4_3" || this.curAction == "skill4_1" || this.curAction == "shanxian" || this.curAction == "shanxian_2";
      }
      
      override protected function isYCannotMoveWhenAttack() : Boolean
      {
         return this.curAction == "skill2_1" || this.curAction == "skill2_2" || this.curAction == "skill2_3" || this.curAction == "skill3_1" || this.curAction == "skill3_2" || this.curAction == "skill4_3" || this.curAction == "skill4_2" || this.curAction == "skill4_1" || this.curAction == "shanxian" || this.curAction == "shanxian_2";
      }
      
      override public function isAttacking() : Boolean
      {
         return this.curAction == "skill1" || this.curAction == "skill2_1" || this.curAction == "skill2_2" || this.curAction == "skill2_3" || this.curAction == "skill3_1" || this.curAction == "skill3_2" || this.curAction == "skill4_3" || this.curAction == "skill4_2" || this.curAction == "skill4_1" || this.curAction == "shanxian" || this.curAction == "shanxian_2";
      }
      
      override public function reduceHp(param1:int, param2:Boolean = false) : void
      {
         param2 = false;
         super.reduceHp(param1,param2);
      }
      
      override public function setAttackBack(param1:Point) : void
      {
      }
      
      override protected function followTarget() : void
      {
      }
      
      override protected function flyFollowTarget() : void
      {
      }
      
      override protected function randomWalk() : void
      {
      }
      
      override protected function myIntelligence() : void
      {
         super.myIntelligence();
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
         if(this.isBoss)
         {
         }
      }
   }
}

