package fl.core
{
   import fl.events.ComponentEvent;
   import fl.managers.FocusManager;
   import fl.managers.IFocusManager;
   import fl.managers.IFocusManagerComponent;
   import fl.managers.StyleManager;
   import flash.display.Bitmap;
   import flash.display.BitmapData;
   import flash.display.DisplayObject;
   import flash.display.DisplayObjectContainer;
   import flash.display.InteractiveObject;
   import flash.display.Sprite;
   import flash.events.Event;
   import flash.events.FocusEvent;
   import flash.events.KeyboardEvent;
   import flash.system.IME;
   import flash.system.IMEConversionMode;
   import flash.text.TextField;
   import flash.text.TextFormat;
   import flash.text.TextFormatAlign;
   import flash.utils.Dictionary;
   import flash.utils.getDefinitionByName;
   import flash.utils.getQualifiedClassName;
   
   public class UIComponent extends Sprite
   {
      
      public static var createAccessibilityImplementation:Function;
      
      public static var inCallLaterPhase:Boolean = false;
      
      private static var defaultStyles:Object = {
         "focusRectSkin":"focusRectSkin",
         "focusRectPadding":2,
         "textFormat":new TextFormat("_sans",11,0,false,false,false,"","",TextFormatAlign.LEFT,0,0,0,0),
         "disabledTextFormat":new TextFormat("_sans",11,10066329,false,false,false,"","",TextFormatAlign.LEFT,0,0,0,0),
         "defaultTextFormat":new TextFormat("_sans",11,0,false,false,false,"","",TextFormatAlign.LEFT,0,0,0,0),
         "defaultDisabledTextFormat":new TextFormat("_sans",11,10066329,false,false,false,"","",TextFormatAlign.LEFT,0,0,0,0)
      };
      
      private static var focusManagers:Dictionary = new Dictionary(true);
      
      private static var focusManagerUsers:Dictionary = new Dictionary(true);
      
      public const version:String = "3.0.4.1";
      
      public var focusTarget:IFocusManagerComponent;
      
      protected var isLivePreview:Boolean = false;
      
      private var tempText:TextField;
      
      protected var instanceStyles:Object;
      
      protected var sharedStyles:Object;
      
      protected var callLaterMethods:Dictionary;
      
      protected var invalidateFlag:Boolean = false;
      
      protected var _enabled:Boolean = true;
      
      protected var invalidHash:Object;
      
      protected var uiFocusRect:DisplayObject;
      
      protected var isFocused:Boolean = false;
      
      private var _focusEnabled:Boolean = true;
      
      private var _mouseFocusEnabled:Boolean = true;
      
      protected var _width:Number;
      
      protected var _height:Number;
      
      protected var _x:Number;
      
      protected var _y:Number;
      
      protected var startWidth:Number;
      
      protected var startHeight:Number;
      
      protected var _imeMode:String = null;
      
      protected var _oldIMEMode:String = null;
      
      protected var errorCaught:Boolean = false;
      
      protected var _inspector:Boolean = false;
      
      public function UIComponent()
      {
         super();
         this.instanceStyles = {};
         this.sharedStyles = {};
         this.invalidHash = {};
         this.callLaterMethods = new Dictionary();
         StyleManager.registerInstance(this);
         this.configUI();
         this.invalidate(InvalidationType.ALL);
         tabEnabled = this is IFocusManagerComponent;
         focusRect = false;
         if(tabEnabled)
         {
            addEventListener(FocusEvent.FOCUS_IN,this.focusInHandler);
            addEventListener(FocusEvent.FOCUS_OUT,this.focusOutHandler);
            addEventListener(KeyboardEvent.KEY_DOWN,this.keyDownHandler);
            addEventListener(KeyboardEvent.KEY_UP,this.keyUpHandler);
         }
         this.initializeFocusManager();
         addEventListener(Event.ENTER_FRAME,this.hookAccessibility,false,0,true);
      }
      
      public static function getStyleDefinition() : Object
      {
         return defaultStyles;
      }
      
      public static function mergeStyles(... rest) : Object
      {
         var _loc5_:Object = null;
         var _loc6_:String = null;
         var _loc2_:Object = {};
         var _loc3_:uint = uint(rest.length);
         var _loc4_:uint = 0;
         while(_loc4_ < _loc3_)
         {
            _loc5_ = rest[_loc4_];
            for(_loc6_ in _loc5_)
            {
               if(_loc2_[_loc6_] == null)
               {
                  _loc2_[_loc6_] = rest[_loc4_][_loc6_];
               }
            }
            _loc4_++;
         }
         return _loc2_;
      }
      
      public function get componentInspectorSetting() : Boolean
      {
         return this._inspector;
      }
      
      public function set componentInspectorSetting(param1:Boolean) : void
      {
         this._inspector = param1;
         if(this._inspector)
         {
            this.beforeComponentParameters();
         }
         else
         {
            this.afterComponentParameters();
         }
      }
      
      protected function beforeComponentParameters() : void
      {
      }
      
      protected function afterComponentParameters() : void
      {
      }
      
      public function get enabled() : Boolean
      {
         return this._enabled;
      }
      
      public function set enabled(param1:Boolean) : void
      {
         if(param1 == this._enabled)
         {
            return;
         }
         this._enabled = param1;
         this.invalidate(InvalidationType.STATE);
      }
      
      public function setSize(param1:Number, param2:Number) : void
      {
         this._width = param1;
         this._height = param2;
         this.invalidate(InvalidationType.SIZE);
         dispatchEvent(new ComponentEvent(ComponentEvent.RESIZE,false));
      }
      
      override public function get width() : Number
      {
         return this._width;
      }
      
      override public function set width(param1:Number) : void
      {
         if(this._width == param1)
         {
            return;
         }
         this.setSize(param1,this.height);
      }
      
      override public function get height() : Number
      {
         return this._height;
      }
      
      override public function set height(param1:Number) : void
      {
         if(this._height == param1)
         {
            return;
         }
         this.setSize(this.width,param1);
      }
      
      public function setStyle(param1:String, param2:Object) : void
      {
         if(this.instanceStyles[param1] === param2 && !(param2 is TextFormat))
         {
            return;
         }
         this.instanceStyles[param1] = param2;
         this.invalidate(InvalidationType.STYLES);
      }
      
      public function clearStyle(param1:String) : void
      {
         this.setStyle(param1,null);
      }
      
      public function getStyle(param1:String) : Object
      {
         return this.instanceStyles[param1];
      }
      
      public function move(param1:Number, param2:Number) : void
      {
         this._x = param1;
         this._y = param2;
         super.x = Math.round(param1);
         super.y = Math.round(param2);
         dispatchEvent(new ComponentEvent(ComponentEvent.MOVE));
      }
      
      override public function get x() : Number
      {
         return isNaN(this._x) ? super.x : this._x;
      }
      
      override public function set x(param1:Number) : void
      {
         this.move(param1,this._y);
      }
      
      override public function get y() : Number
      {
         return isNaN(this._y) ? super.y : this._y;
      }
      
      override public function set y(param1:Number) : void
      {
         this.move(this._x,param1);
      }
      
      override public function get scaleX() : Number
      {
         return this.width / this.startWidth;
      }
      
      override public function set scaleX(param1:Number) : void
      {
         this.setSize(this.startWidth * param1,this.height);
      }
      
      override public function get scaleY() : Number
      {
         return this.height / this.startHeight;
      }
      
      override public function set scaleY(param1:Number) : void
      {
         this.setSize(this.width,this.startHeight * param1);
      }
      
      protected function getScaleY() : Number
      {
         return super.scaleY;
      }
      
      protected function setScaleY(param1:Number) : void
      {
         super.scaleY = param1;
      }
      
      protected function getScaleX() : Number
      {
         return super.scaleX;
      }
      
      protected function setScaleX(param1:Number) : void
      {
         super.scaleX = param1;
      }
      
      override public function get visible() : Boolean
      {
         return super.visible;
      }
      
      override public function set visible(param1:Boolean) : void
      {
         if(super.visible == param1)
         {
            return;
         }
         super.visible = param1;
         var _loc2_:String = param1 ? ComponentEvent.SHOW : ComponentEvent.HIDE;
         dispatchEvent(new ComponentEvent(_loc2_,true));
      }
      
      public function validateNow() : void
      {
         this.invalidate(InvalidationType.ALL,false);
         this.draw();
      }
      
      public function invalidate(param1:String = "all", param2:Boolean = true) : void
      {
         this.invalidHash[param1] = true;
         if(param2)
         {
            this.callLater(this.draw);
         }
      }
      
      public function setSharedStyle(param1:String, param2:Object) : void
      {
         if(this.sharedStyles[param1] === param2 && !(param2 is TextFormat))
         {
            return;
         }
         this.sharedStyles[param1] = param2;
         if(this.instanceStyles[param1] == null)
         {
            this.invalidate(InvalidationType.STYLES);
         }
      }
      
      public function get focusEnabled() : Boolean
      {
         return this._focusEnabled;
      }
      
      public function set focusEnabled(param1:Boolean) : void
      {
         this._focusEnabled = param1;
      }
      
      public function get mouseFocusEnabled() : Boolean
      {
         return this._mouseFocusEnabled;
      }
      
      public function set mouseFocusEnabled(param1:Boolean) : void
      {
         this._mouseFocusEnabled = param1;
      }
      
      public function get focusManager() : IFocusManager
      {
         var o:DisplayObject = this;
         while(o)
         {
            if(UIComponent.focusManagers[o] != null)
            {
               return IFocusManager(UIComponent.focusManagers[o]);
            }
            o = o.parent;
         }
         return null;
      }
      
      public function set focusManager(param1:IFocusManager) : void
      {
         UIComponent.focusManagers[this] = param1;
      }
      
      public function drawFocus(param1:Boolean) : void
      {
         var _loc2_:Number = NaN;
         this.isFocused = param1;
         if(this.uiFocusRect != null && contains(this.uiFocusRect))
         {
            removeChild(this.uiFocusRect);
            this.uiFocusRect = null;
         }
         if(param1)
         {
            this.uiFocusRect = this.getDisplayObjectInstance(this.getStyleValue("focusRectSkin")) as Sprite;
            if(this.uiFocusRect == null)
            {
               return;
            }
            _loc2_ = Number(this.getStyleValue("focusRectPadding"));
            this.uiFocusRect.x = -_loc2_;
            this.uiFocusRect.y = -_loc2_;
            this.uiFocusRect.width = this.width + _loc2_ * 2;
            this.uiFocusRect.height = this.height + _loc2_ * 2;
            addChildAt(this.uiFocusRect,0);
         }
      }
      
      public function setFocus() : void
      {
         if(stage)
         {
            stage.focus = this;
         }
      }
      
      public function getFocus() : InteractiveObject
      {
         if(stage)
         {
            return stage.focus;
         }
         return null;
      }
      
      protected function setIMEMode(param1:Boolean) : *
      {
         var enabled:Boolean = param1;
         if(this._imeMode != null)
         {
            if(enabled)
            {
               IME.enabled = true;
               this._oldIMEMode = IME.conversionMode;
               try
               {
                  if(!this.errorCaught && IME.conversionMode != IMEConversionMode.UNKNOWN)
                  {
                     IME.conversionMode = this._imeMode;
                  }
                  this.errorCaught = false;
               }
               catch(e:Error)
               {
                  errorCaught = true;
                  throw new Error("IME mode not supported: " + _imeMode);
               }
            }
            else
            {
               if(IME.conversionMode != IMEConversionMode.UNKNOWN && this._oldIMEMode != IMEConversionMode.UNKNOWN)
               {
                  IME.conversionMode = this._oldIMEMode;
               }
               IME.enabled = false;
            }
         }
      }
      
      public function drawNow() : void
      {
         this.draw();
      }
      
      protected function configUI() : void
      {
         this.isLivePreview = this.checkLivePreview();
         var _loc1_:Number = rotation;
         rotation = 0;
         var _loc2_:Number = super.width;
         var _loc3_:Number = super.height;
         super.scaleX = super.scaleY = 1;
         this.setSize(_loc2_,_loc3_);
         this.move(super.x,super.y);
         rotation = _loc1_;
         this.startWidth = _loc2_;
         this.startHeight = _loc3_;
         if(numChildren > 0)
         {
            removeChildAt(0);
         }
      }
      
      protected function checkLivePreview() : Boolean
      {
         var _loc1_:String = null;
         if(parent == null)
         {
            return false;
         }
         try
         {
            _loc1_ = getQualifiedClassName(parent);
         }
         catch(e:Error)
         {
         }
         return _loc1_ == "fl.livepreview::LivePreviewParent";
      }
      
      protected function isInvalid(param1:String, ... rest) : Boolean
      {
         if(Boolean(this.invalidHash[param1]) || Boolean(this.invalidHash[InvalidationType.ALL]))
         {
            return true;
         }
         while(rest.length > 0)
         {
            if(this.invalidHash[rest.pop()])
            {
               return true;
            }
         }
         return false;
      }
      
      protected function validate() : void
      {
         this.invalidHash = {};
      }
      
      protected function draw() : void
      {
         if(this.isInvalid(InvalidationType.SIZE,InvalidationType.STYLES))
         {
            if(this.isFocused && this.focusManager.showFocusIndicator)
            {
               this.drawFocus(true);
            }
         }
         this.validate();
      }
      
      protected function getDisplayObjectInstance(param1:Object) : DisplayObject
      {
         var skin:Object = param1;
         var obj:Object = null;
         var classDef:Object = null;
         if(skin is Class)
         {
            obj = new skin();
            if(obj is BitmapData)
            {
               return new Bitmap(obj as BitmapData);
            }
            return obj as DisplayObject;
         }
         if(skin is DisplayObject)
         {
            (skin as DisplayObject).x = 0;
            (skin as DisplayObject).y = 0;
            return skin as DisplayObject;
         }
         if(skin is BitmapData)
         {
            return new Bitmap(skin as BitmapData);
         }
         try
         {
            classDef = getDefinitionByName(skin.toString());
         }
         catch(e:Error)
         {
            try
            {
               classDef = loaderInfo.applicationDomain.getDefinition(skin.toString()) as Object;
            }
            catch(e:Error)
            {
            }
         }
         if(classDef == null)
         {
            return null;
         }
         obj = new classDef();
         if(obj is BitmapData)
         {
            return new Bitmap(obj as BitmapData);
         }
         return obj as DisplayObject;
      }
      
      protected function getStyleValue(param1:String) : Object
      {
         return this.instanceStyles[param1] == null ? this.sharedStyles[param1] : this.instanceStyles[param1];
      }
      
      protected function copyStylesToChild(param1:UIComponent, param2:Object) : void
      {
         var _loc3_:String = null;
         for(_loc3_ in param2)
         {
            param1.setStyle(_loc3_,this.getStyleValue(param2[_loc3_]));
         }
      }
      
      protected function callLater(param1:Function) : void
      {
         var fn:Function = param1;
         if(inCallLaterPhase)
         {
            return;
         }
         this.callLaterMethods[fn] = true;
         if(stage != null)
         {
            try
            {
               stage.addEventListener(Event.RENDER,this.callLaterDispatcher,false,0,true);
               stage.invalidate();
            }
            catch(se:SecurityError)
            {
               addEventListener(Event.ENTER_FRAME,callLaterDispatcher,false,0,true);
            }
         }
         else
         {
            addEventListener(Event.ADDED_TO_STAGE,this.callLaterDispatcher,false,0,true);
         }
      }
      
      private function callLaterDispatcher(param1:Event) : void
      {
         var methods:Dictionary;
         var method:Object = null;
         var event:Event = param1;
         if(event.type == Event.ADDED_TO_STAGE)
         {
            try
            {
               removeEventListener(Event.ADDED_TO_STAGE,this.callLaterDispatcher);
               stage.addEventListener(Event.RENDER,this.callLaterDispatcher,false,0,true);
               stage.invalidate();
               return;
            }
            catch(se1:SecurityError)
            {
               addEventListener(Event.ENTER_FRAME,callLaterDispatcher,false,0,true);
            }
         }
         else
         {
            event.target.removeEventListener(Event.RENDER,this.callLaterDispatcher);
            event.target.removeEventListener(Event.ENTER_FRAME,this.callLaterDispatcher);
            try
            {
               if(stage == null)
               {
                  addEventListener(Event.ADDED_TO_STAGE,this.callLaterDispatcher,false,0,true);
                  return;
               }
            }
            catch(se2:SecurityError)
            {
            }
         }
         inCallLaterPhase = true;
         methods = this.callLaterMethods;
         for(method in methods)
         {
            method();
            delete methods[method];
         }
         inCallLaterPhase = false;
      }
      
      private function initializeFocusManager() : void
      {
         var _loc1_:IFocusManager = null;
         var _loc2_:Dictionary = null;
         if(stage == null)
         {
            addEventListener(Event.ADDED_TO_STAGE,this.addedHandler,false,0,true);
         }
         else
         {
            this.createFocusManager();
            _loc1_ = this.focusManager;
            if(_loc1_ != null)
            {
               _loc2_ = focusManagerUsers[_loc1_];
               if(_loc2_ == null)
               {
                  _loc2_ = new Dictionary(true);
                  focusManagerUsers[_loc1_] = _loc2_;
               }
               _loc2_[this] = true;
            }
         }
         addEventListener(Event.REMOVED_FROM_STAGE,this.removedHandler);
      }
      
      private function addedHandler(param1:Event) : void
      {
         removeEventListener(Event.ADDED_TO_STAGE,this.addedHandler);
         this.initializeFocusManager();
      }
      
      private function removedHandler(param1:Event) : void
      {
         var _loc3_:Dictionary = null;
         var _loc4_:Boolean = false;
         var _loc5_:* = undefined;
         var _loc6_:* = undefined;
         var _loc7_:IFocusManager = null;
         removeEventListener(Event.REMOVED_FROM_STAGE,this.removedHandler);
         addEventListener(Event.ADDED_TO_STAGE,this.addedHandler);
         var _loc2_:IFocusManager = this.focusManager;
         if(_loc2_ != null)
         {
            _loc3_ = focusManagerUsers[_loc2_];
            if(_loc3_ != null)
            {
               delete _loc3_[this];
               _loc4_ = true;
               var _loc8_:int = 0;
               var _loc9_:* = _loc3_;
               for(_loc5_ in _loc9_)
               {
                  _loc4_ = false;
               }
               if(_loc4_)
               {
                  delete focusManagerUsers[_loc2_];
                  _loc3_ = null;
               }
            }
            if(_loc3_ == null)
            {
               _loc2_.deactivate();
               for(_loc6_ in focusManagers)
               {
                  _loc7_ = focusManagers[_loc6_];
                  if(_loc2_ == _loc7_)
                  {
                     delete focusManagers[_loc6_];
                  }
               }
            }
         }
      }
      
      protected function createFocusManager() : void
      {
         var myTopLevel:DisplayObjectContainer;
         var stageAccessOK:Boolean = true;
         try
         {
            stage.getChildAt(0);
         }
         catch(se:SecurityError)
         {
            stageAccessOK = false;
         }
         myTopLevel = null;
         if(stageAccessOK)
         {
            myTopLevel = stage;
         }
         else
         {
            myTopLevel = this;
            try
            {
               while(myTopLevel.parent != null)
               {
                  myTopLevel = myTopLevel.parent;
               }
            }
            catch(se:SecurityError)
            {
            }
         }
         if(focusManagers[myTopLevel] == null)
         {
            focusManagers[myTopLevel] = new FocusManager(myTopLevel);
         }
      }
      
      protected function isOurFocus(param1:DisplayObject) : Boolean
      {
         return param1 == this;
      }
      
      protected function focusInHandler(param1:FocusEvent) : void
      {
         var _loc2_:IFocusManager = null;
         if(this.isOurFocus(param1.target as DisplayObject))
         {
            _loc2_ = this.focusManager;
            if(Boolean(_loc2_) && _loc2_.showFocusIndicator)
            {
               this.drawFocus(true);
               this.isFocused = true;
            }
         }
      }
      
      protected function focusOutHandler(param1:FocusEvent) : void
      {
         if(this.isOurFocus(param1.target as DisplayObject))
         {
            this.drawFocus(false);
            this.isFocused = false;
         }
      }
      
      protected function keyDownHandler(param1:KeyboardEvent) : void
      {
      }
      
      protected function keyUpHandler(param1:KeyboardEvent) : void
      {
      }
      
      protected function hookAccessibility(param1:Event) : void
      {
         removeEventListener(Event.ENTER_FRAME,this.hookAccessibility);
         this.initializeAccessibility();
      }
      
      protected function initializeAccessibility() : void
      {
         if(UIComponent.createAccessibilityImplementation != null)
         {
            UIComponent.createAccessibilityImplementation(this);
         }
      }
   }
}

