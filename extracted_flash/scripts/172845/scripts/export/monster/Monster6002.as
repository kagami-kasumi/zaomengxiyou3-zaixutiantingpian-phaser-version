package export.monster
{
   import base.*;
   import com.game.manager.*;
   import com.greensock.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.Point;
   import my.*;
   
   public class Monster6002 extends MonsterEntity
   {
      
      private static var _this:Monster6002;
      
      private var dj:int;
      
      private var fsCount:uint = 0;
      
      private var canhalfskill:Boolean = true;
      
      private var canSummon:Boolean = true;
      
      public function Monster6002()
      {
         super();
         _this = this;
         this.setHp(8000000 * 0.7 * 0.65);
         this.setSHp(8000000 * 0.7 * 0.65);
         this.protectedParamsObject.def = 2873;
         this.protectedParamsObject.exp = 5000;
         this.protectedParamsObject.gxp = 5000;
         this.protectedParamsObject.mDef = 0.5;
         this.protectedParamsObject.Hit = 25;
         this.protectedParamsObject.Critical = 25;
         this.protectedParamsObject.Dodge = 15;
         this.protectedParamsObject.ReduceMagicDef = 0.1325;
         this.protectedParamsObject.Toughness = 20;
         this.protectedParamsObject.rehp = 12859;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[4,-2],
            "attackInterval":999,
            "power":11747 * 0.66,
            "attackKind":"physics",
            "backlashrate":7
         };
         this.attackBackInfoDict["hit1_1"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[4,-2],
            "attackInterval":999,
            "power":11747 * 0.6,
            "attackKind":"magic",
            "backlashrate":7
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[4,-2],
            "attackInterval":999,
            "power":11747 * 0.75,
            "attackKind":"physics",
            "backlashrate":11
         };
         this.attackBackInfoDict["hit2_1"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[2,-2],
            "attackInterval":8,
            "power":11747 * 0.3,
            "attackKind":"magic",
            "backlashrate":11
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[0,0],
            "attackInterval":59,
            "power":888,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[2,-1],
            "attackInterval":999,
            "power":13587,
            "attackKind":"magic",
            "backlashrate":9
         };
         this.attackBackInfoDict["hit4_1"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[2,-1],
            "attackInterval":9,
            "power":13587 * 0.3,
            "attackKind":"magic",
            "backlashrate":9
         };
         this.attackBackInfoDict["hit5"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[5,2],
            "attackInterval":12,
            "power":13587 * 0.36,
            "attackKind":"magic",
            "backlashrate":15
         };
         this.horizenSpeed = 6;
         this.monsterName = "赤月神君";
         this.isBoss = true;
         this.skillCD1 = [gc.frameClips * 1.5,gc.frameClips * 6.4];
         this.skillCD2 = [gc.frameClips * 5.2,gc.frameClips * 5];
         this.skillCD3 = [gc.frameClips * 45,gc.frameClips * 25];
         this.skillCD4 = [gc.frameClips * 18,gc.frameClips * 8];
         this.skillCD5 = [gc.frameClips * 7,gc.frameClips * 8];
         this.protectedParamsObject.mysee = 300;
         this.protectedParamsObject.isattback = 50;
         this.attackRange = 150;
         this.alertRange = 1000;
         this.protectedParamsObject.probability = 0.12;
         this.fallList = [{
            "name":"wpyh",
            "bigtype":"dj"
         }];
      }
      
      public static function getInstance() : Monster6002
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
            bbdc = AnimationManager.getAnimation("chiyueshenjunhunti");
            bbdc.setOffset(-115,-175);
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
               if(frameCount == 9)
               {
                  this.banyuezhan1();
               }
               if(frameCount == 21)
               {
                  this.banyuezhan1_2();
               }
               this.speed.y = 0;
               break;
            case "skill2":
               if(frameCount == 1)
               {
                  this.speed.x = 0;
                  this.manyuezhan_1();
               }
               if(frameCount == 19)
               {
                  this.manyuezhan_2();
               }
               if(frameCount == 26)
               {
                  this.manyuezhan_3();
               }
               if(frameCount == 4)
               {
                  if(this.getBBDC().getDirect() == 0)
                  {
                     this.speed.x = -34;
                  }
                  else
                  {
                     this.speed.x = 34;
                  }
               }
               if(frameCount == 7)
               {
                  this.speed.x = 0;
               }
               if(frameCount == 19)
               {
                  if(this.getBBDC().getDirect() == 0)
                  {
                     this.speed.x = -39;
                  }
                  else
                  {
                     this.speed.x = 39;
                  }
               }
               if(frameCount == 22)
               {
                  this.speed.x = 0;
               }
               break;
            case "skill3":
               if(frameCount == 1)
               {
                  this.speed.x = 0;
               }
               if(frameCount == 15)
               {
                  this.yuesemenglong();
               }
               this.speed.y = 0;
               break;
            case "skill4_1":
               if(frameCount == 1)
               {
                  this.speed.x = 0;
               }
               if(frameCount == 12)
               {
                  this.huguangyueshan_1();
               }
               this.speed.y = 0;
               break;
            case "skill4_2":
               if(this.getBBDC().getDirect() == 0)
               {
                  this.speed.x = -300;
               }
               else
               {
                  this.speed.x = 300;
               }
               break;
            case "skill4_3":
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
            case "skill3":
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
               this.speed.x = 0;
               break;
            case "skill4_1":
               this.setAction("skill4_2");
               this.huguangyueshan_3();
               this.huguangyueshan_4();
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
                  this.releSkill1();
                  this.skillCD1[0] = this.skillCD1[1];
               }
               else if(Boolean(this.curAttackTarget) && this.skillCD2[0] == 0)
               {
                  this.releSkill2();
                  this.skillCD2[0] = this.skillCD2[1];
               }
               else if(Boolean(this.curAttackTarget) && this.skillCD4[0] == 0)
               {
                  if(!this.isAttacking())
                  {
                     this.releSkill4();
                     this.skillCD4[0] = this.skillCD4[1];
                  }
               }
               else
               {
                  this.releSkill1();
                  this.skillCD1[0] = this.skillCD1[1];
               }
               break;
            case "hurt_1":
            case "hurt_2":
            case "hurt_3":
               this.setStatic();
               this.setAction("wait");
               break;
            case "dead":
               this.dropAura();
               this.destroy();
         }
      }
      
      override protected function scriptFrameOverFunc(param1:int) : void
      {
         var _loc2_:String = String(this.bbdc.getState());
         switch(_loc2_)
         {
            case "appear":
               this.setAction("wait");
               break;
            case "wait":
               this.bbdc.setFramePointX(0);
               break;
            case "walk":
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
      
      private function banyuezhan1() : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("skill1_1");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 205 + 29;
         }
         else
         {
            _loc2_.x = this.x + 205 - 29;
         }
         _loc2_.y = this.y - 175 - 4;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
         this.banyuezhan3();
      }
      
      private function banyuezhan1_2() : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("skill1_2");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 205 + 29;
         }
         else
         {
            _loc2_.x = this.x + 205 - 29;
         }
         _loc2_.y = this.y - 175 + 28;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
         this.banyuezhan4();
      }
      
      private function banyuezhan3() : void
      {
         var _loc2_:EnemyMoveBullet = new EnemyMoveBullet("skill1_3_1");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 205 - 58.65;
         }
         else
         {
            _loc2_.x = this.x + 205 + 58.65;
         }
         _loc2_.y = this.y - 175 - 73.45;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.setDistance(540);
         _loc2_.setSpeed(this.getBBDC().getDirect() == 0 ? -20 : 20,-20 * (106 / 123));
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setAction("hit1_1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function banyuezhan4() : void
      {
         var _loc2_:EnemyMoveBullet = new EnemyMoveBullet("skill1_3");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 205 - 46;
         }
         else
         {
            _loc2_.x = this.x + 205 + 46;
         }
         _loc2_.y = this.y - 175 + 50;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.setDistance(540);
         _loc2_.setSpeed(this.getBBDC().getDirect() == 0 ? -22.5 : 22.5,0);
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setAction("hit1_1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function manyuezhan_1() : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("skill2_1");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 205 + 35;
         }
         else
         {
            _loc2_.x = this.x + 205 - 35;
         }
         _loc2_.y = this.y - 175 - 38;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.setAction("hit2");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function manyuezhan_2() : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("skill2_2");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 205 + 45;
         }
         else
         {
            _loc2_.x = this.x + 205 - 45;
         }
         _loc2_.y = this.y - 175 + 1;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.setAction("hit2");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function manyuezhan_3() : void
      {
         var _loc2_:EnemyMoveBullet = new EnemyMoveBullet("skill2_3");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 205 + 8;
         }
         else
         {
            _loc2_.x = this.x + 205 - 8;
         }
         _loc2_.y = this.y - 175 + 60;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.setDistance(1000);
         _loc2_.setDestroyInCount(30 * 5);
         _loc2_.setSpeed(this.getBBDC().getDirect() == 0 ? -2.5 : 2.5,-2.5 * (92 / 95));
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setAction("hit2_1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function yuesemenglong() : void
      {
         this.curAddEffect.add([{
            "name":BaseAddEffect.YUESEMENGLONG,
            "time":3.6 * gc.frameClips
         }]);
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("skill3");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 205 + 67;
         }
         else
         {
            _loc2_.x = this.x + 205 - 67;
         }
         _loc2_.y = this.y - 175 - 143;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.isDisabled = true;
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
      
      private function huguangyueshan_4() : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("skill4_4");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 205 + 171;
         }
         else
         {
            _loc2_.x = this.x + 205 - 171;
         }
         _loc2_.y = this.y - 175 - 282;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.setAction("hit4_1");
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
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this,this.curAttackTarget) <= 250;
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
         this.newAttackId();
         this.setAction("skill4_1");
         this.lastHit = "skill4_1";
         this.faceToTarget();
      }
      
      override protected function beforeSkill4Start() : Boolean
      {
         return Boolean(this.curAttackTarget);
      }
      
      override protected function releSkill5() : void
      {
         this.newAttackId();
         this.setAction("shanxian");
         this.lastHit = "shanxian";
         this.faceToTarget();
      }
      
      override protected function beforeSkill5Start() : Boolean
      {
         return Boolean(this.curAttackTarget);
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
      
      private function doHit4_1(param1:uint) : void
      {
         this.axe = MainGame.getInstance().createMonster(517,638,400) as Monster517;
         this.setYourFather(gc.frameClips * 9999,true);
         this.canSummon = false;
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
         return this.curAction == "skill1" || this.curAction == "skill3" || this.curAction == "skill4_3" || this.curAction == "skill4_1" || this.curAction == "shanxian" || this.curAction == "shanxian_2";
      }
      
      override protected function isYCannotMoveWhenAttack() : Boolean
      {
         return this.curAction == "skill1" || this.curAction == "skill2" || this.curAction == "skill3" || this.curAction == "skill4_3" || this.curAction == "skill4_2" || this.curAction == "skill4_1" || this.curAction == "shanxian" || this.curAction == "shanxian_2";
      }
      
      override public function isAttacking() : Boolean
      {
         return this.curAction == "skill1" || this.curAction == "skill2" || this.curAction == "skill3" || this.curAction == "skill4_3" || this.curAction == "skill4_2" || this.curAction == "skill4_1" || this.curAction == "shanxian" || this.curAction == "shanxian_2";
      }
      
      override public function reduceHp(param1:int, param2:Boolean = false) : void
      {
         if(this.curAction == "skill1" || this.curAction == "skill2" || this.curAction == "skill3" || this.curAction == "skill4_3" || this.curAction == "skill4_2" || this.curAction == "skill4_1" || this.curAction == "shanxian" || this.curAction == "shanxian_2")
         {
            param2 = false;
         }
         super.reduceHp(param1,param2);
      }
      
      override public function setAttackBack(param1:Point) : void
      {
         if(!(this.curAction == "skill1" || this.curAction == "skill2" || this.curAction == "skill3" || this.curAction == "skill4_3" || this.curAction == "skill4_2" || this.curAction == "skill4_1" || this.curAction == "shanxian" || this.curAction == "shanxian_2"))
         {
            super.setAttackBack(param1);
         }
      }
      
      override protected function myIntelligence() : void
      {
         super.myIntelligence();
         if(Boolean(this.curAttackTarget))
         {
            if(!(this.isAttacking() || this.isBeAttacking() || this.isStun))
            {
               if(this.y - this.curAttackTarget.y > 150)
               {
                  this.jump();
               }
            }
         }
         if(!this.isBoss && !this.isDead())
         {
         }
         if(this.isBoss)
         {
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

