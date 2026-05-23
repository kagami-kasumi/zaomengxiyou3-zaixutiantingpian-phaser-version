package export.level
{
   import base.BaseHero;
   import base.BaseLevelListenering;
   import com.greensock.*;
   import export.*;
   import flash.display.*;
   import my.*;
   
   public class StageListener91 extends BaseLevelListenering
   {
      
      private var transferTostage14:ThroughWall;
      
      private var transferTostage14Count:uint = 48;
      
      public function StageListener91()
      {
         super();
         this.waitForRegisterDataArray = ["Monster9","Monster10","Monster17","Monster18","Monster19","Monster42"];
      }
      
      override public function start() : void
      {
         super.start();
         this.transferTostage14 = gc.gameSence.getChildByName("transferTostage14") as ThroughWall;
      }
      
      override public function step() : void
      {
         var fb2Flag:Boolean = false;
         var standInFb2Array:Array = null;
         var bh:BaseHero = null;
         var mc:MovieClip = null;
         super.step();
         fb2Flag = false;
         standInFb2Array = [];
         for each(bh in gc.getPlayerArray())
         {
            if(bh.y >= 15 * 60)
            {
               if(bh.getPlayer().getSomeOneEquipNumberByName("wpbsz") > 0)
               {
                  bh.getPlayer().removeEquipFormBack("wpbsz",2,1);
                  MainGame.getInstance().fbEnter(0);
                  break;
               }
            }
            if(bh.standInObj)
            {
               if(bh.standInObj == this.transferTostage14)
               {
                  fb2Flag = true;
                  standInFb2Array.push(bh);
               }
            }
         }
         if(fb2Flag)
         {
            if(this.transferTostage14Count > 0)
            {
               --this.transferTostage14Count;
            }
            if(this.transferTostage14Count == 0)
            {
               mc = AUtils.getNewObj("stage91TransferTostage14") as MovieClip;
               mc.x = this.transferTostage14.x;
               mc.y = Number(this.transferTostage14.y) - 200;
               gc.gameSence.addChild(mc);
               gc.keyboardControl.stopKeyboardControl();
               for each(bh in standInFb2Array)
               {
                  bh.setYourFather(gc.frameClips * 2);
                  bh.setAction("wait");
                  bh.setStatic();
                  TweenMax.to(bh,2,{
                     "x":mc.x,
                     "y":mc.y - 30,
                     "onComplete":function():*
                     {
                        gc.keyboardControl.continueKeyboardControl();
                        MainGame.getInstance().fbEnter(1);
                     }
                  });
               }
            }
         }
         else
         {
            this.transferTostage14Count = 48;
         }
      }
      
      override public function destroy() : void
      {
         super.destroy();
         this.transferTostage14 = null;
      }
   }
}

