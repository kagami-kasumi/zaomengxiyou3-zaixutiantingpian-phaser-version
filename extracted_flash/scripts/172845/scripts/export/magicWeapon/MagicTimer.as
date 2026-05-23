package export.magicWeapon
{
   import base.*;
   import com.greensock.*;
   import export.bullet.*;
   import flash.geom.*;
   import my.MyEquipObj;
   
   public class MagicTimer extends BaseMagicWeapon
   {
      
      private var premp:int;
      
      private var prehp:int;
      
      private var prex:Number;
      
      private var prey:Number;
      
      private var premagicweaponx:Number;
      
      private var premagicweapony:Number;
      
      public var wait:SpecialEffectBullet;
      
      public function MagicTimer(param1:BaseHero)
      {
         super(param1);
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("MagicTime");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],100,100,new Point(0,0));
            bbdc.setOffsetXY(-20,-10);
            bbdc.setFrameStopCount([[12,12,12,12,12,12],[9999]]);
            bbdc.setFrameCount([6,1]);
            bbdc.setAddScriptWhenFrameOver(scriptFrameOverFunc);
            this.addChild(bbdc);
            return;
         }
         throw new Error("MagicTime--BitmapData Error!");
      }
      
      override public function showSkill() : void
      {
         var bb:SpecialEffectBullet = null;
         bb = null;
         var equip:MyEquipObj = null;
         var cd:int = 30;
         this.prehp = this.sourceRole.roleProperies.getHHP();
         this.premp = this.sourceRole.roleProperies.getMMP();
         this.prex = this.sourceRole.x;
         this.prey = this.sourceRole.y;
         this.premagicweaponx = this.x;
         this.premagicweapony = this.y;
         bb = new SpecialEffectBullet("MagicTimeStartEffect");
         bb.x = this.x;
         bb.y = this.y;
         bb.setDisable();
         bb.setRole(this.sourceRole);
         bb.setAction("wait");
         this.sourceRole.magicBulletArray.push(bb);
         gc.gameSence.addChild(bb);
         bb = new SpecialEffectBullet("MagicTimeStart");
         bb.x = this.x;
         bb.y = this.y;
         bb.setDisable();
         bb.setRole(this.sourceRole);
         bb.setAction("wait");
         this.sourceRole.magicBulletArray.push(bb);
         gc.gameSence.addChild(bb);
         this.wait = new SpecialEffectBullet("MagicTimeWait");
         this.wait.x = this.x;
         this.wait.y = this.y;
         this.wait.setDisable();
         this.wait.setRole(this.sourceRole);
         this.wait.setAction("wait");
         if(this.sourceRole.getPlayer())
         {
            equip = this.sourceRole.getPlayer().getCurEquipByType("zbfb");
            if(equip)
            {
               if(equip.getWX().indexOf("木") != -1)
               {
                  cd = 27;
               }
            }
         }
         this.sourceRole.magicBulletArray.push(this.wait);
         gc.gameSence.addChild(this.wait);
         this.wait.setFuncWhenDestroy(this.returnpos);
         TweenMax.delayedCall(cd,function(param1:MagicTimer):*
         {
            param1.setAction("wait");
         },[this]);
      }
      
      private function returnpos(param1:BaseBullet) : *
      {
         var bb:SpecialEffectBullet = new SpecialEffectBullet("MagicTimeOver");
         bb.x = this.premagicweaponx;
         bb.y = this.premagicweapony;
         bb.setDisable();
         bb.setRole(this.sourceRole);
         bb.setAction("wait");
         this.sourceRole.magicBulletArray.push(bb);
         gc.gameSence.addChild(bb);
         TweenMax.to(this.sourceRole,1,{
            "x":this.prex,
            "y":this.prey,
            "onComplete":function():*
            {
               sourceRole.roleProperies.setHHP(prehp);
               sourceRole.roleProperies.setMMP(premp);
            }
         });
         this.wait = null;
      }
   }
}

