package fl.controls
{
   import fl.core.InvalidationType;
   import fl.core.UIComponent;
   import fl.events.ComponentEvent;
   import fl.events.ScrollEvent;
   import flash.display.DisplayObjectContainer;
   import flash.events.MouseEvent;
   
   [Embed(source="/_assets/assets.swf", symbol="symbol89")]
   public class ScrollBar extends UIComponent
   {
      
      public static const WIDTH:Number = 15;
      
      private static var defaultStyles:Object = {
         "downArrowDisabledSkin":"ScrollArrowDown_disabledSkin",
         "downArrowDownSkin":"ScrollArrowDown_downSkin",
         "downArrowOverSkin":"ScrollArrowDown_overSkin",
         "downArrowUpSkin":"ScrollArrowDown_upSkin",
         "thumbDisabledSkin":"ScrollThumb_upSkin",
         "thumbDownSkin":"ScrollThumb_downSkin",
         "thumbOverSkin":"ScrollThumb_overSkin",
         "thumbUpSkin":"ScrollThumb_upSkin",
         "trackDisabledSkin":"ScrollTrack_skin",
         "trackDownSkin":"ScrollTrack_skin",
         "trackOverSkin":"ScrollTrack_skin",
         "trackUpSkin":"ScrollTrack_skin",
         "upArrowDisabledSkin":"ScrollArrowUp_disabledSkin",
         "upArrowDownSkin":"ScrollArrowUp_downSkin",
         "upArrowOverSkin":"ScrollArrowUp_overSkin",
         "upArrowUpSkin":"ScrollArrowUp_upSkin",
         "thumbIcon":"ScrollBar_thumbIcon",
         "repeatDelay":500,
         "repeatInterval":35
      };
      
      protected static const DOWN_ARROW_STYLES:Object = {
         "disabledSkin":"downArrowDisabledSkin",
         "downSkin":"downArrowDownSkin",
         "overSkin":"downArrowOverSkin",
         "upSkin":"downArrowUpSkin",
         "repeatDelay":"repeatDelay",
         "repeatInterval":"repeatInterval"
      };
      
      protected static const THUMB_STYLES:Object = {
         "disabledSkin":"thumbDisabledSkin",
         "downSkin":"thumbDownSkin",
         "overSkin":"thumbOverSkin",
         "upSkin":"thumbUpSkin",
         "icon":"thumbIcon",
         "textPadding":0
      };
      
      protected static const TRACK_STYLES:Object = {
         "disabledSkin":"trackDisabledSkin",
         "downSkin":"trackDownSkin",
         "overSkin":"trackOverSkin",
         "upSkin":"trackUpSkin",
         "repeatDelay":"repeatDelay",
         "repeatInterval":"repeatInterval"
      };
      
      protected static const UP_ARROW_STYLES:Object = {
         "disabledSkin":"upArrowDisabledSkin",
         "downSkin":"upArrowDownSkin",
         "overSkin":"upArrowOverSkin",
         "upSkin":"upArrowUpSkin",
         "repeatDelay":"repeatDelay",
         "repeatInterval":"repeatInterval"
      };
      
      private var _pageSize:Number = 10;
      
      private var _pageScrollSize:Number = 0;
      
      private var _lineScrollSize:Number = 1;
      
      private var _minScrollPosition:Number = 0;
      
      private var _maxScrollPosition:Number = 0;
      
      private var _scrollPosition:Number = 0;
      
      private var _direction:String = "vertical";
      
      private var thumbScrollOffset:Number;
      
      protected var inDrag:Boolean = false;
      
      protected var upArrow:BaseButton;
      
      protected var downArrow:BaseButton;
      
      protected var thumb:LabelButton;
      
      protected var track:BaseButton;
      
      public function ScrollBar()
      {
         super();
         this.setStyles();
         focusEnabled = false;
      }
      
      public static function getStyleDefinition() : Object
      {
         return defaultStyles;
      }
      
      override public function setSize(param1:Number, param2:Number) : void
      {
         if(this._direction == ScrollBarDirection.HORIZONTAL)
         {
            super.setSize(param2,param1);
         }
         else
         {
            super.setSize(param1,param2);
         }
      }
      
      override public function get width() : Number
      {
         return this._direction == ScrollBarDirection.HORIZONTAL ? super.height : super.width;
      }
      
      override public function get height() : Number
      {
         return this._direction == ScrollBarDirection.HORIZONTAL ? super.width : super.height;
      }
      
      override public function get enabled() : Boolean
      {
         return super.enabled;
      }
      
      override public function set enabled(param1:Boolean) : void
      {
         super.enabled = param1;
         this.downArrow.enabled = this.track.enabled = this.thumb.enabled = this.upArrow.enabled = this.enabled && this._maxScrollPosition > this._minScrollPosition;
         this.updateThumb();
      }
      
      public function setScrollProperties(param1:Number, param2:Number, param3:Number, param4:Number = 0) : void
      {
         this.pageSize = param1;
         this._minScrollPosition = param2;
         this._maxScrollPosition = param3;
         if(param4 >= 0)
         {
            this._pageScrollSize = param4;
         }
         this.enabled = this._maxScrollPosition > this._minScrollPosition;
         this.setScrollPosition(this._scrollPosition,false);
         this.updateThumb();
      }
      
      public function get scrollPosition() : Number
      {
         return this._scrollPosition;
      }
      
      public function set scrollPosition(param1:Number) : void
      {
         this.setScrollPosition(param1,true);
      }
      
      public function get minScrollPosition() : Number
      {
         return this._minScrollPosition;
      }
      
      public function set minScrollPosition(param1:Number) : void
      {
         this.setScrollProperties(this._pageSize,param1,this._maxScrollPosition);
      }
      
      public function get maxScrollPosition() : Number
      {
         return this._maxScrollPosition;
      }
      
      public function set maxScrollPosition(param1:Number) : void
      {
         this.setScrollProperties(this._pageSize,this._minScrollPosition,param1);
      }
      
      public function get pageSize() : Number
      {
         return this._pageSize;
      }
      
      public function set pageSize(param1:Number) : void
      {
         if(param1 > 0)
         {
            this._pageSize = param1;
         }
      }
      
      public function get pageScrollSize() : Number
      {
         return this._pageScrollSize == 0 ? this._pageSize : this._pageScrollSize;
      }
      
      public function set pageScrollSize(param1:Number) : void
      {
         if(param1 >= 0)
         {
            this._pageScrollSize = param1;
         }
      }
      
      public function get lineScrollSize() : Number
      {
         return this._lineScrollSize;
      }
      
      public function set lineScrollSize(param1:Number) : void
      {
         if(param1 > 0)
         {
            this._lineScrollSize = param1;
         }
      }
      
      public function get direction() : String
      {
         return this._direction;
      }
      
      public function set direction(param1:String) : void
      {
         if(this._direction == param1)
         {
            return;
         }
         this._direction = param1;
         if(isLivePreview)
         {
            return;
         }
         setScaleY(1);
         var _loc2_:Boolean = this._direction == ScrollBarDirection.HORIZONTAL;
         if(_loc2_ && componentInspectorSetting)
         {
            if(rotation == 90)
            {
               return;
            }
            setScaleX(-1);
            rotation = -90;
         }
         if(!componentInspectorSetting)
         {
            if(_loc2_ && rotation == 0)
            {
               rotation = -90;
               setScaleX(-1);
            }
            else if(!_loc2_ && rotation == -90)
            {
               rotation = 0;
               setScaleX(1);
            }
         }
         invalidate(InvalidationType.SIZE);
      }
      
      override protected function configUI() : void
      {
         super.configUI();
         this.track = new BaseButton();
         this.track.move(0,14);
         this.track.useHandCursor = false;
         this.track.autoRepeat = true;
         this.track.focusEnabled = false;
         addChild(this.track);
         this.thumb = new LabelButton();
         this.thumb.label = "";
         this.thumb.setSize(WIDTH,15);
         this.thumb.move(0,15);
         this.thumb.focusEnabled = false;
         addChild(this.thumb);
         this.downArrow = new BaseButton();
         this.downArrow.setSize(WIDTH,14);
         this.downArrow.autoRepeat = true;
         this.downArrow.focusEnabled = false;
         addChild(this.downArrow);
         this.upArrow = new BaseButton();
         this.upArrow.setSize(WIDTH,14);
         this.upArrow.move(0,0);
         this.upArrow.autoRepeat = true;
         this.upArrow.focusEnabled = false;
         addChild(this.upArrow);
         this.upArrow.addEventListener(ComponentEvent.BUTTON_DOWN,this.scrollPressHandler,false,0,true);
         this.downArrow.addEventListener(ComponentEvent.BUTTON_DOWN,this.scrollPressHandler,false,0,true);
         this.track.addEventListener(ComponentEvent.BUTTON_DOWN,this.scrollPressHandler,false,0,true);
         this.thumb.addEventListener(MouseEvent.MOUSE_DOWN,this.thumbPressHandler,false,0,true);
         this.enabled = false;
      }
      
      override protected function draw() : void
      {
         var _loc1_:Number = NaN;
         if(isInvalid(InvalidationType.SIZE))
         {
            _loc1_ = super.height;
            this.downArrow.move(0,Math.max(this.upArrow.height,_loc1_ - this.downArrow.height));
            this.track.setSize(WIDTH,Math.max(0,_loc1_ - (this.downArrow.height + this.upArrow.height)));
            this.updateThumb();
         }
         if(isInvalid(InvalidationType.STYLES,InvalidationType.STATE))
         {
            this.setStyles();
         }
         this.downArrow.drawNow();
         this.upArrow.drawNow();
         this.track.drawNow();
         this.thumb.drawNow();
         validate();
      }
      
      protected function scrollPressHandler(param1:ComponentEvent) : void
      {
         var _loc2_:Number = NaN;
         var _loc3_:Number = NaN;
         param1.stopImmediatePropagation();
         if(param1.currentTarget == this.upArrow)
         {
            this.setScrollPosition(this._scrollPosition - this._lineScrollSize);
         }
         else if(param1.currentTarget == this.downArrow)
         {
            this.setScrollPosition(this._scrollPosition + this._lineScrollSize);
         }
         else
         {
            _loc2_ = this.track.mouseY / this.track.height * (this._maxScrollPosition - this._minScrollPosition) + this._minScrollPosition;
            _loc3_ = this.pageScrollSize == 0 ? this.pageSize : this.pageScrollSize;
            if(this._scrollPosition < _loc2_)
            {
               this.setScrollPosition(Math.min(_loc2_,this._scrollPosition + _loc3_));
            }
            else if(this._scrollPosition > _loc2_)
            {
               this.setScrollPosition(Math.max(_loc2_,this._scrollPosition - _loc3_));
            }
         }
      }
      
      protected function thumbPressHandler(param1:MouseEvent) : void
      {
         this.inDrag = true;
         this.thumbScrollOffset = mouseY - this.thumb.y;
         this.thumb.mouseStateLocked = true;
         mouseChildren = false;
         var _loc2_:DisplayObjectContainer = focusManager.form;
         _loc2_.addEventListener(MouseEvent.MOUSE_MOVE,this.handleThumbDrag,false,0,true);
         _loc2_.addEventListener(MouseEvent.MOUSE_UP,this.thumbReleaseHandler,false,0,true);
      }
      
      protected function handleThumbDrag(param1:MouseEvent) : void
      {
         var _loc2_:Number = Math.max(0,Math.min(this.track.height - this.thumb.height,mouseY - this.track.y - this.thumbScrollOffset));
         this.setScrollPosition(_loc2_ / (this.track.height - this.thumb.height) * (this._maxScrollPosition - this._minScrollPosition) + this._minScrollPosition);
      }
      
      protected function thumbReleaseHandler(param1:MouseEvent) : void
      {
         this.inDrag = false;
         mouseChildren = true;
         this.thumb.mouseStateLocked = false;
         var _loc2_:DisplayObjectContainer = focusManager.form;
         _loc2_.removeEventListener(MouseEvent.MOUSE_MOVE,this.handleThumbDrag);
         _loc2_.removeEventListener(MouseEvent.MOUSE_UP,this.thumbReleaseHandler);
      }
      
      public function setScrollPosition(param1:Number, param2:Boolean = true) : void
      {
         var _loc3_:Number = this.scrollPosition;
         this._scrollPosition = Math.max(this._minScrollPosition,Math.min(this._maxScrollPosition,param1));
         if(_loc3_ == this._scrollPosition)
         {
            return;
         }
         if(param2)
         {
            dispatchEvent(new ScrollEvent(this._direction,this.scrollPosition - _loc3_,this.scrollPosition));
         }
         this.updateThumb();
      }
      
      protected function setStyles() : void
      {
         copyStylesToChild(this.downArrow,DOWN_ARROW_STYLES);
         copyStylesToChild(this.thumb,THUMB_STYLES);
         copyStylesToChild(this.track,TRACK_STYLES);
         copyStylesToChild(this.upArrow,UP_ARROW_STYLES);
      }
      
      protected function updateThumb() : void
      {
         var _loc1_:Number = this._maxScrollPosition - this._minScrollPosition + this._pageSize;
         if(this.track.height <= 12 || this._maxScrollPosition <= this._minScrollPosition || (_loc1_ == 0 || isNaN(_loc1_)))
         {
            this.thumb.height = 12;
            this.thumb.visible = false;
         }
         else
         {
            this.thumb.height = Math.max(13,this._pageSize / _loc1_ * this.track.height);
            this.thumb.y = this.track.y + (this.track.height - this.thumb.height) * ((this._scrollPosition - this._minScrollPosition) / (this._maxScrollPosition - this._minScrollPosition));
            this.thumb.visible = this.enabled;
         }
      }
   }
}

