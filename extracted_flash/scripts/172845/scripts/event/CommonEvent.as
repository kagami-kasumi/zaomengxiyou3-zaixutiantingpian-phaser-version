package event
{
   import flash.events.Event;
   
   public class CommonEvent extends Event
   {
      
      public var data:Object;
      
      public function CommonEvent(param1:String, param2:Object = null, param3:Boolean = false, param4:Boolean = false)
      {
         this.data = param2;
         super(param1,param3,param4);
      }
      
      override public function clone() : Event
      {
         return new CommonEvent(type,this.data,bubbles,cancelable);
      }
   }
}

