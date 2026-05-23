package export.level
{
   import base.BaseLevelListenering;
   import base.BaseMonster;
   import com.greensock.TweenMax;
   import export.monster.Monster186;
   import flash.display.*;
   import flash.geom.*;
   import my.*;
   
   public class StageListener231 extends BaseLevelListenering
   {
      
      private const WALLAPPEARCOUNT:uint = 72;
      
      private var wallAppearCurrentCount:int = 72;
      
      private var boss:Monster186;
      
      private var transferDoor:MovieClip;
      
      private var maxMonsterCount:int = 15;
      
      private var monsterAppearCount:uint = 0;
      
      private var door:Sprite;
      
      private var hitCount:int = 4;
      
      private var hitInterval:int = 12;
      
      private var doorPoint:Point;
      
      internal var tw:TweenMax;
      
      internal var bm:BaseMonster;
      
      public function StageListener231()
      {
         super();
         waitForRegisterDataArray = ["Monster186"];
      }
      
      override public function step() : void
      {
         var bh:* = undefined;
         var bb:* = undefined;
         var img:MovieClip = null;
         super.step();
         if(this.door)
         {
            if(this.hitInterval == 0)
            {
               for each(bh in gc.getPlayerArray())
               {
                  for each(bb in bh.magicBulletArray)
                  {
                     if(!bb.isDisabled)
                     {
                        if(HitTest.complexHitTestObject(bb,this.door))
                        {
                           img = AUtils.getNewObj("HeroBeHurt");
                           img.x = 0;
                           img.y = 0;
                           this.door.addChild(img);
                           this.hitInterval = 12;
                           if(this.hitCount > 0)
                           {
                              --this.hitCount;
                              if(this.hitCount == 0)
                              {
                                 this.destroyDoor();
                              }
                           }
                        }
                     }
                  }
               }
            }
            else
            {
               --this.hitInterval;
            }
         }
         else if(this.doorPoint)
         {
            for each(bh in gc.getPlayerArray())
            {
               if(AUtils.GetDisBetweenTwoObj(bh,this.doorPoint) <= 50)
               {
                  MainGame.getInstance().fbEnter();
                  return;
               }
            }
         }
      }
      
      private function destroyDoor() : void
      {
         if(this.door)
         {
            if(this.door.parent)
            {
               this.door.parent.removeChild(this.door);
            }
            this.door = null;
         }
      }
      
      override public function start() : void
      {
         super.start();
         var data:Bitmap = new Bitmap(AUtils.getNewObj("bg231door") as BitmapData);
         this.door = new Sprite();
         data.x = -data.width / 2;
         data.y = -data.height / 2;
         this.door.addChild(data);
         this.door.x = 2420 - data.x;
         this.door.y = 304 - data.y;
         gc.gameSence.bgContainer.addChildAt(this.door,0);
         this.doorPoint = new Point(this.door.x,this.door.y);
      }
      
      override public function destroy() : void
      {
         if(this.door)
         {
            if(this.door.parent)
            {
               this.door.parent.removeChild(this.door);
            }
            this.door = null;
         }
         super.destroy();
      }
   }
}

