package {
import flash.display.*;import flash.geom.*;import flash.filesystem.*;import flash.utils.*;
/** Observes pixels only. Never advances a clip or edits source geometry. */
public class RasterCapture {
 public static var rows:Array=[];
 private static function rect(r:Rectangle):Object{return {x:r.x,y:r.y,width:r.width,height:r.height};}
 private static function save(id:String,b:BitmapData):String{
  var path:String='layers/'+id+'.png',f:File=new File(File.applicationDirectory.nativePath).resolvePath(path);f.parent.createDirectory();
  var stream:FileStream=new FileStream();stream.open(f,FileMode.WRITE);
  stream.writeBytes(b.encode(b.rect,new PNGEncoderOptions(true)));stream.close();return path;
 }
 public static function capture(d:DisplayObject,m:Matrix,bounds:Rectangle,id:String,pad:int):Object{
  // Always include the original viewport; expand around the transformed object.
  var left:int=0,top:int=0,right:int=940,bottom:int=590;
  if(bounds.width>0&&bounds.height>0){
   var points:Array=[m.transformPoint(bounds.topLeft),m.transformPoint(bounds.bottomRight),
    m.transformPoint(new Point(bounds.right,bounds.top)),m.transformPoint(new Point(bounds.left,bounds.bottom))];
   for each(var p:Point in points){left=Math.min(left,Math.floor(p.x)-32);top=Math.min(top,Math.floor(p.y)-32);
    right=Math.max(right,Math.ceil(p.x));bottom=Math.max(bottom,Math.ceil(p.y));}
  }
  // Grow right/bottom without changing the raster translation. Changing the
  // translation can change original Flash filter/edge rounding by one pixel.
  right+=pad;bottom+=pad;
  if(right-left>8191||bottom-top>8191)throw new Error('Unexpected raster extent '+id);
  var bitmap:BitmapData=new BitmapData(right-left,bottom-top,true,0),matrix:Matrix=m.clone();
  matrix.tx-=left;matrix.ty-=top;bitmap.draw(d,matrix,null,null,null,false);
  var visible:Rectangle=bitmap.getColorBoundsRect(0xff000000,0,false);
  var edge:Boolean=visible.width>0&&(visible.left<=0||visible.top<=0||visible.right>=bitmap.width||visible.bottom>=bitmap.height);
  var cropped:BitmapData=new BitmapData(Math.max(1,visible.width),Math.max(1,visible.height),true,0);
  if(visible.width>0)cropped.copyPixels(bitmap,visible,new Point());
  var result:Object={path:save(id+'-p'+pad,cropped),origin:{x:visible.width?left+visible.x:0,y:visible.width?top+visible.y:0},
   width:cropped.width,height:cropped.height,empty:visible.width==0,canvas:{x:left,y:top,width:bitmap.width,height:bitmap.height},touchesEdge:edge};
  if(pad==32&&visible.width>0&&left+visible.left>0&&top+visible.top>0&&left+visible.right<940&&top+visible.bottom<590){
   var stageImage:BitmapData=new BitmapData(940,590,true,0);stageImage.draw(d,m,null,null,null,false);
   var stageBounds:Rectangle=stageImage.getColorBoundsRect(0xff000000,0,false);
   if(stageBounds.width>0&&stageBounds.left>0&&stageBounds.top>0&&stageBounds.right<940&&stageBounds.bottom<590){
    var stageCrop:BitmapData=new BitmapData(stageBounds.width,stageBounds.height,true,0);
    stageCrop.copyPixels(stageImage,stageBounds,new Point());
    result.canonical={path:save(id+'-native-origin',stageCrop),origin:{x:stageBounds.x,y:stageBounds.y},
     width:stageCrop.width,height:stageCrop.height,empty:false,reason:'Full-envelope containment observed; retain original raster origin.'};
    stageCrop.dispose();
   }
   stageImage.dispose();
  }
  bitmap.dispose();cropped.dispose();return result;
 }
 public static function effect(d:DisplayObject,m:Matrix,id:String,meta:Object):void{
  var a:Object=capture(d,m,d.getBounds(d),id,32),b:Object=capture(d,m,d.getBounds(d),id,64);
  rows.push({id:id,meta:meta,primary:a,expanded:b});
 }
 public static function world(world:DisplayObjectContainer,id:String):void{
  var visibility:Array=[],groups:Array=[],i:int,j:int;
  for(i=0;i<world.numChildren;i++)visibility.push(world.getChildAt(i).visible);
  try {
   for(i=0;i<world.numChildren;i++){
    var child:DisplayObject=world.getChildAt(i);
    for(j=0;j<world.numChildren;j++)world.getChildAt(j).visible=(j==i&&visibility[j]);
    var a:Object=capture(world,new Matrix(),child.getBounds(world),id+'-g'+i,32);
    var b:Object=capture(world,new Matrix(),child.getBounds(world),id+'-g'+i,64);
    var group:Object={path:'root/'+i,depth:i,type:getQualifiedClassName(child),visible:visibility[i],primary:a,expanded:b,components:[]};
    // Retain independent body and owner-buff pixels as well as the indivisible
    // original filtered owner composite. Never call that composite a body atlas.
    var type:String=getQualifiedClassName(child);
    if((type.indexOf('PetTurtle')>=0||type.indexOf('BaseHero')>=0)&&child is DisplayObjectContainer){
     var container:DisplayObjectContainer=child as DisplayObjectContainer,flags:Array=[],filters:Array=child.filters;
     for(var k:int=0;k<container.numChildren;k++)flags.push(container.getChildAt(k).visible);
     child.filters=[];
     try {for(k=0;k<container.numChildren;k++){
      for(var n:int=0;n<container.numChildren;n++)container.getChildAt(n).visible=(n==k&&flags[n]);
      var component:DisplayObject=container.getChildAt(k);
      var ca:Object=capture(world,new Matrix(),component.getBounds(world),id+'-g'+i+'-c'+k,32);
      var cb:Object=capture(world,new Matrix(),component.getBounds(world),id+'-g'+i+'-c'+k,64);
      group.components.push({path:'root/'+i+'/'+k,type:getQualifiedClassName(component),primary:ca,expanded:cb});
     }} finally {child.filters=filters;for(k=0;k<container.numChildren;k++)container.getChildAt(k).visible=flags[k];}
    }
    groups.push(group);
   }
  } finally {for(j=0;j<world.numChildren;j++)world.getChildAt(j).visible=visibility[j];}
  rows.push({id:id,groups:groups});
 }
 public static function finish():void{
  var stream:FileStream=new FileStream();stream.open(new File(File.applicationDirectory.nativePath).resolvePath('layers.json'),FileMode.WRITE);
  stream.writeUTFBytes(JSON.stringify({rows:rows}));stream.close();
 }
}}
