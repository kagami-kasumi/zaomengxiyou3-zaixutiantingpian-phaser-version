package loader
{
   import flash.display.LoaderInfo;
   
   public class AssetsItem
   {
      
      private var _data:*;
      
      private var _type:uint;
      
      private var _loaderInfo:LoaderInfo;
      
      private var _url:String = "";
      
      public function AssetsItem()
      {
         super();
      }
      
      public function get data() : *
      {
         return this._data;
      }
      
      public function set data(param1:*) : void
      {
         this._data = param1;
      }
      
      public function get type() : uint
      {
         return this._type;
      }
      
      public function set type(param1:uint) : void
      {
         this._type = param1;
      }
      
      public function get loaderInfo() : LoaderInfo
      {
         return this._loaderInfo;
      }
      
      public function set loaderInfo(param1:LoaderInfo) : void
      {
         this._loaderInfo = param1;
      }
      
      public function get url() : String
      {
         return this._url;
      }
      
      public function set url(param1:String) : void
      {
         this._url = param1;
      }
   }
}

