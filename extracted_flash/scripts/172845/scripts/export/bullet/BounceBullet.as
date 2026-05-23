package export.bullet
{
   import base.*;
   import flash.geom.*;
   import my.*;
   
   public class BounceBullet extends BaseBullet
   {
      
      internal const simulatePerFrame:int = 10;
      
      internal var needToMovePoint:Point;
      
      internal var divideSpeed:Point;
      
      internal var simulateCount:int;
      
      internal var count:int = 0;
      
      internal var nextVector:Point;
      
      public function BounceBullet(param1:String, param2:Point, param3:String = "")
      {
         super(param1,param3);
         this.speed = param2;
      }
      
      override protected function step() : void
      {
         var _loc1_:* = undefined;
         super.step();
         this.divideSpeed = new Point(this.speed.x / Number(this.simulatePerFrame),this.speed.y / Number(this.simulatePerFrame));
         this.simulateCount = 0;
         this.checkColipse();
         _loc1_ = this;
         var _loc2_:* = _loc1_.count + 1;
         _loc1_.count = _loc2_;
      }
      
      public function setSpeedValue(param1:int, param2:int) : void
      {
         this.speed.x = param1;
         this.speed.y = param2;
      }
      
      internal function checkColipse() : void
      {
         var _loc1_:* = undefined;
         var _loc2_:* = undefined;
         var _loc3_:* = null;
         if(!this.imgMc)
         {
            return;
         }
         var _loc4_:* = gc.pWorld.getWallArray();
         var _loc5_:* = 0;
         while(_loc5_ < _loc4_.length)
         {
            _loc3_ = _loc4_[_loc5_];
            if(HitTest.complexHitTestObject(_loc3_,this.imgMc))
            {
               this.nextVector = this.getNextSimulateModuleVector(_loc3_);
               this.move(this.nextVector);
               this.divideSpeed = this.nextVector;
               if(this.simulateCount < 9)
               {
                  _loc1_ = this;
                  _loc2_ = _loc1_.simulateCount + 1;
                  _loc1_.simulateCount = _loc2_;
                  this.checkColipse();
               }
               else
               {
                  this.speed = new Point(Number(this.divideSpeed.x) * Number(this.simulatePerFrame),Number(this.divideSpeed.y) * Number(this.simulatePerFrame));
               }
            }
            else
            {
               _loc3_.x += _loc3_.speedX;
               _loc3_.y += _loc3_.speedY;
               this.x += this.speed.x;
               this.y += this.speed.y;
               if(HitTest.complexHitTestObject(_loc3_,this.imgMc))
               {
                  _loc3_.x -= _loc3_.speedX;
                  _loc3_.y -= _loc3_.speedY;
                  this.x -= this.speed.x;
                  this.y -= this.speed.y;
                  this.nextVector = this.getNextSimulateModuleVector(_loc3_);
                  this.move(this.nextVector);
                  this.divideSpeed = this.nextVector;
                  if(this.simulateCount < 9)
                  {
                     _loc1_ = this;
                     _loc2_ = _loc1_.simulateCount + 1;
                     _loc1_.simulateCount = _loc2_;
                     this.checkColipse();
                  }
                  else
                  {
                     this.speed = new Point(Number(this.divideSpeed.x) * Number(this.simulatePerFrame),Number(this.divideSpeed.y) * Number(this.simulatePerFrame));
                  }
               }
               else
               {
                  _loc3_.x -= _loc3_.speedX;
                  _loc3_.y -= _loc3_.speedY;
                  this.x -= this.speed.x;
                  this.y -= this.speed.y;
                  if(this.simulateCount != 0)
                  {
                     if(this.simulateCount < 9)
                     {
                        this.move(this.divideSpeed);
                        _loc1_ = this;
                        _loc2_ = _loc1_.simulateCount + 1;
                        _loc1_.simulateCount = _loc2_;
                        this.checkColipse();
                     }
                     else
                     {
                        this.speed = new Point(Number(this.divideSpeed.x) * Number(this.simulatePerFrame),Number(this.divideSpeed.y) * Number(this.simulatePerFrame));
                     }
                  }
               }
            }
            _loc5_++;
         }
         if(this.simulateCount == 0)
         {
            this.move(this.speed);
         }
      }
      
      internal function getNextSimulateModuleVector(param1:Wall) : Point
      {
         var _loc2_:* = param1.getMirrorVector();
         var _loc3_:* = new Point(this.divideSpeed.x,this.divideSpeed.y);
         var _loc4_:* = Math.sqrt(Number(_loc2_.x) * Number(_loc2_.x) + Number(_loc2_.y) * Number(_loc2_.y));
         var _loc5_:* = -Number(_loc2_.y) * this.speed.x / _loc4_ + Number(_loc2_.x) * this.speed.y / _loc4_;
         var _loc6_:* = this.getSpeedValue();
         var _loc7_:* = this.speed.x + 2 * Number(_loc2_.y) * _loc5_ / _loc4_;
         var _loc8_:* = this.speed.y - 2 * Number(_loc2_.x) * _loc5_ / _loc4_;
         var _loc9_:* = Math.sqrt(_loc7_ * _loc7_ + _loc8_ * _loc8_);
         _loc7_ = _loc7_ * _loc6_ / _loc9_;
         _loc8_ = _loc8_ * _loc6_ / _loc9_;
         return new Point(_loc7_,_loc8_);
      }
      
      internal function getSpeedValue() : Number
      {
         return Math.sqrt(Number(this.divideSpeed.x) * Number(this.divideSpeed.x) + Number(this.divideSpeed.y) * Number(this.divideSpeed.y));
      }
      
      internal function move(param1:Point) : void
      {
         this.x += param1.x;
         this.y += param1.y;
      }
   }
}

