package export.level
{
   import base.BaseLevelListenering;
   
   public class StageListener71 extends BaseLevelListenering
   {
      
      public function StageListener71()
      {
         super();
         this.waitForRegisterDataArray = ["Monster26","Monster27","Monster28"];
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

