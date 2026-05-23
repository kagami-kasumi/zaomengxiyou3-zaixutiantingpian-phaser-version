package export.microshop
{
   import config.*;
   import export.pack.*;
   import flash.display.SimpleButton;
   import flash.display.Sprite;
   import flash.events.*;
   import flash.text.TextField;
   import my.MyEquipObj;
   import user.User;
   
   public class ShopThing extends Sprite
   {
      
      private var gc:Config;
      
      private var pay:PayMoneyVar;
      
      private var packThing:PackThings;
      
      private var thisEquipment:MyEquipObj;
      
      private var player:User;
      
      private var amoney:uint;
      
      private var buyObj:Object;
      
      public var btn_buy:SimpleButton;
      
      public var txt_name:TextField;
      
      public var txt_price:TextField;
      
      public var txt_num:TextField;
      
      public var btn_up:SimpleButton;
      
      public var btn_down:SimpleButton;
      
      public var bgmc:Sprite;
      
      private var buyclick:Boolean;
      
      public function ShopThing()
      {
         this.buyObj = {
            "thingnum":0,
            "allmoney":0
         };
         super();
         this.gc = Config.getInstance();
         this.pay = PayMoneyVar.getInstance();
         this.txt_name.selectable = false;
         this.txt_price.selectable = false;
         this.addEventListener(Event.ADDED_TO_STAGE,this.added,false,0,true);
         this.addEventListener(Event.REMOVED_FROM_STAGE,this.removed,false,0,true);
      }
      
      private function added(param1:Event) : void
      {
         this.btn_buy.addEventListener(MouseEvent.CLICK,this.buyClick);
         this.btn_up.addEventListener(MouseEvent.CLICK,this.upClick);
         this.btn_down.addEventListener(MouseEvent.CLICK,this.downClick);
         this.gc.eventManger.addEventListener("ChangePlayer",this.changePlayer);
         this.gc.eventManger.addEventListener("BUYCHANGLE",this.buychange);
         this.txt_num.addEventListener(Event.CHANGE,this.changenum);
         this.txt_num.restrict = "0-9";
      }
      
      private function removed(param1:Event) : void
      {
         this.btn_buy.removeEventListener(MouseEvent.CLICK,this.buyClick);
         this.btn_up.removeEventListener(MouseEvent.CLICK,this.upClick);
         this.btn_down.removeEventListener(MouseEvent.CLICK,this.downClick);
         this.gc.eventManger.removeEventListener("ChangePlayer",this.changePlayer);
         this.gc.eventManger.addEventListener("BUYCHANGLE",this.buychange);
         this.txt_num.removeEventListener(Event.CHANGE,this.changenum);
      }
      
      private function changenum(param1:Event) : void
      {
         this.buyObj.thingnum = this.txt_num.text;
      }
      
      public function setEquipment(param1:MyEquipObj) : void
      {
         var _loc2_:* = undefined;
         this.setPlayer();
         this.setMoney();
         if(this.packThing == null)
         {
            this.packThing = new PackThings();
            this.packThing.x = 15;
            this.packThing.y = 20;
            this.addChild(this.packThing);
         }
         this.thisEquipment = param1;
         this.buyObj.thingnum = 1;
         var _loc3_:int = int(this.gc.allEquip.findSellPrice(this.thisEquipment.getFillName()));
         if(this.thisEquipment.getFillName() != "zylhys")
         {
            if(this.gc.curBigStage > 2)
            {
               _loc3_ = int(_loc3_ * 0.8);
            }
         }
         this.buyObj.allmoney -= _loc3_;
         this.visibleTrue();
         this.packThing.setObj(this.thisEquipment,this.getPlayerId());
         if(this.packThing.getMyEquipType() == "zbsz")
         {
            _loc2_ = AUtils.getImageObj("thirthday");
            _loc2_.name = "thirthdaypic";
            _loc2_.x = 62;
            _loc2_.y = 2;
            this.addChild(_loc2_);
         }
      }
      
      private function visibleFalse() : void
      {
         this.txt_name.text = "";
         this.txt_price.text = "";
         this.btn_buy.visible = false;
         this.bgmc.visible = false;
         this.btn_up.visible = false;
         this.btn_down.visible = false;
         this.txt_num.text = "0";
         this.txt_num.visible = false;
      }
      
      private function visibleTrue() : void
      {
         var _loc1_:int = int(this.gc.allEquip.findSellPrice(this.thisEquipment.getFillName()));
         this.txt_name.text = this.thisEquipment.ename;
         this.txt_num.text = this.buyObj.thingnum + "";
         if(this.thisEquipment.getFillName() != "zylhys")
         {
            if(this.gc.curBigStage > 2)
            {
               _loc1_ = int(_loc1_ * 0.8);
            }
         }
         this.txt_price.text = _loc1_ + "灵魂";
      }
      
      public function clearEquipment() : void
      {
         if(Boolean(this.packThing) && contains(this.packThing))
         {
            if(this.getChildByName("thirthdaypic"))
            {
               this.removeChild(this.getChildByName("thirthdaypic"));
            }
            this.buyclick = false;
            this.packThing.removeSobjAndNotPutInBack();
            this.thisEquipment = null;
            this.removeChild(this.packThing);
            this.packThing = null;
            if(this.buyObj.thingnum != 1)
            {
               this.buyObj.thingnum = 1;
            }
         }
      }
      
      private function buyClick(param1:MouseEvent) : void
      {
         var _loc2_:* = null;
         if(this.buyObj.thingnum > 0)
         {
            this.buyclick = true;
            _loc2_ = new SumInterface(this.amoney,int(this.gc.allEquip.findSellPrice(this.thisEquipment.getFillName())),this.buyObj.thingnum,this.thisEquipment.ename,this.thisEquipment.color,this.player);
            this.parent.addChild(_loc2_);
         }
      }
      
      private function upClick(param1:MouseEvent) : void
      {
         if(this.buyObj.thingnum > 99)
         {
            return;
         }
         this.buyObj = AUtils.clone(this.buyObj);
         this.buyObj.allmoney -= int(this.gc.allEquip.findSellPrice(this.thisEquipment.getFillName()));
         ++this.buyObj.thingnum;
         this.txt_num.text = this.buyObj.thingnum + "";
      }
      
      private function downClick(param1:MouseEvent) : void
      {
         if(this.buyObj.thingnum > 1)
         {
            this.buyObj = AUtils.clone(this.buyObj);
            this.buyObj.allmoney += int(this.gc.allEquip.findSellPrice(this.thisEquipment.getFillName()));
            --this.buyObj.thingnum;
         }
         this.txt_num.text = this.buyObj.thingnum + "";
      }
      
      private function setPlayer() : void
      {
         if(this.parent)
         {
            this.player = Micropayment(this.parent).getUser();
         }
      }
      
      private function setMoney() : void
      {
         if(this.parent)
         {
            this.buyObj.allmoney = Micropayment(this.parent).getAllMoney();
            this.amoney = uint(uint(uint(uint(uint(uint(uint(uint(uint(this.buyObj.allmoney)))))))));
         }
      }
      
      private function changePlayer(param1:*) : void
      {
         this.setPlayer();
      }
      
      private function buychange(param1:*) : void
      {
         this.buyclick = false;
      }
      
      private function getPlayerId() : uint
      {
         return this.player.getControlPlayer();
      }
      
      public function buySuccess() : void
      {
         this.buyclick = false;
         this.buyObj.thingnum = 1;
         this.txt_num.text = this.buyObj.thingnum + "";
      }
      
      public function getNumAndEquip() : Object
      {
         var _loc1_:* = {
            "thingnum":0,
            "equip":null
         };
         if(this.buyclick)
         {
            _loc1_.thingnum = this.buyObj.thingnum;
            _loc1_.equip = this.thisEquipment;
         }
         return _loc1_;
      }
      
      public function getMoneySuccess() : void
      {
         this.setMoney();
         this.txt_num.text = this.buyObj.thingnum + "";
      }
   }
}

