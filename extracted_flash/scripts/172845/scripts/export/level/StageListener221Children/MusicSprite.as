package export.level.StageListener221Children
{
   import com.greensock.*;
   import config.*;
   import export.level.*;
   import flash.display.*;
   import flash.geom.Point;
   
   public class MusicSprite extends Sprite
   {
      
      private var sMusicSprite:MovieClip;
      
      public var currentState:uint = 0;
      
      private var currentIndex:uint = 0;
      
      private var kingArray:Array;
      
      private var currentKindArray:Array;
      
      private var gc:Config;
      
      public function MusicSprite()
      {
         this.kingArray = [[1,1,5,5,6,6,5],[3,1,6,5,6,1,5],[5,4,3,3,4,3]];
         super();
         this.gc = Config.getInstance();
         this.currentKindArray = this.kingArray[int(Math.random() * Number(this.kingArray.length))] as Array;
         this.sMusicSprite = AUtils.getNewObj("stage221MusicSprite") as MovieClip;
         this.addChild(this.sMusicSprite);
         var _loc1_:uint = 1;
         while(_loc1_ <= 7)
         {
            (this.sMusicSprite["mubg" + _loc1_] as MovieClip).visible = false;
            (this.sMusicSprite["mu" + _loc1_] as MovieClip).gotoAndStop(8);
            if(_loc1_ > this.currentKindArray.length)
            {
               (this.sMusicSprite["mu" + _loc1_] as MovieClip).visible = false;
            }
            _loc1_++;
         }
      }
      
      public function addRandomMusicByPoint(param1:Point) : void
      {
         if(this.currentState == 0)
         {
            if(this.currentIndex < this.currentKindArray.length)
            {
               this.showMu(param1);
               ++this.currentIndex;
               if(this.currentIndex >= this.currentKindArray.length)
               {
                  this.currentIndex = 0;
                  this.currentState = 1;
               }
            }
         }
      }
      
      public function addMusic(param1:uint) : void
      {
         var _loc2_:uint = 0;
         var _loc3_:MovieClip = null;
         var _loc4_:uint = 0;
         if(this.currentState == 1)
         {
            if(this.currentIndex < this.currentKindArray.length)
            {
               _loc2_ = uint(this.currentKindArray[this.currentIndex]);
               if(_loc2_ == param1)
               {
                  ++this.currentIndex;
                  _loc3_ = this.sMusicSprite["mubg" + this.currentIndex] as MovieClip;
                  _loc3_.visible = true;
               }
               else
               {
                  this.currentIndex = 0;
                  _loc4_ = 1;
                  while(_loc4_ <= 7)
                  {
                     (this.sMusicSprite["mubg" + _loc4_] as MovieClip).visible = false;
                     _loc4_++;
                  }
               }
            }
            if(this.currentIndex >= this.currentKindArray.length)
            {
               this.currentState = 2;
               if(this.gc.pWorld.getBaseLevelListener() is StageListener221)
               {
                  (this.gc.pWorld.getBaseLevelListener() as StageListener221).addBoss();
               }
            }
         }
      }
      
      private function showMu(param1:Point) : void
      {
         var p:Point = param1;
         var muIdx:uint = uint(this.currentKindArray[this.currentIndex]);
         var gloabPoint:Point = this.gc.gameSence.parent.localToGlobal(p);
         var newP:Point = this.globalToLocal(gloabPoint);
         var bm:Bitmap = AUtils.getImageObj("muBmd" + muIdx);
         bm.x = newP.x;
         bm.y = newP.y;
         this.addChild(bm);
         TweenMax.to(bm,1,{
            "x":0 - bm.width / 2 - (3 - Number(this.currentIndex)) * 40,
            "y":0 - bm.height / 2,
            "onComplete":function(param1:MusicSprite, param2:uint, param3:Bitmap):*
            {
               var _loc4_:* = param1.currentKindArray[param2];
               (param1.sMusicSprite["mu" + (param2 + 1)] as MovieClip).gotoAndStop(_loc4_);
               if(param3.parent)
               {
                  param3.parent.removeChild(param3);
               }
            },
            "onCompleteParams":[this,this.currentIndex,bm]
         });
      }
      
      public function destroy() : void
      {
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
         this.sMusicSprite = null;
      }
   }
}

