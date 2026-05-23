package FileHandler
{
   import flash.desktop.*;
   import flash.filesystem.*;
   
   public class fileHandler
   {
      
      public function fileHandler()
      {
         super();
      }
      
      public static function write(param1:*, param2:String) : void
      {
         var _loc4_:* = undefined;
         var _loc3_:File = File.documentsDirectory.resolvePath(param2);
         _loc4_ = new FileStream();
         _loc4_.open(_loc3_,FileMode.WRITE);
         if(param1 is String)
         {
            _loc4_.writeUTFBytes(param1);
         }
         else
         {
            _loc4_.writeBytes(param1);
         }
         _loc4_.close();
      }
      
      public static function append(param1:*, param2:String) : void
      {
         var _loc4_:* = undefined;
         var _loc3_:* = File.documentsDirectory.resolvePath(param2);
         _loc4_ = new FileStream();
         _loc4_.open(_loc3_,FileMode.APPEND);
         if(param1 is String)
         {
            _loc4_.writeUTFBytes(param1);
         }
         else
         {
            _loc4_.writeBytes(param1);
         }
         _loc4_.close();
      }
      
      public static function read(param1:String) : String
      {
         var _loc2_:* = File.documentsDirectory.resolvePath(param1);
         var _loc3_:* = new FileStream();
         _loc3_.open(_loc2_,FileMode.READ);
         var _loc4_:String = String(_loc3_.readUTFBytes(_loc3_.bytesAvailable));
         _loc3_.close();
         return _loc4_;
      }
      
      public static function createFloder(param1:String) : void
      {
         var _loc2_:* = null;
         _loc2_ = new File(param1);
         _loc2_.createDirectory();
      }
      
      public static function getAppFloderFileUrl(param1:String) : String
      {
         var _loc2_:String = String(File.applicationDirectory.nativePath);
         return _loc2_ + "/" + param1;
      }
      
      public static function del(param1:String) : void
      {
         new File(param1).deleteFile();
      }
      
      public static function rd(param1:String) : void
      {
         new File(param1).deleteDirectory(true);
      }
      
      public static function move(param1:String, param2:Boolean = false) : void
      {
         new File(param1).moveTo(param1,param2);
      }
      
      public static function start(param1:String, param2:String) : void
      {
         var _loc4_:* = undefined;
         var _loc5_:* = undefined;
         _loc4_ = new NativeProcessStartupInfo();
         _loc4_.executable = File.documentsDirectory.resolvePath(param1);
         _loc4_.arguments = new Vector.<String>();
         _loc4_.arguments.push(param2);
         _loc5_ = new NativeProcess();
         _loc5_.start(_loc4_);
      }
   }
}

