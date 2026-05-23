package export.magicWeapon
{
   import base.*;
   import com.greensock.*;
   import flash.geom.*;
   import my.MyEquipObj;
   
   public class MagicYXFB extends BaseMagicWeapon
   {
      
      public function MagicYXFB(param1:BaseHero)
      {
         super(param1);
         this.bmwId = BaseMagicWeapon.BMW_YXFB;
         this.mp = 10;
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("MagicYXFBBmd");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],61,50,new Point(0,0));
            bbdc.setOffsetXY(1,-10);
            bbdc.setFrameStopCount([[10],[9999]]);
            bbdc.setFrameCount([1,1]);
            bbdc.setAddScriptWhenFrameOver(scriptFrameOverFunc);
            this.addChild(bbdc);
            return;
         }
         throw new Error("MagicYXFBBmd--BitmapData Error!");
      }
      
      override public function showSkill() : void
      {
         var timeCount:uint = 0;
         var equip:MyEquipObj = null;
         if(this.sourceRole)
         {
            this.sourceRole.reduceHp(this.sourceRole.roleProperies.getHHP() / 2);
            timeCount = gc.frameClips * 8;
            equip = this.sourceRole.getPlayer().getCurEquipByType("zbfb");
            if(Boolean(equip) && equip.getWX().indexOf("木") != -1)
            {
               timeCount *= 2;
            }
            this.sourceRole.addCurAddEffect([{
               "name":BaseAddEffect.YXFB_BUFF2,
               "time":timeCount
            }]);
            TweenMax.delayedCall(21,function(param1:MagicYXFB):*
            {
               param1.setAction("wait");
            },[this]);
         }
      }
      
      override public function destroy() : void
      {
         if(Boolean(this.sourceRole) && false)
         {
            if(this.sourceRole.curAddEffect)
            {
               this.sourceRole.curAddEffect.removeBuffByName(BaseAddEffect.YXFB_BUFF);
            }
         }
         super.destroy();
      }
   }
}

