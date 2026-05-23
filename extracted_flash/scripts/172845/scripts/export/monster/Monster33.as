package export.monster
{
   import base.*;
   import com.greensock.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   import flash.utils.*;
   import manager.*;
   import my.*;
   
   public class Monster33 extends BaseMonster
   {
      
      private var isNotArrow:Boolean = false;
      
      private var role4Hit5:MonsterRole4Hit5;
      
      private var gxpCount:uint = 0;
      
      public function Monster33()
      {
         super();
         this.horizenSpeed = 5.5;
         this.setHp(110950 + 0.6 * (gc.hero1.roleProperies.getSMMP() + gc.hero1.roleProperies.getSHHP()));
         this.setSHp(110950 + 0.6 * (gc.hero1.roleProperies.getSMMP() + gc.hero1.roleProperies.getSHHP()));
         this.protectedParamsObject.mysee = 300;
         this.protectedParamsObject.isattback = 50;
         this.attackRange = 250;
         this.alertRange = 1000;
         this.normalAttackRate = 0.8;
         this.protectedParamsObject.def = 306;
         this.protectedParamsObject.mDef = 0.35;
         this.gxpCount = 150;
         this.protectedParamsObject.exp = 500;
         this.protectedParamsObject.gxp = 750;
         var _loc1_:int = 1136;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[5,-3],
            "attackInterval":999,
            "power":1350,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":20,
            "attackBackSpeed":[0.5,-3],
            "attackInterval":999,
            "power":1350,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":20,
            "attackBackSpeed":[0.5,-3],
            "attackInterval":999,
            "power":1350,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[-30,-3],
            "attackInterval":999,
            "power":1350 * 1.2,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit5"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[0,-2],
            "attackInterval":999,
            "power":_loc1_ * 1,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit6"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[0,-2],
            "attackInterval":5,
            "power":_loc1_ * 0.2,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit7_1"] = {
            "hitMaxCount":1,
            "attackBackSpeed":[0,-2],
            "attackInterval":4,
            "power":_loc1_ * 0.12,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit7_2"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[-30,-2],
            "attackInterval":gc.frameClips,
            "power":1350,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit8_1"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[2,-22],
            "attackInterval":20,
            "power":_loc1_ * 0.4,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit8_2"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[10,-4],
            "attackInterval":14,
            "power":_loc1_ * 0.33,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit9"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[-5,-4],
            "attackInterval":30,
            "power":_loc1_ * 0.8,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit10"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[-15,-2],
            "attackInterval":16,
            "power":_loc1_ * 0.4,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit11"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[0,0],
            "attackInterval":9,
            "power":_loc1_ * 0.28,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit12"] = {
            "hitMaxCount":1,
            "attackBackSpeed":[0,0],
            "attackInterval":7,
            "power":_loc1_ * 0.22,
            "attackKind":"magic"
         };
         this.isBoss = true;
         this.monsterName = "邪.八戒";
         this.setAction("wait");
         this.protectedParamsObject.probability = 0.3;
         this.fallList = [{
            "name":"wpqhs1",
            "bigtype":"dj"
         },{
            "name":"wpqhs2",
            "bigtype":"dj"
         },{
            "name":"lssp_1",
            "bigtype":"dj"
         },{
            "name":"lssp_2",
            "bigtype":"dj"
         },{
            "name":"lssp_3",
            "bigtype":"dj"
         },{
            "name":"lssp_4",
            "bigtype":"dj"
         }];
         this.skillCD1 = [gc.frameClips * 2,gc.frameClips * 5];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster33");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],300,200,new Point(0,0));
            bbdc.setOffsetXY(-15,0);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[3,3,3,9,5,9],[4,4,4,4],[2,2,2,2],[1,1,15,6,2,160],[2,2,2,2,2],[2,2,6],[2,2,6],[2,2,2,10],[24,2,8],[2,2,20],[2,2,2,20],[2,2,2,20],[4,3,25]]);
            bbdc.setFrameCount([36,6,4,4,[1,1,1,1,1,1],5,3,3,4,3,3,4,4,3]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster33--BitmapData Error!");
      }
      
      override protected function newColipse() : void
      {
         this.colipse = AUtils.getNewObj("ObjectBaseSprite") as Sprite;
         this.colipse.visible = false;
         this.addChild(this.colipse);
      }
      
      override public function setAction(param1:String) : void
      {
         var curPoint:Point = null;
         var str:String = param1;
         super.setAction(str);
         curPoint = this.bbdc.getCurPoint();
         switch(str)
         {
            case "wait":
               if(curPoint.y != 0)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(0);
               }
               this.bbdc.setState(str);
               break;
            case "wait2":
               if(curPoint.y != 1)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(1);
               }
               this.bbdc.setState(str);
               break;
            case "walk":
               this.setAction("run");
               break;
            case "run":
               if(curPoint.y != 3)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(3);
               }
               this.bbdc.setState(str);
               break;
            case "jump1":
               if(curPoint.x != 0 || curPoint.y != 4)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(str);
               break;
            case "jump2":
               if(curPoint.y != 5)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(5);
               }
               this.bbdc.setState(str);
               break;
            case "jump3":
               if(curPoint.x != 1 || curPoint.y != 4)
               {
                  this.bbdc.setFramePointX(1);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(str);
               break;
            case "hit1":
               if(curPoint.y != 6)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(6);
               }
               this.bbdc.setState(str);
               break;
            case "hit2":
               if(curPoint.y != 7)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(7);
               }
               this.bbdc.setState(str);
               break;
            case "hit3":
               if(curPoint.y != 8)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(8);
               }
               this.bbdc.setState(str);
               break;
            case "hit4":
               if(curPoint.y != 9)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(9);
               }
               this.bbdc.setState(str);
               break;
            case "hit5":
               if(curPoint.x != 5 || curPoint.y != 4)
               {
                  this.bbdc.setFramePointX(5);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(str);
               break;
            case "hit6":
               if(curPoint.x != 3 || curPoint.y != 4)
               {
                  this.bbdc.setFramePointX(3);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(str);
               break;
            case "hit7":
               if(curPoint.y != 10)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(10);
               }
               this.bbdc.setState(str);
               break;
            case "hit8":
               if(curPoint.y != 11)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(11);
               }
               this.bbdc.setState(str);
               break;
            case "hit9":
               if(curPoint.y != 12)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(12);
               }
               this.bbdc.setState(str);
               break;
            case "hit10":
               if(curPoint.y != 13)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(13);
               }
               this.bbdc.setState(str);
               break;
            case "hit11":
               if(curPoint.x != 4 || curPoint.y != 4)
               {
                  this.bbdc.setFramePointX(4);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(str);
               break;
            case "hit11Frame2":
               if(curPoint.x != 5 || curPoint.y != 4)
               {
                  this.bbdc.setFramePointX(5);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(str);
               break;
            case "hit12":
               if(curPoint.x != 5 || curPoint.y != 4)
               {
                  this.bbdc.setFramePointX(5);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(str);
               break;
            case "hurt":
               if(curPoint.x != 2 || curPoint.y != 4)
               {
                  this.bbdc.setFramePointX(2);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(str);
               break;
            case "dead":
               this.setStatic();
               TweenMax.to(this,1,{
                  "alpha":0,
                  "onComplete":function(param1:BaseMonster):*
                  {
                     param1.dropAura();
                     param1.destroy();
                  },
                  "onCompleteParams":[this]
               });
         }
      }
      
      override protected function scriptFrameOverFunc(param1:int) : void
      {
         var _loc2_:String = this.bbdc.getState();
         switch(_loc2_)
         {
            case "wait":
               this.setAction("wait2");
               break;
            case "wait2":
               this.setAction("wait");
               break;
            case "walk":
               this.bbdc.setFramePointX(0);
               break;
            case "run":
               this.bbdc.setFramePointX(0);
               break;
            case "jump1":
               this.bbdc.setFramePointX(0);
               break;
            case "jump2":
               this.setAction("jump3");
               break;
            case "jump3":
               this.bbdc.setFramePointX(1);
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
            case "hit5":
               this.setAction("wait");
               break;
            case "hit6":
               this.setAction("wait");
               break;
            case "hit7":
               this.setAction("wait");
               break;
            case "hit8":
               this.setAction("wait");
               break;
            case "hit9":
               this.setAction("wait");
               break;
            case "hit10":
               this.setStatic();
               this.setAction("wait");
               break;
            case "hit11":
               this.setAction("hit11Frame2");
               break;
            case "hit11Frame2":
               this.getBBDC().show();
               this.setAction("wait");
               break;
            case "hit12":
               this.lastHit = "";
               this.getBBDC().show();
               this.setAction("wait");
               break;
            case "hurt":
               this.setStatic();
               this.getBBDC().show();
               this.setAction("wait");
         }
      }
      
      override protected function enterFrameFunc(param1:Point) : void
      {
         var _loc2_:String = this.bbdc.getState();
         var _loc3_:Point = new Point();
         switch(_loc2_)
         {
            case "hit1":
               if(this.bbdc.getCurFrameCount() == 2)
               {
                  if(param1.x == 1)
                  {
                     if(this.bbdc.getDirect() == 0)
                     {
                        _loc3_.x = this.x - 130;
                     }
                     else
                     {
                        _loc3_.x = this.x + 130;
                     }
                     _loc3_.y = this.y - 72;
                     this.doHit1(this.getBBDC().getDirect(),_loc3_);
                  }
               }
               break;
            case "hit2":
               if(this.bbdc.getCurFrameCount() == 2)
               {
                  if(param1.x == 1)
                  {
                     if(this.bbdc.getDirect() == 0)
                     {
                        _loc3_.x = this.x - 140;
                     }
                     else
                     {
                        _loc3_.x = this.x + 140;
                     }
                     _loc3_.y = this.y - 30;
                     this.doHit2(this.getBBDC().getDirect(),_loc3_);
                  }
               }
               break;
            case "hit3":
               if(this.bbdc.getCurFrameCount() == 2)
               {
                  if(param1.x == 2)
                  {
                     if(this.bbdc.getDirect() == 0)
                     {
                        _loc3_.x = this.x - 180;
                     }
                     else
                     {
                        _loc3_.x = this.x + 180;
                     }
                     _loc3_.y = this.y - 140;
                     this.doHit3(this.getBBDC().getDirect(),_loc3_);
                  }
               }
               break;
            case "hit4":
               if(this.bbdc.getCurFrameCount() == 24)
               {
                  if(param1.x == 0)
                  {
                     if(this.bbdc.getDirect() == 0)
                     {
                        _loc3_.x = this.x - 35;
                     }
                     else
                     {
                        _loc3_.x = this.x + 35;
                     }
                     _loc3_.y = this.y - 55;
                     this.doHit4(this.getBBDC().getDirect(),_loc3_);
                  }
               }
               break;
            case "hit5":
               if(this.bbdc.getCurFrameCount() == 160)
               {
                  if(param1.x == 5)
                  {
                     this.bbdc.setCurFrameCount(4);
                     if(this.bbdc.getDirect() == 0)
                     {
                        _loc3_.x = this.x - 70;
                     }
                     else
                     {
                        _loc3_.x = this.x + 70;
                     }
                     _loc3_.y = this.y - 110;
                     this.doHit5(this.getBBDC().getDirect(),_loc3_);
                  }
               }
               break;
            case "hit6":
               if(this.bbdc.getCurFrameCount() == 6)
               {
                  if(param1.x == 3)
                  {
                     if(this.bbdc.getDirect() == 0)
                     {
                        _loc3_.x = this.x - 120;
                     }
                     else
                     {
                        _loc3_.x = this.x + 120;
                     }
                     _loc3_.y = this.y - 115;
                     this.doHit6(this.getBBDC().getDirect(),_loc3_);
                  }
               }
               break;
            case "hit7":
               if(this.bbdc.getCurFrameCount() == 20)
               {
                  if(param1.x == 2)
                  {
                     if(this.bbdc.getDirect() == 0)
                     {
                        _loc3_.x = this.x - 140;
                     }
                     else
                     {
                        _loc3_.x = this.x + 140;
                     }
                     _loc3_.y = this.y - 160;
                     this.doHit7_1(this.getBBDC().getDirect(),_loc3_);
                  }
               }
               if(this.bbdc.getCurFrameCount() == 8)
               {
                  if(param1.x == 2)
                  {
                     if(this.bbdc.getDirect() == 0)
                     {
                        _loc3_.x = this.x - 135;
                     }
                     else
                     {
                        _loc3_.x = this.x + 135;
                     }
                     _loc3_.y = this.y - 145;
                     this.doHit7_2(this.getBBDC().getDirect(),_loc3_);
                  }
               }
               break;
            case "hit8":
               if(this.bbdc.getCurFrameCount() == 20)
               {
                  if(param1.x == 3)
                  {
                     if(this.bbdc.getDirect() == 0)
                     {
                        _loc3_.x = this.x - 95;
                     }
                     else
                     {
                        _loc3_.x = this.x + 95;
                     }
                     _loc3_.y = this.y;
                     this.doHit8_1(this.getBBDC().getDirect(),_loc3_);
                     if(this.bbdc.getDirect() == 0)
                     {
                        _loc3_.x = this.x + 20;
                     }
                     else
                     {
                        _loc3_.x = this.x - 20;
                     }
                     _loc3_.y = this.y - 20;
                     this.doHit8_2(this.getBBDC().getDirect(),_loc3_);
                  }
               }
               break;
            case "hit9":
               if(this.bbdc.getCurFrameCount() == 20)
               {
                  if(param1.x == 3)
                  {
                     if(this.bbdc.getDirect() == 0)
                     {
                        _loc3_.x = this.x - 195;
                     }
                     else
                     {
                        _loc3_.x = this.x + 195;
                     }
                     _loc3_.y = this.y - 160;
                     this.doHit9(this.getBBDC().getDirect(),_loc3_);
                  }
               }
               break;
            case "hit10":
               if(this.bbdc.getCurFrameCount() == 25)
               {
                  if(param1.x == 2)
                  {
                     if(this.bbdc.getDirect() == 0)
                     {
                        _loc3_.x = this.x - 55;
                     }
                     else
                     {
                        _loc3_.x = this.x + 55;
                     }
                     _loc3_.y = this.y - 25;
                     this.doHit10(this.getBBDC().getDirect(),_loc3_);
                  }
               }
               if(param1.x == 2)
               {
                  if(this.getBBDC().getDirect() == 0)
                  {
                     this.speed.x = -15;
                     break;
                  }
                  this.speed.x = 15;
               }
               break;
            case "hit11Frame2":
               if(this.bbdc.getCurFrameCount() == 160)
               {
                  if(param1.x == 5)
                  {
                     if(this.bbdc.getDirect() == 0)
                     {
                        _loc3_.x = this.x - 135;
                     }
                     else
                     {
                        _loc3_.x = this.x + 135;
                     }
                     _loc3_.y = this.y - 90;
                     this.doHit11(this.getBBDC().getDirect(),_loc3_);
                     this.bbdc.setCurFrameCount(28);
                  }
               }
               this.getBBDC().hide();
               break;
            case "hit12":
               if(this.bbdc.getCurFrameCount() == 160)
               {
                  if(param1.x == 5)
                  {
                     if(this.bbdc.getDirect() == 0)
                     {
                        _loc3_.x = this.x;
                     }
                     else
                     {
                        _loc3_.x = this.x;
                     }
                     _loc3_.y = this.y;
                     this.doHit12_1(this.getBBDC().getDirect(),_loc3_);
                  }
                  break;
               }
               if(this.bbdc.getCurFrameCount() == 150)
               {
                  this.getBBDC().hide();
               }
         }
      }
      
      private function doHit1(param1:uint, param2:Point) : void
      {
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role3Bullet1");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit1");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit2(param1:uint, param2:Point) : void
      {
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role3Bullet2");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit2");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit3(param1:uint, param2:Point) : void
      {
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role3Bullet3");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit3");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit4(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role3_hit4");
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role3Bullet4");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit4");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit5(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role3_hit5");
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role3Bullet5");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDisable();
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit5");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
         if(this.curAddEffect)
         {
            this.curAddEffect.add([{
               "name":BaseAddEffect.BAJIE_DUNPAI_BUFF1,
               "time":gc.frameClips * 10
            }]);
         }
         this.curAddEffect.bjsdcs = 1;
      }
      
      private function doHit6(param1:uint, param2:Point) : void
      {
         var b:FollowBaseObjectBullet = null;
         var bmLen:uint = 0;
         var i:uint = 0;
         var bo:BaseObject = null;
         var direct:uint = param1;
         var p:Point = param2;
         SoundManager.play("Role3_hit6");
         b = new FollowBaseObjectBullet("Role3Bullet6");
         b.x = p.x;
         b.y = p.y;
         b.setRole(this);
         b.setDisable();
         b.setDirect(direct);
         b.setAction("hit6");
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
         bmLen = gc.getPlayerArray().length;
         i = 0;
         while(i < bmLen)
         {
            bo = gc.getPlayerArray()[i] as BaseObject;
            bo.setLostGraity();
            TweenMax.to(bo,1,{
               "x":this.x,
               "y":this.y - 40,
               "onComplete":function(param1:BaseObject):*
               {
                  param1.resetGraity();
               },
               "onCompleteParams":[bo]
            });
            i++;
         }
      }
      
      private function doHit7_1(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role3_hit7");
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role3Bullet7_1");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDisable();
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit7_1");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit7_2(param1:uint, param2:Point) : void
      {
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("Role3Bullet7_2");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit7_2");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit8_1(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role3_hit8");
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role3Bullet8_1");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDisable();
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit8_1");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit8_2(param1:uint, param2:Point) : void
      {
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("Role3Bullet8_2");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit8_2");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit9(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role3_hit9");
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("Role3Bullet9");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit9");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit10(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role3_hit10");
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role3Bullet10");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit10");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit11(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role3_hit11");
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role3Bullet11");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit11");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit12_1(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role3_hit12_1");
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role3Bullet12_1");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDisable();
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit12");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit12_2(param1:*, param2:*, param3:Point = null, param4:uint = 10) : void
      {
         var _loc5_:int = 0;
         var _loc6_:* = null;
         var _loc7_:* = null;
         var _loc8_:* = null;
         var _loc9_:Number = Number(NaN);
         SoundManager.play("Role3_hit12_2");
         for each(_loc6_ in this.magicBulletArray)
         {
            if(_loc6_.getImcName() == "Role3Bullet12_1")
            {
               if(_loc6_.getImgMc())
               {
                  _loc6_.getImgMc().gotoAndPlay(140);
               }
            }
         }
         param4 = 10;
         if(this.isGXP)
         {
            param4 = 20;
         }
         var _loc10_:BaseObject = gc.getPlayerArray()[int(Math.random() * gc.getPlayerArray().length)] as BaseObject;
         param3 = !_loc10_ ? new Point(this.x + 1,this.y + 5 * 60) : new Point(_loc10_.x,_loc10_.y);
         while(_loc5_ < param4)
         {
            _loc9_ = 360 / param4 * _loc5_;
            _loc8_ = new Point(param2.x + Math.sin(_loc9_ * Math.PI / 180) * 100,param2.y - Math.cos(_loc9_ * Math.PI / 180) * 100);
            _loc7_ = new StabBullet("Role3Bullet12_2",param3,1,_loc8_);
            _loc7_.setRole(this);
            _loc7_.setDestroyWhenLastFrame(false);
            _loc7_.setAction("hit12");
            _loc7_.rotation = _loc9_;
            _loc7_.x = _loc8_.x;
            _loc7_.y = _loc8_.y;
            gc.gameSence.addChild(_loc7_);
            this.magicBulletArray.push(_loc7_);
            _loc5_++;
         }
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         return this.curAttackTarget != null;
      }
      
      override protected function releSkill1() : void
      {
         var skillArray:Array = null;
         var randSkil:String = null;
         this.newAttackId();
         skillArray = ["hit9","hit10","hit11","hit12"];
         if(!this.curAddEffect.getBuffByName(BaseAddEffect.BAJIE_DUNPAI_BUFF1))
         {
            skillArray.push("hit5");
         }
         randSkil = skillArray[int(Math.random() * skillArray.length)];
         this.faceToTarget();
         this.setYourFather(10);
         this.setAction(randSkil);
         this.lastHit = randSkil;
         if(randSkil == "hit12")
         {
            TweenMax.delayedCall(2,function(param1:*):*
            {
               param1.getBBDC().setCurFrameCount(20);
               param1.doHit12_2(param1.getBBDC().getDirect(),new Point(param1.x,param1.y));
            },[this]);
         }
      }
      
      override protected function exitFrameFunc(param1:Point) : void
      {
      }
      
      override protected function myIntelligence() : void
      {
         if(this.isGXP)
         {
            if(getTimer() % 4 == 0)
            {
               AUtils.shallowEffect(this);
            }
         }
         if(this.gxpCount > 0)
         {
            --this.gxpCount;
         }
         else if(this.gxpCount <= 0 && !this.isGXP)
         {
            this.turnToGXP();
            this.gxpCount = 660;
            TweenMax.delayedCall(7,function(param1:*):*
            {
               param1.turnToNormal();
            },[this]);
         }
         if(!this.isBeAttacking())
         {
            super.myIntelligence();
         }
      }
      
      override protected function turnToGXP() : void
      {
         this.isGXP = true;
         this.graity = 3.75;
         this.horizenSpeed *= 1.5;
      }
      
      protected function turnToNormal() : void
      {
         this.isGXP = false;
         this.graity = 1.5;
         this.horizenSpeed /= 1.5;
      }
      
      override public function reduceHp(param1:int, param2:Boolean = false) : void
      {
         if(Boolean(this.curAddEffect) && Boolean(this.curAddEffect.curDebuff(BaseAddEffect.BAJIE_DUNPAI_BUFF1)) || this.curAction == "hit12")
         {
            param2 = false;
         }
         if(this.isGXP)
         {
            param1 *= 0.5;
         }
         super.reduceHp(param1,param2);
      }
      
      override public function setAttackBack(param1:Point) : void
      {
         if(!(Boolean(this.curAddEffect) && this.curAddEffect.curDebuff(BaseAddEffect.BAJIE_DUNPAI_BUFF1) || this.curAction == "hit12"))
         {
            super.setAttackBack(param1);
         }
      }
      
      private function isAttackingButCanAttack() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3";
      }
      
      override protected function isCannotMoveWhenAttackOnFloor() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3" && gc.protectedPerproty.getProperty(this,"jumpCount") == 0 || this.curAction == "hit4" || this.curAction == "hit7" || this.curAction == "hit8" || this.curAction == "hit9" || this.curAction == "hit11" || this.curAction == "hit11Frame2" || this.curAction == "hit12";
      }
      
      override public function isAttacking() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3" || this.curAction == "hit4" || this.curAction == "hit5" || this.curAction == "hit6" || this.curAction == "hit7" || this.curAction == "hit8" || this.curAction == "hit9" || this.curAction == "hit10" || this.curAction == "hit11" || this.curAction == "hit11Frame2" || this.curAction == "hit12";
      }
      
      override public function isCanMoveWhenAttack() : Boolean
      {
         return this.curAction == "hit5" || this.curAction == "hit10";
      }
      
      override public function destroy() : void
      {
         super.destroy();
         if(this.gc.curStage == 4)
         {
            MainGame.getInstance().createMonster(31,800,300);
         }
      }
   }
}

