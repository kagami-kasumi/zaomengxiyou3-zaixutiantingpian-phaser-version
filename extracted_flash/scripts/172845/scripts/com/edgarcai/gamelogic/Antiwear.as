package com.edgarcai.gamelogic
{
   import com.edgarcai.encrypt.IEncrypt;
   import com.edgarcai.util.*;
   import flash.utils.*;
   
   use namespace flash_proxy;
   
   public dynamic class Antiwear extends Proxy
   {
      
      public var encrypt:IEncrypt;
      
      public var errorHandler:Function;
      
      public var data:Object;
      
      private var _data:Object;
      
      public function Antiwear(param1:IEncrypt)
      {
         super();
         this.encrypt = param1;
         this.data = new Object();
         this._data = new Object();
         this.errorHandler = this.defaultErrorHandler;
      }
      
      protected function defaultErrorHandler() : void
      {
      }
      
      override flash_proxy function callProperty(param1:*, ... rest) : *
      {
         var _loc3_:* = this.data[param1];
         return (_loc3_ as Function).apply(null,rest);
      }
      
      override flash_proxy function getProperty(param1:*) : *
      {
         if(param1 == null)
         {
            return null;
         }
         var _loc2_:* = this.encrypt.decode(this._data[param1]);
         if(_loc2_ is Number || _loc2_ is String)
         {
            if(_loc2_ != this.data[param1])
            {
               this.errorHandler();
            }
         }
         else if(!Utils.equal(_loc2_,this.data[param1]))
         {
            this.errorHandler();
         }
         return _loc2_;
      }
      
      override flash_proxy function setProperty(param1:*, param2:*) : void
      {
         var _loc3_:ByteArray = null;
         if(param2 is Number || param2 is String)
         {
            this.data[param1] = param2;
         }
         else
         {
            _loc3_ = new ByteArray();
            _loc3_.writeObject(param2);
            _loc3_.position = 0;
            this.data[param1] = _loc3_.readObject();
         }
         this._data[param1] = this.encrypt.encode(param2);
      }
   }
}

