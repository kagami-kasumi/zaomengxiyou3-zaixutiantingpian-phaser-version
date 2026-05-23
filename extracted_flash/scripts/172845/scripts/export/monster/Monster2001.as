package export.monster
{
   import base.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   import mvc.controllor.*;
   
   public class Monster2001 extends BaseMonster
   {
      
      private var averLevel:uint = 0;
      
      private var baseHurt:uint;
      
      public function Monster2001()
      {
         super();
         this.averLevel = 85;
         this.horizenSpeed = 5;
         this.normalAttackRate = 0.6;
         this.horizenSpeed = 6;
         this.setHp(5000000 + this.averLevel * 600);
         this.setSHp(this.getHp());
         this.normalAttackRate = 0.7;
         this.attackRange = 250;
         this.alertRange = 1000;
         this.protectedParamsObject.def = 750;
         this.protectedParamsObject.exp = 500;
         this.protectedParamsObject.gxp = 250;
         this.protectedParamsObject.mDef = 0.5;
         this.baseHurt = 1400;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-6,-5],
            "attackInterval":999,
            "power":this.baseHurt,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[1,0],
            "attackInterval":999,
            "power":this.baseHurt * 2,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-14,-5],
            "attackInterval":999,
            "power":this.baseHurt * 8,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-14,-5],
            "attackInterval":999,
            "power":100,
            "attackKind":"magic",
            "addEffect":[{
               "name":BaseAddEffect.ZMXW_BUFF,
               "time":gc.frameClips * 5
            }]
         };
         this.isBoss = true;
         this.monsterName = "执明神君";
         this.setAction("wait");
         this.protectedParamsObject.fallProbability = 0.1;
         this.protectedParamsObject.fallList = [{
            "name":"p_cykljl",
            "bigtype":"cwzb"
         }];
         this.skillCD1 = [gc.frameClips * 6,gc.frameClips * 12];
         this.skillCD2 = [gc.frameClips * 8,gc.frameClips * 10];
         this.skillCD3 = [gc.frameClips * 6,gc.frameClips * 11];
         this.skillCD3 = [gc.frameClips * 6,gc.frameClips * 9];
         this.curAddEffect.add([{
            "name":"father",
            "time":gc.frameClips * 1,
            "interval":1000,
            "isForever":1
         }]);
      }
      
      override protected function initBBDC() : void
      {
         var body:Object = null;
         var bmdArray:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster2001");
         if(bmdArray)
         {
            body = {
               "name":"body",
               "source":bmdArray
            };
            bbdc = new BaseBitmapDataClip([body],250,250,new Point(0,0));
            bbdc.setOffsetXY(2,-35);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8],[2,2,2,2,10],[2,2,10],[2,2,10],[2,2,10],[2,2,2,10]]);
            bbdc.setFrameCount([6,4,1,5,3,3,3,4]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster2001--BitmapData Error!");
      }
      
      override protected function newColipse() : void
      {
         this.colipse = AUtils.getNewObj("ObjectBaseSprite") as Sprite;
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
               this.setStatic();
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
               this.dropAura();
               this.destroy();
         }
      }
      
      override protected function enterFrameFunc(p:Point) : void
      {
         var state:String = this.bbdc.getState();
         var direct:uint = uint(this.getBBDC().getDirect());
         switch(state)
         {
            case "hit1":
               if(p.x == 2)
               {
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     this.doHi1(direct);
                  }
               }
               break;
            case "hit2":
               if(p.x == 2)
               {
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     this.doHi2(direct);
                  }
               }
               break;
            case "hit3":
               if(p.x == 2)
               {
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     this.doHi3(direct);
                  }
               }
               break;
            case "hit4":
               if(p.x == 3)
               {
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     this.doHi4(direct);
                  }
               }
         }
      }
      
      private function doHi1(direct:uint) : void
      {
         var b:SpecialEffectBullet = new SpecialEffectBullet("PetTurtle2Bullet1");
         if(direct == 0)
         {
            b.x = this.x - 135;
         }
         else
         {
            b.x = this.x + 135;
         }
         b.y = this.y - 65;
         b.setRole(this);
         b.setDirect(direct);
         b.setAction("hit1");
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
      }
      
      private function doHi2(direct:uint) : void
      {
         var b:FollowBaseObjectBullet = new FollowBaseObjectBullet("PetTurtle1Bullet2");
         if(direct == 0)
         {
            b.x = this.x - 80;
         }
         else
         {
            b.x = this.x + 80;
         }
         b.y = this.y - 105;
         b.setHurtCanCutDownEffect(false);
         b.setFuncWhenDestroy(this.hit2over);
         b.setRole(this);
         b.setDirect(direct);
         b.setAction("hit2");
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
      }
      
      private function hit2over(bb:BaseBullet) : void
      {
         if(!this.isDead())
         {
            this.cureHp(2 * this.baseHurt);
         }
      }
      
      private function doHi3(direct:uint) : void
      {
         var b:SpecialEffectBullet = new SpecialEffectBullet("PetTurtle3Bullet3");
         if(direct == 0)
         {
            b.x = this.x - 0;
         }
         else
         {
            b.x = this.x + 0;
         }
         b.y = this.y - 20;
         b.setRole(this);
         b.setDirect(direct);
         b.setAction("hit3");
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
      }
      
      private function doHi4(direct:uint) : void
      {
         var b:SpecialEffectBullet = new SpecialEffectBullet("Monster2001Bullet4");
         if(direct == 0)
         {
            b.x = this.x - 15;
         }
         else
         {
            b.x = this.x + 15;
         }
         b.y = this.y - 0;
         b.setRole(this);
         b.setDirect(direct);
         b.setAction("hit4");
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
      }
      
      override public function reduceHp(re:int, canHurt:Boolean = false) : void
      {
         var bb:* = undefined;
         if(re > 19876)
         {
            re = 19876 + RandomControllor.getIns().getRandom() * 1000;
         }
         for each(bb in this.magicBulletArray)
         {
            if(bb.getImcName() == "PetTurtle1Bullet2")
            {
               canHurt = false;
               break;
            }
         }
         super.reduceHp(re,canHurt);
      }
      
      override public function setAttackBack(p:Point) : void
      {
         var bb:* = undefined;
         for each(bb in this.magicBulletArray)
         {
            if(bb.getImcName() == "PetTurtle1Bullet2")
            {
               return;
            }
         }
         super.setAttackBack(p);
      }
      
      public function isCanHurtWhenBeingAttack() : Boolean
      {
         var bb:* = undefined;
         for each(bb in this.magicBulletArray)
         {
            if(bb.getImcName() == "PetTurtle1Bullet2")
            {
               return false;
            }
         }
         return true;
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         return Boolean(this.standInObj) && Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 600;
      }
      
      override protected function beforeSkill2Start() : Boolean
      {
         return Boolean(this.standInObj) && Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 600;
      }
      
      override protected function beforeSkill3Start() : Boolean
      {
         return Boolean(this.standInObj) && Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 600;
      }
      
      override protected function releSkill1() : void
      {
         this.newAttackId();
         this.faceToTarget();
         this.setYourFather(15);
         this.setAction("hit2");
         this.lastHit = "hit2";
         if(gc.isInRoom())
         {
            if(gc.isRoomOnwer)
            {
               gc.sendMonsterAction(this);
            }
         }
      }
      
      override protected function releSkill2() : void
      {
         this.newAttackId();
         this.faceToTarget();
         this.setYourFather(15);
         this.setAction("hit3");
         this.lastHit = "hit3";
         if(gc.isInRoom())
         {
            if(gc.isRoomOnwer)
            {
               gc.sendMonsterAction(this);
            }
         }
      }
      
      override protected function releSkill3() : void
      {
         this.newAttackId();
         this.faceToTarget();
         this.setYourFather(15);
         this.setAction("hit4");
         this.lastHit = "hit4";
         if(gc.isInRoom())
         {
            if(gc.isRoomOnwer)
            {
               gc.sendMonsterAction(this);
            }
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
      
      override public function isAttacking() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3" || this.curAction == "hit4";
      }
      
      override public function destroy() : void
      {
         var ta:Array = null;
         var i:int = 0;
         var mc:MovieClip = null;
         super.destroy();
         if(this.isBoss)
         {
            ta = gc.pWorld.getTransferDoorArray();
            i = 0;
            while(i < ta.length)
            {
               mc = ta[i];
               mc.visible = true;
               i++;
            }
         }
      }
   }
}

