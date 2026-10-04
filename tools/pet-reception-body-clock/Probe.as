package {
import flash.display.Sprite;import flash.desktop.NativeApplication;import flash.filesystem.*;
public class Probe extends Sprite {
public function Probe(){try{run();}catch(error:Error){trace("FAILED "+error.getStackTrace());NativeApplication.nativeApplication.exit(1);}}
private function run():void{
var stream:FileStream=new FileStream();stream.open(File.applicationDirectory.resolvePath('fixtures.json'),FileMode.READ);
var cases:Array=JSON.parse(stream.readUTFBytes(stream.bytesAvailable)) as Array;stream.close();
var output:Array=[],lifecycle:Array=[],receptions:Array=[],guardReceptions:Array=[];
for each(var c:Object in cases){
 var p:Object=make(c);p.bbdc.setFramePointY(c.row);p.bbdc.setFramePointX(c.x);p.curAction=c.prior;p.bbdc.setState(c.prior);
 p.setAction(c.action);var states:Array=[snap(p,0)],ignored:Boolean=p.curAction!=c.action;
 if(!ignored)for(var tick:int=1;tick<=240;tick++){p.bbdc.step();states.push(snap(p,tick));if(p.dead||p.curAction=='wait')break;}
 output.push({id:c.id,ignored:ignored,states:states});
 if(c.row==0&&c.x==0&&c.prior=='wait')for each(var mode:String in ['pause-before-entry','pause-during']){
  var q:Object=make(c);q.bbdc.setFramePointY(c.row);q.bbdc.setFramePointX(c.x);
  if(mode=='pause-before-entry')q.bbdc.stopFrame();
  q.setAction(c.action);var pausedStates:Array=[snap(q,0)];
  for(var t:int=1;t<=243;t++){
   if(mode=='pause-during'&&t==3)q.bbdc.stopFrame();
   if((mode=='pause-during'&&t==6)||(mode=='pause-before-entry'&&t==4))q.bbdc.continueFrame();
   q.bbdc.step();pausedStates.push(snap(q,t));if(q.dead||q.curAction=='wait')break;
  }
  lifecycle.push({id:c.id+':'+mode,baseId:c.id,mode:mode,states:pausedStates});
 }
 if(c.row==0&&c.x==0&&c.prior=='wait'){
  var r:Object=make(c);r.gc.frameClips=c.fps;r.bbdc.setFramePointY(0);r.bbdc.setFramePointX(0);
  r.reduceHp(c.action=='dead'?100:1,true);var received:Array=[snap(r,0)];
  for(var rt:int=1;rt<=243;rt++){
   if(rt==3&&c.action=='hurt')r.reduceHp(1,true);
   r.step();received.push(snap(r,rt));if(r.dead||r.curAction=='wait')break;
  }
  receptions.push({id:c.id,states:received});
 }
 if(c.prior=='hit2'){
  var guard:Object=make(c);guard.gc.frameClips=c.fps;guard.bbdc.setFramePointY(c.row);guard.bbdc.setFramePointX(c.x);guard.curAction='hit2';guard.bbdc.setState('hit2');
  var guardBefore:Object=snap(guard,0);guard.reduceHp(c.action=='dead'?100:1,true);
  guardReceptions.push({id:c.id,before:guardBefore,after:snap(guard,0)});
 }
}
stream.open(new File(File.applicationDirectory.resolvePath('observations.json').nativePath),FileMode.WRITE);stream.writeUTFBytes(JSON.stringify(output));stream.close();
stream.open(new File(File.applicationDirectory.resolvePath('lifecycle.json').nativePath),FileMode.WRITE);stream.writeUTFBytes(JSON.stringify(lifecycle));stream.close();
stream.open(new File(File.applicationDirectory.resolvePath('receptions.json').nativePath),FileMode.WRITE);stream.writeUTFBytes(JSON.stringify(receptions));stream.close();
stream.open(new File(File.applicationDirectory.resolvePath('guard-receptions.json').nativePath),FileMode.WRITE);stream.writeUTFBytes(JSON.stringify(guardReceptions));stream.close();
var protection:Array=[];
for each(var rate:int in [20,24,30]){
 var owner:Parent=new Parent();owner.bbdc=null;owner.setYourFather(rate*5);var rows:Array=[];
 for(var pt:int=0;pt<=rate*5+1;pt++){if(pt)owner.step();rows.push({tick:pt,count:owner.fatherCount,isProtected:owner.isYourFather});}
 protection.push({fps:rate,states:rows});
}
stream.open(new File(File.applicationDirectory.resolvePath('protection.json').nativePath),FileMode.WRITE);stream.writeUTFBytes(JSON.stringify(protection));stream.close();
trace('COMPLETE '+output.length);NativeApplication.nativeApplication.exit();}
private function snap(p:Object,tick:int):Object{return {tick:tick,action:p.curAction,state:p.bbdc.getState(),x:p.bbdc.curPoint.x,y:p.bbdc.curPoint.y,hold:p.bbdc.curFrameStopCount,key:p.bbdc.curKeyFrameIndex,dead:p.dead,statics:p.statics,cleanup:p.cleanup,hp:p._petInfo.hp,lifetime:p._petInfo.lifetime,protection:p.fatherCount,isProtected:p.isYourFather};}
private function make(c:Object):Object{switch(c.form){/*FACTORIES*/}throw new Error('Unknown form');}
}}
