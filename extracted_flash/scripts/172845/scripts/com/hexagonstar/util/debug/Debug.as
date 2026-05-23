package com.hexagonstar.util.debug
{
   import flash.display.Stage;
   import flash.events.*;
   import flash.net.*;
   import flash.system.*;
   import flash.utils.*;
   
   public final class Debug
   {
      
      private static var _stage:Stage;
      
      private static var _connection:LocalConnection;
      
      private static var _fpsMeter:FPSMeter;
      
      private static var _stopWatch:StopWatch;
      
      public static const LEVEL_DEBUG:int = 0;
      
      public static const LEVEL_INFO:int = 1;
      
      public static const LEVEL_WARN:int = 2;
      
      public static const LEVEL_ERROR:int = 3;
      
      public static const LEVEL_FATAL:int = 4;
      
      private static var _filterLevel:int = 0;
      
      private static var _isConnected:Boolean = false;
      
      private static var _isPollingFPS:Boolean = false;
      
      private static var _isEnabled:Boolean = true;
      
      public function Debug()
      {
         super();
      }
      
      public static function trace(... rest) : void
      {
         var _loc2_:int = rest[1] is int ? int(rest[1]) : 1;
         if(_loc2_ >= _filterLevel && _loc2_ < 7)
         {
            send("onData",rest[0],_loc2_,0);
         }
      }
      
      public static function traceObj(param1:Object, param2:int = 64, param3:int = 1) : void
      {
         if(param3 >= _filterLevel && param3 < 7)
         {
            send("onData",param1,param3,param2);
         }
      }
      
      public static function inspect(param1:Object) : void
      {
         send("onInspect",param1,1,-1);
      }
      
      public static function hexDump(param1:Object) : void
      {
         send("onHexDump",param1,0,0);
      }
      
      public static function forceGC() : void
      {
         try
         {
            return;
         }
         catch(e1:Error)
         {
            try
            {
               new LocalConnection().connect("forceGC");
               new LocalConnection().connect("forceGC");
            }
            catch(e2:Error)
            {
            }
            return;
         }
      }
      
      public static function clear() : void
      {
         Debug.trace("[%CLR%]",5);
      }
      
      public static function delimiter() : void
      {
         Debug.trace("[%DLT%]",5);
      }
      
      public static function pause() : void
      {
         Debug.trace("[%PSE%]",5);
      }
      
      public static function time() : void
      {
         Debug.trace("[%TME%]",5);
      }
      
      public static function createCategory(param1:int, param2:String = "", param3:uint = 0, param4:uint = 16776960) : void
      {
         send("onCategory",[param1,param2,param3,param4],0,0);
      }
      
      public static function monitor(param1:Stage, param2:int = 500) : void
      {
         if(_isPollingFPS)
         {
            Debug.stop();
         }
         if(Boolean(_isEnabled) && !_fpsMeter)
         {
            _isPollingFPS = true;
            _stage = param1;
            sendCapabilities();
            _fpsMeter = new FPSMeter(_stage,param2);
            _fpsMeter.addEventListener(FPSMeter.FPS_UPDATE,onFPSUpdate);
            _fpsMeter.start();
         }
      }
      
      public static function mark(param1:uint = 16711935) : void
      {
         send("onMarker",param1,1,-1);
      }
      
      public static function stop() : void
      {
         if(_fpsMeter)
         {
            _isPollingFPS = false;
            _fpsMeter.stop();
            _fpsMeter.removeEventListener(FPSMeter.FPS_UPDATE,onFPSUpdate);
            _fpsMeter = null;
            _stage = null;
         }
      }
      
      public static function timerStart(param1:String = "") : void
      {
         if(_isEnabled)
         {
            if(!_stopWatch)
            {
               _stopWatch = new StopWatch();
            }
            _stopWatch.start(param1);
         }
      }
      
      public static function timerStop() : void
      {
         if(_stopWatch)
         {
            _stopWatch.stop();
         }
      }
      
      public static function timerReset() : void
      {
         if(_stopWatch)
         {
            _stopWatch.reset();
         }
      }
      
      public static function timerInMilliSeconds() : void
      {
         if(_stopWatch)
         {
            Debug.trace(_stopWatch.timeInMilliSeconds + "ms");
         }
      }
      
      public static function timerInSeconds() : void
      {
         if(_stopWatch)
         {
            Debug.trace(_stopWatch.timeInSeconds + "s");
         }
      }
      
      public static function timerToString() : void
      {
         if(_stopWatch)
         {
            Debug.trace(_stopWatch.toString());
         }
      }
      
      public static function timerStopToString(param1:Boolean = false) : void
      {
         if(_stopWatch)
         {
            _stopWatch.stop();
            Debug.trace(_stopWatch.toString());
            if(param1)
            {
               _stopWatch.reset();
            }
         }
      }
      
      public static function get filterLevel() : int
      {
         return _filterLevel;
      }
      
      public static function set filterLevel(param1:int) : void
      {
         if(param1 >= 0 && param1 < 5)
         {
            _filterLevel = param1;
         }
      }
      
      public static function get enabled() : Boolean
      {
         return _isEnabled;
      }
      
      public static function set enabled(param1:Boolean) : void
      {
         _isEnabled = param1;
      }
      
      private static function onFPSUpdate(param1:Event) : void
      {
         send("onFPS",_fpsMeter.fps + "," + _stage.frameRate + "," + _fpsMeter.frt + "," + System.totalMemory);
      }
      
      private static function onStatus(param1:StatusEvent) : void
      {
      }
      
      private static function send(param1:String, param2:*, param3:int = 1, param4:int = 0) : void
      {
         var _loc5_:* = NaN;
         var _loc6_:* = null;
         if(_isEnabled)
         {
            if(!_isConnected)
            {
               _isConnected = true;
               _connection = new LocalConnection();
               _connection.addEventListener(StatusEvent.STATUS,onStatus);
            }
            _loc5_ = 0;
            if(typeof param2 == "string")
            {
               _loc5_ = Number(String(param2).length);
            }
            else if(typeof param2 == "object")
            {
               _loc6_ = new ByteArray();
               _loc6_.writeObject(param2);
               _loc5_ = Number(_loc6_.length);
               _loc6_ = null;
            }
            if(_loc5_ > 650 * 60)
            {
               storeDataLSO(param1,param2);
               param1 = "onLargeData";
               param2 = null;
            }
            _connection.send("_alcon_lc",param1,param2,param3,param4,"");
         }
      }
      
      private static function sendCapabilities() : void
      {
         var _loc1_:* = null;
         var _loc2_:* = null;
         var _loc3_:XML = describeType(Capabilities);
         var _loc4_:* = [];
         for each(_loc1_ in _loc3_.*)
         {
            _loc2_ = _loc1_.@name.toString();
            if(_loc2_.length > 0 && _loc2_ != "_internal" && _loc2_ != "prototype")
            {
               _loc4_.push({
                  "p":_loc2_,
                  "v":Capabilities[_loc2_].toString()
               });
            }
         }
         _loc4_.sortOn(["p"],Array.CASEINSENSITIVE);
         send("onCap",_loc4_);
      }
      
      private static function storeDataLSO(param1:String, param2:*) : void
      {
         var flushResult:String = null;
         var m:String = param1;
         var d:* = param2;
         var sharedObject:SharedObject = SharedObject.getLocal("alcon","/");
         sharedObject.data["alconMethod"] = m;
         sharedObject.data["alconData"] = d;
         try
         {
            flushResult = sharedObject.flush();
            if(flushResult == SharedObjectFlushStatus.FLUSHED)
            {
               return;
            }
            return;
         }
         catch(e:Error)
         {
            Security.showSettings(SecurityPanel.LOCAL_STORAGE);
            return;
         }
      }
   }
}

