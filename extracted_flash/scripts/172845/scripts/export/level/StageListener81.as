package export.level
{
   import base.BaseBullet;
   import base.BaseHero;
   import base.BaseLevelListenering;
   import com.greensock.*;
   import flash.display.*;
   import flash.events.*;
   import flash.geom.*;
   import my.*;
   
   public class StageListener81 extends BaseLevelListenering
   {
      
      private var floorBm:Bitmap;
      
      private var bgBm:Bitmap;
      
      private var levelNum:MovieClip;
      
      private var curLevel:uint = 1;
      
      private var maxMonsterNumInCurFloor:int;
      
      private var jwealSprite:Sprite;
      
      private var jwealSpriteCount:uint = 5;
      
      public function StageListener81()
      {
         super();
         this.waitForRegisterDataArray = ["Monster35","Monster36","Monster37","Monster38","Monster39","Monster40","Monster41"];
      }
      
      public function gotoLevel(param1:uint) : void
      {
         var _loc2_:* = null;
         var _loc3_:* = null;
         this.curLevel = param1 - 1;
         this.keyBoardDownForW(null);
         for each(_loc2_ in gc.pWorld.monsterArray)
         {
            _loc2_.destroy();
            for each(_loc3_ in _loc2_.magicBulletArray)
            {
               _loc3_.destroy();
            }
         }
         gc.pWorld.monsterArray.length = 0;
      }
      
      override public function step() : void
      {
         var colipse:MovieClip = null;
         colipse = null;
         var bh:BaseHero = null;
         var bb:BaseBullet = null;
         var img:MovieClip = null;
         super.step();
         if(Number(this.curLevel) % 6 != 0)
         {
            if(this.maxMonsterNumInCurFloor <= 0)
            {
               if(gc.pWorld.monsterArray.length == 0)
               {
                  this.showTransferDoor();
               }
            }
         }
         if(this.jwealSpriteCount > 0)
         {
            if(this.jwealSprite)
            {
               colipse = this.jwealSprite.getChildByName("colipse") as MovieClip;
               if(colipse)
               {
                  for each(bh in gc.getPlayerArray())
                  {
                     for each(bb in bh.magicBulletArray)
                     {
                        if(!bb.isDisabled)
                        {
                           if(HitTest.complexHitTestObject(bb,colipse))
                           {
                              --this.jwealSpriteCount;
                              img = AUtils.getNewObj("HeroBeHurt");
                              img.x = colipse.x + 30;
                              img.y = colipse.y + 30;
                              this.jwealSprite.addChild(img);
                              if(this.jwealSpriteCount <= 0)
                              {
                                 TweenMax.to(this.jwealSprite,1,{
                                    "alpha":0,
                                    "onComplete":function(param1:StageListener81):*
                                    {
                                       param1.checkFallDown();
                                    },
                                    "onCompleteParams":[this]
                                 });
                              }
                           }
                        }
                     }
                  }
               }
            }
         }
      }
      
      private function checkFallDown() : void
      {
         var _loc1_:* = null;
         var _loc2_:String = "tlzsp";
         if(this.curLevel == 6)
         {
            _loc2_ = "tlzsp";
         }
         else if(this.curLevel == 12)
         {
            _loc2_ = "llzsp";
         }
         else if(this.curLevel == 18)
         {
            _loc2_ = "hlzsp";
         }
         else if(this.curLevel == 24)
         {
            _loc2_ = "flzsp";
         }
         _loc1_ = new FallEquipObj({
            "name":_loc2_,
            "bigtype":"dj"
         });
         _loc1_.x = this.jwealSprite.x + 40;
         _loc1_.y = 200;
         this.gc.gameSence.addChild(_loc1_);
         this.gc.otherList.push(_loc1_);
         if(this.jwealSprite)
         {
            if(gc.gameSence.contains(this.jwealSprite))
            {
               gc.gameSence.removeChild(this.jwealSprite);
            }
            this.jwealSpriteCount = 5;
            this.jwealSprite = null;
         }
      }
      
      override public function start() : void
      {
         super.start();
         this.turnToDay();
      }
      
      private function startMonsterAppear() : void
      {
         if(Number(this.curLevel) % 6 == 0)
         {
            TweenMax.delayedCall(4,function(param1:StageListener81):*
            {
               param1.turnToNight();
            },[this]);
         }
         else
         {
            TweenMax.delayedCall(4,function(param1:StageListener81):*
            {
               param1.randMonsterAppear();
            },[this]);
         }
      }
      
      private function randMonsterAppear() : void
      {
         var randKind:uint = 0;
         var randPoint:Point = null;
         var randNum:uint = 2 + Math.ceil(Math.random() * 2);
         var i:uint = 0;
         while(i < randNum)
         {
            randKind = 39 + Math.random() * 3;
            randPoint = new Point(200 + Math.random() * 900,250);
            if(gc.pWorld.monsterArray.length < gc.maxMonsterPerScreen)
            {
               MainGame.getInstance().createMonster(randKind,randPoint.x,randPoint.y);
               --this.maxMonsterNumInCurFloor;
            }
            i++;
         }
         if(this.maxMonsterNumInCurFloor > 0)
         {
            TweenMax.delayedCall(4,function(param1:StageListener81):*
            {
               param1.randMonsterAppear();
            },[this]);
         }
      }
      
      private function showTransferDoor() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = gc.pWorld.getTransferDoorArray();
         var _loc3_:int = 0;
         while(_loc3_ < _loc2_.length)
         {
            _loc1_ = _loc2_[_loc3_];
            _loc1_.visible = true;
            _loc3_++;
         }
      }
      
      override public function keyBoardDownForW(param1:BaseHero) : void
      {
         var _loc2_:* = null;
         var _loc3_:* = null;
         var _loc4_:int = 0;
         var _loc5_:* = null;
         var _loc6_:* = null;
         TweenMax.killAll(false,false);
         gc.gameSence.x = -30;
         for each(_loc2_ in gc.getPlayerArray())
         {
            _loc2_.x = 200;
            _loc2_.y = 200;
            _loc2_.setAction("wait");
            _loc2_.getBBDC().show();
            for each(_loc5_ in _loc2_.magicBulletArray)
            {
               _loc5_.destroy();
            }
            _loc2_.magicBulletArray.length = 0;
            if(_loc2_.getPet())
            {
               _loc2_.getPet().x = 200;
               _loc2_.getPet().y = 200;
               _loc2_.getPet().resetGraity();
               _loc2_.getPet().setAction("wait");
               _loc2_.getPet().cancelGxp();
            }
            if(_loc2_.getCurMagicWeapon())
            {
               _loc2_.getCurMagicWeapon().setAction("wait");
            }
         }
         _loc3_ = gc.pWorld.getTransferDoorArray();
         _loc4_ = 0;
         while(_loc4_ < _loc3_.length)
         {
            _loc6_ = _loc3_[_loc4_];
            _loc6_.visible = false;
            _loc4_++;
         }
         if(this.curLevel < 24)
         {
            ++this.curLevel;
            this.turnToDay();
         }
         else
         {
            gc.keyboardControl.destroy();
            gc.eventManger.dispatchEvent(new Event("LevelVictor"));
            MainGame.getInstance().levelClear();
         }
      }
      
      private function turnToDay() : void
      {
         this.maxMonsterNumInCurFloor = 40;
         if(Boolean(this.floorBm) && gc.gameSence.bgContainer.contains(this.floorBm))
         {
            gc.gameSence.bgContainer.removeChild(this.floorBm);
            this.floorBm = null;
         }
         if(Boolean(this.bgBm) && gc.gameSence.bgContainer.contains(this.bgBm))
         {
            gc.gameSence.bgContainer.removeChild(this.bgBm);
            this.bgBm = null;
         }
         if(Boolean(this.levelNum) && gc.gameSence.bgContainer.contains(this.levelNum))
         {
            gc.gameSence.bgContainer.removeChild(this.levelNum);
            this.levelNum = null;
         }
         this.floorBm = AUtils.getImageObj("white_floor");
         this.bgBm = AUtils.getImageObj("white_bg");
         this.levelNum = AUtils.getNewObj("SL81LevelNum") as MovieClip;
         this.levelNum.gotoAndStop(this.curLevel);
         this.levelNum.x = 455;
         this.levelNum.y = 60;
         this.bgBm.x = -30;
         this.bgBm.y = 0;
         this.floorBm.x = -30;
         this.floorBm.y = 498;
         gc.gameSence.bgContainer.addChild(this.bgBm);
         gc.gameSence.bgContainer.addChild(this.floorBm);
         gc.gameSence.bgContainer.addChild(this.levelNum);
         this.startMonsterAppear();
         if(this.jwealSprite)
         {
            if(gc.gameSence.contains(this.jwealSprite))
            {
               gc.gameSence.removeChild(this.jwealSprite);
            }
            this.jwealSpriteCount = 5;
            this.jwealSprite = null;
         }
         gc.gameInfo.clearBossBlood();
      }
      
      private function turnToNight() : void
      {
         var _loc1_:int = 35;
         if(this.curLevel == 6)
         {
            _loc1_ = 35;
         }
         else if(this.curLevel == 12)
         {
            _loc1_ = 36;
         }
         else if(this.curLevel == 18)
         {
            _loc1_ = 38;
         }
         else if(this.curLevel == 24)
         {
            _loc1_ = 37;
         }
         MainGame.getInstance().createMonster(_loc1_,800,200);
         if(Boolean(this.floorBm) && gc.gameSence.bgContainer.contains(this.floorBm))
         {
            gc.gameSence.bgContainer.removeChild(this.floorBm);
            this.floorBm = null;
         }
         if(Boolean(this.bgBm) && gc.gameSence.bgContainer.contains(this.bgBm))
         {
            gc.gameSence.bgContainer.removeChild(this.bgBm);
            this.bgBm = null;
         }
         if(Boolean(this.levelNum) && gc.gameSence.bgContainer.contains(this.levelNum))
         {
            gc.gameSence.bgContainer.removeChild(this.levelNum);
            this.levelNum = null;
         }
         this.floorBm = AUtils.getImageObj("black_floor");
         this.bgBm = AUtils.getImageObj("black_bg");
         this.levelNum = AUtils.getNewObj("SL81LevelNum") as MovieClip;
         this.levelNum.gotoAndStop(this.curLevel);
         this.levelNum.x = 455;
         this.levelNum.y = 60;
         this.bgBm.x = -30;
         this.bgBm.y = 0;
         this.floorBm.x = -30;
         this.floorBm.y = 498;
         gc.gameSence.bgContainer.addChild(this.bgBm);
         gc.gameSence.bgContainer.addChild(this.floorBm);
         gc.gameSence.bgContainer.addChild(this.levelNum);
      }
      
      public function showJwealSprite() : void
      {
         if(!this.jwealSprite)
         {
            if(this.curLevel == 6)
            {
               this.jwealSprite = AUtils.getNewObj("Map81Tujweal") as Sprite;
            }
            else if(this.curLevel == 12)
            {
               this.jwealSprite = AUtils.getNewObj("Map81Leijweal") as Sprite;
            }
            else if(this.curLevel == 18)
            {
               this.jwealSprite = AUtils.getNewObj("Map81Firejweal") as Sprite;
            }
            else if(this.curLevel == 24)
            {
               this.jwealSprite = AUtils.getNewObj("Map81Windjweal") as Sprite;
            }
            if(this.jwealSprite)
            {
               this.jwealSprite.x = 1000;
               this.jwealSprite.y = 305;
               gc.gameSence.addChild(this.jwealSprite);
            }
         }
      }
      
      public function getCurLevel() : uint
      {
         return this.curLevel;
      }
      
      override public function destroy() : void
      {
         super.destroy();
      }
   }
}

