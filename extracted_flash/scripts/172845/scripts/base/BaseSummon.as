package base
{
   public class BaseSummon extends BaseHero
   {
      
      private var _sourceRole:BaseHero;
      
      public function BaseSummon()
      {
         super();
      }
      
      public function get sourceRole() : BaseHero
      {
         return this._sourceRole;
      }
      
      public function set sourceRole(param1:BaseHero) : *
      {
         this._sourceRole = param1;
      }
   }
}

