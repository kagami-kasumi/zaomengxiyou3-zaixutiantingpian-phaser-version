package export.bullet
{
   import base.*;
   import flash.display.*;
   import flash.events.*;
   
   public class TrailBullet extends TraceTargetBullet
   {
      
      private var trailPoints:Array;
      
      private var _trailLength:int = 10;
      
      private var trailSprite:Sprite;
      
      private var rectWidth:Number;
      
      private var rectHeight:Number;
      
      private var interpolationSteps:int = 5;
      
      public function TrailBullet(param1:String, father:BaseObject, symbolClass:Class, param2:String = "", width:Number = 119.2, height:Number = 36.8)
      {
         this.rectWidth = width;
         this.rectHeight = height;
         super(param1,father,symbolClass,param2);
         this.trailPoints = [];
         this.trailSprite = new Sprite();
         addChildAt(this.trailSprite,0);
         this.trailPoints.push({
            "x":x,
            "y":y,
            "rotation":rotation
         });
      }
      
      override protected function step() : void
      {
         super.step();
         this.updateTrail();
      }
      
      private function updateTrail() : void
      {
         var t:Number = NaN;
         if(!this.trailPoints)
         {
            return;
         }
         var lastPoint:Object = this.trailPoints[this.trailPoints.length - 1];
         var deltaX:Number = x - lastPoint.x;
         var deltaY:Number = y - lastPoint.y;
         var deltaRotation:Number = rotation - lastPoint.rotation;
         for(var i:int = 1; i <= this.interpolationSteps; i++)
         {
            t = i / (this.interpolationSteps + 1);
            this.trailPoints.push({
               "x":lastPoint.x + deltaX * t,
               "y":lastPoint.y + deltaY * t,
               "rotation":lastPoint.rotation + deltaRotation * t
            });
         }
         this.trailPoints.push({
            "x":x,
            "y":y,
            "rotation":rotation
         });
         while(this.trailPoints.length > this._trailLength * (this.interpolationSteps + 1))
         {
            this.trailPoints.shift();
         }
         this.drawTrail();
      }
      
      private function drawTrail() : void
      {
         var current:Object = null;
         var alpha:Number = NaN;
         var prev:Object = null;
         var controlX:Number = NaN;
         var controlY:Number = NaN;
         this.trailSprite.graphics.clear();
         if(this.trailPoints.length < 2)
         {
            return;
         }
         var lineThickness:Number = this.rectHeight * 0.3;
         this.trailSprite.graphics.lineStyle(lineThickness,16776960,0.8);
         var firstPoint:Object = this.trailPoints[0];
         this.trailSprite.graphics.moveTo(firstPoint.x - x,firstPoint.y - y);
         for(var i:int = 1; i < this.trailPoints.length; i++)
         {
            current = this.trailPoints[i];
            alpha = 0.1 + i / this.trailPoints.length * 0.6;
            this.trailSprite.graphics.lineStyle(lineThickness * (0.5 + i / this.trailPoints.length * 0.5),16776960,alpha);
            prev = this.trailPoints[i - 1];
            controlX = (prev.x + current.x) / 2 - x;
            controlY = (prev.y + current.y) / 2 - y;
            this.trailSprite.graphics.curveTo(controlX,controlY,current.x - x,current.y - y);
         }
      }
      
      public function set trailLength(value:int) : void
      {
         this._trailLength = Math.max(5,value);
      }
      
      public function set interpolationQuality(value:int) : void
      {
         this.interpolationSteps = Math.max(1,Math.min(5,value));
      }
      
      override public function destroy() : void
      {
         if(Boolean(this.trailSprite) && Boolean(this.trailSprite.parent))
         {
            removeChild(this.trailSprite);
         }
         this.trailSprite = null;
         this.trailPoints = null;
         super.destroy();
      }
   }
}

