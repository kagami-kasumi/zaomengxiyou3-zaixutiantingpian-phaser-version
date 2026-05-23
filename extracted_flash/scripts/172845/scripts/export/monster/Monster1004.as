package export.monster
{
   import base.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   import my.*;
   
   public class Monster1004 extends BaseMonster
   {
      
      private var curhead2:int = 0;
      
      private var curhead3:int = 0;
      
      public function Monster1004()
      {
         super();
         this.colipse.scaleY = 1;
         this.colipse.scaleX = 1;
         this.horizenSpeed = 1;
         this.setHp(1500000 * 0.65);
         this.setSHp(1500000 * 0.65);
         this.protectedParamsObject.mysee = 300;
         this.protectedParamsObject.isattback = 50;
         this.attackRange = 250;
         this.alertRange = 1000;
         this.normalAttackRate = 0.6;
         this.protectedParamsObject.def = 941;
         this.protectedParamsObject.mDef = 0.4;
         this.protectedParamsObject.exp = 200;
         this.protectedParamsObject.gxp = 200;
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[2,-4],
            "attackInterval":18,
            "power":1875 * 0.7,
            "attackKind":"magic",
            "addEffect":[{
               "name":BaseAddEffect.POISON,
               "time":gc.frameClips * 5,
               "power":gc.hero1.roleProperies.getSHHP() * 0.025
            },{
               "name":BaseAddEffect.POISON_TIMES,
               "time":gc.frameClips * 5
            }]
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":12,
            "power":1875 * 0.6,
            "attackKind":"magic"
         };
         this.isBoss = true;
         this.monsterName = "罗睺";
         this.setAction("wait");
         this.fallList = [];
         this.skillCD1 = [gc.frameClips * 2,gc.frameClips * 6.4];
         this.skillCD2 = [gc.frameClips * 3,gc.frameClips * 7.2];
         this.skillCD3 = [gc.frameClips * 4,gc.frameClips * 8.1];
         this.skillCD4 = [gc.frameClips * 2.5,gc.frameClips * 6.4];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster1004");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],570,520,new Point(0,0));
            bbdc.setOffsetXY(-20,-215);
            bbdc.setFrameStopCount([[1,1,1,1,1,1],[1,1,1,1,1,1],[1,1,1,1,1,1],[1,1,1,1,1,1],[1,1,1,1,1,1],[1,1,1,1,1,1],[50,1,1,1,1,1],[1,1,1,1,1,43],[1,1,1,1,1,1],[1,1,1,1,1,1],[56,1,1,1,1,1],[1,1,1,1,1,1],[75,1,1,1,1],[1,1,1,1,1,75],[1,1,1,1,1],[1,1,1,1,1,1],[74,1,1,1,1,1]]);
            bbdc.setFrameCount([6,6,6,6,6,6,6,6,6,6,6,6,5,6,5,6,6]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster1004--BitmapData Error!");
      }
      
      override protected function newColipse() : void
      {
         this.colipse = AUtils.getNewObj("LuoHoucolipse") as Sprite;
         this.colipse.visible = false;
         this.addChild(this.colipse);
      }
      
      override public function setAction(param1:String) : void
      {
         super.setAction(param1);
         var _loc2_:int = 0;
         var _loc3_:Point = this.bbdc.getCurPoint();
         switch(param1)
         {
            case "wait":
               if(_loc3_.y != 0)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(0);
               }
               this.bbdc.setState(param1);
               break;
            case "wait_2":
               if(_loc3_.y != 1)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(1);
               }
               this.bbdc.setState(param1);
               break;
            case "wait_3":
               if(_loc3_.y != 2)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(2);
               }
               this.bbdc.setState(param1);
               break;
            case "wait_4":
               if(_loc3_.y != 3)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(3);
               }
               this.bbdc.setState(param1);
               break;
            case "wait_5":
               if(_loc3_.y != 4)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(param1);
               break;
            case "hit2_1":
               if(Number(this.curAttackTarget.x) - Number(this.getLeft()) < 0)
               {
                  _loc2_ = 0;
               }
               else if(Number(this.curAttackTarget.x) - Number(this.getRight()) > 0)
               {
                  _loc2_ = 2;
               }
               else
               {
                  _loc2_ = 1;
               }
               this.curhead2 = 5 + _loc2_ * 2;
               if(_loc3_.y != this.curhead2)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(this.curhead2);
               }
               this.bbdc.setState(param1);
               break;
            case "hit2_2":
               if(_loc3_.y != this.curhead2 + 1)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(this.curhead2 + 1);
               }
               this.bbdc.setState(param1);
               break;
            case "hit3_1":
               if(Number(this.curAttackTarget.x) - Number(this.getLeft()) < 0)
               {
                  _loc2_ = 0;
               }
               else if(Number(this.curAttackTarget.x) - Number(this.getRight()) > 0)
               {
                  _loc2_ = 2;
               }
               else
               {
                  _loc2_ = 1;
               }
               this.curhead3 = 11 + _loc2_ * 2;
               if(_loc3_.y != this.curhead3)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(this.curhead3);
               }
               this.bbdc.setState(param1);
               break;
            case "hit3_2":
               if(_loc3_.y != this.curhead3 + 1)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(this.curhead3 + 1);
               }
               this.bbdc.setState(param1);
               break;
            case "dead":
               if(_loc3_.y != 0)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(0);
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
               this.setAction("wait_2");
               break;
            case "wait_2":
               this.setAction("wait_3");
               break;
            case "wait_3":
               this.setAction("wait_4");
               break;
            case "wait_4":
               this.setAction("wait_5");
               break;
            case "wait_5":
               this.setAction("wait");
               break;
            case "hit2_1":
               this.setAction("hit2_2");
               break;
            case "hit2_2":
               this.setAction("wait");
               break;
            case "hit3_1":
               this.setAction("hit3_2");
               break;
            case "hit3_2":
               this.setAction("wait");
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
            case "hit2_1":
               if(this.curhead2 == 7)
               {
                  if(param1.x == 5)
                  {
                     if(this.bbdc.getCurFrameCount() == 43)
                     {
                        this.doHit2(_loc3_);
                     }
                     break;
                  }
               }
            case "hit2_2":
               if(this.curhead2 == 5)
               {
                  if(param1.x == 0)
                  {
                     if(this.bbdc.getCurFrameCount() == 49)
                     {
                        this.doHit2(_loc3_);
                     }
                     break;
                  }
               }
               if(this.curhead2 == 9)
               {
                  if(param1.x == 0)
                  {
                     if(this.bbdc.getCurFrameCount() == 56)
                     {
                        this.doHit2(_loc3_);
                     }
                     break;
                  }
               }
            case "hit3_1":
               if(this.curhead3 == 13)
               {
                  if(param1.x == 5)
                  {
                     if(this.bbdc.getCurFrameCount() == 75)
                     {
                        this.doHit3(_loc3_);
                     }
                     break;
                  }
               }
            case "hit3_2":
               if(this.curhead3 == 11)
               {
                  if(param1.x == 0)
                  {
                     if(this.bbdc.getCurFrameCount() == 75)
                     {
                        this.doHit3(_loc3_);
                     }
                     break;
                  }
               }
               if(this.curhead3 == 15)
               {
                  if(param1.x == 0)
                  {
                     if(this.bbdc.getCurFrameCount() == 73)
                     {
                        this.doHit3(_loc3_);
                     }
                  }
               }
         }
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         return this.curAttackTarget;
      }
      
      override protected function beforeSkill2Start() : Boolean
      {
         return this.curAttackTarget;
      }
      
      override protected function releSkill1() : void
      {
         this.newAttackId();
         this.setAction("hit2_1");
         this.lastHit = "hit2_1";
      }
      
      override protected function releSkill2() : void
      {
         this.newAttackId();
         this.setAction("hit3_1");
         this.lastHit = "hit3_1";
      }
      
      private function doHit2(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = null;
         if(this.curhead2 == 5)
         {
            _loc2_ = new SpecialEffectBullet("Monster1004lheadpoison");
            _loc2_.x = this.x;
            _loc2_.y = this.y;
            _loc2_.setRole(this);
            _loc2_.setDirect(param1);
            _loc2_.setAction("hit2");
            gc.gameSence.addChild(_loc2_);
            this.magicBulletArray.push(_loc2_);
         }
         else if(this.curhead2 == 7)
         {
            _loc2_ = new SpecialEffectBullet("Monster1004mheadpoison");
            _loc2_.x = this.x;
            _loc2_.y = this.y;
            _loc2_.setRole(this);
            _loc2_.setDirect(param1);
            _loc2_.setAction("hit2");
            gc.gameSence.addChild(_loc2_);
            this.magicBulletArray.push(_loc2_);
         }
         else if(this.curhead2 == 9)
         {
            _loc2_ = new SpecialEffectBullet("Monster1004rheadpoison");
            _loc2_.x = this.x;
            _loc2_.y = this.y;
            _loc2_.setRole(this);
            _loc2_.setDirect(param1);
            _loc2_.setAction("hit2");
            gc.gameSence.addChild(_loc2_);
            this.magicBulletArray.push(_loc2_);
         }
      }
      
      private function doHit3(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = null;
         var _loc3_:SpecialEffectBullet = null;
         if(this.curhead3 == 11)
         {
            _loc2_ = new SpecialEffectBullet("Monster1004lheadlaser");
            _loc2_.x = this.x;
            _loc2_.y = this.y;
            _loc2_.setRole(this);
            _loc2_.setDirect(param1);
            _loc2_.setAction("hit3");
            gc.gameSence.addChild(_loc2_);
            this.magicBulletArray.push(_loc2_);
            _loc3_ = new SpecialEffectBullet("Monster1004lheadlasereyes");
            _loc3_.x = this.x;
            _loc3_.y = this.y;
            _loc3_.setRole(this);
            _loc3_.setDirect(param1);
            _loc3_.setDisable();
            gc.gameSence.addChild(_loc3_);
            this.magicBulletArray.push(_loc3_);
         }
         else if(this.curhead3 == 13)
         {
            _loc2_ = new SpecialEffectBullet("Monster1004mheadlaser");
            _loc2_.x = this.x;
            _loc2_.y = this.y;
            _loc2_.setRole(this);
            _loc2_.setDirect(param1);
            _loc2_.setAction("hit3");
            gc.gameSence.addChild(_loc2_);
            this.magicBulletArray.push(_loc2_);
            _loc3_ = new SpecialEffectBullet("Monster1004mheadlasereyes");
            _loc3_.x = this.x;
            _loc3_.y = this.y;
            _loc3_.setRole(this);
            _loc3_.setDirect(param1);
            _loc3_.setDisable();
            gc.gameSence.addChild(_loc3_);
            this.magicBulletArray.push(_loc3_);
         }
         else if(this.curhead3 == 15)
         {
            _loc2_ = new SpecialEffectBullet("Monster1004rheadlaser");
            _loc2_.x = this.x;
            _loc2_.y = this.y;
            _loc2_.setRole(this);
            _loc2_.setDirect(param1);
            _loc2_.setAction("hit3");
            gc.gameSence.addChild(_loc2_);
            this.magicBulletArray.push(_loc2_);
            _loc3_ = new SpecialEffectBullet("Monster1004rheadlasereyes");
            _loc3_.x = this.x;
            _loc3_.y = this.y;
            _loc3_.setRole(this);
            _loc3_.setDirect(param1);
            _loc3_.setDisable();
            gc.gameSence.addChild(_loc3_);
            this.magicBulletArray.push(_loc3_);
         }
      }
      
      private function doHit3_2(param1:uint) : void
      {
         var _loc2_:EnemyMoveBullet = null;
         var _loc3_:Number = Number(NaN);
         _loc2_ = null;
         var _loc4_:* = null;
         if(this.curAttackTarget)
         {
            _loc2_ = new EnemyMoveBullet("Monster1003Bullet3");
            _loc2_.x = this.x;
            _loc2_.y = this.y - 100;
            _loc2_.setRole(this);
            _loc4_ = AUtils.GetNextPointByTwoObj(this,this.curAttackTarget);
            _loc2_.setSpeed(Number(_loc4_.x) * 20,Number(_loc4_.y) * 20);
            _loc2_.setDistance(1000);
            _loc2_.setDestroyWhenLastFrame(false);
            _loc2_.setDirect(param1);
            _loc2_.setAction("hit3");
            _loc3_ = 30 * Number(_loc4_.y) / Number(_loc4_.x);
            _loc2_.rotation = _loc3_;
            gc.gameSence.addChild(_loc2_);
            this.magicBulletArray.push(_loc2_);
         }
      }
      
      override protected function checkCanMove() : void
      {
      }
      
      override protected function move() : void
      {
      }
      
      override protected function attackTarget() : void
      {
      }
      
      override public function isAttacking() : Boolean
      {
         return this.curAction == "hit2_2" || this.curAction == "hit2_1" || this.curAction == "hit3_1" || this.curAction == "hit3_2";
      }
      
      override protected function exitFrameFunc(param1:Point) : void
      {
      }
      
      override protected function turnRight() : *
      {
      }
      
      override protected function turnLeft() : *
      {
      }
      
      override protected function myIntelligence() : void
      {
         if(!this.isBeAttacking())
         {
            super.myIntelligence();
         }
      }
      
      override public function destroy() : void
      {
         super.destroy();
         MainGame.getInstance().createMonster(1005,600,300);
      }
      
      override public function setAttackBack(param1:Point) : void
      {
      }
      
      override public function reduceHp(param1:int, param2:Boolean = false) : void
      {
         super.reduceHp(param1,false);
      }
   }
}

