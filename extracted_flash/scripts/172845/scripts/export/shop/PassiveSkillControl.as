package export.shop
{
   import flash.display.MovieClip;
   import flash.display.Sprite;
   import flash.events.*;
   import user.User;
   
   public class PassiveSkillControl extends Sprite
   {
      
      private var player:User;
      
      public var pskill1:MovieClip;
      
      public var pskill2:MovieClip;
      
      public var pskill3:MovieClip;
      
      public var pskill4:MovieClip;
      
      public var pskill5:MovieClip;
      
      public function PassiveSkillControl(param1:User)
      {
         super();
         this.player = param1;
         this.addEventListener(Event.ADDED_TO_STAGE,this.added,false,0,true);
         this.addEventListener(Event.REMOVED_FROM_STAGE,this.removed,false,0,true);
      }
      
      private function added(param1:Event) : void
      {
         var _loc2_:int = 0;
         while(_loc2_ < 5)
         {
            this["pskill" + (_loc2_ + 1)].setRole(this.player);
            _loc2_++;
         }
      }
      
      private function removed(param1:Event) : void
      {
      }
   }
}

