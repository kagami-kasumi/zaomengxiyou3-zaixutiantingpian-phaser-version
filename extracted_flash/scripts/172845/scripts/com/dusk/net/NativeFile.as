package com.dusk.net
{
   import flash.desktop.*;
   import flash.filesystem.*;
   import flash.utils.*;
   
   public class NativeFile
   {
      
      public function NativeFile()
      {
         super();
      }
      
      public static function exists(param1:String) : Boolean
      {
         return File.documentsDirectory.resolvePath(param1).exists;
      }
      
      public static function write(param1:*, param2:String) : Boolean
      {
         var fileStream:FileStream = null;
         fileStream = null;
         var content:* = param1;
         var path:String = param2;
         var file:File = File.documentsDirectory.resolvePath(path);
         fileStream = new FileStream();
         try
         {
            fileStream.open(file,FileMode.WRITE);
            if(content is String)
            {
               fileStream.writeUTFBytes(content);
            }
            else
            {
               fileStream.writeBytes(content);
            }
            fileStream.close();
            return true;
         }
         catch(e:Error)
         {
            fileStream.close();
            return false;
         }
      }
      
      public static function append(param1:*, param2:String) : Boolean
      {
         var fileStream:FileStream = null;
         fileStream = null;
         var content:* = param1;
         var path:String = param2;
         var file:File = File.documentsDirectory.resolvePath(path);
         fileStream = new FileStream();
         try
         {
            fileStream.open(file,FileMode.APPEND);
            if(content is String)
            {
               fileStream.writeUTFBytes(content);
            }
            else
            {
               fileStream.writeBytes(content);
            }
            fileStream.close();
            return true;
         }
         catch(e:Error)
         {
            fileStream.close();
            return false;
         }
      }
      
      public static function read(param1:String, param2:String = "text") : *
      {
         var _loc3_:ByteArray = null;
         var _loc4_:String = null;
         var _loc5_:File = File.documentsDirectory.resolvePath(param1);
         var _loc6_:FileStream = new FileStream();
         _loc6_.open(_loc5_,FileMode.READ);
         if(param2 == "binary")
         {
            _loc3_ = new ByteArray();
            _loc6_.readBytes(_loc3_);
            _loc6_.close();
            return _loc3_;
         }
         if(param2 == "text")
         {
            _loc4_ = _loc6_.readUTFBytes(_loc6_.bytesAvailable);
            _loc6_.close();
            return _loc4_;
         }
         _loc6_.close();
         return null;
      }
      
      public static function createFolder(param1:String) : void
      {
         var _loc2_:File = new File(param1);
         _loc2_.createDirectory();
      }
      
      public static function getAppRoot() : String
      {
         return File.applicationDirectory.nativePath;
      }
      
      public static function getAppFolderFileUrl(param1:String) : String
      {
         var _loc2_:String = File.applicationDirectory.nativePath;
         return _loc2_ + "/" + param1;
      }
      
      public static function move(param1:String, param2:String, param3:Boolean = true) : void
      {
         new File(param1).moveTo(new File(param2),param3);
      }
      
      public static function copy(param1:String, param2:String, param3:Boolean = true) : void
      {
         new File(param1).copyTo(new File(param2),param3);
      }
      
      public static function del(param1:String) : void
      {
         try
         {
            new File(param1).deleteFile();
         }
         catch(e:Error)
         {
            trace(e);
         }
      }
      
      public static function rd(param1:String) : void
      {
         new File(param1).deleteDirectory(true);
      }
      
      public static function start(param1:String, ... rest) : void
      {
         var _loc3_:NativeProcessStartupInfo = new NativeProcessStartupInfo();
         _loc3_.executable = File.documentsDirectory.resolvePath(param1);
         _loc3_.arguments = new Vector.<String>();
         while(Boolean(rest.length))
         {
            (_loc3_.arguments as Vector.<String>).push(rest.shift());
         }
         trace(_loc3_.executable.nativePath);
         var _loc4_:NativeProcess = new NativeProcess();
         _loc4_.start(_loc3_);
      }
      
      public static function getFileDepthInTargetDir(param1:File, param2:File) : int
      {
         if(!param2.isDirectory)
         {
            return -1;
         }
         var _loc3_:int = 1;
         while(_loc3_ <= 100)
         {
            if(param1.parent.nativePath == param2.nativePath)
            {
               return _loc3_;
            }
            _loc3_++;
         }
         return -1;
      }
      
      public static function getAllFilesInFolder(param1:File, param2:int = 999) : Vector.<File>
      {
         var folderTmp:File = null;
         var folderQueue:Vector.<File> = null;
         var fileList:Vector.<File> = null;
         var folder:File = null;
         var depth:int = 0;
         folderQueue = null;
         fileList = null;
         folder = param1;
         depth = param2;
         folderQueue = new Vector.<File>();
         fileList = new Vector.<File>();
         if(!folder.isDirectory)
         {
            return new Vector.<File>();
         }
         folderTmp = new File(folder.nativePath);
         folderQueue.push(folderTmp);
         while(!folderQueue.isEmpty())
         {
            folderTmp = folderQueue.shift();
            if(!(!folderTmp.exists || Boolean(folderTmp.getDirectoryListing().isEmpty())))
            {
               folderTmp.getDirectoryListing().forEach(function(param1:File, param2:*, param3:*):void
               {
                  if(param1.isDirectory)
                  {
                     if(getFileDepthInTargetDir(param1,folder) < depth)
                     {
                        folderQueue.push(param1);
                     }
                  }
                  else
                  {
                     fileList.push(param1);
                  }
               });
            }
         }
         return fileList;
      }
   }
}

