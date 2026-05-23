package export.microshop
{
   import config.*;
   import event.*;
   import flash.display.SimpleButton;
   import flash.display.Sprite;
   import flash.events.*;
   import flash.text.TextField;
   import my.*;
   import user.User;
   
   public class Micropayment extends Sprite
   {
      
      private var gc:Config;
      
      private var player:User;
      
      private var sellbsList:Array;
      
      private var sellcwList:Array;
      
      private var sellszList:Array;
      
      private var selldjList:Array;
      
      private var selectTag:uint = 1;
      
      private var pageNum:uint = 1;
      
      private var curPage:uint = 1;
      
      private var allmoney:int = 0;
      
      public var btn_back:SimpleButton;
      
      public var btn_cz:SimpleButton;
      
      public var btn_play1:SimpleButton;
      
      public var btn_play2:SimpleButton;
      
      public var btn_buyall:SimpleButton;
      
      public var btn_buybs:SimpleButton;
      
      public var btn_buysz:SimpleButton;
      
      public var btn_buycw:SimpleButton;
      
      public var btn_buydj:SimpleButton;
      
      private var lastBtn:String = "";
      
      private var btnState:*;
      
      public var btn_upPage:SimpleButton;
      
      public var btn_nextPage:SimpleButton;
      
      public var txt_page:TextField;
      
      public var txt_money:TextField;
      
      public var st0:ShopThing;
      
      public var st1:ShopThing;
      
      public var st2:ShopThing;
      
      public var st3:ShopThing;
      
      public var st4:ShopThing;
      
      public var st5:ShopThing;
      
      public var st6:ShopThing;
      
      public var st7:ShopThing;
      
      public var st8:ShopThing;
      
      private var fashionEquip:MyEquipObj;
      
      private var windEquip:MyEquipObj;
      
      internal var playerbtnState:*;
      
      public function Micropayment()
      {
         this.sellbsList = [];
         this.sellcwList = [];
         this.sellszList = [];
         this.selldjList = [];
         super();
         this.gc = Config.getInstance();
         this.player = this.gc.player1;
         this.addEventListener(Event.ADDED_TO_STAGE,this.added,false,0,true);
         this.addEventListener(Event.REMOVED_FROM_STAGE,this.removed,false,0,true);
      }
      
      public function getUser() : User
      {
         return this.player;
      }
      
      private function added(param1:Event) : void
      {
         this.gc.isingameshop = true;
         this.gc.allEquip.reNewAll();
         this.sellbsList.push(this.gc.allEquip.findByName("wpqhs1"));
         this.sellbsList.push(this.gc.allEquip.findByName("wpqhs2"));
         this.sellbsList.push(this.gc.allEquip.findByName("wpqhs3"));
         this.sellbsList.push(this.gc.allEquip.findByName("wpqhs4"));
         this.sellbsList.push(this.gc.allEquip.findByName("sms2"));
         this.sellbsList.push(this.gc.allEquip.findByName("sms3"));
         this.sellbsList.push(this.gc.allEquip.findByName("mfs2"));
         this.sellbsList.push(this.gc.allEquip.findByName("mfs3"));
         this.sellbsList.push(this.gc.allEquip.findByName("gjs2"));
         this.sellbsList.push(this.gc.allEquip.findByName("gjs3"));
         this.sellbsList.push(this.gc.allEquip.findByName("fys2"));
         this.sellbsList.push(this.gc.allEquip.findByName("fys3"));
         this.sellbsList.push(this.gc.allEquip.findByName("wphlz"));
         this.sellbsList.push(this.gc.allEquip.findByName("wpslz"));
         this.sellbsList.push(this.gc.allEquip.findByName("wptlz"));
         this.sellbsList.push(this.gc.allEquip.findByName("wpllz"));
         this.sellbsList.push(this.gc.allEquip.findByName("wpflz"));
         this.sellbsList.push(this.gc.allEquip.findByName("wpxyf"));
         this.sellbsList.push(this.gc.allEquip.findByName("wpbdf"));
         this.selldjList.push(this.gc.allEquip.findByName("jtl"));
         this.selldjList.push(this.gc.allEquip.findByName("zylhys"));
         this.selldjList.push(this.gc.allEquip.findByName("mpyj"));
         this.selldjList.push(this.gc.allEquip.findByName("css6"));
         this.selldjList.push(this.gc.allEquip.findByName("css12"));
         this.selldjList.push(this.gc.allEquip.findByName("css18"));
         this.selldjList.push(this.gc.allEquip.findByName("css24"));
         this.selldjList.push(this.gc.allEquip.findByName("css_2"));
         this.selldjList.push(this.gc.allEquip.findByName("css_3"));
         this.selldjList.push(this.gc.allEquip.findByName("css_4"));
         this.selldjList.push(this.gc.allEquip.findByName("wwdgl"));
         this.selldjList.push(this.gc.allEquip.findByName("yll"));
         this.selldjList.push(this.gc.allEquip.findByName("wplwl"));
         this.selldjList.push(this.gc.allEquip.findByName("wpbsz"));
         this.selldjList.push(this.gc.allEquip.findByName("ttlpsp1"));
         this.selldjList.push(this.gc.allEquip.findByName("ttlpsp2"));
         this.selldjList.push(this.gc.allEquip.findByName("ttlpsp3"));
         this.sellcwList.push(this.gc.allEquip.findByName("wpcsd"));
         this.sellcwList.push(this.gc.allEquip.findByName("wphhd"));
         this.sellcwList.push(this.gc.allEquip.findByName("cwjnxld"));
         this.sellcwList.push(this.gc.allEquip.findByName("cwzzxld"));
         this.sellcwList.push(this.gc.allEquip.findByName("djyys"));
         this.sellszList.push(this.gc.allEquip.findByName("ptnmwsz"));
         this.sellszList.push(this.gc.allEquip.findByName("ptzlwsz"));
         this.sellszList.push(this.gc.allEquip.findByName("ptsmsrsz"));
         this.sellszList.push(this.gc.allEquip.findByName("ptttzssz"));
         this.sellszList.push(this.gc.allEquip.findByName("lzysz"));
         this.sellszList.push(this.gc.allEquip.findByName("hzysz"));
         this.sellszList.push(this.gc.allEquip.findByName("mrsz"));
         this.sellszList.push(this.gc.allEquip.findByName("bssz"));
         this.gc.eventManger.addEventListener("BuySuccess",this.buySuccess);
         this.gc.eventManger.addEventListener("GetMoneySuccess",this.getMoneySuccess);
         this.btn_back.addEventListener(MouseEvent.CLICK,this.backClick);
         this.btn_cz.addEventListener(MouseEvent.CLICK,this.czClick);
         this.btn_play1.addEventListener(MouseEvent.CLICK,this.play1Click);
         this.btn_play2.addEventListener(MouseEvent.CLICK,this.play2Click);
         this.btn_play1.dispatchEvent(new MouseEvent(MouseEvent.CLICK));
         this.btn_buycw.addEventListener(MouseEvent.CLICK,this.buycwClick);
         this.btn_buyall.addEventListener(MouseEvent.CLICK,this.buyallClick);
         this.btn_buysz.addEventListener(MouseEvent.CLICK,this.buyszClick);
         this.btn_buybs.addEventListener(MouseEvent.CLICK,this.buybsClick);
         this.btn_buydj.addEventListener(MouseEvent.CLICK,this.buydjClick);
         this.btn_upPage.addEventListener(MouseEvent.CLICK,this.upPageClick);
         this.btn_nextPage.addEventListener(MouseEvent.CLICK,this.nextPageClick);
         if(this.gc.playNum == 1)
         {
            this.btn_play2.visible = false;
         }
         else
         {
            this.btn_play2.visible = true;
         }
         this.btn_buyall.dispatchEvent(new MouseEvent(MouseEvent.CLICK));
      }
      
      private function removed(param1:Event) : void
      {
         this.gc.isingameshop = false;
         this.gc.eventManger.removeEventListener("BuySuccess",this.buySuccess);
         this.gc.eventManger.removeEventListener("GetMoneySuccess",this.getMoneySuccess);
         this.btn_back.removeEventListener(MouseEvent.CLICK,this.backClick);
         this.btn_cz.removeEventListener(MouseEvent.CLICK,this.czClick);
         this.btn_play1.removeEventListener(MouseEvent.CLICK,this.play1Click);
         this.btn_play2.removeEventListener(MouseEvent.CLICK,this.play2Click);
         this.btn_buycw.removeEventListener(MouseEvent.CLICK,this.buycwClick);
         this.btn_buyall.removeEventListener(MouseEvent.CLICK,this.buyallClick);
         this.btn_buysz.removeEventListener(MouseEvent.CLICK,this.buyszClick);
         this.btn_buybs.removeEventListener(MouseEvent.CLICK,this.buybsClick);
         this.btn_upPage.removeEventListener(MouseEvent.CLICK,this.upPageClick);
         this.btn_nextPage.removeEventListener(MouseEvent.CLICK,this.nextPageClick);
         this.btnState = null;
         this.player = null;
      }
      
      private function setShopThingEquipment() : void
      {
         var _loc1_:* = [];
         switch(this.selectTag)
         {
            case 1:
               if(this.sellbsList.length > 0)
               {
                  _loc1_ = _loc1_.concat(this.sellbsList);
               }
               if(this.sellcwList.length > 0)
               {
                  _loc1_ = _loc1_.concat(this.sellcwList);
               }
               if(this.sellszList.length > 0)
               {
                  _loc1_ = _loc1_.concat(this.sellszList);
               }
               if(this.selldjList.length > 0)
               {
                  _loc1_ = _loc1_.concat(this.selldjList);
               }
               break;
            case 2:
               _loc1_ = this.sellbsList;
               break;
            case 3:
               _loc1_ = this.sellcwList;
               break;
            case 4:
               _loc1_ = this.sellszList;
               break;
            case 5:
               _loc1_ = this.selldjList;
         }
         var _loc2_:int = 0;
         while(_loc2_ < 9)
         {
            this["st" + _loc2_].clearEquipment();
            this["st" + _loc2_].visible = true;
            if(_loc1_[_loc2_ + (this.curPage - 1) * 9])
            {
               this["st" + _loc2_].setEquipment(_loc1_[_loc2_ + (this.curPage - 1) * 9]);
            }
            else
            {
               this["st" + _loc2_].visible = false;
            }
            _loc2_++;
         }
         var _loc3_:uint = uint(_loc1_.length);
         this.pageNum = uint(uint(uint(uint(uint(uint(uint(uint(uint(Math.ceil(_loc3_ / 9))))))))));
         if(this.pageNum == 0)
         {
            this.pageNum = 1;
         }
         this.setTxt();
      }
      
      private function setTxt() : void
      {
         this.txt_page.text = this.curPage + "/" + this.pageNum;
         this.txt_money.text = this.player.getLhValue() + "";
      }
      
      private function backClick(param1:MouseEvent) : void
      {
         this.gc.eventManger.dispatchEvent(new CommonEvent("SelectOver"));
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
      }
      
      private function czClick(param1:MouseEvent) : void
      {
         this.gc.ts.setTxt("单机版请用灵魂购买~");
         this.stage.addChild(this.gc.ts);
      }
      
      private function play1Click(param1:MouseEvent) : void
      {
         this.player = this.gc.player1;
         this.setTxt();
         this.gc.eventManger.dispatchEvent(new CommonEvent("ChangePlayer"));
         if(this.btn_play1.upState != this.btn_play1.overState)
         {
            if(this.playerbtnState)
            {
               this.btn_play2.upState = this.playerbtnState;
            }
            this.playerbtnState = param1.target.upState;
            param1.target.upState = param1.target.overState;
         }
      }
      
      private function play2Click(param1:MouseEvent) : void
      {
         this.player = this.gc.player2;
         this.setTxt();
         this.gc.eventManger.dispatchEvent(new CommonEvent("ChangePlayer"));
         if(this.btn_play2.upState != this.btn_play2.overState)
         {
            if(this.playerbtnState)
            {
               this.btn_play1.upState = this.playerbtnState;
            }
            this.playerbtnState = param1.target.upState;
            param1.target.upState = param1.target.overState;
         }
      }
      
      private function buyallClick(param1:MouseEvent) : void
      {
         this.selectTag = 1;
         this.curPage = 1;
         this.setShopThingEquipment();
         if(this.btnState)
         {
            if(this.lastBtn != "")
            {
               this[this.lastBtn].upState = this.btnState;
            }
         }
         this.lastBtn = "btn_buyall";
         this.btnState = param1.target.upState;
         param1.target.upState = param1.target.downState;
      }
      
      private function buybsClick(param1:MouseEvent) : void
      {
         this.selectTag = 2;
         this.curPage = 1;
         this.setShopThingEquipment();
         if(this.btnState)
         {
            if(this.lastBtn != "")
            {
               this[this.lastBtn].upState = this.btnState;
            }
         }
         this.lastBtn = "btn_buybs";
         this.btnState = param1.target.upState;
         param1.target.upState = param1.target.downState;
      }
      
      private function buydjClick(param1:MouseEvent) : void
      {
         this.selectTag = 5;
         this.curPage = 1;
         this.setShopThingEquipment();
         if(this.btnState)
         {
            if(this.lastBtn != "")
            {
               this[this.lastBtn].upState = this.btnState;
            }
         }
         this.lastBtn = "btn_buydj";
         this.btnState = param1.target.upState;
         param1.target.upState = param1.target.downState;
      }
      
      private function buycwClick(param1:MouseEvent) : void
      {
         this.selectTag = 3;
         this.curPage = 1;
         this.setShopThingEquipment();
         if(this.btnState)
         {
            if(this.lastBtn != "")
            {
               this[this.lastBtn].upState = this.btnState;
            }
         }
         this.lastBtn = "btn_buycw";
         this.btnState = param1.target.upState;
         param1.target.upState = param1.target.downState;
      }
      
      private function buyszClick(param1:MouseEvent) : void
      {
         this.selectTag = 4;
         this.curPage = 1;
         this.setShopThingEquipment();
         if(this.btnState)
         {
            if(this.lastBtn != "")
            {
               this[this.lastBtn].upState = this.btnState;
            }
         }
         this.lastBtn = "btn_buysz";
         this.btnState = param1.target.upState;
         param1.target.upState = param1.target.downState;
      }
      
      private function upPageClick(param1:MouseEvent) : void
      {
         if(this.curPage > 1)
         {
            --this.curPage;
            this.setShopThingEquipment();
            this.setTxt();
         }
      }
      
      private function nextPageClick(param1:MouseEvent) : void
      {
         if(this.curPage < this.pageNum)
         {
            ++this.curPage;
            this.setShopThingEquipment();
            this.setTxt();
         }
      }
      
      public function getFashionEquipId() : uint
      {
         if(this.fashionEquip)
         {
            return this.fashionEquip.showid;
         }
         return 1;
      }
      
      public function getWindEquipId() : uint
      {
         if(this.windEquip)
         {
            return this.windEquip.showid;
         }
         return 1;
      }
      
      private function buySuccess(param1:CommonEvent) : void
      {
         var _loc2_:* = null;
         var _loc3_:int = 0;
         var _loc4_:* = null;
         var _loc5_:int = 0;
         var _loc6_:int = 0;
         var _loc7_:* = null;
         this.player.setLhValue(this.player.getLhValue() - this.gc.needlh);
         this.allmoney = param1.data[0];
         this.setTxt();
         var _loc8_:int = 0;
         while(_loc8_ < 9)
         {
            _loc2_ = this["st" + _loc8_].getNumAndEquip();
            if(_loc2_.thingnum != 0)
            {
               if(this.selectTag == 1)
               {
                  _loc3_ = 0;
                  while(_loc3_ < _loc2_.thingnum)
                  {
                     if(MyEquipObj(_loc2_.equip).type == "zbsz" || MyEquipObj(_loc2_.equip).type == "zbcb")
                     {
                        this.gc.allEquip.reNewAll();
                        _loc4_ = this.gc.allEquip.findByName(MyEquipObj(_loc2_.equip).getFillName());
                        _loc4_.setFashionTime(this.gc.curdate);
                        this.player.szlist.push(_loc4_);
                     }
                     else if(MyEquipObj(_loc2_.equip).type == "zbwp" || MyEquipObj(_loc2_.equip).type == "wpqhs")
                     {
                        this.gc.putQhsInBackPack(this.player,MyEquipObj(_loc2_.equip).getFillName());
                     }
                     else
                     {
                        this.player.zblist.push(_loc2_.equip);
                     }
                     _loc3_++;
                  }
               }
               else if(this.selectTag == 2 || this.selectTag == 5 || this.selectTag == 3)
               {
                  _loc5_ = 0;
                  while(_loc5_ < _loc2_.thingnum)
                  {
                     this.gc.putQhsInBackPack(this.player,_loc2_.equip.getFillName());
                     _loc5_++;
                  }
               }
               else if(this.selectTag == 4)
               {
                  _loc6_ = 0;
                  while(_loc6_ < _loc2_.thingnum)
                  {
                     this.gc.allEquip.reNewAll();
                     _loc7_ = this.gc.allEquip.findByName(MyEquipObj(_loc2_.equip).getFillName());
                     _loc7_.setFashionTime(this.gc.curdate);
                     this.player.szlist.push(_loc7_);
                     _loc6_++;
                  }
               }
               this["st" + _loc8_].buySuccess();
            }
            _loc8_++;
         }
         this.gc.memory.setStorage(this.gc.saveId);
      }
      
      public function getMoneySuccess(param1:CommonEvent) : void
      {
         this.allmoney = int(int(int(int(int(int(int(int(int(param1.data[0])))))))));
         this.setTxt();
         var _loc2_:int = 0;
         while(_loc2_ < 9)
         {
            this["st" + _loc2_].getMoneySuccess();
            _loc2_++;
         }
      }
      
      public function getAllMoney() : int
      {
         return this.allmoney;
      }
   }
}

