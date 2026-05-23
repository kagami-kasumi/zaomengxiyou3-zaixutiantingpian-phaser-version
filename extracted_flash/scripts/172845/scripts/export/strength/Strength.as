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
   
   public class Strength extends Sprite
   {
      
      private var gc:Config;
      
      private var curWepon:ShowObj;
      
      private var player:User;
      
      public var qhbtn:SimpleButton;
      
      public var qhmc1:Sprite;
      
      public var qhmc2:Sprite;
      
      public var qhmc3:Sprite;
      
      public var zbmc:Sprite;
      
      public var luckmc:Sprite;
      
      public var baodimc:Sprite;
      
      public var txt_needlh:TextField;
      
      public var txt_success:TextField;
      
      private var cobj:Object;
      
      private var tag:Boolean = true;
      
      public function Strength(param1:User)
      {
         this.cobj = {"allpro":0};
         super();
         this.gc = Config.getInstance();
         this.player = param1;
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
            this.qhmc1.addEventListener(MouseEvent.CLICK,this.onClick);
            this.qhmc2.addEventListener(MouseEvent.CLICK,this.onClick);
            this.qhmc3.addEventListener(MouseEvent.CLICK,this.onClick);
            this.zbmc.addEventListener(MouseEvent.CLICK,this.onClick);
            this.luckmc.addEventListener(MouseEvent.CLICK,this.onClick);
            this.baodimc.addEventListener(MouseEvent.CLICK,this.onClick);
            this.qhbtn.addEventListener(MouseEvent.CLICK,this.qhClick);
         }
      }
      
      private function removed(param1:Event) : void
      {
         this.player.outlist = [];
         this.gc.eventManger.removeEventListener("SimpleClick",this.receiveObj);
         this.qhmc1.removeEventListener(MouseEvent.CLICK,this.onClick);
         this.qhmc2.removeEventListener(MouseEvent.CLICK,this.onClick);
         this.qhmc3.removeEventListener(MouseEvent.CLICK,this.onClick);
         this.zbmc.removeEventListener(MouseEvent.CLICK,this.onClick);
         this.luckmc.removeEventListener(MouseEvent.CLICK,this.onClick);
         this.baodimc.removeEventListener(MouseEvent.CLICK,this.onClick);
         this.qhbtn.removeEventListener(MouseEvent.CLICK,this.qhClick);
         this.removedSelf();
      }
      
      private function receiveObj(param1:CommonEvent) : void
      {
         var _loc2_:Number = Number(NaN);
         var _loc3_:* = null;
         var _loc4_:ShowObj = param1.data[0] as ShowObj;
         if(_loc4_.getMyEquipObj().type == "zbtx")
         {
            this.gc.ts.setTxt("该装备不能强化");
            this.gc.stage.addChild(this.gc.ts);
            return;
         }
         if(_loc4_.getMyEquipObj().getStrengthValue() >= 7)
         {
            this.gc.ts.setTxt("该装备强化等级已达上限");
            this.gc.stage.addChild(this.gc.ts);
            return;
         }
         if(_loc4_.getMyEquipObj().getFillName() == "hy" || _loc4_.getMyEquipObj().getFillName() == "_dzj" || _loc4_.getMyEquipObj().getFillName() == "dzjj" || _loc4_.getMyEquipObj().quality == "神 器")
         {
            if(_loc4_.getMyEquipObj().getFillName() != "sqmdcqg" && _loc4_.getMyEquipObj().getFillName() != "zxstg" && _loc4_.getMyEquipObj().getFillName() != "zxstj" && _loc4_.getMyEquipObj().getFillName() != "zxptz" && _loc4_.getMyEquipObj().getFillName() != "zxpty" && _loc4_.getMyEquipObj().getFillName() != "zxztk" && _loc4_.getMyEquipObj().getFillName() != "zxztp" && _loc4_.getMyEquipObj().getFillName() != "zxqtc" && _loc4_.getMyEquipObj().getFillName() != "zxqts" && _loc4_.getMyEquipObj().getFillName() != "zxztj" && _loc4_.getMyEquipObj().getFillName() != "zxttp")
            {
               this.gc.ts.setTxt("该装备暂时不能强化");
               this.gc.stage.addChild(this.gc.ts);
               return;
            }
         }
         switch(_loc4_.getMyEquipObj().type)
         {
            case "zbwq":
            case "zbfj":
            case "zbsp":
            case "zbsz":
            case "":
               if(this.zbmc.getChildByName("curzb") == null)
               {
                  this.zbmc.addChild(_loc4_);
               }
               else
               {
                  _loc3_ = this.zbmc.getChildByName("curzb") as ShowObj;
                  this.zbmc.removeChild(_loc3_);
                  if(_loc3_.getMyEquipObj().type == "zbsz")
                  {
                     this.player.szlist.push(_loc3_.getMyEquipObj());
                  }
                  else
                  {
                     this.player.zblist.push(_loc3_.getMyEquipObj());
                  }
                  _loc3_ = null;
                  this.zbmc.addChild(_loc4_);
               }
               this.curWepon = null;
               this.curWepon = _loc4_;
               if(_loc4_.getMyEquipObj().type == "zbsz")
               {
                  this.removeEquipFormBack(_loc4_.getMyEquipObj(),3);
               }
               else
               {
                  this.removeEquipFormBack(_loc4_.getMyEquipObj(),1);
               }
               this.changeLuck();
               _loc2_ = Number(this.gc.allEquip.transLevelTNeedlh(this.curWepon.getMyEquipObj()));
               this.txt_needlh.text = String(_loc2_);
               break;
            case "wpqhs":
               if(this.qhmc1.numChildren < 2)
               {
                  this.qhmc1.addChild(_loc4_);
                  this.removeEquipFormBack(_loc4_.getMyEquipObj(),2);
                  this.changeLuck();
                  break;
               }
               if(this.qhmc2.numChildren < 2)
               {
                  this.qhmc2.addChild(_loc4_);
                  this.removeEquipFormBack(_loc4_.getMyEquipObj(),2);
                  this.changeLuck();
                  break;
               }
               if(this.qhmc3.numChildren < 2)
               {
                  this.qhmc3.addChild(_loc4_);
                  this.removeEquipFormBack(_loc4_.getMyEquipObj(),2);
                  this.changeLuck();
               }
               break;
            case "zbwp":
               if(_loc4_.getMyEquipObj().getFillName() == "wpxyf")
               {
                  if(this.luckmc.getChildByName("curzb") == null)
                  {
                     this.luckmc.addChild(_loc4_);
                     this.changeLuck();
                     this.removeEquipFormBack(_loc4_.getMyEquipObj(),2);
                     break;
                  }
                  return;
               }
               if(_loc4_.getMyEquipObj().getFillName() == "wpbdf")
               {
                  if(this.baodimc.getChildByName("curzb") == null)
                  {
                     this.baodimc.addChild(_loc4_);
                     this.removeEquipFormBack(_loc4_.getMyEquipObj(),2);
                     break;
                  }
                  return;
               }
         }
         this.getOutEquip();
         this.gc.eventManger.dispatchEvent(new CommonEvent("REFRESHBACKPACK",[false]));
      }
      
      private function getOutEquip() : void
      {
         var _loc1_:* = null;
         this.player.outlist = [];
         if(this.zbmc.getChildByName("curzb"))
         {
            _loc1_ = this.zbmc.getChildByName("curzb") as ShowObj;
            this.player.outlist.push({
               "dequip":_loc1_.getMyEquipObj(),
               "count":1
            });
            _loc1_ = null;
         }
         var _loc2_:int = 0;
         while(_loc2_ < 3)
         {
            if(this["qhmc" + (_loc2_ + 1)].getChildByName("curzb"))
            {
               _loc1_ = this["qhmc" + (_loc2_ + 1)].getChildByName("curzb") as ShowObj;
               this.player.outlist.push({
                  "dequip":_loc1_.getMyEquipObj(),
                  "count":1
               });
               _loc1_ = null;
            }
            _loc2_++;
         }
         if(this.luckmc.getChildByName("curzb"))
         {
            _loc1_ = this.luckmc.getChildByName("curzb") as ShowObj;
            this.player.outlist.push({
               "dequip":_loc1_.getMyEquipObj(),
               "count":1
            });
            _loc1_ = null;
         }
         if(this.baodimc.getChildByName("curzb"))
         {
            _loc1_ = this.baodimc.getChildByName("curzb") as ShowObj;
            this.player.outlist.push({
               "dequip":_loc1_.getMyEquipObj(),
               "count":1
            });
            _loc1_ = null;
         }
      }
      
      private function judgeallpro() : void
      {
         if(this.cobj.allpro > 1)
         {
            this.cobj = AUtils.clone(this.cobj);
            this.cobj.allpro = 1;
         }
      }
      
      private function changeLuck() : void
      {
         var _loc1_:* = null;
         var _loc2_:int = 0;
         var _loc3_:Number = Number(NaN);
         var _loc4_:Number = Number(NaN);
         this.cobj = AUtils.clone(this.cobj);
         this.cobj.allpro = 0;
         if(this.curWepon)
         {
            _loc2_ = 1;
            while(_loc2_ <= 3)
            {
               if(this["qhmc" + _loc2_].getChildByName("curzb") != null)
               {
                  _loc1_ = this["qhmc" + _loc2_].getChildByName("curzb");
                  _loc3_ = Number(this.gc.allEquip.getStrengthNumber(_loc1_.getMyEquipObj(),this.curWepon.getMyEquipObj()));
                  this.cobj.allpro += _loc3_;
                  this.judgeallpro();
                  this.txt_success.text = Math.floor(Number(this.cobj.allpro) * 100) + "%";
               }
               _loc2_++;
            }
            if(this.luckmc.getChildByName("curzb") != null)
            {
               _loc4_ = Number(this.cobj.allpro) * 0.25;
               this.cobj = AUtils.clone(this.cobj);
               this.cobj.allpro += _loc4_;
               this.judgeallpro();
               this.txt_success.text = Math.floor(Number(this.cobj.allpro) * 100) + "%";
            }
         }
         else
         {
            this.txt_success.text = Math.floor(Number(this.cobj.allpro) * 100) + "%";
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
         else if(param2 == 3)
         {
            if(param1.getENum() > 1)
            {
               param1.setNum(-1);
            }
            else
            {
               _loc3_ = int(this.player.szlist.indexOf(param1));
               if(_loc3_ != -1)
               {
                  this.player.szlist.splice(_loc3_,1);
               }
            }
         }
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
               case "":
                  this.player.zblist.push(_loc2_.getMyEquipObj());
                  this.changeLuck();
                  this.curWepon = null;
                  break;
               case "zbsz":
                  if(_loc2_.getMyEquipObj().ename.indexOf("装") != -1)
                  {
                     this.player.szlist.push(_loc2_.getMyEquipObj());
                     this.changeLuck();
                     this.curWepon = null;
                  }
                  break;
               case "wpqhs":
                  if(_loc2_.getMyEquipObj().ename.indexOf("强化石") != -1)
                  {
                     this.gc.putQhsInBackPack(this.player,_loc2_.getMyEquipObj().getFillName());
                     if(this.curWepon != null)
                     {
                        this.changeLuck();
                     }
                  }
                  break;
               case "zbwp":
                  if(_loc2_.getMyEquipObj().ename.indexOf("幸运") != -1 || _loc2_.getMyEquipObj().ename.indexOf("神恩") != -1)
                  {
                     if(_loc2_.getMyEquipObj().getFillName() == "wpxyf")
                     {
                        this.gc.putQhsInBackPack(this.player,_loc2_.getMyEquipObj().getFillName());
                        this.changeLuck();
                        break;
                     }
                     if(_loc2_.getMyEquipObj().getFillName() == "wpbdf")
                     {
                        this.gc.putQhsInBackPack(this.player,_loc2_.getMyEquipObj().getFillName());
                     }
                  }
            }
            this.getOutEquip();
            this.gc.eventManger.dispatchEvent(new CommonEvent("GETANDREFRESHBACKPACKAGE"));
            _loc2_ = null;
         }
      }
      
      private function findIfQHS() : Boolean
      {
         var _loc1_:int = 0;
         while(_loc1_ < 3)
         {
            if(this["qhmc" + (_loc1_ + 1)].getChildByName("curzb") != null)
            {
               return true;
            }
            _loc1_++;
         }
         return false;
      }
      
      private function qhClick(param1:MouseEvent) : void
      {
         if(this.gc.isHideDebug)
         {
            this.doStrength();
         }
         else
         {
            this.doStrength();
         }
      }
      
      private function doStrength() : void
      {
         var _loc1_:Number = Number(NaN);
         _loc1_ = Number(this.gc.allEquip.transLevelTNeedlh(this.curWepon.getMyEquipObj()));
         if(!this.findIfQHS())
         {
            return;
         }
         if(this.curWepon)
         {
            if(this.player.getLhValue() < _loc1_)
            {
               this.gc.ts.setTxt("灵魂不足");
               this.stage.addChild(this.gc.ts);
               return;
            }
            this.player.setLhValue(Number(this.player.getLhValue()) - _loc1_);
            StrengthEquipment(this.parent).setTxtlh();
            this.afterReadStore();
            this.clearAllThingExceptWeapen();
            this.curWepon = null;
            if(this.gc.isHideDebug)
            {
               this.gc.memory.setStorage(this.gc.saveId);
            }
         }
      }
      
      private function afterReadStore() : void
      {
         if(Math.random() < this.cobj.allpro)
         {
            this.gc.ts.setTxt("强化成功");
            this.curWepon.getMyEquipObj().upStrengthValue(1);
         }
         else
         {
            this.gc.ts.setTxt("强化失败");
            if(this.curWepon.getMyEquipObj().getStrengthValue() >= 3)
            {
               if(this.baodimc.getChildByName("curzb") == null)
               {
                  this.curWepon.getMyEquipObj().upStrengthValue(-1);
               }
            }
         }
         this.gc.stage.addChild(this.gc.ts);
      }
      
      private function clearAllThingExceptWeapen(param1:Boolean = true) : void
      {
         var _loc2_:Date = null;
         var _loc3_:* = null;
         var _loc4_:* = null;
         this.player.outlist = [];
         this.curWepon = null;
         this.cobj.allpro = 0;
         if(param1)
         {
            if(this.zbmc.getChildByName("curzb"))
            {
               _loc3_ = this.zbmc.getChildByName("curzb") as ShowObj;
               this.zbmc.removeChild(_loc3_);
               if(_loc3_.getMyEquipObj().type == "zbcb" || _loc3_.getMyEquipObj().type == "zbsz")
               {
                  this.player.szlist.push(_loc3_.getMyEquipObj());
               }
               else
               {
                  this.player.zblist.push(_loc3_.getMyEquipObj());
               }
               _loc3_ = null;
            }
         }
         else if(this.zbmc.getChildByName("curzb"))
         {
            _loc3_ = this.zbmc.getChildByName("curzb") as ShowObj;
            this.zbmc.removeChild(_loc3_);
            _loc3_ = null;
         }
         var _loc5_:* = "";
         _loc2_ = new Date();
         var _loc6_:int = int(_loc2_.getDate());
         var _loc7_:int = int(_loc2_.getHours());
         var _loc8_:int = int(_loc2_.getMinutes());
         var _loc9_:String = _loc6_ + "-" + _loc7_ + "-" + _loc8_;
         var _loc10_:int = 0;
         while(_loc10_ < 3)
         {
            if(this["qhmc" + (_loc10_ + 1)].getChildByName("curzb"))
            {
               _loc3_ = this["qhmc" + (_loc10_ + 1)].getChildByName("curzb") as ShowObj;
               _loc4_ = _loc3_.getMyEquipObj().getFillName();
               if(_loc4_.indexOf("wpqhs") != -1)
               {
                  _loc5_ += _loc4_.substr(5,1);
                  if(_loc10_ < 2)
                  {
                     _loc5_ += ",";
                  }
               }
               this["qhmc" + (_loc10_ + 1)].removeChild(_loc3_);
               _loc3_ = null;
            }
            _loc10_++;
         }
         if(_loc5_ != "")
         {
            if(this.gc.qhsInfo.length >= 10)
            {
               this.gc.qhsInfo.shift();
            }
            this.gc.qhsInfo.push(_loc9_ + "|" + _loc5_ + "|1");
         }
         if(this.luckmc.getChildByName("curzb"))
         {
            _loc3_ = this.luckmc.getChildByName("curzb") as ShowObj;
            this.luckmc.removeChild(_loc3_);
            _loc3_ = null;
         }
         if(this.baodimc.getChildByName("curzb"))
         {
            _loc3_ = this.baodimc.getChildByName("curzb") as ShowObj;
            this.baodimc.removeChild(_loc3_);
            _loc3_ = null;
         }
         this.gc.eventManger.dispatchEvent(new CommonEvent("GETANDREFRESHBACKPACKAGE"));
      }
      
      private function removedSelf() : void
      {
         var _loc1_:* = null;
         if(this.zbmc.getChildByName("curzb"))
         {
            _loc1_ = this.zbmc.getChildByName("curzb") as ShowObj;
            this.zbmc.removeChild(_loc1_);
            if(_loc1_.getMyEquipObj().type == "zbcb" || _loc1_.getMyEquipObj().type == "zbsz")
            {
               this.player.szlist.push(_loc1_.getMyEquipObj());
            }
            else
            {
               this.player.zblist.push(_loc1_.getMyEquipObj());
            }
            _loc1_ = null;
         }
         var _loc2_:int = 0;
         while(_loc2_ < 3)
         {
            if(this["qhmc" + (_loc2_ + 1)].getChildByName("curzb"))
            {
               _loc1_ = this["qhmc" + (_loc2_ + 1)].getChildByName("curzb") as ShowObj;
               this["qhmc" + (_loc2_ + 1)].removeChild(_loc1_);
               this.gc.putQhsInBackPack(this.player,_loc1_.getMyEquipObj().getFillName());
               _loc1_ = null;
            }
            _loc2_++;
         }
         if(this.luckmc.getChildByName("curzb"))
         {
            _loc1_ = this.luckmc.getChildByName("curzb") as ShowObj;
            this.luckmc.removeChild(_loc1_);
            this.gc.putQhsInBackPack(this.player,_loc1_.getMyEquipObj().getFillName());
            _loc1_ = null;
         }
         if(this.baodimc.getChildByName("curzb"))
         {
            _loc1_ = this.baodimc.getChildByName("curzb") as ShowObj;
            this.baodimc.removeChild(_loc1_);
            this.gc.putQhsInBackPack(this.player,_loc1_.getMyEquipObj().getFillName());
            _loc1_ = null;
         }
         this.gc.eventManger.dispatchEvent(new CommonEvent("GETANDREFRESHBACKPACKAGE"));
      }
   }
}

