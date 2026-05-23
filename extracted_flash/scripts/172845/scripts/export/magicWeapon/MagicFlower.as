package export.magicWeapon
{
   import base.*;
   import com.greensock.*;
   import export.bullet.*;
   import flash.geom.*;
   import my.MyEquipObj;
   
   public class MagicFlower extends BaseMagicWeapon
   {
      
      public function MagicFlower(param1:BaseHero)
      {
         super(param1);
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("MagicFlowerBmd");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],150,150,new Point(0,0));
            bbdc.setOffsetXY(-20,-10);
            bbdc.setFrameStopCount([[5,5,5,5,5,5,5],[9999]]);
            bbdc.setFrameCount([7,1]);
            bbdc.setAddScriptWhenFrameOver(scriptFrameOverFunc);
            this.addChild(bbdc);
            return;
         }
         throw new Error("MagicFlower--BitmapData Error!");
      }
      
      override public function showSkill() : void
      {
         var _loc4_:* = undefined;
         var equip:MyEquipObj = null;
         var equiplevel:uint = 0;
         _loc4_ = null;
         var cd:int = 30;
         var _loc1_:Array = gc.getPlayerArray();
         var _loc2_:uint = _loc1_.length;
         var _loc3_:int = 0;
         _loc4_ = null;
         var _loc5_:* = null;
         var _loc6_:Array = gc.pWorld.monsterArray;
         var _loc7_:uint = _loc6_.length;
         var _loc8_:int = 0;
         var bb:SpecialEffectBullet = new SpecialEffectBullet("MagicFlowereffect");
         bb.x = this.x;
         bb.y = this.y;
         bb.setDisable();
         bb.setRole(this.sourceRole);
         bb.setAction("wait");
         this.sourceRole.magicBulletArray.push(bb);
         gc.gameSence.addChild(bb);
         if(this.sourceRole.getPlayer())
         {
            equip = this.sourceRole.getPlayer().getCurEquipByType("zbfb");
            if(equip)
            {
               if(equip.getWX().indexOf("木") != -1)
               {
                  cd = 27;
               }
               equiplevel = uint(equip.getELevel());
            }
         }
         while(_loc3_ < _loc2_)
         {
            _loc4_ = _loc1_[_loc3_] as BaseHero;
            _loc4_.addCurAddEffect([{
               "name":BaseAddEffect.MAGIC_FLOWER_ADDBUFF,
               "time":gc.frameClips * (5 + equiplevel / 2),
               "value":uint(Number(this.sourceRole.roleProperies.getBasePower()) * 0.21)
            }]);
            if(_loc4_.getPet())
            {
               _loc4_.getPet().addCurAddEffect([{
                  "name":BaseAddEffect.MAGIC_FLOWER_ADDBUFF,
                  "time":gc.frameClips * (5 + equiplevel / 2),
                  "value":0.21
               }]);
            }
            _loc3_++;
         }
         while(_loc8_ < _loc7_)
         {
            _loc5_ = _loc6_[_loc8_] as BaseMonster;
            _loc5_.addCurAddEffect([{
               "name":BaseAddEffect.MAGIC_FLOWER_DEBUFF,
               "time":gc.frameClips * (5 + equiplevel / 2)
            }]);
            _loc8_++;
         }
         TweenMax.delayedCall(cd,function(param1:MagicFlower):*
         {
            param1.setAction("wait");
         },[this]);
      }
   }
}

