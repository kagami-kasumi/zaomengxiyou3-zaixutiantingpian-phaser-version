package export.cure
{
   public class BigHP extends SmallHP
   {
      
      public function BigHP(param1:Boolean = false)
      {
         super();
         this.isUsed = param1;
         this.cname = "BHp";
         allcount = 192;
      }
      
      override protected function cure() : *
      {
         this.curNum = curWho.roleProperies.getSHHP() * 0.5;
         curWho.roleProperies.setHHP(this.curWho.roleProperies.getHHP() + this.curNum);
         this.addCureMc(this.curNum);
      }
   }
}

