package export.mapObject
{
   import com.greensock.*;
   import config.*;
   import export.level.*;
   import flash.display.MovieClip;
   import my.*;
   
   public class TransferWind extends MovieClip
   {
      
      private var targetLevel:uint;
      
      private var direct:uint = 0;
      
      private var fiexedHeroArray:Array;
      
      private var continuedCount:uint = 192;
      
      private var gc:Config;
      
      public function TransferWind(param1:uint, param2:uint)
      {
         this.fiexedHeroArray = [];
         super();
         this.gc = Config.getInstance();
         if(param1 == 1)
         {
            if(param2 == 0)
            {
               this.targetLevel = 3;
            }
            else
            {
               this.targetLevel = 4;
            }
         }
         else if(param1 == 2)
         {
            if(param2 == 0)
            {
               this.targetLevel = 4;
            }
            else
            {
               this.targetLevel = 5;
            }
         }
         else if(param1 == 3)
         {
            if(param2 == 0)
            {
               this.targetLevel = 1;
            }
            else
            {
               this.targetLevel = 5;
            }
         }
         else if(param1 == 4)
         {
            if(param2 == 0)
            {
               this.targetLevel = 1;
            }
            else
            {
               this.targetLevel = 2;
            }
         }
         else if(param1 == 5)
         {
            if(param2 == 0)
            {
               this.targetLevel = 2;
            }
            else
            {
               this.targetLevel = 3;
            }
         }
         else
         {
            this.targetLevel = 1;
         }
         this.direct = param2;
      }
      
      public function step() : void
      {
         var _loc1_:* = null;
         if(this.direct == 0)
         {
            this.x -= 10;
         }
         else
         {
            this.x += 10;
         }
         for each(_loc1_ in this.gc.getPlayerArray())
         {
            if(this.fiexedHeroArray.indexOf(_loc1_) == -1)
            {
               if(HitTest.complexHitTestObject(_loc1_,this))
               {
                  this.gc.vControllor.setStopStep();
                  TweenMax.killAll(true,true,true);
                  _loc1_.setLostKeyboard();
                  _loc1_.setLostGraity();
                  _loc1_.setAction("hurt");
                  _loc1_.getBBDC().show();
                  _loc1_.getBBDC().stopFrame();
                  _loc1_.x = this.x;
                  _loc1_.y = this.y;
                  this.fiexedHeroArray.push(_loc1_);
               }
            }
            else
            {
               _loc1_.x = this.x;
               _loc1_.y = this.y;
            }
         }
         if(this.continuedCount > 0)
         {
            --this.continuedCount;
            if(this.continuedCount == 0)
            {
               if(this.fiexedHeroArray.length > 0)
               {
                  if(this.gc.pWorld.getBaseLevelListener() is StageListener101)
                  {
                     StageListener101(this.gc.pWorld.getBaseLevelListener()).gotoLevel(this.targetLevel);
                  }
               }
               else
               {
                  this.destroy();
               }
            }
         }
      }
      
      public function destroy() : void
      {
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
      }
   }
}

