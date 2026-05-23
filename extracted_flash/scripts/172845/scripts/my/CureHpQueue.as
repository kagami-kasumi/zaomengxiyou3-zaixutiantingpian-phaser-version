package my
{
   import config.*;
   import manager.*;
   
   public class CureHpQueue
   {
      
      private var queue:Array;
      
      private var showInterval:uint = 0;
      
      private var showIntervalCount:uint = 0;
      
      private var gc:Config;
      
      public function CureHpQueue()
      {
         this.queue = [];
         super();
         this.gc = Config.getInstance();
      }
      
      public function addCure(param1:int, param2:Number, param3:Number) : void
      {
         var _loc4_:* = undefined;
         if(this.gc.curStage != 98)
         {
            if(this.queue.length <= 5)
            {
               _loc4_ = undefined;
               _loc4_ = {};
               _loc4_.value = param1;
               _loc4_.posX = param2;
               _loc4_.posY = param3;
               _loc4_.resName = "bunum";
               this.queue.push(_loc4_);
            }
         }
      }
      
      public function addMpCure(param1:int, param2:Number, param3:Number) : void
      {
         var _loc4_:* = undefined;
         if(this.gc.curStage != 98)
         {
            if(this.queue.length <= 10)
            {
               _loc4_ = undefined;
               _loc4_ = {};
               _loc4_.value = param1;
               _loc4_.posX = param2;
               _loc4_.posY = param3;
               _loc4_.resName = "bulnum";
               this.queue.push(_loc4_);
            }
         }
      }
      
      public function addMpLose(param1:int, param2:Number, param3:Number) : void
      {
         var _loc4_:* = undefined;
         _loc4_ = {};
         _loc4_.value = param1;
         _loc4_.posX = param2;
         _loc4_.posY = param3;
         _loc4_.resName = "mp_";
         this.queue.push(_loc4_);
      }
      
      public function addHpLose(param1:int, param2:Number, param3:Number) : void
      {
         var _loc4_:* = undefined;
         if(this.gc.curStage != 98)
         {
            _loc4_ = undefined;
            _loc4_ = {};
            _loc4_.value = param1;
            _loc4_.posX = param2;
            _loc4_.posY = param3;
            _loc4_.resName = "pnum";
            this.queue.push(_loc4_);
         }
      }
      
      public function addMonsterHurt(param1:int, param2:Number, param3:Number) : void
      {
         var _loc4_:* = undefined;
         if(this.gc.curStage != 98)
         {
            if(this.queue.length <= 10)
            {
               _loc4_ = undefined;
               _loc4_ = {};
               _loc4_.value = param1;
               _loc4_.posX = param2;
               _loc4_.posY = param3;
               _loc4_.resName = "hurtnum";
               this.queue.push(_loc4_);
            }
         }
      }
      
      public function addMonsterCritHurt(param1:int, param2:Number, param3:Number) : void
      {
         var _loc4_:* = undefined;
         if(this.gc.curStage != 98)
         {
            if(this.queue.length <= 10)
            {
               _loc4_ = undefined;
               _loc4_ = {};
               _loc4_.value = param1;
               _loc4_.posX = param2;
               _loc4_.posY = param3;
               _loc4_.resName = "bnum";
               this.queue.push(_loc4_);
            }
         }
      }
      
      private function showCure() : void
      {
         if(this.queue.length > 5)
         {
            this.showSingleCure(-20,-20);
            this.showSingleCure(-10,-10);
            this.showSingleCure(0,0);
            this.showSingleCure(10,-10);
            this.showSingleCure(20,-20);
         }
         else
         {
            this.showSingleCure();
         }
      }
      
      private function showSingleCure(param1:Number = 0, param2:Number = 0) : void
      {
         var _loc3_:Object = this.queue.shift();
         var _loc4_:ANumber = ANumberManager.getInstance().createANumber();
         this.gc.gameSence.addChild(_loc4_);
         if(_loc3_.resName == "bunum")
         {
            this.showIntervalCount = 3;
         }
         else
         {
            this.showIntervalCount = 2;
         }
         _loc4_.aNumImage(_loc3_.resName,_loc3_.value,_loc3_.posX + param1,_loc3_.posY + param2,20);
      }
      
      public function step() : void
      {
         if(this.showInterval == 0)
         {
            if(this.queue.length > 0)
            {
               this.showCure();
               this.showInterval = this.showIntervalCount;
            }
         }
         if(this.showInterval > 0)
         {
            --this.showInterval;
         }
      }
      
      public function destroy() : void
      {
      }
   }
}

