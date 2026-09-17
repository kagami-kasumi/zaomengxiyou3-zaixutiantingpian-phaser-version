package {
import flash.display.*;import flash.geom.*;import flash.filesystem.*;
/** Original-origin isolated views of every geometrically offscreen source group. */
public class ViewportCapture {
 public static var rows:Array=[],requests:Object;
 public static function world(world:DisplayObjectContainer,id:String):void{
  if(requests==null){var input:FileStream=new FileStream();input.open(File.applicationDirectory.resolvePath('projection-requests.json'),FileMode.READ);requests=JSON.parse(input.readUTFBytes(input.bytesAvailable));input.close();}
  if(!requests[id])return;
  var flags:Array=[],groups:Array=[],i:int,j:int;
  for(i=0;i<world.numChildren;i++)flags.push(world.getChildAt(i).visible);
  try {for each(i in requests[id]){
   for(j=0;j<world.numChildren;j++)world.getChildAt(j).visible=(i==j&&flags[j]);
   var bitmap:BitmapData=new BitmapData(940,590,true,0);bitmap.draw(world);
   var path:String='viewport/'+id+'-g'+i+'.png',file:File=new File(File.applicationDirectory.nativePath).resolvePath(path);file.parent.createDirectory();
   var stream:FileStream=new FileStream();stream.open(file,FileMode.WRITE);stream.writeBytes(bitmap.encode(bitmap.rect,new PNGEncoderOptions(true)));stream.close();bitmap.dispose();
   groups.push({path:'root/'+i,viewport:{path:path,origin:{x:0,y:0},width:940,height:590}});
  }} finally {for(j=0;j<world.numChildren;j++)world.getChildAt(j).visible=flags[j];}
  rows.push({id:id,groups:groups});
 }
 public static function finish():void{
  var stream:FileStream=new FileStream();stream.open(new File(File.applicationDirectory.nativePath).resolvePath('layers.json'),FileMode.WRITE);
  stream.writeUTFBytes(JSON.stringify({rows:rows}));stream.close();
 }
}}
