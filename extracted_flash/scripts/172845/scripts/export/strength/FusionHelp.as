package export.strength
{
   import flash.display.SimpleButton;
   import flash.display.Sprite;
   import flash.events.*;
   
   public class FusionHelp extends Sprite
   {
      
      public var btn_x:SimpleButton;
      
      public function FusionHelp()
      {
         super();
         this.addEventListener(Event.ADDED_TO_STAGE,this.added,false,0,true);
         this.addEventListener(Event.REMOVED_FROM_STAGE,this.removed,false,0,true);
      }
      
      private function added(param1:*) : void
      {
         this.btn_x.addEventListener(MouseEvent.CLICK,this.close);
      }
      
      private function removed(param1:*) : void
      {
         this.btn_x.removeEventListener(MouseEvent.CLICK,this.close);
      }
      
      private function close(param1:*) : void
      {
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
      }
   }
}

