package export
{
   import flash.display.MovieClip;
   import flash.display.SimpleButton;
   import flash.events.*;
   
   public class Help extends MovieClip
   {
      
      public var btnback:SimpleButton;
      
      public var actionHelp:SimpleButton;
      
      public var achivePet:SimpleButton;
      
      public function Help()
      {
         super();
         this.addEventListener(Event.ADDED_TO_STAGE,this.added,false,0,true);
         this.addEventListener(Event.REMOVED_FROM_STAGE,this.removed,false,0,true);
      }
      
      private function added(param1:*) : void
      {
         this.gotoAndStop(1);
         this.btnback.addEventListener(MouseEvent.CLICK,this.backClick);
         this.actionHelp.addEventListener(MouseEvent.CLICK,this.actionHelpClick);
         this.achivePet.addEventListener(MouseEvent.CLICK,this.achivePetClick);
      }
      
      private function removed(param1:*) : void
      {
         this.btnback.removeEventListener(MouseEvent.CLICK,this.backClick);
         this.actionHelp.removeEventListener(MouseEvent.CLICK,this.actionHelpClick);
         this.achivePet.removeEventListener(MouseEvent.CLICK,this.achivePetClick);
      }
      
      private function backClick(param1:*) : void
      {
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
      }
      
      private function actionHelpClick(param1:MouseEvent) : void
      {
         this.gotoAndStop(1);
      }
      
      private function achivePetClick(param1:MouseEvent) : void
      {
         this.gotoAndStop(2);
      }
   }
}

