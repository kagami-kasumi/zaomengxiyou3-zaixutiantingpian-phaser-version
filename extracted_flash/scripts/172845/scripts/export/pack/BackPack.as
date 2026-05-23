package export.pack
{
   import base.*;
   import config.*;
   import event.*;
   import flash.display.*;
   import flash.events.*;
   import flash.text.TextField;
   import my.*;
   import user.User;
   
   public class BackPack extends Sprite
   {
      
      private var gc:Config;
      
      private var headSprite:HeadSprite;
      
      public var headSit:Sprite;
      
      public var btn_close:SimpleButton;
      
      public var mc_exp:MovieClip;
      
      public var txt_name:TextField;
      
      public var txt_zdl:TextField;
      
      public var txt_hp:TextField;
      
      public var txt_mp:TextField;
      
      public var txt_att:TextField;
      
      public var txt_def:TextField;
      
      public var txt_baoji:TextField;
      
      public var txt_sb:TextField;
      
      public var txt_hx:TextField;
      
      public var txt_hl:TextField;
      
      public var txt_lh:TextField;
      
      public var txt_exp:TextField;
      
      public var txt_luck:TextField;
      
      public var txt_mdef:TextField;
      
      public var zbwq:Sprite;
      
      public var zbsp:Sprite;
      
      public var zbfj:Sprite;
      
      public var zbfb:Sprite;
      
      public var zbsz:Sprite;
      
      public var zbtx:Sprite;
      
      public var bpe:BackPackElement;
      
      public var prePage:SimpleButton;
      
      public var nextPage:SimpleButton;
      
      public var sellwhite:SimpleButton;
      
      public var showszmc:MovieClip;
      
      public var parentInterface:String = "";
      
      private var lastBtn:String = "";
      
      private var btnState:*;
      
      public var levelmc:Sprite;
      
      private var le:Sprite;
      
      private var packNum:uint = 1;
      
      private var hero:BaseHero;
      
      private var player:User;
      
      private var renewalse:Sprite;
      
      private var renewEquip:MyEquipObj;
      
      public var nowpage:TextField;
      
      public function BackPack()
      {
         this.le = new Sprite();
         super();
         this.gc = Config.getInstance();
         this.renewalse = AUtils.getNewObj("renewalseThisSZ") as Sprite;
         this.renewalse.name = "renewalseThisSZ";
         this.addEventListener(Event.ADDED_TO_STAGE,this.added,false,0,true);
         this.addEventListener(Event.REMOVED_FROM_STAGE,this.removed,false,0,true);
         this.txt_hp.selectable = false;
         this.txt_mp.selectable = false;
         this.txt_att.selectable = false;
         this.txt_def.selectable = false;
         this.txt_baoji.selectable = false;
         this.txt_sb.selectable = false;
         this.txt_hx.selectable = false;
         this.txt_hl.selectable = false;
         this.txt_lh.selectable = false;
         this.txt_luck.selectable = false;
         this.txt_mdef.selectable = false;
         this.txt_exp.selectable = false;
         this.txt_zdl.selectable = false;
      }
      
      public function getUser() : User
      {
         return this.player;
      }
      
      public function setpack(param1:uint) : void
      {
         this.packNum = param1;
         this.hero = this.gc["hero" + this.packNum] as BaseHero;
         this.player = this.hero.getPlayer();
      }
      
      public function setInfoTxt() : void
      {
         this.leveImage("levelnum",this.hero.roleProperies.getLevel(),26);
         if(this.hero.roleProperies.getLevel() >= AllConsts.GAME_ROLE_MAXLEVEL)
         {
            this.mc_exp.gotoAndStop(Math.round(30));
         }
         else
         {
            this.mc_exp.gotoAndStop(Math.round(30 * Number(this.hero.roleProperies.getExper()) / Number(this.hero.roleProperies.getExp())));
         }
         if(this.gc.myname)
         {
            this.txt_name.text = this.gc.myname;
         }
         else
         {
            this.txt_name.text = this.hero.roleName;
         }
         this.txt_zdl.text = this.getFightingForce(this.player) + "";
         this.txt_hp.text = this.hero.roleProperies.getHHP() + " / " + this.hero.roleProperies.getSHHP();
         this.txt_mp.text = this.hero.roleProperies.getMMP() + " / " + this.hero.roleProperies.getSMMP();
         if(this.hero.roleProperies.getLevel() >= AllConsts.GAME_ROLE_MAXLEVEL)
         {
            this.txt_exp.text = "MAX";
         }
         else
         {
            this.txt_exp.text = this.hero.roleProperies.getExper() + " / " + this.hero.roleProperies.getExp();
         }
         this.txt_att.text = String(this.hero.roleProperies.getTotalAtk());
         this.txt_mdef.text = this.hero.roleProperies.getMagicDef() + " %";
         this.txt_luck.text = this.hero.roleProperies.getDeephit() + " %";
         this.txt_baoji.text = this.hero.roleProperies.getTotalCrit() + " %";
         this.txt_def.text = Math.round(this.hero.roleProperies.getTotalDefense()) + "";
         this.txt_sb.text = this.hero.roleProperies.getTotalMiss() + " %";
         this.txt_hx.text = this.hero.roleProperies.getHx() + "";
         this.txt_hl.text = this.hero.roleProperies.getHl() + "";
         this.txt_lh.text = this.hero.getPlayer().getLhValue() + "";
      }
      
      private function added(param1:Event) : void
      {
         this.mc_exp.stop();
         this.setInfoTxt();
         var _loc2_:Object = this.player.getEquipNum();
         this.headSprite = new HeadSprite(this.player.roleid,_loc2_.zbfj,_loc2_.zbwq,_loc2_.zbtx);
         this.headSprite.name = "headSprite";
         this.headSit.addChild(this.headSprite);
         this.btn_close.addEventListener(MouseEvent.CLICK,this.close);
         this.txt_name.addEventListener(FocusEvent.FOCUS_OUT,this.changename);
         this.zbsz.addEventListener(MouseEvent.CLICK,this.szClick);
         this.zbtx.addEventListener(MouseEvent.CLICK,this.szClick);
         this.zbwq.addEventListener(MouseEvent.CLICK,this.szClick);
         this.zbfj.addEventListener(MouseEvent.CLICK,this.szClick);
         this.zbsp.addEventListener(MouseEvent.CLICK,this.szClick);
         this.zbfb.addEventListener(MouseEvent.CLICK,this.szClick);
         this.prePage.addEventListener(MouseEvent.CLICK,this.prePageClick);
         this.nextPage.addEventListener(MouseEvent.CLICK,this.nextPageClick);
         this.prePage.dispatchEvent(new MouseEvent(MouseEvent.CLICK));
         this.sellwhite.addEventListener(MouseEvent.CLICK,this.deleteWhiteEquipment);
         this.showszmc.addEventListener(MouseEvent.CLICK,this.showSZClick);
         this.gc.eventManger.addEventListener("ISNOTENOUGH",this.isNotEnough);
         this.gc.eventManger.addEventListener("USETRANSFERSTONE",this.useTransferStone);
         this.gc.eventManger.addEventListener("closeBackpack",this.__closeBackpack);
         this.curequip();
         this.changeShowFashionMc();
      }
      
      private function removed(param1:Event) : void
      {
         this.btn_close.removeEventListener(MouseEvent.CLICK,this.close);
         this.txt_name.removeEventListener(FocusEvent.FOCUS_OUT,this.changename);
         this.zbsz.removeEventListener(MouseEvent.CLICK,this.szClick);
         this.zbtx.removeEventListener(MouseEvent.CLICK,this.szClick);
         this.zbwq.removeEventListener(MouseEvent.CLICK,this.szClick);
         this.zbfj.removeEventListener(MouseEvent.CLICK,this.szClick);
         this.zbsp.removeEventListener(MouseEvent.CLICK,this.szClick);
         this.zbfb.removeEventListener(MouseEvent.CLICK,this.szClick);
         this.prePage.removeEventListener(MouseEvent.CLICK,this.prePageClick);
         this.nextPage.removeEventListener(MouseEvent.CLICK,this.nextPageClick);
         this.sellwhite.removeEventListener(MouseEvent.CLICK,this.deleteWhiteEquipment);
         this.showszmc.removeEventListener(MouseEvent.CLICK,this.showSZClick);
         this.gc.eventManger.removeEventListener("ISNOTENOUGH",this.isNotEnough);
         this.gc.eventManger.removeEventListener("USETRANSFERSTONE",this.useTransferStone);
         this.gc.eventManger.removeEventListener("closeBackpack",this.__closeBackpack);
         this.headSit.removeChild(this.headSprite);
         if(this.headSprite)
         {
            this.headSprite.destroy();
            this.headSprite = null;
         }
         this.hero = null;
         if(this.gc.isSingleGame())
         {
            MainGame.getInstance().continueGame();
         }
         this.btnState = null;
      }
      
      private function getFightingForce(param1:User) : int
      {
         var _loc2_:Array = null;
         var _loc3_:* = undefined;
         var _loc4_:* = 0;
         var _loc5_:int = 0;
         var _loc6_:int = 0;
         var _loc7_:int = 0;
         var _loc8_:int = 0;
         var _loc9_:int = 0;
         var _loc10_:int = 0;
         _loc10_ = int(_loc10_ + param1.getCurLevel() * 15);
         _loc2_ = param1.ispassiveskill;
         var _loc11_:* = int(_loc2_.length);
         while(_loc11_-- > 0)
         {
            _loc4_ = uint(_loc2_[_loc11_]);
            if(_loc4_ == 0)
            {
               continue;
            }
            switch(int(_loc11_))
            {
               case 0:
                  _loc5_ = _loc4_ * 100 + 100;
                  _loc10_ = int(_loc10_ + _loc5_ * 0.1);
                  break;
               case 1:
                  _loc6_ = _loc4_ * 100 + 100;
                  _loc10_ = int(_loc10_ + _loc6_ * 0.1);
                  break;
               case 2:
                  _loc7_ = _loc4_ + 1;
                  _loc10_ = int(_loc10_ + _loc7_ * 10);
                  break;
               case 3:
                  _loc8_ = _loc4_ + 1;
                  _loc10_ = int(_loc10_ + _loc8_ * 15);
                  break;
               case 4:
                  _loc9_ = _loc4_ + 1;
                  _loc10_ = int(_loc10_ + _loc9_ * 15);
            }
         }
         var _loc12_:int = 0;
         var _loc13_:int = 0;
         var _loc14_:* = 0;
         var _loc15_:* = 0;
         var _loc16_:* = 0;
         var _loc17_:* = 0;
         var _loc18_:* = param1.curarray;
         var _loc19_:* = 0;
         var _loc20_:* = 0;
         for each(_loc3_ in param1.curarray)
         {
            _loc12_ = int(_loc12_ + _loc3_.geteatt() * 1.15);
            _loc13_ = int(_loc13_ + Number(_loc3_.getecrit()) * 100);
            _loc14_ = int(_loc14_ + _loc3_.geteahp * 120);
            _loc15_ = int(_loc15_ + _loc3_.geteamp * 160);
            _loc16_ = int(_loc16_ + Number(_loc3_.getmagicdef()) * 150);
            _loc17_ = int(_loc17_ + Number(_loc3_.getemiss()) * 150);
            _loc19_ = int(_loc19_ + int(_loc3_.gethaveblood()) * 10);
         }
         _loc10_ = int(uint(_loc10_ + _loc12_));
         if(param1.roleid == 1)
         {
            if(param1.findSkillIsInTheSkillAry("sx"))
            {
               _loc10_ = int(_loc10_ + (5 + _loc13_) * 25);
               _loc10_ = int(_loc10_ + _loc15_ * 1);
               _loc10_ = int(_loc10_ + _loc14_ * 1);
            }
            else
            {
               _loc10_ = int(_loc10_ + _loc15_ * 1);
               _loc10_ = int(_loc10_ + _loc14_ * 1);
               _loc10_ = int(_loc10_ + _loc13_ * 25);
            }
         }
         else if(param1.roleid == 2)
         {
            _loc10_ = int(_loc10_ + _loc15_ * 4.5);
            _loc10_ = int(_loc10_ + _loc13_ * 30);
            _loc10_ = int(_loc10_ + _loc14_ * 1);
         }
         else if(param1.roleid == 3)
         {
            _loc10_ = int(_loc10_ + _loc14_ * 3);
            _loc10_ = int(_loc10_ + _loc16_ * 8);
            _loc10_ = int(_loc10_ + _loc13_ * 10);
            _loc10_ = int(_loc10_ + _loc15_ * 1);
         }
         else if(param1.roleid == 4)
         {
            _loc10_ = int(_loc10_ + _loc13_ * 20);
            _loc10_ = int(_loc10_ + _loc17_ * 20);
            _loc10_ = int(_loc10_ + _loc15_ * 1);
            _loc10_ = int(_loc10_ + _loc14_ * 1);
         }
         else if(param1.roleid == 5)
         {
            _loc10_ = int(_loc10_ + _loc15_ * 1);
            _loc10_ = int(_loc10_ + _loc14_ * 1);
            _loc10_ = int(_loc10_ + _loc12_ * 0.2);
            _loc10_ = int(_loc10_ + _loc13_ * 20);
         }
         return _loc10_ + _loc19_;
      }
      
      private function changename(param1:Event) : *
      {
         this.gc.myname = this.txt_name.text;
         this.gc.alert("昵称修改成功！");
      }
      
      private function useTransferStone(param1:Event) : void
      {
         this.close(null);
         MainGame.getInstance().destroyGame();
         this.gc.eventManger.dispatchEvent(new Event("ReStart"));
      }
      
      private function prePageClick(param1:MouseEvent) : void
      {
         if(this.bpe)
         {
            this.bpe.setCurPage(-1);
         }
         this.nowpage.text = String(this.bpe.curPage);
      }
      
      private function nextPageClick(param1:MouseEvent) : void
      {
         if(this.bpe)
         {
            this.bpe.setCurPage(1);
         }
         this.nowpage.text = String(this.bpe.curPage);
      }
      
      private function deleteWhiteEquipment(param1:MouseEvent) : void
      {
         var _loc2_:* = null;
         var _loc3_:uint = uint(this.player.zblist.length);
         while(_loc3_-- > 0)
         {
            if(this.player.zblist[_loc3_])
            {
               _loc2_ = this.player.zblist[_loc3_];
               if(_loc2_.quality == "普 通" && _loc2_.type != "zbtx")
               {
                  this.player.zblist.splice(_loc3_,1);
                  this.player.setLhValue(this.player.getLhValue() + 20);
               }
            }
         }
         this.gc.eventManger.dispatchEvent(new CommonEvent("GETANDREFRESHBACKPACKAGE"));
         this.setInfoTxt();
      }
      
      private function showSZClick(param1:MouseEvent) : void
      {
         if(this.player)
         {
            if(this.player.isshowfashion == true || this.player.isshowfashion == "true")
            {
               this.player.isshowfashion = false;
            }
            else
            {
               this.player.isshowfashion = true;
            }
            this.changeShowFashionMc();
            this.hero.changeEquip(this.player.getEquipNum());
            this.headSprite.refreshEquip(this.player.getEquipNum().zbfj,this.player.getEquipNum().zbwq,this.player.getEquipNum().zbtx);
            this.setInfoTxt();
         }
      }
      
      private function changeShowFashionMc() : void
      {
         if(this.player.isshowfashion == true || this.player.isshowfashion == "true")
         {
            this.showszmc.gotoAndStop(2);
         }
         else
         {
            this.showszmc.gotoAndStop(1);
         }
      }
      
      private function leveImage(param1:String, param2:int, param3:int) : *
      {
         var _loc4_:* = undefined;
         var _loc5_:* = undefined;
         var _loc6_:* = 0;
         if(this.getChildByName("le"))
         {
            this.levelmc.removeChild(this.getChildByName("le"));
         }
         if(String(param2).length == 1)
         {
            _loc4_ = AUtils.getImageObj(param1 + param2);
            _loc4_.x = 21.8;
            _loc4_.y = 13;
            this.le.addChild(_loc4_);
         }
         else
         {
            _loc5_ = 0;
            while(_loc5_ < String(param2).length)
            {
               _loc6_ = uint(int(String(param2).charAt(_loc5_)));
               _loc4_ = AUtils.getImageObj(param1 + _loc6_);
               _loc4_.x = 5.8 + _loc5_ * param3;
               _loc4_.y = 13;
               this.le.addChild(_loc4_);
               _loc5_++;
            }
         }
         this.le.name = "le";
         this.levelmc.addChild(this.le);
      }
      
      private function isNotEnough(param1:CommonEvent) : void
      {
         this.gc.alert("数量不够");
      }
      
      private function szClick(param1:MouseEvent) : void
      {
         var _loc2_:int = 0;
         var _loc3_:* = param1.currentTarget.getChildByName("curzb") as ShowObj;
         if(_loc3_)
         {
            if(param1.currentTarget.name == "zbfb")
            {
               if(this.hero.getCurMagicWeapon().isUsing())
               {
                  this.gc.ts.setTxt("当前法宝正在使用");
                  this.gc.stage.addChild(this.gc.ts);
                  return;
               }
            }
            param1.currentTarget.removeChild(_loc3_);
            _loc2_ = int(this.player.curarray.indexOf(_loc3_.getMyEquipObj()));
            this.player.curarray.splice(_loc2_,1);
            this.hero.roleProperies.removeEquip(_loc3_.getMyEquipObj());
            if(_loc3_.getMyEquipObj().type == "zbcb" || _loc3_.getMyEquipObj().type == "zbsz")
            {
               this.player.szlist.push(_loc3_.getMyEquipObj());
            }
            else
            {
               this.player.zblist.push(_loc3_.getMyEquipObj());
            }
            this.curequip();
            if(_loc3_.getMyEquipObj().type == "zbfb")
            {
               this.hero.changeMagicWeapon();
            }
            _loc3_ = null;
            this.gc.eventManger.dispatchEvent(new CommonEvent("GETANDREFRESHBACKPACKAGE"));
         }
      }
      
      private function __closeBackpack(param1:CommonEvent) : void
      {
         this.close(null);
      }
      
      private function close(param1:*) : void
      {
         MainGame.getInstance().continueGame();
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
      }
      
      public function equip(param1:String, param2:MyEquipObj) : *
      {
         var _loc3_:* = null;
         var _loc4_:int = 0;
         if(param2.type == "zbcb")
         {
            return;
         }
         if(this[param1].getChildByName("curzb") != null)
         {
            _loc3_ = this[param1].getChildByName("curzb");
            this[param1].removeChild(_loc3_);
            this.hero.roleProperies.removeEquip(_loc3_.getMyEquipObj());
            _loc4_ = int(this.player.curarray.indexOf(_loc3_.getMyEquipObj()));
            this.player.curarray.splice(_loc4_,1);
            if(_loc3_.getMyEquipObj().type == "zbsz" || _loc3_.getMyEquipObj().type == "zbcb")
            {
               this.player.szlist.push(_loc3_.getMyEquipObj());
            }
            else
            {
               this.player.zblist.push(_loc3_.getMyEquipObj());
            }
            _loc3_ = null;
            this.gc.eventManger.dispatchEvent(new CommonEvent("GETANDREFRESHBACKPACKAGE"));
         }
         this.player.curarray.push(param2);
         this.hero.roleProperies.addEquip(param2);
         this.curequip();
         if(param2.type == "zbfb")
         {
            this.hero.changeMagicWeapon();
         }
      }
      
      private function curequip() : void
      {
         var _loc1_:* = null;
         var _loc2_:uint = uint(this.player.curarray.length);
         while(_loc2_-- > 0)
         {
            _loc1_ = new ShowObj(this.player.curarray[_loc2_]);
            _loc1_.y = -2;
            if(this[this.player.curarray[_loc2_].type].numChildren <= 1)
            {
               this[this.player.curarray[_loc2_].type].addChild(_loc1_);
            }
         }
         this.hero.changeEquip(this.player.getEquipNum());
         this.headSprite.refreshEquip(this.player.getEquipNum().zbfj,this.player.getEquipNum().zbwq,this.player.getEquipNum().zbtx);
         this.setInfoTxt();
      }
      
      public function addRenewalseMask(param1:MyEquipObj, param2:String) : void
      {
         this.renewEquip = param1;
         if(param1.getFillName() == "ptsmsrsz" || param1.getFillName() == "yxsmsrsz" || param1.getFillName() == "jlsmsrsz" || param1.getFillName() == "sssmsrsz")
         {
            this.renewalse["txt"].text = "您确定花100点券续费" + param2 + "吗?";
         }
         else
         {
            this.renewalse["txt"].text = "您确定花500点券续费" + param2 + "吗?";
         }
         this.addChild(this.renewalse);
         this.renewalse["okbtn"].addEventListener(MouseEvent.CLICK,this.renewalseOk);
         this.renewalse["nobtn"].addEventListener(MouseEvent.CLICK,this.renewalseChange);
      }
      
      private function renewalseOk(param1:MouseEvent) : void
      {
         this.renewalse["okbtn"].removeEventListener(MouseEvent.CLICK,this.renewalseOk);
         this.renewalse["nobtn"].removeEventListener(MouseEvent.CLICK,this.renewalseChange);
         this.gc.renewalseEquip(this.player.getControlPlayer() + 1,this.renewEquip);
         if(Boolean(this.renewalse) && this.contains(this.renewalse))
         {
            this.removeChild(this.renewalse);
         }
      }
      
      private function renewalseChange(param1:MouseEvent) : void
      {
         this.renewalse["okbtn"].removeEventListener(MouseEvent.CLICK,this.renewalseOk);
         this.renewalse["nobtn"].removeEventListener(MouseEvent.CLICK,this.renewalseChange);
         if(Boolean(this.renewalse) && this.contains(this.renewalse))
         {
            this.removeChild(this.renewalse);
         }
      }
   }
}

