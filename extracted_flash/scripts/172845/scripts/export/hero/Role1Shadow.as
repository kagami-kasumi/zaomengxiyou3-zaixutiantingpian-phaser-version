package export.hero
{
   import base.*;
   import export.monster.*;
   import flash.display.*;
   import flash.geom.*;
   
   public class Role1Shadow extends BaseHero
   {
      
      public var source:BaseObject;
      
      private var maxCount:int;
      
      public function Role1Shadow(param1:BaseObject)
      {
         super();
         this.source = param1;
         this.horizenSpeed = 8;
         this.maxCount = gc.frameClips * 3;
         this.setAction("walk");
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
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("ROLE1_SHALLDOW");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],200,200,new Point(0,0));
            bbdc.setOffsetXY(15,-5);
            bbdc.setFrameStopCount([[72,72,72,72,72],[2,3,2,3],[2,12,16]]);
            bbdc.setFrameCount([[1,1,1,1,1],4,3]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("ROLE1_SHALLDOW--BitmapData Error!");
      }
      
      override protected function newColipse() : void
      {
         this.colipse = AUtils.getNewObj("ObjectBaseSprite") as Sprite;
         this.colipse.visible = false;
         this.addChild(this.colipse);
      }
      
      override public function setAction(param1:String) : void
      {
         var _loc2_:* = 0;
         super.setAction(param1);
         var _loc3_:Point = this.bbdc.getCurPoint();
         switch(param1)
         {
            case "walk":
               _loc2_ = uint(int(Math.random() * 5));
               this.bbdc.setFramePointX(_loc2_);
               this.bbdc.setFramePointY(0);
               this.bbdc.setState(param1);
               break;
            case "hit1":
               if(_loc3_.y != 1)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(1);
               }
               this.bbdc.setState(param1);
               break;
            case "hit2":
               if(_loc3_.y != 2)
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
               break;
            case "hit1":
               this.destroy();
               break;
            case "hit2":
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
                  if(param1.x == 0)
                  {
                     if(this.bbdc.getDirect() == 0)
                     {
                        _loc3_.x = this.x + 20;
                     }
                     else
                     {
                        _loc3_.x = this.x - 20;
                     }
                     _loc3_.y = this.y + 30;
                     if(this.source is Role1)
                     {
                        Role1(this.source).doHit8_1(this.getBBDC().getDirect(),_loc3_);
                        if(gc.sid == this.source.sid && gc.isInRoom())
                        {
                           gc.sendAttack(this.source.getRoleId(),"hit8",this.getBBDC().getDirect(),_loc3_.x,_loc3_.y,[]);
                        }
                        break;
                     }
                     if(this.source is Monster34)
                     {
                        Monster34(this.source).doHit8(this.getBBDC().getDirect(),_loc3_);
                     }
                  }
               }
               break;
            case "hit2":
               if(this.bbdc.getCurFrameCount() == 2)
               {
                  if(param1.x == 0)
                  {
                     if(this.bbdc.getDirect() == 0)
                     {
                        _loc3_.x = this.x;
                     }
                     else
                     {
                        _loc3_.x = this.x;
                     }
                     _loc3_.y = this.y - 85;
                     if(this.source is Role1)
                     {
                        Role1(this.source).doHit14_1(this.getBBDC().getDirect(),_loc3_);
                        if(gc.sid == this.source.sid && gc.isInRoom())
                        {
                           gc.sendAttack(this.source.getRoleId(),"hit14_1",this.getBBDC().getDirect(),_loc3_.x,_loc3_.y,[]);
                        }
                        break;
                     }
                     if(this.source is Monster34)
                     {
                        Monster34(this.source).doHit14_1(this.getBBDC().getDirect(),_loc3_);
                     }
                  }
                  break;
               }
               if(this.bbdc.getCurFrameCount() == 16)
               {
                  if(param1.x == 2)
                  {
                     if(this.bbdc.getDirect() == 0)
                     {
                        _loc3_.x = this.x - 145;
                     }
                     else
                     {
                        _loc3_.x = this.x + 145;
                     }
                     _loc3_.y = this.y - 60;
                     if(this.source is Role1)
                     {
                        Role1(this.source).doHit14_2_1(this.getBBDC().getDirect(),_loc3_);
                        if(gc.sid == this.source.sid && gc.isInRoom())
                        {
                           gc.sendAttack(this.source.getRoleId(),"hit14_2",this.getBBDC().getDirect(),_loc3_.x,_loc3_.y,[]);
                        }
                        break;
                     }
                     if(this.source is Monster34)
                     {
                        Monster34(this.source).doHit14_2(this.getBBDC().getDirect(),_loc3_);
                     }
                  }
               }
         }
      }
      
      override protected function move() : void
      {
      }
      
      override public function isAttacking() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3" || this.curAction == "hit4";
      }
      
      override protected function isCannotMoveWhenAttackOnFloor() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3" || this.curAction == "hit4";
      }
      
      override public function destroy() : void
      {
         super.destroy();
         this.source = null;
      }
   }
}

