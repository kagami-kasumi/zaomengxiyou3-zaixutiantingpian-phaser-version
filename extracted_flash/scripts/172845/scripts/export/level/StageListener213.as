package export.level
{
   import base.BaseLevelListenering;
   import export.level.StageListener213Children.*;
   
   public class StageListener213 extends BaseLevelListenering
   {
      
      private var lightPointArray:Array;
      
      private var jiguanArray:Array;
      
      private var stone:StageListener213stone;
      
      public function StageListener213()
      {
         this.lightPointArray = [[1844,250],[2582,250],[3350,250],[4260,250]];
         this.jiguanArray = [];
         super();
         waitForRegisterDataArray = ["Monster119","Monster126","Monster125"];
      }
      
      override public function step() : void
      {
         var _loc1_:* = undefined;
         var _loc2_:Boolean = false;
         super.step();
         if(this.jiguanArray.length > 0)
         {
            _loc2_ = true;
            for each(_loc1_ in this.jiguanArray)
            {
               _loc1_.step();
               if(_loc1_.state == 0)
               {
                  _loc2_ = false;
               }
            }
            if(!this.stone)
            {
               if(_loc2_ == true)
               {
                  this.stone = new StageListener213stone();
                  this.stone.x = 3852;
                  this.stone.y = 85;
                  gc.gameSence.addChild(this.stone);
               }
            }
         }
         if(this.stone)
         {
            this.stone.step();
         }
      }
      
      override public function start() : void
      {
         var _loc1_:* = undefined;
         var _loc2_:* = null;
         for each(_loc1_ in this.lightPointArray)
         {
            _loc2_ = new StageListener213jiguan();
            _loc2_.x = _loc1_[0];
            _loc2_.y = _loc1_[1];
            gc.gameSence.addChild(_loc2_);
            this.jiguanArray.push(_loc2_);
         }
         super.start();
      }
      
      override public function destroy() : void
      {
         super.destroy();
      }
   }
}

