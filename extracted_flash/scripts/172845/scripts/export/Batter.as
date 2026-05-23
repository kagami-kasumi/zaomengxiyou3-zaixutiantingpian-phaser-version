package export
{
   import flash.display.Sprite;
   import my.*;
   
   public class Batter extends Sprite
   {
      
      private var numSprite:ANumber;
      
      public function Batter()
      {
         super();
      }
      
      public function addBatterNum(param1:uint) : *
      {
         var _loc2_:* = NaN;
         var _loc3_:* = NaN;
         if(param1 < 10)
         {
            _loc2_ = 4;
            _loc3_ = 28.3;
         }
         else if(param1 < 100)
         {
            _loc2_ = -44.6;
            _loc3_ = 28.3;
         }
         else
         {
            _loc2_ = -95.6;
            _loc3_ = 28.3;
         }
         if(Boolean(this.numSprite) && contains(this.numSprite))
         {
            removeChild(this.numSprite);
            this.numSprite = null;
         }
         this.numSprite = new ANumber();
         this.numSprite.aNumMC("num",param1,_loc2_,_loc3_,50);
         addChild(this.numSprite);
      }
   }
}

