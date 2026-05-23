package com.dusk.util
{
   import flash.display.*;
   import flash.utils.*;
   
   public class UtilBase
   {
      
      public function UtilBase()
      {
         super();
         throw new Error("util class is not instantiable");
      }
      
      public static function length(param1:*) : int
      {
         var keyNum:int = 0;
         var key:* = undefined;
         var obj:* = param1;
         if(!obj)
         {
            return 0;
         }
         if(obj is Array || obj is String)
         {
            return obj.length;
         }
         if(obj is Sprite)
         {
            return obj.numChildren;
         }
         keyNum = 0;
         keyNum = 0;
         try
         {
            for(key in obj)
            {
               keyNum++;
            }
            return keyNum;
         }
         catch(e:Error)
         {
            return 0;
         }
      }
      
      public static function getAllKeys(param1:*) : Array
      {
         var key:* = undefined;
         var obj:* = param1;
         var keys:Array = [];
         try
         {
            for(key in obj)
            {
               keys.push(key);
            }
            return keys;
         }
         catch(e:Error)
         {
            return [];
         }
      }
      
      public static function getAllValue(param1:*) : Array
      {
         var key:* = undefined;
         var obj:* = param1;
         var values:Array = [];
         try
         {
            for(key in obj)
            {
               values.push(obj[key]);
            }
            return values;
         }
         catch(e:Error)
         {
            return [];
         }
      }
      
      public static function transObj2Dict(param1:Object) : Dictionary
      {
         var _loc2_:* = undefined;
         var _loc3_:Dictionary = new Dictionary();
         for(_loc2_ in param1)
         {
            _loc3_[_loc2_] = param1[_loc2_];
         }
         return _loc3_;
      }
      
      public static function transDict2Obj(param1:Dictionary) : Object
      {
         var _loc2_:* = undefined;
         var _loc3_:Object = {};
         for(_loc2_ in param1)
         {
            _loc3_[_loc2_] = param1[_loc2_];
         }
         return _loc3_;
      }
      
      public static function clone(param1:Object) : Object
      {
         var _loc2_:ByteArray = new ByteArray();
         _loc2_.writeObject(param1);
         _loc2_.position = 0;
         return _loc2_.readObject();
      }
      
      public static function equal(param1:Object, param2:Object) : Boolean
      {
         var _loc3_:ByteArray = new ByteArray();
         var _loc4_:ByteArray = new ByteArray();
         _loc4_.writeObject(param1);
         _loc4_.position = 0;
         _loc3_.writeObject(param2);
         _loc3_.position = 0;
         if(_loc4_.length == _loc3_.length)
         {
            while(Boolean(_loc4_.bytesAvailable))
            {
               if(_loc4_.readByte() != _loc3_.readByte())
               {
                  return false;
               }
            }
            return true;
         }
         return false;
      }
      
      public static function getObjectID(param1:Object) : String
      {
         var _loc2_:String = null;
         var _loc3_:Array = [];
         for(_loc2_ in param1)
         {
            _loc3_.push(_loc2_ + ":" + param1[_loc2_]);
         }
         _loc3_.sort();
         return _loc3_.join(",");
      }
      
      public static function clearAll(param1:Object) : void
      {
         var _loc2_:* = undefined;
         for each(_loc2_ in getAllKeys(param1))
         {
            delete param1[_loc2_];
         }
      }
   }
}

