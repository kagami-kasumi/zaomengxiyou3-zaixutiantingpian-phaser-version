package export.level
{
   import base.*;
   import com.greensock.*;
   import config.*;
   import flash.display.*;
   import flash.events.*;
   import my.*;
   
   public class StageListener531 extends BaseLevelListenering
   {
      
      private var tw:TweenMax;
      
      private var callSword:SimpleButton;
      
      private var secCount:uint = 24;
      
      private var hyNum:uint;
      
      public function StageListener531()
      {
         super();
         this.gc = Config.getInstance();
         this.waitForRegisterDataArray = ["Monster172"];
      }
      
      override public function step() : void
      {
         var _loc1_:* = undefined;
         var _loc2_:* = null;
         super.step();
         if(this.secCount != 0)
         {
            --this.secCount;
            return;
         }
         for each(_loc2_ in this.gc.getPlayerAndPetArray())
         {
            _loc1_ = 0;
            if(_loc2_ is BaseHero)
            {
               _loc1_ = uint(0.01 * Number(BaseHero(_loc2_).roleProperies.getSHHP()));
               BaseHero(_loc2_).reduceHp(_loc1_);
            }
            else if(_loc2_ is BasePet)
            {
               _loc1_ = uint(0.01 * Number(BasePet(_loc2_).petInfo.getSHp()));
               BasePet(_loc2_).reduceHp(_loc1_);
            }
         }
         this.secCount = 30;
      }
      
      override public function start() : void
      {
         super.start();
         this.tw = TweenMax.delayedCall(1,function():*
         {
            MainGame.getInstance().createMonster(172,500,200);
         });
         this.callSword = AUtils.getNewObj("houyiCall") as SimpleButton;
         this.callSword.x = 400;
         this.callSword.y = 80;
         this.callSword.alpha = 0.6;
         this.callSword.addEventListener(MouseEvent.CLICK,function(param1:MouseEvent):void
         {
            if(gc.player1.getLhValue() <= 10000)
            {
               gc.alert("灵魂不足10000！");
               return;
            }
            if(hyNum >= 4)
            {
               gc.alert("最多召唤4个");
               return;
            }
            MainGame.getInstance().createMonster(172,500,200);
            gc.player1.setLhValue(gc.player1.getLhValue() - 10000);
            ++hyNum;
         });
         this.gc.gameInfo.addChild(this.callSword);
      }
      
      override public function destroy() : void
      {
         if(this.tw)
         {
            this.tw.kill();
            this.tw = null;
         }
         if(this.callSword)
         {
            this.callSword = null;
         }
         super.destroy();
      }
   }
}

