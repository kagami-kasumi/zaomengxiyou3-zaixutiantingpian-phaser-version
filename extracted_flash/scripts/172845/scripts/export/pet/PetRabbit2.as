package export.pet
{
   import base.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   import petInfo.PetInfo;
   
   public class PetRabbit2 extends BasePet
   {
      
      public function PetRabbit2(param1:BaseHero, param2:PetInfo)
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
            "attackBackSpeed":[10,0],
            "attackInterval":7,
            "power":12,
            "attackKind":"magic"
         };
         this.attackRange = 250;
         this.setAction("wait");
         this.skillCD1 = [gc.frameClips * 2,gc.frameClips * 6.6];
         this.skillCD2 = [gc.frameClips * 4,gc.frameClips * 8.1];
         this.skillCD3 = [gc.frameClips * 10,gc.frameClips * 12];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:Object = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("PetPetRabbitBmd2");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],150,150,new Point(0,0));
            bbdc.setOffsetXY(1,-10);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8],[2,2,2,2,10],[2,2,2,2,10],[2,10],[10]]);
            bbdc.setFrameCount([6,4,1,5,5,2,1]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("PetPetRabbitBmd2--BitmapData Error!");
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
                  if(param1.x == 4)
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
                        gc.sendPetAttack(this.sourceRole.getRoleId(),"hit1",this.getBBDC().getDirect(),_loc4_.x,_loc4_.y,[]);
                     }
                  }
               }
         }
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         if(this._petInfo.findHasStudySkill("jf"))
         {
            if(this._petInfo.getMp() >= this._petInfo.findPetUsedMagic("jf"))
            {
               return true;
            }
         }
         return false;
      }
      
      override public function reduceHp(param1:int, param2:Boolean = false) : void
      {
         super.reduceHp(param1,param2);
      }
      
      override protected function releSkill1() : void
      {
         this.newAttackId();
         this.addCurAddEffect([{
            "name":BaseAddEffect.PET_RABBIT_JIFENG,
            "time":gc.frameClips * 5
         }]);
         if(gc.sid == this.sourceRole.sid)
         {
            this.faceToTarget();
            gc.sendPetAttack(this.sourceRole.getRoleId(),"hit3Action",this.getBBDC().getDirect(),0,0,[]);
         }
         this._petInfo.setMp(Number(this._petInfo.getMp()) - Number(this._petInfo.findPetUsedMagic("jf")));
      }
      
      private function doHit1(param1:uint, param2:Point) : void
      {
         var _loc3_:EnemyMoveBullet = new EnemyMoveBullet("PetPetRabbitBullet1");
         if(param1 == 0)
         {
            _loc3_.setSpeed(-15,0);
         }
         else
         {
            _loc3_.setSpeed(15,0);
         }
         _loc3_.setDistance(600);
         _loc3_.setDestroyWhenLastFrame(false);
         _loc3_.setDestroyInCount(gc.frameClips * 4);
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit1");
         _loc3_.setFuncWhenHit(this.hit1Over);
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function hit1Over(param1:BaseBullet) : void
      {
         this.checkSkillYG(param1);
      }
      
      private function checkSkillYG(param1:BaseBullet) : void
      {
         var _loc2_:SpecialEffectBullet = null;
         if(this._petInfo.findHasStudySkill("yg"))
         {
            if(Math.random() < 0.2)
            {
               _loc2_ = new SpecialEffectBullet("Monster130Bullet2");
               _loc2_.x = param1.x;
               _loc2_.y = param1.y - 80;
               _loc2_.setRole(this);
               _loc2_.setDirect(0);
               _loc2_.setAction("hit2");
               gc.gameSence.addChild(_loc2_);
               this.magicBulletArray.push(_loc2_);
            }
         }
      }
      
      override public function setOtherAttack(param1:String, param2:uint, param3:Point, param4:Array = null, param5:uint = 0) : void
      {
         switch(param1)
         {
            case "hit1":
               this.doHit1(param2,param3);
               break;
            case "hit3Action":
               this.releSkill1();
               break;
            case "normalHit":
               this.normalHit();
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
               _loc3_ = this._petInfo.getPetHarmObj("yg");
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

