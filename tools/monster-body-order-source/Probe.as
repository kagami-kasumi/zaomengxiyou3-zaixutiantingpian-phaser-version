package {
import flash.display.*;import flash.events.*;import flash.system.*;import flash.utils.*;import flash.desktop.NativeApplication;
public class Probe extends Sprite{
 [Embed(source="source.swf",mimeType="application/octet-stream")]private var Bytes:Class;
 private var loader:Loader=new Loader(),rows:Array=[];
 public function Probe(){loaderInfo.uncaughtErrorEvents.addEventListener(UncaughtErrorEvent.UNCAUGHT_ERROR,function(e:UncaughtErrorEvent):void{trace('FAIL '+e.error);e.preventDefault();NativeApplication.nativeApplication.exit(1);});loader.contentLoaderInfo.addEventListener(Event.COMPLETE,loaded);var c:LoaderContext=new LoaderContext(false,new ApplicationDomain());c.allowCodeImport=true;loader.loadBytes(new Bytes() as ByteArray,c);}
 private function loaded(e:Event):void{AUtils.clipClass=loader.contentLoaderInfo.applicationDomain.getDefinition('Monster30Bullet1') as Class;trace('ENV '+Capabilities.version);
 for each(var fps:int in [20,24,30])for each(var name:String in ['natural','lethal-first','nonlethal-first','hurt-after','dead-after','destroy-after','frozen-before','thaw','freeze-first','pause-after','redraw','low-level-pause','dead-before','destroy-before','hurt-cut'])run(fps,name);
 trace('ROWS '+JSON.stringify(rows));trace('COMPLETE');NativeApplication.nativeApplication.exit(0);}
 private function run(fps:int,name:String):void{
 Config.instance=new Config();Config.instance.frameClips=fps;Config.hits=[];BaseBullet.serial=0;
 var m:MonsterProbe=new MonsterProbe();m.x=300;m.y=200;Config.instance.gameSence.addChild(m);
 var ice:Sprite=new Sprite();ice.name='PetHorseIceEffect';m.addChild(ice);
 var target:BaseHero=new BaseHero();target.id='target';Config.instance.targets=[target];
 var world:WorldProbe=new WorldProbe();world.monsterArray=[m];var all:Array=[],states:Array=[],ages:Object={};
 if(name=='dead-before')m.reduceHp(100);if(name=='destroy-before')m.destroy();
 if(name=='frozen-before'||name=='thaw')m.curAddEffect.show_pethorse_ice();
 for(var t:int=1;t<=18;t++){
  Config.tick=t;
  if(t==1){if(name=='lethal-first')m.curAddEffect.damage=100;if(name=='nonlethal-first')m.curAddEffect.damage=1;if(name=='freeze-first')m.curAddEffect.ice='show';}
  if(t==2){if(name=='hurt-cut'){for each(var cut:BaseBullet in all)cut.setHurtCanCutDownEffect(true);m.reduceHp(1,true);}if(name=='hurt-after')m.reduceHp(1,true);if(name=='dead-after')m.reduceHp(100);if(name=='destroy-after')m.destroy();if(name=='thaw')m.curAddEffect.ice='hide';}
  var paused:Boolean=name=='pause-after'&&t>=3&&t<=5;
  Config.instance.isStopGame=name=='low-level-pause'&&t>=3&&t<=5;
  for each(var old:BaseBullet in all){if(!old.isReadyToDestroy&&!paused&&!Config.instance.isStopGame){ages[old.uid]++;old.inspectFrame(Math.min(10,ages[old.uid]));}}
  if(!paused)world.step();
  if(m.magicBulletArray)for each(var b:BaseBullet in m.magicBulletArray){if(all.indexOf(b)<0){all.push(b);ages[b.uid]=1;}}
  if(name=='redraw'){m.bbdc.refreshCurFrame();m.bbdc.refreshCurFrame();}
  var bullets:Array=[];for each(var o:BaseBullet in all)bullets.push(o.inspect());
  states.push({tick:t,action:m.curAction,hp:m.hp,ready:m.isReadyToDestroy,hold:m.bbdc.getCurFrameCount(),frozen:m.bbdc.isStopFrame,created:BaseBullet.serial,enrolled:m.magicBulletArray?m.magicBulletArray.length:0,bullets:bullets,hits:Config.hits.length,paused:paused});
  m.x+=1;
 }
 rows.push({fps:fps,scenario:name,states:states,hits:Config.hits});
 }
}}
