package export.level
{
   import base.BaseHero;
   import base.BaseLevelListenering;
   import flash.display.*;
   import flash.events.Event;
   import my.*;
   
   public class StageListener1161 extends BaseLevelListenering
   {
      
      private var _light:MovieClip;
      
      private var _player1FuyuanMC:MovieClip;
      
      private var _player2FuyuanMC:MovieClip;
      
      public function StageListener1161()
      {
         super();
         this.setSurpressLevel(70,10);
         this.waitForRegisterDataArray = ["Monster69","Monster628"];
      }
      
      override public function step() : void
      {
         var _loc1_:BaseHero = null;
         var _loc2_:MyEquipObj = null;
         var _loc3_:Boolean = false;
         super.step();
         if(this._light)
         {
            if(this._light.visible)
            {
               for each(_loc1_ in gc.getPlayerArray())
               {
                  if(AUtils.GetDisBetweenTwoObj(_loc1_,this._light) <= 100)
                  {
                     _loc2_ = _loc1_.getPlayer().getCurEquipByType("zbsp");
                     if(_loc2_)
                     {
                        if(_loc2_.getFillName() == "psdclj")
                        {
                           _loc3_ = false;
                           if(_loc1_.getPlayer() == gc.player1)
                           {
                              if(this._player1FuyuanMC)
                              {
                                 this._player1FuyuanMC.gotoAndStop(this._player1FuyuanMC.currentFrame + 1);
                                 if(this._player1FuyuanMC.currentFrame == this._player1FuyuanMC.totalFrames)
                                 {
                                    _loc3_ = true;
                                    gc.gameSence.removeChild(this._player1FuyuanMC);
                                    this._player1FuyuanMC = null;
                                 }
                              }
                              else
                              {
                                 this._player1FuyuanMC = AUtils.getNewObj("Stage151Jindutiao") as MovieClip;
                                 this._player1FuyuanMC.x = _loc1_.x + 20;
                                 this._player1FuyuanMC.y = _loc1_.y - 40;
                                 gc.gameSence.addChild(this._player1FuyuanMC);
                              }
                           }
                           else if(this._player2FuyuanMC)
                           {
                              this._player2FuyuanMC.gotoAndStop(this._player2FuyuanMC.currentFrame + 1);
                              if(this._player2FuyuanMC.currentFrame == this._player2FuyuanMC.totalFrames)
                              {
                                 _loc3_ = true;
                                 gc.gameSence.removeChild(this._player2FuyuanMC);
                                 this._player2FuyuanMC = null;
                              }
                           }
                           else
                           {
                              this._player2FuyuanMC = AUtils.getNewObj("Stage151Jindutiao") as MovieClip;
                              this._player2FuyuanMC.x = _loc1_.x - 20;
                              this._player2FuyuanMC.y = _loc1_.y - 40;
                              gc.gameSence.addChild(this._player2FuyuanMC);
                           }
                           if(_loc3_)
                           {
                              if(_loc1_.roleProperies)
                              {
                                 _loc1_.roleProperies.removeAllEquip();
                                 _loc1_.getPlayer().doWhenCljReduction();
                                 _loc1_.roleProperies.addAllEquip();
                                 gc.alert("成功复原了苍龙戒");
                              }
                           }
                        }
                     }
                  }
                  else if(_loc1_.getPlayer() == gc.player1)
                  {
                     if(this._player1FuyuanMC)
                     {
                        this._player1FuyuanMC.gotoAndStop(1);
                        gc.gameSence.removeChild(this._player1FuyuanMC);
                        this._player1FuyuanMC = null;
                     }
                  }
                  else if(_loc1_.getPlayer() == gc.player2)
                  {
                     if(this._player2FuyuanMC)
                     {
                        this._player2FuyuanMC.gotoAndStop(1);
                        gc.gameSence.removeChild(this._player2FuyuanMC);
                        this._player2FuyuanMC = null;
                     }
                  }
               }
            }
         }
      }
      
      override public function start() : void
      {
         super.start();
         this._light = gc.gameSence.getChildByNameInBgSprite("Light") as MovieClip;
         if(this._light)
         {
            this._light.visible = false;
         }
         MainGame.getInstance().createMonster(69,400,200);
         gc.eventManger.addEventListener("showStage161Light",this.showLight);
         gc.eventManger.addEventListener("hideStage161Light",this.hideLight);
      }
      
      private function showLight(param1:Event) : void
      {
         if(this._light)
         {
            this._light.visible = true;
         }
      }
      
      private function hideLight(param1:Event) : void
      {
         if(this._light)
         {
            this._light.visible = false;
         }
      }
      
      override public function destroy() : void
      {
         gc.eventManger.removeEventListener("showStage161Light",this.showLight);
         gc.eventManger.removeEventListener("hideStage161Light",this.hideLight);
         super.destroy();
         this._light = null;
      }
   }
}

