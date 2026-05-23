package fl.controls
{
   import fl.core.InvalidationType;
   import fl.core.UIComponent;
   import fl.events.ComponentEvent;
   import fl.events.ScrollEvent;
   import fl.managers.IFocusManager;
   import fl.managers.IFocusManagerComponent;
   import flash.display.DisplayObject;
   import flash.events.Event;
   import flash.events.FocusEvent;
   import flash.events.KeyboardEvent;
   import flash.events.MouseEvent;
   import flash.events.TextEvent;
   import flash.system.IME;
   import flash.text.TextField;
   import flash.text.TextFieldType;
   import flash.text.TextFormat;
   import flash.text.TextLineMetrics;
   import flash.ui.Keyboard;
   
   [Embed(source="/_assets/assets.swf", symbol="symbol383")]
   public class TextArea extends UIComponent implements IFocusManagerComponent
   {
      
      public static var createAccessibilityImplementation:Function;
      
      private static var defaultStyles:Object = {
         "upSkin":"TextArea_upSkin",
         "disabledSkin":"TextArea_disabledSkin",
         "focusRectSkin":null,
         "focusRectPadding":null,
         "textFormat":null,
         "disabledTextFormat":null,
         "textPadding":3,
         "embedFonts":false
      };
      
      protected static const SCROLL_BAR_STYLES:Object = {
         "downArrowDisabledSkin":"downArrowDisabledSkin",
         "downArrowDownSkin":"downArrowDownSkin",
         "downArrowOverSkin":"downArrowOverSkin",
         "downArrowUpSkin":"downArrowUpSkin",
         "upArrowDisabledSkin":"upArrowDisabledSkin",
         "upArrowDownSkin":"upArrowDownSkin",
         "upArrowOverSkin":"upArrowOverSkin",
         "upArrowUpSkin":"upArrowUpSkin",
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
      
      public var textField:TextField;
      
      protected var _editable:Boolean = true;
      
      protected var _wordWrap:Boolean = true;
      
      protected var _horizontalScrollPolicy:String = "auto";
      
      protected var _verticalScrollPolicy:String = "auto";
      
      protected var _horizontalScrollBar:UIScrollBar;
      
      protected var _verticalScrollBar:UIScrollBar;
      
      protected var background:DisplayObject;
      
      protected var _html:Boolean = false;
      
      protected var _savedHTML:String;
      
      protected var textHasChanged:Boolean = false;
      
      public function TextArea()
      {
         super();
      }
      
      public static function getStyleDefinition() : Object
      {
         return UIComponent.mergeStyles(defaultStyles,ScrollBar.getStyleDefinition());
      }
      
      public function get horizontalScrollBar() : UIScrollBar
      {
         return this._horizontalScrollBar;
      }
      
      public function get verticalScrollBar() : UIScrollBar
      {
         return this._verticalScrollBar;
      }
      
      override public function get enabled() : Boolean
      {
         return super.enabled;
      }
      
      override public function set enabled(param1:Boolean) : void
      {
         super.enabled = param1;
         mouseChildren = this.enabled;
         invalidate(InvalidationType.STATE);
      }
      
      public function get text() : String
      {
         return this.textField.text;
      }
      
      public function set text(param1:String) : void
      {
         if(componentInspectorSetting && param1 == "")
         {
            return;
         }
         this.textField.text = param1;
         this._html = false;
         invalidate(InvalidationType.DATA);
         invalidate(InvalidationType.STYLES);
         this.textHasChanged = true;
      }
      
      public function get htmlText() : String
      {
         return this.textField.htmlText;
      }
      
      public function set htmlText(param1:String) : void
      {
         if(componentInspectorSetting && param1 == "")
         {
            return;
         }
         if(param1 == "")
         {
            this.text = "";
            return;
         }
         this._html = true;
         this._savedHTML = param1;
         this.textField.htmlText = param1;
         invalidate(InvalidationType.DATA);
         invalidate(InvalidationType.STYLES);
         this.textHasChanged = true;
      }
      
      public function get condenseWhite() : Boolean
      {
         return this.textField.condenseWhite;
      }
      
      public function set condenseWhite(param1:Boolean) : void
      {
         this.textField.condenseWhite = param1;
         invalidate(InvalidationType.DATA);
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
      
      public function get horizontalScrollPosition() : Number
      {
         return this.textField.scrollH;
      }
      
      public function set horizontalScrollPosition(param1:Number) : void
      {
         drawNow();
         this.textField.scrollH = param1;
      }
      
      public function get verticalScrollPosition() : Number
      {
         return this.textField.scrollV;
      }
      
      public function set verticalScrollPosition(param1:Number) : void
      {
         drawNow();
         this.textField.scrollV = param1;
      }
      
      public function get textWidth() : Number
      {
         drawNow();
         return this.textField.textWidth;
      }
      
      public function get textHeight() : Number
      {
         drawNow();
         return this.textField.textHeight;
      }
      
      public function get length() : Number
      {
         return this.textField.text.length;
      }
      
      public function get restrict() : String
      {
         return this.textField.restrict;
      }
      
      public function set restrict(param1:String) : void
      {
         if(componentInspectorSetting && param1 == "")
         {
            param1 = null;
         }
         this.textField.restrict = param1;
      }
      
      public function get maxChars() : int
      {
         return this.textField.maxChars;
      }
      
      public function set maxChars(param1:int) : void
      {
         this.textField.maxChars = param1;
      }
      
      public function get maxHorizontalScrollPosition() : int
      {
         return this.textField.maxScrollH;
      }
      
      public function get maxVerticalScrollPosition() : int
      {
         return this.textField.maxScrollV;
      }
      
      public function get wordWrap() : Boolean
      {
         return this._wordWrap;
      }
      
      public function set wordWrap(param1:Boolean) : void
      {
         this._wordWrap = param1;
         invalidate(InvalidationType.STATE);
      }
      
      public function get selectionBeginIndex() : int
      {
         return this.textField.selectionBeginIndex;
      }
      
      public function get selectionEndIndex() : int
      {
         return this.textField.selectionEndIndex;
      }
      
      public function get displayAsPassword() : Boolean
      {
         return this.textField.displayAsPassword;
      }
      
      public function set displayAsPassword(param1:Boolean) : void
      {
         this.textField.displayAsPassword = param1;
      }
      
      public function get editable() : Boolean
      {
         return this._editable;
      }
      
      public function set editable(param1:Boolean) : void
      {
         this._editable = param1;
         invalidate(InvalidationType.STATE);
      }
      
      public function get imeMode() : String
      {
         return IME.conversionMode;
      }
      
      public function set imeMode(param1:String) : void
      {
         _imeMode = param1;
      }
      
      public function get alwaysShowSelection() : Boolean
      {
         return this.textField.alwaysShowSelection;
      }
      
      public function set alwaysShowSelection(param1:Boolean) : void
      {
         this.textField.alwaysShowSelection = param1;
      }
      
      override public function drawFocus(param1:Boolean) : void
      {
         if(focusTarget != null)
         {
            focusTarget.drawFocus(param1);
            return;
         }
         super.drawFocus(param1);
      }
      
      public function getLineMetrics(param1:int) : TextLineMetrics
      {
         return this.textField.getLineMetrics(param1);
      }
      
      public function setSelection(param1:int, param2:int) : void
      {
         this.textField.setSelection(param1,param2);
      }
      
      public function appendText(param1:String) : void
      {
         this.textField.appendText(param1);
         invalidate(InvalidationType.DATA);
      }
      
      override protected function configUI() : void
      {
         super.configUI();
         tabChildren = true;
         this.textField = new TextField();
         addChild(this.textField);
         this.updateTextFieldType();
         this._verticalScrollBar = new UIScrollBar();
         this._verticalScrollBar.name = "V";
         this._verticalScrollBar.visible = false;
         this._verticalScrollBar.focusEnabled = false;
         copyStylesToChild(this._verticalScrollBar,SCROLL_BAR_STYLES);
         this._verticalScrollBar.addEventListener(ScrollEvent.SCROLL,this.handleScroll,false,0,true);
         addChild(this._verticalScrollBar);
         this._horizontalScrollBar = new UIScrollBar();
         this._horizontalScrollBar.name = "H";
         this._horizontalScrollBar.visible = false;
         this._horizontalScrollBar.focusEnabled = false;
         this._horizontalScrollBar.direction = ScrollBarDirection.HORIZONTAL;
         copyStylesToChild(this._horizontalScrollBar,SCROLL_BAR_STYLES);
         this._horizontalScrollBar.addEventListener(ScrollEvent.SCROLL,this.handleScroll,false,0,true);
         addChild(this._horizontalScrollBar);
         this.textField.addEventListener(TextEvent.TEXT_INPUT,this.handleTextInput,false,0,true);
         this.textField.addEventListener(Event.CHANGE,this.handleChange,false,0,true);
         this.textField.addEventListener(KeyboardEvent.KEY_DOWN,this.handleKeyDown,false,0,true);
         this._horizontalScrollBar.scrollTarget = this.textField;
         this._verticalScrollBar.scrollTarget = this.textField;
         addEventListener(MouseEvent.MOUSE_WHEEL,this.handleWheel,false,0,true);
      }
      
      protected function updateTextFieldType() : void
      {
         this.textField.type = this.enabled && this._editable ? TextFieldType.INPUT : TextFieldType.DYNAMIC;
         this.textField.selectable = this.enabled;
         this.textField.wordWrap = this._wordWrap;
         this.textField.multiline = true;
      }
      
      protected function handleKeyDown(param1:KeyboardEvent) : void
      {
         if(param1.keyCode == Keyboard.ENTER)
         {
            dispatchEvent(new ComponentEvent(ComponentEvent.ENTER,true));
         }
      }
      
      protected function handleChange(param1:Event) : void
      {
         param1.stopPropagation();
         dispatchEvent(new Event(Event.CHANGE,true));
         invalidate(InvalidationType.DATA);
      }
      
      protected function handleTextInput(param1:TextEvent) : void
      {
         param1.stopPropagation();
         dispatchEvent(new TextEvent(TextEvent.TEXT_INPUT,true,false,param1.text));
      }
      
      protected function handleScroll(param1:ScrollEvent) : void
      {
         dispatchEvent(param1);
      }
      
      protected function handleWheel(param1:MouseEvent) : void
      {
         if(!this.enabled || !this._verticalScrollBar.visible)
         {
            return;
         }
         this._verticalScrollBar.scrollPosition -= param1.delta * this._verticalScrollBar.lineScrollSize;
         dispatchEvent(new ScrollEvent(ScrollBarDirection.VERTICAL,param1.delta * this._verticalScrollBar.lineScrollSize,this._verticalScrollBar.scrollPosition));
      }
      
      protected function setEmbedFont() : *
      {
         var _loc1_:Object = getStyleValue("embedFonts");
         if(_loc1_ != null)
         {
            this.textField.embedFonts = _loc1_;
         }
      }
      
      override protected function draw() : void
      {
         if(isInvalid(InvalidationType.STATE))
         {
            this.updateTextFieldType();
         }
         if(isInvalid(InvalidationType.STYLES))
         {
            this.setStyles();
            this.setEmbedFont();
         }
         if(isInvalid(InvalidationType.STYLES,InvalidationType.STATE))
         {
            this.drawTextFormat();
            this.drawBackground();
            invalidate(InvalidationType.SIZE,false);
         }
         if(isInvalid(InvalidationType.SIZE,InvalidationType.DATA))
         {
            this.drawLayout();
         }
         super.draw();
      }
      
      protected function setStyles() : void
      {
         copyStylesToChild(this._verticalScrollBar,SCROLL_BAR_STYLES);
         copyStylesToChild(this._horizontalScrollBar,SCROLL_BAR_STYLES);
      }
      
      protected function drawTextFormat() : void
      {
         var _loc1_:Object = UIComponent.getStyleDefinition();
         var _loc2_:TextFormat = this.enabled ? _loc1_.defaultTextFormat as TextFormat : _loc1_.defaultDisabledTextFormat as TextFormat;
         this.textField.setTextFormat(_loc2_);
         var _loc3_:TextFormat = getStyleValue(this.enabled ? "textFormat" : "disabledTextFormat") as TextFormat;
         if(_loc3_ != null)
         {
            this.textField.setTextFormat(_loc3_);
         }
         else
         {
            _loc3_ = _loc2_;
         }
         this.textField.defaultTextFormat = _loc3_;
         this.setEmbedFont();
         if(this._html)
         {
            this.textField.htmlText = this._savedHTML;
         }
      }
      
      protected function drawBackground() : void
      {
         var _loc1_:DisplayObject = this.background;
         var _loc2_:String = this.enabled ? "upSkin" : "disabledSkin";
         this.background = getDisplayObjectInstance(getStyleValue(_loc2_));
         if(this.background != null)
         {
            addChildAt(this.background,0);
         }
         if(_loc1_ != null && _loc1_ != this.background && contains(_loc1_))
         {
            removeChild(_loc1_);
         }
      }
      
      protected function drawLayout() : void
      {
         var _loc1_:Number = Number(getStyleValue("textPadding"));
         this.textField.x = this.textField.y = _loc1_;
         this.background.width = width;
         this.background.height = height;
         var _loc2_:Number = height;
         var _loc3_:Boolean = this.needVScroll();
         var _loc4_:Number = width - (_loc3_ ? this._verticalScrollBar.width : 0);
         var _loc5_:Boolean = this.needHScroll();
         if(_loc5_)
         {
            _loc2_ -= this._horizontalScrollBar.height;
         }
         this.setTextSize(_loc4_,_loc2_,_loc1_);
         if(_loc5_ && !_loc3_ && this.needVScroll())
         {
            _loc3_ = true;
            _loc4_ -= this._verticalScrollBar.width;
            this.setTextSize(_loc4_,_loc2_,_loc1_);
         }
         if(_loc3_)
         {
            this._verticalScrollBar.visible = true;
            this._verticalScrollBar.x = width - this._verticalScrollBar.width;
            this._verticalScrollBar.height = _loc2_;
            this._verticalScrollBar.visible = true;
            this._verticalScrollBar.enabled = this.enabled;
         }
         else
         {
            this._verticalScrollBar.visible = false;
         }
         if(_loc5_)
         {
            this._horizontalScrollBar.visible = true;
            this._horizontalScrollBar.y = height - this._horizontalScrollBar.height;
            this._horizontalScrollBar.width = _loc4_;
            this._horizontalScrollBar.visible = true;
            this._horizontalScrollBar.enabled = this.enabled;
         }
         else
         {
            this._horizontalScrollBar.visible = false;
         }
         this.updateScrollBars();
         addEventListener(Event.ENTER_FRAME,this.delayedLayoutUpdate,false,0,true);
      }
      
      protected function delayedLayoutUpdate(param1:Event) : void
      {
         if(this.textHasChanged)
         {
            this.textHasChanged = false;
            this.drawLayout();
            return;
         }
         removeEventListener(Event.ENTER_FRAME,this.delayedLayoutUpdate);
      }
      
      protected function updateScrollBars() : *
      {
         this._horizontalScrollBar.update();
         this._verticalScrollBar.update();
         this._verticalScrollBar.enabled = this.enabled;
         this._horizontalScrollBar.enabled = this.enabled;
         this._horizontalScrollBar.drawNow();
         this._verticalScrollBar.drawNow();
      }
      
      protected function needVScroll() : Boolean
      {
         if(this._verticalScrollPolicy == ScrollPolicy.OFF)
         {
            return false;
         }
         if(this._verticalScrollPolicy == ScrollPolicy.ON)
         {
            return true;
         }
         return this.textField.maxScrollV > 1;
      }
      
      protected function needHScroll() : Boolean
      {
         if(this._horizontalScrollPolicy == ScrollPolicy.OFF)
         {
            return false;
         }
         if(this._horizontalScrollPolicy == ScrollPolicy.ON)
         {
            return true;
         }
         return this.textField.maxScrollH > 0;
      }
      
      protected function setTextSize(param1:Number, param2:Number, param3:Number) : void
      {
         var _loc4_:Number = param1 - param3 * 2;
         var _loc5_:Number = param2 - param3 * 2;
         if(_loc4_ != this.textField.width)
         {
            this.textField.width = _loc4_;
         }
         if(_loc5_ != this.textField.height)
         {
            this.textField.height = _loc5_;
         }
      }
      
      override protected function isOurFocus(param1:DisplayObject) : Boolean
      {
         return param1 == this.textField || Boolean(super.isOurFocus(param1));
      }
      
      override protected function focusInHandler(param1:FocusEvent) : void
      {
         setIMEMode(true);
         if(param1.target == this)
         {
            stage.focus = this.textField;
         }
         var _loc2_:IFocusManager = focusManager;
         if(_loc2_)
         {
            if(this.editable)
            {
               _loc2_.showFocusIndicator = true;
            }
            _loc2_.defaultButtonEnabled = false;
         }
         super.focusInHandler(param1);
         if(this.editable)
         {
            setIMEMode(true);
         }
      }
      
      override protected function focusOutHandler(param1:FocusEvent) : void
      {
         var _loc2_:IFocusManager = focusManager;
         if(_loc2_)
         {
            _loc2_.defaultButtonEnabled = true;
         }
         this.setSelection(0,0);
         super.focusOutHandler(param1);
         if(this.editable)
         {
            setIMEMode(false);
         }
      }
   }
}

