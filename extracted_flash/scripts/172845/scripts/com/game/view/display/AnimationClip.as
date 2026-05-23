package com.game.view.display
{
   import com.game.view.*;
   
   public class AnimationClip extends ViewerBase implements IAnimation
   {
      
      protected var _totalFrames:int = 1;
      
      protected var _loopType:int = 0;
      
      protected var _playing:Boolean = true;
      
      protected var _prevFrame:int = 0;
      
      protected var _currentFrame:int = 1;
      
      protected var _loopTime:int = 0;
      
      protected var _isCompleted:Boolean = false;
      
      public function AnimationClip()
      {
         super();
         needDestroyWhenRemove = false;
         this._totalFrames = 1;
         this._currentFrame = 1;
      }
      
      override protected function beforeAdded() : void
      {
         buttonMode = false;
         mouseEnabled = false;
         mouseChildren = false;
      }
      
      public function renderAnimate() : void
      {
         if(!this._playing)
         {
            return;
         }
         this.NextFrame();
      }
      
      protected function render() : void
      {
      }
      
      public function GotoAndPlay(param1:int) : void
      {
         if(param1 > this._totalFrames)
         {
            param1 = int(this._totalFrames);
         }
         if(param1 <= 0)
         {
            param1 = 1;
         }
         this._currentFrame = param1;
         this._playing = true;
         this.render();
      }
      
      public function GotoAndStop(param1:int) : void
      {
         if(param1 > this._totalFrames)
         {
            param1 = int(this._totalFrames);
         }
         if(param1 <= 0)
         {
            param1 = 1;
         }
         this._currentFrame = param1;
         this._playing = false;
         this.render();
      }
      
      public function Play() : void
      {
         this._playing = true;
      }
      
      public function Stop() : void
      {
         this._playing = false;
      }
      
      public function Pause() : void
      {
         this._playing = false;
      }
      
      public function NextFrame() : void
      {
         if(this._currentFrame < this._totalFrames)
         {
            ++this._currentFrame;
            this.render();
            return;
         }
         if(this._currentFrame >= this._totalFrames)
         {
            switch(this._loopType)
            {
               case AnimationLoopType.STOP_WHEN_END:
                  this._currentFrame = this._totalFrames;
                  this._isCompleted = true;
                  this._playing = false;
                  break;
               case AnimationLoopType.RESET_WHEN_END:
                  this._currentFrame = 1;
                  this.render();
                  ++this._loopTime;
                  break;
               case AnimationLoopType.REMOVE_WHEN_END:
                  removeFromParent();
                  break;
               default:
                  throw "Unknown Loop Type";
            }
         }
      }
      
      public function PrevFrame() : void
      {
         if(this._currentFrame > 1)
         {
            --this._currentFrame;
         }
         this.render();
      }
      
      public function Destroy() : void
      {
      }
      
      public function get loopType() : int
      {
         return this._loopType;
      }
      
      public function set loopType(param1:int) : void
      {
         this._loopType = param1;
      }
      
      override public function get isPlaying() : Boolean
      {
         return this._playing;
      }
      
      public function get totalFrame() : int
      {
         return this._totalFrames;
      }
      
      public function get frameLeft() : int
      {
         return this._totalFrames - this._currentFrame;
      }
      
      override public function get currentFrame() : int
      {
         return this._currentFrame;
      }
      
      public function get isComplete() : Boolean
      {
         return this._isCompleted;
      }
      
      public function get loopTime() : int
      {
         return this._loopTime;
      }
   }
}

