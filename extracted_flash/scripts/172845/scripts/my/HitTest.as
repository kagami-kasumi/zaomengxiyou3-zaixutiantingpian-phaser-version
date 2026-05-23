package my
{
   import flash.display.*;
   import flash.geom.*;
   
   public class HitTest
   {
      
      public function HitTest()
      {
         super();
      }
      
      public static function complexHitTestObject(param1:DisplayObject, param2:DisplayObject, param3:Number = 1) : Boolean
      {
         if(param3 > 1)
         {
            param3 = 1;
         }
         return param3 <= 0 ? false : complexIntersectionRectangle(param1,param2,param3).width != 0;
      }
      
      public static function intersectionRectangle(param1:DisplayObject, param2:DisplayObject) : Rectangle
      {
         var _loc3_:Rectangle = null;
         if(!param1.root || !param2.root || !param1.hitTestObject(param2))
         {
            return new Rectangle();
         }
         var _loc4_:Rectangle = param1.getBounds(param1.root);
         var _loc5_:Rectangle = param2.getBounds(param2.root);
         _loc3_ = new Rectangle();
         _loc3_.x = Math.max(_loc4_.x,_loc5_.x);
         _loc3_.y = Math.max(_loc4_.y,_loc5_.y);
         _loc3_.width = Math.min(_loc4_.x + _loc4_.width - _loc3_.x,_loc5_.x + _loc5_.width - _loc3_.x);
         _loc3_.height = Math.min(_loc4_.y + _loc4_.height - _loc3_.y,_loc5_.y + _loc5_.height - _loc3_.y);
         return _loc3_;
      }
      
      public static function complexIntersectionRectangle(param1:DisplayObject, param2:DisplayObject, param3:Number = 1) : Rectangle
      {
         var _loc4_:Rectangle = null;
         var _loc5_:BitmapData = null;
         if(param3 <= 0)
         {
            throw new Error("ArgumentError: Error #5001: Invalid value for accurracy",5001);
         }
         if(!param1.hitTestObject(param2))
         {
            return new Rectangle();
         }
         _loc4_ = intersectionRectangle(param1,param2);
         if(_loc4_.width * param3 < 1 || _loc4_.height * param3 < 1)
         {
            return new Rectangle();
         }
         _loc5_ = new BitmapData(_loc4_.width * param3,_loc4_.height * param3,false,0);
         _loc5_.draw(param1,HitTest.getDrawMatrix(param1,_loc4_,param3),new ColorTransform(1,1,1,1,255,-255,-255,255));
         _loc5_.draw(param2,HitTest.getDrawMatrix(param2,_loc4_,param3),new ColorTransform(1,1,1,1,255,255,255,255),BlendMode.DIFFERENCE);
         var _loc6_:Rectangle = _loc5_.getColorBoundsRect(4294967295,4278255615);
         _loc5_.dispose();
         if(param3 != 1)
         {
            _loc6_.x /= param3;
            _loc6_.y /= param3;
            _loc6_.width /= param3;
            _loc6_.height /= param3;
         }
         _loc6_.x += _loc4_.x;
         _loc6_.y += _loc4_.y;
         return _loc6_;
      }
      
      protected static function getDrawMatrix(param1:DisplayObject, param2:Rectangle, param3:Number) : Matrix
      {
         var _loc4_:Point = null;
         var _loc5_:Matrix = null;
         var _loc6_:Matrix = param1.root.transform.concatenatedMatrix;
         _loc4_ = param1.localToGlobal(new Point());
         _loc5_ = param1.transform.concatenatedMatrix;
         _loc5_.tx = _loc4_.x - param2.x;
         _loc5_.ty = _loc4_.y - param2.y;
         _loc5_.a /= _loc6_.a;
         _loc5_.d /= _loc6_.d;
         if(param3 != 1)
         {
            _loc5_.scale(param3,param3);
         }
         return _loc5_;
      }
   }
}

