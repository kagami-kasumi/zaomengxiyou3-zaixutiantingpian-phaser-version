package export.hero
{
   import base.*;
   import export.monster.*;
   import flash.display.*;
   import flash.geom.*;
   
   public class Role2Shadow extends BaseHero
   {
      
      public var source:BaseObject;
      
      private var maxCount:int;
      
      public function Role2Shadow(param1:BaseObject)
      {
         super();
         this.source = param1;
         this.horizenSpeed = 6;
         if(param1 is Role2)
         {
            this.horizenSpeed = 5 + Role2(param1).getPlayer().returnSkillLevelBySkillName("shy");
         }
         this.maxCount = gc.frameClips * 8;
         this.setAction("waik");
         this.setYourFather(9999);
      }
      
      public function setDirect(param1:uint) : void
      {
         if(param1 == 0)
         {
            this.turnLeft();
         }
         else
         {
            this.turnRight();
         }
      }
      
      override public function step() : void
      {
         super.step();
         --this.maxCount;
         if(this.maxCount <= 0)
         {
            this.destroy();
         }
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("ROLE2_SHALLDOW");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],200,200,new Point(0,0));
            bbdc.setOffsetXY(15,-5);
            bbdc.setFrameStopCount([[4,4,4,4],[2,5,2,20],[2,2,20],[30],[55]]);
            bbdc.setFrameCount([4,4,3,1,1]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("TANGSENG_SHALLDOW--BitmapData Error!");
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
            case "walk":
               if(_loc2_.y != 0)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(0);
               }
               this.bbdc.setState(param1);
               break;
            case "hit1":
               if(_loc2_.y != 1)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(1);
               }
               this.bbdc.setState(param1);
               break;
            case "hit2":
               if(_loc2_.y != 2)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(2);
               }
               this.bbdc.setState(param1);
               break;
            case "hit3":
               if(_loc2_.y != 3)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(3);
               }
               this.bbdc.setState(param1);
               break;
            case "hit4":
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
            case "hit1":
               this.destroy();
               break;
            case "hit2":
               this.destroy();
               break;
            case "hit3":
               this.destroy();
               break;
            case "hit4":
               this.destroy();
         }
      }
      
      override protected function enterFrameFunc(param1:Point) : void
      {
         var _loc2_:String = this.bbdc.getState();
         var _loc3_:Point = new Point();
         switch(_loc2_)
         {
            case "hit1":
               if(this.bbdc.getCurFrameCount() == 2)
               {
                  if(param1.x == 2)
                  {
                     if(this.bbdc.getDirect() == 0)
                     {
                        _loc3_.x = this.x;
                     }
                     else
                     {
                        _loc3_.x = this.x;
                     }
                     _loc3_.y = this.y + 10;
                     if(this.source is Role2)
                     {
                        Role2(this.source).doHit3_2(this.getBBDC().getDirect(),_loc3_);
                        if(gc.sid == this.source.sid)
                        {
                           gc.sendAttack(this.source.getRoleId(),"hit3",this.getBBDC().getDirect(),_loc3_.x,_loc3_.y,[]);
                        }
                     }
                     else if(this.source is Monster31)
                     {
                        Monster31(this.source).doHit3(this.getBBDC().getDirect(),_loc3_);
                     }
                  }
               }
               if(param1.x == 3)
               {
                  if(this.bbdc.getCurFrameCount() >= 20 && Number(this.bbdc.getCurFrameCount()) % 8 == 0)
                  {
                     gc.vControllor.shake(25);
                  }
               }
               break;
            case "hit2":
               if(this.bbdc.getCurFrameCount() == 20)
               {
                  if(param1.x == 2)
                  {
                     if(this.bbdc.getDirect() == 0)
                     {
                        _loc3_.x = this.x;
                     }
                     else
                     {
                        _loc3_.x = this.x;
                     }
                     _loc3_.y = this.y - 25;
                     if(this.source is Role2)
                     {
                        Role2(this.source).doHit6(this.getBBDC().getDirect(),_loc3_);
                        if(gc.sid == this.source.sid)
                        {
                           gc.sendAttack(this.source.getRoleId(),"hit6",this.getBBDC().getDirect(),_loc3_.x,_loc3_.y,[]);
                        }
                        break;
                     }
                     if(this.source is Monster31)
                     {
                        Monster31(this.source).doHit6(this.getBBDC().getDirect(),_loc3_);
                     }
                  }
               }
               break;
            case "hit3":
               if(this.bbdc.getCurFrameCount() == 20)
               {
                  if(param1.x == 0)
                  {
                     if(this.bbdc.getDirect() == 0)
                     {
                        _loc3_.x = this.x + 5;
                     }
                     else
                     {
                        _loc3_.x = this.x - 5;
                     }
                     _loc3_.y = this.y - 60;
                     if(this.source is Role2)
                     {
                        Role2(this.source).doHit8_2(this.getBBDC().getDirect(),_loc3_);
                        if(gc.sid == this.sid)
                        {
                           gc.sendAttack(this.getRoleId(),"hit8",this.getBBDC().getDirect(),_loc3_.x,_loc3_.y,[]);
                        }
                        break;
                     }
                     if(this.source is Monster31)
                     {
                        Monster31(this.source).doHit8(this.getBBDC().getDirect(),_loc3_);
                     }
                  }
               }
               break;
            case "hit4":
               if(this.bbdc.getCurFrameCount() == 55)
               {
                  if(param1.x == 0)
                  {
                     if(this.bbdc.getDirect() == 0)
                     {
                        _loc3_.x = this.x - 20;
                     }
                     else
                     {
                        _loc3_.x = this.x + 20;
                     }
                     _loc3_.y = this.y - 20;
                     if(this.source is Role2)
                     {
                        Role2(this.source).doHit9_1_2(this.getBBDC().getDirect(),_loc3_);
                        if(gc.sid == this.sid)
                        {
                           gc.sendAttack(this.getRoleId(),"hit9_1",this.getBBDC().getDirect(),_loc3_.x,_loc3_.y,[]);
                        }
                        break;
                     }
                     if(this.source is Monster31)
                     {
                        Monster31(this.source).doHit9_1(this.getBBDC().getDirect(),_loc3_);
                     }
                  }
                  break;
               }
               if(this.bbdc.getCurFrameCount() == 45)
               {
                  if(param1.x == 0)
                  {
                     if(this.bbdc.getDirect() == 0)
                     {
                        _loc3_.x = this.x - 150;
                     }
                     else
                     {
                        _loc3_.x = this.x + 150;
                     }
                     _loc3_.y = this.y - 150;
                     if(this.source is Role2)
                     {
                        Role2(this.source).doHit9_2_2(this.getBBDC().getDirect(),_loc3_);
                        if(gc.sid == this.sid)
                        {
                           gc.sendAttack(this.getRoleId(),"hit9_2",this.getBBDC().getDirect(),_loc3_.x,_loc3_.y,[]);
                        }
                        break;
                     }
                     if(this.source is Monster31)
                     {
                        Monster31(this.source).doHit9_2(this.getBBDC().getDirect(),_loc3_);
                     }
                  }
               }
         }
      }
      
      override public function isAttacking() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3" || this.curAction == "hit4";
      }
      
      override protected function isCannotMoveWhenAttackOnFloor() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3" || this.curAction == "hit4";
      }
      
      override protected function isCannotMoveWhenAttack() : Boolean
      {
         return this.curAction == "hit8" || this.curAction == "hit3" || this.curAction == "hit9";
      }
      
      override public function destroy() : void
      {
         if(this.source is Role2)
         {
            Role2(this.source).role2Shalldow = null;
         }
         else if(this.source is Monster31)
         {
            Monster31(this.source).role2Shalldow = null;
         }
         super.destroy();
      }
   }
}

