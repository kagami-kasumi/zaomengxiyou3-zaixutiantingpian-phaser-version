package export.strength
{
   import com.hexagonstar.util.debug.*;
   import config.*;
   import event.*;
   import export.pack.*;
   import flash.display.SimpleButton;
   import flash.display.Sprite;
   import flash.events.*;
   import flash.text.TextField;
   import my.MyEquipObj;
   import user.User;
   
   public class Making extends Sprite
   {
      
      public var makingbook:Sprite;
      
      public var needmaterial1:Sprite;
      
      public var needmaterial2:Sprite;
      
      public var material1:Sprite;
      
      public var material2:Sprite;
      
      public var material3:Sprite;
      
      public var makeObj:Sprite;
      
      public var txthas1:TextField;
      
      public var txtneed1:TextField;
      
      public var txthas2:TextField;
      
      public var txtneed2:TextField;
      
      public var txt_needlh:TextField;
      
      public var txt_name:TextField;
      
      public var btn_help:SimpleButton;
      
      public var dzbtn:SimpleButton;
      
      private var gc:Config;
      
      private var player:User;
      
      private var curmbook:MyEquipObj;
      
      private var needAry:Array;
      
      private var tag:Boolean = true;
      
      public function Making(param1:User)
      {
         this.needAry = [];
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
            this.dzbtn.addEventListener(MouseEvent.CLICK,this.dzClick);
            this.makeObj.addEventListener(MouseEvent.CLICK,this.removeMakeObj);
            this.material1.addEventListener(MouseEvent.CLICK,this.onClick);
            this.material2.addEventListener(MouseEvent.CLICK,this.onClick);
            this.material3.addEventListener(MouseEvent.CLICK,this.onClick);
         }
      }
      
      private function removed(param1:Event) : void
      {
         this.gc.eventManger.removeEventListener("SimpleClick",this.receiveObj);
         this.dzbtn.removeEventListener(MouseEvent.CLICK,this.dzClick);
         this.makeObj.removeEventListener(MouseEvent.CLICK,this.removeMakeObj);
         this.material1.removeEventListener(MouseEvent.CLICK,this.onClick);
         this.material2.removeEventListener(MouseEvent.CLICK,this.onClick);
         this.material3.removeEventListener(MouseEvent.CLICK,this.onClick);
         this.clearAllThingExceptMakeObject(false);
      }
      
      private function receiveObj(param1:CommonEvent) : void
      {
         var _loc2_:ShowObj = null;
         var _loc3_:* = null;
         var _loc4_:int = 0;
         _loc2_ = param1.data[0] as ShowObj;
         if(_loc2_.getMyEquipObj().findUsedByShowId() == "zzs")
         {
            this.curmbook = null;
            this.curmbook = _loc2_.getMyEquipObj();
            _loc3_ = this.makingbook.getChildByName("curzb") as ShowObj;
            if(_loc3_ == null)
            {
               this.makingbook.addChild(_loc2_);
            }
            else
            {
               this.makingbook.removeChild(_loc3_);
               this.gc.putQhsInBackPack(this.player,_loc3_.getMyEquipObj().getFillName());
               this.makingbook.addChild(_loc2_);
               _loc3_ = null;
            }
            this.removeEquipFormBack(_loc2_.getMyEquipObj(),2);
            this.needAry = this.gc.allEquip.findNeedMaterialByName(this.curmbook.getFillName());
            this.addNeedMaterial(this.needAry);
         }
         else if(_loc2_.getMyEquipObj().findUsedByShowId() == "bs")
         {
            if(this.curmbook)
            {
               _loc4_ = 1;
               while(_loc4_ <= 3)
               {
                  if(this["material" + _loc4_].getChildByName("curzb") == null)
                  {
                     this["material" + _loc4_].addChild(_loc2_);
                     this.removeEquipFormBack(_loc2_.getMyEquipObj(),2);
                     break;
                  }
                  _loc4_++;
               }
            }
         }
         this.removeMakeObj(null);
         this.getOutList();
         this.setTxt();
         this.gc.eventManger.dispatchEvent(new CommonEvent("REFRESHBACKPACK",[false]));
      }
      
      private function onClick(param1:MouseEvent) : void
      {
         var _loc2_:* = null;
         if(param1.currentTarget.getChildByName("curzb") != null)
         {
            _loc2_ = param1.currentTarget.getChildByName("curzb") as ShowObj;
            param1.currentTarget.removeChild(_loc2_);
            switch(_loc2_.getMyEquipObj().type)
            {
               case "zbwq":
               case "zbfj":
               case "zbsp":
               case "zbfb":
                  this.player.zblist.push(_loc2_.getMyEquipObj());
                  break;
               case "wpqhs":
                  if(_loc2_.getMyEquipObj().ename.indexOf("强化石") != -1)
                  {
                     this.gc.putQhsInBackPack(this.player,_loc2_.getMyEquipObj().getFillName());
                  }
                  break;
               case "zbwp":
                  if(_loc2_.getMyEquipObj().findUsedByShowId() == "bs")
                  {
                     this.gc.putQhsInBackPack(this.player,_loc2_.getMyEquipObj().getFillName());
                  }
            }
            this.gc.eventManger.dispatchEvent(new CommonEvent("REFRESHBACKPACK",[false]));
            _loc2_ = null;
         }
      }
      
      private function addNeedMaterial(param1:Array) : void
      {
         var _loc2_:* = null;
         this.cleanNeedMaterial();
         var _loc3_:uint = param1.length;
         var _loc4_:int = 0;
         while(_loc4_ < _loc3_)
         {
            if(param1[_loc4_] != null)
            {
               _loc2_ = new ShowObj(param1[_loc4_].equip);
               this["needmaterial" + (_loc4_ + 1)].addChild(_loc2_);
               _loc2_ = null;
            }
            _loc4_++;
         }
      }
      
      private function cleanNeedMaterial() : void
      {
         var _loc1_:* = null;
         var _loc2_:int = 0;
         while(_loc2_ < 2)
         {
            if(this["needmaterial" + (_loc2_ + 1)].getChildByName("curzb"))
            {
               _loc1_ = this["needmaterial" + (_loc2_ + 1)].getChildByName("curzb") as ShowObj;
               this["needmaterial" + (_loc2_ + 1)].removeChild(_loc1_);
               _loc1_ = null;
            }
            _loc2_++;
         }
      }
      
      private function removeEquipFormBack(param1:MyEquipObj, param2:int, param3:uint = 1) : void
      {
         var _loc4_:int = 0;
         var _loc5_:MyEquipObj = this.player.getSomeEquipInPackBackByName(param1.getFillName());
         if(param2 == 1)
         {
            if(param1.getENum() > 1)
            {
               param1.setNum(-1);
            }
            else
            {
               _loc4_ = int(this.player.zblist.indexOf(param1));
               if(_loc4_ != -1)
               {
                  this.player.zblist.splice(_loc4_,1);
               }
            }
         }
         else if(param2 == 2)
         {
            if(param1.getENum() > param3)
            {
               param1.setNum(-param3);
            }
            else
            {
               _loc4_ = int(this.player.djlist.indexOf(param1));
               if(_loc4_ != -1)
               {
                  this.player.djlist.splice(_loc4_,1);
               }
            }
         }
      }
      
      private function setTxt() : void
      {
         var _loc1_:* = 0;
         var _loc2_:int = 0;
         this.txthas1.text = " ";
         this.txtneed1.text = " ";
         this.txthas2.text = " ";
         this.txtneed2.text = " ";
         this.txt_needlh.text = " ";
         this.txt_name.text = " ";
         if(this.needAry == null)
         {
            return;
         }
         if(this.curmbook)
         {
            _loc1_ = uint(this.needAry.length);
            _loc2_ = 0;
            while(_loc2_ < _loc1_)
            {
               this["txthas" + (_loc2_ + 1)].text = this.player.getSomeOneEquipNumberByName(this.needAry[_loc2_].equip.getFillName()) + " ";
               this["txtneed" + (_loc2_ + 1)].text = this.needAry[_loc2_].count + " ";
               _loc2_++;
            }
            this.txt_needlh.text = this.needLHValueByQuality(this.curmbook.quality) + " ";
         }
         var _loc3_:ShowObj = this.makeObj.getChildByName("curzb") as ShowObj;
         if(_loc3_)
         {
            this.txt_name.text = _loc3_.getMyEquipObj().ename + "";
         }
      }
      
      private function needLHValueByQuality(param1:String) : uint
      {
         switch(param1)
         {
            case "粗 糙":
               return 50 + Math.random();
            case "普 通":
               return 100 + Math.random();
            case "优 秀":
               return 200 + Math.random();
            case "精 良":
               return 400 + Math.random();
            case "史 诗":
               return 800 + Math.random();
            case "传 说":
               return 1600 + Math.random();
            default:
               return 0;
         }
      }
      
      private function getOutList() : void
      {
         var _loc1_:* = null;
         this.player.outlist = [];
         if(this.curmbook)
         {
            this.player.outlist.push({
               "dequip":this.curmbook,
               "count":1
            });
         }
         var _loc2_:int = 0;
         while(_loc2_ < 3)
         {
            if(this["material" + (_loc2_ + 1)].getChildByName("curzb"))
            {
               _loc1_ = this["material" + (_loc2_ + 1)].getChildByName("curzb") as ShowObj;
               this.player.outlist.push({
                  "dequip":_loc1_.getMyEquipObj(),
                  "count":1
               });
               _loc1_ = null;
            }
            _loc2_++;
         }
      }
      
      private function dzClick(param1:MouseEvent) : void
      {
         var _loc2_:* = 0;
         var _loc3_:int = 0;
         var _loc4_:* = null;
         var _loc5_:* = null;
         if(this.curmbook == null)
         {
            return;
         }
         if(this.player.getLhValue() >= int(this.txt_needlh.text) && int(this.txthas1.text) >= int(this.txtneed1.text) && int(this.txthas2.text) >= int(this.txtneed2.text))
         {
            this.player.setLhValue(Number(this.player.getLhValue()) - int(this.txt_needlh.text));
            StrengthEquipment(this.parent).setTxtlh();
            _loc2_ = uint(this.needAry.length);
            _loc3_ = 0;
            while(_loc3_ < _loc2_)
            {
               this.player.outlist.push({
                  "dequip":this.player.getSomeEquipInPackBackByName(this.needAry[_loc3_].equip.getFillName()),
                  "count":this.needAry[_loc3_].count
               });
               _loc5_ = this.player.getSomeEquipInPackBackByName(this.needAry[_loc3_].equip.getFillName());
               this.removeEquipFormBack(_loc5_,2,this.needAry[_loc3_].count);
               _loc3_++;
            }
            Debug.trace("Making --outlist.length =" + this.player.outlist.length);
            this.needAry = null;
            _loc4_ = new ShowObj(this.achieveWhichProduce(this.curmbook.getFillName()));
            this.player.zblist.push(_loc4_.getMyEquipObj());
            this.makeObj.addChild(_loc4_);
            this.clearAllThingExceptMakeObject(true);
            this.gc.eventManger.dispatchEvent(new CommonEvent("CHANGETXT"));
            if(this.gc.isHideDebug)
            {
               this.gc.memory.setStorage(this.gc.saveId);
            }
         }
      }
      
      private function removeMakeObj(param1:MouseEvent) : void
      {
         var _loc2_:* = this.makeObj.getChildByName("curzb") as ShowObj;
         if(_loc2_)
         {
            this.makeObj.removeChild(_loc2_);
            _loc2_ = null;
         }
      }
      
      private function achieveWhichProduce(param1:String) : MyEquipObj
      {
         var _loc2_:* = null;
         var _loc3_:* = null;
         var _loc4_:* = undefined;
         this.gc.allEquip.reNewAll();
         var _loc5_:String = param1.substr(0,param1.length - 3);
         _loc2_ = this.gc.allEquip.findByName(_loc5_);
         var _loc6_:int = 0;
         while(_loc6_ < 3)
         {
            _loc3_ = this["material" + (_loc6_ + 1)].getChildByName("curzb") as ShowObj;
            if(_loc3_)
            {
               _loc4_ = this.randomGemAttributeByGemName(_loc3_.getMyEquipObj().getFillName());
               if(_loc3_.getMyEquipObj().isSms())
               {
                  _loc2_.setehp(_loc2_.getehp() + _loc4_);
               }
               else if(_loc3_.getMyEquipObj().isMfs())
               {
                  _loc2_.setemp(_loc2_.getemp() + _loc4_);
               }
               else if(_loc3_.getMyEquipObj().isGjs())
               {
                  _loc2_.seteatt(_loc2_.geteatt() + _loc4_);
               }
               else if(_loc3_.getMyEquipObj().isFys())
               {
                  _loc2_.setedef(_loc2_.getedef() + _loc4_);
               }
               else if(_loc3_.getMyEquipObj().isTlz())
               {
                  _loc2_.setmagicdef(_loc2_.getmagicdef() + _loc4_);
               }
               else if(_loc3_.getMyEquipObj().isLlz())
               {
                  _loc2_.setecrit(_loc2_.getecrit() + _loc4_);
               }
               else if(_loc3_.getMyEquipObj().isHlz())
               {
                  _loc2_.seteahp(_loc2_.geteahp() + _loc4_);
               }
               else if(_loc3_.getMyEquipObj().isFlz())
               {
                  _loc2_.setemiss(_loc2_.getemiss() + _loc4_);
               }
               else if(_loc3_.getMyEquipObj().isSlz())
               {
                  _loc2_.seteamp(_loc2_.geteamp() + _loc4_);
               }
            }
            _loc6_++;
         }
         return _loc2_;
      }
      
      private function randomGemAttributeByGemName(param1:String) : *
      {
         switch(param1)
         {
            case "sms1":
               return Math.round(20 + Math.random() * 15);
            case "sms2":
            case "scsms2":
               return Math.round(145 + Math.random() * 15);
            case "sms3":
            case "scsms3":
               return Math.round(245 + Math.random() * 15);
            case "mfs1":
               return Math.round(15 + Math.random() * 5);
            case "mfs2":
            case "scmfs2":
               return Math.round(105 + Math.random() * 5);
            case "mfs3":
            case "scmfs3":
               return Math.round(195 + Math.random() * 5);
            case "gjs1":
               return Math.round(9 + Math.random() * 1);
            case "gjs2":
            case "scgjs2":
               return Math.round(15 + Math.random() * 5);
            case "gjs3":
            case "scgjs3":
               return Math.round(35 + Math.random() * 5);
            case "fys1":
               return Math.round(14 + Math.random() * 1);
            case "fys2":
            case "scfys2":
               return Math.round(49 + Math.random() * 1);
            case "fys3":
            case "scfys3":
               return Math.round(89 + Math.random() * 1);
            case "wptlz":
               return 0.01 + Math.random() * 0.01;
            case "wpllz":
               return 0.01 + Math.random() * 0.01;
            case "wphlz":
               return 8 + Math.round(Math.random() * 1);
            case "wpflz":
               return 0.01;
            case "wpslz":
               return 4 + Math.round(Math.random() * 1);
            default:
               return 0;
         }
      }
      
      private function clearAllThingExceptMakeObject(param1:Boolean) : void
      {
         var _loc2_:* = null;
         this.curmbook = null;
         if(this.makingbook.getChildByName("curzb"))
         {
            _loc2_ = this.makingbook.getChildByName("curzb") as ShowObj;
            if(!param1)
            {
               this.gc.putQhsInBackPack(this.player,_loc2_.getMyEquipObj().getFillName());
            }
            this.makingbook.removeChild(_loc2_);
            _loc2_ = null;
         }
         this.cleanNeedMaterial();
         var _loc3_:int = 0;
         while(_loc3_ < 3)
         {
            if(this["material" + (_loc3_ + 1)].getChildByName("curzb"))
            {
               _loc2_ = this["material" + (_loc3_ + 1)].getChildByName("curzb") as ShowObj;
               this["material" + (_loc3_ + 1)].removeChild(_loc2_);
               if(!param1)
               {
                  this.gc.putQhsInBackPack(this.player,_loc2_.getMyEquipObj().getFillName());
               }
               _loc2_ = null;
            }
            _loc3_++;
         }
         this.setTxt();
      }
   }
}

