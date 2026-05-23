package export.shop
{
   import config.*;
   import event.*;
   import flash.display.*;
   import flash.events.*;
   import flash.text.TextField;
   import my.*;
   import user.*;
   
   public class BuySkill extends Sprite
   {
      
      private var gc:Config;
      
      private var currentPlayer:User;
      
      private var player1:MovieClip;
      
      private var player2:MovieClip;
      
      public var btnback:SimpleButton;
      
      public var txtlh:TextField;
      
      public var passivebtn:SimpleButton;
      
      public var activebtn:SimpleButton;
      
      public var state:String = "";
      
      public function BuySkill()
      {
         super();
         this.gc = Config.getInstance();
         this.addEventListener(Event.ADDED_TO_STAGE,this.added,false,0,true);
         this.addEventListener(Event.REMOVED_FROM_STAGE,this.removed,false,0,true);
      }
      
      public function setCurrentState(param1:String) : void
      {
         this.state = param1;
      }
      
      private function added(param1:Event) : void
      {
         this.player1 = null;
         this.player2 = null;
         var _loc2_:uint = uint(this.gc.playNum);
         while(_loc2_ > 0)
         {
            if(this.gc["player" + _loc2_].getRoleName() == "孙悟空")
            {
               this["player" + _loc2_] = AUtils.getNewObj("export.shop.SelectWK") as MovieClip;
               this["player" + _loc2_].name = "孙悟空";
            }
            else if(this.gc["player" + _loc2_].getRoleName() == "唐僧")
            {
               this["player" + _loc2_] = AUtils.getNewObj("export.shop.SelectTS") as MovieClip;
               this["player" + _loc2_].name = "唐僧";
            }
            else if(this.gc["player" + _loc2_].getRoleName() == "八戒")
            {
               this["player" + _loc2_] = AUtils.getNewObj("export.shop.SelectBJ") as MovieClip;
               this["player" + _loc2_].name = "八戒";
            }
            else if(this.gc["player" + _loc2_].getRoleName() == "沙僧")
            {
               this["player" + _loc2_] = AUtils.getNewObj("export.shop.SelectSS") as MovieClip;
               this["player" + _loc2_].name = "沙僧";
            }
            else if(this.gc["player" + _loc2_].getRoleName() == "白龙")
            {
               this["player" + _loc2_] = AUtils.getNewObj("export.shop.SelectBL") as MovieClip;
               this["player" + _loc2_].name = "白龙";
            }
            this["player" + _loc2_].gotoAndStop(1);
            this["player" + _loc2_].buttonMode = true;
            this["player" + _loc2_].addEventListener(MouseEvent.CLICK,this.playerBuy);
            this.addChild(this["player" + _loc2_]);
            this["player" + _loc2_].x = 50 + (_loc2_ - 1) * 90;
            this["player" + _loc2_].y = 14.85;
            _loc2_--;
         }
         this.gc.eventManger.addEventListener("closeBuySkill",this.closeBuySkill);
         this.btnback.addEventListener(MouseEvent.CLICK,this.back);
         this.passivebtn.addEventListener(MouseEvent.CLICK,this.passiveFun);
         this.activebtn.addEventListener(MouseEvent.CLICK,this.activeFun);
         this.player1.dispatchEvent(new MouseEvent(MouseEvent.CLICK));
         if(this.state == "gameing")
         {
            MainGame.getInstance().stopGame();
         }
      }
      
      private function removed(param1:Event) : void
      {
         if(this.player1)
         {
            this.player1.removeEventListener(MouseEvent.CLICK,this.playerBuy);
         }
         if(this.player2)
         {
            this.player2.removeEventListener(MouseEvent.CLICK,this.playerBuy);
         }
         this.passivebtn.removeEventListener(MouseEvent.CLICK,this.passiveFun);
         this.activebtn.removeEventListener(MouseEvent.CLICK,this.activeFun);
         this.btnback.removeEventListener(MouseEvent.CLICK,this.back);
         if(this.gc.isSingleGame())
         {
            if(MainGame.getInstance())
            {
               MainGame.getInstance().continueGame();
            }
         }
         this.gc.eventManger.removeEventListener("closeBuySkill",this.closeBuySkill);
      }
      
      private function playerBuy(param1:MouseEvent) : void
      {
         if(this.player1)
         {
            if(this.player1.currentFrame == 2)
            {
               this.player1.gotoAndStop(1);
            }
         }
         if(this.player2)
         {
            if(this.player2.currentFrame == 2)
            {
               this.player2.gotoAndStop(1);
            }
         }
         param1.currentTarget.gotoAndStop(2);
         this.currentPlayer = this.onWho(String(param1.currentTarget.name));
         if(this.currentPlayer != null)
         {
            this.activeFun(null);
         }
         this.setTxtlh();
      }
      
      private function onWho(param1:String) : User
      {
         var _loc2_:uint = uint(this.gc.playNum);
         while(_loc2_ > 0)
         {
            if(this.gc["player" + _loc2_].getRoleName() == param1)
            {
               return this.gc["player" + _loc2_] as User;
            }
            _loc2_--;
         }
         return null;
      }
      
      private function removeSkillCont() : void
      {
         var _loc1_:* = this.getChildByName("playerControl");
         if(_loc1_ != null)
         {
            this.removeChild(_loc1_);
            _loc1_ = null;
         }
      }
      
      private function passiveFun(param1:*) : void
      {
         var _loc2_:* = null;
         this.removeSkillCont();
         if(this.currentPlayer != null)
         {
            _loc2_ = new PassiveSkillControl(this.currentPlayer);
            _loc2_.name = "playerControl";
            this.addChild(_loc2_);
         }
      }
      
      private function activeFun(param1:*) : void
      {
         var _loc2_:* = null;
         this.removeSkillCont();
         if(this.currentPlayer != null)
         {
            _loc2_ = new SkillControl(this.currentPlayer);
            _loc2_.name = "playerControl";
            this.addChild(_loc2_);
         }
      }
      
      public function setTxtlh() : void
      {
         if(this.currentPlayer)
         {
            this.txtlh.text = this.currentPlayer.getLhValue() + "";
         }
      }
      
      private function closeBuySkill(param1:CommonEvent) : void
      {
         this.back(null);
      }
      
      private function back(param1:*) : void
      {
         if(this.state == "gameing")
         {
            MainGame.getInstance().continueGame();
            this.gc.eventManger.dispatchEvent(new CommonEvent("InGameBuySkillOver"));
         }
         else if(this.state == "maping")
         {
            this.gc.eventManger.dispatchEvent(new CommonEvent("SelectOver"));
         }
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
      }
   }
}

