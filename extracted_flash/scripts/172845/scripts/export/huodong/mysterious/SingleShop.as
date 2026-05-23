package export.huodong.mysterious
{
   import config.*;
   import event.*;
   import export.pack.*;
   import flash.display.*;
   import flash.events.*;
   import flash.text.TextField;
   import my.MyEquipObj;
   
   public class SingleShop extends Sprite
   {
      
      public var buy_btn:SimpleButton;
      
      public var txt_price:TextField;
      
      public var txt_name:TextField;
      
      private var packThings:PackThings;
      
      private var gc:Config;
      
      private var maskmc:Sprite;
      
      private var mynum:uint;
      
      private var thingsnum:int;
      
      private var price:int;
      
      public function SingleShop()
      {
         super();
         this.gc = Config.getInstance();
         this.addEventListener(Event.ADDED_TO_STAGE,this.added,false,0,true);
         this.addEventListener(Event.REMOVED_FROM_STAGE,this.removed,false,0,true);
         this.maskmc = AUtils.getNewObj("singleShopMask") as Sprite;
         this.maskmc.name = "maskmc";
         this.addChild(this.maskmc);
      }
      
      private function added(param1:Event) : void
      {
         this.buy_btn.addEventListener(MouseEvent.CLICK,this.buyClick);
      }
      
      private function removed(param1:Event) : void
      {
         this.buy_btn.removeEventListener(MouseEvent.CLICK,this.buyClick);
      }
      
      private function buyClick(param1:MouseEvent) : void
      {
         var _loc2_:MyEquipObj = null;
         if(this.parent.txttimes.text > 0)
         {
            if(parent.getTotalCoin() >= this.getPrice())
            {
               this.gc.player1.removeEquipFormBack("xhb",2,this.getPrice());
            }
            else
            {
               if(this.gc.player2.roleid <= 0)
               {
                  this.gc.alert("仙魂币不够");
                  return;
               }
               if(parent.getTotalCoin() < this.getPrice())
               {
                  this.gc.alert("仙魂币不够");
                  return;
               }
               this.gc.player2.removeEquipFormBack("xhb",2,this.getPrice() - Number(parent.getTotalCoin(1)));
               this.gc.player1.removeEquipFormBack("xhb",2,parent.getTotalCoin(1));
            }
            --parent.txttimes.text;
            if(this.packThings.getSobj().getMyEquipObj().type == "zbtx")
            {
               _loc2_ = this.packThings.getSobj().getMyEquipObj();
               this.gc.player1.zblist.push(_loc2_);
            }
            else
            {
               this.gc.putQhsInBackPack(this.gc.player1,this.packThings.getSobj().getMyEquipObj().getFillName(),this.getThingsNum());
            }
            parent.lastBuy = this.getMynum();
            this.gc.eventManger.dispatchEvent(new CommonEvent("MysteriousShopBuySuccess"));
            this.gc.alert("购买成功");
         }
         else
         {
            this.gc.alert("次数不够");
         }
      }
      
      public function setTheShopNum(param1:uint) : void
      {
         if(this.getChildByName("packThings"))
         {
            this.removeChild(this.getChildByName("packThings"));
            this.packThings = null;
         }
         if(param1 == 1)
         {
            this.removedMask();
         }
         this.setMynum(param1);
         var _loc2_:MyEquipObj = this.findThingBySign(param1);
         if(_loc2_)
         {
            if(this.getThingsNum() > 1)
            {
               this.txt_name.text = _loc2_.ename + "x" + this.getThingsNum();
            }
            else
            {
               this.txt_name.text = _loc2_.ename;
            }
            this.txt_price.text = this.getPrice() + "仙魂币";
            if(this.packThings == null)
            {
               this.packThings = new PackThings();
               this.packThings.name = "packThings";
               this.packThings.x = 23;
               this.packThings.y = 18;
               this.addChild(this.packThings);
               if(this.getChildByName("maskmc") != null)
               {
                  if(this.getChildIndex(this.packThings) > this.getChildIndex(this.maskmc))
                  {
                     this.swapChildren(this.packThings,this.maskmc);
                  }
               }
            }
            this.packThings.setObj(_loc2_,this.gc.player1.getControlPlayer(),2);
         }
      }
      
      private function findThingBySign(param1:uint) : MyEquipObj
      {
         var _loc2_:Array = null;
         var _loc3_:int = 0;
         if(param1 == 1)
         {
            _loc2_ = ["wpsc","wpxt","wptm"];
            _loc3_ = Math.floor(Math.random() * 3);
            this.setPrice(200);
            this.setThingsNum(15);
            return this.gc.allEquip.findByName(_loc2_[_loc3_]);
         }
         if(param1 == 2)
         {
            _loc2_ = ["wpsc","wpxt","wptm"];
            _loc3_ = Math.floor(Math.random() * 3);
            this.setPrice(500);
            this.setThingsNum(20);
            return this.gc.allEquip.findByName(_loc2_[_loc3_]);
         }
         if(param1 == 3)
         {
            _loc2_ = ["wpsc","wpxt","wptm"];
            _loc3_ = Math.floor(Math.random() * 3);
            this.setPrice(1000);
            this.setThingsNum(35);
            if(Math.random() <= 0.001)
            {
               this.setThingsNum(500);
            }
            return this.gc.allEquip.findByName(_loc2_[_loc3_]);
         }
         if(param1 == 4)
         {
            _loc2_ = ["cwjnxld","cwzzxld","wwdgl","lssp_1","lssp_2","wpqhs1","mfs3","gjs3","wpqhs2","yll","ttlp","rls","tss","yhs"];
            _loc3_ = Math.floor(Math.random() * _loc2_.length);
            this.setPrice(3000);
            this.setThingsNum(1);
            return this.gc.allEquip.findByName(_loc2_[_loc3_]);
         }
         if(param1 == 5)
         {
            trace("等级:" + this.gc.getAverageLevel());
            if(Math.random() <= 0.81)
            {
               _loc2_ = ["wpqhs5","kly3","kly4","jljzzs","jlczzs","jlgzzs","plzzzs","plpzzs","qlgzzs","qljzzs","ylkzzs","ylfzzs"];
               _loc3_ = Math.floor(Math.random() * _loc2_.length);
               this.setPrice(8000);
            }
            else if(this.gc.getAverageLevel() > 75)
            {
               if(Math.random() < 0.2)
               {
                  _loc2_ = ["wpxt","wptm","wpsc","wpxty","wpzty","_ssggjtg"];
               }
               else
               {
                  _loc2_ = ["wpxty","wpzty","gjrls","gjyhs","_ssggjtg","gjtss"];
               }
               _loc3_ = Math.floor(Math.random() * _loc2_.length);
               this.setPrice(11000);
            }
            else
            {
               _loc2_ = ["wpxt","wptm","wpsc","gjrls","gjyhs","gjtss"];
               _loc3_ = Math.floor(Math.random() * _loc2_.length);
               this.setPrice(10000);
            }
            if(_loc2_[_loc3_] == "wpxt" || _loc2_[_loc3_] == "wptm" || _loc2_[_loc3_] == "wpsc")
            {
               this.setThingsNum(450);
            }
            else
            {
               this.setThingsNum(1);
            }
            return this.gc.allEquip.findByName(_loc2_[_loc3_]);
         }
         return null;
      }
      
      public function removedMask() : void
      {
         if(this.getChildByName("maskmc") != null)
         {
            this.removeChild(this.maskmc);
         }
      }
      
      public function addMask() : void
      {
         if(this.getChildByName("maskmc") == null)
         {
            this.addChild(this.maskmc);
         }
      }
      
      public function setThingsNum(param1:int) : void
      {
         this.thingsnum = param1;
      }
      
      public function getThingsNum() : int
      {
         return this.thingsnum;
      }
      
      public function setPrice(param1:int) : void
      {
         this.price = param1 / 100;
      }
      
      public function getPrice() : int
      {
         return this.price;
      }
      
      public function setMynum(param1:int) : void
      {
         this.mynum = param1;
      }
      
      public function getMynum() : int
      {
         return this.mynum;
      }
   }
}

