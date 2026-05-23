package export.bullet
{
   import base.BaseBullet;
   import base.BaseObject;
   import flash.geom.Point;
   
   public class EnemyMoveBullet2 extends BaseBullet
   {
      
      private var frameCounter:int = 15;
      
      private const UPDATE_INTERVAL:int = 10;
      
      private var initialSpeedValue:Number = 0;
      
      private var targetRotation:Number = 0;
      
      private var currentRotation:Number = 0;
      
      private var rotationSpeed:Number = 0.1;
      
      protected var distance:int;
      
      protected var isAddSpeed:Boolean = false;
      
      protected var funcWhenDistanceOver:Function;
      
      protected var addSpeedX:Number = 0;
      
      protected var addSpeedY:Number = 0;
      
      protected var moveTarget:BaseObject;
      
      public function EnemyMoveBullet2(param1:String, param2:String = "")
      {
         super(param1,param2);
      }
      
      override protected function step() : void
      {
         super.step();
         this.x += this.speed.x;
         this.y += this.speed.y;
         ++this.frameCounter;
         if(this.frameCounter >= this.UPDATE_INTERVAL)
         {
            this.updateRotationAndSpeed();
            this.frameCounter = 0;
         }
         var rotationDiff:Number = this.targetRotation - this.currentRotation;
         if(rotationDiff > 180)
         {
            rotationDiff -= 360;
         }
         if(rotationDiff < -180)
         {
            rotationDiff += 360;
         }
         this.currentRotation += rotationDiff * this.rotationSpeed;
         if(imgMc)
         {
            imgMc.rotation = this.currentRotation;
         }
         this.speed.x += this.addSpeedX;
         this.speed.y += this.addSpeedY;
         this.distance -= Math.sqrt(this.speed.x * this.speed.x + this.speed.y * this.speed.y);
         if(this.distance <= 0)
         {
            if(this.funcWhenDistanceOver != null)
            {
               this.funcWhenDistanceOver(this.x,this.y);
            }
            this.destroy();
         }
      }
      
      private function updateRotationAndSpeed() : void
      {
         var p:Point = null;
         var angle:Number = NaN;
         var angle1:Number = NaN;
         if(Boolean(this.moveTarget) && Boolean(!this.moveTarget.isDead()) && !this.moveTarget.isReadyToDestroy)
         {
            p = null;
            p = AUtils.GetNextPointByTwoObj(this,this.moveTarget);
            angle = Math.atan2(p.y,p.x);
            angle1 = Math.atan2(this.moveTarget.y - this.y,this.moveTarget.x - this.x);
            trace("a:" + this.transform.matrix.a);
            if(this.transform.matrix.a > 0)
            {
               this.targetRotation = -(angle * (-180 / Math.PI) + 180);
            }
            else
            {
               this.targetRotation = angle * (-180 / Math.PI);
            }
            trace("rotation:" + this.targetRotation);
            this.speed.x = Math.cos(angle1) * this.initialSpeedValue;
            this.speed.y = Math.sin(angle1) * this.initialSpeedValue;
            if(this.speed.x > 0)
            {
               this.direct = 1;
            }
            else
            {
               this.direct = -1;
            }
         }
         else if(this.moveTarget)
         {
            this.moveTarget = null;
         }
      }
      
      public function setMoveTarget(param1:BaseObject) : void
      {
         this.moveTarget = param1;
      }
      
      public function getMoveTarget() : BaseObject
      {
         return this.moveTarget;
      }
      
      public function setAddSpeed(param1:Number, param2:Number) : void
      {
         this.addSpeedX = param1;
         this.addSpeedY = param2;
      }
      
      public function setDistance(param1:int, param2:Function = null) : void
      {
         this.distance = param1;
         this.funcWhenDistanceOver = param2;
      }
      
      public function setSpeed(param1:Number) : void
      {
         this.initialSpeedValue = param1;
      }
      
      public function getSpeed() : Point
      {
         return this.speed;
      }
      
      override public function setRole(param1:BaseObject) : void
      {
         super.setRole(param1);
      }
   }
}

