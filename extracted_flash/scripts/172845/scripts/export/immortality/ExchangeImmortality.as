package export.immortality
{
   import config.*;
   import event.*;
   import flash.display.SimpleButton;
   import flash.display.Sprite;
   import flash.events.*;
   import manager.*;
   import my.*;
   import user.User;
   
   public class ExchangeImmortality extends Sprite
   {
      
      private var gc:Config;
      
      public var x_btn:SimpleButton;
      
      public var compound1:SimpleButton;
      
      public var compound2:SimpleButton;
      
      public var compound3:SimpleButton;
      
      public var compound4:SimpleButton;
      
      public var compound5:SimpleButton;
      
      private var wantProp1:Object;
      
      private var wantProp2:Object;
      
      private var player:User;
      
      private var pillType:String = "";
      
      public function ExchangeImmortality(param1:User, param2:String)
      {
         super();
         this.gc = Config.getInstance();
         this.player = param1;
         this.pillType = param2;
         this.addEventListener(Event.ADDED_TO_STAGE,this.added,false,0,true);
         this.addEventListener(Event.REMOVED_FROM_STAGE,this.removed,false,0,true);
      }
      
      private function added(param1:Event) : void
      {
         var _loc2_:uint = 5;
         this.x_btn.addEventListener(MouseEvent.CLICK,this.xClick);
         while(_loc2_ > 0)
         {
            this["compound" + _loc2_].addEventListener(MouseEvent.CLICK,this.doCompound);
            _loc2_--;
         }
      }
      
      private function removed(param1:Event) : void
      {
         this.compound1.removeEventListener(MouseEvent.CLICK,this.doCompound);
         this.compound2.removeEventListener(MouseEvent.CLICK,this.doCompound);
         this.compound3.removeEventListener(MouseEvent.CLICK,this.doCompound);
         this.compound4.removeEventListener(MouseEvent.CLICK,this.doCompound);
         this.compound5.removeEventListener(MouseEvent.CLICK,this.doCompound);
         this.x_btn.removeEventListener(MouseEvent.CLICK,this.xClick);
      }
      
      private function doCompound(param1:MouseEvent) : void
      {
         var _loc2_:uint = uint(param1.currentTarget.name.substr(8,1));
         switch(_loc2_)
         {
            case 1:
               this.wantProp1 = {
                  "id":"wplh",
                  "num":40
               };
               this.wantProp2 = {
                  "id":"wpll",
                  "num":40
               };
               break;
            case 2:
               this.wantProp1 = {
                  "id":"wplh",
                  "num":15
               };
               this.wantProp2 = {
                  "id":"wpxm",
                  "num":40
               };
               break;
            case 3:
               this.wantProp1 = {
                  "id":"wpdd",
                  "num":1
               };
               this.wantProp2 = {
                  "id":"wplh",
                  "num":20
               };
               break;
            case 4:
               this.wantProp1 = {
                  "id":"wpdd",
                  "num":1
               };
               this.wantProp2 = {
                  "id":"wpsg",
                  "num":15
               };
               break;
            case 5:
               this.wantProp1 = {
                  "id":"wpdd",
                  "num":1
               };
               this.wantProp2 = {
                  "id":"wprs",
                  "num":10
               };
         }
         this.makePill(_loc2_);
      }
      
      private function makePill(param1:int) : *
      {
         var _loc2_:String = "炼制丹药成功！";
         if(this.player.getSomeOneEquipNumberByName(this.wantProp1.id) >= this.wantProp1.num && this.player.getSomeOneEquipNumberByName(this.wantProp2.id) >= this.wantProp2.num)
         {
            if(this.player.djlist.length >= 25 * AllConsts.BACKPACKMAXPAGE)
            {
               this.gc.ts.setTxt("背包空间不足");
               this.gc.stage.addChild(this.gc.ts);
               return;
            }
            this.player.removeEquipFormBack(this.wantProp1.id,2,this.wantProp1.num);
            this.player.removeEquipFormBack(this.wantProp2.id,2,this.wantProp2.num);
            this.gc.putQhsInBackPack(this.player,this.pillType + param1);
            if(Math.random() < 0.05)
            {
               _loc2_ = "走火了，丹药可能变质了！";
            }
            this.gc.ts.setTxt(_loc2_);
            this.gc.stage.addChild(this.gc.ts);
            this.gc.eventManger.dispatchEvent(new CommonEvent("RefreshPill"));
            return;
         }
         this.gc.ts.setTxt("道具不足");
         this.gc.stage.addChild(this.gc.ts);
      }
      
      private function xClick(param1:MouseEvent) : void
      {
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
      }
   }
}

