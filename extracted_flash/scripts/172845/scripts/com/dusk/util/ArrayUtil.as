package com.dusk.util
{
   public final class ArrayUtil extends UtilBase
   {
      
      public function ArrayUtil()
      {
         super();
      }
      
      public static function filterNoValue(param1:Array) : Array
      {
         var _loc2_:* = undefined;
         var _loc3_:Array = [];
         for each(_loc2_ in param1)
         {
            if(_loc2_)
            {
               _loc3_.push(_loc2_);
            }
         }
         return _loc3_;
      }
      
      public static function filterKeepOne(param1:Array) : Array
      {
         var _tmp:Array = null;
         _tmp = null;
         var filterFunction:* = undefined;
         var tarArr:Array = param1;
         filterFunction = function(param1:*, ... rest):Boolean
         {
            if(_tmp.indexOf(param1) == -1)
            {
               _tmp.push(param1);
               return true;
            }
            return false;
         };
         _tmp = [];
         return tarArr.filter(filterFunction);
      }
      
      public static function filterOneFromOther(param1:Array, param2:Array) : Array
      {
         var _loc3_:* = undefined;
         var _loc4_:Array = [];
         for each(_loc3_ in param1)
         {
            if(_loc3_ != null && param2.indexOf(_loc3_) == -1)
            {
               _loc4_.push(_loc3_);
            }
         }
         return _loc4_;
      }
      
      public static function compare(param1:Array, param2:Array) : Boolean
      {
         var _loc3_:* = undefined;
         var _loc4_:int = 0;
         if(param1.length != param2.length)
         {
            return false;
         }
         for each(_loc3_ in param1)
         {
            _loc4_ = int(param2.indexOf(_loc3_));
            if(_loc4_ == -1)
            {
               return false;
            }
            param2.splice(_loc4_,1);
         }
         return param2.length == 0;
      }
      
      public static function contains(param1:Object, param2:Object) : Boolean
      {
         return param1.indexOf(param2) != -1;
      }
      
      public static function copyArray(param1:Array) : Array
      {
         return param1.slice();
      }
      
      public static function findAll(param1:*, param2:Array) : Array
      {
         var _loc3_:Array = [];
         var _loc4_:int = int(param2.indexOf(param1));
         while(_loc4_ != -1)
         {
            _loc3_.push(_loc4_);
            _loc4_++;
            _loc4_ = int(param2.indexOf(param1,_loc4_));
         }
         return _loc3_;
      }
      
      public static function removeElement(param1:Array, param2:Object, param3:Boolean = true) : void
      {
         var _loc4_:int = 0;
         do
         {
            _loc4_ = int(param1.indexOf(param2));
            if(_loc4_ == -1)
            {
               break;
            }
            param1.splice(_loc4_,1);
         }
         while(param3);
      }
      
      public static function removeAllElement(param1:Array) : void
      {
         while(param1.length > 0)
         {
            param1.pop();
         }
      }
      
      public static function removeElementFromAnother(param1:Array, param2:Array) : void
      {
         var _loc3_:* = undefined;
         while(param1.length > 0)
         {
            _loc3_ = param1.pop();
            ArrayUtil.removeElement(param2,_loc3_);
         }
      }
   }
}

