package export.level.StageListener213Children
{
   import com.greensock.*;
   import config.*;
   import flash.display.Sprite;
   import my.*;
   
   public class StageListener213stone extends Sprite
   {
      
      public var state:uint = 0;
      
      private var life:uint = 5;
      
      private var fatherCount:uint = 0;
      
      private var gc:Config;
      
      public function StageListener213stone()
      {
         super();
         this.gc = Config.getInstance();
         this.init();
      }
      
      private function init() : void
      {
         this.graphics.beginFill(16711680,0);
         this.graphics.drawRect(0,0,60,120);
         this.graphics.endFill();
      }
      
      private function show() : void
      {
         TweenMax.delayedCall(1.5,function():*
         {
            if(MainGame.getInstance())
            {
               MainGame.getInstance().fbEnter();
            }
         });
      }
      
      public function step() : void
      {
         var _loc1_:* = undefined;
         var _loc2_:* = undefined;
         var _loc3_:* = null;
         var _loc4_:* = null;
         if(this.fatherCount > 0)
         {
            --this.fatherCount;
         }
         if(this.state == 0)
         {
            _loc3_ = this.gc.getPlayerArray();
            for each(_loc1_ in _loc3_)
            {
               for each(_loc2_ in _loc1_.magicBulletArray)
               {
                  if(!_loc2_.isDisabled)
                  {
                     if(HitTest.complexHitTestObject(this,_loc2_))
                     {
                        if(this.life > 0)
                        {
                           if(this.fatherCount == 0)
                           {
                              this.fatherCount = 12;
                              --this.life;
                              _loc4_ = AUtils.getNewObj("HeroBeHurt");
                              _loc4_.x = 47;
                              _loc4_.y = 85;
                              this.addChild(_loc4_);
                              if(this.life == 0)
                              {
                                 this.state = 1;
                                 this.show();
                                 break;
                              }
                           }
                        }
                     }
                  }
               }
            }
         }
      }
   }
}

