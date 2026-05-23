package export
{
   import config.*;
   import flash.display.Sprite;
   import flash.text.*;
   import my.*;
   
   public class HeroBuff extends Sprite
   {
      
      public static var HPUPBUFF:String = "hpupbuff";
      
      private var gc:Config;
      
      private var currentBuffEffectArray:Array;
      
      private var ttf:TextFormat;
      
      public function HeroBuff()
      {
         this.currentBuffEffectArray = [];
         super();
         this.gc = Config.getInstance();
         this.ttf = new TextFormat();
         this.ttf.size = 20;
         this.ttf.color = 16711680;
         this.ttf.font = AllConsts.GAME_CONFIG_FONT;
      }
      
      public function step() : void
      {
         var _loc1_:* = null;
         var _loc2_:int = 0;
         while(_loc2_ < this.gc.heroBuffArray.length)
         {
            _loc1_ = this.gc.heroBuffArray[_loc2_];
            if(_loc1_.count > 0)
            {
               --_loc1_.count;
            }
            _loc2_++;
         }
      }
      
      public function addBuff(param1:int) : void
      {
         if(this.currentBuffEffectArray.indexOf(param1) == -1)
         {
            this.currentBuffEffectArray.push(param1);
         }
      }
      
      public function removeBuff(param1:int) : void
      {
      }
   }
}

