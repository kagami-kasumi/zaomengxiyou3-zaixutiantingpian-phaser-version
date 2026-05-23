package export
{
   import config.*;
   import event.*;
   import flash.display.SimpleButton;
   import flash.display.Sprite;
   import flash.events.*;
   import flash.text.TextField;
   
   public class SelectRole extends Sprite
   {
      
      public var btn1:SimpleButton;
      
      public var btn2:SimpleButton;
      
      public var btn3:SimpleButton;
      
      public var btn4:SimpleButton;
      
      public var btn5:SimpleButton;
      
      public var username:TextField;
      
      public var curSelected:uint = 1;
      
      private var gc:Config;
      
      public function SelectRole()
      {
         super();
         this.gc = Config.getInstance();
         this.addEventListener(Event.ADDED_TO_STAGE,this.added,false,0,true);
         this.addEventListener(Event.REMOVED_FROM_STAGE,this.removed,false,0,true);
      }
      
      private function added(param1:*) : void
      {
         this.btn1.addEventListener(MouseEvent.ROLL_OVER,this.over);
         this.btn1.addEventListener(MouseEvent.ROLL_OUT,this.out);
         this.btn2.addEventListener(MouseEvent.ROLL_OVER,this.over);
         this.btn2.addEventListener(MouseEvent.ROLL_OUT,this.out);
         this.btn1.addEventListener(MouseEvent.CLICK,this.onClick);
         this.btn2.addEventListener(MouseEvent.CLICK,this.onClick);
         this.btn3.addEventListener(MouseEvent.ROLL_OVER,this.over);
         this.btn3.addEventListener(MouseEvent.ROLL_OUT,this.out);
         this.btn3.addEventListener(MouseEvent.CLICK,this.onClick);
         this.btn4.addEventListener(MouseEvent.ROLL_OVER,this.over);
         this.btn4.addEventListener(MouseEvent.ROLL_OUT,this.out);
         this.btn4.addEventListener(MouseEvent.CLICK,this.onClick);
         this.btn5.addEventListener(MouseEvent.ROLL_OVER,this.over);
         this.btn5.addEventListener(MouseEvent.ROLL_OUT,this.out);
         this.btn5.addEventListener(MouseEvent.CLICK,this.onClick);
      }
      
      private function removed(param1:*) : void
      {
         this.btn1.removeEventListener(MouseEvent.ROLL_OVER,this.over);
         this.btn1.removeEventListener(MouseEvent.ROLL_OUT,this.out);
         this.btn2.removeEventListener(MouseEvent.ROLL_OVER,this.over);
         this.btn2.removeEventListener(MouseEvent.ROLL_OUT,this.out);
         this.btn1.removeEventListener(MouseEvent.CLICK,this.onClick);
         this.btn2.removeEventListener(MouseEvent.CLICK,this.onClick);
         this.btn3.removeEventListener(MouseEvent.ROLL_OVER,this.over);
         this.btn3.removeEventListener(MouseEvent.ROLL_OUT,this.out);
         this.btn3.removeEventListener(MouseEvent.CLICK,this.onClick);
         this.btn4.removeEventListener(MouseEvent.ROLL_OVER,this.over);
         this.btn4.removeEventListener(MouseEvent.ROLL_OUT,this.out);
         this.btn4.removeEventListener(MouseEvent.CLICK,this.onClick);
         this.btn5.removeEventListener(MouseEvent.ROLL_OVER,this.over);
         this.btn5.removeEventListener(MouseEvent.ROLL_OUT,this.out);
         this.btn5.removeEventListener(MouseEvent.CLICK,this.onClick);
      }
      
      private function over(param1:MouseEvent) : void
      {
         var _loc2_:* = AUtils.getImageObj(this.curSelected + "P");
         _loc2_.name = "arrow" + this.curSelected;
         _loc2_.x = param1.currentTarget.x - 50;
         _loc2_.y = 40;
         this.addChild(_loc2_);
      }
      
      private function out(param1:MouseEvent) : void
      {
         if(this.getChildByName("arrow" + this.curSelected) != null)
         {
            this.removeChild(this.getChildByName("arrow" + this.curSelected));
         }
      }
      
      private function onClick(param1:MouseEvent) : void
      {
         if(!this.gc.isHideDebug)
         {
         }
         param1.currentTarget.removeEventListener(MouseEvent.ROLL_OUT,this.out);
         param1.currentTarget.removeEventListener(MouseEvent.ROLL_OVER,this.over);
         param1.currentTarget.removeEventListener(MouseEvent.CLICK,this.onClick);
         this.gc.gameinwhere = "开场";
         var _loc2_:uint = uint(int(String(param1.currentTarget.name).substr(3,1)));
         if(this.gc.playNum == 1)
         {
            this.newRole(_loc2_);
         }
         else if(this.gc.playNum == 2)
         {
            this.newRole(_loc2_);
         }
         param1.target.upState = param1.target.downState;
      }
      
      private function selectOver() : void
      {
         this.doAfterChangeOut();
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
      }
      
      public function doAfterChangeOut() : void
      {
         this.gc.eventManger.dispatchEvent(new CommonEvent("SelectOver"));
         this.gc.myname = this.username.text;
      }
      
      public function doAfterChangeIn() : void
      {
         this.visible = true;
      }
      
      private function newRole(param1:uint = 3) : void
      {
         if(this.curSelected == 1)
         {
            this.gc.player1.roleid = param1;
            this.gc.player2.roleid = 0;
         }
         else if(this.curSelected == 2)
         {
            this.gc.player2.roleid = param1;
         }
         this.gc.newRole();
         if(this.gc.playNum == 2)
         {
            if(this.curSelected == 2)
            {
               this.selectOver();
            }
            ++this.curSelected;
         }
         else
         {
            this.selectOver();
         }
      }
   }
}

