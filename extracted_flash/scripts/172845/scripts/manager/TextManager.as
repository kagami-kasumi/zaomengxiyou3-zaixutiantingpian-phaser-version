package manager
{
   import flash.filters.*;
   import flash.text.*;
   import my.*;
   
   public class TextManager
   {
      
      public function TextManager()
      {
         super();
      }
      
      public static function white(param1:String) : String
      {
         return "<font color=\'#ffffff\'>" + param1 + "</font>";
      }
      
      public static function red(param1:String) : String
      {
         return "<font color=\'#ff0000\'>" + param1 + "</font>";
      }
      
      public static function green(param1:String) : String
      {
         return "<font color=\'#00ff00\'>" + param1 + "</font>";
      }
      
      public static function bule(param1:String) : String
      {
         return "<font color=\'#000ff\'>" + param1 + "</font>";
      }
      
      public static function yellow(param1:String) : String
      {
         return "<font color=\'#ffff00\'>" + param1 + "</font>";
      }
      
      public static function line(param1:String, param2:int = 0) : String
      {
         return "<textformat leading=\'" + param2 + "\'>" + param1 + "</textformat>";
      }
      
      public static function createInputTextField(param1:int, param2:int, param3:int, param4:int, param5:String = "none", param6:int = 14, param7:uint = 16777215, param8:Boolean = true, param9:uint = 0) : TextField
      {
         var _loc10_:TextField = null;
         _loc10_ = createTextField(param1,param2,param3,param4,param5,param6,param7,param8,param9);
         _loc10_.selectable = true;
         _loc10_.mouseEnabled = true;
         _loc10_.type = TextFieldType.INPUT;
         return _loc10_;
      }
      
      public static function createInputTextMultiline(param1:int, param2:int, param3:int, param4:int, param5:int = 14, param6:uint = 16777215, param7:Boolean = true, param8:uint = 0) : TextField
      {
         var _loc9_:TextField = null;
         _loc9_ = createInputTextField(param1,param2,param3,param4,"none",param5,param6,param7,param8);
         _loc9_.wordWrap = true;
         return _loc9_;
      }
      
      public static function setFont(param1:Class) : void
      {
         Font.registerFont(param1);
      }
      
      public static function createTextField(param1:int, param2:int, param3:int, param4:int, param5:String = "center", param6:int = 14, param7:uint = 16777215, param8:Boolean = true, param9:uint = 0) : TextField
      {
         var _loc10_:TextField = null;
         var _loc11_:GlowFilter = null;
         _loc10_ = new TextField();
         _loc10_.selectable = false;
         _loc10_.mouseEnabled = false;
         _loc10_.autoSize = param5;
         _loc10_.x = param1;
         _loc10_.y = param2;
         _loc10_.width = param3;
         _loc10_.height = param4;
         var _loc12_:TextFormat = new TextFormat();
         _loc10_.embedFonts = true;
         _loc12_.font = AllConsts.GAME_CONFIG_FONT;
         _loc12_.size = param6;
         _loc12_.color = param7;
         _loc10_.defaultTextFormat = _loc12_;
         if(param8)
         {
            _loc11_ = new GlowFilter(param9,1,3,3,4);
            _loc10_.filters = [_loc11_];
         }
         return _loc10_;
      }
      
      public static function createTextMultiline(param1:int, param2:int, param3:int, param4:int, param5:int = 14, param6:uint = 16777215, param7:Boolean = true, param8:uint = 0) : TextField
      {
         var _loc9_:TextField = null;
         _loc9_ = createTextField(param1,param2,param3,param4,"none",param5,param6,param7,param8);
         _loc9_.autoSize = "none";
         _loc9_.multiline = true;
         _loc9_.wordWrap = true;
         return _loc9_;
      }
   }
}

