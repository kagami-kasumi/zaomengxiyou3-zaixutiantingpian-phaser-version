package base
{
   import com.dusk.util.*;
   import flash.geom.*;
   import flash.utils.*;
   
   public class BaseVVOO
   {
      
      public static var ClassDescribes:Dictionary = new Dictionary();
      
      protected var classDescription:Object;
      
      private var _className:String;
      
      public function BaseVVOO()
      {
         super();
         this._className = getQualifiedClassName(this);
         if(ClassDescribes[this._className])
         {
            this.classDescription = ClassDescribes[this._className];
         }
         else
         {
            this.classDescription = ClassUtil.describeClass(this);
            ClassDescribes[this._className] = this.classDescription;
         }
      }
      
      public function updateFromObject(param1:Object) : void
      {
         var _loc2_:String = null;
         if(!param1)
         {
            return;
         }
         for(_loc2_ in param1)
         {
            if(this.classDescription.hasOwnProperty(_loc2_))
            {
               this.buildField(_loc2_,param1[_loc2_]);
            }
         }
      }
      
      public function buildFromObject(param1:Object) : void
      {
         var _loc2_:String = null;
         if(!param1)
         {
            return;
         }
         for(_loc2_ in param1)
         {
            if(this.classDescription.hasOwnProperty(_loc2_))
            {
               this.buildField(_loc2_,param1[_loc2_]);
            }
         }
      }
      
      public function buildFromXMLAttr(param1:XML) : void
      {
         var _loc2_:String = null;
         for(_loc2_ in this.classDescription)
         {
            try
            {
               this[_loc2_] = param1[_loc2_];
            }
            catch(err:Error)
            {
            }
         }
      }
      
      public function buildFromXML(param1:XML) : void
      {
         var _loc3_:String = null;
         var _loc2_:String = null;
         for(_loc3_ in this.classDescription)
         {
            _loc2_ = param1[_loc3_].text();
            this.buildField(_loc3_,_loc2_);
         }
      }
      
      protected function buildField(param1:String, param2:*) : void
      {
         var value:* = undefined;
         var byteArray:ByteArray = null;
         var vector3DValue:Vector3D = null;
         var fieldName:String = param1;
         var fieldValue:* = param2;
         var valueArray:Array = null;
         var vectorTypeRegExp:RegExp = null;
         var vectorTypeMatch:Array = null;
         var isPrimitiveVector:Boolean = false;
         var index:int = 0;
         var pointValue:Point = null;
         if(fieldValue == null)
         {
            return;
         }
         if(typeof fieldValue == "string")
         {
            valueArray = fieldValue.split(";");
            if(StringUtil.isWhitespace(fieldValue))
            {
               valueArray = null;
            }
         }
         else if(fieldValue is Array)
         {
            valueArray = fieldValue;
         }
         else
         {
            valueArray = fieldValue.toString().split(",");
         }
         switch(this.classDescription[fieldName])
         {
            case "Array":
               this[fieldName] = fieldValue == "" ? null : valueArray;
               break;
            case "int":
               this[fieldName] = int(fieldValue);
               break;
            case "Boolean":
               this[fieldName] = fieldValue == "true" || int(fieldValue) > 0;
               break;
            case "flash.utils::Dictionary":
               break;
            default:
               if(String(this.classDescription[fieldName]).indexOf("__AS3__.vec::Vector.<") != -1)
               {
                  vectorTypeRegExp = /<(.*)>/;
                  vectorTypeMatch = vectorTypeRegExp.exec(String(this.classDescription[fieldName]));
                  isPrimitiveVector = false;
                  switch(vectorTypeMatch[1])
                  {
                     case "int":
                        this[fieldName] = new Vector.<int>();
                        isPrimitiveVector = true;
                        break;
                     case "uint":
                        this[fieldName] = new Vector.<uint>();
                        isPrimitiveVector = true;
                        break;
                     case "String":
                        this[fieldName] = new Vector.<String>();
                        isPrimitiveVector = true;
                        break;
                     case "Number":
                        this[fieldName] = new Vector.<Number>();
                        isPrimitiveVector = true;
                        break;
                     case "flash.geom::Point":
                        this[fieldName] = new Vector.<Point>();
                        index = 0;
                        while(index < valueArray.length)
                        {
                           pointValue = new Point(valueArray[index],valueArray[index + 1]);
                           this[fieldName].push(pointValue);
                           index += 2;
                        }
                  }
                  if(isPrimitiveVector)
                  {
                     for each(value in valueArray)
                     {
                        this[fieldName].push(value);
                     }
                  }
               }
               else
               {
                  switch(this.classDescription[fieldName])
                  {
                     case "flash.geom::Point":
                        if(valueArray)
                        {
                           this[fieldName] = new Point(valueArray[0],valueArray[1]);
                        }
                        break;
                     case "flash.geom::Rectangle":
                        if(valueArray)
                        {
                           this[fieldName] = new Rectangle(Number(valueArray[0]),Number(valueArray[1]),Number(valueArray[2]),Number(valueArray[3]));
                        }
                        break;
                     case "flash.geom::Vector3D":
                        if(valueArray.length > 0 && fieldValue != "")
                        {
                           vector3DValue = new Vector3D();
                           vector3DValue.x = valueArray[0];
                           vector3DValue.y = valueArray[1];
                           vector3DValue.z = valueArray[2];
                           this[fieldName] = vector3DValue;
                        }
                        break;
                     case "Object":
                        byteArray = new ByteArray();
                        byteArray.writeObject(fieldValue);
                        byteArray.position = 0;
                        this[fieldName] = byteArray.readObject();
                        byteArray.clear();
                        break;
                     default:
                        try
                        {
                           this[fieldName] = fieldValue;
                        }
                        catch(err:Error)
                        {
                           this[fieldName] = null;
                        }
                  }
               }
         }
      }
      
      public function buildFromCSV(param1:Array, param2:Array) : void
      {
         var _loc3_:int = 0;
         while(_loc3_ < param1.length)
         {
            this.buildField(param1[_loc3_],param2[_loc3_]);
            _loc3_++;
         }
      }
      
      public function cloneToObject() : Object
      {
         var _loc2_:String = null;
         var _loc1_:Object = {};
         for(_loc2_ in this.classDescription)
         {
            _loc1_[_loc2_] = this[_loc2_];
         }
         return _loc1_;
      }
      
      public function toString() : String
      {
         var _loc2_:String = null;
         var _loc1_:String = "{";
         for(_loc2_ in this.classDescription)
         {
            _loc1_ += "|" + _loc2_ + ":" + this[_loc2_];
         }
         return _loc1_ + "}";
      }
   }
}

