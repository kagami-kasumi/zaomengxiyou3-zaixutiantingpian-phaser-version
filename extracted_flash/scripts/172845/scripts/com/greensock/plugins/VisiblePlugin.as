package com.greensock.plugins
{
   import com.greensock.*;
   
   public class VisiblePlugin extends TweenPlugin
   {
      
      public static const API:Number = 1;
      
      protected var _target:Object;
      
      protected var _initVal:Boolean;
      
      protected var _visible:Boolean;
      
      protected var _tween:TweenLite;
      
      public function VisiblePlugin()
      {
         super();
         this.propName = "visible";
         this.overwriteProps = ["visible"];
      }
      
      override public function onInitTween(target:Object, value:*, tween:TweenLite) : Boolean
      {
         _target = target;
         _tween = tween;
         _initVal = _target.visible;
         _visible = Boolean(value);
         return true;
      }
      
      override public function set changeFactor(n:Number) : void
      {
         if(n == 1 && (_tween.cachedDuration == _tween.cachedTime || _tween.cachedTime == 0))
         {
            _target.visible = _visible;
         }
         else
         {
            _target.visible = _initVal;
         }
      }
   }
}

