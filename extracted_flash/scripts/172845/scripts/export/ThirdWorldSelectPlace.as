package export
{
   import config.*;
   import event.*;
   import export.level.*;
   import flash.display.DisplayObject;
   import flash.display.MovieClip;
   import flash.display.SimpleButton;
   import flash.display.Sprite;
   import flash.events.*;
   
   public class ThirdWorldSelectPlace extends Sprite
   {
      
      private var gc:Config;
      
      private var stageAry:Array;
      
      public var s23_2:MovieClip;
      
      public var s24_1:MovieClip;
      
      public var s24_2:MovieClip;
      
      public var s24_3:MovieClip;
      
      public var s25_1:MovieClip;
      
      public var s25_2:MovieClip;
      
      public var s25_3:MovieClip;
      
      public var s26_1:MovieClip;
      
      public var s26_3:MovieClip;
      
      public var s26_2:MovieClip;
      
      public var bygbtn:MovieClip;
      
      public var backjiejiaobutton:SimpleButton;
      
      private var cbs:int;
      
      private var cbl:int;
      
      public function ThirdWorldSelectPlace()
      {
         this.stageAry = [3,3,3,3];
         super();
         this.gc = Config.getInstance();
         this.addEventListener("addedToStage",this.added,false,0,true);
         this.addEventListener("removedFromStage",this.removed,false,0,true);
         this.init();
      }
      
      private function init() : void
      {
         this.s24_1.buttonMode = true;
         this.s24_2.buttonMode = true;
         this.s24_3.buttonMode = true;
         this.s25_1.buttonMode = true;
         this.s25_2.buttonMode = true;
         this.s25_3.buttonMode = true;
         this.s26_1.buttonMode = true;
      }
      
      private function added(param1:Event) : void
      {
         var _loc2_:uint = 0;
         var _loc3_:uint = 0;
         var _loc4_:uint = 0;
         var _loc5_:uint = 0;
         var _loc6_:DisplayObject = null;
         this.gc.isintheselectmap = true;
         if(!this.gc.isHideDebug)
         {
            this.gc.curBigStage = 26;
            this.gc.curBigLevel = 1;
         }
         this.cbs = int(this.gc.curBigStage);
         this.cbl = this.gc.curBigLevel;
         if(this.cbs < 24)
         {
            this.cbs = 24;
            this.cbl = 1;
            this.gc.curBigStage = 24;
            this.gc.curBigLevel = 1;
         }
         else if(this.gc.curBigStage >= 27)
         {
            _loc5_ = 26;
            this.gc.curBigLevel = 1;
         }
         _loc2_ = 24;
         while(_loc2_ <= this.cbs)
         {
            _loc3_ = uint(this.stageAry[_loc2_ - 24]);
            if(_loc2_ == this.cbs)
            {
               _loc3_ = uint(this.cbl);
            }
            _loc4_ = 0;
            while(_loc4_ < _loc3_)
            {
               this["s" + _loc2_ + "_" + (_loc4_ + 1)].addEventListener(MouseEvent.ROLL_OVER,this.mOver);
               this["s" + _loc2_ + "_" + (_loc4_ + 1)].addEventListener(MouseEvent.ROLL_OUT,this.mOut);
               this["s" + _loc2_ + "_" + (_loc4_ + 1)].addEventListener(MouseEvent.CLICK,this.onSelected);
               _loc4_++;
            }
            _loc2_++;
         }
         if(this["s" + this.cbs + "_" + this.cbl])
         {
            this["s" + this.cbs + "_" + this.cbl].gotoAndStop(2);
         }
         while(_loc2_ < this.numChildren)
         {
            _loc6_ = this.getChildAt(_loc2_);
            if(_loc6_ is MapMenu)
            {
               this.removeChild(_loc6_);
            }
            _loc2_++;
         }
         var _loc7_:MapMenu = new MapMenu();
         _loc7_.x = -1;
         _loc7_.y = 0;
         this.addChild(_loc7_);
         this.backjiejiaobutton.addEventListener(MouseEvent.CLICK,this.showNewWorld);
         this.gc.eventManger.addEventListener("ShowOtherScene",this.showOtherScene);
         this.gc.eventManger.addEventListener("ChanllengeBossInster",this.chanllenge);
      }
      
      private function mOver(param1:MouseEvent) : void
      {
         param1.currentTarget.gotoAndStop(3);
      }
      
      private function mOut(param1:MouseEvent) : void
      {
         if(param1.currentTarget != this["s" + this.cbs + "_" + this.cbl])
         {
            param1.currentTarget.gotoAndStop(1);
         }
         else
         {
            param1.currentTarget.gotoAndStop(2);
         }
      }
      
      private function onSelected(param1:MouseEvent) : void
      {
         this.gc.curStage = int(String(param1.currentTarget.name).substr(1,2));
         this.gc.curLevel = int(String(param1.currentTarget.name).substr(4,1));
         if(this.gc.curStageAndCurLevel.curStage == 25 && this.gc.curStageAndCurLevel.curLevel == 3)
         {
            StageListener253.curType1 = 0;
            StageListener253.curType2 = 0;
            StageListener253.curType3 = 0;
         }
         this.gc.eventManger.dispatchEvent(new CommonEvent("selectStageOver"));
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
      }
      
      private function showNewWorld(evt:MouseEvent) : void
      {
         GMain.getInstance().switchSence("showNewStageMap");
      }
      
      private function removed(param1:Event) : void
      {
         this.gc.isintheselectmap = false;
         this.s24_1.removeEventListener(MouseEvent.ROLL_OVER,this.mOver);
         this.s24_1.removeEventListener(MouseEvent.ROLL_OUT,this.mOut);
         this.s24_1.removeEventListener(MouseEvent.CLICK,this.onSelected);
         this.s24_2.removeEventListener(MouseEvent.ROLL_OVER,this.mOver);
         this.s24_2.removeEventListener(MouseEvent.ROLL_OUT,this.mOut);
         this.s24_2.removeEventListener(MouseEvent.CLICK,this.onSelected);
         this.s24_3.removeEventListener(MouseEvent.ROLL_OVER,this.mOver);
         this.s24_3.removeEventListener(MouseEvent.ROLL_OUT,this.mOut);
         this.s24_3.removeEventListener(MouseEvent.CLICK,this.onSelected);
         this.s25_1.removeEventListener(MouseEvent.ROLL_OVER,this.mOver);
         this.s25_1.removeEventListener(MouseEvent.ROLL_OUT,this.mOut);
         this.s25_1.removeEventListener(MouseEvent.CLICK,this.onSelected);
         this.s25_2.removeEventListener(MouseEvent.ROLL_OVER,this.mOver);
         this.s25_2.removeEventListener(MouseEvent.ROLL_OUT,this.mOut);
         this.s25_2.removeEventListener(MouseEvent.CLICK,this.onSelected);
         this.s25_3.removeEventListener(MouseEvent.ROLL_OVER,this.mOver);
         this.s25_3.removeEventListener(MouseEvent.ROLL_OUT,this.mOut);
         this.s25_3.removeEventListener(MouseEvent.CLICK,this.onSelected);
         this.s26_1.removeEventListener(MouseEvent.ROLL_OVER,this.mOver);
         this.s26_1.removeEventListener(MouseEvent.ROLL_OUT,this.mOut);
         this.s26_1.removeEventListener(MouseEvent.CLICK,this.onSelected);
         this.backjiejiaobutton.removeEventListener(MouseEvent.CLICK,this.showNewWorld);
         this.gc.eventManger.removeEventListener("ShowOtherScene",this.showOtherScene);
         this.gc.eventManger.removeEventListener("ChanllengeBossInster",this.chanllenge);
      }
      
      private function showOtherScene(e:CommonEvent) : void
      {
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
      }
      
      private function chanllenge(e:CommonEvent) : void
      {
         this.gc.eventManger.dispatchEvent(new CommonEvent("selectStageOver"));
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
      }
   }
}

