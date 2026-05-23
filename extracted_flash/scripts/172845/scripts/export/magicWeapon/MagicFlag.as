package export.magicWeapon
{
   import base.*;
   import com.greensock.*;
   import export.bullet.*;
   import flash.geom.*;
   import my.MyEquipObj;
   
   public class MagicFlag extends BaseMagicWeapon
   {
      
      public function MagicFlag(param1:BaseHero)
      {
         super(param1);
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("MagicFlagBmd");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],100,100,new Point(0,0));
            bbdc.setOffsetXY(-20,-10);
            bbdc.setFrameStopCount([[6,6,6,6,6,6],[9999]]);
            bbdc.setFrameCount([6,1]);
            bbdc.setAddScriptWhenFrameOver(scriptFrameOverFunc);
            this.addChild(bbdc);
            return;
         }
         throw new Error("MagicFlag--BitmapData Error!");
      }
      
      override public function showSkill() : void
      {
         var effect:FollowBaseObjectBullet = null;
         var equip:MyEquipObj = null;
         var cd:int = 60;
         var bb:SpecialEffectBullet = new SpecialEffectBullet("MagicFlagStart");
         bb.x = this.x;
         bb.y = this.y;
         bb.setDisable();
         bb.setRole(this.sourceRole);
         bb.setAction("wait");
         this.sourceRole.magicBulletArray.push(bb);
         gc.gameSence.addChild(bb);
         effect = new FollowBaseObjectBullet("MagicFlagEffect");
         effect.x = this.sourceRole.x;
         effect.y = this.sourceRole.y;
         effect.setDestroyInCount(gc.frameClips * 10);
         effect.setHurtCanCutDownEffect(false);
         effect.setDestroyWhenLastFrame(false);
         effect.setRole(this.sourceRole);
         effect.setDisable();
         effect.setDirect(0);
         effect.setAction("wait");
         this.sourceRole.magicBulletArray.push(effect);
         gc.gameSence.addChild(effect);
         if(this.sourceRole.getPlayer())
         {
            equip = this.sourceRole.getPlayer().getCurEquipByType("zbfb");
            if(equip)
            {
               if(equip.getWX().indexOf("木") != -1)
               {
                  cd = 50;
               }
            }
         }
         TweenMax.delayedCall(cd,function(param1:MagicFlag):*
         {
            param1.setAction("wait");
         },[this]);
      }
   }
}

