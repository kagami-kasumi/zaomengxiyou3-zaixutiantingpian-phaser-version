package export.magicWeapon
{
   import base.*;
   import com.greensock.*;
   import flash.geom.*;
   import my.MyEquipObj;
   
   public class MagicUmbrella2 extends BaseMagicWeapon
   {
      
      public function MagicUmbrella2(param1:BaseHero)
      {
         super(param1);
         this.bmwId = BaseMagicWeapon.BMW_Umbrella;
         this.mp = 40;
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("MagicUmbrellaBmd2");
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
         throw new Error("MagicUmbrella2--BitmapData Error!");
      }
      
      override public function showSkill() : void
      {
         var def:Number = Number(NaN);
         var def2:Number = Number(NaN);
         var equip:MyEquipObj = null;
         var defendValue:uint = 0;
         if(this.sourceRole.getPlayer())
         {
            equip = this.sourceRole.getPlayer().getCurEquipByType("zbfb");
            defendValue = 0;
            if(equip)
            {
               def = Number(this.sourceRole.roleProperies.getDefense());
               def2 = Number(this.sourceRole.roleProperies.getMagicDef());
               if(def <= 0)
               {
                  def = 1;
               }
               defendValue = def * equip.getELevel() + def2 * equip.getELevel() * 20;
               if(equip.getWX().indexOf("木") != -1)
               {
                  defendValue *= 2;
               }
               this.sourceRole.addCurAddEffect([{
                  "name":BaseAddEffect.MAGIC_UMBRELLA_DEFEND2,
                  "time":gc.frameClips * 10,
                  "defendValue":defendValue
               }]);
            }
         }
         TweenMax.delayedCall(30,function(param1:MagicUmbrella2):*
         {
            param1.setAction("wait");
         },[this]);
      }
   }
}

