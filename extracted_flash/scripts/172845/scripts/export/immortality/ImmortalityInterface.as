package export.immortality
{
   import config.*;
   import event.*;
   import flash.display.*;
   import flash.events.*;
   import flash.text.TextField;
   import user.*;
   
   public class ImmortalityInterface extends Sprite
   {
      
      private var gc:Config;
      
      private var currentPlayer:User;
      
      private var player1:MovieClip;
      
      private var player2:MovieClip;
      
      public var im1_1:SingleImmortality;
      
      public var im1_2:SingleImmortality;
      
      public var im1_3:SingleImmortality;
      
      public var im1_4:SingleImmortality;
      
      public var im1_5:SingleImmortality;
      
      public var im2_1:SingleImmortality;
      
      public var im2_2:SingleImmortality;
      
      public var im2_3:SingleImmortality;
      
      public var im2_4:SingleImmortality;
      
      public var im2_5:SingleImmortality;
      
      public var im3_1:SingleImmortality;
      
      public var im3_2:SingleImmortality;
      
      public var im3_3:SingleImmortality;
      
      public var im3_4:SingleImmortality;
      
      public var im3_5:SingleImmortality;
      
      public var im4_1:SingleImmortality;
      
      public var im4_2:SingleImmortality;
      
      public var im4_3:SingleImmortality;
      
      public var im4_4:SingleImmortality;
      
      public var im4_5:SingleImmortality;
      
      public var im5_1:SingleImmortality;
      
      public var im5_2:SingleImmortality;
      
      public var im5_3:SingleImmortality;
      
      public var im5_4:SingleImmortality;
      
      public var im5_5:SingleImmortality;
      
      public var btnback:SimpleButton;
      
      public var ef1:TextField;
      
      public var ef2:TextField;
      
      public var ef3:TextField;
      
      public var ef4:TextField;
      
      public var ef5:TextField;
      
      public var txtlh:TextField;
      
      public var make1:SimpleButton;
      
      public var make2:SimpleButton;
      
      public var make3:SimpleButton;
      
      public var make4:SimpleButton;
      
      public var make5:SimpleButton;
      
      public var state:String = "";
      
      private var immname1:String = "wpsmd";
      
      private var immname2:String = "wpmfd";
      
      private var immname3:String = "wpbjd";
      
      private var immname4:String = "wphxd";
      
      private var immname5:String = "wphld";
      
      public function ImmortalityInterface()
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
         var _loc3_:uint = 5;
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
            this["player" + _loc2_].addEventListener(MouseEvent.CLICK,this.playerUse);
            this.addChild(this["player" + _loc2_]);
            this["player" + _loc2_].x = 50 + (_loc2_ - 1) * 90;
            this["player" + _loc2_].y = 540;
            _loc2_--;
         }
         while(_loc3_ > 0)
         {
            this["make" + _loc3_].addEventListener(MouseEvent.CLICK,this.makeImmortality);
            _loc3_--;
         }
         this.btnback.addEventListener(MouseEvent.CLICK,this.back);
         if(this.player1)
         {
            this.player1.dispatchEvent(new MouseEvent(MouseEvent.CLICK));
         }
         if(this.player2)
         {
            this.player2.dispatchEvent(new MouseEvent(MouseEvent.CLICK));
         }
         this.initImmortalityShow();
      }
      
      private function removed(param1:Event) : void
      {
         if(this.player1)
         {
            this.player1.removeEventListener(MouseEvent.CLICK,this.playerUse);
         }
         if(this.player2)
         {
            this.player2.removeEventListener(MouseEvent.CLICK,this.playerUse);
         }
         var i:* = 5;
         while(i)
         {
            this["make" + i].removeEventListener(MouseEvent.CLICK,this.makeImmortality);
            i--;
         }
         this.btnback.removeEventListener(MouseEvent.CLICK,this.back);
      }
      
      private function playerUse(param1:MouseEvent) : void
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
         this.refreshInterface();
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
      
      public function setTxtlh() : void
      {
         if(this.currentPlayer)
         {
            this.txtlh.text = this.currentPlayer.getLhValue() + "";
         }
      }
      
      private function makeImmortality(param1:MouseEvent) : void
      {
         var _loc2_:uint = uint(param1.currentTarget.name.substr(4));
         var _loc3_:String = "";
         switch(_loc2_)
         {
            case 1:
               _loc3_ = String(this.immname1);
               break;
            case 2:
               _loc3_ = String(this.immname2);
               break;
            case 3:
               _loc3_ = String(this.immname3);
               break;
            case 4:
               _loc3_ = String(this.immname4);
               break;
            case 5:
               _loc3_ = String(this.immname5);
         }
         var _loc4_:ExchangeImmortality = new ExchangeImmortality(this.currentPlayer,_loc3_);
         this.addChild(_loc4_);
      }
      
      private function initImmortalityShow() : void
      {
         var _loc1_:uint = 0;
         var _loc2_:String = null;
         var _loc3_:uint = 0;
         var _loc4_:uint = 0;
         var _loc5_:uint = 0;
         var _loc6_:uint = 0;
         var _loc7_:int = 0;
         var _loc8_:int = 0;
         if(this.currentPlayer)
         {
            _loc1_ = uint(this.currentPlayer.immortalitylist.length);
            _loc2_ = "";
            _loc3_ = 0;
            while(_loc8_ < 5)
            {
               _loc7_ = 0;
               while(_loc7_ < 5)
               {
                  if(this["im" + (_loc8_ + 1) + "_" + (_loc7_ + 1)].getChildByName("showhaseatimmortality"))
                  {
                     this["im" + (_loc8_ + 1) + "_" + (_loc7_ + 1)].removeChild(this["im" + (_loc8_ + 1) + "_" + (_loc7_ + 1)].getChildByName("showhaseatimmortality"));
                  }
                  _loc7_++;
               }
               _loc8_++;
            }
            while(_loc3_ < _loc1_)
            {
               this.setRowList(_loc3_ + 1);
               if(this.currentPlayer.immortalitylist[_loc3_])
               {
                  _loc4_ = uint(this.currentPlayer.immortalitylist[_loc3_].length);
                  _loc5_ = 1;
                  while(_loc5_ <= _loc4_ && this.currentPlayer.immortalitylist[_loc3_][_loc5_ - 1] > 0)
                  {
                     this["im" + (_loc3_ + 1) + "_" + _loc5_].setImage(this["immname" + (_loc3_ + 1)] + _loc5_);
                     _loc5_++;
                  }
                  if(this.currentPlayer.getSomeOneEquipNumberByName(this["immname" + (_loc3_ + 1)] + _loc5_) > 0)
                  {
                     this["im" + (_loc3_ + 1) + "_" + _loc5_].setBtnVisible(true);
                  }
               }
               _loc3_++;
            }
         }
         this.setTxt();
      }
      
      private function setRowList(param1:uint) : void
      {
         var _loc2_:uint = 1;
         while(_loc2_ <= 5)
         {
            this["im" + param1 + "_" + _loc2_].setImmortalityId(_loc2_,this["immname" + param1]);
            this["im" + param1 + "_" + _loc2_].setUser(this.currentPlayer);
            _loc2_++;
         }
      }
      
      private function setTxt() : void
      {
         var _loc1_:* = 0;
         var _loc2_:Array = this.currentPlayer.findAllImmortalityAdd();
         while(_loc1_++ < 5)
         {
            this["ef" + _loc1_].text = _loc2_[_loc1_ - 1] + " ";
         }
      }
      
      public function refreshInterface() : void
      {
         this.initImmortalityShow();
      }
      
      private function back(param1:*) : void
      {
         if(this.state == "maping")
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

