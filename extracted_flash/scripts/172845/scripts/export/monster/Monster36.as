package export.monster
{
   import base.*;
   import com.greensock.*;
   import export.bullet.*;
   import export.level.*;
   import flash.display.*;
   import flash.geom.*;
   
   public class Monster36 extends BaseMonster
   {
      
      private var monster36Bullet3Count:uint;
      
      public function Monster36()
      {
         super();
         this.normalAttackRate = 0.6;
         this.horizenSpeed = 5.5;
         this.setHp(138101);
         this.setSHp(138101);
         this.protectedParamsObject.mysee = 5 * 60;
         this.protectedParamsObject.isattback = 50;
         this.attackRange = 250;
         this.alertRange = 2500;
         this.protectedParamsObject.def = 194;
         this.protectedParamsObject.exp = 500;
         this.protectedParamsObject.gxp = 250;
         this.protectedParamsObject.mDef = 0.35;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-6,-5],
            "attackInterval":999,
            "power":1306,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-3,0],
            "attackInterval":int(gc.frameClips * 0.25),
            "power":297,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-25,0],
            "attackInterval":8,
            "power":445,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-15,0],
            "attackInterval":int(gc.frameClips * 0.25),
            "power":356,
            "attackKind":"magic",
            "addEffect":[{
               "name":BaseAddEffect.MONSTER36Bullet4,
               "time":2,
               "hurt":20
            }]
         };
         this.isBoss = true;
         this.isFly = true;
         this.graity = 0;
         this.monsterName = "雷震子";
         this.setAction("wait");
         this.protectedParamsObject.probability = 0.4;
         this.fallList = [{
            "name":"xltszzs",
            "bigtype":"dj"
         },{
            "name":"xlczzzs",
            "bigtype":"dj"
         },{
            "name":"xltqzzs",
            "bigtype":"dj"
         }];
         this.skillCD1 = [gc.frameClips * 1,gc.frameClips * 8];
         this.skillCD2 = [gc.frameClips * 3,gc.frameClips * 8];
         this.skillCD3 = [gc.frameClips * 5,gc.frameClips * 7];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster36");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],5 * 60,5 * 60,new Point(0,0));
            bbdc.setOffsetXY(0,-25);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[2,2,2,3,2,4],[15],[2,2,2,10],[2,2,2,2,10],[2,2,2,2,5,10],[2,10],[4,5],[2,2,2,20]]);
            bbdc.setFrameCount([6,6,1,4,5,6,2,2,3]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster36--BitmapData Error!");
      }
      
      override protected function newColipse() : void
      {
         this.colipse = AUtils.getNewObj("ObjectBaseSprite5") as Sprite;
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
            case "hurt":
               if(_loc2_.y != 2)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(2);
               }
               this.bbdc.setState(param1);
               break;
            case "hit1":
               if(_loc2_.y != 4)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(param1);
               break;
            case "hit2":
               if(_loc2_.y != 5)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(5);
               }
               this.bbdc.setState(param1);
               break;
            case "hit3":
               if(_loc2_.y != 6)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(6);
               }
               this.bbdc.setState(param1);
               break;
            case "hit4_1":
               if(_loc2_.y != 7)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(7);
               }
               this.bbdc.setState(param1);
               break;
            case "hit4_2":
               if(_loc2_.y != 8)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(8);
               }
               this.bbdc.setState(param1);
               break;
            case "dead":
               this.setStatic();
               if(_loc2_.y != 3)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(3);
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
            case "hit4_1":
               this.setPositionAfterTarget();
               this.setAction("hit4_2");
               break;
            case "hit4_2":
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
      
      private function setPositionAfterTarget() : void
      {
         if(this.curAttackTarget)
         {
            if(this.curAttackTarget.getBBDC().getDirect() == 0)
            {
               this.x = this.curAttackTarget.x + 100;
               this.turnLeft();
            }
            else
            {
               this.x = Number(this.curAttackTarget.x) - 100;
               this.turnRight();
            }
            this.y = Number(this.curAttackTarget.y) - 60;
         }
      }
      
      override protected function enterFrameFunc(param1:Point) : void
      {
         var _loc2_:String = this.bbdc.getState();
         var _loc3_:uint = uint(this.getBBDC().getDirect());
         switch(_loc2_)
         {
            case "hit1":
               if(param1.x == 3)
               {
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     this.doHit1(_loc3_);
                  }
               }
               break;
            case "hit2":
               if(param1.x == 3)
               {
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     this.doHit2(_loc3_);
                  }
               }
               break;
            case "hit3":
               if(param1.x == 1)
               {
                  if(this.bbdc.getCurFrameCount() == 5)
                  {
                     this.doHit3(_loc3_);
                  }
               }
               break;
            case "hit4_1":
               this.speed.y = -15;
               this.speed.x = 0;
               break;
            case "hit4_2":
               this.speed.y = 0;
               if(param1.x == 2)
               {
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     this.doHit4(_loc3_);
                  }
               }
         }
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 10 * 60;
      }
      
      override protected function beforeSkill2Start() : Boolean
      {
         var _loc1_:* = null;
         for each(_loc1_ in this.magicBulletArray)
         {
            if(_loc1_.getImcName() == "Monster36Bullet3")
            {
               return false;
            }
         }
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 400;
      }
      
      override protected function beforeSkill3Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 400;
      }
      
      override protected function releSkill1() : void
      {
         this.newAttackId();
         this.faceToTarget();
         this.setYourFather(20);
         this.setAction("hit2");
         this.lastHit = "hit2";
      }
      
      override protected function releSkill2() : void
      {
         this.newAttackId();
         this.faceToTarget();
         this.setYourFather(20);
         this.setAction("hit3");
         this.lastHit = "hit3";
      }
      
      override protected function releSkill3() : void
      {
         this.newAttackId();
         this.faceToTarget();
         this.setYourFather(20);
         this.setAction("hit4_1");
         this.lastHit = "hit4_1";
      }
      
      private function doHit1(param1:uint) : void
      {
         var _loc2_:EnemyMoveBullet = new EnemyMoveBullet("Monster36Bullet1");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 140;
         }
         else
         {
            _loc2_.x = this.x + 140;
         }
         _loc2_.y = this.y - 50;
         _loc2_.setRole(this);
         var _loc3_:Point = AUtils.GetNextPointByTwoObj(this,this.curAttackTarget);
         _loc2_.setSpeed(_loc3_.x * 25,_loc3_.y * 25);
         _loc2_.rotation = this.gettwoobjangle(this,this.curAttackTarget,param1);
         _loc2_.setDistance(1000);
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHit2(param1:uint) : void
      {
         var _loc2_:* = null;
         var _loc3_:int = (Math.random() - 0.5) * 200;
         _loc2_ = new SpecialEffectBullet("Monster36Bullet2");
         _loc2_.x = this.curAttackTarget.x + _loc3_ - 150;
         _loc2_.y = 510;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit2");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
         _loc2_ = new SpecialEffectBullet("Monster36Bullet2");
         _loc2_.x = this.curAttackTarget.x + _loc3_;
         _loc2_.y = 510;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit2");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
         _loc2_ = new SpecialEffectBullet("Monster36Bullet2");
         _loc2_.x = this.curAttackTarget.x + _loc3_ + 150;
         _loc2_.y = 510;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit2");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
         _loc2_ = new SpecialEffectBullet("Monster36Bullet2");
         _loc2_.x = this.curAttackTarget.x + _loc3_ + 5 * 60;
         _loc2_.y = 510;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit2");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHit3(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster36Bullet3");
         _loc2_.x = this.curAttackTarget.x;
         _loc2_.y = 250;
         _loc2_.setDisable();
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setDestroyInCount(gc.frameClips * 33);
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit3");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
         this.monster36Bullet3Count = gc.frameClips * 8;
      }
      
      private function doHit4(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster36Bullet4");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 200;
         }
         else
         {
            _loc2_.x = this.x + 200;
         }
         _loc2_.y = this.y - 50;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit4");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      override protected function exitFrameFunc(param1:Point) : void
      {
      }
      
      override protected function myIntelligence() : void
      {
         var _loc1_:* = null;
         var _loc2_:* = null;
         if(!this.isBeAttacking())
         {
            super.myIntelligence();
         }
         for each(_loc1_ in this.magicBulletArray)
         {
            if(_loc1_.getImcName() == "Monster36Bullet3")
            {
               if(this.monster36Bullet3Count > 0)
               {
                  --this.monster36Bullet3Count;
                  if(this.monster36Bullet3Count == 0)
                  {
                     for each(_loc2_ in gc.getPlayerArray())
                     {
                        _loc2_.addCurAddEffect([{
                           "name":BaseAddEffect.SIDATIANWANG_SAN_MP_LOST,
                           "time":gc.frameClips * 4,
                           "mpSource":Number(_loc2_.roleProperies.getMMP())
                        }]);
                        TweenMax.to(_loc2_,1,{
                           "x":_loc1_.x,
                           "y":_loc1_.y
                        });
                     }
                     this.monster36Bullet3Count = gc.frameClips * 8;
                  }
               }
            }
         }
      }
      
      override public function isCanMoveWhenAttack() : Boolean
      {
         return this.curAction == "hit4_1";
      }
      
      override public function isAttacking() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3" || this.curAction == "hit4_1" || this.curAction == "hit4_2";
      }
      
      override public function destroy() : void
      {
         var _loc1_:* = null;
         var _loc2_:int = 0;
         var _loc3_:* = null;
         super.destroy();
         if(this.getHp() <= 0)
         {
            if(gc.pWorld.getBaseLevelListener() is StageListener81)
            {
               StageListener81(gc.pWorld.getBaseLevelListener()).showJwealSprite();
            }
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
}

