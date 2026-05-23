package com.dusk.tool
{
   public class Time
   {
      
      private var _hour:uint;
      
      private var _min:uint;
      
      private var _second:uint;
      
      private var _totalSecond:uint;
      
      public function Time(param1:uint = 0)
      {
         super();
         this.updateFromSecond(param1);
      }
      
      public function get hour() : uint
      {
         return this._hour;
      }
      
      public function set hour(param1:uint) : void
      {
         var _loc2_:uint = param1 * 3600 + this._min * 60 + this._second;
         this.updateFromSecond(_loc2_);
      }
      
      public function get min() : uint
      {
         return this._min;
      }
      
      public function set min(param1:uint) : void
      {
         var _loc2_:uint = this._hour * 3600 + param1 * 60 + this._second;
         this.updateFromSecond(_loc2_);
      }
      
      public function get second() : uint
      {
         return this._second;
      }
      
      public function set second(param1:uint) : void
      {
         var _loc2_:uint = this._hour * 3600 + this._min * 60 + param1;
         this.updateFromSecond(_loc2_);
      }
      
      public function get totalSecond() : uint
      {
         return this._totalSecond;
      }
      
      public function updateFromSecond(param1:uint) : void
      {
         this._totalSecond = param1;
         this._hour = Math.floor(param1 / 3600);
         param1 %= 3600;
         this._min = Math.floor(param1 / 60);
         param1 %= 60;
         this._second = param1 % 60;
      }
      
      public function updateFromMilisecond(param1:uint) : void
      {
         this.updateFromSecond(param1 / 1000);
      }
      
      public function updateFromTimeString(param1:String) : void
      {
         var _loc2_:Array = param1.split(":");
         if(!_loc2_.length == 3)
         {
            throw new Error("invalid time string format");
         }
         this.updateFromSecond(int(_loc2_[0]) * 3600 + int(_loc2_[1]) * 60 + int(_loc2_[2]));
      }
      
      public function add(param1:Time) : void
      {
         this.updateFromSecond(this._totalSecond + param1.totalSecond);
      }
      
      public function addHour(param1:int) : void
      {
         var _loc2_:int = param1 * 3600;
         if(_loc2_ + this._totalSecond < 0)
         {
            throw new Error("invalid input, out of range");
         }
         this.updateFromSecond(_loc2_ + this._totalSecond);
      }
      
      public function addMinute(param1:int) : void
      {
         var _loc2_:int = param1 * 60;
         if(_loc2_ + this._totalSecond < 0)
         {
            throw new Error("invalid input, out of range");
         }
         this.updateFromSecond(_loc2_ + this._totalSecond);
      }
      
      public function addSecond(param1:int) : void
      {
         if(param1 + this._totalSecond < 0)
         {
            throw new Error("invalid input, out of range");
         }
         this.updateFromSecond(param1 + this._totalSecond);
      }
      
      public function toTimeString() : String
      {
         return this._hour.toString() + ":" + this.completeZeroFormat(this._min) + ":" + this.completeZeroFormat(this._second);
      }
      
      public function toCNTime() : String
      {
         return this._hour.toString() + "时" + this.completeZeroFormat(this._min) + "分" + this.completeZeroFormat(this._second) + "秒";
      }
      
      private function completeZeroFormat(param1:uint) : String
      {
         if(param1 < 10)
         {
            return "0" + param1.toString();
         }
         return param1.toString();
      }
   }
}

