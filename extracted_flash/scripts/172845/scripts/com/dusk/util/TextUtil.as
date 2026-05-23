package com.dusk.util
{
   import flash.display.*;
   import flash.text.*;
   import flash.utils.*;
   
   public final class TextUtil extends UtilBase
   {
      
      public static const BOSS_BLOOD_FONT:String = "华康海报体W12";
      
      public static const UNIVERSAL_FONT:String = "FZCuYuan-M03";
      
      public function TextUtil()
      {
         super();
         throw new Error("TextUtil class is static container only");
      }
      
      public static function creatTextField(param1:String, param2:String = "FZCuYuan-M03", param3:int = 20, param4:String = "left", param5:uint = 0, param6:Boolean = true, param7:Boolean = false) : TextField
      {
         var _loc8_:TextField = new TextField();
         var _loc9_:TextFormat = new TextFormat();
         _loc9_.color = param5;
         _loc9_.size = param3;
         _loc9_.font = param2;
         _loc9_.align = param4;
         _loc8_.x = _loc8_.y = 0;
         _loc8_.autoSize = param4;
         _loc8_.embedFonts = true;
         _loc8_.defaultTextFormat = _loc9_;
         _loc8_.text = param1;
         _loc8_.setTextFormat(_loc9_);
         _loc8_.width = _loc8_.textWidth + 50;
         _loc8_.height = _loc8_.textHeight + 50;
         _loc8_.selectable = param7;
         _loc8_.wordWrap = param6;
         return _loc8_;
      }
      
      public static function cloneTxt(param1:TextField, param2:String = "FZCuYuan-M03") : TextField
      {
         var _loc3_:TextField = new TextField();
         var _loc4_:TextFormat = param1.defaultTextFormat;
         if(!param1)
         {
            throw new Error("clone textField err! Target must be none null!");
         }
         _loc4_.font = param2;
         _loc3_.name = param1.name;
         _loc3_.embedFonts = true;
         _loc3_.x = param1.x;
         _loc3_.y = param1.y;
         _loc3_.type = param1.type;
         _loc3_.width = param1.width;
         _loc3_.height = param1.height;
         _loc3_.defaultTextFormat = _loc4_;
         _loc3_.wordWrap = param1.wordWrap;
         _loc3_.selectable = param1.selectable;
         _loc3_.text = param1.text;
         _loc3_.filters = param1.filters;
         return _loc3_;
      }
      
      public static function redrawCtrlerTxt(param1:DisplayObjectContainer) : void
      {
         var _loc2_:String = "textField";
         if(!param1.hasOwnProperty(_loc2_))
         {
            return;
         }
         if(!param1[_loc2_].hasOwnProperty("getTextFormat"))
         {
            return;
         }
         var _loc3_:TextFormat = param1[_loc2_].getTextFormat();
         param1[_loc2_].embedFonts = true;
         _loc3_.font = BOSS_BLOOD_FONT;
         param1[_loc2_].setStyle(_loc2_,_loc3_);
      }
      
      public static function redrawTxt(param1:DisplayObjectContainer) : void
      {
         var _loc2_:DisplayObject = null;
         if(!param1)
         {
            throw new Error("redraw textField err! Container must be none null");
         }
         var _loc3_:int = 0;
         while(_loc3_ < param1.numChildren)
         {
            _loc2_ = param1.getChildAt(_loc3_);
            if(_loc2_ is TextField && (_loc2_ as TextField).type == TextFieldType.DYNAMIC)
            {
               _loc2_ = cloneTxt(_loc2_ as TextField);
               param1.removeChildAt(_loc3_);
               param1.addChildAt(_loc2_,_loc3_);
            }
            _loc3_++;
         }
      }
      
      public static function redrawTxtOld(param1:DisplayObjectContainer, param2:Array) : void
      {
         var _loc3_:int = 0;
         var _loc4_:String = null;
         for each(_loc4_ in param2)
         {
            if(!(Boolean(param1[_loc4_]) && param1.contains(param1[_loc4_])))
            {
               throw new Error("redraw textField err! Container must have contained this child!");
            }
            _loc3_ = param1.getChildIndex(param1[_loc4_]);
            param1.removeChildAt(_loc3_);
            param1[_loc4_] = cloneTxt(param1[_loc4_]);
            param1.addChildAt(param1[_loc4_],_loc3_);
         }
      }
      
      public static function getDefaultTextFormat(param1:String = "FZCuYuan-M03") : TextFormat
      {
         var _loc2_:TextFormat = new TextFormat();
         _loc2_.font = param1;
         _loc2_.size = 20;
         _loc2_.align = TextFormatAlign.CENTER;
         _loc2_.color = 0;
         return _loc2_;
      }
      
      public static function setTextColor(param1:TextField, param2:uint = 0) : void
      {
         var _loc3_:TextFormat = param1.getTextFormat();
         _loc3_.color = param2;
         param1.setTextFormat(_loc3_);
      }
      
      public static function setTextAlign(param1:TextField, param2:*) : void
      {
         var _loc3_:TextFormat = param1.getTextFormat();
         _loc3_.align = param2;
         param1.setTextFormat(_loc3_);
      }
      
      public static function getTextBitmap(param1:String, param2:uint = 16711680) : Bitmap
      {
         var _loc3_:TextField = new TextField();
         var _loc4_:TextFormat = new TextFormat();
         _loc4_.size = 16;
         _loc4_.bold = true;
         _loc4_.font = UNIVERSAL_FONT;
         _loc4_.color = param2;
         _loc3_.embedFonts = true;
         _loc3_.defaultTextFormat = _loc4_;
         _loc3_.text = param1;
         _loc3_.width = _loc3_.textWidth + 10;
         _loc3_ = creatTextField(param1,UNIVERSAL_FONT,16,TextFormatAlign.LEFT,param2,false,false);
         FilterUtil.setGlow(_loc3_,16777215,1,4,4,5);
         FilterUtil.clearCache();
         var _loc5_:BitmapData = new BitmapData(_loc3_.width,_loc3_.height,true,16777215);
         _loc5_.draw(_loc3_);
         return new Bitmap(_loc5_);
      }
      
      public static function GBK2UTF(param1:String) : String
      {
         var _loc2_:ByteArray = new ByteArray();
         _loc2_.writeMultiByte(param1," gbk ");
         _loc2_.position = 0;
         return _loc2_.readMultiByte(_loc2_.length - 1," utf-8 ");
      }
      
      public static function UTF2GBK(param1:String) : String
      {
         var _loc2_:ByteArray = new ByteArray();
         _loc2_.writeMultiByte(param1,"utf-8");
         _loc2_.position = 0;
         return _loc2_.readMultiByte(_loc2_.length - 1," gbk ");
      }
   }
}

