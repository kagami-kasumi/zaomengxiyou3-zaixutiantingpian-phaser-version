package export.pet
{
   import base.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   import petInfo.PetInfo;
   
   public class PetMouse1 extends BasePet
   {
      
      public function PetMouse1(param1:BaseHero, param2:PetInfo)
      {
         super(param1,param2);
         this.horizenSpeed = 5;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":999,
            "power":12,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[7,0],
            "attackInterval":8,
            "power":12,
            "attackKind":"physics"
         };
         this.attackRange = 200;
         this.attackRate = 0.7;
         this.setAction("wait");
         this.skillCD1 = [gc.frameClips * 4,gc.frameClips * 10];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("PetMouseBmd1");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],200,200,new Point(0,0));
            bbdc.setOffsetXY(-20,-25);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8],[2,2,2,2,10],[2,2,10],[4,4,1,10]]);
            bbdc.setFrameCount([6,4,1,5,3,4]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("PetMouseBmd1--BitmapData Error!");
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
               return;
            case "walk":
               if(_loc2_.y != 1)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(1);
               }
               this.bbdc.setState(param1);
               return;
            case "hurt":
               if(_loc2_.y != 2)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(2);
               }
               this.bbdc.setState(param1);
               return;
            case "hit1":
               if(_loc2_.y != 4)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(param1);
               return;
            case "hit2":
               if(_loc2_.y != 5)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(5);
               }
               this.bbdc.setState(param1);
               return;
            case "dead":
               if(_loc2_.y != 3)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(3);
               }
               this.bbdc.setState(param1);
               return;
            default:
               return;
         }
      }
      
      override protected function scriptFrameOverFunc(param1:int) : void
      {
         var _loc2_:String = this.bbdc.getState();
         switch(_loc2_)
         {
            case "walk":
               this.bbdc.setFramePointX(0);
               return;
            case "wait":
               this.bbdc.setFramePointX(0);
               return;
            case "hit1":
               this.setAction("wait");
               return;
            case "hit2":
               this.setAction("wait");
               return;
            case "hurt":
               this.setStatic();
               this.setAction("wait");
               return;
            case "dead":
               this.destroy();
               return;
            default:
               return;
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
               if(param1.x == 2)
               {
                  if(this.bbdc.getCurFrameCount() == 10)
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
                  }
               }
               return;
            case "hit2":
               if(param1.x == 3)
               {
                  this.setStatic();
                  if(this.bbdc.getCurFrameCount() == 10)
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
                     this.doHit2(_loc3_,_loc4_);
                  }
               }
               else if(_loc3_ == 0)
               {
                  this.speed.x = -10;
               }
               else
               {
                  this.speed.x = 10;
               }
               return;
            default:
               return;
         }
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         return this.curAttackTarget != null && this._petInfo.getMp() >= this._petInfo.findPetUsedMagic("sc") && Boolean(this._petInfo.findHasStudySkill("sc"));
      }
      
      override public function reduceHp(param1:int, param2:Boolean = false) : void
      {
         super.reduceHp(param1,param2);
      }
      
      override protected function releSkill1() : void
      {
         this.faceToTarget();
         this.setYourFather(10);
         this.newAttackId();
         this.setAction("hit2");
         this.lastHit = "hit2";
         if(gc.sid == this.sourceRole.sid)
         {
            gc.sendPetAttack(this.sourceRole.getRoleId(),"hit2Action",this.getBBDC().getDirect(),0,0,[]);
         }
         this._petInfo.setMp(this._petInfo.getMp() - this._petInfo.findPetUsedMagic("sc"));
      }
      
      private function doHit1(param1:uint, param2:Point) : void
      {
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("PetMouse1Bullet1");
         if(param1 == 0)
         {
            _loc3_.x = this.x - 20;
         }
         else
         {
            _loc3_.x = this.x + 20;
         }
         _loc3_.y = this.y + 10;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit1");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit2(param1:uint, param2:Point) : void
      {
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("PetMouse1Bullet2");
         if(param1 == 0)
         {
            _loc3_.x = this.x - 40;
         }
         else
         {
            _loc3_.x = this.x + 40;
         }
         _loc3_.setDestroyWhenLastFrame(false);
         _loc3_.setDestroyInCount(gc.frameClips * 1);
         _loc3_.setFuncWhenHit(this.hit2Hit);
         _loc3_.y = this.y + 10;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit2");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function hit2Hit(param1:BaseBullet) : void
      {
         var _loc2_:Object = this._petInfo.getPetHarmObj("sc");
         var _loc3_:int = _loc2_.first + this.getMagicAddValue();
         this.cureHp(_loc3_ * 0.0125 + this._petInfo.getSHp() * 0.03 + this._petInfo.getLevel());
      }
      
      override public function setOtherAttack(param1:String, param2:uint, param3:Point, param4:Array = null, param5:uint = 0) : void
      {
         switch(param1)
         {
            case "hit1":
               this.doHit1(param2,param3);
               return;
            case "hit2":
               this.doHit2(param2,param3);
               return;
            case "hit2Action":
               this.releSkill1();
               return;
            case "normalHit":
               this.normalHit();
               return;
            default:
               return;
         }
      }
      
      override protected function normalHit() : void
      {
         this.newAttackId();
         this.faceToTarget();
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
               _loc3_ = this._petInfo.getPetHarmObj("sc");
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
      
      override protected function myIntelligence() : void
      {
         if(!this.isBeAttacking())
         {
            super.myIntelligence();
         }
      }
      
      override protected function isCannotMoveWhenAttackOnFloor() : Boolean
      {
         return this.curAction == "hit1";
      }
      
      override public function isCanMoveWhenAttack() : Boolean
      {
         return this.curAction == "hit2";
      }
   }
}

