package base
{
   import com.dusk.util.*;
   import com.game.manager.*;
   import com.game.view.IAnimation;
   import flash.display.*;
   import flash.geom.*;
   import flash.utils.*;
   
   public class BaseAnimation extends Sprite
   {
      
      public var sourceName:String;
      
      public var replace:Object;
      
      public var animationType:int;
      
      private var _isPlaying:Boolean = true;
      
      private var _curClip:IAnimation;
      
      private var _clipDict:Dictionary;
      
      private var _curAction:String;
      
      private var _offsetX:int;
      
      private var _offsetY:int;
      
      protected var enterFrameFunc:Function;
      
      protected var actionOverFunc:Function;
      
      public function BaseAnimation(param1:Dictionary = null)
      {
         super();
         if(Boolean(param1))
         {
            this._clipDict = param1;
         }
         else
         {
            this._clipDict = new Dictionary();
         }
      }
      
      public function addCallBack(param1:Function = null, param2:Function = null) : void
      {
         this.enterFrameFunc = param1;
         this.actionOverFunc = param2;
      }
      
      public function setOffsetXY(param1:int, param2:int) : void
      {
      }
      
      public function getCurFrameBitmapData() : BitmapData
      {
      }
      
      public function step() : void
      {
      }
      
      public function setEnterFrameCallBack(param1:Function, param2:Function) : void
      {
         this.enterFrameFunc = param1;
      }
      
      public function setActionOverCallBack(param1:Function) : void
      {
         this.actionOverFunc = param1;
      }
      
      public function setOffset(param1:Number = 0, param2:Number = 0) : void
      {
         this._offsetX = param1;
         this._offsetY = param2;
      }
      
      public function setAction(param1:String) : void
      {
         this._curAction = param1;
         if(!this._clipDict)
         {
            return;
         }
         if(!this._clipDict.hasOwnProperty(this._curAction))
         {
            this._clipDict[this._curAction] = AnimationManager.getActionAnimation(this.sourceName,this.replace,this._curAction,this.animationType,true);
            if(this._clipDict[this._curAction] == null)
            {
               delete this._clipDict[this._curAction];
               return;
            }
         }
         if(this._curClip === this._clipDict[this._curAction])
         {
            return;
         }
         if(Boolean(this._curClip))
         {
            this._curClip.removeFromParent();
         }
         this._curClip = this._clipDict[this._curAction];
         this._curClip.GotoAndPlay(1);
         this.applyOffset();
         addChild(this._curClip as MovieClip);
      }
      
      public function renderAnimate() : void
      {
         if(!this._curAction || !this._curClip)
         {
            return;
         }
         if(!this._isPlaying)
         {
            return;
         }
         this.applyOffset();
         if(Boolean(this.enterFrameFunc))
         {
            this.enterFrameFunc(this._curAction,this._curClip.currentFrame);
         }
         this._curClip.renderAnimate();
         if(this._curClip.frameLeft == 0)
         {
            if(Boolean(this.actionOverFunc))
            {
               this.actionOverFunc(this._curAction);
            }
         }
      }
      
      public function stopFrame() : void
      {
         this._isPlaying = false;
      }
      
      public function continueFrame() : void
      {
         this._isPlaying = true;
      }
      
      public function isPlaying() : Boolean
      {
         return this._isPlaying;
      }
      
      public function gotoAndPlay(param1:int) : void
      {
         this._isPlaying = true;
         this._curClip.GotoAndPlay(param1);
      }
      
      public function gotoAndStop(param1:int) : void
      {
         this._isPlaying = false;
         this._curClip.GotoAndStop(param1);
      }
      
      public function getAction() : String
      {
         return this._curAction;
      }
      
      public function get frameLeft() : int
      {
         return this._curClip.frameLeft;
      }
      
      public function get currentFrame() : int
      {
         return this._curClip.currentFrame;
      }
      
      public function get totalFrame() : int
      {
         return this._curClip.totalFrame;
      }
      
      public function get totalActions() : int
      {
         return UtilBase.length(this._clipDict);
      }
      
      public function get loopTime() : int
      {
         return this._curClip.loopTime;
      }
      
      protected function applyOffset() : void
      {
         if(!this._curClip)
         {
            return;
         }
         this._curClip.x = this._offsetX;
         this._curClip.y = this._offsetY;
      }
      
      public function replaceClipByName(param1:String, param2:IAnimation) : void
      {
         this._clipDict[param1] = param2;
      }
      
      public function replaceClipsByName(param1:Array, param2:Vector.<IAnimation>) : void
      {
         if(param1.length != param2.length)
         {
            throw "NameArray Should Have the Same Length as ClipVector";
         }
         var _loc3_:int = 0;
         while(_loc3_ < param1.length)
         {
            this.replaceClipByName(param1[_loc3_],param2[_loc3_]);
            _loc3_++;
         }
      }
      
      public function getCurFrame() : uint
      {
         return this._curClip.currentFrame;
      }
      
      public function hide() : void
      {
         visible = false;
      }
      
      public function show() : void
      {
         visible = true;
      }
      
      public function getDirect() : int
      {
         if(scaleX == -1)
         {
            return 0;
         }
         return scaleX;
      }
      
      public function setDirect(param1:int) : void
      {
         if(this.getDirect() != param1)
         {
            this._curClip.scaleX = param1;
            this.applyOffset();
         }
      }
      
      public function changeAppearance(param1:String, param2:Object) : void
      {
         var _loc3_:String = null;
         if(UtilBase.getObjectID(param2) == UtilBase.getObjectID(this.replace))
         {
            return;
         }
         var _loc4_:int = int(this.getCurFrame());
         this.sourceName = param1;
         this.replace = param2;
         this._curClip.removeFromParent();
         this._curClip = null;
         for(_loc3_ in this._clipDict)
         {
            this._clipDict[_loc3_] = null;
            delete this._clipDict[_loc3_];
         }
         if(Boolean(this._curAction))
         {
            this.setAction(this._curAction);
         }
         this.gotoAndPlay(_loc4_);
      }
      
      public function destroy() : void
      {
         var _loc1_:String = null;
         for(_loc1_ in this._clipDict)
         {
            delete this._clipDict[_loc1_];
         }
         this._clipDict = null;
         if(Boolean(this._curClip))
         {
            this._curClip.removeFromParent();
         }
         this._curClip = null;
         this.enterFrameFunc = null;
         this.actionOverFunc = null;
         if(Boolean(parent))
         {
            parent.removeChild(this);
         }
      }
      
      public function setFrameStopCount(param1:Array) : void
      {
      }
      
      public function getFrameStopCount() : Array
      {
      }
      
      public function setFrameCount(param1:Array) : void
      {
      }
      
      public function getCurPoint() : Point
      {
      }
      
      public function resetCurFrameStopCount() : void
      {
      }
      
      public function getCurFrameCount() : int
      {
      }
      
      public function setCurFrameCount(param1:int) : void
      {
      }
      
      public function setState(param1:String) : void
      {
      }
      
      public function getState() : String
      {
      }
      
      public function setAddScriptWhenFrameOver(param1:Function) : void
      {
      }
      
      public function setFramePointX(param1:int) : void
      {
      }
      
      public function setFramePointY(param1:int) : void
      {
      }
      
      public function addFrameScriptEnterEveryFrame() : void
      {
      }
      
      public function addFrameScriptExitEveryFrame() : void
      {
      }
      
      public function frameShow() : void
      {
      }
      
      public function refreshCurFrame() : void
      {
      }
      
      public function replaceBitmapDataByName(param1:String, param2:Array) : void
      {
      }
      
      public function replaceBitmapDataByName1(param1:String, param2:Array) : void
      {
      }
      
      public function setXYByDirect() : void
      {
      }
      
      public function getCurKeyFrameIndex() : uint
      {
      }
   }
}

