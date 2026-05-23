package export.level
{
   import base.BaseLevelListenering;
   import com.greensock.*;
   import export.level.StageListener201Children.*;
   import flash.display.*;
   import flash.geom.*;
   import my.*;
   
   public class StageListener201 extends BaseLevelListenering
   {
      
      private var jiguanPointArray:Array;
      
      private var jiguanArray:Array;
      
      public function StageListener201()
      {
         this.jiguanPointArray = [[118.5,104.5],[704.65,101.55],[2625.65,100]];
         this.jiguanArray = [];
         super();
         waitForRegisterDataArray = ["Monster110","Monster111","Monster113","Monster112"];
      }
      
      override public function step() : void
      {
         var flag:Boolean = false;
         var mc:MovieClip = null;
         var g:Point = null;
         var p:Point = null;
         super.step();
         if(this.jiguanArray.length > 0)
         {
            flag = true;
            for each(jiguan in this.jiguanArray)
            {
               jiguan.step();
               if(jiguan.state == 0)
               {
                  flag = false;
               }
            }
            if(flag == true)
            {
               this.jiguanArray.length = 0;
               mc = AUtils.getNewObj("Monster127Bullet3") as MovieClip;
               mc.x = 500;
               mc.y = 150;
               gc.bg1.addChild(mc);
               g = gc.bg1.localToGlobal(new Point(500,150));
               p = gc.gameSence.globalToLocal(g);
               for each(bh in gc.getPlayerArray())
               {
                  TweenMax.to(bh,1,{
                     "x":p.x,
                     "y":p.y,
                     "onComplete":function():*
                     {
                        MainGame.getInstance().fbEnter();
                     }
                  });
               }
            }
         }
      }
      
      override public function start() : void
      {
         var _loc1_:* = undefined;
         var _loc2_:* = null;
         for each(_loc1_ in this.jiguanPointArray)
         {
            _loc2_ = new StageListener201jiguan();
            _loc2_.x = _loc1_[0];
            _loc2_.y = _loc1_[1];
            gc.gameSence.addChild(_loc2_);
            this.jiguanArray.push(_loc2_);
         }
         super.start();
      }
      
      override public function destroy() : void
      {
         super.destroy();
      }
   }
}

