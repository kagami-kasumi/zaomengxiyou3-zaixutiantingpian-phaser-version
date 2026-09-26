package {
import flash.display.*;import flash.events.*;import flash.filesystem.*;import flash.system.*;import flash.utils.*;import flash.desktop.NativeApplication;
public class FireProbe extends Sprite {
private var config:Object,index:int=0,loaders:Array=[];
public function FireProbe(){
loaderInfo.uncaughtErrorEvents.addEventListener(UncaughtErrorEvent.UNCAUGHT_ERROR,function(e:UncaughtErrorEvent):void{trace("FAIL "+e.error);e.preventDefault();NativeApplication.nativeApplication.exit(1);});
var fs:FileStream=new FileStream();fs.open(File.applicationDirectory.resolvePath("fixtures.json"),FileMode.READ);config=JSON.parse(fs.readUTFBytes(fs.bytesAvailable));fs.close();next();}
private function next():void {
if(index==config.sources.length){start();return;}
var loader:Loader=new Loader();loaders.push(loader);
loader.contentLoaderInfo.addEventListener(Event.COMPLETE,function(e:Event):void{loader.unload();index++;next();});
var fs:FileStream=new FileStream();fs.open(new File(config.sources[index].path),FileMode.READ);var bytes:ByteArray=new ByteArray();fs.readBytes(bytes);fs.close();
var context:LoaderContext=new LoaderContext(false,ApplicationDomain.currentDomain);context.allowCodeImport=true;loader.loadBytes(bytes,context);}
private function start():void {
for each(var fps:int in [20,24,30])for each(var selected:int in [1,2])for each(var mode:String in ["expire","refresh","cancel","destroy","boundary"])run(fps,selected,mode);
trace("COMPLETE");NativeApplication.nativeApplication.exit(0);}
private function run(fps:int,selected:int,mode:String):void {
var p1:Target=new Target(),p2:Target=new Target(),gc:FireConfig=new FireConfig();gc.frameClips=fps;addChild(p1);addChild(p2);
var e1:BaseAddEffect=new BaseAddEffect(p1,gc),e2:BaseAddEffect=new BaseAddEffect(p2,gc),active:BaseAddEffect=selected==1?e1:e2;
var duration:Number=mode=="boundary"?fps:fps*3.6;
active.add([{name:BaseAddEffect.PETMONKEY_FIRE,time:duration,hurt:10}]);
for(var tick:int=0;tick<=fps*8;tick++){
if(mode=="refresh"&&tick==fps+2)active.add([{name:BaseAddEffect.PETMONKEY_FIRE,time:duration,hurt:99}]);
if(mode=="cancel"&&tick==fps+3)active.cancelAllEffect();
if(mode=="destroy"&&tick==fps+3)active.destroy();
e1.step();e2.step();
trace("STATE "+JSON.stringify({fps:fps,selected:selected,mode:mode,tick:tick,p1:state(p1,e1),p2:state(p2,e2)}));
}removeChild(p1);removeChild(p2);}
private function state(p:Target,e:BaseAddEffect):Object {
var child:DisplayObject=p.getChildByName("FireBuff");var buff:Object=e.getBuffByName(BaseAddEffect.PETMONKEY_FIRE);
return {fire:child!=null,children:p.numChildren,owner:e.sourceRole!=null,damage:p.damage.concat(),
buff:buff?{time:buff.time,startTime:buff.startTime,hurt:buff.hurt,isFirst:buff.isFirst}:null};}
}}
