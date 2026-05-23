package export.bullet
{
   import base.*;
   import com.greensock.*;
   import export.ThroughWall;
   import flash.display.*;
   import flash.events.*;
   
   [Embed(source="/_assets/assets.swf", symbol="symbol122")]
   public class ThroughWallBullet extends ThroughWall
   {
      
      private var isStop:Boolean = false;
      
      private var moveDirect:int = 1;
      
      private var totalCount:int;
      
      private var stopCount:int;
      
      private var swordEffect:SpecialEffectBullet;
      
      private var stopCounts:uint;
      
      public function ThroughWallBullet(param1:int)
      {
         super();
         this.speedX = param1;
         if(this.speedX > 0)
         {
            this.moveDirect = 1;
         }
         else if(this.speedX < 0)
         {
            this.moveDirect = 2;
         }
         else
         {
            this.moveDirect = 3;
         }
         this.isThroughWall = new MovieClip();
         this.isThroughWall.name = "isThroughWall";
         this.addChild(this.isThroughWall);
         this.visible = false;
         this.stopCounts = gc.frameClips * 6;
      }
      
      override public function step() : void
      {
         var temp:* = undefined;
         temp = undefined;
         temp = undefined;
         var heroArray:Array = null;
         var i:int = 0;
         var bh:BaseHero = null;
         temp = undefined;
         if(this.userData)
         {
            if(this.speedX > 0)
            {
               if(this.userData.transform.matrix.a < 0)
               {
                  AUtils.flipHorizontal(this.userData,1);
               }
            }
            else if(this.speedX < 0)
            {
               if(this.userData.transform.matrix.a > 0)
               {
                  AUtils.flipHorizontal(this.userData,-1);
               }
            }
         }
         if(!this.isStop)
         {
            if(this.userData)
            {
               this.userData.visible = false;
            }
            heroArray = gc.getPlayerArray();
            i = 0;
            while(i < heroArray.length)
            {
               bh = heroArray[i] as BaseHero;
               if(bh.standInObj == this)
               {
                  this.isStop = true;
                  temp = {};
                  TweenMax.to(temp,0.5,{
                     "y":temp.y + 10,
                     "onComplete":function():*
                     {
                        TweenMax.to(temp,0.5,{"y":Number(temp.y) - 4});
                     }
                  });
                  break;
               }
               i++;
            }
            if(this.moveDirect == 1)
            {
               this.speedX -= 0.5;
            }
            else if(this.moveDirect == 2)
            {
               this.speedX += 0.5;
            }
            else if(this.moveDirect == 3)
            {
               this.speedX = 0;
            }
         }
         else
         {
            if(this.swordEffect)
            {
               this.swordEffect.destroy();
            }
            if(this.userData)
            {
               this.userData.visible = true;
            }
            ++this.stopCount;
            this.speedX = 0;
         }
         super.step();
         ++this.totalCount;
         if(this.isStop)
         {
            if(this.stopCount >= this.stopCounts)
            {
               this.dispatchEvent(new Event("destroy"));
               this.destroy();
            }
         }
         else if(this.totalCount >= gc.frameClips * 8)
         {
            this.dispatchEvent(new Event("destroy"));
            this.destroy();
         }
      }
      
      public function setStopDoubleCount() : void
      {
         this.stopCounts = gc.frameClips * 12;
      }
      
      public function setSwordEffect(param1:SpecialEffectBullet) : void
      {
         this.swordEffect = param1;
      }
      
      override public function destroy() : void
      {
         super.destroy();
      }
   }
}

