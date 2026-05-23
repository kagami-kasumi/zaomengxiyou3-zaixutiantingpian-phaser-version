package fl.controls
{
   import fl.containers.BaseScrollPane;
   import fl.controls.listClasses.CellRenderer;
   import fl.controls.listClasses.ICellRenderer;
   import fl.core.InvalidationType;
   import fl.data.DataProvider;
   import fl.data.SimpleCollectionItem;
   import fl.events.DataChangeEvent;
   import fl.events.DataChangeType;
   import fl.events.ListEvent;
   import fl.events.ScrollEvent;
   import fl.managers.IFocusManagerComponent;
   import flash.display.DisplayObject;
   import flash.display.Sprite;
   import flash.events.Event;
   import flash.events.KeyboardEvent;
   import flash.events.MouseEvent;
   import flash.ui.Keyboard;
   import flash.utils.Dictionary;
   
   public class SelectableList extends BaseScrollPane implements IFocusManagerComponent
   {
      
      public static var createAccessibilityImplementation:Function;
      
      private static var defaultStyles:Object = {
         "skin":"List_skin",
         "cellRenderer":CellRenderer,
         "contentPadding":null,
         "disabledAlpha":null
      };
      
      protected var listHolder:Sprite;
      
      protected var list:Sprite;
      
      protected var _dataProvider:DataProvider;
      
      protected var activeCellRenderers:Array;
      
      protected var availableCellRenderers:Array;
      
      protected var renderedItems:Dictionary;
      
      protected var invalidItems:Dictionary;
      
      protected var _horizontalScrollPosition:Number;
      
      protected var _verticalScrollPosition:Number;
      
      protected var _allowMultipleSelection:Boolean = false;
      
      protected var _selectable:Boolean = true;
      
      protected var _selectedIndices:Array;
      
      protected var caretIndex:int = -1;
      
      protected var lastCaretIndex:int = -1;
      
      protected var preChangeItems:Array;
      
      private var collectionItemImport:SimpleCollectionItem;
      
      protected var rendererStyles:Object;
      
      protected var updatedRendererStyles:Object;
      
      public function SelectableList()
      {
         super();
         this.activeCellRenderers = [];
         this.availableCellRenderers = [];
         this.invalidItems = new Dictionary(true);
         this.renderedItems = new Dictionary(true);
         this._selectedIndices = [];
         if(this.dataProvider == null)
         {
            this.dataProvider = new DataProvider();
         }
         verticalScrollPolicy = ScrollPolicy.AUTO;
         this.rendererStyles = {};
         this.updatedRendererStyles = {};
      }
      
      public static function getStyleDefinition() : Object
      {
         return mergeStyles(defaultStyles,BaseScrollPane.getStyleDefinition());
      }
      
      override public function set enabled(param1:Boolean) : void
      {
         super.enabled = param1;
         this.list.mouseChildren = _enabled;
      }
      
      public function get dataProvider() : DataProvider
      {
         return this._dataProvider;
      }
      
      public function set dataProvider(param1:DataProvider) : void
      {
         if(this._dataProvider != null)
         {
            this._dataProvider.removeEventListener(DataChangeEvent.DATA_CHANGE,this.handleDataChange);
            this._dataProvider.removeEventListener(DataChangeEvent.PRE_DATA_CHANGE,this.onPreChange);
         }
         this._dataProvider = param1;
         this._dataProvider.addEventListener(DataChangeEvent.DATA_CHANGE,this.handleDataChange,false,0,true);
         this._dataProvider.addEventListener(DataChangeEvent.PRE_DATA_CHANGE,this.onPreChange,false,0,true);
         this.clearSelection();
         this.invalidateList();
      }
      
      override public function get maxHorizontalScrollPosition() : Number
      {
         return _maxHorizontalScrollPosition;
      }
      
      public function set maxHorizontalScrollPosition(param1:Number) : void
      {
         _maxHorizontalScrollPosition = param1;
         invalidate(InvalidationType.SIZE);
      }
      
      public function get length() : uint
      {
         return this._dataProvider.length;
      }
      
      public function get allowMultipleSelection() : Boolean
      {
         return this._allowMultipleSelection;
      }
      
      public function set allowMultipleSelection(param1:Boolean) : void
      {
         if(param1 == this._allowMultipleSelection)
         {
            return;
         }
         this._allowMultipleSelection = param1;
         if(!param1 && this._selectedIndices.length > 1)
         {
            this._selectedIndices = [this._selectedIndices.pop()];
            invalidate(InvalidationType.DATA);
         }
      }
      
      public function get selectable() : Boolean
      {
         return this._selectable;
      }
      
      public function set selectable(param1:Boolean) : void
      {
         if(param1 == this._selectable)
         {
            return;
         }
         if(!param1)
         {
            this.selectedIndices = [];
         }
         this._selectable = param1;
      }
      
      public function get selectedIndex() : int
      {
         return this._selectedIndices.length == 0 ? -1 : int(this._selectedIndices[this._selectedIndices.length - 1]);
      }
      
      public function set selectedIndex(param1:int) : void
      {
         this.selectedIndices = param1 == -1 ? null : [param1];
      }
      
      public function get selectedIndices() : Array
      {
         return this._selectedIndices.concat();
      }
      
      public function set selectedIndices(param1:Array) : void
      {
         if(!this._selectable)
         {
            return;
         }
         this._selectedIndices = param1 == null ? [] : param1.concat();
         invalidate(InvalidationType.SELECTED);
      }
      
      public function get selectedItem() : Object
      {
         return this._selectedIndices.length == 0 ? null : this._dataProvider.getItemAt(this.selectedIndex);
      }
      
      public function set selectedItem(param1:Object) : void
      {
         var _loc2_:int = this._dataProvider.getItemIndex(param1);
         this.selectedIndex = _loc2_;
      }
      
      public function get selectedItems() : Array
      {
         var _loc1_:Array = [];
         var _loc2_:uint = 0;
         while(_loc2_ < this._selectedIndices.length)
         {
            _loc1_.push(this._dataProvider.getItemAt(this._selectedIndices[_loc2_]));
            _loc2_++;
         }
         return _loc1_;
      }
      
      public function set selectedItems(param1:Array) : void
      {
         var _loc4_:int = 0;
         if(param1 == null)
         {
            this.selectedIndices = null;
            return;
         }
         var _loc2_:Array = [];
         var _loc3_:uint = 0;
         while(_loc3_ < param1.length)
         {
            _loc4_ = this._dataProvider.getItemIndex(param1[_loc3_]);
            if(_loc4_ != -1)
            {
               _loc2_.push(_loc4_);
            }
            _loc3_++;
         }
         this.selectedIndices = _loc2_;
      }
      
      public function get rowCount() : uint
      {
         return 0;
      }
      
      public function clearSelection() : void
      {
         this.selectedIndex = -1;
      }
      
      public function itemToCellRenderer(param1:Object) : ICellRenderer
      {
         var _loc2_:* = undefined;
         var _loc3_:ICellRenderer = null;
         if(param1 != null)
         {
            for(_loc2_ in this.activeCellRenderers)
            {
               _loc3_ = this.activeCellRenderers[_loc2_] as ICellRenderer;
               if(_loc3_.data == param1)
               {
                  return _loc3_;
               }
            }
         }
         return null;
      }
      
      public function addItem(param1:Object) : void
      {
         this._dataProvider.addItem(param1);
         this.invalidateList();
      }
      
      public function addItemAt(param1:Object, param2:uint) : void
      {
         this._dataProvider.addItemAt(param1,param2);
         this.invalidateList();
      }
      
      public function removeAll() : void
      {
         this._dataProvider.removeAll();
      }
      
      public function getItemAt(param1:uint) : Object
      {
         return this._dataProvider.getItemAt(param1);
      }
      
      public function removeItem(param1:Object) : Object
      {
         return this._dataProvider.removeItem(param1);
      }
      
      public function removeItemAt(param1:uint) : Object
      {
         return this._dataProvider.removeItemAt(param1);
      }
      
      public function replaceItemAt(param1:Object, param2:uint) : Object
      {
         return this._dataProvider.replaceItemAt(param1,param2);
      }
      
      public function invalidateList() : void
      {
         this._invalidateList();
         invalidate(InvalidationType.DATA);
      }
      
      public function invalidateItem(param1:Object) : void
      {
         if(this.renderedItems[param1] == null)
         {
            return;
         }
         this.invalidItems[param1] = true;
         invalidate(InvalidationType.DATA);
      }
      
      public function invalidateItemAt(param1:uint) : void
      {
         var _loc2_:Object = this._dataProvider.getItemAt(param1);
         if(_loc2_ != null)
         {
            this.invalidateItem(_loc2_);
         }
      }
      
      public function sortItems(... rest) : *
      {
         return this._dataProvider.sort.apply(this._dataProvider,rest);
      }
      
      public function sortItemsOn(param1:String, param2:Object = null) : *
      {
         return this._dataProvider.sortOn(param1,param2);
      }
      
      public function isItemSelected(param1:Object) : Boolean
      {
         return this.selectedItems.indexOf(param1) > -1;
      }
      
      public function scrollToSelected() : void
      {
         this.scrollToIndex(this.selectedIndex);
      }
      
      public function scrollToIndex(param1:int) : void
      {
      }
      
      public function getNextIndexAtLetter(param1:String, param2:int = -1) : int
      {
         var _loc5_:Number = NaN;
         var _loc6_:Object = null;
         var _loc7_:String = null;
         if(this.length == 0)
         {
            return -1;
         }
         param1 = param1.toUpperCase();
         var _loc3_:int = this.length - 1;
         var _loc4_:Number = 0;
         while(_loc4_ < _loc3_)
         {
            _loc5_ = param2 + 1 + _loc4_;
            if(_loc5_ > this.length - 1)
            {
               _loc5_ -= this.length;
            }
            _loc6_ = this.getItemAt(_loc5_);
            if(_loc6_ == null)
            {
               break;
            }
            _loc7_ = this.itemToLabel(_loc6_);
            if(_loc7_ != null)
            {
               if(_loc7_.charAt(0).toUpperCase() == param1)
               {
                  return _loc5_;
               }
            }
            _loc4_++;
         }
         return -1;
      }
      
      public function itemToLabel(param1:Object) : String
      {
         return param1["label"];
      }
      
      public function setRendererStyle(param1:String, param2:Object, param3:uint = 0) : void
      {
         if(this.rendererStyles[param1] == param2)
         {
            return;
         }
         this.updatedRendererStyles[param1] = param2;
         this.rendererStyles[param1] = param2;
         invalidate(InvalidationType.RENDERER_STYLES);
      }
      
      public function getRendererStyle(param1:String, param2:int = -1) : Object
      {
         return this.rendererStyles[param1];
      }
      
      public function clearRendererStyle(param1:String, param2:int = -1) : void
      {
         delete this.rendererStyles[param1];
         this.updatedRendererStyles[param1] = null;
         invalidate(InvalidationType.RENDERER_STYLES);
      }
      
      override protected function configUI() : void
      {
         super.configUI();
         this.listHolder = new Sprite();
         addChild(this.listHolder);
         this.listHolder.scrollRect = contentScrollRect;
         this.list = new Sprite();
         this.listHolder.addChild(this.list);
      }
      
      protected function _invalidateList() : void
      {
         this.availableCellRenderers = [];
         while(this.activeCellRenderers.length > 0)
         {
            this.list.removeChild(this.activeCellRenderers.pop() as DisplayObject);
         }
      }
      
      protected function handleDataChange(param1:DataChangeEvent) : void
      {
         var _loc5_:uint = 0;
         var _loc2_:int = int(param1.startIndex);
         var _loc3_:int = int(param1.endIndex);
         var _loc4_:String = param1.changeType;
         if(_loc4_ == DataChangeType.INVALIDATE_ALL)
         {
            this.clearSelection();
            this.invalidateList();
         }
         else if(_loc4_ == DataChangeType.INVALIDATE)
         {
            _loc5_ = 0;
            while(_loc5_ < param1.items.length)
            {
               this.invalidateItem(param1.items[_loc5_]);
               _loc5_++;
            }
         }
         else if(_loc4_ == DataChangeType.ADD)
         {
            _loc5_ = 0;
            while(_loc5_ < this._selectedIndices.length)
            {
               if(this._selectedIndices[_loc5_] >= _loc2_)
               {
                  this._selectedIndices[_loc5_] += _loc2_ - _loc3_;
               }
               _loc5_++;
            }
         }
         else if(_loc4_ == DataChangeType.REMOVE)
         {
            _loc5_ = 0;
            while(_loc5_ < this._selectedIndices.length)
            {
               if(this._selectedIndices[_loc5_] >= _loc2_)
               {
                  if(this._selectedIndices[_loc5_] <= _loc3_)
                  {
                     delete this._selectedIndices[_loc5_];
                  }
                  else
                  {
                     this._selectedIndices[_loc5_] -= _loc2_ - _loc3_ + 1;
                  }
               }
               _loc5_++;
            }
         }
         else if(_loc4_ == DataChangeType.REMOVE_ALL)
         {
            this.clearSelection();
         }
         else if(_loc4_ != DataChangeType.REPLACE)
         {
            this.selectedItems = this.preChangeItems;
            this.preChangeItems = null;
         }
         invalidate(InvalidationType.DATA);
      }
      
      protected function handleCellRendererMouseEvent(param1:MouseEvent) : void
      {
         var _loc2_:ICellRenderer = param1.target as ICellRenderer;
         var _loc3_:String = param1.type == MouseEvent.ROLL_OVER ? ListEvent.ITEM_ROLL_OVER : ListEvent.ITEM_ROLL_OUT;
         dispatchEvent(new ListEvent(_loc3_,false,false,_loc2_.listData.column,_loc2_.listData.row,_loc2_.listData.index,_loc2_.data));
      }
      
      protected function handleCellRendererClick(param1:MouseEvent) : void
      {
         var _loc5_:* = 0;
         var _loc6_:uint = 0;
         if(!_enabled)
         {
            return;
         }
         var _loc2_:ICellRenderer = param1.currentTarget as ICellRenderer;
         var _loc3_:uint = _loc2_.listData.index;
         if(!dispatchEvent(new ListEvent(ListEvent.ITEM_CLICK,false,true,_loc2_.listData.column,_loc2_.listData.row,_loc3_,_loc2_.data)) || !this._selectable)
         {
            return;
         }
         var _loc4_:int = this.selectedIndices.indexOf(_loc3_);
         if(!this._allowMultipleSelection)
         {
            if(_loc4_ != -1)
            {
               return;
            }
            _loc2_.selected = true;
            this._selectedIndices = [_loc3_];
            this.lastCaretIndex = this.caretIndex = _loc3_;
         }
         else if(param1.shiftKey)
         {
            _loc6_ = this._selectedIndices.length > 0 ? uint(this._selectedIndices[0]) : _loc3_;
            this._selectedIndices = [];
            if(_loc6_ > _loc3_)
            {
               _loc5_ = int(_loc6_);
               while(_loc5_ >= _loc3_)
               {
                  this._selectedIndices.push(_loc5_);
                  _loc5_--;
               }
            }
            else
            {
               _loc5_ = int(_loc6_);
               while(_loc5_ <= _loc3_)
               {
                  this._selectedIndices.push(_loc5_);
                  _loc5_++;
               }
            }
            this.caretIndex = _loc3_;
         }
         else if(param1.ctrlKey)
         {
            if(_loc4_ != -1)
            {
               _loc2_.selected = false;
               this._selectedIndices.splice(_loc4_,1);
            }
            else
            {
               _loc2_.selected = true;
               this._selectedIndices.push(_loc3_);
            }
            this.caretIndex = _loc3_;
         }
         else
         {
            this._selectedIndices = [_loc3_];
            this.lastCaretIndex = this.caretIndex = _loc3_;
         }
         dispatchEvent(new Event(Event.CHANGE));
         invalidate(InvalidationType.DATA);
      }
      
      protected function handleCellRendererChange(param1:Event) : void
      {
         var _loc2_:ICellRenderer = param1.currentTarget as ICellRenderer;
         var _loc3_:uint = _loc2_.listData.index;
         this._dataProvider.invalidateItemAt(_loc3_);
      }
      
      protected function handleCellRendererDoubleClick(param1:MouseEvent) : void
      {
         if(!_enabled)
         {
            return;
         }
         var _loc2_:ICellRenderer = param1.currentTarget as ICellRenderer;
         var _loc3_:uint = _loc2_.listData.index;
         dispatchEvent(new ListEvent(ListEvent.ITEM_DOUBLE_CLICK,false,true,_loc2_.listData.column,_loc2_.listData.row,_loc3_,_loc2_.data));
      }
      
      override protected function setHorizontalScrollPosition(param1:Number, param2:Boolean = false) : void
      {
         if(param1 == this._horizontalScrollPosition)
         {
            return;
         }
         var _loc3_:Number = param1 - this._horizontalScrollPosition;
         this._horizontalScrollPosition = param1;
         if(param2)
         {
            dispatchEvent(new ScrollEvent(ScrollBarDirection.HORIZONTAL,_loc3_,param1));
         }
      }
      
      override protected function setVerticalScrollPosition(param1:Number, param2:Boolean = false) : void
      {
         if(param1 == this._verticalScrollPosition)
         {
            return;
         }
         var _loc3_:Number = param1 - this._verticalScrollPosition;
         this._verticalScrollPosition = param1;
         if(param2)
         {
            dispatchEvent(new ScrollEvent(ScrollBarDirection.VERTICAL,_loc3_,param1));
         }
      }
      
      override protected function draw() : void
      {
         super.draw();
      }
      
      override protected function drawLayout() : void
      {
         super.drawLayout();
         contentScrollRect = this.listHolder.scrollRect;
         contentScrollRect.width = availableWidth;
         contentScrollRect.height = availableHeight;
         this.listHolder.scrollRect = contentScrollRect;
      }
      
      protected function updateRendererStyles() : void
      {
         var _loc4_:String = null;
         var _loc1_:Array = this.availableCellRenderers.concat(this.activeCellRenderers);
         var _loc2_:uint = _loc1_.length;
         var _loc3_:uint = 0;
         while(_loc3_ < _loc2_)
         {
            if(_loc1_[_loc3_].setStyle != null)
            {
               for(_loc4_ in this.updatedRendererStyles)
               {
                  _loc1_[_loc3_].setStyle(_loc4_,this.updatedRendererStyles[_loc4_]);
               }
               _loc1_[_loc3_].drawNow();
            }
            _loc3_++;
         }
         this.updatedRendererStyles = {};
      }
      
      protected function drawList() : void
      {
      }
      
      override protected function keyDownHandler(param1:KeyboardEvent) : void
      {
         if(!this.selectable)
         {
            return;
         }
         switch(param1.keyCode)
         {
            case Keyboard.UP:
            case Keyboard.DOWN:
            case Keyboard.END:
            case Keyboard.HOME:
            case Keyboard.PAGE_UP:
            case Keyboard.PAGE_DOWN:
               this.moveSelectionVertically(param1.keyCode,param1.shiftKey && this._allowMultipleSelection,param1.ctrlKey && this._allowMultipleSelection);
               param1.stopPropagation();
               break;
            case Keyboard.LEFT:
            case Keyboard.RIGHT:
               this.moveSelectionHorizontally(param1.keyCode,param1.shiftKey && this._allowMultipleSelection,param1.ctrlKey && this._allowMultipleSelection);
               param1.stopPropagation();
         }
      }
      
      protected function moveSelectionHorizontally(param1:uint, param2:Boolean, param3:Boolean) : void
      {
      }
      
      protected function moveSelectionVertically(param1:uint, param2:Boolean, param3:Boolean) : void
      {
      }
      
      override protected function initializeAccessibility() : void
      {
         if(SelectableList.createAccessibilityImplementation != null)
         {
            SelectableList.createAccessibilityImplementation(this);
         }
      }
      
      protected function onPreChange(param1:DataChangeEvent) : void
      {
         switch(param1.changeType)
         {
            case DataChangeType.REMOVE:
            case DataChangeType.ADD:
            case DataChangeType.INVALIDATE:
            case DataChangeType.REMOVE_ALL:
            case DataChangeType.REPLACE:
            case DataChangeType.INVALIDATE_ALL:
               break;
            default:
               this.preChangeItems = this.selectedItems;
         }
      }
   }
}

