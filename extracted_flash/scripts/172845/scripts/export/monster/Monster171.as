package export.monster
{
   import base.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   import my.*;
   
   public class Monster171 extends BaseMonster
   {
      
      public function Monster171()
      {
         super();
         this.horizenSpeed = 3;
         if(gc.curStage == 5 && gc.curLevel == 1)
         {
            this.setHp(700);
            this.setSHp(700);
            this.protectedParamsObject.def = 15;
            this.protectedParamsObject.exp = 9;
            this.protectedParamsObject.gxp = 3;
            this.attackBackInfoDict["hit1"] = {
               "hitMaxCount":99,
               "attackBackSpeed":[6,-5],
               "attackInterval":999,
               "power":17,
               "attackKind":"physics"
            };
            this.attackBackInfoDict["hit2"] = {
               "hitMaxCount":99,
               "attackBackSpeed":[0,0],
               "attackInterval":999,
               "power":17,
               "attackKind":"magic"
            };
         }
         else
         {
            this.setHp(35 * 60);
            this.setSHp(35 * 60);
            this.protectedParamsObject.def = 41;
            this.protectedParamsObject.exp = 36;
            this.protectedParamsObject.gxp = 16;
            this.attackBackInfoDict["hit1"] = {
               "hitMaxCount":99,
               "attackBackSpeed":[6,-5],
               "attackInterval":999,
               "power":52,
               "attackKind":"physics"
            };
            this.attackBackInfoDict["hit2"] = {
               "hitMaxCount":99,
               "attackBackSpeed":[0,0],
               "attackInterval":999,
               "power":52,
               "attackKind":"magic"
            };
         }
         this.protectedParamsObject.mysee = 5 * 60;
         this.protectedParamsObject.isattback = 50;
         this.attackRange = 250;
         this.alertRange = 1000;
         this.isBoss = false;
         this.setAction("wait");
         this.skillCD1 = [gc.frameClips * 3,gc.frameClips * 3];
         this.protectedParamsObject.probability = 0.15;
         this.fallList = [];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster17");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],200,200,new Point(0,0));
            bbdc.setOffsetXY(-16,-22);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[15],[2,2,2,2,7],[2,2,2,2,8]]);
            bbdc.setFrameCount([6,4,1,5,5]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster17--BitmapData Error!");
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
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     this.doHi1(_loc3_);
                  }
               }
         }
      }
      
      private function doHi1(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster17Bullet1");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 140;
         }
         else
         {
            _loc2_.x = this.x + 140;
         }
         _loc2_.y = this.y - 70;
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
      }
      
      override public function destroy() : void
      {
         if(this.getHp() <= 0)
         {
            if(Math.random() <= 0.125)
            {
               if(gc.curStage == 5 && gc.curLevel == 1)
               {
                  if(Math.random() <= 0.5)
                  {
                     MainGame.getInstance().createLikeMonster(72,this.x,this.y - 50);
                  }
                  else
                  {
                     MainGame.getInstance().createLikeMonster(73,this.x,this.y - 50);
                  }
               }
               else if(Math.random() <= 0.5)
               {
                  MainGame.getInstance().createLikeMonster(70,this.x,this.y - 50);
               }
               else
               {
                  MainGame.getInstance().createLikeMonster(71,this.x,this.y - 50);
               }
            }
         }
         super.destroy();
      }
   }
}

