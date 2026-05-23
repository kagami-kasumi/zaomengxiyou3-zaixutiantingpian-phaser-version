package com.hexagonstar.util.debug
{
   import flash.utils.*;
   
   public class StopWatch
   {
      
      private var _started:Boolean = false;
      
      private var _startTimeKeys:Array;
      
      private var _stopTimeKeys:Array;
      
      private var _title:String;
      
      public function StopWatch()
      {
         super();
         this.reset();
      }
      
      public function start(param1:String = "") : void
      {
         if(!this._started)
         {
            this._title = param1;
            this._started = true;
            this._startTimeKeys.push(getTimer());
         }
      }
      
      public function stop() : void
      {
         var _loc1_:int = 0;
         if(this._started)
         {
            _loc1_ = int(getTimer());
            this._stopTimeKeys[this._startTimeKeys.length - 1] = _loc1_;
            this._started = false;
         }
      }
      
      public function reset() : void
      {
         this._startTimeKeys = [];
         this._stopTimeKeys = [];
         this._started = false;
      }
      
      public function toString() : String
      {
         var _loc1_:int = 0;
         var _loc2_:int = 0;
         var _loc3_:* = "\n ********************* [STOPWATCH] *********************";
         if(this._title != "")
         {
            _loc3_ += "\n * " + this._title;
         }
         var _loc4_:int = 0;
         while(_loc4_ < this._startTimeKeys.length)
         {
            _loc1_ = int(this._startTimeKeys[_loc4_]);
            _loc2_ = int(this._stopTimeKeys[_loc4_]);
            _loc3_ += "\n * started [" + this.format(_loc1_) + "ms] stopped [" + this.format(_loc2_) + "ms] time [" + this.format(_loc2_ - _loc1_) + "ms]";
            _loc4_++;
         }
         if(_loc4_ == 0)
         {
            _loc3_ += "\n * never started.";
         }
         else
         {
            _loc3_ += "\n * total runnning time: " + this.timeInSeconds + "s";
         }
         return _loc3_ + "\n *******************************************************";
      }
      
      public function get started() : Boolean
      {
         return this._started;
      }
      
      public function get timeInMilliSeconds() : int
      {
         if(this._started)
         {
            this._stopTimeKeys[this._startTimeKeys.length - 1] = getTimer();
         }
         var _loc1_:int = 0;
         var _loc2_:int = 0;
         while(_loc2_ < this._startTimeKeys.length)
         {
            _loc1_ += Number(this._stopTimeKeys[_loc2_]) - Number(this._startTimeKeys[_loc2_]);
            _loc2_++;
         }
         return _loc1_;
      }
      
      public function get timeInSeconds() : Number
      {
         return this.timeInMilliSeconds / 1000;
      }
      
      private function format(param1:int) : String
      {
         var _loc2_:* = "";
         var _loc3_:int = int(param1.toString().length);
         var _loc4_:int = 0;
         while(_loc4_ < 5 - _loc3_)
         {
            _loc2_ += "0";
            _loc4_++;
         }
         return _loc2_ + param1;
      }
   }
}

