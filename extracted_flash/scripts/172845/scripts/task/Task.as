package task
{
   import flash.utils.*;
   
   public class Task
   {
      
      private var rwid:uint;
      
      private var rwname:String;
      
      private var rwdict:String;
      
      private var rwneedAry:Array;
      
      public var rwaward:Array;
      
      private var isComplete:Boolean = false;
      
      private var hasGetAward:Boolean = false;
      
      public var allaward:Array;
      
      public function Task(param1:uint, param2:String, param3:String, param4:Array, param5:Array)
      {
         this.rwaward = new Array();
         super();
         this.rwid = param1;
         this.rwname = param2;
         this.rwdict = param3;
         this.rwneedAry = param4;
         this.allaward = param5;
      }
      
      public function getrwId() : uint
      {
         return this.rwid;
      }
      
      public function getrwname() : String
      {
         return this.rwname;
      }
      
      public function getrwdict() : String
      {
         return this.rwdict;
      }
      
      public function setHasGetAward(param1:Boolean) : void
      {
         this.hasGetAward = param1;
      }
      
      public function getHasGetAward() : Boolean
      {
         return this.hasGetAward;
      }
      
      public function getAllAward() : Array
      {
         return this.allaward;
      }
      
      public function getTaskPro() : String
      {
         var _loc1_:String = "";
         var _loc2_:uint = uint(this.rwneedAry.length);
         var _loc3_:int = 0;
         while(_loc3_ < _loc2_)
         {
            _loc1_ += this.rwneedAry[_loc3_].name + " " + this.rwneedAry[_loc3_].curhas + "/" + this.rwneedAry[_loc3_].neednum + "  ";
            _loc3_++;
         }
         return _loc1_;
      }
      
      private function enCurHas(param1:int) : int
      {
         return param1 * 100 + 201;
      }
      
      private function deCurHas(param1:int) : int
      {
         return (param1 - 201) / 100;
      }
      
      public function judgeNeed(param1:String) : Boolean
      {
         var _loc2_:uint = uint(this.rwneedAry.length);
         var _loc3_:int = 0;
         while(_loc3_ < _loc2_)
         {
            if(this.rwneedAry[_loc3_].mname == param1)
            {
               if(this.rwneedAry[_loc3_].curhas < this.rwneedAry[_loc3_].neednum)
               {
                  ++this.rwneedAry[_loc3_].curhas;
                  return true;
               }
            }
            _loc3_++;
         }
         this.judgeComplete();
         return false;
      }
      
      public function hasChangeTask() : Boolean
      {
         var _loc1_:uint = uint(this.rwneedAry.length);
         var _loc2_:int = 0;
         while(_loc2_ < _loc1_)
         {
            if(this.rwneedAry[_loc2_].curhas > 0)
            {
               return true;
            }
            _loc2_++;
         }
         return false;
      }
      
      public function judgeComplete() : Boolean
      {
         var _loc1_:uint = 0;
         var _loc2_:* = getDefinitionByName("config::Config").getInstance();
         if(!_loc2_ || !_loc2_.player1)
         {
            return false;
         }
         if(this.rwid > 100)
         {
            return this.judgeAtask(this.rwid);
         }
         _loc1_ = uint(this.rwneedAry.length);
         while(_loc1_-- > 0)
         {
            if(this.rwneedAry[_loc1_].curhas < this.rwneedAry[_loc1_].neednum)
            {
               return false;
            }
         }
         this.isComplete = true;
         return true;
      }
      
      private function judgeAtask(param1:int) : Boolean
      {
         var _loc2_:* = getDefinitionByName("config::Config").getInstance();
         if(!_loc2_ || !_loc2_.player1)
         {
            return false;
         }
         switch(param1 - 100)
         {
            case 1:
               if(_loc2_.player1.getSomeEquipInPackBackByName("tjbg"))
               {
                  return !this.hasGetAward;
               }
               return false;
               break;
            case 2:
               if(_loc2_.player1.getSomeEquipInPackBackByName("lxfb"))
               {
                  if(_loc2_.player1.getSomeEquipInPackBackByName("sxfb"))
                  {
                     if(_loc2_.player1.getSomeEquipInPackBackByName("yxfb"))
                     {
                        return !this.hasGetAward;
                     }
                  }
               }
               return false;
            default:
               return false;
         }
      }
      
      public function getSave() : String
      {
         var _loc1_:uint = uint(this.rwneedAry.length);
         var _loc2_:* = this.rwid + "";
         var _loc3_:int = 0;
         while(_loc3_ < _loc1_)
         {
            _loc2_ += "|" + this.rwneedAry[_loc3_].curhas;
            _loc3_++;
         }
         return _loc2_ + ("|" + this.isComplete + "|" + this.hasGetAward);
      }
      
      public function setSave(param1:String) : Boolean
      {
         var _loc2_:Array = null;
         var _loc3_:* = 0;
         var _loc4_:int = 0;
         _loc2_ = param1.split("|");
         if(_loc2_[0] == this.rwid)
         {
            _loc3_ = uint(this.rwneedAry.length);
            _loc4_ = 0;
            while(_loc4_ < _loc3_)
            {
               this.rwneedAry[_loc4_].curhas = _loc2_[_loc4_ + 1];
               _loc4_++;
            }
            this.isComplete = _loc2_[_loc3_ + 1];
            if(_loc2_[_loc3_ + 2] == true || _loc2_[_loc3_ + 2] == "true")
            {
               this.hasGetAward = true;
            }
            else
            {
               this.hasGetAward = false;
            }
            return true;
         }
         return false;
      }
   }
}

