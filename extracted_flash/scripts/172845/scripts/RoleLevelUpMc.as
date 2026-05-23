package
{
   import flash.accessibility.*;
   import flash.display.*;
   import flash.errors.*;
   import flash.events.*;
   import flash.filters.*;
   import flash.geom.*;
   import flash.media.*;
   import flash.net.*;
   import flash.net.drm.*;
   import flash.system.*;
   import flash.text.*;
   import flash.text.ime.*;
   import flash.ui.*;
   import flash.utils.*;
   
   [Embed(source="/_assets/assets.swf", symbol="symbol331")]
   public dynamic class RoleLevelUpMc extends MovieClip
   {
      
      public function RoleLevelUpMc()
      {
         addFrameScript(25,this.frame26);
         super();
      }
      
      internal function frame26() : *
      {
         if(this.parent)
         {
            this.parent["removeChild"](this);
         }
         stop();
      }
   }
}

