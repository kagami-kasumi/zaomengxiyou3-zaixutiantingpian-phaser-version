package export.magicWeapon
{
   import base.*;
   import com.greensock.*;
   import export.bullet.*;
   import flash.events.*;
   import flash.geom.*;
   import my.MyEquipObj;
   
   public class MagicPearl extends BaseMagicWeapon
   {
      
      private var bullet:EnemyMoveBullet;
      
      private var effect:SpecialEffectBullet;
      
      private var target:BaseMonster;
      
      private var protectedObj:Object;
      
      private var attacktimes:int;
      
      private var times:int;
      
      private var lastx:Number;
      
      private var lasty:Number;
      
      private var xx:Number;
      
      private var yy:Number;
      
      private var dir:int;
      
      private var hit1:Boolean;
      
      private var hit2:Boolean;
      
      private var hit3:Boolean;
      
      private var attackbullet:SpecialEffectBullet;
      
      public function MagicPearl(param1:BaseHero)
      {
         this.protectedObj = {"attackTime":0};
         super(param1);
         this.bmwId = BaseMagicWeapon.BMW_pearl;
      }
      
      override public function step() : void
      {
         super.step();
      }
      
      override protected function setPosition2() : void
      {
         if(!this.isUsing())
         {
            super.setPosition2();
         }
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("MagicPearlBmd2");
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
         throw new Error("MagicPearl--BitmapData Error!");
      }
      
      override public function showSkill() : void
      {
         var bb:SpecialEffectBullet = null;
         var equip:MyEquipObj = null;
         this.mp = 100 + Number(this.sourceRole.roleProperies.getMMP()) * 0.02;
         bb = new SpecialEffectBullet("MagicPearlBegin");
         equip = this.sourceRole.getPlayer().getCurEquipByType("zbfb");
         this.attacktimes = 3 + equip.getELevel() / 3;
         if(equip.getWX().indexOf("木") != -1)
         {
            this.attacktimes += 2;
         }
         bb.x = this.x;
         bb.y = this.y;
         bb.setDisable();
         bb.setRole(this.sourceRole);
         bb.setAction("wait");
         this.sourceRole.magicBulletArray.push(bb);
         gc.gameSence.addChild(bb);
         bb.setDirect(this.sourceRole.getBBDC().getDirect());
         bb.setFuncWhenDestroy(this.run);
         TweenMax.delayedCall(30,function(param1:MagicPearl):*
         {
            param1.setAction("wait");
         },[this]);
      }
      
      private function run(param1:BaseBullet) : *
      {
         var _loc2_:Number = Number(NaN);
         var _loc3_:int = 0;
         var _loc4_:BaseMonster = null;
         if(this.attackbullet)
         {
            this.attackbullet.removeEventListener(Event.ENTER_FRAME,this.func);
         }
         var _loc5_:int = 0;
         var _loc6_:BaseMonster = null;
         var _loc7_:Array = [];
         while(_loc5_ < gc.pWorld.monsterArray.length)
         {
            _loc6_ = gc.pWorld.monsterArray[_loc5_] as BaseMonster;
            _loc7_.push({
               "index":_loc5_,
               "dis":AUtils.GetDisBetweenTwoObj(_loc6_,this.sourceRole)
            });
            _loc5_++;
         }
         _loc5_ = 0;
         if(_loc7_.length > 0)
         {
            _loc2_ = Number(_loc7_[0].dis);
            _loc3_ = int(_loc7_[0].index);
            while(_loc5_ < _loc7_.length - 1)
            {
               if(_loc2_ > _loc7_[_loc5_ + 1].dis)
               {
                  _loc2_ = Number(_loc7_[_loc5_ + 1].dis);
                  _loc3_ = int(_loc7_[_loc5_ + 1].index);
               }
               _loc5_++;
            }
            _loc4_ = gc.pWorld.monsterArray[_loc3_];
         }
         ++this.times;
         if(this.times > this.attacktimes)
         {
            this.times = 0;
            this.dowhendestroy();
            return;
         }
         if(!_loc4_)
         {
            this.dowhendestroy();
            return;
         }
         var _loc8_:SpecialEffectBullet = null;
         if(this.times > 1)
         {
            _loc8_ = new SpecialEffectBullet("MagicPearlBack");
            _loc8_.x = this.lastx;
            _loc8_.y = this.lasty;
         }
         else
         {
            _loc8_ = new SpecialEffectBullet("MagicPearlRun");
            _loc8_.x = this.x;
            _loc8_.y = this.y;
         }
         _loc8_.setDisable();
         _loc8_.setRole(this.sourceRole);
         _loc8_.setAction("wait");
         this.sourceRole.magicBulletArray.push(_loc8_);
         gc.gameSence.addChild(_loc8_);
         if(this.times > 1)
         {
            if(this.lastx < _loc4_.x)
            {
               this.dir = 1;
               AUtils.flipHorizontal(_loc8_,-1);
               TweenMax.to(_loc8_,0.5,{
                  "x":_loc4_.x - 30,
                  "y":_loc4_.y
               });
            }
            else
            {
               this.dir = 0;
               AUtils.flipHorizontal(_loc8_,1);
               TweenMax.to(_loc8_,0.5,{
                  "x":_loc4_.x + 30,
                  "y":_loc4_.y
               });
            }
         }
         else if(this.x < _loc4_.x)
         {
            this.dir = 1;
            AUtils.flipHorizontal(_loc8_,-1);
            TweenMax.to(_loc8_,0.5,{
               "x":_loc4_.x - 30,
               "y":_loc4_.y
            });
         }
         else
         {
            this.dir = 0;
            AUtils.flipHorizontal(_loc8_,1);
            TweenMax.to(_loc8_,0.5,{
               "x":_loc4_.x + 30,
               "y":_loc4_.y
            });
         }
         this.lastx = _loc4_.x;
         this.lasty = _loc4_.y;
         this.xx = _loc4_.x;
         this.yy = _loc4_.y;
         _loc8_.setFuncWhenDestroy(this.attack);
      }
      
      private function attack(param1:BaseBullet) : *
      {
         this.attackbullet = new SpecialEffectBullet("MagicPearlEffect");
         this.attackbullet.addEventListener(Event.ENTER_FRAME,this.func);
         this.attackbullet.x = this.xx;
         this.attackbullet.y = this.yy;
         this.attackbullet.setDisable();
         this.attackbullet.setRole(this.sourceRole);
         this.attackbullet.setAction("wait");
         this.sourceRole.magicBulletArray.push(this.attackbullet);
         gc.gameSence.addChild(this.attackbullet);
         this.attackbullet.setDirect(this.dir);
         this.attackbullet.setFuncWhenDestroy(this.run);
      }
      
      private function func(param1:Event) : *
      {
         if(this.attackbullet)
         {
            if(this.attackbullet.getImgMc().currentFrame == 3)
            {
               if(!this.hit1)
               {
                  this.hit1_1();
                  this.hit1 = true;
                  this.hit2 = false;
               }
            }
            else if(this.attackbullet.getImgMc().currentFrame == 12)
            {
               if(!this.hit2)
               {
                  this.hit1_2();
                  this.hit2 = true;
                  this.hit3 = false;
               }
            }
            else if(this.attackbullet.getImgMc().currentFrame == 28)
            {
               if(!this.hit3)
               {
                  this.hit1_3();
                  this.hit3 = true;
                  this.hit1 = false;
               }
            }
         }
      }
      
      public function hit1_1() : void
      {
         var _loc1_:SpecialEffectBullet = null;
         var _loc2_:* = null;
         if(this.sourceRole)
         {
            _loc1_ = new SpecialEffectBullet("MagicPearlBullet1");
            _loc1_.x = this.xx;
            _loc1_.y = Number(this.yy) - 15;
            _loc1_.setRole(this.sourceRole);
            _loc2_ = _loc1_.transform.matrix;
            _loc2_.a = this.transform.matrix.a;
            _loc1_.transform.matrix = _loc2_;
            _loc1_.setAction("fabao-pearl");
            _loc1_.setDirect(this.dir);
            gc.gameSence.addChild(_loc1_);
            this.sourceRole.magicBulletArray.push(_loc1_);
         }
      }
      
      public function hit1_2() : void
      {
         var _loc1_:* = null;
         var _loc2_:* = null;
         if(this.sourceRole)
         {
            _loc1_ = new SpecialEffectBullet("MagicPearlBullet2");
            _loc1_.x = this.xx;
            _loc1_.y = this.yy;
            _loc1_.setRole(this.sourceRole);
            _loc2_ = _loc1_.transform.matrix;
            _loc2_.a = this.transform.matrix.a;
            _loc1_.transform.matrix = _loc2_;
            _loc1_.setAction("fabao-pearl");
            _loc1_.setDirect(this.dir);
            gc.gameSence.addChild(_loc1_);
            this.sourceRole.magicBulletArray.push(_loc1_);
         }
      }
      
      public function hit1_3() : void
      {
         var _loc1_:* = null;
         var _loc2_:* = null;
         if(this.sourceRole)
         {
            _loc1_ = new SpecialEffectBullet("MagicPearlBullet3");
            _loc1_.x = this.xx;
            _loc1_.y = this.yy + 10;
            _loc1_.setRole(this.sourceRole);
            _loc2_ = _loc1_.transform.matrix;
            _loc2_.a = this.transform.matrix.a;
            _loc1_.transform.matrix = _loc2_;
            _loc1_.setAction("fabao-pearl");
            _loc1_.setDirect(this.dir);
            gc.gameSence.addChild(_loc1_);
            this.sourceRole.magicBulletArray.push(_loc1_);
         }
      }
      
      private function dowhendestroy() : *
      {
         var _loc1_:Number = Math.random();
         var _loc2_:MyEquipObj = this.sourceRole.getPlayer().getCurEquipByType("zbfb");
         var _loc3_:Number = _loc2_.getELevel();
         var _loc4_:Array = gc.pWorld.monsterArray;
         if(_loc2_.getWX().indexOf("木") != -1)
         {
            _loc3_ *= 1.5;
         }
         if(_loc1_ >= 0 && _loc1_ <= 0.33)
         {
            this.sourceRole.cureMp(Number(this.sourceRole.roleProperies.getSMMP()) * _loc3_ * 0.01);
         }
         else if(_loc1_ >= 0.34 && _loc1_ <= 0.66)
         {
            if(_loc4_.length == 0)
            {
               this.sourceRole.cureMp(Number(this.sourceRole.roleProperies.getSMMP()) * _loc3_ * 0.01);
               return;
            }
            for each(mon in _loc4_)
            {
               if(!mon.isYourFather() && !mon.isDead())
               {
                  mon.addCurAddEffect([{
                     "name":BaseAddEffect.STUN,
                     "time":gc.frameClips * (_loc3_ / 8)
                  }]);
               }
            }
         }
         else if(_loc1_ >= 0.67)
         {
            if(_loc4_.length == 0)
            {
               this.sourceRole.cureMp(Number(this.sourceRole.roleProperies.getSMMP()) * _loc3_ * 0.01);
               return;
            }
            for each(mon in _loc4_)
            {
               if(!mon.isYourFather() && !mon.isDead())
               {
                  mon.addCurAddEffect([{
                     "name":BaseAddEffect.POISON,
                     "time":gc.frameClips * (_loc3_ / 4),
                     "power":Number(this.sourceRole.roleProperies.getHurt()) * _loc3_ * 0.0413
                  },{
                     "name":BaseAddEffect.POISON_TIMES,
                     "time":gc.frameClips * (_loc3_ / 4)
                  }]);
               }
            }
         }
      }
   }
}

