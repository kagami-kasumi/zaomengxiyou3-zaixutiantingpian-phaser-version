package export.monster
{
   import base.*;
   import com.greensock.*;
   import export.bullet.*;
   import export.hero.*;
   import flash.display.*;
   import flash.geom.*;
   import flash.utils.*;
   import manager.*;
   import my.*;
   
   public class Monster34 extends BaseMonster
   {
      
      private var hit11Count:uint = 35;
      
      private var shallowArray:Array;
      
      private var gxpCount:uint = 0;
      
      public function Monster34()
      {
         this.shallowArray = [];
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
         var _loc1_:int = 1135;
         this.protectedParamsObject.exp = 500;
         this.protectedParamsObject.gxp = 200;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[-2,-3],
            "attackInterval":999,
            "power":1350,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":20,
            "attackBackSpeed":[-0.5,-3],
            "attackInterval":999,
            "power":1350,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":20,
            "attackBackSpeed":[-0.5,-3],
            "attackInterval":999,
            "power":1350,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[-8,-3],
            "attackInterval":999,
            "power":1350,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit5"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[-15,-2],
            "attackInterval":999,
            "power":1350,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit6"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-14,-25],
            "attackInterval":999,
            "power":1350,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit7"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[-15,0],
            "attackInterval":4,
            "power":_loc1_ * 0.15,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit8"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[-8,-2],
            "attackInterval":6,
            "power":_loc1_ * 0.18,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit9"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[0,-2],
            "attackInterval":999,
            "power":_loc1_,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit10_2"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[-2,-2],
            "attackInterval":5,
            "power":_loc1_ * 0.086,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit10_3"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[-10,20],
            "attackInterval":5,
            "power":_loc1_ * 0.086,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit10_4"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[-10,-15],
            "attackInterval":999,
            "power":_loc1_ * 0.52,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit11_1"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[-20,0],
            "attackInterval":8,
            "power":_loc1_ * 0.2,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit11_2"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[0,-25],
            "attackInterval":8,
            "power":_loc1_ * 0.2,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit12"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[0,0],
            "attackInterval":15,
            "power":_loc1_ * 0.3,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit13"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[0,0],
            "attackInterval":999,
            "power":1350,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit14"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[-20,0],
            "attackInterval":999,
            "power":1350 * 1.2,
            "attackKind":"physics"
         };
         this.isBoss = true;
         this.monsterName = "邪.悟空";
         this.setAction("wait");
         this.protectedParamsObject.probability = 0.2;
         this.fallList = [{
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
         },{
            "name":"lssp_5",
            "bigtype":"dj"
         }];
         this.skillCD1 = [gc.frameClips * 2,gc.frameClips * 5.5];
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster34");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],200,200,new Point(0,0));
            bbdc.setOffsetXY(5,-15);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[5,5],[4,4,4,4],[2,2,2,2],[1,1,10,100,this.hit11Count,this.hit11Count],[2,2,2,2,2],[2,2,1,1,3],[1,1,1,1,5],[1,1,1,1,12],[2,2,1,1,10],[2,2,1,6],[2,3,2,3],[17,15,15,10],[2,12,16]]);
            bbdc.setFrameCount([36,8,4,4,[1,1,1,1,1,1],5,5,5,5,5,4,4,[1,1,1,1],3]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster34--BitmapData Error!");
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
         if(str != "hit14")
         {
            this.bbdc.setOffsetXY(5,-15);
         }
         else
         {
            this.bbdc.setOffsetXY(5,-30);
         }
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
               if(curPoint.y != 2)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(2);
               }
               this.bbdc.setState(str);
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
               if(curPoint.y != 6)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(6);
               }
               this.bbdc.setState(str);
               break;
            case "hit3":
               if(curPoint.y != 7)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(7);
               }
               this.bbdc.setState(str);
               break;
            case "hit4":
               if(curPoint.y != 8)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(8);
               }
               this.bbdc.setState(str);
               break;
            case "hit5":
               if(curPoint.y != 9)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(9);
               }
               this.bbdc.setState(str);
               break;
            case "hit6":
               if(curPoint.y != 10)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(10);
               }
               this.bbdc.setState(str);
               break;
            case "hit7":
               if(curPoint.x != 1 || curPoint.y != 12)
               {
                  this.bbdc.setFramePointX(1);
                  this.bbdc.setFramePointY(12);
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
               if(curPoint.x != 2 || curPoint.y != 4)
               {
                  this.bbdc.setFramePointX(2);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(str);
               break;
            case "hit10":
               if(curPoint.x != 3 || curPoint.y != 4)
               {
                  this.bbdc.setFramePointX(3);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(str);
               break;
            case "hit11_1":
               if(curPoint.x != 4 || curPoint.y != 4)
               {
                  this.bbdc.setFramePointX(4);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(str);
               break;
            case "hit11_2":
               if(curPoint.x != 5 || curPoint.y != 4)
               {
                  this.bbdc.setFramePointX(5);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(str);
               break;
            case "hit12":
               if(curPoint.x != 0 || curPoint.y != 12)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(12);
               }
               this.bbdc.setState(str);
               break;
            case "hit13":
               if(curPoint.x != 3 || curPoint.y != 12)
               {
                  this.bbdc.setFramePointX(3);
                  this.bbdc.setFramePointY(12);
               }
               this.bbdc.setState(str);
               break;
            case "hit14":
               if(curPoint.x != 0 || curPoint.y != 13)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(13);
               }
               this.bbdc.setState(str);
               break;
            case "hurt":
               this.getBBDC().show();
               this.resetGraity();
               if(curPoint.x == 2 && curPoint.y == 12)
               {
                  this.getBBDC().resetCurFrameStopCount();
               }
               else
               {
                  this.bbdc.setFramePointX(2);
                  this.bbdc.setFramePointY(12);
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
               this.bbdc.setState(str);
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
            case "run":
               this.bbdc.setFramePointX(0);
               break;
            case "wait":
               this.setAction("wait2");
               break;
            case "wait2":
               this.setAction("wait");
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
               if(!this.isInSky())
               {
                  this.setAction("wait");
                  break;
               }
               this.setAction("jump3");
               break;
            case "hit5":
               this.setAction("wait");
               break;
            case "hit6":
               if(!this.isInSky())
               {
                  this.setAction("wait");
                  break;
               }
               this.setAction("jump3");
               break;
            case "hit7":
               this.setStatic();
               if(!this.isInSky())
               {
                  this.setAction("wait");
                  break;
               }
               this.setAction("jump3");
               break;
            case "hit8":
               if(!this.isInSky())
               {
                  this.setAction("wait");
                  break;
               }
               this.setAction("jump3");
               break;
            case "hit9":
               this.getBBDC().show();
               if(!this.isInSky())
               {
                  this.setAction("wait");
                  break;
               }
               this.setAction("jump3");
               break;
            case "hit10":
               this.hit10Over();
               break;
            case "hit11_1":
               this.hit11Over();
               break;
            case "hit11_2":
               this.hit11Over();
               break;
            case "hit12":
               this.setAction("wait");
               break;
            case "hit13":
               if(!this.isInSky())
               {
                  this.setAction("wait");
                  break;
               }
               this.setAction("jump3");
               break;
            case "hit14":
               this.setAction("wait");
               break;
            case "hurt":
               this.setStatic();
               this.setAction("wait");
         }
      }
      
      override protected function enterFrameFunc(param1:Point) : void
      {
         var _loc2_:* = null;
         var _loc3_:* = 0;
         var _loc4_:* = null;
         var _loc5_:String = this.bbdc.getState();
         var _loc6_:Point = new Point();
         switch(_loc5_)
         {
            case "hit1":
            case "hit2":
               if(this.bbdc.getCurFrameCount() == 1)
               {
                  if(param1.x == 2)
                  {
                     if(this.bbdc.getDirect() == 0)
                     {
                        _loc6_.x = this.x - 120;
                     }
                     else
                     {
                        _loc6_.x = this.x + 120;
                     }
                     _loc6_.y = this.y + 5;
                     this.doHit1(this.getBBDC().getDirect(),_loc6_);
                  }
               }
               break;
            case "hit3":
               if(this.bbdc.getCurFrameCount() == 1)
               {
                  if(param1.x == 0)
                  {
                     if(this.bbdc.getDirect() == 0)
                     {
                        _loc6_.x = this.x - 30;
                     }
                     else
                     {
                        _loc6_.x = this.x + 30;
                     }
                     _loc6_.y = this.y - 110;
                     this.doHit3(this.getBBDC().getDirect(),_loc6_);
                  }
               }
               break;
            case "hit4":
               if(this.bbdc.getCurFrameCount() == 1)
               {
                  if(param1.x == 0)
                  {
                     if(this.bbdc.getDirect() == 0)
                     {
                        _loc6_.x = this.x - 160;
                     }
                     else
                     {
                        _loc6_.x = this.x + 160;
                     }
                     _loc6_.y = this.y - 10;
                     this.doHit4(this.getBBDC().getDirect(),_loc6_);
                  }
               }
               break;
            case "hit5":
               if(this.bbdc.getCurFrameCount() == 1)
               {
                  if(param1.x == 2)
                  {
                     if(this.bbdc.getDirect() == 0)
                     {
                        _loc6_.x = this.x - 165;
                     }
                     else
                     {
                        _loc6_.x = this.x + 165;
                     }
                     _loc6_.y = this.y - 20;
                     this.doHit5(this.getBBDC().getDirect(),_loc6_);
                  }
               }
               break;
            case "hit6":
               if(this.bbdc.getCurFrameCount() == 2)
               {
                  if(param1.x == 1)
                  {
                     if(this.bbdc.getDirect() == 0)
                     {
                        _loc6_.x = this.x - 30;
                     }
                     else
                     {
                        _loc6_.x = this.x + 30;
                     }
                     _loc6_.y = this.y + 40;
                     this.doHit6(this.getBBDC().getDirect(),_loc6_);
                  }
               }
               break;
            case "hit7":
               if(this.bbdc.getCurFrameCount() == 15)
               {
                  if(param1.x == 1)
                  {
                     if(this.bbdc.getDirect() == 0)
                     {
                        _loc6_.x = this.x - 175;
                     }
                     else
                     {
                        _loc6_.x = this.x + 175;
                     }
                     _loc6_.y = this.y - 30;
                     this.doHit7(this.getBBDC().getDirect(),_loc6_);
                  }
               }
               if(this.bbdc.getDirect() == 0)
               {
                  this.speed.x = -25 * this.bbdc.getCurFrameCount() / 15;
                  break;
               }
               this.speed.x = 25 * this.bbdc.getCurFrameCount() / 15;
               break;
            case "hit8":
               if(this.bbdc.getCurFrameCount() == 2)
               {
                  if(param1.x == 0)
                  {
                     if(this.bbdc.getDirect() == 0)
                     {
                        _loc6_.x = this.x + 20;
                     }
                     else
                     {
                        _loc6_.x = this.x - 20;
                     }
                     _loc6_.y = this.y + 30;
                     this.doHit8(this.getBBDC().getDirect(),_loc6_);
                  }
               }
               if(this.bbdc.getCurFrameCount() == 2)
               {
                  if(param1.x == 0)
                  {
                     for each(_loc4_ in this.shallowArray)
                     {
                        if(_loc4_)
                        {
                           if(!_loc4_.isReadyToDestroy)
                           {
                              _loc4_.setAction("hit1");
                           }
                        }
                     }
                  }
               }
               break;
            case "hit9":
               if(this.bbdc.getCurFrameCount() == 10)
               {
                  if(param1.x == 2)
                  {
                     if(this.bbdc.getDirect() == 0)
                     {
                        _loc6_.x = this.x - 120;
                     }
                     else
                     {
                        _loc6_.x = this.x + 120;
                     }
                     _loc6_.y = this.y - 50;
                     this.doHit9(this.getBBDC().getDirect(),_loc6_);
                  }
               }
               break;
            case "hit10":
               if(this.bbdc.getCurFrameCount() == 100)
               {
                  if(param1.x == 3)
                  {
                     _loc6_ = new Point(0,0);
                     this.doHit10_1(this.getBBDC().getDirect(),_loc6_);
                  }
               }
               else if(this.bbdc.getCurFrameCount() == 95)
               {
                  if(param1.x == 3)
                  {
                     _loc6_ = new Point(this.x - 10,this.y);
                     this.doHit10_2(this.getBBDC().getDirect(),_loc6_);
                  }
               }
               if(this.lastHit == "hit10_3")
               {
                  if(this.standInObj)
                  {
                     this.doHit10_4(this.getBBDC().getDirect(),_loc6_);
                  }
               }
               break;
            case "hit11_1":
               if(this.bbdc.getCurFrameCount() == this.hit11Count)
               {
                  if(param1.x == 4)
                  {
                     this.doHit11_1(this.getBBDC().getDirect(),_loc6_);
                  }
               }
               break;
            case "hit11_2":
               _loc2_ = this.bbdc.getFrameStopCount();
               _loc3_ = uint(_loc2_[4][5]);
               if(this.bbdc.getCurFrameCount() == _loc3_)
               {
                  if(param1.x == 5)
                  {
                     this.doHit11_2(this.getBBDC().getDirect(),_loc6_);
                  }
               }
               break;
            case "hit12":
               if(this.bbdc.getCurFrameCount() == 17)
               {
                  if(param1.x == 0)
                  {
                     this.doHit12_1(this.getBBDC().getDirect(),_loc6_);
                  }
                  break;
               }
               if(this.bbdc.getCurFrameCount() == 1)
               {
                  if(param1.x == 0)
                  {
                     this.doHit12_2(this.getBBDC().getDirect(),_loc6_);
                  }
               }
               break;
            case "hit13":
               if(param1.x == 3)
               {
                  _loc6_.x = this.x;
                  _loc6_.y = this.y;
                  this.checkHit13(this.getBBDC().getDirect(),_loc6_);
               }
               break;
            case "hit14":
               if(this.bbdc.getCurFrameCount() == 2)
               {
                  if(param1.x == 0)
                  {
                     if(this.bbdc.getDirect() == 0)
                     {
                        _loc6_.x = this.x;
                     }
                     else
                     {
                        _loc6_.x = this.x;
                     }
                     _loc6_.y = this.y - 85;
                     this.doHit14_1(this.getBBDC().getDirect(),_loc6_);
                  }
               }
               else if(this.bbdc.getCurFrameCount() == 16)
               {
                  if(param1.x == 2)
                  {
                     if(this.bbdc.getDirect() == 0)
                     {
                        _loc6_.x = this.x - 145;
                     }
                     else
                     {
                        _loc6_.x = this.x + 145;
                     }
                     _loc6_.y = this.y - 60;
                     this.doHit14_2(this.getBBDC().getDirect(),_loc6_);
                  }
               }
               if(this.bbdc.getCurFrameCount() == 2)
               {
                  if(param1.x == 0)
                  {
                     for each(_loc4_ in this.shallowArray)
                     {
                        if(_loc4_)
                        {
                           if(!_loc4_.isReadyToDestroy)
                           {
                              _loc4_.setAction("hit2");
                           }
                        }
                     }
                  }
               }
               this.speed.y = 0;
         }
      }
      
      private function doHit1(param1:uint, param2:Point) : void
      {
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role1Bullet1");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit1");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit3(param1:uint, param2:Point) : void
      {
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role1Bullet3");
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
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role1Bullet4");
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
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role1Bullet5");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit5");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit6(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role1_hit6");
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role1Bullet6");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit6");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit7(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role1_hit7");
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role1Bullet7");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit7");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      public function doHit8(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role1_hit8");
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role1Bullet8");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit8");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit9(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role1_hit9");
         this.getBBDC().hide();
         this.setYourFather(11);
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role1Bullet9");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit9");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
         if(this.bbdc.getDirect() == 0)
         {
            this.speed.x = -40;
         }
         else
         {
            this.speed.x = 40;
         }
      }
      
      private function doHit10_1(param1:uint, param2:Point) : void
      {
         if(this.bbdc.getDirect() == 0)
         {
            this.speed.x = -28;
         }
         else
         {
            this.speed.x = 28;
         }
         this.speed.y = -35;
         this.setYourFather(5);
      }
      
      private function doHit10_2(param1:uint, param2:Point) : void
      {
         var bmLen:uint = 0;
         var i:uint = 0;
         var bm:BaseObject = null;
         var b:SpecialEffectBullet = null;
         var direct:uint = param1;
         var p:Point = param2;
         SoundManager.play("Role1_hit10_2");
         this.setStatic();
         this.speed.y = 0;
         this.setLostGraity();
         this.getBBDC().hide();
         bmLen = gc.getPlayerArray().length;
         i = 0;
         while(i < bmLen)
         {
            bm = gc.getPlayerArray()[i] as BaseObject;
            if(AUtils.GetDisBetweenTwoObj(this,bm) < 100)
            {
               this.setYourFather(45);
               b = new SpecialEffectBullet("Role1Bullet10_2");
               b.x = p.x;
               b.y = p.y;
               b.setRole(this);
               b.setDirect(direct);
               b.setAction("hit10_2");
               this.lastHit = "hit10_2";
               gc.gameSence.addChild(b);
               this.magicBulletArray.push(b);
               TweenMax.delayedCall(1.9,function(param1:*, param2:uint, param3:Point):*
               {
                  param1.doHit10_3(param2,param3);
               },[this,direct,p]);
               return;
            }
            i++;
         }
         this.doHit10_3(direct,p);
      }
      
      private function doHit10_3(param1:uint, param2:Point) : void
      {
         this.setYourFather(80);
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("Role1Bullet10_3");
         _loc3_.x = this.x;
         _loc3_.y = this.y - 40;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit10_3");
         this.lastHit = "hit10_3";
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
         this.setYourFather(60);
         this.resetGraity();
         if(this.bbdc.getDirect() == 0)
         {
            this.speed.x = -40;
         }
         else
         {
            this.speed.x = 40;
         }
         this.speed.y = 40;
      }
      
      private function doHit10_4(param1:uint, param2:Point) : void
      {
         var b:SpecialEffectBullet = null;
         var direct:uint = param1;
         var p:Point = param2;
         SoundManager.play("Role1_hit10_4");
         b = new SpecialEffectBullet("Role1Bullet10_4");
         b.x = this.x;
         b.y = this.y + 40;
         b.setRole(this);
         b.setDirect(direct);
         b.setAction("hit10_4");
         this.lastHit = "hit10_4";
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
         gc.vControllor.shake(25);
         this.setStatic();
         this.setYourFather(10);
         TweenMax.delayedCall(0.45,function(param1:*):*
         {
            param1.hit10Over();
         },[this]);
      }
      
      private function hit10Over() : void
      {
         this.getBBDC().show();
         this.setAction("wait");
      }
      
      private function hit11Over() : *
      {
         var _loc1_:* = null;
         for each(_loc1_ in this.magicBulletArray)
         {
            if(_loc1_.getImcName() == "Role1Bullet11_1" || _loc1_.getImcName() == "Role1Bullet11_2")
            {
               _loc1_.destroy();
            }
         }
         this.resetGraity();
         this.speed.y = 0;
         if(!this.isInSky())
         {
            this.setAction("wait");
         }
         else
         {
            this.setAction("jump3");
         }
      }
      
      private function doHit11_1(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role1_hit11");
         if(this.bbdc.getDirect() == 0)
         {
            this.speed.x = -25;
         }
         else
         {
            this.speed.x = 25;
         }
         var _loc3_:FollowBaseObjectBullet = new FollowBaseObjectBullet("Role1Bullet11_1");
         if(this.bbdc.getDirect() == 0)
         {
            _loc3_.x = this.x - 50;
         }
         else
         {
            _loc3_.x = this.x + 50;
         }
         _loc3_.y = this.y - 50;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit11_1");
         this.lastHit = "hit11_1";
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function doHit11_2(param1:uint, param2:Point) : void
      {
         var _loc3_:* = null;
         var _loc4_:* = null;
         SoundManager.play("Role1_hit11");
         this.speed.x = 0;
         this.speed.y = -25;
         this.setLostGraity();
         for each(_loc3_ in this.magicBulletArray)
         {
            if(_loc3_.getImcName() == "Role1Bullet11_1")
            {
               _loc3_.destroy();
            }
         }
         _loc4_ = new FollowBaseObjectBullet("Role1Bullet11_2");
         if(this.bbdc.getDirect() == 0)
         {
            _loc4_.x = this.x;
         }
         else
         {
            _loc4_.x = this.x;
         }
         _loc4_.y = this.y - 50;
         _loc4_.setRole(this);
         _loc4_.setDirect(param1);
         _loc4_.setAction("hit11_2");
         this.lastHit = "hit11_2";
         gc.gameSence.addChild(_loc4_);
         this.magicBulletArray.push(_loc4_);
      }
      
      private function doHit12_1(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role1_hit12_1");
         var _loc3_:MovieClip = AUtils.getNewObj("Role1Bullet12_1_1") as MovieClip;
         var _loc4_:MovieClip = AUtils.getNewObj("Role1Bullet12_1_2") as MovieClip;
         if(this.bbdc.getDirect() == 0)
         {
            _loc3_.x = this.x - 22;
         }
         else
         {
            _loc3_.x = this.x + 21;
            AUtils.flipHorizontal(_loc3_,-1);
         }
         _loc3_.y = this.y - 10;
         if(this.bbdc.getDirect() == 0)
         {
            _loc4_.x = this.x - 55;
         }
         else
         {
            _loc4_.x = this.x - 65;
         }
         _loc4_.y = this.y;
         gc.gameSence.addChild(_loc3_);
         gc.gameSence.addChild(_loc4_);
      }
      
      private function doHit12_2(param1:uint, param2:Point) : void
      {
         var _loc3_:* = null;
         var _loc4_:* = null;
         var _loc5_:* = 9999;
         var _loc6_:uint = gc.getPlayerArray().length;
         for(var _loc7_:int = 0; _loc7_ < _loc6_; _loc7_++)
         {
            _loc4_ = gc.getPlayerArray()[_loc7_] as BaseObject;
            if(this.getBBDC().getDirect() == 0)
            {
               if(_loc4_.x > this.x)
               {
                  continue;
               }
            }
            if(_loc4_.x >= this.x)
            {
               if(_loc5_ > AUtils.GetDisBetweenTwoObj(this,_loc4_))
               {
                  _loc5_ = Number(AUtils.GetDisBetweenTwoObj(this,_loc4_));
                  _loc3_ = _loc4_;
               }
            }
         }
         if(_loc3_)
         {
            this.hit12Boom(_loc3_,this,3);
         }
      }
      
      private function hit12Boom(param1:BaseObject, param2:Monster34, param3:uint) : void
      {
         var _self:Monster34 = null;
         _self = null;
         _self = null;
         var b:SpecialEffectBullet = null;
         var _target:BaseObject = param1;
         _self = param2;
         var times:uint = param3;
         if(times > 0)
         {
            if(!this.isDead())
            {
               SoundManager.play("Role1_hit12_2");
               b = new SpecialEffectBullet("Role1Bullet12");
               b.x = _target.x;
               b.y = _target.y;
               b.setRole(_self);
               b.setDirect(_self.getBBDC().getDirect());
               b.setAction("hit12");
               gc.gameSence.addChild(b);
               _self.magicBulletArray.push(b);
               times--;
               TweenMax.delayedCall(2,function(param1:BaseObject, param2:Monster34, param3:uint):*
               {
                  _self.hit12Boom(param1,param2,param3);
               },[_target,_self,times]);
            }
            else
            {
               times = 0;
            }
         }
      }
      
      private function otherShowHit12(param1:uint, param2:Point) : void
      {
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("Role1Bullet12");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setDisable();
         _loc3_.setAction("hit12_2");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      private function checkHit13(param1:uint, param2:Point) : void
      {
         var _loc3_:* = null;
         var _loc4_:* = null;
         SoundManager.play("Role1_hit13_1");
         this.curAction = "hit13";
         if(param1 == 0)
         {
            this.speed.x = -30;
         }
         else
         {
            this.speed.x = 30;
         }
         for each(_loc3_ in gc.getPlayerArray())
         {
            if(this.colipse.hitTestObject(_loc3_.colipse))
            {
               _loc4_ = new Point();
               _loc4_.x = _loc3_.x;
               _loc4_.y = _loc3_.y;
               this.doHit13(this.getBBDC().getDirect(),_loc4_);
               return;
            }
         }
      }
      
      private function doHit13(param1:uint, param2:Point) : void
      {
         var b:SpecialEffectBullet = null;
         var direct:uint = param1;
         var point:Point = param2;
         SoundManager.play("Role1_hit13_2");
         this.curAction = "hit13";
         this.getBBDC().stopFrame();
         this.setStatic();
         this.getBBDC().hide();
         TweenMax.delayedCall(1.25,function(param1:*):*
         {
            param1.setAction("wait");
            param1.getBBDC().continueFrame();
            param1.getBBDC().show();
         },[this]);
         b = new SpecialEffectBullet("Role1Bullet13");
         b.x = point.x;
         b.y = point.y;
         b.setRole(this);
         b.setDirect(direct);
         b.setAction("hit13");
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
      }
      
      public function createShallow(param1:uint = 0, param2:Point = null) : void
      {
         var _loc3_:* = null;
         if(!param2)
         {
            _loc3_ = new Point();
            _loc3_.x = this.x + (Math.random() - 0.5) * 150;
            _loc3_.y = this.y;
         }
         else
         {
            _loc3_ = param2;
         }
         var _loc4_:Role1Shadow = new Role1Shadow(this);
         if(this.getBBDC().getDirect() == 1)
         {
            _loc4_.getBBDC().turnRight();
         }
         _loc4_.x = _loc3_.x;
         _loc4_.y = _loc3_.y;
         gc.gameSence.addChild(_loc4_);
         this.shallowArray.push(_loc4_);
         this.skillCD1[1] = 0;
      }
      
      public function doHit14_1(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role1_hit14");
         this.curAction = "hit14";
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("Role1Bullet14_1");
         if(param1 == 0)
         {
            _loc3_.x = param2.x + 15;
         }
         else
         {
            _loc3_.x = param2.x - 15;
         }
         _loc3_.y = param2.y;
         _loc3_.setDisable();
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit14");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      public function doHit14_2(param1:uint, param2:Point) : void
      {
         this.curAction = "hit14";
         var _loc3_:SpecialEffectBullet = new SpecialEffectBullet("Role1Bullet14_2");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit14");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         return this.curAttackTarget != null;
      }
      
      override protected function releSkill1() : void
      {
         var skillArray:Array = null;
         var shallowFlag:Boolean = false;
         var randSkil:String = null;
         var r1s:Role1Shadow = null;
         this.newAttackId();
         skillArray = ["hit5","hit6","hit7","hit8","hit9","hit10","hit11_1","hit12","hit13","hit14"];
         shallowFlag = false;
         for each(r1s in this.shallowArray)
         {
            if(r1s)
            {
               shallowFlag = true;
               break;
            }
         }
         if(shallowFlag)
         {
            skillArray = ["hit8","hit14"];
            this.skillCD1[1] = 0;
         }
         randSkil = skillArray[int(Math.random() * skillArray.length)];
         this.faceToTarget();
         this.setYourFather(10);
         this.setAction(randSkil);
         this.lastHit = randSkil;
         if(randSkil == "hit11_1")
         {
            TweenMax.delayedCall(1,function(param1:*):*
            {
               param1.setAction("hit11_2");
            },[this]);
         }
      }
      
      override protected function exitFrameFunc(param1:Point) : void
      {
      }
      
      override protected function myIntelligence() : void
      {
         var len:uint = 0;
         var i:uint = 0;
         var r1s:Role1Shadow = null;
         var loc1:* = undefined;
         var loc2:* = undefined;
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
         len = uint(this.shallowArray.length);
         i = 0;
         while(i < len)
         {
            r1s = this.shallowArray[i] as Role1Shadow;
            if(r1s)
            {
               if(r1s.isReadyToDestroy)
               {
                  this.shallowArray[i] = null;
               }
               else
               {
                  r1s.step();
               }
            }
            i++;
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
      
      override public function setAttackBack(param1:Point) : void
      {
         if(!this.isGXP)
         {
            super.setAttackBack(param1);
         }
      }
      
      override public function reduceHp(param1:int, param2:Boolean = false) : void
      {
         if(this.isGXP)
         {
            param2 = false;
         }
         super.reduceHp(param1,param2);
      }
      
      override protected function isCannotMoveWhenAttackOnFloor() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3" && gc.protectedPerproty.getProperty(this,"jumpCount") == 0 || this.curAction == "hit4" || this.curAction == "hit5" || this.curAction == "hit8" || this.curAction == "hit14";
      }
      
      override public function isAttacking() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3" || this.curAction == "hit4" || this.curAction == "hit5" || this.curAction == "hit6" || this.curAction == "hit7" || this.curAction == "hit8" || this.curAction == "hit9" || this.curAction == "hit10" || this.curAction == "hit11_1" || this.curAction == "hit11_2" || this.curAction == "hit12" || this.curAction == "hit13" || this.curAction == "hit14";
      }
      
      override protected function isCannotMoveWhenAttack() : Boolean
      {
         return this.curAction == "hit14" || this.curAction == "hit12";
      }
      
      override public function isCanMoveWhenAttack() : Boolean
      {
         return this.curAction == "hit7" || this.curAction == "hit9" || this.curAction == "hit10" || this.curAction == "hit11_1" || this.curAction == "hit11_2" || this.curAction == "hit13";
      }
      
      override public function destroy() : void
      {
         super.destroy();
         if(this.gc.curStage == 4)
         {
            MainGame.getInstance().createMonster(172,800,300);
         }
      }
   }
}

