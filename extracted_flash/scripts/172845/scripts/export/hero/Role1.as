package export.hero
{
   import base.*;
   import com.greensock.*;
   import com.hexagonstar.util.debug.*;
   import export.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.events.*;
   import flash.geom.*;
   import flash.utils.*;
   import manager.*;
   import my.*;
   
   public class Role1 extends BaseHero
   {
      
      private static var _this:Role1;
      
      private var tk:Boolean = false;
      
      private var huoyan:int = 0;
      
      private var hit11Count:uint = 35;
      
      private var lastlys:int;
      
      private var shallowArray:Array;
      
      private var hmzLianZhan:Array;
      
      private var hmzZaDi:Array;
      
      private var SkillFixedDamage:Array;
      
      private var FixedDamageCount:Array;
      
      private var SkillFactor:Array;
      
      private var hmzLianZhanFactor:Array;
      
      private var hmzZaDiFactor:Array;
      
      private var consumeMP:Array;
      
      public function Role1()
      {
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
         this.consumeMP = [66,160,208,276,364,493,703,759,801,921,1085,1133,1318,1771,1884,1954,2320,2667];
         this.shallowArray = [];
         super();
         roleName = "悟空";
         userType = "悟空";
         this.horizenSpeed = 6;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[2,-3],
            "attackInterval":999,
            "attackKind":"physics",
            "addprotection":1000 / 26
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":20,
            "attackBackSpeed":[0.5,-3],
            "attackInterval":999,
            "attackKind":"physics",
            "addprotection":1000 / 26
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":20,
            "attackBackSpeed":[0.5,-3],
            "attackInterval":999,
            "attackKind":"physics",
            "addprotection":1000 / 26
         };
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[4,-3],
            "attackInterval":999,
            "attackKind":"physics",
            "addprotection":1000 / 26
         };
         this.attackBackInfoDict["hit5"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[6,-2],
            "attackInterval":999,
            "attackKind":"physics",
            "addprotection":1000 / 26
         };
         this.attackBackInfoDict["hit6"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[5,-20],
            "attackInterval":999,
            "attackKind":"physics",
            "addprotection":1000 * 0.2 * 0.5
         };
         this.attackBackInfoDict["hit7"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[15,0],
            "attackInterval":4,
            "attackKind":"magic",
            "addprotection":1000 * 0.2 * 0.55 / 4
         };
         this.attackBackInfoDict["hit8"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[8,-2],
            "attackInterval":4,
            "attackKind":"physics",
            "addprotection":1000 * 0.2 * 0.6 / 12
         };
         this.attackBackInfoDict["hit8_2"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[6,-5],
            "attackInterval":4,
            "attackKind":"magic",
            "addprotection":1000 * 0.2 * 0.6 / 12
         };
         this.attackBackInfoDict["hit8_1"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[8,-2],
            "attackInterval":4,
            "attackKind":"physics",
            "addprotection":1000 * 0.2 * 0.6 / 12
         };
         this.attackBackInfoDict["hit8_2_1"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[6,-5],
            "attackInterval":4,
            "attackKind":"magic",
            "addprotection":1000 * 0.2 * 0.6 / 12
         };
         this.attackBackInfoDict["hit9"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[0,-2],
            "attackInterval":999,
            "attackKind":"physics",
            "addprotection":1000 * 0.2 * 0.6
         };
         this.attackBackInfoDict["hit10_2"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[1,0],
            "attackInterval":3,
            "attackKind":"physics",
            "addprotection":1000 * 0.2 / 8 * 0.6
         };
         this.attackBackInfoDict["hit10_3"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[10,20],
            "attackInterval":5,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit10_4"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[13,-15],
            "attackInterval":999,
            "attackKind":"physics",
            "addprotection":1000 * 0.2 * 0.6
         };
         this.attackBackInfoDict["hit11_1"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[20,0],
            "attackInterval":5,
            "attackKind":"magic",
            "addprotection":1000 * 0.2 * 0.8 / 13
         };
         this.attackBackInfoDict["hit11_2"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[0,-25],
            "attackInterval":5,
            "attackKind":"magic",
            "addprotection":1000 * 0.2 * 0.8 / 13
         };
         this.attackBackInfoDict["hit12"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[0,0],
            "attackInterval":5,
            "attackKind":"magic",
            "addprotection":1000 * 0.2 * 0.8 / 15
         };
         this.attackBackInfoDict["hit13"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[0,0],
            "attackInterval":999,
            "attackKind":"physics",
            "addprotection":1000 * 0.2 * 0.6
         };
         this.attackBackInfoDict["hit14"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[20,0],
            "attackInterval":999,
            "attackKind":"physics",
            "addprotection":1000 * 0.2 * 0.6
         };
         this.attackBackInfoDict["hit14_1"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[20,0],
            "attackInterval":999,
            "attackKind":"physics",
            "addprotection":1000 * 0.2 * 0.25
         };
         nameTextField.y = -this.colipse.height / 2 - 30;
         nameTextField.x = -this.colipse.width / 2 - 30;
         nameTextField.selectable = false;
         nameTextField.autoSize = "center";
         nameTextField.cacheAsBitmap = true;
         this.addChild(nameTextField);
      }
      
      public function setFatherBig() : void
      {
         this.setYourFather(7);
      }
      
      public function setFatherSmall() : void
      {
         this.setYourFather(3);
      }
      
      public function getCanBati() : Boolean
      {
         return this.canBati;
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:* = null;
         var _loc3_:uint = uint(this.getCurClothId());
         var _loc4_:uint = uint(this.getCurWeaponId());
         Debug.trace("weaponId:" + _loc4_);
         var _loc5_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("ROLE1_" + _loc3_);
         var _loc6_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("ROLE1_EQUIP_" + _loc4_);
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
            bbdc.setOffsetXY(5,-15);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[5,5],[4,4,4,4],[2,2,2,2],[1,1,13,100,this.hit11Count,this.hit11Count],[2,2,2,2,2],[2,2,1,1,3],[1,1,1,1,5],[1,1,1,1,5],[2,2,1,1,5],[2,2,1,6],[2,3,2,3],[17,15,15,10],[2,12,16]]);
            bbdc.setFrameCount([36,8,4,4,[1,1,1,1,1,1],5,5,5,5,5,4,4,[1,1,1,1],3]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            this.bbdc.turnRight();
            return;
         }
         throw new Error("ROLE1--BitmapData Error!");
      }
      
      override protected function newColipse() : void
      {
         this.colipse = AUtils.getNewObj("ObjectBaseSprite") as Sprite;
         this.colipse.visible = false;
         this.addChild(this.colipse);
      }
      
      override public function setAction(param1:String) : void
      {
         super.setAction(param1);
         if(param1 != "hit14")
         {
            this.bbdc.setOffsetXY(5,-15);
         }
         else
         {
            this.bbdc.setOffsetXY(5,-30);
         }
         var _loc2_:Point = this.bbdc.getCurPoint();
         switch(param1)
         {
            case "wait":
               if(_loc2_.y != 0)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(0);
               }
               this.bbdc.setState(param1);
               return;
            case "wait2":
               if(_loc2_.y != 1)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(1);
               }
               this.bbdc.setState(param1);
               return;
            case "walk":
               if(_loc2_.y != 2)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(2);
               }
               this.bbdc.setState(param1);
               return;
            case "run":
               if(_loc2_.y != 3)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(3);
               }
               this.bbdc.setState(param1);
               return;
            case "jump1":
               if(_loc2_.x != 0 || _loc2_.y != 4)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(param1);
               return;
            case "jump2":
               if(_loc2_.y != 5)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(5);
               }
               this.bbdc.setState(param1);
               return;
            case "jump3":
               if(_loc2_.x != 1 || _loc2_.y != 4)
               {
                  this.bbdc.setFramePointX(1);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(param1);
               return;
            case "hit1":
               if(_loc2_.y != 6)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(6);
               }
               this.bbdc.setState(param1);
               return;
            case "hit2":
               if(_loc2_.y != 6)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(6);
               }
               this.bbdc.setState(param1);
               return;
            case "hit3":
               if(_loc2_.y != 7)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(7);
               }
               this.bbdc.setState(param1);
               return;
            case "hit4":
               if(_loc2_.y != 8)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(8);
               }
               this.bbdc.setState(param1);
               return;
            case "hit5":
               if(_loc2_.y != 9)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(9);
               }
               this.bbdc.setState(param1);
               return;
            case "hit6":
               if(_loc2_.y != 10)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(10);
               }
               this.bbdc.setState(param1);
               return;
            case "hit7":
               if(_loc2_.x != 1 || _loc2_.y != 12)
               {
                  this.bbdc.setFramePointX(1);
                  this.bbdc.setFramePointY(12);
               }
               this.bbdc.setState(param1);
               return;
            case "hit8":
               if(_loc2_.y != 11)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(11);
               }
               this.bbdc.setState(param1);
               return;
            case "hit9":
               this.canBati = false;
               if(_loc2_.x != 2 || _loc2_.y != 4)
               {
                  this.bbdc.setFramePointX(2);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(param1);
               return;
            case "hit10":
               if(this.hmzCharge >= 3)
               {
                  this.hmzCharge = 0;
               }
               if(_loc2_.x != 3 || _loc2_.y != 4)
               {
                  this.bbdc.setFramePointX(3);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(param1);
               return;
            case "hit11_1":
               if(_loc2_.x != 4 || _loc2_.y != 4)
               {
                  this.bbdc.setFramePointX(4);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(param1);
               return;
            case "hit11_2":
               if(_loc2_.x != 5 || _loc2_.y != 4)
               {
                  this.bbdc.setFramePointX(5);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(param1);
               return;
            case "hit12":
               if(_loc2_.x != 0 || _loc2_.y != 12)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(12);
               }
               this.bbdc.setState(param1);
               return;
            case "hit13":
               if(_loc2_.x != 3 || _loc2_.y != 12)
               {
                  this.bbdc.setFramePointX(3);
                  this.bbdc.setFramePointY(12);
               }
               this.bbdc.setState(param1);
               return;
            case "hit14":
               if(_loc2_.x != 0 || _loc2_.y != 13)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(13);
               }
               this.bbdc.setState(param1);
               return;
            case "hurt":
               this.getBBDC().show();
               this.resetGraity();
               if(_loc2_.x == 2 && _loc2_.y == 12)
               {
                  this.getBBDC().resetCurFrameStopCount();
               }
               else
               {
                  this.bbdc.setFramePointX(2);
                  this.bbdc.setFramePointY(12);
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
            case "hit2":
               this.setAction("wait");
               return;
            case "hit3":
               this.setAction("wait");
               return;
            case "hit4":
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
               this.canBati = false;
               this.getBBDC().show();
               this.setStatic();
               this.speed.y = 0;
               this.lastlys = getTimer();
               if(!this.isInSky())
               {
                  this.setAction("wait");
                  return;
               }
               this.setAction("jump3");
               return;
               break;
            case "hit10":
               this.canBati = false;
               this.hit10Over();
               if(this.hmzCharge >= 3)
               {
                  this.hmzCharge = 0;
               }
               return;
            case "hit11_1":
               this.hit11Over();
               return;
            case "hit11_2":
               this.hit11Over();
               return;
            case "hit12":
               this.setAction("wait");
               return;
            case "hit13":
               if(!this.isInSky())
               {
                  this.setAction("wait");
                  return;
               }
               this.setAction("jump3");
               return;
               break;
            case "hit14":
               this.setAction("wait");
               return;
            case "hurt":
               this.setStatic();
               this.setAction("wait");
         }
      }
      
      override protected function enterFrameFunc(param1:Point) : void
      {
         var _loc2_:* = null;
         var _loc3_:* = null;
         var _loc4_:* = 0;
         var _loc5_:String = this.bbdc.getState();
         var _loc6_:Point = new Point();
         switch(_loc5_)
         {
            case "hit1":
            case "hit2":
               if(gc.sid == this.sid || gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     if(param1.x == 2)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc6_.x = this.x - 120;
                        }
                        else
                        {
                           _loc6_.x = this.x + 2 * 60;
                        }
                        _loc6_.y = this.y + 5;
                        this.doHit1(this.getBBDC().getDirect(),_loc6_);
                        if(gc.sid == this.sid)
                        {
                           gc.sendAttack(this.getRoleId(),"hit1",this.getBBDC().getDirect(),_loc6_.x,_loc6_.y,[]);
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
            case "hit3":
               if(gc.sid == this.sid || gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     if(param1.x == 0)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc6_.x = this.x - 30;
                        }
                        else
                        {
                           _loc6_.x = this.x + 30;
                        }
                        _loc6_.y = this.y - 110;
                        this.doHit3(this.getBBDC().getDirect(),_loc6_);
                        if(gc.sid == this.sid)
                        {
                           gc.sendAttack(this.getRoleId(),"hit3",this.getBBDC().getDirect(),_loc6_.x,_loc6_.y,[]);
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
            case "hit4":
               if(gc.sid == this.sid || gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     if(param1.x == 0)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc6_.x = this.x - 160;
                        }
                        else
                        {
                           _loc6_.x = this.x + 160;
                        }
                        _loc6_.y = this.y - 10;
                        this.doHit4(this.getBBDC().getDirect(),_loc6_);
                        if(gc.sid == this.sid)
                        {
                           gc.sendAttack(this.getRoleId(),"hit4",this.getBBDC().getDirect(),_loc6_.x,_loc6_.y,[]);
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
            case "hit5":
               if(gc.sid == this.sid || gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     if(param1.x == 2)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc6_.x = this.x - 165;
                        }
                        else
                        {
                           _loc6_.x = this.x + 165;
                        }
                        _loc6_.y = this.y - 20;
                        this.doHit5(this.getBBDC().getDirect(),_loc6_);
                        if(gc.sid == this.sid)
                        {
                           gc.sendAttack(this.getRoleId(),"hit5",this.getBBDC().getDirect(),_loc6_.x,_loc6_.y,[]);
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
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     if(param1.x == 1)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc6_.x = this.x - 30;
                        }
                        else
                        {
                           _loc6_.x = this.x + 30;
                        }
                        _loc6_.y = this.y + 40;
                        this.doHit6(this.getBBDC().getDirect(),_loc6_);
                        if(gc.sid == this.sid)
                        {
                           gc.sendAttack(this.getRoleId(),"hit6",this.getBBDC().getDirect(),_loc6_.x,_loc6_.y,[]);
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
            case "hit7":
               if(gc.sid == this.sid || gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 15)
                  {
                     if(param1.x == 1)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc6_.x = this.x - 175;
                        }
                        else
                        {
                           _loc6_.x = this.x + 175;
                        }
                        _loc6_.y = this.y - 30;
                        this.doHit7(this.getBBDC().getDirect(),_loc6_);
                        if(gc.sid == this.sid)
                        {
                           gc.sendAttack(this.getRoleId(),"hit7",this.getBBDC().getDirect(),_loc6_.x,_loc6_.y,[]);
                        }
                     }
                  }
               }
               if(this.bbdc.getDirect() == 0)
               {
                  this.speed.x = -25 * this.bbdc.getCurFrameCount() / 15;
                  return;
               }
               this.speed.x = 25 * this.bbdc.getCurFrameCount() / 15;
               return;
               break;
            case "hit8":
               if(gc.sid == this.sid || gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     if(param1.x == 0)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc6_.x = this.x + 20;
                        }
                        else
                        {
                           _loc6_.x = this.x - 20;
                        }
                        _loc6_.y = this.y + 30;
                        this.doHit8(this.getBBDC().getDirect(),_loc6_);
                        if(gc.sid == this.sid)
                        {
                           gc.sendAttack(this.getRoleId(),"hit8",this.getBBDC().getDirect(),_loc6_.x,_loc6_.y,[]);
                        }
                     }
                  }
               }
               if(this.bbdc.getCurFrameCount() == 2)
               {
                  if(param1.x == 0)
                  {
                     for each(_loc2_ in this.shallowArray)
                     {
                        if(_loc2_)
                        {
                           if(!_loc2_.isReadyToDestroy)
                           {
                              _loc2_.setAction("hit1");
                           }
                        }
                     }
                     return;
                  }
                  return;
               }
               return;
               break;
            case "hit9":
               if(gc.sid == this.sid || gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 12)
                  {
                     if(param1.x == 2)
                     {
                        this.setLYSFather(12);
                     }
                  }
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     if(param1.x == 2)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc6_.x = this.x - 120;
                        }
                        else
                        {
                           _loc6_.x = this.x + 2 * 60;
                        }
                        _loc6_.y = this.y - 50;
                        this.doHit9(this.getBBDC().getDirect(),_loc6_);
                        if(gc.sid == this.sid)
                        {
                           gc.sendAttack(this.getRoleId(),"hit9",this.getBBDC().getDirect(),_loc6_.x,_loc6_.y,[]);
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
            case "hit10":
               this.setLostGraity();
               if(this.bbdc.getCurFrameCount() == 99)
               {
                  if(param1.x == 3)
                  {
                     _loc6_ = new Point(this.x,this.y);
                     if(gc.sid == this.sid)
                     {
                        gc.sendAttack(this.getRoleId(),"hit10_2",this.getBBDC().getDirect(),_loc6_.x,_loc6_.y,[]);
                     }
                     this.doHit10_2(this.getBBDC().getDirect(),_loc6_);
                     if(this.getBBDC().getDirect() == 0)
                     {
                        this.speed.x = -6.5;
                     }
                     else
                     {
                        this.speed.x = 6.5;
                     }
                     this.speed.y = 0.8;
                  }
                  else
                  {
                     this.speed.y = 20;
                  }
               }
               return;
            case "hit11_1":
               if(gc.sid == this.sid || gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == this.hit11Count)
                  {
                     if(param1.x == 4)
                     {
                        this.doHit11_1(this.getBBDC().getDirect(),_loc6_);
                        if(gc.sid == this.sid)
                        {
                           gc.sendAttack(this.getRoleId(),"hit11_1",this.getBBDC().getDirect(),_loc6_.x,_loc6_.y,[]);
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
            case "hit11_2":
               if(gc.sid == this.sid || gc.isSingleGame())
               {
                  _loc3_ = this.bbdc.getFrameStopCount();
                  _loc4_ = uint(_loc3_[4][5]);
                  if(this.bbdc.getCurFrameCount() == _loc4_)
                  {
                     if(param1.x == 5)
                     {
                        this.doHit11_2(this.getBBDC().getDirect(),_loc6_);
                        if(gc.sid == this.sid)
                        {
                           gc.sendPositionAndDirect(this);
                           gc.sendAttack(this.getRoleId(),"hit11_2",this.getBBDC().getDirect(),_loc6_.x,_loc6_.y,[]);
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
            case "hit12":
               if(gc.sid == this.sid || gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 17)
                  {
                     if(param1.x == 0)
                     {
                        this.doHit12_1(this.getBBDC().getDirect(),_loc6_);
                        if(gc.sid == this.sid)
                        {
                           gc.sendAttack(this.getRoleId(),"hit12_1",this.getBBDC().getDirect(),_loc6_.x,_loc6_.y,[]);
                           return;
                        }
                        return;
                     }
                     return;
                  }
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     if(param1.x == 0)
                     {
                        if(gc.sid == this.sid || gc.isSingleGame())
                        {
                           this.doHit12_2(this.getBBDC().getDirect(),_loc6_);
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
            case "hit13":
               if(gc.sid == this.sid || gc.isSingleGame())
               {
                  if(param1.x == 3)
                  {
                     _loc6_.x = this.x;
                     _loc6_.y = this.y;
                     this.checkHit13(this.getBBDC().getDirect(),_loc6_);
                     if(gc.sid == this.sid)
                     {
                        if(gc.sid == this.sid)
                        {
                           gc.sendAttack(this.getRoleId(),"hit13Check",this.getBBDC().getDirect(),_loc6_.x,_loc6_.y,[]);
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
            case "hit14":
               if(gc.sid == this.sid || gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     if(param1.x == 0)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc6_.x = this.x;
                        }
                        else
                        {
                           _loc6_.x = this.x;
                        }
                        _loc6_.y = this.y - 85;
                        if(gc.sid == this.sid)
                        {
                           gc.sendAttack(this.getRoleId(),"hit14_1",this.getBBDC().getDirect(),_loc6_.x,_loc6_.y,[]);
                        }
                        this.doHit14_1(this.getBBDC().getDirect(),_loc6_);
                     }
                  }
                  else if(this.bbdc.getCurFrameCount() == 16)
                  {
                     if(param1.x == 2)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc6_.x = this.x - 145;
                        }
                        else
                        {
                           _loc6_.x = this.x + 145;
                        }
                        _loc6_.y = this.y - 60;
                        if(gc.sid == this.sid)
                        {
                           gc.sendAttack(this.getRoleId(),"hit14_2",this.getBBDC().getDirect(),_loc6_.x,_loc6_.y,[]);
                        }
                        this.doHit14_2(this.getBBDC().getDirect(),_loc6_);
                     }
                  }
               }
               if(this.bbdc.getCurFrameCount() == 2)
               {
                  if(param1.x == 0)
                  {
                     for each(_loc2_ in this.shallowArray)
                     {
                        if(_loc2_)
                        {
                           if(!_loc2_.isReadyToDestroy)
                           {
                              _loc2_.setAction("hit2");
                           }
                        }
                     }
                  }
               }
               this.speed.y = 0;
         }
      }
      
      private function doHit1(param1:uint, param2:Point) : void
      {
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role1Bullet1");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit1");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit3(param1:uint, param2:Point) : void
      {
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role1Bullet3");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit3");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit4(param1:uint, param2:Point) : void
      {
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role1Bullet4");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit4");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit5(param1:uint, param2:Point) : void
      {
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role1Bullet5");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit5");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit6(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role1_hit6");
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role1Bullet6");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit6");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit7(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role1_hit7");
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role1Bullet7");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit7");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      public function doHit8(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role1_hit8");
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role1Bullet8_1");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit8");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
         this.doHit8_2(param1,param2);
      }
      
      public function doHit8_1(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role1_hit8");
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role1Bullet8_1");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit8_1");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
         this.doHit8_2_1(param1,param2);
      }
      
      private function doHit8_2(param1:uint, param2:Point) : void
      {
         var _loc3_:EnemyMoveBullet = new EnemyMoveBullet("Role1Bullet8_2");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         if(param1 == 0)
         {
            _loc3_.setSpeed(-15);
         }
         else
         {
            _loc3_.setSpeed(15);
         }
         _loc3_.setDestroyWhenLastFrame(false);
         _loc3_.setDistance(600);
         _loc3_.setRole(this);
         _loc3_.setDirect(0);
         _loc3_.setAction("hit8_2");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit8_2_1(param1:uint, param2:Point) : void
      {
         var _loc3_:EnemyMoveBullet = new EnemyMoveBullet("Role1Bullet8_2");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         if(param1 == 0)
         {
            _loc3_.setSpeed(-15);
         }
         else
         {
            _loc3_.setSpeed(15);
         }
         _loc3_.setDestroyWhenLastFrame(false);
         _loc3_.setDistance(600);
         _loc3_.setRole(this);
         _loc3_.setDirect(0);
         _loc3_.setAction("hit8_2_1");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit9(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role1_hit9");
         this.getBBDC().hide();
         this.speed.y = 0;
         this.setLostGraity();
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role1Bullet9");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         if(this.tk)
         {
            _loc3_.x = this.x + 60;
            _loc3_.rotation = 90;
         }
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit9");
         _loc3_.setFuncWhenDestroy(this.afterhit9);
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
         if(this.tk)
         {
            this.speed.y = -36;
            this.speed.x = 0;
         }
         else if(this.bbdc.getDirect() == 0)
         {
            this.speed.x = -40;
         }
         else
         {
            this.speed.x = 40;
         }
         this.tk = false;
      }
      
      private function afterhit9(param1:BaseBullet) : *
      {
         this.resetGraity();
      }
      
      private function doHit10_1(param1:uint, param2:Point) : void
      {
         if(this.bbdc.getDirect() == 0)
         {
            this.speed.x = -28;
         }
         else
         {
            this.speed.x = 28;
         }
         this.speed.y = -35;
      }
      
      private function doHit10_2(param1:uint, param2:Point) : void
      {
         var _loc3_:BaseObject = null;
         var _loc4_:SpecialEffectBullet = null;
         var _loc5_:uint = 0;
         var _loc6_:uint = param1;
         var _loc7_:Point = param2;
         SoundManager.play("Role1_hit10_2");
         this.setStatic();
         this.setLostGraity();
         this.getBBDC().hide();
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
         var _loc8_:uint = gc.obbsiteArray.length;
         _loc3_ = gc.obbsiteArray[_loc5_] as BaseObject;
         this.setHMZFather(21);
         _loc4_ = new SpecialEffectBullet("Role1Bullet10_2");
         if(this.bbdc.getDirect() == 0)
         {
            _loc4_.x = _loc7_.x - 150;
         }
         else
         {
            _loc4_.x = _loc7_.x + 150;
         }
         _loc4_.y = _loc7_.y - 35;
         _loc4_.setRole(this);
         _loc4_.setDirect(_loc6_);
         _loc4_.setAction("hit10_2");
         _loc4_.setHurtCanCutDownEffect(true);
         this.lastHit = "hit10_2";
         gc.gameSence.addChild(_loc4_);
         _loc4_.setFuncWhenDestroy(this.afterhit10);
         this.magicBulletArray.push(_loc4_);
      }
      
      private function afterhit10(param1:BaseBullet) : *
      {
         if(this.curAction == "hit10")
         {
            this.doHit10_4(this.getBBDC().getDirect());
         }
      }
      
      private function doHit10_3(param1:uint, param2:Point) : void
      {
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("Role1Bullet10_3");
         _loc3_.x = this.x;
         _loc3_.y = this.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit10_3");
         this.lastHit = "hit10_3";
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
         this.resetGraity();
         if(this.bbdc.getDirect() == 0)
         {
            this.speed.x = -40;
         }
         else
         {
            this.speed.x = 40;
         }
         this.speed.y = 40;
      }
      
      private function doHit10_4(param1:uint) : void
      {
         var b:SpecialEffectBullet = null;
         var direct:uint = param1;
         SoundManager.play("Role1_hit10_4");
         b = new SpecialEffectBullet("Role1Bullet10_4_tmp");
         b.x = this.x;
         b.y = this.y + 40;
         b.setRole(this);
         b.setDirect(direct);
         b.setAction("hit10_4");
         this.lastHit = "hit10_4";
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
         this.setStatic();
         TweenMax.delayedCall(0.5,function(param1:Role1):*
         {
            param1.hit10Over();
         },[this]);
         TweenMax.delayedCall(0.64,function(param1:Role1):*
         {
            param1.resetGraity();
         },[this]);
      }
      
      private function hit10Over() : void
      {
         this.getBBDC().show();
         this.setAction("wait");
      }
      
      private function hit11Over() : *
      {
         var _loc1_:* = null;
         for each(_loc1_ in this.magicBulletArray)
         {
            if(_loc1_.getImcName() == "Role1Bullet11_1" || _loc1_.getImcName() == "Role1Bullet11_2")
            {
               _loc1_.destroy();
            }
         }
         this.resetGraity();
         this.speed.y = 0;
         if(!this.isInSky())
         {
            this.setAction("wait");
         }
         else
         {
            this.setAction("jump3");
         }
      }
      
      private function doHit11_1(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role1_hit11");
         if(this.bbdc.getDirect() == 0)
         {
            this.speed.x = -25;
         }
         else
         {
            this.speed.x = 25;
         }
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role1Bullet11_1");
         if(this.bbdc.getDirect() == 0)
         {
            _loc3_.x = this.x - 50;
         }
         else
         {
            _loc3_.x = this.x + 50;
         }
         _loc3_.y = this.y - 50;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit11_1");
         this.lastHit = "hit11_1";
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit11_2(param1:uint, param2:Point) : void
      {
         var _loc3_:* = null;
         var _loc4_:* = null;
         SoundManager.play("Role1_hit11");
         this.speed.x = 0;
         this.speed.y = -25;
         this.setLostGraity();
         for each(_loc3_ in this.magicBulletArray)
         {
            if(_loc3_.getImcName() == "Role1Bullet11_1")
            {
               _loc3_.destroy();
            }
         }
         _loc4_ = new FollowBaseObjectBullet("Role1Bullet11_2");
         if(this.bbdc.getDirect() == 0)
         {
            _loc4_.x = this.x;
         }
         else
         {
            _loc4_.x = this.x;
         }
         _loc4_.y = this.y - 50;
         _loc4_.setRole(this);
         _loc4_.setDirect(param1);
         _loc4_.setAction("hit11_2");
         this.lastHit = "hit11_2";
         gc.gameSence.addChild(_loc4_);
         this.magicBulletArray.push(_loc4_);
      }
      
      private function doHit12_1(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role1_hit12_1");
         var _loc3_:MovieClip = AUtils.getNewObj("Role1Bullet12_1_1") as MovieClip;
         var _loc4_:MovieClip = AUtils.getNewObj("Role1Bullet12_1_2") as MovieClip;
         if(this.bbdc.getDirect() == 0)
         {
            _loc3_.x = this.x - 22;
         }
         else
         {
            _loc3_.x = this.x + 21;
            AUtils.flipHorizontal(_loc3_,-1);
         }
         _loc3_.y = this.y - 10;
         if(this.bbdc.getDirect() == 0)
         {
            _loc4_.x = this.x - 55;
         }
         else
         {
            _loc4_.x = this.x - 65;
         }
         _loc4_.y = this.y;
         gc.gameSence.addChild(_loc3_);
         gc.gameSence.addChild(_loc4_);
      }
      
      private function doHit12_2(param1:uint, param2:Point) : void
      {
         var _loc3_:BaseObject = null;
         var _loc4_:BaseObject = null;
         var _loc5_:Number = 36000;
         if(gc.isInRoom())
         {
            gc.obbsiteArray = gc.pWorld.getOtherHeroArray();
         }
         else
         {
            gc.obbsiteArray = gc.pWorld.monsterArray;
         }
         var _loc6_:uint = gc.obbsiteArray.length;
         if(_loc6_ != 0)
         {
            if(_loc6_ > this.huoyan)
            {
               _loc4_ = gc.obbsiteArray[this.huoyan] as BaseObject;
               if(this.getBBDC().getDirect() == 0)
               {
                  if(_loc4_.x >= this.x)
                  {
                     return;
                  }
               }
               if(this.getBBDC().getDirect() != 0)
               {
                  if(_loc4_.x <= this.x)
                  {
                     return;
                  }
               }
               if(_loc5_ > AUtils.GetDisBetweenTwoObj(this,_loc4_))
               {
                  _loc5_ = AUtils.GetDisBetweenTwoObj(this,_loc4_);
                  _loc3_ = _loc4_;
               }
               this.huoyan += 1;
            }
            else
            {
               this.huoyan = 0;
               _loc4_ = gc.obbsiteArray[this.huoyan] as BaseObject;
               if(this.getBBDC().getDirect() == 0)
               {
                  if(_loc4_.x >= this.x)
                  {
                     return;
                  }
               }
               if(this.getBBDC().getDirect() != 0)
               {
                  if(_loc4_.x <= this.x)
                  {
                     return;
                  }
               }
               if(_loc5_ > AUtils.GetDisBetweenTwoObj(this,_loc4_))
               {
                  _loc5_ = AUtils.GetDisBetweenTwoObj(this,_loc4_);
                  _loc3_ = _loc4_;
               }
            }
            if(_loc3_)
            {
               this.hit12Boom(_loc3_,this,4);
            }
         }
      }
      
      private function hit12Boom(param1:BaseObject, param2:Role1, param3:uint) : void
      {
         var _self:Role1 = null;
         _self = null;
         var b:SpecialEffectBullet = null;
         var _target:BaseObject = param1;
         _self = param2;
         var times:uint = param3;
         if(times > 0)
         {
            if(!this.isDead())
            {
               SoundManager.play("Role1_hit12_2");
               b = new SpecialEffectBullet("Role1Bullet12");
               b.x = _target.x;
               b.y = _target.y;
               b.setRole(_self);
               b.setDirect(_self.getBBDC().getDirect());
               b.setAction("hit12");
               gc.gameSence.addChild(b);
               _self.magicBulletArray.push(b);
               gc.sendAttack(this.getRoleId(),"otherShowHit12",this.getBBDC().getDirect(),_target.x,_target.y,[]);
               times--;
               TweenMax.delayedCall(1.2,function(param1:BaseObject, param2:Role1, param3:uint):*
               {
                  _self.hit12Boom(param1,param2,param3);
               },[_target,_self,times]);
            }
            else
            {
               times = 0;
            }
         }
      }
      
      private function otherShowHit12(param1:uint, param2:Point) : void
      {
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("Role1Bullet12");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setDisable();
         _loc3_.setAction("hit12_2");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function checkHit13(param1:uint, param2:Point) : void
      {
         var _loc3_:* = null;
         var _loc4_:* = null;
         SoundManager.play("Role1_hit13_1");
         this.curAction = "hit13";
         if(param1 == 0)
         {
            this.speed.x = -30;
         }
         else
         {
            this.speed.x = 30;
         }
         if(gc.sid == this.sid || gc.isSingleGame())
         {
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
            for each(_loc3_ in gc.obbsiteArray)
            {
               if(this.colipse.hitTestObject(_loc3_.colipse))
               {
                  _loc4_ = new Point();
                  _loc4_.x = _loc3_.x;
                  _loc4_.y = _loc3_.y;
                  this.doHit13(this.getBBDC().getDirect(),_loc4_);
                  if(gc.isInRoom())
                  {
                     gc.sendAttack(this.getRoleId(),"hit13",this.getBBDC().getDirect(),_loc4_.x,_loc4_.y,[]);
                  }
                  return;
               }
            }
         }
      }
      
      private function doHit13(param1:uint, param2:Point) : void
      {
         var b:SpecialEffectBullet = null;
         var direct:uint = param1;
         var point:Point = param2;
         SoundManager.play("Role1_hit13_2");
         this.curAction = "hit13";
         this.getBBDC().stopFrame();
         this.setStatic();
         this.getBBDC().hide();
         TweenMax.delayedCall(1.25,function(param1:Role1):*
         {
            param1.setAction("wait");
            param1.getBBDC().continueFrame();
            param1.getBBDC().show();
         },[this]);
         b = new SpecialEffectBullet("Role1Bullet13");
         b.x = point.x;
         b.y = point.y;
         b.setRole(this);
         b.setDirect(direct);
         b.setAction("hit13");
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
      }
      
      public function createShallow(param1:uint = 0, param2:Point = null) : void
      {
         var _loc3_:* = null;
         if(!param2)
         {
            _loc3_ = new Point();
            _loc3_.x = this.x + (Math.random() - 0.5) * 150;
            _loc3_.y = this.y;
         }
         else
         {
            _loc3_ = param2;
         }
         var _loc4_:Role1Shadow = new Role1Shadow(this);
         if(this.getBBDC().getDirect() == 1)
         {
            _loc4_.getBBDC().turnRight();
         }
         _loc4_.x = _loc3_.x;
         _loc4_.y = _loc3_.y;
         gc.gameSence.addChild(_loc4_);
         this.shallowArray.push(_loc4_);
         if(this.sid == gc.sid && gc.isInRoom())
         {
            gc.sendAttack(this.getRoleId(),"createShallow",0,_loc3_.x,_loc3_.y,[]);
         }
      }
      
      public function doHit14_1(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role1_hit14");
         this.curAction = "hit14";
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("Role1Bullet14_1");
         if(param1 == 0)
         {
            _loc3_.x = param2.x + 15;
         }
         else
         {
            _loc3_.x = param2.x - 15;
         }
         _loc3_.y = param2.y;
         _loc3_.setDisable();
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit14");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      public function doHit14_2(param1:uint, param2:Point) : void
      {
         this.curAction = "hit14";
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("Role1Bullet14_2");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit14");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      public function doHit14_2_1(param1:uint, param2:Point) : void
      {
         this.curAction = "hit14";
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("Role1Bullet14_2");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit14_1");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      override public function setOtherAttack(param1:String, param2:uint, param3:Point, param4:Array = null, param5:uint = 0) : void
      {
         switch(param1)
         {
            case "hit1":
               this.doHit1(param2,param3);
               return;
            case "hit3":
               this.doHit3(param2,param3);
               return;
            case "hit4":
               this.doHit4(param2,param3);
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
            case "hit9":
               this.doHit9(param2,param3);
               return;
            case "hit10_1":
               this.doHit10_1(param2,param3);
               return;
            case "hit10_2":
               this.doHit10_2(param2,param3);
               return;
            case "hit10_3":
               this.doHit10_3(param2,param3);
               return;
            case "hit10_4":
               this.doHit10_4(param2,param3);
               return;
            case "hit11_1":
               this.doHit11_1(param2,param3);
               return;
            case "hit11_2":
               this.doHit11_2(param2,param3);
               return;
            case "hit12_1":
               this.doHit12_1(param2,param3);
               return;
            case "otherShowHit12":
               this.otherShowHit12(param2,param3);
               return;
            case "hit13":
               this.doHit13(param2,param3);
               return;
            case "hit13Check":
               this.checkHit13(param2,param3);
               return;
            case "hit14_1":
               this.doHit14_1(param2,param3);
               return;
            case "hit14_2":
               this.doHit14_2(param2,param3);
               return;
            case "createShallow":
               this.createShallow(param2,param3);
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
         var _loc1_:int = 0;
         var _loc2_:* = null;
         super.step();
         var _loc3_:uint = uint(this.shallowArray.length);
         while(_loc1_ < _loc3_)
         {
            _loc2_ = this.shallowArray[_loc1_] as Role1Shadow;
            if(_loc2_)
            {
               if(_loc2_.isReadyToDestroy)
               {
                  this.shallowArray[_loc1_] = null;
               }
               else
               {
                  _loc2_.step();
               }
            }
            _loc1_++;
         }
      }
      
      override protected function myKeyDown(param1:String) : *
      {
         var sl:int = 0;
         var needMp:uint = 0;
         var keyStr:String = param1;
         super.myKeyDown(keyStr);
         if(keyStr != "0001")
         {
            this.tk = false;
         }
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
                  cannextaction = false;
                  return;
               case "0101":
                  if(this.isAttacking() || this.isBeAttacking())
                  {
                     return;
                  }
                  if(this.getPlayer())
                  {
                     if(this.getPlayer().findSkillIsInTheSkillAry("slz"))
                     {
                        needMp = uint(int(this.consumeMP[this.player.returnSkillLevelBySkillName("slz") - 1] * 0.55));
                        if(this.roleProperies.getMMP() >= needMp)
                        {
                           this.skill_slz(needMp);
                           return;
                        }
                        this.normalHit();
                        return;
                     }
                     this.normalHit();
                     return;
                  }
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
                     if(!gc.isInHost())
                     {
                        TweenMax.to(gc.gameInfo,1,{"alpha":0});
                        TweenMax.to(gc.gameSence,1,{
                           "alpha":0,
                           "onComplete":function():*
                           {
                              gc.eventManger.dispatchEvent(new Event("LevelVictor"));
                              MainGame.getInstance().levelClear();
                           }
                        });
                     }
                  }
                  sl = int(this.player.returnSkillLevelBySkillName("lys"));
                  if(sl < 1)
                  {
                     break;
                  }
                  this.tk = true;
            }
         }
      }
      
      private function skill_slz(param1:uint) : void
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
         this.hitNum = 0;
         this.timers = 15;
         this.newAttackId();
         if(this.getPlayer())
         {
            gc.sendPosition(this);
         }
         this.roleProperies.setMMP(this.roleProperies.getMMP() - param1);
      }
      
      private function skill_zz(param1:uint) : void
      {
         if(this.roleProperies.getMMP() < param1)
         {
            return;
         }
         if(this.isAttacking() || this.isBeAttacking())
         {
            return;
         }
         this.setAction("hit14");
         this.curAction = "hit14";
         this.hitNum = 0;
         this.timers = 20;
         this.newAttackId();
         if(this.getPlayer())
         {
            gc.sendPosition(this);
         }
         this.roleProperies.setMMP(this.roleProperies.getMMP() - param1);
      }
      
      private function skill_qsez(param1:uint) : void
      {
         if(this.roleProperies.getMMP() < param1)
         {
            return;
         }
         if(this.isAttacking() || this.isBeAttacking())
         {
            return;
         }
         this.setAction("hit13");
         this.curAction = "hit13";
         this.hitNum = 0;
         this.timers = 20;
         this.newAttackId();
         if(this.getPlayer())
         {
            gc.sendPosition(this);
         }
         this.roleProperies.setMMP(this.roleProperies.getMMP() - param1);
      }
      
      private function skill_hmz(param1:uint) : void
      {
         if(this.roleProperies.getMMP() < param1)
         {
            return;
         }
         if(this.isAttacking() || this.isBeAttacking())
         {
            return;
         }
         this.lastHit = "hit10";
         this.setAction("hit10");
         this.hitNum = 0;
         this.timers = 30;
         if(this.getPlayer())
         {
            gc.sendPosition(this);
         }
         this.roleProperies.setMMP(this.roleProperies.getMMP() - param1);
      }
      
      private function skill_lys(param1:uint) : void
      {
         if(getTimer() - this.lastlys < 36)
         {
            return;
         }
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
      
      private function skill_hytj(param1:uint) : void
      {
         if(this.roleProperies.getMMP() < param1)
         {
            return;
         }
         if(this.isAttacking() || this.isBeAttacking())
         {
            return;
         }
         this.hitNum = 0;
         this.doubleCount = 0;
         this.setAction("hit7");
         this.lastHit = "hit7";
         if(this.getPlayer())
         {
            gc.sendPosition(this);
         }
         this.roleProperies.setMMP(this.roleProperies.getMMP() - param1);
      }
      
      private function skill_lyfb(param1:uint) : void
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
      
      private function skill_jdy(param1:uint) : void
      {
         var _loc2_:* = null;
         if(!this.isAttacking())
         {
            if(this.roleProperies.getMMP() < param1)
            {
               return;
            }
         }
         if(this.curAction != "hit11_1")
         {
            if(this.isAttacking() || this.isBeAttacking())
            {
               return;
            }
         }
         if(this.curAction != "hit11_1")
         {
            this.setAction("hit11_1");
            this.lastHit = "hit11_1";
            this.hitNum = 0;
            this.timers = this.hit11Count;
            this.newAttackId();
            if(this.getPlayer())
            {
               gc.sendPosition(this);
            }
            this.roleProperies.setMMP(this.roleProperies.getMMP() - param1);
         }
         else
         {
            _loc2_ = this.bbdc.getFrameStopCount();
            _loc2_[4][5] = this.bbdc.getCurFrameCount();
            this.setAction("hit11_2");
            this.lastHit = "hit11_2";
            this.hitNum = 0;
            this.timers = this.hit11Count;
            this.newAttackId();
            if(this.getPlayer())
            {
               gc.sendPosition(this);
            }
         }
      }
      
      private function skill_hyjj(param1:uint) : void
      {
         if(this.roleProperies.getMMP() < param1)
         {
            return;
         }
         if(this.isAttacking() || this.isBeAttacking())
         {
            return;
         }
         if(this.isInSky())
         {
            return;
         }
         this.setAction("hit12");
         this.curAction = "hit12";
         this.hitNum = 0;
         this.timers = 17;
         this.newAttackId();
         if(this.getPlayer())
         {
            gc.sendPosition(this);
         }
         this.roleProperies.setMMP(this.roleProperies.getMMP() - param1);
      }
      
      override protected function showSkill(param1:String) : void
      {
         var _loc2_:* = null;
         var _loc3_:* = null;
         var _loc4_:* = 0;
         var _loc7_:Number = 0;
         if(this.getPlayer())
         {
            _loc2_ = ["Y","U","I","O","L"];
            _loc3_ = this.getPlayer().returnSkillNameBySkillKey(param1);
            if(_loc3_)
            {
               param1 = _loc3_[0];
               _loc4_ = uint(parseInt(_loc3_[1]));
               if(param1 == "slz")
               {
                  _loc7_ = Number(this.player.returnSkillLevelBySkillName("slz") - 1);
                  this.skill_slz(_loc4_ = this.consumeMP[_loc7_] * 0.55);
               }
               else if(param1 == "hmz")
               {
                  _loc7_ = Number(this.player.returnSkillLevelBySkillName("hmz") - 1);
                  this.skill_hmz(_loc4_ = this.consumeMP[_loc7_]);
               }
               else if(param1 == "hyjj")
               {
                  _loc7_ = Number(this.player.returnSkillLevelBySkillName("hyjj") - 1);
                  this.skill_hyjj(_loc4_ = this.consumeMP[_loc7_] * 1.1);
               }
               else if(param1 == "zz")
               {
                  _loc7_ = Number(this.player.returnSkillLevelBySkillName("zz") - 1);
                  this.skill_zz(_loc4_ = this.consumeMP[_loc7_] * 0.75);
               }
               else if(param1 == "qsez")
               {
                  _loc7_ = Number(this.player.returnSkillLevelBySkillName("qsez") - 1);
                  this.skill_qsez(_loc4_ = this.consumeMP[_loc7_] * 0.6);
               }
               else if(param1 == "lys")
               {
                  _loc7_ = Number(this.player.returnSkillLevelBySkillName("lys") - 1);
                  this.skill_lys(_loc4_ = this.consumeMP[_loc7_] * 0.45);
               }
               else if(param1 == "hytj")
               {
                  _loc7_ = Number(this.player.returnSkillLevelBySkillName("hytj") - 1);
                  this.skill_hytj(_loc4_ = this.consumeMP[_loc7_] * 0.6);
               }
               else if(param1 == "lyfb")
               {
                  _loc7_ = Number(this.player.returnSkillLevelBySkillName("lyfb") - 1);
                  this.skill_lyfb(_loc4_ = this.consumeMP[_loc7_] * 0.65);
               }
               else if(param1 == "jdy")
               {
                  _loc7_ = Number(this.player.returnSkillLevelBySkillName("jdy") - 1);
                  this.skill_jdy(_loc4_ = this.consumeMP[_loc7_]);
               }
               if(this.curAddEffect.curDebuff(BaseAddEffect.MONSTER65_AOE) || this.curAddEffect.curDebuff(BaseAddEffect.MONSTER129Buff))
               {
                  this.reduceHp(_loc4_);
               }
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
      
      override public function reduceHp(param1:int, param2:Boolean = false) : void
      {
         if(this.isGXP)
         {
            param2 = false;
         }
         if(this.canBati)
         {
            if(this.curAction == "hit9" || this.curAction == "hit10")
            {
               param2 = false;
            }
         }
         if(this.curAction == "hit9" || this.curAction == "hit10")
         {
            param2 = false;
         }
         if(this.getPlayer().getCurEquipByType("zbfj"))
         {
            if(this.getPlayer().getCurEquipByType("zbfj").getFillName().indexOf("zxstj") != -1)
            {
               param1 *= 0.9;
            }
         }
         super.reduceHp(param1,param2);
      }
      
      override public function setAttackBack(param1:Point) : void
      {
         if(this.canBati)
         {
            if(!(this.isGXP || this.curAction == "hit9" || this.curAction == "hit10"))
            {
               super.setAttackBack(param1);
            }
         }
         else if(!(this.isGXP || this.curAction == "hit9" || this.curAction == "hit10"))
         {
            super.setAttackBack(param1);
         }
      }
      
      override public function normalHit() : *
      {
         var _loc1_:int = 0;
         this.curtime = getTimer();
         if(this.timers <= 0)
         {
            if(!this.isInSky())
            {
               if(!this.isRunning() && (!this.isAttacking() || this.isNormalHit()))
               {
                  if(this.curtime - this.lasttime > 25 * 60)
                  {
                     this.hitNum = 1;
                  }
                  else if(++this.hitNum > 5)
                  {
                     this.hitNum = 1;
                  }
                  switch(this.hitNum)
                  {
                     case 1:
                     case 2:
                     case 3:
                        this.timers = 9;
                        break;
                     case 4:
                        this.timers = 9;
                        break;
                     case 5:
                        this.timers = 9;
                  }
                  if(this.hitNum == 1 || this.hitNum == 2)
                  {
                     SoundManager.play("Role1_hit1AndHit2");
                  }
                  else if(this.hitNum == 3 || this.hitNum == 4)
                  {
                     SoundManager.play("Role1_hit3AndHit4");
                  }
                  else
                  {
                     SoundManager.play("Role1_hit5");
                  }
                  this.setAction("hit" + this.hitNum);
                  if(this.getPlayer())
                  {
                     gc.sendPosition(this);
                  }
                  this.lastHit = "hit" + this.hitNum;
                  this.newAttackId();
               }
               else if(Boolean(this.isRunning()) && !this.isAttacking())
               {
                  if(this.getPlayer())
                  {
                     if(this.getPlayer().findSkillIsInTheSkillAry("hytj"))
                     {
                        _loc1_ = int(this.consumeMP[this.player.returnSkillLevelBySkillName("hytj") - 1] * 0.6);
                        if(this.roleProperies.getMMP() >= _loc1_)
                        {
                           this.skill_hytj(_loc1_);
                        }
                        else
                        {
                           this.setAction("hit1");
                           if(this.getPlayer())
                           {
                              gc.sendPosition(this);
                           }
                        }
                     }
                     else
                     {
                        this.setAction("hit1");
                        if(this.getPlayer())
                        {
                           gc.sendPosition(this);
                        }
                     }
                  }
               }
            }
            else if(!this.isAttacking() && !this.isBeAttacking())
            {
               this.timers = 12;
               this.setAction("hit3");
               if(this.getPlayer())
               {
                  gc.sendPosition(this);
               }
               this.lastHit = "hit3";
               this.hitNum = 0;
               SoundManager.play("Role1_hit3AndHit4");
               this.newAttackId();
            }
         }
         this.lasttime = this.curtime;
      }
      
      override public function refreshEquip() : void
      {
         var _loc1_:uint = uint(this.getCurClothId());
         var _loc2_:uint = uint(this.getCurWeaponId());
         var _loc3_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("ROLE1_" + _loc1_);
         if(_loc3_)
         {
            this.bbdc.replaceBitmapDataByName("body",_loc3_);
         }
         _loc3_ = BaseBitmapDataPool.getBitmapDataArrayByName("ROLE1_EQUIP_" + _loc2_);
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
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3" || this.curAction == "hit4" || this.curAction == "hit5";
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
         this.roleProperies.setSHHP(80 + 50 * (this.roleProperies.getLevel() - 1));
         this.roleProperies.setHHP(this.roleProperies.getSHHP());
         this.roleProperies.setSMMP(50 + 20 * (this.roleProperies.getLevel() - 1));
         this.roleProperies.setMMP(this.roleProperies.getSMMP());
         this.roleProperies.setBasePower(10 + 5 * (this.roleProperies.getLevel() - 1));
         this.roleProperies.setDefense(2 + 2 * (this.roleProperies.getLevel() - 1));
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
         var _loc9_:uint = uint(this.roleProperies.getLevel());
         var x_num:Number = 0.28098;
         var mp_percent:Number = 0;
         var qixue:int = 0;
         if(_loc9_ > 20)
         {
            _loc9_ = 20;
         }
         if(this.isGXP)
         {
            _loc5_ = 1.3;
         }
         var _loc13_:Number = 1;
         if(param2 && Math.random() <= this.roleProperies.getTotalCrit() / 100)
         {
            _loc13_ = 2;
         }
         switch(param1)
         {
            case "hit1":
            case "hit2":
            case "hit3":
               _loc8_ = 2.0875 * this.roleProperies.getHurt() * _loc13_ * _loc5_;
               qixue = 2.0875 * this.roleProperies.getHaveblood() * _loc5_;
               break;
            case "hit4":
               _loc8_ = 2.155 * this.roleProperies.getHurt() * _loc13_ * _loc5_;
               qixue = 2.155 * this.roleProperies.getHaveblood() * _loc5_;
               break;
            case "hit5":
               _loc8_ = 2.5 * this.roleProperies.getHurt() * _loc13_ * _loc5_;
               qixue = 2.5 * this.roleProperies.getHaveblood() * _loc5_;
               break;
            case "hit6":
               _loc7_ = Number(this.player.returnSkillLevelBySkillName("slz") - 1);
               mp_percent = 13 * Math.pow(25958 * 0.065 / 13,Math.pow(_loc7_ / 17,0.55)) / this.roleProperies.getSMMP() / 0.065 * 3 * Math.pow(1 / 3,Math.pow(_loc7_ / 17,0.75));
               _loc8_ = 0.6 * (this.SkillFixedDamage[_loc7_] * this.FixedDamageCount[_loc7_] + (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * this.roleProperies.getHurt()) * _loc13_ * _loc5_;
               qixue = 0.6 * (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * this.roleProperies.getHaveblood() * _loc5_;
               break;
            case "hit7":
               _loc7_ = Number(this.player.returnSkillLevelBySkillName("hytj") - 1);
               mp_percent = 18 * Math.pow(25958 * 0.07 / 18,Math.pow(_loc7_ / 17,0.55)) / this.roleProperies.getSMMP() / 0.07 * 3 * Math.pow(1 / 3,Math.pow(_loc7_ / 17,0.75));
               _loc8_ = 0.65 * (this.SkillFixedDamage[_loc7_] * this.FixedDamageCount[_loc7_] + (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * this.roleProperies.getHurt()) / 4 * _loc13_ * _loc5_;
               qixue = 0.65 * (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) / 4 * this.roleProperies.getHaveblood() * _loc5_;
               break;
            case "hit8":
               _loc7_ = Number(this.player.returnSkillLevelBySkillName("lyfb") - 1);
               mp_percent = 24 * Math.pow(25958 * 0.085 / 24,Math.pow(_loc7_ / 17,0.55)) / this.roleProperies.getSMMP() / 0.085 * 3 * Math.pow(1 / 3,Math.pow(_loc7_ / 17,0.75));
               _loc8_ = 0.7 * (this.SkillFixedDamage[_loc7_] * this.FixedDamageCount[_loc7_] + (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * this.roleProperies.getHurt()) / 12 * _loc13_ * _loc5_;
               qixue = 0.7 * (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) / 12 * this.roleProperies.getHaveblood() * _loc5_;
               break;
            case "hit8_2":
               _loc7_ = Number(this.player.returnSkillLevelBySkillName("lyfb") - 1);
               mp_percent = 24 * Math.pow(25958 * 0.085 / 24,Math.pow(_loc7_ / 17,0.55)) / this.roleProperies.getSMMP() / 0.085 * 3 * Math.pow(1 / 3,Math.pow(_loc7_ / 17,0.75));
               _loc8_ = 0.7 * (this.SkillFixedDamage[_loc7_] * this.FixedDamageCount[_loc7_] + (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * this.roleProperies.getHurt()) / 12 * _loc13_ * _loc5_;
               qixue = 0.7 * (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) / 12 * this.roleProperies.getHaveblood() * _loc5_;
               break;
            case "hit8_1":
               _loc7_ = Number(this.player.returnSkillLevelBySkillName("qsez") - 1);
               mp_percent = 24 * Math.pow(25958 * 0.085 / 24,Math.pow(_loc7_ / 17,0.55)) / this.roleProperies.getSMMP() / 0.085 * 3 * Math.pow(1 / 3,Math.pow(_loc7_ / 17,0.75));
               _loc8_ = 0.7 * (this.SkillFixedDamage[_loc7_] * this.FixedDamageCount[_loc7_] + (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * this.roleProperies.getHurt()) / 12 * _loc13_ * _loc5_ * 0.3125;
               qixue = 0.7 * (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) / 12 * this.roleProperies.getHaveblood() * _loc5_ * 0.3125;
               break;
            case "hit8_2_1":
               _loc7_ = Number(this.player.returnSkillLevelBySkillName("qsez") - 1);
               mp_percent = 24 * Math.pow(25958 * 0.085 / 24,Math.pow(_loc7_ / 17,0.55)) / this.roleProperies.getSMMP() / 0.085 * 3 * Math.pow(1 / 3,Math.pow(_loc7_ / 17,0.75));
               _loc8_ = 0.7 * (this.SkillFixedDamage[_loc7_] * this.FixedDamageCount[_loc7_] + (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * this.roleProperies.getHurt()) / 12 * _loc13_ * _loc5_ * 0.3125;
               qixue = 0.7 * (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) / 12 * this.roleProperies.getHaveblood() * _loc5_ * 0.3125;
               break;
            case "hit9":
               _loc7_ = Number(this.player.returnSkillLevelBySkillName("lys") - 1);
               mp_percent = 19 * Math.pow(25958 * 0.075 / 19,Math.pow(_loc7_ / 17,0.55)) / this.roleProperies.getSMMP() / 0.075 * 3 * Math.pow(1 / 3,Math.pow(_loc7_ / 17,0.75));
               _loc8_ = 0.5 * (this.SkillFixedDamage[_loc7_] * this.FixedDamageCount[_loc7_] + (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * this.roleProperies.getHurt()) * _loc13_ * _loc5_;
               qixue = 0.5 * (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * this.roleProperies.getHaveblood() * _loc5_;
               break;
            case "hit10_2":
               _loc7_ = Number(this.player.returnSkillLevelBySkillName("hmz") - 1);
               _loc8_ = 1.1 * (this.hmzLianZhan[_loc7_] * this.FixedDamageCount[_loc7_] * 1.1 + (this.hmzLianZhanFactor[0] + this.hmzLianZhanFactor[1] * _loc7_) * this.roleProperies.getHurt()) * _loc13_ * _loc5_;
               qixue = 1.1 * (this.hmzLianZhanFactor[0] + this.hmzLianZhanFactor[1] * _loc7_) * this.roleProperies.getHaveblood() * _loc5_;
               break;
            case "hit10_3":
               break;
            case "hit10_4":
               _loc7_ = Number(this.player.returnSkillLevelBySkillName("hmz") - 1);
               _loc8_ = 1.1 * (this.hmzZaDi[_loc7_] * this.FixedDamageCount[_loc7_] * 1.05 + (this.hmzZaDiFactor[0] + this.hmzZaDiFactor[1] * _loc7_) * this.roleProperies.getHurt()) * _loc13_ * _loc5_;
               qixue = 1.1 * (this.hmzZaDiFactor[0] + this.hmzZaDiFactor[1] * _loc7_) * this.roleProperies.getHaveblood() * _loc5_;
               break;
            case "hit11_1":
               _loc7_ = Number(this.player.returnSkillLevelBySkillName("jdy") - 1);
               mp_percent = 30 * Math.pow(25958 * 0.11 / 30,Math.pow(_loc7_ / 17,0.55)) / this.roleProperies.getSMMP() / 0.11 * 3 * Math.pow(1 / 3,Math.pow(_loc7_ / 17,0.75));
               _loc8_ = 0.8 * (this.SkillFixedDamage[_loc7_] * this.FixedDamageCount[_loc7_] + (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * this.roleProperies.getHurt()) / 13 * _loc13_ * _loc5_;
               qixue = 0.8 * (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) / 13 * this.roleProperies.getHaveblood() * _loc5_;
               break;
            case "hit11_2":
               _loc7_ = Number(this.player.returnSkillLevelBySkillName("jdy") - 1);
               mp_percent = 30 * Math.pow(25958 * 0.11 / 30,Math.pow(_loc7_ / 17,0.55)) / this.roleProperies.getSMMP() / 0.11 * 3 * Math.pow(1 / 3,Math.pow(_loc7_ / 17,0.75));
               _loc8_ = 0.8 * (this.SkillFixedDamage[_loc7_] * this.FixedDamageCount[_loc7_] + (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * this.roleProperies.getHurt()) / 13 * _loc13_ * _loc5_;
               qixue = 0.8 * (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) / 13 * this.roleProperies.getHaveblood() * _loc5_;
               break;
            case "hit12":
               _loc7_ = Number(this.player.returnSkillLevelBySkillName("hyjj") - 1);
               mp_percent = 43 * Math.pow(25958 * 0.13 / 43,Math.pow(_loc7_ / 17,0.55)) / this.roleProperies.getSMMP() / 0.13 * 3 * Math.pow(1 / 3,Math.pow(_loc7_ / 17,0.75));
               _loc8_ = 0.9 * (this.SkillFixedDamage[_loc7_] * this.FixedDamageCount[_loc7_] + (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * this.roleProperies.getHurt()) / 15 * _loc13_ * _loc5_;
               qixue = 0.9 * (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) / 15 * this.roleProperies.getHaveblood() * _loc5_;
               break;
            case "hit13":
               _loc7_ = Number(this.player.returnSkillLevelBySkillName("qsez") - 1);
               mp_percent = 18 * Math.pow(25958 * 0.07 / 18,Math.pow(_loc7_ / 17,0.55)) / this.roleProperies.getSMMP() / 0.07 * 3 * Math.pow(1 / 3,Math.pow(_loc7_ / 17,0.75));
               _loc8_ = 0.25 * (this.SkillFixedDamage[_loc7_] * this.FixedDamageCount[_loc7_] + (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * this.roleProperies.getHurt()) * _loc13_ * _loc5_;
               qixue = 0.25 * (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * this.roleProperies.getHaveblood() * _loc5_;
               break;
            case "hit14":
               _loc7_ = Number(this.player.returnSkillLevelBySkillName("zz") - 1);
               mp_percent = 23 * Math.pow(25958 * 0.085 / 23,Math.pow(_loc7_ / 17,0.55)) / this.roleProperies.getSMMP() / 0.085 * 3 * Math.pow(1 / 3,Math.pow(_loc7_ / 17,0.75));
               _loc8_ = 0.84 * (this.SkillFixedDamage[_loc7_] * this.FixedDamageCount[_loc7_] + (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * this.roleProperies.getHurt()) * _loc13_ * _loc5_;
               qixue = 0.84 * (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * this.roleProperies.getHaveblood() * _loc5_;
               break;
            case "hit14_1":
               _loc7_ = Number(this.player.returnSkillLevelBySkillName("qsez") - 1);
               mp_percent = 0.25 * Math.pow(25958 * 0.085 / 23,Math.pow(_loc7_ / 17,0.55)) / this.roleProperies.getSMMP() / 0.085 * 3 * Math.pow(1 / 3,Math.pow(_loc7_ / 17,0.75));
               _loc8_ = 0.25 * (this.SkillFixedDamage[_loc7_] * this.FixedDamageCount[_loc7_] + (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * this.roleProperies.getHurt()) * _loc13_ * _loc5_ * 0.437;
               qixue = (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * this.roleProperies.getHaveblood() * _loc5_ * 0.437;
               break;
            case "fabao-qpj":
               _loc8_ = this.roleProperies.getHurt() * 1.945 * _loc13_ * _loc5_ * 1.08325 * 1.5;
               qixue = this.roleProperies.getHaveblood() * 1.945 * _loc5_ * 1.08325;
               break;
            case "fabao-qpj1":
               _loc8_ = this.roleProperies.getHurt() * 1.945 * _loc13_ * _loc5_ * 1.08325 * 1.5;
               qixue = this.roleProperies.getHaveblood() * 1.945 * _loc5_ * 1.08325 * 1.5;
               break;
            case "qpjThunder":
               _loc8_ = this.roleProperies.getHurt() * 2.52 * _loc13_ * _loc5_ * 1.08325 * 1.5;
               qixue = this.roleProperies.getHaveblood() * 2.52 * _loc5_ * 1.08325 * 1.5;
               break;
            case "fabao-zltc":
               _loc6_ = this.getPlayer().getCurEquipByType("zbfb");
               _loc13_ = 1;
               _loc8_ = this.roleProperies.getHurt() * (18 + (_loc6_.getELevel() - 1) * 3) / 4 * 1.8;
               qixue = this.roleProperies.getHaveblood() * (18 + (_loc6_.getELevel() - 1) * 3) / 4 * _loc5_ * 1.8;
               break;
            case "fabao-sword":
               _loc6_ = this.getPlayer().getCurEquipByType("zbfb");
               _loc13_ = 1;
               _loc8_ = this.roleProperies.getHurt() * _loc6_.getELevel() * 0.05;
               qixue = this.roleProperies.getHaveblood() * _loc6_.getELevel() * 0.05 * _loc5_;
               break;
            case "magicsword2":
               _loc6_ = this.getPlayer().getCurEquipByType("zbfb");
               if(Boolean(_loc6_) && _loc6_.getWX().indexOf("木") != -1)
               {
                  _loc8_ = 0.0875 * this.roleProperies.getHurt() * _loc6_.getELevel();
                  qixue = 0.0875 * this.roleProperies.getHaveblood() * _loc5_ * _loc6_.getELevel();
               }
               _loc8_ = this.roleProperies.getHurt() * _loc6_.getELevel() * 0.0488;
               qixue = 0.0488 * this.roleProperies.getHaveblood() * _loc5_ * _loc6_.getELevel();
               _loc13_ = 1;
               break;
            case "fabao-snow":
               _loc6_ = this.getPlayer().getCurEquipByType("zbfb");
               _loc8_ = this.roleProperies.getHurt() * _loc6_.getELevel() * 0.09;
               qixue = 0.09 * this.roleProperies.getHaveblood() * _loc5_ * _loc6_.getELevel();
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
               _loc8_ = Math.max(this.roleProperies.getHurt() * _loc13_ * _loc5_ * _loc3_,1);
               qixue = _loc3_ * this.roleProperies.getHaveblood() * _loc5_;
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
               _loc8_ = this.roleProperies.getHurt() * _loc13_ * _loc5_ * _loc3_;
               qixue = _loc3_ * this.roleProperies.getHaveblood() * _loc5_;
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
               _loc8_ = this.roleProperies.getHurt() * _loc13_ * _loc5_ * _loc3_;
               qixue = _loc3_ * this.roleProperies.getHaveblood() * _loc5_;
               break;
            case "Pearl":
               _loc6_ = this.getPlayer().getCurEquipByType("zbfb");
               if(Boolean(_loc6_) && _loc6_.getWX().indexOf("木") != -1)
               {
                  _loc8_ = 1.2 * this.roleProperies.getHurt();
                  qixue = 1.2 * this.roleProperies.getHaveblood() * _loc5_;
               }
               _loc8_ = this.roleProperies.getHurt() * 0.6;
               qixue = 0.6 * this.roleProperies.getHaveblood() * _loc5_;
               _loc13_ = 1;
               break;
            case "fabao-pearl":
               _loc6_ = this.getPlayer().getCurEquipByType("zbfb");
               if(Boolean(_loc6_) && _loc6_.getWX().indexOf("木") != -1)
               {
                  _loc8_ = _loc6_.getELevel() * 0.0473 * this.roleProperies.getHurt();
                  qixue = _loc6_.getELevel() * 0.0473 * this.roleProperies.getHaveblood() * _loc5_;
               }
               _loc13_ = 1;
               _loc8_ = _loc6_.getELevel() * 0.0315 * this.roleProperies.getHurt();
               qixue = _loc6_.getELevel() * 0.0315 * this.roleProperies.getHaveblood() * _loc5_;
               break;
            default:
               _loc8_ = 0;
         }
         return {
            "hurt":_loc8_ * 1.27,
            "qixue":qixue * 1.27,
            "atk":this.roleProperies.getPower()
         };
      }
      
      override protected function isCannotMoveWhenAttackOnFloor() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3" && gc.protectedPerproty.getProperty(this,"jumpCount") == 0 || this.curAction == "hit4" || this.curAction == "hit5" || this.curAction == "hit8" || this.curAction == "hit14";
      }
      
      override public function isAttacking() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3" || this.curAction == "hit4" || this.curAction == "hit5" || this.curAction == "hit6" || this.curAction == "hit7" || this.curAction == "hit8" || this.curAction == "hit9" || this.curAction == "hit10" || this.curAction == "hit11_1" || this.curAction == "hit11_2" || this.curAction == "hit12" || this.curAction == "hit13" || this.curAction == "hit14";
      }
      
      override protected function isCannotMoveWhenAttack() : Boolean
      {
         return this.curAction == "hit14" || this.curAction == "hit12";
      }
      
      override public function isCanMoveWhenAttack() : Boolean
      {
         return this.curAction == "hit7" || this.curAction == "hit9" || this.curAction == "hit10" || this.curAction == "hit11_1" || this.curAction == "hit11_2" || this.curAction == "hit13";
      }
   }
}

