package com.dusk.game
{
   import com.dusk.net.*;
   import com.dusk.util.*;
   import flash.utils.*;
   
   public class Logger
   {
      
      public function Logger()
      {
         super();
      }
      
      public static function log(param1:String) : void
      {
         if(SystemUtil.isDebugger())
         {
            trace(param1);
         }
         if(Boolean(Debug.getIns()))
         {
            Debug.getIns().logInfo(param1,1);
         }
      }
      
      public static function logToFile(param1:String) : void
      {
         NativeFile.append(param1 + "\n",NativeFile.getAppFolderFileUrl("log.log"));
      }
      
      public static function logTime() : void
      {
         logToFile(TimeUtil.getCurrentDate() + " " + TimeUtil.getCurrentTime());
      }
      
      public static function logError(param1:*, param2:* = null) : void
      {
         if(param1 is String)
         {
            log(param1);
            logToFile(param1);
         }
         else if(param1 is Error)
         {
            log((param1 as Error).getStackTrace());
            logToFile((param1 as Error).getStackTrace());
         }
         if(param2 != null)
         {
            if(param2 is String)
            {
               log("Class: " + param2);
               logToFile("Class: " + param2);
            }
            else
            {
               log("Class: " + getQualifiedClassName(param2).toString());
               logToFile("Class: " + getQualifiedClassName(param2).toString());
            }
         }
      }
   }
}

