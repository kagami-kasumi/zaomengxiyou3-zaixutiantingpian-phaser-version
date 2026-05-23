package export.mapObject
{
   import config.*;
   import flash.display.MovieClip;
   import flash.geom.*;
   import my.*;
   
   [Embed(source="/_assets/assets.swf", symbol="symbol162")]
   public class IceThron extends MovieClip
   {
      
      private var attackId:uint = 0;
      
      private var gc:Config;
      
      private var intervalCount:uint = 0;
      
      public var isIceThron:MovieClip;
      
      public function IceThron()
      {
         addFrameScript(0,this.frame1);
         super();
         this.gc = Config.getInstance();
      }
      
      public function step() : void
      {
         var _loc1_:* = null;
         var _loc2_:Boolean = false;
         if(this.intervalCount == 0)
         {
            this.newAttackId();
            this.intervalCount = this.gc.frameClips * 2;
         }
         if(this.intervalCount >= 0)
         {
            --this.intervalCount;
         }
         if(this.y < 100)
         {
            if(this.currentFrame == 1)
            {
               _loc2_ = false;
               if(this.gc.hero1)
               {
                  if(Math.abs(this.x - this.gc.hero1.x) <= 200)
                  {
                     _loc2_ = true;
                  }
               }
               if(!_loc2_)
               {
                  if(this.gc.hero2)
                  {
                     if(Math.abs(this.x - this.gc.hero2.x) <= 200)
                     {
                        _loc2_ = true;
                     }
                  }
               }
               if(_loc2_)
               {
                  this.gotoAndPlay(2);
               }
            }
         }
         for each(_loc1_ in this.gc.getPlayerArray())
         {
            if(_loc1_.beAttackIdArray.indexOf(this.getAttackId()) == -1)
            {
               if(!_loc1_.isYourFather())
               {
                  if(HitTest.complexHitTestObject(this,_loc1_.colipse))
                  {
                     _loc1_.reduceHp(15 + (Math.random() - 0.5) * 10,true);
                     if(_loc1_.getBBDC().getDirect() == 0)
                     {
                        _loc1_.setAttackBack(new Point(10,0));
                     }
                     else
                     {
                        _loc1_.setAttackBack(new Point(-10,0));
                     }
                     _loc1_.beAttackIdArray.push(this.getAttackId());
                     _loc1_.beAttackDoing();
                  }
               }
            }
         }
      }
      
      private function getAttackId() : String
      {
         return this.name + this.attackId;
      }
      
      private function newAttackId() : void
      {
         ++this.attackId;
      }
      
      internal function frame1() : *
      {
         stop();
      }
   }
}

