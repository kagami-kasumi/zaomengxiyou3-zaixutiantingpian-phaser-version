package fl.controls
{
   import fl.core.InvalidationType;
   import fl.core.UIComponent;
   import fl.managers.IFocusManagerComponent;
   import flash.display.DisplayObject;
   
   [Embed(source="/_assets/assets.swf", symbol="symbol29")]
   public class Button extends LabelButton implements IFocusManagerComponent
   {
      
      public static var createAccessibilityImplementation:Function;
      
      private static var defaultStyles:Object = {
         "emphasizedSkin":"Button_emphasizedSkin",
         "emphasizedPadding":2
      };
      
      protected var _emphasized:Boolean = false;
      
      protected var emphasizedBorder:DisplayObject;
      
      public function Button()
      {
         super();
      }
      
      public static function getStyleDefinition() : Object
      {
         return UIComponent.mergeStyles(LabelButton.getStyleDefinition(),defaultStyles);
      }
      
      public function get emphasized() : Boolean
      {
         return this._emphasized;
      }
      
      public function set emphasized(param1:Boolean) : void
      {
         this._emphasized = param1;
         invalidate(InvalidationType.STYLES);
      }
      
      override protected function draw() : void
      {
         if(isInvalid(InvalidationType.STYLES) || isInvalid(InvalidationType.SIZE))
         {
            this.drawEmphasized();
         }
         super.draw();
         if(this.emphasizedBorder != null)
         {
            setChildIndex(this.emphasizedBorder,numChildren - 1);
         }
      }
      
      protected function drawEmphasized() : void
      {
         var _loc2_:Number = NaN;
         if(this.emphasizedBorder != null)
         {
            removeChild(this.emphasizedBorder);
         }
         this.emphasizedBorder = null;
         if(!this._emphasized)
         {
            return;
         }
         var _loc1_:Object = getStyleValue("emphasizedSkin");
         if(_loc1_ != null)
         {
            this.emphasizedBorder = getDisplayObjectInstance(_loc1_);
         }
         if(this.emphasizedBorder != null)
         {
            addChildAt(this.emphasizedBorder,0);
            _loc2_ = Number(getStyleValue("emphasizedPadding"));
            this.emphasizedBorder.x = this.emphasizedBorder.y = -_loc2_;
            this.emphasizedBorder.width = width + _loc2_ * 2;
            this.emphasizedBorder.height = height + _loc2_ * 2;
         }
      }
      
      override public function drawFocus(param1:Boolean) : void
      {
         var _loc2_:Number = NaN;
         var _loc3_:* = undefined;
         super.drawFocus(param1);
         if(param1)
         {
            _loc2_ = Number(getStyleValue("emphasizedPadding"));
            if(_loc2_ < 0 || !this._emphasized)
            {
               _loc2_ = 0;
            }
            _loc3_ = getStyleValue("focusRectPadding");
            _loc3_ = _loc3_ == null ? 2 : _loc3_;
            _loc3_ += _loc2_;
            uiFocusRect.x = -_loc3_;
            uiFocusRect.y = -_loc3_;
            uiFocusRect.width = width + _loc3_ * 2;
            uiFocusRect.height = height + _loc3_ * 2;
         }
      }
      
      override protected function initializeAccessibility() : void
      {
         if(Button.createAccessibilityImplementation != null)
         {
            Button.createAccessibilityImplementation(this);
         }
      }
   }
}

