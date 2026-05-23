package
{
   import flash.display.*;
   import flash.events.*;
   import flash.text.TextField;
   import flash.utils.*;
   
   public class FPScounter
   {
      
      public var lastTime:int;
      
      public var framesPassed:uint = 0;
      
      public var resetAfter:uint = 15;
      
      public var fps:Number;
      
      private var lowFPS:Number = 20;
      
      private var highFPS:Number = 30;
      
      private var FPStxt:TextField;
      
      public function FPScounter(param1:DisplayObject, param2:TextField)
      {
         super();
         this.FPStxt = param2;
         this.startCalc(param1 as DisplayObject);
      }
      
      public function startCalc(param1:DisplayObject) : void
      {
         this.lastTime = getTimer();
         this.framesPassed = 0;
         if(!param1.hasEventListener(Event.ENTER_FRAME))
         {
            param1.addEventListener(Event.ENTER_FRAME,this.update);
         }
      }
      
      public function stopCalc(param1:DisplayObject) : void
      {
         if(param1.hasEventListener(Event.ENTER_FRAME))
         {
            param1.removeEventListener(Event.ENTER_FRAME,this.update);
         }
      }
      
      public function update(param1:Event) : void
      {
         var _loc2_:* = 0;
         ++this.framesPassed;
         if(this.framesPassed == this.resetAfter)
         {
            _loc2_ = uint(getTimer());
            this.fps = 1000 * this.framesPassed / (_loc2_ - this.lastTime);
            if(!this.FPStxt)
            {
               throw "FPStxt notFound";
            }
            this.FPStxt.text = "FPS：" + Math.round(this.fps);
            this.lastTime = _loc2_;
            this.framesPassed = 0;
         }
      }
   }
}

