package {
import flash.display.*; import flash.events.*; import flash.geom.*;
import flash.system.*; import flash.utils.*; import flash.filesystem.*;
import flash.desktop.NativeApplication; import my.HitTest;
public class Probe extends Sprite {
 [Embed(source="source.swf",mimeType="application/octet-stream")] private var Source:Class;
 [Embed(source="common.swf",mimeType="application/octet-stream")] private var Common:Class;
 [Embed(source="fixtures.json",mimeType="application/octet-stream")] private var Fixtures:Class;
 private var config:Object=JSON.parse(new Fixtures().toString());
 private var source:Loader=new Loader(),common:Loader=new Loader();
 private var movie:MovieClip, wrapper:Sprite=new Sprite(), targetRoot:Sprite=new Sprite();
 private var seen:Object={},targetSeen:Object={},count:int=0,states:int=0;
 public function Probe(){
  stage.scaleMode=StageScaleMode.NO_SCALE;stage.align=StageAlign.TOP_LEFT;
  loaderInfo.uncaughtErrorEvents.addEventListener(UncaughtErrorEvent.UNCAUGHT_ERROR,function(e:UncaughtErrorEvent):void{
   trace('FAIL '+e.error);e.preventDefault();NativeApplication.nativeApplication.exit(1);
  });
  source.contentLoaderInfo.addEventListener(Event.COMPLETE,function(e:Event):void{
   common.contentLoaderInfo.addEventListener(Event.COMPLETE,loaded);
   var c:LoaderContext=new LoaderContext(false,new ApplicationDomain());c.allowCodeImport=true;
   common.loadBytes(new Common() as ByteArray,c);
  });
  var c:LoaderContext=new LoaderContext(false,new ApplicationDomain());c.allowCodeImport=true;
  source.loadBytes(new Source() as ByteArray,c);
 }
 private function loaded(e:Event):void{
  trace('ENV '+Capabilities.version);Spatial.colorDiagnostic();
  var cls:Class=source.contentLoaderInfo.applicationDomain.getDefinition(config.symbol) as Class;
  movie=new cls() as MovieClip;wrapper.addChild(movie);addChild(wrapper);addChild(targetRoot);
  capture(null);stage.addEventListener(Event.ENTER_FRAME,capture);
 }
 private function capture(e:Event):void{
  try {
   var frame:int=movie.currentFrame;if(seen[frame])return;seen[frame]=true;
   trace('TREE '+JSON.stringify({frame:frame,parentPresent:movie.parent!=null,tree:Spatial.tree(movie)}));
   for each(var sign:int in config.signs){
    wrapper.transform.matrix=new Matrix(sign,0,0,1,470,295);
    var id:String='f'+frame+'-s'+sign;
    Spatial.baseline(wrapper,id);Spatial.envelope(wrapper,id,sign);if(config.visualOnly)Spatial.wide(wrapper,id);trace('PROJECT '+JSON.stringify({frame:frame,sign:sign,tree:Spatial.tree(movie)}));
    if(!config.visualOnly)trace('MASK '+JSON.stringify(Spatial.field(wrapper,id,frame,sign)));
    for each(var profile:Object in config.profiles) sample(profile,frame,sign);
   }
   wrapper.transform.matrix=new Matrix();states++;
   if(states==config.frames){stage.removeEventListener(Event.ENTER_FRAME,capture);movie.stop();Spatial.flush();trace('COMPLETE '+count);NativeApplication.nativeApplication.exit(0);}
  }catch(error:Error){trace('FAIL '+error.getStackTrace());NativeApplication.nativeApplication.exit(1);}
 }
 private function sample(profile:Object,frame:int,sign:int):void{
  var cls:Class=common.contentLoaderInfo.applicationDomain.getDefinition(profile.symbol) as Class;
  var target:DisplayObject=new cls();targetRoot.addChild(target);
  target.visible=false;target.scaleX=profile.scaleX;target.scaleY=profile.scaleY;target.x=profile.x;target.y=profile.y;
  targetRoot.transform.matrix=new Matrix(profile.parentScaleX,0,0,profile.parentScaleY,0,0);
  var local:Rectangle=target.getBounds(this),bounds:Rectangle=wrapper.getBounds(this);
  if(!targetSeen[profile.id]){Spatial.targetBaseline(target,profile.id,profile.scaleX);targetSeen[profile.id]=true;trace('TARGET '+JSON.stringify({id:profile.id,tree:Spatial.tree(target),bounds:Spatial.rect(local)}));trace('MASK '+JSON.stringify(Spatial.field(target,profile.id,0,profile.scaleX)));}
  for each(var fixture:Object in config.cases){
   var sx:Number=fixture.sourceX===undefined?470:fixture.sourceX;
   var sy:Number=fixture.sourceY===undefined?295:fixture.sourceY;
   wrapper.transform.matrix=new Matrix(sign,0,0,1,sx,sy);bounds=wrapper.getBounds(this);
   var x:Number=0,y:Number=0,cx:Number=bounds.x+bounds.width/2,cy:Number=bounds.y+bounds.height/2;
   if(fixture.anchor=='center'){x=cx-(local.x+local.width/2);y=cy-(local.y+local.height/2);}
   if(fixture.anchor=='absolute'){x=fixture.x;y=fixture.y;}
   if(fixture.anchor=='root'||fixture.anchor=='translated-root'){x=sx+fixture.x;y=sy+fixture.y;}
   if(fixture.anchor=='left'||fixture.anchor=='right'){
    x=fixture.anchor=='left'?bounds.x-local.right+fixture.overlap:bounds.right-local.x-fixture.overlap;
    y=cy-local.y-local.height/2+fixture.along;
   }
   if(fixture.anchor=='top'||fixture.anchor=='bottom'){
    x=cx-local.x-local.width/2+fixture.along;
    y=fixture.anchor=='top'?bounds.y-local.bottom+fixture.overlap:bounds.bottom-local.y-fixture.overlap;
   }
   targetRoot.x=x;targetRoot.y=y;
   var caseId:String='f'+frame+'-s'+sign+'-'+profile.id+'-'+fixture.id;
   var row:Object=Spatial.measure(target,wrapper,config.diagnostics&&config.diagnostics.indexOf(caseId)>=0?caseId:null);
   row.id='f'+frame+'-s'+sign+'-'+profile.id+'-'+fixture.id;row.frame=frame;row.sign=sign;
   row.profile=profile.id;row.fixture=fixture.id;row.sourceRoot={x:wrapper.x,y:wrapper.y};
   row.targetRoot={x:targetRoot.x,y:targetRoot.y};
   row.broad=AUtils.testIntersects(target,wrapper,this);row.pixel=HitTest.complexHitTestObject(target,wrapper);
   row.hit=profile.kind=='pet'?row.broad&&row.pixel:row.pixel;
   trace('CASE '+JSON.stringify(row));count++;
  }
  targetRoot.removeChild(target);targetRoot.transform.matrix=new Matrix();
  wrapper.transform.matrix=new Matrix(sign,0,0,1,470,295);
 }
}}

import flash.display.*; import flash.geom.*; import flash.utils.*; import flash.filesystem.*; import flash.filters.BlurFilter; import my.HitTest;
class Spatial extends HitTest {
 private static var buffers:ByteArray=new ByteArray();
 public static function flush():void{buffers.compress();write(buffers,'buffers.deflate');}
 public static function colorDiagnostic():void{var b:BitmapData=new BitmapData(8,8,false,0);for(var y:int=0;y<8;y++)for(var x:int=0;x<8;x++){b.fillRect(b.rect,0);b.setPixel(x,y,0x00ffff);trace('COLOR '+JSON.stringify({x:x,y:y,result:rect(b.getColorBoundsRect(4294967295,4278255615))}));}b.dispose();}
 public static function rect(r:Rectangle):Object{return {x:r.x,y:r.y,width:r.width,height:r.height};}
 public static function matrix(m:Matrix):Object{return {a:m.a,b:m.b,c:m.c,d:m.d,tx:m.tx,ty:m.ty};}
 public static function tree(d:DisplayObject):Object{
  var r:Object={type:getQualifiedClassName(d),matrix:matrix(d.transform.matrix),bounds:rect(d.getBounds(d)),
   alpha:d.alpha,visible:d.visible,blendMode:d.blendMode,filters:[],children:[],stageBounds:rect(d.getBounds(d.root)),worldMatrix:matrix(d.transform.concatenatedMatrix)};
  for each(var f:Object in d.filters)r.filters.push({type:getQualifiedClassName(f),blurX:f is BlurFilter?f.blurX:null,blurY:f is BlurFilter?f.blurY:null});
  if(d is MovieClip){r.frame=MovieClip(d).currentFrame;r.totalFrames=MovieClip(d).totalFrames;}
  if(d is DisplayObjectContainer)for(var i:int=0;i<DisplayObjectContainer(d).numChildren;i++)r.children.push(tree(DisplayObjectContainer(d).getChildAt(i)));
  return r;
 }
 private static function write(bytes:ByteArray,path:String):void{
  var file:File=new File(File.applicationDirectory.nativePath).resolvePath(path);file.parent.createDirectory();
  var stream:FileStream=new FileStream();stream.open(file,FileMode.WRITE);stream.writeBytes(bytes);stream.close();
 }
 public static function targetBaseline(d:DisplayObject,id:String,scale:Number):void{var b:BitmapData=new BitmapData(940,590,true,0);b.draw(d,new Matrix(scale,0,0,1,470,295));write(b.encode(b.rect,new PNGEncoderOptions()),'baselines/'+id+'.png');b.dispose();}
 public static function baseline(d:DisplayObject,id:String):void{
  var b:BitmapData=new BitmapData(940,590,true,0);b.draw(d,d.transform.matrix);
  write(b.encode(b.rect,new PNGEncoderOptions()),'baselines/'+id+'.png');b.dispose();
 }
 public static function wide(d:DisplayObject,id:String):void{
  var b:BitmapData=new BitmapData(1880,1180,true,0);b.draw(d,d.transform.matrix);
  write(b.encode(b.rect,new PNGEncoderOptions()),'wide/'+id+'.png');
  trace('WIDE '+JSON.stringify({id:id,width:1880,height:1180,alphaBounds:rect(b.getColorBoundsRect(0xff000000,0,false))}));b.dispose();
 }
 public static function envelope(d:DisplayObject,id:String,sign:Number):void{
  var r:Rectangle=d.getBounds(d);var left:int=Math.floor(sign>0?r.x:-r.right)-4,top:int=Math.floor(r.y)-4;
  var w:int=Math.ceil(r.width)+9,h:int=Math.ceil(r.height)+9;
  var b:BitmapData=new BitmapData(w,h,true,0);b.draw(d,new Matrix(sign,0,0,1,-left,-top));
  write(b.encode(b.rect,new PNGEncoderOptions()),'local/'+id+'.png');
  trace('LOCAL '+JSON.stringify({id:id,left:left,top:top,width:w,height:h,alphaBounds:rect(b.getColorBoundsRect(0xff000000,0,false))}));b.dispose();
 }
 public static function field(d:DisplayObject,id:String,frame:int,sign:Number):Object{
  var bounds:Rectangle=d.getBounds(d),left:Number=sign>0?bounds.x*sign:-bounds.right;
  var extent:Number=bounds.width*Math.abs(sign);
  var ox:int=-Math.floor(left)+2,oy:int=-Math.floor(bounds.y)+2;
  var w:int=Math.ceil(extent)+5,h:int=Math.ceil(bounds.height)+5;
  var b:BitmapData=new BitmapData(w,h,false,0xff0000),bytes:ByteArray=new ByteArray();
  for(var py:int=0;py<20;py++)for(var px:int=0;px<20;px++){
   b.fillRect(b.rect,0xff0000);b.draw(d,new Matrix(sign,0,0,1,ox+px/20,oy+py/20),new ColorTransform(1,1,1,1,255,255,255,255),BlendMode.DIFFERENCE);
   var matched:BitmapData=new BitmapData(w,h,true,0);matched.threshold(b,b.rect,new Point(),"==",0xff00ffff,0xffffffff,0xffffffff,false);var v:Vector.<uint>=matched.getVector(matched.rect);matched.dispose();
   for(var i:int=0;i<v.length;i+=8){var packed:int=0;for(var bit:int=0;bit<8&&i+bit<v.length;bit++)if(v[i+bit]==0xffffffff)packed|=1<<bit;bytes.writeByte(packed);}
  }
  var raw:int=bytes.length;bytes.compress();write(bytes,'fields/'+id+'.deflate');b.dispose();
  return {id:id,frame:frame,sign:sign,width:w,height:h,originX:ox,originY:oy,phaseCount:400,phaseStride:Math.ceil(w*h/8),rawBytes:raw,bounds:rect(bounds)};
 }
 public static function measure(a:DisplayObject,b:DisplayObject,id:String=null):Object{
  var q:Rectangle=intersectionRectangle(a,b),r:Object={target:rect(a.getBounds(a.root)),bullet:rect(b.getBounds(b.root)),intersection:rect(q),cyanPixels:0};
  if(q.width<1||q.height<1)return r;
  var data:BitmapData=new BitmapData(q.width,q.height,false,0);
  if(id){
   var one:BitmapData=new BitmapData(q.width,q.height,false,0xff0000);
   one.draw(a,getDrawMatrix(a,q,1),new ColorTransform(1,1,1,1,255,255,255,255),BlendMode.DIFFERENCE);write(one.encode(one.rect,new PNGEncoderOptions()),'diagnostic/'+id+'-target.png');
   one.fillRect(one.rect,0xff0000);one.draw(b,getDrawMatrix(b,q,1),new ColorTransform(1,1,1,1,255,255,255,255),BlendMode.DIFFERENCE);write(one.encode(one.rect,new PNGEncoderOptions()),'diagnostic/'+id+'-source.png');one.dispose();
  }
  data.draw(a,getDrawMatrix(a,q,1),new ColorTransform(1,1,1,1,255,-255,-255,255));
  data.draw(b,getDrawMatrix(b,q,1),new ColorTransform(1,1,1,1,255,255,255,255),BlendMode.DIFFERENCE);
  var matched:BitmapData=new BitmapData(data.width,data.height,true,0);matched.threshold(data,data.rect,new Point(),"==",0xff00ffff,0xffffffff,0xffffffff,false);r.thresholdBounds=rect(matched.getColorBoundsRect(4294967295,4294967295));var v:Vector.<uint>=matched.getVector(matched.rect);matched.dispose();r.bufferOffset=buffers.length;r.bufferLength=Math.ceil(v.length/8);
  for(var i:int=0;i<v.length;i+=8){var packed:int=0;for(var bit:int=0;bit<8&&i+bit<v.length;bit++)if(v[i+bit]==0xffffffff){packed|=1<<bit;r.cyanPixels++;}buffers.writeByte(packed);}
  r.colorBounds=rect(data.getColorBoundsRect(4294967295,4278255615));data.dispose();return r;
 }
}
