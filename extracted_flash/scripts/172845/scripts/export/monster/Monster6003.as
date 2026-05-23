package export.monster
{
   import base.MonsterEntity;
   import com.game.manager.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.Point;
   
   public class Monster6003 extends MonsterEntity
   {
      
      private static var _this:Monster6003;
      
      private var dj:int;
      
      private var fsCount:uint = 0;
      
      private var canhalfskill:Boolean = true;
      
      private var canSummon:Boolean = true;
      
      private var skill5num:int = 0;
      
      private var canreleaseskill3:Boolean = true;
      
      private var canreleaseskill4:Boolean = true;
      
      public function Monster6003()
      {
         super();
         _this = this;
         this.setHp(5500000);
         this.setSHp(5500000);
         this.protectedParamsObject.def = 2873;
         this.protectedParamsObject.exp = 5000;
         this.protectedParamsObject.gxp = 5000;
         this.protectedParamsObject.mDef = 0.5;
         this.protectedParamsObject.Hit = 25;
         this.protectedParamsObject.Critical = 25;
         this.protectedParamsObject.Dodge = 13;
         this.protectedParamsObject.ReduceMagicDef = 0.1325;
         this.protectedParamsObject.Toughness = 20;
         this.protectedParamsObject.rehp = 12859;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":1,
            "attackBackSpeed":[4,-2],
            "attackInterval":999,
            "power":11747 * 0.85,
            "attackKind":"physics",
            "backlashrate":7
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[4,-2],
            "attackInterval":9,
            "power":13587 * 0.28,
            "attackKind":"magic",
            "backlashrate":11
         };
         this.attackBackInfoDict["hit2_1"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[4,-2],
            "attackInterval":11,
            "power":13587 * 0.55,
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
            "attackInterval":10,
            "power":13587 * 0.32,
            "attackKind":"magic",
            "backlashrate":9
         };
         this.attackBackInfoDict["hit5"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[2,-2],
            "attackInterval":2,
            "power":21230 * 0.25,
            "attackKind":"magic",
            "backlashrate":15
         };
         this.horizenSpeed = 6;
         this.graity = 0.8;
         this.isFly = true;
         this.monsterName = "紫眸鹫王";
         this.isBoss = true;
         this.skillCD1 = [gc.frameClips * 2.5,gc.frameClips * 6];
         this.skillCD2 = [gc.frameClips * 5,gc.frameClips * 7.2];
         this.skillCD3 = [gc.frameClips * 6,gc.frameClips * 10];
         this.skillCD4 = [gc.frameClips * 7,gc.frameClips * 12];
         this.skillCD5 = [gc.frameClips * 8,gc.frameClips * 18];
         this.protectedParamsObject.mysee = 300;
         this.protectedParamsObject.isattback = 50;
         this.attackRange = 400;
         this.alertRange = 1200;
         this.normalAttackRate = 0.32;
         this.protectedParamsObject.probability = 0.12;
         this.fallList = [{
            "name":"wpkt",
            "bigtype":"dj"
         }];
      }
      
      public static function getInstance() : Monster6003
      {
         return _this;
      }
      
      override public function step() : void
      {
         super.step();
      }
      
      override protected function initBBDC() : void
      {
         try
         {
            bbdc = AnimationManager.getAnimation("zimoujiuwang");
            bbdc.setOffset(5,-3);
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
                  this.banyuezhan1();
                  this.speed.x = 0;
                  this.speed.y = 0;
               }
               if(frameCount == 8)
               {
                  this.banyuezhan1_2();
               }
               if(frameCount == 14)
               {
                  this.banyuezhan1_3();
               }
               if(frameCount == 28)
               {
                  this.banyuezhan1_4();
               }
               if(frameCount == 32)
               {
                  this.banyuezhan1_5();
               }
               this.speed.y = 0;
               break;
            case "skill2":
               if(frameCount == 1)
               {
                  this.speed.x = 0;
                  this.speed.y = 0;
               }
               if(frameCount == 25)
               {
                  this.manyuezhan_1();
                  this.manyuezhan_2();
                  this.manyuezhan_3();
                  this.manyuezhan_4();
                  this.manyuezhan_5();
               }
               break;
            case "skill3":
               if(frameCount == 1)
               {
                  this.yuesemenglongs_1();
                  this.speed.x = 0;
                  this.speed.y = 0;
                  this.graity = 0.8;
               }
               if(frameCount == 38)
               {
                  this.setYourFather(71);
                  this.yuesemenglongs_2();
               }
               if(frameCount == 109)
               {
                  this.graity = 0.8;
               }
               break;
            case "skill4_1":
               if(frameCount == 1)
               {
                  this.speed.x = 0;
               }
               if(frameCount == 22)
               {
                  this.x = 567.5;
                  this.y = 292;
               }
               this.speed.y = 0;
               break;
            case "skill4_2":
               if(frameCount == 1)
               {
                  this.speed.x = 0;
                  this.huguangyueshan_1();
                  this.huguangyueshan_1_2();
                  this.huguangyueshan_2();
                  this.huguangyueshan_3();
               }
               this.speed.y = 0;
               break;
            case "skill4_3":
               this.speed.y = 0;
               break;
            case "skill5_1":
               if(frameCount == 1)
               {
                  this.shanxian_1();
                  this.speed.x = 0;
               }
               if(frameCount == 7)
               {
                  if(this.skill5num % 2 == 0)
                  {
                     this.x = 75;
                     this.turnRight();
                  }
                  else
                  {
                     this.x = 1072;
                     this.turnLeft();
                  }
                  this.y = 155;
                  this.skill5num += 1;
               }
               this.speed.y = 0;
               break;
            case "skill5_2":
               if(frameCount == 1)
               {
                  this.shanxian_2();
                  this.speed.x = 0;
               }
               this.speed.y = 0;
               break;
            case "skill5_3":
               if(frameCount == 1)
               {
                  this.speed.x = 0;
               }
               if(frameCount == 22)
               {
                  this.shanxian_3();
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
               break;
            case "skill4_2":
               this.setAction("skill4_3");
               break;
            case "skill5_1":
               this.setAction("skill5_2");
               break;
            case "skill5_2":
               this.setAction("skill5_3");
               break;
            case "skill5_3":
               this.setAction("wait");
               break;
            case "hurt_1":
            case "hurt_2":
            case "hurt_3":
               this.setAction("wait");
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
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("zimoujiuwang_skill1_1");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x + 5 - 162;
         }
         else
         {
            _loc2_.x = this.x - 5 + 162;
         }
         _loc2_.y = this.y - 3 - 153.95;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.isDisabled = true;
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function banyuezhan1_2() : void
      {
         var _loc2_:EnemyMoveBullet2 = new EnemyMoveBullet2("zimoujiuwang_skill1_3_1");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x + 5 - 162 + 14 + 8;
         }
         else
         {
            _loc2_.x = this.x - 5 + 162 - 14 - 8;
         }
         _loc2_.y = this.y - 3 - 153.95 + 68 + 23;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.setDistance(1000);
         _loc2_.setMoveTarget(this.curAttackTarget);
         _loc2_.setSpeed(10);
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function banyuezhan1_3() : void
      {
         var _loc2_:EnemyMoveBullet2 = new EnemyMoveBullet2("zimoujiuwang_skill1_3_1");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x + 5 - 162 + 55 + 8;
         }
         else
         {
            _loc2_.x = this.x - 5 + 162 - 55 - 8;
         }
         _loc2_.y = this.y - 3 - 153.95 + 211 + 23;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.setDistance(1000);
         _loc2_.setMoveTarget(this.curAttackTarget);
         _loc2_.setSpeed(10);
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function banyuezhan1_4() : void
      {
         var _loc2_:EnemyMoveBullet2 = new EnemyMoveBullet2("zimoujiuwang_skill1_3_1");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x + 5 - 162 + 104 + 8;
         }
         else
         {
            _loc2_.x = this.x - 5 + 162 - 104 - 8;
         }
         _loc2_.y = this.y - 3 - 153.95 + 45 + 23;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.setDistance(1000);
         _loc2_.setMoveTarget(this.curAttackTarget);
         _loc2_.setSpeed(10);
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function banyuezhan1_5() : void
      {
         var _loc2_:EnemyMoveBullet2 = new EnemyMoveBullet2("zimoujiuwang_skill1_3_1");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x + 5 - 162 + 156 + 8;
         }
         else
         {
            _loc2_.x = this.x - 5 + 162 - 156 - 8;
         }
         _loc2_.y = this.y - 3 - 153.95 + 187 + 23;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.setDistance(1000);
         _loc2_.setMoveTarget(this.curAttackTarget);
         _loc2_.setSpeed(10);
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function manyuezhan_1() : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("zimoujiuwang_skill2_1");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x + 5 - 162;
         }
         else
         {
            _loc2_.x = this.x - 5 + 162;
         }
         _loc2_.y = this.y - 3 - 159.95;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.setAction("hit2");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function manyuezhan_2() : void
      {
         var _loc2_:EnemyMoveBullet = new EnemyMoveBullet("zimoujiuwang_skill2_2");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x + 5 - 162;
         }
         else
         {
            _loc2_.x = this.x - 5 + 162;
         }
         _loc2_.y = this.y - 3 - 159.95;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.setDistance(500);
         _loc2_.setSpeed(-12.5,0);
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setAction("hit2_1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function manyuezhan_3() : void
      {
         var _loc2_:EnemyMoveBullet = new EnemyMoveBullet("zimoujiuwang_skill2_2");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x + 5 - 162;
         }
         else
         {
            _loc2_.x = this.x - 5 + 162;
         }
         _loc2_.y = this.y - 3 - 159.95;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.setDistance(500);
         _loc2_.setSpeed(12.5,0);
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setAction("hit2_1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function manyuezhan_4() : void
      {
         var _loc2_:EnemyMoveBullet = new EnemyMoveBullet("zimoujiuwang_skill2_2");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x + 5 - 162;
         }
         else
         {
            _loc2_.x = this.x - 5 + 162;
         }
         _loc2_.y = this.y - 3 - 159.95;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.setDistance(500);
         _loc2_.setSpeed(0,12.5);
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setAction("hit2_1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function manyuezhan_5() : void
      {
         var _loc2_:EnemyMoveBullet = new EnemyMoveBullet("zimoujiuwang_skill2_2");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x + 5 - 162;
         }
         else
         {
            _loc2_.x = this.x - 5 + 162;
         }
         _loc2_.y = this.y - 3 - 159.95;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.setDistance(500);
         _loc2_.setSpeed(0,-12.5);
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setAction("hit2_1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function yuesemenglongs_1() : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("zimoujiuwang_skill3_1");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x + 5 - 162;
         }
         else
         {
            _loc2_.x = this.x - 5 + 162;
         }
         _loc2_.y = this.y - 3 - 159.95;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.isDisabled = true;
         _loc2_.setAction("hit3");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function yuesemenglongs_2() : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("zimoujiuwang_skill3_2");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x + 5 - 162;
         }
         else
         {
            _loc2_.x = this.x - 5 + 162;
         }
         _loc2_.y = this.y - 3 - 159.95;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.setAction("hit3");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function huguangyueshan_1() : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("zimoujiuwang_skill4_1_1");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x + 5 - 162;
         }
         else
         {
            _loc2_.x = this.x - 5 + 162;
         }
         _loc2_.y = this.y - 3 - 159.95;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.isDisabled = true;
         _loc2_.setAction("hit4");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function huguangyueshan_1_2() : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("zimoujiuwang_skill4_1_2");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x + 5 - 162;
         }
         else
         {
            _loc2_.x = this.x - 5 + 162;
         }
         _loc2_.y = this.y - 3 - 159.95;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.isDisabled = true;
         _loc2_.setAction("hit4");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function huguangyueshan_2() : void
      {
         var _loc2_:EnemyMoveBullet = new EnemyMoveBullet("zimoujiuwang_skill4_2_1","zimoujiuwang_skill4_2_1_box");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x + 5 - 162;
         }
         else
         {
            _loc2_.x = this.x - 5 + 162;
         }
         _loc2_.y = this.y - 3 - 159.95;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.isDisabled = true;
         _loc2_.setDistance(8500);
         _loc2_.setSpeed(this.getBBDC().getDirect() == 0 ? 13.93 : -13.93,0);
         _loc2_.setAction("hit4");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function huguangyueshan_3() : void
      {
         var _loc2_:EnemyMoveBullet = new EnemyMoveBullet("zimoujiuwang_skill4_2_2","zimoujiuwang_skill4_2_2_box");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x + 5 - 162;
         }
         else
         {
            _loc2_.x = this.x - 5 + 162;
         }
         _loc2_.y = this.y - 3 - 159.95;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.isDisabled = true;
         _loc2_.setDistance(8500);
         _loc2_.setSpeed(this.getBBDC().getDirect() == 0 ? -13.93 : 13.93,0);
         _loc2_.setAction("hit4");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function shanxian_1() : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("zimoujiuwang_skill5_1");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x + 5 - 162;
         }
         else
         {
            _loc2_.x = this.x - 5 + 162;
         }
         _loc2_.y = this.y - 3 - 159.95;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.isDisabled = true;
         _loc2_.setAction("hit3");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function shanxian_2() : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("zimoujiuwang_skill5_2");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x + 5 - 162;
         }
         else
         {
            _loc2_.x = this.x - 5 + 162;
         }
         _loc2_.y = this.y - 3 - 159.95;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.isDisabled = true;
         _loc2_.setAction("hit3");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function shanxian_3() : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("zimoujiuwang_skill5_3","zimoujiuwang_skill5_3_box");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x + 5 - 162;
         }
         else
         {
            _loc2_.x = this.x - 5 + 162;
         }
         _loc2_.y = this.y - 3 - 159.95;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.isDisabled = true;
         _loc2_.setAction("hit5");
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
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this,this.curAttackTarget) <= 810;
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
         return Boolean(this.curAttackTarget) && this.isBoss && Boolean(this.canreleaseskill3);
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
         return Boolean(this.curAttackTarget) && Boolean(this.canreleaseskill4);
      }
      
      override protected function releSkill5() : void
      {
         this.newAttackId();
         this.setAction("skill5_1");
         this.lastHit = "skill5_1";
         this.faceToTarget();
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
         return this.curAction == "skill4_2" || this.curAction == "skill2";
      }
      
      override protected function isXCannotMoveWhenAttack() : Boolean
      {
         return this.curAction == "skill1" || this.curAction == "skill3" || this.curAction == "skill4_3" || this.curAction == "skill4_1" || this.curAction == "skill5_1" || this.curAction == "skill5_2" || this.curAction == "skill5_3";
      }
      
      override protected function isYCannotMoveWhenAttack() : Boolean
      {
         return this.curAction == "skill1" || this.curAction == "skill2" || this.curAction == "skill3" || this.curAction == "skill4_3" || this.curAction == "skill4_2" || this.curAction == "skill4_1" || this.curAction == "skill5_1" || this.curAction == "skill5_2" || this.curAction == "skill5_3";
      }
      
      override public function isAttacking() : Boolean
      {
         return this.curAction == "skill1" || this.curAction == "skill2" || this.curAction == "skill3" || this.curAction == "skill4_3" || this.curAction == "skill4_2" || this.curAction == "skill4_1" || this.curAction == "skill5_1" || this.curAction == "skill5_2" || this.curAction == "skill5_3";
      }
      
      override public function reduceHp(param1:int, param2:Boolean = false) : void
      {
         if(this.curAction == "skill1" || this.curAction == "skill2" || this.curAction == "skill3" || this.curAction == "skill4_3" || this.curAction == "skill4_2" || this.curAction == "skill4_1" || this.curAction == "skill5_1" || this.curAction == "skill5_2" || this.curAction == "skill5_3")
         {
            param2 = false;
         }
         super.reduceHp(param1,param2);
      }
      
      override public function setAttackBack(param1:Point) : void
      {
         if(!(this.curAction == "skill1" || this.curAction == "skill2" || this.curAction == "skill3" || this.curAction == "skill4_3" || this.curAction == "skill4_2" || this.curAction == "skill4_1" || this.curAction == "skill5_1" || this.curAction == "skill5_2" || this.curAction == "skill5_3"))
         {
            super.setAttackBack(param1);
         }
      }
      
      override protected function myIntelligence() : void
      {
         super.myIntelligence();
         if(!this.canreleaseskill3 && this.getHp() <= this.getSHp() * 0.8)
         {
            this.canreleaseskill3 = true;
         }
         if(!this.canreleaseskill4 && this.getHp() <= this.getSHp() * 0.6)
         {
            this.canreleaseskill4 = true;
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
      
      override public function resetGraity() : void
      {
         if(!this.isFly)
         {
            if(!this.isGXP)
            {
               this.graity = 1.5;
            }
            else
            {
               this.graity = 3.75;
            }
         }
         else
         {
            this.graity = 0.5;
         }
      }
      
      override protected function moveLeft() : void
      {
         if(!this.isAttacking())
         {
            this.turnLeft();
            if(!this.isAttacking() && !this.isBeAttacking())
            {
               this.setAction("walk");
            }
         }
      }
      
      override protected function moveRight() : void
      {
         if(!this.isAttacking())
         {
            this.turnRight();
            if(!this.isAttacking() && !this.isBeAttacking())
            {
               this.setAction("walk");
            }
         }
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

