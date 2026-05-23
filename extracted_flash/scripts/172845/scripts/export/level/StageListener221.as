package export.level
{
   import base.BaseLevelListenering;
   import base.BaseMonster;
   import base.BaseObject;
   import com.greensock.TweenMax;
   import export.level.StageListener221Children.*;
   import export.magicWeapon.MagicBigBottleChild.*;
   import export.monster.*;
   import flash.display.*;
   import flash.geom.Point;
   import my.*;
   
   public class StageListener221 extends BaseLevelListenering
   {
      
      private var moveAbleFloorsArray:Array;
      
      private var musicSprite:MusicSprite;
      
      private var m131:Monster131;
      
      private var monsterAppearCount:uint = 96;
      
      private var currentMonsterAppearCount:uint;
      
      private var m131TotalNums:int = 100;
      
      internal var tw:TweenMax;
      
      internal var bm:BaseMonster;
      
      public function StageListener221()
      {
         this.moveAbleFloorsArray = [];
         this.currentMonsterAppearCount = this.monsterAppearCount;
         super();
         waitForRegisterDataArray = ["Monster131","Monster132","Monster133"];
      }
      
      override public function step() : void
      {
         super.step();
         if(this.musicSprite)
         {
            if(this.musicSprite.currentState == 0)
            {
               if(this.m131TotalNums > 0)
               {
                  if(gc.pWorld.monsterArray.length < 5)
                  {
                     if(this.currentMonsterAppearCount > 0)
                     {
                        --this.currentMonsterAppearCount;
                        if(this.currentMonsterAppearCount == 0)
                        {
                           this.addMonster133();
                           this.currentMonsterAppearCount = this.monsterAppearCount;
                           --this.m131TotalNums;
                        }
                     }
                  }
               }
            }
         }
      }
      
      override public function start() : void
      {
         var _loc2_:MovieClip = null;
         var _loc1_:BaseObject = null;
         _loc2_ = null;
         super.start();
         this.createWall();
         for each(_loc1_ in gc.getPlayerAndPetArray())
         {
            _loc1_.x = 100;
         }
         this.musicSprite = new MusicSprite();
         this.musicSprite.x = 480;
         this.musicSprite.y = 50;
         gc.gameInfo.addChild(this.musicSprite);
         _loc2_ = AUtils.getNewObj("transferDoor") as MovieClip;
         _loc2_.x = 1030;
         _loc2_.y = 395;
         _loc2_.visible = false;
         gc.gameSence.addChild(_loc2_);
         gc.pWorld.getTransferDoorArray().push(_loc2_);
      }
      
      private function createWall() : void
      {
         var _loc1_:MovingFloor = null;
         var _loc2_:uint = 1;
         while(_loc2_ <= 7)
         {
            _loc1_ = new MovingFloor(_loc2_);
            _loc1_.setStatic();
            _loc1_.x = 40 + (_loc2_ - 1) * 165;
            _loc1_.y = 450;
            _loc1_.width = 100;
            gc.gameSence.addChildAt(_loc1_,gc.getMinIdxInHeroAndPet());
            gc.pWorld.getWallArray().push(_loc1_);
            this.moveAbleFloorsArray.push(_loc1_);
            _loc2_++;
         }
      }
      
      public function addMusic(param1:uint) : void
      {
         if(this.musicSprite)
         {
            if(this.musicSprite.currentState == 1)
            {
               this.musicSprite.addMusic(param1);
            }
         }
      }
      
      public function addBoss() : void
      {
         if(!this.m131)
         {
            if(this.musicSprite)
            {
               this.musicSprite.destroy();
               this.musicSprite = null;
            }
            this.m131 = MainGame.getInstance().createMonster(131,500,200) as Monster131;
         }
      }
      
      public function addMonster133() : void
      {
         MainGame.getInstance().createMonster(133,400 + Math.random() * 500,200);
      }
      
      public function addMu(param1:Point) : void
      {
         this.musicSprite.addRandomMusicByPoint(param1);
      }
      
      public function addBoatByBaseObject(param1:BaseObject) : void
      {
         var _loc2_:StageBoat = new StageBoat(param1,-1);
         _loc2_.x = param1.x;
         _loc2_.y = param1.y + 90;
         gc.pWorld.getWallArray().push(_loc2_);
         gc.gameSence.addChild(_loc2_);
      }
      
      override public function destroy() : void
      {
         var _loc1_:MovingFloor = null;
         for each(_loc1_ in this.moveAbleFloorsArray)
         {
            _loc1_.destroy();
         }
         this.moveAbleFloorsArray.length = 0;
         super.destroy();
      }
   }
}

