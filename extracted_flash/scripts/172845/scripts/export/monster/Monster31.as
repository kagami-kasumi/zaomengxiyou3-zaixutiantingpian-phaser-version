package export.monster
{
   import base.*;
   import com.greensock.*;
   import export.bullet.*;
   import export.hero.*;
   import flash.display.*;
   import flash.geom.*;
   import flash.utils.*;
   import manager.*;
   import my.*;
   
   public class Monster31 extends BaseMonster
   {
      
      public var role2Shalldow:Role2Shadow;
      
      private var gxpCount:uint = 0;
      
      public function Monster31()
      {
         super();
         this.horizenSpeed = 5.5;
         this.setHp(110950 + 0.6 * (gc.hero1.roleProperies.getSMMP() + gc.hero1.roleProperies.getSHHP()));
         this.setSHp(110950 + 0.6 * (gc.hero1.roleProperies.getSMMP() + gc.hero1.roleProperies.getSHHP()));
         this.protectedParamsObject.mysee = 300;
         this.protectedParamsObject.isattback = 50;
         this.attackRange = 250;
         this.alertRange = 1000;
         this.protectedParamsObject.def = 306;
         this.protectedParamsObject.mDef = 0.35;
         this.normalAttackRate = 0.8;
         this.gxpCount = 150;
         this.protectedParamsObject.exp = 500;
         this.protectedParamsObject.gxp = 1000;
         var _loc1_:int = 1137;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":12,
            "attackBackSpeed":[-2,-3],
            "attackInterval":999,
            "power":_loc1_,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[-10,-1],
            "attackInterval":4,
            "power":_loc1_ * 0.3,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":20,
            "attackBackSpeed":[-7,-4],
            "attackInterval":999,
            "power":_loc1_ * 0.8,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[-8,-3],
            "attackInterval":999,
            "power":_loc1_ * 1.3,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit5"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[-15,-2],
            "attackInterval":48,
            "power":_loc1_ * 0.9,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit6"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-14,-25],
            "attackInterval":999,
            "power":_loc1_ * 1,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit7"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-15,0],
            "attackInterval":5,
            "power":_loc1_ * 0.25,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit8"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[-8,-2],
            "attackInterval":12,
            "power":_loc1_ * 0.2,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit9_1"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[0,-2],
            "attackInterval":999,
            "power":_loc1_ * 1,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit9_2"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[-8,-2],
            "attackInterval":8,
            "power":_loc1_ * 0.33,
            "attackKind":"magic"
         };
         this.isBoss = true;
         this.monsterName = "邪.唐僧";
         this.setAction("wait");
         this.protectedParamsObject.probability = 0.3;
         this.fallList = [{
            "name":"wpqhs2",
            "bigtype":"dj"
         },{
            "name":"lssp_1",
            "bigtype":"dj"
         },{
            "name":"lssp_2",
            "bigtype":"dj"
         },{
            "name":"lssp_3",
            "bigtype":"dj"
         },{
            "name":"lssp_4",
            "bigtype":"dj"
         },{
            "name":"lssp_5",
            "bigtype":"dj"
         }];
         this.skillCD1 = [gc.frameClips * 4,gc.frameClips * 5];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster31");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],200,200,new Point(0,0));
            bbdc.setOffsetXY(15,0);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[2,2,2,14],[4,4,4,4],[2,2,2,2],[1,1,30,55,15],[2,2,2,2,2],[2,4,12],[2,10,2,40],[2,2],[2,2,6],[10,2,15],[2,2,20],[2,2,10]]);
            bbdc.setFrameCount([36,4,4,4,[1,1,1,1,1,1],5,3,4,24,3,3,3,3]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster31--BitmapData Error!");
      }
      
      override protected function newColipse() : void
      {
         this.colipse = AUtils.getNewObj("ObjectBaseSprite") as Sprite;
         this.colipse.visible = false;
         this.addChild(this.colipse);
      }
      
      override public function setAction(param1:String) : void
      {
         var curPoint:Point = null;
         var str:String = param1;
         super.setAction(str);
         curPoint = this.bbdc.getCurPoint();
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
            case "wait2":
               if(curPoint.y != 1)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(1);
               }
               this.bbdc.setState(str);
               break;
            case "walk":
               this.setAction("run");
               break;
            case "run":
               if(curPoint.y != 3)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(3);
               }
               this.bbdc.setState(str);
               break;
            case "jump1":
               if(curPoint.x != 0 || curPoint.y != 4)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(str);
               break;
            case "jump2":
               if(curPoint.y != 5)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(5);
               }
               this.bbdc.setState(str);
               break;
            case "jump3":
               if(curPoint.x != 1 || curPoint.y != 4)
               {
                  this.bbdc.setFramePointX(1);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(str);
               break;
            case "hit1":
               if(curPoint.y != 6)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(6);
               }
               this.bbdc.setState(str);
               break;
            case "hit3":
               if(curPoint.y != 7)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(7);
               }
               this.bbdc.setState(str);
               break;
            case "hit4_1":
               if(curPoint.y != 8)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(8);
               }
               this.bbdc.setState(str);
               break;
            case "hit4_2":
               if(curPoint.y != 9)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(9);
               }
               this.bbdc.setState(str);
               break;
            case "hit5":
               if(curPoint.y != 10)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(10);
               }
               this.bbdc.setState(str);
               break;
            case "hit6":
               if(curPoint.y != 11)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(11);
               }
               this.bbdc.setState(str);
               break;
            case "hit7":
               if(curPoint.x != 0 || curPoint.y != 12)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(12);
               }
               this.bbdc.setState(str);
               break;
            case "hit8":
               if(curPoint.x != 2 || curPoint.y != 4)
               {
                  this.bbdc.setFramePointX(2);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(str);
               break;
            case "hit9":
               if(curPoint.x != 3 || curPoint.y != 4)
               {
                  this.bbdc.setFramePointX(3);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(str);
               break;
            case "hit10":
               this.doHit10(this.getBBDC().getDirect(),new Point(this.x,this.y - 10));
               break;
            case "hurt":
               if(curPoint.x == 4 && curPoint.y == 4)
               {
                  this.getBBDC().resetCurFrameStopCount();
               }
               else
               {
                  this.bbdc.setFramePointX(4);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(str);
               break;
            case "dead":
               this.setStatic();
               TweenMax.to(this,1,{
                  "alpha":0,
                  "onComplete":function(param1:BaseMonster):*
                  {
                     param1.dropAura();
                     param1.destroy();
                  },
                  "onCompleteParams":[this]
               });
         }
      }
      
      override protected function scriptFrameOverFunc(param1:int) : void
      {
         var _loc2_:String = this.bbdc.getState();
         switch(_loc2_)
         {
            case "walk":
               this.bbdc.setFramePointX(0);
               break;
            case "run":
               this.bbdc.setFramePointX(0);
               break;
            case "wait":
               this.setAction("wait2");
               break;
            case "wait2":
               this.setAction("wait");
               break;
            case "jump1":
               this.bbdc.setFramePointX(0);
               break;
            case "jump2":
               this.setAction("jump3");
               break;
            case "jump3":
               this.bbdc.setFramePointX(1);
               break;
            case "hit1":
               this.setAction("wait");
               break;
            case "hit3":
               this.resetGraity();
               if(!this.isInSky())
               {
                  this.setAction("wait");
                  break;
               }
               this.setAction("jump3");
               break;
            case "hit4_1":
               if(!this.isInSky())
               {
                  this.setAction("wait");
                  break;
               }
               this.setAction("jump3");
               break;
            case "hit4_2":
               if(!this.isInSky())
               {
                  this.setAction("wait");
                  break;
               }
               this.setAction("jump3");
               break;
            case "hit5":
               this.setAction("wait");
               break;
            case "hit6":
               if(!this.isInSky())
               {
                  this.setAction("wait");
                  break;
               }
               this.setAction("jump3");
               break;
            case "hit7":
               this.setStatic();
               if(!this.isInSky())
               {
                  this.setAction("wait");
                  break;
               }
               this.setAction("jump3");
               break;
            case "hit8":
               if(!this.isInSky())
               {
                  this.setAction("wait");
                  break;
               }
               this.setAction("jump3");
               break;
            case "hit9":
               this.resetGraity();
               if(!this.isInSky())
               {
                  this.setAction("wait");
                  break;
               }
               this.setAction("jump3");
               break;
            case "hurt":
               this.resetGraity();
               this.setStatic();
               this.setAction("wait");
         }
      }
      
      override protected function enterFrameFunc(param1:Point) : void
      {
         var _loc2_:String = this.bbdc.getState();
         var _loc3_:Point = new Point();
         switch(_loc2_)
         {
            case "hit1":
               if(this.bbdc.getCurFrameCount() == 12)
               {
                  if(param1.x == 2)
                  {
                     if(this.bbdc.getDirect() == 0)
                     {
                        _loc3_.x = this.x - 50;
                     }
                     else
                     {
                        _loc3_.x = this.x + 50;
                     }
                     _loc3_.y = this.y + 10;
                     if(Math.random() <= 0.5)
                     {
                        this.doHit2(this.getBBDC().getDirect(),_loc3_);
                        break;
                     }
                     this.doHit1(this.getBBDC().getDirect(),_loc3_);
                  }
               }
               break;
            case "hit3":
               if(this.bbdc.getCurFrameCount() == 2)
               {
                  if(param1.x == 2)
                  {
                     if(this.bbdc.getDirect() == 0)
                     {
                        _loc3_.x = this.x;
                     }
                     else
                     {
                        _loc3_.x = this.x;
                     }
                     _loc3_.y = this.y + 10;
                     this.doHit3(this.getBBDC().getDirect(),_loc3_);
                  }
               }
               if(param1.x == 3)
               {
                  if(this.bbdc.getCurFrameCount() >= 20 && this.bbdc.getCurFrameCount() % 8 == 0)
                  {
                     gc.vControllor.shake(25);
                  }
               }
               if(param1.x == 0)
               {
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     if(this.role2Shalldow)
                     {
                        this.role2Shalldow.setAction("hit1");
                     }
                  }
               }
               this.speed.y = 0;
               break;
            case "hit4_1":
               this.speed.y = -4;
               break;
            case "hit4_2":
               if(this.bbdc.getCurFrameCount() == 6)
               {
                  if(param1.x == 2)
                  {
                     this.doHit4_2(this.getBBDC().getDirect(),_loc3_);
                  }
               }
               this.speed.y = 0;
               break;
            case "hit5":
               if(this.bbdc.getCurFrameCount() == 15)
               {
                  if(param1.x == 2)
                  {
                     if(this.bbdc.getDirect() == 0)
                     {
                        _loc3_.x = this.x - 175;
                     }
                     else
                     {
                        _loc3_.x = this.x + 175;
                     }
                     _loc3_.y = this.y - 110;
                     this.doHit5(this.getBBDC().getDirect(),_loc3_);
                  }
               }
               break;
            case "hit6":
               if(this.bbdc.getCurFrameCount() == 20)
               {
                  if(param1.x == 2)
                  {
                     if(this.bbdc.getDirect() == 0)
                     {
                        _loc3_.x = this.x;
                     }
                     else
                     {
                        _loc3_.x = this.x;
                     }
                     _loc3_.y = this.y - 25;
                     this.doHit6(this.getBBDC().getDirect(),_loc3_);
                  }
               }
               if(param1.x == 0)
               {
                  if(this.bbdc.getCurFrameCount() == 20)
                  {
                     if(this.role2Shalldow)
                     {
                        this.role2Shalldow.setAction("hit2");
                     }
                  }
               }
               break;
            case "hit7":
               if(this.bbdc.getCurFrameCount() == 10)
               {
                  if(param1.x == 2)
                  {
                     if(this.getBBDC().getDirect() == 0)
                     {
                        _loc3_.x = this.x - 210;
                     }
                     else
                     {
                        _loc3_.x = this.x + 210;
                     }
                     _loc3_.y = this.y + 30;
                     this.doHit7(this.getBBDC().getDirect(),_loc3_);
                  }
               }
               break;
            case "hit8":
               if(param1.x == 2)
               {
                  if(this.bbdc.getCurFrameCount() == 30)
                  {
                     if(this.bbdc.getDirect() == 0)
                     {
                        _loc3_.x = this.x + 5;
                     }
                     else
                     {
                        _loc3_.x = this.x - 5;
                     }
                     _loc3_.y = this.y - 60;
                     this.doHit8(this.getBBDC().getDirect(),_loc3_);
                  }
               }
               if(param1.x == 2)
               {
                  if(this.bbdc.getCurFrameCount() == 30)
                  {
                     if(this.role2Shalldow)
                     {
                        this.role2Shalldow.setAction("hit3");
                     }
                  }
               }
               this.speed.y = 0;
               break;
            case "hit9":
               if(this.bbdc.getCurFrameCount() == 55)
               {
                  if(param1.x == 3)
                  {
                     if(this.bbdc.getDirect() == 0)
                     {
                        _loc3_.x = this.x - 20;
                     }
                     else
                     {
                        _loc3_.x = this.x + 20;
                     }
                     _loc3_.y = this.y - 20;
                     this.doHit9_1(this.getBBDC().getDirect(),_loc3_);
                  }
               }
               else if(this.bbdc.getCurFrameCount() == 45)
               {
                  if(param1.x == 3)
                  {
                     if(this.bbdc.getDirect() == 0)
                     {
                        _loc3_.x = this.x - 150;
                     }
                     else
                     {
                        _loc3_.x = this.x + 150;
                     }
                     _loc3_.y = this.y - 150;
                     this.doHit9_2(this.getBBDC().getDirect(),_loc3_);
                  }
               }
               if(param1.x == 3)
               {
                  if(this.bbdc.getCurFrameCount() == 55)
                  {
                     if(this.role2Shalldow)
                     {
                        this.role2Shalldow.setAction("hit4");
                     }
                  }
               }
         }
      }
      
      private function doHit1(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role2_hit1");
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("Role2Bullet1");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit1");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit2(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role2_hit2");
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("Role2Bullet2");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit2");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      public function doHit3(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role2_hit3");
         this.setStatic();
         this.setLostGraity();
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("Role2Bullet3");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setHurtCanCutDownEffect(false);
         _loc3_.setAction("hit3");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit4_1(param1:uint, param2:Point) : void
      {
         var _loc3_:EnemyMoveBullet = new EnemyMoveBullet("Role2Bullet4_1");
         _loc3_.name = "Role1Bullet4_1";
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         if(param1 == 0)
         {
            _loc3_.setSpeed(-10);
         }
         else
         {
            _loc3_.setSpeed(10);
         }
         _loc3_.setDistance(9999);
         _loc3_.setHurtCanCutDownEffect(true);
         _loc3_.setRole(this);
         _loc3_.setDisable();
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit4");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit4_2(param1:uint, param2:Point) : void
      {
         var b:SpecialEffectBullet = null;
         var direct:uint = param1;
         var p:Point = param2;
         SoundManager.play("Role2_hit4");
         b = new SpecialEffectBullet("Role2Bullet4_2");
         b.x = this.curAttackTarget.x;
         b.y = 100;
         b.setRole(this);
         b.setDirect(direct);
         b.setAction("hit4");
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
         TweenMax.delayedCall(0.75,function(param1:*):*
         {
            param1.resetGraity();
            gc.vControllor.shake(20);
         },[this]);
      }
      
      private function doHit5(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role2_hit5");
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("Role2Bullet5");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit5");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      public function doHit6(param1:uint, param2:Point) : void
      {
         var b:SpecialEffectBullet = null;
         var idx:uint = 0;
         var direct:uint = param1;
         var p:Point = param2;
         SoundManager.play("Role2_hit6");
         b = new SpecialEffectBullet("Role2Bullet6");
         b.x = p.x;
         b.y = p.y;
         b.setRole(this);
         b.setDisable();
         b.setDirect(direct);
         b.setAction("hit6");
         idx = uint(gc.gameSence.getChildIndex(this));
         gc.gameSence.addChildAt(b,idx);
         this.magicBulletArray.push(b);
         TweenMax.delayedCall(0.9,function(param1:BaseBullet, param2:Monster31):*
         {
            var _loc3_:Array = gc.getPlayerArray();
            if(AUtils.GetDisBetweenTwoObj(param2,param1) < 100)
            {
               param2.addCurAddEffect([{
                  "name":BaseAddEffect.SLOWLY_ADDHP,
                  "value":0.5 * param2.getRealPower("hit6").hurt,
                  "time":0
               }]);
            }
         },[b,this]);
      }
      
      private function doHit7(param1:uint, param2:Point) : void
      {
         var b:SpecialEffectBullet = null;
         var hit7Point:Point = null;
         var bmLen:uint = 0;
         var i:uint = 0;
         var bo:BaseObject = null;
         var direct:uint = param1;
         var p:Point = param2;
         SoundManager.play("Role2_hit7");
         b = new SpecialEffectBullet("Role2Bullet7");
         b.x = p.x;
         b.y = p.y;
         b.setRole(this);
         b.setDisable();
         b.setDirect(direct);
         b.setAction("hit7");
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
         hit7Point = new Point();
         if(direct == 0)
         {
            hit7Point.x = this.x - 200;
         }
         else
         {
            hit7Point.x = this.x + 200;
         }
         hit7Point.y = this.y - 20;
         bmLen = gc.getPlayerAndPetArray().length;
         i = 0;
         while(i < bmLen)
         {
            bo = gc.getPlayerAndPetArray()[i] as BaseObject;
            if(AUtils.GetDisBetweenTwoObj(b,bo) <= 240)
            {
               bo.setLostGraity();
               TweenMax.to(bo,0.625,{
                  "x":hit7Point.x,
                  "y":hit7Point.y - 30,
                  "onComplete":function(param1:BaseObject):*
                  {
                     param1.resetGraity();
                     if(!param1.isDead())
                     {
                        TweenMax.to(param1,0.625,{
                           "x":param1.x,
                           "y":param1.y - 10
                        });
                     }
                  },
                  "onCompleteParams":[bo]
               });
            }
            i++;
         }
      }
      
      public function doHit8(param1:uint, param2:Point) : void
      {
         var b:SpecialEffectBullet = null;
         var idx:uint = 0;
         b = null;
         b = null;
         b = null;
         var direct:uint = param1;
         var p:Point = param2;
         SoundManager.play("Role2_hit8");
         b = new SpecialEffectBullet("Role2Bullet8");
         b.x = p.x;
         b.y = p.y;
         b.setRole(this);
         b.setDisable();
         b.setDirect(direct);
         b.setAction("hit8");
         idx = uint(gc.gameSence.getChildIndex(this));
         gc.gameSence.addChildAt(b,idx);
         this.magicBulletArray.push(b);
         TweenMax.delayedCall(1.2,function(param1:SpecialEffectBullet, param2:Monster31):*
         {
            var _loc3_:* = 0;
            if(AUtils.GetDisBetweenTwoObj(param2,b) <= 150)
            {
               _loc3_ = uint(3 * param2.getRealPower("hit8").hurt);
               if(param2.isGXP)
               {
                  _loc3_ = uint(_loc3_ * 1.5);
               }
               param2.cureHp(_loc3_);
            }
         },[b,this]);
      }
      
      public function doHit9_1(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role2_hit9");
         this.setLostGraity();
         this.setStatic();
         this.speed.y = 0;
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("Role2Bullet9_1");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setHurtCanCutDownEffect(true);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit9_1");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      public function doHit9_2(param1:uint, param2:Point) : void
      {
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("Role2Bullet9_2");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setHurtCanCutDownEffect(true);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit9_2");
         gc.gameSence.addChild(_loc3_);
         var _loc4_:uint = uint(gc.gameSence.getChildIndex(this));
         gc.gameSence.addChildAt(_loc3_,_loc4_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit10(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role2_hit10");
         if(!this.role2Shalldow)
         {
            this.role2Shalldow = new Role2Shadow(this);
            this.role2Shalldow.x = param2.x;
            this.role2Shalldow.y = param2.y;
            this.role2Shalldow.setDirect(param1);
            gc.gameSence.addChild(this.role2Shalldow);
         }
         else
         {
            this.x = this.role2Shalldow.x;
            this.y = this.role2Shalldow.y;
            this.role2Shalldow.destroy();
            this.role2Shalldow = null;
         }
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         return this.curAttackTarget != null;
      }
      
      override protected function releSkill1() : void
      {
         var skillArray:Array = null;
         var randSkil:String = null;
         this.newAttackId();
         skillArray = ["hit1","hit4_1","hit5","hit7"];
         if(!this.role2Shalldow)
         {
            skillArray.push("hit10");
            if(Math.random() <= 0.5)
            {
               skillArray.push("hit3","hit9");
            }
         }
         else
         {
            skillArray = ["hit3","hit9"];
         }
         if(this.getHp() <= this.getSHp() / 2)
         {
            skillArray.push("hit6","hit8");
         }
         randSkil = skillArray[int(Math.random() * skillArray.length)];
         this.faceToTarget();
         this.setYourFather(10);
         this.setAction(randSkil);
         this.lastHit = randSkil;
         if(randSkil == "hit4_1")
         {
            this.setYourFather(40);
            TweenMax.delayedCall(1.5,function(param1:*):*
            {
               param1.setAction("hit4_2");
            },[this]);
         }
         if(randSkil == "hit10")
         {
            this.skillCD1[1] = gc.frameClips * 5;
         }
         else
         {
            this.skillCD1[1] = 5;
         }
      }
      
      override protected function exitFrameFunc(param1:Point) : void
      {
      }
      
      override protected function myIntelligence() : void
      {
         if(this.role2Shalldow)
         {
            this.role2Shalldow.step();
         }
         if(this.isGXP)
         {
            if(getTimer() % 4 == 0)
            {
               AUtils.shallowEffect(this);
            }
         }
         if(this.gxpCount > 0)
         {
            --this.gxpCount;
         }
         else if(this.gxpCount <= 0 && !this.isGXP)
         {
            this.turnToGXP();
            this.gxpCount = 660;
            TweenMax.delayedCall(7,function(param1:*):*
            {
               param1.turnToNormal();
            },[this]);
         }
         if(!this.isBeAttacking())
         {
            super.myIntelligence();
         }
      }
      
      override protected function turnToGXP() : void
      {
         this.isGXP = true;
         this.graity = 3.75;
         this.horizenSpeed *= 1.5;
      }
      
      protected function turnToNormal() : void
      {
         this.isGXP = false;
         this.graity = 1.5;
         this.horizenSpeed /= 1.5;
      }
      
      override public function setAttackBack(param1:Point) : void
      {
         if(!this.isGXP)
         {
            super.setAttackBack(param1);
         }
      }
      
      override public function reduceHp(param1:int, param2:Boolean = false) : void
      {
         if(this.isGXP)
         {
            param2 = false;
         }
         super.reduceHp(param1,param2);
      }
      
      override protected function isCannotMoveWhenAttackOnFloor() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3" || this.curAction == "hit4_1" || this.curAction == "hit4_2" || this.curAction == "hit5" || this.curAction == "hit6" || this.curAction == "hit7" || this.curAction == "hit8" || this.curAction == "hit9";
      }
      
      override protected function isCannotMoveWhenAttack() : Boolean
      {
         return this.curAction == "hit8";
      }
      
      override public function isAttacking() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3" || this.curAction == "hit4_1" || this.curAction == "hit4_2" || this.curAction == "hit5" || this.curAction == "hit6" || this.curAction == "hit7" || this.curAction == "hit8" || this.curAction == "hit9";
      }
      
      override public function isCanMoveWhenAttack() : Boolean
      {
         return this.curAction == "hit4_1" || this.curAction == "hit4_2" || this.curAction == "hit8" || this.curAction == "hit10" || this.curAction == "hit11_1" || this.curAction == "hit11_2" || this.curAction == "hit13";
      }
      
      override public function destroy() : void
      {
         super.destroy();
         if(this.role2Shalldow)
         {
            this.role2Shalldow.destroy();
         }
         if(this.gc.curStage == 4)
         {
            MainGame.getInstance().createMonster(34,800,300);
         }
      }
   }
}

