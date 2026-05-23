package export.hero
{
   import flash.display.*;
   import manager.*;
   
   public class BLMSkill5 extends Sprite
   {
      
      private var _class:Class;
      
      private var _master:*;
      
      private var _mcs:Vector.<MovieClip>;
      
      public var Empty:Boolean;
      
      private var _direction:int;
      
      private var _nowTimes:Array;
      
      private var ind:int = 0;
      
      private var _speed:Number = 2;
      
      private var _arrowTotal:int = 4;
      
      public function BLMSkill5(param1:Class, param2:*)
      {
         this._mcs = new Vector.<MovieClip>();
         this._nowTimes = [];
         super();
         this._master = param2;
         this._class = param1;
         this.init();
         this.start();
      }
      
      private function init() : void
      {
         var _loc1_:int = 0;
         var _loc2_:MovieClip = null;
         _loc1_ = 0;
         while(_loc1_ < this._arrowTotal)
         {
            _loc2_ = new this._class();
            this.addChild(_loc2_);
            if(_loc1_ == 0)
            {
               _loc2_.x = -95;
               _loc2_.y = -43;
            }
            else if(_loc1_ == 1)
            {
               _loc2_.scaleX = _loc2_.scaleY = 0.95;
               _loc2_.x = -48;
               _loc2_.y = -77;
            }
            else if(_loc1_ == 2)
            {
               _loc2_.scaleX = _loc2_.scaleY = 0.9;
               _loc2_.x = 0;
               _loc2_.y = -77;
            }
            else if(_loc1_ == 3)
            {
               _loc2_.scaleX = _loc2_.scaleY = 0.9;
               _loc2_.x = 45;
               _loc2_.y = -54;
            }
            this._mcs.push(_loc2_);
            this._nowTimes.push({
               "n":-1,
               "t":3333
            });
            _loc1_++;
         }
      }
      
      public function ReStart() : void
      {
         this.start();
      }
      
      private function start() : void
      {
         var _loc1_:* = undefined;
         var _loc2_:int = 0;
         var _loc3_:MovieClip = null;
         if(this._arrowTotal != this._mcs.length)
         {
            for each(_loc1_ in this._mcs)
            {
               if(Boolean(_loc1_.parent) && Boolean(_loc1_.parent.contains(_loc1_)))
               {
                  _loc1_.parent.removeChild(_loc1_);
               }
            }
            this._mcs.length = 0;
            this._nowTimes.length = 0;
            this.init();
         }
         _loc2_ = 0;
         while(_loc2_ < this._mcs.length)
         {
            _loc3_ = this._mcs[_loc2_];
            _loc3_.gotoAndStop(1);
            _loc3_.visible = true;
            this._nowTimes[_loc2_].n = -1;
            _loc2_++;
         }
         this._nowTimes[0].n = 3333;
         this.Empty = false;
      }
      
      public function step() : void
      {
         this.addMcTime(18 * 0.5);
         this.updateMcFrame();
         this.follow();
      }
      
      public function addMcTime(param1:Number) : void
      {
         var _loc2_:int = 0;
         var _loc3_:Object = null;
         _loc2_ = 0;
         while(_loc2_ < this._mcs.length)
         {
            _loc3_ = this._nowTimes[_loc2_];
            if(_loc3_.n != _loc3_.t)
            {
               _loc3_.n += param1 * this._speed;
               if(_loc3_.n >= _loc3_.t)
               {
                  _loc3_.n = _loc3_.t;
               }
               break;
            }
            _loc2_++;
         }
      }
      
      private function updateMcFrame() : void
      {
         var _loc1_:int = 0;
         var _loc2_:Object = null;
         var _loc3_:MovieClip = null;
         var _loc4_:int = 0;
         _loc1_ = 0;
         while(_loc1_ < this._mcs.length)
         {
            _loc2_ = this._nowTimes[_loc1_];
            _loc3_ = this._mcs[_loc1_];
            _loc4_ = _loc2_.n / _loc2_.t * _loc3_.totalFrames;
            _loc3_.gotoAndStop(_loc4_);
            _loc1_++;
         }
      }
      
      public function follow() : void
      {
         var _loc1_:int = 0;
         if(this._direction != this._master.getDirection())
         {
            this.scaleX = this._master.getDirection();
         }
         try
         {
            _loc1_ = int(this._master.parent.getChildIndex(this._master));
            if(this.ind != _loc1_ - 1)
            {
               this.ind = _loc1_ - 1;
               if(this.ind == -1)
               {
                  this.ind = 0;
               }
               this.parent.setChildIndex(this,this.ind);
            }
         }
         catch(error:Error)
         {
         }
         this.x = this._master.x;
         this.y = this._master.y;
         this._direction = this._master.getDirection();
      }
      
      public function canShoot() : Boolean
      {
         var _loc1_:int = 0;
         var _loc2_:MovieClip = null;
         _loc1_ = 0;
         while(_loc1_ < this._mcs.length)
         {
            _loc2_ = this._mcs[_loc1_];
            if(Boolean(_loc2_) && Boolean(_loc2_.visible) && _loc2_.currentFrame == _loc2_.totalFrames)
            {
               return true;
            }
            _loc1_++;
         }
         return false;
      }
      
      public function toShoot() : void
      {
         var _loc1_:int = 0;
         var _loc2_:MovieClip = null;
         var _loc3_:int = 0;
         var _loc4_:MovieClip = null;
         var _loc5_:int = 0;
         _loc1_ = 0;
         while(_loc1_ < this._mcs.length)
         {
            _loc2_ = this._mcs[_loc1_];
            if(Boolean(_loc2_) && Boolean(_loc2_.visible) && _loc2_.currentFrame == _loc2_.totalFrames)
            {
               _loc2_.visible = false;
               this._master.addSkill5_3();
               break;
            }
            _loc1_++;
         }
         _loc3_ = 0;
         while(_loc3_ < this._mcs.length)
         {
            if(Boolean(_loc4_ = this._mcs[_loc3_]) && _loc4_.visible == false)
            {
               _loc5_++;
            }
            _loc3_++;
         }
         if(_loc5_ == this._mcs.length)
         {
            this.Empty = true;
         }
      }
      
      public function destroy() : void
      {
         if(Boolean(this.parent) && this.parent.contains(this))
         {
            this.parent.removeChild(this);
         }
      }
   }
}

