package export.huodong
{
   import com.adobe.crypto.*;
   import config.*;
   import event.*;
   import flash.display.*;
   import flash.events.*;
   import flash.net.*;
   import my.*;
   import petInfo.*;
   
   public class ChineseValentinesDay extends Sprite
   {
      
      public var btn_x:SimpleButton;
      
      public var btn_go:SimpleButton;
      
      private var gc:Config;
      
      private var urlLoader:URLLoader;
      
      public function ChineseValentinesDay()
      {
         super();
         this.gc = Config.getInstance();
         this.addEventListener(Event.ADDED_TO_STAGE,this.added,false,0,true);
         this.addEventListener(Event.REMOVED_FROM_STAGE,this.removed,false,0,true);
      }
      
      private function added(param1:Event) : void
      {
         this.btn_x.addEventListener(MouseEvent.CLICK,this.backClick);
         this.btn_go.addEventListener(MouseEvent.CLICK,this.goClick);
      }
      
      private function removed(param1:Event) : void
      {
         this.btn_x.removeEventListener(MouseEvent.CLICK,this.backClick);
         this.btn_go.removeEventListener(MouseEvent.CLICK,this.goClick);
      }
      
      private function backClick(param1:*) : void
      {
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
      }
      
      private function goClick(param1:*) : void
      {
         var _loc2_:* = 0;
         var _loc3_:* = null;
         var _loc4_:* = null;
         var _loc5_:* = null;
         var _loc6_:* = null;
         var _loc7_:* = null;
         var _loc8_:* = null;
         var _loc9_:* = null;
         var _loc10_:* = 0;
         var _loc11_:* = null;
         var _loc12_:* = 0;
         if(this.gc.logInfo)
         {
            _loc2_ = uint(this.gc.logInfo.uid);
            if(this.gc.bigLibao.indexOf(_loc2_) != -1)
            {
               if(this.gc.hasget)
               {
                  this.gc.ts.setTxt("您已经领过礼包");
                  this.gc.stage.addChild(this.gc.ts);
               }
               else
               {
                  this.gc.allEquip.reNewAll();
                  _loc3_ = this.gc.allEquip.findByName("sms1");
                  _loc3_.setNum(2);
                  _loc4_ = this.gc.allEquip.findByName("mfs1");
                  _loc4_.setNum(2);
                  _loc5_ = this.gc.allEquip.findByName("gjs1");
                  _loc5_.setNum(2);
                  _loc6_ = this.gc.allEquip.findByName("fys1");
                  _loc6_.setNum(2);
                  _loc7_ = this.gc.allEquip.findByName("wpqhs1");
                  _loc7_.setNum(11);
                  if(this.gc.player1.roleid > 0)
                  {
                     _loc8_ = new PetInfo();
                     _loc8_.setPetNameAndLevel("monkey1",1);
                     this.gc.player1.petsAry.push(_loc8_);
                     _loc9_ = new Array();
                     _loc9_ = this.getNormalEquipByRoleId(this.gc.player1.roleid);
                     _loc9_.push(_loc3_,_loc4_,_loc5_,_loc6_,_loc7_);
                     _loc10_ = uint(_loc9_.length);
                     while(_loc10_-- > 0)
                     {
                        if(MyEquipObj(_loc9_[_loc10_]).type == "zbwp" || MyEquipObj(_loc9_[_loc10_]).type == "wpqhs")
                        {
                           this.gc.putQhsInBackPack(this.gc.player1,MyEquipObj(_loc9_[_loc10_]).getFillName(),MyEquipObj(_loc9_[_loc10_]).getENum());
                        }
                        else
                        {
                           this.gc.player1.zblist.push(_loc9_[_loc10_]);
                        }
                     }
                  }
                  if(this.gc.player2.roleid > 0)
                  {
                     _loc8_ = new PetInfo();
                     _loc8_.setPetNameAndLevel("monkey1",1);
                     this.gc.player2.petsAry.push(_loc8_);
                     _loc11_ = new Array();
                     _loc11_ = this.getNormalEquipByRoleId(this.gc.player2.roleid);
                     _loc11_.push(_loc3_,_loc4_,_loc5_,_loc6_,_loc7_);
                     _loc12_ = uint(_loc11_.length);
                     while(_loc12_-- > 0)
                     {
                        if(MyEquipObj(_loc11_[_loc12_]).type == "zbwp" || MyEquipObj(_loc11_[_loc12_]).type == "wpqhs")
                        {
                           this.gc.putQhsInBackPack(this.gc.player2,MyEquipObj(_loc11_[_loc12_]).getFillName(),MyEquipObj(_loc11_[_loc12_]).getENum());
                        }
                        else
                        {
                           this.gc.player2.zblist.push(_loc11_[_loc12_]);
                        }
                     }
                  }
                  this.gc.hasget = true;
                  this.gc.ts.setTxt("领取成功");
                  this.gc.stage.addChild(this.gc.ts);
               }
            }
            else if(this.gc.smallLibao.indexOf(_loc2_) != -1)
            {
               if(this.gc.hasget)
               {
                  this.gc.ts.setTxt("您已经领过礼包");
                  this.gc.stage.addChild(this.gc.ts);
               }
               else
               {
                  this.gc.allEquip.reNewAll();
                  _loc7_ = this.gc.allEquip.findByName("wpqhs1");
                  _loc7_.setNum(3);
                  if(this.gc.player1.roleid > 0)
                  {
                     _loc9_ = new Array();
                     _loc9_ = this.getNormalEquipByRoleId(this.gc.player1.roleid);
                     _loc9_.push(_loc7_);
                     _loc10_ = uint(_loc9_.length);
                     while(_loc10_-- > 0)
                     {
                        if(MyEquipObj(_loc9_[_loc10_]).type == "zbwp" || MyEquipObj(_loc9_[_loc10_]).type == "wpqhs")
                        {
                           this.gc.putQhsInBackPack(this.gc.player1,MyEquipObj(_loc9_[_loc10_]).getFillName(),MyEquipObj(_loc9_[_loc10_]).getENum());
                        }
                        else
                        {
                           this.gc.player1.zblist.push(_loc9_[_loc10_]);
                        }
                     }
                  }
                  if(this.gc.player2.roleid > 0)
                  {
                     _loc11_ = new Array();
                     _loc11_ = this.getNormalEquipByRoleId(this.gc.player2.roleid);
                     _loc11_.push(_loc7_);
                     _loc12_ = uint(_loc11_.length);
                     while(_loc12_-- > 0)
                     {
                        if(MyEquipObj(_loc11_[_loc12_]).type == "zbwp" || MyEquipObj(_loc11_[_loc12_]).type == "wpqhs")
                        {
                           this.gc.putQhsInBackPack(this.gc.player2,MyEquipObj(_loc11_[_loc12_]).getFillName(),MyEquipObj(_loc11_[_loc12_]).getENum());
                        }
                        else
                        {
                           this.gc.player2.zblist.push(_loc11_[_loc12_]);
                        }
                     }
                  }
                  this.gc.hasget = true;
                  this.gc.ts.setTxt("领取成功");
                  this.gc.stage.addChild(this.gc.ts);
               }
            }
            else
            {
               this.gc.ts.setTxt("乱点。。。");
               this.gc.stage.addChild(this.gc.ts);
            }
         }
         this.gc.memory.setStorage(this.gc.saveId);
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
      }
      
      private function getNormalEquipByRoleId(param1:int) : Array
      {
         if(param1 == 1)
         {
            return [this.gc.allEquip.findByName("ptdxzf"),this.gc.allEquip.findByName("ptdxzg"),this.gc.allEquip.findByName("mysz")];
         }
         if(param1 == 2)
         {
            return [this.gc.allEquip.findByName("ptdjs"),this.gc.allEquip.findByName("ptdcz"),this.gc.allEquip.findByName("mysz")];
         }
         if(param1 == 3)
         {
            return [this.gc.allEquip.findByName("ptddp"),this.gc.allEquip.findByName("ptdcs"),this.gc.allEquip.findByName("mysz")];
         }
         if(param1 == 4)
         {
            return [this.gc.allEquip.findByName("ptdyyc"),this.gc.allEquip.findByName("ptdcp"),this.gc.allEquip.findByName("mysz")];
         }
         return null;
      }
      
      private function requestData() : void
      {
         var _loc1_:Sprite = new Sprite();
         _loc1_.name = "maskSprite";
         _loc1_.graphics.beginFill(16777215,0.5);
         _loc1_.graphics.drawRect(0,0,940,590);
         _loc1_.graphics.endFill();
         this.addChild(_loc1_);
         this.urlLoader = new URLLoader();
         this.urlLoader.dataFormat = URLLoaderDataFormat.TEXT;
         this.urlLoader.addEventListener(Event.COMPLETE,this.completeHandler);
         this.urlLoader.load(new URLRequest("http://save.api.4399.com/?ac=get_time"));
         this.urlLoader.addEventListener(IOErrorEvent.IO_ERROR,this.ioErrorHandler);
      }
      
      private function ioErrorHandler(param1:IOErrorEvent) : void
      {
         this.urlLoader.load(new URLRequest("http://save.api.4399.com/?ac=get_time"));
      }
      
      private function completeHandler(param1:*) : void
      {
         var _loc2_:String = null;
         var _loc3_:* = undefined;
         var _loc4_:* = undefined;
         var _loc5_:Sprite = this.gc.stage.getChildByName("maskSprite") as Sprite;
         if(Boolean(_loc5_) && Boolean(this.gc.stage.contains(_loc5_)))
         {
            this.gc.stage.removeChild(_loc5_);
         }
         this.urlLoader.removeEventListener(IOErrorEvent.IO_ERROR,this.ioErrorHandler);
         this.urlLoader.removeEventListener(Event.COMPLETE,this.completeHandler);
         _loc3_ = com.adobe.serialization.json.JSON.decode(this.urlLoader.data);
         _loc2_ = _loc3_["time"];
         var _loc6_:String = _loc2_.substr(0,10);
         var _loc7_:String = MD5.hash(_loc6_);
         if(this.gc.hdInfo.indexOf(_loc7_) == -1)
         {
            this.gc.ts.setTxt("欢迎参加活动");
            this.gc.hdInfo.push(_loc7_);
            this.gc.curStage = 9;
            this.gc.curLevel = 1;
            this.gc.eventManger.dispatchEvent(new CommonEvent("selectStageOver"));
            if(this.parent)
            {
               this.parent.removeChild(this);
            }
            _loc4_ = GMain.getInstance().getMainSence().getChildByName("SelectPlaceHasShow");
            if(_loc4_)
            {
               GMain.getInstance().getMainSence().removeChild(_loc4_);
               this.gc.isintheselectmap = false;
            }
         }
         else
         {
            this.gc.ts.setTxt("您已经参加过活动了，请明天再来吧");
         }
         this.gc.stage.addChild(this.gc.ts);
      }
   }
}

