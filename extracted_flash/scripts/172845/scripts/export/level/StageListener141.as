package export.level
{
   import base.BaseHero;
   import base.BaseLevelListenering;
   import com.greensock.*;
   import export.hero.*;
   import my.*;
   
   public class StageListener141 extends BaseLevelListenering
   {
      
      private var monsterAppearCount:uint = 72;
      
      private var isCallBoss:Boolean = false;
      
      public function StageListener141()
      {
         super();
         waitForRegisterDataArray = ["Monster61"];
      }
      
      override public function start() : void
      {
         super.start();
      }
      
      override public function step() : void
      {
         var flag:Boolean = false;
         var bh:BaseHero = null;
         var randHero:BaseHero = null;
         var maxNums:uint = 0;
         var i:uint = 0;
         super.step();
         if(!gc.vControllor.getStepState())
         {
            flag = false;
            if(gc.getPlayerArray().length == 2)
            {
               if(Boolean(gc.hero1) && Boolean(gc.hero2))
               {
                  if(gc.hero1.y <= -2100 && gc.hero2.y <= -2100)
                  {
                     flag = true;
                  }
               }
            }
            else
            {
               if(gc.hero1)
               {
                  if(gc.hero1.y <= -2100)
                  {
                     flag = true;
                  }
               }
               if(gc.hero2)
               {
                  if(gc.hero2.y <= -2100)
                  {
                     flag = true;
                  }
               }
            }
            if(flag)
            {
               TweenMax.to(gc.gameSence,1,{
                  "y":2450,
                  "onComplete":function(param1:StageListener141):*
                  {
                     param1.callBoss();
                  },
                  "onCompleteParams":[this]
               });
               for each(bh in gc.getPlayerArray())
               {
                  if(bh is Role2)
                  {
                     if(Role2(bh).role2Shalldow)
                     {
                        Role2(bh).role2Shalldow.destroy();
                        Role2(bh).role2Shalldow = null;
                     }
                  }
                  else if(bh is Role4)
                  {
                     Role4(bh).clearBiaoJi();
                  }
               }
               gc.vControllor.setStopStep();
            }
            if(this.monsterAppearCount > 0)
            {
               --this.monsterAppearCount;
            }
            if(this.monsterAppearCount == 0)
            {
               if(Boolean(gc.hero1) && Boolean(gc.hero2))
               {
                  randHero = Math.random() < 0.5 ? gc.hero1 : gc.hero2;
               }
               else if(gc.hero1)
               {
                  randHero = gc.hero1;
               }
               if(randHero)
               {
                  maxNums = 0;
                  if(gc.getPlayerArray().length == 2)
                  {
                     maxNums = 3;
                  }
                  else
                  {
                     maxNums = 2;
                  }
                  i = 0;
                  while(i < maxNums)
                  {
                     MainGame.getInstance().createMonster(61,randHero.x + (Math.random() - 0.5) * 300,randHero.y - (100 + Math.random() * 200));
                     i++;
                  }
               }
               this.monsterAppearCount = gc.frameClips * 6;
            }
         }
         else
         {
            for each(bh in gc.getPlayerArray())
            {
               if(bh.y > -1800)
               {
                  if(bh.roleProperies)
                  {
                     bh.reduceHp(bh.roleProperies.getSHHP());
                  }
               }
            }
         }
         if(this.isCallBoss)
         {
            if(gc.pWorld.monsterArray.length == 0)
            {
               this.showTransferDoor();
            }
         }
      }
      
      private function showTransferDoor() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = gc.pWorld.getTransferDoorArray();
         var _loc3_:int = 0;
         while(_loc3_ < _loc2_.length)
         {
            _loc1_ = _loc2_[_loc3_];
            _loc1_.visible = true;
            _loc3_++;
         }
      }
      
      public function callBoss() : void
      {
         this.isCallBoss = true;
         MainGame.getInstance().createMonster(61,100,-2300);
         MainGame.getInstance().createMonster(61,200,-2350);
         MainGame.getInstance().createMonster(61,5 * 60,-2400);
         MainGame.getInstance().createMonster(61,400,-2450);
         MainGame.getInstance().createMonster(61,500,-2400);
         MainGame.getInstance().createMonster(61,10 * 60,-2350);
         MainGame.getInstance().createMonster(61,700,-2300);
         MainGame.getInstance().createMonster(61,150,-2325);
         MainGame.getInstance().createMonster(61,250,-2375);
         MainGame.getInstance().createMonster(61,350,-2425);
         MainGame.getInstance().createMonster(61,450,-2375);
         MainGame.getInstance().createMonster(61,550,-2325);
         MainGame.getInstance().createMonster(61,650,-2300);
         MainGame.getInstance().createMonster(61,700,-2250);
         MainGame.getInstance().createMonster(61,750,-2200);
      }
   }
}

