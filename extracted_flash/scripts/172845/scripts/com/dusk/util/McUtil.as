package com.dusk.util
{
   import avmplus.*;
   import com.game.view.IAnimation;
   import com.game.view.display.*;
   import flash.display.*;
   import flash.geom.*;
   import flash.utils.*;
   
   public class McUtil extends UtilBase
   {
      
      public function McUtil()
      {
         super();
      }
      
      public static function flipHorizontal(param1:DisplayObject, param2:int) : void
      {
         var _loc3_:Matrix = param1.transform.matrix;
         var _loc4_:int = _loc3_.a;
         _loc3_.a = param2 == 1 ? Math.abs(_loc4_) : -Math.abs(_loc4_);
         param1.transform.matrix = _loc3_;
      }
      
      public static function stopAllChildren(param1:MovieClip) : void
      {
         var _loc2_:DisplayObject = null;
         var _loc3_:int = 0;
         while(_loc3_ < param1.numChildren)
         {
            _loc2_ = param1.getChildAt(_loc3_);
            if(Boolean(_loc2_) && _loc2_ is MovieClip)
            {
               (_loc2_ as MovieClip).stop();
               stopAllChildren(_loc2_ as MovieClip);
            }
            _loc3_++;
         }
      }
      
      public static function startAllChildren(param1:MovieClip) : void
      {
         var _loc2_:DisplayObject = null;
         var _loc3_:int = 0;
         while(_loc3_ < param1.numChildren)
         {
            _loc2_ = param1.getChildAt(_loc3_);
            if(Boolean(_loc2_) && _loc2_ is MovieClip)
            {
               (_loc2_ as MovieClip).play();
               startAllChildren(_loc2_ as MovieClip);
            }
            _loc3_++;
         }
      }
      
      public static function renderAllChildren(param1:MovieClip) : void
      {
         var _loc2_:DisplayObject = null;
         var _loc3_:int = 0;
         while(_loc3_ < param1.numChildren)
         {
            _loc2_ = param1.getChildAt(_loc3_);
            if(Boolean(_loc2_) && _loc2_ is MovieClip)
            {
               if((_loc2_ as MovieClip).currentFrame >= (_loc2_ as MovieClip).totalFrames)
               {
                  (_loc2_ as MovieClip).gotoAndStop(1);
                  return;
               }
               (_loc2_ as MovieClip).gotoAndStop((_loc2_ as MovieClip).currentFrame + 1);
               renderAllChildren(_loc2_ as MovieClip);
            }
            _loc3_++;
         }
      }
      
      public static function redrawTxt(param1:DisplayObjectContainer) : void
      {
         TextUtil.redrawTxt(param1);
      }
      
      public static function letRegisterPointToCenter(param1:Sprite) : void
      {
         var widthOff:Number = NaN;
         var heightOff:Number = NaN;
         var idx:int = 0;
         var sprite:Sprite = param1;
         if(!sprite)
         {
            throw new Error("displayObject must be none null");
         }
         widthOff = sprite.width / 2;
         heightOff = sprite.height / 2;
         idx = 0;
         while(idx < sprite.numChildren)
         {
            with(sprite.getChildAt(idx) as DisplayObject)
            {
               
               x -= widthOff;
               y -= heightOff;
            }
            idx++;
         }
      }
      
      public static function testIntersects(param1:DisplayObject, param2:DisplayObject, param3:DisplayObjectContainer) : Boolean
      {
         return param1.getBounds(param3).intersects(param2.getBounds(param3));
      }
      
      public static function checkLoadOK(param1:DisplayObjectContainer, param2:Function) : void
      {
         var si:int = 0;
         var container:DisplayObjectContainer = null;
         var func:Function = null;
         si = 0;
         container = param1;
         func = param2;
         si = int(setInterval(function():*
         {
            var _loc1_:* = true;
            var _loc2_:* = 0;
            while(_loc2_ < container.numChildren)
            {
               if(!container.getChildAt(_loc2_))
               {
                  _loc1_ = false;
                  break;
               }
               _loc2_++;
            }
            if(_loc1_)
            {
               clearInterval(si);
               if(Boolean(func))
               {
                  func.call();
               }
            }
         },100));
      }
      
      public static function getTwoObjectAngle(param1:*, param2:*) : Point
      {
         if(!param1 || !param2)
         {
            return new Point(0,0);
         }
         return MathUtil.getAngleByTwoPoint(new Point(param1.x,param1.y),new Point(param2.x,param2.y));
      }
      
      public static function getClassInParents(param1:DisplayObject, param2:Class) : *
      {
         while(Boolean(param1.parent))
         {
            param1 = param1.parent;
            if(param1 is param2)
            {
               return param1;
            }
         }
         return null;
      }
      
      public static function hasClassInParents(param1:DisplayObject, param2:Class) : Boolean
      {
         while(Boolean(param1.parent))
         {
            param1 = param1.parent;
            if(param1 is param2)
            {
               return true;
            }
         }
         return false;
      }
      
      public static function removeAllChildren(param1:DisplayObjectContainer) : void
      {
         var _loc2_:DisplayObject = null;
         while(param1.numChildren > 0)
         {
            _loc2_ = param1.getChildAt(0);
            if(_loc2_ is Bitmap)
            {
               (_loc2_ as Bitmap).bitmapData.dispose();
               (_loc2_ as Bitmap).bitmapData = null;
            }
            param1.removeChild(_loc2_);
         }
      }
      
      public static function analyseMovieClipToAnimateClip(param1:MovieClip, param2:Object = null, param3:int = 0, param4:Boolean = false) : AnimationClip
      {
         var _loc5_:TextureGroup = null;
         var _loc6_:int = 0;
         var _loc7_:int = 0;
         var _loc8_:Rectangle = null;
         var _loc9_:Texture = null;
         var _loc10_:Rectangle = null;
         var _loc11_:Sprite = new Sprite();
         _loc11_.addChild(param1);
         switch(param3)
         {
            case 0:
               _loc5_ = new TextureGroup();
               _loc6_ = param1.totalFrames;
               _loc7_ = 1;
               while(_loc7_ <= _loc6_)
               {
                  param1.gotoAndStop(_loc7_);
                  _loc8_ = param1.getBounds(_loc11_);
                  if(_loc8_.isEmpty())
                  {
                     _loc8_ = new Rectangle(0,0,1,1);
                  }
                  _loc9_ = new Texture();
                  _loc9_.content = new BitmapData(_loc8_.width,_loc8_.height,true,16777215);
                  _loc9_.content.draw(_loc11_,new Matrix(1,0,0,1,-_loc8_.x,-_loc8_.y),null,null,null,param4);
                  _loc10_ = BitmapUtil.getOpaqueRegion(_loc9_.content);
                  _loc8_.offset(_loc10_.x,_loc10_.y);
                  _loc9_.content = BitmapUtil.cropTransparentRegion(_loc9_.content);
                  _loc9_.region = _loc8_;
                  _loc5_.addTexture(_loc9_);
                  _loc7_++;
               }
               _loc5_.clearSameKeyFrame();
               return new BitmapMovieClip(_loc5_);
            case 1:
               return new McMovieClip(param1);
            default:
               throw new Error("animateType参数错误");
         }
      }
      
      public static function analyseMovieClipToAnimateDict(param1:MovieClip, param2:Object = null, param3:int = 0, param4:Boolean = false) : Dictionary
      {
         var _loc5_:IAnimation = null;
         var _loc6_:MovieClip = null;
         var _loc7_:uint = 0;
         var _loc8_:TextureGroup = null;
         var _loc9_:uint = 0;
         var _loc10_:int = 0;
         var _loc11_:Sprite = null;
         var _loc12_:Rectangle = null;
         var _loc13_:MovieClip = null;
         var _loc14_:String = null;
         var _loc15_:String = null;
         var _loc16_:Texture = null;
         var _loc17_:Rectangle = null;
         var _loc18_:Array = UtilBase.getAllKeys(param2);
         var _loc19_:uint = uint(param1.totalFrames);
         var _loc20_:Dictionary = new Dictionary();
         var _loc21_:uint = 1;
         while(_loc21_ <= _loc19_)
         {
            param1.gotoAndStop(_loc21_);
            if(param1.numChildren == 0)
            {
               throw new Error("mcContainer is Empty");
            }
            _loc6_ = param1.getChildAt(0) as MovieClip;
            if(!_loc6_)
            {
               throw new Error("mc.getChildAt(0) is not MovieClip");
            }
            _loc7_ = uint(_loc6_.totalFrames);
            _loc8_ = new TextureGroup();
            _loc9_ = 1;
            while(_loc9_ <= _loc7_)
            {
               _loc6_.gotoAndStop(_loc9_);
               _loc10_ = 0;
               while(_loc10_ < _loc6_.numChildren)
               {
                  _loc13_ = _loc6_.getChildAt(_loc10_) as MovieClip;
                  if(_loc13_)
                  {
                     _loc14_ = getQualifiedClassName(_loc13_);
                     for each(_loc15_ in _loc18_)
                     {
                        if(_loc14_.indexOf(_loc15_) != -1)
                        {
                           _loc13_.gotoAndStop(param2[_loc15_]);
                           break;
                        }
                     }
                  }
                  _loc10_++;
               }
               _loc11_ = new Sprite();
               _loc11_.addChild(_loc6_);
               _loc12_ = _loc6_.getBounds(_loc11_);
               if(_loc12_.isEmpty())
               {
                  _loc12_ = new Rectangle(0,0,1,1);
               }
               switch(param3)
               {
                  case 0:
                     _loc16_ = new Texture();
                     _loc16_.content = new BitmapData(_loc12_.width,_loc12_.height,true,16777215);
                     _loc16_.content.draw(_loc11_,new Matrix(1,0,0,1,-_loc12_.x,-_loc12_.y),null,null,null,param4);
                     _loc17_ = BitmapUtil.getOpaqueRegion(_loc16_.content);
                     _loc12_.offset(_loc17_.x,_loc17_.y);
                     _loc16_.content = BitmapUtil.cropTransparentRegion(_loc16_.content);
                     _loc16_.region = _loc12_;
                     _loc8_.addTexture(_loc16_);
                     break;
                  case 1:
                     break;
                  default:
                     throw new Error("animateType参数错误");
               }
               _loc9_++;
            }
            if(param1.currentFrameLabel == null)
            {
               throw new Error("当前帧没有帧标签");
            }
            switch(param3)
            {
               case 0:
                  _loc8_.clearSameKeyFrame();
                  _loc5_ = new BitmapMovieClip(_loc8_);
                  _loc20_[param1.currentFrameLabel] = _loc5_;
                  break;
               case 1:
                  _loc6_.parent.removeChild(_loc6_);
                  _loc5_ = new McMovieClip(_loc6_);
                  _loc20_[param1.currentFrameLabel] = _loc5_;
                  break;
               default:
                  throw new Error("animateType参数错误");
            }
            _loc21_++;
         }
         return _loc20_;
      }
      
      public static function analyseMovieClipByAction(param1:MovieClip, param2:Object = null, param3:String = "", param4:int = 0, param5:Boolean = false) : IAnimation
      {
         var actMc:MovieClip = null;
         var totalFrame2:uint = 0;
         var group:TextureGroup = null;
         var j:uint = 0;
         var singleAnimation:IAnimation = null;
         var k:int = 0;
         var prvSpace:Sprite = null;
         var rect:Rectangle = null;
         var child:MovieClip = null;
         var childClassName:String = null;
         var target:String = null;
         var tex:Texture = null;
         var opaque:Rectangle = null;
         var mc:MovieClip = param1;
         var info:Object = param2;
         var action:String = param3;
         var animateType:int = param4;
         var smoothing:Boolean = param5;
         var targetClass:Array = UtilBase.getAllKeys(info);
         try
         {
            mc.gotoAndStop(action);
         }
         catch(e:Error)
         {
            return null;
         }
         if(mc.numChildren == 0)
         {
            throw new Error("mcContainer is Empty");
         }
         actMc = mc.getChildAt(0) as MovieClip;
         if(!actMc)
         {
            throw new Error("mc.getChildAt(0) is not MovieClip");
         }
         totalFrame2 = uint(actMc.totalFrames);
         group = new TextureGroup();
         j = 1;
         while(j <= totalFrame2)
         {
            actMc.gotoAndStop(j);
            k = 0;
            while(k < actMc.numChildren)
            {
               child = actMc.getChildAt(k) as MovieClip;
               if(child)
               {
                  childClassName = getQualifiedClassName(child);
                  for each(target in targetClass)
                  {
                     if(childClassName.indexOf(target) != -1)
                     {
                        child.gotoAndStop(info[target]);
                        break;
                     }
                  }
               }
               k++;
            }
            prvSpace = new Sprite();
            prvSpace.addChild(actMc);
            rect = actMc.getBounds(prvSpace);
            if(rect.isEmpty())
            {
               rect = new Rectangle(0,0,1,1);
            }
            switch(animateType)
            {
               case 0:
                  tex = new Texture();
                  tex.content = new BitmapData(rect.width,rect.height,true,16777215);
                  tex.content.draw(prvSpace,new Matrix(1,0,0,1,-rect.x,-rect.y),null,null,null,smoothing);
                  opaque = BitmapUtil.getOpaqueRegion(tex.content);
                  rect.offset(opaque.x,opaque.y);
                  tex.content = BitmapUtil.cropTransparentRegion(tex.content);
                  tex.region = rect;
                  group.addTexture(tex);
                  break;
               case 1:
                  break;
               default:
                  throw new Error("animateType参数错误");
            }
            j++;
         }
         if(mc.currentFrameLabel == null)
         {
            throw new Error("当前帧没有帧标签");
         }
         switch(animateType)
         {
            case 0:
               group.clearSameKeyFrame();
               singleAnimation = new BitmapMovieClip(group);
               return singleAnimation;
            case 1:
               actMc.parent.removeChild(actMc);
               singleAnimation = new McMovieClip(actMc);
               return singleAnimation;
            default:
               throw new Error("animateType参数错误");
         }
      }
   }
}

