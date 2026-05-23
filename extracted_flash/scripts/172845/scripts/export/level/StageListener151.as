package export.level
{
   import base.BaseLevelListenering;
   import com.greensock.*;
   import my.*;
   
   public class StageListener151 extends BaseLevelListenering
   {
      
      public function StageListener151()
      {
         super();
         waitForRegisterDataArray = ["Monster1003","Monster100","Monster101","Monster102"];
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
            MainGame.getInstance().createMonster(1003,600,200);
         });
      }
      
      override public function destroy() : void
      {
         super.destroy();
      }
   }
}

