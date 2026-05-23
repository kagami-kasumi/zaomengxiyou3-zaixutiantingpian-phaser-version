package base
{
   import World.PhysicsWorld;
   import config.*;
   import flash.display.MovieClip;
   import flash.events.*;
   import my.*;
   
   [Embed(source="/_assets/assets.swf", symbol="symbol102")]
   public class MonsterAppearPoint extends MovieClip
   {
      
      public var delay:int;
      
      public var interval:Number;
      
      public var totalNum:int;
      
      public var enemyType:int;
      
      public var isRandom:Boolean;
      
      public var stopPointIdx:int;
      
      public var monsterDisapperaPoint:MovieClip;
      
      private var pWorld:PhysicsWorld;
      
      private var count:int = 0;
      
      private var isStart:Boolean;
      
      private var gc:Config;
      
      private var currentCount:int = 0;
      
      public var isOver:Boolean;
      
      private var isReady:Boolean;
      
      private var randomArray:Array;
      
      public function MonsterAppearPoint()
      {
         this.randomArray = [1,2,4,5,7,8,11,12,13];
         super();
         this.gc = Config.getInstance();
         this.addEventListener(Event.REMOVED_FROM_STAGE,this.__removed,false,0,true);
      }
      
      private function __removed(param1:Event) : void
      {
         this.removeEventListener(Event.ENTER_FRAME,this.__step);
      }
      
      public function start() : void
      {
         if(!this.hasEventListener(Event.ENTER_FRAME))
         {
            this.addEventListener(Event.ENTER_FRAME,this.__step);
         }
      }
      
      public function __step(param1:Event) : void
      {
         var _loc2_:Number = Number(NaN);
         var _loc3_:int = 0;
         if(this.gc.isStopGame)
         {
            return;
         }
         if(!this.isStart)
         {
            if(Number(this.count) / Number(this.gc.frameClips) >= this.delay / this.gc.SummonMonsterSpeed)
            {
               this.isStart = true;
               this.count = 0;
            }
         }
         if(this.isStart)
         {
            if(this.currentCount < this.totalNum)
            {
               if(Number(this.count) / Number(this.gc.frameClips) >= this.interval / this.gc.SummonMonsterSpeed)
               {
                  this.isReady = true;
               }
            }
            if(Number(this.count) / Number(this.gc.frameClips) >= this.interval / this.gc.SummonMonsterSpeed)
            {
               this.count = 0;
            }
         }
         if(this.isReady)
         {
            if(this.gc.pWorld.monsterArray.length < this.gc.maxMonsterPerScreen)
            {
               MainGame.getInstance().createMonster(this.enemyType,this.x,this.y);
               ++this.currentCount;
               this.isReady = false;
            }
         }
         if(this.currentCount >= this.totalNum)
         {
            this.isOver = true;
            if(this.parent)
            {
               this.parent.removeChild(this);
               _loc3_ = int(this.gc.pWorld.getMonsterAppearArray().indexOf(this));
               if(_loc3_ != -1)
               {
                  this.gc.pWorld.getMonsterAppearArray().splice(_loc3_,1);
               }
            }
         }
         if(!this.isReady)
         {
            ++this.count;
         }
      }
   }
}

