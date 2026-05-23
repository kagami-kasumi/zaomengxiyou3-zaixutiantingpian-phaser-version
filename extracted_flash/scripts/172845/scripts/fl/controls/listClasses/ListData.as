package fl.controls.listClasses
{
   import fl.core.UIComponent;
   
   public class ListData
   {
      
      protected var _icon:Object = null;
      
      protected var _label:String;
      
      protected var _owner:UIComponent;
      
      protected var _index:uint;
      
      protected var _row:uint;
      
      protected var _column:uint;
      
      public function ListData(param1:String, param2:Object, param3:UIComponent, param4:uint, param5:uint, param6:uint = 0)
      {
         super();
         this._label = param1;
         this._icon = param2;
         this._owner = param3;
         this._index = param4;
         this._row = param5;
         this._column = param6;
      }
      
      public function get label() : String
      {
         return this._label;
      }
      
      public function get icon() : Object
      {
         return this._icon;
      }
      
      public function get owner() : UIComponent
      {
         return this._owner;
      }
      
      public function get index() : uint
      {
         return this._index;
      }
      
      public function get row() : uint
      {
         return this._row;
      }
      
      public function get column() : uint
      {
         return this._column;
      }
   }
}

