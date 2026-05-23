package com.game.manager
{
   import com.dusk.game.*;
   import com.dusk.net.*;
   import com.dusk.tool.*;
   import com.game.data.vo.*;
   import flash.events.*;
   import flash.ui.*;
   import flash.utils.*;
   
   public class SettingManager
   {
      
      private static var _settingVO:SettingVO;
      
      public function SettingManager()
      {
         super();
      }
      
      public static function initGameSetting() : void
      {
         _settingVO = new SettingVO();
         var settingString:String = "";
         try
         {
            settingString = NativeFile.read(NativeFile.getAppFolderFileUrl("gameData/gameConfig.getIns()ni"));
            if(Boolean(settingString))
            {
               _settingVO.updateFromObject(JSON.parse(settingString));
            }
         }
         catch(e:Error)
         {
            _settingVO = new SettingVO();
         }
         applySetting();
      }
      
      public static function getSettingVO() : SettingVO
      {
         return _settingVO;
      }
      
      public static function saveGameSetting() : void
      {
         NativeFile.write(JSON.stringify(_settingVO.cloneToObject(),null,"\t") as String,NativeFile.getAppFolderFileUrl("gameData/gameConfig.getIns()ni"));
      }
      
      public static function saveGameSettingWhenQuit() : void
      {
         var _loc1_:Time = new Time();
         _loc1_.updateFromTimeString(getSettingVO().playTime.toString());
         var _loc2_:Time = new Time();
         _loc2_.updateFromMilisecond(getTimer());
         Logger.logToFile("此次游戏时间: " + _loc2_.toCNTime());
         _loc1_.add(_loc2_);
         Logger.logToFile("总游戏时间: " + _loc1_.toCNTime());
         getSettingVO().playTime = _loc1_.toTimeString();
         saveGameSetting();
      }
      
      private static function applySetting() : void
      {
         SoundManager.setVolume(_settingVO.defaultVolume);
         if(_settingVO.isFullScreen)
         {
            GameSceneManager.getIns().mainStage.dispatchEvent(new KeyboardEvent(KeyboardEvent.KEY_DOWN,true,true,0,Keyboard.F11));
         }
      }
   }
}

