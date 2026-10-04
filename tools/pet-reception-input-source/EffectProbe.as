package {
import flash.display.Sprite;
import flash.desktop.NativeApplication;
import flash.filesystem.*;
import config.Config;
public class Probe extends Sprite {
private function read(name:String):String {var f:FileStream=new FileStream();f.open(File.applicationDirectory.resolvePath(name),FileMode.READ);var s:String=f.readUTFBytes(f.bytesAvailable);f.close();return s;}
private function write(name:String,value:*):void {var f:FileStream=new FileStream();f.open(new File(File.applicationDirectory.resolvePath(name).nativePath),FileMode.WRITE);f.writeUTFBytes(JSON.stringify(value));f.close();}
private function snap(e:BaseAddEffect):Object {var buff:Object=e.getBuffByName(BaseAddEffect.PET_RABBIT_JIFENG);return {active:e.curDebuff(BaseAddEffect.PET_RABBIT_JIFENG),count:e.count,start:buff&&buff.hasOwnProperty('startTime')?buff.startTime:null,duration:buff?buff.time:null,source:e.sourceRole!=null};}
public function Probe() {
try {
var results:Array=[];
for each(var c:Object in JSON.parse(read('fixtures.json'))) {
var r:*=c.form==2?new Rabbit2():c.form==3?new Rabbit3():new Rabbit4();
Config.instance.frameClips=c.fps;Config.instance.network=[];
r.sourceRole.sid=c.owner;
r.effect.sourceRole=r;
r.skillCD1[0]=c.mode=='no-skill'?7:0;
r._petInfo.skill=c.mode=='no-skill'?[]:[{sname:'jf'}];
r._petInfo.setMp(c.mode=='low-mp'?19:c.mode=='exact-mp'?20:100);
var accepted:Boolean=r.beforeSkill1Start();
if(accepted) r.releSkill1();
var states:Array=[snap(r.effect)];
var duration:int=c.fps*(c.form==2?5:10);
var total:int=duration+3;
if(c.mode=='refresh-first') {r.releSkill1();states.push(snap(r.effect));}
if(c.mode=='refresh-mid') total+=int(duration/2);
for(var tick:int=0;tick<total;tick++) {
if(c.mode=='refresh-mid'&&tick==int(duration/2)) {r.releSkill1();states.push(snap(r.effect));}
if(c.mode=='pause'&&tick==2) {for(var pause:int=0;pause<7;pause++) states.push(snap(r.effect));}
if((c.mode=='destroy'||c.mode=='reenter')&&tick==2) {r.effect.destroy();states.push(snap(r.effect));if(c.mode=='reenter') {r.effect=new BaseAddEffect();r.effect.sourceRole=r;}}
r.effect.step();r.countSkillCD();states.push(snap(r.effect));
}
results.push({id:c.id,accepted:accepted,mp:r._petInfo.getMp(),attacks:r.attacks,faces:r.faces,network:Config.instance.network.length,states:states});
}
write('rows.json',results);trace('COMPLETE '+results.length);NativeApplication.nativeApplication.exit(0);
} catch(e:Error) {trace(e.getStackTrace());NativeApplication.nativeApplication.exit(1);}
}
}
}
