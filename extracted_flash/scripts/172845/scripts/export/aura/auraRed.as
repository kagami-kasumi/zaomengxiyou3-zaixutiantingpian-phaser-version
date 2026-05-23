package export.aura
{
   import base.BaseAura;
   import base.BaseHero;
   import base.BaseMonster;
   import event.*;
   
   public class auraRed extends BaseAura
   {
      
      public function auraRed(param1:BaseMonster, param2:BaseHero)
      {
         super(param1,param2);
      }
      
      override public function destroy() : void
      {
         if(this.sourceHero)
         {
            gc.eventManger.dispatchEvent(new CommonEvent("AuraEvent",[this.sourceHero,0,0,this.power,0]));
         }
         super.destroy();
      }
   }
}

