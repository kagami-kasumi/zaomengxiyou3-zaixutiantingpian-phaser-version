package export.monster
{
   import base.*;
   import com.greensock.*;
   import com.hexagonstar.util.debug.*;
   import config.*;
   import export.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.events.*;
   import flash.filters.*;
   import flash.geom.*;
   import flash.text.*;
   import flash.utils.*;
   import gameEngine.utils.*;
   import manager.*;
   import my.*;
   import user.*;
   
   public class Monster11111 extends BaseMonster
   {
      
      private var curtime:int;
      
      private var lasttime:int;
      
      private var timer:Timer;
      
      private var hurtusetime:int;
      
      private var the_DPS:Number;
      
      private var Tips:TextField;
      
      private var ziti:TextFormat;
      
      private var startX:int = 500;
      
      private var startY:int = 200;
      
      public function Monster11111()
      {
         this.Tips = new TextField();
         this.ziti = new TextFormat();
         this.ziti.bold = true;
         this.ziti.size = 24;
         this.ziti.color = 12779520;
         this.Tips.defaultTextFormat = this.ziti;
         this.Tips.textColor = 12779520;
         this.Tips.text = "造成总伤害:" + this.totalhurt + "," + "用时:" + (this.hurtusetime / 1000).toFixed(1) + "s" + "," + "DPS:" + this.the_DPS;
         this.Tips.width = this.Tips.textWidth + 10;
         this.Tips.x = -this.Tips.width / 2;
         this.Tips.y = -130;
         this.addChild(this.Tips);
         this.totalhurt = 0;
         super();
         this.horizenSpeed = 0;
         this.setHp(111111111);
         this.setSHp(111111111);
         this.protectedParamsObject.mysee = 300;
         this.protectedParamsObject.isattback = 50;
         this.protectedParamsObject.rehp = 11111111;
         this.attackRange = 250;
         this.alertRange = 1000;
         this.normalAttackRate = 0.567;
         this.protectedParamsObject.def = 0;
         this.protectedParamsObject.mDef = 0;
         this.protectedParamsObject.exp = 0;
         this.protectedParamsObject.gxp = 0;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":24,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[2,-4],
            "attackInterval":4,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":24,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":4,
            "attackKind":"magic"
         };
         this.isBoss = true;
         this.monsterName = "汪汪";
         this.setAction("wait");
         this.protectedParamsObject.probability = 0;
         this.fallList = [{}];
         this.skillCD1 = [gc.frameClips * 8,gc.frameClips * 12];
         this.skillCD2 = [gc.frameClips * 8,gc.frameClips * 12];
         this.skillCD3 = [gc.frameClips * 8,gc.frameClips * 12];
         this.totalhurt = 0;
      }
      
      override protected function initBBDC() : void
      {
         this.totalhurt = 0;
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster1111");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],167,129,new Point(0,0));
            bbdc.setOffsetXY(0,10);
            bbdc.setFrameStopCount([[5,5,5,5,5,5,5],[2,2,2,3,2,4],[6,6,6,6,6,6,6,6,6,6],[4,4,4,4,4,4,4,4],[5,5,5,5,5,5,5],[9],[6,3,3,2,13],[9,10,4,4,4,4,4,4,4,4]]);
            bbdc.setFrameCount([7,6,10,8,7,1,5,10]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster1111--BitmapData Error!");
      }
      
      override protected function newColipse() : void
      {
         this.colipse = AUtils.getNewObj("ObjectBaseSprite5") as Sprite;
         this.colipse.visible = false;
         this.addChild(this.colipse);
      }
      
      override public function setAction(param1:String) : void
      {
         super.setAction(param1);
         var _loc2_:Point = this.bbdc.getCurPoint();
         switch(param1)
         {
            case "wait":
               if(_loc2_.y != 1)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(1);
               }
               this.bbdc.setState(param1);
               break;
            case "walk":
               if(_loc2_.y != 1)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(1);
               }
               this.bbdc.setState(param1);
               break;
            case "hurt":
               if(_loc2_.y != 5)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(5);
               }
               this.bbdc.setState(param1);
               break;
            case "hit1":
               if(_loc2_.y != 1)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(1);
               }
               this.bbdc.setState(param1);
               break;
            case "hit2":
               if(_loc2_.y != 1)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(1);
               }
               this.bbdc.setState(param1);
               break;
            case "hit3":
               if(_loc2_.y != 1)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(1);
               }
               this.bbdc.setState(param1);
               break;
            case "hit4":
               if(_loc2_.y != 1)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(1);
               }
               this.bbdc.setState(param1);
               break;
            case "dead":
               if(_loc2_.y != 6)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(6);
               }
               this.bbdc.setState(param1);
         }
      }
      
      override protected function scriptFrameOverFunc(param1:int) : void
      {
         var _loc2_:String = String(this.bbdc.getState());
         switch(_loc2_)
         {
            case "wait":
               this.bbdc.setFramePointX(0);
               break;
            case "walk":
               this.bbdc.setFramePointX(0);
               this.setAction("wait");
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
      
      override protected function enterFrameFunc(param1:Point) : void
      {
         var _loc2_:String = String(this.bbdc.getState());
         var _loc3_:uint = uint(this.getBBDC().getDirect());
         switch(_loc2_)
         {
            case "hit1":
               if(param1.x == 0)
               {
                  if(this.bbdc.getCurFrameCount() == 9)
                  {
                     this.doHit1(_loc3_);
                  }
                  break;
               }
            case "hit2":
               if(param1.x == 0)
               {
                  if(this.bbdc.getCurFrameCount() == 4)
                  {
                     this.doHit2(_loc3_);
                  }
               }
               break;
            case "hit3":
               if(param1.x == 0)
               {
                  if(this.bbdc.getCurFrameCount() == 5)
                  {
                     this.doHit3(_loc3_);
                  }
                  if(_loc3_ == 0)
                  {
                     this.speed.x = -12;
                     break;
                  }
                  this.speed.x = 12;
               }
               break;
            case "hit4":
               if(param1.x == 0)
               {
                  if(this.bbdc.getCurFrameCount() == 6)
                  {
                     this.doHit4(_loc3_);
                  }
               }
         }
      }
      
      override public function reduceHp(param1:int, param2:Boolean = false) : void
      {
         this.totalhurt += Math.round(param1);
         this.curtime = getTimer();
         if(this.timer)
         {
            this.timer.stop();
            this.timer.removeEventListener(TimerEvent.TIMER_COMPLETE,this.removeTimer);
            this.hurtusetime += this.curtime - this.lasttime;
            this.timer = null;
         }
         else
         {
            this.hurtusetime += 1000;
         }
         this.timer = new Timer(3000,1);
         this.timer.addEventListener(TimerEvent.TIMER_COMPLETE,this.removeTimer);
         this.timer.start();
         this.updateData();
         this.lasttime = this.curtime;
         super.reduceHp(param1,param2);
      }
      
      private function removeTimer(event:TimerEvent) : void
      {
         this.timer.stop();
         this.timer.removeEventListener(TimerEvent.TIMER_COMPLETE,this.removeTimer);
         this.timer = null;
         this.hurtusetime = 0;
         this.totalhurt = 0;
         this.the_DPS = 0;
         this.updateData();
      }
      
      private function updateData() : void
      {
         if(this.hurtusetime == 1000)
         {
            this.the_DPS = Number((this.totalhurt / (this.hurtusetime / 1000)).toFixed(2));
         }
         else
         {
            this.the_DPS = Number((this.totalhurt / (this.hurtusetime / 1000) - 0.5).toFixed(2));
         }
         this.Tips.text = "造成总伤害:" + this.totalhurt + "," + "用时:" + (this.hurtusetime / 1000).toFixed(1) + "s" + "," + "DPS:" + this.the_DPS;
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 200;
      }
      
      override protected function beforeSkill2Start() : Boolean
      {
         return this.curAttackTarget;
      }
      
      override protected function beforeSkill3Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) > 300;
      }
      
      override protected function releSkill1() : void
      {
         this.faceToTarget();
         this.newAttackId();
         this.setAction("hit2");
         this.lastHit = "hit2";
      }
      
      override protected function releSkill2() : void
      {
         this.faceToTarget();
         this.newAttackId();
         this.setAction("hit3");
         this.lastHit = "hit3";
      }
      
      override protected function releSkill3() : void
      {
         this.faceToTarget();
         this.newAttackId();
         this.setAction("hit4");
         this.lastHit = "hit4";
      }
      
      private function doHit1(param1:uint) : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster1111Bullet4");
         _loc2_.x = this.x;
         _loc2_.y = this.y;
         _loc2_.setRole(this);
         _loc2_.setDirect(0);
         _loc2_.setAction("hit4");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHit2(param1:uint) : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster1111Bullet2");
         _loc2_.x = this.x;
         _loc2_.y = this.y + 50;
         _loc2_.setRole(this);
         _loc2_.setDirect(0);
         _loc2_.setAction("hit2");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHit3(param1:uint) : void
      {
         this.doSingleHit3(param1,5,0);
      }
      
      private function doSingleHit3(param1:int, param2:int, param3:int) : void
      {
         var direct:int = 0;
         var count:int = 0;
         var index:int = 0;
         var b:SpecialEffectBullet = null;
         direct = param1;
         count = param2;
         index = param3;
         if(count > 0)
         {
            b = new SpecialEffectBullet("Monster1111Bullet3");
            if(direct == 0)
            {
               b.x = this.x - index * 15;
            }
            else
            {
               b.x = this.x + index * 15;
            }
            b.y = this.y + 70;
            b.setRole(this);
            b.setDirect(direct);
            b.setAction("hit3");
            gc.gameSence.addChild(b);
            this.magicBulletArray.push(b);
            count = Number(count) - 1;
            index = Number(index) + 1;
            setTimeout(function(param1:Monster1111):*
            {
               if(!param1.isDead())
               {
                  param1.doSingleHit3(direct,count,index);
               }
            },300,this);
         }
      }
      
      private function doHit4(param1:uint) : void
      {
         var _loc2_:int = 0;
         var _loc3_:* = null;
         var _loc4_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster1111Bullet1");
         if(param1 == 0)
         {
            _loc4_.x = this.x + 10;
         }
         else
         {
            _loc4_.x = this.x - 10;
         }
         _loc4_.y = this.y + 70;
         _loc4_.setDisable();
         _loc4_.setRole(this);
         _loc4_.setDirect(0);
         _loc4_.setAction("wait");
         gc.gameSence.addChild(_loc4_);
         this.magicBulletArray.push(_loc4_);
         while(_loc2_ < gc.getPlayerArray().length)
         {
            _loc3_ = gc.getPlayerArray()[_loc2_] as BaseHero;
            if(_loc3_.isDead())
            {
            }
            TweenMax.to(_loc3_,2,{
               "x":this.x,
               "y":this.y
            });
            _loc2_++;
         }
      }
      
      override public function step() : void
      {
         super.step();
         this.Tips.width = this.Tips.textWidth + 10;
         this.Tips.x = -this.Tips.width / 2;
         this.Tips.y = -130;
         if(this.x > 880)
         {
            this.x = 880;
         }
         if(this.x < 36)
         {
            this.x = 36;
         }
      }
      
      override public function isCanMoveWhenAttack() : Boolean
      {
         return this.curAction == "hit3";
      }
      
      override public function isAttacking() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3" || this.curAction == "hit4";
      }
      
      override protected function exitFrameFunc(param1:Point) : void
      {
      }
      
      override protected function myIntelligence() : void
      {
         if(!this.isBeAttacking())
         {
            return;
         }
      }
      
      override public function destroy() : void
      {
         super.destroy();
      }
   }
}

