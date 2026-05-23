package export.pet
{
   import flash.display.MovieClip;
   import flash.display.Sprite;
   import flash.events.*;
   import flash.text.TextField;
   import petInfo.PetInfo;
   
   public class ShowPetInfo extends Sprite
   {
      
      private var pif:PetInfo;
      
      private var rid:uint;
      
      public var headmc:MovieClip;
      
      public var txtlevel:TextField;
      
      public var txthp:TextField;
      
      public var txtmp:TextField;
      
      public var hpmc:MovieClip;
      
      public var mpmc:MovieClip;
      
      public function ShowPetInfo()
      {
         super();
         this.addEventListener(Event.ADDED_TO_STAGE,this.added,false,0,true);
         this.addEventListener(Event.REMOVED_FROM_STAGE,this.removed,false,0,true);
      }
      
      private function added(param1:Event) : void
      {
      }
      
      private function removed(param1:Event) : void
      {
      }
      
      public function setPetInfo(param1:PetInfo) : void
      {
         this.pif = param1;
      }
      
      public function flipHorizontalTxt(param1:uint) : void
      {
         if(param1 == 2)
         {
            AUtils.flipHorizontal(this.txthp,-1);
            this.txthp.x = 140;
            AUtils.flipHorizontal(this.txtmp,-1);
            this.txtmp.x = 140;
            AUtils.flipHorizontal(this.txtlevel,-1);
            this.txtlevel.x = 25;
         }
      }
      
      public function show() : void
      {
         if(this.pif)
         {
            this.pif.transPetChinaSkillName(this.pif.getPetName());
            this.headmc.gotoAndStop(this.pif.getPetChinaName());
            this.txtlevel.text = this.pif.getLevel() + "";
            this.txthp.text = this.pif.getHp() + "/" + this.pif.getSHp();
            this.hpmc.gotoAndStop(25 - Math.round(25 * Number(this.pif.getHp()) / Number(this.pif.getSHp())));
            this.txtmp.text = this.pif.getMp() + "/" + this.pif.getSMp();
            this.mpmc.gotoAndStop(25 - Math.round(25 * Number(this.pif.getMp()) / Number(this.pif.getSMp())));
         }
      }
   }
}

