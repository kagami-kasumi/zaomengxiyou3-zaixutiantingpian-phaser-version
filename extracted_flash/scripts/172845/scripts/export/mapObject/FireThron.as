package export.mapObject
{
   import config.*;
   import flash.display.MovieClip;
   import flash.geom.*;
   import my.*;
   
   [Embed(source="/_assets/assets.swf", symbol="symbol181")]
   public class FireThron extends MovieClip
   {
      
      public var isFireThron:MovieClip;
      
      private var attackId:uint = 0;
      
      private var gc:Config;
      
      private var intervalCount:uint = 0;
      
      public function FireThron()
      {
         addFrameScript(0,this.frame1);
         super();
         this.gc = Config.getInstance();
      }
      
      public function step() : void
      {
         var _loc1_:Boolean = false;
         var _loc2_:* = null;
         if(this.intervalCount == 0)
         {
            this.newAttackId();
            this.intervalCount = this.gc.frameClips * 2;
         }
         if(this.intervalCount >= 0)
         {
            --this.intervalCount;
         }
         if(this.currentFrame == 1)
         {
            _loc1_ = false;
            if(this.gc.hero1)
            {
               if(Math.abs(this.x - this.gc.hero1.x) <= 200)
               {
                  _loc1_ = true;
               }
            }
            if(!_loc1_)
            {
               if(this.gc.hero2)
               {
                  if(Math.abs(this.x - this.gc.hero2.x) <= 200)
                  {
                     _loc1_ = true;
                  }
               }
            }
            if(_loc1_)
            {
               this.gotoAndPlay(2);
            }
         }
         if(this.currentFrame >= 2 && this.currentFrame <= 19)
         {
            for each(_loc2_ in this.gc.getPlayerArray())
            {
               if(_loc2_.beAttackIdArray.indexOf(this.getAttackId()) == -1)
               {
                  if(!_loc2_.isYourFather())
                  {
                     if(HitTest.complexHitTestObject(this,_loc2_.colipse))
                     {
                        _loc2_.reduceHp(45 + (Math.random() - 0.5) * 10,true);
                        if(_loc2_.getBBDC().getDirect() == 0)
                        {
                           _loc2_.setAttackBack(new Point(10,0));
                        }
                        else
                        {
                           _loc2_.setAttackBack(new Point(-10,0));
                        }
                        _loc2_.beAttackIdArray.push(this.getAttackId());
                        _loc2_.beAttackDoing();
                     }
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

