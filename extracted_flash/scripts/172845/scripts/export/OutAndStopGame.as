package export
{
   import config.*;
   import flash.display.Sprite;
   import flash.events.Event;
   
   public class OutAndStopGame extends Sprite
   {
      
      private var gc:Config;
      
      public function OutAndStopGame()
      {
         super();
         this.gc = Config.getInstance();
         this.addEventListener("addedToStage",this.added,false,0,true);
         this.addEventListener("removedFromStage",this.removed,false,0,true);
      }
      
      private function added(param1:Event) : void
      {
         stage.frameRate = 0;
         this.buttonMode = true;
      }
      
      private function removed(param1:Event) : void
      {
      }
      
      public function hide() : void
      {
         stage.frameRate = this.gc.frameClips;
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
      }
   }
}

