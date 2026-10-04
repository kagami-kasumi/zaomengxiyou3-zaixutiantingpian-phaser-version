package {import flash.display.*;import flash.events.*;import flash.system.*;import flash.utils.*;import flash.desktop.NativeApplication;import flash.filesystem.*;
public class Probe extends Sprite {
[Embed(source="source.swf",mimeType="application/octet-stream")]private var Bytes:Class;private var loader:Loader=new Loader();
public function Probe(){loader.contentLoaderInfo.addEventListener(Event.COMPLETE,loaded);var c:LoaderContext=new LoaderContext(false,new ApplicationDomain());c.allowCodeImport=true;loader.loadBytes(new Bytes() as ByteArray,c);}
private function loaded(e:Event):void{for each(var symbol:String in ['Monster2Bullet1_1','Monster2Bullet1_2','Monster2Bullet2'])AUtils.classes[symbol]=loader.contentLoaderInfo.applicationDomain.getDefinition(symbol) as Class;
var rows:Array=[];for each(var fps:int in [20,24,30])for each(var d:int in [0,1])for each(var p1:String in ['absent','alive','dead','ready'])for each(var p2:String in ['absent','alive','dead','ready']){
Config.instance=new Config();Config.instance.frameClips=fps;Config.hits=[];Config.attempts=[];TweenMax.calls=[];AUtils.visuals=[];BaseBullet.serial=0;
var gc:Config=Config.instance;for(var i:int=1;i<=2;i++){var state:String=i==1?p1:p2;if(state!='absent'){var h:BaseHero=new BaseHero();h.id='p'+i;h.hp=state=='dead'?0:100;h.isReadyToDestroy=state=='ready';gc['hero'+i]=h;}}
var m:MonsterProbe=new MonsterProbe();m.x=300;m.y=200;m.bbdc.direction=d;m.setAction('hit2');gc.gameSence.addChild(m);for(var t:int=1;t<=7;t++){Config.tick=t;m.step();}
rows.push({fps:fps,direct:d,p1:p1,p2:p2,tweens:TweenMax.calls,created:BaseBullet.serial,visuals:AUtils.visuals.length});}
for each(var boss:Boolean in [false,true])for each(var other:String in ['absent','alive','dead']){Config.instance=new Config();var killer:MonsterProbe=new MonsterProbe();killer.isBoss=boss;var door:Sprite=new Sprite();door.visible=false;Config.instance.doors=[door];if(other!='absent'){var m4:Monster4=new Monster4();m4.hp=other=='dead'?0:100;Config.instance.pWorld.monsterArray=[m4];}killer.destroy();rows.push({kind:'door',boss:boss,other:other,visible:door.visible});}
var f:FileStream=new FileStream();f.open(new File(File.applicationDirectory.nativePath+'/rows.json'),FileMode.WRITE);f.writeUTFBytes(JSON.stringify(rows));f.close();trace('ENV '+Capabilities.version);trace('COMPLETE');NativeApplication.nativeApplication.exit(0);}
}}