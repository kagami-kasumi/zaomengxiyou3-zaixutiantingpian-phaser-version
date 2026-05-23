package export.magicWeapon
{
   import base.*;
   import com.greensock.*;
   import export.bullet.*;
   import flash.geom.*;
   import my.MyEquipObj;
   
   public class MagicRing extends BaseMagicWeapon
   {
      
      public function MagicRing(param1:BaseHero)
      {
         super(param1);
         this.bmwId = BaseMagicWeapon.BMW_Ring;
         this.mp = 50;
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("MagicRingBmd");
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
         throw new Error("MagicRing--BitmapData Error!");
      }
      
      override public function showSkill() : void
      {
         var lv:Number = Number(NaN);
         var timeCount:uint = 0;
         var equip:MyEquipObj = null;
         var bb:SpecialEffectBullet = new SpecialEffectBullet("MagicRingEffect");
         bb.x = this.x;
         bb.y = this.y;
         bb.setDisable();
         bb.setRole(this.sourceRole);
         bb.setAction("wait");
         this.sourceRole.magicBulletArray.push(bb);
         gc.gameSence.addChild(bb);
         timeCount = gc.frameClips * 2;
         equip = this.sourceRole.getPlayer().getCurEquipByType("zbfb");
         lv = equip.getELevel() * 0.00904;
         if(equip.getWX().indexOf("木") != -1)
         {
            lv *= 2;
            timeCount *= 1.5;
         }
         this.sourceRole.setYourFather(timeCount);
         this.sourceRole.cureHp(Number(this.sourceRole.roleProperies.getSHHP()) * lv);
         this.sourceRole.cureMp(Number(this.sourceRole.roleProperies.getSMMP()) * lv / 2);
         TweenMax.delayedCall(30,function(param1:MagicRing):*
         {
            param1.setAction("wait");
         },[this]);
      }
   }
}

