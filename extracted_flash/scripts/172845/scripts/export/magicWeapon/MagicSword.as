package export.magicWeapon
{
   import base.*;
   import export.bullet.*;
   import flash.events.Event;
   import flash.geom.*;
   import my.MyEquipObj;
   
   public class MagicSword extends BaseMagicWeapon
   {
      
      private var swordEffect:BaseBullet;
      
      public function MagicSword(param1:BaseHero)
      {
         super(param1);
         this.bmwId = BaseMagicWeapon.BMW_Sword;
         this.mp = 30;
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("MagicSwordBmd");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],2 * 60,2 * 60,new Point(0,0));
            bbdc.setOffsetXY(0,0);
            bbdc.setFrameStopCount([[10],[9999]]);
            bbdc.setFrameCount([1,1]);
            bbdc.setAddScriptWhenFrameOver(scriptFrameOverFunc);
            this.addChild(bbdc);
            return;
         }
         throw new Error("MagicSword--BitmapData Error!");
      }
      
      override public function showSkill() : void
      {
         var _loc1_:MyEquipObj = null;
         var _loc2_:* = null;
         var _loc3_:ThroughWallBullet = new ThroughWallBullet(-18);
         _loc1_ = this.sourceRole.getPlayer().getCurEquipByType("zbfb");
         if(_loc1_.getWX().indexOf("木") != -1)
         {
            _loc3_.setStopDoubleCount();
         }
         _loc3_.addEventListener("destroy",this.__bulletDestroy,false,0,true);
         _loc3_.setUserDataName("MagicUmbrellaHit1");
         _loc3_.x = this.sourceRole.x;
         _loc3_.y = this.sourceRole.y;
         gc.pWorld.getWallArray().push(_loc3_);
         gc.gameSence.addChild(_loc3_);
         if(!this.swordEffect)
         {
            _loc2_ = new SpecialEffectBullet("SwordEffect");
            _loc2_.setRole(this.sourceRole);
            _loc2_.setDestroyWhenLastFrame(false);
            _loc2_.setDestroyWhenMaxHitCountLessThenZero(false);
            _loc2_.setAction("fabao-sword");
            _loc2_.setFollowObj(_loc3_);
            this.sourceRole.magicBulletArray.push(_loc2_);
            gc.gameSence.addChild(_loc2_);
            this.swordEffect = _loc2_;
         }
      }
      
      private function __bulletDestroy(param1:Event) : void
      {
         this.setAction("wait");
         if(this.swordEffect)
         {
            this.swordEffect.destroy();
            this.swordEffect = null;
         }
      }
   }
}

