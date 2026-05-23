package export.magicWeapon
{
   import base.*;
   import com.greensock.*;
   import export.bullet.*;
   import flash.geom.*;
   import my.MyEquipObj;
   
   public class MagicQPJ extends BaseMagicWeapon
   {
      
      private var timecount:int = 0;
      
      public function MagicQPJ(param1:BaseHero)
      {
         super(param1);
         this.bmwId = BaseMagicWeapon.BMW_BG;
         this.mp = 10;
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("QPJBmd");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],100,100,new Point(0,0));
            bbdc.setOffsetXY(1,-10);
            bbdc.setFrameStopCount([[4,4,4,4,4,4],[9999]]);
            bbdc.setFrameCount([6,1]);
            bbdc.setAddScriptWhenFrameOver(scriptFrameOverFunc);
            this.addChild(bbdc);
            return;
         }
         throw new Error("MagicZLHummer--BitmapData Error!");
      }
      
      override public function useSkill() : void
      {
         var _loc1_:MyEquipObj = this.sourceRole.getPlayer().getCurEquipByType("zbfb");
         if(_loc1_)
         {
            if(_loc1_.getELevel() >= 1)
            {
               super.useSkill();
            }
         }
      }
      
      override public function step() : void
      {
         var gameInfoPoint:Point = null;
         var globalPoint:Point = null;
         var localPoint:Point = null;
         super.step();
         ++this.timecount;
         if(this.curAction != "hit" && this.timecount >= gc.frameClips * 11.225)
         {
            gameInfoPoint = new Point(gc.gameInfo.x,gc.gameInfo.y);
            globalPoint = gc.gameInfo.localToGlobal(gameInfoPoint);
            localPoint = gc.gameSence.globalToLocal(globalPoint);
            trace("gameInfo在gameSence中的坐标: x=" + localPoint.x + ", y=" + localPoint.y);
            this.timecount = 0;
            this.showSkill1();
         }
      }
      
      override public function showSkill() : void
      {
         var j:int = 0;
         var closestTarget:BaseObject = null;
         var shortestDistance:Number = NaN;
         var monsters:Array = null;
         var i:int = 0;
         var side:int = 0;
         var gameInfoPoint:Point = null;
         var globalPoint:Point = null;
         var localPoint:Point = null;
         var enemy:BaseObject = null;
         var distanceX:Number = NaN;
         var distanceY:Number = NaN;
         var distance:Number = NaN;
         var b:TrailBullet = null;
         var parentIdx:int = 0;
         var time:int = 0;
         var equip:MyEquipObj = this.sourceRole.getPlayer().getCurEquipByType("zbfb");
         if(equip)
         {
            if(equip.getELevel() >= 1)
            {
               for(j = 0; j < 6; j++)
               {
                  b = new TrailBullet("qpjeffect",this.sourceRole,qpjeffect,"qpjeffect_box");
                  closestTarget = null;
                  shortestDistance = Number.MAX_VALUE;
                  monsters = gc.pWorld.monsterArray;
                  for(i = 0; i < monsters.length; i++)
                  {
                     enemy = monsters[i] as BaseObject;
                     if(Boolean(enemy) && Boolean(!enemy.isDead()) && !enemy.isReadyToDestroy)
                     {
                        distanceX = enemy.x - this.sourceRole.x;
                        distanceY = enemy.y - this.sourceRole.y;
                        distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
                        if(distance < shortestDistance)
                        {
                           shortestDistance = distance;
                           closestTarget = enemy;
                        }
                     }
                  }
                  if(closestTarget)
                  {
                     b.setTarget(closestTarget);
                  }
                  side = Math.floor(Math.random() * 4);
                  gameInfoPoint = new Point(gc.gameInfo.x,gc.gameInfo.y);
                  globalPoint = gc.gameInfo.localToGlobal(gameInfoPoint);
                  localPoint = gc.gameSence.globalToLocal(globalPoint);
                  switch(side)
                  {
                     case 0:
                        b.x = localPoint.x + Math.random() * gc.gameSence.stage.stageWidth;
                        b.y = localPoint.y - 100 - Math.random() * 100;
                        break;
                     case 1:
                        b.x = localPoint.x + gc.gameSence.stage.stageWidth + 100 + Math.random() * 100;
                        b.y = localPoint.y + Math.random() * gc.gameSence.stage.stageHeight;
                        break;
                     case 2:
                        b.x = localPoint.x + Math.random() * gc.gameSence.stage.stageWidth;
                        b.y = localPoint.y + gc.gameSence.stage.stageHeight + 100 + Math.random() * 100;
                        break;
                     case 3:
                        b.x = localPoint.x - 100 - Math.random() * 100;
                        b.y = localPoint.y + Math.random() * gc.gameSence.stage.stageHeight;
                  }
                  b.setRole(this.sourceRole);
                  b.setDestroyInCount(gc.frameClips * 8.8);
                  b.setDirect(0);
                  b.setDisable();
                  b.setDestroyWhenLastFrame(false);
                  b.setAction("fabao-qpj");
                  parentIdx = gc.gameSence.getChildIndex(this.sourceRole);
                  if(parentIdx != -1)
                  {
                     gc.gameSence.addChildAt(b,parentIdx + 1);
                  }
                  this.sourceRole.magicBulletArray.push(b);
               }
               time = 27;
               if(equip.getWX().indexOf("木") != -1)
               {
                  time = 24;
               }
               TweenMax.delayedCall(time,function(param1:MagicQPJ):*
               {
                  param1.setAction("wait");
               },[this]);
            }
         }
      }
      
      public function showSkill1() : void
      {
         var j:int = 0;
         var closestTarget:BaseObject = null;
         var shortestDistance:Number = NaN;
         var monsters:Array = null;
         var i:int = 0;
         var side:int = 0;
         var gameInfoPoint:Point = null;
         var globalPoint:Point = null;
         var localPoint:Point = null;
         var enemy:BaseObject = null;
         var distanceX:Number = NaN;
         var distanceY:Number = NaN;
         var distance:Number = NaN;
         var b:TrailBullet = null;
         var parentIdx:int = 0;
         var equip:MyEquipObj = this.sourceRole.getPlayer().getCurEquipByType("zbfb");
         if(equip)
         {
            if(equip.getELevel() >= 1)
            {
               for(j = 0; j < 1; j++)
               {
                  b = new TrailBullet("qpjeffect",this.sourceRole,qpjeffect,"qpjeffect_box");
                  closestTarget = null;
                  shortestDistance = Number.MAX_VALUE;
                  monsters = gc.pWorld.monsterArray;
                  for(i = 0; i < monsters.length; i++)
                  {
                     enemy = monsters[i] as BaseObject;
                     if(Boolean(enemy) && Boolean(!enemy.isDead()) && !enemy.isReadyToDestroy)
                     {
                        distanceX = enemy.x - this.sourceRole.x;
                        distanceY = enemy.y - this.sourceRole.y;
                        distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
                        if(distance < shortestDistance)
                        {
                           shortestDistance = distance;
                           closestTarget = enemy;
                        }
                     }
                  }
                  if(closestTarget)
                  {
                     b.setTarget(closestTarget);
                  }
                  side = Math.floor(Math.random() * 4);
                  gameInfoPoint = new Point(gc.gameInfo.x,gc.gameInfo.y);
                  globalPoint = gc.gameInfo.localToGlobal(gameInfoPoint);
                  localPoint = gc.gameSence.globalToLocal(globalPoint);
                  switch(side)
                  {
                     case 0:
                        b.x = localPoint.x + Math.random() * gc.gameSence.stage.stageWidth;
                        b.y = localPoint.y - 140;
                        break;
                     case 1:
                        b.x = localPoint.x + gc.gameSence.stage.stageWidth + 140;
                        b.y = localPoint.y + Math.random() * gc.gameSence.stage.stageHeight;
                        break;
                     case 2:
                        b.x = localPoint.x + Math.random() * gc.gameSence.stage.stageWidth;
                        b.y = localPoint.y + gc.gameSence.stage.stageHeight + 140;
                        break;
                     case 3:
                        b.x = localPoint.x - 140;
                        b.y = localPoint.y + Math.random() * gc.gameSence.stage.stageHeight;
                  }
                  b.setRole(this.sourceRole);
                  b.setDestroyInCount(gc.frameClips * 7.5);
                  b.setDirect(0);
                  b.setDisable();
                  b.setDestroyWhenLastFrame(false);
                  b.setAction("fabao-qpj1");
                  parentIdx = gc.gameSence.getChildIndex(this.sourceRole);
                  if(parentIdx != -1)
                  {
                     gc.gameSence.addChildAt(b,parentIdx + 1);
                  }
                  this.sourceRole.magicBulletArray.push(b);
               }
            }
         }
      }
   }
}

