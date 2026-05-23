package export.Otherzm
{
   import config.*;
   import event.*;
   import flash.display.MovieClip;
   import flash.display.SimpleButton;
   import flash.events.*;
   
   public class Sgzzinterface extends MovieClip
   {
      
      public var btn_close:SimpleButton;
      
      public var mssd:SimpleButton;
      
      public var qysk:SimpleButton;
      
      public var bzs:SimpleButton;
      
      public var hss:SimpleButton;
      
      private var gc:Config;
      
      public function Sgzzinterface()
      {
         super();
         this.gc = Config.getInstance();
         this.addEventListener(Event.ADDED_TO_STAGE,this.added,false,0,true);
         this.addEventListener(Event.REMOVED_FROM_STAGE,this.removed,false,0,true);
      }
      
      private function added(param1:Event) : void
      {
         this.mssd.addEventListener("click",this.intomssd);
         this.qysk.addEventListener("click",this.intoqysk);
         this.bzs.addEventListener("click",this.intobzs);
         this.hss.addEventListener("click",this.intohss);
         this.btn_close.addEventListener("click",this.closeui);
      }
      
      private function removed(param1:Event) : void
      {
         this.mssd.removeEventListener("click",this.intomssd);
         this.qysk.removeEventListener("click",this.intoqysk);
         this.bzs.removeEventListener("click",this.intobzs);
         this.hss.removeEventListener("click",this.intohss);
         this.btn_close.removeEventListener("click",this.closeui);
      }
      
      private function intobzs(param1:MouseEvent) : void
      {
         if(this.gc.player1.getCurLevel() < 40)
         {
            this.gc.ts.setTxt("等级未到40级，无法挑战！");
            this.gc.stage.addChild(this.gc.ts);
            return;
         }
         this.gc.curStage = 16;
         this.gc.curLevel = 1;
         this.gc.eventManger.dispatchEvent(new CommonEvent("selectStageOver"));
         this.destroy();
      }
      
      private function intohss(param1:MouseEvent) : void
      {
         if(this.gc.player1.getCurLevel() < 40)
         {
            this.gc.ts.setTxt("等级未到40级，无法挑战！");
            this.gc.stage.addChild(this.gc.ts);
            return;
         }
         this.gc.curStage = 30;
         this.gc.curLevel = 1;
         this.gc.eventManger.dispatchEvent(new CommonEvent("selectStageOver"));
         this.destroy();
      }
      
      private function intomssd(param1:MouseEvent) : void
      {
         if(this.gc.player1.getCurLevel() < 40)
         {
            this.gc.ts.setTxt("等级未到40级，无法挑战！");
            this.gc.stage.addChild(this.gc.ts);
            return;
         }
         this.gc.curStage = 13;
         this.gc.curLevel = 1;
         this.gc.eventManger.dispatchEvent(new CommonEvent("selectStageOver"));
         this.destroy();
      }
      
      private function intoqysk(param1:MouseEvent) : void
      {
         if(this.gc.player1.getCurLevel() < 40)
         {
            this.gc.ts.setTxt("等级未到40级，无法挑战！");
            this.gc.stage.addChild(this.gc.ts);
            return;
         }
         this.gc.curStage = 15;
         this.gc.curLevel = 1;
         this.gc.eventManger.dispatchEvent(new CommonEvent("selectStageOver"));
         this.destroy();
      }
      
      private function closeui(param1:MouseEvent) : void
      {
         this.destroy();
      }
      
      private function destroy() : void
      {
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
      }
   }
}

