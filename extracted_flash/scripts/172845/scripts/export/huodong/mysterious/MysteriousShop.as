package export.huodong.mysterious
{
   import config.*;
   import event.CommonEvent;
   import flash.display.SimpleButton;
   import flash.display.Sprite;
   import flash.events.*;
   import flash.text.TextField;
   
   public class MysteriousShop extends Sprite
   {
      
      public var x_btn:SimpleButton;
      
      public var open_btn:SimpleButton;
      
      public var addtime_btn:SimpleButton;
      
      public var sp1:SingleShop;
      
      public var sp2:SingleShop;
      
      public var sp3:SingleShop;
      
      public var sp4:SingleShop;
      
      public var sp5:SingleShop;
      
      public var txttimes:TextField;
      
      public var txtlh:TextField;
      
      private var gc:Config;
      
      private var biggest:int;
      
      private var hasbuy:Boolean = false;
      
      private var openall:Boolean = false;
      
      public var lastBuy:int;
      
      public function MysteriousShop()
      {
         super();
         this.gc = Config.getInstance();
         this.addEventListener(Event.ADDED_TO_STAGE,this.added,false,0,true);
         this.addEventListener(Event.REMOVED_FROM_STAGE,this.removed,false,0,true);
      }
      
      private function added(param1:Event) : void
      {
         this.x_btn.addEventListener(MouseEvent.CLICK,this.xClick);
         this.open_btn.addEventListener(MouseEvent.CLICK,this.openAllClick);
         this.addtime_btn.addEventListener(MouseEvent.CLICK,this.addTimesClick);
         this.gc.eventManger.addEventListener("MysteriousShopBuySuccess",this.buyOver);
         this.setBiggest(1);
         this.txttimes.text = 20 + "";
         this.setText();
      }
      
      private function removed(param1:Event) : void
      {
         this.x_btn.removeEventListener(MouseEvent.CLICK,this.xClick);
         this.open_btn.removeEventListener(MouseEvent.CLICK,this.openAllClick);
         this.addtime_btn.removeEventListener(MouseEvent.CLICK,this.addTimesClick);
         this.gc.eventManger.removeEventListener("MysteriousShopBuySuccess",this.buyOver);
         this.openall == "false";
      }
      
      private function setText() : void
      {
         var _loc1_:* = undefined;
         if(Boolean(this.gc.player1) || Boolean(this.gc.player2))
         {
            this.txtlh.text = this.getTotalCoin() + "";
         }
         for(_loc1_ in [0,0,0,0,0])
         {
            this["sp" + ++_loc1_].setTheShopNum(_loc1_);
         }
      }
      
      private function buyOver(param1:CommonEvent) : void
      {
         var _loc2_:* = undefined;
         var _loc3_:* = undefined;
         var _loc4_:uint = 0;
         this.hasbuy = true;
         _loc4_ = 1;
         _loc3_ = this.lastBuy;
         if(this.openall)
         {
            --this.openall;
            for(_loc2_ in [0,0,0,0,0])
            {
               this["sp" + ++_loc2_].addMask();
            }
            this.lastBuy = 1;
            _loc3_ = 1;
         }
         if(_loc3_ == 1)
         {
            if(this.getBiggest() == 1)
            {
               if(Math.random() > 0.5)
               {
                  this.sp2.removedMask();
                  this.setBiggest(2);
               }
            }
         }
         else if(_loc3_ == 2)
         {
            if(Math.random() > 0.5)
            {
               this.sp3.removedMask();
               this.setBiggest(3);
            }
            else
            {
               this.setBiggest(1);
            }
            this.sp2.addMask();
         }
         else if(_loc3_ == 3)
         {
            if(Math.random() > 0.5)
            {
               this.sp4.removedMask();
               this.setBiggest(4);
            }
            else
            {
               this.setBiggest(1);
            }
            this.sp3.addMask();
         }
         else if(_loc3_ == 4)
         {
            if(Math.random() > 0.5)
            {
               this.sp5.removedMask();
               this.setBiggest(5);
            }
            else
            {
               this.setBiggest(1);
            }
            this.sp4.addMask();
         }
         else if(_loc3_ == 5)
         {
            this.sp5.addMask();
            this.sp4.addMask();
            this.sp3.addMask();
            this.sp2.addMask();
            this.setBiggest(1);
         }
         this.setText();
      }
      
      private function xClick(param1:MouseEvent) : void
      {
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
      }
      
      private function openAllClick(param1:MouseEvent) : void
      {
         var _loc2_:* = undefined;
         if(Math.random() <= 0.69)
         {
            this.gc.alert("这里什么都没有!");
         }
         else
         {
            for(_loc2_ in [0,0,0,0,0])
            {
               this["sp" + ++_loc2_].removedMask();
            }
            this.openall = true;
            this.gc.player1.removeEquipFormBack("xhb",2,15);
            this.setText();
            this.gc.alert("这都给你发现了？！");
            if(this.gc.saveId >= 6)
            {
               this.gc.memory.saveGame(this.gc.saveId);
            }
         }
      }
      
      private function addTimesClick(param1:MouseEvent) : void
      {
         if(this.txttimes.text == 0)
         {
            this.gc.alert("命运如此，从头再来");
         }
         else
         {
            this.gc.alert("不用增加次数哦");
         }
      }
      
      public function setBiggest(param1:int) : void
      {
         this.biggest = param1;
      }
      
      public function getBiggest() : int
      {
         return this.biggest;
      }
      
      public function getTotalCoin(param1:int = 3) : int
      {
         var _loc2_:int = int(this.gc.playNum);
         if(1 == param1)
         {
            return this.gc.player1.getSomeOneEquipNumberByName("xhb");
         }
         if(2 == param1)
         {
            return this.gc.player2.getSomeOneEquipNumberByName("xhb");
         }
         if(--_loc2_)
         {
            return this.gc.player1.getSomeOneEquipNumberByName("xhb") + this.gc.player2.getSomeOneEquipNumberByName("xhb");
         }
         return this.gc.player1.getSomeOneEquipNumberByName("xhb");
      }
   }
}

