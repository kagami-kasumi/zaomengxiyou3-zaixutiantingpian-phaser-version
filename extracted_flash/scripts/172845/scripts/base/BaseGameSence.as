package base
{
   import config.*;
   import flash.display.*;
   import flash.geom.*;
   
   public class BaseGameSence extends MovieClip
   {
      
      protected var gc:Config;
      
      public var bgContainer:MovieClip;
      
      private var bgBitmapDataSprite:Sprite;
      
      private var bgSprite:Sprite;
      
      private var bgBitmapData:BitmapData;
      
      public function BaseGameSence()
      {
         super();
         this.gc = Config.getInstance();
         this.bgSprite = AUtils.getNewObj("bg" + this.gc.curStage + this.gc.curLevel);
         this.bgSprite.x = -20;
         this.bgSprite.cacheAsBitmap = true;
         this.bgContainer = this.getChildByName("bgContainer");
         this.bgContainer.addChild(this.bgSprite);
         var _loc1_:int = 0;
         while(_loc1_ < this.numChildren)
         {
            this.gc.pWorld.addSubObj(this.getChildAt(_loc1_));
            _loc1_++;
         }
      }
      
      public function updateBgSprite() : void
      {
         var _loc1_:* = null;
         var _loc2_:int = 0;
         while(_loc2_ < this.bgSprite.numChildren)
         {
            _loc1_ = this.bgSprite.getChildAt(0) as Bitmap;
            _loc1_.bitmapData.dispose();
            this.bgSprite.removeChild(_loc1_);
            _loc2_++;
         }
         var _loc3_:BitmapData = new BitmapData(940,590,true,0);
         _loc3_.copyPixels(this.bgBitmapData,new Rectangle(Math.abs(this.x),0,940,590),new Point(0,0));
         this.bgSprite.addChild(new Bitmap(_loc3_));
         this.bgSprite.x = -this.x;
      }
      
      public function destroy() : void
      {
         if(this.bgBitmapData)
         {
            this.bgBitmapData.dispose();
            this.bgBitmapData = null;
         }
         this.bgBitmapDataSprite = null;
         this.bgSprite = null;
         var _loc1_:int = 0;
         while(_loc1_ < this.bgContainer.numChildren)
         {
            this.bgContainer.removeChild(this.bgContainer.getChildAt(0));
            _loc1_++;
         }
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
      }
   }
}

