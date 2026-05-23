package export.bullet
{
   import base.*;
   import flash.display.*;
   import flash.geom.*;
   
   public class TraceTargetBullet extends BaseBullet
   {
      
      private var moveSpeed:Number = 35;
      
      private var direction:Point = new Point(0,-1);
      
      private var target:BaseObject;
      
      private var angleLimit:Number = 10;
      
      private var isCircleState:Boolean = true;
      
      private var lockFrame:int = 16;
      
      private var lockFrames:int = 16;
      
      private var straightFrames:int;
      
      private var maxStraightFrames:int = 24;
      
      private var minStraightFrames:int = 12;
      
      protected var gameWorld:Sprite;
      
      private var bulletSymbol:DisplayObject;
      
      protected var father:BaseObject;
      
      public function TraceTargetBullet(param1:String, father:BaseObject, symbolClass:Class, param2:String = "")
      {
         super(param1,param2);
         this.updateCircleState();
         this.initBulletSymbol(symbolClass);
         this.father = father;
         if(!this.target)
         {
            this.enterStraightState();
         }
      }
      
      protected function initBulletSymbol(symbolClass:Class) : void
      {
         var mc:MovieClip = null;
         if(Boolean(imgMc) && contains(imgMc))
         {
            removeChild(imgMc);
         }
         this.bulletSymbol = new symbolClass();
         if(this.bulletSymbol is MovieClip)
         {
            mc = this.bulletSymbol as MovieClip;
         }
         addChild(this.bulletSymbol);
         rotation = 0;
         if(imgMc1)
         {
            this.imgMc1.rotation = 0;
         }
      }
      
      override protected function step() : void
      {
         super.step();
         this.moveAndTrack();
         trace("当前目标:",this.target);
      }
      
      private function moveAndTrack() : void
      {
         x += this.direction.x * this.moveSpeed;
         y += this.direction.y * this.moveSpeed;
         var angleInRadians:Number = Math.atan2(this.direction.y,this.direction.x);
         var angleInDegrees:Number = angleInRadians * 180 / Math.PI;
         if(this.bulletSymbol)
         {
            this.bulletSymbol.rotation = angleInDegrees;
         }
         if(imgMc1)
         {
            this.imgMc1.rotation = angleInDegrees;
         }
         if(Boolean(this.target) && (Boolean(this.target.isDead()) || Boolean(this.target.isReadyToDestroy)))
         {
            this.target = null;
            this.findNewTarget();
         }
         if(this.isCircleState)
         {
            this.updateCircleState();
         }
         else
         {
            this.updateStraightState();
         }
         if(!this.target)
         {
            this.findNewTarget();
         }
      }
      
      protected function updateCircleState() : void
      {
         var currentAngle:Number = NaN;
         var targetAngle:Number = NaN;
         var diff1:Number = NaN;
         var diff2:Number = NaN;
         var minAngleDiff:Number = NaN;
         var maxLockAngleDeg:Number = NaN;
         var adjustedAngle:Number = NaN;
         var adjustedRad:Number = NaN;
         var smoothFactor:Number = NaN;
         if(Boolean(this.target) && this.lockFrames > 0)
         {
            currentAngle = Number(this.radToDeg(Math.atan2(this.direction.y,this.direction.x)));
            targetAngle = Number(this.radToDeg(Math.atan2(this.target.y - y,this.target.x - x)));
            currentAngle = Number(this.normalizeAngle(currentAngle));
            targetAngle = Number(this.normalizeAngle(targetAngle));
            diff1 = targetAngle - currentAngle;
            diff2 = diff1 > 0 ? diff1 - 360 : diff1 + 360;
            minAngleDiff = Math.abs(diff1) < Math.abs(diff2) ? diff1 : diff2;
            maxLockAngleDeg = Number(this.radToDeg(this.angleLimit));
            if(Math.abs(minAngleDiff) > maxLockAngleDeg)
            {
               adjustedAngle = currentAngle + (minAngleDiff > 0 ? maxLockAngleDeg : -maxLockAngleDeg);
            }
            else
            {
               smoothFactor = 0.228;
               adjustedAngle = currentAngle + minAngleDiff * smoothFactor;
            }
            adjustedAngle = Number(this.normalizeAngle(adjustedAngle));
            adjustedRad = Number(this.degToRad(adjustedAngle));
            this.direction.x = Math.cos(adjustedRad);
            this.direction.y = Math.sin(adjustedRad);
            --this.lockFrames;
         }
         else
         {
            this.enterStraightState();
         }
      }
      
      private function normalizeAngle(angle:Number) : Number
      {
         angle %= 360;
         if(angle < 0)
         {
            angle += 360;
         }
         return angle == 360 ? 0 : angle;
      }
      
      private function radToDeg(rad:Number) : Number
      {
         return rad * 180 / Math.PI;
      }
      
      private function degToRad(deg:Number) : Number
      {
         return deg * Math.PI / 180;
      }
      
      protected function updateStraightState() : void
      {
         --this.straightFrames;
         if(this.straightFrames <= 0)
         {
            this.enterCircleState();
         }
      }
      
      protected function enterCircleState() : void
      {
         this.isCircleState = true;
         this.lockFrames = this.lockFrame;
         if(!this.target)
         {
            this.findNewTarget();
         }
      }
      
      public function enterStraightState() : void
      {
         this.isCircleState = false;
         this.straightFrames = Math.floor(Math.random() * (this.maxStraightFrames - this.minStraightFrames + 1)) + this.minStraightFrames;
      }
      
      public function findNewTarget() : void
      {
         var enemy:BaseObject = null;
         var distanceX:Number = NaN;
         var distanceY:Number = NaN;
         var distance:Number = NaN;
         if(!this.father || this.father.isDead() || this.father.isReadyToDestroy)
         {
            this.isCircleState = false;
            return;
         }
         var closestTarget:BaseObject = null;
         var shortestDistance:Number = Number.MAX_VALUE;
         var monsters:Array = gc.pWorld.monsterArray;
         for(var i:int = 0; i < monsters.length; i++)
         {
            enemy = monsters[i] as BaseObject;
            if(Boolean(enemy) && Boolean(!enemy.isDead()) && !enemy.isReadyToDestroy)
            {
               distanceX = enemy.x - this.father.x;
               distanceY = enemy.y - this.father.y;
               distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
               if(distance < shortestDistance)
               {
                  shortestDistance = distance;
                  closestTarget = enemy;
               }
            }
         }
         this.target = closestTarget;
         if(!this.target)
         {
            this.isCircleState = false;
         }
         else if(!this.isCircleState)
         {
            this.enterCircleState();
         }
      }
      
      public function setTarget(newTarget:BaseObject) : void
      {
         this.target = newTarget;
         if(Boolean(this.target) && !this.isCircleState)
         {
            this.enterCircleState();
         }
      }
      
      public function setMoveSpeed(value:Number) : void
      {
         this.moveSpeed = value;
         this.updateCircleState();
      }
      
      public function setMaxRotationAngle(degrees:Number) : void
      {
         this.angleLimit = degrees * Math.PI / 180;
      }
      
      public function setLockFrame(param1:int) : void
      {
         this.lockFrames = param1;
         this.lockFrame = param1;
      }
      
      public function setmaxStraightFrames(param1:int) : void
      {
         this.maxStraightFrames = param1;
      }
      
      public function setminStraightFrames(param1:int) : void
      {
         this.minStraightFrames = param1;
      }
      
      override public function destroy() : void
      {
         if(Boolean(this.bulletSymbol) && contains(this.bulletSymbol))
         {
            removeChild(this.bulletSymbol);
            this.bulletSymbol = null;
         }
         trace("销毁追踪子弹");
         super.destroy();
      }
   }
}

