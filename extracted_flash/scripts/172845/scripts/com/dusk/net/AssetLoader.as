package com.dusk.net
{
   import com.dusk.game.*;
   import flash.events.*;
   import flash.net.*;
   import flash.utils.*;
   
   public class AssetLoader extends EventDispatcher
   {
      
      private static const CURRENT_LOAD_COMPLETE:String = "currentFileComplete";
      
      public static const ALL_LOAD_COMPLETE:String = "allFilesComplete";
      
      public static const LOAD_FAILED:String = "loadFailed";
      
      public static const UPDATE_PROGRESS:String = "updateProgress";
      
      public var isAuto:Boolean = true;
      
      private var _urlLoader:URLLoader;
      
      private var _queueLen:int = 0;
      
      private var _curByteLoaded:uint = 0;
      
      private var _curByteTotal:uint = 0;
      
      private var _assetQueue:Array;
      
      private var _isLoading:Boolean = false;
      
      public function AssetLoader()
      {
         this._assetQueue = [];
         super();
         this._urlLoader = new URLLoader();
         this._urlLoader.dataFormat = URLLoaderDataFormat.BINARY;
         this._urlLoader.addEventListener(Event.COMPLETE,this.loadCompleteHandler);
         this._urlLoader.addEventListener(IOErrorEvent.IO_ERROR,this.ioErrHandler);
         this._urlLoader.addEventListener(SecurityErrorEvent.SECURITY_ERROR,this.securityErrHandler);
         this._urlLoader.addEventListener(ProgressEvent.PROGRESS,this.progressHandler);
      }
      
      public static function getIns() : AssetLoader
      {
         return new AssetLoader();
      }
      
      public function get loadingInfo() : Object
      {
         return {
            "curNum":this._queueLen - this._assetQueue.length,
            "totalNum":this._queueLen,
            "curPercent":Math.round(100 * this._curByteLoaded / this._curByteTotal)
         };
      }
      
      public function addItem(param1:AssetItem) : void
      {
         this._assetQueue.push(param1);
         ++this._queueLen;
         if(!this.isAuto)
         {
            return;
         }
         this.startLoad();
      }
      
      public function startLoad() : void
      {
         if(this._isLoading)
         {
            return;
         }
         this._loadNext();
      }
      
      private function _loadNext() : void
      {
         if(this._assetQueue.length == 0)
         {
            this._queueLen = 0;
            this._isLoading = false;
            dispatchEvent(new Event(AssetLoader.ALL_LOAD_COMPLETE));
            return;
         }
         this._isLoading = true;
         this.execute(this._assetQueue[0]);
      }
      
      public function execute(param1:AssetItem) : void
      {
         if(Boolean(param1.bytes))
         {
            param1.buildAsset();
            return;
         }
         Logger.log("LoadAsset: " + param1.url);
         this._urlLoader.load(new URLRequest(param1.url));
      }
      
      private function loadCompleteHandler(param1:Event) : void
      {
         var _loc2_:AssetItem = null;
         this._urlLoader.close();
         _loc2_ = this._assetQueue[0] as AssetItem;
         _loc2_.bytes = this._urlLoader.data as ByteArray;
         _loc2_.buildAsset(this.buildAssetComplete);
      }
      
      private function buildAssetComplete() : void
      {
         this._assetQueue.shift();
         dispatchEvent(new Event(CURRENT_LOAD_COMPLETE));
         this._loadNext();
      }
      
      private function progressHandler(param1:ProgressEvent) : void
      {
         this._curByteLoaded = param1.bytesLoaded;
         this._curByteTotal = param1.bytesTotal;
         dispatchEvent(new Event(UPDATE_PROGRESS));
      }
      
      private function ioErrHandler(param1:IOErrorEvent) : void
      {
         dispatchEvent(new Event(LOAD_FAILED));
         Logger.logError(param1.text,this);
      }
      
      private function securityErrHandler(param1:SecurityErrorEvent) : void
      {
         dispatchEvent(new Event(LOAD_FAILED));
         Logger.logError(param1.text,this);
      }
      
      public function destroy() : void
      {
         this._queueLen = 0;
         this._curByteLoaded = 0;
         this._curByteTotal = 0;
         this._assetQueue.length = 0;
         this._urlLoader = null;
      }
   }
}

