package {
import flash.display.*;import flash.events.*;import flash.system.*;import flash.utils.*;import flash.desktop.NativeApplication;
public class Probe extends Sprite {
 [Embed(source="source.swf",mimeType="application/octet-stream")]private var Bytes:Class;
 private var loader:Loader=new Loader(),cases:Array=[],batch:int=0,tick:int=0,world:WorldProbe,m:MonsterProbe,all:Array=[],game:MainGameProbe;
 public function Probe(){loaderInfo.uncaughtErrorEvents.addEventListener(UncaughtErrorEvent.UNCAUGHT_ERROR,function(e:UncaughtErrorEvent):void{trace('FAIL '+e.error);e.preventDefault();NativeApplication.nativeApplication.exit(1);});loader.contentLoaderInfo.addEventListener(Event.COMPLETE,loaded);var c:LoaderContext=new LoaderContext(false,new ApplicationDomain());c.allowCodeImport=true;loader.loadBytes(new Bytes() as ByteArray,c);}
 private function loaded(e:Event):void{for each(var symbol:String in ['Monster2Bullet1_1','Monster2Bullet1_2','Monster2Bullet2'])AUtils.classes[symbol]=loader.contentLoaderInfo.applicationDomain.getDefinition(symbol) as Class;for each(var fps:int in [20,24,30])for each(var attack:String in ['hit1','hit2'])for each(var mode:String in ['normal','lethal','pause','destroy-after'])cases.push({fps:fps,attack:attack,mode:mode});trace('ENV '+Capabilities.version);begin();stage.addEventListener(Event.ENTER_FRAME,enter);stage.addEventListener(Event.EXIT_FRAME,exitFrame);}
 private function begin():void{Config.instance=new Config();Config.instance.frameClips=cases[batch].fps;stage.frameRate=cases[batch].fps;Config.hits=[];Config.attempts=[];Config.accept=true;BaseBullet.serial=0;TweenMax.calls=[];TweenMax.controls=[];game=new MainGameProbe();AUtils.visuals=[];all=[];tick=0;world=new WorldProbe();addChild(Config.instance.gameSence);var target:BaseHero=new BaseHero();target.id="p1";target.pet=new BasePet();target.pet.id="p1-pet";var target2:BaseHero=new BaseHero();target2.id="p2";target2.pet=new BasePet();target2.pet.id="p2-pet";Config.instance.targets=[target,target2];}
 private function record(phase:String):void{var rows:Array=[];for each(var b:BaseBullet in all)rows.push(b.inspectPhase());var visuals:Array=[];for each(var v:MovieClip in AUtils.visuals)visuals.push({frame:v.currentFrame,total:v.totalFrames,parentPresent:v.parent!=null,playing:v.isPlaying});trace('PHASE '+JSON.stringify({fps:cases[batch].fps,attack:cases[batch].attack,scenario:cases[batch].mode,tick:tick,phase:phase,bullets:rows,visuals:visuals,tweens:TweenMax.calls.concat(),controls:TweenMax.controls.concat(),hits:Config.hits.length,hp:m?m.hp:100,body:m?m.curAction:"none"}));}
 private function enter(e:Event):void{
  tick++;Config.tick=tick;
  if(tick==1){m=new MonsterProbe(cases[batch].attack,1,false);m.x=300;m.y=200;Config.instance.gameSence.addChild(m);world.monsterArray=[m];Config.instance.pWorld.monsterArray=world.monsterArray;}
  var birth:int=cases[batch].attack=="hit1"?5:7;
  if(cases[batch].mode=="lethal"&&tick==birth)m.curAddEffect.damage=100;
  if(cases[batch].mode=="pause"&&tick==birth+2)game.stopGame();
  if(cases[batch].mode=="pause"&&tick==birth+5)game.continueGame();
  if(cases[batch].mode=='destroy-after'&&tick==birth+1)m.destroy();record('before-world');
  if(!(cases[batch].mode=="pause"&&tick>=birth+2&&tick<=birth+4))world.step();
  if(m.magicBulletArray)for each(var b:BaseBullet in m.magicBulletArray)if(all.indexOf(b)<0)all.push(b);
  record('after-world');
 }
 private function exitFrame(e:Event):void{
  record('exit');if(tick==48){AUtils.stopAllChildren(Config.instance.gameSence);removeChild(Config.instance.gameSence);batch++;
   if(batch==cases.length){stage.removeEventListener(Event.ENTER_FRAME,enter);stage.removeEventListener(Event.EXIT_FRAME,exitFrame);trace('COMPLETE');NativeApplication.nativeApplication.exit(0);}else begin();}
 }
}}
