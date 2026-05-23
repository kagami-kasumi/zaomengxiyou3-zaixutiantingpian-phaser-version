package my
{
   import base.*;
   import config.*;
   import myanalysis.*;
   
   public class MyEquipObj
   {
      
      private var gc:Config;
      
      private var meid:MyAllEquipId;
      
      private var backpackid:uint = 0;
      
      public var showid:uint = 1;
      
      public var ename:String = "";
      
      private var fillName1:String = "";
      
      private var fillName2:String = "";
      
      private var fillName3:Array;
      
      public var type:String = "";
      
      public var user:String = "";
      
      public var quality:String = "";
      
      public var color:*;
      
      private var ehp1:int = 0;
      
      private var ehp2:int = 0;
      
      private var ehp3:Number = 0;
      
      private var emp1:int = 0;
      
      private var emp2:int = 0;
      
      private var emp3:Number = 0;
      
      private var eatt1:int = 0;
      
      private var eatt2:int = 0;
      
      private var eatt3:Number = 0;
      
      private var edef1:int = 0;
      
      private var edef2:int = 0;
      
      private var edef3:Number = 0;
      
      private var emiss1:Number = 0;
      
      private var emiss2:Number = 0;
      
      private var emiss3:Number = 0;
      
      private var ecrit1:Number = 0;
      
      private var ecrit2:Number = 0;
      
      private var ecrit3:Number = 0;
      
      private var eahp1:int = 0;
      
      private var eahp2:int = 0;
      
      private var eahp3:Number = 0;
      
      private var eamp1:int = 0;
      
      private var eamp2:int = 0;
      
      private var eamp3:Number = 0;
      
      private var eatblood1:Number = 0;
      
      private var eatblood2:Number = 0;
      
      private var eatblood3:Number = 0;
      
      private var magicdef1:Number = 0;
      
      private var magicdef2:Number = 0;
      
      private var magicdef3:Number = 0;
      
      private var deephit1:Number = 0;
      
      private var deephit2:Number = 0;
      
      private var deephit3:Number = 0;
      
      public var aStrengthen:Object;
      
      public var etype:String;
      
      public var instruction:String = "";
      
      public var value1:int;
      
      public var value2:int;
      
      public var value3:Number;
      
      private var num1:int;
      
      private var num2:int;
      
      private var num3:Number;
      
      public var isstrskill:Boolean;
      
      private var jin:Boolean;
      
      private var mu:Boolean;
      
      private var shui:Boolean;
      
      private var huo:Boolean;
      
      private var tu:Boolean;
      
      private var elevel1:int;
      
      private var elevel2:int;
      
      private var elevel3:Number;
      
      private var eupdata1:Number;
      
      private var eupdata2:Number;
      
      private var eupdata3:Number;
      
      private var strengthValue1:int = 0;
      
      private var strengthValue2:int = 0;
      
      private var strengthValue3:Number = 0;
      
      private var shpVal1:int;
      
      private var shpVal2:int;
      
      private var shpVal3:Number;
      
      private var smpVal1:int;
      
      private var smpVal2:int;
      
      private var smpVal3:Number;
      
      private var satkVal1:int;
      
      private var satkVal2:int;
      
      private var satkVal3:Number;
      
      private var sdefVal1:int;
      
      private var sdefVal2:int;
      
      private var sdefVal3:Number;
      
      private var scritVal1:Number;
      
      private var scritVal2:Number;
      
      private var scritVal3:Number;
      
      private var smissVal1:Number;
      
      private var smissVal2:Number;
      
      private var smissVal3:Number;
      
      private var sehpVal1:int;
      
      private var sehpVal2:int;
      
      private var sehpVal3:Number;
      
      private var sempVal1:int;
      
      private var sempVal2:int;
      
      private var sempVal3:Number;
      
      private var sebolVal1:Number;
      
      private var sebolVal2:Number;
      
      private var sebolVal3:Number;
      
      private var smdefVal1:Number;
      
      private var smdefVal2:Number;
      
      private var smdefVal3:Number;
      
      private var sdhitVal1:Number;
      
      private var sdhitVal2:Number;
      
      private var sdhitVal3:Number;
      
      private var shbdVal1:Number;
      
      private var shbdVal2:Number;
      
      private var shbdVal3:Number;
      
      private var haveblood1:Number = 0;
      
      private var haveblood2:Number = 0;
      
      private var haveblood3:Number = 0;
      
      private var fashiontime1:String = "";
      
      private var fashiontime2:String = "";
      
      private var fashiontime3:Array;
      
      private var lasttime1:uint;
      
      private var lasttime2:uint;
      
      private var lasttime3:Number;
      
      public function MyEquipObj(param1:uint = 0, param2:String = "", param3:String = "", param4:String = "", param5:String = "", param6:String = "", param7:* = null, param8:int = 0, param9:int = 0, param10:int = 0, param11:int = 0, param12:Number = 0, param13:Number = 0, param14:int = 0, param15:int = 0, param16:Number = 0, param17:Number = 0, param18:Number = 0, param19:Object = null, param20:String = "", param21:Object = null, param22:Object = null, param23:Number = 0)
      {
         this.ehp3 = 0;
         this.emp3 = 0;
         this.eatt3 = 0;
         this.edef3 = 0;
         this.emiss1 = 0;
         this.emiss2 = 0;
         this.emiss3 = 0;
         this.ecrit1 = 0;
         this.ecrit2 = 0;
         this.ecrit3 = 0;
         this.eahp3 = 0;
         this.eamp3 = 0;
         this.eatblood1 = 0;
         this.eatblood2 = 0;
         this.eatblood3 = 0;
         this.magicdef1 = 0;
         this.magicdef2 = 0;
         this.magicdef3 = 0;
         this.deephit1 = 0;
         this.deephit2 = 0;
         this.deephit3 = 0;
         this.strengthValue3 = 0;
         this.ehp3 = 0;
         this.emp3 = 0;
         this.eatt3 = 0;
         this.edef3 = 0;
         this.emiss1 = 0;
         this.emiss2 = 0;
         this.emiss3 = 0;
         this.ecrit1 = 0;
         this.ecrit2 = 0;
         this.ecrit3 = 0;
         this.eahp3 = 0;
         this.eamp3 = 0;
         this.eatblood1 = 0;
         this.eatblood2 = 0;
         this.eatblood3 = 0;
         this.magicdef1 = 0;
         this.magicdef2 = 0;
         this.magicdef3 = 0;
         this.deephit1 = 0;
         this.deephit2 = 0;
         this.deephit3 = 0;
         this.strengthValue3 = 0;
         this.ehp3 = 0;
         this.emp3 = 0;
         this.eatt3 = 0;
         this.edef3 = 0;
         this.emiss1 = 0;
         this.emiss2 = 0;
         this.emiss3 = 0;
         this.ecrit1 = 0;
         this.ecrit2 = 0;
         this.ecrit3 = 0;
         this.eahp3 = 0;
         this.eamp3 = 0;
         this.eatblood1 = 0;
         this.eatblood2 = 0;
         this.eatblood3 = 0;
         this.magicdef1 = 0;
         this.magicdef2 = 0;
         this.magicdef3 = 0;
         this.deephit1 = 0;
         this.deephit2 = 0;
         this.deephit3 = 0;
         this.strengthValue3 = 0;
         this.ehp3 = 0;
         this.emp3 = 0;
         this.eatt3 = 0;
         this.edef3 = 0;
         this.emiss1 = 0;
         this.emiss2 = 0;
         this.emiss3 = 0;
         this.ecrit1 = 0;
         this.ecrit2 = 0;
         this.ecrit3 = 0;
         this.eahp3 = 0;
         this.eamp3 = 0;
         this.eatblood1 = 0;
         this.eatblood2 = 0;
         this.eatblood3 = 0;
         this.magicdef1 = 0;
         this.magicdef2 = 0;
         this.magicdef3 = 0;
         this.deephit1 = 0;
         this.deephit2 = 0;
         this.deephit3 = 0;
         this.strengthValue3 = 0;
         this.ehp3 = 0;
         this.emp3 = 0;
         this.eatt3 = 0;
         this.edef3 = 0;
         this.emiss1 = 0;
         this.emiss2 = 0;
         this.emiss3 = 0;
         this.ecrit1 = 0;
         this.ecrit2 = 0;
         this.ecrit3 = 0;
         this.eahp3 = 0;
         this.eamp3 = 0;
         this.eatblood1 = 0;
         this.eatblood2 = 0;
         this.eatblood3 = 0;
         this.magicdef1 = 0;
         this.magicdef2 = 0;
         this.magicdef3 = 0;
         this.deephit1 = 0;
         this.deephit2 = 0;
         this.deephit3 = 0;
         this.strengthValue3 = 0;
         this.ehp3 = 0;
         this.emp3 = 0;
         this.eatt3 = 0;
         this.edef3 = 0;
         this.emiss1 = 0;
         this.emiss2 = 0;
         this.emiss3 = 0;
         this.ecrit1 = 0;
         this.ecrit2 = 0;
         this.ecrit3 = 0;
         this.eahp3 = 0;
         this.eamp3 = 0;
         this.eatblood1 = 0;
         this.eatblood2 = 0;
         this.eatblood3 = 0;
         this.magicdef1 = 0;
         this.magicdef2 = 0;
         this.magicdef3 = 0;
         this.deephit1 = 0;
         this.deephit2 = 0;
         this.deephit3 = 0;
         this.strengthValue3 = 0;
         this.ehp3 = 0;
         this.emp3 = 0;
         this.eatt3 = 0;
         this.edef3 = 0;
         this.emiss1 = 0;
         this.emiss2 = 0;
         this.emiss3 = 0;
         this.ecrit1 = 0;
         this.ecrit2 = 0;
         this.ecrit3 = 0;
         this.eahp3 = 0;
         this.eamp3 = 0;
         this.eatblood1 = 0;
         this.eatblood2 = 0;
         this.eatblood3 = 0;
         this.magicdef1 = 0;
         this.magicdef2 = 0;
         this.magicdef3 = 0;
         this.deephit1 = 0;
         this.deephit2 = 0;
         this.deephit3 = 0;
         this.strengthValue3 = 0;
         this.ehp3 = 0;
         this.emp3 = 0;
         this.eatt3 = 0;
         this.edef3 = 0;
         this.emiss1 = 0;
         this.emiss2 = 0;
         this.emiss3 = 0;
         this.ecrit1 = 0;
         this.ecrit2 = 0;
         this.ecrit3 = 0;
         this.eahp3 = 0;
         this.eamp3 = 0;
         this.eatblood1 = 0;
         this.eatblood2 = 0;
         this.eatblood3 = 0;
         this.magicdef1 = 0;
         this.magicdef2 = 0;
         this.magicdef3 = 0;
         this.deephit1 = 0;
         this.deephit2 = 0;
         this.deephit3 = 0;
         this.strengthValue3 = 0;
         this.haveblood1 = 0;
         this.haveblood2 = 0;
         this.haveblood3 = 0;
         this.fillName3 = [];
         this.aStrengthen = {};
         this.fashiontime3 = [];
         super();
         this.gc = Config.getInstance();
         this.meid = MyAllEquipId.getInstance();
         this.showid = param1;
         this.ename = param2;
         this.setFillName(param3);
         this.type = param4;
         this.user = param5;
         this.quality = param6;
         this.color = param7;
         this.setehp(param8);
         this.setemp(param9);
         this.seteatt(param10);
         this.setedef(param11);
         this.setecrit(param12);
         this.setemiss(param13);
         this.seteahp(param14);
         this.seteamp(param15);
         this.seteatblood(param16);
         this.setmagicdef(param17);
         this.setdeephit(param18);
         this.sethaveblood(param23);
         this.setnum(1);
         this.setstrengthValue(0);
         this.instruction = param20;
         if(param19 != null)
         {
            this.aStrengthen = param19;
         }
         if(param21 != null)
         {
            this.setELevel(int(param21.elevel));
            this.setEupdata(Number(param21.eupdata));
         }
         else
         {
            this.setELevel(0);
            this.setEupdata(0);
         }
         if(param22 != null)
         {
            this.jin = Boolean(param22.jin);
            this.mu = Boolean(param22.mu);
            this.shui = Boolean(param22.shui);
            this.huo = Boolean(param22.huo);
            this.tu = Boolean(param22.tu);
         }
         this.trans(param4);
         this.transValue();
         this.strengthenEquip();
      }
      
      public function setFaBaoStreng() : void
      {
         this.isstrskill = true;
      }
      
      public function setWX(param1:Boolean, param2:Boolean, param3:Boolean, param4:Boolean, param5:Boolean) : void
      {
         this.jin = param1;
         this.mu = param2;
         this.shui = param3;
         this.huo = param4;
         this.tu = param5;
      }
      
      private function strengthenEquip() : void
      {
         if(this.aStrengthen.att != undefined)
         {
            this.setSatkValue(this.getStrengthValue() * Number(this.aStrengthen.att));
         }
         else
         {
            this.setSatkValue(0);
            if(this.getFillName() == "dgg")
            {
               this.setSatkValue(111);
            }
         }
         if(this.aStrengthen.def != undefined)
         {
            this.setSdefValue(this.getStrengthValue() * Number(this.aStrengthen.def));
         }
         else
         {
            this.setSdefValue(0);
            if(this.getFillName() == "dgg")
            {
               this.setSdefValue(111);
            }
         }
         if(this.aStrengthen.hp != undefined)
         {
            this.setShpValue(this.getStrengthValue() * Number(this.aStrengthen.hp));
         }
         else
         {
            this.setShpValue(0);
            if(this.getFillName() == "dgg")
            {
               this.setShpValue(1111);
            }
         }
         if(this.aStrengthen.mp != undefined)
         {
            this.setSmpValue(this.getStrengthValue() * Number(this.aStrengthen.mp));
         }
         else
         {
            this.setSmpValue(0);
            if(this.getFillName() == "dgg")
            {
               this.setSmpValue(1111);
            }
         }
         if(this.aStrengthen.crit != undefined)
         {
            this.setScritValue(this.getStrengthValue() * Number(this.aStrengthen.crit));
         }
         else
         {
            this.setScritValue(0);
         }
         if(this.aStrengthen.miss != undefined)
         {
            this.setSmissValue(this.getStrengthValue() * Number(this.aStrengthen.miss));
         }
         else
         {
            this.setSmissValue(0);
         }
         if(this.aStrengthen.ehp != undefined)
         {
            this.setSehpValue(this.getStrengthValue() * Number(this.aStrengthen.ehp));
         }
         else
         {
            this.setSehpValue(0);
            if(this.getFillName() == "dgg")
            {
               this.setSehpValue(11);
            }
         }
         if(this.aStrengthen.emp != undefined)
         {
            this.setSempValue(this.getStrengthValue() * Number(this.aStrengthen.emp));
         }
         else
         {
            this.setSempValue(0);
            if(this.getFillName() == "dgg")
            {
               this.setSempValue(11);
            }
         }
         if(this.aStrengthen.mdef != undefined)
         {
            this.setSmdefValue(this.getStrengthValue() * Number(this.aStrengthen.mdef));
         }
         else
         {
            this.setSmdefValue(0);
            if(this.getFillName() == "dgg")
            {
               this.setSmdefValue(0.01);
            }
         }
         if(this.aStrengthen.ebol != undefined)
         {
            this.setSebolValue(this.getStrengthValue() * Number(this.aStrengthen.ebol));
         }
         else
         {
            this.setSebolValue(0);
         }
         if(this.aStrengthen.dhit != undefined)
         {
            this.setSdhitValue(this.getStrengthValue() * Number(this.aStrengthen.dhit));
         }
         else
         {
            this.setSdhitValue(0);
         }
         if(this.aStrengthen.haveblood != undefined)
         {
            this.setShbdValue(this.getStrengthValue() * Number(this.aStrengthen.haveblood));
         }
         else
         {
            this.setShbdValue(0);
         }
      }
      
      public function upStrengthValue(param1:int) : void
      {
         this.setstrengthValue(this.getStrengthValue() + param1);
         this.strengthenEquip();
      }
      
      public function setNum(param1:int) : void
      {
         this.setnum(this.getENum() + param1);
      }
      
      public function getbackpackid() : int
      {
         return this.backpackid;
      }
      
      public function setbackpackid(param1:int) : void
      {
         this.backpackid = uint(uint(uint(param1)));
      }
      
      private function trans(param1:String) : void
      {
         switch(param1)
         {
            case "zbfj":
               this.etype = "防具";
               break;
            case "zbwq":
               this.etype = "武器";
               break;
            case "zbsp":
               this.etype = "饰品";
               break;
            case "zbfb":
               this.etype = "法宝";
               break;
            case "zbsz":
               this.etype = "时装";
               break;
            case "zbtx":
               this.etype = "头衔";
               break;
            case "wpqhs":
               this.etype = "强化石";
               break;
            case "zbwp":
               this.etype = "道具";
               if(this.getFillName() == "wpxyf")
               {
                  this.etype = "幸运符";
                  break;
               }
               if(this.getFillName() == "wpbdf")
               {
                  this.etype = "神恩符";
                  break;
               }
               if(this.getFillName().indexOf("zzs") != -1)
               {
                  this.etype = "制作书";
                  break;
               }
               if(this.getFillName().indexOf("sms") != -1 || this.getFillName().indexOf("mfs") != -1 || this.getFillName().indexOf("fys") != -1 || this.getFillName().indexOf("gjs") != -1 || this.getFillName().indexOf("tlz") != -1 || this.getFillName().indexOf("llz") != -1 || this.getFillName().indexOf("hlz") != -1 || this.getFillName().indexOf("flz") != -1 || this.getFillName().indexOf("slz") != -1 || this.getFillName().indexOf("rls") != -1 || this.getFillName().indexOf("yhs") != -1 || this.getFillName().indexOf("tss") != -1)
               {
                  if(this.showid != 100)
                  {
                     this.etype = "宝石";
                  }
                  break;
               }
               if(this.getFillName() == "wpsc" || this.getFillName() == "wpxt" || this.getFillName() == "wptm" || this.getFillName() == "wpxh" || this.getFillName() == "wplh" || this.getFillName() == "wpxm" || this.getFillName() == "wpll" || this.getFillName() == "wpsg" || this.getFillName() == "wprs" || this.getFillName() == "wpygs")
               {
                  this.etype = "材料";
                  break;
               }
               if(this.getFillName() == "ttsl" || this.getFillName() == "zylhys" || this.getFillName() == "mpyj" || this.getFillName() == "wphhd" || this.getFillName() == "wpcsd" || this.getFillName() == "wpmgh" || this.getFillName() == "wpzz" || this.getFillName() == "wpbsz" || this.getFillName() == "wplwl" || this.getFillName() == "wplvdyl" || this.getFillName() == "wpdd" || this.getFillName() == "yjpyinsp" || this.getFillName() == "yjpyansp" || this.getFillName() == "sbjyd" || this.getFillName() == "jyys" || this.getFillName() == "jyd3" || this.getFillName() == "djyys" || this.getFillName().indexOf("ttlpsp") != -1 || this.getFillName() == "ttlp" || this.getFillName() == "xjyys" || this.getFillName() == "lhys" || this.getFillName() == "ghyb" || this.getFillName() == "hjxz" || this.getFillName() == "zsxz" || this.getFillName() == "yll" || this.getFillName() == "wwdgl" || this.getFillName() == "zsTimerup1" || this.getFillName() == "zsTimerup2" || this.getFillName().indexOf("ttlpsp") != -1 || this.getFillName() == "ttlp" || this
               .getFillName() == "wpxty" || this.getFillName() == "wpzty" || this.getFillName() == "wpycjh" || this.getFillName() == "kly4" || this.getFillName() == "kly5" || this.getFillName() == "kly3" || this.getFillName() == "lssp_1" || this.getFillName() == "lssp_2" || this.getFillName() == "lssp_3" || this.getFillName() == "lssp_4" || this.getFillName() == "lssp_5" || this.getFillName() == "lssp_6" || this.getFillName() == "lssp_7" || this.getFillName() == "lssp_8" || this.getFillName() == "lssp_9" || this.getFillName() == "lxfs_1" || this.getFillName() == "lxfs_2" || this.getFillName() == "lxfs_3" || this.getFillName() == "lxzhs" || this.getFillName() == "sxzhs" || this.getFillName() == "xhb" || this.getFillName() == "wpfbyyin" || this.getFillName() == "wpfbyyan" || this.getFillName() == "wpfbtc" || this.getFillName() == "bmd" || this.getFillName() == "jbc" || this.getFillName() == "szj" || this.getFillName() == "yp" || this.getFillName() == "gz" || this.getFillName() == "sz" || this.getFillName() == "ml" || this
               .getFillName() == "zz" || this.getFillName() == "wpccfq" || this.getFillName() == "wpxtzh")
               {
                  this.etype = "道具";
                  break;
               }
               if(this.getFillName() == "css_4" || this.getFillName() == "css24" || this.getFillName() == "css6" || this.getFillName() == "css12" || this.getFillName() == "css18" || this.getFillName() == "css_2" || this.getFillName() == "css_3")
               {
                  this.etype = "传送石";
                  break;
               }
               if(this.getFillName().indexOf("wphld") != -1 || this.getFillName().indexOf("wphxd") != -1 || this.getFillName().indexOf("wpmfd") != -1 || this.getFillName().indexOf("wpbjd") != -1 || this.getFillName().indexOf("wpsmd") != -1 || this.getFillName().indexOf("cwjnxld") != -1 || this.getFillName().indexOf("cwzzxld") != -1 || this.getFillName().indexOf("wphtd") != -1 || this.getFillName() == "nianqld" || this.getFillName() == "nianjhd")
               {
                  this.etype = "丹药";
                  break;
               }
               if(this.getFillName().indexOf("jns") != -1)
               {
                  this.etype = "技能书";
                  break;
               }
               if(this.getFillName() == "bx")
               {
                  this.etype = "宝箱";
               }
         }
      }
      
      private function transValue() : void
      {
         switch(this.quality)
         {
            case "粗 糙":
               this.setValue(10);
               break;
            case "普 通":
               this.setValue(20);
               break;
            case "优 秀":
               this.setValue(40);
               break;
            case "精 良":
               this.setValue(80);
               break;
            case "史 诗":
               this.setValue(160);
               break;
            case "传 说":
               this.setValue(1280);
               break;
            case "转 悦":
               this.setValue(114514);
               break;
            case "邪 灵":
               this.setValue(320);
               break;
            case "魂 器":
               this.setValue(640);
               break;
            case "灵 器":
               this.setValue(2560);
               break;
            case "神 器":
               this.setValue(2560);
         }
      }
      
      public function getWX() : String
      {
         var _loc1_:* = "";
         if(this.jin)
         {
            _loc1_ += "金 ";
         }
         if(this.mu)
         {
            _loc1_ += "木 ";
         }
         if(this.shui)
         {
            _loc1_ += "水 ";
         }
         if(this.huo)
         {
            _loc1_ += "火 ";
         }
         if(this.tu)
         {
            _loc1_ += "土 ";
         }
         return _loc1_;
      }
      
      public function growth(param1:Object, param2:Boolean = true) : void
      {
         if(param2)
         {
            this.setELevel(this.getELevel() + 1);
         }
         if(this.jin)
         {
            this.seteatt(this.geteatt(true) + (param1.fatk + Math.floor(Number(param1.fatk) * this.getEUpdata())));
         }
         else
         {
            this.seteatt(this.geteatt(true) + Math.floor(Number(param1.fatk) * this.getEUpdata()));
         }
         if(!this.mu)
         {
         }
         if(this.shui)
         {
            this.setemp(this.getemp(true) + (param1.fmp + Math.floor(Number(param1.fmp) * this.getEUpdata())));
         }
         else
         {
            this.setemp(this.getemp(true) + Math.floor(Number(param1.fmp) * this.getEUpdata()));
         }
         if(this.huo)
         {
            this.setehp(this.getehp(true) + (param1.fhp + Math.floor(Number(param1.fhp) * this.getEUpdata())));
         }
         else
         {
            this.setehp(this.getehp(true) + Math.floor(Number(param1.fhp) * this.getEUpdata()));
         }
         if(this.tu)
         {
            this.setedef(this.getedef(true) + (param1.fdef + Math.floor(Number(param1.fdef) * this.getEUpdata())));
         }
         else
         {
            this.setedef(this.getedef(true) + Math.floor(Number(param1.fdef) * this.getEUpdata()));
         }
         var _loc3_:uint = uint(this.gc.getPlayerArray().length);
         while(_loc3_-- > 0)
         {
            BaseHero(this.gc.getPlayerArray()[_loc3_]).updateMagicWeapon();
         }
      }
      
      public function getGrowthByName(param1:String) : Object
      {
         var _loc2_:* = {
            "fdef":0,
            "fmp":0,
            "fatk":0,
            "fhp":0
         };
         switch(param1)
         {
            case "kyl":
               _loc2_ = {
                  "fdef":2,
                  "fmp":20,
                  "fatk":4,
                  "fhp":20
               };
               break;
            case "xhhl":
               _loc2_ = {
                  "fdef":2,
                  "fmp":30,
                  "fatk":5,
                  "fhp":30
               };
               break;
            case "qyj":
               _loc2_ = {
                  "fdef":2,
                  "fmp":50,
                  "fatk":5,
                  "fhp":30
               };
               break;
            case "hyzzs":
               _loc2_ = {
                  "fdef":4,
                  "fmp":30,
                  "fatk":5,
                  "fhp":50
               };
               break;
            case "zjld":
               _loc2_ = {
                  "fdef":2,
                  "fmp":30,
                  "fatk":9,
                  "fhp":30
               };
               break;
            case "syl":
               _loc2_ = {
                  "fdef":3,
                  "fmp":35,
                  "fatk":6,
                  "fhp":35
               };
               break;
            case "lxj":
               _loc2_ = {
                  "fdef":4,
                  "fmp":60,
                  "fatk":7,
                  "fhp":40
               };
               break;
            case "hywjs":
               _loc2_ = {
                  "fdef":5,
                  "fmp":35,
                  "fatk":8,
                  "fhp":65
               };
               break;
            case "xhmt":
               _loc2_ = {
                  "fdef":4,
                  "fmp":40,
                  "fatk":15,
                  "fhp":60
               };
               break;
            case "zsTimer":
               _loc2_ = {
                  "fdef":4,
                  "fmp":45,
                  "fatk":15,
                  "fhp":75
               };
               break;
            case "mdhf":
               _loc2_ = {
                  "fdef":5,
                  "fmp":50 * 0.9,
                  "fatk":16 * 0.9,
                  "fhp":80 * 0.9
               };
               break;
            case "jyhl":
               _loc2_ = {
                  "fdef":4,
                  "fmp":39,
                  "fatk":20,
                  "fhp":70
               };
               break;
            case "qljfb":
               _loc2_ = {
                  "fdef":5,
                  "fmp":60,
                  "fatk":14,
                  "fhp":60
               };
               break;
            case "yxfb":
               _loc2_ = {
                  "fdef":0,
                  "fmp":40,
                  "fatk":20,
                  "fhp":40
               };
               break;
            case "sxfb":
               _loc2_ = {
                  "fdef":0,
                  "fmp":20,
                  "fatk":15,
                  "fhp":20
               };
               break;
            case "tjbg":
               _loc2_ = {
                  "fdef":35,
                  "fmp":170,
                  "fatk":40,
                  "fhp":285
               };
               break;
            case "fbqpj":
               _loc2_ = {
                  "fdef":35,
                  "fmp":170,
                  "fatk":40,
                  "fhp":285
               };
               break;
            case "zltc":
               _loc2_ = {
                  "fdef":35 * 0.8 * 9 / 15,
                  "fmp":170 * 0.7 * 9 / 15,
                  "fatk":40 * 0.8 * 9 / 15,
                  "fhp":285 * 0.7 * 9 / 15
               };
               break;
            case "lxfb":
               _loc2_ = {
                  "fdef":0,
                  "fmp":10,
                  "fatk":5,
                  "fhp":10
               };
               break;
            case "stlp":
               _loc2_ = {
                  "fdef":4,
                  "fmp":45 * 0.9,
                  "fatk":18 * 0.9,
                  "fhp":75 * 0.9
               };
         }
         return _loc2_;
      }
      
      public function getEquipSaveObj() : String
      {
         var _loc1_:* = null;
         var _loc2_:String = this.showid + "|" + this.ename + "|" + this.getFillName() + "|" + this.type + "|" + this.user + "|" + this.quality + "|" + this.color + "|" + this.getehp(true) + "|" + this.getemp(true) + "|" + this.geteatt(true) + "|" + this.getedef(true) + "|" + this.getemiss(true) + "|" + this.getecrit(true) + "|" + this.geteahp(true) + "|" + this.geteamp(true) + "|" + this.jin + "|" + this.mu + "|" + this.shui + "|" + this.huo + "|" + this.tu + "|" + this.getELevel() + "|" + this.getEUpdata() + "|" + this.getENum() + "|" + this.getStrengthValue() + "|" + this.getmagicdef(true) + "|" + this.geteatblood(true) + "|" + this.getdeephit(true) + "|" + this.gethaveblood(true);
         if(this.type == "zbsz" || this.type == "zbcb")
         {
            _loc1_ = "";
            if(this.getFashionTime() == "永久")
            {
               _loc1_ = "never";
            }
            else
            {
               _loc1_ = this.getFashionTime();
            }
            _loc2_ += "|" + _loc1_;
         }
         return _loc2_;
      }
      
      public function setEquipSaveObj(param1:*) : void
      {
         var _loc2_:Array = param1.split("|");
         this.showid = uint(int(_loc2_[0]));
         this.ename = _loc2_[1];
         this.setFillName(_loc2_[2]);
         this.quality = _loc2_[5];
         this.color = _loc2_[6];
         this.setELevel(int(_loc2_[20]));
         this.setEupdata(Number(_loc2_[21]));
         this.setnum(int(_loc2_[22]));
         if(this.getFillName().indexOf("jns") != -1)
         {
            this.type = "zbwp";
         }
         else
         {
            this.type = _loc2_[3];
            this.user = _loc2_[4];
            this.setehp(int(_loc2_[7]));
            this.setemp(int(_loc2_[8]));
            this.seteatt(int(_loc2_[9]));
            this.setedef(int(_loc2_[10]));
            this.setemiss(Number(_loc2_[11]));
            this.setecrit(Number(_loc2_[12]));
            this.seteahp(int(_loc2_[13]));
            this.seteamp(int(_loc2_[14]));
            if(_loc2_[15] == "false" || _loc2_[15] == false)
            {
               this.jin = false;
            }
            else
            {
               this.jin = true;
            }
            if(_loc2_[16] == "false" || _loc2_[16] == false)
            {
               this.mu = false;
            }
            else
            {
               this.mu = true;
            }
            if(_loc2_[17] == "false" || _loc2_[17] == false)
            {
               this.shui = false;
            }
            else
            {
               this.shui = true;
            }
            if(_loc2_[18] == "false" || _loc2_[18] == false)
            {
               this.huo = false;
            }
            else
            {
               this.huo = true;
            }
            if(_loc2_[19] == "false" || _loc2_[19] == false)
            {
               this.tu = false;
            }
            else
            {
               this.tu = true;
            }
            this.setstrengthValue(int(_loc2_[23]));
            this.setmagicdef(Number(_loc2_[24]));
            this.seteatblood(Number(_loc2_[25]));
            this.setdeephit(Number(_loc2_[26]));
            this.sethaveblood(Number(_loc2_[27]));
            if(_loc2_[28] != undefined)
            {
               this.setFashionTime(_loc2_[28]);
            }
            if(this.type == "zbsz")
            {
               if(this.hasPassTime())
               {
                  this.instruction = this.instruction + "</font>\n<font face=\'" + AllConsts.GAME_CONFIG_FONT + "\' size=\'14\' color=\'#ff0000\'>时装已经过期";
               }
               else
               {
                  this.instruction = this.instruction + "</font>\n<font face=\'" + AllConsts.GAME_CONFIG_FONT + "\' size=\'14\' color=\'#ff0000\'>时装永不过期！";
               }
            }
         }
         if(_loc2_[1] == "七曜战神")
         {
            this.setehp(0);
            this.setemp(0);
            this.seteatt(0);
            this.setedef(0);
            this.setemiss(0);
            this.setecrit(0);
            this.seteahp(0);
            this.seteamp(0);
            this.setmagicdef(0);
            this.seteatblood(0);
            this.setdeephit(0);
            this.sethaveblood(0);
         }
         var _loc3_:MyEquipObj = this.gc.allEquip.findByName(this.getFillName());
         this.instruction = _loc3_.instruction;
         this.trans(_loc3_.type);
         this.transValue();
         this.aStrengthen = _loc3_.aStrengthen;
         this.strengthenEquip();
      }
      
      public function hasPassTime() : Boolean
      {
         if(this.getFashionTime() == "never")
         {
            return false;
         }
         if(AUtils.getDayBetweenDate(this.getFashionTime(),this.gc.curdate) > 30)
         {
            return false;
         }
         return false;
      }
      
      private function getLastDay() : uint
      {
         return 30 - AUtils.getDayBetweenDate(this.getFashionTime(),this.gc.curdate);
      }
      
      public function setFillName(param1:String) : void
      {
         this.fillName1 = param1;
      }
      
      public function getFillName() : String
      {
         return this.fillName1;
      }
      
      public function setFashionTime(param1:String) : void
      {
         var _loc2_:uint = uint(param1.length);
         var _loc3_:uint = Math.round(Math.random() * _loc2_);
         this.fashiontime1 = param1.substr(0,_loc3_);
         this.fashiontime2 = param1.substr(_loc3_,_loc2_ - _loc3_);
         this.fashiontime3 = this.enCodeString(param1);
         if(this.hasPassTime())
         {
            this.instruction = this.instruction + "</font>\n<font face=\'" + AllConsts.GAME_CONFIG_FONT + "\' size=\'14\' color=\'#ff0000\'>时装已经过期</font>";
         }
         else
         {
            this.instruction += "</font>\n<font face=\'undefined\' size=\'14\' color=\'#ff0000\'>时装永不过期！</font>";
         }
      }
      
      public function getFashionTime() : String
      {
         if(this.fashiontime1 + this.fashiontime2 == "never")
         {
            return "永久";
         }
         return this.fashiontime1 + this.fashiontime2;
      }
      
      public function setEupdata(param1:Number) : void
      {
         this.eupdata1 = Math.ceil(Math.random() * 100);
         this.eupdata2 = param1 - this.eupdata1;
      }
      
      public function getEUpdata() : Number
      {
         var _loc1_:Number = this.eupdata1 + this.eupdata2;
         return _loc1_.toFixed(2);
      }
      
      public function setELevel(param1:int) : void
      {
         this.elevel1 = Math.ceil(Math.random() * 100);
         this.elevel2 = param1 - this.elevel1;
      }
      
      public function getELevel() : int
      {
         return this.elevel1 + this.elevel2;
      }
      
      public function setnum(param1:int) : void
      {
         this.num1 = Math.ceil(Math.random() * 100);
         this.num2 = param1 - this.num1;
      }
      
      public function getENum() : uint
      {
         return this.num1 + this.num2;
      }
      
      public function setehp(param1:int) : void
      {
         this.ehp1 = Math.ceil(Math.random() * 100);
         this.ehp2 = param1 - this.ehp1;
      }
      
      public function getehp(param1:Boolean = false) : int
      {
         if(!param1)
         {
            return this.ehp1 + this.ehp2 + this.getShpValue();
         }
         return this.ehp1 + this.ehp2;
      }
      
      public function setemp(param1:int) : void
      {
         this.emp1 = Math.ceil(Math.random() * 100);
         this.emp2 = param1 - this.emp1;
      }
      
      public function getemp(param1:Boolean = false) : int
      {
         if(!param1)
         {
            return this.emp1 + this.emp2 + this.getSmpValue();
         }
         return this.emp1 + this.emp2;
      }
      
      public function seteatt(param1:int) : void
      {
         this.eatt1 = Math.ceil(Math.random() * 100);
         this.eatt2 = param1 - this.eatt1;
      }
      
      public function geteatt(param1:Boolean = false) : int
      {
         if(!param1)
         {
            return this.eatt1 + this.eatt2 + this.getSatkValue();
         }
         return this.eatt1 + this.eatt2;
      }
      
      public function setedef(param1:int) : void
      {
         this.edef1 = Math.ceil(Math.random() * 100);
         this.edef2 = param1 - this.edef1;
      }
      
      public function getedef(param1:Boolean = false) : int
      {
         if(!param1)
         {
            return this.edef1 + this.edef2 + this.getSdefValue();
         }
         return this.edef1 + this.edef2;
      }
      
      public function setValue(param1:int) : void
      {
         this.value1 = Math.ceil(Math.random() * 100);
         this.value2 = param1 - this.value1;
      }
      
      public function getValue() : int
      {
         return this.value1 + this.value2;
      }
      
      public function setemiss(param1:Number) : void
      {
         this.emiss1 = Math.ceil(Math.random() * 100);
         this.emiss2 = param1 - this.emiss1;
      }
      
      public function getemiss(param1:Boolean = false) : Number
      {
         var _loc2_:Number = this.emiss1 + this.emiss2;
         if(!param1)
         {
            return (_loc2_ + this.getSmissValue()).toFixed(2);
         }
         return _loc2_.toFixed(2);
      }
      
      public function setecrit(param1:Number) : void
      {
         this.ecrit1 = Math.ceil(Math.random() * 100);
         this.ecrit2 = param1 - this.ecrit1;
      }
      
      public function getecrit(param1:Boolean = false) : Number
      {
         var _loc2_:Number = this.ecrit1 + this.ecrit2;
         if(!param1)
         {
            return Number((_loc2_ + this.getScritValue()).toFixed(2));
         }
         return Number(_loc2_.toFixed(2));
      }
      
      public function seteahp(param1:int) : void
      {
         this.eahp1 = Math.ceil(Math.random() * 100);
         this.eahp2 = param1 - this.eahp1;
      }
      
      public function geteahp(param1:Boolean = false) : int
      {
         if(!param1)
         {
            return this.eahp1 + this.eahp2 + this.getSehpValue();
         }
         return this.eahp1 + this.eahp2;
      }
      
      public function seteamp(param1:int) : void
      {
         this.eamp1 = Math.ceil(Math.random() * 100);
         this.eamp2 = param1 - this.eamp1;
      }
      
      public function geteamp(param1:Boolean = false) : int
      {
         if(!param1)
         {
            return this.eamp1 + this.eamp2 + this.getSempValue();
         }
         return this.eamp1 + this.eamp2;
      }
      
      public function seteatblood(param1:Number) : void
      {
         this.eatblood1 = Math.ceil(Math.random() * 100);
         this.eatblood2 = param1 - this.eatblood1;
      }
      
      public function geteatblood(param1:Boolean = false) : Number
      {
         var _loc2_:Number = this.eatblood1 + this.eatblood2;
         if(!param1)
         {
            return (_loc2_ + this.getSebloValue()).toFixed(4);
         }
         return _loc2_.toFixed(4);
      }
      
      public function sethaveblood(param1:Number) : void
      {
         this.haveblood1 = Math.ceil(Math.random() * 100);
         this.haveblood2 = param1 - this.haveblood1;
      }
      
      public function gethaveblood(param1:Boolean = false) : Number
      {
         var _loc2_:Number = this.haveblood1 + this.haveblood2;
         if(!param1)
         {
            return _loc2_ + this.getShbdValue();
         }
         return _loc2_;
      }
      
      public function setmagicdef(param1:Number) : void
      {
         this.magicdef1 = Math.ceil(Math.random() * 100);
         this.magicdef2 = param1 - this.magicdef1;
      }
      
      public function getmagicdef(param1:Boolean = false) : Number
      {
         var _loc2_:Number = this.magicdef1 + this.magicdef2;
         if(!param1)
         {
            return (_loc2_ + this.getSmdefValue()).toFixed(2);
         }
         return _loc2_.toFixed(2);
      }
      
      public function setdeephit(param1:Number) : void
      {
         this.deephit1 = Math.ceil(Math.random() * 100);
         this.deephit2 = param1 - this.deephit1;
      }
      
      public function getdeephit(param1:Boolean = false) : Number
      {
         var _loc2_:Number = this.deephit1 + this.deephit2;
         if(!param1)
         {
            return (_loc2_ + this.getSdhitValue()).toFixed(2);
         }
         return _loc2_.toFixed(2);
      }
      
      public function setstrengthValue(param1:int) : void
      {
         this.strengthValue1 = Math.ceil(Math.random() * 100);
         this.strengthValue2 = param1 - this.strengthValue1;
      }
      
      public function getStrengthValue() : int
      {
         return this.strengthValue1 + this.strengthValue2;
      }
      
      public function setShpValue(param1:int) : void
      {
         this.shpVal1 = Math.ceil(Math.random() * 100);
         this.shpVal2 = param1 - this.shpVal1;
      }
      
      public function getShpValue() : int
      {
         return this.shpVal1 + this.shpVal2;
      }
      
      public function setSmpValue(param1:int) : void
      {
         this.smpVal1 = Math.ceil(Math.random() * 100);
         this.smpVal2 = param1 - this.smpVal1;
      }
      
      public function getSmpValue() : int
      {
         return this.smpVal1 + this.smpVal2;
      }
      
      public function setSatkValue(param1:int) : void
      {
         this.satkVal1 = Math.ceil(Math.random() * 100);
         this.satkVal2 = param1 - this.satkVal1;
      }
      
      public function getSatkValue() : int
      {
         return this.satkVal1 + this.satkVal2;
      }
      
      public function setSdefValue(param1:int) : void
      {
         this.sdefVal1 = Math.ceil(Math.random() * 100);
         this.sdefVal2 = param1 - this.sdefVal1;
      }
      
      public function getSdefValue() : int
      {
         return this.sdefVal1 + this.sdefVal2;
      }
      
      public function setSehpValue(param1:int) : void
      {
         this.sehpVal1 = Math.ceil(Math.random() * 100);
         this.sehpVal2 = param1 - this.sehpVal1;
      }
      
      public function getSehpValue() : int
      {
         return this.sehpVal1 + this.sehpVal2;
      }
      
      public function setSempValue(param1:int) : void
      {
         this.sempVal1 = Math.ceil(Math.random() * 100);
         this.sempVal2 = param1 - this.sempVal1;
      }
      
      public function getSempValue() : int
      {
         return this.sempVal1 + this.sempVal2;
      }
      
      public function setScritValue(param1:Number) : void
      {
         this.scritVal1 = Math.ceil(Math.random() * 100);
         this.scritVal2 = param1 - this.scritVal1;
      }
      
      public function getScritValue() : Number
      {
         return Math.ceil((this.scritVal1 + this.scritVal2) * 100) / 100;
      }
      
      public function setSmissValue(param1:Number) : void
      {
         this.smissVal1 = Math.ceil(Math.random() * 100);
         this.smissVal2 = param1 - this.smissVal1;
      }
      
      public function getSmissValue() : Number
      {
         return Math.ceil((this.smissVal1 + this.smissVal2) * 100) / 100;
      }
      
      public function setSebolValue(param1:Number) : void
      {
         this.sebolVal1 = Math.ceil(Math.random() * 100);
         this.sebolVal2 = param1 - this.sebolVal1;
      }
      
      public function getSebloValue() : Number
      {
         return Number(this.sebolVal1 + this.sebolVal2);
      }
      
      public function setSmdefValue(param1:Number) : void
      {
         this.smdefVal1 = Math.ceil(Math.random() * 100);
         this.smdefVal2 = param1 - this.smdefVal1;
      }
      
      public function getSmdefValue() : Number
      {
         return Number(this.smdefVal1 + this.smdefVal2);
      }
      
      public function setSdhitValue(param1:Number) : void
      {
         this.sdhitVal1 = Math.ceil(Math.random() * 100);
         this.sdhitVal2 = param1 - this.sdhitVal1;
      }
      
      public function getSdhitValue() : Number
      {
         return Number(this.sdhitVal1 + this.sdhitVal2);
      }
      
      public function setShbdValue(param1:Number) : void
      {
         this.shbdVal1 = Math.ceil(Math.random() * 100);
         this.shbdVal2 = param1 - this.shbdVal1;
      }
      
      public function getShbdValue() : Number
      {
         return Number(this.shbdVal1 + this.shbdVal2);
      }
      
      private function getDeCodeValue(param1:Number) : int
      {
         return Math.round(param1 * 100 + 21);
      }
      
      private function getDeCodeNumber(param1:Number) : Number
      {
         return AUtils.numberAdd(11.5,param1,2);
      }
      
      private function enCodeNumber(param1:Number) : Number
      {
         return AUtils.numberSub(param1,11.5,2);
      }
      
      private function enCodeValue(param1:int) : Number
      {
         return (param1 - 21) / 100;
      }
      
      private function enCodeString(param1:String) : Array
      {
         var _loc2_:uint = uint(param1.length);
         var _loc3_:* = [];
         var _loc4_:int = 0;
         while(_loc4_ < _loc2_)
         {
            _loc3_.push(param1.charAt(_loc4_));
            _loc4_++;
         }
         return _loc3_;
      }
      
      private function getDeCodeString(param1:Array) : String
      {
         var _loc2_:uint = param1.length;
         var _loc3_:String = "";
         var _loc4_:int = 0;
         while(_loc4_ < _loc2_)
         {
            _loc3_ += param1[_loc4_];
            _loc4_++;
         }
         return _loc3_;
      }
      
      public function findUsedByShowId() : String
      {
         var _loc1_:String = "";
         if(this.showid == 100)
         {
            _loc1_ = "zzs";
         }
         else if(this.showid == 101)
         {
            _loc1_ = "bs";
         }
         return _loc1_;
      }
      
      public function isFashion() : Boolean
      {
         if(this.type == "zbsz" || this.type == "zbcb")
         {
            return true;
         }
         return false;
      }
      
      public function isSms() : Boolean
      {
         var _loc1_:int = int(this.getFillName().indexOf("sms"));
         if(_loc1_ != -1)
         {
            return true;
         }
         return false;
      }
      
      public function isMfs() : Boolean
      {
         var _loc1_:int = int(this.getFillName().indexOf("mfs"));
         if(_loc1_ != -1)
         {
            return true;
         }
         return false;
      }
      
      public function isGjs() : Boolean
      {
         var _loc1_:int = int(this.getFillName().indexOf("gjs"));
         if(_loc1_ != -1)
         {
            return true;
         }
         return false;
      }
      
      public function isFys() : Boolean
      {
         var _loc1_:int = int(this.getFillName().indexOf("fys"));
         if(_loc1_ != -1)
         {
            return true;
         }
         return false;
      }
      
      public function isTlz() : Boolean
      {
         var _loc1_:int = int(this.getFillName().indexOf("tlz"));
         if(_loc1_ != -1)
         {
            return true;
         }
         return false;
      }
      
      public function isLlz() : Boolean
      {
         var _loc1_:int = int(this.getFillName().indexOf("llz"));
         if(_loc1_ != -1)
         {
            return true;
         }
         return false;
      }
      
      public function isHlz() : Boolean
      {
         var _loc1_:int = int(this.getFillName().indexOf("hlz"));
         if(_loc1_ != -1)
         {
            return true;
         }
         return false;
      }
      
      public function isFlz() : Boolean
      {
         var _loc1_:int = int(this.getFillName().indexOf("flz"));
         if(_loc1_ != -1)
         {
            return true;
         }
         return false;
      }
      
      public function isSlz() : Boolean
      {
         var _loc1_:int = int(this.getFillName().indexOf("slz"));
         if(_loc1_ != -1)
         {
            return true;
         }
         return false;
      }
      
      private function isCanFallInGame() : Boolean
      {
         if(this.getFillName() == "wpqhs1" || this.getFillName() == "sms1" || this.getFillName() == "mfs1" || this.getFillName() == "fys1" || this.getFillName() == "gjs1" || this.getFillName() == "tlzsp" || this.getFillName() == "llzsp" || this.getFillName() == "hlzsp" || this.getFillName() == "flzsp" || this.getFillName() == "slzsp")
         {
            return true;
         }
         return false;
      }
   }
}

