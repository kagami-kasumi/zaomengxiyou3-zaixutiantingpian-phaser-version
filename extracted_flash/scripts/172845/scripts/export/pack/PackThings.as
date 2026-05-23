package export.pack
{
   import base.*;
   import com.hexagonstar.util.debug.*;
   import config.*;
   import event.*;
   import export.level.*;
   import export.strength.*;
   import flash.display.*;
   import flash.events.*;
   import flash.text.TextField;
   import my.*;
   import user.*;
   
   public class PackThings extends Sprite
   {
      
      private var gc:Config;
      
      private var sobj:ShowObj;
      
      private var who:uint;
      
      private var threebtn:Sprite;
      
      private var which:uint = 1;
      
      public var txtname:TextField;
      
      private var renewalse:Sprite;
      
      private var stageListener991:StageListener991;
      
      public function PackThings()
      {
         super();
         this.gc = Config.getInstance();
         this.txtname.selectable = false;
         this.addEventListener(Event.ADDED_TO_STAGE,this.added,false,0,true);
         this.addEventListener(Event.REMOVED_FROM_STAGE,this.removed,false,0,true);
      }
      
      private function added(param1:*) : void
      {
         this.renewalse = AUtils.getNewObj("renewalseThisSZ") as Sprite;
         this.renewalse.name = "renewalseThisSZ";
         this.addEventListener(MouseEvent.ROLL_OUT,this.outHandle);
         this.addEventListener(MouseEvent.CLICK,this.onClick);
         this.gc.eventManger.addEventListener("CHANGETXT",this.setTxt);
      }
      
      private function removed(param1:*) : void
      {
         this.removeEventListener(MouseEvent.ROLL_OUT,this.outHandle);
         this.removeEventListener(MouseEvent.CLICK,this.onClick);
         this.gc.eventManger.removeEventListener("CHANGETXT",this.setTxt);
         this.renewalse = null;
      }
      
      public function addRenewalseMask(param1:String) : void
      {
         this.renewalse["txt"].text = param1;
         GMain.getInstance().getMainSence().addChild(this.renewalse);
         this.renewalse["okbtn"].addEventListener(MouseEvent.CLICK,this.renewalseOk);
         this.renewalse["nobtn"].addEventListener(MouseEvent.CLICK,this.renewalseChange);
      }
      
      private function renewalseOk(param1:MouseEvent) : void
      {
         var _loc2_:int = 0;
         var _loc3_:Array = null;
         var _loc4_:uint = 0;
         var _loc5_:int = 0;
         var _loc6_:int = 0;
         var _loc7_:User = null;
         var _loc8_:int = 0;
         try
         {
            _loc2_ = 0;
            _loc3_ = null;
            _loc4_ = 0;
            _loc5_ = 0;
            _loc6_ = 0;
            this.renewalse["okbtn"].removeEventListener(MouseEvent.CLICK,this.renewalseOk);
            this.renewalse["nobtn"].removeEventListener(MouseEvent.CLICK,this.renewalseChange);
            _loc7_ = User(this.gc["player" + this.who]);
            _loc8_ = 2;
            while(_loc8_-- > 0)
            {
               _loc3_ = String(_loc7_.isstudyskill[_loc8_].skillName).split("|");
               _loc4_ = _loc3_.length;
               while(_loc4_-- > 0)
               {
                  sary = _loc3_[_loc4_].split("~");
                  if(sary[0] != "")
                  {
                     _loc5_ = int(sary[1]);
                     trace(_loc5_);
                     _loc2_ = 0;
                     _loc6_ = _loc5_ - 2;
                     while(_loc6_ >= 0)
                     {
                        if(sary[0] == "sx" || sary[0] == "rj" || sary[0] == "yyb" || sary[0] == "tjgl" || sary[0] == "myhc" || sary[0] == "sd")
                        {
                           _loc2_ += Math.ceil(200 * Math.pow(2560,Math.pow(_loc6_ / 7,0.8)));
                        }
                        else
                        {
                           _loc2_ += Math.ceil(200 * Math.pow(2560,Math.pow(_loc6_ / 16,0.8)));
                        }
                        _loc6_--;
                     }
                     _loc7_.setLhValue(_loc7_.getLhValue() + _loc2_);
                  }
               }
            }
            BackPack(this.parent.parent.parent).setInfoTxt();
            _loc7_.isstudyskill[0].skillName = "";
            _loc7_.isstudyskill[1].skillName = "";
            _loc7_.skillbykey = [];
            this.removeDaoJuSobj();
            this.gc.eventManger.dispatchEvent(new CommonEvent("InGameBuySkillOver"));
            if(Boolean(this.renewalse) && GMain.getInstance().getMainSence().contains(this.renewalse))
            {
               GMain.getInstance().getMainSence().removeChild(this.renewalse);
            }
         }
         catch(e:*)
         {
            this.gc.ts.setTxt("操作失败，请不要关闭背包！");
            this.gc.stage.addChild(this.gc.ts);
            if(Boolean(GMain.getInstance().getMainSence().getChildByName("renewalseThisSZ")) && GMain.getInstance().getMainSence().contains(GMain.getInstance().getMainSence().getChildByName("renewalseThisSZ")))
            {
               GMain.getInstance().getMainSence().removeChild(GMain.getInstance().getMainSence().getChildByName("renewalseThisSZ"));
            }
         }
      }
      
      private function renewalseChange(param1:MouseEvent) : void
      {
         try
         {
            this.renewalse["okbtn"].removeEventListener(MouseEvent.CLICK,this.renewalseOk);
            this.renewalse["nobtn"].removeEventListener(MouseEvent.CLICK,this.renewalseChange);
            if(Boolean(this.renewalse) && GMain.getInstance().getMainSence().contains(this.renewalse))
            {
               GMain.getInstance().getMainSence().removeChild(this.renewalse);
            }
         }
         catch(e:*)
         {
            this.gc.ts.setTxt("操作失败，请不要关闭背包！");
            this.gc.stage.addChild(this.gc.ts);
            if(Boolean(GMain.getInstance().getMainSence().getChildByName("renewalseThisSZ")) && GMain.getInstance().getMainSence().contains(GMain.getInstance().getMainSence().getChildByName("renewalseThisSZ")))
            {
               GMain.getInstance().getMainSence().removeChild(GMain.getInstance().getMainSence().getChildByName("renewalseThisSZ"));
            }
         }
      }
      
      private function setTxt(param1:Event) : void
      {
         if(this.sobj != null)
         {
            if(this.sobj.getMyEquipObj().getENum() > 1)
            {
               this.txtname.text = this.sobj.getMyEquipObj().getENum() + "";
            }
            else
            {
               this.txtname.text = "";
            }
         }
         else
         {
            this.txtname.text = "";
         }
      }
      
      public function getMyEquipType() : String
      {
         if(this.sobj)
         {
            return this.sobj.getMyEquipObj().type;
         }
         return "";
      }
      
      public function setTxtVisible(param1:Boolean) : void
      {
         this.txtname.visible = param1;
      }
      
      private function outHandle(param1:*) : void
      {
         this.removeThreebtn();
      }
      
      private function onClick(param1:*) : void
      {
         if(this.sobj != null)
         {
            this.sobj.pulbiremoved();
         }
      }
      
      public function setObj(param1:*, param2:uint, param3:uint = 1) : void
      {
         if(param1 != null)
         {
            this.which = param3;
            this.sobj = new ShowObj(param1);
            this.addChild(this.sobj);
            this.who = param2;
            this.setTxt(null);
            this.sobj.addEventListener(MouseEvent.CLICK,this.clickHandler);
            this.sobj.addEventListener(MouseEvent.DOUBLE_CLICK,this.useClick);
            if(this.getChildIndex(this.sobj) > this.getChildIndex(this.txtname))
            {
               this.swapChildren(this.sobj,this.txtname);
            }
         }
      }
      
      public function removeSobj() : void
      {
         this.sobj.removeEventListener(MouseEvent.CLICK,this.clickHandler);
         this.sobj.removeEventListener(MouseEvent.DOUBLE_CLICK,this.useClick);
         this.removeChild(this.sobj);
         var _loc1_:MyEquipObj = this.sobj.getMyEquipObj();
         this.removeSomeEquip(_loc1_);
         this.sobj = null;
      }
      
      private function removeSomeEquip(param1:MyEquipObj) : void
      {
         var _loc2_:int = 0;
         if(this.which == 1)
         {
            _loc2_ = int(this.gc["player" + this.who].zblist.indexOf(param1));
            this.gc["player" + this.who].zblist.splice(_loc2_,1);
         }
         else if(this.which == 2)
         {
            _loc2_ = int(this.gc["player" + this.who].djlist.indexOf(param1));
            this.gc["player" + this.who].djlist.splice(_loc2_,1);
         }
         else if(this.which == 3)
         {
            _loc2_ = int(this.gc["player" + this.who].szlist.indexOf(param1));
            this.gc["player" + this.who].szlist.splice(_loc2_,1);
         }
         else if(this.which == 4)
         {
            _loc2_ = int(this.gc["player" + this.who].jnslist.indexOf(param1));
            this.gc["player" + this.who].jnslist.splice(_loc2_,1);
         }
      }
      
      private function clickHandler(param1:MouseEvent) : void
      {
         var _loc2_:* = null;
         if(this.sobj.getMyEquipObj().getFillName() == "hjxz" || this.sobj.getMyEquipObj().getFillName() == "zsxz")
         {
            return;
         }
         if(Boolean(this.sobj) && contains(this.sobj))
         {
            if(this.parent.parent.parent is BackPack)
            {
               if(this.which == 1 || this.which == 3)
               {
                  this.removeThreebtn();
                  this.threebtn = AUtils.getNewObj("threebtn");
                  this.threebtn.x = 25;
                  this.threebtn.y = 25;
                  this.addChild(this.threebtn);
                  this.threebtn["bzb"].addEventListener(MouseEvent.CLICK,this.zbClick);
                  this.threebtn["bgy"].addEventListener(MouseEvent.CLICK,this.gyClick);
                  this.threebtn["bmd"].addEventListener(MouseEvent.CLICK,this.mdClick);
                  this.threebtn["bmd"].gotoAndStop(1);
                  if(this.gc.playNum == 1)
                  {
                     this.threebtn["bgy"].gotoAndStop(2);
                     this.threebtn["bgy"].removeEventListener(MouseEvent.CLICK,this.gyClick);
                  }
                  if(this.sobj.getMyEquipObj().type == "zbsz")
                  {
                     if(this.sobj.getMyEquipObj().hasPassTime())
                     {
                        this.threebtn["bzb"].gotoAndStop(3);
                     }
                  }
                  if(this.sobj.getMyEquipObj().user != "")
                  {
                     if(this.gc["hero" + this.who].userType != this.sobj.getMyEquipObj().user)
                     {
                        this.threebtn["bzb"].gotoAndStop(2);
                        this.threebtn["bzb"].removeEventListener(MouseEvent.CLICK,this.zbClick);
                     }
                  }
               }
               else if(this.which == 2 || this.which == 4)
               {
                  this.removeThreebtn();
                  this.threebtn = AUtils.getNewObj("simplebtn");
                  this.threebtn.name = this.sobj.getMyEquipObj().getFillName();
                  this.threebtn.x = 25;
                  this.threebtn.y = 25;
                  this.addChild(this.threebtn);
                  this.threebtn["buse"].addEventListener(MouseEvent.CLICK,this.useClick);
                  this.threebtn["bthrow"].addEventListener(MouseEvent.CLICK,this.throwClick);
                  this.threebtn["bthrow"].gotoAndStop(1);
                  this.threebtn["bgy"].addEventListener(MouseEvent.CLICK,this.gyClick);
                  if(this.gc.playNum == 1)
                  {
                     this.threebtn["bgy"].gotoAndStop(2);
                     this.threebtn["bgy"].removeEventListener(MouseEvent.CLICK,this.gyClick);
                  }
                  if(!(this.sobj.getMyEquipObj().getFillName() == "lwyp" || this.sobj.getMyEquipObj().getFillName() == "css24" || this.sobj.getMyEquipObj().getFillName() == "css_4" || this.sobj.getMyEquipObj().getFillName() == "yll" || this.sobj.getMyEquipObj().getFillName() == "jtl" || this.sobj.getMyEquipObj().getFillName() == "zylhys" || this.sobj.getMyEquipObj().getFillName() == "mpyj" || this.sobj.getMyEquipObj().getFillName() == "wpcsd" || this.sobj.getMyEquipObj().getFillName() == "wphhd" || this.sobj.getMyEquipObj().getFillName() == "css6" || this.sobj.getMyEquipObj().getFillName() == "css12" || this.sobj.getMyEquipObj().getFillName() == "css18" || this.sobj.getMyEquipObj().getFillName() == "wplvdyl" || this.sobj.getMyEquipObj().getFillName().indexOf("wpsmd") != -1 || this.sobj.getMyEquipObj().getFillName() == "sbjyd" || this.sobj.getMyEquipObj().getFillName() == "jyys" || this.sobj.getMyEquipObj().getFillName() == "css_2" || this.sobj.getMyEquipObj().getFillName() == "css_3" || this.sobj.getMyEquipObj()
                  .getFillName() == "cwjnxld" || this.sobj.getMyEquipObj().getFillName() == "cwzzxld" || this.sobj.getMyEquipObj().getFillName().indexOf("jns") != -1 || this.sobj.getMyEquipObj().getFillName() == "wphtd" || this.sobj.getMyEquipObj().getFillName() == "jyd3" || this.sobj.getMyEquipObj().getFillName() == "djyys" || this.sobj.getMyEquipObj().getFillName() == "xjyys" || this.sobj.getMyEquipObj().getFillName() == "lhys" || this.sobj.getMyEquipObj().getFillName() == "ghyb" || this.sobj.getMyEquipObj().getFillName() == "nianjhd" || this.sobj.getMyEquipObj().getFillName() == "nianjhd" || this.sobj.getMyEquipObj().getFillName() == "bx" || this.sobj.getMyEquipObj().getFillName() == "wwdgl"))
                  {
                     this.threebtn["buse"].gotoAndStop(2);
                     this.threebtn["buse"].removeEventListener(MouseEvent.CLICK,this.useClick);
                  }
                  else
                  {
                     this.threebtn["buse"].gotoAndStop(1);
                  }
               }
            }
            else if(this.parent.parent.parent is StrengthEquipment)
            {
               if(this.sobj.getMyEquipObj().getFillName().indexOf("jns") != -1)
               {
                  return;
               }
               this.gc.eventManger.dispatchEvent(new CommonEvent("SimpleClick",[this.sobj]));
            }
            else if(this.parent.parent.parent is WareHouse)
            {
               if(this.sobj.getMyEquipObj().getFillName().indexOf("jns") != -1)
               {
                  return;
               }
               if(this.sobj.getMyEquipObj().getFillName() == "clj" || this.sobj.getMyEquipObj().getFillName() == "psdclj")
               {
                  this.gc.ts.setTxt("该装备不能放入仓库！");
                  this.gc.stage.addChild(this.gc.ts);
                  return;
               }
               if(this.sobj.getMyEquipObj().type == "zbtx")
               {
                  this.gc.ts.setTxt("该装备不能在仓库操作！");
                  this.gc.stage.addChild(this.gc.ts);
                  return;
               }
               _loc2_ = "";
               if(this.parent.parent is BackPackElement)
               {
                  _loc2_ = "BackPackElement";
               }
               else if(this.parent.parent is WareHouseElement)
               {
                  _loc2_ = "WareHouseElement";
               }
               WareHouse(this.parent.parent.parent).operatingPack(_loc2_,this.sobj.getMyEquipObj());
               if(_loc2_ == "BackPackElement")
               {
                  this.removeSobj();
                  this.setTxt(null);
               }
            }
         }
      }
      
      private function throwClick(param1:MouseEvent) : void
      {
         this.removeThreebtn();
         this.removeSobj();
         this.setTxt(null);
      }
      
      private function zbClick(param1:MouseEvent) : *
      {
         if(param1.currentTarget.currentFrame == 3)
         {
            if(this.parent.parent.parent is BackPack)
            {
               trrace(this.sobj.getMyEquipObj().ename);
               BackPack(this.parent.parent.parent).addRenewalseMask(this.sobj.getMyEquipObj(),this.sobj.getMyEquipObj().ename);
            }
         }
         else
         {
            this.usezb();
         }
         this.removeThreebtn();
      }
      
      private function gyClick(param1:MouseEvent) : *
      {
         if(this.sobj.getMyEquipObj().getFillName() == "clj" || this.sobj.getMyEquipObj().getFillName() == "psdclj")
         {
            this.gc.ts.setTxt("该装备不能赠送");
            this.gc.stage.addChild(this.gc.ts);
         }
         else
         {
            if(this.who == 1)
            {
               if(this.sobj.getMyEquipObj().type == "zbsz" || this.sobj.getMyEquipObj().type == "zbcb")
               {
                  this.gc.player2.szlist.push(this.sobj.getMyEquipObj());
               }
               else if(this.sobj.getMyEquipObj().type == "zbwp" || this.sobj.getMyEquipObj().type == "wpqhs")
               {
                  this.gc.putQhsInBackPack(this.gc.player2,this.sobj.getMyEquipObj().getFillName(),this.sobj.getMyEquipObj().getENum());
               }
               else
               {
                  this.gc.player2.zblist.push(this.sobj.getMyEquipObj());
               }
            }
            else if(this.who == 2)
            {
               if(this.sobj.getMyEquipObj().type == "zbsz" || this.sobj.getMyEquipObj().type == "zbcb")
               {
                  this.gc.player1.szlist.push(this.sobj.getMyEquipObj());
               }
               else if(this.sobj.getMyEquipObj().type == "zbwp" || this.sobj.getMyEquipObj().type == "wpqhs")
               {
                  this.gc.putQhsInBackPack(this.gc.player1,this.sobj.getMyEquipObj().getFillName(),this.sobj.getMyEquipObj().getENum());
               }
               else
               {
                  this.gc.player1.zblist.push(this.sobj.getMyEquipObj());
               }
            }
            this.removeSobj();
         }
         this.removeThreebtn();
         this.setTxt(null);
      }
      
      private function mdClick(param1:MouseEvent) : *
      {
         if(this.parent.parent.parent is BackPack)
         {
            User(this.gc["player" + this.who]).setLhValue(User(this.gc["player" + this.who]).getLhValue() + this.sobj.getMyEquipObj().getValue());
            BackPack(this.parent.parent.parent).setInfoTxt();
         }
         this.removeThreebtn();
         this.removeSobj();
      }
      
      private function useClick(param1:MouseEvent) : void
      {
         var _loc2_:* = null;
         var _loc3_:* = null;
         var _loc4_:* = null;
         var _loc5_:int = 0;
         var _loc6_:* = null;
         var _loc7_:* = null;
         var _loc8_:Sprite = param1.currentTarget.parent as Sprite;
         var _loc9_:Boolean = true;
         var _loc10_:Boolean = false;
         var _loc11_:User = User(this.gc["player" + this.who]);
         if(_loc8_.name == "mpyj")
         {
            _loc9_ = false;
            this.addRenewalseMask("确定要遗忘技能？技能升级消耗的灵魂会返还");
         }
         if(_loc8_.name == "yll")
         {
            if(this.gc.curBigStage < 4)
            {
               this.gc.ts.setTxt("请先通过凌霄宝殿的考验！");
               this.gc.stage.addChild(this.gc.ts);
               return;
            }
            this.gc.curStage = 99;
            this.gc.curLevel = 1;
            this.gc.eventManger.dispatchEvent(new CommonEvent("closeBackpack"));
            MainGame.getInstance().destroyGame();
            this.gc.eventManger.dispatchEvent(new Event("ReStart"));
         }
         else if(_loc8_.name == "jtl")
         {
            if(this.gc.curBigStage < 21)
            {
               this.gc.ts.setTxt("请先通过凌霄宝殿的考验！");
               this.gc.stage.addChild(this.gc.ts);
               return;
            }
            this.gc.curStage = 60;
            this.gc.curLevel = 1;
            this.gc.eventManger.dispatchEvent(new CommonEvent("closeBackpack"));
            MainGame.getInstance().destroyGame();
            this.gc.eventManger.dispatchEvent(new Event("ReStart"));
         }
         else if(_loc8_.name == "lwyp")
         {
            this.gc.isLWYP = true;
            this.gc.ts.setTxt("效果已生效，离开关卡后或进入新关卡时失效");
            this.gc.stage.addChild(this.gc.ts);
         }
         else if(_loc8_.name == "wphhd")
         {
            if(_loc11_.findCurrentPet(true))
            {
               _loc11_.findCurrentPet(true).reSetPetState();
               BaseHero(this.gc["hero" + this.who]).changePet();
            }
         }
         else if(_loc8_.name == "wpcsd")
         {
            _loc11_.findCurrentPet(true).setlifetime(_loc11_.findCurrentPet(true).getlifetime() + 20);
            if(_loc11_.findCurrentPet(true).getlifetime() > 100)
            {
               _loc11_.findCurrentPet(true).setlifetime(100);
            }
         }
         else
         {
            if(_loc8_.name.indexOf("jns") != -1)
            {
               this.gc.ts.setTxt("技能书不再有用,故而不能使用");
               this.gc.stage.addChild(this.gc.ts);
               return;
            }
            if(_loc8_.name == "css6")
            {
               if(this.gc.curStage != 8)
               {
                  this.gc.ts.setTxt("必须在玲珑宝塔中使用！");
                  this.gc.stage.addChild(this.gc.ts);
                  return;
               }
               if(this.gc.pWorld.getBaseLevelListener() is StageListener81)
               {
                  StageListener81(this.gc.pWorld.getBaseLevelListener()).gotoLevel(6);
               }
            }
            else if(_loc8_.name == "css12")
            {
               if(this.gc.curStage != 8)
               {
                  this.gc.ts.setTxt("必须在玲珑宝塔中使用！");
                  this.gc.stage.addChild(this.gc.ts);
                  return;
               }
               if(this.gc.pWorld.getBaseLevelListener() is StageListener81)
               {
                  StageListener81(this.gc.pWorld.getBaseLevelListener()).gotoLevel(12);
               }
            }
            else if(_loc8_.name == "css18")
            {
               if(this.gc.curStage != 8)
               {
                  this.gc.ts.setTxt("必须在玲珑宝塔中使用！");
                  this.gc.stage.addChild(this.gc.ts);
                  return;
               }
               if(this.gc.pWorld.getBaseLevelListener() is StageListener81)
               {
                  StageListener81(this.gc.pWorld.getBaseLevelListener()).gotoLevel(18);
               }
            }
            else if(_loc8_.name == "css24")
            {
               if(this.gc.curStage != 8)
               {
                  this.gc.ts.setTxt("必须在玲珑宝塔中使用！");
                  this.gc.stage.addChild(this.gc.ts);
                  return;
               }
               if(this.gc.pWorld.getBaseLevelListener() is StageListener81)
               {
                  StageListener81(this.gc.pWorld.getBaseLevelListener()).gotoLevel(24);
               }
            }
            else if(_loc8_.name == "wplvdyl")
            {
               if(this.gc.curLevel >= 7 && this.gc.curStage == 10)
               {
                  this.gc.ts.setTxt("该关卡无法使用！");
                  this.gc.stage.addChild(this.gc.ts);
                  return;
               }
               if(this.gc.curStage != 10)
               {
                  this.gc.ts.setTxt("必须在水下迷宫中使用！");
                  this.gc.stage.addChild(this.gc.ts);
                  return;
               }
               if(this.gc.pWorld.getBaseLevelListener() is StageListener101)
               {
                  StageListener101(this.gc.pWorld.getBaseLevelListener()).gotoLevel(7);
               }
            }
            else if(_loc8_.name == "sbjyd")
            {
               _loc6_ = this.gc.savedBuff.getBuffByType(SingleSavedBuff.BUFF_EXP_ADD);
               if(_loc6_)
               {
                  this.gc.ts.setTxt("已经存在经验加成效果");
                  this.gc.stage.addChild(this.gc.ts);
                  return;
               }
               this.gc.savedBuff.addBuff(SingleSavedBuff.BUFF_EXP_ADD,2,3600 * Number(this.gc.frameClips));
               this.gc.ts.setTxt("双倍经验生效");
               this.gc.stage.addChild(this.gc.ts);
            }
            else if(_loc8_.name == "jyd3")
            {
               _loc6_ = this.gc.savedBuff.getBuffByType(SingleSavedBuff.BUFF_EXP_ADD);
               if(_loc6_)
               {
                  this.gc.ts.setTxt("已经存在经验加成效果");
                  this.gc.stage.addChild(this.gc.ts);
                  return;
               }
               this.gc.savedBuff.addBuff(SingleSavedBuff.BUFF_EXP_ADD,3,3600 * Number(this.gc.frameClips));
               this.gc.ts.setTxt("三倍经验生效");
               this.gc.stage.addChild(this.gc.ts);
            }
            else if(_loc8_.name == "xjyys")
            {
               _loc7_ = this.gc["hero" + this.who] as BaseHero;
               _loc7_.roleProperies.dispatchEvent(new CommonEvent("AddExper",[2500]));
               this.gc.ts.setTxt("增加经验2500点");
               this.gc.stage.addChild(this.gc.ts);
            }
            else if(_loc8_.name == "lhys")
            {
               this.gc["player" + this.who].setLhValue(this.gc["player" + this.who].getLhValue() + 3800);
               BackPack(this.parent.parent.parent).setInfoTxt();
               this.gc.ts.setTxt("增加3800灵魂");
               this.gc.stage.addChild(this.gc.ts);
            }
            else if(_loc8_.name == "zylhys")
            {
               this.gc["player" + this.who].setLhValue(this.gc["player" + this.who].getLhValue() + 114514);
               BackPack(this.parent.parent.parent).setInfoTxt();
               this.gc.ts.setTxt("增加114514灵魂");
               this.gc.stage.addChild(this.gc.ts);
            }
            else if(_loc8_.name == "jyys")
            {
               _loc7_ = this.gc["hero" + this.who] as BaseHero;
               _loc7_.roleProperies.dispatchEvent(new CommonEvent("AddExper",[10000]));
               this.gc.ts.setTxt("增加经验10000点");
               this.gc.stage.addChild(this.gc.ts);
            }
            else if(_loc8_.name == "djyys")
            {
               if(User(this.gc["player" + this.who]).findCurrentPet(true) == null)
               {
                  this.gc.ts.setTxt("你还没有出战的宠物");
                  this.gc.stage.addChild(this.gc.ts);
                  return;
               }
               _loc7_ = this.gc["hero" + this.who] as BaseHero;
               _loc10_ = true;
               _loc7_.getPet().petInfo.setCurExper(_loc7_.getPet().petInfo.getCurExper() + 30000);
               this.gc.ts.setTxt("宠物增加经验30000点");
               this.gc.stage.addChild(this.gc.ts);
            }
            else if(_loc8_.name == "css_2")
            {
               if(this.gc.curStage != 12)
               {
                  this.gc.ts.setTxt("必须在兜率宫中使用！");
                  this.gc.stage.addChild(this.gc.ts);
                  return;
               }
               this.gc.curLevel = 3;
            }
            else if(_loc8_.name == "css_3")
            {
               if(this.gc.curStage != 12)
               {
                  this.gc.ts.setTxt("必须在兜率宫中使用！");
                  this.gc.stage.addChild(this.gc.ts);
                  return;
               }
               this.gc.curLevel = 4;
            }
            else if(_loc8_.name == "css_4")
            {
               if(this.gc.curStage != 12)
               {
                  this.gc.ts.setTxt("必须在兜率宫中使用！");
                  this.gc.stage.addChild(this.gc.ts);
                  return;
               }
               this.gc.curLevel = 5;
            }
            else if(_loc8_.name == "cwzzxld")
            {
               if(User(this.gc["player" + this.who]).findCurrentPet(true) == null)
               {
                  this.gc.ts.setTxt("你还没有出战的宠物");
                  this.gc.stage.addChild(this.gc.ts);
                  return;
               }
               User(this.gc["player" + this.who]).findCurrentPet(true).refreshTherrAttributeByImmortality();
               _loc10_ = true;
            }
            else if(_loc8_.name == "cwjnxld")
            {
               if(User(this.gc["player" + this.who]).findCurrentPet(true) == null)
               {
                  this.gc.ts.setTxt("你还没有出战的宠物");
                  this.gc.stage.addChild(this.gc.ts);
                  return;
               }
               User(this.gc["player" + this.who]).findCurrentPet(true).refreshPetAllSkillByLevel();
               _loc10_ = true;
            }
            else if(_loc8_.name == "wphtd")
            {
               if(User(this.gc["player" + this.who]).findCurrentPet(true) == null)
               {
                  this.gc.ts.setTxt("你还没有出战的宠物");
                  this.gc.stage.addChild(this.gc.ts);
                  return;
               }
               User(this.gc["player" + this.who]).findCurrentPet(true).makePetBecomeChild();
               if(this.gc.hero1)
               {
                  if(this.gc.hero1.getPlayer() == this.gc["player" + this.who])
                  {
                     this.gc.hero1.changePet();
                  }
               }
               if(this.gc.hero2)
               {
                  if(this.gc.hero2.getPlayer() == this.gc["player" + this.who])
                  {
                     this.gc.hero2.changePet();
                  }
               }
               this.gc.eventManger.dispatchEvent(new CommonEvent("CHANGECURRENTPET"));
               _loc10_ = true;
            }
            else if(_loc8_.name == "nianqld")
            {
               if(User(this.gc["player" + this.who]).findCurrentPet(true) == null)
               {
                  this.gc.ts.setTxt("你还没有出战的宠物");
                  this.gc.stage.addChild(this.gc.ts);
                  return;
               }
               User(this.gc["player" + this.who]).findCurrentPet(true).setpotential(User(this.gc["player" + this.who]).findCurrentPet(true).getpotential() + 100);
               _loc10_ = true;
            }
            else if(_loc8_.name == "nianjhd")
            {
               if(User(this.gc["player" + this.who]).findCurrentPet(true) == null)
               {
                  this.gc.ts.setTxt("你还没有出战的宠物");
                  this.gc.stage.addChild(this.gc.ts);
                  return;
               }
               if(User(this.gc["player" + this.who]).findCurrentPet(true).getCurPetState() == 4)
               {
                  this.gc.ts.setTxt("该宠物已经是第二形态");
                  this.gc.stage.addChild(this.gc.ts);
                  return;
               }
               User(this.gc["player" + this.who]).findCurrentPet(true).theFourShape(true);
               _loc10_ = true;
            }
            else if(_loc8_.name == "bx")
            {
               this.gc.allEquip.reNewAll();
               if(User(this.gc["player" + this.who]).roleid == 1)
               {
                  if(Math.random() < 0.5)
                  {
                     this.gc.putQhsInBackPack(this.gc["player" + this.who],"ryjgbzzs",1);
                  }
                  else
                  {
                     this.gc.putQhsInBackPack(this.gc["player" + this.who],"dszkzzs",1);
                  }
               }
               else if(User(this.gc["player" + this.who]).roleid == 2)
               {
                  if(Math.random() < 0.5)
                  {
                     this.gc.putQhsInBackPack(this.gc["player" + this.who],"lhzzzs",1);
                  }
                  else
                  {
                     this.gc.putQhsInBackPack(this.gc["player" + this.who],"jljszzs",1);
                  }
               }
               else if(User(this.gc["player" + this.who]).roleid == 3)
               {
                  if(Math.random() < 0.5)
                  {
                     this.gc.putQhsInBackPack(this.gc["player" + this.who],"jcdpzzs",1);
                  }
                  else
                  {
                     this.gc.putQhsInBackPack(this.gc["player" + this.who],"tpzyzzs",1);
                  }
               }
               else if(User(this.gc["player" + this.who]).roleid == 4)
               {
                  if(Math.random() < 0.6)
                  {
                     if(Math.random() < 0.5)
                     {
                        this.gc.putQhsInBackPack(this.gc["player" + this.who],"mdflczzs",1);
                     }
                     else
                     {
                        this.gc.putQhsInBackPack(this.gc["player" + this.who],"mdcqgzzs",1);
                     }
                  }
                  else
                  {
                     this.gc.putQhsInBackPack(this.gc["player" + this.who],"mdyszzs",1);
                  }
               }
               else if(User(this.gc["player" + this.who]).roleid == 5)
               {
                  if(Math.random() < 0.5)
                  {
                     this.gc.putQhsInBackPack(this.gc["player" + this.who],"xhmlpzzs",1);
                  }
                  else
                  {
                     this.gc.putQhsInBackPack(this.gc["player" + this.who],"xhjxjzzs",1);
                  }
               }
            }
            else if(_loc8_.name == "wwdgl")
            {
               if(BaseHero(this.gc["hero" + this.who]).getPlayer().getCurLevel() < 20)
               {
                  this.gc.ts.setTxt("汪汪低等级不太好打，先到别处玩玩到20级再来打吧！");
                  this.gc.stage.addChild(this.gc.ts);
                  return;
               }
               if(this.gc.curStage == 1 && this.gc.curLevel == 1)
               {
                  this.gc.ts.setTxt("汪汪被削得这么惨还在这里打？换个地方吧");
                  this.gc.stage.addChild(this.gc.ts);
                  return;
               }
               MainGame.getInstance().createMonster(1111,this.gc["hero" + this.who].x,300);
               this.gc.pWorld.getBaseLevelListener().waitForRegisterDataArray.push("Monster1111");
               this.gc.pWorld.getBaseLevelListener().waitForRegisterDataArrayClone.push("Monster1111");
               this.gc.pWorld.getBaseLevelListener().registerData(false);
            }
         }
         this.removeThreebtn();
         if(_loc9_)
         {
            this.removeDaoJuSobj();
         }
         if(_loc10_)
         {
            if(this.gc.isHideDebug)
            {
               this.gc.memory.setStorage(this.gc.saveId);
            }
         }
         if(_loc8_.name == "css_2" || _loc8_.name == "css_3" || _loc8_.name == "css_4")
         {
            this.gc.eventManger.dispatchEvent(new Event("USETRANSFERSTONE"));
         }
      }
      
      public function removeDaoJuSobj() : void
      {
         var _loc1_:* = null;
         var _loc2_:int = 0;
         if(this.sobj.getMyEquipObj().getENum() > 1)
         {
            if(!this.gc.isHideDebug)
            {
            }
            this.sobj.getMyEquipObj().setNum(-1);
         }
         else
         {
            this.sobj.removeEventListener(MouseEvent.CLICK,this.clickHandler);
            this.removeChild(this.sobj);
            _loc1_ = this.sobj.getMyEquipObj();
            if(this.which == 2)
            {
               if(!this.gc.isHideDebug)
               {
               }
               _loc2_ = int(this.gc["player" + this.who].djlist.indexOf(_loc1_));
               this.gc["player" + this.who].djlist.splice(_loc2_,1);
            }
            else
            {
               _loc2_ = int(this.gc["player" + this.who].jnslist.indexOf(_loc1_));
               this.gc["player" + this.who].jnslist.splice(_loc2_,1);
            }
            _loc1_ = null;
            this.sobj = null;
         }
         this.setTxt(null);
      }
      
      private function doSendAction() : void
      {
         var _loc1_:* = null;
         if(this.gc.findOneTimeGoodsByFillName(this.sobj.getMyEquipObj().getFillName()))
         {
            _loc1_ = new Array();
            if(this.sobj.getMyEquipObj().getShopAttribtue() >= 1)
            {
               this.sobj.getMyEquipObj().setShopAttribute(this.sobj.getMyEquipObj().getShopAttribtue() - 1);
               _loc1_.push(FinancialInfo.getItemIdByName(this.sobj.getMyEquipObj().getFillName(),0));
               _loc1_.push(0);
               _loc1_.push(1);
            }
            else
            {
               _loc1_.push(FinancialInfo.getItemIdByName(this.sobj.getMyEquipObj().getFillName(),1));
               _loc1_.push(0);
               _loc1_.push(1);
            }
            FinancialInfo.sendInfoToFinancialServer(this.gc.logInfo.uid,[_loc1_],this.gc.getTimeStamp());
         }
      }
      
      public function removeThreebtn() : void
      {
         if(Boolean(this.threebtn) && contains(this.threebtn))
         {
            if(this.threebtn["bzb"])
            {
               this.threebtn["bzb"].removeEventListener(MouseEvent.CLICK,this.zbClick);
            }
            if(this.threebtn["bgy"])
            {
               this.threebtn["bgy"].removeEventListener(MouseEvent.CLICK,this.gyClick);
            }
            if(this.threebtn["bmd"])
            {
               this.threebtn["bmd"].removeEventListener(MouseEvent.CLICK,this.mdClick);
            }
            if(this.threebtn["buse"])
            {
               this.threebtn["buse"].removeEventListener(MouseEvent.CLICK,this.useClick);
            }
            if(this.threebtn["bthrow"])
            {
               this.threebtn["bthrow"].removeEventListener(MouseEvent.CLICK,this.throwClick);
            }
            this.removeChild(this.threebtn);
            this.threebtn = null;
         }
      }
      
      public function removeSobjAndNotPutInBack() : void
      {
         if(this.sobj)
         {
            this.sobj.removeEventListener(MouseEvent.CLICK,this.clickHandler);
            this.removeChild(this.sobj);
            this.sobj = null;
         }
      }
      
      public function getSobj() : ShowObj
      {
         return this.sobj;
      }
      
      private function usezb() : void
      {
         var _loc1_:* = null;
         var _loc2_:* = null;
         if(this.parent.parent.parent is BackPack)
         {
            _loc1_ = this.sobj.getMyEquipObj();
            _loc2_ = this.gc.allEquip.findByName(_loc1_.getFillName());
            if(_loc2_.type != _loc1_.type)
            {
               this.gc.ts.setTxt("装备类型不符合");
               this.gc.stage.addChild(this.gc.ts);
               return;
            }
            if(_loc1_.type == "zbfb")
            {
               if(Boolean(BaseHero(this.gc["hero" + this.who])) && Boolean(BaseHero(this.gc["hero" + this.who]).getCurMagicWeapon()) && Boolean(BaseHero(this.gc["hero" + this.who]).getCurMagicWeapon().isUsing()))
               {
                  this.gc.ts.setTxt("当前法宝正在使用");
                  this.gc.stage.addChild(this.gc.ts);
               }
               else
               {
                  this.removeSobj();
                  BackPack(this.parent.parent.parent).equip(_loc1_.type,_loc1_);
               }
            }
            else
            {
               this.removeSobj();
               BackPack(this.parent.parent.parent).equip(_loc1_.type,_loc1_);
            }
         }
         else
         {
            Debug.trace("not in BackPack");
         }
      }
   }
}

