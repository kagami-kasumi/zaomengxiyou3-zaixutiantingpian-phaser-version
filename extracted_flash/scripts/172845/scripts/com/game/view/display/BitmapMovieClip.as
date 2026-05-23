package com.game.view.display
{
   import com.game.view.*;
   import flash.display.*;
   
   public class BitmapMovieClip extends AnimationClip implements IAnimation
   {
      
      private var _tsGroup:TextureGroup;
      
      private var _bp:Bitmap;
      
      public function BitmapMovieClip(param1:TextureGroup = null)
      {
         super();
         this.setTexture(param1);
      }
      
      public function setTexture(param1:TextureGroup) : void
      {
         if(!param1)
         {
            return;
         }
         this._tsGroup = param1;
         this.init();
      }
      
      public function getTexture() : TextureGroup
      {
         return this._tsGroup;
      }
      
      private function init() : void
      {
         _currentFrame = 1;
         _totalFrames = this._tsGroup.length;
         this._bp = new Bitmap(null,"auto",true);
         addChild(this._bp);
      }
      
      override protected function render() : void
      {
         var _loc1_:Texture = this._tsGroup.getTextureAt(_currentFrame - 1);
         if(!(this._bp.x == _loc1_.pivotX && this._bp.y == _loc1_.pivotY))
         {
            this._bp.x = _loc1_.pivotX;
            this._bp.y = _loc1_.pivotY;
         }
         this._bp.bitmapData = _loc1_.content;
      }
      
      override public function Destroy() : void
      {
         if(!this._tsGroup)
         {
            return;
         }
         this._tsGroup.destroy();
         this._tsGroup = null;
      }
      
      public function clone() : BitmapMovieClip
      {
         return new BitmapMovieClip(this._tsGroup);
      }
   }
}

