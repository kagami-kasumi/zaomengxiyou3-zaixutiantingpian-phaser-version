package base
{
   import flash.display.*;
   
   public class MonsterEntity extends BaseMonster
   {
      
      protected var _display:Sprite;
      
      protected var timenum:int = 0;
      
      public function MonsterEntity()
      {
         super();
         this.initialization();
      }
      
      public function initialization() : void
      {
         this._display = new Sprite();
         var _loc1_:Sprite = new Sprite();
         this._display.addChild(_loc1_);
         var _loc2_:Sprite = new Sprite();
         this._display.addChild(_loc2_);
         var _loc3_:Sprite = new Sprite();
         this._display.addChild(_loc3_);
         _loc3_.mouseChildren = _loc3_.mouseEnabled = false;
         _loc3_.cacheAsBitmap = true;
         this._display.mouseEnabled = this._display.mouseChildren = false;
         this._display.cacheAsBitmap = true;
      }
      
      protected function onNormalTextureReady() : void
      {
      }
      
      override public function step() : void
      {
         super.step();
         this.bbdc.renderAnimate();
      }
      
      override public function getBBDC() : BaseBitmapDataClip
      {
         return this.bbdc;
      }
      
      public function getBBDC1() : BaseAnimation
      {
         return this.bbdc;
      }
      
      private function appear() : void
      {
         var _loc1_:Class = AssetManager.getIns().getClass(url,"mc_appear");
         _appearMc = new _loc1_();
         Sprite(this._display.getChildAt(0)).addChild(_appearMc);
         _appearMc.addFrameScript(_appearMc.totalFrames - 1,this.start);
      }
      
      private function start() : void
      {
      }
      
      override public function setAction(action:String) : void
      {
         super.setAction(action);
         this.bbdc.setAction(action);
         if(action == "hurt")
         {
            bbdc.show();
            if(curAction == "hurt")
            {
               bbdc.gotoAndPlay(1);
            }
         }
      }
      
      public function toAttack(param1:int) : void
      {
      }
      
      private function changeAction(param1:int) : void
      {
      }
      
      override public function destroy() : void
      {
         super.destroy();
      }
   }
}

