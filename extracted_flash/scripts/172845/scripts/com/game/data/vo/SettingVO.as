package com.game.data.vo
{
   import base.BaseVVOO;
   
   public class SettingVO extends BaseVVOO
   {
      
      public var isFullScreen:Boolean = false;
      
      public var defaultVolume:int = 100;
      
      public var isLostFocusMute:Boolean = true;
      
      public var isLostFocusPause:Boolean = false;
      
      public var battleFPS:int = 60;
      
      public var charAniType:int = 0;
      
      public var indicateAniType:int = 0;
      
      public var effAniType:int = 0;
      
      public var isShowIndicate:Boolean = true;
      
      public var isShowRoleInfo:Boolean = true;
      
      public var isShowShadowEffect:Boolean = true;
      
      public var isShowFilter:Boolean = true;
      
      public var isCamaraShake:Boolean = true;
      
      public var isScreenShine:Boolean = true;
      
      public var playTime:String = "0:0:0";
      
      public function SettingVO()
      {
         super();
      }
      
      public function setToDefault() : void
      {
         updateFromObject(new SettingVO().cloneToObject());
      }
   }
}

