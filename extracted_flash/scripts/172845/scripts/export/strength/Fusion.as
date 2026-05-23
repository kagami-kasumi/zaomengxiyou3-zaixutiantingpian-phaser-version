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
   
   public class Fusion extends Sprite
   {
      
      private var gc:Config;
      
      private var player:User;
      
      public var rlbtn:SimpleButton;
      
      public var material1:Sprite;
      
      public var material2:Sprite;
      
      public var material3:Sprite;
      
      public var produce:Sprite;
      
      public var preview:Sprite;
      
      private var produceEquipName:String = "";
      
      private var threeObj:Array;
      
      public var txt_name:TextField;
      
      public var txt_needlh:TextField;
      
      public var txt_success:TextField;
      
      public function Fusion(param1:User)
      {
         this.threeObj = new Array();
         super();
         this.player = param1;
         this.gc = Config.getInstance();
         this.addEventListener(Event.ADDED_TO_STAGE,this.added,false,0,true);
         this.addEventListener(Event.REMOVED_FROM_STAGE,this.removed,false,0,true);
      }
      
      private function added(param1:Event) : void
      {
         this.player.outlist = [];
         this.gc.eventManger.addEventListener("SimpleClick",this.receiveObj);
         this.rlbtn.addEventListener(MouseEvent.CLICK,this.makeClick);
         this.material1.addEventListener(MouseEvent.CLICK,this.onClick);
         this.material2.addEventListener(MouseEvent.CLICK,this.onClick);
         this.material3.addEventListener(MouseEvent.CLICK,this.onClick);
         this.produce.addEventListener(MouseEvent.CLICK,this.produceClick);
      }
      
      private function removed(param1:Event) : void
      {
         this.player.outlist = [];
         this.gc.eventManger.removeEventListener("SimpleClick",this.receiveObj);
         this.rlbtn.removeEventListener(MouseEvent.CLICK,this.makeClick);
         this.material1.removeEventListener(MouseEvent.CLICK,this.onClick);
         this.material2.removeEventListener(MouseEvent.CLICK,this.onClick);
         this.material3.removeEventListener(MouseEvent.CLICK,this.onClick);
         this.produce.removeEventListener(MouseEvent.CLICK,this.produceClick);
         this.removedSelf();
      }
      
      public function setRole(param1:User) : void
      {
         this.player = param1;
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
               case "zbtx":
                  if(this.gc.allEquip.isTheSameEquipmentByFillName(_loc2_.getMyEquipObj()))
                  {
                     this.player.zblist.push(_loc2_.getMyEquipObj());
                     break;
                  }
                  this.gc.ts.setTxt("null");
                  this.gc.stage.addChild(this.gc.ts);
                  break;
               case "zbsz":
                  this.player.szlist.push(_loc2_.getMyEquipObj());
                  break;
               case "wpqhs":
                  if(_loc2_.getMyEquipObj().ename.indexOf("强化石") != -1)
                  {
                     this.gc.putQhsInBackPack(this.player,_loc2_.getMyEquipObj().getFillName());
                  }
                  break;
               case "zbwp":
                  this.gc.putQhsInBackPack(this.player,_loc2_.getMyEquipObj().getFillName());
            }
            _loc2_ = null;
         }
         this.previewFun();
         this.gc.eventManger.dispatchEvent(new CommonEvent("REFRESHBACKPACK",[false]));
      }
      
      private function produceClick(param1:MouseEvent) : void
      {
         this.removedProduceEquipment();
      }
      
      private function removedProduceEquipment() : void
      {
         var _loc1_:* = null;
         if(this.produce.getChildByName("curzb") != null)
         {
            _loc1_ = this.produce.getChildByName("curzb") as ShowObj;
            this.produce.removeChild(_loc1_);
            _loc1_ = null;
         }
      }
      
      private function receiveObj(param1:CommonEvent) : void
      {
         var _loc2_:ShowObj = param1.data[0] as ShowObj;
         switch(_loc2_.getMyEquipObj().type)
         {
            case "zbwq":
            case "zbfj":
            case "zbsp":
            case "zbfb":
            case "zbtx":
            case "":
               if(this.material1.numChildren < 2)
               {
                  this.material1.addChild(_loc2_);
                  this.removeEquipFormBack(_loc2_.getMyEquipObj(),1);
                  break;
               }
               if(this.material2.numChildren < 2)
               {
                  this.material2.addChild(_loc2_);
                  this.removeEquipFormBack(_loc2_.getMyEquipObj(),1);
                  break;
               }
               if(this.material3.numChildren < 2)
               {
                  this.material3.addChild(_loc2_);
                  this.removeEquipFormBack(_loc2_.getMyEquipObj(),1);
               }
               break;
            case "zbsz":
               if(this.material1.numChildren < 2)
               {
                  this.material1.addChild(_loc2_);
                  this.removeEquipFormBack(_loc2_.getMyEquipObj(),3);
                  break;
               }
               if(this.material2.numChildren < 2)
               {
                  this.material2.addChild(_loc2_);
                  this.removeEquipFormBack(_loc2_.getMyEquipObj(),3);
                  break;
               }
               if(this.material3.numChildren < 2)
               {
                  this.material3.addChild(_loc2_);
                  this.removeEquipFormBack(_loc2_.getMyEquipObj(),3);
               }
               break;
            case "wpqhs":
            case "zbwp":
               if(this.material1.numChildren < 2)
               {
                  this.material1.addChild(_loc2_);
                  this.removeEquipFormBack(_loc2_.getMyEquipObj(),2);
                  break;
               }
               if(this.material2.numChildren < 2)
               {
                  this.material2.addChild(_loc2_);
                  this.removeEquipFormBack(_loc2_.getMyEquipObj(),2);
                  break;
               }
               if(this.material3.numChildren < 2)
               {
                  this.material3.addChild(_loc2_);
                  this.removeEquipFormBack(_loc2_.getMyEquipObj(),2);
               }
         }
         this.previewFun();
         this.removedProduceEquipment();
      }
      
      private function previewFun() : void
      {
         var _loc1_:* = undefined;
         this.txt_name.text = "";
         if(this.preview.getChildByName("view") != null)
         {
            this.preview.removeChild(this.preview.getChildByName("view"));
         }
         this.getThreeObj();
         var _loc2_:Array = this.gc.allEquip.mixProduce(this.threeObj);
         this.produceEquipName = _loc2_[0];
         if(this.produceEquipName.indexOf("wpqhs") != -1 || this.produceEquipName.indexOf("sms") != -1 || this.produceEquipName.indexOf("mfs") != -1 || this.produceEquipName.indexOf("gjs") != -1 || this.produceEquipName.indexOf("fys") != -1)
         {
            this.txt_needlh.text = "1000";
            this.txt_success.text = "100%";
         }
         else
         {
            this.txt_needlh.text = "1000";
            this.txt_success.text = "100%";
         }
         if(this.produceEquipName != "")
         {
            if(this.produceEquipName == "zylhys")
            {
               _loc1_ = AUtils.getImageObj("lhys");
            }
            else if(this.produceEquipName == "zxptzzzs")
            {
               _loc1_ = AUtils.getImageObj("zxstgzzs");
            }
            else if(this.produceEquipName == "zxptyzzs")
            {
               _loc1_ = AUtils.getImageObj("zxstgzzs");
            }
            else if(this.produceEquipName == "zxztkzzs")
            {
               _loc1_ = AUtils.getImageObj("zxstgzzs");
            }
            else if(this.produceEquipName == "zxztpzzs")
            {
               _loc1_ = AUtils.getImageObj("zxstgzzs");
            }
            else if(this.produceEquipName == "zxqtczzs")
            {
               _loc1_ = AUtils.getImageObj("zxstgzzs");
            }
            else if(this.produceEquipName == "zxqtszzs")
            {
               _loc1_ = AUtils.getImageObj("zxstgzzs");
            }
            else if(this.produceEquipName == "zxztjzzs")
            {
               _loc1_ = AUtils.getImageObj("zxstgzzs");
            }
            else if(this.produceEquipName == "zxttpzzs")
            {
               _loc1_ = AUtils.getImageObj("zxstgzzs");
            }
            else if(this.produceEquipName == "sqmdcqgzzs")
            {
               _loc1_ = AUtils.getImageObj("zxstgzzs");
            }
            else if(this.produceEquipName == "sqmdcqg")
            {
               _loc1_ = AUtils.getImageObj("sqcqg");
            }
            else if(this.produceEquipName == "cs_wq_glzzs")
            {
               _loc1_ = AUtils.getImageObj("cs_wq_qszzs");
            }
            else if(this.produceEquipName == "cs_fj_tlzzs")
            {
               _loc1_ = AUtils.getImageObj("cs_fj_dzzzs");
            }
            else if(this.produceEquipName == "xlnyzzs")
            {
               _loc1_ = AUtils.getImageObj("xlthzzs");
            }
            else if(this.produceEquipName == "xltqzzs")
            {
               _loc1_ = AUtils.getImageObj("xlthzzs");
            }
            else if(this.produceEquipName == "_cljzzs")
            {
               _loc1_ = AUtils.getImageObj("qlgzzs");
            }
            else if(this.produceEquipName == "clpzzs")
            {
               _loc1_ = AUtils.getImageObj("qljzzs");
            }
            else
            {
               _loc1_ = AUtils.getImageObj(this.produceEquipName);
            }
            _loc1_.name = "view";
            this.preview.addChild(_loc1_);
            this.txt_name.text = _loc2_[1];
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
         this.gc.eventManger.dispatchEvent(new CommonEvent("REFRESHBACKPACK",[false]));
      }
      
      private function getProduce() : void
      {
         var _loc1_:* = this.produce.getChildByName("curzb") as ShowObj;
         if(_loc1_ != null)
         {
            if(_loc1_.getMyEquipObj().type == "zbfb" || _loc1_.getMyEquipObj().type == "zbwq" || _loc1_.getMyEquipObj().type == "zbfj" || _loc1_.getMyEquipObj().type == "zbsp" || _loc1_.getMyEquipObj().type == "zbtx")
            {
               this.player.zblist.push(_loc1_.getMyEquipObj());
            }
            else if(_loc1_.getMyEquipObj().type == "wpqhs" || _loc1_.getMyEquipObj().type == "zbwp")
            {
               this.gc.putQhsInBackPack(this.player,_loc1_.getMyEquipObj().getFillName());
            }
            else if(_loc1_.getMyEquipObj().type == "zbsz")
            {
               this.player.szlist.push(_loc1_.getMyEquipObj());
            }
            _loc1_ = null;
         }
         this.gc.eventManger.dispatchEvent(new CommonEvent("GETANDREFRESHBACKPACKAGE"));
      }
      
      private function getThreeObj() : void
      {
         var _loc1_:* = null;
         this.threeObj = [];
         this.player.outlist = [];
         var _loc2_:int = 0;
         while(_loc2_ < 3)
         {
            if(this["material" + (_loc2_ + 1)].getChildByName("curzb"))
            {
               _loc1_ = this["material" + (_loc2_ + 1)].getChildByName("curzb") as ShowObj;
               this.threeObj.push(_loc1_.getMyEquipObj());
               this.player.outlist.push({
                  "dequip":_loc1_.getMyEquipObj(),
                  "count":1
               });
               _loc1_ = null;
            }
            _loc2_++;
         }
      }
      
      private function removeThreeObj() : void
      {
         var _loc1_:Date = null;
         var _loc2_:* = null;
         var _loc3_:* = null;
         this.threeObj = [];
         this.player.outlist = [];
         this.txt_success.text = "";
         var _loc4_:* = "";
         _loc1_ = new Date();
         var _loc5_:int = int(_loc1_.getDate());
         var _loc6_:int = int(_loc1_.getHours());
         var _loc7_:int = int(_loc1_.getMinutes());
         var _loc8_:String = _loc5_ + "-" + _loc6_ + "-" + _loc7_;
         var _loc9_:int = 0;
         while(_loc9_ < 3)
         {
            if(this["material" + (_loc9_ + 1)].getChildByName("curzb"))
            {
               _loc2_ = this["material" + (_loc9_ + 1)].getChildByName("curzb") as ShowObj;
               _loc3_ = _loc2_.getMyEquipObj().getFillName();
               if(_loc3_.indexOf("wpqhs") != -1)
               {
                  _loc4_ += _loc3_.substr(5,1);
                  if(_loc9_ < 2)
                  {
                     _loc4_ += ",";
                  }
               }
               _loc2_ = this["material" + (_loc9_ + 1)].removeChild(_loc2_);
               _loc2_ = null;
            }
            _loc9_++;
         }
         if(_loc4_ != "")
         {
            if(this.gc.qhsInfo.length >= 10)
            {
               this.gc.qhsInfo.shift();
            }
            this.gc.qhsInfo.push(_loc8_ + "|" + _loc4_ + "|2");
         }
      }
      
      private function getAndRemovedEquip() : void
      {
         this.removeThreeObj();
         this.getProduce();
      }
      
      private function makeClick(param1:MouseEvent) : void
      {
         if(this.gc.isHideDebug)
         {
            this.doFusion();
         }
         else
         {
            this.doFusion();
         }
      }
      
      private function doFusion() : void
      {
         var _loc1_:* = null;
         var _loc2_:* = null;
         this.rlbtn.enabled = false;
         if(this.produceEquipName != "")
         {
            this.gc.allEquip.reNewAll();
            if(this.player.getLhValue() < 1000)
            {
               this.gc.ts.setTxt("灵魂值不够");
               this.gc.stage.addChild(this.gc.ts);
               this.rlbtn.enabled = true;
               return;
            }
            this.player.setLhValue(this.player.getLhValue() - 1000);
            if(this.produceEquipName.indexOf("wpqhs") != -1 || this.produceEquipName.indexOf("sms") != -1 || this.produceEquipName.indexOf("mfs") != -1 || this.produceEquipName.indexOf("gjs") != -1 || this.produceEquipName.indexOf("fys") != -1)
            {
               this.afterReadStore();
            }
            else
            {
               StrengthEquipment(this.parent).setTxtlh();
               if(this.produceEquipName == "undefined1" || this.produceEquipName.indexOf("zzs") != -1)
               {
                  _loc1_ = this.gc.allEquip.findByName(this.produceEquipName);
               }
               else if(this.produceEquipName == "_dzj" || this.produceEquipName == "dzjj" || this.produceEquipName == "hy")
               {
                  _loc1_ = this.gc.allEquip.getSunSutraValueEquip(this.produceEquipName,this.threeObj);
               }
               else if(this.produceEquipName == "yxfb")
               {
                  _loc1_ = this.gc.allEquip.findByName(this.produceEquipName);
               }
               else if(this.produceEquipName == "tjbg")
               {
                  _loc1_ = this.gc.allEquip.findByName(this.produceEquipName);
               }
               else if(this.produceEquipName == "fbqpj")
               {
                  _loc1_ = this.gc.allEquip.findByName(this.produceEquipName);
               }
               else if(this.gc.allEquip.isFashionEquipByFillName(this.produceEquipName))
               {
                  _loc1_ = this.gc.allEquip.findByName(this.produceEquipName);
                  _loc1_.setFashionTime(this.gc.curdate);
               }
               else if(this.produceEquipName.indexOf("sq") != -1)
               {
                  _loc1_ = this.gc.allEquip.getShenzhuValue(this.produceEquipName,this.threeObj);
               }
               else if(this.produceEquipName == "mdhy")
               {
                  _loc1_ = this.gc.allEquip.getMingDingHuaYanEquip(this.produceEquipName,this.threeObj);
               }
               else
               {
                  _loc1_ = this.gc.allEquip.getSutraValue(this.produceEquipName,this.threeObj);
               }
               _loc2_ = new ShowObj(_loc1_);
               this.produce.addChild(_loc2_);
               this.gc.ts.setTxt("合成成功");
               this.gc.eventManger.dispatchEvent(new CommonEvent("RefreshLHValue"));
               this.produceEquipName = "";
               this.gc.stage.addChild(this.gc.ts);
               this.getAndRemovedEquip();
            }
         }
         this.rlbtn.enabled = true;
         if(this.preview.getChildByName("view") != null)
         {
            this.preview.removeChild(this.preview.getChildByName("view"));
         }
      }
      
      private function afterReadStore() : void
      {
         var _loc1_:MyEquipObj = this.gc.allEquip.findByName(this.produceEquipName);
         var _loc2_:ShowObj = new ShowObj(_loc1_);
         this.produce.addChild(_loc2_);
         this.gc.ts.setTxt("合成成功");
         this.produceEquipName = "";
         this.gc.stage.addChild(this.gc.ts);
         this.getAndRemovedEquip();
      }
      
      private function removedSelf() : void
      {
         var _loc1_:* = null;
         this.removedProduceEquipment();
         var _loc2_:int = 0;
         while(_loc2_ < 3)
         {
            if(this["material" + (_loc2_ + 1)].getChildByName("curzb"))
            {
               _loc1_ = this["material" + (_loc2_ + 1)].getChildByName("curzb") as ShowObj;
               this["material" + (_loc2_ + 1)].removeChild(_loc1_);
               if(_loc1_.getMyEquipObj().type == "zbwq" || _loc1_.getMyEquipObj().type == "zbfj" || _loc1_.getMyEquipObj().type == "zbsp" || _loc1_.getMyEquipObj().type == "zbtx" || _loc1_.getMyEquipObj().type == "zbfb")
               {
                  this.player.zblist.push(_loc1_.getMyEquipObj());
               }
               else if(_loc1_.getMyEquipObj().type == "wpqhs" || _loc1_.getMyEquipObj().type == "zbwp")
               {
                  this.gc.putQhsInBackPack(this.player,_loc1_.getMyEquipObj().getFillName());
               }
               else if(_loc1_.getMyEquipObj().type == "zbsz")
               {
                  this.player.szlist.push(_loc1_.getMyEquipObj());
               }
               _loc1_ = null;
            }
            _loc2_++;
         }
         this.gc.eventManger.dispatchEvent(new CommonEvent("GETANDREFRESHBACKPACKAGE"));
      }
      
      private function helpClick(param1:MouseEvent) : void
      {
         var _loc2_:* = null;
         if(this.getChildByName("fusionHelp") == null)
         {
            _loc2_ = AUtils.getNewObj("export.strength.FusionHelp") as FusionHelp;
            _loc2_.name = "fusionHelp";
            _loc2_.x = 102;
            _loc2_.y = 40;
            this.addChild(_loc2_);
         }
      }
   }
}

