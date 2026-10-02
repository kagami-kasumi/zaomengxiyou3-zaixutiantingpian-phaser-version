package {
import flash.display.*;import flash.events.*;import flash.system.*;import flash.utils.*;import flash.desktop.NativeApplication;
public class Timeline extends Sprite {
 [Embed(source="source.swf",mimeType="application/octet-stream")]private var Bytes:Class;
 private var loader:Loader=new Loader(),clip:MovieClip,rows:Array=[],cases:Array=[],batch:int=0,tick:int=0;
 public function Timeline(){
  loaderInfo.uncaughtErrorEvents.addEventListener(UncaughtErrorEvent.UNCAUGHT_ERROR,function(e:UncaughtErrorEvent):void{trace('FAIL '+e.error);e.preventDefault();NativeApplication.nativeApplication.exit(1);});
  stage.scaleMode=StageScaleMode.NO_SCALE;stage.align=StageAlign.TOP_LEFT;
  loader.contentLoaderInfo.addEventListener(Event.COMPLETE,loaded);var c:LoaderContext=new LoaderContext(false,new ApplicationDomain());c.allowCodeImport=true;loader.loadBytes(new Bytes() as ByteArray,c);
 }
 private function loaded(e:Event):void{
  for each(var fps:int in [20,24,30])for each(var symbol:String in ['Monster3Bullet1','Monster3Bullet2'])for each(var mode:String in ['free','stop-play'])cases.push({fps:fps,symbol:symbol,mode:mode});
  trace('ENV '+Capabilities.version);begin();addEventListener(Event.ENTER_FRAME,sample);
 }
 private function begin():void{stage.frameRate=cases[batch].fps;tick=0;var cls:Class=loader.contentLoaderInfo.applicationDomain.getDefinition(cases[batch].symbol) as Class;clip=new cls() as MovieClip;clip.x=200;clip.y=150;addChild(clip);}
 private function sample(e:Event):void{
  ++tick;var c:Object=cases[batch];rows.push({fps:c.fps,symbol:c.symbol,mode:c.mode,tick:tick,frame:clip.currentFrame,total:clip.totalFrames,playing:clip.isPlaying});
  if(c.mode=='stop-play'){if(tick==5)clip.stop();if(tick==8)clip.play();}
  if(tick==24){removeChild(clip);clip.stop();++batch;if(batch==cases.length){trace('ROWS '+JSON.stringify(rows));trace('COMPLETE');NativeApplication.nativeApplication.exit(0);}else begin();}
 }
}}
