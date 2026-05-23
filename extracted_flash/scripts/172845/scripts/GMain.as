package
{
   import World.*;
   import com.*;
   import com.greensock.*;
   import com.hexagonstar.util.debug.*;
   import config.*;
   import event.CommonEvent;
   import export.*;
   import export.cartoon.*;
   import export.huodong.*;
   import export.huodong.newyear.*;
   import export.immortality.*;
   import export.lose.*;
   import export.microshop.*;
   import export.shop.*;
   import export.strength.*;
   import export.taskInterface.*;
   import export.win.*;
   import flash.display.*;
   import flash.events.*;
   import flash.net.*;
   import flash.system.*;
   import flash.text.*;
   import flash.utils.*;
   import loader.*;
   import manager.*;
   import my.*;
   
   public class GMain extends MovieClip
   {
      
      private static var _this:GMain;
      
      public var gc:Config = new Config();
      
      private var pay:PayMoneyVar;
      
      private var _loader:Aloader;
      
      private var _AssetsLoader:AssetsLoader;
      
      private var mainSence:Sprite;
      
      private var topSence:Sprite;
      
      private var curState:String;
      
      internal var _GM:GameMenu;
      
      private var renewalse:Sprite;
      
      private var hastellplayer:Boolean = false;
      
      private var fontloader:Loader;
      
      private var mainFont:Class;
      
      private var FPStxt:TextField;
      
      private var FPS:FPScounter;
      
      private var _memory:TextField;
      
      private var _memoryTimer:Timer;
      
      public function GMain()
      {
         super();
         this._loader = new Aloader();
         this._loader.init();
         this._AssetsLoader = new AssetsLoader();
         this._AssetsLoader.init();
         _this = this;
         this._memoryTimer = new Timer(5000,0);
         this.tabChildren = false;
         this.tabEnabled = false;
         this.gc.pWorld = new PhysicsWorld();
         this.gc.lc = new LocalConnection();
         this.mainSence = new Sprite();
         this.topSence = new Sprite();
         this.addChild(this.mainSence);
         this.addChild(this.topSence);
         this.addEventListener(Event.ADDED_TO_STAGE,this.added,false,0,true);
         this.addEventListener(Event.REMOVED_FROM_STAGE,this.removed,false,0,true);
         this.fontloader = new Loader();
         this.fontloader.load(new URLRequest(AssetsUrl.getAssetsUrl("fonts.swf")),new LoaderContext(false,loaderInfo.applicationDomain));
         this.fontloader.contentLoaderInfo.addEventListener("complete",this.__fontLoadComplete);
         HackChecker.enabledCheckSpeedUp(1000,50);
      }
      
      public static function getInstance() : GMain
      {
         return _this;
      }
      
      private function doLoadDragonBonesAssets() : void
      {
      }
      
      protected function __fontLoadComplete(param1:Event) : void
      {
         this.fontloader.contentLoaderInfo.removeEventListener("complete",this.__fontLoadComplete);
         this.fontloader.unload();
         this.fontloader = null;
         this.mainFont = getDefinitionByName("fonts.FZCY") as Class;
         Font.registerFont(this.mainFont);
         this.doLoadDragonBonesAssets();
      }
      
      public function showProgress(param1:int) : void
      {
         var _loc2_:* = null;
         if(!this.getChildByName("showProgress"))
         {
            _loc2_ = new LoadingBar();
            _loc2_.name = "showProgress";
            _loc2_.setProcess(param1);
            _loc2_.x = 470;
            _loc2_.y = 295;
            this.addChild(_loc2_);
         }
         else
         {
            LoadingBar(this.getChildByName("showProgress")).setProcess(param1);
         }
      }
      
      public function showLoadByStageAndLevelProgress(param1:int, param2:uint, param3:uint) : void
      {
         var _loc4_:* = null;
         if(!this.getChildByName("showLoadByStageAndLevelProgress"))
         {
            _loc4_ = new LoadingBar2();
            _loc4_.name = "showLoadByStageAndLevelProgress";
            _loc4_.setProcess(param1,param2,param3);
            _loc4_.x = 470;
            _loc4_.y = 295;
            this.addChild(_loc4_);
         }
         else
         {
            LoadingBar2(this.getChildByName("showLoadByStageAndLevelProgress")).setProcess(param1,param2,param3);
         }
      }
      
      public function processComplete() : void
      {
         var _loc1_:* = this.getChildByName("showProgress") as MovieClip;
         if(_loc1_)
         {
            this.removeChild(_loc1_);
            _loc1_ = null;
         }
         _loc1_ = this.getChildByName("showLoadByStageAndLevelProgress") as MovieClip;
         if(_loc1_)
         {
            this.removeChild(_loc1_);
            _loc1_ = null;
         }
      }
      
      public function switchSence(param1:String) : void
      {
         this.curState = param1;
         switch(param1)
         {
            case "startFighting":
               this.clearStageMap();
               this.startGame(this.gc.curStage,this.gc.curLevel);
               this.gc.isLWYP = false;
               break;
            case "GameMenu":
               this.showGameMenu();
               break;
            case "SelectRole":
               this.showSelectRolw();
               break;
            case "showStageMap":
               this.showStageMap();
               break;
            case "showNewStageMap":
               this.showNewStageMap();
               break;
            case "showThirdStageMap":
               this.showThirdStageMap();
               break;
            case "gameOver":
               this.showGameOver();
               break;
            case "OpenAnimation":
               this.showOpenAnimation(null);
               break;
            case "ChineseValentinesDay":
               this.chineseValentinesDay(null);
               break;
            case "AllHuoDongInterface":
               this.allHuoDongInterface();
         }
      }
      
      private function showMemory() : void
      {
         var _loc1_:Sprite = new Sprite();
         _loc1_.graphics.beginFill(0);
         _loc1_.graphics.drawRect(0,0,112,32);
         _loc1_.graphics.endFill();
         _loc1_.alpha = 0;
         _loc1_.addEventListener(MouseEvent.ROLL_OUT,function(param1:MouseEvent):void
         {
            param1.target.alpha = 0;
         });
         _loc1_.addEventListener(MouseEvent.ROLL_OVER,function(param1:MouseEvent):void
         {
            param1.target.alpha = 0.7;
         });
         stage.addChild(_loc1_);
         this._memory = new TextField();
         this._memory.autoSize = "left";
         this._memory.y = 15;
         this._memory.textColor = 16777215;
         this._memory.mouseEnabled = false;
         this._memory.text = "MEMORY : 0 mb";
         stage.addChild(this._memory);
         this._memoryTimer.addEventListener("timer",this.updateMemory);
         this._memoryTimer.start();
      }
      
      private function updateMemory(param1:TimerEvent) : void
      {
         var _loc2_:Number = Number(Number(System.privateMemory / 1048576).toFixed(2));
         this._memory.text = "内存 : " + _loc2_ + " mb";
      }
      
      private function showFPS(param1:DisplayObject) : void
      {
         this.FPStxt = new TextField();
         this.FPStxt.textColor = 16750848;
         this.FPStxt.y = 0;
         this.FPStxt.autoSize = "left";
         this.FPStxt.text = "FPS";
         this.FPStxt.mouseEnabled = false;
         stage.addChild(this.FPStxt);
         this.FPS = new FPScounter(param1,this.FPStxt);
      }
      
      private function added(param1:*) : void
      {
         this.tabChildren = false;
         this.gc.eventManger.addEventListener("LoadOver",this.loaderOver);
         this.gc.eventManger.addEventListener("StartSelectRole",this.selectRole);
         this.gc.eventManger.addEventListener("ShowTaskInterface",this.showTaskInterface);
         this.gc.eventManger.addEventListener("SelectOver",this.SelectRoleOver);
         this.gc.eventManger.addEventListener("selectStageOver",this.selectStageOver);
         this.gc.eventManger.addEventListener("showBuySkill",this.showBuySkill);
         this.gc.eventManger.addEventListener("showStrengthEquip",this.showStrengthEquip);
         this.gc.eventManger.addEventListener("heroDead",this.heroDead);
         this.gc.eventManger.addEventListener("GameOver",this.gameOver);
         this.gc.eventManger.addEventListener("ReStart",this.reStart);
         this.gc.eventManger.addEventListener("LevelVictor",this.levelVictor);
         this.gc.eventManger.addEventListener("ShowOpenAnimation",this.showOpenAnimation);
         this.gc.eventManger.addEventListener("ShowOpenAnimationOver",this.showOpenAnimationOver);
         this.gc.eventManger.addEventListener("showAboutUs",this.showAboutUs);
         this.gc.eventManger.addEventListener("Approveme",this.Approveme);
         this.gc.eventManger.addEventListener("GameHelp",this.gameHelp);
         this.gc.eventManger.addEventListener("showShoping",this.showShoping);
         this.gc.eventManger.addEventListener("showImmortality",this.showImmortality);
         this.gc.stage = this.stage;
         this.showFPS(this);
         this.showMemory();
      }
      
      private function removed(param1:*) : void
      {
         this.gc.eventManger.removeEventListener("LoadOver",this.loaderOver);
         this.gc.eventManger.removeEventListener("StartSelectRole",this.selectRole);
         this.gc.eventManger.removeEventListener("SelectOver",this.SelectRoleOver);
         this.gc.eventManger.removeEventListener("ShowTaskInterface",this.showTaskInterface);
         this.gc.eventManger.removeEventListener("selectStageOver",this.selectStageOver);
         this.gc.eventManger.removeEventListener("showBuySkill",this.showBuySkill);
         this.gc.eventManger.removeEventListener("showStrengthEquip",this.showStrengthEquip);
         this.gc.eventManger.removeEventListener("heroDead",this.heroDead);
         this.gc.eventManger.removeEventListener("GameOver",this.gameOver);
         this.gc.eventManger.removeEventListener("ReStart",this.reStart);
         this.gc.eventManger.removeEventListener("LevelVictor",this.levelVictor);
         this.gc.eventManger.removeEventListener("ShowOpenAnimation",this.showOpenAnimation);
         this.gc.eventManger.removeEventListener("ShowOpenAnimationOver",this.showOpenAnimationOver);
         this.gc.eventManger.removeEventListener("showAboutUs",this.showAboutUs);
         this.gc.eventManger.removeEventListener("Approveme",this.Approveme);
         this.gc.eventManger.removeEventListener("GameHelp",this.gameHelp);
         this.gc.eventManger.removeEventListener("showShoping",this.showShoping);
         this.gc.eventManger.removeEventListener("showImmortality",this.showImmortality);
      }
      
      private function clickBack(param1:Event) : void
      {
         this.hideOutAndStopGame();
      }
      
      private function clickOut(param1:Event) : void
      {
         this.gc.eventManger.dispatchEvent(new Event("DEACTIVATE"));
         if(this.gc.isinthegame)
         {
            this.showOutAndStopGame();
         }
      }
      
      private function showOutAndStopGame() : void
      {
         var _loc1_:* = null;
         if(this.getChildByName("OutAndStopGame") == null)
         {
            _loc1_ = new OutAndStopGame();
            _loc1_.name = "OutAndStopGame";
            this.addChild(_loc1_);
         }
      }
      
      private function hideOutAndStopGame() : void
      {
         var _loc1_:OutAndStopGame = this.getChildByName("OutAndStopGame") as OutAndStopGame;
         if(_loc1_ != null)
         {
            _loc1_.hide();
         }
      }
      
      private function showAboutUs(param1:CommonEvent) : void
      {
         var _loc2_:AboutUs = AUtils.getNewObj("export.AboutUs") as AboutUs;
         this.mainSence.addChild(_loc2_);
      }
      
      private function Approveme(param1:CommonEvent) : void
      {
         var _loc2_:Class = AUtils.getNewObj("export.Approveme");
         this.mainSence.addChild(_loc2_);
      }
      
      private function gameHelp(param1:CommonEvent) : void
      {
         var _loc2_:Help = AUtils.getNewObj("export.Help") as Help;
         this.mainSence.addChild(_loc2_);
      }
      
      private function showOpenAnimation(param1:*) : void
      {
         var _loc2_:GameCartoon = AUtils.getNewObj("export.cartoon.GameCartoon") as GameCartoon;
         _loc2_.mygotoandStop(this.gc.gameinwhere);
         this.mainSence.addChild(_loc2_);
      }
      
      private function chineseValentinesDay(param1:*) : void
      {
         var _loc2_:ChineseValentinesDay = AUtils.getNewObj("export.huodong.ChineseValentinesDay") as ChineseValentinesDay;
         this.mainSence.addChild(_loc2_);
      }
      
      private function allHuoDongInterface() : void
      {
         var _loc1_:AllHuoDongInterface = AUtils.getNewObj("export.huodong.AllHuoDongInterface") as AllHuoDongInterface;
         this.mainSence.addChild(_loc1_);
      }
      
      private function showLineChoose(param1:*) : void
      {
         var _loc2_:LineChoose = AUtils.getNewObj("export.huodong.ChineseValentinesDay") as LineChoose;
         this.mainSence.addChild(_loc2_);
      }
      
      private function showOpenAnimationOver(param1:*) : void
      {
         this.switchSence("showStageMap");
      }
      
      private function showBuySkill(param1:CommonEvent) : void
      {
         var _loc2_:BuySkill = AUtils.getNewObj("export.shop.BuySkill") as BuySkill;
         _loc2_.setCurrentState(param1.data.state);
         this.mainSence.addChild(_loc2_);
      }
      
      private function showStrengthEquip(param1:CommonEvent) : void
      {
         var _loc2_:StrengthEquipment = AUtils.getNewObj("export.strength.StrengthEquipment") as StrengthEquipment;
         _loc2_.setCurrentState(param1.data.state);
         this.mainSence.addChild(_loc2_);
      }
      
      private function showShoping(param1:CommonEvent) : void
      {
         var _loc2_:Micropayment = AUtils.getNewObj("export.microshop.Micropayment") as Micropayment;
         this.mainSence.addChild(_loc2_);
      }
      
      private function showImmortality(param1:CommonEvent) : void
      {
         var _loc2_:ImmortalityInterface = AUtils.getNewObj("export.immortality.ImmortalityInterface") as ImmortalityInterface;
         _loc2_.setCurrentState(param1.data.state);
         this.mainSence.addChild(_loc2_);
      }
      
      public function getTopSence() : Sprite
      {
         return this.topSence;
      }
      
      private function SelectRoleOver(param1:*) : void
      {
         Debug.trace("---SelectRoleOver---");
         if(this.gc.opening)
         {
            if(this.gc.Objectdata.whichlastworld == 1)
            {
               this.switchSence("showNewStageMap");
            }
            else if(this.gc.Objectdata.whichlastworld == 2)
            {
               this.switchSence("showThirdStageMap");
            }
            else
            {
               this.switchSence("showStageMap");
            }
         }
         else
         {
            this.gc.gameinwhere = "开场";
            this.switchSence("OpenAnimation");
         }
      }
      
      private function showStageMap() : void
      {
         var _loc1_:* = null;
         SoundManager.play("begin");
         if(this.mainSence.getChildByName("NewWorldSelectPlaceHasShow") != null)
         {
            this.mainSence.removeChild(this.mainSence.getChildByName("NewWorldSelectPlaceHasShow"));
         }
         if(this.mainSence.getChildByName("SelectPlaceHasShow") == null)
         {
            _loc1_ = AUtils.getNewObj("export.SelectPLace") as SelectPLace;
            _loc1_.name = "SelectPlaceHasShow";
            this.mainSence.addChild(_loc1_);
            _loc1_.alpha = 0;
            TweenMax.to(_loc1_,0.4,{"alpha":1});
            this.gc.Objectdata.whichlastworld = 0;
            this.gotoTellPlayer();
         }
      }
      
      private function showNewStageMap() : void
      {
         var _loc1_:* = null;
         SoundManager.play("begin");
         if(this.mainSence.getChildByName("SelectPlaceHasShow") != null)
         {
            this.mainSence.removeChild(this.mainSence.getChildByName("SelectPlaceHasShow"));
         }
         if(this.mainSence.getChildByName("NewWorldSelectPlaceHasShow") == null)
         {
            _loc1_ = AUtils.getNewObj("export.NewWorldSelectPlace") as NewWorldSelectPlace;
            _loc1_.name = "NewWorldSelectPlaceHasShow";
            this.mainSence.addChild(_loc1_);
            _loc1_.alpha = 0;
            TweenMax.to(_loc1_,0.4,{"alpha":1});
            this.gc.Objectdata.whichlastworld = 1;
            this.gotoTellPlayer();
         }
      }
      
      private function showThirdStageMap() : void
      {
         var spViewer:ThirdWorldSelectPlace = null;
         trace("---showThirdStageMap---");
         SoundManager.play("begin");
         this.clearStageMap();
         if(this.mainSence.getChildByName("ThirdSelectPlaceHasShow") == null)
         {
            spViewer = AUtils.getNewObj("export.ThirdWorldSelectPlace") as ThirdWorldSelectPlace;
            spViewer.name = "ThirdSelectPlaceHasShow";
            this.mainSence.addChild(spViewer);
            spViewer.alpha = 0;
            TweenMax.to(spViewer,0.4,{"alpha":1});
            this.gc.Objectdata.whichlastworld = 2;
            this.gotoTellPlayer();
         }
      }
      
      private function clearStageMap() : void
      {
         if(this.mainSence.getChildByName("ThirdSelectPlaceHasShow") != null)
         {
            this.mainSence.removeChild(this.mainSence.getChildByName("ThirdSelectPlaceHasShow"));
         }
         if(this.mainSence.getChildByName("NewWorldSelectPlaceHasShow") != null)
         {
            this.mainSence.removeChild(this.mainSence.getChildByName("NewWorldSelectPlaceHasShow"));
         }
         if(this.mainSence.getChildByName("SelectPlaceHasShow") != null)
         {
            this.mainSence.removeChild(this.mainSence.getChildByName("SelectPlaceHasShow"));
         }
      }
      
      private function gotoTellPlayer() : void
      {
      }
      
      private function selectStageOver(param1:*) : void
      {
         this.switchSence("startFighting");
      }
      
      private function showGameMenu() : void
      {
         if(this.mainSence.getChildByName("SelectPlaceHasShow"))
         {
            this.mainSence.removeChild(this.mainSence.getChildByName("SelectPlaceHasShow"));
         }
         if(this._GM == null)
         {
            this._GM = AUtils.getNewObj("export.GameMenu") as GameMenu;
            this._GM.name = "GameMenuHasShow";
         }
         if(!this.mainSence.getChildByName("GameMenuHasShow"))
         {
            this.mainSence.addChild(this._GM);
         }
      }
      
      private function showTaskInterface(param1:*) : void
      {
         var _loc2_:TaskInterface = AUtils.getNewObj("export.taskInterface.TaskInterface") as TaskInterface;
         this.mainSence.addChild(_loc2_);
      }
      
      private function selectRole(param1:*) : *
      {
         this.switchSence("SelectRole");
      }
      
      private function showSelectRolw() : void
      {
         var _loc1_:SelectRole = AUtils.getNewObj("export.SelectRole") as SelectRole;
         this.mainSence.addChild(_loc1_);
      }
      
      private function gameOver(param1:*) : void
      {
         this.switchSence("gameOver");
      }
      
      private function showGameOver() : void
      {
         SoundManager.play("over");
         var _loc1_:GameFail = AUtils.getNewObj("export.lose.GameFail") as GameFail;
         this.mainSence.addChild(_loc1_);
      }
      
      private function reStart(param1:*) : void
      {
         this.switchSence("startFighting");
      }
      
      private function levelVictor(param1:*) : void
      {
         var _loc2_:* = null;
         if(this.mainSence.getChildByName("GameWinHasShow") == null)
         {
            _loc2_ = AUtils.getNewObj("export.win.GameWin") as GameWin;
            _loc2_.name = "GameWinHasShow";
            this.mainSence.addChild(_loc2_);
         }
      }
      
      private function heroDead(param1:CommonEvent) : void
      {
         var e:CommonEvent = param1;
         var afterdead:* = AUtils.getNewObj("PlayerDeadMc");
         afterdead.x = e.data.x;
         afterdead.y = e.data.y;
         this.gc.gameSence.addChild(afterdead);
         if(this.gc.isSingleGame())
         {
            TweenMax.delayedCall(2.5,function():*
            {
               MainGame.getInstance().checkGameOver();
            });
         }
      }
      
      public function startGame(param1:uint, param2:uint) : void
      {
         new MainGame(this.mainSence).GameStart();
      }
      
      private function doLoadOK() : void
      {
         var _loc1_:* = undefined;
         this.gc.pWorld.destroy();
         var _loc2_:int = 0;
         while(_loc2_ < this.numChildren)
         {
            _loc1_ = this.getChildAt(_loc2_);
            this.gc.pWorld.addSubObj(_loc1_);
            _loc2_++;
         }
         this.switchSence("GameMenu");
      }
      
      private function loaderOver(param1:*) : *
      {
         this.gc.eventManger.removeEventListener("loaderOver",this.loaderOver);
         AUtils.checkLoadOK(this,this.doLoadOK);
      }
      
      public function getMainSence() : Sprite
      {
         return this.mainSence;
      }
      
      public function get loader() : Aloader
      {
         return this._loader;
      }
      
      public function get Assetsloader() : AssetsLoader
      {
         return this._AssetsLoader;
      }
   }
}

