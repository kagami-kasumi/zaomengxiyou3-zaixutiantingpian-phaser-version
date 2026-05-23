package export.cartoon
{
   import config.*;
   import event.*;
   import flash.display.MovieClip;
   import flash.events.*;
   import my.*;
   
   public class GameCartoon extends MovieClip
   {
      
      private var gc:Config;
      
      private var hasadd:Boolean = false;
      
      private var inWhere:String;
      
      public var bgmc:MovieClip;
      
      public function GameCartoon()
      {
         super();
         this.gc = Config.getInstance();
         this.addEventListener(Event.ADDED_TO_STAGE,this.added,false,0,true);
         this.addEventListener(Event.REMOVED_FROM_STAGE,this.removed,false,0,true);
      }
      
      public function mygotoandStop(param1:String) : void
      {
         this.inWhere = param1;
         this.gotoAndStop(this.inWhere);
         if(this.inWhere == "红孩儿副本")
         {
            this.gc.openinghhe = false;
         }
      }
      
      private function added(param1:*) : void
      {
         if(!this.hasadd)
         {
            this.gc.opening = true;
            this.hasadd = true;
            this.addEventListener(MouseEvent.CLICK,this.nextPage);
         }
      }
      
      private function removed(param1:*) : void
      {
         this.removeEventListener(MouseEvent.CLICK,this.nextPage);
      }
      
      private function nextPage(param1:MouseEvent) : void
      {
         if(this.inWhere == "开场")
         {
            if(this.currentFrame == 2)
            {
               this.skipOpening();
            }
            else
            {
               this.nextFrame();
            }
         }
         else if(this.inWhere == "玲珑宝塔")
         {
            if(this.currentFrame == 4)
            {
               this.gc.curStage = 8;
               this.gc.curLevel = 1;
               this.gc.eventManger.dispatchEvent(new CommonEvent("selectStageOver"));
               this.destory();
            }
            else
            {
               this.nextFrame();
            }
         }
      }
      
      public function gotoStageMap() : void
      {
         if(this.parent)
         {
            MainGame.getInstance().levelClear();
            GMain.getInstance().switchSence("showStageMap");
            this.parent.removeChild(this);
         }
      }
      
      private function skipOpening() : void
      {
         this.gc.eventManger.dispatchEvent(new CommonEvent("ShowOpenAnimationOver"));
         this.destory();
      }
      
      public function destory() : void
      {
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
      }
   }
}

