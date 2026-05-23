package export.muti
{
   import flash.display.MovieClip;
   import flash.display.Sprite;
   import flash.text.TextField;
   
   public class RoomTitle extends Sprite
   {
      
      private var maxPlayerNum:uint;
      
      public var playerNumTxt:TextField;
      
      public var roomIdTxt:TextField;
      
      public var roomNameTxt:TextField;
      
      public var roomMode:MovieClip;
      
      public var playersPerIdTxt:TextField;
      
      public var levelTxt:TextField;
      
      public var mapInfo:uint;
      
      private var _level:uint;
      
      private var _playersPerId:uint;
      
      public function RoomTitle()
      {
         super();
      }
      
      public function updateInfo(param1:uint, param2:uint, param3:uint, param4:String) : void
      {
         var _loc5_:* = null;
         var _loc6_:* = null;
         if(param4 != "")
         {
            _loc5_ = param4.split(",");
            if(param1 < 9)
            {
               _loc6_ = "0" + (param1 + 1);
            }
            else
            {
               _loc6_ = (param1 + 1).toString();
            }
            this.roomIdTxt.text = _loc6_ + "";
            this.playerNumTxt.text = "(" + param2 + "/" + param3 + ")";
            this.roomNameTxt.text = "房间->" + _loc5_[0] + "";
            this.roomMode.gotoAndStop(parseInt(_loc5_[1]));
            this.mapInfo = parseInt(_loc5_[2]);
            this.levelTxt.text = "lv." + _loc5_[3] + "";
            this._level = parseInt(_loc5_[3]);
            this.playersPerIdTxt.text = parseInt(_loc5_[4]) == 1 ? "单人房" : "双人房";
            this._playersPerId = parseInt(_loc5_[4]);
         }
      }
      
      public function setMaxPlayerNum(param1:uint) : void
      {
         this.maxPlayerNum = param1;
      }
      
      public function getMapInfo() : uint
      {
         return this.mapInfo;
      }
      
      public function getLevel() : uint
      {
         return this._level;
      }
      
      public function getPlayersPerId() : uint
      {
         return this._playersPerId;
      }
   }
}

