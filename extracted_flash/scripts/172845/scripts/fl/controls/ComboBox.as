package fl.controls
{
   import fl.controls.listClasses.ICellRenderer;
   import fl.core.InvalidationType;
   import fl.core.UIComponent;
   import fl.data.DataProvider;
   import fl.data.SimpleCollectionItem;
   import fl.events.ComponentEvent;
   import fl.events.DataChangeEvent;
   import fl.events.ListEvent;
   import fl.managers.IFocusManagerComponent;
   import flash.display.DisplayObject;
   import flash.display.DisplayObjectContainer;
   import flash.events.Event;
   import flash.events.FocusEvent;
   import flash.events.KeyboardEvent;
   import flash.events.MouseEvent;
   import flash.geom.Point;
   import flash.text.TextFormat;
   import flash.ui.Keyboard;
   
   [Embed(source="/_assets/assets.swf", symbol="symbol91")]
   public class ComboBox extends UIComponent implements IFocusManagerComponent
   {
      
      public static var createAccessibilityImplementation:Function;
      
      private static var defaultStyles:Object = {
         "upSkin":"ComboBox_upSkin",
         "downSkin":"ComboBox_downSkin",
         "overSkin":"ComboBox_overSkin",
         "disabledSkin":"ComboBox_disabledSkin",
         "focusRectSkin":null,
         "focusRectPadding":null,
         "textFormat":null,
         "disabledTextFormat":null,
         "textPadding":3,
         "buttonWidth":24,
         "disabledAlpha":null,
         "listSkin":null
      };
      
      protected static const LIST_STYLES:Object = {
         "upSkin":"comboListUpSkin",
         "overSkin":"comboListOverSkin",
         "downSkin":"comobListDownSkin",
         "disabledSkin":"comboListDisabledSkin",
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
         "repeatInterval":"repeatInterval",
         "textFormat":"textFormat",
         "disabledAlpha":"disabledAlpha",
         "skin":"listSkin"
      };
      
      protected static const BACKGROUND_STYLES:Object = {
         "overSkin":"overSkin",
         "downSkin":"downSkin",
         "upSkin":"upSkin",
         "disabledSkin":"disabledSkin",
         "repeatInterval":"repeatInterval"
      };
      
      protected var inputField:TextInput;
      
      protected var background:BaseButton;
      
      protected var list:List;
      
      protected var _rowCount:uint = 5;
      
      protected var _editable:Boolean = false;
      
      protected var isOpen:Boolean = false;
      
      protected var highlightedCell:int = -1;
      
      protected var editableValue:String;
      
      protected var _prompt:String;
      
      protected var isKeyDown:Boolean = false;
      
      protected var currentIndex:int;
      
      protected var listOverIndex:uint;
      
      protected var _dropdownWidth:Number;
      
      protected var _labels:Array;
      
      private var collectionItemImport:SimpleCollectionItem;
      
      public function ComboBox()
      {
         super();
      }
      
      public static function getStyleDefinition() : Object
      {
         return mergeStyles(defaultStyles,List.getStyleDefinition());
      }
      
      public function get editable() : Boolean
      {
         return this._editable;
      }
      
      public function set editable(param1:Boolean) : void
      {
         this._editable = param1;
         this.drawTextField();
      }
      
      public function get rowCount() : uint
      {
         return this._rowCount;
      }
      
      public function set rowCount(param1:uint) : void
      {
         this._rowCount = param1;
         invalidate(InvalidationType.SIZE);
      }
      
      public function get restrict() : String
      {
         return this.inputField.restrict;
      }
      
      public function set restrict(param1:String) : void
      {
         if(componentInspectorSetting && param1 == "")
         {
            param1 = null;
         }
         if(!this._editable)
         {
            return;
         }
         this.inputField.restrict = param1;
      }
      
      public function get selectedIndex() : int
      {
         return this.list.selectedIndex;
      }
      
      public function set selectedIndex(param1:int) : void
      {
         this.list.selectedIndex = param1;
         this.highlightCell();
         invalidate(InvalidationType.SELECTED);
      }
      
      public function get text() : String
      {
         return this.inputField.text;
      }
      
      public function set text(param1:String) : void
      {
         if(!this.editable)
         {
            return;
         }
         this.inputField.text = param1;
      }
      
      public function get labelField() : String
      {
         return this.list.labelField;
      }
      
      public function set labelField(param1:String) : void
      {
         this.list.labelField = param1;
         invalidate(InvalidationType.DATA);
      }
      
      public function get labelFunction() : Function
      {
         return this.list.labelFunction;
      }
      
      public function set labelFunction(param1:Function) : void
      {
         this.list.labelFunction = param1;
         invalidate(InvalidationType.DATA);
      }
      
      public function itemToLabel(param1:Object) : String
      {
         if(param1 == null)
         {
            return "";
         }
         return this.list.itemToLabel(param1);
      }
      
      public function get selectedItem() : Object
      {
         return this.list.selectedItem;
      }
      
      public function set selectedItem(param1:Object) : void
      {
         this.list.selectedItem = param1;
         invalidate(InvalidationType.SELECTED);
      }
      
      public function get dropdown() : List
      {
         return this.list;
      }
      
      public function get length() : int
      {
         return this.list.length;
      }
      
      public function get textField() : TextInput
      {
         return this.inputField;
      }
      
      public function get value() : String
      {
         var _loc1_:Object = null;
         if(this.editableValue != null)
         {
            return this.editableValue;
         }
         _loc1_ = this.selectedItem;
         if(!this._editable && _loc1_.data != null)
         {
            return _loc1_.data;
         }
         return this.itemToLabel(_loc1_);
      }
      
      public function get dataProvider() : DataProvider
      {
         return this.list.dataProvider;
      }
      
      public function set dataProvider(param1:DataProvider) : void
      {
         param1.addEventListener(DataChangeEvent.DATA_CHANGE,this.handleDataChange,false,0,true);
         this.list.dataProvider = param1;
         invalidate(InvalidationType.DATA);
      }
      
      public function get dropdownWidth() : Number
      {
         return this.list.width;
      }
      
      public function set dropdownWidth(param1:Number) : void
      {
         this._dropdownWidth = param1;
         invalidate(InvalidationType.SIZE);
      }
      
      public function addItem(param1:Object) : void
      {
         this.list.addItem(param1);
         invalidate(InvalidationType.DATA);
      }
      
      public function get prompt() : String
      {
         return this._prompt;
      }
      
      public function set prompt(param1:String) : void
      {
         if(param1 == "")
         {
            this._prompt = null;
         }
         else
         {
            this._prompt = param1;
         }
         invalidate(InvalidationType.STATE);
      }
      
      public function get imeMode() : String
      {
         return this.inputField.imeMode;
      }
      
      public function set imeMode(param1:String) : void
      {
         this.inputField.imeMode = param1;
      }
      
      public function addItemAt(param1:Object, param2:uint) : void
      {
         this.list.addItemAt(param1,param2);
         invalidate(InvalidationType.DATA);
      }
      
      public function removeAll() : void
      {
         this.list.removeAll();
         this.inputField.text = "";
         invalidate(InvalidationType.DATA);
      }
      
      public function removeItem(param1:Object) : Object
      {
         return this.list.removeItem(param1);
      }
      
      public function removeItemAt(param1:uint) : void
      {
         this.list.removeItemAt(param1);
         invalidate(InvalidationType.DATA);
      }
      
      public function getItemAt(param1:uint) : Object
      {
         return this.list.getItemAt(param1);
      }
      
      public function replaceItemAt(param1:Object, param2:uint) : Object
      {
         return this.list.replaceItemAt(param1,param2);
      }
      
      public function sortItems(... rest) : *
      {
         return this.list.sortItems.apply(this.list,rest);
      }
      
      public function sortItemsOn(param1:String, param2:Object = null) : *
      {
         return this.list.sortItemsOn(param1,param2);
      }
      
      public function open() : void
      {
         this.currentIndex = this.selectedIndex;
         if(this.isOpen || this.length == 0)
         {
            return;
         }
         dispatchEvent(new Event(Event.OPEN));
         this.isOpen = true;
         addEventListener(Event.ENTER_FRAME,this.addCloseListener,false,0,true);
         this.positionList();
         this.list.scrollToSelected();
         focusManager.form.addChild(this.list);
      }
      
      public function close() : void
      {
         this.highlightCell();
         this.highlightedCell = -1;
         if(!this.isOpen)
         {
            return;
         }
         dispatchEvent(new Event(Event.CLOSE));
         var _loc1_:DisplayObjectContainer = focusManager.form;
         _loc1_.removeEventListener(MouseEvent.MOUSE_DOWN,this.onStageClick);
         this.isOpen = false;
         _loc1_.removeChild(this.list);
      }
      
      public function get selectedLabel() : String
      {
         if(this.editableValue != null)
         {
            return this.editableValue;
         }
         if(this.selectedIndex == -1)
         {
            return null;
         }
         return this.itemToLabel(this.selectedItem);
      }
      
      override protected function configUI() : void
      {
         super.configUI();
         this.background = new BaseButton();
         this.background.focusEnabled = false;
         copyStylesToChild(this.background,BACKGROUND_STYLES);
         this.background.addEventListener(MouseEvent.MOUSE_DOWN,this.onToggleListVisibility,false,0,true);
         addChild(this.background);
         this.inputField = new TextInput();
         this.inputField.focusTarget = this as IFocusManagerComponent;
         this.inputField.focusEnabled = false;
         this.inputField.addEventListener(Event.CHANGE,this.onTextInput,false,0,true);
         addChild(this.inputField);
         this.list = new List();
         this.list.focusEnabled = false;
         copyStylesToChild(this.list,LIST_STYLES);
         this.list.addEventListener(Event.CHANGE,this.onListChange,false,0,true);
         this.list.addEventListener(ListEvent.ITEM_CLICK,this.onListChange,false,0,true);
         this.list.addEventListener(ListEvent.ITEM_ROLL_OUT,this.passEvent,false,0,true);
         this.list.addEventListener(ListEvent.ITEM_ROLL_OVER,this.passEvent,false,0,true);
         this.list.verticalScrollBar.addEventListener(Event.SCROLL,this.passEvent,false,0,true);
      }
      
      override protected function focusInHandler(param1:FocusEvent) : void
      {
         super.focusInHandler(param1);
         if(this.editable)
         {
            stage.focus = this.inputField.textField;
         }
      }
      
      override protected function focusOutHandler(param1:FocusEvent) : void
      {
         this.isKeyDown = false;
         if(this.isOpen)
         {
            if(!param1.relatedObject || !this.list.contains(param1.relatedObject))
            {
               if(this.highlightedCell != -1 && this.highlightedCell != this.selectedIndex)
               {
                  this.selectedIndex = this.highlightedCell;
                  dispatchEvent(new Event(Event.CHANGE));
               }
               this.close();
            }
         }
         super.focusOutHandler(param1);
      }
      
      protected function handleDataChange(param1:DataChangeEvent) : void
      {
         invalidate(InvalidationType.DATA);
      }
      
      override protected function draw() : void
      {
         var _loc1_:* = this.selectedIndex;
         if(_loc1_ == -1 && (this.prompt != null || this.editable || this.length == 0))
         {
            _loc1_ = Math.max(-1,Math.min(_loc1_,this.length - 1));
         }
         else
         {
            this.editableValue = null;
            _loc1_ = Math.max(0,Math.min(_loc1_,this.length - 1));
         }
         if(this.list.selectedIndex != _loc1_)
         {
            this.list.selectedIndex = _loc1_;
            invalidate(InvalidationType.SELECTED,false);
         }
         if(isInvalid(InvalidationType.STYLES))
         {
            this.setStyles();
            this.setEmbedFonts();
            invalidate(InvalidationType.SIZE,false);
         }
         if(isInvalid(InvalidationType.SIZE,InvalidationType.DATA,InvalidationType.STATE))
         {
            this.drawTextFormat();
            this.drawLayout();
            invalidate(InvalidationType.DATA);
         }
         if(isInvalid(InvalidationType.DATA))
         {
            this.drawList();
            invalidate(InvalidationType.SELECTED,true);
         }
         if(isInvalid(InvalidationType.SELECTED))
         {
            if(_loc1_ == -1 && this.editableValue != null)
            {
               this.inputField.text = this.editableValue;
            }
            else if(_loc1_ > -1)
            {
               if(this.length > 0)
               {
                  this.inputField.horizontalScrollPosition = 0;
                  this.inputField.text = this.itemToLabel(this.list.selectedItem);
               }
            }
            else if(_loc1_ == -1 && this._prompt != null)
            {
               this.showPrompt();
            }
            else
            {
               this.inputField.text = "";
            }
            if(this.editable && this.selectedIndex > -1 && stage.focus == this.inputField.textField)
            {
               this.inputField.setSelection(0,this.inputField.length);
            }
         }
         this.drawTextField();
         super.draw();
      }
      
      protected function setEmbedFonts() : void
      {
         var _loc1_:Object = getStyleValue("embedFonts");
         if(_loc1_ != null)
         {
            this.inputField.textField.embedFonts = _loc1_;
         }
      }
      
      protected function showPrompt() : void
      {
         this.inputField.text = this._prompt;
      }
      
      protected function setStyles() : void
      {
         copyStylesToChild(this.background,BACKGROUND_STYLES);
         copyStylesToChild(this.list,LIST_STYLES);
      }
      
      protected function drawLayout() : void
      {
         var _loc1_:Number = getStyleValue("buttonWidth") as Number;
         var _loc2_:Number = getStyleValue("textPadding") as Number;
         this.background.setSize(width,height);
         this.inputField.x = this.inputField.y = _loc2_;
         this.inputField.setSize(width - _loc1_ - _loc2_,height - _loc2_);
         this.list.width = isNaN(this._dropdownWidth) ? width : this._dropdownWidth;
         this.background.enabled = enabled;
         this.background.drawNow();
      }
      
      protected function drawTextFormat() : void
      {
         var _loc1_:TextFormat = getStyleValue(_enabled ? "textFormat" : "disabledTextFormat") as TextFormat;
         if(_loc1_ == null)
         {
            _loc1_ = new TextFormat();
         }
         this.inputField.textField.defaultTextFormat = _loc1_;
         this.inputField.textField.setTextFormat(_loc1_);
         this.setEmbedFonts();
      }
      
      protected function drawList() : void
      {
         this.list.rowCount = Math.max(0,Math.min(this._rowCount,this.list.dataProvider.length));
      }
      
      protected function positionList() : void
      {
         var myForm:DisplayObjectContainer = null;
         var theStageHeight:Number = NaN;
         var p:Point = localToGlobal(new Point(0,0));
         myForm = focusManager.form;
         p = myForm.globalToLocal(p);
         this.list.x = p.x;
         try
         {
            theStageHeight = stage.stageHeight;
         }
         catch(se:SecurityError)
         {
            theStageHeight = myForm.height;
         }
         if(p.y + height + this.list.height > theStageHeight)
         {
            this.list.y = p.y - this.list.height;
         }
         else
         {
            this.list.y = p.y + height;
         }
      }
      
      protected function drawTextField() : void
      {
         this.inputField.setStyle("upSkin","");
         this.inputField.setStyle("disabledSkin","");
         this.inputField.enabled = enabled;
         this.inputField.editable = this._editable;
         this.inputField.textField.selectable = enabled && this._editable;
         this.inputField.mouseEnabled = this.inputField.mouseChildren = enabled && this._editable;
         this.inputField.focusEnabled = false;
         if(this._editable)
         {
            this.inputField.addEventListener(FocusEvent.FOCUS_IN,this.onInputFieldFocus,false,0,true);
            this.inputField.addEventListener(FocusEvent.FOCUS_OUT,this.onInputFieldFocusOut,false,0,true);
         }
         else
         {
            this.inputField.removeEventListener(FocusEvent.FOCUS_IN,this.onInputFieldFocus);
            this.inputField.removeEventListener(FocusEvent.FOCUS_OUT,this.onInputFieldFocusOut);
         }
      }
      
      protected function onInputFieldFocus(param1:FocusEvent) : void
      {
         this.inputField.addEventListener(ComponentEvent.ENTER,this.onEnter,false,0,true);
         this.close();
      }
      
      protected function onInputFieldFocusOut(param1:FocusEvent) : void
      {
         this.inputField.removeEventListener(ComponentEvent.ENTER,this.onEnter);
         this.selectedIndex = this.selectedIndex;
      }
      
      protected function onEnter(param1:ComponentEvent) : void
      {
         param1.stopPropagation();
      }
      
      protected function onToggleListVisibility(param1:MouseEvent) : void
      {
         param1.stopPropagation();
         dispatchEvent(param1);
         if(this.isOpen)
         {
            this.close();
         }
         else
         {
            this.open();
            focusManager.form.addEventListener(MouseEvent.MOUSE_UP,this.onListItemUp,false,0,true);
         }
      }
      
      protected function onListItemUp(param1:MouseEvent) : void
      {
         focusManager.form.removeEventListener(MouseEvent.MOUSE_UP,this.onListItemUp);
         if(!(param1.target is ICellRenderer) || !this.list.contains(param1.target as DisplayObject))
         {
            return;
         }
         this.editableValue = null;
         var _loc2_:* = this.selectedIndex;
         this.selectedIndex = param1.target.listData.index;
         if(_loc2_ != this.selectedIndex)
         {
            dispatchEvent(new Event(Event.CHANGE));
         }
         this.close();
      }
      
      protected function onListChange(param1:Event) : void
      {
         this.editableValue = null;
         dispatchEvent(param1);
         invalidate(InvalidationType.SELECTED);
         if(this.isKeyDown)
         {
            return;
         }
         this.close();
      }
      
      protected function onStageClick(param1:MouseEvent) : void
      {
         if(!this.isOpen)
         {
            return;
         }
         if(!contains(param1.target as DisplayObject) && !this.list.contains(param1.target as DisplayObject))
         {
            if(this.highlightedCell != -1)
            {
               this.selectedIndex = this.highlightedCell;
               dispatchEvent(new Event(Event.CHANGE));
            }
            this.close();
         }
      }
      
      protected function passEvent(param1:Event) : void
      {
         dispatchEvent(param1);
      }
      
      private function addCloseListener(param1:Event) : *
      {
         removeEventListener(Event.ENTER_FRAME,this.addCloseListener);
         if(!this.isOpen)
         {
            return;
         }
         focusManager.form.addEventListener(MouseEvent.MOUSE_DOWN,this.onStageClick,false,0,true);
      }
      
      protected function onTextInput(param1:Event) : void
      {
         param1.stopPropagation();
         if(!this._editable)
         {
            return;
         }
         this.editableValue = this.inputField.text;
         this.selectedIndex = -1;
         dispatchEvent(new Event(Event.CHANGE));
      }
      
      protected function calculateAvailableHeight() : Number
      {
         var _loc1_:Number = Number(getStyleValue("contentPadding"));
         return this.list.height - _loc1_ * 2;
      }
      
      override protected function keyDownHandler(param1:KeyboardEvent) : void
      {
         this.isKeyDown = true;
         if(param1.ctrlKey)
         {
            switch(param1.keyCode)
            {
               case Keyboard.UP:
                  if(this.highlightedCell > -1)
                  {
                     this.selectedIndex = this.highlightedCell;
                     dispatchEvent(new Event(Event.CHANGE));
                  }
                  this.close();
                  break;
               case Keyboard.DOWN:
                  this.open();
            }
            return;
         }
         param1.stopPropagation();
         var _loc2_:int = Math.max(this.calculateAvailableHeight() / this.list.rowHeight << 0,1);
         var _loc3_:uint = uint(this.selectedIndex);
         var _loc4_:Number = this.highlightedCell == -1 ? this.selectedIndex : this.highlightedCell;
         var _loc5_:int = -1;
         switch(param1.keyCode)
         {
            case Keyboard.SPACE:
               if(this.isOpen)
               {
                  this.close();
               }
               else
               {
                  this.open();
               }
               return;
            case Keyboard.ESCAPE:
               if(this.isOpen)
               {
                  if(this.highlightedCell > -1)
                  {
                     this.selectedIndex = this.selectedIndex;
                  }
                  this.close();
               }
               return;
            case Keyboard.UP:
               _loc5_ = Math.max(0,_loc4_ - 1);
               break;
            case Keyboard.DOWN:
               _loc5_ = Math.min(this.length - 1,_loc4_ + 1);
               break;
            case Keyboard.PAGE_UP:
               _loc5_ = Math.max(_loc4_ - _loc2_,0);
               break;
            case Keyboard.PAGE_DOWN:
               _loc5_ = Math.min(_loc4_ + _loc2_,this.length - 1);
               break;
            case Keyboard.HOME:
               _loc5_ = 0;
               break;
            case Keyboard.END:
               _loc5_ = this.length - 1;
               break;
            case Keyboard.ENTER:
               if(this._editable && this.highlightedCell == -1)
               {
                  this.editableValue = this.inputField.text;
                  this.selectedIndex = -1;
               }
               else if(this.isOpen && this.highlightedCell > -1)
               {
                  this.editableValue = null;
                  this.selectedIndex = this.highlightedCell;
                  dispatchEvent(new Event(Event.CHANGE));
               }
               dispatchEvent(new ComponentEvent(ComponentEvent.ENTER));
               this.close();
               return;
            default:
               if(this.editable)
               {
                  break;
               }
               _loc5_ = this.list.getNextIndexAtLetter(String.fromCharCode(param1.keyCode),_loc4_);
         }
         if(_loc5_ > -1)
         {
            if(this.isOpen)
            {
               this.highlightCell(_loc5_);
               this.inputField.text = this.list.itemToLabel(this.getItemAt(_loc5_));
            }
            else
            {
               this.highlightCell();
               this.selectedIndex = _loc5_;
               dispatchEvent(new Event(Event.CHANGE));
            }
         }
      }
      
      protected function highlightCell(param1:int = -1) : void
      {
         var _loc2_:ICellRenderer = null;
         if(this.highlightedCell > -1)
         {
            _loc2_ = this.list.itemToCellRenderer(this.getItemAt(this.highlightedCell));
            if(_loc2_ != null)
            {
               _loc2_.setMouseState("up");
            }
         }
         if(param1 == -1)
         {
            return;
         }
         this.list.scrollToIndex(param1);
         this.list.drawNow();
         _loc2_ = this.list.itemToCellRenderer(this.getItemAt(param1));
         if(_loc2_ != null)
         {
            _loc2_.setMouseState("over");
            this.highlightedCell = param1;
         }
      }
      
      override protected function keyUpHandler(param1:KeyboardEvent) : void
      {
         this.isKeyDown = false;
      }
      
      override protected function initializeAccessibility() : void
      {
         if(ComboBox.createAccessibilityImplementation != null)
         {
            ComboBox.createAccessibilityImplementation(this);
         }
      }
   }
}

