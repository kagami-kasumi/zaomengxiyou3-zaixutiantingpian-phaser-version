package export.monster
{
   import base.*;
   import com.greensock.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   import my.*;
   
   public class Monster115 extends BaseMonster
   {
      
      public function Monster115()
      {
         super();
         this.horizenSpeed = 6;
         this.setHp(800000);
         this.setSHp(800000);
         this.attackRange = 250;
         this.alertRange = 1000;
         this.normalAttackRate = 0.7;
         this.protectedParamsObject.mDef = 0.4;
         this.protectedParamsObject.def = 1074;
         this.protectedParamsObject.exp = 500;
         this.protectedParamsObject.gxp = 250;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":999,
            "power":1947,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":999,
            "power":2109,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":999,
            "power":1947,
            "attackKind":"magic",
            "addEffect":[{
               "name":BaseAddEffect.MONSTER115SLOW,
               "time":gc.frameClips * 5
            }]
         };
         this.isBoss = true;
         this.monsterName = "饕餮";
         this.setAction("wait");
         this.protectedParamsObject.fallProbability = 0;
         this.protectedParamsObject.fallList = [];
         this.skillCD1 = [gc.frameClips * 2,gc.frameClips * 7];
         this.skillCD2 = [gc.frameClips * 3,gc.frameClips * 6];
         this.skillCD3 = [gc.frameClips * 4,gc.frameClips * 5];
         this.skillCD4 = [gc.frameClips * 2.5,gc.frameClips * 4.5];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster115");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],400,5 * 60,new Point(0,0));
            bbdc.setOffsetXY(5,-30);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[15],[2,2,2,2,9],[2,2,2,10],[2,27],[2,2,20]]);
            bbdc.setFrameCount([6,4,1,5,4,2,3]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster115--BitmapData Error!");
      }
      
      override protected function newColipse() : void
      {
         this.colipse = AUtils.getNewObj("Monster42BaseObject") as Sprite;
         this.colipse.visible = false;
         this.colipse.scaleX = 0.5;
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
            case "dead":
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
         var _loc2_:String = this.bbdc.getState();
         var _loc3_:uint = uint(this.getBBDC().getDirect());
         switch(_loc2_)
         {
            case "hit1":
               if(param1.x == 3)
               {
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     this.doHi1(_loc3_);
                  }
               }
               break;
            case "hit2":
               if(param1.x == 1)
               {
                  if(this.bbdc.getCurFrameCount() == 27)
                  {
                     this.doHit2(_loc3_);
                  }
               }
               break;
            case "hit3":
               if(param1.x == 2)
               {
                  if(this.bbdc.getCurFrameCount() == 20)
                  {
                     this.doHit3(_loc3_);
                  }
               }
         }
      }
      
      private function doHi1(param1:uint) : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster115Bullet1");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 150;
         }
         else
         {
            _loc2_.x = this.x + 150;
         }
         _loc2_.y = this.y - 40;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHit2(param1:uint) : void
      {
         var targetPoint:Point = null;
         var bo:BaseObject = null;
         var direct:uint = param1;
         var b:SpecialEffectBullet = new SpecialEffectBullet("Monster115Bullet2");
         if(direct == 0)
         {
            b.x = this.x - 40;
         }
         else
         {
            b.x = this.x + 40;
         }
         b.y = this.y - 30;
         b.setRole(this);
         b.setDisable();
         b.setDirect(direct);
         b.setAction("hit2");
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
         targetPoint = new Point();
         if(direct == 0)
         {
            targetPoint.x = this.x - 30;
         }
         else
         {
            targetPoint.x = this.x + 30;
         }
         targetPoint.y = this.y - 40;
         for each(bo in gc.getPlayerAndPetArray())
         {
            TweenMax.to(bo,1,{
               "x":targetPoint.x,
               "y":targetPoint.y,
               "onComplete":function(param1:BaseObject):*
               {
                  param1.addCurAddEffect([{
                     "name":BaseAddEffect.MONSTER115REDUCEHP,
                     "time":gc.frameClips * 9
                  }]);
               },
               "onCompleteParams":[bo]
            });
         }
      }
      
      private function doHit3(param1:uint) : void
      {
         var _loc2_:* = null;
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":999,
            "power":1200,
            "attackKind":"magic",
            "addEffect":[{
               "name":BaseAddEffect.MONSTER115SLOW,
               "time":gc.frameClips * 8
            }]
         };
         _loc2_ = new SpecialEffectBullet("Monster115Bullet3");
         _loc2_.x = this.x + 95;
         _loc2_.y = this.y + 60;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit3");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
         _loc2_ = new SpecialEffectBullet("Monster115Bullet3");
         _loc2_.x = this.x - 95;
         _loc2_.y = this.y + 60;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit3");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
         _loc2_ = new SpecialEffectBullet("Monster115Bullet3");
         _loc2_.x = this.x + 4 * 60;
         _loc2_.y = this.y + 60;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit3");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
         _loc2_ = new SpecialEffectBullet("Monster115Bullet3");
         _loc2_.x = this.x - 240;
         _loc2_.y = this.y + 60;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit3");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         return this.curAttackTarget != null;
      }
      
      override protected function releSkill1() : void
      {
         this.newAttackId();
         this.setYourFather(30);
         this.setAction("hit2");
         this.lastHit = "hit2";
      }
      
      override protected function beforeSkill2Start() : Boolean
      {
         return this.curAttackTarget != null && AUtils.GetDisBetweenTwoObj(this,this.curAttackTarget) <= 5 * 60;
      }
      
      override protected function releSkill2() : void
      {
         this.newAttackId();
         this.setYourFather(50);
         this.setAction("hit3");
         this.lastHit = "hit3";
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
      
      override public function destroy() : void
      {
         var _loc1_:* = null;
         var _loc2_:int = 0;
         var _loc3_:* = null;
         if(this.getHp() < 0)
         {
            MainGame.getInstance().createLikeMonster(77,this.x,this.y - 50);
         }
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

