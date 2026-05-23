package export.monster
{
   import base.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   
   public class Monster78 extends BaseMonster
   {
      
      public function Monster78()
      {
         super();
         this.horizenSpeed = 3;
         if(Math.random() <= 1)
         {
            this.setLevel(1);
            this.setHp(200);
            this.setSHp(200);
         }
         else
         {
            this.setLevel(2 + Math.random() * 13);
            this.setHp(200 + (this.getLevel() - 1) * 64);
            this.setSHp(200 + (this.getLevel() - 1) * 64);
         }
         this.protectedParamsObject.def = 4;
         this.protectedParamsObject.exp = 6;
         this.protectedParamsObject.gxp = 2;
         this.isBoss = false;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":999,
            "power":12,
            "attackKind":"physics"
         };
         this.attackRange = 150;
         this.setAction("wait");
         this.setYourFather(gc.frameClips * 5);
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:Object = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("PetPetRabbitBmd1");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],100,100,new Point(0,0));
            bbdc.setOffsetXY(1,-10);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[8],[2,2,2,2,10],[2,2,2,10],[2,10]]);
            bbdc.setFrameCount([6,1,5,4,2]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("PetPetRabbitBmd1--BitmapData Error!");
      }
      
      override protected function newColipse() : void
      {
         this.colipse = AUtils.getNewObj("ObjectBaseSprite3") as Sprite;
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
               if(_loc2_.y != 0)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(0);
               }
               this.bbdc.setState(param1);
               break;
            case "hurt":
               if(_loc2_.y != 1)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(1);
               }
               this.bbdc.setState(param1);
               break;
            case "hit1":
               if(_loc2_.y != 3)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(3);
               }
               this.bbdc.setState(param1);
               break;
            case "dead":
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
            case "hurt":
               this.setStatic();
               this.setAction("wait");
               break;
            case "dead":
               this.destroy();
         }
      }
      
      override protected function enterFrameFunc(param1:Point) : void
      {
         var _loc2_:String = this.bbdc.getState();
         var _loc3_:uint = uint(this.getBBDC().getDirect());
         var _loc4_:Point = new Point();
         switch(_loc2_)
         {
            case "hit1":
               if(param1.x == 3)
               {
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     if(_loc3_ == 0)
                     {
                        _loc4_.x = this.x - 30;
                     }
                     else
                     {
                        _loc4_.x = this.x + 30;
                     }
                     _loc4_.y = this.y;
                     this.doHit1(_loc3_,_loc4_);
                  }
               }
         }
      }
      
      override public function reduceHp(param1:int, param2:Boolean = false) : void
      {
         super.reduceHp(param1,param2);
      }
      
      private function doHit1(param1:uint, param2:Point) : void
      {
         var _loc3_:EnemyMoveBullet = new EnemyMoveBullet("PetPetRabbitBullet1");
         if(param1 == 0)
         {
            _loc3_.setSpeed(-15,0);
         }
         else
         {
            _loc3_.setSpeed(15,0);
         }
         _loc3_.setDistance(600);
         _loc3_.setDestroyWhenLastFrame(false);
         _loc3_.setDestroyInCount(gc.frameClips * 4);
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit1");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
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
   }
}

