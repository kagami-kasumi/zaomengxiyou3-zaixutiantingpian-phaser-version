package export.monster
{
   import base.*;
   import com.greensock.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   
   public class Monster187 extends BaseMonster
   {
      
      private var _target:BaseHero;
      
      private var tw:TweenMax;
      
      private var isFallDown:Boolean = false;
      
      public function Monster187()
      {
         super();
         this.normalAttackRate = 0.8;
         this.horizenSpeed = 4;
         this.setHp(3990000 * 0.2);
         this.setSHp(3990000 * 0.2);
         this.attackRange = 250;
         this.alertRange = 1000;
         this.protectedParamsObject.def = 2038;
         this.protectedParamsObject.exp = 70;
         this.protectedParamsObject.gxp = 35;
         this.protectedParamsObject.mDef = 0.45;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-6,-5],
            "attackInterval":10,
            "power":7300,
            "attackKind":"physics"
         };
         this.isBoss = false;
         this.setAction("wait");
         this.protectedParamsObject.probability = 0;
         this.protectedParamsObject.fallList = [];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:Object = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster187");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],100,50,new Point(0,0));
            bbdc.setOffsetXY(0,5);
            bbdc.setFrameStopCount([[4,4],[8],[2,2,2,10]]);
            bbdc.setFrameCount([2,1,4]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster187--BitmapData Error!");
      }
      
      override protected function newColipse() : void
      {
         this.colipse = AUtils.getNewObj("ObjectBaseSprite2") as Sprite;
         this.colipse.height = 20;
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
               if(_loc2_.y != 2)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(2);
               }
               this.bbdc.setState(param1);
               break;
            case "dead":
               this.setStatic();
               this.destroy();
         }
      }
      
      override protected function scriptFrameOverFunc(param1:int) : void
      {
         var _loc2_:String = String(this.bbdc.getState());
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
         }
      }
      
      override protected function enterFrameFunc(param1:Point) : void
      {
         var _loc2_:String = String(this.bbdc.getState());
         var _loc3_:uint = uint(this.getBBDC().getDirect());
         var _loc4_:* = _loc2_;
         if("hit1" === _loc4_)
         {
            if(param1.x == 3)
            {
               if(this.bbdc.getCurFrameCount() == 10)
               {
                  this.doHi1(_loc3_);
               }
            }
         }
      }
      
      private function doHi1(param1:uint) : void
      {
         var _loc2_:EnemyMoveBullet = new EnemyMoveBullet("Monster187Bullet1");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 60;
            _loc2_.setSpeed(-10,0);
         }
         else
         {
            _loc2_.x = this.x + 60;
            _loc2_.setSpeed(10,0);
         }
         _loc2_.y = this.y - 20;
         _loc2_.setHurtCanCutDownEffect(false);
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setDestroyInCount(20);
         _loc2_.setDistance(9999);
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      override public function reduceHp(param1:int, param2:Boolean = false) : void
      {
         super.reduceHp(param1,param2);
         if(this.isFallDown)
         {
            if(this._target)
            {
               this._target.reduceHp(param1,false);
            }
         }
      }
      
      override protected function exitFrameFunc(param1:Point) : void
      {
      }
      
      override protected function myIntelligence() : void
      {
         var _loc1_:* = undefined;
         var _loc2_:Array = null;
         if(!this._target)
         {
            if(!this.isBeAttacking())
            {
               super.myIntelligence();
            }
            _loc2_ = gc.getPlayerArray();
            for each(_loc1_ in _loc2_)
            {
               if(AUtils.GetDisBetweenTwoObj(this,_loc1_) <= 80)
               {
                  this._target = _loc1_;
                  this.tw = TweenMax.delayedCall(8,this.fallDown);
                  break;
               }
            }
         }
         else if(this._target.isDead())
         {
            if(this.tw)
            {
               this.tw.kill();
               this.tw = null;
            }
            this._target = null;
         }
         else if(!this.isFallDown)
         {
            this.x = this._target.x + 30;
            this.y = this._target.y;
         }
         else if(!this.isBeAttacking())
         {
            super.myIntelligence();
         }
      }
      
      private function fallDown() : void
      {
         this.isFallDown = true;
         if(this._target)
         {
            this.setSHp(this._target.roleProperies.getSHHP());
            this.setHp(this.getSHp());
            this.x = this._target.x;
            this.y = this._target.y - 10;
         }
      }
      
      override public function destroy() : void
      {
         super.destroy();
         if(this.tw)
         {
            this.tw.kill();
            this.tw = null;
         }
         this._target = null;
      }
   }
}

