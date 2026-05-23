package export.strength
{
   import com.hexagonstar.util.debug.*;
   import config.*;
   import event.*;
   import export.pack.*;
   import flash.display.*;
   import flash.events.*;
   import flash.text.*;
   import my.*;
   import user.*;
   
   public class StrengthEquipment extends Sprite
   {
      
      private var gc:Config;
      
      public var nowpage:TextField;
      
      private var player1:MovieClip;
      
      private var player2:MovieClip;
      
      public var state:String = "";
      
      private var currentPlayer:User;
      
      private var backpackagemc:BackPackElement;
      
      public var btnback:SimpleButton;
      
      public var strengthbtn:SimpleButton;
      
      public var mixturebtn:SimpleButton;
      
      public var makingbtn:SimpleButton;
      
      public var resolutionbtn:SimpleButton;
      
      public var txtlh:TextField;
      
      public var prePage:SimpleButton;
      
      public var nextPage:SimpleButton;
      
      private var isfirst:Boolean = true;
      
      private var tag:Boolean = true;
      
      private var btnState:*;
      
      private var lastBtn:String = "";
      
      private var btnState2:*;
      
      private var lastBtn2:String = "";
      
      public var skinbtn:Sprite;
      
      public var skinsave:EquipmentSkin;
      
      public function StrengthEquipment()
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
      
      public function getUser() : User
      {
         return this.currentPlayer;
      }
      
      private function added(param1:Event) : void
      {
         var ttf:TextFormat = null;
         var skinLbl:TextField = null;
         var _loc2_:* = 0;
         if(this.tag)
         {
            this.tag = false;
            this.player1 = null;
            this.player2 = null;
            _loc2_ = uint(this.gc.playNum);
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
               this["player" + _loc2_].addEventListener(MouseEvent.CLICK,this.equipStrength);
               this.addChild(this["player" + _loc2_]);
               this["player" + _loc2_].x = 42 + (_loc2_ - 1) * 90;
               this["player" + _loc2_].y = 14.85;
               _loc2_--;
            }
            this.btnback.addEventListener(MouseEvent.CLICK,this.back);
            this.strengthbtn.addEventListener(MouseEvent.CLICK,this.strMethod);
            this.mixturebtn.addEventListener(MouseEvent.CLICK,this.mixMethod);
            this.resolutionbtn.addEventListener(MouseEvent.CLICK,this.resMethod);
            this.makingbtn.addEventListener(MouseEvent.CLICK,this.makeMethod);
            this.prePage.addEventListener(MouseEvent.CLICK,this.prePageClick);
            this.nextPage.addEventListener(MouseEvent.CLICK,this.nextPageClick);
            this.player1.dispatchEvent(new MouseEvent(MouseEvent.CLICK));
            if(this.state == "gameing")
            {
               MainGame.getInstance().stopGame();
            }
            ttf = new TextFormat();
            ttf.size = 22;
            ttf.color = 16777215;
            ttf.bold = true;
            this.skinbtn = new Sprite();
            this.skinbtn.x = this.makingbtn.x + 60;
            this.skinbtn.y = this.makingbtn.y - 5;
            skinLbl = new TextField();
            skinLbl.x = 6;
            skinLbl.y = 1;
            skinLbl.selectable = false;
            skinLbl.autoSize = TextFieldAutoSize.LEFT;
            skinLbl.text = "幻兵";
            skinLbl.setTextFormat(ttf);
            this.skinbtn.addChild(skinLbl);
            this.skinbtn.graphics.lineStyle(1);
            this.skinbtn.graphics.beginFill(0);
            this.skinbtn.graphics.drawRoundRect(0,0,skinLbl.width + 12,skinLbl.height + 2,5,5);
            this.skinbtn.graphics.endFill();
            addChild(this.skinbtn);
            this.skinbtn.addEventListener("click",this.skinClick);
         }
      }
      
      private function removed(param1:Event) : void
      {
         if(this.player1)
         {
            this.player1.removeEventListener(MouseEvent.CLICK,this.equipStrength);
         }
         if(this.player2)
         {
            this.player2.removeEventListener(MouseEvent.CLICK,this.equipStrength);
         }
         this.btnback.removeEventListener(MouseEvent.CLICK,this.back);
         this.strengthbtn.removeEventListener(MouseEvent.CLICK,this.strMethod);
         this.mixturebtn.removeEventListener(MouseEvent.CLICK,this.mixMethod);
         this.resolutionbtn.removeEventListener(MouseEvent.CLICK,this.resMethod);
         this.makingbtn.removeEventListener(MouseEvent.CLICK,this.makeMethod);
         this.prePage.removeEventListener(MouseEvent.CLICK,this.prePageClick);
         this.nextPage.removeEventListener(MouseEvent.CLICK,this.nextPageClick);
         this.skinbtn.removeEventListener("click",this.skinClick);
         this.btnState = null;
         this.btnState2 = null;
      }
      
      private function prePageClick(param1:MouseEvent) : void
      {
         if(this.backpackagemc)
         {
            this.backpackagemc.setCurPage(-1);
         }
         this.nowpage.text = this.backpackagemc.curPage;
      }
      
      private function nextPageClick(param1:MouseEvent) : void
      {
         if(this.backpackagemc)
         {
            this.backpackagemc.setCurPage(1);
         }
         this.nowpage.text = this.backpackagemc.curPage;
      }
      
      private function equipStrength(param1:MouseEvent) : void
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
         this.addBackPackAgeMc();
         if(this.currentPlayer)
         {
            this.strengthbtn.dispatchEvent(new MouseEvent(MouseEvent.CLICK));
         }
         this.setTxtlh();
      }
      
      private function addBackPackAgeMc() : void
      {
         if(this.backpackagemc != null && contains(this.backpackagemc))
         {
            this.removeChild(this.backpackagemc);
            this.backpackagemc = null;
         }
         this.backpackagemc = new BackPackElement();
         this.isfirst = true;
         this.addChild(this.backpackagemc);
         this.backpackagemc.setPlayer(this.currentPlayer);
         this.backpackagemc.x = 512.8;
         this.backpackagemc.y = 130;
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
      
      public function setTxtlh() : void
      {
         if(this.currentPlayer)
         {
            this.txtlh.text = this.currentPlayer.getLhValue() + "";
         }
      }
      
      private function strMethod(param1:MouseEvent) : void
      {
         var _loc2_:* = null;
         Debug.trace("---strMethod----");
         this.removeEquipCont();
         if(this.currentPlayer != null)
         {
            _loc2_ = new Strength(this.currentPlayer);
            _loc2_.name = "playerControl";
            _loc2_.x = 175.6;
            _loc2_.y = 128.45;
            this.addChild(_loc2_);
         }
         if(this.btnState)
         {
            if(this.lastBtn != "")
            {
               this[this.lastBtn].upState = this.btnState;
            }
         }
         this.lastBtn = "strengthbtn";
         this.btnState = param1.target.upState;
         param1.target.upState = param1.target.downState;
      }
      
      private function mixMethod(param1:MouseEvent) : void
      {
         var _loc2_:* = null;
         this.removeEquipCont();
         if(this.currentPlayer != null)
         {
            _loc2_ = new Fusion(this.currentPlayer);
            _loc2_.name = "playerControl";
            _loc2_.x = 175.6;
            _loc2_.y = 128.45;
            this.addChild(_loc2_);
         }
         if(this.btnState)
         {
            if(this.lastBtn != "")
            {
               this[this.lastBtn].upState = this.btnState;
            }
         }
         this.lastBtn = "mixturebtn";
         this.btnState = param1.target.upState;
         param1.target.upState = param1.target.downState;
      }
      
      private function resMethod(param1:MouseEvent) : void
      {
         var _loc2_:* = null;
         this.removeEquipCont();
         if(this.currentPlayer != null)
         {
            _loc2_ = new Resolution(this.currentPlayer);
            _loc2_.name = "playerControl";
            _loc2_.x = 175.6;
            _loc2_.y = 128.45;
            this.addChild(_loc2_);
         }
         if(this.btnState)
         {
            if(this.lastBtn != "")
            {
               this[this.lastBtn].upState = this.btnState;
            }
         }
         this.lastBtn = "resolutionbtn";
         this.btnState = param1.target.upState;
         param1.target.upState = param1.target.downState;
      }
      
      private function makeMethod(param1:MouseEvent) : void
      {
         var _loc2_:* = null;
         this.removeEquipCont();
         if(this.currentPlayer != null)
         {
            _loc2_ = new Making(this.currentPlayer);
            _loc2_.name = "playerControl";
            _loc2_.x = 175.6;
            _loc2_.y = 110.45;
            this.addChild(_loc2_);
         }
         if(this.btnState)
         {
            if(this.lastBtn != "")
            {
               this[this.lastBtn].upState = this.btnState;
            }
         }
         this.lastBtn = "makingbtn";
         this.btnState = param1.target.upState;
         param1.target.upState = param1.target.downState;
      }
      
      private function removeEquipCont() : void
      {
         Debug.trace("----removeEquipCont-----");
         Debug.trace("----isfirst----- " + this.isfirst);
         var _loc1_:* = this.getChildByName("playerControl");
         if(_loc1_ != null)
         {
            this.removeChild(_loc1_);
            _loc1_ = null;
         }
         if(!this.isfirst)
         {
            this.gc.eventManger.dispatchEvent(new CommonEvent("GETANDREFRESHBACKPACKAGE"));
         }
         this.isfirst = false;
      }
      
      private function skinClick(e:MouseEvent) : void
      {
         var ddd:Boolean = true;
         if(ddd)
         {
            this.gc.ts.setTxt("暂不开放！");
            this.gc.stage.addChild(this.gc.ts);
            return;
         }
         trace("testaaaaaa");
         this.removeEquipCont();
         if(this.currentPlayer != null)
         {
            this.skinsave = new EquipmentSkin(this.currentPlayer);
            this.skinsave.name = "playerControl";
            this.skinsave.x = 145;
            this.skinsave.y = 130;
            this.addChild(this.skinsave);
         }
         else
         {
            trace("currentPlayer is null");
         }
      }
      
      private function back(param1:*) : void
      {
         if(this.state == "gameing")
         {
            MainGame.getInstance().continueGame();
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

