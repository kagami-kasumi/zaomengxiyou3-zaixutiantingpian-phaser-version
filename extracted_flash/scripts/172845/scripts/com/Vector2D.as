package com
{
   import flash.display.Graphics;
   
   public class Vector2D
   {
      
      private var _x:Number;
      
      private var _y:Number;
      
      public function Vector2D(param1:Number = 0, param2:Number = 0)
      {
         super();
         this._x = param1;
         this._y = param2;
      }
      
      public static function get zero() : Vector2D
      {
         return new Vector2D();
      }
      
      public static function get right() : Vector2D
      {
         return new Vector2D(1,0);
      }
      
      public static function angleBetween(param1:Vector2D, param2:Vector2D) : Number
      {
         if(!param1.isNormalized())
         {
            param1 = param1.clone().normalize();
         }
         if(!param2.isNormalized())
         {
            param2 = param2.clone().normalize();
         }
         return Math.acos(param1.dotProd(param2));
      }
      
      public static function weak(param1:Number, param2:Number) : Vector2D
      {
         return new Vector2D(param1,param2);
      }
      
      public function draw(param1:Graphics, param2:uint = 0) : void
      {
         param1.lineStyle(0,param2);
         param1.moveTo(0,0);
         param1.lineTo(this._x,this._y);
      }
      
      public function clone() : Vector2D
      {
         return new Vector2D(this.x,this.y);
      }
      
      public function zero() : Vector2D
      {
         this._x = 0;
         this._y = 0;
         return this;
      }
      
      public function isZero() : Boolean
      {
         return this._x == 0 && this._y == 0;
      }
      
      public function set length(param1:Number) : void
      {
         var _loc2_:Number = this.angle;
         this._x = Math.cos(_loc2_) * param1;
         this._y = Math.sin(_loc2_) * param1;
      }
      
      public function get length() : Number
      {
         return Math.sqrt(this.lengthSQ);
      }
      
      public function get lengthSQ() : Number
      {
         return Number(this._x) * Number(this._x) + Number(this._y) * Number(this._y);
      }
      
      public function set angle(param1:Number) : void
      {
         var _loc2_:Number = this.length;
         this._x = Math.cos(param1) * _loc2_;
         this._y = Math.sin(param1) * _loc2_;
      }
      
      public function get angle() : Number
      {
         return Math.atan2(this._y,this._x);
      }
      
      public function normalize() : Vector2D
      {
         if(this.length == 0)
         {
            return this;
         }
         var _loc1_:Number = this.length;
         this._x /= _loc1_;
         this._y /= _loc1_;
         return this;
      }
      
      public function truncate(param1:Number) : Vector2D
      {
         this.length = Math.min(param1,this.length);
         return this;
      }
      
      public function reverse() : Vector2D
      {
         this._x = -Number(this._x);
         this._y = -Number(this._y);
         return this;
      }
      
      public function isNormalized() : Boolean
      {
         return this.length == 1;
      }
      
      public function dotProd(param1:Vector2D) : Number
      {
         return Number(this._x) * param1.x + Number(this._y) * param1.y;
      }
      
      public function crossProd(param1:Vector2D) : Number
      {
         return Number(this._x) * param1.y - Number(this._y) * param1.x;
      }
      
      public function sign(param1:Vector2D) : int
      {
         return this.perp.dotProd(param1) < 0 ? -1 : 1;
      }
      
      public function get perp() : Vector2D
      {
         return new Vector2D(-this.y,this.x);
      }
      
      public function dist(param1:Vector2D) : Number
      {
         return Math.sqrt(this.distSQ(param1));
      }
      
      public function distSQ(param1:Vector2D) : Number
      {
         var _loc2_:Number = param1.x - this.x;
         var _loc3_:Number = param1.y - this.y;
         return _loc2_ * _loc2_ + _loc3_ * _loc3_;
      }
      
      public function add(param1:Vector2D) : Vector2D
      {
         return new Vector2D(this._x + param1.x,this._y + param1.y);
      }
      
      public function subtract(param1:Vector2D) : Vector2D
      {
         return new Vector2D(Number(this._x) - param1.x,Number(this._y) - param1.y);
      }
      
      public function multiply(param1:Number) : Vector2D
      {
         return new Vector2D(Number(this._x) * param1,Number(this._y) * param1);
      }
      
      public function divide(param1:Number) : Vector2D
      {
         return new Vector2D(Number(this._x) / param1,Number(this._y) / param1);
      }
      
      public function equals(param1:Vector2D) : Boolean
      {
         return this._x == param1.x && this._y == param1.y;
      }
      
      public function set x(param1:Number) : void
      {
         this._x = param1;
      }
      
      public function get x() : Number
      {
         return this._x;
      }
      
      public function set y(param1:Number) : void
      {
         this._y = param1;
      }
      
      public function get y() : Number
      {
         return this._y;
      }
      
      public function toString() : String
      {
         return "[Vector2D (x:" + this._x + ", y:" + this._y + ")]";
      }
      
      public function setXY(param1:Number, param2:Number) : void
      {
         this.x = param1;
         this.y = param2;
      }
      
      public function get angle2() : Number
      {
         var _loc1_:Number = Math.atan2(this._y,this._x);
         if(_loc1_ < 0)
         {
            _loc1_ += 3.141592653589793 * 2;
         }
         return Number(_loc1_ * 180 / 3.141592653589793);
      }
   }
}

