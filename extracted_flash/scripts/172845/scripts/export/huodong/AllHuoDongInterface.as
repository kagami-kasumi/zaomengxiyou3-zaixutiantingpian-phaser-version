package export.huodong
{
   import config.*;
   import export.huodong.kabu.*;
   import export.huodong.newyear.*;
   import flash.display.SimpleButton;
   import flash.display.Sprite;
   import flash.events.*;
   
   public class AllHuoDongInterface extends Sprite
   {
      
      public var actkabubtn:SimpleButton;
      
      public var reckabubtn:SimpleButton;
      
      public var btn_x:SimpleButton;
      
      public var nybtn:SimpleButton;
      
      private var gc:Config;
      
      public function AllHuoDongInterface()
      {
         super();
         this.gc = Config.getInstance();
         this.addEventListener(Event.ADDED_TO_STAGE,this.added,false,0,true);
         this.addEventListener(Event.REMOVED_FROM_STAGE,this.removed,false,0,true);
      }
      
      private function added(param1:Event) : void
      {
         this.actkabubtn.addEventListener(MouseEvent.CLICK,this.actKaBuClick);
         this.reckabubtn.addEventListener(MouseEvent.CLICK,this.recKaBuClick);
         this.btn_x.addEventListener(MouseEvent.CLICK,this.backClick);
         this.nybtn.addEventListener(MouseEvent.CLICK,this.newYearClick);
      }
      
      private function removed(param1:Event) : void
      {
         this.actkabubtn.removeEventListener(MouseEvent.CLICK,this.actKaBuClick);
         this.reckabubtn.removeEventListener(MouseEvent.CLICK,this.recKaBuClick);
         this.btn_x.removeEventListener(MouseEvent.CLICK,this.backClick);
         this.nybtn.removeEventListener(MouseEvent.CLICK,this.newYearClick);
      }
      
      private function actKaBuClick(param1:MouseEvent) : void
      {
         var _loc2_:KaBuActivites = new KaBuActivites();
         this.parent.addChild(_loc2_);
         this.backClick(null);
      }
      
      private function recKaBuClick(param1:MouseEvent) : void
      {
         var _loc2_:ReceiveKaBuPacks = new ReceiveKaBuPacks();
         this.parent.addChild(_loc2_);
         this.backClick(null);
      }
      
      private function newYearClick(param1:MouseEvent) : void
      {
         var _loc2_:* = null;
         _loc2_ = new ChineseNewYear("28");
         this.parent.addChild(_loc2_);
         this.backClick(null);
      }
      
      private function backClick(param1:MouseEvent) : void
      {
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
      }
   }
}

