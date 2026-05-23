package export.level
{
   import base.BaseLevelListenering;
   import event.*;
   import flash.display.*;
   import flash.system.*;
   import my.*;
   
   public class StageListener01 extends BaseLevelListenering
   {
      
      private var rwDoor:MovieClip;
      
      private var pkDoor:MovieClip;
      
      private var monsterarray:Array;
      
      public function StageListener01()
      {
         super();
         if(gc.klsmode == 1)
         {
            waitForRegisterDataArray = ["Monster20","Monster21","Monster22","Monster23","Monster24","Monster25","Monster26","Monster2","Monster4","Monster5","Monster6","Monster15","Monster16"];
         }
         else if(gc.klsmode == 2)
         {
            waitForRegisterDataArray = ["Monster35","Monster36","Monster38","Monster37"];
         }
      }
      
      override public function start() : void
      {
         var _loc1_:int = 0;
         super.start();
         if(gc.klsmode == 1)
         {
            this.monsterarray = [4,2,5,25,6,16,15,24,21,20,22,26];
            _loc1_ = 0;
            while(_loc1_ < this.monsterarray.length)
            {
               MainGame.getInstance().createMonster(this.monsterarray[_loc1_],500 + _loc1_ * 70,300);
               _loc1_++;
            }
         }
         else if(gc.klsmode == 2)
         {
            this.monsterarray = [35,36,38,37];
            _loc1_ = 0;
            while(_loc1_ < this.monsterarray.length)
            {
               MainGame.getInstance().createMonster(this.monsterarray[_loc1_],500 + _loc1_ * 70,300);
               _loc1_++;
            }
         }
         this.gc.klsmode = null;
         this.loadGameSenceSource();
      }
      
      public function loadGameSenceSource() : void
      {
         var _loc1_:* = null;
         var _loc2_:uint = uint(gc.gameSence.numChildren);
         var _loc3_:int = 0;
         while(_loc3_ < _loc2_)
         {
            _loc1_ = gc.gameSence.getChildAt(_loc3_);
            if(_loc1_ is MovieClip)
            {
               if(MovieClip(_loc1_).name == "rwDoor")
               {
                  this.rwDoor = _loc1_ as MovieClip;
                  this.rwDoor.buttonMode = true;
                  this.rwDoor.tabEnabled = false;
               }
               else if(MovieClip(_loc1_).name == "pkDoor")
               {
                  this.pkDoor = _loc1_ as MovieClip;
                  this.pkDoor.buttonMode = true;
                  this.pkDoor.tabEnabled = false;
               }
            }
            _loc3_++;
         }
      }
      
      private function checkZuobi() : Boolean
      {
         var _loc1_:* = null;
         for each(_loc1_ in gc.getPlayerArray())
         {
            if(_loc1_.roleProperies.getSHHP() >= 99999 || _loc1_.roleProperies.getPower() >= 5000 || _loc1_.roleProperies.getCrit() >= 200 || _loc1_.roleProperies.getMiss() >= 200 || _loc1_.roleProperies.getMagicDef() >= 200)
            {
               return true;
            }
         }
         return false;
      }
      
      public function checkRwOrPk() : void
      {
         var _loc1_:Boolean = false;
         if(gc.hero1)
         {
            if(gc.hero1.colipse.hitTestObject(this.pkDoor))
            {
               _loc1_ = true;
            }
         }
         if(gc.hero2)
         {
            if(gc.hero2.colipse.hitTestObject(this.pkDoor))
            {
               _loc1_ = true;
            }
         }
         if(_loc1_)
         {
            if(this.checkZuobi())
            {
               System.pause();
            }
            gc.gameInfo.showArenaSprite();
            return;
         }
         if(gc.hero1)
         {
            if(gc.hero1.colipse.hitTestObject(this.rwDoor))
            {
               _loc1_ = true;
            }
         }
         if(gc.hero2)
         {
            if(gc.hero2.colipse.hitTestObject(this.rwDoor))
            {
               _loc1_ = true;
            }
         }
         if(_loc1_)
         {
            gc.keyboardControl.stopAllControl();
            gc.eventManger.dispatchEvent(new CommonEvent("ShowTaskInterface"));
         }
      }
      
      override public function step() : void
      {
         super.step();
      }
      
      override public function destroy() : void
      {
         super.destroy();
      }
   }
}

