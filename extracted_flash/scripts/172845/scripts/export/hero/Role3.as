package export.hero
{
   import base.*;
   import com.greensock.*;
   import export.*;
   import export.bullet.*;
   import export.monster.*;
   import flash.display.*;
   import flash.events.*;
   import flash.geom.*;
   import flash.utils.*;
   import manager.*;
   import my.*;
   
   public class Role3 extends BaseHero
   {
      
      private var isHit6Ok:Boolean = false;
      
      private var consumeMP:Array;
      
      private var hmzLianZhan:Array;
      
      private var hmzZaDi:Array;
      
      private var SkillFixedDamage:Array;
      
      private var FixedDamageCount:Array;
      
      private var SkillFactor:Array;
      
      private var hmzLianZhanFactor:Array;
      
      private var hmzZaDiFactor:Array;
      
      public function Role3()
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
         super();
         roleName = "八戒";
         userType = "八戒";
         this.horizenSpeed = 6;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[5,-3],
            "attackInterval":999,
            "attackKind":"physics",
            "addprotection":1000 / 19
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":20,
            "attackBackSpeed":[0.5,-3],
            "attackInterval":999,
            "attackKind":"physics",
            "addprotection":1000 / 19
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":20,
            "attackBackSpeed":[0.5,-3],
            "attackInterval":999,
            "attackKind":"physics",
            "addprotection":1000 / 19
         };
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[7,-3],
            "attackInterval":999,
            "attackKind":"physics",
            "addprotection":1000 * 0.06
         };
         this.attackBackInfoDict["hit5"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[0,-2],
            "attackInterval":999,
            "attackKind":"magic",
            "addprotection":0
         };
         this.attackBackInfoDict["hit6"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[0,-2],
            "attackInterval":5,
            "attackKind":"physics",
            "addprotection":0
         };
         this.attackBackInfoDict["hit7_1"] = {
            "hitMaxCount":1,
            "attackBackSpeed":[0,-2],
            "attackInterval":4,
            "attackKind":"physics",
            "addprotection":0
         };
         this.attackBackInfoDict["hit7_2"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[15,-2],
            "attackInterval":7,
            "attackKind":"physics",
            "addprotection":1000 * 0.16 / 11
         };
         this.attackBackInfoDict["hit8_1"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[2,-22],
            "attackInterval":2,
            "attackKind":"magic",
            "addprotection":0
         };
         this.attackBackInfoDict["hit8_2"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[10,-4],
            "attackInterval":8,
            "attackKind":"magic",
            "addprotection":1000 * 0.1 / 4
         };
         this.attackBackInfoDict["hit9"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[1,-4],
            "attackInterval":7,
            "attackKind":"physics",
            "addprotection":1000 * 0.12 / 3
         };
         this.attackBackInfoDict["hit10"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[15,-2],
            "attackInterval":7,
            "attackKind":"magic",
            "addprotection":1000 * 0.07 / 5
         };
         this.attackBackInfoDict["hit11"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[0,0],
            "attackInterval":7,
            "attackKind":"magic",
            "addprotection":1000 * 0.14 / 4
         };
         this.attackBackInfoDict["hit12"] = {
            "hitMaxCount":1,
            "attackBackSpeed":[0,0],
            "attackInterval":999,
            "attackKind":"physics",
            "addprotection":1000 * 0.244 / 10
         };
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
         var _loc5_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("ROLE3_" + _loc3_);
         var _loc6_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("ROLE3_EQUIP_" + _loc4_);
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
            bbdc = new BaseBitmapDataClip([_loc1_,_loc2_],5 * 60,200,new Point(0,0));
            bbdc.setOffsetXY(-15,0);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[3,3,3,9,5,9],[4,4,4,4],[2,2,2,2],[1,1,15,6,2,160],[2,2,2,2,2],[2,2,6],[2,2,6],[2,2,2,10],[24,2,8],[2,2,20],[2,2,2,20],[2,2,2,20],[4,3,25]]);
            bbdc.setFrameCount([36,6,4,4,[1,1,1,1,1,1],5,3,3,4,3,3,4,4,3]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            this.bbdc.turnRight();
            return;
         }
         throw new Error("ROLE3--BitmapData Error!");
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
               break;
            case "wait2":
               if(_loc2_.y != 1)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(1);
               }
               this.bbdc.setState(param1);
               break;
            case "walk":
               if(_loc2_.y != 2)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(2);
               }
               this.bbdc.setState(param1);
               break;
            case "run":
               if(_loc2_.y != 3)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(3);
               }
               this.bbdc.setState(param1);
               break;
            case "jump1":
               if(_loc2_.x != 0 || _loc2_.y != 4)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(param1);
               break;
            case "jump2":
               if(_loc2_.y != 5)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(5);
               }
               this.bbdc.setState(param1);
               break;
            case "jump3":
               if(_loc2_.x != 1 || _loc2_.y != 4)
               {
                  this.bbdc.setFramePointX(1);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(param1);
               break;
            case "hit1":
               if(_loc2_.y != 6)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(6);
               }
               this.bbdc.setState(param1);
               break;
            case "hit2":
               if(_loc2_.y != 7)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(7);
               }
               this.bbdc.setState(param1);
               break;
            case "hit3":
               if(_loc2_.y != 8)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(8);
               }
               this.bbdc.setState(param1);
               break;
            case "hit4":
               if(_loc2_.y != 9)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(9);
               }
               this.bbdc.setState(param1);
               break;
            case "hit5":
               if(_loc2_.x != 5 || _loc2_.y != 4)
               {
                  this.bbdc.setFramePointX(5);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(param1);
               break;
            case "hit6":
               if(_loc2_.x != 3 || _loc2_.y != 4)
               {
                  this.bbdc.setFramePointX(3);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(param1);
               break;
            case "hit7":
               if(_loc2_.y != 10)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(10);
               }
               this.bbdc.setState(param1);
               break;
            case "hit8":
               if(_loc2_.y != 11)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(11);
               }
               this.bbdc.setState(param1);
               break;
            case "hit9":
               if(_loc2_.y != 12)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(12);
               }
               this.bbdc.setState(param1);
               break;
            case "hit10":
               if(_loc2_.y != 13)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(13);
               }
               this.bbdc.setState(param1);
               break;
            case "hit11":
               if(_loc2_.x != 4 || _loc2_.y != 4)
               {
                  this.bbdc.setFramePointX(4);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(param1);
               break;
            case "hit11Frame2":
               if(_loc2_.x != 5 || _loc2_.y != 4)
               {
                  this.bbdc.setFramePointX(5);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(param1);
               break;
            case "hit12":
               if(_loc2_.x != 5 || _loc2_.y != 4)
               {
                  this.bbdc.setFramePointX(5);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(param1);
               break;
            case "hurt":
               if(_loc2_.x != 2 || _loc2_.y != 4)
               {
                  this.bbdc.setFramePointX(2);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(param1);
         }
      }
      
      override protected function scriptFrameOverFunc(param1:int) : void
      {
         var _loc2_:String = this.bbdc.getState();
         switch(_loc2_)
         {
            case "wait":
               this.setAction("wait2");
               break;
            case "wait2":
               this.setAction("wait");
               break;
            case "walk":
               this.bbdc.setFramePointX(0);
               break;
            case "run":
               this.bbdc.setFramePointX(0);
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
            case "hit2":
               this.setAction("wait");
               break;
            case "hit3":
               this.setAction("wait");
               break;
            case "hit4":
               this.setAction("wait");
               break;
            case "hit5":
               this.setAction("wait");
               break;
            case "hit6":
               this.setAction("wait");
               break;
            case "hit7":
               this.setAction("wait");
               break;
            case "hit8":
               this.setAction("wait");
               break;
            case "hit9":
               this.setAction("wait");
               break;
            case "hit10":
               this.setStatic();
               this.setAction("wait");
               break;
            case "hit11":
               this.setAction("hit11Frame2");
               break;
            case "hit11Frame2":
               this.getBBDC().show();
               this.setAction("wait");
               break;
            case "hit12":
               this.lastHit = "";
               this.getBBDC().show();
               this.setAction("wait");
               break;
            case "hurt":
               this.setStatic();
               this.getBBDC().show();
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
               if(gc.sid == this.sid || gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     if(param1.x == 1)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc3_.x = this.x - 130;
                        }
                        else
                        {
                           _loc3_.x = this.x + 130;
                        }
                        _loc3_.y = this.y - 72;
                        this.doHit1(this.getBBDC().getDirect(),_loc3_);
                        gc.sendAttack(this.getRoleId(),"hit1",this.getBBDC().getDirect(),_loc3_.x,_loc3_.y,[]);
                     }
                  }
               }
               break;
            case "hit2":
               if(gc.sid == this.sid || gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     if(param1.x == 1)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc3_.x = this.x - 140;
                        }
                        else
                        {
                           _loc3_.x = this.x + 140;
                        }
                        _loc3_.y = this.y - 30;
                        this.doHit2(this.getBBDC().getDirect(),_loc3_);
                        gc.sendAttack(this.getRoleId(),"hit2",this.getBBDC().getDirect(),_loc3_.x,_loc3_.y,[]);
                     }
                  }
               }
               break;
            case "hit3":
               if(gc.sid == this.sid || gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     if(param1.x == 2)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc3_.x = this.x - 180;
                        }
                        else
                        {
                           _loc3_.x = this.x + 3 * 60;
                        }
                        _loc3_.y = this.y - 140;
                        this.doHit3(this.getBBDC().getDirect(),_loc3_);
                        gc.sendAttack(this.getRoleId(),"hit3",this.getBBDC().getDirect(),_loc3_.x,_loc3_.y,[]);
                     }
                  }
               }
               break;
            case "hit4":
               if(gc.sid == this.sid || gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 24)
                  {
                     if(param1.x == 0)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc3_.x = this.x - 35;
                        }
                        else
                        {
                           _loc3_.x = this.x + 35;
                        }
                        _loc3_.y = this.y - 55;
                        this.doHit4(this.getBBDC().getDirect(),_loc3_);
                        gc.sendAttack(this.getRoleId(),"hit4",this.getBBDC().getDirect(),_loc3_.x,_loc3_.y,[]);
                     }
                  }
               }
               break;
            case "hit5":
               if(gc.sid == this.sid || gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 160)
                  {
                     if(param1.x == 5)
                     {
                        this.bbdc.setCurFrameCount(4);
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc3_.x = this.x - 70;
                        }
                        else
                        {
                           _loc3_.x = this.x + 70;
                        }
                        _loc3_.y = this.y - 110;
                        this.doHit5(this.getBBDC().getDirect(),_loc3_);
                        gc.sendAttack(this.getRoleId(),"hit5",this.getBBDC().getDirect(),_loc3_.x,_loc3_.y,[]);
                     }
                  }
               }
               break;
            case "hit6":
               if(gc.sid == this.sid || gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 6)
                  {
                     if(param1.x == 3)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc3_.x = this.x - 120;
                        }
                        else
                        {
                           _loc3_.x = this.x + 2 * 60;
                        }
                        _loc3_.y = this.y - 115;
                        this.doHit6(this.getBBDC().getDirect(),_loc3_);
                        gc.sendAttack(this.getRoleId(),"hit6",this.getBBDC().getDirect(),_loc3_.x,_loc3_.y,[]);
                     }
                  }
               }
               break;
            case "hit7":
               if(gc.sid == this.sid || gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 20)
                  {
                     if(param1.x == 2)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc3_.x = this.x - 140;
                        }
                        else
                        {
                           _loc3_.x = this.x + 140;
                        }
                        _loc3_.y = this.y - 160;
                        this.doHit7_1(this.getBBDC().getDirect(),_loc3_);
                        gc.sendAttack(this.getRoleId(),"hit7_1",this.getBBDC().getDirect(),_loc3_.x,_loc3_.y,[]);
                     }
                  }
                  if(this.bbdc.getCurFrameCount() == 8)
                  {
                     if(param1.x == 2)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc3_.x = this.x - 135;
                        }
                        else
                        {
                           _loc3_.x = this.x + 135;
                        }
                        _loc3_.y = this.y - 145;
                        this.doHit7_2(this.getBBDC().getDirect(),_loc3_);
                        gc.sendAttack(this.getRoleId(),"hit7_2",this.getBBDC().getDirect(),_loc3_.x,_loc3_.y,[]);
                     }
                  }
               }
               break;
            case "hit8":
               if(gc.sid == this.sid || gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 20)
                  {
                     if(param1.x == 3)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc3_.x = this.x - 95;
                        }
                        else
                        {
                           _loc3_.x = this.x + 95;
                        }
                        _loc3_.y = this.y;
                        this.doHit8_1(this.getBBDC().getDirect(),_loc3_);
                        gc.sendAttack(this.getRoleId(),"hit8_1",this.getBBDC().getDirect(),_loc3_.x,_loc3_.y,[]);
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc3_.x = this.x + 20;
                        }
                        else
                        {
                           _loc3_.x = this.x - 20;
                        }
                        _loc3_.y = this.y - 20;
                        this.doHit8_2(this.getBBDC().getDirect(),_loc3_);
                        gc.sendAttack(this.getRoleId(),"hit8_2",this.getBBDC().getDirect(),_loc3_.x,_loc3_.y,[]);
                     }
                  }
               }
               break;
            case "hit9":
               if(gc.sid == this.sid || gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 20)
                  {
                     if(param1.x == 3)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc3_.x = this.x - 195;
                        }
                        else
                        {
                           _loc3_.x = this.x + 195;
                        }
                        _loc3_.y = this.y - 160;
                        this.doHit9(this.getBBDC().getDirect(),_loc3_);
                        gc.sendAttack(this.getRoleId(),"hit9",this.getBBDC().getDirect(),_loc3_.x,_loc3_.y,[]);
                     }
                  }
               }
               break;
            case "hit10":
               if(gc.sid == this.sid || gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 25)
                  {
                     if(param1.x == 2)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc3_.x = this.x - 55;
                        }
                        else
                        {
                           _loc3_.x = this.x + 55;
                        }
                        _loc3_.y = this.y - 25;
                        this.doHit10(this.getBBDC().getDirect(),_loc3_);
                        gc.sendAttack(this.getRoleId(),"hit10",this.getBBDC().getDirect(),_loc3_.x,_loc3_.y,[]);
                     }
                  }
               }
               if(param1.x == 2)
               {
                  if(this.getBBDC().getDirect() == 0)
                  {
                     this.speed.x = -15;
                     break;
                  }
                  this.speed.x = 15;
               }
               break;
            case "hit11Frame2":
               if(gc.sid == this.sid || gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 160)
                  {
                     if(param1.x == 5)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc3_.x = this.x - 135;
                        }
                        else
                        {
                           _loc3_.x = this.x + 135;
                        }
                        _loc3_.y = this.y - 90;
                        this.doHit11(this.getBBDC().getDirect(),_loc3_);
                        gc.sendAttack(this.getRoleId(),"hit11Frame2",this.getBBDC().getDirect(),_loc3_.x,_loc3_.y,[]);
                        this.bbdc.setCurFrameCount(28);
                     }
                  }
               }
               this.getBBDC().hide();
               break;
            case "hit12":
               if(gc.sid == this.sid || gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 160)
                  {
                     if(param1.x == 5)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc3_.x = this.x;
                        }
                        else
                        {
                           _loc3_.x = this.x;
                        }
                        _loc3_.y = this.y;
                        this.doHit12_1(this.getBBDC().getDirect(),_loc3_);
                        gc.sendAttack(this.getRoleId(),"hit12_1",this.getBBDC().getDirect(),_loc3_.x,_loc3_.y,[]);
                     }
                     break;
                  }
                  if(this.bbdc.getCurFrameCount() == 150)
                  {
                     this.getBBDC().hide();
                  }
               }
         }
      }
      
      private function doHit1(param1:uint, param2:Point) : void
      {
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role3Bullet1");
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
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role3Bullet2");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit2");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit3(param1:uint, param2:Point) : void
      {
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role3Bullet3");
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
         SoundManager.play("Role3_hit4");
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role3Bullet4");
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
         SoundManager.play("Role3_hit5");
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role3Bullet5");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDisable();
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit5");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
         if(this.curAddEffect)
         {
            ++this.curAddEffect.bjsdcs;
            if(this.curAddEffect.bjsdcs > 3)
            {
               this.curAddEffect.bjsdcs = 1;
            }
            if(this.curAddEffect.bjsdcs == 1)
            {
               this.curAddEffect.add([{
                  "name":BaseAddEffect.BAJIE_DUNPAI_BUFF1,
                  "time":gc.frameClips * 10
               }]);
            }
            else if(this.curAddEffect.bjsdcs == 2)
            {
               this.curAddEffect.add([{
                  "name":BaseAddEffect.BAJIE_DUNPAI_BUFF2,
                  "time":gc.frameClips * 10
               }]);
            }
            else if(this.curAddEffect.bjsdcs == 3)
            {
               this.curAddEffect.add([{
                  "name":BaseAddEffect.BAJIE_DUNPAI_BUFF3,
                  "time":gc.frameClips * 10
               }]);
            }
         }
      }
      
      private function doHit6(param1:uint, param2:Point) : void
      {
         var b:FollowBaseObjectBullet = null;
         var bmLen:uint = 0;
         var bo:BaseObject = null;
         var i:uint = 0;
         var direct:uint = param1;
         var p:Point = param2;
         SoundManager.play("Role3_hit6");
         b = new FollowBaseObjectBullet("Role3Bullet6");
         b.x = p.x;
         b.y = p.y;
         b.setRole(this);
         b.setDisable();
         b.setDirect(direct);
         b.setAction("hit6");
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
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
            bmLen = gc.obbsiteArray.length;
            i = 0;
            while(i < bmLen)
            {
               bo = gc.obbsiteArray[i] as BaseObject;
               if(bo is Monster1001)
               {
                  if(bo.curAction == "hit4-1" || bo.intop == true)
                  {
                     i++;
                     continue;
                  }
               }
               if(!bo.isYourFather() && !(bo is Monster1004) && !(bo is Monster1003) && !(bo is Monster1005) && !(bo is Monster1008))
               {
                  bo.setLostGraity();
                  TweenMax.to(bo,1.8,{
                     "x":this.x,
                     "y":this.y - 100,
                     "onComplete":function(param1:BaseObject):*
                     {
                        param1.resetGraity();
                     },
                     "onCompleteParams":[bo]
                  });
               }
               i++;
            }
         }
         this.isHit6Ok = true;
      }
      
      private function doHit7_1(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role3_hit7");
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role3Bullet7_1");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDisable();
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit7_1");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit7_2(param1:uint, param2:Point) : void
      {
         var _loc3_:EnemyMoveBullet = new EnemyMoveBullet("Role3Bullet7_2");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setSpeed(this.getBBDC().getDirect() == 0 ? -12 : 12,0);
         _loc3_.setDestroyInCount(gc.frameClips * 2.5);
         _loc3_.setDestroyWhenLastFrame(false);
         _loc3_.setDistance(999);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit7_2");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit8_1(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role3_hit8");
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role3Bullet8_1");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDisable();
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit8_1");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit8_2(param1:uint, param2:Point) : void
      {
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("Role3Bullet8_2");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit8_2");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit9(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role3_hit9");
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("Role3Bullet9");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit9");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit10(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role3_hit10");
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role3Bullet10");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit10");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit11(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role3_hit11");
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role3Bullet11");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit11");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit12_1(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role3_hit12_1");
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role3Bullet12_1");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDisable();
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit12");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit12_2(param1:*, param2:*, param3:Point = null, param4:uint = 10) : void
      {
         var _loc5_:* = null;
         var _loc6_:StabBullet = null;
         var _loc7_:* = null;
         var _loc8_:* = null;
         var _loc9_:Number = Number(NaN);
         SoundManager.play("Role3_hit12_2");
         for each(_loc5_ in this.magicBulletArray)
         {
            if(_loc5_.getImcName() == "Role3Bullet12_1")
            {
               if(_loc5_.getImgMc())
               {
                  _loc5_.getImgMc().gotoAndPlay(154);
               }
            }
         }
         if(gc.sid == this.sid || gc.isSingleGame())
         {
            if(gc.isInRoom())
            {
               gc.obbsiteArray = gc.pWorld.getOtherHeroArray();
            }
            else if(gc.isPK)
            {
               gc.obbsiteArray = gc.getRivalPlayer(this);
            }
            else
            {
               gc.obbsiteArray = gc.pWorld.monsterArray;
            }
            _loc8_ = gc.obbsiteArray[int(Math.random() * gc.obbsiteArray.length)] as BaseObject;
            param3 = _loc8_ ? new Point(_loc8_.x,_loc8_.y) : new Point(this.x + 1,this.y + 5 * 60);
         }
         else
         {
            param3 = param3 ? param3 : new Point(this.x + 1,this.y + 5 * 60);
         }
         var _loc10_:int = 0;
         var _loc11_:Boolean = false;
         if(this.isHit6Ok)
         {
            _loc11_ = true;
         }
         while(_loc10_ < param4)
         {
            _loc9_ = 360 / param4 * _loc10_;
            _loc7_ = new Point(param2.x + Math.sin(_loc9_ * Math.PI / 180) * 100,Number(param2.y) - Math.cos(_loc9_ * Math.PI / 180) * 100);
            _loc6_ = new StabBullet("Role3Bullet12_2",param3,0.3,_loc7_);
            _loc6_.setRole(this);
            _loc6_.setDestroyWhenLastFrame(false);
            _loc6_.setAction("hit12");
            _loc6_.rotation = _loc9_;
            _loc6_.x = _loc7_.x;
            _loc6_.y = _loc7_.y;
            if(_loc11_)
            {
               _loc6_.setHurtAdd(0.3);
            }
            gc.gameSence.addChild(_loc6_);
            this.magicBulletArray.push(_loc6_);
            _loc10_++;
         }
         if(gc.sid == this.sid)
         {
            gc.sendAttack(this.getRoleId(),"hit12_2",this.getBBDC().getDirect(),this.x,this.y,[param3.x,param3.y,param4]);
         }
      }
      
      override public function setOtherAttack(param1:String, param2:uint, param3:Point, param4:Array = null, param5:uint = 0) : void
      {
         var _loc6_:* = null;
         var _loc7_:* = 0;
         switch(param1)
         {
            case "hit1":
               this.doHit1(param2,param3);
               break;
            case "hit2":
               this.doHit2(param2,param3);
               break;
            case "hit3":
               this.doHit3(param2,param3);
               break;
            case "hit4":
               this.doHit4(param2,param3);
               break;
            case "hit5":
               this.doHit5(param2,param3);
               break;
            case "hit6":
               this.doHit6(param2,param3);
               break;
            case "hit7_1":
               this.doHit7_1(param2,param3);
               break;
            case "hit7_2":
               this.doHit7_2(param2,param3);
               break;
            case "hit8_1":
               this.doHit8_1(param2,param3);
               break;
            case "hit8_2":
               this.doHit8_2(param2,param3);
               break;
            case "hit9":
               this.doHit9(param2,param3);
               break;
            case "hit10":
               this.doHit10(param2,param3);
               break;
            case "hit11Frame2":
               this.doHit11(param2,param3);
               break;
            case "hit12_1":
               this.doHit12_1(param2,param3);
               break;
            case "hit12_2":
               _loc6_ = new Point(parseInt(param4[0]),parseInt(param4[1]));
               _loc7_ = uint(parseInt(param4[2]));
               this.doHit12_2(param2,param3,_loc6_,_loc7_);
               break;
            case "wushuangStart":
               this.turnToGXP();
               break;
            case "wushuangOver":
               this.turnToNormal();
               break;
            case "Role2Hit7":
               this.beAttackByRole2Hit7(param3);
               break;
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
               break;
            case "Role4_hit6":
               if(this.curAddEffect)
               {
                  this.curAddEffect.add([{
                     "name":BaseAddEffect.POISON_TIMES,
                     "time":gc.frameClips * 7
                  }]);
                  this.curAddEffect.add([{
                     "name":BaseAddEffect.STUN,
                     "time":gc.frameClips * 4
                  }]);
               }
         }
      }
      
      override protected function exitFrameFunc(param1:Point) : void
      {
      }
      
      override public function step() : void
      {
         super.step();
      }
      
      override public function reduceHp(param1:int, param2:Boolean = false) : void
      {
         var reduceHurt:Number = 1;
         if(Boolean(this.curAddEffect) && (Boolean(this.curAddEffect.curDebuff(BaseAddEffect.BAJIE_DUNPAI_BUFF1) || this.curAddEffect.curDebuff(BaseAddEffect.BAJIE_DUNPAI_BUFF2) || this.curAddEffect.curDebuff(BaseAddEffect.BAJIE_DUNPAI_BUFF3))) || this.curAction == "hit12")
         {
            param2 = false;
            reduceHurt += -0.01 * Math.min(this.getPlayer().returnSkillLevelBySkillName("sd"),8);
         }
         if(this.isGXP)
         {
            reduceHurt += -0.125;
         }
         if(this.getPlayer().getCurEquipByType("zbfj"))
         {
            if(this.getPlayer().getCurEquipByType("zbfj").getFillName().indexOf("zxztk") != -1)
            {
               reduceHurt += -0.1;
            }
         }
         param1 *= reduceHurt;
         super.reduceHp(param1,param2);
      }
      
      override public function setAttackBack(param1:Point) : void
      {
         if(!(Boolean(this.curAddEffect) && (this.curAddEffect.curDebuff(BaseAddEffect.BAJIE_DUNPAI_BUFF1) || this.curAddEffect.curDebuff(BaseAddEffect.BAJIE_DUNPAI_BUFF2) || this.curAddEffect.curDebuff(BaseAddEffect.BAJIE_DUNPAI_BUFF3)) || this.curAction == "hit12"))
         {
            super.setAttackBack(param1);
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
                  break;
               case "1010":
                  if(this.isAttacking() || this.isBeAttacking())
                  {
                     return;
                  }
                  this.getFallDown();
                  cannextaction = false;
                  break;
               case "0110":
                  if(this.isAttacking() || this.isBeAttacking())
                  {
                     return;
                  }
                  cannextaction = false;
                  break;
               case "0101":
                  if(this.getPlayer().isstudyskill[3] != 1)
                  {
                     return;
                  }
                  if(this.isAttacking() || this.isBeAttacking())
                  {
                     return;
                  }
                  if(this.roleProperies.getMMP() >= 20)
                  {
                     SoundManager.play("Role3_hit6");
                     this.lastHit = "hit8";
                     this.curAction = "hit8";
                     this.hitNum = 0;
                     this.timers = 40;
                     this.newAttackId();
                     this.roleProperies.setMMP(this.roleProperies.getMMP() - 20);
                     break;
                  }
                  this.normalHit();
                  cannextaction = false;
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
                  }
            }
         }
      }
      
      override protected function showSkill(param1:String) : void
      {
         var _loc2_:* = null;
         var _loc3_:* = null;
         var _loc4_:* = 0;
         var _loc7_:Number = 0;
         var x_num:Number = 0.28098;
         if(this.getPlayer())
         {
            _loc2_ = ["Y","U","I","O","L"];
            _loc3_ = this.getPlayer().returnSkillNameBySkillKey(param1);
            if(_loc3_)
            {
               param1 = _loc3_[0];
               _loc4_ = uint(parseInt(_loc3_[1]));
               if(param1 == "dj")
               {
                  _loc7_ = Number(this.player.returnSkillLevelBySkillName("dj") - 1);
                  _loc4_ = this.consumeMP[_loc7_] * 0.6 * 22998 / 25958;
                  this.skill_dj(_loc4_);
               }
               else if(param1 == "sd")
               {
                  _loc7_ = Number(this.player.returnSkillLevelBySkillName("sd") - 1);
                  _loc4_ = this.consumeMP[_loc7_] * 0.5 * 22998 / 25958;
                  this.skill_sd(_loc4_);
               }
               else if(param1 == "zznh")
               {
                  _loc7_ = Number(this.player.returnSkillLevelBySkillName("zznh") - 1);
                  _loc4_ = this.consumeMP[_loc7_] * 0.4 * 22998 / 25958;
                  this.skill_zznh(_loc4_);
               }
               else if(param1 == "syzq")
               {
                  _loc7_ = Number(this.player.returnSkillLevelBySkillName("syzq") - 1);
                  _loc4_ = this.consumeMP[_loc7_] * 1 * 22998 / 25958;
                  this.skill_syzq(_loc4_);
               }
               else if(param1 == "ssp")
               {
                  _loc7_ = Number(this.player.returnSkillLevelBySkillName("ssp") - 1);
                  _loc4_ = this.consumeMP[_loc7_] * 0.55 * 22998 / 25958;
                  this.skill_ssp(_loc4_);
               }
               else if(param1 == "jsp")
               {
                  _loc7_ = Number(this.player.returnSkillLevelBySkillName("jsp") - 1);
                  _loc4_ = this.consumeMP[_loc7_] * 0.65 * 22998 / 25958;
                  this.skill_jsp(_loc4_);
               }
               else if(param1 == "dgq")
               {
                  _loc7_ = Number(this.player.returnSkillLevelBySkillName("dgq") - 1);
                  _loc4_ = this.consumeMP[_loc7_] * 0.4 * 22998 / 25958;
                  this.skill_dgq(_loc4_);
               }
               else if(param1 == "xgq")
               {
                  _loc7_ = Number(this.player.returnSkillLevelBySkillName("xgq") - 1);
                  _loc4_ = this.consumeMP[_loc7_] * 0.7 * 22998 / 25958;
                  this.skill_xgq(_loc4_);
               }
               else if(param1 == "tmc")
               {
                  _loc7_ = Number(this.player.returnSkillLevelBySkillName("tmc") - 1);
                  _loc4_ = this.consumeMP[_loc7_] * 1.2 * 22998 / 25958;
                  this.skill_tmc(_loc4_);
               }
               if(this.curAddEffect.curDebuff(BaseAddEffect.MONSTER65_AOE) || this.curAddEffect.curDebuff(BaseAddEffect.MONSTER129Buff))
               {
                  this.reduceHp(_loc4_);
               }
            }
         }
      }
      
      private function skill_dj(param1:uint) : void
      {
         if(this.roleProperies.getMMP() < param1)
         {
            return;
         }
         if(this.isAttacking() || this.isBeAttacking())
         {
            return;
         }
         this.lastHit = "hit4";
         this.setAction("hit4");
         this.hitNum = 0;
         this.newAttackId();
         if(gc.sid == this.sid)
         {
            gc.sendPosition(this);
         }
         this.roleProperies.setMMP(this.roleProperies.getMMP() - param1);
      }
      
      private function skill_sd(param1:uint) : void
      {
         if(this.roleProperies.getMMP() < param1)
         {
            return;
         }
         if(this.isAttacking() || this.isBeAttacking())
         {
            return;
         }
         this.lastHit = "hit5";
         this.setAction("hit5");
         this.newAttackId();
         this.hitNum = 0;
         if(gc.sid == this.sid)
         {
            gc.sendPosition(this);
         }
         this.roleProperies.setMMP(this.roleProperies.getMMP() - param1);
      }
      
      private function skill_zznh(param1:uint) : void
      {
         if(this.roleProperies.getMMP() < param1)
         {
            return;
         }
         if(this.isAttacking() || this.isBeAttacking())
         {
            return;
         }
         this.lastHit = "hit6";
         this.setAction("hit6");
         this.hitNum = 0;
         if(gc.sid == this.sid)
         {
            gc.sendPosition(this);
         }
         this.roleProperies.setMMP(this.roleProperies.getMMP() - param1);
      }
      
      private function skill_syzq(param1:uint) : void
      {
         if(this.roleProperies.getMMP() < param1)
         {
            return;
         }
         if(this.isAttacking() || this.isBeAttacking())
         {
            return;
         }
         this.lastHit = "hit7";
         this.setAction("hit7");
         this.hitNum = 0;
         this.newAttackId();
         if(gc.sid == this.sid)
         {
            gc.sendPosition(this);
         }
         this.roleProperies.setMMP(this.roleProperies.getMMP() - param1);
      }
      
      private function skill_ssp(param1:uint) : void
      {
         if(this.roleProperies.getMMP() < param1)
         {
            return;
         }
         if(this.isInSky())
         {
            return;
         }
         if(this.isAttacking() || this.isBeAttacking())
         {
            return;
         }
         this.lastHit = "hit8";
         this.setAction("hit8");
         this.hitNum = 0;
         this.newAttackId();
         if(gc.sid == this.sid)
         {
            gc.sendPosition(this);
         }
         this.roleProperies.setMMP(this.roleProperies.getMMP() - param1);
      }
      
      private function skill_jsp(param1:uint) : void
      {
         if(this.roleProperies.getMMP() < param1)
         {
            return;
         }
         if(this.isInSky())
         {
         }
         if(this.isAttacking() || this.isBeAttacking())
         {
            return;
         }
         if(this.getPlayer().returnSkillLevelBySkillName("jsp") >= 1)
         {
            if(Math.random() < 0.1)
            {
               this.attackBackInfoDict["hit9"] = {
                  "hitMaxCount":100,
                  "attackBackSpeed":[-1,-4],
                  "attackInterval":7,
                  "attackKind":"physics",
                  "addEffect":[{
                     "name":BaseAddEffect.STUN,
                     "time":gc.frameClips * 2
                  }],
                  "addprotection":1000 * 0.12 / 3
               };
            }
            else
            {
               this.attackBackInfoDict["hit9"] = {
                  "hitMaxCount":100,
                  "attackBackSpeed":[-1,-4],
                  "attackInterval":7,
                  "attackKind":"physics",
                  "addprotection":1000 * 0.12 / 3
               };
            }
         }
         this.lastHit = "hit9";
         this.setAction("hit9");
         this.hitNum = 0;
         this.newAttackId();
         if(gc.sid == this.sid)
         {
            gc.sendPosition(this);
         }
         this.roleProperies.setMMP(this.roleProperies.getMMP() - param1);
      }
      
      private function skill_dgq(param1:uint) : void
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
         this.newAttackId();
         this.hitNum = 0;
         if(gc.sid == this.sid)
         {
            gc.sendPosition(this);
         }
         this.roleProperies.setMMP(this.roleProperies.getMMP() - param1);
      }
      
      private function skill_xgq(param1:uint) : void
      {
         if(this.roleProperies.getMMP() < param1)
         {
            return;
         }
         if(this.isAttacking() || this.isBeAttacking())
         {
            return;
         }
         this.lastHit = "hit11";
         this.setAction("hit11");
         this.newAttackId();
         this.hitNum = 0;
         if(gc.sid == this.sid)
         {
            gc.sendPosition(this);
         }
         this.roleProperies.setMMP(this.roleProperies.getMMP() - param1);
      }
      
      private function skill_tmc(param1:uint) : void
      {
         if(this.isAttacking() && this.curAction != "hit12" || this.isBeAttacking())
         {
            return;
         }
         if(this.lastHit == "hit12" && this.getBBDC().getCurFrameCount() <= 130)
         {
            this.lastHit = "hit12_2";
            this.getBBDC().setCurFrameCount(0);
            this.doHit12_2(this.getBBDC().getDirect(),new Point(this.x,this.y));
         }
         else if(this.lastHit != "hit12_2" && this.lastHit != "hit12")
         {
            if(this.roleProperies.getMMP() < param1)
            {
               return;
            }
            this.lastHit = "hit12";
            this.setAction("hit12");
            this.hitNum = 0;
            if(gc.sid == this.sid)
            {
               gc.sendPosition(this);
            }
            this.roleProperies.setMMP(this.roleProperies.getMMP() - param1);
         }
      }
      
      override protected function showSkillKongGe() : void
      {
         var _loc1_:RoleInfo = gc.gameInfo.getRoleInfoByPlayer(this.player) as RoleInfo;
         if(_loc1_.isGXPReady() && !this.isGXP)
         {
            this.turnToGXP();
         }
      }
      
      override public function normalHit() : *
      {
         this.curtime = getTimer();
         if(this.timers <= 0)
         {
            if(!this.isInSky())
            {
               if(!this.isRunning() && (!this.isAttacking() || this.isNormalHit()))
               {
                  this.timers = 13;
                  if(this.curtime - this.lasttime > 25 * 60)
                  {
                     this.hitNum = 1;
                  }
                  else if(++this.hitNum > 3)
                  {
                     this.hitNum = 1;
                  }
                  SoundManager.play("Role3_hit" + this.hitNum);
                  if(this.hitNum == 1)
                  {
                     this.setAction("hit2");
                     this.lastHit = "hit2";
                  }
                  else if(this.hitNum == 2)
                  {
                     this.setAction("hit1");
                     this.lastHit = "hit1";
                  }
                  else if(this.hitNum == 3)
                  {
                     this.lastHit = "hit3";
                     this.setAction("hit3");
                  }
                  if(this.getPlayer())
                  {
                     gc.sendPosition(this);
                  }
                  this.newAttackId();
               }
               else if(Boolean(this.isRunning()) && !this.isAttacking())
               {
                  this.doubleCount = 0;
                  this.normalHit();
               }
            }
            else
            {
               this.timers = 15;
               this.setAction("hit1");
               if(this.getPlayer())
               {
                  gc.sendPosition(this);
               }
               this.lastHit = "hit1";
               this.hitNum = 0;
               SoundManager.play("Role3_hit3");
               this.newAttackId();
            }
         }
         this.lasttime = this.curtime;
      }
      
      override public function refreshEquip() : void
      {
         var _loc1_:uint = uint(this.getCurClothId());
         var _loc2_:uint = uint(this.getCurWeaponId());
         var _loc3_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("ROLE3_" + _loc1_);
         if(_loc3_)
         {
            this.bbdc.replaceBitmapDataByName("body",_loc3_);
         }
         _loc3_ = BaseBitmapDataPool.getBitmapDataArrayByName("ROLE3_EQUIP_" + _loc2_);
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
         this.roleProperies.setSHHP(100 + 70 * (this.roleProperies.getLevel() - 1));
         this.roleProperies.setHHP(this.roleProperies.getSHHP());
         this.roleProperies.setSMMP(35 + 15 * (this.roleProperies.getLevel() - 1));
         this.roleProperies.setMMP(this.roleProperies.getSMMP());
         this.roleProperies.setBasePower(15 + 8 * (this.roleProperies.getLevel() - 1));
         this.roleProperies.setDefense(4 + (this.roleProperies.getLevel() - 1));
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
         var _loc13_:Number = 1;
         if(this.isHit6Ok)
         {
            _loc13_ = 1.1 + 0.005 * int(this.player.returnSkillLevelBySkillName("zznh") - 1);
            this.isHit6Ok = false;
         }
         switch(param1)
         {
            case "hit1":
            case "hit2":
            case "hit3":
               _loc8_ = 3.119 * 6201 / 6782 * this.roleProperies.getHurt() * _loc12_ * _loc5_ * _loc13_;
               qixue = 3.119 * 6201 / 6782 * this.roleProperies.getHaveblood() * _loc5_;
               break;
            case "hit4":
               _loc7_ = Number(this.player.returnSkillLevelBySkillName("dj") - 1);
               mp_percent = 9 * Math.pow(22988 * 0.06 / 9,Math.pow(_loc7_ / 17,0.55)) / this.roleProperies.getSMMP() / 0.06 * 3 * Math.pow(1 / 3,Math.pow(_loc7_ / 17,0.75));
               _loc8_ = 0.6 * (this.SkillFixedDamage[_loc7_] * this.FixedDamageCount[_loc7_] * 1.1 + (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * 6201 / 6782 * this.roleProperies.getHurt()) / 2 * _loc12_ * _loc5_ * _loc13_;
               qixue = 0.6 * (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * 6201 / 6782 / 2 * this.roleProperies.getHaveblood() * _loc5_;
               break;
            case "hit5":
               _loc8_ = 0;
               break;
            case "hit6":
               _loc8_ = 0;
               break;
            case "hit7_1":
               _loc8_ = 0;
               break;
            case "hit7_2":
               _loc7_ = Number(this.player.returnSkillLevelBySkillName("syzq") - 1);
               mp_percent = 32 * Math.pow(22988 * 0.12 / 32,Math.pow(_loc7_ / 17,0.55)) / this.roleProperies.getSMMP() / 0.12 * 3 * Math.pow(1 / 3,Math.pow(_loc7_ / 17,0.75));
               _loc8_ = 0.8 * (this.SkillFixedDamage[_loc7_] * this.FixedDamageCount[_loc7_] * 1.05 + (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * 6201 / 6782 * this.roleProperies.getHurt()) / 11 * _loc12_ * _loc5_ * _loc13_;
               qixue = 0.8 * (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * 6201 / 6782 / 11 * this.roleProperies.getHaveblood() * _loc5_;
               break;
            case "hit8_1":
               _loc8_ = 0;
               break;
            case "hit8_2":
               _loc7_ = Number(this.player.returnSkillLevelBySkillName("ssp") - 1);
               mp_percent = 15 * Math.pow(22988 * 0.065 / 15,Math.pow(_loc7_ / 17,0.55)) / this.roleProperies.getSMMP() / 0.065 * 3 * Math.pow(1 / 3,Math.pow(_loc7_ / 17,0.75));
               _loc8_ = 0.62 * (this.SkillFixedDamage[_loc7_] * this.FixedDamageCount[_loc7_] * 1.1 + (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * 6201 / 6782 * this.roleProperies.getHurt()) / 4 * _loc12_ * _loc5_ * _loc13_;
               qixue = 0.62 * (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * 6201 / 6782 / 4 * this.roleProperies.getHaveblood() * _loc5_;
               break;
            case "hit9":
               _loc7_ = Number(this.player.returnSkillLevelBySkillName("jsp") - 1);
               mp_percent = 20 * Math.pow(22988 * 0.075 / 20,Math.pow(_loc7_ / 17,0.55)) / this.roleProperies.getSMMP() / 0.075 * 3 * Math.pow(1 / 3,Math.pow(_loc7_ / 17,0.75));
               _loc8_ = 0.7 * (this.SkillFixedDamage[_loc7_] * this.FixedDamageCount[_loc7_] * 1.08 + (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * 6201 / 6782 * this.roleProperies.getHurt()) / 3 * _loc12_ * _loc5_ * _loc13_;
               qixue = 0.7 * (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * 6201 / 6782 / 3 * this.roleProperies.getHaveblood() * _loc5_;
               break;
            case "hit10":
               _loc7_ = Number(this.player.returnSkillLevelBySkillName("dgq") - 1);
               mp_percent = 7 * Math.pow(22988 * 0.05 / 7,Math.pow(_loc7_ / 17,0.55)) / this.roleProperies.getSMMP() / 0.05 * 3 * Math.pow(1 / 3,Math.pow(_loc7_ / 17,0.75));
               _loc8_ = 0.45 * (this.SkillFixedDamage[_loc7_] * this.FixedDamageCount[_loc7_] + (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * 6201 / 6782 * this.roleProperies.getHurt()) / 5 * _loc12_ * _loc5_ * _loc13_;
               qixue = 0.45 * (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * 6201 / 6782 * this.roleProperies.getHaveblood() * _loc5_;
               break;
            case "hit11":
               _loc7_ = Number(this.player.returnSkillLevelBySkillName("xgq") - 1);
               mp_percent = 25 * Math.pow(22988 * 0.09 / 25,Math.pow(_loc7_ / 17,0.55)) / this.roleProperies.getSMMP() / 0.09 * 3 * Math.pow(1 / 3,Math.pow(_loc7_ / 17,0.75));
               _loc8_ = 0.7 * (this.SkillFixedDamage[_loc7_] * this.FixedDamageCount[_loc7_] * 1.05 + (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * 6201 / 6782 * this.roleProperies.getHurt()) / 4 * _loc12_ * _loc5_ * _loc13_;
               qixue = 0.7 * (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * 6201 / 6782 / 4 * this.roleProperies.getHaveblood() * _loc5_;
               break;
            case "hit12":
               _loc7_ = Number(this.player.returnSkillLevelBySkillName("tmc") - 1);
               mp_percent = 40 * Math.pow(22988 * 0.138 / 40,Math.pow(_loc7_ / 17,0.55)) / this.roleProperies.getSMMP() / 0.138 * 3 * Math.pow(1 / 3,Math.pow(_loc7_ / 17,0.75));
               _loc8_ = 1.22 * (this.SkillFixedDamage[_loc7_] * this.FixedDamageCount[_loc7_] * 1.075 + (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * 6201 / 6782 * this.roleProperies.getHurt()) / 10 * _loc12_ * _loc5_ * _loc13_;
               qixue = 1.22 * (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * 6201 / 6782 / 10 * this.roleProperies.getHaveblood() * _loc5_;
               break;
            case "fabao-qpj":
               _loc8_ = this.roleProperies.getHurt() * 1.945 * _loc13_ * _loc5_ * 6201 / 6782 * 1.08325 * 1.5;
               qixue = this.roleProperies.getHaveblood() * 1.945 * _loc5_ * 6201 / 6782 * 1.08325 * 1.5;
               break;
            case "fabao-qpj1":
               _loc8_ = this.roleProperies.getHurt() * 1.945 * _loc13_ * _loc5_ * 6201 / 6782 * 1.08325 * 1.5;
               qixue = this.roleProperies.getHaveblood() * 1.945 * _loc5_ * 6201 / 6782 * 1.08325 * 1.5;
               break;
            case "qpjThunder":
               _loc8_ = this.roleProperies.getHurt() * 2.52 * _loc13_ * _loc5_ * 6201 / 6782 * 1.08325 * 1.5;
               qixue = this.roleProperies.getHaveblood() * 2.52 * _loc5_ * 6201 / 6782 * 1.08325 * 1.5;
               break;
            case "fabao-zltc":
               _loc6_ = this.getPlayer().getCurEquipByType("zbfb");
               _loc13_ = 1;
               _loc8_ = this.roleProperies.getHurt() * (18 + (_loc6_.getELevel() - 1) * 3) / 4 * 6201 / 6782 * 1.8;
               qixue = this.roleProperies.getHaveblood() * (18 + (_loc6_.getELevel() - 1) * 3) / 4 * _loc5_ * 6201 / 6782 * 1.8;
               break;
            case "fabao-sword":
               _loc6_ = this.getPlayer().getCurEquipByType("zbfb");
               _loc13_ = 1;
               _loc8_ = this.roleProperies.getHurt() * _loc6_.getELevel() * 0.05 * 6201 / 6782;
               qixue = this.roleProperies.getHaveblood() * _loc6_.getELevel() * 0.05 * _loc5_ * 6201 / 6782;
               break;
            case "magicsword2":
               _loc6_ = this.getPlayer().getCurEquipByType("zbfb");
               if(Boolean(_loc6_) && _loc6_.getWX().indexOf("木") != -1)
               {
                  _loc8_ = 0.0875 * this.roleProperies.getHurt() * _loc6_.getELevel() * 6201 / 6782;
                  qixue = 0.0875 * this.roleProperies.getHaveblood() * _loc5_ * _loc6_.getELevel() * 6201 / 6782;
               }
               _loc8_ = this.roleProperies.getHurt() * _loc6_.getELevel() * 0.0488 * 6201 / 6550;
               qixue = 0.0488 * this.roleProperies.getHaveblood() * _loc5_ * _loc6_.getELevel() * 6201 / 6782;
               _loc13_ = 1;
               break;
            case "fabao-snow":
               _loc6_ = this.getPlayer().getCurEquipByType("zbfb");
               _loc8_ = this.roleProperies.getHurt() * _loc6_.getELevel() * 0.09 * 6201 / 6782;
               qixue = 0.09 * this.roleProperies.getHaveblood() * _loc5_ * _loc6_.getELevel() * 6201 / 6782;
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
               _loc8_ = this.roleProperies.getHurt() * _loc13_ * _loc5_ * _loc3_ * 6201 / 6782;
               qixue = _loc3_ * this.roleProperies.getHaveblood() * _loc5_ * 6201 / 6782;
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
               _loc8_ = this.roleProperies.getHurt() * _loc13_ * _loc5_ * _loc3_ * 6201 / 6782;
               qixue = _loc3_ * this.roleProperies.getHaveblood() * _loc5_ * 6201 / 6782;
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
               _loc8_ = this.roleProperies.getHurt() * _loc13_ * _loc5_ * _loc3_ * 6201 / 6782;
               qixue = _loc3_ * this.roleProperies.getHaveblood() * _loc5_ * 6201 / 6782;
               break;
            case "Pearl":
               _loc6_ = this.getPlayer().getCurEquipByType("zbfb");
               if(Boolean(_loc6_) && _loc6_.getWX().indexOf("木") != -1)
               {
                  _loc8_ = 1.2 * this.roleProperies.getHurt() * 6201 / 6782;
                  qixue = 1.2 * this.roleProperies.getHaveblood() * _loc5_ * 6201 / 6782;
               }
               _loc8_ = this.roleProperies.getHurt() * 0.6 * 6201 / 6782;
               qixue = 0.6 * this.roleProperies.getHaveblood() * _loc5_ * 6201 / 6782;
               _loc13_ = 1;
               break;
            case "fabao-pearl":
               _loc6_ = this.getPlayer().getCurEquipByType("zbfb");
               if(Boolean(_loc6_) && _loc6_.getWX().indexOf("木") != -1)
               {
                  _loc8_ = _loc6_.getELevel() * 0.0473 * this.roleProperies.getHurt() * 6201 / 6782;
                  qixue = _loc6_.getELevel() * 0.0473 * this.roleProperies.getHaveblood() * _loc5_ * 6201 / 6782;
               }
               _loc13_ = 1;
               _loc8_ = _loc6_.getELevel() * 0.0315 * this.roleProperies.getHurt() * 6201 / 6782;
               qixue = _loc6_.getELevel() * 0.0315 * this.roleProperies.getHaveblood() * _loc5_ * 6201 / 6782;
               break;
            default:
               _loc8_ = 0;
         }
         return {
            "hurt":_loc8_ * 1.165,
            "qixue":qixue * 1.165,
            "atk":this.roleProperies.getPower()
         };
      }
      
      override public function addHeroHurtMc(param1:int) : void
      {
         if(this.isGXP)
         {
            param1 /= 2;
         }
         var _loc2_:ANumber = new ANumber();
         gc.gameSence.addChild(_loc2_);
         _loc2_.aNumImage("pnum",param1,this.x - 20,this.y - 60,20);
      }
      
      private function isAttackingButCanAttack() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3";
      }
      
      override protected function isCannotMoveWhenAttackOnFloor() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3" && gc.protectedPerproty.getProperty(this,"jumpCount") == 0 || this.curAction == "hit4" || this.curAction == "hit7" || this.curAction == "hit8" || this.curAction == "hit9" || this.curAction == "hit11" || this.curAction == "hit11Frame2" || this.curAction == "hit12";
      }
      
      override public function isAttacking() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3" || this.curAction == "hit4" || this.curAction == "hit5" || this.curAction == "hit6" || this.curAction == "hit7" || this.curAction == "hit8" || this.curAction == "hit9" || this.curAction == "hit10" || this.curAction == "hit11" || this.curAction == "hit11Frame2" || this.curAction == "hit12";
      }
      
      override public function isCanMoveWhenAttack() : Boolean
      {
         return this.curAction == "hit5" || this.curAction == "hit10";
      }
   }
}

