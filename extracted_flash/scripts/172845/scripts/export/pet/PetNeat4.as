package export.pet
{
   import base.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   import petInfo.PetInfo;
   
   public class PetNeat4 extends BasePet
   {
      
      public var isAoyi:Boolean = false;
      
      private var aoyiStep:int = 0;
      
      public function PetNeat4(bh:BaseHero, pi:PetInfo)
      {
         super(bh,pi);
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
            "attackInterval":5,
            "power":12,
            "attackKind":"physics",
            "addEffect":[{
               "name":BaseAddEffect.STUN,
               "rate":0.3,
               "time":gc.frameClips * 2
            }]
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[10,0],
            "attackInterval":5,
            "power":12,
            "attackKind":"magic"
         };
         this.attackRange = 200;
         this.attackRate = 0.7;
         this.setAction("wait");
         this.skillCD1 = [gc.frameClips * 4,gc.frameClips * 10];
         this.skillCD2 = [gc.frameClips * 6,gc.frameClips * 12];
         this.skillCD3 = [gc.frameClips * 8,gc.frameClips * 13];
      }
      
      override protected function initBBDC() : void
      {
         var body:Object = null;
         var bmdArray:Array = BaseBitmapDataPool.getBitmapDataArrayByName("PetNeatBmd4");
         if(bmdArray)
         {
            body = {
               "name":"body",
               "source":bmdArray
            };
            bbdc = new BaseBitmapDataClip([body],200,200,new Point(0,0));
            bbdc.setOffsetXY(10,-20);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8],[2,2,2,2,10],[2,2,10],[30],[2,2,10]]);
            bbdc.setFrameCount([6,4,1,5,3,1,3]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("PetNeatBmd4--BitmapData Error!");
      }
      
      override protected function newColipse() : void
      {
         this.colipse = AUtils.getNewObj("ObjectBaseSprite4") as Sprite;
         this.colipse.visible = false;
         this.addChild(this.colipse);
      }
      
      override public function setAction(str:String) : void
      {
         super.setAction(str);
         var curPoint:Point = this.bbdc.getCurPoint();
         switch(str)
         {
            case "wait":
               if(curPoint.y != 0)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(0);
               }
               this.bbdc.setState(str);
               break;
            case "walk":
               if(curPoint.y != 1)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(1);
               }
               this.bbdc.setState(str);
               break;
            case "hurt":
               if(curPoint.y != 2)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(2);
               }
               this.bbdc.setState(str);
               break;
            case "hit1":
               if(curPoint.y != 4)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(str);
               break;
            case "hit2":
               if(curPoint.y != 5)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(5);
               }
               this.bbdc.setState(str);
               break;
            case "hit3":
               if(curPoint.y != 6)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(6);
               }
               this.bbdc.setState(str);
               break;
            case "dead":
               if(curPoint.y != 3)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(3);
               }
               this.bbdc.setState(str);
         }
      }
      
      override protected function scriptFrameOverFunc(row:int) : void
      {
         var state:String = this.bbdc.getState();
         switch(state)
         {
            case "walk":
               this.bbdc.setFramePointX(0);
               break;
            case "wait":
               this.bbdc.setFramePointX(0);
               break;
            case "hit1":
               if(this.isAoyi)
               {
                  if(this.aoyiStep == 1)
                  {
                     if(this._petInfo.findHasStudySkill("mncz"))
                     {
                        this.releSkill1WithoutMana();
                     }
                     else
                     {
                        this.setAction("hit1");
                     }
                     ++this.aoyiStep;
                  }
                  else if(this.aoyiStep == 0 || this.aoyiStep == 2)
                  {
                     if(this._petInfo.findHasStudySkill("mljt"))
                     {
                        this.releSkill2WithoutMana();
                     }
                     else
                     {
                        this.setAction("hit1");
                     }
                     ++this.aoyiStep;
                  }
                  else
                  {
                     this.aoyiOver();
                     this.setAction("wait");
                  }
               }
               else
               {
                  this.setAction("wait");
               }
               break;
            case "hit2":
               if(this.isAoyi && (this.aoyiStep == 0 || this.aoyiStep == 2))
               {
                  ++this.aoyiStep;
                  if(this._petInfo.findHasStudySkill("mljt"))
                  {
                     this.releSkill2WithoutMana();
                  }
                  else
                  {
                     this.setAction("hit1");
                  }
               }
               else
               {
                  this.setAction("wait");
               }
               break;
            case "hit3":
               if(this.isAoyi && this.aoyiStep == 1)
               {
                  ++this.aoyiStep;
                  if(this._petInfo.findHasStudySkill("mncz"))
                  {
                     this.releSkill1WithoutMana();
                  }
                  else
                  {
                     this.setAction("hit1");
                  }
               }
               else
               {
                  if(this.aoyiStep == 3)
                  {
                     this.aoyiOver();
                  }
                  this.setAction("wait");
               }
               break;
            case "hurt":
               this.aoyiOver();
               this.setStatic();
               this.setAction("wait");
               break;
            case "dead":
               this.aoyiOver();
               this.destroy();
         }
      }
      
      override protected function enterFrameFunc(p:Point) : void
      {
         var state:String = this.bbdc.getState();
         var direct:uint = uint(this.getBBDC().getDirect());
         var point:Point = new Point();
         switch(state)
         {
            case "hit1":
               if(p.x == 2)
               {
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     if(direct == 0)
                     {
                        point.x = this.x - 30;
                     }
                     else
                     {
                        point.x = this.x + 30;
                     }
                     point.y = this.y;
                     this.doHit1(direct,point);
                  }
               }
               break;
            case "hit2":
               if(p.x == 0)
               {
                  if(this.bbdc.getCurFrameCount() == 30)
                  {
                     if(direct == 0)
                     {
                        point.x = this.x - 30;
                     }
                     else
                     {
                        point.x = this.x + 30;
                     }
                     point.y = this.y;
                     this.doHit2(direct,point);
                  }
               }
               if(direct == 0)
               {
                  if(this.isAoyi)
                  {
                     this.speed.x = -15;
                  }
                  else
                  {
                     this.speed.x = -10;
                  }
               }
               else if(this.isAoyi)
               {
                  this.speed.x = 15;
               }
               else
               {
                  this.speed.x = 10;
               }
               break;
            case "hit3":
               if(p.x == 2)
               {
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     this.doHit3(direct);
                  }
               }
         }
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         return this.curAttackTarget != null && this._petInfo.getMp() >= this._petInfo.findPetUsedMagic("mncz") && Boolean(this._petInfo.findHasStudySkill("mncz"));
      }
      
      override protected function beforeSkill2Start() : Boolean
      {
         return this.curAttackTarget != null && this._petInfo.getMp() >= this._petInfo.findPetUsedMagic("mljt") && Boolean(this._petInfo.findHasStudySkill("mljt"));
      }
      
      override protected function beforeSkill3Start() : Boolean
      {
         return this.curAttackTarget != null && this._petInfo.getMp() >= this._petInfo.findPetUsedMagic("cnaoyi") && Boolean(this._petInfo.findHasStudySkill("cnaoyi"));
      }
      
      override public function reduceHp(re:int, canHurt:Boolean = false) : void
      {
         super.reduceHp(re,canHurt);
      }
      
      override protected function releSkill1() : void
      {
         this.faceToTarget();
         this.setYourFather(30);
         this.newAttackId();
         this.setAction("hit2");
         this.lastHit = "hit2";
         if(gc.sid == this.sourceRole.sid)
         {
            gc.sendPetAttack(this.sourceRole.getRoleId(),"hit2Action",this.getBBDC().getDirect(),0,0,[]);
         }
         this._petInfo.setMp(this._petInfo.getMp() - this._petInfo.findPetUsedMagic("mncz"));
      }
      
      override protected function releSkill2() : void
      {
         this.faceToTarget();
         this.setYourFather(20);
         this.newAttackId();
         this.setAction("hit3");
         this.lastHit = "hit3";
         if(gc.sid == this.sourceRole.sid)
         {
            gc.sendPetAttack(this.sourceRole.getRoleId(),"hit3Action",this.getBBDC().getDirect(),0,0,[]);
         }
         this._petInfo.setMp(this._petInfo.getMp() - this._petInfo.findPetUsedMagic("mljt"));
      }
      
      override protected function releSkill3() : void
      {
         this.isAoyi = true;
         this.aoyiStep = 0;
         this.addAoyiBuff();
         this.setYourFather(9999);
         if(this._petInfo.findHasStudySkill("mncz"))
         {
            this.releSkill1WithoutMana();
         }
         else
         {
            this.setAction("hit1");
         }
      }
      
      protected function releSkill1WithoutMana() : void
      {
         this.faceToTarget();
         this.newAttackId();
         this.setAction("hit2");
         this.lastHit = "hit2";
         if(gc.sid == this.sourceRole.sid)
         {
            gc.sendPetAttack(this.sourceRole.getRoleId(),"hit2Action",this.getBBDC().getDirect(),0,0,[]);
         }
      }
      
      protected function releSkill2WithoutMana() : void
      {
         this.faceToTarget();
         this.newAttackId();
         this.setAction("hit3");
         this.lastHit = "hit3";
      }
      
      private function aoyiOver() : void
      {
         this.aoyiStep = 0;
         this.isAoyi = false;
         this.setYourFather(10);
      }
      
      private function doHit1(direct:uint, point:Point) : void
      {
         var b:SpecialEffectBullet = new SpecialEffectBullet("PetNeat1Bullet1");
         if(direct == 0)
         {
            b.x = this.x - 60;
         }
         else
         {
            b.x = this.x + 60;
         }
         b.y = this.y - 30;
         b.setRole(this);
         b.setDirect(direct);
         b.setAction("hit1");
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
      }
      
      private function doHit2(direct:uint, point:Point) : void
      {
         var b:FollowBaseObjectBullet = new FollowBaseObjectBullet("PetNeat1Bullet2");
         b.x = this.x;
         b.y = this.y;
         b.setHurtCanCutDownEffect(true);
         b.setDestroyWhenLastFrame(false);
         b.setDestroyInCount(30);
         b.setRole(this);
         b.setDirect(direct);
         b.setAction("hit2");
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
      }
      
      private function doHit3(direct:uint) : void
      {
         var b:SpecialEffectBullet = new SpecialEffectBullet("PetNeat4Bullet3");
         b.x = this.x - 100;
         b.y = this.y + 50;
         b.setRole(this);
         b.setDirect(direct);
         b.setAction("hit3");
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
         b = new SpecialEffectBullet("PetNeat4Bullet3");
         b.x = this.x + 100;
         b.y = this.y + 50;
         b.setRole(this);
         b.setDirect(direct);
         b.setAction("hit3");
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
         b = new SpecialEffectBullet("PetNeat4Bullet3");
         b.x = this.x + 220;
         b.y = this.y + 50;
         b.setRole(this);
         b.setDirect(direct);
         b.setAction("hit3");
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
         b = new SpecialEffectBullet("PetNeat4Bullet3");
         b.x = this.x - 220;
         b.y = this.y + 50;
         b.setRole(this);
         b.setDirect(direct);
         b.setAction("hit3");
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
      }
      
      override public function setOtherAttack(attackKind:String, direct:uint, point:Point, params:Array = null, initTimer:uint = 0) : void
      {
         switch(attackKind)
         {
            case "hit1":
               this.doHit1(direct,point);
               break;
            case "hit2":
               this.doHit2(direct,point);
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
         this.faceToTarget();
         this.setAction("hit1");
         this.lastHit = "hit1";
         if(gc.sid == this.sourceRole.sid)
         {
            this.faceToTarget();
            gc.sendPetAttack(this.sourceRole.getRoleId(),"normalHit",this.getBBDC().getDirect(),0,0,[]);
         }
      }
      
      override public function getRealPower(cur:String, crit:Boolean = true) : Object
      {
         var obj:Object = null;
         obj = null;
         var critValue:uint = uint(this.getCriteValue(crit) ? 2 : 1);
         var hurtAdd:uint = uint(this.getMagicAddValue());
         var wsAdd:Number = this.isGXP ? 1.2 : 1;
         switch(cur)
         {
            case "hit1":
               return (this._petInfo.getAtk() + hurtAdd) * critValue * wsAdd * this.hurtBaseEffectRate();
            case "hit2":
               obj = this._petInfo.getPetHarmObj("mncz");
               if(obj)
               {
                  return (obj.first + hurtAdd) * critValue * wsAdd * this.hurtBaseEffectRate();
               }
               return 0;
               break;
            case "hit3":
               obj = this._petInfo.getPetHarmObj("mljt");
               if(obj)
               {
                  return (obj.first + hurtAdd) * critValue * wsAdd * this.hurtBaseEffectRate();
               }
               return 0;
               break;
            default:
               return 0;
         }
      }
      
      override protected function exitFrameFunc(p:Point) : void
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
         return this.curAction == "hit1" || this.curAction == "hit3";
      }
      
      override public function isCanMoveWhenAttack() : Boolean
      {
         return this.curAction == "hit2";
      }
   }
}

