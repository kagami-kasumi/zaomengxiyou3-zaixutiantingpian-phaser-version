package export.level
{
   import base.BaseLevelListenering;
   
   public class StageListener61 extends BaseLevelListenering
   {
      
      public function StageListener61()
      {
         super();
         this.waitForRegisterDataArray = ["Monster18","Monster17","Monster24"];
      }
      
      override public function step() : void
      {
         super.step();
      }
      
      override public function destroy() : void
      {
         super.destroy();
      }
   }
}

