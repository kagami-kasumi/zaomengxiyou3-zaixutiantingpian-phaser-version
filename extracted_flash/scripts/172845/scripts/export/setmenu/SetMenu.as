package export.setmenu
{
   import config.*;
   import event.*;
   import flash.display.*;
   import flash.events.*;
   import flash.utils.*;
   import manager.*;
   import my.*;
   
   public class SetMenu extends Sprite
   {
      
      public var btn_continue:SimpleButton;
      
      public var btn_back_selectmap:SimpleButton;
      
      public var btn_back_menu:SimpleButton;
      
      public var btn_help:SimpleButton;
      
      public var btn_x:SimpleButton;
      
      public var btn_sound_open:SimpleButton;
      
      public var btn_sound_close:SimpleButton;
      
      public var btn_huazhi:SimpleButton;
      
      public var huazhi:MovieClip;
      
      private var gc:Config;
      
      private var asprite:Sprite;
      
      public function SetMenu()
      {
         super();
         this.gc = Config.getInstance();
         this.addEventListener(Event.ADDED_TO_STAGE,this.added,false,0,true);
         this.addEventListener(Event.REMOVED_FROM_STAGE,this.removed,false,0,true);
      }
      
      private function added(param1:*) : void
      {
         this.btn_continue.addEventListener(MouseEvent.CLICK,this.continueClick);
         this.btn_back_selectmap.addEventListener(MouseEvent.CLICK,this.backmapClick);
         this.btn_back_menu.addEventListener(MouseEvent.CLICK,this.backmenuClick);
         this.btn_help.addEventListener(MouseEvent.CLICK,this.helpClick);
         this.btn_x.addEventListener(MouseEvent.CLICK,this.continueClick);
         this.btn_sound_open.addEventListener(MouseEvent.CLICK,this.openSound);
         this.btn_sound_close.addEventListener(MouseEvent.CLICK,this.closeSound);
         this.btn_huazhi.addEventListener(MouseEvent.CLICK,this.huazhiChange);
         this.gc.eventManger.addEventListener("closesetmenu",this.continueClick1);
         this.initSound();
         if(this.gc.SummonMonsterSpeed == 1)
         {
            this.huazhi.gotoAndStop(1);
         }
         else if(this.gc.SummonMonsterSpeed == 2)
         {
            this.huazhi.gotoAndStop(2);
         }
         else if(this.gc.SummonMonsterSpeed == 4)
         {
            this.huazhi.gotoAndStop(3);
         }
      }
      
      private function removed(param1:*) : void
      {
         this.btn_continue.removeEventListener(MouseEvent.CLICK,this.continueClick);
         this.btn_back_selectmap.removeEventListener(MouseEvent.CLICK,this.backmapClick);
         this.btn_back_menu.removeEventListener(MouseEvent.CLICK,this.backmenuClick);
         this.btn_help.removeEventListener(MouseEvent.CLICK,this.helpClick);
         this.btn_x.removeEventListener(MouseEvent.CLICK,this.continueClick);
         this.btn_sound_open.removeEventListener(MouseEvent.CLICK,this.openSound);
         this.btn_sound_close.removeEventListener(MouseEvent.CLICK,this.closeSound);
         this.btn_huazhi.removeEventListener(MouseEvent.CLICK,this.huazhiChange);
         this.gc.eventManger.removeEventListener("closesetmenu",this.continueClick1);
         if(this.gc.isSingleGame())
         {
            MainGame.getInstance().continueGame();
         }
      }
      
      private function initSound() : void
      {
         if(SoundManager.soundStay)
         {
            this.btn_sound_close.visible = true;
            this.btn_sound_open.visible = false;
         }
         else
         {
            this.btn_sound_close.visible = false;
            this.btn_sound_open.visible = true;
         }
      }
      
      private function intoStopGame() : void
      {
         this.gc.pausepre = getTimer();
         MainGame.getInstance().stopGame();
      }
      
      private function continueClick(param1:MouseEvent) : void
      {
         this.gc.pauseaft = getTimer();
         this.destory();
      }
      
      private function continueClick1(param1:Event) : void
      {
         this.gc.pauseaft = getTimer();
         this.destory();
      }
      
      private function backmapClick(param1:MouseEvent) : void
      {
         this.continueClick(null);
         MainGame.getInstance().destroyGame();
         if(this.gc.isServerOk)
         {
            this.gc.closeScoket();
         }
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
      }
      
      private function doSaveGame() : void
      {
         this.gc.memory.setStorage(this.gc.saveId);
      }
      
      private function backmenuClick(param1:MouseEvent) : void
      {
         this.continueClick(null);
         MainGame.getInstance().destroyMode();
         if(this.gc.isServerOk)
         {
            this.gc.closeScoket();
         }
         GMain.getInstance().switchSence("GameMenu");
         this.gc.difficulity == 0;
      }
      
      private function helpClick(param1:MouseEvent) : void
      {
         this.gc.eventManger.dispatchEvent(new CommonEvent("GameHelp"));
      }
      
      private function openSound(param1:MouseEvent) : void
      {
         this.btn_sound_close.visible = true;
         this.btn_sound_open.visible = false;
         SoundManager.controlSound();
      }
      
      private function huazhiChange(param1:MouseEvent) : void
      {
         if(this.huazhi.currentFrame == 1)
         {
            this.gc.SummonMonsterSpeed = 2;
            this.huazhi.gotoAndStop(2);
         }
         else if(this.huazhi.currentFrame == 2)
         {
            this.gc.SummonMonsterSpeed = 4;
            this.huazhi.gotoAndStop(3);
         }
         else
         {
            this.gc.SummonMonsterSpeed = 1;
            this.huazhi.gotoAndStop(1);
         }
      }
      
      private function closeSound(param1:MouseEvent) : void
      {
         this.btn_sound_close.visible = false;
         this.btn_sound_open.visible = true;
         SoundManager.controlSound();
      }
      
      private function destory() : void
      {
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
      }
   }
}

