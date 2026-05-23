package export.level.StageListener223Children
{
   import base.BaseBullet;
   import base.BaseObject;
   import config.*;
   import export.monster.*;
   import flash.display.*;
   import flash.events.*;
   import flash.geom.Point;
   import manager.*;
   import my.*;
   
   public class Monster139KuiLei extends BaseObject
   {
      
      private var targetRole:BaseObject;
      
      private var sourceRole:BaseObject;
      
      private var speedVal:Number = 2;
      
      private var beattackedIdArray:Array;
      
      private var hitSprite:Sprite;
      
      public var continueCount:uint = 1800;
      
      public function Monster139KuiLei(param1:BaseObject, param2:BaseObject)
      {
         this.beattackedIdArray = [];
         this.hitSprite = new Sprite();
         super();
         gc = Config.getInstance();
         this.targetRole = param1;
         this.sourceRole = param2;
         this.addEventListener(Event.ADDED_TO_STAGE,this.__added,false,0,true);
      }
      
      override protected function __added(param1:Event) : void
      {
         this.addChild(AUtils.getNewObj("Monster139Bullet3"));
         this.hitSprite.graphics.beginFill(16711680,0);
         this.hitSprite.graphics.drawRect(-15,-20,30,60);
         this.hitSprite.graphics.endFill();
         this.addChild(this.hitSprite);
      }
      
      override public function step() : void
      {
         var _loc1_:Array = null;
         var _loc2_:BaseObject = null;
         var _loc3_:BaseBullet = null;
         var _loc4_:int = 0;
         var _loc5_:MovieClip = null;
         var _loc6_:Point = AUtils.GetNextPointByTwoObj(this,this.targetRole);
         this.x += _loc6_.x * Number(this.speedVal);
         this.y += _loc6_.y * Number(this.speedVal);
         _loc1_ = gc.getPlayerAndPetArray().concat(this.sourceRole);
         _loc1_ = [this.sourceRole];
         for each(_loc2_ in _loc1_)
         {
            for each(_loc3_ in _loc2_.magicBulletArray)
            {
               if(this.beattackedIdArray.indexOf(_loc3_.getAttackId()) == -1)
               {
                  if(!_loc3_.isDisabled)
                  {
                     if(HitTest.complexHitTestObject(this.hitSprite,_loc3_))
                     {
                        _loc4_ = _loc3_.hurt;
                        this.targetRole.reduceHp(_loc4_);
                        _loc5_ = AUtils.getNewObj("MonsterBeHurt2") as MovieClip;
                        this.addChild(_loc5_);
                        SoundManager.play("BeattackByRole1");
                        if(this.sourceRole is Monster139 && _loc3_ is Monster139TantantanBullet)
                        {
                           (this.sourceRole as Monster139).hit4Hit(_loc3_);
                        }
                        this.beattackedIdArray.push(_loc3_.getAttackId());
                     }
                  }
               }
            }
         }
         if(this.continueCount > 0)
         {
            --this.continueCount;
         }
      }
      
      public function destroy() : void
      {
         this.targetRole = null;
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
      }
   }
}

