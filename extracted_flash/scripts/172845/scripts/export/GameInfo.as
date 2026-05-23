package export
{
   import com.greensock.*;
   import com.greensock.easing.*;
   import com.multi4399.ResponseEvent;
   import config.*;
   import event.CommonEvent;
   import export.muti.*;
   import fl.controls.*;
   import flash.display.*;
   import flash.events.*;
   import flash.text.*;
   import my.*;
   import user.*;
   
   [Embed(source="/_assets/assets.swf", symbol="symbol142")]
   public class GameInfo extends MovieClip
   {
      
      private var gc:Config;
      
      private var preBatterNum:int = 0;
      
      private var batterSi:int;
      
      private var rilist:Array;
      
      public var pointmc:Sprite;
      
      public var fpsShow:TextField;
      
      public var buffSprite:HeroBuff;
      
      public var hideOtherPlayerBtn:SimpleButton;
      
      public var showOtherPlayerBtn:SimpleButton;
      
      public var backToHostBtn:SimpleButton;
      
      private var infoSprite:Sprite;
      
      public var bossBloodArray:Array;
      
      public var beattArray:Array;
      
      private var chatSprite:ChatInHostSprite;
      
      private var arenaSprite:ArenaSprite;
      
      private var totalOtherUserInfoSprite:TotalOtherUserInfo;
      
      private var isHideOther:Boolean = false;
      
      private var fps:FPS;
      
      internal var bpanel:Batter;
      
      public function GameInfo()
      {
         this.rilist = new Array();
         this.bossBloodArray = [];
         this.beattArray = [];
         this.fps = new FPS();
         super();
         this.gc = Config.getInstance();
         this.addEventListener(Event.ADDED_TO_STAGE,this.added,false,0,true);
         this.addEventListener(Event.REMOVED_FROM_STAGE,this.removed,false,0,true);
         this.addEventListener(MouseEvent.CLICK,this.__clickHandler);
         this.init();
      }
      
      private function init() : void
      {
         this.refreshRoleInfo();
         this.fps.display = this.fpsShow;
         this.fps.startCalc();
         var _loc1_:TextField = null;
         var _loc2_:TextFormat = null;
         if(this.gc.isFirstPlayGame)
         {
            this.infoSprite = new Sprite();
            _loc1_ = new TextField();
            _loc2_ = new TextFormat();
            _loc2_.align = TextFormatAlign.CENTER;
            _loc2_.font = AllConsts.GAME_CONFIG_FONT;
            _loc2_.size = 20;
            _loc2_.bold = true;
            _loc2_.color = 16711680;
            _loc1_.text = "欢迎来到造梦西游之再续天庭，此版本为造梦西游同人作品，请支持正版造梦西游！请勿用于任何商业用途！";
            _loc1_.embedFonts = true;
            _loc1_.setTextFormat(_loc2_);
            _loc1_.width = _loc1_.textWidth;
            this.infoSprite.addChild(_loc1_);
            _loc1_.selectable = false;
            this.infoSprite.x = 900;
            this.infoSprite.y = 20;
            this.addChild(this.infoSprite);
            this.gc.isFirstPlayGame = false;
         }
         this.showBuff();
      }
      
      private function __clickHandler(param1:MouseEvent) : void
      {
         var _loc2_:* = null;
         var _loc3_:* = null;
         if(param1.target.name == "hideOtherPlayerBtn")
         {
            for each(_loc2_ in this.gc.pWorld.getOtherHeroArray())
            {
               _loc2_.getBBDC().hide();
               if(_loc2_.getPet())
               {
                  _loc2_.getPet().getBBDC().hide();
               }
               if(_loc2_.getCurMagicWeapon())
               {
                  _loc2_.getCurMagicWeapon().getBBDC().hide();
               }
            }
            this.isHideOther = true;
         }
         else if(param1.target.name == "showOtherPlayerBtn")
         {
            for each(_loc2_ in this.gc.pWorld.getOtherHeroArray())
            {
               _loc2_.getBBDC().show();
               if(_loc2_.getPet())
               {
                  _loc2_.getPet().getBBDC().show();
               }
               if(_loc2_.getCurMagicWeapon())
               {
                  _loc2_.getCurMagicWeapon().getBBDC().show();
               }
            }
            this.isHideOther = false;
         }
         else if(param1.target.name == "backToHostBtn")
         {
            this.gc.quitRoom();
            _loc3_ = new Sprite();
            _loc3_.name = "mask";
            _loc3_.graphics.beginFill(16777215,0.5);
            _loc3_.graphics.drawRect(0,0,940,590);
            _loc3_.graphics.endFill();
            this.addChild(_loc3_);
         }
         else if(!(param1.target is TextField) && !(param1.target is TextArea))
         {
            this.gc.stage.focus = null;
         }
      }
      
      public function pkStart() : void
      {
         this.backToHostBtn.visible = false;
      }
      
      public function showArenaSprite() : void
      {
         this.arenaSprite = new ArenaSprite();
         GMain.getInstance().getTopSence().addChild(this.arenaSprite);
      }
      
      private function refreshRoleInfo() : void
      {
         var _loc1_:* = null;
         var _loc2_:int = 0;
         var _loc3_:* = null;
         for each(_loc1_ in this.rilist)
         {
            if(this.contains(_loc1_))
            {
               this.removeChild(_loc1_);
            }
         }
         this.rilist = [];
         _loc2_ = 0;
         while(_loc2_ < this.gc.playNum)
         {
            _loc3_ = new RoleInfo(_loc2_ + 1);
            _loc3_.x = _loc2_ * 920;
            this.addChild(_loc3_);
            if(_loc2_ == 1)
            {
               AUtils.flipHorizontal(_loc3_,-1);
            }
            this.rilist.push(_loc3_);
            _loc2_++;
         }
      }
      
      public function joinRoomReturn(param1:uint) : void
      {
         if(param1 == 1)
         {
            if(this.arenaSprite)
            {
               this.arenaSprite.destroy();
               this.arenaSprite = null;
            }
            this.totalOtherUserInfoSprite = new TotalOtherUserInfo();
            this.totalOtherUserInfoSprite.x = 4 * 60;
            this.totalOtherUserInfoSprite.y = 30;
            this.addChild(this.totalOtherUserInfoSprite);
            this.doWhenIntoRoom();
         }
         else if(this.arenaSprite)
         {
            this.arenaSprite.joinOrCreateFail();
         }
      }
      
      public function createReturn(param1:uint) : void
      {
         if(param1 == 1)
         {
            if(this.arenaSprite)
            {
               this.arenaSprite.destroy();
               this.arenaSprite = null;
            }
            this.totalOtherUserInfoSprite = new TotalOtherUserInfo();
            this.totalOtherUserInfoSprite.x = 4 * 60;
            this.totalOtherUserInfoSprite.y = 30;
            this.addChild(this.totalOtherUserInfoSprite);
            this.doWhenIntoRoom();
         }
         else if(this.arenaSprite)
         {
            this.arenaSprite.joinOrCreateFail();
         }
      }
      
      public function clearOtherUserInfoSprite() : void
      {
         if(this.totalOtherUserInfoSprite)
         {
            this.totalOtherUserInfoSprite.clear();
         }
      }
      
      public function quitRoom() : void
      {
         this.hideOtherPlayerBtn.visible = true;
         this.showOtherPlayerBtn.visible = true;
         this.backToHostBtn.visible = false;
         var _loc1_:Sprite = this.getChildByName("mask") as Sprite;
         if(_loc1_)
         {
            this.removeChild(_loc1_);
         }
         this.gc.createHeroWhenQuitRoom();
         if(Boolean(this.totalOtherUserInfoSprite) && this.contains(this.totalOtherUserInfoSprite))
         {
            this.removeChild(this.totalOtherUserInfoSprite);
            this.totalOtherUserInfoSprite = null;
         }
         this.refreshRoleInfo();
         this.showArenaSprite();
      }
      
      public function addOtherUserInfoOne(param1:MutiUser) : void
      {
         if(this.totalOtherUserInfoSprite)
         {
            this.totalOtherUserInfoSprite.addOne(param1);
         }
      }
      
      public function removeOtherUserInfoOne(param1:*) : void
      {
         if(this.totalOtherUserInfoSprite)
         {
            this.totalOtherUserInfoSprite.removeOne(param1);
         }
      }
      
      public function updateInfo(param1:*, param2:*, param3:*, param4:*, param5:*) : void
      {
         if(this.arenaSprite)
         {
            this.arenaSprite.updateAllInfo(param1,param2,param3,param4,param5);
         }
      }
      
      public function addChatSprite() : void
      {
         if(Boolean(this.gc.isInHost()) || Boolean(this.gc.isInRoom()))
         {
            this.chatSprite = new ChatInHostSprite();
            this.chatSprite.addEventListener("sendChat",this.__sendChat);
            this.chatSprite.x = -293;
            this.chatSprite.y = 150;
            this.addChild(this.chatSprite);
         }
      }
      
      private function __sendChat(param1:CommonEvent) : void
      {
         var _loc2_:String = param1.data[0];
         this.gc.sendChat(_loc2_);
      }
      
      public function singleGame() : void
      {
         this.hideOtherPlayerBtn.visible = false;
         this.showOtherPlayerBtn.visible = false;
         this.backToHostBtn.visible = false;
      }
      
      public function mutiGame() : void
      {
         this.addChatSprite();
         this.hideOtherPlayerBtn.visible = true;
         this.showOtherPlayerBtn.visible = true;
         this.backToHostBtn.visible = false;
      }
      
      private function doWhenIntoRoom() : void
      {
         this.hideOtherPlayerBtn.visible = false;
         this.showOtherPlayerBtn.visible = false;
         this.backToHostBtn.visible = true;
      }
      
      public function updateRoomList(param1:ResponseEvent) : void
      {
         if(this.arenaSprite)
         {
            this.arenaSprite.refreshData(param1);
         }
      }
      
      public function updataChatData(param1:String, param2:String) : void
      {
         if(Boolean(this.chatSprite) && this.contains(this.chatSprite))
         {
            this.chatSprite.updateData(param1,param2);
         }
      }
      
      public function showBuff() : void
      {
         if(!this.buffSprite)
         {
            this.buffSprite = new HeroBuff();
            this.buffSprite.x = 0;
            this.buffSprite.y = 80;
            this.addChild(this.buffSprite);
         }
      }
      
      public function getRoleInfoByPlayer(param1:User) : RoleInfo
      {
         return this.rilist[param1.getControlPlayer()];
      }
      
      private function added(param1:Event) : *
      {
         this.gc.eventManger.addEventListener("MonsterIsBeat",this.batterPanel);
         this.gc.eventManger.addEventListener("MonsterIsBeat",this.addWs);
         this.gc.eventManger.addEventListener("HeroIsBeat",this.addWs);
         this.gc.eventManger.addEventListener("AuraEvent",this.addWarriors);
         this.hideOtherPlayerBtn.visible = false;
         this.showOtherPlayerBtn.visible = false;
         this.backToHostBtn.visible = false;
      }
      
      private function removed(param1:Event) : *
      {
         this.gc.eventManger.removeEventListener("MonsterIsBeat",this.batterPanel);
         this.gc.eventManger.removeEventListener("MonsterIsBeat",this.addWs);
         this.gc.eventManger.removeEventListener("HeroIsBeat",this.addWs);
         this.gc.eventManger.removeEventListener("AuraEvent",this.addWarriors);
      }
      
      private function addWs(param1:*) : void
      {
         var _loc2_:uint = uint(this.rilist.length);
         while(_loc2_-- > 0)
         {
            this.rilist[_loc2_].addWs(param1.data);
         }
      }
      
      private function addWarriors(param1:*) : void
      {
         var _loc2_:uint = uint(this.rilist.length);
         while(_loc2_-- > 0)
         {
            this.rilist[_loc2_].addWarriors(param1.data);
         }
      }
      
      public function destroy() : void
      {
         if(Boolean(this.arenaSprite) && GMain.getInstance().getTopSence().contains(this.arenaSprite))
         {
            GMain.getInstance().getTopSence().removeChild(this.arenaSprite);
            this.arenaSprite = null;
         }
         if(this.totalOtherUserInfoSprite)
         {
            this.removeChild(this.totalOtherUserInfoSprite);
            this.totalOtherUserInfoSprite = null;
         }
         if(Boolean(this.gc.ts) && this.contains(this.gc.ts))
         {
            this.removeChild(this.gc.ts);
         }
         if(this.infoSprite)
         {
            if(this.contains(this.infoSprite))
            {
               this.removeChild(this.infoSprite);
            }
            this.infoSprite = null;
         }
         if(this.buffSprite)
         {
            if(this.contains(this.buffSprite))
            {
               this.removeChild(this.buffSprite);
            }
            this.buffSprite = null;
         }
         this.bossBloodArray.length = 0;
         this.beattArray.length = 0;
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
         if(this.chatSprite)
         {
            this.chatSprite.removeEventListener("sendChat",this.__sendChat);
            this.chatSprite.destroy();
         }
         this.removeEventListener(MouseEvent.CLICK,this.__clickHandler);
      }
      
      public function step() : *
      {
         ++this.batterSi;
         if(Number(this.batterSi) % 40 == 0)
         {
            this.batter();
         }
         var _loc1_:uint = uint(this.rilist.length);
         while(_loc1_-- > 0)
         {
            this.rilist[_loc1_].step();
         }
         if(this.buffSprite)
         {
            this.buffSprite.step();
         }
         this.fps.update();
         if(this.totalOtherUserInfoSprite)
         {
            this.totalOtherUserInfoSprite.step();
         }
         if(this.infoSprite)
         {
            this.infoSprite.x -= 2;
            if(this.infoSprite.x <= -Number(this.infoSprite.width))
            {
               this.removeChild(this.infoSprite);
               this.infoSprite = null;
            }
         }
      }
      
      private function batterPanel(param1:CommonEvent) : *
      {
         if(User.batterNum >= 2)
         {
            if(this.bpanel == null)
            {
               this.bpanel = new Batter();
               addChild(this.bpanel);
               this.bpanel.x = 694.95;
               this.bpanel.y = 234.95;
            }
            this.bpanel.alpha = 1;
            TweenMax.to(this.bpanel,2,{
               "alpha":0,
               "onComplete":this.removeBPanel
            });
            this.bpanel.addBatterNum(User.batterNum);
         }
      }
      
      private function removeBPanel() : *
      {
         if(Boolean(this.bpanel) && contains(this.bpanel))
         {
            removeChild(this.bpanel);
            this.bpanel = null;
         }
      }
      
      private function batter() : *
      {
         User.biggestbatterNum = User.biggestbatterNum > User.batterNum ? int(User.biggestbatterNum) : int(User.batterNum);
         if(this.preBatterNum == User.batterNum)
         {
            User.batterNum = 0;
            this.preBatterNum = 0;
         }
         else
         {
            this.preBatterNum = User.batterNum;
         }
      }
      
      public function clearBossBlood() : void
      {
         var _loc1_:* = undefined;
         var _loc2_:* = undefined;
         var _loc3_:* = undefined;
         var _loc4_:* = this.bossBloodArray;
         for each(_loc3_ in _loc4_)
         {
            if(this.contains(_loc3_))
            {
               this.removeChild(_loc3_);
            }
         }
         this.bossBloodArray.length = 0;
         _loc1_ = undefined;
         _loc2_ = this.beattArray;
         for each(_loc1_ in _loc2_)
         {
            if(this.contains(_loc1_))
            {
               this.removeChild(_loc1_);
            }
         }
         this.beattArray.length = 0;
      }
      
      public function addBossBlood(param1:String, param2:int, param3:Boolean = false, param4:Number = 1) : void
      {
         var _loc5_:* = undefined;
         if(!getChildByName(param1))
         {
            if(!param3)
            {
               _loc5_ = AUtils.getNewObj("BossBlood");
               _loc5_.name = param1;
               _loc5_.namemc.gotoAndStop(param1);
               _loc5_.x = 465;
               _loc5_.y = 50 + this.bossBloodArray.length * 50;
               this.addChild(_loc5_);
               this.bossBloodArray.push(_loc5_);
            }
         }
         else
         {
            MovieClip(getChildByName(param1)).hpMask.scaleX = Math.max(param4,0);
            TweenMax.to(MovieClip(getChildByName(param1)).effectMask,0.8,{
               "scaleX":Math.max(param4,0),
               "ease":Linear.easeNone
            });
         }
      }
      
      private function updateDamageBarFrame(frame:Number, bar:MovieClip) : void
      {
         var validFrame:Number = NaN;
         validFrame = Math.max(1,Math.min(bar.totalFrames,Math.round(frame)));
         try
         {
            bar.gotoAndStop(validFrame);
            trace("帧:" + frame);
         }
         catch(e:Error)
         {
            trace("无效帧号: " + validFrame + "，总帧数: " + bar.totalFrames);
            bar.gotoAndStop(1);
         }
      }
      
      public function addbeatt(param1:String, param2:Number) : void
      {
         var _loc3_:MovieClip = null;
         if(!getChildByName(param1))
         {
            _loc3_ = AUtils.getNewObj("beattacktimes");
            _loc3_.name = param1;
            _loc3_.x = 465;
            _loc3_.y = 50 + this.beattArray.length * 50;
            this.addChild(_loc3_);
            this.beattArray.push(_loc3_);
            MovieClip(getChildByName(param1)).ruler.scaleX = 0;
         }
         else if(param2 == 0)
         {
            TweenMax.to(MovieClip(getChildByName(param1)).ruler,0.8,{"scaleX":0});
         }
         else
         {
            TweenMax.to(MovieClip(getChildByName(param1)).ruler,0.2,{"scaleX":param2});
         }
      }
      
      public function getIsHideOther() : Boolean
      {
         return this.isHideOther;
      }
   }
}

