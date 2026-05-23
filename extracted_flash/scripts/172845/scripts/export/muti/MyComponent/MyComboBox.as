package export.muti.MyComponent
{
   import com.greensock.*;
   import flash.display.*;
   import flash.events.*;
   import flash.filters.*;
   import flash.utils.*;
   
   public class MyComboBox extends Sprite
   {
      
      public static var MYCOMBOBOX_ALL:String = "MyComboBox_ALL";
      
      public static var MYCOMBOBOX_HUNZHAN:String = "MyComboBox_HUNZHAN";
      
      public static var MYCOMBOBOX_DANTIAO:String = "MyComboBox_DANTIAO";
      
      private const MYCOMBOBOX_CUR:String = "MYCOMBOBOX_CUR";
      
      private var dataArray:Array;
      
      private var curShowSprite:Sprite;
      
      private var curShowIndex:uint = 0;
      
      private var state:uint = 0;
      
      public function MyComboBox()
      {
         this.dataArray = [];
         super();
      }
      
      public function setData(param1:Array) : void
      {
         var _loc2_:* = null;
         var _loc3_:* = null;
         var _loc4_:* = null;
         for each(_loc3_ in param1)
         {
            _loc4_ = _loc3_.label;
            if(_loc4_ == MYCOMBOBOX_ALL)
            {
               _loc2_ = this.getNewObj("MyComboBox_ALL") as MyComboBoxSingleLine;
            }
            else if(_loc4_ == MYCOMBOBOX_HUNZHAN)
            {
               _loc2_ = this.getNewObj("MyComboBox_HUNZHAN") as MyComboBoxSingleLine;
            }
            else if(_loc4_ == MYCOMBOBOX_DANTIAO)
            {
               _loc2_ = this.getNewObj("MyComboBox_DANTIAO") as MyComboBoxSingleLine;
            }
            _loc2_.value = _loc3_.value;
            _loc2_.name = _loc4_;
            _loc2_.scaleX = 0.9;
            _loc2_.scaleY = 0.9;
            this.dataArray.push(_loc2_);
            this.addChild(_loc2_);
         }
         this.curShowSprite = this.getNewObj((this.dataArray[0] as Sprite).name) as Sprite;
         this.curShowSprite.name = this.MYCOMBOBOX_CUR;
         this.curShowIndex = 0;
         this.addChild(this.curShowSprite);
         this.buttonMode = true;
         this.addEventListener(MouseEvent.CLICK,this.__mouseClick);
         this.addEventListener(MouseEvent.MOUSE_OVER,this.__mouseOver);
         this.addEventListener(MouseEvent.MOUSE_OUT,this.__mouseOut);
      }
      
      private function __mouseClick(param1:MouseEvent) : void
      {
         var _loc2_:* = null;
         var _loc3_:int = 0;
         var _loc4_:* = null;
         var _loc5_:int = int(this.dataArray.indexOf(param1.target));
         if(param1.target.name == this.MYCOMBOBOX_CUR)
         {
            if(this.state == 0)
            {
               for each(_loc2_ in this.dataArray)
               {
                  _loc3_ = int(this.dataArray.indexOf(_loc2_));
                  TweenMax.to(_loc2_,0.5,{"y":28 + _loc3_ * 28});
                  if(this.curShowIndex == _loc3_)
                  {
                     _loc4_ = new GlowFilter(16777215,1,5,5,1.5,BitmapFilterQuality.HIGH,false,false);
                     _loc2_.filters = [_loc4_];
                  }
                  else
                  {
                     _loc2_.filters = [];
                  }
               }
               this.state = 1;
            }
            else
            {
               this.allHide();
            }
         }
         if(_loc5_ != -1)
         {
            this.curShowIndex = _loc5_;
            this.removeChild(this.curShowSprite);
            this.curShowSprite = this.getNewObj(param1.target.name) as Sprite;
            this.curShowSprite.name = this.MYCOMBOBOX_CUR;
            this.addChild(this.curShowSprite);
            this.allHide();
         }
      }
      
      private function allHide() : void
      {
         var _loc1_:* = null;
         var _loc2_:int = 0;
         for each(_loc1_ in this.dataArray)
         {
            _loc2_ = int(this.dataArray.indexOf(_loc1_));
            _loc1_.filters = [];
            TweenMax.to(_loc1_,0,{
               "x":0,
               "y":0
            });
         }
         this.state = 0;
      }
      
      private function __mouseOver(param1:MouseEvent) : void
      {
         var _loc2_:int = 0;
         var _loc3_:* = null;
         var _loc4_:* = null;
         var _loc5_:Sprite = param1.target as Sprite;
         _loc2_ = int(this.dataArray.indexOf(param1.target));
         if(_loc2_ != -1)
         {
            _loc3_ = new GlowFilter(16711680,1,5,5,1.5,BitmapFilterQuality.HIGH,false,false);
            _loc4_ = _loc5_.filters;
            _loc4_.push(_loc3_);
            _loc5_.filters = _loc4_;
         }
      }
      
      private function __mouseOut(param1:MouseEvent) : void
      {
         var _loc2_:int = 0;
         var _loc3_:* = null;
         var _loc4_:Sprite = param1.target as Sprite;
         _loc2_ = int(this.dataArray.indexOf(param1.target));
         if(_loc2_ != -1)
         {
            _loc3_ = _loc4_.filters;
            _loc3_.pop();
            _loc4_.filters = _loc3_;
         }
      }
      
      public function getCurValue() : uint
      {
         var _loc1_:MyComboBoxSingleLine = this.dataArray[this.curShowIndex];
         return _loc1_.value;
      }
      
      public function destroy() : void
      {
         this.removeEventListener(MouseEvent.CLICK,this.__mouseClick);
      }
      
      public function getNewObj(param1:*) : *
      {
         var _loc2_:Class = getDefinitionByName(param1) as Class;
         return new _loc2_();
      }
      
      public function clone(param1:Object) : Object
      {
         var _loc2_:ByteArray = new ByteArray();
         _loc2_.writeObject(param1);
         _loc2_.position = 0;
         return _loc2_.readObject();
      }
   }
}

