package export.huodong.newyear
{
   import config.*;
   import flash.display.MovieClip;
   import flash.display.SimpleButton;
   import flash.display.Sprite;
   import flash.events.*;
   import flash.utils.*;
   
   public class ChineseNewYear extends Sprite
   {
      
      public var backbtn:SimpleButton;
      
      public var bigRedPack:SimpleButton;
      
      public var b22:MovieClip;
      
      public var b23:MovieClip;
      
      public var b24:MovieClip;
      
      public var b25:MovieClip;
      
      public var b26:MovieClip;
      
      public var b27:MovieClip;
      
      public var b28:MovieClip;
      
      public var b29:MovieClip;
      
      private var today:String = "";
      
      public function ChineseNewYear()
      {
         super();
      }
      
      public static function getRedPack(param1:MouseEvent) : void
      {
         var _loc2_:int = 0;
         var _loc3_:* = undefined;
         var _loc4_:Config = getDefinitionByName("config::Config").getInstance();
         var _loc5_:Array = [["wpxt","wptm","wpsc"],["jf","xhb"],["wpxm","wpll","wplh","wpsg","yhs","tss"],["gfcstx","_ssggjtg","lsg"]];
         var _loc6_:int = 1;
         if(AUtils.judgeRandom(0.05))
         {
            _loc2_ = 3;
            _loc6_ = 1;
            _loc3_ = _loc4_.allEquip.findByName(_loc5_[_loc2_][Math.round(Math.random() * (_loc5_[_loc2_].length - 1))]);
            _loc4_.player1.zblist.push(_loc3_);
            _loc4_.alert("恭喜获得" + _loc3_.ename + " x 1!");
            if(_loc3_ == "gfcstx")
            {
               _loc4_.Objectdata.gm = true;
            }
         }
         else if(AUtils.judgeRandom(3))
         {
            _loc2_ = 2;
            _loc6_ = Math.round(Math.random() * 2);
            _loc3_ = _loc5_[_loc2_][Math.round(Math.random() * (_loc5_[_loc2_].length - 1))];
            if(_loc4_.player1.roleid > 0)
            {
               _loc4_.putQhsInBackPack(_loc4_.player1,_loc3_,_loc6_);
            }
            if(_loc4_.player2.roleid > 0)
            {
               _loc4_.putQhsInBackPack(_loc4_.player2,_loc3_,_loc6_);
            }
            _loc4_.alert("恭喜获得" + _loc4_.allEquip.findByName(_loc3_).ename + " x 1!");
         }
         else if(AUtils.judgeRandom(8))
         {
            _loc2_ = 1;
            if(AUtils.judgeRandom(50))
            {
               _loc6_ = 20 + Math.round(Math.random() * 5);
               _loc4_.Objectdata.turntableScore += _loc6_;
               _loc4_.alert("恭喜获得" + _loc6_ + "积分！");
            }
            else
            {
               _loc6_ = 2 + Math.round(Math.random() * 5);
               if(_loc4_.player1.roleid > 0)
               {
                  _loc4_.putQhsInBackPack(_loc4_.player1,"xhb",_loc6_);
               }
               if(_loc4_.player2.roleid > 0)
               {
                  _loc4_.putQhsInBackPack(_loc4_.player2,"xhb",_loc6_);
               }
               _loc4_.alert("恭喜获得" + _loc6_ + "仙魂币！");
            }
         }
         else
         {
            _loc2_ = 0;
            _loc6_ = 15 + Math.round(Math.random() * 40);
            _loc3_ = _loc5_[_loc2_][Math.round(Math.random() * (_loc5_[_loc2_].length - 1))];
            if(_loc4_.player1.roleid > 0)
            {
               _loc4_.putQhsInBackPack(_loc4_.player1,_loc3_,_loc6_);
            }
            if(_loc4_.player2.roleid > 0)
            {
               _loc4_.putQhsInBackPack(_loc4_.player2,_loc3_,_loc6_);
            }
            _loc4_.alert("恭喜获得" + _loc4_.allEquip.findByName(_loc3_).ename + " x " + _loc6_ + "!");
         }
      }
      
      private function added(param1:Event) : void
      {
      }
      
      private function removed(param1:Event) : void
      {
         if(this.parent)
         {
            parent.removeChild(this);
         }
      }
   }
}

