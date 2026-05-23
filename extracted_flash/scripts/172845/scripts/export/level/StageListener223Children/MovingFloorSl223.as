package export.level.StageListener223Children
{
   import base.BaseHero;
   import export.ThroughWall;
   
   public class MovingFloorSl223 extends ThroughWall
   {
      
      private var direct:String = "";
      
      public var initY:Number = 0;
      
      private var turnToUpCount:uint = 8;
      
      public function MovingFloorSl223(param1:uint)
      {
         super();
         this.speedX = 0;
         this.visible = false;
         this.userDataName = "stagelistener223futai" + param1;
      }
      
      override public function step() : void
      {
         var _loc1_:BaseHero = null;
         super.step();
         for each(_loc1_ in gc.getPlayerArray())
         {
            if(_loc1_.lastStandingObj == null && _loc1_.standInObj == this)
            {
               this.turnToUpCount = 8;
               this.speedY = 2;
            }
         }
         if(this.turnToUpCount > 0)
         {
            --this.turnToUpCount;
            if(this.turnToUpCount == 0)
            {
               this.speedY = -4;
            }
         }
         if(this.y < this.initY)
         {
            this.y = this.initY;
         }
      }
      
      override public function destroy() : void
      {
         super.destroy();
      }
   }
}

