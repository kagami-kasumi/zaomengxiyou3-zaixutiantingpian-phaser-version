package export.pet
{
   import base.*;
   import com.greensock.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   import petInfo.PetInfo;
   
   public class PetKabu3 extends BasePet
   {
      
      public function PetKabu3(param1:BaseHero, param2:PetInfo)
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
            "attackInterval":999,
            "power":12,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[8,0],
            "attackInterval":999,
            "power":12,
            "attackKind":"magic"
         };
         this.attackRange = 80;
         this.setAction("wait");
         this.skillCD1 = [gc.frameClips * 2,gc.frameClips * 2];
         this.skillCD2 = [gc.frameClips * 2,gc.frameClips * 4];
         this.skillCD3 = [gc.frameClips * 3,gc.frameClips * 5];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("PetKabuBmd3");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],200,200,new Point(0,0));
            bbdc.setOffsetXY(-8,2);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[8],[2,2,2,2,2],[2,2,2,10],[2,2,2,10],[5,10],[1,1,1,1],[2,10]]);
            bbdc.setFrameCount([6,1,5,4,4,2,16,2]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("PetKabuBmd3--BitmapData Error!");
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
               if(_loc2_.y != 0)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(0);
               }
               this.bbdc.setState(param1);
               break;
            case "hurt":
               if(_loc2_.y != 1)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(1);
               }
               this.bbdc.setState(param1);
               break;
            case "hit1":
               if(_loc2_.y != 3)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(3);
               }
               this.bbdc.setState(param1);
               break;
            case "hit2":
               if(_loc2_.y != 4)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(4);
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
            case "hit4_1":
               if(_loc2_.y != 6)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(6);
               }
               this.bbdc.setState(param1);
               break;
            case "hit4_2":
               if(_loc2_.y != 7)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(7);
               }
               this.bbdc.setState(param1);
               break;
            case "dead":
               if(_loc2_.y != 2)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(2);
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
            case "hit4_1":
               this.setAction("hit4_2");
               break;
            case "hit4_2":
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
         var _loc2_:* = null;
         var _loc3_:String = this.bbdc.getState();
         var _loc4_:uint = uint(this.getBBDC().getDirect());
         var _loc5_:Point = new Point();
         switch(_loc3_)
         {
            case "hit1":
               if(gc.isSingleGame() || gc.sid == this.sourceRole.sid)
               {
                  if(param1.x == 3)
                  {
                     if(this.bbdc.getCurFrameCount() == 10)
                     {
                        if(_loc4_ == 0)
                        {
                           _loc5_.x = this.x - 80;
                        }
                        else
                        {
                           _loc5_.x = this.x + 80;
                        }
                        _loc5_.y = this.y - 60;
                        this.doHit1(_loc4_,_loc5_);
                        gc.sendPetAttack(this.sourceRole.getRoleId(),"hit1",this.getBBDC().getDirect(),_loc5_.x,_loc5_.y,[]);
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
                        if(_loc4_ == 0)
                        {
                           _loc5_.x = this.x - 85;
                        }
                        else
                        {
                           _loc5_.x = this.x + 85;
                        }
                        _loc5_.y = this.y - 35;
                        this.doHit2(_loc4_,_loc5_);
                        gc.sendPetAttack(this.sourceRole.getRoleId(),"hit2",this.getBBDC().getDirect(),_loc5_.x,_loc5_.y,[]);
                     }
                  }
               }
               break;
            case "hit3":
               if(gc.isSingleGame() || gc.sid == this.sourceRole.sid)
               {
                  if(param1.x == 1)
                  {
                     if(this.bbdc.getCurFrameCount() == 10)
                     {
                        _loc2_ = gc.obbsiteArray[int(Math.random() * gc.obbsiteArray.length)];
                        if(_loc2_)
                        {
                           if(_loc2_.getBBDC().getDirect() == 0)
                           {
                              _loc5_.x = _loc2_.x + 40;
                           }
                           else
                           {
                              _loc5_.x = Number(_loc2_.x) - 40;
                           }
                        }
                        _loc5_.y = Number(_loc2_.y) - 40;
                        this.doHit3(_loc4_,_loc5_);
                        gc.sendPetAttack(this.sourceRole.getRoleId(),"hit3",this.getBBDC().getDirect(),_loc5_.x,_loc5_.y,[]);
                     }
                  }
               }
               break;
            case "hit4_1":
               break;
            case "hit4_2":
               this.speed.x = 0;
               this.speed.y = 0;
               if(gc.isSingleGame() || gc.sid == this.sourceRole.sid)
               {
                  if(param1.x == 1)
                  {
                     if(this.bbdc.getCurFrameCount() == 10)
                     {
                        if(_loc4_ == 0)
                        {
                           _loc5_.x = this.x + 0;
                        }
                        else
                        {
                           _loc5_.x = this.x - 0;
                        }
                        _loc5_.y = this.y + 30;
                        this.doHit4(_loc4_,_loc5_);
                        gc.sendPetAttack(this.sourceRole.getRoleId(),"hit4",this.getBBDC().getDirect(),_loc5_.x,_loc5_.y,[]);
                     }
                  }
               }
         }
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         return this._petInfo.getMp() >= this._petInfo.findPetUsedMagic("pms") && Boolean(this._petInfo.findHasStudySkill("pms"));
      }
      
      override protected function beforeSkill2Start() : Boolean
      {
         return this._petInfo.getMp() >= this._petInfo.findPetUsedMagic("ss") && Boolean(this._petInfo.findHasStudySkill("ss"));
      }
      
      override protected function beforeSkill3Start() : Boolean
      {
         return this._petInfo.getMp() >= this._petInfo.findPetUsedMagic("kmsk") && Boolean(this._petInfo.findHasStudySkill("kmsk"));
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
         this._petInfo.setMp(Number(this._petInfo.getMp()) - Number(this._petInfo.findPetUsedMagic("pms")));
      }
      
      override protected function releSkill2() : void
      {
         this.newAttackId();
         this.faceToTarget();
         this.setAction("hit3");
         this.lastHit = "hit3";
         if(gc.sid == this.sourceRole.sid)
         {
            gc.sendPetAttack(this.sourceRole.getRoleId(),"hit3Action",this.getBBDC().getDirect(),0,0,[]);
         }
         this._petInfo.setMp(Number(this._petInfo.getMp()) - Number(this._petInfo.findPetUsedMagic("pms")));
      }
      
      override protected function releSkill3() : void
      {
         this.newAttackId();
         this.faceToTarget();
         this.setAction("hit4_1");
         this.lastHit = "hit4_1";
         TweenMax.to(this,0.5,{"y":this.y - 100});
         if(gc.sid == this.sourceRole.sid)
         {
            gc.sendPetAttack(this.sourceRole.getRoleId(),"hit4Action",this.getBBDC().getDirect(),0,0,[]);
         }
         this._petInfo.setMp(Number(this._petInfo.getMp()) - Number(this._petInfo.findPetUsedMagic("kmsk")));
      }
      
      private function doHit1(param1:uint, param2:Point) : void
      {
         var _loc3_:* = null;
         _loc3_ = new SpecialEffectBullet("PetKabu1Bullet1");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit1");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
         _loc3_ = new SpecialEffectBullet("PetKabu1Bullet1");
         _loc3_.x = param2.x - 35;
         _loc3_.y = param2.y + 25;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit1");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
         _loc3_ = new SpecialEffectBullet("PetKabu1Bullet1");
         _loc3_.x = param2.x - 15;
         _loc3_.y = param2.y + 50;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit1");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit2(param1:uint, param2:Point) : void
      {
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("PetKabu1Bullet2");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit2");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit3(param1:uint, param2:Point) : void
      {
         this.x = param2.x;
         this.y = param2.y;
         this.faceToTarget();
         this.normalHit();
      }
      
      private function doHit4(param1:uint, param2:Point) : void
      {
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("PetKabu3Bullet4");
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
               _loc3_ = this._petInfo.getPetHarmObj("pms");
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
            case "hit4":
               _loc3_ = this._petInfo.getPetHarmObj("kmsk");
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
         if(!this.isBeAttacking())
         {
            super.myIntelligence();
         }
      }
      
      override protected function isCannotMoveWhenAttackOnFloor() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3";
      }
      
      override protected function isCannotMoveWhenAttack() : Boolean
      {
         return this.curAction == "hit4_1" || this.curAction == "hit4_2";
      }
   }
}

