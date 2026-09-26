package {
import flash.display.*;import flash.events.*;import flash.filesystem.*;import flash.geom.*;import flash.filters.*;import flash.utils.*;import flash.system.*;import flash.desktop.NativeApplication;
public class GeometryProbe extends Sprite {
private var config:Object,queue:Array=[],bitmaps:Object={},index:int=0,vectorCount:int=0,vectorLoaders:Array=[],pools:Object={"131":[],"202":[]},used:Array=[];
public function GeometryProbe(){loaderInfo.uncaughtErrorEvents.addEventListener(UncaughtErrorEvent.UNCAUGHT_ERROR,function(e:UncaughtErrorEvent):void{trace("FAIL "+e.error);e.preventDefault();NativeApplication.nativeApplication.exit(1);});
var fs:FileStream=new FileStream();fs.open(File.applicationDirectory.resolvePath("fixtures.json"),FileMode.READ);config=JSON.parse(fs.readUTFBytes(fs.bytesAvailable));fs.close();
for each(var s:Object in config.sources)for(var cid:String in s.bitmaps)queue.push({key:s.id+"/"+cid,path:s.bitmaps[cid].absolutePath,width:s.bitmaps[cid].width,height:s.bitmaps[cid].height});next();}
private function next():void {if(index==queue.length){nextVector();return;}
var item:Object=queue[index];var fs:FileStream=new FileStream();fs.open(new File(item.path),FileMode.READ);var b:ByteArray=new ByteArray();fs.readBytes(b);fs.close();
var bitmap:BitmapData=new BitmapData(item.width,item.height,true,0);bitmap.setPixels(bitmap.rect,b);bitmaps[item.key]=bitmap;index++;next();}
private function nextVector():void {if(vectorCount==4){run();return;}
var l:Loader=new Loader();vectorLoaders.push(l);l.contentLoaderInfo.addEventListener(Event.COMPLETE,function(e:Event):void{
var root:DisplayObjectContainer=l.content as DisplayObjectContainer;
for(var i:int=0;i<2;i++){var shape:Shape=root.getChildAt(0) as Shape;root.removeChild(shape);var slot:int=config.vectorSwap?1-i:i;pools[String(slot==0?131:202)].push(shape);}vectorCount++;nextVector();});
var fs:FileStream=new FileStream();fs.open(new File(config.vectorPath),FileMode.READ);var bytes:ByteArray=new ByteArray();fs.readBytes(bytes);fs.close();
var context:LoaderContext=new LoaderContext();context.allowCodeImport=true;l.loadBytes(bytes,context);}
private function matrix(m:Object):Matrix{return new Matrix(m.a,m.b,m.c,m.d,m.tx,m.ty);}
private function edges(g:Graphics,paths:Array):void {
var commands:Vector.<int>=new Vector.<int>(),values:Vector.<Number>=new Vector.<Number>();
for each(var path:Array in paths){if(!path.length)continue;commands.push(1);values.push(path[0][0][0],path[0][0][1]);
for each(var edge:Array in path){if(edge.length==2){commands.push(2);values.push(edge[1][0],edge[1][1]);}else{commands.push(3);values.push(edge[1][0],edge[1][1],edge[2][0],edge[2][1]);}}}
g.drawPath(commands,values,GraphicsPathWinding.EVEN_ODD);}
private function makeShape(s:Object,cid:int):Shape {
if(s.id=="20120203"&&(cid==131||cid==202)){var item:Shape=pools[String(cid)].pop() as Shape;if(!item)throw new Error("Vector pool exhausted");used.push({shape:item,cid:cid});return item;}
var shape:Shape=new Shape(),spec:Object=s.shapes[String(cid)],g:Graphics=shape.graphics;
for each(var batch:Object in spec.batches){
for each(var fi:int in batch.fills){var fill:Object=spec.fills[fi];g.lineStyle();
if(fill.kind=="solid")g.beginFill(fill.color,fill.alpha);else if(fill.bitmapId==65535)g.beginFill(0,0);else g.beginBitmapFill(bitmaps[s.id+"/"+fill.bitmapId],matrix(fill.matrix),fill.repeat,fill.smooth);
edges(g,fill.paths);g.endFill();}
for each(var si:int in batch.strokes){var stroke:Object=spec.strokes[si];g.lineStyle(stroke.width,stroke.color,stroke.alpha,false,LineScaleMode.NORMAL,CapsStyle.ROUND,JointStyle.ROUND);
var chains:Array=[],chain:Array=[],last:Array=null;for each(var edge:Array in stroke.edges){if(!last||last[0]!=edge[0][0]||last[1]!=edge[0][1]){chain=[];chains.push(chain);}chain.push(edge);last=edge[edge.length-1];}edges(g,chains);g.lineStyle();}}
return shape;}
private function build(s:Object,cid:int,phase:Object):DisplayObject {
if(phase&&phase.pendingConstruction){if(config.suppressPending)return new Sprite();phase=null;}
if(s.shapes[String(cid)])return makeShape(s,cid);
var root:Sprite=new Sprite(),timeline:Array=s.timelines[String(cid)];
if(!timeline)throw new Error("Missing definition "+cid);
var frame:int=phase&&phase.frame?phase.frame:1,placements:Array=timeline[frame-1];
if(!placements)throw new Error("Missing frame "+cid+":"+frame);
for(var i:int=0;i<placements.length;i++){
var p:Object=placements[i],childPhase:Object=phase&&phase.children&&i<phase.children.length?phase.children[i]:null;
var child:DisplayObject=build(s,p.characterId,childPhase);child.transform.matrix=matrix(p.matrix);
if(p.colorTransform){var c:Object=p.colorTransform;child.transform.colorTransform=new ColorTransform(Number(c.redMultTerm)/256,Number(c.greenMultTerm)/256,Number(c.blueMultTerm)/256,Number(c.alphaMultTerm)/256,Number(c.redAddTerm),Number(c.greenAddTerm),Number(c.blueAddTerm),Number(c.alphaAddTerm));}
var filters:Array=[];for each(var f:Object in p.filters){var a:Object=f.attributes;if(a.type!="BLURFILTER")throw new Error("Unsupported filter");filters.push(new BlurFilter(Number(a.blurX),Number(a.blurY),int(a.passes)));}child.filters=filters;
if(p.clipDepth)throw new Error("Unexpected mask");root.addChild(child);}
return root;}
private function run():void {
for each(var state:Object in config.states){var s:Object=config.sources[state.sourceIndex],object:DisplayObject=build(s,state.cid,state.phase);
addChild(object);var b:BitmapData=new BitmapData(state.width,state.height,true,0);b.draw(object,new Matrix(1,0,0,1,-state.left,-state.top));
var path:String="render/"+state.id+".png",file:File=new File(File.applicationDirectory.nativePath).resolvePath(path);file.parent.createDirectory();
var fs:FileStream=new FileStream();fs.open(file,FileMode.WRITE);fs.writeBytes(b.encode(b.rect,new PNGEncoderOptions()));fs.close();
var r:Rectangle=object.getBounds(object);trace("STATE "+JSON.stringify({id:state.id,path:path,bounds:{x:r.x,y:r.y,width:r.width,height:r.height}}));b.dispose();removeChild(object);
for each(var entry:Object in used){if(entry.shape.parent)entry.shape.parent.removeChild(entry.shape);pools[String(entry.cid)].push(entry.shape);}used=[];}
trace("COMPLETE");NativeApplication.nativeApplication.exit(0);}
}}
