package export
{
   import config.*;
   import event.*;
   import export.Otherzm.*;
   import export.huodong.mysterious.*;
   import export.santaizi.*;
   import fl.controls.ComboBox;
   import flash.display.*;
   import flash.events.*;
   import flash.net.*;
   import my.*;
   
   public class SelectPLace extends Sprite
   {
      
      public var s1_1:MovieClip;
      
      public var s1_2:MovieClip;
      
      public var s1_3:MovieClip;
      
      public var s2_1:MovieClip;
      
      public var s2_2:MovieClip;
      
      public var s2_3:MovieClip;
      
      public var s3_1:MovieClip;
      
      public var s3_2:MovieClip;
      
      public var s3_3:MovieClip;
      
      public var sssl:MovieClip;
      
      public var moonmc:MovieClip;
      
      public var klsmode:ComboBox;
      
      public var btnnmg:MovieClip;
      
      public var dsgbtn:MovieClip;
      
      public var kls:SimpleButton;
      
      public var llbt:SimpleButton;
      
      public var s4_1:MovieClip;
      
      public var s4_2:MovieClip;
      
      public var s4_3:MovieClip;
      
      public var hdbtn:MovieClip;
      
      public var hyChallenge:MovieClip;
      
      public var stzmc:MovieClip;
      
      public var sssd:MovieClip;
      
      public var sgzz:SimpleButton;
      
      private var gc:Config;
      
      private var renewalse3:Sprite;
      
      private var renewalse4:Sprite;
      
      public function SelectPLace()
      {
         super();
         this.gc = Config.getInstance();
         this.renewalse3 = AUtils.getNewObj("renewalseThisSZ1") as Sprite;
         this.renewalse3.name = "renewalseThisSZ";
         this.renewalse4 = AUtils.getNewObj("renewalseThisSZ1") as Sprite;
         this.renewalse4.name = "renewalseThisSZ1";
         this.addEventListener(Event.ADDED_TO_STAGE,this.added,false,0,true);
         this.addEventListener(Event.REMOVED_FROM_STAGE,this.removed,false,0,true);
         this.tabChildren = false;
         this.tabEnabled = false;
         this.init();
      }
      
      private function init() : void
      {
         var _loc1_:int = 0;
         if(!this.gc.isHideDebug)
         {
            this.gc.curBigStage = 4;
         }
         var _loc2_:int = 0;
         while(_loc2_ < 3)
         {
            _loc1_ = 0;
            while(_loc1_ < 3)
            {
               this["s" + (_loc2_ + 1) + "_" + (_loc1_ + 1)].buttonMode = true;
               _loc1_++;
            }
            _loc2_++;
         }
      }
      
      private function added(param1:Event) : void
      {
         var _loc2_:int = 0;
         var _loc3_:MapMenu = null;
         var _loc4_:* = 0;
         var _loc5_:int = 0;
         var _loc6_:int = 0;
         var _loc7_:DisplayObject = null;
         _loc2_ = int(this.gc.curBigStage);
         if(_loc2_ >= 20)
         {
            _loc2_ = 4;
         }
         while(_loc6_ < _loc2_)
         {
            _loc4_ = uint(_loc6_ + 1);
            if(_loc4_ < _loc2_)
            {
               _loc4_ = 3;
            }
            else
            {
               _loc4_ = uint(this.gc.curBigLevel);
            }
            _loc5_ = 0;
            while(_loc5_ < _loc4_)
            {
               this["s" + (_loc6_ + 1) + "_" + (_loc5_ + 1)].addEventListener(MouseEvent.CLICK,this.onSelected);
               this["s" + (_loc6_ + 1) + "_" + (_loc5_ + 1)].addEventListener(MouseEvent.ROLL_OVER,this.mOver);
               this["s" + (_loc6_ + 1) + "_" + (_loc5_ + 1)].addEventListener(MouseEvent.ROLL_OUT,this.mOut);
               _loc5_++;
            }
            _loc6_++;
         }
         this["s" + _loc2_ + "_" + this.gc.curBigLevel].gotoAndStop(2);
         this.moonmc.addEventListener(MouseEvent.CLICK,this.moonClick);
         this.moonmc.addEventListener(MouseEvent.ROLL_OVER,this.mOver);
         this.moonmc.addEventListener(MouseEvent.ROLL_OUT,this.mOut);
         this.btnnmg.buttonMode = true;
         this.btnnmg.addEventListener(MouseEvent.CLICK,this.nmgClick);
         this.btnnmg.addEventListener(MouseEvent.ROLL_OVER,this.mOver);
         this.sssl.buttonMode = true;
         this.sssl.addEventListener(MouseEvent.CLICK,this.ssslClick);
         this.sssl.addEventListener(MouseEvent.ROLL_OVER,this.mOver);
         this.sssl.addEventListener(MouseEvent.ROLL_OUT,this.mOut);
         this.sssd.buttonMode = true;
         this.sssd.addEventListener(MouseEvent.CLICK,this.shopClick);
         this.sssd.addEventListener(MouseEvent.ROLL_OVER,this.mOver);
         this.sssd.addEventListener(MouseEvent.ROLL_OUT,this.mOut);
         this.stzmc.buttonMode = true;
         this.stzmc.addEventListener(MouseEvent.CLICK,this.stzClick);
         this.stzmc.addEventListener(MouseEvent.ROLL_OVER,this.mOver);
         this.stzmc.addEventListener(MouseEvent.ROLL_OUT,this.mOut);
         this.hyChallenge.gotoAndStop(2);
         this.hyChallenge.buttonMode = true;
         this.hyChallenge.addEventListener(MouseEvent.CLICK,this.hyPlace);
         this.hyChallenge.addEventListener(MouseEvent.ROLL_OVER,this.mOver);
         this.hyChallenge.addEventListener(MouseEvent.ROLL_OUT,this.mOut);
         this.dsgbtn.buttonMode = true;
         this.dsgbtn.addEventListener(MouseEvent.CLICK,this.dsgClick);
         this.dsgbtn.addEventListener(MouseEvent.ROLL_OVER,this.mOver);
         this.dsgbtn.addEventListener(MouseEvent.ROLL_OUT,this.mOut);
         this.btnnmg.addEventListener(MouseEvent.ROLL_OUT,this.mOut);
         this.sgzz.addEventListener(MouseEvent.CLICK,this.tozm4level);
         this.kls.addEventListener(MouseEvent.CLICK,this.inToKunLunMountains);
         this.llbt.addEventListener(MouseEvent.CLICK,this.inToLingLongTower);
         this.hdbtn.buttonMode = true;
         this.hdbtn.addEventListener(MouseEvent.CLICK,this.newWorldClick);
         this.hdbtn.addEventListener(MouseEvent.ROLL_OVER,this.mOver);
         this.hdbtn.addEventListener(MouseEvent.ROLL_OUT,this.mOut);
         _loc6_ = 0;
         while(_loc6_ < this.numChildren)
         {
            _loc7_ = this.getChildAt(_loc4_);
            if(_loc7_ is MapMenu)
            {
               this.removeChild(_loc7_);
            }
            _loc6_++;
         }
         _loc3_ = new MapMenu();
         _loc3_.x = -1;
         _loc3_.y = 0;
         this.addChild(_loc3_);
         this.gc.eventManger.addEventListener("ShowOtherScene",this.showOtherScene);
         this.gc.eventManger.addEventListener("ChanllengeBossInster",this.chanllenge);
         this.gc.isintheselectmap = true;
      }
      
      private function removed(param1:Event) : void
      {
         var _loc2_:int = 0;
         var _loc3_:int = 0;
         while(_loc3_ < 3)
         {
            _loc2_ = 0;
            while(_loc2_ < 3)
            {
               this["s" + (_loc3_ + 1) + "_" + (_loc2_ + 1)].removeEventListener(MouseEvent.CLICK,this.onSelected);
               this["s" + (_loc3_ + 1) + "_" + (_loc2_ + 1)].removeEventListener(MouseEvent.ROLL_OVER,this.mOver);
               this["s" + (_loc3_ + 1) + "_" + (_loc2_ + 1)].removeEventListener(MouseEvent.ROLL_OUT,this.mOut);
               _loc2_++;
            }
            _loc3_++;
         }
         this.hyChallenge.removeEventListener(MouseEvent.CLICK,this.hyPlace);
         this.hyChallenge.removeEventListener(MouseEvent.ROLL_OVER,this.mOver);
         this.hyChallenge.removeEventListener(MouseEvent.ROLL_OUT,this.mOut);
         this.sssd.removeEventListener(MouseEvent.CLICK,this.shopClick);
         this.sssd.removeEventListener(MouseEvent.ROLL_OVER,this.mOver);
         this.sssd.removeEventListener(MouseEvent.ROLL_OUT,this.mOut);
         this.stzmc.removeEventListener(MouseEvent.CLICK,this.stzClick);
         this.stzmc.removeEventListener(MouseEvent.ROLL_OVER,this.mOver);
         this.stzmc.removeEventListener(MouseEvent.ROLL_OUT,this.mOut);
         this.moonmc.removeEventListener(MouseEvent.CLICK,this.moonClick);
         this.moonmc.removeEventListener(MouseEvent.ROLL_OVER,this.mOver);
         this.moonmc.removeEventListener(MouseEvent.ROLL_OUT,this.mOut);
         this.btnnmg.removeEventListener(MouseEvent.CLICK,this.nmgClick);
         this.moonmc.removeEventListener(MouseEvent.CLICK,this.moonClick);
         this.btnnmg.removeEventListener(MouseEvent.ROLL_OVER,this.mOver);
         this.btnnmg.removeEventListener(MouseEvent.ROLL_OUT,this.mOut);
         this.kls.removeEventListener(MouseEvent.CLICK,this.inToKunLunMountains);
         this.llbt.removeEventListener(MouseEvent.CLICK,this.inToLingLongTower);
         this.sssl.removeEventListener(MouseEvent.CLICK,this.ssslClick);
         this.sssl.removeEventListener(MouseEvent.ROLL_OVER,this.mOver);
         this.sssl.removeEventListener(MouseEvent.ROLL_OUT,this.mOut);
         this.hdbtn.buttonMode = true;
         this.hdbtn.removeEventListener(MouseEvent.CLICK,this.newWorldClick);
         this.hdbtn.removeEventListener(MouseEvent.ROLL_OVER,this.mOver);
         this.hdbtn.removeEventListener(MouseEvent.ROLL_OUT,this.mOut);
         this.gc.eventManger.removeEventListener("ShowOtherScene",this.showOtherScene);
         this.gc.eventManger.removeEventListener("ChanllengeBossInster",this.chanllenge);
         this.gc.isintheselectmap = false;
      }
      
      private function hyPlace(param1:MouseEvent) : void
      {
         this.gc.curStage = 53;
         this.gc.curLevel = 1;
         this.gc.eventManger.dispatchEvent(new CommonEvent("selectStageOver"));
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
      }
      
      private function shopClick(param1:MouseEvent) : void
      {
         var _loc2_:MysteriousShop = new MysteriousShop();
         this.addChild(_loc2_);
      }
      
      private function stzClick(param1:MouseEvent) : void
      {
         if(this.gc.getMinLevel() < 30)
         {
            this.gc.alert("玩家的等级必须都大于30级才可以进入");
            return;
         }
         var _loc2_:ChanllengThreePrince = new ChanllengThreePrince();
         this.addChild(_loc2_);
      }
      
      private function newWorldClick(param1:MouseEvent) : void
      {
         if(this.gc.player1.getSomeOneEquipNumberByName("ttlp") < 1)
         {
            this.gc.ts.setTxt("需要通天令牌!");
            this.gc.stage.addChild(this.gc.ts);
            return;
         }
         if(this.gc.playNum == 2)
         {
            if(this.gc.player1.getCurLevel() < 50 || this.gc.player2.getCurLevel() < 50)
            {
               this.gc.ts.setTxt("玩家的等级必须都大于50级才可以进入");
               this.gc.stage.addChild(this.gc.ts);
               return;
            }
         }
         else if(this.gc.player1.getCurLevel() < 50)
         {
            this.gc.ts.setTxt("玩家的等级必须大于50级才可以进入");
            this.gc.stage.addChild(this.gc.ts);
            return;
         }
         if(this.gc.Objectdata.whichlastworld == 0)
         {
            GMain.getInstance().switchSence("showNewStageMap");
         }
         else
         {
            GMain.getInstance().switchSence("showStageMap");
         }
      }
      
      private function chanllenge(param1:CommonEvent) : void
      {
         this.gc.eventManger.dispatchEvent(new CommonEvent("selectStageOver"));
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
      }
      
      private function showOtherScene(param1:CommonEvent) : void
      {
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
      }
      
      private function addCloseListener(param1:Event) : *
      {
         this.klsmode.removeEventListener(Event.ENTER_FRAME,this.addCloseListener);
      }
      
      private function hostClick() : void
      {
         this.gc.curStage = 1;
         this.gc.curLevel = 1;
         this.gc.eventManger.dispatchEvent(new CommonEvent("selectStageOver"));
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
      }
      
      private function mOver(param1:MouseEvent) : void
      {
         param1.currentTarget.gotoAndStop(3);
      }
      
      private function mOut(param1:MouseEvent) : void
      {
         var _loc2_:int = int(this.gc.curBigStage);
         if(_loc2_ >= 20)
         {
            _loc2_ = 4;
         }
         if(param1.currentTarget != this["s" + _loc2_ + "_" + this.gc.curBigLevel])
         {
            param1.currentTarget.gotoAndStop(1);
         }
         else
         {
            param1.currentTarget.gotoAndStop(2);
         }
      }
      
      private function onSelected(param1:MouseEvent) : void
      {
         this.gc.curStage = int(String(param1.currentTarget.name).substr(1,1));
         this.gc.curLevel = int(String(param1.currentTarget.name).substr(3,1));
         this.gc.eventManger.dispatchEvent(new CommonEvent("selectStageOver"));
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
      }
      
      public function doAfterChangeIn() : void
      {
         this.visible = true;
      }
      
      private function buySkill(param1:*) : void
      {
         this.gc.eventManger.dispatchEvent(new CommonEvent("showBuySkill",{"state":"maping"}));
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
      }
      
      private function inToKunLunMountains(param1:MouseEvent) : void
      {
         this.renewalse3["txt"].text = "你想要的模式为？(确定为天庭主线,取消为玲珑宝塔)";
         this.addChild(this.renewalse3);
         this.renewalse3["okbtn"].addEventListener(MouseEvent.CLICK,this.renewalseOk3);
         this.renewalse3["nobtn"].addEventListener(MouseEvent.CLICK,this.renewalseChange3);
         this.renewalse3["close_btn"].addEventListener(MouseEvent.CLICK,this.renewalseClose3);
      }
      
      private function renewalseOk3(param1:MouseEvent) : void
      {
         this.renewalse3["okbtn"].removeEventListener(MouseEvent.CLICK,this.renewalseOk3);
         this.renewalse3["nobtn"].removeEventListener(MouseEvent.CLICK,this.renewalseChange3);
         if(this.gc.player1.getLhValue() < 5000)
         {
            this.gc.ts.setTxt("灵魂不足！");
            this.gc.stage.addChild(this.gc.ts);
         }
         else
         {
            this.gc.player1.setLhValue(this.gc.player1.getLhValue() - 5000);
            this.gc.klsmode = 1;
            this.gc.curStage = 0;
            this.gc.curLevel = 1;
            this.gc.eventManger.dispatchEvent(new CommonEvent("selectStageOver"));
            if(this.parent)
            {
               this.parent.removeChild(this);
            }
         }
         if(Boolean(this.renewalse3) && this.contains(this.renewalse3))
         {
            this.removeChild(this.renewalse3);
         }
      }
      
      private function renewalseChange3(param1:MouseEvent) : void
      {
         this.renewalse3["okbtn"].removeEventListener(MouseEvent.CLICK,this.renewalseOk3);
         this.renewalse3["nobtn"].removeEventListener(MouseEvent.CLICK,this.renewalseChange3);
         if(this.gc.player1.getLhValue() < 20000)
         {
            this.gc.ts.setTxt("灵魂不足！");
            this.gc.stage.addChild(this.gc.ts);
         }
         else
         {
            this.gc.player1.setLhValue(this.gc.player1.getLhValue() - 20000);
            this.gc.klsmode = 2;
            this.gc.curStage = 0;
            this.gc.curLevel = 1;
            this.gc.eventManger.dispatchEvent(new CommonEvent("selectStageOver"));
            if(this.parent)
            {
               this.parent.removeChild(this);
            }
         }
         if(Boolean(this.renewalse3) && this.contains(this.renewalse3))
         {
            this.removeChild(this.renewalse3);
         }
      }
      
      private function renewalseClose3(param1:MouseEvent) : void
      {
         this.renewalse3["okbtn"].removeEventListener(MouseEvent.CLICK,this.renewalseOk3);
         this.renewalse3["nobtn"].removeEventListener(MouseEvent.CLICK,this.renewalseChange3);
         this.renewalse3["close_btn"].removeEventListener(MouseEvent.CLICK,this.renewalseClose3);
         if(Boolean(this.renewalse3) && this.contains(this.renewalse3))
         {
            this.removeChild(this.renewalse3);
         }
      }
      
      private function moonClick(param1:MouseEvent) : void
      {
         this.gc.curStage = 46;
         this.gc.curLevel = 1;
         this.gc.eventManger.dispatchEvent(new CommonEvent("selectStageOver"));
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
      }
      
      private function inToLingLongTower(param1:MouseEvent) : void
      {
         if(this.gc.curBigStage < 4)
         {
            this.gc.ts.setTxt("请先通过凌霄宝殿的考验！");
            this.gc.stage.addChild(this.gc.ts);
            return;
         }
         this.gc.gameinwhere = "玲珑宝塔";
         GMain.getInstance().switchSence("OpenAnimation");
      }
      
      private function nmgClick(param1:MouseEvent) : void
      {
         this.renewalse4["txt"].text = "你想要的模式为？(确定为挑战邪师徒,取消为训练木桩)";
         this.addChild(this.renewalse4);
         this.renewalse4["okbtn"].addEventListener(MouseEvent.CLICK,this.renewalseOk4);
         this.renewalse4["nobtn"].addEventListener(MouseEvent.CLICK,this.renewalseChange4);
         this.renewalse4["close_btn"].addEventListener(MouseEvent.CLICK,this.renewalseClose4);
      }
      
      private function renewalseOk4(param1:MouseEvent) : void
      {
         this.renewalse4["okbtn"].removeEventListener(MouseEvent.CLICK,this.renewalseOk4);
         this.renewalse4["nobtn"].removeEventListener(MouseEvent.CLICK,this.renewalseChange4);
         if(this.gc.curBigStage < 3 || this.gc.curBigStage == 3 && this.gc.curBigLevel < 3)
         {
            this.gc.ts.setTxt("请先通过朝会殿的考验！");
            this.gc.stage.addChild(this.gc.ts);
            this.removeChild(this.renewalse4);
            return;
         }
         this.gc.isXl = false;
         this.gc.curStage = 4;
         this.gc.curLevel = 1;
         this.gc.eventManger.dispatchEvent(new CommonEvent("selectStageOver"));
      }
      
      private function renewalseChange4(param1:MouseEvent) : void
      {
         this.renewalse4["okbtn"].removeEventListener(MouseEvent.CLICK,this.renewalseOk4);
         this.renewalse4["nobtn"].removeEventListener(MouseEvent.CLICK,this.renewalseChange4);
         if(this.gc.curBigStage < 3 || this.gc.curBigStage == 3 && this.gc.curBigLevel < 3)
         {
            this.gc.ts.setTxt("请先通过朝会殿的考验！");
            this.gc.stage.addChild(this.gc.ts);
            this.removeChild(this.renewalse4);
            return;
         }
         this.gc.isXl = true;
         this.gc.curStage = 4;
         this.gc.curLevel = 1;
         this.gc.eventManger.dispatchEvent(new CommonEvent("selectStageOver"));
      }
      
      private function renewalseClose4(param1:MouseEvent) : void
      {
         this.renewalse4["okbtn"].removeEventListener(MouseEvent.CLICK,this.renewalseOk4);
         this.renewalse4["nobtn"].removeEventListener(MouseEvent.CLICK,this.renewalseChange4);
         this.renewalse4["close_btn"].removeEventListener(MouseEvent.CLICK,this.renewalseClose4);
         if(Boolean(this.renewalse4) && this.contains(this.renewalse4))
         {
            this.removeChild(this.renewalse4);
         }
      }
      
      private function ssslClick(param1:MouseEvent) : void
      {
         this.gc.curStage = 9;
         this.gc.curLevel = 1;
         this.gc.eventManger.dispatchEvent(new CommonEvent("selectStageOver"));
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
      }
      
      private function tozm4level(param1:MouseEvent) : void
      {
         var _loc2_:Sgzzinterface = new Sgzzinterface();
         this.addChild(_loc2_);
      }
      
      private function dsgClick(param1:MouseEvent) : void
      {
         if(this.gc.playNum == 2)
         {
            if(this.gc.player1.getCurLevel() < 40 || this.gc.player2.getCurLevel() < 40)
            {
               this.gc.ts.setTxt("玩家的等级必须都大于40级才可以进入");
               this.gc.stage.addChild(this.gc.ts);
               return;
            }
         }
         else if(this.gc.player1.getCurLevel() < 40)
         {
            this.gc.ts.setTxt("玩家的等级必须都大于40级才可以进入");
            this.gc.stage.addChild(this.gc.ts);
            return;
         }
         this.gc.curStage = 12;
         this.gc.curLevel = 1;
         this.gc.eventManger.dispatchEvent(new CommonEvent("selectStageOver"));
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
      }
   }
}

