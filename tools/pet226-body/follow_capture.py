"""Original family AI/step/followSource branch and root warp observations.

BaseObject movement, turn/action effects and buff methods remain explicit sinks;
this does not establish floor collision, grounded movement or full Scene truth.
"""
import hashlib
import importlib.util
import json
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('source227', ROOT / 'tools/monkey-horse-source/run.py')
source = importlib.util.module_from_spec(spec)
spec.loader.exec_module(source)
WORK = ROOT / 'local-resources/regima/task-outputs/TASK-SLICE-226/follow-air'
source.WORK = WORK
records = source.prepare()
original = source.SRC / 'base/BasePet.as'
original_text = original.read_text(encoding='utf-8')
follow = source.method(original_text, 'followSource')
follow_range = re.search(r'protected var followRange:uint = ([\d.]+);', original_text)[1]
records.append(dict(path=original.relative_to(ROOT).as_posix(), method='followSource',
                    fileSha256=hashlib.sha256(original.read_bytes()).hexdigest(),
                    sliceSha256=hashlib.sha256(follow.encode()).hexdigest()))
base = (WORK / 'base/BasePet.as').read_text(encoding='utf-8')
assert "protected function followSource():void{events.push('follow-owner');}" in base
base = base.replace("protected function followSource():void{events.push('follow-owner');}", follow)
base = base.replace('public var attackRange:Number=150', f'public var followRange:Number={follow_range},attackRange:Number=150')
base = base.replace('public function ai():void', '''protected function turnLeft():void{events.push('turn-left');}
protected function turnRight():void{events.push('turn-right');}
public function ai():void''')
(WORK / 'base/BasePet.as').write_text(base, encoding='utf-8')
utils_path = source.SRC / 'AUtils.as'
utils_source = utils_path.read_text(encoding='utf-8')
distance = source.method(utils_source.replace('public static function', 'public function'), 'GetDisBetweenTwoObj')
distance = distance.replace('public function', 'public static function', 1)
records.append(dict(path=utils_path.relative_to(ROOT).as_posix(), method='GetDisBetweenTwoObj',
                    fileSha256=hashlib.sha256(utils_path.read_bytes()).hexdigest(),
                    sliceSha256=hashlib.sha256(distance.encode()).hexdigest()))
utils = (WORK / 'base/AUtils.as').read_text(encoding='utf-8')
old = 'public static function GetDisBetweenTwoObj(a:Object,b:Object):Number{return Math.sqrt((a.x-b.x)*(a.x-b.x)+(a.y-b.y)*(a.y-b.y));}'
assert old in utils
(WORK / 'base/AUtils.as').write_text(utils.replace(old, distance), encoding='utf-8')
probe = '''package {import flash.display.Sprite;import flash.desktop.NativeApplication;import base.*;
public class FollowProbe extends Sprite {public function FollowProbe(){
var classes:Array=[PetMonkey1,PetMonkey2,PetMonkey3,PetMonkey4,PetHorse1,PetHorse2,PetHorse3,PetHorse4];
var names:Array=['monkey1','monkey2','monkey3','monkey4','horse1','horse2','horse3','horse4'];
var gc:Config=Config.instance;var n:int=0;
for(var i:int=0;i<classes.length;i++)for each(var fps:int in [20,24,30])
for each(var d:Number in [0,639.95,640,640.05,950,999.95,1000,1000.05,1100])
for each(var sign:int in [-1,1])for each(var phase:int in [0,1,fps-1,59998])
for each(var target:Boolean in [false,true])for each(var action:String in ['wait','hit1','hit4','hurt']){
gc.frameClips=fps;gc.sid=1;gc.single=true;gc.obbsiteArray=[];gc.rolls=[0];gc.randomCalls=0;
var cls:Class=classes[i];var p:BasePet=new cls();p.x=d*sign;p.y=0;
p.sourceRole.x=0;p.sourceRole.y=0;p.timeCount=phase;p.curAction=action;
p.skillCD1=p.skillCD2=p.skillCD3=p.skillCD4=[0,24];
p.curAttackTarget=target?{x:p.x+700,y:0,isDead:function():Boolean{return false;}}:null;
var before:Object={x:p.x,y:p.y};p.step();
trace('CASE '+JSON.stringify({family:names[i],fps:fps,distance:d,sign:sign,phase:phase,target:target,
 action:action,before:before,after:{x:p.x,y:p.y,timeCount:p.timeCount},events:p.events}));n++;
}trace('COMPLETE '+n);NativeApplication.nativeApplication.exit();}}}'''
(WORK / 'FollowProbe.as').write_text(probe, encoding='utf-8')
(WORK / 'application.xml').write_text('<application xmlns="http://ns.adobe.com/air/application/51.1"><id>regima.task226.follow</id><versionNumber>1.0.0</versionNumber><filename>FollowProbe</filename><supportedProfiles>desktop</supportedProfiles><initialWindow><content>FollowProbe.swf</content><visible>false</visible><width>940</width><height>590</height></initialWindow></application>')
compile_command = ['java', '-Dflexlib=' + str(source.SDK / 'frameworks'), '-jar', str(source.SDK / 'lib/mxmlc-cli.jar'),
                   '+configname=air', '-debug=true', '-output=FollowProbe.swf', 'FollowProbe.as']
result = subprocess.run(compile_command, cwd=WORK, capture_output=True, timeout=60)
assert result.returncode == 0, (result.stdout + result.stderr).decode(errors='replace')
command = [str(source.SDK / 'bin/adl.exe'), '-runtime', str(ROOT / 'local-resources/regima/source/unpacked'),
           '-profile', 'desktop', str(WORK / 'application.xml'), str(WORK)]
result = subprocess.run(command, cwd=WORK, capture_output=True, timeout=60)
output = (result.stdout + result.stderr).decode(errors='replace')
cases = [json.loads(line[5:]) for line in output.splitlines() if line.startswith('CASE ')]
assert result.returncode == 0 and len(cases) == 13824 and 'COMPLETE 13824' in output, output[-3000:]
report = dict(status='observed-not-full-movement', scope=__doc__, sources=records,
              substitutions=['227 explicit sinks preserved except original followSource/root-distance restored',
                             'controlled family action/target/clock inputs', 'BaseObject step is event sink'],
              compileCommand=compile_command, command=command, cases=cases,
              generatedHashes={p.relative_to(WORK).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest()
                               for p in WORK.rglob('*.as')})
(ROOT / 'docs/tasks/evidence/TASK-SLICE-226/follow-native.json').write_text(
    json.dumps(report, separators=(',', ':')), encoding='utf-8')
print(f'{len(cases)} original family owner-follow/root-warp branch observations; movement remains a sink.')
