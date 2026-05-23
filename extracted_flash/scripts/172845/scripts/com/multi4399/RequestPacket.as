package com.multi4399
{
   import com.multi4399.define.*;
   import flash.utils.*;
   
   public class RequestPacket extends ByteArray
   {
      
      private var _size1:ByteArray;
      
      private var _size2:ByteArray;
      
      private var _size4:ByteArray;
      
      private var _size8:ByteArray;
      
      private var _sizeM:ByteArray;
      
      public const HEADER_SIZE:uint = 20;
      
      public const MAX_SIZE:uint = 1024;
      
      public function RequestPacket(param1:String = "littleEndian")
      {
         this._size1 = new ByteArray();
         this._size2 = new ByteArray();
         this._size4 = new ByteArray();
         this._size8 = new ByteArray();
         this._sizeM = new ByteArray();
         super();
         this.endian = this._size1.endian = this._size2.endian = this._size4.endian = this._size8.endian = this._sizeM.endian = param1;
         this.reset();
         this[0] = 89;
         this[1] = 77;
         this[2] = 80;
         this[3] = 0;
         this[4] = 65;
         this[5] = 0;
      }
      
      public function reset() : void
      {
         this.length = 20;
         this.position = 20;
         this._size1.length = this._size2.length = this._size4.length = this._size8.length = this._sizeM.length = 0;
         this._size1.position = this._size2.position = this._size4.position = this._size8.position = this._sizeM.position = 0;
      }
      
      public function addInstruction(param1:uint, ... rest) : void
      {
         var _loc3_:* = 0;
         var _loc4_:* = undefined;
         var _loc5_:int = int(rest.length);
         var _loc6_:int = 0;
         var _loc7_:int = 0;
         if(_loc5_ > 14)
         {
            throw new Error("不能超过7个操作数");
         }
         this.writeShort(param1);
         var _loc8_:int = 0;
         while(_loc8_ < _loc5_)
         {
            _loc3_ = uint(rest[_loc8_]);
            _loc4_ = rest[_loc8_ + 1];
            this.writeByte(_loc3_);
            switch(_loc3_)
            {
               case OPRAND.SIZE_1:
                  this._size1.writeByte(_loc4_);
                  break;
               case OPRAND.SIZE_2:
                  this._size2.writeShort(_loc4_);
                  break;
               case OPRAND.SIZE_4:
                  this._size4.writeUnsignedInt(_loc4_);
                  break;
               case OPRAND.SIZE_8:
                  this._size8.writeDouble(_loc4_);
                  break;
               case OPRAND.SIZE_M:
                  this._sizeM.writeShort(_loc4_.length);
                  this._sizeM.writeBytes(_loc4_);
                  break;
               case Number(OPRAND.SIZE_M) | Number(OPRAND.TYPE_BYTE):
                  this._sizeM.writeShort(1);
                  this._sizeM.writeByte(_loc4_);
                  break;
               case Number(OPRAND.SIZE_M) | Number(OPRAND.TYPE_SHORT):
                  this._sizeM.writeShort(2);
                  this._sizeM.writeShort(_loc4_);
                  break;
               case Number(OPRAND.SIZE_M) | Number(OPRAND.TYPE_INT):
                  this._sizeM.writeShort(4);
                  this._sizeM.writeInt(_loc4_);
                  break;
               case Number(OPRAND.SIZE_M) | Number(OPRAND.TYPE_NUMBER):
                  this._sizeM.writeShort(8);
                  this._sizeM.writeDouble(_loc4_);
                  break;
               case Number(OPRAND.SIZE_M) | Number(OPRAND.TYPE_STRING):
                  this._sizeM.position += 2;
                  _loc6_ = int(this._sizeM.position);
                  this._sizeM.writeUTFBytes(_loc4_);
                  _loc7_ = Number(this._sizeM.position) - _loc6_;
                  this._sizeM.position = _loc6_ - 2;
                  this._sizeM.writeShort(_loc7_);
                  this._sizeM.position += _loc7_;
                  break;
               case Number(OPRAND.SIZE_M) | Number(OPRAND.TYPE_XML):
                  _loc4_ = _loc4_.toXMLString();
                  this._sizeM.position += 2;
                  _loc6_ = int(this._sizeM.position);
                  this._sizeM.writeUTFBytes(_loc4_);
                  _loc7_ = Number(this._sizeM.position) - _loc6_;
                  this._sizeM.position = _loc6_ - 2;
                  this._sizeM.writeShort(_loc7_);
                  this._sizeM.position += _loc7_;
                  break;
               default:
                  throw new Error("不支持的变量类型");
            }
            _loc8_ += 2;
         }
      }
      
      public function pack(param1:uint) : void
      {
         var _loc2_:int = 0;
         this.writeShort(0);
         _loc2_ = this._size1.length ? int(this.length - this.HEADER_SIZE) : 0;
         _loc2_ && this.writeBytes(this._size1);
         this[10] = _loc2_ & 0xFF;
         this[11] = (_loc2_ & 0xFF00) >> 8;
         _loc2_ = this._size2.length ? int(this.length - this.HEADER_SIZE) : 0;
         _loc2_ && this.writeBytes(this._size2);
         this[12] = _loc2_ & 0xFF;
         this[13] = (_loc2_ & 0xFF00) >> 8;
         _loc2_ = this._size4.length ? int(this.length - this.HEADER_SIZE) : 0;
         _loc2_ && this.writeBytes(this._size4);
         this[14] = _loc2_ & 0xFF;
         this[15] = (_loc2_ & 0xFF00) >> 8;
         _loc2_ = this._size8.length ? int(this.length - this.HEADER_SIZE) : 0;
         _loc2_ && this.writeBytes(this._size8);
         this[16] = _loc2_ & 0xFF;
         this[17] = (_loc2_ & 0xFF00) >> 8;
         _loc2_ = this._sizeM.length ? int(this.length - this.HEADER_SIZE) : 0;
         _loc2_ && this.writeBytes(this._sizeM);
         this[18] = _loc2_ & 0xFF;
         this[19] = (_loc2_ & 0xFF00) >> 8;
         _loc2_ = int(this.length);
         this[6] = _loc2_ & 0xFF;
         this[7] = (_loc2_ & 0xFF00) >> 8;
         this[8] = param1 & 0xFF;
         this[9] = (param1 & 0xFF00) >> 8;
         if(this.length > this.MAX_SIZE)
         {
            throw new Error("发送的数据包长度越过最大值:" + this.MAX_SIZE + "个字节,请分开发送!");
         }
      }
   }
}

