package export.bullet
{
   import base.BaseBullet;
   import base.BaseObject;
   import flash.geom.Point;
   
   public class ParabolaBullet extends BaseBullet
   {
      
      protected var distance:int;
      
      protected var isAddSpeed:Boolean = false;
      
      protected var funcWhenDistanceOver:Function;
      
      protected var addSpeedX:Number = 0;
      
      protected var addSpeedY:Number = 0;
      
      protected var moveTarget:BaseObject;
      
      public var addSpeedValue:Number = 0;
      
      private var gravity:Number = 1.4;
      
      private var frameCounter:int = 0;
      
      private const UPDATE_INTERVAL:int = 0;
      
      private var targetRotation:Number = 0;
      
      public function ParabolaBullet(param1:String, param2:String = "")
      {
         super(param1,param2);
      }
      
      override protected function step() : void
      {
         var _loc1_:Number = Number(NaN);
         var _loc2_:* = null;
         super.step();
         if(this.moveTarget)
         {
            if(!this.moveTarget.isDead() && !this.moveTarget.isReadyToDestroy)
            {
               _loc1_ = Math.sqrt(this.speed.x * this.speed.x + this.speed.y * this.speed.y);
               _loc2_ = AUtils.GetNextPointByTwoObj(this,this.moveTarget);
               _loc1_ += this.addSpeedValue;
               this.speed.x = Number(_loc2_.x) * _loc1_;
               this.speed.y = Number(_loc2_.y) * _loc1_;
            }
            else
            {
               this.moveTarget = null;
            }
         }
         if(imgMc)
         {
            imgMc.rotation = this.targetRotation;
         }
         this.x += this.speed.x;
         this.y += this.speed.y;
         this.speed.x += this.addSpeedX;
         this.speed.y += this.addSpeedY;
         this.speed.y += this.gravity;
         this.updateRotationAndSpeed();
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
            angle = Math.atan2(Math.abs(this.speed.y),Math.abs(this.speed.x));
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
      
      public function setGravity(param1:Number) : void
      {
         this.gravity = param1;
      }
      
      public function setDistance(param1:int, param2:Function = null) : void
      {
         this.distance = param1;
         this.funcWhenDistanceOver = param2;
      }
      
      public function setSpeed(param1:Number, param2:Number = 0) : void
      {
         this.speed.x = param1;
         this.speed.y = param2;
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

