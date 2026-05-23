package export.monster
{
   import base.*;
   import com.greensock.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   import my.*;
   
   public class Monster111 extends BaseMonster
   {
      
      private var isDazuo:Boolean = false;
      
      private var m112:Monster112;
      
      private var m113:Monster113;
      
      public function Monster111()
      {
         super();
         this.horizenSpeed = 4;
         this.setHp(1158765);
         this.setSHp(1158765);
         this.attackRange = 1000;
         this.alertRange = 1000;
         this.protectedParamsObject.def = 1195;
         this.protectedParamsObject.mdef = 0.42;
         this.protectedParamsObject.exp = 2000;
         this.protectedParamsObject.gxp = 1000;
         this.normalAttackRate = 0.1;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[6,-5],
            "attackInterval":10,
            "power":1874,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[6,-5],
            "attackInterval":10,
            "power":99999999,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[6,-5],
            "attackInterval":24,
            "power":99999999,
            "attackKind":"magic"
         };
         this.isBoss = true;
         this.monsterName = "罗宣";
         this.setAction("wait");
         this.protectedParamsObject.probability = 0.4;
         this.fallList = [{
            "name":"wpdh",
            "bigtype":"dj"
         }];
         TweenMax.delayedCall(5,function(param1:Monster111):*
         {
            param1.callFabao();
         },[this]);
      }
      
      private function callFabao() : void
      {
         if(!this.isDead())
         {
            this.isDazuo = true;
            this.m112 = MainGame.getInstance().createMonster(112,this.x,this.y) as Monster112;
            this.m113 = MainGame.getInstance().createMonster(113,this.x,this.y) as Monster113;
         }
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster111");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],250,250,new Point(0,0));
            bbdc.setOffsetXY(0,-10);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8],[2,2,2,2,10],[2,2,2,3,2,4],[2,2,2],[2,2,2,2],[2,2,50]]);
            bbdc.setFrameCount([6,4,1,5,6,3,4,3]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster111--BitmapData Error!");
      }
      
      override protected function newColipse() : void
      {
         this.colipse = AUtils.getNewObj("ObjectBaseSprite2") as Sprite;
         this.colipse.visible = false;
         this.addChild(this.colipse);
      }
      
      override public function setAction(param1:String) : void
      {
         if(param1 == "wait" || param1 == "walk")
         {
            if(this.isDazuo)
            {
               param1 = "wait2";
            }
         }
         super.setAction(param1);
         var _loc2_:Point = this.bbdc.getCurPoint();
         switch(param1)
         {
            case "wait":
               if(_loc2_.y != 0)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(0);
               }
               this.bbdc.setState(param1);
               break;
            case "walk":
               if(_loc2_.y != 1)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(1);
               }
               this.bbdc.setState(param1);
               break;
            case "hurt":
               if(_loc2_.y != 2)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(2);
               }
               this.bbdc.setState(param1);
               break;
            case "wait2":
               if(_loc2_.y != 4)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(param1);
               break;
            case "hit1_1":
               if(_loc2_.y != 5)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(5);
               }
               this.bbdc.setState(param1);
               break;
            case "hit1_2":
               if(_loc2_.y != 6)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(6);
               }
               this.bbdc.setState(param1);
               break;
            case "hit2":
               if(_loc2_.y != 7)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(7);
               }
               this.bbdc.setState(param1);
               break;
            case "dead":
               if(_loc2_.y != 3)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(3);
               }
               this.bbdc.setState(param1);
         }
      }
      
      override protected function scriptFrameOverFunc(param1:int) : void
      {
         var _loc2_:String = this.bbdc.getState();
         switch(_loc2_)
         {
            case "walk":
               this.bbdc.setFramePointX(0);
               break;
            case "wait":
               this.bbdc.setFramePointX(0);
               break;
            case "hit1_1":
               this.setAction("hit1_2");
               break;
            case "hit1_2":
               this.faceToTarget();
               this.setAction("wait");
               break;
            case "hit2":
               this.setAction("dead");
               break;
            case "hurt":
               this.setStatic();
               this.setAction("wait");
               break;
            case "dead":
               this.dropAura();
               this.destroy();
         }
      }
      
      override protected function enterFrameFunc(param1:Point) : void
      {
         var _loc2_:String = this.bbdc.getState();
         var _loc3_:uint = uint(this.getBBDC().getDirect());
         switch(_loc2_)
         {
            case "hit1_1":
               this.speed.y = -15;
               break;
            case "hit1_2":
               if(param1.x == 0)
               {
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     this.x = 1800 + (Math.random() - 0.5) * 940;
                  }
               }
               this.speed.y = 15;
               break;
            case "hit2":
               if(param1.x == 2)
               {
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     this.doHi2(_loc3_);
                  }
               }
         }
      }
      
      private function doHi2(param1:uint) : void
      {
         var _loc2_:* = null;
         _loc2_ = new FollowBaseObjectBullet("Monster111Bullet1");
         _loc2_.x = 1700;
         _loc2_.y = 480;
         _loc2_.setRole(this);
         _loc2_.setHurtCanCutDownEffect(false);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit2");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
         _loc2_ = new FollowBaseObjectBullet("Monster111Bullet1");
         _loc2_.x = 2600;
         _loc2_.y = 480;
         _loc2_.setRole(this);
         _loc2_.setHurtCanCutDownEffect(false);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit2");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      override protected function attackTarget() : void
      {
         if(this.isDazuo)
         {
            this.faceToTarget();
            this.newAttackId();
            this.setAction("hit1_1");
            this.lastHit = "hit1_1";
         }
      }
      
      override protected function move() : void
      {
         if(this.isDazuo)
         {
            this.speed.x = 0;
         }
         super.move();
      }
      
      override public function beMagicAttack(param1:BaseBullet, param2:BaseObject, param3:Boolean = false) : Boolean
      {
         var _loc4_:* = undefined;
         var _loc5_:Boolean = false;
         this.protectedParamsObject.Dodge = 0;
         var _loc6_:Boolean = false;
         for each(_loc4_ in this.magicBulletArray)
         {
            if(_loc4_.getImcName() == "Monster111Buff")
            {
               this.protectedParamsObject.Dodge = 90;
               _loc6_ = true;
            }
         }
         _loc5_ = super.beMagicAttack(param1,param2,param3);
         if(_loc5_)
         {
            if(!_loc6_)
            {
               this.doBuff();
            }
         }
         return _loc5_;
      }
      
      private function doBuff() : void
      {
         var _loc1_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster111Buff");
         _loc1_.x = this.x;
         _loc1_.y = this.y;
         _loc1_.setRole(this);
         _loc1_.setDirect(0);
         _loc1_.setDisable();
         _loc1_.setDestroyWhenLastFrame(false);
         _loc1_.setDestroyInCount(gc.frameClips * 8);
         _loc1_.setHurtCanCutDownEffect(false);
         _loc1_.setAction("hit3");
         gc.gameSence.addChild(_loc1_);
         this.magicBulletArray.push(_loc1_);
      }
      
      override public function reduceHp(param1:int, param2:Boolean = false) : void
      {
         var _loc3_:* = undefined;
         if(this.isDazuo)
         {
            param2 = false;
         }
         this.setHp(this.getHp() - param1);
         this.drawMonsterHp();
         if(this.isDead())
         {
            if(this.curAction != "dead" && this.curAction != "hit2")
            {
               if(this.curAttackTarget is BaseHero)
               {
                  if(BaseHero(this.curAttackTarget).getPet())
                  {
                     BaseHero(this.curAttackTarget).roleProperies.setExper(BaseHero(this.curAttackTarget).roleProperies.getExper() + this.protectedParamsObject.exp);
                     BaseHero(this.curAttackTarget).getPet().petInfo.setCurExper(BaseHero(this.curAttackTarget).getPet().petInfo.getCurExper() + this.protectedParamsObject.exp);
                  }
                  else
                  {
                     if(gc.player1.roleid > 0)
                     {
                        gc.hero1.roleProperies.setExper(BaseHero(this.curAttackTarget).roleProperies.getExper() + this.protectedParamsObject.exp);
                     }
                     if(gc.player2.roleid > 0)
                     {
                        gc.hero2.roleProperies.setExper(BaseHero(this.curAttackTarget).roleProperies.getExper() + this.protectedParamsObject.exp);
                     }
                  }
                  _loc3_ = BaseHero(this.curAttackTarget).curAddEffect.getBuffByName(BaseAddEffect.SHENMISHANGRENSHIZHUANG);
                  if(_loc3_)
                  {
                     BaseHero(this.curAttackTarget).cureHp(_loc3_.hurt);
                  }
               }
               else if(this.curAttackTarget is BasePet)
               {
                  BasePet(this.curAttackTarget).petInfo.setCurExper(BasePet(this.curAttackTarget).petInfo.getCurExper() + this.protectedParamsObject.exp);
               }
               this.setYourFather(9999);
               this.setAction("hit2");
            }
         }
         else if(param2)
         {
            if(this.curAction == "hurt")
            {
               if(this.bbdc)
               {
                  this.bbdc.setFramePointX(0);
               }
            }
            else
            {
               this.setAction("hurt");
            }
         }
         if(this.isBoss)
         {
            gc.gameInfo.addBossBlood(this.monsterName,100 - Math.round(100 * (this.getHp() / this.getSHp())));
         }
      }
      
      override protected function exitFrameFunc(param1:Point) : void
      {
      }
      
      override public function isCanMoveWhenAttack() : Boolean
      {
         return this.curAction == "hit1_1" || this.curAction == "hit1_2";
      }
      
      override public function isAttacking() : Boolean
      {
         return this.curAction == "hit1_1" || this.curAction == "hit1_2" || this.curAction == "hit2";
      }
      
      override protected function myIntelligence() : void
      {
         if(!this.isBeAttacking())
         {
            super.myIntelligence();
         }
         if(!this.isDead())
         {
            if(this.m112)
            {
               if(this.m112.isDead())
               {
                  if(this.m113)
                  {
                     if(this.m113.isDead())
                     {
                        this.reduceHp(this.getSHp());
                     }
                  }
               }
            }
         }
      }
      
      override public function destroy() : void
      {
         var _loc1_:* = null;
         var _loc2_:int = 0;
         var _loc3_:* = null;
         if(this.m112)
         {
            this.m112.destroy();
            this.m112 = null;
         }
         if(this.m113)
         {
            this.m113.destroy();
            this.m113 = null;
         }
         super.destroy();
         if(this.isBoss)
         {
            _loc1_ = gc.pWorld.getTransferDoorArray();
            _loc2_ = 0;
            while(_loc2_ < _loc1_.length)
            {
               _loc3_ = _loc1_[_loc2_];
               _loc3_.visible = true;
               _loc2_++;
            }
         }
      }
   }
}

