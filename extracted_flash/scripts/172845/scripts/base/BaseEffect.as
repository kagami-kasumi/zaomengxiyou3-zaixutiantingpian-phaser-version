package base
{
   import com.greensock.*;
   import config.Config;
   import flash.display.*;
   import flash.events.*;
   import flash.utils.*;
   
   public class BaseEffect
   {
      
      public static var shakeDirect:int = 0;
      
      public static var shakeRange:int = 0;
      
      public function BaseEffect()
      {
         super();
      }
      
      public static function get frameClips() : int
      {
         if(getDefinitionByName("config::Config").getInstance())
         {
            return getDefinitionByName("config::Config").getInstance().frameClips;
         }
         return undefined;
      }
      
      public static function set frameClips(param1:int) : void
      {
         if(getDefinitionByName("config::Config").getInstance())
         {
            getDefinitionByName("config::Config").getInstance().frameClips = param1;
         }
      }
      
      public static function get frameRate() : int
      {
         if(getDefinitionByName("config::Config").getInstance())
         {
            return getDefinitionByName("config::Config").getInstance().stage.frameRate;
         }
         return undefined;
      }
      
      public static function set frameRate(param1:int) : void
      {
         if(getDefinitionByName("config::Config").getInstance())
         {
            getDefinitionByName("config::Config").getInstance().stage.frameRate = param1;
         }
      }
      
      public static function stopSlowDown() : void
      {
         if(getDefinitionByName("config::Config").getInstance())
         {
            getDefinitionByName("config::Config").getInstance().stage.frameRate = BaseEffect.frameClips;
         }
      }
      
      public static function doShake(param1:Event) : void
      {
         if(getTimer() % 2 == 0)
         {
            GMain.getInstance().x = BaseEffect.shakeRange * BaseEffect.shakeDirect;
            GMain.getInstance().y = BaseEffect.shakeRange * BaseEffect.shakeDirect;
            BaseEffect.shakeDirect *= -1;
         }
      }
      
      public static function stopShake() : void
      {
         var _loc1_:Config = null;
         if(getDefinitionByName("config::Config"))
         {
            _loc1_ = getDefinitionByName("config::Config").getInstance();
         }
         GMain.getInstance().x = 0;
         GMain.getInstance().y = 0;
         BaseEffect.shakeDirect = 0;
         BaseEffect.shakeRange = 0;
         _loc1_.stage.removeEventListener(Event.ENTER_FRAME,BaseEffect.doShake);
      }
      
      public static function slowDown(param1:Number, param2:Number) : void
      {
         var _loc3_:Config = null;
         if(getDefinitionByName("config::Config"))
         {
            _loc3_ = getDefinitionByName("config::Config").getInstance();
         }
         if(_loc3_.stage.frameRate != _loc3_.frameClips)
         {
            return;
         }
         _loc3_.stage.frameRate *= param1;
         TweenMax.delayedCall(param2,BaseEffect.stopSlowDown);
      }
      
      public static function shake(param1:int, param2:Number) : void
      {
         var _loc3_:Config = null;
         if(BaseEffect.shakeDirect != 0)
         {
            BaseEffect.shakeRange = param1;
            return;
         }
         if(getDefinitionByName("config::Config"))
         {
            _loc3_ = getDefinitionByName("config::Config").getInstance();
         }
         BaseEffect.shakeDirect = 1;
         BaseEffect.shakeRange = param1;
         _loc3_.stage.addEventListener(Event.ENTER_FRAME,BaseEffect.doShake);
         TweenMax.delayedCall(param2,BaseEffect.stopShake);
      }
   }
}

