package my
{
   import flash.utils.*;
   
   public class MyProtectedProperty
   {
      
      private var dict:Dictionary;
      
      public function MyProtectedProperty()
      {
         this.dict = new Dictionary();
         super();
      }
      
      public function addProperty(param1:Object, param2:String, param3:Object) : void
      {
         var _loc4_:Object = null;
         _loc4_ = new Object();
         _loc4_[param2] = param3;
         this.dict[param1] = _loc4_;
      }
      
      public function setProperty(param1:Object, param2:String, param3:Object) : void
      {
         var _loc4_:Object = null;
         _loc4_ = this.dict[param1];
         if(_loc4_)
         {
            if(_loc4_[param2] != param3)
            {
               _loc4_[param2] = param3;
               this.dict[param1] = _loc4_;
            }
         }
      }
      
      public function getProperty(param1:Object, param2:String) : Object
      {
         var _loc3_:Object = this.dict[param1];
         if(_loc3_)
         {
            return _loc3_[param2];
         }
         return 0;
      }
      
      public function removeProperty(param1:Object) : void
      {
         this.dict[param1] = null;
      }
      
      public function clear() : void
      {
         var _loc1_:* = null;
         for(_loc1_ in this.dict)
         {
            _loc1_ = null;
         }
         this.dict = new Dictionary();
      }
   }
}

