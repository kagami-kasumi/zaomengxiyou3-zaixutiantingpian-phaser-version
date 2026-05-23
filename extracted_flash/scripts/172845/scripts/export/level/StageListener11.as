package export.level
{
   import base.BaseHero;
   import base.BaseLevelListenering;
   import base.BaseObject;
   import com.greensock.*;
   import export.hero.*;
   import flash.display.*;
   import my.*;
   
   public class StageListener11 extends BaseLevelListenering
   {
      
      private var cloud:Sprite;
      
      private var monsterAppearCount:uint = 72;
      
      public function StageListener11()
      {
         super();
         waitForRegisterDataArray = [];
      }
      
      override public function start() : void
      {
         super.start();
         this.cloud = AUtils.getNewObj("CloudSprite") as Sprite;
         this.cloud.x = -20;
         this.cloud.y = 0;
      }
      
      override public function step() : void
      {
         var flag:Boolean = false;
         var bo:BaseObject = null;
         var bh:BaseHero = null;
         var randHero:BaseHero = null;
         var maxNums:uint = 0;
         var i:uint = 0;
         super.step();
         this.cloud.y = -gc.gameSence.y + 90;
         if(!gc.vControllor.getStepState())
         {
            flag = false;
            if(gc.getPlayerArray().length == 2)
            {
               if(Boolean(gc.hero1) && Boolean(gc.hero2))
               {
                  if(gc.hero1.y <= -1900 || gc.hero2.y <= -1900)
                  {
                     flag = true;
                  }
               }
            }
            else
            {
               if(gc.hero1)
               {
                  if(gc.hero1.y <= -1900)
                  {
                     flag = true;
                  }
               }
               if(gc.hero2)
               {
                  if(gc.hero2.y <= -1900)
                  {
                     flag = true;
                  }
               }
            }
            if(flag)
            {
               for each(bo in gc.getPlayerAndPetArray())
               {
                  if(bo.y >= -1862)
                  {
                     bo.y = -1950;
                  }
               }
               TweenMax.to(gc.gameSence,2,{
                  "y":2370,
                  "onComplete":function(param1:StageListener11):*
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
                  maxNums = 4;
               }
               else
               {
                  maxNums = 2;
               }
               i = 0;
               while(i < maxNums)
               {
                  MainGame.getInstance().createMonster(30,randHero.x + (Math.random() - 0.5) * 300,randHero.y - (100 + Math.random() * 200));
                  i++;
               }
            }
            this.monsterAppearCount = gc.frameClips * 6;
         }
      }
      
      public function callBoss() : void
      {
         MainGame.getInstance().createMonster(3,750,-2050);
      }
   }
}

