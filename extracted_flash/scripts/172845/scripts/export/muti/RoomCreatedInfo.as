package export.muti
{
   import config.*;
   import fl.controls.Button;
   import flash.display.Sprite;
   import flash.events.*;
   import flash.text.TextField;
   
   [Embed(source="/_assets/assets.swf", symbol="symbol280")]
   public class RoomCreatedInfo extends Sprite
   {
      
      public var roomName:TextField;
      
      public var confirmBtn:Button;
      
      private var gc:Config;
      
      public function RoomCreatedInfo()
      {
         super();
         this.gc = Config.getInstance();
         this.roomName.text = "";
         this.confirmBtn.addEventListener(MouseEvent.CLICK,this.__confirm);
      }
      
      private function __confirm(param1:MouseEvent) : void
      {
         if(this.roomName.text != "")
         {
            this.gc.roomInfo = this.roomName.text;
            this.destroy();
         }
      }
      
      public function destroy() : void
      {
         this.confirmBtn.removeEventListener(MouseEvent.CLICK,this.__confirm);
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
      }
   }
}

