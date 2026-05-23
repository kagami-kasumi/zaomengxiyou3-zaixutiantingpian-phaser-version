package export.monster
{
   import base.*;
   import export.bullet.*;
   import flash.display.*;
   import flash.geom.*;
   
   public class Monster261 extends BaseMonster
   {
      
      public function Monster261()
      {
         super();
         this.horizenSpeed = 5;
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
            "attackInterval":4,
            "power":7620 * 0.6,
            "attackKind":"physics"
         };
         this.isBoss = false;
         this.setAction("wait");
         this.protectedParamsObject.probability = 0;
         this.protectedParamsObject.fallList = [];
      }
      
      override protected function initBBDC() : void
      {
         var body:Object = null;
         var bmdArray:Array = BaseBitmapDataPool.getBitmapDataArrayByName("Monster261");
         if(bmdArray)
         {
            body = {
               "name":"body",
               "source":bmdArray
            };
            bbdc = new BaseBitmapDataClip([body],200,200,new Point(0,0));
            bbdc.setOffsetXY(3,0);
            bbdc.setFrameStopCount([[2,2,2,2,2,2],[4,4,4,4],[8],[3,6],[2,2,2,2,2,2,2,2,2]]);
            bbdc.setFrameCount([6,4,1,1,9]);
            bbdc.setEnterFrameCallBack(this.enterFrameFunc,this.exitFrameFunc);
            bbdc.setAddScriptWhenFrameOver(this.scriptFrameOverFunc);
            this.body.addChild(bbdc);
            return;
         }
         throw new Error("Monster261--BitmapData Error!");
      }
      
      override protected function newColipse() : void
      {
         this.colipse = AUtils.getNewObj("ObjectBaseSprite") as Sprite;
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
            if(p.x == 2)
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
         var b:SpecialEffectBullet = new SpecialEffectBullet("Monster261Bullet1");
         if(direct == 0)
         {
            b.x = this.x - 35;
         }
         else
         {
            b.x = this.x + 35;
         }
         b.y = this.y + 30;
         b.setRole(this);
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

