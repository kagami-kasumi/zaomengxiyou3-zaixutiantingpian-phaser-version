package com.dusk.util
{
   import com.dusk.net.*;
   import flash.display.*;
   import flash.system.*;
   
   public class ResUtil extends UtilBase
   {
      
      public function ResUtil()
      {
         super();
      }
      
      public static function getNewObj(param1:String) : *
      {
         var _loc2_:Class = null;
         if(ApplicationDomain.currentDomain.hasDefinition(param1))
         {
            _loc2_ = ApplicationDomain.currentDomain.getDefinition(param1) as Class;
            return new _loc2_();
         }
         var _loc3_:* = AssetManager.getIns().getClassInstance(param1);
         if(!_loc3_)
         {
            return null;
         }
         return _loc3_;
      }
      
      public static function getImageBitmap(param1:String) : Bitmap
      {
         var _loc2_:BitmapData = getNewObj(param1);
         if(!_loc2_)
         {
            return null;
         }
         return new Bitmap(_loc2_);
      }
      
      public static function getImageSprite(param1:String) : Sprite
      {
         var _loc2_:Bitmap = getImageBitmap(param1);
         var _loc3_:Sprite = new Sprite();
         _loc3_.addChild(_loc2_);
         return _loc3_;
      }
      
      public static function getComponentView(param1:String) : DisplayObject
      {
         return getNewObj(getComponentViewKey(param1));
      }
      
      public static function getComponentViewKey(param1:String) : String
      {
         return "gameComponent." + param1;
      }
      
      public static function getLayerView(param1:String) : DisplayObject
      {
         return getNewObj(getLayerViewKey(param1));
      }
      
      public static function getLayerViewKey(param1:String) : String
      {
         return "gameLayer." + param1;
      }
   }
}

