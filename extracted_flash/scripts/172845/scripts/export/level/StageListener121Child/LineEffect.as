package export.level.StageListener121Child
{
   import base.*;
   import flash.display.*;
   import flash.filters.*;
   import flash.geom.*;
   
   public class LineEffect extends Sprite
   {
      
      public static var LINE_RED:uint = 1;
      
      public static var LINE_BLUE:uint = 2;
      
      private var color:uint;
      
      private var type:uint;
      
      private var _targetObject1:BaseObject;
      
      private var _targetObject2:BaseObject;
      
      private const OFFSETVALUE:uint = 40;
      
      private var _offsetYVal:int;
      
      private var _direct:int = -1;
      
      private var glow:GlowFilter;
      
      private var perSecondCount:uint = 24;
      
      public var isDestroy:Boolean = false;
      
      public function LineEffect(param1:uint)
      {
         this._offsetYVal = -Number(this.OFFSETVALUE);
         super();
         this.type = param1;
         if(param1 == LINE_RED)
         {
            this.color = 16711680;
         }
         else if(param1 == LINE_BLUE)
         {
            this.color = 255;
         }
         else
         {
            this.color = 16777215;
         }
         this.glow = new GlowFilter(this.color,1,15,15,1.5,BitmapFilterQuality.HIGH,false,false);
         this.filters = [this.glow];
      }
      
      public function step() : void
      {
         var _loc1_:* = null;
         var _loc2_:Number = Number(NaN);
         var _loc3_:Number = Number(NaN);
         var _loc4_:Number = Number(NaN);
         var _loc5_:Number = Number(NaN);
         var _loc6_:Number = Number(NaN);
         if(this.isDestroy)
         {
            return;
         }
         if(!this._targetObject1 || !this._targetObject2)
         {
            return;
         }
         if(Boolean(this._targetObject1.isDead()) || Boolean(this._targetObject2.isDead()))
         {
            this.destroy();
            return;
         }
         if(AUtils.GetDisBetweenTwoObj(this._targetObject1,this._targetObject2) >= 500)
         {
            this.destroy();
            return;
         }
         var _loc7_:Point = new Point(this._targetObject1.x,this._targetObject1.y);
         var _loc8_:Point = new Point(this._targetObject2.x,this._targetObject2.y);
         var _loc9_:Number = (_loc7_.x + _loc8_.x) / 2;
         var _loc10_:Number = (_loc7_.y + _loc8_.y) / 2;
         if(_loc7_.x != _loc8_.x && _loc7_.y != _loc8_.y)
         {
            _loc2_ = Math.abs(_loc7_.x - _loc8_.x);
            _loc3_ = Math.abs(_loc7_.y - _loc8_.y);
            _loc4_ = Math.sqrt((_loc8_.x - _loc7_.x) * (_loc8_.x - _loc7_.x) + (_loc8_.y - _loc7_.y) * (_loc8_.y - _loc7_.y));
            _loc5_ = Number(this._offsetYVal) * _loc3_ / _loc4_;
            _loc6_ = Number(this._offsetYVal) * _loc2_ / _loc4_;
            _loc1_ = new Point(_loc9_ + _loc5_,_loc10_ + _loc6_);
         }
         else if(_loc7_.x == _loc8_.x)
         {
            _loc1_ = new Point(_loc9_ + this._offsetYVal,_loc10_);
         }
         else
         {
            _loc1_ = new Point(_loc9_,_loc10_ + this._offsetYVal);
         }
         this.graphics.clear();
         graphics.lineStyle(3,this.color);
         this.graphics.moveTo(_loc7_.x,_loc7_.y);
         this.graphics.curveTo(_loc1_.x,_loc1_.y,_loc8_.x,_loc8_.y);
         if(this._direct == -1)
         {
            this._offsetYVal += 12;
            if(this._offsetYVal > this.OFFSETVALUE)
            {
               this._offsetYVal = this.OFFSETVALUE;
               this._direct = 1;
            }
         }
         else
         {
            this._offsetYVal -= 12;
            if(this._offsetYVal < -Number(this.OFFSETVALUE))
            {
               this._offsetYVal = -Number(this.OFFSETVALUE);
               this._direct = -1;
            }
         }
         if(this.perSecondCount > 0)
         {
            --this.perSecondCount;
            if(this.perSecondCount == 0)
            {
               if(this.type == LineEffect.LINE_BLUE)
               {
                  if(this._targetObject1 is BaseHero)
                  {
                     if(BaseHero(this._targetObject1).roleProperies)
                     {
                        BaseHero(this._targetObject1).reduceMp(Number(BaseHero(this._targetObject1).roleProperies.getSMMP()) * 0.02);
                     }
                  }
                  if(this._targetObject2 is BaseHero)
                  {
                     if(BaseHero(this._targetObject2).roleProperies)
                     {
                        BaseHero(this._targetObject2).reduceMp(Number(BaseHero(this._targetObject2).roleProperies.getSMMP()) * 0.02);
                     }
                  }
               }
               else if(this.type == LineEffect.LINE_RED)
               {
                  if(this._targetObject1 is BaseHero)
                  {
                     if(BaseHero(this._targetObject1).roleProperies)
                     {
                        this._targetObject1.reduceHp(Number(BaseHero(this._targetObject1).roleProperies.getSHHP()) * 0.02);
                     }
                  }
                  if(this._targetObject2 is BaseHero)
                  {
                     if(BaseHero(this._targetObject2).roleProperies)
                     {
                        this._targetObject2.reduceHp(Number(BaseHero(this._targetObject2).roleProperies.getSHHP()) * 0.02);
                     }
                  }
               }
               this.perSecondCount = 24;
            }
         }
      }
      
      public function destroy() : void
      {
         this._targetObject1 = null;
         this._targetObject2 = null;
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
         this.isDestroy = true;
      }
      
      public function get targetObject1() : BaseObject
      {
         return this._targetObject1;
      }
      
      public function set targetObject1(param1:BaseObject) : void
      {
         this._targetObject1 = param1;
      }
      
      public function get targetObject2() : BaseObject
      {
         return this._targetObject2;
      }
      
      public function set targetObject2(param1:BaseObject) : void
      {
         this._targetObject2 = param1;
      }
      
      public function get offsetYVal() : int
      {
         return this._offsetYVal;
      }
      
      public function set offsetYVal(param1:int) : void
      {
         this._offsetYVal = param1;
      }
      
      public function get direct() : uint
      {
         return this._direct;
      }
      
      public function set direct(param1:uint) : void
      {
         this._direct = param1;
      }
   }
}

