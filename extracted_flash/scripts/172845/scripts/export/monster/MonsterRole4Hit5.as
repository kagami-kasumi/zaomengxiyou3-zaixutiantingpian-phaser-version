package export.monster
{
   import base.*;
   import flash.display.*;
   import flash.geom.*;
   
   public class MonsterRole4Hit5 extends BaseMonster
   {
      
      private var followObject:BaseObject;
      
      private var sourceRole:BaseObject;
      
      private var timeCount:uint;
      
      public function MonsterRole4Hit5(param1:BaseObject, param2:BaseObject)
      {
         var _loc3_:int = 0;
         var x_num:Number = 0.28098;
         super();
         this.sourceRole = param2;
         this.followObject = param1;
         this.horizenSpeed = 3;
         if(param2 is BaseHero)
         {
            _loc3_ = int((param2 as BaseHero).getPlayer().returnSkillLevelBySkillName("wdww") - 1);
            this.setHp(Number((param1 as BaseMonster).getSHp()) * 0.7 / (1 + x_num * 17) * (1 + x_num * _loc3_));
            this.setSHp(Number((param1 as BaseMonster).getSHp()) * 0.7 / (1 + x_num * 17) * (1 + x_num * _loc3_));
            this.protectedParamsObject.def = BaseMonster(param1).def;
            this.protectedParamsObject.mDef = BaseMonster(param1).mDef;
         }
         else
         {
            this.setHp(9999999);
            this.setSHp(9999999);
            this.protectedParamsObject.def = 0;
            this.protectedParamsObject.mDef = 0;
         }
         this.protectedParamsObject.mysee = 5 * 60;
         this.protectedParamsObject.isattback = 50;
         this.attackRange = 250;
         this.alertRange = 1000;
         this.protectedParamsObject.exp = 0;
         this.protectedParamsObject.gxp = 0;
         this.isBoss = false;
         this.timeCount = gc.frameClips * 10;
         this.setAction("walk");
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Role4Hit5");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],116,2 * 60,new Point(0,0));
            bbdc.setOffsetXY(0,0);
            bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8],[2,2,2,2,6],[2,2,2,9],[2,2,2,2,32]]);
            bbdc.setFrameCount([6,4,1,5,4,5]);
            bbdc.setEnterFrameCallBack(enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("wuduwawa--BitmapData Error!");
      }
      
      override protected function newColipse() : void
      {
         this.colipse = AUtils.getNewObj("ObjectBaseSprite") as Sprite;
         this.colipse.visible = false;
         this.addChild(this.colipse);
      }
      
      override public function setAction(param1:String) : void
      {
         if(param1 == "dead")
         {
            this.destroy();
         }
         param1 = "walk";
         super.setAction(param1);
         var _loc2_:Point = this.bbdc.getCurPoint();
         switch(param1)
         {
            case "walk":
               if(_loc2_.y != 0)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(0);
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
         }
      }
      
      override protected function exitFrameFunc(param1:Point) : void
      {
      }
      
      override public function reduceHp(param1:int, param2:Boolean = false) : void
      {
         var _loc3_:int = 0;
         var x_num:Number = NaN;
         var _param1:int = 0;
         if(this.sourceRole is BaseHero)
         {
            _loc3_ = 0;
            _loc3_ = int((this.sourceRole as BaseHero).getPlayer().returnSkillLevelBySkillName("wdww") - 1);
            x_num = 0.28098;
            _param1 = param1;
            param1 *= 3.5 / 6 / (1 + x_num * 17) * (1 + x_num * _loc3_);
            if(this.isDead())
            {
               this.destroy();
            }
            if(Boolean(this.sourceRole) && Boolean(this.followObject))
            {
               if(gc.sid == this.sourceRole.sid || gc.isSingleGame())
               {
                  if(this.followObject)
                  {
                     if(this.followObject is BaseMonster)
                     {
                        this.followObject.reduceHp(param1,false);
                        BaseMonster(this.followObject).addMonHurtMc(param1,false);
                     }
                     else if(this.followObject is BaseHero)
                     {
                        this.followObject.reduceHp(param1,false);
                        BaseHero(this.followObject).addHeroHurtMc(param1);
                     }
                     if(this.followObject is BaseHero && gc.isInRoom())
                     {
                        gc.sendHurt(param1,this.followObject.sid,Number(this.followObject.getRoleId()) * 10 + this.sourceRole.getRoleId(),"",0,0,0,false,false);
                     }
                  }
               }
            }
            super.reduceHp(_param1,param2);
         }
         else if(this.sourceRole is BaseMonster)
         {
            _param1 = param1;
            param1 *= 0.5;
            if(this.isDead())
            {
               this.destroy();
            }
            if(Boolean(this.sourceRole) && Boolean(this.followObject))
            {
               if(gc.sid == this.sourceRole.sid || gc.isSingleGame())
               {
                  if(this.followObject)
                  {
                     if(this.followObject is BaseMonster)
                     {
                        this.followObject.reduceHp(param1,false);
                        BaseMonster(this.followObject).addMonHurtMc(param1,false);
                     }
                     else if(this.followObject is BaseHero)
                     {
                        this.followObject.reduceHp(param1,false);
                        BaseHero(this.followObject).addHeroHurtMc(param1);
                     }
                     if(this.followObject is BaseHero && gc.isInRoom())
                     {
                        gc.sendHurt(param1,this.followObject.sid,Number(this.followObject.getRoleId()) * 10 + this.sourceRole.getRoleId(),"",0,0,0,false,false);
                     }
                  }
               }
            }
            super.reduceHp(_param1,param2);
         }
      }
      
      override public function setAttackBack(param1:Point) : void
      {
      }
      
      override protected function myIntelligence() : void
      {
         if(this.timeCount > 0)
         {
            --this.timeCount;
         }
         if(this.followObject)
         {
            if(AUtils.GetDisBetweenTwoObj(this,this.followObject) > 100)
            {
               if(Number(this.timeCount) % gc.frameClips == 0)
               {
                  if(this.x > this.followObject.x)
                  {
                     this.turnLeft();
                  }
                  else
                  {
                     this.turnRight();
                  }
               }
            }
            else
            {
               this.setStatic();
            }
            if(Boolean(this.followObject.isDead()) || this.timeCount == 0)
            {
               this.destroy();
            }
         }
      }
      
      override public function destroy() : void
      {
         trace("巫毒娃娃消失");
         super.destroy();
         this.followObject = null;
         this.sourceRole = null;
      }
      
      public function getSourceRole() : BaseObject
      {
         return this.sourceRole;
      }
   }
}

