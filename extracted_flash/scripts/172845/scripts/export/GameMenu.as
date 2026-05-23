package export
{
   import config.*;
   import event.*;
   import flash.display.SimpleButton;
   import flash.display.Sprite;
   import flash.events.*;
   import flash.net.*;
   import manager.*;
   import my.*;
   
   public class GameMenu extends Sprite
   {
      
      public var _data:FileReference;
      
      private var data:String;
      
      public var simpleGame:SimpleButton;
      
      public var doubleGame:SimpleButton;
      
      public var gameHelp:SimpleButton;
      
      public var aboutUs:SimpleButton;
      
      public var backbtn:SimpleButton;
      
      public var continueGame:SimpleButton;
      
      public var newGame:SimpleButton;
      
      public var btn_forum:SimpleButton;
      
      public var btnquit:SimpleButton;
      
      public var btn_like:SimpleButton;
      
      private var gc:Config;
      
      public function GameMenu()
      {
         this._data = new FileReference();
         super();
         this.gc = Config.getInstance();
         this.tabChildren = false;
         this.tabEnabled = false;
         this._data.addEventListener(Event.SELECT,this.onSelected);
         this._data.addEventListener(Event.COMPLETE,this.onComplete);
         this.addEventListener(Event.ADDED_TO_STAGE,this.added,false,0,true);
         this.addEventListener(Event.REMOVED_FROM_STAGE,this.removed,false,0,true);
      }
      
      private function onSelected(param1:Event) : void
      {
         this._data.load();
      }
      
      private function onComplete(param1:Event) : void
      {
         var _loc2_:savetrans = new savetrans();
         var _loc3_:* = null;
         var _loc4_:* = null;
         var _loc5_:* = null;
         _loc4_ = this.gc.decrypt(this._data.data);
         var _loc6_:int = 0;
         while(_loc6_ < 10)
         {
            try
            {
               _loc4_.uncompress();
               _loc6_++;
            }
            catch(e:*)
            {
               break;
            }
         }
         _loc5_ = _loc4_.readObject() as String;
         _loc3_ = _loc2_.decXml(_loc5_);
         this.gc.memory.storageValue(0,_loc3_);
         this.showAndHide();
      }
      
      private function added(param1:Event) : *
      {
         this.gc.isinthegame = true;
         this.simpleGame.addEventListener(MouseEvent.CLICK,this.selectNum);
         this.doubleGame.addEventListener(MouseEvent.CLICK,this.selectNum);
         this.backbtn.addEventListener(MouseEvent.CLICK,this.backClick);
         this.continueGame.addEventListener(MouseEvent.CLICK,this.continueClick);
         this.newGame.addEventListener(MouseEvent.CLICK,this.newGameClick);
         this.gameHelp.addEventListener(MouseEvent.CLICK,this.helpClick);
         this.aboutUs.addEventListener(MouseEvent.CLICK,this.about);
         this.btnquit.addEventListener(MouseEvent.CLICK,this.quit);
         this.btn_forum.addEventListener(MouseEvent.CLICK,this.forumClick);
         this.btn_like.addEventListener(MouseEvent.CLICK,this.likeClick);
         this.gc.playerName = this.gc.lc.domain;
         this.btn_like.visible = false;
         SoundManager.play("begin");
      }
      
      private function removed(param1:Event) : *
      {
         this.simpleGame.removeEventListener(MouseEvent.CLICK,this.selectNum);
         this.doubleGame.removeEventListener(MouseEvent.CLICK,this.selectNum);
         this.backbtn.removeEventListener(MouseEvent.CLICK,this.backClick);
         this.continueGame.removeEventListener(MouseEvent.CLICK,this.continueClick);
         this.newGame.removeEventListener(MouseEvent.CLICK,this.newGameClick);
         this.gameHelp.removeEventListener(MouseEvent.CLICK,this.helpClick);
         this.aboutUs.removeEventListener(MouseEvent.CLICK,this.about);
         this.btnquit.removeEventListener(MouseEvent.CLICK,this.quit);
         this.btn_forum.removeEventListener(MouseEvent.CLICK,this.forumClick);
         this.btn_like.removeEventListener(MouseEvent.CLICK,this.likeClick);
      }
      
      private function about(param1:MouseEvent) : void
      {
         SoundManager.play("xz");
         this.gc.eventManger.dispatchEvent(new CommonEvent("showAboutUs"));
      }
      
      private function likeClick(param1:MouseEvent) : void
      {
         SoundManager.play("xz");
         this.gc.eventManger.dispatchEvent(new CommonEvent("Approveme"));
      }
      
      private function backClick(param1:MouseEvent) : void
      {
         SoundManager.play("xz");
         this.showMenu();
      }
      
      private function continueClick(param1:MouseEvent) : void
      {
         SoundManager.play("xz");
         this.gc.isnew = false;
         var _loc2_:* = AUtils.getNewObj("export.saveInterface::SaveInter");
         _loc2_.state = "read";
         this.addChild(_loc2_);
      }
      
      private function newGameClick(param1:MouseEvent) : void
      {
         SoundManager.play("xz");
         this.gc.newGameClick();
         this.gc.isnew = true;
         this.showSelectNum();
      }
      
      public function showSelectNum() : void
      {
         if(this.gc.isnew)
         {
            this.simpleGame.x = 751.15;
            this.doubleGame.x = 751.15;
            this.backbtn.x = 800;
            this.newGame.x = 1110;
            this.continueGame.x = 1110;
            this.gameHelp.x = 1110;
            this.aboutUs.x = 1110;
            this.btnquit.x = 1110;
            this.btn_like.x = 1110;
         }
      }
      
      private function selectNum(param1:MouseEvent) : *
      {
         var _loc2_:String = param1.currentTarget.name;
         if(_loc2_ == "simpleGame")
         {
            this.gc.playNum = 1;
         }
         else
         {
            this.gc.playNum = 2;
         }
         SoundManager.play("xz");
         this.showMenu();
         this.doAfterChangeOut();
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
      }
      
      public function showAndHide() : void
      {
         this.gc.memory.getStorage();
         this.doAfterChangeOut();
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
      }
      
      private function hideMenu(param1:Boolean) : void
      {
         this.simpleGame.x = 1110;
         this.doubleGame.x = 1110;
         this.gameHelp.x = 1110;
         this.aboutUs.x = 1110;
         this.btnquit.x = 1110;
         this.btn_like.x = 1110;
         this.backbtn.x = 800;
         if(param1)
         {
            this.continueGame.x = 800;
            this.newGame.x = 800;
            this.newGame.y = 205.5;
         }
         else
         {
            this.newGame.y = this.continueGame.y;
            this.newGame.x = 800;
         }
      }
      
      public function showMenu() : void
      {
         this.simpleGame.x = 1110;
         this.doubleGame.x = 1110;
         this.backbtn.x = 1110;
         this.gameHelp.x = 751.15;
         this.gameHelp.y = 252.7;
         this.aboutUs.x = 751.15;
         this.aboutUs.y = 305.6;
         this.continueGame.x = 751.15;
         this.continueGame.y = 205;
         this.newGame.x = 751.15;
         this.newGame.y = 157.65;
         this.btnquit.x = 751.15;
         this.btnquit.y = 352.55;
         this.btn_forum.x = 751.15;
         this.btn_forum.y = 398.85;
         this.btn_like.x = 751.15;
         this.btn_like.y = 445.15;
      }
      
      private function helpClick(param1:*) : void
      {
         SoundManager.play("xz");
         this.gc.eventManger.dispatchEvent(new CommonEvent("GameHelp",{"state":"menu"}));
      }
      
      public function getSevenData() : void
      {
      }
      
      public function getSaveData() : void
      {
         if(this.gc.isnew)
         {
            this.showSelectNum();
         }
      }
      
      public function isremoveLoginAlert() : void
      {
         if(!this.gc.isnew)
         {
         }
      }
      
      private function quit(param1:MouseEvent) : void
      {
         stage.nativeWindow.close();
      }
      
      private function forumClick(param1:MouseEvent) : void
      {
         this.gc.ts.setTxt("null");
         this.gc.stage.addChild(this.gc.ts);
      }
      
      public function doAfterChangeOut() : void
      {
         if(this.gc.isnew)
         {
            this.gc.eventManger.dispatchEvent(new Event("StartSelectRole"));
         }
         else
         {
            this.gc.eventManger.dispatchEvent(new Event("SelectOver"));
         }
      }
   }
}

