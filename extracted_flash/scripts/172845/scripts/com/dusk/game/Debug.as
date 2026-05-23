package com.dusk.game
{
   import flash.display.*;
   import flash.events.*;
   import flash.net.*;
   import flash.system.*;
   
   public class Debug
   {
      
      private static const _url:String = "./debugUI.swf";
      
      private static var _instance:Debug = null;
      
      private var _ui:MovieClip;
      
      public function Debug()
      {
         super();
         this.initDebugger();
      }
      
      public static function getIns() : Debug
      {
         return _instance;
      }
      
      public function logInfo(param1:String, param2:int = 1) : void
      {
         if(Boolean(this._ui))
         {
            this._ui.log(param1,param2);
         }
      }
      
      private function initDebugger() : void
      {
         var loader:Loader = new Loader();
         loader.load(new URLRequest(_url),new LoaderContext(false,ApplicationDomain.currentDomain));
         loader.contentLoaderInfo.addEventListener(Event.COMPLETE,function(param1:Event):void
         {
            _ui = (param1.target as LoaderInfo).content as MovieClip;
            _ui["gc"] = Config.getIns();
            (param1.target as LoaderInfo).removeEventListener(Event.COMPLETE,arguments.callee);
            (param1.target as LoaderInfo).removeEventListener(IOErrorEvent.IO_ERROR,arguments.callee);
            changeStageLayout();
            Logger.log("Debugger加载完成");
         });
         loader.contentLoaderInfo.addEventListener(IOErrorEvent.IO_ERROR,function(param1:Event):void
         {
            (param1.target as LoaderInfo).removeEventListener(Event.COMPLETE,arguments.callee);
            (param1.target as LoaderInfo).removeEventListener(IOErrorEvent.IO_ERROR,arguments.callee);
         });
      }
   }
}

