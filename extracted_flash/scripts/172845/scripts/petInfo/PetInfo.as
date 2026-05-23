package petInfo
{
   import com.edgarcai.encrypt.*;
   import com.edgarcai.gamelogic.*;
   import config.*;
   import my.*;
   
   public class PetInfo
   {
      
      private var gc:Config;
      
      private var petName:String;
      
      private var petChinaName:String = "";
      
      public var isFight:uint = 0;
      
      public var skill:Array;
      
      private var doWhenLevelUp:Function = null;
      
      private var doWhenChangeState:Function = null;
      
      private var allSkill:Array;
      
      protected var _anti:Antiwear;
      
      private var defArr:Array;
      
      private var hpArr:Array;
      
      public function PetInfo()
      {
         this.gc = Config.getInstance();
         this._anti = new Antiwear(new binaryEncrypt());
         this.skill = [];
         this.defArr = [7,13,19,25,31,37,43,48,50,52,54,56,82,108,110,112,114,116,118,120,122,167,212,258,260,280,321,361,363,365,385,405,425,445,465,485,505,525,545,567,577,587,597,607,617,627,637,647,657,667,682,707,727,757,907,1257,1457,1657,1937,2027,2115,2178,2241,2304,2367,2430,2493,2556,2619,2682,2745,2808,2872,3013,3154,3295,3436,3577,3718,3862,4111,4118,4120,4122,4124,4501,4878,5255,5632,5998];
         this.hpArr = [280 * 3,280 * 3,290 * 3,300 * 3,310 * 3,360 * 3,450 * 3,660 * 3,710 * 3,750 * 3,800 * 3,860 * 3,910 * 3,960 * 3,1010 * 3,1060 * 3,1110 * 3,1160 * 3,1210 * 3,1517 * 3,1825 * 3,2058 * 3,2291 * 3,2525 * 3,2575 * 3,4000 * 3,5413 * 3,5873 * 3,6200 * 3,6593 * 3,7000 * 3,7593 * 3,8704 * 3,8847 * 3,8990 * 3,9133 * 3,9276 * 3,9419 * 3,9562 * 3,9705 * 3,9848 * 3,9991 * 3,10134 * 3,10389 * 3,10639 * 3,10889 * 3,11139 * 3,11389 * 3,11639 * 3,11889 * 3,12139 * 3,12389 * 3,12639 * 3,12889 * 3,13139 * 3,13389 * 3,13639 * 3,13889 * 3,14139 * 3,14389 * 3,14639 * 3,14889 * 3,15139 * 3,15397 * 3,16264 * 3,17161 * 3,18058 * 3,18995 * 3,19852 * 3,20749 * 3,21646 * 3,22543 * 3,23440 * 3,24337 * 3,25234 * 3,26131 * 3,27028 * 3,27925 * 3,28822 * 3,29719 * 3,30616 * 3,31513 * 3,32410 * 3,33307 * 3,34204 * 3,35101 * 3,35998 * 3,36895 * 3,37792 * 3,38689 * 3,39586 * 3,40563 * 3,40563 * 3];
         this.allSkill = ["tsml","zrsh","smzf","mfby","qlfj","sxkb","fsnl","smjc","mfjc","gjjc","fyjc"];
         super();
         this._anti.hp = 0;
         this._anti.shp = 0;
         this._anti.level = 0;
         this._anti.curExper = 0;
         this._anti.mp = 0;
         this._anti.smp = 0;
         this._anti.def = 0;
         this._anti.atk = 0;
         this._anti.hpQuality = 0;
         this._anti.mpQuality = 0;
         this._anti.atkQuality = 0;
         this._anti.defQuality = 0;
         this._anti.lifetime = 0;
         this._anti.quality = 0;
         this._anti.perception = 0;
         this._anti.technique = 0;
         this._anti.warpower = 0;
         this._anti.ehp = 0;
         this._anti.emp = 0;
         this._anti.miss = 0;
         this._anti.mDef = 0;
         this._anti.crit = 0;
         this._anti.moveSpeed = 5;
      }
      
      public function setPetNameAndLevel(param1:String, param2:uint = 1) : void
      {
         var _loc3_:String = param1.substr(0,param1.length - 1);
         var _loc4_:int = int(param1.charAt(param1.length - 1));
         var _loc5_:int = 1;
         if(param2 <= 15)
         {
            _loc5_ = 1;
         }
         else if(param2 > 15 && param2 <= 30)
         {
            _loc5_ = 2;
         }
         else
         {
            _loc5_ = _loc4_;
         }
         this.petName = _loc3_ + _loc5_;
         this.transPetChinaName();
         this.addSpecialSkill();
         this.setLevel(param2);
         this.setCurExper(0);
         this.setlifetime(100);
         this.upPassive();
         if(param2 == 1)
         {
            this.setquality(1);
         }
         else
         {
            this.setquality(2);
         }
         this.initPetInfoData();
      }
      
      public function upPassive() : void
      {
         var _loc1_:int = this.getLevel() / 5;
         this.setEHp(_loc1_ * 3);
         this.setEMp(_loc1_);
      }
      
      public function reSetPetState() : void
      {
         this.setHp(this.getSHp());
         this.setMp(this.getSMp());
      }
      
      private function initPetInfoData() : void
      {
         var _loc1_:String = this.petName.substr(0,this.petName.length - 1);
         if(_loc1_ == "monkey")
         {
            if(this.getquality() == 1)
            {
               this.sethpQuality(1040);
               this.setmpQuality(1040);
               this.setatkQuality(1040);
               this.setdefQuality(1040);
               this.setHp(this.hpArr[0]);
               this.setMp(150);
               this.setAtk(20);
               this.setDef(6);
            }
            else
            {
               this.sethpQuality(800);
               this.setmpQuality(800);
               this.setatkQuality(800);
               this.setdefQuality(800);
               this.setHp(this.hpArr[this.getLevel() - 1]);
               this.setMp(100 + Math.round(Math.random() * 50) + this.getmpQuality() * this.getLevel() * 0.08);
               this.setAtk(10 + Math.round(Math.random() * 10) + this.getatkQuality() * this.getLevel() * 0.015);
               this.setDef(int(this.defArr[this.getLevel() - 1] * 0.6));
            }
         }
         else if(_loc1_ == "horse")
         {
            if(this.getquality() == 1)
            {
               this.sethpQuality(949);
               this.setmpQuality(1222);
               this.setatkQuality(1105);
               this.setdefQuality((200 + 200) * 1.3);
               this.setHp(this.hpArr[0]);
               this.setMp(200);
               this.setAtk(25);
               this.setDef(6);
            }
            else
            {
               this.sethpQuality(530 + Math.round(Math.random() * 200));
               this.setmpQuality(640 + Math.round(Math.random() * 300));
               this.setatkQuality(650 + Math.round(Math.random() * 200));
               this.setdefQuality(200 + Math.round(Math.random() * 200));
               this.setHp(this.hpArr[this.getLevel() - 1]);
               this.setMp(150 + Math.round(Math.random() * 50) + this.getmpQuality() * this.getLevel() * 0.08);
               this.setAtk(15 + Math.round(Math.random() * 10) + this.getatkQuality() * this.getLevel() * 0.015);
               this.setDef(int(this.defArr[this.getLevel() - 1] * 0.6));
            }
         }
         else if(_loc1_ == "ufo")
         {
            if(this.getquality() == 1)
            {
               this.sethpQuality(1170);
               this.setmpQuality(1040);
               this.setatkQuality(1170);
               this.setdefQuality(351);
               this.setHp(this.hpArr[0]);
               this.setMp(150);
               this.setAtk(30);
               this.setDef(8);
            }
            else
            {
               this.sethpQuality(700 + Math.round(Math.random() * 200));
               this.setmpQuality(500 + Math.round(Math.random() * 300));
               this.setatkQuality(700 + Math.round(Math.random() * 200));
               this.setdefQuality(200 + Math.round(Math.random() * 70));
               this.setHp(200 + Math.round(Math.random() * 50) + this.gethpQuality() * this.getLevel() * 0.08);
               this.setMp(100 + Math.round(Math.random() * 50) + this.getmpQuality() * this.getLevel() * 0.08);
               this.setAtk(15 + Math.round(Math.random() * 15) + this.getatkQuality() * this.getLevel() * 0.015);
               this.setDef(int(this.defArr[this.getLevel() - 1] * 0.6));
            }
         }
         else if(_loc1_ == "tigress")
         {
            if(this.getquality() == 1)
            {
               this.sethpQuality(1300);
               this.setmpQuality(1040);
               this.setatkQuality(1300);
               this.setdefQuality(520);
               this.setHp(this.hpArr[0]);
               this.setMp(150);
               this.setAtk(30);
               this.setDef(8);
            }
            else
            {
               this.sethpQuality(800 + Math.round(Math.random() * 200));
               this.setmpQuality(500 + Math.round(Math.random() * 300));
               this.setatkQuality(800 + Math.round(Math.random() * 200));
               this.setdefQuality(300 + Math.round(Math.random() * 100));
               this.setHp(this.hpArr[this.getLevel() - 1]);
               this.setMp(100 + Math.round(Math.random() * 50) + this.getmpQuality() * this.getLevel() * 0.08);
               this.setAtk(15 + Math.round(Math.random() * 15) + this.getatkQuality() * this.getLevel() * 0.015);
               this.setDef(int(this.defArr[this.getLevel() - 1] * 0.6));
            }
         }
         else if(_loc1_ == "turtle")
         {
            if(this.getquality() == 1)
            {
               this.sethpQuality(1560);
               this.setmpQuality(910);
               this.setatkQuality(1170);
               this.setdefQuality(611);
               this.setHp(this.hpArr[0]);
               this.setMp(150);
               this.setAtk(25);
               this.setDef(10);
            }
            else
            {
               this.sethpQuality(1000 + Math.round(Math.random() * 200));
               this.setmpQuality(500 + Math.round(Math.random() * 200));
               this.setatkQuality(800 + Math.round(Math.random() * 100));
               this.setdefQuality(300 + Math.round(Math.random() * 170));
               this.setHp(this.hpArr[this.getLevel() - 1]);
               this.setMp(100 + Math.round(Math.random() * 50) + this.getmpQuality() * this.getLevel() * 0.08);
               this.setAtk(10 + Math.round(Math.random() * 15) + this.getatkQuality() * this.getLevel() * 0.015);
               this.setDef(int(this.defArr[this.getLevel() - 1] * 0.6));
            }
         }
         else if(_loc1_ == "phoenix")
         {
            if(this.getquality() == 1)
            {
               this.sethpQuality(1170);
               this.setmpQuality(1170);
               this.setatkQuality(1300);
               this.setdefQuality((200 + 200) * 1.3);
               this.setHp(this.hpArr[0]);
               this.setMp(200);
               this.setAtk(32);
               this.setDef(6);
            }
            else
            {
               this.sethpQuality(600 + Math.round(Math.random() * 300));
               this.setmpQuality(600 + Math.round(Math.random() * 300));
               this.setatkQuality(800 + Math.round(Math.random() * 200));
               this.setdefQuality(200 + Math.round(Math.random() * 200));
               this.setHp(this.hpArr[this.getLevel() - 1]);
               this.setMp(120 + Math.round(Math.random() * 80) + this.getmpQuality() * this.getLevel() * 0.08);
               this.setAtk(16 + Math.round(Math.random() * 16) + this.getatkQuality() * this.getLevel() * 0.015);
               this.setDef(int(this.defArr[this.getLevel() - 1] * 0.6));
            }
         }
         else if(_loc1_ == "dragon")
         {
            if(this.getquality() == 1)
            {
               this.sethpQuality(1430);
               this.setmpQuality(780);
               this.setatkQuality(1430);
               this.setdefQuality(520);
               this.setHp(this.hpArr[0]);
               this.setMp(200);
               this.setAtk(30);
               this.setDef(8);
            }
            else
            {
               this.sethpQuality(900 + Math.round(Math.random() * 200));
               this.setmpQuality(500 + Math.round(Math.random() * 100));
               this.setatkQuality(800 + Math.round(Math.random() * 300));
               this.setdefQuality(300 + Math.round(Math.random() * 100));
               this.setHp(this.hpArr[this.getLevel() - 1]);
               this.setMp(150 + Math.round(Math.random() * 50) + this.getmpQuality() * this.getLevel() * 0.08);
               this.setAtk(15 + Math.round(Math.random() * 15) + this.getatkQuality() * this.getLevel() * 0.015);
               this.setDef(int(this.defArr[this.getLevel() - 1] * 0.6));
            }
         }
         else if(_loc1_ == "rabbit")
         {
            if(this.getquality() == 1)
            {
               this.sethpQuality((800 + Math.round(Math.random() * 300)) * 1.3);
               this.setmpQuality((500 + Math.round(Math.random() * 400)) * 1.3);
               this.setatkQuality((800 + Math.round(Math.random() * 300)) * 1.3);
               this.setdefQuality((200 + Math.round(Math.random() * 200)) * 1.3);
               this.setHp(this.hpArr[0]);
               this.setMp(200);
               this.setAtk(30);
               this.setDef(5);
            }
            else
            {
               this.sethpQuality(800 + Math.round(Math.random() * 300));
               this.setmpQuality(500 + Math.round(Math.random() * 400));
               this.setatkQuality(800 + Math.round(Math.random() * 300));
               this.setdefQuality(200 + Math.round(Math.random() * 200));
               this.setHp(this.hpArr[this.getLevel() - 1]);
               this.setMp(200 + this.getmpQuality() * this.getLevel() * 0.08);
               this.setAtk(30 + this.getatkQuality() * this.getLevel() * 0.015);
               this.setDef(int(this.defArr[this.getLevel() - 1] * 0.6));
            }
         }
         else if(_loc1_ == "roomhorse")
         {
            if(this.getquality() == 1)
            {
               this.sethpQuality((700 + Math.round(Math.random() * 500)) * 1.3);
               this.setmpQuality((550 + Math.round(Math.random() * 440)) * 1.3);
               this.setatkQuality((1000 + Math.round(Math.random() * 300)) * 1.3);
               this.setdefQuality((200 + Math.round(Math.random() * 200)) * 1.3);
               this.setHp(this.hpArr[0]);
               this.setMp(800);
               this.setAtk(50);
               this.setDef(10);
            }
            else
            {
               this.sethpQuality(700 + Math.round(Math.random() * 500));
               this.setmpQuality(550 + Math.round(Math.random() * 440));
               this.setatkQuality(1000 + Math.round(Math.random() * 300));
               this.setdefQuality(200 + Math.round(Math.random() * 200));
               this.setHp(this.hpArr[this.getLevel() - 1]);
               this.setMp(200 + this.getmpQuality() * this.getLevel() * 0.08);
               this.setAtk(30 + this.getatkQuality() * this.getLevel() * 0.015);
               this.setDef(int(this.defArr[this.getLevel() - 1] * 0.6));
            }
         }
         else if(_loc1_ == "mouse")
         {
            if(this.getquality() == 1)
            {
               this.sethpQuality((700 + Math.round(Math.random() * 500)) * 1.3);
               this.setmpQuality((250 + Math.round(Math.random() * 440)) * 1.3);
               this.setatkQuality((1000 + Math.round(Math.random() * 300)) * 1.3);
               this.setdefQuality((200 + Math.round(Math.random() * 200)) * 1.3);
               this.setHp(this.hpArr[0]);
               this.setMp(800);
               this.setAtk(50);
               this.setDef(10);
            }
            else
            {
               this.sethpQuality(700 + Math.round(Math.random() * 500));
               this.setmpQuality(250 + Math.round(Math.random() * 440));
               this.setatkQuality(1000 + Math.round(Math.random() * 300));
               this.setdefQuality(200 + Math.round(Math.random() * 200));
               this.setHp(this.hpArr[this.getLevel() - 1]);
               this.setMp(200 + this.getmpQuality() * this.getLevel() * 0.08);
               this.setAtk(30 + this.getatkQuality() * this.getLevel() * 0.015);
               this.setDef(int(this.defArr[this.getLevel() - 1] * 0.6));
            }
         }
         else if(_loc1_ == "neat")
         {
            if(this.getquality() == 1)
            {
               this.sethpQuality((700 + Math.round(Math.random() * 500)) * 1.3);
               this.setmpQuality((250 + Math.round(Math.random() * 440)) * 1.3);
               this.setatkQuality((1000 + Math.round(Math.random() * 300)) * 1.3);
               this.setdefQuality((200 + Math.round(Math.random() * 200)) * 1.3);
               this.setHp(this.hpArr[0]);
               this.setMp(800);
               this.setAtk(50);
               this.setDef(10);
            }
            else
            {
               this.sethpQuality(700 + Math.round(Math.random() * 500));
               this.setmpQuality(250 + Math.round(Math.random() * 440));
               this.setatkQuality(1000 + Math.round(Math.random() * 300));
               this.setdefQuality(200 + Math.round(Math.random() * 200));
               this.setHp(this.hpArr[this.getLevel() - 1]);
               this.setMp(200 + this.getmpQuality() * this.getLevel() * 0.08);
               this.setAtk(30 + this.getatkQuality() * this.getLevel() * 0.015);
               this.setDef(int(this.defArr[this.getLevel() - 1] * 0.6));
            }
         }
         else if(_loc1_ == "nian")
         {
            if(this.getquality() == 1)
            {
               this.sethpQuality((700 + Math.round(Math.random() * 500)) * 1.3);
               this.setmpQuality((250 + Math.round(Math.random() * 440)) * 1.3);
               this.setatkQuality((1000 + Math.round(Math.random() * 300)) * 1.3);
               this.setdefQuality((200 + Math.round(Math.random() * 200)) * 1.3);
               this.setHp(this.hpArr[this.getLevel() - 1]);
               this.setMp(800);
               this.setAtk(50);
               this.setDef(10);
            }
            else
            {
               this.sethpQuality(700 + Math.round(Math.random() * 500));
               this.setmpQuality(250 + Math.round(Math.random() * 440));
               this.setatkQuality(1000 + Math.round(Math.random() * 300));
               this.setdefQuality(200 + Math.round(Math.random() * 200));
               this.setHp(this.hpArr[this.getLevel() - 1]);
               this.setMp(200 + this.getmpQuality() * this.getLevel() * 0.08);
               this.setAtk(30 + this.getatkQuality() * this.getLevel() * 0.015);
               this.setDef(int(this.defArr[this.getLevel() - 1] * 0.6));
            }
         }
         else if(_loc1_ == "terribletiger")
         {
            if(this.getquality() == 1)
            {
               this.sethpQuality((700 + Math.round(Math.random() * 500)) * 1.3);
               this.setmpQuality((250 + Math.round(Math.random() * 440)) * 1.3);
               this.setatkQuality((1000 + Math.round(Math.random() * 300)) * 1.3);
               this.setdefQuality((200 + Math.round(Math.random() * 200)) * 1.3);
               this.setHp(this.hpArr[this.getLevel() - 1]);
               this.setMp(800);
               this.setAtk(50);
               this.setDef(10);
            }
            else
            {
               this.sethpQuality(700 + Math.round(Math.random() * 500));
               this.setmpQuality(250 + Math.round(Math.random() * 440));
               this.setatkQuality(1000 + Math.round(Math.random() * 300));
               this.setdefQuality(200 + Math.round(Math.random() * 200));
               this.setHp(this.hpArr[this.getLevel() - 1]);
               this.setMp(200 + this.getmpQuality() * this.getLevel() * 0.08);
               this.setAtk(30 + this.getatkQuality() * this.getLevel() * 0.015);
               this.setDef(int(this.defArr[this.getLevel() - 1] * 0.6));
            }
         }
         this.setSHp(this.getHp());
         this.setSMp(this.getMp());
         if(this.getquality() == 1)
         {
            this.setperception(4 + Math.round(Math.random() * 3));
            this.setwarpower(4 + Math.round(Math.random() * 4));
            this.settechnique(4 + Math.round(Math.random() * 4));
         }
         else
         {
            this.setperception(1 + Math.round(Math.random() * 3));
            this.setwarpower(1 + Math.round(Math.random() * 2));
            this.settechnique(1 + Math.round(Math.random() * 2));
         }
      }
      
      public function refreshTherrAttributeByImmortality() : void
      {
         if(this.getperception() >= 5)
         {
            if(Math.random() <= 0.6)
            {
               this.setperception(this.getperception() - 1);
            }
            else if(Math.random() <= 0.35 && this.getperception() <= 7)
            {
               this.setperception(this.getperception() + 1);
            }
            else if(Math.random() <= 0.2 && this.getperception() <= 6)
            {
               this.setperception(this.getperception() + 2);
            }
            else
            {
               this.setperception(Math.round(Math.random() * 5) + 3);
            }
         }
         else if(1 != this.getquality())
         {
            this.setperception(Math.round(Math.random() * 4));
         }
         else
         {
            this.setperception(Math.round(Math.random() * 4) + 1);
         }
         if(this.gettechnique() >= 5)
         {
            if(Math.random() <= 0.6)
            {
               this.settechnique(this.gettechnique() - 1);
            }
            else if(Math.random() <= 0.35 && this.gettechnique() <= 7)
            {
               this.settechnique(this.gettechnique() + 1);
            }
            else if(Math.random() <= 0.2 && this.gettechnique() <= 6)
            {
               this.settechnique(this.gettechnique() + 2);
            }
            else
            {
               this.settechnique(Math.round(Math.random() * 5) + 3);
            }
         }
         else if(1 != this.getquality())
         {
            this.settechnique(Math.round(Math.random() * 4));
         }
         else
         {
            this.settechnique(Math.round(Math.random() * 4) + 1);
         }
         if(this.getwarpower() >= 5)
         {
            if(Math.random() <= 0.6)
            {
               this.setwarpower(this.getwarpower() - 1);
            }
            else if(Math.random() <= 0.35 && this.getwarpower() <= 7)
            {
               this.setwarpower(this.getwarpower() + 1);
            }
            else if(Math.random() <= 0.2 && this.getwarpower() <= 6)
            {
               this.setwarpower(this.getwarpower() + 2);
            }
            else
            {
               this.setwarpower(Math.round(Math.random() * 5) + 3);
            }
         }
         else if(1 != this.getquality())
         {
            this.setwarpower(Math.round(Math.random() * 4));
         }
         else
         {
            this.setwarpower(Math.round(Math.random() * 4) + 1);
         }
      }
      
      public function makePetBecomeChild() : void
      {
         this.setLevel(1);
         var _loc1_:String = this.petName.substr(0,this.petName.length - 1);
         this.petName = _loc1_ + "1";
         this.transPetChinaName();
         this.setCurExper(0);
         if(this.getquality() != 1)
         {
            this.setquality(1);
         }
         this.initPetInfoData();
      }
      
      public function refreshPetAllSkillByLevel() : void
      {
         this.deletePassiveWhenUpdata();
         this.allSkill = ["tsml","zrsh","smzf","mfby","qlfj","sxkb","fsnl","smjc","mfjc","gjjc","fyjc"];
         this.skill = [];
         this.rePetSkill();
      }
      
      private function rePetSkill() : void
      {
         var _loc1_:int = int(this.petName.charAt(this.petName.length - 1));
         var _loc2_:String = this.petName.substr(0,this.petName.length - 1);
         if(_loc2_ == "monkey")
         {
            if(_loc1_ == 1)
            {
               this.allSkill.push("xj");
            }
            else if(_loc1_ == 2)
            {
               this.allSkill.push("xj","lj");
            }
            else if(_loc1_ == 3)
            {
               this.allSkill.push("xj","lj","lyq");
            }
            else if(_loc1_ == 4)
            {
               this.allSkill.push("xj","lj","lyq","jgaoyi");
            }
         }
         else if(_loc2_ == "horse")
         {
            if(_loc1_ == 1)
            {
               this.allSkill.push("sp");
            }
            else if(_loc1_ == 2)
            {
               this.allSkill.push("sp","bd");
            }
            else if(_loc1_ == 3)
            {
               this.allSkill.push("sp","bd","bz");
            }
            else if(_loc1_ == 4)
            {
               this.allSkill.push("sp","bd","bz","tmaoyi");
            }
         }
         else if(_loc2_ == "ufo")
         {
            if(_loc1_ == 1)
            {
               this.allSkill.push("pms");
            }
            else if(_loc1_ == 2)
            {
               this.allSkill.push("pms","ss");
            }
            else if(_loc1_ == 3)
            {
               this.allSkill.push("pms","ss","kmsk");
            }
            else if(_loc1_ == 4)
            {
               this.allSkill.push("pms","ss","kmsk");
            }
         }
         else if(_loc2_ == "tigress")
         {
            if(_loc1_ == 1)
            {
               this.allSkill.push("hy");
            }
            else if(_loc1_ == 2)
            {
               this.allSkill.push("hy","sxhz");
            }
            else if(_loc1_ == 3)
            {
               this.allSkill.push("hy","sxhz","hsqj");
            }
            else if(_loc1_ == 4)
            {
               this.allSkill.push("hy","sxhz","hsqj","bhaoyi");
            }
         }
         else if(_loc2_ == "turtle")
         {
            if(_loc1_ == 1)
            {
               this.allSkill.push("sld");
            }
            else if(_loc1_ == 2)
            {
               this.allSkill.push("sld","txlj");
            }
            else if(_loc1_ == 3)
            {
               this.allSkill.push("sld","txlj","sybh");
            }
            else if(_loc1_ == 4)
            {
               this.allSkill.push("sld","txlj","sybh","xwaoyi");
            }
         }
         else if(_loc2_ == "phoenix")
         {
            if(_loc1_ == 1)
            {
               this.allSkill.push("np");
            }
            else if(_loc1_ == 2)
            {
               this.allSkill.push("np","bshn");
            }
            else if(_loc1_ == 3)
            {
               this.allSkill.push("np","bshn","dhly");
            }
            else if(_loc1_ == 4)
            {
               this.allSkill.push("np","bshn","dhly","zqaoyi");
            }
         }
         else if(_loc2_ == "dragon")
         {
            if(_loc1_ == 1)
            {
               this.allSkill.push("fs");
            }
            else if(_loc1_ == 2)
            {
               this.allSkill.push("fs","sdcc");
            }
            else if(_loc1_ == 3)
            {
               this.allSkill.push("fs","sdcc","ltwj");
            }
            else if(_loc1_ == 4)
            {
               this.allSkill.push("fs","sdcc","ltwj","qlaoyi");
            }
         }
         else if(_loc2_ == "rabbit")
         {
            if(_loc1_ == 1)
            {
               this.allSkill.push("yg");
            }
            else if(_loc1_ == 2)
            {
               this.allSkill.push("yg","jf");
            }
            else if(_loc1_ == 3)
            {
               this.allSkill.push("yg","jf","bs");
            }
            else if(_loc1_ == 4)
            {
               this.allSkill.push("yg","jf","bs","ysaoyi");
            }
         }
         else if(_loc2_ == "roomhorse")
         {
            if(_loc1_ == 1)
            {
               this.allSkill.push("hybt");
            }
            else if(_loc1_ == 2)
            {
               this.allSkill.push("hybt");
            }
            else if(_loc1_ == 3)
            {
               this.allSkill.push("hybt");
            }
            else if(_loc1_ == 4)
            {
               this.allSkill.push("hybt","hhjt");
            }
         }
         else if(_loc2_ == "mouse")
         {
            if(_loc1_ == 1)
            {
               this.allSkill.push("sc");
            }
            else if(_loc1_ == 2)
            {
               this.allSkill.push("sc");
            }
            else if(_loc1_ == 3)
            {
               this.allSkill.push("sc");
            }
            else if(_loc1_ == 4)
            {
               this.allSkill.push("sc","hxfb","zsaoyi");
            }
         }
         else if(_loc2_ == "neat")
         {
            if(_loc1_ == 1)
            {
               this.allSkill.push("mnsz");
            }
            else if(_loc1_ == 2)
            {
               this.allSkill.push("mnsz");
            }
            else if(_loc1_ == 3)
            {
               this.allSkill.push("mnsz");
            }
            else if(_loc1_ == 4)
            {
               this.allSkill.push("mnsz","mljt","cnaoyi");
            }
         }
         else if(_loc2_ == "nian")
         {
            if(_loc1_ == 1)
            {
               this.allSkill.push("qxyl");
            }
            else if(_loc1_ == 2)
            {
               this.allSkill.push("qxyl");
            }
            else if(_loc1_ == 3)
            {
               this.allSkill.push("qxyl");
            }
            else if(_loc1_ == 4)
            {
               this.allSkill.push("qxyl","bhjm");
            }
            else if(_loc1_ == 5)
            {
               this.allSkill.push("qxyl","bhjm","jhgy");
            }
         }
         else if(_loc2_ == "terribletiger")
         {
            if(_loc1_ == 1)
            {
               this.allSkill.push("hx");
            }
            else if(_loc1_ == 2)
            {
               this.allSkill.push("hx");
            }
            else if(_loc1_ == 3)
            {
               this.allSkill.push("hx");
            }
            else if(_loc1_ == 4)
            {
               this.allSkill.push("hx","mhxs");
            }
         }
         var _loc3_:uint = 2;
         while(_loc3_ <= this.getLevel())
         {
            this.studySkillSuddenly(_loc3_);
            _loc3_++;
         }
         this.addPassiveAfterUpdata();
      }
      
      public function getPetName() : String
      {
         return this.petName;
      }
      
      public function getPetChinaName() : String
      {
         return this.petChinaName;
      }
      
      public function getIntroByName(param1:String) : String
      {
         var _loc2_:* = "";
         var _loc3_:Object = this.getPetHarmObj(param1);
         switch(param1)
         {
            case "tsml":
               _loc2_ = "被动增加宠物攻击" + Math.round(_loc3_.first) + "点";
               break;
            case "zrsh":
               _loc2_ = "被动增加宠物防御" + Math.round(_loc3_.first) + "点";
               break;
            case "smzf":
               _loc2_ = "被动增加宠物生命" + Math.round(_loc3_.first) + "点";
               break;
            case "mfby":
               _loc2_ = "被动增加宠物魔法" + Math.round(_loc3_.first) + "点";
               break;
            case "qlfj":
               _loc2_ = "宠物被攻击时有" + int(Number(_loc3_.first) * 100) + "%的概率发动反击";
               break;
            case "sxkb":
               _loc2_ = "提升宠物物理暴击率" + int(Number(_loc3_.first) * 100) + "%,持续" + _loc3_.second + "s";
               break;
            case "fsnl":
               _loc2_ = "提升宠物技能伤害" + Math.round(_loc3_.first) + "点,持续" + _loc3_.second + "s";
               break;
            case "smjc":
               _loc2_ = "提升主人" + Math.round(_loc3_.first) + "点生命,持续" + _loc3_.second + "s";
               break;
            case "mfjc":
               _loc2_ = "提升主人" + Math.round(_loc3_.first) + "点魔法,持续" + _loc3_.second + "s";
               break;
            case "gjjc":
               _loc2_ = "提升主人" + Math.round(_loc3_.first) + "点攻击,持续" + _loc3_.second + "s";
               break;
            case "fyjc":
               _loc2_ = "提升主人" + Math.round(_loc3_.first) + "点防御,持续" + _loc3_.second + "s";
               break;
            case "xj":
               _loc2_ = "附近有怪物时，自动燃烧，对怪物造成火焰伤害";
               break;
            case "lj":
               _loc2_ = "对怪物造成多次伤害";
               break;
            case "lyq":
               _loc2_ = "对前方怪物造成火焰伤害，附带灼烧效果";
               break;
            case "jgaoyi":
               _loc2_ = "拥有献祭、连击、烈焰拳才能发挥出奥义的最大威力";
               break;
            case "sp":
               _loc2_ = "吐出水泡攻击前方怪物";
               break;
            case "bd":
               _loc2_ = "对攻击（靠近）它的怪物造成冰冻效果";
               break;
            case "bz":
               _loc2_ = "对大范围的怪物造成伤害";
               break;
            case "tmaoyi":
               _loc2_ = "拥有水泡、冰冻、冰锥才能发挥出奥义的最大威力";
               break;
            case "pms":
               _loc2_ = "撕裂前方怪物";
               break;
            case "ss":
               _loc2_ = "瞬间闪烁到怪物后面";
               break;
            case "kmsk":
               _loc2_ = "飞到空中对下方怪物造成伤害";
               break;
            case "hy":
               _loc2_ = "撕咬前方怪物";
               break;
            case "sxhz":
               _loc2_ = "将怪物抓到空中，并吸取生命";
               break;
            case "hsqj":
               _loc2_ = "对前方怪物造成伤害";
               break;
            case "bhaoyi":
               _loc2_ = "拥有虎牙、嗜血虎爪、横扫千军才能发挥出奥义的最大威力";
               break;
            case "sld":
               _loc2_ = "恢复一定生命值，并对周围怪物造成伤害";
               break;
            case "txlj":
               _loc2_ = "宠物帮主人承受部分伤害，并一起恢复生命";
               break;
            case "sybh":
               _loc2_ = "对周围怪物造成伤害";
               break;
            case "xwaoyi":
               _loc2_ = "拥有水疗盾、同心链接、水湮八荒才能发挥出奥义的最大威力";
               break;
            case "np":
               _loc2_ = "当生命低于20%的时候将化成朱雀丹，数秒后满血复活";
               break;
            case "bshn":
               _loc2_ = "对前方怪物造成伤害";
               break;
            case "dhly":
               _loc2_ = "对周围怪物造成较大的伤害";
               break;
            case "zqaoyi":
               _loc2_ = "拥有涅磐、不死火鸟、地火燎原才能发挥出奥义的最大威力";
               break;
            case "fs":
               _loc2_ = "分身一起攻击敌人，分身消失后，会恢复生命";
               break;
            case "sdcc":
               _loc2_ = "释放闪电向前冲刺，对前方怪物造成伤害";
               break;
            case "ltwj":
               _loc2_ = "召唤雷电，对周围怪物造成伤害";
               break;
            case "qlaoyi":
               _loc2_ = "拥有分身、闪电冲刺、雷霆万钧才能发挥奥义的最大威力";
               break;
            case "yg":
               _loc2_ = "攻击时有概率落下一道月光";
               break;
            case "jf":
               _loc2_ = "提高宠物自身普通攻击频率和闪避能力";
               break;
            case "bs":
               _loc2_ = "飞到空中，狙击一个范围，附带冰冻";
               break;
            case "ysaoyi":
               _loc2_ = "制造一轮明月，增加触发月光概率，并且持续回复玉兔和主人的生命值";
               break;
            case "qxyl":
               _loc2_ = "连续落下七颗星，随机攻击附近怪物";
               break;
            case "bhjm":
               _loc2_ = "年兽怒吼，地动山摇，眩晕周围怪物并造成伤害";
               break;
            case "jhgy":
               _loc2_ = "召唤九个魂魄，当生命低于40%时，吸收一个魂魄，恢复50%的生命。";
               break;
            case "sc":
               _loc2_ = "低头倾身快速冲向前方怪物，进行撕咬攻击";
               break;
            case "hxfb":
               _loc2_ = "丢出三叉飞镖，之后飞回子鼠";
               break;
            case "zsaoyi":
               _loc2_ = "拥有鼠窜、回旋飞镖才能发挥出奥义的最大威力";
               break;
            case "mncz":
               _loc2_ = "侧身快速冲向前方怪物，有概率晕眩怪物";
               break;
            case "mljt":
               _loc2_ = "用力踩踏地面，产生地震或地裂效果";
               break;
            case "cnaoyi":
               _loc2_ = "拥有蛮牛冲撞、蛮力践踏才能发挥出奥义的最大威力";
               break;
            case "hybt":
               _loc2_ = "移动后沿路蔓延火焰";
               break;
            case "hhjt":
               _loc2_ = "践踏地面周围喷射出数道火花";
               break;
            case "hx":
               _loc2_ = "吼出声波，概率晕眩对前方所有的怪物";
               break;
            case "mhxs":
               _loc2_ = "扑向前方怪物，给与沉重的一击";
               break;
            case "yhaoyi":
               _loc2_ = "拥有虎啸、猛虎下山才能发挥出奥义的最大威力";
         }
         return _loc2_;
      }
      
      public function getPetHarmObj(param1:String) : Object
      {
         var _loc2_:* = {
            "first":0,
            "second":0
         };
         switch(param1)
         {
            case "tsml":
               _loc2_.first = this.getCurPetState() * 6 * this.getwarpower();
               break;
            case "zrsh":
               _loc2_.first = this.getCurPetState() * 4 * this.gettechnique();
               break;
            case "smzf":
               _loc2_.first = this.getCurPetState() * 50 * this.getwarpower();
               break;
            case "mfby":
               _loc2_.first = this.getCurPetState() * 50 * this.gettechnique();
               break;
            case "qlfj":
               _loc2_.first = (0.05 + this.getCurPetState() / 100) * this.getwarpower();
               break;
            case "sxkb":
               _loc2_.first = this.getCurPetState() * 0.07 * this.gettechnique() * 0.27;
               _loc2_.second = (30 + this.getCurPetState() * 5) * this.getwarpower() / 2 * 0.6;
               break;
            case "fsnl":
               _loc2_.first = this.getCurPetState() * 30 * this.gettechnique();
               _loc2_.second = (30 + this.getCurPetState() * 5) * this.getwarpower() / 2 * 0.6;
               break;
            case "smjc":
               _loc2_.first = this.getCurPetState() * 70 * this.gettechnique();
               _loc2_.second = (30 + this.getCurPetState() * 5) * this.getwarpower() / 2 * 0.6;
               break;
            case "mfjc":
               _loc2_.first = this.getCurPetState() * 70 * this.gettechnique();
               _loc2_.second = (30 + this.getCurPetState() * 5) * this.getwarpower() / 2 * 0.6;
               break;
            case "gjjc":
               _loc2_.first = this.getCurPetState() * 6 * this.gettechnique();
               _loc2_.second = (30 + this.getCurPetState() * 5) * this.getwarpower() / 2 * 0.6;
               break;
            case "fyjc":
               _loc2_.first = this.getCurPetState() * 5 * this.gettechnique();
               _loc2_.second = (30 + this.getCurPetState() * 5) * this.getwarpower() / 2 * 0.6;
               break;
            case "xj":
               _loc2_.first = 2.6 * this.getAtk();
               break;
            case "lj":
               _loc2_.first = 4.2 * this.getAtk();
               break;
            case "lyq":
               _loc2_.first = 6.8 * this.getAtk();
               break;
            case "sp":
               _loc2_.first = 3.6 * this.getAtk();
               break;
            case "bd":
               _loc2_.first = 3.6 * this.getAtk();
               break;
            case "bz":
               _loc2_.first = 6.6 * this.getAtk();
               break;
            case "pms":
               _loc2_.first = 3.6 * this.getAtk();
               break;
            case "ss":
               _loc2_.first = 0;
               break;
            case "kmsk":
               _loc2_.first = 6 * this.getAtk();
               break;
            case "hy":
               _loc2_.first = 2 * this.getAtk();
               break;
            case "sxhz":
               _loc2_.first = 4 * this.getAtk();
               break;
            case "hsqj":
               _loc2_.first = 6 * this.getAtk();
               break;
            case "sld":
               _loc2_.first = this.getAtk();
               break;
            case "txlj":
               _loc2_.first = 5 * this.gettechnique();
               _loc2_.second = 4 * this.getwarpower();
               break;
            case "sybh":
               _loc2_.first = 5.4 * this.getAtk();
               break;
            case "np":
               _loc2_.first = 0;
               break;
            case "bshn":
               _loc2_.first = 3.6 * this.getAtk();
               break;
            case "dhly":
               _loc2_.first = 7.4 * this.getAtk();
               break;
            case "fs":
               _loc2_.first = 0;
               break;
            case "sdcc":
               _loc2_.first = 0.03 * this.getSHp() + 3 * this.getAtk();
               break;
            case "ltwj":
               _loc2_.first = 0.024 * this.getSHp() + 3.6 * 2 * this.getAtk();
               break;
            case "yg":
               _loc2_.first = 3.6 * this.getAtk();
               break;
            case "jf":
               _loc2_.first = 0;
               break;
            case "bs":
               _loc2_.first = 8 * this.getAtk();
               break;
            case "hybt":
               _loc2_.first = 1.5 * this.getAtk();
               break;
            case "hhjt":
               _loc2_.first = 1.25 * 6 * this.getAtk();
               break;
            case "sc":
               _loc2_.first = 1.3 * 2.2 * this.getAtk();
               break;
            case "hxfb":
               _loc2_.first = 0.69 * 5 * this.getAtk();
               break;
            case "ysaoyi":
            case "jgaoyi":
            case "tmaoyi":
            case "bhaoyi":
            case "zqaoyi":
            case "xwaoyi":
            case "qlaoyi":
            case "zsaoyi":
            case "cnaoyi":
            case "yhaoyi":
               _loc2_.first = 0;
         }
         _loc2_.first *= 1.05;
         return _loc2_;
      }
      
      private function getPassHarmByPetState(param1:String, param2:int) : int
      {
         var _loc3_:int = 0;
         switch(param1)
         {
            case "tsml":
               _loc3_ = param2 * 6 * this.getwarpower();
               break;
            case "zrsh":
               _loc3_ = param2 * 4 * this.gettechnique();
               break;
            case "smzf":
               _loc3_ = param2 * 50 * this.getwarpower();
               break;
            case "mfby":
               _loc3_ = param2 * 50 * this.gettechnique();
         }
         return _loc3_;
      }
      
      private function addSpecialSkill() : void
      {
         var _loc1_:String = "";
         var _loc2_:String = "";
         switch(this.petName)
         {
            case "monkey1":
               _loc1_ = "xj";
               break;
            case "monkey2":
               _loc2_ = "xj";
               _loc1_ = "lj";
               break;
            case "monkey3":
               _loc2_ = "lj";
               _loc1_ = "lyq";
               break;
            case "horse1":
               _loc1_ = "sp";
               break;
            case "horse2":
               _loc2_ = "sp";
               _loc1_ = "bd";
               break;
            case "horse3":
               _loc2_ = "bd";
               _loc1_ = "bz";
               break;
            case "ufo1":
               _loc1_ = "pms";
               break;
            case "ufo2":
               _loc2_ = "pms";
               _loc1_ = "ss";
               break;
            case "ufo3":
               _loc2_ = "ss";
               _loc1_ = "kmsk";
               break;
            case "tigress1":
               _loc1_ = "hy";
               break;
            case "tigress2":
               _loc2_ = "hy";
               _loc1_ = "sxhz";
               break;
            case "tigress3":
               _loc2_ = "sxhz";
               _loc1_ = "hsqj";
               break;
            case "turtle1":
               _loc1_ = "sld";
               break;
            case "turtle2":
               _loc2_ = "sld";
               _loc1_ = "txlj";
               break;
            case "turtle3":
               _loc2_ = "txlj";
               _loc1_ = "sybh";
               break;
            case "phoenix1":
               _loc1_ = "np";
               break;
            case "phoenix2":
               _loc2_ = "np";
               _loc1_ = "bshn";
               break;
            case "phoenix3":
               _loc2_ = "bshn";
               _loc1_ = "dhly";
               break;
            case "dragon1":
               _loc1_ = "fs";
               break;
            case "dragon2":
               _loc2_ = "fs";
               _loc1_ = "sdcc";
               break;
            case "dragon3":
               _loc2_ = "sdcc";
               _loc1_ = "ltwj";
               break;
            case "rabbit1":
               _loc1_ = "yg";
               break;
            case "rabbit2":
               _loc2_ = "yg";
               _loc1_ = "jf";
               break;
            case "rabbit3":
               _loc2_ = "jf";
               _loc1_ = "bs";
               break;
            case "roomhorse1":
               _loc1_ = "hybt";
               break;
            case "roomhorse2":
               _loc1_ = "hybt";
               break;
            case "roomhorse3":
               _loc1_ = "hybt";
               break;
            case "roomhorse4":
               _loc2_ = "hybt";
               _loc1_ = "hhjt";
               break;
            case "mouse1":
               _loc1_ = "sc";
               break;
            case "mouse2":
               _loc1_ = "sc";
               break;
            case "mouse3":
               _loc1_ = "sc";
               break;
            case "mouse4":
               _loc2_ = "sc";
               _loc1_ = "hxfb";
               break;
            case "neat1":
               _loc1_ = "mncz";
               break;
            case "neat2":
               _loc1_ = "mncz";
               break;
            case "neat3":
               _loc1_ = "mncz";
               break;
            case "neat4":
               _loc2_ = "mncz";
               _loc1_ = "mljt";
               break;
            case "nian1":
               _loc1_ = "qxyl";
               break;
            case "nian2":
               _loc1_ = "qxyl";
               break;
            case "nian3":
               _loc1_ = "qxyl";
               break;
            case "nian4":
               _loc2_ = "qxyl";
               _loc1_ = "bhjm";
               break;
            case "nian5":
               _loc2_ = "bhjm";
               _loc1_ = "jhgy";
               break;
            case "terribletiger1":
               _loc1_ = "hx";
               break;
            case "terribletiger2":
               _loc1_ = "hx";
               break;
            case "terribletiger3":
               _loc1_ = "hx";
               break;
            case "terribletiger4":
               _loc2_ = "hx";
               _loc1_ = "mhxs";
         }
         if(_loc2_ != "")
         {
            this.removeSomeSkillFromAllSkill(_loc2_);
         }
         if(_loc1_ != "")
         {
            if(!this.findHasStudySkill(_loc1_))
            {
               if(!this.findHasInAllSkill(_loc1_))
               {
                  this.allSkill.push(_loc1_);
               }
            }
         }
      }
      
      public function petUpdate() : void
      {
         var _loc1_:int = 0;
         var _loc2_:int = 0;
         var _loc3_:* = null;
         if(this.getLevel() < AllConsts.GAME_PET_MAXLEVEL)
         {
            _loc1_ = this.getPetNextExper();
            if(this.getCurExper() >= _loc1_)
            {
               this.deletePassiveWhenUpdata();
               this.setLevel(this.getLevel() + 1);
               _loc2_ = int(this.petName.charAt(this.petName.length - 1));
               if(this.getLevel() >= 16 && this.getLevel() < 30)
               {
                  if(_loc2_ == 1)
                  {
                     _loc3_ = this.petName.substr(0,this.petName.length - 1);
                     this.petName = _loc3_ + (_loc2_ + 1);
                     this.addSpecialSkill();
                     if(this.doWhenChangeState != null)
                     {
                        this.doWhenChangeState();
                     }
                     this.transPetChinaName();
                     this.changePetSkillIntroduce();
                  }
               }
               else if(this.getLevel() > 30)
               {
                  if(_loc2_ == 2)
                  {
                     _loc3_ = this.petName.substr(0,this.petName.length - 1);
                     this.petName = _loc3_ + (_loc2_ + 1);
                     this.addSpecialSkill();
                     if(this.doWhenChangeState != null)
                     {
                        this.doWhenChangeState();
                     }
                     this.transPetChinaName();
                     this.changePetSkillIntroduce();
                  }
               }
               this.studySkillSuddenly(this.getLevel());
               this.addPassiveAfterUpdata();
               this.reSetPetAttributeValue();
               this.upPassive();
               if(this.doWhenLevelUp != null)
               {
                  this.doWhenLevelUp();
               }
               this.setCurExper(this.getCurExper() - _loc1_);
            }
         }
      }
      
      public function theFourShape() : void
      {
         var _loc1_:String = null;
         var _loc2_:int = int(this.petName.charAt(this.petName.length - 1));
         if(_loc2_ == 3)
         {
            this.deletePassiveWhenUpdata();
            _loc1_ = this.petName.substr(0,this.petName.length - 1);
            this.petName = _loc1_ + (_loc2_ + 1);
            this.transPetChinaName();
            this.changePetSkillIntroduce();
            this.addPassiveAfterUpdata();
            this.studyEsoteric();
            if(this.doWhenChangeState != null)
            {
               this.doWhenChangeState();
            }
         }
      }
      
      public function studyEsoteric() : Boolean
      {
         var _loc1_:Object = null;
         var _loc2_:int = int(this.petName.charAt(this.petName.length - 1));
         var _loc3_:String = this.petName.substr(0,this.petName.length - 1);
         if(_loc3_ == "monkey")
         {
            if(this.skill.length >= 8)
            {
               return false;
            }
            _loc1_ = {
               "sname":"jgaoyi",
               "sinfo":this.getIntroByName("jgaoyi")
            };
            this.skill.push(_loc1_);
         }
         else if(_loc3_ == "horse")
         {
            if(this.skill.length >= 8)
            {
               return false;
            }
            _loc1_ = {
               "sname":"tmaoyi",
               "sinfo":this.getIntroByName("tmaoyi")
            };
            this.skill.push(_loc1_);
         }
         else if(_loc3_ == "dragon")
         {
            if(this.skill.length >= 8)
            {
               return false;
            }
            _loc1_ = {
               "sname":"qlaoyi",
               "sinfo":this.getIntroByName("qlaoyi")
            };
            this.skill.push(_loc1_);
         }
         else if(_loc3_ == "tigress")
         {
            if(this.skill.length >= 8)
            {
               return false;
            }
            _loc1_ = {
               "sname":"bhaoyi",
               "sinfo":this.getIntroByName("bhaoyi")
            };
            this.skill.push(_loc1_);
         }
         else if(_loc3_ == "phoenix")
         {
            if(this.skill.length >= 8)
            {
               return false;
            }
            _loc1_ = {
               "sname":"zqaoyi",
               "sinfo":this.getIntroByName("zqaoyi")
            };
            this.skill.push(_loc1_);
         }
         else if(_loc3_ == "turtle")
         {
            if(this.skill.length >= 8)
            {
               return false;
            }
            _loc1_ = {
               "sname":"xwaoyi",
               "sinfo":this.getIntroByName("xwaoyi")
            };
            this.skill.push(_loc1_);
         }
         else if(_loc3_ == "rabbit")
         {
            if(this.skill.length >= 8)
            {
               this.gc.alert("该宠物技能已满");
               return false;
            }
            _loc1_ = {
               "sname":"ysaoyi",
               "sinfo":this.getIntroByName("ysaoyi")
            };
            this.skill.push(_loc1_);
         }
         else if(_loc3_ == "mouse")
         {
            if(this.skill.length >= 8)
            {
               this.gc.alert("该宠物技能已满");
               return false;
            }
            _loc1_ = {
               "sname":"zsaoyi",
               "sinfo":this.getIntroByName("zsaoyi")
            };
            this.skill.push(_loc1_);
         }
         else if(_loc3_ == "neat")
         {
            if(this.skill.length >= 8)
            {
               this.gc.alert("该宠物技能已满");
               return false;
            }
            _loc1_ = {
               "sname":"cnaoyi",
               "sinfo":this.getIntroByName("cnaoyi")
            };
            this.skill.push(_loc1_);
         }
         else if(_loc3_ == "terribletiger")
         {
            if(this.skill.length >= 8)
            {
               this.gc.alert("该宠物技能已满");
               return false;
            }
            _loc1_ = {
               "sname":"yhaoyi",
               "sinfo":this.getIntroByName("yhaoyi")
            };
            this.skill.push(_loc1_);
         }
         else if(_loc3_ == "roomhorse")
         {
            return false;
         }
         return true;
      }
      
      private function reSetPetAttributeValue() : void
      {
         this.setSHp(this.hpArr[this.getLevel() - 1]);
         this.setHp(this.getSHp());
         this.setSMp(this.getSMp() + this.getmpQuality() * 0.08);
         this.setMp(this.getSMp());
         this.setAtk(this.getAtk() + this.getatkQuality() * 0.015);
         this.setDef(int(this.defArr[this.getLevel() - 1] * 0.9));
         if(this.getLevel() >= 60)
         {
            this.setMiss(this.getMiss() + 0.01 * Math.floor(Math.random() * 2));
            this.setMDef(this.getMDef() + 0.01 + 0.01 * Math.floor(Math.random() * 1));
            this.setCrit(this.getCrit() + 0.01 + 0.01 * Math.floor(Math.random() * 2));
         }
      }
      
      private function setPetValue(param1:String) : void
      {
         if(param1.indexOf("monkey") != -1)
         {
            this.setSHp(this.hpArr[this.getLevel() - 1]);
            this.setHp(this.getSHp());
            this.setSMp(150 + this.getmpQuality() * 0.08 * (this.getLevel() - 1));
            this.setMp(this.getSMp());
            this.setAtk(20 + this.getatkQuality() * 0.015 * (this.getLevel() - 1));
            this.setDef(int(this.defArr[this.getLevel() - 1] * 0.9));
         }
         if(param1.indexOf("horse") != -1)
         {
            this.setSHp(this.hpArr[this.getLevel() - 1]);
            this.setHp(this.getSHp());
            this.setSMp(250 + this.getmpQuality() * 0.08 * (this.getLevel() - 1));
            this.setMp(this.getSMp());
            this.setAtk(25 + this.getatkQuality() * 0.015 * (this.getLevel() - 1));
            this.setDef(int(this.defArr[this.getLevel() - 1] * 0.9));
         }
         if(param1.indexOf("ufo") != -1)
         {
            this.setSHp(this.hpArr[this.getLevel() - 1]);
            this.setHp(this.getSHp());
            this.setSMp(150 + this.getmpQuality() * 0.08 * (this.getLevel() - 1));
            this.setMp(this.getSMp());
            this.setAtk(30 + this.getatkQuality() * 0.015 * (this.getLevel() - 1));
            this.setDef(int(this.defArr[this.getLevel() - 1] * 0.9));
         }
         if(param1.indexOf("mouse") != -1)
         {
            this.setSHp(this.hpArr[this.getLevel() - 1]);
            this.setHp(this.getSHp());
            this.setSMp(200 + this.getmpQuality() * 0.08 * (this.getLevel() - 1));
            this.setMp(this.getSMp());
            this.setAtk(32 + this.getatkQuality() * 0.015 * (this.getLevel() - 1));
            this.setDef(int(this.defArr[this.getLevel() - 1] * 0.9));
         }
         if(param1.indexOf("dragon") != -1)
         {
            this.setSHp(this.hpArr[this.getLevel() - 1]);
            this.setHp(this.getSHp());
            this.setSMp(175 + this.getmpQuality() * 0.08 * (this.getLevel() - 1));
            this.setMp(this.getSMp());
            this.setAtk(25 + this.getatkQuality() * 0.015 * (this.getLevel() - 1));
            this.setDef(int(this.defArr[this.getLevel() - 1] * 0.9));
         }
         if(param1.indexOf("turtle") != -1)
         {
            this.setSHp(this.hpArr[this.getLevel() - 1]);
            this.setHp(this.getSHp());
            this.setSMp(150 + this.getmpQuality() * 0.08 * (this.getLevel() - 1));
            this.setMp(this.getSMp());
            this.setAtk(25 + this.getatkQuality() * 0.015 * (this.getLevel() - 1));
            this.setDef(int(this.defArr[this.getLevel() - 1] * 0.9));
         }
         if(param1.indexOf("tigress") != -1)
         {
            this.setSHp(this.hpArr[this.getLevel() - 1]);
            this.setHp(this.getSHp());
            this.setSMp(150 + this.getmpQuality() * 0.08 * (this.getLevel() - 1));
            this.setMp(this.getSMp());
            this.setAtk(30 + this.getatkQuality() * 0.015 * (this.getLevel() - 1));
            this.setDef(int(this.defArr[this.getLevel() - 1] * 0.9));
         }
         if(param1.indexOf("phoenix") != -1)
         {
            this.setSHp(this.hpArr[this.getLevel() - 1]);
            this.setHp(this.getSHp());
            this.setSMp(200 + this.getmpQuality() * 0.08 * (this.getLevel() - 1));
            this.setMp(this.getSMp());
            this.setAtk(32 + this.getatkQuality() * 0.015 * (this.getLevel() - 1));
            this.setDef(int(this.defArr[this.getLevel() - 1] * 0.9));
         }
         if(param1.indexOf("roomhorse") != -1)
         {
            this.setSHp(this.hpArr[this.getLevel() - 1]);
            this.setHp(this.getSHp());
            this.setSMp(800 + this.getmpQuality() * 0.08 * (this.getLevel() - 1));
            this.setMp(this.getSMp());
            this.setAtk(50 + this.getatkQuality() * 0.015 * (this.getLevel() - 1));
            this.setDef(int(this.defArr[this.getLevel() - 1] * 0.9));
         }
         if(param1.indexOf("rabbit") != -1)
         {
            this.setSHp(this.hpArr[this.getLevel() - 1]);
            this.setHp(this.getSHp());
            this.setSMp(200 + this.getmpQuality() * 0.08 * (this.getLevel() - 1));
            this.setMp(this.getSMp());
            this.setAtk(30 + this.getatkQuality() * 0.015 * (this.getLevel() - 1));
            this.setDef(int(this.defArr[this.getLevel() - 1] * 0.9));
         }
         this.addPassiveAfterUpdata();
      }
      
      public function getPetNextExper() : int
      {
         var _loc1_:int = 0;
         if(this.getLevel() <= 10)
         {
            _loc1_ = this.getLevel() * 50;
         }
         else
         {
            _loc1_ = (this.getLevel() + 1) * (this.getLevel() + 1) * (5 + (this.getLevel() - 10) * 2);
         }
         return _loc1_;
      }
      
      public function getCurPetState() : uint
      {
         var _loc1_:String = this.petName.charAt(this.petName.length - 1);
         return int(_loc1_);
      }
      
      public function findHasStudySkill(param1:String) : Boolean
      {
         var _loc2_:uint = this.skill.length;
         while(_loc2_-- > 0)
         {
            if(param1 == this.skill[_loc2_].sname)
            {
               return true;
            }
         }
         return false;
      }
      
      private function removeSomeSkillFromAllSkill(param1:String) : void
      {
         var _loc2_:int = int(this.allSkill.indexOf(param1));
         if(_loc2_ != -1)
         {
            this.allSkill.splice(_loc2_,1);
         }
      }
      
      private function findHasInAllSkill(param1:String) : Boolean
      {
         var _loc2_:uint = uint(this.allSkill.length);
         while(_loc2_-- > 0)
         {
            if(param1 == this.allSkill[_loc2_])
            {
               return true;
            }
         }
         return false;
      }
      
      public function studySkillSuddenly(param1:uint) : void
      {
         var _loc2_:* = null;
         var _loc3_:int = 0;
         while(_loc3_ < 100)
         {
            if(param1 == 3 * (_loc3_ + 1) - 1)
            {
               break;
            }
            if(_loc3_ == 59)
            {
               return;
            }
            _loc3_++;
         }
         if(this.skill.length >= this.getperception())
         {
            return;
         }
         if(Math.random() > 0.4)
         {
            return;
         }
         var _loc4_:uint = uint(this.allSkill.length);
         var _loc5_:uint = Math.random() * _loc4_;
         var _loc6_:int = int(this.allSkill.indexOf(this.allSkill[_loc5_]));
         if(_loc6_ != -1)
         {
            _loc2_ = {
               "sname":this.allSkill[_loc5_],
               "sinfo":this.getIntroByName(this.allSkill[_loc5_])
            };
            this.skill.push(_loc2_);
            this.allSkill.splice(_loc6_,1);
         }
      }
      
      public function changePetSkillIntroduce() : void
      {
         var _loc1_:uint = this.skill.length;
         while(_loc1_-- > 0)
         {
            this.skill[_loc1_].sinfo = this.getIntroByName(this.skill[_loc1_].sname);
         }
      }
      
      private function hasStudyPassiveSkill(param1:String) : void
      {
         var _loc2_:Object = this.getPetHarmObj(param1);
         if(param1 == "tsml")
         {
            this.setAtk(this.getAtk() + _loc2_.first);
         }
         else if(param1 == "zrsh")
         {
            this.setDef(this.getDef() + _loc2_.first);
         }
         else if(param1 == "smzf")
         {
            this.setHp(this.getHp() + _loc2_.first);
            this.setSHp(this.getSHp() + _loc2_.first);
         }
         else if(param1 == "mfby")
         {
            this.setMp(this.getMp() + _loc2_.first);
            this.setSMp(this.getSMp() + _loc2_.first);
         }
      }
      
      private function deletePassiveWhenUpdata() : void
      {
         var _loc1_:uint = this.skill.length;
         var _loc2_:String = "";
         var _loc3_:* = {
            "first":0,
            "second":0
         };
         while(_loc1_-- > 0)
         {
            _loc2_ = this.skill[_loc1_].sname;
            _loc3_ = this.getPetHarmObj(_loc2_);
            if(_loc2_ == "tsml")
            {
               this.setAtk(this.getAtk() - _loc3_.first);
            }
            else if(_loc2_ == "zrsh")
            {
               this.setDef(this.getDef() - _loc3_.first);
            }
            else if(_loc2_ == "smzf")
            {
               if(this.getHp() > _loc3_.first)
               {
                  this.setHp(this.getHp() - _loc3_.first);
               }
               this.setSHp(this.getSHp() - _loc3_.first);
            }
            else if(_loc2_ == "mfby")
            {
               if(this.getMp() > _loc3_.first)
               {
                  this.setMp(this.getMp() - _loc3_.first);
               }
               this.setSMp(this.getSMp() - _loc3_.first);
            }
         }
      }
      
      private function addPassiveAfterUpdata() : void
      {
         var _loc1_:uint = this.skill.length;
         var _loc2_:String = "";
         while(_loc1_-- > 0)
         {
            _loc2_ = this.skill[_loc1_].sname;
            this.hasStudyPassiveSkill(_loc2_);
         }
      }
      
      public function findPetUsedMagic(param1:String) : uint
      {
         switch(param1)
         {
            case "tsml":
            case "zrsh":
            case "smzf":
            case "mfby":
            case "qlfj":
               return 0;
            case "sxkb":
            case "fsnl":
            case "smjc":
            case "mfjc":
            case "gjjc":
            case "fyjc":
               return 20;
            case "xj":
               return 20;
            case "lj":
               return 20;
            case "lyq":
               return 20;
            case "sp":
               return 20;
            case "bd":
               return 20;
            case "bz":
               return 20;
            case "pms":
               return 20;
            case "ss":
               return 20;
            case "kmsk":
               return 20;
            case "hy":
               return 20;
            case "sxhz":
               return 20;
            case "hsqj":
               return 20;
            case "sld":
               return 20;
            case "txlj":
               return 20;
            case "sybh":
               return 20;
            case "np":
               return 20;
            case "bshn":
               return 20;
            case "dhly":
               return 20;
            case "fs":
               return 20;
            case "sdcc":
               return 20;
            case "ltwj":
               return 20;
            case "yg":
               return 0;
            case "jf":
               return 20;
            case "bs":
               return 20;
            case "hybt":
               return 20;
            case "hhjt":
               return 20;
            case "sc":
               return 15;
            case "hxfb":
               return 20;
            case "jgaoyi":
            case "tmaoyi":
            case "bhaoyi":
            case "xwaoyi":
            case "zqaoyi":
            case "qlaoyi":
            case "ysaoyi":
            case "zsaoyi":
            case "cnaoyi":
               return 30;
            default:
               return 0;
         }
      }
      
      private function transPetChinaName() : void
      {
         switch(this.petName)
         {
            case "monkey1":
               this.petChinaName = "火丸";
               break;
            case "monkey2":
               this.petChinaName = "灵猴";
               break;
            case "monkey3":
               this.petChinaName = "火猿";
               break;
            case "monkey4":
               this.petChinaName = "烈焰金刚";
               break;
            case "horse1":
               this.petChinaName = "雪球";
               break;
            case "horse2":
               this.petChinaName = "雪马";
               break;
            case "horse3":
               this.petChinaName = "寒野";
               break;
            case "horse4":
               this.petChinaName = "极寒天马";
               break;
            case "ufo1":
               this.petChinaName = "小飞";
               break;
            case "ufo2":
               this.petChinaName = "裂云";
               break;
            case "ufo3":
               this.petChinaName = "冲霄";
               break;
            case "tigress1":
               this.petChinaName = "虎丸";
               break;
            case "tigress2":
               this.petChinaName = "白灵虎";
               break;
            case "tigress3":
               this.petChinaName = "白虎将军";
               break;
            case "tigress4":
               this.petChinaName = "白虎战神";
               break;
            case "turtle1":
               this.petChinaName = "龟布";
               break;
            case "turtle2":
               this.petChinaName = "墨玄龟";
               break;
            case "turtle3":
               this.petChinaName = "玄武将军";
               break;
            case "turtle4":
               this.petChinaName = "玄武大帝";
               break;
            case "phoenix1":
               this.petChinaName = "雀蛋";
               break;
            case "phoenix2":
               this.petChinaName = "炎皇雀";
               break;
            case "phoenix3":
               this.petChinaName = "朱雀将军";
               break;
            case "phoenix4":
               this.petChinaName = "朱雀女皇";
               break;
            case "dragon1":
               this.petChinaName = "龙仔";
               break;
            case "dragon2":
               this.petChinaName = "绿英龙";
               break;
            case "dragon3":
               this.petChinaName = "青龙将军";
               break;
            case "dragon4":
               this.petChinaName = "青龙妖圣";
               break;
            case "rabbit1":
               this.petChinaName = "月兔";
               break;
            case "rabbit2":
               this.petChinaName = "疾风兔";
               break;
            case "rabbit3":
               this.petChinaName = "寒冰玉兔";
               break;
            case "rabbit4":
               this.petChinaName = "冰霜月神";
               break;
            case "roomhorse1":
               this.petChinaName = "炎马";
               break;
            case "roomhorse2":
               this.petChinaName = "炎马";
               break;
            case "roomhorse3":
               this.petChinaName = "炎马";
               break;
            case "roomhorse4":
               this.petChinaName = "烈迦";
               break;
            case "mouse1":
               this.petChinaName = "子鼠元帅";
               break;
            case "mouse2":
               this.petChinaName = "子鼠元帅";
               break;
            case "mouse3":
               this.petChinaName = "子鼠元帅";
               break;
            case "mouse4":
               this.petChinaName = "子鼠大元帅";
               break;
            case "neat1":
               this.petChinaName = "丑牛元帅";
               break;
            case "neat2":
               this.petChinaName = "丑牛元帅";
               break;
            case "neat3":
               this.petChinaName = "丑牛元帅";
               break;
            case "neat4":
               this.petChinaName = "丑牛大元帅";
               break;
            case "nian1":
               this.petChinaName = "小年兽";
               break;
            case "nian2":
               this.petChinaName = "小年兽";
               break;
            case "nian3":
               this.petChinaName = "小年兽";
               break;
            case "nian4":
               this.petChinaName = "年兽";
               break;
            case "nian5":
               this.petChinaName = "大年兽";
               break;
            case "terribletiger1":
               this.petChinaName = "寅虎元帅";
               break;
            case "terribletiger2":
               this.petChinaName = "寅虎元帅";
               break;
            case "terribletiger3":
               this.petChinaName = "寅虎元帅";
               break;
            case "terribletiger4":
               this.petChinaName = "寅虎大元帅";
         }
      }
      
      public function transPetChinaSkillName(param1:String) : String
      {
         switch(param1)
         {
            case "tsml":
               return "天生蛮力";
            case "zrsh":
               return "自然守护";
            case "smzf":
               return "生命祝福";
            case "mfby":
               return "魔法庇佑";
            case "qlfj":
               return "强力反击";
            case "sxkb":
               return "嗜血狂暴";
            case "fsnl":
               return "法术能量";
            case "smjc":
               return "生命加成";
            case "mfjc":
               return "魔法加成";
            case "gjjc":
               return "攻击加成";
            case "fyjc":
               return "防御加成";
            case "xj":
               return "献祭";
            case "lj":
               return "连击";
            case "lyq":
               return "烈焰拳";
            case "jgaoyi":
               return "金刚奥义";
            case "sp":
               return "水泡";
            case "bd":
               return "冰冻";
            case "bz":
               return "冰锥";
            case "tmaoyi":
               return "天马奥义";
            case "pms":
               return "魔破杀";
            case "ss":
               return "瞬闪";
            case "kmsk":
               return "狂魔闪空";
            case "hy":
               return "虎牙";
            case "sxhz":
               return "嗜血虎爪";
            case "hsqj":
               return "横扫千军";
            case "bhaoyi":
               return "白虎奥义";
            case "sld":
               return "水疗盾";
            case "txlj":
               return "同心链接";
            case "sybh":
               return "水湮八荒";
            case "xwaoyi":
               return "玄武奥义";
            case "np":
               return "涅磐";
            case "bshn":
               return "不死火鸟";
            case "dhly":
               return "地火燎原";
            case "zqaoyi":
               return "朱雀奥义";
            case "fs":
               return "分身";
            case "sdcc":
               return "闪电冲刺";
            case "ltwj":
               return "雷霆万钧";
            case "qlaoyi":
               return "青龙奥义";
            case "yg":
               return "月光";
            case "jf":
               return "疾风";
            case "bs":
               return "冰陨";
            case "ysaoyi":
               return "月神奥义";
            case "qxyl":
               return "七星陨落";
            case "bhjm":
               return "八荒俱灭";
            case "jhgy":
               return "九魂归元";
            case "sc":
               return "鼠窜";
            case "hxfb":
               return "回旋飞镖";
            case "zsaoyi":
               return "子鼠奥义";
            case "mncz":
               return "蛮牛冲撞";
            case "mljt":
               return "蛮力践踏";
            case "cnaoyi":
               return "丑牛奥义";
            case "hybt":
               return "火焰奔腾";
            case "hhjt":
               return "火花践踏";
            case "hx":
               return "虎啸";
            case "mhxs":
               return "猛虎下山";
            case "yhaoyi":
               return "寅虎奥义";
            default:
               return "";
         }
      }
      
      private function getSkillSaveString() : String
      {
         var _loc1_:uint = this.skill.length;
         var _loc2_:* = "";
         var _loc3_:int = 0;
         while(_loc3_ < _loc1_)
         {
            _loc2_ += this.skill[_loc3_].sname;
            if(_loc3_ != _loc1_ - 1)
            {
               _loc2_ += "~";
            }
            _loc3_++;
         }
         return _loc2_;
      }
      
      private function setSkillSaveString(param1:String) : void
      {
         var _loc2_:* = null;
         var _loc3_:* = 0;
         var _loc4_:int = 0;
         var _loc5_:* = null;
         var _loc7_:int = 0;
         this.skill = [];
         if(param1 != "")
         {
            _loc2_ = param1.split("~");
            _loc3_ = uint(_loc2_.length);
            _loc4_ = 0;
            while(_loc4_ < _loc3_)
            {
               _loc5_ = {
                  "sname":_loc2_[_loc4_],
                  "sinfo":this.getIntroByName(_loc2_[_loc4_])
               };
               this.skill.push(_loc5_);
               _loc7_ = int(this.allSkill.indexOf(_loc2_[_loc4_]));
               if(_loc7_ != -1)
               {
                  this.allSkill.splice(_loc7_,1);
               }
               _loc4_++;
            }
         }
         this.addSpecialSkill();
      }
      
      public function getSaveString() : String
      {
         return this.petName + "|" + this.getHp() + "|" + this.getSHp() + "|" + this.getMp() + "|" + this.getSMp() + "|" + this.getLevel() + "|" + this.getCurExper() + "|" + this.getAtk() + "|" + this.getDef() + "|" + this.getMoveSpeed() + "|" + this.getMDef() + "|" + this.getCrit() + "|" + this.getMiss() + "|" + this.getEHp() + "|" + this.getEMp() + "|" + this.gethpQuality() + "|" + this.getmpQuality() + "|" + this.getatkQuality() + "|" + this.getdefQuality() + "|" + this.getlifetime() + "|" + this.getquality() + "|" + this.getperception() + "|" + this.gettechnique() + "|" + this.getwarpower() + "|" + this.isFight + "|" + this.getSkillSaveString();
      }
      
      public function setSaveString(param1:String) : void
      {
         var _loc2_:Array = param1.split("|");
         this.petName = _loc2_[0];
         this.setHp(int(_loc2_[1]));
         this.setSHp(int(_loc2_[2]));
         this.setMp(int(_loc2_[3]));
         this.setSMp(int(_loc2_[4]));
         if(this.gc.isFirst)
         {
            if(int(_loc2_[5]) >= AllConsts.GAME_PET_MAXLEVEL)
            {
               this.setLevel(AllConsts.GAME_PET_MAXLEVEL - 1);
               this.setCurExper(0);
            }
            else
            {
               this.setLevel(int(_loc2_[5]));
               this.setCurExper(int(_loc2_[6]));
            }
         }
         else
         {
            this.setLevel(int(_loc2_[5]));
            this.setCurExper(int(_loc2_[6]));
         }
         this.setAtk(int(_loc2_[7]));
         this.setDef(int(_loc2_[8]));
         this.setMoveSpeed(_loc2_[9]);
         if(_loc2_[10] > 0.36)
         {
            this.setMDef(0.36);
         }
         else
         {
            this.setMDef(_loc2_[10]);
         }
         if(_loc2_[11] > 0.75)
         {
            this.setCrit(0.75);
         }
         else
         {
            this.setCrit(_loc2_[11]);
         }
         if(_loc2_[12] > 0.48)
         {
            this.setMiss(0.48);
         }
         else
         {
            this.setMiss(_loc2_[12]);
         }
         this.setEHp(int(_loc2_[13]));
         this.setEMp(int(_loc2_[14]));
         this.sethpQuality(int(_loc2_[15]));
         this.setmpQuality(int(_loc2_[16]));
         this.setatkQuality(int(_loc2_[17]));
         this.setdefQuality(int(_loc2_[18]));
         this.setlifetime(int(_loc2_[19]));
         this.setquality(int(_loc2_[20]));
         this.setperception(int(_loc2_[21]));
         this.settechnique(int(_loc2_[22]));
         this.setwarpower(int(_loc2_[23]));
         this.isFight = int(_loc2_[24]);
         this.setSkillSaveString(_loc2_[25]);
         this.transPetChinaName();
         this.setPetValue(this.petName);
      }
      
      public function setHp(param1:int) : void
      {
         this._anti.hp = param1;
      }
      
      public function setSHp(param1:int) : void
      {
         this._anti.shp = param1;
      }
      
      public function setLevel(param1:int) : void
      {
         this._anti.level = param1;
      }
      
      public function setCurExper(param1:int) : void
      {
         this._anti.curExper = param1;
         this.petUpdate();
      }
      
      public function setMp(param1:int) : void
      {
         this._anti.mp = param1;
      }
      
      public function setSMp(param1:int) : void
      {
         this._anti.smp = param1;
      }
      
      public function setDef(param1:int) : void
      {
         this._anti.def = param1;
      }
      
      public function setAtk(param1:int) : void
      {
         this._anti.atk = param1;
      }
      
      public function sethpQuality(param1:int) : void
      {
         this._anti.hpQuality = param1;
      }
      
      public function setmpQuality(param1:int) : void
      {
         this._anti.mpQuality = param1;
      }
      
      public function setatkQuality(param1:int) : void
      {
         this._anti.atkQuality = param1;
      }
      
      public function setdefQuality(param1:int) : void
      {
         this._anti.defQuality = param1;
      }
      
      public function setlifetime(param1:int) : void
      {
         this._anti.lifetime = param1;
      }
      
      public function setquality(param1:uint) : void
      {
         this._anti.quality = param1;
      }
      
      public function setperception(param1:uint) : void
      {
         this._anti.perception = param1;
      }
      
      public function settechnique(param1:uint) : void
      {
         this._anti.technique = param1;
      }
      
      public function setwarpower(param1:uint) : void
      {
         this._anti.warpower = param1;
      }
      
      public function getCurExper() : int
      {
         return this._anti.curExper;
      }
      
      public function getLevel() : int
      {
         return this._anti.level;
      }
      
      public function getHp() : int
      {
         if(this.gethpQuality() > 2000)
         {
            return 1;
         }
         return this._anti.hp;
      }
      
      public function getSHp() : uint
      {
         if(this.gethpQuality() > 2000)
         {
            return 1;
         }
         return this._anti.shp;
      }
      
      public function getMp() : int
      {
         if(this.getmpQuality() > 2000)
         {
            return 1;
         }
         return this._anti.mp;
      }
      
      public function getSMp() : int
      {
         if(this.getmpQuality() > 2000)
         {
            return 1;
         }
         return this._anti.smp;
      }
      
      public function getDef() : int
      {
         if(this.getdefQuality() > 2000)
         {
            return 1;
         }
         return this._anti.def;
      }
      
      public function getAtk() : int
      {
         if(this.getatkQuality() > 2000)
         {
            return 1;
         }
         return this._anti.atk;
      }
      
      public function setEHp(param1:int) : void
      {
         this._anti.ehp = param1;
      }
      
      public function getEHp() : int
      {
         return this._anti.ehp;
      }
      
      public function setEMp(param1:int) : void
      {
         this._anti.emp = param1;
      }
      
      public function getEMp() : int
      {
         return this._anti.emp;
      }
      
      public function setMiss(param1:Number) : void
      {
         this._anti.miss = param1;
      }
      
      public function getMiss() : Number
      {
         return this._anti.miss;
      }
      
      public function setMDef(param1:Number) : void
      {
         this._anti.mDef = param1;
      }
      
      public function getMDef() : Number
      {
         return this._anti.mDef;
      }
      
      public function setCrit(param1:Number) : void
      {
         this._anti.crit = param1;
      }
      
      public function getCrit() : Number
      {
         return this._anti.crit;
      }
      
      public function setMoveSpeed(param1:Number) : void
      {
         this._anti.moveSpeed = param1;
      }
      
      public function getMoveSpeed() : Number
      {
         return this._anti.moveSpeed;
      }
      
      public function gethpQuality() : int
      {
         return this._anti.hpQuality;
      }
      
      public function getmpQuality() : int
      {
         return this._anti.mpQuality;
      }
      
      public function getatkQuality() : int
      {
         return this._anti.atkQuality;
      }
      
      public function getdefQuality() : int
      {
         return this._anti.defQuality;
      }
      
      public function getlifetime() : int
      {
         if(this._anti.lifetime > 100)
         {
            return 100;
         }
         return this._anti.lifetime;
      }
      
      public function getquality() : int
      {
         return this._anti.quality;
      }
      
      public function getperception() : int
      {
         if(this._anti.perception > 8)
         {
            return 5;
         }
         return this._anti.perception;
      }
      
      public function gettechnique() : int
      {
         if(this._anti.technique > 8)
         {
            return 4;
         }
         return this._anti.technique;
      }
      
      public function getwarpower() : int
      {
         if(this._anti.warpower > 8)
         {
            return 4;
         }
         return this._anti.warpower;
      }
      
      public function setDoWhenLevelUp(param1:Function) : void
      {
         this.doWhenLevelUp = param1;
      }
      
      public function setDoWhenChangeState(param1:Function) : void
      {
         this.doWhenChangeState = param1;
      }
      
      private function getDeCodeValue(param1:Number) : int
      {
         return param1 * 10 + 5;
      }
      
      private function enCodeValue(param1:int) : Number
      {
         return (param1 - 5) / 10;
      }
      
      private function getDeCodeNumber(param1:Number) : Number
      {
         return AUtils.numberSub(param1,11.5,2);
      }
      
      private function enCodeNumber(param1:Number) : Number
      {
         return AUtils.numberSub(param1,11.5,2);
      }
   }
}

