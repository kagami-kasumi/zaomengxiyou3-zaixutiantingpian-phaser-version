package {
import flash.display.*;import flash.events.*;import flash.system.*;import flash.utils.*;import flash.desktop.NativeApplication;import flash.filesystem.*;
public class Probe extends Sprite{
 [Embed(source="source.swf",mimeType="application/octet-stream")]private var Bytes:Class;
 private var loader:Loader=new Loader(),rows:Array=[];
 public function Probe(){loaderInfo.uncaughtErrorEvents.addEventListener(UncaughtErrorEvent.UNCAUGHT_ERROR,function(e:UncaughtErrorEvent):void{trace('FAIL '+e.error+' '+e.error.getStackTrace());e.preventDefault();NativeApplication.nativeApplication.exit(1);});loader.contentLoaderInfo.addEventListener(Event.COMPLETE,loaded);var c:LoaderContext=new LoaderContext(false,new ApplicationDomain());c.allowCodeImport=true;loader.loadBytes(new Bytes() as ByteArray,c);}
 private function loaded(e:Event):void{
  for each(var symbol:String in ['Monster3Bullet1','Monster3Bullet2'])AUtils.classes[symbol]=loader.contentLoaderInfo.applicationDomain.getDefinition(symbol) as Class;
  trace('ENV '+Capabilities.version);
  for each(var fps:int in [20,24,30])for each(var boss:Boolean in [false,true])for each(var direct:int in [0,1])for each(var owner:String in ['p1','p2','both']){
   for each(var name:String in ['natural','normal','distance199','distance200','distance201','vertical','normal149','normal150','normal151','cd1','busy1','busy2','hurt','dead','ready','ice','thaw','pause','no-target','acquire','target-dead','target-ready','walk','afterHurt','equal-x'])run(fps,boss,direct,owner,name,0,0);
   for each(var difficulty:int in [0,1,2])for each(var roll:Number in [0.366,0.3661,0.423,0.4231,0.85,0.8501,0.89,0.8901])run(fps,boss,direct,owner,'rate',difficulty,roll);
  }
  var f:FileStream=new FileStream();f.open(new File(File.applicationDirectory.nativePath+'/rows.json'),FileMode.WRITE);f.writeUTFBytes(JSON.stringify(rows));f.close();trace('COMPLETE');NativeApplication.nativeApplication.exit(0);
 }
 private function run(fps:int,boss:Boolean,direct:int,owner:String,name:String,difficulty:int,roll:Number):void{
  var gc:Config=new Config();Config.instance=gc;gc.frameClips=fps;gc.curStage=1;gc.curLevel=boss?1:3;gc.difficulity=difficulty;gc.roll=roll;Config.hits=[];Config.attempts=[];BaseBullet.serial=0;
  var m:MonsterProbe=new MonsterProbe();m.x=300;m.y=200;m.bbdc.direction=direct;gc.gameSence.addChild(m);m.added();
  var init:Object=m.inspect(),x:Number=100,y:Number=0;
  if(name.indexOf('distance')==0)x=Number(name.substr(8));if(name=='vertical'){x=150;y=150;}
  if(name.indexOf('normal1')==0){x=Number(name.substr(6));y=250;}if(name=='equal-x'){x=0;y=250;}
  var targets:Array=[];
  for each(var who:String in (owner=='both'?['p1','p2']:[owner])){var h:BaseHero=new BaseHero();h.id=who;h.x=m.x+(direct==0?-x:x);h.y=m.y+y;h.pet=new BasePet();h.pet.id=who+'-pet';targets.push(h);if(who=='p1')gc.hero1=h;else gc.hero2=h;}
  gc.targets=targets;gc.pWorld.heroArray=targets;
  if(name!='no-target'&&name!='acquire')m.curAttackTarget=targets[0];if(name=='no-target'){gc.hero1=null;gc.hero2=null;}
  if(name=='normal'||name.indexOf('normal1')==0||name=='rate'||name=='equal-x')m.skillCD1[0]=fps*20;
  else if(name!='natural')m.skillCD1[0]=name=='cd1'?1:0;
  if(['busy1','busy2','hurt','dead','ready','ice','no-target','afterHurt'].indexOf(name)>=0)m.skillCD1[0]=fps*2;
  if(name=='thaw')m.skillCD1[0]=1;
  if(name!='natural')m.count=fps-1;
  if(name=='busy1')m.setAction('hit1');if(name=='busy2')m.setAction('hit2');
  if(name=='hurt')m.setAction('hurt');if(name=='walk')m.setAction('walk');if(name=='afterHurt')m.curAction='afterHurt';
  if(name=='dead'){m.hp=0;m.setAction('dead');}if(name=='ready')m.isReadyToDestroy=true;
  if(name=='target-dead')targets[0].hp=0;if(name=='target-ready')targets[0].isReadyToDestroy=true;
  var ice:Sprite=new Sprite();ice.name='PetHorseIceEffect';m.addChild(ice);
  if(name=='ice'||name=='thaw'){m.curAddEffect.blocked=true;m.curAddEffect.show_pethorse_ice();}
  // Opposing initial direction tests that skill1 does not implicitly face its target.
  if(name=='distance199')m.bbdc.direction=1-direct;
  var world:WorldProbe=new WorldProbe();world.monsterArray=[m];var states:Array=[],all:Array=[],ages:Object={};
  var length:int=(name=='natural'||name=='normal'||name=='pause')?fps*8:4;
  for(var t:int=1;t<=length;t++){
   Config.tick=t;gc.randomCalls=[];gc.order=[];
   if(name=='thaw'&&t==2)m.curAddEffect.ice='hide';
   var paused:Boolean=name=='pause'&&t>=3&&t<=5;
   var before:Object=m.inspect();Config.bodyState=null;
   for each(var old:BaseBullet in all)if(!old.isReadyToDestroy&&!paused){old.inspectFrame(Math.min(old.total(),ages[old.uid]+1));ages[old.uid]++;}
   if(!paused)world.step();
   if(m.magicBulletArray)for each(var b:BaseBullet in m.magicBulletArray)if(all.indexOf(b)<0){all.push(b);ages[b.uid]=0;}
   var bullets:Array=[];for each(var bullet:BaseBullet in all)bullets.push(bullet.inspect());
   states.push({tick:t,paused:paused,before:before,body:Config.bodyState,after:m.inspect(),random:gc.randomCalls.concat(),order:gc.order.concat(),bullets:bullets});
  }
  rows.push({fps:fps,boss:boss,direct:direct,owner:owner,scenario:name,difficulty:difficulty,roll:roll,x:x,y:y,init:init,states:states,hits:Config.hits,attempts:Config.attempts});
 }
}}
