package export.bullet
{
   import base.BaseBullet;
   import base.BaseObject;
   import flash.geom.Point;
   
   public class EnemyMoveBullet1 extends BaseBullet
   {
      
      protected var distance:int;
      
      protected var isAddSpeed:Boolean = false;
      
      protected var funcWhenDistanceOver:Function;
      
      protected var addSpeedX:Number = 0;
      
      protected var addSpeedY:Number = 0;
      
      protected var moveTarget:BaseObject;
      
      public var addSpeedValue:Number = 0;
      
      public function EnemyMoveBullet1(param1:String, param2:String = "")
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
         this.x += this.speed.x;
         this.y += this.speed.y;
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

