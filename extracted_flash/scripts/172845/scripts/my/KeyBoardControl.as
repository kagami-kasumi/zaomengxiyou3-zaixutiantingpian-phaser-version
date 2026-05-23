package my
{
   import base.BaseHero;
   import config.*;
   import export.level.*;
   import flash.display.Stage;
   import flash.events.*;
   import flash.text.*;
   import user.User;
   
   public class KeyBoardControl
   {
      
      private var thisStage:Stage;
      
      private var role1:BaseHero;
      
      private var role2:BaseHero;
      
      private var leftArray:Array;
      
      private var rightArray:Array;
      
      private var player1KeyArray:Array;
      
      private var player2KeyArray:Array;
      
      private var player1KeyInHostArray:Array;
      
      private var player2KeyInHostArray:Array;
      
      private var player1CanControl:Boolean = true;
      
      private var player2CanControl:Boolean = true;
      
      private var player1SkillArray:Array;
      
      private var player2SkillArray:Array;
      
      private var player1ShortcutKeyArray:Array;
      
      private var isStop:Boolean = false;
      
      private var player2ShortcutKeyArray:Array;
      
      private var gc:Config;
      
      public function KeyBoardControl(param1:Stage)
      {
         this.leftArray = [65,37];
         this.rightArray = [68,39];
         this.player1KeyArray = [83,74,75,87];
         this.player2KeyArray = [40,97,98,38];
         this.player1KeyInHostArray = [83,75,65,68,87];
         this.player2KeyInHostArray = [40,98,37,39,38];
         this.player1SkillArray = [89,76,85,73,79,32,72];
         this.player2SkillArray = [104,99,100,101,102,96,103];
         this.player1ShortcutKeyArray = [67,86,66,78,27];
         this.player2ShortcutKeyArray = [111,106,109];
         super();
         this.gc = Config.getInstance();
         this.thisStage = param1;
         this.thisStage.addEventListener(KeyboardEvent.KEY_DOWN,this.__keyBoardDown);
         this.thisStage.addEventListener(KeyboardEvent.KEY_UP,this.__keyBoardUp);
      }
      
      protected function __keyBoardDown(param1:KeyboardEvent) : void
      {
         var _loc2_:* = null;
         var _loc3_:int = 0;
         var _loc4_:int = 0;
         var _loc5_:int = 0;
         if(this.thisStage.focus is TextField)
         {
            return;
         }
         if(this.gc.gameInfo)
         {
            _loc3_ = int(this.player1ShortcutKeyArray.indexOf(param1.keyCode));
            if(_loc3_ == 0)
            {
               if(Boolean(this.role1) && Boolean(this.gc.gameInfo))
               {
                  _loc2_ = this.gc.gameInfo.getRoleInfoByPlayer(this.role1.getPlayer());
                  _loc2_.btn_bb.dispatchEvent(new MouseEvent("click"));
               }
            }
            else if(_loc3_ == 1)
            {
               if(Boolean(this.role1) && Boolean(this.gc.gameInfo))
               {
                  _loc2_ = this.gc.gameInfo.getRoleInfoByPlayer(this.role1.getPlayer());
                  _loc2_.btn_study.dispatchEvent(new MouseEvent("click"));
               }
            }
            else if(_loc3_ == 2)
            {
               if(Boolean(this.role1) && Boolean(this.gc.gameInfo))
               {
                  _loc2_ = this.gc.gameInfo.getRoleInfoByPlayer(this.role1.getPlayer());
                  _loc2_.btn_cw.dispatchEvent(new MouseEvent("click"));
               }
            }
            else if(_loc3_ == 3)
            {
               if(Boolean(this.role1) && Boolean(this.gc.gameInfo))
               {
                  _loc2_ = this.gc.gameInfo.getRoleInfoByPlayer(this.role1.getPlayer());
                  _loc2_.btn_fb.dispatchEvent(new MouseEvent("click"));
               }
            }
            else if(_loc3_ == 4)
            {
               if(Boolean(this.role1) && Boolean(this.gc.gameInfo))
               {
                  _loc2_ = this.gc.gameInfo.getRoleInfoByPlayer(this.role1.getPlayer());
                  _loc2_.btn_set.dispatchEvent(new MouseEvent("click"));
               }
            }
            _loc3_ = int(this.player2ShortcutKeyArray.indexOf(param1.keyCode));
            if(_loc3_ == 0)
            {
               if(Boolean(this.role2) && Boolean(this.gc.gameInfo))
               {
                  _loc2_ = this.gc.gameInfo.getRoleInfoByPlayer(this.role2.getPlayer());
                  _loc2_.btn_bb.dispatchEvent(new MouseEvent("click"));
               }
            }
            else if(_loc3_ == 1)
            {
               if(Boolean(this.role2) && Boolean(this.gc.gameInfo))
               {
                  _loc2_ = this.gc.gameInfo.getRoleInfoByPlayer(this.role2.getPlayer());
                  _loc2_.btn_study.dispatchEvent(new MouseEvent("click"));
               }
            }
            else if(_loc3_ == 2)
            {
               if(Boolean(this.role2) && Boolean(this.gc.gameInfo))
               {
                  _loc2_ = this.gc.gameInfo.getRoleInfoByPlayer(this.role2.getPlayer());
                  _loc2_.btn_cw.dispatchEvent(new MouseEvent("click"));
               }
            }
         }
         if(this.isStop)
         {
            return;
         }
         if(this.gc.stage.focus != this.gc.stage)
         {
            return;
         }
         if(this.player1CanControl)
         {
            if(this.gc.isInRoomOrSingleGame())
            {
               if(this.player1KeyArray.indexOf(param1.keyCode) != -1 || param1.keyCode == 65 || param1.keyCode == 68)
               {
                  if(this.role1)
                  {
                     this.role1.__keyBoardDown(param1);
                  }
               }
               _loc4_ = int(this.player1SkillArray.indexOf(param1.keyCode));
               if(_loc4_ != -1)
               {
                  if(this.role1)
                  {
                     this.role1.sendSkill(_loc4_);
                  }
               }
            }
            else if(this.gc.isInHost())
            {
               if(this.player1KeyInHostArray.indexOf(param1.keyCode) != -1)
               {
                  if(this.role1)
                  {
                     this.role1.__keyBoardDown(param1);
                  }
               }
            }
         }
         if(this.player2CanControl)
         {
            if(this.gc.isInRoomOrSingleGame())
            {
               if(this.player2KeyArray.indexOf(param1.keyCode) != -1 || param1.keyCode == 37 || param1.keyCode == 39)
               {
                  if(this.role2)
                  {
                     this.role2.__keyBoardDown(param1);
                  }
               }
               _loc5_ = int(this.player2SkillArray.indexOf(param1.keyCode));
               if(_loc5_ != -1)
               {
                  if(this.role2)
                  {
                     this.role2.sendSkill(_loc5_);
                  }
               }
            }
            else if(this.gc.isInHost())
            {
               if(this.player2KeyInHostArray.indexOf(param1.keyCode) != -1)
               {
                  if(this.role2)
                  {
                     this.role2.__keyBoardDown(param1);
                  }
               }
            }
         }
         if(this.player1CanControl)
         {
            if(param1.keyCode == 81)
            {
               if(this.gc.pWorld.getBaseLevelListener() is StageListener01)
               {
                  StageListener01(this.gc.pWorld.getBaseLevelListener()).checkRwOrPk();
               }
            }
         }
      }
      
      public function setNoControlByPlayer(param1:User) : void
      {
         if(param1.getControlPlayer() == 0)
         {
            this.player1CanControl = false;
         }
         else
         {
            this.player2CanControl = false;
         }
      }
      
      public function stopAllControl() : void
      {
         this.player1CanControl = false;
         this.player2CanControl = false;
      }
      
      public function continueAllControl() : void
      {
         this.player1CanControl = true;
         this.player2CanControl = true;
      }
      
      public function setYesControlByPlayer(param1:User) : void
      {
         if(param1.getControlPlayer() == 0)
         {
            this.player1CanControl = true;
         }
         else
         {
            this.player2CanControl = true;
         }
      }
      
      protected function __keyBoardUp(param1:KeyboardEvent) : void
      {
         if(this.gc.stage.focus != this.gc.stage)
         {
            return;
         }
         if(this.isStop)
         {
            return;
         }
         if(this.player1CanControl)
         {
            if(this.role1)
            {
               this.role1.__keyBoardUp(param1);
            }
         }
         if(this.player2CanControl)
         {
            if(this.role2)
            {
               this.role2.__keyBoardUp(param1);
            }
         }
      }
      
      public function getKeyArrayByPlayer(param1:User) : Array
      {
         if(param1.getControlPlayer() == 0)
         {
            return this.player1KeyArray;
         }
         return this.player2KeyArray;
      }
      
      public function continueKeyboardControl() : void
      {
         this.isStop = false;
      }
      
      public function stopKeyboardControl() : void
      {
         this.isStop = true;
      }
      
      public function destroy() : void
      {
         this.thisStage.removeEventListener(KeyboardEvent.KEY_DOWN,this.__keyBoardDown);
         this.thisStage.removeEventListener(KeyboardEvent.KEY_UP,this.__keyBoardUp);
         this.player1CanControl = true;
         this.player2CanControl = true;
      }
      
      public function setRole1(param1:BaseHero) : void
      {
         this.role1 = param1;
         if(this.role1.getPlayer().getControlPlayer() == 0)
         {
            this.role1.setKeyList(this.player1KeyArray);
         }
         else
         {
            this.role1.setKeyList(this.player2KeyArray);
         }
      }
      
      public function setRole2(param1:BaseHero) : void
      {
         this.role2 = param1;
         if(this.role2.getPlayer().getControlPlayer() == 0)
         {
            this.role2.setKeyList(this.player1KeyArray);
         }
         else
         {
            this.role2.setKeyList(this.player2KeyArray);
         }
      }
      
      public function getRole1() : BaseHero
      {
         return this.role1;
      }
      
      public function getRole2() : BaseHero
      {
         return this.role2;
      }
      
      public function getLeftByPlayer(param1:User) : int
      {
         return this.leftArray[param1.getControlPlayer()];
      }
      
      public function getRightByPlayer(param1:User) : int
      {
         return this.rightArray[param1.getControlPlayer()];
      }
      
      public function getNormalAttackKeyCodeByPlayer(param1:User) : int
      {
         if(param1.getControlPlayer() == 0)
         {
            return this.player1KeyArray[1];
         }
         return this.player2KeyArray[1];
      }
      
      public function getZeroKeyArray() : Array
      {
         var _loc1_:Array = new Array();
         var _loc2_:int = int(this.player1KeyArray.length);
         var _loc3_:int = 0;
         while(_loc3_ < _loc2_)
         {
            _loc1_[_loc3_] = 0;
            _loc3_++;
         }
         return _loc1_;
      }
      
      public function isInThisPlayerKeyboard(param1:User, param2:uint) : Boolean
      {
         if(param1.getControlPlayer() == 0)
         {
            return this.player1KeyArray.indexOf(param2) != -1 || param2 == this.getLeftByPlayer(param1) || param2 == this.getRightByPlayer(param1);
         }
         return this.player2KeyArray.indexOf(param2) != -1 || param2 == this.getLeftByPlayer(param1) || param2 == this.getRightByPlayer(param1);
      }
   }
}

