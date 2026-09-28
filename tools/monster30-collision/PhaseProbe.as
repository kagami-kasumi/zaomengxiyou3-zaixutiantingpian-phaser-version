package {
import flash.display.*;import flash.events.*;import flash.system.*;import flash.utils.*;import flash.desktop.NativeApplication;
public class Probe extends Sprite {
 [Embed(source="source.swf",mimeType="application/octet-stream")]private var Bytes:Class;
 private var loader:Loader=new Loader(),fpsList:Array=[20,24,30],batch:int=0,tick:int=0,world:WorldProbe,m:MonsterProbe,all:Array=[];
 public function Probe(){loaderInfo.uncaughtErrorEvents.addEventListener(UncaughtErrorEvent.UNCAUGHT_ERROR,function(e:UncaughtErrorEvent):void{trace('FAIL '+e.error);e.preventDefault();NativeApplication.nativeApplication.exit(1);});loader.contentLoaderInfo.addEventListener(Event.COMPLETE,loaded);var c:LoaderContext=new LoaderContext(false,new ApplicationDomain());c.allowCodeImport=true;loader.loadBytes(new Bytes() as ByteArray,c);}
 private function loaded(e:Event):void{AUtils.clipClass=loader.contentLoaderInfo.applicationDomain.getDefinition('Monster30Bullet1') as Class;trace('ENV '+Capabilities.version);begin();stage.addEventListener(Event.ENTER_FRAME,enter);stage.addEventListener(Event.EXIT_FRAME,exitFrame);}
 private function begin():void{Config.instance=new Config();Config.instance.frameClips=fpsList[batch%3];stage.frameRate=fpsList[batch%3];Config.hits=[];BaseBullet.serial=0;all=[];tick=0;world=new WorldProbe();addChild(Config.instance.gameSence);var target:BaseHero=new BaseHero();Config.instance.targets=[target];}
 private function record(phase:String):void{var rows:Array=[];for each(var b:BaseBullet in all)rows.push(b.inspectPhase());trace('PHASE '+JSON.stringify({fps:fpsList[batch%3],scenario:batch<3?'normal':'pause',tick:tick,phase:phase,bullets:rows}));}
 private function enter(e:Event):void{
  tick++;Config.tick=tick;
  if(tick==1){m=new MonsterProbe();m.x=300;m.y=200;Config.instance.gameSence.addChild(m);world.monsterArray=[m];}
  if(batch>=3&&tick==4)AUtils.stopAllChildren(Config.instance.gameSence);
  if(batch>=3&&tick==7)AUtils.startAllChildren(Config.instance.gameSence);
  record('before-world');
  if(!(batch>=3&&tick>=4&&tick<=6))world.step();
  if(m.magicBulletArray)for each(var b:BaseBullet in m.magicBulletArray)if(all.indexOf(b)<0)all.push(b);
  record('after-world');
 }
 private function exitFrame(e:Event):void{
  record('exit');if(tick==18){AUtils.stopAllChildren(Config.instance.gameSence);removeChild(Config.instance.gameSence);batch++;
   if(batch==6){stage.removeEventListener(Event.ENTER_FRAME,enter);stage.removeEventListener(Event.EXIT_FRAME,exitFrame);trace('COMPLETE');NativeApplication.nativeApplication.exit(0);}else begin();}
 }
}}
