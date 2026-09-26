package {import flash.display.Sprite;import flash.desktop.NativeApplication;import flash.system.Capabilities;import base.*;
public class Probe extends Sprite {
private var p:BasePet,gc:Config=Config.instance,kind:String;
public function Probe(){trace('ENV '+Capabilities.version);run();trace('COMPLETE');NativeApplication.nativeApplication.exit(0);}
private function reset(cls:Class):void {
 gc.frameClips=24;gc.sid=1;gc.single=true;gc.obbsiteArray=[];gc.rolls=[0];gc.randomCalls=0;
 p=new cls();p.curAttackTarget={x:10,y:0,isDead:function():Boolean{return false;}};
 p.skillCD1=[0,24];p.skillCD2=[0,24];p.skillCD3=[0,24];p.skillCD4=[0,24];
}
private function report(id:String,extra:Object=null):void {
 trace('CASE '+JSON.stringify({id:kind+':'+id,events:p.events,timeCount:p.timeCount,
 randomCalls:gc.randomCalls,cd:[p.skillCD1[0],p.skillCD2[0],p.skillCD3[0],p.skillCD4[0]],
 target:p.curAttackTarget?{x:p.curAttackTarget.x,y:p.curAttackTarget.y}:null,extra:extra}));
}
private function run():void {
 var classes:Array=[PetMonkey1,PetMonkey2,PetMonkey3,PetMonkey4,PetHorse1,PetHorse2,PetHorse3,PetHorse4];
 var names:Array=['monkey1','monkey2','monkey3','monkey4','horse1','horse2','horse3','horse4'];
 var allSkills:Object={xj:true,lj:true,lyq:true,jgaoyi:true,bd:true,sp:true,bz:true,tmaoyi:true};
 for(var index:int=0;index<classes.length;index++) {
  var cls:Class=classes[index];kind=names[index];
  for each(var distance:Number in [0,49,50,100,101,250,251,399,400,401]) {
   for each(var mp:int in [0,19,20,29,30,1000])for each(var learned:Boolean in [false,true]) {
    reset(cls);p._petInfo.skills=learned?allSkills:{};p._petInfo.mp=mp;
    p.skill1Release=p.skill2Release=p.skill3Release=true;p.curAttackTarget.x=distance;
    report('gates-'+distance+'-'+mp+'-'+learned,{distance:distance,mp:mp,learned:learned,gates:[p.gate(1),p.gate(2),p.gate(3),p.gate(4)]});
   }
  }
  for each(var fps:int in [20,24,30])for each(var tick:int in [0,1,fps-1,fps,fps+1,59998]) {
   reset(cls);gc.frameClips=fps;p.timeCount=tick;p.step();report('phase-'+fps+'-'+tick);
  }
  for each(var action:String in ['wait','hit1','hit2','hit3','hit4','hit5','hurt','hurt_1','afterHurt','dead']) {
   reset(cls);p.curAction=action;p._petInfo.skills=allSkills;p.skill1Release=p.skill2Release=p.skill3Release=true;
   p.step();report('state-'+action);
  }
  reset(cls);p.curAddEffect={isAnyThingElseStun:function(s:String):Boolean{return true;}};p.step();report('stun');
  reset(cls);gc.single=false;gc.sid=2;p.step();report('remote');
  reset(cls);p.curAttackTarget=null;gc.obbsiteArray=[{x:100,y:0},{x:10,y:0}];p.step();report('acquire');
  reset(cls);p.curAttackTarget.x=1200;p.step();report('lost');
  reset(cls);p.curAttackTarget={x:10,y:0,isDead:function():Boolean{return true;}};p.step();report('dead-target');
  for each(var first:Number in [.7,.700001])for each(var second:Number in [.299999,.3]) {
   reset(cls);gc.rolls=[first,second];p.step();report('random-'+first+'-'+second);
  }
  reset(cls);p._petInfo.skills=allSkills;p.skill1Release=p.skill2Release=p.skill3Release=true;
  p.step();report('priority');
  reset(cls);p._petInfo.skills=allSkills;p.skill1Release=p.skill2Release=p.skill3Release=true;
  p.skillCD1[0]=p.skillCD2[0]=p.skillCD3[0]=p.skillCD4[0]=1;p.step();report('cd-before');
  p.events=[];gc.rolls=[0];p.step();report('cd-after');
  reset(cls);p._petInfo.skills=allSkills;p.curAttackTarget.x=75;
  report('release-false',{gates:[p.gate(1),p.gate(2),p.gate(3),p.gate(4)]});
  for(var mask:int=0;mask<256;mask++) {
   reset(cls);p.curAttackTarget.x=75;p.skill1Release=p.skill2Release=p.skill3Release=true;
   var keys:Array=['xj','lj','lyq','jgaoyi','bd','sp','bz','tmaoyi'];
   for(var bit:int=0;bit<8;bit++)p._petInfo.skills[keys[bit]]=Boolean(mask&(1<<bit));
   p.step();report('subset-'+mask);
  }
  for each(fps in [20,24,30]) {
  reset(cls);gc.frameClips=fps;p.curAttackTarget=null;p.timeCount=7;gc.obbsiteArray=[{x:10,y:0,isDead:function():Boolean{return false;}}];
  var normalTicks:Array=[];
  for(var count:int=0;count<49;count++) {
   var before:uint=p.timeCount;p.events=[];gc.rolls=[0];p.step();
   if(p.events.indexOf('normal')>=0)normalTicks.push(before);
  }
  report('off-phase-acquire-'+fps,{normalTicks:normalTicks});
  }
  reset(cls);p.curAttackTarget=null;gc.obbsiteArray=[{x:100,y:0,isDead:function():Boolean{return true;}},{x:10,y:0,isDead:function():Boolean{return false;}}];
  p.step();report('acquire-dead-first');p.events=[];p.step();report('clear-dead-first');
  reset(cls);p.timeCount=23;p.curAction='hurt';p.step();report('hurt-before-boundary');
  p.events=[];gc.rolls=[0];p.curAction='wait';p.step();report('hurt-recovered-boundary');
 }
 kind='collision';
 for each(var hit:Boolean in [false,true])for each(var intersect:Boolean in [false,true])for each(var force:Boolean in [false,true])for each(var alternate:Boolean in [false,true]) {
  var gate:CollisionGate=new CollisionGate();
  var bullet:Object={hit:hit,intersects:intersect,getImgMc1:function():Object{return alternate?{hit:!hit}:null;}};
  var accepted:Boolean=gate.accepts(bullet,force);
  trace('CASE '+JSON.stringify({id:'collision:'+hit+'-'+intersect+'-'+force+'-'+alternate,extra:{accepted:accepted}}));
 }
}
}}
