package export.monster
{
   import base.*;
   import com.greensock.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   
   public class Monster1008 extends BaseMonster
   {
      
      private var positionArray:Array;
      
      private var curHeadArray:Array;
      
      private var curHead:uint = 1;
      
      private var Boundeffects:Boolean;
      
      private var LegsArray1:Array;
      
      private var LegsArray2:Array;
      
      public function Monster1008()
      {
         super();
         this.positionArray = [[500,400],[200,400],[800,400],[200,600],[800,600],[500,600]];
         this.curHeadArray = [[5,-299],[112,-265],[165,-163],[153,-43],[52,12],[-72,16],[-169,-67],[-167,-182],[-101,-277]];
         this.LegsArray1 = [[-75,100],[225,100],[525,100],[825,100],[1125,100]];
         this.LegsArray2 = [[75,100],[375,100],[675,100],[975,100],[1275,100]];
         this.colipse.scaleY = 1;
         this.colipse.scaleX = 1;
         this.protectedParamsObject.mysee = 300;
         this.protectedParamsObject.isattback = 50;
         this.attackRange = 250;
         this.alertRange = 1000;
         this.horizenSpeed = 1;
         this.protectedParamsObject.def = 932;
         this.protectedParamsObject.mDef = 0.4;
         this.protectedParamsObject.exp = 2000;
         this.protectedParamsObject.gxp = 2000;
         this.setHp(520521);
         this.setSHp(520521);
         this.isBoss = true;
         this.monsterName = "毗摩智多罗";
         this.setAction("wait");
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[5,-5],
            "attackInterval":12,
            "power":1973 * 0.36,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit3_1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[2,-2],
            "attackInterval":999,
            "power":1564,
            "attackKind":"magic",
            "addEffect":[{
               "name":BaseAddEffect.PETHORSE_ICE,
               "time":gc.frameClips * 1.8
            }]
         };
         this.attackBackInfoDict["hit3_2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[2,-2],
            "attackInterval":999,
            "power":1564,
            "attackKind":"magic",
            "addEffect":[{
               "name":BaseAddEffect.PETMONKEY_FIRE,
               "time":gc.frameClips * 4,
               "hurt":gc.hero1.roleProperies.getSHHP() * 0.02
            }]
         };
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[5,-5],
            "attackInterval":10,
            "power":1564 * 0.4,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit5"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-5,-10],
            "attackInterval":999,
            "power":1973,
            "attackKind":"physics"
         };
         this.skillCD1 = [gc.frameClips * 10,gc.frameClips * 16];
         this.skillCD2 = [gc.frameClips * 3,gc.frameClips * 7.2];
         this.skillCD3 = [gc.frameClips * 4,gc.frameClips * 8.1];
         this.skillCD4 = [gc.frameClips * 2.5,gc.frameClips * 6.4];
         this.protectedParamsObject.probability = 1;
         this.fallList = [{
            "name":"mdhf",
            "bigtype":"zb"
         }];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster1008");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],514,490,new Point(0,0));
            bbdc.setOffsetXY(0,-230);
            bbdc.setFrameStopCount([[4,4,4,4,4,4,4,4,4,4,4,4],[4,4,4,4,4,4],[4,4,4,4,4],[8,4,4,4,4,4,4],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]);
            bbdc.setFrameCount([12,6,5,7,202,86,39]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster1008--BitmapData Error!");
      }
      
      override protected function newColipse() : void
      {
         this.colipse = AUtils.getNewObj("Monster1008Colipse") as Sprite;
         this.colipse.visible = false;
         this.addChild(this.colipse);
      }
      
      override public function setAction(param1:String) : void
      {
         super.setAction(param1);
         var _loc2_:Point = this.bbdc.getCurPoint();
         switch(param1)
         {
            case "wait":
               if(_loc2_.y != 1)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(1);
               }
               this.bbdc.setState(param1);
               break;
            case "walk":
               if(_loc2_.y != 0)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(0);
               }
               this.bbdc.setState(param1);
               break;
            case "dead":
               if(_loc2_.y != 2)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(2);
               }
               this.bbdc.setState(param1);
               break;
            case "hit3":
               if(_loc2_.y != 4)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(param1);
               break;
            case "hit4":
               if(_loc2_.y != 5)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(5);
               }
               this.bbdc.setState(param1);
               break;
            case "hit5":
               if(_loc2_.y != 6)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(6);
               }
               this.bbdc.setState(param1);
               break;
            case "hit2":
               if(_loc2_.y != 3)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(3);
               }
               this.bbdc.setState(param1);
         }
      }
      
      override protected function scriptFrameOverFunc(param1:int) : void
      {
         var _loc2_:String = this.bbdc.getState();
         switch(_loc2_)
         {
            case "walk":
               this.setAction("wait");
               break;
            case "wait":
               if(Math.random() < 0.5)
               {
                  this.setAction("walk");
               }
               this.bbdc.setFramePointX(0);
               break;
            case "hurt":
               this.setStatic();
               this.setAction("wait");
               break;
            case "hit3":
               this.curHead = 1;
               this.setAction("wait");
               break;
            case "hit2":
            case "hit4":
            case "hit5":
               this.setAction("wait");
               break;
            case "dead":
               this.dropAura();
               this.destroy();
         }
      }
      
      override protected function enterFrameFunc(param1:Point) : void
      {
         var _loc2_:String = this.bbdc.getState();
         var _loc3_:uint = uint(this.getBBDC().getDirect());
         switch(_loc2_)
         {
            case "hit2":
               if(param1.x == 0)
               {
                  if(this.bbdc.getCurFrameCount() == 4)
                  {
                     this.MoLunJiaoSha(_loc3_);
                  }
               }
               break;
            case "hit3":
               if(param1.x == 20 * Number(this.curHead) && param1.x != 200)
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     this.HuoChaBingXi(_loc3_,this.curHead,this.curHeadArray[this.curHead - 1]);
                     ++this.curHead;
                  }
               }
               break;
            case "hit4":
               if(param1.x == 34)
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     this.EYeShouGe(_loc3_,false);
                  }
               }
               if(param1.x == 67)
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     this.EYeShouGe(_loc3_,true);
                  }
               }
               break;
            case "hit5":
               if(param1.x == 0)
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     this.XiongShenJianTa(_loc3_);
                  }
               }
         }
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         return this.curAttackTarget;
      }
      
      override protected function beforeSkill2Start() : Boolean
      {
         return this.curAttackTarget;
      }
      
      override protected function beforeSkill3Start() : Boolean
      {
         return this.curAttackTarget;
      }
      
      override protected function beforeSkill4Start() : Boolean
      {
         return this.curAttackTarget;
      }
      
      override protected function releSkill1() : void
      {
         this.newAttackId();
         this.setAction("hit2");
         this.lastHit = "hit2";
      }
      
      override protected function releSkill2() : void
      {
         this.newAttackId();
         this.setAction("hit3");
         this.lastHit = "hit3";
      }
      
      override protected function releSkill3() : void
      {
         this.newAttackId();
         this.setAction("hit4");
         this.lastHit = "hit4";
      }
      
      override protected function releSkill4() : void
      {
         this.newAttackId();
         this.setAction("hit5");
         this.lastHit = "hit5";
      }
      
      private function MoLunJiaoSha(param1:int) : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster1008JiaoSha");
         _loc2_.x = this.x;
         _loc2_.y = this.y;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit2");
         _loc2_.setFuncWhenDestroy(this.MoLunJiaoShaOver);
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
         var _loc3_:Array = [];
         _loc3_ = this.positionArray[uint(6 * Math.random())];
         this.Boundeffects = true;
         TweenMax.to(this,1,{
            "x":_loc3_[0],
            "y":_loc3_[1]
         });
      }
      
      private function HuoChaBingXi(param1:int, param2:uint, param3:Array) : void
      {
         var _loc4_:SpecialEffectBullet = null;
         var _loc5_:EnemyMoveBullet = null;
         var _loc6_:* = null;
         if(this.curAttackTarget)
         {
            if(param2 % 2 == 1)
            {
               _loc4_ = new SpecialEffectBullet("Monster1008puff1");
               _loc5_ = new EnemyMoveBullet("Monster1008shoot1");
               _loc5_.setRole(this);
               _loc5_.setAction("hit3_2");
            }
            else
            {
               _loc4_ = new SpecialEffectBullet("Monster1008puff2");
               _loc5_ = new EnemyMoveBullet("Monster1008shoot2");
               _loc5_.setRole(this);
               _loc5_.setAction("hit3_1");
            }
            _loc4_.x = this.x + param3[0];
            _loc4_.y = this.y - 70 + param3[1];
            _loc4_.setDirect(param1);
            _loc4_.setDisable();
            gc.gameSence.addChild(_loc4_);
            this.magicBulletArray.push(_loc4_);
            _loc5_.x = this.x + param3[0];
            _loc5_.y = this.y - 70 + param3[1];
            _loc6_ = AUtils.GetNextPointByTwoObj(this,this.curAttackTarget);
            _loc5_.setSpeed(Number(_loc6_.x) * 20,Number(_loc6_.y) * 20);
            _loc5_.setDistance(1000);
            _loc5_.setDestroyWhenLastFrame(false);
            _loc5_.setDirect(param1);
            _loc5_.rotation = this.gettwoobjangle(this,this.curAttackTarget,1);
            gc.gameSence.addChild(_loc5_);
            this.magicBulletArray.push(_loc5_);
         }
      }
      
      private function EYeShouGe(param1:int, param2:Boolean) : void
      {
         var _loc3_:EnemyMoveBullet = null;
         var _loc4_:EnemyMoveBullet = null;
         if(param2)
         {
            _loc3_ = new EnemyMoveBullet("Monster1008EYeShouGeLeft");
            _loc4_ = new EnemyMoveBullet("Monster1008EYeShouGeLeft");
            _loc3_.x = -600;
            _loc3_.y = gc.gameSence.height / 1.5;
            _loc4_.x = -600;
            _loc4_.y = gc.gameSence.height / 4;
            _loc3_.setSpeed(30,0);
            _loc4_.setSpeed(30,0);
         }
         else
         {
            _loc3_ = new EnemyMoveBullet("Monster1008EYeShouGeRight");
            _loc4_ = new EnemyMoveBullet("Monster1008EYeShouGeRight");
            _loc3_.x = gc.gameSence.width + 600;
            _loc3_.y = gc.gameSence.height / 1.5;
            _loc4_.x = gc.gameSence.width + 600;
            _loc4_.y = gc.gameSence.height / 4;
            _loc3_.setSpeed(-30,0);
            _loc4_.setSpeed(-30,0);
         }
         _loc3_.setRole(this);
         _loc3_.setDestroyWhenLastFrame(false);
         _loc3_.setDistance(1200);
         _loc3_.setAction("hit4");
         _loc3_.setDirect(param1);
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
         _loc4_.setRole(this);
         _loc4_.setDestroyWhenLastFrame(false);
         _loc4_.setDistance(1200);
         _loc4_.setAction("hit4");
         _loc4_.setDirect(param1);
         gc.gameSence.addChild(_loc4_);
         this.magicBulletArray.push(_loc4_);
      }
      
      private function XiongShenJianTa(param1:int) : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster1008hit5_5");
         _loc2_.x = this.x;
         _loc2_.y = this.y;
         _loc2_.setRole(this);
         _loc2_.setDisable();
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit5");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
         var _loc3_:Array = [0.5,1,1.5,2];
         var _loc4_:int = 0;
         var _loc5_:* = null;
         var _loc6_:* = null;
         if(Math.random() < 0.5)
         {
            _loc6_ = this.LegsArray1;
         }
         else
         {
            _loc6_ = this.LegsArray2;
         }
         while(_loc4_ < _loc3_.length)
         {
            _loc5_ = _loc6_[_loc4_];
            TweenMax.delayedCall(_loc3_[_loc4_],this.showXiongShenJianTa,[param1,_loc5_]);
            _loc4_++;
         }
      }
      
      internal function showXiongShenJianTa(param1:int, param2:Array) : *
      {
         var _loc3_:EnemyMoveBullet = new EnemyMoveBullet("Monster1008JianTa");
         _loc3_.x = param2[0];
         _loc3_.y = param2[1];
         _loc3_.setRole(this);
         _loc3_.setSpeed(0,20);
         _loc3_.setDestroyWhenLastFrame(false);
         _loc3_.setDistance(450);
         _loc3_.setAction("hit5");
         _loc3_.setDirect(param1);
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
         TweenMax.delayedCall(0.6,this.showFlow,[_loc3_.x]);
      }
      
      internal function showFlow(param1:Number) : *
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster1008Flow");
         _loc2_.x = param1;
         _loc2_.y = 510;
         _loc2_.setRole(this);
         _loc2_.setDisable();
         _loc2_.setAction("hit5");
         _loc2_.setDirect(0);
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function MoLunJiaoShaOver(param1:BaseBullet) : *
      {
         this.Boundeffects = false;
      }
      
      override protected function checkCanMove() : void
      {
      }
      
      override protected function move() : void
      {
      }
      
      override protected function attackTarget() : void
      {
      }
      
      override protected function exitFrameFunc(param1:Point) : void
      {
      }
      
      override protected function turnRight() : *
      {
      }
      
      override protected function turnLeft() : *
      {
      }
      
      override public function isAttacking() : Boolean
      {
         return this.curAction == "hit2" || this.curAction == "hit3" || this.curAction == "hit4" || this.curAction == "hit5";
      }
      
      override protected function myIntelligence() : void
      {
         if(!this.isBeAttacking())
         {
            super.myIntelligence();
         }
      }
      
      override public function destroy() : void
      {
         var _loc1_:* = null;
         var _loc2_:int = 0;
         var _loc3_:* = null;
         super.destroy();
         if(this.isBoss)
         {
            _loc1_ = gc.pWorld.getTransferDoorArray();
            _loc2_ = 0;
            while(_loc2_ < _loc1_.length)
            {
               _loc3_ = _loc1_[_loc2_];
               _loc3_.visible = true;
               _loc2_++;
            }
         }
      }
      
      override public function setAttackBack(param1:Point) : void
      {
      }
      
      override public function reduceHp(param1:int, param2:Boolean = false) : void
      {
         if(this.Boundeffects)
         {
            if(this.curAttackTarget)
            {
               if(this.curAttackTarget is BaseHero)
               {
                  BaseHero(this.curAttackTarget).reduceHp(param1,false);
               }
            }
         }
         super.reduceHp(param1,false);
      }
   }
}

