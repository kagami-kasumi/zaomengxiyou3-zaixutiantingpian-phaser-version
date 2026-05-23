package loader
{
   public class AssetsUrl
   {
      
      public static var PATH:String = "./";
      
      public static var TYPE_SWF:String = ".swf";
      
      public static var TYPE_IMAGE:String = ".png";
      
      public static var TYPE_XML:String = ".xml";
      
      public function AssetsUrl()
      {
         super();
      }
      
      public static function getAssetsUrl(param1:String) : String
      {
         return AssetsUrl.PATH + "assets/" + param1;
      }
      
      public static function getAssetsImage(param1:String) : String
      {
         return param1 + AssetsUrl.TYPE_IMAGE;
      }
      
      public static function getAssetsSwf(param1:String) : String
      {
         return param1 + AssetsUrl.TYPE_SWF;
      }
      
      public static function getAssetsXml(param1:String) : String
      {
         return param1 + AssetsUrl.TYPE_XML;
      }
   }
}

