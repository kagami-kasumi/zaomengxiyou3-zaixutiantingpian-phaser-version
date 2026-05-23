package export.level
{
   import base.BaseLevelListenering;
   import flash.display.*;
   import my.*;
   
   public class StageListener23 extends BaseLevelListenering
   {
      
      private var woodThronArray:Array;
      
      private var fbEnter:MovieClip;
      
      private var fbCount:uint = 5;
      
      private var fbFatherCount:uint = 0;
      
      public function StageListener23()
      {
         this.woodThronArray = [];
         super();
         waitForRegisterDataArray = ["Monster15","Monster9","Monster10","Monster19"];
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
            if(_loc1_ is MovieClip)
            {
               if(MovieClip(_loc1_).getChildByName("isWoodThron"))
               {
                  this.woodThronArray.push(_loc1_);
               }
            }
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
         var _loc5_:* = null;
         super.step();
         for each(_loc1_ in this.woodThronArray)
         {
            _loc1_.step();
         }
         if(this.fbEnter.currentFrame == 1)
         {
            if(this.fbFatherCount == 0)
            {
               if(this.fbCount > 0 && Boolean(this.fbEnter))
               {
                  _loc2_ = this.fbEnter.getChildByName("colipse") as MovieClip;
                  if(_loc2_)
                  {
                     for each(_loc3_ in gc.getPlayerArray())
                     {
                        for each(_loc4_ in _loc3_.magicBulletArray)
                        {
                           if(HitTest.complexHitTestObject(_loc4_,_loc2_))
                           {
                              --this.fbCount;
                              _loc5_ = AUtils.getNewObj("HeroBeHurt");
                              _loc5_.x = _loc2_.x;
                              _loc5_.y = _loc2_.y;
                              this.fbEnter.addChild(_loc5_);
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
            _loc2_ = this.fbEnter.getChildByName("colipse") as MovieClip;
            if(_loc2_)
            {
               for each(_loc3_ in gc.getPlayerArray())
               {
                  if(_loc3_.colipse.hitTestObject(_loc2_))
                  {
                     MainGame.getInstance().fbEnter();
                  }
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
         this.woodThronArray = null;
      }
   }
}

