package my
{
   import base.BaseHero;
   import flash.events.TimerEvent;
   import flash.utils.*;
   
   public final class HackChecker
   {
      
      private static var timer:Timer;
      
      private static var prevDate:Number;
      
      private static var prevTime:int;
      
      public static const checkInterval:int = 1000;
      
      private static var blur:int = 20;
      
      public static var hackHandler:Function = defaultHackHandler;
      
      public function HackChecker()
      {
         super();
      }
      
      public static function enabledCheckSpeedUp(param1:int = 1000, param2:int = 20) : void
      {
         HackChecker.blur = param2;
         timer = new Timer(param1);
         timer.addEventListener("timer",timeHandler);
         timer.start();
      }
      
      private static function timeHandler(param1:TimerEvent) : void
      {
         var _loc2_:int = int(getTimer());
         var _loc3_:Number = new Date().time;
         var _loc4_:int = _loc2_ - Number(prevTime);
         if(!isNaN(prevDate) && Math.abs(_loc4_ - (_loc3_ - Number(prevDate))) > blur)
         {
            hackHandler();
         }
         prevDate = _loc3_;
         prevTime = _loc2_;
      }
      
      public static function defaultHackHandler() : void
      {
         GMain.getInstance().stage.nativeWindow.close();
      }
      
      public static function checkAttribute(param1:BaseHero) : Boolean
      {
         if(Boolean(AllConsts.GAME_CONFIG_DEBUG) || Boolean(getDefinitionByName("config::Config").getInstance().isPK))
         {
            return false;
         }
         if(param1.roleProperies.getSHHP() > MaxAttrib.MaxHp)
         {
            return true;
         }
         if(param1.roleProperies.getSMMP() > MaxAttrib.MaxMp)
         {
            return true;
         }
         if(param1.roleProperies.getBasePower() > MaxAttrib.MaxAtk)
         {
            return true;
         }
         if(param1.roleProperies.getDefense() > MaxAttrib.MaxDef)
         {
            return true;
         }
         if(param1.roleProperies.getCrit() > MaxAttrib.MaxCrit)
         {
            return true;
         }
         if(param1.roleProperies.getMagicDef() > MaxAttrib.MaxmDef)
         {
            return true;
         }
         if(param1.roleProperies.getMiss() > MaxAttrib.MaxMiss)
         {
            return true;
         }
         if(param1.roleProperies.getHx() > MaxAttrib.MaxHx)
         {
            return true;
         }
         if(param1.roleProperies.getHl() > MaxAttrib.MaxHl)
         {
            return true;
         }
         return false;
      }
   }
}

