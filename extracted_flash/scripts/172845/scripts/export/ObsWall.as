package export
{
   import base.Wall;
   import flash.display.MovieClip;
   
   [Embed(source="/_assets/assets.swf", symbol="symbol121")]
   public class ObsWall extends Wall
   {
      
      public var isWall:MovieClip;
      
      private var offsetY:Number;
      
      private var speedAdjust:Number = 0.1;
      
      private var maxOffsetY:int = 10;
      
      private var speedArray:Array;
      
      private var speedIdx:int = 0;
      
      private var direct:int = 1;
      
      public function ObsWall()
      {
         this.speedAdjust = 0.1;
         this.speedArray = [0.95,0.9,0.85,0.75,0.65,0.55,0.5,0.45,0.4,0.35,0.3,0.25,0.2,0.15,0.1,0.15,0.1,0.05,0,0,0,0,0];
         super();
      }
      
      override public function step() : void
      {
         super.step();
         if(this.isStatic())
         {
            return;
         }
         this.x += this.speedX;
         if(this.speedY != 0)
         {
            if(this.direct == 2)
            {
               this.speedY = -Number(this.speedArray[this.speedIdx]);
               ++this.speedIdx;
               if(this.speedIdx >= this.speedArray.length)
               {
                  this.speedIdx = 0;
                  this.direct = 1;
               }
            }
            if(this.direct == 1)
            {
               this.speedY = this.speedArray[this.speedIdx];
               ++this.speedIdx;
               if(this.speedIdx >= this.speedArray.length)
               {
                  this.speedIdx = 0;
                  this.direct = 2;
               }
            }
            this.y += this.speedY;
         }
      }
   }
}

