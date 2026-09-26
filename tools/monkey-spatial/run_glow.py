"""Original protection methods and step fragments, native filters on verified body pixels."""
import hashlib
import json
import runpy
import subprocess
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-228'
WORK = BASE/'glow-air'
OUT = ROOT/'docs/tasks/evidence/TASK-SETTINGS-228'
SDK = Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')


def main():
    WORK.mkdir(parents=True, exist_ok=True)
    helper = runpy.run_path(str(ROOT/'tools/monkey-horse-source/run.py'))
    records = []

    def take(file, name):
        path = helper['SRC']/file
        source = path.read_text(encoding='utf-8')
        code = helper['method'](source, name)
        records.append(dict(path=path.relative_to(ROOT).as_posix(), method=name,
                            fileSha256=hashlib.sha256(path.read_bytes()).hexdigest(),
                            sliceSha256=hashlib.sha256(code.encode()).hexdigest()))
        return code

    def write(name, text):
        (WORK/name).write_text(text, encoding='utf-8')

    object_step = take('base/BaseObject.as', 'step')
    father = object_step[object_step.index('if(this.fatherCount >= 0)'):object_step.index('if(this.hmzfatherCount >= 0)')]
    effect_step = take('base/BaseAddEffect.as', 'step')
    footer = effect_step[effect_step.rindex('if(this.sourceRole)'):effect_step.rindex('++this.count;')]
    write('Config.as', '''package {public class Config {
public var protectedPerproty:Object={getProperty:function(o:Object,k:String):*{return o[k];},setProperty:function(o:Object,k:String,v:*):void{o[k]=v;}};
}}''')
    write('BasePet.as', '''package {import flash.display.*;
public class BasePet extends Sprite {public var gc:Config=new Config(),isYourFather:Boolean=false,isGXP:Boolean=false;
public var fatherCount:int=-1,istouming:Boolean=false;
'''+take('base/BaseObject.as', 'setYourFather')+'public function timerStep():void{'+father+'}}}')
    for name in ['BaseHero', 'Role1', 'Role2', 'Role3', 'Role4']:
        write(name+'.as', 'package {public class '+name+' extends BasePet {}}')
    methods = '\n'.join(take('base/BaseAddEffect.as', n) for n in ['cancelGlow', 'myGlow', 'updateFather', 'getBuffByName'])
    write('Effect.as', '''package {import flash.filters.*;import flash.utils.getTimer;
public class Effect {public var sourceRole:BasePet,gc:Config,curEffectArray:Array=[];
private var glow:GlowFilter,beAttackFatherCurCount:int=0,beAttackFatherTotalCount:int=6,lastBeAttackTime:int;
public function Effect(p:BasePet,fps:int){sourceRole=p;gc=p.gc;curEffectArray=[{name:"father",time:fps*5,isForever:1}];}
public function update():void{'''+footer+'}'+methods+'}}')
    body_path = BASE/'body-air/baselines/monkey1-r0-c0-d0-P1.png'
    original = Image.open(body_path).convert('RGBA')
    original.crop((250, 300, 370, 410)).save(WORK/'body.png')
    write('Probe.as', '''package {
import flash.display.*;import flash.geom.*;import flash.filters.*;import flash.filesystem.*;import flash.desktop.NativeApplication;import flash.events.*;
public class Probe extends Sprite {[Embed(source="body.png")]private var Body:Class;
public function Probe(){loaderInfo.uncaughtErrorEvents.addEventListener(UncaughtErrorEvent.UNCAUGHT_ERROR,function(e:UncaughtErrorEvent):void{trace("FAIL "+e.error);e.preventDefault();NativeApplication.nativeApplication.exit(1);});for each(var fps:int in [20,24,30])for each(var selected:int in [1,2])run(fps,selected);trace("COMPLETE");NativeApplication.nativeApplication.exit(0);}
private function snapshot(p:BasePet):Object {var f:GlowFilter=p.filters.length?p.filters[0] as GlowFilter:null;
return {father:p.isYourFather,count:p.fatherCount,alpha:p.alpha,filter:f?{color:f.color,alpha:f.alpha,blurX:f.blurX,blurY:f.blurY,strength:f.strength,quality:f.quality,inner:f.inner,knockout:f.knockout}:null};}
private function run(fps:int,selected:int):void {
var p1:BasePet=new BasePet(),p2:BasePet=new BasePet();p1.addChild(new Body());p2.addChild(new Body());addChild(p1);addChild(p2);
var e1:Effect=new Effect(p1,fps),e2:Effect=new Effect(p2,fps),active:Effect=selected==1?e1:e2;
for(var hit:int=1;hit<=6;hit++){active.updateFather();e1.update();e2.update();trace("HIT "+JSON.stringify({fps:fps,selected:selected,hit:hit,p1:snapshot(p1),p2:snapshot(p2)}));}
for(var tick:int=0;tick<=fps*5+2;tick++){
p1.timerStep();p2.timerStep();e1.update();e2.update();var row:Object={fps:fps,selected:selected,tick:tick,p1:snapshot(p1),p2:snapshot(p2)};
if(tick<20||tick>=fps*5){var b:BitmapData=new BitmapData(180,170,true,0);b.draw(selected==1?p1:p2,new Matrix(1,0,0,1,30,30));
var path:String="glow-"+fps+"-"+selected+"-"+tick+".png";var fs:FileStream=new FileStream();fs.open(new File(File.applicationDirectory.nativePath).resolvePath(path),FileMode.WRITE);fs.writeBytes(b.encode(b.rect,new PNGEncoderOptions()));fs.close();b.dispose();row.path=path;}
trace("STATE "+JSON.stringify(row));}
removeChild(p1);removeChild(p2);
}}}''')
    write('application.xml', '''<application xmlns="http://ns.adobe.com/air/application/51.1"><id>regima.task228.glow</id>
<versionNumber>1.0.0</versionNumber><filename>Probe</filename><supportedProfiles>desktop</supportedProfiles>
<initialWindow><content>Probe.swf</content><visible>false</visible><width>940</width><height>590</height><renderMode>direct</renderMode></initialWindow></application>''')
    compile_args = ['java','-Dflexlib='+str(SDK/'frameworks'),'-jar',str(SDK/'lib/mxmlc-cli.jar'),
                    '+configname=air','-debug=true','-output=Probe.swf','Probe.as']
    result = subprocess.run(compile_args,cwd=WORK,capture_output=True,timeout=60)
    (WORK/'compile.log').write_bytes(result.stdout+result.stderr)
    assert result.returncode == 0, (result.stdout+result.stderr).decode(errors='replace')
    result = subprocess.run([str(SDK/'bin/adl.exe'),'-runtime',str(ROOT/'local-resources/regima/source/unpacked'),
                             '-profile','desktop',str(WORK/'application.xml'),str(WORK)],cwd=WORK,capture_output=True,timeout=60)
    output = (result.stdout+result.stderr).decode(errors='replace')
    (WORK/'output.log').write_text(output)
    assert result.returncode == 0 and 'COMPLETE' in output, output[-2000:]
    rows = [json.loads(line[6:]) for line in output.splitlines() if line.startswith('STATE ')]
    hits = [json.loads(line[4:]) for line in output.splitlines() if line.startswith('HIT ')]
    for row in rows:
        if 'path' in row: row['sha256'] = hashlib.sha256((WORK/row['path']).read_bytes()).hexdigest()
    report = dict(status='measured-not-promoted',rows=rows,hits=hits,methods=records,
                  bodySource=body_path.relative_to(ROOT).as_posix(),bodySourceSha256=hashlib.sha256(body_path.read_bytes()).hexdigest(),
                  hostOrder=['BaseObject.step fatherCount decrement/expiry','BaseAddEffect.step protection filter'],
                  scope='Original methods plus exact protection portions in source host order; other AI, combat and buff branches not executed. Verified source body pixels cropped with transparent margin for native filter rendering.')
    (WORK/'measurement.json').write_text(json.dumps(report,indent=2)+'\n')
    print('228 protection:',len(rows),'states;',len(hits),'hit-counter states')


if __name__ == '__main__':
    main()
