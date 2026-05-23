package export.taskInterface
{
   import flash.display.MovieClip;
   import flash.events.*;
   import flash.text.TextField;
   import task.Task;
   
   public class TaskTile extends MovieClip
   {
      
      public var rwnametxt:TextField;
      
      private var myTask:Task;
      
      public function TaskTile()
      {
         super();
         this.gotoAndStop(1);
         this.buttonMode = true;
         this.rwnametxt.selectable = false;
         this.addEventListener(Event.ADDED_TO_STAGE,this.added,false,0,true);
         this.addEventListener(Event.REMOVED_FROM_STAGE,this.removed,false,0,true);
      }
      
      private function added(param1:Event) : void
      {
      }
      
      private function removed(param1:Event) : void
      {
      }
      
      public function setTask(param1:Task) : void
      {
         this.myTask = param1;
         this.rwnametxt.text = this.myTask.getrwname();
         this.setReceive();
      }
      
      public function selected() : void
      {
         this.gotoAndStop(2);
      }
      
      public function unselected() : void
      {
         this.gotoAndStop(1);
      }
      
      public function getTask() : Task
      {
         return this.myTask;
      }
      
      public function setReceive() : void
      {
         var _loc1_:* = undefined;
         if(this.myTask)
         {
            if(this.myTask.getHasGetAward())
            {
               _loc1_ = AUtils.getImageObj("hasReceive");
               _loc1_.name = "hasReceiveIcon";
               _loc1_.x = 150.5;
               this.addChild(_loc1_);
            }
            else if(this.getChildByName("hasReceiveIcon"))
            {
               this.removeChild(this.getChildByName("hasReceiveIcon"));
            }
         }
      }
      
      public function removeIcon() : void
      {
         if(this.getChildByName("hasReceiveIcon"))
         {
            this.removeChild(this.getChildByName("hasReceiveIcon"));
         }
      }
   }
}

