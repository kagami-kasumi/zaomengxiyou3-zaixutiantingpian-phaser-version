package export.monster
{
   import base.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   import my.*;
   
   public class Monster1003 extends BaseMonster
   {
      
      public function Monster1003()
      {
         super();
         this.horizenSpeed = 5;
         this.setHp(110000 * 0.8);
         this.setSHp(110000 * 0.8);
         this.protectedParamsObject.mysee = 300;
         this.protectedParamsObject.isattback = 50;
         this.attackRange = 250;
         this.alertRange = 1000;
         this.protectedParamsObject.def = 932;
         this.protectedParamsObject.mDef = 0.4;
         this.protectedParamsObject.exp = 200;
         this.protectedParamsObject.gxp = 200;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":12,
            "power":1563,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[2,-4],
            "attackInterval":24,
            "power":1563,
            "attackKind":"magic",
            "addEffect":[{
               "name":BaseAddEffect.POYAZHIREDUCEMP,
               "time":gc.frameClips * 0.5,
               "value":500
            }]
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":999,
            "power":1563,
            "attackKind":"magic"
         };
         this.isBoss = true;
         this.monsterName = "婆雅稚";
         this.setAction("wait");
         this.fallList = [];
         this.skillCD1 = [gc.frameClips * 2,gc.frameClips * 6.4];
         this.skillCD2 = [gc.frameClips * 3,gc.frameClips * 7.2];
         this.skillCD3 = [gc.frameClips * 4,gc.frameClips * 8.1];
         this.skillCD4 = [gc.frameClips * 2.5,gc.frameClips * 6.4];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster1003");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],700,500,new Point(0,0));
            bbdc.setOffsetXY(30,-70);
            bbdc.setFrameStopCount([[2,3,4,2,2,66,2,2],[4,4,4,4],[2,2,2,3,2,4],[15],[2,7,2,28,2,12,2,27,2,6],[1,3,13,2,3,3,4,2,2,9]]);
            bbdc.setFrameCount([8,4,6,1,10,10]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster1003--BitmapData Error!");
      }
      
      override protected function newColipse() : void
      {
         this.colipse = AUtils.getNewObj("ObjectBaseSprite5") as Sprite;
         this.colipse.visible = false;
         this.colipse.scaleY = 2.2;
         this.colipse.scaleX = 1.3;
         this.addChild(this.colipse);
      }
      
      override public function setAction(param1:String) : void
      {
         super.setAction(param1);
         var _loc2_:Point = this.bbdc.getCurPoint();
         switch(param1)
         {
            case "wait":
               if(_loc2_.y != 2)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(2);
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
               if(_loc2_.y != 3)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(3);
               }
               this.bbdc.setState(param1);
               break;
            case "hit1":
               if(_loc2_.y != 5)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(5);
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
               if(_loc2_.y != 0)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(0);
               }
               this.bbdc.setState(param1);
               break;
            case "dead":
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
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     this.doHit1(_loc3_);
                  }
               }
               break;
            case "hit2":
               if(param1.x == 2 || param1.x == 6)
               {
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     this.doHit2(_loc3_);
                  }
               }
               break;
            case "hit3":
               if(param1.x == 4)
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     this.doHit3(_loc3_);
                     break;
                  }
               }
               if(param1.x == 5)
               {
                  if(this.bbdc.getCurFrameCount() == 53 || this.bbdc.getCurFrameCount() == 36 || this.bbdc.getCurFrameCount() == 17)
                  {
                     this.doHit3_2(_loc3_);
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
      
      override protected function releSkill1() : void
      {
         this.faceToTarget();
         this.newAttackId();
         this.setAction("hit2");
         this.lastHit = "hit2";
      }
      
      override protected function releSkill2() : void
      {
         this.faceToTarget();
         this.newAttackId();
         this.setAction("hit3");
         this.lastHit = "hit3";
      }
      
      private function doHit1(param1:uint) : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster1003Bullet1");
         _loc2_.x = this.x;
         _loc2_.y = this.getFootBottom() + 20;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHit2(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = null;
         _loc2_ = null;
         _loc2_ = new SpecialEffectBullet("Monster1003Bullet2");
         _loc2_.x = this.x;
         _loc2_.y = this.y - 100;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit2");
         _loc2_.rotation = this.gettwoobjangle(this,this.curAttackTarget,param1);
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHit3(param1:uint) : void
      {
         var _loc2_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Monster1003Head");
         var _loc3_:int = int(this.getBBDC().getDirect());
         if(_loc3_ == 1)
         {
            _loc2_.x = this.x + 100;
         }
         else
         {
            _loc2_.x = this.x - 100;
         }
         _loc2_.y = this.getFootBottom() + 30;
         _loc2_.setDisable();
         _loc2_.setRole(this);
         _loc2_.setDirect(_loc3_);
         _loc2_.setAction("wait");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHit3_2(param1:uint) : void
      {
         var _loc2_:EnemyMoveBullet = null;
         var _loc3_:* = null;
         if(this.curAttackTarget)
         {
            _loc2_ = new EnemyMoveBullet("Monster1003Bullet3");
            _loc2_.x = this.x;
            _loc2_.y = this.y - 100;
            _loc2_.setRole(this);
            _loc3_ = AUtils.GetNextPointByTwoObj(this,this.curAttackTarget);
            _loc2_.setSpeed(Number(_loc3_.x) * 20,Number(_loc3_.y) * 20);
            _loc2_.setDistance(1000);
            _loc2_.setDestroyWhenLastFrame(false);
            _loc2_.setDirect(param1);
            _loc2_.setAction("hit3");
            _loc2_.rotation = this.gettwoobjangle(this,this.curAttackTarget,param1);
            gc.gameSence.addChild(_loc2_);
            this.magicBulletArray.push(_loc2_);
         }
      }
      
      override protected function move() : void
      {
         super.move();
      }
      
      override public function isAttacking() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3" || this.curAction == "hit4-1" || this.curAction == "hit4-2";
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
      
      override public function destroy() : void
      {
         super.destroy();
         MainGame.getInstance().createMonster(100,450,300);
         MainGame.getInstance().createMonster(101,800,300);
         MainGame.getInstance().createMonster(102,100,300);
      }
      
      override public function setAttackBack(param1:Point) : void
      {
      }
      
      override public function reduceHp(param1:int, param2:Boolean = false) : void
      {
         super.reduceHp(param1,false);
      }
   }
}

