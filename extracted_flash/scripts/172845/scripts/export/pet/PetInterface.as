package export.pet
{
   import config.*;
   import event.*;
   import flash.display.*;
   import flash.events.*;
   import flash.text.*;
   import my.*;
   import petInfo.PetInfo;
   import user.User;
   
   public class PetInterface extends Sprite
   {
      
      private var gc:Config;
      
      private var player:User;
      
      private var pif:PetInfo;
      
      public var btn_close:SimpleButton;
      
      public var releasebtn:SimpleButton;
      
      public var fightbtn:SimpleButton;
      
      public var restbtn:SimpleButton;
      
      public var upBtn:SimpleButton;
      
      public var hptxt:TextField;
      
      public var mptxt:TextField;
      
      public var atktxt:TextField;
      
      public var deftxt:TextField;
      
      public var expmc:MovieClip;
      
      public var lifetimemc:MovieClip;
      
      public var defqualitymc:MovieClip;
      
      public var atkqualitymc:MovieClip;
      
      public var mpqualitymc:MovieClip;
      
      public var hpqualitymc:MovieClip;
      
      public var exptxt:TextField;
      
      public var lifetimetxt:TextField;
      
      public var defqualitytxt:TextField;
      
      public var atkqualitytxt:TextField;
      
      public var mpqualitytxt:TextField;
      
      public var hpqualitytxt:TextField;
      
      public var speedtxt:TextField;
      
      public var eamptxt:TextField;
      
      public var mdeftxt:TextField;
      
      public var crittxt:TextField;
      
      public var misstxt:TextField;
      
      public var eahptxt:TextField;
      
      public var skill1:Sprite;
      
      public var skill2:Sprite;
      
      public var skill3:Sprite;
      
      public var skill4:Sprite;
      
      public var skill5:Sprite;
      
      public var skill6:Sprite;
      
      public var skill7:Sprite;
      
      public var skill8:Sprite;
      
      public var warpowertxt:TextField;
      
      public var techniquetxt:TextField;
      
      public var perceptiontxt:TextField;
      
      public var qualitymc:MovieClip;
      
      public var txtname:TextField;
      
      private var pethead:PetHeadSprite;
      
      public var listtxt:TextField;
      
      public var leveltxt:TextField;
      
      private var giveupPet:Sprite;
      
      public var prePage:SimpleButton;
      
      public var nextPage:SimpleButton;
      
      public var czsxbtn:*;
      
      public var czjnbtn:*;
      
      private var curPage:uint = 1;
      
      private var allPage:uint = 2;
      
      private var pageNum:uint = 5;
      
      private var btnState:*;
      
      private var lastBtn:String = "";
      
      public function PetInterface(param1:User)
      {
         super();
         this.gc = Config.getInstance();
         this.player = param1;
         this.giveupPet = AUtils.getNewObj("giveUpThisPet") as Sprite;
         this.giveupPet.name = "giveupPet";
         this.addEventListener(Event.ADDED_TO_STAGE,this.added,false,0,true);
         this.addEventListener(Event.REMOVED_FROM_STAGE,this.removed,false,0,true);
      }
      
      private function added(param1:Event) : void
      {
         this.btn_close.addEventListener(MouseEvent.CLICK,this.close);
         this.releasebtn.addEventListener(MouseEvent.CLICK,this.releaseClick);
         this.fightbtn.addEventListener(MouseEvent.CLICK,this.fightClick);
         this.restbtn.addEventListener(MouseEvent.CLICK,this.restClick);
         this.upBtn.addEventListener(MouseEvent.CLICK,this.revolution);
         this.czjnbtn.addEventListener(MouseEvent.CLICK,this.reSkills);
         this.czsxbtn.addEventListener(MouseEvent.CLICK,this.reAttribs);
         this.prePage.addEventListener(MouseEvent.CLICK,this.prePageClick);
         this.nextPage.addEventListener(MouseEvent.CLICK,this.nextPageClick);
         this.gc.eventManger.addEventListener("closePetInterface",this.__closePetInterface);
         this.setPetList();
      }
      
      private function removed(param1:Event) : void
      {
         this.btn_close.removeEventListener(MouseEvent.CLICK,this.close);
         this.releasebtn.removeEventListener(MouseEvent.CLICK,this.releaseClick);
         this.fightbtn.removeEventListener(MouseEvent.CLICK,this.fightClick);
         this.restbtn.removeEventListener(MouseEvent.CLICK,this.restClick);
         this.upBtn.removeEventListener(MouseEvent.CLICK,this.revolution);
         this.czjnbtn.removeEventListener(MouseEvent.CLICK,this.reSkills);
         this.czsxbtn.removeEventListener(MouseEvent.CLICK,this.reAttribs);
         this.prePage.removeEventListener(MouseEvent.CLICK,this.prePageClick);
         this.nextPage.removeEventListener(MouseEvent.CLICK,this.nextPageClick);
         this.gc.eventManger.removeEventListener("closePetInterface",this.__closePetInterface);
         this.removedPetList();
         if(this.gc.isSingleGame())
         {
            MainGame.getInstance().continueGame();
         }
      }
      
      private function reSkills(param1:MouseEvent) : void
      {
         if(this.player.getSomeOneEquipNumberByName("cwjnxld") > 0)
         {
            this.pif.refreshPetAllSkillByLevel();
            this.setPetAllSkill();
            this.player.removeEquipFormBack("cwjnxld",2,1);
            this.gc.alert("重置完成");
         }
         else
         {
            this.gc.alert("宠物技能洗练丹不足！");
         }
      }
      
      private function reAttribs(param1:MouseEvent) : void
      {
         if(this.player.getSomeOneEquipNumberByName("cwzzxld") > 0)
         {
            this.pif.refreshTherrAttributeByImmortality();
            this.setShow();
            this.player.removeEquipFormBack("cwzzxld",2,1);
            this.gc.alert("重置完成");
         }
         else
         {
            this.gc.alert("宠物属性洗练丹不足！");
         }
      }
      
      private function prePageClick(param1:MouseEvent) : void
      {
         this.setCurPage(-1);
         if(this.btnState)
         {
            if(this.lastBtn != "")
            {
               this[this.lastBtn].upState = this.btnState;
            }
         }
         this.lastBtn = "prePage";
         this.btnState = param1.target.upState;
         param1.target.upState = param1.target.downState;
      }
      
      private function nextPageClick(param1:MouseEvent) : void
      {
         this.setCurPage(1);
         if(this.btnState)
         {
            if(this.lastBtn != "")
            {
               this[this.lastBtn].upState = this.btnState;
            }
         }
         this.lastBtn = "nextPage";
         this.btnState = param1.target.upState;
         param1.target.upState = param1.target.downState;
      }
      
      public function setCurPage(param1:int) : void
      {
         var _loc2_:uint = uint(this.curPage);
         this.curPage += param1;
         if(this.curPage > this.allPage)
         {
            this.curPage = this.allPage;
         }
         if(this.curPage < 1)
         {
            this.curPage = 1;
         }
         if(this.curPage != _loc2_)
         {
            this.setPetList();
         }
      }
      
      private function setPetList(param1:Boolean = false) : void
      {
         var _loc2_:* = undefined;
         var _loc3_:* = null;
         var _loc4_:* = null;
         this.removedPetList();
         this.setTitleTxt();
         var _loc5_:int = 0;
         while(_loc5_ < 5)
         {
            _loc2_ = AUtils.getNewObj("petlist") as Sprite;
            _loc4_ = AUtils.getNewObj("petlist") as Sprite;
            _loc2_.buttonMode = true;
            if(this.player.petsAry[_loc5_ + (this.curPage - 1) * 5] != undefined)
            {
               if(this.player.petsAry[_loc5_ + (this.curPage - 1) * 5].isFight == 1)
               {
                  _loc4_["petname"].text = this.player.petsAry[_loc5_ + (this.curPage - 1) * 5].getPetChinaName() + "(出战)";
                  _loc3_ = _loc4_;
               }
               else
               {
                  _loc4_["petname"].text = this.player.petsAry[_loc5_ + (this.curPage - 1) * 5].getPetChinaName();
               }
               _loc4_.name = "petlist" + _loc5_;
               _loc4_.x = 349.85;
               _loc4_.y = 142.5 + _loc5_ * Number(_loc4_.height) + 5;
               this.addChild(_loc4_);
               _loc4_.addEventListener(MouseEvent.CLICK,this.plClick);
            }
            _loc5_++;
         }
         if(param1)
         {
            if(_loc3_)
            {
               _loc3_.dispatchEvent(new MouseEvent(MouseEvent.CLICK));
            }
         }
      }
      
      private function removedPetList() : void
      {
         var _loc1_:int = 0;
         while(_loc1_ < 5)
         {
            if(this.getChildByName("petlist" + _loc1_))
            {
               this.getChildByName("petlist" + _loc1_).removeEventListener(MouseEvent.CLICK,this.plClick);
               this.removeChild(this.getChildByName("petlist" + _loc1_));
            }
            _loc1_++;
         }
      }
      
      private function findPetInCurrentPetListById(param1:uint) : PetInfo
      {
         if(this.player.petsAry[param1])
         {
            return this.player.petsAry[param1];
         }
         return null;
      }
      
      private function plClick(param1:MouseEvent) : void
      {
         var _loc2_:* = null;
         var _loc3_:TextFormat = new TextFormat();
         _loc3_.color = "0x381d09";
         var _loc4_:uint = uint(int(String(param1.currentTarget.name).substr(7,1)));
         _loc2_ = this.findPetInCurrentPetListById(_loc4_ + (this.curPage - 1) * 5);
         if(_loc2_ == null)
         {
            throw new Error("获取选择的宠物为null");
         }
         var _loc5_:uint = uint(this.player.petsAry.length);
         while(_loc5_-- > 0)
         {
            if(this.getChildByName("petlist" + _loc5_))
            {
               this.getChildByName("petlist" + _loc5_)["petname"].setTextFormat(_loc3_);
            }
         }
         _loc3_.color = "0xfdfcba";
         param1.currentTarget.petname.setTextFormat(_loc3_);
         this.setPetInfomation(_loc2_);
         this.addPetHead();
      }
      
      private function addPetHead() : void
      {
         if(this.pethead)
         {
            if(contains(this.pethead))
            {
               this.removeChild(this.pethead);
            }
            this.pethead.destroy();
            this.pethead = null;
         }
         this.pethead = new PetHeadSprite(this.pif.getPetName());
         this.addChild(this.pethead);
         this.pethead.x = 280;
         this.pethead.y = 220;
         this.setChildIndex(this.pethead,this.getChildIndex(this.releasebtn) - 1);
      }
      
      public function setPetInfomation(param1:PetInfo) : void
      {
         this.pif = param1;
         this.setShow();
         this.setPetAllSkill();
      }
      
      private function setPetAllSkill() : void
      {
         var _loc1_:int = 0;
         var _loc2_:* = null;
         var _loc3_:* = 0;
         _loc1_ = 0;
         while(_loc1_ < 8)
         {
            this["skill" + (_loc1_ + 1)].removeSkill();
            _loc1_++;
         }
         if(this.pif)
         {
            _loc2_ = new Object();
            _loc3_ = uint(this.pif.skill.length);
            _loc1_ = 0;
            while(_loc1_ < _loc3_)
            {
               _loc2_.sname = this.pif.skill[_loc1_].sname;
               _loc2_.cname = this.pif.transPetChinaSkillName(this.pif.skill[_loc1_].sname);
               _loc2_.sinfo = this.pif.skill[_loc1_].sinfo;
               this["skill" + (_loc1_ + 1)].setCurrentSkill(_loc2_);
               _loc1_++;
            }
         }
      }
      
      private function setShow() : void
      {
         if(this.pif)
         {
            this.qualitymc.gotoAndStop(this.pif.getquality());
            this.setTitleTxt();
            this.leveltxt.text = this.pif.getLevel() + "";
            this.txtname.text = this.pif.getPetChinaName() + "";
            this.hptxt.text = this.pif.getHp() + "/" + this.pif.getSHp();
            this.mptxt.text = this.pif.getMp() + "/" + this.pif.getSMp();
            this.atktxt.text = this.pif.getAtk() + "";
            this.deftxt.text = this.pif.getDef() + "";
            this.perceptiontxt.text = this.pif.getperception() + "";
            this.techniquetxt.text = this.pif.gettechnique() + "";
            this.warpowertxt.text = this.pif.getwarpower() + "";
            this.exptxt.text = this.pif.getCurExper() + "/" + this.pif.getPetNextExper();
            this.lifetimetxt.text = this.pif.getlifetime() + "/" + 100;
            this.defqualitytxt.text = this.pif.getdefQuality() + "/" + 2000;
            this.atkqualitytxt.text = this.pif.getatkQuality() + "/" + 2000;
            this.mpqualitytxt.text = this.pif.getmpQuality() + "/" + 2000;
            this.hpqualitytxt.text = this.pif.gethpQuality() + "/" + 2000;
            this.expmc.gotoAndStop(Math.round(20 * this.pif.getCurExper() / this.pif.getPetNextExper()) + 1);
            this.speedtxt.text = this.pif.getMoveSpeed() + "";
            this.eamptxt.text = this.pif.getEMp() + "";
            this.eahptxt.text = this.pif.getEHp() + "";
            this.crittxt.text = int(this.pif.getCrit() * 100) + "%";
            this.misstxt.text = Math.round(this.pif.getMiss() * 100) + "%";
            this.mdeftxt.text = Math.round(this.pif.getMDef() * 100) + "%";
            this.lifetimemc.gotoAndStop(20 - Math.round(20 * this.pif.getlifetime() / 100));
            this.defqualitymc.gotoAndStop(Math.round(20 * this.pif.getdefQuality() / 2000) + 1);
            this.atkqualitymc.gotoAndStop(Math.round(20 * this.pif.getatkQuality() / 2000) + 1);
            this.mpqualitymc.gotoAndStop(Math.round(20 * this.pif.getmpQuality() / 2000) + 1);
            this.hpqualitymc.gotoAndStop(Math.round(20 * this.pif.gethpQuality() / 2000) + 1);
         }
         else
         {
            this.qualitymc.gotoAndStop(3);
            this.txtname.text = "";
            this.hptxt.text = "";
            this.mptxt.text = "";
            this.atktxt.text = "";
            this.deftxt.text = "";
            this.perceptiontxt.text = "";
            this.techniquetxt.text = "";
            this.warpowertxt.text = "";
            this.exptxt.text = "";
            this.lifetimetxt.text = "";
            this.defqualitytxt.text = "";
            this.atkqualitytxt.text = "";
            this.mpqualitytxt.text = "";
            this.hpqualitytxt.text = "";
            this.leveltxt.text = "";
            this.expmc.gotoAndStop(1);
            this.speedtxt.text = "";
            this.eamptxt.text = "";
            this.eahptxt.text = "";
            this.crittxt.text = "";
            this.misstxt.text = "";
            this.mdeftxt.text = "";
            this.lifetimemc.gotoAndStop(20);
            this.defqualitymc.gotoAndStop(1);
            this.atkqualitymc.gotoAndStop(1);
            this.mpqualitymc.gotoAndStop(1);
            this.hpqualitymc.gotoAndStop(1);
         }
      }
      
      private function setTitleTxt() : void
      {
         this.listtxt.text = "宠物列表" + this.player.petsAry.length + "/10";
      }
      
      private function releaseClick(param1:MouseEvent) : void
      {
         this.addChild(this.giveupPet);
         this.giveupPet["okbtn"].addEventListener(MouseEvent.CLICK,this.okClick);
         this.giveupPet["nobtn"].addEventListener(MouseEvent.CLICK,this.noClick);
      }
      
      private function okClick(param1:MouseEvent) : void
      {
         this.giveupPet["okbtn"].removeEventListener(MouseEvent.CLICK,this.okClick);
         this.giveupPet["nobtn"].removeEventListener(MouseEvent.CLICK,this.noClick);
         var _loc2_:uint = uint(this.player.petsAry.indexOf(this.pif));
         if(_loc2_ != -1)
         {
            this.player.petsAry.splice(_loc2_,1);
         }
         if(this.pif.isFight == 1)
         {
            this.sendHeroRefreshPet();
         }
         this.pif = null;
         this.setShow();
         this.setPetList();
         if(this.pethead)
         {
            if(contains(this.pethead))
            {
               this.removeChild(this.pethead);
            }
            this.pethead.destroy();
            this.pethead = null;
         }
         if(Boolean(this.giveupPet) && this.contains(this.giveupPet))
         {
            this.removeChild(this.giveupPet);
         }
      }
      
      private function noClick(param1:MouseEvent) : void
      {
         this.giveupPet["okbtn"].removeEventListener(MouseEvent.CLICK,this.okClick);
         this.giveupPet["nobtn"].removeEventListener(MouseEvent.CLICK,this.noClick);
         if(Boolean(this.giveupPet) && this.contains(this.giveupPet))
         {
            this.removeChild(this.giveupPet);
         }
      }
      
      private function revolution(param1:MouseEvent) : *
      {
         if(!this.pif)
         {
            this.gc.alert("没找到宠物");
            return;
         }
         if(this.pif.getLevel() >= 50)
         {
            if(this.pif.getPetName() == "monkey3")
            {
               this.pif.theFourShape();
               this.setShow();
               this.AfterSuperRevolution();
               this.gc.alert("恭喜您,宠物成功超进化！");
            }
            else if(this.pif.getPetName() == "horse3")
            {
               this.pif.theFourShape();
               this.setShow();
               this.AfterSuperRevolution();
               this.gc.alert("恭喜您,宠物成功超进化！");
            }
            else if(this.pif.getPetName() == "tigress3")
            {
               this.pif.theFourShape();
               this.setShow();
               this.AfterSuperRevolution();
               this.gc.alert("恭喜您,宠物成功超进化！");
            }
            else if(this.pif.getPetName() == "turtle3")
            {
               this.pif.theFourShape();
               this.setShow();
               this.AfterSuperRevolution();
               this.gc.alert("恭喜您,宠物成功超进化！");
            }
            else if(this.pif.getPetName() == "phoenix3")
            {
               this.pif.theFourShape();
               this.setShow();
               this.AfterSuperRevolution();
               this.gc.alert("恭喜您,宠物成功超进化！");
            }
            else if(this.pif.getPetName() == "dragon3")
            {
               this.pif.theFourShape();
               this.setShow();
               this.AfterSuperRevolution();
               this.gc.alert("恭喜您,宠物成功超进化！");
            }
            else if(this.pif.getPetName() == "rabbit3")
            {
               this.pif.theFourShape();
               this.setShow();
               this.AfterSuperRevolution();
               this.gc.alert("恭喜您,宠物成功超进化！");
            }
            else if(this.pif.getPetName() == "roomhorse3")
            {
               this.pif.theFourShape();
               this.setShow();
               this.AfterSuperRevolution();
               this.gc.alert("恭喜您,宠物成功进化！");
            }
            else if(this.pif.getPetName() == "mouse3")
            {
               this.pif.theFourShape();
               this.setShow();
               this.AfterSuperRevolution();
               this.gc.alert("恭喜您,宠物成功进化！");
            }
            else
            {
               this.gc.alert("该宠物暂时未开放超进化!");
            }
         }
         else
         {
            this.gc.alert("宠物等级未达到50!");
         }
      }
      
      private function AfterSuperRevolution() : void
      {
         this.addPetHead();
         this.refreshPetList();
         if(this.pif.getperception() < 8)
         {
            this.pif.setperception(this.pif.getperception() + 1);
         }
         this.setPetAllSkill();
         this.setShow();
      }
      
      private function fightClick(param1:MouseEvent) : void
      {
         var _loc2_:PetInfo = this.player.findCurrentPet();
         if(this.pif.getHp() <= 0)
         {
            this.gc.alert("您的宠物需要休息了");
            return;
         }
         if(_loc2_)
         {
            _loc2_.isFight = 0;
         }
         if(this.pif)
         {
            this.pif.isFight = 1;
         }
         this.refreshPetList();
         this.sendHeroRefreshPet();
      }
      
      private function sendHeroRefreshPet() : void
      {
         if(this.gc.hero1)
         {
            if(this.gc.hero1.getPlayer() == this.player)
            {
               this.gc.hero1.changePet();
            }
         }
         if(this.gc.hero2)
         {
            if(this.gc.hero2.getPlayer() == this.player)
            {
               this.gc.hero2.changePet();
            }
         }
         this.gc.eventManger.dispatchEvent(new CommonEvent("CHANGECURRENTPET"));
      }
      
      private function refreshPetList() : void
      {
         var _loc1_:Boolean = false;
         var _loc2_:uint = uint(this.player.petsAry.length);
         while(_loc2_-- > 0)
         {
            if(this.getChildByName("petlist" + _loc2_))
            {
               if(this.getChildByName("petlist" + _loc2_))
               {
                  if(this.player.petsAry[_loc2_].isFight == 1)
                  {
                     if(!_loc1_)
                     {
                        this.getChildByName("petlist" + _loc2_)["petname"].text = this.player.petsAry[_loc2_].getPetChinaName() + "(出战)";
                        _loc1_ = true;
                     }
                     else
                     {
                        this.player.petsAry[_loc2_].isFight = 0;
                     }
                  }
                  else
                  {
                     this.getChildByName("petlist" + _loc2_)["petname"].text = this.player.petsAry[_loc2_].getPetChinaName();
                  }
               }
            }
         }
      }
      
      private function restClick(param1:MouseEvent) : void
      {
         if(this.pif)
         {
            this.pif.isFight = 0;
            this.refreshPetList();
         }
         this.sendHeroRefreshPet();
      }
      
      private function __closePetInterface(param1:CommonEvent) : void
      {
         this.close(null);
      }
      
      private function close(param1:MouseEvent) : void
      {
         if(this.pethead)
         {
            if(contains(this.pethead))
            {
               this.removeChild(this.pethead);
            }
            this.pethead.destroy();
            this.pethead = null;
         }
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
      }
   }
}

