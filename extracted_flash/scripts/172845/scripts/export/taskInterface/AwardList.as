package export.taskInterface
{
   import config.*;
   import flash.display.Sprite;
   import flash.text.TextField;
   
   public class AwardList extends Sprite
   {
      
      public var txtname:TextField;
      
      private var img:*;
      
      public function AwardList()
      {
         super();
      }
      
      public function addImage(param1:String) : void
      {
         var bname:String = null;
         bname = null;
         bname = param1;
         try
         {
            this.img = AUtils.getImageObj(bname);
            this.img.name = bname;
            this.img.x = 3.5;
            this.img.y = 3.5;
            this.addChild(this.img);
            return;
         }
         catch(e:*)
         {
            Config.getInstance().ts.setTxt("addImage====bname:" + bname);
            Config.getInstance().stage.addChild(Config.getInstance().ts);
            return;
         }
      }
      
      public function removeImage() : void
      {
         if(Boolean(this.img) && contains(this.img))
         {
            this.removeChild(this.img);
            this.txtname.text = "";
         }
      }
   }
}

