package com.game.view.display
{
   import com.game.view.*;
   import flash.display.MovieClip;
   
   public class McMovieClip extends AnimationClip implements IAnimation
   {
      
      private var _mc:MovieClip;
      
      public function McMovieClip(param1:MovieClip = null)
      {
         super();
         this.setTexture(param1);
      }
      
      public function setTexture(param1:MovieClip) : void
      {
         if(!param1)
         {
            return;
         }
         this._mc = param1;
         this.init();
      }
      
      private function init() : void
      {
         _totalFrames = this._mc.totalFrames;
         addChild(this._mc);
         this._mc.gotoAndStop(_currentFrame);
      }
      
      override protected function render() : void
      {
         this._mc.gotoAndStop(_currentFrame);
      }
      
      override public function Destroy() : void
      {
         removeChild(this._mc);
         this._mc = null;
      }
   }
}

