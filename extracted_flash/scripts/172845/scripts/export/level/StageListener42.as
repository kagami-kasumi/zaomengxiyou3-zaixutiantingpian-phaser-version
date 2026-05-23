package export.level
{
   import base.BaseHero;
   import base.BaseLevelListenering;
   import com.greensock.*;
   import my.*;
   
   public class StageListener42 extends BaseLevelListenering
   {
      
      public function StageListener42()
      {
         super();
      }
      
      public function StageListener41() : *
      {
         waitForRegisterDataArray = ["Monster31","Monster32","Monster33","Monster34","Monster172"];
      }
      
      override public function step() : void
      {
         super.step();
      }
      
      override public function start() : void
      {
         var _loc1_:BaseHero = null;
         super.start();
         var _loc2_:int = 10;
         if(gc.getPlayerArray().length - 1)
         {
            gc.isPK = true;
            for each(_loc1_ in gc.getPlayerArray())
            {
               _loc1_.roleProperies.setSHHP(_loc1_.roleProperies.getSHHP() * _loc2_);
               _loc1_.roleProperies.setHHP(_loc1_.roleProperies.getSHHP());
            }
         }
      }
      
      override public function destroy() : void
      {
         gc.isPK = false;
         super.destroy();
      }
   }
}

