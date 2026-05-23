package export.monster
{
   import base.*;
   import com.greensock.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.events.*;
   import flash.geom.*;
   import flash.utils.*;
   import manager.*;
   import my.*;
   
   public class Monster999 extends BaseMonster
   {
      
      internal var isNotArrow:Boolean = true;
      
      internal var role4Hit5:MonsterRole4Hit5;
      
      internal var gxpCount:uint = 0;
      
      public function Monster999()
      {
         super();
         this.horizenSpeed = 6;
         this.setHp(26083);
         this.setSHp(26083);
         this.normalAttackRate = 0.5;
         this.protectedParamsObject.mysee = 300;
         this.protectedParamsObject.isattback = 50;
         this.attackRange = 250;
         this.alertRange = 1000;
         this.normalAttackRate = 0.7;
         this.protectedParamsObject.def = 58;
         this.protectedParamsObject.mDef = 0.3;
         this.gxpCount = gc.frameClips * 6;
         this.protectedParamsObject.exp = 200;
         this.protectedParamsObject.gxp = 200;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[2,-3],
            "attackInterval":999,
            "power":300,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit1Arrow"] = {
            "hitMaxCount":1,
            "attackBackSpeed":[0.5,-3],
            "attackInterval":999,
            "power":300,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit2"] = {
            "hitMaxCount":20,
            "attackBackSpeed":[0.5,-3],
            "attackInterval":999,
            "power":300,
            "attackKind":"physics"
         };
         this.attackBackInfoDict["hit2Arrow"] = {
            "hitMaxCount":20,
            "attackBackSpeed":[0.5,-3],
            "attackInterval":5,
            "power":191 * 0.2,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit3"] = {
            "hitMaxCount":20,
            "attackBackSpeed":[0.5,-3],
            "attackInterval":7,
            "power":191 * 0.24,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit4"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[5,-3],
            "attackInterval":12,
            "power":191 * 0.36,
            "attackKind":"magic",
            "addEffect":[{
               "name":BaseAddEffect.POISON,
               "time":gc.frameClips * 5,
               "power":10
            },{
               "name":BaseAddEffect.POISON_TIMES,
               "time":gc.frameClips * 5
            }]
         };
         this.attackBackInfoDict["hit4Arrow"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[5,-3],
            "attackInterval":999,
            "power":191,
            "attackKind":"magic",
            "addEffect":[{
               "name":BaseAddEffect.POISON,
               "time":gc.frameClips * 5,
               "power":10
            },{
               "name":BaseAddEffect.POISON_TIMES,
               "time":gc.frameClips * 5
            }]
         };
         this.attackBackInfoDict["hit5"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[0,-2],
            "attackInterval":999,
            "power":191,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit6"] = {
            "hitMaxCount":1,
            "attackBackSpeed":[0,-2],
            "attackInterval":999,
            "power":191,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit7"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[0,-2],
            "attackInterval":999,
            "power":191,
            "attackKind":"magic",
            "addEffect":[{
               "name":BaseAddEffect.POISON,
               "time":gc.frameClips * 4,
               "power":gc.hero1.roleProperies.getSHHP() * 0.005
            },{
               "name":BaseAddEffect.POISON_TIMES,
               "time":gc.frameClips * 4
            }]
         };
         this.attackBackInfoDict["hit8"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[30,-2],
            "attackInterval":999,
            "power":191,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit8Arrow"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[30,-2],
            "attackInterval":999,
            "power":191,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit9"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[15,-25],
            "attackInterval":999,
            "power":191,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit9Arrow"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[5,0],
            "attackInterval":4,
            "power":191 * 0.18,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit10"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[10,-2],
            "attackInterval":8,
            "power":191 * 0.2,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit10Arrow"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[10,-2],
            "attackInterval":999,
            "power":191,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit11"] = {
            "hitMaxCount":100,
            "attackBackSpeed":[0,0],
            "attackInterval":7,
            "power":191 * 0.2,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit12"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[5,-2],
            "attackInterval":20,
            "power":191 * 0.4,
            "attackKind":"magic"
         };
         this.attackBackInfoDict["hit12Arrow"] = {
            "hitMaxCount":999,
            "attackBackSpeed":[5,-2],
            "attackInterval":10,
            "power":191 * 0.32,
            "attackKind":"magic"
         };
         this.isBoss = true;
         this.monsterName = "???";
         this.setAction("wait");
         this.protectedParamsObject.probability = 0;
         this.fallList = [];
         this.skillCD = [gc.frameClips * 2,gc.frameClips * 6];
         this.skillCD1 = [gc.frameClips * 2,gc.frameClips * 3.5];
      }
      
      override public function isAttacking() : Boolean
      {
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit3" || this.curAction == "hit4" || this.curAction == "hit5" || this.curAction == "hit6" || this.curAction == "hit7" || this.curAction == "hit8" || this.curAction == "hit9" || this.curAction == "hit10" || this.curAction == "hit11" || this.curAction == "hit11Frame2" || this.curAction == "hit12";
      }
      
      override public function isCanMoveWhenAttack() : Boolean
      {
         if(this.isNotArrow)
         {
            return this.curAction == "hit10" || this.curAction == "hit8";
         }
         return this.curAction == "hit8";
      }
      
      override public function destroy() : void
      {
         var bh:BaseHero = null;
         var localPoint:Point = null;
         var i:int = 0;
         bh = null;
         localPoint = null;
         bh = null;
         localPoint = null;
         super.destroy();
         i = 0;
         while(i < gc.pWorld.heroArray.length)
         {
            localPoint = gc.gameSence.globalToLocal(new Point(0,0));
            bh = gc.pWorld.heroArray[i] as BaseHero;
            TweenMax.delayedCall(1,function():*
            {
               TweenMax.to(bh,1,{
                  "x":localPoint.x,
                  "y":localPoint.y
               });
            });
            i++;
         }
         TweenMax.delayedCall(2,function():*
         {
            if(getHp() <= 0)
            {
               gc.curStage = 18;
               gc.curLevel = 1;
               MainGame.getInstance().destroyGame();
               gc.eventManger.dispatchEvent(new Event("ReStart"));
            }
         });
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:Object = null;
         var _loc2_:* = null;
         var _loc3_:* = BaseBitmapDataPool.getBitmapDataArrayByName("ROLE4_EQUIP_11");
         var _loc4_:* = BaseBitmapDataPool.getBitmapDataArrayByName("ROLE4_SHOVEL_9");
         if(_loc3_)
         {
            _loc2_ = {
               "name":"equip",
               "source":_loc3_
            };
            _loc1_ = {
               "name":"body",
               "source":_loc4_
            };
            bbdc = new BaseBitmapDataClip([_loc1_,_loc2_],200,200,new Point(0,0));
            bbdc.setOffsetXY(15,-13);
            if(this.isNotArrow)
            {
               bbdc.setFrameStopCount([[2,2,2,3,2,4],[2,2,2,13,2,24],[4,4,4,4],[2,2,2,2],[1,1,15,6,10,4],[2,2,2,2,2],[2,2,6],[2,2,11],[1,1,1,2],[2,19],[2,2,30],[2,2,2,15],[2,2,16],[2,2,14]]);
               bbdc.setFrameCount([36,6,4,4,[1,1,1,1,1,1],5,3,3,12,2,3,4,3,3]);
            }
            else
            {
               bbdc.setFrameStopCount([[2,2,2,3,2,4],[2,2,2,13,2,24],[4,4,4,4],[2,2,2,2],[1,1,15,10,20,4],[2,2,2,2,2],[2,2,1,1,12],[2,2,2,2,2,10],[2,4,1,1,10],[2,2,30],[2,2,1,1,12],[2,2,2,2,2,20],[2,7,1,1,25],[2,18,2,2,2,24]]);
               bbdc.setFrameCount([36,6,4,4,[1,1,1,1,1,1],5,5,6,5,3,5,6,5,6]);
            }
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster999--BitmapData Error!");
      }
      
      override protected function newColipse() : void
      {
         this.colipse = AUtils.getNewObj("ObjectBaseSprite") as Sprite;
         this.colipse.visible = false;
         this.addChild(this.colipse);
      }
      
      override public function setAction(param1:String) : void
      {
         var loc2:* = undefined;
         var str:String = null;
         var curPoint:Point = null;
         var loc1:* = undefined;
         var arg1:String = param1;
         str = arg1;
         super.setAction(str);
         curPoint = this.bbdc.getCurPoint();
         loc2 = str;
         switch(loc2)
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
               if(this.isNotArrow)
               {
                  if(curPoint.y != 6)
                  {
                     this.bbdc.setFramePointX(0);
                     this.bbdc.setFramePointY(6);
                  }
               }
               else if(curPoint.y != 6)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(6);
               }
               this.bbdc.setState(str);
               break;
            case "hit2":
               if(this.isNotArrow)
               {
                  if(curPoint.y != 7)
                  {
                     this.bbdc.setFramePointX(0);
                     this.bbdc.setFramePointY(7);
                  }
               }
               else if(curPoint.y != 6)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(6);
               }
               this.bbdc.setState(str);
               break;
            case "hit3":
               if(this.isNotArrow)
               {
                  if(curPoint.y != 8)
                  {
                     this.bbdc.setFramePointX(0);
                     this.bbdc.setFramePointY(8);
                  }
               }
               else if(curPoint.y != 7)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(7);
               }
               this.bbdc.setState(str);
               break;
            case "hit4":
               if(this.isNotArrow)
               {
                  if(curPoint.y != 9)
                  {
                     this.bbdc.setFramePointX(0);
                     this.bbdc.setFramePointY(9);
                  }
               }
               else if(curPoint.y != 8)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(8);
               }
               this.bbdc.setState(str);
               break;
            case "hit5":
               if(this.isNotArrow)
               {
                  if(curPoint.y != 9)
                  {
                     this.bbdc.setFramePointX(0);
                     this.bbdc.setFramePointY(9);
                  }
               }
               else if(curPoint.x != 4 || curPoint.y != 4)
               {
                  this.bbdc.setFramePointX(4);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(str);
               break;
            case "hit6":
               if(this.isNotArrow)
               {
                  if(curPoint.x != 4 || curPoint.y != 4)
                  {
                     this.bbdc.setFramePointX(4);
                     this.bbdc.setFramePointY(4);
                  }
               }
               else if(curPoint.x != 3 || curPoint.y != 4)
               {
                  this.bbdc.setFramePointX(3);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(str);
               break;
            case "hit7":
               if(this.isNotArrow)
               {
                  if(curPoint.y != 10)
                  {
                     this.bbdc.setFramePointX(0);
                     this.bbdc.setFramePointY(10);
                  }
               }
               else if(curPoint.y != 9)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(9);
               }
               this.bbdc.setState(str);
               break;
            case "hit8":
               if(this.isNotArrow)
               {
                  if(curPoint.y != 11)
                  {
                     this.bbdc.setFramePointX(0);
                     this.bbdc.setFramePointY(11);
                  }
               }
               else if(curPoint.y != 10)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(10);
               }
               this.bbdc.setState(str);
               break;
            case "hit9":
               if(this.isNotArrow)
               {
                  if(curPoint.y != 12)
                  {
                     this.bbdc.setFramePointX(0);
                     this.bbdc.setFramePointY(12);
                  }
               }
               else if(curPoint.y != 11)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(11);
               }
               this.bbdc.setState(str);
               break;
            case "hit10":
               if(this.isNotArrow)
               {
                  if(curPoint.y != 10)
                  {
                     this.bbdc.setFramePointX(0);
                     this.bbdc.setFramePointY(10);
                  }
               }
               else if(curPoint.y != 12)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(12);
               }
               this.bbdc.setState(str);
               break;
            case "hit11":
               if(curPoint.x != 5 || curPoint.y != 4)
               {
                  this.bbdc.setFramePointX(5);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(str);
               break;
            case "hit12":
               if(curPoint.y != 13)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(13);
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
         var _loc2_:* = this.bbdc.getState();
         var _loc3_:* = _loc2_;
         switch(_loc3_)
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
               this.setStatic();
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
               this.speed.y = 0;
               this.setAction("wait");
               break;
            case "hit10":
               this.setStatic();
               this.setAction("wait");
               break;
            case "hit11":
               this.setAction("wait");
               break;
            case "hit11Frame2":
               this.setAction("wait");
               break;
            case "hit12":
               this.lastHit = "";
               this.getBBDC().show();
               this.setAction("wait");
               break;
            case "hurt":
               this.setStatic();
               this.setAction("wait");
         }
      }
      
      override protected function enterFrameFunc(param1:Point) : void
      {
         var _loc2_:* = undefined;
         var _loc3_:* = null;
         var _loc4_:* = NaN;
         var _loc5_:* = NaN;
         var _loc6_:* = null;
         var _loc7_:* = null;
         var _loc8_:* = this.bbdc.getState();
         var _loc9_:* = new Point();
         var _loc10_:* = _loc8_;
         switch(_loc10_)
         {
            case "hit1":
               if(this.isNotArrow)
               {
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     if(param1.x == 1)
                     {
                        if(this.bbdc.getDirect() != 0)
                        {
                           _loc9_.x = this.x + 20;
                        }
                        else
                        {
                           _loc9_.x = this.x - 20;
                        }
                        _loc9_.y = this.y + 30;
                        this.doHit1(this.getBBDC().getDirect(),_loc9_);
                     }
                  }
                  break;
               }
               if(this.bbdc.getCurFrameCount() == 1)
               {
                  if(param1.x == 2)
                  {
                     if(this.bbdc.getDirect() != 0)
                     {
                        _loc9_.x = this.x + 90;
                     }
                     else
                     {
                        _loc9_.x = this.x - 90;
                     }
                     _loc9_.y = this.y;
                     this.doHit1Arrow(this.getBBDC().getDirect(),_loc9_);
                  }
               }
               break;
            case "hit2":
               if(this.isNotArrow)
               {
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     if(param1.x == 1)
                     {
                        if(this.bbdc.getDirect() != 0)
                        {
                           _loc9_.x = this.x + 15;
                        }
                        else
                        {
                           _loc9_.x = this.x - 15;
                        }
                        _loc9_.y = this.y;
                        this.doHit2(this.getBBDC().getDirect(),_loc9_);
                     }
                  }
                  break;
               }
               if(this.bbdc.getCurFrameCount() == 1)
               {
                  if(param1.x == 2)
                  {
                     if(this.bbdc.getDirect() != 0)
                     {
                        _loc9_.x = this.x + 90;
                     }
                     else
                     {
                        _loc9_.x = this.x - 90;
                     }
                     _loc9_.y = this.y;
                     this.doHit1Arrow(this.getBBDC().getDirect(),_loc9_);
                  }
               }
               break;
            case "hit3":
               if(this.isNotArrow)
               {
                  if(this.bbdc.getCurFrameCount() == 1)
                  {
                     if(param1.x == 0)
                     {
                        if(this.bbdc.getDirect() != 0)
                        {
                           _loc9_.x = this.x;
                        }
                        else
                        {
                           _loc9_.x = this.x;
                        }
                        _loc9_.y = this.y;
                        this.doHit3(this.getBBDC().getDirect(),_loc9_);
                     }
                  }
                  if(this.getBBDC().getDirect() != 0)
                  {
                     this.speed.x = 8;
                     break;
                  }
                  this.speed.x = -8;
                  break;
               }
               if(this.bbdc.getCurFrameCount() == 2)
               {
                  if(param1.x == 1)
                  {
                     if(this.bbdc.getDirect() != 0)
                     {
                        _loc9_.x = this.x + 115;
                     }
                     else
                     {
                        _loc9_.x = this.x - 115;
                     }
                     _loc9_.y = this.y - 20;
                     this.doHit2Arrow(this.getBBDC().getDirect(),_loc9_);
                  }
               }
               break;
            case "hit4":
               if(this.isNotArrow)
               {
                  if(this.bbdc.getCurFrameCount() == 19)
                  {
                     if(param1.x == 1)
                     {
                        if(this.bbdc.getDirect() != 0)
                        {
                           _loc9_.x = this.x + 245;
                        }
                        else
                        {
                           _loc9_.x = this.x - 245;
                        }
                        _loc9_.y = this.y - 110;
                        this.doHit4(this.getBBDC().getDirect(),_loc9_);
                     }
                  }
                  break;
               }
               if(this.bbdc.getCurFrameCount() == 1)
               {
                  if(param1.x == 2)
                  {
                     if(this.bbdc.getDirect() != 0)
                     {
                        _loc9_.x = this.x + 30;
                     }
                     else
                     {
                        _loc9_.x = this.x - 30;
                     }
                     _loc9_.y = this.y;
                     this.doHit4Arrow(this.getBBDC().getDirect(),_loc9_);
                  }
               }
               break;
            case "hit5":
               if(this.isNotArrow)
               {
                  if(this.bbdc.getCurFrameCount() == 19)
                  {
                     if(param1.x == 1)
                     {
                        if(this.bbdc.getDirect() != 0)
                        {
                           _loc9_.x = this.x + 115;
                        }
                        else
                        {
                           _loc9_.x = this.x - 115;
                        }
                        _loc9_.y = this.y - 110;
                        this.doHit5_1(this.getBBDC().getDirect(),_loc9_);
                     }
                  }
               }
               else if(this.bbdc.getCurFrameCount() == 20)
               {
                  if(param1.x == 4)
                  {
                     if(this.bbdc.getDirect() != 0)
                     {
                        _loc9_.x = this.x + 115;
                     }
                     else
                     {
                        _loc9_.x = this.x - 115;
                     }
                     _loc9_.y = this.y - 110;
                     this.doHit5_1(this.getBBDC().getDirect(),_loc9_);
                  }
               }
               if(this.bbdc.getCurFrameCount() == 14)
               {
                  if(param1.x == 1 || param1.x == 4)
                  {
                     if(this.bbdc.getDirect() != 0)
                     {
                        _loc9_.x = this.x;
                     }
                     else
                     {
                        _loc9_.x = this.x;
                     }
                     _loc9_.y = this.y - 20;
                     _loc4_ = 9999;
                     _loc10_ = 0;
                     _loc2_ = gc.getPlayerArray();
                     for each(_loc6_ in _loc2_)
                     {
                        if(this.getBBDC().getDirect() == 0)
                        {
                           if(this.x > _loc6_.x)
                           {
                              _loc5_ = AUtils.GetDisBetweenTwoObj(this,_loc6_);
                              if(_loc4_ > _loc5_)
                              {
                                 _loc4_ = _loc5_;
                                 _loc3_ = _loc6_;
                              }
                           }
                        }
                        else if(this.x < _loc6_.x)
                        {
                           _loc5_ = AUtils.GetDisBetweenTwoObj(this,_loc6_);
                           if(_loc4_ > _loc5_)
                           {
                              _loc4_ = _loc5_;
                              _loc3_ = _loc6_;
                           }
                        }
                     }
                     if(_loc3_)
                     {
                        this.doHit5_2(this.getBBDC().getDirect(),_loc9_,_loc3_);
                     }
                  }
               }
               break;
            case "hit6":
               if(this.isNotArrow)
               {
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     if(param1.x == 4)
                     {
                        if(this.bbdc.getDirect() != 0)
                        {
                           _loc9_.x = this.x + 25;
                        }
                        else
                        {
                           _loc9_.x = this.x - 25;
                        }
                        _loc9_.y = this.y - 30;
                        this.doHit6(this.getBBDC().getDirect(),_loc9_);
                     }
                  }
                  break;
               }
               if(this.bbdc.getCurFrameCount() == 10)
               {
                  if(param1.x == 3)
                  {
                     if(this.bbdc.getDirect() != 0)
                     {
                        _loc9_.x = this.x + 25;
                     }
                     else
                     {
                        _loc9_.x = this.x - 25;
                     }
                     _loc9_.y = this.y - 30;
                     this.doHit6(this.getBBDC().getDirect(),_loc9_);
                  }
               }
               break;
            case "hit7":
               if(this.bbdc.getCurFrameCount() == 20)
               {
                  if(param1.x == 2)
                  {
                     _loc10_ = 0;
                     _loc2_ = this.magicBulletArray;
                     for each(_loc7_ in _loc2_)
                     {
                        if(_loc7_.getImcName() == "Role4Bullet7_1")
                        {
                           _loc7_.destroy();
                        }
                     }
                     if(this.bbdc.getDirect() != 0)
                     {
                        _loc9_.x = this.x + 155;
                     }
                     else
                     {
                        _loc9_.x = this.x - 155;
                     }
                     _loc9_.y = this.y - 50;
                     this.doHit7_1(this.getBBDC().getDirect(),_loc9_);
                  }
               }
               if(this.bbdc.getCurFrameCount() == 8)
               {
                  if(param1.x == 2)
                  {
                     if(this.bbdc.getDirect() != 0)
                     {
                        _loc9_.x = this.x + 150;
                     }
                     else
                     {
                        _loc9_.x = this.x - 150;
                     }
                     _loc9_.y = this.y - 70;
                     this.doHit7_2(this.getBBDC().getDirect(),_loc9_);
                  }
               }
               break;
            case "hit8":
               if(this.isNotArrow)
               {
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     if(param1.x == 2)
                     {
                        if(this.bbdc.getDirect() != 0)
                        {
                           _loc9_.x = this.x + 125;
                        }
                        else
                        {
                           _loc9_.x = this.x - 125;
                        }
                        _loc9_.y = this.y - 30;
                        this.doHit8(this.getBBDC().getDirect(),_loc9_);
                     }
                  }
                  break;
               }
               if(this.bbdc.getCurFrameCount() == 2)
               {
                  if(param1.x == 0)
                  {
                     if(this.bbdc.getDirect() != 0)
                     {
                        _loc9_.x = this.x + 75;
                     }
                     else
                     {
                        _loc9_.x = this.x - 75;
                     }
                     _loc9_.y = this.y - 60;
                     this.doHit8Arrow_1(this.getBBDC().getDirect(),_loc9_);
                  }
               }
               if(this.bbdc.getCurFrameCount() == 2)
               {
                  if(param1.x == 0)
                  {
                     if(this.bbdc.getDirect() != 0)
                     {
                        _loc9_.x = this.x + 65;
                     }
                     else
                     {
                        _loc9_.x = this.x - 65;
                     }
                     _loc9_.y = this.y - 10;
                     this.doHit8Arrow_2(this.getBBDC().getDirect(),_loc9_);
                  }
               }
               if(param1.x != 0)
               {
                  this.setStatic();
                  this.speed.y = 0;
                  break;
               }
               if(this.bbdc.getDirect() != 0)
               {
                  this.isLeft = true;
                  this.isRight = false;
                  this.speed.x = -25;
                  this.speed.y = -25;
                  break;
               }
               this.isRight = true;
               this.isLeft = false;
               this.speed.x = 25;
               this.speed.y = -25;
               break;
            case "hit9":
               if(this.isNotArrow)
               {
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     if(param1.x == 0)
                     {
                        if(this.bbdc.getDirect() != 0)
                        {
                           _loc9_.x = this.x;
                        }
                        else
                        {
                           _loc9_.x = this.x;
                        }
                        _loc9_.y = this.y;
                        this.doHit9_1(this.getBBDC().getDirect(),_loc9_);
                     }
                  }
                  if(this.bbdc.getCurFrameCount() == 13)
                  {
                     if(param1.x == 2)
                     {
                        if(this.bbdc.getDirect() != 0)
                        {
                           _loc9_.x = this.x;
                        }
                        else
                        {
                           _loc9_.x = this.x;
                        }
                        _loc9_.y = this.y - 80;
                        this.doHit9_2(this.getBBDC().getDirect(),_loc9_);
                     }
                  }
                  if(param1.x == 2)
                  {
                     this.speed.y = -10;
                  }
                  break;
               }
               if(this.bbdc.getCurFrameCount() == 2)
               {
                  if(param1.x == 0)
                  {
                     if(this.bbdc.getDirect() != 0)
                     {
                        _loc9_.x = this.x + 80;
                     }
                     else
                     {
                        _loc9_.x = this.x - 80;
                     }
                     _loc9_.y = this.y - 80;
                     this.doHit9Arrow_1(this.getBBDC().getDirect(),_loc9_);
                  }
               }
               if(this.bbdc.getCurFrameCount() == 2)
               {
                  if(param1.x == 1)
                  {
                     if(this.bbdc.getDirect() != 0)
                     {
                        _loc9_.x = this.x + 60;
                     }
                     else
                     {
                        _loc9_.x = this.x - 60;
                     }
                     _loc9_.y = this.y + 30;
                     this.doHit9Arrow_2(this.getBBDC().getDirect(),_loc9_);
                  }
               }
               if(param1.x <= 1)
               {
                  this.speed.y = -35;
               }
               else
               {
                  this.speed.y = 0;
               }
               this.setStatic();
               break;
            case "hit10":
               if(this.isNotArrow)
               {
                  if(this.bbdc.getCurFrameCount() == 2)
                  {
                     if(param1.x == 0)
                     {
                        if(this.bbdc.getDirect() != 0)
                        {
                           _loc9_.x = this.x + 150;
                        }
                        else
                        {
                           _loc9_.x = this.x - 150;
                        }
                        _loc9_.y = this.y - 50;
                        this.doHit10(this.getBBDC().getDirect(),_loc9_);
                     }
                  }
                  if(param1.x < 2)
                  {
                     if(this.getBBDC().getDirect() != 0)
                     {
                        this.speed.x = 20;
                        break;
                     }
                     this.speed.x = -20;
                     break;
                  }
                  this.setStatic();
                  break;
               }
               if(this.bbdc.getCurFrameCount() == 2)
               {
                  if(param1.x == 0)
                  {
                     if(this.bbdc.getDirect() != 0)
                     {
                        _loc9_.x = this.x;
                     }
                     else
                     {
                        _loc9_.x = this.x;
                     }
                     _loc9_.y = this.y;
                     this.doHit10Arrow_1(this.getBBDC().getDirect(),_loc9_);
                  }
               }
               if(this.bbdc.getCurFrameCount() == 24)
               {
                  if(param1.x == 4)
                  {
                     if(this.bbdc.getDirect() != 0)
                     {
                        _loc9_.x = this.x + 225;
                     }
                     else
                     {
                        _loc9_.x = this.x - 225;
                     }
                     _loc9_.y = this.y - 80;
                     this.doHit10Arrow_2(this.getBBDC().getDirect(),_loc9_);
                  }
               }
               break;
            case "hit11":
               if(this.bbdc.getCurFrameCount() == 4)
               {
                  if(param1.x == 5)
                  {
                     _loc9_.x = this.x;
                     _loc9_.y = this.y;
                  }
               }
               break;
            case "hit12":
               if(this.isNotArrow)
               {
                  if(this.bbdc.getCurFrameCount() == 14)
                  {
                     if(param1.x == 2)
                     {
                        if(this.bbdc.getDirect() != 0)
                        {
                           _loc9_.x = this.x + 150;
                        }
                        else
                        {
                           _loc9_.x = this.x - 150;
                        }
                        _loc9_.y = this.y;
                        this.doHit12(this.getBBDC().getDirect(),_loc9_);
                     }
                  }
                  break;
               }
               if(param1.x == 0 || param1.x == 1 && this.bbdc.getCurFrameCount() >= 16)
               {
                  this.setStatic();
                  this.speed.y = -35;
               }
               else if(param1.x >= 2 && param1.x <= 3)
               {
                  if(this.bbdc.getDirect() != 0)
                  {
                     this.speed.x = 25;
                  }
                  else
                  {
                     this.speed.x = -25;
                  }
                  this.speed.y = 0;
               }
               else if(param1.x == 4 && this.bbdc.getCurFrameCount() == 2)
               {
                  if(this.bbdc.getDirect() != 0)
                  {
                     this.isRight = false;
                     this.isLeft = true;
                     this.bbdc.turnLeft();
                  }
                  else
                  {
                     this.isRight = true;
                     this.isLeft = false;
                     this.bbdc.turnRight();
                  }
               }
               else
               {
                  this.setStatic();
                  this.speed.y = 0;
               }
               if(this.bbdc.getCurFrameCount() == 2)
               {
                  if(param1.x == 0 || param1.x == 4)
                  {
                     if(this.bbdc.getDirect() != 0)
                     {
                        _loc9_.x = this.x + 80;
                     }
                     else
                     {
                        _loc9_.x = this.x - 80;
                     }
                     _loc9_.y = this.y - 100;
                     this.doHit12Arrow_1(this.getBBDC().getDirect(),_loc9_);
                  }
               }
               if(this.bbdc.getCurFrameCount() == 2)
               {
                  if(param1.x == 0 || param1.x == 4)
                  {
                     if(this.bbdc.getDirect() != 0)
                     {
                        _loc9_.x = this.x;
                     }
                     else
                     {
                        _loc9_.x = this.x;
                     }
                     _loc9_.y = this.y;
                     this.doHit12Arrow_2(this.getBBDC().getDirect(),_loc9_);
                  }
               }
               if(this.bbdc.getCurFrameCount() == 17 || this.bbdc.getCurFrameCount() == 12 || this.bbdc.getCurFrameCount() == 6)
               {
                  if(param1.x == 1 || param1.x == 5)
                  {
                     if(this.bbdc.getDirect() != 0)
                     {
                        _loc9_.x = this.x + (88 + this.bbdc.getCurFrameCount());
                     }
                     else
                     {
                        _loc9_.x = this.x - (88 + this.bbdc.getCurFrameCount());
                     }
                     _loc9_.y = this.y - (-7 + Number(this.bbdc.getCurFrameCount()) * 2);
                     this.doHit12Arrow_3(this.getBBDC().getDirect(),_loc9_);
                  }
               }
         }
      }
      
      internal function doHit1(param1:uint, param2:Point) : void
      {
         var _loc3_:* = new FollowBaseObjectBullet("Role4Bullet1");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit1");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      internal function doHit1Arrow(param1:uint, param2:Point) : void
      {
         var _loc3_:* = new SpecialEffectBullet("Role4BulletArrow1");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit1Arrow");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      internal function doHit2(param1:uint, param2:Point) : void
      {
         var _loc3_:* = new FollowBaseObjectBullet("Role4Bullet2");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit2");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      internal function doHit2Arrow(param1:uint, param2:Point) : void
      {
         var _loc3_:* = new SpecialEffectBullet("Role4BulletArrow2");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit2Arrow");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      internal function doHit3(param1:uint, param2:Point) : void
      {
         var _loc3_:* = new FollowBaseObjectBullet("Role4Bullet3");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit3");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      internal function doHit4(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role4_hit4");
         var _loc3_:* = new FollowBaseObjectBullet("Role4Bullet4");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit4");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      internal function doHit4Arrow(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role4_hit4Arrow");
         var _loc3_:* = new SpecialEffectBullet("Role4BulletArrow4");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit4Arrow");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      internal function doHit5_1(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role4_hit5");
         var _loc3_:* = new FollowBaseObjectBullet("Role4Bullet5");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDisable();
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit5");
         var _loc4_:* = gc.gameSence.getChildIndex(this);
         gc.gameSence.addChildAt(_loc3_,_loc4_);
         this.magicBulletArray.push(_loc3_);
      }
      
      internal function doHit5_2(param1:uint, param2:Point, param3:*) : void
      {
         var _loc4_:* = gc.pWorld.likeMonsterArray.indexOf(this.role4Hit5);
         if(Boolean(this.role4Hit5) && _loc4_ != -1)
         {
            this.role4Hit5.destroy();
            gc.pWorld.likeMonsterArray.splice(_loc4_,1);
            this.role4Hit5 = null;
         }
         this.role4Hit5 = new MonsterRole4Hit5(param3,this);
         this.role4Hit5.x = param2.x;
         this.role4Hit5.y = param2.y;
         gc.gameSence.addChild(this.role4Hit5);
         gc.pWorld.likeMonsterArray.push(this.role4Hit5);
      }
      
      internal function doHit6(param1:uint, param2:Point) : void
      {
         var loc2:* = undefined;
         var loc3:* = undefined;
         var direct:uint = 0;
         var p:Point = null;
         var b:SpecialEffectBullet = null;
         var target:BaseObject = null;
         var newObbsiteArray:Array = null;
         var bo:BaseObject = null;
         var dis:Number = Number(NaN);
         var moveTime:Number = Number(NaN);
         var loc1:* = undefined;
         var arg1:uint = param1;
         var arg2:Point = param2;
         target = null;
         bo = null;
         dis = Number(NaN);
         moveTime = Number(NaN);
         direct = arg1;
         p = arg2;
         SoundManager.play("Role4_hit6");
         b = new SpecialEffectBullet("Role4Bullet6");
         b.x = p.x;
         b.y = p.y;
         b.setRole(this);
         b.setDisable();
         b.setDestroyWhenLastFrame(false);
         b.setDirect(direct);
         b.setAction("hit6");
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
         newObbsiteArray = gc.getPlayerArray();
         if(this.role4Hit5)
         {
            newObbsiteArray = newObbsiteArray.concat(this.role4Hit5);
         }
         loc2 = 0;
         loc3 = newObbsiteArray;
         for each(bo in loc3)
         {
            if(this.bbdc.getDirect() == 0)
            {
               if(bo.x < this.x)
               {
                  if(AUtils.GetDisBetweenTwoObj(bo,this) <= 500)
                  {
                     target = bo;
                     break;
                  }
               }
            }
            if(bo.x > this.x)
            {
               if(AUtils.GetDisBetweenTwoObj(bo,this) <= 500)
               {
                  target = bo;
                  break;
               }
            }
         }
         if(target)
         {
            dis = AUtils.GetDisBetweenTwoObj(target,this);
            moveTime = dis / 500 * 1.2;
            this.reHit6(b,target,8,moveTime);
         }
         else
         {
            TweenMax.to(b,1,{
               "alpha":0,
               "onComplete":function(param1:SpecialEffectBullet):*
               {
                  param1.destroy();
               },
               "onCompleteParams":[b]
            });
         }
      }
      
      internal function reHit6(param1:SpecialEffectBullet, param2:BaseObject, param3:uint, param4:Number) : void
      {
         var _b:SpecialEffectBullet = null;
         var _target:BaseObject = null;
         var _times:uint = 0;
         var _moveTime:Number = Number(NaN);
         var loc1:* = undefined;
         var arg1:SpecialEffectBullet = param1;
         var arg2:BaseObject = param2;
         var arg3:uint = param3;
         var arg4:Number = param4;
         _b = arg1;
         _target = arg2;
         _times = arg3;
         _moveTime = arg4;
         if(_times > 0)
         {
            SoundManager.play("Role4_hit6");
            _times--;
            TweenMax.to(_b,_moveTime,{
               "x":_target.x,
               "y":_target.y,
               "onComplete":function(param1:Monster999, param2:SpecialEffectBullet, param3:BaseObject, param4:uint):*
               {
                  var _loc5_:* = undefined;
                  var _loc6_:* = undefined;
                  var _loc7_:* = undefined;
                  var _loc8_:* = undefined;
                  var _loc9_:* = undefined;
                  var _loc10_:* = undefined;
                  var _loc11_:* = undefined;
                  if(!param3.isYourFather() && AUtils.GetDisBetweenTwoObj(param2,param3) <= 50)
                  {
                     if(param3.curAddEffect)
                     {
                        param3.curAddEffect.add([{
                           "name":BaseAddEffect.POISON_TIMES,
                           "time":gc.frameClips * 7
                        }]);
                        param3.curAddEffect.add([{
                           "name":BaseAddEffect.STUN,
                           "time":gc.frameClips * 0.5
                        }]);
                     }
                     _loc7_ = AUtils.getNewObj("HeroBeHurt");
                     _loc7_.x = colipse.x;
                     _loc7_.y = colipse.y;
                     param3.addChild(_loc7_);
                     _loc8_ = false;
                     _loc9_ = gc.getPlayerArray();
                     if(this.role4Hit5)
                     {
                        _loc9_ = _loc9_.concat(this.role4Hit5);
                     }
                     _loc5_ = 0;
                     _loc6_ = _loc9_;
                     for each(_loc10_ in _loc6_)
                     {
                        if(_loc10_ != param3)
                        {
                           _loc11_ = AUtils.GetDisBetweenTwoObj(_loc10_,param2);
                           if(_loc11_ <= 500)
                           {
                              _loc8_ = true;
                              param1.reHit6(param2,_loc10_,param4,_loc11_ / 500 * 1.2);
                              break;
                           }
                        }
                     }
                     if(!_loc8_)
                     {
                        param2.destroy();
                     }
                  }
                  else
                  {
                     param2.destroy();
                  }
               },
               "onCompleteParams":[this,_b,_target,_times]
            });
         }
         else
         {
            _b.destroy();
         }
      }
      
      internal function otherAttackHit6_2(param1:uint, param2:Point, param3:Array) : void
      {
         var b:SpecialEffectBullet = null;
         b = null;
         var direct:uint = 0;
         var p:Point = null;
         var targetPointArray:Array = null;
         b = null;
         var targetX:int = 0;
         var targetY:int = 0;
         var moveTime:Number = Number(NaN);
         var loc1:* = undefined;
         var arg1:uint = param1;
         var arg2:Point = param2;
         var arg3:Array = param3;
         b = null;
         direct = arg1;
         p = arg2;
         targetPointArray = arg3;
         b = new SpecialEffectBullet("Role4Bullet6");
         b.x = p.x;
         b.y = p.y;
         b.setRole(this);
         b.setDisable();
         b.setDestroyWhenLastFrame(false);
         b.setDirect(direct);
         b.setAction("hit6");
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
         targetX = int(parseInt(targetPointArray[0]));
         targetY = int(parseInt(targetPointArray[1]));
         moveTime = Number(targetPointArray[2]);
         TweenMax.to(b,moveTime,{
            "x":targetX,
            "y":targetY,
            "onComplete":function():*
            {
               b.destroy();
            },
            "onCompleteParams":[b]
         });
      }
      
      internal function doHit7_1(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role4_hit7");
         var _loc3_:* = new SpecialEffectBullet("Role4Bullet7_1");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDisable();
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit7_1");
         var _loc4_:* = gc.gameSence.getChildIndex(this);
         gc.gameSence.addChildAt(_loc3_,_loc4_);
         this.magicBulletArray.push(_loc3_);
      }
      
      internal function doHit7_2(param1:uint, param2:Point) : void
      {
         var _loc3_:* = null;
         var _loc4_:* = null;
         var _loc5_:* = this.magicBulletArray;
         for each(_loc3_ in _loc5_)
         {
            if(_loc3_.getImcName() == "Role4Bullet7_2")
            {
               _loc3_.destroy();
            }
         }
         _loc4_ = new SpecialEffectBullet("Role4Bullet7_2");
         _loc4_.x = param2.x;
         _loc4_.y = param2.y;
         _loc4_.setRole(this);
         _loc4_.setDirect(param1);
         _loc4_.setAction("hit7");
         gc.gameSence.addChild(_loc4_);
         this.magicBulletArray.push(_loc4_);
         _loc4_ = new SpecialEffectBullet("Role4Bullet7_2");
         if(param1 != 0)
         {
            _loc4_.x = param2.x + 40;
         }
         else
         {
            _loc4_.x = param2.x - 40;
         }
         _loc4_.y = param2.y - 20;
         _loc4_.setRole(this);
         _loc4_.setDirect(param1);
         _loc4_.setAction("hit7");
         gc.gameSence.addChild(_loc4_);
         this.magicBulletArray.push(_loc4_);
         _loc4_ = new SpecialEffectBullet("Role4Bullet7_2");
         if(param1 != 0)
         {
            _loc4_.x = param2.x - 40;
         }
         else
         {
            _loc4_.x = param2.x + 40;
         }
         _loc4_.y = param2.y - 10;
         _loc4_.setRole(this);
         _loc4_.setDirect(param1);
         _loc4_.setAction("hit7");
         gc.gameSence.addChild(_loc4_);
         this.magicBulletArray.push(_loc4_);
      }
      
      internal function doHit8(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role4_hit8");
         var _loc3_:* = new FollowBaseObjectBullet("Role4Bullet8");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit8");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      internal function doHit8Arrow_1(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role4_hit8Arrow");
         var _loc3_:* = new FollowBaseObjectBullet("Role4BulletArrow8_1");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDisable();
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit8");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      internal function doHit8Arrow_2(param1:uint, param2:Point) : void
      {
         var _loc3_:* = new SpecialEffectBullet("Role4BulletArrow8_2");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit8Arrow");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      internal function doHit9_1(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role4_hit9");
         var _loc3_:* = new FollowBaseObjectBullet("Role4Bullet9_1");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDisable();
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit9");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      internal function doHit9_2(param1:uint, param2:Point) : void
      {
         var _loc3_:* = new FollowBaseObjectBullet("Role4Bullet9_2");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit9");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      internal function doHit9Arrow_1(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role4_hit9Arrow");
         var _loc3_:* = new FollowBaseObjectBullet("Role4BulletArrow9_1");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDisable();
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit9");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      internal function doHit9Arrow_2(param1:uint, param2:Point) : void
      {
         var _loc3_:* = new FollowBaseObjectBullet("Role4BulletArrow9_2");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit9Arrow");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      internal function doHit10(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role4_hit10");
         var _loc3_:* = new SpecialEffectBullet("Role4Bullet10");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit10");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      internal function doHit10Arrow_1(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role4_hit10Arrow");
         var _loc3_:* = new FollowBaseObjectBullet("Role4BulletArrow10_1");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDisable();
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit10");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      internal function doHit10Arrow_2(param1:uint, param2:Point) : void
      {
         var _loc3_:* = new SpecialEffectBullet("Role4BulletArrow10_2");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit10Arrow");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      internal function doHit12(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role4_hit12");
         var _loc3_:* = new SpecialEffectBullet("Role4Bullet12");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDestroyWhenLastFrame(false);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit12");
         _loc3_.setDestroyInCount(gc.frameClips * 5);
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      internal function doHit12Arrow_1(param1:uint, param2:Point) : void
      {
         SoundManager.play("Role4_hit12Arrow");
         var _loc3_:* = new FollowBaseObjectBullet("Role4BulletArrow12_1");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setDisable();
         _loc3_.setAction("hit12");
         var _loc4_:* = gc.gameSence.getChildIndex(this);
         gc.gameSence.addChildAt(_loc3_,_loc4_);
         this.magicBulletArray.push(_loc3_);
      }
      
      internal function doHit12Arrow_2(param1:uint, param2:Point) : void
      {
         var _loc3_:* = new FollowBaseObjectBullet("Role4BulletArrow12_2");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit12Arrow");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      internal function doHit12Arrow_3(param1:uint, param2:Point) : void
      {
         var _loc3_:* = new SpecialEffectBullet("Role4BulletArrow12_3");
         _loc3_.x = param2.x;
         _loc3_.y = param2.y;
         _loc3_.setRole(this);
         _loc3_.setDirect(param1);
         _loc3_.setAction("hit12Arrow");
         gc.gameSence.addChild(_loc3_);
         this.magicBulletArray.push(_loc3_);
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         return this.curAttackTarget != null;
      }
      
      override protected function releSkill1() : void
      {
         this.newAttackId();
         var _loc1_:* = ["hit3","hit4","hit5","hit7","hit8","hit9","hit10","hit12"];
         var _loc2_:* = _loc1_[int(Math.random() * Number(_loc1_.length))];
         this.faceToTarget();
         this.setYourFather(10);
         this.setAction(_loc2_);
         this.lastHit = _loc2_;
      }
      
      override protected function exitFrameFunc(param1:Point) : void
      {
      }
      
      override protected function myIntelligence() : void
      {
         var loc1:* = undefined;
         var loc2:* = undefined;
         var loc3:* = undefined;
         if(this.isGXP && getTimer() % 4 == 0)
         {
            AUtils.shallowEffect(this);
         }
         if(this.gxpCount > 0)
         {
            loc3 = (loc2 = this).gxpCount - 1;
            loc2.gxpCount = loc3;
            if(this.gxpCount == 0)
            {
               this.turnToGXP();
               this.gxpCount = gc.frameClips * 20;
               TweenMax.delayedCall(10,function(param1:Monster999):*
               {
                  param1.turnToNormal();
               },[this]);
            }
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
         if(this.isNotArrow)
         {
            return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit4" || this.curAction == "hit5" || this.curAction == "hit6" || this.curAction == "hit7" || this.curAction == "hit9" || this.curAction == "hit11" || this.curAction == "hit11Frame2" || this.curAction == "hit12";
         }
         return this.curAction == "hit1" || this.curAction == "hit2" || this.curAction == "hit4" || this.curAction == "hit5" || this.curAction == "hit6" || this.curAction == "hit7" || this.curAction == "hit9" || this.curAction == "hit10" || this.curAction == "hit11" || this.curAction == "hit11Frame2" || this.curAction == "hit12";
      }
   }
}

