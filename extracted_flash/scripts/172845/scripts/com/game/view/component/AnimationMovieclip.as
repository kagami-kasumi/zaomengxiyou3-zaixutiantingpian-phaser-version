package com.game.view.component
{
   import flash.display.*;
   import flash.events.*;
   
   public class AnimationMovieclip extends Component
   {
      
      private var _mc:MovieClip;
      
      private var _loop:Boolean;
      
      private var speed:int;
      
      public function AnimationMovieclip(param1:Class, param2:Boolean, param3:int = 0)
      {
         super();
         this.speed = param3;
         this._loop = param2;
         this._mc = new param1() as MovieClip;
         this._mc.cacheAsBitmap = true;
         this.mouseEnabled = false;
         this.mouseChildren = false;
         this.addChild(this._mc);
         if(!this._loop)
         {
            this._mc.addEventListener("enterFrame",this.one);
         }
      }
      
      public function get mc() : MovieClip
      {
         return this._mc;
      }
      
      public function clear() : void
      {
         if(this._mc)
         {
            this._mc.removeEventListener("enterFrame",this.one);
            this._mc.stop();
         }
         super.destroy();
      }
      
      private function one(param1:Event) : void
      {
         if(this.speed > 0)
         {
            this._mc.gotoAndStop(this._mc.currentFrame + this.speed);
         }
         if(this._mc.currentFrame >= this._mc.totalFrames)
         {
            this._mc.stop();
            this.destroy();
         }
      }
      
      override public function destroy() : void
      {
         if(this._mc)
         {
            this._mc.removeEventListener("enterFrame",this.one);
            this._mc.stop();
         }
         super.destroy();
         dispatchEvent(new Event("complete"));
      }
      
      public function advanceTime(param1:Number) : void
      {
         var _loc2_:int = 0;
         if(this._mc)
         {
            _loc2_ = this._mc.currentFrame + 1;
            if(_loc2_ > this._mc.totalFrames)
            {
               _loc2_ = 1;
            }
            this._mc.gotoAndStop(_loc2_);
         }
      }
   }
}

