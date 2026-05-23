package export.muti
{
   import flash.display.MovieClip;
   import flash.display.Sprite;
   import flash.text.TextField;
   
   public class LineTitle extends Sprite
   {
      
      public var playerNumTxt:TextField;
      
      public var lineNameMc:MovieClip;
      
      public var lineIdxMc:MovieClip;
      
      public function LineTitle()
      {
         super();
      }
      
      public function setLineIdxMc(param1:uint) : void
      {
         this.lineIdxMc.gotoAndStop(param1);
      }
      
      public function setLineNameMc(param1:uint) : void
      {
         this.lineNameMc.gotoAndStop(param1);
      }
      
      public function setPlayerNum(param1:uint, param2:uint) : void
      {
         this.playerNumTxt.text = param1 + "/" + param2;
      }
   }
}

