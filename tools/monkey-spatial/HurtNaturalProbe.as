package {
import flash.display.*;import flash.events.*;import flash.filesystem.*;import flash.system.*;import flash.utils.*;import flash.geom.*;import flash.filters.*;import flash.desktop.NativeApplication;
public class HurtNaturalProbe extends Sprite {
private var config:Object,loader:Loader=new Loader(),tick:int=0,parents:Array=[],clips:Array=[],rows:Array=[],hits:Array=[];
public function HurtNaturalProbe(){
loaderInfo.uncaughtErrorEvents.addEventListener(UncaughtErrorEvent.UNCAUGHT_ERROR,function(e:UncaughtErrorEvent):void{trace("FAIL "+e.error);e.preventDefault();NativeApplication.nativeApplication.exit(1);});
var f:FileStream=new FileStream();f.open(File.applicationDirectory.resolvePath("inputs.json"),FileMode.READ);config=JSON.parse(f.readUTFBytes(f.bytesAvailable));f.close();
stage.frameRate=config.fps;stage.scaleMode=StageScaleMode.NO_SCALE;stage.align=StageAlign.TOP_LEFT;
loader.contentLoaderInfo.addEventListener(Event.COMPLETE,ready);f.open(new File(config.source),FileMode.READ);var bytes:ByteArray=new ByteArray();f.readBytes(bytes);f.close();
var context:LoaderContext=new LoaderContext(false,ApplicationDomain.currentDomain);context.allowCodeImport=true;loader.loadBytes(bytes,context);
}
private function ready(e:Event):void{
loader.unload();
for(var owner:int=1;owner<=2;owner++){
var p:BasePet=new BasePet();p.curAddEffect=new Effect(p,config.fps);p.colipse={x:owner==1?12:37,y:owner==1?-24:-51};p.x=owner==1?300:640;p.y=350;addChild(p);parents.push(p);
for(var hit:int=1;hit<=6;hit++){var before:int=p.numChildren;p.invoke();var h:MovieClip=p.getChildAt(p.numChildren-1) as MovieClip;
clips.push({owner:owner,hit:hit,pet:p,clip:h});hits.push({owner:owner,hit:hit,before:before,after:p.numChildren,father:p.isYourFather,fatherCount:p.fatherCount,childClass:getQualifiedClassName(h),x:h.x,y:h.y,colipse:p.colipse,filter:ColorMatrixFilter(h.filters[0]).matrix});}
}
capture();stage.addEventListener(Event.ENTER_FRAME,advance);
}
private function advance(e:Event):void {
tick++;
// Parent detachment is an explicit observation boundary; source destroy timing is proven separately.
if(tick==12)removeChild(parents[0]);
capture();
if(tick==18){stage.removeEventListener(Event.ENTER_FRAME,advance);var f:FileStream=new FileStream();f.open(new File(File.applicationDirectory.nativePath).resolvePath("rows.json"),FileMode.WRITE);f.writeUTFBytes(JSON.stringify({rows:rows,hits:hits,frameRate:stage.frameRate}));f.close();trace("COMPLETE "+rows.length);NativeApplication.nativeApplication.exit(0);}
}
private function capture():void {
for each(var item:Object in clips){var h:MovieClip=item.clip,p:BasePet=item.pet;
var row:Object={owner:item.owner,hit:item.hit,tick:tick,frame:h.currentFrame,total:h.totalFrames,attached:h.parent==p,parentAttached:p.parent!=null,children:p.numChildren,x:h.x,y:h.y,filter:h.filters.length?ColorMatrixFilter(h.filters[0]).matrix:null,tree:NativeTree.tree(h,h,"root")};
if(item.hit==1){var bounds:Rectangle=h.getBounds(h),left:int=Math.floor(bounds.x)-5,top:int=Math.floor(bounds.y)-5;
var bitmap:BitmapData=new BitmapData(Math.max(1,Math.ceil(bounds.right)-left+5),Math.max(1,Math.ceil(bounds.bottom)-top+5),true,0);bitmap.draw(h,new Matrix(1,0,0,1,-left,-top));
var path:String="baselines/P"+item.owner+"-"+tick+".png",file:File=new File(File.applicationDirectory.nativePath).resolvePath(path);file.parent.createDirectory();var f:FileStream=new FileStream();f.open(file,FileMode.WRITE);f.writeBytes(bitmap.encode(bitmap.rect,new PNGEncoderOptions()));f.close();bitmap.dispose();row.path=path;row.left=left;row.top=top;}
rows.push(row);
}
}
}}
