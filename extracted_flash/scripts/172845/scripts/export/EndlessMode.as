package export
{
   import config.*;
   import export.level.*;
   import flash.display.*;
   import flash.events.*;
   import flash.text.*;
   import my.*;
   
   public class EndlessMode extends MovieClip
   {
      
      private var nextlevel:MovieClip;
      
      private var lastlevel:MovieClip;
      
      private var acceptBtn:MovieClip;
      
      private var refuseBtn:MovieClip;
      
      private var _txt:TextField;
      
      private var _textFormat:TextFormat;
      
      private var levelnum:int = 1;
      
      private var stageListener981:StageListener981;
      
      private var gc:Config;
      
      public function EndlessMode()
      {
         this._textFormat = new TextFormat();
         super();
         this._txt = this.createText(455,365,50,28);
         this._txt.text = this.levelnum;
         this.addChild(this._txt);
         this.gc = Config.getInstance();
         this.addEventListener(Event.ADDED_TO_STAGE,this.added,false,0,true);
         this.addEventListener(Event.REMOVED_FROM_STAGE,this.removed,false,0,true);
      }
      
      private function createText(param1:int, param2:int, param3:int, param4:int) : TextField
      {
         var _loc5_:TextField = new TextField();
         this._textFormat.font = AllConsts.GAME_CONFIG_FONT;
         this._textFormat.size = 20;
         this._textFormat.color = 16777215;
         _loc5_.embedFonts = true;
         _loc5_.defaultTextFormat = this._textFormat;
         this._textFormat.align = "center";
         _loc5_.x = param1;
         _loc5_.y = param2;
         _loc5_.width = param3;
         _loc5_.height = param4;
         _loc5_.autoSize = TextFieldAutoSize.CENTER;
         return _loc5_;
      }
      
      private function added(param1:Event) : void
      {
         this.nextlevel = AUtils.getNewObj("export.nextpageBtn") as MovieClip;
         this.nextlevel.x = 510;
         this.nextlevel.y = 360;
         this.addChild(this.nextlevel);
         this.nextlevel.buttonMode = true;
         this.nextlevel.gotoAndStop(1);
         this.nextlevel.addEventListener("click",this.nextclick);
         this.nextlevel.addEventListener("rollOver",this.mOver);
         this.nextlevel.addEventListener("rollOut",this.mOut);
         this.lastlevel = AUtils.getNewObj("export.lastpageBtn") as MovieClip;
         this.lastlevel.x = 400;
         this.lastlevel.y = 360;
         this.addChild(this.lastlevel);
         this.lastlevel.buttonMode = true;
         this.lastlevel.gotoAndStop(1);
         this.lastlevel.addEventListener("click",this.lastclick);
         this.lastlevel.addEventListener("rollOver",this.mOver);
         this.lastlevel.addEventListener("rollOut",this.mOut);
         this.acceptBtn = AUtils.getNewObj("export.okBtn") as MovieClip;
         this.acceptBtn.x = 330;
         this.acceptBtn.y = 360;
         this.addChild(this.acceptBtn);
         this.acceptBtn.buttonMode = true;
         this.acceptBtn.gotoAndStop(1);
         this.acceptBtn.addEventListener("click",this.changeok);
         this.acceptBtn.addEventListener("rollOver",this.mOver);
         this.acceptBtn.addEventListener("rollOut",this.mOut);
         this.refuseBtn = AUtils.getNewObj("export.changeBtn") as MovieClip;
         this.refuseBtn.x = 560;
         this.refuseBtn.y = 360;
         this.addChild(this.refuseBtn);
         this.refuseBtn.buttonMode = true;
         this.refuseBtn.gotoAndStop(1);
         this.refuseBtn.addEventListener("click",this.changeno);
         this.refuseBtn.addEventListener("rollOver",this.mOver);
         this.refuseBtn.addEventListener("rollOut",this.mOut);
      }
      
      private function removed(param1:Event) : void
      {
         this.nextlevel.removeEventListener("click",this.nextclick);
         this.nextlevel.removeEventListener("rollOver",this.mOver);
         this.nextlevel.removeEventListener("rollOut",this.mOut);
         this.nextlevel = null;
         this.lastlevel.removeEventListener("click",this.lastclick);
         this.lastlevel.removeEventListener("rollOver",this.mOver);
         this.lastlevel.removeEventListener("rollOut",this.mOut);
         this.lastlevel = null;
         this.acceptBtn.removeEventListener("click",this.changeok);
         this.acceptBtn.removeEventListener("rollOver",this.mOver);
         this.acceptBtn.removeEventListener("rollOut",this.mOut);
         this.acceptBtn = null;
         this.refuseBtn.removeEventListener("click",this.changeno);
         this.refuseBtn.removeEventListener("rollOver",this.mOver);
         this.refuseBtn.removeEventListener("rollOut",this.mOut);
         this.refuseBtn = null;
      }
      
      private function mOver(param1:MouseEvent) : void
      {
         param1.currentTarget.gotoAndStop(3);
      }
      
      private function mOut(param1:MouseEvent) : void
      {
         param1.currentTarget.gotoAndStop(1);
      }
      
      private function lastclick(param1:MouseEvent) : void
      {
         if(this.levelnum <= 1)
         {
            return;
         }
         this.levelnum -= 10;
         this.refreshtext();
      }
      
      private function nextclick(param1:MouseEvent) : void
      {
         if(this.levelnum >= 211)
         {
            this.gc.alert("最高只能从211波开始~");
            return;
         }
         this.levelnum += 10;
         this.refreshtext();
      }
      
      private function refreshtext() : void
      {
         this._txt.text = this.levelnum;
      }
      
      private function changeok(param1:MouseEvent) : void
      {
         this.gc.Objectdata.endlesslevel = this.levelnum - 1;
         this.afterchoose();
      }
      
      private function changeno(param1:MouseEvent) : void
      {
         this.gc.Objectdata.endlesslevel = 0;
         this.afterchoose();
      }
      
      private function afterchoose() : void
      {
         if(this.gc.pWorld.getBaseLevelListener())
         {
            (this.gc.pWorld.getBaseLevelListener() as StageListener981).dataObj.curWave = this.gc.Objectdata.endlesslevel;
            (this.gc.pWorld.getBaseLevelListener() as StageListener981).nextWave();
         }
         MainGame.getInstance().continueGame();
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
      }
   }
}

