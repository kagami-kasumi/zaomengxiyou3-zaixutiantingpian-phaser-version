package export.huodong.kabu
{
   import config.*;
   import flash.display.*;
   import flash.events.*;
   import flash.net.*;
   import flash.text.TextField;
   import my.MyEquipObj;
   import petInfo.*;
   
   public class ReceiveKaBuPacks extends Sprite
   {
      
      public var recbtn:SimpleButton;
      
      public var inptxt:TextField;
      
      public var xbtn:SimpleButton;
      
      private var gc:Config;
      
      private var urlLoader:URLLoader;
      
      public function ReceiveKaBuPacks()
      {
         super();
         this.gc = Config.getInstance();
         this.addEventListener(Event.ADDED_TO_STAGE,this.added,false,0,true);
         this.addEventListener(Event.REMOVED_FROM_STAGE,this.removed,false,0,true);
      }
      
      private function added(param1:Event) : void
      {
         this.recbtn.addEventListener(MouseEvent.CLICK,this.recClick);
         this.xbtn.addEventListener(MouseEvent.CLICK,this.back);
      }
      
      private function removed(param1:Event) : void
      {
         this.recbtn.removeEventListener(MouseEvent.CLICK,this.recClick);
         this.xbtn.removeEventListener(MouseEvent.CLICK,this.back);
      }
      
      private function recClick(param1:MouseEvent) : void
      {
         var _loc2_:* = null;
         var _loc3_:* = 0;
         var _loc4_:* = null;
         var _loc5_:* = null;
         _loc2_ = this.inptxt.text;
         if(_loc2_ != undefined && _loc2_ != "")
         {
            this.urlLoader = new URLLoader();
            this.urlLoader.dataFormat = URLLoaderDataFormat.TEXT;
            this.urlLoader.addEventListener(Event.COMPLETE,this.completeHandler);
            _loc2_ = this.inptxt.text;
            _loc3_ = uint(_loc2_.length);
            while(_loc3_-- > 0)
            {
               _loc2_ = _loc2_.replace(" ","");
            }
            _loc4_ = new URLVariables();
            _loc4_.uid = this.gc.logInfo.uid;
            _loc4_.cardId = _loc2_;
            _loc5_ = new URLRequest("http://php.wanwan4399.com/api/check_card_api.php");
            _loc5_.method = URLRequestMethod.POST;
            _loc5_.data = _loc4_;
            this.urlLoader.load(_loc5_);
         }
      }
      
      private function completeHandler(param1:Event) : void
      {
         this.urlLoader.removeEventListener(Event.COMPLETE,this.completeHandler);
         var _loc2_:* = this.stage.getChildByName("execuitionActionreceiveKaBu") as Sprite;
         if(_loc2_)
         {
            this.gc.stage.removeChild(_loc2_);
            _loc2_ = null;
         }
         var _loc3_:* = com.adobe.serialization.json.JSON.decode(this.urlLoader.data);
         this.checkOk(int(_loc3_["state"]));
      }
      
      private function checkOk(param1:uint) : void
      {
         if(param1 == 0)
         {
            this.putGiftsInPack();
         }
         else if(param1 == 1)
         {
            this.gc.ts.setTxt("该卡号已经领取过奖励");
            this.gc.stage.addChild(this.gc.ts);
         }
         else if(param1 == 2)
         {
            this.gc.ts.setTxt("领取的卡号不存在");
            this.gc.stage.addChild(this.gc.ts);
         }
      }
      
      private function putGiftsInPack() : void
      {
         this.gc.allEquip.reNewAll();
         var _loc1_:PetInfo = new PetInfo();
         _loc1_.setPetNameAndLevel("ufo1",1);
         var _loc2_:MyEquipObj = this.gc.allEquip.findByName("ptnmwsz");
         _loc2_.setFashionTime(this.gc.curdate);
         if(this.gc.player1.roleid > 0)
         {
            this.gc.putQhsInBackPack(this.gc.player1,"wpqhs1",12);
            this.gc.putQhsInBackPack(this.gc.player1,"mpyj");
            this.gc.player1.szlist.push(_loc2_);
            this.gc.player1.petsAry.push(_loc1_);
         }
         if(this.gc.player2.roleid > 0)
         {
            this.gc.putQhsInBackPack(this.gc.player2,"wpqhs1",12);
            this.gc.putQhsInBackPack(this.gc.player2,"mpyj");
            this.gc.player2.szlist.push(_loc2_);
            this.gc.player2.petsAry.push(_loc1_);
         }
         this.gc.ts.setTxt("领取成功");
         this.gc.stage.addChild(this.gc.ts);
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

