package com.dusk.util
{
   import flash.filesystem.*;
   import flash.geom.*;
   import flash.profiler.*;
   import flash.system.*;
   
   public final class SystemUtil extends UtilBase
   {
      
      public static const DESKTOP:String = "Desktop";
      
      public static const ACTIVE_X:String = "ActiveX";
      
      public static const PLUGIN:String = "PlugIn";
      
      public static const STAND_ALONE:String = "StandAlone";
      
      public static const EXTERNAL:String = "External";
      
      public function SystemUtil()
      {
         super();
      }
      
      public static function isDebugger() : Boolean
      {
         return Capabilities.isDebugger;
      }
      
      public static function hasStreamingAudio() : Boolean
      {
         return Capabilities.hasStreamingAudio;
      }
      
      public static function getOSVersion() : String
      {
         return Capabilities.os;
      }
      
      public static function getPlayerVersion() : String
      {
         return Capabilities.version;
      }
      
      public static function getPlayerType() : String
      {
         return Capabilities.playerType;
      }
      
      public static function isApplication() : Boolean
      {
         return getPlayerType() == DESKTOP;
      }
      
      public static function isPlayer() : Boolean
      {
         var _loc1_:String = getPlayerType();
         return _loc1_ == ACTIVE_X || _loc1_ == PLUGIN || _loc1_ == STAND_ALONE || _loc1_ == EXTERNAL;
      }
      
      public static function getScreenResolution() : Point
      {
         return new Point(Capabilities.screenResolutionX,Capabilities.screenResolutionY);
      }
      
      public static function getAppMemory() : Number
      {
         return MathUtil.decimal(System.privateMemory / (1024 * 1024));
      }
      
      public static function getAVM2Memory() : Number
      {
         return MathUtil.decimal(System.totalMemoryNumber / (1024 * 1024));
      }
      
      public static function getMemoryPercent() : Number
      {
         return MathUtil.decimal(System.totalMemoryNumber / System.privateMemory);
      }
      
      public static function showRenderArea() : void
      {
         showRedrawRegions(true);
      }
      
      public static function isRunInTempDirectory() : Boolean
      {
         return File.applicationDirectory.nativePath.indexOf("AppData\\Local\\Temp") + File.applicationDirectory.nativePath.indexOf("AppData/Local/Temp") != -2;
      }
      
      public static function getLoaderContext(param1:ApplicationDomain = null) : LoaderContext
      {
         var _loc2_:LoaderContext = new LoaderContext(false,param1);
         if(_loc2_.hasOwnProperty("allowCodeImport"))
         {
            _loc2_.allowCodeImport = true;
         }
         if(_loc2_.hasOwnProperty("allowLoadBytesCodeExecution"))
         {
            _loc2_.allowLoadBytesCodeExecution = true;
         }
         return _loc2_;
      }
   }
}

