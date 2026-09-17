package {
import flash.display.*;import flash.geom.*;import flash.filesystem.*;
public class PrefixCapture {
 public static var rows:Array=[];
 public static function world(world:DisplayObjectContainer,id:String):void{
  if(['rest-4-1-7-7','rest-4-1-7-8','rest-4-1-7-13','aoyi-4-1-7-63'].indexOf(id)<0)return;
  var flags:Array=[],groups:Array=[],i:int,j:int;
  for(i=0;i<world.numChildren;i++)flags.push(world.getChildAt(i).visible);
  try {for(i=0;i<world.numChildren;i++){
   for(j=0;j<world.numChildren;j++)world.getChildAt(j).visible=(j<=i&&flags[j]);
   var b:BitmapData=new BitmapData(940,590,true,0);b.draw(world);var path:String='prefix/'+id+'-'+i+'.png';
   var f:File=new File(File.applicationDirectory.nativePath).resolvePath(path);f.parent.createDirectory();var s:FileStream=new FileStream();s.open(f,FileMode.WRITE);s.writeBytes(b.encode(b.rect,new PNGEncoderOptions(true)));s.close();b.dispose();groups.push({depth:i,path:path});
  }} finally {for(j=0;j<world.numChildren;j++)world.getChildAt(j).visible=flags[j];}
  var prefix:BitmapData=new BitmapData(940,590,true,0),samples:Array=[],last:int=world.numChildren-1;
  try {
   for(j=0;j<world.numChildren;j++)world.getChildAt(j).visible=(j<last&&flags[j]);
   prefix.draw(world);
   for(j=0;j<world.numChildren;j++)world.getChildAt(j).visible=(j==last&&flags[j]);
   for each(var px:int in [255,258,259,262,263]){
    var before:uint=prefix.getPixel32(px,452),solid:BitmapData=new BitmapData(940,590,true,before),seed:uint=solid.getPixel32(px,452);
    solid.draw(world);samples.push({x:px,y:452,before:before,seed:seed,after:solid.getPixel32(px,452)});solid.dispose();
   }
   prefix.draw(world);var splitPath:String='prefix/'+id+'-split.png';
   var file:File=new File(File.applicationDirectory.nativePath).resolvePath(splitPath),stream:FileStream=new FileStream();stream.open(file,FileMode.WRITE);stream.writeBytes(prefix.encode(prefix.rect,new PNGEncoderOptions(true)));stream.close();
  } finally {for(j=0;j<world.numChildren;j++)world.getChildAt(j).visible=flags[j];prefix.dispose();}
  rows.push({id:id,groups:groups,splitPath:splitPath,solidSamples:samples});
 }
 public static function finish():void{var s:FileStream=new FileStream();s.open(new File(File.applicationDirectory.nativePath).resolvePath('layers.json'),FileMode.WRITE);s.writeUTFBytes(JSON.stringify({rows:rows}));s.close();}
}}
