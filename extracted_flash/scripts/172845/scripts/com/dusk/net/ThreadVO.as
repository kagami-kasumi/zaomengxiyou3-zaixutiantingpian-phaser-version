package com.dusk.net
{
   import com.dusk.game.*;
   import flash.events.Event;
   
   public class ThreadVO
   {
      
      private static var _id:uint = 1;
      
      private var _id:uint;
      
      private var _assetLoader:AssetLoader;
      
      private var _onCompleteFuncList:Array;
      
      private var _onProgressFuncList:Array;
      
      private var _onIOErrorFuncList:Array;
      
      private var _readyLoadAssetList:Array;
      
      public function ThreadVO()
      {
         this._id = ThreadVO._id++;
         this._onCompleteFuncList = [];
         this._onProgressFuncList = [];
         this._onIOErrorFuncList = [];
         this._readyLoadAssetList = [];
         super();
         Logger.log("Create Loading Thread: " + this._id);
      }
      
      public function setCallBacks(param1:Array, param2:Array, param3:Array) : void
      {
         this._onCompleteFuncList = param1;
         this._onProgressFuncList = param2;
         this._onIOErrorFuncList = param3;
      }
      
      public function setAssetList(param1:Array) : void
      {
         this._readyLoadAssetList = param1;
      }
      
      public function onUpdateProgress(param1:Event) : void
      {
         var _loc2_:Function = null;
         for each(_loc2_ in this._onProgressFuncList)
         {
            _loc2_.call(null,this._assetLoader.loadingInfo);
         }
      }
      
      private function onLoadQueueComplete(param1:Event) : void
      {
         var _loc2_:Function = null;
         for each(_loc2_ in this._onCompleteFuncList)
         {
            _loc2_.call();
         }
         this.destroy();
      }
      
      private function onError(param1:Event) : void
      {
         var _loc2_:Function = null;
         for each(_loc2_ in this._onIOErrorFuncList)
         {
            _loc2_.call();
         }
         this.destroy();
      }
      
      public function start() : void
      {
         var _loc1_:AssetItem = null;
         if(this._readyLoadAssetList.length == 0)
         {
            this.onLoadQueueComplete(null);
            return;
         }
         this._assetLoader = new AssetLoader();
         this._assetLoader.addEventListener(AssetLoader.LOAD_FAILED,this.onError);
         this._assetLoader.addEventListener(AssetLoader.UPDATE_PROGRESS,this.onUpdateProgress);
         this._assetLoader.addEventListener(AssetLoader.ALL_LOAD_COMPLETE,this.onLoadQueueComplete);
         for each(_loc1_ in this._readyLoadAssetList)
         {
            this._assetLoader.addItem(_loc1_);
         }
      }
      
      private function destroy() : void
      {
         if(Boolean(this._assetLoader))
         {
            this._assetLoader.removeEventListener(AssetLoader.LOAD_FAILED,this.onError);
            this._assetLoader.removeEventListener(AssetLoader.UPDATE_PROGRESS,this.onUpdateProgress);
            this._assetLoader.removeEventListener(AssetLoader.ALL_LOAD_COMPLETE,this.onLoadQueueComplete);
            this._assetLoader.destroy();
            this._assetLoader = null;
         }
         this._readyLoadAssetList = null;
         this._onCompleteFuncList = null;
         this._onProgressFuncList = null;
         this._onIOErrorFuncList = null;
         Logger.log("Destroy Loading Thread: " + this._id);
      }
   }
}

