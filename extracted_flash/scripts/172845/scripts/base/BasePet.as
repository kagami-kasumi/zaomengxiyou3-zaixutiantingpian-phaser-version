package base
{
   import com.greensock.*;
   import com.hexagonstar.util.debug.*;
   import event.*;
   import export.*;
   import export.bullet.*;
   import export.hero.*;
   import export.level.*;
   import export.magicWeapon.*;
   import export.monster.*;
   import export.pet.*;
   import flash.display.*;
   import flash.events.*;
   import flash.filters.*;
   import flash.geom.*;
   import flash.utils.*;
   import manager.*;
   import my.*;
   import petInfo.*;
   import user.*;
   
   public class BasePet extends BaseObject
   {
      
      public static var PET_MONKEY:uint = 0;
      
      public static var PET_HORSE:uint = 1;
      
      protected var sourceRole:BaseHero;
      
      private var hpSlip:Sprite;
      
      protected var _petInfo:PetInfo;
      
      protected var attackRate:Number = 0.8;
      
      protected var attackRange:uint = 150;
      
      protected var searchRange:uint = 1200;
      
      protected var followRange:uint = 640;
      
      protected var curAttackTarget:BaseObject;
      
      protected var lastBeAttackedTarget:BaseObject;
      
      protected var skillCD1:Array;
      
      protected var skillCD2:Array;
      
      protected var skillCD3:Array;
      
      protected var skillCD4:Array;
      
      protected var timeCount:uint = 0;
      
      protected var sxkbCount:uint = 300;
      
      protected var fsnlCount:uint = 300;
      
      protected var smjcCount:uint = 300;
      
      protected var mfjcCount:uint = 300;
      
      protected var gjjcCount:uint = 300;
      
      protected var fyjcCount:uint = 300;
      
      protected var testCount:uint = 96;
      
      protected var tCount:uint = 0;
      
      public function BasePet(param1:BaseHero, param2:PetInfo)
      {
         this.attackRate = 0.8;
         this.attackRate = 0.8;
         this.attackRate = 0.8;
         this.attackRate = 0.8;
         this.attackRate = 0.8;
         this.attackRate = 0.8;
         this.attackRate = 0.8;
         this.attackRate = 0.8;
         this.attackRate = 0.8;
         this.attackRate = 0.7;
         this.attackRate = 0.7;
         this.attackRate = 0.7;
         this.attackRate = 0.7;
         this.attackRate = 0.7;
         this.skillCD1 = [-1,30];
         this.skillCD2 = [-1,30];
         this.skillCD3 = [-1,30];
         this.skillCD4 = [-1,30];
         super();
         this.petInfo = param2;
         this.sourceRole = param1;
         this.newHpSlip();
         this.jumpPower = -30;
         this.curAddEffect = new BaseAddEffect(BaseObject(this));
         this.bbdc.turnRight();
         this.curAddEffect.add([{
            "name":"father",
            "time":gc.frameClips * 5,
            "interval":1000,
            "isForever":1
         }]);
         this.horizenSpeed = this._petInfo.getMoveSpeed();
      }
      
      override protected function __added(param1:Event) : void
      {
         super.__added(param1);
         if(gc.pWorld.getBaseLevelListener() is StageListener221)
         {
            (gc.pWorld.getBaseLevelListener() as StageListener221).addBoatByBaseObject(this);
         }
         if(gc.pWorld.getBaseLevelListener() is StageListener222)
         {
            (gc.pWorld.getBaseLevelListener() as StageListener222).addBoatByBaseObject(this);
         }
         if(gc.pWorld.getBaseLevelListener() is StageListener223)
         {
            (gc.pWorld.getBaseLevelListener() as StageListener223).addBoatByBaseObject(this);
         }
      }
      
      public function get petInfo() : PetInfo
      {
         return this._petInfo;
      }
      
      public function set petInfo(param1:PetInfo) : void
      {
         this._petInfo = param1;
      }
      
      override protected function initBBDC() : void
      {
      }
      
      override public function step() : void
      {
         var _loc1_:* = null;
         var _loc2_:* = [];
         for each(_loc1_ in this.magicBulletArray)
         {
            _loc1_.step2();
            if(_loc1_.isReadyToDestroy)
            {
               _loc2_.push(_loc1_);
            }
         }
         if(this.tCount++ >= this.gc.frameClips)
         {
            this.doPassive();
            this.tCount = 0;
         }
         this.clearWaitFromParentArray(_loc2_,this.magicBulletArray);
         this.myIntelligence();
         this._petInfo.upPassive();
         this.countSkillCD();
         ++this.timeCount;
         if(this.timeCount >= 59999)
         {
            this.timeCount = 0;
         }
         if(this.isGXP)
         {
            if(Number(this.timeCount) % 4 == 0)
            {
               AUtils.shallowEffect(this);
            }
         }
         if(AUtils.GetDisBetweenTwoObj(this,this.sourceRole) >= 1000)
         {
            if(!this.isAttacking() && !this.isBeAttacking())
            {
               this.x = this.sourceRole.x;
               this.y = Number(this.sourceRole.y) - 30;
            }
         }
         super.step();
      }
      
      private function countSkillCD() : void
      {
         if(this.skillCD1[0] > 0)
         {
            if(this.skillCD1[0]-- <= 0)
            {
               this.skillCD1[0] = 0;
            }
         }
         if(this.skillCD2[0] > 0)
         {
            if(this.skillCD2[0]-- <= 0)
            {
               this.skillCD2[0] = 0;
            }
         }
         if(this.skillCD3[0] > 0)
         {
            if(this.skillCD3[0]-- <= 0)
            {
               this.skillCD3[0] = 0;
            }
         }
         if(this.skillCD4[0] > 0)
         {
            if(this.skillCD4[0]-- <= 0)
            {
               this.skillCD4[0] = 0;
            }
         }
      }
      
      private function clearWaitFromParentArray(param1:Array, param2:Array) : void
      {
         var _loc3_:* = undefined;
         var _loc4_:int = 0;
         var _loc5_:int = 0;
         while(param1.length > 0)
         {
            _loc3_ = param1.shift();
            _loc4_ = int(param2.indexOf(_loc3_));
            if(_loc4_ != -1)
            {
               param2.splice(_loc4_,1);
            }
            _loc5_++;
         }
      }
      
      protected function beforeSkill1Start() : Boolean
      {
         return false;
      }
      
      protected function beforeSkill2Start() : Boolean
      {
         return false;
      }
      
      protected function beforeSkill3Start() : Boolean
      {
         return false;
      }
      
      protected function beforeSkill4Start() : Boolean
      {
         return false;
      }
      
      protected function releSkill1() : void
      {
      }
      
      protected function releSkill2() : void
      {
      }
      
      protected function releSkill3() : void
      {
      }
      
      protected function releSkill4() : void
      {
      }
      
      public function turnToGxp(param1:uint) : void
      {
         var time:uint = param1;
         this.isGXP = true;
         this.horizenSpeed = 10;
         TweenMax.delayedCall(time,function(param1:BasePet):*
         {
            param1.cancelGxp();
         },[this]);
      }
      
      public function cancelGxp() : void
      {
         this.isGXP = false;
         this.horizenSpeed = 5;
      }
      
      override protected function move() : void
      {
         if(this.curAddEffect)
         {
            if(this.curAddEffect.isAnyThingElseStun(""))
            {
               this.setStatic();
               return;
            }
         }
         super.move();
      }
      
      override public function isCanMoveByStage() : Boolean
      {
         return super.isCanMoveByStage();
      }
      
      protected function myIntelligence() : void
      {
         if(this.curAddEffect)
         {
            if(this.curAddEffect.isAnyThingElseStun(""))
            {
               return;
            }
         }
         if(gc.sid == this.sourceRole.sid || gc.isSingleGame())
         {
            if(!this.curAttackTarget)
            {
               this.searchTarget();
               if(Number(this.timeCount) % gc.frameClips == 0)
               {
                  this.followSource();
               }
            }
            else if(this.curAttackTarget.isDead())
            {
               this.curAttackTarget = null;
            }
            else if(AUtils.GetDisBetweenTwoObj(this,this.curAttackTarget) >= 1200)
            {
               this.curAttackTarget = null;
            }
            else if(!this.isBeAttacking() && !this.isAttacking())
            {
               if(Boolean(this.beforeSkill1Start()) && this.skillCD1[0] == 0)
               {
                  this.releSkill1();
                  this.skillCD1[0] = this.skillCD1[1];
               }
               else if(Boolean(this.beforeSkill2Start()) && this.skillCD2[0] == 0)
               {
                  this.releSkill2();
                  this.skillCD2[0] = this.skillCD2[1];
               }
               else if(Boolean(this.beforeSkill3Start()) && this.skillCD3[0] == 0)
               {
                  this.releSkill3();
                  this.skillCD3[0] = this.skillCD3[1];
               }
               else if(Boolean(this.beforeSkill4Start()) && this.skillCD4[0] == 0)
               {
                  this.releSkill4();
                  this.skillCD4[0] = this.skillCD4[1];
               }
               else if(Number(this.timeCount) % gc.frameClips == 0)
               {
                  if(AUtils.GetDisBetweenTwoObj(this,this.curAttackTarget) <= this.attackRange)
                  {
                     if(Math.random() <= this.attackRate)
                     {
                        this.normalHit();
                     }
                     else if(Math.random() < 0.3)
                     {
                        this.setStatic();
                        gc.sendPetAction(this.sourceRole.getRoleId(),"wait",this.x,this.y);
                     }
                     else
                     {
                        this.followTarget();
                     }
                  }
                  else
                  {
                     this.followTarget();
                  }
               }
            }
            if(gc.isInRoomOrSingleGame())
            {
               this.checkBuffSkill();
            }
            if(this.y - Number(this.sourceRole.y) > 5 * 60)
            {
               if(!this.isAttacking() && !this.isBeAttacking())
               {
                  this.jump();
               }
            }
            else if(Number(this.sourceRole.y) - this.y > 50)
            {
               if(!this.isAttacking() && !this.isBeAttacking())
               {
                  this.getFallDown();
               }
            }
         }
      }
      
      protected function doPassive() : void
      {
         this.cureHp(this._petInfo.getEHp());
         this.cureMp(this._petInfo.getEMp());
      }
      
      protected function checkBuffSkill() : void
      {
         if(this.sxkbCount > 0)
         {
            --this.sxkbCount;
         }
         if(this.fsnlCount > 0)
         {
            --this.fsnlCount;
         }
         if(this.smjcCount > 0)
         {
            --this.smjcCount;
         }
         if(this.mfjcCount > 0)
         {
            --this.mfjcCount;
         }
         if(this.gjjcCount > 0)
         {
            --this.gjjcCount;
         }
         if(this.fyjcCount > 0)
         {
            --this.fyjcCount;
         }
         if(this.testCount > 0)
         {
            --this.testCount;
         }
         var _loc1_:* = 0;
         var _loc2_:* = 0;
         if(this.sxkbCount == 0 && Boolean(this._petInfo.findHasStudySkill("sxkb")) && this._petInfo.getMp() >= this._petInfo.findPetUsedMagic("sxkb"))
         {
            if(this.curAddEffect)
            {
               _loc2_ = Number(this._petInfo.getPetHarmObj("sxkb").first);
               _loc1_ = uint(this._petInfo.getPetHarmObj("sxkb").second);
               this.curAddEffect.add([{
                  "name":BaseAddEffect.PET_SXKB,
                  "time":_loc1_ * gc.frameClips,
                  "value":_loc2_
               }]);
            }
            this._petInfo.setMp(Number(this._petInfo.getMp()) - Number(this._petInfo.findPetUsedMagic("sxkb")));
            this.sxkbCount = 4320;
         }
         if(this.fsnlCount == 0 && Boolean(this._petInfo.findHasStudySkill("fsnl")) && this._petInfo.getMp() >= this._petInfo.findPetUsedMagic("fsnl"))
         {
            if(this.curAddEffect)
            {
               _loc2_ = Number(this._petInfo.getPetHarmObj("fsnl").first);
               _loc1_ = uint(this._petInfo.getPetHarmObj("fsnl").second);
               this.curAddEffect.add([{
                  "name":BaseAddEffect.PET_FSNL,
                  "time":_loc1_ * gc.frameClips,
                  "value":_loc2_
               }]);
            }
            this._petInfo.setMp(Number(this._petInfo.getMp()) - Number(this._petInfo.findPetUsedMagic("fsnl")));
            this.fsnlCount = 5400;
         }
         if(this.smjcCount == 0 && Boolean(this._petInfo.findHasStudySkill("smjc")) && this._petInfo.getMp() >= this._petInfo.findPetUsedMagic("smjc"))
         {
            if(this.curAddEffect)
            {
               _loc2_ = Number(this._petInfo.getPetHarmObj("smjc").first);
               _loc1_ = uint(this._petInfo.getPetHarmObj("smjc").second);
               if(this.sourceRole)
               {
                  this.sourceRole.curAddEffect.add([{
                     "name":BaseAddEffect.PET_SMJC,
                     "time":_loc1_ * gc.frameClips,
                     "value":_loc2_
                  }]);
               }
            }
            this._petInfo.setMp(Number(this._petInfo.getMp()) - Number(this._petInfo.findPetUsedMagic("smjc")));
            this.smjcCount = 5400;
         }
         if(this.mfjcCount == 0 && Boolean(this._petInfo.findHasStudySkill("mfjc")) && this._petInfo.getMp() >= this._petInfo.findPetUsedMagic("mfjc"))
         {
            if(this.curAddEffect)
            {
               _loc2_ = Number(this._petInfo.getPetHarmObj("mfjc").first);
               _loc1_ = uint(this._petInfo.getPetHarmObj("mfjc").second);
               if(this.sourceRole)
               {
                  this.sourceRole.curAddEffect.add([{
                     "name":BaseAddEffect.PET_MFJC,
                     "time":_loc1_ * gc.frameClips,
                     "value":_loc2_
                  }]);
               }
            }
            this._petInfo.setMp(Number(this._petInfo.getMp()) - Number(this._petInfo.findPetUsedMagic("mfjc")));
            this.mfjcCount = 5400;
         }
         if(this.gjjcCount == 0 && Boolean(this._petInfo.findHasStudySkill("gjjc")) && this._petInfo.getMp() >= this._petInfo.findPetUsedMagic("gjjc"))
         {
            if(this.curAddEffect)
            {
               _loc2_ = Number(this._petInfo.getPetHarmObj("gjjc").first);
               _loc1_ = uint(this._petInfo.getPetHarmObj("gjjc").second);
               if(this.sourceRole)
               {
                  this.sourceRole.curAddEffect.add([{
                     "name":BaseAddEffect.PET_GJJC,
                     "time":_loc1_ * gc.frameClips,
                     "value":_loc2_
                  }]);
               }
            }
            this._petInfo.setMp(Number(this._petInfo.getMp()) - Number(this._petInfo.findPetUsedMagic("gjjc")));
            this.gjjcCount = 5400;
         }
         if(this.fyjcCount == 0 && Boolean(this._petInfo.findHasStudySkill("fyjc")) && this._petInfo.getMp() >= this._petInfo.findPetUsedMagic("fyjc"))
         {
            if(this.curAddEffect)
            {
               _loc2_ = Number(this._petInfo.getPetHarmObj("fyjc").first);
               _loc1_ = uint(this._petInfo.getPetHarmObj("fyjc").second);
               if(this.sourceRole)
               {
                  this.sourceRole.curAddEffect.add([{
                     "name":BaseAddEffect.PET_FYJC,
                     "time":_loc1_ * gc.frameClips,
                     "value":_loc2_
                  }]);
               }
            }
            this._petInfo.setMp(Number(this._petInfo.getMp()) - Number(this._petInfo.findPetUsedMagic("fyjc")));
            this.fyjcCount = 5400;
         }
      }
      
      public function setOtherAction(param1:String) : void
      {
         var _loc2_:Point = this.bbdc.getCurPoint();
         switch(param1)
         {
            case "wait":
               this.setAction("wait");
               this.setStatic();
               break;
            case "jump":
               this.jump();
               break;
            case "turnLeft":
               this.turnLeft();
               this.setAction("walk");
               break;
            case "turnRight":
               this.turnRight();
               this.setAction("walk");
               break;
            case "getfalldown":
               this.getFallDown();
         }
      }
      
      override public function beMagicAttack(param1:BaseBullet, param2:BaseObject, param3:Boolean = false) : Boolean
      {
         var _loc4_:* = null;
         var _loc5_:int = 0;
         var _loc6_:int = 0;
         var _loc7_:Boolean = false;
         var _loc8_:* = null;
         var _loc9_:* = null;
         var _loc10_:* = null;
         var _loc11_:int = 0;
         var _loc12_:* = null;
         var _loc13_:* = NaN;
         var _loc14_:* = 0;
         var _loc15_:* = 0;
         var _loc16_:Boolean = false;
         if(gc.protectedPerproty.getProperty(this,"isYourFather"))
         {
            return false;
         }
         if(param3 || Boolean(this.colipse && AUtils.testIntersects(this.colipse,param1,gc.gameSence)) && Boolean(HitTest.complexHitTestObject(this.colipse,param1)))
         {
            _loc16_ = false;
            if(this.getCurAddEffect(BaseAddEffect.PET_RABBIT_JIFENG))
            {
               _loc11_ = int(this._petInfo.getPetName().charAt(this._petInfo.getPetName().length - 1));
               if(Math.random() < 0.1 + _loc11_ * 0.1)
               {
                  _loc16_ = true;
               }
            }
            if(Math.random() < Number(this._petInfo.getMiss()) - Number(BaseMonster(param2).Hit) / 100)
            {
               _loc16_ = true;
            }
            if(_loc16_)
            {
               this.addMissMc();
               this.beAttackIdArray.push(param1.getAttackId());
               return true;
            }
            if(param1.isBingo)
            {
               if(gc.difficulity == 2)
               {
                  this.reduceHp(this._petInfo.getSHp() * 99);
                  return;
               }
               this.addBingoMc();
               this.setYourFather(gc.frameClips * 1.5);
               this.reduceHp(this._petInfo.getSHp() * 0.3);
               this._petInfo.setMp(this._petInfo.getMp() - this._petInfo.getSMp() * 0.2);
               return;
            }
            this.lastBeAttackedTarget = param2;
            this.curAttackTarget = param2;
            _loc4_ = param2.attackBackInfoDict[param1.curAction];
            if(_loc4_)
            {
               _loc9_ = this.getBeattackBackSpeed(param1,_loc4_);
               if(param1.getImcName() != "Role1Bullet12")
               {
                  this.setAttackBack(_loc9_);
               }
               if(_loc4_.addEffect)
               {
                  _loc10_ = AUtils.clone(_loc4_.addEffect) as Array;
                  _loc11_ = 0;
                  while(_loc11_ < _loc10_.length)
                  {
                     _loc12_ = _loc10_[_loc11_];
                     if(_loc12_.time == BaseBullet.DESIDE_BY_FRAMES_LEFT)
                     {
                        _loc12_.time = param1.getFrameLeft();
                     }
                     _loc11_++;
                  }
                  this.addCurAddEffect(_loc10_);
               }
            }
            _loc7_ = false;
            _loc5_ = int(param2.getRealPower(param1.curAction).hurt);
            _loc6_ = int(param2.getRealPower(param1.curAction,false).hurt);
            if(param1.getImcName() == "Role1Bullet12")
            {
               _loc13_ = Number(AUtils.GetDisBetweenTwoObj(this,param2));
               if(_loc13_ > 1000)
               {
                  _loc13_ = 1000;
               }
               _loc5_ *= (1000 - _loc13_) / 1000;
               _loc6_ *= (1000 - _loc13_) / 1000;
            }
            if(_loc5_ / _loc6_ >= 1.9)
            {
               _loc7_ = true;
            }
            _loc5_ = int(this.countHurt(_loc5_,_loc4_));
            if(param2 is BaseHero)
            {
               if(Boolean(_loc4_) && _loc4_.attackKind == "physics")
               {
                  if(BaseHero(param2).sid == gc.sid && gc.isInRoom())
                  {
                     _loc14_ = uint(BaseHero(param2).roleProperies.getEatBlood());
                     _loc15_ = uint(int(_loc14_ / 100 * _loc5_));
                     if(_loc15_ > 0)
                     {
                        BaseHero(param2).cureHp(_loc15_);
                     }
                  }
               }
            }
            else if(param2 is Monster6)
            {
               if(Math.random() <= 0.1)
               {
                  if(this.curAddEffect)
                  {
                     this.curAddEffect.add([{
                        "name":BaseAddEffect.PETHORSE_ICE,
                        "time":gc.frameClips * 1.5
                     }]);
                  }
               }
            }
            else if(param2 is Monster16)
            {
               if(Math.random() <= 0.2)
               {
                  if(this.curAddEffect)
                  {
                     this.curAddEffect.add([{
                        "name":BaseAddEffect.PETMONKEY_FIRE,
                        "hurt":10,
                        "time":gc.frameClips * 3
                     }]);
                  }
               }
            }
            if(param1.getImcName() == "Role1Bullet12")
            {
               this.reduceHp(_loc5_,false);
            }
            else
            {
               this.reduceHp(_loc5_,true);
            }
            _loc8_ = this.getBeattackBackSpeed(param1,_loc4_);
            if(param2 is BaseHero && this.sourceRole.sid != gc.sid)
            {
               if(BaseHero(param2).sid == gc.sid)
               {
                  if(param1.getImcName() == "Role1Bullet12")
                  {
                     gc.sendPetHurt(_loc5_,this.sourceRole.sid,Number(this.sourceRole.getRoleId()) * 10 + BaseHero(param2).getRoleId(),param1.curAction,_loc8_.x,_loc8_.y,param1.initTimer,false,false);
                  }
                  else
                  {
                     gc.sendPetHurt(_loc5_,this.sourceRole.sid,Number(this.sourceRole.getRoleId()) * 10 + BaseHero(param2).getRoleId(),param1.curAction,_loc8_.x,_loc8_.y,param1.initTimer);
                  }
               }
            }
            else if(param2 is BasePet && this.sid != gc.sid)
            {
               if(BasePet(param2).getSourceRole().sid == gc.sid)
               {
                  if(param1.getImcName() == "Role1Bullet12")
                  {
                     gc.sendPetHurt(_loc5_,this.sourceRole.sid,Number(this.sourceRole.getRoleId()) * 10 + BasePet(param2).getSourceRole().getRoleId(),param1.curAction,_loc8_.x,_loc8_.y,param1.initTimer,false,false);
                  }
                  else
                  {
                     gc.sendPetHurt(_loc5_,this.sourceRole.sid,Number(this.sourceRole.getRoleId()) * 10 + BasePet(param2).getSourceRole().getRoleId(),param1.curAction,_loc8_.x,_loc8_.y,param1.initTimer);
                  }
               }
            }
            this.addBeAttackEffect(param2);
            return true;
         }
         return false;
      }
      
      protected function addMissMc() : void
      {
         var missMc:* = undefined;
         missMc = undefined;
         missMc = undefined;
         missMc = undefined;
         missMc = AUtils.getImageObj("miss");
         missMc.x = this.x - 20;
         missMc.y = this.y - 60;
         this.gc.gameSence.addChild(missMc);
         TweenMax.to(missMc,2,{
            "y":Number(missMc.y) - 60,
            "alpha":0,
            "onComplete":function():*
            {
               if(Boolean(missMc) && Boolean(gc.gameSence) && gc.gameSence.contains(missMc))
               {
                  gc.gameSence.removeChild(missMc);
               }
            }
         });
      }
      
      override public function setAttackBack(param1:Point) : void
      {
         if(!this.isGXP)
         {
            super.setAttackBack(param1);
         }
      }
      
      protected function countHurt(param1:int, param2:Object) : int
      {
         var _loc3_:Number = Number(NaN);
         if(param2)
         {
            if(param2.attackKind == "magic")
            {
               _loc3_ = Number(this._petInfo.getMDef());
               if(_loc3_ > 1)
               {
                  _loc3_ = 0;
               }
               return param1 * (1 - _loc3_);
            }
            if(param2.attackKind == "physics")
            {
               if(param1 > this._petInfo.getDef())
               {
                  param1 -= this._petInfo.getDef();
               }
               else
               {
                  param1 = 1;
               }
               return param1;
            }
         }
         return param1;
      }
      
      protected function getCriteValue(param1:Boolean) : Boolean
      {
         var _loc2_:* = null;
         var _loc3_:Boolean = false;
         var _loc4_:Number = Number(NaN);
         if(param1)
         {
            _loc4_ = 0;
            if(this.curAddEffect)
            {
               _loc2_ = this.curAddEffect.getBuffByName(BaseAddEffect.PET_SXKB);
               if(_loc2_)
               {
                  _loc4_ += _loc2_.value;
               }
            }
            if(this._petInfo)
            {
               _loc4_ += this._petInfo.getCrit();
            }
            if(Math.random() <= _loc4_)
            {
               _loc3_ = true;
            }
         }
         else
         {
            _loc3_ = false;
         }
         return _loc3_;
      }
      
      protected function getMagicAddValue() : uint
      {
         var _loc1_:* = null;
         var _loc2_:* = 0;
         if(this.curAddEffect)
         {
            _loc1_ = this.curAddEffect.getBuffByName(BaseAddEffect.PET_FSNL);
            if(_loc1_)
            {
               _loc2_ = uint(_loc1_.value);
            }
         }
         return _loc2_;
      }
      
      override protected function getFallDown() : void
      {
         if(Boolean(this.standInObj) && Boolean(this.standInObj.getChildByName("isThroughWall")))
         {
            this.y += 20;
            gc.sendPetAction(this.sourceRole.getRoleId(),"getfalldown",this.x,this.y);
         }
      }
      
      override public function reduceHp(param1:int, param2:Boolean = false) : void
      {
         var _loc3_:* = null;
         var _loc4_:Number = Number(NaN);
         if(this.isGXP)
         {
            param2 = false;
         }
         this.showHpSlip();
         this._petInfo.setHp(Number(this._petInfo.getHp()) - param1);
         if(gc.sid == this.sourceRole.sid || gc.isSingleGame())
         {
            this.addMonHurtMc(param1,false);
            _loc3_ = gc.getMutiUserBySidAndRoleId(this.sourceRole.sid,this.sourceRole.getRoleId());
            if(_loc3_)
            {
               _loc3_.petHp = this._petInfo.getHp();
               gc.sendSelfMutiUserInfo(this.sourceRole.getRoleId());
            }
         }
         this.drawPetHp();
         if(this._petInfo.getHp() <= 0)
         {
            this._petInfo.setHp(0);
            if(gc.sid == this.sourceRole.sid && gc.isInRoom())
            {
               if(this.curAction != "dead")
               {
                  this.setAction("dead");
                  gc.sendPetDead(this.sourceRole.getRoleId());
               }
            }
            else if(gc.isSingleGame())
            {
               if(this.curAction != "dead")
               {
                  this.setYourFather(gc.frameClips * 5);
                  this.setAction("dead");
                  this._petInfo.setlifetime(this._petInfo.getlifetime() - 1);
               }
            }
         }
         else if(param2)
         {
            if(this._petInfo.findHasStudySkill("qlfj"))
            {
               _loc4_ = Number(this._petInfo.getPetHarmObj("qlfj").first);
               if(Math.random() <= _loc4_)
               {
                  this.normalHit();
               }
               else if(this.curAction == "hurt")
               {
                  this.bbdc.setFramePointX(0);
               }
               else
               {
                  this.setAction("hurt");
               }
            }
            else if(this.curAction == "hurt")
            {
               this.bbdc.setFramePointX(0);
            }
            else
            {
               this.setAction("hurt");
            }
         }
      }
      
      public function cureHp(param1:int) : void
      {
         var _loc2_:* = null;
         if(!this.isDead())
         {
            this.addCureMc(param1);
            if(this._petInfo.getHp() + param1 > this._petInfo.getSHp())
            {
               this._petInfo.setHp(this._petInfo.getSHp());
            }
            else
            {
               this._petInfo.setHp(this._petInfo.getHp() + param1);
            }
            if(gc.sid == this.sourceRole.sid && gc.isInRoom())
            {
               _loc2_ = gc.getMutiUserBySidAndRoleId(this.sourceRole.sid,this.sourceRole.getRoleId());
               if(_loc2_)
               {
                  _loc2_.petHp = this._petInfo.getHp();
                  gc.sendSelfMutiUserInfo(this.sourceRole.getRoleId());
               }
            }
         }
      }
      
      public function cureMp(param1:int) : void
      {
         if(this._petInfo.getMp() + param1 > this._petInfo.getSMp())
         {
            this._petInfo.setMp(this._petInfo.getSMp());
         }
         else
         {
            this._petInfo.setMp(this._petInfo.getMp() + param1);
         }
      }
      
      public function addMonHurtMc(param1:int, param2:Boolean, param3:Boolean = false) : *
      {
         var _loc4_:ANumber = new ANumber();
         this.gc.gameSence.addChild(_loc4_);
         _loc4_.aNumImage("pnum",param1,this.x - 20,this.y - 60,20);
      }
      
      override protected function addBeAttackEffect(param1:BaseObject) : void
      {
         if(this.curAddEffect)
         {
            this.curAddEffect.updateFather();
         }
         var _loc2_:MovieClip = AUtils.getNewObj("HeroBeHurt");
         var _loc3_:ColorMatrix = new ColorMatrix();
         _loc3_.adjustColor(0,0,0,100);
         _loc2_.filters = [new ColorMatrixFilter(_loc3_)];
         _loc2_.x = this.colipse.x;
         _loc2_.y = this.colipse.y;
         this.addChild(_loc2_);
      }
      
      public function addBeAttackEffectForOther() : void
      {
         this.addBeAttackEffect(null);
      }
      
      protected function normalHit() : void
      {
         this.newAttackId();
         this.faceToTarget();
         this.setAction("hit1");
         this.lastHit = "hit1";
      }
      
      protected function followTarget() : void
      {
         if(this.x > this.curAttackTarget.x)
         {
            this.turnLeft();
            gc.sendPetAction(this.sourceRole.getRoleId(),"turnLeft",this.x,this.y);
         }
         else
         {
            this.turnRight();
            gc.sendPetAction(this.sourceRole.getRoleId(),"turnRight",this.x,this.y);
         }
      }
      
      protected function followSource() : void
      {
         if(AUtils.GetDisBetweenTwoObj(this,this.sourceRole) > this.followRange)
         {
            if(this.x > this.sourceRole.x)
            {
               this.turnLeft();
               gc.sendPetAction(this.sourceRole.getRoleId(),"turnLeft",this.x,this.y);
            }
            else
            {
               this.turnRight();
               gc.sendPetAction(this.sourceRole.getRoleId(),"turnRight",this.x,this.y);
            }
         }
         else
         {
            this.setStatic();
            gc.sendPetAction(this.sourceRole.getRoleId(),"wait",this.x,this.y);
         }
      }
      
      protected function addAoyiBuff() : void
      {
         var _loc1_:FollowBaseObjectBullet = new FollowBaseObjectBullet("AoyiBuff");
         _loc1_.x = this.x;
         _loc1_.y = this.y;
         _loc1_.setRole(this);
         _loc1_.setDirect(0);
         _loc1_.setDisable();
         _loc1_.setAction("null");
         gc.gameSence.addChild(_loc1_);
         this.magicBulletArray.push(_loc1_);
      }
      
      public function faceToTarget() : void
      {
         if(this.curAttackTarget)
         {
            if(this.x < this.curAttackTarget.x)
            {
               this.turnRight();
               gc.sendPetAction(this.sourceRole.getRoleId(),"turnRight",this.x,this.y);
            }
            else
            {
               this.turnLeft();
               gc.sendPetAction(this.sourceRole.getRoleId(),"turnLeft",this.x,this.y);
            }
         }
      }
      
      protected function searchTarget() : void
      {
         var _loc1_:* = null;
         for each(_loc1_ in gc.obbsiteArray)
         {
            if(AUtils.GetDisBetweenTwoObj(_loc1_,this) <= this.searchRange)
            {
               this.curAttackTarget = _loc1_;
               break;
            }
         }
      }
      
      protected function showHpSlip() : void
      {
         this.hpSlip.visible = true;
         TweenMax.to(this.hpSlip,2,{
            "alpha":0,
            "onComplete":function(param1:Sprite):*
            {
               param1.visible = false;
            },
            "onCompleteParams":[this.hpSlip]
         });
      }
      
      protected function newHpSlip() : void
      {
         this.hpSlip = new Sprite();
         this.hpSlip.x = -23;
         this.hpSlip.y = -this.colipse.height / 2 - 10;
         this.hpSlip.visible = false;
         addChild(this.hpSlip);
      }
      
      protected function drawPetHp() : void
      {
         this.hpSlip.graphics.clear();
         this.hpSlip.alpha = 1;
         var _loc1_:Number = Number(this._petInfo.getHp()) / Number(this._petInfo.getSHp());
         _loc1_ = _loc1_ < 0 ? 0 : Number(_loc1_);
         if(this._petInfo.getHp() >= 0)
         {
            this.hpSlip.graphics.lineStyle(1.2,0);
            this.hpSlip.graphics.drawRect(0,5,50,5);
            this.hpSlip.graphics.beginFill(16711680);
            if(this.getBBDC().getDirect() == 0)
            {
               this.hpSlip.graphics.drawRect(0,5,50 * _loc1_,5);
            }
            else if(this.getBBDC().getDirect() == 1)
            {
               this.hpSlip.graphics.drawRect(50 - 50 * _loc1_,5,50 * _loc1_,5);
            }
            this.hpSlip.graphics.endFill();
         }
      }
      
      override protected function jump() : void
      {
         if(this.speed.y >= 0)
         {
            this.speed.y = jumpPower;
            if(gc.sid == this.sourceRole.sid && !gc.isSingleGame())
            {
               gc.sendPetAction(this.sourceRole.getRoleId(),"jump",this.x,this.y);
            }
         }
      }
      
      public function getSourceRole() : BaseHero
      {
         return this.sourceRole;
      }
      
      public function destroy() : void
      {
         var i:int = 0;
         var bb:BaseBullet = null;
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
            this.sourceRole.clearPet();
            this.sourceRole = null;
         }
         gc.protectedPerproty.removeProperty(this);
      }
      
      override public function getRealPower(param1:String, param2:Boolean = true) : Object
      {
         switch(param1)
         {
            case "hit1":
               return {
                  "hurt":param1,
                  "qixue":0
               };
            default:
               return {
                  "hurt":0,
                  "qixue":0
               };
         }
      }
      
      protected function hurtBaseEffectRate() : Number
      {
         var _loc1_:* = undefined;
         var _loc2_:Number = 1;
         if(this.curAddEffect)
         {
            _loc1_ = this.curAddEffect.getBuffByName(BaseAddEffect.MAGIC_FLOWER_ADDBUFF);
            if(_loc1_)
            {
               if(this._petInfo)
               {
                  _loc2_ = 1 + _loc1_.value;
               }
            }
         }
         return _loc2_;
      }
      
      override public function isDead() : Boolean
      {
         return this._petInfo.getHp() <= 0;
      }
      
      private function getDeCodeValue(param1:Number) : int
      {
         return param1 * 10 + 5;
      }
      
      private function enCodeValue(param1:int) : Number
      {
         return (param1 - 5) / 10;
      }
      
      public function getMitiSaveInfo() : String
      {
         return this._petInfo.getPetName() + "," + this._petInfo.getHp() + "," + this._petInfo.getMp();
      }
   }
}

