package export.monster
{
   import base.*;
   import com.greensock.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   
   public class Monster15 extends BaseMonster
   {
      
      public function Monster15()
      {
         super();
         this.horizenSpeed = 4;
         if(gc.curStage == 3 && gc.curLevel == 3 || gc.curStage == 8)
         {
            this.setHp(26142);
            this.setSHp(26142);
            this.isBoss = false;
         }
         else
         {
            this.setHp(26142);
            this.setSHp(26142);
            this.isBoss = true;
         }
         this.protectedParamsObject.mysee = 5 * 60;
         this.protectedParamsObject.isattback = 50;
         this.attackRange = 250;
         this.alertRange = 1000;
         this.protectedParamsObject.def = 42;
         this.protectedParamsObject.mDef = 0.2;
         this.protectedParamsObject.exp = 130;
         this.protectedParamsObject.gxp = 65;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":999,
            "power":252,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[0,0],
            "attackInterval":10,
            "power":50,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[0,0],
            "attackInterval":24,
            "power":80,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[0,0],
            "attackInterval":999,
            "power":151,
            "attackKind":"magic"
         };
         this.monsterName = "多闻天王";
         this.setAction("wait");
         this.skillCD1 = [gc.frameClips * 6,gc.frameClips * 5];
         this.skillCD2 = [gc.frameClips * 5,gc.frameClips * 6];
         this.skillCD3 = [gc.frameClips * 3,gc.frameClips * 14];
         this.protectedParamsObject.probability = 0.5;
         this.fallList = [{
            "name":"hylc",
            "bigtype":"zb"
         },{
            "name":"hylz",
            "bigtype":"zb"
         }];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster15");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],5 * 60,350,new Point(0,0));
            bbdc.setOffsetXY(0,-60);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[15],[2,2,2,2,2,7],[19,16],[2,2,2,30],[29,2,20],[2,2,40]]);
            bbdc.setFrameCount([6,4,1,6,2,4,3,3]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster15--BitmapData Error!");
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
            case "hit4":
               if(_loc2_.y != 7)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(7);
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
               if(param1.x == 0)
               {
                  if(this.bbdc.getCurFrameCount() == 19)
                  {
                     this.setYourFather(15);
                     this.doHit1_1(_loc3_);
                  }
                  break;
               }
               if(param1.x == 1)
               {
                  if(this.bbdc.getCurFrameCount() == 16)
                  {
                     this.doHit1_2(_loc3_);
                  }
               }
               break;
            case "hit2":
               if(param1.x == 3)
               {
                  if(this.bbdc.getCurFrameCount() == 26)
                  {
                     this.doHit2(_loc3_);
                  }
               }
               break;
            case "hit3":
               if(param1.x == 0)
               {
                  if(this.bbdc.getCurFrameCount() == 29)
                  {
                     this.doHit3_1(_loc3_);
                  }
                  break;
               }
               if(param1.x == 2)
               {
                  if(this.bbdc.getCurFrameCount() == 14)
                  {
                     this.doHit3_2(_loc3_);
                  }
               }
               break;
            case "hit4":
               if(param1.x == 2)
               {
                  if(this.bbdc.getCurFrameCount() == 40)
                  {
                     this.doHit4(_loc3_);
                  }
               }
         }
      }
      
      private function doHit1_1(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster15Bullet1_1");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 80;
         }
         else
         {
            _loc2_.x = this.x + 80;
         }
         _loc2_.y = this.y - 120;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHit1_2(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster15Bullet1_2");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 190;
         }
         else
         {
            _loc2_.x = this.x + 190;
         }
         _loc2_.y = this.y - 90;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit1");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      override protected function releSkill1() : void
      {
         this.newAttackId();
         this.setYourFather(15);
         this.setAction("hit2");
         this.lastHit = "hit2";
         this.faceToTarget();
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 200;
      }
      
      override protected function releSkill2() : void
      {
         this.newAttackId();
         this.setYourFather(42);
         this.setAction("hit3");
         this.lastHit = "hit3";
         this.faceToTarget();
      }
      
      override protected function beforeSkill2Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 800;
      }
      
      override protected function releSkill3() : void
      {
         this.newAttackId();
         this.setYourFather(30);
         this.setAction("hit4");
         this.lastHit = "hit4";
         this.faceToTarget();
      }
      
      override protected function beforeSkill3Start() : Boolean
      {
         return Boolean(this.curAttackTarget) && AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 800;
      }
      
      private function doHit2(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster15Bullet2");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 140;
         }
         else
         {
            _loc2_.x = this.x + 140;
         }
         _loc2_.y = this.y - 300;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit2");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHit3_1(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster15Bullet3_1");
         if(param1 == 0)
         {
            _loc2_.x = this.x;
         }
         else
         {
            _loc2_.x = this.x;
         }
         _loc2_.y = this.y - 50;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit3");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHit3_2(param1:uint) : void
      {
         var _loc2_:SpecialEffectBullet = new SpecialEffectBullet("Monster15Bullet3_2");
         if(param1 == 0)
         {
            _loc2_.x = this.x - 580;
         }
         else
         {
            _loc2_.x = this.x + 580;
         }
         _loc2_.y = this.y - 50;
         _loc2_.setRole(this);
         _loc2_.setDirect(param1);
         _loc2_.setAction("hit3");
         gc.gameSence.addChild(_loc2_);
         this.magicBulletArray.push(_loc2_);
      }
      
      private function doHit4(param1:uint) : void
      {
         var playerArray:Array = null;
         var _loc4_:int = 0;
         var _loc3_:* = undefined;
         var direct:uint = param1;
         var b:SpecialEffectBullet = new SpecialEffectBullet("Monster15Bullet4");
         if(direct == 0)
         {
            b.x = this.x - 300;
         }
         else
         {
            b.x = this.x + 5 * 60;
         }
         b.y = this.y - 185;
         b.setRole(this);
         b.setDisable();
         b.setDirect(direct);
         b.setAction("hit4");
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
         playerArray = gc.getPlayerArray();
         _loc4_ = 0;
         _loc3_ = playerArray;
         for each(bo in playerArray)
         {
            if(this.bbdc.getDirect() == 0)
            {
               if(bo.x < this.x)
               {
                  TweenMax.to(bo,1.5,{
                     "x":this.x - 150,
                     "y":this.y - 50,
                     "onComplete":function(param1:BaseObject):*
                     {
                        param1.addCurAddEffect([{
                           "name":BaseAddEffect.SIDATIANWANG_SAN_MP_LOST,
                           "time":gc.frameClips * 4,
                           "mpSource":Number(bo.roleProperies.getMMP()) * 0.5
                        }]);
                     },
                     "onCompleteParams":[bo]
                  });
               }
            }
            else if(bo.x > this.x)
            {
               TweenMax.to(bo,1.5,{
                  "x":this.x - 150,
                  "y":this.y - 50,
                  "onComplete":function(param1:BaseObject):*
                  {
                     param1.addCurAddEffect([{
                        "name":BaseAddEffect.SIDATIANWANG_SAN_MP_LOST,
                        "time":gc.frameClips * 4,
                        "mpSource":Number(bo.roleProperies.getMMP()) * 0.5
                     }]);
                  },
                  "onCompleteParams":[bo]
               });
            }
         }
      }
      
      override protected function exitFrameFunc(param1:Point) : void
      {
      }
      
      override public function isAttacking() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3" || this.curAction == "hit4";
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
   }
}

