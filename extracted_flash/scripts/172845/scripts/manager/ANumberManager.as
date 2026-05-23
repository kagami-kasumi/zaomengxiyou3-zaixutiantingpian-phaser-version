package manager
{
   import my.*;
   
   public class ANumberManager
   {
      
      internal static var instance:ANumberManager;
      
      private var child:Array;
      
      public function ANumberManager()
      {
         this.child = new Array();
         super();
      }
      
      public static function getInstance() : ANumberManager
      {
         if(!instance)
         {
            instance = new ANumberManager();
         }
         return instance;
      }
      
      public function createANumber() : ANumber
      {
         var _loc1_:int = 0;
         var _loc2_:* = null;
         _loc1_ = 0;
         while(_loc1_ < this.child.length)
         {
            _loc2_ = this.child[_loc1_];
            if(!_loc2_.isUse)
            {
               return _loc2_;
            }
            _loc1_++;
         }
         var _loc3_:ANumber = new ANumber();
         this.child.push(_loc3_);
         return _loc3_;
      }
   }
}

