package export.setmenu
{
   import config.Config;
   import flash.display.MovieClip;
   import flash.display.SimpleButton;
   import flash.events.*;
   import flash.system.*;
   import flash.text.TextFormat;
   import flash.utils.*;
   import manager.*;
   import my.*;
   
   public class gameSetting extends MovieClip
   {
      
      public var bgmStay:MovieClip;
      
      public var difficulty:MovieClip;
      
      public var quality:MovieClip;
      
      public var skillStay:MovieClip;
      
      public var defaultVol:MovieClip;
      
      public var list:Array;
      
      public var xClick:SimpleButton;
      
      private var gc:Config;
      
      public function gameSetting()
      {
         this.list = ["bgmStay","difficulty","quality","skillStay","defaultVol"];
         super();
         this.gc = getDefinitionByName("config.Config").getInstance();
         this.addEventListener(Event.ADDED_TO_STAGE,this.__added);
         this.addEventListener(Event.REMOVED_FROM_STAGE,this.__removed);
      }
      
      public function __added(param1:Event) : void
      {
         var _loc2_:TextFormat = null;
         var _loc3_:String = null;
         this.xClick.addEventListener(MouseEvent.CLICK,this.xClickHandler);
         for each(_loc3_ in this.list)
         {
            this[_loc3_].buttonMode = true;
            this[_loc3_].txt.embedFonts = true;
            this[_loc3_].txt.selectable = false;
            _loc2_ = this[_loc3_].txt.defaultTextFormat;
            _loc2_.font = AllConsts.GAME_CONFIG_FONT;
            this[_loc3_].txt.setTextFormat(_loc2_);
            this[_loc3_].txt.defaultTextFormat = _loc2_;
            this[_loc3_].addEventListener(MouseEvent.ROLL_OVER,this.react);
            this[_loc3_].addEventListener(MouseEvent.ROLL_OUT,this.react);
            this[_loc3_].addEventListener(MouseEvent.CLICK,this["__setProp_" + _loc3_ + "_"]);
         }
         this.refreshTxt();
      }
      
      public function __removed(param1:Event) : void
      {
         var _loc2_:String = null;
         this.xClick.removeEventListener(MouseEvent.CLICK,this.xClickHandler);
         this.removeEventListener(Event.ADDED_TO_STAGE,this.__added);
         this.removeEventListener(Event.REMOVED_FROM_STAGE,this.__removed);
         for each(_loc2_ in this.list)
         {
            this[_loc2_].removeEventListener(MouseEvent.ROLL_OVER,this.react);
            this[_loc2_].removeEventListener(MouseEvent.ROLL_OUT,this.react);
            this[_loc2_].removeEventListener(MouseEvent.CLICK,this["__setProp_" + _loc2_ + "_"]);
         }
      }
      
      private function xClickHandler(param1:Event) : void
      {
         if(this.parent)
         {
            parent.removeChild(this);
         }
      }
      
      private function react(param1:MouseEvent) : void
      {
         var _loc2_:TextFormat = null;
         switch(param1.type)
         {
            case MouseEvent.ROLL_OVER:
               _loc2_ = param1.currentTarget.txt.defaultTextFormat;
               _loc2_.color = 16776960;
               param1.currentTarget.txt.setTextFormat(_loc2_);
               param1.currentTarget.txt.defaultTextFormat = _loc2_;
               break;
            case MouseEvent.ROLL_OUT:
               _loc2_ = param1.currentTarget.txt.defaultTextFormat;
               _loc2_.color = 16777215;
               param1.currentTarget.txt.setTextFormat(_loc2_);
               param1.currentTarget.txt.defaultTextFormat = _loc2_;
         }
      }
      
      private function __setProp_difficulty_(param1:MouseEvent) : *
      {
         if(this.gc.difficulity < 2)
         {
            ++this.gc.difficulity;
         }
         else
         {
            this.gc.difficulity = 0;
         }
         this.refreshTxt();
         this.gc.alert("关卡难度已改变");
      }
      
      public function __setProp_bgmStay_(param1:MouseEvent) : *
      {
         SoundManager.bgmStay = !SoundManager.bgmStay;
         if(Boolean(SoundManager.loopChannel) && !SoundManager.bgmStay)
         {
            SoundManager.clearLoop();
            this.gc.alert("已关闭背景音乐");
         }
         else
         {
            SoundManager.play("begin");
            SoundManager.setVom(SoundManager.loopChannel);
            this.gc.alert("已开启背景音乐");
         }
         this.refreshTxt();
      }
      
      public function __setProp_skillStay_(param1:MouseEvent) : *
      {
         SoundManager.skillStay = !SoundManager.skillStay;
         this.refreshTxt();
         this.gc.alert("已" + this.skillStay.txt.text.replace(" ","") + "技能音效");
      }
      
      public function __setProp_quality_(param1:MouseEvent) : *
      {
         switch(this.gc.frameClips)
         {
            case 30:
               this.gc.frameClips = 24;
               this.gc.stage.frameRate = 24;
               break;
            case 24:
               this.gc.frameClips = 20;
               this.gc.stage.frameRate = 20;
               break;
            case 20:
               this.gc.frameClips = 30;
               this.gc.stage.frameRate = 30;
         }
         this.refreshTxt();
         this.gc.alert("画质设置为：" + this.quality.txt.text.replace("  ",""));
      }
      
      public function __setProp_defaultVol_(param1:MouseEvent) : *
      {
         this.refreshTxt();
         this.gc.alert("开启游戏时默认 " + this.defaultVol.txt.text.replace(" ","") + " 音量",3);
      }
      
      public function refreshTxt() : void
      {
         switch(this.gc.difficulity)
         {
            case 0:
               this.difficulty.txt.text = "普 通";
               break;
            case 1:
               this.difficulty.txt.text = "困 难";
               break;
            case 2:
               this.difficulty.txt.text = "地 狱";
         }
         if(SoundManager.bgmStay)
         {
            this.bgmStay.txt.text = "开 启";
         }
         else
         {
            this.bgmStay.txt.text = "关 闭";
         }
         if(SoundManager.skillStay)
         {
            this.skillStay.txt.text = "开 启";
         }
         else
         {
            this.skillStay.txt.text = "关 闭";
         }
         switch(this.gc.frameClips)
         {
            case 30:
               this.quality.txt.text = "  高";
               break;
            case 24:
               this.quality.txt.text = "  中";
               break;
            case 20:
               this.quality.txt.text = "  低";
         }
      }
   }
}

