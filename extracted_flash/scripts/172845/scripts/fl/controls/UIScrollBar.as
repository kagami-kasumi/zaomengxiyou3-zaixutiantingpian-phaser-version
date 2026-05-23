package fl.controls
{
   import fl.core.InvalidationType;
   import fl.core.UIComponent;
   import fl.events.ScrollEvent;
   import flash.display.DisplayObject;
   import flash.events.Event;
   import flash.events.TextEvent;
   
   [Embed(source="/_assets/assets.swf", symbol="symbol382")]
   public class UIScrollBar extends ScrollBar
   {
      
      private static var defaultStyles:Object = {};
      
      protected var _scrollTarget:DisplayObject;
      
      protected var inEdit:Boolean = false;
      
      protected var inScroll:Boolean = false;
      
      protected var _targetScrollProperty:String;
      
      protected var _targetMaxScrollProperty:String;
      
      public function UIScrollBar()
      {
         super();
      }
      
      public static function getStyleDefinition() : Object
      {
         return UIComponent.mergeStyles(defaultStyles,ScrollBar.getStyleDefinition());
      }
      
      override public function set minScrollPosition(param1:Number) : void
      {
         super.minScrollPosition = param1 < 0 ? 0 : param1;
      }
      
      override public function set maxScrollPosition(param1:Number) : void
      {
         var _loc2_:Number = param1;
         if(this._scrollTarget != null)
         {
            _loc2_ = Math.min(_loc2_,this._scrollTarget[this._targetMaxScrollProperty]);
         }
         super.maxScrollPosition = _loc2_;
      }
      
      public function get scrollTarget() : DisplayObject
      {
         return this._scrollTarget;
      }
      
      public function set scrollTarget(param1:DisplayObject) : void
      {
         var blockProg:String;
         var textDir:String;
         var hasPixelVS:Boolean;
         var scrollHoriz:Boolean;
         var rot:Number;
         var target:DisplayObject = param1;
         if(this._scrollTarget != null)
         {
            this._scrollTarget.removeEventListener(Event.CHANGE,this.handleTargetChange,false);
            this._scrollTarget.removeEventListener(TextEvent.TEXT_INPUT,this.handleTargetChange,false);
            this._scrollTarget.removeEventListener(Event.SCROLL,this.handleTargetScroll,false);
         }
         this._scrollTarget = target;
         blockProg = null;
         textDir = null;
         hasPixelVS = false;
         if(this._scrollTarget != null)
         {
            try
            {
               if(this._scrollTarget.hasOwnProperty("blockProgression"))
               {
                  blockProg = this._scrollTarget["blockProgression"];
               }
               if(this._scrollTarget.hasOwnProperty("direction"))
               {
                  textDir = this._scrollTarget["direction"];
               }
               if(this._scrollTarget.hasOwnProperty("pixelScrollV"))
               {
                  hasPixelVS = true;
               }
            }
            catch(e:Error)
            {
               blockProg = null;
               textDir = null;
            }
         }
         scrollHoriz = this.direction == ScrollBarDirection.HORIZONTAL;
         rot = Math.abs(this.rotation);
         if(scrollHoriz && (blockProg == "rl" || textDir == "rtl"))
         {
            if(getScaleY() > 0 && rotation == 90)
            {
               x += width;
            }
            setScaleY(-1);
         }
         else if(!scrollHoriz && blockProg == "rl" && textDir == "rtl")
         {
            if(getScaleY() > 0 && rotation != 90)
            {
               y += height;
            }
            setScaleY(-1);
         }
         else
         {
            if(getScaleY() < 0)
            {
               if(scrollHoriz)
               {
                  if(rotation == 90)
                  {
                     x -= width;
                  }
               }
               else if(rotation != 90)
               {
                  y -= height;
               }
            }
            setScaleY(1);
         }
         this.setTargetScrollProperties(scrollHoriz,blockProg,hasPixelVS);
         if(this._scrollTarget != null)
         {
            this._scrollTarget.addEventListener(Event.CHANGE,this.handleTargetChange,false,0,true);
            this._scrollTarget.addEventListener(TextEvent.TEXT_INPUT,this.handleTargetChange,false,0,true);
            this._scrollTarget.addEventListener(Event.SCROLL,this.handleTargetScroll,false,0,true);
         }
         invalidate(InvalidationType.DATA);
      }
      
      public function get scrollTargetName() : String
      {
         return this._scrollTarget.name;
      }
      
      public function set scrollTargetName(param1:String) : void
      {
         var target:String = param1;
         try
         {
            this.scrollTarget = parent.getChildByName(target);
         }
         catch(error:Error)
         {
            throw new Error("ScrollTarget not found, or is not a valid target");
         }
      }
      
      override public function get direction() : String
      {
         return super.direction;
      }
      
      override public function set direction(param1:String) : void
      {
         var _loc2_:DisplayObject = null;
         if(isLivePreview)
         {
            return;
         }
         if(!componentInspectorSetting && this._scrollTarget != null)
         {
            _loc2_ = this._scrollTarget;
            this.scrollTarget = null;
         }
         super.direction = param1;
         if(_loc2_ != null)
         {
            this.scrollTarget = _loc2_;
         }
         else
         {
            this.updateScrollTargetProperties();
         }
      }
      
      public function update() : void
      {
         this.inEdit = true;
         this.updateScrollTargetProperties();
         this.inEdit = false;
      }
      
      override protected function draw() : void
      {
         if(isInvalid(InvalidationType.DATA))
         {
            this.updateScrollTargetProperties();
         }
         super.draw();
      }
      
      protected function updateScrollTargetProperties() : void
      {
         var local_tlf_internal:*;
         var blockProg:String = null;
         var hasPixelVS:Boolean = false;
         var pageSize:Number = NaN;
         var minScroll:Number = NaN;
         var minScrollVValue:* = undefined;
         if(this._scrollTarget == null)
         {
            this.setScrollProperties(pageSize,minScrollPosition,maxScrollPosition);
            scrollPosition = 0;
         }
         else
         {
            blockProg = null;
            hasPixelVS = false;
            try
            {
               if(this._scrollTarget.hasOwnProperty("blockProgression"))
               {
                  blockProg = this._scrollTarget["blockProgression"];
               }
               if(this._scrollTarget.hasOwnProperty("pixelScrollV"))
               {
                  hasPixelVS = true;
               }
            }
            catch(e1:Error)
            {
            }
            this.setTargetScrollProperties(this.direction == ScrollBarDirection.HORIZONTAL,blockProg,hasPixelVS);
            if(this._targetScrollProperty == "scrollH")
            {
               minScroll = 0;
               try
               {
                  if(this._scrollTarget.hasOwnProperty("controller") && Boolean(this._scrollTarget["controller"].hasOwnProperty("compositionWidth")))
                  {
                     pageSize = Number(this._scrollTarget["controller"]["compositionWidth"]);
                  }
                  else
                  {
                     pageSize = this._scrollTarget.width;
                  }
               }
               catch(e2:Error)
               {
                  pageSize = _scrollTarget.width;
               }
            }
            else
            {
               try
               {
                  if(blockProg != null)
                  {
                     minScrollVValue = this._scrollTarget["pixelMinScrollV"];
                     if(minScrollVValue is int)
                     {
                        minScroll = minScrollVValue;
                     }
                     else
                     {
                        minScroll = 1;
                     }
                  }
                  else
                  {
                     minScroll = 1;
                  }
               }
               catch(e3:Error)
               {
                  minScroll = 1;
               }
               pageSize = 10;
            }
            this.setScrollProperties(pageSize,minScroll,this.scrollTarget[this._targetMaxScrollProperty]);
            scrollPosition = this._scrollTarget[this._targetScrollProperty];
         }
      }
      
      override public function setScrollProperties(param1:Number, param2:Number, param3:Number, param4:Number = 0) : void
      {
         var _loc5_:Number = param3;
         var _loc6_:Number = param2 < 0 ? 0 : param2;
         if(this._scrollTarget != null)
         {
            _loc5_ = Math.min(param3,this._scrollTarget[this._targetMaxScrollProperty]);
         }
         super.setScrollProperties(param1,_loc6_,_loc5_,param4);
      }
      
      override public function setScrollPosition(param1:Number, param2:Boolean = true) : void
      {
         super.setScrollPosition(param1,param2);
         if(!this._scrollTarget)
         {
            this.inScroll = false;
            return;
         }
         this.updateTargetScroll();
      }
      
      protected function updateTargetScroll(param1:ScrollEvent = null) : void
      {
         if(this.inEdit)
         {
            return;
         }
         this._scrollTarget[this._targetScrollProperty] = scrollPosition;
      }
      
      protected function handleTargetChange(param1:Event) : void
      {
         this.inEdit = true;
         this.setScrollPosition(this._scrollTarget[this._targetScrollProperty],true);
         this.updateScrollTargetProperties();
         this.inEdit = false;
      }
      
      protected function handleTargetScroll(param1:Event) : void
      {
         if(inDrag)
         {
            return;
         }
         if(!enabled)
         {
            return;
         }
         this.inEdit = true;
         this.updateScrollTargetProperties();
         scrollPosition = this._scrollTarget[this._targetScrollProperty];
         this.inEdit = false;
      }
      
      private function setTargetScrollProperties(param1:Boolean, param2:String, param3:Boolean = false) : void
      {
         if(param2 == "rl")
         {
            if(param1)
            {
               this._targetScrollProperty = param3 ? "pixelScrollV" : "scrollV";
               this._targetMaxScrollProperty = param3 ? "pixelMaxScrollV" : "maxScrollV";
            }
            else
            {
               this._targetScrollProperty = "scrollH";
               this._targetMaxScrollProperty = "maxScrollH";
            }
         }
         else if(param1)
         {
            this._targetScrollProperty = "scrollH";
            this._targetMaxScrollProperty = "maxScrollH";
         }
         else
         {
            this._targetScrollProperty = param3 ? "pixelScrollV" : "scrollV";
            this._targetMaxScrollProperty = param3 ? "pixelMaxScrollV" : "maxScrollV";
         }
      }
   }
}

