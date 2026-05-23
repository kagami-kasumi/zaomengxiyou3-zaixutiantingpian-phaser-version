package export.muti
{
   import com.multi4399.*;
   import com.multi4399.keys.*;
   import config.*;
   import export.ChatSprite;
   import export.muti.MyComponent.*;
   import flash.display.*;
   import flash.events.*;
   import flash.net.*;
   import flash.text.TextField;
   import flash.utils.*;
   
   public class ArenaSprite extends Sprite
   {
      
      public static var ARENASPRITE_MODE_ALL:uint = 0;
      
      public static var ARENASPRITE_MODE_1V1:uint = 1;
      
      public static var ARENASPRITE_MODE_HUNZHAN:uint = 2;
      
      private var gc:Config;
      
      public var pageSize:uint = 6;
      
      public var pageIndex:uint = 0;
      
      public var curChildNodeMaxVis:uint = 0;
      
      public var curNodeMaxVisitors:uint = 0;
      
      public var curNodeNumChildren:uint = 0;
      
      private var roomArray:Array;
      
      private var refreshTimer:Timer;
      
      private var posArray:Array;
      
      public var prePageBtn:SimpleButton;
      
      public var nextPageBtn:SimpleButton;
      
      public var backBtn:SimpleButton;
      
      public var createRoomBtn:SimpleButton;
      
      public var roomNameInput:TextField;
      
      public var chatSprite:ChatSprite;
      
      public var RoomList:MovieClip;
      
      public var modeChooseFilterMCB:MyComboBox;
      
      public var modeChooseCreateMCB:MyComboBox;
      
      public var group:MovieClip;
      
      public function ArenaSprite()
      {
         this.roomArray = [];
         this.refreshTimer = new Timer(25 * 60);
         this.posArray = [[100,115],[475,115],[100,195],[475,195],[100,275],[475,275]];
         super();
         this.gc = Config.getInstance();
         this.backBtn.addEventListener(MouseEvent.CLICK,this.__back);
         this.createRoomBtn.addEventListener(MouseEvent.CLICK,this.__createRoom);
         this.prePageBtn.addEventListener(MouseEvent.CLICK,this.__prePage);
         this.nextPageBtn.addEventListener(MouseEvent.CLICK,this.__nextPage);
         this.group.buttonMode = true;
         this.group.addEventListener(MouseEvent.CLICK,this.__gotoGroup);
         this.modeChooseFilterMCB = new MyComboBox();
         this.modeChooseFilterMCB.setData([{
            "label":MyComboBox.MYCOMBOBOX_ALL,
            "value":ARENASPRITE_MODE_ALL
         },{
            "label":MyComboBox.MYCOMBOBOX_HUNZHAN,
            "value":ARENASPRITE_MODE_1V1
         },{
            "label":MyComboBox.MYCOMBOBOX_DANTIAO,
            "value":ARENASPRITE_MODE_HUNZHAN
         }]);
         this.modeChooseFilterMCB.x = 230 + this.modeChooseFilterMCB.width / 2;
         this.modeChooseFilterMCB.y = 69 + this.modeChooseFilterMCB.height / 2;
         this.addChild(this.modeChooseFilterMCB);
         this.modeChooseCreateMCB = new MyComboBox();
         this.modeChooseCreateMCB.setData([{
            "label":MyComboBox.MYCOMBOBOX_DANTIAO,
            "value":ARENASPRITE_MODE_1V1
         },{
            "label":MyComboBox.MYCOMBOBOX_HUNZHAN,
            "value":ARENASPRITE_MODE_HUNZHAN
         }]);
         this.modeChooseCreateMCB.x = 595 + this.modeChooseCreateMCB.width / 2;
         this.modeChooseCreateMCB.y = 446 + this.modeChooseCreateMCB.height / 2;
         this.addChild(this.modeChooseCreateMCB);
         if(this.gc.logInfo)
         {
            this.roomNameInput.text = this.gc.logInfo.name + " 的房间";
         }
         else
         {
            this.roomNameInput.text = this.gc.sid + " 的房间";
         }
         this.refreshTimer.addEventListener(TimerEvent.TIMER,this.__timer);
         this.refreshTimer.start();
      }
      
      private function __gotoGroup(param1:MouseEvent) : void
      {
         navigateToURL(new URLRequest("http://my.4399.com/space-199596142-do-thread-id-2360329-tagid-80615.html"),"_blank");
      }
      
      private function __prePage(param1:MouseEvent) : void
      {
         if(this.pageIndex > 0)
         {
            --this.pageIndex;
         }
      }
      
      private function __nextPage(param1:MouseEvent) : void
      {
         if(this.pageIndex < this.curNodeNumChildren)
         {
            ++this.pageIndex;
         }
      }
      
      private function __back(param1:MouseEvent) : void
      {
         this.destroy();
      }
      
      private function __timer(param1:TimerEvent) : void
      {
         if(Boolean(this.gc.server) && Boolean(this.gc.isServerOk))
         {
            this.gc.server.ins_get_page(this.pageSize,this.pageIndex,2);
            this.gc.server.ins_set_return_to_param(2,true);
            this.gc.server.ins_get_children(Number(NK.INDEX) | Number(NK.DATA) | Number(NK.NUM_VISITORS) | Number(NK.LTD_VISITORS),new ByteArray());
            this.gc.server.submit(272);
         }
      }
      
      public function continueTimer() : void
      {
         this.refreshTimer.start();
      }
      
      public function __lineClick(param1:MouseEvent) : void
      {
         var _loc2_:* = null;
         var _loc3_:* = 0;
         var _loc4_:* = null;
         var _loc5_:RoomTitle = param1.currentTarget as RoomTitle;
         if(this.gc.getPlayerArray().length != _loc5_.getPlayersPerId())
         {
            this.gc.ts.setTxt("进入房间失败-->游戏人数模式不对!");
            this.gc.stage.addChild(this.gc.ts);
            return;
         }
         if(Boolean(this.gc.server) && Boolean(this.gc.isServerOk))
         {
            this.refreshTimer.stop();
            _loc2_ = _loc5_.name;
            this.gc.chooseMap = _loc5_.getMapInfo();
            _loc3_ = uint(parseInt(_loc2_));
            this.gc.server.ins_enter_child(_loc3_,2);
            this.gc.server.ins_get_node(NK.LEVEL);
            this.gc.server.ins_get_node(NK.DATA);
            this.gc.server.ins_get_node(NK.NUM_VISITORS);
            this.gc.server.ins_get_node(NK.LTD_VISITORS);
            this.gc.server.ins_get_node(NK.MAX_VISITORS);
            this.gc.server.submit(258);
            _loc4_ = new Sprite();
            _loc4_.name = "mask";
            _loc4_.graphics.beginFill(16777215,0.5);
            _loc4_.graphics.drawRect(0,0,940,590);
            _loc4_.graphics.endFill();
            this.addChild(_loc4_);
         }
      }
      
      public function refreshData(param1:ResponseEvent) : void
      {
         var _loc2_:* = null;
         var _loc3_:int = 0;
         var _loc4_:* = null;
         var _loc5_:int = 0;
         var _loc6_:* = 0;
         var _loc7_:* = 0;
         var _loc8_:* = null;
         var _loc9_:* = 0;
         var _loc10_:* = null;
         var _loc11_:* = 0;
         var _loc12_:* = 0;
         var _loc13_:Array = Utils.byte2_to_ints(param1.values[0]);
         for each(_loc2_ in this.roomArray)
         {
            if(this.RoomList.contains(_loc2_))
            {
               this.RoomList.removeChild(_loc2_);
            }
         }
         this.roomArray.length = 0;
         _loc3_ = int(_loc13_.length);
         _loc5_ = 0;
         while(_loc5_ < _loc3_)
         {
            _loc6_ = uint(parseInt(param1.values[_loc5_ * 4 + 3].toString().split(",")[1]));
            if(!(this.modeChooseFilterMCB.getCurValue() != ARENASPRITE_MODE_ALL && this.modeChooseFilterMCB.getCurValue() != _loc6_))
            {
               if(this.roomArray[_loc5_] == undefined || !this.roomArray[_loc5_])
               {
                  _loc4_ = new RoomTitle();
                  _loc4_.mouseChildren = false;
                  _loc4_.buttonMode = true;
                  _loc4_.addEventListener(MouseEvent.CLICK,this.__lineClick);
                  _loc7_ = uint(Number(this.roomArray.length) % 6);
                  _loc8_ = this.posArray[_loc7_];
                  _loc4_.x = Number(_loc8_[0]) - this.RoomList.x;
                  _loc4_.y = Number(_loc8_[1]) - this.RoomList.y;
                  _loc4_.buttonMode = true;
                  _loc4_.setMaxPlayerNum(this.curNodeMaxVisitors);
                  this.RoomList.addChild(_loc4_);
                  this.roomArray.push(_loc4_);
                  _loc9_ = uint(param1.values[_loc5_ * 4 + 2]);
                  _loc4_.name = _loc9_.toString();
                  _loc10_ = param1.values[_loc5_ * 4 + 3];
                  _loc11_ = uint(param1.values[_loc5_ * 4 + 4]);
                  _loc12_ = uint(param1.values[_loc5_ * 4 + 5]);
                  _loc4_.updateInfo(_loc9_,_loc11_,_loc12_,_loc10_);
               }
            }
            _loc5_++;
         }
      }
      
      public function joinOrCreateFail() : void
      {
         var _loc1_:Sprite = this.getChildByName("mask") as Sprite;
         if(_loc1_)
         {
            this.removeChild(_loc1_);
         }
      }
      
      private function __createRoom(param1:MouseEvent) : void
      {
         var _loc2_:int = 0;
         switch(this.modeChooseCreateMCB.getCurValue())
         {
            case ARENASPRITE_MODE_1V1:
               _loc2_ = 2;
               break;
            case ARENASPRITE_MODE_HUNZHAN:
               _loc2_ = 4;
               break;
            default:
               _loc2_ = 99999;
         }
         this.gc.chooseMap = 1;
         this.gc.createRoom([this.roomNameInput.text,this.modeChooseCreateMCB.getCurValue(),this.gc.chooseMap],_loc2_);
         var _loc3_:Sprite = new Sprite();
         _loc3_.name = "mask";
         _loc3_.graphics.beginFill(16777215,0.5);
         _loc3_.graphics.drawRect(0,0,940,590);
         _loc3_.graphics.endFill();
         this.addChild(_loc3_);
      }
      
      public function updateAllInfo(param1:*, param2:*, param3:*, param4:*, param5:*) : void
      {
      }
      
      public function destroy() : void
      {
         var _loc1_:* = null;
         this.backBtn.removeEventListener(MouseEvent.CLICK,this.__back);
         this.nextPageBtn.removeEventListener(MouseEvent.CLICK,this.__prePage);
         this.prePageBtn.removeEventListener(MouseEvent.CLICK,this.__nextPage);
         this.group.removeEventListener(MouseEvent.CLICK,this.__gotoGroup);
         var _loc2_:int = 0;
         while(_loc2_ < this.roomArray.length)
         {
            _loc1_ = this.roomArray[_loc2_] as RoomTitle;
            _loc1_.removeEventListener(MouseEvent.CLICK,this.__lineClick);
            _loc2_++;
         }
         this.refreshTimer.stop();
         this.refreshTimer.removeEventListener(TimerEvent.TIMER,this.__timer);
         this.refreshTimer = null;
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
         if(this.chatSprite)
         {
            this.chatSprite.destroy();
         }
         this.gc.keyboardControl.continueAllControl();
      }
   }
}

