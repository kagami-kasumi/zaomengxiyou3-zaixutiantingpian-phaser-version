package export.level.StageListener221Children
{
   import base.BaseHero;
   import export.ThroughWall;
   import export.level.*;
   import manager.*;
   
   public class MovingFloor extends ThroughWall
   {
      
      public static var DIRECT_LEFT:String = "left";
      
      public static var DIRECT_RIGHT:String = "right";
      
      private var direct:String = "";
      
      private var kind:uint = 1;
      
      public function MovingFloor(param1:uint)
      {
         super();
         this.kind = param1;
         this.speedX = (Math.random() - 0.5) * 12;
         if(this.speedX > 0)
         {
            if(this.speedX < 3)
            {
               this.speedX = 3;
            }
         }
         else if(this.speedX > -3)
         {
            this.speedX = -3;
         }
         this.visible = false;
         this.userDataName = "stage131Futai" + this.kind;
      }
      
      override public function step() : void
      {
         var _loc1_:BaseHero = null;
         super.step();
         if(this.x < -this.width / 2)
         {
            this.destroy();
         }
         for each(_loc1_ in gc.getPlayerArray())
         {
            if(_loc1_.lastStandingObj == null && _loc1_.standInObj == this)
            {
               SoundManager.play("stage221mmmm" + this.kind);
               if(gc.pWorld.getBaseLevelListener() is StageListener221)
               {
                  (gc.pWorld.getBaseLevelListener() as StageListener221).addMusic(this.kind);
               }
            }
         }
      }
      
      public function randomInit() : void
      {
         this.width = 110;
         if(Math.random() < 0.5)
         {
            this.setDirect(DIRECT_RIGHT);
            this.x = -this.width / 2;
         }
         else
         {
            this.setDirect(DIRECT_LEFT);
            this.x = 1200 + this.width / 2;
         }
         this.y = 150 + Math.random() * 400;
      }
      
      public function setStatic() : void
      {
         this.speedX = 0;
         this.speedY = 0;
      }
      
      public function setDirect(param1:String) : void
      {
         this.direct = param1;
         if(this.direct == DIRECT_LEFT)
         {
            this.moveLeft();
         }
         else
         {
            this.moveRight();
         }
      }
      
      protected function moveRight() : void
      {
         if(this.speedX < 0)
         {
            this.speedX *= -1;
         }
      }
      
      protected function moveLeft() : void
      {
         if(this.speedX > 0)
         {
            this.speedX *= -1;
         }
      }
      
      override public function destroy() : void
      {
         super.destroy();
      }
   }
}

