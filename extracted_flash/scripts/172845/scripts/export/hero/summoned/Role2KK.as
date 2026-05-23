package export.hero.summoned
{
   import base.*;
   import com.greensock.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.events.Event;
   import flash.geom.*;
   
   public class Role2KK extends BaseSummon
   {
      
      private var surviveCD:int;
      
      private var skillCD:int;
      
      private var curTarget:BaseObject;
      
      public function Role2KK()
      {
         super();
         this.isFly = true;
         this.graity = 0;
         this.horizenSpeed = 5;
         this.speed.y = 0;
         this.setAction("wait");
      }
      
      override protected function __added(param1:Event) : void
      {
         super.__added(param1);
         this.setYourFather(gc.frameClips * 30);
         this.surviveCD = gc.frameClips * 30;
         this.skillCD = gc.frameClips * 5;
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
         throw new Error("Role2KK--BitmapData Error!");
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
               return;
            case "hit1":
               if(_loc2_.y != 1)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(1);
               }
               this.bbdc.setState(param1);
               return;
            case "hit2":
               if(_loc2_.y != 2)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(2);
               }
               this.bbdc.setState(param1);
               return;
            case "hit3":
               if(_loc2_.y != 3)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(3);
               }
               this.bbdc.setState(param1);
               return;
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
               return;
            default:
               return;
         }
      }
      
      override protected function enterFrameFunc(param1:Point) : void
      {
      }
      
      override public function destroy() : void
      {
         super.destroy();
      }
   }
}

