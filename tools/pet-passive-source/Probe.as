package {
import flash.display.Sprite;
import flash.desktop.NativeApplication;
import base.*;
public class Probe extends Sprite {
 private var total:int=0;
 private var names:Array=['sxkb','fsnl','smjc','mfjc','gjjc','fyjc'];
 private function actor(family:String='base',form:int=1):BasePet {
  var classes:Array=family=='monkey'?[PetMonkey1,PetMonkey2,PetMonkey3,PetMonkey4]:[PetHorse1,PetHorse2,PetHorse3,PetHorse4];
  var C:Class=classes[form-1];var a:BasePet=family=='base'?new BasePet():new C();a.curAddEffect=new BaseAddEffect();
  a.sourceRole={x:0,y:0,sid:1,curAddEffect:new BaseAddEffect(),clearPet:function():void{},getRoleId:function():int{return 1;}};
  return a;
 }
 private function record(id:String,input:Object,result:Object):void {
  trace('CASE '+JSON.stringify({id:id,input:input,result:result}));total++;
 }
 private function snapshot(a:BasePet):Object {
  return {hp:a._petInfo.hp,mp:a._petInfo.mp,ehp:a._petInfo.ehp,emp:a._petInfo.emp,tCount:a.tCount,
   counts:a.counts(),pet:a.curAddEffect.curEffectArray,hero:a.sourceRole.curAddEffect.curEffectArray,
   magic:a.getMagicAddValue(),crit:a.getCriteValue(true),events:a.events};
 }
 public function Probe() {
  for each(var fps:int in [20,24,30]) {
   Config.instance.frameClips=fps;
   for each(var family:String in ['monkey','horse']) for each(var form:int in [1,2,3,4]) for each(var mp:int in [0,19,20,40,119,120,1000])
   for each(var learned:Boolean in [false,true]) for each(var ready:Boolean in [false,true]) {
    var a:BasePet=actor(family,form);a._petInfo.form=form;a._petInfo.mp=mp;
    for each(var n:String in names)a._petInfo.skills[n]=learned;
    if(ready)a.ready();a.step();
    record('gate/'+family+'/'+fps+'/'+form+'/'+mp+'/'+learned+'/'+ready,{family:family,fps:fps,form:form,mp:mp,learned:learned,ready:ready},snapshot(a));
   }
   for each(var mode:String in ['normal','hurt','stun','pause','dead','refresh']) {
    a=actor();a._petInfo.hp=mode=='dead'?0:100;a._petInfo.mp=10;
    a.curAction=mode=='hurt'?'hurt':'wait';a.curAddEffect.stun=mode=='stun';
    var samples:Array=[];
    for(var tick:int=1;tick<=2*(fps+1)+1;tick++) {
     if(mode=='refresh' && tick==fps+1)a._petInfo.level=25;
     if(mode!='pause')a.step();
     if(tick==fps||tick==fps+1||tick==2*(fps+1))samples.push({tick:tick,hp:a._petInfo.hp,mp:a._petInfo.mp,ehp:a._petInfo.ehp,emp:a._petInfo.emp,counts:a.counts()});
    }
    record('period/'+fps+'/'+mode,{fps:fps,mode:mode},samples);
   }
   a=actor();for each(n in names)a._petInfo.skills[n]=true;
   var first:int=0;
   for(tick=1;tick<=301;tick++){a.step();if(!first&&a.curAddEffect.getBuffByName('sxkb'))first=tick;}
   record('initial/'+fps,{fps:fps},{first:first,counts:a.counts()});
   for each(form in [1,2,3,4]) {
    a=actor();a._petInfo.form=form;a.ready();for each(n in names)a._petInfo.skills[n]=true;
    var props:Props=new Props();props.who=a.sourceRole;
    a.step();var initial:Array=props.snapshot();
    var duration:int=int((30+form*5)/2*0.6)*fps;
    var rows:Array=[];
    // BaseHero.step: super effect step, then properties, then pet; here pet is rested.
    for(tick=0;tick<=duration+2;tick++) {
     a.sourceRole.curAddEffect.step();props.step();
     if(tick==0||tick==duration-1||tick==duration||tick==duration+1||tick==duration+2)
      rows.push({tick:tick,stats:props.snapshot(),effects:JSON.parse(JSON.stringify(a.sourceRole.curAddEffect.curEffectArray))});
    }
    record('effects/'+fps+'/'+form,{fps:fps,form:form,duration:duration},{initial:initial,rows:rows});
   }
  }
  for each(fps in [20,24,30]) {
   Config.instance.frameClips=fps;a=actor();a.ready();a._petInfo.mp=100000;a._petInfo.smp=100000;
   for each(n in names)a._petInfo.skills[n]=true;
   var cooldown:Array=[];
   for(tick=1;tick<=5402;tick++) {
    a.step();if([1,4320,4321,5400,5401,5402].indexOf(tick)>=0)cooldown.push({tick:tick,counts:a.counts()});
   }
   record('cooldown/'+fps,{fps:fps},cooldown);
  }
  for each(var level:int in [1,4,5,9,14,90]) {a=actor();a._petInfo.level=level;a._petInfo.upPassive();record('level/'+level,{level:level},{hp:a._petInfo.ehp,mp:a._petInfo.emp});}
  a=actor();a.ready();for each(n in names)a._petInfo.skills[n]=true;a.curAddEffect=null;a.check();record('no-effect',{}, {mp:a._petInfo.mp,counts:a.counts(),hero:a.sourceRole.curAddEffect.curEffectArray});
  var e:BaseAddEffect=new BaseAddEffect();e.add([{name:'gjjc',time:3,value:7}]);e.step();
  e.add([{name:'gjjc',time:5,value:99}]);
  record('refresh',{},JSON.parse(JSON.stringify(e.curEffectArray)));
  var phases:Array=[];for(tick=0;tick<7;tick++){e.step();phases.push(JSON.parse(JSON.stringify(e.curEffectArray)));}
  record('expiry',{},phases);
  a=actor();a._petInfo.hp=999;a._petInfo.mp=999;a.tCount=24;Config.instance.frameClips=24;
  a._petInfo.ehp=6;a._petInfo.emp=2;a.step();record('caps',{},snapshot(a));
  a=actor();a.ready();for each(n in names)a._petInfo.skills[n]=true;a.step();
  var hero:Object=a.sourceRole;var before:Object=JSON.parse(JSON.stringify(hero.curAddEffect.curEffectArray));a.destroy();
  var replacement:BasePet=actor();record('destroy-replace',{}, {dead:a.isReadyToDestroy,petEffect:a.curAddEffect,owner:a.sourceRole,heroBefore:before,heroAfter:hero.curAddEffect.curEffectArray,newCounts:replacement.counts()});
  var host:Host=new Host();var resting:BasePet=actor();host.myPet=actor();host.roster=[host.myPet,resting];
  for(tick=0;tick<30;tick++)host.updatePet();
  record('active-only',{}, {active:host.myPet.counts(),resting:resting.counts(),activeHp:host.myPet._petInfo.hp,restingHp:resting._petInfo.hp});
  trace('COMPLETE '+total);NativeApplication.nativeApplication.exit();
 }
}}

