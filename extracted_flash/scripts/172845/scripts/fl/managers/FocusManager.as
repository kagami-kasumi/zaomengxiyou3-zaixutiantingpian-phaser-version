package fl.managers
{
   import fl.controls.Button;
   import fl.core.UIComponent;
   import flash.display.DisplayObject;
   import flash.display.DisplayObjectContainer;
   import flash.display.InteractiveObject;
   import flash.display.SimpleButton;
   import flash.display.Stage;
   import flash.events.Event;
   import flash.events.FocusEvent;
   import flash.events.KeyboardEvent;
   import flash.events.MouseEvent;
   import flash.text.TextField;
   import flash.text.TextFieldType;
   import flash.ui.Keyboard;
   import flash.utils.*;
   
   public class FocusManager implements IFocusManager
   {
      
      private var _form:DisplayObjectContainer;
      
      private var focusableObjects:Dictionary;
      
      private var focusableCandidates:Array;
      
      private var activated:Boolean = false;
      
      private var calculateCandidates:Boolean = true;
      
      private var lastFocus:InteractiveObject;
      
      private var _showFocusIndicator:Boolean = true;
      
      private var lastAction:String;
      
      private var defButton:Button;
      
      private var _defaultButton:Button;
      
      private var _defaultButtonEnabled:Boolean = true;
      
      public function FocusManager(param1:DisplayObjectContainer)
      {
         super();
         this.focusableObjects = new Dictionary(true);
         if(param1 != null)
         {
            this._form = param1;
            this.activate();
         }
      }
      
      private function addedHandler(param1:Event) : void
      {
         var _loc2_:DisplayObject = DisplayObject(param1.target);
         if(_loc2_.stage)
         {
            this.addFocusables(DisplayObject(param1.target));
         }
      }
      
      private function removedHandler(param1:Event) : void
      {
         var _loc2_:int = 0;
         var _loc4_:InteractiveObject = null;
         var _loc3_:DisplayObject = DisplayObject(param1.target);
         if(_loc3_ is IFocusManagerComponent && this.focusableObjects[_loc3_] == true)
         {
            if(_loc3_ == this.lastFocus)
            {
               IFocusManagerComponent(this.lastFocus).drawFocus(false);
               this.lastFocus = null;
            }
            _loc3_.removeEventListener(Event.TAB_ENABLED_CHANGE,this.tabEnabledChangeHandler,false);
            delete this.focusableObjects[_loc3_];
            this.calculateCandidates = true;
         }
         else if(_loc3_ is InteractiveObject && this.focusableObjects[_loc3_] == true)
         {
            _loc4_ = _loc3_ as InteractiveObject;
            if(_loc4_)
            {
               if(_loc4_ == this.lastFocus)
               {
                  this.lastFocus = null;
               }
               delete this.focusableObjects[_loc4_];
               this.calculateCandidates = true;
            }
            _loc3_.addEventListener(Event.TAB_ENABLED_CHANGE,this.tabEnabledChangeHandler,false,0,true);
         }
         this.removeFocusables(_loc3_);
      }
      
      private function addFocusables(param1:DisplayObject, param2:Boolean = false) : void
      {
         var focusable:IFocusManagerComponent = null;
         var io:InteractiveObject = null;
         var doc:DisplayObjectContainer = null;
         var docParent:DisplayObjectContainer = null;
         var i:int = 0;
         var child:DisplayObject = null;
         var o:DisplayObject = param1;
         var skipTopLevel:Boolean = param2;
         if(!skipTopLevel)
         {
            if(o is IFocusManagerComponent)
            {
               focusable = IFocusManagerComponent(o);
               if(focusable.focusEnabled)
               {
                  if(focusable.tabEnabled && this.isTabVisible(o))
                  {
                     this.focusableObjects[o] = true;
                     this.calculateCandidates = true;
                  }
                  o.addEventListener(Event.TAB_ENABLED_CHANGE,this.tabEnabledChangeHandler,false,0,true);
                  o.addEventListener(Event.TAB_INDEX_CHANGE,this.tabIndexChangeHandler,false,0,true);
               }
            }
            else if(o is InteractiveObject)
            {
               io = o as InteractiveObject;
               if(Boolean(io) && Boolean(io.tabEnabled) && this.findFocusManagerComponent(io) == io)
               {
                  this.focusableObjects[io] = true;
                  this.calculateCandidates = true;
               }
               io.addEventListener(Event.TAB_ENABLED_CHANGE,this.tabEnabledChangeHandler,false,0,true);
               io.addEventListener(Event.TAB_INDEX_CHANGE,this.tabIndexChangeHandler,false,0,true);
            }
         }
         if(o is DisplayObjectContainer)
         {
            doc = DisplayObjectContainer(o);
            o.addEventListener(Event.TAB_CHILDREN_CHANGE,this.tabChildrenChangeHandler,false,0,true);
            docParent = null;
            try
            {
               docParent = doc.parent;
            }
            catch(se:SecurityError)
            {
               docParent = null;
            }
            if(doc is Stage || docParent is Stage || doc.tabChildren)
            {
               i = 0;
               while(i < doc.numChildren)
               {
                  try
                  {
                     child = doc.getChildAt(i);
                     if(child != null)
                     {
                        this.addFocusables(doc.getChildAt(i));
                     }
                  }
                  catch(error:SecurityError)
                  {
                  }
                  i++;
               }
            }
         }
      }
      
      private function removeFocusables(param1:DisplayObject) : void
      {
         var _loc2_:Object = null;
         var _loc3_:DisplayObject = null;
         if(param1 is DisplayObjectContainer)
         {
            param1.removeEventListener(Event.TAB_CHILDREN_CHANGE,this.tabChildrenChangeHandler,false);
            param1.removeEventListener(Event.TAB_INDEX_CHANGE,this.tabIndexChangeHandler,false);
            for(_loc2_ in this.focusableObjects)
            {
               _loc3_ = DisplayObject(_loc2_);
               if(DisplayObjectContainer(param1).contains(_loc3_))
               {
                  if(_loc3_ == this.lastFocus)
                  {
                     this.lastFocus = null;
                  }
                  _loc3_.removeEventListener(Event.TAB_ENABLED_CHANGE,this.tabEnabledChangeHandler,false);
                  delete this.focusableObjects[_loc2_];
                  this.calculateCandidates = true;
               }
            }
         }
      }
      
      private function isTabVisible(param1:DisplayObject) : Boolean
      {
         var _loc2_:DisplayObjectContainer = null;
         try
         {
            _loc2_ = param1.parent;
            while(Boolean(_loc2_) && Boolean(!(_loc2_ is Stage)) && !(_loc2_.parent && _loc2_.parent is Stage))
            {
               if(!_loc2_.tabChildren)
               {
                  return false;
               }
               _loc2_ = _loc2_.parent;
            }
         }
         catch(se:SecurityError)
         {
         }
         return true;
      }
      
      private function isValidFocusCandidate(param1:DisplayObject, param2:String) : Boolean
      {
         var _loc3_:IFocusManagerGroup = null;
         if(!this.isEnabledAndVisible(param1))
         {
            return false;
         }
         if(param1 is IFocusManagerGroup)
         {
            _loc3_ = IFocusManagerGroup(param1);
            if(param2 == _loc3_.groupName)
            {
               return false;
            }
         }
         return true;
      }
      
      private function isEnabledAndVisible(param1:DisplayObject) : Boolean
      {
         var _loc2_:DisplayObjectContainer = null;
         var _loc3_:TextField = null;
         var _loc4_:SimpleButton = null;
         try
         {
            _loc2_ = DisplayObject(this.form).parent;
            while(param1 != _loc2_)
            {
               if(param1 is UIComponent)
               {
                  if(!UIComponent(param1).enabled)
                  {
                     return false;
                  }
               }
               else if(param1 is TextField)
               {
                  _loc3_ = TextField(param1);
                  if(_loc3_.type == TextFieldType.DYNAMIC || !_loc3_.selectable)
                  {
                     return false;
                  }
               }
               else if(param1 is SimpleButton)
               {
                  _loc4_ = SimpleButton(param1);
                  if(!_loc4_.enabled)
                  {
                     return false;
                  }
               }
               if(!param1.visible)
               {
                  return false;
               }
               param1 = param1.parent;
            }
         }
         catch(se:SecurityError)
         {
         }
         return true;
      }
      
      private function tabEnabledChangeHandler(param1:Event) : void
      {
         this.calculateCandidates = true;
         var _loc2_:InteractiveObject = InteractiveObject(param1.target);
         var _loc3_:Boolean = this.focusableObjects[_loc2_] == true;
         if(_loc2_.tabEnabled)
         {
            if(!_loc3_ && this.isTabVisible(_loc2_))
            {
               if(!(_loc2_ is IFocusManagerComponent))
               {
                  _loc2_.focusRect = false;
               }
               this.focusableObjects[_loc2_] = true;
            }
         }
         else if(_loc3_)
         {
            delete this.focusableObjects[_loc2_];
         }
      }
      
      private function tabIndexChangeHandler(param1:Event) : void
      {
         this.calculateCandidates = true;
      }
      
      private function tabChildrenChangeHandler(param1:Event) : void
      {
         if(param1.target != param1.currentTarget)
         {
            return;
         }
         this.calculateCandidates = true;
         var _loc2_:DisplayObjectContainer = DisplayObjectContainer(param1.target);
         if(_loc2_.tabChildren)
         {
            this.addFocusables(_loc2_,true);
         }
         else
         {
            this.removeFocusables(_loc2_);
         }
      }
      
      public function activate() : void
      {
         if(this.activated)
         {
            return;
         }
         this.addFocusables(this.form);
         this.form.addEventListener(Event.ADDED,this.addedHandler,false,0,true);
         this.form.addEventListener(Event.REMOVED,this.removedHandler,false,0,true);
         try
         {
            this.form.stage.addEventListener(FocusEvent.MOUSE_FOCUS_CHANGE,this.mouseFocusChangeHandler,false,0,true);
            this.form.stage.addEventListener(FocusEvent.KEY_FOCUS_CHANGE,this.keyFocusChangeHandler,false,0,true);
            this.form.stage.addEventListener(Event.ACTIVATE,this.activateHandler,false,0,true);
            this.form.stage.addEventListener(Event.DEACTIVATE,this.deactivateHandler,false,0,true);
         }
         catch(se:SecurityError)
         {
            form.addEventListener(FocusEvent.MOUSE_FOCUS_CHANGE,mouseFocusChangeHandler,false,0,true);
            form.addEventListener(FocusEvent.KEY_FOCUS_CHANGE,keyFocusChangeHandler,false,0,true);
            form.addEventListener(Event.ACTIVATE,activateHandler,false,0,true);
            form.addEventListener(Event.DEACTIVATE,deactivateHandler,false,0,true);
         }
         this.form.addEventListener(FocusEvent.FOCUS_IN,this.focusInHandler,true,0,true);
         this.form.addEventListener(FocusEvent.FOCUS_OUT,this.focusOutHandler,true,0,true);
         this.form.addEventListener(MouseEvent.MOUSE_DOWN,this.mouseDownHandler,false,0,true);
         this.form.addEventListener(KeyboardEvent.KEY_DOWN,this.keyDownHandler,true,0,true);
         this.activated = true;
         if(this.lastFocus)
         {
            this.setFocus(this.lastFocus);
         }
      }
      
      public function deactivate() : void
      {
         if(!this.activated)
         {
            return;
         }
         this.focusableObjects = new Dictionary(true);
         this.focusableCandidates = null;
         this.lastFocus = null;
         this.defButton = null;
         this.form.removeEventListener(Event.ADDED,this.addedHandler,false);
         this.form.removeEventListener(Event.REMOVED,this.removedHandler,false);
         try
         {
            this.form.stage.removeEventListener(FocusEvent.MOUSE_FOCUS_CHANGE,this.mouseFocusChangeHandler,false);
            this.form.stage.removeEventListener(FocusEvent.KEY_FOCUS_CHANGE,this.keyFocusChangeHandler,false);
            this.form.stage.removeEventListener(Event.ACTIVATE,this.activateHandler,false);
            this.form.stage.removeEventListener(Event.DEACTIVATE,this.deactivateHandler,false);
         }
         catch(se:SecurityError)
         {
         }
         this.form.removeEventListener(FocusEvent.MOUSE_FOCUS_CHANGE,this.mouseFocusChangeHandler,false);
         this.form.removeEventListener(FocusEvent.KEY_FOCUS_CHANGE,this.keyFocusChangeHandler,false);
         this.form.removeEventListener(Event.ACTIVATE,this.activateHandler,false);
         this.form.removeEventListener(Event.DEACTIVATE,this.deactivateHandler,false);
         this.form.removeEventListener(FocusEvent.FOCUS_IN,this.focusInHandler,true);
         this.form.removeEventListener(FocusEvent.FOCUS_OUT,this.focusOutHandler,true);
         this.form.removeEventListener(MouseEvent.MOUSE_DOWN,this.mouseDownHandler,false);
         this.form.removeEventListener(KeyboardEvent.KEY_DOWN,this.keyDownHandler,true);
         this.activated = false;
      }
      
      private function focusInHandler(param1:FocusEvent) : void
      {
         var _loc3_:Button = null;
         if(!this.activated)
         {
            return;
         }
         var _loc2_:InteractiveObject = InteractiveObject(param1.target);
         if(this.form.contains(_loc2_))
         {
            this.lastFocus = this.findFocusManagerComponent(InteractiveObject(_loc2_));
            if(this.lastFocus is Button)
            {
               _loc3_ = Button(this.lastFocus);
               if(this.defButton)
               {
                  this.defButton.emphasized = false;
                  this.defButton = _loc3_;
                  _loc3_.emphasized = true;
               }
            }
            else if(Boolean(this.defButton) && this.defButton != this._defaultButton)
            {
               this.defButton.emphasized = false;
               this.defButton = this._defaultButton;
               this._defaultButton.emphasized = true;
            }
         }
      }
      
      private function focusOutHandler(param1:FocusEvent) : void
      {
         if(!this.activated)
         {
            return;
         }
         var _loc2_:InteractiveObject = param1.target as InteractiveObject;
      }
      
      private function activateHandler(param1:Event) : void
      {
         if(!this.activated)
         {
            return;
         }
         var _loc2_:InteractiveObject = InteractiveObject(param1.target);
         if(this.lastFocus)
         {
            if(this.lastFocus is IFocusManagerComponent)
            {
               IFocusManagerComponent(this.lastFocus).setFocus();
            }
            else
            {
               this.form.stage.focus = this.lastFocus;
            }
         }
         this.lastAction = "ACTIVATE";
      }
      
      private function deactivateHandler(param1:Event) : void
      {
         if(!this.activated)
         {
            return;
         }
         var _loc2_:InteractiveObject = InteractiveObject(param1.target);
      }
      
      private function mouseFocusChangeHandler(param1:FocusEvent) : void
      {
         if(!this.activated)
         {
            return;
         }
         if(param1.relatedObject is TextField)
         {
            return;
         }
         param1.preventDefault();
      }
      
      private function keyFocusChangeHandler(param1:FocusEvent) : void
      {
         if(!this.activated)
         {
            return;
         }
         this.showFocusIndicator = true;
         if((param1.keyCode == Keyboard.TAB || param1.keyCode == 0) && !param1.isDefaultPrevented())
         {
            this.setFocusToNextObject(param1);
            param1.preventDefault();
         }
      }
      
      private function keyDownHandler(param1:KeyboardEvent) : void
      {
         if(!this.activated)
         {
            return;
         }
         if(param1.keyCode == Keyboard.TAB)
         {
            this.lastAction = "KEY";
            if(this.calculateCandidates)
            {
               this.sortFocusableObjects();
               this.calculateCandidates = false;
            }
         }
         if(Boolean(this.defaultButtonEnabled && param1.keyCode == Keyboard.ENTER) && Boolean(this.defaultButton) && this.defButton.enabled)
         {
            this.sendDefaultButtonEvent();
         }
      }
      
      private function mouseDownHandler(param1:MouseEvent) : void
      {
         if(!this.activated)
         {
            return;
         }
         if(param1.isDefaultPrevented())
         {
            return;
         }
         var _loc2_:InteractiveObject = this.getTopLevelFocusTarget(InteractiveObject(param1.target));
         if(!_loc2_)
         {
            return;
         }
         this.showFocusIndicator = false;
         if((_loc2_ != this.lastFocus || this.lastAction == "ACTIVATE") && !(_loc2_ is TextField))
         {
            this.setFocus(_loc2_);
         }
         this.lastAction = "MOUSEDOWN";
      }
      
      public function get defaultButton() : Button
      {
         return this._defaultButton;
      }
      
      public function set defaultButton(param1:Button) : void
      {
         var _loc2_:Button = param1 ? Button(param1) : null;
         if(_loc2_ != this._defaultButton)
         {
            if(this._defaultButton)
            {
               this._defaultButton.emphasized = false;
            }
            if(this.defButton)
            {
               this.defButton.emphasized = false;
            }
            this._defaultButton = _loc2_;
            this.defButton = _loc2_;
            if(_loc2_)
            {
               _loc2_.emphasized = true;
            }
         }
      }
      
      public function sendDefaultButtonEvent() : void
      {
         this.defButton.dispatchEvent(new MouseEvent(MouseEvent.CLICK));
      }
      
      private function setFocusToNextObject(param1:FocusEvent) : void
      {
         if(!this.hasFocusableObjects())
         {
            return;
         }
         var _loc2_:InteractiveObject = this.getNextFocusManagerComponent(param1.shiftKey);
         if(_loc2_)
         {
            this.setFocus(_loc2_);
         }
      }
      
      private function hasFocusableObjects() : Boolean
      {
         var _loc1_:Object = null;
         var _loc2_:int = 0;
         var _loc3_:* = this.focusableObjects;
         for(_loc1_ in _loc3_)
         {
            return true;
         }
         return false;
      }
      
      public function getNextFocusManagerComponent(param1:Boolean = false) : InteractiveObject
      {
         var _loc8_:IFocusManagerGroup = null;
         if(!this.hasFocusableObjects())
         {
            return null;
         }
         if(this.calculateCandidates)
         {
            this.sortFocusableObjects();
            this.calculateCandidates = false;
         }
         var _loc2_:DisplayObject = this.form.stage.focus;
         _loc2_ = DisplayObject(this.findFocusManagerComponent(InteractiveObject(_loc2_)));
         var _loc3_:String = "";
         if(_loc2_ is IFocusManagerGroup)
         {
            _loc8_ = IFocusManagerGroup(_loc2_);
            _loc3_ = _loc8_.groupName;
         }
         var _loc4_:int = this.getIndexOfFocusedObject(_loc2_);
         var _loc5_:Boolean = false;
         var _loc6_:int = _loc4_;
         if(_loc4_ == -1)
         {
            if(param1)
            {
               _loc4_ = int(this.focusableCandidates.length);
            }
            _loc5_ = true;
         }
         var _loc7_:int = this.getIndexOfNextObject(_loc4_,param1,_loc5_,_loc3_);
         return this.findFocusManagerComponent(this.focusableCandidates[_loc7_]);
      }
      
      private function getIndexOfFocusedObject(param1:DisplayObject) : int
      {
         var _loc2_:int = int(this.focusableCandidates.length);
         var _loc3_:int = 0;
         _loc3_ = 0;
         while(_loc3_ < _loc2_)
         {
            if(this.focusableCandidates[_loc3_] == param1)
            {
               return _loc3_;
            }
            _loc3_++;
         }
         return -1;
      }
      
      private function getIndexOfNextObject(param1:int, param2:Boolean, param3:Boolean, param4:String) : int
      {
         var _loc7_:DisplayObject = null;
         var _loc8_:IFocusManagerGroup = null;
         var _loc9_:int = 0;
         var _loc10_:DisplayObject = null;
         var _loc11_:IFocusManagerGroup = null;
         var _loc5_:int = int(this.focusableCandidates.length);
         var _loc6_:int = param1;
         while(true)
         {
            if(param2)
            {
               param1--;
            }
            else
            {
               param1++;
            }
            if(param3)
            {
               if(param2 && param1 < 0)
               {
                  break;
               }
               if(!param2 && param1 == _loc5_)
               {
                  break;
               }
            }
            else
            {
               param1 = int((param1 + _loc5_) % _loc5_);
               if(_loc6_ == param1)
               {
                  break;
               }
            }
            if(this.isValidFocusCandidate(this.focusableCandidates[param1],param4))
            {
               _loc7_ = DisplayObject(this.findFocusManagerComponent(this.focusableCandidates[param1]));
               if(_loc7_ is IFocusManagerGroup)
               {
                  _loc8_ = IFocusManagerGroup(_loc7_);
                  _loc9_ = 0;
                  while(_loc9_ < this.focusableCandidates.length)
                  {
                     _loc10_ = this.focusableCandidates[_loc9_];
                     if(_loc10_ is IFocusManagerGroup)
                     {
                        _loc11_ = IFocusManagerGroup(_loc10_);
                        if(_loc11_.groupName == _loc8_.groupName && _loc11_.selected)
                        {
                           param1 = _loc9_;
                           break;
                        }
                     }
                     _loc9_++;
                  }
               }
               return param1;
            }
         }
         return param1;
      }
      
      private function sortFocusableObjects() : void
      {
         var _loc1_:Object = null;
         var _loc2_:InteractiveObject = null;
         this.focusableCandidates = [];
         for(_loc1_ in this.focusableObjects)
         {
            _loc2_ = InteractiveObject(_loc1_);
            if(Boolean(_loc2_.tabIndex) && Boolean(!isNaN(Number(_loc2_.tabIndex))) && _loc2_.tabIndex > 0)
            {
               this.sortFocusableObjectsTabIndex();
               return;
            }
            this.focusableCandidates.push(_loc2_);
         }
         this.focusableCandidates.sort(this.sortByDepth);
      }
      
      private function sortFocusableObjectsTabIndex() : void
      {
         var _loc1_:Object = null;
         var _loc2_:InteractiveObject = null;
         this.focusableCandidates = [];
         for(_loc1_ in this.focusableObjects)
         {
            _loc2_ = InteractiveObject(_loc1_);
            if(Boolean(_loc2_.tabIndex) && !isNaN(Number(_loc2_.tabIndex)))
            {
               this.focusableCandidates.push(_loc2_);
            }
         }
         this.focusableCandidates.sort(this.sortByTabIndex);
      }
      
      private function sortByDepth(param1:InteractiveObject, param2:InteractiveObject) : Number
      {
         var _loc5_:int = 0;
         var _loc6_:String = null;
         var _loc7_:String = null;
         var _loc3_:String = "";
         var _loc4_:String = "";
         var _loc8_:String = "0000";
         var _loc9_:DisplayObject = DisplayObject(param1);
         var _loc10_:DisplayObject = DisplayObject(param2);
         try
         {
            while(_loc9_ != DisplayObject(this.form) && Boolean(_loc9_.parent))
            {
               _loc5_ = this.getChildIndex(_loc9_.parent,_loc9_);
               _loc6_ = _loc5_.toString(16);
               if(_loc6_.length < 4)
               {
                  _loc7_ = _loc8_.substring(0,4 - _loc6_.length) + _loc6_;
               }
               _loc3_ = _loc7_ + _loc3_;
               _loc9_ = _loc9_.parent;
            }
         }
         catch(se1:SecurityError)
         {
         }
         try
         {
            while(_loc10_ != DisplayObject(this.form) && Boolean(_loc10_.parent))
            {
               _loc5_ = this.getChildIndex(_loc10_.parent,_loc10_);
               _loc6_ = _loc5_.toString(16);
               if(_loc6_.length < 4)
               {
                  _loc7_ = _loc8_.substring(0,4 - _loc6_.length) + _loc6_;
               }
               _loc4_ = _loc7_ + _loc4_;
               _loc10_ = _loc10_.parent;
            }
         }
         catch(se2:SecurityError)
         {
         }
         return _loc3_ > _loc4_ ? 1 : (_loc3_ < _loc4_ ? -1 : 0);
      }
      
      private function getChildIndex(param1:DisplayObjectContainer, param2:DisplayObject) : int
      {
         return param1.getChildIndex(param2);
      }
      
      private function sortByTabIndex(param1:InteractiveObject, param2:InteractiveObject) : int
      {
         return param1.tabIndex > param2.tabIndex ? 1 : (param1.tabIndex < param2.tabIndex ? -1 : int(this.sortByDepth(param1,param2)));
      }
      
      public function get defaultButtonEnabled() : Boolean
      {
         return this._defaultButtonEnabled;
      }
      
      public function set defaultButtonEnabled(param1:Boolean) : void
      {
         this._defaultButtonEnabled = param1;
      }
      
      public function get nextTabIndex() : int
      {
         return 0;
      }
      
      public function get showFocusIndicator() : Boolean
      {
         return this._showFocusIndicator;
      }
      
      public function set showFocusIndicator(param1:Boolean) : void
      {
         this._showFocusIndicator = param1;
      }
      
      public function get form() : DisplayObjectContainer
      {
         return this._form;
      }
      
      public function set form(param1:DisplayObjectContainer) : void
      {
         this._form = param1;
      }
      
      public function getFocus() : InteractiveObject
      {
         var _loc1_:InteractiveObject = this.form.stage.focus;
         return this.findFocusManagerComponent(_loc1_);
      }
      
      public function setFocus(param1:InteractiveObject) : void
      {
         if(param1 is IFocusManagerComponent)
         {
            IFocusManagerComponent(param1).setFocus();
         }
         else
         {
            this.form.stage.focus = param1;
         }
      }
      
      public function showFocus() : void
      {
      }
      
      public function hideFocus() : void
      {
      }
      
      public function findFocusManagerComponent(param1:InteractiveObject) : InteractiveObject
      {
         var _loc2_:InteractiveObject = param1;
         try
         {
            while(param1)
            {
               if(param1 is IFocusManagerComponent && IFocusManagerComponent(param1).focusEnabled)
               {
                  return param1;
               }
               param1 = param1.parent;
            }
         }
         catch(se:SecurityError)
         {
         }
         return _loc2_;
      }
      
      private function getTopLevelFocusTarget(param1:InteractiveObject) : InteractiveObject
      {
         try
         {
            while(param1 != InteractiveObject(this.form))
            {
               if(param1 is IFocusManagerComponent && IFocusManagerComponent(param1).focusEnabled && IFocusManagerComponent(param1).mouseFocusEnabled && UIComponent(param1).enabled)
               {
                  return param1;
               }
               param1 = param1.parent;
               if(param1 == null)
               {
                  break;
               }
            }
         }
         catch(se:SecurityError)
         {
         }
         return null;
      }
   }
}

