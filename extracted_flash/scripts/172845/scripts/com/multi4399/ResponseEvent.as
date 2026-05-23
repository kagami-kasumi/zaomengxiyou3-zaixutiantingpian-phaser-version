package com.multi4399
{
   import flash.events.Event;
   
   public class ResponseEvent extends Event
   {
      
      public static const PACKET:String = "packet";
      
      public var mark:uint = 0;
      
      public var values:Array;
      
      public var errors:Array;
      
      public function ResponseEvent(param1:String, param2:Boolean = false, param3:Boolean = false)
      {
         this.values = new Array();
         this.errors = new Array();
         super(param1,param2,param3);
      }
   }
}

