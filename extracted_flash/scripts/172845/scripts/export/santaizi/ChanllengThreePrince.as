package export.santaizi
{
   import config.*;
   import event.*;
   import flash.display.MovieClip;
   import flash.display.SimpleButton;
   import flash.display.Sprite;
   import flash.events.*;
   import flash.text.TextField;
   import flash.utils.*;
   
   public class ChanllengThreePrince extends Sprite
   {
      
      public var xbtn:SimpleButton;
      
      private var bossID:uint;
      
      public var mc1:MovieClip;
      
      public var mc2:MovieClip;
      
      public var mc3:MovieClip;
      
      public var txt:TextField;
      
      public var costbtn:SimpleButton;
      
      private var gc:Config;
      
      public function ChanllengThreePrince()
      {
         super();
         this.gc = Config.getInstance();
         this.addEventListener(Event.ADDED_TO_STAGE,this.added,false,0,true);
         this.addEventListener(Event.REMOVED_FROM_STAGE,this.removed,false,0,true);
      }
      
      private function added(param1:Event) : void
      {
         this.mc1.buttonMode = true;
         this.mc2.buttonMode = true;
         this.mc3.buttonMode = true;
         this.mc1.addEventListener(MouseEvent.CLICK,this.mcClick);
         this.mc2.addEventListener(MouseEvent.CLICK,this.mcClick);
         this.mc3.addEventListener(MouseEvent.CLICK,this.mcClick);
         this.xbtn.addEventListener(MouseEvent.CLICK,this.xClick);
         this.setTxt();
      }
      
      private function removed(param1:Event) : void
      {
         this.xbtn.removeEventListener(MouseEvent.CLICK,this.xClick);
         this.mc1.removeEventListener(MouseEvent.CLICK,this.mcClick);
         this.mc2.removeEventListener(MouseEvent.CLICK,this.mcClick);
         this.mc3.removeEventListener(MouseEvent.CLICK,this.mcClick);
      }
      
      private function setTxt() : void
      {
         this.txt.text = 999 + "";
      }
      
      private function mcClick(param1:MouseEvent) : void
      {
         var _loc2_:Number = Number(NaN);
         _loc2_ = Math.random();
         if(_loc2_ < 0.3333)
         {
            this.bossID = 1;
         }
         else if(_loc2_ >= 0.3333 && _loc2_ < 0.6666)
         {
            this.bossID = 2;
         }
         else
         {
            this.bossID = 3;
         }
         param1.target.gotoAndStop(this.bossID + 1);
         this.mc1.removeEventListener(MouseEvent.CLICK,this.mcClick);
         this.mc2.removeEventListener(MouseEvent.CLICK,this.mcClick);
         this.mc3.removeEventListener(MouseEvent.CLICK,this.mcClick);
         setTimeout(this.gotoFuBen,1000);
      }
      
      private function gotoFuBen() : void
      {
         this.gc.curStage = 44;
         this.gc.curLevel = this.bossID;
         this.gc.eventManger.dispatchEvent(new CommonEvent("selectStageOver"));
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
      }
      
      private function xClick(param1:MouseEvent) : void
      {
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
      }
   }
}

