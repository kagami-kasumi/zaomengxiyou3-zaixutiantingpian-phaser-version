package export.pet
{
   import base.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   import petInfo.PetInfo;
   
   public class PetTiger3 extends BasePet
   {
      
      public function PetTiger3(param1:BaseHero, param2:PetInfo)
      {
         super(param1,param2);
         this.horizenSpeed = 5;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[5,-5],
            "attackInterval":999,
            "power":12,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[9,0],
            "attackInterval":6,
            "power":12,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit3_1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[0,0],
            "attackInterval":999,
            "power":12,
            "attackKind":"magic",
            "addEffect":[{
               "name":BaseAddEffect.Pet_TIGER_SXHZ,
               "time":gc.frameClips * 2,
               "direct":0
            }]
         };
         this.attackBackInfoDict["hit3_2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[0,0],
            "attackInterval":6,
            "power":12,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-15,0],
            "attackInterval":3,
            "power":12,
            "attackKind":"magic"
         };
         this.attackRange = 40;
         this.setAction("wait");
         this.skillCD1 = [gc.frameClips * 4,gc.frameClips * 2];
         this.skillCD2 = [gc.frameClips * 5,gc.frameClips * 5];
         this.skillCD3 = [gc.frameClips * 6,gc.frameClips * 5];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("PetTigerBmd3");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],200,200,new Point(0,0));
            bbdc.setOffsetXY(15,-10);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8],[2,2,2,2,10],[2,2,2,10],[2,2,2,10],[2,2,10],[2,2,5,1,10]]);
            bbdc.setFrameCount([6,4,1,5,4,4,3,5]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("PetTigerBmd3--BitmapData Error!");
      }
      
      override protected function newColipse() : void
      {
         this.colipse = AUtils.getNewObj("ObjectBaseSprite") as Sprite;
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
                  if(param1.x == 3)
                  {
                     if(this.bbdc.getCurFrameCount() == 10)
                     {
                        if(_loc3_ == 0)
                        {
                           _loc4_.x = this.x - 130;
                        }
                        else
                        {
                           _loc4_.x = this.x + 130;
                        }
                        _loc4_.y = this.y - 70;
                        this.doHit1(_loc3_,_loc4_);
                        gc.sendPetAttack(this.sourceRole.getRoleId(),"hit1",this.getBBDC().getDirect(),_loc4_.x,_loc4_.y,[]);
                     }
                  }
               }
               break;
            case "hit2":
               if(gc.isSingleGame() || gc.sid == this.sourceRole.sid)
               {
                  if(param1.x == 3)
                  {
                     if(this.bbdc.getCurFrameCount() == 10)
                     {
                        if(_loc3_ == 0)
                        {
                           _loc4_.x = this.x - 190;
                        }
                        else
                        {
                           _loc4_.x = this.x + 190;
                        }
                        _loc4_.y = this.y - 80;
                        this.doHit2(_loc3_,_loc4_);
                        gc.sendPetAttack(this.sourceRole.getRoleId(),"hit2",this.getBBDC().getDirect(),_loc4_.x,_loc4_.y,[]);
                     }
                  }
               }
               break;
            case "hit3":
               if(gc.isSingleGame() || gc.sid == this.sourceRole.sid)
               {
                  if(param1.x == 2)
                  {
                     if(this.bbdc.getCurFrameCount() == 10)
                     {
                        if(_loc3_ == 0)
                        {
                           _loc4_.x = this.x - 50;
                        }
                        else
                        {
                           _loc4_.x = this.x + 50;
                        }
                        _loc4_.y = this.y - 65;
                        this.doHit3_1(_loc3_,_loc4_);
                        gc.sendPetAttack(this.sourceRole.getRoleId(),"hit3_1",this.getBBDC().getDirect(),_loc4_.x,_loc4_.y,[]);
                        break;
                     }
                     if(this.bbdc.getCurFrameCount() == 1)
                     {
                        if(_loc3_ == 0)
                        {
                           _loc4_.x = this.x - 200;
                        }
                        else
                        {
                           _loc4_.x = this.x + 200;
                        }
                        _loc4_.y = this.y - 65;
                        this.doHit3_2(_loc3_,_loc4_);
                        gc.sendPetAttack(this.sourceRole.getRoleId(),"hit3_2",this.getBBDC().getDirect(),_loc4_.x,_loc4_.y,[]);
                     }
                  }
               }
               break;
            case "hit4":
               if(param1.x == 0)
               {
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     if(_loc3_ == 0)
                     {
                        _loc4_.x = this.x - 85;
                     }
                     else
                     {
                        _loc4_.x = this.x + 85;
                     }
                     _loc4_.y = this.y - 130;
                     this.doHit4_1(_loc3_,_loc4_);
                  }
               }
               if(gc.isSingleGame() || gc.sid == this.sourceRole.sid)
               {
                  if(param1.x == 4)
                  {
                     if(this.bbdc.getCurFrameCount() == 10)
                     {
                        if(_loc3_ == 0)
                        {
                           _loc4_.x = this.x - 105;
                        }
                        else
                        {
                           _loc4_.x = this.x + 105;
                        }
                        _loc4_.y = this.y - 2;
                        this.doHit4_2(_loc3_,_loc4_);
                        gc.sendPetAttack(this.sourceRole.getRoleId(),"hit4",this.getBBDC().getDirect(),_loc4_.x,_loc4_.y,[]);
                     }
                  }
               }
         }
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         var _loc1_:Number = AUtils.GetDisBetweenTwoObj(this,this.curAttackTarget);
         return _loc1_ >= 50 && _loc1_ <= 100 && this._petInfo.getMp() >= this._petInfo.findPetUsedMagic("hy") && Boolean(this._petInfo.findHasStudySkill("hy"));
      }
      
      override protected function beforeSkill2Start() : Boolean
      {
         var _loc1_:Number = AUtils.GetDisBetweenTwoObj(this,this.curAttackTarget);
         return _loc1_ <= 80 && this._petInfo.getMp() >= this._petInfo.findPetUsedMagic("sxhz") && Boolean(this._petInfo.findHasStudySkill("sxhz"));
      }
      
      override protected function beforeSkill3Start() : Boolean
      {
         var _loc1_:Number = AUtils.GetDisBetweenTwoObj(this,this.curAttackTarget);
         return _loc1_ <= 450 && this._petInfo.getMp() >= this._petInfo.findPetUsedMagic("hsqj") && Boolean(this._petInfo.findHasStudySkill("hsqj"));
      }
      
      override public function reduceHp(param1:int, param2:Boolean = false) : void
      {
         super.reduceHp(param1,param2);
      }
      
      override protected function releSkill1() : void
      {
         this.newAttackId();
         this.faceToTarget();
         this.setAction("hit2");
         this.lastHit = "hit2";
         if(gc.sid == this.sourceRole.sid)
         {
            this.faceToTarget();
            gc.sendPetAttack(this.sourceRole.getRoleId(),"hit2Action",this.getBBDC().getDirect(),0,0,[]);
         }
         this._petInfo.setMp(Number(this._petInfo.getMp()) - Number(this._petInfo.findPetUsedMagic("hy")));
      }
      
      override protected function releSkill2() : void
      {
         this.newAttackId();
         this.faceToTarget();
         this.setAction("hit3");
         this.lastHit = "hit3";
         if(gc.sid == this.sourceRole.sid)
         {
            this.faceToTarget();
            gc.sendPetAttack(this.sourceRole.getRoleId(),"hit3Action",this.getBBDC().getDirect(),0,0,[]);
         }
         this._petInfo.setMp(Number(this._petInfo.getMp()) - Number(this._petInfo.findPetUsedMagic("sxhz")));
      }
      
      override protected function releSkill3() : void
      {
         this.newAttackId();
         this.faceToTarget();
         this.setAction("hit4");
         this.lastHit = "hit4";
         if(gc.sid == this.sourceRole.sid)
         {
            this.faceToTarget();
            gc.sendPetAttack(this.sourceRole.getRoleId(),"hit4Action",this.getBBDC().getDirect(),0,0,[]);
         }
         this._petInfo.setMp(Number(this._petInfo.getMp()) - Number(this._petInfo.findPetUsedMagic("hsqj")));
      }
      
      private function doHit1(param1:uint, param2:Point) : void
      {
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("PetTiger2Bullet1");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit1");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit2(param1:uint, param2:Point) : void
      {
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("PetTiger1Bullet2");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit2");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit3_1(param1:uint, param2:Point) : void
      {
         this.attackBackInfoDict["hit3_1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[0,0],
            "attackInterval":999,
            "power":12,
            "attackKind":"magic",
            "addEffect":[{
               "name":BaseAddEffect.Pet_TIGER_SXHZ,
               "time":gc.frameClips * 2,
               "direct":param1
            }]
         };
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("PetTiger2Bullet3_1");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit3_1");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit3_2(param1:uint, param2:Point) : void
      {
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("PetTiger2Bullet3_2");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit3_2");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
         _loc3_.setFuncWhenHit(this.doWhenHit3_2hit);
      }
      
      private function doWhenHit3_2hit(param1:BaseBullet) : void
      {
         var _loc2_:Object = this._petInfo.getPetHarmObj("sxhz");
         if(_loc2_)
         {
            this.cureHp(_loc2_.first);
         }
      }
      
      private function doHit4_1(param1:uint, param2:Point) : void
      {
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("PetTiger3Bullet4_1");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setDisable();
         _loc3_.setAction("hit4");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit4_2(param1:uint, param2:Point) : void
      {
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("PetTiger3Bullet4_2");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit4");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
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
            case "hit3_1":
               this.doHit3_1(param2,param3);
               break;
            case "hit3_2":
               this.doHit3_2(param2,param3);
               break;
            case "hit4":
               this.doHit4_2(param2,param3);
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
         this.newAttackId();
         this.setAction("hit1");
         this.lastHit = "hit1";
         if(gc.sid == this.sourceRole.sid)
         {
            this.faceToTarget();
            gc.sendPetAttack(this.sourceRole.getRoleId(),"normalHit",this.getBBDC().getDirect(),0,0,[]);
         }
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
                  "qixue":0
               };
            case "hit2":
               _loc3_ = this._petInfo.getPetHarmObj("hy");
               if(_loc3_)
               {
                  return {
                     "hurt":(_loc3_.first + _loc5_) * _loc4_ * _loc6_,
                     "qixue":0
                  };
               }
               return {
                  "hurt":0,
                  "qixue":0
               };
               break;
            case "hit3_1":
               _loc3_ = this._petInfo.getPetHarmObj("sxhz");
               if(_loc3_)
               {
                  return {
                     "hurt":(_loc3_.first + _loc5_) * _loc4_ * _loc6_,
                     "qixue":0
                  };
               }
               return {
                  "hurt":0,
                  "qixue":0
               };
               break;
            case "hit3_2":
               _loc3_ = this._petInfo.getPetHarmObj("sxhz");
               if(_loc3_)
               {
                  return {
                     "hurt":(_loc3_.first + _loc5_) * _loc4_ * _loc6_,
                     "qixue":0
                  };
               }
               return {
                  "hurt":0,
                  "qixue":0
               };
               break;
            case "hit4":
               _loc3_ = this._petInfo.getPetHarmObj("hsqj");
               if(_loc3_)
               {
                  return {
                     "hurt":(_loc3_.first + _loc5_) * _loc4_ * _loc6_,
                     "qixue":0
                  };
               }
               return {
                  "hurt":0,
                  "qixue":0
               };
               break;
            default:
               return {
                  "hurt":0,
                  "qixue":0
               };
         }
      }
      
      override protected function exitFrameFunc(param1:Point) : void
      {
      }
      
      override protected function myIntelligence() : void
      {
         if(!this.isBeAttacking())
         {
            super.myIntelligence();
         }
      }
      
      override public function isAttacking() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3" || this.curAction == "hit4";
      }
      
      override protected function isCannotMoveWhenAttackOnFloor() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3" || this.curAction == "hit4";
      }
   }
}

