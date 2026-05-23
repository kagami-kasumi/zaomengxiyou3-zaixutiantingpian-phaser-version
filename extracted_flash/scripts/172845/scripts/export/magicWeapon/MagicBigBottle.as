package export.magicWeapon
{
   import base.*;
   import com.greensock.*;
   import export.magicWeapon.MagicBigBottleChild.*;
   import flash.events.Event;
   import flash.geom.*;
   import my.MyEquipObj;
   
   public class MagicBigBottle extends BaseMagicWeapon
   {
      
      private var bingWall:StageBoat;
      
      public function MagicBigBottle(param1:BaseHero)
      {
         super(param1);
         this.bmwId = BaseMagicWeapon.BMW_BigBottle;
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:Object = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("MagicBigSwordBmd");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],100,150,new Point(0,0));
            bbdc.setOffsetXY(0,0);
            bbdc.setFrameStopCount([[10],[9999]]);
            bbdc.setFrameCount([1,1]);
            bbdc.setAddScriptWhenFrameOver(scriptFrameOverFunc);
            this.addChild(bbdc);
            return;
         }
         throw new Error("MagicBigSword--BitmapData Error!");
      }
      
      override public function step() : void
      {
         super.step();
      }
      
      override public function showSkill() : void
      {
         var timeCount:Number = Number(NaN);
         var equip:MyEquipObj = null;
         if(this.bingWall)
         {
            this.bingWall.destroy();
            this.bingWall = null;
         }
         this.bingWall = new StageBoat(this.sourceRole,gc.frameClips * 20);
         this.bingWall.addEventListener("destroy",this.__destroy);
         this.bingWall.x = this.sourceRole.x;
         this.bingWall.y = Number(this.sourceRole.y) - 100;
         gc.pWorld.getWallArray().push(this.bingWall);
         gc.gameSence.addChild(this.bingWall);
         timeCount = 60;
         if(Boolean(this.sourceRole) && Boolean(this.sourceRole.getPlayer()))
         {
            equip = this.sourceRole.getPlayer().getCurEquipByType("zbfb");
            if(Boolean(equip) && equip.getWX().indexOf("木") != -1)
            {
               timeCount = 40;
            }
         }
         TweenMax.delayedCall(timeCount,function(param1:MagicBigBottle):*
         {
            param1.setAction("wait");
         },[this]);
      }
      
      private function __destroy(param1:Event) : void
      {
         this.bingWall = null;
      }
   }
}

