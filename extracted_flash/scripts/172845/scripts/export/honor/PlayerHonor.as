package export.honor
{
   import flash.display.*;
   import flash.filters.*;
   import flash.text.*;
   import my.*;
   
   public class PlayerHonor
   {
      
      internal static var tf:TextField = new TextField();
      
      internal static var ttf:TextFormat = new TextFormat();
      
      public function PlayerHonor()
      {
         super();
      }
      
      public static function getHonorBitmap(param1:String) : Bitmap
      {
         ttf.size = 16;
         ttf.bold = true;
         tf.embedFonts = true;
         ttf.font = AllConsts.GAME_CONFIG_FONT;
         tf.defaultTextFormat = ttf;
         tf.htmlText = "<font color=\'#FF0000\'>" + param1 + "</font>";
         tf.width = tf.textWidth + 10;
         tf.filters = [new GlowFilter(0,1,8,8,5)];
         var _loc2_:BitmapData = new BitmapData(tf.textWidth + 10,tf.textHeight + 20,true,16777215);
         _loc2_.draw(tf);
         return new Bitmap(_loc2_);
      }
   }
}

