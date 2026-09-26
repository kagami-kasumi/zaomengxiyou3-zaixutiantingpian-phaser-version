package {
import flash.display.*;import flash.events.*;import flash.filesystem.*;
import flash.system.*;import flash.utils.*;import flash.geom.*;import flash.desktop.NativeApplication;
import com.greensock.TweenMax;
public class Probe extends Sprite {
private var paths:Array=SOURCE_PATHS,domains:Array=[],index:int=0,loader:Loader;
private var classes:Array=[PROFILE_CLASSES],ids:Array=PROFILE_IDS,contexts:Array=CONTEXTS;
private var profiles:Array=[],motion:Array=[],targetBounds:Object=TARGET_BOUNDS,environmentInputs:Array=ENVIRONMENTS,environmentMotion:Array=[];
public function Probe(){loaderInfo.uncaughtErrorEvents.addEventListener(UncaughtErrorEvent.UNCAUGHT_ERROR,function(e:UncaughtErrorEvent):void{trace('FAIL '+e.error);e.preventDefault();NativeApplication.nativeApplication.exit(1);});stage.scaleMode=StageScaleMode.NO_SCALE;stage.align=StageAlign.TOP_LEFT;load();}
private function load():void {
 loader=new Loader();loader.contentLoaderInfo.addEventListener(Event.COMPLETE,loaded);
 var f:FileStream=new FileStream();f.open(new File(paths[index]),FileMode.READ);var b:ByteArray=new ByteArray();f.readBytes(b);f.close();
 var c:LoaderContext=new LoaderContext(false,new ApplicationDomain(null));c.allowCodeImport=true;loader.loadBytes(b,c);
}
private function loaded(e:Event):void {
 domains.push(loader.contentLoaderInfo.applicationDomain);index++;if(index<paths.length){load();return;}
 AUtils.domain=domains[0];TweenMax.backend=domains[1].getDefinition('com.greensock.TweenMax') as Class;
 run();runEnvironments();var f:FileStream=new FileStream();f.open(new File(File.applicationDirectory.nativePath).resolvePath('rows.json'),FileMode.WRITE);
 f.writeUTFBytes(JSON.stringify({profiles:profiles,motion:motion,environmentInputs:environmentInputs,environmentMotion:environmentMotion}));f.close();trace('COMPLETE '+motion.length);NativeApplication.nativeApplication.exit();
}
private function body(w:Sprite,k:int,ctx:Array,fps:int):BaseMonster {
 Fixture.config={gameSence:w,curStage:ctx[0],curLevel:ctx[1],frameClips:fps,hero1:null,hero2:null,
 pWorld:{getWallArray:function():Array{return [];}},random:function():Number{return .5;},
 protectedPerproty:{setProperty:function(...v):void{},getProperty:function(...v):Boolean{return false;}}};
 var c:Class=classes[k];var p:BaseMonster=new c();w.addChild(p);return p;
}
private function state(p:BaseMonster):Array {return [p.x,p.y,p.speed.x,p.speed.y,!!p.standInObj,!!p.headInObj,!!p.leftInObj,!!p.rightInObj,p.curAction];}
private function run():void {
 var modes:Array=['air','floor','ceiling','left','right','through','through-up','through-down','screen-left','screen-left-equal','screen-right','screen-right-equal','stun','wait','dead','hit1','hit4','recover','unfreeze','hit1-floor','hit4-floor'];
 for(var k:int=0;k<ids.length;k++) for each(var ctx:Array in contexts) for each(var fps:int in [20,24,30]) {
  var w:Sprite=new Sprite();addChild(w);var p:BaseMonster=body(w,k,ctx,fps);
  var predicates:Object={};for each(var a:String in ['wait','hurt','dead','hit1','hit2','hit3','hit4']){p.curAction=a;predicates[a]=p.predicates();}
  profiles.push({monsterId:ids[k],stage:ctx[0],level:ctx[1],fps:fps,profile:p.profile(),boss:p.isBoss,predicates:predicates});removeChild(w);
 }
 // All twelve baseline classes, plus only the three stage-dependent movement variants.
 for(k=0;k<ids.length;k++) for each(var st:int in [1,9]) {
  if(st==9 && ids[k]!=9 && ids[k]!=10 && ids[k]!=19)continue;
  for each(fps in [20,24,30])for each(var mode:String in modes)for each(var dir:int in [-1,1])for each(var owner:int in [1,2])for each(var boss:Boolean in [false,true]) {
   w=new Sprite();w.x=-100;addChild(w);p=body(w,k,[st,1],fps);p.x=400;p.y=200;p.curAction='hurt';p.isBoss=boss;
   if(mode=='wait'||mode=='dead'||mode=='hit1'||mode=='hit4')p.curAction=mode;
   if(mode=='hit1-floor'||mode=='hit4-floor')p.curAction=mode.substr(0,4);
   if(mode=='stun'||mode=='unfreeze')p.curAddEffect={isAnyThingElseStun:function(v:String):Boolean{return true;},step:function():void{}};
   var walls:Array=[],wall:Wall=mode=='through'?new ThroughWall():new Wall();wall.graphics.beginFill(0);
   var fixed:Object=targetBounds[ids[k]];var b:Rectangle=new Rectangle(p.x+fixed.left,p.y+fixed.top,fixed.width,fixed.height);
   if(mode=='floor'||mode=='hit1-floor'||mode=='hit4-floor'||mode=='through'||mode=='through-up'||mode=='through-down')wall.graphics.drawRect(0,b.bottom+1,1000,30);
   if(mode=='ceiling')wall.graphics.drawRect(0,b.top-4,1000,2);
   if(mode=='left')wall.graphics.drawRect(b.left-4,0,2,500);
   if(mode=='right')wall.graphics.drawRect(b.right+2,0,2,500);
   if(mode.indexOf('screen')==0)p.x=100+(mode.indexOf('left')>=0?(mode.indexOf('equal')>=0?20:19):(mode.indexOf('equal')>=0?920:921));
   if(wall.width>0){w.addChild(wall);walls.push(wall);}
   if(mode.indexOf('through')==0){var marker:Sprite=new Sprite();marker.name=mode=='through'?'isThroughWall':mode=='through-up'?'isThroughUpButDownWall':'isThroughDownButUpWall';wall.addChild(marker);}
   p.gc.pWorld.getWallArray=function():Array{return walls;};
   TweenMax.last=null;p.setAttackBack(new Point(6*dir,-5));var tween:Object=TweenMax.last;
   if(tween){tween.pause();tween.renderTime(0,true,true);}
   var states:Array=[state(p)];
   for(var tick:int=1;tick<=24;tick++) {
    if(mode=='recover'&&tick==5)p.curAction='wait';
    if(mode=='unfreeze'&&tick==5)p.curAddEffect=null;
    if(tween)tween.renderTime(Math.min((tick-1)/fps,.4),true,false);
    p.step();p.postPhysics();states.push(state(p));
   }
   motion.push({monsterId:ids[k],stage:st,fps:fps,mode:mode,direction:dir,owner:owner,boss:boss,states:states});
   if(tween)tween.kill();removeChild(w);
  }
 }
}
private function runEnvironments():void {
 for(var k:int=0;k<ids.length;k++)for each(var env:Object in environmentInputs)for each(var anchor:Object in env.walls)
 for each(var fps:int in [20,24,30])for each(var dir:int in [-1,1]) {
  var w:Sprite=new Sprite();addChild(w);var p:BaseMonster=body(w,k,[int(env.level/10),env.level%10],fps);
  p.x=anchor.left+anchor.width/2;p.y=anchor.top-p.colipse.height/2-1;p.curAction='hurt';
  w.x=400-p.x;w.y=200-p.y;
  var walls:Array=[];
  for each(var source:Object in env.walls){var wall:Wall=source.throughClass?new ThroughWall():new Wall();
   wall.fixtureBounds=new Rectangle(source.left,source.top,source.width,source.height);
   for each(var markerName:String in source.markers){var marker:Sprite=new Sprite();marker.name=markerName;wall.addChild(marker);}
   w.addChild(wall);walls.push(wall);
  }
  p.gc.pWorld.getWallArray=function():Array{return walls;};
  TweenMax.last=null;p.setAttackBack(new Point(6*dir,-5));var tween:Object=TweenMax.last;
  if(tween){tween.pause();tween.renderTime(0,true,true);}var states:Array=[state(p)];
  for(var tick:int=1;tick<=24;tick++){if(tween)tween.renderTime(Math.min((tick-1)/fps,.4),true,false);p.step();p.postPhysics();states.push(state(p));}
  environmentMotion.push({monsterId:ids[k],level:env.level,wallId:anchor.id,fps:fps,direction:dir,worldOffset:[w.x,w.y],states:states});
  if(tween)tween.kill();removeChild(w);
 }
}

}}
