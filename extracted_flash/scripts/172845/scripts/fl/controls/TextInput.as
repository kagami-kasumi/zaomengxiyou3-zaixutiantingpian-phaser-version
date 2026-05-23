package fl.controls
{
   import fl.core.InvalidationType;
   import fl.core.UIComponent;
   import fl.events.ComponentEvent;
   import fl.managers.IFocusManager;
   import fl.managers.IFocusManagerComponent;
   import flash.display.DisplayObject;
   import flash.events.Event;
   import flash.events.FocusEvent;
   import flash.events.KeyboardEvent;
   import flash.events.TextEvent;
   import flash.text.TextField;
   import flash.text.TextFieldType;
   import flash.text.TextFormat;
   import flash.text.TextLineMetrics;
   import flash.ui.Keyboard;
   
   [Embed(source="/_assets/assets.swf", symbol="symbol35")]
   public class TextInput extends UIComponent implements IFocusManagerComponent
   {
      
      public static var createAccessibilityImplementation:Function;
      
      private static var defaultStyles:Object = {
         "upSkin":"TextInput_upSkin",
         "disabledSkin":"TextInput_disabledSkin",
         "focusRectSkin":null,
         "focusRectPadding":null,
         "textFormat":null,
         "disabledTextFormat":null,
         "textPadding":0,
         "embedFonts":false
      };
      
      public var textField:TextField;
      
      protected var _editable:Boolean = true;
      
      protected var background:DisplayObject;
      
      protected var _html:Boolean = false;
      
      protected var _savedHTML:String;
      
      public function TextInput()
      {
         super();
      }
      
      public static function getStyleDefinition() : Object
      {
         return defaultStyles;
      }
      
      public function get text() : String
      {
         return this.textField.text;
      }
      
      public function set text(param1:String) : void
      {
         this.textField.text = param1;
         this._html = false;
         invalidate(InvalidationType.DATA);
         invalidate(InvalidationType.STYLES);
      }
      
      override public function get enabled() : Boolean
      {
         return super.enabled;
      }
      
      override public function set enabled(param1:Boolean) : void
      {
         super.enabled = param1;
         this.updateTextFieldType();
      }
      
      public function get imeMode() : String
      {
         return _imeMode;
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
      
      public function get editable() : Boolean
      {
         return this._editable;
      }
      
      public function set editable(param1:Boolean) : void
      {
         this._editable = param1;
         this.updateTextFieldType();
      }
      
      public function get horizontalScrollPosition() : int
      {
         return this.textField.scrollH;
      }
      
      public function set horizontalScrollPosition(param1:int) : void
      {
         this.textField.scrollH = param1;
      }
      
      public function get maxHorizontalScrollPosition() : int
      {
         return this.textField.maxScrollH;
      }
      
      public function get length() : int
      {
         return this.textField.length;
      }
      
      public function get maxChars() : int
      {
         return this.textField.maxChars;
      }
      
      public function set maxChars(param1:int) : void
      {
         this.textField.maxChars = param1;
      }
      
      public function get displayAsPassword() : Boolean
      {
         return this.textField.displayAsPassword;
      }
      
      public function set displayAsPassword(param1:Boolean) : void
      {
         this.textField.displayAsPassword = param1;
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
      
      public function get selectionBeginIndex() : int
      {
         return this.textField.selectionBeginIndex;
      }
      
      public function get selectionEndIndex() : int
      {
         return this.textField.selectionEndIndex;
      }
      
      public function get condenseWhite() : Boolean
      {
         return this.textField.condenseWhite;
      }
      
      public function set condenseWhite(param1:Boolean) : void
      {
         this.textField.condenseWhite = param1;
      }
      
      public function get htmlText() : String
      {
         return this.textField.htmlText;
      }
      
      public function set htmlText(param1:String) : void
      {
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
      }
      
      public function get textHeight() : Number
      {
         return this.textField.textHeight;
      }
      
      public function get textWidth() : Number
      {
         return this.textField.textWidth;
      }
      
      public function setSelection(param1:int, param2:int) : void
      {
         this.textField.setSelection(param1,param2);
      }
      
      public function getLineMetrics(param1:int) : TextLineMetrics
      {
         return this.textField.getLineMetrics(param1);
      }
      
      public function appendText(param1:String) : void
      {
         this.textField.appendText(param1);
      }
      
      protected function updateTextFieldType() : void
      {
         this.textField.type = this.enabled && this.editable ? TextFieldType.INPUT : TextFieldType.DYNAMIC;
         this.textField.selectable = this.enabled;
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
      }
      
      protected function handleTextInput(param1:TextEvent) : void
      {
         param1.stopPropagation();
         dispatchEvent(new TextEvent(TextEvent.TEXT_INPUT,true,false,param1.text));
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
         var _loc1_:Object = null;
         if(isInvalid(InvalidationType.STYLES,InvalidationType.STATE))
         {
            this.drawTextFormat();
            this.drawBackground();
            _loc1_ = getStyleValue("embedFonts");
            if(_loc1_ != null)
            {
               this.textField.embedFonts = _loc1_;
            }
            invalidate(InvalidationType.SIZE,false);
         }
         if(isInvalid(InvalidationType.SIZE))
         {
            this.drawLayout();
         }
         super.draw();
      }
      
      protected function drawBackground() : void
      {
         var _loc1_:DisplayObject = this.background;
         var _loc2_:String = this.enabled ? "upSkin" : "disabledSkin";
         this.background = getDisplayObjectInstance(getStyleValue(_loc2_));
         if(this.background == null)
         {
            return;
         }
         addChildAt(this.background,0);
         if(_loc1_ != null && _loc1_ != this.background && contains(_loc1_))
         {
            removeChild(_loc1_);
         }
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
      
      protected function drawLayout() : void
      {
         var _loc1_:Number = Number(getStyleValue("textPadding"));
         if(this.background != null)
         {
            this.background.width = width;
            this.background.height = height;
         }
         this.textField.width = width - 2 * _loc1_;
         this.textField.height = height - 2 * _loc1_;
         this.textField.x = this.textField.y = _loc1_;
      }
      
      override protected function configUI() : void
      {
         super.configUI();
         tabChildren = true;
         this.textField = new TextField();
         addChild(this.textField);
         this.updateTextFieldType();
         this.textField.addEventListener(TextEvent.TEXT_INPUT,this.handleTextInput,false,0,true);
         this.textField.addEventListener(Event.CHANGE,this.handleChange,false,0,true);
         this.textField.addEventListener(KeyboardEvent.KEY_DOWN,this.handleKeyDown,false,0,true);
      }
      
      override public function setFocus() : void
      {
         stage.focus = this.textField;
      }
      
      override protected function isOurFocus(param1:DisplayObject) : Boolean
      {
         return param1 == this.textField || Boolean(super.isOurFocus(param1));
      }
      
      override protected function focusInHandler(param1:FocusEvent) : void
      {
         if(param1.target == this)
         {
            stage.focus = this.textField;
         }
         var _loc2_:IFocusManager = focusManager;
         if(this.editable && Boolean(_loc2_))
         {
            _loc2_.showFocusIndicator = true;
            if(this.textField.selectable && this.textField.selectionBeginIndex == this.textField.selectionBeginIndex)
            {
               this.setSelection(0,this.textField.length);
            }
         }
         super.focusInHandler(param1);
         if(this.editable)
         {
            setIMEMode(true);
         }
      }
      
      override protected function focusOutHandler(param1:FocusEvent) : void
      {
         super.focusOutHandler(param1);
         if(this.editable)
         {
            setIMEMode(false);
         }
      }
   }
}

