package storage
{
   import config.*;
   import event.CommonEvent;
   import export.*;
   import flash.net.SharedObject;
   import flash.utils.*;
   import my.*;
   
   public class MemoryClass
   {
      
      private var gc:Config;
      
      public var so:SharedObject;
      
      public var mystorage:Object;
      
      private var otherstorage:Object;
      
      private var saveIndex:uint;
      
      private var date:Date;
      
      public function MemoryClass()
      {
         this.date = new Date();
         super();
         this.gc = Config.getInstance();
      }
      
      public function getStorage() : void
      {
         var _loc1_:* = null;
         var _loc2_:* = this.mystorage;
         if(_loc2_)
         {
            this.gc.playNum = uint(_loc2_.playerNum);
            if(_loc2_.isZx != null)
            {
               this.gc.isZx = Boolean(_loc2_.isZx);
            }
            else
            {
               this.gc.isZx = true;
            }
            if(_loc2_.isFirst != null)
            {
               this.gc.isFirst = Boolean(_loc2_.isFirst);
            }
            else
            {
               this.gc.isFirst = true;
            }
            this.gc.hasget = Boolean(_loc2_.hasget);
            this.gc.hasgetsorry = uint(_loc2_.hasgetsorry);
            this.gc.hasgetslsorry = uint(_loc2_.hasgetslsorry);
            if(_loc2_.player1_obj != undefined)
            {
               this.gc.player1.setSaveObj(_loc2_.player1_obj);
            }
            if(_loc2_.player2_obj != undefined)
            {
               this.gc.player2.setSaveObj(_loc2_.player2_obj);
            }
            this.gc.curBigLevel = uint(_loc2_.curBigLevel);
            this.gc.curBigStage = uint(_loc2_.curBigStage);
            if(_loc2_.whichlastworld != undefined)
            {
               this.gc.Objectdata.whichlastworld = _loc2_.whichlastworld;
            }
            if(_loc2_.specialUI != undefined)
            {
               this.gc.Objectdata.specialUI = _loc2_.specialUI;
            }
            if(_loc2_.gm != undefined)
            {
               this.gc.Objectdata.gm = _loc2_.gm;
            }
            if(_loc2_.canplayturntable != undefined)
            {
               this.gc.Objectdata.canplayturntable = _loc2_.canplayturntable;
            }
            if(_loc2_.turntableScore != undefined)
            {
               this.gc.Objectdata.turntableScore = _loc2_.turntableScore;
            }
            if(_loc2_.nymark)
            {
               this.gc.nymark = _loc2_.nymark;
            }
            if(_loc2_.hdInfo)
            {
               this.gc.hdInfo = String(_loc2_.hdInfo).split(",");
            }
            else
            {
               this.gc.hdInfo = [];
            }
            if(_loc2_.qhsInfo)
            {
               this.gc.qhsInfo = String(_loc2_.qhsInfo).split(",");
            }
            else
            {
               this.gc.qhsInfo = [];
            }
            if(_loc2_.version != 1 || !_loc2_.version)
            {
               GMain.getInstance().stage.nativeWindow.close();
            }
            this.gc.heroBuffArray.length = 0;
            if(_loc2_.hpUpBuffCount > 0)
            {
               _loc1_ = {
                  "name":HeroBuff.HPUPBUFF,
                  "count":_loc2_.hpUpBuffCount
               };
               this.gc.heroBuffArray.push(_loc1_);
            }
         }
      }
      
      public function setStorage(param1:int = -1) : void
      {
         this.mystorage = {};
         this.mystorage.luserid = this.gc.getLocalUserId();
         this.mystorage.playerNum = this.gc.playNum;
         this.mystorage.hasget = this.gc.hasget;
         this.mystorage.hasgetslsorry = this.gc.hasgetslsorry;
         this.mystorage.hasgetsorry = this.gc.hasgetsorry;
         if(this.gc.player1.roleid > 0)
         {
            this.mystorage.player1_obj = this.gc.player1.getSaveObj();
         }
         if(this.gc.player2.roleid > 0)
         {
            this.mystorage.player2_obj = this.gc.player2.getSaveObj();
         }
         this.mystorage.gm = this.gc.Objectdata.gm;
         this.mystorage.specialUI = this.gc.Objectdata.specialUI;
         this.mystorage.whichlastworld = this.gc.Objectdata.whichlastworld;
         this.mystorage.canplayturntable = this.gc.Objectdata.canplayturntable;
         this.mystorage.turntableScore = this.gc.Objectdata.turntableScore;
         this.mystorage.curBigStage = this.gc.curBigStage;
         this.mystorage.curBigLevel = this.gc.curBigLevel;
         this.mystorage.nymark = this.gc.nymark;
         this.mystorage.hdInfo = this.gc.hdInfo.join(",");
         this.mystorage.qhsInfo = this.gc.qhsInfo.join(",");
         this.mystorage.isZx = false;
         this.mystorage.isFirst = false;
         this.mystorage.version = 1;
         var _loc2_:String = "";
         if(this.gc.player1.roleid > 0)
         {
            _loc2_ += this.gc.player1.getRoleName() + " ";
         }
         if(this.gc.player2.roleid > 0)
         {
            _loc2_ += this.gc.player2.getRoleName();
         }
      }
      
      public function storageValue(param1:int, param2:*) : void
      {
         this.gc.opening = true;
         if(param1 == 7)
         {
            this.otherstorage = param2;
            this.gc.openPig = Boolean(this.otherstorage.openPig);
         }
         else
         {
            this.mystorage = param2;
         }
      }
      
      public function setOtherStorage() : void
      {
         this.otherstorage = {};
      }
      
      public function saveGame(param1:int, param2:Boolean = false) : void
      {
         if(param1 == -1)
         {
            throw "data Index Error!";
         }
         var _loc3_:ByteArray = null;
         this.setStorage(0);
         var _loc4_:savetrans = new savetrans();
         var _loc5_:String = _loc4_.objectToString(this.gc.memory.mystorage);
         _loc3_ = new ByteArray();
         _loc3_.writeObject(_loc5_);
         var _loc6_:int = 0;
         while(_loc6_ < 1 + Math.round(Math.random() * 5))
         {
            _loc3_.compress();
            _loc6_++;
         }
         var _loc7_:* = getDefinitionByName("FileHandler::fileHandler");
         if(_loc7_)
         {
            _loc7_.write(this.gc.encrypt(_loc3_),_loc7_.getAppFloderFileUrl("gameData/" + param1 + ".sav"));
         }
         this.gc.saveIntervelCount = 0;
         if(param2)
         {
            this.gc.alert("存档成功！");
         }
      }
      
      private function readGame(param1:CommonEvent) : void
      {
         var _loc2_:int = int(param1.data[0]);
         this.gc.saveId = _loc2_;
      }
   }
}

