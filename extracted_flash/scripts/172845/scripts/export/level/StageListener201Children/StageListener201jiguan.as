package export.level.StageListener201Children
{
   import config.*;
   import flash.display.*;
   import my.*;
   
   public class StageListener201jiguan extends Sprite
   {
      
      public var state:uint = 0;
      
      private var gc:Config;
      
      public function StageListener201jiguan()
      {
         super();
         this.gc = Config.getInstance();
         this.init();
      }
      
      private function init() : void
      {
         this.graphics.beginFill(16711680,0);
         this.graphics.drawRect(0,0,55,55);
         this.graphics.endFill();
      }
      
      private function show() : void
      {
         var _loc1_:Bitmap = AUtils.getImageObj("stage201jiguan") as Bitmap;
         this.addChild(_loc1_);
      }
      
      public function step() : void
      {
         var _loc1_:* = undefined;
         var _loc2_:* = undefined;
         var _loc3_:* = null;
         var _loc4_:* = null;
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
                        this.state = 1;
                        this.show();
                        _loc4_ = AUtils.getNewObj("HeroBeHurt");
                        _loc4_.x = 30;
                        _loc4_.y = 30;
                        this.addChild(_loc4_);
                     }
                  }
               }
            }
         }
      }
   }
}

