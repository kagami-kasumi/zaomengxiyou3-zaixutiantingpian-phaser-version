package export.level
{
   import base.BaseLevelListenering;
   import com.greensock.*;
   import export.mapObject.*;
   import flash.display.*;
   import flash.events.Event;
   import flash.geom.*;
   import my.*;
   
   public class StageListener101 extends BaseLevelListenering
   {
      
      private var trapInfo:Array;
      
      private const TIME_COUNT_SECOND_WIND:uint = 210;
      
      private const MAX_MONSTER_NUM:uint = 15;
      
      private const MONSTER_APPEAR_COUNT:uint = 120;
      
      private const LIGHT_FATHER_COUNT:uint = 24;
      
      private const PAOPAO_PER_COUNT:uint = 160;
      
      private var player1Hp:uint = 0;
      
      private var player1Mp:uint = 0;
      
      private var player1PetHp:uint = 0;
      
      private var player1PetMp:uint = 0;
      
      private var player2Hp:uint = 0;
      
      private var player2Mp:uint = 0;
      
      private var player2PetHp:uint = 0;
      
      private var player2PetMp:uint = 0;
      
      private var player1AddEffect:Array;
      
      private var player2AddEffect:Array;
      
      private var player1PetAddEffect:Array;
      
      private var player2PetAddEffect:Array;
      
      private var maxMonsterNum:int = 15;
      
      private var monsterAppearCount:int = 120;
      
      private var monsterArray:Array;
      
      private var timeCountSecondWind:int = 210;
      
      private var paopaoPerCount:int = 160;
      
      private var underSeaDoor:MovieClip;
      
      private var underSeaLight:MovieClip;
      
      private var underSeaLightArray:Array;
      
      private var lightFatherCount:uint = 24;
      
      private var curWind:TransferWind;
      
      public function StageListener101()
      {
         this.trapInfo = [0,0,0,0];
         this.monsterArray = [44,45,46];
         this.underSeaLightArray = [1,1,1,1];
         super();
         waitForRegisterDataArray = ["Monster43","Monster44","Monster45","Monster46","Monster47"];
      }
      
      override public function step() : void
      {
         var _loc1_:* = 0;
         var _loc2_:int = 0;
         var _loc3_:* = 0;
         var _loc4_:* = 0;
         var _loc5_:* = null;
         var _loc6_:* = null;
         var _loc7_:* = 0;
         var _loc8_:Number = Number(NaN);
         var _loc9_:Number = Number(NaN);
         var _loc10_:* = null;
         var _loc11_:* = null;
         var _loc12_:Number = Number(NaN);
         super.step();
         if(gc.curLevel <= 5)
         {
            if(this.maxMonsterNum > 0)
            {
               if(this.monsterAppearCount > 0)
               {
                  --this.monsterAppearCount;
                  if(this.monsterAppearCount == 0)
                  {
                     _loc1_ = uint(2 + Math.random() * 4);
                     _loc2_ = 0;
                     while(_loc2_ < _loc1_)
                     {
                        if(gc.pWorld.monsterArray.length < gc.maxMonsterPerScreen)
                        {
                           _loc3_ = uint(Math.random() * Number(this.monsterArray.length));
                           _loc4_ = uint(this.monsterArray[_loc3_]);
                           _loc5_ = new Point(200 + Math.random() * 1000,5 * 60);
                           MainGame.getInstance().createMonster(_loc4_,_loc5_.x,_loc5_.y);
                           --this.maxMonsterNum;
                        }
                        _loc2_++;
                     }
                     this.monsterAppearCount = this.MONSTER_APPEAR_COUNT;
                  }
               }
            }
         }
         if(this.timeCountSecondWind == this.TIME_COUNT_SECOND_WIND)
         {
            if(this.maxMonsterNum <= 0 && gc.pWorld.monsterArray.length == 0)
            {
               this.curWind = new TransferWind(gc.curLevel,0);
               this.curWind.x = 1880;
               this.curWind.y = 440;
               gc.gameSence.addChild(this.curWind);
               --this.timeCountSecondWind;
            }
         }
         else if(this.timeCountSecondWind < this.TIME_COUNT_SECOND_WIND)
         {
            --this.timeCountSecondWind;
            if(this.timeCountSecondWind == 0)
            {
               if(this.curWind)
               {
                  this.curWind.destroy();
                  this.curWind = null;
               }
               this.curWind = new TransferWind(gc.curLevel,1);
               this.curWind.x = 0;
               this.curWind.y = 440;
               gc.gameSence.addChild(this.curWind);
               this.timeCountSecondWind = Number(this.TIME_COUNT_SECOND_WIND) * 2;
            }
         }
         else
         {
            --this.timeCountSecondWind;
         }
         if(this.curWind)
         {
            this.curWind.step();
         }
         if(this.underSeaDoor)
         {
            this.checkIntoLevel6();
         }
         if(this.underSeaLight)
         {
            this.checkLight();
         }
         if(this.paopaoPerCount > 0)
         {
            --this.paopaoPerCount;
            if(this.paopaoPerCount == 0)
            {
               _loc6_ = gc.gameSence.globalToLocal(new Point(8 * 60,250));
               _loc7_ = uint(4 + Math.random() * 6);
               _loc2_ = 0;
               while(_loc2_ < _loc7_)
               {
                  _loc8_ = (Math.random() - 0.5) * 1000;
                  _loc9_ = (Math.random() - 0.5) * 400;
                  _loc10_ = AUtils.getNewObj("underSeaPaoPao") as MovieClip;
                  _loc10_.x = _loc6_.x + _loc8_;
                  _loc10_.y = _loc6_.y + _loc9_;
                  gc.gameSence.bgContainer.addChild(_loc10_);
                  _loc2_++;
               }
               this.paopaoPerCount = this.PAOPAO_PER_COUNT;
            }
         }
         if(gc.curLevel == 7)
         {
            for each(_loc11_ in gc.getPlayerArray())
            {
               if(_loc11_.x >= 1700 && _loc11_.x <= 30 * 60)
               {
                  if(_loc11_.getPlayer().getSomeOneEquipNumberByName("wplwl") > 0)
                  {
                     _loc11_.getPlayer().removeEquipFormBack("wplwl",2,1);
                     this.gotoLevel(8);
                     break;
                  }
               }
            }
         }
      }
      
      private function checkLight() : void
      {
         var _loc1_:* = null;
         var _loc2_:* = null;
         if(this.lightFatherCount == this.LIGHT_FATHER_COUNT)
         {
            for each(_loc1_ in gc.getPlayerArray())
            {
               for each(_loc2_ in _loc1_.magicBulletArray)
               {
                  if(!_loc2_.isDisabled)
                  {
                     if(HitTest.complexHitTestObject(_loc2_,this.underSeaLight))
                     {
                        if(this.underSeaLight.currentFrame == 1)
                        {
                           this.underSeaLight.gotoAndStop(2);
                           this.underSeaLightArray[gc.curLevel - 1] = 2;
                        }
                        else
                        {
                           this.underSeaLight.gotoAndStop(1);
                           this.underSeaLightArray[gc.curLevel - 1] = 1;
                        }
                        --this.lightFatherCount;
                        break;
                     }
                  }
               }
            }
         }
         else
         {
            --this.lightFatherCount;
            if(this.lightFatherCount == 0)
            {
               this.lightFatherCount = this.LIGHT_FATHER_COUNT;
            }
         }
      }
      
      private function checkIntoLevel6() : void
      {
         var _loc1_:* = null;
         var _loc2_:* = null;
         var _loc3_:* = null;
         if(this.underSeaDoor)
         {
            _loc1_ = this.underSeaDoor.getChildByName("colipse") as MovieClip;
            _loc2_ = this.underSeaDoor.getChildByName("door") as MovieClip;
            if(Boolean(_loc1_) && _loc2_.currentFrame == _loc2_.totalFrames)
            {
               for each(_loc3_ in gc.getPlayerArray())
               {
                  if(HitTest.complexHitTestObject(_loc3_,_loc1_))
                  {
                     this.gotoLevel(7);
                  }
               }
            }
         }
      }
      
      private function addLevel5Door() : void
      {
         this.underSeaDoor = AUtils.getNewObj("underSeaDoor");
         this.underSeaDoor.x = 281;
         this.underSeaDoor.y = 0;
         gc.gameSence.bgContainer.addChild(this.underSeaDoor);
      }
      
      private function addLight() : void
      {
         this.underSeaLight = AUtils.getNewObj("underSeaLight");
         this.underSeaLight.x = 1173;
         this.underSeaLight.y = 356;
         gc.gameSence.bgContainer.addChild(this.underSeaLight);
         var _loc1_:uint = uint(this.underSeaLightArray[gc.curLevel - 1]);
         this.underSeaLight.gotoAndStop(_loc1_);
      }
      
      private function checkLevel5Door() : void
      {
         var _loc1_:* = null;
         if(this.underSeaDoor)
         {
            _loc1_ = this.underSeaDoor.getChildByName("door") as MovieClip;
            if(_loc1_)
            {
               if(this.underSeaLightArray.indexOf(1) == -1)
               {
                  _loc1_.gotoAndPlay(2);
               }
            }
         }
      }
      
      override public function start() : void
      {
         var _loc1_:Boolean = false;
         var _loc2_:* = null;
         super.start();
         _loc1_ = false;
         if(gc.player1)
         {
            _loc2_ = gc.player1.getCurEquipByType("zbfb");
            if(_loc2_)
            {
               if(_loc2_.getFillName() == "gcxdyy")
               {
                  _loc1_ = true;
               }
            }
         }
         if(Boolean(gc.player2) && !_loc1_)
         {
            _loc2_ = gc.player2.getCurEquipByType("zbfb");
            if(_loc2_)
            {
               if(_loc2_.getFillName() == "gcxdyy")
               {
                  _loc1_ = true;
               }
            }
         }
         if(_loc1_)
         {
            this.gotoLevel(7);
         }
         else
         {
            this.gotoLevel(1);
         }
      }
      
      public function gotoLevel(param1:uint) : void
      {
         var level:uint = param1;
         this.recordPlayerState();
         gc.curLevel = level;
         gc.pWorld.mapChange();
         this.restorePlayersState();
         this.maxMonsterNum = this.MAX_MONSTER_NUM;
         this.timeCountSecondWind = this.TIME_COUNT_SECOND_WIND;
         this.monsterAppearCount = this.MONSTER_APPEAR_COUNT;
         this.paopaoPerCount = this.PAOPAO_PER_COUNT;
         if(this.curWind)
         {
            this.curWind.destroy();
            this.curWind = null;
         }
         this.underSeaLight = null;
         this.underSeaDoor = null;
         if(gc.curLevel == 5)
         {
            this.addLevel5Door();
            this.checkLevel5Door();
         }
         else if(gc.curLevel == 7)
         {
            TweenMax.delayedCall(4,function():*
            {
               MainGame.getInstance().createMonster(43,1000,200);
            });
         }
         else if(gc.curLevel == 8)
         {
            MainGame.getInstance().createMonster(47,1000,200);
         }
         else if(gc.curLevel < 5)
         {
            this.addLight();
         }
      }
      
      private function _shopClose(param1:Event) : void
      {
         param1.target.removeEventListener("close",this._shopClose);
         MainGame.getInstance().continueGame();
         gc.keyboardControl.continueAllControl();
      }
      
      private function recordPlayerState() : void
      {
         if(gc.hero1)
         {
            this.player1Hp = gc.hero1.roleProperies.getHHP();
            this.player1Mp = gc.hero1.roleProperies.getMMP();
            if(gc.hero1.curAddEffect)
            {
               this.player1AddEffect = gc.hero1.curAddEffect.getAllBuffArray();
            }
            if(gc.hero1.getPet())
            {
               this.player1PetHp = gc.hero1.getPet().petInfo.getHp();
               this.player1PetMp = gc.hero1.getPet().petInfo.getMp();
               if(gc.hero1.getPet().curAddEffect)
               {
                  this.player1PetAddEffect = gc.hero1.getPet().curAddEffect.getAllBuffArray();
               }
            }
            else
            {
               this.player1PetHp = 0;
               this.player1PetMp = 0;
            }
         }
         if(gc.hero2)
         {
            this.player2Hp = gc.hero2.roleProperies.getHHP();
            this.player2Mp = gc.hero2.roleProperies.getMMP();
            if(gc.hero2.curAddEffect)
            {
               this.player2AddEffect = gc.hero2.curAddEffect.getAllBuffArray();
            }
            if(gc.hero2.getPet())
            {
               this.player2PetHp = gc.hero2.getPet().petInfo.getHp();
               this.player2PetMp = gc.hero2.getPet().petInfo.getMp();
               if(gc.hero2.getPet().curAddEffect)
               {
                  this.player2PetAddEffect = gc.hero2.getPet().curAddEffect.getAllBuffArray();
               }
            }
            else
            {
               this.player2PetHp = 0;
               this.player2PetMp = 0;
            }
         }
      }
      
      private function restorePlayersState() : void
      {
         var _loc1_:* = null;
         if(gc.hero1)
         {
            if(this.player1Hp > 0)
            {
               gc.hero1.roleProperies.setHHP(this.player1Hp);
            }
            else
            {
               gc.hero1.roleProperies.setHHP(1);
            }
            if(this.player1Mp > 0)
            {
               gc.hero1.roleProperies.setMMP(this.player1Mp);
            }
            else
            {
               gc.hero1.roleProperies.setMMP(1);
            }
            try
            {
               for each(_loc1_ in this.player1AddEffect)
               {
                  gc.hero1.curAddEffect.add([_loc1_]);
               }
            }
            catch(e:*)
            {
            }
            if(gc.hero1.getPet())
            {
               try
               {
                  for each(_loc1_ in this.player1PetAddEffect)
                  {
                     gc.hero1.getPet().curAddEffect.add([_loc1_]);
                  }
               }
               catch(e:*)
               {
               }
               if(this.player1PetHp > 0)
               {
                  gc.hero1.getPet().petInfo.setHp(this.player1PetHp);
                  gc.hero1.getPet().petInfo.setMp(this.player1PetMp);
               }
               else
               {
                  gc.hero1.getPet().destroy();
               }
            }
         }
         if(gc.hero2)
         {
            if(this.player2Hp > 0)
            {
               gc.hero2.roleProperies.setHHP(this.player2Hp);
            }
            else
            {
               gc.hero2.roleProperies.setHHP(1);
            }
            if(this.player2Mp > 0)
            {
               gc.hero2.roleProperies.setMMP(this.player2Mp);
            }
            else
            {
               gc.hero2.roleProperies.setMMP(1);
            }
            try
            {
               for each(_loc1_ in this.player2AddEffect)
               {
                  gc.hero2.curAddEffect.add([_loc1_]);
               }
            }
            catch(e:*)
            {
            }
            if(gc.hero2.getPet())
            {
               try
               {
                  for each(_loc1_ in this.player2PetAddEffect)
                  {
                     gc.hero2.getPet().curAddEffect.add([_loc1_]);
                  }
               }
               catch(e:*)
               {
               }
               if(this.player2PetHp > 0)
               {
                  gc.hero2.getPet().petInfo.setHp(this.player2PetHp);
                  gc.hero2.getPet().petInfo.setMp(this.player2PetMp);
               }
               else
               {
                  gc.hero2.getPet().destroy();
               }
            }
         }
      }
      
      override public function destroy() : void
      {
         super.destroy();
         this.underSeaDoor = null;
         this.underSeaLight = null;
      }
   }
}

