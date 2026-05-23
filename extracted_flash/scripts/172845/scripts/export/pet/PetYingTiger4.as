package export.pet
{
   import base.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   import petInfo.PetInfo;
   
   public class PetYingTiger4 extends BasePet
   {
      
      private var isAoyi:Boolean = false;
      
      private var aoyiStep:int = 0;
      
      public function PetYingTiger4(bh:BaseHero, pi:PetInfo)
      {
         super(bh,pi);
         this.horizenSpeed = 5;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":5,
            "power":12,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":15,
            "power":12,
            "attackKind":"physics",
            "addEffect":[{
               "name":BaseAddEffect.STUN,
               "time":gc.frameClips * 4,
               "rate":0.5
            }]
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":10,
            "power":12,
            "attackKind":"magic"
         };
         this.attackRange = 200;
         this.setAction("wait");
         this.skillCD1 = [gc.frameClips * 6,gc.frameClips * 8];
         this.skillCD2 = [gc.frameClips * 6,gc.frameClips * 10];
         this.skillCD3 = [gc.frameClips * 30,gc.frameClips * 60];
      }
      
      override protected function initBBDC() : void
      {
         var body:Object = null;
         var bmdArray:Array = BaseBitmapDataPool.getBitmapDataArrayByName("PetYinTaigerBmd2");
         if(bmdArray)
         {
            body = {
               "name":"body",
               "source":bmdArray
            };
            bbdc = new BaseBitmapDataClip([body],200,200,new Point(0,0));
            bbdc.setOffsetXY(1,-23);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8],[2,2,2,2,2,10],[3,3,3,3,10],[3,3,10],[3,3,3,20]]);
            bbdc.setFrameCount([6,4,1,6,5,3,4]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("PetYinTaigerBmd2--BitmapData Error!");
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
                     this.aoyiStep = 2;
                     if(this._petInfo.findHasStudySkill("mhxs"))
                     {
                        this.releSkill2WithoutMana();
                     }
                     else
                     {
                        this.normalHit();
                     }
                  }
                  else if(this.aoyiStep == 2)
                  {
                     this.aoyiStep = 3;
                     if(this._petInfo.findHasStudySkill("hx"))
                     {
                        this.releSkill1WithoutMana();
                     }
                     else
                     {
                        this.normalHit();
                     }
                  }
                  else if(this.aoyiStep == 3)
                  {
                     this.aoyiOver();
                     this.setAction("wait");
                  }
                  else
                  {
                     this.setAction("wait");
                  }
               }
               else
               {
                  this.setAction("wait");
               }
               break;
            case "hit2":
               if(this.isAoyi)
               {
                  if(this.aoyiStep == 1)
                  {
                     this.aoyiStep = 2;
                     if(this._petInfo.findHasStudySkill("mhxs"))
                     {
                        this.releSkill2WithoutMana();
                     }
                     else
                     {
                        this.normalHit();
                     }
                  }
                  else if(this.aoyiStep == 3)
                  {
                     this.aoyiOver();
                     this.setAction("wait");
                  }
                  else
                  {
                     this.setAction("wait");
                  }
               }
               else
               {
                  this.setAction("wait");
               }
               break;
            case "hit3":
               if(this.isAoyi)
               {
                  if(this.aoyiStep == 2)
                  {
                     this.aoyiStep = 3;
                     if(this._petInfo.findHasStudySkill("hx"))
                     {
                        this.releSkill1WithoutMana();
                     }
                     else
                     {
                        this.normalHit();
                     }
                  }
                  else
                  {
                     this.setAction("wait");
                  }
               }
               else
               {
                  this.setAction("wait");
               }
               break;
            case "hurt":
               this.setStatic();
               this.setAction("wait");
               break;
            case "dead":
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
               if(gc.isSingleGame() || gc.sid == this.sourceRole.sid)
               {
                  if(p.x == 2)
                  {
                     if(this.bbdc.getCurFrameCount() == 3)
                     {
                        if(direct == 0)
                        {
                           point.x = this.x - 180;
                        }
                        else
                        {
                           point.x = this.x + 180;
                        }
                        point.y = this.y - 50;
                        this.doHit1(direct,point);
                     }
                  }
               }
               break;
            case "hit2":
               if(gc.isSingleGame() || gc.sid == this.sourceRole.sid)
               {
                  if(p.x == 2)
                  {
                     if(this.bbdc.getCurFrameCount() == 10)
                     {
                        if(direct == 0)
                        {
                           point.x = this.x - 60;
                        }
                        else
                        {
                           point.x = this.x + 60;
                        }
                        point.y = this.y - 25;
                        this.doHit2(direct,point);
                     }
                  }
               }
               break;
            case "hit3":
               if(gc.isSingleGame() || gc.sid == this.sourceRole.sid)
               {
                  if(p.x == 3)
                  {
                     if(this.bbdc.getCurFrameCount() == 20)
                     {
                        if(direct == 0)
                        {
                           point.x = this.x - 400;
                        }
                        else
                        {
                           point.x = this.x + 400;
                        }
                        point.y = this.y - 100;
                        this.doHit3(direct,point);
                     }
                  }
                  if(p.x == 3)
                  {
                     if(this.bbdc.getCurFrameCount() > 1)
                     {
                        if(direct == 0)
                        {
                           this.speed.x = -10;
                        }
                        else
                        {
                           this.speed.x = 10;
                        }
                     }
                     else
                     {
                        this.setStatic();
                     }
                  }
               }
         }
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         if(!this.curAttackTarget)
         {
            return false;
         }
         var dis:Number = AUtils.GetDisBetweenTwoObj(this,this.curAttackTarget);
         if(dis > 200)
         {
            return false;
         }
         return this._petInfo.getMp() >= this._petInfo.findPetUsedMagic("hx") && Boolean(this._petInfo.findHasStudySkill("hx"));
      }
      
      override protected function beforeSkill2Start() : Boolean
      {
         if(!this.curAttackTarget)
         {
            return false;
         }
         var dis:Number = AUtils.GetDisBetweenTwoObj(this,this.curAttackTarget);
         if(dis > 300)
         {
            return false;
         }
         return this._petInfo.getMp() >= this._petInfo.findPetUsedMagic("mhxs") && Boolean(this._petInfo.findHasStudySkill("mhxs"));
      }
      
      override protected function beforeSkill3Start() : Boolean
      {
         if(!this.curAttackTarget)
         {
            return false;
         }
         var dis:Number = AUtils.GetDisBetweenTwoObj(this,this.curAttackTarget);
         if(dis > 300)
         {
            return false;
         }
         return this._petInfo.findHasStudySkill("yhaoyi");
      }
      
      override protected function releSkill1() : void
      {
         this.newAttackId();
         this.setYourFather(gc.frameClips * 1.5);
         this.setAction("hit2");
         this.lastHit = "hit2";
         this.faceToTarget();
         if(gc.sid == this.sourceRole.sid)
         {
            gc.sendPetAttack(this.sourceRole.getRoleId(),"hit2Action",this.getBBDC().getDirect(),0,0,[]);
         }
         this._petInfo.setMp(this._petInfo.getMp() - this._petInfo.findPetUsedMagic("hx"));
      }
      
      protected function releSkill1WithoutMana() : void
      {
         this.newAttackId();
         this.setYourFather(gc.frameClips * 1.5);
         this.setAction("hit2");
         this.lastHit = "hit2";
         this.faceToTarget();
         if(gc.sid == this.sourceRole.sid)
         {
            gc.sendPetAttack(this.sourceRole.getRoleId(),"hit2Action",this.getBBDC().getDirect(),0,0,[]);
         }
      }
      
      override protected function releSkill2() : void
      {
         this.newAttackId();
         this.setYourFather(gc.frameClips * 1.5);
         this.setAction("hit3");
         this.lastHit = "hit3";
         this.faceToTarget();
         if(gc.sid == this.sourceRole.sid)
         {
            gc.sendPetAttack(this.sourceRole.getRoleId(),"hit3Action",this.getBBDC().getDirect(),0,0,[]);
         }
         this._petInfo.setMp(this._petInfo.getMp() - this._petInfo.findPetUsedMagic("mhxs"));
      }
      
      protected function releSkill2WithoutMana() : void
      {
         this.newAttackId();
         this.setYourFather(gc.frameClips * 1.5);
         this.setAction("hit3");
         this.lastHit = "hit3";
         this.faceToTarget();
         if(gc.sid == this.sourceRole.sid)
         {
            gc.sendPetAttack(this.sourceRole.getRoleId(),"hit3Action",this.getBBDC().getDirect(),0,0,[]);
         }
      }
      
      override protected function releSkill3() : void
      {
         this.isAoyi = true;
         this.aoyiStep = 1;
         this.addAoyiBuff();
         this.newAttackId();
         this.setYourFather(gc.frameClips * 999);
         this.faceToTarget();
         if(this._petInfo.findHasStudySkill("hx"))
         {
            this.releSkill1WithoutMana();
         }
         else
         {
            this.normalHit();
         }
      }
      
      private function aoyiOver() : void
      {
         this.isAoyi = false;
         this.aoyiStep = 0;
         this.setYourFather(gc.frameClips * 1);
      }
      
      private function doHit1(direct:uint, point:Point) : void
      {
         var b:SpecialEffectBullet = new SpecialEffectBullet("PetYinTaigerBullet1");
         b.x = point.x;
         b.y = point.y;
         b.setRole(this);
         b.setDirect(direct);
         b.setAction("hit1");
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
      }
      
      private function doHit2(direct:uint, point:Point) : void
      {
         var b:SpecialEffectBullet = new SpecialEffectBullet("PetYinTaigerBullet2");
         b.x = point.x;
         b.y = point.y;
         b.setRole(this);
         b.setDirect(direct);
         b.setAction("hit2");
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
      }
      
      private function doHit3(direct:uint, point:Point) : void
      {
         var b:SpecialEffectBullet = new SpecialEffectBullet("PetYinTaigerBullet3");
         b.x = point.x;
         b.y = point.y;
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
            case "hit3":
               this.doHit3(direct,point);
               break;
            case "hit2Action":
               this.releSkill1();
               break;
            case "hit3Action":
               this.releSkill2();
               break;
            case "normalHit":
               this.normalHit();
         }
      }
      
      override protected function normalHit() : void
      {
         this.faceToTarget();
         if(gc.sid == this.sourceRole.sid)
         {
            gc.sendPetAttack(this.sourceRole.getRoleId(),"normalHit",this.getBBDC().getDirect(),0,0,[]);
         }
         this.newAttackId();
         this.setAction("hit1");
         this.lastHit = "hit1";
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
               obj = this._petInfo.getPetHarmObj("hx");
               if(obj)
               {
                  return (obj.first + hurtAdd) * critValue * wsAdd * this.hurtBaseEffectRate();
               }
               return 0;
               break;
            case "hit3":
               obj = this._petInfo.getPetHarmObj("mhxs");
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
      
      override protected function isCannotMoveWhenAttackOnFloor() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2";
      }
      
      override public function isCanMoveWhenAttack() : Boolean
      {
         return this.curAction == "hit3";
      }
      
      override protected function myIntelligence() : void
      {
         if(!this.isBeAttacking())
         {
            super.myIntelligence();
         }
      }
      
      override public function destroy() : void
      {
         super.destroy();
      }
   }
}

