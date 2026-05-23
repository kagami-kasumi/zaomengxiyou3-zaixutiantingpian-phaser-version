package export.pet
{
   import base.*;
   import com.greensock.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   import petInfo.PetInfo;
   
   public class PetPhoenix3 extends BasePet
   {
      
      public function PetPhoenix3(param1:BaseHero, param2:PetInfo)
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
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[10,-5],
            "attackInterval":5,
            "power":12,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[10,-5],
            "attackInterval":999,
            "power":12,
            "attackKind":"magic"
         };
         this.attackRange = 200;
         this.setAction("wait");
         this.skillCD1 = [gc.frameClips * 2,gc.frameClips * 3];
         this.skillCD2 = [gc.frameClips * 3,gc.frameClips * 5];
         this.skillCD3 = [gc.frameClips * 4,gc.frameClips * 8];
         this.skillCD4 = [gc.frameClips * 15,gc.frameClips * 24];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("PetPhoenixBmd3");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],200,200,new Point(0,0));
            bbdc.setOffsetXY(8,-10);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8,120],[2,2,2,2,10],[2,2,2,10],[2,2,2,24],[2,2,10]]);
            bbdc.setFrameCount([6,4,[1,1],5,4,3,3]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("PetPhoenixBmd3--BitmapData Error!");
      }
      
      override protected function newColipse() : void
      {
         this.colipse = AUtils.getNewObj("ObjectBaseSprite4") as Sprite;
         this.colipse.visible = false;
         this.addChild(this.colipse);
      }
      
      override public function setAction(param1:String) : void
      {
         if(this.curAction == "hit2")
         {
            if(param1 == "hurt")
            {
               return;
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
               if(_loc2_.x != 0 && _loc2_.y != 2)
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
               if(_loc2_.x != 1 && _loc2_.y != 2)
               {
                  this.bbdc.setFramePointX(1);
                  this.bbdc.setFramePointY(2);
               }
               this.bbdc.setState(param1);
               break;
            case "hit3":
               if(_loc2_.y != 5)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(5);
               }
               this.bbdc.setState(param1);
               break;
            case "hit4":
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
               this.doHit2_2(this.getBBDC().getDirect(),new Point(this.x,this.y));
               this._petInfo.setHp(this._petInfo.getSHp());
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
                           _loc4_.x = this.x - 75;
                        }
                        else
                        {
                           _loc4_.x = this.x + 75;
                        }
                        _loc4_.y = this.y - 30;
                        this.doHit1(_loc3_,_loc4_);
                        gc.sendPetAttack(this.sourceRole.getRoleId(),"hit1",this.getBBDC().getDirect(),_loc4_.x,_loc4_.y,[]);
                     }
                  }
               }
               break;
            case "hit2":
               if(gc.isSingleGame() || gc.sid == this.sourceRole.sid)
               {
                  if(param1.x == 1)
                  {
                     if(this.bbdc.getCurFrameCount() == 120)
                     {
                        if(_loc3_ == 0)
                        {
                           _loc4_.x = this.x;
                        }
                        else
                        {
                           _loc4_.x = this.x;
                        }
                        _loc4_.y = this.y - 60;
                        this.doHit2_1(_loc3_,_loc4_);
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
                     if(this.bbdc.getCurFrameCount() == 2)
                     {
                        if(_loc3_ == 0)
                        {
                           _loc4_.x = this.x - 130;
                        }
                        else
                        {
                           _loc4_.x = this.x + 130;
                        }
                        _loc4_.y = this.y - 95;
                        this.doHit3(_loc3_,_loc4_);
                        gc.sendPetAttack(this.sourceRole.getRoleId(),"hit3",this.getBBDC().getDirect(),_loc4_.x,_loc4_.y,[]);
                     }
                  }
               }
               break;
            case "hit4":
               if(gc.isSingleGame() || gc.sid == this.sourceRole.sid)
               {
                  if(param1.x == 2)
                  {
                     if(this.bbdc.getCurFrameCount() == 10)
                     {
                        _loc4_.y = this.y - 95;
                        this.doHit4(_loc3_,_loc4_);
                        gc.sendPetAttack(this.sourceRole.getRoleId(),"hit4",this.getBBDC().getDirect(),_loc4_.x,_loc4_.y,[]);
                     }
                  }
               }
         }
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         if(this._petInfo.findHasStudySkill("np"))
         {
            if(this._petInfo.getMp() >= this._petInfo.findPetUsedMagic("np"))
            {
               if(this.curAction != "hit2")
               {
                  if(this._petInfo.getHp() / this._petInfo.getSHp() <= 0.2)
                  {
                     return true;
                  }
               }
            }
         }
         return false;
      }
      
      override protected function beforeSkill2Start() : Boolean
      {
         if(this._petInfo.findHasStudySkill("bshn"))
         {
            if(this._petInfo.getMp() >= this._petInfo.findPetUsedMagic("bshn"))
            {
               if(this.curAttackTarget)
               {
                  if(AUtils.GetDisBetweenTwoObj(this,this.curAttackTarget) <= 400)
                  {
                     return true;
                  }
               }
            }
         }
         return false;
      }
      
      override protected function beforeSkill3Start() : Boolean
      {
         if(this._petInfo.findHasStudySkill("dhly"))
         {
            if(this._petInfo.getMp() >= this._petInfo.findPetUsedMagic("dhly"))
            {
               if(this.curAttackTarget)
               {
                  if(AUtils.GetDisBetweenTwoObj(this,this.curAttackTarget) <= 500)
                  {
                     return true;
                  }
               }
            }
         }
         return false;
      }
      
      override protected function releSkill1() : void
      {
         this.faceToTarget();
         this.newAttackId();
         this.setAction("hit2");
         this.lastHit = "hit2";
         if(gc.sid == this.sourceRole.sid)
         {
            gc.sendPetAttack(this.sourceRole.getRoleId(),"hit2Action",this.getBBDC().getDirect(),0,0,[]);
         }
         this._petInfo.setMp(this._petInfo.getMp() - this._petInfo.findPetUsedMagic("np"));
      }
      
      override protected function releSkill2() : void
      {
         this.faceToTarget();
         this.newAttackId();
         this.setYourFather(30);
         this.setAction("hit3");
         this.lastHit = "hit3";
         if(gc.sid == this.sourceRole.sid)
         {
            gc.sendPetAttack(this.sourceRole.getRoleId(),"hit3Action",this.getBBDC().getDirect(),0,0,[]);
         }
         this._petInfo.setMp(this._petInfo.getMp() - this._petInfo.findPetUsedMagic("bshn"));
      }
      
      override protected function releSkill3() : void
      {
         this.faceToTarget();
         this.newAttackId();
         this.setYourFather(10);
         this.setAction("hit4");
         this.lastHit = "hit4";
         if(gc.sid == this.sourceRole.sid)
         {
            gc.sendPetAttack(this.sourceRole.getRoleId(),"hit4Action",this.getBBDC().getDirect(),0,0,[]);
         }
         this._petInfo.setMp(this._petInfo.getMp() - this._petInfo.findPetUsedMagic("dhly"));
      }
      
      private function doHit1(param1:uint, param2:Point) : void
      {
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("PetPhoenix1Bullet1");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit1");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit2_1(param1:uint, param2:Point) : void
      {
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("PetPhoenix1Bullet2_1");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDisable();
         _loc3_.setDestroyWhenLastFrame(false);
         _loc3_.setDestroyInCount(gc.frameClips * 5);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit2");
         this.curAction = "hit2";
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit2_2(param1:uint, param2:Point) : void
      {
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("PetPhoenix1Bullet2_2");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDisable();
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit2");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit3(param1:uint, param2:Point) : void
      {
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("PetPhoenix2Bullet3");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit3");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit4(param1:uint, param2:Point) : void
      {
         this.doSingleHit4(3,param1);
      }
      
      private function doSingleHit4(param1:uint, param2:uint) : void
      {
         var idx:uint = param1;
         var direct:uint = param2;
         var b:SpecialEffectBullet = new SpecialEffectBullet("PetPhoenix3Bullet4");
         b.x = this.x - 110 - (3 - idx) * 110;
         b.y = this.y + 30;
         b.setRole(this);
         b.setDirect(direct);
         b.setAction("hit4");
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
         b = new SpecialEffectBullet("PetPhoenix3Bullet4");
         b.x = this.x + 110 + (3 - idx) * 110;
         b.y = this.y + 30;
         b.setRole(this);
         b.setDirect(direct);
         b.setAction("hit4");
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
         if(idx > 0)
         {
            TweenMax.delayedCall(0.3,function(param1:uint, param2:uint, param3:PetPhoenix3):*
            {
               param1--;
               param3.doSingleHit4(param1,param2);
            },[idx,direct,this]);
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
               this.doHit2_1(param2,param3);
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
         var _loc3_:* = null;
         _loc3_ = null;
         var _loc4_:uint = uint(this.getCriteValue(param2) ? 2 : 1);
         var _loc5_:uint = uint(this.getMagicAddValue());
         var _loc6_:Number = this.isGXP ? 1.2 : 1;
         switch(param1)
         {
            case "hit1":
               return {
                  "hurt":(this._petInfo.getAtk() + _loc5_) * _loc4_ * _loc6_ * this.hurtBaseEffectRate(),
                  "qixue":0
               };
            case "hit2":
               return {
                  "hurt":0,
                  "qixue":0
               };
            case "hit3":
               _loc3_ = this._petInfo.getPetHarmObj("bshn");
               if(_loc3_)
               {
                  return {
                     "hurt":(_loc3_.first + _loc5_) * _loc4_ * _loc6_ * this.hurtBaseEffectRate(),
                     "qixue":0
                  };
               }
               return {
                  "hurt":0,
                  "qixue":0
               };
               break;
            case "hit4":
               _loc3_ = this._petInfo.getPetHarmObj("dhly");
               if(_loc3_)
               {
                  return {
                     "hurt":(_loc3_.first + _loc5_) * _loc4_ * _loc6_ * this.hurtBaseEffectRate(),
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
      
      override public function setAttackBack(param1:Point) : void
      {
         if(this.curAction == "hit2")
         {
            return;
         }
         super.setAttackBack(param1);
      }
      
      override public function reduceHp(param1:int, param2:Boolean = false) : void
      {
         if(this.curAction == "hit2")
         {
            param1 /= 3;
            param2 = false;
         }
         super.reduceHp(param1,param2);
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

