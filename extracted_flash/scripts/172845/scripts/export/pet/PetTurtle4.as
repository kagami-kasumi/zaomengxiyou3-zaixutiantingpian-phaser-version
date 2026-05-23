package export.pet
{
   import base.*;
   import com.greensock.*;
   import event.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   import petInfo.PetInfo;
   
   public class PetTurtle4 extends BasePet
   {
      
      private var isAoyi:Boolean = false;
      
      public function PetTurtle4(param1:BaseHero, param2:PetInfo)
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
            "attackBackSpeed":[6,0],
            "attackInterval":999,
            "power":12,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[2,0],
            "attackInterval":gc.frameClips * 0.25,
            "power":12,
            "attackKind":"magic"
         };
         this.attackRange = 150;
         this.setAction("wait");
         this.skillCD1 = [gc.frameClips * 3,gc.frameClips * 6];
         this.skillCD2 = [gc.frameClips * 3,gc.frameClips * 20];
         this.skillCD3 = [gc.frameClips * 4,gc.frameClips * 5.5];
         this.skillCD4 = [gc.frameClips * 12,gc.frameClips * 18];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:Object = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("PetTurtleBmd4");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],250,250,new Point(0,0));
            bbdc.setOffsetXY(21,-17);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8],[2,2,2,2,2],[2,2,2,10],[2,2,10],[2,2,10]]);
            bbdc.setFrameCount([6,4,1,5,4,3,3]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("PetTurtleBmd4--BitmapData Error!");
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
               this.isAoyi = false;
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
                           _loc4_.x = this.x - 140;
                        }
                        else
                        {
                           _loc4_.x = this.x + 140;
                        }
                        _loc4_.y = this.y - 75;
                        this.doHit1(_loc3_,_loc4_);
                        gc.sendPetAttack(this.sourceRole.getRoleId(),"hit1",this.getBBDC().getDirect(),_loc4_.x,_loc4_.y,[]);
                     }
                  }
               }
               break;
            case "hit2":
               if(gc.isSingleGame() || gc.sid == this.sourceRole.sid)
               {
                  if(param1.x == 2)
                  {
                     if(this.bbdc.getCurFrameCount() == 10)
                     {
                        if(_loc3_ == 0)
                        {
                           _loc4_.x = this.x - 75;
                        }
                        else
                        {
                           _loc4_.x = this.x + 75;
                        }
                        _loc4_.y = this.y - 115;
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
                           _loc4_.x = this.x;
                        }
                        else
                        {
                           _loc4_.x = this.x;
                        }
                        _loc4_.y = this.y - 20;
                        this.doHit3(_loc3_,_loc4_);
                        gc.sendPetAttack(this.sourceRole.getRoleId(),"hit3",this.getBBDC().getDirect(),_loc4_.x,_loc4_.y,[]);
                     }
                  }
               }
         }
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         var _loc1_:Number = AUtils.GetDisBetweenTwoObj(this,this.curAttackTarget);
         return _loc1_ >= 50 && _loc1_ <= 200 && this._petInfo.getMp() >= this._petInfo.findPetUsedMagic("sld") && Boolean(this._petInfo.findHasStudySkill("sld"));
      }
      
      override protected function beforeSkill2Start() : Boolean
      {
         var _loc1_:Number = AUtils.GetDisBetweenTwoObj(this,this.curAttackTarget);
         return Boolean(this.curAttackTarget) && this._petInfo.getMp() >= this._petInfo.findPetUsedMagic("txlj") && Boolean(this._petInfo.findHasStudySkill("txlj"));
      }
      
      override protected function beforeSkill3Start() : Boolean
      {
         var _loc1_:Number = AUtils.GetDisBetweenTwoObj(this,this.curAttackTarget);
         return Boolean(this.curAttackTarget) && this._petInfo.getMp() >= this._petInfo.findPetUsedMagic("sybh") && Boolean(this._petInfo.findHasStudySkill("sybh"));
      }
      
      override protected function beforeSkill4Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && this._petInfo.getMp() >= this._petInfo.findPetUsedMagic("xwaoyi") && Boolean(this._petInfo.findHasStudySkill("xwaoyi"));
      }
      
      override protected function releSkill1() : void
      {
         this.newAttackId();
         this.setYourFather(10);
         this.setAction("hit2");
         this.lastHit = "hit2";
         if(gc.sid == this.sourceRole.sid)
         {
            this.faceToTarget();
            gc.sendPetAttack(this.sourceRole.getRoleId(),"hit2Action",this.getBBDC().getDirect(),0,0,[]);
         }
         this._petInfo.setMp(Number(this._petInfo.getMp()) - Number(this._petInfo.findPetUsedMagic("sld")));
      }
      
      protected function releSkill1WithoutMana() : void
      {
         this.newAttackId();
         this.setYourFather(10);
         this.setAction("hit2");
         this.lastHit = "hit2";
         if(gc.sid == this.sourceRole.sid)
         {
            this.faceToTarget();
            gc.sendPetAttack(this.sourceRole.getRoleId(),"hit2Action",this.getBBDC().getDirect(),0,0,[]);
         }
      }
      
      override protected function releSkill2() : void
      {
         var _loc1_:uint = 0;
         var _loc2_:uint = 0;
         this.newAttackId();
         this.setYourFather(10);
         var _loc3_:Object = this._petInfo.getPetHarmObj("txlj");
         if(_loc3_)
         {
            _loc1_ = uint(_loc3_.second);
            _loc2_ = uint(_loc3_.first);
            if(this.sourceRole)
            {
               this.curAddEffect.add([{
                  "name":BaseAddEffect.PETTURTKE_BUFF,
                  "time":gc.frameClips * _loc1_,
                  "value":_loc2_
               }]);
               this.sourceRole.curAddEffect.add([{
                  "name":BaseAddEffect.PETTURTKE_BUFF,
                  "time":gc.frameClips * _loc1_,
                  "value":_loc2_
               }]);
            }
            this._petInfo.setMp(Number(this._petInfo.getMp()) - Number(this._petInfo.findPetUsedMagic("txlj")));
         }
      }
      
      protected function releSkill2WithoutMana() : void
      {
         var _loc1_:uint = 0;
         var _loc2_:uint = 0;
         this.newAttackId();
         this.setYourFather(10);
         var _loc3_:Object = this._petInfo.getPetHarmObj("txlj");
         if(_loc3_)
         {
            _loc1_ = uint(_loc3_.second);
            _loc2_ = uint(_loc3_.first);
            if(this.sourceRole)
            {
               this.curAddEffect.add([{
                  "name":BaseAddEffect.PETTURTKE_BUFF,
                  "time":gc.frameClips * _loc1_,
                  "value":_loc2_
               }]);
               this.sourceRole.curAddEffect.add([{
                  "name":BaseAddEffect.PETTURTKE_BUFF,
                  "time":gc.frameClips * _loc1_,
                  "value":_loc2_
               }]);
            }
         }
      }
      
      override protected function releSkill3() : void
      {
         this.newAttackId();
         this.setYourFather(10);
         this.setAction("hit3");
         this.lastHit = "hit3";
         if(gc.sid == this.sourceRole.sid)
         {
            this.faceToTarget();
            gc.sendPetAttack(this.sourceRole.getRoleId(),"hit3Action",this.getBBDC().getDirect(),0,0,[]);
         }
         this._petInfo.setMp(Number(this._petInfo.getMp()) - Number(this._petInfo.findPetUsedMagic("sybh")));
      }
      
      override protected function releSkill4() : void
      {
         this.newAttackId();
         this.isAoyi = true;
         if(this._petInfo.findHasStudySkill("sld"))
         {
            TweenMax.delayedCall(2,function(param1:PetTurtle4):*
            {
               if(param1._petInfo)
               {
                  if(Boolean(param1._petInfo.isFight) && !param1.isDead())
                  {
                     param1.releSkill1WithoutMana();
                  }
               }
            },[this]);
            TweenMax.delayedCall(4,function(param1:PetTurtle4):*
            {
               if(param1._petInfo)
               {
                  if(Boolean(param1._petInfo.isFight) && !param1.isDead())
                  {
                     param1.releSkill1WithoutMana();
                  }
               }
            },[this]);
            this.releSkill1WithoutMana();
         }
         if(this._petInfo.findHasStudySkill("txlj"))
         {
            this.releSkill2WithoutMana();
         }
         if(this._petInfo.findHasStudySkill("sybh"))
         {
            this.doHit3InAoyi(0,new Point(this.x,this.y - 20));
         }
         this.addAoyiBuff();
         TweenMax.delayedCall(5,function(param1:PetTurtle4):*
         {
            param1.isAoyi = false;
         },[this]);
      }
      
      private function doHit1(param1:uint, param2:Point) : void
      {
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("PetTurtle2Bullet1");
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
         var _loc3_:FollowBaseObjectBullet = null;
         var _loc4_:Object = null;
         var _loc5_:Object = null;
         _loc3_ = new FollowBaseObjectBullet("PetTurtle1Bullet2");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setHurtCanCutDownEffect(false);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit2");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
         var _loc6_:uint = uint(this.getRealPower("hit2",false).hurt);
         this.cureHp(_loc6_);
         if(this.curAddEffect)
         {
            _loc4_ = this.curAddEffect.getBuffByName(BaseAddEffect.PETTURTKE_BUFF);
            if(_loc4_)
            {
               if(Boolean(this.sourceRole) && Boolean(this.sourceRole.curAddEffect))
               {
                  _loc5_ = this.sourceRole.curAddEffect.getBuffByName(BaseAddEffect.PETTURTKE_BUFF);
                  if(_loc5_)
                  {
                     this.sourceRole.roleProperies.dispatchEvent(new CommonEvent("SetHHp",[this.sourceRole.roleProperies.getHHP() + _loc6_]));
                     this.sourceRole.addCureMc(_loc6_);
                  }
               }
            }
         }
      }
      
      private function doHit3(param1:uint, param2:Point) : void
      {
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("PetTurtle3Bullet3");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.scaleX = _loc3_.scaleY = 2;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit3");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit3InAoyi(param1:uint, param2:Point) : void
      {
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("PetTurtle3Bullet3");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.scaleX = _loc3_.scaleY = 2;
         _loc3_.setDestroyWhenLastFrame(false);
         _loc3_.setDestroyInCount(gc.frameClips * 5);
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit3");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      override public function setAttackBack(param1:Point) : void
      {
         if(!(this.isGXP || Boolean(this.isAoyi)))
         {
            super.setAttackBack(param1);
         }
      }
      
      override public function reduceHp(param1:int, param2:Boolean = false) : void
      {
         if(this.isAoyi)
         {
            param2 = false;
         }
         super.reduceHp(param1,param2);
      }
      
      override protected function move() : void
      {
         if(!this.isAoyi)
         {
            super.move();
         }
      }
      
      override protected function turnLeft() : *
      {
         if(!this.isAoyi)
         {
            super.turnLeft();
         }
      }
      
      override protected function turnRight() : *
      {
         if(!this.isAoyi)
         {
            super.turnRight();
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
            case "hit2Action":
               this.releSkill1();
               break;
            case "normalHit":
               this.normalHit();
         }
      }
      
      override protected function normalHit() : void
      {
         this.faceToTarget();
         this.newAttackId();
         this.setAction("hit1");
         this.lastHit = "hit1";
         if(gc.sid == this.sourceRole.sid)
         {
            gc.sendPetAttack(this.sourceRole.getRoleId(),"normalHit",this.getBBDC().getDirect(),0,0,[]);
         }
      }
      
      override public function getRealPower(param1:String, param2:Boolean = true) : Object
      {
         var _loc3_:Object = null;
         var _loc4_:uint = this.getCriteValue(param2) ? uint(2) : uint(1);
         var _loc5_:uint = uint(this.getMagicAddValue());
         var _loc6_:Number = this.isGXP ? Number(1.2) : Number(1);
         switch(param1)
         {
            case "hit1":
               return {
                  "hurt":(this._petInfo.getAtk() + _loc5_) * _loc4_ * _loc6_ * Number(this.hurtBaseEffectRate()),
                  "qixue":0
               };
            case "hit2":
               _loc3_ = this._petInfo.getPetHarmObj("sld");
               if(_loc3_)
               {
                  return {
                     "hurt":(_loc3_.first + _loc5_) * _loc4_ * _loc6_ * Number(this.hurtBaseEffectRate()),
                     "qixue":0
                  };
               }
               return {
                  "hurt":0,
                  "qixue":0
               };
               break;
            case "hit3":
               _loc3_ = this._petInfo.getPetHarmObj("sybh");
               if(_loc3_)
               {
                  return {
                     "hurt":(_loc3_.first + _loc5_) * _loc4_ * _loc6_ * Number(this.hurtBaseEffectRate()),
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
      
      override protected function isCannotMoveWhenAttackOnFloor() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2";
      }
   }
}

