package export.pet
{
   import base.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   import petInfo.PetInfo;
   
   public class PetMonkey3 extends BasePet
   {
      
      private var skill3Release:Boolean = false;
      
      public function PetMonkey3(param1:BaseHero, param2:PetInfo)
      {
         super(param1,param2);
         this.horizenSpeed = 5;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":999,
            "power":12,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[8,0],
            "attackInterval":15,
            "power":12,
            "attackKind":"physics",
            "addEffect":[{
               "name":BaseAddEffect.PETMONKEY_FIRE,
               "time":3.6 * gc.frameClips,
               "hurt":Number(this._petInfo.getAtk()) / 10
            }]
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,0],
            "attackInterval":24,
            "power":12,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[3,0],
            "attackInterval":15,
            "power":12,
            "attackKind":"magic"
         };
         this.setAction("wait");
         this.skillCD1 = [gc.frameClips * 2,gc.frameClips * 3];
         this.skillCD2 = [gc.frameClips * 2,gc.frameClips * 7];
         this.skillCD3 = [gc.frameClips * 4,gc.frameClips * 9];
         this.skillCD4 = [gc.frameClips * 10,gc.frameClips * 24];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("PetMonkeyBmd3");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],150,150,new Point(0,0));
            bbdc.setOffsetXY(-8,5);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8],[2,2,2,2,10],[2,2,8],[2,9,15],[10],[1,1]]);
            bbdc.setFrameCount([6,4,1,5,3,3,1,20]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("PetMonkey3--BitmapData Error!");
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
                  if(param1.x == 2)
                  {
                     if(this.bbdc.getCurFrameCount() == 8)
                     {
                        if(_loc3_ == 0)
                        {
                           _loc4_.x = this.x - 100;
                        }
                        else
                        {
                           _loc4_.x = this.x + 100;
                        }
                        _loc4_.y = this.y - 40;
                        this.doHit1(_loc3_,_loc4_);
                        gc.sendPetAttack(this.sourceRole.getRoleId(),"hit1",this.getBBDC().getDirect(),_loc4_.x,_loc4_.y,[]);
                     }
                  }
               }
               break;
            case "hit2":
               if(gc.isSingleGame() || gc.sid == this.sourceRole.sid)
               {
                  if(param1.x == 0)
                  {
                     if(this.bbdc.getCurFrameCount() == 2)
                     {
                        if(_loc3_ == 0)
                        {
                           _loc4_.x = this.x - 35;
                        }
                        else
                        {
                           _loc4_.x = this.x + 35;
                        }
                        _loc4_.y = this.y - 60;
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
                     if(this.bbdc.getCurFrameCount() == 10)
                     {
                        if(_loc3_ == 0)
                        {
                           _loc4_.x = this.x - 45;
                        }
                        else
                        {
                           _loc4_.x = this.x + 45;
                        }
                        _loc4_.y = this.y - 50;
                        this.doHit3(_loc3_,_loc4_);
                        gc.sendPetAttack(this.sourceRole.getRoleId(),"hit3",this.getBBDC().getDirect(),_loc4_.x,_loc4_.y,[]);
                     }
                  }
               }
               break;
            case "hit4":
               if(gc.isSingleGame() || gc.sid == this.sourceRole.sid)
               {
                  if(param1.x == 0)
                  {
                     if(this.bbdc.getCurFrameCount() == 1)
                     {
                        if(_loc3_ == 0)
                        {
                           _loc4_.x = this.x;
                        }
                        else
                        {
                           _loc4_.x = this.x;
                        }
                        _loc4_.y = this.y - 15;
                        this.doHit4_1(_loc3_,_loc4_);
                        gc.sendPetAttack(this.sourceRole.getRoleId(),"hit4_1",this.getBBDC().getDirect(),_loc4_.x,_loc4_.y,[]);
                        if(_loc3_ == 0)
                        {
                           _loc4_.x = this.x - 10;
                        }
                        else
                        {
                           _loc4_.x = this.x + 10;
                        }
                        _loc4_.y = this.y - 15;
                        this.doHit4_2(_loc3_,_loc4_);
                        gc.sendPetAttack(this.sourceRole.getRoleId(),"hit4_2",this.getBBDC().getDirect(),_loc4_.x,_loc4_.y,[]);
                     }
                  }
               }
         }
      }
      
      override protected function beforeSkill3Start() : Boolean
      {
         return this._petInfo.getMp() >= this._petInfo.findPetUsedMagic("lj") && Boolean(this.skill3Release) && Boolean(this._petInfo.findHasStudySkill("lj"));
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         return this._petInfo.getMp() >= this._petInfo.findPetUsedMagic("lyq") && AUtils.GetDisBetweenTwoObj(this,this.curAttackTarget) <= 400 && Boolean(this._petInfo.findHasStudySkill("lyq"));
      }
      
      override protected function beforeSkill2Start() : Boolean
      {
         return this._petInfo.getMp() >= this._petInfo.findPetUsedMagic("xj") && Boolean(this._petInfo.findHasStudySkill("xj"));
      }
      
      override public function reduceHp(param1:int, param2:Boolean = false) : void
      {
         super.reduceHp(param1,param2);
         this.skill3Release = true;
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
         this._petInfo.setMp(Number(this._petInfo.getMp()) - Number(this._petInfo.findPetUsedMagic("lyq")));
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
         this._petInfo.setMp(Number(this._petInfo.getMp()) - Number(this._petInfo.findPetUsedMagic("xj")));
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
         this._petInfo.setMp(Number(this._petInfo.getMp()) - Number(this._petInfo.findPetUsedMagic("lj")));
      }
      
      private function doHit1(param1:uint, param2:Point) : void
      {
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("PetMonkey3Bullet1");
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
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("PetMonkey3Bullet2");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit2");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit4_1(param1:uint, param2:Point) : void
      {
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("PetMonkey3Bullet3_1");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDisable();
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit4");
         var _loc4_:int = gc.gameSence.getChildIndex(this);
         gc.gameSence.addChildAt(_loc3_,_loc4_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit4_2(param1:uint, param2:Point) : void
      {
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("PetMonkey3Bullet3_2");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit4");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit3(param1:uint, param2:Point) : void
      {
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("PetMonkey1Bullet2");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDestroyWhenLastFrame(false);
         _loc3_.setHurtCanCutDownEffect(false);
         _loc3_.setDestroyInCount(gc.frameClips * 4);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit3");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
         this.skill3Release = false;
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
            case "hit4_1":
               this.doHit4_1(param2,param3);
               break;
            case "hit4_2":
               this.doHit4_2(param2,param3);
               break;
            case "hit4Action":
               this.releSkill3();
               break;
            case "hit3Action":
               this.releSkill2();
               break;
            case "hit2Action":
               this.releSkill1();
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
                  "qixue":0,
                  "atk":this._petInfo.getAtk()
               };
            case "hit2":
               _loc3_ = this._petInfo.getPetHarmObj("lyq");
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
                  "qixue":0
               };
               break;
            case "hit3":
               _loc3_ = this._petInfo.getPetHarmObj("xj");
               if(_loc3_)
               {
                  return {
                     "hurt":Number(_loc3_.first) * _loc6_,
                     "qixue":0
                  };
               }
               return {
                  "hurt":0,
                  "qixue":0
               };
               break;
            case "hit4":
               _loc3_ = this._petInfo.getPetHarmObj("lj");
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
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3";
      }
   }
}

