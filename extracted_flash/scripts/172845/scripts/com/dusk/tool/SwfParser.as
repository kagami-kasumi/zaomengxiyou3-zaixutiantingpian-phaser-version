package com.dusk.tool
{
   import flash.utils.*;
   
   public class SwfParser
   {
      
      private var _swfByteArray:ByteArray;
      
      private var _swfSize:int;
      
      private var _frameRate:int;
      
      private var _frameTotal:int;
      
      private var _version:int;
      
      private var _classList:Array;
      
      public function SwfParser()
      {
         this._swfByteArray = new ByteArray();
         super();
      }
      
      public function parseSwf(param1:ByteArray) : void
      {
         var _loc2_:* = param1;
         var _loc3_:String = _loc2_.readUTFBytes(3);
         this._version = _loc2_.readByte();
         var _loc4_:uint = uint(_loc2_.readUnsignedInt());
         _loc2_.position = 8;
         _loc2_.readBytes(this._swfByteArray);
         if(_loc3_ == "CWS")
         {
            this._swfByteArray.uncompress();
         }
         this._swfByteArray.endian = "littleEndian";
         this._swfSize = this._swfByteArray.readUnsignedByte() >> 3;
         this._swfByteArray.position = Math.ceil(this._swfSize * 4 / 8 + 5);
         this._frameRate = this._swfByteArray.readShort() / 256;
         this._frameTotal = this._swfByteArray.readShort();
      }
      
      public function getSymbolClassLink() : Array
      {
         var _local_3:int = 0;
         var _local_2:int = 0;
         var _local_1:int = 0;
         this._swfByteArray.endian = "littleEndian";
         while(Boolean(this._swfByteArray.bytesAvailable))
         {
            _local_3 = int(this._swfByteArray.readShort());
            _local_2 = _local_3 >> 6;
            _local_1 = _local_3 & 0x3F;
            if(_local_1 == 63)
            {
               _local_1 = int(this._swfByteArray.readUnsignedInt());
            }
            if(_local_2 == 76)
            {
               this._classList = [];
               try
               {
                  this.parseSymbolClass(_local_1);
               }
               catch(error:Error)
               {
                  throw new Error("素材解析出错");
               }
            }
            else
            {
               this._swfByteArray.position += _local_1;
            }
         }
         return this._classList;
      }
      
      private function parseSymbolClass(param1:int) : void
      {
         var _loc2_:int = 0;
         var _loc3_:int = 0;
         var _loc4_:* = null;
         var _loc5_:* = int(this._swfByteArray.readShort());
         while(Boolean(_loc5_--))
         {
            _loc2_ = int(this._swfByteArray.readUnsignedShort());
            _loc3_ = int(this._swfByteArray.readByte());
            _loc4_ = "";
            while(Boolean(_loc3_))
            {
               _loc4_ += String.fromCharCode(_loc3_);
               _loc3_ = int(this._swfByteArray.readByte());
            }
            this._classList.push(_loc4_);
         }
      }
   }
}

