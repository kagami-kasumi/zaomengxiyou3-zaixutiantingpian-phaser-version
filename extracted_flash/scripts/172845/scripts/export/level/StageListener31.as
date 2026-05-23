package export.level
{
   import base.BaseBullet;
   import base.BaseHero;
   import base.BaseLevelListenering;
   import base.BaseObject;
   import com.greensock.*;
   import flash.display.*;
   import my.*;
   
   public class StageListener31 extends BaseLevelListenering
   {
      
      private var lightArray:Array;
      
      private var fbEnter:MovieClip;
      
      private var fbFatherCount:uint = 0;
      
      private var lightStateArray:Array;
      
      public function StageListener31()
      {
         this.lightArray = [];
         this.lightStateArray = [];
         super();
         waitForRegisterDataArray = ["Monster11","Monster12","Monster13","Monster21"];
      }
      
      override public function step() : void
      {
         var img:MovieClip = null;
         var mc:MovieClip = null;
         var bh:BaseHero = null;
         var bb:BaseBullet = null;
         img = null;
         var m:uint = 0;
         var bo:BaseObject = null;
         super.step();
         this.lightStateArray.length = 0;
         for each(mc in this.lightArray)
         {
            if(this.fbFatherCount == 0)
            {
               for each(bh in gc.getPlayerArray())
               {
                  for each(bb in bh.magicBulletArray)
                  {
                     if(HitTest.complexHitTestObject(bb,mc))
                     {
                        img = AUtils.getNewObj("HeroBeHurt");
                        img.x = mc.width / 2;
                        img.y = mc.height / 2;
                        mc.addChild(img);
                        if(mc.currentFrame == 1)
                        {
                           mc.gotoAndStop(2);
                        }
                        else
                        {
                           mc.gotoAndStop(1);
                        }
                        this.fbFatherCount = gc.frameClips * 1;
                     }
                  }
               }
            }
            this.lightStateArray.push(mc.currentFrame);
         }
         if(this.fbFatherCount > 0)
         {
            --this.fbFatherCount;
         }
         if(this.fbEnter.currentFrame == 1)
         {
            if(this.lightStateArray.join(",") == "1,2,1,2,1,2")
            {
               this.fbEnter.gotoAndPlay(2);
               m = 0;
               for each(bo in gc.getPlayerAndPetArray())
               {
                  TweenMax.to(bo,2,{
                     "y":800,
                     "x":2890,
                     "onComplete":function(param1:uint):*
                     {
                        if(param1 == 0)
                        {
                           MainGame.getInstance().fbEnter();
                        }
                     },
                     "onCompleteParams":[m]
                  });
                  m++;
               }
            }
         }
      }
      
      public function fbEnter_hero() : void
      {
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
               if(MovieClip(_loc1_).name == "light0")
               {
                  this.lightArray.push(_loc1_);
               }
               else if(MovieClip(_loc1_).name == "light1")
               {
                  this.lightArray.push(_loc1_);
               }
               else if(MovieClip(_loc1_).name == "light2")
               {
                  this.lightArray.push(_loc1_);
               }
               else if(MovieClip(_loc1_).name == "light3")
               {
                  this.lightArray.push(_loc1_);
               }
               else if(MovieClip(_loc1_).name == "light4")
               {
                  this.lightArray.push(_loc1_);
               }
               else if(MovieClip(_loc1_).name == "light5")
               {
                  this.lightArray.push(_loc1_);
               }
               else if(MovieClip(_loc1_).name == "fbEnter")
               {
                  this.fbEnter = _loc1_ as MovieClip;
               }
            }
            _loc3_++;
         }
      }
      
      override public function init() : void
      {
         super.init();
      }
      
      override public function destroy() : void
      {
         super.destroy();
         this.lightArray.length = 0;
      }
   }
}

