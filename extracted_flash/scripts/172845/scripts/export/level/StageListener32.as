package export.level
{
   import base.BaseLevelListenering;
   
   public class StageListener32 extends BaseLevelListenering
   {
      
      public function StageListener32()
      {
         super();
         waitForRegisterDataArray = ["Monster11","Monster12","Monster13","Monster20"];
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

