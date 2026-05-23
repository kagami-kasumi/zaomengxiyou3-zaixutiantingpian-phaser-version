package base
{
   import com.dusk.util.*;
   import com.game.manager.*;
   import com.game.view.IAnimation;
   import flash.display.*;
   import flash.geom.*;
   import flash.utils.*;
   
   public class BaseBitmapDataClip extends Sprite
   {
      
      private var isAnimation:Boolean = false;
      
      protected var frameStopCount:Array;
      
      protected var frameCount:Array;
      
      protected var frameCountMaxLen:uint;
      
      protected var curFrameStopCount:int;
      
      protected var curFrameStopCount1:Boolean = false;
      
      public var curPoint:Point;
      
      protected var curKeyFrameIndex:uint = 0;
      
      protected var enterFrameFunc:Function;
      
      protected var exitFrameFunc:Function;
      
      protected var addFrameScriptWhenFrameOver:Function;
      
      protected var bm:Bitmap;
      
      protected var bmWidth:int;
      
      protected var bmHeight:int;
      
      protected var offsetX:int;
      
      protected var offsetY:int;
      
      protected var state:String = "wait";
      
      public var isStopFrame:Boolean = false;
      
      protected var bmdArray:Array;
      
      private var direct:int = 0;
      
      public var bmSprite:Sprite;
      
      public var sourceName:String;
      
      public var replace:Object;
      
      public var animationType:int;
      
      private var _isPlaying:Boolean = true;
      
      private var _curClip:IAnimation;
      
      private var _clipDict:Dictionary;
      
      private var _curAction:String;
      
      private var _offsetX:int;
      
      private var _offsetY:int;
      
      protected var actionOverFunc:Function;
      
      public function BaseBitmapDataClip(param1:Array, param2:int, param3:int, param4:Point, param5:Dictionary = null, param6:Boolean = false)
      {
         this.isAnimation = param6;
         if(!param6)
         {
            this.frameStopCount = [[4,4,4,4],[4,4,4,4],[4,4,4,4],[4,4,4,4],[4,4,4,4],[4,4,4,4],[4,4,4,4],[4,4,4,4]];
            this.frameCount = [4,6,6,6,6,6,6,6];
            this.bmdArray = [];
            this.bmSprite = new Sprite();
            super();
            this.curPoint = param4;
            this.bmWidth = param2;
            this.bmHeight = param3;
            this.bmdArray = param1;
            this.addChild(this.bmSprite);
         }
         else if(Boolean(param5))
         {
            this._clipDict = param5;
         }
         else
         {
            this._clipDict = new Dictionary();
         }
      }
      
      public function get IsAnimation() : Boolean
      {
         return this.isAnimation;
      }
      
      public function addCallBack(param1:Function = null, param2:Function = null) : void
      {
         this.enterFrameFunc = param1;
         this.actionOverFunc = param2;
      }
      
      public function setIsAnimation(param1:Boolean) : void
      {
         this.isAnimation = param1;
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
      
      public function turnRight() : void
      {
         if(!this.isAnimation)
         {
            this.setDirect(1);
         }
         else
         {
            this.scaleX = 1;
         }
      }
      
      public function turnLeft() : void
      {
         if(!this.isAnimation)
         {
            this.setDirect(0);
         }
         else
         {
            this.scaleX = -1;
         }
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
      
      protected function frameShow() : void
      {
         if(!this.isAnimation)
         {
            this.curFrameStopCount = this.frameStopCount[this.curPoint.y][this.curPoint.x];
            this.refreshCurFrame();
         }
      }
      
      protected function refreshCurFrame() : void
      {
         var _loc1_:* = undefined;
         var _loc2_:int = 0;
         if(!this.isAnimation)
         {
            _loc1_ = null;
            _loc2_ = 0;
            while(_loc2_ < this.bmSprite.numChildren)
            {
               _loc1_ = this.bmSprite.getChildAt(0) as Bitmap;
               _loc1_.bitmapData.dispose();
               this.bmSprite.removeChild(_loc1_);
               _loc2_++;
            }
            _loc1_ = new Bitmap(this.getCurFrameBitmapData());
            this.bmSprite.addChild(_loc1_);
         }
      }
      
      protected function getCurFrameBitmapData() : BitmapData
      {
         var _loc1_:int = 0;
         var _loc2_:* = undefined;
         var _loc3_:* = undefined;
         var _loc4_:* = undefined;
         var _loc5_:* = undefined;
         var _loc6_:* = undefined;
         var _loc7_:* = undefined;
         var _loc8_:BitmapData = null;
         if(!this.isAnimation)
         {
            _loc1_ = 0;
            _loc2_ = null;
            _loc3_ = null;
            _loc4_ = null;
            _loc5_ = null;
            _loc6_ = null;
            _loc7_ = null;
            _loc8_ = new BitmapData(this.bmWidth,this.bmHeight,true,16711680);
            _loc1_ = 0;
            while(_loc1_ < this.bmdArray.length)
            {
               _loc2_ = this.bmdArray[_loc1_] as Object;
               if(_loc2_)
               {
                  _loc3_ = _loc2_.source as Array;
                  if(_loc3_.length == 2)
                  {
                     if(_loc3_[0] is BitmapData)
                     {
                        _loc4_ = _loc3_[0] as BitmapData;
                        _loc5_ = _loc3_[1] as BitmapData;
                        this.frameCountMaxLen = Number(_loc4_.width) / Number(this.bmWidth);
                        if(this.curPoint.x <= this.frameCountMaxLen - 1)
                        {
                           if(this.direct == 1)
                           {
                              _loc8_.copyPixels(_loc5_,new Rectangle(Number(this.bmWidth) * (this.frameCountMaxLen - (this.curPoint.x + 1)),Number(this.bmHeight) * Number(this.curPoint.y),this.bmWidth,this.bmHeight),new Point(0,0),null,null,true);
                           }
                           else
                           {
                              _loc8_.copyPixels(_loc4_,new Rectangle(Number(this.bmWidth) * Number(this.curPoint.x),Number(this.bmHeight) * Number(this.curPoint.y),this.bmWidth,this.bmHeight),new Point(0,0),null,null,true);
                           }
                        }
                     }
                     else if(_loc3_[0] is Array)
                     {
                        _loc6_ = _loc3_[0] as Array;
                        _loc7_ = _loc3_[1] as Array;
                        _loc4_ = _loc6_[this.curPoint.y][this.curPoint.x];
                        _loc5_ = _loc7_[this.curPoint.y][this.curPoint.x];
                        if(Boolean(_loc4_) && Boolean(_loc5_))
                        {
                           if(this.direct == 1)
                           {
                              _loc8_.copyPixels(_loc5_,_loc5_.rect,new Point(0,0),null,null,true);
                           }
                           else
                           {
                              _loc8_.copyPixels(_loc4_,_loc4_.rect,new Point(0,0),null,null,true);
                           }
                        }
                     }
                  }
               }
               _loc1_++;
            }
            return _loc8_;
         }
      }
      
      protected function addFrameScriptEnterEveryFrame() : void
      {
         if(!this.isAnimation)
         {
            if(this.enterFrameFunc != null)
            {
               this.enterFrameFunc(this.curPoint);
            }
         }
      }
      
      protected function addFrameScriptExitEveryFrame() : void
      {
         if(!this.isAnimation)
         {
            if(this.exitFrameFunc != null)
            {
               this.exitFrameFunc(this.curPoint);
            }
         }
      }
      
      public function setEnterFrameCallBack(param1:Function, param2:Function) : void
      {
         this.enterFrameFunc = param1;
         this.exitFrameFunc = param2;
      }
      
      public function setAddScriptWhenFrameOver(param1:Function) : void
      {
         this.addFrameScriptWhenFrameOver = param1;
      }
      
      public function setFramePointX(param1:int) : void
      {
         if(!this.isAnimation)
         {
            this.curPoint.x = param1;
            this.frameShow();
         }
      }
      
      public function setFramePointY(param1:int) : void
      {
         this.curPoint.y = param1;
         this.frameShow();
      }
      
      public function step() : void
      {
         var _loc1_:* = undefined;
         var _loc2_:* = undefined;
         var _loc3_:* = undefined;
         if(!this.isAnimation)
         {
            _loc1_ = 0;
            _loc2_ = null;
            _loc3_ = 0;
            if(!this.isStopFrame)
            {
               this.addFrameScriptEnterEveryFrame();
               if(this.curFrameStopCount > 1)
               {
                  --this.curFrameStopCount;
               }
               else
               {
                  if(this.frameCount[this.curPoint.y] is Array)
                  {
                     _loc2_ = this.frameCount[this.curPoint.y] as Array;
                     _loc1_ = uint(_loc2_[this.curPoint.x] - 1);
                  }
                  else
                  {
                     _loc1_ = uint(this.frameCount[this.curPoint.y] - 1);
                  }
                  if(this.curKeyFrameIndex >= _loc1_)
                  {
                     if(this.addFrameScriptWhenFrameOver != null)
                     {
                        this.addFrameScriptWhenFrameOver(this.curPoint.y);
                     }
                     this.curKeyFrameIndex = 0;
                  }
                  else
                  {
                     _loc3_ = uint((this.frameStopCount[this.curPoint.y] as Array).length);
                     if(this.curPoint.x >= _loc3_ - 1)
                     {
                        this.curPoint.x = 0;
                     }
                     else
                     {
                        ++this.curPoint.x;
                     }
                     ++this.curKeyFrameIndex;
                     this.frameShow();
                  }
               }
               this.addFrameScriptExitEveryFrame();
            }
         }
      }
      
      public function setState(param1:String) : void
      {
         if(this.state != param1)
         {
            this.state = param1;
            this.curKeyFrameIndex = 0;
         }
      }
      
      public function getState() : String
      {
         return this.state;
      }
      
      public function setFrameStopCount(param1:Array) : void
      {
         this.frameStopCount = param1;
      }
      
      public function getFrameStopCount() : Array
      {
         return this.frameStopCount;
      }
      
      public function setFrameCount(param1:Array) : void
      {
         this.frameCount = param1;
      }
      
      public function getCurPoint() : Point
      {
         return this.curPoint;
      }
      
      public function resetCurFrameStopCount() : void
      {
         this.curFrameStopCount = this.frameStopCount[this.curPoint.y][this.curPoint.x];
      }
      
      public function getCurFrameCount() : int
      {
         return this.curFrameStopCount;
      }
      
      public function setCurFrameCount(param1:int) : void
      {
         this.curFrameStopCount = param1;
      }
      
      public function stopFrame() : void
      {
         this._isPlaying = false;
         this.isStopFrame = true;
      }
      
      public function continueFrame() : void
      {
         this._isPlaying = true;
         this.isStopFrame = false;
      }
      
      public function setOffsetXY(param1:int, param2:int) : void
      {
         this.offsetX = param1;
         this.offsetY = param2;
         this.setXYByDirect();
      }
      
      public function setXYByDirect() : void
      {
         if(this.direct == 0)
         {
            this.x = -Number(this.bmWidth) / 2 - Number(this.offsetX);
         }
         else
         {
            this.x = -Number(this.bmWidth) / 2 + this.offsetX;
         }
         this.y = -Number(this.bmHeight) / 2 + this.offsetY;
      }
      
      public function replaceBitmapDataByName(param1:String, param2:Array) : void
      {
         var _loc3_:* = undefined;
         var _loc4_:int = 0;
         if(!this.isAnimation)
         {
            _loc3_ = null;
            _loc4_ = 0;
            while(_loc4_ < this.bmdArray.length)
            {
               _loc3_ = this.bmdArray[_loc4_] as Object;
               if(_loc3_.name == param1)
               {
                  _loc3_.source = param2;
               }
               this.bmdArray[_loc4_] = _loc3_;
               _loc4_++;
            }
         }
      }
      
      public function replaceBitmapDataByName1(param1:String, param2:Array) : void
      {
         var _loc3_:* = null;
         var _loc4_:int = 0;
         _loc3_ = this.bmdArray[0] as Object;
         if(_loc3_.name == param1)
         {
            _loc3_.source = param2;
         }
         this.bmdArray[0] = _loc3_;
      }
      
      public function hide() : void
      {
         this.visible = false;
      }
      
      public function show() : void
      {
         this.visible = true;
      }
      
      public function setDirect(param1:uint) : void
      {
         if(!this.isAnimation)
         {
            if(this.getDirect() != param1)
            {
               this.direct = param1;
               this.setXYByDirect();
               this.refreshCurFrame();
            }
         }
         else if(this.getDirect() != param1)
         {
            this._curClip.scaleX = param1;
            this.applyOffset();
         }
      }
      
      public function getCurKeyFrameIndex() : uint
      {
         return this.curKeyFrameIndex;
      }
      
      public function getDirect() : int
      {
         if(this.isAnimation)
         {
            if(scaleX == -1)
            {
               return 0;
            }
            return scaleX;
         }
         return this.direct;
      }
      
      public function destroy() : void
      {
         var _loc1_:String = null;
         if(!this.isAnimation)
         {
            this.bmdArray.length = 0;
            this.enterFrameFunc = null;
            this.exitFrameFunc = null;
            this.addFrameScriptWhenFrameOver = null;
            if(this.parent)
            {
               this.parent.removeChild(this);
            }
         }
         else
         {
            _loc1_ = null;
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
      }
   }
}

