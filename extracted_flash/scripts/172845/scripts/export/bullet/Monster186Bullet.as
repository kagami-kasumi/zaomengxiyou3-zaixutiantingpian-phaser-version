package export.bullet
{
   import base.BaseHero;
   
   public class Monster186Bullet extends EnemyMoveBullet
   {
      
      public var taraget:BaseHero;
      
      private var isStartMove:Boolean = false;
      
      private var index:int = 0;
      
      public function Monster186Bullet(imgMcName:String, param2:String = "")
      {
         super(imgMcName,param2);
      }
      
      override public function step2() : void
      {
         super.step2();
         this.isStartMove = true;
         if(this.taraget)
         {
            if(this.taraget.isDead())
            {
               this.taraget = gc.getRandomPlayer();
            }
            if(this.isStartMove)
            {
               if(this.taraget.x > this.x)
               {
                  this.setSpeed(5 + this.index,0);
               }
               else
               {
                  this.setSpeed(-(5 + this.index),0);
               }
            }
         }
         else
         {
            this.destroy();
         }
      }
      
      override public function destroy() : void
      {
         super.destroy();
         this.taraget = null;
      }
   }
}

