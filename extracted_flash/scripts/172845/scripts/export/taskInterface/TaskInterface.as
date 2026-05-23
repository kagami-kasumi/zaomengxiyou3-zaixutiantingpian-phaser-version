package export.taskInterface
{
   import config.*;
   import flash.display.MovieClip;
   import flash.display.SimpleButton;
   import flash.display.Sprite;
   import flash.events.*;
   import flash.text.TextField;
   import my.*;
   import petInfo.*;
   import task.*;
   
   public class TaskInterface extends Sprite
   {
      
      public var btn_close:SimpleButton;
      
      public var dailymc:MovieClip;
      
      public var activitymc:MovieClip;
      
      public var getaward:MovieClip;
      
      public var prepage:SimpleButton;
      
      public var nextpage:SimpleButton;
      
      public var txtinstr:TextField;
      
      public var txtcur:TextField;
      
      public var t1:TaskTile;
      
      public var t2:TaskTile;
      
      public var t3:TaskTile;
      
      public var t4:TaskTile;
      
      public var t5:TaskTile;
      
      public var alist1:AwardList;
      
      public var alist2:AwardList;
      
      public var alist3:AwardList;
      
      public var alist4:AwardList;
      
      public var txtpage:TextField;
      
      private var curPage:uint = 1;
      
      private var allPage:uint = 1;
      
      private var gc:Config;
      
      private var curAry:Array;
      
      private var selectTask:Task;
      
      private var selectId:uint = 0;
      
      public function TaskInterface()
      {
         this.curAry = [];
         super();
         this.gc = Config.getInstance();
         this.dailymc.buttonMode = true;
         this.activitymc.buttonMode = true;
         this.getaward.buttonMode = true;
         this.txtinstr.selectable = false;
         this.txtcur.selectable = false;
         this.addEventListener(Event.ADDED_TO_STAGE,this.added,false,0,true);
         this.addEventListener(Event.REMOVED_FROM_STAGE,this.removed,false,0,true);
      }
      
      private function added(param1:Event) : void
      {
         this.getaward.gotoAndStop(1);
         this.btn_close.addEventListener(MouseEvent.CLICK,this.closed);
         this.dailymc.addEventListener(MouseEvent.CLICK,this.dailyClick);
         this.activitymc.addEventListener(MouseEvent.CLICK,this.activityClick);
         this.prepage.addEventListener(MouseEvent.CLICK,this.prePage);
         this.nextpage.addEventListener(MouseEvent.CLICK,this.nextPage);
         this.dailymc.dispatchEvent(new MouseEvent(MouseEvent.CLICK));
      }
      
      private function removed(param1:Event) : void
      {
         this.btn_close.removeEventListener(MouseEvent.CLICK,this.closed);
         this.dailymc.removeEventListener(MouseEvent.CLICK,this.dailyClick);
         this.activitymc.removeEventListener(MouseEvent.CLICK,this.activityClick);
         this.getaward.removeEventListener(MouseEvent.CLICK,this.awardClick);
         this.prepage.removeEventListener(MouseEvent.CLICK,this.prePage);
         this.nextpage.removeEventListener(MouseEvent.CLICK,this.nextPage);
         var _loc2_:int = 0;
         while(_loc2_ < 5)
         {
            this["t" + (_loc2_ + 1)].removeEventListener(MouseEvent.CLICK,this.selected);
            _loc2_++;
         }
         try
         {
            this.gc.keyboardControl.continueAllControl();
         }
         catch(e:*)
         {
         }
      }
      
      private function closed(param1:MouseEvent) : void
      {
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
      }
      
      private function dailyClick(param1:MouseEvent) : void
      {
         this.dailymc.gotoAndStop(2);
         this.activitymc.gotoAndStop(1);
         this.curAry = this.gc.allTask.getdayTask();
         this.setTaskList(this.curAry);
         var _loc2_:uint = uint(this.curAry.length);
         this.curPage = 1;
         this.allPage = uint(uint(uint(uint(uint(uint(uint(uint(Math.ceil(_loc2_ / 5)))))))));
         this.setPageTxt();
      }
      
      private function activityClick(param1:MouseEvent) : void
      {
         this.dailymc.gotoAndStop(1);
         this.activitymc.gotoAndStop(2);
         this.curAry = this.gc.allTask.getactTask();
         this.setTaskList(this.curAry);
         var _loc2_:uint = uint(this.curAry.length);
         this.curPage = 1;
         this.allPage = uint(uint(uint(uint(uint(uint(uint(uint(Math.ceil(_loc2_ / 5) > 0 ? uint(Math.ceil(_loc2_ / 5)) : uint(1)))))))));
         this.setPageTxt();
      }
      
      private function awardClick(param1:MouseEvent) : void
      {
         this.analyseAward();
      }
      
      private function prePage(param1:MouseEvent) : void
      {
         if(this.curPage > 1)
         {
            --this.curPage;
         }
         else
         {
            this.curPage = 1;
         }
         this.setTaskListToFirstFrame();
         this.setTaskList(this.curAry);
         this.setPageTxt();
      }
      
      private function nextPage(param1:MouseEvent) : void
      {
         if(this.curPage < this.allPage)
         {
            ++this.curPage;
         }
         else
         {
            this.curPage = this.allPage;
         }
         this.setTaskListToFirstFrame();
         this.setTaskList(this.curAry);
         this.setPageTxt();
      }
      
      private function setTaskList(param1:Array) : void
      {
         var _loc2_:int = 0;
         _loc2_ = 0;
         while(_loc2_ < 5)
         {
            this["t" + (_loc2_ + 1)].visible = true;
            this["t" + (_loc2_ + 1)].removeEventListener(MouseEvent.CLICK,this.selected);
            this["t" + (_loc2_ + 1)].removeIcon();
            _loc2_++;
         }
         _loc2_ = 0;
         while(_loc2_ < 5)
         {
            if(param1[_loc2_ + (this.curPage - 1) * 5])
            {
               this["t" + (_loc2_ + 1)].addEventListener(MouseEvent.CLICK,this.selected);
               this["t" + (_loc2_ + 1)].setTask(param1[_loc2_ + (this.curPage - 1) * 5] as Task);
            }
            else
            {
               this["t" + (_loc2_ + 1)].visible = false;
            }
            _loc2_++;
         }
         if(this.selectId != 0)
         {
            this["t" + this.selectId].dispatchEvent(new MouseEvent(MouseEvent.CLICK));
         }
      }
      
      private function setAwardList() : void
      {
         var _loc1_:* = null;
         var _loc2_:* = 0;
         var _loc3_:int = 0;
         this.alist1.removeImage();
         this.alist2.removeImage();
         this.alist3.removeImage();
         this.alist4.removeImage();
         if(this.selectTask)
         {
            _loc1_ = this.selectTask.getAllAward();
            _loc2_ = uint(_loc1_.length);
            _loc3_ = 0;
            while(_loc3_ < _loc2_)
            {
               if(_loc1_[_loc3_].type == "exp")
               {
                  this["alist" + (_loc3_ + 1)].addImage("rw_exp");
               }
               else if(_loc1_[_loc3_].type == "bs")
               {
                  this["alist" + (_loc3_ + 1)].addImage("rw_bs");
               }
               else if(_loc1_[_loc3_].type == "lh")
               {
                  this["alist" + (_loc3_ + 1)].addImage("rw_lh");
               }
               else if(_loc1_[_loc3_].type == "roomhorse")
               {
                  this["alist" + (_loc3_ + 1)].addImage("rw_roomhorse");
               }
               else
               {
                  this["alist" + (_loc3_ + 1)].addImage(_loc1_[_loc3_].value);
               }
               this["alist" + (_loc3_ + 1)].txtname.text = _loc1_[_loc3_].cname;
               _loc3_++;
            }
         }
      }
      
      private function setTaskListToFirstFrame() : void
      {
         var _loc1_:int = 0;
         while(_loc1_ < 5)
         {
            this["t" + (_loc1_ + 1)].unselected();
            _loc1_++;
         }
      }
      
      private function selected(param1:MouseEvent) : void
      {
         this.getaward.removeEventListener(MouseEvent.CLICK,this.awardClick);
         this.setTaskListToFirstFrame();
         param1.currentTarget.selected();
         this.selectTask = param1.currentTarget.getTask();
         this.selectId = uint(uint(uint(uint(uint(uint(uint(uint(int(String(param1.currentTarget.name).substr(1,1))))))))));
         this.setTxt();
         if(this.selectTask.getHasGetAward())
         {
            this.getaward.gotoAndStop(1);
         }
         else if(this.selectTask.judgeComplete())
         {
            this.getaward.gotoAndStop(2);
            this.getaward.addEventListener(MouseEvent.CLICK,this.awardClick);
         }
         else
         {
            this.getaward.gotoAndStop(1);
         }
         this.setAwardList();
      }
      
      private function setPageTxt() : void
      {
         this.txtpage.text = this.curPage + "/" + this.allPage;
      }
      
      private function setTxt() : void
      {
         if(this.selectTask)
         {
            this.txtinstr.text = this.selectTask.getrwdict();
            this.txtcur.text = this.selectTask.getTaskPro();
         }
      }
      
      public function analyseAward() : void
      {
         var _loc1_:* = 0;
         var _loc2_:* = null;
         var _loc3_:* = null;
         var _loc4_:* = 0;
         if(this.selectTask == null)
         {
            return;
         }
         this.taskAwardAryById();
         if(this.selectTask.rwaward == null)
         {
            throw new Error("奖品为null！");
         }
         var _loc5_:* = "恭喜";
         _loc1_ = uint(this.selectTask.rwaward.length);
         var _loc6_:* = [];
         while(_loc1_-- > 0)
         {
            switch(this.selectTask.rwaward[_loc1_].type)
            {
               case "dj":
               case "zzs":
               case "bs":
                  _loc2_ = this.gc.allEquip.findByName(this.selectTask.rwaward[_loc1_].value);
                  _loc5_ += "您成功领取:" + _loc2_.ename;
                  _loc6_.push(_loc2_);
                  break;
               case "exp":
                  if(this.gc.player1)
                  {
                     _loc3_ = this.gc.player1.findCurrentPet();
                     if(_loc3_ != null)
                     {
                        _loc3_.setCurExper(_loc3_.getCurExper() + int(this.selectTask.rwaward[_loc1_].value));
                     }
                     else
                     {
                        this.gc.player1.setCurExp(this.gc.player1.getCurExp() + int(this.selectTask.rwaward[_loc1_].value));
                     }
                  }
                  if(this.gc.player2)
                  {
                     _loc3_ = this.gc.player1.findCurrentPet();
                     if(_loc3_ != null)
                     {
                        _loc3_.setCurExper(_loc3_.getCurExper() + int(this.selectTask.rwaward[_loc1_].value));
                     }
                     else
                     {
                        this.gc.player2.setCurExp(this.gc.player2.getCurExp() + int(this.selectTask.rwaward[_loc1_].value));
                     }
                  }
                  if(_loc3_)
                  {
                     _loc5_ += "您宠物成功领取:" + this.selectTask.rwaward[_loc1_].value + " 经验";
                  }
                  else
                  {
                     _loc5_ += "您成功领取:" + this.selectTask.rwaward[_loc1_].value + " 经验";
                  }
                  break;
               case "lh":
                  if(this.gc.player1)
                  {
                     this.gc.player1.setLhValue(this.gc.player1.getLhValue() + int(this.selectTask.rwaward[_loc1_].value));
                  }
                  if(this.gc.player2)
                  {
                     this.gc.player2.setLhValue(this.gc.player2.getLhValue() + int(this.selectTask.rwaward[_loc1_].value));
                  }
                  _loc5_ += "您成功领取:" + this.selectTask.rwaward[_loc1_].value + " 灵魂";
                  break;
               case "roomhorse":
                  if(this.gc.player1.roleid > 0)
                  {
                     this.gc.player1.petsAry.push(this.getroomhorsePet());
                  }
                  _loc5_ += "您成功领取炎马";
            }
         }
         if(this.gc.isHideDebug)
         {
            _loc4_ = uint(_loc6_.length);
            while(_loc4_-- > 0)
            {
               if(this.gc.player1.roleid > 0)
               {
                  if(MyEquipObj(_loc6_[_loc4_]).type == "zbwp" || MyEquipObj(_loc6_[_loc4_]).type == "wpqhs")
                  {
                     this.gc.putQhsInBackPack(this.gc.player1,MyEquipObj(_loc6_[_loc4_]).getFillName());
                  }
                  else
                  {
                     this.gc.player1.zblist.push(_loc6_[_loc4_]);
                  }
               }
               if(this.gc.player2.roleid > 0)
               {
                  if(MyEquipObj(_loc6_[_loc4_]).type == "zbwp" || MyEquipObj(_loc6_[_loc4_]).type == "wpqhs")
                  {
                     this.gc.putQhsInBackPack(this.gc.player2,MyEquipObj(_loc6_[_loc4_]).getFillName());
                  }
                  else
                  {
                     this.gc.player2.zblist.push(_loc6_[_loc4_]);
                  }
               }
            }
         }
         this.gc.ts.setTxt(_loc5_);
         this.gc.stage.addChild(this.gc.ts);
         this.selectTask.setHasGetAward(true);
         this.getaward.removeEventListener(MouseEvent.CLICK,this.awardClick);
         this.getaward.gotoAndStop(1);
         this.setTaskList(this.curAry);
         if(this.gc.isHideDebug)
         {
            this.gc.memory.setStorage(this.gc.saveId);
         }
      }
      
      private function taskAwardAryById() : void
      {
         var _loc1_:* = null;
         var _loc2_:uint = uint(this.selectTask.allaward.length);
         var _loc3_:uint = Math.round(Math.random() * (_loc2_ - 1));
         if(this.selectTask.allaward[_loc3_])
         {
            _loc1_ = new Object();
            _loc1_.type = this.selectTask.allaward[_loc3_].type;
            if(this.selectTask.allaward[_loc3_].type == "bs")
            {
               _loc1_.value = this.randomTaskAwardGem(this.selectTask.allaward[_loc3_].value);
            }
            else
            {
               _loc1_.value = this.selectTask.allaward[_loc3_].value;
            }
            _loc1_.cname = this.selectTask.allaward[_loc3_].cname;
            this.selectTask.rwaward.push(_loc1_);
         }
      }
      
      private function randomTaskAwardGem(param1:String) : String
      {
         var _loc11_:* = null;
         var _loc7_:* = [];
         var _loc8_:int = 0;
         while(_loc8_ < param1.length)
         {
            _loc11_ = param1.substr(_loc8_,1);
            _loc7_.push("wpqhs" + _loc11_);
            _loc7_.push("sms" + _loc11_);
            _loc7_.push("mfs" + _loc11_);
            _loc7_.push("gjs" + _loc11_);
            _loc7_.push("fys" + _loc11_);
            _loc8_++;
         }
         var _loc9_:uint = uint(_loc7_.length);
         var _loc10_:uint = Math.round(Math.random() * (_loc9_ - 1));
         return _loc7_[_loc10_];
      }
      
      private function getroomhorsePet() : PetInfo
      {
         var pif:PetInfo = new PetInfo();
         pif.setPetNameAndLevel("roomhorse1",1);
         pif.setperception(8);
         pif.setwarpower(8);
         pif.settechnique(8);
         pif.sethpQuality((700 + Math.round(Math.random() * 500)) * 1.3);
         pif.setmpQuality((550 + Math.round(Math.random() * 440)) * 1.3);
         pif.setatkQuality((1000 + Math.round(Math.random() * 300)) * 1.3);
         pif.setdefQuality((200 + Math.round(Math.random() * 200)) * 1.3);
         pif.setHp(700);
         pif.setMp(800);
         pif.setAtk(50);
         pif.setDef(10);
         pif.setSHp(pif.getHp());
         pif.setSMp(pif.getMp());
         return pif;
      }
   }
}

