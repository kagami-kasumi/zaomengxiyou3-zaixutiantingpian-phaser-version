package {
import flash.events.UncaughtErrorEvent;import flash.display.Sprite;import flash.desktop.NativeApplication;import flash.system.Capabilities;import flash.filesystem.*;
public class Probe extends Sprite {
public function Probe(){loaderInfo.uncaughtErrorEvents.addEventListener(UncaughtErrorEvent.UNCAUGHT_ERROR,function(e:UncaughtErrorEvent):void{trace('FAIL '+e.error);e.preventDefault();NativeApplication.nativeApplication.exit(1);});trace('ENV '+Capabilities.version);var rows:Array=[];
for each(var c:Object in JSON.parse('FIXTURES')){
 var m:BaseMonster=new ProbeMonster(),a:BaseHero=new BaseHero(),b:BaseHero=new BaseHero();
 a.id='p1';b.id='p2';a.x=c.p1[0];a.y=c.p1[1];b.x=c.p2[0];b.y=c.p2[1];
 a.hp=c.states[0]=='dead'?0:100;b.hp=c.states[1]=='dead'?0:100;
 a.isReadyToDestroy=c.states[0]=='retired';b.isReadyToDestroy=c.states[1]=='retired';
 m.gc.hero1=c.states[0]=='missing'?null:a;m.gc.hero2=c.states[1]=='missing'?null:b;m.alertRange=c.radius;
 var candidates:Array=[];for each(var h:BaseHero in m.gc.getPlayerArray())candidates.push(h.id);
 var old:BasePet=new BasePet();old.id='old';
 if(c.sequence=='retain-live'){m.curAttackTarget=old;m.ai();}
 else if(c.sequence=='clear-dead'||c.sequence=='reselect-dead'){
  m.curAttackTarget=old;old.hp=0;m.ai();if(c.sequence=='reselect-dead')m.ai();
 }else if(c.sequence=='clear-retired'||c.sequence=='reselect-retired'){
  m.curAttackTarget=old;old.isReadyToDestroy=true;m.cleanup();if(c.sequence=='reselect-retired')m.ai();
 }else{if(c.sequence=='blocked')m.curAddEffect.blocked=true;if(c.sequence=='hurt')m.curAction='hurt';m.ai();}
 rows.push({id:c.id,target:m.curAttackTarget?m.curAttackTarget.id:null,candidates:candidates,
 roots:[[a.x,a.y],[b.x,b.y]],walks:m.walks,follows:m.follows});
}
var f:FileStream=new FileStream();f.open(new File(File.applicationDirectory.nativePath).resolvePath('rows.json'),FileMode.WRITE);f.writeUTFBytes(JSON.stringify(rows));f.close();
trace('COMPLETE '+rows.length);NativeApplication.nativeApplication.exit(0);
}}
}
