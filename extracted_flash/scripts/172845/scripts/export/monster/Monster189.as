package export.monster
{
   import base.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   import flash.utils.*;
   import my.*;
   
   public class Monster189 extends BaseMonster
   {
      
      private var _isFenshen:Boolean = false;
      
      private var continueCount:int = 240;
      
      private var inReadyForRelive:Boolean = false;
      
      private var boundBullets:Array;
      
      public function Monster189()
      {
         this.boundBullets = [];
         super();
         this.horizenSpeed = 5;
         this.setHp(4600000);
         this.setSHp(4600000);
         this.attackRange = 250;
         this.alertRange = 1000;
         this.protectedParamsObject.mDef = 0.45;
         this.protectedParamsObject.def = 2088;
         this.protectedParamsObject.exp = 5000;
         this.protectedParamsObject.gxp = 1000;
         this.protectedParamsObject.Dodge = 10;
         this.protectedParamsObject.Toughness = 15;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":999,
            "power":7600,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":999,
            "power":7254 * 0.4,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit2_2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":24,
            "power":7254 * 0.5,
            "attackKind":"magic",
            "addEffect":[{
               "name":BaseAddEffect.STUN,
               "time":gc.frameClips * 2
            }]
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":24,
            "power":7254 * 0.7,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":24,
            "power":7254 * 0.7,
            "attackKind":"physics"
         };
         this.protectedParamsObject.fallList = [];
         this.setAction("wait");
         this.isBoss = true;
         this.monsterName = "禅妖";
         this.protectedParamsObject.probability = 0.28;
         this.fallList = [{
            "name":"wpfbyyan",
            "bigtype":"dj"
         }];
         this.skillCD1 = [gc.frameClips * 2,gc.frameClips * 7.2];
         this.skillCD2 = [gc.frameClips * 3,gc.frameClips * 16];
         this.skillCD3 = [gc.frameClips * 4,gc.frameClips * 8.1];
         this.skillCD4 = [gc.frameClips * 2.5,gc.frameClips * 6.4];
      }
      
      override protected function initBBDC() : void
      {
         var body:Object = null;
         var bmdArray:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster189");
         if(bmdArray)
         {
            body = {
               "name":"body",
               "source":bmdArray
            };
            bbdc = new BaseBitmapDataClip([body],400,300,new Point(0,0));
            bbdc.setOffsetXY(-10,-25);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8],[2,2,2,2,10],[2,4,10],[2,4,10],[2,2,7,2,2,5],[2,2]]);
            bbdc.setFrameCount([6,4,1,5,3,3,6,20]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster189--BitmapData Error!");
      }
      
      override protected function newColipse() : void
      {
         this.colipse = AUtils.getNewObj("ObjectBaseSprite2") as Sprite;
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
               if(!this.isFenshen)
               {
                  this.checkRelive();
               }
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
      
      override protected function beforeSkill1Start() : Boolean
      {
         return true;
      }
      
      override protected function beforeSkill2Start() : Boolean
      {
         return !this.isFenshen;
      }
      
      override protected function beforeSkill3Start() : Boolean
      {
         return true;
      }
      
      override protected function releSkill1() : void
      {
         this.newAttackId();
         this.setYourFather(20);
         this.setAction("hit2");
         this.lastHit = "hit2";
      }
      
      override protected function releSkill2() : void
      {
         this.newAttackId();
         this.setYourFather(24);
         this.setAction("hit3");
         this.lastHit = "hit3";
      }
      
      override protected function releSkill3() : void
      {
         this.newAttackId();
         this.setYourFather(40);
         this.setAction("hit4");
         this.lastHit = "hit4";
      }
      
      override protected function enterFrameFunc(p:Point) : void
      {
         var repeatIdx:int = 0;
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
               if(p.x == 4)
               {
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     this.doHi3(direct);
                  }
               }
               break;
            case "hit4":
               repeatIdx = int(this.bbdc.getCurKeyFrameIndex());
               if(repeatIdx == 0)
               {
                  if(p.x == 0)
                  {
                     if(this.bbdc.getCurFrameCount() == 2)
                     {
                        this.doHi4(direct);
                     }
                  }
               }
         }
      }
      
      private function doHi1(direct:uint) : void
      {
         var b:SpecialEffectBullet = new SpecialEffectBullet("Monster189Bullet1");
         if(direct == 0)
         {
            b.x = this.x - 130;
         }
         else
         {
            b.x = this.x + 130;
         }
         b.y = this.y - 100;
         b.setRole(this);
         b.setDirect(direct);
         b.setAction("hit1");
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
      }
      
      private function doHi2(direct:uint) : void
      {
         var i:* = 0;
         var tb:EnemyMoveBullet2 = null;
         var randSpeedX:Number = Number(NaN);
         var randSpeedY:Number = Number(NaN);
         var nums:int = 4 + Math.ceil(Math.random() * 2);
         i = 0;
         while(i < nums)
         {
            randSpeedX = 10 + Math.random() * 5;
            randSpeedY = 10 + Math.random() * 5;
            if(Math.random() < 0.5)
            {
               randSpeedY *= -1;
            }
            if(direct == 0)
            {
               tb = new EnemyMoveBullet2("Monster189Bullet2_1");
               tb.x = this.x - 100 + (-150 + Math.random() * 300);
            }
            else
            {
               tb = new EnemyMoveBullet2("Monster189Bullet2_1");
               tb.x = this.x + 100 - (-150 + Math.random() * 300);
            }
            tb.y = this.y - (-150 + Math.random() * 300);
            tb.setRole(this);
            tb.setDistance(2400);
            tb.setSpeed(4);
            tb.setMoveTarget(this.curAttackTarget);
            tb.setDestroyInCount(gc.frameClips * 2);
            tb.setDestroyWhenLastFrame(false);
            tb.setAction("hit2");
            tb.setFuncWhenDestroy(this.doHi2_2);
            gc.gameSence.addChild(tb);
            this.magicBulletArray.push(tb);
            this.boundBullets.push(tb);
            i++;
         }
      }
      
      private function doHi2_2(bb:BaseBullet) : void
      {
         var b:SpecialEffectBullet = new SpecialEffectBullet("Monster189Bullet2_2");
         b.x = bb.x;
         b.y = bb.y;
         b.setRole(this);
         b.setDirect(0);
         b.setAction("hit2_2");
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
         this.boundBullets.splice(this.boundBullets.indexOf(bb),1);
      }
      
      private function doHi3(direct:uint) : void
      {
         var i:* = 0;
         var mon:Monster189 = null;
         var num:int = 1;
         i = 0;
         while(i < num)
         {
            mon = MainGame.getInstance().createMonster(189,this.x,this.y) as Monster189;
            mon.isFenshen = true;
            mon.setSHp(this.getSHp() * 0.36);
            mon.setHp(this.getSHp() * 0.36);
            i++;
         }
         this.setYourFather(gc.frameClips * 2.5);
      }
      
      private function doHi4(direct:uint) : void
      {
         var bh:BaseHero = null;
         var playerArray:Array = gc.getPlayerArray();
         if(playerArray.length > 0)
         {
            bh = playerArray[0] as BaseHero;
            if(Math.random < 0.5)
            {
               this.x = bh.x - 80;
            }
            else
            {
               this.x = bh.x + 80;
            }
            this.y = bh.y - 120;
            this.curAttackTarget = bh;
            this.faceToTarget();
         }
         var b:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster189Bullet3");
         direct = uint(this.bbdc.getDirect());
         if(direct == 0)
         {
            b.x = this.x - 190;
         }
         else
         {
            b.x = this.x + 190;
         }
         b.y = this.y - 140;
         b.setHurtCanCutDownEffect(false);
         b.setDestroyWhenLastFrame(false);
         b.setDestroyInCount(40);
         b.setRole(this);
         b.setDirect(direct);
         b.setAction("hit4");
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
      }
      
      override protected function exitFrameFunc(p:Point) : void
      {
      }
      
      override public function isAttacking() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3" || this.curAction == "hit4";
      }
      
      override protected function myIntelligence() : void
      {
         if(!this.isBeAttacking())
         {
            super.myIntelligence();
         }
         if(this.isFenshen)
         {
            if(this.continueCount > 0)
            {
               --this.continueCount;
               if(this.continueCount == 0)
               {
                  this.destroy();
               }
            }
         }
      }
      
      private function checkRelive() : void
      {
         if(this.isDead())
         {
            if(this.boundBullets.length > 0)
            {
               this.inReadyForRelive = true;
               setTimeout(function(_self:Monster189):*
               {
                  MainGame.getInstance().createMonster(189,_self.x,_self.y);
               },500,this);
            }
         }
      }
      
      override public function destroy() : void
      {
         var ta:Array = null;
         var i:int = 0;
         var mc:MovieClip = null;
         super.destroy();
         this.boundBullets = null;
         if(!this.inReadyForRelive && !this.isFenshen && this.isBoss)
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
      
      public function get isFenshen() : Boolean
      {
         return this._isFenshen;
      }
      
      public function set isFenshen(value:Boolean) : void
      {
         this._isFenshen = value;
         if(this.isFenshen)
         {
            this.isBoss = false;
            this.monsterName = "";
            this.protectedParamsObject.fallList = [];
         }
      }
      
      override public function fallEquip() : void
      {
         if(!this.isFenshen)
         {
            super.fallEquip();
         }
      }
   }
}

