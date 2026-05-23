package export.pack
{
   import flash.display.*;
   import flash.events.*;
   import flash.filters.*;
   import flash.text.*;
   import my.*;
   
   public class AttributeCon extends Sprite
   {
      
      private var attributeObj:MyEquipObj;
      
      private var bg:Sprite;
      
      private var info:Sprite;
      
      private var i:uint = 0;
      
      private var bigw:uint = 0;
      
      public function AttributeCon(param1:MyEquipObj)
      {
         this.bg = new Sprite();
         this.info = new Sprite();
         super();
         this.attributeObj = param1;
         this.addEventListener(Event.ADDED_TO_STAGE,this.added,false,0,true);
         this.addEventListener(Event.REMOVED_FROM_STAGE,this.removed,false,0,true);
      }
      
      private function added(param1:Event) : void
      {
         this.drawInfo();
         this.drawbg();
         if(this.getChildIndex(this.bg) > this.getChildIndex(this.info))
         {
            this.swapChildren(this.bg,this.info);
         }
      }
      
      private function removed(param1:Event) : void
      {
      }
      
      private function drawInfo() : void
      {
         this.addChild(this.info);
         this.info.x = 20;
         this.info.y = 10;
         var _loc1_:TextFormat = new TextFormat();
         var _loc2_:TextField = new TextField();
         _loc2_.embedFonts = true;
         _loc1_.font = AllConsts.GAME_CONFIG_FONT;
         _loc1_.color = this.attributeObj.color;
         _loc1_.size = 16;
         if(this.attributeObj.getStrengthValue() == 0)
         {
            _loc2_.text = this.attributeObj.ename;
         }
         else
         {
            _loc2_.text = this.attributeObj.ename + "(+" + this.attributeObj.getStrengthValue() + ")";
         }
         _loc2_.setTextFormat(_loc1_);
         _loc2_.height = 25;
         _loc2_.width = _loc2_.textWidth + 10;
         ++this.i;
         if(this.attributeObj.quality != "")
         {
            this.drawpz("品质",this.attributeObj.color,this.attributeObj.quality);
         }
         if(this.attributeObj.user != "")
         {
            this.drawpz("类型",16777215,this.attributeObj.etype + "·" + this.attributeObj.user);
         }
         else
         {
            this.drawpz("类型",16777215,this.attributeObj.etype);
         }
         if(this.attributeObj.type == "zbfb")
         {
            if(this.attributeObj.getELevel() != 0)
            {
               this.drawpz("等级",16777215,"Lv." + this.attributeObj.getELevel());
            }
         }
         if(this.attributeObj.getEUpdata() != 0)
         {
            this.drawpz("成长率",16777215,this.attributeObj.getEUpdata() + "");
         }
         if(this.attributeObj.getWX() != "")
         {
            this.drawpz("五行",16777215,this.attributeObj.getWX());
         }
         this.drawAttribute();
         this.drawInstruction();
         this.drawValue();
         this.info.addChild(_loc2_);
      }
      
      private function drawpz(param1:String, param2:*, param3:String) : void
      {
         var _loc4_:TextField = null;
         var _loc5_:Sprite = null;
         var _loc6_:TextField = null;
         var _loc7_:TextFormat = new TextFormat();
         _loc4_ = new TextField();
         _loc4_.embedFonts = true;
         _loc7_.font = AllConsts.GAME_CONFIG_FONT;
         _loc7_.color = 0;
         _loc7_.size = 16;
         _loc7_.bold = true;
         _loc4_.filters = [this.GlowEffect()];
         _loc4_.text = param1;
         _loc4_.setTextFormat(_loc7_);
         _loc4_.y = Number(this.i) * 25;
         _loc4_.height = 25;
         _loc4_.width = _loc4_.textWidth + 10;
         if(this.bigw < _loc4_.width)
         {
            this.bigw = uint(uint(uint(_loc4_.width)));
         }
         this.info.addChild(_loc4_);
         _loc5_ = new Sprite();
         _loc5_.x = _loc4_.x + _loc4_.width - 4;
         _loc5_.y = _loc4_.y + _loc4_.height - 6;
         _loc5_.graphics.lineStyle(2,16777215);
         _loc5_.graphics.lineGradientStyle(GradientType.LINEAR,[16777215,16777215],[1,0],[2 * 60,255]);
         _loc5_.graphics.moveTo(0,0);
         _loc5_.graphics.lineTo(80,0);
         this.info.addChild(_loc5_);
         var _loc8_:TextFormat = new TextFormat();
         _loc6_ = new TextField();
         _loc6_.embedFonts = true;
         _loc8_.font = AllConsts.GAME_CONFIG_FONT;
         _loc8_.color = param2;
         _loc8_.size = 16;
         _loc6_.text = "  " + param3;
         _loc6_.setTextFormat(_loc8_);
         _loc6_.x = _loc4_.x + _loc4_.width;
         --_loc4_.y;
         _loc6_.height = 25;
         _loc6_.width = _loc6_.textWidth + 10;
         if(this.bigw < _loc6_.width)
         {
            this.bigw = uint(uint(uint(_loc6_.width)));
         }
         this.info.addChild(_loc6_);
         ++this.i;
      }
      
      private function drawAttribute() : void
      {
         if(this.attributeObj.getFillName() != "t" && this.attributeObj.getFillName() != "c" && this.attributeObj.getFillName() != "ch")
         {
            if(int(this.attributeObj.getehp(false)) != 0)
            {
               this.drawSimpleAttribute("生命",int(this.attributeObj.getehp(true)),this.attributeObj.getShpValue());
            }
            if(int(this.attributeObj.getemp(false)) != 0)
            {
               this.drawSimpleAttribute("魔法",int(this.attributeObj.getemp(true)),this.attributeObj.getSmpValue());
            }
            if(int(this.attributeObj.geteatt(false)) != 0)
            {
               this.drawSimpleAttribute("攻击",int(this.attributeObj.geteatt(true)),this.attributeObj.getSatkValue());
            }
            if(int(this.attributeObj.getedef(false)) != 0)
            {
               this.drawSimpleAttribute("防御",int(this.attributeObj.getedef(true)),this.attributeObj.getSdefValue());
            }
            if(int(Number(this.attributeObj.getecrit(false)) * 100) != 0)
            {
               this.drawSimpleAttribute("暴击",AUtils.changeNumber(Number(Number(this.attributeObj.getecrit(true)) * 100),2) + "%",AUtils.changeNumber(Number(this.attributeObj.getScritValue()) * 100,2));
               trace("暴击:" + this.attributeObj.getecrit(true));
               trace("强化暴击:" + this.attributeObj.getScritValue() * 100);
            }
            if(int(Number(this.attributeObj.getemiss(false)) * 100) != 0)
            {
               this.drawSimpleAttribute("闪避",AUtils.changeNumber(Number(Number(this.attributeObj.getemiss(true)) * 100),2) + "%",AUtils.changeNumber(Number(this.attributeObj.getSmissValue()) * 100,2));
            }
            if(int(this.attributeObj.geteahp(false)) != 0)
            {
               this.drawSimpleAttribute("回血",int(this.attributeObj.geteahp(true)),this.attributeObj.getSehpValue());
            }
            if(int(this.attributeObj.geteamp(false)) != 0)
            {
               this.drawSimpleAttribute("回魔",int(this.attributeObj.geteamp(true)),this.attributeObj.getSempValue());
            }
            if(int(Number(this.attributeObj.getmagicdef(false)) * 100) != 0)
            {
               this.drawSimpleAttribute("魔抗",AUtils.changeNumber(Number(Number(this.attributeObj.getmagicdef(true)) * 100),2) + "%",AUtils.changeNumber(Number(this.attributeObj.getSmdefValue()) * 100,2));
            }
            if(int(Number(this.attributeObj.getdeephit(false)) * 100) != 0)
            {
               this.drawSimpleAttribute("命中",AUtils.changeNumber(Number(Number(this.attributeObj.getdeephit(true)) * 100),2) + "%",AUtils.changeNumber(Number(this.attributeObj.getSdhitValue()) * 100,2));
            }
            if(int(this.attributeObj.gethaveblood(false)) != 0)
            {
               this.drawSimpleAttribute("泣血",int(this.attributeObj.gethaveblood(true)),this.attributeObj.getShbdValue());
            }
         }
      }
      
      private function drawSimpleAttribute(param1:String, param2:*, param3:int = 0, param4:uint = 0) : void
      {
         var _loc5_:TextFormat = null;
         var _loc6_:TextField = null;
         _loc5_ = new TextFormat();
         _loc5_.font = AllConsts.GAME_CONFIG_FONT;
         _loc5_.color = 16750899;
         _loc5_.size = 16;
         _loc5_.bold = true;
         _loc6_ = new TextField();
         _loc6_.embedFonts = true;
         if(param3 == 0)
         {
            _loc6_.text = param1 + "： " + param2;
         }
         else if(param3 > 0)
         {
            _loc6_.text = param1 + "： " + param2 + "(+" + param3 + ")";
         }
         else
         {
            _loc6_.text = param1 + "： " + param2 + "(" + param3 + ")";
         }
         _loc6_.setTextFormat(_loc5_);
         _loc6_.y = Number(this.i) * 25;
         _loc6_.height = 25;
         _loc6_.width = _loc6_.textWidth + 10;
         this.info.addChild(_loc6_);
         ++this.i;
      }
      
      private function drawInstruction() : void
      {
         var _loc1_:TextField = new TextField();
         _loc1_.wordWrap = true;
         _loc1_.embedFonts = true;
         _loc1_.htmlText = "<font face=\'" + AllConsts.GAME_CONFIG_FONT + "\' size=\'14\' color=\'#ffffff\'>" + this.attributeObj.instruction + "</font>";
         _loc1_.y = Number(this.i) * 25;
         _loc1_.height = _loc1_.textHeight + 10;
         _loc1_.width = 135;
         this.info.addChild(_loc1_);
         var _loc2_:uint = Math.round(_loc1_.height / 25);
         this.i = uint(uint(uint(this.i + _loc2_)));
      }
      
      private function drawValue() : void
      {
         var _loc1_:TextFormat = new TextFormat();
         _loc1_.font = AllConsts.GAME_CONFIG_FONT;
         _loc1_.color = 16750899;
         _loc1_.size = 14;
         var _loc2_:TextField = new TextField();
         _loc2_.embedFonts = true;
         _loc2_.text = "价值 : " + this.attributeObj.getValue() + " 灵魂";
         _loc2_.setTextFormat(_loc1_);
         _loc2_.y = Number(this.i) * 25;
         _loc2_.height = _loc2_.textHeight + 10;
         _loc2_.width = 135;
         this.info.addChild(_loc2_);
      }
      
      private function drawbg() : void
      {
         this.addChild(this.bg);
         this.bg.graphics.lineStyle(1,16777215);
         this.bg.graphics.beginFill(0,0.7);
         this.bg.graphics.drawRoundRect(0,0,this.info.width + 35,this.info.height + 10,5,5);
         this.bg.graphics.endFill();
      }
      
      private function GlowEffect() : GlowFilter
      {
         return new GlowFilter(16777215,1,2,2,3,BitmapFilterQuality.HIGH,false,false);
      }
   }
}

