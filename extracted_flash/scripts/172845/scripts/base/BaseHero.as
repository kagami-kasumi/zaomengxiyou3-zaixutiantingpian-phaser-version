package base
{
   import com.greensock.*;
   import com.hexagonstar.util.debug.*;
   import event.*;
   import export.*;
   import export.bullet.*;
   import export.hero.*;
   import export.honor.*;
   import export.magicWeapon.*;
   import export.monster.*;
   import export.pet.*;
   import flash.display.*;
   import flash.events.KeyboardEvent;
   import flash.filters.*;
   import flash.geom.*;
   import flash.utils.*;
   import manager.*;
   import my.*;
   import petInfo.*;
   import user.*;
   
   public class BaseHero extends BaseObject
   {
      
      protected var allianceBitmap:Bitmap;
      
      private var _tween:TweenMax;
      
      private var roleId:uint;
      
      public var csmc:MovieClip;
      
      protected var protectedEquipObject:Object;
      
      public var dxmc:MovieClip;
      
      public var hlmc:MovieClip;
      
      public var isRole:MovieClip;
      
      public var levelexp:Array;
      
      public var levelupmc:MovieClip;
      
      public var roleName:String = "";
      
      public var roleProperies:BaseRoleProperies;
      
      public var userType:String = "";
      
      protected var cannextaction:Boolean = true;
      
      protected var canturn:Boolean = false;
      
      protected var curUpTime:int;
      
      protected var curtime:int = 0;
      
      public var doubleCount:uint;
      
      protected var exceedPowerSprite:ExceedPower;
      
      protected var hitNum:uint = 1;
      
      protected var keyId:int;
      
      protected var keyList:Array;
      
      protected var keyarray:Array;
      
      protected var lastDirbtn:uint;
      
      protected var lastKey:Object;
      
      protected var lastUpTime:int;
      
      protected var lasttime:int = 0;
      
      protected var player:User;
      
      protected var timers:int = 0;
      
      protected var myPet:BasePet;
      
      private var curbeattacktime:int;
      
      private var lastbeattacktime:int = 0;
      
      protected var equipCounter:uint = 0;
      
      private var lastHurtTime:int = 0;
      
      private var aaaa:Ling;
      
      private var bbbb:MagicFlower;
      
      protected var canBati:Boolean = false;
      
      protected var hmzCharge:int = 0;
      
      public function BaseHero()
      {
         this.protectedEquipObject = {
            "curClothId1":0,
            "curClothId2":0,
            "curWeaponId1":0,
            "curWeaponId2":0
         };
         this.levelexp = [135,145,155,165,175,185,625,675,725,775,825,875,1950,2050,2150,2250,2350,2450,5000];
         this.keyList = [];
         this.lastKey = new Object();
         super();
         this.colipse.scaleX = 1.2;
         this.roleProperies = new BaseRoleProperies(this);
         this.attackBackInfoDict["hitNiumowangSzBuff"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[-5,0],
            "attackInterval":24,
            "attackKind":"magic",
            "addprotection":0
         };
         this.attackBackInfoDict["hitZhuanlunwangSzBuff"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[0,0],
            "attackInterval":999,
            "attackKind":"magic",
            "addEffect":[{
               "name":BaseAddEffect.STUN,
               "time":gc.frameClips * 5
            }],
            "addprotection":0
         };
         this.attackBackInfoDict["hitTiantingZhanshenSzBuff"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[0,0],
            "attackInterval":999,
            "attackKind":"magic",
            "addEffect":[{
               "name":BaseAddEffect.TIANTINGZHANSHEN,
               "time":gc.frameClips * 2,
               "def":0.1,
               "mdef":0.1
            }],
            "addprotection":0
         };
         this.attackBackInfoDict["fabao-sword"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[0,0],
            "attackInterval":999,
            "attackKind":"magic",
            "addprotection":0
         };
         this.attackBackInfoDict["magicsword2"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[0,0],
            "attackInterval":2,
            "attackKind":"magic",
            "addprotection":0
         };
         this.attackBackInfoDict["Pearl"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[-1,-3],
            "attackInterval":999,
            "attackKind":"magic",
            "addprotection":0
         };
         this.attackBackInfoDict["fabao-pearl"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[2,-2],
            "attackInterval":2,
            "attackKind":"magic",
            "addprotection":0
         };
         this.attackBackInfoDict["fabao-snow"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[2,-2],
            "attackInterval":999,
            "attackKind":"magic",
            "addprotection":0,
            "addEffect":[{
               "name":BaseAddEffect.PETHORSE_ICE,
               "time":gc.frameClips * 3
            }]
         };
         this.attackBackInfoDict["fabao-zltc"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[2,-2],
            "attackInterval":6,
            "attackKind":"magic",
            "addprotection":0,
            "addEffect":[{
               "name":BaseAddEffect.STUN,
               "time":gc.frameClips * 4.5
            }]
         };
         this.attackBackInfoDict["fabao-qpj"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[0,0],
            "attackInterval":33,
            "attackKind":"magic",
            "addprotection":1000 / 45
         };
         this.attackBackInfoDict["fabao-qpj1"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[0,0],
            "attackInterval":33,
            "attackKind":"magic",
            "addprotection":1000 / 45 * 0.325
         };
         this.attackBackInfoDict["qpjThunder"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[0,0],
            "attackInterval":999,
            "attackKind":"magic",
            "addprotection":0
         };
      }
      
      public function start() : void
      {
         if(this.getPlayer())
         {
            this.changeEquip(this.getPlayer().getEquipNum());
         }
         if(this.gc.curStage != 16)
         {
            this.initPet();
         }
         if(this.gc.curStage != 16)
         {
            this.initMagicWeapon();
         }
         if(this.player)
         {
            this.initPopertits();
         }
         this.curAddEffect = new BaseAddEffect(BaseObject(this));
         this.registerProtectedProperty();
         this.keyarray = gc.keyboardControl.getZeroKeyArray();
         this.setAction("wait");
      }
      
      public function __keyBoardDown(param1:KeyboardEvent) : void
      {
         if(this.isDead())
         {
            return;
         }
         if(!gc.keyboardControl.isInThisPlayerKeyboard(this.player,param1.keyCode))
         {
            return;
         }
         if(this.lastKey.keyCode == undefined)
         {
            this.lastKey.keyCode = param1.keyCode;
         }
         if(this.lastKey.keyId == undefined)
         {
            this.lastKey.keyId = this.keyId;
         }
         if(param1.keyCode != this.lastKey.keyCode)
         {
            ++this.keyId;
         }
         switch(param1.keyCode)
         {
            case gc.keyboardControl.getLeftByPlayer(this.player):
               moveLeft();
               this.addDoubleCount(param1.keyCode);
               this.lastDirbtn = uint(uint(param1.keyCode));
               break;
            case gc.keyboardControl.getRightByPlayer(this.player):
               moveRight();
               this.addDoubleCount(param1.keyCode);
               this.lastDirbtn = uint(uint(param1.keyCode));
         }
         this.checkDoubleCount(param1.keyCode);
         this.lastKey.keyCode = param1.keyCode;
         this.lastKey.keyId = this.keyId;
         var _loc2_:uint = uint(this.keyList.length);
         while(_loc2_-- > 0)
         {
            if(this.keyList[_loc2_] == param1.keyCode)
            {
               this.keyarray[_loc2_] = 1;
            }
         }
         if(!this.isBeAttacking() && !this.isAttacking() && !this.isStatic())
         {
            if(this.isRunning())
            {
               if(!this.isJump())
               {
                  this.setAction("run");
               }
               if(Number(getTimer()) - lastRunSendInterval > 100)
               {
                  gc.sendWalkInfo(this);
               }
               lastRunSendInterval = int(int(getTimer()));
            }
            else
            {
               if(!this.isJump())
               {
                  this.setAction("walk");
               }
               if(Number(getTimer()) - lastWalkSendInterval > 500)
               {
                  gc.sendWalkInfo(this);
               }
               lastWalkSendInterval = int(int(getTimer()));
            }
         }
      }
      
      public function initPopertits() : void
      {
         if(this.roleProperies)
         {
            this.roleProperies.setInitValue();
            if(!gc.isHideDebug)
            {
               this.roleProperies.dispatchEvent(new CommonEvent("SetLevel",[999999]));
            }
            else
            {
               this.roleProperies.dispatchEvent(new CommonEvent("SetLevel",[this.player.getCurLevel()]));
            }
            this.roleProperies.setinitExper(this.player.getCurExp());
            this.upGrade();
         }
      }
      
      public function resetKey() : void
      {
         this.keyarray = gc.keyboardControl.getZeroKeyArray();
         this.lastDirbtn = 0;
         this.lastKey = {};
      }
      
      public function cureHp(param1:int) : void
      {
         var _loc2_:* = null;
         if(!this.isDead())
         {
            if(gc.sid == this.sid && gc.isInRoom())
            {
               _loc2_ = gc.getMutiUserBySidAndRoleId(this.sid,this.getRoleId()) as MutiUser;
               if(_loc2_)
               {
                  _loc2_.hp += param1;
                  gc.sendSelfMutiUserInfo(this.getRoleId());
               }
            }
            if(this.curAddEffect)
            {
               if(this.curAddEffect.getBuffByName(BaseAddEffect.PETTURTKE_BUFF))
               {
                  if(Boolean(this.getPet()) && Boolean(this.getPet().curAddEffect) && Boolean(this.getPet().curAddEffect.getBuffByName(BaseAddEffect.PETTURTKE_BUFF)))
                  {
                     this.getPet().cureHp(param1 * 1.05);
                     param1 *= 1.05;
                     param1 = Math.ceil(param1);
                  }
               }
            }
            if(this.roleProperies)
            {
               this.roleProperies.dispatchEvent(new CommonEvent("SetHHp",[this.roleProperies.getHHP() + param1]));
            }
            this.addCureMc(param1);
         }
      }
      
      public function cureMp(param1:int) : void
      {
         if(this.roleProperies)
         {
            this.roleProperies.dispatchEvent(new CommonEvent("SetMMp",[this.roleProperies.getMMP() + param1]));
         }
         this.addCureMpMc(param1);
      }
      
      public function reduceMp(param1:int) : void
      {
         if(this.roleProperies)
         {
            this.roleProperies.dispatchEvent(new CommonEvent("SetMMp",[this.roleProperies.getMMP() - param1]));
         }
         this.addHeroMpReduceMc(param1);
      }
      
      protected function initPet() : void
      {
         var _loc1_:PetInfo = null;
         var _loc2_:* = null;
         if(this.getPlayer())
         {
            _loc1_ = this.getPlayer().findCurrentPet();
         }
         else
         {
            _loc2_ = gc.getMutiUserBySidAndRoleId(this.sid,this.getRoleId());
            if(_loc2_)
            {
               if(_loc2_.petName != "")
               {
                  _loc1_ = new PetInfo();
                  _loc1_.setPetNameAndLevel(_loc2_.petName,_loc2_.petLevel);
                  _loc1_.setHp(_loc2_.petHp);
                  _loc1_.setSHp(_loc2_.petHp);
                  _loc1_.setMp(_loc2_.petMp);
                  _loc1_.setSMp(_loc2_.petMp);
               }
            }
         }
         if(_loc1_)
         {
            _loc1_.setDoWhenLevelUp(this.doWhenLevelUp);
            _loc1_.setDoWhenChangeState(this.doWhenChangeState);
            this.myPet = this.addPetByPi(_loc1_);
            this.myPet.x = this.x;
            this.myPet.y = this.y - 100;
            gc.gameSence.addChild(this.myPet);
         }
      }
      
      public function doWhenLevelUp() : *
      {
         var _loc1_:* = null;
         if(this.getPet())
         {
            _loc1_ = AUtils.getNewObj("PetLevelUpMc") as MovieClip;
            this.getPet().addChild(_loc1_);
         }
      }
      
      public function doWhenChangeState() : *
      {
         if(this.getPet())
         {
            this.changePet();
         }
      }
      
      public function addPetByPi(param1:PetInfo) : BasePet
      {
         var _loc2_:* = null;
         var _loc3_:String = param1.getPetName();
         if(_loc3_ == "monkey1")
         {
            _loc2_ = new PetMonkey1(this,param1);
         }
         else if(_loc3_ == "monkey2")
         {
            _loc2_ = new PetMonkey2(this,param1);
         }
         else if(_loc3_ == "monkey3")
         {
            _loc2_ = new PetMonkey3(this,param1);
         }
         else if(_loc3_ == "monkey4")
         {
            _loc2_ = new PetMonkey4(this,param1);
         }
         else if(_loc3_ == "horse1")
         {
            _loc2_ = new PetHorse1(this,param1);
         }
         else if(_loc3_ == "horse2")
         {
            _loc2_ = new PetHorse2(this,param1);
         }
         else if(_loc3_ == "horse3")
         {
            _loc2_ = new PetHorse3(this,param1);
         }
         else if(_loc3_ == "horse4")
         {
            _loc2_ = new PetHorse4(this,param1);
         }
         else if(_loc3_ == "ufo1")
         {
            _loc2_ = new PetKabu1(this,param1);
         }
         else if(_loc3_ == "ufo2")
         {
            _loc2_ = new PetKabu2(this,param1);
         }
         else if(_loc3_ == "ufo3")
         {
            _loc2_ = new PetKabu3(this,param1);
         }
         else if(_loc3_ == "tigress1")
         {
            _loc2_ = new PetTiger1(this,param1);
         }
         else if(_loc3_ == "tigress2")
         {
            _loc2_ = new PetTiger2(this,param1);
         }
         else if(_loc3_ == "tigress3")
         {
            _loc2_ = new PetTiger3(this,param1);
         }
         else if(_loc3_ == "tigress4")
         {
            _loc2_ = new PetTiger4(this,param1);
         }
         else if(_loc3_ == "turtle1")
         {
            _loc2_ = new PetTurtle1(this,param1);
         }
         else if(_loc3_ == "turtle2")
         {
            _loc2_ = new PetTurtle2(this,param1);
         }
         else if(_loc3_ == "turtle3")
         {
            _loc2_ = new PetTurtle3(this,param1);
         }
         else if(_loc3_ == "turtle4")
         {
            _loc2_ = new PetTurtle4(this,param1);
         }
         else if(_loc3_ == "phoenix1")
         {
            _loc2_ = new PetPhoenix1(this,param1);
         }
         else if(_loc3_ == "phoenix2")
         {
            _loc2_ = new PetPhoenix2(this,param1);
         }
         else if(_loc3_ == "phoenix3")
         {
            _loc2_ = new PetPhoenix3(this,param1);
         }
         else if(_loc3_ == "phoenix4")
         {
            _loc2_ = new PetPhoenix4(this,param1);
         }
         else if(_loc3_ == "dragon1")
         {
            _loc2_ = new PetDragon1(this,param1);
         }
         else if(_loc3_ == "dragon2")
         {
            _loc2_ = new PetDragon2(this,param1);
         }
         else if(_loc3_ == "dragon3")
         {
            _loc2_ = new PetDragon3(this,param1);
         }
         else if(_loc3_ == "dragon4")
         {
            _loc2_ = new PetDragon4(this,param1);
         }
         else if(_loc3_ == "rabbit1")
         {
            _loc2_ = new PetRabbit1(this,param1);
         }
         else if(_loc3_ == "rabbit2")
         {
            _loc2_ = new PetRabbit2(this,param1);
         }
         else if(_loc3_ == "rabbit3")
         {
            _loc2_ = new PetRabbit3(this,param1);
         }
         else if(_loc3_ == "rabbit4")
         {
            _loc2_ = new PetRabbit4(this,param1);
         }
         else if(_loc3_ == "roomhorse1")
         {
            _loc2_ = new PetRoomHorse1(this,param1);
         }
         else if(_loc3_ == "roomhorse2")
         {
            _loc2_ = new PetRoomHorse2(this,param1);
         }
         else if(_loc3_ == "roomhorse3")
         {
            _loc2_ = new PetRoomHorse3(this,param1);
         }
         else if(_loc3_ == "roomhorse4")
         {
            _loc2_ = new PetRoomHorse4(this,param1);
         }
         else if(_loc3_ == "mouse1")
         {
            _loc2_ = new PetMouse1(this,param1);
         }
         else if(_loc3_ == "mouse2")
         {
            _loc2_ = new PetMouse2(this,param1);
         }
         else if(_loc3_ == "mouse3")
         {
            _loc2_ = new PetMouse3(this,param1);
         }
         else if(_loc3_ == "mouse4")
         {
            _loc2_ = new PetMouse4(this,param1);
         }
         else if(_loc3_ == "neat1")
         {
            _loc2_ = new PetNeat1(this,param1);
         }
         else if(_loc3_ == "neat2")
         {
            _loc2_ = new PetNeat1(this,param1);
         }
         else if(_loc3_ == "neat3")
         {
            _loc2_ = new PetNeat1(this,param1);
         }
         else if(_loc3_ == "neat4")
         {
            _loc2_ = new PetNeat4(this,param1);
         }
         else if(_loc3_ == "nian1")
         {
            _loc2_ = new PetNian1(this,param1);
         }
         else if(_loc3_ == "nian2")
         {
            _loc2_ = new PetNian2(this,param1);
         }
         else if(_loc3_ == "nian3")
         {
            _loc2_ = new PetNian3(this,param1);
         }
         else if(_loc3_ == "nian4")
         {
            _loc2_ = new PetNian4(this,param1);
         }
         else if(_loc3_ == "nian5")
         {
            _loc2_ = new PetNian5(this,param1);
         }
         else if(_loc3_ == "terribletiger1")
         {
            _loc2_ = new PetYingTiger1(this,param1);
         }
         else if(_loc3_ == "terribletiger2")
         {
            _loc2_ = new PetYingTiger1(this,param1);
         }
         else if(_loc3_ == "terribletiger3")
         {
            _loc2_ = new PetYingTiger1(this,param1);
         }
         else if(_loc3_ == "terribletiger4")
         {
            _loc2_ = new PetYingTiger4(this,param1);
         }
         return _loc2_;
      }
      
      protected function initMagicWeapon() : void
      {
         var _loc1_:* = null;
         var _loc2_:* = null;
         if(this.getPlayer())
         {
            _loc1_ = this.getPlayer().getCurEquipByType("zbfb");
            if(_loc1_)
            {
               if(_loc1_.getFillName() == "xhhl")
               {
                  this.curMagicWeapon = new MagicBottle(this);
               }
               else if(_loc1_.getFillName() == "kyl")
               {
                  this.curMagicWeapon = new MagicLeaf(this);
               }
               else if(_loc1_.getFillName() == "qyj")
               {
                  this.curMagicWeapon = new MagicSword(this);
               }
               else if(_loc1_.getFillName() == "hyzzs")
               {
                  this.curMagicWeapon = new MagicUmbrella(this);
               }
               else if(_loc1_.getFillName() == "zjld")
               {
                  this.curMagicWeapon = new MagicRing(this);
               }
               else if(_loc1_.getFillName() == "xhmt")
               {
                  this.curMagicWeapon = new MagicPearl(this);
               }
               else if(_loc1_.getFillName() == "syl")
               {
                  this.curMagicWeapon = new MagicLeaf2(this);
               }
               else if(_loc1_.getFillName() == "lxj")
               {
                  this.curMagicWeapon = new MagicSword2(this);
               }
               else if(_loc1_.getFillName() == "hywjs")
               {
                  this.curMagicWeapon = new MagicUmbrella2(this);
               }
               else if(_loc1_.getFillName() == "zsTimer")
               {
                  this.curMagicWeapon = new MagicTimer(this);
               }
               else if(_loc1_.getFillName() == "mdhf")
               {
                  this.curMagicWeapon = new MagicFlag(this);
               }
               else if(_loc1_.getFillName() == "jyhl")
               {
                  this.curMagicWeapon = new MagicFlower(this);
               }
               else if(_loc1_.getFillName() == "qljfb")
               {
                  this.curMagicWeapon = new MagicBigBottle(this);
               }
               else if(_loc1_.getFillName() == "tjbg")
               {
                  this.curMagicWeapon = new MagicBagua(this);
               }
               else if(_loc1_.getFillName() == "zltc")
               {
                  this.curMagicWeapon = new MagicZLHummer(this);
               }
               else if(_loc1_.getFillName() == "fbqpj")
               {
                  this.curMagicWeapon = new MagicQPJ(this);
               }
               else if(_loc1_.getFillName() == "lxfb")
               {
                  this.curMagicWeapon = new MagicLXFB(this);
               }
               else if(_loc1_.getFillName() == "sxfb")
               {
                  this.curMagicWeapon = new MagicSXFB(this);
               }
               else if(_loc1_.getFillName() == "yxfb")
               {
                  this.curMagicWeapon = new MagicYXFB(this);
               }
               else if(_loc1_.getFillName() == "stlp")
               {
                  this.curMagicWeapon = new Ling(this);
               }
               else if(_loc1_.getFillName() == "hxyb")
               {
                  this.curMagicWeapon = new MagicYuban(this);
               }
               if(this.curMagicWeapon)
               {
                  gc.gameSence.addChild(this.curMagicWeapon);
               }
            }
         }
         else
         {
            _loc2_ = gc.getMutiUserBySidAndRoleId(this.sid,this.getRoleId());
            if(_loc2_)
            {
               if(_loc2_.bmwId == BaseMagicWeapon.BMW_Bottle)
               {
                  this.curMagicWeapon = new MagicBottle(this);
               }
               else if(_loc2_.bmwId == BaseMagicWeapon.BMW_Leaf)
               {
                  this.curMagicWeapon = new MagicLeaf(this);
               }
               else if(_loc2_.bmwId == BaseMagicWeapon.BMW_Ring)
               {
                  this.curMagicWeapon = new MagicRing(this);
               }
               else if(_loc2_.bmwId == BaseMagicWeapon.BMW_Sword)
               {
                  this.curMagicWeapon = new MagicSword(this);
               }
               else if(_loc2_.bmwId == BaseMagicWeapon.BMW_Umbrella)
               {
                  this.curMagicWeapon = new MagicUmbrella(this);
               }
               if(this.curMagicWeapon)
               {
                  gc.gameSence.addChild(this.curMagicWeapon);
               }
            }
         }
      }
      
      override public function reduceHp(param1:int, param2:Boolean = false) : void
      {
         var _loc3_:* = null;
         var _loc4_:* = null;
         var _loc5_:* = 0;
         var _loc6_:* = null;
         var _loc7_:* = null;
         if(this.curAddEffect)
         {
            if(this.curAddEffect.curDebuff(BaseAddEffect.MAGIC_UMBRELLA_DEFEND) || this.curAddEffect.curDebuff(BaseAddEffect.MAGIC_UMBRELLA_DEFEND2))
            {
               this.curAddEffect.reduceMagicUmbDef(param1);
               return;
            }
            if(this.curAddEffect.curDebuff(BaseAddEffect.tjgl_Shield))
            {
               this.curAddEffect.reducetjglShieldDef(param1);
               return;
            }
            if(this.curAddEffect.getBuffByName(BaseAddEffect.PETTURTKE_BUFF))
            {
               if(Boolean(this.getPet()) && Boolean(this.getPet().curAddEffect) && Boolean(this.getPet().curAddEffect.getBuffByName(BaseAddEffect.PETTURTKE_BUFF)))
               {
                  this.getPet().reduceHp(Math.ceil(param1 * 0.05),param2);
                  param1 *= 0.95;
                  param1 = Math.ceil(param1);
               }
            }
         }
         if(gc.sid == this.sid && gc.isInRoom())
         {
            _loc3_ = gc.getMutiUserBySidAndRoleId(this.sid,this.getRoleId()) as MutiUser;
            if(_loc3_)
            {
               _loc3_.hp -= param1;
               gc.sendSelfMutiUserInfo(this.getRoleId());
            }
         }
         _loc7_ = this.roleProperies.getHHP();
         this.roleProperies.dispatchEvent(new CommonEvent("SetHHp",[_loc7_ - param1]));
         if(gc.sid == this.sid || gc.isSingleGame())
         {
            this.addHeroHurtMc(param1);
            _loc4_ = this.getPlayer().getCurEquipByType("zbfj");
            if(_loc4_)
            {
               if(_loc4_.getFillName().indexOf("cs_fj") != -1)
               {
                  if(Math.random() <= 0.031)
                  {
                     this.cureMp(param1 / 3);
                     this.setYourFather(gc.frameClips * 0.5);
                  }
               }
            }
         }
         if(this.roleProperies.getHHP() > 0)
         {
            if(param2)
            {
               if(param1 != 0)
               {
                  this.setAction("hurt");
               }
               this.lastHurtTime = getTimer();
               this.doubleCount = 0;
            }
         }
         else
         {
            param1 -= _loc7_;
            if(gc.isSingleGame() && Boolean(this.getPlayer()))
            {
               _loc4_ = this.getPlayer().getCurEquipByType("zbsp");
               if(_loc4_)
               {
                  if(_loc4_.getFillName() == "shsjt")
                  {
                     _loc5_ = uint(_loc4_.getStrengthValue());
                     this.roleProperies.dispatchEvent(new CommonEvent("SetHHp",[this.roleProperies.getSHHP() * (_loc5_ + 1) * 0.2]));
                     _loc6_ = new FollowBaseObjectBullet("HeroReLive");
                     _loc6_.x = this.x;
                     _loc6_.y = this.y;
                     _loc6_.setRole(this);
                     _loc6_.setDirect(0);
                     _loc6_.setDisable();
                     _loc6_.setAction("relive");
                     gc.gameSence.addChild(_loc6_);
                     this.magicBulletArray.push(_loc6_);
                     this.getPlayer().removeCurEquip(_loc4_);
                     this.setYourFather(gc.frameClips * 2);
                     return;
                  }
                  if(_loc4_.getFillName() == "clj")
                  {
                     if(!this.getPlayer().isRealiveBydzjj)
                     {
                        this.roleProperies.dispatchEvent(new CommonEvent("SetHHp",[this.roleProperies.getSHHP()]));
                        this.roleProperies.dispatchEvent(new CommonEvent("SetMMp",[this.roleProperies.getMMP() + this.roleProperies.getSMMP() / 2]));
                        _loc6_ = new FollowBaseObjectBullet("HeroReLive");
                        _loc6_.x = this.x;
                        _loc6_.y = this.y;
                        _loc6_.setRole(this);
                        _loc6_.setDirect(0);
                        _loc6_.setDisable();
                        _loc6_.setAction("relive");
                        gc.gameSence.addChild(_loc6_);
                        this.magicBulletArray.push(_loc6_);
                        this.setYourFather(gc.frameClips * 2);
                        this.getPlayer().isRealiveBydzjj = true;
                        return;
                     }
                  }
                  if(_loc4_.getFillName() == "dzjj")
                  {
                     if(this.roleProperies.getMMP() >= param1 * 3)
                     {
                        this.reduceMp(param1 * 3);
                        return;
                     }
                     this.reduceMp(param1 * 3);
                  }
               }
               _loc4_ = this.getPlayer().getCurEquipByType("zbfb");
               if(_loc4_)
               {
                  if(_loc4_.getFillName() == "tjbg")
                  {
                     if(!this.getPlayer().isRealiveBytjbg)
                     {
                        this.roleProperies.dispatchEvent(new CommonEvent("SetHHp",[this.roleProperies.getSHHP()]));
                        if(_loc4_.getWX().indexOf("木") != -1)
                        {
                           this.roleProperies.dispatchEvent(new CommonEvent("SetMMp",[this.roleProperies.getMMP() + this.roleProperies.getSMMP() / 2]));
                        }
                        _loc6_ = new FollowBaseObjectBullet("HeroReLive");
                        _loc6_.x = this.x;
                        _loc6_.y = this.y;
                        _loc6_.setRole(this);
                        _loc6_.setDirect(0);
                        _loc6_.setDisable();
                        _loc6_.setAction("relive");
                        gc.gameSence.addChild(_loc6_);
                        this.magicBulletArray.push(_loc6_);
                        this.setYourFather(gc.frameClips * 2);
                        this.getPlayer().isRealiveBytjbg = true;
                        return;
                     }
                  }
               }
            }
            if(!this.isAlreadyDead)
            {
               this.isAlreadyDead = true;
               this.destroy();
               if(gc.sid == this.sid && gc.isInRoom())
               {
                  gc.sendDead(this.getRoleId());
               }
               gc.eventManger.dispatchEvent(new CommonEvent("heroDead",this));
            }
         }
      }
      
      override public function isWaiting() : Boolean
      {
         return this.curAction == "wait" || this.curAction == "wait2";
      }
      
      protected function setPet() : void
      {
         this.updatePet();
      }
      
      public function getCurMagicWeapon() : BaseMagicWeapon
      {
         return this.curMagicWeapon;
      }
      
      public function updateMagicWeapon() : void
      {
         if(this.curMagicWeapon)
         {
            this.curMagicWeapon.step();
         }
      }
      
      public function updatePet() : void
      {
         if(this.myPet)
         {
            this.myPet.step();
         }
      }
      
      public function clearPet() : void
      {
         this.myPet = null;
      }
      
      public function sendSkill(param1:int) : void
      {
         if(this.isDead())
         {
            return;
         }
         var _loc2_:String = "";
         switch(param1)
         {
            case 0:
               if(this.getPlayer().controlPlayer == 0)
               {
                  _loc2_ = "Y";
               }
               else
               {
                  _loc2_ = "8";
               }
               this.showSkill(_loc2_);
               break;
            case 1:
               if(this.getPlayer().controlPlayer == 0)
               {
                  _loc2_ = "L";
               }
               else
               {
                  _loc2_ = "3";
               }
               this.showSkill(_loc2_);
               break;
            case 2:
               if(this.getPlayer().controlPlayer == 0)
               {
                  _loc2_ = "U";
               }
               else
               {
                  _loc2_ = "4";
               }
               this.showSkill(_loc2_);
               break;
            case 3:
               if(this.getPlayer().controlPlayer == 0)
               {
                  _loc2_ = "I";
               }
               else
               {
                  _loc2_ = "5";
               }
               this.showSkill(_loc2_);
               break;
            case 4:
               if(this.getPlayer().controlPlayer == 0)
               {
                  _loc2_ = "O";
               }
               else
               {
                  _loc2_ = "6";
               }
               this.showSkill(_loc2_);
               break;
            case 5:
               this.showSkillKongGe();
               break;
            case 6:
               this.showSkillFaBao();
         }
      }
      
      protected function showSkill(param1:String) : void
      {
      }
      
      protected function showSkillKongGe() : void
      {
      }
      
      protected function showSkillFaBao() : void
      {
         if(!gc.isSingleGame())
         {
            return;
         }
         if(this.isAttacking() || this.isBeAttacking())
         {
         }
         if(this.curMagicWeapon)
         {
            this.curMagicWeapon.useSkill();
         }
      }
      
      public function __keyBoardUp(param1:KeyboardEvent) : void
      {
         if(!gc.keyboardControl.isInThisPlayerKeyboard(this.player,param1.keyCode))
         {
            return;
         }
         if(param1.keyCode == this.lastKey.keyCode)
         {
            ++this.keyId;
         }
         switch(param1.keyCode)
         {
            case gc.keyboardControl.getLeftByPlayer(this.player):
               this.stopMoveLeft();
               if(this.lastDirbtn == param1.keyCode)
               {
                  this.lastDirbtn = 0;
               }
               this.doubleCount = 0;
               break;
            case gc.keyboardControl.getRightByPlayer(this.player):
               this.stopMoveRight();
               if(this.lastDirbtn == param1.keyCode)
               {
                  this.lastDirbtn = 0;
               }
               this.doubleCount = 0;
         }
         var _loc2_:uint = uint(this.keyList.length);
         while(_loc2_-- > 0)
         {
            if(this.keyList[_loc2_] == param1.keyCode)
            {
               this.cannextaction = true;
               this.keyarray[_loc2_] = 0;
            }
         }
      }
      
      public function stopMoveLeft() : void
      {
         this.isLeft = false;
         if(!this.isRight)
         {
            if(!this.isAttacking())
            {
               if(!this.isInSky())
               {
                  if(!this.isWaiting())
                  {
                     this.setAction("wait");
                  }
                  if(this.sid == gc.sid)
                  {
                     gc.sendPosition(this);
                  }
               }
               else if(this.sid == gc.sid)
               {
                  gc.sendLorRInfo(this);
               }
            }
            if(!this.isCanMoveWhenAttack())
            {
               this.speed.x = 0;
            }
         }
         else
         {
            this.bbdc.turnRight();
         }
      }
      
      public function stopMoveRight() : void
      {
         this.isRight = false;
         if(!this.isLeft)
         {
            if(!this.isAttacking())
            {
               if(!this.isInSky())
               {
                  if(!this.isWaiting())
                  {
                     this.setAction("wait");
                  }
                  if(this.sid == gc.sid)
                  {
                     gc.sendPosition(this);
                  }
               }
               else if(this.sid == gc.sid)
               {
                  gc.sendLorRInfo(this);
               }
            }
            if(!this.isCanMoveWhenAttack())
            {
               this.speed.x = 0;
            }
         }
         else
         {
            this.bbdc.turnLeft();
         }
      }
      
      override public function getHurtByPig8(param1:int) : void
      {
         this.reduceHp(param1);
         this.addHeroHurtMc(param1);
      }
      
      public function beMagicAttack1(param1:BaseBullet, param2:BaseObject, param3:Boolean = false) : Boolean
      {
         return Boolean(this.colipse) && Boolean(HitTest.complexHitTestObject(this.colipse,param1));
      }
      
      override public function beMagicAttack(param1:BaseBullet, param2:BaseObject, param3:Boolean = false) : Boolean
      {
         var bb:* = undefined;
         var _loc4_:int = 0;
         var _loc5_:int = 0;
         var _loc6_:int = 0;
         var _loc7_:* = null;
         var _loc8_:* = null;
         var _loc9_:* = NaN;
         var _loc10_:* = 0;
         var _loc11_:* = 0;
         var _loc12_:* = null;
         var _loc13_:int = 0;
         var _loc14_:* = null;
         var hited:Boolean = false;
         if(Boolean(gc.protectedPerproty.getProperty(this,"isYourFather")) || Boolean(gc.protectedPerproty.getProperty(this,"hmzFather")) || Boolean(gc.protectedPerproty.getProperty(this,"lysFather")))
         {
            return false;
         }
         hited = Boolean(HitTest.complexHitTestObject(this.colipse,param1));
         if(param1.getImgMc1() != null)
         {
            hited = Boolean(HitTest.complexHitTestObject(this.colipse,param1.getImgMc1()));
         }
         if(param3 || Boolean(this.colipse) && Boolean(hited))
         {
            if(this is Role1)
            {
               if(this.curAction == "hit10")
               {
                  if(gc.protectedPerproty.getProperty(this,"hmzFather"))
                  {
                     this.canBati = true;
                     this.hmzCharge += 1;
                  }
               }
               if(this.curAction == "hit9")
               {
                  if(gc.protectedPerproty.getProperty(this,"lysFather"))
                  {
                     this.canBati = true;
                  }
               }
            }
            if(param2 is BaseMonster)
            {
               if(Math.random() <= (this.roleProperies.getTotalMiss() - Number(BaseMonster(param2).Hit)) / 100)
               {
                  this.addMissMc();
                  this.beAttackIdArray.push(param1.getAttackId());
                  return true;
               }
            }
            else if(param2 is BaseHero)
            {
               if(Math.random() <= (this.roleProperies.getTotalMiss() - BaseHero(param2).roleProperies.getDeephit()) / 100)
               {
                  this.addMissMc();
                  this.beAttackIdArray.push(param1.getAttackId());
                  return true;
               }
            }
            if(param1.isBingo)
            {
               if(gc.difficulity == 2)
               {
                  this.reduceHp(this.roleProperies.getSHHP() * 99,true);
                  setYourFather(gc.frameClips);
                  return true;
               }
               this.addBingoMc();
               this.reduceHp(this.roleProperies.getSHHP() * 0.5,true);
               this.reduceMp(this.roleProperies.getSMMP() * 0.1);
               setYourFather(gc.frameClips);
               return true;
            }
            _loc4_ = (Math.random() - 0.5) * 10;
            _loc5_ = int(param2.getRealPower(param1.curAction).hurt);
            _loc7_ = param2.attackBackInfoDict[param1.curAction];
            for each(bb in this.magicBulletArray)
            {
               if(bb.getImcName() == "MagicFlagEffect")
               {
                  param2.addCurAddEffect([{
                     "name":BaseAddEffect.MAGIC_FLAG_DEBUFF,
                     "time":gc.frameClips * 5
                  }]);
               }
            }
            if(param1.getImcName() == "Role1Bullet12")
            {
               _loc9_ = Number(AUtils.GetDisBetweenTwoObj(this,param2));
               if(_loc9_ > 1000)
               {
                  _loc9_ = 1000;
               }
               _loc5_ = _loc5_ * (1000 - _loc9_) / 1000;
            }
            _loc6_ = int(this.countHurt(_loc5_,_loc7_,BaseMonster(param2)));
            if(this is Role3)
            {
               if(this.curAction == "hit12")
               {
                  if(param2 is BaseMonster)
                  {
                     param2.reduceHp(_loc6_ * 5);
                     BaseMonster(param2).addMonHurtMc(_loc6_ * 5,false);
                     if(this.getPlayer().returnSkillLevelBySkillName("tmc") >= 1)
                     {
                        _loc6_ *= 0.64;
                     }
                  }
                  else if(param2.sid == gc.sid)
                  {
                     param2.reduceHp(_loc6_);
                  }
               }
               if(gc.sid == this.sid || gc.isSingleGame())
               {
                  if(Role3(this).getPlayer())
                  {
                     if(Role3(this).getPlayer().getSkillBySkillName("rj"))
                     {
                        if(Math.random() <= 0.1 + Role3(this).getPlayer().returnSkillLevelBySkillName("rj") * 0.005)
                        {
                           this.cureHp(this.roleProperies.getHurt() * 0.2);
                        }
                     }
                  }
               }
            }
            if(param1.getImcName() == "Role1Bullet12")
            {
               this.reduceHp(_loc6_,false);
            }
            else
            {
               this.reduceHp(_loc6_,true);
            }
            if(param1.getImcName() == "yinjiangjun_skill3_1big" || param1.getImcName() == "yinjiangjun_skill3_1" || param1.getImcName() == "yinjiangjun_skill3_2big" || param1.getImcName() == "yinjiangjun_skill3_2" || param1.getImcName() == "skill4_3" || param1.getImcName() == "qingyangshenjun_skill3_2_box" || param1.getImcName() == "qingyangshenjun_skill4_1_box" || param1.getImcName() == "ttzs_skill2_1" || param1.getImcName() == "zimoujiuwang_skill2_1" || param1.getImcName() == "baishuishenjun_skill2_2_box" || param1.getImcName() == "baishuishenjun_skill3_2_box" || param1.getImcName() == "baishuishenjun_skill3_2_1_box" || param1.getImcName() == "baishuishenjun_skill3_2_2_box" || param1.getImcName() == "zijingpengwang_skill3_box" || param1.getImcName() == "zijingpengwang_skill5_3")
            {
               this.setAction("hurt");
            }
            if(param2 is BaseHero)
            {
               if(Boolean(_loc7_) && _loc7_.attackKind == "physics")
               {
                  if(BaseHero(param2).sid == gc.sid && gc.isInRoom())
                  {
                     _loc10_ = uint(BaseHero(param2).roleProperies.getEatBlood());
                     _loc11_ = uint(int(_loc10_ / 100 * _loc6_));
                     if(_loc11_ > 0)
                     {
                        BaseHero(param2).cureHp(_loc11_);
                     }
                  }
               }
            }
            else if(param2 is Monster6)
            {
               if(Math.random() <= 0.25)
               {
                  if(this.curAddEffect)
                  {
                     this.curAddEffect.add([{
                        "name":BaseAddEffect.PETHORSE_ICE,
                        "time":gc.frameClips * 2
                     }]);
                  }
               }
            }
            else if(param2 is Monster16)
            {
               if(Math.random() <= 0.25)
               {
                  if(this.curAddEffect)
                  {
                     this.curAddEffect.add([{
                        "name":BaseAddEffect.PETMONKEY_FIRE,
                        "hurt":40,
                        "time":gc.frameClips * 5
                     }]);
                  }
               }
            }
            else if(param2 is Monster34)
            {
               if(Boolean(_loc7_) && _loc7_.attackKind == "physics")
               {
                  param2.cureHp(_loc6_ * 0.05);
               }
            }
            else if(param2 is Monster1007)
            {
               if(param2.curAddEffect)
               {
                  if(param2.curAddEffect.curDebuff(BaseAddEffect.LEMHXX))
                  {
                     param2.cureHp(_loc6_ * 20);
                  }
               }
            }
            _loc8_ = this.getBeattackBackSpeed(param1,_loc7_);
            if(param2 is BaseHero && this.sid != gc.sid)
            {
               if(BaseHero(param2).sid == gc.sid)
               {
                  if(param1.getImcName() == "Role1Bullet12")
                  {
                     gc.sendHurt(_loc6_,this.sid,this.getRoleId() * 10 + BaseHero(param2).getRoleId(),param1.curAction,_loc8_.x,_loc8_.y,param1.initTimer,false,false);
                  }
                  else
                  {
                     gc.sendHurt(_loc6_,this.sid,this.getRoleId() * 10 + BaseHero(param2).getRoleId(),param1.curAction,_loc8_.x,_loc8_.y,param1.initTimer);
                  }
               }
            }
            else if(param2 is BasePet && this.sid != gc.sid)
            {
               if(BasePet(param2).getSourceRole().sid == gc.sid)
               {
                  if(param1.getImcName() == "Role1Bullet12")
                  {
                     gc.sendHurt(_loc6_,this.sid,this.getRoleId() * 10 + BasePet(param2).getSourceRole().getRoleId(),param1.curAction,_loc8_.x,_loc8_.y,param1.initTimer,false,false);
                  }
                  else
                  {
                     gc.sendHurt(_loc6_,this.sid,this.getRoleId() * 10 + BasePet(param2).getSourceRole().getRoleId(),param1.curAction,_loc8_.x,_loc8_.y,param1.initTimer);
                  }
               }
            }
            if(this.curAddEffect)
            {
               if(this.curAddEffect.curDebuff(BaseAddEffect.MAGIC_UMBRELLA_DEFEND2))
               {
                  param2.reduceHp(_loc6_ * 2);
                  BaseMonster(param2).addMonHurtMc(_loc6_ * 2,false);
               }
            }
            if(param1.getImcName() != "Role1Bullet12")
            {
               if(this.getPlayer().getCurEquipByType("zbfj"))
               {
                  if(Boolean(this.getPlayer().getCurEquipByType("zbfj").getFillName().indexOf("zxstj")) || Boolean(this.getPlayer().getCurEquipByType("zbfj").getFillName().indexOf("zxpty")) || Boolean(this.getPlayer().getCurEquipByType("zbfj").getFillName().indexOf("zxztk")) || Boolean(this.getPlayer().getCurEquipByType("zbfj").getFillName().indexOf("zxqts")) || Boolean(this.getPlayer().getCurEquipByType("zbfj").getFillName().indexOf("zxttp")))
                  {
                     if(int(_loc6_ * 0.9) != 0)
                     {
                        this.setAttackBack(_loc8_);
                     }
                  }
               }
               else if(_loc6_ != 0)
               {
                  this.setAttackBack(_loc8_);
               }
            }
            if(param1.getImcName() == "Monster1005Bullet2Over")
            {
               gc.pWorld.getBaseLevelListener().startBlackBG();
               TweenMax.delayedCall(10,function():*
               {
                  gc.pWorld.getBaseLevelListener().stopBlackBG();
               });
            }
            if(_loc7_.addEffect)
            {
               _loc12_ = AUtils.clone(_loc7_.addEffect) as Array;
               _loc13_ = 0;
               while(_loc13_ < _loc12_.length)
               {
                  _loc14_ = _loc12_[_loc13_];
                  if(_loc14_.time == BaseBullet.DESIDE_BY_FRAMES_LEFT)
                  {
                     _loc14_.time = param1.getFrameLeft();
                  }
                  _loc13_++;
               }
               this.addCurAddEffect(_loc12_);
            }
            this.beAttackIdArray.push(param1.getAttackId());
            this.beAttackDoing();
            if(this is Role1)
            {
               SoundManager.play("Role1_beAttack");
            }
            else if(this is Role2)
            {
               SoundManager.play("Role2_beAttack");
            }
            else if(this is Role3)
            {
               SoundManager.play("Role3_beAttack");
            }
            else if(this is Role4)
            {
               SoundManager.play("Role3_beAttack");
            }
            else if(this is Role5)
            {
               SoundManager.play("Role1_beAttack");
            }
            return true;
         }
         return false;
      }
      
      protected function countHurt(param1:int, param2:Object, param3:BaseMonster) : int
      {
         var _loc4_:* = null;
         var _loc5_:* = Number(NaN);
         var _loc6_:* = 0;
         if(param2)
         {
            if(param2.attackKind == "magic")
            {
               if(this.getPlayer())
               {
                  _loc5_ = Number(this.roleProperies.getMagicDefWhenCountHurt() / 100 - param3.ReduceMagicDef);
               }
               else
               {
                  _loc4_ = gc.getMutiUserBySidAndRoleId(this.sid,this.getRoleId());
                  _loc5_ = Number(Number(_loc4_.mDef) / 100 - param3.ReduceMagicDef);
               }
               if(_loc5_ >= 1)
               {
                  param1 = 1;
               }
               else if(1 - _loc5_ > 1.1)
               {
                  param1 *= 1.1;
               }
               else
               {
                  param1 *= 1 - _loc5_;
               }
               return param1;
            }
            if(param2.attackKind == "physics")
            {
               if(this.getPlayer())
               {
                  _loc6_ = int(this.roleProperies.getTotalDefense());
               }
               else
               {
                  _loc4_ = gc.getMutiUserBySidAndRoleId(this.sid,this.getRoleId());
                  _loc6_ = uint(_loc4_.def);
               }
               if(param1 > _loc6_)
               {
                  param1 -= _loc6_;
               }
               else
               {
                  param1 = 1;
               }
               return param1;
            }
         }
         return param1;
      }
      
      public function beAttackDoing() : void
      {
         this.resetGraity();
         this.addBeAttackEffect(null);
         this.curbeattacktime = getTimer();
         var _loc1_:int = this.curbeattacktime - this.lastbeattacktime;
         var _loc2_:int = 200 / _loc1_;
         if(_loc2_ > 3)
         {
            _loc2_ = 3;
         }
         else if(_loc2_ < 1)
         {
            _loc2_ = 1;
         }
         this.beattackedtimes += _loc2_;
         var _loc3_:MovieClip = gc.gameInfo.getRoleInfoByPlayer(this.player).herobeattacktimes.ruler;
         TweenMax.to(_loc3_,0.2,{"scaleX":this.beattackedtimes / 20});
         if(this.beattackedtimes > 19)
         {
            this.setYourFather(gc.frameClips * 3,false);
            this.beattackedtimes = 0;
            TweenMax.to(_loc3_,3,{"scaleX":this.beattackedtimes / 20});
         }
         this.lastbeattacktime = this.curbeattacktime;
         if(this.curAddEffect)
         {
            this.curAddEffect.updateFather();
         }
      }
      
      override protected function addBeAttackEffect(param1:BaseObject) : void
      {
         var _loc2_:MovieClip = AUtils.getNewObj("HeroBeHurt");
         var _loc3_:ColorMatrix = new ColorMatrix();
         if(this is Role2)
         {
            _loc3_.adjustColor(0,0,0,160);
         }
         _loc2_.filters = [new ColorMatrixFilter(_loc3_)];
         _loc2_.x = this.colipse.x;
         _loc2_.y = this.colipse.y;
         this.addChild(_loc2_);
      }
      
      public function getPet() : BasePet
      {
         return this.myPet;
      }
      
      public function getKeyArray() : Array
      {
         return this.keyarray;
      }
      
      public function getPlayer() : User
      {
         return this.player;
      }
      
      override public function isAttacking() : Boolean
      {
         return false;
      }
      
      override public function isWalkOrRun() : Boolean
      {
         return this.curAction == "walk" || this.doubleCount == 1;
      }
      
      public function normalHit() : *
      {
      }
      
      override public function resetGraity() : void
      {
         super.resetGraity();
      }
      
      public function setKeyList(param1:Array) : void
      {
         this.keyList = param1;
      }
      
      public function setPlayer(param1:User) : void
      {
         this.player = param1;
      }
      
      public function setLostKeyboard() : void
      {
         gc.keyboardControl.setNoControlByPlayer(this.getPlayer());
         var _loc1_:int = 0;
         while(_loc1_ < this.keyarray.length)
         {
            this.keyarray[_loc1_] = 0;
            _loc1_++;
         }
         this.lastDirbtn = 0;
         this.lastKey = {};
         this.cannextaction = true;
      }
      
      public function reSetLostKeyboard() : void
      {
         gc.keyboardControl.setYesControlByPlayer(this.getPlayer());
      }
      
      override public function step() : void
      {
         super.step();
         this.stepOther();
         if(this.curAction == "jump1" && this.speed.y > 0)
         {
            this.setAction("jump3");
            if(this.getPlayer())
            {
               gc.sendPosition(this);
            }
         }
         this.setPet();
         this.updateEquip();
         this.updateMagicWeapon();
         var _loc1_:Point = gc.gameSence.localToGlobal(new Point(this.x,this.y));
         var _loc2_:Point = gc.gameSence.globalToLocal(new Point(20,0));
         if(_loc1_.x < 20)
         {
            this.x = _loc2_.x;
         }
         else if(_loc1_.x > 920)
         {
            this.x = _loc2_.x + 900;
         }
         if(this is Role2Shadow)
         {
            if(_loc1_.x < 70)
            {
               this.turnRight();
            }
            else if(_loc1_.x > 860)
            {
               this.turnLeft();
            }
         }
      }
      
      protected function stepOther() : void
      {
         var _loc1_:* = null;
         if(this.isGXP)
         {
            if(this.getPlayer())
            {
               _loc1_ = gc.gameInfo.getRoleInfoByPlayer(this.player);
            }
            ++shadowCount;
            if(this.shadowCount % 4 == 0)
            {
               this.shadowEffect();
               if(this.getPlayer())
               {
                  if(_loc1_.isGXPAlive())
                  {
                     _loc1_.reduceGXP(1);
                  }
                  else
                  {
                     this.isGXP = false;
                     this.turnToNormal();
                     if(gc.sid == this.sid && gc.isInRoom())
                     {
                        gc.sendAttack(this.getRoleId(),"wushuangOver",0,0,0,[]);
                     }
                  }
               }
            }
         }
         if(this.getPlayer())
         {
            this.roleProperies.step();
            this.executeKeyCode();
            this.executeLastDirKey();
         }
      }
      
      public function upGrade(param1:Boolean = true) : *
      {
         if(this.roleProperies)
         {
            this.roleProperies.removeAllBuff();
         }
      }
      
      protected function addDoubleCount(param1:uint) : *
      {
         if(param1 == this.lastKey.keyCode && this.keyId != this.lastKey.keyId)
         {
            this.curUpTime = int(int(getTimer()));
            if(this.curUpTime - this.lastUpTime >= 500)
            {
               this.doubleCount = 0;
            }
            else
            {
               if(this.doubleCount == 0)
               {
                  if(this.getPlayer())
                  {
                     gc.sendRun(this.getRoleId());
                  }
               }
               this.doubleCount = 1;
            }
            this.lastUpTime = this.curUpTime;
         }
         if(param1 != this.lastKey.keyCode)
         {
            this.doubleCount = 0;
            this.curUpTime = int(int(getTimer()));
            this.lastUpTime = this.curUpTime;
         }
      }
      
      public function addHeroHurtMc(param1:int) : void
      {
         var _loc2_:ANumber = new ANumber();
         this.gc.gameSence.addChild(_loc2_);
         _loc2_.aNumImage("pnum",param1,this.x - 20,this.y - 60,20);
      }
      
      protected function addMissMc() : void
      {
         var missMc:* = undefined;
         missMc = undefined;
         missMc = undefined;
         missMc = undefined;
         missMc = AUtils.getImageObj("miss");
         missMc.x = this.x - 20;
         missMc.y = this.y - 60;
         this.gc.gameSence.addChild(missMc);
         TweenMax.to(missMc,2,{
            "y":Number(missMc.y) - 60,
            "alpha":0,
            "onComplete":function():*
            {
               if(Boolean(missMc) && Boolean(gc.gameSence) && gc.gameSence.contains(missMc))
               {
                  gc.gameSence.removeChild(missMc);
               }
            }
         });
      }
      
      protected function checkDirect() : void
      {
         if(this.isLeft)
         {
            this.bbdc.turnLeft();
         }
         if(this.isRight)
         {
            this.bbdc.turnRight();
         }
      }
      
      protected function checkDoubleCount(param1:uint) : void
      {
      }
      
      protected function doWsEffect() : void
      {
         var _loc1_:WsEffect = new WsEffect();
         _loc1_.x = 470;
         _loc1_.y = 295;
         if(this is Role1)
         {
            _loc1_.Role2Mc.visible = false;
            _loc1_.Role3Mc.visible = false;
         }
         else if(this is Role2)
         {
            _loc1_.Role1Mc.visible = false;
            _loc1_.Role3Mc.visible = false;
         }
         else if(this is Role3)
         {
            _loc1_.Role1Mc.visible = false;
            _loc1_.Role2Mc.visible = false;
         }
         gc.gameInfo.addChild(_loc1_);
      }
      
      protected function executeKeyCode() : *
      {
         this.myKeyDown(this.keyarray.join(""));
      }
      
      protected function executeLastDirKey() : void
      {
         if(!this.isAttacking())
         {
            switch(this.lastDirbtn)
            {
               case 65:
               case 37:
                  this.turnLeft();
                  break;
               case 68:
               case 39:
                  this.turnRight();
            }
         }
      }
      
      override protected function isCannotMoveWhenAttack() : Boolean
      {
         return false;
      }
      
      override protected function isRunning() : Boolean
      {
         return this.doubleCount == 1;
      }
      
      override protected function jump() : void
      {
         if(!this.isAttacking() && !this.isBeAttacking())
         {
            if(gc.protectedPerproty.getProperty(this,"jumpCount") < 2)
            {
               this.speed.y = jumpPower;
               if(gc.protectedPerproty.getProperty(this,"jumpCount") == 0)
               {
                  gc.protectedPerproty.setProperty(this,"jumpCount",1);
                  this.setAction("jump1");
                  if(this.getPlayer())
                  {
                     gc.sendWalkInfo(this);
                  }
               }
               else
               {
                  gc.protectedPerproty.setProperty(this,"jumpCount",2);
                  this.setAction("jump2");
                  if(this.getPlayer())
                  {
                     gc.sendWalkInfo(this);
                  }
               }
            }
            else if(gc.protectedPerproty.getProperty(this,"jumpCount") == 2)
            {
               if(gc.isInSea())
               {
                  this.speed.y = jumpPower;
                  this.setAction("jump2");
                  if(Boolean(this.getPlayer()) && gc.isInRoom())
                  {
                     gc.sendWalkInfo(this);
                  }
               }
            }
         }
      }
      
      public function doJump() : void
      {
         this.jump();
      }
      
      override protected function move() : void
      {
         var _loc1_:* = undefined;
         var _loc2_:* = undefined;
         var _loc3_:* = undefined;
         var _loc4_:* = Number(this.speed.x);
         var _loc5_:* = Number(this.speed.y);
         var _loc6_:Number = 1;
         var _loc7_:Number = 1;
         if(this.curAddEffect)
         {
            if(this.curAddEffect.isAnyThingElseStun(""))
            {
               return;
            }
         }
         if(this.curAddEffect)
         {
            _loc1_ = this.curAddEffect.getBuffByName(BaseAddEffect.MONSTER47SLOW);
            if(_loc1_)
            {
               _loc6_ = 0.5;
            }
            _loc2_ = this.curAddEffect.getBuffByName(BaseAddEffect.MONSTER115SLOW);
            if(_loc2_)
            {
               _loc6_ = 0.25;
            }
            _loc3_ = this.curAddEffect.getBuffByName(BaseAddEffect.SPEEDUP);
            if(_loc3_)
            {
               _loc7_ = 1.5;
            }
         }
         if(this.isCanMoveByStage())
         {
            if(this.standInObj)
            {
               if(this.isWaiting())
               {
                  if(this.standInObj is Wall)
                  {
                     this.speed.x = Wall(this.standInObj).speedX;
                  }
                  else
                  {
                     this.speed.x = 0;
                  }
               }
            }
            if(gc.isInSea())
            {
               _loc4_ = Number(_loc4_ / 2);
            }
            this.x += Number(_loc4_ * _loc6_ * _loc7_);
         }
         if(gc.isInSea())
         {
            _loc5_ = Number(_loc5_ / 2);
            if(_loc5_ > 8)
            {
               _loc5_ = 8;
            }
            if(this.speed.y > 16)
            {
               this.speed.y = 16;
            }
         }
         this.y += Number(_loc5_ * _loc6_);
         this.speed.y += graity;
         this.x += this.enforceSpeed.x;
         this.y += this.enforceSpeed.y;
      }
      
      override public function isCanMoveByStage() : Boolean
      {
         if(gc.isSingleGame() || gc.sid == this.sid)
         {
            return super.isCanMoveByStage();
         }
         return true;
      }
      
      protected function myKeyDown(param1:String) : *
      {
         if(this.timers > 0)
         {
            --this.timers;
         }
      }
      
      override protected function setSpeed() : void
      {
         super.setSpeed();
      }
      
      override protected function checkOver() : void
      {
         if(this.y >= 1500)
         {
            if(this is Role2Shadow)
            {
               this.destroy();
            }
            else
            {
               this.reduceHp(this.roleProperies.getSHHP(),false);
            }
         }
      }
      
      override protected function turnToGXP() : void
      {
         var def:Number = NaN;
         var mdef:Number = NaN;
         var _loc1_:* = null;
         var _loc2_:int = 0;
         var _loc3_:* = null;
         this.isGXP = true;
         this.graity = 1.5;
         this.horizenSpeed *= 1.4;
         this.horizenRunSpeed *= 1.4;
         if(this.sid == gc.sid && gc.isInRoom())
         {
            gc.sendAttack(this.getRoleId(),"wushuangStart",0,0,0,[]);
         }
         if(gc.isSingleGame())
         {
            _loc1_ = this.getPlayer().getCurEquipByType("zbsz");
            if(_loc1_)
            {
               if(_loc1_.getFillName() == "yxnmwsz" || _loc1_.getFillName() == "jlnmwsz" || _loc1_.getFillName() == "ssnmwsz")
               {
                  _loc2_ = 1;
                  if(_loc1_.getFillName() == "yxnmwsz")
                  {
                     _loc2_ = 1;
                  }
                  else if(_loc1_.getFillName() == "jlnmwsz")
                  {
                     _loc2_ = 2;
                  }
                  else if(_loc1_.getFillName() == "ssnmwsz")
                  {
                     _loc2_ = 3;
                  }
                  _loc3_ = new FollowBaseObjectBullet("PetMonkey1Bullet2");
                  if(this.getBBDC().getDirect() == 0)
                  {
                     _loc3_.x = this.x - 50;
                  }
                  else
                  {
                     _loc3_.x = this.x + 50;
                  }
                  _loc3_.y = this.y - 60;
                  _loc3_.setRole(this);
                  _loc3_.setDestroyWhenLastFrame(false);
                  _loc3_.setHurtCanCutDownEffect(false);
                  _loc3_.setDestroyInCount(gc.frameClips * 12);
                  _loc3_.setDirect(this.getBBDC().getDirect());
                  _loc3_.setAction("hitNiumowangSzBuff");
                  gc.gameSence.addChild(_loc3_);
                  this.magicBulletArray.push(_loc3_);
               }
               else if(_loc1_.getFillName() == "yxzlwsz" || _loc1_.getFillName() == "jlzlwsz" || _loc1_.getFillName() == "sszlwsz")
               {
                  _loc2_ = 1;
                  if(_loc1_.getFillName() == "yxzlwsz")
                  {
                     _loc2_ = 1;
                  }
                  else if(_loc1_.getFillName() == "jlzlwsz")
                  {
                     _loc2_ = 2;
                  }
                  else if(_loc1_.getFillName() == "sszlwsz")
                  {
                     _loc2_ = 3;
                  }
                  this.attackBackInfoDict["hitZhuanlunwangSzBuff"] = {
                     "hitMaxCount":100,
                     "attackBackSpeed":[0,0],
                     "attackInterval":999,
                     "attackKind":"magic",
                     "addEffect":[{
                        "name":BaseAddEffect.STUN,
                        "time":gc.frameClips * (2 + _loc2_)
                     }],
                     "addprotection":2
                  };
                  _loc3_ = new FollowBaseObjectBullet("ZhuanLunWangSzEffect");
                  _loc3_.x = this.x;
                  _loc3_.y = this.y;
                  _loc3_.setRole(this);
                  _loc3_.setDirect(this.getBBDC().getDirect());
                  _loc3_.setAction("hitZhuanlunwangSzBuff");
                  gc.gameSence.addChild(_loc3_);
                  this.magicBulletArray.push(_loc3_);
               }
               else if(_loc1_.getFillName() == "yxsmsrsz" || _loc1_.getFillName() == "jlsmsrsz" || _loc1_.getFillName() == "sssmsrsz")
               {
                  _loc2_ = 1;
                  if(_loc1_.getFillName() == "yxsmsrsz")
                  {
                     _loc2_ = 1;
                  }
                  else if(_loc1_.getFillName() == "jlsmsrsz")
                  {
                     _loc2_ = 1.5;
                  }
                  else if(_loc1_.getFillName() == "sssmsrsz")
                  {
                     _loc2_ = 2;
                  }
                  this.curAddEffect.add([{
                     "name":BaseAddEffect.SHENMISHANGRENSHIZHUANG,
                     "time":gc.frameClips * 10,
                     "hurt":this.roleProperies.getBasePower() * _loc2_ / 4
                  }]);
               }
               else if(_loc1_.getFillName() == "yxttzssz" || _loc1_.getFillName() == "jlttzssz" || _loc1_.getFillName() == "ssttzssz")
               {
                  def = 0.15;
                  mdef = 0.15;
                  _loc2_ = 1;
                  if(_loc1_.getFillName() == "yxttzssz")
                  {
                     mdef = 0.1;
                     def = 0.1;
                     _loc2_ = 1;
                  }
                  else if(_loc1_.getFillName() == "jlttzssz")
                  {
                     mdef = 0.15;
                     def = 0.15;
                     _loc2_ = 1.5;
                  }
                  else if(_loc1_.getFillName() == "ssttzssz")
                  {
                     mdef = 0.2;
                     def = 0.2;
                     _loc2_ = 2.5;
                  }
                  this.attackBackInfoDict["hitTiantingZhanshenSzBuff"] = {
                     "hitMaxCount":100,
                     "attackBackSpeed":[0,0],
                     "attackInterval":999,
                     "attackKind":"magic",
                     "addEffect":[{
                        "name":BaseAddEffect.TIANTINGZHANSHEN,
                        "time":gc.frameClips * (_loc2_ * 2),
                        "def":def,
                        "mdef":mdef
                     }]
                  };
                  _loc3_ = new FollowBaseObjectBullet("tiantingzhanshenBullet1_1");
                  if(this.getBBDC().getDirect() == 0)
                  {
                     _loc3_.x = this.x;
                  }
                  else
                  {
                     _loc3_.x = this.x;
                  }
                  _loc3_.y = this.y;
                  _loc3_.setRole(this);
                  _loc3_.setHurtCanCutDownEffect(false);
                  _loc3_.setDirect(this.getBBDC().getDirect());
                  _loc3_.setAction("hitTiantingZhanshenSzBuff");
                  gc.gameSence.addChild(_loc3_);
                  this.magicBulletArray.push(_loc3_);
                  _loc3_ = new FollowBaseObjectBullet("tiantingzhanshenBullet1_2");
                  if(this.getBBDC().getDirect() == 0)
                  {
                     _loc3_.x = this.x;
                  }
                  else
                  {
                     _loc3_.x = this.x;
                  }
                  _loc3_.y = this.y;
                  _loc3_.setRole(this);
                  _loc3_.setHurtCanCutDownEffect(false);
                  _loc3_.setDirect(this.getBBDC().getDirect());
                  _loc3_.setAction("hitTiantingZhanshenSzBuff");
                  gc.gameSence.addChild(_loc3_);
                  this.magicBulletArray.push(_loc3_);
               }
            }
         }
      }
      
      override public function isDead() : Boolean
      {
         var _loc1_:* = null;
         var _loc2_:* = null;
         if(this.player)
         {
            _loc2_ = this.player.getCurEquipByType("zbsp");
            if(_loc2_)
            {
               if(_loc2_.getFillName() == "dzjj")
               {
                  return this.roleProperies.getHHP() <= 0 && this.roleProperies.getMMP() <= 0;
               }
            }
            return this.roleProperies.getHHP() <= 0;
         }
         _loc1_ = gc.getMutiUserBySidAndRoleId(this.sid,this.getRoleId());
         if(_loc1_)
         {
            return _loc1_.hp <= 0;
         }
         return true;
      }
      
      override public function setStatic() : void
      {
         super.setStatic();
         this.doubleCount = 0;
      }
      
      public function setSpeedStaticOnly() : void
      {
         super.setStatic();
      }
      
      protected function turnToNormal() : void
      {
         this.graity = 1.5;
         this.horizenSpeed /= 1.4;
         this.horizenRunSpeed /= 1.4;
      }
      
      public function checkTransferDoor() : Boolean
      {
         var _loc1_:* = null;
         var _loc2_:Array = gc.pWorld.getTransferDoorArray();
         var _loc3_:int = 0;
         while(_loc3_ < _loc2_.length)
         {
            _loc1_ = _loc2_[_loc3_] as MovieClip;
            if(Boolean(_loc1_.hitTestObject(this.colipse)) && Boolean(_loc1_.visible))
            {
               return true;
            }
            _loc3_++;
         }
         return false;
      }
      
      public function setCurPower() : void
      {
      }
      
      override public function isNormalHit() : Boolean
      {
         return true;
      }
      
      public function setCurClothId(param1:int) : void
      {
         this.protectedEquipObject.curClothId1 = AUtils.getRandomValue();
         this.protectedEquipObject.curClothId2 = param1 - Number(this.protectedEquipObject.curClothId1);
         var _loc2_:MutiUser = gc.getMutiUserBySidAndRoleId(this.sid,this.getRoleId());
         if(_loc2_)
         {
            if(param1 != _loc2_.equpId)
            {
               _loc2_.equpId = uint(uint(param1));
               gc.sendSelfMutiUserInfo(this.getRoleId());
            }
         }
      }
      
      public function getCurClothId() : int
      {
         return this.protectedEquipObject.curClothId1 + this.protectedEquipObject.curClothId2;
      }
      
      public function setCurWeaponId(param1:int) : void
      {
         var _loc2_:* = null;
         this.protectedEquipObject.curWeaponId1 = AUtils.getRandomValue();
         this.protectedEquipObject.curWeaponId2 = param1 - Number(this.protectedEquipObject.curWeaponId1);
         if(gc.sid == this.sid && !gc.isSingleGame())
         {
            _loc2_ = gc.getMutiUserBySidAndRoleId(this.sid,this.getRoleId());
            if(_loc2_)
            {
               if(param1 != _loc2_.weaponId)
               {
                  _loc2_.weaponId = param1;
                  gc.sendSelfMutiUserInfo(this.getRoleId());
               }
            }
         }
      }
      
      public function getCurWeaponId() : int
      {
         return this.protectedEquipObject.curWeaponId1 + this.protectedEquipObject.curWeaponId2;
      }
      
      public function registerProtectedProperty() : void
      {
         gc.protectedPerproty.addProperty(this,"isYourFather",false);
         gc.protectedPerproty.addProperty(this,"jumpCount",0);
      }
      
      override public function getRoleId() : uint
      {
         if(this.getPlayer())
         {
            return this.getPlayer().roleid;
         }
         return this.roleId;
      }
      
      public function setRoleId(param1:uint) : void
      {
         this.roleId = param1;
      }
      
      public function clearAllBullets() : void
      {
         var _loc1_:* = null;
         var _loc2_:int = 0;
         while(_loc2_ < this.magicBulletArray.length)
         {
            _loc1_ = this.magicBulletArray[_loc2_] as BaseBullet;
            _loc1_.setDisable();
            TweenMax.killChildTweensOf(_loc1_);
            _loc1_.destroy();
            _loc2_++;
         }
         this.magicBulletArray = [];
      }
      
      public function getServerSaveInfo() : String
      {
         return "" + this.roleProperies.getLevel();
      }
      
      public function destroy() : void
      {
         if(this.bbdc)
         {
            this.bbdc.destroy();
         }
         if(this.isGXP)
         {
            this.isGXP = false;
            this.turnToNormal();
         }
         if(this.getPlayer())
         {
            if(gc.keyboardControl)
            {
               this.keyarray = gc.keyboardControl.getZeroKeyArray();
            }
         }
         this.resetGraity();
         this.setStatic();
         this.speed.y = 0;
         this.doubleCount = 0;
         this.lastKey = new Object();
         this.lasttime = 0;
         this.lastUpTime = 0;
         this.lastDirbtn = 0;
         this.fatherCount = 0;
         if(this.curAddEffect)
         {
            this.curAddEffect.destroy();
            this.curAddEffect = null;
         }
         this.beAttackIdArray = [];
         this.clearAllBullets();
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
         this.isReadyToDestroy = true;
         gc.protectedPerproty.removeProperty(this);
         if(this.curMagicWeapon)
         {
            this.curMagicWeapon.destroy();
            this.curMagicWeapon = null;
         }
         if(this.getPet())
         {
            this.getPet().destroy();
            this.myPet = null;
         }
      }
      
      public function refreshEquip() : void
      {
         var _loc1_:* = null;
         var _loc2_:String = null;
         var _loc3_:uint = 0;
         var _loc4_:* = undefined;
         var _loc5_:* = null;
         var _loc6_:* = undefined;
         var _loc7_:* = undefined;
         if(this.player)
         {
            _loc4_ = this.getChildByName("Role_Title");
            if(_loc4_)
            {
               this.removeChild(_loc4_);
            }
            _loc5_ = this.player.getEquipNum().zbtx;
            if(_loc5_ != "")
            {
               if(_loc5_ != "gfcstx")
               {
                  _loc6_ = AUtils.getImageObj("role_title_" + _loc5_);
                  _loc6_.x = -55;
                  _loc6_.y = -90;
                  _loc6_.name = "Role_Title";
                  this.addChild(_loc6_);
               }
               else
               {
                  _loc6_ = AUtils.getNewObj("role_title_" + _loc5_);
                  _loc6_.x = -125;
                  _loc6_.y = -150;
                  _loc6_.name = "Role_Title";
                  this.addChild(_loc6_);
               }
            }
            _loc4_ = this.getChildByName("Godeffect");
            if(_loc4_)
            {
               this.removeChild(_loc4_);
            }
            _loc1_ = this.player.getEquipChinaName().zbfj;
            _loc2_ = this.player.getEquipChinaName().zbwq;
            if(_loc1_.indexOf("cs_zb") != -1 && _loc2_.indexOf("cs_zb") != -1)
            {
               _loc3_ = uint(this.player.roleid);
               _loc7_ = AUtils.getNewObj("Godeffect_" + _loc3_);
               _loc7_.x = 0;
               _loc7_.y = 0;
               _loc7_.name = "Godeffect";
               this.addChild(_loc7_);
            }
            _loc4_ = this.getChildByName("spEffect_1");
            if(_loc4_)
            {
               this.removeChild(_loc4_);
            }
            _loc1_ = this.getPlayer().getCurEquipByType("zbsp");
            if(_loc1_)
            {
               if(_loc1_.getFillName() == "hy" || _loc1_.getFillName() == "mdhy")
               {
                  _loc7_ = AUtils.getNewObj("spEffect_1");
                  _loc7_.x = 0;
                  _loc7_.y = 60;
                  _loc7_.scaleX = 0.8;
                  _loc7_.scaleY = 0.8;
                  _loc7_.alpha = 0.7;
                  _loc7_.name = "spEffect_1";
                  this.addChildAt(_loc7_,0);
               }
            }
         }
      }
      
      public function changeEquip(param1:Object) : void
      {
         this.setCurClothId(param1.zbfj);
         this.setCurWeaponId(param1.zbwq);
         this.refreshEquip();
         this.refreshAlliance();
      }
      
      private function refreshAlliance() : void
      {
         var _loc1_:String = null;
         var _loc2_:* = null;
         _loc2_ = null;
         if(this.gc.myname)
         {
            _loc1_ = this.gc.myname;
         }
         else
         {
            _loc1_ = this.roleName;
         }
         if(this.getPlayer())
         {
            if(!this.allianceBitmap)
            {
               this.allianceBitmap = PlayerHonor.getHonorBitmap(_loc1_);
               this.allianceBitmap.x = -this.allianceBitmap.width / 2;
               this.addChild(this.allianceBitmap);
            }
            _loc2_ = this.player.getEquipNum().zbtx;
            if(_loc2_ != "")
            {
               this.allianceBitmap.y = -120;
            }
            else
            {
               this.allianceBitmap.y = -90;
            }
         }
         else if(!this.allianceBitmap)
         {
            this.allianceBitmap = PlayerHonor.getHonorBitmap(_loc1_);
            this.allianceBitmap.x = -this.allianceBitmap.width / 2;
            this.addChild(this.allianceBitmap);
            this.allianceBitmap.y = -90;
         }
      }
      
      public function changePet() : void
      {
         var _loc1_:* = null;
         var _loc2_:* = null;
         if(this.getPet())
         {
            this.getPet().destroy();
         }
         this.initPet();
         if(gc.sid == this.sid && !gc.isSingleGame())
         {
            _loc1_ = gc.getMutiUserBySidAndRoleId(this.sid,this.getRoleId());
            if(Boolean(_loc1_) && Boolean(this.getPlayer()))
            {
               _loc2_ = this.getPlayer().findCurrentPet();
               if(_loc2_)
               {
                  _loc1_.petName = _loc2_.getPetName();
                  _loc1_.petHp = _loc2_.getHp();
                  _loc1_.petMp = _loc2_.getMp();
                  gc.sendSelfMutiUserInfo(this.getRoleId());
               }
               else
               {
                  _loc1_.petName = "";
                  _loc1_.petHp = 0;
                  _loc1_.petMp = 0;
                  gc.sendSelfMutiUserInfo(this.getRoleId());
               }
            }
         }
      }
      
      public function changeMagicWeapon() : void
      {
         var _loc1_:* = null;
         if(this.getCurMagicWeapon())
         {
            this.getCurMagicWeapon().destroy();
         }
         this.initMagicWeapon();
         if(gc.sid == this.sid && !gc.isSingleGame())
         {
            _loc1_ = gc.getMutiUserBySidAndRoleId(this.sid,this.getRoleId());
            if(Boolean(_loc1_) && Boolean(this.getPlayer()))
            {
               if(_loc1_.bmwId != this.getCurMagicWeapon().bmwId)
               {
                  _loc1_.bmwId = this.getCurMagicWeapon().bmwId;
                  gc.sendSelfMutiUserInfo(this.getRoleId());
               }
            }
         }
      }
      
      protected function beAttackByRole2Hit7(param1:Point) : void
      {
         var p:Point = param1;
         this.resetGraity();
         TweenMax.to(this,0.625,{
            "x":p.x,
            "y":p.y - 30,
            "onComplete":function(param1:BaseObject):*
            {
               if(!param1.isDead())
               {
                  TweenMax.to(param1,0.625,{"y":param1.y - 20});
               }
            },
            "onCompleteParams":[this]
         });
      }
      
      protected function beAttackByRole3Hit6(param1:Point) : void
      {
         this.resetGraity();
         TweenMax.to(this,1,{
            "x":param1.x,
            "y":param1.y
         });
      }
      
      protected function updateEquip() : void
      {
         var _loc1_:* = undefined;
         var _loc2_:* = null;
         if(this.player)
         {
            if(this.curAddEffect)
            {
               if(this.equipCounter == 0)
               {
                  if(this.curAddEffect.getBuffByName(BaseAddEffect.XLFB_BUFF))
                  {
                     this.reduceHp(this.roleProperies.getSHHP() * 0.05);
                  }
                  if(this.curAddEffect.getBuffByName(BaseAddEffect.SXFB_BUFF))
                  {
                     this.reduceHp(this.roleProperies.getSHHP() * 0.054);
                  }
               }
            }
            _loc2_ = this.player.getCurEquipByType("zbsp");
            if(_loc2_)
            {
               if(_loc2_.getFillName() == "zhhz" || _loc2_.getFillName() == "hy" || _loc2_.getFillName() == "mdhy")
               {
                  for each(_loc1_ in gc.pWorld.monsterArray)
                  {
                     if(Boolean(_loc1_.isFly) && !_loc1_.isBoss && !(_loc1_ is Monster6007))
                     {
                        if(!_loc1_.isYourFather() && !_loc1_.isDead())
                        {
                           if(AUtils.GetDisBetweenTwoObj(_loc1_,this) <= 300)
                           {
                              _loc1_.addCurAddEffect([{
                                 "name":BaseAddEffect.MONSTER117SLEEP,
                                 "time":gc.frameClips * 0.5
                              }]);
                           }
                        }
                     }
                  }
               }
               if(_loc2_.getFillName() == "bxhy" || _loc2_.getFillName() == "hy" || _loc2_.getFillName() == "mdhy")
               {
                  if(Number(getTimer()) - this.lastHurtTime >= 10000)
                  {
                     if(this.equipCounter == 0)
                     {
                        if(!this.isDead())
                        {
                           if(this.roleProperies)
                           {
                              this.roleProperies.dispatchEvent(new CommonEvent("SetHHp",[this.roleProperies.getHHP() + int(this.roleProperies.getSHHP() * this.roleProperies.getHx() / 25000)]));
                           }
                        }
                     }
                  }
               }
            }
         }
         if(this.equipCounter >= 0)
         {
            ++this.equipCounter;
            if(this.equipCounter == gc.frameClips)
            {
               this.equipCounter = 0;
            }
         }
      }
   }
}

