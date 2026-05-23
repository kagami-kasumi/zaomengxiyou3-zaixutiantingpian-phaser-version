package com.edgarcai.util
{
   import flash.utils.*;
   
   public final class Utils
   {
      
      public function Utils()
      {
         super();
      }
      
      public static function equal(param1:*, param2:*) : Boolean
      {
         var _loc3_:ByteArray = null;
         var _loc4_:ByteArray = new ByteArray();
         _loc4_.writeObject(param1);
         _loc4_.position = 0;
         _loc3_ = new ByteArray();
         _loc3_.writeObject(param2);
         _loc3_.position = 0;
         if(_loc4_.length == _loc3_.length)
         {
            while(_loc4_.bytesAvailable)
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
   }
}

