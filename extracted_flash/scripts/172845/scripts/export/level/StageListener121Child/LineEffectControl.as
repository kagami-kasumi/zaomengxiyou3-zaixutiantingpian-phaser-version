package export.level.StageListener121Child
{
   import base.*;
   import config.*;
   
   public class LineEffectControl
   {
      
      internal var line_red:LineEffect;
      
      internal var line_blue:LineEffect;
      
      internal var gc:Config;
      
      internal var targetHero:BaseHero;
      
      internal var targetMonster:BaseMonster;
      
      internal var boomCount:uint = 144;
      
      public var isDestroyed:Boolean = false;
      
      public var isBoomReady:Boolean = false;
      
      public function LineEffectControl()
      {
         super();
         this.gc = Config.getInstance();
      }
      
      public function addFirstLine(param1:BaseMonster, param2:BaseHero) : void
      {
         if(!this.targetHero)
         {
            this.targetHero = param2;
            this.targetMonster = param1;
            if(Math.random() <= 0.5)
            {
               this.newBlueLine(param1,param2);
            }
            else
            {
               this.newRedLine(param1,param2);
            }
         }
      }
      
      public function addSecondLine() : void
      {
         if(this.targetHero)
         {
            if(this.line_red)
            {
               if(!this.line_blue)
               {
                  this.newBlueLine(this.targetMonster,this.targetHero);
                  this.line_blue.offsetYVal = -Number(this.line_red.offsetYVal);
                  this.line_blue.direct = -Number(this.line_red.offsetYVal);
               }
            }
            else
            {
               this.newRedLine(this.targetMonster,this.targetHero);
               this.line_red.offsetYVal = -Number(this.line_blue.offsetYVal);
               this.line_red.direct = -Number(this.line_blue.offsetYVal);
            }
         }
      }
      
      internal function newBlueLine(param1:BaseMonster, param2:BaseHero) : void
      {
         var _loc3_:* = 0;
         var _loc4_:* = 0;
         if(Boolean(param1.parent) && Boolean(param2.parent))
         {
            this.line_blue = new LineEffect(LineEffect.LINE_BLUE);
            this.line_blue.targetObject1 = param1;
            this.line_blue.targetObject2 = param2;
            _loc3_ = param1.parent.getChildIndex(param1);
            _loc4_ = param2.parent.getChildIndex(param2);
            this.gc.gameSence.addChildAt(this.line_blue,Math.min(_loc3_,_loc4_));
         }
      }
      
      internal function newRedLine(param1:BaseMonster, param2:BaseHero) : void
      {
         var _loc3_:* = 0;
         var _loc4_:* = 0;
         if(Boolean(param1.parent) && Boolean(param2.parent))
         {
            this.line_red = new LineEffect(LineEffect.LINE_RED);
            this.line_red.targetObject1 = param1;
            this.line_red.targetObject2 = param2;
            _loc3_ = param1.parent.getChildIndex(param1);
            _loc4_ = param2.parent.getChildIndex(param2);
            this.gc.gameSence.addChildAt(this.line_red,Math.min(_loc3_,_loc4_));
         }
      }
      
      public function boom() : void
      {
         if(this.targetHero)
         {
            this.targetHero.addCurAddEffect([{
               "name":BaseAddEffect.MONSTER53_TIE,
               "time":Number(this.gc.frameClips) * 5
            }]);
            if(this.line_blue)
            {
               this.line_blue.destroy();
               this.line_blue = null;
            }
            if(this.line_red)
            {
               this.line_red.destroy();
               this.line_red = null;
            }
            this.targetHero = null;
            this.targetMonster = null;
         }
         this.destroy();
      }
      
      public function step() : void
      {
         var _loc1_:* = undefined;
         var _loc2_:* = undefined;
         if(this.line_red)
         {
            this.line_red.step();
            if(this.line_red.isDestroy)
            {
               this.line_red = null;
            }
         }
         if(this.line_blue)
         {
            this.line_blue.step();
            if(this.line_blue.isDestroy)
            {
               this.line_blue = null;
            }
         }
         if(!this.line_red && !this.line_blue)
         {
            this.destroy();
            return;
         }
         if(this.getLineEffectNum() == 2)
         {
            if(this.boomCount > 0)
            {
               _loc1_ = this;
               _loc2_ = _loc1_.boomCount - 1;
               _loc1_.boomCount = _loc2_;
               if(this.boomCount == 0)
               {
                  this.isBoomReady = true;
               }
            }
         }
      }
      
      public function getLineEffectNum() : int
      {
         var _loc1_:* = 0;
         if(this.line_blue)
         {
            _loc1_++;
         }
         if(this.line_red)
         {
            _loc1_++;
         }
         return _loc1_;
      }
      
      public function destroy() : void
      {
         if(this.line_red)
         {
            this.line_red.destroy();
            this.line_red = null;
         }
         if(this.line_blue)
         {
            this.line_blue.destroy();
            this.line_blue = null;
         }
         this.isDestroyed = true;
      }
   }
}

