package com.dusk.net
{
   public class AssetUrl
   {
      
      public static var PATH:String = "./";
      
      public function AssetUrl()
      {
         super();
      }
      
      public static function getCommonAssetsUrl(param1:String) : String
      {
         return AssetUrl.PATH + "assets/" + param1;
      }
      
      public static function getCommonAssetsUrlByName(param1:String, param2:String = ".swf") : String
      {
         return AssetUrl.PATH + "assets/" + param1 + param2;
      }
      
      public static function getInterFaceAssetsUrl(param1:String) : String
      {
         return AssetUrl.PATH + "assets/uiAsset/" + param1 + ".swf";
      }
      
      public static function getPetAssetsUrl(param1:String) : String
      {
         return AssetUrl.PATH + "assets/pet/" + param1 + ".swf";
      }
      
      public static function getSoundAssetUrl(param1:String) : String
      {
         return AssetUrl.PATH + "assets/sound/" + param1 + ".mp3";
      }
      
      public static function getConfigAssetUrl(param1:String) : String
      {
         return AssetUrl.PATH + "assets/config/" + param1;
      }
      
      public static function getLibUrl(param1:String) : String
      {
         return AssetUrl.PATH + "assets/lib/" + param1;
      }
      
      public static function getRoleAssetUrl(param1:String) : String
      {
         return "role/" + param1;
      }
   }
}

