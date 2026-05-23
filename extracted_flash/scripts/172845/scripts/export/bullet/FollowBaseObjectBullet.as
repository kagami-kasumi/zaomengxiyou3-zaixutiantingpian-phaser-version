package export.bullet
{
   import base.BaseBullet;
   import base.BaseObject;
   import flash.geom.*;
   
   public class FollowBaseObjectBullet extends BaseBullet
   {
      
      private var initPoint:Point;
      
      private var curPoint:Point;
      
      private var initMatrixA:Number;
      
      private var curMatrixA:Number;
      
      public function FollowBaseObjectBullet(param1:String, param2:String = "")
      {
         this.initPoint = new Point();
         this.curPoint = new Point();
         super(param1,param2);
         this.setHurtCanCutDownEffect(true);
      }
      
      override public function step2() : void
      {
         var _loc1_:Number = Number(NaN);
         var _loc2_:Number = Number(NaN);
         super.step2();
         if(!this.isReadyToDestroy)
         {
            if(this.sourceRole)
            {
               _loc1_ = Number(this.curPoint.x) - this.sourceRole.x;
               _loc2_ = Number(this.curPoint.y) - this.sourceRole.y;
               if(_loc1_ != 0)
               {
                  this.x -= _loc1_;
                  this.curPoint.x = this.sourceRole.x;
               }
               if(_loc2_ != 0)
               {
                  this.y -= _loc2_;
                  this.curPoint.y = this.sourceRole.y;
               }
               if(this.curMatrixA != this.sourceRole.transform.matrix.a)
               {
                  AUtils.flipHorizontal(this,this.sourceRole.transform.matrix.a);
                  this.curMatrixA = this.sourceRole.transform.matrix.a;
               }
            }
         }
      }
      
      override public function setScale(param1:Number, param2:Number) : void
      {
         super.setScale(param1,param2);
         if(param1 > 1)
         {
            this.setScale(0.7,1);
         }
      }
      
      override public function setRole(param1:BaseObject) : void
      {
         super.setRole(param1);
         this.initPoint.x = param1.x;
         this.initPoint.y = param1.y;
         this.curPoint.x = param1.x;
         this.curPoint.y = param1.y;
         this.initMatrixA = param1.transform.matrix.a;
         this.curMatrixA = this.initMatrixA;
      }
   }
}

