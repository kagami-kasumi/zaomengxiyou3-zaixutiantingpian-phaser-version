package export.hero
{
   import base.*;
   import com.greensock.*;
   import export.*;
   import export.bullet.*;
   import export.level.*;
   import flash.display.*;
   import flash.events.*;
   import flash.filters.ColorMatrixFilter;
   import flash.geom.*;
   import flash.utils.*;
   import manager.*;
   import my.*;
   
   public class Role5 extends BaseHero
   {
      
      private var _BLMskill5:BLMSkill5;
      
      private var _JRJL:JRJL;
      
      public var _skill3extraHurt:int = 0;
      
      public var _skill3MAX:int;
      
      private var huoyan:int = 0;
      
      private var _skill2_1:Boolean = true;
      
      private var _skill2_2:FollowBaseObjectBullet;
      
      private var _skill3_1:FollowBaseObjectBullet;
      
      private var _skill4:FollowBaseObjectBullet;
      
      private var lmjly1:SpecialEffectBullet;
      
      private var lmjly2:SpecialEffectBullet;
      
      private var lmj1:FollowBaseObjectBullet;
      
      private var lmj2:FollowBaseObjectBullet;
      
      private var lmj3:EnemyMoveBullet;
      
      private var lmjly1frame:int;
      
      private var lmjly2frame:int;
      
      public var isSword:Boolean = true;
      
      public var _invert:Boolean = false;
      
      private var _role5hitadd:int = 0;
      
      private var canUseSkill3:Boolean = true;
      
      private var canUseSkill5:Boolean = true;
      
      private var ca:*;
      
      private var cmf:ColorMatrixFilter = null;
      
      private var lmjly1caltime:int = 0;
      
      private var lmjly2caltime:int = 0;
      
      private var canuselmj:Boolean = true;
      
      private var canusezxc:Boolean = true;
      
      private var canusefhf:Boolean = true;
      
      private var fhfnormal:Boolean = false;
      
      private var fhf2ly1canhit:Boolean = true;
      
      private var fhf2ly2canhit:Boolean = true;
      
      private var lmjlyDirect:int;
      
      private var fhflyDirect:int;
      
      private var fhf1_1:FollowBaseObjectBullet;
      
      private var fhf1_2:FollowBaseObjectBullet;
      
      private var fhf2_1:FollowBaseObjectBullet;
      
      private var fhf2_2:FollowBaseObjectBullet;
      
      private var zxc1:FollowBaseObjectBullet;
      
      private var zxc2:FollowBaseObjectBullet;
      
      private var fhf1ly1:SpecialEffectBullet;
      
      private var fhf1ly2:SpecialEffectBullet;
      
      private var fhf2ly1:SpecialEffectBullet;
      
      private var fhf2ly2:SpecialEffectBullet;
      
      private var fhf1ly1frame:int;
      
      private var fhf1ly2frame:int;
      
      private var fhf2ly1frame:int;
      
      private var fhf2ly2frame:int;
      
      private var zxcly1:SpecialEffectBullet;
      
      private var zxcly2:SpecialEffectBullet;
      
      private var zxcly1frame:int;
      
      private var zxcly2frame:int;
      
      private var skill4curecount:Array;
      
      private var skill4curexs:Array;
      
      private var skill4time:Array;
      
      private var consumeMP:Array;
      
      private var hmzLianZhan:Array;
      
      private var hmzZaDi:Array;
      
      private var SkillFixedDamage:Array;
      
      private var FixedDamageCount:Array;
      
      private var SkillFactor:Array;
      
      private var hmzLianZhanFactor:Array;
      
      private var hmzZaDiFactor:Array;
      
      public function Role5()
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
         this.protectedEquipObject = {
            "curClothId1":0,
            "curClothId2":1,
            "curWeaponId1":0,
            "curWeaponId2":1
         };
         this.skill4time = [12.7,13.6,14.2,14.5,14.7,15.5,15.1,15.2,15.5,15.7,18.5,16.8,18.1,19.6,18.1,18.2,19.2,18.5,18.8];
         this.skill4curecount = [16,51,106,143,182,252,303,397,507,574,708,863,1033,1221,1430,1552,1795,2054,2336,2640];
         this.skill4curexs = [0.01,0.03,0.04,0.05,0.06,0.08,0.09,0.1,0.11,0.12,0.14,0.15,0.16,0.17,0.19,0.2,0.21,0.22,0.24,0.248];
         super();
         roleName = "白龙";
         userType = "白龙";
         if(this.isSword == false)
         {
            this.horizenSpeed = 6;
            this.horizenRunSpeed = 10;
         }
         if(this.isSword == true)
         {
            this.horizenSpeed = 7;
            this.horizenRunSpeed = 11;
         }
         this.attackBackInfoDict["wait"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[0,-2],
            "attackInterval":999,
            "attackKind":"physics",
            "time":576,
            "addgxp":222,
            "baohufen":1800
         };
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[0,-2],
            "attackInterval":999,
            "attackKind":"physics",
            "time":576,
            "addgxp":222,
            "addprotection":1000 / 22,
            "baohufen":1800
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[0,-4],
            "attackInterval":999,
            "attackKind":"physics",
            "time":576,
            "addprotection":1000 / 22,
            "baohufen":1500
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[1,-2],
            "attackInterval":999,
            "attackKind":"physics",
            "time":700,
            "addgxp":222,
            "addprotection":1000 / 22 / 3,
            "baohufen":1800
         };
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[1,-3],
            "attackInterval":8,
            "attackKind":"physics",
            "time":689,
            "addgxp":139,
            "baohufen":833
         };
         this.attackBackInfoDict["hit5"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[3,-1],
            "attackInterval":999,
            "attackKind":"physics",
            "time":334,
            "addgxp":222,
            "baohufen":1800
         };
         this.attackBackInfoDict["hit6"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[-1,-1],
            "attackInterval":999,
            "attackKind":"physics",
            "time":666,
            "addprotection":1000 * 0.14,
            "addexp":178 * 3,
            "baohufen":583 * 3
         };
         this.attackBackInfoDict["hit7_1"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[-2,0],
            "attackInterval":4,
            "attackKind":"physics",
            "time":334,
            "addprotection":1000 * 0.14 / 5,
            "addgxp":266,
            "baohufen":2200
         };
         this.attackBackInfoDict["hit7_2"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[-28,-17],
            "attackInterval":999,
            "attackKind":"physics",
            "time":1000,
            "addgxp":400,
            "baohufen":2500
         };
         this.attackBackInfoDict["hit8"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[6,-2],
            "attackInterval":4,
            "attackKind":"physics",
            "addprotection":1000 * 0.14 / 5,
            "time":334,
            "addgxp":72,
            "baohufen":41
         };
         this.attackBackInfoDict["hit9"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[0,-2],
            "attackInterval":999,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit10"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[0,-2],
            "attackInterval":9,
            "attackKind":"physics",
            "addprotection":1000 * 0.2 / 7,
            "time":666,
            "addgxp":121,
            "baohufen":244
         };
         this.attackBackInfoDict["hit10_2"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[-12,-4],
            "attackInterval":999,
            "attackKind":"physics",
            "time":734,
            "addgxp":666,
            "baohufen":2000
         };
         this.attackBackInfoDict["hit10_4"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[3,-2],
            "attackInterval":4,
            "attackKind":"physics",
            "time":666,
            "addgxp":121,
            "baohufen":244
         };
         this.attackBackInfoDict["hit10_5"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[-12,-4],
            "attackInterval":999,
            "attackKind":"physics",
            "time":734,
            "addgxp":666,
            "baohufen":2000
         };
         this.attackBackInfoDict["hit10_3"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[-8,-2],
            "attackInterval":7,
            "attackKind":"physics",
            "time":734,
            "addgxp":0,
            "baohufen":0,
            "addEffect":[{
               "name":BaseAddEffect.ROLE5SKILL5,
               "time":gc.frameClips * 4.5,
               "isinvert":this._invert
            }]
         };
         this.attackBackInfoDict["hit11"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[0,0],
            "attackInterval":6,
            "attackKind":"physics",
            "time":0,
            "addprotection":1000 * 0.12 / 42,
            "baohufen":0
         };
         this.attackBackInfoDict["hit12"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[-12,-4],
            "attackInterval":999,
            "attackKind":"physics",
            "time":334,
            "addgxp":0,
            "baohufen":0
         };
         this.attackBackInfoDict["hit13"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[0,0],
            "attackInterval":999,
            "attackKind":"physics",
            "time":334,
            "addgxp":0,
            "baohufen":0,
            "addEffect":[{
               "name":BaseAddEffect.STUN,
               "time":gc.frameClips * 1
            }]
         };
         this.attackBackInfoDict["hit114"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[9,-1],
            "attackInterval":999,
            "attackKind":"physics",
            "time":888,
            "addgxp":278,
            "addprotection":1000 / 22 * 2,
            "baohufen":2000
         };
         this.attackBackInfoDict["hit18"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[0,-2],
            "attackInterval":999,
            "attackKind":"physics",
            "time":500,
            "addprotection":1000 / 22,
            "baohufen":1000
         };
         this.attackBackInfoDict["hit18_1"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[0,-2],
            "attackInterval":999,
            "attackKind":"physics",
            "time":500,
            "addprotection":1000 / 22,
            "baohufen":1000
         };
         this.attackBackInfoDict["hit19"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[-2,-4],
            "attackInterval":999,
            "attackKind":"physics",
            "time":500,
            "addprotection":1000 / 22,
            "baohufen":900
         };
         this.attackBackInfoDict["hit19_1"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[-2,-4],
            "attackInterval":999,
            "attackKind":"physics",
            "time":500,
            "addprotection":1000 / 22,
            "baohufen":900
         };
         this.attackBackInfoDict["hit20"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[1,-2],
            "attackInterval":999,
            "attackKind":"physics",
            "time":555,
            "addprotection":1000 / 22,
            "baohufen":900
         };
         this.attackBackInfoDict["hit20_1"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[1,-2],
            "attackInterval":999,
            "attackKind":"physics",
            "time":555,
            "addprotection":1000 / 22,
            "baohufen":900
         };
         this.attackBackInfoDict["hit21"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[-2,-3],
            "attackInterval":4,
            "attackKind":"physics",
            "time":560,
            "addprotection":1000 / 22 / 3,
            "baohufen":317
         };
         this.attackBackInfoDict["hit21_1"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[-2,-3],
            "attackInterval":4,
            "attackKind":"physics",
            "time":560,
            "addprotection":1000 / 22 / 3,
            "baohufen":317
         };
         this.attackBackInfoDict["hit22"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[3,-1],
            "attackInterval":999,
            "attackKind":"physics",
            "time":334,
            "addprotection":1000 / 22,
            "baohufen":1500
         };
         this.attackBackInfoDict["hit22_1"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[3,-1],
            "attackInterval":999,
            "attackKind":"physics",
            "time":334,
            "addprotection":1000 / 22,
            "baohufen":1500
         };
         this.attackBackInfoDict["hit23"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[-2,-21],
            "attackInterval":3,
            "attackKind":"physics",
            "time":400,
            "addexp":178,
            "baohufen":450
         };
         this.attackBackInfoDict["hit24_1"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[-2,0],
            "attackInterval":3,
            "attackKind":"physics",
            "time":334,
            "addprotection":1000 * 0.12 / 5,
            "baohufen":600
         };
         this.attackBackInfoDict["hit24_2"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[1,-1],
            "attackInterval":3,
            "attackKind":"physics",
            "time":334,
            "addprotection":1000 * 0.12 / 5,
            "baohufen":250
         };
         this.attackBackInfoDict["hit24_3"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[3,-2],
            "attackInterval":999,
            "attackKind":"physics",
            "time":334,
            "addprotection":1000 * 0.12 / 5,
            "baohufen":1150
         };
         this.attackBackInfoDict["hit25_1"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[4,-2],
            "attackInterval":999,
            "attackKind":"physics",
            "time":16,
            "addgxp":52,
            "baohufen":0.23
         };
         this.attackBackInfoDict["hit25_2"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[5,-3],
            "attackInterval":999,
            "attackKind":"physics",
            "time":500,
            "addgxp":932,
            "baohufen":3600
         };
         this.attackBackInfoDict["hit25_3"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[3,-2],
            "attackInterval":999,
            "attackKind":"physics",
            "time":500,
            "addgxp":1,
            "baohufen":0
         };
         this.attackBackInfoDict["hit26"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[0,-2],
            "attackInterval":999,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit27_1"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[3,-2],
            "attackInterval":6,
            "attackKind":"physics",
            "time":9,
            "addgxp":121,
            "baohufen":500
         };
         this.attackBackInfoDict["hit27_2"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[6,-4],
            "attackInterval":2,
            "attackKind":"physics",
            "time":10,
            "addgxp":67,
            "baohufen":24
         };
         this.attackBackInfoDict["hit27_3"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[21,-2],
            "attackInterval":4,
            "attackKind":"physics",
            "time":500,
            "addprotection":1000 * 0.125 / 13,
            "baohufen":24
         };
         this.attackBackInfoDict["hit115"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[9,-1],
            "attackInterval":999,
            "attackKind":"physics",
            "time":888,
            "addprotection":1000 / 22 * 1.8,
            "baohufen":1500
         };
         this.attackBackInfoDict["hit115_1"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[9,-1],
            "attackInterval":999,
            "attackKind":"physics",
            "time":888,
            "addprotection":1000 / 22 * 1.8,
            "baohufen":1500
         };
         this.attackBackInfoDict["hit28"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[3,-2],
            "attackInterval":999,
            "attackKind":"physics",
            "time":400,
            "addgxp":100,
            "baohufen":888
         };
         this.attackBackInfoDict["hit29"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[3,-2],
            "attackInterval":999,
            "attackKind":"physics",
            "time":660,
            "addprotection":1000 / 18,
            "baohufen":800
         };
         this.attackBackInfoDict["hit30"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[1,-2],
            "attackInterval":999,
            "attackKind":"physics",
            "time":660,
            "addprotection":1000 * 0.24 / 5,
            "baohufen":333
         };
         nameTextField.y = -this.colipse.height / 2 - 30;
         nameTextField.x = -this.colipse.width / 2 - 30;
         nameTextField.selectable = false;
         nameTextField.autoSize = "center";
         nameTextField.cacheAsBitmap = true;
         this.addChild(nameTextField);
      }
      
      private function loadresource() : void
      {
         var _loc1_:int = 6;
         while(_loc1_ < 9)
         {
            BaseBitmapDataPool.buildZm4RoleResources("idle_spear",_loc1_,_loc1_);
            BaseBitmapDataPool.buildZm4RoleResources("Role5_sword",_loc1_,_loc1_);
            _loc1_++;
         }
         BaseBitmapDataPool.buildZm4RoleResources("Role5_sword",1,17);
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:Object = null;
         var _loc2_:uint = uint(this.getCurClothId());
         if(_loc2_ == 115)
         {
            _loc2_ = 18;
         }
         if(_loc2_ == 112)
         {
            _loc2_ = 19;
         }
         if(_loc2_ == 113)
         {
            _loc2_ = 20;
         }
         if(_loc2_ == 114)
         {
            _loc2_ = 21;
         }
         var _loc3_:uint = uint(this.getCurWeaponId());
         var _loc5_:Array = null;
         if(this.isSword == false)
         {
            _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("idle_spear",_loc2_,_loc3_);
         }
         else
         {
            _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("idle_sword",_loc2_,_loc3_);
         }
         if(Boolean(_loc5_))
         {
            if(bbdc)
            {
               this.bbdc.replaceBitmapDataByName("body",_loc5_);
               if(!this.isSword)
               {
                  bbdc.setOffsetXY(14,3);
                  bbdc.setFrameStopCount([[3,3,4,3,3,4]]);
                  bbdc.setFrameCount([42]);
               }
               else
               {
                  bbdc.setOffsetXY(13,3);
                  bbdc.setFrameStopCount([[3,3,4,3,3,4]]);
                  bbdc.setFrameCount([42]);
               }
            }
            else
            {
               _loc1_ = {
                  "name":"body",
                  "source":_loc5_
               };
               bbdc = new BaseBitmapDataClip([_loc1_],290,290,new Point(0,0));
               if(!this.isSword)
               {
                  bbdc.setOffsetXY(14,3);
                  bbdc.setFrameStopCount([[3,3,4,3,3,4]]);
                  bbdc.setFrameCount([42]);
               }
               else
               {
                  bbdc.setOffsetXY(13,3);
                  bbdc.setFrameStopCount([[3,3,4,3,3,4]]);
                  bbdc.setFrameCount([42]);
               }
               bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
               bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
               this.body.addChild(bbdc);
               this.bbdc.turnRight();
            }
            return;
         }
         throw new Error("ROLE5--BitmapData Error!");
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
         var _loc3_:uint = uint(this.getCurClothId());
         var _loc4_:uint = uint(this.getCurWeaponId());
         if(_loc3_ == 115)
         {
            _loc3_ = 18;
         }
         if(_loc3_ == 112)
         {
            _loc3_ = 19;
         }
         if(_loc3_ == 113)
         {
            _loc3_ = 20;
         }
         if(_loc3_ == 114)
         {
            _loc3_ = 21;
         }
         var _loc5_:Array = null;
         switch(param1)
         {
            case "wait":
               this.bbdc.curPoint.x = 0;
               if(this.isSword == false)
               {
                  _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("idle_spear",_loc3_,_loc4_);
                  bbdc.setOffsetXY(14,3);
                  bbdc.setFrameStopCount([[3,3,4,3,3,4]]);
                  bbdc.setFrameCount([42]);
                  this.bbdc.replaceBitmapDataByName("body",_loc5_);
               }
               if(this.isSword == true)
               {
                  if(this.getCurAddEffect(BaseAddEffect.ROLE5LOONGSWORD))
                  {
                     _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("idle_sword",_loc3_,17);
                     bbdc.setOffsetXY(13,3);
                     bbdc.setFrameStopCount([[3,3,4,3,3,4]]);
                     bbdc.setFrameCount([42]);
                     this.bbdc.replaceBitmapDataByName("body",_loc5_);
                  }
                  else
                  {
                     _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("idle_sword",_loc3_,_loc4_);
                     bbdc.setOffsetXY(13,3);
                     bbdc.setFrameStopCount([[3,3,4,3,3,4]]);
                     bbdc.setFrameCount([42]);
                     this.bbdc.replaceBitmapDataByName("body",_loc5_);
                  }
               }
               this.bbdc.setFramePointX(0);
               this.bbdc.setFramePointY(0);
               this.bbdc.setState(param1);
               break;
            case "wait2":
               this.bbdc.curPoint.x = 0;
               if(_loc2_.y != 0)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(0);
               }
               this.bbdc.setCurFrameCount(1);
               _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("idle1_spear",_loc3_,_loc4_);
               bbdc.setOffsetXY(14,3);
               bbdc.setFrameStopCount([[6,3,3,3,3,3,3,4]]);
               bbdc.setFrameCount([8]);
               this.bbdc.replaceBitmapDataByName("body",_loc5_);
               this.bbdc.setState(param1);
               break;
            case "walk":
               if(this.isSword == false)
               {
                  _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("walk_spear",_loc3_,_loc4_);
                  bbdc.setOffsetXY(14,3);
                  bbdc.setFrameStopCount([[4,4,4,4]]);
                  bbdc.setFrameCount([4]);
                  this.bbdc.replaceBitmapDataByName("body",_loc5_);
               }
               if(this.isSword == true)
               {
                  if(this.getCurAddEffect(BaseAddEffect.ROLE5LOONGSWORD))
                  {
                     _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("walk_sword",_loc3_,17);
                     bbdc.setOffsetXY(13,3);
                     bbdc.setFrameStopCount([[4,4,4,4]]);
                     bbdc.setFrameCount([4]);
                     this.bbdc.replaceBitmapDataByName("body",_loc5_);
                  }
                  else
                  {
                     _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("walk_sword",_loc3_,_loc4_);
                     bbdc.setOffsetXY(13,3);
                     bbdc.setFrameStopCount([[4,4,4,4]]);
                     bbdc.setFrameCount([4]);
                     this.bbdc.replaceBitmapDataByName("body",_loc5_);
                  }
               }
               this.bbdc.setState(param1);
               break;
            case "run":
               if(this.isSword == false)
               {
                  _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("run_spear",_loc3_,_loc4_);
                  bbdc.setOffsetXY(14,3);
                  bbdc.setFrameStopCount([[3,3,3,3]]);
                  bbdc.setFrameCount([4]);
                  this.bbdc.replaceBitmapDataByName("body",_loc5_);
               }
               if(this.isSword == true)
               {
                  if(this.getCurAddEffect(BaseAddEffect.ROLE5LOONGSWORD))
                  {
                     _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("run_sword",_loc3_,17);
                     bbdc.setOffsetXY(13,3);
                     bbdc.setFrameStopCount([[3,3,3,3]]);
                     bbdc.setFrameCount([4]);
                     this.bbdc.replaceBitmapDataByName("body",_loc5_);
                  }
                  else
                  {
                     _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("run_sword",_loc3_,_loc4_);
                     bbdc.setOffsetXY(13,3);
                     bbdc.setFrameStopCount([[3,3,3,3]]);
                     bbdc.setFrameCount([4]);
                     this.bbdc.replaceBitmapDataByName("body",_loc5_);
                  }
               }
               this.bbdc.setState(param1);
               break;
            case "jump1":
               if(this.isSword == false)
               {
                  _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("jump1_spear",_loc3_,_loc4_);
                  bbdc.setOffsetXY(14,3);
                  bbdc.setFrameStopCount([[1]]);
                  bbdc.setFrameCount([1]);
                  this.bbdc.replaceBitmapDataByName("body",_loc5_);
               }
               if(this.isSword == true)
               {
                  if(this.getCurAddEffect(BaseAddEffect.ROLE5LOONGSWORD))
                  {
                     _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("jump1_sword",_loc3_,17);
                     bbdc.setOffsetXY(13,3);
                     bbdc.setFrameStopCount([[1]]);
                     bbdc.setFrameCount([1]);
                     this.bbdc.replaceBitmapDataByName("body",_loc5_);
                  }
                  else
                  {
                     _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("jump1_sword",_loc3_,_loc4_);
                     bbdc.setOffsetXY(13,3);
                     bbdc.setFrameStopCount([[1]]);
                     bbdc.setFrameCount([1]);
                     this.bbdc.replaceBitmapDataByName("body",_loc5_);
                  }
               }
               this.bbdc.setFramePointX(0);
               this.bbdc.setFramePointY(0);
               this.bbdc.setState(param1);
               break;
            case "jump2":
               this.bbdc.curPoint.x = 0;
               if(this.isSword == false)
               {
                  _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("jump2_spear",_loc3_,_loc4_);
                  bbdc.setOffsetXY(14,3);
                  bbdc.setFrameStopCount([[2,2,2,2]]);
                  bbdc.setFrameCount([8]);
                  this.bbdc.replaceBitmapDataByName("body",_loc5_);
               }
               if(this.isSword == true)
               {
                  if(this.getCurAddEffect(BaseAddEffect.ROLE5LOONGSWORD))
                  {
                     _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("jump2_sword",_loc3_,17);
                     bbdc.setOffsetXY(13,3);
                     bbdc.setFrameStopCount([[2,2,2,2]]);
                     bbdc.setFrameCount([8]);
                     this.bbdc.replaceBitmapDataByName("body",_loc5_);
                  }
                  else
                  {
                     _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("jump2_sword",_loc3_,_loc4_);
                     bbdc.setOffsetXY(13,3);
                     bbdc.setFrameStopCount([[2,2,2,2]]);
                     bbdc.setFrameCount([8]);
                     this.bbdc.replaceBitmapDataByName("body",_loc5_);
                  }
               }
               this.bbdc.setFramePointX(0);
               this.bbdc.setFramePointY(0);
               this.bbdc.setState(param1);
               break;
            case "jump3":
               if(this.isSword == false)
               {
                  _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("jump3_spear",_loc3_,_loc4_);
                  bbdc.setOffsetXY(14,3);
                  bbdc.setFrameStopCount([[1]]);
                  bbdc.setFrameCount([1]);
                  this.bbdc.replaceBitmapDataByName("body",_loc5_);
               }
               if(this.isSword == true)
               {
                  if(this.getCurAddEffect(BaseAddEffect.ROLE5LOONGSWORD))
                  {
                     _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("jump3_sword",_loc3_,17);
                     bbdc.setOffsetXY(13,3);
                     bbdc.setFrameStopCount([[1]]);
                     bbdc.setFrameCount([1]);
                     this.bbdc.replaceBitmapDataByName("body",_loc5_);
                  }
                  else
                  {
                     _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("jump3_sword",_loc3_,_loc4_);
                     bbdc.setOffsetXY(13,3);
                     bbdc.setFrameStopCount([[1]]);
                     bbdc.setFrameCount([1]);
                     this.bbdc.replaceBitmapDataByName("body",_loc5_);
                  }
               }
               this.bbdc.setFramePointX(0);
               this.bbdc.setFramePointY(0);
               this.bbdc.setState(param1);
               break;
            case "hit1":
               this.canturn = false;
               this.bbdc.curPoint.x = 0;
               this.bbdc.setCurFrameCount(1);
               if(this.isSword == false)
               {
                  _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("attack1_spear",_loc3_,_loc4_);
                  bbdc.setOffsetXY(14,3);
                  bbdc.setFrameStopCount([[2,4,2,7]]);
                  bbdc.setFrameCount([4]);
                  this.bbdc.replaceBitmapDataByName1("body",_loc5_);
               }
               this.bbdc.setFramePointX(0);
               this.bbdc.setFramePointY(0);
               this.bbdc.setState(param1);
               break;
            case "hit2":
               this.canturn = false;
               this.bbdc.curPoint.x = 0;
               this.bbdc.setCurFrameCount(1);
               if(this.isSword == false)
               {
                  _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("attack2_spear",_loc3_,_loc4_);
                  bbdc.setOffsetXY(14,3);
                  bbdc.setFrameStopCount([[2,3,2,8]]);
                  bbdc.setFrameCount([4]);
                  this.bbdc.replaceBitmapDataByName1("body",_loc5_);
               }
               this.bbdc.setFramePointX(0);
               this.bbdc.setFramePointY(0);
               this.bbdc.setState(param1);
               break;
            case "hit3":
               this.canturn = false;
               this.bbdc.curPoint.x = 0;
               this.bbdc.setCurFrameCount(1);
               if(this.isSword == false)
               {
                  _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("attack3_spear",_loc3_,_loc4_);
                  bbdc.setOffsetXY(14,3);
                  bbdc.setFrameStopCount([[2,5,1,2,8]]);
                  bbdc.setFrameCount([5]);
                  this.bbdc.replaceBitmapDataByName1("body",_loc5_);
                  if(_loc2_.y != 0)
                  {
                     this.bbdc.setFramePointX(0);
                     this.bbdc.setFramePointY(0);
                  }
               }
               this.bbdc.setState(param1);
               break;
            case "hit4":
               this.canturn = false;
               this.bbdc.curPoint.x = 0;
               this.bbdc.setCurFrameCount(1);
               if(this.isSword == false)
               {
                  _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("attack4_spear",_loc3_,_loc4_);
                  bbdc.setOffsetXY(14,3);
                  bbdc.setFrameStopCount([[3,4,1,1,1,1,1,1,2,2,6]]);
                  bbdc.setFrameCount([11]);
                  this.bbdc.replaceBitmapDataByName1("body",_loc5_);
               }
               this.bbdc.setFramePointX(0);
               this.bbdc.setFramePointY(0);
               this.bbdc.setState(param1);
               break;
            case "hit5":
               this.canturn = false;
               this.bbdc.curPoint.x = 0;
               this.bbdc.setCurFrameCount(1);
               this.bbdc.setFramePointX(0);
               this.bbdc.setFramePointY(0);
               if(this.isSword == false)
               {
                  _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("jumpattack_spear",_loc3_,_loc4_);
                  bbdc.setOffsetXY(13,3);
                  bbdc.setFrameStopCount([[2,4,6]]);
                  bbdc.setFrameCount([4]);
                  this.bbdc.replaceBitmapDataByName("body",_loc5_);
               }
               this.bbdc.setState(param1);
               break;
            case "hit6":
               this.bbdc.curPoint.x = 0;
               this.bbdc.setCurFrameCount(1);
               if(this.getCurAddEffect(BaseAddEffect.ROLE5LOONGSWORD))
               {
                  _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("xlc_sword",_loc3_,17);
                  bbdc.setOffsetXY(13,3);
                  bbdc.setFrameStopCount([[2,2,11,1]]);
                  bbdc.setFrameCount([4]);
                  this.bbdc.replaceBitmapDataByName("body",_loc5_);
               }
               else
               {
                  _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("xlc_sword",_loc3_,_loc4_);
                  bbdc.setOffsetXY(13,3);
                  bbdc.setFrameStopCount([[2,2,11,1]]);
                  bbdc.setFrameCount([4]);
                  this.bbdc.replaceBitmapDataByName("body",_loc5_);
               }
               this.bbdc.setFramePointX(0);
               this.bbdc.setFramePointY(0);
               this.bbdc.setState(param1);
               break;
            case "hit7":
               this.bbdc.curPoint.x = 0;
               this.bbdc.setCurFrameCount(1);
               if(this.getCurAddEffect(BaseAddEffect.ROLE5LOONGSWORD))
               {
                  _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("lxuanj1_sword",_loc3_,17);
                  bbdc.setOffsetXY(13,3);
                  bbdc.setFrameStopCount([[2,3,5]]);
                  bbdc.setFrameCount([3]);
                  this.bbdc.replaceBitmapDataByName("body",_loc5_);
               }
               else
               {
                  _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("lxuanj1_sword",_loc3_,_loc4_);
                  bbdc.setOffsetXY(13,3);
                  bbdc.setFrameStopCount([[2,3,5]]);
                  bbdc.setFrameCount([3]);
                  this.bbdc.replaceBitmapDataByName("body",_loc5_);
               }
               this.bbdc.setFramePointX(0);
               this.bbdc.setFramePointY(0);
               this.bbdc.setState(param1);
               break;
            case "hit8":
               this.bbdc.curPoint.x = 0;
               this.bbdc.setCurFrameCount(1);
               if(this.getCurAddEffect(BaseAddEffect.ROLE5LOONGSWORD))
               {
                  _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("lxuanj2_sword",_loc3_,17);
                  bbdc.setOffsetXY(13,3);
                  bbdc.setFrameStopCount([[2,2,6]]);
                  bbdc.setFrameCount([3]);
                  this.bbdc.replaceBitmapDataByName("body",_loc5_);
               }
               else
               {
                  _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("lxuanj2_sword",_loc3_,_loc4_);
                  bbdc.setOffsetXY(13,3);
                  bbdc.setFrameStopCount([[2,2,6]]);
                  bbdc.setFrameCount([3]);
                  this.bbdc.replaceBitmapDataByName("body",_loc5_);
               }
               this.bbdc.setFramePointX(0);
               this.bbdc.setFramePointY(0);
               this.bbdc.setState(param1);
               break;
            case "hit9":
               this.bbdc.curPoint.x = 0;
               this.bbdc.setCurFrameCount(1);
               if(this.getCurAddEffect(BaseAddEffect.ROLE5LOONGSWORD))
               {
                  _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("yyb_sword",_loc3_,17);
                  bbdc.setOffsetXY(13,3);
                  bbdc.setFrameStopCount([[3,3,9]]);
                  bbdc.setFrameCount([3]);
                  this.bbdc.replaceBitmapDataByName("body",_loc5_);
               }
               else
               {
                  _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("yyb_sword",_loc3_,_loc4_);
                  bbdc.setOffsetXY(13,3);
                  bbdc.setFrameStopCount([[3,3,9]]);
                  bbdc.setFrameCount([3]);
                  this.bbdc.replaceBitmapDataByName("body",_loc5_);
               }
               this.bbdc.setFramePointX(0);
               this.bbdc.setFramePointY(0);
               this.bbdc.setState(param1);
               break;
            case "hit10":
               this.bbdc.curPoint.x = 0;
               this.bbdc.setCurFrameCount(1);
               if(this.getCurAddEffect(BaseAddEffect.ROLE5LOONGSWORD))
               {
                  _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("xkjz_sword",_loc3_,17);
                  bbdc.setOffsetXY(13,3);
                  bbdc.setFrameStopCount([[2,3,5]]);
                  bbdc.setFrameCount([3]);
                  this.bbdc.replaceBitmapDataByName("body",_loc5_);
               }
               else
               {
                  _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("xkjz_sword",_loc3_,_loc4_);
                  bbdc.setOffsetXY(13,3);
                  bbdc.setFrameStopCount([[2,3,5]]);
                  bbdc.setFrameCount([3]);
                  this.bbdc.replaceBitmapDataByName("body",_loc5_);
               }
               this.bbdc.setFramePointX(0);
               this.bbdc.setFramePointY(0);
               this.bbdc.setState(param1);
               break;
            case "hit11":
               this.bbdc.curPoint.x = 0;
               this.bbdc.setCurFrameCount(1);
               if(this.getCurAddEffect(BaseAddEffect.ROLE5LOONGSWORD))
               {
                  _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("tlj_sword",_loc3_,17);
                  bbdc.setOffsetXY(13,3);
                  bbdc.setFrameStopCount([[2,2,6]]);
                  bbdc.setFrameCount([3]);
                  this.bbdc.replaceBitmapDataByName("body",_loc5_);
               }
               else
               {
                  _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("tlj_sword",_loc3_,_loc4_);
                  bbdc.setOffsetXY(13,3);
                  bbdc.setFrameStopCount([[2,2,6]]);
                  bbdc.setFrameCount([3]);
                  this.bbdc.replaceBitmapDataByName("body",_loc5_);
               }
               this.bbdc.setFramePointX(0);
               this.bbdc.setFramePointY(0);
               this.bbdc.setState(param1);
               break;
            case "hit10_3":
               this.bbdc.curPoint.x = 0;
               this.bbdc.setCurFrameCount(1);
               _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("skill5_3_spear",_loc3_,_loc4_);
               bbdc.setOffsetXY(14,3);
               bbdc.setFrameStopCount([[2,1,3]]);
               bbdc.setFrameCount([3]);
               this.bbdc.replaceBitmapDataByName("body",_loc5_);
               this.bbdc.setFramePointX(0);
               this.bbdc.setFramePointY(0);
               this.bbdc.setState(param1);
               break;
            case "hit114":
               this.bbdc.curPoint.x = 0;
               this.bbdc.setCurFrameCount(1);
               if(this.isSword == false)
               {
                  _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("runattack_spear",_loc3_,_loc4_);
                  bbdc.setOffsetXY(14,3);
                  bbdc.setFrameStopCount([[2,3,2,8]]);
                  bbdc.setFrameCount([4]);
                  this.bbdc.replaceBitmapDataByName1("body",_loc5_);
               }
               this.bbdc.setFramePointX(0);
               this.bbdc.setFramePointY(0);
               this.bbdc.setState(param1);
               break;
            case "hit114_1":
               this.bbdc.curPoint.x = 0;
               this.bbdc.setCurFrameCount(1);
               if(this.getCurAddEffect(BaseAddEffect.ROLE5LOONGSWORD))
               {
                  _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("runattack_sword",_loc3_,17);
                  bbdc.setOffsetXY(13,3);
                  bbdc.setFrameStopCount([[2,4,2,7]]);
                  bbdc.setFrameCount([4]);
                  this.bbdc.replaceBitmapDataByName("body",_loc5_);
               }
               else
               {
                  _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("runattack_sword",_loc3_,_loc4_);
                  bbdc.setOffsetXY(13,3);
                  bbdc.setFrameStopCount([[2,4,2,7]]);
                  bbdc.setFrameCount([4]);
                  this.bbdc.replaceBitmapDataByName("body",_loc5_);
               }
               this.bbdc.setFramePointX(0);
               this.bbdc.setFramePointY(0);
               this.bbdc.setState(param1);
               break;
            case "hit18":
               this.canturn = false;
               this.bbdc.curPoint.x = 0;
               this.bbdc.setCurFrameCount(1);
               if(this.getCurAddEffect(BaseAddEffect.ROLE5LOONGSWORD))
               {
                  _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("attack1_sword",_loc3_,17);
                  bbdc.setOffsetXY(13,3);
                  bbdc.setFrameStopCount([[2,3,2,3]]);
                  bbdc.setFrameCount([4]);
                  this.bbdc.replaceBitmapDataByName1("body",_loc5_);
               }
               else
               {
                  _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("attack1_sword",_loc3_,_loc4_);
                  bbdc.setOffsetXY(13,3);
                  bbdc.setFrameStopCount([[2,3,2,3]]);
                  bbdc.setFrameCount([4]);
                  this.bbdc.replaceBitmapDataByName1("body",_loc5_);
               }
               this.bbdc.setFramePointX(0);
               this.bbdc.setFramePointY(0);
               this.bbdc.setState(param1);
               break;
            case "hit19":
               this.canturn = false;
               this.bbdc.curPoint.x = 0;
               this.bbdc.setCurFrameCount(1);
               if(this.getCurAddEffect(BaseAddEffect.ROLE5LOONGSWORD))
               {
                  _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("attack2_sword",_loc3_,17);
                  bbdc.setOffsetXY(13,3);
                  bbdc.setFrameStopCount([[2,1,3,2,1]]);
                  bbdc.setFrameCount([5]);
                  this.bbdc.replaceBitmapDataByName1("body",_loc5_);
               }
               else
               {
                  _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("attack2_sword",_loc3_,_loc4_);
                  bbdc.setOffsetXY(13,3);
                  bbdc.setFrameStopCount([[2,1,3,2,1]]);
                  bbdc.setFrameCount([5]);
                  this.bbdc.replaceBitmapDataByName1("body",_loc5_);
               }
               this.bbdc.setFramePointX(0);
               this.bbdc.setFramePointY(0);
               this.bbdc.setState(param1);
               break;
            case "hit20":
               this.canturn = false;
               this.bbdc.curPoint.x = 0;
               this.bbdc.setCurFrameCount(1);
               if(this.getCurAddEffect(BaseAddEffect.ROLE5LOONGSWORD))
               {
                  _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("attack3_sword",_loc3_,17);
                  bbdc.setOffsetXY(13,3);
                  bbdc.setFrameStopCount([[3,2,2,2]]);
                  bbdc.setFrameCount([4]);
                  this.bbdc.replaceBitmapDataByName1("body",_loc5_);
               }
               else
               {
                  _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("attack3_sword",_loc3_,_loc4_);
                  bbdc.setOffsetXY(13,3);
                  bbdc.setFrameStopCount([[3,2,2,2]]);
                  bbdc.setFrameCount([4]);
                  this.bbdc.replaceBitmapDataByName1("body",_loc5_);
               }
               this.bbdc.setFramePointX(0);
               this.bbdc.setFramePointY(0);
               this.bbdc.setState(param1);
               break;
            case "hit21":
               this.canturn = false;
               this.bbdc.curPoint.x = 0;
               this.bbdc.setCurFrameCount(1);
               if(this.getCurAddEffect(BaseAddEffect.ROLE5LOONGSWORD))
               {
                  _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("attack4_sword",_loc3_,17);
                  bbdc.setOffsetXY(13,3);
                  bbdc.setFrameStopCount([[2,7,2,8]]);
                  bbdc.setFrameCount([4]);
                  this.bbdc.replaceBitmapDataByName1("body",_loc5_);
               }
               else
               {
                  _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("attack4_sword",_loc3_,_loc4_);
                  bbdc.setOffsetXY(13,3);
                  bbdc.setFrameStopCount([[2,7,2,8]]);
                  bbdc.setFrameCount([4]);
                  this.bbdc.replaceBitmapDataByName1("body",_loc5_);
               }
               this.bbdc.setFramePointX(0);
               this.bbdc.setFramePointY(0);
               this.bbdc.setState(param1);
               break;
            case "hit22":
               this.canturn = false;
               this.bbdc.curPoint.x = 0;
               this.bbdc.setCurFrameCount(1);
               if(this.getCurAddEffect(BaseAddEffect.ROLE5LOONGSWORD))
               {
                  _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("jumpattack_sword",_loc3_,17);
                  bbdc.setOffsetXY(13,3);
                  bbdc.setFrameStopCount([[2,4,6]]);
                  bbdc.setFrameCount([3]);
                  this.bbdc.replaceBitmapDataByName1("body",_loc5_);
               }
               else
               {
                  _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("jumpattack_sword",_loc3_,_loc4_);
                  bbdc.setOffsetXY(13,3);
                  bbdc.setFrameStopCount([[2,4,6]]);
                  bbdc.setFrameCount([3]);
                  this.bbdc.replaceBitmapDataByName1("body",_loc5_);
               }
               this.bbdc.setFramePointX(0);
               this.bbdc.setFramePointY(0);
               this.bbdc.setState(param1);
               break;
            case "hit23":
               this.bbdc.curPoint.x = 0;
               this.bbdc.setCurFrameCount(1);
               _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("xlj_sword",_loc3_,_loc4_);
               bbdc.setOffsetXY(13,3);
               bbdc.setFrameStopCount([[2,1,1,1,1,8]]);
               bbdc.setFrameCount([6]);
               this.bbdc.replaceBitmapDataByName("body",_loc5_);
               this.bbdc.setFramePointX(0);
               this.bbdc.setFramePointY(0);
               this.bbdc.setState(param1);
               break;
            case "hit24_1":
               this.bbdc.curPoint.x = 0;
               this.bbdc.setCurFrameCount(1);
               _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("pkz_sword",_loc3_,_loc4_);
               bbdc.setOffsetXY(13,3);
               bbdc.setFrameStopCount([[2,2,2,2,2,5]]);
               bbdc.setFrameCount([6]);
               this.bbdc.replaceBitmapDataByName1("body",_loc5_);
               this.bbdc.setFramePointX(0);
               this.bbdc.setFramePointY(0);
               this.bbdc.setState(param1);
               break;
            case "hit25_1":
               this.bbdc.curPoint.x = 0;
               this.bbdc.setCurFrameCount(1);
               _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("nlj1_sword",_loc3_,_loc4_);
               bbdc.setOffsetXY(13,3);
               bbdc.setFrameStopCount([[1]]);
               bbdc.setFrameCount([1]);
               this.bbdc.replaceBitmapDataByName1("body",_loc5_);
               this.bbdc.setFramePointX(0);
               this.bbdc.setFramePointY(0);
               this.bbdc.setState(param1);
               break;
            case "hit25_2":
               this.bbdc.curPoint.x = 0;
               this.bbdc.setCurFrameCount(1);
               _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("nlj2_sword",_loc3_,_loc4_);
               bbdc.setOffsetXY(13,3);
               bbdc.setFrameStopCount([[2,2,1,1,1,8]]);
               bbdc.setFrameCount([6]);
               this.bbdc.replaceBitmapDataByName1("body",_loc5_);
               this.bbdc.setFramePointX(0);
               this.bbdc.setFramePointY(0);
               this.bbdc.setState(param1);
               break;
            case "hit26":
               this.bbdc.curPoint.x = 0;
               this.bbdc.setCurFrameCount(1);
               _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("lxj_sword",_loc3_,_loc4_);
               bbdc.setOffsetXY(13,3);
               bbdc.setFrameStopCount([[4,4,12]]);
               bbdc.setFrameCount([3]);
               this.bbdc.replaceBitmapDataByName1("body",_loc5_);
               this.bbdc.setFramePointX(0);
               this.bbdc.setFramePointY(0);
               this.bbdc.setState(param1);
               break;
            case "hit27_1":
               this.bbdc.curPoint.x = 0;
               this.bbdc.setCurFrameCount(1);
               _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("lysh1_sword",_loc3_,_loc4_);
               bbdc.setOffsetXY(13,3);
               bbdc.setFrameStopCount([[3,2,12]]);
               bbdc.setFrameCount([3]);
               this.bbdc.replaceBitmapDataByName1("body",_loc5_);
               this.bbdc.setFramePointX(0);
               this.bbdc.setFramePointY(0);
               this.bbdc.setState(param1);
               break;
            case "hit27_2":
               this.bbdc.curPoint.x = 0;
               this.bbdc.setCurFrameCount(1);
               _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("lysh2_sword",_loc3_,_loc4_);
               bbdc.setOffsetXY(13,3);
               bbdc.setFrameStopCount([[4,2,9]]);
               bbdc.setFrameCount([3]);
               this.bbdc.replaceBitmapDataByName1("body",_loc5_);
               this.bbdc.setFramePointX(0);
               this.bbdc.setFramePointY(0);
               this.bbdc.setState(param1);
               break;
            case "hit28":
               this.bbdc.curPoint.x = 0;
               this.bbdc.setCurFrameCount(1);
               _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("lysh2_sword",_loc3_,_loc4_);
               bbdc.setOffsetXY(13,3);
               bbdc.setFrameStopCount([[1,3,7]]);
               bbdc.setFrameCount([3]);
               this.bbdc.replaceBitmapDataByName1("body",_loc5_);
               this.bbdc.setFramePointX(0);
               this.bbdc.setFramePointY(0);
               this.bbdc.setState(param1);
               break;
            case "hit29":
               this.bbdc.curPoint.x = 0;
               this.bbdc.setCurFrameCount(1);
               _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("mlsz_sword",_loc3_,_loc4_);
               bbdc.setOffsetXY(13,3);
               bbdc.setFrameStopCount([[1,2,10,10,8,10,8]]);
               bbdc.setFrameCount([7]);
               this.bbdc.replaceBitmapDataByName1("body",_loc5_);
               this.bbdc.setFramePointX(0);
               this.bbdc.setFramePointY(0);
               this.bbdc.setState(param1);
               break;
            case "hurt":
               this.bbdc.curPoint.x = 0;
               if(this.isSword == false)
               {
                  _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("hurt_spear",_loc3_,_loc4_);
                  bbdc.setOffsetXY(14,3);
                  bbdc.setFrameStopCount([[10]]);
                  bbdc.setFrameCount([1]);
                  this.bbdc.replaceBitmapDataByName1("body",_loc5_);
               }
               if(this.isSword == true)
               {
                  _loc5_ = BaseBitmapDataPool.loadZm4RoleResources("hurt_sword",_loc3_,_loc4_);
                  bbdc.setOffsetXY(13,3);
                  bbdc.setFrameStopCount([[7]]);
                  bbdc.setFrameCount([1]);
                  this.bbdc.replaceBitmapDataByName("body",_loc5_);
               }
               this.resetGraity();
               this.bbdc.setFramePointX(0);
               this.bbdc.setFramePointY(0);
               this.bbdc.setState(param1);
         }
      }
      
      override protected function scriptFrameOverFunc(param1:int) : void
      {
         this.canUseSkill3 = true;
         this.canUseSkill5 = true;
         var _loc2_:String = String(this.bbdc.getState());
         switch(_loc2_)
         {
            case "walk":
               this.bbdc.setFramePointX(0);
               break;
            case "run":
               this.bbdc.setFramePointX(0);
               break;
            case "wait":
               this.setAction("wait");
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
               this.bbdc.setFramePointX(0);
               break;
            case "hit1":
               this.canturn = false;
               this.setAction("wait");
               break;
            case "hit2":
               this.canturn = false;
               this.setAction("wait");
               break;
            case "hit3":
               this.canturn = false;
               this.setAction("wait");
               break;
            case "hit4":
               this.canturn = false;
               this.setAction("wait");
               break;
            case "hit5":
               this.canturn = false;
               if(!this.isInSky())
               {
                  this.setAction("wait");
                  break;
               }
               this.setAction("jump3");
               break;
            case "hit114":
               this.setAction("wait");
               break;
            case "hit6":
               this.setSpeedStaticOnly();
               if(!this.isInSky())
               {
                  this.setAction("wait");
                  break;
               }
               this.setAction("jump3");
               break;
            case "hit7":
               this.setAction("hit8");
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
               if(!this.isInSky())
               {
                  this.setAction("wait");
                  break;
               }
               this.setAction("jump3");
               break;
            case "hit10":
               if(!this.isInSky())
               {
                  this.setAction("wait");
                  break;
               }
               this.setAction("jump3");
               break;
            case "hit11":
               if(!this.isInSky())
               {
                  this.setAction("wait");
                  break;
               }
               this.setAction("jump3");
               break;
            case "hit10_3":
               if(!this.isInSky())
               {
                  this.setAction("wait");
                  break;
               }
               this.setAction("jump3");
               break;
            case "hurt":
               this.setStatic();
               this.speed.x = 0;
               this.setAction("wait");
            case "hit18":
               this.canturn = false;
               this.setAction("wait");
               break;
            case "hit19":
               this.canturn = false;
               this.setAction("wait");
               break;
            case "hit20":
               this.canturn = false;
               this.setAction("wait");
               break;
            case "hit21":
               this.canturn = false;
               this.setAction("wait");
               break;
            case "hit22":
               this.canturn = false;
               if(!this.isInSky())
               {
                  this.setAction("wait");
                  break;
               }
               this.setAction("jump3");
               break;
            case "hit23":
               this.setSpeedStaticOnly();
               if(!this.isInSky())
               {
                  this.setAction("wait");
                  break;
               }
               this.setAction("jump3");
               break;
            case "hit114_1":
               this.setAction("wait");
               break;
            case "hit24_1":
               this.setAction("wait");
               break;
            case "hit25_1":
               this.bbdc.setFramePointX(0);
               break;
            case "hit25_2":
               if(!this.isInSky())
               {
                  this.setAction("wait");
                  break;
               }
               this.setAction("jump3");
               break;
            case "hit26":
               if(this._skill4)
               {
                  this._skill4.destroy();
                  this._skill4 = null;
               }
               if(!this.isInSky())
               {
                  this.setAction("wait");
                  break;
               }
               this.setAction("jump3");
               break;
            case "hit27_1":
               if(!this.isInSky())
               {
                  this.setAction("wait");
                  break;
               }
               this.setAction("jump3");
            case "hit27_2":
               if(!this.isInSky())
               {
                  this.setAction("wait");
                  break;
               }
               this.setAction("jump3");
               break;
            case "hit28":
               if(!this.isInSky())
               {
                  this.setAction("wait");
               }
               else
               {
                  this.setAction("jump3");
               }
               break;
            case "hit29":
               if(!this.isInSky())
               {
                  this.setAction("wait");
               }
               else
               {
                  this.setAction("jump3");
               }
         }
      }
      
      override protected function enterFrameFunc(param1:Point) : void
      {
         var _loc2_:String = String(this.bbdc.getState());
         var _loc6_:Point = new Point();
         var _loc7_:Point = new Point();
         switch(_loc2_)
         {
            case "hit1":
               if(gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     if(param1.x == 1)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc6_.x = this.x - 37;
                        }
                        else
                        {
                           _loc6_.x = this.x + 37;
                        }
                        _loc6_.y = this.y + 43;
                        if(this.isSword == false)
                        {
                           this.doSingleHit(this.getBBDC().getDirect(),_loc6_,1,_loc2_);
                        }
                     }
                  }
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     if(param1.x == 2)
                     {
                        this.canturn = true;
                     }
                  }
               }
               break;
            case "hit2":
               if(gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     if(param1.x == 1)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc6_.x = this.x - 57;
                        }
                        else
                        {
                           _loc6_.x = this.x + 57;
                        }
                        _loc6_.y = this.y + 49;
                        if(this.isSword == false)
                        {
                           this.doSingleHit(this.getBBDC().getDirect(),_loc6_,2,_loc2_);
                        }
                     }
                  }
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     if(param1.x == 2)
                     {
                        this.canturn = true;
                     }
                  }
               }
               break;
            case "hit3":
               if(gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     if(param1.x == 1)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc6_.x = this.x - 187;
                        }
                        else
                        {
                           _loc6_.x = this.x + 187;
                        }
                        _loc6_.y = this.y + 49;
                        if(this.isSword == false)
                        {
                           this.doSingleHit(this.getBBDC().getDirect(),_loc6_,3,_loc2_);
                        }
                     }
                  }
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     if(param1.x == 2)
                     {
                        this.canturn = true;
                     }
                  }
               }
               break;
            case "hit4":
               if(gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     if(param1.x == 0)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc6_.x = this.x - 23;
                        }
                        else
                        {
                           _loc6_.x = this.x + 23;
                        }
                        _loc6_.y = this.y + 53;
                        if(this.isSword == false)
                        {
                           this.doSingleHit(this.getBBDC().getDirect(),_loc6_,4,_loc2_);
                        }
                     }
                  }
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     if(param1.x == 2)
                     {
                        this.canturn = true;
                     }
                  }
               }
               break;
            case "hit5":
               if(gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     if(param1.x == 1)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc6_.x = this.x - 95;
                        }
                        else
                        {
                           _loc6_.x = this.x + 95;
                        }
                        _loc6_.y = this.y + 47;
                        if(this.isSword == false)
                        {
                           this.doSingleHit(this.getBBDC().getDirect(),_loc6_,5,_loc2_);
                        }
                     }
                  }
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     if(param1.x == 0)
                     {
                        this.canturn = true;
                     }
                  }
               }
               break;
            case "hit114":
               if(gc.isSingleGame())
               {
                  if(this.bbdc.getDirect() == 0)
                  {
                     this.speed.x = -10;
                  }
                  else
                  {
                     this.speed.x = 10;
                  }
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     if(param1.x == 0)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc6_.x = this.x - 101.6;
                        }
                        else
                        {
                           _loc6_.x = this.x + 101.6;
                        }
                        _loc6_.y = this.y + 51.6;
                        if(this.isSword == false)
                        {
                           this.doRunHit(this.getBBDC().getDirect(),_loc6_);
                        }
                     }
                  }
               }
               break;
            case "hit6":
               if(gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     if(param1.x == 1)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc6_.x = this.x - 35;
                        }
                        else
                        {
                           _loc6_.x = this.x + 35;
                        }
                        _loc6_.y = this.y + 52;
                        SoundManager.play("Role5_skill1");
                        this.setYourFather(8);
                        this.doHit6(this.getBBDC().getDirect(),_loc6_,6,_loc2_);
                     }
                  }
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     if(param1.x == 1)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           this.speed.x = -35;
                        }
                        else
                        {
                           this.speed.x = 35;
                        }
                     }
                  }
                  this.speed.y = 0;
               }
               break;
            case "hit7":
               if(gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     if(param1.x == 0)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc6_.x = this.x - 68 - 120;
                        }
                        else
                        {
                           _loc6_.x = this.x + 68 + 120;
                        }
                        _loc6_.y = this.y + 44 - 21;
                        SoundManager.play("Role5_skill2");
                        this.doHit7(this.getBBDC().getDirect(),_loc6_,"7_1","hit7_1");
                        if(this._JRJL)
                        {
                           if(this._JRJL.canShoot())
                           {
                              this._JRJL.toShoot();
                           }
                        }
                     }
                  }
               }
               break;
            case "hit8":
               if(gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     if(param1.x == 0)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc6_.x = this.x - 68 - 360 - 120;
                        }
                        else
                        {
                           _loc6_.x = this.x + 68 + 360 + 120;
                        }
                        _loc6_.y = this.y + 44 - 21;
                        SoundManager.play("Role5_skill2");
                        this.doHit8(this.getBBDC().getDirect(),_loc6_,8,_loc2_);
                     }
                  }
                  this.speed.y = 0;
               }
               break;
            case "hit9":
               if(gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     if(param1.x == 0)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc6_.x = this.x - 7;
                        }
                        else
                        {
                           _loc6_.x = this.x + 7;
                        }
                        _loc6_.y = this.y + 47;
                        this.doHit9(this.getBBDC().getDirect(),_loc6_);
                     }
                  }
               }
               break;
            case "hit10":
               if(gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     if(param1.x == 0)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc6_.x = this.x - 486;
                        }
                        else
                        {
                           _loc6_.x = this.x + 486;
                        }
                        _loc6_.y = this.y - 500 + 35;
                        this.doHit10(this.getBBDC().getDirect(),_loc6_);
                        if(this._JRJL)
                        {
                           if(this._JRJL.canShoot())
                           {
                              this._JRJL.toShoot();
                           }
                        }
                     }
                  }
               }
               break;
            case "hit11":
               if(gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     if(param1.x == 0)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc6_.x = this.x - 200;
                        }
                        else
                        {
                           _loc6_.x = this.x + 200;
                        }
                        _loc6_.y = this.y + 49;
                        try
                        {
                           this.curAddEffect.removeRole5TLJ();
                        }
                        catch(e:*)
                        {
                        }
                        this.curAddEffect.add([{
                           "name":BaseAddEffect.ROLE5TLJ,
                           "time":gc.frameClips * this.skill4time[this.player.returnSkillLevelBySkillName("yyb") - 1]
                        }]);
                     }
                  }
               }
               break;
            case "hit10_3":
               if(gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     if(param1.x == 0)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           this.x += 100;
                        }
                        else
                        {
                           this.x -= 100;
                        }
                        this.y -= 30;
                     }
                  }
                  this.speed.y = 0;
               }
               break;
            case "hit18":
               if(gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     if(param1.x == 0)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc6_.x = this.x - 54.8;
                        }
                        else
                        {
                           _loc6_.x = this.x + 54.8;
                        }
                        _loc6_.y = this.y + 51.6;
                        if(this.getCurAddEffect(BaseAddEffect.ROLE5LOONGSWORD))
                        {
                           this.doLoongHit123(this.getBBDC().getDirect(),_loc6_,1,_loc2_);
                           if(Math.random() <= 0.25)
                           {
                              this.dolxjfeijian();
                           }
                           break;
                        }
                        if(!this.getCurAddEffect(BaseAddEffect.ROLE5LOONGSWORD))
                        {
                           this.doSingleHit1(this.getBBDC().getDirect(),_loc6_,1,_loc2_);
                        }
                     }
                  }
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     if(param1.x == 2)
                     {
                        this.canturn = true;
                     }
                  }
               }
               break;
            case "hit19":
               if(gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     if(param1.x == 0)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc6_.x = this.x - 50.2;
                        }
                        else
                        {
                           _loc6_.x = this.x + 50.2;
                        }
                        _loc6_.y = this.y + 37.35;
                        if(this.getCurAddEffect(BaseAddEffect.ROLE5LOONGSWORD))
                        {
                           this.doLoongHit123(this.getBBDC().getDirect(),_loc6_,2,_loc2_);
                           if(Math.random() <= 0.25)
                           {
                              this.dolxjfeijian();
                           }
                           break;
                        }
                        if(!this.getCurAddEffect(BaseAddEffect.ROLE5LOONGSWORD))
                        {
                           this.doSingleHit1(this.getBBDC().getDirect(),_loc6_,2,_loc2_);
                        }
                     }
                  }
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     if(param1.x == 2)
                     {
                        this.canturn = true;
                     }
                  }
               }
               break;
            case "hit20":
               if(gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     if(param1.x == 0)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc6_.x = this.x - 43.5;
                        }
                        else
                        {
                           _loc6_.x = this.x + 43.5;
                        }
                        _loc6_.y = this.y + 52.7;
                        if(this.getCurAddEffect(BaseAddEffect.ROLE5LOONGSWORD))
                        {
                           this.doLoongHit123(this.getBBDC().getDirect(),_loc6_,3,_loc2_);
                           if(Math.random() <= 0.25)
                           {
                              this.dolxjfeijian();
                           }
                           break;
                        }
                        if(!this.getCurAddEffect(BaseAddEffect.ROLE5LOONGSWORD))
                        {
                           this.doSingleHit1(this.getBBDC().getDirect(),_loc6_,3,_loc2_);
                        }
                     }
                  }
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     if(param1.x == 2)
                     {
                        this.canturn = true;
                     }
                  }
               }
               break;
            case "hit21":
               if(gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     if(param1.x == 0)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc6_.x = this.x - 47.1;
                        }
                        else
                        {
                           _loc6_.x = this.x + 47.1;
                        }
                        _loc6_.y = this.y + 54.2;
                        if(this.getCurAddEffect(BaseAddEffect.ROLE5LOONGSWORD))
                        {
                           this.doSingleHit1(this.getBBDC().getDirect(),_loc6_,4,_loc2_ + "_1");
                           if(Math.random() <= 0.25)
                           {
                              this.dolxjfeijian();
                           }
                        }
                        this.doSingleHit1(this.getBBDC().getDirect(),_loc6_,4,_loc2_);
                     }
                  }
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     if(param1.x == 2)
                     {
                        this.canturn = true;
                     }
                  }
               }
               break;
            case "hit22":
               if(gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     if(param1.x == 0)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc6_.x = this.x - 42.2;
                        }
                        else
                        {
                           _loc6_.x = this.x + 42.2;
                        }
                        _loc6_.y = this.y + 54;
                        if(this.getCurAddEffect(BaseAddEffect.ROLE5LOONGSWORD))
                        {
                           this.doSingleHit1(this.getBBDC().getDirect(),_loc6_,5,_loc2_ + "_1");
                           if(Math.random() <= 0.25)
                           {
                              this.dolxjfeijian();
                           }
                        }
                        this.doSingleHit1(this.getBBDC().getDirect(),_loc6_,5,_loc2_);
                     }
                  }
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     if(param1.x == 0)
                     {
                        this.canturn = true;
                     }
                  }
               }
               break;
            case "hit114_1":
               if(gc.isSingleGame())
               {
                  if(this.bbdc.getDirect() == 0)
                  {
                     this.speed.x = -10;
                  }
                  else
                  {
                     this.speed.x = 10;
                  }
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     if(param1.x == 0)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc6_.x = this.x - 35;
                        }
                        else
                        {
                           _loc6_.x = this.x + 35;
                        }
                        _loc6_.y = this.y + 52;
                        this.doRunHit(this.getBBDC().getDirect(),_loc6_);
                        if(this.getCurAddEffect(BaseAddEffect.ROLE5LOONGSWORD))
                        {
                           if(Math.random() <= 0.25)
                           {
                              this.dolxjfeijian();
                           }
                        }
                     }
                  }
               }
               break;
            case "hit23":
               if(gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     if(param1.x == 0)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc6_.x = this.x - 53.6;
                        }
                        else
                        {
                           _loc6_.x = this.x + 53.6;
                        }
                        _loc6_.y = this.y + 51.6;
                        SoundManager.play("Role5_skill1");
                        this.doSingleHit1(this.getBBDC().getDirect(),_loc6_,7,_loc2_);
                        if(this.getCurAddEffect(BaseAddEffect.ROLE5LOONGSWORD))
                        {
                           if(Math.random() <= 0.25)
                           {
                              this.dolxjfeijian();
                           }
                        }
                     }
                  }
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     if(param1.x == 0)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           this.speed.x -= 1.8;
                        }
                        else
                        {
                           this.speed.x += 1.8;
                        }
                        this.speed.y = -26.2;
                     }
                  }
               }
               break;
            case "hit24_1":
               if(gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     if(param1.x == 0)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc6_.x = this.x - 54.6;
                        }
                        else
                        {
                           _loc6_.x = this.x + 54.6;
                        }
                        _loc6_.y = this.y + 54;
                        if(this._skill2_1 == true)
                        {
                           SoundManager.play("Role5_skill2");
                           this.doSwordHit7_1(this.getBBDC().getDirect(),_loc6_);
                           if(this._JRJL)
                           {
                              if(this._JRJL.canShoot())
                              {
                                 this._JRJL.toShoot();
                              }
                           }
                           if(this.getCurAddEffect(BaseAddEffect.ROLE5LOONGSWORD))
                           {
                              if(Math.random() <= 0.25)
                              {
                                 this.dolxjfeijian();
                              }
                           }
                        }
                     }
                  }
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     if(param1.x == 4)
                     {
                        if(!this.isInSky())
                        {
                           _loc6_ = new Point();
                           if(this.bbdc.getDirect() == 0)
                           {
                              _loc6_.x = this.x - 54.6;
                           }
                           else
                           {
                              _loc6_.x = this.x + 54.6;
                           }
                           _loc6_.y = this.y + 54;
                           SoundManager.play("Role5_skill2");
                           this.doSwordHit7_3(this.getBBDC().getDirect(),_loc6_);
                           break;
                        }
                        this.bbdc.setFramePointX(4);
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc6_.x = this.x - 54.2;
                        }
                        else
                        {
                           _loc6_.x = this.x + 54.2;
                        }
                        _loc6_.y = this.y + 51.6;
                        if(!this._skill2_2)
                        {
                           SoundManager.play("Role5_skill2");
                           this.doSwordHit7_2(this.getBBDC().getDirect(),_loc6_);
                           if(this.getCurAddEffect(BaseAddEffect.ROLE5LOONGSWORD))
                           {
                              if(Math.random() <= 0.25)
                              {
                                 this.dolxjfeijian();
                              }
                           }
                        }
                     }
                  }
               }
               break;
            case "hit25_1":
               if(gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     if(param1.x == 0)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc6_.x = this.x + 371.4;
                        }
                        else
                        {
                           _loc6_.x = this.x - 371.4;
                        }
                        _loc6_.y = this.y + 49.1;
                        this.bbdc.setFramePointX(0);
                        if(!this._skill3_1)
                        {
                           this.doSwordHit8_1(this.getBBDC().getDirect(),_loc6_);
                        }
                     }
                  }
               }
               break;
            case "hit25_2":
               if(gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     if(param1.x == 0)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc6_.x = this.x + 344.4;
                        }
                        else
                        {
                           _loc6_.x = this.x - 344.4;
                        }
                        _loc6_.y = this.y + 53.6;
                        SoundManager.play("Role5_hit1");
                        this.doSwordHit8_2(this.getBBDC().getDirect(),_loc6_);
                        if(this.getCurAddEffect(BaseAddEffect.ROLE5LOONGSWORD))
                        {
                           if(Math.random() <= 0.25)
                           {
                              this.dolxjfeijian();
                           }
                        }
                     }
                  }
               }
               break;
            case "hit26":
               if(gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     if(param1.x == 0)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc6_.x = this.x - 48;
                        }
                        else
                        {
                           _loc6_.x = this.x + 48;
                        }
                        _loc6_.y = this.y + 54;
                        this.doSwordHit9(this.getBBDC().getDirect(),_loc6_);
                     }
                  }
               }
               break;
            case "hit27_1":
               if(gc.isSingleGame())
               {
               }
               break;
            case "hit27_2":
               if(gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     if(param1.x == 0)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc6_.x = this.x + 28;
                        }
                        else
                        {
                           _loc6_.x = this.x - 28;
                        }
                        _loc6_.y = this.y + 56;
                        this.doSwordHit10_2(this.getBBDC().getDirect(),_loc6_);
                        if(this._JRJL)
                        {
                           if(this._JRJL.canShoot())
                           {
                              this._JRJL.toShoot();
                           }
                        }
                     }
                  }
               }
               break;
            case "hit28":
               if(gc.isSingleGame())
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     if(param1.x == 1)
                     {
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc6_.x = this.x - 53;
                        }
                        else
                        {
                           _loc6_.x = this.x + 53;
                        }
                        _loc6_.y = this.y + 13;
                        this.doSwordHit11(this.getBBDC().getDirect(),_loc6_);
                     }
                  }
               }
               break;
            case "hit29":
               if(gc.isSingleGame())
               {
                  this.speed.y = 0;
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     if(param1.x == 2)
                     {
                        if(this.getCurAddEffect(BaseAddEffect.ROLE5LOONGSWORD))
                        {
                           if(Math.random() <= 0.25)
                           {
                              this.dolxjfeijian();
                           }
                        }
                        if(this._JRJL)
                        {
                           this._JRJL.addMcTime(300);
                           if(this._JRJL.canShoot())
                           {
                              this._JRJL.toShoot();
                           }
                        }
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc6_.x = this.x - 72;
                        }
                        else
                        {
                           _loc6_.x = this.x + 72;
                        }
                        _loc6_.y = this.y + 6;
                        this.doSwordHit12_1(this.getBBDC().getDirect(),_loc6_);
                     }
                  }
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     if(param1.x == 3)
                     {
                        if(this.getCurAddEffect(BaseAddEffect.ROLE5LOONGSWORD))
                        {
                           if(Math.random() <= 0.25)
                           {
                              this.dolxjfeijian();
                           }
                        }
                        if(this._JRJL)
                        {
                           this._JRJL.addMcTime(300);
                           if(this._JRJL.canShoot())
                           {
                              this._JRJL.toShoot();
                           }
                        }
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc6_.x = this.x - 72;
                        }
                        else
                        {
                           _loc6_.x = this.x + 72;
                        }
                        _loc6_.y = this.y + 6;
                        this.doSwordHit12_2(this.getBBDC().getDirect(),_loc6_);
                     }
                  }
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     if(param1.x == 4)
                     {
                        if(this.getCurAddEffect(BaseAddEffect.ROLE5LOONGSWORD))
                        {
                           if(Math.random() <= 0.25)
                           {
                              this.dolxjfeijian();
                           }
                        }
                        if(this._JRJL)
                        {
                           this._JRJL.addMcTime(300);
                           if(this._JRJL.canShoot())
                           {
                              this._JRJL.toShoot();
                           }
                        }
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc6_.x = this.x - 72;
                        }
                        else
                        {
                           _loc6_.x = this.x + 72;
                        }
                        _loc6_.y = this.y + 6;
                        this.doSwordHit12_3(this.getBBDC().getDirect(),_loc6_);
                     }
                  }
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     if(param1.x == 5)
                     {
                        if(this.getCurAddEffect(BaseAddEffect.ROLE5LOONGSWORD))
                        {
                           if(Math.random() <= 0.25)
                           {
                              this.dolxjfeijian();
                           }
                        }
                        if(this._JRJL)
                        {
                           this._JRJL.addMcTime(300);
                           if(this._JRJL.canShoot())
                           {
                              this._JRJL.toShoot();
                           }
                        }
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc6_.x = this.x - 72;
                        }
                        else
                        {
                           _loc6_.x = this.x + 72;
                        }
                        _loc6_.y = this.y + 6;
                        this.doSwordHit12_4(this.getBBDC().getDirect(),_loc6_);
                     }
                  }
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     if(param1.x == 6)
                     {
                        if(this.getCurAddEffect(BaseAddEffect.ROLE5LOONGSWORD))
                        {
                           if(Math.random() <= 0.25)
                           {
                              this.dolxjfeijian();
                           }
                        }
                        if(this._JRJL)
                        {
                           this._JRJL.addMcTime(300);
                           if(this._JRJL.canShoot())
                           {
                              this._JRJL.toShoot();
                           }
                        }
                        if(this.bbdc.getDirect() == 0)
                        {
                           _loc6_.x = this.x - 72;
                        }
                        else
                        {
                           _loc6_.x = this.x + 72;
                        }
                        _loc6_.y = this.y + 6;
                        this.doSwordHit12_5(this.getBBDC().getDirect(),_loc6_);
                     }
                  }
               }
         }
      }
      
      private function doLoongHit123(param1:uint, param2:Point, param3:*, param4:String) : void
      {
         var hit1_1:EnemyMoveBullet = new EnemyMoveBullet("swordhit" + String(param3) + "_1");
         hit1_1.x = param2.x;
         hit1_1.y = param2.y;
         hit1_1.setRole(this);
         hit1_1.setDirect(param1);
         hit1_1.setAction(param4 + "_1");
         hit1_1.setSpeed(8 * (param1 == 1 ? Number(1) : Number(-1)),0);
         hit1_1.setAddSpeed(2.4 * (param1 == 1 ? Number(1) : Number(-1)),0);
         hit1_1.setDistance(700);
         gc.gameSence.addChild(hit1_1);
         this.magicBulletArray.push(hit1_1);
      }
      
      private function doSingleHit1(param1:uint, param2:Point, param3:*, param4:String) : void
      {
         var _loc5_:FollowBaseObjectBullet = null;
         if(this.getCurAddEffect(BaseAddEffect.ROLE5LOONGSWORD))
         {
            _loc5_ = new FollowBaseObjectBullet("swordhit" + String(param3) + "_1");
         }
         else
         {
            _loc5_ = new FollowBaseObjectBullet("swordhit" + String(param3));
         }
         _loc5_.x = param2.x;
         _loc5_.y = param2.y;
         _loc5_.setRole(this);
         _loc5_.setDirect(param1);
         _loc5_.setAction(param4);
         gc.gameSence.addChild(_loc5_);
         this.magicBulletArray.push(_loc5_);
      }
      
      private function doHit6(param1:uint, param2:Point, param3:*, param4:String) : void
      {
         var _loc5_:FollowBaseObjectBullet = null;
         _loc5_ = new FollowBaseObjectBullet("sword_xlc");
         if(this._invert)
         {
         }
         _loc5_.x = param2.x;
         _loc5_.y = param2.y;
         _loc5_.setRole(this);
         _loc5_.setDirect(param1);
         _loc5_.setAction(param4);
         gc.gameSence.addChild(_loc5_);
         this.magicBulletArray.push(_loc5_);
      }
      
      private function doHit7(param1:uint, param2:Point, param3:*, param4:String) : void
      {
         var _loc5_:EnemyMoveBullet = null;
         _loc5_ = new EnemyMoveBullet("sword_lxuanj1");
         if(this._invert)
         {
         }
         _loc5_.x = param2.x;
         _loc5_.y = param2.y - 120;
         _loc5_.setRole(this);
         _loc5_.setSpeed(36 * (param1 == 1 ? Number(1) : Number(-1)),0);
         _loc5_.setDistance(999);
         _loc5_.setDirect(param1);
         _loc5_.setAction(param4);
         gc.gameSence.addChild(_loc5_);
         this.magicBulletArray.push(_loc5_);
      }
      
      private function doHit8(param1:uint, param2:Point, param3:*, param4:String) : void
      {
         var _loc5_:EnemyMoveBullet = null;
         _loc5_ = new EnemyMoveBullet("sword_lxuanj2");
         if(this._invert)
         {
         }
         _loc5_.x = param2.x;
         _loc5_.y = param2.y - 120;
         _loc5_.setRole(this);
         _loc5_.setSpeed(36 * (param1 == 1 ? Number(-1) : Number(1)),0);
         _loc5_.setDistance(999);
         _loc5_.setDirect(param1);
         _loc5_.setAction(param4);
         gc.gameSence.addChild(_loc5_);
         this.magicBulletArray.push(_loc5_);
      }
      
      private function doHit10(param1:uint, param2:Point) : void
      {
         var _loc3_:BaseObject = null;
         var _loc4_:BaseObject = null;
         var _loc5_:Number = 36000;
         var _loc6_:uint = uint(gc.pWorld.monsterArray.length);
         if(_loc6_ != 0)
         {
            if(_loc6_ > this.huoyan)
            {
               _loc4_ = gc.pWorld.monsterArray[this.huoyan] as BaseObject;
               if(this.getBBDC().getDirect() == 0)
               {
                  if(_loc4_.x >= this.x)
                  {
                     _loc3_ = null;
                  }
                  else if(_loc5_ > AUtils.GetDisBetweenTwoObj(this,_loc4_))
                  {
                     _loc5_ = AUtils.GetDisBetweenTwoObj(this,_loc4_);
                     _loc3_ = _loc4_;
                  }
               }
               if(this.getBBDC().getDirect() != 0)
               {
                  if(_loc4_.x <= this.x)
                  {
                     _loc3_ = null;
                  }
                  else if(_loc5_ > AUtils.GetDisBetweenTwoObj(this,_loc4_))
                  {
                     _loc5_ = AUtils.GetDisBetweenTwoObj(this,_loc4_);
                     _loc3_ = _loc4_;
                  }
               }
               this.huoyan += 1;
            }
            else
            {
               this.huoyan = 0;
               _loc4_ = gc.pWorld.monsterArray[this.huoyan] as BaseObject;
               if(this.getBBDC().getDirect() == 0)
               {
                  if(_loc4_.x >= this.x)
                  {
                     _loc3_ = null;
                  }
                  else if(_loc5_ > AUtils.GetDisBetweenTwoObj(this,_loc4_))
                  {
                     _loc5_ = AUtils.GetDisBetweenTwoObj(this,_loc4_);
                     _loc3_ = _loc4_;
                  }
               }
               if(this.getBBDC().getDirect() != 0)
               {
                  if(_loc4_.x <= this.x)
                  {
                     _loc3_ = null;
                  }
                  else if(_loc5_ > AUtils.GetDisBetweenTwoObj(this,_loc4_))
                  {
                     _loc5_ = AUtils.GetDisBetweenTwoObj(this,_loc4_);
                     _loc3_ = _loc4_;
                  }
               }
            }
            if(_loc3_)
            {
               if(this.getBBDC().getDirect() == 0)
               {
                  param2.x = _loc3_.x - 208;
               }
               else
               {
                  param2.x = _loc3_.x + 208;
               }
               param2.y = _loc3_.y - 500 + 35;
            }
         }
         var _loc7_:SpecialEffectBullet = null;
         _loc7_ = new SpecialEffectBullet("sword_xkjz");
         if(this._invert)
         {
         }
         _loc7_.x = param2.x;
         _loc7_.y = param2.y;
         _loc7_.setRole(this);
         _loc7_.setDirect(param1);
         _loc7_.setAction("hit10");
         gc.gameSence.addChild(_loc7_);
         this.magicBulletArray.push(_loc7_);
      }
      
      private function doSwordHit7_1(param1:uint, param2:Point) : void
      {
         var _loc3_:FollowBaseObjectBullet = null;
         this._skill2_1 = false;
         if(this.getCurAddEffect(BaseAddEffect.ROLE5LOONGSWORD))
         {
            _loc3_ = new FollowBaseObjectBullet("swordqhskill2_1");
         }
         else
         {
            _loc3_ = new FollowBaseObjectBullet("swordskill2_1");
         }
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit24_1");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doSwordHit7_2(param1:uint, param2:Point) : void
      {
         this._skill2_2 = new FollowBaseObjectBullet("swordskill2_2");
         this._skill2_2.x = param2.x;
         this._skill2_2.y = param2.y;
         this._skill2_2.setRole(this);
         this._skill2_2.setDirect(param1);
         this._skill2_2.setDestroyWhenLastFrame(false);
         this._skill2_2.setAction("hit24_2");
         gc.gameSence.addChild(this._skill2_2);
         this.magicBulletArray.push(this._skill2_2);
      }
      
      private function doSwordHit7_3(param1:uint, param2:Point) : void
      {
         this.setAction("wait");
         this._skill2_1 = true;
         if(this._skill2_2)
         {
            this._skill2_2.destroy();
            this._skill2_2 = null;
         }
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("swordskill2_3");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit24_3");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doSwordHit8_1(param1:uint, param2:Point) : void
      {
         this._skill3_1 = new FollowBaseObjectBullet("swordskill3_1");
         this._skill3_1.x = param2.x;
         this._skill3_1.y = param2.y;
         this._skill3_1.setRole(this);
         this._skill3_1.setDirect(param1);
         this._skill3_1.setDisable();
         this._skill3_1.setDestroyWhenLastFrame(false);
         this._skill3_1.setAction("hit25_1");
         gc.gameSence.addChild(this._skill3_1);
         this.magicBulletArray.push(this._skill3_1);
      }
      
      private function doSwordHit8_2(param1:uint, param2:Point) : void
      {
         var _loc4_:EnemyMoveBullet = null;
         if(this._skill3_1)
         {
            this._skill3_1.destroy();
            this._skill3_1 = null;
         }
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("swordskill3_2");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit25_2");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
         if(this.getCurAddEffect(BaseAddEffect.ROLE5LOONGSWORD))
         {
            _loc4_ = new EnemyMoveBullet("jianqi");
            if(param1 == 0)
            {
               _loc4_.x = param2.x + 16;
            }
            else
            {
               _loc4_.x = param2.x - 16;
            }
            _loc4_.y = param2.y + 10;
            _loc4_.setRole(this);
            _loc4_.setDirect(param1);
            _loc4_.setAction("hit25_3");
            _loc4_.setDestroyWhenLastFrame(false);
            _loc4_.setSpeed(34 * (param1 == 1 ? Number(1) : Number(-1)),0);
            _loc4_.setDistance(999);
            gc.gameSence.addChild(_loc4_);
            this.magicBulletArray.push(_loc4_);
         }
      }
      
      public function dolxjfeijian() : void
      {
      }
      
      public function addSkill5_3() : void
      {
         if(this.getCurAddEffect(BaseAddEffect.ROLE5LOONGSWORD))
         {
            if(Math.random() <= 0.25)
            {
               this.dolxjfeijian();
            }
         }
         var _loc1_:EnemyMoveBullet = new EnemyMoveBullet("swordskill5_2");
         if(this.bbdc.getDirect() == 0)
         {
            _loc1_.x = this.x + 42.2;
         }
         else
         {
            _loc1_.x = this.x - 42.2;
         }
         _loc1_.y = this.y + 6;
         _loc1_.setRole(this);
         _loc1_.setDirect(this.getBBDC().getDirect());
         _loc1_.setDestroyWhenLastFrame(false);
         _loc1_.setSpeed(22 * (this.getBBDC().getDirect() == 1 ? Number(1) : Number(-1)),0);
         _loc1_.setDistance(2000);
         _loc1_.setAction("hit27_3");
         gc.gameSence.addChild(_loc1_);
         this.magicBulletArray.push(_loc1_);
      }
      
      private function doSwordHit10_2(param1:uint, param2:Point) : void
      {
         this._skill3_1 = new FollowBaseObjectBullet("swordskill5_1");
         this._skill3_1.x = param2.x;
         this._skill3_1.y = param2.y;
         this._skill3_1.setRole(this);
         this._skill3_1.setDirect(param1);
         this._skill3_1.setDisable();
         this._skill3_1.setAction("hit27_2");
         gc.gameSence.addChild(this._skill3_1);
         this.magicBulletArray.push(this._skill3_1);
      }
      
      private function doRunHit(param1:uint, param2:Point) : void
      {
         var _loc3_:FollowBaseObjectBullet = null;
         if(this.isSword == false)
         {
            _loc3_ = new FollowBaseObjectBullet("Role5runattack");
            if(this._invert)
            {
            }
            _loc3_.x = param2.x;
            _loc3_.y = param2.y;
            _loc3_.setRole(this);
            _loc3_.setDirect(param1);
            _loc3_.setAction("hit114");
            gc.gameSence.addChild(_loc3_);
            this.magicBulletArray.push(_loc3_);
         }
         else
         {
            if(this.getCurAddEffect(BaseAddEffect.ROLE5LOONGSWORD))
            {
               _loc3_ = new FollowBaseObjectBullet("swordhit6_1");
               _loc3_.setRole(this);
               _loc3_.setAction("hit115_1");
            }
            else
            {
               _loc3_ = new FollowBaseObjectBullet("swordhit6");
               _loc3_.setRole(this);
               _loc3_.setAction("hit115");
            }
            _loc3_.x = param2.x;
            _loc3_.y = param2.y;
            _loc3_.setDirect(param1);
            gc.gameSence.addChild(_loc3_);
            this.magicBulletArray.push(_loc3_);
         }
      }
      
      private function doSwordHit9(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role5_skill4");
         this._skill4 = new FollowBaseObjectBullet("swordskill4");
         this.curAddEffect.add([{
            "name":BaseAddEffect.ROLE5LOONGSWORD,
            "time":gc.frameClips * this.skill4time[this.player.returnSkillLevelBySkillName("lxj") - 1]
         }]);
         this._skill4.x = param2.x;
         this._skill4.y = param2.y;
         this._skill4.setRole(this);
         this._skill4.setDisable();
         this._skill4.setDirect(param1);
         this._skill4.setAction("hit26");
         gc.gameSence.addChild(this._skill4);
         this.magicBulletArray.push(this._skill4);
      }
      
      private function doSwordHit11(param1:uint, param2:Point) : void
      {
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("sword_jrjlsf");
         this.curAddEffect.add([{
            "name":BaseAddEffect.ROLE5JRJL,
            "time":gc.frameClips * this.skill4time[this.player.returnSkillLevelBySkillName("lxj") - 1]
         }]);
         if(this._JRJL)
         {
            this._JRJL.addMcTime(1998);
         }
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDisable();
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit26");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      public function jrjljq() : void
      {
         trace("jjj");
         var _loc1_:EnemyMoveBullet = new EnemyMoveBullet("sword_jrjljq");
         if(this.bbdc.getDirect() == 0)
         {
            _loc1_.x = this.x + 42.2;
         }
         else
         {
            _loc1_.x = this.x - 42.2;
         }
         _loc1_.y = this.y - 27;
         _loc1_.setRole(this);
         _loc1_.setDirect(this.getBBDC().getDirect());
         _loc1_.setSpeed(60 * (this.getBBDC().getDirect() == 1 ? Number(1) : Number(-1)),0);
         _loc1_.setDistance(2000);
         _loc1_.setAction("hit30");
         gc.gameSence.addChild(_loc1_);
         this.magicBulletArray.push(_loc1_);
      }
      
      private function doSwordHit12_1(param1:uint, param2:Point) : void
      {
         var _loc3_:SpecialEffectBullet = null;
         if(this.getCurAddEffect(BaseAddEffect.ROLE5LOONGSWORD))
         {
            _loc3_ = new SpecialEffectBullet("sword_mlsz1_1");
         }
         else
         {
            _loc3_ = new SpecialEffectBullet("sword_mlsz1");
         }
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit29");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doSwordHit12_2(param1:uint, param2:Point) : void
      {
         var _loc3_:SpecialEffectBullet = null;
         if(this.getCurAddEffect(BaseAddEffect.ROLE5LOONGSWORD))
         {
            _loc3_ = new SpecialEffectBullet("sword_mlsz2_1");
         }
         else
         {
            _loc3_ = new SpecialEffectBullet("sword_mlsz2");
         }
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit29");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doSwordHit12_3(param1:uint, param2:Point) : void
      {
         var _loc3_:SpecialEffectBullet = null;
         if(this.getCurAddEffect(BaseAddEffect.ROLE5LOONGSWORD))
         {
            _loc3_ = new SpecialEffectBullet("sword_mlsz3_1");
         }
         else
         {
            _loc3_ = new SpecialEffectBullet("sword_mlsz3");
         }
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit29");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doSwordHit12_4(param1:uint, param2:Point) : void
      {
         var _loc3_:SpecialEffectBullet = null;
         if(this.getCurAddEffect(BaseAddEffect.ROLE5LOONGSWORD))
         {
            _loc3_ = new SpecialEffectBullet("sword_mlsz4_1");
         }
         else
         {
            _loc3_ = new SpecialEffectBullet("sword_mlsz4");
         }
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit29");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doSwordHit12_5(param1:uint, param2:Point) : void
      {
         var _loc3_:SpecialEffectBullet = null;
         if(this.getCurAddEffect(BaseAddEffect.ROLE5LOONGSWORD))
         {
            _loc3_ = new SpecialEffectBullet("sword_mlsz5_1");
         }
         else
         {
            _loc3_ = new SpecialEffectBullet("sword_mlsz5");
         }
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit29");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit9(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role5_skill4");
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role5Bullet9");
         if(this._invert)
         {
         }
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDisable();
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit9");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit10_1(param1:uint, param2:Point) : void
      {
         this.lmj1 = new FollowBaseObjectBullet("Role5Bullet10_1");
         if(this._invert)
         {
         }
         this.lmj1.x = param2.x;
         this.lmj1.y = param2.y;
         this.lmj1.setRole(this);
         this.lmj1.setDirect(param1);
         this.lmj1.setAction("hit10_1");
         gc.gameSence.addChild(this.lmj1);
         this.magicBulletArray.push(this.lmj1);
      }
      
      private function doHit10_2(param1:uint, param2:Point) : void
      {
         this.lmj2 = new FollowBaseObjectBullet("Role5Bullet10_2");
         if(this._invert)
         {
         }
         this.lmj2.x = param2.x;
         this.lmj2.y = param2.y;
         this.lmj2.setRole(this);
         this.lmj2.setDirect(param1);
         this.lmj2.setAction("hit10_2");
         gc.gameSence.addChild(this.lmj2);
         this.magicBulletArray.push(this.lmj2);
      }
      
      private function doHit10_3(param1:uint, param2:Point) : void
      {
         this.lmj3 = new EnemyMoveBullet("Role5Bullet10_3");
         if(this._invert)
         {
         }
         this.resetSkill5_3();
         this.lmj3.x = param2.x;
         this.lmj3.y = param2.y;
         this.lmj3.setRole(this);
         this.lmj3.setDirect(param1);
         this.lmj3.setAction("hit10_3");
         this.lmj3.setDestroyWhenLastFrame(false);
         this.lmj3.setSpeed(30 * (param1 == 1 ? Number(1) : Number(-1)),0);
         this.lmj3.setDistance(1000);
         gc.gameSence.addChild(this.lmj3);
         this.magicBulletArray.push(this.lmj3);
      }
      
      private function doHit10_4(param1:uint) : void
      {
         this.canuselmj = false;
         this.lmjly2caltime = 0;
         this.lmjly1 = new SpecialEffectBullet("Role5lmjly1");
         if(this._invert)
         {
         }
         this.lmjly1.x = this.x;
         this.lmjly1.y = this.y + 52;
         this.lmjly1.setcurFrame(this.lmjly1frame);
         this.lmjly1.setRole(this);
         this.lmjly1.setDirect(param1);
         this.lmjly1.setAction("hit10_4");
         this.lmjlyDirect = param1;
         gc.gameSence.addChild(this.lmjly1);
         this.magicBulletArray.push(this.lmjly1);
      }
      
      private function checkifdohit10_5() : void
      {
         if(this.lmjly1)
         {
            if(this.lmjly1.imgMc)
            {
               if(this.lmjly1.imgMc.currentFrame >= 59)
               {
                  this.doHit10_5(this.lmjlyDirect);
               }
            }
         }
      }
      
      private function checkifdofhf2ly1() : void
      {
         if(this.fhf1ly1)
         {
            if(this.fhf1ly1)
            {
               if(this.fhf1ly1.imgMc.currentFrame >= 9)
               {
                  if(this.fhflyDirect == 0)
                  {
                     this.fhflyDirect = 1;
                  }
                  else
                  {
                     this.fhflyDirect = 0;
                  }
                  this.dofhf2ly1(this.fhflyDirect);
               }
            }
         }
      }
      
      private function checkifdofhf2ly2() : void
      {
         if(this.fhf1ly2)
         {
            if(this.fhf1ly2.imgMc.currentFrame >= 10)
            {
               if(this.fhflyDirect == 0)
               {
                  this.fhflyDirect = 1;
               }
               else
               {
                  this.fhflyDirect = 0;
               }
               this.dofhf2ly2(this.fhflyDirect);
            }
         }
      }
      
      private function checkifcanusezxc() : void
      {
         if(this.zxcly2)
         {
            if(this.zxcly2.imgMc)
            {
               if(this.zxcly2.imgMc.currentFrame >= 33)
               {
                  this.zxcly2frame = 0;
                  this.canusezxc = true;
               }
            }
         }
         if(this.zxcly1)
         {
            if(this.zxcly1.imgMc)
            {
               if(this.zxcly1.imgMc.currentFrame >= 35)
               {
                  this.zxcly1frame = 0;
                  this.canusezxc = true;
               }
            }
         }
      }
      
      private function checkifcanusefhf() : void
      {
         if(this.fhf2ly2)
         {
            if(this.fhf2ly2.imgMc)
            {
               if(this.fhf2ly2.imgMc.currentFrame >= 29)
               {
                  this.fhf2ly2frame = 0;
                  this.canusefhf = true;
               }
            }
         }
         if(this.fhf2ly1)
         {
            if(this.fhf2ly1.imgMc)
            {
               if(this.fhf2ly1.imgMc.currentFrame >= 32)
               {
                  this.fhf2ly1frame = 0;
                  this.canusefhf = true;
               }
            }
         }
      }
      
      private function checkifcanuselmj() : void
      {
         if(this.lmjly2)
         {
            if(this.lmjly2.imgMc)
            {
               if(this.lmjly2.imgMc.currentFrame >= 26)
               {
                  this.lmjly2caltime = 0;
                  this.canuselmj = true;
               }
            }
         }
      }
      
      private function doHit10_5(param1:uint) : void
      {
         this.lmjly2 = new SpecialEffectBullet("Role5lmjly2");
         if(this._invert)
         {
         }
         this.lmjly2.x = this.lmjly1.x - 15;
         this.lmjly2.y = this.lmjly1.y + 3;
         this.lmjly2.setRole(this);
         this.lmjly2.setDirect(param1);
         this.lmjly2.setAction("hit10_5");
         gc.gameSence.addChild(this.lmjly2);
         this.magicBulletArray.push(this.lmjly2);
         if(this.curAddEffect.getBuffByName(BaseAddEffect.ROLE5HITADD))
         {
            this.doHit10_7(this.lmjlyDirect);
         }
      }
      
      private function doHit10_6(param1:uint) : void
      {
         this.lmjly2 = new SpecialEffectBullet("Role5lmjly2");
         if(this._invert)
         {
         }
         this.lmjly2.x = this.x;
         this.lmjly2.y = this.y + 47;
         this.lmjly2.setcurFrame(this.lmjly2frame);
         this.lmjly2.setRole(this);
         this.lmjly2.setDirect(param1);
         this.lmjlyDirect = param1;
         this.lmjly2.setAction("hit10_5");
         gc.gameSence.addChild(this.lmjly2);
         this.magicBulletArray.push(this.lmjly2);
         if(this.curAddEffect.getBuffByName(BaseAddEffect.ROLE5HITADD))
         {
            this.doHit10_7(this.lmjlyDirect);
         }
      }
      
      private function doHit10_7(param1:uint) : void
      {
         var _loc3_:EnemyMoveBullet = new EnemyMoveBullet("Role5Bullet10_3");
         if(this._invert)
         {
         }
         this.resetSkill5_3();
         _loc3_.x = this.lmjly2.x;
         _loc3_.y = this.lmjly2.y + 5;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit10_3");
         _loc3_.setDestroyWhenLastFrame(false);
         _loc3_.setSpeed(30 * (param1 == 1 ? Number(1) : Number(-1)),0);
         _loc3_.setDistance(1000);
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function resetSkill5_3() : *
      {
         this.attackBackInfoDict["hit10_3"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[-8,-2],
            "attackInterval":6,
            "attackKind":"physics",
            "addEffect":[{
               "name":BaseAddEffect.ROLE5SKILL5,
               "time":gc.frameClips * 5,
               "isinvert":this._invert
            }]
         };
      }
      
      private function doNormalhitEscape(param1:Array) : void
      {
         var _loc2_:int = int(param1[1]);
         trace(_loc2_);
         this.doRole5cloneEf2(this.getBBDC().getDirect());
         this.x = param1[0];
         if(_loc2_ >= 450)
         {
            _loc2_ = 450;
         }
         this.y = _loc2_;
         gc.vControllor.setAutoCamera();
         this.resetRole5skill5Buff();
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role5escapeEffect");
         if(this._invert)
         {
         }
         _loc3_.x = this.x;
         _loc3_.y = this.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit13");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doRole5cloneEf2(param1:int) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Role5cloneEf2");
         if(this._invert)
         {
         }
         _loc2_.x = this.x;
         _loc2_.y = this.y + 58;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit12");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function IsSignedMonInView() : Array
      {
         var _loc1_:uint = 0;
         var _loc2_:BaseObject = null;
         var _loc3_:uint = 0;
         var _loc4_:Number = 1;
         var _loc5_:Array = [];
         if(gc.isSingleGame())
         {
            _loc1_ = gc.pWorld.monsterArray.length;
            _loc3_ = 0;
            while(_loc3_ < _loc1_)
            {
               _loc2_ = gc.pWorld.monsterArray[_loc3_] as BaseMonster;
               if(_loc2_.getCurAddEffect(BaseAddEffect.ROLE5SKILL5) && _loc2_.curAddEffect.getBuffByName(BaseAddEffect.ROLE5SKILL5).time > 0 && BaseMonster(_loc2_).getHp() / BaseMonster(_loc2_).getSHp() <= _loc4_)
               {
                  _loc4_ = BaseMonster(_loc2_).getHp() / BaseMonster(_loc2_).getSHp();
                  _loc5_ = [_loc2_.x,_loc2_.y];
               }
               _loc3_++;
            }
         }
         return _loc5_;
      }
      
      private function resetRole5skill5Buff() : *
      {
         var _loc1_:uint = 0;
         var _loc2_:BaseMonster = null;
         var _loc3_:uint = 0;
         if(gc.isSingleGame())
         {
            _loc1_ = gc.pWorld.monsterArray.length;
            _loc3_ = 0;
            while(_loc3_ < _loc1_)
            {
               _loc2_ = gc.pWorld.monsterArray[_loc3_] as BaseMonster;
               if(_loc2_.getCurAddEffect(BaseAddEffect.ROLE5SKILL5))
               {
                  _loc2_.curAddEffect.add([{
                     "name":BaseAddEffect.ROLE5SKILL5,
                     "time":0
                  }]);
               }
               _loc3_++;
            }
         }
      }
      
      override public function setOtherAttack(param1:String, param2:uint, param3:Point, param4:Array = null, param5:uint = 0) : void
      {
         switch(param1)
         {
            case "hit1":
               this.doHit1(param2,param3);
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
            case "hit7":
               this.doHit7(param2,param3);
               break;
            case "hit8":
               this.doHit8(param2,param3);
               break;
            case "hit9":
               this.doHit9(param2,param3);
               break;
            case "hit10_1":
               this.doHit10_1(param2,param3);
               break;
            case "hit10_2":
               this.doHit10_2(param2,param3);
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
            case "Role2Hit7":
               this.beAttackByRole2Hit7(param3);
               break;
            case "hit114":
               this.doRunHit(param2,param3);
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
                     "time":gc.frameClips * 2
                  }]);
               }
         }
      }
      
      override protected function exitFrameFunc(param1:Point) : void
      {
      }
      
      override protected function myKeyDown(param1:String) : *
      {
         var slev:int = 0;
         var needMp:uint = 0;
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
               if(this._JRJL)
               {
                  if(this._JRJL.canShoot())
                  {
                     this._JRJL.toShoot();
                  }
               }
               cannextaction = false;
         }
         if(cannextaction)
         {
            switch(keyStr)
            {
               case "0010":
                  if((this.isAttacking() || this.isBeAttacking()) && this.curAction != "hit29")
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
                  cannextaction = false;
                  break;
               case "0101":
                  if(this.isAttacking() || this.isBeAttacking())
                  {
                     return;
                  }
                  if(this.getPlayer())
                  {
                     if(this.getPlayer().findSkillIsInTheSkillAry("yyb"))
                     {
                        slev = int(this.player.returnSkillLevelBySkillName("yyb") - 1);
                        needMp = this.consumeMP[slev] * 0.55;
                        if(this.roleProperies.getMMP() >= needMp)
                        {
                           if(this.isSword == false)
                           {
                              this._invert = !this._invert;
                              this.skill_yyb(needMp);
                              break;
                           }
                           this._invert = !this._invert;
                           this.skill_yyb(needMp);
                        }
                     }
                  }
                  break;
               case "0001":
                  if(this.checkTransferDoor())
                  {
                     gc.pWorld.getBaseLevelListener().keyBoardDownForW(this);
                     this.canusezxc = true;
                     this.canusefhf = true;
                     this.canuselmj = true;
                     if(gc.curStage == 8 && gc.curLevel == 1)
                     {
                        if(StageListener81.getInstance().getCurLevel() == 6)
                        {
                           this.gc.llbt6 = true;
                        }
                        if(StageListener81.getInstance().getCurLevel() == 12)
                        {
                           this.gc.llbt12 = true;
                        }
                        if(StageListener81.getInstance().getCurLevel() == 18)
                        {
                           this.gc.llbt18 = true;
                        }
                        if(StageListener81.getInstance().getCurLevel() == 24)
                        {
                           this.gc.llbt24 = true;
                        }
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
                     else
                     {
                        MainGame.getInstance().levelClear();
                     }
                  }
            }
         }
      }
      
      private function skill_xlc(param1:uint) : void
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
         this.timers = 15;
         this.hitNum = 0;
         this.roleProperies.setMMP(this.roleProperies.getMMP() - param1);
      }
      
      public function dofhf1ly1() : void
      {
         this.canusefhf = false;
         this.fhf1ly1 = new SpecialEffectBullet("fhf1ly1_spear");
         if(this._invert)
         {
         }
         if(this.bbdc.getDirect() == 0)
         {
            this.fhf1ly1.x = this.x - 68;
         }
         else
         {
            this.fhf1ly1.x = this.x + 68;
         }
         this.fhf1ly1.y = this.y + 44;
         this.fhf1ly1.setcurFrame(this.fhf1ly1frame);
         this.fhf1ly1.setRole(this);
         this.fhf1ly1.setDirect(this.bbdc.getDirect());
         this.fhflyDirect = this.bbdc.getDirect();
         this.fhf1ly1.setAction("hit7_1");
         gc.gameSence.addChild(this.fhf1ly1);
         this.magicBulletArray.push(this.fhf1ly1);
         this.fhf1ly1frame = 0;
      }
      
      public function dofhf1ly2() : void
      {
         this.canusefhf = false;
         this.fhf1ly2 = new SpecialEffectBullet("fhf1ly2_spear");
         if(this._invert)
         {
         }
         if(this.bbdc.getDirect() == 0)
         {
            this.fhf1ly2.x = this.x - 68;
         }
         else
         {
            this.fhf1ly2.x = this.x + 68;
         }
         this.fhf1ly2.y = this.y + 44;
         this.fhf1ly2.setcurFrame(this.fhf1ly2frame);
         this.fhf1ly2.setRole(this);
         this.fhf1ly2.setDirect(this.bbdc.getDirect());
         this.fhflyDirect = this.bbdc.getDirect();
         this.fhf1ly2.setAction("hit7_1");
         gc.gameSence.addChild(this.fhf1ly2);
         this.magicBulletArray.push(this.fhf1ly2);
         this.fhf1ly2frame = 0;
      }
      
      public function dofhf2ly1() : void
      {
         this.fhfnormal = false;
         this.canusefhf = false;
         this.fhf2ly1 = new SpecialEffectBullet("fhf2ly1_spear");
         if(this._invert)
         {
         }
         if(this.bbdc.getDirect() == 0)
         {
            this.fhf2ly1.x = this.x + 28;
         }
         else
         {
            this.fhf2ly1.x = this.x - 28;
         }
         this.fhf2ly1.y = this.y + 30;
         this.fhf2ly1.setcurFrame(this.fhf2ly1frame);
         if(!this.fhf2ly1canhit)
         {
            this.fhf2ly1.setDisable();
         }
         this.fhf2ly1.setRole(this);
         if(this.fhflyDirect == 0)
         {
            this.fhf2ly1.setDirect(1);
         }
         else
         {
            this.fhf2ly1.setDirect(0);
         }
         this.fhf2ly1.setAction("hit7_2");
         gc.gameSence.addChild(this.fhf2ly1);
         this.magicBulletArray.push(this.fhf2ly1);
         this.fhf2ly1frame = 0;
         this.fhf2ly1canhit = true;
      }
      
      public function dofhf2ly2() : void
      {
         this.fhfnormal = false;
         this.canusefhf = false;
         this.fhf2ly2 = new SpecialEffectBullet("fhf2ly2_spear");
         if(this._invert)
         {
         }
         if(this.bbdc.getDirect() == 0)
         {
            this.fhf2ly2.x = this.x + 28;
         }
         else
         {
            this.fhf2ly2.x = this.x - 28;
         }
         this.fhf2ly2.y = this.y + 30;
         this.fhf2ly2.setcurFrame(this.fhf2ly2frame);
         if(!this.fhf2ly2canhit)
         {
            this.fhf2ly2.setDisable();
         }
         this.fhf2ly2.setRole(this);
         if(this.fhflyDirect == 0)
         {
            this.fhf2ly2.setDirect(1);
         }
         else
         {
            this.fhf2ly2.setDirect(0);
         }
         this.fhf2ly2.setAction("hit7_2");
         gc.gameSence.addChild(this.fhf2ly2);
         this.magicBulletArray.push(this.fhf2ly2);
         this.fhf2ly2frame = 0;
         this.fhf2ly2canhit = true;
      }
      
      public function _dofhf2ly1() : void
      {
         this.fhfnormal = false;
         this.canusefhf = false;
         this.fhf2ly1 = new SpecialEffectBullet("fhf2ly1_spear");
         if(this._invert)
         {
         }
         if(this.bbdc.getDirect() == 0)
         {
            this.fhf2ly1.x = this.x + 28;
         }
         else
         {
            this.fhf2ly1.x = this.x - 28;
         }
         this.fhf2ly1.y = this.y + 30;
         this.fhf2ly1.setcurFrame(this.fhf2ly1frame);
         if(!this.fhf2ly1canhit)
         {
            this.fhf2ly1.setDisable();
         }
         this.fhf2ly1.setRole(this);
         this.fhf2ly1.setDirect(this.bbdc.getDirect());
         this.fhf2ly1.setAction("hit7_2");
         gc.gameSence.addChild(this.fhf2ly1);
         this.magicBulletArray.push(this.fhf2ly1);
         this.fhf2ly1frame = 0;
         this.fhf2ly1canhit = true;
      }
      
      public function _dofhf2ly2() : void
      {
         this.fhfnormal = false;
         this.canusefhf = false;
         this.fhf2ly2 = new SpecialEffectBullet("fhf2ly2_spear");
         if(this._invert)
         {
         }
         if(this.bbdc.getDirect() == 0)
         {
            this.fhf2ly2.x = this.x + 28;
         }
         else
         {
            this.fhf2ly2.x = this.x - 28;
         }
         this.fhf2ly2.y = this.y + 30;
         this.fhf2ly2.setcurFrame(this.fhf2ly2frame);
         if(!this.fhf2ly2canhit)
         {
            this.fhf2ly2.setDisable();
         }
         this.fhf2ly2.setRole(this);
         this.fhf2ly2.setDirect(this.bbdc.getDirect());
         this.fhf2ly2.setAction("hit7_2");
         gc.gameSence.addChild(this.fhf2ly2);
         this.magicBulletArray.push(this.fhf2ly2);
         this.fhf2ly2frame = 0;
         this.fhf2ly2canhit = true;
      }
      
      private function skill_lxuanj(param1:uint) : void
      {
         if(this.isAttacking() || this.isBeAttacking())
         {
            return;
         }
         if(this.roleProperies.getMMP() >= param1)
         {
            this.setAction("hit7");
            this.lastHit = "hit7";
            this.newAttackId();
            this.timers = 29;
            this.hitNum = 0;
            this.roleProperies.setMMP(this.roleProperies.getMMP() - param1);
         }
      }
      
      public function doHit8ly1() : void
      {
         this.canusezxc = false;
         this.zxcly1 = new SpecialEffectBullet("zxcly1_spear");
         if(this._invert)
         {
         }
         if(this.bbdc.getDirect() == 0)
         {
            this.zxcly1.x = this.x - 138;
         }
         else
         {
            this.zxcly1.x = this.x + 138;
         }
         this.zxcly1.y = this.y + 45;
         this.zxcly1.setcurFrame(this.zxcly1frame);
         this.zxcly1.setRole(this);
         this.zxcly1.setDirect(this.bbdc.getDirect());
         this.zxcly1.setAction("hit8");
         gc.gameSence.addChild(this.zxcly1);
         this.magicBulletArray.push(this.zxcly1);
         this.zxcly1frame = 0;
      }
      
      public function doHit8ly2() : void
      {
         this.canusezxc = false;
         this.zxcly2 = new SpecialEffectBullet("zxcly2_spear");
         if(this._invert)
         {
         }
         if(this.bbdc.getDirect() == 0)
         {
            this.zxcly2.x = this.x - 138;
         }
         else
         {
            this.zxcly2.x = this.x + 138;
         }
         this.zxcly2.y = this.y + 45;
         this.zxcly2.setcurFrame(this.zxcly2frame);
         this.zxcly2.setRole(this);
         this.zxcly2.setDirect(this.bbdc.getDirect());
         this.zxcly2.setAction("hit8");
         gc.gameSence.addChild(this.zxcly2);
         this.magicBulletArray.push(this.zxcly2);
         this.zxcly2frame = 0;
      }
      
      private function skill_xkjz(param1:uint) : void
      {
         if(this.isAttacking() || this.isBeAttacking())
         {
            return;
         }
         if(this.roleProperies.getMMP() >= param1)
         {
            this.setAction("hit10");
            this.lastHit = "hit10";
            this.newAttackId();
            this.timers = 24;
            this.hitNum = 0;
            this.roleProperies.setMMP(this.roleProperies.getMMP() - param1);
         }
      }
      
      private function skill_yyb(param1:uint) : void
      {
         if(this.roleProperies.getMMP() < param1)
         {
            return;
         }
         if(this.isAttacking() || this.isBeAttacking())
         {
            return;
         }
         this.curAddEffect.add([{
            "name":BaseAddEffect.ROLE5SKILL4,
            "time":gc.frameClips * this.skill4time[this.player.returnSkillLevelBySkillName("yyb") - 1]
         }]);
         this.setAction("hit9");
         this.lastHit = "hit9";
         this.newAttackId();
         this.timers = 8;
         this.hitNum = 0;
         this.roleProperies.setMMP(this.roleProperies.getMMP() - param1);
      }
      
      private function Lmjly1caltime() : void
      {
         this.lmjly1caltime = 0;
         while(this.lmjly1caltime < 59 * 24)
         {
            ++this.lmjly1caltime;
         }
      }
      
      private function Lmjly2caltime() : void
      {
         this.lmjly2caltime = 0;
         while(this.lmjly2caltime < 27 * 24)
         {
            ++this.lmjly2caltime;
         }
      }
      
      private function skill_tlj(param1:uint) : void
      {
         if(this.isAttacking() || this.isBeAttacking())
         {
            return;
         }
         if(this.roleProperies.getMMP() >= param1)
         {
            this.setAction("hit11");
            this.lastHit = "hit11";
            this.newAttackId();
            this.timers = 9;
            this.hitNum = 0;
            this.roleProperies.setMMP(this.roleProperies.getMMP() - param1);
         }
      }
      
      private function skill_xlj(param1:uint) : void
      {
         if(this.roleProperies.getMMP() < param1)
         {
            return;
         }
         if(this.isAttacking() || this.isBeAttacking())
         {
            return;
         }
         this.setAction("hit23");
         this.lastHit = "hit23";
         this.newAttackId();
         this.timers = 15;
         this.hitNum = 0;
         this.roleProperies.setMMP(this.roleProperies.getMMP() - param1);
      }
      
      private function skill_pkz(param1:uint) : void
      {
         if(this.roleProperies.getMMP() < param1)
         {
            return;
         }
         if(this.isAttacking() || this.isBeAttacking())
         {
            return;
         }
         this.setAction("hit24_1");
         this.lastHit = "hit24_1";
         this.newAttackId();
         this.timers = 15;
         this.hitNum = 0;
         this.roleProperies.setMMP(this.roleProperies.getMMP() - param1);
      }
      
      private function skill_nlj(param1:uint) : void
      {
         if(this.roleProperies.getMMP() < param1)
         {
            return;
         }
         if(this.isAttacking() || this.isBeAttacking())
         {
            return;
         }
         this._skill3extraHurt = 0;
         this.setAction("hit25_1");
         this.lastHit = "hit25_1";
         this.newAttackId();
         this.timers = 12;
         this.hitNum = 0;
         this.roleProperies.setMMP(this.roleProperies.getMMP() - param1);
      }
      
      public function releaseKey() : void
      {
         if(this._skill3_1)
         {
            this._skill3_1.destroy();
            this._skill3_1 = null;
         }
         this.setAction("hit25_2");
         this.lastHit = "hit25_2";
         this.newAttackId();
         this.timers = 2;
         this.hitNum = 0;
      }
      
      private function skill_lxj(param1:uint) : void
      {
         if(this.roleProperies.getMMP() < param1)
         {
            return;
         }
         if(this.isAttacking() || this.isBeAttacking())
         {
            return;
         }
         this.setAction("hit26");
         this.lastHit = "hit26";
         this.newAttackId();
         this.timers = 10;
         this.hitNum = 0;
         this.roleProperies.setMMP(this.roleProperies.getMMP() - param1);
      }
      
      private function skill_lysh(param1:uint) : void
      {
         if(this.isAttacking() || this.isBeAttacking())
         {
            return;
         }
         if(this._BLMskill5)
         {
            if(this._BLMskill5.canShoot())
            {
               this.toAttack();
               this._BLMskill5.toShoot();
            }
            else if(this._BLMskill5.Empty)
            {
               this.getRebuild(param1);
            }
         }
         else if(this.roleProperies.getMMP() >= param1)
         {
            this.setAction("hit27_1");
            this.lastHit = "hit27_1";
            this.newAttackId();
            this.createSkill5();
            this.timers = 9;
            this.hitNum = 0;
            this.roleProperies.setMMP(this.roleProperies.getMMP() - param1);
         }
      }
      
      private function skill_jrjl(param1:uint) : void
      {
         if(this.isAttacking() || this.isBeAttacking())
         {
            return;
         }
         if(this.roleProperies.getMMP() >= param1)
         {
            this.setAction("hit28");
            this.lastHit = "hit28";
            this.newAttackId();
            this.timers = 9;
            this.hitNum = 0;
            this.roleProperies.setMMP(this.roleProperies.getMMP() - param1);
         }
      }
      
      private function skill_mlsz(param1:uint) : void
      {
         if(this.isAttacking() || this.isBeAttacking())
         {
            return;
         }
         if(this.roleProperies.getMMP() >= param1)
         {
            this.setAction("hit29");
            this.lastHit = "hit29";
            this.newAttackId();
            this.timers = 9;
            this.hitNum = 0;
            this.roleProperies.setMMP(this.roleProperies.getMMP() - param1);
         }
      }
      
      override public function step() : void
      {
         if(this.lmjly1)
         {
            this.checkifdohit10_5();
         }
         if(this.lmjly2)
         {
            this.checkifcanuselmj();
         }
         if(this.zxcly1)
         {
            this.checkifcanusezxc();
         }
         if(this.zxcly2)
         {
            this.checkifcanusezxc();
         }
         if(this.fhf2ly2)
         {
            this.checkifcanusefhf();
         }
         if(this.fhf2ly1)
         {
            this.checkifcanusefhf();
         }
         if(this._BLMskill5)
         {
            this._BLMskill5.step();
         }
         if(this.getPlayer().getSkillBySkillName("jrjl"))
         {
            if(!this._JRJL)
            {
               this.createJRJL();
            }
         }
         if(this._JRJL)
         {
            this._JRJL.step(this.bbdc.getDirect());
         }
         super.step();
      }
      
      private function toAttack() : void
      {
         this.lastHit = "hit27_2";
         this.setAction("hit27_2");
      }
      
      private function getRebuild(param1:uint) : void
      {
         if(this.roleProperies.getMMP() >= param1)
         {
            this.lastHit = "hit27_1";
            this.setAction("hit27_1");
            this._BLMskill5.ReStart();
            this.roleProperies.setMMP(this.roleProperies.getMMP() - param1);
         }
      }
      
      private function createSkill5() : void
      {
         var _loc1_:Class = AUtils.getClass("swordskill5_3");
         this._BLMskill5 = new BLMSkill5(_loc1_,this);
         this.parent.addChild(this._BLMskill5);
      }
      
      private function createJRJL() : void
      {
         var _loc1_:Class = AUtils.getClass("sword_jrjlsxj");
         this._JRJL = new JRJL(_loc1_,this);
         this.parent.addChild(this._JRJL);
      }
      
      public function getDirection() : int
      {
         if(this.bbdc.getDirect() == 0)
         {
            return this.transform.matrix.a;
         }
         return -this.transform.matrix.a;
      }
      
      public function getProbabilityByBullet(param1:String) : Number
      {
         switch(param1)
         {
            case "Role5Bullet1":
            case "Role5Bullet2":
            case "Role5Bullet3":
            case "Role5Bullet4":
            case "Role5Bullet5":
               return 0.18 + this.player.returnSkillLevelBySkillName("yyb") * 0.006;
            case "Role5Bullet6":
               return 0.42 + this.player.returnSkillLevelBySkillName("yyb") * 0.006;
            case "Role5Bullet7_1":
               return 0.36 + this.player.returnSkillLevelBySkillName("yyb") * 0.006;
            case "Role5Bullet7_2":
               return 0.75 + this.player.returnSkillLevelBySkillName("yyb") * 0.006;
            case "Role5Bullet8":
               return 0.11 + this.player.returnSkillLevelBySkillName("yyb") * 0.006;
            case "Role5Bullet10_1":
               return 0.12 + this.player.returnSkillLevelBySkillName("yyb") * 0.006;
            case "Role5Bullet10_2":
               return 0.6 + this.player.returnSkillLevelBySkillName("yyb") * 0.006;
            case "Role5Bullet10_3":
               return 0.3 + this.player.returnSkillLevelBySkillName("yyb") * 0.006;
            default:
               return 0.11 + this.player.returnSkillLevelBySkillName("yyb") * 0.006;
         }
      }
      
      override protected function showSkill(param1:String) : void
      {
         var _loc2_:Array = null;
         var _loc3_:Array = null;
         var _loc4_:uint = 0;
         var _loc5_:int = 0;
         if(this.getPlayer())
         {
            _loc2_ = ["Y","U","I","O","L"];
            _loc3_ = this.getPlayer().returnSkillNameBySkillKey(param1);
            if(_loc3_)
            {
               param1 = String(_loc3_[0]);
               _loc4_ = uint(parseInt(_loc3_[1]));
               switch(param1)
               {
                  case "xlc":
                     _loc5_ = this.getPlayer().returnSkillLevelBySkillName("xlc") - 1;
                     _loc4_ = this.consumeMP[_loc5_] * 0.5;
                     this.skill_xlc(_loc4_);
                     break;
                  case "lxuanj":
                     _loc5_ = this.getPlayer().returnSkillLevelBySkillName("lxuanj") - 1;
                     _loc4_ = this.consumeMP[_loc5_] * 0.6;
                     this.skill_lxuanj(_loc4_);
                     break;
                  case "xkjz":
                     _loc5_ = this.getPlayer().returnSkillLevelBySkillName("xkjz") - 1;
                     _loc4_ = this.consumeMP[_loc5_] * 0.72;
                     this.skill_xkjz(_loc4_);
                     break;
                  case "yyb":
                     _loc5_ = this.getPlayer().returnSkillLevelBySkillName("yyb") - 1;
                     _loc4_ = this.consumeMP[_loc5_] * 0.55;
                     this.skill_yyb(_loc4_);
                     break;
                  case "tlj":
                     _loc5_ = this.getPlayer().returnSkillLevelBySkillName("tlj") - 1;
                     _loc4_ = this.consumeMP[_loc5_] * 0.72;
                     this.skill_tlj(_loc4_);
                     break;
                  case "pkz":
                     if(this.isSword == true)
                     {
                        _loc5_ = this.getPlayer().returnSkillLevelBySkillName("pkz") - 1;
                        _loc4_ = this.consumeMP[_loc5_] * 0.62;
                        this.skill_pkz(_loc4_);
                        break;
                     }
                     this.skill_pkz(_loc4_);
                     break;
                  case "lxj":
                     if(this.isSword == true)
                     {
                        _loc5_ = this.getPlayer().returnSkillLevelBySkillName("lxj") - 1;
                        _loc4_ = this.consumeMP[_loc5_] * 0.6;
                        this.skill_lxj(_loc4_);
                        break;
                     }
                     this.skill_lxj(_loc4_);
                     break;
                  case "lysh":
                     if(this.isSword == true)
                     {
                        _loc5_ = this.getPlayer().returnSkillLevelBySkillName("lysh") - 1;
                        _loc4_ = this.consumeMP[_loc5_] * 1.1;
                        this.skill_lysh(_loc4_);
                     }
                     else
                     {
                        this.skill_lysh(_loc4_);
                     }
                     break;
                  case "jrjl":
                     if(this.isSword == true)
                     {
                        _loc5_ = this.getPlayer().returnSkillLevelBySkillName("jrjl") - 1;
                        _loc4_ = this.consumeMP[_loc5_] * 0.7;
                        this.skill_jrjl(_loc4_);
                        break;
                     }
                     this.skill_jrjl(_loc4_);
                     break;
                  case "mlsz":
                     if(this.isSword == true)
                     {
                        _loc5_ = this.getPlayer().returnSkillLevelBySkillName("mlsz") - 1;
                        _loc4_ = this.consumeMP[_loc5_] * 1;
                        this.skill_mlsz(_loc4_);
                     }
                     else
                     {
                        this.skill_mlsz(_loc4_);
                     }
               }
            }
         }
      }
      
      public function ToSpear() : void
      {
         if(!(this.isAttacking() || this.isNormalHit()))
         {
            this.isSword = false;
         }
      }
      
      public function ToSword() : void
      {
         if(!(this.isAttacking() || this.isNormalHit()))
         {
            this.isSword = true;
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
         if(this.isGXP || this.curAction == "hit7" || this.curAction == "hit10_1" || this.curAction == "hit10_2")
         {
            param2 = false;
         }
         if(this.curAction == "hit10_1" || this.curAction == "hit10_2")
         {
            param1 *= 0.75;
         }
         if(this.isGXP || this.curAction == "hit23" || this.curAction == "hit24_1" || this.curAction == "hit24_2" || this.curAction == "hit24_3" || this.curAction == "hit25_1" || this.curAction == "hit25_2" || this.curAction == "hit27_2" || this.curAction == "hit28" || this.curAction == "hit29")
         {
            param2 = false;
         }
         if(this.getCurAddEffect(BaseAddEffect.ROLE5LOONGSWORD))
         {
            if(this.curAction == "hit18" || this.curAction == "hit19" || this.curAction == "hit20" || this.curAction == "hit21" || this.curAction == "hit22" || this.curAction == "hit114_1")
            {
               param2 = false;
            }
         }
         if(this.curAction == "hit25_1")
         {
            param1 *= 0.9;
         }
         if(this.getPlayer().getCurEquipByType("zbfj"))
         {
            if(this.getPlayer().getCurEquipByType("zbfj").getFillName().indexOf("zxttp") != -1)
            {
               param1 *= 0.9;
            }
         }
         super.reduceHp(param1,param2);
      }
      
      override public function setAttackBack(param1:Point) : void
      {
         if(this.getCurAddEffect(BaseAddEffect.ROLE5LOONGSWORD))
         {
            if(!(this.curAction == "hit7" || this.curAction == "hit10_1" || this.curAction == "hit10_2" || this.curAction == "hit18" || this.curAction == "hit19" || this.curAction == "hit20" || this.curAction == "hit21" || this.curAction == "hit22" || this.curAction == "hit114_1" || this.isGXP || this.curAction == "hit23" || this.curAction == "hit24_1" || this.curAction == "hit24_2" || this.curAction == "hit24_3" || this.curAction == "hit25_1" || this.curAction == "hit25_2" || this.curAction == "hit27_2" || this.curAction == "hit28" || this.curAction == "hit29"))
            {
               super.setAttackBack(param1);
            }
         }
         else if(!(this.curAction == "hit7" || this.curAction == "hit10_1" || this.curAction == "hit10_2" || this.isGXP || this.curAction == "hit23" || this.curAction == "hit24_1" || this.curAction == "hit24_2" || this.curAction == "hit24_3" || this.curAction == "hit25_1" || this.curAction == "hit25_2" || this.curAction == "hit27_2" || this.curAction == "hit28" || this.curAction == "hit29"))
         {
            super.setAttackBack(param1);
         }
      }
      
      override public function normalHit() : *
      {
         var _loc1_:Array = null;
         this.curtime = getTimer();
         if(this.timers <= 0)
         {
            _loc1_ = this.IsSignedMonInView();
            if(_loc1_.length != 0)
            {
               if(this.isSword == false)
               {
                  this.doNormalhitEscape(_loc1_);
               }
               else
               {
                  this.ToSpear();
                  this.doNormalhitEscape(_loc1_);
               }
            }
            if(!this.isInSky())
            {
               if(!this.isRunning() && (!this.isAttacking() || this.isNormalHit()))
               {
                  if(this.curtime - this.lasttime > 1200)
                  {
                     this.hitNum = 1;
                  }
                  else if(++this.hitNum > 4)
                  {
                     this.hitNum = 1;
                  }
                  if(this.isSword == false)
                  {
                     switch(this.hitNum)
                     {
                        case 1:
                           this.timers = 0;
                           break;
                        case 2:
                           this.timers = 0;
                           break;
                        case 3:
                           this.timers = 0;
                           break;
                        case 4:
                           this.timers = 0;
                     }
                  }
                  else
                  {
                     switch(this.hitNum)
                     {
                        case 1:
                           this.timers = 0;
                           break;
                        case 2:
                           this.timers = 0;
                           break;
                        case 3:
                           this.timers = 0;
                           break;
                        case 4:
                           this.timers = 0;
                     }
                  }
                  SoundManager.play("Role5_hit" + this.hitNum);
                  if(this.isSword == false)
                  {
                     this.setAction("hit" + this.hitNum);
                     this.lastHit = "hit" + this.hitNum;
                  }
                  else
                  {
                     this.setAction("hit" + (this.hitNum + 17));
                     this.lastHit = "hit" + (this.hitNum + 17);
                  }
                  this.newAttackId();
               }
               else if(Boolean(this.isRunning()) && !this.isAttacking())
               {
                  if(this.getPlayer())
                  {
                     SoundManager.play("Role5_hit1");
                     if(this.isSword == false)
                     {
                        this.setAction("hit114");
                        this.doubleCount = 0;
                     }
                     else
                     {
                        this.setAction("hit114_1");
                        this.doubleCount = 0;
                     }
                  }
               }
            }
            else if(!this.isAttacking() && !this.isBeAttacking())
            {
               if(this.isSword == false)
               {
                  this.timers = 0;
               }
               else
               {
                  this.timers = 0;
               }
               SoundManager.play("Role5_jumpAttack");
               if(this.isSword == false)
               {
                  this.setAction("hit5");
                  this.lastHit = "hit5";
               }
               else
               {
                  this.setAction("hit22");
                  this.lastHit = "hit22";
               }
               this.hitNum = 0;
               this.newAttackId();
            }
         }
         this.addRole5Energy();
         this.lasttime = this.curtime;
      }
      
      private function addRole5Energy() : *
      {
         if(this.isSword == false)
         {
            ++this._role5hitadd;
            if(this._role5hitadd > AllConsts.ROLE5MAXENERGY)
            {
               this._role5hitadd = 0;
               this.curAddEffect.add([{
                  "name":BaseAddEffect.ROLE5HITADD,
                  "time":gc.frameClips * 2.4
               }]);
            }
         }
      }
      
      override public function refreshEquip() : void
      {
         var _loc3_:Array = null;
         var _loc1_:uint = uint(this.getCurClothId());
         var _loc2_:uint = uint(this.getCurWeaponId());
         if(_loc1_ == 115)
         {
            _loc1_ = 18;
         }
         if(_loc1_ == 112)
         {
            _loc1_ = 19;
         }
         if(_loc1_ == 113)
         {
            _loc1_ = 20;
         }
         if(_loc1_ == 114)
         {
            _loc1_ = 21;
         }
         if(this.isSword == false)
         {
            _loc3_ = BaseBitmapDataPool.loadZm4RoleResources("idle_spear",_loc1_,_loc2_);
            if(_loc3_)
            {
               this.bbdc.replaceBitmapDataByName("body",_loc3_);
            }
         }
         if(this.isSword == true)
         {
            if(this.getCurAddEffect(BaseAddEffect.ROLE5LOONGSWORD))
            {
               _loc3_ = BaseBitmapDataPool.loadZm4RoleResources("idle_sword",_loc1_,17);
               if(_loc3_)
               {
                  this.bbdc.replaceBitmapDataByName("body",_loc3_);
               }
            }
            else if(!this.getCurAddEffect(BaseAddEffect.ROLE5LOONGSWORD))
            {
               _loc3_ = BaseBitmapDataPool.loadZm4RoleResources("idle_sword",_loc1_,_loc2_);
               if(_loc3_)
               {
                  this.bbdc.replaceBitmapDataByName("body",_loc3_);
               }
            }
         }
         super.refreshEquip();
      }
      
      override public function isNormalHit() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3" || this.curAction == "hit4" || this.curAction == "hit5" || this.curAction == "hit114" || this.curAction == "hit18" || this.curAction == "hit19" || this.curAction == "hit20" || this.curAction == "hit21" || this.curAction == "hit22" || this.curAction == "hit114_1";
      }
      
      override public function __keyBoardDown(param1:KeyboardEvent) : void
      {
         super.__keyBoardDown(param1);
      }
      
      override public function __keyBoardUp(param1:KeyboardEvent) : void
      {
         super.__keyBoardUp(param1);
         if(param1.keyCode == 89 || param1.keyCode == 85 || param1.keyCode == 73 || param1.keyCode == 79 || param1.keyCode == 76 || param1.keyCode == 80)
         {
            if(this.curAction == "hit25_1")
            {
               if(this._skill3_1)
               {
                  this._skill3_1.destroy();
                  this._skill3_1 = null;
               }
               this.setAction("hit25_2");
            }
         }
      }
      
      public function getyybcure() : int
      {
         var _loc4_:int = 1;
         _loc4_ = int(this.player.returnSkillLevelBySkillName("yyb") - 1);
         return Math.round((this.roleProperies.getHurt() * this.skill4curexs[_loc4_] + this.skill4curecount[_loc4_]) * 0.8);
      }
      
      public function getlxjcure() : int
      {
         var _loc4_:int = 1;
         _loc4_ = int(this.player.returnSkillLevelBySkillName("lxj") - 1);
         return Math.round(0.08 * (this.roleProperies.getHurt() * this.skill4curexs[_loc4_] + this.skill4curecount[_loc4_]) * 0.8);
      }
      
      override public function upGrade(param1:Boolean = true) : *
      {
         super.upGrade();
         if(!param1)
         {
            this.roleProperies.removeAllEquipAndPassive();
         }
         this.roleProperies.setSHHP(70 + 49 * (this.roleProperies.getLevel() - 1));
         this.roleProperies.setHHP(this.roleProperies.getSHHP());
         this.roleProperies.setSMMP(55 + 24 * (this.roleProperies.getLevel() - 1));
         this.roleProperies.setMMP(this.roleProperies.getSMMP());
         this.roleProperies.setBasePower(9 + 6 * (this.roleProperies.getLevel() - 1));
         this.roleProperies.setDefense(2 + 1.5 * (this.roleProperies.getLevel() - 1));
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
         var qixue:int = 0;
         var addhurt:Number = 1;
         if(_loc9_ > 20)
         {
            _loc9_ = 20;
         }
         if(this.isGXP)
         {
            _loc5_ = 1.3;
         }
         var _loc12_:Number = 1;
         if(Boolean(this.getCurAddEffect(BaseAddEffect.ROLE5LOONGSWORD)))
         {
            addhurt *= 1.09 + this.player.returnSkillLevelBySkillName("lxj") * 0.008;
         }
         var _loc13_:Boolean = this.getPlayer().getSkillBySkillName("jrjl");
         if(_loc13_)
         {
            addhurt *= 1.045 + this.player.returnSkillLevelBySkillName("jrjl") * 0.0036;
         }
         if(param2 && Math.random() <= this.roleProperies.getTotalCrit() / 100)
         {
            _loc12_ = 2;
         }
         switch(param1)
         {
            case "hit18":
            case "hit18_1":
            case "hit19":
            case "hit19_1":
            case "hit20":
            case "hit20_1":
            case "hit22":
            case "hit22_1":
               _loc8_ = 2.729 * this.roleProperies.getHurt() * _loc12_ * _loc5_ * addhurt;
               qixue = 2.729 * this.roleProperies.getHaveblood() * _loc5_ * addhurt;
               if(this._BLMskill5)
               {
                  this._BLMskill5.addMcTime(111 * 1.5);
               }
               break;
            case "hit115":
            case "hit115_1":
               if(this._BLMskill5)
               {
                  this._BLMskill5.addMcTime(167 * 1.5);
               }
               _loc8_ = 4.1 * this.roleProperies.getHurt() * _loc12_ * _loc5_ * addhurt;
               qixue = 4.1 * this.roleProperies.getHaveblood() * _loc5_ * addhurt;
               break;
            case "hit21":
            case "hit21_1":
               if(this._BLMskill5)
               {
                  this._BLMskill5.addMcTime(70 * 1.5);
               }
               _loc8_ = 2.729 / 3 * this.roleProperies.getHurt() * _loc12_ * _loc5_ * addhurt;
               qixue = 2.729 / 3 * this.roleProperies.getHaveblood() * _loc5_ * addhurt;
               break;
            case "hit6":
               if(this._BLMskill5)
               {
                  this._BLMskill5.addMcTime(300 * 1.5);
               }
               _loc7_ = Number(this.player.returnSkillLevelBySkillName("xlc") - 1);
               mp_percent = 13 * Math.pow(25958 * 0.065 / 13,Math.pow(_loc7_ / 17,0.55)) / this.roleProperies.getSMMP() / 0.065 * 3 * Math.pow(1 / 3,Math.pow(_loc7_ / 17,0.75));
               _loc8_ = 0.6 * (this.SkillFixedDamage[_loc7_] * this.FixedDamageCount[_loc7_] + (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * this.roleProperies.getHurt()) * _loc12_ * _loc5_ * addhurt;
               qixue = 0.6 * (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * this.roleProperies.getHaveblood() * _loc5_ * addhurt;
               break;
            case "hit7_1":
               if(this._BLMskill5)
               {
                  this._BLMskill5.addMcTime(150 * 1.5);
               }
               _loc7_ = Number(this.player.returnSkillLevelBySkillName("lxuanj") - 1);
               mp_percent = 18 * Math.pow(25958 * 0.07 / 18,Math.pow(_loc7_ / 17,0.55)) / this.roleProperies.getSMMP() / 0.07 * 3 * Math.pow(1 / 3,Math.pow(_loc7_ / 17,0.75));
               _loc8_ = 0.7 * (this.SkillFixedDamage[_loc7_] * this.FixedDamageCount[_loc7_] + (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * this.roleProperies.getHurt()) / 5 * _loc12_ * _loc5_ * addhurt;
               qixue = 0.7 * (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) / 5 * this.roleProperies.getHaveblood() * _loc5_ * addhurt;
               break;
            case "hit8":
               if(this._BLMskill5)
               {
                  this._BLMskill5.addMcTime(150 * 1.5);
               }
               _loc7_ = Number(this.player.returnSkillLevelBySkillName("lxuanj") - 1);
               mp_percent = 24 * Math.pow(25958 * 0.085 / 24,Math.pow(_loc7_ / 17,0.55)) / this.roleProperies.getSMMP() / 0.085 * 3 * Math.pow(1 / 3,Math.pow(_loc7_ / 17,0.75));
               _loc8_ = 0.7 * (this.SkillFixedDamage[_loc7_] * this.FixedDamageCount[_loc7_] + (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * this.roleProperies.getHurt()) / 5 * _loc12_ * _loc5_ * addhurt;
               qixue = 0.7 * (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) / 5 * this.roleProperies.getHaveblood() * _loc5_ * addhurt;
               break;
            case "hit10":
               if(this._BLMskill5)
               {
                  this._BLMskill5.addMcTime(85 * 1.5);
               }
               _loc7_ = Number(this.player.returnSkillLevelBySkillName("xkjz") - 1);
               mp_percent = 24 * Math.pow(25958 * 0.085 / 24,Math.pow(_loc7_ / 17,0.55)) / this.roleProperies.getSMMP() / 0.085 * 3 * Math.pow(1 / 3,Math.pow(_loc7_ / 17,0.75));
               _loc8_ = 0.8 * (this.SkillFixedDamage[_loc7_] * this.FixedDamageCount[_loc7_] + (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * this.roleProperies.getHurt()) / 7 * _loc12_ * _loc5_ * addhurt;
               qixue = 0.8 * (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) / 7 * this.roleProperies.getHaveblood() * _loc5_ * addhurt;
               break;
            case "hit30":
               _loc7_ = Number(this.player.returnSkillLevelBySkillName("jrjl") - 1);
               mp_percent = 24 * Math.pow(25958 * 0.085 / 24,Math.pow(_loc7_ / 17,0.55)) / this.roleProperies.getSMMP() / 0.085 * 3 * Math.pow(1 / 3,Math.pow(_loc7_ / 17,0.75));
               _loc8_ = (10 + _loc7_ * 0.02) * this.roleProperies.getHurt() * _loc12_ * _loc5_ * addhurt;
               qixue = (10 + _loc7_ * 0.02) * this.roleProperies.getHaveblood() * _loc5_ * addhurt;
               break;
            case "hit29":
               if(this._BLMskill5)
               {
                  this._BLMskill5.addMcTime(210);
               }
               _loc7_ = Number(this.player.returnSkillLevelBySkillName("mlsz") - 1);
               mp_percent = 24 * Math.pow(25958 * 0.085 / 24,Math.pow(_loc7_ / 17,0.55)) / this.roleProperies.getSMMP() / 0.085 * 3 * Math.pow(1 / 3,Math.pow(_loc7_ / 17,0.75));
               _loc8_ = 1.2 * (this.SkillFixedDamage[_loc7_] * this.FixedDamageCount[_loc7_] + (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * this.roleProperies.getHurt()) / 5 * _loc12_ * _loc5_ * addhurt;
               qixue = 1.2 * (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) / 5 * this.roleProperies.getHaveblood() * _loc5_ * addhurt;
               break;
            case "hit24_1":
               if(this._BLMskill5)
               {
                  this._BLMskill5.addMcTime(133 * 1.5);
               }
               _loc7_ = Number(this.player.returnSkillLevelBySkillName("pkz") - 1);
               mp_percent = 19 * Math.pow(25958 * 0.075 / 19,Math.pow(_loc7_ / 17,0.55)) / this.roleProperies.getSMMP() / 0.075 * 3 * Math.pow(1 / 3,Math.pow(_loc7_ / 17,0.75));
               _loc8_ = 0.7 * (this.SkillFixedDamage[_loc7_] * this.FixedDamageCount[_loc7_] + (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * this.roleProperies.getHurt()) / 6 * _loc12_ * _loc5_ * addhurt;
               qixue = 0.7 * (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) / 6 * this.roleProperies.getHaveblood() * _loc5_ * addhurt;
               break;
            case "hit24_2":
               if(this._BLMskill5)
               {
                  this._BLMskill5.addMcTime(133 * 1.5);
               }
               _loc7_ = Number(this.player.returnSkillLevelBySkillName("pkz") - 1);
               _loc8_ = 0.7 * (this.SkillFixedDamage[_loc7_] * this.FixedDamageCount[_loc7_] + (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * this.roleProperies.getHurt()) / 6 * _loc12_ * _loc5_ * addhurt;
               qixue = 0.7 * (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) / 6 * this.roleProperies.getHaveblood() * _loc5_ * addhurt;
               break;
            case "hit10_3":
               break;
            case "hit24_3":
               if(this._BLMskill5)
               {
                  this._BLMskill5.addMcTime(333 * 1.2);
               }
               _loc7_ = Number(this.player.returnSkillLevelBySkillName("pkz") - 1);
               _loc8_ = 0.7 * (this.SkillFixedDamage[_loc7_] * this.FixedDamageCount[_loc7_] + (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * this.roleProperies.getHurt()) / 6 * _loc12_ * _loc5_ * addhurt;
               qixue = 0.7 * (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) / 6 * this.roleProperies.getHaveblood() * _loc5_ * addhurt;
               break;
            case "hit27_3":
               if(this._BLMskill5)
               {
                  this._BLMskill5.addMcTime(67 * 1.5);
               }
               _loc7_ = Number(this.player.returnSkillLevelBySkillName("lysh") - 1);
               mp_percent = 30 * Math.pow(25958 * 0.11 / 30,Math.pow(_loc7_ / 17,0.55)) / this.roleProperies.getSMMP() / 0.11 * 3 * Math.pow(1 / 3,Math.pow(_loc7_ / 17,0.75));
               _loc8_ = 1.25 / 4 * (this.SkillFixedDamage[_loc7_] * this.FixedDamageCount[_loc7_] * 1.05 + (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * this.roleProperies.getHurt()) / 13 * _loc12_ * _loc5_ * addhurt;
               qixue = 1.25 / 4 * (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) / 13 * this.roleProperies.getHaveblood() * _loc5_ * addhurt;
               break;
            case "hit11":
               _loc7_ = Number(this.player.returnSkillLevelBySkillName("yyb") - 1);
               mp_percent = 30 * Math.pow(25958 * 0.11 / 30,Math.pow(_loc7_ / 17,0.55)) / this.roleProperies.getSMMP() / 0.11 * 3 * Math.pow(1 / 3,Math.pow(_loc7_ / 17,0.75));
               _loc8_ = 0.6 * (this.SkillFixedDamage[_loc7_] * this.FixedDamageCount[_loc7_] + (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) * this.roleProperies.getHurt()) / 20 * _loc12_ * _loc5_ * addhurt;
               qixue = 0.6 * (this.SkillFactor[0] + this.SkillFactor[1] * _loc7_) / 20 * this.roleProperies.getHaveblood() * _loc5_ * addhurt;
               break;
            case "fabao-zltc":
               _loc6_ = this.getPlayer().getCurEquipByType("zbfb");
               _loc12_ = 1;
               _loc8_ = this.roleProperies.getHurt() * (18 + (_loc6_.getELevel() - 1) * 3) / 4 * 1.8 * addhurt;
               qixue = this.roleProperies.getHaveblood() * (18 + (_loc6_.getELevel() - 1) * 3) / 4 * _loc5_ * 1.8 * addhurt;
               break;
            case "fabao-qpj":
               _loc8_ = this.roleProperies.getHurt() * 1.945 * _loc12_ * _loc5_ * addhurt * 1.08325 * 1.5;
               qixue = this.roleProperies.getHaveblood() * 1.945 * _loc5_ * addhurt * 1.08325 * 1.5;
               break;
            case "fabao-qpj1":
               _loc8_ = this.roleProperies.getHurt() * 1.945 * _loc12_ * _loc5_ * addhurt * 1.08325 * 1.5;
               qixue = this.roleProperies.getHaveblood() * 1.945 * _loc5_ * addhurt * 1.08325 * 1.5;
               break;
            case "qpjThunder":
               _loc8_ = this.roleProperies.getHurt() * 2.52 * _loc12_ * _loc5_ * addhurt * 1.08325 * 1.5;
               qixue = this.roleProperies.getHaveblood() * 2.52 * _loc5_ * addhurt * 1.08325 * 1.5;
               break;
            case "fabao-sword":
               _loc6_ = this.getPlayer().getCurEquipByType("zbfb");
               _loc12_ = 1;
               _loc8_ = this.roleProperies.getHurt() * _loc6_.getELevel() * 0.05 * addhurt;
               qixue = this.roleProperies.getHaveblood() * _loc6_.getELevel() * 0.05 * _loc5_ * addhurt;
               break;
            case "magicsword2":
               _loc6_ = this.getPlayer().getCurEquipByType("zbfb");
               if(Boolean(_loc6_) && _loc6_.getWX().indexOf("木") != -1)
               {
                  _loc8_ = 0.0875 * this.roleProperies.getHurt() * _loc6_.getELevel() * addhurt;
                  qixue = 0.0875 * this.roleProperies.getHaveblood() * _loc5_ * _loc6_.getELevel() * addhurt;
               }
               _loc8_ = this.roleProperies.getHurt() * _loc6_.getELevel() * 0.0488 * addhurt;
               qixue = 0.0488 * this.roleProperies.getHaveblood() * _loc5_ * _loc6_.getELevel() * addhurt;
               _loc12_ = 1;
               break;
            case "fabao-snow":
               _loc6_ = this.getPlayer().getCurEquipByType("zbfb");
               _loc8_ = this.roleProperies.getHurt() * _loc6_.getELevel() * 0.09 * addhurt;
               qixue = 0.09 * this.roleProperies.getHaveblood() * _loc5_ * _loc6_.getELevel() * addhurt;
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
               _loc8_ = Math.max(this.roleProperies.getHurt() * _loc12_ * _loc5_ * _loc3_ * addhurt,1);
               qixue = _loc3_ * this.roleProperies.getHaveblood() * _loc5_ * addhurt;
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
               _loc8_ = this.roleProperies.getHurt() * _loc12_ * _loc5_ * _loc3_ * addhurt;
               qixue = _loc3_ * this.roleProperies.getHaveblood() * _loc5_ * addhurt;
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
               _loc8_ = this.roleProperies.getHurt() * _loc12_ * _loc5_ * _loc3_ * addhurt;
               qixue = _loc3_ * this.roleProperies.getHaveblood() * _loc5_ * addhurt;
               break;
            case "Pearl":
               _loc6_ = this.getPlayer().getCurEquipByType("zbfb");
               if(Boolean(_loc6_) && _loc6_.getWX().indexOf("木") != -1)
               {
                  _loc8_ = 1.2 * this.roleProperies.getHurt();
                  qixue = 1.2 * this.roleProperies.getHaveblood() * _loc5_ * addhurt;
               }
               _loc8_ = this.roleProperies.getHurt() * 0.6;
               qixue = 0.6 * this.roleProperies.getHaveblood() * _loc5_ * addhurt;
               _loc12_ = 1;
               break;
            case "fabao-pearl":
               _loc6_ = this.getPlayer().getCurEquipByType("zbfb");
               if(Boolean(_loc6_) && _loc6_.getWX().indexOf("木") != -1)
               {
                  _loc8_ = _loc6_.getELevel() * 0.0473 * this.roleProperies.getHurt() * addhurt;
                  qixue = _loc6_.getELevel() * 0.0473 * this.roleProperies.getHaveblood() * _loc5_ * addhurt;
               }
               _loc12_ = 1;
               _loc8_ = _loc6_.getELevel() * 0.0315 * this.roleProperies.getHurt() * addhurt;
               qixue = _loc6_.getELevel() * 0.0315 * this.roleProperies.getHaveblood() * _loc5_ * addhurt;
               break;
            default:
               _loc8_ = 0;
         }
         return {
            "hurt":_loc8_ * 1.21,
            "qixue":qixue * 1.21,
            "atk":this.roleProperies.getPower()
         };
      }
      
      override protected function jump() : void
      {
         if(!this.isAttacking() && !this.isBeAttacking())
         {
            if(gc.protectedPerproty.getProperty(this,"jumpCount") < 2)
            {
               this.speed.y = jumpPower;
               if(gc.protectedPerproty.getProperty(this,"jumpCount") == 0)
               {
                  gc.protectedPerproty.setProperty(this,"jumpCount",1);
                  this.setAction("jump1");
                  if(this.getPlayer())
                  {
                     gc.sendWalkInfo(this);
                  }
               }
               else
               {
                  gc.protectedPerproty.setProperty(this,"jumpCount",2);
                  this.setAction("jump2");
                  if(this.getPlayer())
                  {
                     gc.sendWalkInfo(this);
                  }
               }
            }
            else if(gc.protectedPerproty.getProperty(this,"jumpCount") == 2)
            {
               if(gc.isInSea())
               {
                  this.speed.y = jumpPower;
                  this.setAction("jump2");
                  if(Boolean(this.getPlayer()) && gc.isInRoom())
                  {
                     gc.sendWalkInfo(this);
                  }
               }
            }
         }
         if(this.curAction == "hit29")
         {
            if(gc.protectedPerproty.getProperty(this,"jumpCount") < 2)
            {
               this.speed.y = jumpPower;
               if(gc.protectedPerproty.getProperty(this,"jumpCount") == 0)
               {
                  gc.protectedPerproty.setProperty(this,"jumpCount",1);
                  this.setAction("jump1");
                  if(this.getPlayer())
                  {
                     gc.sendWalkInfo(this);
                  }
               }
               else
               {
                  gc.protectedPerproty.setProperty(this,"jumpCount",2);
                  this.setAction("jump2");
                  if(this.getPlayer())
                  {
                     gc.sendWalkInfo(this);
                  }
               }
            }
            else if(gc.protectedPerproty.getProperty(this,"jumpCount") == 2)
            {
               if(gc.isInSea())
               {
                  this.speed.y = jumpPower;
                  this.setAction("jump2");
                  if(Boolean(this.getPlayer()) && gc.isInRoom())
                  {
                     gc.sendWalkInfo(this);
                  }
               }
            }
         }
      }
      
      override protected function isCannotMoveWhenAttackOnFloor() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3" || this.curAction == "hit4" || this.curAction == "hit7" || this.curAction == "hit10_1" || this.curAction == "hit10_2" || this.curAction == "hit18" || this.curAction == "hit19" || this.curAction == "hit20" || this.curAction == "hit21" || this.curAction == "hit25_1" || this.curAction == "hit24_3" || this.curAction == "hit25_2";
      }
      
      override protected function isYCannotMoveWhenAttack() : Boolean
      {
         return this.curAction == "hit10_1" || this.curAction == "hit10_2" || this.curAction == "hit25_1" || this.curAction == "hit25_2";
      }
      
      override protected function isXCannotMoveWhenAttack() : Boolean
      {
         return this.curAction == "hit9";
      }
      
      override public function isAttacking() : Boolean
      {
         return this.curAction == "hit11" || this.curAction == "hit10" || this.curAction == "hit28" || this.curAction == "hit29" || this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3" || this.curAction == "hit4" || this.curAction == "hit5" || this.curAction == "hit114" || this.curAction == "hit6" || this.curAction == "hit7" || this.curAction == "hit8" || this.curAction == "hit9" || this.curAction == "hit10_1" || this.curAction == "hit10_2" || this.curAction == "hit18" || this.curAction == "hit19" || this.curAction == "hit20" || this.curAction == "hit21" || this.curAction == "hit22" || this.curAction == "hit114_1" || this.curAction == "hit23" || this.curAction == "hit24_1" || this.curAction == "hit24_2" || this.curAction == "hit24_3" || this.curAction == "hit25_1" || this.curAction == "hit25_2" || this.curAction == "hit26" || this.curAction == "hit27_1" || this.curAction == "hit27_2";
      }
      
      override protected function isCannotMoveWhenAttack() : Boolean
      {
         return this.curAction == "hit7" || this.curAction == "hit10_1" || this.curAction == "hit10_2" || this.curAction == "hit25_1" || this.curAction == "hit25_2";
      }
      
      override public function isCanMoveWhenAttack() : Boolean
      {
         return this.curAction == "hit5" || this.curAction == "hit6" || this.curAction == "hit8" || this.curAction == "hit114" || this.curAction == "hit22" || this.curAction == "hit23" || this.curAction == "hit27_2" || this.curAction == "hit114_1";
      }
   }
}

