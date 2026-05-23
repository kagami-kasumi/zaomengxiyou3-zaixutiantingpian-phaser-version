package export.monster
{
   import base.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   
   public class Monster44 extends BaseMonster
   {
      
      private var isReadyToSwim:Boolean = false;
      
      public function Monster44()
      {
         super();
         this.horizenSpeed = 4;
         this.normalAttackRate = 0.7;
         this.protectedParamsObject.def = 743;
         this.protectedParamsObject.exp = 100;
         this.protectedParamsObject.gxp = 50;
         this.protectedParamsObject.mDef = 0.3;
         this.setHp(140000);
         this.setSHp(140000);
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":999,
            "power":1080,
            "attackKind":"physics",
            "addEffect":[{
               "name":BaseAddEffect.STUN,
               "time":gc.frameClips * 1
            }]
         };
         this.attackRange = 80;
         this.alertRange = 1000;
         this.isBoss = false;
         this.graity = 0.2;
         this.setAction("wait");
         this.protectedParamsObject.probability = 0;
         this.fallList = [];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster44");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],250,150,new Point(0,0));
            bbdc.setOffsetXY(2,-32);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8,8,8,20],[2,2,2,2,2,10],[2,2,10]]);
            bbdc.setFrameCount([6,4,4,6,3]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster44--BitmapData Error!");
      }
      
      override protected function newColipse() : void
      {
         this.colipse = AUtils.getNewObj("ObjectBaseSprite7") as Sprite;
         this.colipse.visible = false;
         this.colipse.scaleX = 0.5;
         this.addChild(this.colipse);
      }
      
      override protected function attackTarget() : void
      {
         if(Math.random() < 0.2)
         {
            this.attackBackInfoDict["hit1"] = {
               "hitMaxCount":99,
               "attackBackSpeed":[6,-5],
               "attackInterval":999,
               "power":1080,
               "attackKind":"physics",
               "addEffect":[{
                  "name":BaseAddEffect.STUN,
                  "time":gc.frameClips * 1
               }]
            };
         }
         else
         {
            this.attackBackInfoDict["hit1"] = {
               "hitMaxCount":99,
               "attackBackSpeed":[6,-5],
               "attackInterval":999,
               "power":1080,
               "attackKind":"physics"
            };
         }
         super.attackTarget();
      }
      
      override public function setAction(param1:String) : void
      {
         if(!(!this.isReadyToSwim && this.standInObj))
         {
            if(this.curAction == "swim")
            {
               if(param1 != "dead" && param1 != "hit1")
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
               if(_loc2_.y != 4)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(4);
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
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     this.doHi1(_loc3_);
                  }
               }
               break;
            case "swim":
               if(param1.x == 2)
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
               if(param1.x == 3)
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
      
      override public function reduceHp(param1:int, param2:Boolean = false) : void
      {
         super.reduceHp(param1,false);
      }
      
      private function doHi1(param1:uint) : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster44Bullet1");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 130;
         }
         else
         {
            _loc2_.x = this.x + 130;
         }
         _loc2_.y = this.y - 125;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit1");
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
         if(this.curAction != "swim" && !this.isAttacking())
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

