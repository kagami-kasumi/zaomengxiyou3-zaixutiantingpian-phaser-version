package com.greensock.plugins
{
   import com.greensock.core.*;
   import flash.filters.*;
   
   public class FilterPlugin extends TweenPlugin
   {
      
      public static const VERSION:Number = 2.03;
      
      public static const API:Number = 1;
      
      protected var _remove:Boolean;
      
      protected var _target:Object;
      
      protected var _index:int;
      
      protected var _filter:BitmapFilter;
      
      protected var _type:Class;
      
      public function FilterPlugin()
      {
         super();
      }
      
      public function onCompleteTween() : void
      {
         var filters:Array = null;
         var i:* = 0;
         if(_remove)
         {
            filters = _target.filters;
            if(!(filters[_index] is _type))
            {
               i = int(filters.length);
               while(i--)
               {
                  if(filters[i] is _type)
                  {
                     filters.splice(i,1);
                     break;
                  }
               }
            }
            else
            {
               filters.splice(_index,1);
            }
            _target.filters = filters;
         }
      }
      
      protected function initFilter(props:Object, defaultFilter:BitmapFilter, propNames:Array) : void
      {
         var p:String = null;
         var i:* = 0;
         var colorTween:HexColorsPlugin = null;
         var filters:Array = _target.filters;
         var extras:Object = props is BitmapFilter ? {} : props;
         _index = -1;
         if(extras.index != null)
         {
            _index = extras.index;
         }
         else
         {
            i = int(filters.length);
            while(i--)
            {
               if(filters[i] is _type)
               {
                  _index = i;
                  break;
               }
            }
         }
         if(_index == -1 || filters[_index] == null || extras.addFilter == true)
         {
            _index = extras.index != null ? int(extras.index) : int(filters.length);
            filters[_index] = defaultFilter;
            _target.filters = filters;
         }
         _filter = filters[_index];
         if(extras.remove == true)
         {
            _remove = true;
            this.onComplete = onCompleteTween;
         }
         i = int(propNames.length);
         while(i--)
         {
            p = propNames[i];
            if(p in props && _filter[p] != props[p])
            {
               if(p == "color" || p == "highlightColor" || p == "shadowColor")
               {
                  colorTween = new HexColorsPlugin();
                  colorTween.initColor(_filter,p,_filter[p],props[p]);
                  _tweens[_tweens.length] = new PropTween(colorTween,"changeFactor",0,1,p,false);
               }
               else if(p == "quality" || p == "inner" || p == "knockout" || p == "hideObject")
               {
                  _filter[p] = props[p];
               }
               else
               {
                  addTween(_filter,p,_filter[p],props[p],p);
               }
            }
         }
      }
      
      override public function set changeFactor(n:Number) : void
      {
         var ti:PropTween = null;
         var i:* = int(_tweens.length);
         var filters:Array = _target.filters;
         while(i--)
         {
            ti = _tweens[i];
            ti.target[ti.property] = ti.start + ti.change * n;
         }
         if(!(filters[_index] is _type))
         {
            i = int(_index = filters.length);
            while(i--)
            {
               if(filters[i] is _type)
               {
                  _index = i;
                  break;
               }
            }
         }
         filters[_index] = _filter;
         _target.filters = filters;
      }
   }
}

