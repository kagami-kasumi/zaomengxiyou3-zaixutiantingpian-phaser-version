package {
import flash.display.*;import flash.geom.*;import flash.filesystem.*;import flash.utils.*;
/** Independent unfiltered owner observations for raw component reconstruction. */
public class ComponentCapture {
 public static var rows:Array=[];
 public static function world(world:DisplayObjectContainer,id:String):void{
  var flags:Array=[],groups:Array=[],i:int,j:int;
  for(i=0;i<world.numChildren;i++)flags.push(world.getChildAt(i).visible);
  try {for(i=0;i<world.numChildren;i++){
   var child:DisplayObject=world.getChildAt(i),type:String=getQualifiedClassName(child);
   if(type.indexOf('PetTurtle')<0&&type.indexOf('BaseHero')<0)continue;
   for(j=0;j<world.numChildren;j++)world.getChildAt(j).visible=(i==j&&flags[j]);
   var filters:Array=child.filters;child.filters=[];
   try {
    groups.push({path:'root/'+i,type:type,parentFiltersApplied:false,
     primary:RasterCapture.capture(world,new Matrix(),child.getBounds(world),id+'-g'+i,32),
     expanded:RasterCapture.capture(world,new Matrix(),child.getBounds(world),id+'-g'+i,64)});
   } finally {child.filters=filters;}
  }} finally {for(j=0;j<world.numChildren;j++)world.getChildAt(j).visible=flags[j];}
  rows.push({id:id,groups:groups});
 }
 public static function finish():void{
  var stream:FileStream=new FileStream();stream.open(new File(File.applicationDirectory.nativePath).resolvePath('layers.json'),FileMode.WRITE);
  stream.writeUTFBytes(JSON.stringify({rows:rows}));stream.close();
 }
}}
