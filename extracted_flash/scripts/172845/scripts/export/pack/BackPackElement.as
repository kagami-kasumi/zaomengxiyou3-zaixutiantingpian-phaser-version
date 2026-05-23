package export.pack
{
   import config.*;
   import event.CommonEvent;
   import export.strength.*;
   import flash.display.*;
   import flash.events.*;
   import my.*;
   import user.User;
   
   public class BackPackElement extends Sprite
   {
      
      public var curPage:uint = 1;
      
      private var allPage:uint = 5;
      
      private var pageNum:uint = 25;
      
      private var which:uint = 1;
      
      private var gzSprite:Sprite;
      
      private var gc:Config;
      
      private var player:User;
      
      private var tag:Boolean = true;
      
      public var btn_rw:SimpleButton;
      
      public var btn_dj:SimpleButton;
      
      public var btn_zb:SimpleButton;
      
      public var btn_jns:SimpleButton;
      
      private var lastBtn:String = "";
      
      private var btnState:*;
      
      public function BackPackElement()
      {
         super();
         this.gc = Config.getInstance();
         this.addEventListener(Event.ADDED_TO_STAGE,this.added,false,0,true);
         this.addEventListener(Event.REMOVED_FROM_STAGE,this.removed,false,0,true);
      }
      
      private function added(param1:*) : void
      {
         if(this.tag)
         {
            this.tag = false;
            this.selfSetPlayer();
            this.btn_rw.addEventListener(MouseEvent.CLICK,this.selectType);
            this.btn_dj.addEventListener(MouseEvent.CLICK,this.selectType);
            this.btn_zb.addEventListener(MouseEvent.CLICK,this.selectType);
            this.btn_jns.addEventListener(MouseEvent.CLICK,this.selectType);
            this.btn_zb.dispatchEvent(new MouseEvent(MouseEvent.CLICK));
            this.gc.eventManger.addEventListener("REFRESHBACKPACK",this.refreshBackPack);
            this.gc.eventManger.addEventListener("GETPACKAGEINFO",this.refreshBackPack);
            this.gc.eventManger.addEventListener("GETANDREFRESHBACKPACKAGE",this.rebackpackage);
         }
      }
      
      private function removed(param1:*) : void
      {
         this.btn_rw.removeEventListener(MouseEvent.CLICK,this.selectType);
         this.btn_dj.removeEventListener(MouseEvent.CLICK,this.selectType);
         this.btn_zb.removeEventListener(MouseEvent.CLICK,this.selectType);
         this.btn_jns.removeEventListener(MouseEvent.CLICK,this.selectType);
         this.gc.eventManger.removeEventListener("REFRESHBACKPACK",this.refreshBackPack);
         this.gc.eventManger.removeEventListener("GETPACKAGEINFO",this.refreshBackPack);
         this.gc.eventManger.removeEventListener("GETANDREFRESHBACKPACKAGE",this.rebackpackage);
         this.btnState = null;
      }
      
      public function setCurPage(param1:int) : void
      {
         var _loc2_:uint = this.curPage;
         this.curPage += param1;
         if(this.curPage > this.allPage)
         {
            this.curPage = this.allPage;
         }
         if(this.curPage < 1)
         {
            this.curPage = 1;
         }
         if(this.curPage != _loc2_)
         {
            this.rebackpackage(null);
         }
      }
      
      public function getCurPage() : int
      {
         return this.curPage;
      }
      
      public function getAllPage() : int
      {
         return this.allPage;
      }
      
      private function refreshBackPack(param1:CommonEvent) : void
      {
         this.reSetBackPackageTile();
         if(this.which == 3)
         {
            this.drawgz(this.player.szlist);
         }
         else if(this.which == 2)
         {
            this.drawgz(this.player.djlist);
         }
         else if(this.which == 1)
         {
            this.drawgz(this.player.zblist);
         }
         else if(this.which == 4)
         {
            this.drawgz(this.player.jnslist);
         }
      }
      
      private function rebackpackage(param1:CommonEvent) : void
      {
         if(this.which == 1)
         {
            this.btn_zb.dispatchEvent(new MouseEvent(MouseEvent.CLICK));
         }
         else if(this.which == 2)
         {
            this.btn_dj.dispatchEvent(new MouseEvent(MouseEvent.CLICK));
         }
         else if(this.which == 3)
         {
            this.btn_rw.dispatchEvent(new MouseEvent(MouseEvent.CLICK));
         }
         else if(this.which == 4)
         {
            this.btn_jns.dispatchEvent(new MouseEvent(MouseEvent.CLICK));
         }
      }
      
      private function selectType(param1:MouseEvent) : void
      {
         if(this.player == null)
         {
            return;
         }
         this.reSetBackPackageTile();
         switch(param1.currentTarget.name)
         {
            case "btn_rw":
               this.which = 3;
               this.drawgz(this.player.szlist);
               break;
            case "btn_dj":
               this.which = 2;
               this.drawgz(this.player.djlist);
               break;
            case "btn_zb":
               this.which = 1;
               this.drawgz(this.player.zblist);
               break;
            case "btn_jns":
               this.which = 4;
               this.drawgz(this.player.jnslist);
         }
         if(this.btnState)
         {
            if(this.lastBtn != "")
            {
               this[this.lastBtn].upState = this.btnState;
            }
         }
         this.lastBtn = param1.currentTarget.name;
         this.btnState = param1.target.upState;
         param1.target.upState = param1.target.downState;
      }
      
      private function drawgz(param1:Array) : void
      {
         var _loc2_:* = null;
         var _loc3_:int = 0;
         var _loc4_:int = 0;
         var _loc5_:int = 0;
         while(_loc5_ < 5)
         {
            _loc3_ = 0;
            while(_loc3_ < 5)
            {
               _loc2_ = AUtils.getNewObj("export.pack.PackThings") as PackThings;
               _loc2_.x = _loc3_ * (_loc2_.width + 11);
               _loc2_.y = _loc5_ * (_loc2_.height + 9);
               this.gzSprite.addChildAt(_loc2_,0);
               if(param1[_loc4_ + (this.curPage - 1) * 25])
               {
                  _loc2_.setObj(param1[_loc4_ + (this.curPage - 1) * 25],this.player.getControlPlayer() + 1,this.which);
                  _loc4_++;
               }
               _loc3_++;
            }
            _loc5_++;
         }
      }
      
      private function removeFromBackPackage(param1:Array) : void
      {
         var _loc2_:* = null;
         var _loc3_:* = null;
         var _loc4_:* = 0;
         var _loc5_:int = 0;
         var _loc6_:* = 0;
         var _loc7_:int = 0;
         var _loc8_:* = 0;
         var _loc9_:int = 0;
         var _loc10_:* = 0;
         var _loc11_:int = 0;
         var _loc12_:* = 0;
         var _loc13_:* = 0;
         var _loc14_:* = 0;
         var _loc15_:uint = param1.length;
         var _loc16_:Boolean = false;
         var _loc17_:int = 0;
         while(_loc17_ < _loc15_)
         {
            _loc16_ = false;
            _loc2_ = param1[_loc17_].dequip as MyEquipObj;
            _loc4_ = uint(this.player.zblist.length);
            _loc5_ = 0;
            while(_loc5_ < _loc4_)
            {
               _loc3_ = this.player.zblist[_loc5_] as MyEquipObj;
               if(_loc3_.getbackpackid() == _loc2_.getbackpackid())
               {
                  _loc12_ = uint(this.player.zblist.indexOf(_loc3_));
                  this.player.zblist.splice(_loc12_,1);
                  _loc16_ = true;
                  break;
               }
               _loc5_++;
            }
            if(!_loc16_)
            {
               _loc6_ = uint(this.player.djlist.length);
               _loc7_ = 0;
               while(_loc7_ < _loc6_)
               {
                  _loc3_ = this.player.djlist[_loc7_] as MyEquipObj;
                  if(_loc3_.getbackpackid() == _loc2_.getbackpackid())
                  {
                     if(_loc3_.getENum() > 1)
                     {
                        _loc3_.setNum(-1);
                     }
                     else
                     {
                        _loc13_ = uint(this.player.djlist.indexOf(_loc3_));
                        if(_loc13_ != -1)
                        {
                           this.player.djlist.splice(_loc13_,1);
                        }
                     }
                     _loc16_ = true;
                     break;
                  }
                  _loc7_++;
               }
               if(!_loc16_)
               {
                  _loc8_ = uint(this.player.szlist.length);
                  _loc9_ = 0;
                  while(_loc9_ < _loc8_)
                  {
                     _loc3_ = this.player.szlist[_loc9_] as MyEquipObj;
                     if(_loc3_.getbackpackid() == _loc2_.getbackpackid())
                     {
                        _loc14_ = uint(this.player.szlist.indexOf(_loc3_));
                        this.player.szlist.splice(_loc14_,1);
                        _loc16_ = true;
                        break;
                     }
                     _loc9_++;
                  }
                  if(!_loc16_)
                  {
                     _loc10_ = uint(this.player.jnslist.length);
                     _loc11_ = 0;
                     while(_loc11_ < _loc10_)
                     {
                        _loc3_ = this.player.jnslist[_loc11_] as MyEquipObj;
                        if(_loc3_.getbackpackid() == _loc2_.getbackpackid())
                        {
                           _loc14_ = uint(this.player.jnslist.indexOf(_loc3_));
                           this.player.jnslist.splice(_loc14_,1);
                           _loc16_ = true;
                           break;
                        }
                        _loc11_++;
                     }
                  }
               }
            }
            _loc17_++;
         }
      }
      
      private function reSetBackPackageTile() : void
      {
         if(Boolean(this.gzSprite) && contains(this.gzSprite))
         {
            this.removeChild(this.gzSprite);
            this.gzSprite = null;
         }
         this.gzSprite = new Sprite();
         this.gzSprite.x = 0;
         this.gzSprite.y = 38;
         this.addChild(this.gzSprite);
      }
      
      private function selfSetPlayer() : void
      {
         if(this.parent)
         {
            if(this.parent is BackPack)
            {
               this.player = BackPack(this.parent).getUser();
            }
            else if(this.parent is StrengthEquipment)
            {
               this.player = StrengthEquipment(this.parent).getUser();
            }
            else if(this.parent is WareHouse)
            {
               this.player = WareHouse(this.parent).getUser();
            }
         }
      }
      
      public function setPlayer(param1:User) : void
      {
         this.player = param1;
      }
      
      public function addMyEquipmentToList(param1:MyEquipObj) : void
      {
         if(param1.type == "zbwq" || param1.type == "zbfj" || param1.type == "zbfb" || param1.type == "zbsp")
         {
            this.player.zblist.push(param1);
         }
         else if(param1.type == "zbsz")
         {
            this.player.szlist.push(param1);
         }
         else
         {
            this.gc.putQhsInBackPack(this.player,param1.getFillName(),param1.getENum());
         }
         this.rebackpackage(null);
      }
   }
}

