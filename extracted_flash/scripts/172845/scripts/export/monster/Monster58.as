package export.monster
{
   import base.*;
   import com.greensock.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   
   public class Monster58 extends BaseMonster
   {
      
      public function Monster58()
      {
         super();
         this.normalAttackRate = 0.6;
         this.horizenSpeed = 5;
         this.setHp(624348);
         this.setSHp(624348);
         this.attackRange = 5 * 60;
         this.alertRange = 1000;
         this.protectedParamsObject.def = 887;
         this.protectedParamsObject.exp = 1000;
         this.protectedParamsObject.gxp = 500;
         this.protectedParamsObject.mDef = 0.4;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-6,-5],
            "attackInterval":999,
            "power":2088,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[0,0],
            "attackInterval":48,
            "power":905,
            "attackKind":"magic",
            "addEffect":[{
               "name":BaseAddEffect.STUN,
               "time":gc.frameClips * 1.5
            }]
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-15,0],
            "attackInterval":999,
            "power":1810,
            "attackKind":"magic"
         };
         this.isBoss = true;
         this.monsterName = "青牛精";
         this.setAction("wait");
         this.protectedParamsObject.probability = 0.45;
         this.fallList = [{
            "name":"qlgzzs",
            "bigtype":"dj"
         },{
            "name":"plzzzs",
            "bigtype":"dj"
         },{
            "name":"ylfzzs",
            "bigtype":"dj"
         },{
            "name":"jlgzzs",
            "bigtype":"dj"
         },{
            "name":"jlczzs",
            "bigtype":"dj"
         },{
            "name":"_cljzzs",
            "bigtype":"dj"
         }];
         this.skillCD1 = [gc.frameClips * 3,gc.frameClips * 14];
         this.skillCD2 = [gc.frameClips * 1,gc.frameClips * 5];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster58");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],5 * 60,5 * 60,new Point(0,0));
            bbdc.setOffsetXY(30,-30);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[15],[2,2,2,2,10],[2,2,5,10],[2,2,2,2],[2,2,3,10]]);
            bbdc.setFrameCount([6,4,1,5,4,96,4]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster58--BitmapData Error!");
      }
      
      override protected function newColipse() : void
      {
         this.colipse = AUtils.getNewObj("ObjectBaseSprite2") as Sprite;
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
               this.setYourFather(10);
               if(_loc2_.y != 6)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(6);
               }
               this.bbdc.setState(param1);
               break;
            case "hit2":
               this.setYourFather(144);
               this.doHit2(this.bbdc.getDirect());
               if(_loc2_.y != 5)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(5);
               }
               this.bbdc.setState(param1);
               break;
            case "hit3":
               this.setYourFather(15);
               if(_loc2_.y != 4)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(param1);
               break;
            case "hit4":
               this.setYourFather(15);
               if(_loc2_.y != 6)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(6);
               }
               this.bbdc.setState(param1);
               break;
            case "dead":
               this.setStatic();
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
               this.dropAura();
               this.destroy();
         }
      }
      
      override protected function enterFrameFunc(param1:Point) : void
      {
         var _loc2_:* = null;
         var _loc3_:* = null;
         var _loc4_:String = this.bbdc.getState();
         var _loc5_:uint = uint(this.getBBDC().getDirect());
         switch(_loc4_)
         {
            case "hit1":
               if(param1.x == 3)
               {
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     this.doHit1(_loc5_);
                  }
               }
               break;
            case "hit2":
               if(this.getBBDC().getDirect() == 0)
               {
                  this.speed.x = -30;
               }
               else
               {
                  this.speed.x = 30;
               }
               _loc2_ = this.parent.localToGlobal(new Point(this.x,this.y));
               if(_loc2_.x < 80)
               {
                  this.getBBDC().turnRight();
                  for each(_loc3_ in this.magicBulletArray)
                  {
                     if(_loc3_.getImcName() == "Monster58Bullet2")
                     {
                        _loc3_.setDirect(this.getBBDC().getDirect());
                        break;
                     }
                  }
                  break;
               }
               if(_loc2_.x > 880)
               {
                  this.getBBDC().turnLeft();
                  for each(_loc3_ in this.magicBulletArray)
                  {
                     if(_loc3_.getImcName() == "Monster58Bullet2")
                     {
                        _loc3_.setDirect(this.getBBDC().getDirect());
                        break;
                     }
                  }
               }
               break;
            case "hit3":
               if(param1.x == 3)
               {
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     this.faceToTarget();
                     this.doHit3(_loc5_);
                  }
               }
         }
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         return Boolean(this.standInObj) && Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 10 * 60;
      }
      
      override protected function beforeSkill2Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 400;
      }
      
      override protected function releSkill1() : void
      {
         this.newAttackId();
         this.faceToTarget();
         this.setYourFather(15);
         this.setAction("hit2");
         this.lastHit = "hit2";
      }
      
      override protected function releSkill2() : void
      {
         this.newAttackId();
         this.faceToTarget();
         this.setYourFather(15);
         this.setAction("hit3");
         this.lastHit = "hit3";
      }
      
      private function doHit1(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster58Bullet1");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 100;
         }
         else
         {
            _loc2_.x = this.x + 100;
         }
         _loc2_.y = this.y - 85;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHit2(param1:uint) : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster58Bullet2");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 30;
         }
         else
         {
            _loc2_.x = this.x + 30;
         }
         _loc2_.y = this.y - 70;
         _loc2_.setDestroyInCount(144);
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setHurtCanCutDownEffect(false);
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit2");
         this.magicBulletArray.push(_loc2_);
         var _loc3_:uint = uint(this.parent.getChildIndex(this));
         gc.gameSence.addChildAt(_loc2_,_loc3_);
      }
      
      private function doHit3(param1:uint) : void
      {
         this.doSingleHit3(param1,1);
      }
      
      private function doSingleHit3(param1:uint, param2:uint) : void
      {
         var idx:uint = 0;
         idx = 0;
         idx = 0;
         var direct:uint = param1;
         idx = param2;
         var offsetX:uint = uint(135 + (idx - 1) * 50);
         var b:SpecialEffectBullet = new SpecialEffectBullet("Monster58Bullet3");
         if(direct == 0)
         {
            b.x = this.x - offsetX;
         }
         else
         {
            b.x = this.x + offsetX;
         }
         b.y = this.y - 75;
         b.setRole(this);
         b.setDirect(direct);
         b.setAction("hit3");
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
         if(idx < 6)
         {
            idx++;
            TweenMax.delayedCall(0.25,function(param1:Monster58, param2:uint):*
            {
               if(!param1.isDead())
               {
                  param1.doSingleHit3(param2,idx);
               }
            },[this,direct]);
         }
      }
      
      override protected function exitFrameFunc(param1:Point) : void
      {
      }
      
      override protected function myIntelligence() : void
      {
         if(!this.isBeAttacking())
         {
            super.myIntelligence();
         }
      }
      
      override public function isCanMoveWhenAttack() : Boolean
      {
         return this.curAction == "hit2";
      }
      
      override public function destroy() : void
      {
         var _loc1_:* = null;
         var _loc2_:int = 0;
         var _loc3_:* = null;
         super.destroy();
         if(this.getHp() <= 0)
         {
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

