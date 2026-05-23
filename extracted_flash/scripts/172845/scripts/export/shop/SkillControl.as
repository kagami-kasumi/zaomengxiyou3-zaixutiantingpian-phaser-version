package export.shop
{
   import config.*;
   import export.*;
   import flash.display.*;
   import flash.events.*;
   import flash.geom.*;
   import flash.text.TextField;
   import manager.*;
   import user.User;
   
   public class SkillControl extends Sprite
   {
      
      private var player:User;
      
      private var gc:Config;
      
      private var whichxf:uint = 1;
      
      public var upGradebtn:SimpleButton;
      
      public var xf1mc:MovieClip;
      
      public var xf2mc:MovieClip;
      
      public var leveltxt1:TextField;
      
      public var leveltxt2:TextField;
      
      public var lhtxt1:TextField;
      
      public var lhtxt2:TextField;
      
      public var xfname1:TextField;
      
      public var xfname2:TextField;
      
      public var mainskillmc:MovieClip;
      
      private var sayinfo:SayInfo;
      
      public function SkillControl(param1:User)
      {
         super();
         this.gc = Config.getInstance();
         this.player = param1;
         this.sayinfo = new SayInfo();
         this.addEventListener("addedToStage",this.added,false,0,true);
         this.addEventListener("removedFromStage",this.removed,false,0,true);
      }
      
      private function added(param1:Event) : void
      {
         this.xf1mc.buttonMode = true;
         this.xf2mc.buttonMode = true;
         this.xf1mc.addEventListener("click",this.firstXFFunc);
         this.xf2mc.addEventListener("click",this.secondXFFunc);
         this.upGradebtn.addEventListener("click",this.upGradeSkillFunc);
         this.xf1mc.dispatchEvent(new MouseEvent("click"));
         this.setXFtxt();
         this.initXFIcon();
      }
      
      private function removed(param1:Event) : void
      {
         this.xf1mc.removeEventListener("click",this.firstXFFunc);
         this.xf2mc.removeEventListener("click",this.secondXFFunc);
         this.upGradebtn.visible = true;
         this.upGradebtn.removeEventListener("click",this.upGradeSkillFunc);
         this.mainskillmc.skillset1.removeEventListener("click",this.skillsetFunc);
         this.mainskillmc.skillset2.removeEventListener("click",this.skillsetFunc);
         this.mainskillmc.skillset3.removeEventListener("click",this.skillsetFunc);
         this.mainskillmc.skillset4.removeEventListener("click",this.skillsetFunc);
         this.mainskillmc.skillset5.removeEventListener("click",this.skillsetFunc);
         this.mainskillmc.upgrade1.removeEventListener("click",this.skillupgradeFunc);
         this.mainskillmc.upgrade2.removeEventListener("click",this.skillupgradeFunc);
         this.mainskillmc.upgrade3.removeEventListener("click",this.skillupgradeFunc);
         this.mainskillmc.upgrade4.removeEventListener("click",this.skillupgradeFunc);
         this.mainskillmc.upgrade5.removeEventListener("click",this.skillupgradeFunc);
         this.mainskillmc["upgrade1"].removeEventListener(MouseEvent.ROLL_OVER,this.mOver);
         this.mainskillmc["upgrade1"].removeEventListener(MouseEvent.ROLL_OUT,this.mOut);
         this.mainskillmc["upgrade2"].removeEventListener(MouseEvent.ROLL_OVER,this.mOver);
         this.mainskillmc["upgrade2"].removeEventListener(MouseEvent.ROLL_OUT,this.mOut);
         this.mainskillmc["upgrade3"].removeEventListener(MouseEvent.ROLL_OVER,this.mOver);
         this.mainskillmc["upgrade3"].removeEventListener(MouseEvent.ROLL_OUT,this.mOut);
         this.mainskillmc["upgrade4"].removeEventListener(MouseEvent.ROLL_OVER,this.mOver);
         this.mainskillmc["upgrade4"].removeEventListener(MouseEvent.ROLL_OUT,this.mOut);
         this.mainskillmc["upgrade5"].removeEventListener(MouseEvent.ROLL_OVER,this.mOver);
         this.mainskillmc["upgrade5"].removeEventListener(MouseEvent.ROLL_OUT,this.mOut);
         if(this.stage.getChildByName("SayInfo"))
         {
            this.stage.removeChild(this.sayinfo);
         }
      }
      
      private function mOver(param1:MouseEvent) : void
      {
         var _loc2_:int = 0;
         var _loc3_:int = 0;
         var _loc4_:Point = new Point();
         _loc2_ = int(String(param1.currentTarget.name).substr(7,1));
         if(this.mainskillmc["skill" + _loc2_].currentFrame == 3)
         {
            sl = this.player.returnSkillIsStudy(this.findSkillNameBySkillBtn(_loc2_)[0]);
            if(this.findSkillNameBySkillBtn(_loc2_)[0] == "sx" || this.findSkillNameBySkillBtn(_loc2_)[0] == "rj")
            {
               _loc3_ = Math.ceil(200 * Math.pow(2560,Math.pow((sl - 1) / 7,0.8)));
            }
            _loc3_ = Math.ceil(200 * Math.pow(2560,Math.pow((sl - 1) / 16,0.8)));
            this.sayinfo.showtxt.text = "升级需要" + _loc3_ + "灵魂";
            _loc4_ = new Point(param1.currentTarget.x,param1.currentTarget.y);
            _loc4_ = param1.currentTarget.parent.localToGlobal(_loc4_);
            this.sayinfo.x = _loc4_.x;
            this.sayinfo.y = _loc4_.y;
            this.sayinfo.name = "SayInfo";
            this.stage.addChild(this.sayinfo);
         }
      }
      
      private function mOut(param1:MouseEvent) : void
      {
         if(this.stage.getChildByName("SayInfo"))
         {
            this.stage.removeChild(this.sayinfo);
         }
      }
      
      private function firstXFFunc(param1:MouseEvent) : void
      {
         this.upGradebtn.x = 136.95;
         this.upGradebtn.y = 191.35;
         this.whichxf = 1;
         this.setSkillMc();
         AUtils.checkLoadOK(this.mainskillmc,this.initStudySkill);
      }
      
      private function secondXFFunc(param1:MouseEvent) : void
      {
         this.upGradebtn.x = 136.95;
         this.upGradebtn.y = 391.35;
         this.whichxf = 2;
         this.setSkillMc();
         AUtils.checkLoadOK(this.mainskillmc,this.initStudySkill);
      }
      
      private function initStudySkill() : void
      {
         var _loc1_:Array = null;
         var _loc2_:int = 0;
         var _loc3_:* = undefined;
         var _loc4_:* = 0;
         var _loc5_:* = null;
         var _loc6_:* = null;
         var _loc7_:* = null;
         var _loc8_:* = null;
         var _loc9_:uint = uint(this.player.isstudyskill[this.whichxf - 1].xflevel);
         _loc2_ = 1;
         var _loc10_:int = 1;
         while(_loc10_ <= 5)
         {
            this.mainskillmc["skill" + _loc10_].gotoAndStop(1);
            _loc10_++;
         }
         while(_loc2_ <= _loc9_)
         {
            this.mainskillmc["skillset" + _loc2_].removeEventListener("click",this.skillsetFunc);
            this.mainskillmc["upgrade" + _loc2_].removeEventListener("click",this.skillupgradeFunc);
            this.mainskillmc["skill" + _loc2_].removeEventListener("click",this.buy);
            this.mainskillmc["skillset" + _loc2_].addEventListener("click",this.skillsetFunc);
            this.mainskillmc["upgrade" + _loc2_].addEventListener("click",this.skillupgradeFunc);
            this.mainskillmc["upgrade" + _loc2_].addEventListener(MouseEvent.ROLL_OVER,this.mOver);
            this.mainskillmc["upgrade" + _loc2_].addEventListener(MouseEvent.ROLL_OUT,this.mOut);
            this.mainskillmc["skill" + _loc2_].addEventListener("click",this.buy);
            this.mainskillmc["skill" + _loc2_].gotoAndStop(2);
            _loc2_++;
         }
         if(this.mainskillmc.getChildByName("BaJieSkillDebugBugWithTemp") != null)
         {
            this.mainskillmc.removeChild(this.mainskillmc.getChildByName("BaJieSkillDebugBugWithTemp"));
         }
         if(this.player.roleid == 3 && this.whichxf == 1)
         {
            _loc3_ = AUtils.getImageObj("ImgBaJieSkillDebugBugWithTemp");
            _loc3_.x = -189.95;
            _loc3_.y = 33.55;
            _loc3_.name = "BaJieSkillDebugBugWithTemp";
            this.mainskillmc.addChild(_loc3_);
         }
         _loc1_ = String(this.player.isstudyskill[this.whichxf - 1].skillName).split("|");
         var _loc11_:uint = _loc1_.length;
         while(_loc11_-- > 0)
         {
            _loc5_ = _loc1_[_loc11_].split("~");
            _loc6_ = this.findSkillBtnBySkillName(_loc5_[0]);
            if(_loc6_ != "")
            {
               this.mainskillmc[_loc6_].removeEventListener("click",this.buy);
               this.mainskillmc[_loc6_].gotoAndStop(3);
               _loc7_ = this.player.getSkillStringBySkillName(_loc5_[0]);
               if(_loc7_[1])
               {
                  _loc4_ = uint(_loc7_[1]);
               }
               else
               {
                  _loc4_ = 1;
               }
               _loc8_ = TextManager.createTextField(235.45,144.35,108.6,19,"right",17);
               _loc8_.text = "LV." + _loc4_;
               _loc8_.x = 35;
               _loc8_.y = 48;
               _loc8_.name = _loc6_;
               if(this.mainskillmc[_loc6_].getChildByName(_loc8_.name))
               {
                  this.mainskillmc[_loc6_].removeChild(this.mainskillmc[_loc6_].getChildByName(_loc8_.name));
                  this.mainskillmc[_loc6_].addChild(_loc8_);
               }
               else
               {
                  this.mainskillmc[_loc6_].addChild(_loc8_);
               }
            }
         }
         if(_loc9_ >= 5)
         {
            this.upGradebtn.visible = false;
         }
         else
         {
            this.upGradebtn.visible = true;
         }
      }
      
      private function upGradeSkillFunc(param1:MouseEvent) : void
      {
         var _loc2_:uint = uint(this.findNextNeedLHValue(this.player.isstudyskill[this.whichxf - 1].xflevel + 1));
         if(this.player.isstudyskill[this.whichxf - 1].xflevel < 5)
         {
            if(this.player.getLhValue() >= _loc2_)
            {
               ++this.player.isstudyskill[this.whichxf - 1].xflevel;
               this.player.setLhValue(Number(this.player.getLhValue()) - _loc2_);
               this.setXFtxt();
               this.initStudySkill();
            }
         }
         this.setXFIcon();
         BuySkill(this.parent).setTxtlh();
      }
      
      private function initXFIcon() : void
      {
         var _loc1_:int = 0;
         _loc1_ = 0;
         while(_loc1_ <= 1)
         {
            this["xf" + (_loc1_ + 1) + "mc"].gotoAndStop(this.player.getRoleName() + "-yes");
            _loc1_++;
         }
      }
      
      private function setXFIcon() : void
      {
         if(this.whichxf == 1)
         {
            this.xf1mc.gotoAndStop(this.player.getRoleName() + "-yes");
         }
         else
         {
            this.xf2mc.gotoAndStop(this.player.getRoleName() + "-yes");
         }
      }
      
      private function skillsetFunc(param1:MouseEvent) : void
      {
         var _loc2_:* = null;
         var _loc3_:* = null;
         var _loc4_:* = null;
         var _loc5_:uint = uint(int(String(param1.currentTarget.name).substr(8,1)));
         if(this.mainskillmc["skill" + _loc5_].currentFrame == 3)
         {
            _loc2_ = this.getChildByName("SkillSetControl") as SkillSetControl;
            if(_loc2_)
            {
               this.removeChild(_loc2_);
            }
            _loc2_ = null;
            _loc3_ = this.findSkillNameBySkillBtn(_loc5_);
            _loc4_ = this.player.getSkillStringBySkillName(_loc3_[0]);
            _loc2_ = new SkillSetControl(this.player,_loc4_,_loc3_[1]);
            _loc2_.name = "SkillSetControl";
            this.addChild(_loc2_);
         }
      }
      
      private function skillupgradeFunc(param1:MouseEvent) : void
      {
         var _loc2_:int = 0;
         var _loc3_:int = 0;
         var _loc4_:* = null;
         var _loc5_:int = 1;
         var _loc6_:uint = uint(int(String(param1.currentTarget.name).substr(7,1)));
         if(this.mainskillmc["skill" + _loc6_].currentFrame == 3)
         {
            _loc4_ = this.findSkillNameBySkillBtn(_loc6_);
            if(_loc4_[0] == "sx" || _loc4_[0] == "rj" || _loc4_[0] == "yyb" || _loc4_[0] == "tjgl" || _loc4_[0] == "myhc" || _loc4_[0] == "sd")
            {
               _loc5_ = int(this.player.returnSkillIsStudy(_loc4_[0]));
               _loc2_ = Math.ceil(200 * Math.pow(2560,Math.pow((_loc5_ - 1) / 7,0.8)));
               _loc3_ = int(this.player.getLhValue());
            }
            else
            {
               _loc5_ = int(this.player.returnSkillIsStudy(_loc4_[0]));
               _loc2_ = Math.ceil(200 * Math.pow(2560,Math.pow((_loc5_ - 1) / 16,0.8)));
               _loc3_ = int(this.player.getLhValue());
            }
            if(_loc4_[0] == "lybj")
            {
               this.gc.ts.setTxt("技能等级已达上限");
               this.stage.addChild(this.gc.ts);
               return;
            }
            if(_loc3_ < _loc2_)
            {
               this.gc.ts.setTxt("灵魂不足");
               this.stage.addChild(this.gc.ts);
            }
            else if(_loc5_ < 18)
            {
               if(_loc4_[0] == "sx" || _loc4_[0] == "rj" || _loc4_[0] == "yyb" || _loc4_[0] == "tjgl" || _loc4_[0] == "myhc" || _loc4_[0] == "sd")
               {
                  if(_loc5_ < 9)
                  {
                     if(Number(this.player.getCurLevel()) / 10 >= _loc5_)
                     {
                        this.player.returnSkillIsInTheSkillAry(_loc4_[0]).slev = _loc5_ + 1;
                        this.player.setSkillLevelInTheAllSkillAry(_loc4_[0],_loc5_ + 1);
                        this.gc.ts.setTxt("技能等级提升");
                        this.stage.addChild(this.gc.ts);
                        this.player.setLhValue(_loc3_ - _loc2_);
                        BuySkill(this.parent).setTxtlh();
                        this.initStudySkill();
                        _loc2_ = Math.ceil(200 * Math.pow(2560,Math.pow(_loc5_ / 7,0.8)));
                        this.sayinfo.showtxt.text = "升级需要" + _loc2_ + "灵魂";
                     }
                     else
                     {
                        this.gc.ts.setTxt("需要" + _loc5_ * 10 + "级才能升级");
                        this.stage.addChild(this.gc.ts);
                     }
                  }
                  else
                  {
                     this.gc.ts.setTxt("技能等级已达上限");
                     this.stage.addChild(this.gc.ts);
                  }
               }
               else if(Number(this.player.getCurLevel()) / 5 >= _loc5_)
               {
                  this.player.returnSkillIsInTheSkillAry(_loc4_[0]).slev = _loc5_ + 1;
                  this.player.setSkillLevelInTheAllSkillAry(_loc4_[0],_loc5_ + 1);
                  this.gc.ts.setTxt("技能等级提升");
                  this.stage.addChild(this.gc.ts);
                  this.player.setLhValue(_loc3_ - _loc2_);
                  BuySkill(this.parent).setTxtlh();
                  this.initStudySkill();
                  _loc2_ = Math.ceil(200 * Math.pow(2560,Math.pow(_loc5_ / 16,0.8)));
                  this.sayinfo.showtxt.text = "升级需要" + _loc2_ + "灵魂";
               }
               else
               {
                  this.gc.ts.setTxt("需要" + _loc5_ * 5 + "级才能升级");
                  this.stage.addChild(this.gc.ts);
               }
            }
            else
            {
               this.gc.ts.setTxt("技能等级已达上限");
               this.stage.addChild(this.gc.ts);
            }
         }
      }
      
      private function setXFtxt() : void
      {
         var _loc1_:int = 0;
         _loc1_ = 0;
         while(_loc1_ <= 1)
         {
            if(this.player.isstudyskill[_loc1_].xflevel != 0)
            {
               this["leveltxt" + (_loc1_ + 1)].text = this.player.isstudyskill[_loc1_].xflevel + " ";
            }
            else
            {
               this["leveltxt" + (_loc1_ + 1)].text = "0";
            }
            this["lhtxt" + (_loc1_ + 1)].text = this.findNextNeedLHValue(this.player.isstudyskill[_loc1_].xflevel + 1) + " ";
            this["xfname" + (_loc1_ + 1)].text = this.findXFNameById(_loc1_);
            _loc1_++;
         }
      }
      
      private function setSkillMc() : void
      {
         if(this.player)
         {
            this.mainskillmc.gotoAndStop(this.player.getRoleName() + "-" + this.whichxf);
         }
      }
      
      private function findNextNeedLHValue(param1:uint) : uint
      {
         var _loc2_:* = 0;
         switch(int(param1) - 1)
         {
            case 0:
               _loc2_ = 100;
               break;
            case 1:
               _loc2_ = 200;
               break;
            case 2:
               _loc2_ = 500;
               break;
            case 3:
               _loc2_ = 1000;
               break;
            case 4:
               _loc2_ = 2000;
         }
         return int(_loc2_);
      }
      
      private function findXFNameById(param1:uint) : String
      {
         if(this.player.roleid == 1)
         {
            if(param1 == 0)
            {
               return "斩系心法";
            }
            return "火系心法";
         }
         if(this.player.roleid == 2)
         {
            if(param1 == 0)
            {
               return "愈系心法";
            }
            return "水系心法";
         }
         if(this.player.roleid == 3)
         {
            if(param1 == 0)
            {
               return "御系心法";
            }
            return "土系心法";
         }
         if(this.player.roleid == 4)
         {
            if(param1 == 0)
            {
               return "毒系心法";
            }
            return "木系心法";
         }
         if(this.player.roleid == 5)
         {
            if(param1 == 0)
            {
               return "千刀万刃";
            }
            return "龙魂的夜宴";
         }
         return "";
      }
      
      private function buy(param1:MouseEvent) : void
      {
         var _loc2_:* = 0;
         var _loc3_:* = null;
         var _loc4_:* = null;
         var _loc5_:* = null;
         if(this.player.howMuchSkillHasYouStudy() < this.player.getSkillLimt())
         {
            _loc2_ = uint(int(String(param1.currentTarget.name).substr(5,1)));
            if(this.mainskillmc["skill" + _loc2_].currentFrame == 2)
            {
               _loc3_ = this.findSkillNameBySkillBtn(_loc2_);
               this.player.isstudyskill[this.whichxf - 1].skillName += _loc3_[0] + "~1|";
               _loc4_ = this.player.findWhichSkillBtnNoneSet();
               if(_loc4_ != "")
               {
                  _loc5_ = {
                     "skillName":_loc3_[0],
                     "keys":_loc4_,
                     "needLh":_loc3_[1],
                     "slev":1
                  };
                  this.player.skillbykey.push(_loc5_);
               }
               else
               {
                  _loc5_ = {
                     "skillName":_loc3_[0],
                     "keys":"Not",
                     "needLh":_loc3_[1],
                     "slev":1
                  };
                  this.player.skillbykey.push(_loc5_);
               }
               this.mainskillmc["skill" + _loc2_].removeEventListener("click",this.buy);
               this.mainskillmc["skill" + _loc2_].gotoAndStop(3);
            }
         }
         else
         {
            this.gc.ts.setTxt("您当前只能学习" + this.player.getSkillLimt() + "个技能!");
            this.addChild(this.gc.ts);
         }
      }
      
      private function findSkillNameBySkillBtn(param1:int) : Array
      {
         var _loc2_:int = 0;
         var _loc3_:String = "";
         if(this.whichxf == 1)
         {
            _loc3_ = this.gc.allSklName[2 * (this.player.roleid - 1)][param1 - 1];
            _loc2_ = int(this.gc.needMMP[2 * (this.player.roleid - 1)][param1 - 1]);
         }
         else
         {
            _loc3_ = this.gc.allSklName[2 * Number(this.player.roleid) - 1][param1 - 1];
            _loc2_ = int(this.gc.needMMP[2 * Number(this.player.roleid) - 1][param1 - 1]);
         }
         return [_loc3_,_loc2_];
      }
      
      private function findSkillBtnBySkillName(param1:String) : String
      {
         var _loc2_:* = 0;
         var _loc3_:int = 0;
         var _loc4_:* = null;
         var _loc5_:* = 0;
         var _loc6_:int = 0;
         var _loc7_:uint = uint(this.gc.allSklName.length);
         _loc3_ = 0;
         while(_loc3_ < _loc7_)
         {
            _loc4_ = this.gc.allSklName[_loc3_];
            _loc5_ = uint(_loc4_.length);
            _loc6_ = 0;
            while(_loc6_ < _loc5_)
            {
               if(param1 == _loc4_[_loc6_])
               {
                  _loc2_ = uint(_loc6_ + 1);
                  break;
               }
               _loc6_++;
            }
            _loc3_++;
         }
         if(_loc2_ == 0)
         {
            return "";
         }
         return "skill" + _loc2_;
      }
   }
}

