package user
{
   import config.*;
   import flash.system.*;
   import my.*;
   import petInfo.*;
   
   public class User
   {
      
      public static var batterNum:int;
      
      public static var biggestbatterNum:int;
      
      internal var gc:Config;
      
      public var controlPlayer:int;
      
      private var lhValue1:uint;
      
      private var lhValue2:uint;
      
      private var myscore1:uint;
      
      private var myscore2:uint;
      
      private var curLevel1:uint;
      
      private var curLevel2:uint;
      
      private var curExp1:uint;
      
      private var curExp2:uint;
      
      private var skillLimit1:int;
      
      private var skillLimit2:int;
      
      private var luckdata1:int;
      
      private var luckdata2:int;
      
      public var roleid:uint = 0;
      
      public var tarray:Array;
      
      public var jnslist:Array;
      
      public var zblist:Array;
      
      public var djlist:Array;
      
      public var szlist:Array;
      
      public var outlist:Array;
      
      public var curarray:Array;
      
      public var isstudyskill:Array;
      
      public var skillbykey:Array;
      
      public var ispassiveskill:Array;
      
      public var saveObj:Object;
      
      private var issaveing:Boolean = false;
      
      private var savelist:Array;
      
      public var updatalist:Array;
      
      public var exAry:Array;
      
      private var lastsavelen:uint = 0;
      
      public var petsAry:Array;
      
      private var curEquipType:Array;
      
      public var isshowfashion:Boolean = true;
      
      public var immortalitylist:Array;
      
      public var isRealiveBydzjj:Boolean = false;
      
      private var test:Boolean = false;
      
      public var isRealiveBytjbg:Boolean = false;
      
      public function User()
      {
         this.tarray = [];
         this.zblist = [];
         this.djlist = [];
         this.szlist = [];
         this.outlist = [];
         this.jnslist = [];
         this.curarray = [];
         this.isstudyskill = [{
            "xflevel":0,
            "skillName":""
         },{
            "xflevel":0,
            "skillName":""
         }];
         this.skillbykey = [];
         this.ispassiveskill = [0,0,0,0,0];
         this.immortalitylist = [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]];
         this.saveObj = {};
         this.savelist = new Array();
         this.updatalist = new Array();
         this.exAry = [0,0,0,0];
         this.petsAry = new Array();
         super();
         this.gc = Config.getInstance();
         this.setCurLevel(1);
         this.setCurExp(0);
         this.setSkillLimit(10);
         this.setTadayLuckValue();
      }
      
      public function init(param1:uint) : *
      {
         this.controlPlayer = param1;
         this.setExAry(this.gc.saveId,this.roleid);
      }
      
      public function getControlPlayer() : int
      {
         return this.controlPlayer;
      }
      
      public function getEquipChinaName() : Object
      {
         var _loc1_:* = null;
         var _loc2_:* = {
            "zbfj":"",
            "zbwq":"",
            "zbcb":"",
            "zbtx":""
         };
         var _loc3_:uint = this.curarray.length;
         while(_loc3_-- > 0)
         {
            _loc1_ = this.curarray[_loc3_];
            if(this.curarray[_loc3_].type == "zbfj")
            {
               _loc2_.zbfj = _loc1_.getFillName();
            }
            if(this.curarray[_loc3_].type == "zbwq")
            {
               _loc2_.zbwq = _loc1_.getFillName();
            }
            if(this.curarray[_loc3_].type == "zbtx")
            {
               _loc2_.zbtx = _loc1_.getFillName();
            }
         }
         return _loc2_;
      }
      
      public function getEquipNum() : Object
      {
         var _loc1_:* = null;
         var _loc2_:* = {
            "zbfj":0,
            "zbwq":0,
            "zbcb":0,
            "zbtx":0
         };
         var _loc3_:* = 0;
         var _loc4_:* = 0;
         var _loc5_:uint = this.curarray.length;
         while(_loc5_-- > 0)
         {
            _loc1_ = this.curarray[_loc5_];
            if(this.curarray[_loc5_].type == "zbfj")
            {
               _loc4_ = uint(_loc1_.showid);
            }
            if(this.curarray[_loc5_].type == "zbsz")
            {
               _loc3_ = uint(_loc1_.showid);
               if(this.roleid == 5)
               {
                  if(_loc1_.getFillName().indexOf("zlwsz") != -1)
                  {
                     _loc3_ = 8;
                  }
                  if(_loc1_.getFillName().indexOf("smsrsz") != -1)
                  {
                     _loc3_ = 22;
                  }
               }
            }
            if(this.curarray[_loc5_].type == "zbwq")
            {
               _loc2_.zbwq = _loc1_.showid;
            }
            if(this.curarray[_loc5_].type == "zbcb")
            {
               _loc2_.zbcb = _loc1_.showid;
            }
            if(this.curarray[_loc5_].type == "zbtx")
            {
               _loc2_.zbtx = _loc1_.getFillName();
            }
         }
         if(this.isshowfashion == true || this.isshowfashion == "true")
         {
            _loc2_.zbfj = _loc3_ > 0 ? _loc3_ : _loc4_;
         }
         else
         {
            _loc2_.zbfj = _loc4_;
         }
         if(_loc2_.zbtx == "_ssggjtg")
         {
            if(this.roleid == 4)
            {
               if(_loc2_.zbwq == 4 || _loc2_.zbwq == 5 || _loc2_.zbwq == 9 || _loc2_.zbwq == 998)
               {
                  _loc2_.zbwq = 5;
               }
               else
               {
                  _loc2_.zbwq = 0;
               }
            }
            else
            {
               _loc2_.zbwq = 0;
            }
            _loc2_.zbfj = 0;
         }
         return _loc2_;
      }
      
      public function setLhValue(param1:uint) : void
      {
         this.lhValue1 = AUtils.getRandomValue();
         this.lhValue2 = param1 - this.lhValue1;
      }
      
      public function getLhValue() : uint
      {
         return this.lhValue1 + this.lhValue2;
      }
      
      public function setMyScore(param1:uint) : void
      {
         this.myscore1 = AUtils.getRandomValue();
         this.myscore2 = param1 - this.myscore1;
      }
      
      public function getMyScore() : uint
      {
         return this.myscore1 + this.myscore2;
      }
      
      public function setCurLevel(param1:uint) : void
      {
         this.curLevel1 = AUtils.getRandomValue();
         this.curLevel2 = param1 - this.curLevel1;
      }
      
      public function getCurLevel() : uint
      {
         return this.curLevel1 + this.curLevel2;
      }
      
      public function setCurExp(param1:uint) : void
      {
         this.curExp1 = AUtils.getRandomValue();
         this.curExp2 = param1 - this.curExp1;
      }
      
      public function getCurExp() : uint
      {
         return this.curExp1 + this.curExp2;
      }
      
      public function setSkillLimit(param1:uint) : void
      {
         this.skillLimit1 = AUtils.getRandomValue();
         this.skillLimit2 = param1 - this.skillLimit1;
      }
      
      public function getSkillLimt() : int
      {
         return this.skillLimit1 + this.skillLimit2;
      }
      
      public function setLuckData(param1:int) : void
      {
         this.luckdata1 = AUtils.getRandomValue();
         this.luckdata2 = param1 - this.luckdata1;
      }
      
      public function getLuckData() : int
      {
         return this.luckdata1 + this.luckdata2;
      }
      
      public function getSomeEquipInPackBackByName(param1:String) : MyEquipObj
      {
         var _loc2_:uint = this.djlist.length;
         while(_loc2_-- > 0)
         {
            if(this.djlist[_loc2_].getFillName() == param1)
            {
               return this.djlist[_loc2_];
            }
         }
         var _loc3_:uint = this.zblist.length;
         while(_loc3_-- > 0)
         {
            if(this.zblist[_loc3_].getFillName() == param1)
            {
               return this.zblist[_loc3_];
            }
         }
         var _loc4_:uint = this.szlist.length;
         while(_loc4_-- > 0)
         {
            if(this.szlist[_loc4_].getFillName() == param1)
            {
               return this.szlist[_loc4_];
            }
         }
         var _loc5_:uint = this.jnslist.length;
         while(_loc5_-- > 0)
         {
            if(this.jnslist[_loc5_].getFillName() == param1)
            {
               return this.jnslist[_loc5_];
            }
         }
         return null;
      }
      
      public function getSomeEquipInPackBackByName1(param1:String) : int
      {
         var _loc2_:uint = this.djlist.length;
         var zbnum:int = 0;
         var sznum:int = 0;
         while(_loc2_-- > 0)
         {
            if(this.djlist[_loc2_].getFillName() == param1)
            {
               return this.djlist[_loc2_].getENum();
            }
         }
         var _loc5_:uint = this.zblist.length;
         while(_loc5_-- > 0)
         {
            if(this.zblist[_loc5_].getFillName() == param1)
            {
               zbnum += this.zblist[_loc5_].getENum();
            }
         }
         if(zbnum != 0)
         {
            return zbnum;
         }
         var _loc6_:uint = this.szlist.length;
         while(_loc6_-- > 0)
         {
            if(this.szlist[_loc6_].getFillName() == param1)
            {
               sznum += this.szlist[_loc6_].getENum();
            }
         }
         if(sznum != 0)
         {
            return sznum;
         }
         var _loc7_:uint = this.jnslist.length;
         while(_loc7_-- > 0)
         {
            if(this.jnslist[_loc7_].getFillName() == param1)
            {
               return this.jnslist[_loc7_].getENum();
            }
         }
         return 0;
      }
      
      public function removeSomeEquipFormBack(param1:MyEquipObj) : void
      {
      }
      
      public function getCurEquipByType(param1:String) : MyEquipObj
      {
         var _loc2_:uint = this.curarray.length;
         while(_loc2_-- > 0)
         {
            if(param1 == this.curarray[_loc2_].type)
            {
               return this.curarray[_loc2_];
            }
         }
         return null;
      }
      
      public function getCurFashionEquipFallThingProbability() : Number
      {
         var _loc1_:MyEquipObj = this.getCurEquipByType("zbsz");
         var _loc2_:* = 0;
         if(_loc1_ != null)
         {
            if(_loc1_.getFillName() == "wkwdg" || _loc1_.getFillName() == "tswdg" || _loc1_.getFillName() == "bjwdg")
            {
               _loc2_ = 0.1;
            }
            else if(_loc1_.getFillName() == "wkbsz" || _loc1_.getFillName() == "tsbsz" || _loc1_.getFillName() == "bjbsz")
            {
               _loc2_ = 0.18;
            }
            else if(_loc1_.getFillName() == "wkzyf" || _loc1_.getFillName() == "tszyf" || _loc1_.getFillName() == "bjzyf")
            {
               _loc2_ = 0.2;
            }
         }
         return _loc2_;
      }
      
      public function removeCurEquip(param1:MyEquipObj) : void
      {
         var _loc2_:uint = uint(this.curarray.indexOf(param1));
         if(_loc2_ != -1)
         {
            this.curarray.splice(_loc2_,1);
         }
      }
      
      public function removeEquipFormBack(param1:String, param2:int, param3:uint = 1) : void
      {
         var _loc4_:int = 0;
         var _loc5_:MyEquipObj = this.getSomeEquipInPackBackByName(param1);
         var _loc6_:MyEquipObj = this.getSomeEquipInPackBackByName(_loc5_.getFillName());
         if(param2 == 1)
         {
            if(_loc5_.getENum() > 1)
            {
               _loc5_.setNum(-1);
            }
            else
            {
               _loc4_ = int(this.zblist.indexOf(_loc5_));
               if(_loc4_ != -1)
               {
                  this.zblist.splice(_loc4_,1);
               }
            }
         }
         else if(param2 == 2)
         {
            if(_loc5_.getENum() > param3)
            {
               _loc5_.setNum(-param3);
            }
            else
            {
               _loc4_ = int(this.djlist.indexOf(_loc5_));
               if(_loc4_ != -1)
               {
                  this.djlist.splice(_loc4_,1);
               }
            }
         }
         else if(param2 == 4)
         {
            if(_loc5_.getENum() > param3)
            {
               _loc5_.setNum(-param3);
            }
            else
            {
               _loc4_ = int(this.jnslist.indexOf(_loc5_));
               if(_loc4_ != -1)
               {
                  this.jnslist.splice(_loc4_,1);
               }
            }
         }
      }
      
      public function getSomeOneEquipNumberByName(param1:String) : uint
      {
         var _loc2_:* = null;
         var _loc3_:uint = this.djlist.length;
         var _loc4_:int = 0;
         while(_loc4_ < _loc3_)
         {
            _loc2_ = this.djlist[_loc4_];
            if(_loc2_.getFillName() == param1)
            {
               return _loc2_.getENum();
            }
            _loc4_++;
         }
         return 0;
      }
      
      public function setCurrentByType(param1:String, param2:MyEquipObj) : void
      {
         var _loc3_:uint = this.curarray.length;
         while(_loc3_-- > 0)
         {
            if(param1 == this.curarray[_loc3_].type)
            {
               this.curarray[_loc3_] = param2;
            }
         }
      }
      
      public function getBagEquipSaveString() : String
      {
         var _loc1_:* = "";
         var _loc2_:uint = this.zblist.length;
         while(_loc2_-- > 0)
         {
            if(this.zblist[_loc2_])
            {
               _loc1_ += MyEquipObj(this.zblist[_loc2_]).getEquipSaveObj();
               if(_loc2_ != 0)
               {
                  _loc1_ += "}";
               }
            }
         }
         return _loc1_;
      }
      
      public function getCurEquipSaveString() : String
      {
         var _loc1_:* = "";
         var _loc2_:uint = this.curarray.length;
         while(_loc2_-- > 0)
         {
            _loc1_ += MyEquipObj(this.curarray[_loc2_]).getEquipSaveObj();
            if(_loc2_ != 0)
            {
               _loc1_ += "}";
            }
         }
         return _loc1_;
      }
      
      public function getBagDaoJuEquipSaveString() : String
      {
         var _loc1_:* = "";
         var _loc2_:uint = this.djlist.length;
         while(_loc2_-- > 0)
         {
            if(this.djlist[_loc2_])
            {
               _loc1_ += MyEquipObj(this.djlist[_loc2_]).getEquipSaveObj();
               if(_loc2_ != 0)
               {
                  _loc1_ += "}";
               }
            }
         }
         return _loc1_;
      }
      
      public function getBagSZEquipSaveString() : String
      {
         var _loc1_:* = "";
         var _loc2_:uint = this.szlist.length;
         while(_loc2_-- > 0)
         {
            if(this.szlist[_loc2_])
            {
               _loc1_ += MyEquipObj(this.szlist[_loc2_]).getEquipSaveObj();
               if(_loc2_ != 0)
               {
                  _loc1_ += "}";
               }
            }
         }
         return _loc1_;
      }
      
      public function getBagJNSEquipSaveString() : String
      {
         var _loc1_:* = "";
         var _loc2_:uint = this.jnslist.length;
         while(_loc2_-- > 0)
         {
            if(this.jnslist[_loc2_])
            {
               _loc1_ += MyEquipObj(this.jnslist[_loc2_]).getEquipSaveObj();
               if(_loc2_ != 0)
               {
                  _loc1_ += "}";
               }
            }
         }
         return _loc1_;
      }
      
      public function removeSomeOneDJByFillName(param1:String) : void
      {
         var _loc2_:Number = 0;
         var _loc3_:MyEquipObj = this.getSomeEquipInPackBackByName(param1);
         if(_loc3_)
         {
            if(_loc3_.getENum() > 1)
            {
               _loc3_.setNum(-1);
            }
            else
            {
               _loc2_ = Number(this.djlist.indexOf(_loc3_));
               if(_loc2_ != -1)
               {
                  this.djlist.splice(_loc2_,1);
               }
            }
         }
         _loc3_ = null;
      }
      
      public function getSaveObj() : Object
      {
         this.saveObj.controlPlayer = this.controlPlayer;
         this.saveObj.lhValue = this.getLhValue();
         this.saveObj.myscore = this.getMyScore();
         this.saveObj.curExp = this.getCurExp();
         this.saveObj.curLevel = this.getCurLevel();
         this.saveObj.skillLimit = this.getSkillLimt();
         this.saveObj.roleid = this.roleid;
         this.saveObj.isstudyskill = this.isstudyskill;
         this.saveObj.skillbykey = this.skillbykey;
         this.saveObj.immortalitylist = this.immortalitylist;
         this.saveObj.ispassiveskill = this.ispassiveskill;
         this.saveObj.allTask = this.gc.allTask.saveAllTask();
         this.saveObj.actTask = this.gc.allTask.saveActionTask();
         this.saveObj.saveDate = this.gc.curdate;
         this.saveObj.petSave = this.getPetSaveString();
         this.saveObj.luckdata = this.getLuckData();
         this.saveObj.bagSaveString = this.getBagEquipSaveString();
         this.saveObj.curSaveString = this.getCurEquipSaveString();
         this.saveObj.bagdjSaveString = this.getBagDaoJuEquipSaveString();
         this.saveObj.bagszSaveString = this.getBagSZEquipSaveString();
         this.saveObj.bagjnsSaveString = this.getBagJNSEquipSaveString();
         this.saveObj.isshowfashion = this.isshowfashion;
         this.saveObj.username = this.gc.myname;
         this.saveObj.istest = this.gc.istest;
         this.saveObj.gameversion = AllConsts.GAME_CONFIG_VERSION;
         return this.saveObj;
      }
      
      public function setSaveObj(param1:Object) : void
      {
         var _loc2_:* = undefined;
         var _loc3_:* = undefined;
         var _loc4_:* = undefined;
         var _loc5_:* = 0;
         var _loc6_:* = null;
         var _loc7_:* = null;
         var _loc8_:* = 0;
         var _loc9_:* = null;
         var _loc10_:* = 0;
         var _loc11_:* = null;
         var _loc12_:* = 0;
         var _loc13_:* = null;
         var _loc14_:uint = 0;
         var _loc15_:MyEquipObj = null;
         var _loc16_:* = null;
         var _loc17_:* = null;
         var _loc18_:* = null;
         var _loc19_:* = null;
         var _loc20_:String = null;
         var _loc21_:int = 0;
         var _loc22_:int = 0;
         this.zblist = [];
         this.djlist = [];
         this.szlist = [];
         this.curarray = [];
         this.curEquipType = ["zbwq","zbfj","zbsp","zbfb","zbsz","zbcb","zbtx"];
         this.controlPlayer = param1.controlPlayer;
         if(this.checkCheet(param1))
         {
            HackChecker.hackHandler();
         }
         this.setLhValue(param1.lhValue);
         this.setMyScore(param1.myscore);
         if(this.gc.isFirst)
         {
            if(param1.curLevel >= AllConsts.GAME_ROLE_MAXLEVEL)
            {
               this.setCurExp(0);
               this.setCurLevel(AllConsts.GAME_ROLE_MAXLEVEL - 1);
            }
            else
            {
               this.setCurExp(param1.curExp);
               this.setCurLevel(param1.curLevel);
            }
         }
         else
         {
            this.setCurExp(param1.curExp);
            this.setCurLevel(param1.curLevel);
         }
         this.setSkillLimit(10);
         this.roleid = param1.roleid;
         this.isstudyskill = param1.isstudyskill;
         this.skillbykey = param1.skillbykey;
         if(param1.immortalitylist != null)
         {
            this.immortalitylist = param1.immortalitylist;
         }
         else
         {
            this.immortalitylist = [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]];
         }
         var _loc23_:uint = this.skillbykey.length;
         while(_loc23_-- > 0)
         {
            if(this.skillbykey[_loc23_])
            {
               this.skillbykey[_loc23_].needLh = this.gc.findLhValueBySkillName(this.skillbykey[_loc23_].skillName,this.skillbykey[_loc23_].slev);
               if(this.skillbykey[_loc23_].slev > 18)
               {
                  this.skillbykey[_loc23_].slev = 1;
                  this.setSkillLevelInTheAllSkillAry(this.skillbykey[_loc23_].skillName,18);
               }
            }
         }
         this.setStrengthLevel();
         this.ispassiveskill = param1.ispassiveskill;
         var _loc24_:int = Math.floor(this.getCurLevel() / 5);
         var _loc25_:int = 0;
         for each(_loc2_ in this.ispassiveskill)
         {
            _loc3_ = _loc2_;
            while(_loc3_ > _loc24_)
            {
               if(_loc3_ == _loc24_ + 1)
               {
                  this.ispassiveskill[_loc25_] = _loc24_;
                  _loc4_ = _loc24_;
                  while(_loc4_ < _loc2_)
                  {
                     this.setLhValue(this.getLhValue() + (_loc4_ + 1) * 5000);
                     _loc4_++;
                  }
               }
               _loc3_--;
            }
            _loc25_++;
         }
         this.savePetSaveString(param1.petSave);
         this.setExAry(this.gc.saveId,this.roleid);
         if(param1.luckdata > 60)
         {
            System.pause();
         }
         if(this.gc.curdate == param1.saveDate)
         {
            this.gc.allTask.setAllTask(param1.allTask);
            this.setLuckData(param1.luckdata);
         }
         else
         {
            this.setTadayLuckValue();
         }
         this.gc.allTask.setActTask(param1.actTask);
         var _loc26_:String = new String();
         if(param1.bagSaveString != undefined)
         {
            _loc16_ = param1.bagSaveString;
            _loc7_ = _loc16_.split("}");
            _loc5_ = uint(_loc7_.length);
            while(_loc5_-- > 0)
            {
               if(_loc7_[_loc5_] != "")
               {
                  _loc6_ = new MyEquipObj();
                  _loc26_ = _loc7_[_loc5_].split("|")[2];
                  if(this.gc.allEquip.findByName(_loc26_) != null)
                  {
                     _loc6_.setEquipSaveObj(_loc7_[_loc5_]);
                     this.zblist.push(_loc6_);
                  }
               }
            }
         }
         this.test = param1.istest;
         this.isshowfashion = param1.isshowfashion;
         this.gc.myname = param1.username;
         if(param1.bagdjSaveString != undefined)
         {
            _loc17_ = param1.bagdjSaveString;
            if(_loc17_.charAt(_loc17_.length - 1) == "}")
            {
               _loc17_ = _loc17_.substr(0,Number(_loc17_.length) - 2);
            }
            _loc7_ = _loc17_.split("}");
            _loc8_ = uint(_loc7_.length);
            while(_loc8_-- > 0)
            {
               if(_loc7_[_loc8_] != "")
               {
                  _loc9_ = new MyEquipObj();
                  _loc26_ = _loc17_.split("}")[_loc8_].split("|")[2];
                  if(this.gc.allEquip.findByName(_loc26_) != null)
                  {
                     _loc9_.setEquipSaveObj(_loc17_.split("}")[_loc8_]);
                     if(_loc9_.type == "zbtx")
                     {
                        this.zblist.push(_loc9_);
                     }
                     this.djlist.push(_loc9_);
                  }
               }
            }
         }
         if(param1.bagszSaveString != undefined)
         {
            _loc18_ = param1.bagszSaveString;
            if(_loc18_.charAt(_loc18_.length - 1) == "}")
            {
               _loc18_ = _loc18_.substr(0,Number(_loc18_.length) - 2);
            }
            _loc7_ = _loc18_.split("}");
            _loc10_ = uint(_loc7_.length);
            while(_loc10_-- > 0)
            {
               if(_loc7_[_loc10_] != "")
               {
                  _loc11_ = new MyEquipObj();
                  _loc26_ = _loc18_.split("}")[_loc10_].split("|")[2];
                  if(this.gc.allEquip.findByName(_loc26_) != null)
                  {
                     _loc11_.setEquipSaveObj(_loc18_.split("}")[_loc10_]);
                     this.szlist.push(_loc11_);
                  }
               }
            }
         }
         if(param1.bagjnsSaveString != undefined)
         {
            _loc20_ = param1.bagjnsSaveString;
            if(_loc20_.charAt(_loc20_.length - 1) == "}")
            {
               _loc20_ = _loc20_.substr(0,_loc20_.length - 2);
            }
            _loc14_ = uint((_loc7_ = _loc20_.split("}")).length);
            while(_loc14_-- > 0)
            {
               if(_loc7_[_loc14_] != "")
               {
                  _loc15_ = new MyEquipObj();
                  _loc26_ = _loc20_.split("}")[_loc14_].split("|")[2];
                  if(this.gc.allEquip.findByName(_loc26_) != null)
                  {
                     _loc15_.setEquipSaveObj(_loc20_.split("}")[_loc14_]);
                     this.jnslist.push(_loc15_);
                  }
               }
            }
         }
         if(param1.curSaveString != undefined)
         {
            _loc19_ = param1.curSaveString;
            if(_loc19_.charAt(_loc19_.length - 1) == "}")
            {
               _loc19_ = _loc19_.substr(0,Number(_loc19_.length) - 2);
            }
            _loc7_ = _loc19_.split("}");
            _loc12_ = uint(_loc7_.length);
            _loc21_ = 0;
            while(_loc21_ < _loc12_)
            {
               if(_loc7_[_loc21_] != "")
               {
                  _loc13_ = new MyEquipObj();
                  _loc26_ = _loc19_.split("}")[_loc21_].split("|")[2];
                  if(this.gc.allEquip.findByName(_loc26_) != null)
                  {
                     _loc13_.setEquipSaveObj(_loc19_.split("}")[_loc21_]);
                     if(this.curEquipType.length > 0)
                     {
                        if(_loc13_.type)
                        {
                           _loc22_ = int(this.curEquipType.indexOf(_loc13_.type));
                           if(_loc22_ != -1)
                           {
                              if(_loc13_.type == "zbsz")
                              {
                                 if(_loc13_.hasPassTime())
                                 {
                                    this.szlist.push(_loc13_);
                                 }
                                 else
                                 {
                                    this.curarray.push(_loc13_);
                                    this.curEquipType.splice(_loc22_,1);
                                 }
                              }
                              else
                              {
                                 this.curarray.push(_loc13_);
                                 this.curEquipType.splice(_loc22_,1);
                              }
                           }
                           else
                           {
                              this.zblist.push(_loc13_);
                           }
                        }
                     }
                  }
               }
               _loc21_++;
            }
         }
      }
      
      private function setStrengthLevel() : void
      {
         var _loc1_:uint = this.skillbykey.length;
         while(_loc1_-- > 0)
         {
            if(this.skillbykey[_loc1_].slev > 18)
            {
               this.skillbykey[_loc1_].slev = 1;
            }
         }
      }
      
      private function setTadayLuckValue() : void
      {
         if(this.getCurLevel() <= 4)
         {
            this.setLuckData(1 + Math.round(Math.random() * 4));
         }
         else if(this.getCurLevel() >= 5 && this.getCurLevel() <= 10)
         {
            this.setLuckData(1 + Math.round(Math.random() * 9));
         }
         else
         {
            this.setLuckData(1 + Math.round(Math.random() * 19));
         }
      }
      
      private function getPetSaveString() : String
      {
         var _loc1_:uint = this.petsAry.length;
         var _loc2_:* = "";
         var _loc3_:int = 0;
         while(_loc3_ < _loc1_)
         {
            _loc2_ += PetInfo(this.petsAry[_loc3_]).getSaveString();
            if(_loc3_ != _loc1_ - 1)
            {
               _loc2_ += "}";
            }
            _loc3_++;
         }
         return _loc2_;
      }
      
      private function savePetSaveString(param1:String) : void
      {
         var _loc2_:Array = null;
         var _loc3_:* = null;
         _loc2_ = param1.split("}");
         var _loc4_:uint = _loc2_.length;
         while(_loc4_-- > 0)
         {
            if(_loc2_[_loc4_] != "")
            {
               _loc3_ = new PetInfo();
               _loc3_.setSaveString(_loc2_[_loc4_]);
               this.petsAry.push(_loc3_);
            }
         }
      }
      
      public function setExAry(param1:int = -1, param2:int = -1, param3:int = -1) : void
      {
         if(param1 != -1)
         {
            this.exAry[0] = param1;
         }
         if(param2 != -1)
         {
            this.exAry[1] = param2;
         }
         if(param3 != -1)
         {
            this.exAry[2] = param3;
         }
      }
      
      public function getRoleName() : String
      {
         var _loc1_:String = "";
         if(this.roleid == 1)
         {
            _loc1_ = "孙悟空";
         }
         else if(this.roleid == 2)
         {
            _loc1_ = "唐僧";
         }
         else if(this.roleid == 3)
         {
            _loc1_ = "八戒";
         }
         else if(this.roleid == 4)
         {
            _loc1_ = "沙僧";
         }
         else if(this.roleid == 5)
         {
            _loc1_ = "白龙";
         }
         return _loc1_;
      }
      
      public function returnSkillNameBySkillKey(param1:String) : Array
      {
         var _loc2_:int = 0;
         var _loc3_:uint = Math.min(this.skillbykey.length,5);
         var _loc4_:* = ["slz","zz","sx","qsez","hmz","lys","hytj","lyfb","jdy","hyjj","sgq","myhc","jgz","tjgl","jhsj","blb","xbz","shy","sjt","smb","dj","sd","rj","zznh","syzq","ssp","jsp","dgq","xgq","tmc","zq","mbyj","wdww","jdz","mds","qlj","tkj","dzj","lybj","mmw","xlc","yyb","pkz","tlj","lysh","lxj","lxuanj","xkjz","jrjl","mlsz"];
         while(_loc3_-- > 0)
         {
            if(this.skillbykey[_loc3_].keys == param1)
            {
               if(_loc4_.indexOf(this.skillbykey[_loc3_].skillName) != -1)
               {
                  if(this.skillbykey[_loc3_].slev > 18)
                  {
                     this.skillbykey[_loc3_].slev = 1;
                  }
               }
               else
               {
                  this.skillbykey[_loc3_].slev = 1;
               }
               _loc2_ = int(this.gc.findLhValueBySkillName(this.skillbykey[_loc3_].skillName,this.returnSkillLevelBySkillName(this.skillbykey[_loc3_].skillName)));
               return [this.skillbykey[_loc3_].skillName,_loc2_,undefined,this.returnSkillIsStudy(param1)];
            }
         }
         return null;
      }
      
      public function returnSkillLevelBySkillName(param1:String) : int
      {
         var _loc2_:uint = this.skillbykey.length;
         var _loc3_:* = ["slz","zz","sx","qsez","hmz","lys","hytj","lyfb","jdy","hyjj","sgq","myhc","jgz","tjgl","jhsj","blb","xbz","shy","sjt","smb","dj","sd","rj","zznh","syzq","ssp","jsp","dgq","xgq","tmc","zq","mbyj","wdww","jdz","mds","qlj","tkj","dzj","lybj","mmw","xlc","yyb","pkz","tlj","lysh","lxj","lxuanj","xkjz","jrjl","mlsz"];
         while(_loc2_-- > 0)
         {
            if(this.skillbykey[_loc2_].skillName == param1)
            {
               if(this.skillbykey[_loc2_].slev == undefined || int(this.skillbykey[_loc2_].slev) == 0)
               {
                  this.skillbykey[_loc2_].slev = 1;
               }
               if(_loc3_.indexOf(param1) != -1)
               {
                  if(this.skillbykey[_loc2_].slev > 18)
                  {
                     this.skillbykey[_loc2_].slev = 1;
                     return 1;
                  }
                  return this.returnSkillIsStudy(param1);
               }
               this.skillbykey[_loc2_].slev = 1;
               return 1;
            }
         }
         return 1;
      }
      
      public function returnSkillObjBySkillKey(param1:String) : Object
      {
         var _loc2_:uint = Math.min(this.skillbykey.length,5);
         while(_loc2_-- > 0)
         {
            if(this.skillbykey[_loc2_].keys == param1)
            {
               return this.skillbykey[_loc2_];
            }
         }
         return null;
      }
      
      public function getSkillStringBySkillName(param1:String) : Array
      {
         var _loc2_:* = undefined;
         var _loc3_:* = null;
         var _loc4_:* = 0;
         var _loc5_:int = 0;
         var _loc6_:* = null;
         var _loc7_:uint = this.isstudyskill.length;
         var _loc8_:* = this.isstudyskill;
         for each(_loc2_ in this.isstudyskill)
         {
            if(_loc2_.skillName.indexOf(param1) != -1)
            {
               _loc3_ = _loc2_.skillName.split("|");
               _loc4_ = uint(_loc3_.length);
               _loc5_ = 0;
               while(_loc5_ < _loc4_)
               {
                  _loc6_ = _loc3_[_loc5_].split("~");
                  if(_loc6_.indexOf(param1) != -1)
                  {
                     return _loc6_;
                  }
                  _loc5_++;
               }
            }
         }
         return null;
      }
      
      public function getSkillBySkillName(param1:String) : Boolean
      {
         var _loc2_:* = undefined;
         var _loc3_:* = null;
         var _loc4_:* = 0;
         var _loc5_:int = 0;
         var _loc6_:* = null;
         var _loc7_:uint = this.isstudyskill.length;
         var _loc8_:* = this.isstudyskill;
         for each(_loc2_ in this.isstudyskill)
         {
            if(_loc2_.skillName.indexOf(param1) != -1)
            {
               _loc3_ = _loc2_.skillName.split("|");
               _loc4_ = uint(_loc3_.length);
               _loc5_ = 0;
               while(_loc5_ < _loc4_)
               {
                  _loc6_ = _loc3_[_loc5_].split("~");
                  if(_loc6_.indexOf(param1) != -1)
                  {
                     return true;
                  }
                  _loc5_++;
               }
            }
         }
         return false;
      }
      
      public function setSkillLevelInTheAllSkillAry(param1:String, param2:uint) : void
      {
         var _loc3_:* = undefined;
         var _loc4_:int = 0;
         var _loc5_:* = undefined;
         var _loc6_:* = undefined;
         var _loc7_:* = null;
         var _loc8_:int = 0;
         var _loc9_:* = null;
         var _loc10_:int = 0;
         var _loc11_:uint = this.isstudyskill.length;
         _loc3_ = {};
         while(_loc11_-- > 0)
         {
            _loc3_ = this.isstudyskill[_loc11_];
            _loc7_ = _loc3_.skillName.split("|");
            if(_loc7_)
            {
               _loc8_ = 0;
               while(_loc8_ < _loc7_.length)
               {
                  _loc10_ = int((_loc9_ = _loc7_[_loc8_].split("~")).indexOf(param1));
                  if(_loc10_ != -1)
                  {
                     _loc7_[_loc8_] = _loc9_[_loc10_] + "~" + param2;
                     _loc3_.skillName = "";
                     _loc4_ = 0;
                     _loc5_ = _loc7_;
                     for each(_loc6_ in _loc7_)
                     {
                        if(_loc6_ != "")
                        {
                           _loc3_.skillName += _loc6_ + "|";
                        }
                     }
                     break;
                  }
                  _loc8_++;
               }
            }
         }
      }
      
      public function findSkillIsInTheSkillAry(param1:String) : Boolean
      {
         var _loc2_:uint = Math.min(this.skillbykey.length,5);
         while(_loc2_-- > 0)
         {
            if(this.skillbykey[_loc2_].skillName == param1)
            {
               return true;
            }
         }
         return false;
      }
      
      public function returnSkillIsInTheSkillAry(param1:String, param2:Boolean = false) : Object
      {
         var _loc3_:uint = 0;
         if(param2)
         {
            _loc3_ = Math.min(this.skillbykey.length,5);
         }
         else
         {
            _loc3_ = this.skillbykey.length;
         }
         while(_loc3_-- > 0)
         {
            if(this.skillbykey[_loc3_].skillName == param1)
            {
               return this.skillbykey[_loc3_];
            }
         }
         return null;
      }
      
      public function returnSkillIsStudy(param1:String) : int
      {
         var _loc2_:Array = null;
         var _loc8_:int = 0;
         var _loc3_:Array = String(this.isstudyskill[0].skillName).split("|");
         var _loc4_:Array = String(this.isstudyskill[1].skillName).split("|");
         var _loc5_:uint = String(this.isstudyskill[0].skillName).split("|").length;
         var _loc6_:uint = String(this.isstudyskill[1].skillName).split("|").length;
         while(_loc5_-- > 0)
         {
            _loc2_ = _loc3_[_loc5_].split("~");
            if(_loc2_[0] == param1)
            {
               return int(_loc2_[1]);
            }
         }
         while(_loc6_-- > 0)
         {
            _loc2_ = _loc4_[_loc6_].split("~");
            if(_loc2_[0] == param1)
            {
               return int(_loc2_[1]);
            }
         }
         return 1;
      }
      
      public function findCurrentPet(param1:Boolean = false) : PetInfo
      {
         var _loc2_:uint = this.petsAry.length;
         while(_loc2_-- > 0)
         {
            if(this.petsAry[_loc2_].isFight == 1)
            {
               if(this.petsAry[_loc2_].getlifetime() > 0)
               {
                  return this.petsAry[_loc2_];
               }
               if(param1)
               {
                  return this.petsAry[_loc2_];
               }
            }
         }
         return null;
      }
      
      public function findBiggestPetLevel() : int
      {
         var _loc1_:int = 0;
         var _loc2_:uint = this.petsAry.length;
         while(_loc2_-- > 0)
         {
            _loc1_ = PetInfo(this.petsAry[_loc2_]).getLevel() > _loc1_ ? int(int(PetInfo(this.petsAry[_loc2_]).getLevel())) : int(int(_loc1_));
         }
         return _loc1_;
      }
      
      public function catchNewPet(param1:String, param2:uint = 1) : Boolean
      {
         var _loc3_:PetInfo = null;
         var _loc4_:uint = this.petsAry.length;
         if(_loc4_ >= AllConsts.GAME_PET_MAXSEATS)
         {
            return false;
         }
         _loc3_ = new PetInfo();
         _loc3_.setPetNameAndLevel(param1,param2);
         this.petsAry.push(_loc3_);
         return true;
      }
      
      public function howMuchSkillHasYouStudy() : uint
      {
         var _loc1_:* = null;
         var _loc2_:* = 0;
         var _loc3_:int = 0;
         while(_loc3_ < 2)
         {
            _loc1_ = String(this.isstudyskill[_loc3_].skillName).split("|");
            _loc2_ = uint(_loc2_ + (_loc1_.length - 1));
            _loc3_++;
         }
         return _loc2_;
      }
      
      public function findWhichSkillBtnNoneSet() : String
      {
         var _loc1_:int = 0;
         var _loc2_:String = "";
         var _loc3_:* = [];
         if(this.controlPlayer == 0)
         {
            _loc3_ = ["Y","U","I","O","L"];
         }
         else
         {
            _loc3_ = ["8","4","5","6","3"];
         }
         var _loc4_:uint = Math.min(this.skillbykey.length,5);
         while(_loc4_-- > 0)
         {
            if(this.skillbykey[_loc4_])
            {
               _loc1_ = int(_loc3_.indexOf(this.skillbykey[_loc4_].keys));
               if(_loc1_ != -1)
               {
                  _loc3_.splice(_loc1_,1);
               }
            }
         }
         if(_loc3_[0])
         {
            _loc2_ = _loc3_[0];
         }
         return _loc2_;
      }
      
      public function reSetAllPetState() : void
      {
         var _loc1_:uint = this.petsAry.length;
         while(_loc1_-- > 0)
         {
            PetInfo(this.petsAry[_loc1_]).reSetPetState();
         }
      }
      
      private function checkCheet(param1:Object) : Boolean
      {
         if(param1.lhValue < 0 || param1.lhValue > AllConsts.GAME_ROLE_MAXVALUE)
         {
            return true;
         }
         if(param1.myscore < 0 || param1.myscore > AllConsts.GAME_ROLE_MAXVALUE)
         {
            return false;
         }
         if(param1.curLevel > AllConsts.GAME_ROLE_MAXLEVEL)
         {
            this.setCurLevel(AllConsts.GAME_ROLE_MAXLEVEL);
         }
         return false;
      }
      
      public function findAllImmortalityAddHp() : uint
      {
         var _loc1_:uint = 0;
         var _loc2_:uint = 0;
         var _loc3_:uint = uint(this.immortalitylist[0].length);
         while(_loc3_-- > 0)
         {
            _loc2_ = uint(this.immortalitylist[0][_loc3_]);
            while(_loc2_-- > 0)
            {
               if(_loc3_ == 4)
               {
                  _loc1_ += 1000;
               }
               else if(_loc3_ == 3)
               {
                  _loc1_ += 700;
               }
               else if(_loc3_ == 2)
               {
                  _loc1_ += 400;
               }
               else if(_loc3_ == 1)
               {
                  _loc1_ += 250;
               }
               else if(_loc3_ == 0)
               {
                  _loc1_ += 200;
               }
            }
         }
         return _loc1_;
      }
      
      public function findAllImmortalityAddMp() : uint
      {
         var _loc1_:uint = 0;
         var _loc2_:uint = 0;
         var _loc3_:uint = uint(this.immortalitylist[1].length);
         while(_loc3_-- > 0)
         {
            _loc2_ = uint(this.immortalitylist[1][_loc3_]);
            while(_loc2_-- > 0)
            {
               if(_loc3_ == 4)
               {
                  _loc1_ += 800;
               }
               else if(_loc3_ == 3)
               {
                  _loc1_ += 600;
               }
               else if(_loc3_ == 2)
               {
                  _loc1_ += 400;
               }
               else if(_loc3_ == 1)
               {
                  _loc1_ += 300;
               }
               else if(_loc3_ == 0)
               {
                  _loc1_ += 200;
               }
            }
         }
         return _loc1_;
      }
      
      public function findAllImmortalityAddCrit() : uint
      {
         var _loc1_:uint = 0;
         var _loc2_:uint = 0;
         var _loc3_:uint = uint(this.immortalitylist[2].length);
         while(_loc3_-- > 0)
         {
            _loc2_ = uint(this.immortalitylist[2][_loc3_]);
            while(_loc2_-- > 0)
            {
               if(_loc3_ == 4)
               {
                  _loc1_ += 5;
               }
               else if(_loc3_ == 3)
               {
                  _loc1_ += 4;
               }
               else if(_loc3_ == 2)
               {
                  _loc1_ += 3;
               }
               else if(_loc3_ == 1)
               {
                  _loc1_ += 2;
               }
               else if(_loc3_ == 0)
               {
                  _loc1_ += 1;
               }
            }
         }
         return _loc1_;
      }
      
      public function findAllImmortalityAddCHp() : uint
      {
         var _loc1_:uint = 0;
         var _loc2_:uint = 0;
         var _loc3_:uint = uint(this.immortalitylist[3].length);
         while(_loc3_-- > 0)
         {
            _loc2_ = uint(this.immortalitylist[3][_loc3_]);
            while(_loc2_-- > 0)
            {
               if(_loc3_ == 4)
               {
                  _loc1_ += 18;
               }
               else if(_loc3_ == 3)
               {
                  _loc1_ += 14;
               }
               else if(_loc3_ == 2)
               {
                  _loc1_ += 12;
               }
               else if(_loc3_ == 1)
               {
                  _loc1_ += 10;
               }
               else if(_loc3_ == 0)
               {
                  _loc1_ += 6;
               }
            }
         }
         return _loc1_;
      }
      
      public function findAllImmortalityAddCMp() : uint
      {
         var _loc1_:uint = 0;
         var _loc2_:uint = 0;
         var _loc3_:uint = uint(this.immortalitylist[4].length);
         while(_loc3_-- > 0)
         {
            _loc2_ = uint(this.immortalitylist[4][_loc3_]);
            while(_loc2_-- > 0)
            {
               if(_loc3_ == 4)
               {
                  _loc1_ += 8;
               }
               else if(_loc3_ == 3)
               {
                  _loc1_ += 7;
               }
               else if(_loc3_ == 2)
               {
                  _loc1_ += 5;
               }
               else if(_loc3_ == 1)
               {
                  _loc1_ += 3;
               }
               else if(_loc3_ == 0)
               {
                  _loc1_ += 1;
               }
            }
         }
         return _loc1_;
      }
      
      public function findAllImmortalityAdd() : Array
      {
         return [this.findAllImmortalityAddHp(),this.findAllImmortalityAddMp(),this.findAllImmortalityAddCrit(),this.findAllImmortalityAddCHp(),this.findAllImmortalityAddCMp()];
      }
   }
}

