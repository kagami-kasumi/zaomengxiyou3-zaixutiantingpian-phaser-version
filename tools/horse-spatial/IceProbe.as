package {
import flash.display.*;import flash.events.*;import flash.filesystem.*;import flash.geom.*;import flash.system.*;import flash.utils.*;import flash.desktop.NativeApplication;
public class IceProbe extends Sprite {
private var config:Object,tick:int=-1,items:Array=[],rows:Array=[];
public function IceProbe(){
loaderInfo.uncaughtErrorEvents.addEventListener(UncaughtErrorEvent.UNCAUGHT_ERROR,function(e:UncaughtErrorEvent):void{trace("FAIL "+e.error);e.preventDefault();NativeApplication.nativeApplication.exit(1);});
var fs:FileStream=new FileStream();fs.open(File.applicationDirectory.resolvePath("fixtures.json"),FileMode.READ);config=JSON.parse(fs.readUTFBytes(fs.bytesAvailable));fs.close();stage.frameRate=config.fps;
var loader:Loader=new Loader();loader.contentLoaderInfo.addEventListener(Event.COMPLETE,function(e:Event):void{loader.unload();start();});
fs.open(new File(config.source),FileMode.READ);var bytes:ByteArray=new ByteArray();fs.readBytes(bytes);fs.close();var context:LoaderContext=new LoaderContext(false,ApplicationDomain.currentDomain);context.allowCodeImport=true;loader.loadBytes(bytes,context);}
private function target(symbol:String,hero:Boolean):Target {
var t:Target=hero?new BaseHero():new Target();var type:Class=getDefinitionByName(symbol) as Class;t.colipse=new type();
if(symbol=="ObjectBaseSprite7")t.colipse.scaleX=.5;t.colipse.visible=false;t.addChild(t.colipse);addChild(t);
t.clip.setAddScriptWhenFrameOver(function(n:int):void{t.clip.setFramePointX(0);});return t;}
private function start():void {
for each(var symbol:String in ["ObjectBaseSprite","ObjectBaseSprite2","ObjectBaseSprite7"])for each(var hero:Boolean in [false,true])for each(var owner:int in [1,2])for each(var mode:String in ["expire","refresh","cancel","destroy","repeat-show"]){
var p1:Target=target(symbol,hero),p2:Target=target(symbol,hero),gc:IceConfig=new IceConfig();gc.frameClips=config.fps;
var e1:BaseAddEffect=new BaseAddEffect(p1,gc),e2:BaseAddEffect=new BaseAddEffect(p2,gc),active:BaseAddEffect=owner==1?e1:e2;
active.add([{name:BaseAddEffect.PETHORSE_ICE,time:config.fps*2.4}]);items.push({id:symbol+"-"+hero+"-"+owner+"-"+mode,symbol:symbol,hero:hero,owner:owner,mode:mode,p1:p1,p2:p2,e1:e1,e2:e2,active:active});}
trace("ENV "+JSON.stringify({fps:stage.frameRate,runtime:Capabilities.version}));advance(null);stage.addEventListener(Event.ENTER_FRAME,advance);}
private function advance(event:Event):void {
tick++;for each(var item:Object in items){
if(item.mode=="refresh"&&tick==config.fps+2)item.active.add([{name:BaseAddEffect.PETHORSE_ICE,time:config.fps*2.4}]);
if(item.mode=="cancel"&&tick==config.fps+3)item.active.cancelAllEffect();
if(item.mode=="destroy"&&tick==config.fps+3)item.active.destroy();
if(item.mode=="repeat-show"&&tick==2){var buff:Object=item.active.getBuffByName(BaseAddEffect.PETHORSE_ICE);buff.isFirst=true;}
item.p1.clip.step();item.p2.clip.step();item.e1.step();item.e2.step();
rows.push({id:item.id,tick:tick,owner:item.owner,hero:item.hero,mode:item.mode,symbol:item.symbol,p1:state(item.p1,item.e1),p2:state(item.p2,item.e2)});
}if(tick==config.fps*5){stage.removeEventListener(Event.ENTER_FRAME,advance);var fs:FileStream=new FileStream();fs.open(new File(File.applicationDirectory.nativePath).resolvePath("rows.json"),FileMode.WRITE);fs.writeUTFBytes(JSON.stringify(rows));fs.close();trace("COMPLETE "+rows.length);NativeApplication.nativeApplication.exit(0);}}
private function state(t:Target,e:BaseAddEffect):Object {
var ice:DisplayObject=t.getChildByName("PetHorseIceEffect"),buff:Object=e.getBuffByName(BaseAddEffect.PETHORSE_ICE),m:Matrix=ice?ice.transform.matrix:null;
return {ice:ice!=null,children:t.numChildren,owner:e.sourceRole!=null,stopped:t.clip.isStopFrame,locked:t.locked,staticCalls:t.staticCalls,
column:t.clip.getCurPoint().x,count:t.clip.getCurFrameCount(),width:ice?ice.width:null,height:ice?ice.height:null,
colipseWidth:t.colipse.width,colipseHeight:t.colipse.height,matrix:m?{a:m.a,b:m.b,c:m.c,d:m.d,tx:m.tx,ty:m.ty}:null,
buff:buff?{time:buff.time,startTime:buff.startTime,isFirst:buff.isFirst}:null};}
}}
