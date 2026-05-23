package export.level
{
   import base.BaseLevelListenering;
   import com.greensock.*;
   import config.*;
   import my.*;
   
   public class StageListener41 extends BaseLevelListenering
   {
      
      public function StageListener41()
      {
         this.gc = Config.getInstance();
         super();
         waitForRegisterDataArray = ["Monster31","Monster32","Monster33","Monster34","Monster172","Monster1111"];
      }
      
      override public function step() : void
      {
         super.step();
      }
      
      override public function start() : void
      {
         super.start();
         if(this.gc.isXl)
         {
            TweenMax.delayedCall(3,function():*
            {
               MainGame.getInstance().createMonster(11111,500,5 * 60);
            });
         }
         else
         {
            TweenMax.delayedCall(3,function():*
            {
               MainGame.getInstance().createMonster(32,800,5 * 60);
            });
         }
      }
      
      override public function destroy() : void
      {
         super.destroy();
      }
   }
}

