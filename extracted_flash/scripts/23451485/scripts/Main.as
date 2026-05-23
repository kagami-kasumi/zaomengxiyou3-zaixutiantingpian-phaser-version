package
{
   import flash.desktop.NativeApplication;
   import flash.display.Sprite;
   import flash.events.Event;
   import flash.filesystem.File;
   import flash.geom.Rectangle;
   import flash.media.StageWebView;
   
   public class Main extends Sprite
   {
      
      private var __swv__:StageWebView;
      
      public function Main()
      {
         super();
         if(stage)
         {
            init(null);
         }
         else
         {
            this.addEventListener("addedToStage",init);
         }
      }
      
      private function init(param1:Event) : void
      {
         var _loc4_:XML = null;
         var _loc3_:Namespace = null;
         var _loc5_:XMLList = null;
         var _loc2_:XMLList = null;
         var _loc6_:String = null;
         if(param1)
         {
            this.removeEventListener("addedToStage",init);
         }
         stage.align = "TL";
         stage.scaleMode = "noScale";
         __swv__ = new StageWebView();
         __swv__.stage = stage;
         __swv__.viewPort = new Rectangle(0,0,stage.stageWidth,stage.stageHeight);
         stage.addEventListener("resize",onSize);
         try
         {
            _loc4_ = NativeApplication.nativeApplication.applicationDescriptor;
            _loc3_ = _loc4_.namespace();
            _loc5_ = _loc4_._loc3_::initialWindow;
            _loc2_ = _loc5_[0]._loc3_::content;
            _loc6_ = _loc2_[0].toString();
            __swv__.loadURL(File.applicationDirectory.resolvePath(_loc6_).nativePath);
         }
         catch(e:Error)
         {
         }
      }
      
      private function onSize(param1:Event) : void
      {
         __swv__.viewPort = new Rectangle(0,0,stage.stageWidth,stage.stageHeight);
      }
   }
}

