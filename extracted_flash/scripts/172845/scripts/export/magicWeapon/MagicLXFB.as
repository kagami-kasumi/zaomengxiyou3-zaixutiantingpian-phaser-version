package export.magicWeapon
{
   import base.*;
   import com.greensock.*;
   import flash.geom.*;
   import my.MyEquipObj;
   
   public class MagicLXFB extends BaseMagicWeapon
   {
      
      public function MagicLXFB(param1:BaseHero)
      {
         super(param1);
         this.bmwId = BaseMagicWeapon.BMW_LXFB;
         this.mp = 10;
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("MagicLXFBBmd");
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
         throw new Error("MagicLXFBBmd--BitmapData Error!");
      }
      
      override public function showSkill() : void
      {
         var timeCount:uint = 0;
         var equip:MyEquipObj = null;
         if(this.sourceRole)
         {
            timeCount = gc.frameClips * 7;
            equip = this.sourceRole.getPlayer().getCurEquipByType("zbfb");
            if(Boolean(equip) && equip.getWX().indexOf("木") != -1)
            {
               timeCount = gc.frameClips * 10;
            }
            this.sourceRole.addCurAddEffect([{
               "name":BaseAddEffect.XLFB_BUFF,
               "time":timeCount
            }]);
            TweenMax.delayedCall(21,function(param1:MagicLXFB):*
            {
               param1.setAction("wait");
            },[this]);
         }
      }
   }
}

