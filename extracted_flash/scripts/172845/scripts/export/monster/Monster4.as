package export.monster
{
   import base.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   
   public class Monster4 extends BaseMonster
   {
      
      public function Monster4()
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
            this.setHp(1481);
            this.setSHp(1481);
            this.isBoss = true;
         }
         this.protectedParamsObject.mysee = 5 * 60;
         this.protectedParamsObject.isattback = 50;
         this.attackRange = 200;
         this.alertRange = 1000;
         this.protectedParamsObject.def = 5;
         this.protectedParamsObject.mDef = 0.2;
         this.protectedParamsObject.exp = 20;
         this.protectedParamsObject.gxp = 10;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-10,-5],
            "attackInterval":999,
            "power":49,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-8,-2],
            "attackInterval":999,
            "power":42,
            "attackKind":"magic"
         };
         this.monsterName = "千里眼";
         this.setAction("wait");
         this.protectedParamsObject.probability = 0.8;
         this.fallList = [{
            "name":"kyg",
            "bigtype":"zb"
         },{
            "name":"kyz",
            "bigtype":"zb"
         },{
            "name":"kyj",
            "bigtype":"zb"
         }];
         this.skillCD1 = [gc.frameClips * 2,gc.frameClips * 4.5];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster4");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],190,190,new Point(0,0));
            bbdc.setOffsetXY(0,-10);
            bbdc.setFrameStopCount([[2,3,4,3,3],[4,4,4,4],[15],[2,2,2,2,2,8],[4,4,4,2,7],[2,2,2,2,29,23]]);
            bbdc.setFrameCount([5,4,1,5,5,6]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster4--BitmapData Error!");
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
               if(param1.x == 3)
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     this.doHi1(_loc3_);
                  }
               }
               break;
            case "hit2":
               if(param1.x == 3)
               {
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     this.doHi2_1(_loc3_);
                  }
                  break;
               }
               if(param1.x == 4)
               {
                  if(this.bbdc.getCurFrameCount() == 9)
                  {
                     this.doHi2_2(_loc3_);
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
         this.setYourFather(45);
         this.setAction("hit2");
         this.lastHit = "hit2";
      }
      
      private function doHi1(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster4Bullet1");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 155;
         }
         else
         {
            _loc2_.x = this.x + 155;
         }
         _loc2_.y = this.y;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHi2_1(param1:uint) : void
      {
         var _loc2_:Array = gc.getPlayerArray();
         var _loc3_:uint = Math.random() * _loc2_.length;
         var _loc4_:BaseHero = _loc2_[_loc3_] as BaseHero;
         var _loc5_:SpecialEffectBullet = new SpecialEffectBullet("Monster4Bullet2_1");
         if(param1 == 0)
         {
            _loc5_.x = this.x - 40;
         }
         else
         {
            _loc5_.x = this.x + 40;
         }
         _loc5_.y = this.y - 70;
         _loc5_.setRole(this);
         _loc5_.setDisable();
         _loc5_.setDirect(param1);
         _loc5_.setAction("hit2");
         gc.gameSence.addChild(_loc5_);
         this.magicBulletArray.push(_loc5_);
      }
      
      private function doHi2_2(param1:uint) : void
      {
         var _loc2_:Array = gc.getPlayerArray();
         var _loc3_:uint = Math.random() * _loc2_.length;
         var _loc4_:BaseHero = _loc2_[_loc3_] as BaseHero;
         var _loc5_:SpecialEffectBullet = new SpecialEffectBullet("Monster4Bullet2_2");
         if(param1 == 0)
         {
            _loc5_.x = this.x - 195;
         }
         else
         {
            _loc5_.x = this.x + 195;
         }
         _loc5_.y = this.y - 50;
         _loc5_.setRole(this);
         _loc5_.setDirect(param1);
         _loc5_.setAction("hit2");
         gc.gameSence.addChild(_loc5_);
         this.magicBulletArray.push(_loc5_);
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
            if(_loc1_ is Monster2)
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

