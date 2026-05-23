package my
{
   import flash.utils.*;
   
   public class savetrans
   {
      
      private var _xml:XML;
      
      private const NULL_TYPY:String = "undefined";
      
      private const BOOBLEAN_TYPE:String = "Boolean";
      
      private const ARRAY_TYPE:String = "Array";
      
      private const STRING_TYPE:String = "String";
      
      private const OBJECT_TYPE:String = "Object";
      
      private const NUMBER_TYPE:String = "Number";
      
      private const XML_TYPE:String = "XML";
      
      public function savetrans()
      {
         super();
      }
      
      public function objectToString(param1:Object) : String
      {
         var _loc2_:* = null;
         var _loc3_:* = null;
         var _loc4_:* = null;
         if(!param1)
         {
            return null;
         }
         if(param1 is Boolean)
         {
            _loc3_ = this.BOOBLEAN_TYPE;
            _loc2_ = this.bolToXml(param1 as Boolean,null);
         }
         else
         {
            if(param1 is XML)
            {
               _loc2_ = param1 as XML;
               _loc2_.ignoreComments = true;
               return _loc2_.toString();
            }
            if(param1 is Array)
            {
               _loc3_ = this.ARRAY_TYPE;
               _loc2_ = this.arrToXml(param1 as Array,null);
            }
            else
            {
               if(param1 is String)
               {
                  _loc3_ = this.STRING_TYPE;
                  return param1 as String;
               }
               if(param1 is Number || param1 is int || param1 is uint)
               {
                  _loc3_ = this.NUMBER_TYPE;
                  return String(param1);
               }
               if(param1 is Object)
               {
                  _loc3_ = this.OBJECT_TYPE;
                  _loc2_ = this.objToXml(param1);
               }
            }
         }
         this.init2(_loc3_);
         this._xml.appendChild(_loc2_);
         this._xml.ignoreWhitespace = true;
         return this._xml.toString();
      }
      
      public function objToXml(param1:Object, param2:String = null) : XML
      {
         var _loc3_:* = null;
         var _loc4_:* = null;
         var _loc5_:* = null;
         _loc3_ = <s></s>;
         _loc3_.@type = this.OBJECT_TYPE;
         _loc3_.@name = param2;
         for(param2 in param1)
         {
            _loc4_ = param1[param2];
            if(_loc4_ is Boolean)
            {
               _loc5_ = this.bolToXml(_loc4_ as Boolean,param2);
               _loc3_.appendChild(_loc5_);
            }
            else if(_loc4_ is String)
            {
               _loc5_ = this.stringToXml(_loc4_ as String,param2);
               _loc3_.appendChild(_loc5_);
            }
            else if(_loc4_ is int || _loc4_ is uint || _loc4_ is Number)
            {
               _loc5_ = this.numToXml(_loc4_ as Number,param2);
               _loc3_.appendChild(_loc5_);
            }
            else if(_loc4_ is Array)
            {
               _loc5_ = this.arrToXml(_loc4_ as Array,param2);
               _loc3_.appendChild(_loc5_);
            }
            else if(_loc4_ is Object)
            {
               _loc5_ = this.objToXml(_loc4_,param2);
               _loc3_.appendChild(_loc5_);
            }
            else if(!_loc4_)
            {
               _loc5_ = this.nullToxml(null,param2);
               _loc3_.appendChild(_loc5_);
            }
         }
         return _loc3_;
      }
      
      private function nullToxml(param1:String, param2:String) : XML
      {
         var _loc3_:* = null;
         _loc3_ = <s></s>;
         _loc3_.@type = this.NULL_TYPY;
         _loc3_.@name = param2;
         return _loc3_;
      }
      
      private function stringToXml(param1:String, param2:String) : XML
      {
         var _loc3_:* = null;
         _loc3_ = new XML("<s>" + param1 + "</s>");
         _loc3_.@type = this.STRING_TYPE;
         _loc3_.@name = param2;
         return _loc3_;
      }
      
      private function numToXml(param1:Number, param2:String) : XML
      {
         var _loc3_:* = null;
         _loc3_ = new XML("<s>" + String(param1) + "</s>");
         _loc3_.@type = this.NUMBER_TYPE;
         _loc3_.@name = param2;
         return _loc3_;
      }
      
      private function arrToXml(param1:Array, param2:String) : XML
      {
         var _loc3_:int = 0;
         var _loc4_:int = 0;
         var _loc5_:* = null;
         var _loc6_:* = null;
         var _loc7_:* = null;
         _loc4_ = int(param1.length);
         _loc5_ = <s></s>;
         _loc5_.@type = this.ARRAY_TYPE;
         _loc5_.@name = param2;
         _loc3_ = 0;
         while(_loc3_ < _loc4_)
         {
            _loc6_ = param1[_loc3_];
            if(_loc6_ is Boolean)
            {
               _loc7_ = this.bolToXml(_loc6_ as Boolean,null);
               _loc5_.appendChild(_loc7_);
            }
            else if(_loc6_ is String)
            {
               _loc7_ = this.stringToXml(_loc6_ as String,null);
               _loc5_.appendChild(_loc7_);
            }
            else if(_loc6_ is int || _loc6_ is uint || _loc6_ is Number)
            {
               _loc7_ = this.numToXml(_loc6_ as Number,null);
               _loc5_.appendChild(_loc7_);
            }
            else if(_loc6_ is Array)
            {
               _loc7_ = this.arrToXml(_loc6_ as Array,null);
               _loc5_.appendChild(_loc7_);
            }
            else if(_loc6_ is Object)
            {
               _loc7_ = this.objToXml(_loc6_,null);
               _loc5_.appendChild(_loc7_);
            }
            _loc3_++;
         }
         return _loc5_;
      }
      
      private function bolToXml(param1:Boolean, param2:String) : XML
      {
         var _loc3_:* = null;
         if(param1)
         {
            _loc3_ = <s>true</s>;
         }
         else
         {
            _loc3_ = <s>false</s>;
         }
         _loc3_.@type = this.BOOBLEAN_TYPE;
         _loc3_.@name = param2;
         return _loc3_;
      }
      
      private function init2(param1:String) : void
      {
         this._xml = <saveXml></saveXml>;
         this._xml.@type = param1;
         this._xml.@game4399 = true;
      }
      
      public function decXml(param1:String) : Object
      {
         var _loc2_:* = null;
         var _loc3_:Boolean = false;
         var _loc4_:* = null;
         var _loc5_:* = null;
         var _loc6_:Array = this.strToObj(param1 as String);
         var _loc7_:* = null;
         if(_loc6_[0] == "String")
         {
            param1 = _loc6_[1];
            _loc7_ = param1;
         }
         else if(_loc6_[0] == "XML")
         {
            _loc2_ = _loc6_[1];
            _loc7_ = _loc2_;
         }
         else if(_loc6_[0] == "Boolean")
         {
            _loc3_ = Boolean(_loc6_[1]);
            _loc7_ = _loc3_;
         }
         else if(_loc6_[0] == "Object")
         {
            _loc7_ = _loc4_ = _loc6_[1];
         }
         else if(_loc6_[0] == "Array")
         {
            _loc7_ = _loc5_ = _loc6_[1];
         }
         return _loc7_;
      }
      
      public function strToObj(param1:String) : Array
      {
         var tmpStr:String = null;
         var str:String = null;
         tmpStr = null;
         str = null;
         tmpStr = null;
         str = null;
         var obj:Object = null;
         var arr:Array = null;
         var bol:Boolean = false;
         var xml:XML = null;
         var i:int = 0;
         var len:int = 0;
         var xmlList:XML = null;
         var type:String = null;
         tmpStr = null;
         str = param1;
         try
         {
            xml = new XML(str);
         }
         catch(error:Error)
         {
            tmpStr = str;
            tmpStr = this.urlencodeGBK(tmpStr);
            try
            {
               xml = new XML(tmpStr);
            }
            catch(error:Error)
            {
               return [this.STRING_TYPE,str];
            }
         }
         if(xml.children() == null || xml.children() == undefined)
         {
            return [this.STRING_TYPE,str];
         }
         if(xml.@game4399 != "true")
         {
            return [this.XML_TYPE,xml];
         }
         if(xml.@type == this.OBJECT_TYPE)
         {
            xmlList = xml.children()[0];
            obj = this.xmlToObj(xmlList);
            type = this.OBJECT_TYPE;
            return [type,obj];
         }
         if(xml.@type == this.BOOBLEAN_TYPE)
         {
            type = this.BOOBLEAN_TYPE;
            xmlList = xml.children()[0];
            bol = Boolean(this.xmlToBooblean(xmlList));
            return [type,bol];
         }
         if(xml.@type == this.ARRAY_TYPE)
         {
            type = this.ARRAY_TYPE;
            xmlList = xml.children()[0];
            arr = this.xmlToArray(xmlList);
            return [type,arr];
         }
         return null;
      }
      
      private function xmlToObj(param1:XML) : Object
      {
         var _loc2_:* = null;
         var _loc3_:int = 0;
         var _loc4_:int = 0;
         var _loc5_:* = null;
         var _loc6_:* = null;
         var _loc7_:* = null;
         var _loc8_:* = null;
         var _loc9_:* = null;
         _loc2_ = {};
         _loc4_ = int((_loc5_ = param1.children()).length());
         _loc3_ = 0;
         while(_loc3_ < _loc4_)
         {
            _loc6_ = _loc5_[_loc3_];
            _loc8_ = _loc6_.@type;
            _loc7_ = _loc6_.@name;
            if(_loc8_ == this.ARRAY_TYPE)
            {
               _loc9_ = this.xmlToArray(_loc6_) as Array;
            }
            if(_loc8_ == this.BOOBLEAN_TYPE)
            {
               _loc9_ = this.xmlToBooblean(_loc6_) as Boolean;
            }
            if(_loc8_ == this.STRING_TYPE)
            {
               _loc9_ = this.xmlToString(_loc6_) as String;
            }
            if(_loc8_ == this.NUMBER_TYPE)
            {
               _loc9_ = this.xmlToNumber(_loc6_) as Number;
            }
            if(_loc8_ == this.OBJECT_TYPE)
            {
               _loc9_ = this.xmlToObj(_loc6_);
            }
            _loc2_[_loc7_] = _loc9_;
            _loc3_++;
         }
         return _loc2_;
      }
      
      private function xmlToArray(param1:XML) : Array
      {
         var _loc2_:* = null;
         var _loc3_:int = 0;
         var _loc4_:int = 0;
         var _loc5_:* = null;
         var _loc6_:* = null;
         var _loc7_:* = null;
         var _loc8_:* = null;
         var _loc9_:* = null;
         _loc2_ = [];
         _loc4_ = int((_loc6_ = param1.children()).length());
         _loc3_ = 0;
         while(_loc3_ < _loc4_)
         {
            _loc7_ = _loc6_[_loc3_];
            _loc8_ = _loc7_.@type;
            _loc9_ = _loc7_.@name;
            if(_loc8_ == this.ARRAY_TYPE)
            {
               _loc5_ = this.xmlToArray(_loc7_) as Array;
            }
            if(_loc8_ == this.BOOBLEAN_TYPE)
            {
               _loc5_ = this.xmlToBooblean(_loc7_) as Boolean;
            }
            if(_loc8_ == this.STRING_TYPE)
            {
               _loc5_ = this.xmlToString(_loc7_) as String;
            }
            if(_loc8_ == this.NUMBER_TYPE)
            {
               _loc5_ = this.xmlToNumber(_loc7_) as Number;
            }
            if(_loc8_ == this.OBJECT_TYPE)
            {
               _loc5_ = this.xmlToObj(_loc7_);
            }
            if(_loc8_ == this.NULL_TYPY)
            {
               _loc5_ = null;
            }
            _loc2_.push(_loc5_);
            _loc3_++;
         }
         return _loc2_;
      }
      
      private function xmlToNumber(param1:XML) : Number
      {
         var _loc2_:Number = Number(NaN);
         return Number(param1[0]);
      }
      
      private function xmlToBooblean(param1:XML) : Boolean
      {
         var _loc2_:Boolean = false;
         if(param1[0] == "false")
         {
            _loc2_ = false;
         }
         else if(param1[0] == "true")
         {
            _loc2_ = true;
         }
         return _loc2_;
      }
      
      private function xmlToString(param1:XML) : String
      {
         var _loc2_:* = null;
         return String(param1[0]);
      }
      
      private function urlencodeGBK(param1:String) : String
      {
         var _loc2_:String = "";
         var _loc3_:ByteArray = new ByteArray();
         _loc3_.writeMultiByte(param1,"gbk");
         _loc3_.position = 0;
         return _loc3_.readUTFBytes(_loc3_.length - 1);
      }
   }
}

