package export.saveInterface
{
   import FileHandler.*;
   import config.*;
   import event.*;
   import flash.display.*;
   import flash.events.*;
   import flash.system.*;
   import flash.text.TextField;
   import flash.text.TextFormat;
   import flash.utils.*;
   import my.*;
   
   public class SaveInter extends Sprite
   {
      
      private var gc:Config;
      
      private var iscover:Sprite;
      
      private var index:int;
      
      private var gameData:Object;
      
      public var state:String = "";
      
      public var btn_x:SimpleButton;
      
      public var btn_1:MovieClip;
      
      public var btn_2:MovieClip;
      
      public var btn_3:MovieClip;
      
      public var btn_4:MovieClip;
      
      public var btn_5:MovieClip;
      
      public var btn_0:MovieClip;
      
      public var infotxt:TextField;
      
      public function SaveInter(param1:String = "read")
      {
         super();
         this.gc = Config.getInstance();
         this.state = param1;
         this.addEventListener(Event.ADDED_TO_STAGE,this.added,false,0,true);
         this.addEventListener(Event.REMOVED_FROM_STAGE,this.removed,false,0,true);
      }
      
      private function added(param1:*) : void
      {
         var _loc2_:* = undefined;
         if(!this.iscover)
         {
            this.iscover = AUtils.getNewObj("IsCover");
         }
         if(this.gc.isnew)
         {
            this.infotxt.text = "第一次进入游戏请选择存档";
         }
         else
         {
            this.infotxt.text = "";
         }
         this.btn_1.buttonMode = true;
         this.btn_2.buttonMode = true;
         this.btn_3.buttonMode = true;
         this.btn_4.buttonMode = true;
         this.btn_5.buttonMode = true;
         this.btn_0.buttonMode = true;
         this.btn_x.addEventListener(MouseEvent.CLICK,this.xClick);
         this.btn_1.addEventListener(MouseEvent.CLICK,this.onClick);
         this.btn_2.addEventListener(MouseEvent.CLICK,this.onClick);
         this.btn_3.addEventListener(MouseEvent.CLICK,this.onClick);
         this.btn_4.addEventListener(MouseEvent.CLICK,this.onClick);
         this.btn_5.addEventListener(MouseEvent.CLICK,this.onClick);
         this.btn_0.addEventListener(MouseEvent.CLICK,this.onClick);
         this.btn_1.addEventListener(MouseEvent.ROLL_OVER,this.over);
         this.btn_2.addEventListener(MouseEvent.ROLL_OVER,this.over);
         this.btn_3.addEventListener(MouseEvent.ROLL_OVER,this.over);
         this.btn_4.addEventListener(MouseEvent.ROLL_OVER,this.over);
         this.btn_5.addEventListener(MouseEvent.ROLL_OVER,this.over);
         this.btn_0.addEventListener(MouseEvent.ROLL_OVER,this.over);
         this.btn_1.addEventListener(MouseEvent.ROLL_OUT,this.out);
         this.btn_2.addEventListener(MouseEvent.ROLL_OUT,this.out);
         this.btn_3.addEventListener(MouseEvent.ROLL_OUT,this.out);
         this.btn_4.addEventListener(MouseEvent.ROLL_OUT,this.out);
         this.btn_5.addEventListener(MouseEvent.ROLL_OUT,this.out);
         this.btn_0.addEventListener(MouseEvent.ROLL_OUT,this.out);
         this.refreshList();
      }
      
      private function removed(param1:*) : void
      {
         this.btn_x.removeEventListener(MouseEvent.CLICK,this.xClick);
         this.btn_1.removeEventListener(MouseEvent.CLICK,this.onClick);
         this.btn_2.removeEventListener(MouseEvent.CLICK,this.onClick);
         this.btn_3.removeEventListener(MouseEvent.CLICK,this.onClick);
         this.btn_4.removeEventListener(MouseEvent.CLICK,this.onClick);
         this.btn_5.removeEventListener(MouseEvent.CLICK,this.onClick);
         this.btn_0.removeEventListener(MouseEvent.CLICK,this.onClick);
         this.btn_1.removeEventListener(MouseEvent.ROLL_OVER,this.over);
         this.btn_2.removeEventListener(MouseEvent.ROLL_OVER,this.over);
         this.btn_3.removeEventListener(MouseEvent.ROLL_OVER,this.over);
         this.btn_4.removeEventListener(MouseEvent.ROLL_OVER,this.over);
         this.btn_5.removeEventListener(MouseEvent.ROLL_OVER,this.over);
         this.btn_0.removeEventListener(MouseEvent.ROLL_OVER,this.over);
         this.btn_1.removeEventListener(MouseEvent.ROLL_OUT,this.out);
         this.btn_2.removeEventListener(MouseEvent.ROLL_OUT,this.out);
         this.btn_3.removeEventListener(MouseEvent.ROLL_OUT,this.out);
         this.btn_4.removeEventListener(MouseEvent.ROLL_OUT,this.out);
         this.btn_5.removeEventListener(MouseEvent.ROLL_OUT,this.out);
         this.btn_0.removeEventListener(MouseEvent.ROLL_OUT,this.out);
         if(this.infotxt.text.indexOf("有新版本") != -1)
         {
            this.infotxt.removeEventListener(MouseEvent.CLICK,this.showNewInfo);
         }
      }
      
      private function over(param1:MouseEvent) : void
      {
         MovieClip(param1.target).gotoAndStop(2);
      }
      
      private function out(param1:MouseEvent) : void
      {
         MovieClip(param1.target).gotoAndStop(1);
      }
      
      private function refreshList() : void
      {
         var _loc2_:* = undefined;
         var _loc3_:Object = null;
         var _loc4_:Function = null;
         var _loc5_:TextFormat = null;
         var _loc1_:int = 0;
         while(_loc1_ < 6)
         {
            this["btn_" + _loc1_]["txt_name"]["text"] = "空存档";
            this["btn_" + _loc1_]["txt_time"]["text"] = "";
            _loc1_++;
         }
         _loc3_ = new Object();
         _loc1_ = 0;
         while(_loc1_ < 6)
         {
            try
            {
               _loc3_[_loc1_] = fileHandler.read(fileHandler.getAppFloderFileUrl("gameData/" + _loc1_ + ".sav"));
               if(_loc3_[_loc1_])
               {
                  _loc3_[_loc1_] = this.decryptDataAndGetInfo(_loc3_[_loc1_]);
               }
               if(_loc3_[_loc1_])
               {
                  _loc4_ = function(param1:int):String
                  {
                     switch(param1)
                     {
                        case 1:
                           return "悟空";
                        case 2:
                           return "唐僧";
                        case 3:
                           return "八戒";
                        case 4:
                           return "沙僧";
                        case 5:
                           return "白龙";
                        default:
                           return "";
                     }
                  };
                  this["btn_" + _loc1_]["txt_name"]["selectable"] = false;
                  this["btn_" + _loc1_]["txt_time"]["selectable"] = false;
                  this["btn_" + _loc1_]["txt_name"]["text"] = _loc4_.call(null,_loc3_[_loc1_]["player1_obj"]["roleid"]) + "(" + _loc3_[_loc1_]["player1_obj"]["curLevel"] + "级)";
                  _loc5_ = this["btn_" + _loc1_]["txt_name"]["defaultTextFormat"];
                  if(_loc3_[_loc1_]["playerNum"] - 1)
                  {
                     if(!_loc3_[_loc1_]["player2_obj"])
                     {
                        throw "invalid data";
                     }
                     _loc5_.size = 17;
                     this["btn_" + _loc1_]["txt_name"]["text"] += " " + _loc4_.call(null,_loc3_[_loc1_]["player2_obj"]["roleid"]) + "(" + _loc3_[_loc1_]["player2_obj"]["curLevel"] + "级)";
                     this["btn_" + _loc1_]["txt_name"].setTextFormat(_loc5_,0,this["btn_" + _loc1_]["txt_name"]["text"]["length"]);
                  }
                  this["btn_" + _loc1_]["txt_time"]["text"] = _loc3_[_loc1_]["player1_obj"]["saveDate"];
               }
            }
            catch(e:Error)
            {
            }
            _loc1_++;
         }
         this.gameData = _loc3_;
      }
      
      public function clearTxt() : void
      {
         var _loc1_:int = 0;
         while(_loc1_ < 6)
         {
            this["btn_" + _loc1_]["txt_name"]["text"] = "空存档";
            this["btn_" + _loc1_]["txt_time"]["text"] = "";
            _loc1_++;
         }
      }
      
      private function onClick(param1:MouseEvent) : void
      {
         this.index = int(String(param1.currentTarget.name).substr(4,1));
         if(this.state == "save")
         {
            if(param1.currentTarget["txt_name"]["text"] as String != "空存档")
            {
               this.addChild(this.iscover);
               this.iscover.name = "iscover";
               this.iscover["btn_ok"].addEventListener(MouseEvent.CLICK,this.okClick);
               this.iscover["btn_change"].addEventListener(MouseEvent.CLICK,this.changeClick);
            }
            else
            {
               this.saveGame(this.index);
               this.gc.alert("存档成功！");
               this.destory();
               this.gc.difficulity = 0;
               GMain.getInstance().switchSence("GameMenu");
               this.gc.initData();
               this.gc.eventManger.dispatchEvent(new CommonEvent("ShowOtherScene"));
            }
         }
         else if(this.state == "read")
         {
            if(param1.currentTarget["txt_name"]["text"] as String != "空存档")
            {
               this.gc.memory.storageValue(0,this.gameData[this.index]);
               this.gc.saveId = this.index;
               if(parent)
               {
                  parent.showAndHide();
               }
               this.destory();
            }
         }
      }
      
      private function okClick(param1:*) : void
      {
         this.iscover["btn_ok"].removeEventListener(MouseEvent.CLICK,this.okClick);
         this.iscover["btn_change"].removeEventListener(MouseEvent.CLICK,this.changeClick);
         if(getChildByName("iscover") != null)
         {
            this.removeChild(this.iscover);
         }
         this.saveGame(this.index);
         this.gc.alert("存档成功！请重新登录！");
         this.destory();
         this.gc.difficulity = 0;
         GMain.getInstance().switchSence("GameMenu");
         this.gc.initData();
         this.gc.eventManger.dispatchEvent(new CommonEvent("ShowOtherScene"));
      }
      
      private function changeClick(param1:*) : void
      {
         this.iscover["btn_ok"].removeEventListener(MouseEvent.CLICK,this.okClick);
         this.iscover["btn_change"].removeEventListener(MouseEvent.CLICK,this.changeClick);
         if(getChildByName("iscover") != null)
         {
            this.removeChild(this.iscover);
         }
      }
      
      private function decryptDataAndGetInfo(param1:String) : Object
      {
         var _loc2_:ByteArray = null;
         var _loc3_:int = 0;
         if(!param1)
         {
            return null;
         }
         _loc2_ = this.gc.decrypt(param1);
         _loc3_ = 0;
         while(_loc3_ < 10)
         {
            try
            {
               _loc2_.uncompress();
               _loc3_++;
            }
            catch(e:*)
            {
               break;
            }
         }
         return new savetrans().decXml(_loc2_.readObject() as String);
      }
      
      public function saveGame(param1:int) : void
      {
         this.gc.memory.saveGame(param1);
      }
      
      private function showNewInfo(param1:MouseEvent) : void
      {
         var _loc2_:* = undefined;
         var _loc3_:* = undefined;
         _loc2_ = getDefinitionByName("com.dusk.AUtils::fileHandler");
         if(_loc2_)
         {
            _loc3_ = getDefinitionByName("com.dusk.game::allConst");
            if(_loc3_)
            {
               if(_loc3_["NEW_VER_INFO"]["newInfo"])
               {
                  _loc2_.write("新版更新内容：" + String(_loc3_["NEW_VER_INFO"]["newInfo"]),_loc2_.getAppFloderFileUrl("gameData/newInfo.ini"));
                  _loc2_.start("C:/Windows/System32/notepad.exe",_loc2_.getAppFloderFileUrl("gameData/newInfo.ini"));
               }
            }
         }
      }
      
      private function xClick(param1:MouseEvent) : void
      {
         this.destory();
      }
      
      private function destory() : void
      {
         this.gameData = null;
         this.iscover = null;
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
      }
   }
}

