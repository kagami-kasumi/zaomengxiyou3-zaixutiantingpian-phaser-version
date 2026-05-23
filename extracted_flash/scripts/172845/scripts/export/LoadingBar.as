package export
{
   import com.greensock.*;
   import flash.display.MovieClip;
   import flash.text.TextField;
   import my.*;
   
   [Embed(source="/_assets/assets.swf", symbol="symbol257")]
   public class LoadingBar extends MovieClip
   {
      
      public var logo:TextField;
      
      public var bar:MovieClip;
      
      public function LoadingBar()
      {
         super();
         this.logo.appendText(String("1.0"));
      }
      
      public function changeTips() : void
      {
         if(this.tips.currentFrame < this.tips.totalFrames)
         {
            this.tips.gotoAndStop(this.tips.currentFrame + 1);
         }
         else
         {
            this.tips.gotoAndStop(1);
         }
         TweenMax.delayedCall(8,function(param1:LoadingBar):*
         {
            param1.changeTips();
         },[this]);
      }
      
      public function setProcess(param1:int) : void
      {
         this.bar.gotoAndStop(param1);
      }
   }
}

