package export.pet
{
   import base.*;
   import com.greensock.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   import petInfo.*;
   
   public class PetDragon3 extends BasePet
   {
      
      public var continueCount:int = 0;
      
      public var totalHurt:int = 0;
      
      private var type:int = 0;
      
      private var fenshenArray:Array;
      
      public function PetDragon3(param1:BaseHero, param2:PetInfo)
      {
         this.fenshenArray = [];
         super(param1,param2);
         this.horizenSpeed = 5;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[3,-5],
            "attackInterval":10,
            "power":12,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[7,-5],
            "attackInterval":8,
            "power":12,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[2,-5],
            "attackInterval":999,
            "power":12,
            "attackKind":"magic"
         };
         this.attackRange = 150;
         this.setAction("wait");
         this.skillCD1 = [gc.frameClips * 2.5,gc.frameClips * 10];
         this.skillCD2 = [gc.frameClips * 3,gc.frameClips * 3.6];
         this.skillCD3 = [gc.frameClips * 5,gc.frameClips * 5];
      }
      
      public function setContinueTime(param1:int) : void
      {
         this.continueCount = param1;
         if(param1 > 0)
         {
            this.type = 1;
         }
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("PetDragonBmd3");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],250,250,new Point(0,0));
            bbdc.setOffsetXY(1,-15);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8],[2,2,2,2,10],[2,2,7,2,2,10],[2,2,2,2,10],[30],[2,2,30]]);
            bbdc.setFrameCount([6,4,1,5,6,5,1,3]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("PetDragonBmd3--BitmapData Error!");
      }
      
      override protected function newColipse() : void
      {
         this.colipse = AUtils.getNewObj("ObjectBaseSprite4") as Sprite;
         this.colipse.visible = false;
         this.addChild(this.colipse);
      }
      
      override public function setAction(param1:String) : void
      {
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
            case "hit1":
               if(_loc2_.y != 4)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(param1);
               break;
            case "hit2":
               if(_loc2_.y != 5)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(5);
               }
               this.bbdc.setState(param1);
               break;
            case "hit3":
               if(_loc2_.y != 6)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(6);
               }
               this.bbdc.setState(param1);
               break;
            case "hit4":
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
            case "hit1":
               this.setAction("wait");
               break;
            case "hit2":
               this.setAction("wait");
               break;
            case "hit3":
               this.setStatic();
               this.setAction("wait");
               break;
            case "hit4":
               this.setAction("wait");
               break;
            case "hurt":
               this.setStatic();
               this.setAction("wait");
               break;
            case "dead":
               this.destroy();
         }
      }
      
      override protected function enterFrameFunc(param1:Point) : void
      {
         var _loc2_:String = this.bbdc.getState();
         var _loc3_:uint = uint(this.getBBDC().getDirect());
         var _loc4_:Point = new Point();
         switch(_loc2_)
         {
            case "hit1":
               if(gc.isSingleGame() || gc.sid == this.sourceRole.sid)
               {
                  if(param1.x == 2)
                  {
                     if(this.bbdc.getCurFrameCount() == 7)
                     {
                        if(_loc3_ == 0)
                        {
                           _loc4_.x = this.x - 30;
                        }
                        else
                        {
                           _loc4_.x = this.x + 30;
                        }
                        _loc4_.y = this.y;
                        this.doHit1(_loc3_,_loc4_);
                        gc.sendPetAttack(this.sourceRole.getRoleId(),"hit1",this.getBBDC().getDirect(),_loc4_.x,_loc4_.y,[]);
                     }
                  }
               }
               break;
            case "hit2":
               if(gc.isSingleGame() || gc.sid == this.sourceRole.sid)
               {
                  if(param1.x == 4)
                  {
                     if(this.bbdc.getCurFrameCount() == 2)
                     {
                        this.doHit2(_loc3_,_loc4_);
                        gc.sendPetAttack(this.sourceRole.getRoleId(),"hit2",this.getBBDC().getDirect(),_loc4_.x,_loc4_.y,[]);
                     }
                  }
               }
               break;
            case "hit3":
               if(gc.isSingleGame() || gc.sid == this.sourceRole.sid)
               {
                  if(param1.x == 0)
                  {
                     if(this.bbdc.getCurFrameCount() == 24)
                     {
                        if(_loc3_ == 0)
                        {
                           _loc4_.x = this.x - 0;
                        }
                        else
                        {
                           _loc4_.x = this.x + 0;
                        }
                        _loc4_.y = this.y + 10;
                        this.doHit3(_loc3_,_loc4_);
                        gc.sendPetAttack(this.sourceRole.getRoleId(),"hit3",this.getBBDC().getDirect(),_loc4_.x,_loc4_.y,[]);
                     }
                  }
                  if(_loc3_ == 0)
                  {
                     this.speed.x = -10;
                     break;
                  }
                  this.speed.x = 10;
               }
               break;
            case "hit4":
               if(gc.isSingleGame() || gc.sid == this.sourceRole.sid)
               {
                  if(param1.x == 2)
                  {
                     if(this.bbdc.getCurFrameCount() == 20)
                     {
                        if(_loc3_ == 0)
                        {
                           _loc4_.x = this.x - 0;
                        }
                        else
                        {
                           _loc4_.x = this.x + 0;
                        }
                        _loc4_.y = this.y + 40;
                        this.doHit4(_loc3_,_loc4_);
                        gc.sendPetAttack(this.sourceRole.getRoleId(),"hit4",this.getBBDC().getDirect(),_loc4_.x,_loc4_.y,[]);
                     }
                  }
               }
         }
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         if(this.type == 0)
         {
            return this._petInfo.getMp() >= this._petInfo.findPetUsedMagic("fs") && Boolean(this._petInfo.findHasStudySkill("fs"));
         }
         return false;
      }
      
      override protected function beforeSkill2Start() : Boolean
      {
         return Boolean(this._petInfo.findHasStudySkill("sdcc")) && this._petInfo.getMp() >= this._petInfo.findPetUsedMagic("sdcc") && this.curAttackTarget != null && AUtils.GetDisBetweenTwoObj(this,this.curAttackTarget) <= 5 * 60;
      }
      
      override protected function beforeSkill3Start() : Boolean
      {
         return Boolean(this._petInfo.findHasStudySkill("ltwj")) && this._petInfo.getMp() >= this._petInfo.findPetUsedMagic("ltwj") && this.curAttackTarget != null && AUtils.GetDisBetweenTwoObj(this,this.curAttackTarget) <= 500;
      }
      
      override public function reduceHp(param1:int, param2:Boolean = false) : void
      {
         super.reduceHp(param1,param2);
      }
      
      override protected function releSkill1() : void
      {
         if(gc.sid == this.sourceRole.sid)
         {
            this.faceToTarget();
            gc.sendPetAttack(this.sourceRole.getRoleId(),"hit2Action",this.getBBDC().getDirect(),0,0,[]);
         }
         this.faceToTarget();
         this.newAttackId();
         this.setAction("hit2");
         this.lastHit = "hit2";
         this._petInfo.setMp(Number(this._petInfo.getMp()) - Number(this._petInfo.findPetUsedMagic("sp")));
      }
      
      override protected function releSkill2() : void
      {
         if(gc.sid == this.sourceRole.sid)
         {
            this.faceToTarget();
            gc.sendPetAttack(this.sourceRole.getRoleId(),"hit3Action",this.getBBDC().getDirect(),0,0,[]);
         }
         this.faceToTarget();
         this.newAttackId();
         this.setAction("hit3");
         this.lastHit = "hit3";
         this._petInfo.setMp(Number(this._petInfo.getMp()) - Number(this._petInfo.findPetUsedMagic("sp")));
      }
      
      override protected function releSkill3() : void
      {
         if(gc.sid == this.sourceRole.sid)
         {
            this.faceToTarget();
            gc.sendPetAttack(this.sourceRole.getRoleId(),"hit4Action",this.getBBDC().getDirect(),0,0,[]);
         }
         this.newAttackId();
         this.setAction("hit4");
         this.lastHit = "hit4";
         this._petInfo.setMp(Number(this._petInfo.getMp()) - Number(this._petInfo.findPetUsedMagic("sp")));
      }
      
      private function doHit1(param1:uint, param2:Point) : void
      {
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("PetDragon3Bullet1");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setFuncWhenHit(this.addHurt);
         _loc3_.setAction("hit1");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function addHurt(param1:BaseBullet) : void
      {
         this.totalHurt += param1.hurt;
         var _loc2_:Object = this._petInfo.getPetHarmObj("sdcc");
         var _loc3_:int = int(this._petInfo.getSHp() * 0.018 + this._petInfo.getAtk() * 0.18 + this._petInfo.getLevel() * 2);
         this.cureHp(_loc3_);
      }
      
      private function addHurt1(param1:BaseBullet) : void
      {
         this.totalHurt += param1.hurt;
         var _loc2_:Object = this._petInfo.getPetHarmObj("ltwj");
         var _loc3_:int = int(this._petInfo.getSHp() * 0.028 + this._petInfo.getAtk() * 0.09 + this._petInfo.getLevel() * 2);
         this.cureHp(_loc3_);
      }
      
      private function doHit2(param1:uint, param2:Point) : void
      {
         var _loc3_:PetDragon3 = null;
         var _loc4_:PetInfo = new PetInfo();
         _loc4_.setHp(this._petInfo.getHp());
         _loc4_.setSHp(_loc4_.getHp());
         _loc4_.setMp(this._petInfo.getMp());
         _loc4_.setSMp(_loc4_.getMp());
         _loc4_.setAtk(this._petInfo.getAtk());
         _loc4_.setDef(this._petInfo.getDef());
         _loc4_.setLevel(this._petInfo.getLevel());
         _loc3_ = new PetDragon3(this.sourceRole,_loc4_);
         _loc3_.setContinueTime(gc.frameClips * 10);
         _loc3_.bbdc.alpha = 0.5;
         _loc3_.x = this.x + (Math.random() - 0.5) * 300;
         _loc3_.y = this.y - 50;
         gc.gameSence.addChild(_loc3_);
         this.fenshenArray.push(_loc3_);
      }
      
      private function doHit3(param1:uint, param2:Point) : void
      {
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("PetDragon2Bullet2");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setFuncWhenHit(this.addHurt);
         _loc3_.setAction("hit2");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit4(param1:uint, param2:Point) : void
      {
         var direct:uint = param1;
         var point:Point = param2;
         this.doSingleHit4(direct,point);
         TweenMax.delayedCall(0.2,function(param1:PetDragon3, param2:uint, param3:Point):*
         {
            if(!param1.isDead())
            {
               param1.doSingleHit4(param2,new Point(param3.x - 150,param3.y - 10));
               param1.doSingleHit4(param2,new Point(param3.x + 90,param3.y - 25));
            }
         },[this,direct,point]);
         TweenMax.delayedCall(0.4,function(param1:PetDragon3, param2:uint, param3:Point):*
         {
            if(!param1.isDead())
            {
               param1.doSingleHit4(param2,new Point(param3.x - 90,param3.y - 25));
               param1.doSingleHit4(param2,new Point(param3.x + 150,param3.y - 10));
            }
         },[this,direct,point]);
         TweenMax.delayedCall(0.6,function(param1:PetDragon3, param2:uint, param3:Point):*
         {
            if(!param1.isDead())
            {
               param1.doSingleHit4(param2,new Point(param3.x - 270,param3.y - 25));
               param1.doSingleHit4(param2,new Point(param3.x + 210,param3.y - 10));
            }
         },[this,direct,point]);
         TweenMax.delayedCall(0.8,function(param1:PetDragon3, param2:uint, param3:Point):*
         {
            if(!param1.isDead())
            {
               param1.doSingleHit4(param2,new Point(param3.x - 210,param3.y - 25));
               param1.doSingleHit4(param2,new Point(param3.x + 270,param3.y - 10));
            }
         },[this,direct,point]);
      }
      
      private function doSingleHit4(param1:uint, param2:Point) : void
      {
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("PetDragon3Bullet3");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setFuncWhenHit(this.addHurt1);
         _loc3_.setAction("hit3");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      override protected function checkBuffSkill() : void
      {
         if(this.type == 0)
         {
            super.checkBuffSkill();
            return;
         }
      }
      
      override public function setOtherAttack(param1:String, param2:uint, param3:Point, param4:Array = null, param5:uint = 0) : void
      {
         switch(param1)
         {
            case "hit1":
               this.doHit1(param2,param3);
               break;
            case "hit2":
               this.doHit2(param2,param3);
               break;
            case "hit3":
               this.doHit3(param2,param3);
               break;
            case "hit4":
               this.doHit4(param2,param3);
               break;
            case "hit2Action":
               this.releSkill1();
               break;
            case "hit3Action":
               this.releSkill2();
               break;
            case "hit4Action":
               this.releSkill3();
               break;
            case "normalHit":
               this.normalHit();
         }
      }
      
      override protected function normalHit() : void
      {
         if(gc.sid == this.sourceRole.sid)
         {
            this.faceToTarget();
            gc.sendPetAttack(this.sourceRole.getRoleId(),"normalHit",this.getBBDC().getDirect(),0,0,[]);
         }
         this.newAttackId();
         this.setAction("hit1");
         this.lastHit = "hit1";
      }
      
      override public function getRealPower(param1:String, param2:Boolean = true) : Object
      {
         var _loc3_:* = null;
         var _loc4_:uint = this.getCriteValue(param2) ? 2 : uint(1);
         var _loc5_:uint = uint(this.getMagicAddValue());
         var _loc6_:Number = this.isGXP ? 1.2 : Number(1);
         switch(param1)
         {
            case "hit1":
               return {
                  "hurt":(this._petInfo.getAtk() + _loc5_) * _loc4_ * _loc6_,
                  "qixue":0,
                  "atk":this._petInfo.getAtk()
               };
            case "hit2":
               _loc3_ = this._petInfo.getPetHarmObj("sdcc");
               if(_loc3_)
               {
                  return {
                     "hurt":(_loc3_.first + _loc5_) * _loc4_ * _loc6_,
                     "qixue":0,
                     "atk":this._petInfo.getAtk()
                  };
               }
               return {
                  "hurt":0,
                  "qixue":0,
                  "atk":this._petInfo.getAtk()
               };
               break;
            case "hit3":
               _loc3_ = this._petInfo.getPetHarmObj("ltwj");
               if(_loc3_)
               {
                  return {
                     "hurt":(_loc3_.first + _loc5_) * _loc4_ * _loc6_,
                     "qixue":0,
                     "atk":this._petInfo.getAtk()
                  };
               }
               return {
                  "hurt":0,
                  "qixue":0,
                  "atk":this._petInfo.getAtk()
               };
               break;
            default:
               return {
                  "hurt":0,
                  "qixue":0,
                  "atk":this._petInfo.getAtk()
               };
         }
      }
      
      override protected function exitFrameFunc(param1:Point) : void
      {
      }
      
      override protected function myIntelligence() : void
      {
         var _loc1_:* = null;
         var _loc2_:* = null;
         var _loc3_:int = 0;
         if(!this.isBeAttacking())
         {
            super.myIntelligence();
         }
         if(this.type == 1)
         {
            if(this.continueCount > 0)
            {
               --this.continueCount;
               if(this.continueCount == 0)
               {
                  this.destroy();
               }
            }
         }
         else if(this.type == 0)
         {
            _loc1_ = [];
            for each(_loc2_ in this.fenshenArray)
            {
               if(_loc2_.continueCount > 0)
               {
                  _loc2_.step();
               }
               if(_loc2_.continueCount == 0 || _loc2_.petInfo.getHp() <= 0)
               {
                  if(_loc2_.continueCount == 0)
                  {
                     this.cureHp(this._petInfo.getSHp() * 0.036);
                  }
                  _loc1_.push(_loc2_);
               }
            }
            if(_loc1_.length > 0)
            {
               for each(_loc2_ in _loc1_)
               {
                  _loc3_ = int(this.fenshenArray.indexOf(_loc2_));
                  if(_loc3_ != -1)
                  {
                     this.fenshenArray.splice(_loc3_,1);
                  }
               }
            }
         }
      }
      
      override public function isCanMoveWhenAttack() : Boolean
      {
         return this.curAction == "hit3";
      }
      
      override protected function isCannotMoveWhenAttackOnFloor() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit4";
      }
      
      override public function isAttacking() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3" || this.curAction == "hit4";
      }
      
      override public function destroy() : void
      {
         var pd1:PetDragon3 = null;
         var i:int = 0;
         var bb:BaseBullet = null;
         if(this.type == 0)
         {
            for each(pd1 in this.fenshenArray)
            {
               pd1.destroy();
            }
            super.destroy();
         }
         else
         {
            if(this.bbdc)
            {
               this.bbdc.destroy();
            }
            if(this.curAddEffect)
            {
               this.curAddEffect.destroy();
               this.curAddEffect = null;
            }
            this.isReadyToDestroy = true;
            TweenMax.to(this,1,{
               "alpha":0,
               "onComplete":function(param1:BasePet):*
               {
                  if(param1.parent)
                  {
                     param1.parent.removeChild(param1);
                  }
               },
               "onCompleteParams":[this]
            });
            i = 0;
            while(i < this.magicBulletArray.length)
            {
               bb = this.magicBulletArray[i] as BaseBullet;
               bb.destroy();
               i++;
            }
            this.magicBulletArray = [];
            if(this.sourceRole)
            {
               this.sourceRole = null;
            }
         }
         this.fenshenArray.length = 0;
      }
   }
}

