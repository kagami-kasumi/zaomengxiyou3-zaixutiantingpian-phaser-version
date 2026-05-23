package export.level
{
   import base.BaseLevelListenering;
   import com.greensock.*;
   import my.*;
   
   public class StageListener173 extends BaseLevelListenering
   {
      
      public function StageListener173()
      {
         super();
         waitForRegisterDataArray = [];
      }
      
      override public function step() : void
      {
         super.step();
      }
      
      override public function start() : void
      {
         super.start();
         TweenMax.delayedCall(2,function():*
         {
            MainGame.getInstance().createMonster(115,10 * 60,200);
         });
      }
      
      override public function destroy() : void
      {
         super.destroy();
      }
   }
}

