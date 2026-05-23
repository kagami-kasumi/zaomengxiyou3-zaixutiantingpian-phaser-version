package export.immortality
{
   import config.*;
   import event.*;
   import flash.display.SimpleButton;
   import flash.display.Sprite;
   import flash.events.*;
   import manager.*;
   import user.User;
   
   public class SingleImmortality extends Sprite
   {
      
      private var gc:Config;
      
      public var eatbtn:SimpleButton;
      
      private var player:User;
      
      private var imid:uint;
      
      private var immname:String = "";
      
      private var imtype:uint;
      
      public function SingleImmortality()
      {
         super();
         this.gc = Config.getInstance();
         this.setBtnVisible(false);
         this.addEventListener(Event.ADDED_TO_STAGE,this.added,false,0,true);
         this.addEventListener(Event.REMOVED_FROM_STAGE,this.removed,false,0,true);
      }
      
      private function added(param1:Event) : void
      {
         this.eatbtn.addEventListener(MouseEvent.CLICK,this.eatClick);
      }
      
      private function removed(param1:Event) : void
      {
         this.eatbtn.removeEventListener(MouseEvent.CLICK,this.eatClick);
      }
      
      public function setUser(param1:User) : void
      {
         this.player = param1;
      }
      
      private function eatClick(param1:MouseEvent) : void
      {
         if(this.player)
         {
            if(this.player.getLhValue() < 1000)
            {
               TipsManager.getInstance().CreateWarn("灵魂不足1000！");
               return;
            }
            this.player.setLhValue(this.player.getLhValue() - 1000);
            this.setBtnVisible(false);
            this.player.immortalitylist[this.imtype][this.imid - 1] = 1;
            this.player.removeSomeOneDJByFillName(this.immname + this.imid);
            ImmortalityInterface(this.parent).refreshInterface();
            this.gc.eventManger.dispatchEvent(new CommonEvent("RefreshPill"));
         }
      }
      
      public function setImmortalityId(param1:uint, param2:String) : void
      {
         this.imid = param1;
         this.immname = param2;
         switch(param2)
         {
            case "wpsmd":
               this.imtype = 0;
               break;
            case "wpmfd":
               this.imtype = 1;
               break;
            case "wpbjd":
               this.imtype = 2;
               break;
            case "wphxd":
               this.imtype = 3;
               break;
            case "wphld":
               this.imtype = 4;
         }
      }
      
      public function setBtnVisible(param1:Boolean) : void
      {
         this.eatbtn.visible = param1;
      }
      
      public function setImage(param1:String) : void
      {
         var _loc2_:* = undefined;
         if(this.getChildByName("showhaseatimmortality") == null)
         {
            _loc2_ = AUtils.getImageObj(param1);
            _loc2_.name = "showhaseatimmortality";
            _loc2_.x = 2;
            _loc2_.y = 2;
            this.addChild(_loc2_);
         }
      }
      
      public function setUnUseable() : void
      {
         this.setBtnVisible(false);
      }
   }
}

