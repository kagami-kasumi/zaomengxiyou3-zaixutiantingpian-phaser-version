package base
{
   import com.edgarcai.encrypt.*;
   import com.edgarcai.gamelogic.*;
   import config.*;
   import event.CommonEvent;
   import export.*;
   import export.hero.*;
   import export.pill.*;
   import flash.display.*;
   import flash.events.EventDispatcher;
   import my.*;
   import user.*;
   
   public class BaseRoleProperies extends EventDispatcher
   {
      
      private var canHx:Boolean = true;
      
      private var canHl:Boolean = true;
      
      private var randTest:Number;
      
      private var randomNum:Number;
      
      private var gc:Config;
      
      private var who:BaseHero;
      
      private var tcount:uint;
      
      public var properiesObj:Object;
      
      private var buffArray:Array;
      
      private var pillArray:Array;
      
      private var dataObject:Antiwear;
      
      internal var zuoBCount:int = 0;
      
      public function BaseRoleProperies(param1:BaseHero)
      {
         this.properiesObj = {
            "level1":1,
            "level2":0,
            "basePower1":0,
            "basePower2":0,
            "MMP1":0,
            "MMP2":0,
            "sMMP1":0,
            "sMMP2":0,
            "HHP1":0,
            "HHP2":0,
            "sHHP1":0,
            "sHHP2":0,
            "defense1":0,
            "defense2":0,
            "crit1":0,
            "crit2":0,
            "addSpeed1":0,
            "addSpeed2":0,
            "miss1":0,
            "miss2":0,
            "exper1":0,
            "exper2":0,
            "selfhp1":0,
            "selfhp2":0,
            "selfmp1":0,
            "selfmp2":0,
            "exp1":0,
            "exp2":0,
            "php1":0,
            "php2":0,
            "pmp1":0,
            "pmp2":0,
            "pcrit1":0,
            "pcrit2":0,
            "pselfhp1":0,
            "pselfhp2":0,
            "pselfmp1":0,
            "pselfmp2":0,
            "eatblood1":0,
            "eatblood2":0,
            "haveblood1":0,
            "haveblood2":0,
            "magicdef1":0,
            "magicdef2":0,
            "deephit1":0,
            "deephit2":0,
            "Toughness":0,
            "ReduceMagicDef":0,
            "Hit":0,
            "Guardian":0
         };
         this.buffArray = [];
         this.pillArray = [];
         super();
         this.dataObject = new Antiwear(new binaryEncrypt());
         this.gc = Config.getInstance();
         this.who = param1;
         this.randTest = Number(Number(Math.random()));
         this.randomNum = Number(Number(this.randTest / 10000));
         this.setInitValue();
         this.gc.eventManger.addEventListener("RefreshPill",this.refreshAllPill);
         this.addEventListener("AddExper",this.addExper);
         this.addEventListener("SetHHp",this.setHHPEvent);
         this.addEventListener("SetMMp",this.setMMPEvent);
         this.addEventListener("SetSHHp",this.setSHHPEvent);
         this.addEventListener("SetSMMp",this.setSMMPEvent);
         this.addEventListener("SetSMMp",this.setSMMPEvent);
         this.addEventListener("SetLevel",this.setLevelEvent);
         this.addEventListener("SetExper",this.setExperEvent);
         this.addEventListener("SetInitExper",this.setInitExperEvent);
      }
      
      private function setLevelEvent(param1:CommonEvent) : void
      {
         var _loc2_:int = int(param1.data[0]);
         this.setLevel(_loc2_);
      }
      
      private function setInitExperEvent(param1:CommonEvent) : void
      {
         var _loc2_:int = int(param1.data[0]);
         this.dataObject.exper = _loc2_;
      }
      
      private function setExperEvent(param1:CommonEvent) : void
      {
         var _loc2_:int = int(param1.data[0]);
         this.setExper(_loc2_);
      }
      
      private function setHHPEvent(param1:CommonEvent) : void
      {
         var _loc2_:int = int(param1.data[0]);
         this.setHHP(_loc2_);
      }
      
      private function setMMPEvent(param1:CommonEvent) : void
      {
         var _loc2_:int = int(param1.data[0]);
         this.setMMP(_loc2_);
      }
      
      private function setSHHPEvent(param1:CommonEvent) : void
      {
         var _loc2_:int = int(param1.data[0]);
         this.setSHHP(_loc2_);
      }
      
      private function setSMMPEvent(param1:CommonEvent) : void
      {
         var _loc2_:int = int(param1.data[0]);
         this.setSMMP(_loc2_);
      }
      
      public function setInitValue() : void
      {
         this.setHx(0);
         this.setHl(0);
         this.setCrit(0);
         this.setMiss(0);
         this.setDeephit(0);
         this.setDefense(0);
         this.setAddSpeed(0);
         this.setBasePower(0);
         this.setEatblood(0);
         this.setexp(0);
         this.setSHHP(0);
         this.setSMMP(0);
         this.setHHP(0);
         this.setMMP(0);
         this.setMagicDef(0);
         this.setReduceMagicDef(0);
         this.setToughness(0);
         this.setHit(0);
         this.setHaveblood(0);
      }
      
      private function enCodeValue(param1:int) : Number
      {
         return param1 / 10 - 5;
      }
      
      private function deCodeValue(param1:Number) : int
      {
         return Math.round((param1 + 5) * 10);
      }
      
      public function setSMMP(param1:int) : void
      {
         this.dataObject.smmp = param1;
      }
      
      public function getSMMP() : int
      {
         return this.dataObject.smmp;
      }
      
      public function setSHHP(param1:int) : void
      {
         this.dataObject.shhp = param1;
      }
      
      public function getSHHP() : int
      {
         return this.dataObject.shhp;
      }
      
      public function setexp(param1:int) : void
      {
         this.dataObject.exp = param1;
      }
      
      public function step() : void
      {
         var _loc1_:* = null;
         var _loc2_:* = null;
         var _loc3_:int = 0;
         var _loc4_:int = 0;
         var _loc5_:int = 0;
         if(this.getHHP() <= 0)
         {
            this.canHx = false;
         }
         if(this.getMMP() < 0)
         {
            this.canHl = false;
         }
         if(this.tcount++ >= Number(this.gc.frameClips))
         {
            if(this.getHHP() > 0)
            {
               this.setHHP(this.getHHP() + this.getHx());
            }
            if(this.getMMP() >= 0)
            {
               this.setMMP(this.getMMP() + this.getHl());
            }
            this.tcount = 0;
         }
         if(this.who)
         {
            if(this.who.curAddEffect)
            {
               _loc2_ = this.who.curAddEffect.getBuffByName(BaseAddEffect.PET_SMJC);
               if(_loc2_)
               {
                  _loc3_ = int(this.buffArray.indexOf(_loc2_.name));
                  if(_loc3_ == -1)
                  {
                     this.addBuff(_loc2_.name);
                  }
                  if(this.who.curAddEffect.getBuffTimeLeftByName(BaseAddEffect.PET_SMJC) == 0)
                  {
                     this.removeBuff(BaseAddEffect.PET_SMJC);
                  }
               }
               _loc2_ = this.who.curAddEffect.getBuffByName(BaseAddEffect.PET_MFJC);
               if(_loc2_)
               {
                  _loc3_ = int(this.buffArray.indexOf(_loc2_.name));
                  if(_loc3_ == -1)
                  {
                     this.addBuff(_loc2_.name);
                  }
                  if(this.who.curAddEffect.getBuffTimeLeftByName(BaseAddEffect.PET_MFJC) == 0)
                  {
                     this.removeBuff(BaseAddEffect.PET_MFJC);
                  }
               }
               _loc2_ = this.who.curAddEffect.getBuffByName(BaseAddEffect.PET_GJJC);
               if(_loc2_)
               {
                  _loc3_ = int(this.buffArray.indexOf(_loc2_.name));
                  if(_loc3_ == -1)
                  {
                     this.addBuff(_loc2_.name);
                  }
                  if(this.who.curAddEffect.getBuffTimeLeftByName(BaseAddEffect.PET_GJJC) == 0)
                  {
                     this.removeBuff(BaseAddEffect.PET_GJJC);
                  }
               }
               _loc2_ = this.who.curAddEffect.getBuffByName(BaseAddEffect.PET_FYJC);
               if(_loc2_)
               {
                  _loc3_ = int(this.buffArray.indexOf(_loc2_.name));
                  if(_loc3_ == -1)
                  {
                     this.addBuff(_loc2_.name);
                  }
                  if(this.who.curAddEffect.getBuffTimeLeftByName(BaseAddEffect.PET_FYJC) == 0)
                  {
                     this.removeBuff(BaseAddEffect.PET_FYJC);
                  }
               }
               _loc2_ = this.who.curAddEffect.getBuffByName(BaseAddEffect.MAGIC_FLOWER_ADDBUFF);
               if(_loc2_)
               {
                  _loc3_ = int(this.buffArray.indexOf(_loc2_.name));
                  if(_loc3_ == -1)
                  {
                     this.addBuff(_loc2_.name);
                  }
                  if(this.who.curAddEffect.getBuffTimeLeftByName(BaseAddEffect.MAGIC_FLOWER_ADDBUFF) == 0)
                  {
                     this.removeBuff(BaseAddEffect.MAGIC_FLOWER_ADDBUFF);
                  }
               }
               if(this.who is Role1)
               {
                  if(this.who.getPlayer())
                  {
                     _loc4_ = int(this.buffArray.indexOf("role1_sx"));
                     if(_loc4_ == -1)
                     {
                        if(this.who.getPlayer().getSkillBySkillName("sx"))
                        {
                           this.addBuff("role1_sx");
                        }
                     }
                     else if(!this.who.getPlayer().getSkillBySkillName("sx"))
                     {
                        this.removeBuff("role1_sx");
                     }
                  }
               }
               else if(this.who is Role3)
               {
                  _loc5_ = int(this.buffArray.indexOf("role3_rj"));
                  if(_loc5_ == -1)
                  {
                     if(this.who.getPlayer().getSkillBySkillName("rj"))
                     {
                        this.addBuff("role3_rj");
                     }
                  }
                  else if(!this.who.getPlayer().getSkillBySkillName("rj"))
                  {
                     this.removeBuff("role3_rj");
                  }
               }
            }
            for each(_loc1_ in this.gc.heroBuffArray)
            {
               _loc3_ = int(this.buffArray.indexOf(_loc1_.name));
               if(_loc1_.count > 0)
               {
                  if(_loc3_ == -1)
                  {
                     this.addBuff(_loc1_.name);
                  }
               }
               else if(_loc3_ != -1)
               {
                  this.removeBuff(_loc1_.name);
               }
            }
         }
      }
      
      private function addBuff(param1:String) : void
      {
         var rjarr:Array = null;
         var _loc2_:* = null;
         var _loc3_:Number = Number(NaN);
         var _loc4_:* = null;
         if(this.buffArray.indexOf(param1) == -1)
         {
            switch(param1)
            {
               case HeroBuff.HPUPBUFF:
                  this.setSHHP(this.getSHHP() * 2);
                  this.setHHP(this.getHHP() * 2);
                  break;
               case BaseAddEffect.PET_SMJC:
                  _loc2_ = this.who.curAddEffect.getBuffByName(BaseAddEffect.PET_SMJC);
                  if(_loc2_)
                  {
                     _loc3_ = this.getHHP() / this.getSHHP();
                     this.setSHHP(this.getSHHP() + _loc2_.value);
                     this.setHHP(this.getHHP() + Number(_loc2_.value) * _loc3_);
                     if(this.gc.sid == this.who.sid && Boolean(this.gc.isInRoom()))
                     {
                        _loc4_ = this.gc.getMutiUserBySidAndRoleId(this.who.sid,this.who.getRoleId()) as MutiUser;
                        if(_loc4_)
                        {
                           _loc4_.hp = this.getHHP();
                           this.gc.sendSelfMutiUserInfo(this.who.getRoleId());
                        }
                     }
                  }
                  break;
               case BaseAddEffect.PET_MFJC:
                  _loc2_ = this.who.curAddEffect.getBuffByName(BaseAddEffect.PET_MFJC);
                  if(_loc2_)
                  {
                     _loc3_ = this.getMMP() / this.getSMMP();
                     this.setSMMP(this.getSMMP() + _loc2_.value);
                     this.setMMP(this.getMMP() + Number(_loc2_.value) * _loc3_);
                  }
                  break;
               case BaseAddEffect.PET_GJJC:
                  _loc2_ = this.who.curAddEffect.getBuffByName(BaseAddEffect.PET_GJJC);
                  if(_loc2_)
                  {
                     this.setBasePower(this.getBasePower() + _loc2_.value);
                  }
                  break;
               case BaseAddEffect.MAGIC_FLOWER_ADDBUFF:
                  _loc2_ = this.who.curAddEffect.getBuffByName(BaseAddEffect.MAGIC_FLOWER_ADDBUFF);
                  if(_loc2_)
                  {
                     this.setBasePower(this.getBasePower() + _loc2_.value);
                  }
                  break;
               case BaseAddEffect.PET_FYJC:
                  _loc2_ = this.who.curAddEffect.getBuffByName(BaseAddEffect.PET_FYJC);
                  if(_loc2_)
                  {
                     this.setDefense(this.getDefense() + _loc2_.value);
                  }
                  break;
               case "role1_sx":
                  _loc2_ = this.who.getPlayer().returnSkillLevelBySkillName("sx");
                  this.setEatblood(this.getEatBlood() + 0.8 + (_loc2_ - 1) / 10);
                  this.setCrit(this.getCrit() + 3 + Math.round(_loc2_));
                  break;
               case "role3_rj":
                  rjarr = [10,30,50,90,180,300,350,400,420,450];
                  this.setDefense(this.getDefense() + rjarr[this.who.getPlayer().returnSkillLevelBySkillName("rj") - 1]);
            }
            this.buffArray.push(param1);
         }
      }
      
      private function removeBuff(param1:String) : void
      {
         var rjarr:Array = null;
         var _loc2_:int = 0;
         var _loc3_:* = null;
         var _loc4_:Number = Number(NaN);
         var _loc5_:* = null;
         _loc2_ = int(this.buffArray.indexOf(param1));
         if(_loc2_ != -1)
         {
            switch(param1)
            {
               case HeroBuff.HPUPBUFF:
                  this.setSHHP(this.getSHHP() / 2);
                  this.setHHP(this.getHHP() / 2);
                  break;
               case BaseAddEffect.PET_SMJC:
                  _loc3_ = this.who.curAddEffect.getBuffByName(BaseAddEffect.PET_SMJC);
                  if(_loc3_)
                  {
                     _loc4_ = this.getHHP() / this.getSHHP();
                     this.setSHHP(this.getSHHP() - Number(_loc3_.value));
                     this.setHHP(this.getHHP() - Number(_loc3_.value) * _loc4_);
                     if(this.gc.sid == this.who.sid && Boolean(this.gc.isInRoom()))
                     {
                        _loc5_ = this.gc.getMutiUserBySidAndRoleId(this.who.sid,this.who.getRoleId()) as MutiUser;
                        if(_loc5_)
                        {
                           _loc5_.hp = this.getHHP();
                           this.gc.sendSelfMutiUserInfo(this.who.getRoleId());
                        }
                     }
                  }
                  break;
               case BaseAddEffect.PET_MFJC:
                  _loc3_ = this.who.curAddEffect.getBuffByName(BaseAddEffect.PET_MFJC);
                  if(_loc3_)
                  {
                     _loc4_ = this.getMMP() / this.getSMMP();
                     this.setSMMP(this.getSMMP() - Number(_loc3_.value));
                     this.setMMP(this.getMMP() - Number(_loc3_.value) * _loc4_);
                  }
                  break;
               case BaseAddEffect.PET_GJJC:
                  _loc3_ = this.who.curAddEffect.getBuffByName(BaseAddEffect.PET_GJJC);
                  if(_loc3_)
                  {
                     this.setBasePower(this.getBasePower() - Number(_loc3_.value));
                  }
                  break;
               case BaseAddEffect.MAGIC_FLOWER_ADDBUFF:
                  _loc3_ = this.who.curAddEffect.getBuffByName(BaseAddEffect.MAGIC_FLOWER_ADDBUFF);
                  if(_loc3_)
                  {
                     this.setBasePower(this.getBasePower() - Number(_loc3_.value));
                  }
                  break;
               case BaseAddEffect.PET_FYJC:
                  _loc3_ = this.who.curAddEffect.getBuffByName(BaseAddEffect.PET_FYJC);
                  if(_loc3_)
                  {
                     this.setDefense(this.getDefense() - Number(_loc3_.value));
                  }
                  break;
               case "role1_sx":
                  _loc3_ = this.who.getPlayer().returnSkillLevelBySkillName("sx");
                  this.setEatblood(this.getEatBlood() - 0.8 - (_loc3_ - 1) / 10);
                  this.setCrit(this.getCrit() - 3 - _loc3_);
                  break;
               case "role3_rj":
                  rjarr = [10,30,50,90,180,300,350,400,420,450];
                  this.setDefense(this.getDefense() - rjarr[this.who.getPlayer().returnSkillLevelBySkillName("rj") - 1]);
            }
            this.buffArray[_loc2_] = "";
         }
      }
      
      public function removeAllBuff() : void
      {
         var _loc1_:* = null;
         for each(_loc1_ in this.buffArray)
         {
            if(_loc1_ != "")
            {
               this.removeBuff(_loc1_);
            }
         }
         this.buffArray.length = 0;
      }
      
      private function judgeUpGrade() : *
      {
         var _loc1_:MovieClip = null;
         if(!this.who || !this.who.getPlayer())
         {
            return;
         }
         var _loc2_:uint = uint(this.getExp());
         if(this.getExper() >= this.getExp())
         {
            this.setLevel(this.getLevel() + 1);
            this.who.upGrade(false);
            this.setExper(this.getExper() - _loc2_);
            this.who.getPlayer().setCurExp(this.getExper());
            _loc1_ = AUtils.getNewObj("RoleLevelUpMc") as MovieClip;
            this.who.addChild(_loc1_);
         }
      }
      
      public function setHx(param1:int) : void
      {
         this.dataObject.hx = param1;
      }
      
      public function getHx() : int
      {
         return this.dataObject.hx;
      }
      
      public function setHl(param1:int) : void
      {
         this.dataObject.hl = param1;
      }
      
      public function getHl() : int
      {
         return this.dataObject.hl;
      }
      
      public function setEatblood(param1:Number) : void
      {
         this.dataObject.eatblood = param1;
      }
      
      public function getEatBlood() : Number
      {
         return this.dataObject.eatblood;
      }
      
      public function getExp() : int
      {
         return this.dataObject.exp;
      }
      
      public function setLevel(param1:int) : void
      {
         this.dataObject.level = param1;
         this.who.getPlayer().setCurLevel(this.getLevel());
      }
      
      public function getLevel() : int
      {
         return this.dataObject.level;
      }
      
      public function setBasePower(param1:int) : void
      {
         this.dataObject.basePower = param1;
      }
      
      public function getBasePower() : int
      {
         return this.dataObject.basePower;
      }
      
      public function setHaveblood(param1:int) : void
      {
         this.dataObject.haveblood = param1;
      }
      
      public function getHaveblood() : int
      {
         return this.dataObject.haveblood;
      }
      
      public function setMagicDef(param1:int) : void
      {
         this.dataObject.magicDef = param1;
      }
      
      public function getMagicDef() : int
      {
         return this.dataObject.magicDef;
      }
      
      public function setDeephit(param1:int) : void
      {
         this.dataObject.deephit = param1;
      }
      
      public function getDeephit() : int
      {
         return this.dataObject.deephit;
      }
      
      public function getHurt() : int
      {
         var tljatk:Array = null;
         var _loc1_:* = undefined;
         var _loc2_:int = 0;
         var _loc3_:* = 1;
         if(this.who.curAddEffect)
         {
            if(Boolean(this.who.curAddEffect.getBuffByName(BaseAddEffect.XLFB_BUFF)))
            {
               _loc3_ += 0.1;
            }
            if(this.who.curAddEffect.getBuffByName(BaseAddEffect.SXFB_BUFF))
            {
               _loc1_ += 0.15;
            }
            if(Boolean(this.who.curAddEffect.getBuffByName(BaseAddEffect.YXFB_BUFF2)))
            {
               _loc3_ += 0.3;
            }
            if(Boolean(this.who.curAddEffect.getBuffByName(BaseAddEffect.ROLE5TLJ)) && Boolean(Role5(this.who)._invert == true))
            {
               tljatk = [0.12,0.125,0.13,0.135,0.141,0.145,0.149,0.155,0.16,0.165,0.17,0.18,0.19,0.195,0.215,0.23,0.24,0.25];
               _loc3_ += tljatk[this.who.getPlayer().returnSkillLevelBySkillName("tlj") - 1];
            }
         }
         if(this.getTotalCrit() >= 110)
         {
            _loc1_ = (this.getTotalCrit() - 100) / 800;
            _loc3_ *= _loc1_ + 1;
         }
         return (this.getPower() + Math.random() * _loc2_) * _loc3_;
      }
      
      public function getPower() : int
      {
         return this.getBasePower();
      }
      
      public function setDefense(param1:int) : void
      {
         this.dataObject.defense = param1;
      }
      
      public function getDefense() : int
      {
         return this.dataObject.defense;
      }
      
      public function getTotalDefense() : int
      {
         var tljdef:Array = null;
         var _loc3_:Number = 1;
         if(this.who.curAddEffect)
         {
            if(Boolean(this.who.curAddEffect.getBuffByName(BaseAddEffect.ROLE5TLJ)) && Boolean(Role5(this.who)._invert == false))
            {
               tljdef = [0.12,0.125,0.13,0.135,0.141,0.145,0.149,0.155,0.16,0.165,0.17,0.18,0.19,0.195,0.215,0.23,0.24,0.25];
               _loc3_ += tljdef[this.who.getPlayer().returnSkillLevelBySkillName("tlj") - 1];
            }
         }
         return int(this.getDefense() * _loc3_);
      }
      
      public function setCrit(param1:int) : void
      {
         this.dataObject.crit = param1;
      }
      
      public function getCrit() : int
      {
         return this.dataObject.crit;
      }
      
      public function setAddSpeed(param1:int) : void
      {
         this.dataObject.addSpeed = param1;
      }
      
      public function getAddSpeed() : int
      {
         return this.dataObject.addSpeed;
      }
      
      public function setMiss(param1:int) : void
      {
         this.dataObject.miss = param1;
      }
      
      public function getMiss() : int
      {
         return this.dataObject.miss;
      }
      
      public function getTotalMiss() : int
      {
         var tljmiss:Array = null;
         var _loc3_:Number = 0;
         if(this.who.curAddEffect)
         {
            if(Boolean(this.who.curAddEffect.getBuffByName(BaseAddEffect.ROLE5TLJ)) && Boolean(Role5(this.who)._invert == false))
            {
               tljmiss = [5,6,7,8,9,10,11,12,13,13,14,14,15,16,17,18,19,20];
               _loc3_ += tljmiss[this.who.getPlayer().returnSkillLevelBySkillName("tlj") - 1];
            }
         }
         return int(this.getMiss() + _loc3_);
      }
      
      public function setReduceMagicDef(param1:int) : void
      {
         this.dataObject.ReduceMagicDef = param1;
      }
      
      public function getReduceMagicDef() : int
      {
         return this.dataObject.ReduceMagicDef;
      }
      
      public function setToughness(param1:int) : void
      {
         this.dataObject.Toughness = param1;
      }
      
      public function getToughness() : int
      {
         return this.dataObject.Toughness;
      }
      
      public function setHit(param1:int) : void
      {
         this.dataObject.Hit = param1;
      }
      
      public function getHit() : int
      {
         return this.dataObject.Hit;
      }
      
      public function setGuardian(param1:int) : void
      {
         this.dataObject.Guardian = param1;
      }
      
      public function Guardian() : int
      {
         return this.dataObject.Guardian;
      }
      
      private function addExper(param1:CommonEvent) : void
      {
         var _loc2_:uint = uint(param1.data[0]);
         this.setExper(this.getExper() + _loc2_);
      }
      
      public function setExper(param1:int) : void
      {
         if(!this.who || !this.who.getPlayer())
         {
            return;
         }
         var _loc2_:uint = uint(this.getExp());
         if(param1 < _loc2_)
         {
            this.dataObject.exper = param1;
            this.who.getPlayer().setCurExp(this.getExper());
         }
         else if(this.getLevel() < AllConsts.GAME_ROLE_MAXLEVEL)
         {
            this.dataObject.exper = param1;
            this.who.getPlayer().setCurExp(this.getExper());
            this.judgeUpGrade();
         }
      }
      
      public function getExper() : int
      {
         return this.dataObject.exper;
      }
      
      public function setHHP(param1:int) : void
      {
         if(param1 != 0 && param1 > this.getHHP())
         {
            if(this.who.curAddEffect)
            {
               if(Boolean(this.who.curAddEffect.getBuffByName(BaseAddEffect.ERLANGSHEN_HP_REJECT)) || Boolean(this.who.curAddEffect.getBuffByName(BaseAddEffect.MONSTER120DEBUFF)) || Boolean(this.who.curAddEffect.getBuffByName(BaseAddEffect.MONSTER129Buff)))
               {
                  return;
               }
            }
         }
         this.dataObject.hhp = param1;
         if(this.getHHP() < 0)
         {
            this.setHHP(0);
         }
         if(this.getSHHP() > 0)
         {
            if(this.getHHP() > this.getSHHP())
            {
               this.setHHP(this.getSHHP());
            }
         }
      }
      
      public function getHHP() : int
      {
         return this.dataObject.hhp;
      }
      
      public function setMMP(param1:int) : void
      {
         if(param1 != 0 && param1 > this.getMMP())
         {
            if(this.who.curAddEffect)
            {
               if(Boolean(this.who.curAddEffect.getBuffByName(BaseAddEffect.MONSTER42_BLUE)) || Boolean(this.who.curAddEffect.getBuffByName(BaseAddEffect.MONSTER120DEBUFF)))
               {
                  return;
               }
            }
         }
         this.dataObject.mmp = param1;
         if(this.getMMP() < 0)
         {
            this.setMMP(0);
         }
         if(this.getSMMP() > 0)
         {
            if(this.getMMP() > this.getSMMP())
            {
               this.setMMP(this.getSMMP());
            }
         }
      }
      
      public function getMMP() : int
      {
         return this.dataObject.mmp;
      }
      
      public function getproperiesObj() : Object
      {
         return this.properiesObj;
      }
      
      public function setinitExper(param1:int) : void
      {
         this.dataObject.exper = param1;
      }
      
      public function setinitLevel(param1:int) : void
      {
         this.dataObject.level = param1;
      }
      
      public function addEquip(param1:MyEquipObj) : void
      {
         var _loc2_:Number = Number(NaN);
         if(param1 != null)
         {
            this.removeAllBuff();
            this.setBasePower(this.getBasePower() + param1.geteatt());
            this.setDefense(this.getDefense() + param1.getedef());
            this.setCrit(this.getCrit() + int(param1.getecrit() * 100));
            this.setMiss(this.getMiss() + int(param1.getemiss() * 100));
            this.setHx(this.getHx() + param1.geteahp());
            this.setHaveblood(this.getHaveblood() + int(param1.gethaveblood()));
            this.setHl(this.getHl() + param1.geteamp());
            this.setEatblood(this.getEatBlood() + int(param1.geteatblood() * 100));
            this.setMagicDef(this.getMagicDef() + int(param1.getmagicdef() * 100));
            this.setDeephit(this.getDeephit() + int(param1.getdeephit() * 100));
            _loc2_ = this.getHHP() / this.getSHHP();
            this.setSHHP(this.getSHHP() + param1.getehp());
            this.setSMMP(this.getSMMP() + param1.getemp());
         }
      }
      
      public function removeEquip(param1:MyEquipObj) : void
      {
         var _loc2_:Number = Number(NaN);
         if(param1 != null)
         {
            this.removeAllBuff();
            this.setBasePower(this.getBasePower() - param1.geteatt());
            this.setDefense(this.getDefense() - param1.getedef());
            this.setCrit(this.getCrit() - int(param1.getecrit() * 100));
            this.setMiss(this.getMiss() - int(param1.getemiss() * 100));
            this.setHx(this.getHx() - param1.geteahp());
            this.setHaveblood(this.getHaveblood() - int(param1.gethaveblood()));
            trace(param1.gethaveblood());
            this.setHl(this.getHl() - param1.geteamp());
            this.setEatblood(this.getEatBlood() - int(param1.geteatblood() * 100));
            this.setMagicDef(this.getMagicDef() - int(param1.getmagicdef() * 100));
            this.setDeephit(this.getDeephit() - int(param1.getdeephit() * 100));
            _loc2_ = this.getHHP() / this.getSHHP();
            this.setSHHP(this.getSHHP() - param1.getehp());
            if(this.getSHHP() < this.getHHP())
            {
               this.setHHP(this.getSHHP());
            }
            this.setSMMP(this.getSMMP() - param1.getemp());
            if(this.getSMMP() < this.getMMP())
            {
               this.setMMP(this.getSMMP());
            }
         }
      }
      
      public function removeEquip2(param1:MyEquipObj) : void
      {
         var _loc2_:Number = Number(NaN);
         if(param1 != null)
         {
            this.removeAllBuff();
            this.setBasePower(this.getBasePower() - param1.geteatt());
            this.setDefense(this.getDefense() - param1.getedef());
            this.setCrit(this.getCrit() - int(param1.getecrit() * 100));
            this.setMiss(this.getMiss() - int(param1.getemiss() * 100));
            this.setHx(this.getHx() - param1.geteahp());
            this.setHl(this.getHl() - param1.geteamp());
            this.setEatblood(this.getEatBlood() - int(param1.geteatblood() * 100));
            this.setMagicDef(this.getMagicDef() - int(param1.getmagicdef() * 100));
            this.setDeephit(this.getDeephit() - int(param1.getdeephit() * 100));
            _loc2_ = this.getHHP() / this.getSHHP();
            this.setSHHP(this.getSHHP() - param1.getehp());
            this.setSMMP(this.getSMMP() - param1.getemp());
         }
      }
      
      private function addAllEquip() : void
      {
         var _loc1_:* = 0;
         var _loc2_:* = null;
         if(this.who)
         {
            _loc1_ = uint(this.who.getPlayer().curarray.length);
            while(_loc1_-- > 0)
            {
               _loc2_ = this.who.getPlayer().curarray[_loc1_];
               this.addEquip(_loc2_);
            }
         }
         this.setHHP(this.getSHHP());
         this.setMMP(this.getSMMP());
      }
      
      private function removeAllEquip() : void
      {
         var _loc1_:* = null;
         var _loc2_:uint = uint(this.who.getPlayer().curarray.length);
         while(_loc2_-- > 0)
         {
            _loc1_ = this.who.getPlayer().curarray[_loc2_];
            this.removeEquip(_loc1_);
         }
      }
      
      private function removeAllPassive() : void
      {
         var _loc1_:* = 0;
         var _loc2_:uint = uint(this.who.getPlayer().ispassiveskill.length);
         while(_loc2_-- > 0)
         {
            _loc1_ = uint(this.who.getPlayer().ispassiveskill[_loc2_]);
            this.removePassive(_loc2_,_loc1_);
         }
      }
      
      private function addAllPassive() : void
      {
         var _loc1_:* = 0;
         var _loc2_:uint = uint(this.who.getPlayer().ispassiveskill.length);
         while(_loc2_-- > 0)
         {
            _loc1_ = uint(this.who.getPlayer().ispassiveskill[_loc2_]);
            this.addPassive(_loc2_,_loc1_,false);
         }
      }
      
      public function addPassive(param1:uint, param2:uint, param3:Boolean = true) : void
      {
         if(param3)
         {
            this.removePassive(param1,param2 - 1);
         }
         this.analyPassive(param1,param2);
      }
      
      public function removePassive(param1:uint, param2:uint) : void
      {
         this.analyPassive(param1,param2,-1);
      }
      
      private function analyPassive(param1:uint, param2:uint, param3:int = 1) : void
      {
         var _loc4_:* = NaN;
         var _loc5_:int = 0;
         var _loc6_:int = 0;
         var _loc7_:int = 0;
         var _loc8_:int = 0;
         var _loc9_:int = 0;
         if(param2 != 0)
         {
            this.removeAllBuff();
            _loc4_ = 0;
            switch(param1)
            {
               case 0:
                  _loc5_ = param2 * 100 * param3;
                  if(this.getSHHP() > 0)
                  {
                     _loc4_ = Number(this.getHHP() / this.getSHHP());
                  }
                  else
                  {
                     _loc4_ = 0;
                  }
                  this.setSHHP(this.getSHHP() + _loc5_);
                  this.setHHP(this.getHHP() + _loc5_ * _loc4_);
                  break;
               case 1:
                  _loc6_ = param2 * 100 * param3;
                  _loc4_ = Number(this.getMMP() / this.getSMMP());
                  this.setSMMP(this.getSMMP() + _loc6_);
                  this.setMMP(this.getMMP() + _loc6_ * _loc4_);
                  break;
               case 2:
                  _loc7_ = param2 * 1 * param3;
                  this.setCrit(this.getCrit() + _loc7_);
                  break;
               case 3:
                  _loc8_ = param2 * param3 * 1;
                  this.setHx(this.getHx() + _loc8_ * 3);
                  break;
               case 4:
                  _loc9_ = param2 * param3;
                  this.setHl(this.getHl() + _loc9_ * 1);
            }
         }
      }
      
      public function setWho(param1:BaseHero) : void
      {
         this.who = param1;
      }
      
      public function destory() : void
      {
         this.removeAllEquipAndPassive();
         this.gc.eventManger.removeEventListener("RefreshPill",this.refreshAllPill);
         this.removeEventListener("AddExper",this.addExper);
         this.removeEventListener("SetHHp",this.setHHPEvent);
         this.removeEventListener("SetMMp",this.setMMPEvent);
         this.removeEventListener("SetSHHp",this.setSHHPEvent);
         this.removeEventListener("SetSMMp",this.setSMMPEvent);
         this.removeEventListener("SetLevel",this.setLevelEvent);
         this.removeEventListener("SetExper",this.setExperEvent);
         this.removeEventListener("SetInitExper",this.setInitExperEvent);
         this.who = null;
      }
      
      public function removeAllEquipAndPassive() : void
      {
         this.removePill();
         this.removeAllEquip();
         this.removeAllPassive();
      }
      
      public function initAll() : void
      {
         if(this.gc.curStage == 98 && this.gc.curLevel == 1)
         {
            this.setHl(1000);
         }
         this.addAllPassive();
         this.addAllEquip();
         this.addPill();
      }
      
      public function refreshAllPill(param1:CommonEvent) : void
      {
         var _loc2_:Pill = null;
         for each(_loc2_ in this.pillArray)
         {
            _loc2_.refreshPill();
         }
      }
      
      private function removePill() : void
      {
         var _loc1_:Pill = null;
         for each(_loc1_ in this.pillArray)
         {
            _loc1_.removePill();
         }
      }
      
      private function addPill() : void
      {
         var _loc1_:Pill = null;
         var _loc2_:* = 5;
         if(!this.who)
         {
            return;
         }
         if(this.pillArray.length == 0)
         {
            while(_loc2_ > 0)
            {
               this.pillArray.push(new Pill(_loc2_,this.who));
               _loc2_--;
            }
         }
         else
         {
            for each(_loc1_ in this.pillArray)
            {
               _loc1_.addPill();
            }
         }
      }
      
      public function getMagicDefWhenCountHurt() : int
      {
         var _loc1_:Number = 1;
         if(this.who)
         {
            if(!this.who.curAddEffect)
            {
            }
         }
         return this.getMagicDef() * _loc1_;
      }
      
      public function getTotalAtk() : int
      {
         var tljatk:Array = null;
         var _loc3_:* = 1;
         if(this.who.curAddEffect)
         {
            if(Boolean(this.who.curAddEffect.getBuffByName(BaseAddEffect.YXFB_BUFF2)))
            {
               _loc3_ += 0.3;
            }
            if(Boolean(this.who.curAddEffect.getBuffByName(BaseAddEffect.XLFB_BUFF)))
            {
               _loc3_ += 0.1;
            }
            if(this.who.curAddEffect.getBuffByName(BaseAddEffect.SXFB_BUFF))
            {
               _loc3_ += 0.15;
            }
            if(Boolean(this.who.curAddEffect.getBuffByName(BaseAddEffect.ROLE5TLJ)) && Boolean(Role5(this.who)._invert == true))
            {
               tljatk = [0.12,0.125,0.13,0.135,0.141,0.145,0.149,0.155,0.16,0.165,0.17,0.18,0.19,0.195,0.215,0.23,0.24,0.25];
               _loc3_ += tljatk[this.who.getPlayer().returnSkillLevelBySkillName("tlj") - 1];
            }
         }
         return int(this.getPower() * _loc3_);
      }
      
      public function getTotalCrit() : int
      {
         var tljbaoji:Array = null;
         var _loc1_:Number = 0;
         if(this.who)
         {
            if(this.who.curAddEffect)
            {
               if(this.who.curAddEffect.getBuffByName(BaseAddEffect.XLFB_BUFF))
               {
                  _loc1_ += 10;
               }
               if(this.who.curAddEffect.getBuffByName(BaseAddEffect.SXFB_BUFF))
               {
                  _loc1_ += 15;
               }
               if(this.who.curAddEffect.getBuffByName(BaseAddEffect.YXFB_BUFF2))
               {
                  _loc1_ += 30;
               }
               if(Boolean(this.who.curAddEffect.getBuffByName(BaseAddEffect.ROLE5TLJ)) && Boolean(Role5(this.who)._invert == true))
               {
                  tljbaoji = [5,7,8,9,10,11,12,13,14,15,17,19,21,23,24,26,28,30];
                  _loc1_ += tljbaoji[this.who.getPlayer().returnSkillLevelBySkillName("tlj") - 1];
               }
            }
         }
         return this.getCrit() + _loc1_;
      }
   }
}

