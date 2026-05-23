package base
{
   import config.*;
   import flash.display.*;
   import flash.events.*;
   import flash.geom.*;
   
   public class Wall extends MovieClip
   {
      
      public var speedX:Number = 0;
      
      public var speedY:Number = 0;
      
      public var moveTime:int = 0;
      
      public var userDataName:String = "";
      
      protected var equationX:Number;
      
      protected var constX:Number;
      
      protected var equationX2:Number;
      
      protected var sourceRotation:int;
      
      protected var minX:Number;
      
      protected var maxX:Number;
      
      protected var gc:Config;
      
      protected var userData:MovieClip;
      
      public function Wall()
      {
         super();
         this.gc = Config.getInstance();
         this.sourceRotation = Math.round(this.rotation);
         this.rotation = 0;
         var _loc1_:Number = this.height;
         var _loc2_:Number = this.width;
         this.rotation = this.sourceRotation;
         if(this.rotation != 90)
         {
            this.equationX = Math.tan(this.rotation * Math.PI / 180);
         }
         else
         {
            this.equationX = 1;
         }
         this.equationX2 = -1 / Number(this.equationX);
         var _loc3_:Number = _loc1_ / 2 / Math.cos(Math.abs(this.rotation * Math.PI / 180));
         this.constX = -Number(this.equationX) * this.x + this.y - _loc3_;
         if(this.rotation < 0)
         {
            this.maxX = (this.y - this.height / 2 - Number(this.constX)) / Number(this.equationX);
            this.minX = this.x - this.width / 2;
         }
         else
         {
            this.maxX = this.x + this.width / 2;
            this.minX = (this.y - this.height / 2 - Number(this.constX)) / Number(this.equationX);
         }
         this.addEventListener(Event.ADDED_TO_STAGE,this.__added);
      }
      
      public function setYByRole(param1:*) : Point
      {
         var _loc2_:Number = Number(NaN);
         var _loc3_:Number = Number(NaN);
         var _loc4_:Number = Number(NaN);
         var _loc5_:Point = new Point();
         _loc2_ = Number(this.equationX) * Number(param1.x) + this.constX;
         if(_loc2_ > param1.y)
         {
            param1.standInObj = this;
         }
         if(!param1.isWalkOrRun() && !param1.isBeAttacking() && !param1.isCanMoveWhenAttack())
         {
            return _loc5_;
         }
         var _loc6_:Rectangle = param1.getNextFrameXBounds();
         var _loc7_:Number = Math.abs(Math.cos(this.rotation * Math.PI / 180) * Number(param1.speed.x));
         var _loc8_:Number = Math.tan(this.rotation * Math.PI / 180) * _loc7_;
         if(!this.isOutOfThisLine(param1) || this.isOutOfThisLine(param1) && this.getBounds(this.gc.gameSence).intersects(param1.getNextFrameXBounds()))
         {
            if(param1.speed.x >= 0)
            {
               if(this.rotation < 0)
               {
                  _loc8_ = -Math.abs(_loc8_);
               }
               else
               {
                  _loc8_ = Math.abs(_loc8_);
               }
            }
            else
            {
               _loc7_ = -_loc7_;
               if(this.rotation < 0)
               {
                  _loc8_ = Math.abs(_loc8_);
               }
               else
               {
                  _loc8_ = -Math.abs(_loc8_);
               }
            }
            if(param1 is BaseHero)
            {
               if(param1.isCanMoveByStage())
               {
                  _loc5_.x = _loc7_;
                  _loc5_.y = _loc8_;
               }
            }
            else
            {
               _loc5_.x = _loc7_;
               _loc5_.y = _loc8_;
            }
         }
         return _loc5_;
      }
      
      public function isOutOfThisLine(param1:*) : Boolean
      {
         var _loc2_:Rectangle = param1.getNextFrameBounds();
         if(this.rotation < 0)
         {
            return !(_loc2_.x + _loc2_.width >= this.minX && _loc2_.x + _loc2_.width <= this.maxX);
         }
         return !(_loc2_.x >= this.minX && _loc2_.x <= this.maxX);
      }
      
      protected function __added(param1:Event) : void
      {
         this.removeEventListener(Event.ADDED_TO_STAGE,this.__added);
      }
      
      public function step() : void
      {
         var _loc1_:* = 0;
         if(!this.userData)
         {
            if(this.userDataName != "")
            {
               this.userData = AUtils.getNewObj(this.userDataName) as MovieClip;
               _loc1_ = uint(this.gc.gameSence.getChildIndex(this));
               if(_loc1_ != -1)
               {
                  this.gc.gameSence.addChildAt(this.userData,_loc1_);
               }
            }
         }
         else
         {
            this.userData.x = this.x;
            this.userData.y = this.y;
         }
         if(!this.isStatic())
         {
            this.x += this.speedX;
            this.y += this.speedY;
         }
      }
      
      public function setUserDataName(param1:String) : void
      {
         this.userDataName = param1;
      }
      
      public function getUserDataName() : String
      {
         return this.userDataName;
      }
      
      public function getUserData() : MovieClip
      {
         return this.userData;
      }
      
      public function destroy() : void
      {
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
         if(this.userData)
         {
            if(this.gc.gameSence.contains(this.userData))
            {
               this.gc.gameSence.removeChild(this.userData);
            }
            this.userData = null;
         }
         var _loc1_:int = int(this.gc.pWorld.getWallArray().indexOf(this));
         if(_loc1_ != -1)
         {
            this.gc.pWorld.getWallArray().splice(_loc1_,1);
         }
      }
      
      public function getMirrorVector() : Point
      {
         if(Math.round(this.rotation) != 90)
         {
            return new Point(1,this.equationX);
         }
         return new Point(0,this.equationX);
      }
      
      public function isRoundWall() : Boolean
      {
         return false;
      }
      
      public function getNextFrameBound() : Rectangle
      {
         var _loc1_:Rectangle = this.getBounds(this.gc.gameSence);
         if(!this.isStatic())
         {
            _loc1_.offsetPoint(new Point(this.speedX,this.speedY));
         }
         return _loc1_;
      }
      
      public function isStatic() : Boolean
      {
         return this.speedX == 0 && this.speedY == 0;
      }
   }
}

