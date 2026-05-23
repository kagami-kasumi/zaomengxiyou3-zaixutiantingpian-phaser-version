package export.level
{
   import base.BaseLevelListenering;
   import com.greensock.*;
   import flash.display.*;
   import my.*;
   
   public class StageListener161 extends BaseLevelListenering
   {
      
      public var BossArray:Array;
      
      private var transferDoor:MovieClip;
      
      public function StageListener161()
      {
         this.BossArray = [];
         super();
         waitForRegisterDataArray = ["Monster601","Monster602","Monster603","Monster604"];
         this.BossArray = ["Monster601","Monster602","Monster603","Monster604"];
      }
      
      override public function step() : void
      {
         super.step();
      }
      
      override public function start() : void
      {
         super.start();
         TweenMax.delayedCall(5,function():*
         {
            MainGame.getInstance().createMonster(601,500,300);
         });
         TweenMax.delayedCall(25,function():*
         {
            MainGame.getInstance().createMonster(602,500,300);
         });
         TweenMax.delayedCall(45,function():*
         {
            MainGame.getInstance().createMonster(603,500,300);
         });
         TweenMax.delayedCall(65,function():*
         {
            MainGame.getInstance().createMonster(604,500,300);
         });
      }
      
      public function addTransferDoor() : void
      {
         this.transferDoor = AUtils.getNewObj("transferDoor") as MovieClip;
         this.transferDoor.x = 500;
         this.transferDoor.y = 450;
         gc.gameSence.addChild(this.transferDoor);
         gc.pWorld.getTransferDoorArray().push(this.transferDoor);
      }
      
      override public function destroy() : void
      {
         super.destroy();
         this.transferDoor = null;
         this.BossArray = null;
      }
   }
}

