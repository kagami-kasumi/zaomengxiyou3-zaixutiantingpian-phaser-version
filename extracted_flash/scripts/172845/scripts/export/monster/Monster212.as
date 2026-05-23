package export.monster
{
   import base.*;
   import com.greensock.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   import mvc.controllor.*;
   import my.*;
   
   public class Monster212 extends BaseMonster
   {
      
      public function Monster212()
      {
         super();
         this.horizenSpeed = 4;
         this.normalAttackRate = 0.7;
         this.protectedParamsObject.def = 450;
         this.protectedParamsObject.exp = 10000;
         this.protectedParamsObject.gxp = 3000;
         this.protectedParamsObject.mDef = 0.45;
         this.setHp(12000000);
         this.setSHp(this.getHp());
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":12,
            "power":5000,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":999,
            "power":4300,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":15,
            "power":4400,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":24,
            "power":4500,
            "attackKind":"magic"
         };
         this.attackRange = 250;
         this.alertRange = 1000;
         this.isBoss = true;
         this.monsterName = "青阳神君";
         this.setAction("wait");
         this.skillCD1 = [gc.frameClips * 2,gc.frameClips * 6.4];
         this.skillCD2 = [gc.frameClips * 3,gc.frameClips * 7.2];
         this.skillCD3 = [gc.frameClips * 4,gc.frameClips * 8.1];
         this.skillCD4 = [gc.frameClips * 2.5,gc.frameClips * 6.4];
         this.protectedParamsObject.fallProbability = 0;
         this.protectedParamsObject.fallList = [];
         this.curAddEffect.add([{
            "name":"father",
            "time":gc.frameClips * 1,
            "interval":800,
            "isForever":1
         }]);
      }
      
      override protected function initBBDC() : void
      {
         var body:Object = null;
         var bmdArray:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster212");
         if(bmdArray)
         {
            body = {
               "name":"body",
               "source":bmdArray
            };
            bbdc = new BaseBitmapDataClip([body],300,300,new Point(0,0));
            bbdc.setOffsetXY(22,-35);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8],[2,2,2,2,2,10],[2,2,10],[2,10],[4,10],[15]]);
            bbdc.setFrameCount([6,4,1,6,3,2,2,1]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster212--BitmapData Error!");
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
               if(p.x == 1)
               {
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     this.doHi2(direct);
                  }
               }
               break;
            case "hit3":
               if(p.x == 1)
               {
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     this.doHi3(direct);
                  }
               }
               break;
            case "hit4":
               if(p.x == 0)
               {
                  if(this.bbdc.getCurFrameCount() == 15)
                  {
                     this.doHi4(direct);
                  }
               }
         }
      }
      
      private function doHi1(direct:uint) : void
      {
         var b:SpecialEffectBullet = new SpecialEffectBullet("Monster212Bullet1");
         if(direct == 0)
         {
            b.x = this.x - 160;
         }
         else
         {
            b.x = this.x + 160;
         }
         b.y = this.y - 44;
         b.setRole(this);
         b.setDirect(direct);
         b.setAction("hit1");
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
      }
      
      private function doHi2(direct:uint) : void
      {
         this.doSingleHit2(5);
      }
      
      private function doSingleHit2(num:int) : void
      {
         if(num <= 0)
         {
            return;
         }
         if(this.isDead())
         {
            return;
         }
         var direct:uint = uint(this.getBBDC().getDirect());
         var b:SpecialEffectBullet = new SpecialEffectBullet("Monster212Bullet2");
         if(direct == 0)
         {
            b.x = this.x + RandomControllor.getIns().getRandom() * 200;
         }
         else
         {
            b.x = this.x - RandomControllor.getIns().getRandom() * 200;
         }
         b.y = 95;
         b.setRole(this);
         b.setDirect(direct);
         b.setAction("hit2");
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
         num--;
         TweenMax.delayedCall(1,this.doSingleHit2,[num]);
      }
      
      private function doHi3(direct:uint) : void
      {
         var b:SpecialEffectBullet = new SpecialEffectBullet("Monster212Bullet3");
         if(direct == 0)
         {
            b.x = this.x - 220;
         }
         else
         {
            b.x = this.x + 220;
         }
         b.y = this.y - 60;
         b.setRole(this);
         b.setDirect(direct);
         b.setAction("hit3");
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
      }
      
      private function doHi4(direct:uint) : void
      {
         var b:SpecialEffectBullet = new SpecialEffectBullet("Monster212Bullet4_1");
         if(direct == 0)
         {
            b.x = this.x - 55;
         }
         else
         {
            b.x = this.x + 55;
         }
         b.y = this.y - 40;
         b.setRole(this);
         b.setDisable();
         b.setDirect(direct);
         b.setAction("hit4");
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
         this.doSingleHit4(4);
      }
      
      private function doSingleHit4(num:int) : void
      {
         var b:SpecialEffectBullet = null;
         if(num <= 0)
         {
            return;
         }
         if(this.isDead())
         {
            return;
         }
         num--;
         var bh:BaseHero = gc.getRandomPlayer();
         if(bh)
         {
            b = new SpecialEffectBullet("Monster212Bullet4_2");
            b.x = bh.x;
            b.y = bh.y;
            b.setRole(this);
            b.setDirect(0);
            b.setAction("hit4");
            gc.gameSence.addChild(b);
            this.magicBulletArray.push(b);
         }
         TweenMax.delayedCall(2,this.doSingleHit4,[num]);
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 300;
      }
      
      override protected function beforeSkill2Start() : Boolean
      {
         return this.curAttackTarget;
      }
      
      override protected function beforeSkill3Start() : Boolean
      {
         return this.curAttackTarget;
      }
      
      override protected function releSkill1() : void
      {
         this.faceToTarget();
         this.newAttackId();
         this.setYourFather(20);
         this.setAction("hit2");
         this.lastHit = "hit2";
      }
      
      override protected function releSkill2() : void
      {
         this.faceToTarget();
         this.newAttackId();
         this.setYourFather(20);
         this.setAction("hit3");
         this.lastHit = "hit3";
      }
      
      override protected function releSkill3() : void
      {
         this.faceToTarget();
         this.newAttackId();
         this.setYourFather(20);
         this.setAction("hit4");
         this.lastHit = "hit4";
      }
      
      override protected function exitFrameFunc(p:Point) : void
      {
      }
      
      override public function isAttacking() : Boolean
      {
         return Boolean(super.isAttacking()) || this.curAction == "hit4";
      }
      
      override protected function myIntelligence() : void
      {
         if(!this.isBeAttacking())
         {
            super.myIntelligence();
         }
      }
      
      protected function callFenshen() : void
      {
         MainGame.getInstance().createMonster(213,this.x,this.y);
      }
      
      override public function destroy() : void
      {
         if(this.getHp() <= 0)
         {
            this.callFenshen();
         }
         super.destroy();
      }
   }
}

