package export
{
   import flash.display.SimpleButton;
   import flash.display.Sprite;
   import flash.events.*;
   
   public class AboutUs extends Sprite
   {
      
      public var btnback:SimpleButton;
      
      public function AboutUs()
      {
         super();
         this.addEventListener(Event.ADDED_TO_STAGE,this.added,false,0,true);
         this.addEventListener(Event.REMOVED_FROM_STAGE,this.removed,false,0,true);
      }
      
      private function added(param1:*) : void
      {
         this.btnback.addEventListener(MouseEvent.CLICK,this.back);
      }
      
      private function removed(param1:*) : void
      {
         this.btnback.removeEventListener(MouseEvent.CLICK,this.back);
      }
      
      private function back(param1:*) : void
      {
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
      }
   }
}

