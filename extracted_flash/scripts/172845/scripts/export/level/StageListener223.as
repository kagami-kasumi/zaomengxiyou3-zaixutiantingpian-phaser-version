package export.level
{
   import base.BaseLevelListenering;
   import base.BaseMonster;
   import base.BaseObject;
   import com.greensock.TweenMax;
   import export.level.StageListener223Children.*;
   import export.magicWeapon.MagicBigBottleChild.*;
   import export.monster.*;
   import flash.display.*;
   import my.*;
   
   public class StageListener223 extends BaseLevelListenering
   {
      
      private const WALLAPPEARCOUNT:uint = 72;
      
      private var wallAppearCurrentCount:int = 72;
      
      private var boss:Monster139;
      
      private var transferDoorBindFloor:MovingFloorSl223;
      
      private var transferDoor:MovieClip;
      
      private var maxMonsterCount:int = 30;
      
      private var monsterAppearCount:uint = 0;
      
      internal var tw:TweenMax;
      
      internal var bm:BaseMonster;
      
      public function StageListener223()
      {
         super();
         waitForRegisterDataArray = ["Monster139","Monster133","Monster136"];
      }
      
      override public function step() : void
      {
         super.step();
         if(this.transferDoor)
         {
            if(this.transferDoorBindFloor)
            {
               this.transferDoor.x = this.transferDoorBindFloor.x;
               this.transferDoor.y = Number(this.transferDoorBindFloor.y) - 50;
            }
         }
         if(this.maxMonsterCount > 0)
         {
            if(this.monsterAppearCount == gc.frameClips)
            {
               this.createMonster();
               this.monsterAppearCount = 0;
            }
         }
         else if(this.maxMonsterCount == 0)
         {
            if(gc.pWorld.monsterArray.length == 0)
            {
               this.createBoss();
            }
         }
         if(this.monsterAppearCount < gc.frameClips)
         {
            ++this.monsterAppearCount;
         }
      }
      
      private function createMonster() : void
      {
         if(gc.pWorld.monsterArray.length < 10)
         {
            if(Math.random() < 0.5)
            {
               MainGame.getInstance().createMonster(136,100 + Math.random() * 600,Math.random() * 400);
            }
            else
            {
               MainGame.getInstance().createMonster(133,100 + Math.random() * 600,Math.random() * 400);
            }
         }
         --this.maxMonsterCount;
      }
      
      private function createBoss() : void
      {
         this.boss = MainGame.getInstance().createMonster(139,100 + Math.random() * 600,100 + Math.random() * 200) as Monster139;
         --this.maxMonsterCount;
      }
      
      override public function start() : void
      {
         var _loc1_:MovingFloorSl223 = null;
         _loc1_ = null;
         _loc1_ = new MovingFloorSl223(1);
         _loc1_.x = 150;
         _loc1_.y = 400;
         _loc1_.initY = 400;
         gc.gameSence.addChild(_loc1_);
         gc.pWorld.getWallArray().push(_loc1_);
         _loc1_ = new MovingFloorSl223(2);
         _loc1_.x = 450;
         _loc1_.y = 300;
         _loc1_.initY = 300;
         gc.gameSence.addChild(_loc1_);
         gc.pWorld.getWallArray().push(_loc1_);
         _loc1_ = new MovingFloorSl223(2);
         _loc1_.x = 750;
         _loc1_.y = 200;
         _loc1_.initY = 200;
         gc.gameSence.addChild(_loc1_);
         gc.pWorld.getWallArray().push(_loc1_);
         _loc1_ = new MovingFloorSl223(2);
         _loc1_.x = 450;
         _loc1_.y = 100;
         _loc1_.initY = 100;
         gc.gameSence.addChild(_loc1_);
         gc.pWorld.getWallArray().push(_loc1_);
         _loc1_ = new MovingFloorSl223(1);
         _loc1_.x = 150;
         _loc1_.y = 0;
         _loc1_.initY = 0;
         gc.gameSence.addChild(_loc1_);
         gc.pWorld.getWallArray().push(_loc1_);
         _loc1_ = new MovingFloorSl223(2);
         _loc1_.x = 450;
         _loc1_.y = -200;
         _loc1_.initY = -200;
         gc.gameSence.addChild(_loc1_);
         gc.pWorld.getWallArray().push(_loc1_);
         this.transferDoorBindFloor = _loc1_;
         super.start();
      }
      
      public function addBoatByBaseObject(param1:BaseObject) : void
      {
         var _loc2_:StageBoat = new StageBoat(param1,-1);
         _loc2_.x = param1.x;
         _loc2_.y = param1.y + 90;
         gc.pWorld.getWallArray().push(_loc2_);
         gc.gameSence.addChild(_loc2_);
      }
      
      public function addTransferDoor() : void
      {
         this.transferDoor = AUtils.getNewObj("transferDoor") as MovieClip;
         this.transferDoor.x = this.transferDoorBindFloor.x;
         this.transferDoor.y = Number(this.transferDoorBindFloor.y) - 50;
         gc.gameSence.addChild(this.transferDoor);
         gc.pWorld.getTransferDoorArray().push(this.transferDoor);
      }
      
      override public function destroy() : void
      {
         this.boss = null;
         this.transferDoorBindFloor = null;
         this.transferDoor = null;
         super.destroy();
      }
   }
}

