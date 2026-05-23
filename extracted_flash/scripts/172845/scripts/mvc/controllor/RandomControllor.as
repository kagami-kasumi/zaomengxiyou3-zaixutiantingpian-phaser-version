package mvc.controllor
{
   public class RandomControllor
   {
      
      private static var _this:RandomControllor;
      
      public var randomIndex:int = 100;
      
      private var randomString:String = "";
      
      public function RandomControllor()
      {
         _this = this;
         super();
      }
      
      public static function getIns() : RandomControllor
      {
         return _this;
      }
      
      public function clearString() : void
      {
         this.randomString = "";
      }
      
      public function getRandom() : Number
      {
         return Math.random();
      }
   }
}

