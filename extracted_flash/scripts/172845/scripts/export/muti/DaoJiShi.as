package export.muti
{
   import com.greensock.*;
   import flash.display.*;
   
   public class DaoJiShi extends Sprite
   {
      
      public static var DAOJISHI_1:String = "1";
      
      public static var DAOJISHI_2:String = "2";
      
      public static var DAOJISHI_3:String = "3";
      
      public static var DAOJISHI_START:String = "START";
      
      private var bg:Bitmap;
      
      public function DaoJiShi(param1:String)
      {
         var numBmp:Sprite = null;
         var str:String = param1;
         super();
         this.bg = AUtils.getImageObj("PK_DAOJISHI_BG") as Bitmap;
         this.addChild(this.bg);
         numBmp = AUtils.getNewObj("PK_DAOJISHI_" + str) as Sprite;
         numBmp.x = 75;
         numBmp.y = 80;
         this.addChild(numBmp);
         if(str != "START")
         {
            TweenMax.to(numBmp,1,{
               "width":numBmp.width / 2,
               "height":numBmp.height / 2,
               "onComplete":function(param1:DaoJiShi):*
               {
                  param1.destroy();
               },
               "onCompleteParams":[this]
            });
         }
         else
         {
            TweenMax.to(numBmp,2,{
               "width":numBmp.width / 2,
               "height":numBmp.height / 2,
               "onComplete":function(param1:DaoJiShi):*
               {
                  param1.destroy();
               },
               "onCompleteParams":[this]
            });
         }
      }
      
      private function destroy() : void
      {
         if(this.parent)
         {
            this.parent.removeChild(this);
            if(this.bg)
            {
               this.bg.bitmapData.dispose();
               this.bg = null;
            }
         }
      }
   }
}

