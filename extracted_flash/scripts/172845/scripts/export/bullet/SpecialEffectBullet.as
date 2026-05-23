package export.bullet
{
   import base.BaseBullet;
   
   public class SpecialEffectBullet extends BaseBullet
   {
      
      private var followObject:ThroughWallBullet;
      
      public function SpecialEffectBullet(param1:String, param2:String = "")
      {
         super(param1,param2);
      }
      
      override protected function step() : void
      {
         super.step();
         if(this.followObject)
         {
            this.x = this.followObject.x;
            this.y = this.followObject.y;
            if(this.followObject.getUserData())
            {
               if(this.transform.matrix.a != this.followObject.getUserData().transform.matrix.a)
               {
                  this.newAttackId();
                  AUtils.flipHorizontal(this,this.followObject.getUserData().transform.matrix.a);
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
      
      public function setFollowObj(param1:ThroughWallBullet) : void
      {
         this.followObject = param1;
         param1.setSwordEffect(this);
      }
   }
}

