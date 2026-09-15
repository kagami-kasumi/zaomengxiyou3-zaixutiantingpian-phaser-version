package {
import flash.display.Sprite;import flash.geom.Point;import flash.desktop.NativeApplication;import flash.system.Capabilities;
import base.*;import petInfo.PetInfo;import export.pet.*;import com.greensock.TweenMax;
public class Probe extends Sprite {
private var p:*,h:BaseHero,info:PetInfo,gc:Config=Config.instance;
public function Probe(){try{trace('ENV '+Capabilities.version);run();trace('COMPLETE');NativeApplication.nativeApplication.exit(0);}catch(e:Error){trace('FAIL '+e.getStackTrace());NativeApplication.nativeApplication.exit(1);}}
private function reset(f:int,owner:int=1):void {
 gc.sid=1;gc.mode='single';gc.rolls=[.9];gc.sent=[];TweenMax.jobs=[];
 h=new BaseHero();h.sid=owner;info=new PetInfo();info.harms={sld:{first:73.9},txlj:{first:.05,second:7.9},sybh:{first:121.5},qlfj:{first:.5}};
 info.skills={sld:true,txlj:true,sybh:true,xwaoyi:true};
 switch(f){case 1:p=new PetTurtle1(h,info);break;case 2:p=new PetTurtle2(h,info);break;case 3:p=new PetTurtle3(h,info);break;case 4:p=new PetTurtle4(h,info);}
 p.x=300;p.y=400;p.curAttackTarget={x:400,y:400,isDead:function():Boolean{return false;}};p.events=[];
}
private function report(id:String,extra:Object=null):void {
 var bullets:Array=[];for each(var b:BaseBullet in p.magicBulletArray)bullets.push({name:b.nameId,action:b.curAction,x:b.x,y:b.y,scale:b.scaleX,owner:b.sourceRole==p,cut:b.cut,last:b.last,ttl:b.ttl,disabled:b.disabled,dead:b.isReadyToDestroy});
 trace('CASE '+JSON.stringify({id:id,mp:info.getMp(),hp:info.getHp(),heroHp:h.roleProperies.getHHP(),action:p.curAction,row:p.bbdc.point.y,events:p.events,bullets:bullets,buffs:p.curAddEffect?p.curAddEffect.buffs:null,heroBuffs:h.curAddEffect.buffs,jobs:TweenMax.jobs.map(function(j:Object,i:int,a:Array):Number{return j.time;}),cd:[p.skillCD1[0],p.skillCD2[0],p.skillCD3[0],p.skillCD4[0]],extra:extra}));
}
private function run():void {
 for(var f:int=1;f<=4;f++)for(var owner:int=1;owner<=2;owner++) {
  reset(f,owner);report('init-'+f+'-'+owner,{range:p.attackRange,rate:p.attackRate,attacks:p.attackBackInfoDict,sourceHarm:[info.sourceHarm('sld'),info.sourceHarm('txlj'),info.sourceHarm('sybh'),info.sourceHarm('qlfj')],costs:[info.findPetUsedMagic('sld'),info.findPetUsedMagic('txlj'),info.findPetUsedMagic('sybh'),info.findPetUsedMagic('xwaoyi')]});
  for each(var dist:Number in [49,50,200,201]){p.curAttackTarget.x=300+dist;report('gate-'+f+'-'+owner+'-'+dist,{gate:p.probeGate(1)});}
  p.curAttackTarget.x=400;info.setMp(19);report('low-mp-'+f+'-'+owner,{gate:p.probeGate(1)});
  for(var skill:int=1;skill<=Math.min(f,3);skill++){
   reset(f,owner);p.probeSkill(skill);report('release-'+f+'-'+owner+'-'+skill);
   if(skill!=2){p.probeFrame(2,9);report('pre-frame-'+f+'-'+owner+'-'+skill);p.probeFrame(2,10);report('frame-'+f+'-'+owner+'-'+skill);p.probeOver();report('over-'+f+'-'+owner+'-'+skill);}
  }
  reset(f,owner);p.probeNormal();p.probeFrame(f==1?2:3,9);report('normal-before-'+f+'-'+owner);p.probeFrame(f==1?2:3,10);report('normal-hit-'+f+'-'+owner);
  reset(f,owner);info.skills={};p.skillCD1[0]=p.skillCD2[0]=p.skillCD3[0]=p.skillCD4[0]=0;p.curAttackTarget.x=300+p.attackRange+1;p.probeAI();report('outside-'+f+'-'+owner);
  p.curAttackTarget.x=300+p.attackRange;gc.rolls=[.7];p.probeAI();report('inside-'+f+'-'+owner);
  reset(f,owner);p.skillCD1[0]=p.skillCD2[0]=p.skillCD3[0]=p.skillCD4[0]=0;p.probeAI();p.tickCD();report('priority-'+f+'-'+owner);
  reset(f,owner);gc.mode='room';gc.sid=3;p.probeNormal();p.probeFrame(f==1?2:3,10);report('remote-'+f+'-'+owner);
  reset(f,owner);info.skills.qlfj=true;gc.rolls=[0];p.reduceHp(11,true);report('counter-'+f+'-'+owner);
  reset(f,owner);p.curAttackTarget=null;gc.obbsiteArray=[{x:1000,y:400},{x:400,y:400}];p.probeAI();report('target-first-'+f+'-'+owner,{x:p.curAttackTarget.x});
  reset(f,owner);p.curAttackTarget.x=1500;p.probeAI();report('target-loss-'+f+'-'+owner,{lost:p.curAttackTarget==null});
  reset(f,owner);info.skills={};report('unlearned-'+f+'-'+owner,{gate:p.probeGate(1)});
  reset(f,owner);info.skills.qlfj=true;gc.rolls=[.99];p.reduceHp(11,true);report('hurt-'+f+'-'+owner);p.probeOver();report('hurt-over-'+f+'-'+owner);
  reset(f,owner);p.reduceHp(101,true);report('dead-'+f+'-'+owner,{life:info.life});p.probeOver();report('destroy-'+f+'-'+owner,{ready:p.isReadyToDestroy,ownerCleared:p.sourceRole==null});
 }
 for(var mask:int=0;mask<8;mask++){
  reset(4);info.skills={sld:Boolean(mask&1),txlj:Boolean(mask&2),sybh:Boolean(mask&4),xwaoyi:true};p.probeSkill(4);report('aoyi-'+mask);
  TweenMax.fire(2);report('aoyi-two-'+mask);TweenMax.fire(4);report('aoyi-four-'+mask);TweenMax.fire(5);p.setAttackBack(new Point(1,2));report('aoyi-end-'+mask);
 }
 reset(4);p.probeSkill(4);info.isFight=false;TweenMax.fire(2);TweenMax.fire(4);report('aoyi-rest');
 reset(4);p.probeSkill(4);info.setHp(0);TweenMax.fire(2);TweenMax.fire(4);report('aoyi-dead');
 reset(4);p.probeSkill(4);p.reduceHp(11,true);p.setAttackBack(new Point(1,2));report('aoyi-hurt-suppressed');
 reset(4);p.probeSkill(4);p.destroy();var errorId:int=0;try{TweenMax.fire(2);}catch(e:Error){errorId=e.errorID;}report('aoyi-destroy-alive',{errorId:errorId});
 reset(4);info.setMp(29);report('aoyi-low-mp',{gate:p.probeGate(4)});info.setMp(30);report('aoyi-enough-mp',{gate:p.probeGate(4)});
 for(f=2;f<=4;f++){
  reset(f);p.probeSkill(2);p.probeSkill(1);p.probeFrame(2,10);report('linked-sld-'+f);
 }
 for(f=1;f<=4;f++){
  reset(f);p.isGXP=true;p.curAddEffect.add([{name:BaseAddEffect.PET_FSNL,value:2.9},{name:BaseAddEffect.MAGIC_FLOWER_ADDBUFF,value:.5}]);
  report('power-'+f,{normal:p.getRealPower('hit1',false),sld:p.getRealPower('hit2',false),sybh:p.getRealPower('hit3',false)});
 }
}
}}
