package {
import flash.display.*;import flash.geom.*;import flash.filesystem.*;
/** Bounded colour arithmetic witnesses; no edits to gameplay or source colours. */
public class ColorCapture {
 public static var rows:Array=[];
 private static var selected:Array=['aoyi-4-1-0-0','aoyi-4-1-7-7','sld-1-1-7-13','normal-1-1-7-8','dead-4-1-7-20'];
 private static function save(id:String,b:BitmapData):String{
  var path:String='colors/'+id+'.png',f:File=new File(File.applicationDirectory.nativePath).resolvePath(path);f.parent.createDirectory();
  var s:FileStream=new FileStream();s.open(f,FileMode.WRITE);s.writeBytes(b.encode(b.rect,new PNGEncoderOptions(true)));s.close();return path;
 }
 public static function world(world:DisplayObjectContainer,id:String):void{
  if(selected.indexOf(id)<0)return;
  var flags:Array=[],groups:Array=[],i:int,j:int;
  for(i=0;i<world.numChildren;i++)flags.push(world.getChildAt(i).visible);
  try {for(i=0;i<world.numChildren;i++){
   for(j=0;j<world.numChildren;j++)world.getChildAt(j).visible=(i==j&&flags[j]);
   var images:Array=[];
   for each(var background:uint in [0x00000000,0xff000000,0xffffffff]){
    var bitmap:BitmapData=new BitmapData(940,590,true,background);bitmap.draw(world);
    images.push(save(id+'-g'+i+'-'+background,bitmap));bitmap.dispose();
   }
   groups.push({path:'root/'+i,images:images});
  }} finally {for(j=0;j<world.numChildren;j++)world.getChildAt(j).visible=flags[j];}
  rows.push({id:id,groups:groups});
 }
 public static function finish():void{
  var s:FileStream=new FileStream();s.open(new File(File.applicationDirectory.nativePath).resolvePath('layers.json'),FileMode.WRITE);
  s.writeUTFBytes(JSON.stringify({rows:rows}));s.close();
 }
}}
