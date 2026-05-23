package export.muti
{
   import com.greensock.*;
   import config.*;
   import flash.display.*;
   import flash.events.*;
   import flash.utils.*;
   
   public class NodeInfo
   {
      
      private var _GameMode:uint;
      
      private var _MaxVisitors:uint;
      
      private var _ltdVisitors:uint;
      
      private var _roomName:String;
      
      private var _mpInfo:uint;
      
      private var _averLevel:uint;
      
      private var _singleIdPlayerNum:uint;
      
      private var isStart:Boolean = false;
      
      private var isOver:Boolean = false;
      
      private var timeCount:uint;
      
      private var showResultTimer:Timer;
      
      private var resultBm:Bitmap;
      
      private var gc:Config;
      
      public function NodeInfo()
      {
         this.showResultTimer = new Timer(1000);
         super();
      }
      
      public function start() : void
      {
         this.gc = Config.getInstance();
         this.timeCount = 0;
         this.isStart = true;
         this.isOver = false;
         if(this._GameMode == ArenaSprite.ARENASPRITE_MODE_1V1 || this._GameMode == ArenaSprite.ARENASPRITE_MODE_HUNZHAN)
         {
            this.gc.obbsiteArray = this.gc.pWorld.getOtherHeroArray();
         }
      }
      
      public function step() : void
      {
         if(!this.isStart || Boolean(this.isOver))
         {
            return;
         }
         ++this.timeCount;
         if(this._GameMode == ArenaSprite.ARENASPRITE_MODE_1V1)
         {
            if(this.gc.obbsiteArray.length == 0)
            {
               this.victory();
            }
            else if(this.gc.pWorld.heroArray.length == 0)
            {
               this.lose();
            }
         }
         else if(this._GameMode == ArenaSprite.ARENASPRITE_MODE_HUNZHAN)
         {
            if(this.gc.obbsiteArray.length == 0)
            {
               this.victory();
            }
            else if(this.gc.pWorld.heroArray.length == 0)
            {
               this.lose();
            }
         }
      }
      
      private function victory() : void
      {
         this.isStart = false;
         this.isOver = true;
         this.resultBm = AUtils.getImageObj("pkVictor") as Bitmap;
         this.resultBm.x = 5 * 60;
         this.resultBm.y = 200;
         this.gc.gameInfo.addChild(this.resultBm);
         if(!this.showResultTimer.hasEventListener(TimerEvent.TIMER))
         {
            this.showResultTimer.addEventListener(TimerEvent.TIMER,this.__timer);
         }
         this.showResultTimer.start();
      }
      
      private function lose() : void
      {
         this.isStart = false;
         this.isOver = true;
         this.resultBm = AUtils.getImageObj("pkLose") as Bitmap;
         this.resultBm.x = 5 * 60;
         this.resultBm.y = 200;
         this.gc.gameInfo.addChild(this.resultBm);
         if(!this.showResultTimer.hasEventListener(TimerEvent.TIMER))
         {
            this.showResultTimer.addEventListener(TimerEvent.TIMER,this.__timer);
         }
         this.showResultTimer.start();
      }
      
      private function __timer(param1:TimerEvent) : void
      {
         if(this.showResultTimer.currentCount == 2)
         {
            this.removeResult();
         }
         else if(this.showResultTimer.currentCount == 3)
         {
            this.doWhenQuitRoom();
         }
      }
      
      private function removeResult() : void
      {
         if(Boolean(this.resultBm) && Boolean(this.gc.gameInfo.contains(this.resultBm)))
         {
            this.gc.gameInfo.removeChild(this.resultBm);
         }
      }
      
      public function isStartIng() : Boolean
      {
         return this.isStart;
      }
      
      public function initWhenJoinRoom() : void
      {
         this.isStart = false;
         this.isOver = false;
         this.timeCount = 0;
      }
      
      private function doWhenQuitRoom() : void
      {
         TweenMax.killAll();
         this.gc.quitRoom();
         this.showResultTimer.stop();
         this.showResultTimer.reset();
         if(this.showResultTimer.hasEventListener(TimerEvent.TIMER))
         {
            this.showResultTimer.removeEventListener(TimerEvent.TIMER,this.__timer);
         }
         this.initWhenJoinRoom();
      }
      
      public function get ltdVisitors() : uint
      {
         return this._ltdVisitors;
      }
      
      public function set ltdVisitors(param1:uint) : void
      {
         this._ltdVisitors = param1;
      }
      
      public function get singleIdPlayerNum() : uint
      {
         return this._singleIdPlayerNum;
      }
      
      public function set singleIdPlayerNum(param1:uint) : void
      {
         this._singleIdPlayerNum = param1;
      }
      
      public function get averLevel() : uint
      {
         return this._averLevel;
      }
      
      public function set averLevel(param1:uint) : void
      {
         this._averLevel = param1;
      }
      
      public function get mpInfo() : uint
      {
         return this._mpInfo;
      }
      
      public function set mpInfo(param1:uint) : void
      {
         this._mpInfo = param1;
      }
      
      public function get roomName() : String
      {
         return this._roomName;
      }
      
      public function set roomName(param1:String) : void
      {
         this._roomName = param1;
      }
      
      public function get MaxVisitors() : uint
      {
         return this._MaxVisitors;
      }
      
      public function set MaxVisitors(param1:uint) : void
      {
         this._MaxVisitors = param1;
      }
      
      public function get GameMode() : uint
      {
         return this._GameMode;
      }
      
      public function set GameMode(param1:uint) : void
      {
         this._GameMode = param1;
      }
   }
}

