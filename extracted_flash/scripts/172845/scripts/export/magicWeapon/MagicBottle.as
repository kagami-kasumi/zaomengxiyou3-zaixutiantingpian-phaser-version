package export.magicWeapon
{
   import base.*;
   import com.greensock.*;
   import export.bullet.*;
   import export.monster.*;
   import flash.display.*;
   import flash.geom.*;
   import my.*;
   
   public class MagicBottle extends BaseMagicWeapon
   {
      
      private var effect:SpecialEffectBullet;
      
      public function MagicBottle(param1:BaseHero)
      {
         super(param1);
         this.bmwId = BaseMagicWeapon.BMW_Bottle;
         this.mp = 20;
      }
      
      override protected function initBBDC() : void
      {
         var _loc1_:* = null;
         var _loc2_:Array = BaseBitmapDataPool.getBitmapDataArrayByName("MagicBottleBmd");
         if(_loc2_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc2_
            };
            bbdc = new BaseBitmapDataClip([_loc1_],80,80,new Point(0,0));
            bbdc.setOffsetXY(1,-10);
            bbdc.setFrameStopCount([[10],[9999]]);
            bbdc.setFrameCount([1,1]);
            bbdc.setAddScriptWhenFrameOver(scriptFrameOverFunc);
            this.addChild(bbdc);
            return;
         }
         throw new Error("MagicBottle--BitmapData Error!");
      }
      
      override public function showSkill() : void
      {
         if(this.sourceRole.getPlayer().getLhValue() < 5000)
         {
            this.setAction("wait");
            this.gc.alert("灵魂不足5000，无法捕捉！");
            return;
         }
         this.effect = new SpecialEffectBullet("MagicBottleEffect3");
         if(this.sourceRole.getBBDC().getDirect() == 0)
         {
            this.effect.x = Number(this.sourceRole.x) - 70;
         }
         else
         {
            this.effect.x = this.sourceRole.x + 70;
         }
         this.effect.y = this.sourceRole.y;
         this.effect.setDisable();
         this.effect.setDirect(this.sourceRole.getBBDC().getDirect());
         this.effect.setRole(this.sourceRole);
         this.effect.setAction("wait");
         this.sourceRole.magicBulletArray.push(this.effect);
         gc.gameSence.addChild(this.effect);
         TweenMax.delayedCall(2,function(param1:MagicBottle):*
         {
            param1.setAction("wait");
         },[this]);
      }
      
      override public function step() : void
      {
         var bm:BaseMonster = null;
         var rate:Number = Number(NaN);
         var petName:String = null;
         var mc:MovieClip = null;
         var result:Boolean = false;
         super.step();
         if(this.effect)
         {
            if(this.effect.isReadyToDestroy)
            {
               this.effect = null;
            }
         }
         if(gc.isSingleGame())
         {
            if(this.effect)
            {
               for each(bm in gc.pWorld.likeMonsterArray)
               {
                  if(bm is Monster70 || bm is Monster71 || bm is Monster72 || bm is Monster73 || bm is Monster74 || bm is Monster75 || bm is Monster76 || bm is Monster77 || bm is Monster78)
                  {
                     if(HitTest.complexHitTestObject(this.effect,bm.colipse))
                     {
                        this.sourceRole.getPlayer().setLhValue(Number(this.sourceRole.getPlayer().getLhValue()) - 5000);
                        petName = "";
                        if(bm is Monster70 || bm is Monster72)
                        {
                           rate = 0.4;
                           if(bm is Monster70)
                           {
                              petName = "horse1";
                           }
                           else
                           {
                              petName = "monkey1";
                           }
                        }
                        else if(bm is Monster71 || bm is Monster73)
                        {
                           rate = 0.7;
                           if(bm is Monster71)
                           {
                              petName = "horse2";
                           }
                           else
                           {
                              petName = "monkey2";
                           }
                        }
                        else if(bm is Monster74)
                        {
                           rate = 0.4;
                           petName = "tigress1";
                        }
                        else if(bm is Monster75)
                        {
                           rate = 0.4;
                           petName = "turtle1";
                        }
                        else if(bm is Monster76)
                        {
                           rate = 0.4;
                           petName = "phoenix1";
                        }
                        else if(bm is Monster77)
                        {
                           rate = 0.4;
                           petName = "dragon1";
                        }
                        else if(bm is Monster78)
                        {
                           rate = 0.4;
                           petName = "rabbit1";
                        }
                        mc = AUtils.getNewObj("MagicBottleEffect2") as MovieClip;
                        bm.body.addChild(mc);
                        if(Math.random() <= rate)
                        {
                           result = Boolean(this.sourceRole.getPlayer().catchNewPet(petName,bm.getLevel()));
                           if(result)
                           {
                              TweenMax.delayedCall(2,function(param1:BaseMonster):*
                              {
                                 gc.ts.setTxt("捕捉成功！");
                                 gc.stage.addChild(gc.ts);
                                 param1.destroy();
                              },[bm]);
                           }
                           else
                           {
                              gc.ts.setTxt("宠物栏已满！");
                              gc.stage.addChild(gc.ts);
                              TweenMax.delayedCall(2,function(param1:BaseMonster, param2:MovieClip):*
                              {
                                 param1.body.removeChild(param2);
                              },[bm,mc]);
                           }
                        }
                        else
                        {
                           gc.ts.setTxt("捕捉失败！");
                           gc.stage.addChild(gc.ts);
                           TweenMax.delayedCall(2,function(param1:BaseMonster, param2:MovieClip):*
                           {
                              param1.body.removeChild(param2);
                           },[bm,mc]);
                        }
                        this.effect = null;
                        break;
                     }
                  }
               }
            }
         }
      }
   }
}

