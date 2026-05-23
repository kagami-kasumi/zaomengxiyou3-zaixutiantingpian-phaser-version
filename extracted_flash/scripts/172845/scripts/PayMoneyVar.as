package
{
   public class PayMoneyVar
   {
      
      public static var instance:PayMoneyVar;
      
      private var _money:Object;
      
      public function PayMoneyVar()
      {
         super();
         if(PayMoneyVar.instance != null)
         {
            throw "只能实例一次！";
         }
      }
      
      public static function getInstance() : PayMoneyVar
      {
         if(instance == null)
         {
            instance = new PayMoneyVar();
         }
         return instance;
      }
      
      public function set money(param1:int) : void
      {
         param1 = Math.abs(param1);
         var _loc2_:Object = {"value":param1};
         _loc2_ = {"value":_loc2_.value};
         this._money = _loc2_;
      }
      
      public function get money() : int
      {
         if(this._money == null)
         {
            return 0;
         }
         var _loc1_:Object = new Object();
         _loc1_.value = this._money.value;
         return int(_loc1_.value);
      }
   }
}

