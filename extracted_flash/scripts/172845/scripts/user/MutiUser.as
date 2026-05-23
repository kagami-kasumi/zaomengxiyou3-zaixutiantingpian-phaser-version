package user
{
   import base.BaseHero;
   import flash.geom.Point;
   
   public class MutiUser
   {
      
      private var _sid:uint;
      
      private var _hp:uint;
      
      private var _shp:uint;
      
      private var _equpId:uint;
      
      private var _weaponId:uint;
      
      private var _roleId:uint;
      
      private var _mDef:uint;
      
      private var _def:uint;
      
      private var _level:uint;
      
      private var _pos:Point;
      
      private var _direct:int;
      
      private var _index:uint;
      
      private var _hero:BaseHero;
      
      private var _petName:String;
      
      private var _petHp:int;
      
      private var _petMp:int;
      
      private var _petLevel:uint;
      
      private var _bmwId:uint;
      
      private var _uName:String = "";
      
      public function MutiUser()
      {
         super();
      }
      
      public function get petLevel() : uint
      {
         return this._petLevel;
      }
      
      public function set petLevel(param1:uint) : void
      {
         this._petLevel = param1;
      }
      
      public function get def() : uint
      {
         return this._def;
      }
      
      public function set def(param1:uint) : void
      {
         this._def = param1;
      }
      
      public function get mDef() : uint
      {
         return this._mDef;
      }
      
      public function set mDef(param1:uint) : void
      {
         this._mDef = param1;
      }
      
      public function get uName() : String
      {
         return this._uName;
      }
      
      public function set uName(param1:String) : void
      {
         this._uName = param1;
      }
      
      public function get bmwId() : uint
      {
         return this._bmwId;
      }
      
      public function set bmwId(param1:uint) : void
      {
         this._bmwId = param1;
      }
      
      public function get petMp() : uint
      {
         return this._petMp;
      }
      
      public function set petMp(param1:uint) : void
      {
         this._petMp = param1;
      }
      
      public function get petHp() : int
      {
         return this._petHp;
      }
      
      public function set petHp(param1:int) : void
      {
         this._petHp = param1;
      }
      
      public function get petName() : String
      {
         return this._petName;
      }
      
      public function set petName(param1:String) : void
      {
         this._petName = param1;
      }
      
      public function get index() : uint
      {
         return this._index;
      }
      
      public function set index(param1:uint) : void
      {
         this._index = param1;
      }
      
      public function get hero() : BaseHero
      {
         return this._hero;
      }
      
      public function set hero(param1:BaseHero) : void
      {
         this._hero = param1;
      }
      
      public function get direct() : int
      {
         return this._direct;
      }
      
      public function set direct(param1:int) : void
      {
         this._direct = param1;
      }
      
      public function get pos() : Point
      {
         return this._pos;
      }
      
      public function set pos(param1:Point) : void
      {
         this._pos = param1;
      }
      
      public function get sid() : uint
      {
         return this._sid;
      }
      
      public function set sid(param1:uint) : void
      {
         this._sid = param1;
      }
      
      public function get roleId() : uint
      {
         return this._roleId;
      }
      
      public function set roleId(param1:uint) : void
      {
         this._roleId = param1;
      }
      
      public function get weaponId() : uint
      {
         return this._weaponId;
      }
      
      public function set weaponId(param1:uint) : void
      {
         this._weaponId = param1;
      }
      
      public function get equpId() : uint
      {
         return this._equpId;
      }
      
      public function set equpId(param1:uint) : void
      {
         this._equpId = param1;
      }
      
      public function get hp() : uint
      {
         return this._hp;
      }
      
      public function set hp(param1:uint) : void
      {
         this._hp = param1;
         if(this._hp < 0)
         {
            this._hp = 0;
         }
         else if(this._hp > this._shp)
         {
            this._hp = this._shp;
         }
      }
      
      public function get shp() : uint
      {
         return this._shp;
      }
      
      public function set shp(param1:uint) : void
      {
         this._shp = param1;
      }
      
      public function get level() : uint
      {
         return this._level;
      }
      
      public function set level(param1:uint) : void
      {
         this._level = param1;
      }
      
      public function getMutiInfo() : String
      {
         return this._hp + "," + this._shp + "," + this._equpId + "," + this._weaponId + "," + this._level + "," + this.petName + "," + this.petHp + "," + this.petMp + "," + this.bmwId + "," + this.def + "," + this.mDef + "," + this.petLevel;
      }
   }
}

