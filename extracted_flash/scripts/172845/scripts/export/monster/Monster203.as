package export.monster
{
   import base.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.events.Event;
   import flash.geom.*;
   import my.*;
   
   public class Monster203 extends BaseMonster
   {
      
      private var _m203Arr:Array;
      
      private var isfenshen:Boolean = false;
      
      public function Monster203()
      {
         this._m203Arr = [];
         super();
         this.normalAttackRate = 0.8;
         this.horizenSpeed = 4.5;
         this.setHp(4000000);
         this.setSHp(4000000);
         this.attackRange = 250;
         this.alertRange = 1000;
         this.protectedParamsObject.def = 2093;
         this.protectedParamsObject.exp = 5000;
         this.protectedParamsObject.gxp = 2000;
         this.protectedParamsObject.mDef = 0.45;
         this.protectedParamsObject.Dodge = 10;
         this.protectedParamsObject.Toughness = 15;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-6,-5],
            "attackInterval":999,
            "power":8152,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-3,0],
            "attackInterval":999,
            "power":8395,
            "attackKind":"magic",
            "addEffect":[{
               "name":BaseAddEffect.MONSTER203_BUFF,
               "time":gc.frameClips * 3,
               "hurt":1000
            }]
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-10,0],
            "attackInterval":5,
            "power":8395 * 0.15,
            "attackKind":"magic",
            "addEffect":[{
               "name":BaseAddEffect.STUN,
               "time":gc.frameClips * 2
            }]
         };
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-13,0],
            "attackInterval":10,
            "power":8395 * 0.4,
            "attackKind":"magic"
         };
         this.isBoss = true;
         this.monsterName = "千年蜈蚣";
         this.setAction("wait");
         this.protectedParamsObject.probability = 0.26;
         this.fallList = [{
            "name":"wpfbtc",
            "bigtype":"dj"
         }];
         this.skillCD1 = [gc.frameClips * 2,gc.frameClips * 6.4];
         this.skillCD2 = [gc.frameClips * 3,gc.frameClips * 7.2];
         this.skillCD3 = [gc.frameClips * 4,gc.frameClips * 8.1];
         this.skillCD4 = [gc.frameClips * 2.5,gc.frameClips * 6.4];
      }
      
      override protected function initBBDC() : void
      {
         var body:Object = null;
         var bmdArray:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster203");
         if(bmdArray)
         {
            body = {
               "name":"body",
               "source":bmdArray
            };
            bbdc = new BaseBitmapDataClip([body],370,300,new Point(0,0));
            bbdc.setOffsetXY(0,-35);
            bbdc.setFrameStopCount([[3,3,3,3,3,3],[4,4,4,4],[8],[2,2,2,2,2,10],[2,2,10],[3,3],[30],[2,10]]);
            bbdc.setFrameCount([6,4,1,6,3,8,1,2]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster203--BitmapData Error!");
      }
      
      public function setIsFenshen() : void
      {
         this.isBoss = false;
         this.isfenshen = true;
         this.protectedParamsObject.fallList = [];
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
               if(p.x == 0)
               {
                  if(this.bbdc.getCurFrameCount() == 3)
                  {
                     this.doHi2_1(direct);
                     this.doHi2_2(direct);
                  }
               }
               break;
            case "hit3":
               if(p.x == 0)
               {
                  if(this.bbdc.getCurFrameCount() == 30)
                  {
                     this.doHi3(direct);
                  }
               }
               if(direct == 0)
               {
                  this.speed.x = -20;
               }
               else
               {
                  this.speed.x = 20;
               }
               break;
            case "hit4":
               if(p.x == 1)
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
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 600;
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
         this.setYourFather(10);
         this.setAction("hit3");
         this.lastHit = "hit3";
      }
      
      override protected function releSkill3() : void
      {
         this.newAttackId();
         this.faceToTarget();
         this.setYourFather(35);
         this.setAction("hit4");
         this.lastHit = "hit4";
      }
      
      private function doHi1(direct:uint) : void
      {
         var b:SpecialEffectBullet = new SpecialEffectBullet("Monster203Bullet1");
         if(direct == 0)
         {
            b.x = this.x - 170;
         }
         else
         {
            b.x = this.x + 170;
         }
         b.y = this.y - 20;
         b.setRole(this);
         b.setDirect(direct);
         b.setAction("hit1");
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
      }
      
      private function doHi2_1(direct:uint) : void
      {
         var b:SpecialEffectBullet = new SpecialEffectBullet("Monster203Bullet2_1");
         if(direct == 0)
         {
            b.x = this.x - 250;
         }
         else
         {
            b.x = this.x + 250;
         }
         b.y = this.y - 50;
         b.setRole(this);
         b.setDirect(direct);
         b.setAction("hit2");
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
      }
      
      private function doHi2_2(direct:uint) : void
      {
         var b:SpecialEffectBullet = new SpecialEffectBullet("Monster203Bullet2_2");
         if(direct == 0)
         {
            b.x = this.x - 100;
         }
         else
         {
            b.x = this.x + 100;
         }
         b.y = this.y + 30;
         b.setRole(this);
         b.setDirect(direct);
         b.setAction("hit2");
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
      }
      
      private function doHi3(direct:uint) : void
      {
         var b:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster203Bullet3");
         if(direct == 0)
         {
            b.x = this.x - 0;
         }
         else
         {
            b.x = this.x + 0;
         }
         b.y = this.y - 0;
         b.visible = false;
         b.setHurtCanCutDownEffect(false);
         b.setDestroyWhenLastFrame(false);
         b.setDestroyInCount(30);
         b.setRole(this);
         b.setDirect(direct);
         b.setAction("hit3");
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
      }
      
      private function doHi4(direct:uint) : void
      {
         var b:SpecialEffectBullet = new SpecialEffectBullet("Monster203Bullet4");
         if(direct == 0)
         {
            b.x = this.x - 50;
         }
         else
         {
            b.x = this.x + 50;
         }
         b.y = this.y + 30;
         b.setRole(this);
         b.setDirect(direct);
         b.setAction("hit4");
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
      }
      
      override public function reduceHp(re:int, canHurt:Boolean = false) : void
      {
         var b:FollowBaseObjectBullet = null;
         var self:Monster203 = null;
         var m203:Monster203 = null;
         if(this.getHp() <= re)
         {
            if(this.curAddEffect)
            {
               if(!this.curAddEffect.isAnyThingElseStun(""))
               {
                  b = new FollowBaseObjectBullet("HeroReLive");
                  b.x = this.x;
                  b.y = this.y;
                  b.setRole(this);
                  b.setDirect(0);
                  b.setDisable();
                  b.setAction("relive");
                  gc.gameSence.addChild(b);
                  this.magicBulletArray.push(b);
                  this.setHp(this.getSHp());
                  if(!this.isfenshen)
                  {
                     if(this._m203Arr.length < 4)
                     {
                        self = this;
                        m203 = MainGame.getInstance().createMonster(203,this.x,this.y) as Monster203;
                        m203.setIsFenshen();
                        m203.addEventListener("monsterdestroy",function(e:Event):*
                        {
                           m203.removeEventListener("monsterdestroy",arguments.callee);
                           self._m203Arr.splice(self._m203Arr.indexOf(m203),1);
                        });
                        this._m203Arr.push(m203);
                     }
                  }
                  return;
               }
            }
         }
         super.reduceHp(re,canHurt);
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
      
      override public function isCanMoveWhenAttack() : Boolean
      {
         return this.curAction == "hit3";
      }
      
      override public function destroy() : void
      {
         var m203:* = undefined;
         var ta:Array = null;
         var i:int = 0;
         var mc:MovieClip = null;
         if(this.getHp() <= 0)
         {
            for each(m203 in this._m203Arr)
            {
               m203.destroy();
            }
            this._m203Arr = null;
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
         super.destroy();
      }
   }
}

