package com.edgarcai.encrypt
{
   import flash.utils.*;
   
   public class binaryEncrypt implements IEncrypt
   {
      
      private var _ran:Number;
      
      private var _max:Number = 655360;
      
      public function binaryEncrypt()
      {
         this._ran = Math.random() * 10000;
         super();
      }
      
      protected function encodeCommand(param1:Number) : Number
      {
         var _loc2_:Number = param1 ^ Number(this._ran);
         return _loc2_ >> Number(this._max);
      }
      
      protected function decodeCommand(param1:Number) : Number
      {
         var _loc2_:Number = param1 << Number(this._max);
         return Number(_loc2_ ^ Number(this._ran));
      }
      
      public function encode(param1:*) : *
      {
         var _loc2_:ByteArray = new ByteArray();
         _loc2_.writeObject(param1);
         _loc2_.position = 0;
         var _loc3_:ByteArray = new ByteArray();
         while(_loc2_.bytesAvailable)
         {
            _loc3_.writeInt(this.encodeCommand(_loc2_.readByte()));
         }
         return _loc3_;
      }
      
      public function decode(param1:*) : *
      {
         var _loc2_:ByteArray = null;
         var _loc3_:ByteArray = null;
         if(param1 is ByteArray)
         {
            _loc2_ = param1 as ByteArray;
            _loc2_.position = 0;
            _loc3_ = new ByteArray();
            while(_loc2_.bytesAvailable)
            {
               _loc3_.writeByte(this.decodeCommand(_loc2_.readInt()));
            }
            _loc3_.position = 0;
            return _loc3_.readObject();
         }
         throw new Error("数据类型不正确");
      }
   }
}

