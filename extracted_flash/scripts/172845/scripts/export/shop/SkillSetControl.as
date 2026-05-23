package export.shop
{
   import config.*;
   import flash.display.*;
   import flash.events.Event;
   import flash.events.MouseEvent;
   import user.User;
   
   public class SkillSetControl extends Sprite
   {
      
      private var gc:Config;
      
      private var tag:Boolean = true;
      
      private var player:User;
      
      private var sdyskill:String = "";
      
      private var needLh:uint;
      
      private var skilllev:uint;
      
      public var x_btn:SimpleButton;
      
      public var sourcemc:Sprite;
      
      public var Ymc:MovieClip;
      
      public var Umc:MovieClip;
      
      public var Imc:MovieClip;
      
      public var Omc:MovieClip;
      
      public var Lmc:MovieClip;
      
      private var ox:Number;
      
      private var oy:Number;
      
      private var imgSprite:Sprite;
      
      private var newObj:Object;
      
      private var oldObj:Object;
      
      public function SkillSetControl(param1:User, param2:Array, param3:uint = 0)
      {
         this.newObj = {};
         this.oldObj = {};
         super();
         this.gc = Config.getInstance();
         this.player = param1;
         this.sdyskill = param2[0];
         this.needLh = param3;
         if(param2[1] != undefined)
         {
            this.skilllev = param2[1];
         }
         else
         {
            this.skilllev = 1;
         }
         this.imgSprite = new Sprite();
         this.addChild(this.imgSprite);
         this.newObj.skillName = this.sdyskill;
         this.newObj.needLh = this.needLh;
         this.newObj.slev = this.skilllev;
         this.addEventListener("addedToStage",this.added,false,0,true);
         this.addEventListener("removedFromStage",this.removed,false,0,true);
      }
      
      private function added(param1:Event) : void
      {
         var _loc2_:* = undefined;
         if(this.tag)
         {
            this.tag = false;
            this.initHadStudySkill();
            if(this.sdyskill != "")
            {
               _loc2_ = AUtils.getImageObj("skillicon_" + this.sdyskill);
               this.imgSprite.name = "imgSprite";
               this.imgSprite.addChild(_loc2_);
               this.imgSprite.x = this.sourcemc.x + 5;
               this.imgSprite.y = this.sourcemc.y + 5;
               this.imgSprite.addChild(AUtils.getNewObj("highlight"));
            }
            this.x_btn.addEventListener("click",this.back);
            this.imgSprite.addEventListener("mouseDown",this.down);
            this.imgSprite.addEventListener("mouseUp",this.up);
         }
      }
      
      private function initHadStudySkill() : void
      {
         var _loc1_:* = undefined;
         var _loc2_:* = null;
         var _loc3_:* = null;
         if(this.player.getControlPlayer() == 0)
         {
            this.Ymc.gotoAndStop(1);
            this.Umc.gotoAndStop(1);
            this.Imc.gotoAndStop(1);
            this.Omc.gotoAndStop(1);
            this.Lmc.gotoAndStop(1);
         }
         else
         {
            this.Ymc.gotoAndStop(2);
            this.Umc.gotoAndStop(2);
            this.Imc.gotoAndStop(2);
            this.Omc.gotoAndStop(2);
            this.Lmc.gotoAndStop(2);
         }
         var _loc4_:uint = uint(Math.min(this.player.skillbykey.length,5));
         var _loc5_:String = "";
         while(_loc4_-- > 0)
         {
            _loc1_ = AUtils.getImageObj("skillicon_" + this.player.skillbykey[_loc4_].skillName);
            _loc2_ = new Sprite();
            _loc2_.name = "initsprite" + this.player.skillbykey[_loc4_].keys;
            _loc2_.addChild(_loc1_);
            if(this.player.controlPlayer == 0)
            {
               _loc5_ = this.player.skillbykey[_loc4_].keys;
            }
            else
            {
               _loc5_ = this.player.skillbykey[_loc4_].keys;
               if(_loc5_ == "8")
               {
                  _loc5_ = "Y";
               }
               else if(_loc5_ == "4")
               {
                  _loc5_ = "U";
               }
               else if(_loc5_ == "5")
               {
                  _loc5_ = "I";
               }
               else if(_loc5_ == "6")
               {
                  _loc5_ = "O";
               }
               else if(_loc5_ == "3")
               {
                  _loc5_ = "L";
               }
            }
            _loc2_.x = this[_loc5_ + "mc"].x + 5;
            _loc2_.y = this[_loc5_ + "mc"].y + 5;
            this.addChild(_loc2_);
            if(this.getChildIndex(this.imgSprite) < this.getChildIndex(_loc2_))
            {
               this.swapChildren(this.imgSprite,_loc2_);
            }
            _loc3_ = new Sprite();
            _loc3_.addChild(AUtils.getImageObj("Skill_" + this.player.skillbykey[_loc4_].keys));
            _loc3_.x = Number(_loc2_.width) / 2 + 12;
            _loc3_.y = Number(_loc2_.height) / 2 + 12;
            _loc2_.addChild(_loc3_);
         }
      }
      
      private function down(param1:MouseEvent) : void
      {
         this.imgSprite.startDrag();
         this.ox = this.imgSprite.x;
         this.oy = this.imgSprite.y;
      }
      
      private function up(param1:MouseEvent) : void
      {
         var _loc2_:* = null;
         this.imgSprite.stopDrag();
         if(this.imgSprite)
         {
            if(this.imgSprite.hitTestObject(this.Ymc))
            {
               this.imgSprite.x = this.Ymc.x + 5;
               this.imgSprite.y = this.Ymc.y + 5;
               if(this.player.controlPlayer == 0)
               {
                  this.newObj.keys = "Y";
                  this.oldObj = this.player.returnSkillObjBySkillKey("Y");
               }
               else
               {
                  this.newObj.keys = "8";
                  this.oldObj = this.player.returnSkillObjBySkillKey("8");
               }
            }
            else if(this.imgSprite.hitTestObject(this.Umc))
            {
               this.imgSprite.x = this.Umc.x + 5;
               this.imgSprite.y = this.Umc.y + 5;
               if(this.player.controlPlayer == 0)
               {
                  this.newObj.keys = "U";
                  this.oldObj = this.player.returnSkillObjBySkillKey("U");
               }
               else
               {
                  this.newObj.keys = "4";
                  this.oldObj = this.player.returnSkillObjBySkillKey("4");
               }
            }
            else if(this.imgSprite.hitTestObject(this.Imc))
            {
               this.imgSprite.x = this.Imc.x + 5;
               this.imgSprite.y = this.Imc.y + 5;
               if(this.player.controlPlayer == 0)
               {
                  this.newObj.keys = "I";
                  this.oldObj = this.player.returnSkillObjBySkillKey("I");
               }
               else
               {
                  this.newObj.keys = "5";
                  this.oldObj = this.player.returnSkillObjBySkillKey("5");
               }
            }
            else if(this.imgSprite.hitTestObject(this.Omc))
            {
               this.imgSprite.x = this.Omc.x + 5;
               this.imgSprite.y = this.Omc.y + 5;
               if(this.player.controlPlayer == 0)
               {
                  this.newObj.keys = "O";
                  this.oldObj = this.player.returnSkillObjBySkillKey("O");
               }
               else
               {
                  this.newObj.keys = "6";
                  this.oldObj = this.player.returnSkillObjBySkillKey("6");
               }
            }
            else if(this.imgSprite.hitTestObject(this.Lmc))
            {
               this.imgSprite.x = this.Lmc.x + 5;
               this.imgSprite.y = this.Lmc.y + 5;
               if(this.player.controlPlayer == 0)
               {
                  this.newObj.keys = "L";
                  this.oldObj = this.player.returnSkillObjBySkillKey("L");
               }
               else
               {
                  this.newObj.keys = "3";
                  this.oldObj = this.player.returnSkillObjBySkillKey("3");
               }
            }
            else
            {
               this.imgSprite.x = this.ox;
               this.imgSprite.y = this.oy;
            }
         }
         if(this.newObj.keys != undefined)
         {
            _loc2_ = this.imgSprite.getChildByName("ShowSkillKey") as Sprite;
            if(_loc2_)
            {
               this.imgSprite.removeChild(_loc2_);
            }
            _loc2_ = null;
            _loc2_ = new Sprite();
            _loc2_.addChild(AUtils.getImageObj("Skill_" + this.newObj.keys));
            _loc2_.x = Number(this.imgSprite.width) / 2 + 8;
            _loc2_.y = Number(this.imgSprite.height) / 2 + 8;
            _loc2_.name = "ShowSkillKey";
            this.imgSprite.addChild(_loc2_);
         }
      }
      
      private function removed(param1:Event) : void
      {
         this.x_btn.removeEventListener("click",this.back);
         this.imgSprite.removeEventListener("mouseDown",this.down);
         this.imgSprite.removeEventListener("mouseUp",this.up);
      }
      
      private function replaceSkillButton(param1:Object, param2:Object = null) : void
      {
         var _loc3_:uint = 0;
         if(param2 != null)
         {
            _loc3_ = uint(this.player.skillbykey.indexOf(param2));
            this.player.setSkillLevelInTheAllSkillAry(param2.skillName,this.player.returnSkillIsStudy(param2.skillName));
            if(_loc3_ != -1)
            {
               this.player.skillbykey.push(this.player.skillbykey[_loc3_]);
               this.player.skillbykey.splice(_loc3_,1);
            }
         }
         this.player.skillbykey.unshift(param1);
         trace(this.player.skillbykey);
      }
      
      private function back(param1:MouseEvent) : void
      {
         if(this.newObj.keys != undefined)
         {
            if(this.getChildByName("initsprite" + this.newObj.keys))
            {
               this.removeChild(this.getChildByName("initsprite" + this.newObj.keys));
            }
            this.replaceSkillButton(this.newObj,this.oldObj);
         }
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
      }
   }
}

