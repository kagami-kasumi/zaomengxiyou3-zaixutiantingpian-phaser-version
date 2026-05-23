package export.pack
{
   import config.*;
   import export.microshop.*;
   import flash.display.Sprite;
   import flash.events.*;
   import flash.geom.*;
   import flash.utils.*;
   import my.MyEquipObj;
   
   public class ShowObj extends Sprite
   {
      
      private var tubiao:*;
      
      private var myEquipObj:MyEquipObj;
      
      private var mianban:AttributeCon;
      
      private var gc:Config;
      
      public function ShowObj(param1:MyEquipObj)
      {
         super();
         this.gc = Config.getInstance();
         this.name = "curzb";
         this.myEquipObj = param1;
         if(this.myEquipObj.getFillName() == "zylhys")
         {
            this.tubiao = AUtils.getImageObj("lhys");
         }
         else if(this.myEquipObj.getFillName() == "zxptzzzs")
         {
            this.tubiao = AUtils.getImageObj("zxstgzzs");
         }
         else if(this.myEquipObj.getFillName() == "zxptyzzs")
         {
            this.tubiao = AUtils.getImageObj("zxstgzzs");
         }
         else if(this.myEquipObj.getFillName() == "zxztkzzs")
         {
            this.tubiao = AUtils.getImageObj("zxstgzzs");
         }
         else if(this.myEquipObj.getFillName() == "zxztpzzs")
         {
            this.tubiao = AUtils.getImageObj("zxstgzzs");
         }
         else if(this.myEquipObj.getFillName() == "zxqtczzs")
         {
            this.tubiao = AUtils.getImageObj("zxstgzzs");
         }
         else if(this.myEquipObj.getFillName() == "zxqtszzs")
         {
            this.tubiao = AUtils.getImageObj("zxstgzzs");
         }
         else if(this.myEquipObj.getFillName() == "zxztjzzs")
         {
            this.tubiao = AUtils.getImageObj("zxstgzzs");
         }
         else if(this.myEquipObj.getFillName() == "zxttpzzs")
         {
            this.tubiao = AUtils.getImageObj("zxstgzzs");
         }
         else if(this.myEquipObj.getFillName() == "sqmdcqgzzs")
         {
            this.tubiao = AUtils.getImageObj("zxstgzzs");
         }
         else if(this.myEquipObj.getFillName() == "sqmdcqg")
         {
            this.tubiao = AUtils.getImageObj("sqcqg");
         }
         else if(this.myEquipObj.getFillName() == "cs_wq_glzzs")
         {
            this.tubiao = AUtils.getImageObj("cs_wq_qszzs");
         }
         else if(this.myEquipObj.getFillName() == "cs_fj_tlzzs")
         {
            this.tubiao = AUtils.getImageObj("cs_fj_dzzzs");
         }
         else if(this.myEquipObj.getFillName() == "xlnyzzs")
         {
            this.tubiao = AUtils.getImageObj("xlthzzs");
         }
         else if(this.myEquipObj.getFillName() == "xltqzzs")
         {
            this.tubiao = AUtils.getImageObj("xlthzzs");
         }
         else if(this.myEquipObj.getFillName() == "_cljzzs")
         {
            this.tubiao = AUtils.getImageObj("qlgzzs");
         }
         else if(this.myEquipObj.getFillName() == "clpzzs")
         {
            this.tubiao = AUtils.getImageObj("qljzzs");
         }
         else if(this.myEquipObj.getFillName() == "xhmlpzzs")
         {
            this.tubiao = AUtils.getImageObj("dszkzzs");
         }
         else if(this.myEquipObj.getFillName() == "xhjxjzzs")
         {
            this.tubiao = AUtils.getImageObj("ryjgbzzs");
         }
         else if(this.myEquipObj.getFillName() == "mksddf")
         {
            this.tubiao = AUtils.getImageObj("lly");
         }
         else
         {
            this.tubiao = AUtils.getImageObj(this.myEquipObj.getFillName());
         }
         addChild(this.tubiao);
         this.buttonMode = true;
         this.addEventListener(Event.ADDED_TO_STAGE,this.added,false,0,true);
         this.addEventListener(Event.REMOVED_FROM_STAGE,this.removed,false,0,true);
      }
      
      private function added(param1:*) : void
      {
         this.addEventListener(MouseEvent.ROLL_OVER,this.showattribute);
         this.addEventListener(MouseEvent.ROLL_OUT,this.removeattribute);
         this.addEventListener(MouseEvent.MOUSE_MOVE,this.refreshPoint);
         if(this.parent)
         {
            if(this.parent.parent)
            {
               if(this.parent.parent.parent)
               {
                  if(this.parent.parent.parent is Micropayment)
                  {
                     if(this.myEquipObj.type == "zbsz")
                     {
                        this.removeEventListener(MouseEvent.ROLL_OVER,this.showattribute);
                        this.removeEventListener(MouseEvent.ROLL_OUT,this.removeattribute);
                     }
                  }
               }
            }
         }
      }
      
      private function removed(param1:*) : void
      {
         this.removeEventListener(MouseEvent.ROLL_OVER,this.showattribute);
         this.removeEventListener(MouseEvent.ROLL_OUT,this.removeattribute);
         this.removeEventListener(MouseEvent.MOUSE_MOVE,this.refreshPoint);
         this.pulbiremoved();
      }
      
      private function showattribute(param1:*) : void
      {
         this.mianban = new AttributeCon(this.myEquipObj);
         GMain.getInstance().stage.addChild(this.mianban);
         var _loc2_:Point = new Point(GMain.getInstance().stage.mouseX,GMain.getInstance().stage.mouseY);
         if(GMain.getInstance().stage.mouseX + this.mianban.width > 930)
         {
            this.mianban.x = _loc2_.x - this.mianban.width - 10;
         }
         else
         {
            this.mianban.x = _loc2_.x + 10;
         }
         this.mianban.y = 590 - this.mianban.height > _loc2_.y ? _loc2_.y : 590 - this.mianban.height;
         if(this.parent is PackThings)
         {
            PackThings(this.parent).setTxtVisible(false);
         }
      }
      
      public function removemouselisten() : void
      {
         this.removeEventListener(MouseEvent.ROLL_OVER,this.showattribute);
         this.removeEventListener(MouseEvent.ROLL_OUT,this.removeattribute);
         this.removeEventListener(MouseEvent.MOUSE_MOVE,this.refreshPoint);
      }
      
      private function removeattribute(param1:*) : void
      {
         this.pulbiremoved();
         if(this.parent is PackThings)
         {
            PackThings(this.parent).setTxtVisible(true);
         }
      }
      
      public function pulbiremoved() : void
      {
         if(Boolean(this.mianban) && Boolean(this.mianban.parent))
         {
            this.mianban.parent.removeChild(this.mianban);
            this.mianban = null;
         }
      }
      
      private function refreshPoint(param1:MouseEvent) : void
      {
         var _loc2_:Point = null;
         if(this.mianban)
         {
            _loc2_ = new Point(GMain.getInstance().stage.mouseX,GMain.getInstance().stage.mouseY);
            if(GMain.getInstance().stage.mouseX + this.mianban.width > 930)
            {
               this.mianban.x = _loc2_.x - this.mianban.width - 10;
            }
            else
            {
               this.mianban.x = _loc2_.x + 10;
            }
            this.mianban.y = 590 - this.mianban.height > _loc2_.y ? _loc2_.y : 590 - this.mianban.height;
         }
      }
      
      public function getMyEquipObj() : MyEquipObj
      {
         return this.myEquipObj;
      }
      
      public function setMyEquipObj(param1:MyEquipObj) : void
      {
         this.myEquipObj = param1;
      }
      
      public function getmianban() : AttributeCon
      {
         return this.mianban;
      }
   }
}

