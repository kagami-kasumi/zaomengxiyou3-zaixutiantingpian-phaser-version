package base
{
   import com.greensock.*;
   import config.*;
   import flash.display.*;
   import flash.geom.*;
   import my.*;
   
   public class BaseLevelListenering
   {
      
      private static var _this:BaseLevelListenering;
      
      protected var gc:Config;
      
      public var waitForRegisterDataArray:Array;
      
      protected var waitForRegisterSprite:Sprite;
      
      public var waitForRegisterDataArrayClone:Array;
      
      private var blackBg:Sprite;
      
      private var counter:int;
      
      private var surpressLevel:int;
      
      private var surpressNum:int;
      
      private var needSurpress:Boolean = false;
      
      public function BaseLevelListenering()
      {
         this.waitForRegisterDataArray = [];
         this.waitForRegisterDataArrayClone = [];
         super();
         this.gc = Config.getInstance();
         if(!_this)
         {
            _this = this;
         }
      }
      
      public static function getInstance() : BaseLevelListenering
      {
         return _this;
      }
      
      public function init() : void
      {
         this.waitForRegisterSprite = AUtils.getNewObj("waitForBitmapDataRegister") as Sprite;
         GMain.getInstance().getTopSence().addChild(this.waitForRegisterSprite);
         this.waitForRegisterDataArrayClone = AUtils.clone(this.waitForRegisterDataArray) as Array;
         this.registerData();
      }
      
      public function registerData(param1:Boolean = true) : void
      {
         var isinit:Boolean = param1;
         var str:String = null;
         if(this.waitForRegisterDataArray.length > 0)
         {
            str = this.waitForRegisterDataArray.shift().toString();
            if(BaseBitmapDataPool.hasRegisteredData(str))
            {
               if(isinit)
               {
                  this.registerData();
               }
               else
               {
                  this.registerData(false);
               }
               return;
            }
            BaseBitmapDataPool.registerData(str);
            if(this.waitForRegisterDataArray.length > 0 && isinit)
            {
               TweenMax.delayedCall(0.1,function(param1:BaseLevelListenering):*
               {
                  param1.registerData();
               },[this]);
            }
            else
            {
               this.start();
            }
         }
         else if(isinit)
         {
            this.start();
         }
      }
      
      public function start() : void
      {
         var _loc1_:BaseHero = null;
         if(GMain.getInstance().getTopSence().contains(this.waitForRegisterSprite))
         {
            GMain.getInstance().getTopSence().removeChild(this.waitForRegisterSprite);
         }
         this.gc.pWorld.pWorldStart();
         this.gc.obbsiteArray = this.gc.pWorld.monsterArray;
         for each(_loc1_ in this.gc.getPlayerArray())
         {
            if(HackChecker.checkAttribute(_loc1_))
            {
               HackChecker.hackHandler();
            }
         }
      }
      
      public function start1() : void
      {
      }
      
      public function start2() : void
      {
      }
      
      public function keyBoardDownForW(param1:BaseHero) : void
      {
      }
      
      public function step() : void
      {
         var _loc1_:* = undefined;
         var _loc2_:* = undefined;
         this.drawBlackBG();
         if(this.needSurpress)
         {
            if(this.gc.getAverageLevel() < this.surpressLevel)
            {
               if(this.counter != 0)
               {
                  --this.counter;
                  return;
               }
               for each(_loc2_ in this.gc.getPlayerAndPetArray())
               {
                  if(_loc2_ is BaseHero)
                  {
                     _loc1_ = (this.surpressLevel - this.gc.getAverageLevel()) * this.surpressNum;
                     if(_loc1_ > 0)
                     {
                        BaseHero(_loc2_).reduceHp(_loc1_);
                     }
                  }
               }
               this.counter = this.gc.frameClips;
            }
         }
      }
      
      public function startBlackBG() : void
      {
         if(!this.blackBg)
         {
            this.blackBg = new Sprite();
            this.blackBg.blendMode = "layer";
            this.gc.gameInfo.addChildAt(this.blackBg,0);
         }
      }
      
      public function stopBlackBG() : void
      {
         if(this.blackBg)
         {
            this.blackBg.graphics.clear();
            while(this.blackBg.numChildren > 0)
            {
               this.blackBg.removeChildAt(0);
            }
            if(this.gc.gameInfo)
            {
               if(this.gc.gameInfo.contains(this.blackBg))
               {
                  this.gc.gameInfo.removeChild(this.blackBg);
               }
            }
            this.blackBg = null;
         }
      }
      
      public function isInBlack() : Boolean
      {
         return this.blackBg;
      }
      
      public function setSurpressLevel(param1:int, param2:int) : void
      {
         this.needSurpress = true;
         this.surpressLevel = param1;
         this.surpressNum = param2;
      }
      
      private function drawBlackBG() : void
      {
         var _loc1_:int = 0;
         var _loc2_:* = undefined;
         var _loc3_:* = undefined;
         var _loc4_:* = null;
         var _loc5_:* = null;
         _loc4_ = null;
         _loc5_ = null;
         var _loc6_:Point = new Point();
         if(this.blackBg)
         {
            while(this.blackBg.numChildren > 0)
            {
               this.blackBg.removeChildAt(0);
            }
            this.blackBg.graphics.clear();
            this.blackBg.graphics.beginFill(0,1);
            this.blackBg.graphics.drawRect(0,0,940,590);
            this.blackBg.graphics.endFill();
            _loc1_ = 0;
            _loc2_ = this.gc.getPlayerArray();
            for each(_loc3_ in this.gc.getPlayerArray())
            {
               _loc4_ = this.gc.gameSence.localToGlobal(new Point(_loc3_.x,_loc3_.y));
               _loc5_ = AUtils.getNewObj("ViewMask") as Sprite;
               _loc5_.blendMode = "erase";
               _loc5_.x = _loc4_.x;
               _loc5_.y = _loc4_.y;
               this.blackBg.addChild(_loc5_);
            }
            _loc6_ = this.gc.gameInfo.localToGlobal(new Point(this.gc.gameInfo.x,this.gc.gameInfo.y));
            this.blackBg.x = _loc6_.x;
            this.blackBg.y = 0;
         }
      }
      
      public function getmonsterarray() : Array
      {
         return this.waitForRegisterDataArrayClone;
      }
      
      public function destroy() : void
      {
         var _loc1_:* = null;
         while(this.waitForRegisterDataArrayClone.length > 0)
         {
            _loc1_ = this.waitForRegisterDataArrayClone.shift().toString();
            BaseBitmapDataPool.removeData(_loc1_);
         }
         this.stopBlackBG();
         this.waitForRegisterDataArrayClone = null;
         this.waitForRegisterSprite = null;
         this.blackBg = null;
         _this = null;
      }
   }
}

