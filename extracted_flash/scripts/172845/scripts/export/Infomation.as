package export
{
   import com.greensock.*;
   import flash.display.Sprite;
   import flash.events.*;
   import flash.filters.*;
   import flash.text.*;
   import flash.utils.*;
   import my.*;
   
   public class Infomation extends Sprite
   {
      
      private var txtformat:TextFormat;
      
      private var txtname:TextField;
      
      private var timer:Timer;
      
      private var continueTime:Number = 1;
      
      public function Infomation()
      {
         this.txtformat = new TextFormat();
         this.txtname = new TextField();
         this.timer = new Timer(1000);
         super();
         with(this.txtname)
         {
            selectable = false;
            embedFonts = true;
            filters = [this.GlowEffect()];
         }
         with(this.txtformat)
         {
            color = "0x000000";
            bold = true;
            size = 30;
            align = "center";
            font = AllConsts.GAME_CONFIG_FONT;
         }
         this.addEventListener(Event.ADDED_TO_STAGE,this.added,false,0,true);
         this.addEventListener(Event.REMOVED_FROM_STAGE,this.removed,false,0,true);
         this.timer.addEventListener(TimerEvent.TIMER,this.onCount);
      }
      
      private function onCount(param1:TimerEvent) : void
      {
         if(this.timer.currentCount == this.continueTime + 1)
         {
            this.remove();
            this.timer.stop();
            this.timer.reset();
         }
         else if(this.timer.currentCount == this.continueTime)
         {
            TweenMax.to(this,0.5,{
               "y":240,
               "alpha":0
            });
         }
      }
      
      private function added(param1:Event) : void
      {
         this.x = 0;
         this.y = 270;
      }
      
      private function removed(param1:Event) : void
      {
      }
      
      public function setTxt(param1:String, param2:int = 1, param3:int = 30) : void
      {
         if(param1.length > 25)
         {
            param2++;
         }
         this.continueTime = param2;
         this.txtformat.size = param3;
         this.txtname.text = param1;
         this.txtname.setTextFormat(this.txtformat);
         this.alpha = 1;
         this.y = 270;
         this.timer.stop();
         this.timer.reset();
         this.timer.start();
         TweenLite.killTweensOf(this);
         if(!this.contains(this.txtname))
         {
            this.txtname.height = 40;
            this.txtname.width = 940;
            this.addChild(this.txtname);
         }
      }
      
      private function remove() : void
      {
         if(this.parent)
         {
            this.alpha = 1;
            this.y = 270;
            this.parent.removeChild(this);
         }
      }
      
      private function GlowEffect() : GlowFilter
      {
         return new GlowFilter(16777215,1,2,2,5.3,3,false,false);
      }
   }
}

