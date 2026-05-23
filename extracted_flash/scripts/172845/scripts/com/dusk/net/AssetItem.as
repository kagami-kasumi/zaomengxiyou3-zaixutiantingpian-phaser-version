package com.dusk.net
{
   import com.dusk.tool.*;
   import com.dusk.util.*;
   import flash.display.*;
   import flash.events.*;
   import flash.media.*;
   import flash.system.*;
   import flash.utils.ByteArray;
   
   public class AssetItem
   {
      
      public var url:String;
      
      public var type:String;
      
      public var bytes:ByteArray;
      
      public var sound:Sound;
      
      public var bitmapData:BitmapData;
      
      public var json:Object;
      
      public var xml:XML;
      
      private var _classLink:Array;
      
      private var _loaderInfo:LoaderInfo;
      
      private var _buildCompleteCallback:Function;
      
      public function AssetItem()
      {
         super();
         this._classLink = [];
      }
      
      public function buildAsset(param1:Function = null) : void
      {
         var _loc2_:Loader = null;
         var _loc3_:Sound = null;
         var _loc4_:SwfParser = null;
         this._buildCompleteCallback = param1;
         this.bytes.position = 0;
         switch(this.type)
         {
            case AssetType.IMAGE:
               _loc2_ = new Loader();
               this._loaderInfo = _loc2_.contentLoaderInfo;
               _loc2_.contentLoaderInfo.addEventListener(Event.COMPLETE,this.onLoadToDomainComplete);
               _loc2_.loadBytes(this.bytes,SystemUtil.getLoaderContext());
               break;
            case AssetType.SOUND:
               _loc3_ = new Sound();
               _loc3_.loadCompressedDataFromByteArray(this.bytes,this.bytes.length);
               this.sound = _loc3_;
               this.buildComplete();
               break;
            case AssetType.VIDEO:
               this.buildComplete();
               break;
            case AssetType.JSON:
               this.json = JSON.parse(this.bytes.readUTFBytes(this.bytes.length));
               this.buildComplete();
               break;
            case AssetType.XML:
               this.xml = new XML(this.bytes.readUTFBytes(this.bytes.length));
               this.buildComplete();
               break;
            case AssetType.SWF:
               _loc4_ = new SwfParser();
               _loc4_.parseSwf(this.bytes);
               this._classLink = _loc4_.getSymbolClassLink();
               _loc2_ = new Loader();
               this._loaderInfo = _loc2_.contentLoaderInfo;
               _loc2_.contentLoaderInfo.addEventListener(Event.COMPLETE,this.onLoadToDomainComplete);
               _loc2_.loadBytes(this.bytes,SystemUtil.getLoaderContext());
               break;
            case AssetType.CONFIG:
               this.json = this.parseConfigFile(this.bytes);
               break;
            case AssetType.BYTES:
         }
      }
      
      private function parseConfigFile(param1:ByteArray) : Object
      {
         return null;
      }
      
      private function onLoadToDomainComplete(param1:Event) : void
      {
         param1.target.removeEventListener(Event.COMPLETE,this.onLoadToDomainComplete);
         switch(this.type)
         {
            case AssetType.SWF:
               this._loaderInfo.removeEventListener(Event.COMPLETE,this.onLoadToDomainComplete);
               this.buildComplete();
               break;
            case AssetType.IMAGE:
               this.bitmapData = ((param1.target as LoaderInfo).loader.content as Bitmap).bitmapData;
               this.buildComplete();
         }
      }
      
      private function buildComplete() : void
      {
         if(Boolean(this._buildCompleteCallback))
         {
            this._buildCompleteCallback();
         }
         if(this.type != AssetType.BYTES)
         {
            if(Boolean(this.bytes))
            {
               this.bytes.clear();
            }
            this.bytes = null;
         }
      }
      
      public function getClass(param1:String) : Object
      {
         return this._loaderInfo.applicationDomain.getDefinition(param1);
      }
      
      public function getClassInstance(param1:String) : Object
      {
         var _loc2_:* = this.getClass(param1);
         return new _loc2_();
      }
      
      public function hasClass(param1:String) : Boolean
      {
         return ArrayUtil.contains(this._classLink,param1);
      }
      
      public function destroy() : void
      {
         if(Boolean(this.bitmapData))
         {
            this.bitmapData.dispose();
         }
         if(Boolean(this.bytes))
         {
            this.bytes.clear();
         }
         if(Boolean(this.xml))
         {
            System.disposeXML(this.xml);
         }
         this.url = null;
         this.xml = null;
         this.type = null;
         this.json = null;
         this.bytes = null;
         this.sound = null;
         this.bitmapData = null;
         this._buildCompleteCallback = null;
      }
   }
}

