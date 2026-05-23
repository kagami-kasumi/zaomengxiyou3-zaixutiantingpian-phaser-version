package export.huodong.kabu
{
   import config.*;
   import flash.display.*;
   import flash.events.*;
   import flash.net.*;
   import flash.system.*;
   import flash.text.TextField;
   
   public class KaBuActivites extends Sprite
   {
      
      public var copybtn:SimpleButton;
      
      public var intoKaBubtn:SimpleButton;
      
      public var idtxt:TextField;
      
      public var backbtn:SimpleButton;
      
      private var gc:Config;
      
      private var urlLoader:URLLoader;
      
      public function KaBuActivites()
      {
         super();
         this.gc = Config.getInstance();
         this.addEventListener(Event.ADDED_TO_STAGE,this.added,false,0,true);
         this.addEventListener(Event.REMOVED_FROM_STAGE,this.removed,false,0,true);
      }
      
      private function added(param1:Event) : void
      {
         this.copybtn.addEventListener(MouseEvent.CLICK,this.copyClick);
         this.intoKaBubtn.addEventListener(MouseEvent.CLICK,this.kabuClick);
         this.backbtn.addEventListener(MouseEvent.CLICK,this.back);
         this.checkEligible();
      }
      
      private function removed(param1:Event) : void
      {
         this.copybtn.removeEventListener(MouseEvent.CLICK,this.copyClick);
         this.intoKaBubtn.removeEventListener(MouseEvent.CLICK,this.kabuClick);
         this.backbtn.removeEventListener(MouseEvent.CLICK,this.back);
      }
      
      private function checkEligible() : void
      {
         if(this.gc.cardId != "")
         {
            this.gc.ts.setTxt("改账号已经获取过卡号");
            this.gc.stage.addChild(this.gc.ts);
            return;
         }
         if(this.gc.player1.roleid > 0)
         {
            if(this.gc.player1.findBiggestPetLevel() >= 36)
            {
               this.doRequest();
               return;
            }
         }
         if(this.gc.player2.roleid > 0)
         {
            if(this.gc.player2.findBiggestPetLevel() >= 36)
            {
               this.doRequest();
               return;
            }
         }
         this.copybtn.visible = false;
         this.idtxt.text = "宠物等级要求达到36级才能完成该活动";
      }
      
      private function doRequest() : void
      {
         this.urlLoader = new URLLoader();
         this.urlLoader.dataFormat = URLLoaderDataFormat.TEXT;
         this.urlLoader.addEventListener(Event.COMPLETE,this.completeHandler);
         var _loc1_:URLVariables = new URLVariables();
         _loc1_.uid = this.gc.logInfo.uid;
         var _loc2_:URLRequest = new URLRequest("http://php.wanwan4399.com/api/card_for_kabu.php");
         _loc2_.method = URLRequestMethod.POST;
         _loc2_.data = _loc1_;
         this.urlLoader.load(_loc2_);
      }
      
      private function completeHandler(param1:Event) : void
      {
         this.urlLoader.removeEventListener(Event.COMPLETE,this.completeHandler);
         var _loc2_:* = this.stage.getChildByName("execuitionActiongetKaBuActId") as Sprite;
         if(_loc2_)
         {
            this.gc.stage.removeChild(_loc2_);
            _loc2_ = null;
         }
         var _loc3_:* = com.adobe.serialization.json.JSON.decode(this.urlLoader.data);
         this.copybtn.visible = true;
         this.idtxt.text = String(_loc3_["CardId"]);
      }
      
      private function copyClick(param1:MouseEvent) : void
      {
         System.setClipboard(this.idtxt.text);
         this.gc.ts.setTxt("复制成功");
         this.gc.stage.addChild(this.gc.ts);
      }
      
      private function kabuClick(param1:MouseEvent) : void
      {
         navigateToURL(new URLRequest("http://www.4399.com/flash/48399.htm"),"_blank");
      }
      
      private function back(param1:MouseEvent) : void
      {
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
      }
   }
}

