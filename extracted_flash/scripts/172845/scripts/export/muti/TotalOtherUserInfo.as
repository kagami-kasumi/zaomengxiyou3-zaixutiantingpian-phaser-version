package export.muti
{
   import config.*;
   import flash.display.Sprite;
   import user.MutiUser;
   
   public class TotalOtherUserInfo extends Sprite
   {
      
      public var o1:Sprite;
      
      public var o2:Sprite;
      
      public var o3:Sprite;
      
      public var o4:Sprite;
      
      public var o5:Sprite;
      
      public var o6:Sprite;
      
      private var gc:Config;
      
      private var posArray:Array;
      
      private var singArray:Array;
      
      public function TotalOtherUserInfo()
      {
         var _loc1_:* = 0;
         var _loc2_:* = null;
         this.posArray = [[11,13],[75,13],[153,13],[218,13],[297,13],[6 * 60,13]];
         this.singArray = [];
         super();
         var _loc3_:int = 0;
         while(_loc3_ < 6)
         {
            _loc2_ = new SingleOtherUserInfo();
            _loc2_.x = this.posArray[_loc3_][0];
            _loc2_.y = this.posArray[_loc3_][1];
            this.addChild(_loc2_);
            this.singArray.push(_loc2_);
            _loc3_++;
         }
         this.gc = Config.getInstance();
         switch(this.gc.nodeInfo.GameMode)
         {
            case ArenaSprite.ARENASPRITE_MODE_1V1:
               _loc1_ = uint(1 * Number(this.gc.nodeInfo.singleIdPlayerNum));
               while(_loc1_ < 6)
               {
                  SingleOtherUserInfo(this.singArray[_loc1_]).close();
                  _loc1_++;
               }
               break;
            case ArenaSprite.ARENASPRITE_MODE_HUNZHAN:
               _loc1_ = uint(3 * Number(this.gc.nodeInfo.singleIdPlayerNum));
               while(true)
               {
                  if(_loc1_ < 6)
                  {
                     SingleOtherUserInfo(this.singArray[_loc1_]).close();
                     _loc1_++;
                  }
               }
         }
      }
      
      public function step() : void
      {
         var _loc1_:int = 0;
         while(_loc1_ < 6)
         {
            SingleOtherUserInfo(this.singArray[_loc1_]).step();
            _loc1_++;
         }
      }
      
      public function addOne(param1:MutiUser) : void
      {
         var _loc2_:int = 0;
         while(_loc2_ < 6)
         {
            if(SingleOtherUserInfo(this.singArray[_loc2_]).isEmptyd())
            {
               SingleOtherUserInfo(this.singArray[_loc2_]).addMutiUserInfo(param1);
               break;
            }
            _loc2_++;
         }
      }
      
      public function removeOne(param1:uint) : void
      {
         var _loc2_:int = 0;
         while(_loc2_ < 6)
         {
            if(SingleOtherUserInfo(this.singArray[_loc2_]).getSid() == param1)
            {
               SingleOtherUserInfo(this.singArray[_loc2_]).setEmpty();
            }
            _loc2_++;
         }
      }
      
      public function clear() : void
      {
         var _loc1_:int = 0;
         while(_loc1_ < 6)
         {
            SingleOtherUserInfo(this.singArray[_loc1_]).setEmpty();
            _loc1_++;
         }
      }
   }
}

