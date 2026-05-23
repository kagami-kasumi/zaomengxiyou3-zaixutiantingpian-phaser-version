package export.magicWeapon
{
   import base.*;
   import com.greensock.*;
   import export.bullet.*;
   import flash.geom.*;
   import my.MyEquipObj;
   
   public class MagicYuban extends BaseMagicWeapon
   {
      
      public function MagicYuban(param1:BaseHero)
      {
         super(param1);
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("MagicYubanBmd");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],59,75,new Point(0,0));
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
            super.useSkill();
         }
      }
      
      override public function showSkill() : void
      {
         var bullet:* = undefined;
         var mon:* = undefined;
         var body:SpecialEffectBullet = null;
         var cd:int = 30;
         var equip:MyEquipObj = this.sourceRole.getPlayer().getCurEquipByType("zbfb");
         if(equip)
         {
            body = new SpecialEffectBullet("yubanEffect");
            body.x = this.sourceRole.x + 15;
            body.y = 420;
            body.setRole(this.sourceRole);
            body.setDirect(0);
            body.setDisable();
            body.setDestroyWhenLastFrame(false);
            body.setDestroyInCount(gc.frameClips * 5);
            body.setFuncWhenEnterFrame(this.checkHit);
            body.setAction("hit1");
            gc.gameSence.addChild(body);
            this.sourceRole.magicBulletArray.push(body);
            if(equip.getWX().indexOf("木") != -1)
            {
               cd -= 5;
            }
            TweenMax.delayedCall(20,function(param1:MagicYuban):*
            {
               param1.setAction("wait");
            },[this]);
         }
      }
      
      private function checkHit(param1:*) : void
      {
         var _loc2_:int = 0;
         var _loc3_:int = this.sourceRole.getPlayer().getCurEquipByType("zbfb").getELevel() * 20;
         var _loc4_:* = undefined;
         var _loc5_:* = undefined;
         var _loc6_:Array = gc.pWorld.monsterArray;
         if(!param1)
         {
            return;
         }
         for each(_loc5_ in _loc6_)
         {
            if(_loc5_.magicBulletArray)
            {
               for each(_loc4_ in _loc5_.magicBulletArray)
               {
                  if(_loc4_.sourceRole)
                  {
                     if(param1.getImgMc().hitTestObject(_loc4_.getImgMc()))
                     {
                        if(Boolean(_loc5_) && !_loc5_.isDead())
                        {
                           _loc2_ = Number(_loc4_.sourceRole.getRealPower(_loc4_.curAction).hurt) * _loc3_;
                           _loc5_.reduceHp(_loc2_);
                           _loc5_.addMonHurtMc(_loc2_,false);
                           param1.destroy();
                        }
                     }
                  }
               }
            }
         }
      }
   }
}

