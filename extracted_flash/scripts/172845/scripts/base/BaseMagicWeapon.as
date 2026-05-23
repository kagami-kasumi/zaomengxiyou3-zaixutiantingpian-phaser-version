package base
{
   import com.greensock.*;
   import config.*;
   import export.magicWeapon.*;
   import flash.display.MovieClip;
   import flash.geom.*;
   
   public class BaseMagicWeapon extends MovieClip
   {
      
      public static var BMW_Bottle:uint = 1;
      
      public static var BMW_Leaf:uint = 2;
      
      public static var BMW_Ring:uint = 3;
      
      public static var BMW_Sword:uint = 4;
      
      public static var BMW_Umbrella:uint = 5;
      
      public static var BMW_YuJinPing:uint = 6;
      
      public static var BMW_BigBottle:uint = 7;
      
      protected var sourceRole:BaseHero;
      
      protected var bbdc:BaseBitmapDataClip;
      
      public var fillName:String = "";
      
      public var bmwId:uint;
      
      private var positionFixCount:int = 12;
      
      protected var count:uint = 0;
      
      protected var mp:uint = 10;
      
      public var curAction:String;
      
      private var shakeDirect:uint = 0;
      
      protected var gc:Config;
      
      public function BaseMagicWeapon(param1:BaseHero)
      {
         super();
         this.gc = Config.getInstance();
         this.sourceRole = param1;
         this.initBBDC();
         this.setAction("wait");
         this.count = Number(this.gc.frameClips) / 2;
      }
      
      protected function initBBDC() : void
      {
      }
      
      protected function setPosition2() : void
      {
         var _loc1_:* = null;
         if(this.sourceRole)
         {
            if(BaseObject(this.sourceRole).transform.matrix.a > 0)
            {
               _loc1_ = new Point(this.sourceRole.x + 60,Number(this.sourceRole.y) - 50);
               AUtils.flipHorizontal(this,1);
            }
            else
            {
               _loc1_ = new Point(Number(this.sourceRole.x) - 60,Number(this.sourceRole.y) - 50);
               AUtils.flipHorizontal(this,-1);
            }
            TweenMax.to(this,1,{"x":_loc1_.x});
            TweenMax.to(this,1,{"y":_loc1_.y});
         }
      }
      
      public function setAction(param1:String) : void
      {
         this.curAction = param1;
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
            case "hit":
               if(_loc2_.y != 1)
               {
                  this.bbdc.setFramePointX(0);
                  this.bbdc.setFramePointY(1);
               }
               this.bbdc.setState(param1);
         }
      }
      
      protected function scriptFrameOverFunc(param1:int) : void
      {
         var _loc2_:String = this.bbdc.getState();
         switch(_loc2_)
         {
            case "wait":
               this.bbdc.setFramePointX(0);
               break;
            case "hit":
               this.setAction("wait");
         }
      }
      
      public function useSkill() : void
      {
         if(this.curAction == "hit")
         {
            if(this is MagicTimer)
            {
               if(this.wait)
               {
                  this.wait.destroy();
               }
            }
            return;
         }
         if(this.sourceRole)
         {
            this.setAction("hit");
            this.showSkill();
         }
      }
      
      public function showSkill() : void
      {
      }
      
      public function doHit1() : void
      {
         this.hitOver();
      }
      
      public function setOtherUseSkill(param1:String) : void
      {
         switch(param1)
         {
            case "hit":
               this.showSkill();
         }
      }
      
      public function step() : void
      {
         if(this.bbdc)
         {
            this.bbdc.step();
         }
         if(this.count > 0)
         {
            --this.count;
            if(this.count == 0)
            {
               this.setPosition();
               this.count = Number(this.gc.frameClips) / 2;
            }
         }
      }
      
      protected function setPosition() : void
      {
         var _loc1_:Point = new Point();
         if(this.sourceRole.getBBDC().getDirect() == 0)
         {
            _loc1_.x = this.sourceRole.x + 60;
            this.bbdc.turnLeft();
         }
         else
         {
            _loc1_.x = Number(this.sourceRole.x) - 60;
            this.bbdc.turnRight();
         }
         if(this.shakeDirect == 0)
         {
            _loc1_.y = Number(this.sourceRole.y) - 15;
            this.shakeDirect = 1;
         }
         else
         {
            _loc1_.y = Number(this.sourceRole.y) - 25;
            this.shakeDirect = 0;
         }
         TweenMax.to(this,1,{
            "x":_loc1_.x,
            "y":_loc1_.y
         });
      }
      
      protected function hitOver() : void
      {
         this.setUsing(false);
      }
      
      public function isUsing() : Boolean
      {
         return this.curAction == "hit";
      }
      
      public function getBBDC() : BaseBitmapDataClip
      {
         return this.bbdc;
      }
      
      public function destroy() : void
      {
         if(this.sourceRole)
         {
            this.sourceRole.releaseMagicWeapon();
         }
         this.sourceRole = null;
         if(this.bbdc)
         {
            this.bbdc.destroy();
         }
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
      }
   }
}

