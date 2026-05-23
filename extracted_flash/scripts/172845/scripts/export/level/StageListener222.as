package export.level
{
   import base.BaseLevelListenering;
   import base.BaseMonster;
   import base.BaseObject;
   import com.greensock.TweenMax;
   import export.level.StageListener222Children.*;
   import export.magicWeapon.MagicBigBottleChild.*;
   import export.monster.*;
   import flash.display.*;
   import my.*;
   
   public class StageListener222 extends BaseLevelListenering
   {
      
      private var moveAbleFloorsArray:Array;
      
      private const WALLAPPEARCOUNT:uint = 72;
      
      private var wallAppearCurrentCount:int = 72;
      
      private var monsterAppearCount:uint = 72;
      
      private var monsterCurAppearCount:uint;
      
      private var totalMonsterCount:int = 20;
      
      private var boss:Monster135;
      
      internal var tw:TweenMax;
      
      internal var bm:BaseMonster;
      
      private var renewalse:Sprite;
      
      public function StageListener222()
      {
         this.moveAbleFloorsArray = [];
         this.monsterCurAppearCount = this.monsterAppearCount;
         super();
         waitForRegisterDataArray = [];
      }
      
      override public function step() : void
      {
         var _loc1_:MovingFloorSl222 = null;
         super.step();
         if(this.wallAppearCurrentCount > 0)
         {
            --this.wallAppearCurrentCount;
            if(this.wallAppearCurrentCount == 0)
            {
               this.createWall();
               this.wallAppearCurrentCount = this.WALLAPPEARCOUNT;
            }
         }
         if(this.totalMonsterCount > 0)
         {
            if(this.monsterCurAppearCount > 0)
            {
               --this.monsterCurAppearCount;
               if(this.monsterCurAppearCount == 0)
               {
                  this.createMonster();
                  this.monsterCurAppearCount = this.monsterAppearCount;
               }
            }
         }
         else if(this.totalMonsterCount == 0)
         {
            if(gc.pWorld.monsterArray.length == 0)
            {
               this.createBoss();
               --this.totalMonsterCount;
            }
         }
         if(this.boss)
         {
            if(Number(this.boss.getHp()) / Number(this.boss.getSHp()) < 0.01)
            {
               for each(_loc1_ in this.moveAbleFloorsArray)
               {
                  _loc1_.setStatic();
                  this.wallAppearCurrentCount = -1;
               }
            }
         }
      }
      
      private function createMonster() : void
      {
         if(gc.pWorld.monsterArray.length < 10)
         {
            MainGame.getInstance().createMonster(136,300 + Math.random() * 800,100 + Math.random() * 200);
         }
         --this.totalMonsterCount;
      }
      
      private function createBoss() : void
      {
         this.boss = MainGame.getInstance().createMonster(135,300 + Math.random() * 800,100 + Math.random() * 200) as Monster135;
      }
      
      override public function start() : void
      {
         var _loc1_:BaseObject = null;
         super.start();
         this.createInitHeroWall();
         for each(_loc1_ in gc.getPlayerAndPetArray())
         {
            _loc1_.x = 100;
         }
      }
      
      public function addBoatByBaseObject(param1:BaseObject) : void
      {
         var _loc2_:StageBoat = new StageBoat(param1,-1);
         _loc2_.x = param1.x;
         _loc2_.y = param1.y + 90;
         gc.pWorld.getWallArray().push(_loc2_);
         gc.gameSence.addChild(_loc2_);
      }
      
      public function addMonsterBoatByBaseObject(param1:BaseObject) : void
      {
         var _loc2_:Stage222Boat = new Stage222Boat(param1,-1);
         _loc2_.x = param1.x;
         _loc2_.y = param1.y + 90;
         gc.pWorld.getWallArray().push(_loc2_);
         gc.gameSence.addChild(_loc2_);
      }
      
      private function createInitHeroWall() : void
      {
         var _loc1_:MovingFloorSl222 = new MovingFloorSl222();
         _loc1_.x = 100;
         _loc1_.y = 450;
         _loc1_.speedX = 3;
         _loc1_.width = 110;
         _loc1_.visible = false;
         gc.gameSence.addChildAt(_loc1_,gc.getMinIdxInHeroAndPet());
         gc.pWorld.getWallArray().push(_loc1_);
         this.moveAbleFloorsArray.push(_loc1_);
      }
      
      private function createWall() : void
      {
         var _loc1_:MovingFloorSl222 = new MovingFloorSl222();
         _loc1_.randomInit();
         gc.gameSence.addChildAt(_loc1_,gc.getMinIdxInHeroAndPet());
         gc.pWorld.getWallArray().push(_loc1_);
         this.moveAbleFloorsArray.push(_loc1_);
      }
      
      public function addTransferDoor() : void
      {
         var _loc1_:MovingFloorSl222 = new MovingFloorSl222();
         _loc1_.randomInit();
         _loc1_.x = 800;
         _loc1_.y = 350;
         gc.gameSence.addChildAt(_loc1_,gc.getMinIdxInHeroAndPet());
         gc.pWorld.getWallArray().push(_loc1_);
         this.moveAbleFloorsArray.push(_loc1_);
         var _loc2_:MovieClip = AUtils.getNewObj("transferDoor") as MovieClip;
         _loc2_.x = _loc1_.x;
         _loc2_.y = _loc1_.y - 50;
         gc.gameSence.addChild(_loc2_);
         gc.pWorld.getTransferDoorArray().push(_loc2_);
      }
      
      override public function destroy() : void
      {
         var _loc1_:MovingFloorSl222 = null;
         for each(_loc1_ in this.moveAbleFloorsArray)
         {
            _loc1_.destroy();
         }
         this.boss = null;
         this.moveAbleFloorsArray.length = 0;
         super.destroy();
      }
   }
}

