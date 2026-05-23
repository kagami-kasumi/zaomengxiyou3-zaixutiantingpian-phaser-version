package export.mapObject
{
   [Embed(source="/_assets/assets.swf", symbol="symbol198")]
   public class WoodThron2 extends WoodThron
   {
      
      public function WoodThron2()
      {
         addFrameScript(0,this.frame1);
         super();
      }
      
      internal function frame1() : *
      {
         stop();
      }
   }
}

