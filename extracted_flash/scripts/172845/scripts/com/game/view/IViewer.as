package com.game.view
{
   public interface IViewer
   {
      
      function removeFromParent(... rest) : void;
      
      function removeAllChildren() : void;
      
      function get scaleX() : Number;
      
      function set scaleX(param1:Number) : void;
      
      function get width() : Number;
      
      function get height() : Number;
      
      function get x() : Number;
      
      function set x(param1:Number) : void;
      
      function get y() : Number;
      
      function set y(param1:Number) : void;
   }
}

