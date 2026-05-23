package export.bullet
{
   import base.*;
   import flash.geom.Point;
   import my.*;
   
   public class ReflectiveBullet extends BaseBullet
   {
      
      private var distance:int;
      
      private var isAddSpeed:Boolean = false;
      
      private var funcWhenDistanceOver:Function;
      
      private var addSpeedX:Number = 0;
      
      private var addSpeedY:Number = 0;
      
      private var followMinHp:Boolean = false;
      
      private var followMaxHp:Boolean = false;
      
      protected var moveTarget:BaseObject;
      
      public var addSpeedValue:Number = 0.02;
      
      private var canTurnrotation:Boolean = false;
      
      private var speedx:Number = 0;
      
      public function ReflectiveBullet(param1:String, param2:String = "")
      {
         this.addSpeedValue = 0.02;
         super(param1,param2);
         this.setDirect(1);
      }
      
      override protected function step() : void
      {
         var _loc3_:BaseMonster = null;
         var _loc4_:BaseMonster = null;
         var speexNum:Number = Number(NaN);
         super.step();
         var p:Point = null;
         if(this.moveTarget)
         {
            if(!this.moveTarget.isDead() && !this.moveTarget.isReadyToDestroy)
            {
               speexNum = Math.sqrt(this.speed.x * this.speed.x + this.speed.y * this.speed.y);
               p = AUtils.GetNextPointByTwoObj(this,this.moveTarget);
               speexNum += this.addSpeedValue;
               if(this.imgMc)
               {
                  if(this.canTurnrotation)
                  {
                     this.imgMc.rotation = Math.atan2(p.y,p.x) * -180 / Math.PI;
                  }
                  if(this.canTurnrotation)
                  {
                     if(this.x > this.moveTarget.x)
                     {
                        this.speed.x = -10.6;
                     }
                     else
                     {
                        this.speed.x = 10.6;
                     }
                  }
                  else if(this.x > this.moveTarget.x)
                  {
                     this.speed.x = -this.speedx;
                  }
                  else
                  {
                     this.speed.x = this.speedx;
                  }
                  if(this.canTurnrotation)
                  {
                     this.speed.y = this.speed.x * Math.tan(-this.imgMc.rotation * Math.PI / 180);
                  }
                  else if(this.y > this.moveTarget.y + 31)
                  {
                     this.speed.y = -9;
                  }
                  else
                  {
                     this.speed.y = 9;
                  }
               }
            }
            else if(this.sourceRole is BaseHero)
            {
               if(this.followMinHp)
               {
                  _loc3_ = null;
                  _loc4_ = null;
                  for each(_loc3_ in gc.pWorld.monsterArray)
                  {
                     if(!_loc4_)
                     {
                        _loc4_ = _loc3_;
                     }
                     if(_loc4_.getHp() > _loc3_.getHp() && !gc.protectedPerproty.getProperty(_loc3_,"isYourFather"))
                     {
                        _loc4_ = _loc3_;
                     }
                  }
                  this.moveTarget = _loc4_;
               }
               else if(this.followMaxHp)
               {
                  _loc3_ = null;
                  _loc4_ = null;
                  for each(_loc3_ in gc.pWorld.monsterArray)
                  {
                     if(!_loc4_)
                     {
                        _loc4_ = _loc3_;
                     }
                     if(_loc4_.getHp() < _loc3_.getHp() && !gc.protectedPerproty.getProperty(_loc3_,"isYourFather"))
                     {
                        _loc4_ = _loc3_;
                     }
                  }
                  this.moveTarget = _loc4_;
               }
            }
            else
            {
               this.moveTarget = null;
            }
         }
         if(this.speed.y > 35)
         {
            this.speed.y = 35;
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
      
      override protected function checkHitWall() : void
      {
         var wall:Wall = null;
         var walls:Array = this.gc.pWorld.getWallArray();
         var hited:Boolean = false;
         for(var i:int = 0; i < walls.length; i++)
         {
            wall = walls[i] as Wall;
            hited = Boolean(HitTest.complexHitTestObject(this.imgMc,wall));
            if(this.imgMc1 != null)
            {
               hited = Boolean(HitTest.complexHitTestObject(this.imgMc1,wall));
            }
            if(wall.width >= 5 && hited)
            {
               this.reflectDirection(wall);
               break;
            }
         }
      }
      
      private function reflectDirection(wall:Wall) : void
      {
         var isVerticalWall:Boolean = wall.y <= 0 || wall.y >= 500;
         if(!isVerticalWall)
         {
            this.speed.x *= -1;
            this.setDirect(this.getDirect() == 1 ? 0 : -1);
            if(this.speed.x > 0)
            {
               this.x += this.width * 1;
            }
            else
            {
               this.x -= this.width * 1;
            }
            this.x += this.speed.x > 0 ? 6 : -6;
         }
         else
         {
            this.speed.y *= -1;
            this.imgMc.scaleY *= -1;
            if(this.imgMc1 != null)
            {
               this.imgMc1.scaleY *= -1;
            }
            if(this.speed.y < 0)
            {
               this.y += this.height * 1;
            }
            else
            {
               this.y -= this.height * 1;
            }
            this.y += this.speed.y > 0 ? 6 : -6;
         }
      }
      
      public function setcanTurnrotation(param1:Boolean) : void
      {
         this.canTurnrotation = param1;
      }
      
      public function setAddSpeed(param1:Number, param2:Number) : void
      {
         this.addSpeedX = param1;
         this.addSpeedY = param2;
      }
      
      public function setMoveTarget(t:BaseObject) : void
      {
         this.moveTarget = t;
      }
      
      public function setMoveTargetAndFollowMinHp(t:BaseObject) : void
      {
         this.moveTarget = t;
         this.followMinHp = true;
         this.followMaxHp = false;
      }
      
      public function setMoveTargetAndFollowMaxHp(t:BaseObject) : void
      {
         this.moveTarget = t;
         this.followMaxHp = true;
         this.followMinHp = false;
      }
      
      public function setDistance(param1:int, param2:Function = null) : void
      {
         this.distance = param1;
         this.funcWhenDistanceOver = param2;
      }
      
      public function setSpeed(param1:Number, param2:Number = 0) : void
      {
         this.speedx = param1;
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

