package export.bullet
{
   import base.BaseBullet;
   import com.greensock.*;
   import flash.geom.*;
   
   public class StabBullet extends BaseBullet
   {
      
      public var speedValue:int = 0;
      
      private var addSpeedValue:int = 12;
      
      private var count:int = 0;
      
      private var isRush:Boolean = false;
      
      private var target:Point;
      
      private var source:Point;
      
      private var targetVectorMo:Point;
      
      private var targetRotation:int;
      
      private var turnTime:Number;
      
      public function StabBullet(param1:String, param2:Point, param3:Number, param4:Point = null, param5:String = "")
      {
         this.targetVectorMo = new Point(0,1);
         super(param1,param5);
         this.target = param2;
         this.source = param4;
         this.turnTime = param3;
         this.setRotation();
      }
      
      private function setRotation() : void
      {
         var k:Number = Number(NaN);
         this.speed = new Point();
         this.alpha = 0;
         if(this.target)
         {
            if(this.source)
            {
               this.targetVectorMo = AUtils.GetNextPointByTwoObj(this.source,this.target);
            }
            else
            {
               this.targetVectorMo = AUtils.GetNextPointByTwoObj(this,this.target);
            }
            if(this.targetVectorMo.y != 0)
            {
               k = -Number(this.targetVectorMo.x) / Number(this.targetVectorMo.y);
               this.targetRotation = Math.atan(k) * 180 / Math.PI;
               if(this.targetVectorMo.x < 0 && this.targetVectorMo.y > 0 || this.targetVectorMo.x > 0 && this.targetVectorMo.y > 0)
               {
                  this.targetRotation += 3 * 60;
               }
            }
            else if(this.targetVectorMo.x > this.x)
            {
               this.targetRotation = 90;
            }
            else
            {
               this.targetRotation = -90;
            }
         }
         else
         {
            this.targetRotation = 3 * 60;
         }
         TweenMax.to(this,0.1,{
            "alpha":1,
            "rotation":this.targetRotation,
            "onCompleteParams":[this],
            "onComplete":function(param1:StabBullet):*
            {
               param1.rush();
            }
         });
      }
      
      override protected function step() : void
      {
         super.step();
         if(this.isRush)
         {
            if(this.target)
            {
               this.x += Number(this.targetVectorMo.x) * (this.speedValue + this.addSpeedValue);
               this.y += Number(this.targetVectorMo.y) * (this.speedValue + this.addSpeedValue);
            }
            else
            {
               this.speed.x = 0;
               this.speed.y += 0.5;
               this.x += this.speed.x;
               this.y += this.speed.y;
            }
            this.addSpeedValue = this.addSpeedValue;
            ++this.count;
         }
         if(this.count > gc.frameClips * 10 || this.y > 1000 || this.y < -2500)
         {
            this.destroy();
         }
      }
      
      public function rush() : void
      {
         this.isRush = true;
      }
      
      override public function destroy() : void
      {
         super.destroy();
      }
   }
}

