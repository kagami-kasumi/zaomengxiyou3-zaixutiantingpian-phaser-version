package fl.containers
{
   import fl.controls.ScrollBar;
   import fl.controls.ScrollBarDirection;
   import fl.controls.ScrollPolicy;
   import fl.core.InvalidationType;
   import fl.core.UIComponent;
   import fl.events.ScrollEvent;
   import flash.display.DisplayObject;
   import flash.display.Graphics;
   import flash.display.Shape;
   import flash.events.MouseEvent;
   import flash.geom.Rectangle;
   
   public class BaseScrollPane extends UIComponent
   {
      
      private static var defaultStyles:Object = {
         "repeatDelay":500,
         "repeatInterval":35,
         "skin":"ScrollPane_upSkin",
         "contentPadding":0,
         "disabledAlpha":0.5
      };
      
      protected static const SCROLL_BAR_STYLES:Object = {
         "upArrowDisabledSkin":"upArrowDisabledSkin",
         "upArrowDownSkin":"upArrowDownSkin",
         "upArrowOverSkin":"upArrowOverSkin",
         "upArrowUpSkin":"upArrowUpSkin",
         "downArrowDisabledSkin":"downArrowDisabledSkin",
         "downArrowDownSkin":"downArrowDownSkin",
         "downArrowOverSkin":"downArrowOverSkin",
         "downArrowUpSkin":"downArrowUpSkin",
         "thumbDisabledSkin":"thumbDisabledSkin",
         "thumbDownSkin":"thumbDownSkin",
         "thumbOverSkin":"thumbOverSkin",
         "thumbUpSkin":"thumbUpSkin",
         "thumbIcon":"thumbIcon",
         "trackDisabledSkin":"trackDisabledSkin",
         "trackDownSkin":"trackDownSkin",
         "trackOverSkin":"trackOverSkin",
         "trackUpSkin":"trackUpSkin",
         "repeatDelay":"repeatDelay",
         "repeatInterval":"repeatInterval"
      };
      
      protected var _verticalScrollBar:ScrollBar;
      
      protected var _horizontalScrollBar:ScrollBar;
      
      protected var contentScrollRect:Rectangle;
      
      protected var disabledOverlay:Shape;
      
      protected var background:DisplayObject;
      
      protected var contentWidth:Number = 0;
      
      protected var contentHeight:Number = 0;
      
      protected var _horizontalScrollPolicy:String;
      
      protected var _verticalScrollPolicy:String;
      
      protected var contentPadding:Number = 0;
      
      protected var availableWidth:Number;
      
      protected var availableHeight:Number;
      
      protected var vOffset:Number = 0;
      
      protected var vScrollBar:Boolean;
      
      protected var hScrollBar:Boolean;
      
      protected var _maxHorizontalScrollPosition:Number = 0;
      
      protected var _horizontalPageScrollSize:Number = 0;
      
      protected var _verticalPageScrollSize:Number = 0;
      
      protected var defaultLineScrollSize:Number = 4;
      
      protected var useFixedHorizontalScrolling:Boolean = false;
      
      protected var _useBitmpScrolling:Boolean = false;
      
      public function BaseScrollPane()
      {
         super();
      }
      
      public static function getStyleDefinition() : Object
      {
         return mergeStyles(defaultStyles,ScrollBar.getStyleDefinition());
      }
      
      override public function set enabled(param1:Boolean) : void
      {
         if(enabled == param1)
         {
            return;
         }
         this._verticalScrollBar.enabled = param1;
         this._horizontalScrollBar.enabled = param1;
         super.enabled = param1;
      }
      
      public function get horizontalScrollPolicy() : String
      {
         return this._horizontalScrollPolicy;
      }
      
      public function set horizontalScrollPolicy(param1:String) : void
      {
         this._horizontalScrollPolicy = param1;
         invalidate(InvalidationType.SIZE);
      }
      
      public function get verticalScrollPolicy() : String
      {
         return this._verticalScrollPolicy;
      }
      
      public function set verticalScrollPolicy(param1:String) : void
      {
         this._verticalScrollPolicy = param1;
         invalidate(InvalidationType.SIZE);
      }
      
      public function get horizontalLineScrollSize() : Number
      {
         return this._horizontalScrollBar.lineScrollSize;
      }
      
      public function set horizontalLineScrollSize(param1:Number) : void
      {
         this._horizontalScrollBar.lineScrollSize = param1;
      }
      
      public function get verticalLineScrollSize() : Number
      {
         return this._verticalScrollBar.lineScrollSize;
      }
      
      public function set verticalLineScrollSize(param1:Number) : void
      {
         this._verticalScrollBar.lineScrollSize = param1;
      }
      
      public function get horizontalScrollPosition() : Number
      {
         return this._horizontalScrollBar.scrollPosition;
      }
      
      public function set horizontalScrollPosition(param1:Number) : void
      {
         drawNow();
         this._horizontalScrollBar.scrollPosition = param1;
         this.setHorizontalScrollPosition(this._horizontalScrollBar.scrollPosition,false);
      }
      
      public function get verticalScrollPosition() : Number
      {
         return this._verticalScrollBar.scrollPosition;
      }
      
      public function set verticalScrollPosition(param1:Number) : void
      {
         drawNow();
         this._verticalScrollBar.scrollPosition = param1;
         this.setVerticalScrollPosition(this._verticalScrollBar.scrollPosition,false);
      }
      
      public function get maxHorizontalScrollPosition() : Number
      {
         drawNow();
         return Math.max(0,this.contentWidth - this.availableWidth);
      }
      
      public function get maxVerticalScrollPosition() : Number
      {
         drawNow();
         return Math.max(0,this.contentHeight - this.availableHeight);
      }
      
      public function get useBitmapScrolling() : Boolean
      {
         return this._useBitmpScrolling;
      }
      
      public function set useBitmapScrolling(param1:Boolean) : void
      {
         this._useBitmpScrolling = param1;
         invalidate(InvalidationType.STATE);
      }
      
      public function get horizontalPageScrollSize() : Number
      {
         if(isNaN(this.availableWidth))
         {
            drawNow();
         }
         return this._horizontalPageScrollSize == 0 && !isNaN(this.availableWidth) ? this.availableWidth : this._horizontalPageScrollSize;
      }
      
      public function set horizontalPageScrollSize(param1:Number) : void
      {
         this._horizontalPageScrollSize = param1;
         invalidate(InvalidationType.SIZE);
      }
      
      public function get verticalPageScrollSize() : Number
      {
         if(isNaN(this.availableHeight))
         {
            drawNow();
         }
         return this._verticalPageScrollSize == 0 && !isNaN(this.availableHeight) ? this.availableHeight : this._verticalPageScrollSize;
      }
      
      public function set verticalPageScrollSize(param1:Number) : void
      {
         this._verticalPageScrollSize = param1;
         invalidate(InvalidationType.SIZE);
      }
      
      public function get horizontalScrollBar() : ScrollBar
      {
         return this._horizontalScrollBar;
      }
      
      public function get verticalScrollBar() : ScrollBar
      {
         return this._verticalScrollBar;
      }
      
      override protected function configUI() : void
      {
         super.configUI();
         this.contentScrollRect = new Rectangle(0,0,85,85);
         this._verticalScrollBar = new ScrollBar();
         this._verticalScrollBar.addEventListener(ScrollEvent.SCROLL,this.handleScroll,false,0,true);
         this._verticalScrollBar.visible = false;
         this._verticalScrollBar.lineScrollSize = this.defaultLineScrollSize;
         addChild(this._verticalScrollBar);
         copyStylesToChild(this._verticalScrollBar,SCROLL_BAR_STYLES);
         this._horizontalScrollBar = new ScrollBar();
         this._horizontalScrollBar.direction = ScrollBarDirection.HORIZONTAL;
         this._horizontalScrollBar.addEventListener(ScrollEvent.SCROLL,this.handleScroll,false,0,true);
         this._horizontalScrollBar.visible = false;
         this._horizontalScrollBar.lineScrollSize = this.defaultLineScrollSize;
         addChild(this._horizontalScrollBar);
         copyStylesToChild(this._horizontalScrollBar,SCROLL_BAR_STYLES);
         this.disabledOverlay = new Shape();
         var _loc1_:Graphics = this.disabledOverlay.graphics;
         _loc1_.beginFill(16777215);
         _loc1_.drawRect(0,0,width,height);
         _loc1_.endFill();
         addEventListener(MouseEvent.MOUSE_WHEEL,this.handleWheel,false,0,true);
      }
      
      protected function setContentSize(param1:Number, param2:Number) : void
      {
         if((this.contentWidth == param1 || this.useFixedHorizontalScrolling) && this.contentHeight == param2)
         {
            return;
         }
         this.contentWidth = param1;
         this.contentHeight = param2;
         invalidate(InvalidationType.SIZE);
      }
      
      protected function handleScroll(param1:ScrollEvent) : void
      {
         if(param1.target == this._verticalScrollBar)
         {
            this.setVerticalScrollPosition(param1.position);
         }
         else
         {
            this.setHorizontalScrollPosition(param1.position);
         }
      }
      
      protected function handleWheel(param1:MouseEvent) : void
      {
         if(!enabled || !this._verticalScrollBar.visible || this.contentHeight <= this.availableHeight)
         {
            return;
         }
         this._verticalScrollBar.scrollPosition -= param1.delta * this.verticalLineScrollSize;
         this.setVerticalScrollPosition(this._verticalScrollBar.scrollPosition);
         dispatchEvent(new ScrollEvent(ScrollBarDirection.VERTICAL,param1.delta,this.horizontalScrollPosition));
      }
      
      protected function setHorizontalScrollPosition(param1:Number, param2:Boolean = false) : void
      {
      }
      
      protected function setVerticalScrollPosition(param1:Number, param2:Boolean = false) : void
      {
      }
      
      override protected function draw() : void
      {
         if(isInvalid(InvalidationType.STYLES))
         {
            this.setStyles();
            this.drawBackground();
            if(this.contentPadding != getStyleValue("contentPadding"))
            {
               invalidate(InvalidationType.SIZE,false);
            }
         }
         if(isInvalid(InvalidationType.SIZE,InvalidationType.STATE))
         {
            this.drawLayout();
         }
         this.updateChildren();
         super.draw();
      }
      
      protected function setStyles() : void
      {
         copyStylesToChild(this._verticalScrollBar,SCROLL_BAR_STYLES);
         copyStylesToChild(this._horizontalScrollBar,SCROLL_BAR_STYLES);
      }
      
      protected function drawBackground() : void
      {
         var _loc1_:DisplayObject = this.background;
         this.background = getDisplayObjectInstance(getStyleValue("skin"));
         this.background.width = width;
         this.background.height = height;
         addChildAt(this.background,0);
         if(_loc1_ != null && _loc1_ != this.background)
         {
            removeChild(_loc1_);
         }
      }
      
      protected function drawLayout() : void
      {
         this.calculateAvailableSize();
         this.calculateContentWidth();
         this.background.width = width;
         this.background.height = height;
         if(this.vScrollBar)
         {
            this._verticalScrollBar.visible = true;
            this._verticalScrollBar.x = width - ScrollBar.WIDTH - this.contentPadding;
            this._verticalScrollBar.y = this.contentPadding;
            this._verticalScrollBar.height = this.availableHeight;
         }
         else
         {
            this._verticalScrollBar.visible = false;
         }
         this._verticalScrollBar.setScrollProperties(this.availableHeight,0,this.contentHeight - this.availableHeight,this.verticalPageScrollSize);
         this.setVerticalScrollPosition(this._verticalScrollBar.scrollPosition,false);
         if(this.hScrollBar)
         {
            this._horizontalScrollBar.visible = true;
            this._horizontalScrollBar.x = this.contentPadding;
            this._horizontalScrollBar.y = height - ScrollBar.WIDTH - this.contentPadding;
            this._horizontalScrollBar.width = this.availableWidth;
         }
         else
         {
            this._horizontalScrollBar.visible = false;
         }
         this._horizontalScrollBar.setScrollProperties(this.availableWidth,0,this.useFixedHorizontalScrolling ? this._maxHorizontalScrollPosition : this.contentWidth - this.availableWidth,this.horizontalPageScrollSize);
         this.setHorizontalScrollPosition(this._horizontalScrollBar.scrollPosition,false);
         this.drawDisabledOverlay();
      }
      
      protected function drawDisabledOverlay() : void
      {
         if(enabled)
         {
            if(contains(this.disabledOverlay))
            {
               removeChild(this.disabledOverlay);
            }
         }
         else
         {
            this.disabledOverlay.x = this.disabledOverlay.y = this.contentPadding;
            this.disabledOverlay.width = this.availableWidth;
            this.disabledOverlay.height = this.availableHeight;
            this.disabledOverlay.alpha = getStyleValue("disabledAlpha") as Number;
            addChild(this.disabledOverlay);
         }
      }
      
      protected function calculateAvailableSize() : void
      {
         var _loc1_:Number = ScrollBar.WIDTH;
         var _loc2_:Number = this.contentPadding = Number(getStyleValue("contentPadding"));
         var _loc3_:Number = height - 2 * _loc2_ - this.vOffset;
         this.vScrollBar = this._verticalScrollPolicy == ScrollPolicy.ON || this._verticalScrollPolicy == ScrollPolicy.AUTO && this.contentHeight > _loc3_;
         var _loc4_:Number = width - (this.vScrollBar ? _loc1_ : 0) - 2 * _loc2_;
         var _loc5_:Number = this.useFixedHorizontalScrolling ? this._maxHorizontalScrollPosition : this.contentWidth - _loc4_;
         this.hScrollBar = this._horizontalScrollPolicy == ScrollPolicy.ON || this._horizontalScrollPolicy == ScrollPolicy.AUTO && _loc5_ > 0;
         if(this.hScrollBar)
         {
            _loc3_ -= _loc1_;
         }
         if(this.hScrollBar && !this.vScrollBar && this._verticalScrollPolicy == ScrollPolicy.AUTO && this.contentHeight > _loc3_)
         {
            this.vScrollBar = true;
            _loc4_ -= _loc1_;
         }
         this.availableHeight = _loc3_ + this.vOffset;
         this.availableWidth = _loc4_;
      }
      
      protected function calculateContentWidth() : void
      {
      }
      
      protected function updateChildren() : void
      {
         this._verticalScrollBar.enabled = this._horizontalScrollBar.enabled = enabled;
         this._verticalScrollBar.drawNow();
         this._horizontalScrollBar.drawNow();
      }
   }
}

