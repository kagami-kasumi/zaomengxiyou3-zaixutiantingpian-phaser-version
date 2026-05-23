package export.magicWeapon
{
   import base.*;
   import com.greensock.*;
   import export.bullet.*;
   import flash.geom.*;
   import my.MyEquipObj;
   
   public class MagicBagua extends BaseMagicWeapon
   {
      
      public function MagicBagua(param1:BaseHero)
      {
         super(param1);
         this.bmwId = BaseMagicWeapon.BMW_BG;
         this.mp = 10;
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("MagicBaguaBmd");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],50,50,new Point(0,0));
            bbdc.setOffsetXY(1,-10);
            bbdc.setFrameStopCount([[10],[9999]]);
            bbdc.setFrameCount([1,1]);
            bbdc.setAddScriptWhenFrameOver(scriptFrameOverFunc);
            this.addChild(bbdc);
            return;
         }
         throw new Error("MagicBagua--BitmapData Error!");
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
      
      override public function showSkill() : void
      {
         var b:SpecialEffectBullet = null;
         var mon:* = undefined;
         b = null;
         var parentIdx:int = 0;
         var time:int = 0;
         var mons:Array = null;
         var equip:MyEquipObj = this.sourceRole.getPlayer().getCurEquipByType("zbfb");
         if(equip)
         {
            if(equip.getELevel() >= 1)
            {
               b = new SpecialEffectBullet("baguaEffect");
               b.x = this.sourceRole.x;
               b.y = this.sourceRole.y + 40;
               b.setRole(this.sourceRole);
               b.setDirect(0);
               b.setDisable();
               b.setAction("hit1");
               parentIdx = gc.gameSence.getChildIndex(this.sourceRole);
               if(parentIdx != -1)
               {
                  gc.gameSence.addChildAt(b,parentIdx);
               }
               this.sourceRole.magicBulletArray.push(b);
               time = gc.frameClips * 6;
               if(equip.getWX().indexOf("木") != -1)
               {
                  time = gc.frameClips * 8;
               }
               mons = gc.pWorld.monsterArray;
               for each(mon in mons)
               {
                  if(!mon.isYourFather() && !mon.isDead())
                  {
                     mon.addCurAddEffect([{
                        "name":BaseAddEffect.STUN,
                        "time":time
                     }]);
                  }
               }
               TweenMax.delayedCall(24,function(param1:MagicBagua):*
               {
                  param1.setAction("wait");
               },[this]);
            }
         }
      }
   }
}

