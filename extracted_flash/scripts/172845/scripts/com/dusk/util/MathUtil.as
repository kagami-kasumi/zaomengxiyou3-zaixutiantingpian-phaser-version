package com.dusk.util
{
   import flash.geom.*;
   
   public final class MathUtil extends UtilBase
   {
      
      public function MathUtil()
      {
         super();
      }
      
      public static function decimal(param1:Number, param2:int = 2, param3:Boolean = true) : Number
      {
         var _loc4_:int = Math.pow(10,param2);
         if(param3)
         {
            return Math.round(param1 * _loc4_) / _loc4_;
         }
         return Math.floor(param1 * _loc4_) / _loc4_;
      }
      
      public static function getDist(... rest) : Number
      {
         var _loc2_:Point = null;
         var _loc3_:Point = null;
         if(rest.length == 2 && rest[0] is Point && rest[1] is Point)
         {
            _loc2_ = rest[0];
            _loc3_ = rest[1];
         }
         else if(rest.length == 4)
         {
            _loc2_ = new Point(rest[0],rest[1]);
            _loc3_ = new Point(rest[2],rest[3]);
         }
         if(_loc2_ != null && _loc3_ != null)
         {
            return Math.sqrt((_loc2_.x - _loc3_.x) * (_loc2_.x - _loc3_.x) + (_loc2_.y - _loc3_.y) * (_loc2_.y - _loc3_.y));
         }
         return -1;
      }
      
      public static function getAngleByTwoPoint(param1:Point, param2:Point) : Point
      {
         var _loc3_:int = getDist(param1,param2);
         return new Point((param2.x - param1.x) / _loc3_,(param2.y - param1.y) / _loc3_);
      }
      
      public static function radianToDegree(param1:Number) : Number
      {
         return param1 * 180 / Math.PI;
      }
      
      public static function degreeToRadian(param1:Number) : Number
      {
         return param1 * Math.PI / 180;
      }
   }
}

