package export.monster
{
   import base.*;
   import config.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   import flash.utils.*;
   import my.*;
   
   public class Monster172 extends BaseMonster
   {
      
      private var averLevel:uint = 0;
      
      public function Monster172()
      {
         var _loc1_:int = 0;
         var _loc2_:* = 0;
         var _loc3_:* = undefined;
         super();
         this.gc = Config.getInstance();
         if(this.gc.curStage != 4)
         {
            this.horizenSpeed = 4;
            this.averLevel = this.gc.getAverageLevel();
            if(this.averLevel > 85)
            {
               this.averLevel = 85;
            }
            this.horizenSpeed = 6;
            _loc2_ = uint(Math.ceil(this.averLevel / 10));
            this.setHp(1645458);
            this.setSHp(this.getHp());
            this.normalAttackRate = 0.9;
            this.attackRange = 250;
            this.alertRange = 1000;
            this.protectedParamsObject.def = 1256;
            this.protectedParamsObject.exp = 500;
            this.protectedParamsObject.gxp = 1000;
            this.isBoss = true;
            this.protectedParamsObject.mDef = 0.45;
            _loc3_ = int(this.averLevel * 20 - 150);
            _loc3_ = _loc3_ < 1 ? 1 : _loc3_;
            this.attackBackInfoDict["hit1"] = {
               "hitMaxCount":99,
               "attackBackSpeed":[6,-5],
               "attackInterval":999,
               "power":4425,
               "attackKind":"physics"
            };
            this.attackBackInfoDict["hit2"] = {
               "hitMaxCount":99,
               "attackBackSpeed":[1,0],
               "attackInterval":999,
               "power":3347,
               "attackKind":"magic"
            };
            this.attackBackInfoDict["hit3"] = {
               "hitMaxCount":99,
               "attackBackSpeed":[14,-5],
               "attackInterval":10,
               "power":3347 * 0.24,
               "attackKind":"magic"
            };
            this.isBoss = true;
            this.monsterName = "后羿";
            this.setAction("wait");
            this.protectedParamsObject.probability = 1;
            this.fallList = [];
            if(this.averLevel >= 50)
            {
               this.fallList = [{
                  "name":"xhb",
                  "bigtype":"dj"
               }];
            }
            this.skillCD1 = [gc.frameClips * 2,gc.frameClips * 4.5];
            this.skillCD2 = [gc.frameClips * 3,gc.frameClips * 4.2];
            this.skillCD3 = [gc.frameClips * 4,gc.frameClips * 8.1];
            this.skillCD4 = [gc.frameClips * 2.5,gc.frameClips * 6.4];
            if(this.gc.getAverageLevel() > 50)
            {
               this.curAddEffect.add([{
                  "name":"father",
                  "time":0,
                  "interval":1000,
                  "isForever":1
               }]);
            }
         }
         else
         {
            this.horizenSpeed = 6;
            this.normalAttackRate = 0.8;
            this.setHp(173359);
            this.setSHp(173359);
            this.normalAttackRate = 0.6;
            this.attackRange = 250;
            this.alertRange = 1000;
            this.protectedParamsObject.def = 305;
            if(this.gc.hero1.roleProperies.getMagicDef() / 100 * 0.7 + 0.2 > 0.8)
            {
               this.protectedParamsObject.mDef = 0.8;
            }
            else
            {
               this.protectedParamsObject.mDef = this.gc.hero1.roleProperies.getMagicDef() / 100 * 0.7 + 0.2;
            }
            this.protectedParamsObject.mDef = 0.35;
            this.protectedParamsObject.exp = 500;
            this.protectedParamsObject.gxp = 250;
            this.isBoss = true;
            _loc1_ = this.gc.hero1.roleProperies.getHurt() * 3.3 + 80;
            if(HackChecker.checkAttribute(gc.hero1))
            {
               _loc1_ = int(this.gc.hero1.roleProperies.getSHHP());
            }
            this.attackBackInfoDict["hit1"] = {
               "hitMaxCount":99,
               "attackBackSpeed":[6,-5],
               "attackInterval":999,
               "power":1350,
               "attackKind":"physics"
            };
            this.attackBackInfoDict["hit2"] = {
               "hitMaxCount":99,
               "attackBackSpeed":[1,0],
               "attackInterval":999,
               "power":1136,
               "attackKind":"magic"
            };
            this.attackBackInfoDict["hit3"] = {
               "hitMaxCount":99,
               "attackBackSpeed":[14,-5],
               "attackInterval":10,
               "power":1136 * 0.24,
               "attackKind":"magic"
            };
            this.isBoss = true;
            this.setHue(-150);
            this.monsterName = "邪.后羿";
            this.setAction("wait");
            this.protectedParamsObject.probability = 0.1;
            this.fallList = [{
               "name":"lssp_6",
               "bigtype":"dj"
            },{
               "name":"lssp_7",
               "bigtype":"dj"
            },{
               "name":"lssp_8",
               "bigtype":"dj"
            },{
               "name":"lssp_9",
               "bigtype":"dj"
            }];
            this.skillCD1 = [gc.frameClips * 1,gc.frameClips * 3.6];
            this.skillCD2 = [gc.frameClips * 2,gc.frameClips * 3.6];
            this.skillCD3 = [gc.frameClips * 4,gc.frameClips * 8.1];
            this.skillCD4 = [gc.frameClips * 2.5,gc.frameClips * 6.4];
            this.curAddEffect.add([{
               "name":"father",
               "time":gc.frameClips * 1.5
            },{
               "name":"father",
               "time":0,
               "interval":1000,
               "isForever":1
            }]);
         }
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster172");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],250,250,new Point(0,0));
            bbdc.setOffsetXY(2,-30);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8],[2,2,2,2,10],[2,2,2,1,1,1,10],[2,2,2,1,1,1,10],[2,2]]);
            bbdc.setFrameCount([6,4,1,5,7,7,10]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster172--BitmapData Error!");
      }
      
      override protected function newColipse() : void
      {
         this.colipse = AUtils.getNewObj("ObjectBaseSprite") as Sprite;
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
               if(_loc2_.y != 0)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(0);
               }
               this.bbdc.setState(param1);
               break;
            case "walk":
               if(_loc2_.y != 1)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(1);
               }
               this.bbdc.setState(param1);
               break;
            case "hurt":
               if(_loc2_.y != 2)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(2);
               }
               this.bbdc.setState(param1);
               break;
            case "hit1":
               if(_loc2_.y != 4)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(param1);
               break;
            case "hit2":
               if(_loc2_.y != 5)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(5);
               }
               this.bbdc.setState(param1);
               break;
            case "hit3":
               if(_loc2_.y != 6)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(6);
               }
               this.bbdc.setState(param1);
               break;
            case "dead":
               this.setStatic();
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
               this.bbdc.setFramePointX(0);
               break;
            case "wait":
               this.bbdc.setFramePointX(0);
               break;
            case "hit1":
               this.setAction("wait");
               break;
            case "hit2":
               this.setAction("wait");
               break;
            case "hit3":
               this.setAction("wait");
               break;
            case "hurt":
               this.setStatic();
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
            case "hit1":
               if(param1.x == 3)
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     this.doHi1(_loc3_);
                  }
               }
               break;
            case "hit2":
               if(param1.x == 3)
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     this.doHi2(_loc3_);
                  }
               }
               break;
            case "hit3":
               if(param1.x == 1)
               {
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     this.doHi3(_loc3_);
                  }
               }
         }
      }
      
      private function doHi1(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster172Bullet1");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 50;
         }
         else
         {
            _loc2_.x = this.x + 50;
         }
         _loc2_.y = this.y;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit1");
         _loc2_.setBingoRate(0.01);
         this.gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHi2(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = null;
         _loc2_ = new SpecialEffectBullet("Monster172Bullet2");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 50;
         }
         else
         {
            _loc2_.x = this.x + 50;
         }
         _loc2_.y = this.y;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit2");
         this.gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
         _loc2_ = new SpecialEffectBullet("Monster172Bullet2");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 50;
         }
         else
         {
            _loc2_.x = this.x + 50;
         }
         _loc2_.getImgMc().rotation = 30;
         _loc2_.y = this.y;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit2");
         _loc2_.setBingoRate(0.01);
         this.gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
         _loc2_ = new SpecialEffectBullet("Monster172Bullet2");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 50;
         }
         else
         {
            _loc2_.x = this.x + 50;
         }
         _loc2_.getImgMc().rotation = 60;
         _loc2_.y = this.y;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit2");
         this.gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHi3(param1:uint) : void
      {
         var _loc2_:Number = (Math.random() - 0.5) * 50;
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("Monster172Bullet3");
         if(param1 == 0)
         {
            _loc3_.x = this.x - 50;
         }
         else
         {
            _loc3_.x = this.x + 50;
         }
         _loc3_.y = this.y + _loc2_;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit3");
         _loc3_.setBingoRate(0.01);
         this.gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         return Boolean(this.standInObj) && Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 600;
      }
      
      override protected function beforeSkill2Start() : Boolean
      {
         return Boolean(this.standInObj) && Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 600;
      }
      
      override protected function releSkill1() : void
      {
         this.newAttackId();
         this.faceToTarget();
         this.setYourFather(20);
         this.setAction("hit2");
         this.lastHit = "hit2";
      }
      
      override protected function releSkill2() : void
      {
         this.newAttackId();
         this.faceToTarget();
         this.setYourFather(20);
         this.setAction("hit3");
         this.lastHit = "hit3";
      }
      
      override protected function exitFrameFunc(param1:Point) : void
      {
      }
      
      override protected function myIntelligence() : void
      {
         if(!this.isBeAttacking())
         {
            super.myIntelligence();
         }
      }
      
      override public function fallEquip() : void
      {
         var _loc3_:Number = Number(NaN);
         var _loc4_:* = undefined;
         var _loc5_:* = undefined;
         var _loc6_:* = undefined;
         var _loc1_:String = null;
         var _loc2_:Array = null;
         var _loc7_:* = 0;
         var _loc8_:* = null;
         var _loc9_:* = null;
         var _loc10_:int = 0;
         if(this.monsterName.indexOf("邪") != -1)
         {
            _loc1_ = getQualifiedClassName(this);
            _loc2_ = _loc1_.split("::");
            if(gc.difficulity != 2)
            {
               this.gc.allTask.killMonster(_loc2_[1]);
            }
         }
         _loc3_ = Number(this.protectedParamsObject.probability);
         if(this.isBoss)
         {
            _loc3_ *= 1.5;
         }
         _loc4_ = 0;
         _loc5_ = 0;
         _loc6_ = 0;
         if(this.gc.hero1)
         {
            _loc5_ = Number(this.gc.hero1.getPlayer().getCurFashionEquipFallThingProbability());
         }
         if(this.gc.hero2)
         {
            _loc6_ = Number(this.gc.hero2.getPlayer().getCurFashionEquipFallThingProbability());
         }
         _loc4_ = Number(Math.max(_loc5_,_loc6_));
         _loc3_ *= 1 + _loc4_;
         if(Math.random() > _loc3_)
         {
            return;
         }
         try
         {
            _loc7_ = uint(Math.round(Math.random() * (this.fallList.length - 1)));
            if(Boolean(this.fallList[_loc7_]) || this.fallList[_loc7_] != undefined)
            {
               _loc8_ = new FallEquipObj(this.fallList[_loc7_]);
               _loc9_ = this.gc.gameSence.localToGlobal(new Point(this.x,0));
               _loc10_ = 0;
               if(_loc9_.x > 930)
               {
                  _loc10_ = -200;
               }
               else if(_loc9_.x <= 10)
               {
                  _loc10_ = 200;
               }
               _loc8_.x = this.x + _loc10_;
               _loc8_.y = this.y - 100;
               this.gc.gameSence.addChild(_loc8_);
               this.gc.otherList.push(_loc8_);
            }
            return;
         }
         catch(e:*)
         {
            return;
         }
      }
      
      override public function destroy() : void
      {
         var _loc1_:* = undefined;
         var _loc2_:* = null;
         var _loc3_:int = 0;
         super.destroy();
         if(this.isBoss)
         {
            _loc2_ = this.gc.pWorld.getTransferDoorArray();
            _loc3_ = 0;
            while(_loc3_ < _loc2_.length)
            {
               _loc1_ = _loc2_[_loc3_];
               _loc1_.visible = true;
               _loc3_++;
            }
         }
      }
   }
}

