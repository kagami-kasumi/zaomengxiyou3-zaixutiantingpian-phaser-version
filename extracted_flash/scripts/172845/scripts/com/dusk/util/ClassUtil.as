package com.dusk.util
{
   import flash.display.DisplayObject;
   import flash.events.*;
   import flash.utils.*;
   
   public class ClassUtil extends UtilBase
   {
      
      public function ClassUtil()
      {
         super();
      }
      
      public static function getClassProperty(param1:Class) : Array
      {
         var publicKey:Array = null;
         var clsXml:XML = null;
         var variables:XMLList = null;
         var varXml:XML = null;
         var name:String = null;
         var cls:Class = param1;
         if(cls == null)
         {
            return null;
         }
         publicKey = [];
         try
         {
            clsXml = describeType(cls);
            variables = clsXml.factory.variable;
         }
         catch(e:Error)
         {
            trace("转换失败！");
         }
         if(variables == null)
         {
            return null;
         }
         for each(varXml in variables)
         {
            name = varXml.@name;
            publicKey.push(name);
         }
         return publicKey;
      }
      
      public static function getClassName(param1:*) : String
      {
         if(param1 == null)
         {
            return null;
         }
         return getQualifiedClassName(param1) as String;
      }
      
      public static function getClassShortName(param1:*) : String
      {
         var _loc2_:String = getClassName(param1);
         if(_loc2_ == null)
         {
            return null;
         }
         return _loc2_.split("::")[1] as String;
      }
      
      public static function getClassEventMethod(param1:*) : Array
      {
         var eventFuncArr:Array = null;
         var className:String = null;
         var eventName:String = null;
         var clsXml:XML = null;
         var methods:XMLList = null;
         var methodXml:XML = null;
         var declaredBy:String = null;
         var parameters:XMLList = null;
         var parameter:XML = null;
         var parameterType:String = null;
         var name:String = null;
         var value:* = param1;
         if(value == null)
         {
            return null;
         }
         eventFuncArr = [];
         try
         {
            clsXml = describeType(value);
            methods = clsXml.method;
         }
         catch(e:Error)
         {
            trace("转换失败！");
         }
         if(methods == null)
         {
            return null;
         }
         className = getClassName(value);
         eventName = getClassName(Event);
         for each(methodXml in methods)
         {
            declaredBy = methodXml.@declaredBy;
            if(declaredBy == className)
            {
               parameters = methodXml.parameter;
               if(parameters.length() == 1)
               {
                  parameter = parameters[0];
                  parameterType = parameter.@type;
                  if(parameterType == eventName)
                  {
                     name = methodXml.@name;
                     eventFuncArr.push(name);
                  }
               }
            }
         }
         return eventFuncArr;
      }
      
      public static function removeAllEventListener(param1:DisplayObject, param2:Function = null) : void
      {
         var _loc3_:String = null;
         var _loc4_:Function = null;
         if(param1 == null || !param1.hasEventListener(Event.ENTER_FRAME))
         {
            return;
         }
         var _loc5_:Array = getClassEventMethod(param1);
         if(_loc5_ == null)
         {
            return;
         }
         for each(_loc3_ in _loc5_)
         {
            _loc4_ = param1[_loc3_] as Function;
            if(!(_loc4_ == null || !param1.hasEventListener(Event.ENTER_FRAME)))
            {
               param1.removeEventListener(Event.ENTER_FRAME,_loc4_);
               if(param2 != null)
               {
                  param2(_loc3_);
               }
            }
         }
      }
      
      public static function continuousAccess(param1:*, param2:Array = null) : *
      {
         var len:int = 0;
         var i:int = 0;
         var begin:* = undefined;
         var nextNode:String = null;
         var BRACKET:String = null;
         var nodeNameLen:int = 0;
         begin = param1;
         var list:Array = param2;
         var check:* = function(param1:String):Boolean
         {
            return begin.hasOwnProperty(param1);
         };
         if(begin == null)
         {
            return null;
         }
         if(list == null || list.length == 0)
         {
            return begin;
         }
         len = int(list.length);
         i = 0;
         while(i < len)
         {
            nextNode = list[i] as String;
            if(nextNode == null)
            {
               return null;
            }
            try
            {
               BRACKET = "()";
               if(nextNode.indexOf(BRACKET) == -1)
               {
                  if(!check(nextNode))
                  {
                     return null;
                  }
                  if(begin[nextNode] != null)
                  {
                     begin = begin[nextNode];
                  }
               }
               else
               {
                  nodeNameLen = nextNode.length - BRACKET.length;
                  nextNode = nextNode.substr(0,nodeNameLen);
                  if(!check(nextNode))
                  {
                     return null;
                  }
                  if(begin[nextNode]() != null)
                  {
                     begin = begin[nextNode]();
                  }
               }
            }
            catch(e:Error)
            {
               trace("ClassUtil.continuousAccess::" + e);
               return null;
            }
            i++;
         }
         return begin;
      }
      
      public static function doInRange(param1:Object, param2:String, param3:Function, param4:Array = null) : void
      {
         if(!param4)
         {
            param4 = [1,5,1];
         }
         if(param4.length < 3)
         {
            param4.push(1);
         }
         var _loc5_:int = int(param4[0]);
         while(_loc5_ <= param4[1])
         {
            param3(param1[param2 + _loc5_]);
            _loc5_ += param4[2];
         }
      }
      
      public static function describeClass(param1:Object) : Object
      {
         var _loc2_:XML = null;
         var _loc3_:XML = null;
         var _loc4_:Object = {};
         var _loc5_:XML = describeType(param1);
         for each(_loc2_ in _loc5_.variable)
         {
            _loc4_[_loc2_.@name.toString()] = _loc2_.@type.toString();
         }
         for each(_loc3_ in _loc5_.accessor)
         {
            if(_loc3_.@access == "readwrite")
            {
               _loc4_[_loc3_.@name.toString()] = _loc3_.@type.toString();
            }
         }
         return _loc4_;
      }
   }
}

