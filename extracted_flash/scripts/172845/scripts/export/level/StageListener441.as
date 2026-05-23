package export.level
{
   import base.BaseLevelListenering;
   import my.*;
   
   public class StageListener441 extends BaseLevelListenering
   {
      
      public function StageListener441()
      {
         super();
         waitForRegisterDataArray = ["Monster128"];
      }
      
      override public function step() : void
      {
         super.step();
      }
      
      override public function start() : void
      {
         super.start();
         MainGame.getInstance().createMonster(128,500,300);
      }
      
      override public function destroy() : void
      {
         super.destroy();
      }
   }
}

