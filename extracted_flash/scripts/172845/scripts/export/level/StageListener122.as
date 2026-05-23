package export.level
{
   import base.BaseLevelListenering;
   import flash.display.*;
   import flash.events.*;
   import my.*;
   
   public class StageListener122 extends BaseLevelListenering
   {
      
      private var showBossDialogue:Boolean = true;
      
      private var bossDialogue:MovieClip;
      
      public function StageListener122()
      {
         super();
         waitForRegisterDataArray = ["Monster54","Monster55","Monster56","Monster57"];
      }
      
      override public function start() : void
      {
         super.start();
      }
      
      private function __keyDown(param1:KeyboardEvent) : void
      {
         this.nextDialogue();
      }
      
      private function __click(param1:MouseEvent) : void
      {
         this.nextDialogue();
      }
      
      private function nextDialogue() : void
      {
         var _loc1_:* = null;
         var _loc2_:* = null;
         if(this.bossDialogue)
         {
            if(this.bossDialogue.currentFrame < 8)
            {
               this.bossDialogue.gotoAndStop(this.bossDialogue.currentFrame + 1);
               _loc1_ = this.bossDialogue.getChildByName("playerHead") as MovieClip;
               _loc2_ = this.bossDialogue.getChildByName("monsterDead") as MovieClip;
               if(this.bossDialogue.currentFrame == 1 || this.bossDialogue.currentFrame == 3 || this.bossDialogue.currentFrame == 6 || this.bossDialogue.currentFrame == 8)
               {
                  _loc2_.visible = false;
                  _loc1_.visible = true;
               }
               else
               {
                  _loc2_.visible = true;
                  _loc1_.visible = false;
               }
            }
            else
            {
               gc.stage.removeEventListener(KeyboardEvent.KEY_DOWN,this.__keyDown);
               gc.stage.removeEventListener(MouseEvent.CLICK,this.__click);
               MainGame.getInstance().continueGame();
               if(this.bossDialogue.parent)
               {
                  this.bossDialogue.parent.removeChild(this.bossDialogue);
               }
            }
         }
      }
      
      override public function step() : void
      {
         var _loc1_:* = null;
         var _loc2_:* = null;
         var _loc3_:* = null;
         super.step();
         if(this.showBossDialogue)
         {
            for each(_loc1_ in gc.pWorld.monsterArray)
            {
               if(_loc1_.ddd)
               {
                  gc.stage.addEventListener(KeyboardEvent.KEY_DOWN,this.__keyDown);
                  gc.stage.addEventListener(MouseEvent.CLICK,this.__click);
                  this.bossDialogue = AUtils.getNewObj("Stage12XDialogue") as MovieClip;
                  this.bossDialogue.x = -15;
                  this.bossDialogue.y = 6 * 60;
                  this.bossDialogue.gotoAndStop(5);
                  _loc2_ = this.bossDialogue.getChildByName("playerHead") as MovieClip;
                  _loc3_ = this.bossDialogue.getChildByName("monsterDead") as MovieClip;
                  _loc2_.visible = false;
                  _loc2_.gotoAndStop(gc.player1.roleid);
                  _loc3_.gotoAndStop(2);
                  MainGame.getInstance().stopGame();
                  GMain.getInstance().getTopSence().addChild(this.bossDialogue);
                  this.showBossDialogue = false;
               }
            }
         }
      }
      
      override public function destroy() : void
      {
         super.destroy();
      }
   }
}

