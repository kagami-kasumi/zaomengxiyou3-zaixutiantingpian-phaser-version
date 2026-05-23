package export.level
{
   import base.BaseLevelListenering;
   import com.greensock.*;
   import my.*;
   
   public class StageListener301 extends BaseLevelListenering
   {
      
      public function StageListener301()
      {
         super();
         waitForRegisterDataArray = ["Monster1008"];
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
            MainGame.getInstance().createMonster(1008,500,400);
         });
      }
      
      override public function destroy() : void
      {
         super.destroy();
      }
   }
}

