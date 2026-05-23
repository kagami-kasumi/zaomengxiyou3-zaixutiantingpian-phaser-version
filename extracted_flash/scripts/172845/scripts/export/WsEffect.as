package export
{
   import flash.display.MovieClip;
   import flash.display.Sprite;
   import flash.events.*;
   
   public class WsEffect extends Sprite
   {
      
      public var Role1Mc:MovieClip;
      
      public var Role2Mc:MovieClip;
      
      public var Role3Mc:MovieClip;
      
      public var bg:MovieClip;
      
      public function WsEffect()
      {
         super();
         this.bg.addEventListener(Event.ENTER_FRAME,this.__enterFrame);
      }
      
      internal function __enterFrame(param1:Event) : void
      {
         if(this.bg.currentFrame == this.bg.totalFrames)
         {
            this.bg.removeEventListener(Event.ENTER_FRAME,this.__enterFrame);
            this.bg.stop();
            if(this.parent)
            {
               this.parent.removeChild(this);
            }
         }
      }
   }
}

