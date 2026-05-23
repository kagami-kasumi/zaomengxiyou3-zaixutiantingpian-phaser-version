package export.pack
{
   import base.*;
   import flash.display.Sprite;
   import flash.events.*;
   import flash.geom.*;
   
   public class HeadSprite extends Sprite
   {
      
      public static var HEAD_ROLE_1:uint = 1;
      
      public static var HEAD_ROLE_2:uint = 2;
      
      public static var HEAD_ROLE_3:uint = 3;
      
      public static var HEAD_ROLE_4:uint = 4;
      
      private var bbdc:BaseBitmapDataClip;
      
      private var type:uint;
      
      public function HeadSprite(param1:uint, param2:uint, param3:uint, param4:String = "")
      {
         super();
         this.type = param1;
         this.initBBC(param2,param3,param4);
         this.addEventListener(Event.ENTER_FRAME,this.__enterFrame);
      }
      
      private function initBBC(param1:uint, param2:uint, param3:String = "") : void
      {
         var _loc6_:Array = null;
         var eqArray:Array = null;
         var bmdArray:Array = null;
         var body:Object = null;
         var equip:Object = null;
         var img:* = undefined;
         var clothId:uint = param1;
         var weaponId:uint = param2;
         var txname:String = param3;
         var _loc7_:Array = null;
         var _loc4_:Object = null;
         var _loc5_:Object = null;
         if(this.type == 4)
         {
            if(!(weaponId == 4 || weaponId == 5 || weaponId == 9 || weaponId == 998))
            {
               bmdArray = BaseBitmapDataPool.getBitmapDataArrayByName("ROLE4_SHOVEL_" + clothId);
            }
            else
            {
               bmdArray = BaseBitmapDataPool.getBitmapDataArrayByName("ROLE4_ARROW_" + clothId);
            }
         }
         else if(this.type == 5)
         {
            if(param1 == 115)
            {
               param1 = 18;
            }
            if(param1 == 112)
            {
               param1 = 19;
            }
            if(param1 == 113)
            {
               param1 = 20;
            }
            if(param1 == 114)
            {
               param1 = 21;
            }
            if(param1 == 0)
            {
               bmdArray = BaseBitmapDataPool.loadZm4RoleResources("idle_sword",param1 + 1,param2);
            }
            else if(param2 == 0)
            {
               bmdArray = BaseBitmapDataPool.loadZm4RoleResources("idle_sword",param1,param2 + 1);
            }
            if(param1 == 0 && param2 == 0)
            {
               bmdArray = BaseBitmapDataPool.loadZm4RoleResources("idle_sword",param1 + 1,param2 + 1);
            }
            else
            {
               bmdArray = BaseBitmapDataPool.loadZm4RoleResources("idle_sword",param1,param2);
            }
         }
         else
         {
            bmdArray = BaseBitmapDataPool.getBitmapDataArrayByName("ROLE" + this.type + "_" + clothId);
         }
         eqArray = BaseBitmapDataPool.getBitmapDataArrayByName("ROLE" + this.type + "_EQUIP_" + weaponId);
         if(!bmdArray)
         {
            throw new Error("HeadSprite--type:" + this.type + ",clothId:" + clothId + ",weaponId:" + weaponId + " Error!");
         }
         body = {
            "name":"body",
            "source":bmdArray
         };
         equip = {
            "name":"equip",
            "source":eqArray
         };
         if(this.type == 3)
         {
            this.bbdc = new BaseBitmapDataClip([body,equip],300,200,new Point(0,0));
         }
         else if(this.type == 5)
         {
            this.bbdc = new BaseBitmapDataClip([body],290,290,new Point(0,0));
         }
         else
         {
            this.bbdc = new BaseBitmapDataClip([body,equip],200,200,new Point(0,0));
         }
         if(this.type == 2)
         {
            this.bbdc.setOffsetXY(0,0);
         }
         else if(this.type == 5)
         {
            this.bbdc.setOffsetXY(6,5);
         }
         else if(this.type == 3)
         {
            this.bbdc.setOffsetXY(-20,0);
         }
         else
         {
            this.bbdc.setOffsetXY(-10,-15);
         }
         if(this.type == 5)
         {
            this.bbdc.setFrameStopCount([[3,3,4,3,3,4],[5,5]]);
            this.bbdc.setFrameCount([42,8]);
         }
         else
         {
            this.bbdc.setFrameStopCount([[2,2,2,3,2,4],[5,5]]);
            this.bbdc.setFrameCount([36,8]);
         }
         this.addChild(this.bbdc);
         this.bbdc.setState("wait");
         try
         {
            if(this.getChildByName("Role_Title") != null)
            {
               this.removeChild(this.getChildByName("Role_Title"));
            }
            if(txname != "")
            {
               img = AUtils.getImageObj("role_title_" + txname);
               img.x = -38;
               img.y = -66;
               img.name = "Role_Title";
               this.addChild(img);
            }
            return;
         }
         catch(e:*)
         {
            return;
         }
      }
      
      public function refreshEquip(param1:uint, param2:uint, param3:String = "") : void
      {
         this.bbdc.destroy();
         this.initBBC(param1,param2,param3);
      }
      
      private function __enterFrame(param1:Event) : void
      {
         if(this.bbdc)
         {
            this.bbdc.step();
         }
      }
      
      public function destroy() : void
      {
         this.bbdc.destroy();
         this.removeEventListener(Event.ENTER_FRAME,this.__enterFrame);
      }
   }
}

