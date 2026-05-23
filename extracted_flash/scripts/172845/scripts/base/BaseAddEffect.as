package base
{
   import com.greensock.*;
   import config.*;
   import event.*;
   import export.bullet.*;
   import export.hero.*;
   import export.magicWeapon.*;
   import export.monster.*;
   import flash.display.*;
   import flash.filters.*;
   import flash.geom.*;
   import flash.utils.*;
   import gameEngine.utils.*;
   import manager.*;
   
   public class BaseAddEffect
   {
      
      public static var MONSTER6008SKILL2:String = "monster6008skill2";
      
      public static var YUESEMENGLONG:String = "yuesemenglong";
      
      public static var MONSTER6008FIRE:String = "monster6008fire";
      
      public static var ROLE5TLJ:String = "role5tlj";
      
      public static var ROLE5JRJL:String = "rolejrjl";
      
      public static var ROLE5LOONGSWORD:String = "role5loongsword";
      
      public static var POISON:String = "poison";
      
      public static var POISON_TIMES:String = "poison_timers";
      
      public static var FATHER:String = "father";
      
      public static var DEADLINK:String = "deadlink";
      
      public static var ICE:String = "ice";
      
      public static var SPEEDUP:String = "speedup";
      
      public static var EYEFIX:String = "eyefix";
      
      public static var MAGICLOST:String = "magiclost";
      
      public static var STUN:String = "stun";
      
      public static var NET:String = "net";
      
      public static var FIX:String = "fix";
      
      public static var BAJIE_DUNPAI_BUFF1:String = "bajie_dunpai_buff1";
      
      public static var BAJIE_DUNPAI_BUFF2:String = "bajie_dunpai_buff2";
      
      public static var BAJIE_DUNPAI_BUFF3:String = "bajie_dunpai_buff3";
      
      public static var SIDATIANWANG_SAN_MP_LOST:String = "sidatianwang_san_mp_lost";
      
      public static var PETHORSE_ICE:String = "pethorse_ice";
      
      public static var MAGIC_LEAF_CURE:String = "magic_leaf_cure";
      
      public static var MAGIC_LEAF_CURE2:String = "magic_leaf_cure2";
      
      public static var MAGIC_UMBRELLA_DEFEND:String = "magic_umbrella_defend";
      
      public static var MAGIC_UMBRELLA_DEFEND2:String = "magic_umbrella_defend2";
      
      public static var tjgl_Shield:String = "tjgl_Shield";
      
      public static var PETMONKEY_FIRE:String = "petmonkey_fire";
      
      public static var ERLANGSHEN_HP_REJECT:String = "erlangshen_hp_reject";
      
      public static var MONSTER36Bullet4:String = "monster36bullet4";
      
      public static var Monster37FIX:String = "monster37fix";
      
      public static var MAGIC_Ring:String = "magic_ring";
      
      public static var Pet_TIGER_SXHZ:String = "pet_tiger_sxhz";
      
      public static var SHENMISHANGRENSHIZHUANG:String = "shenmishangrenshizhuang";
      
      public static var PET_SXKB:String = "sxkb";
      
      public static var PET_FSNL:String = "fsnl";
      
      public static var PET_SMJC:String = "smjc";
      
      public static var PET_MFJC:String = "mfjc";
      
      public static var PET_GJJC:String = "gjjc";
      
      public static var PET_FYJC:String = "fyjc";
      
      public static var SLOWLY_ADDHP:String = "slowly_addhp";
      
      public static var ROLE5SKILL4:String = "role5skill4";
      
      public static var MONSTER42_REDUCE_HP:String = "monster42_reduce_hp";
      
      public static var MONSTER42_GREEN:String = "monster42_green";
      
      public static var MONSTER42_BLUE:String = "monster42_blue";
      
      public static var MONSTER47POISON:String = "monster47poison";
      
      public static var MONSTER47SLOW:String = "monster47slow";
      
      public static var MONSTER59CHOULAN:String = "monster59choulan";
      
      public static var POYAZHIREDUCEMP:String = "poyazhireducemp";
      
      public static var MONSTER115REDUCEHP:String = "monster115reducehp";
      
      public static var MONSTER115SLOW:String = "monster115slow";
      
      public static var LEMHXX:String = "lemhxx";
      
      public static var MONSTER53_TIE:String = "monster53_tie";
      
      public static var MONSTER54_HOUJIAO:String = "monster54_houjiao";
      
      public static var MONSTER65_TIED_PET:String = "monster65_tied_pet";
      
      public static var MONSTER65_AOE:String = "monster65_aoe";
      
      public static var MONSTER66HURT:String = "monster66hurt";
      
      public static var MONSTER114FEAR:String = "Monster114Fear";
      
      public static var MONSTER117SLEEP:String = "monster117sleep";
      
      public static var MONSTER118GELIE:String = "monster118gelie";
      
      public static var MONSTER120DEBUFF:String = "monster120debuff";
      
      public static var TIANTINGZHANSHEN:String = "tiantingzhansheng";
      
      public static var MONSTER129Buff:String = "monster129buff";
      
      public static var MONSTER131MUSIC1:String = "monster131music1";
      
      public static var MONSTER131MUSIC2:String = "monster131music2";
      
      public static var MONSTER135Buff:String = "monster135buff";
      
      public static var MONSTER136REDUCEMP:String = "monster136reducemp";
      
      public static var MONSTER137BUFF:String = "monster137buff";
      
      public static var MAGIC_FLAG_DEBUFF:String = "MagicFlagDebuff";
      
      public static var MAGIC_FLOWER_ADDBUFF:String = "MagicFlowerAddbuff";
      
      public static var MAGIC_FLOWER_DEBUFF:String = "MagicFlowerDebuff";
      
      public static var PET_RABBIT_JIFENG:String = "jifeng";
      
      public static var PET_RABBIT4_AOYI1:String = "petRabbit4Aoyi1";
      
      public static var PET_RABBIT4_AOYI2:String = "petRabbit4Aoyi2";
      
      public static var PETTURTKE_BUFF:String = "petturtle_buff";
      
      public static var JIUHUANSHENGJING:String = "jiuhuanshengjing";
      
      public static var XLFB_BUFF:String = "xlfb_buff";
      
      public static var SXFB_BUFF:String = "sxfb_buff";
      
      public static var YXFB_BUFF:String = "yxfb_buff";
      
      public static var YXFB_BUFF2:String = "yxfb_buff2";
      
      private var monster6008fire:int = 0;
      
      private var monster6008skill2def:int = 0;
      
      private var lxCount:uint;
      
      private var sxCount:uint;
      
      public var bjsdcs:int;
      
      private var sourceRole:BaseObject;
      
      private var hero:BaseObject;
      
      private var curEffectArray:Array;
      
      private var beAttackFatherTotalCount:int = 6;
      
      private var beAttackFatherCurCount:int = 0;
      
      private var lastBeAttackTime:int;
      
      private var gc:Config;
      
      private var glow:GlowFilter;
      
      private var count:int = 0;
      
      private var yybeff:MovieClip;
      
      private var ca:ColorMatrix;
      
      private var consumeMP:Array;
      
      private var hmzLianZhan:Array;
      
      private var hmzZaDi:Array;
      
      private var SkillFixedDamage:Array;
      
      private var FixedDamageCount:Array;
      
      private var SkillFactor:Array;
      
      private var hmzLianZhanFactor:Array;
      
      private var hmzZaDiFactor:Array;
      
      public function BaseAddEffect(param1:BaseObject)
      {
         this.consumeMP = [66,160,208,276,364,493,703,759,801,921,1085,1133,1318,1771,1884,1954,2320,2667];
         this.SkillFixedDamage = [];
         this.hmzLianZhan = [34,95,192,253,318,444,524,687,876,1091,1219,1480,1770,2092,2444,2831,3058,3500,3980,4497,5053,5649,5996,6660,7365,8116,8912,9757,10248,11169];
         this.hmzZaDi = [209,573,1151,1523,1912,2666,3149,4126,5258,6551,7323,8884,10623,12551,14671,16992,18350,21006,23881,26984,30320,33897,35981,39959,44197,48700,53480,58540,61492,67018];
         for(var i:int = 0; i < this.hmzLianZhan.length; i++)
         {
            this.SkillFixedDamage.push(this.hmzLianZhan[i] * 8 + this.hmzZaDi[i]);
         }
         trace(this.SkillFixedDamage[0]);
         this.FixedDamageCount = [1,1,1,1,2,2,2,2.5,2.5,2.5,2.8,2.8,2.8,3.05,3.05,3.05,3.25,3.25,3.45,3.45,3.65,3.65,3.8,3.8,3.95,4.1,4.25,4.4,4.4,4.55,4.7,4.7,4.8,4.9,4.9,4.9,4.9,5,5];
         this.hmzLianZhanFactor = [0.3407,0.0135 * 10];
         this.hmzZaDiFactor = [2.075,0.075 * 10];
         this.SkillFactor = [this.hmzLianZhanFactor[0] * 8 + this.hmzZaDiFactor[0],this.hmzLianZhanFactor[1] * 8 + this.hmzZaDiFactor[1]];
         this.ca = new ColorMatrix();
         this.curEffectArray = [];
         super();
         this.sourceRole = param1;
         this.gc = Config.getInstance();
         this.ca.adjustHue(120);
      }
      
      public function step() : void
      {
         var _loc1_:int = 0;
         var _loc2_:int = 0;
         var _loc3_:* = null;
         var _loc4_:* = 0;
         var _loc5_:* = null;
         var _loc6_:* = null;
         var _loc7_:int = 0;
         var _loc8_:* = null;
         var _loc9_:int = 0;
         var _loc10_:* = null;
         var _loc11_:* = 0;
         var _loc12_:* = 0;
         while(_loc9_ < this.curEffectArray.length)
         {
            _loc10_ = this.curEffectArray[_loc9_];
            if(_loc10_)
            {
               if(this.sourceRole)
               {
                  if(_loc10_.isFirst)
                  {
                     _loc10_.startTime = this.count;
                     _loc10_.isFirst = false;
                     if(_loc10_.name == BaseAddEffect.POISON)
                     {
                        this.showPoison();
                     }
                     else if(_loc10_.name == BaseAddEffect.MONSTER6008SKILL2)
                     {
                        this.showMonster6008skill2();
                        this.monster6008skill2def = int(_loc10_.value);
                     }
                     else if(_loc10_.name == BaseAddEffect.MONSTER6008FIRE)
                     {
                        this.showMonster6008fire();
                        this.monster6008fire += 1;
                     }
                     else if(_loc10_.name == BaseAddEffect.POISON_TIMES)
                     {
                        _loc10_.times = 1;
                        this.showPoisonTimes();
                     }
                     else if(_loc10_.name == BaseAddEffect.ICE)
                     {
                        this.showIce();
                     }
                     else if(_loc10_.name == BaseAddEffect.DEADLINK)
                     {
                        this.showDeadLink();
                     }
                     else if(_loc10_.name == BaseAddEffect.SPEEDUP)
                     {
                        this.showSpeedUp();
                     }
                     else if(_loc10_.name == BaseAddEffect.EYEFIX)
                     {
                        this.showEyeFix();
                     }
                     else if(_loc10_.name == BaseAddEffect.MAGICLOST)
                     {
                        this.showMagicLost();
                     }
                     else if(_loc10_.name == BaseAddEffect.STUN)
                     {
                        _loc10_.isFirst = true;
                        if(this.sourceRole.curAction == "hit24_1" && this.sourceRole is Role5)
                        {
                           this.sourceRole.setAction("wait");
                        }
                        if(!this.sourceRole.isAttacking())
                        {
                           _loc10_.isFirst = false;
                           this.showStun();
                           this.sourceRole.setStatic();
                        }
                     }
                     else if(_loc10_.name == BaseAddEffect.NET)
                     {
                        this.showNet();
                     }
                     else if(_loc10_.name == BaseAddEffect.FIX)
                     {
                        this.fix();
                     }
                     else if(_loc10_.name == BaseAddEffect.SLOWLY_ADDHP)
                     {
                        this.slowlyAddHp();
                     }
                     else if(_loc10_.name == BaseAddEffect.ROLE5SKILL4)
                     {
                        this.show_role5skill4();
                     }
                     else if(_loc10_.name == BaseAddEffect.ROLE5JRJL)
                     {
                        this.show_role5jrjl();
                     }
                     else if(_loc10_.name == BaseAddEffect.ROLE5TLJ)
                     {
                        this.show_role5tlj();
                     }
                     else if(_loc10_.name == BaseAddEffect.ROLE5JRJL)
                     {
                        this.show_role5jrjl();
                     }
                     else if(_loc10_.name == BaseAddEffect.BAJIE_DUNPAI_BUFF1 || _loc10_.name == BaseAddEffect.BAJIE_DUNPAI_BUFF2 || _loc10_.name == BaseAddEffect.BAJIE_DUNPAI_BUFF3)
                     {
                        this.bajie_dunpai_buff();
                     }
                     else if(_loc10_.name == BaseAddEffect.SIDATIANWANG_SAN_MP_LOST)
                     {
                        this.show_sidatianwang_san_mp_lost();
                     }
                     else if(_loc10_.name == BaseAddEffect.PETHORSE_ICE)
                     {
                        this.show_pethorse_ice();
                     }
                     else if(_loc10_.name == BaseAddEffect.MAGIC_LEAF_CURE)
                     {
                        this.show_magic_laf_cure();
                     }
                     else if(_loc10_.name == BaseAddEffect.MAGIC_LEAF_CURE2)
                     {
                        this.show_magic_laf_cure();
                     }
                     else if(_loc10_.name == BaseAddEffect.MAGIC_UMBRELLA_DEFEND)
                     {
                        this.show_magic_umb_def();
                     }
                     else if(_loc10_.name == BaseAddEffect.MAGIC_UMBRELLA_DEFEND2)
                     {
                        this.show_magic_umb_def();
                     }
                     else if(_loc10_.name == BaseAddEffect.tjgl_Shield)
                     {
                        this.show_tjgl_shield();
                     }
                     else if(_loc10_.name == BaseAddEffect.PETMONKEY_FIRE)
                     {
                        this.show_mpetmonkey_fire();
                     }
                     else if(_loc10_.name == BaseAddEffect.PET_SXKB)
                     {
                        this.show_sxkb();
                     }
                     else if(_loc10_.name == BaseAddEffect.PET_FSNL)
                     {
                        this.show_fsnl();
                     }
                     else if(_loc10_.name == BaseAddEffect.PET_SMJC)
                     {
                        this.show_smjc();
                     }
                     else if(_loc10_.name == BaseAddEffect.PET_MFJC)
                     {
                        this.show_mfjc();
                     }
                     else if(_loc10_.name == BaseAddEffect.PET_GJJC)
                     {
                        this.show_gjjc();
                     }
                     else if(_loc10_.name == BaseAddEffect.PET_FYJC)
                     {
                        this.show_fyjc();
                     }
                     else if(_loc10_.name == BaseAddEffect.ERLANGSHEN_HP_REJECT)
                     {
                        this.show_erlangshen();
                     }
                     else if(_loc10_.name == BaseAddEffect.MONSTER36Bullet4)
                     {
                        this.show_monster36bullet4();
                     }
                     else if(_loc10_.name == BaseAddEffect.Monster37FIX)
                     {
                        this.show_monster37fix();
                     }
                     else if(_loc10_.name == BaseAddEffect.SHENMISHANGRENSHIZHUANG)
                     {
                        this.show_shenmishangren();
                     }
                     else if(_loc10_.name == BaseAddEffect.Pet_TIGER_SXHZ)
                     {
                        this.show_pet_tiger_sxhz(_loc10_.time,_loc10_.direct);
                     }
                     else if(_loc10_.name == BaseAddEffect.MONSTER42_REDUCE_HP)
                     {
                        this.show_monster42_reduce_hp();
                     }
                     else if(_loc10_.name == BaseAddEffect.MONSTER42_GREEN)
                     {
                        this.show_monster42_green();
                     }
                     else if(_loc10_.name == BaseAddEffect.MONSTER42_BLUE)
                     {
                        this.show_monster42_blue();
                     }
                     else if(_loc10_.name == BaseAddEffect.MONSTER47POISON)
                     {
                        this.showMonster47Poison();
                     }
                     else if(_loc10_.name == BaseAddEffect.MONSTER47SLOW)
                     {
                        this.showMonster47Slow();
                     }
                     else if(_loc10_.name == BaseAddEffect.MONSTER53_TIE)
                     {
                        this.showMonster53Tie();
                     }
                     else if(_loc10_.name == BaseAddEffect.MONSTER54_HOUJIAO)
                     {
                        this.showMonster54Houjiao(_loc10_.point);
                     }
                     else if(_loc10_.name == BaseAddEffect.MONSTER59CHOULAN)
                     {
                        this.showMonster59choulan(_loc10_.value);
                     }
                     else if(_loc10_.name == BaseAddEffect.MONSTER65_TIED_PET)
                     {
                        this.showMonster65tied();
                     }
                     else if(_loc10_.name == BaseAddEffect.MONSTER65_AOE)
                     {
                        this.showMonster65aoe();
                     }
                     else if(_loc10_.name == BaseAddEffect.MONSTER66HURT)
                     {
                        this.showMonster66hurt();
                     }
                     else if(_loc10_.name == BaseAddEffect.MONSTER114FEAR)
                     {
                        this.showMonster114Fear();
                     }
                     else if(_loc10_.name == BaseAddEffect.POYAZHIREDUCEMP)
                     {
                        this.showPOYAZHIREDUCEMP(_loc10_.value);
                     }
                     else if(_loc10_.name == BaseAddEffect.MONSTER115REDUCEHP)
                     {
                        this.showMonster115Reducehp();
                     }
                     else if(_loc10_.name == BaseAddEffect.MONSTER115SLOW)
                     {
                        this.showMonster115slow();
                     }
                     else if(_loc10_.name == BaseAddEffect.LEMHXX)
                     {
                        this.showLemhxx();
                     }
                     else if(_loc10_.name == BaseAddEffect.MONSTER117SLEEP)
                     {
                        this.showMonster117sleep();
                     }
                     else if(_loc10_.name == BaseAddEffect.MONSTER118GELIE)
                     {
                        this.showMonster118gelie();
                     }
                     else if(_loc10_.name == BaseAddEffect.MONSTER120DEBUFF)
                     {
                        this.showMonster120debuff();
                     }
                     else if(_loc10_.name == BaseAddEffect.TIANTINGZHANSHEN)
                     {
                        this.showTiantingZhanshen();
                     }
                     else if(_loc10_.name == BaseAddEffect.MONSTER129Buff)
                     {
                        this.showMonster129Buff();
                     }
                     else if(_loc10_.name == BaseAddEffect.MONSTER131MUSIC1)
                     {
                        this.showMonster131Music1();
                     }
                     else if(_loc10_.name == BaseAddEffect.MONSTER131MUSIC2)
                     {
                        this.showMonster131Music2();
                     }
                     else if(_loc10_.name == BaseAddEffect.MONSTER135Buff)
                     {
                        this.showMonster135Buff();
                     }
                     else if(_loc10_.name == BaseAddEffect.MONSTER137BUFF)
                     {
                        _loc10_.times = 1;
                     }
                     else if(_loc10_.name == BaseAddEffect.MAGIC_FLAG_DEBUFF)
                     {
                        this.showMagicFlagDebuff();
                     }
                     else if(_loc10_.name == BaseAddEffect.MAGIC_FLOWER_ADDBUFF)
                     {
                        this.showMagicFlowerAddbuff();
                     }
                     else if(_loc10_.name == BaseAddEffect.MAGIC_FLOWER_DEBUFF)
                     {
                        this.showMagicFlowerDebuff();
                     }
                     else if(_loc10_.name == BaseAddEffect.PET_RABBIT_JIFENG)
                     {
                        this.showPetRabbitJiFeng();
                     }
                     else if(_loc10_.name == BaseAddEffect.PET_RABBIT4_AOYI1)
                     {
                        this.showPetRabbit4Aoyi1();
                     }
                     else if(_loc10_.name == BaseAddEffect.PET_RABBIT4_AOYI2)
                     {
                        this.showPetRabbit4Aoyi2();
                     }
                     else if(_loc10_.name == BaseAddEffect.PETTURTKE_BUFF)
                     {
                        this.show_petturtle_buff();
                     }
                     else if(_loc10_.name == BaseAddEffect.JIUHUANSHENGJING)
                     {
                        this.show_jiuhuanshengjing();
                     }
                     else if(_loc10_.name == BaseAddEffect.XLFB_BUFF)
                     {
                        this.showXLFB();
                     }
                     else if(_loc10_.name == BaseAddEffect.SXFB_BUFF)
                     {
                        this.showSXFB();
                     }
                     else if(_loc10_.name == BaseAddEffect.YXFB_BUFF2)
                     {
                        this.showYXFB();
                     }
                  }
                  if(_loc10_.isForever != 1 && this.count - Number(_loc10_.startTime) >= _loc10_.time)
                  {
                     if(_loc10_.name == BaseAddEffect.MAGIC_UMBRELLA_DEFEND2)
                     {
                        if(_loc10_.defendValue > 0)
                        {
                           BaseHero(this.sourceRole).cureHp(Number(_loc10_.defendValue) / 5);
                        }
                     }
                     this.remove(_loc10_);
                  }
                  if(_loc10_.name == BaseAddEffect.MONSTER6008FIRE)
                  {
                     if(this.count % this.gc.frameClips * 1.5 == 0)
                     {
                        if(this.sourceRole is BaseHero && !this.sourceRole.isDead())
                        {
                           if(this.gc.isSingleGame())
                           {
                              _loc10_.power = int(BaseHero(this.sourceRole).roleProperies.getSHHP() * 0.02 * this.monster6008fire);
                              BaseHero(this.sourceRole).addHeroHurtMc(_loc10_.power);
                              this.sourceRole.reduceHp(_loc10_.power);
                           }
                        }
                     }
                  }
                  if(_loc10_.name == BaseAddEffect.POISON)
                  {
                     if(this.count % this.gc.frameClips == 0)
                     {
                        if(this.sourceRole is BaseHero)
                        {
                           if(this.gc.isSingleGame())
                           {
                              this.sourceRole.reduceHp(_loc10_.power);
                           }
                           BaseHero(this.sourceRole).addHeroHurtMc(_loc10_.power);
                        }
                        else if(this.sourceRole is BaseMonster)
                        {
                           this.sourceRole.reduceHp(_loc10_.power);
                           BaseMonster(this.sourceRole).addMonHurtMc(_loc10_.power,false);
                        }
                     }
                  }
                  else if(_loc10_.name == BaseAddEffect.FATHER)
                  {
                     if(Number(getTimer()) - this.lastBeAttackTime >= _loc10_.interval)
                     {
                        this.beAttackFatherCurCount = 0;
                     }
                  }
                  else if(_loc10_.name == BaseAddEffect.MAGICLOST)
                  {
                     if(this.sourceRole is BaseHero)
                     {
                        BaseHero(this.sourceRole).reduceMp(Math.abs(BaseHero(this.sourceRole).speed.x) * 2);
                     }
                  }
                  else if(_loc10_.name == BaseAddEffect.SLOWLY_ADDHP)
                  {
                     if(this.sourceRole is BaseHero)
                     {
                        if(this.count % this.gc.frameClips == 0)
                        {
                           _loc12_ = uint(_loc10_.value);
                           if(BaseHero(this.sourceRole).isGXP)
                           {
                              _loc12_ = uint(_loc12_ * 1.5);
                           }
                           BaseHero(this.sourceRole).cureHp(_loc12_);
                        }
                     }
                  }
                  else if(_loc10_.name == BaseAddEffect.ROLE5SKILL4)
                  {
                     this.yybeff = this.sourceRole.getChildByName("yyb");
                     if(Boolean(this.yybeff) && this.sourceRole is Role5)
                     {
                        this.yybeff.filters = Role5(this.sourceRole)._invert == true ? [new ColorMatrixFilter(this.ca)] : null;
                     }
                  }
                  else if(_loc10_.name == BaseAddEffect.BAJIE_DUNPAI_BUFF1 || _loc10_.name == BaseAddEffect.BAJIE_DUNPAI_BUFF2 || _loc10_.name == BaseAddEffect.BAJIE_DUNPAI_BUFF3)
                  {
                     if(this.sourceRole is BaseHero)
                     {
                        if(this.count % this.gc.frameClips == 0)
                        {
                           _loc2_ = int(BaseHero(this.sourceRole).getPlayer().returnSkillLevelBySkillName("sd"));
                           _loc11_ = uint(Math.ceil(0.015 / (1 + 0.28098 * 8) * (1 + 0.28098 * (_loc2_ - 1)) * BaseHero(this.sourceRole).roleProperies.getSHHP()));
                           BaseHero(this.sourceRole).cureHp(_loc11_);
                        }
                     }
                     else if(this.sourceRole is Monster33)
                     {
                        if(this.count % this.gc.frameClips == 0)
                        {
                           Monster33(this.sourceRole).cureHp(Number(Monster33(this.sourceRole).getSHp()) * 0.01);
                        }
                     }
                  }
                  else if(_loc10_.name == BaseAddEffect.STUN)
                  {
                     if(!this.sourceRole.isAttacking() && Boolean(_loc10_.isFirst))
                     {
                        _loc10_.isFirst = false;
                        this.showStun();
                        this.sourceRole.setStatic();
                     }
                  }
                  else if(_loc10_.name == BaseAddEffect.MAGIC_LEAF_CURE)
                  {
                     if(this.count % this.gc.frameClips == 0)
                     {
                        if(this.sourceRole is BaseHero)
                        {
                           if(BaseHero(this.sourceRole).getPlayer())
                           {
                              if(BaseHero(this.sourceRole).getCurMagicWeapon() is MagicLeaf)
                              {
                                 _loc3_ = BaseHero(this.sourceRole).getPlayer().getCurEquipByType("zbfb");
                                 if(_loc3_)
                                 {
                                    if(_loc3_.getWX().indexOf("木") != -1)
                                    {
                                       BaseHero(this.sourceRole).cureHp(Number(_loc3_.getELevel()) * Number(BaseHero(this.sourceRole).roleProperies.getSHHP()) * 0.003);
                                    }
                                    else
                                    {
                                       BaseHero(this.sourceRole).cureHp(Number(_loc3_.getELevel()) * Number(BaseHero(this.sourceRole).roleProperies.getSHHP()) * 0.002);
                                    }
                                 }
                              }
                           }
                        }
                     }
                  }
                  else if(_loc10_.name == BaseAddEffect.MAGIC_LEAF_CURE2)
                  {
                     if(this.count % this.gc.frameClips == 0)
                     {
                        if(this.sourceRole is BaseHero)
                        {
                           if(BaseHero(this.sourceRole).getPlayer())
                           {
                              if(BaseHero(this.sourceRole).getCurMagicWeapon() is MagicLeaf2)
                              {
                                 _loc3_ = BaseHero(this.sourceRole).getPlayer().getCurEquipByType("zbfb");
                                 if(_loc3_)
                                 {
                                    if(_loc3_.getWX().indexOf("木") != -1)
                                    {
                                       BaseHero(this.sourceRole).cureHp(Number(_loc3_.getELevel()) * Number(BaseHero(this.sourceRole).roleProperies.getSHHP()) * 0.003);
                                       BaseHero(this.sourceRole).cureMp(Number(_loc3_.getELevel()) * Number(BaseHero(this.sourceRole).roleProperies.getSMMP()) * 0.0015);
                                    }
                                    else
                                    {
                                       BaseHero(this.sourceRole).cureHp(Number(_loc3_.getELevel()) * Number(BaseHero(this.sourceRole).roleProperies.getSHHP()) * 0.002);
                                       BaseHero(this.sourceRole).cureMp(Number(_loc3_.getELevel()) * Number(BaseHero(this.sourceRole).roleProperies.getSMMP()) * 0.001);
                                    }
                                 }
                              }
                           }
                        }
                     }
                  }
                  else if(_loc10_.name == BaseAddEffect.PETMONKEY_FIRE)
                  {
                     if(this.count % this.gc.frameClips == 0)
                     {
                        this.sourceRole.reduceHp(_loc10_.hurt,false);
                     }
                  }
                  else if(_loc10_.name == BaseAddEffect.Monster37FIX)
                  {
                     if(this.count % this.gc.frameClips == 0)
                     {
                        this.sourceRole.reduceHp(500,false);
                        if(this.sourceRole is BaseHero)
                        {
                           BaseHero(this.sourceRole).roleProperies.dispatchEvent(new CommonEvent("SetMMp",[Number(BaseHero(this.sourceRole).roleProperies.getMMP()) - 100]));
                        }
                     }
                  }
                  else if(_loc10_.name == BaseAddEffect.MONSTER42_GREEN)
                  {
                     if(this.count % this.gc.frameClips == 0)
                     {
                        if(this.sourceRole is BaseHero)
                        {
                           BaseHero(this.sourceRole).reduceHp(Number(BaseHero(this.sourceRole).roleProperies.getSHHP()) / 100,false);
                        }
                     }
                  }
                  else if(_loc10_.name == BaseAddEffect.MONSTER47POISON)
                  {
                     if(this.count % this.gc.frameClips == 0)
                     {
                        if(this.sourceRole is BaseHero)
                        {
                           _loc4_ = uint((Number(BaseHero(this.sourceRole).roleProperies.getSHHP()) - Number(BaseHero(this.sourceRole).roleProperies.getHHP())) * 0.05);
                           (this.sourceRole as BaseHero).reduceHp(_loc4_,false);
                        }
                     }
                  }
                  else if(_loc10_.name == BaseAddEffect.MONSTER118GELIE)
                  {
                     if(this.count % this.gc.frameClips == 0)
                     {
                        if(this.sourceRole is BaseHero)
                        {
                           _loc5_ = _loc10_.point;
                           _loc6_ = new Point(this.sourceRole.x,this.sourceRole.y);
                           _loc7_ = Math.abs(Number(_loc5_.x) - Number(_loc6_.x));
                           _loc10_.point = _loc6_;
                           _loc4_ = uint(_loc7_ * 10);
                           (this.sourceRole as BaseHero).reduceHp(_loc4_,false);
                        }
                     }
                  }
                  else if(_loc10_.name == BaseAddEffect.MONSTER120DEBUFF)
                  {
                     if(this.count % this.gc.frameClips == 0)
                     {
                        if(this.sourceRole is BaseMonster)
                        {
                           (this.sourceRole as BaseMonster).cureHp(500);
                        }
                     }
                  }
                  else if(_loc10_.name == BaseAddEffect.MONSTER135Buff)
                  {
                     if(this.count % this.gc.frameClips == 0)
                     {
                        if(this.sourceRole is BaseHero)
                        {
                           _loc8_ = this.sourceRole as BaseHero;
                           _loc8_.reduceHp(_loc10_.hurt);
                        }
                     }
                  }
                  else if(_loc10_.name == BaseAddEffect.MONSTER136REDUCEMP)
                  {
                     if(_loc10_.time == 1)
                     {
                        if(this.sourceRole is BaseHero)
                        {
                           (this.sourceRole as BaseHero).reduceMp(100);
                        }
                     }
                  }
                  else if(_loc10_.name == BaseAddEffect.PET_RABBIT4_AOYI1)
                  {
                     if(this.count % this.gc.frameClips == 0)
                     {
                        if(this.sourceRole is BaseHero)
                        {
                           _loc8_ = this.sourceRole as BaseHero;
                           _loc8_.cureHp(Number(_loc8_.roleProperies.getSHHP()) / 10);
                        }
                        else if(this.sourceRole is BasePet)
                        {
                           this.sourceRole.cureHp(Number(this.sourceRole.petInfo.getSHp()) / 10);
                        }
                     }
                  }
                  if(_loc10_.name == BaseAddEffect.MAGIC_FLAG_DEBUFF)
                  {
                     if(this.count % this.gc.frameClips == 0)
                     {
                        if(this.sourceRole is BaseMonster)
                        {
                           _loc1_ = Number(BaseMonster(this.sourceRole).getSHp()) * 0.02;
                           if(!BaseMonster(this.sourceRole).isDead())
                           {
                              this.sourceRole.reduceHp(_loc1_);
                              BaseMonster(this.sourceRole).addMonHurtMc(_loc1_,false);
                           }
                        }
                     }
                  }
               }
            }
            _loc9_++;
         }
         if(this.sourceRole)
         {
            if(this.sourceRole is BaseHero)
            {
               if(Boolean(this.sourceRole.isGXP) || Boolean(this.gc.protectedPerproty.getProperty(this.sourceRole,"isYourFather")))
               {
                  this.myGlow();
               }
               else if(!this.sourceRole.isGXP && !this.gc.protectedPerproty.getProperty(this.sourceRole,"isYourFather"))
               {
                  this.cancelGlow();
               }
            }
            else if(this.sourceRole is BasePet)
            {
               if(this.gc.protectedPerproty.getProperty(this.sourceRole,"isYourFather"))
               {
                  this.myGlow();
               }
               else
               {
                  this.cancelGlow();
               }
            }
         }
         ++this.count;
      }
      
      protected function cancelGlow() : void
      {
         this.glow = null;
         this.sourceRole.filters = [];
      }
      
      protected function myGlow() : void
      {
         if(this.sourceRole.isGXP)
         {
            if(!this.glow)
            {
               this.glow = new GlowFilter(16777215,1,15,15,1.5,BitmapFilterQuality.HIGH,false,false);
            }
            else
            {
               this.glow.color = 16777215;
               if(this.glow.blurX > 6 && this.glow.alpha == 1)
               {
                  --this.glow.blurX;
                  --this.glow.blurY;
                  if(this.glow.blurX == 6)
                  {
                     this.glow.alpha = 0.8;
                  }
               }
               if(this.glow.blurX < 15 && this.glow.alpha == 0.8)
               {
                  ++this.glow.blurX;
                  ++this.glow.blurY;
                  if(this.glow.blurX == 15)
                  {
                     this.glow.alpha = 1;
                  }
               }
            }
         }
         else if(this.gc.protectedPerproty.getProperty(this.sourceRole,"isYourFather"))
         {
            if(!this.glow)
            {
               if(this.sourceRole is Role1)
               {
                  this.glow = new GlowFilter(16711680,1,15,15,1.5,BitmapFilterQuality.HIGH,false,false);
               }
               else if(this.sourceRole is Role2)
               {
                  this.glow = new GlowFilter(255,1,15,15,1.5,BitmapFilterQuality.HIGH,false,false);
               }
               else if(this.sourceRole is Role3)
               {
                  this.glow = new GlowFilter(16763955,1,15,15,1.5,BitmapFilterQuality.HIGH,false,false);
               }
               else if(this.sourceRole is Role4)
               {
                  this.glow = new GlowFilter(65280,1,15,15,1.5,BitmapFilterQuality.HIGH,false,false);
               }
               else if(this.sourceRole is BasePet)
               {
                  this.glow = new GlowFilter(10092288,1,15,15,1.5,BitmapFilterQuality.HIGH,false,false);
               }
            }
            else
            {
               if(this.sourceRole is Role1)
               {
                  this.glow.color = 16711680;
               }
               else if(this.sourceRole is Role2)
               {
                  this.glow.color = 255;
               }
               else if(this.sourceRole is Role3)
               {
                  this.glow.color = 16763955;
               }
               else if(this.sourceRole is Role4)
               {
                  this.glow.color = 65280;
               }
               else if(this.sourceRole is BasePet)
               {
                  this.glow.color = 10092288;
               }
               if(this.glow.blurX > 6 && this.glow.alpha == 1)
               {
                  --this.glow.blurX;
                  --this.glow.blurY;
                  if(this.glow.blurX == 6)
                  {
                     this.glow.alpha = 0.8;
                  }
               }
               if(this.glow.blurX < 15 && this.glow.alpha == 0.8)
               {
                  ++this.glow.blurX;
                  ++this.glow.blurY;
                  if(this.glow.blurX == 15)
                  {
                     this.glow.alpha = 1;
                  }
               }
            }
         }
         if(this.glow)
         {
            this.sourceRole.filters = [this.glow];
         }
      }
      
      public function updateFather() : void
      {
         var _loc1_:Object = this.getBuffByName("father");
         if(!_loc1_)
         {
            return;
         }
         if(this.beAttackFatherCurCount < this.beAttackFatherTotalCount)
         {
            ++this.beAttackFatherCurCount;
            if(this.beAttackFatherCurCount >= this.beAttackFatherTotalCount)
            {
               this.sourceRole.setYourFather(_loc1_.time,_loc1_.istouming);
               this.beAttackFatherCurCount = 0;
            }
         }
         this.lastBeAttackTime = getTimer();
      }
      
      public function isAnyThingElseStun(param1:String) : Boolean
      {
         var _loc2_:int = 0;
         var _loc3_:Boolean = false;
         var _loc4_:* = null;
         _loc2_ = 0;
         while(_loc2_ < this.curEffectArray.length)
         {
            _loc4_ = this.curEffectArray[_loc2_];
            if(_loc4_)
            {
               if(_loc4_.name != param1)
               {
                  _loc3_ = Boolean(this.isCannotContrlSkill(_loc4_));
                  if(_loc3_)
                  {
                     return _loc3_;
                  }
               }
            }
            _loc2_++;
         }
         return _loc3_;
      }
      
      private function isCannotContrlSkill(param1:Object) : Boolean
      {
         if(param1.name == BaseAddEffect.ICE || param1.name == BaseAddEffect.Pet_TIGER_SXHZ || param1.name == BaseAddEffect.MONSTER54_HOUJIAO || param1.name == BaseAddEffect.PETHORSE_ICE || param1.name == BaseAddEffect.EYEFIX || param1.name == BaseAddEffect.FIX || param1.name == BaseAddEffect.MONSTER53_TIE || param1.name == BaseAddEffect.STUN || param1.name == BaseAddEffect.MONSTER117SLEEP || param1.name == BaseAddEffect.MONSTER135Buff)
         {
            return true;
         }
         return false;
      }
      
      public function getTTZSnum(i:int = 0) : Number
      {
         var _loc9_:int = 0;
         var _loc10_:* = null;
         while(_loc9_ < this.curEffectArray.length)
         {
            _loc10_ = this.curEffectArray[_loc9_];
            if(_loc10_)
            {
               if(this.sourceRole)
               {
                  if(_loc10_.name == BaseAddEffect.TIANTINGZHANSHEN)
                  {
                     if(i == 0)
                     {
                        return _loc10_.def;
                     }
                     if(i == 1)
                     {
                        return _loc10_.mdef;
                     }
                  }
               }
            }
            _loc9_++;
         }
         return undefined;
      }
      
      public function add(param1:Array) : void
      {
         var _loc2_:int = 0;
         var _loc3_:int = 0;
         var _loc4_:int = 0;
         var _loc5_:* = undefined;
         var _loc6_:Number = Number(NaN);
         var _loc7_:* = null;
         var _loc8_:* = null;
         var _loc9_:Boolean = true;
         while(_loc4_ < param1.length)
         {
            _loc7_ = param1[_loc4_];
            _loc3_ = 0;
            while(_loc3_ < this.curEffectArray.length)
            {
               _loc8_ = this.curEffectArray[_loc3_];
               if(_loc8_)
               {
                  if(_loc7_.name == _loc8_.name)
                  {
                     if(_loc8_.name == BaseAddEffect.POISON_TIMES)
                     {
                        ++_loc8_.times;
                        if(_loc8_.who)
                        {
                           _loc5_ = _loc8_.who;
                        }
                     }
                     if(_loc8_.name == BaseAddEffect.MONSTER6008FIRE)
                     {
                        this.monster6008fire += 1;
                     }
                     if(_loc5_ is Role4)
                     {
                        if(_loc5_.getPlayer().getSkillBySkillName("mds"))
                        {
                           if(_loc8_.times > 2)
                           {
                              _loc6_ = Number(_loc5_.getPlayer().returnSkillLevelBySkillName("mbyj") - 1);
                              this.poison_times_bomb(_loc6_,_loc5_);
                              if(_loc6_ >= 0)
                              {
                                 _loc5_.curAddEffect.add([{
                                    "name":BaseAddEffect.SPEEDUP,
                                    "time":this.gc.frameClips * 3
                                 }]);
                              }
                           }
                        }
                     }
                     _loc8_.time = _loc7_.time;
                     _loc8_.startTime = this.count;
                     _loc9_ = false;
                  }
               }
               _loc3_++;
            }
            if(_loc9_)
            {
               _loc7_.isFirst = true;
               if(Boolean(this.gc.isSingleGame()) && Boolean(this.isCannotContrlSkill(_loc7_)))
               {
                  if(this.sourceRole)
                  {
                     if(this.sourceRole is BaseHero)
                     {
                        if((this.sourceRole as BaseHero).getPlayer())
                        {
                           if(this.sourceRole.getPlayer().getCurEquipByType("zbsp"))
                           {
                              if(this.sourceRole.getPlayer().getCurEquipByType("zbsp").getFillName() == "phhl" || this.sourceRole.getPlayer().getCurEquipByType("zbsp").getFillName() == "hy")
                              {
                                 if(_loc7_.time > 5)
                                 {
                                    _loc7_.time = 5;
                                 }
                              }
                           }
                        }
                     }
                  }
               }
               if(this.sourceRole is BaseHero)
               {
               }
               this.curEffectArray.push(_loc7_);
            }
            _loc9_ = true;
            _loc4_++;
         }
      }
      
      public function poison_times_bomb(param1:int, param2:Role4) : void
      {
         var _loc3_:int = 0;
         var _loc4_:int = 0;
         var _loc5_:int = 0;
         var _loc6_:* = null;
         var _loc7_:* = 0;
         var _loc8_:* = null;
         var x_num:Number = 0.28098 / 2;
         var mp_percent:Number = 0;
         if(this.sourceRole is MonsterRole4Hit5)
         {
            return;
         }
         while(_loc5_ < this.curEffectArray.length)
         {
            _loc6_ = this.curEffectArray[_loc5_];
            if(Boolean(_loc6_) && _loc6_.name == BaseAddEffect.POISON_TIMES)
            {
               _loc7_ = uint(_loc6_.times);
               if(_loc7_ > 6)
               {
                  _loc7_ = 6;
               }
               mp_percent = 3 * Math.pow(26483 * 0.016 / 3,Math.pow(_loc7_ / 17,0.55)) / param2.roleProperies.getSMMP() / 0.016 * 3 * Math.pow(1 / 3,Math.pow(param1 / 17,0.75));
               _loc4_ = 0.525 * (this.SkillFixedDamage[param1] * this.FixedDamageCount[param1] * 1.05 + (this.SkillFactor[0] + this.SkillFactor[1] * param1) * 6201 / 5658 * param2.roleProperies.getHurt()) * 0.86 * (0.6 + 121 / 3655 * (param2.getPlayer().returnSkillLevelBySkillName("mds") - 1)) * 1.525;
               _loc3_ = Math.ceil(0.15 * param2.roleProperies.getSHHP());
               param2.curAddEffect.add([{
                  "name":BaseAddEffect.tjgl_Shield,
                  "time":this.gc.frameClips * 6.6,
                  "defendValue":_loc3_ * 1.252
               }]);
               param2.cureHp(_loc3_);
               BaseMonster(this.sourceRole).beattackedtimes = BaseMonster(this.sourceRole).beattackedtimes + 1000 * 0.11;
               this.gc.eventManger.dispatchEvent(new CommonEvent("MonsterIsBeat",[Math.ceil(1000 * 0.11 * 0.8 / 10),param2]));
               _loc4_ *= 1 - Math.max(BaseMonster(this.sourceRole).mDef - 0.1325,0);
               this.sourceRole.reduceHp(_loc4_,false);
               if(BaseMonster(this.sourceRole).isBoss)
               {
                  if(BaseMonster(this.sourceRole).beattackedtimes > 1000)
                  {
                     if(!(BaseMonster(this.sourceRole) is Monster11111))
                     {
                        BaseMonster(this.sourceRole).setYourFather(this.gc.frameClips * 3.2,true);
                     }
                     BaseMonster(this.sourceRole).beattackedtimes = 0;
                  }
                  if(!BaseMonster(this.sourceRole).isDead())
                  {
                     this.gc.gameInfo.addbeatt(BaseMonster(this.sourceRole).monsterName + "_beatt",BaseMonster(this.sourceRole).beattackedtimes / 1000);
                  }
               }
               else if(BaseMonster(this.sourceRole).beattackedtimes > 2500)
               {
                  BaseMonster(this.sourceRole).setYourFather(this.gc.frameClips * 2.5,true);
                  BaseMonster(this.sourceRole).beattackedtimes = 0;
               }
               if(this.sourceRole is BaseMonster)
               {
                  BaseMonster(this.sourceRole).addMonHurtMc(_loc4_,false);
               }
               if(this.sourceRole is BaseHero)
               {
                  if(BaseHero(this.sourceRole).sid != this.gc.sid && Boolean(this.gc.isInRoom()))
                  {
                     this.gc.sendAttack(BaseHero(param2).getRoleId(),"poison_bomb",BaseHero(param2).getBBDC().getDirect(),BaseHero(param2).x,BaseHero(param2).y,[]);
                     this.gc.sendHurt(param1,BaseHero(this.sourceRole).sid,Number(BaseHero(this.sourceRole).getRoleId()) * 10 + BaseHero(param2).getRoleId(),"",0,0,0,false,false);
                  }
               }
               _loc6_.times = 0;
               _loc6_.time = 0;
               this.remove(_loc6_);
               _loc8_ = new FollowBaseObjectBullet("Role4MDS");
               _loc8_.x = this.sourceRole.x;
               _loc8_.y = this.sourceRole.y;
               _loc8_.setRole(this.sourceRole);
               _loc8_.setDisable();
               _loc8_.setDirect(this.sourceRole.getBBDC().getDirect());
               _loc8_.setAction("hit0");
               this.gc.gameSence.addChild(_loc8_);
               this.sourceRole.magicBulletArray.push(_loc8_);
            }
            _loc5_++;
         }
         if(BaseMonster(this.sourceRole).isDead())
         {
            BaseMonster(this.sourceRole).setYourFather(this.gc.frameClips * 99,false);
            BaseMonster(this.sourceRole).setAction("dead");
            BaseMonster(this.sourceRole).curAddEffect.cancelAllEffect();
         }
      }
      
      public function poison_times_bomb_other() : void
      {
         var _loc1_:int = 0;
         var _loc2_:* = null;
         var _loc3_:* = null;
         while(_loc1_ < this.curEffectArray.length)
         {
            _loc2_ = this.curEffectArray[_loc1_];
            if(Boolean(_loc2_) && _loc2_.name == BaseAddEffect.POISON_TIMES)
            {
               _loc2_.times = 0;
               _loc2_.time = 0;
               this.remove(_loc2_);
               _loc3_ = new FollowBaseObjectBullet("Role4MDS");
               _loc3_.x = this.sourceRole.x;
               _loc3_.y = this.sourceRole.y;
               _loc3_.setRole(this.sourceRole);
               _loc3_.setDisable();
               _loc3_.setDirect(this.sourceRole.getBBDC().getDirect());
               _loc3_.setAction("hit0");
               this.gc.gameSence.addChild(_loc3_);
               this.sourceRole.magicBulletArray.push(_loc3_);
               return;
            }
            _loc1_++;
         }
      }
      
      public function removeloong() : void
      {
         var _loc1_:* = null;
         var _loc5_:int = 0;
         while(_loc5_ < this.curEffectArray.length)
         {
            _loc1_ = this.curEffectArray[_loc5_];
            if(Boolean(_loc1_) && _loc1_.name == BaseAddEffect.ROLE5LOONGSWORD)
            {
               this.remove(_loc1_);
            }
            _loc5_++;
         }
      }
      
      public function removeRole5TLJ() : void
      {
         var _loc1_:* = null;
         var _loc5_:int = 0;
         while(_loc5_ < this.curEffectArray.length)
         {
            _loc1_ = this.curEffectArray[_loc5_];
            if(Boolean(_loc1_) && _loc1_.name == BaseAddEffect.ROLE5TLJ)
            {
               this.remove(_loc1_);
            }
            _loc5_++;
         }
      }
      
      public function remove(param1:Object) : void
      {
         var _loc2_:int = int(this.curEffectArray.indexOf(param1));
         if(_loc2_ != -1)
         {
            this.curEffectArray[_loc2_] = null;
         }
         if(param1.name == BaseAddEffect.POISON)
         {
            this.hidePoison();
         }
         else if(param1.name == BaseAddEffect.MONSTER6008SKILL2)
         {
            this.hideMonster6008skill2();
         }
         else if(param1.name == BaseAddEffect.MONSTER6008FIRE)
         {
            this.hideMonster6008fire();
         }
         else if(param1.name == BaseAddEffect.POISON_TIMES)
         {
            this.hidePoisonTimes();
         }
         else if(param1.name == BaseAddEffect.ICE)
         {
            this.hideIce();
         }
         else if(param1.name == BaseAddEffect.DEADLINK)
         {
            this.hideDeadLink();
         }
         else if(param1.name == BaseAddEffect.SPEEDUP)
         {
            this.hideSpeedUp();
         }
         else if(param1.name == BaseAddEffect.EYEFIX)
         {
            this.hideEyeFix();
         }
         else if(param1.name == BaseAddEffect.MAGICLOST)
         {
            this.hideMagicLost();
         }
         else if(param1.name == BaseAddEffect.STUN)
         {
            this.hideStun();
         }
         else if(param1.name == BaseAddEffect.NET)
         {
            this.hideNet();
         }
         else if(param1.name == BaseAddEffect.FIX)
         {
            this.hideFix();
         }
         else if(param1.name == BaseAddEffect.SLOWLY_ADDHP)
         {
            this.hideSlowlyAddHp();
         }
         else if(param1.name == BaseAddEffect.ROLE5SKILL4)
         {
            this.hiderole5skill4();
         }
         else if(param1.name == BaseAddEffect.ROLE5JRJL)
         {
            this.hiderole5jrjl();
         }
         else if(param1.name == BaseAddEffect.ROLE5TLJ)
         {
            this.hiderole5tlj();
         }
         else if(param1.name == BaseAddEffect.BAJIE_DUNPAI_BUFF1)
         {
            if(this.bjsdcs == 1)
            {
               this.hideBajieDunpaiBuff();
            }
         }
         else if(param1.name == BaseAddEffect.BAJIE_DUNPAI_BUFF2)
         {
            if(this.bjsdcs == 2)
            {
               this.hideBajieDunpaiBuff();
            }
         }
         else if(param1.name == BaseAddEffect.BAJIE_DUNPAI_BUFF3)
         {
            if(this.bjsdcs == 3)
            {
               this.hideBajieDunpaiBuff();
            }
         }
         else if(param1.name == BaseAddEffect.SIDATIANWANG_SAN_MP_LOST)
         {
            this.hide_sidatianwang_san_mp_lost(parseInt(param1.mpSource));
         }
         else if(param1.name == BaseAddEffect.PETHORSE_ICE)
         {
            this.hide_pethorse_ice();
         }
         else if(param1.name == BaseAddEffect.MAGIC_LEAF_CURE)
         {
            this.hide_magic_laf_cure();
         }
         else if(param1.name == BaseAddEffect.MAGIC_LEAF_CURE2)
         {
            this.hide_magic_laf_cure();
         }
         else if(param1.name == BaseAddEffect.MAGIC_UMBRELLA_DEFEND)
         {
            this.hide_magic_umb_def();
         }
         else if(param1.name == BaseAddEffect.MAGIC_UMBRELLA_DEFEND2)
         {
            this.hide_magic_umb_def();
         }
         else if(param1.name == BaseAddEffect.tjgl_Shield)
         {
            this.hide_tjgl_shield();
         }
         else if(param1.name == BaseAddEffect.PETMONKEY_FIRE)
         {
            this.hide_mpetmonkey_fire();
         }
         else if(param1.name == BaseAddEffect.PET_SXKB)
         {
            this.hide_sxkb();
         }
         else if(param1.name == BaseAddEffect.PET_FSNL)
         {
            this.hide_fsnl();
         }
         else if(param1.name == BaseAddEffect.PET_SMJC)
         {
            this.hide_smjc();
         }
         else if(param1.name == BaseAddEffect.PET_MFJC)
         {
            this.hide_mfjc();
         }
         else if(param1.name == BaseAddEffect.PET_GJJC)
         {
            this.hide_gjjc();
         }
         else if(param1.name == BaseAddEffect.PET_FYJC)
         {
            this.hide_fyjc();
         }
         else if(param1.name == BaseAddEffect.ERLANGSHEN_HP_REJECT)
         {
            this.hide_erlangshen();
         }
         else if(param1.name == BaseAddEffect.MONSTER36Bullet4)
         {
            this.hide_monster36bullet4();
         }
         else if(param1.name == BaseAddEffect.Monster37FIX)
         {
            this.hide_monster37fix();
         }
         else if(param1.name == BaseAddEffect.SHENMISHANGRENSHIZHUANG)
         {
            this.hide_shenmishangren();
         }
         else if(param1.name == BaseAddEffect.Pet_TIGER_SXHZ)
         {
            this.hide_pet_tiger_sxhz();
         }
         else if(param1.name == BaseAddEffect.MONSTER42_REDUCE_HP)
         {
            this.hide_monster42_reduce_hp();
         }
         else if(param1.name == BaseAddEffect.MONSTER42_GREEN)
         {
            this.hide_monster42_green();
         }
         else if(param1.name == BaseAddEffect.MONSTER42_BLUE)
         {
            this.hide_monster42_blue();
         }
         else if(param1.name == BaseAddEffect.MONSTER47POISON)
         {
            this.hideMonster47Poison();
         }
         else if(param1.name == BaseAddEffect.MONSTER47SLOW)
         {
            this.hideMonster47Slow();
         }
         else if(param1.name == BaseAddEffect.MONSTER53_TIE)
         {
            this.hideMonster53Tie();
         }
         else if(param1.name == BaseAddEffect.MONSTER54_HOUJIAO)
         {
            this.hideMonster54Houjiao();
         }
         else if(param1.name == BaseAddEffect.MONSTER65_TIED_PET)
         {
            this.hideMonster65tied();
         }
         else if(param1.name == BaseAddEffect.MONSTER65_AOE)
         {
            this.hideMonster65aoe();
         }
         else if(param1.name == BaseAddEffect.MONSTER66HURT)
         {
            this.hideMonster66hurt();
         }
         else if(param1.name == BaseAddEffect.MONSTER114FEAR)
         {
            this.hideMonster114Fear();
         }
         else if(param1.name == BaseAddEffect.MONSTER115REDUCEHP)
         {
            this.hideMonster115Reducehp(parseInt(param1.hpSource));
         }
         else if(param1.name == BaseAddEffect.MONSTER115SLOW)
         {
            this.hideMonster115slow();
         }
         else if(param1.name == BaseAddEffect.LEMHXX)
         {
            this.hideLemhxx();
         }
         else if(param1.name == BaseAddEffect.MONSTER117SLEEP)
         {
            this.hideMonster117sleep();
         }
         else if(param1.name == BaseAddEffect.MONSTER118GELIE)
         {
            this.hideMonster118gelie();
         }
         else if(param1.name == BaseAddEffect.MONSTER120DEBUFF)
         {
            this.hideMonster120debuff();
         }
         else if(param1.name == BaseAddEffect.TIANTINGZHANSHEN)
         {
            this.hideTiantingZhanshen();
         }
         else if(param1.name == BaseAddEffect.MONSTER129Buff)
         {
            this.hideMonster129Buff();
         }
         else if(param1.name == BaseAddEffect.MONSTER131MUSIC1)
         {
            this.hideMonster131Music1();
         }
         else if(param1.name == BaseAddEffect.MONSTER131MUSIC2)
         {
            this.hideMonster131Music2();
         }
         else if(param1.name == BaseAddEffect.MONSTER135Buff)
         {
            this.hideMonster135Buff();
         }
         else if(param1.name == BaseAddEffect.PET_RABBIT_JIFENG)
         {
            this.hidePetRabbitJiFeng();
         }
         else if(param1.name == BaseAddEffect.PET_RABBIT4_AOYI1)
         {
            this.hidePetRabbit4Aoyi1();
         }
         else if(param1.name == BaseAddEffect.PET_RABBIT4_AOYI2)
         {
            this.hidePetRabbit4Aoyi2();
         }
         else if(param1.name == BaseAddEffect.PETTURTKE_BUFF)
         {
            this.hide_petturtle_buff();
         }
         else if(param1.name == BaseAddEffect.MAGIC_FLAG_DEBUFF)
         {
            this.hideMagicFlagDebuff();
         }
         else if(param1.name == BaseAddEffect.MAGIC_FLOWER_ADDBUFF)
         {
            this.hideMagicFlowerAddbuff();
         }
         else if(param1.name == BaseAddEffect.MAGIC_FLOWER_DEBUFF)
         {
            this.hideMagicFlowerDebuff();
         }
         else if(param1.name == BaseAddEffect.JIUHUANSHENGJING)
         {
            this.hide_jiuhuanshengjing();
         }
         else if(param1.name == BaseAddEffect.XLFB_BUFF)
         {
            this.hideXLFB();
         }
         else if(param1.name == BaseAddEffect.SXFB_BUFF)
         {
            this.hideSXFB();
         }
         else if(param1.name == BaseAddEffect.YXFB_BUFF)
         {
            this.hideYXFB();
         }
         else if(param1.name == BaseAddEffect.YXFB_BUFF2)
         {
            this.hideYXFB();
         }
      }
      
      public function destroy() : void
      {
         this.curEffectArray = [];
         this.count = 0;
         this.beAttackFatherCurCount = 0;
         this.hidePoison();
         this.hideIce();
         this.hideDeadLink();
         this.hideEyeFix();
         this.hideSpeedUp();
         this.hideMagicLost();
         this.hideStun();
         this.hideNet();
         this.hideBajieDunpaiBuff();
         this.hideSlowlyAddHp();
         this.hiderole5skill4();
         this.gc.protectedPerproty.removeProperty(this.sourceRole);
         this.sourceRole = null;
      }
      
      protected function showIce() : void
      {
         var _loc1_:* = null;
         if(!this.sourceRole.getChildByName("PetHorseIceEffect"))
         {
            try
            {
               _loc1_ = AUtils.getNewObj("PetHorseIceEffect");
               _loc1_.width = this.sourceRole.colipse.width;
               _loc1_.height = this.sourceRole.colipse.height;
               _loc1_.name = "PetHorseIceEffect";
               this.sourceRole.addChild(_loc1_);
            }
            catch(e:Error)
            {
            }
         }
         if(this.sourceRole is BaseHero)
         {
            if(BaseHero(this.sourceRole).getPlayer())
            {
               BaseHero(this.sourceRole).setLostKeyboard();
            }
         }
         this.sourceRole.setStatic();
         this.sourceRole.getBBDC().stopFrame();
      }
      
      protected function showDeadLink() : void
      {
         var _loc1_:* = null;
         if(this.sourceRole.getChildByName("deadlink"))
         {
            return;
         }
         try
         {
            _loc1_ = AUtils.getNewObj("DeadLink");
            _loc1_.name = "deadlink";
            _loc1_.x = 0;
            _loc1_.y = -40;
            this.sourceRole.addChild(_loc1_);
            return;
         }
         catch(e:*)
         {
            return;
         }
      }
      
      protected function showMonster6008skill2() : void
      {
         var _loc1_:* = null;
         if(this.sourceRole.getChildByName("qingyangshenjun_skill2_2"))
         {
            return;
         }
         try
         {
            _loc1_ = AUtils.getNewObj("qingyangshenjun_skill2_2");
            _loc1_.name = "qingyangshenjun_skill2_2";
            _loc1_.x = -166;
            _loc1_.y = -161;
            this.sourceRole.addChild(_loc1_);
            BaseMonster(this.sourceRole).setDef(BaseMonster(this.sourceRole).getDef() + this.monster6008skill2def);
            return;
         }
         catch(e:*)
         {
            return;
         }
      }
      
      protected function hideMonster6008skill2() : void
      {
         var _loc1_:* = null;
         if(this.sourceRole.getChildByName("qingyangshenjun_skill2_2"))
         {
            this.sourceRole.removeChild(this.sourceRole.getChildByName("qingyangshenjun_skill2_2"));
            BaseMonster(this.sourceRole).setDef(BaseMonster(this.sourceRole).getDef() - this.monster6008skill2def);
         }
      }
      
      protected function showMonster6008fire() : void
      {
      }
      
      protected function hideMonster6008fire() : void
      {
         this.monster6008fire = 0;
      }
      
      protected function showSpeedUp() : void
      {
         var _loc1_:* = null;
         if(this.sourceRole.getChildByName("speedup"))
         {
            return;
         }
         try
         {
            _loc1_ = AUtils.getNewObj("SpeedUp");
            _loc1_.name = "speedup";
            _loc1_.x = 0;
            _loc1_.y = 25;
            this.sourceRole.addChild(_loc1_);
            return;
         }
         catch(e:*)
         {
            return;
         }
      }
      
      protected function showMagicLost() : void
      {
         var _loc1_:* = null;
         if(this.sourceRole.getChildByName("magiclost"))
         {
            return;
         }
         try
         {
            _loc1_ = AUtils.getNewObj("MagicLost");
            _loc1_.name = "magiclost";
            _loc1_.x = 0;
            _loc1_.y = 0;
            this.sourceRole.addChild(_loc1_);
            return;
         }
         catch(e:Error)
         {
            return;
         }
      }
      
      protected function show_monster36bullet4() : void
      {
         var _loc1_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster36Linghun");
         _loc1_.x = this.sourceRole.x;
         _loc1_.y = this.sourceRole.y;
         _loc1_.rotation = int(Math.random() * 360);
         _loc1_.setRole(this.sourceRole);
         _loc1_.setDisable();
         _loc1_.setDirect(0);
         _loc1_.setAction("hit1");
         this.gc.gameSence.addChild(_loc1_);
         this.sourceRole.magicBulletArray.push(_loc1_);
         if(this.sourceRole is BaseHero)
         {
            BaseHero(this.sourceRole).roleProperies.setMMP(Number(BaseHero(this.sourceRole).roleProperies.getMMP()) - 100);
         }
      }
      
      protected function hide_monster36bullet4() : void
      {
      }
      
      protected function show_erlangshen() : void
      {
         var _loc1_:* = null;
         if(this.sourceRole.getChildByName("Monster22_ERLANGSHEN_HP_REJECT"))
         {
            return;
         }
         try
         {
            _loc1_ = AUtils.getNewObj("Monster22_ERLANGSHEN_HP_REJECT");
            _loc1_.name = "Monster22_ERLANGSHEN_HP_REJECT";
            this.sourceRole.addChild(_loc1_);
            return;
         }
         catch(e:*)
         {
            return;
         }
      }
      
      protected function hide_erlangshen() : void
      {
         if(this.sourceRole.getChildByName("Monster22_ERLANGSHEN_HP_REJECT"))
         {
            this.sourceRole.removeChild(this.sourceRole.getChildByName("Monster22_ERLANGSHEN_HP_REJECT"));
         }
      }
      
      protected function show_fyjc() : void
      {
         var _loc1_:FollowBaseObjectBullet = new FollowBaseObjectBullet("buff_fyjc");
         _loc1_.x = this.sourceRole.x;
         _loc1_.y = this.sourceRole.y;
         _loc1_.width = this.sourceRole.colipse.width;
         _loc1_.height = this.sourceRole.colipse.height;
         _loc1_.setRole(this.sourceRole);
         _loc1_.setDisable();
         _loc1_.setDirect(this.sourceRole.getBBDC().getDirect());
         _loc1_.setAction("hit0");
         this.gc.gameSence.addChild(_loc1_);
         this.sourceRole.magicBulletArray.push(_loc1_);
      }
      
      protected function hide_fyjc() : void
      {
      }
      
      protected function show_gjjc() : void
      {
         var _loc1_:FollowBaseObjectBullet = new FollowBaseObjectBullet("buff_gjjc");
         _loc1_.x = this.sourceRole.x;
         _loc1_.y = this.sourceRole.y;
         _loc1_.width = this.sourceRole.colipse.width;
         _loc1_.height = this.sourceRole.colipse.height;
         _loc1_.setRole(this.sourceRole);
         _loc1_.setDisable();
         _loc1_.setDirect(this.sourceRole.getBBDC().getDirect());
         _loc1_.setAction("hit0");
         this.gc.gameSence.addChild(_loc1_);
         this.sourceRole.magicBulletArray.push(_loc1_);
      }
      
      protected function hide_gjjc() : void
      {
      }
      
      protected function showXLFB() : void
      {
         if(this.lxCount >= this.gc.frameClips)
         {
            this.lxCount = 0;
            this.sourceRole.reduceHp(Number(this.sourceRole.roleProperies.getSHHP()) / 0.05);
         }
         ++this.lxCount;
         this.sourceRole.setHue(-150);
      }
      
      protected function hideXLFB() : void
      {
         this.sourceRole.setHue(0);
         this.lxCount = 0;
      }
      
      protected function showSXFB() : void
      {
         if(this.sxCount >= this.gc.frameClips)
         {
            this.sxCount = 0;
            this.sourceRole.reduceHp(Number(this.sourceRole.roleProperies.getSHHP()) / 0.054);
         }
         ++this.sxCount;
         this.sourceRole.setHue(-50);
      }
      
      protected function hideSXFB() : void
      {
         this.sourceRole.setHue(0);
         this.sxCount = 0;
      }
      
      protected function showYXFB() : void
      {
         this.sourceRole.setHue(-100);
      }
      
      protected function hideYXFB() : void
      {
         this.sourceRole.setHue(0);
      }
      
      protected function show_mfjc() : void
      {
         var _loc1_:FollowBaseObjectBullet = new FollowBaseObjectBullet("buff_mfjc");
         _loc1_.x = this.sourceRole.x;
         _loc1_.y = this.sourceRole.y;
         _loc1_.width = this.sourceRole.colipse.width;
         _loc1_.height = this.sourceRole.colipse.height;
         _loc1_.setRole(this.sourceRole);
         _loc1_.setDisable();
         _loc1_.setDirect(this.sourceRole.getBBDC().getDirect());
         _loc1_.setAction("hit0");
         this.gc.gameSence.addChild(_loc1_);
         this.sourceRole.magicBulletArray.push(_loc1_);
      }
      
      protected function hide_mfjc() : void
      {
      }
      
      protected function show_smjc() : void
      {
         var _loc1_:FollowBaseObjectBullet = new FollowBaseObjectBullet("buff_smjc");
         _loc1_.x = this.sourceRole.x;
         _loc1_.y = this.sourceRole.y;
         _loc1_.width = this.sourceRole.colipse.width;
         _loc1_.height = this.sourceRole.colipse.height;
         _loc1_.setRole(this.sourceRole);
         _loc1_.setDisable();
         _loc1_.setDirect(this.sourceRole.getBBDC().getDirect());
         _loc1_.setAction("hit0");
         this.gc.gameSence.addChild(_loc1_);
         this.sourceRole.magicBulletArray.push(_loc1_);
      }
      
      protected function hide_smjc() : void
      {
      }
      
      protected function show_fsnl() : void
      {
         var _loc1_:* = null;
         if(this.sourceRole.getChildByName("buff_fsnl"))
         {
            return;
         }
         try
         {
            _loc1_ = AUtils.getNewObj("buff_fsnl");
            _loc1_.name = "buff_fsnl";
            _loc1_.width = this.sourceRole.colipse.width;
            _loc1_.height = this.sourceRole.colipse.height;
            this.sourceRole.addChild(_loc1_);
            return;
         }
         catch(e:*)
         {
            return;
         }
      }
      
      protected function hide_fsnl() : void
      {
         if(this.sourceRole.getChildByName("buff_fsnl"))
         {
            this.sourceRole.removeChild(this.sourceRole.getChildByName("buff_fsnl"));
         }
      }
      
      protected function show_sxkb() : void
      {
         var _loc1_:* = null;
         if(this.sourceRole.getChildByName("buff_sxkb"))
         {
            return;
         }
         try
         {
            _loc1_ = AUtils.getNewObj("buff_sxkb");
            _loc1_.name = "buff_sxkb";
            _loc1_.width = this.sourceRole.colipse.width;
            _loc1_.height = this.sourceRole.colipse.height;
            this.sourceRole.addChild(_loc1_);
            return;
         }
         catch(e:*)
         {
            return;
         }
      }
      
      protected function hide_sxkb() : void
      {
         if(this.sourceRole.getChildByName("buff_sxkb"))
         {
            this.sourceRole.removeChild(this.sourceRole.getChildByName("buff_sxkb"));
         }
      }
      
      protected function show_mpetmonkey_fire() : void
      {
         var _loc1_:* = null;
         if(this.sourceRole.getChildByName("FireBuff"))
         {
            return;
         }
         try
         {
            _loc1_ = AUtils.getNewObj("FireBuff");
            _loc1_.name = "FireBuff";
            this.sourceRole.addChild(_loc1_);
            return;
         }
         catch(e:Error)
         {
            return;
         }
      }
      
      protected function hide_mpetmonkey_fire() : void
      {
         if(this.sourceRole.getChildByName("FireBuff"))
         {
            this.sourceRole.removeChild(this.sourceRole.getChildByName("FireBuff"));
         }
      }
      
      protected function showMonster54Houjiao(param1:Point) : void
      {
         var targetPoint:Point = null;
         targetPoint = null;
         targetPoint = null;
         targetPoint = null;
         targetPoint = param1;
         if(this.sourceRole)
         {
            this.sourceRole.setStatic();
            this.sourceRole.getBBDC().stopFrame();
            if(this.sourceRole is BaseHero)
            {
               BaseHero(this.sourceRole).setStatic();
               if(BaseHero(this.sourceRole).getPlayer())
               {
                  BaseHero(this.sourceRole).setLostKeyboard();
               }
            }
            TweenMax.to(this.sourceRole,0.5,{
               "x":targetPoint.x,
               "y":targetPoint.y,
               "onComplete":function(param1:BaseObject):*
               {
                  var bo:* = param1;
                  if(!bo.isDead())
                  {
                     TweenMax.to(bo,1.2,{
                        "x":targetPoint.x,
                        "y":targetPoint.y - 36,
                        "onComplete":function(param1:BaseObject):*
                        {
                           if(!param1.isDead())
                           {
                              if(param1 is BaseHero)
                              {
                                 BaseHero(param1).setStatic();
                                 if(BaseHero(param1).getPlayer())
                                 {
                                    BaseHero(param1).reSetLostKeyboard();
                                 }
                              }
                              param1.getBBDC().continueFrame();
                           }
                        },
                        "onCompleteParams":[bo]
                     });
                  }
               },
               "onCompleteParams":[this.sourceRole]
            });
         }
      }
      
      protected function showPetRabbit4Aoyi1() : void
      {
      }
      
      protected function hidePetRabbit4Aoyi1() : void
      {
      }
      
      protected function showPetRabbit4Aoyi2() : void
      {
         var _loc1_:MovieClip = null;
         if(!this.sourceRole.getChildByName("petRabbit4AoyiBuff"))
         {
            try
            {
               _loc1_ = AUtils.getNewObj("petRabbit4AoyiBuff");
               _loc1_.x = 0;
               _loc1_.y = -120;
               _loc1_.name = "petRabbit4AoyiBuff";
               this.sourceRole.addChild(_loc1_);
            }
            catch(e:*)
            {
            }
         }
      }
      
      protected function hidePetRabbit4Aoyi2() : void
      {
         if(this.sourceRole.getChildByName("petRabbit4AoyiBuff"))
         {
            this.sourceRole.removeChild(this.sourceRole.getChildByName("petRabbit4AoyiBuff"));
         }
      }
      
      protected function showPetRabbitJiFeng() : void
      {
         var _loc1_:MovieClip = null;
         if(!this.sourceRole.getChildByName("PetPetRabbitJFBuff"))
         {
            try
            {
               _loc1_ = AUtils.getNewObj("PetPetRabbitJFBuff");
               _loc1_.x = 0;
               _loc1_.y = 20;
               _loc1_.name = "PetPetRabbitJFBuff";
               this.sourceRole.addChild(_loc1_);
            }
            catch(e:*)
            {
            }
         }
      }
      
      protected function hidePetRabbitJiFeng() : void
      {
         if(this.sourceRole.getChildByName("PetPetRabbitJFBuff"))
         {
            this.sourceRole.removeChild(this.sourceRole.getChildByName("PetPetRabbitJFBuff"));
         }
      }
      
      protected function show_petturtle_buff() : void
      {
         var mc:* = null;
         if(!this.sourceRole.getChildByName("PetTurtle2Buff"))
         {
            try
            {
               mc = AUtils.getNewObj("PetTurtle2Buff");
               mc.y = -50;
               mc.name = "PetTurtle2Buff";
               this.sourceRole.addChild(mc);
            }
            catch(e:Error)
            {
            }
         }
      }
      
      protected function hide_petturtle_buff() : void
      {
         if(this.sourceRole.getChildByName("PetTurtle2Buff"))
         {
            this.sourceRole.removeChild(this.sourceRole.getChildByName("PetTurtle2Buff"));
         }
      }
      
      protected function hideMonster54Houjiao() : void
      {
      }
      
      protected function showMonster59choulan(param1:uint) : void
      {
         var _loc2_:* = null;
         if(this.sourceRole)
         {
            _loc2_ = new FollowBaseObjectBullet("Monster59Effect1");
            _loc2_.x = this.sourceRole.x;
            _loc2_.y = this.sourceRole.y;
            _loc2_.setRole(this.sourceRole);
            _loc2_.setHurtCanCutDownEffect(false);
            _loc2_.setDisable();
            _loc2_.setDirect(0);
            _loc2_.setAction("null");
            this.gc.gameSence.addChild(_loc2_);
            this.sourceRole.magicBulletArray.push(_loc2_);
            if(this.sourceRole is BaseHero)
            {
               BaseHero(this.sourceRole).reduceMp(param1);
            }
         }
      }
      
      protected function showPOYAZHIREDUCEMP(param1:uint) : void
      {
         if(this.sourceRole)
         {
            if(this.sourceRole is BaseHero)
            {
               BaseHero(this.sourceRole).reduceMp(param1);
            }
         }
      }
      
      protected function hidePOYAZHIREDUCEMP() : void
      {
      }
      
      protected function hideMonster59choulan() : void
      {
      }
      
      protected function showMonster131Music1() : void
      {
         var _loc1_:MovieClip = null;
         if(!this.sourceRole.getChildByName("monster131MusicBuff1"))
         {
            try
            {
               _loc1_ = AUtils.getNewObj("monster131MusicBuff1");
               _loc1_.x = 0;
               _loc1_.y = -60;
               _loc1_.name = "monster131MusicBuff1";
               this.sourceRole.addChild(_loc1_);
            }
            catch(e:*)
            {
            }
         }
      }
      
      protected function hideMonster131Music1() : void
      {
         if(this.sourceRole.getChildByName("monster131MusicBuff1"))
         {
            this.sourceRole.removeChild(this.sourceRole.getChildByName("monster131MusicBuff1"));
         }
      }
      
      protected function showMonster135Buff() : void
      {
         var _loc1_:MovieClip = null;
         if(!this.sourceRole.getChildByName("monster135Buff"))
         {
            try
            {
               _loc1_ = AUtils.getNewObj("BaseAddEffectSleep");
               _loc1_.x = 0;
               _loc1_.y = -30;
               _loc1_.name = "monster135Buff";
               this.sourceRole.addChild(_loc1_);
            }
            catch(e:*)
            {
            }
         }
         BaseObject(this.sourceRole).getBBDC().stopFrame();
         if(this.sourceRole is BaseHero)
         {
            if(BaseHero(this.sourceRole).getPlayer())
            {
               BaseHero(this.sourceRole).setLostKeyboard();
            }
         }
      }
      
      protected function hideMonster135Buff() : void
      {
         if(this.sourceRole.getChildByName("monster135Buff"))
         {
            this.sourceRole.removeChild(this.sourceRole.getChildByName("monster135Buff"));
         }
         if(!this.isAnyThingElseStun(BaseAddEffect.MONSTER135Buff))
         {
            this.sourceRole.getBBDC().continueFrame();
            if(this.sourceRole is BaseHero)
            {
               if(BaseHero(this.sourceRole).getPlayer())
               {
                  BaseHero(this.sourceRole).reSetLostKeyboard();
               }
            }
         }
      }
      
      protected function showMonster131Music2() : void
      {
         var _loc1_:MovieClip = null;
         if(!this.sourceRole.getChildByName("monster131MusicBuff2"))
         {
            try
            {
               _loc1_ = AUtils.getNewObj("monster131MusicBuff2");
               _loc1_.x = 0;
               _loc1_.y = -60;
               _loc1_.name = "monster131MusicBuff2";
               this.sourceRole.addChild(_loc1_);
            }
            catch(e:*)
            {
            }
         }
      }
      
      protected function hideMonster131Music2() : void
      {
         if(this.sourceRole.getChildByName("monster131MusicBuff2"))
         {
            this.sourceRole.removeChild(this.sourceRole.getChildByName("monster131MusicBuff2"));
         }
      }
      
      protected function showMonster129Buff() : void
      {
         var _loc1_:MovieClip = null;
         if(!this.sourceRole.getChildByName("Monster129Bullet3PlayerBuff"))
         {
            try
            {
               _loc1_ = AUtils.getNewObj("Monster129Bullet3PlayerBuff");
               _loc1_.x = 0;
               _loc1_.y = 20;
               _loc1_.name = "Monster129Bullet3PlayerBuff";
               this.sourceRole.addChild(_loc1_);
            }
            catch(e:*)
            {
            }
         }
      }
      
      protected function hideMonster129Buff() : void
      {
         if(this.sourceRole.getChildByName("Monster129Bullet3PlayerBuff"))
         {
            this.sourceRole.removeChild(this.sourceRole.getChildByName("Monster129Bullet3PlayerBuff"));
         }
      }
      
      protected function showTiantingZhanshen() : void
      {
         var _loc1_:MovieClip = null;
         if(!this.sourceRole.getChildByName("tiantingzhanshenBuff"))
         {
            try
            {
               _loc1_ = AUtils.getNewObj("tiantingzhanshenBuff");
               _loc1_.x = 0;
               _loc1_.y = -45;
               _loc1_.name = "tiantingzhanshenBuff";
               this.sourceRole.addChild(_loc1_);
            }
            catch(e:*)
            {
            }
         }
      }
      
      protected function hideTiantingZhanshen() : void
      {
         if(this.sourceRole.getChildByName("tiantingzhanshenBuff"))
         {
            this.sourceRole.removeChild(this.sourceRole.getChildByName("tiantingzhanshenBuff"));
         }
      }
      
      protected function showMonster120debuff() : void
      {
      }
      
      protected function hideMonster120debuff() : void
      {
      }
      
      protected function showMonster118gelie() : void
      {
         var _loc1_:MovieClip = null;
         if(!this.sourceRole.getChildByName("Monster118Bullet3Buff"))
         {
            try
            {
               _loc1_ = AUtils.getNewObj("Monster118Bullet3Buff");
               _loc1_.x = 0;
               _loc1_.y = -45;
               _loc1_.name = "Monster118Bullet3Buff";
               this.sourceRole.addChild(_loc1_);
            }
            catch(e:*)
            {
            }
         }
      }
      
      protected function hideMonster118gelie() : void
      {
         if(this.sourceRole.getChildByName("Monster118Bullet3Buff"))
         {
            this.sourceRole.removeChild(this.sourceRole.getChildByName("Monster118Bullet3Buff"));
         }
      }
      
      protected function showMonster117sleep() : void
      {
         var _loc1_:MovieClip = null;
         if(!this.sourceRole.getChildByName("BaseAddEffectSleep"))
         {
            try
            {
               _loc1_ = AUtils.getNewObj("BaseAddEffectSleep");
               _loc1_.x = 0;
               _loc1_.y = -45;
               _loc1_.name = "BaseAddEffectSleep";
               this.sourceRole.addChild(_loc1_);
            }
            catch(e:*)
            {
            }
         }
         BaseObject(this.sourceRole).getBBDC().stopFrame();
         if(this.sourceRole is BaseHero)
         {
            if(BaseHero(this.sourceRole).getPlayer())
            {
               BaseHero(this.sourceRole).setLostKeyboard();
            }
         }
      }
      
      protected function hideMonster117sleep() : void
      {
         if(this.sourceRole.getChildByName("BaseAddEffectSleep"))
         {
            this.sourceRole.removeChild(this.sourceRole.getChildByName("BaseAddEffectSleep"));
         }
         if(!this.isAnyThingElseStun(BaseAddEffect.MONSTER117SLEEP))
         {
            this.sourceRole.getBBDC().continueFrame();
            if(this.sourceRole is BaseHero)
            {
               if(BaseHero(this.sourceRole).getPlayer())
               {
                  BaseHero(this.sourceRole).reSetLostKeyboard();
               }
            }
         }
      }
      
      protected function showMonster114Fear() : void
      {
         var _loc1_:MovieClip = null;
         if(!this.sourceRole.getChildByName("Monster114Bullet2Buff"))
         {
            try
            {
               _loc1_ = AUtils.getNewObj("Monster114Bullet2Buff");
               _loc1_.x = 0;
               _loc1_.y = -45;
               _loc1_.name = "Monster114Bullet2Buff";
               this.sourceRole.addChild(_loc1_);
            }
            catch(e:*)
            {
            }
         }
      }
      
      protected function hideMonster114Fear() : void
      {
         if(this.sourceRole.getChildByName("Monster114Bullet2Buff"))
         {
            this.sourceRole.removeChild(this.sourceRole.getChildByName("Monster114Bullet2Buff"));
         }
      }
      
      protected function showMonster66hurt() : void
      {
         if(this.sourceRole is BaseHero)
         {
            BaseHero(this.sourceRole).reduceHp(Number(BaseHero(this.sourceRole).roleProperies.getSHHP()) * 0.03);
         }
         else if(this.sourceRole is BasePet)
         {
            BasePet(this.sourceRole).reduceHp(Number(BasePet(this.sourceRole).petInfo.getSHp()) * 0.03);
         }
      }
      
      protected function hideMonster66hurt() : void
      {
      }
      
      protected function showMonster65aoe() : void
      {
         var _loc1_:MovieClip = null;
         if(!this.sourceRole.getChildByName("Monster65Bullet3Buff"))
         {
            try
            {
               _loc1_ = AUtils.getNewObj("Monster65Bullet3Buff");
               _loc1_.x = 0;
               _loc1_.y = 0;
               _loc1_.name = "Monster65Bullet3Buff";
               this.sourceRole.addChild(_loc1_);
            }
            catch(e:*)
            {
            }
         }
      }
      
      protected function hideMonster65aoe() : void
      {
         if(this.sourceRole.getChildByName("Monster65Bullet3Buff"))
         {
            this.sourceRole.removeChild(this.sourceRole.getChildByName("Monster65Bullet3Buff"));
         }
      }
      
      protected function showMonster65tied() : void
      {
         var _loc1_:MovieClip = null;
         if(!this.sourceRole.getChildByName("Monster65Bullet2"))
         {
            try
            {
               _loc1_ = AUtils.getNewObj("Monster65Bullet2");
               _loc1_.x = 0;
               _loc1_.y = 0;
               _loc1_.name = "Monster65Bullet2";
               this.sourceRole.addChild(_loc1_);
            }
            catch(e:*)
            {
            }
         }
         if(this.sourceRole is BasePet)
         {
            BasePet(this.sourceRole).getBBDC().stopFrame();
         }
      }
      
      protected function hideMonster65tied() : void
      {
         if(this.sourceRole.getChildByName("Monster65Bullet2"))
         {
            this.sourceRole.removeChild(this.sourceRole.getChildByName("Monster65Bullet2"));
         }
         if(this.sourceRole is BasePet)
         {
            BasePet(this.sourceRole).getBBDC().continueFrame();
         }
      }
      
      protected function show_monster37fix() : void
      {
         var _loc1_:MovieClip = null;
         if(!this.sourceRole.getChildByName("Monster37Bullet2_2"))
         {
            try
            {
               _loc1_ = AUtils.getNewObj("Monster37Bullet2_2");
               _loc1_.x = 0;
               _loc1_.y = 0;
               if(this.sourceRole.getBBDC().getDirect() == 1)
               {
                  AUtils.flipHorizontal(_loc1_,-1);
               }
               _loc1_.name = "Monster37Bullet2_2";
               this.sourceRole.addChild(_loc1_);
            }
            catch(e:*)
            {
            }
         }
      }
      
      protected function hide_monster37fix() : void
      {
         if(this.sourceRole.getChildByName("Monster37Bullet2_2"))
         {
            this.sourceRole.removeChild(this.sourceRole.getChildByName("Monster37Bullet2_2"));
         }
      }
      
      protected function showMonster53Tie() : void
      {
         var _loc1_:* = null;
         if(!this.sourceRole.getChildByName("Monster53Bullet2"))
         {
            _loc1_ = AUtils.getNewObj("Monster53Bullet2");
            _loc1_.name = "Monster53Bullet2";
            this.sourceRole.addChild(_loc1_);
         }
         this.sourceRole.setStatic();
         this.sourceRole.getBBDC().stopFrame();
         if(this.sourceRole is BaseHero)
         {
            BaseHero(this.sourceRole).setStatic();
            if(BaseHero(this.sourceRole).getPlayer())
            {
               BaseHero(this.sourceRole).setLostKeyboard();
            }
         }
      }
      
      protected function hideMonster53Tie() : void
      {
         if(this.sourceRole.getChildByName("Monster53Bullet2"))
         {
            this.sourceRole.removeChild(this.sourceRole.getChildByName("Monster53Bullet2"));
         }
         this.sourceRole.getBBDC().continueFrame();
         if(this.sourceRole is BaseHero)
         {
            if(BaseHero(this.sourceRole).getPlayer())
            {
               BaseHero(this.sourceRole).reSetLostKeyboard();
            }
         }
      }
      
      protected function show_magic_umb_def() : void
      {
         var _loc1_:* = null;
         if(this.sourceRole.getChildByName("MagicUmbrellaEffect"))
         {
            return;
         }
         try
         {
            _loc1_ = AUtils.getNewObj("MagicUmbrellaEffect");
            _loc1_.name = "MagicUmbrellaEffect";
            _loc1_.x = 0;
            _loc1_.y = 0;
            this.sourceRole.addChild(_loc1_);
            return;
         }
         catch(e:*)
         {
            return;
         }
      }
      
      protected function show_magic_umb_def2() : void
      {
         var _loc1_:* = null;
         if(this.sourceRole.getChildByName("MagicUmbrellaEffect"))
         {
            return;
         }
         try
         {
            _loc1_ = AUtils.getNewObj("MagicUmbrellaEffect");
            _loc1_.name = "MagicUmbrellaEffect";
            _loc1_.x = 0;
            _loc1_.y = 0;
            this.sourceRole.addChild(_loc1_);
            return;
         }
         catch(e:*)
         {
            return;
         }
      }
      
      protected function show_tjgl_shield() : void
      {
         var _loc1_:* = null;
         if(this.sourceRole.getChildByName("tjglShield"))
         {
            return;
         }
         try
         {
            _loc1_ = AUtils.getNewObj("tjglShield");
            _loc1_.name = "tjglShield";
            _loc1_.x = 0;
            _loc1_.y = 0;
            this.sourceRole.addChild(_loc1_);
            return;
         }
         catch(e:*)
         {
            return;
         }
      }
      
      public function reduceMagicUmbDef(param1:uint) : void
      {
         var _loc2_:int = 0;
         var _loc3_:* = null;
         while(_loc2_ < this.curEffectArray.length)
         {
            _loc3_ = this.curEffectArray[_loc2_];
            if(Boolean(_loc3_) && (_loc3_.name == BaseAddEffect.MAGIC_UMBRELLA_DEFEND || _loc3_.name == BaseAddEffect.MAGIC_UMBRELLA_DEFEND2))
            {
               _loc3_.defendValue -= param1;
               if(_loc3_.defendValue <= 0)
               {
                  this.remove(_loc3_);
                  if(_loc3_.defendValue < 0)
                  {
                     this.sourceRole.reduceHp(Math.abs(_loc3_.defendValue),true);
                  }
               }
            }
            _loc2_++;
         }
      }
      
      public function reducetjglShieldDef(param1:uint) : void
      {
         var _loc2_:int = 0;
         var _loc3_:* = null;
         while(_loc2_ < this.curEffectArray.length)
         {
            _loc3_ = this.curEffectArray[_loc2_];
            if(Boolean(_loc3_) && _loc3_.name == BaseAddEffect.tjgl_Shield)
            {
               _loc3_.defendValue -= param1;
               if(_loc3_.defendValue <= 0)
               {
                  this.remove(_loc3_);
                  if(_loc3_.defendValue < 0)
                  {
                     this.sourceRole.reduceHp(Math.abs(_loc3_.defendValue),true);
                  }
               }
            }
            _loc2_++;
         }
      }
      
      protected function hide_magic_umb_def() : void
      {
         if(this.sourceRole.getChildByName("MagicUmbrellaEffect"))
         {
            this.sourceRole.removeChild(this.sourceRole.getChildByName("MagicUmbrellaEffect"));
         }
      }
      
      protected function hide_tjgl_shield() : void
      {
         if(this.sourceRole.getChildByName("tjglShield"))
         {
            this.sourceRole.removeChild(this.sourceRole.getChildByName("tjglShield"));
         }
      }
      
      protected function show_magic_laf_cure() : void
      {
         var _loc1_:* = null;
         if(this.sourceRole.getChildByName("MagicLeafEffect"))
         {
            return;
         }
         try
         {
            _loc1_ = AUtils.getNewObj("MagicLeafEffect");
            _loc1_.name = "MagicLeafEffect";
            this.sourceRole.addChild(_loc1_);
            return;
         }
         catch(e:*)
         {
            return;
         }
      }
      
      protected function hide_magic_laf_cure() : void
      {
         if(this.sourceRole.getChildByName("MagicLeafEffect"))
         {
            this.sourceRole.removeChild(this.sourceRole.getChildByName("MagicLeafEffect"));
         }
      }
      
      protected function showMonster47Slow() : void
      {
      }
      
      protected function hideMonster47Slow() : void
      {
      }
      
      protected function showMonster47Poison() : void
      {
         var _loc1_:* = null;
         if(!this.sourceRole.getChildByName("PoisonBuff"))
         {
            _loc1_ = AUtils.getNewObj("PoisonBuff");
            _loc1_.name = "PoisonBuff";
            this.sourceRole.addChild(_loc1_);
         }
      }
      
      protected function hideMonster47Poison() : void
      {
         if(this.sourceRole.getChildByName("PoisonBuff"))
         {
            this.sourceRole.removeChild(this.sourceRole.getChildByName("PoisonBuff"));
         }
      }
      
      protected function showMagicFlagDebuff() : void
      {
         var _loc1_:* = null;
         if(!this.sourceRole.getChildByName("MagicFlagDebuff"))
         {
            _loc1_ = AUtils.getNewObj("MagicFlagDebuff");
            _loc1_.name = "MagicFlagDebuff";
            this.sourceRole.addChild(_loc1_);
         }
      }
      
      protected function hideMagicFlagDebuff() : void
      {
         if(this.sourceRole.getChildByName("MagicFlagDebuff"))
         {
            this.sourceRole.removeChild(this.sourceRole.getChildByName("MagicFlagDebuff"));
         }
      }
      
      protected function hideMagicFlowerAddbuff() : void
      {
         if(this.sourceRole.getChildByName("MagicFlowerAddbuff"))
         {
            this.sourceRole.removeChild(this.sourceRole.getChildByName("MagicFlowerAddbuff"));
         }
      }
      
      protected function showMagicFlowerAddbuff() : void
      {
         var _loc1_:* = null;
         if(!this.sourceRole.getChildByName("MagicFlowerAddbuff"))
         {
            _loc1_ = AUtils.getNewObj("MagicFlowerAddbuff");
            _loc1_.name = "MagicFlowerAddbuff";
            this.sourceRole.addChild(_loc1_);
         }
      }
      
      protected function hideMagicFlowerDebuff() : void
      {
         if(this.sourceRole.getChildByName("MagicFlowerDebuff"))
         {
            this.sourceRole.removeChild(this.sourceRole.getChildByName("MagicFlowerDebuff"));
         }
      }
      
      protected function showMagicFlowerDebuff() : void
      {
         var _loc1_:* = null;
         if(!this.sourceRole.getChildByName("MagicFlowerDebuff"))
         {
            _loc1_ = AUtils.getNewObj("MagicFlowerDebuff");
            _loc1_.name = "MagicFlowerDebuff";
            this.sourceRole.addChild(_loc1_);
         }
      }
      
      protected function showMonster115slow() : void
      {
      }
      
      protected function hideMonster115slow() : void
      {
      }
      
      protected function showMonster115Reducehp() : void
      {
         var _loc1_:int = 0;
         if(this.sourceRole is BaseHero)
         {
            _loc1_ = int((this.sourceRole as BaseHero).roleProperies.getHHP() / 2);
         }
         else if(this.sourceRole is BasePet)
         {
            _loc1_ = int((this.sourceRole as BasePet).petInfo.getHp() / 2);
         }
         this.sourceRole.reduceHp(_loc1_);
         var _loc2_:Object = this.getBuffByName(BaseAddEffect.MONSTER115REDUCEHP);
         if(_loc2_)
         {
            _loc2_.hpSource = _loc1_;
         }
      }
      
      protected function hideMonster115Reducehp(param1:int) : void
      {
         if(this.sourceRole is BaseHero)
         {
            (this.sourceRole as BaseHero).cureHp(param1);
         }
         else if(this.sourceRole is BasePet)
         {
            (this.sourceRole as BasePet).cureHp(param1);
         }
      }
      
      protected function showLemhxx() : void
      {
         var _loc1_:* = null;
         if(!this.sourceRole.getChildByName("Monster1007xx"))
         {
            _loc1_ = AUtils.getNewObj("Monster1007xx");
            _loc1_.name = "Monster1007xx";
            _loc1_.y = 70;
            this.sourceRole.addChild(_loc1_);
         }
      }
      
      protected function hideLemhxx() : void
      {
         if(this.sourceRole.getChildByName("Monster1007xx"))
         {
            this.sourceRole.removeChild(this.sourceRole.getChildByName("Monster1007xx"));
         }
      }
      
      protected function show_pethorse_ice() : void
      {
         var _loc1_:* = null;
         if(!this.sourceRole.getChildByName("PetHorseIceEffect"))
         {
            try
            {
               _loc1_ = AUtils.getNewObj("PetHorseIceEffect");
               _loc1_.width = this.sourceRole.colipse.width;
               _loc1_.height = this.sourceRole.colipse.height;
               _loc1_.name = "PetHorseIceEffect";
               this.sourceRole.addChild(_loc1_);
            }
            catch(e:Error)
            {
               return;
            }
         }
         this.sourceRole.getBBDC().stopFrame();
         if(this.sourceRole is BaseHero)
         {
            BaseHero(this.sourceRole).setStatic();
            if(BaseHero(this.sourceRole).getPlayer())
            {
               BaseHero(this.sourceRole).setLostKeyboard();
            }
         }
      }
      
      protected function hide_pethorse_ice() : void
      {
         if(this.sourceRole.getChildByName("PetHorseIceEffect"))
         {
            this.sourceRole.removeChild(this.sourceRole.getChildByName("PetHorseIceEffect"));
         }
         this.sourceRole.getBBDC().continueFrame();
         if(this.sourceRole is BaseHero)
         {
            if(BaseHero(this.sourceRole).getPlayer())
            {
               BaseHero(this.sourceRole).reSetLostKeyboard();
            }
         }
      }
      
      protected function show_sidatianwang_san_mp_lost() : void
      {
         if(this.sourceRole is BaseHero)
         {
            BaseHero(this.sourceRole).roleProperies.setMMP(Number(BaseHero(this.sourceRole).roleProperies.getMMP()) / 2);
         }
         else if(this.sourceRole is BasePet)
         {
            BasePet(this.sourceRole).petInfo.setMp(0);
         }
      }
      
      protected function hide_sidatianwang_san_mp_lost(param1:uint) : void
      {
         if(this.sourceRole is BaseHero)
         {
            BaseHero(this.sourceRole).roleProperies.setMMP(BaseHero(this.sourceRole).roleProperies.getMMP() + param1);
         }
         else if(this.sourceRole is BasePet)
         {
            BasePet(this.sourceRole).petInfo.setMp(param1);
         }
      }
      
      protected function bajie_dunpai_buff() : void
      {
         var _loc1_:* = null;
         if(this.sourceRole.getChildByName("Role3Bullet5Buff"))
         {
            return;
         }
         try
         {
            _loc1_ = AUtils.getNewObj("Role3Bullet5Buff");
            _loc1_.name = "Role3Bullet5Buff";
            _loc1_.x = -20;
            _loc1_.y = -80;
            this.sourceRole.addChild(_loc1_);
            return;
         }
         catch(e:*)
         {
            return;
         }
      }
      
      protected function slowlyAddHp() : void
      {
      }
      
      protected function hideSlowlyAddHp() : void
      {
      }
      
      protected function show_role5tlj(param1:Boolean = true) : void
      {
         var mc:MovieClip = null;
         if(this.sourceRole.getChildByName("Role5tlj"))
         {
            return;
         }
         try
         {
            if(Role5(this.sourceRole)._invert == false)
            {
               mc = AUtils.getNewObj("sword_tlj1");
            }
            else
            {
               mc = AUtils.getNewObj("sword_tlj2");
            }
            mc.name = "Role5tlj";
            mc.x = 9;
            mc.y = 20;
            this.sourceRole.addChild(mc);
            return;
         }
         catch(e:*)
         {
            return;
         }
      }
      
      public function hiderole5tlj() : void
      {
         if(this.sourceRole.getChildByName("Role5tlj"))
         {
            this.sourceRole.removeChild(this.sourceRole.getChildByName("Role5tlj"));
         }
      }
      
      protected function show_role5jrjl(param1:Boolean = true) : void
      {
         var mc:MovieClip = null;
         if(this.sourceRole.getChildByName("Role5jrjl"))
         {
            return;
         }
         try
         {
            mc = AUtils.getNewObj("jrjlbuff");
            mc.name = "Role5jrjl";
            mc.x = 10;
            mc.y = 20;
            this.sourceRole.addChild(mc);
            return;
         }
         catch(e:*)
         {
            return;
         }
      }
      
      protected function hiderole5jrjl() : void
      {
         if(this.sourceRole.getChildByName("Role5jrjl"))
         {
            this.sourceRole.removeChild(this.sourceRole.getChildByName("Role5jrjl"));
         }
      }
      
      protected function show_role5skill4() : void
      {
         var mc:* = null;
         if(this.sourceRole.getChildByName("yyb"))
         {
            return;
         }
         try
         {
            mc = AUtils.getNewObj("Role5Skill4Effect");
            mc.name = "yyb";
            mc.x = 0;
            mc.y = 50;
            this.sourceRole.addChild(mc);
            return;
         }
         catch(e:*)
         {
            return;
         }
      }
      
      protected function hiderole5skill4() : void
      {
         if(this.sourceRole.getChildByName("yyb"))
         {
            this.sourceRole.removeChild(this.sourceRole.getChildByName("yyb"));
         }
      }
      
      protected function fix() : void
      {
         BaseObject(this.sourceRole).getBBDC().stopFrame();
         if(this.sourceRole is BaseHero)
         {
            if(BaseHero(this.sourceRole).getPlayer())
            {
               BaseHero(this.sourceRole).setLostKeyboard();
            }
         }
      }
      
      protected function showNet() : void
      {
         var _loc1_:MovieClip = new MovieClip();
         _loc1_.name = "net";
         this.sourceRole.addChild(_loc1_);
      }
      
      protected function showStun() : void
      {
         var _loc1_:* = null;
         if(!this.sourceRole.getChildByName("stun"))
         {
            try
            {
               _loc1_ = AUtils.getNewObj("Stun");
               _loc1_.name = "stun";
               if(this.sourceRole.getBBDC().getDirect() == 0)
               {
                  _loc1_.x = 35 - 46;
               }
               else
               {
                  _loc1_.x = -35 + 46;
               }
               _loc1_.y = -30;
               this.sourceRole.addChild(_loc1_);
            }
            catch(e:*)
            {
            }
         }
         if(this.sourceRole)
         {
            if(this.sourceRole is BaseHero)
            {
               if(BaseHero(this.sourceRole).getPlayer())
               {
                  BaseHero(this.sourceRole).setLostKeyboard();
               }
            }
            this.sourceRole.getBBDC().stopFrame();
         }
      }
      
      protected function show_shenmishangren() : void
      {
         var _loc1_:* = null;
         if(this.sourceRole.getChildByName("ShenMiBuff"))
         {
            return;
         }
         try
         {
            _loc1_ = AUtils.getNewObj("ShenMiBuff");
            _loc1_.name = "ShenMiBuff";
            this.sourceRole.addChild(_loc1_);
            return;
         }
         catch(e:*)
         {
            return;
         }
      }
      
      protected function hide_shenmishangren() : void
      {
         if(this.sourceRole.getChildByName("ShenMiBuff"))
         {
            this.sourceRole.removeChild(this.sourceRole.getChildByName("ShenMiBuff"));
         }
      }
      
      protected function show_pet_tiger_sxhz(param1:uint, param2:uint) : void
      {
         var point:Point = null;
         var time:uint = param1;
         var direct:uint = param2;
         this.sourceRole.setStatic();
         this.sourceRole.getBBDC().stopFrame();
         if(this.sourceRole is BaseHero)
         {
            BaseHero(this.sourceRole).setStatic();
            if(BaseHero(this.sourceRole).getPlayer())
            {
               BaseHero(this.sourceRole).setLostKeyboard();
            }
         }
         this.sourceRole.setLostGraity();
         point = new Point();
         if(direct == 0)
         {
            point.x = this.sourceRole.x - 100;
         }
         else
         {
            point.x = this.sourceRole.x + 100;
         }
         point.y = this.sourceRole.y - 10;
         TweenMax.to(this.sourceRole,0.5,{
            "x":point.x,
            "y":point.y,
            "onComplete":function(param1:BaseObject):*
            {
               var bo:* = param1;
               if(!bo.isDead())
               {
                  TweenMax.delayedCall(2,function(param1:BaseObject):*
                  {
                     if(!param1.isDead())
                     {
                        if(param1 is BaseHero)
                        {
                           BaseHero(param1).setStatic();
                           if(BaseHero(param1).getPlayer())
                           {
                              BaseHero(param1).setLostKeyboard();
                           }
                        }
                        param1.resetGraity();
                        param1.getBBDC().continueFrame();
                     }
                     else
                     {
                        param1.setAction("dead");
                        param1.setYourFather(20);
                        param1.resetGraity();
                        param1.getBBDC().continueFrame();
                     }
                  },[bo]);
               }
               else
               {
                  bo.setAction("dead");
                  bo.setYourFather(20);
                  bo.resetGraity();
                  bo.getBBDC().continueFrame();
               }
            },
            "onCompleteParams":[this.sourceRole]
         });
      }
      
      protected function hide_pet_tiger_sxhz() : void
      {
      }
      
      protected function show_monster42_green() : void
      {
         var mc:* = null;
         if(this.sourceRole.getChildByName("Monster42BulletBuffGreen"))
         {
            return;
         }
         try
         {
            mc = AUtils.getNewObj("Monster42BulletBuffGreen");
            mc.name = "Monster42BulletBuffGreen";
            this.sourceRole.addChild(mc);
            return;
         }
         catch(e:*)
         {
            return;
         }
      }
      
      protected function hide_monster42_green() : void
      {
         if(this.sourceRole.getChildByName("Monster42BulletBuffGreen"))
         {
            this.sourceRole.removeChild(this.sourceRole.getChildByName("Monster42BulletBuffGreen"));
         }
      }
      
      protected function show_monster42_blue() : void
      {
         var mc:* = null;
         if(this.sourceRole.getChildByName("Monster42BulletBuffBlue"))
         {
            return;
         }
         try
         {
            mc = AUtils.getNewObj("Monster42BulletBuffBlue");
            mc.name = "Monster42BulletBuffBlue";
            this.sourceRole.addChild(mc);
            return;
         }
         catch(e:*)
         {
            return;
         }
      }
      
      protected function hide_monster42_blue() : void
      {
         if(this.sourceRole.getChildByName("Monster42BulletBuffBlue"))
         {
            this.sourceRole.removeChild(this.sourceRole.getChildByName("Monster42BulletBuffBlue"));
         }
      }
      
      protected function show_monster42_reduce_hp() : void
      {
         if(this.sourceRole is BaseHero)
         {
            BaseHero(this.sourceRole).reduceHp(Number(BaseHero(this.sourceRole).roleProperies.getHHP()) / 6,false);
         }
      }
      
      protected function hide_monster42_reduce_hp() : void
      {
      }
      
      protected function showEyeFix() : void
      {
         var _loc1_:* = null;
         if(!this.sourceRole.getChildByName("eyefixBuff"))
         {
            try
            {
               _loc1_ = AUtils.getNewObj("eyefixBuff");
               _loc1_.name = "eyefixBuff";
               _loc1_.x = 0;
               _loc1_.y = -20;
               this.sourceRole.addChild(_loc1_);
            }
            catch(e:*)
            {
            }
         }
         if(this.sourceRole is BaseHero)
         {
            if(BaseHero(this.sourceRole).getPlayer())
            {
               BaseHero(this.sourceRole).setLostKeyboard();
            }
         }
         this.sourceRole.setStatic();
      }
      
      protected function hideBajieDunpaiBuff() : void
      {
         if(this.sourceRole.getChildByName("Role3Bullet5Buff"))
         {
            this.bjsdcs = 0;
            this.sourceRole.removeChild(this.sourceRole.getChildByName("Role3Bullet5Buff"));
         }
      }
      
      protected function hideFix() : void
      {
         BaseObject(this.sourceRole).getBBDC().continueFrame();
         if(this.sourceRole is BaseHero)
         {
            if(BaseHero(this.sourceRole).getPlayer())
            {
               BaseHero(this.sourceRole).reSetLostKeyboard();
            }
         }
      }
      
      protected function hideNet() : void
      {
         if(this.sourceRole.getChildByName("net"))
         {
            this.sourceRole.removeChild(this.sourceRole.getChildByName("net"));
         }
      }
      
      protected function hideMagicLost() : void
      {
         if(this.sourceRole.getChildByName("magiclost"))
         {
            this.sourceRole.removeChild(this.sourceRole.getChildByName("magiclost"));
         }
      }
      
      protected function hideSpeedUp() : void
      {
         if(this.sourceRole.getChildByName("speedup"))
         {
            this.sourceRole.removeChild(this.sourceRole.getChildByName("speedup"));
         }
      }
      
      protected function hideDeadLink() : void
      {
         if(this.sourceRole.getChildByName("deadlink"))
         {
            this.sourceRole.removeChild(this.sourceRole.getChildByName("deadlink"));
         }
      }
      
      protected function hideStun() : void
      {
         if(this.sourceRole.getChildByName("stun"))
         {
            this.sourceRole.removeChild(this.sourceRole.getChildByName("stun"));
         }
         if(this.sourceRole)
         {
            if(this.sourceRole is BaseHero)
            {
               if(BaseHero(this.sourceRole).getPlayer())
               {
                  BaseHero(this.sourceRole).reSetLostKeyboard();
               }
            }
            this.sourceRole.getBBDC().continueFrame();
         }
      }
      
      protected function hideIce() : void
      {
         if(this.sourceRole.getChildByName("PetHorseIceEffect"))
         {
            this.sourceRole.removeChild(this.sourceRole.getChildByName("PetHorseIceEffect"));
         }
         if(this.sourceRole is BaseHero)
         {
            if(BaseHero(this.sourceRole).getPlayer())
            {
               if(this.gc.keyboardControl)
               {
                  this.gc.keyboardControl.setYesControlByPlayer(BaseHero(this.sourceRole).getPlayer());
               }
            }
         }
         this.sourceRole.getBBDC().continueFrame();
      }
      
      protected function hideEyeFix() : void
      {
         if(this.sourceRole.getChildByName("eyefixBuff"))
         {
            this.sourceRole.removeChild(this.sourceRole.getChildByName("eyefixBuff"));
         }
         if(this.sourceRole is BaseHero)
         {
            if(BaseHero(this.sourceRole).getPlayer())
            {
               if(this.gc.keyboardControl)
               {
                  this.gc.keyboardControl.setYesControlByPlayer(BaseHero(this.sourceRole).getPlayer());
               }
            }
         }
      }
      
      protected function showPoisonTimes() : void
      {
         var _loc1_:* = null;
         if(!this.sourceRole.getChildByName("PoisonBuff"))
         {
            _loc1_ = AUtils.getNewObj("PoisonBuff");
            _loc1_.name = "PoisonBuff";
            this.sourceRole.addChild(_loc1_);
         }
      }
      
      protected function hidePoisonTimes() : void
      {
         if(this.sourceRole)
         {
            if(this.sourceRole.getChildByName("PoisonBuff"))
            {
               this.sourceRole.removeChild(this.sourceRole.getChildByName("PoisonBuff"));
            }
         }
      }
      
      protected function showPoison() : void
      {
      }
      
      protected function hidePoison() : void
      {
      }
      
      protected function show_jiuhuanshengjing() : void
      {
         var _loc1_:* = null;
         if(this.sourceRole.getChildByName("JIUHUANSHENGJING"))
         {
            return;
         }
         try
         {
            _loc1_ = AUtils.getNewObj("JIUHUANSHENGJING");
            _loc1_.name = "JIUHUANSHENGJING";
            _loc1_.x = -35;
            _loc1_.y = -30;
            this.sourceRole.addChild(_loc1_);
            return;
         }
         catch(e:*)
         {
            return;
         }
      }
      
      protected function hide_jiuhuanshengjing() : void
      {
         if(this.sourceRole.getChildByName("JIUHUANSHENGJING"))
         {
            this.sourceRole.removeChild(this.sourceRole.getChildByName("JIUHUANSHENGJING"));
         }
      }
      
      public function cancelAllEffect() : void
      {
         var _loc1_:int = 0;
         var _loc2_:* = null;
         while(_loc1_ < this.curEffectArray.length)
         {
            _loc2_ = this.curEffectArray[_loc1_];
            if(Boolean(_loc2_) && _loc2_.name != "father")
            {
               this.remove(_loc2_);
            }
            _loc1_++;
         }
      }
      
      public function getBuffByName(param1:String) : Object
      {
         var _loc2_:int = 0;
         var _loc3_:* = null;
         while(_loc2_ < this.curEffectArray.length)
         {
            _loc3_ = this.curEffectArray[_loc2_];
            if(Boolean(_loc3_) && _loc3_.name == param1)
            {
               return _loc3_;
            }
            _loc2_++;
         }
         return null;
      }
      
      public function getBuffTimeLeftByName(param1:String) : int
      {
         var _loc2_:int = 0;
         var _loc3_:* = null;
         while(_loc2_ < this.curEffectArray.length)
         {
            _loc3_ = this.curEffectArray[_loc2_];
            if(Boolean(_loc3_) && _loc3_.name == param1)
            {
               return _loc3_.time - (this.count - Number(_loc3_.startTime));
            }
            _loc2_++;
         }
         return 0;
      }
      
      public function curDebuff(param1:String) : Boolean
      {
         var _loc2_:int = 0;
         var _loc3_:* = null;
         while(_loc2_ < this.curEffectArray.length)
         {
            _loc3_ = this.curEffectArray[_loc2_];
            if(Boolean(_loc3_) && _loc3_.name == param1)
            {
               return true;
            }
            _loc2_++;
         }
         return false;
      }
      
      public function getAllBuffArray() : Array
      {
         return this.curEffectArray;
      }
   }
}

