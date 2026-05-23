package my
{
   import base.*;
   import com.greensock.*;
   import config.*;
   import event.*;
   import export.*;
   import export.monster.*;
   import flash.display.*;
   import flash.events.*;
   import flash.utils.*;
   import manager.*;
   
   public class MainGame
   {
      
      private static var _this:MainGame;
      
      private var gc:Config;
      
      private var root:Sprite;
      
      private var m1:Monster1;
      
      private var m2:Monster2;
      
      private var m3:Monster3;
      
      private var m4:Monster4;
      
      private var m5:Monster5;
      
      private var m6:Monster6;
      
      private var m7:Monster7;
      
      private var m8:Monster8;
      
      private var m9:Monster9;
      
      private var m10:Monster10;
      
      private var m11:Monster11;
      
      private var m12:Monster12;
      
      private var m13:Monster13;
      
      private var m14:Monster14;
      
      private var m15:Monster15;
      
      private var m16:Monster16;
      
      private var m17:Monster17;
      
      private var m171:Monster171;
      
      private var m172:Monster172;
      
      private var m18:Monster18;
      
      private var m181:Monster181;
      
      private var m186:Monster186;
      
      private var m187:Monster187;
      
      private var m189:Monster189;
      
      private var m19:Monster19;
      
      private var m20:Monster20;
      
      private var m2001:Monster2001;
      
      private var m203:Monster203;
      
      private var m205:Monster205;
      
      private var m206:Monster206;
      
      private var m207:Monster207;
      
      private var m208:Monster208;
      
      private var m209:Monster209;
      
      private var m210:Monster210;
      
      private var m211:Monster211;
      
      private var m212:Monster212;
      
      private var m213:Monster213;
      
      private var m21:Monster21;
      
      private var m22:Monster22;
      
      private var m23:Monster23;
      
      private var m24:Monster24;
      
      private var m25:Monster25;
      
      private var m26:Monster26;
      
      private var m27:Monster27;
      
      private var m28:Monster28;
      
      private var m29:Monster29;
      
      private var m30:Monster30;
      
      private var m31:Monster31;
      
      private var m32:Monster32;
      
      private var m33:Monster33;
      
      private var m34:Monster34;
      
      private var m35:Monster35;
      
      private var m36:Monster36;
      
      private var m37:Monster37;
      
      private var m38:Monster38;
      
      private var m39:Monster39;
      
      private var m40:Monster40;
      
      private var m41:Monster41;
      
      private var m42:Monster42;
      
      private var m43:Monster43;
      
      private var m44:Monster44;
      
      private var m45:Monster45;
      
      private var m46:Monster46;
      
      private var m47:Monster47;
      
      private var m53:Monster53;
      
      private var m54:Monster54;
      
      private var m55:Monster55;
      
      private var m56:Monster56;
      
      private var m57:Monster57;
      
      private var m58:Monster58;
      
      private var m59:Monster59;
      
      private var m60:Monster60;
      
      private var m61:Monster61;
      
      private var m62:Monster62;
      
      private var m63:Monster63;
      
      private var m64:Monster64;
      
      private var m65:Monster65;
      
      private var m70:Monster70;
      
      private var m71:Monster71;
      
      private var m72:Monster72;
      
      private var m73:Monster73;
      
      private var m74:Monster74;
      
      private var m75:Monster75;
      
      private var m76:Monster76;
      
      private var m77:Monster77;
      
      private var m78:Monster78;
      
      private var m115:Monster115;
      
      private var m1000:Monster1000;
      
      private var m1001:Monster1001;
      
      private var m1002:Monster1002;
      
      private var m1003:Monster1003;
      
      private var m1004:Monster1004;
      
      private var m1005:Monster1005;
      
      private var m1006:Monster1006;
      
      private var m1007:Monster1007;
      
      private var m1008:Monster1008;
      
      private var m601:Monster601;
      
      private var m602:Monster602;
      
      private var m603:Monster603;
      
      private var m604:Monster604;
      
      private var m1111:Monster1111;
      
      private var m11111:Monster11111;
      
      private var m999:Monster999;
      
      private var m100:Monster100;
      
      private var m101:Monster101;
      
      private var m102:Monster102;
      
      private var m110:Monster110;
      
      private var m111:Monster111;
      
      private var m112:Monster112;
      
      private var m113:Monster113;
      
      private var m116:Monster116;
      
      private var m117:Monster117;
      
      private var m118:Monster118;
      
      private var m119:Monster119;
      
      private var m120:Monster120;
      
      private var m125:Monster125;
      
      private var m126:Monster126;
      
      private var m127:Monster127;
      
      private var m128:Monster128;
      
      private var m129:Monster129;
      
      private var m130:Monster130;
      
      private var m131:Monster131;
      
      private var m132:Monster132;
      
      private var m133:Monster133;
      
      private var m134:Monster134;
      
      private var m135:Monster135;
      
      private var m136:Monster136;
      
      private var m137:Monster137;
      
      private var m139:Monster139;
      
      private var m261:Monster261;
      
      private var m262:Monster262;
      
      private var m263:Monster263;
      
      private var m264:Monster264;
      
      private var m6001:Monster6001;
      
      private var m6002:Monster6002;
      
      private var m6003:Monster6003;
      
      private var m6004:Monster6004;
      
      private var m6005:Monster6005;
      
      private var m6006:Monster6006;
      
      private var m6007:Monster6007;
      
      private var m6008:Monster6008;
      
      private var m6009:Monster6009;
      
      private var m6010:Monster6010;
      
      private var m6011:Monster6011;
      
      private var m6012:Monster6012;
      
      public function MainGame(param1:Sprite)
      {
         super();
         this.gc = Config.getInstance();
         this.root = param1;
         if(!_this)
         {
            _this = this;
         }
      }
      
      public static function getInstance() : MainGame
      {
         return _this;
      }
      
      public function GameStart() : void
      {
         var stage:* = this.gc.curStage + "";
         var level:* = this.gc.curLevel + "";
         GMain.getInstance().Assetsloader.loadByName(stage,level,this.newGame);
      }
      
      public function fbEnter(param1:uint = 0) : void
      {
         this.destroyGame();
         if(this.gc.curStage == 0 && this.gc.curLevel == 1)
         {
            if(param1 == 0)
            {
               this.gc.curStage = 98;
               this.gc.curLevel = 1;
            }
         }
         if(this.gc.curStage == 2 && this.gc.curLevel == 3)
         {
            if(param1 == 0)
            {
               this.gc.curStage = 6;
               this.gc.curLevel = 1;
            }
         }
         else if(this.gc.curStage == 1 && this.gc.curLevel == 2)
         {
            if(param1 == 0)
            {
               this.gc.curStage = 5;
               this.gc.curLevel = 1;
            }
         }
         else if(this.gc.curStage == 3 && this.gc.curLevel == 1)
         {
            if(param1 == 0)
            {
               this.gc.curStage = 7;
               this.gc.curLevel = 1;
            }
         }
         else if(this.gc.curStage == 9 && this.gc.curLevel == 1)
         {
            if(param1 == 0)
            {
               this.gc.curStage = 10;
               this.gc.curLevel = 1;
            }
            else if(param1 == 1)
            {
               this.gc.curStage = 14;
               this.gc.curLevel = 1;
            }
         }
         else if(this.gc.curStage == 20 && this.gc.curLevel == 1)
         {
            if(param1 == 0)
            {
               this.gc.curStage = 43;
               this.gc.curLevel = 1;
            }
         }
         else if(this.gc.curStage == 21 && this.gc.curLevel == 3)
         {
            if(param1 == 0)
            {
               this.gc.curStage = 45;
               this.gc.curLevel = 1;
            }
         }
         else if(this.gc.curStage == 23 && this.gc.curLevel == 1)
         {
            if(param1 == 0)
            {
               this.gc.curStage = 23;
               this.gc.curLevel = 3;
            }
         }
         else if(this.gc.curStageAndCurLevel.curStage == 25 && this.gc.curStageAndCurLevel.curLevel == 3)
         {
            if(params == 0)
            {
               this.gc.curStageAndCurLevel.curStage = 25;
               this.gc.curStageAndCurLevel.curLevel = 3;
            }
         }
         this.gc.eventManger.dispatchEvent(new Event("ReStart"));
      }
      
      public function levelClear() : void
      {
         SoundManager.play("begin");
         if(this.gc.isInHost())
         {
            this.gc.closeScoket();
            GMain.getInstance().switchSence("showStageMap");
         }
         else
         {
            if(this.gc.curStage == this.gc.curBigStage)
            {
               if(this.gc.curBigStage <= 3)
               {
                  if(this.gc.curLevel == this.gc.curBigLevel)
                  {
                     if(this.gc.curLevel == 3)
                     {
                        ++this.gc.curBigStage;
                        this.gc.curBigLevel = 1;
                     }
                     else if(this.gc.curLevel < 3)
                     {
                        ++this.gc.curBigLevel;
                     }
                  }
               }
               else if(this.gc.curBigStage == 4)
               {
                  this.gc.curBigLevel = 1;
               }
               else if(this.gc.curBigStage >= 20 || this.gc.curBigStage < 30)
               {
                  if(this.gc.curBigStage == 20)
                  {
                     if(this.gc.curLevel == this.gc.curBigLevel)
                     {
                        ++this.gc.curBigStage;
                        this.gc.curBigLevel = 1;
                     }
                  }
                  else if(this.gc.curBigStage == 21)
                  {
                     if(this.gc.curLevel == this.gc.curBigLevel)
                     {
                        if(this.gc.curBigLevel < 3)
                        {
                           ++this.gc.curBigLevel;
                        }
                        else
                        {
                           this.gc.curBigStage = 22;
                           this.gc.curBigLevel = 1;
                        }
                     }
                  }
                  else if(this.gc.curBigStage == 22)
                  {
                     if(this.gc.curLevel == this.gc.curBigLevel)
                     {
                        if(this.gc.curBigLevel < 3)
                        {
                           ++this.gc.curBigLevel;
                        }
                        else
                        {
                           this.gc.curBigStage = 23;
                           this.gc.curBigLevel = 1;
                        }
                     }
                  }
                  else if(this.gc.curBigStage == 23)
                  {
                     if(this.gc.curLevel == this.gc.curBigLevel)
                     {
                        if(this.gc.curBigLevel < 3)
                        {
                           ++this.gc.curBigLevel;
                        }
                        else
                        {
                           this.gc.curBigStage = 24;
                           this.gc.curBigLevel = 1;
                        }
                     }
                  }
                  else if(this.gc.curBigStage == 24)
                  {
                     if(this.gc.curLevel == this.gc.curBigLevel)
                     {
                        if(this.gc.curBigLevel < 3)
                        {
                           ++this.gc.curBigLevel;
                        }
                        else
                        {
                           this.gc.curBigStage = 25;
                           this.gc.curBigLevel = 1;
                        }
                     }
                  }
                  else if(this.gc.curBigStage == 25)
                  {
                     if(this.gc.curLevel == this.gc.curBigLevel)
                     {
                        if(this.gc.curBigLevel < 3)
                        {
                           ++this.gc.curBigLevel;
                        }
                        else
                        {
                           this.gc.curBigStage = 26;
                           this.gc.curBigLevel = 1;
                        }
                     }
                  }
                  else if(this.gc.curBigStage == 26)
                  {
                     if(this.gc.curLevel == this.gc.curBigLevel)
                     {
                        if(this.gc.curBigLevel < 1)
                        {
                           ++this.gc.curBigLevel;
                        }
                     }
                  }
               }
            }
            SoundManager.play("Game_Victory");
         }
         this.destroyGame();
         if(this.gc.saveId >= 0)
         {
            this.gc.memory.saveGame(this.gc.saveId,true);
         }
      }
      
      public function createMonster(param1:int, param2:Number, param3:Number, param4:int = -1) : BaseMonster
      {
         var tracename:String = null;
         var mon1:BaseMonster = null;
         var minIdx:int = 0;
         var kind:int = param1;
         var xx:Number = param2;
         var yy:Number = param3;
         var currentCount:int = param4;
         try
         {
            mon1 = AUtils.getNewObj("export.monster.Monster" + kind);
            mon1.x = xx;
            mon1.y = yy;
            mon1.sid = getTimer();
            this.gc.pWorld.monsterArray.push(mon1);
            minIdx = int(this.gc.getMinIdxInHeroAndPet());
            this.gc.gameSence.addChildAt(mon1,minIdx);
            return mon1;
         }
         catch(e:Error)
         {
            throw e;
         }
      }
      
      public function createLikeMonster(param1:int, param2:Number, param3:Number, param4:int = -1) : BaseMonster
      {
         var _loc5_:BaseMonster = null;
         var _loc6_:int = 0;
         var _loc7_:int = 0;
         var _loc8_:int = 0;
         _loc5_ = AUtils.getNewObj("export.monster.Monster" + param1);
         _loc5_.x = param2;
         _loc5_.y = param3;
         _loc5_.sid = getTimer();
         this.gc.pWorld.likeMonsterArray.push(_loc5_);
         if(Boolean(this.gc.hero1) && Boolean(this.gc.gameSence.contains(this.gc.hero1)))
         {
            _loc7_ = int(this.gc.gameSence.getChildIndex(this.gc.hero1));
         }
         else
         {
            _loc7_ = 99999;
         }
         if(Boolean(this.gc.hero2) && Boolean(this.gc.gameSence.contains(this.gc.hero2)))
         {
            _loc8_ = int(this.gc.gameSence.getChildIndex(this.gc.hero2));
         }
         else
         {
            _loc8_ = 99999;
         }
         _loc6_ = Math.min(_loc7_,_loc8_);
         if(_loc6_ != 99999)
         {
            this.gc.gameSence.addChildAt(_loc5_,_loc6_);
         }
         else
         {
            this.gc.gameSence.addChild(_loc5_);
         }
         return _loc5_;
      }
      
      public function stopGame(param1:int = 0) : void
      {
         var i:int = 0;
         var j:int = 0;
         var b:BaseHero = null;
         var m:int = 0;
         var mba1:BaseBullet = null;
         var bm:BaseMonster = null;
         var n:int = 0;
         var mba2:BaseBullet = null;
         var time:int = param1;
         this.root.removeEventListener(Event.ENTER_FRAME,this.__enterFrame);
         i = 0;
         while(i < this.gc.getPlayerArray().length)
         {
            b = this.gc.getPlayerArray()[i] as BaseHero;
            m = 0;
            while(m < b.magicBulletArray.length)
            {
               mba1 = b.magicBulletArray[m] as BaseBullet;
               AUtils.stopAllChildren(mba1);
               m++;
            }
            if(b.getCurMagicWeapon())
            {
            }
            i++;
         }
         j = 0;
         while(j < this.gc.pWorld.monsterArray.length)
         {
            bm = this.gc.pWorld.monsterArray[j] as BaseMonster;
            n = 0;
            while(n < bm.magicBulletArray.length)
            {
               mba2 = bm.magicBulletArray[n] as BaseBullet;
               AUtils.stopAllChildren(mba2);
               n++;
            }
            j++;
         }
         this.gc.keyboardControl.stopKeyboardControl();
         if(time != 0)
         {
            setTimeout(function():*
            {
               this.continueGame();
            },time);
         }
         TweenMax.pauseAll(true,true);
         this.gc.isStopGame = true;
      }
      
      public function continueGame() : void
      {
         var _loc1_:* = null;
         var _loc2_:int = 0;
         var _loc3_:* = null;
         var _loc4_:* = null;
         var _loc5_:int = 0;
         var _loc6_:* = null;
         if(!this.root.hasEventListener(Event.ENTER_FRAME))
         {
            this.root.addEventListener(Event.ENTER_FRAME,this.__enterFrame);
         }
         var _loc7_:int = 0;
         while(_loc7_ < this.gc.getPlayerArray().length)
         {
            _loc1_ = this.gc.getPlayerArray()[_loc7_] as BaseHero;
            _loc2_ = 0;
            while(_loc2_ < _loc1_.magicBulletArray.length)
            {
               _loc3_ = _loc1_.magicBulletArray[_loc2_] as BaseBullet;
               AUtils.startAllChildren(_loc3_);
               _loc2_++;
            }
            if(_loc1_.getCurMagicWeapon())
            {
            }
            _loc7_++;
         }
         var _loc8_:int = 0;
         while(_loc8_ < this.gc.pWorld.monsterArray.length)
         {
            _loc4_ = this.gc.pWorld.monsterArray[_loc8_] as BaseMonster;
            AUtils.startAllChildren(_loc4_);
            _loc5_ = 0;
            while(_loc5_ < _loc4_.magicBulletArray.length)
            {
               _loc6_ = _loc4_.magicBulletArray[_loc5_] as BaseBullet;
               AUtils.startAllChildren(_loc6_);
               _loc5_++;
            }
            _loc8_++;
         }
         this.gc.keyboardControl.continueKeyboardControl();
         TweenMax.resumeAll();
         this.gc.isStopGame = false;
      }
      
      public function destroyGame() : void
      {
         if(this.root.hasEventListener("enterFrame"))
         {
            this.root.removeEventListener("enterFrame",this.__enterFrame);
         }
         this.gc.destroyGame();
         this.gc.gameSence.destroy();
         this.gc.gameInfo.destroy();
         this.gc.pWorld.destroy();
         this.gc.bg1.destroy();
         this.gc.keyboardControl.destroy();
         this.gc.vControllor.destroy();
         var _loc7_:int = 0;
         if(this.gc.hero1)
         {
            if(this.gc.hero1.getPlayer())
            {
               this.gc.hero1.getPlayer().reSetAllPetState();
            }
            this.gc.hero1.destroy();
            this.gc.hero1 = null;
         }
         if(this.gc.hero2)
         {
            if(this.gc.hero2.getPlayer())
            {
               this.gc.hero2.getPlayer().reSetAllPetState();
            }
            this.gc.hero2.destroy();
            this.gc.hero2 = null;
         }
         this.gc.hero1 = null;
         this.gc.hero2 = null;
         this.gc.pWorld.heroArray = [];
         _this = null;
         this.root = null;
         TweenMax.killAll(false);
      }
      
      public function destroyMode() : void
      {
         this.destroyGame();
         this.gc.initData();
      }
      
      public function newGame() : void
      {
         this.gc.pauseTime = 0;
         this.gc.startTime = int(getTimer());
         this.createFloorBg();
         this.gc.gameSence = AUtils.getNewObj("export.gameSence.sl" + this.gc.curStage + this.gc.curLevel) as BaseGameSence;
         AUtils.checkLoadOK(this.gc.gameSence,this.nextDoAfterLoad);
      }
      
      private function createFloorBg() : void
      {
         this.gc.bg1 = new FloorBg();
         var _loc1_:BitmapData = AUtils.getNewObj("floorBg" + this.gc.curStage);
         var _loc2_:Bitmap = new Bitmap(_loc1_);
         _loc2_.name = "floorBitmap";
         this.gc.bg1.addChild(_loc2_);
         this.root.addChild(this.gc.bg1);
      }
      
      private function nextDoAfterLoad() : void
      {
         this.root.addChild(this.gc.gameSence);
         if(this.gc.curStage == 8)
         {
            SoundManager.play("stage4");
         }
         else if(this.gc.curStage == 99)
         {
            SoundManager.play("stage12");
         }
         else if(this.gc.curStage == 15 || this.gc.curStage == 16 || this.gc.curStage == 30)
         {
            SoundManager.play("stage13");
         }
         else if(this.gc.curStage == 21)
         {
            SoundManager.play("stage21");
         }
         else if(this.gc.curStage == 22)
         {
            SoundManager.play("stage22");
         }
         else if(this.gc.curStage > 16 || this.gc.curStage == 9 || this.gc.curStage == 10 || this.gc.curStage == 14)
         {
            SoundManager.play("stage5");
         }
         else
         {
            SoundManager.play("stage" + this.gc.curStage);
         }
         this.gc.pWorld.pWorldInit();
         if(!this.root.hasEventListener(Event.ENTER_FRAME))
         {
            this.root.addEventListener(Event.ENTER_FRAME,this.__enterFrame);
         }
      }
      
      private function __enterFrame(param1:Event) : void
      {
         this.gc.pWorld.step();
         this.updateOther();
         this.setFource();
      }
      
      public function updateOther() : void
      {
         var _loc1_:uint = uint(this.gc.otherList.length);
         while(_loc1_-- > 0)
         {
            this.gc.otherList[_loc1_].step();
         }
      }
      
      private function setFource() : void
      {
         if(this.root)
         {
            if(!this.gc.isSingleGame())
            {
               if(this.root.stage.focus == null)
               {
                  this.root.stage.focus = this.root.stage;
               }
            }
            else if(!this.root.stage.focus)
            {
               this.root.stage.focus = this.root.stage;
            }
         }
      }
      
      public function checkGameOver() : void
      {
         var _loc1_:uint = uint(this.gc.getPlayerArray().length);
         if(_loc1_ == 0)
         {
            this.destroyGame();
            this.gc.eventManger.dispatchEvent(new CommonEvent("GameOver"));
         }
      }
   }
}

