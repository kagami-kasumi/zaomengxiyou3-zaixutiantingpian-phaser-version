package export
{
   import flash.display.MovieClip;
   
   [Embed(source="/_assets/assets.swf", symbol="symbol277")]
   public class LoadingBar2 extends MovieClip
   {
      
      public var bar:MovieClip;
      
      public function LoadingBar2()
      {
         super();
      }
      
      public function setProcess(param1:int, param2:uint, param3:uint) : void
      {
         this.bar.gotoAndStop(param1);
      }
   }
}

