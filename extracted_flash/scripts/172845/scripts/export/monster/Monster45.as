package export.monster
{
   import base.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   
   public class Monster45 extends BaseMonster
   {
      
      private var isReadyToSwim:Boolean = false;
      
      public function Monster45()
      {
         super();
         this.horizenSpeed = 4;
         this.normalAttackRate = 0.5;
         this.protectedParamsObject.def = 743;
         this.protectedParamsObject.mDef = 0.3;
         this.protectedParamsObject.exp = 100;
         this.protectedParamsObject.gxp = 50;
         this.setHp(120000);
         this.setSHp(120000);
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":999,
            "power":519,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":999,
            "power":519,
            "attackKind":"magic"
         };
         this.attackRange = 10 * 60;
         this.alertRange = 1000;
         this.isBoss = false;
         this.graity = 0.2;
         this.setAction("wait");
         this.skillCD1 = [gc.frameClips * 4,gc.frameClips * 5];
         this.protectedParamsObject.probability = 0;
         this.fallList = [];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster45");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],200,200,new Point(0,0));
            bbdc.setOffsetXY(2,-12);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8,20],[15],[2,2,2,2,10],[2,10],[2,2,2,10]]);
            bbdc.setFrameCount([6,4,2,1,5,2,4]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster45--BitmapData Error!");
      }
      
      override protected function newColipse() : void
      {
         this.colipse = AUtils.getNewObj("ObjectBaseSprite") as Sprite;
         this.colipse.visible = false;
         this.addChild(this.colipse);
      }
      
      override public function setAction(param1:String) : void
      {
         if(!(!this.isReadyToSwim && this.standInObj))
         {
            if(this.curAction == "swim")
            {
               if(param1 != "dead" && param1 != "hit1" && param1 != "hurt")
               {
                  if(!this.standInObj)
                  {
                     this.isReadyToSwim = false;
                  }
                  return;
               }
            }
         }
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
            case "swim":
               if(_loc2_.y != 2)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(2);
               }
               this.bbdc.setState(param1);
               break;
            case "hit1":
               if(_loc2_.y != 6)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(6);
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
            case "hurt":
               if(_loc2_.y != 3)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(3);
               }
               this.bbdc.setState(param1);
               break;
            case "dead":
               if(_loc2_.y != 4)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(4);
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
               if(!this.standInObj)
               {
                  this.setAction("swim");
                  break;
               }
               this.setAction("wait");
               break;
            case "hit2":
               if(!this.standInObj)
               {
                  this.setAction("swim");
                  break;
               }
               this.setAction("wait");
               break;
            case "hurt":
               if(!this.standInObj)
               {
                  this.setAction("swim");
                  break;
               }
               this.setAction("wait");
               break;
            case "swim":
               this.bbdc.setFramePointX(0);
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
               if(param1.x == 2)
               {
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     this.doHi1(_loc3_);
                  }
               }
               break;
            case "hit2":
               if(param1.x == 1)
               {
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     this.doHi2(_loc3_);
                  }
               }
               break;
            case "swim":
               if(param1.x == 0)
               {
                  if(this.bbdc.getCurFrameCount() == 8)
                  {
                     if(this.curAttackTarget)
                     {
                        if(this.y > this.curAttackTarget.y)
                        {
                           this.speed.y = -6;
                           break;
                        }
                        this.speed.y = 5;
                     }
                  }
                  break;
               }
               if(param1.x == 1)
               {
                  if(this.curAttackTarget)
                  {
                     if(this.y > this.curAttackTarget.y)
                     {
                        this.speed.y = -6 * Number(this.bbdc.getCurFrameCount()) / 20;
                     }
                  }
               }
         }
      }
      
      override protected function hasAttackTarget() : void
      {
         var _loc1_:Number = Number(NaN);
         if(this.isBeAttacking() || this.isAttacking())
         {
            return;
         }
         if(!this.isAttacking() && !this.isBeAttacking())
         {
            if(Boolean(this.beforeSkill1Start()) && this.skillCD1[0] == 0)
            {
               this.releSkill1();
               this.skillCD1[0] = this.skillCD1[1];
            }
            else if(Boolean(this.beforeSkill2Start()) && this.skillCD2[0] == 0)
            {
               this.releSkill2();
               this.skillCD2[0] = this.skillCD2[1];
            }
            else if(Boolean(this.beforeSkill3Start()) && this.skillCD3[0] == 0)
            {
               this.releSkill3();
               this.skillCD3[0] = this.skillCD3[1];
            }
            else if(Boolean(this.beforeSkill4Start()) && this.skillCD4[0] == 0)
            {
               this.releSkill4();
               this.skillCD4[0] = this.skillCD4[1];
            }
            else if(Number(this.count) % gc.frameClips == 0)
            {
               _loc1_ = AUtils.GetDisBetweenTwoObj(this,this.curAttackTarget);
               if(_loc1_ <= this.attackRange)
               {
                  if(Math.random() <= this.normalAttackRate)
                  {
                     this.attackTarget();
                  }
                  else if(_loc1_ <= 500)
                  {
                     this.keepDisWithTarget();
                  }
                  else
                  {
                     this.setAction("wait");
                     this.setStatic();
                  }
               }
               else
               {
                  this.followTarget();
               }
            }
         }
      }
      
      private function keepDisWithTarget() : void
      {
         if(this.curAttackTarget)
         {
            if(this.x > this.curAttackTarget.x)
            {
               this.moveRight();
            }
            else if(this.x < this.curAttackTarget.x)
            {
               this.moveLeft();
            }
         }
      }
      
      override protected function attackTarget() : void
      {
         this.faceToTarget();
         this.newAttackId();
         this.setAction("hit2");
         this.lastHit = "hit2";
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 100;
      }
      
      override protected function releSkill1() : void
      {
         this.newAttackId();
         this.setYourFather(10);
         this.setAction("hit1");
         this.lastHit = "hit1";
         this.faceToTarget();
      }
      
      private function doHi1(param1:uint) : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster45Bullet1");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 60;
         }
         else
         {
            _loc2_.x = this.x + 60;
         }
         _loc2_.y = this.y - 30;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHi2(param1:uint) : void
      {
         var _loc2_:EnemyMoveBullet = new EnemyMoveBullet("Monster45Bullet2");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 20;
         }
         else
         {
            _loc2_.x = this.x + 20;
         }
         _loc2_.y = this.y - 20;
         var _loc3_:Point = AUtils.GetNextPointByTwoObj(_loc2_,this.curAttackTarget);
         _loc2_.setSpeed(_loc3_.x * 3,0);
         _loc2_.setAddSpeed(_loc3_.x,0);
         _loc2_.setDistance(1000);
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit2");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
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
         if(this.curAction != "swim" && !this.isAttacking() && !this.isBeAttacking())
         {
            if(Boolean(this.standInObj) && Boolean(this.curAttackTarget))
            {
               if(this.curAttackTarget.y < this.y - 200)
               {
                  this.isReadyToSwim = true;
                  this.setAction("swim");
               }
            }
         }
         if(this.curAction == "swim")
         {
            if(!this.isReadyToSwim && Boolean(this.standInObj))
            {
               this.setAction("wait");
            }
         }
      }
   }
}

