package export.level
{
   import base.BaseLevelListenering;
   
   public class StageListener33 extends BaseLevelListenering
   {
      
      public function StageListener33()
      {
         super();
         waitForRegisterDataArray = ["Monster11","Monster12","Monster13","Monster14","Monster20","Monster21","Monster22","Monster2","Monster4","Monster5","Monster6","Monster15","Monster16"];
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

