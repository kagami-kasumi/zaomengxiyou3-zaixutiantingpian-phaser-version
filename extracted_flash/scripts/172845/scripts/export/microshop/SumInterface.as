package export.microshop
{
   import config.*;
   import event.*;
   import flash.display.SimpleButton;
   import flash.display.Sprite;
   import flash.events.*;
   import flash.text.TextField;
   import user.User;
   
   public class SumInterface extends Sprite
   {
      
      private var player:User;
      
      private var gc:Config;
      
      private var pay:PayMoneyVar;
      
      private var tname:String;
      
      private var price1:int;
      
      private var price2:int;
      
      private var price3:Number;
      
      private var tnum1:int;
      
      private var tnum2:int;
      
      private var tnum3:Number;
      
      private var color:String;
      
      private var allmoney:int;
      
      public var btn_change:SimpleButton;
      
      public var btn_ok:SimpleButton;
      
      public var txtfield:TextField;
      
      public function SumInterface(param1:int, param2:int, param3:int, param4:String, param5:String, param6:User)
      {
         super();
         this.gc = Config.getInstance();
         this.pay = PayMoneyVar.getInstance();
         this.allmoney = param1;
         this.setTnum(param3);
         this.tname = param4;
         this.setPrice(param2);
         this.color = param5;
         this.player = param6;
         this.addEventListener(Event.ADDED_TO_STAGE,this.added,false,0,true);
         this.addEventListener(Event.REMOVED_FROM_STAGE,this.removed,false,0,true);
      }
      
      private function added(param1:Event) : void
      {
         this.btn_change.addEventListener(MouseEvent.CLICK,this.changeClick);
         this.btn_ok.addEventListener(MouseEvent.CLICK,this.okClick);
         this.setText();
      }
      
      private function removed(param1:Event) : void
      {
         this.btn_change.removeEventListener(MouseEvent.CLICK,this.changeClick);
         this.btn_ok.removeEventListener(MouseEvent.CLICK,this.okClick);
      }
      
      private function setText() : void
      {
         this.txtfield.text = "你确定要购买" + this.getTnum() + "个" + this.tname + "总共花费" + Number(this.getPrice()) * Number(this.getTnum()) + "灵魂";
      }
      
      private function changeClick(param1:MouseEvent) : void
      {
         this.gc.eventManger.dispatchEvent(new Event("BUYCHANGLE"));
         this.destory();
      }
      
      private function okClick(param1:MouseEvent) : void
      {
         var _loc2_:int = int(this.player.getLhValue());
         this.gc.needlh = Number(this.getPrice()) * Number(this.getTnum());
         if(_loc2_ >= this.gc.needlh)
         {
            this.gc.eventManger.dispatchEvent(new CommonEvent("BuySuccess",[0]));
            this.gc.ts.setTxt("购买成功！");
            this.stage.addChild(this.gc.ts);
         }
         else
         {
            this.gc.ts.setTxt("灵魂不足！");
            this.stage.addChild(this.gc.ts);
            this.gc.eventManger.dispatchEvent(new Event("BUYCHANGLE"));
         }
         this.destory();
      }
      
      private function destory() : void
      {
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
      }
      
      private function setPrice(param1:int) : void
      {
         var _loc2_:int = Math.round(Math.random() * 500);
         this.price1 = param1 - _loc2_;
         this.price2 = _loc2_;
      }
      
      private function getPrice() : int
      {
         var _loc1_:int = this.price1 + this.price2;
         if(this.tname != "灵魂药水")
         {
            if(this.gc.curBigStage > 2)
            {
               _loc1_ = int(_loc1_ * 0.8);
            }
         }
         return _loc1_;
      }
      
      private function setTnum(param1:int) : void
      {
         var _loc2_:int = Math.round(Math.random() * 500);
         this.tnum1 = param1 - _loc2_;
         this.tnum2 = _loc2_;
      }
      
      private function getTnum() : int
      {
         return this.tnum1 + this.tnum2;
      }
   }
}

