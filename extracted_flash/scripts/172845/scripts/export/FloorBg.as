package export
{
   import config.*;
   import flash.display.*;
   
   [Embed(source="/_assets/assets.swf", symbol="symbol143")]
   public class FloorBg extends MovieClip
   {
      
      private var gc:Config;
      
      public function FloorBg()
      {
         super();
         this.gc = Config.getInstance();
      }
      
      public function destroy() : void
      {
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
         if(this.getChildByName("floorBitmap"))
         {
            Bitmap(this.getChildByName("floorBitmap")).bitmapData.dispose();
            Bitmap(this.getChildByName("floorBitmap")).bitmapData = null;
         }
         this.gc.bg1 = null;
      }
   }
}

