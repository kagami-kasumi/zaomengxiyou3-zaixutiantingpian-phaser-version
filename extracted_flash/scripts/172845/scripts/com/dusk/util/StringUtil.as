package com.dusk.util
{
   import flash.geom.*;
   
   public class StringUtil extends UtilBase
   {
      
      public static const ELLIPSIS:String = "…";
      
      public function StringUtil()
      {
         super();
      }
      
      public static function getFirstAZChar(param1:String) : String
      {
         var _loc2_:int = 0;
         var _loc3_:Array = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
         var _loc4_:String = param1.substr(_loc2_,_loc2_ + 1).toUpperCase();
         while(_loc3_.indexOf(_loc4_) == -1)
         {
            _loc4_ = param1.substr(_loc2_,_loc2_ + 1).toUpperCase();
            _loc2_++;
         }
         return _loc4_;
      }
      
      public static function toUpperCaseFirst(param1:String) : String
      {
         var _loc2_:String = param1.slice(0,1).toUpperCase();
         var _loc3_:String = param1.slice(1);
         return _loc2_ + _loc3_;
      }
      
      public static function toLowerCaseFirst(param1:String) : String
      {
         var _loc2_:String = param1.slice(0,1).toLowerCase();
         var _loc3_:String = param1.slice(1);
         return _loc2_ + _loc3_;
      }
      
      public static function upperCaseFirstCharAndLowerCaseOthers(param1:String) : String
      {
         var _loc2_:String = getFirstAZChar(param1);
         return _loc2_ + param1.substr(1,param1.length).toLowerCase();
      }
      
      public static function trim(param1:String) : String
      {
         return rtrim(ltrim(param1));
      }
      
      public static function ltrim(param1:String) : String
      {
         var _loc2_:RegExp = /^\s*/;
         return param1.replace(_loc2_,"");
      }
      
      public static function rtrim(param1:String) : String
      {
         var _loc2_:RegExp = /\s*$/;
         return param1.replace(_loc2_,"");
      }
      
      public static function isEmail(param1:String) : Boolean
      {
         if(Boolean(param1))
         {
            return trim(param1).match(/\b[\w.-]+@[\w.-]+\.\w{2,4}\b/gi).length == 1;
         }
         return false;
      }
      
      public static function isMobileNO(param1:String) : Boolean
      {
         if(Boolean(param1) && param1.length == 11)
         {
            return param1.match(/\d{11}/).length == 1;
         }
         return false;
      }
      
      public static function truncate(param1:String, param2:int, param3:Boolean = true, param4:String = "…") : String
      {
         var _loc5_:String = null;
         if(param1.length > param2)
         {
            _loc5_ = param1.substr(0,param2);
            if(param3)
            {
               _loc5_ += param4;
            }
            return _loc5_;
         }
         return param1;
      }
      
      public static function clearEnterString(param1:String) : String
      {
         if(Boolean(param1))
         {
            return param1.replace(/\s/g," ");
         }
         return "";
      }
      
      public static function stringToPoint(param1:String) : Point
      {
         var _loc2_:Array = param1.split(";");
         return new Point(_loc2_[0],_loc2_[1]);
      }
      
      private static function buildMatrixFromString(param1:String) : Matrix
      {
         var _loc2_:Array = null;
         var _loc3_:String = null;
         var _loc4_:Array = param1.split(",");
         var _loc5_:Matrix = new Matrix();
         var _loc6_:int = 0;
         while(_loc6_ < _loc4_.length)
         {
            _loc2_ = _loc4_[_loc6_].split("=");
            _loc3_ = trim(_loc2_[0]);
            _loc5_[_loc3_] = _loc2_[1];
            _loc6_++;
         }
         return _loc5_;
      }
      
      public static function replaceWords(param1:String = "", ... rest) : String
      {
         var _loc3_:String = "{}";
         var _loc4_:RegExp = new RegExp(_loc3_);
         var _loc5_:int = 0;
         while(_loc4_.test(param1))
         {
            param1 = param1.replace(_loc4_,rest[_loc5_]);
            _loc5_++;
         }
         return param1;
      }
      
      public static function isWhitespace(param1:String) : Boolean
      {
         return trim(param1).length == 0;
      }
      
      public static function findAll(param1:String, param2:String) : Array
      {
         var _loc3_:Array = [];
         var _loc4_:int = int(param2.indexOf(param1));
         while(_loc4_ != -1)
         {
            _loc3_.push(_loc4_);
            _loc4_ = int(param2.indexOf(param1,_loc4_ + param1.length));
         }
         return _loc3_;
      }
      
      public static function replaceAll(param1:String, param2:String, param3:String) : String
      {
         return param3.replace(new RegExp(param1,"g"),param2);
      }
      
      public static function getLastMultiChars(param1:String, param2:int = 1, param3:Boolean = false) : String
      {
         if(param2 == 0)
         {
            param2 = param1.length;
         }
         var _loc4_:String = param1.slice(param1.length - param2,param1.length);
         if(param3)
         {
            _loc4_ = _loc4_.split("").reverse().join("");
         }
         return _loc4_;
      }
      
      public static function trimLastMultiChars(param1:String, param2:int = 1) : String
      {
         return param1.slice(0,param1.length - param2);
      }
      
      public static function completeZeroFormat(param1:uint, param2:int = 2) : String
      {
         var _loc3_:String = param1.toString();
         while(_loc3_.length < param2)
         {
            _loc3_ = "0" + _loc3_;
         }
         return _loc3_;
      }
      
      public static function int2StringArray(param1:int) : Array
      {
         return param1.toString().split("");
      }
   }
}

