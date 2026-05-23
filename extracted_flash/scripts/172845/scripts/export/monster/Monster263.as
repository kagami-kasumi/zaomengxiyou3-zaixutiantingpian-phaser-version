package export.monster
{
   import base.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   
   public class Monster263 extends BaseMonster
   {
      
      public function Monster263()
      {
         super();
         this.horizenSpeed = 3.2;
         this.setHp(459139);
         this.setSHp(459139);
         this.attackRange = 250;
         this.alertRange = 1000;
         this.protectedParamsObject.def = 2581;
         this.protectedParamsObject.mDef = 0.42;
         this.protectedParamsObject.exp = 500;
         this.protectedParamsObject.gxp = 250;
         this.attackBackInfoDict["hit1"] = {
            "hitMaxCount":99,
            "attackBackSpeed":[6,-5],
            "attackInterval":999,
            "power":4270,
            "attackKind":"magic"
         };
         this.isBoss = false;
         this.setAction("wait");
         this.protectedParamsObject.probability = 0;
         this.fallList = [];
      }
      
      override protected function initBBDC() : void
      {
         var body:Object = null;
         var bmdArray:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster263");
         if(bmdArray)
         {
            body = {
               "name":"body",
               "source":bmdArray
            };
            bbdc = new BaseBitmapDataClip([body],300,300,new Point(0,0));
            bbdc.setOffsetXY(-30,-30);
            bbdc.setFrameStopCount([[2,2,2,2,2,2],[4,4,4,4],[8],[3,6],[2,2,2,2,2,2,2,2]]);
            bbdc.setFrameCount([6,4,1,1,8]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster263--BitmapData Error!");
      }
      
      override protected function newColipse() : void
      {
         this.colipse = AUtils.getNewObj("Monster263Colipse") as Sprite;
         this.colipse.visible = false;
         this.addChild(this.colipse);
      }
      
      override public function setAction(str:String) : void
      {
         super.setAction(str);
         var curPoint:Point = this.bbdc.getCurPoint();
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
            case "walk":
               if(curPoint.y != 1)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(1);
               }
               this.bbdc.setState(str);
               break;
            case "hurt":
               if(curPoint.y != 2)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(2);
               }
               this.bbdc.setState(str);
               break;
            case "hit1":
               if(curPoint.y != 4)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(4);
               }
               this.bbdc.setState(str);
               break;
            case "dead":
               if(curPoint.y != 3)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(3);
               }
               this.bbdc.setState(str);
         }
      }
      
      override protected function scriptFrameOverFunc(row:int) : void
      {
         var state:String = this.bbdc.getState();
         switch(state)
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
            case "hurt":
               this.setStatic();
               this.setAction("wait");
               break;
            case "dead":
               this.dropAura();
               this.destroy();
         }
      }
      
      override protected function enterFrameFunc(p:Point) : void
      {
         var state:String = this.bbdc.getState();
         var direct:uint = uint(this.getBBDC().getDirect());
         var _loc4_:* = state;
         if("hit1" === _loc4_)
         {
            if(p.x == 6)
            {
               if(this.bbdc.getCurFrameCount() == 2)
               {
                  this.doHi1(direct);
               }
            }
         }
      }
      
      private function doHi1(direct:uint) : void
      {
         var b:EnemyMoveBullet = new EnemyMoveBullet("Monster263Bullet1");
         if(direct == 0)
         {
            b.x = this.x - 10;
         }
         else
         {
            b.x = this.x + 10;
         }
         b.y = this.y;
         b.setRole(this);
         b.setSpeed(direct ? 11 : -11,0);
         b.setDistance(1000);
         b.setDestroyWhenLastFrame(false);
         b.setDirect(direct);
         b.setAction("hit1");
         gc.gameSence.addChild(b);
         this.magicBulletArray.push(b);
      }
      
      override protected function beforeSkill1Start() : Boolean
      {
         return false;
      }
      
      override protected function exitFrameFunc(p:Point) : void
      {
      }
      
      override protected function myIntelligence() : void
      {
         if(!this.isBeAttacking())
         {
            super.myIntelligence();
         }
      }
   }
}

