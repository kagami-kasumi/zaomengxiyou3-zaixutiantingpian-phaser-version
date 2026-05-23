package export.huodong
{
   import config.*;
   import event.*;
   import flash.display.*;
   import flash.events.*;
   import flash.text.TextField;
   import my.*;
   import petInfo.*;
   import user.User;
   
   public class ESShopThing extends Sprite
   {
      
      private var gc:Config;
      
      private var renewalse:Sprite;
      
      public var btn_buy:SimpleButton;
      
      public var txt_name:TextField;
      
      public var txt_price:TextField;
      
      private var curObj:Object;
      
      private var player:User;
      
      public function ESShopThing()
      {
         this.curObj = {};
         super();
         this.gc = Config.getInstance();
         this.renewalse = AUtils.getNewObj("renewalseThisSZ") as Sprite;
         this.renewalse.name = "renewalseThisSZ";
         this.addEventListener(Event.ADDED_TO_STAGE,this.added,false,0,true);
         this.addEventListener(Event.REMOVED_FROM_STAGE,this.removed,false,0,true);
      }
      
      private function added(param1:Event) : void
      {
         this.btn_buy.addEventListener(MouseEvent.CLICK,this.buyClick);
      }
      
      private function removed(param1:Event) : void
      {
         this.btn_buy.removeEventListener(MouseEvent.CLICK,this.buyClick);
      }
      
      public function setEquipment(param1:Object) : void
      {
         this.curObj = param1;
         this.txt_name.text = param1.cname + " ";
         this.txt_price.text = param1.score + "积分";
      }
      
      public function setScore(param1:int) : void
      {
         this.curObj.score = param1;
         this.txt_price.text = param1 + "积分";
      }
      
      public function setImg(param1:String) : void
      {
         this.curObj.img = param1;
         var _loc2_:Sprite = AUtils.getImageSprite(param1);
         _loc2_.name = "score_show_image";
         _loc2_.x = 15;
         _loc2_.y = 20;
         this.addChild(_loc2_);
      }
      
      public function clearEquipment() : void
      {
         if(this.getChildByName("score_show_image") != null)
         {
            this.removeChild(this.getChildByName("score_show_image"));
         }
      }
      
      private function buyClick(param1:MouseEvent) : void
      {
         if(this.player == null)
         {
            this.gc.ts.setTxt("请选择要购买的角色");
            this.gc.stage.addChild(this.gc.ts);
            return;
         }
         this.addRenewalseMask("您确定要花费" + this.curObj.score + "点积分?");
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
         this.renewalse["okbtn"].removeEventListener(MouseEvent.CLICK,this.renewalseOk);
         this.renewalse["nobtn"].removeEventListener(MouseEvent.CLICK,this.renewalseChange);
         var _loc2_:Boolean = true;
         if(this.gc.Objectdata.canplayturntable == false)
         {
            _loc2_ = false;
         }
         if(this.gc.Objectdata.turntableScore < this.curObj.score)
         {
            this.gc.ts.setTxt("积分不足");
            this.gc.stage.addChild(this.gc.ts);
            _loc2_ = false;
         }
         if(_loc2_)
         {
            this.exchangeFinish();
         }
         if(Boolean(this.renewalse) && GMain.getInstance().getMainSence().contains(this.renewalse))
         {
            GMain.getInstance().getMainSence().removeChild(this.renewalse);
         }
      }
      
      private function renewalseChange(param1:MouseEvent) : void
      {
         this.renewalse["okbtn"].removeEventListener(MouseEvent.CLICK,this.renewalseOk);
         this.renewalse["nobtn"].removeEventListener(MouseEvent.CLICK,this.renewalseChange);
         if(Boolean(this.renewalse) && GMain.getInstance().getMainSence().contains(this.renewalse))
         {
            GMain.getInstance().getMainSence().removeChild(this.renewalse);
         }
      }
      
      private function exchangeFinish() : void
      {
         var _loc1_:* = undefined;
         var _loc2_:Array = String(this.curObj.img).split("_");
         if(_loc2_[1] == "exp")
         {
            return;
         }
         if(_loc2_[1] == "cw")
         {
            if(this.player.petsAry.length >= AllConsts.GAME_PET_MAXSEATS)
            {
               this.gc.ts.setTxt("玩家宠物栏已满!");
               this.gc.stage.addChild(this.gc.ts);
               return;
            }
            this.cwExchange(_loc2_[2]);
         }
         else
         {
            _loc1_ = this.gc.allEquip.findByName(_loc2_[1]);
            if(_loc1_ != null)
            {
               if(_loc1_.type == "zbwp" || _loc1_.type == "wpqhs")
               {
                  this.gc.putQhsInBackPack(this.player,_loc2_[1],int(_loc2_[2]));
               }
               else if(_loc1_.type == "zbsz")
               {
                  _loc1_.setFashionTime(this.gc.curdate);
                  this.player.szlist.push(_loc1_);
               }
               else if(_loc1_.getFillName() == "qljfb")
               {
                  _loc1_.setEupdata(Number((1.6 + Math.random() * 0.8).toFixed(1)));
                  _loc1_.setWX(true,true,true,true,true);
                  this.player.zblist.push(_loc1_);
               }
               else if(_loc1_.getFillName() == "mdhf")
               {
                  _loc1_.setWX(true,true,true,true,true);
                  this.player.zblist.push(_loc1_);
               }
               else if(_loc1_.getFillName() == "jyhl")
               {
                  _loc1_.setWX(true,true,true,true,true);
                  this.player.zblist.push(_loc1_);
               }
               else if(_loc1_.getFillName() == "stlp")
               {
                  this.player.zblist.push(_loc1_);
               }
            }
         }
         this.gc.ts.setTxt("兑换成功");
         this.gc.stage.addChild(this.gc.ts);
         this.gc.Objectdata.turntableScore -= this.curObj.score;
         this.gc.eventManger.dispatchEvent(new CommonEvent("ExchangeShopSuccess"));
      }
      
      private function cwExchange(param1:String) : void
      {
         var _loc2_:PetInfo = new PetInfo();
         if(param1 == "huwan")
         {
            _loc2_.setPetNameAndLevel("tigress1",1);
            _loc2_.setperception(7);
            _loc2_.setwarpower(8);
            _loc2_.settechnique(8);
            _loc2_.sethpQuality(1300);
            _loc2_.setmpQuality(1040);
            _loc2_.setatkQuality(1300);
            _loc2_.setdefQuality(520);
            _loc2_.setHp(500);
            _loc2_.setMp(150);
            _loc2_.setAtk(30);
            _loc2_.setDef(8);
         }
         else if(param1 == "guibu")
         {
            _loc2_.setPetNameAndLevel("turtle1",1);
            _loc2_.setperception(7);
            _loc2_.setwarpower(8);
            _loc2_.settechnique(8);
            _loc2_.sethpQuality(1560);
            _loc2_.setmpQuality(910);
            _loc2_.setatkQuality(1170);
            _loc2_.setdefQuality(611);
            _loc2_.setHp(600);
            _loc2_.setMp(150);
            _loc2_.setAtk(25);
            _loc2_.setDef(10);
         }
         else if(param1 == "quedan")
         {
            _loc2_.setPetNameAndLevel("phoenix1",1);
            _loc2_.setperception(7);
            _loc2_.setwarpower(8);
            _loc2_.settechnique(8);
            _loc2_.sethpQuality(1170);
            _loc2_.setmpQuality(1170);
            _loc2_.setatkQuality(1300);
            _loc2_.setdefQuality(520);
            _loc2_.setHp(450);
            _loc2_.setMp(200);
            _loc2_.setAtk(32);
            _loc2_.setDef(6);
         }
         else if(param1 == "huowan")
         {
            _loc2_.setPetNameAndLevel("monkey1",1);
            _loc2_.setperception(7);
            _loc2_.setwarpower(8);
            _loc2_.settechnique(8);
            _loc2_.sethpQuality(1040);
            _loc2_.setmpQuality(1040);
            _loc2_.setatkQuality(1040);
            _loc2_.setdefQuality(520);
            _loc2_.setHp(200);
            _loc2_.setMp(150);
            _loc2_.setAtk(20);
            _loc2_.setDef(6);
         }
         else if(param1 == "xueqiu")
         {
            _loc2_.setPetNameAndLevel("horse1",1);
            _loc2_.setperception(7);
            _loc2_.setwarpower(8);
            _loc2_.settechnique(8);
            _loc2_.sethpQuality(949);
            _loc2_.setmpQuality(1222);
            _loc2_.setatkQuality(1105);
            _loc2_.setdefQuality(520);
            _loc2_.setHp(150);
            _loc2_.setMp(250);
            _loc2_.setAtk(25);
            _loc2_.setDef(6);
         }
         else if(param1 == "longzai")
         {
            _loc2_.setPetNameAndLevel("dragon1",1);
            _loc2_.setperception(7);
            _loc2_.setwarpower(8);
            _loc2_.settechnique(8);
            _loc2_.sethpQuality(1400);
            _loc2_.setmpQuality(700);
            _loc2_.setatkQuality(1400);
            _loc2_.setdefQuality(500);
            _loc2_.setHp(300);
            _loc2_.setMp(175);
            _loc2_.setAtk(25);
            _loc2_.setDef(5);
         }
         else if(param1 == "zishu")
         {
            _loc2_.setPetNameAndLevel("mouse1",1);
            _loc2_.setperception(3 + Math.ceil(Math.random() * 4));
            _loc2_.setwarpower(4 + Math.ceil(Math.random() * 4));
            _loc2_.settechnique(4 + Math.ceil(Math.random() * 4));
            _loc2_.sethpQuality(1300 + Math.ceil(Math.random() * 350));
            _loc2_.setmpQuality(200 + Math.ceil(Math.random() * 50));
            _loc2_.setatkQuality(1200 + Math.ceil(Math.random() * 350));
            _loc2_.setdefQuality(200 + Math.ceil(Math.random() * 100));
            _loc2_.setHp(450);
            _loc2_.setMp(200);
            _loc2_.setAtk(32);
            _loc2_.setDef(6);
         }
         else if(param1 == "yuetu")
         {
            _loc2_.setPetNameAndLevel("rabbit1",1);
            _loc2_.setperception(3 + Math.ceil(Math.random() * 4));
            _loc2_.setwarpower(4 + Math.ceil(Math.random() * 4));
            _loc2_.settechnique(4 + Math.ceil(Math.random() * 4));
            _loc2_.sethpQuality((1000 + Math.round(Math.random() * 100)) * 1.3);
            _loc2_.setmpQuality((700 + Math.round(Math.random() * 200)) * 1.3);
            _loc2_.setatkQuality((900 + Math.round(Math.random() * 200)) * 1.3);
            _loc2_.setdefQuality((350 + Math.round(Math.random() * 50)) * 1.3);
            _loc2_.setHp(840);
            _loc2_.setMp(200);
            _loc2_.setAtk(30);
            _loc2_.setDef(6);
         }
         _loc2_.setSHp(_loc2_.getHp());
         _loc2_.setSMp(_loc2_.getMp());
         this.player.petsAry.push(_loc2_);
      }
      
      public function setPlayer(param1:User) : void
      {
         this.player = param1;
      }
   }
}

