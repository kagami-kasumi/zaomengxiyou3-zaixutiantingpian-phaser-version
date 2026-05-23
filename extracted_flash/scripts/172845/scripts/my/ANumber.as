package my
{
   import com.greensock.*;
   import com.greensock.easing.*;
   import flash.display.*;
   import flash.geom.*;
   
   public class ANumber extends Sprite
   {
      
      public var isUse:Boolean = false;
      
      private var _tween:TweenMax;
      
      public function ANumber()
      {
         super();
      }
      
      public function aNumMC(param1:String, param2:int, param3:int, param4:int, param5:int) : *
      {
         var _loc6_:* = 0;
         var _loc7_:* = null;
         var _loc8_:int = 0;
         while(_loc8_ < String(param2).length)
         {
            _loc6_ = uint(int(String(param2).charAt(_loc8_)));
            _loc7_ = AUtils.getNewObj(param1 + _loc6_) as DisplayObject;
            _loc7_.x = _loc8_ * param5;
            addChild(_loc7_);
            _loc8_++;
         }
         this.x = param3;
         this.y = param4;
         this.isUse = true;
      }
      
      public function aNumImage(param1:String, param2:int, param3:int, param4:int, param5:int) : *
      {
         var _loc6_:* = 0;
         var _loc7_:* = undefined;
         var _loc8_:int = 0;
         while(_loc8_ < String(param2).length)
         {
            _loc6_ = uint(int(String(param2).charAt(_loc8_)));
            _loc7_ = AUtils.getImageObj(param1 + _loc6_);
            _loc7_.x = _loc8_ * param5;
            addChild(_loc7_);
            _loc8_++;
         }
         this.x = param3;
         this.y = param4;
         var _loc9_:TweenMax = TweenMax.to(this,1,{
            "y":this.y - 100,
            "alpha":0,
            "delay":0.25,
            "onComplete":this.destroy,
            "ease":Quad.easeOut
         });
         this.scaleY = 4;
         this.scaleX = 4;
         this._tween = TweenMax.to(this,0.2,{
            "scaleX":1,
            "scaleY":1,
            "ease":Quad.easeOut
         });
         this.isUse = true;
      }
      
      private function removeAllChildren() : void
      {
         while(this.numChildren > 0)
         {
            this.removeChildAt(0);
         }
      }
      
      public function destroy() : *
      {
         if(this._tween)
         {
            this._tween.kill();
         }
         this._tween = null;
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
      }
   }
}

