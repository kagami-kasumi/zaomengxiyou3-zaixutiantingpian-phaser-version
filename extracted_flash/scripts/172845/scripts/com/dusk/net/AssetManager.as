package com.dusk.net
{
   import com.dusk.game.*;
   import com.dusk.util.*;
   import flash.media.*;
   import flash.utils.*;
   
   public class AssetManager
   {
      
      private static var _ins:AssetManager;
      
      private var _assetMap:Dictionary;
      
      private var _onCompleteFuncList:Array;
      
      private var _onProgressFuncList:Array;
      
      private var _onIOErrorFuncList:Array;
      
      private var _readyLoadAssetList:Array;
      
      public function AssetManager()
      {
         this._onCompleteFuncList = [];
         this._onProgressFuncList = [];
         this._onIOErrorFuncList = [];
         this._readyLoadAssetList = [];
         super();
         this._assetMap = new Dictionary();
      }
      
      public static function getIns() : AssetManager
      {
         if(!_ins)
         {
            _ins = new AssetManager();
         }
         return _ins;
      }
      
      public function addCallback(param1:Function = null, param2:Function = null, param3:Function = null) : void
      {
         if(Boolean(param1) && !ArrayUtil.contains(this._onCompleteFuncList,param1))
         {
            this._onCompleteFuncList.push(param1);
         }
         if(Boolean(param2) && !ArrayUtil.contains(this._onProgressFuncList,param2))
         {
            this._onProgressFuncList.push(param2);
         }
         if(Boolean(param3) && !ArrayUtil.contains(this._onIOErrorFuncList,param3))
         {
            this._onIOErrorFuncList.push(param3);
         }
      }
      
      public function addAssetToQueue(param1:String, param2:String, param3:ByteArray = null, param4:Function = null, param5:Function = null, param6:Function = null) : void
      {
         var _loc7_:AssetItem = new AssetItem();
         _loc7_.url = param1;
         _loc7_.type = param2;
         _loc7_.bytes = param3;
         this._readyLoadAssetList.push(_loc7_);
         this.addCallback(param4,param5,param6);
      }
      
      public function startLoadQueue() : void
      {
         var i:AssetItem = null;
         var vo:ThreadVO = new ThreadVO();
         vo.setCallBacks(this._onCompleteFuncList,this._onProgressFuncList,this._onIOErrorFuncList);
         this._readyLoadAssetList = this._readyLoadAssetList.filter(function(param1:AssetItem, ... rest):Boolean
         {
            return !hasCache(param1.url);
         });
         for each(i in this._readyLoadAssetList)
         {
            this._assetMap[i.url] = i;
         }
         vo.setAssetList(this._readyLoadAssetList);
         vo.start();
         this._onCompleteFuncList = [];
         this._onProgressFuncList = [];
         this._onIOErrorFuncList = [];
         this._readyLoadAssetList = [];
      }
      
      public function loadAsset(param1:String, param2:String, param3:ByteArray = null, param4:Function = null, param5:Function = null, param6:Function = null) : void
      {
         this.addAssetToQueue(param1,param2,param3,param4,param5,param6);
         this.startLoadQueue();
      }
      
      public function loadAssets(param1:Array, param2:String, param3:ByteArray = null, param4:Function = null, param5:Function = null, param6:Function = null) : void
      {
         var _loc7_:String = null;
         for each(_loc7_ in param1)
         {
            this.addAssetToQueue(_loc7_,param2,param3,param4,param5,param6);
         }
         this.startLoadQueue();
      }
      
      public function hasCache(param1:String) : Boolean
      {
         return Boolean(this._assetMap[param1]);
      }
      
      public function getAsset(param1:String) : AssetItem
      {
         return this._assetMap[param1];
      }
      
      public function getSound(param1:String) : Sound
      {
         if(this.hasCache(param1))
         {
            return (this._assetMap[param1] as AssetItem).sound as Sound;
         }
         return null;
      }
      
      public function getJSON(param1:String) : Object
      {
         if(this.hasCache(param1))
         {
            return (this._assetMap[param1] as AssetItem).json;
         }
         return null;
      }
      
      public function getXml(param1:String) : XML
      {
         if(this.hasCache(param1))
         {
            return (this._assetMap[param1] as AssetItem).xml;
         }
         return null;
      }
      
      public function getClass(param1:String) : Object
      {
         var _loc2_:AssetItem = null;
         for each(_loc2_ in UtilBase.getAllValue(this._assetMap))
         {
            if(_loc2_.type == AssetType.SWF && _loc2_.hasClass(param1))
            {
               return _loc2_.getClass(param1);
            }
         }
         return null;
      }
      
      public function getConfig(param1:String) : Object
      {
         if(this.hasCache(param1) && this._assetMap[param1].type == AssetType.CONFIG)
         {
            return (this._assetMap[param1] as AssetItem).json;
         }
         return null;
      }
      
      public function getClassInstance(param1:String) : Object
      {
         var _loc2_:AssetItem = null;
         for each(_loc2_ in UtilBase.getAllValue(this._assetMap))
         {
            if(_loc2_.type == AssetType.SWF && _loc2_.hasClass(param1))
            {
               return _loc2_.getClassInstance(param1);
            }
         }
         return null;
      }
      
      public function deleteAsset(param1:String) : void
      {
         var _loc2_:AssetItem = null;
         if(this.hasCache(param1))
         {
            _loc2_ = this._assetMap[param1];
            _loc2_.destroy();
            delete this._assetMap[param1];
         }
      }
      
      public function deleteAllAssets() : void
      {
         var _loc1_:String = null;
         var _loc2_:AssetItem = null;
         for each(_loc1_ in UtilBase.getAllKeys(this._assetMap))
         {
            _loc2_ = this._assetMap[_loc1_];
            if(_loc2_.type != AssetType.SWF)
            {
               _loc2_.destroy();
               Logger.log("delete key: " + _loc1_);
               delete this._assetMap[_loc1_];
            }
         }
         Logger.log("====== clear asset cache ======");
      }
   }
}

