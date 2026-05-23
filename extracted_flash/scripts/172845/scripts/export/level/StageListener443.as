package export.level
{
   import base.BaseLevelListenering;
   import my.*;
   
   public class StageListener443 extends BaseLevelListenering
   {
      
      public function StageListener443()
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
         MainGame.getInstance().createMonster(137,500,300);
      }
      
      override public function destroy() : void
      {
         super.destroy();
      }
   }
}

