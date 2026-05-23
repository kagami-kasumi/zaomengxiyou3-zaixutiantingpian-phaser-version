package base
{
   import com.greensock.*;
   import com.multi4399.*;
   import com.multi4399.keys.*;
   import config.Config;
   import event.*;
   import export.*;
   import export.muti.*;
   import flash.events.*;
   import flash.geom.*;
   import flash.net.*;
   import flash.text.*;
   import flash.utils.*;
   import my.*;
   import user.*;
   
   public class BaseMutiLevelListenering extends BaseLevelListenering
   {
      
      public var servers:URLLoader;
      
      private var delayCount:int;
      
      private var lineChoose:LineChoose;
      
      protected var countDownTimer:Timer;
      
      internal var iii:uint = 0;
      
      public function BaseMutiLevelListenering()
      {
         this.servers = new URLLoader();
         this.countDownTimer = new Timer(1000);
         super();
         this.delayCount = gc.frameClips * 2;
         this.countDownTimer.addEventListener(TimerEvent.TIMER,this.__countDownTimer);
      }
      
      override public function init() : void
      {
         super.init();
         if(gc.isSingleGame())
         {
            this.lineChoose = new LineChoose();
            GMain.getInstance().getTopSence().addChild(this.lineChoose);
         }
      }
      
      override public function start() : void
      {
         super.start();
         if(!gc.server)
         {
            gc.server = new Client();
            this.servers.addEventListener(Event.COMPLETE,this.onXML);
            this.servers.addEventListener(IOErrorEvent.IO_ERROR,this.onXML);
            this.servers.addEventListener(SecurityErrorEvent.SECURITY_ERROR,this.onXML);
            if(!gc.isHideDebug)
            {
               this.servers.load(new URLRequest("http://xml.multi.img4399.com/1001.xml"));
            }
            else
            {
               this.servers.load(new URLRequest("http://xml.multi.img4399.com/2006.xml"));
            }
         }
      }
      
      public function onXML(param1:Event) : void
      {
         if(param1.type != Event.COMPLETE)
         {
            if(this.lineChoose)
            {
               this.lineChoose.scoketError();
            }
            gc.server = null;
            gc.ts.setTxt("无法连接服务器!");
            gc.stage.addChild(gc.ts);
            return;
         }
         var _loc2_:XML = new XML(param1.target.data);
         var _loc3_:XML = _loc2_.server[0];
         gc.server.addEventListener(Event.CONNECT,this.onSocket);
         gc.server.addEventListener(Event.CLOSE,this.onSocket);
         gc.server.addEventListener(IOErrorEvent.IO_ERROR,this.onSocket);
         gc.server.addEventListener(SecurityErrorEvent.SECURITY_ERROR,this.onSocket);
         gc.server.connect(_loc3_.host,_loc3_.port);
      }
      
      public function onSocket(param1:Event) : void
      {
         if(param1.type != Event.CONNECT)
         {
            if(this.lineChoose)
            {
               this.lineChoose.scoketError();
            }
            gc.server = null;
            gc.ts.setTxt("无法连接服务器!");
            gc.stage.addChild(gc.ts);
            return;
         }
         gc.server.addEventListener(ResponseEvent.PACKET,this.onResponse);
         if(gc.logInfo)
         {
            gc.server.ins_login(2006,189652,parseInt(gc.logInfo.uid));
         }
         else
         {
            gc.server.ins_login(2006,189652);
         }
         gc.server.ins_get_node(NK.MAX_VISITORS);
         gc.server.ins_get_node(NK.NUM_CHILDREN);
         gc.server.ins_set_my(UK.DATA,gc.getSaveInfo());
         gc.server.submit(1);
      }
      
      public function initOthersOne(param1:ResponseEvent) : void
      {
         var _loc2_:* = null;
         var _loc3_:* = null;
         var _loc4_:* = null;
         var _loc5_:XML = param1.values[2] as XML;
         var _loc6_:uint = uint(param1.values[1]);
         var _loc7_:int = 0;
         while(_loc7_ < _loc5_.heros.length())
         {
            _loc2_ = new MutiUser();
            _loc2_.sid = param1.values[0];
            _loc2_.roleId = parseInt(_loc5_.heros[_loc7_].rid);
            _loc2_.uName = _loc5_.heros[_loc7_].un;
            _loc2_.pos = new Point(parseInt(_loc5_.heros[_loc7_].posX),parseInt(_loc5_.heros[_loc7_].posY));
            _loc2_.direct = parseInt(_loc5_.heros[_loc7_].dir);
            _loc2_.level = parseInt(_loc5_.heros[_loc7_].level);
            _loc2_.weaponId = parseInt(_loc5_.heros[_loc7_].weaId);
            _loc2_.equpId = parseInt(_loc5_.heros[_loc7_].cloId);
            _loc2_.mDef = _loc5_.heros[_loc7_].mdef;
            _loc2_.def = parseInt(_loc5_.heros[_loc7_].def);
            _loc2_.shp = parseInt(_loc5_.heros[_loc7_].hp);
            _loc2_.hp = parseInt(_loc5_.heros[_loc7_].hp);
            _loc2_.petName = _loc5_.heros[_loc7_].petName;
            _loc2_.petLevel = parseInt(_loc5_.heros[_loc7_].petLv);
            _loc2_.petHp = parseInt(_loc5_.heros[_loc7_].petHp);
            _loc2_.petMp = parseInt(_loc5_.heros[_loc7_].petMp);
            _loc2_.bmwId = parseInt(_loc5_.heros[_loc7_].bmwId);
            _loc2_.index = _loc6_;
            gc.pWorld.getOtherHeroUserArray().push(_loc2_);
            _loc7_++;
         }
         if(gc.isInHost())
         {
            if(!gc.getHeroBySidAndRoleId(_loc2_.sid,_loc2_.roleId))
            {
               _loc3_ = this.addOther(_loc2_.sid,_loc2_.roleId);
               _loc3_.x = _loc2_.pos.x;
               _loc3_.y = _loc2_.pos.y;
               _loc3_.setCurClothId(_loc2_.equpId);
               _loc3_.setCurWeaponId(_loc2_.weaponId);
               _loc3_.setNameTextField(_loc2_.uName);
               _loc3_.refreshEquip();
               _loc3_.getBBDC().setDirect(_loc2_.direct);
               _loc2_.hero = _loc3_;
               if(gc.gameInfo.getIsHideOther())
               {
                  _loc3_.getBBDC().hide();
                  if(_loc3_.getPet())
                  {
                     _loc3_.getPet().getBBDC().hide();
                  }
                  if(_loc3_.getCurMagicWeapon())
                  {
                     _loc3_.getCurMagicWeapon().getBBDC().hide();
                  }
               }
            }
         }
         else if(gc.isInRoom())
         {
            gc.gameInfo.clearOtherUserInfoSprite();
            for each(_loc4_ in gc.pWorld.getOtherHeroUserArray())
            {
               if(_loc4_.sid != gc.sid)
               {
                  gc.gameInfo.addOtherUserInfoOne(_loc4_);
               }
            }
         }
      }
      
      public function initOthers(param1:ResponseEvent) : void
      {
         var _loc2_:* = null;
         var _loc3_:* = null;
         var _loc4_:* = 0;
         var _loc5_:int = 0;
         var _loc6_:* = null;
         var _loc7_:Array = Utils.byte4_to_ints(param1.values[0]);
         this.clearAllOtherPlayers();
         gc.pWorld.getOtherHeroUserArray().length = 0;
         var _loc8_:int = int(_loc7_.length);
         var _loc9_:int = 0;
         while(_loc9_ < _loc8_)
         {
            _loc3_ = param1.values[3 + _loc9_ * 2] as XML;
            _loc4_ = uint(param1.values[2 + _loc9_ * 2]);
            _loc5_ = 0;
            while(_loc5_ < _loc3_.heros.length())
            {
               _loc2_ = new MutiUser();
               _loc2_.sid = _loc7_[_loc9_];
               _loc2_.roleId = parseInt(_loc3_.heros[_loc5_].rid);
               _loc2_.uName = _loc3_.heros[_loc5_].un;
               _loc2_.pos = new Point(parseInt(_loc3_.heros[_loc5_].posX),parseInt(_loc3_.heros[_loc5_].posY));
               _loc2_.direct = parseInt(_loc3_.heros[_loc5_].dir);
               _loc2_.level = parseInt(_loc3_.heros[_loc5_].level);
               _loc2_.weaponId = parseInt(_loc3_.heros[_loc5_].weaId);
               _loc2_.equpId = parseInt(_loc3_.heros[_loc5_].cloId);
               _loc2_.mDef = _loc3_.heros[_loc5_].mdef;
               _loc2_.def = parseInt(_loc3_.heros[_loc5_].def);
               _loc2_.shp = parseInt(_loc3_.heros[_loc5_].hp);
               _loc2_.hp = parseInt(_loc3_.heros[_loc5_].hp);
               _loc2_.petName = _loc3_.heros[_loc5_].petName;
               _loc2_.petLevel = parseInt(_loc3_.heros[_loc5_].petLv);
               _loc2_.petHp = parseInt(_loc3_.heros[_loc5_].petHp);
               _loc2_.petMp = parseInt(_loc3_.heros[_loc5_].petMp);
               _loc2_.bmwId = parseInt(_loc3_.heros[_loc5_].bmwId);
               _loc2_.index = _loc4_;
               gc.pWorld.getOtherHeroUserArray().push(_loc2_);
               _loc5_++;
            }
            _loc9_++;
         }
         if(gc.isInRoom())
         {
            gc.gameInfo.clearOtherUserInfoSprite();
            for each(_loc6_ in gc.pWorld.getOtherHeroUserArray())
            {
               if(_loc6_.sid != gc.sid)
               {
                  gc.gameInfo.addOtherUserInfoOne(_loc6_);
               }
            }
         }
      }
      
      private function showDisplayObjectByOtherHeroUser() : void
      {
         var _loc1_:* = null;
         var _loc2_:* = null;
         var _loc3_:uint = gc.pWorld.getOtherHeroUserArray().length;
         var _loc4_:int = 0;
         while(_loc4_ < _loc3_)
         {
            _loc1_ = gc.pWorld.getOtherHeroUserArray()[_loc4_] as MutiUser;
            if(_loc1_.sid != gc.sid)
            {
               if(!gc.getHeroBySidAndRoleId(_loc1_.sid,_loc1_.roleId))
               {
                  _loc2_ = this.addOther(_loc1_.sid,_loc1_.roleId);
                  _loc2_.x = _loc1_.pos.x;
                  _loc2_.y = _loc1_.pos.y;
                  _loc2_.setCurClothId(_loc1_.equpId);
                  _loc2_.setCurWeaponId(_loc1_.weaponId);
                  _loc2_.setNameTextField(_loc1_.uName);
                  _loc2_.refreshEquip();
                  _loc2_.getBBDC().setDirect(_loc1_.direct);
                  _loc1_.hero = _loc2_;
               }
            }
            _loc4_++;
         }
      }
      
      private function showDisplayObjectByOtherHeroUserWhenStartGame() : void
      {
         var _loc1_:* = null;
         var _loc2_:* = null;
         var _loc3_:* = null;
         var _loc4_:uint = gc.pWorld.getOtherHeroUserArray().length;
         var _loc5_:int = 0;
         while(_loc5_ < _loc4_)
         {
            _loc1_ = gc.pWorld.getOtherHeroUserArray()[_loc5_] as MutiUser;
            if(_loc1_.sid == gc.sid)
            {
               if(Boolean(gc.hero1) && gc.hero1.getRoleId() == _loc1_.roleId)
               {
                  _loc2_ = gc.hero1;
               }
               if(Boolean(gc.hero2) && gc.hero2.getRoleId() == _loc1_.roleId)
               {
                  _loc2_ = gc.hero2;
               }
            }
            else if(!gc.getHeroBySidAndRoleId(_loc1_.sid,_loc1_.roleId))
            {
               _loc3_ = this.addOther(_loc1_.sid,_loc1_.roleId);
               _loc3_.setCurClothId(_loc1_.equpId);
               _loc3_.setCurWeaponId(_loc1_.weaponId);
               _loc3_.setNameTextField(_loc1_.uName);
               _loc3_.refreshEquip();
               _loc2_ = _loc3_;
               _loc1_.hero = _loc3_;
            }
            if(_loc2_)
            {
               _loc2_.x = 150 + _loc1_.index / (gc.nodeInfo.ltdVisitors - 1) * 700;
               _loc2_.y = 350;
               if(_loc1_.index < gc.nodeInfo.ltdVisitors / 2)
               {
                  _loc2_.getBBDC().setDirect(1);
               }
               else
               {
                  _loc2_.getBBDC().setDirect(0);
               }
               if(_loc2_.getPet())
               {
                  _loc2_.getPet().x = _loc2_.x;
                  _loc2_.getPet().y = Number(_loc2_.y) - 200;
               }
            }
            _loc2_ = null;
            _loc5_++;
         }
      }
      
      public function addOther(param1:uint, param2:uint) : BaseHero
      {
         var _loc3_:BaseHero = AUtils.getNewObj("export.hero.Role" + param2) as BaseHero;
         _loc3_.sid = param1;
         _loc3_.setRoleId(param2);
         _loc3_.x = 100;
         _loc3_.y = 100;
         _loc3_.start();
         gc.pWorld.getOtherHeroArray().push(_loc3_);
         gc.gameSence.addChild(_loc3_);
         return _loc3_;
      }
      
      private function removeHeroBySidAndRoleId(param1:uint, param2:uint) : void
      {
         var _loc3_:* = null;
         var _loc4_:int = 0;
         while(_loc4_ < gc.pWorld.getOtherHeroArray().length)
         {
            _loc3_ = gc.pWorld.getOtherHeroArray()[_loc4_] as BaseHero;
            if(Boolean(_loc3_) && Boolean(_loc3_.sid == param1) && _loc3_.getRoleId() == param2)
            {
               gc.pWorld.getOtherHeroArray().splice(_loc4_,1);
               if(gc.gameSence.contains(_loc3_))
               {
                  gc.gameSence.removeChild(_loc3_);
               }
               if(_loc3_.getPet())
               {
                  _loc3_.getPet().destroy();
               }
               break;
            }
            _loc4_++;
         }
      }
      
      private function removeHeroBySid(param1:uint) : void
      {
         var _loc2_:* = null;
         var _loc3_:int = 0;
         var _loc4_:* = [];
         var _loc5_:int = 0;
         while(_loc5_ < gc.pWorld.getOtherHeroArray().length)
         {
            _loc2_ = gc.pWorld.getOtherHeroArray()[_loc5_] as BaseHero;
            if(Boolean(_loc2_) && _loc2_.sid == param1)
            {
               _loc4_.push(_loc2_);
               _loc2_.destroy();
            }
            _loc5_++;
         }
         var _loc6_:int = 0;
         while(_loc6_ < _loc4_.length)
         {
            _loc2_ = _loc4_[_loc6_] as BaseHero;
            _loc3_ = int(gc.pWorld.getOtherHeroArray().indexOf(_loc2_));
            if(_loc3_ != -1)
            {
               gc.pWorld.getOtherHeroArray().splice(_loc3_,1);
            }
            _loc6_++;
         }
         _loc4_.length = 0;
      }
      
      public function onResponse(param1:ResponseEvent) : void
      {
         var _loc2_:int = 0;
         var _loc3_:int = 0;
         var _loc4_:* = 0;
         var _loc5_:* = null;
         var _loc6_:* = 0;
         var _loc7_:* = 0;
         var _loc8_:* = 0;
         var _loc9_:* = 0;
         var _loc10_:* = null;
         if(param1.errors.length)
         {
            _loc2_ = 0;
            if(_loc2_ < param1.errors.length)
            {
               _loc3_ = int(param1.values[param1.errors[_loc2_]]);
               this.onResponseError(param1);
               return;
            }
         }
         switch(param1.mark)
         {
            case EK.USER_ENTER_NODE:
               gc.getUserInfoByUid(param1.values[0]);
               if(Boolean(gc.gameInfo) && gc.isInRoom())
               {
                  gc.getRoomInfo();
               }
               break;
            case EK.USER_LEAVE_NODE:
               _loc4_ = uint(parseInt(param1.values[0]));
               if(Boolean(gc.gameInfo) && gc.isInRoom())
               {
                  gc.gameInfo.removeOtherUserInfoOne(_loc4_);
               }
               if(gc.isInRoom() && Boolean(this.countDownTimer.running))
               {
                  this.countDownTimer.stop();
                  this.countDownTimer.reset();
               }
               this.removeHeroBySid(_loc4_);
               break;
            case EK.NODE_NEW_OWNER:
               if(gc.isInRoom())
               {
                  gc.roomOnwerSid = parseInt(param1.values[0]);
                  if(gc.roomOnwerSid == gc.sid)
                  {
                     gc.isRoomOnwer = true;
                     break;
                  }
                  gc.isRoomOnwer = false;
               }
               break;
            case 1:
               gc.isServerOk = true;
               gc.nodeFloor = 1;
               this.lineChoose.curNodeMaxVisitors = param1.values[1];
               this.lineChoose.curNodeNumChildren = param1.values[2];
               this.lineChoose.curChildNodeMaxVis = int(Number(this.lineChoose.curNodeMaxVisitors) / Number(this.lineChoose.curNodeNumChildren));
               gc.sid = param1.values[0];
               _loc5_ = new TextFormat();
               _loc5_.size = 20;
               _loc5_.color = 16711680;
               if(gc.hero1)
               {
                  gc.hero1.sid = param1.values[0];
                  if(gc.logInfo)
                  {
                     gc.hero1.setNameTextField(gc.logInfo.name,_loc5_);
                  }
                  else
                  {
                     gc.hero1.setNameTextField(gc.sid + " P",_loc5_);
                  }
               }
               if(gc.hero2)
               {
                  gc.hero2.sid = param1.values[0];
                  if(gc.logInfo)
                  {
                     gc.hero2.setNameTextField(gc.logInfo.name,_loc5_);
                  }
                  else
                  {
                     gc.hero2.setNameTextField(gc.sid + " P",_loc5_);
                  }
               }
               gc.keyboardControl.stopAllControl();
               break;
            case 257:
               gc.getOtherPlayersInfo();
               gc.server.ins_set_my(UK.EVENTS,Number(EK.USER_ENTER_NODE) | Number(EK.USER_LEAVE_NODE) | Number(EK.NODE_NEW_OWNER));
               gc.nodeFloor = 2;
               if(this.lineChoose)
               {
                  this.lineChoose.destroy();
               }
               gc.keyboardControl.continueAllControl();
               if(gc.gameInfo)
               {
                  gc.gameInfo.mutiGame();
               }
               break;
            case 258:
               gc.nodeFloor = 3;
               gc.isRoomOnwer = false;
               gc.position += "-->" + (param1.values[0] + 1) + "房";
               _loc6_ = uint(parseInt(param1.values[3]));
               _loc7_ = uint(parseInt(param1.values[4]));
               _loc8_ = uint(parseInt(param1.values[5]));
               gc.nodeInfo.ltdVisitors = _loc7_;
               gc.nodeInfo.MaxVisitors = _loc8_;
               gc.nodeInfo.initWhenJoinRoom();
               if(param1.values[2] != "")
               {
                  this.setNodeData(param1.values[2]);
               }
               if(gc.gameInfo)
               {
                  gc.gameInfo.joinRoomReturn(1);
               }
               this.changeMapByMapInfo();
               gc.getOtherPlayersInfo();
               gc.keyboardControl.continueAllControl();
               break;
            case 2:
               this.initOthers(param1);
               if(gc.isInHost())
               {
                  this.showDisplayObjectByOtherHeroUser();
               }
               break;
            case 33:
               this.initOthersOne(param1);
               if(gc.isInHost())
               {
               }
               break;
            case 3:
               this.moveOther(param1.values[1],param1.values[0]);
               break;
            case 49:
               this.posAndDirectOther(param1.values[1],param1.values[0]);
               break;
            case 4:
               this.walkOther(param1.values[1],param1.values[0]);
               break;
            case 5:
               this.faceToOther(param1.values[1],param1.values[0]);
               break;
            case 6:
               this.hurtOther(param1.values[1],param1.values[0]);
               break;
            case 97:
               this.hurtOtherPet(param1.values[1],param1.values[0]);
               break;
            case 7:
               this.deadOther(param1.values[1],param1.values[0]);
               break;
            case 113:
               this.deadPetOther(param1.values[1],param1.values[0]);
               break;
            case 9:
               this.runOther(param1.values[1],param1.values[0]);
               break;
            case 16:
               this.showDelay(param1.values[1]);
               break;
            case 17:
               this.otherAttack(param1.values[1],param1.values[0]);
               break;
            case 273:
               this.otherBuff(param1.values[1],param1.values[0]);
               break;
            case 18:
               this.updateChat(param1.values[1],param1.values[0]);
               break;
            case 19:
               this.otherPetAttack(param1.values[1],param1.values[0]);
               break;
            case 20:
               this.otherPetAction(param1.values[1],param1.values[0]);
               break;
            case 256:
               this.lineChoose.refreshData(param1);
               break;
            case 272:
               if(gc.gameInfo)
               {
                  gc.gameInfo.updateRoomList(param1);
               }
               break;
            case 512:
               _loc9_ = uint(parseInt(param1.values[2]));
               if(gc.hero1)
               {
                  _loc10_ = gc.getMutiUserBySidAndRoleId(gc.sid,gc.hero1.getRoleId());
                  _loc10_.index = _loc9_;
               }
               if(gc.hero2)
               {
                  _loc10_ = gc.getMutiUserBySidAndRoleId(gc.sid,gc.hero2.getRoleId());
                  _loc10_.index = _loc9_;
               }
               gc.nodeFloor = 3;
               gc.isRoomOnwer = true;
               if(gc.gameInfo)
               {
                  gc.gameInfo.createReturn(1);
               }
               this.changeMapByMapInfo();
               this.clearAllOtherPlayers();
               gc.getOtherPlayersInfo();
               break;
            case 513:
               gc.nodeFloor = 2;
               gc.isRoomOnwer = false;
               this.clearAllOtherPlayers();
               this.changeMapToHost();
               if(gc.hero1)
               {
                  gc.hero1.clearAllBullets();
                  gc.hero1.setStatic();
                  if(gc.hero1.getPlayer())
                  {
                     gc.hero1.getPlayer().reSetAllPetState();
                  }
               }
               if(gc.hero2)
               {
                  gc.hero2.clearAllBullets();
                  gc.hero2.setStatic();
                  if(gc.hero2.getPlayer())
                  {
                     gc.hero2.getPlayer().reSetAllPetState();
                  }
               }
               if(Boolean(this.countDownTimer) && Boolean(this.countDownTimer.running))
               {
                  this.countDownTimer.stop();
                  this.countDownTimer.reset();
               }
               gc.getOtherPlayersInfo();
               if(gc.gameInfo)
               {
                  gc.gameInfo.quitRoom();
               }
               break;
            case 514:
               this.refreshRoomList(param1.values[1],param1.values[0]);
               break;
            case 515:
               this.getUserDataBySid(param1.values[1],param1.values[0]);
               break;
            case 516:
               _loc6_ = uint(parseInt(param1.values[2]));
               _loc7_ = uint(parseInt(param1.values[3]));
               _loc8_ = uint(parseInt(param1.values[4]));
               gc.nodeInfo.ltdVisitors = _loc7_;
               gc.nodeInfo.MaxVisitors = _loc8_;
               if(param1.values[1] != "")
               {
                  this.setNodeData(param1.values[1]);
               }
               if(gc.isRoomOnwer)
               {
                  if(_loc6_ == _loc7_)
                  {
                     gc.sendGameCountdown();
                  }
               }
               break;
            case 768:
               this.gameCountdown();
               break;
            case 769:
               this.gameStart();
               break;
            case 64:
               this.refreshOtherMutiUser(param1.values[1],param1.values[0]);
         }
      }
      
      public function onResponseError(param1:ResponseEvent) : void
      {
         switch(param1.mark)
         {
            case 1:
               if(param1.values[0] == ResponseError.OVERFLOW_USER)
               {
                  gc.ts.setTxt("游戏人数已满");
                  gc.stage.addChild(gc.ts);
               }
               if(this.lineChoose)
               {
                  this.lineChoose.destroy();
                  this.lineChoose = null;
               }
               MainGame.getInstance().destroyGame();
               if(gc.isServerOk)
               {
                  gc.closeScoket();
               }
               gc.server = null;
               GMain.getInstance().switchSence("showStageMap");
               break;
            case 257:
               if(param1.values[0] == ResponseError.UNMATCHED0)
               {
                  this.lineChoose.joinFail();
                  gc.ts.setTxt("房间已满!");
                  gc.stage.addChild(gc.ts);
               }
               break;
            case 258:
               if(param1.values[0] == ResponseError.LOCKING)
               {
                  gc.ts.setTxt("游戏已经开始!");
                  gc.stage.addChild(gc.ts);
               }
               else if(param1.values[0] == ResponseError.UNMATCHED2)
               {
                  gc.ts.setTxt("该房间已经不存在!");
                  gc.stage.addChild(gc.ts);
               }
               if(gc.gameInfo)
               {
                  gc.gameInfo.joinRoomReturn(0);
               }
               break;
            case 512:
               gc.ts.setTxt("创建房间失败!");
               gc.stage.addChild(gc.ts);
               gc.roomInfo = "";
               if(gc.gameInfo)
               {
                  gc.gameInfo.createReturn(0);
               }
         }
      }
      
      private function clearAllOtherPlayers() : void
      {
         var _loc1_:* = null;
         var _loc2_:int = 0;
         while(_loc2_ < gc.pWorld.getOtherHeroArray().length)
         {
            _loc1_ = gc.pWorld.getOtherHeroArray()[_loc2_] as BaseHero;
            if(_loc1_.getPet())
            {
               _loc1_.getPet().destroy();
            }
            _loc1_.destroy();
            _loc2_++;
         }
         gc.pWorld.getOtherHeroArray().length = 0;
      }
      
      private function gameStart() : void
      {
         var daijishi:DaoJiShi = null;
         var bh:BaseHero = null;
         daijishi = new DaoJiShi(DaoJiShi.DAOJISHI_START);
         daijishi.x = 400;
         daijishi.y = 200;
         GMain.getInstance().getTopSence().addChild(daijishi);
         gc.nodeInfo.start();
         gc.gameInfo.pkStart();
         gc.keyboardControl.stopAllControl();
         for each(bh in gc.getPlayerArray())
         {
            bh.setAction("wait");
            bh.setStatic();
            bh.speed.y = 0;
            bh.roleProperies.setHHP(bh.roleProperies.getSHHP());
            bh.roleProperies.setMMP(bh.roleProperies.getSMMP());
            if(bh.getPet())
            {
               bh.getPet().petInfo.setHp(bh.getPet().petInfo.getSHp());
               bh.getPet().petInfo.setMp(bh.getPet().petInfo.getSMp());
            }
            bh.getBBDC().show();
            bh.cancelAllEffect();
            bh.resetKey();
            bh.resetGraity();
            bh.clearAllBullets();
            gc.protectedPerproty.setProperty(bh,"jumpCount",0);
         }
         TweenMax.delayedCall(2,function(param1:Config):*
         {
            param1.keyboardControl.continueAllControl();
         },[gc]);
         this.showDisplayObjectByOtherHeroUserWhenStartGame();
      }
      
      private function gameCountdown() : void
      {
         this.countDownTimer.start();
      }
      
      private function __countDownTimer(param1:TimerEvent) : void
      {
         var _loc2_:* = null;
         if(this.countDownTimer.currentCount == 3)
         {
            this.countDownTimer.stop();
            this.countDownTimer.reset();
            if(gc.isInRoom())
            {
               gc.gameStart();
            }
         }
         else
         {
            _loc2_ = new DaoJiShi(this.countDownTimer.currentCount.toString());
            _loc2_.x = 400;
            _loc2_.y = 200;
            GMain.getInstance().getTopSence().addChild(_loc2_);
         }
      }
      
      private function setNodeData(param1:ByteArray) : void
      {
         var _loc2_:Array = param1.readUTFBytes(param1.length).split(",");
         if(gc.nodeInfo)
         {
            gc.nodeInfo.roomName = _loc2_[0];
            gc.nodeInfo.GameMode = parseInt(_loc2_[1]);
            gc.nodeInfo.mpInfo = parseInt(_loc2_[2]);
            gc.nodeInfo.averLevel = parseInt(_loc2_[3]);
            gc.nodeInfo.singleIdPlayerNum = parseInt(_loc2_[4]);
         }
      }
      
      private function getUserDataBySid(param1:uint, param2:ByteArray) : void
      {
         var _loc3_:Array = param2.readUTFBytes(param2.length).split(",");
      }
      
      private function refreshOtherMutiUser(param1:uint, param2:ByteArray) : void
      {
         var _loc3_:Array = param2.readUTFBytes(param2.length).split(",");
         var _loc4_:int = int(parseInt(_loc3_[0]));
         var _loc5_:int = int(parseInt(_loc3_[1]));
         var _loc6_:int = int(parseInt(_loc3_[2]));
         var _loc7_:int = int(parseInt(_loc3_[3]));
         var _loc8_:int = int(parseInt(_loc3_[4]));
         var _loc9_:int = int(parseInt(_loc3_[5]));
         var _loc10_:String = _loc3_[6];
         var _loc11_:int = int(parseInt(_loc3_[7]));
         var _loc12_:int = int(parseInt(_loc3_[8]));
         var _loc13_:int = int(parseInt(_loc3_[9]));
         var _loc14_:uint = uint(parseInt(_loc3_[10]));
         var _loc15_:Number = Number(_loc3_[11]);
         var _loc16_:uint = uint(parseInt(_loc3_[12]));
         var _loc17_:MutiUser = gc.getMutiUserBySidAndRoleId(param1,_loc4_);
         var _loc18_:BaseHero = gc.getHeroBySidAndRoleId(param1,_loc4_);
         if(Boolean(_loc17_) && Boolean(_loc18_))
         {
            if(_loc7_ != _loc17_.equpId || _loc8_ != _loc17_.weaponId)
            {
               _loc18_.setCurClothId(_loc7_);
               _loc18_.setCurWeaponId(_loc8_);
               _loc18_.refreshEquip();
            }
            if(gc.nodeInfo.isStartIng())
            {
               if(_loc5_ < _loc17_.hp)
               {
                  _loc18_.addHeroHurtMc(_loc17_.hp - _loc5_);
               }
               else if(_loc5_ > _loc17_.hp)
               {
                  _loc18_.addCureMc(_loc5_ - _loc17_.hp);
               }
            }
            _loc17_.hp = _loc5_;
            _loc17_.shp = _loc6_;
            _loc17_.equpId = _loc7_;
            _loc17_.weaponId = _loc8_;
            _loc17_.level = _loc9_;
            if(_loc17_.petName != _loc10_)
            {
               _loc17_.petName = _loc10_;
               if(_loc18_)
               {
                  _loc18_.changePet();
               }
            }
            else if(_loc18_.getPet())
            {
               if(gc.nodeInfo.isStartIng())
               {
                  if(_loc11_ < _loc17_.petHp)
                  {
                     _loc18_.getPet().addMonHurtMc(_loc17_.petHp - _loc11_,false);
                  }
                  else if(_loc11_ > _loc17_.petHp)
                  {
                     _loc18_.getPet().addCureMc(_loc11_ - _loc17_.petHp);
                  }
               }
            }
            _loc17_.petLevel = _loc16_;
            _loc17_.petHp = _loc11_;
            _loc17_.petMp = _loc12_;
            if(_loc17_.bmwId != _loc13_)
            {
               _loc17_.bmwId = _loc13_;
               if(_loc18_)
               {
                  _loc18_.changeMagicWeapon();
               }
            }
            _loc17_.def = _loc14_;
            _loc17_.mDef = _loc15_;
         }
      }
      
      private function refreshRoomList(param1:uint, param2:ByteArray) : void
      {
         var _loc3_:Array = param2.readUTFBytes(param2.length).split(",");
         var _loc4_:String = _loc3_[0];
         if(!gc.gameInfo)
         {
         }
      }
      
      private function updateChat(param1:uint, param2:ByteArray) : void
      {
         var _loc3_:Array = param2.readUTFBytes(param2.length).split(",");
         var _loc4_:String = _loc3_[0];
         var _loc5_:String = _loc3_[1];
         if(_loc4_ == gc.sid.toString())
         {
            _loc4_ = "我";
         }
         gc.eventManger.dispatchEvent(new CommonEvent("NormalChat",[_loc4_,_loc5_]));
      }
      
      private function otherPetAttack(param1:uint, param2:ByteArray) : void
      {
         var _loc3_:Point = null;
         var _loc4_:* = null;
         var _loc5_:* = null;
         if(gc.isInHost())
         {
            return;
         }
         var _loc6_:Array = param2.readUTFBytes(param2.length).split(",");
         var _loc7_:uint = uint(parseInt(_loc6_[0]));
         var _loc8_:String = _loc6_[1];
         var _loc9_:uint = uint(parseInt(_loc6_[2]));
         _loc3_ = new Point();
         _loc3_.x = parseInt(_loc6_[3]);
         _loc3_.y = parseInt(_loc6_[4]);
         if(_loc6_[5] != "null")
         {
            _loc4_ = _loc6_[5].toString().split("|");
         }
         if(param1 == gc.sid)
         {
            return;
         }
         _loc5_ = gc.getPetBySidAndRoleId(param1,_loc7_);
         if(_loc5_)
         {
            _loc5_.setOtherAttack(_loc8_,_loc9_,_loc3_,_loc4_);
         }
      }
      
      private function otherPetAction(param1:uint, param2:ByteArray) : void
      {
         var _loc3_:BasePet = null;
         var _loc4_:Array = param2.readUTFBytes(param2.length).split(",");
         var _loc5_:uint = uint(parseInt(_loc4_[0]));
         var _loc6_:String = _loc4_[1];
         var _loc7_:Number = Number(_loc4_[2]);
         var _loc8_:Number = Number(_loc4_[3]);
         _loc3_ = gc.getPetBySidAndRoleId(param1,_loc5_);
         if(_loc3_)
         {
            _loc3_.setOtherAction(_loc6_);
            _loc3_.x = _loc7_;
            _loc3_.y = _loc8_;
         }
      }
      
      private function otherBuff(param1:uint, param2:ByteArray) : void
      {
         var _loc3_:BaseHero = null;
         if(gc.isInHost())
         {
            return;
         }
         var _loc4_:Array = param2.readUTFBytes(param2.length).split(",");
         var _loc5_:uint = uint(parseInt(_loc4_[0]));
         var _loc6_:uint = uint(parseInt(_loc4_[1]));
         var _loc7_:String = _loc4_[2].toString();
         var _loc8_:Array = _loc4_[3].toString().split("|");
         _loc3_ = gc.getHeroBySidAndRoleId(_loc5_,_loc6_);
         if(_loc3_)
         {
            _loc3_.setOtherBuff(_loc7_,_loc8_);
         }
      }
      
      private function otherAttack(param1:uint, param2:ByteArray) : void
      {
         var _loc3_:Point = null;
         var _loc4_:* = null;
         var _loc5_:* = null;
         var _loc6_:* = 0;
         if(gc.isInHost())
         {
            return;
         }
         var _loc7_:Array = param2.readUTFBytes(param2.length).split(",");
         var _loc8_:uint = uint(parseInt(_loc7_[0]));
         var _loc9_:String = _loc7_[1];
         var _loc10_:uint = uint(parseInt(_loc7_[2]));
         _loc3_ = new Point();
         _loc3_.x = parseInt(_loc7_[3]);
         _loc3_.y = parseInt(_loc7_[4]);
         if(_loc7_[5] != "null")
         {
            _loc4_ = _loc7_[5].toString().split("|");
         }
         var _loc11_:uint = uint(parseInt(_loc7_[6]));
         if(_loc9_ == "Role2Hit7")
         {
            _loc6_ = uint(parseInt(_loc4_[0]));
            _loc5_ = gc.getHeroBySidAndRoleId(_loc6_,_loc8_) as BaseHero;
            if(_loc5_)
            {
               _loc5_.setOtherAttack(_loc9_,_loc10_,_loc3_,_loc4_,_loc11_);
            }
         }
         else if(_loc9_ == "Role3Hit6")
         {
            _loc6_ = uint(parseInt(_loc4_[0]));
            _loc5_ = gc.getHeroBySidAndRoleId(_loc6_,_loc8_) as BaseHero;
            if(_loc5_)
            {
               _loc5_.setOtherAttack(_loc9_,_loc10_,_loc3_,_loc4_,_loc11_);
            }
         }
         else
         {
            if(param1 == gc.sid)
            {
               return;
            }
            _loc5_ = gc.getHeroBySidAndRoleId(param1,_loc8_) as BaseHero;
            if(_loc5_)
            {
               _loc5_.setOtherAttack(_loc9_,_loc10_,_loc3_,_loc4_,_loc11_);
            }
         }
      }
      
      private function showDelay(param1:uint) : void
      {
         var _loc2_:uint = (Number(getTimer()) - gc.lastDelayTime) / 2;
         if(gc.hero1)
         {
            if(gc.logInfo)
            {
               gc.hero1.setNameTextField(gc.logInfo.name + "  " + _loc2_ + " ms");
            }
            else
            {
               gc.hero1.setNameTextField(gc.sid + "P" + "  " + _loc2_ + " ms");
            }
         }
         if(gc.hero2)
         {
            if(gc.logInfo)
            {
               gc.hero2.setNameTextField(gc.logInfo.name + "  " + _loc2_ + " ms");
            }
            else
            {
               gc.hero2.setNameTextField(gc.sid + "P" + "  " + _loc2_ + " ms");
            }
         }
         this.resetDelayCount();
      }
      
      private function runOther(param1:uint, param2:ByteArray) : void
      {
         var _loc3_:BaseHero = null;
         var _loc4_:Array = param2.readUTFBytes(param2.length).split(",");
         var _loc5_:uint = uint(parseInt(_loc4_[0]));
         if(param1 == gc.sid)
         {
            return;
         }
         _loc3_ = gc.getHeroBySidAndRoleId(param1,_loc5_) as BaseHero;
         if(_loc3_)
         {
            _loc3_.doubleCount = 1;
         }
      }
      
      private function deadOther(param1:uint, param2:ByteArray) : void
      {
         var _loc3_:BaseHero = null;
         var _loc4_:* = undefined;
         if(gc.isInHost())
         {
            return;
         }
         var _loc5_:Array = param2.readUTFBytes(param2.length).split(",");
         var _loc6_:uint = uint(parseInt(_loc5_[0]));
         if(param1 == gc.sid)
         {
            return;
         }
         _loc3_ = gc.getHeroBySidAndRoleId(param1,_loc6_) as BaseHero;
         if(_loc3_)
         {
            _loc4_ = AUtils.getNewObj("PlayerDeadMc");
            _loc4_.x = _loc3_.x;
            _loc4_.y = _loc3_.y;
            gc.gameSence.addChild(_loc4_);
            _loc3_.destroy();
         }
         this.removeHeroBySidAndRoleId(param1,_loc6_);
      }
      
      private function deadPetOther(param1:uint, param2:ByteArray) : void
      {
         var _loc3_:BaseHero = null;
         if(gc.isInHost())
         {
            return;
         }
         var _loc4_:Array = param2.readUTFBytes(param2.length).split(",");
         var _loc5_:uint = uint(parseInt(_loc4_[0]));
         if(param1 == gc.sid)
         {
            return;
         }
         _loc3_ = gc.getHeroBySidAndRoleId(param1,_loc5_) as BaseHero;
         if(_loc3_.getPet())
         {
            _loc3_.getPet().destroy();
         }
      }
      
      private function hurtOtherPet(param1:uint, param2:ByteArray) : void
      {
         var _loc3_:* = null;
         var _loc4_:* = null;
         if(gc.isInHost())
         {
            return;
         }
         var _loc5_:Array = param2.readUTFBytes(param2.length).split(",");
         var _loc6_:String = _loc5_[0];
         var _loc7_:uint = uint(parseInt(_loc6_.charAt(0)));
         var _loc8_:uint = uint(parseInt(_loc6_.charAt(1)));
         var _loc9_:int = int(parseInt(_loc5_[1]));
         var _loc10_:uint = uint(parseInt(_loc5_[2]));
         var _loc11_:String = _loc5_[3];
         var _loc12_:int = int(parseInt(_loc5_[4]));
         var _loc13_:int = int(parseInt(_loc5_[5]));
         var _loc14_:uint = uint(parseInt(_loc5_[6]));
         var _loc15_:Boolean = parseInt(_loc5_[7]) == 1 ? true : false;
         var _loc16_:Boolean = parseInt(_loc5_[8]) == 1 ? true : false;
         if(param1 == gc.sid)
         {
            return;
         }
         if(_loc10_ != gc.sid)
         {
            _loc3_ = gc.getHeroBySidAndRoleId(_loc10_,_loc7_);
         }
         else if(Boolean(gc.hero1) && gc.hero1.getPlayer().roleid == _loc7_)
         {
            _loc3_ = gc.hero1;
         }
         else if(Boolean(gc.hero2) && gc.hero2.getPlayer().roleid == _loc7_)
         {
            _loc3_ = gc.hero2;
         }
         var _loc17_:BaseHero = gc.getHeroBySidAndRoleId(param1,_loc8_) as BaseHero;
         if(_loc14_ > 0)
         {
            if(_loc17_)
            {
               for each(_loc4_ in _loc17_.magicBulletArray)
               {
                  if(_loc4_.initTimer == _loc14_)
                  {
                     _loc4_.reduceMaxAttackCount();
                  }
               }
            }
         }
         if(!_loc3_ || !_loc3_.getPet())
         {
            return;
         }
         if(_loc16_)
         {
            _loc3_.getPet().setAttackBack(new Point(_loc12_,_loc13_));
            _loc3_.getPet().addBeAttackEffectForOther();
         }
         _loc3_.getPet().reduceHp(_loc9_,_loc15_);
      }
      
      private function hurtOther(param1:uint, param2:ByteArray) : void
      {
         var _loc3_:* = null;
         var _loc4_:* = null;
         if(gc.isInHost())
         {
            return;
         }
         var _loc5_:Array = param2.readUTFBytes(param2.length).split(",");
         var _loc6_:String = _loc5_[0];
         var _loc7_:uint = uint(parseInt(_loc6_.charAt(0)));
         var _loc8_:uint = uint(parseInt(_loc6_.charAt(1)));
         var _loc9_:int = int(parseInt(_loc5_[1]));
         var _loc10_:uint = uint(parseInt(_loc5_[2]));
         var _loc11_:String = _loc5_[3];
         var _loc12_:int = int(parseInt(_loc5_[4]));
         var _loc13_:int = int(parseInt(_loc5_[5]));
         var _loc14_:uint = uint(parseInt(_loc5_[6]));
         var _loc15_:Boolean = parseInt(_loc5_[7]) == 1 ? true : false;
         var _loc16_:Boolean = parseInt(_loc5_[8]) == 1 ? true : false;
         if(param1 == gc.sid)
         {
            return;
         }
         if(_loc10_ != gc.sid)
         {
            _loc3_ = gc.getHeroBySidAndRoleId(_loc10_,_loc7_);
         }
         else if(Boolean(gc.hero1) && gc.hero1.getPlayer().roleid == _loc7_)
         {
            _loc3_ = gc.hero1;
         }
         else if(Boolean(gc.hero2) && gc.hero2.getPlayer().roleid == _loc7_)
         {
            _loc3_ = gc.hero2;
         }
         var _loc17_:BaseHero = gc.getHeroBySidAndRoleId(param1,_loc8_) as BaseHero;
         if(_loc14_ > 0)
         {
            if(_loc17_)
            {
               for each(_loc4_ in _loc17_.magicBulletArray)
               {
                  if(_loc4_.initTimer == _loc14_)
                  {
                     _loc4_.reduceMaxAttackCount();
                  }
               }
            }
         }
         if(!_loc3_)
         {
            return;
         }
         if(_loc16_)
         {
            _loc3_.setAttackBack(new Point(_loc12_,_loc13_));
            _loc3_.beAttackDoing();
         }
         _loc3_.reduceHp(_loc9_,_loc15_);
      }
      
      private function faceToOther(param1:uint, param2:ByteArray) : void
      {
         var _loc3_:BaseHero = null;
         if(param1 == gc.sid)
         {
            return;
         }
         var _loc4_:Array = param2.readUTFBytes(param2.length).split(",");
         var _loc5_:uint = uint(parseInt(_loc4_[0]));
         _loc3_ = gc.getHeroBySidAndRoleId(param1,_loc5_) as BaseHero;
         if(!_loc3_)
         {
            return;
         }
         var _loc6_:Boolean = _loc4_[1].toString() == "true" ? true : false;
         var _loc7_:Boolean = _loc4_[2].toString() == "true" ? true : false;
         if(!_loc6_ && !_loc7_)
         {
            if(_loc3_.isLeft)
            {
               _loc3_.stopMoveLeft();
            }
            if(_loc3_.isRight)
            {
               _loc3_.stopMoveRight();
            }
         }
         else
         {
            _loc3_.isLeft = _loc6_;
            _loc3_.isRight = _loc7_;
            if(_loc3_.isLeft)
            {
               _loc3_.isRight = false;
               _loc3_.getBBDC().turnLeft();
            }
            if(_loc3_.isRight)
            {
               _loc3_.isLeft = false;
               _loc3_.getBBDC().turnRight();
            }
         }
         _loc3_.doubleCount = 0;
      }
      
      private function walkOther(param1:uint, param2:ByteArray) : void
      {
         var _loc3_:BaseHero = null;
         if(param1 == gc.sid)
         {
            return;
         }
         var _loc4_:Array = param2.readUTFBytes(param2.length).split(",");
         var _loc5_:uint = uint(parseInt(_loc4_[0]));
         _loc3_ = gc.getHeroBySidAndRoleId(param1,_loc5_) as BaseHero;
         if(!_loc3_)
         {
            return;
         }
         var _loc6_:int = int(gc.protectedPerproty.getProperty(_loc3_,"jumpCount").toString());
         switch(_loc4_[1].toString())
         {
            case "run":
               _loc3_.doubleCount = 1;
               _loc3_.setAction(_loc4_[1].toString());
               break;
            case "jump1":
               if(_loc6_ != 2)
               {
                  if(_loc3_.getBBDC().getState() != "jump1" && _loc3_.getBBDC().getState() != "jump2")
                  {
                     _loc3_.doJump();
                     _loc3_.setAction(_loc4_[1].toString());
                  }
               }
               break;
            case "jump2":
               if(_loc6_ != 2)
               {
                  if(_loc3_.getBBDC().getState() != "jump2")
                  {
                     _loc3_.doJump();
                     _loc3_.setAction(_loc4_[1].toString());
                  }
               }
         }
         _loc3_.isLeft = _loc4_[2].toString() == "true" ? true : false;
         _loc3_.isRight = _loc4_[3].toString() == "true" ? true : false;
      }
      
      private function posAndDirectOther(param1:uint, param2:ByteArray) : void
      {
         var _loc3_:BaseHero = null;
         if(param1 == gc.sid)
         {
            return;
         }
         var _loc4_:Array = param2.readUTFBytes(param2.length).split(",");
         var _loc5_:uint = uint(parseInt(_loc4_[0]));
         _loc3_ = gc.getHeroBySidAndRoleId(param1,_loc5_) as BaseHero;
         if(!_loc3_)
         {
            return;
         }
         if(_loc4_[1].toString() == "wait")
         {
            _loc3_.setStatic();
         }
         _loc3_.x = parseInt(_loc4_[1]);
         _loc3_.y = parseInt(_loc4_[2]);
         _loc3_.isLeft = _loc4_[3].toString() == "true" ? true : false;
         _loc3_.isRight = _loc4_[4].toString() == "true" ? true : false;
      }
      
      private function moveOther(param1:uint, param2:ByteArray) : void
      {
         var _loc3_:BaseHero = null;
         if(param1 == gc.sid)
         {
            return;
         }
         var _loc4_:Array = param2.readUTFBytes(param2.length).split(",");
         var _loc5_:uint = uint(parseInt(_loc4_[0]));
         _loc3_ = gc.getHeroBySidAndRoleId(param1,_loc5_) as BaseHero;
         if(!_loc3_)
         {
            return;
         }
         if(_loc4_[1].toString() == "wait")
         {
            _loc3_.setStatic();
         }
         _loc3_.setAction(_loc4_[1].toString());
         _loc3_.x = parseInt(_loc4_[2]);
         _loc3_.y = parseInt(_loc4_[3]);
         _loc3_.isLeft = _loc4_[4].toString() == "true" ? true : false;
         _loc3_.isRight = _loc4_[5].toString() == "true" ? true : false;
      }
      
      override public function step() : void
      {
         var _loc1_:* = 0;
         var _loc2_:* = null;
         var _loc3_:* = null;
         var _loc4_:* = NaN;
         var _loc5_:* = NaN;
         var _loc6_:int = 0;
         var _loc7_:* = null;
         super.step();
         if(this.delayCount > 0)
         {
            --this.delayCount;
            if(this.delayCount == 0)
            {
               gc.getDelay();
               this.delayCount = -1;
            }
         }
         if(gc.isInRoom())
         {
            if(gc.nodeInfo)
            {
               gc.nodeInfo.step();
            }
         }
         if(this.iii > 0)
         {
            --this.iii;
         }
         if(gc.isInHost())
         {
            if(this.iii == 0)
            {
               if(Boolean(gc.gameInfo) && !gc.gameInfo.getIsHideOther())
               {
                  _loc1_ = uint(gc.pWorld.getOtherHeroUserArray().length);
                  _loc4_ = 0;
                  _loc5_ = 0;
                  if(gc.hero1)
                  {
                     _loc4_ = Number(_loc4_ + gc.hero1.x);
                     _loc5_ = Number(_loc5_ + gc.hero1.y);
                  }
                  if(gc.hero2)
                  {
                     _loc4_ = Number(_loc4_ + gc.hero2.x);
                     _loc5_ = Number(_loc5_ + gc.hero2.y);
                  }
                  _loc4_ = Number(_loc4_ / gc.getPlayerArray().length);
                  _loc5_ = Number(_loc5_ / gc.getPlayerArray().length);
                  _loc6_ = 0;
                  while(_loc6_ < _loc1_)
                  {
                     _loc2_ = gc.pWorld.getOtherHeroUserArray()[_loc6_] as MutiUser;
                     if(_loc2_.sid != gc.sid)
                     {
                        _loc3_ = gc.getHeroBySidAndRoleId(_loc2_.sid,_loc2_.roleId);
                        if(_loc3_)
                        {
                           _loc7_ = gc.gameSence.localToGlobal(new Point(_loc3_.x,_loc3_.y));
                           if(_loc7_.x <= 0 || _loc7_.x >= 940 || _loc7_.y <= 0 || _loc7_.y >= 590)
                           {
                              _loc3_.getBBDC().hide();
                              if(_loc3_.getPet())
                              {
                                 _loc3_.getPet().getBBDC().hide();
                              }
                              if(_loc3_.getCurMagicWeapon())
                              {
                                 _loc3_.getCurMagicWeapon().getBBDC().hide();
                              }
                           }
                           else
                           {
                              _loc3_.getBBDC().show();
                              if(_loc3_.getPet())
                              {
                                 _loc3_.getPet().getBBDC().show();
                              }
                              if(_loc3_.getCurMagicWeapon())
                              {
                                 _loc3_.getCurMagicWeapon().getBBDC().show();
                              }
                           }
                        }
                     }
                     _loc6_++;
                  }
               }
               this.iii = gc.frameClips * 2;
            }
         }
      }
      
      private function changeMapByMapInfo() : void
      {
         if(gc.chooseMap == 1)
         {
            gc.curStage = 0;
            gc.curLevel = 2;
         }
         gc.pWorld.mutiMapChange();
      }
      
      private function changeMapToHost() : void
      {
         if(gc.chooseMap == 1)
         {
            gc.curStage = 0;
            gc.curLevel = 1;
         }
         gc.pWorld.mutiMapChange();
      }
      
      private function resetDelayCount() : void
      {
         this.delayCount = gc.frameClips * 2;
      }
      
      override public function destroy() : void
      {
         super.destroy();
         if(this.countDownTimer)
         {
            this.countDownTimer.stop();
            this.countDownTimer.removeEventListener(TimerEvent.TIMER,this.__countDownTimer);
            this.countDownTimer = null;
         }
      }
   }
}

