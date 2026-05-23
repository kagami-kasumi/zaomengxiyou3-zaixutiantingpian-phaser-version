package loader
{
   import config.*;
   import event.*;
   import flash.display.*;
   import flash.events.*;
   import flash.net.*;
   import flash.system.*;
   import flash.utils.*;
   
   public class Aloader
   {
      
      public var urls:Array;
      
      public var ActivitiesUrl:Array;
      
      public var _i:uint;
      
      public var view:*;
      
      public var gc:Config;
      
      private var uloader:URLLoader;
      
      private var firstLoader:URLLoader;
      
      private var currentFileIdx:int;
      
      private var after:Function;
      
      public function Aloader()
      {
         this.urls = new Array("yinjiangjun.swf","Monster264.swf","bailongSword.swf","music_bg26.swf","qingyangshenjun.swf","zijingpengwang.swf","baishuishenjun.swf","zimoujiuwang.swf","tiantingzhanshen.swf","chiyueshenjun.swf","Music(2.swf","bailong.swf","TangSeng1.swf","ShaShen.swf","bossblood.swf","shop.swf","ThreeBothers.swf","past.swf","hdDoor.swf","Music.swf","OtherMat1.swf","Common1.swf","backpack1.swf","EIcon1.swf","MagicWeapon.swf","MagicWeapon2.swf","20120117.swf","20120119.swf","20120203.swf","20120808.swf","jifenActivity.swf","sgzz.swf","StageCommon.swf");
         super();
         this.gc = Config.getInstance();
      }
      
      public function init() : *
      {
         this._i = 0;
         this.next();
      }
      
      public function next() : *
      {
         if(this._i >= this.urls.length)
         {
            GMain.getInstance().processComplete();
            this.gc.eventManger.dispatchEvent(new CommonEvent("LoadOver"));
            return;
         }
         this.loadswf(AssetsUrl.getAssetsUrl(this.urls[this._i++]),this.next,this._i + 1);
      }
      
      private function loadswf(param1:String, param2:Function, param3:int) : *
      {
         var ba:ByteArray = null;
         ba = null;
         ba = null;
         var url:* = undefined;
         var _arg1:String = param1;
         var _arg2:Function = param2;
         var _arg3:int = param3;
         ba = new ByteArray();
         url = _arg1;
         this.after = _arg2;
         this.currentFileIdx = _arg3;
         this.uloader = new URLLoader();
         this.uloader.dataFormat = URLLoaderDataFormat.BINARY;
         this.uloader.addEventListener(Event.COMPLETE,function(param1:*):*
         {
            var _loc3_:* = undefined;
            var _loc4_:* = undefined;
            uloader.removeEventListener(Event.COMPLETE,arguments.callee);
            var _loc5_:ByteArray = uloader.data as ByteArray;
            ba.writeBytes(_loc5_,97,79);
            ba.writeBytes(_loc5_,0,97);
            ba.writeBytes(_loc5_,176);
            _loc3_ = new LoaderContext(false,ApplicationDomain.currentDomain);
            _loc3_.allowCodeImport = true;
            _loc4_ = new Loader();
            _loc4_.loadBytes(ba,_loc3_);
            _loc4_.unload();
            _loc4_ = null;
            uloader.removeEventListener(ProgressEvent.PROGRESS,loadProcess);
            uloader.close();
            uloader = null;
            _arg2();
         });
         this.uloader.load(new URLRequest(url));
         this.uloader.addEventListener(ProgressEvent.PROGRESS,this.loadProcess);
      }
      
      private function loadProcess(param1:ProgressEvent) : void
      {
         var _loc2_:int = int(param1.bytesLoaded / param1.bytesTotal * 100);
         GMain.getInstance().showProgress(_loc2_);
      }
   }
}

