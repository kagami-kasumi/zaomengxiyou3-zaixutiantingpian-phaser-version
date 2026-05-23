package com.hexagonstar.util.debug
{
   import flash.display.Stage;
   import flash.events.*;
   import flash.utils.*;
   
   public class FPSMeter extends EventDispatcher
   {
      
      public static const FPS_UPDATE:String = "fpsUpdate";
      
      private var _stage:Stage;
      
      private var _timer:Timer;
      
      private var _pollInterval:int;
      
      private var _fps:int;
      
      private var _frt:int;
      
      private var _ms:int;
      
      private var _isRunning:Boolean;
      
      private var _delay:int;
      
      private var _delayMax:int = 10;
      
      private var _prev:int;
      
      public function FPSMeter(param1:Stage, param2:int = 500)
      {
         super();
         this._stage = param1;
         this._pollInterval = param2;
         this.reset();
      }
      
      public function start() : void
      {
         if(!this._isRunning)
         {
            this._isRunning = true;
            this._timer = new Timer(this._pollInterval,0);
            this._timer.addEventListener(TimerEvent.TIMER,this.onTimer);
            this._stage.addEventListener(Event.ENTER_FRAME,this.onEnterFrame);
            this._timer.start();
         }
      }
      
      public function stop() : void
      {
         if(this._isRunning)
         {
            this._timer.stop();
            this._timer.removeEventListener(TimerEvent.TIMER,this.onTimer);
            this._stage.removeEventListener(Event.ENTER_FRAME,this.onEnterFrame);
            this._timer = null;
            this.reset();
         }
      }
      
      public function reset() : void
      {
         this._fps = 0;
         this._frt = 0;
         this._ms = 0;
         this._delay = 0;
         this._prev = 0;
         this._isRunning = false;
      }
      
      public function get fps() : int
      {
         return this._fps;
      }
      
      public function get frt() : int
      {
         return this._frt;
      }
      
      private function onTimer(param1:TimerEvent) : void
      {
         dispatchEvent(new Event(FPSMeter.FPS_UPDATE));
      }
      
      private function onEnterFrame(param1:Event) : void
      {
         var _loc2_:Number = Number(getTimer());
         ++this._delay;
         if(this._delay >= this._delayMax)
         {
            this._delay = 0;
            this._fps = int(1000 * Number(this._delayMax) / (_loc2_ - Number(this._prev)));
            this._prev = _loc2_;
         }
         this._frt = _loc2_ - Number(this._ms);
         this._ms = _loc2_;
      }
   }
}

