package {
import flash.display.Sprite;
import flash.desktop.NativeApplication;
import flash.filesystem.*;
import petInfo.PetInfo;
import config.Config;
public class Probe extends Sprite {
private function read(name:String):String {var f:FileStream=new FileStream();f.open(File.applicationDirectory.resolvePath(name),FileMode.READ);var s:String=f.readUTFBytes(f.bytesAvailable);f.close();return s;}
private function write(name:String,value:*):void {var f:FileStream=new FileStream();f.open(new File(File.applicationDirectory.resolvePath(name).nativePath),FileMode.WRITE);f.writeUTFBytes(JSON.stringify(value));f.close();}
public function Probe() {
try {
var results:Array=[];
for each(var c:Object in JSON.parse(read('fixtures.json'))) {
var p:PetInfo=new PetInfo();
Config.roll=0;
Config.rolls=[];
p.setPetNameAndLevel(c.hasOwnProperty('name')?c.name:'rabbit3',c.hasOwnProperty('level')?c.level:60);
if(p.getHp()<=0) throw new Error('Invalid PetInfo family fixture');
p.setperception(0);
if(c.hasOwnProperty('miss')) {p.setMiss(c.miss);p.setMDef(c.mdef);}
p.setCrit(0);
Config.roll=c.hasOwnProperty('roll')?c.roll:0;
Config.rolls=c.hasOwnProperty('rolls')?c.rolls.concat():[];
Config.calls=[];
var result:Object={id:c.id};
if(c.op=='recalc') p.reSetPetAttributeValue();
if(c.op=='upgrade') {p.setCurExper(p.getPetNextExper());p.petUpdate();}
if(c.op=='continuous') {while(p.getLevel()<90) {p.setCurExper(p.getPetNextExper());p.petUpdate();}}
if(c.op=='child') p.makePetBecomeChild();
if(c.op=='reinitialize') p.setPetNameAndLevel('rabbit3',60);
if(c.op=='child-grow') {p.makePetBecomeChild();p.setperception(0);while(p.getLevel()<60) {p.setCurExper(p.getPetNextExper());p.petUpdate();}}
if(c.op=='save'||c.op=='blank'||c.op=='truncated'||c.op=='non-numeric') {
var fields:Array=p.getSaveString().split('|');
if(c.op=='save') {result.savedMiss=Number(fields[12]);result.savedMdef=Number(fields[10]);}
else {fields[12]=c.op=='non-numeric'?'bad':'';fields[10]=c.op=='non-numeric'?'bad':'';}
if(c.op=='truncated') fields=fields.slice(0,10);
var restored:PetInfo=new PetInfo();var error:int=0;
try {restored.setSaveString(fields.join('|'));} catch(saveError:Error) {error=saveError.errorID;}
p=restored;
if(c.expected.hasOwnProperty('error')) result.error=error;else if(error) throw new Error('Unexpected restore error '+error);
}
result.miss=isNaN(p.getMiss())?'NaN':p.getMiss();result.mdef=isNaN(p.getMDef())?'NaN':p.getMDef();
if(c.expected.hasOwnProperty('crit')) result.crit=p.getCrit();
if(c.expected.hasOwnProperty('level')) result.level=p.getLevel();
if(c.expected.hasOwnProperty('calls')) result.calls=Config.calls.concat();
results.push(result);
}
write('rows.json',results);
trace('COMPLETE '+results.length);
NativeApplication.nativeApplication.exit(0);
} catch(e:Error) {trace(e.getStackTrace());NativeApplication.nativeApplication.exit(1);}
}
}
}
