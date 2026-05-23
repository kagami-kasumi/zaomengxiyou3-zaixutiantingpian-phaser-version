package event
{
   import flash.events.EventDispatcher;
   import flash.events.IEventDispatcher;
   
   public class AEventDispatcher extends EventDispatcher
   {
      
      public function AEventDispatcher(param1:IEventDispatcher = null)
      {
         super(param1);
      }
      
      override public function addEventListener(param1:String, param2:Function, param3:Boolean = false, param4:int = 0, param5:Boolean = false) : void
      {
         super.removeEventListener(param1,param2,param3);
         super.addEventListener(param1,param2,param3,param4,param5);
      }
   }
}

