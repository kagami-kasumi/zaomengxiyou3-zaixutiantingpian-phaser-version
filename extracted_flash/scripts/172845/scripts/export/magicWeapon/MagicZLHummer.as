package export.magicWeapon
{
   import base.*;
   import com.greensock.*;
   import export.bullet.*;
   import flash.geom.*;
   import my.MyEquipObj;
   
   public class MagicZLHummer extends BaseMagicWeapon
   {
      
      public function MagicZLHummer(param1:BaseHero)
      {
         super(param1);
         this.bmwId = BaseMagicWeapon.BMW_BG;
         this.mp = 10;
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("ZLHummerBmd");
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
      
      override public function showSkill() : void
      {
         var mon:* = undefined;
         var b:SpecialEffectBullet = null;
         var parentIdx:int = 0;
         var time:int = 0;
         var mons:Array = null;
         var equip:MyEquipObj = this.sourceRole.getPlayer().getCurEquipByType("zbfb");
         if(equip)
         {
            if(equip.getELevel() >= 1)
            {
               b = new SpecialEffectBullet("zltcskill","zltcbox");
               if(this.sourceRole.getBBDC().getDirect() == 0)
               {
                  b.x = this.sourceRole.x - 160;
               }
               else
               {
                  b.x = this.sourceRole.x + 160;
               }
               b.y = this.sourceRole.y - 42;
               b.setRole(this.sourceRole);
               b.setDirect(this.sourceRole.getBBDC().getDirect());
               b.setAction("fabao-zltc");
               b.setDisable();
               parentIdx = gc.gameSence.getChildIndex(this.sourceRole);
               if(parentIdx != -1)
               {
                  gc.gameSence.addChildAt(b,parentIdx);
               }
               this.sourceRole.magicBulletArray.push(b);
               time = 25;
               if(equip.getWX().indexOf("木") != -1)
               {
                  time = 20;
               }
               TweenMax.delayedCall(time,function(param1:MagicZLHummer):*
               {
                  param1.setAction("wait");
               },[this]);
            }
         }
      }
   }
}

