package export.monster
{
   import base.*;
   import com.greensock.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   import my.*;
   
   public class Monster131 extends BaseMonster
   {
      
      public function Monster131()
      {
         super();
         this.normalAttackRate = 0.75;
         this.horizenSpeed = 4.5;
         this.setHp(2500000);
         this.setSHp(2500000);
         this.attackRange = 400;
         this.alertRange = 2000;
         this.protectedParamsObject.def = 1760;
         this.protectedParamsObject.exp = 2000;
         this.protectedParamsObject.gxp = 500;
         this.protectedParamsObject.mDef = 0.45;
         this.protectedParamsObject.Toughness = 15;
         this.protectedParamsObject.Dodge = 10;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":999,
            "power":5648,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[3,0],
            "attackInterval":999,
            "power":4335,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[3,0],
            "attackInterval":24,
            "power":4335 * 0.66,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":6,
            "attackBackSpeed":[3,0],
            "attackInterval":999,
            "power":4335,
            "attackKind":"magic"
         };
         this.isBoss = true;
         this.monsterName = "碧霄";
         this.setAction("wait");
         this.isFly = true;
         this.graity = 0;
         this.skillCD1 = [gc.frameClips * 2,gc.frameClips * 7.4];
         this.skillCD2 = [gc.frameClips * 3,gc.frameClips * 8.2];
         this.skillCD3 = [gc.frameClips * 4,gc.frameClips * 9.1];
         this.skillCD4 = [gc.frameClips * 2.5,gc.frameClips * 7.4];
         this.protectedParamsObject.probability = 0.4;
         this.fallList = [{
            "name":"kly3",
            "bigtype":"dj"
         },{
            "name":"zhhzzzs",
            "bigtype":"dj"
         }];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:Object = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster131");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],250,250,new Point(0,0));
            bbdc.setOffsetXY(0,-15);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[8],[2,2,2,2,10],[2,2,2,10],[2,10],[2,10],[2,2,10]]);
            bbdc.setFrameCount([6,1,5,4,2,2,3]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster131--BitmapData Error!");
      }
      
      override protected function newColipse() : void
      {
         this.colipse = AUtils.getNewObj("ObjectBaseSprite2") as Sprite;
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
               if(_loc2_.y != 0)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(0);
               }
               this.bbdc.setState(param1);
               break;
            case "hurt":
               if(_loc2_.y != 1)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(1);
               }
               this.bbdc.setState(param1);
               break;
            case "hit1":
               if(_loc2_.y != 3)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(3);
               }
               this.bbdc.setState(param1);
               break;
            case "hit2":
               if(_loc2_.y != 4)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(param1);
               break;
            case "hit3":
               if(_loc2_.y != 5)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(5);
               }
               this.bbdc.setState(param1);
               break;
            case "hit4":
               if(_loc2_.y != 6)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(6);
               }
               this.bbdc.setState(param1);
               break;
            case "dead":
               this.setStatic();
               if(_loc2_.y != 2)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(2);
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
            case "hit4":
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
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     this.doHi1(_loc3_);
                  }
               }
               break;
            case "hit2":
               if(param1.x == 0)
               {
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     this.doHi2(_loc3_);
                  }
               }
               break;
            case "hit3":
               if(param1.x == 1)
               {
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     this.doHi3(_loc3_);
                  }
               }
               break;
            case "hit4":
               if(param1.x == 2)
               {
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     this.doHi4(_loc3_);
                  }
               }
         }
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 600;
      }
      
      override protected function beforeSkill2Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 200;
      }
      
      override protected function beforeSkill3Start() : Boolean
      {
         return true;
      }
      
      override protected function releSkill1() : void
      {
         this.newAttackId();
         this.setYourFather(70);
         this.setAction("hit2");
         this.lastHit = "hit2";
      }
      
      override protected function releSkill2() : void
      {
         this.newAttackId();
         this.setYourFather(15);
         this.setAction("hit3");
         this.lastHit = "hit3";
      }
      
      override protected function releSkill3() : void
      {
         this.newAttackId();
         this.setYourFather(35);
         this.setAction("hit4");
         this.lastHit = "hit4";
      }
      
      private function doHi1(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster131Bullet1");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 115;
         }
         else
         {
            _loc2_.x = this.x + 115;
         }
         _loc2_.y = this.y - 55;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHi2(param1:uint) : void
      {
         var _loc2_:BaseMonster = null;
         var _loc3_:uint = 0;
         for each(_loc2_ in gc.pWorld.monsterArray)
         {
            if(_loc2_ is Monster132)
            {
               _loc3_++;
            }
         }
         if(_loc3_ < 2)
         {
            MainGame.getInstance().createMonster(132,this.x,this.y);
         }
      }
      
      private function doHi3(param1:uint) : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster131Bullet3");
         _loc2_.x = this.x;
         _loc2_.y = this.y;
         _loc2_.setHurtCanCutDownEffect(false);
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit3");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHi4(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster131Bullet4");
         _loc2_.x = this.x;
         _loc2_.y = this.y;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setDisable();
         _loc2_.setAction("hit4");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
         var _loc3_:uint = 5 + Math.random() * 6;
         var _loc4_:uint = 0;
         while(_loc4_ < _loc3_)
         {
            this.createRandomMusic();
            _loc4_++;
         }
         if(Math.random() < 0.5)
         {
            this.addCurAddEffect([{
               "name":BaseAddEffect.MONSTER131MUSIC1,
               "time":gc.frameClips * 6
            }]);
         }
         else
         {
            this.addCurAddEffect([{
               "name":BaseAddEffect.MONSTER131MUSIC2,
               "time":gc.frameClips * 6
            }]);
         }
      }
      
      private function createRandomMusic() : void
      {
         var _loc1_:EnemyMoveBullet = null;
         if(Math.random() < 0.5)
         {
            _loc1_ = new EnemyMoveBullet("Monster131Bullet4Music1");
            this.attackBackInfoDict["hit4"] = {
               "hitMaxCount":99,
               "attackBackSpeed":[3,0],
               "attackInterval":12,
               "power":2000,
               "attackKind":"magic",
               "addEffect":[{
                  "name":BaseAddEffect.MONSTER131MUSIC1,
                  "time":gc.frameClips * 6
               }]
            };
         }
         else
         {
            _loc1_ = new EnemyMoveBullet("Monster131Bullet4Music2");
            this.attackBackInfoDict["hit4"] = {
               "hitMaxCount":99,
               "attackBackSpeed":[3,0],
               "attackInterval":12,
               "power":2000,
               "attackKind":"magic",
               "addEffect":[{
                  "name":BaseAddEffect.MONSTER131MUSIC2,
                  "time":gc.frameClips * 6
               }]
            };
         }
         _loc1_.x = this.x + (Math.random() - 0.5) * 800;
         _loc1_.y = (Math.random() - 0.5) * 200 + 50;
         _loc1_.setDestroyWhenLastFrame(false);
         _loc1_.setDestroyInCount(gc.frameClips * 8);
         _loc1_.setDistance(1000);
         _loc1_.setSpeed(0,5);
         _loc1_.setRole(this);
         _loc1_.setDirect(0);
         _loc1_.setAction("hit4");
         gc.gameSence.addChild(_loc1_);
         this.magicBulletArray.push(_loc1_);
      }
      
      override protected function exitFrameFunc(param1:Point) : void
      {
      }
      
      override protected function myIntelligence() : void
      {
         var _loc1_:BaseObject = null;
         var _loc2_:Number = Number(NaN);
         var _loc3_:Object = null;
         var _loc4_:Object = null;
         var _loc5_:Point = null;
         if(!this.isBeAttacking())
         {
            super.myIntelligence();
         }
         var _loc6_:Object = this.curAddEffect.getBuffByName(BaseAddEffect.MONSTER131MUSIC1);
         var _loc7_:Object = this.curAddEffect.getBuffByName(BaseAddEffect.MONSTER131MUSIC2);
         if(Boolean(_loc6_) || Boolean(_loc7_))
         {
            for each(_loc1_ in gc.getPlayerAndPetArray())
            {
               _loc2_ = AUtils.GetDisBetweenTwoObj(_loc1_,this);
               if(_loc2_ < 500)
               {
                  _loc3_ = _loc1_.curAddEffect.getBuffByName(BaseAddEffect.MONSTER131MUSIC1);
                  _loc4_ = _loc1_.curAddEffect.getBuffByName(BaseAddEffect.MONSTER131MUSIC2);
                  _loc5_ = new Point(0,0);
                  if(Boolean(_loc6_) && Boolean(_loc3_) || Boolean(_loc7_) && Boolean(_loc4_))
                  {
                     if(_loc1_.x > this.x)
                     {
                        _loc5_.x = _loc1_.x - 200;
                     }
                     else
                     {
                        _loc5_.y = _loc1_.x + 200;
                     }
                     if(_loc5_.x < 40)
                     {
                        _loc5_.x = 40;
                     }
                     else if(_loc5_.x > 1100)
                     {
                        _loc5_.x = 1100;
                     }
                     if(_loc3_)
                     {
                        _loc1_.curAddEffect.remove(_loc3_);
                     }
                     if(_loc4_)
                     {
                        _loc1_.curAddEffect.remove(_loc4_);
                     }
                     TweenMax.to(_loc1_,1.5,{"x":_loc5_.x});
                  }
                  else if(Boolean(_loc6_) && Boolean(_loc4_) || Boolean(_loc7_) && Boolean(_loc3_))
                  {
                     if(_loc1_.x > this.x)
                     {
                        _loc5_.x = _loc1_.x + 200;
                     }
                     else
                     {
                        _loc5_.x = _loc1_.x - 200;
                     }
                     if(_loc5_.x < 40)
                     {
                        _loc5_.x = 40;
                     }
                     else if(_loc5_.x > 1100)
                     {
                        _loc5_.x = 1100;
                     }
                     if(_loc3_)
                     {
                        _loc1_.curAddEffect.remove(_loc3_);
                     }
                     if(_loc4_)
                     {
                        _loc1_.curAddEffect.remove(_loc4_);
                     }
                     TweenMax.to(_loc1_,1.5,{"x":_loc5_.x});
                  }
               }
            }
         }
      }
      
      override protected function isCannotMoveWhenAttack() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3" || this.curAction == "hit4";
      }
      
      override public function destroy() : void
      {
         var _loc1_:Array = null;
         var _loc2_:int = 0;
         var _loc3_:MovieClip = null;
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
   }
}

