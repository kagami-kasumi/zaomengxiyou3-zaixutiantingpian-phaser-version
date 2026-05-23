package export.strength
{
   import flash.display.Sprite;
   
   public class EquipmentSprite extends Sprite
   {
      
      private var data:Number;
      
      public function EquipmentSprite()
      {
         super();
         this.data = 0;
      }
      
      public function getData() : Number
      {
         return this.data;
      }
      
      public function setData(value:Number) : void
      {
         this.data = value;
      }
   }
}

