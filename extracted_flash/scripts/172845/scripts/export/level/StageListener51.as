package export.level
{
   import base.BaseLevelListenering;
   
   public class StageListener51 extends BaseLevelListenering
   {
      
      public function StageListener51()
      {
         super();
         this.waitForRegisterDataArray = ["Monster18","Monster17","Monster25","Monster1007"];
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

