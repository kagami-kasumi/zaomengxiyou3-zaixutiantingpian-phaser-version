package my
{
   import base.BaseHero;
   import base.BaseObject;
   import com.greensock.*;
   import config.*;
   import flash.display.*;
   
   public class FallEquipObj extends BaseObject
   {
      
      private var eobj:Object;
      
      private var tcount:uint = 0;
      
      private var bosslist:Array;
      
      internal var isfirst:Boolean = true;
      
      public function FallEquipObj(param1:Object)
      {
         var _loc2_:*;
         this.bosslist = ["tdlzjzzs","shsjt","wpqhs1","tlzsp","llzsp","hlzsp","flzsp","slzsp"];
         super();
         gc = Config.getInstance();
         this.eobj = param1;
         _loc2_ = null;
         try
         {
            _loc2_ = AUtils.getImageObj("fall_" + this.eobj.name);
         }
         catch(e:*)
         {
            if(this.eobj.name == "xlnyzzs")
            {
               _loc2_ = AUtils.getImageObj("xlthzzs");
            }
            else if(this.eobj.name == "xltqzzs")
            {
               _loc2_ = AUtils.getImageObj("xlthzzs");
            }
            else if(this.eobj.name == "_cljzzs")
            {
               _loc2_ = AUtils.getImageObj("qlgzzs");
            }
            else if(this.eobj.name == "clpzzs")
            {
               trace("螭龙袍");
               _loc2_ = AUtils.getImageObj("qlgzzs");
            }
            else
            {
               _loc2_ = AUtils.getImageObj(this.eobj.name);
            }
         }
         trace(this.eobj.name);
         _loc2_.x = -Number(_loc2_.width) / 2;
         _loc2_.y = -Number(_loc2_.height) / 2;
         this.colipse = new MovieClip();
         this.colipse.addChild(_loc2_);
         addChild(this.colipse);
      }
      
      override public function step() : void
      {
         var _loc1_:* = null;
         var _loc2_:int = 0;
         this.checkCanMove();
         var _loc3_:uint = gc.getPlayerArray().length;
         while(_loc3_-- > 0)
         {
            _loc1_ = gc.getPlayerArray()[_loc3_];
            this.colwho(_loc1_);
         }
         if(this.gc.curStage == 98)
         {
            if(this.tcount++ >= gc.frameClips * 15)
            {
               this.tcount = 0;
               _loc2_ = int(this.bosslist.indexOf(this.eobj.name));
               if(_loc2_ == -1)
               {
                  this.remove();
               }
            }
         }
         else if(this.tcount++ >= gc.frameClips * 99999)
         {
            this.tcount = 0;
            _loc2_ = int(this.bosslist.indexOf(this.eobj.name));
            if(_loc2_ == -1)
            {
               this.remove();
            }
         }
      }
      
      protected function colwho(param1:BaseHero) : void
      {
         var _loc2_:* = null;
         if(this.isfirst)
         {
            if(param1.body)
            {
               switch(this.eobj.bigtype)
               {
                  case "zb":
                     if(param1.getPlayer().zblist.length < 125)
                     {
                        gc.allEquip.newMyEquipObj();
                        _loc2_ = gc.allEquip.findByName(this.eobj.name);
                        if(_loc2_)
                        {
                           if(_loc2_.getFillName() == "shsjt")
                           {
                              if(param1.getPlayer().getSomeEquipInPackBackByName("shsjt") != null || Boolean(param1.getPlayer().getCurEquipByType("zbsp")) && Boolean(param1.getPlayer().getCurEquipByType("zbsp").getFillName() == "shsjt"))
                              {
                                 return;
                              }
                              param1.getPlayer().zblist.push(_loc2_);
                              break;
                           }
                           param1.getPlayer().zblist.push(_loc2_);
                        }
                        break;
                     }
                     return;
                     break;
                  case "dj":
                     if(param1.getPlayer().djlist.length < 125)
                     {
                        gc.allEquip.reNewAll();
                        gc.putQhsInBackPack(param1.getPlayer(),this.eobj.name);
                        break;
                     }
                     return;
                     break;
                  case "sz":
                     if(param1.getPlayer().djlist.length < 125)
                     {
                        gc.allEquip.reNewAll();
                        _loc2_ = gc.allEquip.findByName(this.eobj.name);
                        if(_loc2_)
                        {
                           param1.getPlayer().szlist.push(_loc2_);
                        }
                        break;
                     }
                     return;
               }
               this.isfirst = false;
               TweenMax.to(this,0.8,{
                  "y":this.y - 100,
                  "alpha":0,
                  "onComplete":this.remove
               });
            }
         }
      }
      
      private function remove() : void
      {
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
         this.eobj = null;
         var _loc1_:int = int(gc.otherList.indexOf(this));
         if(_loc1_ != -1)
         {
            gc.otherList.splice(_loc1_,1);
            this.bosslist = null;
         }
      }
      
      override protected function checkOver() : void
      {
         this.remove();
      }
   }
}

