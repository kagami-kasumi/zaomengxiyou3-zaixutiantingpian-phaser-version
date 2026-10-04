package {
import flash.display.*;import flash.events.*;import flash.filesystem.*;import flash.system.*;import flash.utils.*;
import flash.desktop.NativeApplication;import com.greensock.TweenMax;
public class Probe extends Sprite {
private var library:Loader=new Loader(),shapes:Loader=new Loader(),lite:Class,shapeClass:Class;
private var rows:Array=[],heroes:Array=[],source:MonsterProbe,world:WorldProbe,main:MainGameProbe,gc:ConfigProbe;
private var fps:int,owner:int,mode:String,tick:int,nativeMode:Boolean=false,queue:Array=[],active:Boolean=false,sampleSlot:int=0;
public function Probe(){
 loaderInfo.uncaughtErrorEvents.addEventListener(UncaughtErrorEvent.UNCAUGHT_ERROR,function(e:UncaughtErrorEvent):void{trace('FAIL '+e.error+' '+(e.error is Error?Error(e.error).getStackTrace():''));e.preventDefault();NativeApplication.nativeApplication.exit(1);});
 library.contentLoaderInfo.addEventListener(Event.COMPLETE,libReady);load(library,'main-library.swf');
}
private function load(l:Loader,path:String):void{var f:FileStream=new FileStream(),b:ByteArray=new ByteArray();f.open(File.applicationDirectory.resolvePath(path),FileMode.READ);f.readBytes(b);f.close();var c:LoaderContext=new LoaderContext(false,new ApplicationDomain(null));c.allowCodeImport=true;l.loadBytes(b,c);}
private function libReady(e:Event):void{
 TweenMax.backend=library.contentLoaderInfo.applicationDomain.getDefinition('com.greensock.TweenMax') as Class;
 lite=library.contentLoaderInfo.applicationDomain.getDefinition('com.greensock.TweenLite') as Class;
 // Original map's earlier tween initialization; no approximation of its engine.
 TweenMax.backend.to({alpha:0},0.4,{alpha:1});
 shapes.contentLoaderInfo.addEventListener(Event.COMPLETE,ready);load(shapes,'stage-common.swf');
}
private function ready(e:Event):void{
 shapeClass=shapes.contentLoaderInfo.applicationDomain.getDefinition('ObjectBaseSprite') as Class;
 for each(var f:int in [20,24,30])for each(var o:int in [1,2,3])
 for each(var m:String in ['still','move','gravity','screen-left','screen-right','wall','pause','overwrite','hero-dead','hero-destroy','source-destroy','scene-exit']){
  setup(f,o,m);for(tick=0;tick<=fps*2;tick++){if(tick)lite.rootTimeline.renderTime(tick/fps,false,false);events();if(!gc.isStopGame&&main.root)main.manual();record('world');}dispose();
 }
 trace('CONTROLLED_COMPLETE');
 nativeMode=true;TweenMax.observe=function(h:Object):void{sampleSlot=h.slot;if(active)record('tween');sampleSlot=0;};
 for each(f in [20,24,30])for each(o in [1,2,3])queue.push({fps:f,owner:o});
 stage.addEventListener(Event.ENTER_FRAME,frame);stage.addEventListener(Event.EXIT_FRAME,exitFrame);next();
}
private function setup(f:int,o:int,m:String):void{
 TweenMax.backend.killAll(false);TweenMax.tracks=[];if(!nativeMode)lite.rootTimeline.renderTime(0,false,false);fps=f;owner=o;mode=m;tick=0;
 gc=new ConfigProbe();gc.gameSence=new MovieClip();addChild(gc.gameSence);
 gc.isStopGame=false;gc.isSingleGame=function():Boolean{return true;};gc.isInSea=function():Boolean{return false;};gc.sendPosition=function(h:Object):void{};
 gc.protectedPerproty={setProperty:function(...a):void{},removeProperty:function(...a):void{}};
 gc.keyboardControl={stopKeyboardControl:function():void{},continueKeyboardControl:function():void{},destroy:function():void{},getZeroKeyArray:function():Array{return [];}};
 gc.destroyGame=function():void{};gc.gameSence['destroy']=function():void{};
 gc.gameInfo={step:function():void{},destroy:function():void{}};gc.bg1={destroy:function():void{}};gc.vControllor={step:function():void{},destroy:function():void{}};
 world=new WorldProbe();world.gc=gc;gc.pWorld=world;
 heroes=[];
 for each(var slot:int in o==3?[1,2]:[o]){
  var h:BaseHero=new BaseHero();h.gc=gc;h.slot=slot;h.name=String(slot);h.x=slot==1?100:700;h.y=slot==1?300:180;
  h.colipse=new shapeClass();h.colipse.scaleX=1.2;h.addChild(h.colipse);h['hp']=100;
  h.roleProperies=stats(h);h.horizenSpeed=5;h.graity=m=='gravity'?1.5:0;
  if(m=='move'||m=='native'){h.isRight=slot==1;h.isLeft=slot==2;}
  if(m=='screen-left')h.x=10;if(m=='screen-right')h.x=930;
  heroes.push(h);world.heroArray.push(h);gc.gameSence.addChild(h);if(slot==1)gc.hero1=h;else gc.hero2=h;
 }
 if(m=='wall'){var wall:Wall=new Wall();wall.graphics.beginFill(0);wall.graphics.drawRect(-1000,0,3000,30);wall.graphics.endFill();wall.y=290;gc.gameSence.addChild(wall);world.wallArray.push(wall);for each(h in heroes){h.y=260;h.speed.y=10;}}
 source=new MonsterProbe();source.gc=gc;source.x=400;source.y=300;gc.gameSence.addChild(source);world.monsterArray.push(source);
 source.tickAction=function():void{if(tick==1)source.doHi2(0);};
 main=new MainGameProbe();main.gc=gc;main.root=new Sprite();addChild(main.root);
 main.onStep=function():void{if(nativeMode)record('world');};
}
private function stats(h:BaseHero):Object{return {getHHP:function():Number{return h['hp'];},getMMP:function():Number{return 100;}};}
private function events():void{
 var at:int=int(fps/4),resume:int=int(fps*3/4);
 if(tick==at){
  if(mode=='pause'||mode=='native')main.stopGame();
  if(mode=='overwrite'){source.x=600;source.y=200;source.doHi2(1);}
  if(mode=='hero-dead')for each(var h:BaseHero in heroes){h['hp']=0;h.curAction='dead';h.setStatic();}
  if(mode=='hero-destroy')for each(h in heroes)h.destroy();
  if(mode=='source-destroy')source.destroy();
  if(mode=='scene-exit')main.destroyGame();
 }
 if((mode=='pause'||mode=='native')&&tick==resume)main.continueGame();
 if(mode=='native'){
  if(tick==fps*2){source.x=600;source.y=200;source.doHi2(1);}
  if(tick==fps*2+1){source.x=650;source.y=230;source.doHi2(0);}
  if(tick==fps*2+2){heroes[0]['hp']=0;heroes[0].curAction='dead';heroes[0].setStatic();}
  if(tick==fps*2+4)source.destroy();
  if(tick==fps*2+6)heroes[0].destroy();
  if(tick==fps*4)main.destroyGame();
 }
}
private function record(phase:String):void{
 var positions:Array=[];for each(var h:BaseHero in heroes)positions.push({slot:h.slot,x:h.x,y:h.y,vx:h.speed.x,vy:h.speed.y,dead:h.isDead(),ready:h.isReadyToDestroy,parent:h.parent!=null});
 var tweens:Array=[];for each(var tr:Object in TweenMax.tracks){var tw:Object=tr.tween,props:Object={},pt:Object=tw.cachedPT1;while(pt){props[pt.property]={start:pt.start,change:pt.change};pt=pt.nextNode;}tweens.push({slot:tr.target.slot,time:tw.cachedTime,startTime:tw.cachedStartTime,paused:tw.cachedPaused,gc:tw.gc,initted:tw.initted,ratio:tw.ratio,props:props,endX:tr.endX,endY:tr.endY});}
 rows.push({native:nativeMode,fps:fps,owner:owner,mode:mode,tick:tick,phase:phase,sampleSlot:sampleSlot,ms:nativeMode?getTimer():0,time:lite.rootTimeline.cachedTime,paused:gc.isStopGame,sourceReady:source.isReadyToDestroy,sourceParent:source.parent!=null,worldHeroes:world.heroArray.length,worldMonsters:world.monsterArray.length,registered:main.root!=null&&main.root.hasEventListener(Event.ENTER_FRAME),positions:positions,tweens:tweens});
}
private function dispose():void{if(main.root){main.stopGame();if(main.root.parent)main.root.parent.removeChild(main.root);}TweenMax.backend.killAll(false);if(gc.gameSence.parent)gc.gameSence.parent.removeChild(gc.gameSence);}
private function next():void{
 if(!queue.length){for each(var row:Object in rows)trace('ROW '+JSON.stringify(row));trace('RUNTIME '+Capabilities.version);trace('COMPLETE');NativeApplication.nativeApplication.exit();return;}
 var item:Object=queue.shift();setup(item.fps,item.owner,'native');stage.frameRate=fps;main.start();active=true;
}
private function frame(e:Event):void{if(!active)return;++tick;events();}
private function exitFrame(e:Event):void{if(!active)return;record('exit');if(tick>=fps*4+6){active=false;dispose();next();}}
}
}
