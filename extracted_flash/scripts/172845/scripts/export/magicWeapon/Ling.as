package export.magicWeapon
{
   import base.*;
   import com.greensock.*;
   import export.bullet.*;
   import flash.geom.*;
   import my.MyEquipObj;
   
   public class Ling extends BaseMagicWeapon
   {
      
      private var totalNum:int = 120;
      
      public function Ling(param1:BaseHero)
      {
         super(param1);
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("LingBmd");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],150,150,new Point(0,0));
            bbdc.setOffsetXY(0,0);
            bbdc.setFrameStopCount([[5,5,5,5,5,5],[9999]]);
            bbdc.setFrameCount([6,1]);
            bbdc.setAddScriptWhenFrameOver(scriptFrameOverFunc);
            this.addChild(bbdc);
            return;
         }
         throw new Error("Ling--BitmapData Error!");
      }
      
      override public function showSkill() : void
      {
         var _loc1_:int = 0;
         var equip:MyEquipObj = null;
         var equiplevel:uint = 0;
         var _loc4_:* = null;
         var cd:int = 25;
         var bb:SpecialEffectBullet = new SpecialEffectBullet("LingPaiEffect");
         bb.x = this.x;
         bb.y = this.y + 200;
         bb.setDisable();
         bb.setRole(this.sourceRole);
         bb.setAction("wait");
         this.sourceRole.magicBulletArray.push(bb);
         gc.gameSence.addChild(bb);
         _loc1_ = 0;
         while(_loc1_ < this.totalNum)
         {
            this.createSnow();
            _loc1_++;
         }
         if(this.sourceRole.getPlayer())
         {
            equip = this.sourceRole.getPlayer().getCurEquipByType("zbfb");
            if(equip)
            {
               if(equip.getWX().indexOf("木") != -1)
               {
                  cd = 20;
               }
               equiplevel = uint(equip.getELevel());
            }
         }
         TweenMax.delayedCall(cd,function(param1:Ling):*
         {
            param1.setAction("wait");
         },[this]);
      }
      
      private function createSnow() : void
      {
         var _loc1_:Number = 0;
         var _loc2_:EnemyMoveBullet = new EnemyMoveBullet("ef_snow");
         _loc2_.x = -gc.gameSence.x - 500 + Math.random() * (940 + 300);
         _loc2_.y = -gc.gameSence.y - 480 + Math.random() * 100;
         _loc1_ = 50 + 10 * Math.random();
         var _loc3_:Number = _loc1_ / 180 * 3.141592653589793;
         var _loc4_:Number = Math.random() * 10 / 2 + 10;
         _loc2_.setSpeed(Math.cos(_loc3_) * _loc4_,Math.sin(_loc3_) * _loc4_);
         _loc2_.rotation = _loc1_;
         _loc2_.alpha = Math.random() + 0.2;
         _loc2_.setDirect(0);
         _loc2_.setDestroyWhenLastFrame(false);
         _loc2_.setDistance(1500);
         _loc2_.setRole(this.sourceRole);
         _loc2_.setAction("fabao-snow");
         this.sourceRole.magicBulletArray.push(_loc2_);
         gc.gameSence.addChild(_loc2_);
      }
   }
}

