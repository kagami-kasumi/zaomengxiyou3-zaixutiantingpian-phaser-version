package {
import flash.display.Sprite;
import flash.desktop.NativeApplication;
import base.*;
public class Probe extends Sprite {
 private var total:int=0;
 private var names:Array=['sxkb','fsnl','smjc','mfjc','gjjc','fyjc'];
 private function copy(v:Object):Object{return JSON.parse(JSON.stringify(v));}
 private function record(id:String,input:Object,result:Object):void {
  trace('CASE '+JSON.stringify({id:id,input:input,result:result}));total++;
 }
 private function actor(form:int,t:Number,w:Number):BasePet {
  var a:BasePet=new BasePet();a.curAddEffect=new BaseAddEffect();
  a.sourceRole={curAddEffect:new BaseAddEffect()};
  a._petInfo.form=form;a._petInfo._anti={technique:t,warpower:w};
  for each(var n:String in names)a._petInfo.skills[n]=true;
  a.ready();return a;
 }
 private function state(a:BasePet,p:Props):Object {
  return copy({pet:a.curAddEffect.curEffectArray,hero:a.sourceRole.curAddEffect.curEffectArray,
   stats:p.snapshot(),magic:a.getMagicAddValue(),crit:a.getCriteValue(true)});
 }
 public function Probe() {
  for each(var fps:int in [20,24,30]) for(var form:int=1;form<=4;form++)
  for(var t:int=0;t<=8;t++) for(var w:int=0;w<=8;w++) {
   Config.instance.frameClips=fps;
   var a:BasePet=actor(form,t,w);var p:Props=new Props();p.who=a.sourceRole;
   a.check();var enrolled:Object=state(a,p);
   var duration:int=int((30+form*5)*w/2*0.6);duration*=fps;
   var rows:Array=[];
   for(var tick:int=0;tick<=duration+2;tick++) {
    a.sourceRole.curAddEffect.step();p.step();a.curAddEffect.step();
    if(tick<=2||tick==duration-1||tick==duration||tick==duration+1||tick==duration+2)
     rows.push({tick:tick,state:state(a,p)});
   }
   record('domain/'+fps+'/'+form+'/'+t+'/'+w,{fps:fps,form:form,technique:t,warpower:w},
    {mp:a._petInfo.mp,counts:a.counts(),enrolled:enrolled,rows:rows});
  }
  for each(var raw:Number in [8,8.9,9,100,-1,-0.5,0.9,1.9]) {
   a=actor(1,raw,raw);var harms:Array=[];
   for each(var n:String in names)harms.push(a._petInfo.getPetHarmObj(n));
   record('getter/'+raw,{raw:raw},{technique:a._petInfo.gettechnique(),warpower:a._petInfo.getwarpower(),harms:harms});
   a._petInfo.settechnique(raw);a._petInfo.setwarpower(raw);
   record('setter/'+raw,{raw:raw},{stored:a._petInfo._anti,technique:a._petInfo.gettechnique(),warpower:a._petInfo.getwarpower()});
  }
  for each(var time:int in [0,1,3]) for each(var refreshTime:int in [0,1,5]) {
   var e:BaseAddEffect=new BaseAddEffect();e.add([{name:'gjjc',time:time,value:7}]);e.step();
   e.add([{name:'gjjc',time:refreshTime,value:99}]);var initial:Object=copy(e.curEffectArray);rows=[];
   for(tick=0;tick<8;tick++){e.step();rows.push(copy(e.curEffectArray));}
   record('refresh/'+time+'/'+refreshTime,{time:time,refreshTime:refreshTime},{initial:initial,rows:rows});
  }
  trace('COMPLETE '+total);NativeApplication.nativeApplication.exit();
 }
}}
