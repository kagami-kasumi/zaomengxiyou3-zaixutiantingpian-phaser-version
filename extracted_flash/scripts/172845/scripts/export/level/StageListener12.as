package export.level
{
   import base.BaseLevelListenering;
   import flash.display.*;
   import my.*;
   
   public class StageListener12 extends BaseLevelListenering
   {
      
      private var fbEnter:MovieClip;
      
      private var fbCount:uint = 5;
      
      private var fbFatherCount:uint = 0;
      
      private var stayCount:uint = 72;
      
      public function StageListener12()
      {
         super();
         waitForRegisterDataArray = ["Monster8","Monster7","Monster4","Monster2"];
      }
      
      override public function init() : void
      {
         super.init();
      }
      
      override public function start() : void
      {
         var _loc1_:* = null;
         super.start();
         var _loc2_:uint = uint(gc.gameSence.numChildren);
         var _loc3_:int = 0;
         while(_loc3_ < _loc2_)
         {
            _loc1_ = gc.gameSence.getChildAt(_loc3_);
            if(_loc1_.name == "fbEnter")
            {
               this.fbEnter = _loc1_ as MovieClip;
            }
            _loc3_++;
         }
      }
      
      override public function step() : void
      {
         var _loc1_:* = null;
         var _loc2_:* = null;
         var _loc3_:* = null;
         var _loc4_:* = null;
         var _loc5_:Boolean = false;
         super.step();
         if(this.fbEnter.currentFrame == 1)
         {
            if(this.fbFatherCount == 0)
            {
               if(this.fbCount > 0 && Boolean(this.fbEnter))
               {
                  _loc1_ = this.fbEnter.getChildByName("colipse") as MovieClip;
                  if(_loc1_)
                  {
                     for each(_loc2_ in gc.getPlayerArray())
                     {
                        for each(_loc3_ in _loc2_.magicBulletArray)
                        {
                           if(HitTest.complexHitTestObject(_loc3_,_loc1_))
                           {
                              --this.fbCount;
                              _loc4_ = AUtils.getNewObj("HeroBeHurt");
                              _loc4_.x = _loc1_.x;
                              _loc4_.y = _loc1_.y;
                              this.fbEnter.addChild(_loc4_);
                              this.fbFatherCount = gc.frameClips * 1;
                           }
                        }
                     }
                  }
               }
            }
            if(this.fbCount <= 0)
            {
               this.fbEnter.gotoAndPlay(2);
            }
         }
         else if(this.fbEnter.currentFrame == this.fbEnter.totalFrames)
         {
            _loc1_ = this.fbEnter.getChildByName("colipse") as MovieClip;
            if(_loc1_)
            {
               _loc5_ = false;
               for each(_loc2_ in gc.getPlayerArray())
               {
                  if(_loc2_.colipse.hitTestObject(_loc1_))
                  {
                     _loc5_ = true;
                     if(this.stayCount > 0)
                     {
                        --this.stayCount;
                        if(this.stayCount == 0)
                        {
                           MainGame.getInstance().fbEnter();
                        }
                     }
                  }
               }
               if(!_loc5_)
               {
                  this.stayCount = 72;
               }
            }
         }
         if(this.fbFatherCount > 0)
         {
            --this.fbFatherCount;
         }
      }
      
      override public function destroy() : void
      {
         super.destroy();
      }
   }
}

