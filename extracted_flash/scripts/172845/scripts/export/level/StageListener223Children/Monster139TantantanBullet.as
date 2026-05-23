package export.level.StageListener223Children
{
   import export.bullet.EnemyMoveBullet;
   
   public class Monster139TantantanBullet extends EnemyMoveBullet
   {
      
      public var hitTimes:int = 3;
      
      private var cccc:int = 5;
      
      public function Monster139TantantanBullet(param1:String, param2:String = "")
      {
         super(param1,param2);
      }
      
      override public function step2() : void
      {
         super.step2();
         if(this.hitTimes == 0)
         {
            this.destroy();
         }
         if(this.cccc > 0)
         {
            --this.cccc;
            if(this.cccc == 0)
            {
               AUtils.shallowEffect(this);
               this.cccc = 5;
            }
         }
      }
      
      override public function destroy() : void
      {
         super.destroy();
      }
   }
}

