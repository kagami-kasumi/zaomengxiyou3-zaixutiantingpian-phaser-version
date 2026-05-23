package export.monster
{
   import base.BaseBullet;
   import base.MonsterEntity;
   import com.game.manager.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.Point;
   
   public class Monster6012 extends MonsterEntity
   {
      
      private static var _this:Monster6012;
      
      private var dj:int;
      
      private var fsCount:uint = 0;
      
      private var canhalfskill:Boolean = true;
      
      private var canSummon:Boolean = true;
      
      private var firebolltime:int = 360;
      
      private var isBig:Boolean = false;
      
      private var BigTime:int = 0;
      
      public function Monster6012()
      {
         super();
         _this = this;
         this.setHp(5000000);
         this.setSHp(5000000);
         this.protectedParamsObject.def = 2200;
         this.protectedParamsObject.exp = 3000;
         this.protectedParamsObject.gxp = 10000;
         this.protectedParamsObject.mDef = 0.49;
         this.protectedParamsObject.Hit = 40;
         this.protectedParamsObject.Critical = 30;
         this.protectedParamsObject.Dodge = 22;
         this.protectedParamsObject.ReduceMagicDef = 0.15;
         this.protectedParamsObject.Toughness = 12;
         this.protectedParamsObject.rehp = 17470;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[4,-2],
            "attackInterval":999,
            "power":9050,
            "attackKind":"physics",
            "backlashrate":7
         };
         this.attackBackInfoDict["hit1_1"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[4,-2],
            "attackInterval":999,
            "power":9050,
            "attackKind":"physics",
            "backlashrate":7
         };
         this.attackBackInfoDict["hit1_2"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[4,-2],
            "attackInterval":999,
            "power":9050,
            "attackKind":"physics",
            "backlashrate":7
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[4,-2],
            "attackInterval":8,
            "power":10833 * 0.32,
            "attackKind":"magic",
            "backlashrate":11
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[0,0],
            "attackInterval":999,
            "power":9833 * 0.6,
            "attackKind":"magic",
            "backlashrate":7
         };
         this.attackBackInfoDict["hit3_1"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[0,-2],
            "attackInterval":7,
            "power":9833 * 0.2,
            "attackKind":"magic",
            "backlashrate":7
         };
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[50,-24],
            "attackInterval":999,
            "power":23888,
            "attackKind":"magic",
            "backlashrate":7
         };
         this.horizenSpeed = 7.2;
         this.monsterName = "寅将军";
         this.isBoss = true;
         this.skillCD1 = [gc.frameClips * 0.8,gc.frameClips * 7];
         this.skillCD2 = [gc.frameClips * 2.2,gc.frameClips * 8];
         this.skillCD3 = [gc.frameClips * 4,gc.frameClips * 9];
         this.skillCD4 = [gc.frameClips * 11,gc.frameClips * 16];
         this.protectedParamsObject.mysee = 300;
         this.protectedParamsObject.isattback = 50;
         this.attackRange = 220;
         this.alertRange = 1000;
         this.protectedParamsObject.probability = 1;
         this.normalAttackRate = 0.78;
         this.fallList = [{
            "name":"lwyp",
            "bigtype":"dj"
         }];
      }
      
      public static function getInstance() : Monster6012
      {
         return _this;
      }
      
      override public function step() : void
      {
         super.step();
         ++this.BigTime;
         if(!this.isBig && this.BigTime > 24 * gc.frameClips && !this.isAttacking() && !this.isBeAttacking())
         {
            this.BigTime = 0;
            this.isBig = true;
            this.ToBig();
         }
         if(Boolean(this.isBig) && this.BigTime > 10 * gc.frameClips && !this.isAttacking() && !this.isBeAttacking())
         {
            this.BigTime = 0;
            this.isBig = false;
            this.ToNormal();
         }
         if(this.curAction == "jump1" && this.speed.y > 0)
         {
            this.setAction("jumpdown");
         }
      }
      
      public function doStrengthen() : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("yinjiangjun_Strengthen");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 453 + 93;
         }
         else
         {
            _loc2_.x = this.x + 453 - 93;
         }
         _loc2_.y = this.y - 533 + 126;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.setAction("hit2");
         _loc2_.setDisable();
         this.magicBulletArray.push(_loc2_);
         gc.gameSence.addChild(_loc2_);
      }
      
      public function ToBig() : void
      {
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[4,-2],
            "attackInterval":999,
            "power":9050 * 1.1,
            "attackKind":"physics",
            "backlashrate":7
         };
         this.attackBackInfoDict["hit1_1"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[4,-2],
            "attackInterval":999,
            "power":9050 * 1.1,
            "attackKind":"physics",
            "backlashrate":7
         };
         this.attackBackInfoDict["hit1_2"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[4,-2],
            "attackInterval":999,
            "power":9050 * 1.1,
            "attackKind":"physics",
            "backlashrate":7
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[4,-2],
            "attackInterval":8,
            "power":10833 * 0.32 * 1.1,
            "attackKind":"magic",
            "backlashrate":11
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[0,0],
            "attackInterval":999,
            "power":9833 * 0.6 * 1.1,
            "attackKind":"magic",
            "backlashrate":7
         };
         this.attackBackInfoDict["hit3_1"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[0,-2],
            "attackInterval":7,
            "power":9833 * 0.2 * 1.1,
            "attackKind":"magic",
            "backlashrate":7
         };
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[50,-24],
            "attackInterval":999,
            "power":23888 * 1.1,
            "attackKind":"magic",
            "backlashrate":7
         };
         this.skillCD1 = [gc.frameClips * 1.2,gc.frameClips * 4.05];
         this.skillCD2 = [gc.frameClips * 1.8,gc.frameClips * 3.5];
         this.skillCD3 = [gc.frameClips * 2.2,gc.frameClips * 2.8];
         this.skillCD4 = [gc.frameClips * 0.6,gc.frameClips * 1.7];
         var _loc1_:Boolean = false;
         if(this.getBBDC().getDirect() == 0)
         {
            _loc1_ = false;
         }
         else
         {
            _loc1_ = true;
         }
         var _loc2_:String = this.bbdc.getAction();
         this.body.removeChild(bbdc);
         bbdc = AnimationManager.getAnimation("yinjiangjun_big");
         bbdc.setOffset(-453 + 93,-533 + 126);
         bbdc.setAction(_loc2_);
         if(!_loc1_)
         {
            bbdc.turnLeft();
         }
         else
         {
            bbdc.turnRight();
         }
         bbdc.addCallBack(this.onEnterFrame,this.onActionOver);
         this.body.addChild(bbdc);
         this.y -= 15;
         this.removeChild(this.colipse);
         this.colipse = AUtils.getNewObj("ObjectBaseSprite") as Sprite;
         this.colipse.visible = false;
         this.colipse.width = 38 * 1.2 * 2;
         this.colipse.height = 112 * 1.2;
         this.addChild(this.colipse);
         this.horizenSpeed = 11.2;
         this.doStrengthen();
      }
      
      public function ToNormal() : void
      {
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[4,-2],
            "attackInterval":999,
            "power":9050,
            "attackKind":"physics",
            "backlashrate":7
         };
         this.attackBackInfoDict["hit1_1"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[4,-2],
            "attackInterval":999,
            "power":9050,
            "attackKind":"physics",
            "backlashrate":7
         };
         this.attackBackInfoDict["hit1_2"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[4,-2],
            "attackInterval":999,
            "power":9050,
            "attackKind":"physics",
            "backlashrate":7
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[4,-2],
            "attackInterval":8,
            "power":10833 * 0.32,
            "attackKind":"magic",
            "backlashrate":11
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[0,0],
            "attackInterval":999,
            "power":9833 * 0.6,
            "attackKind":"magic",
            "backlashrate":7
         };
         this.attackBackInfoDict["hit3_1"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[0,-2],
            "attackInterval":7,
            "power":9833 * 0.2,
            "attackKind":"magic",
            "backlashrate":7
         };
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[50,-24],
            "attackInterval":999,
            "power":23888,
            "attackKind":"magic",
            "backlashrate":7
         };
         this.skillCD1 = [gc.frameClips * 6,gc.frameClips * 7];
         this.skillCD2 = [gc.frameClips * 7,gc.frameClips * 8];
         this.skillCD3 = [gc.frameClips * 8,gc.frameClips * 9];
         this.skillCD4 = [gc.frameClips * 15,gc.frameClips * 16];
         var _loc1_:Boolean = false;
         if(this.getBBDC().getDirect() == 0)
         {
            _loc1_ = false;
         }
         else
         {
            _loc1_ = true;
         }
         var _loc2_:String = this.bbdc.getAction();
         this.body.removeChild(bbdc);
         bbdc = AnimationManager.getAnimation("yinjiangjun");
         bbdc.setOffset(-453 + 93 + 60,-533 + 126 + 70);
         bbdc.setAction(_loc2_);
         if(!_loc1_)
         {
            bbdc.turnLeft();
         }
         else
         {
            bbdc.turnRight();
         }
         bbdc.addCallBack(this.onEnterFrame,this.onActionOver);
         this.body.addChild(bbdc);
         this.removeChild(this.colipse);
         this.colipse = AUtils.getNewObj("ObjectBaseSprite") as Sprite;
         this.colipse.visible = false;
         this.colipse.width = 38 * 2;
         this.colipse.height = 112;
         this.addChild(this.colipse);
         this.horizenSpeed = 7.2;
      }
      
      override protected function initBBDC() : void
      {
         try
         {
            bbdc = AnimationManager.getAnimation("yinjiangjun");
            bbdc.setOffset(-453 + 93 + 60,-533 + 126 + 70);
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
            if(I < 0.5)
            {
               param1 = "hurt_1";
            }
            else
            {
               param1 = "hurt_2";
            }
         }
         if(param1 == "skill1")
         {
            param1 = "skill1";
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
               if(frameCount == 20)
               {
                  if(this.isBig)
                  {
                     this.banyuezhan1big();
                  }
                  else
                  {
                     this.banyuezhan1();
                  }
                  if(this.getBBDC().getDirect() == 0)
                  {
                     this.speed.x = -20;
                  }
                  else
                  {
                     this.speed.x = 20;
                  }
               }
               if(frameCount == 23)
               {
                  this.speed.x = 0;
               }
               if(frameCount == 25)
               {
                  this.faceToTarget();
               }
               if(frameCount == 26)
               {
                  if(this.isBig)
                  {
                     this.banyuezhan1_1big();
                  }
                  else
                  {
                     this.banyuezhan1_1();
                  }
                  if(this.getBBDC().getDirect() == 0)
                  {
                     this.speed.x = -20;
                  }
                  else
                  {
                     this.speed.x = 20;
                  }
               }
               if(frameCount == 29)
               {
                  this.speed.x = 0;
               }
               if(frameCount == 34)
               {
                  this.faceToTarget();
               }
               if(frameCount == 35)
               {
                  if(this.isBig)
                  {
                     this.banyuezhan1_2big();
                  }
                  else
                  {
                     this.banyuezhan1_2();
                  }
                  if(this.getBBDC().getDirect() == 0)
                  {
                     this.speed.x = -20;
                  }
                  else
                  {
                     this.speed.x = 20;
                  }
               }
               if(frameCount == 39)
               {
                  this.speed.x = 0;
               }
               break;
            case "skill2":
               if(frameCount == 1)
               {
                  this.speed.x = 0;
               }
               if(frameCount == 23)
               {
                  if(this.isBig)
                  {
                     this.manyuezhan_1();
                  }
                  else
                  {
                     this.manyuezhan_2();
                  }
               }
               break;
            case "skill3_1":
               if(frameCount == 1)
               {
                  this.speed.x = 0;
               }
               if(frameCount == 7)
               {
                  this.speed.y = -50;
                  if(Math.abs(this.x - this.curAttackTarget.x) <= 450)
                  {
                     this.speed.x = Boolean(this.curAttackTarget) ? (this.curAttackTarget.x - this.x) / 12 : 0;
                  }
                  else if(this.curAttackTarget.x - this.x > 0)
                  {
                     this.speed.x = 480 / 12;
                  }
                  else if(this.curAttackTarget.x - this.x < 0)
                  {
                     this.speed.x = -480 / 12;
                  }
                  else
                  {
                     this.spee.x = 0;
                  }
               }
               if(frameCount == 14)
               {
                  this.graity = 0;
                  this.speed.y = 81;
               }
               if(frameCount == 18)
               {
                  this.graity = 1.5;
                  this.speed.x = 0;
               }
               if(frameCount == 19)
               {
                  if(this.isBig)
                  {
                     this.yuesemenglong_big();
                  }
                  else
                  {
                     this.yuesemenglong();
                  }
               }
               break;
            case "skill3_2":
               if(frameCount == 1)
               {
                  if(this.isBig)
                  {
                     this.yuesemenglong2_big();
                  }
                  else
                  {
                     this.yuesemenglong2();
                  }
                  this.speed.x = 0;
               }
               break;
            case "skill4_1":
               if(frameCount == 1)
               {
                  this.speed.x = 0;
                  if(this.isBig)
                  {
                     this.speed.x = this.getBBDC().getDirect() == 0 ? -22 : 22;
                  }
                  else
                  {
                     this.speed.x = this.getBBDC().getDirect() == 0 ? -16 : 16;
                  }
               }
               if(Math.abs(this.x - this.curAttackTarget.x) < 30)
               {
                  this.setAction("skill4_2");
               }
               if(!this.curAttackTarget || this.curAttackTarget.isReadyToDestroy)
               {
                  this.setAction("wait");
               }
               break;
            case "skill4_2":
               if(frameCount == 1)
               {
                  this.speed.x = 0;
               }
               if(frameCount == 4)
               {
                  if(this.isBig)
                  {
                     this.huguangyueshan_big();
                  }
                  else
                  {
                     this.huguangyueshan();
                  }
               }
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
               this.setAction("wait");
               break;
            case "skill4_2":
               this.setAction("wait");
               break;
            case "hurt_1":
            case "hurt_2":
            case "hurt_3":
               this.setAction("wait");
               this.setStatic();
               break;
            case "dead":
               this.dropAura();
               this.destroy();
         }
      }
      
      private function banyuezhan1() : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("yinjiangjun_skill1_1");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 453 + 93 + 60;
         }
         else
         {
            _loc2_.x = this.x + 453 - 93 - 60;
         }
         _loc2_.y = this.y - 533 + 126 + 70;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function banyuezhan1big() : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("yinjiangjun_skill1_1big");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 453 + 93;
         }
         else
         {
            _loc2_.x = this.x + 453 - 93;
         }
         _loc2_.y = this.y - 533 + 126;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function banyuezhan1_1() : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("yinjiangjun_skill1_2");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 453 + 93 + 60;
         }
         else
         {
            _loc2_.x = this.x + 453 - 93 - 60;
         }
         _loc2_.y = this.y - 533 + 126 + 70;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function banyuezhan1_1big() : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("yinjiangjun_skill1_2big");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 453 + 93;
         }
         else
         {
            _loc2_.x = this.x + 453 - 93;
         }
         _loc2_.y = this.y - 533 + 126;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function banyuezhan1_2() : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("yinjiangjun_skill1_3");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 453 + 93 + 60;
         }
         else
         {
            _loc2_.x = this.x + 453 - 93 - 60;
         }
         _loc2_.y = this.y - 533 + 126 + 70;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function banyuezhan1_2big() : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("yinjiangjun_skill1_3big");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 453 + 93;
         }
         else
         {
            _loc2_.x = this.x + 453 - 93;
         }
         _loc2_.y = this.y - 533 + 126;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function manyuezhan_1() : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("yinjiangjun_skill2big","yinjiangjun_skill2big_box");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 453 + 93;
         }
         else
         {
            _loc2_.x = this.x + 453 - 93;
         }
         _loc2_.y = this.y - 533 + 126;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.isDisabled = true;
         _loc2_.setAction("hit2");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function manyuezhan_2() : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("yinjiangjun_skill2","yinjiangjun_skill2_box");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 453 + 93 + 60;
         }
         else
         {
            _loc2_.x = this.x + 453 - 93 - 60;
         }
         _loc2_.y = this.y - 533 + 126 + 70;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.isDisabled = true;
         _loc2_.setAction("hit2");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function yuesemenglong_big() : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("yinjiangjun_skill3_1big");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 453 + 93;
         }
         else
         {
            _loc2_.x = this.x + 453 - 93;
         }
         _loc2_.y = this.y - 533 + 126;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.setAction("hit3");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function yuesemenglong() : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("yinjiangjun_skill3_1");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 453 + 93 + 60;
         }
         else
         {
            _loc2_.x = this.x + 453 - 93 - 60;
         }
         _loc2_.y = this.y - 533 + 126 + 70;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.setAction("hit3");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function yuesemenglong2_big() : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("yinjiangjun_skill3_2big");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 453 + 93;
         }
         else
         {
            _loc2_.x = this.x + 453 - 93;
         }
         _loc2_.y = this.y - 533 + 126;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.setAction("hit3_1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function yuesemenglong2() : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("yinjiangjun_skill3_2");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 453 + 93 + 60;
         }
         else
         {
            _loc2_.x = this.x + 453 - 93 - 60;
         }
         _loc2_.y = this.y - 533 + 126 + 70;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.setAction("hit3_1");
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
      
      private function huguangyueshan_big() : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("yinjiangjun_skill4_2big");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 453 + 93;
         }
         else
         {
            _loc2_.x = this.x + 453 - 93;
         }
         _loc2_.y = this.y - 533 + 126;
         _loc2_.setDirect(this.getBBDC().getDirect());
         _loc2_.setAction("hit4");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function huguangyueshan() : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("yinjiangjun_skill4_2");
         _loc2_.setRole(this);
         if(this.getBBDC().getDirect() == 0)
         {
            _loc2_.x = this.x - 453 + 93 + 60;
         }
         else
         {
            _loc2_.x = this.x + 453 - 93 - 60;
         }
         _loc2_.y = this.y - 533 + 126 + 70;
         _loc2_.setDirect(this.getBBDC().getDirect());
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
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this,this.curAttackTarget) <= 220;
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
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this,this.curAttackTarget) <= 260;
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
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this,this.curAttackTarget) <= 420;
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
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this,this.curAttackTarget) <= 900 && Math.abs(this.x - this.curAttackTarget.x) > 250;
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
         return this.curAction == "skill4_1" || this.curAction == "skill2_1" || this.curAction == "skill3_1" || this.curAction == "skill2_3" || this.curAction == "skill1";
      }
      
      override protected function isXCannotMoveWhenAttack() : Boolean
      {
         return this.curAction == "skill2" || this.curAction == "skill3" || this.curAction == "skill3_2" || this.curAction == "shanxian" || this.curAction == "shanxian_2";
      }
      
      override protected function isYCannotMoveWhenAttack() : Boolean
      {
         return this.curAction == "skill2" || this.curAction == "skill2_2" || this.curAction == "skill2_3" || this.curAction == "skill4_1" || this.curAction == "shanxian" || this.curAction == "shanxian_2";
      }
      
      override public function isAttacking() : Boolean
      {
         return this.curAction == "skill1" || this.curAction == "skill2" || this.curAction == "skill2_2" || this.curAction == "skill2_3" || this.curAction == "skill3_1" || this.curAction == "skill3_2" || this.curAction == "skill4_3" || this.curAction == "skill4_2" || this.curAction == "skill4_1" || this.curAction == "shanxian" || this.curAction == "shanxian_2";
      }
      
      override public function reduceHp(param1:int, param2:Boolean = false) : void
      {
         if(Boolean(this.isBig) || this.curAction == "skill1" || this.curAction == "skill2" || this.curAction == "skill2_2" || this.curAction == "skill2_3" || this.curAction == "skill3_1" || this.curAction == "skill3_2" || this.curAction == "skill4_3" || this.curAction == "skill4_2" || this.curAction == "skill4_1" || this.curAction == "shanxian" || this.curAction == "shanxian_2")
         {
            param2 = false;
         }
         super.reduceHp(param1,param2);
      }
      
      override public function setAttackBack(param1:Point) : void
      {
         if(!(Boolean(this.isBig) || this.curAction == "skill1" || this.curAction == "skill2" || this.curAction == "skill2_2" || this.curAction == "skill2_3" || this.curAction == "skill3_1" || this.curAction == "skill3_2" || this.curAction == "skill4_3" || this.curAction == "skill4_2" || this.curAction == "skill4_1" || this.curAction == "shanxian" || this.curAction == "shanxian_2"))
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

