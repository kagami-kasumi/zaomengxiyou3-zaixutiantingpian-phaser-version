package
{
   import base.*;
   import com.greensock.*;
   import flash.display.*;
   import flash.filters.*;
   import flash.geom.*;
   import flash.utils.*;
   
   public class AUtils
   {
      
      private static var evemonth:Array = [31,29,31,30,31,30,31,31,30,31,30,31];
      
      public function AUtils()
      {
         super();
      }
      
      public static function getClass(param1:*) : *
      {
         return getDefinitionByName(param1) as Class;
      }
      
      public static function getNewObj(param1:*) : *
      {
         var _loc2_:Class = getDefinitionByName(param1) as Class;
         return new _loc2_();
      }
      
      public static function getImageObj(param1:*) : *
      {
         var _loc2_:Class = getDefinitionByName(param1) as Class;
         var _loc3_:* = new _loc2_();
         return new Bitmap(_loc3_);
      }
      
      public static function getImageSprite(param1:*) : *
      {
         var _loc2_:Sprite = null;
         var _loc3_:Class = getDefinitionByName(param1) as Class;
         var _loc4_:* = new _loc3_();
         var _loc5_:Bitmap = new Bitmap(_loc4_);
         _loc2_ = new Sprite();
         _loc2_.addChild(_loc5_);
         return _loc2_;
      }
      
      public static function stringToByteArray(param1:String) : ByteArray
      {
         var _loc2_:ByteArray = new ByteArray();
         _loc2_.endian = "littleEndian";
         _loc2_.writeUTFBytes(param1);
         _loc2_.position = 0;
         return _loc2_;
      }
      
      public static function changeNumber(param1:Number, param2:uint) : *
      {
         var _loc3_:* = param1 + "";
         return Number(_loc3_.substr(0,param2 + 2));
      }
      
      public static function numberAdd(param1:Number, param2:Number, param3:uint) : *
      {
         var _loc4_:* = Math.floor(param1 * 100 + param2 * 100) / 100 + "";
         return Number(_loc4_.substr(0,param3 + 2));
      }
      
      public static function enCurHas(param1:*) : int
      {
         return param1 * 100 + 201;
      }
      
      public static function deCurHas(param1:int) : int
      {
         return param1 - 201;
      }
      
      public static function enCodeString(param1:String) : Array
      {
         var _loc2_:int = 0;
         var _loc3_:uint = uint(param1.length);
         var _loc4_:* = [];
         _loc2_ = 0;
         while(_loc2_ < _loc3_)
         {
            _loc4_.push(param1.charAt(_loc2_));
            _loc2_++;
         }
         return _loc4_;
      }
      
      public static function getDeCodeString(param1:Array) : String
      {
         var _loc2_:int = 0;
         var _loc3_:uint = param1.length;
         var _loc4_:String = "";
         _loc2_ = 0;
         while(_loc2_ < _loc3_)
         {
            _loc4_ += param1[_loc2_];
            _loc2_++;
         }
         return _loc4_;
      }
      
      public static function getDayBetweenDate(param1:String, param2:String) : int
      {
         var _loc3_:int = 0;
         var _loc4_:Date = null;
         var _loc5_:* = null;
         var _loc6_:* = null;
         var _loc7_:Array = param1.split("-");
         var _loc8_:uint = uint(int(_loc7_[0]));
         var _loc9_:uint = uint(int(_loc7_[1]));
         var _loc10_:uint = uint(int(_loc7_[2]));
         var _loc11_:Array = param2.split("-");
         var _loc12_:uint = uint(int(_loc11_[0]));
         var _loc13_:uint = uint(int(_loc11_[1]));
         var _loc14_:uint = uint(int(_loc11_[2]));
         var _loc15_:Date = new Date(_loc8_,_loc9_,_loc10_);
         _loc4_ = new Date(_loc12_,_loc13_,_loc14_);
         _loc3_ = (_loc4_.getTime() - _loc15_.getTime()) / 1000;
         if(_loc3_ < 0)
         {
            _loc5_ = new Date(_loc8_,_loc9_ - 1,_loc10_);
            _loc3_ = (Number((_loc6_ = new Date(_loc12_,_loc13_ - 1,_loc14_)).getTime()) - Number(_loc5_.getTime())) / 1000;
            return _loc3_ / 3600 / 24;
         }
         return _loc3_ / 3600 / 24;
      }
      
      public static function getDayBetweenTwoDate(param1:String, param2:String) : int
      {
         var _loc3_:int = 0;
         var _loc4_:Date = null;
         var _loc5_:Array = param1.split("-");
         var _loc6_:uint = uint(int(_loc5_[0]));
         var _loc7_:uint = uint(int(_loc5_[1]) - 1);
         var _loc8_:uint = uint(int(_loc5_[2]));
         var _loc9_:Array = param2.split("-");
         var _loc10_:uint = uint(int(_loc9_[0]));
         var _loc11_:uint = uint(int(_loc9_[1]) - 1);
         var _loc12_:uint = uint(int(_loc9_[2]));
         var _loc13_:Date = new Date(_loc6_,_loc7_,_loc8_);
         _loc4_ = new Date(_loc10_,_loc11_,_loc12_);
         _loc3_ = (_loc4_.getTime() - _loc13_.getTime()) / 1000;
         return _loc3_ / 3600 / 24;
      }
      
      public static function numberSub(param1:Number, param2:Number, param3:uint) : *
      {
         var _loc4_:String = null;
         var _loc5_:* = undefined;
         _loc5_ = Math.floor(param1 * 100 - param2 * 100) / 100 + "";
         _loc4_ = _loc5_.charAt(0);
         if(_loc4_ == "-")
         {
            return Number(_loc5_.substr(0,param3 + 4));
         }
         return Number(_loc5_.substr(0,param3 + 3));
      }
      
      public static function stopAllChildren(param1:DisplayObjectContainer) : void
      {
         var _loc2_:int = 0;
         var _loc3_:* = null;
         _loc2_ = 0;
         while(_loc2_ < param1.numChildren)
         {
            if(Boolean(param1.getChildAt(_loc2_)) && param1.getChildAt(_loc2_) is MovieClip)
            {
               _loc3_ = param1.getChildAt(_loc2_) as MovieClip;
               if(_loc3_)
               {
                  _loc3_.stop();
                  stopAllChildren(_loc3_);
               }
            }
            _loc2_++;
         }
      }
      
      public static function testIntersects(param1:*, param2:*, param3:DisplayObjectContainer) : Boolean
      {
         return param1.getBounds(param3).intersects(param2.getBounds(param3));
      }
      
      public static function startAllChildren(param1:DisplayObjectContainer) : void
      {
         var _loc2_:int = 0;
         var _loc3_:* = null;
         _loc2_ = 0;
         while(_loc2_ < param1.numChildren)
         {
            if(param1.getChildAt(_loc2_) is MovieClip)
            {
               _loc3_ = param1.getChildAt(_loc2_) as MovieClip;
               _loc3_.play();
               startAllChildren(_loc3_);
            }
            _loc2_++;
         }
      }
      
      public static function nextAllChildren(param1:DisplayObjectContainer) : void
      {
         var _loc2_:int = 0;
         var _loc3_:* = null;
         _loc2_ = 0;
         while(_loc2_ < param1.numChildren)
         {
            if(param1.getChildAt(_loc2_) is MovieClip)
            {
               _loc3_ = param1.getChildAt(_loc2_) as MovieClip;
               if(_loc3_.currentFrame == _loc3_.totalFrames)
               {
                  _loc3_.gotoAndStop(1);
               }
               else
               {
                  _loc3_.nextFrame();
               }
               nextAllChildren(_loc3_);
            }
            _loc2_++;
         }
      }
      
      public static function center(param1:DisplayObject, param2:Stage) : *
      {
         param1.x = (param2.stageWidth - param1.width) / 2;
         param1.y = (param2.stageHeight - param1.height) / 2;
      }
      
      public static function clone(param1:Object) : Object
      {
         var _loc2_:ByteArray = new ByteArray();
         _loc2_.writeObject(param1);
         _loc2_.position = 0;
         return _loc2_.readObject();
      }
      
      public static function shallowEffect(param1:DisplayObject) : void
      {
         var bm:Bitmap = null;
         var idx:int = 0;
         var displayObj:DisplayObject = param1;
         var b:BitmapData = new BitmapData(displayObj.width,displayObj.height,true,16777215);
         b.draw(displayObj,new Matrix(displayObj.transform.matrix.a,0,0,1,displayObj.width / 2,displayObj.height / 2));
         bm = new Bitmap(b);
         bm.x = displayObj.x - displayObj.width / 2;
         bm.y = displayObj.y - displayObj.height / 2;
         if(displayObj is BaseObject)
         {
            if(BaseObject(displayObj).isStatic())
            {
               bm.x += (Math.random() - 0.5) * 5;
            }
         }
         if(displayObj.parent)
         {
            idx = displayObj.parent.getChildIndex(displayObj);
            displayObj.parent.addChildAt(bm,idx);
            TweenMax.to(bm,1,{
               "alpha":0,
               "onCompleteParams":[bm],
               "onComplete":function(param1:Bitmap):*
               {
                  if(Boolean(param1) && Boolean(param1.parent) && param1.parent.contains(param1))
                  {
                     param1.bitmapData.dispose();
                     param1.bitmapData = null;
                     param1.parent.removeChild(param1);
                  }
               }
            });
         }
         else
         {
            bm.bitmapData.dispose();
            bm.bitmapData = null;
         }
      }
      
      public static function flipHorizontal(param1:DisplayObject, param2:int) : void
      {
         var _loc3_:Matrix = param1.transform.matrix;
         var _loc4_:* = _loc3_.a;
         _loc3_.a = param2 == 1 ? Math.abs(_loc4_) : -Math.abs(_loc4_);
         param1.transform.matrix = _loc3_;
      }
      
      public static function GlowEffect() : GlowFilter
      {
         return new GlowFilter(16777215,1,15,15,1.5,2,false,false);
      }
      
      public static function GetNextPointByTwoObj(param1:*, param2:*) : Point
      {
         if(!param1 || !param2)
         {
            return new Point(0,0);
         }
         var _loc3_:Number = Number(param2.x) - Number(param1.x);
         var _loc4_:Number = Number(param2.y) - Number(param1.y);
         if(_loc3_ == 0 && _loc4_ == 0)
         {
            return new Point(0,0);
         }
         var _loc5_:Number = Math.sqrt(_loc3_ * _loc3_ + _loc4_ * _loc4_);
         return new Point(_loc3_ / _loc5_,_loc4_ / _loc5_);
      }
      
      public static function GetDisBetweenTwoObj(param1:*, param2:*) : Number
      {
         if(!param1 || !param2)
         {
            return 0;
         }
         var _loc3_:Number = Number(param2.x) - Number(param1.x);
         var _loc4_:Number = Number(param2.y) - Number(param1.y);
         return Math.sqrt(_loc3_ * _loc3_ + _loc4_ * _loc4_);
      }
      
      public static function GetNearestObj(param1:String, param2:BaseObject, param3:Array) : BaseObject
      {
         var _loc4_:DisplayObject = null;
         var _loc5_:Array = new Array();
         switch(param1)
         {
            case "x":
            case "X":
               for each(_loc4_ in param3)
               {
                  _loc5_.push(Math.abs(_loc4_.x - param2.x));
               }
               return param3[_loc5_.sort(Array.RETURNINDEXEDARRAY).indexOf(0)];
            case "y":
            case "Y":
               for each(_loc4_ in param3)
               {
                  _loc5_.push(Math.abs(_loc4_.x - param2.x));
               }
               return param3[_loc5_.sort(Array.RETURNINDEXEDARRAY).indexOf(0)];
            default:
               for each(_loc4_ in param3)
               {
                  _loc5_.push(AUtils.GetDisBetweenTwoObj(_loc4_,param2));
               }
               return param3[_loc5_.sort(Array.RETURNINDEXEDARRAY).indexOf(0)];
         }
      }
      
      public static function GetDisBetweenTwoPoint(param1:Point, param2:Point) : Number
      {
         if(!param1 || !param2)
         {
            return 0;
         }
         var _loc3_:Number = param2.x - param1.x;
         var _loc4_:Number = param2.y - param1.y;
         return Math.sqrt(_loc3_ * _loc3_ + _loc4_ * _loc4_);
      }
      
      public static function checkLoadOK(param1:*, param2:Function) : void
      {
         var si:int = 0;
         var dis:* = undefined;
         var fun:Function = null;
         si = 0;
         dis = undefined;
         fun = null;
         si = 0;
         dis = undefined;
         fun = null;
         si = 0;
         dis = param1;
         fun = param2;
         si = int(setInterval(function():*
         {
            var _loc1_:* = dis.numChildren;
            var _loc2_:* = true;
            var _loc3_:* = 0;
            while(_loc3_ < _loc1_)
            {
               if(!dis.getChildAt(_loc3_))
               {
                  _loc2_ = false;
                  break;
               }
               _loc3_++;
            }
            if(_loc2_)
            {
               clearInterval(si);
               fun.call();
            }
         },100));
      }
      
      public static function judgeRandom(param1:int) : Boolean
      {
         if(Math.round(Math.random() * 100) <= param1)
         {
            return true;
         }
         return false;
      }
      
      public static function getRandomValue() : int
      {
         return Math.ceil((0.5 - Math.random()) * (30 + Math.random() * 5000000));
      }
      
      public static function encryptValue(param1:*) : *
      {
         return undefined;
      }
   }
}

