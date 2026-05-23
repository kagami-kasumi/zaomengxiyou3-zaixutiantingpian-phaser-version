package com.game.view.display
{
   import flash.display.BitmapData;
   
   public class TextureGroup
   {
      
      private var _textureVec:Vector.<Texture>;
      
      public function TextureGroup()
      {
         super();
         this._textureVec = new Vector.<Texture>();
      }
      
      public function get textureVec() : Vector.<Texture>
      {
         return this._textureVec;
      }
      
      public function get length() : int
      {
         return this._textureVec.length;
      }
      
      public function addTexture(param1:Texture) : void
      {
         this._textureVec.push(param1);
      }
      
      public function removeTexture() : void
      {
         this._textureVec.pop();
      }
      
      public function addTextureAt(param1:Texture, param2:int) : void
      {
         this._textureVec.splice(param2,0,param1);
      }
      
      public function removeTextureAt(param1:int) : void
      {
         (this._textureVec[param1] as Texture).dispose();
         this._textureVec.splice(param1,1);
      }
      
      public function setTextureAt(param1:Texture, param2:int) : void
      {
         this._textureVec[param2] = param1;
      }
      
      public function getTextureAt(param1:int) : Texture
      {
         return this._textureVec[param1];
      }
      
      public function getTextureViewAt(param1:int) : BitmapData
      {
         return (this._textureVec[param1] as Texture).content;
      }
      
      public function clearSameKeyFrame() : void
      {
         var _loc1_:Texture = null;
         var _loc2_:Texture = null;
         var _loc3_:* = undefined;
         var _loc4_:int = 0;
         while(_loc4_ < this._textureVec.length - 1)
         {
            _loc1_ = this._textureVec[_loc4_];
            _loc2_ = this._textureVec[_loc4_ + 1];
            _loc3_ = _loc1_.content.compare(_loc2_.content);
            if(typeof _loc3_ == "number" && _loc3_ == 0)
            {
               _loc2_.content.dispose();
               _loc2_.content = _loc1_.content;
            }
            _loc4_++;
         }
      }
      
      public function destroy() : void
      {
         while(this._textureVec.length > 0)
         {
            (this._textureVec[0] as Texture).dispose();
            this._textureVec.shift();
         }
      }
   }
}

