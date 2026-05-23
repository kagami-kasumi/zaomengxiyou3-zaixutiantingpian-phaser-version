package com.multi4399
{
   import flash.utils.*;
   
   public class Utils
   {
      
      public function Utils()
      {
         super();
      }
      
      public static function byte4_to_ints(param1:ByteArray) : Array
      {
         param1.position = 0;
         var _loc2_:Array = new Array();
         var _loc3_:int = param1.length / 4;
         param1.endian = Endian.LITTLE_ENDIAN;
         var _loc4_:int = 0;
         while(_loc4_ < _loc3_)
         {
            _loc2_.push(param1.readUnsignedInt());
            _loc4_++;
         }
         return _loc2_;
      }
      
      public static function ints_to_byte4(param1:Array) : ByteArray
      {
         var _loc2_:ByteArray = new ByteArray();
         var _loc3_:int = int(param1.length);
         _loc2_.endian = Endian.LITTLE_ENDIAN;
         var _loc4_:int = 0;
         while(_loc4_ < _loc3_)
         {
            _loc2_.writeUnsignedInt(param1[_loc4_]);
            _loc4_++;
         }
         _loc2_.position = 0;
         return _loc2_;
      }
      
      public static function byte2_to_ints(param1:ByteArray) : Array
      {
         param1.position = 0;
         var _loc2_:Array = new Array();
         var _loc3_:int = param1.length / 2;
         param1.endian = Endian.LITTLE_ENDIAN;
         var _loc4_:int = 0;
         while(_loc4_ < _loc3_)
         {
            _loc2_.push(param1.readUnsignedShort());
            _loc4_++;
         }
         return _loc2_;
      }
      
      public static function ints_to_byte2(param1:Array) : ByteArray
      {
         var _loc2_:ByteArray = new ByteArray();
         var _loc3_:int = int(param1.length);
         _loc2_.endian = Endian.LITTLE_ENDIAN;
         var _loc4_:int = 0;
         while(_loc4_ < _loc3_)
         {
            _loc2_.writeShort(param1[_loc4_]);
            _loc4_++;
         }
         _loc2_.position = 0;
         return _loc2_;
      }
      
      public function var2bin(param1:*, param2:String = "bigEndian") : ByteArray
      {
         var _loc3_:ByteArray = null;
         var _loc4_:String = getQualifiedClassName(param1);
         _loc3_ = new ByteArray();
         _loc3_.endian = param2;
         switch(_loc4_)
         {
            case "int":
               _loc3_.writeInt(param1);
               break;
            case "Number":
               _loc3_.writeDouble(param1);
               break;
            case "String":
               _loc3_.writeUTFBytes(param1);
               break;
            case "Array":
               _loc3_.writeUTFBytes(param1.toString());
               break;
            case "flash.utils::ByteArray":
               _loc3_ = param1;
         }
         return _loc3_;
      }
   }
}

