package com.dusk.util
{
   import flash.filters.*;
   
   public final class FilterUtil extends UtilBase
   {
      
      private static var _filters:Array = [];
      
      public function FilterUtil()
      {
         super();
      }
      
      public static function setDropShadow(param1:*, param2:Number = 4, param3:Number = 45, param4:uint = 0, param5:Number = 1, param6:Number = 4, param7:Number = 4, param8:Number = 1, param9:int = 1, param10:Boolean = false, param11:Boolean = false, param12:Boolean = false) : void
      {
         var _loc13_:DropShadowFilter = new DropShadowFilter(param2,param3,param4,param5,param6,param7,param8,param9,param10,param11,param12);
         _filters.push(_loc13_);
         param1.filters = ArrayUtil.filterKeepOne(_filters);
      }
      
      public static function setBlur(param1:*, param2:Number = 4, param3:Number = 4, param4:int = 1) : void
      {
         var _loc5_:BlurFilter = new BlurFilter(param2,param3,param4);
         _filters.push(_loc5_);
         param1.filters = ArrayUtil.filterKeepOne(_filters);
      }
      
      public static function setGlow(param1:*, param2:uint = 16711680, param3:Number = 1, param4:Number = 6, param5:Number = 6, param6:Number = 2, param7:int = 1, param8:Boolean = false, param9:Boolean = false) : void
      {
         var _loc10_:GlowFilter = new GlowFilter(param2,param3,param4,param5,param6,param7,param8,param9);
         _filters.push(_loc10_);
         param1.filters = ArrayUtil.filterKeepOne(_filters);
      }
      
      public static function setBevel(param1:*, param2:Number = 4, param3:Number = 45, param4:uint = 16777215, param5:Number = 1, param6:uint = 0, param7:Number = 1, param8:Number = 4, param9:Number = 4, param10:Number = 1, param11:int = 1, param12:String = "inner", param13:Boolean = false) : void
      {
         var _loc14_:BevelFilter = new BevelFilter(param2,param3,param4,param5,param6,param7,param8,param9,param10,param11,param12,param13);
         _filters.push(_loc14_);
         param1.filters = ArrayUtil.filterKeepOne(_filters);
      }
      
      public static function setGradientBevel(param1:*, param2:Number = 4, param3:Number = 45, param4:Array = null, param5:Array = null, param6:Array = null, param7:Number = 4, param8:Number = 4, param9:Number = 1, param10:int = 1, param11:String = "inner", param12:Boolean = false) : void
      {
         var _loc13_:GradientBevelFilter = new GradientBevelFilter(param2,param3,param4,param5,param6,param7,param8,param9,param10,param11,param12);
         _filters.push(_loc13_);
         param1.filters = ArrayUtil.filterKeepOne(_filters);
      }
      
      public static function setGradientGlow(param1:*, param2:Number = 4, param3:Number = 45, param4:Array = null, param5:Array = null, param6:Array = null, param7:Number = 4, param8:Number = 4, param9:Number = 1, param10:int = 1, param11:String = "inner", param12:Boolean = false) : void
      {
         var _loc13_:GradientGlowFilter = new GradientGlowFilter(param2,param3,param4,param5,param6,param7,param8,param9,param10,param11,param12);
         _filters.push(_loc13_);
         param1.filters = ArrayUtil.filterKeepOne(_filters);
      }
      
      public static function clearCache() : void
      {
         _filters = [];
      }
      
      public static function deleteAllFilters(param1:*) : void
      {
         param1.filters = null;
      }
      
      public static function getFilters(param1:*) : Array
      {
         return param1.filters;
      }
   }
}

