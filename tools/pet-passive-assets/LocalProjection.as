package {
import flash.display.*;import flash.events.*;import flash.geom.*;import flash.system.*;import flash.utils.*;import flash.filesystem.*;import flash.filters.*;import flash.desktop.NativeApplication;
public class LocalProjection extends Sprite {
 private var cfg:Object,index:int=0,batch:Array=[],rows:Array=[];
 public function LocalProjection(){
  loaderInfo.uncaughtErrorEvents.addEventListener(UncaughtErrorEvent.UNCAUGHT_ERROR,function(e:UncaughtErrorEvent):void{trace('FAIL '+e.error+' '+e.error.getStackTrace());e.preventDefault();NativeApplication.nativeApplication.exit(1);});
  stage.scaleMode=StageScaleMode.NO_SCALE;stage.align=StageAlign.TOP_LEFT;stage.frameRate=60;
  var f:FileStream=new FileStream();f.open(File.applicationDirectory.resolvePath('inputs.json'),FileMode.READ);cfg=JSON.parse(f.readUTFBytes(f.bytesAvailable));f.close();
  var l:Loader=new Loader();l.contentLoaderInfo.addEventListener(Event.COMPLETE,function(e:Event):void{next();});
  f.open(new File(cfg.source),FileMode.READ);var bytes:ByteArray=new ByteArray();f.readBytes(bytes);f.close();
  var ctx:LoaderContext=new LoaderContext(false,ApplicationDomain.currentDomain);ctx.allowCodeImport=true;l.loadBytes(bytes,ctx);
 }
 private function create(n:Object):DisplayObject {
  var d:DisplayObject;
  if(String(n.type).indexOf('buff_')==0){var cls:Class=ApplicationDomain.currentDomain.getDefinition(n.type) as Class;d=new cls();}
  else d=new Sprite();
  if(d is MovieClip)MovieClip(d).gotoAndStop(n.frame);
  var c:DisplayObjectContainer=d as DisplayObjectContainer;
  if(String(n.type).indexOf('buff_')!=0)for each(var child:Object in n.children)c.addChild(create(child));
  return d;
 }
 private function configure(d:DisplayObject,n:Object):void {
  if(d is MovieClip)MovieClip(d).gotoAndStop(n.frame);
  var m:Object=n.matrix,ct:Object=n.colorTransform;
  d.transform.matrix=new Matrix(m.a,m.b,m.c,m.d,m.tx,m.ty);
  d.transform.colorTransform=new ColorTransform(ct.redMultiplier,ct.greenMultiplier,ct.blueMultiplier,ct.alphaMultiplier,ct.redOffset,ct.greenOffset,ct.blueOffset,ct.alphaOffset);
  d.visible=n.visible;d.blendMode=n.blendMode;
  // Original symbol owns its filters. Assert rather than fabricate filters.
  if(d.filters.length!=n.filters.length)throw new Error('filter count '+n.type);
  if(d is DisplayObjectContainer){var c:DisplayObjectContainer=d as DisplayObjectContainer;
   if(c.numChildren!=n.children.length)throw new Error('children '+n.type+' '+c.numChildren+'/'+n.children.length);
   for(var i:int=0;i<c.numChildren;i++)configure(c.getChildAt(i),n.children[i]);
  }
 }
 private function next():void {
  if(index==cfg.samples.length){var fs:FileStream=new FileStream();fs.open(new File(File.applicationDirectory.nativePath).resolvePath('outputs.json'),FileMode.WRITE);fs.writeUTFBytes(JSON.stringify({runtime:Capabilities.version,rows:rows}));fs.close();trace('COMPLETE '+rows.length);NativeApplication.nativeApplication.exit(0);return;}
  batch=[];for(var j:int=0;j<32&&index<cfg.samples.length;j++){var s:Object=cfg.samples[index++],d:DisplayObject=create(s.tree);addChild(d);configure(d,s.tree);batch.push({spec:s,display:d});}
  stage.addEventListener(Event.EXIT_FRAME,finish);
 }
 private function finish(e:Event):void {
  stage.removeEventListener(Event.EXIT_FRAME,finish);
  for each(var item:Object in batch){var d:DisplayObject=item.display;configure(d,item.spec.tree);alter(d);
   var r:Rectangle=d.getBounds(d),left:int=Math.floor(r.x)-2,top:int=Math.floor(r.y)-2,w:int=Math.max(1,Math.ceil(r.right)-left+2),h:int=Math.max(1,Math.ceil(r.bottom)-top+2);
   var bmp:BitmapData=new BitmapData(w,h,true,0);bmp.draw(d,new Matrix(1,0,0,1,-left,-top));
   var path:String='images/'+item.spec.key+'.png';var f:File=new File(File.applicationDirectory.nativePath).resolvePath(path);f.parent.createDirectory();var fs:FileStream=new FileStream();fs.open(f,FileMode.WRITE);fs.writeBytes(bmp.encode(bmp.rect,new PNGEncoderOptions(true)));fs.close();
   rows.push({key:item.spec.key,path:path,crop:{left:left,top:top,width:w,height:h},observed:NativeTree.tree(d,d,'root')});bmp.dispose();removeChild(d);
  }
  setTimeout(next,1);
 }
 private function alter(d:DisplayObject):void {
  if(cfg.mode=='no-filter')d.filters=[];
  if(cfg.mode=='wrong-filter'&&d.filters.length)d.filters=[new ColorMatrixFilter([0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0])];
  if(String(getQualifiedClassName(d)).indexOf('buff_')==0){
   if(cfg.mode=='wrong-origin')d.x+=2;
   if(cfg.mode=='wrong-direction')d.scaleX=-d.scaleX;
   if(cfg.mode=='wrong-frame'&&d is MovieClip)MovieClip(d).gotoAndStop(MovieClip(d).currentFrame%MovieClip(d).totalFrames+1);
  }
  if(d is Shape&&(cfg.mode=='no-repeat'||cfg.mode=='wrong-fill'||cfg.mode=='graphics-roundtrip')){
   var sh:Shape=d as Shape,gs:Vector.<IGraphicsData>=sh.graphics.readGraphicsData();
   for each(var g:IGraphicsData in gs)if(g is GraphicsBitmapFill){var b:GraphicsBitmapFill=g as GraphicsBitmapFill;
    if(cfg.mode=='no-repeat')b.repeat=false;
    if(cfg.mode=='wrong-fill')b.matrix.tx+=3;
   }
   // Draw into a fresh object before removing the native shape. Clearing the
   // original graphics invalidates its native bitmap backing in this runtime.
   var replacement:Shape=new Shape();replacement.graphics.drawGraphicsData(gs);
   replacement.transform.matrix=sh.transform.matrix;replacement.transform.colorTransform=sh.transform.colorTransform;
   replacement.visible=sh.visible;replacement.blendMode=sh.blendMode;replacement.filters=sh.filters;
   var parent:DisplayObjectContainer=sh.parent,depth:int=parent.getChildIndex(sh);parent.addChildAt(replacement,depth);parent.removeChild(sh);
  }
  if(d is DisplayObjectContainer){var c:DisplayObjectContainer=d as DisplayObjectContainer;for(var i:int=0;i<c.numChildren;i++)alter(c.getChildAt(i));}
 }
}}
