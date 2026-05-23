package export.wall
{
   import export.ThroughWall;
   
   public class Monster28Wall extends ThroughWall
   {
      
      private var timeCount:uint;
      
      public function Monster28Wall()
      {
         super();
         this.timeCount = gc.frameClips * 60;
      }
      
      override public function step() : void
      {
         super.step();
         if(this.timeCount > 0)
         {
            --this.timeCount;
            if(this.timeCount == 0)
            {
               this.destroy();
            }
         }
      }
   }
}

