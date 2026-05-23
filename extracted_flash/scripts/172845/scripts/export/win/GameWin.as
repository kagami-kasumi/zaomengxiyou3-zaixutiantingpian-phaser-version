package export.win
{
   import config.*;
   import event.*;
   import flash.display.SimpleButton;
   import flash.display.Sprite;
   import flash.events.*;
   import flash.text.TextField;
   import flash.utils.*;
   import user.*;
   
   public class GameWin extends Sprite
   {
      
      private var gc:Config;
      
      public var txt_allscore:TextField;
      
      public var txt_hight:TextField;
      
      public var txt_state:TextField;
      
      public var txt_usertime:TextField;
      
      public var nextStageButton:SimpleButton;
      
      public var backTochooseButton:SimpleButton;
      
      private var goTimer:int;
      
      private var ahp:Number;
      
      private var amp:Number;
      
      public function GameWin()
      {
         super();
         this.gc = Config.getInstance();
         this.addEventListener(Event.ADDED_TO_STAGE,this.added,false,0,true);
         this.addEventListener(Event.REMOVED_FROM_STAGE,this.removed,false,0,true);
      }
      
      private function added(param1:Event) : void
      {
         this.nextStageButton.visible = true;
         this.nextStageButton.addEventListener(MouseEvent.CLICK,this.nextClick);
         this.backTochooseButton.addEventListener(MouseEvent.CLICK,this.backClick);
         if(Math.random() <= 0.5 && this.gc.getAverageLevel() >= 60 && this.gc.curStage == 53)
         {
            this.gc.putQhsInBackPack(this.gc.player1,"xhb",20);
            this.gc.alert("获得仙魂币x20");
         }
         if(this.gc.curStage == 12)
         {
            if(this.gc.curLevel < 5)
            {
               this.nextStageButton.visible = true;
               this.backTochooseButton.visible = false;
            }
            else
            {
               this.nextStageButton.visible = false;
               this.backTochooseButton.visible = true;
            }
         }
         else if(this.gc.curStage == 3)
         {
            if(this.gc.curLevel == 3)
            {
               this.nextStageButton.visible = false;
            }
         }
         else if(this.gc.curStage >= 4)
         {
            if(this.gc.curStage < 30)
            {
               if(this.gc.curStage >= 20)
               {
                  if(this.gc.curStage == 20)
                  {
                     this.nextStageButton.visible = true;
                     this.backTochooseButton.visible = true;
                  }
                  else if(this.gc.curStage == 21)
                  {
                     if(this.gc.curLevel <= 3)
                     {
                        this.nextStageButton.visible = true;
                        this.backTochooseButton.visible = true;
                     }
                     else
                     {
                        this.nextStageButton.visible = false;
                        this.backTochooseButton.visible = true;
                     }
                  }
                  else if(this.gc.curStage == 22)
                  {
                     if(this.gc.curLevel < 3)
                     {
                        this.nextStageButton.visible = true;
                        this.backTochooseButton.visible = true;
                     }
                     else
                     {
                        this.nextStageButton.visible = false;
                        this.backTochooseButton.visible = true;
                     }
                  }
                  else if(this.gc.curStage == 23)
                  {
                     if(this.gc.curLevel < 2)
                     {
                        this.nextStageButton.visible = true;
                        this.backTochooseButton.visible = true;
                     }
                     else
                     {
                        this.nextStageButton.visible = false;
                        this.backTochooseButton.visible = true;
                     }
                  }
                  else if(this.gc.curStage == 24)
                  {
                     if(this.gc.curLevel < 4)
                     {
                        this.nextStageButton.visible = true;
                        this.backTochooseButton.visible = true;
                     }
                     else
                     {
                        this.nextStageButton.visible = false;
                        this.backTochooseButton.visible = true;
                     }
                  }
                  else if(this.gc.curStage == 25)
                  {
                     if(this.gc.curLevel < 4)
                     {
                        this.nextStageButton.visible = true;
                        this.backTochooseButton.visible = true;
                     }
                     else
                     {
                        this.nextStageButton.visible = false;
                        this.backTochooseButton.visible = true;
                     }
                  }
                  else if(this.gc.curStage == 26)
                  {
                     this.nextStageButton.visible = false;
                     this.backTochooseButton.visible = true;
                  }
               }
               else
               {
                  this.nextStageButton.visible = false;
                  if(this.gc.curStage == 14)
                  {
                     if(this.gc.curLevel < 2)
                     {
                        this.nextStageButton.visible = true;
                     }
                  }
               }
            }
            else
            {
               this.nextStageButton.visible = false;
            }
         }
         else if(this.gc.curStage == 0)
         {
            this.nextStageButton.visible = false;
         }
         this.setUserTime();
         this.setHigh();
         this.setState();
         this.setAllScore();
      }
      
      private function setUserTime() : void
      {
         var _loc1_:int = 0;
         var _loc2_:int = 0;
         var _loc3_:int = 0;
         this.gc.pauseTime += int(this.gc.pauseaft - this.gc.pausepre);
         this.goTimer = Number(getTimer()) - this.gc.startTime;
         if(this.goTimer <= 0)
         {
            this.txt_usertime.text = "99999";
         }
         else
         {
            _loc1_ = Math.floor(this.goTimer / 3600 / 1000);
            _loc2_ = Math.floor((this.goTimer / 3600 / 1000 - _loc1_) * 60);
            _loc3_ = Math.floor(((this.goTimer / 3600 / 1000 - _loc1_) * 60 - _loc2_) * 60);
            this.txt_usertime.text = _loc1_ + ":" + _loc2_ + ":" + _loc3_;
         }
      }
      
      private function setAllScore() : void
      {
         var _loc1_:int = (5 * 60 + this.goTimer / 1000) / (this.goTimer / 1000 * 50);
         if(_loc1_ > 800)
         {
            _loc1_ = 800;
         }
         var _loc2_:int = 300 * (this.amp + this.ahp);
         if(_loc2_ > 5 * 60)
         {
            _loc2_ = 5 * 60;
         }
         var _loc3_:* = User.biggestbatterNum;
         if(_loc3_ > 800)
         {
            _loc3_ = 800;
         }
         var _loc4_:Number = _loc1_ + _loc2_ + _loc3_ + Math.random();
         this.txt_allscore.text = int(_loc4_) + "";
         this.gc.gameScore["sl" + this.gc.curStage + "_" + this.gc.curLevel] = this.gc.gameScore["sl" + this.gc.curStage + "_" + this.gc.curLevel] < int(_loc4_) ? int(_loc4_) : this.gc.gameScore["sl" + this.gc.curStage + "_" + this.gc.curLevel] + Math.random() / 10000;
      }
      
      private function setState() : void
      {
         this.amp = 0;
         this.ahp = 0;
         if(this.gc.hero1)
         {
            this.amp = this.gc.hero1.roleProperies.getMMP() / this.gc.hero1.roleProperies.getSMMP() / 2;
            this.ahp = this.gc.hero1.roleProperies.getHHP() / this.gc.hero1.roleProperies.getSHHP() / 2;
         }
         if(this.gc.hero2)
         {
            this.amp += this.gc.hero1.roleProperies.getMMP() / this.gc.hero1.roleProperies.getSMMP() / 2;
            this.ahp += this.gc.hero1.roleProperies.getHHP() / this.gc.hero1.roleProperies.getSHHP() / 2;
         }
         this.txt_state.text = int((this.amp + this.ahp) * 100) + "%";
         if(int((this.amp + this.ahp) * 100) > 100)
         {
            this.txt_state.text = "100%";
         }
      }
      
      private function setHigh() : void
      {
         this.txt_hight.text = User.biggestbatterNum + "";
      }
      
      private function removed(param1:Event) : void
      {
         this.nextStageButton.removeEventListener(MouseEvent.CLICK,this.nextClick);
         this.backTochooseButton.removeEventListener(MouseEvent.CLICK,this.backClick);
      }
      
      private function nextClick(param1:MouseEvent) : void
      {
         if(this.gc.curStage <= 3)
         {
            if(this.gc.curLevel == 3)
            {
               ++this.gc.curStage;
               this.gc.curLevel = 1;
            }
            else
            {
               ++this.gc.curLevel;
            }
         }
         else if(this.gc.curStage == 4)
         {
            this.gc.curLevel = 1;
         }
         else if(this.gc.curStage == 12)
         {
            if(this.gc.curLevel < 5)
            {
               ++this.gc.curLevel;
            }
         }
         else if(this.gc.curStage == 14)
         {
            if(this.gc.curLevel < 2)
            {
               ++this.gc.curLevel;
            }
         }
         else if(this.gc.curStage == 20)
         {
            ++this.gc.curStage;
         }
         else if(this.gc.curStage == 21)
         {
            if(this.gc.curLevel < 3)
            {
               ++this.gc.curLevel;
            }
            else
            {
               ++this.gc.curStage;
               this.gc.curLevel = 1;
            }
         }
         else if(this.gc.curStage == 22)
         {
            if(this.gc.curLevel < 3)
            {
               ++this.gc.curLevel;
            }
            else
            {
               ++this.gc.curStage;
               this.gc.curLevel = 1;
            }
         }
         else if(this.gc.curStage == 23)
         {
            if(this.gc.curLevel < 2)
            {
               ++this.gc.curLevel;
            }
            else
            {
               ++this.gc.curStage;
               this.gc.curLevel = 1;
            }
         }
         else if(this.gc.curStage == 24)
         {
            if(this.gc.curLevel < 3)
            {
               ++this.gc.curLevel;
            }
            else
            {
               ++this.gc.curStage;
               this.gc.curLevel = 1;
            }
         }
         else if(this.gc.curStage == 25)
         {
            if(this.gc.curLevel < 3)
            {
               ++this.gc.curLevel;
            }
            else
            {
               ++this.gc.curStage;
               this.gc.curLevel = 1;
            }
         }
         this.gc.eventManger.dispatchEvent(new CommonEvent("selectStageOver"));
         User.biggestbatterNum = 0;
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
      }
      
      private function backClick(param1:MouseEvent) : void
      {
         if(this.gc.Objectdata.whichlastworld == 1)
         {
            GMain.getInstance().switchSence("showNewStageMap");
         }
         else if(this.gc.Objectdata.whichlastworld == 2)
         {
            GMain.getInstance().switchSence("showThirdStageMap");
         }
         else
         {
            GMain.getInstance().switchSence("showStageMap");
         }
         User.biggestbatterNum = 0;
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
      }
   }
}

