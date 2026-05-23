package export.level.StageListener222Children
{
   import base.BaseObject;
   import com.greensock.*;
   import export.ThroughWall;
   import flash.events.*;
   
   public class Stage222Boat extends ThroughWall
   {
      
      private var sourceRole:BaseObject;
      
      private var intervalCount:int = 0;
      
      private var INTERVALCOUNTCONST:int = -1;
      
      public function Stage222Boat(param1:BaseObject, param2:int)
      {
         super();
         this.sourceRole = param1;
         this.INTERVALCOUNTCONST = param2;
         this.width = 130;
         this.height = 20;
         this.visible = false;
         this.setUserDataName("MagicBigBottleData");
      }
      
      override public function step() : void
      {
         super.step();
         var _loc1_:Number = 0;
         var _loc2_:Number = 0;
         if(Math.abs(this.x - Number(this.sourceRole.x)) > 30)
         {
            _loc1_ = Number(this.sourceRole.x) - this.x;
         }
         if(Math.abs(this.y - Number(this.sourceRole.y)) > 62)
         {
            _loc2_ = Number(this.sourceRole.y) - this.y;
         }
         TweenMax.killChildTweensOf(this);
         if(_loc1_ != 0)
         {
            if(_loc1_ > 0)
            {
               AUtils.flipHorizontal(this.userData,1);
            }
            else if(_loc1_ < 0)
            {
               AUtils.flipHorizontal(this.userData,-1);
            }
            TweenMax.to(this,0.4,{"x":this.x + _loc1_});
         }
         if(_loc2_ != 0)
         {
            TweenMax.to(this,0.25,{"y":this.y + _loc2_ + 70});
         }
         if(this.sourceRole.isReadyToDestroy)
         {
            this.destroy();
         }
         else if(this.INTERVALCOUNTCONST >= 0)
         {
            ++this.intervalCount;
            if(this.intervalCount >= this.INTERVALCOUNTCONST)
            {
               this.destroy();
               this.intervalCount = 0;
            }
         }
      }
      
      override public function destroy() : void
      {
         super.destroy();
         this.dispatchEvent(new Event("destroy"));
      }
   }
}

