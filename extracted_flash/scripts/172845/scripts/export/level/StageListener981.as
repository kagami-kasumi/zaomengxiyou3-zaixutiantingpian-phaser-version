package export.level
{
   import base.BaseLevelListenering;
   import base.BaseMonster;
   import com.edgarcai.encrypt.*;
   import com.edgarcai.gamelogic.*;
   import com.greensock.*;
   import export.*;
   import flash.display.*;
   import flash.events.MouseEvent;
   import flash.geom.*;
   import flash.utils.*;
   import my.*;
   
   public class StageListener981 extends BaseLevelListenering
   {
      
      private var monsterArray:Array;
      
      private var monsterCurrentWave:Array;
      
      private var stageWaveShow:MovieClip;
      
      private var showQuit:SimpleButton;
      
      public var dataObj:Antiwear;
      
      public function StageListener981()
      {
         this.monsterArray = [30,8,7,3,9,10,19,18,17,1,11,12,13,14];
         this.monsterCurrentWave = [];
         super();
         this.dataObj = new Antiwear(new binaryEncrypt());
         waitForRegisterDataArray = ["Monster30","Monster8","Monster7","Monster3","Monster9","Monster10","Monster19","Monster18","Monster17","Monster1","Monster11","Monster12","Monster13","Monster14"];
         this.dataObj.curWave = 0;
         this.dataObj.baseHp = 1000;
         this.dataObj.hpAdd = 300;
         this.dataObj.baseDef = 15;
         this.dataObj.defAdd = 2;
         this.dataObj.baseMDef = 0.25;
         this.dataObj.baseAtk = 50;
         this.dataObj.atkAndExpAdd = 15;
         this.dataObj.baseExp = 50;
         this.dataObj.score = 0;
         this.dataObj.isteller = false;
         this.dataObj.curScore = 0;
      }
      
      override public function step() : void
      {
         super.step();
         if(this.dataObj.curWave > 0)
         {
            this.checkMonsterAppear();
         }
         if(gc.getPlayerArray().length == 0 && !this.dataObj.isteller)
         {
            this.showResult();
            return;
         }
      }
      
      private function showResult() : void
      {
         this.gc.alert("本次共获得: " + this.dataObj.score + " 点积分！");
         this.dataObj.isteller = true;
         this.dataObj.score = 0;
      }
      
      override public function start() : void
      {
         super.start();
         this.stageWaveShow = AUtils.getNewObj("StageWaveShow") as MovieClip;
         this.stageWaveShow.x = 460;
         this.stageWaveShow.y = 45;
         gc.gameInfo.addChild(this.stageWaveShow);
         this.showQuit = AUtils.getNewObj("showQuit") as SimpleButton;
         this.showQuit.x = 380;
         this.showQuit.y = 80;
         gc.gameInfo.addChild(this.showQuit);
         this.showQuit.addEventListener("click",this.quit);
         TweenMax.delayedCall(0.1,function(param1:StageListener981):*
         {
            param1.showUI();
         },[this]);
      }
      
      private function showUI() : void
      {
         MainGame.getInstance().stopGame();
         var _loc1_:EndlessMode = new EndlessMode();
         this.gc.stage.addChild(_loc1_);
      }
      
      private function quit(param1:MouseEvent) : void
      {
         if(!this.dataObj.isteller)
         {
            this.showQuit.removeEventListener("click",this.quit);
            this.showResult();
            MainGame.getInstance().destroyGame();
            GMain.getInstance().switchSence("showStageMap");
         }
      }
      
      public function nextWave() : void
      {
         var _loc1_:uint = 0;
         var _loc2_:uint = 0;
         var _loc3_:MovieClip = null;
         var _loc4_:MovieClip = null;
         var _loc5_:MovieClip = null;
         var _loc6_:MovieClip = null;
         var _loc7_:MovieClip = null;
         var _loc8_:uint = 0;
         var _loc9_:uint = 0;
         var _loc10_:uint = 0;
         ++this.dataObj.curWave;
         this.dataObj.maxMonsterNums = this.dataObj.curWave + 5;
         this.dataObj.round = Math.ceil(Number(this.dataObj.curWave) / 10);
         this.dataObj.maxMonstersPerScreen = 5 + (this.dataObj.round - 1) * 1;
         _loc1_ = Number(this.dataObj.curWave) % 10;
         if(_loc1_ == 0)
         {
            _loc1_ = 10;
         }
         this.monsterCurrentWave.length = 0;
         if(_loc1_ < 9)
         {
            _loc2_ = 0;
            while(_loc2_ < 3)
            {
               this.monsterCurrentWave.push(this.monsterArray[_loc1_ - 1 + _loc2_]);
               _loc2_++;
            }
         }
         else if(_loc1_ == 9)
         {
            this.monsterCurrentWave = this.monsterArray.concat();
         }
         else if(_loc1_ == 10)
         {
            this.monsterCurrentWave = [1,11,12,13,14];
         }
         if(this.stageWaveShow)
         {
            _loc3_ = this.stageWaveShow.getChildByName("WaveNum1") as MovieClip;
            if(_loc3_)
            {
               this.stageWaveShow.removeChild(_loc3_);
            }
            _loc3_ = this.stageWaveShow.getChildByName("WaveNum2") as MovieClip;
            if(_loc3_)
            {
               this.stageWaveShow.removeChild(_loc3_);
            }
            _loc3_ = this.stageWaveShow.getChildByName("WaveNum3") as MovieClip;
            if(_loc3_)
            {
               this.stageWaveShow.removeChild(_loc3_);
            }
            if(this.dataObj.curWave >= 100)
            {
               _loc4_ = AUtils.getNewObj("WaveNum3") as MovieClip;
               _loc4_.name = "WaveNum3";
               _loc5_ = _loc4_.getChildByName("num1") as MovieClip;
               _loc6_ = _loc4_.getChildByName("num2") as MovieClip;
               _loc7_ = _loc4_.getChildByName("num3") as MovieClip;
               if(Boolean(_loc5_) && Boolean(_loc6_) && Boolean(_loc7_))
               {
                  _loc8_ = Number(this.dataObj.curWave) / 100;
                  _loc9_ = Number(this.dataObj.curWave) % 100 / 10;
                  _loc10_ = Number(this.dataObj.curWave) % 10;
                  if(_loc9_ == 0)
                  {
                     _loc9_ = 10;
                  }
                  if(_loc10_ == 0)
                  {
                     _loc10_ = 10;
                  }
                  _loc5_.gotoAndStop(_loc8_);
                  _loc6_.gotoAndStop(_loc9_);
                  _loc7_.gotoAndStop(_loc10_);
               }
            }
            else if(this.dataObj.curWave >= 10)
            {
               _loc4_ = AUtils.getNewObj("WaveNum2") as MovieClip;
               _loc4_.name = "WaveNum2";
               _loc5_ = _loc4_.getChildByName("num1") as MovieClip;
               _loc6_ = _loc4_.getChildByName("num2") as MovieClip;
               if(Boolean(_loc5_) && Boolean(_loc6_))
               {
                  _loc8_ = Number(this.dataObj.curWave) / 10;
                  _loc9_ = Number(this.dataObj.curWave) % 10;
                  if(_loc9_ == 0)
                  {
                     _loc9_ = 10;
                  }
                  _loc5_.gotoAndStop(_loc8_);
                  _loc6_.gotoAndStop(_loc9_);
               }
            }
            else
            {
               _loc4_ = AUtils.getNewObj("WaveNum1") as MovieClip;
               _loc4_.name = "WaveNum1";
               _loc4_.gotoAndStop(this.dataObj.curWave);
            }
            this.stageWaveShow.addChild(_loc4_);
         }
      }
      
      private function checkMonsterAppear() : void
      {
         var _loc1_:Number = Number(NaN);
         var _loc2_:uint = 0;
         var _loc3_:uint = 0;
         if(this.dataObj.maxMonsterNums > 0)
         {
            if(gc.pWorld.monsterArray.length < this.dataObj.maxMonstersPerScreen)
            {
               _loc1_ = Math.random();
               _loc2_ = Number(this.monsterCurrentWave.length) * _loc1_;
               _loc3_ = uint(this.monsterCurrentWave[_loc2_]);
               this.createMonsterByTypeInThisStage(_loc3_);
               --this.dataObj.maxMonsterNums;
            }
         }
         else if(gc.pWorld.monsterArray.length == 0)
         {
            if(Number(this.dataObj.curWave) % 10 == 0)
            {
               if(this.gc.difficulity == 1)
               {
                  this.dataObj.curScore = int(this.dataObj.curWave) * 3;
                  this.gc.alert("获得: " + this.dataObj.curScore + " 点积分!");
               }
               else if(this.gc.difficulity == 2)
               {
                  this.dataObj.curScore = int(this.dataObj.curWave) * 0;
                  this.gc.alert("获得: " + this.dataObj.curScore + " 点积分!");
               }
               else
               {
                  this.dataObj.curScore = int(this.dataObj.curWave) * 2;
                  this.gc.alert("获得: " + this.dataObj.curScore + " 点积分!");
               }
               this.dataObj.score += this.dataObj.curScore;
               this.gc.Objectdata.turntableScore += this.dataObj.curScore;
               this.dataObj.curScore = 0;
               setTimeout(this.doSaveGame,2000);
            }
            this.nextWave();
         }
      }
      
      private function createMonsterByTypeInThisStage(param1:uint) : void
      {
         var _loc2_:uint = param1;
         var _loc3_:Point = new Point(780 + (Math.random() - 0.5) * 900,200);
         var _loc4_:uint = uint(this.monsterArray.indexOf(_loc2_));
         var _loc5_:BaseMonster = MainGame.getInstance().createMonster(_loc2_,_loc3_.x,_loc3_.y);
         var _loc6_:uint = this.dataObj.baseHp + Number(this.dataObj.hpAdd) * _loc4_;
         var _loc7_:uint = this.dataObj.baseDef + Number(this.dataObj.defAdd) * _loc4_;
         var _loc8_:Number = Number(this.dataObj.baseMDef);
         var _loc9_:uint = this.dataObj.baseAtk + Number(this.dataObj.atkAndExpAdd) * _loc4_;
         var _loc10_:uint = this.dataObj.baseExp + Number(this.dataObj.atkAndExpAdd) * _loc4_;
         _loc5_.EndlessModeCreate(_loc6_,_loc7_,_loc8_,_loc9_,_loc10_,this.dataObj.round);
      }
      
      public function doSaveGame() : void
      {
         if(gc.saveId >= 0)
         {
            gc.memory.saveGame(gc.saveId,true);
         }
      }
      
      override public function destroy() : void
      {
         super.destroy();
         this.gc.Objectdata.endlesslevel = 0;
         this.monsterCurrentWave.length = 0;
         this.monsterArray.length = 0;
         if(this.stageWaveShow)
         {
            if(this.stageWaveShow.parent)
            {
               this.stageWaveShow.parent.removeChild(this.stageWaveShow);
            }
            this.stageWaveShow = null;
         }
         if(this.showQuit)
         {
            if(this.showQuit.parent)
            {
               this.showQuit.parent.removeChild(this.showQuit);
            }
            this.showQuit = null;
         }
      }
   }
}

