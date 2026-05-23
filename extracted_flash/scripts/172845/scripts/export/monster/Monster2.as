package export.monster
{
   import base.*;
   import com.greensock.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   
   public class Monster2 extends BaseMonster
   {
      
      public function Monster2()
      {
         super();
         this.horizenSpeed = 5;
         if(gc.curStage == 3 && gc.curLevel == 3 || gc.curStage == 8)
         {
            this.setHp(24189);
            this.setSHp(24189);
            this.isBoss = false;
         }
         else
         {
            this.setHp(1500);
            this.setSHp(1500);
            this.isBoss = true;
         }
         this.protectedParamsObject.mysee = 5 * 60;
         this.protectedParamsObject.isattback = 50;
         this.attackRange = 250;
         this.alertRange = 1000;
         this.protectedParamsObject.def = 6;
         this.protectedParamsObject.mDef = 0.2;
         this.protectedParamsObject.exp = 20;
         this.protectedParamsObject.gxp = 10;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":999,
            "power":29,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[0,0],
            "attackInterval":4,
            "power":28,
            "attackKind":"magic",
            "addEffect":[{
               "name":"fix",
               "time":BaseBullet.DESIDE_BY_FRAMES_LEFT,
               "dizzy":1
            }]
         };
         this.monsterName = "顺风耳";
         this.setAction("wait");
         this.protectedParamsObject.probability = 0.8;
         this.fallList = [{
            "name":"kys",
            "bigtype":"zb"
         },{
            "name":"xhz",
            "bigtype":"zb"
         },{
            "name":"kyp",
            "bigtype":"zb"
         }];
         this.skillCD1 = [gc.frameClips * 1,gc.frameClips * 5];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster2");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],190,190,new Point(0,0));
            bbdc.setOffsetXY(-20,-10);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[15],[2,2,2,2,2,7],[2,2,15,16],[2,2,2,14]]);
            bbdc.setFrameCount([6,4,1,6,4,4]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster2--BitmapData Error!");
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
                  if(this.bbdc.getCurFrameCount() == 15)
                  {
                     this.doHi1_1(_loc3_);
                  }
                  break;
               }
               if(param1.x == 3)
               {
                  if(this.bbdc.getCurFrameCount() == 16)
                  {
                     this.doHi1_2(_loc3_);
                  }
               }
               break;
            case "hit2":
               if(param1.x == 3)
               {
                  if(this.bbdc.getCurFrameCount() == 14)
                  {
                     this.doHi2(_loc3_);
                  }
               }
         }
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 500;
      }
      
      override protected function releSkill1() : void
      {
         this.newAttackId();
         this.setAction("hit2");
         this.lastHit = "hit2";
      }
      
      private function doHi1_1(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster2Bullet1_1");
         if(param1 == 0)
         {
            _loc2_.x = this.x + 75;
         }
         else
         {
            _loc2_.x = this.x - 75;
         }
         _loc2_.y = this.y - 100;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHi1_2(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster2Bullet1_2");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 90;
         }
         else
         {
            _loc2_.x = this.x + 90;
         }
         _loc2_.y = this.y - 35;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHi2(param1:uint) : void
      {
         var _loc2_:* = null;
         var _loc3_:MovieClip = AUtils.getNewObj("Monster2Bullet2") as MovieClip;
         if(param1 == 0)
         {
            _loc3_.x = this.x - 35;
         }
         else
         {
            AUtils.flipHorizontal(_loc3_,-1);
            _loc3_.x = this.x + 35;
         }
         _loc3_.y = this.y - 80;
         gc.gameSence.addChild(_loc3_);
         var _loc4_:Array = gc.getPlayerArray();
         var _loc5_:int = 0;
         while(_loc5_ < _loc4_.length)
         {
            _loc2_ = _loc4_[_loc5_] as BaseHero;
            TweenMax.to(_loc2_,1,{
               "x":this.x,
               "y":this.y - 50
            });
            _loc5_++;
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
         var _loc1_:* = null;
         var _loc2_:* = null;
         var _loc3_:int = 0;
         var _loc4_:* = null;
         super.destroy();
         var _loc5_:Boolean = true;
         for each(_loc1_ in gc.pWorld.monsterArray)
         {
            if(_loc1_ is Monster4)
            {
               if(!_loc1_.isDead())
               {
                  _loc5_ = false;
               }
            }
         }
         if(_loc5_ && this.isBoss)
         {
            _loc2_ = gc.pWorld.getTransferDoorArray();
            _loc3_ = 0;
            while(_loc3_ < _loc2_.length)
            {
               _loc4_ = _loc2_[_loc3_];
               _loc4_.visible = true;
               _loc3_++;
            }
         }
      }
   }
}

