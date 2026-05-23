package export.monster
{
   import base.*;
   import com.greensock.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   import flash.utils.*;
   
   public class Monster264 extends BaseMonster
   {
      
      private var centerPoint:Point = new Point(0,0);
      
      private var godStateLoopTime:int = 0;
      
      public function Monster264()
      {
         super();
         this.horizenSpeed = 4.5;
         this.setHp(6887079);
         this.setSHp(6887079);
         this.attackRange = 250;
         this.alertRange = 1000;
         this.protectedParamsObject.def = 3380;
         this.protectedParamsObject.mDef = 0.55;
         this.protectedParamsObject.ReduceMagicDef = 0.1825;
         this.protectedParamsObject.exp = 15000;
         this.protectedParamsObject.gxp = 10000;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":999,
            "power":21349,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["skill1"] = {
            "hitMaxCount":4,
            "attackBackSpeed":[6,-5],
            "attackInterval":10,
            "power":21349 * 0.3,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["skill2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":999,
            "power":14110,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["skill3"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[3,-5],
            "attackInterval":15,
            "power":14110 * 0.565,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["skill4"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":15,
            "power":21349 * 0.28,
            "attackKind":"magic"
         };
         this.isBoss = true;
         this.monsterName = "通天教主";
         this.setAction("wait");
         this.skillCD1 = [gc.frameClips * 3,gc.frameClips * 7];
         this.skillCD2 = [gc.frameClips * 20,gc.frameClips * 20];
         this.skillCD3 = [gc.frameClips * 15,gc.frameClips * 30];
         this.skillCD4 = [gc.frameClips * 10,gc.frameClips * 15];
         this.protectedParamsObject.probability = 0.1;
         this.fallList = [{
            "name":"qpjy",
            "bigtype":"dj"
         }];
      }
      
      private function getArrayAllOne(len:uint) : Array
      {
         var arr:Array = [];
         for(var i:uint = 0; i < len; i++)
         {
            arr.push(1);
         }
         return arr;
      }
      
      override protected function initBBDC() : void
      {
         var body:Object = null;
         var bmdArray:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster264");
         if(bmdArray)
         {
            body = {
               "name":"body",
               "source":bmdArray
            };
            bbdc = new BaseBitmapDataClip([body],350,350,new Point(0,0));
            bbdc.setOffsetXY(-10,-30);
            bbdc.setFrameStopCount([[2,2,2,2,2,2],[4,4,4,4],[8],[3,3,6],this.getArrayAllOne(61),this.getArrayAllOne(65),[2,15,2,21],this.getArrayAllOne(95),this.getArrayAllOne(58)]);
            bbdc.setFrameCount([6,4,1,3,61,65,4,272,58]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            scaleX *= -1;
            return;
         }
         throw new Error("Monster264--BitmapData Error!");
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
            case "dead":
               if(curPoint.y != 3)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(3);
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
            case "skill1":
               if(curPoint.y != 5)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(5);
               }
               this.bbdc.setState(str);
               break;
            case "skill2":
               if(curPoint.y != 6)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(6);
               }
               this.bbdc.setState(str);
               break;
            case "skill3":
               if(curPoint.y != 7)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(7);
               }
               this.bbdc.setState(str);
               break;
            case "skill4":
               if(curPoint.y != 8)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(8);
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
            case "skill1":
            case "skill2":
            case "skill4":
               this.setAction("wait");
               break;
            case "skill3":
               this.setAction("wait");
               this.godStateLoopTime = 0;
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
               if(p.x == 17)
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     this.doHi1(direct);
                  }
               }
               if(p.x == 25 && Math.random() > 0.5)
               {
                  this.setAction("wait");
               }
               if(p.x == 40)
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     this.doHit1_2(direct);
                  }
               }
               break;
            case "skill1":
               if(p.x == 48)
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     this.doSkill1(direct);
                  }
               }
               break;
            case "skill2":
               this.setYourFather(3);
               if(p.x == 2)
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     this.doSkill2(direct);
                  }
               }
               break;
            case "skill3":
               this.setYourFather(3);
               if(p.x == 33)
               {
                  this.centerPoint = gc.gameSence.globalToLocal(new Point(gc.stage.stageWidth / 2,gc.stage.stageHeight / 2));
               }
               if(p.x >= 34)
               {
                  this.x = this.centerPoint.x;
                  this.y = this.centerPoint.y;
                  this.speed.x = this.speed.y = 0;
               }
               if(p.x == 36)
               {
                  if(this.bbdc.getCurFrameCount() == 1 && this.godStateLoopTime % 2 == 0)
                  {
                     this.doSkill3(direct);
                  }
               }
               if(p.x == 94)
               {
                  if(this.godStateLoopTime < 3)
                  {
                     this.bbdc.setFramePointX(34);
                     ++this.godStateLoopTime;
                  }
               }
               break;
            case "skill4":
               if(p.x == 0)
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     this.doSkill4(direct);
                  }
               }
         }
      }
      
      private function doHi1(direct:uint) : void
      {
         var b:EnemyMoveBullet = new EnemyMoveBullet("Monster264Bullet1");
         if(direct == 0)
         {
            b.x = this.x - 10;
         }
         else
         {
            b.x = this.x + 10;
         }
         b.y = this.y;
         b.setRole(this);
         b.setSpeed(direct ? 15 : -15,0);
         b.setDistance(1000);
         b.setDestroyWhenLastFrame(false);
         b.setDirect(direct);
         b.setAction("hit1");
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
      }
      
      private function doHit1_2(direct:uint) : void
      {
         var b:SpecialEffectBullet = new SpecialEffectBullet("Monster264Bullet6");
         var mc:MovieClip = b.getImgMc();
         mc.addFrameScript(74,this.explode);
         this.centerPoint = gc.gameSence.globalToLocal(new Point(gc.stage.stageWidth / 2,gc.stage.stageHeight / 2));
         b.x = this.centerPoint.x;
         b.y = this.centerPoint.y;
         b.setRole(this);
         b.setDirect(direct);
         b.setAction("hit1");
         b.setDisable();
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
      }
      
      private function explode(isSecond:Boolean = false) : void
      {
         var b:EnemyMoveBullet = null;
         var spd:int = 0;
         var addSpd:int = 0;
         if(this.isDead() || !this.parent)
         {
            return;
         }
         if(!isSecond)
         {
            this.shine();
         }
         var total:int = 6;
         for(var i:int = 0; i < total; i++)
         {
            b = new EnemyMoveBullet("Monster264Bullet1");
            b.x = this.centerPoint.x;
            b.y = this.centerPoint.y;
            b.setFuncWhenHit(this.explodeHitCure);
            b.setRole(this);
            b.setAction("hit1");
            b.setDirect(this.bbdc.getDirect());
            b.rotation = 360 * i / total + (isSecond ? 180 / total : 0);
            spd = 10;
            addSpd = 2;
            b.setDistance(1000);
            b.setDestroyWhenLastFrame(false);
            b.setSpeed(Math.cos(b.rotation * Math.PI / 180) * spd,Math.sin(b.rotation * Math.PI / 180) * spd);
            b.setAddSpeed(Math.cos(b.rotation * Math.PI / 180) * addSpd,Math.sin(b.rotation * Math.PI / 180) * addSpd);
            gc.gameSence.addChild(b);
            this.magicBulletArray.push(b);
         }
         if(!isSecond)
         {
            setTimeout(this.explode,200,true);
         }
      }
      
      private function explodeHitCure(b:EnemyMoveBullet) : void
      {
         if(this.isDead() || !this.parent)
         {
            return;
         }
         cureHp(this.getSHp() * 0.1325 / 6);
      }
      
      private function doSkill1(direct:uint) : void
      {
         var b:SpecialEffectBullet = new SpecialEffectBullet("Monster264Bullet2");
         if(direct == 0)
         {
            b.x = this.x - 35;
         }
         else
         {
            b.x = this.x + 35;
         }
         b.y = this.y + 20;
         b.setRole(this);
         b.setDirect(direct);
         b.setAction("skill1");
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
      }
      
      private function doSkill2(direct:uint) : void
      {
         var b:SpecialEffectBullet = new SpecialEffectBullet("Monster264Bullet3");
         if(direct == 0)
         {
            b.x = this.x - 35;
         }
         else
         {
            b.x = this.x + 35;
         }
         b.y = this.y + 60;
         b.setRole(this);
         b.setDirect(direct == 1 ? 0 : 1);
         b.setAction("skill2");
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
      }
      
      private function doSkill3(direct:uint) : void
      {
         var b:SpecialEffectBullet = new SpecialEffectBullet("Monster264Bullet4");
         var mc:MovieClip = b.getImgMc();
         mc.addFrameScript(7,this.shine);
         mc.addFrameScript(22,this.shine);
         b.x = this.curAttackTarget ? this.curAttackTarget.x : this.x;
         b.y = this.curAttackTarget ? this.curAttackTarget.y : this.y;
         b.setDestroyWhenMaxHitCountLessThenZero(false);
         b.setRole(this);
         b.setDirect(direct);
         b.setAction("skill3");
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
      }
      
      private function doSkill4(direct:uint) : void
      {
         var b:SpecialEffectBullet = new SpecialEffectBullet("Monster264Bullet5");
         if(direct == 0)
         {
            b.x = this.x - 35;
         }
         else
         {
            b.x = this.x + 35;
         }
         b.y = this.y + 60;
         b.setRole(this);
         b.setDirect(direct == 1 ? 0 : 1);
         b.setAction("skill4");
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
      }
      
      private function shine() : void
      {
         var shine:Sprite = new Sprite();
         shine.graphics.beginFill(16777215,0.5);
         shine.graphics.drawRect(0,0,gc.gameSence.width,gc.gameSence.height);
         shine.graphics.endFill();
         gc.gameSence.addChild(shine);
         TweenMax.to(shine,0.3,{
            "alpha":0,
            "onComplete":function(obj:*):void
            {
               if(obj.parent)
               {
                  obj.parent.removeChild(obj);
               }
            },
            "onCompleteParams":[shine]
         });
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         return this.curAttackTarget;
      }
      
      override protected function beforeSkill2Start() : Boolean
      {
         return AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 500;
      }
      
      override protected function beforeSkill3Start() : Boolean
      {
         return true;
      }
      
      override protected function beforeSkill4Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 400;
      }
      
      override protected function releSkill1() : void
      {
         this.faceToTarget();
         this.newAttackId();
         this.setYourFather(20);
         this.setAction("skill1");
         this.lastHit = "skill1";
      }
      
      override protected function releSkill2() : void
      {
         this.faceToTarget();
         this.newAttackId();
         this.setYourFather(20);
         this.setAction("skill2");
         this.lastHit = "skill2";
      }
      
      override protected function releSkill3() : void
      {
         this.faceToTarget();
         this.newAttackId();
         this.setYourFather(20);
         this.setAction("skill3");
         this.lastHit = "skill3";
      }
      
      override protected function releSkill4() : void
      {
         this.faceToTarget();
         this.newAttackId();
         this.setYourFather(20);
         this.setAction("skill4");
         this.lastHit = "skill4";
      }
      
      override public function reduceHp(param1:int, param2:Boolean = false) : void
      {
         if(this.curAction == "hit1" || this.curAction == "skill1" || this.curAction == "skill2" || this.curAction == "skill3" || this.curAction == "skill4")
         {
            param2 = false;
            param1 *= 0.7;
         }
         super.reduceHp(param1,param2);
      }
      
      override public function setAttackBack(param1:Point) : void
      {
         if(!(this.curAction == "hit1" || this.curAction == "skill1" || this.curAction == "skill2" || this.curAction == "skill3" || this.curAction == "skill4"))
         {
            super.setAttackBack(param1);
         }
      }
      
      override public function isAttacking() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "skill1" || this.curAction == "skill2" || this.curAction == "skill3" || this.curAction == "skill4";
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
      
      override public function destroy() : void
      {
         var door:* = undefined;
         super.destroy();
         if(this.isBoss)
         {
            for each(door in gc.pWorld.getTransferDoorArray())
            {
               door.visible = true;
            }
         }
      }
   }
}

