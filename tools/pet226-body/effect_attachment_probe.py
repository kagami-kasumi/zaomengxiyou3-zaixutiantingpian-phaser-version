"""Original show/hide methods: native attachment order and object replacement."""
import hashlib
import json
from pathlib import Path
import runpy
import subprocess

ROOT = Path(__file__).resolve().parents[2]
SRC = runpy.run_path(str(ROOT / 'tools/monkey-horse-source/run.py'))['SRC']
WORK = ROOT / 'local-resources/regima/task-outputs/TASK-SLICE-226/attachment-air'
SDK = Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')
WORK.mkdir(parents=True, exist_ok=True)
methods = []
def take(file, name):
    text = (SRC / file).read_text(encoding='utf-8')
    signature = text.index('function ' + name + '(')
    start = text.rfind('\n', 0, signature) + 1
    end = text.index('{', signature) + 1
    depth = 1
    while depth:
        if text[end] == '{': depth += 1
        elif text[end] == '}': depth -= 1
        end += 1
    code = text[start:end]
    methods.append(dict(file=file, method=name, sha256=hashlib.sha256(code.encode()).hexdigest()))
    return code
def write(name, text):
    (WORK / name).write_text(text, encoding='utf-8')
write('AUtils.as', 'package {import flash.utils.*;public class AUtils {' + take('AUtils.as', 'getNewObj') + '}}')
names = ['show_mpetmonkey_fire', 'hide_mpetmonkey_fire', 'show_pethorse_ice', 'hide_pethorse_ice']
write('Effects.as', 'package {public class Effects {public var sourceRole:*;public function Effects(s:*){sourceRole=s;}public function call(n:String):void{this[n]();}' + ''.join(take('base/BaseAddEffect.as', n) for n in names) + '}}')
write('Target.as', '''package {import flash.display.*;public class Target extends Sprite {public var colipse:Sprite=new Sprite();private var body:Object={stopFrame:function():void{},continueFrame:function():void{}};public function Target(){colipse.graphics.beginFill(0);colipse.graphics.drawRect(0,0,50,100);}public function getBBDC():Object{return body;}}}''')
write('BaseHero.as', 'package {public class BaseHero extends Target {public function setStatic():void{}public function getPlayer():Object{return null;}public function setLostKeyboard():void{}public function reSetLostKeyboard():void{}}}')
write('Probe.as', '''package {import flash.display.*;import flash.events.*;import flash.filesystem.*;import flash.system.*;import flash.utils.*;import flash.desktop.NativeApplication;
public class Probe extends Sprite {private var target:Target,effects:Effects,ids:Dictionary=new Dictionary(),serial:int=0;
public function Probe(){loaderInfo.uncaughtErrorEvents.addEventListener(UncaughtErrorEvent.UNCAUGHT_ERROR,function(e:UncaughtErrorEvent):void{trace("FAIL "+e.error);NativeApplication.nativeApplication.exit(1);});var fs:FileStream=new FileStream();fs.open(File.applicationDirectory.resolvePath("fixture.json"),FileMode.READ);var config:Object=JSON.parse(fs.readUTFBytes(fs.bytesAvailable));fs.close();var loader:Loader=new Loader();loader.contentLoaderInfo.addEventListener(Event.COMPLETE,function(e:Event):void{run();});fs.open(new File(config.source),FileMode.READ);var bytes:ByteArray=new ByteArray();fs.readBytes(bytes);fs.close();var context:LoaderContext=new LoaderContext(false,ApplicationDomain.currentDomain);context.allowCodeImport=true;loader.loadBytes(bytes,context);}
private function record(label:String):void{var children:Array=[];for(var i:int=0;i<target.numChildren;i++){var child:DisplayObject=target.getChildAt(i);if(!ids[child])ids[child]=++serial;children.push({name:child.name,id:ids[child]});}trace("ROW "+JSON.stringify({label:label,children:children}));}
private function run():void{for each(var order:Array in [["fire","ice"],["ice","fire"]]){target=new Target();addChild(target);effects=new Effects(target);var prefix:String=order.join("-");for each(var kind:String in order)effects.call(kind=="fire"?"show_mpetmonkey_fire":"show_pethorse_ice");record(prefix+"-initial");effects.call("show_mpetmonkey_fire");effects.call("show_pethorse_ice");record(prefix+"-repeat");effects.call("hide_mpetmonkey_fire");effects.call("show_mpetmonkey_fire");record(prefix+"-fire-readd");effects.call("hide_pethorse_ice");effects.call("show_pethorse_ice");record(prefix+"-ice-readd");removeChild(target);}trace("COMPLETE");NativeApplication.nativeApplication.exit(0);}}}''')
write('application.xml', '<application xmlns="http://ns.adobe.com/air/application/51.1"><id>regima.pet226.attachments</id><versionNumber>1.0.0</versionNumber><filename>Probe</filename><supportedProfiles>desktop</supportedProfiles><initialWindow><content>Probe.swf</content><visible>false</visible><width>940</width><height>590</height></initialWindow></application>')
result = subprocess.run(['java', '-Dflexlib=' + str(SDK / 'frameworks'), '-jar', str(SDK / 'lib/mxmlc-cli.jar'), '+configname=air', '-debug=true', '-output=Probe.swf', 'Probe.as'], cwd=WORK, capture_output=True, timeout=60)
log = (result.stdout + result.stderr).decode(errors='replace'); write('compile.log', log)
assert result.returncode == 0, log
source = ROOT / 'local-resources/regima/source/restored-swfs/assets/StageCommon.swf'
write('fixture.json', json.dumps(dict(source=str(source))))
result = subprocess.run([str(SDK / 'bin/adl.exe'), '-runtime', str(ROOT / 'local-resources/regima/source/unpacked'), '-profile', 'desktop', str(WORK / 'application.xml'), str(WORK)], cwd=WORK, capture_output=True, timeout=45)
log = (result.stdout + result.stderr).decode(errors='replace'); write('run.log', log)
assert result.returncode == 0 and 'COMPLETE' in log, (result.returncode, log)
rows = [json.loads(line[4:]) for line in log.splitlines() if line.startswith('ROW ')]
assert len(rows) == 8
for start in [0, 4]:
    initial, repeat, fire, ice = rows[start:start + 4]
    assert initial['children'] == repeat['children']
    assert [x['name'] for x in fire['children']] == ['PetHorseIceEffect', 'FireBuff']
    assert [x['name'] for x in ice['children']] == ['FireBuff', 'PetHorseIceEffect']
    assert fire['children'][1]['id'] not in [x['id'] for x in initial['children']]
    assert ice['children'][1]['id'] != fire['children'][0]['id']
report = dict(status='verified-bounded-native-attachments', methods=methods, sourceSha256=hashlib.sha256(source.read_bytes()).hexdigest(), rows=rows,
              limitations='Original four display methods, native restored symbols, controlled Target colipse/BBDC sink. No damage, full Scene or mixed-effect pixel comparison.')
(ROOT / 'docs/tasks/evidence/TASK-SLICE-226/attachment-native.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
print('8 native attachment states: insertion order, repeat identity, same-callback hide/re-add replacement verified.')
