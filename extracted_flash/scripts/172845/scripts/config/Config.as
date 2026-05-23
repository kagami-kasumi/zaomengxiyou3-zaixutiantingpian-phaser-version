package config
{
   import World.PhysicsWorld;
   import base.*;
   import com.edgarcai.encrypt.*;
   import com.edgarcai.gamelogic.*;
   import com.multi4399.Client;
   import com.multi4399.keys.*;
   import event.*;
   import export.*;
   import export.hero.*;
   import export.muti.*;
   import export.saveInterface.SaveInter;
   import flash.display.*;
   import flash.events.*;
   import flash.net.LocalConnection;
   import flash.net.URLLoader;
   import flash.text.*;
   import flash.utils.*;
   import my.*;
   import storage.*;
   import task.*;
   import user.*;
   
   public class Config
   {
      
      internal static var instance:Config;
      
      public static var MODE1:int = 1;
      
      public static var MODE2:int = 2;
      
      public static var MODE3:int = 3;
      
      public var Role5Skill4Interval:int = 0;
      
      public var isLWYP:Boolean = false;
      
      public var isXl:Boolean = false;
      
      public var isZx:Boolean = true;
      
      public var needMMP:Array;
      
      public var difficulity:uint;
      
      public var SummonMonsterSpeed:int = 1;
      
      public var klsmode:uint;
      
      public var allSklName:Array;
      
      public var myname:String;
      
      private const base64chars:String = "zYxWvUtSrQpOnMlKjIhGfEdCbAaBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890+/=";
      
      private const ENCRYPT_KEY:uint = 90;
      
      public var memory:MemoryClass;
      
      public var localuserid1:String = "";
      
      public var localuserid2:String = "";
      
      public var localuserid3:Array;
      
      public var opening:Boolean;
      
      public var openinghhe:Boolean;
      
      public var gameinwhere:String = "开场";
      
      public var eventManger:AEventDispatcher;
      
      public var playNum:uint;
      
      public var hero1:BaseHero;
      
      public var hero2:BaseHero;
      
      public var player1:User;
      
      public var player2:User;
      
      public var gameSence:BaseGameSence;
      
      public var frameClips:uint = 30;
      
      public var gameInfo:GameInfo;
      
      public var pWorld:PhysicsWorld;
      
      public var bg1:FloorBg;
      
      public var bg2:MovieClip;
      
      public var stage:Stage;
      
      public var isStopGame:Boolean;
      
      public var vControllor:ViewControllor;
      
      public var keyboardControl:KeyBoardControl;
      
      public var allEquip:AllEquipment;
      
      public var allTask:GameTask;
      
      public var otherList:Array;
      
      public var isnew:Boolean;
      
      public var hasget:Boolean;
      
      public var hasgetsorry:uint = 0;
      
      public var hasgetslsorry:uint = 0;
      
      public var openPig:Boolean;
      
      public var isFirst:Boolean = true;
      
      public var isHideDebug:Boolean = true;
      
      public var istest:Boolean = false;
      
      public var isFirstPlayGame:Boolean = true;
      
      public var isinthestrengthpack:Boolean;
      
      public var isintheselectmap:Boolean;
      
      public var isingamemenu:Boolean;
      
      public var isingameshop:Boolean;
      
      public var isinthegame:Boolean = false;
      
      public var curBigStage:uint = 1;
      
      public var curBigLevel:uint = 1;
      
      public var lc:LocalConnection;
      
      public var playerName:String;
      
      public var logInfo:Object;
      
      public var isfirstLogin:Boolean;
      
      public var loginAlert:MovieClip;
      
      public var dealAlert:Sprite;
      
      public var lastSubmitScore:int;
      
      public var saveInter:SaveInter;
      
      public var saveIntervelCount:int;
      
      public var saveTimer:Timer;
      
      public var startTime:int;
      
      public var pausepre:int;
      
      public var pauseaft:int;
      
      public var pauseTime:int;
      
      public var endTime:int;
      
      public var timeCountArray:Array;
      
      public var protectedPerproty:MyProtectedProperty;
      
      public var ts:Infomation;
      
      public var saveId:int = -1;
      
      public var isManyOpen:Boolean;
      
      public var afterManyOpenCheckFunc:Function;
      
      public var server:Client;
      
      public var isServerOk:Boolean;
      
      public var hdInfo:Array;
      
      public var qhsInfo:Array;
      
      public var curLevel:uint = 1;
      
      public var curStage:uint = 4;
      
      public var isLevelClear:Boolean;
      
      public var maxMonsterPerScreen:int = 8;
      
      public var gameMode:int;
      
      public var lastDelayTime:uint;
      
      public var heroBuffArray:Array;
      
      public var sid:int = -1;
      
      public var whoreadbackpackage:uint = 0;
      
      public var whobuying:uint = 1;
      
      public var position:String;
      
      public var isRoomOnwer:Boolean;
      
      public var roomOnwerSid:int = -1;
      
      public var chooseMap:uint;
      
      public var nodeInfo:NodeInfo;
      
      public var nodeFloor:uint = 0;
      
      public var roomInfo:String = "NO";
      
      public var obbsiteArray:Array;
      
      public var gameScore:Object;
      
      public var urlLoader:URLLoader;
      
      public var curdate:String;
      
      public var nymark:String = "";
      
      public var cardId:String = "";
      
      public var bigLibao:Array;
      
      public var smallLibao:Array;
      
      public var chatRegExp:RegExp;
      
      public var needlh:int = 0;
      
      public var israndom:int = 0;
      
      public var Objectdata:Antiwear;
      
      public var isPK:Boolean = false;
      
      public var effectCtrler:BaseEffect;
      
      public var curStageAndCurLevel:Antiwear;
      
      public function Config()
      {
         this.localuserid3 = [];
         this.eventManger = new AEventDispatcher();
         this.allEquip = new AllEquipment();
         this.allTask = new GameTask();
         this.otherList = new Array();
         this.timeCountArray = [];
         this.ts = new Infomation();
         this.hdInfo = [];
         this.qhsInfo = [];
         this.heroBuffArray = [];
         this.nodeInfo = new NodeInfo();
         this.obbsiteArray = [];
         this.gameScore = {
            "sl1_1":0,
            "sl1_2":0,
            "sl1_3":0,
            "sl2_1":0,
            "sl2_2":0,
            "sl2_3":0,
            "sl3_1":0,
            "sl3_2":0,
            "sl3_3":0,
            "sl4_1":0,
            "sl5_1":0,
            "sl6_1":0,
            "sl7_1":0,
            "sl8_1":0,
            "sl9_1":0
         };
         this.allSklName = [["slz","zz","sx","qsez","hmz"],["lys","hytj","lyfb","jdy","hyjj"],["sgq","myhc","jgz","tjgl","jhsj"],["blb","xbz","shy","sjt","smb"],["dj","sd","rj","zznh","syzq"],["ssp","jsp","dgq","xgq","tmc"],["zq","mbyj","wdww","jdz","mds"],["qlj","tkj","dzj","lybj","mmw"],["xlc","yyb","pkz","tlj","lysh"],["lxj","lxuanj","xkjz","jrjl","mlsz"]];
         this.needMMP = [[[10,20,32,53,75,109,139,179,228],[15,23,36,61,86,113,161,207,264],[0,0,0,0,0,0,0,0,0],[26,60,105,150,195,240,285,330,375],[30,72,116,164,240,300,380,450,540,600]],[[9,18,40,78,106,140,195,265,310,360],[10,20,32,53,75,109,139,179,228],[18,44,72,119,168,234,313,441,600],[18,40,70,100,130,160,190,220,250],[30,72,116,164,240,300,380,450,540,600]],[[10,24,40,58,80,106,138,179,230],[20,30,76,110,164,246,344,462,600],[15,40,80,130,185,240,290,340,400],[20,60,160,250,330,430,520,610,700,780],[30,75,135,201,282,384,511,666,876,1146]],[[12,25,38,56,78,104,136,176,226],[20,69,124,186,259,346,450,579,735],[8,15,40,70,105,140,185,235,290],[0,0,0,0,0,0,0,0,0],[30,76,149,241,344,452,591,732,870,1000]],[[10,24,40,58,80,106,138,179,228],[10,27,47,81,128,180,233,300,380],[0,0,0,0,0,0,0,0,0],[10,33,67,103,159,208,260,314,360],[20,69,124,186,259,346,450,579,735,904]],[[12,25,38,55,72,95,124,162,208],[18,35,69,103,144,190,220,250,280,300],[16,33,67,103,152,208,259,315,372],[24,56,106,164,229
         ,307,398,511,646],[30,72,150,231,338,430,520,620,700,820]],[[10,20,32,53,75,109,139,179,228],[10,27,47,81,128,189,263,351,452,500],[28,60,140,200,270,330,400,500,580,700],[25,56,106,164,229,307,398,511,646],[0,0,0,0,0,0,0,0,0,0]],[[10,24,40,58,80,106,138,179,230],[18,44,72,119,168,234,313,441,600],[22,56,106,164,229,307,398,511,646],[17,40,70,100,130,160,190,220,250],[28,69,116,175,263,380,496,624,760,900]],[[10,20,32,53,75,109,139,179,228],[9,18,40,78,106,140,195,265,310,360],[15,23,36,61,86,113,161,207,264],[26,60,105,150,195,240,285,330,375],[30,72,116,164,240,300,380,450,540,600]],[[15,23,36,61,86,113,161,207,264],[15,23,36,61,86,113,161,207,264],[9,18,40,78,106,140,195,265,310,360],[26,60,105,150,195,240,285,330,375],[30,72,116,164,240,300,380,450,540,600]]];
         this.bigLibao = [80222385,384811966,383816573,382391207,381550044,380843152,379836552,379032534,378435320,377912686,377129013,365903380,363648382,361701709,358764816,355316894,351103075,346562859,341773937,337001125,331482969,260027083,265246299,47193519,233221621,117246448,118906541,383764146,386038595,1432955,341391819,304882995,372954995,87521906,252348061,332052801,278754308,375282063,254394425,269578148,253746878,76560645,253473173];
         this.smallLibao = [80222385,376329179,375806230,375387602,374954294,374075846,372783043,371746886,369785778,368082150,325291430,318630909,311857374,305720073,299468025,293705757,288808643,283163407,278261509,274635209,270659831,222673523,212237938,163258030,140045373,108206590,90315657,73051163,56536987,31581845,124206949,7201486,228930264,337187802,12302,337482292,97364820,358330604,131275627,211066220,245425018,245380219,245340224,245325735,385961451,385935657,48683421,48649717,48607634,48339187,48239104,360524935,342326675,366074552,110635003,359284968,380409213,66684380,265242604,303891072,356807337,97964165,118906541,7440828,261122755,258879632,76803368];
         super();
         if(!instance)
         {
            instance = this;
            this.initData();
         }
      }
      
      public static function getInstance() : Config
      {
         return instance;
      }
      
      public function initData() : void
      {
         var _loc1_:Date = new Date();
         var _loc2_:String = String(_loc1_.fullYear) + "-" + String(_loc1_.month + 1) + "-" + String(_loc1_.date);
         this.curdate = _loc2_;
         this.saveId = -1;
         this.destroyHero();
         if(this.protectedPerproty)
         {
            this.protectedPerproty.clear();
         }
         this.protectedPerproty = new MyProtectedProperty();
         this.player1 = new User();
         this.player1.init(0);
         this.player2 = new User();
         this.player2.init(1);
         this.isPK = false;
         this.allTask.newAllTask();
         this.curBigLevel = 1;
         this.curBigStage = 1;
         this.curStage = 1;
         this.curLevel = 1;
         this.saveIntervelCount = 0;
         this.memory = new MemoryClass();
         this.Objectdata = new Antiwear(new binaryEncrypt());
         this.Objectdata.endlesslevel = 0;
         this.Objectdata.whichlastworld = 0;
         this.Objectdata.canplayturntable = true;
         this.Objectdata.turntableScore = 0;
         this.Objectdata.gm = false;
         this.Objectdata.specialUI = false;
         this.hasget = false;
         this.hasgetsorry = 0;
         this.hasgetslsorry = 0;
         this.nymark = "";
         this.cardId = "";
         this.curStageAndCurLevel = new Antiwear(new binaryEncrypt());
         this.curStageAndCurLevel.curStage = 1;
         this.curStageAndCurLevel.curLevel = 1;
      }
      
      public function setLocalUserId(param1:String) : void
      {
         var _loc2_:uint = uint(param1.length);
         var _loc3_:uint = Math.round(Math.random() * _loc2_);
         this.localuserid1 = param1.substr(0,_loc3_);
         this.localuserid2 = param1.substr(_loc3_,_loc2_ - _loc3_);
         this.localuserid3 = AUtils.enCodeString(param1);
      }
      
      public function getLocalUserId() : String
      {
         if(this.localuserid1 + this.localuserid2 != AUtils.getDeCodeString(this.localuserid3))
         {
            throw new Error("数据被修改！");
         }
         return this.localuserid1 + this.localuserid2;
      }
      
      public function isInHost() : Boolean
      {
         return this.nodeFloor == 2;
      }
      
      public function isInRoom() : Boolean
      {
         return this.nodeFloor == 3;
      }
      
      public function isInRoomOrSingleGame() : Boolean
      {
         return this.nodeFloor == 3 || this.nodeFloor == 0;
      }
      
      public function isSingleGame() : Boolean
      {
         return this.nodeFloor == 0;
      }
      
      public function getHeroBySidAndRoleId(param1:uint, param2:uint) : BaseHero
      {
         var _loc3_:* = null;
         var _loc4_:int = 0;
         while(_loc4_ < this.pWorld.getOtherHeroArray().length)
         {
            _loc3_ = this.pWorld.getOtherHeroArray()[_loc4_] as BaseHero;
            if(Boolean(_loc3_) && Boolean(_loc3_.sid == param1) && _loc3_.getRoleId() == param2)
            {
               return _loc3_;
            }
            _loc4_++;
         }
         if(param1 == this.sid)
         {
            if(Boolean(this.hero1) && this.hero1.getRoleId() == param2)
            {
               return this.hero1;
            }
            if(Boolean(this.hero2) && this.hero2.getRoleId() == param2)
            {
               return this.hero2;
            }
         }
         return null;
      }
      
      public function getPetBySidAndRoleId(param1:uint, param2:uint) : BasePet
      {
         var _loc3_:BaseHero = this.getHeroBySidAndRoleId(param1,param2);
         if(_loc3_)
         {
            return _loc3_.getPet();
         }
         return null;
      }
      
      public function getMutiUserBySidAndRoleId(param1:uint, param2:uint) : MutiUser
      {
         var _loc3_:* = null;
         for each(_loc3_ in this.pWorld.getOtherHeroUserArray())
         {
            if(_loc3_.sid == param1 && _loc3_.roleId == param2)
            {
               return _loc3_;
            }
         }
         return null;
      }
      
      public function closeScoket() : void
      {
         this.sid = -1;
         this.roomOnwerSid = -1;
         this.nodeFloor = 0;
         this.isRoomOnwer = false;
         if(this.isServerOk)
         {
            this.isServerOk = false;
            this.server.close();
            this.server = null;
         }
      }
      
      public function sendSelfMutiUserInfo(param1:uint) : void
      {
         var _loc2_:* = null;
         var _loc3_:* = null;
         if(Boolean(this.server) && this.isServerOk)
         {
            _loc2_ = this.getMutiUserBySidAndRoleId(this.sid,param1);
            if(_loc2_)
            {
               _loc3_ = param1 + "," + _loc2_.getMutiInfo();
               this.server.ins_bo_node(64,AUtils.stringToByteArray(_loc3_),true);
               this.server.ins_set_my(UK.DATA,this.getSaveInfo());
               this.server.submit(0);
            }
         }
      }
      
      public function encrypt(param1:ByteArray) : String
      {
         var idx:Number = NaN;
         var _loc2_:* = 0;
         var _loc3_:int = 0;
         var _loc4_:* = null;
         if(!param1)
         {
            return "";
         }
         var encryptedData:ByteArray = new ByteArray();
         param1.position = 0;
         while(param1.bytesAvailable > 0)
         {
            encryptedData.writeByte(param1.readUnsignedByte() ^ this.ENCRYPT_KEY);
         }
         encryptedData.position = 0;
         var _loc6_:uint = encryptedData.position;
         var _loc7_:String = "";
         var _loc8_:Array = new Array(4);
         encryptedData.position = 0;
         while(encryptedData.bytesAvailable > 0)
         {
            _loc4_ = new Array();
            _loc2_ = 0;
            while(_loc2_ < 3 && encryptedData.bytesAvailable > 0)
            {
               _loc4_[_loc2_] = encryptedData.readUnsignedByte();
               _loc2_++;
            }
            _loc8_[0] = (Number(_loc4_[0]) & 0xFC) >> 2;
            _loc8_[1] = (Number(_loc4_[0]) & 3) << 4 | Number(_loc4_[1] || 0) >> 4;
            _loc8_[2] = (Number(_loc4_[1] || 0) & 0x0F) << 2 | Number(_loc4_[2] || 0) >> 6;
            _loc8_[3] = Number(_loc4_[2] || 0) & 0x3F;
            _loc3_ = int(_loc4_.length);
            _loc2_ = _loc3_;
            while(_loc2_ < 3)
            {
               _loc8_[_loc2_ + 1] = 64;
               _loc2_++;
            }
            for each(idx in _loc8_)
            {
               _loc7_ += this.base64chars.charAt(idx);
            }
         }
         encryptedData.position = _loc6_;
         return _loc7_;
      }
      
      public function decrypt(param1:String) : ByteArray
      {
         var _loc2_:* = 0;
         var _loc3_:int = 0;
         var _loc4_:int = 0;
         var _loc5_:ByteArray = new ByteArray();
         var _loc6_:Array = new Array(4);
         var _loc7_:Array = new Array(3);
         var _loc8_:uint = uint(param1.length);
         while(_loc2_ < _loc8_)
         {
            _loc3_ = 0;
            while(_loc3_ < 4 && _loc2_ + _loc3_ < _loc8_)
            {
               _loc6_[_loc3_] = this.base64chars.indexOf(param1.charAt(_loc2_ + _loc3_));
               _loc3_++;
            }
            _loc7_[0] = (Number(_loc6_[0]) << 2) + ((Number(_loc6_[1]) & 0x30) >> 4);
            _loc7_[1] = ((Number(_loc6_[1]) & 0x0F) << 4) + ((Number(_loc6_[2]) & 0x3C) >> 2);
            _loc7_[2] = ((Number(_loc6_[2]) & 3) << 6) + _loc6_[3];
            _loc4_ = 0;
            while(_loc4_ < 3)
            {
               if(_loc6_[_loc4_ + 1] == 64)
               {
                  break;
               }
               _loc5_.writeByte(_loc7_[_loc4_]);
               _loc4_++;
            }
            _loc2_ = uint(_loc2_ + 4);
         }
         var decryptedData:ByteArray = new ByteArray();
         _loc5_.position = 0;
         while(_loc5_.bytesAvailable > 0)
         {
            decryptedData.writeByte(_loc5_.readUnsignedByte() ^ this.ENCRYPT_KEY);
         }
         decryptedData.position = 0;
         return decryptedData;
      }
      
      public function sendPetAction(param1:uint, param2:String, param3:Number, param4:Number) : void
      {
         var _loc5_:* = null;
         if(Boolean(this.server) && this.isServerOk)
         {
            _loc5_ = param1 + "," + param2 + "," + param3 + "," + param4;
            this.server.ins_bo_node(20,AUtils.stringToByteArray(_loc5_),true);
            this.server.submit(0);
         }
      }
      
      public function getUserInfoByUid(param1:uint) : void
      {
         if(Boolean(this.server) && this.isServerOk)
         {
            this.server.ins_get_user(Number(UK.ID) | Number(UK.INDEX) | Number(UK.DATA),param1);
            this.server.submit(33);
         }
      }
      
      public function getOtherPlayersInfo() : *
      {
         if(Boolean(this.server) && this.isServerOk)
         {
            this.server.ins_get_node(NK.IDS_STAYERS);
            this.server.ins_set_return_to_param(2,true);
            this.server.ins_get_users(Number(UK.INDEX) | Number(UK.DATA),new ByteArray());
            this.server.submit(2);
         }
      }
      
      public function gameStart() : void
      {
         if(Boolean(this.server) && this.isServerOk)
         {
            this.server.ins_set_node(NK.LOCK,1);
            this.server.ins_bo_node(769,new ByteArray());
            this.server.submit(0);
         }
      }
      
      public function sendGameCountdown() : void
      {
         if(Boolean(this.server) && this.isServerOk)
         {
            this.server.ins_bo_node(768,new ByteArray(),false);
            this.server.submit(0);
         }
      }
      
      public function getRoomInfo() : void
      {
         if(Boolean(this.server) && this.isServerOk)
         {
            this.server.ins_get_node(NK.LEVEL);
            this.server.ins_get_node(NK.DATA);
            this.server.ins_get_node(NK.NUM_VISITORS);
            this.server.ins_get_node(NK.LTD_VISITORS);
            this.server.ins_get_node(NK.MAX_VISITORS);
            this.server.submit(516);
         }
      }
      
      public function quitRoom() : void
      {
         if(Boolean(this.server) && this.isServerOk)
         {
            this.server.ins_exit_to_parent();
            this.server.submit(513);
         }
      }
      
      public function createRoom(param1:Array, param2:uint) : void
      {
         var _loc3_:* = 0;
         var _loc4_:* = null;
         var _loc5_:* = null;
         if(Boolean(this.server) && this.isServerOk)
         {
            this.nodeInfo.GameMode = uint(param1[1]);
            this.nodeInfo.averLevel = uint(this.getAverageLevel());
            this.nodeInfo.roomName = param1[0];
            this.nodeInfo.mpInfo = uint(param1[2]);
            _loc3_ = uint(this.getAverageLevel());
            this.nodeInfo.averLevel = uint(_loc3_);
            this.nodeInfo.singleIdPlayerNum = this.getPlayerArray().length;
            param1.push(_loc3_);
            param1.push(this.getPlayerArray().length);
            _loc4_ = param1.join(",");
            _loc5_ = AUtils.stringToByteArray(_loc4_);
            this.server.ins_auto_enter_child(1);
            this.server.ins_set_node(NK.DATA,_loc5_);
            this.server.ins_set_node(NK.LTD_VISITORS,param2);
            this.server.submit(512);
         }
      }
      
      public function sendChat(param1:String) : void
      {
         var _loc2_:* = null;
         if(Boolean(this.server) && this.isServerOk)
         {
            if(this.chatRegExp)
            {
               param1 = param1.replace(this.chatRegExp,"*");
            }
            _loc2_ = "";
            if(this.logInfo)
            {
               _loc2_ = this.logInfo.name + "," + param1;
            }
            else
            {
               _loc2_ = this.sid + "," + param1;
            }
            this.server.ins_bo_node(18,AUtils.stringToByteArray(_loc2_));
            this.server.submit(0);
         }
      }
      
      public function sendOtherBuff(param1:uint, param2:uint, param3:String, param4:Array = null) : void
      {
         var _loc5_:* = null;
         if(Boolean(this.server) && this.isServerOk)
         {
            _loc5_ = param1 + "," + param2 + "," + param3 + "," + (param4 ? param4.join("|") : "");
            this.server.ins_bo_node(273,AUtils.stringToByteArray(_loc5_),true);
            this.server.submit(0);
         }
      }
      
      public function sendAttack(param1:uint, param2:String, param3:uint, param4:Number, param5:Number, param6:Array = null, param7:uint = 0) : void
      {
         var _loc8_:* = null;
         if(Boolean(this.server) && this.isServerOk)
         {
            _loc8_ = param1 + "," + param2 + "," + param3 + "," + param4 + "," + param5 + "," + param6.join("|") + "," + param7;
            this.server.ins_bo_node(17,AUtils.stringToByteArray(_loc8_),true);
            this.server.submit(0);
         }
      }
      
      public function sendPetAttack(param1:uint, param2:String, param3:uint, param4:Number, param5:Number, param6:Array = null) : void
      {
         var _loc7_:* = null;
         if(Boolean(this.server) && this.isServerOk)
         {
            _loc7_ = param1 + "," + param2 + "," + param3 + "," + param4 + "," + param5 + "," + param6.join("|");
            this.server.ins_bo_node(19,AUtils.stringToByteArray(_loc7_),true);
            this.server.submit(0);
         }
      }
      
      public function getDelay() : void
      {
         if(Boolean(this.server) && this.isServerOk)
         {
            this.lastDelayTime = uint(getTimer());
            this.server.ins_nop();
            this.server.submit(16);
         }
      }
      
      public function sendRun(param1:uint) : void
      {
         var _loc2_:* = null;
         if(Boolean(this.server) && this.isServerOk)
         {
            _loc2_ = param1 + ",";
            this.server.ins_bo_node(9,AUtils.stringToByteArray(_loc2_),true);
            this.server.submit(0);
         }
      }
      
      public function setMyData() : void
      {
         if(Boolean(this.server) && this.isServerOk)
         {
            this.server.ins_set_my(UK.DATA,this.getSaveInfo());
            this.server.submit(0);
         }
      }
      
      public function sendDead(param1:uint) : void
      {
         var _loc2_:* = null;
         if(Boolean(this.server) && this.isServerOk)
         {
            _loc2_ = param1 + ",";
            this.server.ins_bo_node(7,AUtils.stringToByteArray(_loc2_),true);
            this.server.submit(0);
         }
      }
      
      public function sendPetDead(param1:uint) : void
      {
         var _loc2_:* = null;
         if(Boolean(this.server) && this.isServerOk)
         {
            _loc2_ = param1 + ",";
            this.server.ins_bo_node(113,AUtils.stringToByteArray(_loc2_),true);
            this.server.submit(0);
         }
      }
      
      public function sendHurt(param1:int, param2:uint, param3:uint, param4:String, param5:int, param6:int, param7:uint, param8:Boolean = true, param9:Boolean = true) : void
      {
         var _loc10_:* = null;
         if(Boolean(this.server) && this.isServerOk)
         {
            _loc10_ = param3 + "," + param1 + "," + param2 + "," + param4 + "," + param5 + "," + param6 + "," + param7 + "," + (param8 ? 1 : 0) + "," + (param9 ? 1 : 0);
            this.server.ins_bo_node(6,AUtils.stringToByteArray(_loc10_),true);
            this.server.submit(0);
         }
      }
      
      public function sendPetHurt(param1:int, param2:uint, param3:uint, param4:String, param5:int, param6:int, param7:uint, param8:Boolean = true, param9:Boolean = true) : void
      {
         var _loc10_:* = null;
         if(Boolean(this.server) && this.isServerOk)
         {
            _loc10_ = param3 + "," + param1 + "," + param2 + "," + param4 + "," + param5 + "," + param6 + "," + param7 + "," + (param8 ? 1 : 0) + "," + (param9 ? 1 : 0);
            this.server.ins_bo_node(97,AUtils.stringToByteArray(_loc10_),true);
            this.server.submit(0);
         }
      }
      
      public function sendLorRInfo(param1:BaseHero) : void
      {
         var _loc2_:* = null;
         if(Boolean(this.server) && this.isServerOk)
         {
            if(param1.getPlayer())
            {
               _loc2_ = param1.getRoleId() + "," + param1.isLeft + "," + param1.isRight;
            }
            this.server.ins_bo_node(5,AUtils.stringToByteArray(_loc2_),true);
            this.server.submit(0);
         }
      }
      
      public function sendWalkInfo(param1:BaseHero) : void
      {
         var _loc2_:* = null;
         if(Boolean(this.server) && this.isServerOk)
         {
            if(param1.getPlayer())
            {
               _loc2_ = param1.getRoleId() + "," + param1.getBBDC().getState() + "," + param1.isLeft + "," + param1.isRight;
            }
            this.server.ins_bo_node(4,AUtils.stringToByteArray(_loc2_),true);
            this.server.ins_set_my(UK.DATA,this.getSaveInfo());
            this.server.submit(0);
         }
      }
      
      public function sendPositionAndDirect(param1:BaseHero) : void
      {
         var _loc2_:* = null;
         if(Boolean(this.server) && this.isServerOk)
         {
            if(param1.getPlayer())
            {
               _loc2_ = param1.getRoleId() + "," + param1.x + "," + param1.y + "," + param1.isLeft + "," + param1.isRight;
            }
            this.server.ins_bo_node(49,AUtils.stringToByteArray(_loc2_),true);
            this.server.ins_set_my(UK.DATA,this.getSaveInfo());
            this.server.submit(0);
         }
      }
      
      public function sendPosition(param1:BaseHero) : void
      {
         var _loc2_:* = null;
         if(Boolean(this.server) && this.isServerOk)
         {
            if(param1.getPlayer())
            {
               _loc2_ = param1.getRoleId() + "," + param1.getBBDC().getState() + "," + param1.x + "," + param1.y + "," + param1.isLeft + "," + param1.isRight;
            }
            this.server.ins_bo_node(3,AUtils.stringToByteArray(_loc2_),true);
            this.server.ins_set_my(UK.DATA,this.getSaveInfo());
            this.server.submit(0);
         }
      }
      
      public function getSaveInfo() : XML
      {
         var _loc1_:* = null;
         var _loc2_:* = "<heros>";
         if(Boolean(this.hero1) && Boolean(this.hero1.getPlayer()))
         {
            _loc2_ += "<heros>";
            if(Boolean(this.logInfo) && Boolean(this.logInfo.name))
            {
               _loc2_ += "<un>" + this.logInfo.name + "</un>";
            }
            else
            {
               _loc2_ += "<un>" + this.sid + "</un>";
            }
            _loc2_ += "<rid>" + this.hero1.getRoleId() + "</rid>";
            _loc2_ += "<posX>" + this.hero1.x + "</posX>";
            _loc2_ += "<posY>" + this.hero1.y + "</posY>";
            _loc2_ += "<dir>" + this.hero1.getBBDC().getDirect() + "</dir>";
            _loc2_ += "<level>" + this.hero1.roleProperies.getLevel() + "</level>";
            _loc2_ += "<cloId>" + this.hero1.getCurClothId() + "</cloId>";
            _loc2_ += "<weaId>" + this.hero1.getCurWeaponId() + "</weaId>";
            _loc2_ += "<def>" + this.hero1.roleProperies.getDefense() + "</def>";
            _loc2_ += "<mdef>" + this.hero1.roleProperies.getMagicDef() + "</mdef>";
            _loc2_ += "<hp>" + this.hero1.roleProperies.getSHHP() + "</hp>";
            _loc1_ = this.hero1.getPlayer().findCurrentPet();
            if(_loc1_)
            {
               _loc2_ += "<petName>" + _loc1_.getPetName() + "</petName>";
               _loc2_ += "<petLv>" + _loc1_.getLevel() + "</petLv>";
               _loc2_ += "<petHp>" + _loc1_.getHp() + "</petHp>";
               _loc2_ += "<petMp>" + _loc1_.getMp() + "</petMp>";
            }
            if(this.hero1.getCurMagicWeapon())
            {
               _loc2_ += "<bmwId>" + this.hero1.getCurMagicWeapon().bmwId + "</bmwId>";
            }
            _loc2_ += "</heros>";
         }
         if(Boolean(this.hero2) && Boolean(this.hero2.getPlayer()))
         {
            _loc2_ += "<heros>";
            if(Boolean(this.logInfo) && Boolean(this.logInfo.name))
            {
               _loc2_ += "<un>" + this.logInfo.name + "</un>";
            }
            else
            {
               _loc2_ += "<un>" + this.sid + "</un>";
            }
            _loc2_ += "<rid>" + this.hero2.getRoleId() + "</rid>";
            _loc2_ += "<posX>" + this.hero2.x + "</posX>";
            _loc2_ += "<posY>" + this.hero2.y + "</posY>";
            _loc2_ += "<dir>" + this.hero2.getBBDC().getDirect() + "</dir>";
            _loc2_ += "<level>" + this.hero2.roleProperies.getLevel() + "</level>";
            _loc2_ += "<cloId>" + this.hero2.getCurClothId() + "</cloId>";
            _loc2_ += "<weaId>" + this.hero2.getCurWeaponId() + "</weaId>";
            _loc2_ += "<hp>" + this.hero2.roleProperies.getSHHP() + "</hp>";
            _loc2_ += "<def>" + this.hero2.roleProperies.getDefense() + "</def>";
            _loc2_ += "<mdef>" + this.hero2.roleProperies.getMagicDef() + "</mdef>";
            _loc1_ = this.hero2.getPlayer().findCurrentPet();
            if(_loc1_)
            {
               _loc2_ += "<petName>" + _loc1_.getPetName() + "</petName>";
               _loc2_ += "<petLv>" + _loc1_.getLevel() + "</petLv>";
               _loc2_ += "<petHp>" + _loc1_.getHp() + "</petHp>";
               _loc2_ += "<petMp>" + _loc1_.getMp() + "</petMp>";
            }
            if(this.hero2.getCurMagicWeapon())
            {
               _loc2_ += "<bmwId>" + this.hero2.getCurMagicWeapon().bmwId + "</bmwId>";
            }
            _loc2_ += "</heros>";
         }
         _loc2_ += "</heros>";
         return new XML(_loc2_);
      }
      
      public function getAverageLevel() : uint
      {
         var player:* = null;
         var totalLevel:uint = 0;
         var playerCount:uint = this.getPlayerArray1().length;
         if(playerCount == 0)
         {
            return 0;
         }
         var i:int = 0;
         while(i < playerCount)
         {
            player = this.getPlayerArray1()[i];
            totalLevel += player.getCurLevel();
            i++;
         }
         return Math.round(totalLevel / playerCount);
      }
      
      public function getMinLevel() : uint
      {
         if(this.player2.roleid > 0)
         {
            return this.player1.getCurLevel() > this.player2.getCurLevel() ? this.player2.getCurLevel() : this.player1.getCurLevel();
         }
         return this.player1.getCurLevel();
      }
      
      public function destroyHero() : void
      {
         if(this.hero1)
         {
            this.hero1.roleProperies.destory();
            this.hero1.roleProperies = null;
            this.hero1.destroy();
         }
         if(this.hero2)
         {
            this.hero2.roleProperies.destory();
            this.hero2.roleProperies = null;
            this.hero2.destroy();
         }
         this.hero1 = null;
         this.hero2 = null;
      }
      
      public function newRole() : void
      {
      }
      
      public function createHero() : void
      {
         this.pWorld.heroArray.length = 0;
         if(this.player1.roleid > 0)
         {
            if(this.player1.roleid < 5)
            {
               this.hero1 = AUtils.getNewObj("export.hero.Role" + this.player1.roleid) as BaseHero;
            }
            else
            {
               this.hero1 = new Role5();
            }
            this.hero1.setPlayer(this.player1);
            this.pWorld.heroArray.push(this.hero1);
            this.keyboardControl.setRole1(this.hero1);
            this.vControllor.setRole1(this.hero1);
            this.hero1.x = 100;
            this.hero1.y = 350;
            this.player1.isRealiveBydzjj = false;
            this.player1.isRealiveBytjbg = false;
            this.hero1.start();
            this.gameSence.addChild(this.hero1);
         }
         if(this.player2.roleid > 0)
         {
            this.hero2 = AUtils.getNewObj("export.hero.Role" + this.player2.roleid) as BaseHero;
            this.hero2.setPlayer(this.player2);
            this.pWorld.heroArray.push(this.hero2);
            this.keyboardControl.setRole2(this.hero2);
            this.vControllor.setRole2(this.hero2);
            this.hero2.x = 100;
            this.hero2.y = 350;
            this.player2.isRealiveBydzjj = false;
            this.player2.isRealiveBytjbg = false;
            this.hero2.start();
            this.gameSence.addChild(this.hero2);
         }
      }
      
      public function createHeroWhenQuitRoom() : void
      {
         if(Boolean(this.hero1) && this.gameSence.contains(this.hero1))
         {
            if(Boolean(this.hero1.getPet()) && this.gameSence.contains(this.hero1.getPet()))
            {
               this.gameSence.removeChild(this.hero1.getPet());
            }
            this.gameSence.removeChild(this.hero1);
         }
         if(Boolean(this.hero2) && this.gameSence.contains(this.hero2))
         {
            if(Boolean(this.hero2.getPet()) && this.gameSence.contains(this.hero2.getPet()))
            {
               this.gameSence.removeChild(this.hero2.getPet());
            }
            this.gameSence.removeChild(this.hero2);
         }
         this.createHero();
         var _loc1_:TextFormat = new TextFormat();
         _loc1_.size = 20;
         _loc1_.color = 16711680;
         if(this.hero1)
         {
            this.hero1.sid = this.sid == -1 ? 0 : int(this.sid);
            this.hero1.setNameTextField(this.sid + " P",_loc1_);
         }
         if(this.hero2)
         {
            this.hero2.sid = this.sid == -1 ? 0 : int(this.sid);
            this.hero2.setNameTextField(this.sid + " P",_loc1_);
         }
      }
      
      public function newGameClick() : void
      {
         this.curBigStage = 1;
         this.curBigLevel = 1;
         this.curStage = 1;
         this.curLevel = 1;
         this.hdInfo = [];
         this.saveId = -1;
      }
      
      public function getMinIdxInHeroAndPet() : int
      {
         var _loc1_:BaseObject = null;
         var _loc2_:int = 0;
         var _loc3_:int = 999;
         for each(_loc1_ in this.getPlayerAndPetArray())
         {
            if(_loc1_.parent == this.gameSence)
            {
               _loc2_ = this.gameSence.getChildIndex(_loc1_);
               if(_loc2_ != -1)
               {
                  _loc3_ = _loc3_ > _loc2_ ? int(_loc2_) : int(_loc3_);
               }
            }
         }
         if(_loc3_ == 999)
         {
            _loc3_ = 0;
         }
         return _loc3_;
      }
      
      public function destroyGame() : void
      {
         this.otherList = [];
         this.isLevelClear = false;
      }
      
      public function findLhValueBySkillName(param1:String, param2:int) : int
      {
         var _loc3_:int = 0;
         var _loc4_:uint = this.allSklName.length;
         var _loc5_:* = [];
         var _loc6_:* = [];
         while(_loc4_-- > 0)
         {
            _loc5_ = this.allSklName[_loc4_];
            if(_loc5_)
            {
               _loc3_ = int(_loc5_.indexOf(param1));
               if(_loc3_ != -1)
               {
                  _loc6_ = this.needMMP[_loc4_];
                  if(_loc6_)
                  {
                     return int(_loc6_[_loc3_][param2 - 1] * 0.75);
                  }
                  return 0;
               }
            }
         }
         return 0;
      }
      
      public function isFb() : Boolean
      {
         return this.curStage == 9 && this.curLevel == 1;
      }
      
      public function isFb1() : Boolean
      {
         return this.curStage == 9 && this.curLevel == 1;
      }
      
      public function getPlayerArray() : Array
      {
         var _loc1_:* = [];
         if(Boolean(this.hero1) && !this.hero1.isDead())
         {
            _loc1_.push(this.hero1);
         }
         if(Boolean(this.hero2) && !this.hero2.isDead())
         {
            _loc1_.push(this.hero2);
         }
         return _loc1_;
      }
      
      public function getPlayerArray1() : Array
      {
         var _loc1_:* = [];
         if(this.player1.roleid > 0)
         {
            _loc1_.push(this.player1);
         }
         if(this.player2.roleid > 0)
         {
            _loc1_.push(this.player2);
         }
         return _loc1_;
      }
      
      public function getPetArray() : Array
      {
         var _loc1_:Array = [];
         if(Boolean(this.hero1) && !this.hero1.isDead())
         {
            if(this.hero1.getPet())
            {
               _loc1_.push(this.hero1.getPet());
            }
         }
         if(Boolean(this.hero2) && !this.hero2.isDead())
         {
            if(this.hero2.getPet())
            {
               _loc1_.push(this.hero2.getPet());
            }
         }
         return _loc1_;
      }
      
      public function getPlayerAndPetArray() : Array
      {
         var _loc1_:Array = [];
         if(Boolean(this.hero1) && !this.hero1.isDead())
         {
            _loc1_.push(this.hero1);
            if(this.hero1.getPet())
            {
               _loc1_.push(this.hero1.getPet());
            }
         }
         if(Boolean(this.hero2) && !this.hero2.isDead())
         {
            _loc1_.push(this.hero2);
            if(this.hero2.getPet())
            {
               _loc1_.push(this.hero2.getPet());
            }
         }
         return _loc1_;
      }
      
      public function getRandomPlayer() : BaseHero
      {
         var _loc1_:int = Math.random() * this.getPlayerArray().length;
         return this.getPlayerArray()[_loc1_];
      }
      
      public function getRivalPlayer(param1:BaseHero) : BaseHero
      {
         var _loc2_:Array = this.getPlayerArray();
         if(_loc2_.length - 1)
         {
            if(_loc2_[0] == param1)
            {
               return _loc2_[1];
            }
            return _loc2_[0];
         }
         return _loc2_;
      }
      
      public function getRivalPlayerAndPet(param1:BaseHero) : Array
      {
         if(this.getRivalPlayer(param1))
         {
            return new Array(this.getRivalPlayer(),this.getRivalPlayer().getPet());
         }
         return [];
      }
      
      public function putQhsInBackPack(param1:User, param2:String, param3:int = 1) : void
      {
         if(param2.indexOf("jns") != -1)
         {
            param1.jnslist = this.putQHsInArray(param2,param1.jnslist,param3);
         }
         else
         {
            param1.djlist = this.putQHsInArray(param2,param1.djlist,param3);
         }
      }
      
      public function putQHsInArray(param1:String, param2:Array = null, param3:int = 1) : Array
      {
         var _loc4_:* = null;
         var _loc5_:uint = param2.length;
         while(_loc5_-- > 0)
         {
            if(param1 == param2[_loc5_].getFillName())
            {
               _loc4_ = param2[_loc5_];
            }
         }
         if(_loc4_ != null)
         {
            _loc4_.setNum(param3);
            this.eventManger.dispatchEvent(new Event("CHANGETXT"));
         }
         else
         {
            this.allEquip.reNewAll();
            _loc4_ = this.allEquip.findByName(param1);
            _loc4_.setnum(param3);
            param2.push(_loc4_);
         }
         return param2;
      }
      
      public function addActionMask(param1:String = "") : void
      {
         var _loc2_:* = null;
         var _loc3_:Sprite = this.stage.getChildByName("execuitionAction" + param1) as Sprite;
         if(_loc3_ == null)
         {
            _loc2_ = AUtils.getNewObj("mask" + param1) as Sprite;
            _loc2_.name = "execuitionAction" + param1;
            this.stage.addChild(_loc2_);
         }
      }
      
      public function isInSea() : Boolean
      {
         return this.curStage == 10;
      }
      
      public function alert(param1:String, param2:int = 1, param3:int = 30) : void
      {
         this.ts.setTxt(param1,param2,param3);
         this.stage.addChild(this.ts);
      }
      
      public function confirmBox(param1:String, param2:Function = null, param3:Function = null, param4:Boolean = false) : DisplayObject
      {
         var _loc1_:Sprite = null;
         _loc1_ = null;
         var content:String = param1;
         var confirmFunc:Function = param2;
         var cancelFunc:Function = param3;
         var isHiddenCancel:Boolean = param4;
         _loc1_ = AUtils.getNewObj("renewalseThisSZ") as Sprite;
         _loc1_.name = "renewalseThisSZ";
         _loc1_.txt.text = content as String;
         if(Boolean(confirmFunc))
         {
            _loc1_.prototype["confirmFunc"] = confirmFunc;
            _loc1_.okbtn.addEventListener(MouseEvent.CLICK,confirmFunc);
         }
         if(Boolean(cancelFunc) && !isHiddenCancel)
         {
            _loc1_.prototype["cancelFunc"] = cancelFunc;
            _loc1_.nobtn.addEventListener(MouseEvent.CLICK,cancelFunc);
         }
         _loc1_.okbtn.addEventListener(MouseEvent.CLICK,function(param1:Event):void
         {
            if(_loc1_["confirmFunc"] != null)
            {
               param1.currentTarget.removeEventListener(MouseEvent.CLICK,_loc1_["confirmFunc"]);
            }
            param1.currentTarget.removeEventListener(MouseEvent.CLICK,arguments.callee);
            if(param1.currentTarget.parent.parent)
            {
               param1.currentTarget.parent.parent.removeChild(param1.currentTarget.parent);
            }
         });
         if(isHiddenCancel)
         {
            _loc1_.nobtn.visible = false;
            _loc1_.okbtn.x = (_loc1_.okbtn.x + _loc1_.nobtn.x) / 2;
            return _loc1_;
         }
         _loc1_.nobtn.addEventListener(MouseEvent.CLICK,function(param1:Event):void
         {
            if(_loc1_["cancelFunc"] != null)
            {
               param1.currentTarget.removeEventListener(MouseEvent.CLICK,_loc1_["cancelFunc"]);
            }
            param1.currentTarget.removeEventListener(MouseEvent.CLICK,arguments.callee);
            if(param1.currentTarget.parent.parent)
            {
               param1.currentTarget.parent.parent.removeChild(param1.currentTarget.parent);
            }
         });
         return _loc1_;
      }
      
      public function isInSea1() : Boolean
      {
         return this.curStageAndCurLevel.curStage == 10;
      }
   }
}

