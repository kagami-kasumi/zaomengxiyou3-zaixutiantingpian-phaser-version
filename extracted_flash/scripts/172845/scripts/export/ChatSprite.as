package export
{
   import config.*;
   import event.CommonEvent;
   import fl.controls.TextArea;
   import flash.display.Sprite;
   import flash.events.*;
   import flash.text.TextField;
   
   public class ChatSprite extends Sprite
   {
      
      public var chatTextArea:TextArea;
      
      public var chatInput:TextField;
      
      private var chatArray:Array;
      
      private const MAX_CHAT_LEN:uint = 20;
      
      private var gc:Config;
      
      public function ChatSprite()
      {
         this.chatArray = [];
         super();
         this.chatInput.addEventListener(KeyboardEvent.KEY_DOWN,this.__keyDown);
         this.chatInput.text = "";
         this.chatTextArea.editable = false;
         this.gc = Config.getInstance();
         this.gc.eventManger.addEventListener("NormalChat",this.__updateChat);
      }
      
      private function __updateChat(param1:CommonEvent) : void
      {
         var _loc2_:* = param1.data;
         this.updateData(_loc2_[0],_loc2_[1]);
      }
      
      public function updateData(param1:String, param2:String) : void
      {
         var _loc3_:* = "<font size=\'16\' color=\'#ffffff\'>[" + param1 + "] :" + param2 + "</font>";
         this.chatArray.push(_loc3_);
         if(this.chatArray.length > this.MAX_CHAT_LEN)
         {
            this.chatArray.shift();
         }
         this.chatTextArea.htmlText = this.chatArray.join("<br>");
         this.chatTextArea.verticalScrollPosition = this.chatTextArea.maxVerticalScrollPosition;
      }
      
      private function __keyDown(param1:KeyboardEvent) : void
      {
         if(this.chatInput.text != "")
         {
            if(param1.keyCode == 13)
            {
               this.gc.sendChat(this.chatInput.text);
               this.chatInput.text = "";
            }
         }
      }
      
      public function destroy() : void
      {
         this.chatInput.removeEventListener(KeyboardEvent.KEY_DOWN,this.__keyDown);
      }
   }
}

