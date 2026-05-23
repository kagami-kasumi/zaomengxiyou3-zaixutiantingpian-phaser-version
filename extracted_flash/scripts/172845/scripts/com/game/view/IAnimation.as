package com.game.view
{
   public interface IAnimation extends IViewer
   {
      
      function GotoAndPlay(param1:int) : void;
      
      function GotoAndStop(param1:int) : void;
      
      function Stop() : void;
      
      function Pause() : void;
      
      function Play() : void;
      
      function NextFrame() : void;
      
      function PrevFrame() : void;
      
      function Destroy() : void;
      
      function renderAnimate() : void;
      
      function get currentFrame() : int;
      
      function get totalFrame() : int;
      
      function get isPlaying() : Boolean;
      
      function get frameLeft() : int;
      
      function get loopTime() : int;
      
      function get isComplete() : Boolean;
      
      function get loopType() : int;
      
      function set loopType(param1:int) : void;
   }
}

