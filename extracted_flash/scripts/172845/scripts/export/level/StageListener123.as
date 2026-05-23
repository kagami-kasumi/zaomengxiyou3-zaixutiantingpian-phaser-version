package export.level
{
   import base.BaseLevelListenering;
   
   public class StageListener123 extends BaseLevelListenering
   {
      
      public function StageListener123()
      {
         super();
         waitForRegisterDataArray = ["Monster59","Monster58"];
      }
      
      override public function step() : void
      {
         super.step();
      }
      
      override public function start() : void
      {
         super.start();
      }
      
      override public function destroy() : void
      {
         super.destroy();
      }
   }
}

