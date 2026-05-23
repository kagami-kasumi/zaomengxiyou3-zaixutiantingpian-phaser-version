package export.level
{
   import base.BaseLevelListenering;
   import com.greensock.*;
   import my.*;
   
   public class StageListener241 extends BaseLevelListenering
   {
      
      private var tw:TweenMax;
      
      public function StageListener241()
      {
         super();
      }
      
      override public function step() : void
      {
         super.step();
      }
      
      override public function start() : void
      {
         super.start();
         this.tw = TweenMax.delayedCall(1,function():*
         {
            MainGame.getInstance().createMonster(6001,600,200);
         });
      }
      
      override public function destroy() : void
      {
         if(this.tw)
         {
            this.tw.kill();
            this.tw = null;
         }
         super.destroy();
      }
   }
}

