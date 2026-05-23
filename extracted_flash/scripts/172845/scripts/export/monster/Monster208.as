package export.monster
{
   import base.*;
   import com.greensock.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   import my.*;
   
   public class Monster208 extends BaseMonster
   {
      
      private var hit2Si:TweenMax;
      
      private var moveSi:int;
      
      public function Monster208()
      {
         super();
         this.horizenSpeed = 3;
         this.normalAttackRate = 0.7;
         this.protectedParamsObject.def = 660;
         this.protectedParamsObject.exp = 5000;
         this.protectedParamsObject.gxp = 80;
         this.protectedParamsObject.mDef = 0.55;
         this.protectedParamsObject.miss = 0.3;
         this.protectedParamsObject.crit = 0.1;
         this.setHp(7000000);
         this.setSHp(7000000);
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":99,
            "power":3200,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":99,
            "power":3200,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":99,
            "power":3500,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":99,
            "power":3500,
            "attackKind":"magic"
         };
         this.attackRange = 300;
         this.alertRange = 2000;
         this.isBoss = true;
         this.monsterName = "白水神君";
         this.setAction("wait");
         this.protectedParamsObject.fallProbability = 0;
         this.protectedParamsObject.fallList = [];
         this.skillCD1 = [gc.frameClips * 2,gc.frameClips * 6.4];
         this.skillCD2 = [gc.frameClips * 3,gc.frameClips * 7.2];
         this.skillCD3 = [gc.frameClips * 4,gc.frameClips * 8.1];
         this.skillCD4 = [gc.frameClips * 2.5,gc.frameClips * 6.4];
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
         var bmdArray:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster208");
         if(bmdArray)
         {
            body = {
               "name":"body",
               "source":bmdArray
            };
            bbdc = new BaseBitmapDataClip([body],300,300,new Point(0,0));
            bbdc.setOffsetXY(15,-45);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8],[2,2,2,2,2,7],[2,2,10],[2,2,10],[3,3],[2,2,2,10]]);
            bbdc.setFrameCount([6,4,1,6,3,3,6,4]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster208--BitmapData Error!");
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
         var repeat:int = 0;
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
               repeat = int(this.bbdc.getCurKeyFrameIndex());
               if(repeat == 0)
               {
                  if(p.x == 0)
                  {
                     if(this.bbdc.getCurFrameCount() == 2)
                     {
                        this.doHi3(direct);
                     }
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
      
      override protected function beforeSkill1Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 6000;
      }
      
      override protected function beforeSkill2Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 400;
      }
      
      override protected function beforeSkill3Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 400;
      }
      
      override protected function releSkill1() : void
      {
         this.newAttackId();
         this.faceToTarget();
         this.setYourFather(20);
         this.setAction("hit2");
         this.lastHit = "hit2";
      }
      
      override protected function releSkill2() : void
      {
         this.newAttackId();
         this.faceToTarget();
         this.setYourFather(20);
         this.setAction("hit3");
         this.lastHit = "hit3";
      }
      
      override protected function releSkill3() : void
      {
         this.newAttackId();
         this.faceToTarget();
         this.setYourFather(20);
         this.setAction("hit4");
         this.lastHit = "hit4";
      }
      
      private function doHi1(direct:uint) : void
      {
         var b:SpecialEffectBullet = new SpecialEffectBullet("Monster208Bullet1");
         if(direct == 0)
         {
            b.x = this.x - 88;
         }
         else
         {
            b.x = this.x + 88;
         }
         b.y = this.y - 88;
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
         var b:SpecialEffectBullet = null;
         var bh:BaseHero = null;
         if(num == 0)
         {
            return;
         }
         num--;
         if(!this.isDead())
         {
            b = new SpecialEffectBullet("Monster208Bullet2");
            bh = gc.getRandomPlayer();
            if(bh)
            {
               b.x = bh.x;
               b.y = 510;
               b.setRole(this);
               b.setDirect(0);
               b.setAction("hit2");
               gc.gameSence.addChild(b);
               this.magicBulletArray.push(b);
            }
            this.hit2Si = TweenMax.delayedCall(2,this.doSingleHit2,[num]);
         }
      }
      
      private function doHi3(direct:uint) : void
      {
         var b:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster208Bullet3");
         if(direct == 0)
         {
            b.x = this.x - 50;
         }
         else
         {
            b.x = this.x + 50;
         }
         b.y = this.y - 28;
         b.setRole(this);
         b.setHurtCanCutDownEffect(false);
         b.setDirect(direct);
         b.setAction("hit3");
         b.setDisable();
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
         b.setFuncWhenDestroy(this.hit3Destroy);
      }
      
      private function hit3Destroy(bb:BaseBullet) : void
      {
         var bo:* = undefined;
         var arr:Array = null;
         if(!this.isDead())
         {
            for each(bo in arr)
            {
               if(!bo.isYourFather())
               {
                  bo.addCurAddEffect([{
                     "name":BaseAddEffect.PETHORSE_ICE,
                     "time":gc.frameClips * 3
                  }]);
               }
            }
         }
      }
      
      private function doHi4(direct:uint) : void
      {
         var b:SpecialEffectBullet = new SpecialEffectBullet("Monster208Bullet4");
         b.x = this.x - 88;
         b.y = 270;
         b.setRole(this);
         b.setDirect(0);
         b.setAction("hit4");
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
         b = new SpecialEffectBullet("Monster208Bullet4");
         b.x = this.x + 88;
         b.y = 270;
         b.setRole(this);
         b.setDirect(1);
         b.setAction("hit4");
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
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
         if(this.hit2Si)
         {
            this.hit2Si.kill();
            this.hit2Si = null;
         }
         if(this.isDead())
         {
            MainGame.getInstance().createMonster(209,this.x,this.y);
         }
         super.destroy();
      }
   }
}

