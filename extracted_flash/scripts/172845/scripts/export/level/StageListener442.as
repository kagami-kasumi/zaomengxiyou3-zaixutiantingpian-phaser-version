package export.level
{
   import base.BaseLevelListenering;
   import my.*;
   
   public class StageListener442 extends BaseLevelListenering
   {
      
      public function StageListener442()
      {
         super();
         waitForRegisterDataArray = ["Monster134"];
      }
      
      override public function step() : void
      {
         super.step();
      }
      
      override public function start() : void
      {
         super.start();
         MainGame.getInstance().createMonster(134,500,300);
      }
      
      override public function destroy() : void
      {
         super.destroy();
      }
   }
}

