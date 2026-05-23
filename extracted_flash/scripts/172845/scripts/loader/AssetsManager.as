package loader
{
   public class AssetsManager
   {
      
      internal static var _ins:AssetsManager;
      
      private var assetsArray:Array;
      
      private var assetsVec:Array;
      
      public function AssetsManager()
      {
         this.assetsArray = [];
         super();
         this.assetsVec = new Array();
      }
      
      public static function getInstance() : AssetsManager
      {
         if(!_ins)
         {
            _ins = new AssetsManager();
         }
         return _ins;
      }
      
      public function addAssets(param1:AssetsItem) : void
      {
         this.assetsVec.push(param1);
      }
      
      public function getAssets(param1:String) : AssetsItem
      {
         var _loc2_:* = undefined;
         for each(_loc2_ in this.assetsVec)
         {
            if(_loc2_.url == param1)
            {
               return _loc2_;
            }
         }
         return null;
      }
      
      public function addAssetsName(param1:String) : void
      {
         if(this.assetsArray.indexOf(param1) == -1)
         {
            this.assetsArray.push(param1);
         }
      }
      
      public function contains(param1:String) : Boolean
      {
         return this.assetsArray.indexOf(param1) != -1;
      }
   }
}

