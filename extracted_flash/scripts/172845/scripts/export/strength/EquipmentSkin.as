package export.strength
{
   import config.*;
   import event.*;
   import export.pack.*;
   import flash.display.*;
   import flash.events.*;
   import flash.text.*;
   import user.User;
   
   public class EquipmentSkin extends Sprite
   {
      
      private var sendBtn:EquipmentSprite;
      
      private var isSelect:Boolean = false;
      
      private var ttf1:TextFormat;
      
      private var ttf:TextFormat;
      
      private var MyEquipObj:*;
      
      private var message:TextField;
      
      private var gc:Config;
      
      private var player:User;
      
      private var data:String;
      
      private var dataArr:Array;
      
      private var buttons:Array;
      
      private var buttonWidth:int = 50;
      
      private var buttonHeight:int = 30;
      
      private var skinIndex:Object;
      
      private var skinIndex2:Object;
      
      private var skinIndex3:Object;
      
      private var SIndex:Object = null;
      
      private var currentImageSprite:Sprite;
      
      private var currentEquip:ShowObj;
      
      public function EquipmentSkin(_player:User)
      {
         this.skinIndex = {
            "伴生":0,
            "普通":1,
            "优秀":2,
            "精良":3,
            "史诗":4,
            "邪灵":5,
            "魂器":8,
            "传说":520,
            "一传":9
         };
         this.skinIndex2 = {
            "伴生":0,
            "普通":1,
            "优秀":2,
            "精良":3,
            "史诗":4,
            "邪灵":5,
            "魂器":9,
            "传说":521,
            "一传":11
         };
         this.skinIndex3 = {
            "伴生":0,
            "普通":1,
            "优秀":2,
            "精良":3,
            "史诗":999,
            "邪灵":6,
            "魂器":11,
            "传说":520,
            "一传":10
         };
         this.buttons = new Array();
         super();
         this.gc = Config.getInstance();
         this.player = _player;
         this.addEventListener("addedToStage",this.added);
         this.addEventListener("removedFromStage",this.removed);
      }
      
      private function added(e:Event) : void
      {
         this.removeEventListener("addedToStage",this.added);
         this.buildUI();
         this.gc.eventManger.addEventListener("SimpleClick",this.receiveObj);
      }
      
      private function removed(e:Event) : void
      {
         var btn:* = undefined;
         this.removeEventListener("removedFromStage",this.removed);
         if(this.sendBtn)
         {
            this.sendBtn.removeEventListener(MouseEvent.CLICK,this.confirm);
         }
         this.gc.eventManger.removeEventListener("SimpleClick",this.receiveObj);
         if(Boolean(this.buttons) && this.buttons.length > 0)
         {
            for each(btn in this.buttons)
            {
               btn.removeEventListener(MouseEvent.CLICK,this.onNumberButtonClick);
               removeChild(btn);
            }
         }
      }
      
      private function receiveObj(e:CommonEvent) : void
      {
         var btn:* = undefined;
         var sobj:ShowObj = null;
         var key:* = undefined;
         var x:int = 0;
         var y:int = 0;
         for each(btn in this.buttons)
         {
            if(Boolean(btn) && contains(btn))
            {
               btn.removeEventListener(MouseEvent.CLICK,this.onNumberButtonClick);
               removeChild(btn);
            }
         }
         this.buttons = new Array();
         this.message.text = "";
         sobj = e.data[0] as ShowObj;
         this.data = sobj.getMyEquipObj().getEquipSaveObj();
         this.dataArr = this.data.split("|");
         if(Boolean(this.currentImageSprite) && contains(this.currentImageSprite))
         {
            this.gc.eventManger.dispatchEvent(new CommonEvent("REFRESHBACKPACK",[false]));
            removeChild(this.currentImageSprite);
         }
         if(this.dataArr[3] == "zbwq")
         {
            this.SIndex = this.skinIndex;
            switch(this.dataArr[2])
            {
               case "cs_wq_qs":
                  this.message.text = "祁水";
                  break;
               case "cs_wq_rc":
                  this.message.text = "若禅";
                  break;
               case "cs_wq_yt":
                  this.message.text = "夷图";
                  break;
               case "cs_wq_ll":
                  this.message.text = "琉璃";
                  break;
               default:
                  this.gc.ts.setTxt("只有造三传说武器才能幻兵！");
                  this.gc.stage.addChild(this.gc.ts);
                  return;
            }
         }
         if(this.dataArr[3] == "zbfj")
         {
            this.SIndex = this.skinIndex2;
            switch(this.dataArr[2])
            {
               case "cs_fj_dz":
                  this.message.text = "斗战";
                  break;
               case "cs_fj_zt":
                  this.message.text = "旃檀";
                  break;
               case "cs_fj_jt":
                  this.message.text = "净坛";
                  break;
               case "cs_fj_js":
                  this.message.text = "金身";
                  break;
               default:
                  this.gc.ts.setTxt("只有造三传说装备才能幻兵！");
                  this.gc.stage.addChild(this.gc.ts);
                  return;
            }
         }
         if(this.dataArr[3] != "zbfj" & this.dataArr[3] != "zbwq")
         {
            this.gc.ts.setTxt("只有武器和装备才能幻兵！");
            this.gc.stage.addChild(this.gc.ts);
            return;
         }
         this.gc.eventManger.dispatchEvent(new CommonEvent("REFRESHBACKPACK",[false]));
         this.message.setTextFormat(this.ttf1);
         this.MyEquipObj = sobj.getMyEquipObj();
         if(this.MyEquipObj.user == "沙僧")
         {
            this.SIndex = this.skinIndex3;
         }
         this.isSelect = true;
         this.currentImageSprite = new Sprite();
         this.currentImageSprite.x = this.message.x + 5;
         this.currentImageSprite.y = this.message.y + 40;
         this.currentEquip = sobj;
         this.currentImageSprite.addChild(sobj);
         addChild(this.currentImageSprite);
         var i:int = 0;
         for(key in this.SIndex)
         {
            btn = new EquipmentSprite();
            x = 10 + (this.buttonWidth + 10) * (i % 5);
            y = 210 + (this.buttonHeight + 10) * Math.floor(i / 5);
            btn.name = key;
            btn.setData(this.SIndex[key]);
            this.addBtn(btn,btn.name,x,y,this.onNumberButtonClick);
            this.buttons.push(btn);
            i++;
         }
      }
      
      private function onNumberButtonClick(event:MouseEvent) : void
      {
         var buttonClicked:EquipmentSprite = target as EquipmentSprite;
         var buttonIndex:int = int(parseInt(buttonClicked.getData()));
         trace(this.data);
         if(Boolean(this.dataArr) && this.dataArr.length > 0)
         {
            this.dataArr[0] = buttonIndex;
            this.data = this.dataArr.join("|");
         }
         this.gc.ts.setTxt("选择了" + buttonClicked.name + "品质");
         this.gc.stage.addChild(this.gc.ts);
      }
      
      private function buildUI() : void
      {
         this.ttf = new TextFormat();
         this.ttf.size = 30;
         this.ttf.color = 16777215;
         this.ttf.bold = true;
         this.ttf1 = new TextFormat();
         this.ttf1.size = 30;
         this.ttf1.color = 16753920;
         var messageLabel:TextField = new TextField();
         messageLabel.x = 10;
         messageLabel.y = 10;
         messageLabel.width = 310;
         messageLabel.height = 60;
         messageLabel.text = "幻兵";
         messageLabel.autoSize = TextFieldAutoSize.LEFT;
         messageLabel.setTextFormat(this.ttf);
         messageLabel.wordWrap = true;
         addChild(messageLabel);
         this.message = new TextField();
         this.message.x = 10;
         this.message.y = 70;
         this.message.background = false;
         this.message.border = false;
         this.message.type = TextFieldType.DYNAMIC;
         this.message.wordWrap = true;
         this.message.width = 310;
         this.message.height = 90;
         this.message.visible = true;
         addChild(this.message);
         this.sendBtn = new EquipmentSprite();
         this.addBtn(this.sendBtn,"幻兵",10,170,this.confirm);
      }
      
      private function confirm(event:MouseEvent) : void
      {
         if(this.isSelect)
         {
            this.isSelect = false;
            this.MyEquipObj.setEquipSaveObj(this.data);
            this.message.text = "";
            if(Boolean(this.currentImageSprite) && contains(this.currentImageSprite))
            {
               this.gc.eventManger.dispatchEvent(new CommonEvent("REFRESHBACKPACK",[false]));
               removeChild(this.currentImageSprite);
            }
            this.gc.ts.setTxt("幻兵成功!");
            this.gc.stage.addChild(this.gc.ts);
         }
         else
         {
            this.gc.ts.setTxt("清先选择装备!");
            this.gc.stage.addChild(this.gc.ts);
         }
      }
      
      private function addBtn(btn:EquipmentSprite, text:String, x:int, y:int, func:*) : void
      {
         btn.mouseChildren = false;
         btn.x = x;
         btn.y = y;
         var sendLbl:TextField = new TextField();
         sendLbl.x = 6;
         sendLbl.y = 1;
         sendLbl.selectable = false;
         sendLbl.autoSize = TextFieldAutoSize.LEFT;
         sendLbl.text = text;
         btn.addChild(sendLbl);
         btn.graphics.lineStyle(1);
         btn.graphics.beginFill(13421772);
         btn.graphics.drawRoundRect(0,0,sendLbl.width + 2 + 5 + 5,sendLbl.height + 2,5,5);
         btn.graphics.endFill();
         addChild(btn);
         btn.addEventListener(MouseEvent.CLICK,func);
      }
   }
}

