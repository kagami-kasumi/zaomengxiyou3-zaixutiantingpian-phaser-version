package {
import flash.display.*;import flash.events.*;import flash.system.*;import flash.utils.*;import flash.desktop.NativeApplication;
public class Probe extends Sprite{
 [Embed(source="source.swf",mimeType="application/octet-stream")]private var Bytes:Class;
 private var loader:Loader=new Loader(),rows:Array=[];
 public function Probe(){loaderInfo.uncaughtErrorEvents.addEventListener(UncaughtErrorEvent.UNCAUGHT_ERROR,function(e:UncaughtErrorEvent):void{trace('FAIL '+e.error);e.preventDefault();NativeApplication.nativeApplication.exit(1);});loader.contentLoaderInfo.addEventListener(Event.COMPLETE,loaded);var c:LoaderContext=new LoaderContext(false,new ApplicationDomain());c.allowCodeImport=true;loader.loadBytes(new Bytes() as ByteArray,c);}
 private function loaded(e:Event):void{
  for each(var symbol:String in ['Monster3Bullet1','Monster3Bullet2'])AUtils.classes[symbol]=loader.contentLoaderInfo.applicationDomain.getDefinition(symbol) as Class;
  trace('ENV '+Capabilities.version);
  for each(var fps:int in [20,24,30])for each(var action:String in ['hit1','hit2'])for each(var direct:int in [0,1])for each(var owner:String in ['p1','p2','both'])
   for each(var name:String in ['natural','lethal-emission','nonlethal-emission','hurt-after','dead-after','destroy-after','frozen-before','thaw','freeze-emission','pause-after','redraw','low-level-pause','dead-before','destroy-before','hurt-cut','repeat-action','hurt-before','target-reject'])run(fps,action,direct,owner,name);
  trace('ROWS '+JSON.stringify(rows));trace('COMPLETE');NativeApplication.nativeApplication.exit(0);
 }
 private function run(fps:int,action:String,direct:int,owner:String,name:String):void{
  Config.instance=new Config();Config.instance.frameClips=fps;Config.hits=[];Config.attempts=[];Config.accept=name!='target-reject';BaseBullet.serial=0;
  var m:MonsterProbe=new MonsterProbe(action,direct,owner=='p1');m.x=300;m.y=200;Config.instance.gameSence.addChild(m);
  var door:Sprite=new Sprite();door.visible=false;Config.instance.doors=[door];
  var ice:Sprite=new Sprite();ice.name='PetHorseIceEffect';m.addChild(ice);
  for each(var who:String in (owner=='both'?['p1','p2']:[owner])){var hero:BaseHero=new BaseHero();hero.id=who;hero.pet=new BasePet();hero.pet.id=who+'-pet';Config.instance.targets.push(hero);}
  var world:WorldProbe=new WorldProbe();world.monsterArray=[m];var all:Array=[],states:Array=[],ages:Object={};
  var birth:int=action=='hit1'?7:6;
  if(name=='dead-before')m.reduceHp(100);if(name=='destroy-before')m.destroy();if(name=='hurt-before')m.reduceHp(1,true);
  if(name=='frozen-before'||name=='thaw')m.curAddEffect.show_pethorse_ice();
  for(var t:int=1;t<=70;t++){
   Config.tick=t;
   if(t==birth){if(name=='lethal-emission')m.curAddEffect.damage=100;if(name=='nonlethal-emission')m.curAddEffect.damage=1;if(name=='freeze-emission')m.curAddEffect.ice='show';}
   if(t==birth+1){if(name=='hurt-cut'){for each(var cut:BaseBullet in all)cut.setHurtCanCutDownEffect(true);m.reduceHp(1,true);}if(name=='hurt-after')m.reduceHp(1,true);if(name=='dead-after')m.reduceHp(100);if(name=='destroy-after')m.destroy();}
   if(t==2&&name=='thaw')m.curAddEffect.ice='hide';
   if(t==40&&name=='repeat-action')m.setAction(action);
   var paused:Boolean=name=='pause-after'&&t>=birth+2&&t<=birth+4;
   Config.instance.isStopGame=name=='low-level-pause'&&t>=birth+2&&t<=birth+4;
   for each(var old:BaseBullet in all){if(!old.isReadyToDestroy&&!paused&&!Config.instance.isStopGame){ages[old.uid]++;old.inspectFrame(Math.min(old.total(),ages[old.uid]));}}
   if(!paused)world.step();
   if(m.magicBulletArray)for each(var b:BaseBullet in m.magicBulletArray){if(all.indexOf(b)<0){all.push(b);ages[b.uid]=1;}}
   if(name=='redraw'){m.bbdc.refreshCurFrame();m.bbdc.refreshCurFrame();}
   var bullets:Array=[];for each(var o:BaseBullet in all)bullets.push(o.inspect());
   states.push({tick:t,action:m.curAction,hp:m.hp,ready:m.isReadyToDestroy,hold:m.bbdc.getCurFrameCount(),bodyFrame:m.bbdc.curPoint.x,frozen:m.bbdc.isStopFrame,created:BaseBullet.serial,enrolled:m.magicBulletArray?m.magicBulletArray.length:0,bullets:bullets,hits:Config.hits.length,paused:paused,door:door.visible,worldCount:world.monsterArray.length});
   m.x+=1;
  }
  rows.push({fps:fps,attack:action,direct:direct,owner:owner,scenario:name,states:states,hits:Config.hits,attempts:Config.attempts});
 }
}}
