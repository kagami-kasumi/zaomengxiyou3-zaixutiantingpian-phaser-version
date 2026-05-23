package export.monster
{
   import com.greensock.*;
   import flash.geom.Point;
   
   public class Monster211 extends Monster210
   {
      
      private var merge:TweenMax;
      
      private var isStartMerge:Boolean = false;
      
      public var master:Monster210;
      
      public function Monster211()
      {
         super();
         this.horizenSpeed = 3;
         this.isBoss = false;
         this.protectedParamsObject.fallList = [];
         this.alpha = 0.5;
         this.merge = TweenMax.delayedCall(10,function(_self:Monster211):*
         {
            _self.startMerge();
         },[this]);
      }
      
      private function startMerge() : void
      {
         this.isStartMerge = true;
         this.newAttackId();
         this.faceToTarget();
         this.setYourFather(20000);
         this.setAction("hit4");
         this.lastHit = "hit4";
      }
      
      override protected function startCall() : void
      {
      }
      
      override protected function scriptFrameOverFunc(row:int) : void
      {
         var targetY:int = 0;
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
            case "hit2":
               this.setAction("wait");
               break;
            case "hit3":
               this.setAction("wait");
               break;
            case "hit4":
               this.bbdc.setFramePointX(0);
               break;
            case "hurt":
               this.setStatic();
               this.setAction("wait");
               break;
            case "dead":
               targetY = 200 - (this.y - 100);
               this.fallEquipOffset.y = targetY;
               this.dropAura();
               this.destroy();
         }
      }
      
      override protected function enterFrameFunc(p:Point) : void
      {
         var dis:Number = Number(NaN);
         var point:Point = null;
         var state:String = this.bbdc.getState();
         var direct:uint = uint(this.getBBDC().getDirect());
         switch(state)
         {
            case "hit1":
               if(p.x == 2)
               {
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     this.doHi1(direct);
                  }
               }
               break;
            case "hit2":
               if(p.x == 2)
               {
                  if(this.bbdc.getCurFrameCount() == 10)
                  {
                     this.doHi2(direct);
                  }
               }
               break;
            case "hit3":
               if(p.x == 0)
               {
                  if(this.bbdc.getCurFrameCount() == 20)
                  {
                     this.doHi3(direct);
                  }
               }
               break;
            case "hit4":
               this.speed.x = 0;
               this.speed.y = 0;
               dis = AUtils.GetDisBetweenTwoObj(this,this.master);
               if(dis <= 20)
               {
                  this.destroy();
               }
               else
               {
                  point = AUtils.GetNextPointByTwoObj(this,this.master);
                  this.x += point.x * 10;
                  this.y += point.y * 10;
               }
         }
      }
      
      override protected function exitFrameFunc(p:Point) : void
      {
      }
      
      override public function isCanMoveByStage() : Boolean
      {
         return true;
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
         this.master = null;
         if(this.merge)
         {
            this.merge.kill();
            this.merge = null;
         }
         super.destroy();
      }
   }
}

