package export.pill
{
   import base.BaseHero;
   import event.*;
   
   public class Pill
   {
      
      public static var PILL_HP:uint = 1;
      
      public static var PILL_MP:uint = 2;
      
      public static var PILL_CRIT:uint = 3;
      
      public static var PILL_CHP:uint = 4;
      
      public static var PILL_CMP:uint = 5;
      
      private var _type:uint = 0;
      
      private var _value:uint = 0;
      
      private var _bh:BaseHero;
      
      public function Pill(param1:uint, param2:BaseHero)
      {
         super();
         this._type = param1;
         this._bh = param2;
         this.addPill();
      }
      
      public function addPill() : void
      {
         var _loc1_:Number = Number(NaN);
         _loc1_ = 0;
         switch(this._type)
         {
            case PILL_HP:
               this._value = this._bh.getPlayer().findAllImmortalityAddHp();
               if(this._bh.roleProperies.getSHHP() > 0)
               {
                  _loc1_ = this._bh.roleProperies.getHHP() / this._bh.roleProperies.getSHHP();
               }
               else
               {
                  _loc1_ = 0;
               }
               this._bh.roleProperies.dispatchEvent(new CommonEvent("SetSHHp",[this._bh.roleProperies.getSHHP() + this._value]));
               this._bh.roleProperies.dispatchEvent(new CommonEvent("SetHHp",[this._bh.roleProperies.getHHP() + this._value * _loc1_]));
               trace("热血----->:" + this._value);
               break;
            case PILL_MP:
               this._value = this._bh.getPlayer().findAllImmortalityAddMp();
               if(this._bh.roleProperies.getSMMP() > 0)
               {
                  _loc1_ = this._bh.roleProperies.getMMP() / this._bh.roleProperies.getSMMP();
               }
               else
               {
                  _loc1_ = 0;
               }
               this._bh.roleProperies.dispatchEvent(new CommonEvent("SetSMMp",[this._bh.roleProperies.getSMMP() + this._value]));
               this._bh.roleProperies.dispatchEvent(new CommonEvent("SetMMp",[this._bh.roleProperies.getMMP() + this._value * _loc1_]));
               trace("魔泉----->:" + this._value);
               break;
            case PILL_CRIT:
               this._value = this._bh.getPlayer().findAllImmortalityAddCrit();
               this._bh.roleProperies.setCrit(this._bh.roleProperies.getCrit() + this._value);
               trace("狂暴----->:" + this._value);
               break;
            case PILL_CHP:
               this._value = this._bh.getPlayer().findAllImmortalityAddCHp();
               this._bh.roleProperies.setHx(this._bh.roleProperies.getHx() + this._value);
               trace("永恒----->:" + this._value);
               break;
            case PILL_CMP:
               this._value = this._bh.getPlayer().findAllImmortalityAddCMp();
               this._bh.roleProperies.setHl(this._bh.roleProperies.getHl() + this._value);
               trace("辉煌----->:" + this._value);
         }
      }
      
      public function refreshPill() : void
      {
         this.removePill();
         this.addPill();
      }
      
      public function removePill() : void
      {
         var _loc1_:int = int(this._value);
         var _loc2_:Number = 0;
         switch(this._type)
         {
            case PILL_HP:
               if(this._bh.roleProperies.getSHHP() > 0)
               {
                  _loc2_ = this._bh.roleProperies.getHHP() / this._bh.roleProperies.getSHHP();
               }
               else
               {
                  _loc2_ = 0;
               }
               this._bh.roleProperies.dispatchEvent(new CommonEvent("SetSHHp",[this._bh.roleProperies.getSHHP() - _loc1_]));
               this._bh.roleProperies.dispatchEvent(new CommonEvent("SetHHp",[this._bh.roleProperies.getHHP() - _loc1_ * _loc2_]));
               break;
            case PILL_MP:
               if(this._bh.roleProperies.getSMMP() > 0)
               {
                  _loc2_ = this._bh.roleProperies.getMMP() / this._bh.roleProperies.getSMMP();
               }
               else
               {
                  _loc2_ = 0;
               }
               this._bh.roleProperies.dispatchEvent(new CommonEvent("SetSMMp",[this._bh.roleProperies.getSMMP() - _loc1_]));
               this._bh.roleProperies.dispatchEvent(new CommonEvent("SetMMp",[this._bh.roleProperies.getMMP() - _loc1_ * _loc2_]));
               break;
            case PILL_CRIT:
               this._bh.roleProperies.setCrit(this._bh.roleProperies.getCrit() - this._value);
               break;
            case PILL_CHP:
               this._bh.roleProperies.setHx(this._bh.roleProperies.getHx() - this._value);
               break;
            case PILL_CMP:
               this._bh.roleProperies.setHl(this._bh.roleProperies.getHl() - this._value);
         }
      }
      
      public function get type() : uint
      {
         return this._type;
      }
      
      public function set type(param1:uint) : void
      {
         this._type = param1;
      }
      
      public function get value() : uint
      {
         return this._value;
      }
      
      public function set value(param1:uint) : void
      {
         this._value = param1;
      }
   }
}

