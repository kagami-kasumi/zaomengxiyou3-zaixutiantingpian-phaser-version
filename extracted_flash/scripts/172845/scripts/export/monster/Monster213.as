package export.monster
{
   import flash.display.MovieClip;
   import mvc.controllor.*;
   
   public class Monster213 extends Monster212
   {
      
      public function Monster213()
      {
         super();
         this.protectedParamsObject.fallProbability = 1;
         this.protectedParamsObject.fallList = [{
            "name":"wpxt",
            "bigtype":"dj",
            "num":int(40 + RandomControllor.getIns().getRandom() * 40)
         }];
         this.setHue(-150);
      }
      
      override public function destroy() : void
      {
         var ta:Array = null;
         var i:int = 0;
         var mc:MovieClip = null;
         if(this.getHp() <= 0)
         {
            if(this.isBoss)
            {
               ta = gc.pWorld.getTransferDoorArray();
               i = 0;
               while(i < ta.length)
               {
                  mc = ta[i];
                  mc.visible = true;
                  i++;
               }
            }
         }
         super.destroy();
      }
      
      override protected function callFenshen() : void
      {
      }
   }
}

