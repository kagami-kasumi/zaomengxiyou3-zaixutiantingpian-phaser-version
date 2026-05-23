package export
{
   import base.*;
   import config.*;
   import flash.display.MovieClip;
   import flash.events.*;
   import flash.geom.*;
   
   [Embed(source="/_assets/assets.swf", symbol="symbol98")]
   public class StopPoint extends MovieClip
   {
      
      public var betweenRandL:int = 1150;
      
      public var idx:int;
      
      public var isBoss:Boolean;
      
      private var data:Point;
      
      public var isSendMonster:Boolean = false;
      
      private var gc:Config;
      
      private var isFirstZero:Boolean = true;
      
      public var stophere:MovieClip;
      
      public var isAlive:Boolean = true;
      
      public function StopPoint()
      {
         this.data = new Point();
         super();
         this.gc = Config.getInstance();
         if(this.gc.curStage == 8 && this.gc.curLevel == 1)
         {
            this.betweenRandL = 1400;
         }
      }
      
      public function setXY(param1:Number, param2:Number) : void
      {
         this.data.x = param1;
         this.data.y = param2;
      }
      
      public function touch() : void
      {
         var _loc1_:int = 0;
         var _loc2_:* = null;
         if(!this.isSendMonster)
         {
            this.isSendMonster = true;
            this.isAlive = true;
            _loc1_ = 0;
            while(_loc1_ < this.gc.pWorld.getMonsterAppearArray().length)
            {
               _loc2_ = MonsterAppearPoint(this.gc.pWorld.getMonsterAppearArray()[_loc1_]);
               if(_loc2_.stopPointIdx == this.idx)
               {
                  _loc2_.start();
               }
               _loc1_++;
            }
         }
         if(!this.hasEventListener(Event.ENTER_FRAME))
         {
            this.addEventListener(Event.ENTER_FRAME,this.__enterFrame);
         }
      }
      
      private function __enterFrame(param1:Event) : void
      {
         var _loc2_:* = null;
         var _loc3_:Boolean = true;
         var _loc4_:int = 0;
         while(_loc4_ < this.gc.pWorld.getMonsterAppearArray().length)
         {
            _loc2_ = MonsterAppearPoint(this.gc.pWorld.getMonsterAppearArray()[_loc4_]);
            if(_loc2_.stopPointIdx == this.idx)
            {
               if(!_loc2_.isOver)
               {
                  _loc3_ = false;
                  break;
               }
            }
            _loc4_++;
         }
         if(_loc3_ && this.gc.pWorld.monsterArray.length == 0 && this.gc.curStage != 60)
         {
            this.destroy();
         }
      }
      
      public function destroy() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = this.gc.pWorld.getStopPointArray();
         var _loc3_:int = int(_loc2_.indexOf(this));
         if(_loc3_ != this.gc.pWorld.getStopPointArray().length - 1)
         {
            if(!this.gc.isInHost() && this.gc.curStage != 60)
            {
               this.gc.vControllor.setAutoCamera();
               if(this.idx < 4)
               {
                  _loc1_ = AUtils.getNewObj("GOGO");
                  _loc1_.x = 860;
                  _loc1_.y = 5 * 60;
                  _loc1_.scaleX = 0.7;
                  _loc1_.scaleY = 0.7;
                  this.gc.gameInfo.addChild(_loc1_);
               }
            }
         }
         if(_loc3_ != -1)
         {
            _loc2_.splice(_loc3_,1);
         }
         this.isAlive = false;
         this.removeEventListener(Event.ENTER_FRAME,this.__enterFrame);
      }
      
      public function getLeftDataX() : Number
      {
         return this.betweenRandL - 940;
      }
      
      public function getDataX() : Number
      {
         return this.data.x;
      }
   }
}

