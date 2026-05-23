package com.dusk.util
{
   public final class TimeUtil extends UtilBase
   {
      
      public function TimeUtil()
      {
         super();
      }
      
      public static function getCurrentDate(param1:String = "-") : String
      {
         var _loc2_:Date = new Date();
         return _loc2_.fullYear.toString() + param1 + (_loc2_.month + 1).toString() + param1 + _loc2_.date.toString();
      }
      
      public static function getCurrentTime(param1:String = ":") : String
      {
         var _loc2_:Date = new Date();
         return StringUtil.completeZeroFormat(_loc2_.hours) + param1 + StringUtil.completeZeroFormat(_loc2_.minutes) + param1 + StringUtil.completeZeroFormat(_loc2_.seconds);
      }
      
      public static function getDayBetweenTwoDate(param1:String, param2:String, param3:String = "-") : int
      {
         var _loc4_:Array = param1.split(param3);
         var _loc5_:uint = uint(int(_loc4_[0]));
         var _loc6_:uint = uint(int(_loc4_[1]) - 1);
         var _loc7_:uint = uint(int(_loc4_[2]));
         var _loc8_:Array = param2.split(param3);
         var _loc9_:uint = uint(int(_loc8_[0]));
         var _loc10_:uint = uint(int(_loc8_[1]) - 1);
         var _loc11_:uint = uint(int(_loc8_[2]));
         var _loc12_:Date = new Date(_loc5_,_loc6_,_loc7_);
         var _loc13_:Date = new Date(_loc9_,_loc10_,_loc11_);
         return int((_loc13_.getTime() - _loc12_.getTime()) / 1000) / 3600 / 24;
      }
   }
}

