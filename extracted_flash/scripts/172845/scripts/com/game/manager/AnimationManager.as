package com.game.manager
{
   import base.*;
   import com.dusk.util.*;
   import com.game.view.IAnimation;
   import com.game.view.display.*;
   import flash.display.MovieClip;
   import flash.geom.*;
   import flash.utils.*;
   
   public class AnimationManager
   {
      
      private static var _cacheDict:Dictionary = new Dictionary();
      
      private static var _cacheGenerateQueue:Array = [];
      
      private static var _cacheSizeLimit:int = 100;
      
      private static var _limitCacheSize:Boolean = false;
      
      public static const ANIMATE_TYPE_BITMAP:int = 0;
      
      public static const ANIMATE_TYPE_MOVIE_CLIP:int = 1;
      
      public function AnimationManager()
      {
         super();
      }
      
      private static function transformKey(param1:String, param2:Object, param3:String = "default") : String
      {
         return param1 + UtilBase.getObjectID(param2) + param3;
      }
      
      private static function getAnimationClipByName(param1:String, param2:Object, param3:int = 0, param4:Boolean = false) : AnimationClip
      {
         var _loc5_:String = transformKey(param1,param2);
         if(param3 == ANIMATE_TYPE_BITMAP && Boolean(_cacheDict.hasOwnProperty(_loc5_)))
         {
            return new BitmapMovieClip(_cacheDict[_loc5_] as TextureGroup);
         }
         var _loc6_:MovieClip = ResUtil.getNewObj(param1);
         var _loc7_:AnimationClip = McUtil.analyseMovieClipToAnimateClip(_loc6_,param2,param3,param4);
         if(_loc7_ == null)
         {
            return null;
         }
         switch(param3)
         {
            case ANIMATE_TYPE_MOVIE_CLIP:
               return _loc7_;
            case ANIMATE_TYPE_BITMAP:
               _cacheDict[_loc5_] = (_loc7_ as BitmapMovieClip).getTexture();
               _cacheGenerateQueue.push(_loc5_);
               checkCacheQueue();
               return _loc7_;
            default:
               return null;
         }
      }
      
      public static function getAnimation(param1:String, param2:Object = null, param3:Number = 1) : BaseBitmapDataClip
      {
         if(!param2)
         {
            param2 = {
               "cloth":1,
               "weapon":1,
               "wing":1
            };
         }
         var _loc4_:BaseBitmapDataClip = new BaseBitmapDataClip([],0,0,new Point(0,0),new Dictionary(),true);
         _loc4_.sourceName = param1;
         _loc4_.replace = param2;
         _loc4_.animationType = param3;
         return _loc4_;
      }
      
      public static function getActionAnimation(param1:String, param2:Object, param3:String, param4:int = 0, param5:Boolean = false) : IAnimation
      {
         var _loc6_:String = transformKey(param1,param2,param3);
         if(param4 == ANIMATE_TYPE_BITMAP && Boolean(_cacheDict.hasOwnProperty(_loc6_)))
         {
            return new BitmapMovieClip(_cacheDict[_loc6_] as TextureGroup);
         }
         var _loc7_:MovieClip = ResUtil.getNewObj(param1);
         var _loc8_:Object = {
            "fashion_yf":(Boolean(param2.cloth) ? param2.cloth : 1),
            "fashion_wq":(Boolean(param2.weapon) ? param2.weapon : 1),
            "fashion_cb":(Boolean(param2.wing) ? param2.wing : 1)
         };
         var _loc9_:IAnimation = McUtil.analyseMovieClipByAction(_loc7_,_loc8_,param3,param4,param5);
         if(_loc9_ == null)
         {
            return null;
         }
         switch(param4)
         {
            case ANIMATE_TYPE_MOVIE_CLIP:
               return _loc9_;
            case ANIMATE_TYPE_BITMAP:
               _cacheDict[_loc6_] = (_loc9_ as BitmapMovieClip).getTexture();
               _cacheGenerateQueue.push(_loc6_);
               checkCacheQueue();
               return _loc9_;
            default:
               return null;
         }
      }
      
      public static function getAnimationClip(param1:String, param2:Object = null) : AnimationClip
      {
         if(!param2)
         {
            param2 = {};
         }
         return getAnimationClipByName(param1,param2,SettingManager.getSettingVO().effAniType,false);
      }
      
      private static function checkCacheQueue() : void
      {
         var _loc1_:String = null;
         if(!_limitCacheSize)
         {
            return;
         }
         while(_cacheGenerateQueue.length > _cacheSizeLimit)
         {
            _loc1_ = _cacheGenerateQueue.shift();
            if(_cacheDict.hasOwnProperty(_loc1_))
            {
               (_cacheDict[_loc1_] as TextureGroup).destroy();
               delete _cacheDict[_loc1_];
            }
         }
      }
      
      public static function clearAllCache() : void
      {
         UtilBase.getAllKeys(_cacheDict).forEach(function(param1:String, param2:*, param3:*):void
         {
            var key:String = param1;
            var a:* = param2;
            var b:* = param3;
            if(_cacheDict[key] is TextureGroup)
            {
               UtilBase.getAllValue(_cacheDict[key]).forEach(function(param1:TextureGroup, param2:*, param3:*):void
               {
                  param1.destroy();
               });
            }
            delete _cacheDict[key];
         });
      }
   }
}

