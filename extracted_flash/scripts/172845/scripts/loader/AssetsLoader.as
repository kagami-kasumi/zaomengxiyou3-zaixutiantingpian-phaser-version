package loader
{
   import config.*;
   import flash.display.*;
   import flash.events.Event;
   import flash.events.IOErrorEvent;
   import flash.events.ProgressEvent;
   import flash.net.*;
   import flash.system.*;
   import flash.utils.*;
   
   public class AssetsLoader
   {
      
      public var gc:Config;
      
      private var currentFileIdx:int;
      
      private var uloader:URLLoader;
      
      private var after:Function;
      
      private var afterName:String = "";
      
      private var loadSwfsWhenStage0:Array;
      
      private var loadSwfsWhenStage3:Array;
      
      private var loadSwfsWhenStage5:Array;
      
      private var loadSwfsWhenStage7:Array;
      
      private var loadSwfsWhenStage10:Array;
      
      private var loadSwfsWhenStage14:Array;
      
      private var loadSwfsWhenStage16:Array;
      
      private var loadSwfsWhenStage20:Array;
      
      private var loadSwfsWhenStage21:Array;
      
      private var loadSwfsWhenStage22:Array;
      
      private var loadSwfsWhenStage23:Array;
      
      private var loadSwfsWhenStage25:Array;
      
      private var loadSwfsWhenStage30:Array;
      
      private var loadSwfsWhenStage98:Array;
      
      private var loadSwfsWhenStageCopy:*;
      
      private var mustLoadAsset:*;
      
      private var loadSwfsTotalLen:uint = 0;
      
      public function AssetsLoader()
      {
         super();
         this.loadSwfsWhenStage0 = new Array("1","2","3","5","6","7","8","SD1");
         this.loadSwfsWhenStage3 = new Array("1","2");
         this.loadSwfsWhenStage5 = new Array("Monster1007");
         this.loadSwfsWhenStage7 = new Array("ShaShen");
         this.loadSwfsWhenStage10 = new Array("Monster47","levels/level102","levels/level103","levels/level104","levels/level105","levels/level106","levels/level107","levels/level108");
         this.loadSwfsWhenStage14 = new Array("Monster60");
         this.loadSwfsWhenStage16 = new Array("Otherzm");
         this.loadSwfsWhenStage20 = new Array("43");
         this.loadSwfsWhenStage21 = new Array("45");
         this.loadSwfsWhenStage22 = new Array("4");
         this.loadSwfsWhenStage23 = new Array("21");
         this.loadSwfsWhenStage25 = new Array("24");
         this.loadSwfsWhenStage30 = new Array("Monster1008");
         this.loadSwfsWhenStage98 = new Array("1","2","3","4","5","EndlessMode");
         this.mustLoadAsset = new Array();
         this.loadSwfsWhenStageCopy = new Array();
         this.mustLoadAsset.push("Role1Effect");
         this.mustLoadAsset.push("cs_zb/wk_fj","cs_zb/wk_wq","cs_zb/ts_wq","cs_zb/ts_fj","cs_zb/bj_wq","cs_zb/bj_fj","cs_zb/ss_wq","cs_zb/ss_fj_c","cs_zb/ss_fj_g");
         this.gc = Config.getInstance();
      }
      
      public function init() : *
      {
      }
      
      public function loadByName(param1:String, param2:String, param3:Function) : void
      {
         var _loc4_:Array = new Array();
         if(param1 == "0")
         {
            this.loadSwfsWhenStageCopy = this.loadSwfsWhenStage0.concat();
         }
         else if(param1 == "3")
         {
            this.loadSwfsWhenStageCopy = this.loadSwfsWhenStage3.concat();
         }
         else if(param1 == "5")
         {
            this.loadSwfsWhenStageCopy = this.loadSwfsWhenStage5.concat();
         }
         else if(param1 == "7")
         {
            this.loadSwfsWhenStageCopy = this.loadSwfsWhenStage7.concat();
         }
         else if(param1 == "10")
         {
            this.loadSwfsWhenStageCopy = this.loadSwfsWhenStage10.concat();
         }
         else if(param1 == "14")
         {
            this.loadSwfsWhenStageCopy = this.loadSwfsWhenStage14.concat();
         }
         else if(param1 == "16")
         {
            this.loadSwfsWhenStageCopy = this.loadSwfsWhenStage16.concat();
         }
         else if(param1 == "20")
         {
            this.loadSwfsWhenStageCopy = this.loadSwfsWhenStage20.concat();
         }
         else if(param1 == "21")
         {
            this.loadSwfsWhenStageCopy = this.loadSwfsWhenStage21.concat();
         }
         else if(param1 == "22" && param2 == "2")
         {
            this.loadSwfsWhenStageCopy = this.loadSwfsWhenStage22.concat();
         }
         else if(param1 == "23")
         {
            this.loadSwfsWhenStageCopy = this.loadSwfsWhenStage23.concat();
         }
         else if(param1 == "25")
         {
            this.loadSwfsWhenStageCopy = this.loadSwfsWhenStage25.concat();
         }
         else if(param1 == "30")
         {
            this.loadSwfsWhenStageCopy = this.loadSwfsWhenStage30.concat();
         }
         else if(param1 == "98")
         {
            this.loadSwfsWhenStageCopy = this.loadSwfsWhenStage98.concat();
         }
         else if(param1 == "4")
         {
            this.loadSwfsWhenStageCopy.push("53");
         }
         else if(param1 == "44")
         {
            this.loadSwfsWhenStageCopy.push("ShaShen");
         }
         else
         {
            this.loadSwfsWhenStageCopy.length = 0;
         }
         _loc4_ = this.getRolesAndPetsAssets();
         this.loadSwfsWhenStageCopy.push(this.getAssetsMap(param1,param2));
         this.loadSwfsWhenStageCopy = this.loadSwfsWhenStageCopy.concat(_loc4_);
         this.loadSwfsWhenStageCopy = this.loadSwfsWhenStageCopy.concat(this.mustLoadAsset);
         this.loadSwfsWhenStageCopy.push(param1);
         this.loadSwfsWhenStageCopy.push("Monster1111");
         if(this.gc.Objectdata.gm)
         {
            this.loadSwfsWhenStageCopy.push("EIcon2");
         }
         this.loadSwfsWhenStageCopy = this.filterLoadedFiles(this.loadSwfsWhenStageCopy);
         this.loadSwfsTotalLen = this.loadSwfsWhenStageCopy.length;
         this.after = param3;
         this.checkNext();
      }
      
      private function filterLoadedFiles(param1:Array) : Array
      {
         var _loc2_:* = undefined;
         var _loc3_:Array = new Array();
         for each(_loc2_ in param1)
         {
            if(!AssetsManager.getInstance().contains(_loc2_))
            {
               _loc3_.push(_loc2_);
            }
         }
         return _loc3_;
      }
      
      private function checkNext() : void
      {
         var _loc1_:* = null;
         if(this.loadSwfsWhenStageCopy.length > 0)
         {
            _loc1_ = this.loadSwfsWhenStageCopy.shift();
            this.loadSwfByName(_loc1_,this.after);
         }
         else
         {
            GMain.getInstance().processComplete();
            this.after();
         }
      }
      
      private function loadByStageAndLevelProgress(param1:ProgressEvent) : void
      {
         var _loc2_:int = int(param1.bytesLoaded / param1.bytesTotal * 100);
         var _loc3_:uint = uint(this.loadSwfsWhenStageCopy.length);
         GMain.getInstance().showLoadByStageAndLevelProgress(_loc2_,_loc3_,this.loadSwfsTotalLen);
      }
      
      private function loadSwfByName(param1:String, param2:Function) : void
      {
         this.after = param2;
         this.afterName = param1;
         this.uloader = new URLLoader();
         this.uloader.dataFormat = "binary";
         this.uloader.addEventListener("complete",this.loadCompleteHandler);
         var _loc3_:String = AssetsUrl.getAssetsUrl(this.getUrlByAfterName());
         this.uloader.load(new URLRequest(AssetsUrl.getAssetsSwf(_loc3_)));
         this.uloader.addEventListener("ioError",this.IoErrorHandler,false,0,true);
         this.uloader.addEventListener("progress",this.loadByStageAndLevelProgress);
         var _loc4_:uint = uint(this.loadSwfsWhenStageCopy.length);
         GMain.getInstance().showLoadByStageAndLevelProgress(0,_loc4_,this.loadSwfsTotalLen);
      }
      
      private function IoErrorHandler(param1:IOErrorEvent) : void
      {
      }
      
      private function getUrlByAfterName() : String
      {
         return this.afterName;
      }
      
      private function loadCompleteHandler(param1:Event) : void
      {
         var _loc3_:* = undefined;
         var _loc4_:* = null;
         var _loc5_:* = null;
         AssetsManager.getInstance().addAssetsName(this.afterName);
         this.uloader.removeEventListener("complete",arguments.callee);
         var _loc6_:ByteArray = this.uloader.data as ByteArray;
         _loc4_ = new Loader();
         _loc4_.contentLoaderInfo.addEventListener("complete",this.__loadToLocalComplete);
         _loc5_ = new ByteArray();
         _loc5_.writeBytes(_loc6_,97,79);
         _loc5_.writeBytes(_loc6_,0,97);
         _loc5_.writeBytes(_loc6_,176);
         _loc3_ = new LoaderContext(false,ApplicationDomain.currentDomain);
         _loc3_.allowCodeImport = true;
         _loc4_.loadBytes(_loc5_,_loc3_);
         this.uloader.removeEventListener("progress",this.loadByStageAndLevelProgress);
         this.uloader.close();
         this.uloader = null;
      }
      
      protected function __loadToLocalComplete(param1:Event) : void
      {
         var _loc2_:LoaderInfo = param1.target as LoaderInfo;
         _loc2_.loader.unload();
         this.checkNext();
      }
      
      private function getRolesAndPetsAssets() : Array
      {
         var _loc1_:Array = new Array();
         _loc1_.push("pet1","mouse");
         if(this.gc.curStage == 4 || this.gc.curStage == 22)
         {
            if(this.gc.Objectdata.specialUI)
            {
               _loc1_.push("SpecialUI/WuKong","SpecialUI/TangSeng","SpecialUI/BaJie","SpecialUI/ShaShen","bailongSword");
            }
            else
            {
               _loc1_.push("WuKong","TangSeng","BaJie","ShaShen","bailongSword");
            }
            return _loc1_;
         }
         if(this.gc.player1.roleid > 0)
         {
            _loc1_.push(this.getRoleNameByID(this.gc.player1.roleid));
         }
         if(this.gc.player2.roleid > 0)
         {
            _loc1_.push(this.getRoleNameByID(this.gc.player2.roleid));
         }
         return _loc1_;
      }
      
      private function getRoleNameByID(param1:uint) : String
      {
         if(this.gc.Objectdata.specialUI)
         {
            switch(param1)
            {
               case 1:
                  return "SpecialUI/WuKong";
               case 2:
                  return "SpecialUI/TangSeng";
               case 3:
                  return "SpecialUI/BaJie";
               case 4:
                  return "SpecialUI/ShaShen";
               case 5:
                  return "bailongSword";
               default:
                  return;
            }
         }
         else
         {
            switch(param1)
            {
               case 1:
                  return "WuKong";
               case 2:
                  return "TangSeng";
               case 3:
                  return "BaJie";
               case 4:
                  return "ShaShen";
               case 5:
                  return "bailongSword";
               default:
                  return;
            }
         }
      }
      
      private function getAssetsMap(param1:String, param2:String) : String
      {
         return "levels/level" + param1 + param2;
      }
   }
}

