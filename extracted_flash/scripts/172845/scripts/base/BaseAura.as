package base
{
   import com.greensock.*;
   import config.*;
   import flash.display.MovieClip;
   
   public class BaseAura extends MovieClip
   {
      
      public var isReadyToDestroy:Boolean = false;
      
      private var startCount:int = 20;
      
      private var count:int = 0;
      
      protected var sourceMonster:BaseMonster;
      
      protected var sourceHero:BaseHero;
      
      protected var speed:int;
      
      protected var power:int;
      
      private var correntState:int = 1;
      
      protected var gc:Config;
      
      public function BaseAura(param1:BaseMonster, param2:BaseHero)
      {
         super();
         this.gc = Config.getInstance();
         this.sourceMonster = param1;
         this.sourceHero = param2;
         this.speed = 4 + Math.random() * 2;
      }
      
      public function step() : void
      {
         var _loc1_:* = null;
         if(this.correntState == 3)
         {
            return;
         }
         if(this.correntState == 1)
         {
            if(this.startCount > 0)
            {
               --this.startCount;
            }
            else
            {
               this.startUp();
            }
         }
         else if(this.correntState == 2)
         {
            _loc1_ = AUtils.GetNextPointByTwoObj(this,this.sourceHero);
            this.x += Number(_loc1_.x) * Number(this.speed);
            this.y += Number(_loc1_.y) * Number(this.speed);
            this.speed += 2;
            if(this.speed > 20)
            {
               this.speed = 20;
            }
            if(AUtils.GetDisBetweenTwoObj(this,this.sourceHero) <= 10)
            {
               this.destroy();
            }
         }
         ++this.count;
         if(this.count > Number(this.gc.frameClips) * 15)
         {
            this.destroy();
         }
      }
      
      public function setPower(param1:int) : void
      {
         this.power = param1;
      }
      
      public function getPower() : int
      {
         return this.power;
      }
      
      public function destroy() : void
      {
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
         this.isReadyToDestroy = true;
         this.sourceMonster = null;
         this.sourceHero = null;
      }
      
      private function startUp() : void
      {
         var upValue:Number = 50 - Math.random() * 20;
         TweenMax.to(this,1,{
            "y":this.y - upValue,
            "onCompleteParams":[this],
            "onComplete":function(param1:BaseAura):*
            {
               param1.startMove();
            }
         });
         this.correntState = 3;
      }
      
      private function startMove() : void
      {
         this.correntState = 2;
      }
   }
}

