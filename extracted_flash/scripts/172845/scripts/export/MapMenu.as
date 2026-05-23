package export
{
   import config.*;
   import event.*;
   import export.huodong.*;
   import export.setmenu.*;
   import flash.display.*;
   import flash.events.*;
   import flash.net.*;
   import flash.text.TextField;
   import flash.utils.*;
   import my.*;
   import petInfo.*;
   
   public class MapMenu extends Sprite
   {
      
      public var showBuySkill:SimpleButton;
      
      public var ldl:SimpleButton;
      
      public var scgm:SimpleButton;
      
      public var savebtn:SimpleButton;
      
      public var saveInterval:TextField;
      
      public var btnback:SimpleButton;
      
      public var huodongbtn:SimpleButton;
      
      public var rwbtn:SimpleButton;
      
      public var scoreicon:SimpleButton;
      
      public var eatPills:SimpleButton;
      
      private var backSecBtn:SimpleButton;
      
      private var gc:Config;
      
      private var urlLoader:URLLoader;
      
      public var endlessmode:MovieClip;
      
      public var specialUI:MovieClip;
      
      public var sorrybag:MovieClip;
      
      private var renewalse:Sprite;
      
      private var renewalse2:Sprite;
      
      private var setMenu:gameSetting;
      
      public function MapMenu()
      {
         super();
         this.gc = Config.getInstance();
         this.renewalse = AUtils.getNewObj("renewalseThisSZ") as Sprite;
         this.renewalse.name = "renewalseThisSZ";
         this.renewalse2 = AUtils.getNewObj("renewalseThisSZ") as Sprite;
         this.renewalse2.name = "renewalseThisSZ";
         this.addEventListener(Event.ADDED_TO_STAGE,this.added,false,0,true);
         this.addEventListener(Event.REMOVED_FROM_STAGE,this.removed,false,0,true);
         this.tabChildren = false;
         this.tabEnabled = false;
         this.gc.saveTimer = new Timer(1000);
         this.gc.saveTimer.addEventListener(TimerEvent.TIMER,this.__timer);
         if(this.gc.saveIntervelCount != 0)
         {
            this.savebtn.enabled = false;
            this.savebtn.mouseEnabled = false;
            this.gc.saveTimer.start();
         }
      }
      
      private function added(param1:Event) : void
      {
         this.showBuySkill.addEventListener(MouseEvent.CLICK,this.buySkill);
         this.savebtn.addEventListener(MouseEvent.CLICK,this.saveGame,false,0,true);
         this.ldl.addEventListener(MouseEvent.CLICK,this.ldlClick);
         this.scgm.addEventListener(MouseEvent.CLICK,this.scgmClick);
         this.btnback.addEventListener(MouseEvent.CLICK,this.backtomenu);
         this.huodongbtn.addEventListener(MouseEvent.CLICK,this.huodongClick);
         this.rwbtn.addEventListener(MouseEvent.CLICK,this.rwbtnClick);
         this.sorrybag.addEventListener(MouseEvent.CLICK,this.sorryClick);
         this.endlessmode.addEventListener(MouseEvent.CLICK,this.endlessmodecreate);
         this.specialUI.addEventListener(MouseEvent.CLICK,this.UIchange);
         this.eatPills.addEventListener(MouseEvent.CLICK,this.eatPillsClick);
         this.specialUI.visible = false;
         if(this.gc.hasgetsorry == 0 || this.gc.hasgetsorry == 1)
         {
            this.sorrybag.visible = true;
            this.sorrybag.buttonMode = true;
         }
         else
         {
            this.sorrybag.visible = false;
         }
         if(this.gc.Objectdata.whichlastworld == 2)
         {
            if(this.backSecBtn)
            {
               this.backSecBtn = AUtils.getNewObj("backjiejiaobutton") as SimpleButton;
               this.backSecBtn.x = 500;
               this.backSecBtn.y = 500;
               this.backSecBtn.addEventListener(MouseEvent.CLICK,this.backSecBtnHandler);
               this.addChild(this.backSecBtn);
            }
         }
         else if(this.backSecBtn)
         {
            this.backSecBtn.visible = true;
         }
         this.scoreicon.addEventListener(MouseEvent.CLICK,this.scoreClick);
      }
      
      public function one_change(param1:Event) : void
      {
      }
      
      private function removed(param1:Event) : void
      {
         this.showBuySkill.removeEventListener(MouseEvent.CLICK,this.buySkill);
         this.scoreicon.removeEventListener(MouseEvent.CLICK,this.scoreClick);
         this.savebtn.removeEventListener(MouseEvent.CLICK,this.saveGame);
         this.ldl.removeEventListener(MouseEvent.CLICK,this.ldlClick);
         this.scgm.removeEventListener(MouseEvent.CLICK,this.scgmClick);
         this.huodongbtn.removeEventListener(MouseEvent.CLICK,this.huodongClick);
         this.rwbtn.removeEventListener(MouseEvent.CLICK,this.rwbtnClick);
         this.btnback.removeEventListener(MouseEvent.CLICK,this.backtomenu);
         this.sorrybag.removeEventListener(MouseEvent.CLICK,this.sorryClick);
         this.endlessmode.removeEventListener(MouseEvent.CLICK,this.endlessmodecreate);
         this.specialUI.removeEventListener(MouseEvent.CLICK,this.UIchange);
         this.eatPills.removeEventListener(MouseEvent.CLICK,this.eatPillsClick);
      }
      
      private function hasGetAward() : void
      {
         var _loc1_:* = 0;
         var _loc2_:* = null;
         if(this.gc.logInfo)
         {
            _loc1_ = uint(this.gc.logInfo.uid);
            if(this.gc.bigLibao.indexOf(_loc1_) != -1 || this.gc.smallLibao.indexOf(_loc1_) != -1)
            {
               if(this.gc.hasget)
               {
                  if(this.getChildByName("getawardtsChild"))
                  {
                     this.removeChild(this.getChildByName("getawardtsChild"));
                  }
               }
               else
               {
                  _loc2_ = AUtils.getNewObj("getawardts");
                  _loc2_.name = "getawardtsChild";
                  _loc2_.x = 271.25;
                  _loc2_.y = 514.3;
                  this.addChild(_loc2_);
                  if(this.getChildIndex(this.huodongbtn) < this.getChildIndex(_loc2_))
                  {
                     this.swapChildren(this.huodongbtn,_loc2_);
                  }
               }
            }
         }
      }
      
      private function backSecBtnHandler(param1:MouseEvent) : void
      {
         if(this.gc.Objectdata.whichlastworld == 1)
         {
            GMain.getInstance().switchSence("showNewStageMap");
         }
      }
      
      private function buySkill(param1:*) : void
      {
         this.gc.eventManger.dispatchEvent(new CommonEvent("showBuySkill",{"state":"maping"}));
         this.gc.eventManger.dispatchEvent(new CommonEvent("ShowOtherScene"));
      }
      
      private function submitScore(param1:*) : void
      {
         this.gc.ts.setTxt("暂未开启");
         this.gc.stage.addChild(this.gc.ts);
      }
      
      private function ldlClick(param1:MouseEvent) : void
      {
         this.gc.eventManger.dispatchEvent(new CommonEvent("showStrengthEquip",{"state":"maping"}));
         this.gc.eventManger.dispatchEvent(new CommonEvent("ShowOtherScene"));
      }
      
      private function scgmClick(param1:MouseEvent) : void
      {
         this.gc.eventManger.dispatchEvent(new CommonEvent("showShoping"));
         this.gc.eventManger.dispatchEvent(new CommonEvent("ShowOtherScene"));
      }
      
      private function eatPillsClick(param1:MouseEvent) : void
      {
         this.gc.eventManger.dispatchEvent(new CommonEvent("showImmortality",{"state":"maping"}));
         this.gc.eventManger.dispatchEvent(new CommonEvent("ShowOtherScene"));
      }
      
      private function saveGame(param1:MouseEvent) : void
      {
         var _loc2_:* = undefined;
         if(this.gc.isnew)
         {
            _loc2_ = AUtils.getNewObj("export.saveInterface::SaveInter");
            _loc2_.state = "save";
            this.addChild(_loc2_);
            this.gc.alert("首次进入游戏请选择存档");
         }
         else
         {
            this.gc.memory.saveGame(this.gc.saveId,true);
         }
      }
      
      private function UIchange(param1:MouseEvent) : void
      {
         if(this.gc.Objectdata.specialUI)
         {
            this.gc.Objectdata.specialUI = false;
            this.gc.alert("已经移去美化包，请保存并重启游戏",3);
         }
         else
         {
            this.gc.Objectdata.specialUI = true;
            this.gc.alert("已经添加美化包，请保存并重启游戏",3);
         }
      }
      
      private function __timer(param1:TimerEvent) : void
      {
         if(this.gc.saveIntervelCount > 0)
         {
            --this.gc.saveIntervelCount;
            this.saveInterval.text = "(" + String(this.gc.saveIntervelCount) + ")";
            this.savebtn.enabled = false;
            this.savebtn.mouseEnabled = false;
         }
         else
         {
            this.savebtn.enabled = true;
            this.savebtn.mouseEnabled = true;
            this.saveInterval.text = "";
         }
      }
      
      private function backtomenu(param1:MouseEvent) : void
      {
         this.gc.difficulity = 0;
         GMain.getInstance().switchSence("GameMenu");
         this.gc.initData();
         this.gc.eventManger.dispatchEvent(new CommonEvent("ShowOtherScene"));
      }
      
      private function huodongClick(param1:MouseEvent) : void
      {
         this.setMenu = AUtils.getNewObj("export.setmenu::gameSetting");
         this.setMenu.name = "gameSetting";
         this.gc.stage.addChild(this.setMenu);
      }
      
      private function renewalseOk2(param1:MouseEvent) : void
      {
         this.renewalse2["okbtn"].removeEventListener(MouseEvent.CLICK,this.renewalseOk2);
         this.renewalse2["nobtn"].removeEventListener(MouseEvent.CLICK,this.renewalseChange2);
         if(this.gc.difficulity == 1)
         {
            this.gc.difficulity = 0;
            this.gc.ts.setTxt("关卡难度变为普通");
            this.gc.stage.addChild(this.gc.ts);
         }
         else
         {
            this.gc.difficulity = 1;
            this.gc.ts.setTxt("关卡难度变为困难");
            this.gc.stage.addChild(this.gc.ts);
         }
         this.gc.stage.addChild(this.gc.ts);
         if(Boolean(this.renewalse2) && this.contains(this.renewalse2))
         {
            this.removeChild(this.renewalse2);
         }
      }
      
      private function renewalseChange2(param1:MouseEvent) : void
      {
         this.renewalse2["okbtn"].removeEventListener(MouseEvent.CLICK,this.renewalseOk2);
         this.renewalse2["nobtn"].removeEventListener(MouseEvent.CLICK,this.renewalseChange2);
         if(Boolean(this.renewalse2) && this.contains(this.renewalse2))
         {
            this.removeChild(this.renewalse2);
         }
      }
      
      private function rwbtnClick(param1:MouseEvent) : void
      {
         this.gc.eventManger.dispatchEvent(new CommonEvent("ShowTaskInterface"));
      }
      
      private function endlessmodecreate(param1:MouseEvent) : void
      {
         if(this.gc.player1.getCurLevel() < 30)
         {
            this.gc.ts.setTxt("玩家的等级必须都大于30级才可以进入");
            this.gc.stage.addChild(this.gc.ts);
            return;
         }
         this.gc.curStage = 98;
         this.gc.curLevel = 1;
         this.gc.eventManger.dispatchEvent(new CommonEvent("selectStageOver"));
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
      }
      
      private function sorryClick(param1:MouseEvent) : void
      {
         this.renewalse["txt"].text = "游戏会比较难！是否获取额外的物品(建议点取消)";
         this.addChild(this.renewalse);
         this.renewalse["okbtn"].addEventListener(MouseEvent.CLICK,this.renewalseOk);
         this.renewalse["nobtn"].addEventListener(MouseEvent.CLICK,this.renewalseChange);
      }
      
      private function scoreClick(param1:MouseEvent) : void
      {
         var scoreshop:ExchangeScore = null;
         scoreshop = new ExchangeScore();
         this.addChild(scoreshop);
      }
      
      private function renewalseOk(param1:MouseEvent) : void
      {
         this.gc.allEquip.reNewAll();
         var pet:PetInfo = new PetInfo();
         pet.setPetNameAndLevel("ufo1",1);
         var _loc3_:MyEquipObj = this.gc.allEquip.findByName("yxnmwsz");
         _loc3_.setFashionTime(this.gc.curdate);
         var _loc4_:MyEquipObj = this.gc.allEquip.findByName("mysz");
         this.renewalse["okbtn"].removeEventListener(MouseEvent.CLICK,this.renewalseOk);
         this.renewalse["nobtn"].removeEventListener(MouseEvent.CLICK,this.renewalseChange);
         if(this.gc.hasgetsorry == 0 || this.gc.hasgetsorry == 1)
         {
            this.gc.hasgetsorry = 2;
            if(this.gc.player1.roleid > 0)
            {
               this.gc.putQhsInBackPack(this.gc.player1,"wpqhs1",2);
               this.gc.putQhsInBackPack(this.gc.player1,"wpqhs2",2);
               this.gc.putQhsInBackPack(this.gc.player1,"wpqhs3",2);
               this.gc.putQhsInBackPack(this.gc.player1,"wpqhs4",2);
               this.gc.putQhsInBackPack(this.gc.player1,"wpxyf",4);
               this.gc.putQhsInBackPack(this.gc.player1,"wpbdf",2);
               this.gc.putQhsInBackPack(this.gc.player1,"mpyj");
               this.gc.player1.szlist.push(_loc3_);
               this.gc.player1.zblist.push(_loc4_);
               this.gc.player1.petsAry.push(pet);
               this.gc.player1.setLhValue(this.gc.player1.getLhValue() + 10000);
            }
            if(this.gc.player2.roleid > 0)
            {
               this.gc.putQhsInBackPack(this.gc.player2,"wpqhs1",2);
               this.gc.putQhsInBackPack(this.gc.player2,"wpqhs2",2);
               this.gc.putQhsInBackPack(this.gc.player2,"wpqhs3",2);
               this.gc.putQhsInBackPack(this.gc.player2,"wpqhs4",2);
               this.gc.putQhsInBackPack(this.gc.player1,"wpxyf",4);
               this.gc.putQhsInBackPack(this.gc.player1,"wpbdf",2);
               this.gc.putQhsInBackPack(this.gc.player2,"mpyj");
               this.gc.player2.szlist.push(_loc3_);
               this.gc.player2.zblist.push(_loc4_);
               this.gc.player2.petsAry.push(pet);
               this.gc.player2.setLhValue(this.gc.player2.getLhValue() + 10000);
            }
            this.gc.ts.setTxt("领取成功！");
            this.gc.stage.addChild(this.gc.ts);
            this.sorrybag.visible = false;
         }
         if(Boolean(this.renewalse) && this.contains(this.renewalse))
         {
            this.removeChild(this.renewalse);
         }
      }
      
      private function renewalseChange(param1:MouseEvent) : void
      {
         this.gc.allEquip.reNewAll();
         var pet:PetInfo = new PetInfo();
         pet.setPetNameAndLevel("ufo1",1);
         var _loc3_:MyEquipObj = this.gc.allEquip.findByName("ptnmwsz");
         _loc3_.setFashionTime(this.gc.curdate);
         var _loc4_:MyEquipObj = this.gc.allEquip.findByName("mysz");
         this.renewalse["okbtn"].removeEventListener(MouseEvent.CLICK,this.renewalseOk);
         this.renewalse["nobtn"].removeEventListener(MouseEvent.CLICK,this.renewalseChange);
         if(this.gc.hasgetsorry == 0 || this.gc.hasgetsorry == 1)
         {
            this.gc.hasgetsorry = 2;
            if(this.gc.player1.roleid > 0)
            {
               this.gc.putQhsInBackPack(this.gc.player1,"wpqhs1",1);
               this.gc.putQhsInBackPack(this.gc.player1,"wpqhs2",1);
               this.gc.putQhsInBackPack(this.gc.player1,"wpqhs3",1);
               this.gc.putQhsInBackPack(this.gc.player1,"wpqhs4",1);
               this.gc.putQhsInBackPack(this.gc.player1,"wpxyf",2);
               this.gc.putQhsInBackPack(this.gc.player1,"mpyj");
               this.gc.player1.szlist.push(_loc3_);
               this.gc.player1.zblist.push(_loc4_);
               this.gc.player1.petsAry.push(pet);
            }
            if(this.gc.player2.roleid > 0)
            {
               this.gc.putQhsInBackPack(this.gc.player2,"wpqhs1",1);
               this.gc.putQhsInBackPack(this.gc.player2,"wpqhs2",1);
               this.gc.putQhsInBackPack(this.gc.player2,"wpqhs3",1);
               this.gc.putQhsInBackPack(this.gc.player2,"wpqhs4",1);
               this.gc.putQhsInBackPack(this.gc.player1,"wpxyf",2);
               this.gc.putQhsInBackPack(this.gc.player2,"mpyj");
               this.gc.player2.szlist.push(_loc3_);
               this.gc.player2.zblist.push(_loc4_);
               this.gc.player2.petsAry.push(pet);
            }
            this.gc.ts.setTxt("领取成功！");
            this.gc.stage.addChild(this.gc.ts);
            this.sorrybag.visible = false;
         }
         if(Boolean(this.renewalse) && this.contains(this.renewalse))
         {
            this.removeChild(this.renewalse);
         }
      }
   }
}

