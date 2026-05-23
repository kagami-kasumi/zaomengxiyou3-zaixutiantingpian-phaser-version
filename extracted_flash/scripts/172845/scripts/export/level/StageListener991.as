package export.level
{
   import base.BaseLevelListenering;
   import com.greensock.*;
   import my.*;
   
   public class StageListener991 extends BaseLevelListenering
   {
      
      public function StageListener991()
      {
         super();
         this.setSurpressLevel(25,20);
         waitForRegisterDataArray = ["Monster1001","Monster1002"];
      }
      
      override public function step() : void
      {
         super.step();
      }
      
      override public function start() : void
      {
         super.start();
         TweenMax.delayedCall(5,function():*
         {
            MainGame.getInstance().createMonster(1001,600,300);
         });
      }
      
      override public function destroy() : void
      {
         super.destroy();
      }
   }
}

