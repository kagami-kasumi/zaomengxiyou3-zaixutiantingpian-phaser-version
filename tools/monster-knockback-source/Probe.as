package {
import flash.display.*;import flash.events.*;import flash.filesystem.*;
import flash.system.*;import flash.utils.*;import flash.geom.*;import flash.desktop.NativeApplication;
import com.greensock.TweenMax;import com.greensock.easing.Cubic;
public class Probe extends Sprite {
private var paths:Array=SOURCE_PATHS,domains:Array=[],index:int=0,loader:Loader,rows:Array=[];
public function Probe(){loaderInfo.uncaughtErrorEvents.addEventListener(UncaughtErrorEvent.UNCAUGHT_ERROR,function(e:UncaughtErrorEvent):void{trace('FAIL '+e.error);e.preventDefault();NativeApplication.nativeApplication.exit(1);});stage.scaleMode=StageScaleMode.NO_SCALE;stage.align=StageAlign.TOP_LEFT;load();}
private function load():void {
 loader=new Loader();loader.contentLoaderInfo.addEventListener(Event.COMPLETE,loaded);
 var f:FileStream=new FileStream();f.open(new File(paths[index]),FileMode.READ);
 var b:ByteArray=new ByteArray();f.readBytes(b);f.close();
 var c:LoaderContext=new LoaderContext(false,new ApplicationDomain(null));c.allowCodeImport=true;loader.loadBytes(b,c);
}
private function loaded(e:Event):void {
 domains.push(loader.contentLoaderInfo.applicationDomain);index++;
 if(index<paths.length){load();return;}
 TweenMax.backend=domains[1].getDefinition('com.greensock.TweenMax') as Class;

 directions();motions();repeats();gates();dedup();schedule();setTimeout(natural,100);
}
private function finish():void {
 var f:FileStream=new FileStream();f.open(new File(File.applicationDirectory.nativePath).resolvePath('rows.json'),FileMode.WRITE);
 f.writeUTFBytes(JSON.stringify(rows));f.close();trace('COMPLETE '+rows.length);NativeApplication.nativeApplication.exit();
}
private function body(world:Sprite,shape:String):BaseMonster {
 var p:BaseMonster=new BaseMonster();world.addChild(p);
 var c:Class=domains[0].getDefinition(shape) as Class;p.colipse=new c() as Sprite;p.addChild(p.colipse);
 p.gc={gameSence:world,pWorld:{getWallArray:function():Array{return [];}},random:function():Number{return .5;},protectedPerproty:{setProperty:function(...v):void{},getProperty:function(...v):Boolean{return false;}}};
 return p;
}
private function snapshot(p:BaseMonster):Object {
 var b:Rectangle=p.colipse.getBounds(p);var g:Point=p.gc.gameSence.localToGlobal(new Point(p.x,p.y));
 return {x:p.x,y:p.y,vx:p.speed.x,vy:p.speed.y,left:p.isLeft,right:p.isRight,action:p.curAction,
 standing:!!p.standInObj,head:!!p.headInObj,wallLeft:!!p.leftInObj,wallRight:!!p.rightInObj,
 stageX:g.x,stageY:g.y,collider:{x:b.x,y:b.y,width:b.width,height:b.height}};
}
private function directions():void {
 var classes:Array=[BaseBullet,EnemyMoveBullet,EnemyMoveBullet1,EnemyMoveBullet2,S_ShapeMoveBullet,FastAndSlowBullet,SpecialEffectBullet,FollowBaseObjectBullet];
 var w:Sprite=new Sprite();addChild(w);var p:BaseMonster=body(w,'ObjectBaseSprite');
 for(var kind:int=0;kind<classes.length;kind++)for each(var x:Number in [-6,0,6])
 for each(var v:Number in [-1,0,1])for each(var d:int in [-1,1])for each(var relative:int in [-1,0,1]) {
  var c:Class=classes[kind];var b:BaseBullet=new c();b.speed.x=v;b.direct=d;p.x=relative;
  var q:Point=p.direction(b,{attackBackSpeed:[x,-5]});
  rows.push({type:'direction',kind:kind,inputX:x,bulletSpeed:v,direct:d,relative:relative,x:q.x,y:q.y});
 }
 var nil:Point=p.direction(new BaseBullet(),null);rows.push({type:'null-config',x:nil.x,y:nil.y});removeChild(w);
}
private function motions():void {
 for each(var shape:String in ['ObjectBaseSprite','ObjectBaseSprite2','ObjectBaseSprite7'])
 for each(var fps:int in [20,24,30])for each(var boss:Boolean in [false,true])
 for each(var owner:int in [1,2])for each(var mode:String in ['air','floor','ceiling','left','right','through','through-up','through-down','screen-left','screen-left-equal','screen-right','screen-right-equal','stun','wait','dead'])
 for each(var dir:int in [-1,1]) {
  var w:Sprite=new Sprite();w.x=-100;addChild(w);var p:BaseMonster=body(w,shape);p.x=400;p.y=200;p.isBoss=boss;p.isFly=shape=='ObjectBaseSprite7';
  if(mode=='wait'||mode=='dead')p.curAction=mode;
  if(mode=='stun')p.curAddEffect={isAnyThingElseStun:function(v:String):Boolean{return true;},step:function():void{}};
  var walls:Array=[];var wall:Wall=mode=='through'?new ThroughWall():new Wall();wall.graphics.beginFill(0);
  var b:Rectangle=p.colipse.getBounds(w);
  if(mode=='floor'||mode=='through'||mode=='through-up'||mode=='through-down')wall.graphics.drawRect(0,b.bottom+1,1000,30);
  if(mode=='ceiling')wall.graphics.drawRect(0,b.top-4,1000,2);
  if(mode=='left')wall.graphics.drawRect(b.left-4,0,2,500);
  if(mode=='right')wall.graphics.drawRect(b.right+2,0,2,500);
  if(mode.indexOf('screen')==0)p.x=100+(mode.indexOf('left')>=0?(mode.indexOf('equal')>=0?20:19):(mode.indexOf('equal')>=0?920:921));
  if(wall.width>0){w.addChild(wall);walls.push(wall);}
  if(mode.indexOf('through')==0){var marker:Sprite=new Sprite();marker.name=mode=='through'?'isThroughWall':mode=='through-up'?'isThroughUpButDownWall':'isThroughDownButUpWall';wall.addChild(marker);}
  p.gc.pWorld.getWallArray=function():Array{return walls;};
  var id:String=[shape,fps,boss,owner,mode,dir].join('/');
  TweenMax.last=null;p.setAttackBack(new Point(6*dir,-5));var tween:Object=TweenMax.last;
  if(tween){tween.pause();tween.renderTime(0,true,true);}
  rows.push({type:'motion',id:id,shape:shape,fps:fps,boss:boss,owner:owner,mode:mode,dir:dir,tick:0,state:snapshot(p)});
  for(var tick:int=1;tick<=24;tick++) {
   if(tween)tween.renderTime(Math.min((tick-1)/fps,.4),true,true);
   p.step();p.postPhysics();
   rows.push({type:'motion',id:id,shape:shape,fps:fps,boss:boss,owner:owner,mode:mode,dir:dir,tick:tick,state:snapshot(p)});
  }
  if(tween)tween.kill();removeChild(w);
 }
}
private function repeats():void {
 for each(var mode:String in ['replace','edge-return','zero']){
  var w:Sprite=new Sprite();addChild(w);var p:BaseMonster=body(w,'ObjectBaseSprite');p.x=300;p.y=200;
  p.setAttackBack(new Point(6,-5));var first:Object=TweenMax.last;first.pause();first.renderTime(.1,true,true);
  rows.push({type:'repeat',mode:mode,phase:'old',state:snapshot(p)});
  if(mode=='edge-return')p.x=19;
  p.setAttackBack(new Point(mode=='zero'?0:-3,-2));var second:Object=TweenMax.last;
  rows.push({type:'repeat',mode:mode,phase:'write',state:snapshot(p)});
  if(second!=first){second.pause();second.renderTime(.001,true,true);}
  first.renderTime(.2,true,true);
  rows.push({type:'repeat',mode:mode,phase:'old-render',state:snapshot(p)});
  if(second!=first)second.renderTime(.2,true,true);
  rows.push({type:'repeat',mode:mode,phase:'new-render',state:snapshot(p)});
  first.kill();if(second!=first)second.kill();removeChild(w);
 }
}
private function gates():void {
 for each(var owner:int in [1,2])for each(var mode:String in ['hit','protected','dodge','geometry-miss','forced','null-config','excluded-hero-bullet']){
  var w:Sprite=new Sprite();addChild(w);var p:BaseMonster=body(w,'ObjectBaseSprite');p.x=300;p.y=200;
  var b:BaseBullet=new SpecialEffectBullet();b.sourceRole=new BaseObject();b.sourceRole.x=owner==1?200:400;b.direct=owner==1?1:-1;
  if(mode=='protected')p.gc.protectedPerproty.getProperty=function(...v):Boolean{return true;};
  p.protectedParamsObject.Dodge=mode=='dodge'?100:0;HitTest.accept=mode!='geometry-miss'&&mode!='forced';
  if(mode=='null-config')b.sourceRoleAttackInfoObject=null;
  if(mode=='excluded-hero-bullet')b.img='Role1Bullet12';
  TweenMax.last=null;var ok:Boolean=p.beMagicAttack(b,BaseObject(b.sourceRole),mode=='forced');
  rows.push({type:'gate',owner:owner,mode:mode,accepted:ok,misses:p.misses,ids:p.beAttackIdArray.concat(),state:snapshot(p)});
  if(TweenMax.last)TweenMax.last.kill();removeChild(w);
 }
 HitTest.accept=true;
}
private function dedup():void {
 for each(var mode:String in ['same','different','protected-then-hit','dodge-then-hit']){
  var w:Sprite=new Sprite();addChild(w);var p:BaseMonster=body(w,'ObjectBaseSprite');p.x=300;p.y=200;
  var b:BaseBullet=new SpecialEffectBullet();
  if(mode=='protected-then-hit')p.gc.protectedPerproty.getProperty=function(...v):Boolean{return true;};
  if(mode=='dodge-then-hit')p.protectedParamsObject.Dodge=100;
  b.attempt(p);if(TweenMax.last)TweenMax.last.kill();p.speed.x=77;
  if(mode=='different')b.id='new';
  p.gc.protectedPerproty.getProperty=function(...v):Boolean{return false;};p.protectedParamsObject.Dodge=0;
  b.attempt(p);
  rows.push({type:'dedup',mode:mode,refresh:b.refreshCount,ids:p.beAttackIdArray.concat(),state:snapshot(p)});
  if(TweenMax.last)TweenMax.last.kill();removeChild(w);
 }
}
private function schedule():void {
 var w:Sprite=new Sprite();addChild(w);var p:BaseMonster=body(w,'ObjectBaseSprite');p.x=300;p.y=200;
 var world:WorldProbe=new WorldProbe();world.gc={gameInfo:null,vControllor:{step:function():void{}}};world.monsterArray=[p];
 var b:BaseBullet=new SpecialEffectBullet();world.heroArray=[{isReadyToDestroy:false,magicBulletArray:[],step:function():void{b.attempt(p);}}];
 rows.push({type:'schedule',tick:0,state:snapshot(p)});
 for(var tick:int=1;tick<=3;tick++) {world.step();if(TweenMax.last){TweenMax.last.pause();TweenMax.last.renderTime(0,true,true);}rows.push({type:'schedule',tick:tick,state:snapshot(p)});}
 if(TweenMax.last)TweenMax.last.kill();removeChild(w);
}
private function natural():void {
 var cases:Array=[];stage.frameRate=24;
 for each(var mode:String in ['replace','edge-return','zero']){
  var w:Sprite=new Sprite();addChild(w);var p:BaseMonster=body(w,'ObjectBaseSprite');p.x=300;p.y=200;
  p.setAttackBack(new Point(6,-5));cases.push({mode:mode,body:p,world:w,changed:false});
 }
 var start:int=getTimer();
 var callback:Function=function(e:Event):void {
  var elapsed:Number=(getTimer()-start)/1000;
  for each(var c:Object in cases){
   var target:BaseMonster=c.body;
   if(!c.changed&&elapsed>=.1){if(c.mode=='edge-return')target.x=19;target.setAttackBack(new Point(c.mode=='zero'?0:-3,-2));c.changed=true;}
   rows.push({type:'natural-tween',mode:c.mode,elapsed:elapsed,changed:c.changed,state:snapshot(target)});
  }
  if(elapsed>=.65){stage.removeEventListener(Event.ENTER_FRAME,callback);finish();}
 };
 stage.addEventListener(Event.ENTER_FRAME,callback);
}
}}



