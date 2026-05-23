package com.game.view
{
   import flash.display.*;
   import flash.events.*;
   
   public class ViewerBase extends MovieClip
   {
      
      public var needDestroyWhenRemove:Boolean = true;
      
      public var content:Sprite;
      
      protected var isFirstAdded:Boolean = false;
      
      protected var isFirstRemoved:Boolean = false;
      
      public function ViewerBase()
      {
         super();
         stop();
         this.beforeAdded();
         addEventListener(Event.ADDED_TO_STAGE,this.__onAdded,false,0,true);
         addEventListener(Event.REMOVED_FROM_STAGE,this.__onRemoved,false,0,true);
      }
      
      protected function beforeAdded() : void
      {
      }
      
      protected function onAdded() : void
      {
      }
      
      protected function onFirstAdded() : void
      {
      }
      
      protected function beforeRemoved() : void
      {
      }
      
      protected function onRemoved() : void
      {
      }
      
      protected function onFirstRemoved() : void
      {
      }
      
      public function removeFromParent(... rest) : void
      {
         this.beforeRemoved();
         if(Boolean(parent) && parent.contains(this))
         {
            parent.removeChild(this);
         }
      }
      
      public function removeAllChildren() : void
      {
         var _loc1_:DisplayObject = null;
         graphics.clear();
         while(Boolean(numChildren))
         {
            _loc1_ = getChildAt(0);
            if(_loc1_ is Bitmap)
            {
               Bitmap(_loc1_).bitmapData.dispose();
               Bitmap(_loc1_).bitmapData = null;
            }
            removeChildAt(0);
         }
      }
      
      private function __onAdded(param1:Event) : void
      {
         removeEventListener(Event.ADDED_TO_STAGE,this.__onAdded);
         if(!this.isFirstAdded)
         {
            this.isFirstAdded = true;
            this.onFirstAdded();
         }
         this.onAdded();
      }
      
      private function __onRemoved(param1:Event) : void
      {
         var _loc2_:DisplayObject = null;
         removeEventListener(Event.REMOVED_FROM_STAGE,this.__onRemoved);
         if(!this.isFirstRemoved)
         {
            this.isFirstRemoved = true;
            this.onFirstRemoved();
         }
         this.onRemoved();
         if(!this.needDestroyWhenRemove)
         {
            return;
         }
         while(Boolean(numChildren))
         {
            _loc2_ = removeChildAt(0);
            if(_loc2_ is Bitmap && Boolean(Bitmap(_loc2_).bitmapData))
            {
               Bitmap(_loc2_).bitmapData.dispose();
            }
         }
      }
   }
}

