package {
import flash.display.*;import flash.events.*;import flash.geom.*;import flash.system.*;import flash.utils.*;import flash.filesystem.*;import flash.desktop.NativeApplication;
import passivefixture.base.*;import com.greensock.TweenMax;
public class Probe extends Sprite {
private var cfg:Object,loadIndex:int=0,cases:Array=[],tick:int=0,rows:Array=[],gc:Config=Config.instance,serial:int=0;
public function Probe(){
 loaderInfo.uncaughtErrorEvents.addEventListener(UncaughtErrorEvent.UNCAUGHT_ERROR,function(e:UncaughtErrorEvent):void{trace('FAIL '+e.error);e.preventDefault();NativeApplication.nativeApplication.exit(1);});
 stage.scaleMode=StageScaleMode.NO_SCALE;stage.align=StageAlign.TOP_LEFT;stage.frameRate=24;
 var f:FileStream=new FileStream();f.open(File.applicationDirectory.resolvePath('fixtures.json'),FileMode.READ);cfg=JSON.parse(f.readUTFBytes(f.bytesAvailable));f.close();next();
}
private function next():void{
 if(loadIndex==cfg.sources.length){start();return;}
 var l:Loader=new Loader();l.contentLoaderInfo.addEventListener(Event.COMPLETE,function(e:Event):void{l.unload();loadIndex++;next();});
 var fs:FileStream=new FileStream();fs.open(new File(cfg.sources[loadIndex].path),FileMode.READ);var bytes:ByteArray=new ByteArray();fs.readBytes(bytes);fs.close();
 var ctx:LoaderContext=new LoaderContext(false,ApplicationDomain.currentDomain);ctx.allowCodeImport=true;l.loadBytes(bytes,ctx);
}
private function start():void{
 for each(var spec:Object in cfg.cases){
  var world:Sprite=new Sprite();world.name='world';addChild(world);gc.gameSence=world;
  var h:BaseObject=spec.hostType=='pet'?new BasePet():new BaseHero();h.name='host';h.x=spec.x;h.y=spec.y;h.direction=spec.direction;
  h.colipse=AUtils.getNewObj(spec.colipse);h.colipse.scaleX=spec.colipseScaleX;
  world.addChild(h);var fx:BaseAddEffect=h.curAddEffect;
  var c:Object={spec:spec,world:world,host:h,fx:fx,game:new MainGame(world)};cases.push(c);
  fx.add([{name:spec.effect,time:spec.duration,value:7}]);
 }
 capture('added-before-step');
 for each(var c:Object in cases){gc.gameSence=c.world;c.fx.step();}
 capture('first-owner-step');
 stage.addEventListener(Event.ENTER_FRAME,onFrame);stage.addEventListener(Event.EXIT_FRAME,afterFrame);
}
private function onFrame(e:Event):void{
 tick++;TweenMax.advance(tick/24);
 for each(var c:Object in cases){
  var h:BaseObject=c.host,s:Object=c.spec;gc.gameSence=c.world;gc.isStopGame=false;
  if((tick==3&&s.scenario=='refresh')||(tick==105&&s.scenario=='late-refresh')||(tick==125&&s.scenario=='readd'))c.fx.add([{name:s.effect,time:s.duration,value:99}]);
  if(tick==3&&s.scenario=='move'){h.x+=31.25;h.y-=12.5;h.direction=1-h.direction;}
  if(tick==4&&s.scenario=='move'){var m:Matrix=h.transform.matrix;m.a=-1;h.transform.matrix=m;}
  if(tick==5&&s.scenario=='move'){m=h.transform.matrix;m.a=1;h.transform.matrix=m;}
  if(tick==3&&s.scenario=='hurt')h.curAction='hurt';
  if(tick==3&&s.scenario=='effect-destroy')c.fx.destroy();
  if(tick==3&&s.scenario=='host-destroy')Object(h).destroy();
  gc.heroes=s.hostType=='hero'?[h]:[];if(s.scenario=='world-pause'){if(tick==3)c.game.stopGame();if(tick==cfg.pauseEnd+1)c.game.continueGame();}
  var paused:Boolean=s.scenario=='world-pause'&&tick>=3&&tick<=cfg.pauseEnd;
  if(!paused&&!h.isReadyToDestroy){var dead:Array=[];for each(var b:BaseBullet in h.magicBulletArray){if(!b.isReadyToDestroy)b.step2();if(b.isReadyToDestroy)dead.push(b);}Cleanup.clearWaitFromParentArray(dead,h.magicBulletArray);c.fx.step();}
  if(cfg.mutation=='freeze'){AUtils.stopAllChildren(c.world);}
  if(cfg.mutation=='advance'){advance(c.world);}
 }
}
private function afterFrame(e:Event):void{
 capture('exit-after-owner');
 if(tick==cfg.ticks){stage.removeEventListener(Event.ENTER_FRAME,onFrame);stage.removeEventListener(Event.EXIT_FRAME,afterFrame);var out:FileStream=new FileStream();out.open(new File(File.applicationDirectory.nativePath).resolvePath('measurement.json'),FileMode.WRITE);out.writeUTFBytes(JSON.stringify({runtime:Capabilities.version,fps:stage.frameRate,rows:rows}));out.close();trace('COMPLETE '+rows.length);NativeApplication.nativeApplication.exit(0);}
}
private function advance(d:DisplayObjectContainer):void{for(var i:int=0;i<d.numChildren;i++){var q:DisplayObject=d.getChildAt(i);if(q is MovieClip)MovieClip(q).nextFrame();if(q is DisplayObjectContainer)advance(DisplayObjectContainer(q));}}
private function capture(phase:String):void{
 for each(var c:Object in cases){
  var h:BaseObject=c.host,s:Object=c.spec,bs:Array=[],list:Array=[];
  for each(var b:BaseBullet in h.magicBulletArray)bs.push(b.snapshot());
  for each(var x:Object in c.fx.curEffectArray)list.push(x?{name:x.name,time:x.time,startTime:x.startTime,isFirst:x.isFirst,value:x.value}:null);
  var r:Object={id:s.id,tick:tick,phase:phase,count:c.fx.count,effects:list,bullets:bs,ready:h.isReadyToDestroy,direction:h.direction,hostMatrix:{a:h.transform.matrix.a,x:h.x,y:h.y},colipse:{width:h.colipse.width,height:h.colipse.height},display:NativeTree.tree(c.world,c.world,'root')};
  var bounds:Rectangle=c.world.getBounds(c.world),left:int=Math.floor(bounds.x)-2,top:int=Math.floor(bounds.y)-2;
  var width:int=Math.max(1,Math.ceil(bounds.right)-left+2),height:int=Math.max(1,Math.ceil(bounds.bottom)-top+2);
  var bmp:BitmapData=new BitmapData(width,height,true,0);bmp.draw(c.world,new Matrix(1,0,0,1,-left,-top));
  var path:String='baselines/'+s.id+'-'+tick+'-'+phase+'.png';var file:File=new File(File.applicationDirectory.nativePath).resolvePath(path);file.parent.createDirectory();var fs:FileStream=new FileStream();fs.open(file,FileMode.WRITE);fs.writeBytes(bmp.encode(bmp.rect,new PNGEncoderOptions(true)));fs.close();r.capture=path;r.crop={left:left,top:top,width:width,height:height};var vb:Rectangle=bmp.getColorBoundsRect(0xff000000,0,false);r.visibleBounds={x:vb.x+left,y:vb.y+top,width:vb.width,height:vb.height};bmp.dispose();rows.push(r);
 }
}
}}
