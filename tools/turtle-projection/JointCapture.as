package {
import flash.display.*;import flash.geom.*;import flash.filesystem.*;import flash.utils.*;
/** Observe only adjacent Aoyi/SLD source followers; never capture the world as an asset. */
public class JointCapture {
 public static var rows:Array=[];
 public static function world(world:DisplayObjectContainer,id:String):void{
  var flags:Array=[],pairs:Array=[],i:int,j:int;
  for(i=0;i<world.numChildren;i++)flags.push(world.getChildAt(i).visible);
  try {for(i=0;i+1<world.numChildren;i++){
   var a:DisplayObjectContainer=world.getChildAt(i) as DisplayObjectContainer,b:DisplayObjectContainer=world.getChildAt(i+1) as DisplayObjectContainer;
   if(!a||!b||a.numChildren!=1||b.numChildren!=1)continue;
   if(getQualifiedClassName(a).indexOf('FollowBaseObjectBullet')<0||getQualifiedClassName(b).indexOf('FollowBaseObjectBullet')<0)continue;
   if(getQualifiedClassName(a.getChildAt(0))!='AoyiBuff'||getQualifiedClassName(b.getChildAt(0))!='PetTurtle1Bullet2')continue;
   for(j=0;j<world.numChildren;j++)world.getChildAt(j).visible=((j==i||j==i+1)&&flags[j]);
   var bounds:Rectangle=a.getBounds(world).union(b.getBounds(world));
   pairs.push({path:'joint/'+i+'/'+(i+1),depth:i,sourcePaths:['root/'+i,'root/'+(i+1)],
    primary:RasterCapture.capture(world,new Matrix(),bounds,id+'-pair'+i,32),expanded:RasterCapture.capture(world,new Matrix(),bounds,id+'-pair'+i,64)});
  }} finally {for(j=0;j<world.numChildren;j++)world.getChildAt(j).visible=flags[j];}
  if(pairs.length)rows.push({id:id,groups:pairs});
 }
 public static function finish():void{var s:FileStream=new FileStream();s.open(new File(File.applicationDirectory.nativePath).resolvePath('layers.json'),FileMode.WRITE);s.writeUTFBytes(JSON.stringify({rows:rows}));s.close();}
}}
