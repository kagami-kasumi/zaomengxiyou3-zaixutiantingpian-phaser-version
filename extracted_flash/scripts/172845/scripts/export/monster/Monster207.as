package export.monster
{
   import base.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   import flash.utils.*;
   import mvc.controllor.*;
   
   public class Monster207 extends BaseMonster
   {
      
      private var hit2Si:int;
      
      private var moveSi:int;
      
      private var movintSi:int;
      
      public function Monster207()
      {
         super();
         this.horizenSpeed = 3;
         this.normalAttackRate = 0.7;
         this.protectedParamsObject.def = 100;
         this.protectedParamsObject.exp = 175;
         this.protectedParamsObject.gxp = 80;
         this.setHp(12000000);
         this.setSHp(12000000);
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":99,
            "power":4200,
            "attackKind":"magic",
            "addEffect":[{
               "name":BaseAddEffect.MONSTER66HURT,
               "time":1
            }]
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":99,
            "power":4200,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":24,
            "power":4500,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":24,
            "power":5,
            "attackKind":"magic"
         };
         this.attackRange = 300;
         this.alertRange = 2000;
         this.isFly = true;
         this.graity = 0;
         this.isBoss = true;
         this.monsterName = "紫眸鹫王";
         this.setAction("wait");
         this.protectedParamsObject.fallProbability = 0.1;
         this.protectedParamsObject.fallList = [{
            "name":"cs_fj_dz",
            "bigtype":"zb"
         },{
            "name":"cs_fj_zt",
            "bigtype":"zb"
         },{
            "name":"cs_fj_jt",
            "bigtype":"zb"
         },{
            "name":"cs_fj_js",
            "bigtype":"zb"
         }];
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
         this.moveSi = setInterval(function(self:Monster207):*
         {
            if(!self.isDead())
            {
               self.movemove();
            }
         },23000,this);
      }
      
      override protected function initBBDC() : void
      {
         var body:Object = null;
         var bmdArray:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster207");
         if(bmdArray)
         {
            body = {
               "name":"body",
               "source":bmdArray
            };
            bbdc = new BaseBitmapDataClip([body],350,350,new Point(0,0));
            bbdc.setOffsetXY(-10,-45);
            bbdc.setFrameStopCount([[4,4,4,4],[8],[2,2,2,2,7],[2,2,10],[2,10],[2,2,10],[4,4,4,4]]);
            bbdc.setFrameCount([4,1,5,3,2,3,4]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster66--BitmapData Error!");
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
               if(curPoint.y != 0)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(0);
               }
               this.bbdc.setState(str);
               break;
            case "hurt":
               if(curPoint.y != 1)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(1);
               }
               this.bbdc.setState(str);
               break;
            case "hit1":
               if(curPoint.y != 3)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(3);
               }
               this.bbdc.setState(str);
               break;
            case "hit2":
               if(curPoint.y != 4)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(str);
               break;
            case "hit3":
               if(curPoint.y != 5)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(5);
               }
               this.bbdc.setState(str);
               break;
            case "hit4":
               if(curPoint.y != 0)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(0);
               }
               this.bbdc.setState(str);
               break;
            case "dead":
               if(curPoint.y != 2)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(2);
               }
               this.bbdc.setState(str);
         }
      }
      
      override protected function scriptFrameOverFunc(row:int) : void
      {
         var targetY:int = 0;
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
               this.bbdc.setFramePointX(0);
               break;
            case "hurt":
               this.setStatic();
               this.setAction("wait");
               break;
            case "dead":
               targetY = 200 - (this.y - 100);
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
               if(p.x == 2)
               {
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     this.doHi3(direct);
                  }
               }
               break;
            case "hit4":
               if(direct == 0)
               {
                  this.speed.x = -10;
               }
               else
               {
                  this.speed.x = 10;
               }
               if(this.y > 400)
               {
                  this.speed.y = -1;
               }
               else if(this.y < 200)
               {
                  this.speed.y = 1;
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
      
      private function movemove() : void
      {
         this.newAttackId();
         this.faceToTarget();
         this.setYourFather(20);
         if(this.x > 2000)
         {
            this.turnLeft();
         }
         else
         {
            this.turnRight();
         }
         this.setAction("hit4");
         this.lastHit = "hit4";
         this.movintSi = setTimeout(function(self:Monster207):*
         {
            if(!self.isDead())
            {
               self.fatherCount = 0;
               self.setAction("wait");
            }
         },4000,this);
      }
      
      private function doHi1(direct:uint) : void
      {
         var b:SpecialEffectBullet = new SpecialEffectBullet("Monster207Bullet1");
         if(direct == 0)
         {
            b.x = this.x - 120;
         }
         else
         {
            b.x = this.x + 120;
         }
         b.y = this.y - 60;
         b.setRole(this);
         b.setDirect(direct);
         b.setAction("hit1");
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
      }
      
      private function doHi2(direct:uint) : void
      {
         this.doSingleHit2(8);
      }
      
      private function doSingleHit2(num:int) : void
      {
         var b:EnemyMoveBullet = null;
         var bh:BaseHero = null;
         num--;
         b = new EnemyMoveBullet("Monster207Bullet2");
         bh = gc.getRandomPlayer();
         if(bh)
         {
            b.x = bh.x;
            b.y = 100 + (RandomControllor.getIns().getRandom() - 0.5) * 150;
            b.setRole(this);
            b.setDirect(0);
            b.setSpeed(0,2);
            b.setAddSpeed(0,0.8);
            b.setDestroyWhenLastFrame(false);
            b.setDestroyInCount(gc.frameClips * 10);
            b.setDistance(800);
            b.setFuncWhenHitWall(this.hit2Destroy);
            b.setAction("hit2");
            gc.gameSence.addChild(b);
            this.magicBulletArray.push(b);
            if(num > 0)
            {
               this.hit2Si = setTimeout(function(self:Monster207, _num:int):*
               {
                  if(!self.isDead())
                  {
                     self.doSingleHit2(_num);
                  }
               },500,this,num);
            }
         }
      }
      
      private function hit2Destroy(bb:BaseBullet) : void
      {
         bb.destroy();
      }
      
      private function doHi3(direct:uint) : void
      {
         var b:EnemyMoveBullet = new EnemyMoveBullet("Monster207Bullet3");
         if(direct == 0)
         {
            b.x = this.x - 120;
            b.setSpeed(-2,0);
         }
         else
         {
            b.x = this.x + 120;
            b.setSpeed(2,0);
         }
         b.y = 290;
         b.setRole(this);
         b.setDistance(2000);
         b.setDestroyInCount(gc.frameClips * 10);
         b.setDestroyWhenLastFrame(false);
         b.setDirect(direct);
         b.setAction("hit3");
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
         this.skillCD2[1] = gc.frameClips * (8 + RandomControllor.getIns().getRandom() * 14);
      }
      
      override protected function exitFrameFunc(p:Point) : void
      {
      }
      
      override public function isCanMoveByStage() : Boolean
      {
         return true;
      }
      
      override protected function myIntelligence() : void
      {
         if(!this.isBeAttacking())
         {
            super.myIntelligence();
         }
      }
      
      override public function isCanMoveWhenAttack() : Boolean
      {
         return this.curAction == "hit4";
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
         clearTimeout(this.hit2Si);
         clearTimeout(this.movintSi);
         if(this.isDead())
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
         super.destroy();
      }
   }
}

