package export.strength
{
   import config.*;
   import event.*;
   import export.pack.*;
   import flash.display.SimpleButton;
   import flash.display.Sprite;
   import flash.events.*;
   import flash.text.TextField;
   import my.MyEquipObj;
   import user.User;
   
   public class Resolution extends Sprite
   {
      
      public var material:Sprite;
      
      public var resu1:Sprite;
      
      public var resu2:Sprite;
      
      public var resu3:Sprite;
      
      public var resu4:Sprite;
      
      public var resu5:Sprite;
      
      public var resu6:Sprite;
      
      public var txt_needlh:TextField;
      
      public var fjbtn:SimpleButton;
      
      public var btn_help:SimpleButton;
      
      private var gc:Config;
      
      private var player:User;
      
      private var curEquip:MyEquipObj;
      
      private var tag:Boolean = true;
      
      public function Resolution(param1:User)
      {
         super();
         this.player = param1;
         this.gc = Config.getInstance();
         this.addEventListener(Event.ADDED_TO_STAGE,this.added,false,0,true);
         this.addEventListener(Event.REMOVED_FROM_STAGE,this.removed,false,0,true);
      }
      
      private function added(param1:Event) : void
      {
         if(this.tag)
         {
            this.tag = false;
            this.player.outlist = [];
            this.gc.eventManger.addEventListener("SimpleClick",this.receiveObj);
            this.fjbtn.addEventListener(MouseEvent.CLICK,this.fjClick);
            this.resu1.addEventListener(MouseEvent.CLICK,this.onClick);
            this.resu2.addEventListener(MouseEvent.CLICK,this.onClick);
            this.resu3.addEventListener(MouseEvent.CLICK,this.onClick);
            this.resu4.addEventListener(MouseEvent.CLICK,this.onClick);
            this.resu5.addEventListener(MouseEvent.CLICK,this.onClick);
            this.resu6.addEventListener(MouseEvent.CLICK,this.onClick);
         }
      }
      
      private function removed(param1:Event) : void
      {
         this.player.outlist = [];
         this.gc.eventManger.removeEventListener("SimpleClick",this.receiveObj);
         this.fjbtn.removeEventListener(MouseEvent.CLICK,this.fjClick);
         this.resu1.removeEventListener(MouseEvent.CLICK,this.onClick);
         this.resu2.removeEventListener(MouseEvent.CLICK,this.onClick);
         this.resu3.removeEventListener(MouseEvent.CLICK,this.onClick);
         this.resu4.removeEventListener(MouseEvent.CLICK,this.onClick);
         this.resu5.removeEventListener(MouseEvent.CLICK,this.onClick);
         this.resu6.removeEventListener(MouseEvent.CLICK,this.onClick);
         this.removedMaterialObj(false);
      }
      
      private function receiveObj(param1:CommonEvent) : void
      {
         var _loc2_:* = null;
         var _loc3_:ShowObj = param1.data[0] as ShowObj;
         if(_loc3_.getMyEquipObj().type == "zbwq" || _loc3_.getMyEquipObj().type == "zbfj" || _loc3_.getMyEquipObj().type == "zbsp")
         {
            _loc2_ = this.material.getChildByName("curzb") as ShowObj;
            if(_loc2_ == null)
            {
               this.material.addChild(_loc3_);
            }
            else if(this.gc.allEquip.isTheSameEquipmentByFillName(_loc2_.getMyEquipObj()))
            {
               this.material.removeChild(_loc2_);
               this.player.zblist.push(_loc2_.getMyEquipObj());
               _loc2_ = null;
               this.material.addChild(_loc3_);
            }
            else
            {
               this.gc.ts.setTxt("不是同一个物品，请勿修改");
               this.gc.stage.addChild(this.gc.ts);
            }
            this.removeEquipFormBack(_loc3_.getMyEquipObj(),1);
            this.getMaterial();
            this.removeAllFromResu();
            this.setNeedLhTxt();
         }
      }
      
      private function setNeedLhTxt() : void
      {
         this.txt_needlh.text = "100";
      }
      
      private function onClick(param1:MouseEvent) : void
      {
         var _loc2_:* = null;
         if(param1.currentTarget.getChildByName("curzb") != null)
         {
            _loc2_ = param1.currentTarget.getChildByName("curzb") as ShowObj;
            param1.currentTarget.removeChild(_loc2_);
            _loc2_ = null;
         }
      }
      
      private function removeEquipFormBack(param1:MyEquipObj, param2:int) : void
      {
         var _loc3_:int = 0;
         if(param2 == 1)
         {
            if(param1.getENum() > 1)
            {
               param1.setNum(-1);
            }
            else
            {
               _loc3_ = int(this.player.zblist.indexOf(param1));
               if(_loc3_ != -1)
               {
                  this.player.zblist.splice(_loc3_,1);
               }
            }
         }
         else if(param2 == 2)
         {
            if(param1.getENum() > 1)
            {
               param1.setNum(-1);
            }
            else
            {
               _loc3_ = int(this.player.djlist.indexOf(param1));
               if(_loc3_ != -1)
               {
                  this.player.djlist.splice(_loc3_,1);
               }
            }
         }
      }
      
      private function getMaterial() : void
      {
         var _loc1_:* = null;
         this.player.outlist = [];
         if(this.material.getChildByName("curzb"))
         {
            _loc1_ = this.material.getChildByName("curzb") as ShowObj;
            this.curEquip = _loc1_.getMyEquipObj();
            this.player.outlist.push({
               "dequip":this.curEquip,
               "count":1
            });
            _loc1_ = null;
         }
         this.gc.eventManger.dispatchEvent(new CommonEvent("REFRESHBACKPACK",[false]));
      }
      
      private function removedMaterialObj(param1:Boolean = true) : void
      {
         var _loc2_:* = this.material.getChildByName("curzb") as ShowObj;
         if(_loc2_)
         {
            if(!param1)
            {
               this.player.zblist.push(_loc2_.getMyEquipObj());
            }
            this.material.removeChild(_loc2_);
            _loc2_ = null;
         }
      }
      
      private function fjClick(param1:MouseEvent) : void
      {
         var _loc2_:* = null;
         var _loc3_:* = 0;
         var _loc4_:int = 0;
         if(this.curEquip != null)
         {
            if(this.player.getLhValue() >= 100)
            {
               this.player.setLhValue(Number(this.player.getLhValue()) - 100);
               StrengthEquipment(this.parent).setTxtlh();
               _loc2_ = this.gc.allEquip.findResolution(this.curEquip);
               this.removedMaterialObj();
               this.addToResu(_loc2_);
               _loc3_ = uint(_loc2_.length);
               _loc4_ = 0;
               while(_loc4_ < _loc3_)
               {
                  this.gc.putQhsInBackPack(this.player,_loc2_[_loc4_].getFillName());
                  _loc4_++;
               }
               this.curEquip = null;
            }
         }
      }
      
      private function addToResu(param1:Array) : void
      {
         var _loc2_:* = null;
         var _loc3_:uint = param1.length;
         var _loc4_:int = 0;
         while(_loc4_ < _loc3_)
         {
            _loc2_ = new ShowObj(param1[_loc4_]);
            _loc2_.y = -2;
            this["resu" + (_loc4_ + 1)].addChild(_loc2_);
            _loc4_++;
         }
      }
      
      private function removeAllFromResu() : void
      {
         var _loc1_:* = null;
         var _loc2_:int = 0;
         while(_loc2_ < 6)
         {
            _loc1_ = this["resu" + (_loc2_ + 1)].getChildByName("curzb") as ShowObj;
            if(_loc1_ != null)
            {
               this["resu" + (_loc2_ + 1)].removeChild(_loc1_);
               _loc1_ = null;
            }
            _loc2_++;
         }
      }
   }
}

