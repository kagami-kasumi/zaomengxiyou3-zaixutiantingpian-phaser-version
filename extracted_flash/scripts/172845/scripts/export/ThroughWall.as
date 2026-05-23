package export
{
   import base.Wall;
   import flash.display.MovieClip;
   
   [Embed(source="/_assets/assets.swf", symbol="symbol120")]
   public class ThroughWall extends Wall
   {
      
      public var isThroughWall:MovieClip;
      
      public function ThroughWall()
      {
         super();
      }
      
      override public function step() : void
      {
         super.step();
      }
   }
}

