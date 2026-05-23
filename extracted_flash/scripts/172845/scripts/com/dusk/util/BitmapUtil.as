package com.dusk.util
{
   import com.game.manager.*;
   import com.game.view.display.*;
   import flash.display.*;
   import flash.filters.*;
   import flash.geom.*;
   
   public class BitmapUtil extends UtilBase
   {
      
      public function BitmapUtil()
      {
         super();
      }
      
      public static function createPureBitmap(param1:int = 50, param2:int = 50, param3:uint = 16711680) : Bitmap
      {
         return new Bitmap(new BitmapData(param1,param2,false,param3),"auto",true);
      }
      
      public static function buildRows(param1:BitmapData, param2:Rectangle) : TextureGroup
      {
         var _loc3_:BitmapData = null;
         var _loc4_:int = Math.ceil(param1.width / param2.width);
         var _loc5_:TextureGroup = new TextureGroup();
         var _loc6_:int = 0;
         while(_loc6_ < _loc4_)
         {
            param2.x = _loc6_ * param2.width;
            _loc3_ = new BitmapData(param2.width,param2.height,true,0);
            _loc3_.copyPixels(param1,param2,new Point());
            _loc5_.addTexture(new Texture(_loc3_));
            _loc6_++;
         }
         return _loc5_;
      }
      
      public static function buildCols(param1:BitmapData, param2:Rectangle) : TextureGroup
      {
         var _loc3_:BitmapData = null;
         var _loc4_:int = Math.ceil(param1.width / param2.height);
         var _loc5_:TextureGroup = new TextureGroup();
         var _loc6_:int = 0;
         while(_loc6_ < _loc4_)
         {
            param2.y = _loc6_ * param2.height;
            _loc3_ = new BitmapData(param2.width,param2.height,true,0);
            _loc3_.copyPixels(param1,param2,new Point());
            _loc5_.addTexture(new Texture(_loc3_));
            _loc6_++;
         }
         return _loc5_;
      }
      
      public static function buildRowCol(param1:BitmapData, param2:int, param3:int, param4:Rectangle = null) : TextureGroup
      {
         var _loc5_:int = 0;
         var _loc6_:BitmapData = null;
         var _loc7_:TextureGroup = new TextureGroup();
         var _loc8_:Rectangle = new Rectangle();
         _loc8_.width = param1.width / param2;
         _loc8_.height = param1.height / param3;
         if(param4 != null)
         {
            _loc8_ = param4;
         }
         var _loc9_:int = 0;
         while(_loc9_ < param3)
         {
            _loc8_.y = _loc9_ * _loc8_.height;
            _loc5_ = 0;
            while(_loc5_ < param2)
            {
               _loc8_.x = _loc5_ * _loc8_.width;
               _loc6_ = new BitmapData(_loc8_.width,_loc8_.height,true,0);
               _loc6_.copyPixels(param1,_loc8_,new Point());
               _loc7_.addTexture(new Texture(_loc6_));
               _loc5_++;
            }
            _loc9_++;
         }
         return _loc7_;
      }
      
      public static function scaleToTargetSize(param1:Bitmap, param2:int, param3:int) : Bitmap
      {
         param1.width = param2;
         param1.height = param3;
         return param1;
      }
      
      public static function rotate(param1:BitmapData, param2:Number, param3:Boolean = true) : BitmapData
      {
         var _loc4_:int = 0;
         var _loc5_:int = 0;
         var _loc6_:Number = param2 * Math.PI / 180;
         if(param2 % 180 == 0)
         {
            _loc4_ = param1.width;
            _loc5_ = param1.height;
         }
         else if(param2 % 90 == 0)
         {
            _loc4_ = param1.height;
            _loc5_ = param1.width;
         }
         else
         {
            _loc4_ = Math.abs(Math.cos(_loc6_) * param1.width) + Math.abs(Math.sin(_loc6_) * param1.height);
            _loc5_ = Math.abs(Math.sin(_loc6_) * param1.width) + Math.abs(Math.cos(_loc6_) * param1.height);
         }
         var _loc7_:BitmapData = new BitmapData(_loc4_,_loc5_,true,0);
         var _loc8_:Matrix = new Matrix();
         _loc8_.translate(-param1.width / 2,-param1.height / 2);
         _loc8_.rotate(_loc6_);
         _loc8_.translate(param1.height / 2,param1.width / 2);
         _loc7_.draw(param1,_loc8_);
         if(param3)
         {
            param1.dispose();
         }
         return _loc7_;
      }
      
      public static function rgb2gray(param1:BitmapData) : BitmapData
      {
         var _loc2_:Number = 0.3;
         var _loc3_:Number = 0.59;
         var _loc4_:Number = 0.11;
         var _loc5_:Array = [_loc2_,_loc3_,_loc4_,0,0,_loc2_,_loc3_,_loc4_,0,0,_loc2_,_loc3_,_loc4_,0,0,0,0,0,1,0];
         var _loc6_:ColorMatrixFilter = new ColorMatrixFilter(_loc5_);
         param1.applyFilter(param1,param1.rect,new Point(),_loc6_);
         return param1;
      }
      
      public static function wrapBorder(param1:BitmapData, param2:uint = 16711680, param3:int = 3) : BitmapData
      {
         var _loc4_:BitmapData = new BitmapData(param1.width + 2 * param3,param1.height + 2 * param3,param1.transparent,param2 | 0xFF000000);
         var _loc5_:Point = new Point(param3,param3);
         _loc4_.copyPixels(param1,param1.rect,_loc5_);
         param1.dispose();
         return _loc4_;
      }
      
      public static function wrapRoundRect(param1:BitmapData, param2:int = 5) : BitmapData
      {
         var _loc3_:BitmapData = new BitmapData(param1.width,param1.height,true,0);
         var _loc4_:Shape = new Shape();
         _loc4_.graphics.beginFill(16777215);
         _loc4_.graphics.drawRoundRect(0,0,param1.width,param1.height,param2,param2);
         _loc4_.graphics.endFill();
         var _loc5_:BitmapData = new BitmapData(param1.width,param1.height,true,0);
         _loc5_.draw(_loc4_);
         _loc3_.copyPixels(param1,param1.rect,new Point(0,0),_loc5_,new Point(0,0),true);
         return _loc3_;
      }
      
      public static function cropTransparentRegion(param1:BitmapData) : BitmapData
      {
         var _loc2_:Rectangle = getOpaqueRegion(param1);
         return cropImage(param1,_loc2_,true);
      }
      
      public static function getOpaqueRegion(param1:BitmapData) : Rectangle
      {
         var _loc2_:Rectangle = param1.getColorBoundsRect(4278190080,0,false);
         if(_loc2_.isEmpty())
         {
            return new Rectangle(0,0,param1.width,param1.height);
         }
         return _loc2_;
      }
      
      public static function cropImage(param1:BitmapData, param2:Rectangle, param3:Boolean = true) : BitmapData
      {
         var bmd:BitmapData = null;
         var bd:BitmapData = null;
         bmd = param1;
         var rect:Rectangle = param2;
         var isDispose:Boolean = param3;
         try
         {
            bd = new BitmapData(rect.width,rect.height);
            bd.copyPixels(bmd,rect,new Point());
            if(isDispose)
            {
               bmd.dispose();
            }
            return bd;
         }
         catch(e:ArgumentError)
         {
            if(e.errorID == 2015)
            {
               GameSceneManager.getIns().switchScene(GameSceneManager.GAME_MAP);
               AnimationManager.clearAllCache();
               return bmd;
            }
            return null;
         }
      }
      
      public static function drawSpriteToBitmap(param1:Sprite, param2:Boolean = true) : BitmapData
      {
         var _loc3_:Sprite = new Sprite();
         param1.x = param1.y = 0;
         _loc3_.addChild(param1);
         var _loc4_:Rectangle = param1.getBounds(_loc3_);
         var _loc5_:BitmapData = new BitmapData(_loc4_.width,_loc4_.height,true,0);
         _loc5_.draw(_loc3_,new Matrix(1,0,0,1,-_loc4_.x,-_loc4_.y),null,null,null,true);
         if(param2)
         {
            return cropTransparentRegion(_loc5_);
         }
         return _loc5_;
      }
      
      public static function applyGradientToBitmapData(param1:BitmapData, param2:Array, param3:Array, param4:Array, param5:String = "linear", param6:Matrix = null) : BitmapData
      {
         var _loc7_:int = 0;
         var _loc8_:uint = 0;
         var _loc9_:uint = 0;
         var _loc10_:uint = 0;
         var _loc11_:uint = 0;
         if(param6 == null)
         {
            param6 = new Matrix();
            param6.createGradientBox(param1.width,param1.height,Math.PI / 2,0,0);
         }
         var _loc12_:Shape = new Shape();
         _loc12_.graphics.beginGradientFill(param5,param2,param3,param4,param6);
         _loc12_.graphics.drawRect(0,0,param1.width,param1.height);
         _loc12_.graphics.endFill();
         var _loc13_:BitmapData = new BitmapData(param1.width,param1.height,true,0);
         _loc13_.draw(_loc12_);
         var _loc14_:BitmapData = new BitmapData(param1.width,param1.height,true,0);
         var _loc15_:int = 0;
         while(_loc15_ < param1.height)
         {
            _loc7_ = 0;
            while(_loc7_ < param1.width)
            {
               _loc8_ = param1.getPixel32(_loc7_,_loc15_);
               _loc9_ = uint(_loc8_ >> 24 & 0xFF);
               if(_loc9_ > 0)
               {
                  _loc10_ = _loc13_.getPixel32(_loc7_,_loc15_);
                  _loc11_ = uint(_loc10_ & 0xFFFFFF);
                  _loc14_.setPixel32(_loc7_,_loc15_,_loc9_ << 24 | _loc11_);
               }
               _loc7_++;
            }
            _loc15_++;
         }
         return _loc14_;
      }
      
      public static function analysePlistToTextureGroup(param1:*, param2:BitmapData) : TextureGroup
      {
         var _loc3_:String = null;
         var _loc4_:Object = null;
         var _loc5_:Array = null;
         var _loc6_:Rectangle = null;
         var _loc7_:Point = null;
         var _loc8_:Point = null;
         var _loc9_:Boolean = false;
         var _loc10_:XML = param1 is String ? XML(param1) : param1;
         param1 = TexturePackerParser.xml2Obj(_loc10_);
         var _loc11_:Object = param1.frames;
         var _loc12_:Array = TexturePackerParser.sortFrameKey(_loc11_);
         var _loc13_:TextureGroup = new TextureGroup();
         for each(_loc3_ in _loc12_)
         {
            _loc4_ = _loc11_[_loc3_];
            _loc5_ = TexturePackerParser.args2arr(_loc4_.frame || _loc4_.textureRect);
            _loc6_ = new Rectangle(_loc5_[0],_loc5_[1],_loc5_[2],_loc5_[3]);
            _loc5_ = TexturePackerParser.args2arr(_loc4_.offset || _loc4_.spriteOffset);
            _loc7_ = new Point(_loc5_[0],_loc5_[1]);
            _loc5_ = TexturePackerParser.args2arr(_loc4_.sourceSize || _loc4_.spriteSourceSize);
            _loc8_ = new Point(_loc5_[0],_loc5_[1]);
            _loc9_ = _loc4_.hasOwnProperty("rotated") ? Boolean(_loc4_.rotated) : Boolean(_loc4_.textureRotated);
            _loc13_.addTexture(TexturePackerParser.parseBmd2Texture(param2,_loc6_,_loc7_,_loc8_,_loc9_));
         }
         _loc13_.clearSameKeyFrame();
         return _loc13_;
      }
   }
}

import com.game.view.display.*;
import flash.display.*;
import flash.geom.*;

class TexturePackerParser
{
   
   public function TexturePackerParser()
   {
      super();
   }
   
   public static function xml2Obj(param1:XML) : Object
   {
      var _loc2_:String = null;
      var _loc3_:XML = null;
      var _loc4_:* = undefined;
      var _loc5_:Object = {};
      if(param1.child("key").length() == 0)
      {
         param1 = new XML(param1.child("dict")[0]);
      }
      var _loc6_:int = 0;
      while(_loc6_ < param1.children().length())
      {
         _loc2_ = param1.children()[_loc6_].toString();
         _loc3_ = param1.children()[_loc6_ + 1];
         if(_loc3_.name() == "string")
         {
            _loc4_ = _loc3_.toString();
         }
         else if(_loc3_.name() == "false")
         {
            _loc4_ = false;
         }
         else if(_loc3_.name() == "true")
         {
            _loc4_ = true;
         }
         else if(_loc3_.name() == "integer")
         {
            _loc4_ = parseInt(_loc3_.toString());
         }
         else if(_loc3_.name() == "array")
         {
            _loc4_ = _loc3_.toString().split(",");
         }
         else if(_loc3_.name() == "dict")
         {
            _loc4_ = xml2Obj(_loc3_);
         }
         else
         {
            _loc4_ = null;
         }
         _loc5_[_loc2_] = _loc4_;
         _loc6_ += 2;
      }
      return _loc5_;
   }
   
   public static function sortFrameKey(param1:Object) : Array
   {
      var customSort:* = undefined;
      var obj:Object = param1;
      customSort = function(param1:String, param2:String):int
      {
         var _loc3_:int = 0;
         var _loc4_:int = 0;
         var _loc5_:RegExp = /(\d+)/g;
         var _loc6_:Array = param1.match(_loc5_);
         var _loc7_:Array = param2.match(_loc5_);
         var _loc8_:int = 0;
         while(_loc8_ < Math.min(_loc6_.length,_loc7_.length))
         {
            _loc3_ = int(_loc6_[_loc8_]);
            _loc4_ = int(_loc7_[_loc8_]);
            if(_loc3_ < _loc4_)
            {
               return -1;
            }
            if(_loc3_ > _loc4_)
            {
               return 1;
            }
            _loc8_++;
         }
         if(_loc6_.length < _loc7_.length)
         {
            return -1;
         }
         if(_loc6_.length > _loc7_.length)
         {
            return 1;
         }
         return 0;
      };
      var keys:Array = UtilBase.getAllKeys(obj);
      return keys.sort(customSort);
   }
   
   public static function args2arr(param1:String) : Array
   {
      while(param1.indexOf("{") + param1.indexOf("}") > -2)
      {
         param1 = param1.replace("{","").replace("}","");
      }
      return param1.split(",");
   }
   
   public static function parseBmd2Texture(param1:BitmapData, param2:Rectangle, param3:Point, param4:Point, param5:Boolean) : Texture
   {
      var _loc6_:Texture = new Texture();
      var _loc7_:Rectangle = param2.clone();
      if(param5)
      {
         _loc7_ = new Rectangle(param2.x,param2.y,_loc7_.height,_loc7_.width);
      }
      var _loc8_:BitmapData = new BitmapData(_loc7_.width,_loc7_.height,true,0);
      _loc8_.copyPixels(param1,_loc7_,new Point(0,0));
      if(param5)
      {
         _loc8_ = BitmapUtil.rotate(_loc8_,-90);
      }
      _loc6_.region = new Rectangle((param4.x - param2.width) / 2 + param3.x,(param4.y - param2.height) / 2 - param3.y,1,1);
      _loc6_.content = _loc8_;
      return _loc6_;
   }
}
