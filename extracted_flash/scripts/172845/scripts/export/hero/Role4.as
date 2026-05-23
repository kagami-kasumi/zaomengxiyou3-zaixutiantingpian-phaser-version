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
   
   public class Role4 extends BaseHero
   {
      
      private var hit11Biaoji:SpecialEffectBullet;
      
      private var hit11BiaojiCount:uint;
      
      private var curHit11BiaojiCount:uint = 0;
      
      private var role4Hit5:MonsterRole4Hit5;
      
      private var isNotArrow:Boolean = true;
      
      private var hit12Dict:Dictionary;
      
      private var consumeMP:Array;
      
      private var hmzLianZhan:Array;
      
      private var hmzZaDi:Array;
      
      private var SkillFixedDamage:Array;
      
      private var FixedDamageCount:Array;
      
      private var SkillFactor:Array;
      
      private var hmzLianZhanFactor:Array;
      
      private var hmzZaDiFactor:Array;
      
      public function Role4()
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
         this.hit12Dict = new Dictionary();
         super();
         roleName = "沙僧";
         userType = "沙僧";
         this.horizenSpeed = 6;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[2,-3],
            "attackInterval":999,
            "attackKind":"magic",
            "addprotection":1000 / 22
         };
         this.attackBackInfoDict["hit1Arrow"] = {
            "hitMaxCount":12,
            "attackBackSpeed":[0.5,-3],
            "attackInterval":999,
            "attackKind":"magic",
            "addprotection":1000 / 23
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":20,
            "attackBackSpeed":[0.5,-3],
            "attackInterval":999,
            "attackKind":"magic",
            "addprotection":1000 / 22
         };
         this.attackBackInfoDict["hit2Arrow"] = {
            "hitMaxCount":20,
            "attackBackSpeed":[0.5,-3],
            "attackInterval":5,
            "attackKind":"magic",
            "addprotection":1000 / 23 / 3
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":20,
            "attackBackSpeed":[4,-3],
            "attackInterval":7,
            "attackKind":"magic",
            "addprotection":1000 / 22 / 3
         };
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[5,-3],
            "attackInterval":12,
            "attackKind":"magic",
            "addEffect":[{
               "name":BaseAddEffect.POISON,
               "time":gc.frameClips * 5,
               "power":1
            }],
            "addprotection":1000 * 0.08 / 2
         };
         this.attackBackInfoDict["hit4Arrow"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[5,-3],
            "attackInterval":999,
            "attackKind":"magic",
            "addEffect":[{
               "name":BaseAddEffect.POISON,
               "time":gc.frameClips * 5,
               "power":1
            }],
            "addprotection":1000 * 0.08
         };
         this.attackBackInfoDict["hit5"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[0,-2],
            "attackInterval":999,
            "attackKind":"magic",
            "addprotection":0
         };
         this.attackBackInfoDict["hit6"] = {
            "hitMaxCount":1,
            "attackBackSpeed":[0,-2],
            "attackInterval":999,
            "attackKind":"magic",
            "addprotection":1000 * 0.16 / 5
         };
         this.attackBackInfoDict["hit7"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[0,-2],
            "attackInterval":20,
            "attackKind":"magic",
            "addEffect":[{
               "name":BaseAddEffect.POISON,
               "time":gc.frameClips * 5,
               "power":1
            },{
               "name":BaseAddEffect.POISON_TIMES,
               "time":gc.frameClips * 5
            }],
            "addprotection":1000 * 0.14 / 60
         };
         this.attackBackInfoDict["hit8"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[30,-2],
            "attackInterval":999,
            "attackKind":"magic",
            "addprotection":1000 * 0.12
         };
         this.attackBackInfoDict["hit8Arrow"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[30,-2],
            "attackInterval":999,
            "attackKind":"magic",
            "addprotection":1000 * 0.12
         };
         this.attackBackInfoDict["hit9"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[15,-25],
            "attackInterval":999,
            "attackKind":"magic",
            "addprotection":1000 * 0.14
         };
         this.attackBackInfoDict["hit9Arrow"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[5,0],
            "attackInterval":4,
            "attackKind":"magic",
            "addprotection":1000 * 0.14 / 5
         };
         this.attackBackInfoDict["hit10"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[2,-2],
            "attackInterval":8,
            "attackKind":"magic",
            "addprotection":1000 * 0.158
         };
         this.attackBackInfoDict["hit10Arrow"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[10,-2],
            "attackInterval":999,
            "attackKind":"magic",
            "addprotection":1000 * 0.158 / 5
         };
         this.attackBackInfoDict["hit11"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[0,0],
            "attackInterval":7,
            "attackKind":"magic",
            "addprotection":1000 * 0.16 / 6
         };
         this.attackBackInfoDict["hit12"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[3,-2],
            "attackInterval":18,
            "attackKind":"magic",
            "addprotection":1000 * 0.136 / 6
         };
         this.attackBackInfoDict["hit12Arrow"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[0,0],
            "attackInterval":10,
            "attackKind":"magic",
            "addprotection":1000 * 0.22 / 34
         };
         nameTextField.y = -this.colipse.height / 2 - 30;
         nameTextField.x = -this.colipse.width / 2 - 30;
         nameTextField.selectable = false;
         nameTextField.autoSize = "center";
         nameTextField.cacheAsBitmap = true;
         this.addChild(nameTextField);
         this.hit11BiaojiCount = gc.frameClips * 10;
      }
      
      override public function initPopertits() : void
      {
         super.initPopertits();
         this.attackBackInfoDict["hit7"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[0,-2],
            "attackInterval":10,
            "attackKind":"magic",
            "addEffect":[{
               "name":BaseAddEffect.POISON,
               "time":gc.frameClips * 5,
               "power":1
            },{
               "name":BaseAddEffect.POISON_TIMES,
               "time":gc.frameClips * 5,
               "who":this
            }],
            "addprotection":1000 * 0.14 / 60
         };
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:* = null;
         var _loc3_:* = null;
         var _loc4_:* = null;
         var _loc5_:uint = uint(this.getCurClothId());
         var _loc6_:uint = uint(this.getCurWeaponId());
         if(!(_loc6_ == 4 || _loc6_ == 5 || _loc6_ == 9 || _loc6_ == 998))
         {
            this.isNotArrow = true;
            _loc1_ = BaseBitmapDataPool.getBitmapDataArrayByName("ROLE4_SHOVEL_" + _loc5_);
         }
         else
         {
            this.isNotArrow = false;
            _loc1_ = BaseBitmapDataPool.getBitmapDataArrayByName("ROLE4_ARROW_" + _loc5_);
         }
         _loc2_ = BaseBitmapDataPool.getBitmapDataArrayByName("ROLE4_EQUIP_" + _loc6_);
         trace(_loc1_,_loc2_);
         if(Boolean(_loc1_) && Boolean(_loc2_))
         {
            if(bbdc)
            {
               this.bbdc.replaceBitmapDataByName("body",_loc1_);
               this.bbdc.replaceBitmapDataByName("equip",_loc2_);
               if(this.isNotArrow)
               {
                  bbdc.setFrameStopCount([[2,2,2,3,2,4],[2,2,2,13,2,24],[4,4,4,4],[2,2,2,2],[1,1,15,6,10,4],[2,2,2,2,2],[2,2,6],[2,2,11],[1,1,1,2],[2,19],[2,2,30],[2,2,2,15],[2,2,16],[2,2,14]]);
                  bbdc.setFrameCount([36,6,4,4,[1,1,1,1,1,1],5,3,3,12,2,3,4,3,3]);
               }
               else
               {
                  bbdc.setFrameStopCount([[2,2,2,3,2,4],[2,2,2,13,2,24],[4,4,4,4],[2,2,2,2],[1,1,15,10,20,4],[2,2,2,2,2],[2,2,1,1,3],[2,2,2,2,2,4],[2,4,1,1,10],[2,2,30],[2,2,1,1,12],[2,2,2,2,2,20],[2,7,1,1,25],[2,18,2,2,2,24]]);
                  bbdc.setFrameCount([36,6,4,4,[1,1,1,1,1,1],5,5,6,5,3,5,6,5,6]);
               }
            }
            else
            {
               _loc3_ = {
                  "name":"body",
                  "source":_loc1_
               };
               _loc4_ = {
                  "name":"equip",
                  "source":_loc2_
               };
               bbdc = new BaseBitmapDataClip([_loc3_,_loc4_],200,200,new Point(0,0));
               bbdc.setOffsetXY(15,-13);
               if(this.isNotArrow)
               {
                  bbdc.setFrameStopCount([[2,2,2,3,2,4],[2,2,2,13,2,24],[4,4,4,4],[2,2,2,2],[1,1,8,6,10,4],[2,2,2,2,2],[2,2,6],[2,2,11],[1,1,1,2],[2,19],[2,2,30],[2,2,2,15],[2,2,16],[2,2,14]]);
                  bbdc.setFrameCount([36,6,4,4,[1,1,1,1,1,1],5,3,3,12,2,3,4,3,3]);
               }
               else
               {
                  bbdc.setFrameStopCount([[2,2,2,3,2,4],[2,2,2,13,2,24],[4,4,4,4],[2,2,2,2],[1,1,8,10,20,4],[2,2,2,2,2],[2,2,1,1,3],[2,2,2,2,2,4],[2,4,1,1,10],[2,2,30],[2,2,1,1,12],[2,2,2,2,2,20],[2,7,1,1,25],[2,18,2,2,2,24]]);
                  bbdc.setFrameCount([36,6,4,4,[1,1,1,1,1,1],5,5,6,5,3,5,6,5,6]);
               }
               bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
               bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
               this.body.addChild(bbdc);
               this.bbdc.turnRight();
            }
            return;
         }
         throw new Error("ROLE4--BitmapData Error!");
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
               if(this.isNotArrow)
               {
                  if(_loc2_.y != 6)
                  {
                     this.bbdc.setFramePointX(0);
                     this.bbdc.setFramePointY(6);
                  }
               }
               else if(_loc2_.y != 6)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(6);
               }
               this.bbdc.setState(param1);
               return;
            case "hit2":
               if(this.isNotArrow)
               {
                  if(_loc2_.y != 7)
                  {
                     this.bbdc.setFramePointX(0);
                     this.bbdc.setFramePointY(7);
                  }
               }
               else if(_loc2_.y != 6)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(6);
               }
               this.bbdc.setState(param1);
               return;
            case "hit3":
               if(this.isNotArrow)
               {
                  if(_loc2_.y != 8)
                  {
                     this.bbdc.setFramePointX(0);
                     this.bbdc.setFramePointY(8);
                  }
               }
               else if(_loc2_.y != 7)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(7);
               }
               this.bbdc.setState(param1);
               return;
            case "hit4":
               if(this.isNotArrow)
               {
                  if(_loc2_.y != 9)
                  {
                     this.bbdc.setFramePointX(0);
                     this.bbdc.setFramePointY(9);
                  }
               }
               else if(_loc2_.y != 8)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(8);
               }
               this.bbdc.setState(param1);
               return;
            case "hit5":
               if(this.isNotArrow)
               {
                  if(_loc2_.y != 9)
                  {
                     this.bbdc.setFramePointX(0);
                     this.bbdc.setFramePointY(9);
                  }
               }
               else if(_loc2_.x != 4 || _loc2_.y != 4)
               {
                  this.bbdc.setFramePointX(4);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(param1);
               return;
            case "hit6":
               if(this.isNotArrow)
               {
                  if(_loc2_.x != 4 || _loc2_.y != 4)
                  {
                     this.bbdc.setFramePointX(4);
                     this.bbdc.setFramePointY(4);
                  }
               }
               else if(_loc2_.x != 3 || _loc2_.y != 4)
               {
                  this.bbdc.setFramePointX(3);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(param1);
               return;
            case "hit7":
               if(this.isNotArrow)
               {
                  if(_loc2_.y != 10)
                  {
                     this.bbdc.setFramePointX(0);
                     this.bbdc.setFramePointY(10);
                  }
               }
               else if(_loc2_.y != 9)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(9);
               }
               this.bbdc.setState(param1);
               return;
            case "hit8":
               if(this.isNotArrow)
               {
                  if(_loc2_.y != 11)
                  {
                     this.bbdc.setFramePointX(0);
                     this.bbdc.setFramePointY(11);
                  }
               }
               else if(_loc2_.y != 10)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(10);
               }
               this.bbdc.setState(param1);
               return;
            case "hit9":
               if(this.isNotArrow)
               {
                  if(_loc2_.y != 12)
                  {
                     this.bbdc.setFramePointX(0);
                     this.bbdc.setFramePointY(12);
                  }
               }
               else if(_loc2_.y != 11)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(11);
               }
               this.bbdc.setState(param1);
               return;
            case "hit10":
               if(this.isNotArrow)
               {
                  if(_loc2_.y != 10)
                  {
                     this.bbdc.setFramePointX(0);
                     this.bbdc.setFramePointY(10);
                  }
               }
               else if(_loc2_.y != 12)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(12);
               }
               this.bbdc.setState(param1);
               return;
            case "hit11":
               if(_loc2_.x != 5 || _loc2_.y != 4)
               {
                  this.bbdc.setFramePointX(5);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(param1);
               return;
            case "hit12":
               if(_loc2_.y != 13)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(13);
               }
               this.bbdc.setState(param1);
               return;
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
               return;
            case "wait2":
               this.setAction("wait");
               return;
            case "walk":
               this.bbdc.setFramePointX(0);
               return;
            case "run":
               this.bbdc.setFramePointX(0);
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
               this.setStatic();
               this.setAction("wait");
               return;
            case "hit4":
               this.setAction("wait");
               return;
            case "hit5":
               this.setAction("wait");
               return;
            case "hit6":
               this.setAction("wait");
               return;
            case "hit7":
               this.setAction("wait");
               return;
            case "hit8":
               this.setAction("wait");
               return;
            case "hit9":
               this.speed.y = 0;
               this.setAction("wait");
               return;
            case "hit10":
               this.setStatic();
               this.setAction("wait");
               return;
            case "hit11":
               this.setAction("wait");
               return;
            case "hit11Frame2":
               this.setAction("wait");
               return;
            case "hit12":
               this.lastHit = "";
               this.getBBDC().show();
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
         var _loc3_:* = NaN;
         var _loc4_:Number = Number(NaN);
         var _loc5_:* = null;
         var _loc6_:* = null;
         var _loc7_:String = this.bbdc.getState();
         var _loc8_:Point = new Point();
         switch(_loc7_)
         {
            case "hit1":
               if(this.isNotArrow)
               {
                  if(gc.sid == this.sid || gc.isSingleGame())
                  {
                     if(this.bbdc.getCurFrameCount() == 2)
                     {
                        if(param1.x == 1)
                        {
                           if(this.bbdc.getDirect() == 0)
                           {
                              _loc8_.x = this.x - 20;
                           }
                           else
                           {
                              _loc8_.x = this.x + 20;
                           }
                           _loc8_.y = this.y + 30;
                           this.doHit1(this.getBBDC().getDirect(),_loc8_);
                           gc.sendAttack(this.getRoleId(),"hit1",this.getBBDC().getDirect(),_loc8_.x,_loc8_.y,[]);
                           return;
                        }
                        return;
                     }
                     return;
                  }
                  return;
               }
               if(gc.sid == this.sid || gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     if(param1.x == 2)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc8_.x = this.x - 90;
                        }
                        else
                        {
                           _loc8_.x = this.x + 90;
                        }
                        _loc8_.y = this.y;
                        this.doHit1Arrow(this.getBBDC().getDirect(),_loc8_);
                        gc.sendAttack(this.getRoleId(),"doHit1Arrow",this.getBBDC().getDirect(),_loc8_.x,_loc8_.y,[]);
                        return;
                     }
                     return;
                  }
                  return;
               }
               return;
               break;
            case "hit2":
               if(this.isNotArrow)
               {
                  if(gc.sid == this.sid || gc.isSingleGame())
                  {
                     if(this.bbdc.getCurFrameCount() == 2)
                     {
                        if(param1.x == 1)
                        {
                           if(this.bbdc.getDirect() == 0)
                           {
                              _loc8_.x = this.x - 15;
                           }
                           else
                           {
                              _loc8_.x = this.x + 15;
                           }
                           _loc8_.y = this.y;
                           this.doHit2(this.getBBDC().getDirect(),_loc8_);
                           gc.sendAttack(this.getRoleId(),"hit2",this.getBBDC().getDirect(),_loc8_.x,_loc8_.y,[]);
                           return;
                        }
                        return;
                     }
                     return;
                  }
                  return;
               }
               if(gc.sid == this.sid || gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     if(param1.x == 2)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc8_.x = this.x - 90;
                        }
                        else
                        {
                           _loc8_.x = this.x + 90;
                        }
                        _loc8_.y = this.y;
                        this.doHit1Arrow(this.getBBDC().getDirect(),_loc8_);
                        gc.sendAttack(this.getRoleId(),"doHit1Arrow",this.getBBDC().getDirect(),_loc8_.x,_loc8_.y,[]);
                        return;
                     }
                     return;
                  }
                  return;
               }
               return;
               break;
            case "hit3":
               if(this.isNotArrow)
               {
                  if(gc.sid == this.sid || gc.isSingleGame())
                  {
                     if(this.bbdc.getCurFrameCount() == 1)
                     {
                        if(param1.x == 0)
                        {
                           if(this.bbdc.getDirect() == 0)
                           {
                              _loc8_.x = this.x;
                           }
                           else
                           {
                              _loc8_.x = this.x;
                           }
                           _loc8_.y = this.y;
                           this.doHit3(this.getBBDC().getDirect(),_loc8_);
                           gc.sendAttack(this.getRoleId(),"hit3",this.getBBDC().getDirect(),_loc8_.x,_loc8_.y,[]);
                        }
                     }
                  }
                  if(this.getBBDC().getDirect() == 0)
                  {
                     this.speed.x = -8;
                     return;
                  }
                  this.speed.x = 8;
                  return;
               }
               if(gc.sid == this.sid || gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     if(param1.x == 1)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc8_.x = this.x - 115;
                        }
                        else
                        {
                           _loc8_.x = this.x + 115;
                        }
                        _loc8_.y = this.y - 20;
                        this.doHit2Arrow(this.getBBDC().getDirect(),_loc8_);
                        gc.sendAttack(this.getRoleId(),"doHit2Arrow",this.getBBDC().getDirect(),_loc8_.x,_loc8_.y,[]);
                        return;
                     }
                     return;
                  }
                  return;
               }
               return;
               break;
            case "hit4":
               if(this.isNotArrow)
               {
                  if(gc.sid == this.sid || gc.isSingleGame())
                  {
                     if(this.bbdc.getCurFrameCount() == 19)
                     {
                        if(param1.x == 1)
                        {
                           if(this.bbdc.getDirect() == 0)
                           {
                              _loc8_.x = this.x - 245;
                           }
                           else
                           {
                              _loc8_.x = this.x + 245;
                           }
                           _loc8_.y = this.y - 110;
                           this.doHit4(this.getBBDC().getDirect(),_loc8_);
                           gc.sendAttack(this.getRoleId(),"hit4",this.getBBDC().getDirect(),_loc8_.x,_loc8_.y,[]);
                           return;
                        }
                        return;
                     }
                     return;
                  }
                  return;
               }
               if(gc.sid == this.sid || gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     if(param1.x == 2)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc8_.x = this.x - 30;
                        }
                        else
                        {
                           _loc8_.x = this.x + 30;
                        }
                        _loc8_.y = this.y;
                        this.doHit4Arrow(this.getBBDC().getDirect(),_loc8_);
                        gc.sendAttack(this.getRoleId(),"doHit4Arrow",this.getBBDC().getDirect(),_loc8_.x,_loc8_.y,[]);
                        return;
                     }
                     return;
                  }
                  return;
               }
               return;
               break;
            case "hit5":
               if(this.isNotArrow)
               {
                  if(this.bbdc.getCurFrameCount() == 19)
                  {
                     if(param1.x == 1)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc8_.x = this.x - 115;
                        }
                        else
                        {
                           _loc8_.x = this.x + 115;
                        }
                        _loc8_.y = this.y - 110;
                        this.doHit5_1(this.getBBDC().getDirect(),_loc8_);
                     }
                  }
               }
               else if(this.bbdc.getCurFrameCount() == 20)
               {
                  if(param1.x == 4)
                  {
                     if(this.bbdc.getDirect() == 0)
                     {
                        _loc8_.x = this.x - 115;
                     }
                     else
                     {
                        _loc8_.x = this.x + 115;
                     }
                     _loc8_.y = this.y - 110;
                     this.doHit5_1(this.getBBDC().getDirect(),_loc8_);
                  }
               }
               if(gc.sid == this.sid || gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 14)
                  {
                     if(param1.x == 1 || param1.x == 4)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc8_.x = this.x;
                        }
                        else
                        {
                           _loc8_.x = this.x;
                        }
                        _loc8_.y = this.y - 20;
                        _loc3_ = 9999;
                        for each(_loc5_ in gc.obbsiteArray)
                        {
                           if(this.getBBDC().getDirect() == 0)
                           {
                              if(this.x > _loc5_.x)
                              {
                                 _loc4_ = AUtils.GetDisBetweenTwoObj(this,_loc5_);
                                 if(_loc3_ > _loc4_)
                                 {
                                    _loc3_ = Number(_loc4_);
                                    _loc2_ = _loc5_;
                                 }
                              }
                           }
                           else if(this.x < _loc5_.x)
                           {
                              _loc4_ = AUtils.GetDisBetweenTwoObj(this,_loc5_);
                              if(_loc3_ > _loc4_)
                              {
                                 _loc3_ = Number(_loc4_);
                                 _loc2_ = _loc5_;
                              }
                           }
                        }
                        if(_loc2_)
                        {
                           this.doHit5_2(this.getBBDC().getDirect(),_loc8_,[_loc2_.sid,_loc2_.getRoleId()]);
                           gc.sendAttack(this.getRoleId(),"hit5_2",this.getBBDC().getDirect(),_loc8_.x,_loc8_.y,[_loc2_.sid,_loc2_.getRoleId()]);
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
               if(this.isNotArrow)
               {
                  if(gc.sid == this.sid || gc.isSingleGame())
                  {
                     if(this.bbdc.getCurFrameCount() == 10)
                     {
                        if(param1.x == 4)
                        {
                           if(this.bbdc.getDirect() == 0)
                           {
                              _loc8_.x = this.x - 25;
                           }
                           else
                           {
                              _loc8_.x = this.x + 25;
                           }
                           _loc8_.y = this.y - 30;
                           this.doHit6(this.getBBDC().getDirect(),_loc8_);
                           gc.sendAttack(this.getRoleId(),"hit6",this.getBBDC().getDirect(),_loc8_.x,_loc8_.y,[]);
                           return;
                        }
                        return;
                     }
                     return;
                  }
                  return;
               }
               if(gc.sid == this.sid || gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     if(param1.x == 3)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc8_.x = this.x - 25;
                        }
                        else
                        {
                           _loc8_.x = this.x + 25;
                        }
                        _loc8_.y = this.y - 30;
                        this.doHit6(this.getBBDC().getDirect(),_loc8_);
                        gc.sendAttack(this.getRoleId(),"hit6",this.getBBDC().getDirect(),_loc8_.x,_loc8_.y,[]);
                        return;
                     }
                     return;
                  }
                  return;
               }
               return;
               break;
            case "hit7":
               if(this.bbdc.getCurFrameCount() == 20)
               {
                  if(param1.x == 2)
                  {
                     for each(_loc6_ in this.magicBulletArray)
                     {
                        if(_loc6_.getImcName() == "Role4Bullet7_1")
                        {
                           _loc6_.destroy();
                        }
                     }
                     if(this.bbdc.getDirect() == 0)
                     {
                        _loc8_.x = this.x - 155;
                     }
                     else
                     {
                        _loc8_.x = this.x + 155;
                     }
                     _loc8_.y = this.y - 50;
                     this.doHit7_1(this.getBBDC().getDirect(),_loc8_);
                  }
               }
               if(gc.sid == this.sid || gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 8)
                  {
                     if(param1.x == 2)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc8_.x = this.x - 150;
                        }
                        else
                        {
                           _loc8_.x = this.x + 150;
                        }
                        _loc8_.y = this.y - 70;
                        this.doHit7_2(this.getBBDC().getDirect(),_loc8_);
                        gc.sendAttack(this.getRoleId(),"hit7_2",this.getBBDC().getDirect(),_loc8_.x,_loc8_.y,[]);
                        return;
                     }
                     return;
                  }
                  return;
               }
               return;
               break;
            case "hit8":
               if(this.isNotArrow)
               {
                  if(gc.sid == this.sid || gc.isSingleGame())
                  {
                     if(this.bbdc.getCurFrameCount() == 2)
                     {
                        if(param1.x == 2)
                        {
                           if(this.bbdc.getDirect() == 0)
                           {
                              _loc8_.x = this.x - 125;
                           }
                           else
                           {
                              _loc8_.x = this.x + 125;
                           }
                           _loc8_.y = this.y - 30;
                           this.doHit8(this.getBBDC().getDirect(),_loc8_);
                           gc.sendAttack(this.getRoleId(),"hit8",this.getBBDC().getDirect(),_loc8_.x,_loc8_.y,[]);
                           return;
                        }
                        return;
                     }
                     return;
                  }
                  return;
               }
               if(this.bbdc.getCurFrameCount() == 2)
               {
                  if(param1.x == 0)
                  {
                     if(this.bbdc.getDirect() == 0)
                     {
                        _loc8_.x = this.x - 75;
                     }
                     else
                     {
                        _loc8_.x = this.x + 75;
                     }
                     _loc8_.y = this.y - 60;
                     this.doHit8Arrow_1(this.getBBDC().getDirect(),_loc8_);
                  }
               }
               if(gc.sid == this.sid || gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     if(param1.x == 0)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc8_.x = this.x - 65;
                        }
                        else
                        {
                           _loc8_.x = this.x + 65;
                        }
                        _loc8_.y = this.y - 10;
                        this.doHit8Arrow_2(this.getBBDC().getDirect(),_loc8_);
                        gc.sendAttack(this.getRoleId(),"doHit8Arrow_2",this.getBBDC().getDirect(),_loc8_.x,_loc8_.y,[]);
                     }
                  }
               }
               if(param1.x == 0)
               {
                  if(this.bbdc.getDirect() == 0)
                  {
                     this.isRight = true;
                     this.isLeft = false;
                     this.speed.x = 25;
                     this.speed.y = -25;
                     return;
                  }
                  this.isLeft = true;
                  this.isRight = false;
                  this.speed.x = -25;
                  this.speed.y = -25;
                  return;
               }
               this.setStatic();
               this.speed.y = 0;
               return;
               break;
            case "hit9":
               if(this.isNotArrow)
               {
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     if(param1.x == 0)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc8_.x = this.x;
                        }
                        else
                        {
                           _loc8_.x = this.x;
                        }
                        _loc8_.y = this.y;
                        this.doHit9_1(this.getBBDC().getDirect(),_loc8_);
                     }
                  }
                  if(gc.sid == this.sid || gc.isSingleGame())
                  {
                     if(this.bbdc.getCurFrameCount() == 13)
                     {
                        if(param1.x == 2)
                        {
                           if(this.bbdc.getDirect() == 0)
                           {
                              _loc8_.x = this.x;
                           }
                           else
                           {
                              _loc8_.x = this.x;
                           }
                           _loc8_.y = this.y - 80;
                           this.doHit9_2(this.getBBDC().getDirect(),_loc8_);
                           gc.sendAttack(this.getRoleId(),"hit9_2",this.getBBDC().getDirect(),_loc8_.x,_loc8_.y,[]);
                        }
                     }
                  }
                  if(param1.x == 2)
                  {
                     this.speed.y = -10;
                     return;
                  }
                  return;
               }
               if(this.bbdc.getCurFrameCount() == 2)
               {
                  if(param1.x == 0)
                  {
                     if(this.bbdc.getDirect() == 0)
                     {
                        _loc8_.x = this.x - 80;
                     }
                     else
                     {
                        _loc8_.x = this.x + 80;
                     }
                     _loc8_.y = this.y - 80;
                     this.doHit9Arrow_1(this.getBBDC().getDirect(),_loc8_);
                  }
               }
               if(gc.sid == this.sid || gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     if(param1.x == 1)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc8_.x = this.x - 60;
                        }
                        else
                        {
                           _loc8_.x = this.x + 60;
                        }
                        _loc8_.y = this.y + 30;
                        this.doHit9Arrow_2(this.getBBDC().getDirect(),_loc8_);
                        gc.sendAttack(this.getRoleId(),"doHit9Arrow_2",this.getBBDC().getDirect(),_loc8_.x,_loc8_.y,[]);
                     }
                  }
               }
               if(param1.x <= 1)
               {
                  this.speed.y = -35;
               }
               else
               {
                  this.speed.y = 0;
               }
               this.setStatic();
               return;
               break;
            case "hit10":
               if(this.isNotArrow)
               {
                  if(gc.sid == this.sid || gc.isSingleGame())
                  {
                     if(this.bbdc.getCurFrameCount() == 2)
                     {
                        if(param1.x == 0)
                        {
                           if(this.bbdc.getDirect() == 0)
                           {
                              _loc8_.x = this.x - 150;
                           }
                           else
                           {
                              _loc8_.x = this.x + 150;
                           }
                           _loc8_.y = this.y - 50;
                           this.doHit10(this.getBBDC().getDirect(),_loc8_);
                           gc.sendAttack(this.getRoleId(),"hit10",this.getBBDC().getDirect(),_loc8_.x,_loc8_.y,[]);
                        }
                     }
                  }
                  if(param1.x < 2)
                  {
                     if(this.getBBDC().getDirect() == 0)
                     {
                        this.speed.x = -20;
                        return;
                     }
                     this.speed.x = 20;
                     return;
                  }
                  this.setStatic();
                  return;
               }
               if(this.bbdc.getCurFrameCount() == 2)
               {
                  if(param1.x == 0)
                  {
                     if(this.bbdc.getDirect() == 0)
                     {
                        _loc8_.x = this.x;
                     }
                     else
                     {
                        _loc8_.x = this.x;
                     }
                     _loc8_.y = this.y;
                     this.doHit10Arrow_1(this.getBBDC().getDirect(),_loc8_);
                  }
               }
               if(gc.sid == this.sid || gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 24)
                  {
                     if(param1.x == 4)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc8_.x = this.x - 225;
                        }
                        else
                        {
                           _loc8_.x = this.x + 225;
                        }
                        _loc8_.y = this.y - 80;
                        this.doHit10Arrow_2(this.getBBDC().getDirect(),_loc8_);
                        gc.sendAttack(this.getRoleId(),"doHit10Arrow_2",this.getBBDC().getDirect(),_loc8_.x,_loc8_.y,[]);
                        return;
                     }
                     return;
                  }
                  return;
               }
               return;
               break;
            case "hit11":
               if(gc.sid == this.sid || gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 4)
                  {
                     if(param1.x == 5)
                     {
                        _loc8_.x = this.x;
                        _loc8_.y = this.y;
                        this.doHit11(this.getBBDC().getDirect(),_loc8_);
                        gc.sendAttack(this.getRoleId(),"hit11",this.getBBDC().getDirect(),_loc8_.x,_loc8_.y,[]);
                        return;
                     }
                     return;
                  }
                  return;
               }
               return;
               break;
            case "hit12":
               if(this.isNotArrow)
               {
                  if(gc.sid == this.sid || gc.isSingleGame())
                  {
                     if(this.bbdc.getCurFrameCount() == 14)
                     {
                        if(param1.x == 2)
                        {
                           if(this.bbdc.getDirect() == 0)
                           {
                              _loc8_.x = this.x - 150;
                           }
                           else
                           {
                              _loc8_.x = this.x + 150;
                           }
                           _loc8_.y = this.y;
                           this.doHit12(this.getBBDC().getDirect(),_loc8_);
                           gc.sendAttack(this.getRoleId(),"hit12",this.getBBDC().getDirect(),_loc8_.x,_loc8_.y,[]);
                           return;
                        }
                        return;
                     }
                     return;
                  }
                  return;
               }
               if(param1.x == 0 || param1.x == 1 && this.bbdc.getCurFrameCount() >= 16)
               {
                  this.setStatic();
                  this.speed.y = -25;
               }
               else if(param1.x >= 2 && param1.x <= 3)
               {
                  if(this.bbdc.getDirect() == 0)
                  {
                     this.speed.x = -25;
                  }
                  else
                  {
                     this.speed.x = 25;
                  }
                  this.speed.y = 0;
               }
               else if(param1.x == 4 && this.bbdc.getCurFrameCount() == 2)
               {
                  if(this.bbdc.getDirect() == 0)
                  {
                     this.isRight = true;
                     this.isLeft = false;
                     this.bbdc.turnRight();
                  }
                  else
                  {
                     this.isRight = false;
                     this.isLeft = true;
                     this.bbdc.turnLeft();
                  }
               }
               else
               {
                  this.setStatic();
                  this.speed.y = 0;
               }
               if(this.bbdc.getCurFrameCount() == 2)
               {
                  if(param1.x == 0 || param1.x == 4)
                  {
                     if(this.bbdc.getDirect() == 0)
                     {
                        _loc8_.x = this.x - 80;
                     }
                     else
                     {
                        _loc8_.x = this.x + 80;
                     }
                     _loc8_.y = this.y - 100;
                     this.doHit12Arrow_1(this.getBBDC().getDirect(),_loc8_);
                  }
               }
               if(gc.sid == this.sid || gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     if(param1.x == 0 || param1.x == 4)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc8_.x = this.x;
                        }
                        else
                        {
                           _loc8_.x = this.x;
                        }
                        _loc8_.y = this.y;
                        this.doHit12Arrow_2(this.getBBDC().getDirect(),_loc8_);
                        gc.sendAttack(this.getRoleId(),"doHit12Arrow_2",this.getBBDC().getDirect(),_loc8_.x,_loc8_.y,[]);
                     }
                  }
                  if(this.bbdc.getCurFrameCount() == 17 || this.bbdc.getCurFrameCount() == 12 || this.bbdc.getCurFrameCount() == 6)
                  {
                     if(param1.x == 1 || param1.x == 5)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc8_.x = this.x;
                        }
                        else
                        {
                           _loc8_.x = this.x;
                        }
                        _loc8_.y = this.y - (-7 + this.bbdc.getCurFrameCount() * 2);
                        this.doHit12Arrow_3(this.getBBDC().getDirect(),_loc8_);
                        gc.sendAttack(this.getRoleId(),"doHit12Arrow_3",this.getBBDC().getDirect(),_loc8_.x,_loc8_.y,[]);
                        return;
                     }
                     return;
                  }
                  return;
               }
               return;
               break;
            default:
               return;
         }
      }
      
      private function doHit1(param1:uint, param2:Point) : void
      {
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role4Bullet1");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit1");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit1Arrow(param1:uint, param2:Point) : void
      {
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("Role4BulletArrow1");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit1Arrow");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit2(param1:uint, param2:Point) : void
      {
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role4Bullet2");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit2");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit2Arrow(param1:uint, param2:Point) : void
      {
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("Role4BulletArrow2");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit2Arrow");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit3(param1:uint, param2:Point) : void
      {
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role4Bullet3");
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
         SoundManager.play("Role4_hit4");
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role4Bullet4");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit4");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit4Arrow(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role4_hit4Arrow");
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("Role4BulletArrow4");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit4Arrow");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit5_1(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role4_hit5");
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role4Bullet5");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDisable();
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit5");
         var _loc4_:int = gc.gameSence.getChildIndex(this);
         gc.gameSence.addChildAt(_loc3_,_loc4_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit5_2(param1:uint, param2:Point, param3:Array) : void
      {
         var _loc4_:* = null;
         var _loc5_:* = null;
         var _loc6_:int = int(gc.pWorld.likeMonsterArray.indexOf(this.role4Hit5));
         if(Boolean(this.role4Hit5) && _loc6_ != -1)
         {
            this.role4Hit5.destroy();
            gc.pWorld.likeMonsterArray.splice(_loc6_,1);
            this.role4Hit5 = null;
         }
         var _loc7_:uint = uint(parseInt(param3[0]));
         var _loc8_:uint = uint(parseInt(param3[1]));
         for each(_loc5_ in gc.obbsiteArray)
         {
            if(_loc5_.sid == _loc7_ && _loc5_.getRoleId() == _loc8_)
            {
               _loc4_ = _loc5_;
            }
         }
         if(gc.sid != this.sid)
         {
            if(!_loc4_)
            {
               _loc4_ = gc.getHeroBySidAndRoleId(_loc7_,_loc8_);
            }
         }
         if(_loc4_)
         {
            if(!_loc4_.isReadyToDestroy)
            {
               this.role4Hit5 = new MonsterRole4Hit5(_loc4_,this);
               this.role4Hit5.x = param2.x;
               this.role4Hit5.y = param2.y;
               gc.gameSence.addChild(this.role4Hit5);
               gc.pWorld.likeMonsterArray.push(this.role4Hit5);
            }
         }
      }
      
      private function doHit6(param1:uint, param2:Point) : void
      {
         var target:BaseObject = null;
         var newObbsiteArray:Array = null;
         var bo:BaseObject = null;
         var dis:Number = Number(NaN);
         var moveTime:Number = Number(NaN);
         var direct:uint = param1;
         var p:Point = param2;
         var b:SpecialEffectBullet = new SpecialEffectBullet("Role4Bullet6");
         b.x = p.x;
         b.y = p.y;
         b.setRole(this);
         b.setDisable();
         b.setDestroyWhenLastFrame(false);
         b.setDirect(direct);
         b.setAction("hit6");
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
         if(gc.sid == this.sid || gc.isSingleGame())
         {
            newObbsiteArray = gc.obbsiteArray.concat(gc.pWorld.likeMonsterArray);
            for each(bo in newObbsiteArray)
            {
               if(this.bbdc.getDirect() == 0)
               {
                  if(bo.x < this.x)
                  {
                     if(AUtils.GetDisBetweenTwoObj(bo,this) <= 500 && !bo.isDead())
                     {
                        target = bo;
                        break;
                     }
                  }
               }
               if(bo.x > this.x)
               {
                  if(AUtils.GetDisBetweenTwoObj(bo,this) <= 500 && !bo.isDead())
                  {
                     target = bo;
                     break;
                  }
               }
            }
            if(target)
            {
               dis = AUtils.GetDisBetweenTwoObj(target,this);
               moveTime = dis / 500 * 0.96;
               this.reHit6(b,target,8,moveTime);
            }
            else
            {
               TweenMax.to(b,1,{
                  "alpha":0,
                  "onComplete":function(param1:SpecialEffectBullet):*
                  {
                     param1.destroy();
                  },
                  "onCompleteParams":[b]
               });
            }
         }
      }
      
      private function reHit6(param1:SpecialEffectBullet, param2:BaseObject, param3:uint, param4:Number) : void
      {
         var role4:* = undefined;
         role4 = undefined;
         role4 = undefined;
         var _b:SpecialEffectBullet = param1;
         var _target:BaseObject = param2;
         var _times:uint = param3;
         var _moveTime:Number = param4;
         role4 = this;
         if(_times > 0)
         {
            SoundManager.play("Role4_hit6");
            _times--;
            TweenMax.to(_b,_moveTime,{
               "x":_target.x,
               "y":_target.y,
               "onComplete":function(param1:Role4, param2:SpecialEffectBullet, param3:BaseObject, param4:uint):*
               {
                  var _loc5_:* = undefined;
                  var _loc6_:* = undefined;
                  var _loc7_:* = undefined;
                  var _loc8_:* = undefined;
                  var _loc9_:* = undefined;
                  if(!param3.isYourFather() && AUtils.GetDisBetweenTwoObj(param2,param3) <= 66)
                  {
                     if(param3.curAddEffect)
                     {
                        param3.curAddEffect.add([{
                           "name":BaseAddEffect.POISON_TIMES,
                           "time":gc.frameClips * 7,
                           "who":role4
                        }]);
                        if(Math.random() <= 0.78)
                        {
                           param3.curAddEffect.add([{
                              "name":BaseAddEffect.STUN,
                              "time":gc.frameClips * 0.42
                           }]);
                        }
                     }
                     _loc5_ = AUtils.getNewObj("HeroBeHurt");
                     _loc5_.x = colipse.x;
                     _loc5_.y = colipse.y;
                     param3.addChild(_loc5_);
                     if(gc.isInRoom())
                     {
                        if(param3 is BaseHero)
                        {
                           BaseHero(param3).beAttackDoing();
                        }
                        gc.sendOtherBuff(param3.sid,param3.getRoleId(),"Role4_hit6",[]);
                     }
                     _loc6_ = false;
                     _loc7_ = gc.obbsiteArray.concat(gc.pWorld.likeMonsterArray);
                     for each(_loc8_ in _loc7_)
                     {
                        if(_loc8_ != param3)
                        {
                           _loc9_ = AUtils.GetDisBetweenTwoObj(_loc8_,param2);
                           if(_loc9_ <= 500 && !_loc8_.isDead())
                           {
                              _loc6_ = true;
                              param1.reHit6(param2,_loc8_,param4,_loc9_ / 500 * 0.96);
                              break;
                           }
                        }
                     }
                     if(!_loc6_)
                     {
                        param2.destroy();
                     }
                  }
                  else
                  {
                     param2.destroy();
                  }
               },
               "onCompleteParams":[this,_b,_target,_times]
            });
            gc.sendAttack(this.getRoleId(),"hit6_2",this.getBBDC().getDirect(),_b.x,_b.y,[_target.x,_target.y,_moveTime]);
         }
         else
         {
            _b.destroy();
         }
      }
      
      private function otherAttackHit6_2(param1:uint, param2:Point, param3:Array) : void
      {
         var targetX:int = 0;
         var targetY:int = 0;
         var moveTime:Number = NaN;
         var b:SpecialEffectBullet = null;
         b = null;
         b = null;
         var direct:uint = param1;
         var p:Point = param2;
         var targetPointArray:Array = param3;
         b = new SpecialEffectBullet("Role4Bullet6");
         b.x = p.x;
         b.y = p.y;
         b.setRole(this);
         b.setDisable();
         b.setDestroyWhenLastFrame(false);
         b.setDirect(direct);
         b.setAction("hit6");
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
         targetX = int(parseInt(targetPointArray[0]));
         targetY = int(parseInt(targetPointArray[1]));
         moveTime = Number(targetPointArray[2]);
         TweenMax.to(b,moveTime,{
            "x":targetX,
            "y":targetY,
            "onComplete":function():*
            {
               b.destroy();
            },
            "onCompleteParams":[b]
         });
      }
      
      private function doHit7_1(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role4_hit7");
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("Role4Bullet7_1");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDisable();
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit7_1");
         var _loc4_:int = gc.gameSence.getChildIndex(this);
         gc.gameSence.addChildAt(_loc3_,_loc4_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit7_2(param1:uint, param2:Point) : void
      {
         var _loc3_:* = null;
         var _loc4_:* = null;
         for each(_loc3_ in this.magicBulletArray)
         {
            if(_loc3_.getImcName() == "Role4Bullet7_2")
            {
               _loc3_.destroy();
            }
         }
         _loc4_ = new SpecialEffectBullet("Role4Bullet7_2");
         _loc4_.x = param2.x;
         _loc4_.y = param2.y;
         _loc4_.setRole(this);
         _loc4_.setDirect(param1);
         _loc4_.setAction("hit7");
         gc.gameSence.addChild(_loc4_);
         this.magicBulletArray.push(_loc4_);
         _loc4_ = new SpecialEffectBullet("Role4Bullet7_2");
         if(param1 == 0)
         {
            _loc4_.x = param2.x - 40;
         }
         else
         {
            _loc4_.x = param2.x + 40;
         }
         _loc4_.y = param2.y - 20;
         _loc4_.setRole(this);
         _loc4_.setDirect(param1);
         _loc4_.setAction("hit7");
         gc.gameSence.addChild(_loc4_);
         this.magicBulletArray.push(_loc4_);
         _loc4_ = new SpecialEffectBullet("Role4Bullet7_2");
         if(param1 == 0)
         {
            _loc4_.x = param2.x + 40;
         }
         else
         {
            _loc4_.x = param2.x - 40;
         }
         _loc4_.y = param2.y - 10;
         _loc4_.setRole(this);
         _loc4_.setDirect(param1);
         _loc4_.setAction("hit7");
         gc.gameSence.addChild(_loc4_);
         this.magicBulletArray.push(_loc4_);
      }
      
      private function doHit8(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role4_hit8");
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role4Bullet8");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit8");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit8Arrow_1(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role4_hit8Arrow");
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role4BulletArrow8_1");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDisable();
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit8");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit8Arrow_2(param1:uint, param2:Point) : void
      {
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("Role4BulletArrow8_2");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit8Arrow");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit9_1(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role4_hit9");
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role4Bullet9_1");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDisable();
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit9");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit9_2(param1:uint, param2:Point) : void
      {
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role4Bullet9_2");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit9");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit9Arrow_1(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role4_hit9Arrow");
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role4BulletArrow9_1");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDisable();
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit9");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit9Arrow_2(param1:uint, param2:Point) : void
      {
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role4BulletArrow9_2");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit9Arrow");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit10(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role4_hit10");
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("Role4Bullet10");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit10");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit10Arrow_1(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role4_hit10Arrow");
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role4BulletArrow10_1");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDisable();
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit10");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit10Arrow_2(param1:uint, param2:Point) : void
      {
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("Role4BulletArrow10_2");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit10Arrow");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit11(param1:uint, param2:Point) : void
      {
         var _loc3_:int = 0;
         if(!this.hit11Biaoji)
         {
            SoundManager.play("Role4_hit11");
            this.hit11Biaoji = new SpecialEffectBullet("Role4Bullet11");
            this.curHit11BiaojiCount = 0;
            this.hit11Biaoji.x = param2.x;
            this.hit11Biaoji.y = param2.y;
            this.hit11Biaoji.setDestroyWhenLastFrame(false);
            this.hit11Biaoji.setDirect(param1);
            this.hit11Biaoji.setDisable();
            _loc3_ = gc.gameSence.getChildIndex(this);
            gc.gameSence.addChildAt(this.hit11Biaoji,_loc3_);
            this.magicBulletArray.push(this.hit11Biaoji);
         }
      }
      
      private function doHit11_2(param1:uint, param2:Point) : void
      {
         this.x = this.hit11Biaoji.x;
         this.y = this.hit11Biaoji.y;
         this.speed.y = 0;
      }
      
      public function clearBiaoJi() : void
      {
         if(this.hit11Biaoji)
         {
            this.hit11Biaoji.destroy();
            this.hit11Biaoji = null;
         }
      }
      
      private function doHit12(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role4_hit12");
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("Role4Bullet12");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDestroyWhenLastFrame(false);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit12");
         var _loc4_:int = gc.frameClips * 3.4;
         var _loc5_:int = this.getPlayer().returnSkillLevelBySkillName("mmw");
         _loc3_.setDestroyInCount(_loc4_);
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit12Arrow_1(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role4_hit12Arrow");
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role4BulletArrow12_1");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setDisable();
         _loc3_.setAction("hit12");
         var _loc4_:int = gc.gameSence.getChildIndex(this);
         gc.gameSence.addChildAt(_loc3_,_loc4_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit12Arrow_2(param1:uint, param2:Point) : void
      {
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role4BulletArrow12_2");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit12Arrow");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit12Arrow_3(param1:uint, param2:Point) : void
      {
         var _loc3_:int = 0;
         var _loc4_:SpecialEffectBullet = null;
         var _loc5_:* = null;
         var _loc6_:* = null;
         var _loc7_:Number = Number(NaN);
         var _loc8_:int = 10;
         if(this.isGXP)
         {
            _loc8_ = 10;
         }
         while(_loc3_ < _loc8_)
         {
            _loc7_ = 360 / _loc8_ * _loc3_;
            _loc5_ = new Point(param2.x + Math.sin(_loc7_ * Math.PI / 180) * 100,param2.y - Math.cos(_loc7_ * Math.PI / 180) * 100);
            _loc4_ = new SpecialEffectBullet("Role4BulletArrow12_3");
            _loc4_.setRole(this);
            _loc4_.setAction("hit12Arrow");
            if(this.isGXP)
            {
               _loc4_.setScale(1.75,1.75);
            }
            _loc4_.rotation = _loc7_;
            _loc4_.x = _loc5_.x;
            _loc4_.y = _loc5_.y;
            gc.gameSence.addChild(_loc4_);
            this.magicBulletArray.push(_loc4_);
            _loc3_++;
         }
      }
      
      override public function setOtherAttack(param1:String, param2:uint, param3:Point, param4:Array = null, param5:uint = 0) : void
      {
         switch(param1)
         {
            case "hit1":
               this.doHit1(param2,param3);
               return;
            case "doHit1Arrow":
               this.doHit1Arrow(param2,param3);
               return;
            case "hit2":
               this.doHit2(param2,param3);
               return;
            case "doHit2Arrow":
               this.doHit2Arrow(param2,param3);
               return;
            case "hit3":
               this.doHit3(param2,param3);
               return;
            case "hit4":
               this.doHit4(param2,param3);
               return;
            case "doHit4Arrow":
               this.doHit4Arrow(param2,param3);
               return;
            case "hit5_2":
               this.doHit5_2(param2,param3,param4);
               return;
            case "hit6_2":
               this.otherAttackHit6_2(param2,param3,param4);
               return;
            case "hit7_2":
               this.doHit7_2(param2,param3);
               return;
            case "hit8":
               this.doHit8(param2,param3);
               return;
            case "doHit8Arrow_2":
               this.doHit8Arrow_2(param2,param3);
               return;
            case "hit9_2":
               this.doHit9_2(param2,param3);
               return;
            case "doHit9Arrow_2":
               this.doHit9Arrow_2(param2,param3);
               return;
            case "hit10":
               this.doHit10(param2,param3);
               return;
            case "doHit10Arrow_2":
               this.doHit10Arrow_2(param2,param3);
               return;
            case "hit11":
               this.doHit11(param2,param3);
               return;
            case "hit11_2":
               this.doHit11_2(param2,param3);
               return;
            case "hit12":
               this.doHit12(param2,param3);
               return;
            case "doHit12Arrow_2":
               this.doHit12Arrow_2(param2,param3);
               return;
            case "doHit12Arrow_3":
               this.doHit12Arrow_3(param2,param3);
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
         super.step();
         if(this.hit11Biaoji)
         {
            if(this.curHit11BiaojiCount < this.hit11BiaojiCount)
            {
               ++this.curHit11BiaojiCount;
            }
            if(this.curHit11BiaojiCount == this.hit11BiaojiCount)
            {
               this.hit11Biaoji.destroy();
               this.hit11Biaoji = null;
            }
         }
      }
      
      override public function reduceHp(param1:int, param2:Boolean = false) : void
      {
         var reduceHurt:Number = 1;
         if(this.isGXP || this.curAction == "hit12" || this.getCurAddEffect(BaseAddEffect.tjgl_Shield))
         {
            param2 = false;
         }
         if(this.getPlayer().getCurEquipByType("zbfj"))
         {
            if(this.getPlayer().getCurEquipByType("zbfj").getFillName().indexOf("zxqts") != -1)
            {
               reduceHurt += -0.1;
            }
         }
         param1 *= reduceHurt;
         super.reduceHp(param1,param2);
      }
      
      override public function setAttackBack(param1:Point) : void
      {
         if(!(this.isGXP || this.curAction == "hit12" || this.getCurAddEffect(BaseAddEffect.tjgl_Shield)))
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
         if(this.getPlayer())
         {
            _loc2_ = this.getPlayer().returnSkillNameBySkillKey(param1);
            if(_loc2_)
            {
               param1 = _loc2_[0];
               _loc3_ = uint(parseInt(_loc2_[1]));
               if(param1 == "zq")
               {
                  _loc7_ = this.player.returnSkillLevelBySkillName("zq") - 1;
                  _loc3_ = this.consumeMP[_loc7_] * 0.5 * 26483 / 25958;
                  this.skill_zq(_loc3_);
               }
               else if(param1 == "mbyj")
               {
                  _loc7_ = this.player.returnSkillLevelBySkillName("mbyj") - 1;
                  _loc3_ = this.consumeMP[_loc7_] * 0.286 * 26483 / 25958;
                  this.skill_mbyj(_loc3_);
               }
               else if(param1 == "wdww")
               {
                  _loc7_ = this.player.returnSkillLevelBySkillName("wdww") - 1;
                  _loc3_ = this.consumeMP[_loc7_] * 0.55 * 26483 / 25958;
                  this.skill_wdww(_loc3_);
               }
               else if(param1 == "jdz")
               {
                  _loc7_ = this.player.returnSkillLevelBySkillName("jdz") - 1;
                  _loc3_ = this.consumeMP[_loc7_] * 0.82 * 26483 / 25958;
                  this.skill_jdz(_loc3_);
               }
               else if(param1 == "mds")
               {
                  _loc3_ = 0;
                  this.skill_mds(_loc3_);
               }
               else if(param1 == "qlj")
               {
                  _loc7_ = this.player.returnSkillLevelBySkillName("qlj") - 1;
                  _loc3_ = this.consumeMP[_loc7_] * 0.55 * 26483 / 25958;
                  this.skill_qlj(_loc3_);
               }
               else if(param1 == "tkj")
               {
                  _loc7_ = this.player.returnSkillLevelBySkillName("tkj") - 1;
                  _loc3_ = this.consumeMP[_loc7_] * 0.55 * 26483 / 25958;
                  this.skill_tkj(_loc3_);
               }
               else if(param1 == "dzj")
               {
                  _loc7_ = this.player.returnSkillLevelBySkillName("dzj") - 1;
                  _loc3_ = this.consumeMP[_loc7_] * 0.82 * 26483 / 25958;
                  this.skill_dcj(_loc3_);
               }
               else if(param1 == "lybj")
               {
                  _loc3_ = this.roleProperies.getSMMP() * 0.015;
                  this.skill_lvbj(_loc3_);
               }
               else if(param1 == "mmw")
               {
                  if(this.isNotArrow)
                  {
                     _loc7_ = this.player.returnSkillLevelBySkillName("mmw") - 1;
                     _loc3_ = this.consumeMP[_loc7_] * 0.64 * 26483 / 25958;
                  }
                  else
                  {
                     _loc7_ = this.player.returnSkillLevelBySkillName("mmw") - 1;
                     _loc3_ = this.consumeMP[_loc7_] * 1.1 * 26483 / 25958;
                  }
                  this.skill_mmw(_loc3_);
               }
               if(this.curAddEffect.curDebuff(BaseAddEffect.MONSTER65_AOE) || this.curAddEffect.curDebuff(BaseAddEffect.MONSTER129Buff))
               {
                  this.reduceHp(_loc3_);
               }
            }
         }
      }
      
      private function skill_zq(param1:uint) : void
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
      
      private function skill_mbyj(param1:uint) : void
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
         this.newAttackId();
         this.hitNum = 0;
         if(gc.sid == this.sid)
         {
            gc.sendPosition(this);
         }
         this.roleProperies.setMMP(this.roleProperies.getMMP() - param1);
      }
      
      private function skill_wdww(param1:uint) : void
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
         this.hitNum = 0;
         if(gc.sid == this.sid)
         {
            gc.sendPosition(this);
         }
         this.roleProperies.setMMP(this.roleProperies.getMMP() - param1);
      }
      
      private function skill_jdz(param1:uint) : void
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
      
      private function skill_mmw(param1:uint) : void
      {
         if(this.roleProperies.getMMP() < param1)
         {
            return;
         }
         if(this.isAttacking() || this.isBeAttacking())
         {
            return;
         }
         this.lastHit = "hit12";
         this.setAction("hit12");
         this.hitNum = 0;
         this.newAttackId();
         if(gc.sid == this.sid)
         {
            gc.sendPosition(this);
         }
         this.roleProperies.setMMP(this.roleProperies.getMMP() - param1);
      }
      
      private function skill_mds(param1:uint) : void
      {
      }
      
      private function skill_qlj(param1:uint) : void
      {
         if(this.roleProperies.getMMP() < param1)
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
         this.roleProperies.setMMP(this.roleProperies.getMMP() - 15);
         if(gc.sid == this.sid)
         {
            gc.sendPosition(this);
         }
         this.roleProperies.setMMP(this.roleProperies.getMMP() - param1);
      }
      
      private function skill_tkj(param1:uint) : void
      {
         if(this.roleProperies.getMMP() < param1)
         {
            return;
         }
         if(this.isAttacking() || this.isBeAttacking())
         {
            return;
         }
         this.lastHit = "hit9";
         this.setAction("hit9");
         this.newAttackId();
         this.hitNum = 0;
         if(gc.sid == this.sid)
         {
            gc.sendPosition(this);
         }
         this.roleProperies.setMMP(this.roleProperies.getMMP() - param1);
      }
      
      private function skill_dcj(param1:uint) : void
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
      
      private function skill_lvbj(param1:uint) : void
      {
         var _loc2_:* = null;
         if(this.isAttacking() || this.isBeAttacking())
         {
            return;
         }
         if(this.roleProperies.getMMP() < param1)
         {
            return;
         }
         if(!this.hit11Biaoji)
         {
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
         else
         {
            _loc2_ = this.hit11Biaoji.getBounds(gc.gameSence.parent);
            if(_loc2_.x < 30 || _loc2_.x > 930)
            {
               this.hit11Biaoji.destroy();
               this.hit11Biaoji = null;
            }
            else
            {
               this.doHit11_2(this.getBBDC().getDirect(),new Point());
               if(gc.sid == this.sid)
               {
                  gc.sendPosition(this);
                  gc.sendAttack(this.getRoleId(),"hit11_2",this.getBBDC().getDirect(),0,0,[]);
               }
            }
            this.roleProperies.setMMP(this.roleProperies.getMMP() - param1 * 0.1);
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
      
      private function refreshByWeapon() : void
      {
         this.initBBDC();
      }
      
      override public function refreshEquip() : void
      {
         this.refreshByWeapon();
         super.refreshEquip();
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
                  this.timers = 10;
                  if(this.curtime - this.lasttime > 25 * 60)
                  {
                     this.hitNum = 1;
                  }
                  else if(++this.hitNum > 3)
                  {
                     this.hitNum = 1;
                  }
                  this.setAction("hit" + this.hitNum);
                  this.lastHit = "hit" + this.hitNum;
                  if(this.isNotArrow)
                  {
                     SoundManager.play("Role4_hit" + this.hitNum);
                  }
                  else if(this.hitNum == 1 || this.hitNum == 2)
                  {
                     SoundManager.play("Role4_hit1Arrow");
                  }
                  else
                  {
                     SoundManager.play("Role4_hit2Arrow");
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
               if(this.isNotArrow)
               {
                  this.setAction("hit2");
                  this.lastHit = "hit2";
                  SoundManager.play("Role4_hit2");
               }
               else
               {
                  this.setAction("hit3");
                  this.lastHit = "hit3";
                  SoundManager.play("Role4_hit2Arrow");
               }
               if(this.getPlayer())
               {
                  gc.sendPosition(this);
               }
               this.hitNum = 0;
               this.newAttackId();
            }
         }
         this.lasttime = this.curtime;
      }
      
      private function isDefending() : Boolean
      {
         return this.curAction == "hit6";
      }
      
      override public function isNormalHit() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3" || this.curAction == "hit4" || this.curAction == "hit5";
      }
      
      private function runAttack() : void
      {
         if(!this.isInSky())
         {
            if(this.roleProperies.getMMP() >= 20)
            {
               this.hitNum = 1;
               this.doubleCount = 0;
               this.lastHit = "hit6";
               this.curAction = "hit6";
               this.newAttackId();
               this.roleProperies.setMMP(this.roleProperies.getMMP() - 20);
            }
            else
            {
               this.doubleCount = 0;
               this.normalHit();
            }
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
         this.roleProperies.setSHHP(70 + 30 * (this.roleProperies.getLevel() - 1));
         this.roleProperies.setHHP(this.roleProperies.getSHHP());
         this.roleProperies.setSMMP(70 + 30 * (this.roleProperies.getLevel() - 1));
         this.roleProperies.setMMP(this.roleProperies.getSMMP());
         this.roleProperies.setBasePower(9 + 4 * (this.roleProperies.getLevel() - 1));
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
         var _loc7_:int = 1;
         var sl:int = 1;
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
         switch(param1)
         {
            case "hit1":
               _loc7_ = 2.911 * 6201 / 5658 * this.roleProperies.getHurt() * _loc12_ * _loc5_;
               qixue = 2.911 * 6201 / 5658 * this.roleProperies.getHaveblood() * _loc5_;
               break;
            case "hit1Arrow":
               _loc7_ = 2.729 * 6201 / 5658 * this.roleProperies.getHurt() * _loc12_ * _loc5_;
               qixue = 2.729 * 6201 / 5658 * this.roleProperies.getHaveblood() * _loc5_;
               break;
            case "hit2":
               _loc7_ = 2.911 * 6201 / 5658 * this.roleProperies.getHurt() * _loc12_ * _loc5_;
               qixue = 2.911 * 6201 / 5658 * this.roleProperies.getHaveblood() * _loc5_;
               break;
            case "hit2Arrow":
               _loc7_ = 2.729 / 3 * 6201 / 5658 * this.roleProperies.getHurt() * _loc12_ * _loc5_;
               qixue = 2.729 / 3 * 6201 / 5658 * this.roleProperies.getHaveblood() * _loc5_;
               break;
            case "hit3":
               _loc7_ = 2.911 / 3 * 6201 / 5658 * this.roleProperies.getHurt() * _loc12_ * _loc5_;
               qixue = 2.911 / 3 * 6201 / 5658 * this.roleProperies.getHaveblood() * _loc5_;
               break;
            case "hit4":
               sl = this.player.returnSkillLevelBySkillName("zq") - 1;
               mp_percent = 13 * Math.pow(26483 * 0.06 / 13,Math.pow(sl / 17,0.55)) / this.roleProperies.getSMMP() / 0.06 * 3 * Math.pow(1 / 3,Math.pow(sl / 17,0.75));
               this.attackBackInfoDict["hit4"]["addEffect"] = [{
                  "name":BaseAddEffect.POISON,
                  "time":gc.frameClips * 5,
                  "power":0.2 * (this.SkillFixedDamage[sl] * this.FixedDamageCount[sl] + (this.SkillFactor[0] + this.SkillFactor[1] * sl) * 6201 / 5658 * this.roleProperies.getHurt()) / 5 * 1.8
               },{
                  "name":BaseAddEffect.POISON_TIMES,
                  "time":gc.frameClips * 5,
                  "who":this
               }];
               _loc7_ = 0.4 * (this.SkillFixedDamage[sl] * this.FixedDamageCount[sl] + (this.SkillFactor[0] + this.SkillFactor[1] * sl) * 6201 / 5658 * this.roleProperies.getHurt()) / 2 * _loc12_ * _loc5_;
               qixue = 0.6 * (this.SkillFactor[0] + this.SkillFactor[1] * sl) * 6201 / 6782 / 2 * this.roleProperies.getHaveblood() * _loc5_;
               break;
            case "hit4Arrow":
               sl = this.player.returnSkillLevelBySkillName("zq") - 1;
               mp_percent = 13 * Math.pow(26483 * 0.06 / 13,Math.pow(sl / 17,0.55)) / this.roleProperies.getSMMP() / 0.06 * 3 * Math.pow(1 / 3,Math.pow(sl / 17,0.75));
               this.attackBackInfoDict["hit4Arrow"]["addEffect"] = [{
                  "name":BaseAddEffect.POISON,
                  "time":gc.frameClips * 5,
                  "power":0.2 * (this.SkillFixedDamage[sl] * this.FixedDamageCount[sl] + (this.SkillFactor[0] + this.SkillFactor[1] * sl) * 6201 / 5658 * this.roleProperies.getHurt()) / 5 * 1.8
               },{
                  "name":BaseAddEffect.POISON_TIMES,
                  "time":gc.frameClips * 5,
                  "who":this
               }];
               _loc7_ = 0.4 * (this.SkillFixedDamage[sl] * this.FixedDamageCount[sl] + (this.SkillFactor[0] + this.SkillFactor[1] * sl) * 6201 / 5658 * this.roleProperies.getHurt()) * _loc12_ * _loc5_;
               qixue = 0.6 * (this.SkillFactor[0] + this.SkillFactor[1] * sl) * 6201 / 5658 * this.roleProperies.getHaveblood() * _loc5_;
               break;
            case "hit5":
               _loc7_ = 0;
               break;
            case "hit6":
               _loc7_ = 0;
               break;
            case "hit7":
               sl = this.player.returnSkillLevelBySkillName("jdz") - 1;
               mp_percent = 19 * Math.pow(26483 * 0.092 / 19,Math.pow(sl / 17,0.55)) / this.roleProperies.getSMMP() / 0.092 * 3 * Math.pow(1 / 3,Math.pow(sl / 17,0.75));
               this.attackBackInfoDict["hit7"]["addEffect"] = [{
                  "name":BaseAddEffect.POISON,
                  "time":gc.frameClips * 5,
                  "power":0.2 * (this.SkillFixedDamage[sl] * this.FixedDamageCount[sl] + (this.SkillFactor[0] + this.SkillFactor[1] * sl) * 6201 / 5658 * this.roleProperies.getHurt()) / 5 * 1.8
               },{
                  "name":BaseAddEffect.POISON_TIMES,
                  "time":gc.frameClips * 5,
                  "who":this
               }];
               _loc7_ = 0.7 * (this.SkillFixedDamage[sl] * this.FixedDamageCount[sl] + (this.SkillFactor[0] + this.SkillFactor[1] * sl) * 6201 / 5658 * this.roleProperies.getHurt()) / 60 * _loc12_ * _loc5_;
               qixue = 0.7 * (this.SkillFactor[0] + this.SkillFactor[1] * sl) * 6201 / 5658 / 60 * this.roleProperies.getHaveblood() * _loc5_;
               break;
            case "hit8":
               sl = this.player.returnSkillLevelBySkillName("qlj") - 1;
               mp_percent = 15 * Math.pow(26483 * 0.065 / 15,Math.pow(sl / 17,0.55)) / this.roleProperies.getSMMP() / 0.065 * 3 * Math.pow(1 / 3,Math.pow(sl / 17,0.75));
               _loc7_ = 0.6 * (this.SkillFixedDamage[sl] * this.FixedDamageCount[sl] + (this.SkillFactor[0] + this.SkillFactor[1] * sl) * 6201 / 5658 * this.roleProperies.getHurt()) * _loc12_ * _loc5_;
               qixue = 0.6 * (this.SkillFactor[0] + this.SkillFactor[1] * sl) * 6201 / 5658 / 1 * this.roleProperies.getHaveblood() * _loc5_;
               break;
            case "hit8Arrow":
               sl = this.player.returnSkillLevelBySkillName("qlj") - 1;
               mp_percent = 15 * Math.pow(26483 * 0.065 / 15,Math.pow(sl / 17,0.55)) / this.roleProperies.getSMMP() / 0.065 * 3 * Math.pow(1 / 3,Math.pow(sl / 17,0.75));
               _loc7_ = 0.6 * (this.SkillFixedDamage[sl] * this.FixedDamageCount[sl] + (this.SkillFactor[0] + this.SkillFactor[1] * sl) * 6201 / 5658 * this.roleProperies.getHurt()) * _loc12_ * _loc5_;
               qixue = 0.6 * (this.SkillFactor[0] + this.SkillFactor[1] * sl) * 6201 / 5658 / 1 * this.roleProperies.getHaveblood() * _loc5_;
               break;
            case "hit9":
               sl = this.player.returnSkillLevelBySkillName("tkj") - 1;
               mp_percent = 17 * Math.pow(26483 * 0.075 / 17,Math.pow(sl / 17,0.55)) / this.roleProperies.getSMMP() / 0.075 * 3 * Math.pow(1 / 3,Math.pow(sl / 17,0.75));
               _loc7_ = 0.7 * (this.SkillFixedDamage[sl] * this.FixedDamageCount[sl] + (this.SkillFactor[0] + this.SkillFactor[1] * sl) * 6201 / 5658 * this.roleProperies.getHurt()) * _loc12_ * _loc5_;
               qixue = 0.7 * (this.SkillFactor[0] + this.SkillFactor[1] * sl) * 6201 / 5658 / 1 * this.roleProperies.getHaveblood() * _loc5_;
               break;
            case "hit9Arrow":
               sl = this.player.returnSkillLevelBySkillName("tkj") - 1;
               mp_percent = 17 * Math.pow(26483 * 0.075 / 17,Math.pow(sl / 17,0.55)) / this.roleProperies.getSMMP() / 0.075 * 3 * Math.pow(1 / 3,Math.pow(sl / 17,0.75));
               _loc7_ = 0.7 * (this.SkillFixedDamage[sl] * this.FixedDamageCount[sl] + (this.SkillFactor[0] + this.SkillFactor[1] * sl) * 6201 / 5658 * this.roleProperies.getHurt()) / 5 * _loc12_ * _loc5_;
               qixue = 0.7 * (this.SkillFactor[0] + this.SkillFactor[1] * sl) * 6201 / 5658 / 5 * this.roleProperies.getHaveblood() * _loc5_;
               break;
            case "hit10":
               sl = this.player.returnSkillLevelBySkillName("dzj") - 1;
               mp_percent = 18 * Math.pow(26483 * 0.084 / 18,Math.pow(sl / 17,0.55)) / this.roleProperies.getSMMP() / 0.084 * 3 * Math.pow(1 / 3,Math.pow(sl / 17,0.75));
               _loc7_ = 0.79 * (this.SkillFixedDamage[sl] * this.FixedDamageCount[sl] + (this.SkillFactor[0] + this.SkillFactor[1] * sl) * 6201 / 5658 * this.roleProperies.getHurt()) / 5 * _loc12_ * _loc5_;
               qixue = 0.79 * (this.SkillFactor[0] + this.SkillFactor[1] * sl) * 6201 / 5658 / 5 * this.roleProperies.getHaveblood() * _loc5_;
               break;
            case "hit10Arrow":
               sl = this.player.returnSkillLevelBySkillName("dzj") - 1;
               mp_percent = 18 * Math.pow(26483 * 0.084 / 18,Math.pow(sl / 17,0.55)) / this.roleProperies.getSMMP() / 0.084 * 3 * Math.pow(1 / 3,Math.pow(sl / 17,0.75));
               _loc7_ = 0.79 * (this.SkillFixedDamage[sl] * this.FixedDamageCount[sl] + (this.SkillFactor[0] + this.SkillFactor[1] * sl) * 6201 / 5658 * this.roleProperies.getHurt()) / 1 * _loc12_ * _loc5_;
               qixue = 0.79 * (this.SkillFactor[0] + this.SkillFactor[1] * sl) * 6201 / 5658 / 1 * this.roleProperies.getHaveblood() * _loc5_;
               break;
            case "hit11":
               _loc7_ = 0;
               break;
            case "hit12":
               sl = this.player.returnSkillLevelBySkillName("mmw") - 1;
               mp_percent = 17 * Math.pow(26483 * 0.074 / 17,Math.pow(sl / 17,0.55)) / this.roleProperies.getSMMP() / 0.074 * 3 * Math.pow(1 / 3,Math.pow(sl / 17,0.75));
               _loc7_ = 0.68 * (this.SkillFixedDamage[sl] * this.FixedDamageCount[sl] + (this.SkillFactor[0] + this.SkillFactor[1] * sl) * 6201 / 5658 * this.roleProperies.getHurt()) / 4.6 * _loc12_ * _loc5_;
               qixue = 0.68 * (this.SkillFactor[0] + this.SkillFactor[1] * sl) * 6201 / 5658 / 4.6 * this.roleProperies.getHaveblood() * _loc5_;
               break;
            case "hit12Arrow":
               sl = this.player.returnSkillLevelBySkillName("mmw") - 1;
               mp_percent = 42 * Math.pow(26483 * 0.125 / 42,Math.pow(sl / 17,0.55)) / this.roleProperies.getSMMP() / 0.125 * 3 * Math.pow(1 / 3,Math.pow(sl / 17,0.75));
               _loc7_ = 1.1 * (this.SkillFixedDamage[sl] * this.FixedDamageCount[sl] + (this.SkillFactor[0] + this.SkillFactor[1] * sl) * 6201 / 5658 * this.roleProperies.getHurt()) / 34 * _loc12_ * _loc5_;
               qixue = 1.1 * (this.SkillFactor[0] + this.SkillFactor[1] * sl) * 6201 / 5658 * this.roleProperies.getHaveblood() / 34 * _loc5_;
               break;
            case "fabao-zltc":
               _loc6_ = this.getPlayer().getCurEquipByType("zbfb");
               _loc12_ = 1;
               _loc7_ = this.roleProperies.getHurt() * (18 + (_loc6_.getELevel() - 1) * 3) / 4 * 6201 / 5658 * 1.8;
               qixue = this.roleProperies.getHaveblood() * (18 + (_loc6_.getELevel() - 1) * 3) / 4 * _loc5_ * 6201 / 5658 * 1.8;
               break;
            case "fabao-qpj":
               _loc7_ = this.roleProperies.getHurt() * 1.945 * _loc12_ * _loc5_ * 6201 / 5658 * 1.08325 * 1.5;
               qixue = this.roleProperies.getHaveblood() * 1.945 * _loc5_ * 6201 / 5658 * 1.08325 * 1.5;
               break;
            case "fabao-qpj1":
               _loc7_ = this.roleProperies.getHurt() * 1.945 * _loc12_ * _loc5_ * 6201 / 5658 * 1.08325 * 1.5;
               qixue = this.roleProperies.getHaveblood() * 1.945 * _loc5_ * 6201 / 5658 * 1.08325 * 1.5;
               break;
            case "qpjThunder":
               _loc7_ = this.roleProperies.getHurt() * 2.52 * _loc12_ * _loc5_ * 6201 / 5658 * 1.08325 * 1.5;
               qixue = this.roleProperies.getHaveblood() * 2.52 * _loc5_ * 6201 / 5658 * 1.08325 * 1.5;
               break;
            case "fabao-sword":
               _loc6_ = this.getPlayer().getCurEquipByType("zbfb");
               _loc12_ = 1;
               _loc7_ = this.roleProperies.getHurt() * _loc6_.getELevel() * 0.05 * 6201 / 5658;
               qixue = this.roleProperies.getHaveblood() * _loc6_.getELevel() * 0.05 * _loc5_ * 6201 / 5658;
               break;
            case "magicsword2":
               _loc6_ = this.getPlayer().getCurEquipByType("zbfb");
               if(Boolean(_loc6_) && _loc6_.getWX().indexOf("木") != -1)
               {
                  _loc7_ = 0.0875 * this.roleProperies.getHurt() * _loc6_.getELevel() * 6201 / 5658;
                  qixue = 0.0875 * this.roleProperies.getHaveblood() * _loc5_ * _loc6_.getELevel() * 6201 / 5658;
               }
               _loc7_ = this.roleProperies.getHurt() * _loc6_.getELevel() * 0.0488 * 6201 / 5658;
               qixue = 0.0488 * this.roleProperies.getHaveblood() * _loc5_ * _loc6_.getELevel() * 6201 / 5658;
               _loc12_ = 1;
               break;
            case "fabao-snow":
               _loc6_ = this.getPlayer().getCurEquipByType("zbfb");
               _loc7_ = this.roleProperies.getHurt() * _loc6_.getELevel() * 0.09 * 6201 / 6550;
               qixue = 0.09 * this.roleProperies.getHaveblood() * _loc5_ * _loc6_.getELevel() * 6201 / 5658;
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
               _loc7_ = this.roleProperies.getHurt() * _loc12_ * _loc5_ * _loc3_ * 6201 / 5658;
               qixue = _loc3_ * this.roleProperies.getHaveblood() * _loc5_ * 6201 / 5658;
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
               _loc7_ = this.roleProperies.getHurt() * _loc12_ * _loc5_ * _loc3_ * 6201 / 5658;
               qixue = _loc3_ * this.roleProperies.getHaveblood() * _loc5_ * 6201 / 5658;
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
               _loc7_ = this.roleProperies.getHurt() * _loc12_ * _loc5_ * _loc3_ * 6201 / 5658;
               qixue = _loc3_ * this.roleProperies.getHaveblood() * _loc5_ * 6201 / 5658;
               break;
            case "Pearl":
               _loc6_ = this.getPlayer().getCurEquipByType("zbfb");
               if(Boolean(_loc6_) && _loc6_.getWX().indexOf("木") != -1)
               {
                  _loc7_ = 1.2 * this.roleProperies.getHurt() * 6201 / 5658;
                  qixue = 1.2 * this.roleProperies.getHaveblood() * _loc5_ * 6201 / 5658;
               }
               _loc7_ = this.roleProperies.getHurt() * 0.6 * 6201 / 5658;
               qixue = 0.6 * this.roleProperies.getHaveblood() * _loc5_ * 6201 / 5658;
               _loc12_ = 1;
               break;
            case "fabao-pearl":
               _loc6_ = this.getPlayer().getCurEquipByType("zbfb");
               if(Boolean(_loc6_) && _loc6_.getWX().indexOf("木") != -1)
               {
                  _loc7_ = _loc6_.getELevel() * 0.0473 * this.roleProperies.getHurt() * 6201 / 5658;
                  qixue = _loc6_.getELevel() * 0.0473 * this.roleProperies.getHaveblood() * _loc5_ * 6201 / 5658;
               }
               _loc12_ = 1;
               _loc7_ = _loc6_.getELevel() * 0.0315 * this.roleProperies.getHurt() * 6201 / 5658;
               qixue = _loc6_.getELevel() * 0.0315 * this.roleProperies.getHaveblood() * _loc5_ * 6201 / 5658;
               break;
            default:
               _loc7_ = 0;
         }
         return {
            "hurt":_loc7_ * 1.154,
            "qixue":qixue * 1.154,
            "atk":this.roleProperies.getPower()
         };
      }
      
      private function isAttackingButCanAttack() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3";
      }
      
      override protected function isCannotMoveWhenAttackOnFloor() : Boolean
      {
         if(this.isNotArrow)
         {
            return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit4" || this.curAction == "hit5" || this.curAction == "hit6" || this.curAction == "hit7" || this.curAction == "hit9" || this.curAction == "hit11" || this.curAction == "hit11Frame2" || this.curAction == "hit12";
         }
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit4" || this.curAction == "hit5" || this.curAction == "hit6" || this.curAction == "hit7" || this.curAction == "hit9" || this.curAction == "hit10" || this.curAction == "hit11" || this.curAction == "hit11Frame2" || this.curAction == "hit12";
      }
      
      override public function isAttacking() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3" || this.curAction == "hit4" || this.curAction == "hit5" || this.curAction == "hit6" || this.curAction == "hit7" || this.curAction == "hit8" || this.curAction == "hit9" || this.curAction == "hit10" || this.curAction == "hit11" || this.curAction == "hit11Frame2" || this.curAction == "hit12";
      }
      
      override public function isCanMoveWhenAttack() : Boolean
      {
         if(this.isNotArrow)
         {
            return this.curAction == "hit10" || this.curAction == "hit8";
         }
         return this.curAction == "hit8";
      }
   }
}

