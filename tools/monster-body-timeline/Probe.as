package {
import flash.display.*; import flash.events.*; import flash.system.*;
import flash.utils.*; import flash.desktop.NativeApplication;
public class Probe extends Sprite {
 [Embed(source="source.swf",mimeType="application/octet-stream")] private var Bytes:Class;
 private var loader:Loader=new Loader(), clip:MovieClip, rows:Array=[], fpsList:Array=[20,24,30];
 private var batch:int=0, tick:int=0, frameClass:Class;
 public function Probe(){
  loaderInfo.uncaughtErrorEvents.addEventListener(UncaughtErrorEvent.UNCAUGHT_ERROR,function(e:UncaughtErrorEvent):void{trace('FAIL '+e.error);e.preventDefault();NativeApplication.nativeApplication.exit(1);});
  stage.scaleMode=StageScaleMode.NO_SCALE;stage.align=StageAlign.TOP_LEFT;
  loader.contentLoaderInfo.addEventListener(Event.COMPLETE,loaded);
  var context:LoaderContext=new LoaderContext(false,new ApplicationDomain());context.allowCodeImport=true;
  loader.loadBytes(new Bytes() as ByteArray,context);
 }
 private function loaded(e:Event):void{
  frameClass=loader.contentLoaderInfo.applicationDomain.getDefinition('Monster30Bullet1') as Class;
  trace('ENV '+Capabilities.version);begin();addEventListener(Event.ENTER_FRAME,sample);
 }
 private function begin():void{stage.frameRate=fpsList[batch];tick=0;clip=new frameClass() as MovieClip;clip.x=200;clip.y=150;addChild(clip);}
 private function sample(e:Event):void{
  ++tick;
  rows.push({fps:fpsList[batch],tick:tick,frame:clip.currentFrame,total:clip.totalFrames,playing:clip.isPlaying,children:clip.numChildren});
  if(tick==5)clip.stop();if(tick==8)clip.play();
  if(tick==22){removeChild(clip);clip.stop();++batch;
   if(batch==fpsList.length){trace('ROWS '+JSON.stringify(rows));trace('COMPLETE');NativeApplication.nativeApplication.exit(0);}
   else begin();
  }
 }
}}
