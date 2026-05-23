package export
{
   import config.*;
   import event.*;
   import flash.display.DisplayObject;
   import flash.display.MovieClip;
   import flash.display.Sprite;
   import flash.events.*;
   
   public class NewWorldSelectPlace extends Sprite
   {
      
      private var gc:Config;
      
      private var stageAry:Array;
      
      public var s20_1:MovieClip;
      
      public var s21_1:MovieClip;
      
      public var s21_2:MovieClip;
      
      public var s21_3:MovieClip;
      
      public var s22_1:MovieClip;
      
      public var s22_2:MovieClip;
      
      public var s22_3:MovieClip;
      
      public var s23_1:MovieClip;
      
      public var s23_2:MovieClip;
      
      public var s23_3:MovieClip;
      
      public var s24_1:MovieClip;
      
      public var hdbtn:MovieClip;
      
      public var drugbtn:MovieClip;
      
      public var constelbtn:MovieClip;
      
      public var bygbtn:MovieClip;
      
      private var cbs:int;
      
      private var cbl:int;
      
      public function NewWorldSelectPlace()
      {
         this.stageAry = [1,3,3,3];
         super();
         this.gc = Config.getInstance();
         this.addEventListener(Event.ADDED_TO_STAGE,this.added,false,0,true);
         this.addEventListener(Event.REMOVED_FROM_STAGE,this.removed,false,0,true);
         this.init();
      }
      
      private function init() : void
      {
         this.s20_1.buttonMode = true;
         this.s21_1.buttonMode = true;
         this.s21_2.buttonMode = true;
         this.s21_3.buttonMode = true;
         this.s22_1.buttonMode = true;
         this.s22_2.buttonMode = true;
         this.s22_3.buttonMode = true;
         this.s23_1.buttonMode = true;
         this.s23_2.buttonMode = true;
      }
      
      private function added(param1:Event) : void
      {
         var _loc2_:uint = 0;
         var _loc3_:uint = 0;
         var _loc4_:uint = 0;
         var _loc5_:uint = 0;
         var _loc6_:DisplayObject = null;
         this.gc.isintheselectmap = true;
         this.cbs = int(this.gc.curBigStage);
         this.cbl = this.gc.curBigLevel;
         if(!this.gc.isHideDebug)
         {
            this.cbs = 23;
            this.cbl = 3;
         }
         if(this.cbs < 20)
         {
            this.cbs = 20;
            this.cbl = 1;
            this.gc.curBigStage = 20;
            this.gc.curBigLevel = 1;
         }
         else if(this.cbs > 23)
         {
            this.cbs = 23;
            this.cbl = 3;
         }
         _loc2_ = 20;
         while(_loc2_ <= this.cbs)
         {
            _loc3_ = uint(this.stageAry[_loc2_ - 20]);
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
         if(this.gc.curBigStage <= 23)
         {
            if(this["s" + this.cbs + "_" + this.cbl])
            {
               this["s" + this.cbs + "_" + this.cbl].gotoAndStop(2);
            }
         }
         this.hdbtn.buttonMode = true;
         this.hdbtn.addEventListener(MouseEvent.CLICK,this.newWorldClick);
         this.hdbtn.addEventListener(MouseEvent.ROLL_OVER,this.mOver);
         this.hdbtn.addEventListener(MouseEvent.ROLL_OUT,this.mOut);
         this.bygbtn.buttonMode = true;
         this.bygbtn.gotoAndStop(2);
         this.bygbtn.addEventListener(MouseEvent.CLICK,this.theThirdWorldClick);
         this.bygbtn.addEventListener(MouseEvent.ROLL_OVER,this.mOver);
         this.bygbtn.addEventListener(MouseEvent.ROLL_OUT,this.mOut);
         _loc2_ = 0;
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
         this.gc.eventManger.addEventListener("ShowOtherScene",this.showOtherScene);
         this.gc.eventManger.addEventListener("ChanllengeBossInster",this.chanllenge);
      }
      
      private function removed(param1:Event) : void
      {
         this.gc.isintheselectmap = false;
         this.s20_1.removeEventListener(MouseEvent.ROLL_OVER,this.mOver);
         this.s20_1.removeEventListener(MouseEvent.ROLL_OUT,this.mOut);
         this.s20_1.removeEventListener(MouseEvent.CLICK,this.onSelected);
         this.s21_1.removeEventListener(MouseEvent.ROLL_OVER,this.mOver);
         this.s21_1.removeEventListener(MouseEvent.ROLL_OUT,this.mOut);
         this.s21_1.removeEventListener(MouseEvent.CLICK,this.onSelected);
         this.s21_2.removeEventListener(MouseEvent.ROLL_OVER,this.mOver);
         this.s21_2.removeEventListener(MouseEvent.ROLL_OUT,this.mOut);
         this.s21_2.removeEventListener(MouseEvent.CLICK,this.onSelected);
         this.s22_1.removeEventListener(MouseEvent.ROLL_OVER,this.mOver);
         this.s22_1.removeEventListener(MouseEvent.ROLL_OUT,this.mOut);
         this.s22_1.removeEventListener(MouseEvent.CLICK,this.onSelected);
         this.s22_2.removeEventListener(MouseEvent.ROLL_OVER,this.mOver);
         this.s22_2.removeEventListener(MouseEvent.ROLL_OUT,this.mOut);
         this.s22_2.removeEventListener(MouseEvent.CLICK,this.onSelected);
         this.s22_3.removeEventListener(MouseEvent.ROLL_OVER,this.mOver);
         this.s22_3.removeEventListener(MouseEvent.ROLL_OUT,this.mOut);
         this.s22_3.removeEventListener(MouseEvent.CLICK,this.onSelected);
         this.s23_1.removeEventListener(MouseEvent.ROLL_OVER,this.mOver);
         this.s23_1.removeEventListener(MouseEvent.ROLL_OUT,this.mOut);
         this.s23_1.removeEventListener(MouseEvent.CLICK,this.onSelected);
         this.s23_2.removeEventListener(MouseEvent.ROLL_OVER,this.mOver);
         this.s23_2.removeEventListener(MouseEvent.ROLL_OUT,this.mOut);
         this.s23_2.removeEventListener(MouseEvent.CLICK,this.onSelected);
         this.gc.eventManger.removeEventListener("ShowOtherScene",this.showOtherScene);
         this.gc.eventManger.removeEventListener("ChanllengeBossInster",this.chanllenge);
         this.hdbtn.removeEventListener(MouseEvent.CLICK,this.newWorldClick);
         this.hdbtn.removeEventListener(MouseEvent.ROLL_OVER,this.mOver);
         this.hdbtn.removeEventListener(MouseEvent.ROLL_OUT,this.mOut);
         this.bygbtn.removeEventListener(MouseEvent.CLICK,this.theThirdWorldClick);
         this.bygbtn.removeEventListener(MouseEvent.ROLL_OVER,this.mOver);
         this.bygbtn.removeEventListener(MouseEvent.ROLL_OUT,this.mOut);
      }
      
      private function onSelected(param1:MouseEvent) : void
      {
         this.gc.curStage = int(String(param1.currentTarget.name).substr(1,2));
         this.gc.curLevel = int(String(param1.currentTarget.name).substr(4,1));
         this.gc.eventManger.dispatchEvent(new CommonEvent("selectStageOver"));
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
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
      
      private function showOtherScene(param1:CommonEvent) : void
      {
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
      }
      
      private function chanllenge(param1:CommonEvent) : void
      {
         this.gc.eventManger.dispatchEvent(new CommonEvent("selectStageOver"));
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
      }
      
      private function theThirdWorldClick(param1:MouseEvent) : void
      {
         if(this.gc.player1.getSomeOneEquipNumberByName("ttsl") >= 1)
         {
            if(this.gc.player1.getCurLevel() < 75)
            {
               this.gc.ts.setTxt("必须玩家1大于75级才可以进入");
               this.gc.stage.addChild(this.gc.ts);
               return;
            }
            GMain.getInstance().switchSence("showThirdStageMap");
            return;
         }
         this.gc.ts.setTxt("需要通天赦令");
         this.gc.stage.addChild(this.gc.ts);
      }
      
      private function newWorldClick(param1:MouseEvent) : void
      {
         if(this.gc.Objectdata.whichlastworld == 0)
         {
            GMain.getInstance().switchSence("showNewStageMap");
         }
         else
         {
            GMain.getInstance().switchSence("showStageMap");
         }
      }
      
      private function complete1(param:Sprite) : void
      {
         TweenMax.to(param,1.5,{
            "alpha":0,
            "ease":Sine.easeIn,
            "onComplete":this.complete2
         });
      }
      
      private function complete2() : void
      {
         var third:ThirdWorldSelectPlace = this.getChildByName("hasThirdWorldSelectPlace") as ThirdWorldSelectPlace;
         if(Boolean(third) && this.contains(third))
         {
            this.removeChild(third);
            third = null;
         }
      }
   }
}

