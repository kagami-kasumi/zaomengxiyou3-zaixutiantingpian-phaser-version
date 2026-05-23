package export.magicWeapon
{
   import base.*;
   import com.greensock.*;
   import flash.geom.*;
   import my.MyEquipObj;
   
   public class MagicLeaf2 extends BaseMagicWeapon
   {
      
      public function MagicLeaf2(param1:BaseHero)
      {
         super(param1);
         this.bmwId = BaseMagicWeapon.BMW_Leaf;
         this.mp = 10;
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("MagicLeafBmd2");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],100,100,new Point(0,0));
            bbdc.setOffsetXY(1,-40);
            bbdc.setFrameStopCount([[10],[9999]]);
            bbdc.setFrameCount([1,1]);
            bbdc.setAddScriptWhenFrameOver(scriptFrameOverFunc);
            this.addChild(bbdc);
            return;
         }
         throw new Error("MagicLeaf2--BitmapData Error!");
      }
      
      override public function showSkill() : void
      {
         var timeCount:uint = 0;
         var equip:MyEquipObj = null;
         if(this.sourceRole)
         {
            timeCount = gc.frameClips * 8;
            equip = this.sourceRole.getPlayer().getCurEquipByType("zbfb");
            if(equip.getWX().indexOf("木") != -1)
            {
               timeCount *= 1.5;
            }
            this.sourceRole.addCurAddEffect([{
               "name":BaseAddEffect.MAGIC_LEAF_CURE2,
               "time":timeCount
            }]);
            TweenMax.delayedCall(30,function(param1:MagicLeaf2):*
            {
               param1.setAction("wait");
            },[this]);
         }
      }
   }
}

