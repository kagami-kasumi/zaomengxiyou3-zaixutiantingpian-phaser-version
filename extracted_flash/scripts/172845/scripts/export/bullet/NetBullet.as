package export.bullet
{
   public class NetBullet extends SpecialEffectBullet
   {
      
      public var controlArray:Array;
      
      private var leftPointX:int = 0;
      
      private var rightPointX:int = 0;
      
      private var topPointY:int = 0;
      
      public function NetBullet(param1:String, param2:String = "")
      {
         this.controlArray = [];
         super(param1,param2);
      }
      
      override public function step2() : void
      {
         var _loc1_:* = undefined;
         if(this.getImgMc().currentFrame == 1)
         {
            this.leftPointX = this.x - this.getImgMc().width / 2;
            this.rightPointX = this.x + this.getImgMc().width / 2;
            this.topPointY = this.y - this.getImgMc().height / 2;
         }
         for each(_loc1_ in gc.getPlayerAndPetArray())
         {
            if(this.controlArray.indexOf(_loc1_) == -1)
            {
               if(_loc1_.x > this.leftPointX && _loc1_.x < this.rightPointX && _loc1_.y > this.topPointY)
               {
                  this.controlArray.push(_loc1_);
               }
            }
         }
         for each(_loc1_ in this.controlArray)
         {
            if(_loc1_.x < this.leftPointX)
            {
               _loc1_.x = this.leftPointX;
            }
            else if(_loc1_.x > this.rightPointX)
            {
               _loc1_.x = this.rightPointX;
            }
            if(_loc1_.y < this.topPointY)
            {
               _loc1_.y = this.topPointY;
            }
         }
         super.step2();
      }
      
      override public function destroy() : void
      {
         super.destroy();
         this.controlArray.length = 0;
      }
   }
}

