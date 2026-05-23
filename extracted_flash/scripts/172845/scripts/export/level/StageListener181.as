package export.level
{
   import base.BaseLevelListenering;
   import com.greensock.*;
   import my.*;
   
   public class StageListener181 extends BaseLevelListenering
   {
      
      public function StageListener181()
      {
         super();
         waitForRegisterDataArray = ["Monster1000"];
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
            MainGame.getInstance().createMonster(1000,600,200);
         });
      }
      
      override public function destroy() : void
      {
         super.destroy();
      }
   }
}

