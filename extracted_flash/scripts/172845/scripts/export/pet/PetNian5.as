package export.pet
{
   import base.*;
   import com.greensock.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   import mvc.controllor.*;
   import petInfo.PetInfo;
   
   public class PetNian5 extends BasePet
   {
      
      private var linghunArr:Array;
      
      private var hit4Count:uint = 48;
      
      public function PetNian5(bh:BaseHero, pi:PetInfo)
      {
         this.linghunArr = [];
         super(bh,pi);
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
            "attackBackSpeed":[10,0],
            "attackInterval":999,
            "power":12,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[0,0],
            "attackInterval":15,
            "power":400,
            "attackKind":"physics",
            "addEffect":[{
               "name":BaseAddEffect.STUN,
               "time":gc.frameClips * 3
            }]
         };
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-10,0],
            "attackInterval":999,
            "power":12,
            "attackKind":"physics"
         };
         this.attackRange = 200;
         this.attackRate = 0.7;
         this.setAction("wait");
         this.skillCD1 = [gc.frameClips * 4,gc.frameClips * 10];
         this.skillCD2 = [gc.frameClips * 10,gc.frameClips * 15];
         this.skillCD3 = [gc.frameClips * 3,gc.frameClips * 10];
      }
      
      override protected function initBBDC() : void
      {
         var body:Object = null;
         var bmdArray:Array = BaseBitmapDataPool.getBitmapDataArrayByName("PetNianBmd5");
         if(bmdArray)
         {
            body = {
               "name":"body",
               "source":bmdArray
            };
            bbdc = new BaseBitmapDataClip([body],300,300,new Point(0,0));
            bbdc.setOffsetXY(30,-50);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8],[2,2,2,2,10],[2,2,2,10],[2,10],[30],[30]]);
            bbdc.setFrameCount([6,4,1,5,4,2,1,1]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("PetNianBmd5--BitmapData Error!");
      }
      
      override protected function newColipse() : void
      {
         this.colipse = AUtils.getNewObj("Monster155Sprite") as Sprite;
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
            case "hit4":
               if(curPoint.y != 7)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(7);
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
      
      override protected function enterFrameFunc(p:Point) : void
      {
         var state:String = this.bbdc.getState();
         var direct:uint = uint(this.getBBDC().getDirect());
         var point:Point = new Point();
         switch(state)
         {
            case "hit1":
               if(p.x == 3)
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
               if(p.x == 1)
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
                     this.doHit2(direct,point);
                  }
               }
               break;
            case "hit3":
               if(p.x == 0)
               {
                  if(this.bbdc.getCurFrameCount() == 30)
                  {
                     if(direct == 0)
                     {
                        point.x = this.x - 85;
                     }
                     else
                     {
                        point.x = this.x + 85;
                     }
                     point.y = this.y - 55;
                     this.doHit3(direct,point);
                  }
               }
               break;
            case "hit4":
               if(p.x == 0)
               {
                  if(this.bbdc.getCurFrameCount() == 30)
                  {
                     if(direct == 0)
                     {
                        point.x = this.x - 85;
                     }
                     else
                     {
                        point.x = this.x + 85;
                     }
                     point.y = this.y - 55;
                     this.doHit4(direct,point);
                  }
               }
         }
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         return this._petInfo.getMp() >= this._petInfo.findPetUsedMagic("qxyl") && Boolean(this._petInfo.findHasStudySkill("qxyl"));
      }
      
      override protected function beforeSkill2Start() : Boolean
      {
         return this.curAttackTarget != null && AUtils.GetDisBetweenTwoObj(this,this.curAttackTarget) <= 300 && this._petInfo.getMp() >= this._petInfo.findPetUsedMagic("bhjm") && Boolean(this._petInfo.findHasStudySkill("bhjm"));
      }
      
      override protected function beforeSkill3Start() : Boolean
      {
         return !this._petInfo.isUseSkillX1 && this._petInfo.getMp() >= this._petInfo.findPetUsedMagic("jhgy") && Boolean(this._petInfo.findHasStudySkill("jhgy"));
      }
      
      override public function reduceHp(re:int, canHurt:Boolean = false) : void
      {
         super.reduceHp(re,canHurt);
      }
      
      override protected function releSkill1() : void
      {
         this.newAttackId();
         this.setAction("hit2");
         this.lastHit = "hit2";
         if(gc.sid == this.sourceRole.sid)
         {
            this.faceToTarget();
            gc.sendPetAttack(this.sourceRole.getRoleId(),"hit2Action",this.getBBDC().getDirect(),0,0,[]);
         }
         this._petInfo.setMp(this._petInfo.getMp() - this._petInfo.findPetUsedMagic("qxyl"));
      }
      
      override protected function releSkill2() : void
      {
         this.newAttackId();
         this.setYourFather(30);
         this.setAction("hit3");
         this.lastHit = "hit3";
         if(gc.sid == this.sourceRole.sid)
         {
            this.faceToTarget();
            gc.sendPetAttack(this.sourceRole.getRoleId(),"hit3Action",this.getBBDC().getDirect(),0,0,[]);
         }
         this._petInfo.setMp(this._petInfo.getMp() - this._petInfo.findPetUsedMagic("bhjm"));
      }
      
      override protected function releSkill3() : void
      {
         this._petInfo.isUseSkillX1 = true;
         this.newAttackId();
         this.setYourFather(30);
         this.setAction("hit4");
         this.lastHit = "hit4";
         if(gc.sid == this.sourceRole.sid)
         {
            this.faceToTarget();
            gc.sendPetAttack(this.sourceRole.getRoleId(),"hit4Action",this.getBBDC().getDirect(),0,0,[]);
         }
         this._petInfo.setMp(this._petInfo.getMp() - this._petInfo.findPetUsedMagic("jhgy"));
      }
      
      private function doHit1(direct:uint, point:Point) : void
      {
         var b:SpecialEffectBullet = new SpecialEffectBullet("Monster155Bullet1");
         if(direct == 0)
         {
            b.x = this.x - 160;
         }
         else
         {
            b.x = this.x + 160;
         }
         b.y = this.y - 110;
         b.setRole(this);
         b.setDirect(direct);
         b.setAction("hit1");
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
      }
      
      private function doHit2(direct:uint, point:Point) : void
      {
         this.doSingleHit2(7);
      }
      
      private function doSingleHit2(nums:uint) : void
      {
         var randMonster:BaseMonster = null;
         var b:EnemyMoveBullet = null;
         if(nums > 0)
         {
            nums--;
            randMonster = gc.pWorld.monsterArray[int(RandomControllor.getIns().getRandom() * gc.pWorld.monsterArray.length)];
            if(randMonster)
            {
               b = new EnemyMoveBullet("Monster155Bullet2");
               b.x = randMonster.x;
               b.y = 100;
               b.setRole(this);
               b.setDestroyWhenLastFrame(false);
               b.setDistance(1000);
               b.setSpeed(0,2);
               b.setAddSpeed(0,1);
               b.setDirect(0);
               b.setAction("hit2");
               gc.gameSence.addChild(b);
               this.magicBulletArray.push(b);
               TweenMax.delayedCall(1,function(_self:PetNian5, _nums:uint):*
               {
                  if(!_self.isDead() && _self._petInfo.isFight == 1)
                  {
                     _self.doSingleHit2(_nums);
                  }
               },[this,nums]);
            }
         }
      }
      
      private function doHit3(direct:uint, point:Point) : void
      {
         var b:SpecialEffectBullet = new SpecialEffectBullet("Monster155Bullet3");
         b.x = this.x;
         b.y = point.y;
         b.setRole(this);
         b.setDirect(direct);
         b.setAction("hit3");
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
         b = new SpecialEffectBullet("Monster155Bullet3");
         if(direct == 0)
         {
            b.x = this.x - 50;
         }
         else
         {
            b.x = this.x + 50;
         }
         b.y = this.y - 55;
         b.setRole(this);
         if(direct == 0)
         {
            direct = 1;
         }
         else
         {
            direct = 0;
         }
         b.setDirect(direct);
         b.setAction("hit3");
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
      }
      
      private function doHit4(direct:uint, point:Point) : void
      {
         var b:FollowBaseObjectBullet = new FollowBaseObjectBullet("PetNian5Bullet4_1");
         if(direct == 0)
         {
            b.x = this.x - 110;
         }
         else
         {
            b.x = this.x + 110;
         }
         b.y = this.y - 95;
         b.setDestroyWhenLastFrame(false);
         b.setDestroyInCount(30);
         b.setRole(this);
         b.setDirect(direct);
         b.setAction("hit4");
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
         b.setFuncWhenDestroy(this.hit4Over);
      }
      
      private function hit4Over(bb:BaseBullet) : void
      {
         var i:* = 0;
         var num:int = 9;
         i = 0;
         while(i < num)
         {
            b = new PetNian5Bullet("PetNian5Bullet4_2");
            b.x = this.x;
            b.y = this.y;
            b.setDestroyWhenLastFrame(false);
            b.setDestroyInCount(gc.frameClips * 999999);
            b.offsetPoint.x = (RandomControllor.getIns().getRandom() - 0.5) * 300;
            b.offsetPoint.y = -RandomControllor.getIns().getRandom() * 150;
            b.setRole(this);
            b.setDistance(9999999);
            b.setDirect(0);
            b.setDisable();
            b.setAction("hit4");
            gc.gameSence.addChild(b);
            this.magicBulletArray.push(b);
            this.linghunArr.push(b);
            i++;
         }
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
               return {
                  "hurt":(this._petInfo.getAtk() + hurtAdd) * critValue * wsAdd * this.hurtBaseEffectRate(),
                  "qixue":0
               };
            case "hit2":
               obj = this._petInfo.getPetHarmObj("qxyl");
               if(obj)
               {
                  return {
                     "hurt":(obj.first + hurtAdd) * critValue * wsAdd * this.hurtBaseEffectRate(),
                     "qixue":0
                  };
               }
               return {
                  "hurt":0,
                  "qixue":0
               };
               break;
            case "hit3":
               obj = this._petInfo.getPetHarmObj("bhjm");
               if(obj)
               {
                  return {
                     "hurt":(obj.first + hurtAdd) * critValue * wsAdd * this.hurtBaseEffectRate(),
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
      
      override protected function exitFrameFunc(p:Point) : void
      {
      }
      
      override protected function myIntelligence() : void
      {
         if(!this.isBeAttacking())
         {
            super.myIntelligence();
         }
         if(this.hit4Count > 0)
         {
            --this.hit4Count;
            if(this.hit4Count == 0)
            {
               if(this._petInfo.getHp() / this._petInfo.getSHp() < 0.4)
               {
                  hit4Bullet = this.linghunArr.pop();
                  if(hit4Bullet)
                  {
                     hit4Bullet.gogo();
                  }
               }
               this.hit4Count = 48;
            }
         }
      }
      
      override protected function isCannotMoveWhenAttackOnFloor() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3" || this.curAction == "hit4";
      }
      
      override public function destroy() : void
      {
         super.destroy();
         this.linghunArr = null;
      }
   }
}

