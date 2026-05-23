package export.magicWeapon
{
   import base.*;
   import com.greensock.*;
   import flash.geom.*;
   import my.MyEquipObj;
   
   public class MagicUmbrella extends BaseMagicWeapon
   {
      
      public function MagicUmbrella(param1:BaseHero)
      {
         super(param1);
         this.bmwId = BaseMagicWeapon.BMW_Umbrella;
         this.mp = 40;
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("MagicUmbrellaBmd");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],100,100,new Point(0,0));
            bbdc.setOffsetXY(1,-10);
            bbdc.setFrameStopCount([[10],[9999]]);
            bbdc.setFrameCount([1,1]);
            bbdc.setAddScriptWhenFrameOver(scriptFrameOverFunc);
            this.addChild(bbdc);
            return;
         }
         throw new Error("MagicUmbrella--BitmapData Error!");
      }
      
      override public function showSkill() : void
      {
         var def:Number = Number(NaN);
         var equip:MyEquipObj = null;
         var defendValue:uint = 0;
         if(this.sourceRole.getPlayer())
         {
            equip = this.sourceRole.getPlayer().getCurEquipByType("zbfb");
            defendValue = 0;
            if(equip)
            {
               def = Number(this.sourceRole.roleProperies.getDefense());
               if(def <= 0)
               {
                  def = 1;
               }
               defendValue = def * equip.getELevel();
               if(equip.getWX().indexOf("木") != -1)
               {
                  defendValue *= 1.5;
               }
               this.sourceRole.addCurAddEffect([{
                  "name":BaseAddEffect.MAGIC_UMBRELLA_DEFEND,
                  "time":gc.frameClips * 10,
                  "defendValue":defendValue
               }]);
            }
         }
         TweenMax.delayedCall(30,function(param1:MagicUmbrella):*
         {
            param1.setAction("wait");
         },[this]);
      }
   }
}

