package fl.data
{
   import fl.events.DataChangeEvent;
   import fl.events.DataChangeType;
   import flash.events.EventDispatcher;
   
   public class DataProvider extends EventDispatcher
   {
      
      protected var data:Array;
      
      public function DataProvider(param1:Object = null)
      {
         super();
         if(param1 == null)
         {
            this.data = [];
         }
         else
         {
            this.data = this.getDataFromObject(param1);
         }
      }
      
      public function get length() : uint
      {
         return this.data.length;
      }
      
      public function invalidateItemAt(param1:int) : void
      {
         this.checkIndex(param1,this.data.length - 1);
         this.dispatchChangeEvent(DataChangeType.INVALIDATE,[this.data[param1]],param1,param1);
      }
      
      public function invalidateItem(param1:Object) : void
      {
         var _loc2_:uint = uint(this.getItemIndex(param1));
         if(_loc2_ == -1)
         {
            return;
         }
         this.invalidateItemAt(_loc2_);
      }
      
      public function invalidate() : void
      {
         dispatchEvent(new DataChangeEvent(DataChangeEvent.DATA_CHANGE,DataChangeType.INVALIDATE_ALL,this.data.concat(),0,this.data.length));
      }
      
      public function addItemAt(param1:Object, param2:uint) : void
      {
         this.checkIndex(param2,this.data.length);
         this.dispatchPreChangeEvent(DataChangeType.ADD,[param1],param2,param2);
         this.data.splice(param2,0,param1);
         this.dispatchChangeEvent(DataChangeType.ADD,[param1],param2,param2);
      }
      
      public function addItem(param1:Object) : void
      {
         this.dispatchPreChangeEvent(DataChangeType.ADD,[param1],this.data.length - 1,this.data.length - 1);
         this.data.push(param1);
         this.dispatchChangeEvent(DataChangeType.ADD,[param1],this.data.length - 1,this.data.length - 1);
      }
      
      public function addItemsAt(param1:Object, param2:uint) : void
      {
         this.checkIndex(param2,this.data.length);
         var _loc3_:Array = this.getDataFromObject(param1);
         this.dispatchPreChangeEvent(DataChangeType.ADD,_loc3_,param2,param2 + _loc3_.length - 1);
         this.data.splice.apply(this.data,[param2,0].concat(_loc3_));
         this.dispatchChangeEvent(DataChangeType.ADD,_loc3_,param2,param2 + _loc3_.length - 1);
      }
      
      public function addItems(param1:Object) : void
      {
         this.addItemsAt(param1,this.data.length);
      }
      
      public function concat(param1:Object) : void
      {
         this.addItems(param1);
      }
      
      public function merge(param1:Object) : void
      {
         var _loc6_:Object = null;
         var _loc2_:Array = this.getDataFromObject(param1);
         var _loc3_:uint = _loc2_.length;
         var _loc4_:uint = this.data.length;
         this.dispatchPreChangeEvent(DataChangeType.ADD,this.data.slice(_loc4_,this.data.length),_loc4_,this.data.length - 1);
         var _loc5_:uint = 0;
         while(_loc5_ < _loc3_)
         {
            _loc6_ = _loc2_[_loc5_];
            if(this.getItemIndex(_loc6_) == -1)
            {
               this.data.push(_loc6_);
            }
            _loc5_++;
         }
         if(this.data.length > _loc4_)
         {
            this.dispatchChangeEvent(DataChangeType.ADD,this.data.slice(_loc4_,this.data.length),_loc4_,this.data.length - 1);
         }
         else
         {
            this.dispatchChangeEvent(DataChangeType.ADD,[],-1,-1);
         }
      }
      
      public function getItemAt(param1:uint) : Object
      {
         this.checkIndex(param1,this.data.length - 1);
         return this.data[param1];
      }
      
      public function getItemIndex(param1:Object) : int
      {
         return this.data.indexOf(param1);
      }
      
      public function removeItemAt(param1:uint) : Object
      {
         this.checkIndex(param1,this.data.length - 1);
         this.dispatchPreChangeEvent(DataChangeType.REMOVE,this.data.slice(param1,param1 + 1),param1,param1);
         var _loc2_:Array = this.data.splice(param1,1);
         this.dispatchChangeEvent(DataChangeType.REMOVE,_loc2_,param1,param1);
         return _loc2_[0];
      }
      
      public function removeItem(param1:Object) : Object
      {
         var _loc2_:int = this.getItemIndex(param1);
         if(_loc2_ != -1)
         {
            return this.removeItemAt(_loc2_);
         }
         return null;
      }
      
      public function removeAll() : void
      {
         var _loc1_:Array = this.data.concat();
         this.dispatchPreChangeEvent(DataChangeType.REMOVE_ALL,_loc1_,0,_loc1_.length);
         this.data = [];
         this.dispatchChangeEvent(DataChangeType.REMOVE_ALL,_loc1_,0,_loc1_.length);
      }
      
      public function replaceItem(param1:Object, param2:Object) : Object
      {
         var _loc3_:int = this.getItemIndex(param2);
         if(_loc3_ != -1)
         {
            return this.replaceItemAt(param1,_loc3_);
         }
         return null;
      }
      
      public function replaceItemAt(param1:Object, param2:uint) : Object
      {
         this.checkIndex(param2,this.data.length - 1);
         var _loc3_:Array = [this.data[param2]];
         this.dispatchPreChangeEvent(DataChangeType.REPLACE,_loc3_,param2,param2);
         this.data[param2] = param1;
         this.dispatchChangeEvent(DataChangeType.REPLACE,_loc3_,param2,param2);
         return _loc3_[0];
      }
      
      public function sort(... rest) : *
      {
         this.dispatchPreChangeEvent(DataChangeType.SORT,this.data.concat(),0,this.data.length - 1);
         var _loc2_:Array = this.data.sort.apply(this.data,rest);
         this.dispatchChangeEvent(DataChangeType.SORT,this.data.concat(),0,this.data.length - 1);
         return _loc2_;
      }
      
      public function sortOn(param1:Object, param2:Object = null) : *
      {
         this.dispatchPreChangeEvent(DataChangeType.SORT,this.data.concat(),0,this.data.length - 1);
         var _loc3_:Array = this.data.sortOn(param1,param2);
         this.dispatchChangeEvent(DataChangeType.SORT,this.data.concat(),0,this.data.length - 1);
         return _loc3_;
      }
      
      public function clone() : DataProvider
      {
         return new DataProvider(this.data);
      }
      
      public function toArray() : Array
      {
         return this.data.concat();
      }
      
      override public function toString() : String
      {
         return "DataProvider [" + this.data.join(" , ") + "]";
      }
      
      protected function getDataFromObject(param1:Object) : Array
      {
         var _loc2_:Array = null;
         var _loc3_:Array = null;
         var _loc4_:uint = 0;
         var _loc5_:Object = null;
         var _loc6_:XML = null;
         var _loc7_:XMLList = null;
         var _loc8_:XML = null;
         var _loc9_:XMLList = null;
         var _loc10_:XML = null;
         var _loc11_:XMLList = null;
         var _loc12_:XML = null;
         if(param1 is Array)
         {
            _loc3_ = param1 as Array;
            if(_loc3_.length > 0)
            {
               if(_loc3_[0] is String || _loc3_[0] is Number)
               {
                  _loc2_ = [];
                  _loc4_ = 0;
                  while(_loc4_ < _loc3_.length)
                  {
                     _loc5_ = {
                        "label":String(_loc3_[_loc4_]),
                        "data":_loc3_[_loc4_]
                     };
                     _loc2_.push(_loc5_);
                     _loc4_++;
                  }
                  return _loc2_;
               }
            }
            return param1.concat();
         }
         if(param1 is DataProvider)
         {
            return param1.toArray();
         }
         if(param1 is XML)
         {
            _loc6_ = param1 as XML;
            _loc2_ = [];
            _loc7_ = _loc6_.*;
            for each(_loc8_ in _loc7_)
            {
               param1 = {};
               _loc9_ = _loc8_.attributes();
               for each(_loc10_ in _loc9_)
               {
                  param1[_loc10_.localName()] = _loc10_.toString();
               }
               _loc11_ = _loc8_.*;
               for each(_loc12_ in _loc11_)
               {
                  if(_loc12_.hasSimpleContent())
                  {
                     param1[_loc12_.localName()] = _loc12_.toString();
                  }
               }
               _loc2_.push(param1);
            }
            return _loc2_;
         }
         throw new TypeError("Error: Type Coercion failed: cannot convert " + param1 + " to Array or DataProvider.");
      }
      
      protected function checkIndex(param1:int, param2:int) : void
      {
         if(param1 > param2 || param1 < 0)
         {
            throw new RangeError("DataProvider index (" + param1 + ") is not in acceptable range (0 - " + param2 + ")");
         }
      }
      
      protected function dispatchChangeEvent(param1:String, param2:Array, param3:int, param4:int) : void
      {
         dispatchEvent(new DataChangeEvent(DataChangeEvent.DATA_CHANGE,param1,param2,param3,param4));
      }
      
      protected function dispatchPreChangeEvent(param1:String, param2:Array, param3:int, param4:int) : void
      {
         dispatchEvent(new DataChangeEvent(DataChangeEvent.PRE_DATA_CHANGE,param1,param2,param3,param4));
      }
   }
}

