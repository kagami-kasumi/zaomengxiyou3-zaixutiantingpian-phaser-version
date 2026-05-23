package export
{
   import base.*;
   import config.*;
   import event.*;
   import export.pack.*;
   import export.pet.*;
   import export.setmenu.*;
   import export.strength.*;
   import flash.display.*;
   import flash.events.*;
   import flash.text.TextField;
   import flash.utils.*;
   import my.*;
   import petInfo.PetInfo;
   
   public class RoleInfo extends Sprite
   {
      
      public var txthp:TextField;
      
      public var txtmp:TextField;
      
      public var txtexp:TextField;
      
      public var txtlevel:TextField;
      
      public var hpline:MovieClip;
      
      public var mpline:MovieClip;
      
      public var expline:MovieClip;
      
      public var wsmc:MovieClip;
      
      public var shows:MovieClip;
      
      public var bg:Sprite;
      
      public var head:MovieClip;
      
      public var herobeattacktimes:MovieClip;
      
      public var zi:Sprite;
      
      public var Yskill:Sprite;
      
      public var Uskill:Sprite;
      
      public var Iskill:Sprite;
      
      public var Oskill:Sprite;
      
      public var Lskill:Sprite;
      
      public var btn_bb:SimpleButton;
      
      public var btn_set:SimpleButton;
      
      public var btn_study:SimpleButton;
      
      public var btn_fb:SimpleButton;
      
      public var btn_cw:SimpleButton;
      
      private var wsValue1:int;
      
      private var wsValue2:int;
      
      private var wsValue3:Number;
      
      private var rn:uint;
      
      private var gc:Config;
      
      private var petHead:ShowPetInfo;
      
      private var hero:BaseHero;
      
      internal var count:int;
      
      private var lastaddws:int;
      
      public function RoleInfo(param1:uint)
      {
         super();
         this.gc = Config.getInstance();
         this.rn = param1;
         this.hero = this.gc["hero" + this.rn];
         if(this.rn == 2)
         {
            this.setPos();
         }
         this.setHead();
         this.addEventListener(Event.ADDED_TO_STAGE,this.added,false,0,true);
         this.addEventListener(Event.REMOVED_FROM_STAGE,this.removed,false,0,true);
         this.setWsValue(0);
      }
      
      private function setHead() : void
      {
         this.head.gotoAndStop(this.gc["hero" + this.rn].roleName);
      }
      
      private function setPos() : void
      {
         this.Yskill.x += 159;
         this.Uskill.x += 80;
         this.Oskill.x -= 80;
         this.Lskill.x -= 159;
         AUtils.flipHorizontal(this.btn_bb,-1);
         AUtils.flipHorizontal(this.btn_study,-1);
         AUtils.flipHorizontal(this.btn_set,-1);
         AUtils.flipHorizontal(this.btn_fb,-1);
         AUtils.flipHorizontal(this.btn_cw,-1);
         AUtils.flipHorizontal(this.txtexp,-1);
         this.txtexp.x = 3 * 60;
         AUtils.flipHorizontal(this.txthp,-1);
         this.txthp.x = 3 * 60;
         AUtils.flipHorizontal(this.txtmp,-1);
         this.txtmp.x = 3 * 60;
         AUtils.flipHorizontal(this.txtlevel,-1);
         this.txtlevel.x = 15;
         this.bg.x -= 20;
         this.head.x -= 20;
         this.hpline.x -= 20;
         this.mpline.x -= 20;
         this.expline.x -= 20;
         this.zi.x -= 20;
         AUtils.flipHorizontal(this.shows,-1);
         this.shows.x = 110;
         AUtils.flipHorizontal(this.zi,-1);
         this.wsmc.x -= 8;
      }
      
      private function setSkillIcon() : void
      {
         var _loc1_:* = undefined;
         var _loc2_:* = 0;
         var _loc3_:* = 0;
         var _loc4_:* = null;
         var _loc5_:* = null;
         var _loc6_:* = ["Y","U","I","O","L"];
         var _loc7_:* = ["8","4","5","6","3"];
         if(this.rn == 1)
         {
            _loc2_ = uint(_loc6_.length);
            while(_loc2_-- > 0)
            {
               if(this.getChildByName("initsprite" + _loc6_[_loc2_]))
               {
                  this.removeChild(this.getChildByName("initsprite" + _loc6_[_loc2_]));
               }
            }
         }
         else
         {
            _loc3_ = uint(_loc7_.length);
            while(_loc3_-- > 0)
            {
               if(this.getChildByName("initsprite" + _loc7_[_loc3_]))
               {
                  this.removeChild(this.getChildByName("initsprite" + _loc7_[_loc3_]));
               }
            }
         }
         var _loc8_:uint = uint(Math.min(this.hero.getPlayer().skillbykey.length,5));
         var _loc9_:String = "";
         while(_loc8_-- > 0)
         {
            if(this.getChildByName("initsprite" + this.hero.getPlayer().skillbykey[_loc8_].keys))
            {
               this.removeChild(this.getChildByName("initsprite" + this.hero.getPlayer().skillbykey[_loc8_].keys));
            }
            _loc1_ = AUtils.getImageObj("ss_" + this.hero.getPlayer().skillbykey[_loc8_].skillName);
            _loc4_ = new Sprite();
            _loc4_.name = "initsprite" + this.hero.getPlayer().skillbykey[_loc8_].keys;
            _loc4_.addChild(_loc1_);
            if(this.hero.getPlayer().controlPlayer == 0)
            {
               _loc9_ = this.hero.getPlayer().skillbykey[_loc8_].keys;
            }
            else
            {
               _loc9_ = this.hero.getPlayer().skillbykey[_loc8_].keys;
               if(_loc9_ == "8")
               {
                  _loc9_ = "Y";
               }
               else if(_loc9_ == "4")
               {
                  _loc9_ = "U";
               }
               else if(_loc9_ == "5")
               {
                  _loc9_ = "I";
               }
               else if(_loc9_ == "6")
               {
                  _loc9_ = "O";
               }
               else if(_loc9_ == "3")
               {
                  _loc9_ = "L";
               }
            }
            this.addChild(_loc4_);
            if(this.rn == 2)
            {
               if(_loc9_ != "Not")
               {
                  AUtils.flipHorizontal(_loc4_,-1);
                  _loc4_.x = this[_loc9_ + "skill"].x + Number(this[_loc9_ + "skill"].width) / 2;
                  _loc4_.y = Number(this[_loc9_ + "skill"].y) - Number(this[_loc9_ + "skill"].height) / 2;
               }
            }
            else if(_loc9_ != "Not")
            {
               _loc4_.x = Number(this[_loc9_ + "skill"].x) - Number(this[_loc9_ + "skill"].width) / 2;
               _loc4_.y = Number(this[_loc9_ + "skill"].y) - Number(this[_loc9_ + "skill"].height) / 2;
            }
            if(_loc9_ != "Not")
            {
               _loc5_ = new Sprite();
               _loc5_.addChild(AUtils.getImageObj("Skill_" + this.hero.getPlayer().skillbykey[_loc8_].keys));
               _loc5_.x = Number(_loc4_.width) / 2;
               _loc5_.y = Number(_loc4_.height) / 2 - 4;
               _loc4_.addChild(_loc5_);
            }
         }
      }
      
      private function added(param1:*) : void
      {
         this.btn_bb.addEventListener(MouseEvent.CLICK,this.showBackPack);
         this.btn_set.addEventListener(MouseEvent.CLICK,this.setClick);
         this.btn_study.addEventListener(MouseEvent.CLICK,this.studySkill);
         this.btn_fb.addEventListener(MouseEvent.CLICK,this.fbClick);
         this.btn_cw.addEventListener(MouseEvent.CLICK,this.cwClick);
         this.gc.eventManger.addEventListener("InGameBuySkillOver",this.refreshShowSkill);
         this.gc.eventManger.addEventListener("CHANGECURRENTPET",this.changeCurPet);
         this.herobeattacktimes.ruler.scaleX = 0;
         this.setSkillIcon();
         this.addPetHead();
      }
      
      private function removed(param1:*) : void
      {
         this.btn_bb.removeEventListener(MouseEvent.CLICK,this.showBackPack);
         this.btn_set.removeEventListener(MouseEvent.CLICK,this.setClick);
         this.btn_study.removeEventListener(MouseEvent.CLICK,this.studySkill);
         this.btn_fb.removeEventListener(MouseEvent.CLICK,this.fbClick);
         this.btn_cw.removeEventListener(MouseEvent.CLICK,this.cwClick);
         this.gc.eventManger.removeEventListener("InGameBuySkillOver",this.refreshShowSkill);
         this.gc.eventManger.removeEventListener("CHANGECURRENTPET",this.changeCurPet);
         this.hero = null;
      }
      
      public function step() : void
      {
         if(!this.hero || !this.hero.roleProperies)
         {
            return;
         }
         try
         {
            this.txthp.text = this.hero.roleProperies.getHHP() + "/" + this.hero.roleProperies.getSHHP();
            this.hpline.gotoAndStop(Math.round(100 * (1 - Number(this.hero.roleProperies.getHHP()) / Number(this.hero.roleProperies.getSHHP()))) + 1);
            this.txtmp.text = this.hero.roleProperies.getMMP() + "/" + this.hero.roleProperies.getSMMP();
            this.mpline.gotoAndStop(Math.round(100 * (1 - Number(this.hero.roleProperies.getMMP()) / Number(this.hero.roleProperies.getSMMP()))) + 1);
            if(this.hero.roleProperies.getLevel() >= AllConsts.GAME_ROLE_MAXLEVEL)
            {
               this.txtexp.text = "MAX";
               this.expline.gotoAndStop(Math.round(1));
            }
            else
            {
               this.txtexp.text = this.hero.roleProperies.getExper() + "/" + this.hero.roleProperies.getExp();
               this.expline.gotoAndStop(Math.round(100 * (1 - Number(this.hero.roleProperies.getExper()) / Number(this.hero.roleProperies.getExp()))) + 1);
            }
            this.txtlevel.text = this.hero.roleProperies.getLevel() + "";
            this.wsmc.gotoAndStop(this.getWsValue());
            if(this.getWsValue() < 100 && this.shows.currentFrame == 2)
            {
               this.shows.gotoAndStop(1);
            }
            if(this.petHead)
            {
               this.petHead.show();
            }
            return;
         }
         catch(e:Error)
         {
            return;
         }
      }
      
      private function addPetHead() : void
      {
         var _loc1_:PetInfo = this.hero.getPlayer().findCurrentPet();
         if(_loc1_)
         {
            if(this.petHead == null)
            {
               this.petHead = new ShowPetInfo();
               this.petHead.setPetInfo(_loc1_);
               this.petHead.flipHorizontalTxt(this.rn);
               this.petHead.y = 94;
               this.addChild(this.petHead);
            }
            else
            {
               this.petHead.setPetInfo(_loc1_);
            }
         }
         else
         {
            this.removePetHead();
         }
      }
      
      private function removePetHead() : void
      {
         if(Boolean(this.petHead) && this.contains(this.petHead))
         {
            this.removeChild(this.petHead);
            this.petHead = null;
         }
      }
      
      private function changeCurPet(param1:CommonEvent) : void
      {
         this.addPetHead();
      }
      
      private function showBackPack(param1:MouseEvent) : void
      {
         if(this.gc.curStage == 0 && this.gc.curLevel == 2 || this.gc.curStage == 16)
         {
            return;
         }
         if(this.hero.isDead())
         {
            this.gc.alert("您的角色已经死亡",2);
            return;
         }
         var _loc2_:BackPack = new BackPack();
         if(!this.gc.isStopGame)
         {
            _loc2_.setpack(this.rn);
            this.parent.addChild(_loc2_);
            MainGame.getInstance().stopGame();
         }
         else
         {
            this.gc.eventManger.dispatchEvent(new CommonEvent("closeBackpack"));
         }
      }
      
      private function setClick(param1:MouseEvent) : void
      {
         var _loc2_:SetMenu = AUtils.getNewObj("export.setmenu.SetMenu") as SetMenu;
         if(!this.gc.isStopGame)
         {
            this.parent.addChild(_loc2_);
            if(this.gc.isSingleGame())
            {
               MainGame.getInstance().stopGame();
            }
         }
         else
         {
            this.gc.eventManger.dispatchEvent(new CommonEvent("closesetmenu"));
         }
      }
      
      private function studySkill(param1:MouseEvent) : void
      {
         if(this.gc.curStage == 0 && this.gc.curLevel == 2)
         {
            return;
         }
         if(this.gc.isStopGame)
         {
            this.gc.eventManger.dispatchEvent(new CommonEvent("closeBuySkill",{"state":"gameing"}));
         }
         else
         {
            this.gc.eventManger.dispatchEvent(new CommonEvent("showBuySkill",{"state":"gameing"}));
            if(this.gc.isSingleGame())
            {
               MainGame.getInstance().stopGame();
            }
         }
      }
      
      private function fbClick(param1:MouseEvent) : void
      {
         var _loc2_:* = null;
         if(!this.gc.isStopGame)
         {
            if(this.gc.curStage == 0 && this.gc.curLevel == 2 || this.gc.curStage == 16)
            {
               return;
            }
            if(this.hero.isDead())
            {
               this.gc.alert("您的角色已经死亡",2);
               return;
            }
            if(this.hero.getPlayer().getCurEquipByType("zbfb") != null)
            {
               _loc2_ = AUtils.getNewObj("export.strength.SutraInterface") as SutraInterface;
               _loc2_.setRole(this.hero);
               this.parent.addChild(_loc2_);
            }
            else
            {
               this.gc.alert("您还未装备法宝",2);
            }
         }
         else
         {
            this.gc.eventManger.dispatchEvent(new CommonEvent("closefb"));
         }
      }
      
      private function cwClick(param1:MouseEvent) : void
      {
         var _loc2_:* = null;
         if(this.gc.curStage == 0 && this.gc.curLevel == 2 || this.gc.curStage == 16)
         {
            return;
         }
         if(!this.gc.isStopGame)
         {
            _loc2_ = new PetInterface(this.hero.getPlayer());
            this.parent.addChild(_loc2_);
            if(this.gc.isSingleGame())
            {
               MainGame.getInstance().stopGame();
            }
         }
         else
         {
            this.gc.eventManger.dispatchEvent(new CommonEvent("closePetInterface"));
         }
      }
      
      private function refreshShowSkill(param1:CommonEvent) : void
      {
         this.setSkillIcon();
      }
      
      public function addWs(param1:*) : void
      {
         var _loc2_:int = 0;
         var _loc3_:BaseHero = param1[1] as BaseHero;
         if(!_loc3_)
         {
            return;
         }
         _loc2_ = int(param1[0]);
         if(_loc2_ == 0)
         {
         }
         if(Number(getTimer()) - Number(this.lastaddws) < 99)
         {
            return;
         }
         if(!_loc3_.isGXP && _loc3_ == this.hero)
         {
            this.lastaddws = getTimer();
            if(this.getWsValue() + _loc2_ <= 100)
            {
               this.setWsValue(this.getWsValue() + _loc2_);
            }
            else
            {
               this.setWsValue(100);
            }
            if(this.isGXPReady())
            {
               this.shows.gotoAndStop(2);
            }
         }
      }
      
      private function lessWs() : void
      {
         var _loc1_:* = 0;
         if(this.getWsValue() >= 100)
         {
            return;
         }
         if(this.count >= this.gc.frameClips)
         {
            _loc1_ = this.getWsValue();
            if(_loc1_-- <= 0)
            {
               this.setWsValue(0);
            }
            else
            {
               this.setWsValue(_loc1_);
            }
            this.count = 0;
         }
         ++this.count;
      }
      
      public function addWarriors(param1:*) : void
      {
         if(param1[0] == this.hero)
         {
            if(!this.hero.isDead())
            {
               if(this.hero.roleProperies.getHHP() + param1[1] <= this.hero.roleProperies.getSHHP())
               {
                  this.hero.roleProperies.setHHP(this.hero.roleProperies.getHHP() + param1[1]);
               }
               else
               {
                  this.hero.roleProperies.setHHP(this.hero.roleProperies.getSHHP());
               }
            }
            if(this.hero.roleProperies.getMMP() + param1[2] <= this.hero.roleProperies.getSMMP())
            {
               this.hero.roleProperies.setMMP(this.hero.roleProperies.getMMP() + param1[2]);
            }
            else
            {
               this.hero.roleProperies.setMMP(this.hero.roleProperies.getSMMP());
            }
            this.hero.getPlayer().setLhValue(this.hero.getPlayer().getLhValue() + param1[3]);
            this.hero.getPlayer().setMyScore(this.hero.getPlayer().getMyScore() + param1[3]);
            if(this.getWsValue() + param1[4] <= 100)
            {
               this.setWsValue(this.getWsValue() + param1[4]);
            }
            else
            {
               this.setWsValue(100);
            }
            if(this.isGXPReady())
            {
               this.shows.gotoAndStop(2);
            }
         }
      }
      
      public function isGXPReady() : Boolean
      {
         return this.getWsValue() >= 100;
      }
      
      public function isGXPAlive() : Boolean
      {
         return this.getWsValue() > 0;
      }
      
      public function reduceGXP(param1:int) : void
      {
         this.setWsValue(this.getWsValue() - param1);
         if(this.getWsValue() < 0)
         {
            this.setWsValue(0);
         }
      }
      
      public function setWsValue(param1:int) : void
      {
         this.wsValue1 = int(AUtils.getRandomValue());
         this.wsValue2 = int(param1 - Number(this.wsValue1));
         this.wsValue3 = Number(this.enCodeValue(param1));
      }
      
      public function getWsValue() : int
      {
         var _loc1_:int = this.wsValue1 + this.wsValue2;
         if(_loc1_ != this.deCodeValue(this.wsValue3))
         {
            throw new Error("修改---WsValue");
         }
         return _loc1_;
      }
      
      private function enCodeValue(param1:int) : Number
      {
         return param1 / 10 - 5;
      }
      
      private function deCodeValue(param1:Number) : int
      {
         return Math.round((param1 + 5) * 10);
      }
   }
}

