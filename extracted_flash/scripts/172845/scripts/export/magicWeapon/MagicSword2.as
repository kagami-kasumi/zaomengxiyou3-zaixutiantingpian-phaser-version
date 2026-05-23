package export.magicWeapon
{
   import base.*;
   import com.greensock.*;
   import export.bullet.*;
   import flash.events.Event;
   import flash.geom.*;
   
   public class MagicSword2 extends BaseMagicWeapon
   {
      
      private var swordEffect:BaseBullet;
      
      public function MagicSword2(param1:BaseHero)
      {
         super(param1);
         this.bmwId = BaseMagicWeapon.BMW_Sword;
         this.mp = 30;
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("MagicSwordBmd2");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],120,240,new Point(0,0));
            bbdc.setOffsetXY(-35,30);
            bbdc.setFrameStopCount([[10],[9999]]);
            bbdc.setFrameCount([1,1]);
            bbdc.setAddScriptWhenFrameOver(scriptFrameOverFunc);
            this.addChild(bbdc);
            return;
         }
         throw new Error("MagicSword2--BitmapData Error!");
      }
      
      override public function showSkill() : void
      {
         var direct:uint = uint(this.sourceRole.getBBDC().getDirect());
         var bb:SpecialEffectBullet = new SpecialEffectBullet("MagicSword2_1");
         bb.setRole(this.sourceRole);
         bb.setDisable();
         bb.setAction("wait");
         bb.x = this.sourceRole.x;
         bb.y = Number(this.sourceRole.y) - 50;
         this.sourceRole.magicBulletArray.push(bb);
         gc.gameSence.addChild(bb);
         TweenMax.delayedCall(1,function(param1:MagicSword2, param2:uint):*
         {
            param1.releasesword(param2);
         },[this,direct]);
         TweenMax.delayedCall(30,function(param1:MagicSword2):*
         {
            param1.setAction("wait");
         },[this]);
      }
      
      private function releasesword(param1:uint) : void
      {
         var _loc5_:SpecialEffectBullet = null;
         var _loc2_:Number = Number(NaN);
         var _loc3_:int = 0;
         var _loc4_:BaseMonster = null;
         _loc5_ = new SpecialEffectBullet("MagicSword2_2");
         var _loc6_:int = 0;
         var _loc7_:BaseMonster = null;
         var _loc8_:Array = [];
         while(_loc6_ < gc.pWorld.monsterArray.length)
         {
            _loc7_ = gc.pWorld.monsterArray[_loc6_] as BaseMonster;
            _loc8_.push({
               "index":_loc6_,
               "dis":AUtils.GetDisBetweenTwoObj(_loc7_,this.sourceRole)
            });
            _loc6_++;
         }
         _loc6_ = 0;
         if(_loc8_.length > 0)
         {
            _loc2_ = Number(_loc8_[0].dis);
            _loc3_ = int(_loc8_[0].index);
            while(_loc6_ < _loc8_.length - 1)
            {
               if(_loc2_ > _loc8_[_loc6_ + 1].dis)
               {
                  _loc2_ = Number(_loc8_[_loc6_ + 1].dis);
                  _loc3_ = int(_loc8_[_loc6_ + 1].index);
               }
               _loc6_++;
            }
            _loc4_ = gc.pWorld.monsterArray[_loc3_];
         }
         if(_loc4_)
         {
            _loc5_.x = _loc4_.x;
            _loc5_.y = _loc4_.y + 15;
            _loc5_.setRole(this.sourceRole);
            _loc5_.setDirect(param1);
            _loc5_.setAction("magicsword2");
            gc.gameSence.addChild(_loc5_);
            this.sourceRole.magicBulletArray.push(_loc5_);
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

