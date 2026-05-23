package export.strength
{
   import base.BaseHero;
   import config.*;
   import flash.display.*;
   import flash.events.*;
   import flash.text.TextField;
   import flash.utils.*;
   import my.*;
   
   public class SutraInterface extends Sprite
   {
      
      public var resetbtn:SimpleButton;
      
      public var txt_fbname:TextField;
      
      public var txt_fbdj:TextField;
      
      public var txt_fbczl:TextField;
      
      public var txt_fbwx:TextField;
      
      public var txt_fbatk:TextField;
      
      public var txt_fbdef:TextField;
      
      public var txt_fbhx:TextField;
      
      public var txt_fbhl:TextField;
      
      public var txt_fblh:TextField;
      
      public var btn_sj:SimpleButton;
      
      public var btn_close:SimpleButton;
      
      public var lhmc:MovieClip;
      
      public var showmc:MovieClip;
      
      public var introducemc:MovieClip;
      
      private var currentSura:MyEquipObj;
      
      private var oldEquip:MyEquipObj;
      
      private var hero:BaseHero;
      
      private var gc:Config;
      
      public function SutraInterface()
      {
         super();
         this.gc = Config.getInstance();
         this.addEventListener(Event.ADDED_TO_STAGE,this.added,false,0,true);
         this.addEventListener(Event.REMOVED_FROM_STAGE,this.removed,false,0,true);
      }
      
      public function setRole(param1:BaseHero) : void
      {
         this.hero = param1;
         this.currentSura = this.hero.getPlayer().getCurEquipByType("zbfb");
         if(this.currentSura)
         {
            this.oldEquip = this.currentSura;
            this.showmc.gotoAndStop(this.currentSura.ename);
            this.introducemc.gotoAndStop(this.currentSura.ename);
            this.setTxt();
         }
      }
      
      private function added(param1:Event) : void
      {
         this.btn_close.addEventListener(MouseEvent.CLICK,this.close);
         this.resetbtn.addEventListener(MouseEvent.CLICK,this.refreshWX);
         this.btn_sj.addEventListener(MouseEvent.CLICK,this.sjMethod);
         this.gc.eventManger.addEventListener("closefb",this.close);
         MainGame.getInstance().stopGame();
      }
      
      private function removed(param1:Event) : void
      {
         this.btn_close.removeEventListener(MouseEvent.CLICK,this.close);
         this.resetbtn.removeEventListener(MouseEvent.CLICK,this.refreshWX);
         this.btn_sj.removeEventListener(MouseEvent.CLICK,this.sjMethod);
         this.gc.eventManger.removeEventListener("closefb",this.close);
         this.hero = null;
      }
      
      private function setTxt() : void
      {
         if(this.currentSura)
         {
            this.lhmc.gotoAndStop(int(this.hero.getPlayer().getLhValue() / (this.getNextGradeLHValue(this.currentSura.getELevel()) + 1) * 50));
            this.txt_fblh.text = int(this.hero.getPlayer().getLhValue()) + "/" + this.getNextGradeLHValue(this.currentSura.getELevel());
            this.txt_fbname.text = this.currentSura.ename;
            this.txt_fbdj.text = this.currentSura.getELevel() + "";
            this.txt_fbczl.text = this.currentSura.getEUpdata() + "";
            this.txt_fbwx.text = this.currentSura.getWX();
            this.txt_fbatk.text = int(this.currentSura.geteatt()) + "";
            this.txt_fbdef.text = int(this.currentSura.getedef()) + "";
            this.txt_fbhx.text = int(this.currentSura.getehp()) + "";
            this.txt_fbhl.text = int(this.currentSura.getemp()) + "";
         }
      }
      
      private function close(param1:Event) : void
      {
         this.hero.roleProperies.removeEquip2(this.oldEquip);
         this.hero.roleProperies.addEquip(this.currentSura);
         this.hero.getPlayer().setCurrentByType("zbfb",this.currentSura);
         MainGame.getInstance().continueGame();
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
      }
      
      private function sjMethod(param1:Event) : void
      {
         var _loc2_:* = undefined;
         var _loc3_:* = undefined;
         var _loc4_:int = 0;
         var _loc5_:* = null;
         if(this.currentSura)
         {
            if(this.currentSura.getFillName() == "zsTimer")
            {
               if(this.currentSura.getELevel() < 10)
               {
                  this.upDataZSJL();
                  return;
               }
               this.gc.alert("已达最高等级");
               return;
            }
            if(this.currentSura.getFillName() == "mdhf")
            {
               if(this.currentSura.getELevel() < 10)
               {
                  this.upDataGod();
                  return;
               }
               this.gc.alert("已达最高等级");
               return;
            }
            if(this.currentSura.getFillName() == "jyhl")
            {
               if(this.currentSura.getELevel() < 10)
               {
                  this.upDataGod();
                  return;
               }
               this.gc.alert("已达最高等级");
               return;
            }
            if(this.currentSura.getFillName() == "tjbg")
            {
               if(this.currentSura.getELevel() < 9)
               {
                  this.upDataGod();
                  return;
               }
               this.gc.alert("已达最高等级");
               return;
            }
            if(this.currentSura.getFillName() == "fbqpj")
            {
               if(this.currentSura.getELevel() < 9)
               {
                  this.upDataQPJ();
                  return;
               }
               this.gc.alert("已达最高等级");
               return;
            }
            if(this.currentSura.getFillName() == "stlp")
            {
               if(this.currentSura.getELevel() >= 10)
               {
                  this.gc.alert("已达最高等级");
                  return;
               }
            }
            if(this.currentSura.getFillName() == "xhmt")
            {
               if(this.currentSura.getELevel() >= 10)
               {
                  this.gc.alert("已达最高等级");
                  return;
               }
            }
            _loc4_ = int(this.getNextGradeLHValue(this.currentSura.getELevel()));
            if(this.currentSura.getELevel() < 10)
            {
               if(this.hero.getPlayer().getLhValue() >= _loc4_)
               {
                  this.hero.roleProperies.removeEquip2(this.currentSura);
                  _loc5_ = this.currentSura.getGrowthByName(this.currentSura.getFillName());
                  this.currentSura.growth(_loc5_,true);
                  this.hero.getPlayer().setLhValue(this.hero.getPlayer().getLhValue() - _loc4_);
                  this.setTxt();
                  this.hero.roleProperies.addEquip(this.currentSura);
               }
               else
               {
                  this.gc.ts.setTxt("灵魂不足");
                  this.gc.stage.addChild(this.gc.ts);
               }
            }
            else if(this.currentSura.getELevel() >= 10 && this.currentSura.getELevel() < 15)
            {
               _loc2_ = this.getNextGradeZZValue(this.currentSura.getELevel() - 9);
               _loc3_ = AUtils.getNewObj("updataFBWithLvdyl");
               _loc3_.name = "updataFBWithLvdyl";
               _loc3_["txt"].text = "您确定将法宝升级到" + (this.currentSura.getELevel() + 1) + "级，消耗" + _loc2_ + "龙女的眼泪";
               _loc3_["okbtn"].addEventListener(MouseEvent.CLICK,this.uokClick);
               _loc3_["nobtn"].addEventListener(MouseEvent.CLICK,this.unoClick);
               this.addChild(_loc3_);
            }
            else
            {
               this.gc.alert("已达最高等级");
            }
         }
      }
      
      private function upDataZSJL() : void
      {
         var _loc1_:Sprite = AUtils.getNewObj("renewalseThisSZ");
         _loc1_.name = "updataFBWithLvdyl";
         _loc1_["txt"].text = "";
         var _loc2_:Object = this.getNextGradeZSJLValue(this.currentSura.getELevel() + 1);
         _loc1_["txt"].text = "您确定将法宝升级到" + (this.currentSura.getELevel() + 1) + "级，消耗" + _loc2_.num + "个" + _loc2_.cname;
         if(_loc1_["txt"].text != "")
         {
            _loc1_["okbtn"].addEventListener("click",this.ZSJLspecialUokClick);
            _loc1_["nobtn"].addEventListener("click",this.unoClick);
            this.addChild(_loc1_);
         }
      }
      
      private function upDataQPJ() : void
      {
         var _loc4_:int = 0;
         var _loc2_:* = undefined;
         var _loc3_:Object = null;
         if(this.currentSura.getELevel() < 3)
         {
            _loc4_ = int(this.getNextGradeLHValue(this.currentSura.getELevel()));
            if(this.hero.getPlayer().getLhValue() >= _loc4_)
            {
               this.hero.roleProperies.removeEquip2(this.currentSura);
               _loc5_ = this.currentSura.getGrowthByName(this.currentSura.getFillName());
               this.currentSura.growth(_loc5_,true);
               this.hero.getPlayer().setLhValue(this.hero.getPlayer().getLhValue() - _loc4_);
               this.setTxt();
               this.hero.roleProperies.addEquip(this.currentSura);
            }
            else
            {
               this.gc.ts.setTxt("灵魂不足");
               this.gc.stage.addChild(this.gc.ts);
            }
         }
         else if(this.currentSura.getELevel() >= 3 && this.currentSura.getELevel() < 9)
         {
            _loc2_ = undefined;
            _loc2_ = AUtils.getNewObj("renewalseThisSZ");
            _loc2_.name = "updataFBWithLvdyl";
            _loc2_["txt"].text = "";
            _loc3_ = this.getNextGradeQPJYValue(this.currentSura.getELevel() + 1);
            _loc2_["txt"].text = "您确定将法宝升级到" + (this.currentSura.getELevel() + 1) + "级，消耗" + _loc3_.num + "个" + _loc3_.cname;
            if(_loc2_["txt"].text != "")
            {
               _loc2_["okbtn"].addEventListener("click",this.QPJUokClick);
               _loc2_["nobtn"].addEventListener("click",this.unoClick);
               this.addChild(_loc2_);
            }
         }
      }
      
      private function upDataGod() : void
      {
         var _loc1_:* = undefined;
         _loc1_ = AUtils.getNewObj("renewalseThisSZ");
         _loc1_.name = "updataFBWithLvdyl";
         _loc1_["txt"].text = "";
         var _loc2_:Object = this.getNextGradeKLYValue(this.currentSura.getELevel() + 1);
         _loc1_["txt"].text = "您确定将法宝升级到" + (this.currentSura.getELevel() + 1) + "级，消耗" + _loc2_.num + "个" + _loc2_.cname;
         if(_loc1_["txt"].text != "")
         {
            _loc1_["okbtn"].addEventListener("click",this.specialUokClick);
            _loc1_["nobtn"].addEventListener("click",this.unoClick);
            this.addChild(_loc1_);
         }
      }
      
      private function ZSJLspecialUokClick(param1:MouseEvent) : void
      {
         var _loc2_:* = null;
         this.removeYLupdataMask();
         var _loc3_:Object = this.getNextGradeZSJLValue(this.currentSura.getELevel() + 1);
         if(this.hero.getPlayer().getSomeOneEquipNumberByName(_loc3_.kly) >= _loc3_.num)
         {
            this.hero.roleProperies.removeEquip(this.currentSura);
            _loc2_ = this.currentSura.getGrowthByName(this.currentSura.getFillName());
            this.currentSura.growth(_loc2_);
            this.hero.getPlayer().removeEquipFormBack(_loc3_.kly,2,_loc3_.num);
            this.setTxt();
            this.hero.roleProperies.addEquip(this.currentSura);
         }
         else
         {
            this.gc.ts.setTxt(_loc3_.cname + "数量不够");
            this.gc.stage.addChild(this.gc.ts);
         }
         if(this.introducemc["saymc"])
         {
            if(this.currentSura.getELevel() >= 6)
            {
               this.introducemc["saymc"].gotoAndStop(2);
            }
         }
      }
      
      private function specialUokClick(param1:MouseEvent) : void
      {
         var _loc2_:* = null;
         this.removeYLupdataMask();
         var _loc3_:Object = this.getNextGradeKLYValue(this.currentSura.getELevel() + 1);
         if(this.hero.getPlayer().getSomeOneEquipNumberByName(_loc3_.kly) >= _loc3_.num)
         {
            this.hero.roleProperies.removeEquip(this.currentSura);
            _loc2_ = this.currentSura.getGrowthByName(this.currentSura.getFillName());
            this.currentSura.growth(_loc2_);
            this.hero.getPlayer().removeEquipFormBack(_loc3_.kly,2,_loc3_.num);
            this.setTxt();
            this.hero.roleProperies.addEquip(this.currentSura);
         }
         else
         {
            this.gc.ts.setTxt(_loc3_.cname + "数量不够");
            this.gc.stage.addChild(this.gc.ts);
         }
         if(this.introducemc["saymc"])
         {
            if(this.currentSura.getELevel() >= 6)
            {
               this.introducemc["saymc"].gotoAndStop(2);
            }
         }
      }
      
      private function QPJUokClick(param1:MouseEvent) : void
      {
         var _loc2_:* = null;
         this.removeYLupdataMask();
         var _loc3_:Object = this.getNextGradeQPJYValue(this.currentSura.getELevel() + 1);
         if(this.hero.getPlayer().getSomeOneEquipNumberByName(_loc3_.kly) >= _loc3_.num)
         {
            this.hero.roleProperies.removeEquip(this.currentSura);
            _loc2_ = this.currentSura.getGrowthByName(this.currentSura.getFillName());
            this.currentSura.growth(_loc2_);
            this.hero.getPlayer().removeEquipFormBack(_loc3_.kly,2,_loc3_.num);
            this.setTxt();
            this.hero.roleProperies.addEquip(this.currentSura);
         }
         else
         {
            this.gc.ts.setTxt(_loc3_.cname + "数量不够");
            this.gc.stage.addChild(this.gc.ts);
         }
         if(this.introducemc["saymc"])
         {
            if(this.currentSura.getELevel() >= 6)
            {
               this.introducemc["saymc"].gotoAndStop(2);
            }
         }
      }
      
      private function uokClick(param1:MouseEvent) : void
      {
         var _loc2_:* = null;
         this.removeYLupdataMask();
         var _loc3_:int = int(this.getNextGradeZZValue(this.currentSura.getELevel() - 9));
         if(this.hero.getPlayer().getSomeOneEquipNumberByName("wplvdyl") >= _loc3_)
         {
            this.hero.roleProperies.removeEquip(this.currentSura);
            _loc2_ = this.currentSura.getGrowthByName(this.currentSura.getFillName());
            this.currentSura.growth(_loc2_);
            this.hero.getPlayer().removeEquipFormBack("wplvdyl",2,_loc3_);
            this.setTxt();
            this.hero.roleProperies.addEquip(this.currentSura);
         }
         else
         {
            this.gc.alert("龙女的眼泪不够");
         }
      }
      
      private function unoClick(param1:MouseEvent) : void
      {
         this.removeYLupdataMask();
      }
      
      private function removeYLupdataMask() : void
      {
         var _loc1_:Sprite = this.getChildByName("updataFBWithLvdyl") as Sprite;
         _loc1_["okbtn"].removeEventListener("click",this.uokClick);
         _loc1_["nobtn"].removeEventListener("click",this.unoClick);
         if(_loc1_)
         {
            this.removeChild(_loc1_);
         }
      }
      
      private function getNextGradeZSJLValue(param1:int) : Object
      {
         var _loc2_:* = {};
         if(param1 <= 5)
         {
            _loc2_.kly = "zsTimerup1";
            _loc2_.num = param1 - 1;
            _loc2_.cname = "烛时星魄1";
         }
         else if(param1 > 5 && param1 <= 10)
         {
            _loc2_.kly = "zsTimerup2";
            _loc2_.num = Math.ceil((param1 - 5) * 1.5);
            _loc2_.cname = "烛时星魄2";
         }
         return _loc2_;
      }
      
      private function getNextGradeKLYValue(param1:int) : Object
      {
         var _loc2_:* = {};
         var _loc3_:uint = uint(this.currentSura.getFillName() == "tjbg" ? 1 : 0);
         if(param1 <= 5)
         {
            _loc2_.kly = "kly4";
            _loc2_.num = param1 - 1 + _loc3_;
            _loc2_.cname = "4级昆仑玉";
         }
         else if(param1 > 5)
         {
            _loc2_.kly = "kly5";
            _loc2_.num = Math.ceil((param1 - 5 + _loc3_) * 1.5);
            _loc2_.cname = "5级昆仑玉";
         }
         return _loc2_;
      }
      
      private function getNextGradeQPJYValue(param1:int) : Object
      {
         var _loc2_:* = {};
         var _loc3_:uint = uint(this.currentSura.getFillName() == "fbqpj" ? 1 : 0);
         var _loc4_:Array = [1,1,1,3,5,7];
         if(param1 >= 3)
         {
            _loc2_.kly = "qpjy";
            _loc2_.num = _loc4_[param1 - 4];
            _loc2_.cname = "青萍精元";
         }
         else if(param1 < 3)
         {
            _loc2_.kly = "qpjy";
            _loc2_.num = 0;
            _loc2_.cname = "青萍精元";
         }
         return _loc2_;
      }
      
      private function refreshWX(param1:MouseEvent) : void
      {
         var _loc2_:Sprite = AUtils.getNewObj("renewalseThisSZ");
         _loc2_.name = "refreshWX";
         _loc2_["txt"].text = "";
         var _loc3_:int = int(this.hero.getPlayer().getSomeOneEquipNumberByName("wpccfq"));
         _loc2_["txt"].text = "您确定使用3个传承法器重置法宝五行？当前有" + _loc3_ + "个";
         if(_loc2_["txt"].text != "")
         {
            _loc2_["okbtn"].addEventListener("click",this.refreshConfirm);
            _loc2_["nobtn"].addEventListener("click",this.refreskCancel);
            this.addChild(_loc2_);
         }
      }
      
      private function refreshConfirm(param1:MouseEvent) : void
      {
         var _loc2_:int = 0;
         var _loc3_:int = int(this.hero.getPlayer().getSomeOneEquipNumberByName("wpccfq"));
         var _loc4_:* = null;
         var _loc5_:* = 1;
         if(this.currentSura)
         {
            if(_loc3_ < 3)
            {
               this.gc.alert("传承法器数量不够!");
               return;
            }
            _loc2_ = int(this.currentSura.getELevel());
            this.hero.roleProperies.removeEquip2(this.currentSura);
            this.currentSura = this.gc.allEquip.findByName(this.currentSura.getFillName());
            _loc4_ = this.currentSura.getGrowthByName(this.currentSura.getFillName());
            while(_loc5_++ < _loc2_)
            {
               this.currentSura.growth(_loc4_,true);
            }
            this.getChildByName("refreshWX")["okbtn"].removeEventListener(MouseEvent.CLICK,this.refreshConfirm);
            this.getChildByName("refreshWX")["nobtn"].removeEventListener(MouseEvent.CLICK,this.refreskCancel);
            this.setTxt();
            this.hero.roleProperies.addEquip(this.currentSura);
            this.removeChild(getChildByName("refreshWX"));
            this.hero.getPlayer().removeEquipFormBack("wpccfq",2,3);
            return;
         }
         this.gc.alert("当前法宝异常！");
         throw "法宝异常！";
      }
      
      private function refreskCancel(param1:MouseEvent) : void
      {
         this.getChildByName("refreshWX")["okbtn"].removeEventListener(MouseEvent.CLICK,this.refreshConfirm);
         this.getChildByName("refreshWX")["nobtn"].removeEventListener(MouseEvent.CLICK,this.refreskCancel);
         this.removeChild(getChildByName("refreshWX"));
      }
      
      private function getNextGradeLHValue(param1:int) : int
      {
         return param1 * param1 * 1000;
      }
      
      private function getNextGradeZZValue(param1:int) : int
      {
         return param1 * param1 * 3;
      }
   }
}

