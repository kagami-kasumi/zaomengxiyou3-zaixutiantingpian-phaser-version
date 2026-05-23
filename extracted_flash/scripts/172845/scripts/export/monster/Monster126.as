package export.monster
{
   import base.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   
   public class Monster126 extends BaseMonster
   {
      
      public function Monster126()
      {
         super();
         this.horizenSpeed = 4;
         this.setHp(400000);
         this.setSHp(400000);
         this.protectedParamsObject.def = 896;
         this.protectedParamsObject.exp = 500;
         this.protectedParamsObject.gxp = 250;
         this.protectedParamsObject.mDef = 0.32;
         this.protectedParamsObject.probability = 0.8;
         this.fallList = [{
            "name":"wptm",
            "bigtype":"dj"
         },{
            "name":"wpxt",
            "bigtype":"dj"
         },{
            "name":"wpsc",
            "bigtype":"dj"
         },{
            "name":"xhb",
            "bigtype":"dj"
         }];
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":800,
            "power":500,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":1,
            "attackBackSpeed":[0,0],
            "attackInterval":999,
            "power":500,
            "attackKind":"magic",
            "addEffect":[{
               "name":BaseAddEffect.POISON,
               "time":gc.frameClips * 5,
               "power":gc.hero1.roleProperies.getSHHP() * 0.015
            },{
               "name":BaseAddEffect.POISON_TIMES,
               "time":gc.frameClips * 5
            }]
         };
         this.attackRange = 250;
         this.alertRange = 1000;
         this.isBoss = false;
         this.setAction("wait");
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster126");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],150,150,new Point(0,0));
            bbdc.setOffsetXY(5,-8);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[8],[2,2,2,2,10,144],[2,2,10]]);
            bbdc.setFrameCount([6,1,6,3]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster126--BitmapData Error!");
      }
      
      override protected function newColipse() : void
      {
         this.colipse = AUtils.getNewObj("ObjectBaseSprite") as Sprite;
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
               this.setYourFather(999);
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
            case "dead":
               if(param1.x == 5)
               {
                  if(this.bbdc.getCurFrameCount() == 144)
                  {
                     this.doWhenDead(_loc3_);
                  }
               }
         }
      }
      
      private function doHi1(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster126Bullet1");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 60;
         }
         else
         {
            _loc2_.x = this.x + 60;
         }
         _loc2_.y = this.y - 10;
         _loc2_.setFuncWhenDestroy(this.dohit1_2);
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function dohit1_2(param1:BaseBullet) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster126Bullet1_2");
         if(param1.getDirect() == -1)
         {
            _loc2_.x = param1.x - 190;
         }
         else
         {
            _loc2_.x = param1.x + 190;
         }
         _loc2_.y = param1.y + 50;
         _loc2_.setRole(this);
         _loc2_.setDirect(0);
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doWhenDead(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster126Bullet2_1");
         _loc2_.x = this.x;
         _loc2_.y = this.y - 30;
         _loc2_.setRole(this);
         _loc2_.setDisable();
         _loc2_.setFuncWhenDestroy(this.deadFunction);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit2");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function deadFunction(param1:BaseBullet) : void
      {
         var _loc2_:BaseObject = null;
         var _loc3_:Array = null;
         var _loc4_:* = null;
         var _loc5_:* = null;
         _loc3_ = gc.getPlayerAndPetArray();
         _loc2_ = _loc3_[int(Math.random() * _loc3_.length)] as BaseObject;
         if(_loc2_)
         {
            _loc4_ = new EnemyMoveBullet("Monster126Bullet2_2");
            _loc4_.x = param1.x;
            _loc4_.y = param1.y;
            _loc4_.setRole(this);
            _loc5_ = AUtils.GetNextPointByTwoObj(this,_loc2_);
            _loc4_.setSpeed(Number(_loc5_.x) * 1,Number(_loc5_.y) * 1);
            _loc4_.setAddSpeed(_loc5_.x,_loc5_.y);
            _loc4_.setDistance(1000);
            _loc4_.setDestroyWhenLastFrame(false);
            _loc4_.setDirect(0);
            _loc4_.setAction("hit2");
            gc.gameSence.addChild(_loc4_);
            this.magicBulletArray.push(_loc4_);
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
      
      override public function destroy() : void
      {
         super.destroy();
      }
   }
}

