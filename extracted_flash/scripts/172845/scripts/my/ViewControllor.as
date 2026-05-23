package my
{
   import base.BaseHero;
   import config.*;
   import export.*;
   import flash.geom.*;
   
   public class ViewControllor
   {
      
      private var gc:Config;
      
      private var role1:BaseHero;
      
      private var role2:BaseHero;
      
      private var maxRightX:Number;
      
      private var maxBGRightX:Number;
      
      private var canBackward:Number = 0;
      
      private var thisStopX:Number = 0;
      
      private var lastPointX:Number = 0;
      
      private var isAutoCamera:Boolean = false;
      
      private var shakeVal:Number = 0;
      
      private var stopStep:Boolean = false;
      
      private var minGameSenceY:Number = 0;
      
      internal var count:int = 0;
      
      public function ViewControllor()
      {
         super();
         this.gc = Config.getInstance();
         this.maxRightX = 940 - Number(this.gc.gameSence.width);
         this.maxBGRightX = 940 - Number(this.gc.bg1.width);
         this.minGameSenceY = this.gc.gameSence.getBounds(this.gc.gameSence.parent).y;
      }
      
      public function shake(param1:int) : void
      {
         if(this.shakeVal == 0)
         {
            this.shakeVal = param1;
         }
      }
      
      public function step() : void
      {
         var _loc1_:* = null;
         var _loc2_:* = null;
         var _loc3_:* = null;
         var _loc4_:Number = Number(NaN);
         var _loc5_:Number = Number(NaN);
         var _loc6_:* = NaN;
         var _loc7_:* = NaN;
         var _loc8_:Number = Number(NaN);
         var _loc9_:Number = Number(NaN);
         var _loc10_:* = null;
         var _loc11_:* = NaN;
         var _loc12_:* = NaN;
         var _loc13_:* = null;
         var _loc14_:Number = Number(NaN);
         var _loc15_:Number = Number(NaN);
         var _loc16_:int = 0;
         var _loc17_:int = 0;
         if(this.shakeVal > 0)
         {
            this.gc.gameSence.x += this.shakeVal;
            this.shakeVal *= -1;
         }
         else if(this.shakeVal < 0)
         {
            this.gc.gameSence.x += this.shakeVal;
            this.shakeVal = 0;
         }
         if(this.stopStep)
         {
            return;
         }
         if(!(this.gc.curStage == 0 && this.gc.curLevel == 2 || this.gc.curStage == 1 && this.gc.curLevel == 1 || this.gc.curStage == 4 && this.gc.curLevel == 1 || this.gc.curStage == 14 && this.gc.curLevel == 1 || this.gc.curStage == 22 && this.gc.curLevel == 3))
         {
            if(Boolean(this.role1) && !this.role1.isDead())
            {
               _loc1_ = this.role1.colipse.getBounds(this.gc.gameSence.parent);
               _loc2_ = _loc1_;
               if(Boolean(this.role2) && !this.role2.isDead())
               {
                  _loc2_ = this.role2.colipse.getBounds(this.gc.gameSence.parent);
               }
            }
            else
            {
               if(!(Boolean(this.role2) && !this.role2.isDead()))
               {
                  return;
               }
               _loc1_ = this.role2.colipse.getBounds(this.gc.gameSence.parent);
               _loc2_ = _loc1_;
            }
            _loc4_ = Number(this.maxRightX);
            _loc5_ = Number(this.maxBGRightX);
            _loc6_ = 0;
            if((this.gc.pWorld.getStopPointArray() as Array).length > 0)
            {
               _loc3_ = this.gc.pWorld.getStopPointArray()[0] as StopPoint;
               if(this.lastPointX == 0)
               {
                  _loc10_ = (this.gc.pWorld.getStopPointArray() as Array)[(this.gc.pWorld.getStopPointArray() as Array).length - 1] as StopPoint;
                  this.lastPointX = _loc10_.getDataX();
               }
            }
            _loc7_ = 0;
            if(_loc3_)
            {
               _loc9_ = Number(this.gc.gameSence.localToGlobal(new Point(_loc3_.getDataX(),_loc3_.y)).x);
            }
            else
            {
               this.thisStopX = -Number(this.lastPointX) + 870;
            }
            ++this.count;
            if(_loc1_.x >= 940 * 2 / 3 && _loc2_.x >= 940 / 5)
            {
               _loc7_ = Number(Math.max(this.getMaxSpeedBetweenToPlayer(),0));
               _loc8_ = _loc7_ * (Number(this.gc.bg1.width) - 940) / (Number(this.gc.gameSence.width) - 940);
               if(this.thisStopX != 0 && this.gc.gameSence.x > this.thisStopX)
               {
                  this.gc.gameSence.x -= _loc7_;
                  this.gc.bg1.x -= _loc8_;
                  if(this.canBackward != -99)
                  {
                     this.canBackward += _loc7_;
                  }
               }
               else if(Boolean(_loc3_) && !_loc3_.isSendMonster)
               {
                  this.gc.gameSence.x -= _loc7_;
                  this.gc.bg1.x -= _loc8_;
                  this.canBackward += _loc7_;
                  if(_loc9_ <= 980 && _loc9_ >= 15 * 60)
                  {
                     if(_loc3_)
                     {
                        this.canBackward = _loc3_.getLeftDataX();
                        this.thisStopX = this.gc.gameSence.x;
                        _loc3_.touch();
                     }
                  }
                  else
                  {
                     this.canBackward = -99;
                     this.thisStopX = 0;
                  }
               }
            }
            else if(_loc1_.x >= 940 / 5 && _loc2_.x >= 940 * 2 / 3)
            {
               _loc7_ = Number(Math.max(this.getMaxSpeedBetweenToPlayer(),0));
               _loc8_ = _loc7_ * (Number(this.gc.bg1.width) - 940) / (Number(this.gc.gameSence.width) - 940);
               if(this.thisStopX != 0 && this.gc.gameSence.x > this.thisStopX)
               {
                  this.gc.gameSence.x -= _loc7_;
                  this.gc.bg1.x -= _loc8_;
                  if(this.canBackward != -99)
                  {
                     this.canBackward += _loc7_;
                  }
               }
               else if(Boolean(_loc3_) && !_loc3_.isSendMonster)
               {
                  this.gc.gameSence.x -= _loc7_;
                  this.gc.bg1.x -= _loc8_;
                  this.canBackward += _loc7_;
                  if(_loc9_ <= 980 && _loc9_ >= 15 * 60)
                  {
                     if(_loc3_)
                     {
                        this.canBackward = _loc3_.getLeftDataX();
                        this.thisStopX = this.gc.gameSence.x;
                        _loc3_.touch();
                     }
                  }
                  else
                  {
                     this.canBackward = -99;
                     this.thisStopX = 0;
                  }
               }
            }
            else if(_loc1_.x <= 940 * 2 / 3 && _loc2_.x <= 940 / 5 && (this.canBackward > 0 || this.canBackward == -99))
            {
               if(this.gc.isInHost())
               {
                  this.canBackward = -99;
               }
               if(this.canBackward > 0 || this.canBackward == -99)
               {
                  _loc7_ = Number(Math.min(this.getMinSpeedBetweenToPlayer(),0));
                  _loc8_ = _loc7_ * (Number(this.gc.bg1.width) - 940) / (Number(this.gc.gameSence.width) - 940);
                  if(Number(this.gc.gameSence.x) - _loc7_ <= 0)
                  {
                     this.gc.gameSence.x -= _loc7_;
                     this.gc.bg1.x -= _loc8_;
                     if(this.gc.bg1.x > 0)
                     {
                        this.gc.bg1.x = 0;
                     }
                     if(this.canBackward > 0)
                     {
                        this.canBackward -= -_loc7_;
                     }
                  }
               }
            }
            else if(_loc1_.x <= 940 / 5 && _loc2_.x <= 940 * 2 / 3 && (this.canBackward > 0 || this.canBackward == -99))
            {
               if(this.gc.isInHost())
               {
                  this.canBackward = -99;
               }
               if(this.canBackward > 0 || this.canBackward == -99)
               {
                  _loc7_ = Number(Math.min(this.getMinSpeedBetweenToPlayer(),0));
                  _loc8_ = _loc7_ * (Number(this.gc.bg1.width) - 940) / (Number(this.gc.gameSence.width) - 940);
                  if(Number(this.gc.gameSence.x) - _loc7_ <= 0)
                  {
                     this.gc.gameSence.x -= _loc7_;
                     this.gc.bg1.x -= _loc8_;
                     if(this.gc.bg1.x > 0)
                     {
                        this.gc.bg1.x = 0;
                     }
                     if(this.canBackward > 0)
                     {
                        this.canBackward -= -_loc7_;
                     }
                  }
               }
            }
         }
         if(Boolean(this.gc.isInHost()) || this.gc.curStage == 0 && this.gc.curLevel == 1 || this.gc.curStage == 1 && this.gc.curLevel == 1 || this.gc.curStage == 7 && this.gc.curLevel == 1 || this.gc.curStage == 11 && this.gc.curLevel == 1 || this.gc.curStage == 14 && this.gc.curLevel == 1 || this.gc.curStage == 116 && this.gc.curLevel == 1 || this.gc.curStage == 22 && this.gc.curLevel == 3)
         {
            _loc11_ = 0;
            _loc12_ = 99;
            for each(_loc13_ in this.gc.getPlayerArray())
            {
               _loc11_ = Number(_loc11_ + _loc13_.y);
            }
            _loc11_ = Number(_loc11_ / Number(this.gc.getPlayerArray().length));
            if(_loc11_ < 245)
            {
               this.gc.gameSence.y = 245 - _loc11_;
            }
            else if(_loc11_ > 580)
            {
            }
            if(this.minGameSenceY < 0)
            {
               if(this.gc.gameSence.y > -Number(this.minGameSenceY))
               {
                  this.gc.gameSence.y = -Number(this.minGameSenceY);
               }
            }
         }
         if(this.shakeVal == 0)
         {
            if(Boolean(this.isAutoCamera) && Boolean(_loc3_))
            {
               _loc14_ = Math.min(this.gc.hero1 ? Number(this.gc.hero1.x) : Number(99999),this.gc.hero2 ? Number(this.gc.hero2.x) : Number(99999));
               _loc15_ = Number(this.gc.gameSence.localToGlobal(new Point(_loc14_,0)).x);
               if(_loc15_ > 450)
               {
                  _loc16_ = this.gc.hero1 ? int(Math.abs(this.gc.hero1.speed.x)) : 0;
                  _loc17_ = this.gc.hero2 ? int(Math.abs(this.gc.hero2.speed.x)) : 0;
                  if(Math.max(_loc16_,_loc17_) + 10 <= 30)
                  {
                     _loc7_ = Number(Math.max(_loc16_,_loc17_) + 10);
                  }
                  else
                  {
                     _loc7_ = 30;
                  }
                  this.gc.gameSence.x -= _loc7_;
                  _loc8_ = _loc7_ * (Number(this.gc.bg1.width) - 940) / (Number(this.gc.gameSence.width) - 940);
                  this.gc.bg1.x -= _loc8_;
               }
               else
               {
                  this.isAutoCamera = false;
               }
               if(_loc9_ <= 1000 && _loc9_ >= 880)
               {
                  this.isAutoCamera = false;
               }
            }
         }
      }
      
      public function getFarrestDistance() : Number
      {
         return this.thisStopX;
      }
      
      public function setAutoCamera() : void
      {
         this.isAutoCamera = true;
      }
      
      private function getMaxSpeedBetweenToPlayer() : Number
      {
         var _loc1_:* = -99;
         if(Boolean(this.role1) && !this.role1.isDead())
         {
            _loc1_ = Number(this.role1.speed.x);
         }
         if(Boolean(this.role2) && !this.role2.isDead())
         {
            _loc1_ = Number(_loc1_ > this.role2.speed.x ? Number(_loc1_) : Number(this.role2.speed.x));
         }
         if(this.gc.isInSea())
         {
            _loc1_ = Number(_loc1_ / 2);
         }
         return _loc1_;
      }
      
      private function getMinSpeedBetweenToPlayer() : Number
      {
         var _loc1_:* = 99;
         if(Boolean(this.role1) && !this.role1.isDead())
         {
            _loc1_ = Number(this.role1.speed.x);
         }
         if(Boolean(this.role2) && !this.role2.isDead())
         {
            _loc1_ = Number(_loc1_ < this.role2.speed.x ? Number(_loc1_) : Number(this.role2.speed.x));
         }
         if(_loc1_ > 10)
         {
            _loc1_ = 10;
         }
         if(this.gc.isInSea())
         {
            _loc1_ = Number(_loc1_ / 2);
         }
         return _loc1_;
      }
      
      public function setStopStep() : void
      {
         this.stopStep = true;
      }
      
      public function getStepState() : Boolean
      {
         return this.stopStep;
      }
      
      public function getCurrentStopPoint() : StopPoint
      {
         return this.gc.pWorld.getStopPointArray()[0] as StopPoint;
      }
      
      public function destroy() : void
      {
         this.role1 = null;
         this.role2 = null;
         this.isAutoCamera = false;
      }
      
      public function setRole1(param1:BaseHero) : void
      {
         this.role1 = param1;
      }
      
      public function setRole2(param1:BaseHero) : void
      {
         this.role2 = param1;
      }
   }
}

