package export.bullet
{
   import base.BaseBullet;
   import base.BaseObject;
   import flash.geom.*;
   import flash.utils.*;
   
   public class S_ShapeMoveBullet extends BaseBullet
   {
      
      protected var distance:int;
      
      protected var isAddSpeed:Boolean = false;
      
      protected var funcWhenDistanceOver:Function;
      
      protected var addSpeedX:Number = 0;
      
      protected var addSpeedY:Number = 0;
      
      protected var moveTarget:BaseObject;
      
      public var addSpeedValue:Number = 0;
      
      private var speedx:Number = 0;
      
      private var speedy:Number = 0;
      
      private var _swingAmplitude:Number = 95;
      
      private var _swingFrequency:Number = 0.12566370614359174;
      
      private var _swingTime:Number = 0;
      
      private var _baseSpeed:Point = new Point();
      
      private var zhengAndFu:int = -1;
      
      private var _centerLineY:Number = 0;
      
      private var _isInitialized:Boolean = false;
      
      private var startTime:int;
      
      private var elapsed:Number;
      
      public function S_ShapeMoveBullet(param1:String, param2:String = "")
      {
         super(param1,param2);
         this.startTime = getTimer();
      }
      
      override protected function step() : void
      {
         super.step();
         if(this._baseSpeed.length == 0)
         {
            this._baseSpeed.x = this.speed.x;
            this._baseSpeed.y = this.speed.y;
         }
         if(!this._isInitialized)
         {
            if(this._centerLineY == 0)
            {
               this._centerLineY = this.y;
            }
            this._isInitialized = true;
         }
         this._swingTime += this._swingFrequency;
         var swingOffset:Number = Math.cos(this._swingTime) * this._swingFrequency * this._swingAmplitude * this.zhengAndFu;
         var perpDirection:Point = new Point(-this._baseSpeed.y,this._baseSpeed.x);
         perpDirection.normalize(1);
         this.y += this.speed.y + swingOffset;
         this.x += this.speed.x + perpDirection.x * swingOffset;
         this.speedx = this.speed.x + perpDirection.x * swingOffset;
         this.speedy = this.speed.y + swingOffset;
         this.updateRotation();
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
      
      private function updateRotation() : void
      {
         var angleDeg:Number = 0;
         if(this.transform.matrix.a > 0)
         {
            angleDeg = -(Math.atan2(this.speedy,this.speedx) * (-180 / Math.PI) + 180);
         }
         else
         {
            angleDeg = Math.atan2(this.speedy,this.speedx) * (-180 / Math.PI);
         }
         if(imgMc != null)
         {
            imgMc.rotation = angleDeg;
         }
         if(imgMc1 != null)
         {
            imgMc1.rotation = angleDeg;
         }
      }
      
      public function setzhengfu(param1:int) : void
      {
         this.zhengAndFu = param1;
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

