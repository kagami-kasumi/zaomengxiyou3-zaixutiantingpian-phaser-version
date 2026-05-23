package export.cure
{
   public class SmallMP extends SmallHP
   {
      
      public function SmallMP(param1:Boolean = false)
      {
         super();
         this.isUsed = param1;
         this.cname = "SMp";
         allcount = 72;
      }
      
      override protected function cure() : *
      {
         this.curNum = curWho.roleProperies.getSMMP() * 0.25;
         curWho.roleProperies.setMMP(curWho.roleProperies.getMMP() + this.curNum);
         this.addCureMpMc(this.curNum);
      }
   }
}

