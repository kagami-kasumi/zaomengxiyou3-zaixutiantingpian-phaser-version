package com.game.view.display
{
   import flash.display.*;
   import flash.geom.*;
   
   public class Texture
   {
      
      private var _pivotX:Number = 0;
      
      private var _pivotY:Number = 0;
      
      private var _region:Rectangle;
      
      private var _content:BitmapData;
      
      public function Texture(param1:BitmapData = null)
      {
         this._region = new Rectangle();
         super();
         this._content = param1;
      }
      
      public static function getEmpty() : Texture
      {
         return new Texture();
      }
      
      public static function getEmptyPureColor(param1:Number, param2:Number, param3:uint) : Texture
      {
         var _loc4_:Texture = new Texture();
         _loc4_.content = new BitmapData(param1,param2,true,param3);
         return _loc4_;
      }
      
      public function set content(param1:BitmapData) : void
      {
         this._content = param1;
      }
      
      public function get content() : BitmapData
      {
         return this._content;
      }
      
      public function get pivot() : Point
      {
         return new Point(this._pivotX,this._pivotY);
      }
      
      public function set pivot(param1:Point) : void
      {
         this._pivotX = param1.x;
         this._pivotY = param1.y;
      }
      
      public function get pivotX() : Number
      {
         return this._pivotX;
      }
      
      public function set pivotX(param1:Number) : void
      {
         this._pivotX = param1;
      }
      
      public function get pivotY() : Number
      {
         return this._pivotY;
      }
      
      public function set pivotY(param1:Number) : void
      {
         this._pivotY = param1;
      }
      
      public function get width() : Number
      {
         return this._content.width;
      }
      
      public function get height() : Number
      {
         return this._content.height;
      }
      
      public function get region() : Rectangle
      {
         this._region.width = this._content.width;
         this._region.height = this._content.height;
         this._region.x = this._pivotX;
         this._region.y = this._pivotY;
         return this._region.clone();
      }
      
      public function set region(param1:Rectangle) : void
      {
         this._pivotX = param1.left;
         this._pivotY = param1.top;
      }
      
      public function clone() : Texture
      {
         return new Texture(this._content);
      }
      
      public function deepClone() : Texture
      {
         return new Texture(this._content.clone());
      }
      
      public function isEmpty() : Boolean
      {
         return this._content == null;
      }
      
      public function dispose() : void
      {
         if(Boolean(this.content))
         {
            this.content.dispose();
         }
         this._content = null;
      }
   }
}

