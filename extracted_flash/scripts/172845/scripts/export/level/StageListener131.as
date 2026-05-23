package export.level
{
   import base.BaseLevelListenering;
   import com.greensock.*;
   import my.*;
   
   public class StageListener131 extends BaseLevelListenering
   {
      
      public function StageListener131()
      {
         super();
         waitForRegisterDataArray = ["Monster1006","Monster1005","Monster1004"];
      }
      
      override public function step() : void
      {
         super.step();
      }
      
      override public function start() : void
      {
         super.start();
         TweenMax.delayedCall(1,function():*
         {
            MainGame.getInstance().createMonster(1004,500,450);
         });
      }
      
      override public function destroy() : void
      {
         super.destroy();
      }
   }
}

