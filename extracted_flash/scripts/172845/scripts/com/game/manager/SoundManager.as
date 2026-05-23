package com.game.manager
{
   import com.dusk.game.*;
   import com.dusk.net.*;
   import com.dusk.util.*;
   import flash.media.*;
   import flash.utils.*;
   
   public class SoundManager
   {
      
      private static var _loopChannel:SoundChannel;
      
      public static var playing:String = "";
      
      public static var bgmStay:Boolean = true;
      
      public static var skillStay:Boolean = true;
      
      public static var currentVolume:int = 100;
      
      private static var _soundCacheDict:Dictionary = new Dictionary();
      
      public function SoundManager()
      {
         super();
      }
      
      public static function playBgm(param1:String) : void
      {
         if(!bgmStay)
         {
            return;
         }
         if(playing == param1)
         {
            return;
         }
         var _loc2_:Sound = AssetManager.getIns().getSound(AssetUrl.getSoundAssetUrl(param1));
         clearLoop();
         playing = param1;
         if(!_loc2_)
         {
            AssetManager.getIns().loadAsset(AssetUrl.getSoundAssetUrl(param1),AssetType.SOUND,null,onLoadMusicBack);
            return;
         }
         _loopChannel = _loc2_.play(0,9999);
      }
      
      public static function playSound(param1:String) : void
      {
         if(!skillStay)
         {
            return;
         }
         if(Boolean(_soundCacheDict[param1]))
         {
            (_soundCacheDict[param1] as Sound).play();
            return;
         }
         var _loc2_:Sound = AssetManager.getIns().getClassInstance(param1) as Sound;
         if(!_loc2_)
         {
            Logger.log("找不到音效: " + param1);
            return;
         }
         _soundCacheDict[param1] = _loc2_;
         (_soundCacheDict[param1] as Sound).play();
      }
      
      private static function onLoadMusicBack() : void
      {
         var _loc1_:Sound = AssetManager.getIns().getSound(AssetUrl.getSoundAssetUrl(playing));
         if(!_loc1_)
         {
            Logger.log("找不到BGM: " + playing);
            return;
         }
         _loopChannel = _loc1_.play(0,9999);
      }
      
      public static function clearLoop() : void
      {
         if(!_loopChannel)
         {
            return;
         }
         _loopChannel.stop();
         playing = "";
      }
      
      public static function setVolume(param1:int = 100) : void
      {
         currentVolume = param1;
         SoundMixer.soundTransform = new SoundTransform(param1 * 0.01);
      }
      
      public static function closeSnd() : void
      {
         SoundMixer.soundTransform = new SoundTransform(0);
      }
      
      public static function openSnd() : void
      {
         SoundMixer.soundTransform = new SoundTransform(currentVolume / 100);
      }
      
      public static function clearAllCache() : void
      {
         UtilBase.getAllKeys(_soundCacheDict).forEach(function(param1:String, ... rest):void
         {
            Logger.log("delete key: " + param1);
            delete _soundCacheDict[param1];
         });
         Logger.log("====== clear sound cache ======");
      }
   }
}

