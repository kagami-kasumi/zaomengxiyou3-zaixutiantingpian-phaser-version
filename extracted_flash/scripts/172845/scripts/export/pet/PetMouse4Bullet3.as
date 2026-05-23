package export.pet
{
   import export.bullet.EnemyMoveBullet1;
   
   public class PetMouse4Bullet3 extends EnemyMoveBullet1
   {
      
      private var isBack:Boolean = false;
      
      public function PetMouse4Bullet3(param1:String)
      {
         super(param1);
      }
      
      override public function step2() : void
      {
         super.step2();
         if(!this.isBack)
         {
            if(this.speed.x == 0)
            {
               this.setMoveTarget(this.sourceRole);
               this.setAddSpeed(0,0);
               this.addSpeedValue = 1;
               this.isBack = true;
            }
         }
         else if(AUtils.GetDisBetweenTwoObj(this,this.sourceRole) <= 30)
         {
            this.destroy();
         }
      }
   }
}

