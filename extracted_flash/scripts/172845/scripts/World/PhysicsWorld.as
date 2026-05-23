package World
{
   import base.*;
   import config.*;
   import export.*;
   import export.level.*;
   import flash.display.*;
   import flash.system.*;
   import my.*;
   
   public class PhysicsWorld
   {
      
      private var wallArray:Array;
      
      private var stopPointArray:Array;
      
      private var monsterDisappertPointArray:Array;
      
      private var markArray:Array;
      
      private var continueArray:Array;
      
      private var transferDoorArray:Array;
      
      private var auraArray:Array;
      
      private var otherHeroArray:Array;
      
      private var otherHeroUserArray:*;
      
      private var baseLevelListener:BaseLevelListenering;
      
      private var stageListener01:StageListener01;
      
      private var stageListener02:StageListener02;
      
      private var stageListener11:StageListener11;
      
      private var stageListener12:StageListener12;
      
      private var stageListener13:StageListener13;
      
      private var stageListener21:StageListener21;
      
      private var stageListener22:StageListener22;
      
      private var stageListener23:StageListener23;
      
      private var stageListener31:StageListener31;
      
      private var stageListener32:StageListener32;
      
      private var stageListener33:StageListener33;
      
      private var stageListener41:StageListener41;
      
      private var stageListener42:StageListener42;
      
      private var stageListener51:StageListener51;
      
      private var stageListener61:StageListener61;
      
      private var stageListener71:StageListener71;
      
      private var stageListener81:StageListener81;
      
      private var stageListener91:StageListener91;
      
      private var stageListener101:StageListener101;
      
      private var stageListener121:StageListener121;
      
      private var stageListener122:StageListener122;
      
      private var stageListener123:StageListener123;
      
      private var stageListener124:StageListener124;
      
      private var stageListener125:StageListener125;
      
      private var stageListener131:StageListener131;
      
      private var stageListener141:StageListener141;
      
      private var stageListener142:StageListener142;
      
      private var stageListener151:StageListener151;
      
      private var stageListener161:StageListener161;
      
      private var stageListener173:StageListener173;
      
      private var stageListener181:StageListener181;
      
      private var stageListener201:StageListener201;
      
      private var stageListener211:StageListener211;
      
      private var stageListener212:StageListener212;
      
      private var stageListener213:StageListener213;
      
      private var stageListener221:StageListener221;
      
      private var stageListener222:StageListener222;
      
      private var stageListener231:StageListener231;
      
      private var stageListener232:StageListener232;
      
      private var stageListener233:StageListener233;
      
      private var stageListener301:StageListener301;
      
      private var stageListener431:StageListener431;
      
      private var stageListener451:StageListener451;
      
      private var stageListener461:StageListener461;
      
      private var stageListener981:StageListener981;
      
      private var stageListener991:StageListener991;
      
      private var stageListener531:StageListener531;
      
      private var stageListener1161:StageListener1161;
      
      private var stageListener441:StageListener441;
      
      private var stageListener442:StageListener442;
      
      private var stageListener443:StageListener443;
      
      private var otherArray:Array;
      
      private var isSourceReady:Boolean = false;
      
      public var monsterArray:Array;
      
      public var heroArray:Array;
      
      public var likeMonsterArray:Array;
      
      private var gc:Config;
      
      public function PhysicsWorld()
      {
         this.wallArray = [];
         this.stopPointArray = [];
         this.monsterDisappertPointArray = [];
         this.markArray = [];
         this.continueArray = [];
         this.transferDoorArray = [];
         this.auraArray = [];
         this.otherHeroArray = [];
         this.otherHeroUserArray = [];
         this.otherArray = [];
         this.monsterArray = new Array();
         this.heroArray = new Array();
         this.likeMonsterArray = new Array();
         super();
         this.gc = Config.getInstance();
      }
      
      public function addSubObj(param1:*) : void
      {
         var _loc2_:* = null;
         var _loc3_:* = null;
         var _loc4_:int = 0;
         var _loc5_:* = null;
         if(param1 is MovieClip)
         {
            _loc2_ = param1 as MovieClip;
            if(_loc2_.getChildByName("isWall"))
            {
               if(_loc2_.rotation == 0)
               {
                  this.wallArray.push(_loc2_ as MovieClip);
               }
               else
               {
                  this.wallArray.unshift(_loc2_ as MovieClip);
               }
               if(this.gc.isHideDebug)
               {
                  _loc2_.visible = false;
               }
            }
            if(_loc2_.getChildByName("isThroughWall"))
            {
               this.wallArray.push(_loc2_ as MovieClip);
               if(this.gc.isHideDebug)
               {
                  _loc2_.visible = false;
               }
            }
            if(_loc2_.getChildByName("isThroughUpButDownWall"))
            {
               this.wallArray.push(_loc2_ as MovieClip);
               if(this.gc.isHideDebug)
               {
                  _loc2_.visible = false;
               }
            }
            if(_loc2_.getChildByName("isThroughDownButUpWall"))
            {
               this.wallArray.push(_loc2_ as MovieClip);
               if(this.gc.isHideDebug)
               {
                  _loc2_.visible = false;
               }
            }
            if(_loc2_.getChildByName("noContinueGo"))
            {
               this.continueArray.push(_loc2_ as Sprite);
               if(this.gc.isHideDebug)
               {
                  _loc2_.visible = false;
               }
            }
            if(_loc2_.getChildByName("isTransferDoor"))
            {
               this.transferDoorArray.push(_loc2_ as Sprite);
               if(this.gc.curStage != 0)
               {
                  _loc2_.visible = false;
               }
            }
            if(_loc2_.getChildByName("monsterDisapperaPoint"))
            {
               this.monsterDisappertPointArray.push(_loc2_);
               if(this.gc.isHideDebug)
               {
                  _loc2_.visible = false;
               }
            }
            if(_loc2_.getChildByName("isHideWall"))
            {
               this.otherArray.push(_loc2_);
               if(this.gc.isHideDebug)
               {
                  _loc2_.visible = false;
               }
            }
            if(_loc2_.getChildByName("stophere"))
            {
               _loc3_ = new StopPoint();
               _loc3_.setXY(_loc2_.x,_loc2_.y);
               if(this.stopPointArray.length > 0)
               {
                  _loc4_ = 0;
                  while(_loc4_ < this.stopPointArray.length)
                  {
                     _loc5_ = this.stopPointArray[_loc4_] as StopPoint;
                     if(_loc5_.getDataX() >= _loc2_.x)
                     {
                        this.stopPointArray.splice(_loc4_,0,_loc3_);
                        break;
                     }
                     if(_loc4_ == this.stopPointArray.length - 1)
                     {
                        this.stopPointArray.splice(_loc4_ + 1,0,_loc3_);
                        break;
                     }
                     _loc4_++;
                  }
               }
               else
               {
                  this.stopPointArray.push(_loc3_);
               }
               if(this.gc.isHideDebug)
               {
                  _loc2_.visible = false;
               }
            }
         }
      }
      
      public function pWorldInit() : void
      {
         this.baseLevelListener = AUtils.getNewObj("export.level.StageListener" + this.gc.curStage + this.gc.curLevel) as BaseLevelListenering;
         this.baseLevelListener.init();
      }
      
      public function pWorldStart() : void
      {
         var _loc1_:* = null;
         this.gc.keyboardControl = new KeyBoardControl(this.gc.stage);
         this.gc.vControllor = new ViewControllor();
         var _loc2_:int = 0;
         while(_loc2_ < this.stopPointArray.length)
         {
            _loc1_ = StopPoint(this.stopPointArray[_loc2_]);
            _loc1_.idx = _loc2_;
            _loc2_++;
         }
         this.gc.createHero();
         this.gc.gameInfo = new GameInfo();
         GMain.getInstance().getMainSence().addChild(this.gc.gameInfo);
         this.isSourceReady = true;
         if(this.gc.curStage == 1 && this.gc.curLevel == 1)
         {
            this.gc.maxMonsterPerScreen = 100;
         }
         else if(this.gc.getPlayerArray().length == 1)
         {
            this.gc.maxMonsterPerScreen = 6;
         }
         else
         {
            this.gc.maxMonsterPerScreen = 8;
         }
      }
      
      public function mapChange() : void
      {
         this.isSourceReady = false;
         this.destroyWhenChangeMap();
         if(this.gc.keyboardControl)
         {
            this.gc.keyboardControl.destroy();
         }
         this.gc.keyboardControl = new KeyBoardControl(this.gc.stage);
         if(this.gc.vControllor)
         {
            this.gc.vControllor.destroy();
         }
         this.gc.vControllor = new ViewControllor();
         this.gc.gameSence.destroy();
         this.gc.gameSence = null;
         this.gc.gameSence = AUtils.getNewObj("export.gameSence.sl" + this.gc.curStage + this.gc.curLevel) as BaseGameSence;
         var _loc1_:int = GMain.getInstance().getMainSence().getChildIndex(this.gc.gameInfo);
         GMain.getInstance().getMainSence().addChildAt(this.gc.gameSence,_loc1_);
         this.gc.createHero();
         this.gc.gameInfo.destroy();
         this.gc.gameInfo = new GameInfo();
         GMain.getInstance().getMainSence().addChild(this.gc.gameInfo);
         this.isSourceReady = true;
      }
      
      public function mutiMapChange() : void
      {
         this.isSourceReady = false;
         this.destroyWhenChangeMap();
         this.gc.gameSence.destroy();
         this.gc.gameSence = null;
         this.gc.gameSence = AUtils.getNewObj("export.gameSence.sl" + this.gc.curStage + this.gc.curLevel) as BaseGameSence;
         var _loc1_:int = GMain.getInstance().getMainSence().getChildIndex(this.gc.gameInfo);
         GMain.getInstance().getMainSence().addChildAt(this.gc.gameSence,_loc1_);
         if(this.baseLevelListener is StageListener01)
         {
            StageListener01(this.baseLevelListener).loadGameSenceSource();
         }
         if(this.gc.hero1)
         {
            if(this.gc.hero1.getPet())
            {
               this.gc.hero1.getPet().speed.y = 0;
               this.gc.hero1.getPet().y = 100;
               this.gc.gameSence.addChild(this.gc.hero1.getPet());
            }
            this.gc.hero1.setStatic();
            this.gc.hero1.getBBDC().turnRight();
            this.gc.hero1.speed.y = 0;
            this.gc.hero1.x = 5 * 60;
            this.gc.hero1.y = 200;
            this.gc.gameSence.addChild(this.gc.hero1);
         }
         if(this.gc.hero2)
         {
            if(this.gc.hero2.getPet())
            {
               this.gc.hero2.getPet().speed.y = 0;
               this.gc.hero2.getPet().y = 100;
               this.gc.gameSence.addChild(this.gc.hero2.getPet());
            }
            this.gc.hero2.setStatic();
            this.gc.hero2.getBBDC().turnRight();
            this.gc.hero2.speed.y = 0;
            this.gc.hero2.x = 5 * 60;
            this.gc.hero2.y = 200;
            this.gc.gameSence.addChild(this.gc.hero2);
         }
         this.gc.setMyData();
         this.isSourceReady = true;
      }
      
      public function getRandomMonster() : BaseMonster
      {
         var _loc1_:int = int(this.monsterArray.length);
         var _loc2_:int = Math.random() * _loc1_;
         return this.monsterArray[_loc2_];
      }
      
      public function getWallArray() : Array
      {
         return this.wallArray;
      }
      
      public function getMarkArray() : Array
      {
         return this.markArray;
      }
      
      public function getNoContinueArray() : Array
      {
         return this.continueArray;
      }
      
      public function getTransferDoorArray() : Array
      {
         return this.transferDoorArray;
      }
      
      public function getOtherHeroArray() : Array
      {
         return this.otherHeroArray;
      }
      
      public function getOtherHeroUserArray() : Array
      {
         return this.otherHeroUserArray;
      }
      
      public function getStopPointArray() : Array
      {
         return this.stopPointArray;
      }
      
      public function getMonsterAppearArray() : Array
      {
         return this.monsterDisappertPointArray;
      }
      
      public function getOtherArray() : Array
      {
         return this.otherArray;
      }
      
      public function getAuraArray() : Array
      {
         return this.auraArray;
      }
      
      public function getBaseLevelListener() : BaseLevelListenering
      {
         return this.baseLevelListener;
      }
      
      private function clearWaitFromParentArray(param1:Array, param2:Array) : void
      {
         var _loc3_:* = undefined;
         var _loc4_:int = 0;
         var _loc5_:int = 0;
         while(param1.length > 0)
         {
            _loc3_ = param1.shift();
            _loc4_ = int(param2.indexOf(_loc3_));
            if(_loc4_ != -1)
            {
               param2.splice(_loc4_,1);
            }
            _loc5_++;
         }
      }
      
      public function step() : void
      {
         var _loc1_:int = 0;
         var _loc2_:* = null;
         var _loc3_:* = 0;
         var _loc4_:* = null;
         var _loc5_:* = null;
         var _loc6_:* = null;
         var _loc7_:* = null;
         if(!this.isSourceReady)
         {
            return;
         }
         if(this.gc.gameInfo)
         {
            this.gc.gameInfo.step();
         }
         var _loc8_:* = [];
         var _loc9_:* = [];
         var _loc10_:uint = this.monsterArray.length;
         while(_loc10_-- > 0)
         {
            if(this.monsterArray[_loc10_])
            {
               _loc4_ = this.monsterArray[_loc10_];
               if(!_loc4_.isReadyToDestroy)
               {
                  _loc3_ = uint(_loc4_.magicBulletArray.length);
                  _loc1_ = 0;
                  while(_loc1_ < _loc3_)
                  {
                     _loc2_ = _loc4_.magicBulletArray[_loc1_] as BaseBullet;
                     if(!_loc2_.isReadyToDestroy)
                     {
                        _loc2_.step2();
                     }
                     if(_loc2_.isReadyToDestroy)
                     {
                        _loc9_.push(_loc2_);
                     }
                     _loc1_++;
                  }
                  this.clearWaitFromParentArray(_loc9_,_loc4_.magicBulletArray);
                  _loc4_.step();
               }
               if(_loc4_.isReadyToDestroy)
               {
                  _loc8_.push(_loc4_);
               }
            }
         }
         this.clearWaitFromParentArray(_loc8_,this.monsterArray);
         _loc10_ = this.heroArray.length;
         while(_loc10_-- > 0)
         {
            if(this.heroArray[_loc10_])
            {
               _loc5_ = this.heroArray[_loc10_];
               _loc3_ = uint(_loc5_.magicBulletArray.length);
               if(!_loc5_.isReadyToDestroy)
               {
                  _loc1_ = 0;
                  while(_loc1_ < _loc3_)
                  {
                     _loc2_ = _loc5_.magicBulletArray[_loc1_] as BaseBullet;
                     if(!_loc2_.isReadyToDestroy)
                     {
                        _loc2_.step2();
                     }
                     if(_loc2_.isReadyToDestroy)
                     {
                        _loc9_.push(_loc2_);
                     }
                     _loc1_++;
                  }
                  this.clearWaitFromParentArray(_loc9_,_loc5_.magicBulletArray);
                  _loc5_.step();
               }
               if(_loc5_.isReadyToDestroy)
               {
                  _loc8_.push(_loc5_);
               }
            }
         }
         this.clearWaitFromParentArray(_loc8_,this.heroArray);
         _loc10_ = uint(this.otherHeroArray.length);
         while(_loc10_-- > 0)
         {
            if(this.otherHeroArray[_loc10_])
            {
               _loc5_ = this.otherHeroArray[_loc10_];
               if(!_loc5_.isReadyToDestroy)
               {
                  _loc3_ = uint(_loc5_.magicBulletArray.length);
                  _loc1_ = 0;
                  while(_loc1_ < _loc3_)
                  {
                     _loc2_ = _loc5_.magicBulletArray[_loc1_] as BaseBullet;
                     if(!_loc2_.isReadyToDestroy)
                     {
                        _loc2_.step2();
                     }
                     if(_loc2_.isReadyToDestroy)
                     {
                        _loc9_.push(_loc2_);
                     }
                     _loc1_++;
                  }
                  this.clearWaitFromParentArray(_loc9_,_loc5_.magicBulletArray);
                  _loc5_.step();
               }
               if(_loc5_.isReadyToDestroy)
               {
                  _loc8_.push(_loc5_);
               }
            }
         }
         this.clearWaitFromParentArray(_loc8_,this.otherHeroArray);
         _loc10_ = this.likeMonsterArray.length;
         while(_loc10_-- > 0)
         {
            if(this.likeMonsterArray[_loc10_])
            {
               _loc6_ = this.likeMonsterArray[_loc10_];
               if(!_loc6_.isReadyToDestroy)
               {
                  _loc1_ = 0;
                  while(_loc1_ < _loc6_.magicBulletArray.length)
                  {
                     _loc2_ = _loc6_.magicBulletArray[_loc1_] as BaseBullet;
                     if(!_loc2_.isReadyToDestroy)
                     {
                        _loc2_.step2();
                     }
                     if(_loc2_.isReadyToDestroy)
                     {
                        _loc9_.push(_loc2_);
                     }
                     _loc1_++;
                  }
                  this.clearWaitFromParentArray(_loc9_,_loc6_.magicBulletArray);
                  _loc6_.step();
               }
               if(_loc6_.isReadyToDestroy)
               {
                  _loc8_.push(_loc6_);
               }
            }
         }
         this.clearWaitFromParentArray(_loc8_,this.likeMonsterArray);
         _loc10_ = uint(this.wallArray.length);
         while(_loc10_-- > 0)
         {
            if(this.wallArray[_loc10_])
            {
               this.wallArray[_loc10_].step();
            }
         }
         _loc10_ = uint(this.auraArray.length);
         while(_loc10_-- > 0)
         {
            if(this.auraArray[_loc10_])
            {
               _loc7_ = this.auraArray[_loc10_] as BaseAura;
               _loc7_.step();
               if(_loc7_.isReadyToDestroy)
               {
                  _loc8_.push(_loc7_);
               }
            }
         }
         this.clearWaitFromParentArray(_loc8_,this.auraArray);
         this.gc.vControllor.step();
         if(this.baseLevelListener)
         {
            this.baseLevelListener.step();
         }
      }
      
      public function destroyWhenChangeMap() : void
      {
         var _loc1_:int = 0;
         var _loc2_:* = null;
         var _loc3_:* = null;
         var _loc4_:* = null;
         var _loc5_:* = null;
         var _loc6_:* = null;
         _loc1_ = 0;
         while(_loc1_ < this.stopPointArray.length)
         {
            _loc4_ = this.stopPointArray[0] as StopPoint;
            _loc4_.destroy();
         }
         this.stopPointArray = [];
         _loc1_ = 0;
         while(_loc1_ < this.wallArray.length)
         {
            _loc5_ = this.wallArray[0] as Wall;
            _loc5_.destroy();
         }
         this.wallArray = [];
         this.markArray = [];
         _loc1_ = 0;
         while(_loc1_ < this.otherArray.length)
         {
            _loc6_ = MovieClip(this.otherArray[_loc1_]);
            if(_loc6_.parent)
            {
               _loc6_.parent.removeChild(_loc6_);
            }
            _loc1_++;
         }
         this.otherArray = [];
         this.continueArray = [];
         this.transferDoorArray = [];
         this.monsterDisappertPointArray = [];
         _loc1_ = 0;
         while(_loc1_ < this.monsterArray.length)
         {
            _loc2_ = this.monsterArray[_loc1_] as BaseMonster;
            _loc2_.destroy();
            _loc1_++;
         }
         this.monsterArray = [];
         _loc1_ = 0;
         while(_loc1_ < this.likeMonsterArray.length)
         {
            _loc2_ = this.likeMonsterArray[_loc1_] as BaseMonster;
            _loc2_.destroy();
            _loc1_++;
         }
         this.likeMonsterArray = [];
         _loc1_ = 0;
         while(_loc1_ < this.auraArray.length)
         {
            _loc3_ = this.auraArray[_loc1_] as BaseAura;
            _loc3_.destroy();
            _loc1_++;
         }
         this.auraArray = [];
         this.otherHeroArray = [];
         this.otherHeroUserArray = [];
         this.isSourceReady = false;
         System.gc();
      }
      
      public function destroy() : void
      {
         var _loc1_:* = undefined;
         if(this.stopPointArray[0] is StopPoint)
         {
            (this.stopPointArray[0] as StopPoint).destroy();
         }
         this.stopPointArray = [];
         if(this.wallArray[0] is Wall)
         {
            (this.wallArray[0] as Wall).destroy();
         }
         this.wallArray = [];
         this.markArray = [];
         for each(_loc1_ in this.otherArray)
         {
            if(MovieClip(_loc1_).parent)
            {
               _loc1_.parent.removeChild(_loc1_);
            }
         }
         this.otherArray = [];
         this.continueArray = [];
         this.transferDoorArray = [];
         this.monsterDisappertPointArray = [];
         for each(_loc1_ in this.monsterArray)
         {
            _loc1_.destroy();
         }
         this.monsterArray = [];
         for each(_loc1_ in this.likeMonsterArray)
         {
            _loc1_.destroy();
         }
         this.likeMonsterArray = [];
         for each(_loc1_ in this.auraArray)
         {
            _loc1_.destroy();
         }
         this.auraArray = [];
         if(this.baseLevelListener)
         {
            this.baseLevelListener.destroy();
            this.baseLevelListener = null;
         }
         this.otherHeroArray = [];
         this.otherHeroUserArray = [];
         this.isSourceReady = false;
         System.gc();
      }
   }
}

