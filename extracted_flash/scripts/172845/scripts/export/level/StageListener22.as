package export.level
{
   import base.BaseLevelListenering;
   import flash.display.*;
   
   public class StageListener22 extends BaseLevelListenering
   {
      
      private var fireThronArray:Array;
      
      public function StageListener22()
      {
         this.fireThronArray = [];
         super();
         waitForRegisterDataArray = ["Monster16","Monster9","Monster10","Monster19"];
      }
      
      override public function start() : void
      {
         var _loc1_:* = null;
         super.start();
         var _loc2_:uint = uint(gc.gameSence.numChildren);
         var _loc3_:int = 0;
         while(_loc3_ < _loc2_)
         {
            _loc1_ = gc.gameSence.getChildAt(_loc3_);
            if(_loc1_ is MovieClip)
            {
               if(MovieClip(_loc1_).getChildByName("isFireThron"))
               {
                  this.fireThronArray.push(_loc1_);
               }
            }
            _loc3_++;
         }
      }
      
      override public function step() : void
      {
         var _loc1_:* = null;
         super.step();
         for each(_loc1_ in this.fireThronArray)
         {
            _loc1_.step();
         }
      }
      
      override public function destroy() : void
      {
         super.destroy();
         this.fireThronArray = [];
      }
   }
}

