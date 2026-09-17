package {
import flash.display.*;import flash.geom.*;import flash.filesystem.*;import flash.utils.*;
/** Preserve source filter/mask groups, isolate only unfiltered paint siblings. */
public class PaintCapture {
 public static var rows:Array=[],requests:Object;
 public static function world(world:DisplayObjectContainer,id:String):void{
  if(requests==null){var s:FileStream=new FileStream();s.open(File.applicationDirectory.resolvePath('paint-requests.json'),FileMode.READ);requests=JSON.parse(s.readUTFBytes(s.bytesAvailable));s.close();}
  if(!requests[id])return;
  var groups:Array=[];
  for(var parent:String in requests[id]){
   var parts:Array=[];
   for each(var path:String in requests[id][parent]){
    var changed:Array=[],values:Array=[],node:DisplayObjectContainer=world,indices:Array=path.split('/');
    try {
     for(var k:int=1;k<indices.length;k++){
      var selected:int=int(indices[k]);
      for(var j:int=0;j<node.numChildren;j++){
       var sibling:DisplayObject=node.getChildAt(j);changed.push(sibling);values.push(sibling.visible);
       sibling.visible=(j==selected&&sibling.visible);
      }
      var leaf:DisplayObject=node.getChildAt(selected);
      if(k<indices.length-1)node=leaf as DisplayObjectContainer;
     }
     parts.push({path:path,type:getQualifiedClassName(leaf),
      primary:RasterCapture.capture(world,new Matrix(),leaf.getBounds(world),id+'-'+path.replace(/\//g,'-'),32),
      expanded:RasterCapture.capture(world,new Matrix(),leaf.getBounds(world),id+'-'+path.replace(/\//g,'-'),64)});
    } finally {for(j=changed.length-1;j>=0;j--)changed[j].visible=values[j];}
   }
   groups.push({path:parent,paintParts:parts});
  }
  rows.push({id:id,groups:groups});
 }
 public static function finish():void{
  var stream:FileStream=new FileStream();stream.open(new File(File.applicationDirectory.nativePath).resolvePath('layers.json'),FileMode.WRITE);
  stream.writeUTFBytes(JSON.stringify({rows:rows}));stream.close();
 }
}}
