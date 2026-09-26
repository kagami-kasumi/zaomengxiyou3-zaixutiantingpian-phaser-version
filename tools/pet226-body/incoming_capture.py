"""Original reduceHp + PetInfo arithmetic; controlled RNG/action/network sinks.

This isolates incoming branch selection, not body animation, movement or damage acceptance.
"""
import hashlib
import itertools
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts'
WORK = ROOT / 'local-resources/regima/task-outputs/TASK-SLICE-226/incoming-air'
SDK = Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')
WORK.mkdir(parents=True, exist_ok=True)
sources = []


def method(relative, name):
    path = SOURCE / relative
    source = path.read_text(encoding='utf-8')
    start = source.index('function ' + name + '(')
    brace = source.index('{', start)
    depth, end = 1, brace + 1
    while depth:
        depth += (source[end] == '{') - (source[end] == '}')
        end += 1
    value = 'public ' + source[start:end]
    sources.append(dict(path=path.relative_to(ROOT).as_posix(), method=name,
                        sha256=hashlib.sha256(path.read_bytes()).hexdigest(),
                        methodSha256=hashlib.sha256(value.encode()).hexdigest()))
    return value


harm = method('petInfo/PetInfo.as', 'getPetHarmObj')
reduce = method('base/BasePet.as', 'reduceHp').replace('Math.random()', 'controlledRandom()')
(WORK / 'Info.as').write_text('''package { public class Info {
 public var hp:Number=100, life:Number=100, form:Number=1, power:Number=1, learned:Boolean=true;
 public function getHp():Number{return hp;} public function setHp(v:Number):void{hp=v;}
 public function getlifetime():Number{return life;} public function setlifetime(v:Number):void{life=v;}
 public function findHasStudySkill(s:String):Boolean{return learned;}
 public function getCurPetState():Number{return form;} public function getwarpower():Number{return power;}
 public function getAtk():Number{return 0;} public function gettechnique():Number{return 0;}
 public function getSHp():Number{return 100;}
 HARM
}}'''.replace('HARM', harm), encoding='utf-8')
(WORK / 'Actor.as').write_text('''package { public class Actor {
 public var _petInfo:Info=new Info(), isGXP:Boolean=false, curAction:String="wait";
 public var roll:Number=0, reads:int=0, resets:int=0, normals:int=0;
 public var gc:Object={sid:1,frameClips:30,isSingleGame:function():Boolean{return true;},
   isInRoom:function():Boolean{return false;},getMutiUserBySidAndRoleId:function(a:*,b:*):*{return null;}};
 public var sourceRole:Object={sid:1,getRoleId:function():int{return 1;}};
 public var bbdc:Object;
 public function Actor(){bbdc={setFramePointX:function(v:int):void{resets++;}};}
 public function controlledRandom():Number{reads++;return roll;}
 public function showHpSlip():void{} public function drawPetHp():void{}
 public function addMonHurtMc(a:*,b:*):void{} public function setYourFather(a:*):void{}
 public function setAction(a:String):void{curAction=a;}
 public function normalHit():void{normals++;setAction("hit1");}
 REDUCE
}}'''.replace('REDUCE', reduce), encoding='utf-8')
fixtures = []
for form, learned, reactive, gxp, lethal, action, roll in itertools.product(
        range(1, 5), [False, True], [False, True], [False, True], [False, True],
        ['wait', 'hurt', 'hit1'], [0, 0.07, 0.5]):
    fixtures.append(dict(form=form, learned=learned, reactive=reactive, gxp=gxp,
                         lethal=lethal, action=action, roll=roll))
probe = '''package { import flash.display.Sprite; import flash.desktop.NativeApplication;
 public class IncomingProbe extends Sprite { public function IncomingProbe(){
 var fixtures:Array=FIXTURES;
 for each(var f:Object in fixtures){var a:Actor=new Actor();
 a._petInfo.form=f.form;a._petInfo.learned=f.learned;a.isGXP=f.gxp;
 a.curAction=f.action;a.roll=f.roll;a.reduceHp(f.lethal?100:1,f.reactive);
 f.result={action:a.curAction,hp:a._petInfo.hp,life:a._petInfo.life,reads:a.reads,
 resets:a.resets,normals:a.normals,chance:a._petInfo.getPetHarmObj("qlfj").first};
 trace("CASE "+JSON.stringify(f));}
 trace("COMPLETE "+fixtures.length);NativeApplication.nativeApplication.exit();
 }}}'''.replace('FIXTURES', json.dumps(fixtures, separators=(',', ':')))
(WORK / 'IncomingProbe.as').write_text(probe, encoding='utf-8')
(WORK / 'application.xml').write_text('<application xmlns="http://ns.adobe.com/air/application/51.1"><id>regima.task226.incoming</id><versionNumber>1.0.0</versionNumber><filename>IncomingProbe</filename><supportedProfiles>desktop</supportedProfiles><initialWindow><content>IncomingProbe.swf</content><visible>false</visible><width>940</width><height>590</height></initialWindow></application>')
compile_command = ['java', '-Dflexlib=' + str(SDK / 'frameworks'), '-jar', str(SDK / 'lib/mxmlc-cli.jar'),
                   '+configname=air', '-debug=true', '-output=IncomingProbe.swf', 'IncomingProbe.as']
result = subprocess.run(compile_command, cwd=WORK, capture_output=True, timeout=60)
assert result.returncode == 0, (result.stdout + result.stderr).decode(errors='replace')
command = [str(SDK / 'bin/adl.exe'), '-runtime', str(ROOT / 'local-resources/regima/source/unpacked'),
           '-profile', 'desktop', str(WORK / 'application.xml'), str(WORK)]
result = subprocess.run(command, cwd=WORK, capture_output=True, timeout=60)
output = (result.stdout + result.stderr).decode(errors='replace')
assert result.returncode == 0, output
cases = [json.loads(line[5:]) for line in output.splitlines() if line.startswith('CASE ')]
assert len(cases) == len(fixtures) and f'COMPLETE {len(fixtures)}' in output
report = dict(status='measured', sources=sources, compileCommand=compile_command, command=command,
              scope=__doc__, substitutions=['Math.random → controlledRandom', 'normalHit action sink',
              'UI/network/protection sinks; single game; Info stat inputs'], cases=cases,
              generatedHashes={p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in WORK.glob('*.as')})
destination = ROOT / 'docs/tasks/evidence/TASK-SLICE-226/incoming-native.json'
destination.write_text(json.dumps(report, separators=(',', ':')), encoding='utf-8')
print(f'{len(cases)} original incoming branch cases captured; explicit sinks, not full animation or world proof.')
