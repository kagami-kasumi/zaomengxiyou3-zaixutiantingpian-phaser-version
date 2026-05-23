package export.muti
{
   import config.*;
   import flash.display.*;
   import flash.text.TextField;
   import user.MutiUser;
   
   public class SingleOtherUserInfo extends Sprite
   {
      
      public var bg:MovieClip;
      
      public var headSprite:MovieClip;
      
      public var uName:TextField;
      
      public var level:TextField;
      
      private var mutiUsers:MutiUser;
      
      private var hpShape:Shape;
      
      private var isClose:Boolean = false;
      
      private var isEmpty:Boolean = true;
      
      private var gc:Config;
      
      public function SingleOtherUserInfo()
      {
         super();
         this.gc = Config.getInstance();
         this.hpShape = new Shape();
         this.hpShape.x = 3;
         this.hpShape.y = 2;
         this.addChild(this.hpShape);
         this.uName.selectable = false;
         this.level.selectable = false;
         this.uName.text = "";
         this.level.text = "";
      }
      
      public function close() : void
      {
         this.isClose = true;
         this.mutiUsers = null;
         this.hpShape.graphics.clear();
         this.headSprite.gotoAndStop(1);
         this.uName.text = "";
         this.level.text = "";
         this.bg.gotoAndStop(2);
      }
      
      public function open() : void
      {
         this.isClose = false;
         this.bg.gotoAndStop(1);
      }
      
      public function setEmpty() : void
      {
         this.isEmpty = true;
         this.headSprite.gotoAndStop(1);
         this.uName.text = "";
         this.level.text = "";
         this.hpShape.graphics.clear();
         this.mutiUsers = null;
      }
      
      public function isEmptyd() : Boolean
      {
         return this.isEmpty;
      }
      
      public function isClosed() : Boolean
      {
         return this.isClose;
      }
      
      public function addMutiUserInfo(param1:MutiUser) : void
      {
         this.isEmpty = false;
         this.mutiUsers = param1;
         this.headSprite.gotoAndStop(this.mutiUsers.roleId + 1);
         this.uName.text = this.mutiUsers.uName;
         this.level.text = this.mutiUsers.level.toString();
      }
      
      public function getSid() : uint
      {
         if(this.mutiUsers)
         {
            return this.mutiUsers.sid;
         }
         return 0;
      }
      
      public function step() : void
      {
         if(Boolean(this.isClose) || Boolean(this.isEmpty))
         {
            return;
         }
         if(this.gc.nodeInfo.isStartIng())
         {
            this.drawHp();
         }
      }
      
      private function drawHp() : void
      {
         var _loc1_:Number = Number(NaN);
         var _loc2_:Number = Number(NaN);
         this.hpShape.graphics.clear();
         if(this.mutiUsers)
         {
            _loc1_ = Number(this.mutiUsers.hp) / Number(this.mutiUsers.shp);
            if(_loc1_ >= 0 && _loc1_ <= 1)
            {
               _loc2_ = _loc1_ * 60;
               this.hpShape.graphics.beginFill(16711680,0.5);
               this.hpShape.graphics.drawRect(0,60 - _loc2_,59,_loc2_);
               this.hpShape.graphics.endFill();
            }
         }
      }
   }
}

