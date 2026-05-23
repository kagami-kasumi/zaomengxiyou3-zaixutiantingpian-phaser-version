package export.hero
{
   import base.*;
   import com.greensock.*;
   import export.*;
   import export.bullet.*;
   import export.hero.summoned.Role2KK;
   import export.monster.*;
   import flash.display.*;
   import flash.events.*;
   import flash.geom.*;
   import flash.utils.*;
   import manager.*;
   import my.*;
   
   public class Role2 extends BaseHero
   {
      
      private var hit11Count:uint = 35;
      
      private var hit2NeedCount:uint = 48;
      
      private var hit2CurrentCount:uint = 0;
      
      private var hit5NeedCount:uint = 48;
      
      private var hit5CurrentCount:uint = 0;
      
      private var hit4_2Point:Point;
      
      public var role2Shalldow:Role2Shadow;
      
      private var isHit7Ok:Boolean = false;
      
      public var kk:Role2KK;
      
      private var consumeMP:Array;
      
      private var hmzLianZhan:Array;
      
      private var hmzZaDi:Array;
      
      private var SkillFixedDamage:Array;
      
      private var FixedDamageCount:Array;
      
      private var SkillFactor:Array;
      
      private var hmzLianZhanFactor:Array;
      
      private var hmzZaDiFactor:Array;
      
      public function Role2()
      {
         this.consumeMP = [66,160,208,276,364,493,703,759,801,921,1085,1133,1318,1771,1884,1954,2320,2667];
         this.SkillFixedDamage = [];
         this.hmzLianZhan = [34,95,192,253,318,444,524,687,876,1091,1219,1480,1770,2092,2444,2831,3058,3500,3980,4497,5053,5649,5996,6660,7365,8116,8912,9757,10248,11169];
         this.hmzZaDi = [209,573,1151,1523,1912,2666,3149,4126,5258,6551,7323,8884,10623,12551,14671,16992,18350,21006,23881,26984,30320,33897,35981,39959,44197,48700,53480,58540,61492,67018];
         for(var i:int = 0; i < this.hmzLianZhan.length; i++)
         {
            this.SkillFixedDamage.push(this.hmzLianZhan[i] * 8 + this.hmzZaDi[i]);
         }
         trace(this.SkillFixedDamage[0]);
         this.FixedDamageCount = [1,1,1,1,2,2,2,2.5,2.5,2.5,2.8,2.8,2.8,3.05,3.05,3.05,3.25,3.25,3.45,3.45,3.65,3.65,3.8,3.8,3.95,4.1,4.25,4.4,4.4,4.55,4.7,4.7,4.8,4.9,4.9,4.9,4.9,5,5];
         this.hmzLianZhanFactor = [0.3407,0.0135 * 10];
         this.hmzZaDiFactor = [2.075,0.075 * 10];
         this.SkillFactor = [this.hmzLianZhanFactor[0] * 8 + this.hmzZaDiFactor[0],this.hmzLianZhanFactor[1] * 8 + this.hmzZaDiFactor[1]];
         this.hit4_2Point = new Point(-99,-99);
         super();
         roleName = "唐僧";
         userType = "唐僧";
         this.horizenSpeed = 6;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[5,-2],
            "attackInterval":999,
            "attackKind":"magic",
            "addprotection":1000 / 18
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[14,0],
            "attackInterval":2,
            "attackKind":"magic",
            "addprotection":1000 * 0.1 / 7
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[4,-4],
            "attackInterval":250,
            "attackKind":"magic",
            "addprotection":1000 * 0.12 / 5
         };
         this.attackBackInfoDict["hit3_2"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[4,-4],
            "attackInterval":250,
            "attackKind":"magic",
            "addprotection":1000 * 0.07 / 5
         };
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[0,-3],
            "attackInterval":999,
            "attackKind":"magic",
            "addprotection":1000 * 0.26
         };
         this.attackBackInfoDict["hit5"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[5,-2],
            "attackInterval":16,
            "attackKind":"magic",
            "addprotection":1000 * 0.1 / 12
         };
         this.attackBackInfoDict["hit6"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[14,-25],
            "attackInterval":999,
            "attackKind":"magic",
            "addprotection":0
         };
         this.attackBackInfoDict["hit7"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[15,0],
            "attackInterval":4,
            "attackKind":"magic",
            "addprotection":0
         };
         this.attackBackInfoDict["hit8"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[8,-2],
            "attackInterval":3,
            "attackKind":"magic",
            "addprotection":0
         };
         this.attackBackInfoDict["hit8_2"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[8,-2],
            "attackInterval":3,
            "attackKind":"magic",
            "addprotection":0
         };
         this.attackBackInfoDict["hit9_1"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[0,-2],
            "attackInterval":999,
            "attackKind":"magic",
            "addprotection":1000 * 0.2 / 10
         };
         this.attackBackInfoDict["hit9_2"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[1,-2],
            "attackInterval":5,
            "attackKind":"magic",
            "addprotection":1000 * 0.2 / 10
         };
         this.attackBackInfoDict["hit9_1_2"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[0,-2],
            "attackInterval":999,
            "attackKind":"magic",
            "addprotection":1000 * 0.07 / 10
         };
         this.attackBackInfoDict["hit9_2_2"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[1,-2],
            "attackInterval":5,
            "attackKind":"magic",
            "addprotection":1000 * 0.07 / 10
         };
         this.exceedPowerSprite = new ExceedPower(this.colipse.width,9,this.hit2NeedCount);
         this.exceedPowerSprite.x = this.x - this.colipse.width / 2;
         this.exceedPowerSprite.y = this.y - this.colipse.height / 2 - 20;
         this.addChild(this.exceedPowerSprite);
         nameTextField.y = -this.colipse.height / 2 - 30;
         nameTextField.x = -this.colipse.width / 2 - 30;
         nameTextField.selectable = false;
         nameTextField.autoSize = "center";
         nameTextField.cacheAsBitmap = true;
         this.addChild(nameTextField);
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:* = null;
         var _loc3_:uint = uint(this.getCurClothId());
         var _loc4_:uint = uint(this.getCurWeaponId());
         var _loc5_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("ROLE2_" + _loc3_);
         var _loc6_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("ROLE2_EQUIP_" + _loc4_);
         if(_loc5_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc5_
            };
            _loc2_ = {
               "name":"equip",
               "source":_loc6_
            };
            bbdc = new BaseBitmapDataClip([_loc1_,_loc2_],200,200,new Point(0,0));
            bbdc.setOffsetXY(15,0);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[2,2,2,14],[4,4,4,4],[2,2,2,2],[1,1,30,55,15],[2,2,2,2,2],[2,4,12],[2,10,2,20],[2,2],[2,2,6],[48,2,15],[2,2,20],[2,2,10]]);
            bbdc.setFrameCount([36,4,4,4,[1,1,1,1,1,1],5,3,4,24,3,3,3,3]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            this.bbdc.turnRight();
            return;
         }
         throw new Error("ROLE2--BitmapData Error!");
      }
      
      override protected function newColipse() : void
      {
         this.colipse = AUtils.getNewObj("ObjectBaseSprite") as Sprite;
         this.colipse.visible = false;
         this.addChild(this.colipse);
      }
      
      override public function setAction(param1:String) : void
      {
         var _loc2_:* = null;
         super.setAction(param1);
         var _loc3_:Point = this.bbdc.getCurPoint();
         switch(param1)
         {
            case "wait":
               if(_loc3_.y != 0)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(0);
               }
               this.bbdc.setState(param1);
               return;
            case "wait2":
               if(_loc3_.y != 1)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(1);
               }
               this.bbdc.setState(param1);
               return;
            case "walk":
               if(_loc3_.y != 2)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(2);
               }
               this.bbdc.setState(param1);
               return;
            case "run":
               if(_loc3_.y != 3)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(3);
               }
               this.bbdc.setState(param1);
               return;
            case "jump1":
               if(_loc3_.x != 0 || _loc3_.y != 4)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(param1);
               return;
            case "jump2":
               if(_loc3_.y != 5)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(5);
               }
               this.bbdc.setState(param1);
               return;
            case "jump3":
               if(_loc3_.x != 1 || _loc3_.y != 4)
               {
                  this.bbdc.setFramePointX(1);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(param1);
               return;
            case "hit1":
               if(_loc3_.y != 6)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(6);
               }
               this.bbdc.setState(param1);
               return;
            case "hit3":
               if(_loc3_.y != 7)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(7);
               }
               this.bbdc.setState(param1);
               return;
            case "hit4_1":
               if(_loc3_.y != 8)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(8);
               }
               this.bbdc.setState(param1);
               return;
            case "hit4_2":
               for each(_loc2_ in this.magicBulletArray)
               {
                  if(_loc2_.name == "Role1Bullet4_1")
                  {
                     _loc2_.destroy();
                  }
               }
               if(_loc3_.y != 9)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(9);
               }
               this.bbdc.setState(param1);
               return;
            case "hit5":
               if(_loc3_.y != 10)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(10);
               }
               this.bbdc.setState(param1);
               return;
            case "hit6":
               if(_loc3_.y != 11)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(11);
               }
               this.bbdc.setState(param1);
               return;
            case "hit7":
               if(_loc3_.x != 0 || _loc3_.y != 12)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(12);
               }
               this.bbdc.setState(param1);
               return;
            case "hit8":
               if(_loc3_.x != 2 || _loc3_.y != 4)
               {
                  this.bbdc.setFramePointX(2);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(param1);
               return;
            case "hit9":
               if(_loc3_.x != 3 || _loc3_.y != 4)
               {
                  this.bbdc.setFramePointX(3);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(param1);
               return;
            case "hurt":
               this.hit5CurrentCount = 0;
               if(_loc3_.x == 4 && _loc3_.y == 4)
               {
                  this.getBBDC().resetCurFrameStopCount();
               }
               else
               {
                  this.bbdc.setFramePointX(4);
                  this.bbdc.setFramePointY(4);
               }
               if(this.hit2CurrentCount > 0)
               {
                  this.hit2CurrentCount = 0;
               }
               if(this.hit5CurrentCount > 0)
               {
                  this.hit5CurrentCount = 0;
               }
               this.bbdc.setState(param1);
         }
      }
      
      override protected function scriptFrameOverFunc(param1:int) : void
      {
         var _loc2_:String = this.bbdc.getState();
         switch(_loc2_)
         {
            case "walk":
               this.bbdc.setFramePointX(0);
               return;
            case "run":
               this.bbdc.setFramePointX(0);
               return;
            case "wait":
               this.setAction("wait2");
               return;
            case "wait2":
               this.setAction("wait");
               return;
            case "jump1":
               this.bbdc.setFramePointX(0);
               return;
            case "jump2":
               this.setAction("jump3");
               return;
            case "jump3":
               this.bbdc.setFramePointX(1);
               return;
            case "hit1":
               this.setAction("wait");
               return;
            case "hit3":
               this.resetGraity();
               if(!this.isInSky())
               {
                  this.setAction("wait");
                  return;
               }
               this.setAction("jump3");
               return;
               break;
            case "hit4_1":
               if(!this.isInSky())
               {
                  this.setAction("wait");
                  return;
               }
               this.setAction("jump3");
               return;
               break;
            case "hit4_2":
               if(!this.isInSky())
               {
                  this.setAction("wait");
                  return;
               }
               this.setAction("jump3");
               return;
               break;
            case "hit5":
               this.setAction("wait");
               return;
            case "hit6":
               if(!this.isInSky())
               {
                  this.setAction("wait");
                  return;
               }
               this.setAction("jump3");
               return;
               break;
            case "hit7":
               this.setStatic();
               if(!this.isInSky())
               {
                  this.setAction("wait");
                  return;
               }
               this.setAction("jump3");
               return;
               break;
            case "hit8":
               if(!this.isInSky())
               {
                  this.setAction("wait");
                  return;
               }
               this.setAction("jump3");
               return;
               break;
            case "hit9":
               this.resetGraity();
               if(!this.isInSky())
               {
                  this.setAction("wait");
                  return;
               }
               this.setAction("jump3");
               return;
               break;
            case "hurt":
               this.resetGraity();
               this.setStatic();
               this.setAction("wait");
         }
      }
      
      override protected function enterFrameFunc(param1:Point) : void
      {
         var _loc2_:int = 0;
         var _loc3_:Boolean = false;
         var _loc4_:* = 0;
         var _loc5_:* = null;
         var _loc6_:String = this.bbdc.getState();
         var _loc7_:Point = new Point();
         switch(_loc6_)
         {
            case "hit1":
               if(gc.sid == this.sid || gc.isSingleGame())
               {
                  if(param1.x == 1)
                  {
                     if(this.getPlayer())
                     {
                        if(this.getPlayer().findSkillIsInTheSkillAry("blb"))
                        {
                           _loc2_ = 15 * Math.pow(35173 * 0.065 / 15,Math.pow((this.player.returnSkillLevelBySkillName("blb") - 1) / 17,0.55));
                           if(this.roleProperies.getMMP() >= _loc2_ && this.keyarray[1] == 1)
                           {
                              ++this.hit2CurrentCount;
                              this.bbdc.resetCurFrameStopCount();
                           }
                           else
                           {
                              this.bbdc.setFramePointX(2);
                              this.bbdc.resetCurFrameStopCount();
                           }
                        }
                        else
                        {
                           this.bbdc.setFramePointX(2);
                           this.bbdc.resetCurFrameStopCount();
                        }
                     }
                  }
                  if(this.bbdc.getCurFrameCount() == 12)
                  {
                     if(param1.x == 2)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc7_.x = this.x - 50;
                        }
                        else
                        {
                           _loc7_.x = this.x + 50;
                        }
                        _loc7_.y = this.y + 10;
                        if(this.hit2NeedCount <= this.hit2CurrentCount)
                        {
                           this.doHit2(this.getBBDC().getDirect(),_loc7_);
                           if(gc.sid == this.sid)
                           {
                              gc.sendAttack(this.getRoleId(),"hit2",this.getBBDC().getDirect(),_loc7_.x,_loc7_.y,[]);
                           }
                           this.roleProperies.setMMP(this.roleProperies.getMMP() - _loc2_);
                        }
                        else
                        {
                           _loc4_ = uint(getTimer());
                           this.doHit1(this.getBBDC().getDirect(),_loc7_,_loc4_);
                           if(gc.sid == this.sid)
                           {
                              gc.sendAttack(this.getRoleId(),"hit1",this.getBBDC().getDirect(),_loc7_.x,_loc7_.y,[],_loc4_);
                           }
                        }
                        this.hit2CurrentCount = 0;
                        return;
                     }
                     return;
                  }
                  return;
               }
               if(param1.x == 1)
               {
                  this.bbdc.resetCurFrameStopCount();
                  return;
               }
               return;
               break;
            case "hit3":
               if(gc.sid == this.sid || gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     if(param1.x == 0)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc7_.x = this.x;
                        }
                        else
                        {
                           _loc7_.x = this.x;
                        }
                        _loc7_.y = this.y + 10;
                        this.doHit3(this.getBBDC().getDirect(),_loc7_);
                        if(gc.sid == this.sid)
                        {
                           gc.sendAttack(this.getRoleId(),"hit3",this.getBBDC().getDirect(),_loc7_.x,_loc7_.y,[]);
                        }
                     }
                  }
                  if(param1.x == 3)
                  {
                     if(this.bbdc.getCurFrameCount() <= 20 && this.bbdc.getCurFrameCount() % 6 == 0)
                     {
                        gc.vControllor.shake(25);
                     }
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
               return;
            case "hit4_1":
               if(gc.sid == this.sid || gc.isSingleGame())
               {
                  _loc3_ = false;
                  for each(_loc5_ in this.magicBulletArray)
                  {
                     if(_loc5_.name == "Role1Bullet4_1")
                     {
                        this.hit4_2Point.x = _loc5_.x;
                        this.hit4_2Point.y = _loc5_.y;
                        _loc3_ = true;
                        break;
                     }
                  }
                  if(!_loc3_ && this.bbdc.getCurFrameCount() == 1)
                  {
                     if(param1.x == 0)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc7_.x = this.x - 200;
                        }
                        else
                        {
                           _loc7_.x = this.x + 200;
                        }
                        _loc7_.y = this.y + 10;
                        this.doHit4_1(this.getBBDC().getDirect(),_loc7_);
                        if(gc.sid == this.sid)
                        {
                           gc.sendAttack(this.getRoleId(),"hit4_1",this.getBBDC().getDirect(),_loc7_.x,_loc7_.y,[]);
                        }
                     }
                  }
               }
               this.speed.y = -4;
               return;
            case "hit4_2":
               if(gc.sid == this.sid || gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 6)
                  {
                     if(param1.x == 2)
                     {
                        _loc7_.x = this.hit4_2Point.x;
                        _loc7_.y = this.hit4_2Point.y - 320;
                        this.doHit4_2(this.getBBDC().getDirect(),_loc7_);
                        if(gc.sid == this.sid)
                        {
                           gc.sendAttack(this.getRoleId(),"hit4_2",this.getBBDC().getDirect(),_loc7_.x,_loc7_.y,[]);
                        }
                     }
                  }
               }
               this.speed.y = 0;
               return;
            case "hit5":
               if(gc.sid == this.sid || gc.isSingleGame())
               {
                  if(param1.x == 0)
                  {
                     ++this.hit5CurrentCount;
                  }
                  if(this.bbdc.getCurFrameCount() == 15)
                  {
                     if(param1.x == 2)
                     {
                        this.hit5CurrentCount = 0;
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc7_.x = this.x - 175;
                        }
                        else
                        {
                           _loc7_.x = this.x + 175;
                        }
                        _loc7_.y = this.y - 110;
                        this.doHit5(this.getBBDC().getDirect(),_loc7_);
                        if(gc.sid == this.sid)
                        {
                           gc.sendAttack(this.getRoleId(),"hit5",this.getBBDC().getDirect(),_loc7_.x,_loc7_.y,[]);
                           return;
                        }
                        return;
                     }
                     return;
                  }
                  return;
               }
               return;
               break;
            case "hit6":
               if(gc.sid == this.sid || gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 20)
                  {
                     if(param1.x == 2)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc7_.x = this.x;
                        }
                        else
                        {
                           _loc7_.x = this.x;
                        }
                        _loc7_.y = this.y - 25;
                        this.doHit6(this.getBBDC().getDirect(),_loc7_);
                        if(gc.sid == this.sid)
                        {
                           gc.sendAttack(this.getRoleId(),"hit6",this.getBBDC().getDirect(),_loc7_.x,_loc7_.y,[]);
                        }
                     }
                  }
               }
               if(param1.x == 0)
               {
                  if(this.bbdc.getCurFrameCount() == 20)
                  {
                     if(this.role2Shalldow)
                     {
                        this.role2Shalldow.setAction("hit2");
                        return;
                     }
                     return;
                  }
                  return;
               }
               this.speed.y = 0;
               return;
               break;
            case "hit7":
               if(gc.sid == this.sid || gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     if(param1.x == 2)
                     {
                        if(this.getBBDC().getDirect() == 0)
                        {
                           _loc7_.x = this.x - 210;
                        }
                        else
                        {
                           _loc7_.x = this.x + 210;
                        }
                        _loc7_.y = this.y + 30;
                        this.doHit7(this.getBBDC().getDirect(),_loc7_);
                        return;
                     }
                     return;
                  }
                  return;
               }
               return;
               break;
            case "hit8":
               if(gc.sid == this.sid || gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 30)
                  {
                     if(param1.x == 2)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc7_.x = this.x + 5;
                        }
                        else
                        {
                           _loc7_.x = this.x - 5;
                        }
                        _loc7_.y = this.y - 60;
                        this.doHit8(this.getBBDC().getDirect(),_loc7_);
                        if(gc.sid == this.sid)
                        {
                           gc.sendAttack(this.getRoleId(),"hit8",this.getBBDC().getDirect(),_loc7_.x,_loc7_.y,[]);
                        }
                     }
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
               return;
            case "hit9":
               if(gc.sid == this.sid || gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 55)
                  {
                     if(param1.x == 3)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc7_.x = this.x - 20;
                        }
                        else
                        {
                           _loc7_.x = this.x + 20;
                        }
                        _loc7_.y = this.y - 20;
                        this.doHit9_1(this.getBBDC().getDirect(),_loc7_);
                        if(gc.sid == this.sid)
                        {
                           gc.sendAttack(this.getRoleId(),"hit9_1",this.getBBDC().getDirect(),_loc7_.x,_loc7_.y,[]);
                        }
                     }
                  }
                  else if(this.bbdc.getCurFrameCount() == 45)
                  {
                     if(param1.x == 3)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc7_.x = this.x - 150;
                        }
                        else
                        {
                           _loc7_.x = this.x + 150;
                        }
                        _loc7_.y = this.y - 150;
                        this.doHit9_2(this.getBBDC().getDirect(),_loc7_);
                        if(gc.sid == this.sid)
                        {
                           gc.sendAttack(this.getRoleId(),"hit9_2",this.getBBDC().getDirect(),_loc7_.x,_loc7_.y,[]);
                        }
                     }
                  }
               }
               if(param1.x == 3)
               {
                  if(this.bbdc.getCurFrameCount() == 55)
                  {
                     if(this.role2Shalldow)
                     {
                        this.role2Shalldow.setAction("hit4");
                        return;
                     }
                     return;
                  }
                  return;
               }
         }
      }
      
      private function doHit1(param1:uint, param2:Point, param3:uint) : void
      {
         var _loc4_:SpecialEffectBullet = null;
         SoundManager.play("Role2_hit1");
         if(this.sid != gc.sid)
         {
            this.bbdc.setFramePointX(2);
            this.bbdc.resetCurFrameStopCount();
         }
         _loc4_ = new SpecialEffectBullet("Role2Bullet1");
         _loc4_.x = param2.x;
         _loc4_.y = param2.y;
         _loc4_.initTimer = param3;
         _loc4_.setRole(this);
         _loc4_.setDirect(param1);
         _loc4_.setAction("hit1");
         gc.gameSence.addChild(_loc4_);
         this.magicBulletArray.push(_loc4_);
      }
      
      private function doHit2(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role2_hit2");
         if(this.sid != gc.sid)
         {
            this.bbdc.setFramePointX(2);
            this.bbdc.resetCurFrameStopCount();
         }
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
         _loc3_.y = param2.y + 40;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setHurtCanCutDownEffect(false);
         _loc3_.setAction("hit3");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      public function doHit3_2(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role2_hit3");
         this.setStatic();
         this.setLostGraity();
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("Role2Bullet3");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y + 40;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setHurtCanCutDownEffect(false);
         _loc3_.setAction("hit3_2");
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
         if(direct == 0)
         {
            b.x = p.x + 50;
         }
         else
         {
            b.x = p.x - 50;
         }
         b.y = p.y;
         b.setRole(this);
         b.setDirect(direct);
         b.setAction("hit4");
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
         TweenMax.delayedCall(0.75,function(param1:Role2):*
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
         TweenMax.delayedCall(0.1,function(param1:BaseBullet, param2:Role2):*
         {
            var _loc3_:* = null;
            var _loc4_:Array = gc.getPlayerArray();
            for each(_loc3_ in _loc4_)
            {
               if(AUtils.GetDisBetweenTwoObj(_loc3_,param1) < 100)
               {
                  _loc3_.addCurAddEffect([{
                     "name":BaseAddEffect.SLOWLY_ADDHP,
                     "value":Math.ceil(0.0525 / (1 + 0.28098 * 8) * (1 + 0.28098 * (param2.getPlayer().returnSkillLevelBySkillName("myhc") - 1)) * param2.roleProperies.getSHHP()) * 2,
                     "time":4 * gc.frameClips
                  }]);
               }
               trace("myhc回血:" + Math.ceil(0.0525 / (1 + 0.28098 * 8) * (1 + 0.28098 * (param2.getPlayer().returnSkillLevelBySkillName("myhc") - 1)) * param2.roleProperies.getSHHP())) * 2;
            }
         },[b,this]);
      }
      
      private function doHit7(param1:uint, param2:Point) : void
      {
         var b:SpecialEffectBullet = null;
         var hit7Point:Point = null;
         var bmLen:uint = 0;
         var bo:BaseObject = null;
         var i:uint = 0;
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
         if(gc.sid == this.sid || gc.isSingleGame())
         {
            hit7Point = new Point();
            if(direct == 0)
            {
               hit7Point.x = this.x - 200;
            }
            else
            {
               hit7Point.x = this.x + 200;
            }
            hit7Point.y = this.y - 70;
            if(gc.sid == this.sid)
            {
               gc.sendAttack(this.getRoleId(),"hit7",this.getBBDC().getDirect(),p.x,p.y,[]);
            }
            if(gc.isInRoom())
            {
               gc.obbsiteArray = gc.pWorld.getOtherHeroArray();
            }
            else if(gc.isPK)
            {
               gc.obbsiteArray = new Array(gc.getRivalPlayer(this));
            }
            else
            {
               gc.obbsiteArray = gc.pWorld.monsterArray;
            }
            bmLen = gc.obbsiteArray.length;
            i = 0;
            while(i < bmLen)
            {
               bo = gc.obbsiteArray[i] as BaseObject;
               if(!bo.isYourFather() && !(bo is Monster1004) && !(bo is Monster1003) && !(bo is Monster1005) && !(bo is Monster1008))
               {
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
                     if(gc.isInRoom())
                     {
                        gc.sendAttack(bo.getRoleId(),"Role2Hit7",this.getBBDC().getDirect(),hit7Point.x,hit7Point.y,[bo.sid]);
                     }
                  }
               }
               i++;
            }
         }
         this.isHit7Ok = true;
      }
      
      public function doHit8(param1:uint, param2:Point) : void
      {
         var hudun:Array;
         var idx:uint = 0;
         var hf:int = 0;
         var yichu:int = 0;
         var b:SpecialEffectBullet = null;
         var beishu:Number = NaN;
         b = null;
         beishu = Number(NaN);
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
         sl = this.player.returnSkillLevelBySkillName("tjgl") - 1;
         beishu = 0.33 / (1 + 0.28098 * 8) * (1 + 0.28098 * sl);
         hudun = [4.6,4.7,4.8,5,5.15,5.25,5.4,5.6,6];
         if(gc.sid == this.sid || gc.isSingleGame())
         {
            TweenMax.delayedCall(0.05,function(param1:SpecialEffectBullet):*
            {
               var _loc2_:int = 0;
               var _loc3_:* = null;
               var _loc4_:* = 0;
               var _loc5_:Array = gc.getPlayerArray();
               var _loc6_:uint = _loc5_.length;
               while(_loc2_ < _loc6_)
               {
                  _loc3_ = _loc5_[_loc2_] as BaseHero;
                  _loc4_ = uint(_loc3_.roleProperies.getSHHP() * beishu);
                  if(this.isGXP)
                  {
                     _loc4_ = uint(_loc4_ * 1.5);
                  }
                  if(AUtils.GetDisBetweenTwoObj(_loc3_,b) <= 150)
                  {
                     _loc3_.cureHp(_loc4_);
                  }
                  if(_loc3_.getPet())
                  {
                     if(AUtils.GetDisBetweenTwoObj(_loc3_.getPet(),b) <= 150)
                     {
                        _loc3_.getPet().cureHp(_loc4_);
                     }
                  }
                  _loc2_++;
               }
            },[b]);
         }
         hf = this.roleProperies.getSHHP() * beishu * hudun[sl] * 0.2915;
         yichu = hf;
         if(yichu > 0)
         {
            if(this.player.returnSkillLevelBySkillName("tjgl") >= 1)
            {
               this.addCurAddEffect([{
                  "name":BaseAddEffect.tjgl_Shield,
                  "time":gc.frameClips * 7,
                  "defendValue":yichu
               }]);
            }
         }
      }
      
      public function doHit8_2(param1:uint, param2:Point) : void
      {
         var hudun:Array;
         var idx:uint = 0;
         var shy:int = 0;
         var hf:int = 0;
         var yichu:int = 0;
         var b:SpecialEffectBullet = null;
         var beishu:Number = NaN;
         b = null;
         beishu = Number(NaN);
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
         b.setAction("hit8_2");
         idx = uint(gc.gameSence.getChildIndex(this));
         gc.gameSence.addChildAt(b,idx);
         this.magicBulletArray.push(b);
         sl = this.player.returnSkillLevelBySkillName("tjgl");
         shy = int(this.player.returnSkillLevelBySkillName("shy") - 1);
         beishu = 0.33 * 0.55 / (1 + 0.28098 * 8) * (1 + 0.28098 * shy);
         hudun = [4.6,4.7,4.8,5,5.15,5.25,5.4,5.6,6];
         if(gc.sid == this.sid || gc.isSingleGame())
         {
            TweenMax.delayedCall(0.1,function(param1:SpecialEffectBullet):*
            {
               var _loc2_:int = 0;
               var _loc3_:* = null;
               var _loc4_:* = 0;
               var _loc5_:Array = gc.getPlayerArray();
               var _loc6_:uint = _loc5_.length;
               while(_loc2_ < _loc6_)
               {
                  _loc3_ = _loc5_[_loc2_] as BaseHero;
                  _loc4_ = uint(_loc3_.roleProperies.getSHHP() * beishu);
                  if(this.isGXP)
                  {
                     _loc4_ = uint(_loc4_ * 1.5);
                  }
                  if(AUtils.GetDisBetweenTwoObj(_loc3_,b) <= 150)
                  {
                     _loc3_.cureHp(_loc4_);
                  }
                  if(_loc3_.getPet())
                  {
                     if(AUtils.GetDisBetweenTwoObj(_loc3_.getPet(),b) <= 150)
                     {
                        _loc3_.getPet().cureHp(_loc4_);
                     }
                  }
                  _loc2_++;
               }
            },[b]);
         }
         hf = this.roleProperies.getSHHP() * beishu * 1;
         yichu = this.roleProperies.getHHP() + hf - this.roleProperies.getSHHP();
         if(yichu > 0)
         {
         }
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
      
      public function doHit9_1_2(param1:uint, param2:Point) : void
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
         _loc3_.setAction("hit9_1_2");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      public function doHit9_2_2(param1:uint, param2:Point) : void
      {
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("Role2Bullet9_2");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setHurtCanCutDownEffect(true);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit9_2_2");
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
            if(gc.sid == this.sid)
            {
               gc.sendAttack(this.getRoleId(),"hit10",param1,param2.x,param2.y,[]);
            }
         }
         else
         {
            this.x = this.role2Shalldow.x;
            this.y = this.role2Shalldow.y;
            this.role2Shalldow.destroy();
            this.role2Shalldow = null;
            if(gc.sid == this.sid)
            {
               gc.sendAttack(this.getRoleId(),"hit10",param1,this.x,this.y,[]);
            }
         }
      }
      
      override public function setOtherAttack(param1:String, param2:uint, param3:Point, param4:Array = null, param5:uint = 0) : void
      {
         switch(param1)
         {
            case "hit1":
               this.doHit1(param2,param3,param5);
               return;
            case "hit2":
               this.doHit2(param2,param3);
               return;
            case "hit3":
               this.doHit3(param2,param3);
               return;
            case "hit4_1":
               this.doHit4_1(param2,param3);
               return;
            case "hit4_2":
               this.doHit4_2(param2,param3);
               return;
            case "hit5":
               this.doHit5(param2,param3);
               return;
            case "hit6":
               this.doHit6(param2,param3);
               return;
            case "hit7":
               this.doHit7(param2,param3);
               return;
            case "hit8":
               this.doHit8(param2,param3);
               return;
            case "hit9_1":
               this.doHit9_1(param2,param3);
               return;
            case "hit9_2":
               this.doHit9_2(param2,param3);
               return;
            case "hit10":
               this.doHit10(param2,param3);
               return;
            case "wushuangStart":
               this.turnToGXP();
               return;
            case "wushuangOver":
               this.turnToNormal();
               return;
            case "Role2Hit7":
               this.beAttackByRole2Hit7(param3);
               return;
            case "Role3Hit6":
               this.beAttackByRole3Hit6(param3);
         }
      }
      
      override public function setOtherBuff(param1:String, param2:Array) : void
      {
         switch(param1)
         {
            case "poison_bomb":
               this.curAddEffect.poison_times_bomb_other();
               return;
            case "Role4_hit6":
               if(this.curAddEffect)
               {
                  this.curAddEffect.add([{
                     "name":BaseAddEffect.POISON_TIMES,
                     "time":gc.frameClips * 7
                  }]);
                  this.curAddEffect.add([{
                     "name":BaseAddEffect.STUN,
                     "time":gc.frameClips * 2
                  }]);
                  return;
               }
         }
      }
      
      override protected function exitFrameFunc(param1:Point) : void
      {
      }
      
      override public function step() : void
      {
         var _loc1_:Boolean = false;
         super.step();
         if(this.hit2CurrentCount > 0)
         {
            this.exceedPowerSprite.step(this.hit2CurrentCount);
         }
         else if(this.hit5CurrentCount > 0)
         {
            this.exceedPowerSprite.step(this.hit5CurrentCount);
         }
         if(this.hit2CurrentCount == 0 && this.hit5CurrentCount == 0)
         {
            this.exceedPowerSprite.clear();
         }
         if(this.role2Shalldow)
         {
            this.role2Shalldow.step();
         }
         if(this.hit2NeedCount == 48 || this.hit5NeedCount == 48)
         {
            if(this.getPlayer())
            {
               _loc1_ = this.getPlayer().getSkillBySkillName("sjt");
               if(_loc1_)
               {
                  this.hit2NeedCount = 12;
                  this.hit5NeedCount = 12;
                  bbdc.setFrameStopCount([[2,2,2,3,2,4],[2,2,2,14],[4,4,4,4],[2,2,2,2],[1,1,30,55,8],[2,2,2,2,2],[2,4,12],[2,10,2,20],[2,2],[2,2,6],[24,2,15],[2,2,20],[2,2,10]]);
                  this.exceedPowerSprite.setMaxPower(this.hit2NeedCount);
               }
            }
         }
         else if(this.getPlayer())
         {
            _loc1_ = this.getPlayer().getSkillBySkillName("sjt");
            if(!_loc1_)
            {
               this.hit2NeedCount = 48;
               this.hit5NeedCount = 48;
               bbdc.setFrameStopCount([[2,2,2,3,2,4],[2,2,2,14],[4,4,4,4],[2,2,2,2],[1,1,30,55,8],[2,2,2,2,2],[2,4,12],[2,10,2,20],[2,2],[2,2,6],[48,2,15],[2,2,20],[2,2,10]]);
               this.exceedPowerSprite.setMaxPower(this.hit2NeedCount);
            }
         }
      }
      
      override protected function myKeyDown(param1:String) : *
      {
         var keyStr:String = param1;
         super.myKeyDown(keyStr);
         switch(keyStr)
         {
            case "0100":
            case "1100":
               if(this.isAttacking() || this.isBeAttacking())
               {
                  return;
               }
               this.normalHit();
               cannextaction = false;
         }
         if(cannextaction)
         {
            switch(keyStr)
            {
               case "0010":
                  if(this.isAttacking() || this.isBeAttacking())
                  {
                     return;
                  }
                  this.jump();
                  cannextaction = false;
                  return;
                  break;
               case "1010":
                  if(this.isAttacking() || this.isBeAttacking())
                  {
                     return;
                  }
                  this.getFallDown();
                  cannextaction = false;
                  return;
                  break;
               case "0110":
                  if(this.isAttacking() || this.isBeAttacking())
                  {
                     return;
                  }
                  cannextaction = false;
                  return;
                  break;
               case "0001":
                  if(this.checkTransferDoor())
                  {
                     gc.pWorld.getBaseLevelListener().keyBoardDownForW(this);
                     if(gc.curStage == 8 && gc.curLevel == 1)
                     {
                        return;
                     }
                  }
                  if(!gc.isLevelClear && this.checkTransferDoor())
                  {
                     gc.isLevelClear = true;
                     gc.keyboardControl.destroy();
                     TweenMax.to(gc.gameInfo,1,{"alpha":0});
                     TweenMax.to(gc.gameSence,1,{
                        "alpha":0,
                        "onComplete":function():*
                        {
                           gc.eventManger.dispatchEvent(new Event("LevelVictor"));
                           MainGame.getInstance().levelClear();
                        }
                     });
                     return;
                  }
            }
         }
      }
      
      override protected function showSkill(param1:String) : void
      {
         var _loc2_:* = null;
         var _loc3_:* = 0;
         var _loc7_:Number = 0;
         var x_num:Number = 0.28098;
         if(this.getPlayer())
         {
            _loc2_ = this.getPlayer().returnSkillNameBySkillKey(param1);
            if(_loc2_)
            {
               param1 = _loc2_[0];
               _loc3_ = uint(parseInt(_loc2_[1]));
               if(param1 == "sgq")
               {
                  _loc7_ = Number(this.player.returnSkillLevelBySkillName("sgq") - 1);
                  _loc3_ = this.consumeMP[_loc7_] * 0.55 * 35173 / 25958;
                  this.skill_sgq(_loc3_);
               }
               else if(param1 == "myhc")
               {
                  _loc7_ = Number(this.player.returnSkillLevelBySkillName("myhc") - 1);
                  _loc3_ = this.consumeMP[_loc7_] * 1.2 * 35173 / 25958;
                  this.skill_myhc(_loc3_);
               }
               else if(param1 == "jgz")
               {
                  _loc7_ = Number(this.player.returnSkillLevelBySkillName("jgz") - 1);
                  _loc3_ = this.consumeMP[_loc7_] * 0.6 * 35173 / 25958;
                  this.skill_jgz(_loc3_);
               }
               else if(param1 == "tjgl")
               {
                  _loc7_ = Number(this.player.returnSkillLevelBySkillName("tjgl") - 1);
                  _loc3_ = this.consumeMP[_loc7_] * 1 * 35173 / 25958;
                  this.skill_tjgl(_loc3_);
               }
               else if(param1 == "jhsj")
               {
                  _loc7_ = Number(this.player.returnSkillLevelBySkillName("jhsj") - 1);
                  _loc3_ = this.consumeMP[_loc7_] * 1.1 * 35173 / 25958;
                  this.skill_jhsj(_loc3_);
               }
               else if(param1 == "blb")
               {
                  _loc7_ = Number(this.player.returnSkillLevelBySkillName("blb") - 1);
                  _loc3_ = this.consumeMP[_loc7_] * 0.55 * 35173 / 25958;
                  this.skill_blb(_loc3_);
               }
               else if(param1 == "xbz")
               {
                  _loc7_ = Number(this.player.returnSkillLevelBySkillName("xbz") - 1);
                  _loc3_ = this.consumeMP[_loc7_] * 0.65 * 35173 / 25958;
                  this.skill_xbz(_loc3_);
               }
               else if(param1 == "shy")
               {
                  _loc7_ = Number(this.player.returnSkillLevelBySkillName("shy") - 1);
                  _loc3_ = this.consumeMP[_loc7_] * 0.55 * 35173 / 25958;
                  this.skill_shy(_loc3_);
               }
               else if(param1 == "smb")
               {
                  _loc7_ = Number(this.player.returnSkillLevelBySkillName("smb") - 1);
                  _loc3_ = this.consumeMP[_loc7_] * 1.2 * 35173 / 25958;
                  this.skill_smb(_loc3_);
               }
               if(this.curAddEffect.curDebuff(BaseAddEffect.MONSTER65_AOE) || this.curAddEffect.curDebuff(BaseAddEffect.MONSTER129Buff))
               {
                  this.reduceHp(_loc3_);
               }
            }
         }
      }
      
      private function skill_sgq(param1:uint) : void
      {
         if(this.roleProperies.getMMP() < param1)
         {
            return;
         }
         if(this.isAttacking() || this.isBeAttacking())
         {
            return;
         }
         this.setAction("hit5");
         this.curAction = "hit5";
         this.hitNum = 0;
         this.newAttackId();
         if(this.getPlayer())
         {
            gc.sendPosition(this);
         }
         this.roleProperies.setMMP(this.roleProperies.getMMP() - param1);
      }
      
      private function skill_myhc(param1:uint) : void
      {
         if(this.roleProperies.getMMP() < param1)
         {
            return;
         }
         if(this.isAttacking() || this.isBeAttacking())
         {
            return;
         }
         this.setAction("hit6");
         this.lastHit = "hit6";
         this.newAttackId();
         this.hitNum = 0;
         if(this.getPlayer())
         {
            gc.sendPosition(this);
         }
         this.roleProperies.setMMP(this.roleProperies.getMMP() - param1);
      }
      
      private function skill_jgz(param1:uint) : void
      {
         if(this.roleProperies.getMMP() < param1)
         {
            return;
         }
         if(this.isAttacking() || this.isBeAttacking())
         {
            return;
         }
         this.setAction("hit7");
         this.curAction = "hit7";
         this.hitNum = 0;
         this.newAttackId();
         if(this.getPlayer())
         {
            gc.sendPosition(this);
         }
         this.roleProperies.setMMP(this.roleProperies.getMMP() - param1);
      }
      
      private function skill_tjgl(param1:uint) : void
      {
         if(this.roleProperies.getMMP() < param1)
         {
            return;
         }
         if(this.isAttacking() || this.isBeAttacking())
         {
            return;
         }
         this.setAction("hit8");
         this.lastHit = "hit8";
         this.newAttackId();
         this.hitNum = 0;
         if(this.getPlayer())
         {
            gc.sendPosition(this);
         }
         this.roleProperies.setMMP(this.roleProperies.getMMP() - param1);
      }
      
      private function skill_jhsj(param1:uint) : void
      {
         if(this.roleProperies.getMMP() < param1)
         {
            return;
         }
         if(this.isAttacking() || this.isBeAttacking())
         {
            return;
         }
         this.setAction("hit9");
         this.curAction = "hit9";
         this.hitNum = 0;
         this.newAttackId();
         if(this.getPlayer())
         {
            gc.sendPosition(this);
         }
         this.roleProperies.setMMP(this.roleProperies.getMMP() - param1);
      }
      
      private function skill_blb(param1:uint) : void
      {
      }
      
      private function skill_xbz(param1:uint) : void
      {
         if(this.roleProperies.getMMP() < param1)
         {
            return;
         }
         if(this.isAttacking() || this.isBeAttacking())
         {
            return;
         }
         this.setAction("hit3");
         this.curAction = "hit3";
         this.hitNum = 0;
         this.newAttackId();
         if(this.getPlayer())
         {
            gc.sendPosition(this);
         }
         this.roleProperies.setMMP(this.roleProperies.getMMP() - param1);
      }
      
      private function skill_shy(param1:uint) : void
      {
         if(this.roleProperies.getMMP() < param1)
         {
            return;
         }
         if(this.isAttacking() || this.isBeAttacking())
         {
            return;
         }
         this.doHit10(this.getBBDC().getDirect(),new Point(this.x,this.y));
         if(this.role2Shalldow)
         {
            this.roleProperies.setMMP(this.roleProperies.getMMP() - param1);
         }
      }
      
      private function skill_smb(param1:uint) : void
      {
         var _loc2_:Boolean = false;
         var _loc3_:* = null;
         if(!this.isAttacking())
         {
            if(this.roleProperies.getMMP() < param1)
            {
               return;
            }
         }
         if(this.curAction != "hit4_1" && !this.standInObj || this.isAttacking() && this.curAction != "hit4_1" || this.isBeAttacking())
         {
            return;
         }
         for each(_loc3_ in this.magicBulletArray)
         {
            if(_loc3_.name == "Role1Bullet4_1")
            {
               this.hit4_2Point.x = _loc3_.x;
               this.hit4_2Point.y = _loc3_.y;
               _loc2_ = true;
               break;
            }
         }
         if(this.curAction != "hit4_1")
         {
            this.setAction("hit4_1");
            this.lastHit = "hit4_1";
            this.newAttackId();
            if(this.getPlayer())
            {
               gc.sendPosition(this);
            }
            this.hit4_2Point.x = -99;
            this.hit4_2Point.y = -99;
            this.roleProperies.setMMP(this.roleProperies.getMMP() - param1);
         }
         else if(_loc2_)
         {
            this.setAction("hit4_2");
            this.lastHit = "hit4_2";
            this.newAttackId();
            if(this.getPlayer())
            {
               gc.sendPosition(this);
            }
         }
      }
      
      override protected function showSkillKongGe() : void
      {
         var _loc1_:RoleInfo = gc.gameInfo.getRoleInfoByPlayer(this.player) as RoleInfo;
         if(_loc1_.isGXPReady() && !this.isGXP)
         {
            this.turnToGXP();
            if(this.getPlayer())
            {
               gc.sendPosition(this);
            }
         }
      }
      
      override public function normalHit() : *
      {
         if(this.isAttacking() || this.isBeAttacking())
         {
            return;
         }
         this.setAction("hit1");
         if(this.getPlayer())
         {
            gc.sendPosition(this);
         }
         this.lastHit = "hit1";
         this.hitNum = 0;
         this.newAttackId();
      }
      
      override public function refreshEquip() : void
      {
         var _loc1_:uint = uint(this.getCurClothId());
         var _loc2_:uint = uint(this.getCurWeaponId());
         var _loc3_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("ROLE2_" + _loc1_);
         if(_loc3_)
         {
            this.bbdc.replaceBitmapDataByName("body",_loc3_);
         }
         _loc3_ = BaseBitmapDataPool.getBitmapDataArrayByName("ROLE2_EQUIP_" + _loc2_);
         if(_loc3_)
         {
            this.bbdc.replaceBitmapDataByName("equip",_loc3_);
         }
         super.refreshEquip();
      }
      
      private function isDefending() : Boolean
      {
         return this.curAction == "hit6";
      }
      
      override public function isNormalHit() : Boolean
      {
         return this.curAction == "hit1";
      }
      
      private function runAttack() : void
      {
         if(!this.isInSky())
         {
            this.doubleCount = 0;
            this.normalHit();
         }
      }
      
      override public function __keyBoardDown(param1:KeyboardEvent) : void
      {
         super.__keyBoardDown(param1);
      }
      
      override public function __keyBoardUp(param1:KeyboardEvent) : void
      {
         super.__keyBoardUp(param1);
      }
      
      override public function upGrade(param1:Boolean = true) : *
      {
         super.upGrade();
         if(!param1)
         {
            this.roleProperies.removeAllEquipAndPassive();
         }
         this.roleProperies.setSHHP(50 + 20 * (this.roleProperies.getLevel() - 1));
         this.roleProperies.setHHP(this.roleProperies.getSHHP());
         this.roleProperies.setSMMP(100 + 40 * (this.roleProperies.getLevel() - 1));
         this.roleProperies.setMMP(this.roleProperies.getSMMP());
         this.roleProperies.setBasePower(12 + 8 * (this.roleProperies.getLevel() - 1));
         this.roleProperies.setDefense(this.roleProperies.getLevel() - 1);
         if(this.roleProperies.getLevel() < 7)
         {
            this.roleProperies.setexp(135 + 10 * (this.roleProperies.getLevel() - 1));
         }
         else if(this.roleProperies.getLevel() < 13)
         {
            this.roleProperies.setexp(625 + 50 * (this.roleProperies.getLevel() - 7));
         }
         else if(this.roleProperies.getLevel() < 19)
         {
            this.roleProperies.setexp(1950 + 100 * (this.roleProperies.getLevel() - 13));
         }
         else if(this.roleProperies.getLevel() < 89)
         {
            this.roleProperies.setexp(5000 + 5000 * (this.roleProperies.getLevel() - 19));
         }
         else
         {
            this.roleProperies.setexp(999999999);
         }
         this.roleProperies.initAll();
      }
      
      override public function getRealPower(param1:String, param2:Boolean = true) : Object
      {
         var _loc3_:Number = 0;
         var _loc4_:* = null;
         var _loc5_:* = 1;
         var _loc6_:* = null;
         var _loc7_:Number = 1;
         var _loc8_:int = 1;
         var qixue:int = 0;
         var mp_percent:Number = 0;
         var x_num:Number = 0.28098;
         if(this.isGXP)
         {
            _loc5_ = 1.3;
         }
         var _loc12_:int = 1;
         if(param2 && Math.random() <= this.roleProperies.getTotalCrit() / 100)
         {
            _loc12_ = 2;
         }
         var _loc13_:* = 1;
         if(this.isHit7Ok)
         {
            _loc13_ = 1.006 + 0.02 * (this.player.returnSkillLevelBySkillName("jgz") - 1);
            this.isHit7Ok = false;
         }
         var _loc14_:* = 1;
         var _loc15_:Boolean = this.getPlayer().getSkillBySkillName("sjt");
         if(_loc15_)
         {
            _loc14_ = 1.1 + 0.005 * int(this.player.returnSkillLevelBySkillName("sjt") - 1);
         }
         var _loc16_:int = int(this.player.returnSkillLevelBySkillName("shy") - 1);
         switch(param1)
         {
            case "hit1":
               _loc8_ = 3.97 * 0.81 * 6201 / 6550 * this.roleProperies.getHurt() * _loc12_ * _loc5_ * _loc13_ * _loc14_;
               qixue = 3.97 * 0.81 * 6201 / 6550 * this.roleProperies.getHaveblood() * _loc5_;
               break;
            case "hit2":
               _loc7_ = Number(this.player.returnSkillLevelBySkillName("blb") - 1);
               mp_percent = 15 * Math.pow(35173 * 0.065 / 15,Math.pow(_loc7_ / 17,0.55)) / this.roleProperies.getSMMP() / 0.065 * 3 * Math.pow(1 / 3,Math.pow(_loc7_ / 17,0.75));
               _loc8_ = 0.6 * (this.SkillFixedDamage[_loc7_] * this.FixedDamageCount[_loc7_] + (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * 6201 / 6550 * this.roleProperies.getHurt()) / 7 * _loc12_ * _loc5_ * _loc13_ * _loc14_;
               qixue = 0.6 * (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * 6201 / 6550 / 7 * this.roleProperies.getHaveblood() * _loc5_;
               break;
            case "hit3":
               _loc7_ = Number(this.player.returnSkillLevelBySkillName("xbz") - 1);
               mp_percent = 20 * Math.pow(35173 * 0.075 / 20,Math.pow(_loc7_ / 17,0.55)) / this.roleProperies.getSMMP() / 0.075 * 3 * Math.pow(1 / 3,Math.pow(_loc7_ / 17,0.75));
               _loc8_ = 0.7 * (this.SkillFixedDamage[_loc7_] * this.FixedDamageCount[_loc7_] + (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * 6201 / 6550 * this.roleProperies.getHurt()) / 5 * _loc12_ * _loc5_ * _loc13_ * _loc14_;
               qixue = 0.7 * (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * 6201 / 6550 / 5 * this.roleProperies.getHaveblood() * _loc5_;
               break;
            case "hit3_2":
               _loc7_ = Number(this.player.returnSkillLevelBySkillName("shy") - 1);
               mp_percent = 20 * Math.pow(35173 * 0.075 / 20,Math.pow(_loc7_ / 17,0.55)) / this.roleProperies.getSMMP() / 0.075 * 3 * Math.pow(1 / 3,Math.pow(_loc7_ / 17,0.75));
               _loc8_ = 0.35 * (this.SkillFixedDamage[_loc7_] * this.FixedDamageCount[_loc7_] + (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * 6201 / 6550 * this.roleProperies.getHurt()) / 5 * _loc12_ * _loc5_ * _loc13_ * _loc14_;
               qixue = 0.35 * (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * 6201 / 6550 / 5 * this.roleProperies.getHaveblood() * _loc5_;
               break;
            case "hit4":
               _loc7_ = Number(this.player.returnSkillLevelBySkillName("smb") - 1);
               mp_percent = 60 * Math.pow(35173 * 0.165 / 60,Math.pow(_loc7_ / 17,0.55)) / this.roleProperies.getSMMP() / 0.165 * 3 * Math.pow(1 / 3,Math.pow(_loc7_ / 17,0.75));
               _loc8_ = 1.3 * (this.SkillFixedDamage[_loc7_] * this.FixedDamageCount[_loc7_] * 1.05 + (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * 6201 / 6550 * this.roleProperies.getHurt()) * _loc12_ * _loc5_ * _loc13_ * _loc14_;
               qixue = 1.3 * (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * 6201 / 6550 * this.roleProperies.getHaveblood() * _loc5_;
               break;
            case "hit5":
               _loc7_ = Number(this.player.returnSkillLevelBySkillName("sgq") - 1);
               mp_percent = 15 * Math.pow(35173 * 0.065 / 15,Math.pow(_loc7_ / 17,0.55)) / this.roleProperies.getSMMP() / 0.065 * 3 * Math.pow(1 / 3,Math.pow(_loc7_ / 17,0.75));
               _loc8_ = 0.6 * (this.SkillFixedDamage[_loc7_] * this.FixedDamageCount[_loc7_] + (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * 6201 / 6550 * this.roleProperies.getHurt()) / 12 * _loc12_ * _loc5_ * _loc13_ * _loc14_;
               qixue = 0.6 * (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * 6201 / 6550 / 12 * this.roleProperies.getHaveblood() * _loc5_;
               break;
            case "hit6":
               _loc7_ = Number(this.player.returnSkillLevelBySkillName("myhc") - 1);
               _loc8_ = 1 * _loc7_;
            case "hit7":
               _loc7_ = Number(this.player.returnSkillLevelBySkillName("jgz") - 1);
               _loc8_ = 1 * _loc7_;
            case "hit8":
               _loc7_ = Number(this.player.returnSkillLevelBySkillName("tjgl") - 1);
               _loc8_ = 1 * _loc7_;
            case "hit9_1":
               _loc7_ = Number(this.player.returnSkillLevelBySkillName("jhsj") - 1);
               mp_percent = 50 * Math.pow(35173 * 0.13 / 50,Math.pow(_loc7_ / 17,0.55)) / this.roleProperies.getSMMP() / 0.13 * 3 * Math.pow(1 / 3,Math.pow(_loc7_ / 17,0.75));
               _loc8_ = 1 * (this.SkillFixedDamage[_loc7_] * this.FixedDamageCount[_loc7_] + (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * 6201 / 6550 * this.roleProperies.getHurt()) / 10 * _loc12_ * _loc5_ * _loc13_ * _loc14_;
               qixue = (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * 6201 / 6550 / 10 * this.roleProperies.getHaveblood() * _loc5_;
               break;
            case "hit9_2":
               _loc7_ = Number(this.player.returnSkillLevelBySkillName("jhsj"));
               mp_percent = 50 * Math.pow(35173 * 0.13 / 50,Math.pow(_loc7_ / 17,0.55)) / this.roleProperies.getSMMP() / 0.13 * 3 * Math.pow(1 / 3,Math.pow(_loc7_ / 17,0.75));
               _loc8_ = 1 * (this.SkillFixedDamage[_loc7_] * this.FixedDamageCount[_loc7_] + (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * 6201 / 6550 * this.roleProperies.getHurt()) / 10 * _loc12_ * _loc5_ * _loc13_ * _loc14_;
               qixue = (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * 6201 / 6550 / 10 * this.roleProperies.getHaveblood() * _loc5_;
               break;
            case "hit9_1_2":
               _loc7_ = Number(this.player.returnSkillLevelBySkillName("shy"));
               mp_percent = 50 * Math.pow(35173 * 0.13 / 50,Math.pow(_loc7_ / 17,0.55)) / this.roleProperies.getSMMP() / 0.13 * 3 * Math.pow(1 / 3,Math.pow(_loc7_ / 17,0.75));
               _loc8_ = 0.35 * (this.SkillFixedDamage[_loc7_] * this.FixedDamageCount[_loc7_] + (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * 6201 / 6550 * this.roleProperies.getHurt()) / 10 * _loc12_ * _loc5_ * _loc13_ * _loc14_;
               qixue = 0.35 * (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * 6201 / 6550 / 10 * this.roleProperies.getHaveblood() * _loc5_;
               break;
            case "hit9_2_2":
               _loc7_ = Number(this.player.returnSkillLevelBySkillName("shy"));
               mp_percent = 50 * Math.pow(35173 * 0.13 / 50,Math.pow(_loc7_ / 17,0.55)) / this.roleProperies.getSMMP() / 0.13 * 3 * Math.pow(1 / 3,Math.pow(_loc7_ / 17,0.75));
               _loc8_ = 0.35 * (this.SkillFixedDamage[_loc7_] * this.FixedDamageCount[_loc7_] + (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * 6201 / 6550 * this.roleProperies.getHurt()) / 10 * _loc12_ * _loc5_ * _loc13_ * _loc14_;
               qixue = 0.35 * (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * 6201 / 6550 / 10 * this.roleProperies.getHaveblood() * _loc5_;
               break;
            case "fabao-qpj":
               _loc8_ = this.roleProperies.getHurt() * 1.945 * _loc13_ * _loc5_ * 6201 / 6550 * 1.08325 * 1.5;
               qixue = this.roleProperies.getHaveblood() * 1.945 * _loc5_ * 6201 / 6550 * 1.08325 * 1.5;
               break;
            case "fabao-qpj1":
               _loc8_ = this.roleProperies.getHurt() * 1.945 * _loc13_ * _loc5_ * 6201 / 6550 * 1.08325 * 1.5;
               qixue = this.roleProperies.getHaveblood() * 1.945 * _loc5_ * 6201 / 6550 * 1.08325 * 1.5;
               break;
            case "qpjThunder":
               _loc8_ = this.roleProperies.getHurt() * 2.52 * _loc13_ * _loc5_ * 6201 / 6550 * 1.08325 * 1.5;
               qixue = this.roleProperies.getHaveblood() * 2.52 * _loc5_ * 6201 / 6550 * 1.08325 * 1.5;
               break;
            case "fabao-zltc":
               _loc6_ = this.getPlayer().getCurEquipByType("zbfb");
               _loc13_ = 1;
               _loc8_ = this.roleProperies.getHurt() * (18 + (_loc6_.getELevel() - 1) * 3) / 4 * 6201 / 6550 * 1.8;
               qixue = this.roleProperies.getHaveblood() * (18 + (_loc6_.getELevel() - 1) * 3) / 4 * _loc5_ * 6201 / 6550 * 1.8;
               break;
            case "fabao-sword":
               _loc6_ = this.getPlayer().getCurEquipByType("zbfb");
               _loc13_ = 1;
               _loc8_ = this.roleProperies.getHurt() * _loc6_.getELevel() * 0.05 * 6201 / 6550;
               qixue = this.roleProperies.getHaveblood() * _loc6_.getELevel() * 0.05 * _loc5_ * 6201 / 6550;
               break;
            case "magicsword2":
               _loc6_ = this.getPlayer().getCurEquipByType("zbfb");
               if(Boolean(_loc6_) && _loc6_.getWX().indexOf("木") != -1)
               {
                  _loc8_ = 0.0875 * this.roleProperies.getHurt() * _loc6_.getELevel() * 6201 / 6550;
                  qixue = 0.0875 * this.roleProperies.getHaveblood() * _loc5_ * _loc6_.getELevel() * 6201 / 6550;
               }
               _loc8_ = this.roleProperies.getHurt() * _loc6_.getELevel() * 0.0488 * 6201 / 6550;
               qixue = 0.0488 * this.roleProperies.getHaveblood() * _loc5_ * _loc6_.getELevel() * 6201 / 6550;
               _loc13_ = 1;
               break;
            case "fabao-snow":
               _loc6_ = this.getPlayer().getCurEquipByType("zbfb");
               _loc8_ = this.roleProperies.getHurt() * _loc6_.getELevel() * 0.09 * 6201 / 6550;
               qixue = 0.09 * this.roleProperies.getHaveblood() * _loc5_ * _loc6_.getELevel() * 6201 / 6550;
               break;
            case "hitNiumowangSzBuff":
               _loc3_ = 1;
               _loc4_ = this.getPlayer().getCurEquipByType("zbsz");
               if(_loc4_)
               {
                  if(_loc4_.getFillName() == "yxnmwsz")
                  {
                     _loc3_ = 0.6;
                  }
                  else if(_loc4_.getFillName() == "jlnmwsz")
                  {
                     _loc3_ = 0.8;
                  }
                  else if(_loc4_.getFillName() == "ssnmwsz")
                  {
                     _loc3_ = 1;
                  }
               }
               _loc8_ = this.roleProperies.getHurt() * _loc13_ * _loc5_ * _loc3_ * 6201 / 6550;
               qixue = _loc3_ * this.roleProperies.getHaveblood() * _loc5_ * 6201 / 6550;
               break;
            case "hitZhuanlunwangSzBuff":
               _loc3_ = 1;
               _loc4_ = this.getPlayer().getCurEquipByType("zbsz");
               if(_loc4_)
               {
                  if(_loc4_.getFillName() == "yxzlwsz")
                  {
                     _loc3_ = 5;
                  }
                  else if(_loc4_.getFillName() == "jlzlwsz")
                  {
                     _loc3_ = 6;
                  }
                  else if(_loc4_.getFillName() == "sszlwsz")
                  {
                     _loc3_ = 7;
                  }
               }
               _loc8_ = this.roleProperies.getHurt() * _loc13_ * _loc5_ * _loc3_ * 6201 / 6550;
               qixue = _loc3_ * this.roleProperies.getHaveblood() * _loc5_ * 6201 / 6550;
               break;
            case "hitTiantingZhanshenSzBuff":
               _loc3_ = 1;
               _loc4_ = this.getPlayer().getCurEquipByType("zbsz");
               if(_loc4_)
               {
                  if(_loc4_.getFillName() == "yxttzssz")
                  {
                     _loc3_ = 7;
                  }
                  else if(_loc4_.getFillName() == "jlttzssz")
                  {
                     _loc3_ = 8;
                  }
                  else if(_loc4_.getFillName() == "ssttzssz")
                  {
                     _loc3_ = 9;
                  }
               }
               _loc8_ = this.roleProperies.getHurt() * _loc13_ * _loc5_ * _loc3_ * 6201 / 6550;
               qixue = _loc3_ * this.roleProperies.getHaveblood() * _loc5_ * 6201 / 6550;
               break;
            case "Pearl":
               _loc6_ = this.getPlayer().getCurEquipByType("zbfb");
               if(Boolean(_loc6_) && _loc6_.getWX().indexOf("木") != -1)
               {
                  _loc8_ = 1.2 * this.roleProperies.getHurt() * 6201 / 6550;
                  qixue = 1.2 * this.roleProperies.getHaveblood() * _loc5_ * 6201 / 6550;
               }
               _loc8_ = this.roleProperies.getHurt() * 0.6 * 6201 / 6550;
               qixue = 0.6 * this.roleProperies.getHaveblood() * _loc5_ * 6201 / 6550;
               _loc13_ = 1;
               break;
            case "fabao-pearl":
               _loc6_ = this.getPlayer().getCurEquipByType("zbfb");
               if(Boolean(_loc6_) && _loc6_.getWX().indexOf("木") != -1)
               {
                  _loc8_ = _loc6_.getELevel() * 0.0473 * this.roleProperies.getHurt() * 6201 / 6550;
                  qixue = _loc6_.getELevel() * 0.0473 * this.roleProperies.getHaveblood() * _loc5_ * 6201 / 6550;
               }
               _loc13_ = 1;
               _loc8_ = _loc6_.getELevel() * 0.0315 * this.roleProperies.getHurt() * 6201 / 6550;
               qixue = _loc6_.getELevel() * 0.0315 * this.roleProperies.getHaveblood() * _loc5_ * 6201 / 6550;
               break;
            default:
               _loc8_ = 0;
         }
         return {
            "hurt":_loc8_ * 1.178,
            "qixue":qixue * 1.178,
            "atk":this.roleProperies.getPower()
         };
      }
      
      override public function addHeroHurtMc(param1:int) : void
      {
         var _loc2_:ANumber = new ANumber();
         gc.gameSence.addChild(_loc2_);
         _loc2_.aNumImage("pnum",param1,this.x - 20,this.y - 60,20);
      }
      
      override protected function isCannotMoveWhenAttackOnFloor() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3" || this.curAction == "hit4_1" || this.curAction == "hit4_2" || this.curAction == "hit5" || this.curAction == "hit6" || this.curAction == "hit7" || this.curAction == "hit8" || this.curAction == "hit9";
      }
      
      override protected function isCannotMoveWhenAttack() : Boolean
      {
         return this.curAction == "hit8" || this.curAction == "hit6" || this.curAction == "hit9";
      }
      
      override public function reduceHp(param1:int, param2:Boolean = false) : void
      {
         if(this.curAction == "hit9" || this.getCurAddEffect(BaseAddEffect.tjgl_Shield))
         {
            param2 = false;
         }
         if(this.getPlayer().getCurEquipByType("zbfj"))
         {
            if(this.getPlayer().getCurEquipByType("zbfj").getFillName().indexOf("zxpty") != -1)
            {
               param1 *= 0.9;
            }
         }
         super.reduceHp(param1,param2);
      }
      
      override public function setAttackBack(param1:Point) : void
      {
         if(!(this.curAction == "hit9" || this.getCurAddEffect(BaseAddEffect.tjgl_Shield)))
         {
            super.setAttackBack(param1);
         }
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
            this.role2Shalldow = null;
         }
         if(this.kk)
         {
            this.kk.destroy();
            this.kk = null;
         }
      }
   }
}

