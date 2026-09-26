"""Execute the unchanged BasePet private-array loop in AVM2 with observable effect sinks."""
import hashlib
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[2]
SDK = Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')
work = ROOT/'local-resources/regima/task-outputs/TASK-SLICE-226/private-array-air'
work.mkdir(parents=True, exist_ok=True)
source_path = ROOT/'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/base/BasePet.as'
source = source_path.read_text(encoding='utf-8')
start = source.index('for each(_loc1_ in this.magicBulletArray)')
loop = source[start:source.index('if(this.tCount++', start)]
probe = '''package {import flash.display.Sprite;import flash.desktop.NativeApplication;import flash.system.Capabilities;
public class PrivateArrayProbe extends Sprite {
public var magicBulletArray:Array=[],events:Array=[];
public function PrivateArrayProbe(){
for each(var mode:String in ["append","append-and-destroy","append-two"]){
magicBulletArray=[];events=[];var self:PrivateArrayProbe=this;
var first:Object={isReadyToDestroy:false,step2:function():void{
self.events.push("first");self.magicBulletArray.push({isReadyToDestroy:false,step2:function():void{self.events.push("child");}});
if(mode=="append-two")self.magicBulletArray.push({isReadyToDestroy:false,step2:function():void{self.events.push("child2");}});
if(mode=="append-and-destroy")first.isReadyToDestroy=true;
}};
magicBulletArray.push(first,{isReadyToDestroy:false,step2:function():void{self.events.push("second");}});
var removed:Array=stepLoop();trace("CASE "+JSON.stringify({mode:mode,events:events,removed:removed.length}));
}
trace("ENV "+Capabilities.version);NativeApplication.nativeApplication.exit(0);
}
private function stepLoop():Array{var _loc1_:*;var _loc2_:Array=[];
''' + loop + '''return _loc2_;}}}'''
(work/'PrivateArrayProbe.as').write_text(probe, encoding='utf-8')
(work/'application.xml').write_text('''<application xmlns="http://ns.adobe.com/air/application/51.1"><id>regima.task226.privatearray</id><versionNumber>1.0.0</versionNumber><filename>PrivateArrayProbe</filename><supportedProfiles>desktop</supportedProfiles><initialWindow><content>PrivateArrayProbe.swf</content><visible>false</visible><width>940</width><height>590</height><renderMode>direct</renderMode></initialWindow></application>''')
args = ['java', '-Dflexlib='+str(SDK/'frameworks'), '-jar', str(SDK/'lib/mxmlc-cli.jar'), '+configname=air', '-debug=true', '-output=PrivateArrayProbe.swf', 'PrivateArrayProbe.as']
result = subprocess.run(args, cwd=work, capture_output=True, timeout=60)
assert result.returncode == 0, (result.stdout+result.stderr).decode(errors='replace')
command = [str(SDK/'bin/adl.exe'), '-runtime', str(ROOT/'local-resources/regima/source/unpacked'), '-profile', 'desktop', str(work/'application.xml'), str(work)]
result = subprocess.run(command, cwd=work, capture_output=True, timeout=30)
output = (result.stdout+result.stderr).decode(errors='replace')
assert result.returncode == 0, output
cases = [json.loads(line[5:]) for line in output.splitlines() if line.startswith('CASE ')]
assert len(cases) == 3
report = dict(status='measured-not-promoted', cases=cases, sourceSha256=hashlib.sha256(source_path.read_bytes()).hexdigest(),
    loopSha256=hashlib.sha256(loop.encode()).hexdigest(), probeSha256=hashlib.sha256(probe.encode()).hexdigest(),
    compiledSha256=hashlib.sha256((work/'PrivateArrayProbe.swf').read_bytes()).hexdigest(),
    environment=[line[4:] for line in output.splitlines() if line.startswith('ENV ')],
    scope='Unchanged BasePet for-each loop; effects are observable sinks. Tests append visitation and deferred cleanup only, not world collision.')
(work/'measurement.json').write_text(json.dumps(report, indent=2)+'\n', encoding='utf-8')
print(json.dumps(cases))
