package com.game.view.component
{
   import flash.display.*;
   import flash.events.Event;
   
   public class Component extends Sprite implements IComponent
   {
      
      private var _isDeleted:Boolean;
      
      public function Component()
      {
         super();
         this.initialization();
         this.addEventListener("addedToStage",this.onAddedToStageHandler);
      }
      
      public function get isDeleted() : Boolean
      {
         return this._isDeleted;
      }
      
      private function onAddedToStageHandler(param1:Event) : void
      {
         this.removeEventListener("addedToStage",this.onAddedToStageHandler);
         this.init();
      }
      
      protected function init() : void
      {
      }
      
      public function destroy() : void
      {
         var _loc1_:* = undefined;
         while(this.numChildren > 0)
         {
            _loc1_ = this.removeChildAt(0);
            if(_loc1_ is MovieClip)
            {
               MovieClip(_loc1_).stop();
            }
         }
         if(Boolean(this.parent) && this.parent.contains(this))
         {
            this.parent.removeChild(this);
         }
         this._isDeleted = true;
      }
      
      public function initialization() : void
      {
      }
   }
}

