package export
{
   import com.multi4399.*;
   import com.multi4399.keys.*;
   import config.*;
   import export.muti.*;
   import flash.display.*;
   import flash.events.*;
   import flash.net.*;
   import flash.utils.*;
   import my.*;
   
   public class LineChoose extends Sprite
   {
      
      private var gc:Config;
      
      public var pageSize:uint = 8;
      
      public var pageIndex:uint = 0;
      
      public var curChildNodeMaxVis:uint = 0;
      
      public var curNodeMaxVisitors:uint = 0;
      
      public var curNodeNumChildren:uint = 0;
      
      private var lineArray:Array;
      
      private var refreshTimer:Timer;
      
      public var prePageBtn:SimpleButton;
      
      public var nextPageBtn:SimpleButton;
      
      public var backBtn:SimpleButton;
      
      public var group:MovieClip;
      
      private var posArray:Array;
      
      public function LineChoose()
      {
         this.lineArray = [];
         this.refreshTimer = new Timer(25 * 60);
         this.posArray = [[100,105],[475,105],[100,195],[475,195],[100,285],[475,285],[100,375],[475,375]];
         super();
         this.gc = Config.getInstance();
         this.refreshTimer.addEventListener(TimerEvent.TIMER,this.__timer);
         this.refreshTimer.start();
         this.backBtn.addEventListener(MouseEvent.CLICK,this.__back);
         this.backBtn.enabled = false;
         this.backBtn.mouseEnabled = false;
         this.prePageBtn.addEventListener(MouseEvent.CLICK,this.__prePage);
         this.nextPageBtn.addEventListener(MouseEvent.CLICK,this.__nextPage);
         this.group.buttonMode = true;
         this.group.addEventListener(MouseEvent.CLICK,this.__gotoGroup);
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
         if(this.pageIndex < this.curNodeNumChildren / this.pageSize - 1)
         {
            ++this.pageIndex;
         }
      }
      
      private function __back(param1:MouseEvent) : void
      {
         this.destroy();
         MainGame.getInstance().destroyGame();
         if(this.gc.isServerOk)
         {
            this.gc.closeScoket();
         }
         GMain.getInstance().switchSence("showStageMap");
      }
      
      private function __timer(param1:TimerEvent) : void
      {
         if(Boolean(this.gc.server) && Boolean(this.gc.isServerOk))
         {
            this.gc.server.ins_get_page(this.pageSize,this.pageIndex);
            this.gc.server.ins_set_return_to_param(2,true);
            this.gc.server.ins_get_children(Number(NK.NUM_VISITORS) | Number(NK.MAX_VISITORS),new ByteArray());
            this.gc.server.submit(256);
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
         if(Boolean(this.gc.server) && Boolean(this.gc.isServerOk))
         {
            this.refreshTimer.stop();
            _loc2_ = Sprite(param1.currentTarget).name;
            _loc3_ = uint(parseInt(_loc2_));
            this.gc.server.ins_enter_child(_loc3_);
            this.gc.server.ins_set_my(UK.DATA,this.gc.getSaveInfo());
            this.gc.server.submit(257);
            _loc4_ = new Sprite();
            _loc4_.name = "mask";
            _loc4_.graphics.beginFill(16777215,0.5);
            _loc4_.graphics.drawRect(0,0,940,590);
            _loc4_.graphics.endFill();
            this.addChild(_loc4_);
         }
      }
      
      public function joinFail() : void
      {
         var _loc1_:Sprite = this.getChildByName("mask") as Sprite;
         if(_loc1_)
         {
            this.removeChild(_loc1_);
         }
         this.mouseChildren = true;
         this.mouseEnabled = true;
         this.continueTimer();
      }
      
      public function refreshData(param1:ResponseEvent) : void
      {
         var _loc2_:* = null;
         var _loc3_:* = null;
         var _loc4_:int = 0;
         var _loc5_:* = null;
         var _loc6_:int = 0;
         var _loc7_:* = 0;
         var _loc8_:* = 0;
         var _loc9_:* = 0;
         var _loc10_:* = null;
         if(!this.backBtn.enabled)
         {
            this.backBtn.enabled = true;
            this.backBtn.mouseEnabled = true;
         }
         for each(_loc2_ in this.lineArray)
         {
            if(this.contains(_loc2_))
            {
               this.removeChild(_loc2_);
            }
         }
         this.lineArray.length = 0;
         _loc3_ = Utils.byte2_to_ints(param1.values[0]);
         _loc4_ = int(_loc3_.length);
         _loc6_ = 0;
         while(_loc6_ < _loc4_)
         {
            if(this.lineArray[_loc6_] == undefined || !this.lineArray[_loc6_])
            {
               _loc7_ = uint(parseInt(param1.values[_loc6_ * 2 + 2]));
               _loc8_ = uint(parseInt(param1.values[_loc6_ * 2 + 3]));
               _loc5_ = new LineTitle();
               _loc5_.setPlayerNum(_loc7_,_loc8_);
               _loc5_.setLineNameMc(this.pageIndex + 1);
               _loc5_.setLineIdxMc(_loc6_ + 1);
               _loc5_.name = (_loc6_ + this.pageIndex * this.pageSize).toString();
               _loc5_.mouseChildren = false;
               _loc5_.buttonMode = true;
               _loc5_.addEventListener(MouseEvent.CLICK,this.__lineClick);
               _loc9_ = uint(Number(this.lineArray.length) % 8);
               _loc10_ = this.posArray[_loc9_];
               _loc5_.x = _loc10_[0];
               _loc5_.y = _loc10_[1];
               _loc5_.buttonMode = true;
               this.addChild(_loc5_);
               this.lineArray.push(_loc5_);
            }
            _loc6_++;
         }
      }
      
      public function scoketError() : void
      {
         if(!this.backBtn.enabled)
         {
            this.backBtn.enabled = true;
            this.backBtn.mouseEnabled = true;
         }
      }
      
      public function destroy() : void
      {
         var _loc1_:* = null;
         var _loc2_:int = 0;
         while(_loc2_ < this.lineArray.length)
         {
            _loc1_ = this.lineArray[_loc2_] as LineTitle;
            _loc1_.removeEventListener(MouseEvent.CLICK,this.__lineClick);
            _loc2_++;
         }
         this.backBtn.removeEventListener(MouseEvent.CLICK,this.__back);
         this.prePageBtn.removeEventListener(MouseEvent.CLICK,this.__prePage);
         this.nextPageBtn.removeEventListener(MouseEvent.CLICK,this.__nextPage);
         this.group.removeEventListener(MouseEvent.CLICK,this.__gotoGroup);
         this.refreshTimer.stop();
         this.refreshTimer.removeEventListener(TimerEvent.TIMER,this.__timer);
         this.refreshTimer = null;
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
         this.gc.keyboardControl.continueAllControl();
      }
   }
}

