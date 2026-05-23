package base
{
   import flash.display.*;
   import flash.geom.*;
   import flash.utils.*;
   import manager.*;
   
   public class BaseBitmapDataPool
   {
      
      public static var infoDict:Dictionary = new Dictionary();
      
      public static var mcToBitmapDataArrayDict:Dictionary = new Dictionary();
      
      public static var Zm4ResourceDict:Dictionary = new Dictionary();
      
      public function BaseBitmapDataPool()
      {
         super();
      }
      
      public static function getBitmapDataArrayByName(name:String) : Array
      {
         if(!hasRegisteredData(name))
         {
            return registerData(name);
         }
         return infoDict[name];
      }
      
      public static function registerData(name:String) : Array
      {
         var data:Object = null;
         var dataArray:Array = null;
         var bitmapData:BitmapData = null;
         var mirroredBitmapData:BitmapData = null;
         if(hasRegisteredData(name))
         {
            return null;
         }
         try
         {
            data = AUtils.getNewObj(name);
         }
         catch(e:*)
         {
            return null;
         }
         if(data is BitmapData)
         {
            bitmapData = data as BitmapData;
            mirroredBitmapData = new BitmapData(bitmapData.width,bitmapData.height,true,0);
            mirroredBitmapData.draw(bitmapData,new Matrix(-1,0,0,1,bitmapData.width,0));
            dataArray = [bitmapData,mirroredBitmapData];
         }
         else
         {
            if(!(data is MovieClip))
            {
               return null;
            }
            dataArray = analysisMcToBitmapDataArrayByString(data as MovieClip);
         }
         infoDict[name] = dataArray;
         return dataArray;
      }
      
      private static function analysisMcToBitmapDataArrayByString(mc:MovieClip) : Array
      {
         var child:MovieClip = null;
         var childLen:uint = 0;
         var j:int = 0;
         var rect:Rectangle = null;
         var currentLeftBitmapData:BitmapData = null;
         var currentRightBitmapData:BitmapData = null;
         var leftTemp:Array = [];
         var rightTemp:Array = [];
         mc.gotoAndStop(1);
         var totalFrames:uint = uint(mc.totalFrames);
         var i:int = 1;
         while(i <= totalFrames)
         {
            leftTemp[i - 1] = [];
            rightTemp[i - 1] = [];
            mc.gotoAndStop(i);
            child = mc.getChildAt(0) as MovieClip;
            if(child)
            {
               childLen = uint(child.totalFrames);
               j = 1;
               while(j <= childLen)
               {
                  child.gotoAndStop(j);
                  rect = child.getBounds(mc);
                  currentLeftBitmapData = new BitmapData(mc.width,mc.height,true,16777215);
                  currentLeftBitmapData.draw(child,new Matrix(1,0,0,1,-rect.x + child.x,-rect.y + child.y),null,null,null,true);
                  leftTemp[i - 1][j - 1] = currentLeftBitmapData;
                  currentRightBitmapData = new BitmapData(mc.width,mc.height,true,16777215);
                  currentRightBitmapData.draw(child,new Matrix(-1,0,0,1,rect.x + rect.width - child.x,-rect.y + child.y),null,null,null,true);
                  rightTemp[i - 1][j - 1] = currentRightBitmapData;
                  j++;
               }
            }
            i++;
         }
         return [leftTemp,rightTemp];
      }
      
      public static function clearAllZm4RoleResources() : void
      {
         var j:int = 0;
         var leftBitmapData:BitmapData = null;
         var rightBitmapData:BitmapData = null;
         var i:int = 0;
         while(i < analysisResourceMC(mc,clothId,weaponId)[0].length)
         {
            j = 0;
            while(j < analysisResourceMC(mc,clothId,weaponId)[0].length)
            {
               leftBitmapData = analysisResourceMC(mc,clothId,weaponId)[0][i][j] as BitmapData;
               if(leftBitmapData)
               {
                  leftBitmapData.dispose();
                  analysisResourceMC(mc,clothId,weaponId)[0][i][j] = null;
               }
               rightBitmapData = analysisResourceMC(mc,clothId,weaponId)[1][i][j] as BitmapData;
               if(rightBitmapData)
               {
                  rightBitmapData.dispose();
                  analysisResourceMC(mc,clothId,weaponId)[1][i][j] = null;
               }
               j++;
            }
            i++;
         }
      }
      
      public static function loadZm4RoleResources(resouceName:String, clothId:int = 0, weaponId:int = 0) : Array
      {
         var register:Array = null;
         if(!hasRegisteredZm4Data(resouceName,clothId,weaponId))
         {
            register = buildZm4RoleResources(resouceName,clothId,weaponId);
            if(register)
            {
               return register;
            }
            return null;
         }
         return Zm4ResourceDict[resouceName][clothId][weaponId];
      }
      
      public static function buildZm4RoleResources(resouceName:String, clothId:int = 0, weaponId:int = 0) : Array
      {
         var mc:* = undefined;
         var arr2:* = null;
         if(hasRegisteredZm4Data(resouceName,clothId,weaponId))
         {
            return null;
         }
         mc = AUtils.getNewObj(resouceName);
         arr2 = analysisResourceMC(mc,clothId,weaponId);
         if(Zm4ResourceDict[resouceName] == undefined)
         {
            Zm4ResourceDict[resouceName] = new Dictionary();
         }
         if(Zm4ResourceDict[resouceName][clothId] == undefined)
         {
            Zm4ResourceDict[resouceName][clothId] = new Dictionary();
         }
         Zm4ResourceDict[resouceName][clothId][weaponId] = arr2;
         return arr2;
      }
      
      public static function analysisResourceMC(mc:MovieClip, clothId:int = 0, weaponId:int = 0) : Array
      {
         var i:int = 0;
         var child:* = null;
         var childLen:* = 0;
         var j:int = 0;
         var currentLeftBitmapData:* = null;
         var currentRightBitmapData:* = null;
         var rect:* = null;
         var returnArr:* = [];
         mc.gotoAndStop(1);
         var totalFrames:uint = uint(mc.totalFrames);
         var leftTemp:* = [];
         var rightTemp:* = [];
         var fashionYF:int = clothId;
         var fashionWQ:int = weaponId;
         i = 1;
         while(i <= totalFrames)
         {
            leftTemp[i - 1] = [];
            rightTemp[i - 1] = [];
            mc.gotoAndStop(i);
            child = mc.getChildAt(0) as MovieClip;
            if(child)
            {
               changeFashion(child,fashionYF,"fashion_yf");
               changeFashion(child,fashionWQ,"fashion_wq");
               childLen = uint(child.totalFrames);
               j = 1;
               while(j <= childLen)
               {
                  child.gotoAndStop(j);
                  currentLeftBitmapData = new BitmapData(mc.width,mc.height,true,16777215);
                  currentRightBitmapData = new BitmapData(mc.width,mc.height,true,16777215);
                  rect = child.getBounds(mc);
                  currentLeftBitmapData.draw(child,new Matrix(1,0,0,1,-rect.x + child.x,-rect.y + child.y),null,null,null,true);
                  leftTemp[i - 1][j - 1] = currentLeftBitmapData;
                  currentRightBitmapData.draw(child,new Matrix(-1,0,0,1,rect.x + rect.width - child.x,-rect.y + child.y),null,null,null,true);
                  rightTemp[i - 1][j - 1] = currentRightBitmapData;
                  j++;
               }
            }
            i++;
         }
         returnArr.push(leftTemp,rightTemp);
         return returnArr;
      }
      
      public static function changeFashion(m:MovieClip, frame:int, typeS:String) : void
      {
         var i:int = 0;
         var mc:* = null;
         var type:* = null;
         i = 0;
         while(i < m.numChildren)
         {
            mc = m.getChildAt(i) as MovieClip;
            if(mc)
            {
               type = getQualifiedClassName(mc);
               if(type.indexOf(typeS) > -1)
               {
                  mc.gotoAndStop(frame);
               }
            }
            i++;
         }
      }
      
      public static function hasRegisteredData(str:String) : Boolean
      {
         return infoDict[str] != undefined && infoDict[str] != null;
      }
      
      public static function hasRegisteredZm4Data(str:String, clothId:int, weaponId:int) : Boolean
      {
         return Zm4ResourceDict[str] != undefined && Zm4ResourceDict[str] != null && Zm4ResourceDict[str][clothId] != null && Zm4ResourceDict[str][clothId][weaponId] != null;
      }
      
      public static function removeData(str:String) : void
      {
         var key:* = undefined;
         var i:int = 0;
         var item:* = undefined;
         var arr:Array = infoDict[str] as Array;
         if(arr)
         {
            i = 0;
            while(i < arr.length)
            {
               item = arr[i];
               if(item is BitmapData)
               {
                  item.dispose();
               }
               else if(item is Array)
               {
                  (item as Array).length = 0;
               }
               i++;
            }
            arr.length = 0;
         }
         delete infoDict[str];
         trace("=========infoDict==========");
         for(key in infoDict)
         {
            trace("key:" + key);
         }
      }
      
      public static function removeZm4data(d:int, e:int, f:int) : void
      {
         var key:* = undefined;
         var arr:Array = Zm4ResourceDict as Array;
         if(arr)
         {
            i = 0;
            while(i < arr.length)
            {
               if(arr[i] is BitmapData)
               {
                  bmd = arr[i] as BitmapData;
                  bmd.dispose();
                  bmd = null;
               }
               else if(arr[i] is Array)
               {
                  (arr[i] as Array).length = 0;
               }
               ++i;
            }
         }
         for(key in Zm4ResourceDict)
         {
            delete Zm4ResourceDict[key];
         }
      }
      
      public static function removeZm3data() : void
      {
         var arr:Array = infoDict as Array;
         if(arr)
         {
            i = 0;
            while(i < arr.length)
            {
               if(arr[i] is BitmapData)
               {
                  bmd = arr[i] as BitmapData;
                  bmd.dispose();
                  bmd = null;
               }
               else if(arr[i] is Array)
               {
                  (arr[i] as Array).length = 0;
               }
               ++i;
            }
         }
         infoDict = null;
         infoDict = new Dictionary();
      }
      
      public static function removeScoketOtherHeroData() : void
      {
         var key:* = undefined;
         var _loc5_:int = 0;
         var _loc6_:* = undefined;
         var temp:* = undefined;
         var keyTemp:* = [];
         var _loc2_:int = 0;
         var _loc3_:* = infoDict;
         for(key in infoDict)
         {
            if(key.indexOf("ROLE1_") != -1 || key.indexOf("ROLE2_") != -1 || key.indexOf("ROLE3_") != -1 || key.indexOf("ROLE4_") != -1 || key.indexOf("Magic") != -1)
            {
               keyTemp.push(key);
            }
         }
         _loc5_ = 0;
         _loc6_ = keyTemp;
         for each(temp in keyTemp)
         {
            removeData(temp);
         }
         keyTemp.length = 0;
      }
   }
}

