package {
import flash.display.*;import flash.geom.*;import flash.filesystem.*;import flash.utils.*;
/** Observe native integer blend response; no geometry or oracle rendering code. */
public class TransferCapture {
 public static var rows:Array=[],requests:Object;
 public static function world(world:DisplayObjectContainer,id:String):void{
  if(requests==null){var input:FileStream=new FileStream();input.open(File.applicationDirectory.resolvePath('transfer-requests.json'),FileMode.READ);requests=JSON.parse(input.readUTFBytes(input.bytesAvailable)).requests;input.close();}
  if(!requests[id])return;
  var flags:Array=[],i:int,j:int;
  for(i=0;i<world.numChildren;i++)flags.push(world.getChildAt(i).visible);
  try {for each(var spec:Object in requests[id]){
   for(j=0;j<world.numChildren;j++)world.getChildAt(j).visible=(j==spec.depth&&flags[j]);
   var bitmap:BitmapData=new BitmapData(940,590,true,0),rectangle:Rectangle=new Rectangle(spec.origin.x,spec.origin.y,spec.width,spec.height);
   var opaque:ByteArray=new ByteArray(),alpha:ByteArray=new ByteArray();
   for(var value:int=0;value<256;value++){
    bitmap.fillRect(bitmap.rect,uint(0xff000000|(value<<16)|(value<<8)|value));bitmap.draw(world);
    opaque.writeBytes(bitmap.getPixels(rectangle));
    bitmap.fillRect(bitmap.rect,uint(value<<24));bitmap.draw(world);
    var pixels:ByteArray=bitmap.getPixels(rectangle);pixels.position=0;
    while(pixels.bytesAvailable){alpha.writeByte(pixels.readUnsignedByte());pixels.position+=3;}
   }
   opaque.compress();alpha.compress();var prefix:String='transfer/'+spec.key;
   save(prefix+'-rgb.z',opaque);save(prefix+'-alpha.z',alpha);bitmap.dispose();
   rows.push({key:spec.key,id:id,path:'root/'+spec.depth,origin:spec.origin,width:spec.width,height:spec.height,rgb:prefix+'-rgb.z',alpha:prefix+'-alpha.z',samples:256});
  }} finally {for(j=0;j<world.numChildren;j++)world.getChildAt(j).visible=flags[j];}
 }
 private static function save(path:String,bytes:ByteArray):void{
  var f:File=new File(File.applicationDirectory.nativePath).resolvePath(path);f.parent.createDirectory();var s:FileStream=new FileStream();s.open(f,FileMode.WRITE);s.writeBytes(bytes);s.close();
 }
 public static function finish():void{
  var s:FileStream=new FileStream();s.open(new File(File.applicationDirectory.nativePath).resolvePath('layers.json'),FileMode.WRITE);s.writeUTFBytes(JSON.stringify({rows:rows}));s.close();
 }
}}
